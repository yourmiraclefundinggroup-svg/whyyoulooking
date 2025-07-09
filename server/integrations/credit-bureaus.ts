// Credit Bureau Integration Service
// Supports multiple integration options based on research

export interface CreditBureauConnection {
  userId: number;
  provider: 'EXPERIAN' | 'EQUIFAX' | 'TRANSUNION' | 'CRS_API' | 'ISOFTPULL';
  isActive: boolean;
  lastSync: Date;
  credentials: {
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
    username?: string;
    password?: string; // Encrypted
  };
}

export interface CreditScore {
  score: number;
  scoreType: 'FICO_8' | 'VANTAGE_3' | 'VANTAGE_4' | 'FICO_9';
  bureau: 'EXPERIAN' | 'EQUIFAX' | 'TRANSUNION';
  asOfDate: Date;
  factors: string[];
}

export interface CreditReport {
  userId: number;
  bureau: 'EXPERIAN' | 'EQUIFAX' | 'TRANSUNION';
  reportData: any; // Raw credit report JSON
  score: CreditScore;
  accounts: CreditAccount[];
  inquiries: CreditInquiry[];
  publicRecords: PublicRecord[];
  alerts: CreditAlert[];
  lastUpdated: Date;
}

export interface CreditAccount {
  accountId: string;
  creditorName: string;
  accountType: 'CREDIT_CARD' | 'MORTGAGE' | 'AUTO_LOAN' | 'PERSONAL_LOAN' | 'STUDENT_LOAN';
  accountStatus: 'OPEN' | 'CLOSED' | 'CHARGED_OFF' | 'COLLECTION';
  creditLimit: number;
  currentBalance: number;
  paymentHistory: PaymentStatus[];
  dateOpened: Date;
  dateClosed?: Date;
  isDisputed: boolean;
}

export interface PaymentStatus {
  date: Date;
  status: 'CURRENT' | 'LATE_30' | 'LATE_60' | 'LATE_90' | 'LATE_120_PLUS';
}

export interface CreditInquiry {
  inquiryId: string;
  creditorName: string;
  inquiryType: 'HARD' | 'SOFT';
  inquiryDate: Date;
  purpose: string;
}

export interface PublicRecord {
  recordId: string;
  recordType: 'BANKRUPTCY' | 'TAX_LIEN' | 'JUDGMENT' | 'FORECLOSURE';
  filingDate: Date;
  amount?: number;
  status: 'ACTIVE' | 'SATISFIED' | 'DISMISSED';
  courthouse: string;
}

export interface CreditAlert {
  alertId: string;
  alertType: 'NEW_ACCOUNT' | 'INQUIRY' | 'ADDRESS_CHANGE' | 'BALANCE_CHANGE' | 'FRAUD_ALERT';
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  date: Date;
  isRead: boolean;
}

// Option 1: Direct Experian Integration
export class ExperianService {
  private baseUrl = process.env.EXPERIAN_API_URL || 'https://sandbox-us-api.experian.com';
  private clientId = process.env.EXPERIAN_CLIENT_ID || '1wUzh5bdGgmwf0GGrqOeYOikJZGJ9VsY';
  private clientSecret = process.env.EXPERIAN_CLIENT_SECRET || 'xPA7hf0c0UCn2n1V';

