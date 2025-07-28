/**
 * USPS API Integration for Real-Time Tracking
 * Uses the new USPS APIs with OAuth 2.0 authentication
 * Supports certified mail tracking for dispute letters
 */

interface USPSTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: string;
  scope: string;
}

interface USPSTrackingEvent {
  event_time: string;
  event_date: string;
  event_city: string;
  event_state: string;
  event_zip_code: string;
  event_country: string;
  event_description: string;
  event_code: string;
}

interface USPSTrackingResponse {
  tracking_number: string;
  tracking_events: USPSTrackingEvent[];
  summary: {
    status: string;
    delivery_date?: string;
    delivery_time?: string;
    delivered_to?: string;
    signed_by?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

interface DisputeTrackingUpdate {
  disputeId: number;
  status: string;
  deliveryDate?: Date;
  trackingEvents: USPSTrackingEvent[];
  alertSent?: boolean;
  followUpDate?: Date;
}

export class USPSTrackingService {
  private baseUrl = 'https://apis.usps.com';
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.clientId = process.env.USPS_CLIENT_ID || '';
    this.clientSecret = process.env.USPS_CLIENT_SECRET || '';
    
    if (!this.clientId || !this.clientSecret) {
      console.warn('USPS API credentials not configured. Set USPS_CLIENT_ID and USPS_CLIENT_SECRET environment variables.');
    }
  }

  /**
   * Authenticate with USPS API using OAuth 2.0
   */
  private async authenticate(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('USPS API credentials not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/oauth2/v3/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials'
        })
      });

      if (!response.ok) {
        throw new Error(`USPS authentication failed: ${response.status} ${response.statusText}`);
      }

      const tokenData: USPSTokenResponse = await response.json();
      this.accessToken = tokenData.access_token;
      
      // Set token expiry (subtract 5 minutes for safety)
      const expiresInMs = (parseInt(tokenData.expires_in) - 300) * 1000;
      this.tokenExpiry = new Date(Date.now() + expiresInMs);

      console.log('USPS API authentication successful');
      return this.accessToken;
    } catch (error) {
      console.error('USPS authentication error:', error);
      throw new Error('Failed to authenticate with USPS API');
    }
  }

  /**
   * Track a certified mail package by tracking number
   */
  async trackPackage(trackingNumber: string): Promise<USPSTrackingResponse> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(
        `${this.baseUrl}/tracking/v3/tracking/${trackingNumber}?expand=summary`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Tracking number ${trackingNumber} not found`);
        }
        throw new Error(`USPS tracking failed: ${response.status} ${response.statusText}`);
      }

      const trackingData: USPSTrackingResponse = await response.json();
      
      // Validate tracking data
      if (!trackingData.tracking_number) {
        throw new Error('Invalid tracking response from USPS');
      }

      return trackingData;
    } catch (error) {
      console.error(`USPS tracking error for ${trackingNumber}:`, error);
      throw error;
    }
  }

  /**
   * Check if a package has been delivered
   */
  isDelivered(trackingData: USPSTrackingResponse): boolean {
    const deliveredStatuses = [
      'DELIVERED',
      'DELIVERED TO RECIPIENT',
      'DELIVERED TO AGENT',
      'DELIVERED TO PO BOX'
    ];
    
    return deliveredStatuses.some(status => 
      trackingData.summary?.status?.toUpperCase().includes(status)
    );
  }

  /**
   * Parse delivery date from tracking data
   */
  getDeliveryDate(trackingData: USPSTrackingResponse): Date | null {
    if (trackingData.summary?.delivery_date) {
      return new Date(trackingData.summary.delivery_date);
    }

    // Look for delivery event in tracking events
    const deliveryEvent = trackingData.tracking_events?.find(event =>
      event.event_description?.toUpperCase().includes('DELIVERED')
    );

    if (deliveryEvent) {
      return new Date(`${deliveryEvent.event_date} ${deliveryEvent.event_time || '00:00'}`);
    }

    return null;
  }

  /**
   * Calculate follow-up date (14 days after delivery)
   */
  calculateFollowUpDate(deliveryDate: Date): Date {
    const followUpDate = new Date(deliveryDate);
    followUpDate.setDate(followUpDate.getDate() + 14);
    return followUpDate;
  }

  /**
   * Update dispute status based on tracking information
   */
  async updateDisputeFromTracking(
    disputeId: number,
    trackingNumber: string
  ): Promise<DisputeTrackingUpdate> {
    try {
      const trackingData = await this.trackPackage(trackingNumber);
      const isDelivered = this.isDelivered(trackingData);
      const deliveryDate = this.getDeliveryDate(trackingData);

      let status = 'SENT';
      let followUpDate: Date | undefined;

      if (isDelivered && deliveryDate) {
        status = 'DELIVERED';
        followUpDate = this.calculateFollowUpDate(deliveryDate);
      }

      return {
        disputeId,
        status,
        deliveryDate: deliveryDate || undefined,
        trackingEvents: trackingData.tracking_events || [],
        followUpDate
      };
    } catch (error) {
      console.error(`Error updating dispute ${disputeId} from tracking:`, error);
      throw error;
    }
  }

  /**
   * Bulk update multiple disputes from their tracking numbers
   */
  async bulkUpdateDisputes(disputes: Array<{ id: number; uspsTrackingNumber: string }>): Promise<DisputeTrackingUpdate[]> {
    const updates: DisputeTrackingUpdate[] = [];
    
    for (const dispute of disputes) {
      if (dispute.uspsTrackingNumber) {
        try {
          const update = await this.updateDisputeFromTracking(dispute.id, dispute.uspsTrackingNumber);
          updates.push(update);
          
          // Add delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to update dispute ${dispute.id}:`, error);
        }
      }
    }
    
    return updates;
  }

  /**
   * Validate tracking number format (USPS certified mail)
   */
  isValidTrackingNumber(trackingNumber: string): boolean {
    // USPS certified mail tracking numbers are typically 22 digits
    // and often start with 9407 for certified mail
    const cleanNumber = trackingNumber.replace(/\s/g, '');
    
    // Check for USPS certified mail format
    const certifiedMailPattern = /^9407\d{18}$/;
    
    // Check for general USPS tracking format
    const generalPattern = /^\d{20,22}$/;
    
    return certifiedMailPattern.test(cleanNumber) || generalPattern.test(cleanNumber);
  }

  /**
   * Get formatted tracking status for display
   */
  getTrackingStatus(trackingData: USPSTrackingResponse): {
    status: string;
    description: string;
    isDelivered: boolean;
    deliveryDate?: string;
  } {
    const isDelivered = this.isDelivered(trackingData);
    const deliveryDate = this.getDeliveryDate(trackingData);
    
    let status = trackingData.summary?.status || 'IN TRANSIT';
    let description = 'Package is in transit';
    
    if (isDelivered) {
      status = 'DELIVERED';
      description = `Delivered${deliveryDate ? ` on ${deliveryDate.toLocaleDateString()}` : ''}`;
    } else {
      // Get latest tracking event for description
      const latestEvent = trackingData.tracking_events?.[0];
      if (latestEvent) {
        description = latestEvent.event_description;
      }
    }
    
    return {
      status,
      description,
      isDelivered,
      deliveryDate: deliveryDate?.toISOString()
    };
  }
}

// Export singleton instance
export const uspsTrackingService = new USPSTrackingService();