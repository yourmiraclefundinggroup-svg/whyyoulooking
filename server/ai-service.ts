import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface DisputeLetterParams {
  issueType: string;
  creditor: string;
  amount?: number;
  description: string;
  bureau: string;
  dateAdded: Date;
  impact: number;
}

export interface AIAnalysisResult {
  analysis: string;
  priorityIssues: string[];
  recommendations: Array<{
    action: string;
    priority: string;
    timeframe: string;
    expectedImpact: string;
    steps: string[];
  }>;
  disputeStrategy: {
    collections?: string;
    latePayments?: string;
    inquiries?: string;
  };
  scoreProjection: string;
}

export interface CreditSimulationResult {
  currentScore: number;
  simulatedScore: number;
  totalImprovement: number;
  impacts: { action: string; impact: number }[];
}

export class AIService {
  async generateDisputeLetter(params: DisputeLetterParams): Promise<string> {
    try {
      const prompt = `Generate a professional credit dispute letter for the following issue:

Issue Type: ${params.issueType}
Creditor: ${params.creditor}
Amount: ${params.amount ? `$${params.amount}` : 'Not specified'}
Description: ${params.description}
Credit Bureau: ${params.bureau}
Date Added: ${params.dateAdded.toDateString()}
Credit Impact: ${params.impact} points

The letter should:
1. Be formal and professional
2. Reference applicable consumer protection laws (FCRA, FDCPA)
3. Request verification of the debt
4. Include specific dispute reasons
5. Request removal if unverified
6. Be addressed to ${params.bureau}

Format as a complete business letter with proper addressing and closing.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional credit repair specialist who writes effective dispute letters that comply with federal consumer protection laws."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      return response.choices[0].message.content || "Failed to generate dispute letter";
    } catch (error) {
      console.error("Error generating dispute letter:", error);
      throw new Error("Failed to generate dispute letter with AI");
    }
  }

  async analyzeCreditProfile(creditIssues: any[], currentScore: number): Promise<AIAnalysisResult> {
    try {
      const prompt = `Analyze this credit profile and provide comprehensive recommendations:

Current Credit Score: ${currentScore}
Credit Issues:
${creditIssues.map(issue => 
  `- ${issue.type}: ${issue.creditor} ($${issue.amount || 'Unknown'}) - Impact: ${issue.impact} points - Status: ${issue.status}`
).join('\n')}

Provide analysis in JSON format with these fields:
{
  "analysis": "Overall credit profile analysis (2-3 sentences)",
  "priorityIssues": ["list of top 3 issues to address first"],
  "recommendations": [
    {
      "action": "specific action to take",
      "priority": "HIGH/MEDIUM/LOW",
      "timeframe": "estimated timeframe",
      "expectedImpact": "expected point improvement",
      "steps": ["step 1", "step 2", "step 3"]
    }
  ],
  "disputeStrategy": {
    "collections": "strategy for collection accounts",
    "latePayments": "strategy for late payments",
    "inquiries": "strategy for inquiries"
  },
  "scoreProjection": "projected score improvement timeline"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert credit repair analyst. Provide actionable, realistic advice based on current credit repair best practices. Respond only with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500,
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result as AIAnalysisResult;
    } catch (error) {
      console.error("Error analyzing credit profile:", error);
      throw new Error("Failed to analyze credit profile with AI");
    }
  }

  async simulateCreditImprovement(actions: string[], currentScore: number): Promise<CreditSimulationResult> {
    try {
      const prompt = `Simulate credit score impact for these proposed actions:

Current Score: ${currentScore}
Proposed Actions: ${actions.join(', ')}

Calculate realistic point improvements for each action and total improvement.
Respond with JSON in this format:
{
  "currentScore": ${currentScore},
  "simulatedScore": number,
  "totalImprovement": number,
  "impacts": [
    {"action": "action name", "impact": number}
  ]
}

Base calculations on industry standards:
- Remove collection: 20-50 points
- Remove late payment: 10-30 points
- Remove inquiry: 2-5 points
- Increase credit limit: 5-15 points
- Pay down balances: 10-40 points`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a credit scoring expert. Provide realistic score improvement estimates based on FICO scoring models. Respond only with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
        temperature: 0.2
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result as CreditSimulationResult;
    } catch (error) {
      console.error("Error simulating credit improvement:", error);
      throw new Error("Failed to simulate credit improvement with AI");
    }
  }
}

export const aiService = new AIService();