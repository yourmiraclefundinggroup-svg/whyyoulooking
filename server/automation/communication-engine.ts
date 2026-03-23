/**
 * Communication Automation Engine
 * Handles all automated messaging triggers via Twilio (SMS) and SendGrid (email)
 */

import { db } from "../db";
import { commsLog, users } from "@shared/schema";
import { eq } from "drizzle-orm";

export const COMMUNICATION_TRIGGERS = {
  USER_SIGNED_UP: "user_signed_up",
  CREDIT_REPORT_UPLOADED: "credit_report_uploaded",
  SCORESHIFTING_COMPLETE: "scoreshifting_complete",
  DISPUTE_LETTER_SENT: "dispute_letter_sent",
  ITEM_REMOVED: "item_removed",
  LOAN_READY: "loan_ready",
  ROUND_COMPLETE: "round_complete",
  WHITE_LABEL_ACTIVATED: "white_label_activated",
  PLAN_ASSIGNED: "plan_assigned",
} as const;

const SMS_MESSAGES: Record<string, (data?: Record<string, any>) => string> = {
  user_signed_up: () =>
    "Welcome to ScoreShift! Your credit repair journey starts now. Log in to see your dashboard.",
  scoreshifting_complete: (d) =>
    `ScoreShift update: Your credit report has been analyzed. ${d?.issuesCreated ? `${d.issuesCreated} negative items found.` : "Review your dashboard for next steps."}`,
  dispute_letter_sent: (d) =>
    `Your dispute letter has been sent to ${d?.bureau || "the credit bureau"}. We'll update you when we hear back.`,
  item_removed: (d) =>
    `Great news! "${d?.itemName || "An item"}" has been removed from your credit report. Your score may improve soon.`,
  loan_ready: () =>
    "Congratulations! You've reached your loan-readiness target. Contact us to connect with lending partners.",
  round_complete: (d) =>
    `Round ${d?.round || ""} of disputes is complete! Check your dashboard for the next round.`,
  white_label_activated: (d) =>
    `Your ScoreShift white-label account for ${d?.brandName || "your brand"} is now active. Start adding clients!`,
  plan_assigned: (d) =>
    `Your ScoreShift plan has been updated to ${d?.plan || "a new plan"}. New features are now available.`,
};

const EMAIL_SUBJECTS: Record<string, string> = {
  user_signed_up: "Welcome to ScoreShift — Your Credit Repair Starts Now",
  scoreshifting_complete: "Your Credit Report Has Been Analyzed",
  dispute_letter_sent: "Dispute Letter Sent — We're Fighting for You",
  item_removed: "Item Removed from Your Credit Report!",
  loan_ready: "You're Loan-Ready — Congratulations!",
  round_complete: "Dispute Round Complete — Check Your Progress",
  white_label_activated: "Your White-Label Account Is Active",
  plan_assigned: "Your ScoreShift Plan Has Been Updated",
};

export async function triggerCommunication(
  trigger: string,
  userId: number,
  data?: Record<string, any>
): Promise<void> {
  try {
    // Look up user
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      console.warn(`[CommEngine] User ${userId} not found for trigger ${trigger}`);
      return;
    }

    // Send SMS if phone + opt-in
    if (user.phone && user.smsOptIn) {
      await sendSMS(trigger, user.phone, userId, data);
    }

    // Send email
    if (user.email) {
      await sendEmail(trigger, user.email, `${user.firstName} ${user.lastName}`, userId, data);
    }
  } catch (err) {
    console.error(`[CommEngine] Error triggering ${trigger} for user ${userId}:`, err);
  }
}

async function sendSMS(
  trigger: string,
  phone: string,
  userId: number,
  data?: Record<string, any>
): Promise<void> {
  const msgFn = SMS_MESSAGES[trigger];
  const message = msgFn ? msgFn(data) : `ScoreShift: Update regarding your account.`;

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      await logComm(userId, trigger, "sms", "skipped", message, "Twilio credentials not configured");
      return;
    }

    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: phone,
          Body: message,
        }).toString(),
      }
    );

    if (response.ok) {
      await logComm(userId, trigger, "sms", "sent", message);
    } else {
      const err = await response.text();
      await logComm(userId, trigger, "sms", "failed", message, err);
    }
  } catch (err: any) {
    await logComm(userId, trigger, "sms", "failed", message, err.message);
  }
}

async function sendEmail(
  trigger: string,
  email: string,
  name: string,
  userId: number,
  data?: Record<string, any>
): Promise<void> {
  const subject = EMAIL_SUBJECTS[trigger] || "ScoreShift Update";
  const msgFn = SMS_MESSAGES[trigger];
  const body = msgFn ? msgFn(data) : "You have an update on your ScoreShift account.";
  const htmlBody = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #0F172A;">${subject}</h2>
  <p>Hi ${name.split(" ")[0]},</p>
  <p>${body}</p>
  <p style="margin-top: 24px;"><a href="https://scoreshift.io/dashboard" style="background: #F59E0B; color: #0F172A; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">View Dashboard</a></p>
  <p style="color: #94A3B8; font-size: 12px; margin-top: 32px;">ScoreShift — Credit Repair Automation Platform</p>
</div>`;

  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || "noreply@scoreshift.io";

    if (!apiKey) {
      await logComm(userId, trigger, "email", "skipped", body, "SendGrid API key not configured");
      return;
    }

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email, name }] }],
        from: { email: fromEmail, name: "ScoreShift" },
        subject,
        content: [
          { type: "text/plain", value: body },
          { type: "text/html", value: htmlBody },
        ],
      }),
    });

    if (response.ok || response.status === 202) {
      await logComm(userId, trigger, "email", "sent", body);
    } else {
      const err = await response.text();
      await logComm(userId, trigger, "email", "failed", body, err);
    }
  } catch (err: any) {
    await logComm(userId, trigger, "email", "failed", body, err.message);
  }
}

async function logComm(
  userId: number,
  trigger: string,
  channel: string,
  status: string,
  message: string,
  error?: string
): Promise<void> {
  try {
    await db.insert(commsLog).values({
      userId,
      trigger,
      channel,
      status,
      message,
      error: error ?? null,
    });
  } catch (err) {
    console.error("[CommEngine] Failed to log communication:", err);
  }
}