  async getAccessToken(): Promise<string> {
    try {
      // Try the standard OAuth 2.0 client credentials flow
      const authString = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await fetch(`${this.baseUrl}/oauth2/v1/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${authString}`,
          'Accept': 'application/json'
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Experian API error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error getting Experian access token:', error);
      throw new Error('Failed to authenticate with Experian');
    }
  }

  async getCreditReport(userId: number, consumerData: {
    firstName: string;
    lastName: string;
    ssn: string;
    dateOfBirth: string;
    address: {
      line1: string;
      city: string;
      state: string;
      zipCode: string;
    };
  }): Promise<CreditReport> {
    try {
      const accessToken = await this.getAccessToken();
      
      const requestBody = {
        consumerPii: {
          primaryApplicant: {
            name: {
              lastName: consumerData.lastName,
              firstName: consumerData.firstName
            },
            dob: {
              dob: consumerData.dateOfBirth
            },
            ssn: {
              ssn: consumerData.ssn
            },
            currentAddress: {
              line1: consumerData.address.line1,
              city: consumerData.address.city,
              state: consumerData.address.state,
              zipCode: consumerData.address.zipCode
            }
          }
        },
        requestor: {
          subscriberCode: this.clientId
        }
      };

      const response = await fetch(`${this.baseUrl}/consumerservices/credit-profile/v1/credit-report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reportData = await response.json();
      
      // Parse and structure the credit report
      return this.parseExperianReport(userId, reportData);
    } catch (error) {
      console.error('Error fetching Experian credit report:', error);
      throw new Error('Failed to fetch credit report from Experian');
    }
  }

  private parseExperianReport(userId: number, rawData: any): CreditReport {
    // Parse Experian's JSON response into our standard format
    // This is a simplified example - actual implementation would be much more complex
    return {
      userId,
      bureau: 'EXPERIAN',
      reportData: rawData,
      score: {
        score: rawData.creditScore?.riskScore || 0,
        scoreType: 'FICO_8',
        bureau: 'EXPERIAN',
        asOfDate: new Date(),
        factors: rawData.creditScore?.scoringFactors || []
      },
      accounts: [],
      inquiries: [],
      publicRecords: [],
      alerts: [],
      lastUpdated: new Date()
    };
  }
}

// Option 2: Multi-Bureau Integration via CRS Credit API
export class CRSCreditService {
  private apiKey = process.env.CRS_CREDIT_API_KEY;
  private baseUrl = 'https://api.crscreditapi.com';

  async getCreditReport(userId: number, bureaus: string[] = ['experian', 'equifax', 'transunion']) {
    try {
      const response = await fetch(`${this.baseUrl}/v1/credit-report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bureaus,
          consumer: {
            // Consumer identification data
          }
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Error fetching from CRS Credit API:', error);
      throw new Error('Failed to fetch credit report');
    }
  }
}

// Option 3: Integration via iSoftpull (Good for soft pulls and prequalification)
export class ISoftpullService {
  private apiKey = process.env.ISOFTPULL_API_KEY;
  private baseUrl = 'https://api.isoftpull.com';

  async softPullCredit(userId: number, purpose: string = 'PREQUALIFICATION') {
    try {
      const response = await fetch(`${this.baseUrl}/v1/soft-pull`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purpose,
          consumer: {
            // Consumer data for soft pull
          }
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Error performing soft pull:', error);
      throw new Error('Failed to perform soft credit pull');
    }
  }
}

// Factory pattern for different integration types
export class CreditBureauService {
  private experianService = new ExperianService();
  private crsService = new CRSCreditService();
  private isoftpullService = new ISoftpullService();

  async getCreditData(
    userId: number, 
    provider: 'EXPERIAN' | 'CRS_API' | 'ISOFTPULL',
    options: {
      softPullOnly?: boolean;
      bureaus?: string[];
      purpose?: string;
    } = {}
  ) {
    switch (provider) {
      case 'EXPERIAN':
        return await this.experianService.getCreditReport(userId, true);
      
      case 'CRS_API':
        return await this.crsService.getCreditReport(userId, options.bureaus);
      
      case 'ISOFTPULL':
        return await this.isoftpullService.softPullCredit(userId, options.purpose);
      
      default:
        throw new Error(`Unsupported credit bureau provider: ${provider}`);
    }
  }

  async startCreditMonitoring(userId: number, provider: string) {
    // Set up real-time credit monitoring
    // This would involve webhook setup with the chosen provider
    console.log(`Starting credit monitoring for user ${userId} with ${provider}`);
  }
}

export const creditBureauService = new CreditBureauService();