import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface DisputeIQParams {
  clientName: string;
  clientAddress: {
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
  creditor: string;
  accountNumber: string;
  accountType: "collection" | "late_payment" | "charge_off" | "inquiry" | "public_record" | "other";
  disputeReason: string;
  bureau: "EXPERIAN" | "EQUIFAX" | "TRANSUNION";
  roundNumber: number; // 1-5
  priorResponse?: string;
  clientState: string; // 2-letter state code
}

export async function generateDisputeIQLetter(params: DisputeIQParams): Promise<string> {
  // 1. Bureau addresses
  const bureauAddresses: Record<string, string> = {
    EXPERIAN: "P.O. Box 4500, Allen, TX 75013",
    EQUIFAX: "P.O. Box 740256, Atlanta, GA 30374",
    TRANSUNION: "P.O. Box 2000, Chester, PA 19016",
  };

  const bureauAddress = bureauAddresses[params.bureau];

  // 2. Today's date formatted as "Month DD, YYYY"
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });

  // 3. Round-specific instructions
  const roundInstructionsMap: Record<number, string> = {
    1: "Write a firm but professional dispute letter. Cite FCRA Section 611. Request investigation and deletion. Be assertive but polite. Explain why the item is inaccurate.",
    2: "Write an assertive escalation letter. Reference that Round 1 letter was sent and no adequate response was received. Demand method of verification per FCRA Section 611(a)(7). State you will file CFPB complaint if not resolved.",
    3: "Write an escalatory letter. Explicitly threaten a CFPB consumer complaint. Demand proof of permissible purpose. Cite FCRA 623 furnisher responsibility. Use firm, authoritative language.",
    4: "Write a formal debt validation demand under FDCPA 809(b). Give 30-day response requirement. State consequences of non-compliance. Include FCRA 611 and 623 citations. Be very direct and legal in tone.",
    5: "Write an attorney-ready demand letter. Reference potential litigation under FCRA 616/617 for willful/negligent non-compliance. State damages you are entitled to. This should read as a final warning before legal action.",
  };

  const roundInstructions = roundInstructionsMap[params.roundNumber] || roundInstructionsMap[1];

  // 4. State-specific law additions
  const stateLawMap: Record<string, string> = {
    CA: "California Civil Code Section 1785 (CCRA) also applies. California residents have additional rights including the right to receive a free copy of their credit report.",
    TX: "Texas Finance Code Chapter 392 provides additional consumer protections for Texas residents.",
    NY: "New York General Business Law Section 380 (Fair Credit Reporting Act of New York) provides additional protections.",
    FL: "Florida Consumer Collection Practices Act (FCCPA) provides additional state-level protections.",
    IL: "Illinois Consumer Fraud and Deceptive Business Practices Act applies.",
  };

  const stateLaw = stateLawMap[params.clientState.toUpperCase()] || "";

  // 5. Build the GPT-4o prompt
  const gptPrompt = `You are an expert consumer rights attorney specializing in FCRA dispute letters. Generate a complete, formal dispute letter with the following requirements:

CLIENT INFORMATION:
- Name: ${params.clientName}
- Address: ${params.clientAddress.line1}, ${params.clientAddress.city}, ${params.clientAddress.state} ${params.clientAddress.zip}

DISPUTE DETAILS:
- Creditor/Furnisher: ${params.creditor}
- Account Number: ${params.accountNumber} (last 4 digits for reference)
- Account Type: ${params.accountType}
- Dispute Reason: ${params.disputeReason}
- Bureau: ${params.bureau}
- Dispute Round: ${params.roundNumber} of 5

BUREAU ADDRESS:
${params.bureau} Credit Bureau
${bureauAddress}
Consumer Dispute Department

${params.priorResponse ? `PRIOR BUREAU RESPONSE: ${params.priorResponse}` : ""}

LETTER REQUIREMENTS:
${roundInstructions}

STATE-SPECIFIC LAW: ${stateLaw}

The letter MUST:
1. Start with proper date and address block
2. Include a clear RE: line identifying the account
3. Use unique, natural language - NOT a template. Vary sentence structure, vocabulary, argument order.
4. Include specific FCRA/FDCPA legal citations appropriate to round ${params.roundNumber}
5. Reference the specific creditor "${params.creditor}" and account type "${params.accountType}"
6. End with proper closing, signature lines, and "Enclosures: Copy of Government-Issued ID, Proof of Address"
7. Be 300-500 words
8. Sound like it was written by a real person with legal knowledge, not a form letter

Generate the complete letter now:`;

  // 6. Call GPT-4o to generate initial letter
  const gptResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: gptPrompt }],
    max_tokens: 1500,
    temperature: 0.8,
  });

  const gpt4oLetter = gptResponse.choices[0]?.message?.content || "";

  // 7. Call Claude to review and enhance for uniqueness
  const claudePrompt = `You are reviewing a credit dispute letter to ensure maximum uniqueness and effectiveness. The letter was generated by AI.

TASK: Rewrite 35-40% of the sentences to ensure complete uniqueness while maintaining all legal citations and the client's specific dispute details.

Rules:
- Keep all legal citations (FCRA sections, FDCPA sections) exactly as-is
- Keep all proper nouns (client name, creditor name, bureau name, account info)
- Keep the address blocks, RE: line, date, enclosures exactly as-is
- Rewrite the body paragraphs to use different vocabulary, restructured sentences, and varied argument presentation
- The final letter must sound completely authentic and human
- Do NOT change the tone or legal strategy appropriate to round ${params.roundNumber}

Original letter:
${gpt4oLetter}

Return ONLY the complete final letter, no commentary:`;

  const claudeResponse = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: claudePrompt }],
  });

  // 8. Return the Claude-enhanced letter
  const enhancedLetter =
    claudeResponse.content[0].type === "text"
      ? claudeResponse.content[0].text
      : gpt4oLetter;

  return enhancedLetter;
}
