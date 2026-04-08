/**
 * LOB.COM INTEGRATION — Automated Certified Mail for Dispute Letters
 *
 * Lob replaces manual USPS mailing entirely.
 * When a dispute letter is generated, call sendDisputeLetter() to:
 *   1. Print & mail it automatically via Lob
 *   2. Get a real USPS tracking number back immediately
 *   3. Store tracking # in dispute_letters_new table
 *
 * Pricing: ~$0.87/letter (First Class) or ~$4.50 (Certified w/ tracking)
 * Dashboard: https://dashboard.lob.com
 * Docs: https://docs.lob.com
 *
 * ENV: LOB_API_KEY — get from https://dashboard.lob.com/settings/api-keys
 *      Use TEST key (test_*) for dev, LIVE key (live_*) for production
 */



const LOB_API_BASE = "https://api.lob.com/v1";

// ScoreShift return address — update with real address
const SCORESHIFT_RETURN_ADDRESS = {
  name: "ScoreShift Capital",
  address_line1: "123 Financial Way",
  address_city: "Atlanta",
  address_state: "GA",
  address_zip: "30301",
  address_country: "US",
};

// Bureau mailing addresses (certified mail addresses)
export const BUREAU_ADDRESSES = {
  EXPERIAN: {
    name: "Experian",
    address_line1: "P.O. Box 4500",
    address_city: "Allen",
    address_state: "TX",
    address_zip: "75013",
    address_country: "US",
  },
  EQUIFAX: {
    name: "Equifax Information Services LLC",
    address_line1: "P.O. Box 740256",
    address_city: "Atlanta",
    address_state: "GA",
    address_zip: "30374",
    address_country: "US",
  },
  TRANSUNION: {
    name: "TransUnion LLC Consumer Dispute Center",
    address_line1: "P.O. Box 2000",
    address_city: "Chester",
    address_state: "PA",
    address_zip: "19016",
    address_country: "US",
  },
};

interface LobLetterResponse {
  id: string;
  tracking_number: string;
  url: string; // PDF preview URL
  expected_delivery_date: string;
  date_created: string;
  carrier: string;
  tracking_events: LobTrackingEvent[];
}

interface LobTrackingEvent {
  id: string;
  name: string; // "In Transit", "Delivered", etc.
  time: string;
  location: string;
  type: string;
}

interface SendLetterOptions {
  clientName: string;
  clientAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
  };
  bureau: "EXPERIAN" | "EQUIFAX" | "TRANSUNION";
  letterContent: string; // HTML or plain text letter body
  certified?: boolean; // true = certified mail w/ tracking ($4.50), false = first class ($0.87)
  returnReceipt?: boolean; // true = electronic return receipt (proof of delivery signature)
}

/**
 * Send a dispute letter via Lob certified mail
 * Returns tracking number + Lob letter ID for storage in DB
 */
export async function sendDisputeLetter(
  options: SendLetterOptions
): Promise<{
  lobId: string;
  trackingNumber: string;
  expectedDelivery: string;
  previewUrl: string;
}> {
  const apiKey = process.env.LOB_API_KEY;
  if (!apiKey) {
    throw new Error("LOB_API_KEY not set in environment variables");
  }

  const toAddress = BUREAU_ADDRESSES[options.bureau];
  if (!toAddress) {
    throw new Error(`Unknown bureau: ${options.bureau}`);
  }

  // Build extra_services array
  const extraServices: string[] = [];
  if (options.certified !== false) {
    extraServices.push("certified"); // default to certified
  }
  if (options.returnReceipt) {
    extraServices.push("certified_return_receipt");
  }

  // Wrap letter content in minimal HTML template
  const letterHtml = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.6; margin: 40px;">
      <p>${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
      <br/>
      ${options.letterContent
        .replace(/\n/g, "<br/>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}
      <br/><br/>
      <p>Sincerely,<br/>${options.clientName}</p>
    </body>
    </html>
  `;

  const payload = {
    description: `Dispute Letter — ${options.clientName} → ${options.bureau}`,
    to: toAddress,
    from: {
      ...SCORESHIFT_RETURN_ADDRESS,
      // Override return to client address for this letter
      name: options.clientName,
      address_line1: options.clientAddress.line1,
      address_line2: options.clientAddress.line2 || undefined,
      address_city: options.clientAddress.city,
      address_state: options.clientAddress.state,
      address_zip: options.clientAddress.zip,
    },
    file: letterHtml,
    color: false,
    double_sided: false,
    address_placement: "top_first_page",
    extra_services: extraServices.length > 0 ? extraServices : undefined,
    mail_type: "usps_first_class",
  };

  const credentials = Buffer.from(`${apiKey}:`).toString("base64");
  // Unique idempotency key per request — prevents Lob from deduplicating letters
  // that have the same from/to address and content sent close together
  const idempotencyKey = `${Date.now()}-${Math.random().toString(36).slice(2)}-${options.bureau}-${options.clientName.replace(/\s+/g, '_').slice(0, 30)}`;

  const response = await fetch(`${LOB_API_BASE}/letters`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Lob API error ${response.status}: ${err}`);
  }
  const data = await response.json() as LobLetterResponse;

  return {
    lobId: data.id,
    trackingNumber: data.tracking_number,
    expectedDelivery: data.expected_delivery_date,
    previewUrl: data.url,
  };
}

/**
 * Get current tracking status for a Lob letter
 */
export async function getLetterTracking(lobId: string): Promise<{
  status: string;
  events: LobTrackingEvent[];
  expectedDelivery: string;
}> {
  const apiKey = process.env.LOB_API_KEY;
  if (!apiKey) throw new Error("LOB_API_KEY not set");

  const credentials = Buffer.from(`${apiKey}:`).toString("base64");
  const response = await fetch(`${LOB_API_BASE}/letters/${lobId}`, {
    headers: { "Authorization": `Basic ${credentials}` },
  });
  if (!response.ok) throw new Error(`Lob tracking error ${response.status}`);
  const data = await response.json() as LobLetterResponse;
  const events = data.tracking_events || [];
  const latestEvent = events[0];

  return {
    status: latestEvent?.name || "Label Created",
    events,
    expectedDelivery: data.expected_delivery_date,
  };
}

/**
 * Verify an address before mailing (reduces undeliverable mail)
 */
export async function verifyAddress(address: {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}): Promise<{ valid: boolean; deliverability: string; corrected?: object }> {
  const apiKey = process.env.LOB_API_KEY;
  if (!apiKey) throw new Error("LOB_API_KEY not set");

  const credentials = Buffer.from(`${apiKey}:`).toString("base64");
  const response = await fetch(`${LOB_API_BASE}/us_verifications`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      primary_line: address.line1,
      secondary_line: address.line2 || "",
      city: address.city,
      state: address.state,
      zip_code: address.zip,
    }),
  });
  if (!response.ok) throw new Error(`Lob verify error ${response.status}`);
  const result = await response.json() as any;
  return {
    valid: result.deliverability === "deliverable",
    deliverability: result.deliverability,
    corrected: result.components,
  };
}
