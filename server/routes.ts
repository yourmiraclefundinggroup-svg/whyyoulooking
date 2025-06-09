import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDisputeSchema, insertCreditGoalSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Users
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Credit Reports
  app.get("/api/credit-reports/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const report = await storage.getCreditReport(userId);
      if (!report) {
        return res.status(404).json({ message: "Credit report not found" });
      }
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credit report" });
    }
  });

  // Credit Issues
  app.get("/api/credit-issues/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const issues = await storage.getCreditIssues(userId);
      res.json(issues);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credit issues" });
    }
  });

  app.patch("/api/credit-issues/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedIssue = await storage.updateCreditIssue(id, updates);
      if (!updatedIssue) {
        return res.status(404).json({ message: "Credit issue not found" });
      }
      res.json(updatedIssue);
    } catch (error) {
      res.status(500).json({ message: "Failed to update credit issue" });
    }
  });

  // Disputes
  app.get("/api/disputes/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const disputes = await storage.getDisputes(userId);
      res.json(disputes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch disputes" });
    }
  });

  app.post("/api/disputes", async (req, res) => {
    try {
      const validatedData = insertDisputeSchema.parse(req.body);
      const dispute = await storage.createDispute(validatedData);
      res.status(201).json(dispute);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid dispute data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create dispute" });
    }
  });

  app.patch("/api/disputes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedDispute = await storage.updateDispute(id, updates);
      if (!updatedDispute) {
        return res.status(404).json({ message: "Dispute not found" });
      }
      res.json(updatedDispute);
    } catch (error) {
      res.status(500).json({ message: "Failed to update dispute" });
    }
  });

  // Generate AI-powered personalized dispute letter
  // AI-powered credit letter templates
  app.post("/api/generate-credit-letter", async (req, res) => {
    try {
      const { letterType, userInfo, issueDetails } = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ 
          message: "OpenAI API key not configured. Please add your API key to generate personalized letters." 
        });
      }

      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      let prompt = "";
      
      switch (letterType) {
        case "goodwill":
          prompt = `Generate a professional goodwill letter for the following situation:
          
Creditor: ${issueDetails.creditor}
Issue: ${issueDetails.description}
User's situation: ${userInfo.situation || 'requesting goodwill consideration'}

Create a compelling goodwill letter that:
1. Takes responsibility for the issue
2. Explains circumstances that led to the problem
3. Demonstrates current financial responsibility
4. Requests removal as a gesture of goodwill
5. Maintains a respectful, professional tone

Format as a complete business letter ready to send.`;
          break;
          
        case "validation":
          prompt = `Generate a debt validation letter for:
          
Creditor: ${issueDetails.creditor}
Account: ${issueDetails.description}
Amount: ${issueDetails.amount || 'Unknown'}

Create a professional debt validation request that:
1. Requests proof of debt ownership
2. Asks for original creditor information
3. Demands account verification
4. Cites relevant consumer protection laws
5. Sets clear timeline for response

Format as a complete business letter ready to send.`;
          break;
          
        case "cease_and_desist":
          prompt = `Generate a cease and desist letter for:
          
Creditor: ${issueDetails.creditor}
Issue: Unwanted communication/harassment
User situation: ${userInfo.situation || 'requesting cessation of contact'}

Create a firm but professional cease and desist letter that:
1. Demands immediate cessation of all contact
2. Cites FDCPA violations if applicable
3. Threatens legal action if contact continues
4. Specifies acceptable forms of communication
5. Documents the harassment pattern

Format as a complete business letter ready to send.`;
          break;
          
        default:
          return res.status(400).json({ message: "Invalid letter type" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert credit repair specialist with extensive knowledge of consumer protection laws including FCRA, FDCPA, and TCPA. Generate professional, legally sound letters that protect consumer rights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const letterContent = response.choices[0].message.content;
      
      res.json({ letterContent });
    } catch (error) {
      console.error("Error generating credit letter:", error);
      res.status(500).json({ message: "Failed to generate credit letter" });
    }
  });

  app.post("/api/disputes/generate-letter", async (req, res) => {
    try {
      const { issueId, bureau, issueType, description, creditor, amount, dateAdded, impact } = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ 
          message: "OpenAI API key not configured. Please add your API key to generate personalized dispute letters." 
        });
      }

      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Create a detailed prompt for personalized dispute letter generation
      const prompt = `You are a professional credit repair specialist. Generate a personalized, professional dispute letter for the following credit issue:

Issue Type: ${issueType}
Creditor: ${creditor}
Description: ${description}
Amount: ${amount ? `$${amount}` : 'Not specified'}
Date Added: ${new Date(dateAdded).toLocaleDateString()}
Credit Score Impact: ${impact} points
Credit Bureau: ${bureau}

Generate a compelling, legally sound dispute letter that:
1. Follows FCRA (Fair Credit Reporting Act) guidelines
2. Uses specific language appropriate for ${issueType} disputes
3. Includes relevant consumer rights
4. Provides multiple dispute reasons that apply to this specific situation
5. Maintains a professional but firm tone
6. Includes proper legal citations where appropriate

The letter should be personalized based on the specific details provided and include strategic arguments that credit bureaus commonly accept for ${issueType} disputes.

Format the response as a complete business letter ready to send.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert credit repair specialist with extensive knowledge of FCRA laws and successful dispute strategies. Generate professional, personalized dispute letters that maximize the chance of successful removal."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const letterContent = response.choices[0].message.content;
      
      res.json({ letterContent });
    } catch (error) {
      console.error("Error generating AI dispute letter:", error);
      res.status(500).json({ message: "Failed to generate personalized dispute letter" });
    }
  });

  // Credit Goals
  app.get("/api/credit-goals/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const goal = await storage.getCreditGoal(userId);
      if (!goal) {
        return res.status(404).json({ message: "Credit goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credit goal" });
    }
  });

  app.post("/api/credit-goals", async (req, res) => {
    try {
      const validatedData = insertCreditGoalSchema.parse(req.body);
      const goal = await storage.createCreditGoal(validatedData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create credit goal" });
    }
  });

  app.patch("/api/credit-goals/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const updates = req.body;
      const updatedGoal = await storage.updateCreditGoal(userId, updates);
      if (!updatedGoal) {
        return res.status(404).json({ message: "Credit goal not found" });
      }
      res.json(updatedGoal);
    } catch (error) {
      res.status(500).json({ message: "Failed to update credit goal" });
    }
  });

  // Educational Content
  app.get("/api/educational-content", async (req, res) => {
    try {
      const category = req.query.category as string;
      let content;
      
      if (category) {
        content = await storage.getEducationalContentByCategory(category);
      } else {
        content = await storage.getEducationalContent();
      }
      
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch educational content" });
    }
  });

  // Credit Building Actions
  app.get("/api/credit-building-actions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const actions = await storage.getCreditBuildingActions(userId);
      res.json(actions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credit building actions" });
    }
  });

  app.patch("/api/credit-building-actions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedAction = await storage.updateCreditBuildingAction(id, updates);
      if (!updatedAction) {
        return res.status(404).json({ message: "Credit building action not found" });
      }
      res.json(updatedAction);
    } catch (error) {
      res.status(500).json({ message: "Failed to update credit building action" });
    }
  });

  // AI Credit Analysis
  app.post("/api/ai-credit-analysis", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ 
          message: "OpenAI API key not configured. Please add your API key for AI credit analysis." 
        });
      }

      // Get user's complete credit profile
      const creditReport = await storage.getCreditReport(userId);
      const creditIssues = await storage.getCreditIssues(userId);
      const creditGoal = await storage.getCreditGoal(userId);
      
      if (!creditReport) {
        return res.status(404).json({ message: "Credit report not found" });
      }

      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const analysisPrompt = `Analyze this complete credit profile and provide personalized recommendations:

Current Credit Score: ${creditReport.creditScore}
Credit Rating: ${creditReport.creditRating}
Utilization Rate: ${(creditReport.utilizationRate * 100).toFixed(1)}%
Account Age: ${creditReport.accountAge} months
Target Score: ${creditGoal?.targetScore || 'Not set'}

Credit Issues:
${creditIssues.map(issue => `- ${issue.type}: ${issue.description} (Impact: ${issue.impact} points, Creditor: ${issue.creditor}${issue.amount ? `, Amount: $${issue.amount}` : ''})`).join('\n')}

Provide a comprehensive analysis including:
1. Priority issues to address first
2. Specific dispute strategies for each negative item
3. Credit building recommendations
4. Timeline for improvement
5. Estimated score improvement potential

Respond in JSON format with the following structure:
{
  "analysis": "Overall credit profile analysis",
  "priorityIssues": ["issue1", "issue2"],
  "recommendations": [
    {
      "action": "specific action",
      "priority": "HIGH/MEDIUM/LOW",
      "timeframe": "timeline",
      "expectedImpact": "score points",
      "steps": ["step1", "step2"]
    }
  ],
  "disputeStrategy": {
    "collections": "strategy for collections",
    "latePayments": "strategy for late payments", 
    "inquiries": "strategy for inquiries"
  },
  "scoreProjection": "3-6 month outlook"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert credit repair specialist and financial advisor. Analyze credit profiles and provide actionable, legally compliant advice based on FCRA guidelines."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500,
        temperature: 0.3
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      
      res.json(analysis);
    } catch (error) {
      console.error("Error generating AI credit analysis:", error);
      res.status(500).json({ message: "Failed to generate AI credit analysis" });
    }
  });

  // Credit Score Simulation
  app.post("/api/simulate-credit-score", async (req, res) => {
    try {
      const { currentScore, actions } = req.body;
      
      let simulatedScore = currentScore;
      const impacts: { action: string; impact: number }[] = [];
      
      // Calculate potential score improvements based on actions
      if (actions.includes("payOffCollections")) {
        const impact = Math.floor(Math.random() * 16) + 35; // 35-50 points
        simulatedScore += impact;
        impacts.push({ action: "Pay off collections", impact });
      }
      
      if (actions.includes("lowerUtilization")) {
        const impact = Math.floor(Math.random() * 11) + 25; // 25-35 points
        simulatedScore += impact;
        impacts.push({ action: "Lower utilization to 10%", impact });
      }
      
      if (actions.includes("removeLatePays")) {
        const impact = Math.floor(Math.random() * 11) + 15; // 15-25 points
        simulatedScore += impact;
        impacts.push({ action: "Remove late payments", impact });
      }
      
      if (actions.includes("addSecuredCard")) {
        const impact = Math.floor(Math.random() * 11) + 20; // 20-30 points
        simulatedScore += impact;
        impacts.push({ action: "Add secured credit card", impact });
      }
      
      // Cap the maximum score at 850
      simulatedScore = Math.min(simulatedScore, 850);
      
      res.json({
        currentScore,
        simulatedScore,
        totalImprovement: simulatedScore - currentScore,
        impacts
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to simulate credit score" });
    }
  });

  // USPS Tracking Routes
  
  // Add USPS tracking number to dispute
  app.patch("/api/disputes/:id/tracking", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { trackingNumber } = req.body;
      
      if (!trackingNumber) {
        return res.status(400).json({ error: "Tracking number is required" });
      }
      
      const dispute = await storage.updateDispute(id, { 
        uspsTrackingNumber: trackingNumber,
        status: "SENT"
      });
      
      if (!dispute) {
        return res.status(404).json({ error: "Dispute not found" });
      }
      
      res.json(dispute);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update delivery status
  app.patch("/api/disputes/:id/delivery", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { deliveryDate } = req.body;
      
      if (!deliveryDate) {
        return res.status(400).json({ error: "Delivery date is required" });
      }
      
      const delivery = new Date(deliveryDate);
      const followUp = new Date(delivery);
      followUp.setDate(followUp.getDate() + 14); // Add 14 days
      
      const dispute = await storage.updateDispute(id, { 
        deliveryDate: delivery,
        followUpDate: followUp,
        status: "DELIVERED"
      });
      
      if (!dispute) {
        return res.status(404).json({ error: "Dispute not found" });
      }
      
      res.json(dispute);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get disputes requiring follow-up (14 days have passed)
  app.get("/api/disputes/follow-up", async (req, res) => {
    try {
      const userId = 1; // TODO: Get from auth
      const disputes = await storage.getDisputes(userId);
      
      // Simple filter for follow-up required disputes
      const now = new Date();
      const followUpRequired = [];
      
      for (const dispute of disputes) {
        if (dispute.followUpDate && 
            dispute.status === "DELIVERED" && 
            !dispute.alertSent &&
            new Date(dispute.followUpDate) <= now) {
          followUpRequired.push(dispute);
        }
      }
      
      res.json(followUpRequired);
    } catch (error: any) {
      console.error("Follow-up disputes error:", error);
      res.status(500).json({ message: "Failed to fetch disputes requiring follow-up" });
    }
  });

  // Mark follow-up alert as sent
  app.patch("/api/disputes/:id/alert-sent", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const dispute = await storage.updateDispute(id, { 
        alertSent: true,
        status: "FOLLOW_UP_REQUIRED"
      });
      
      if (!dispute) {
        return res.status(404).json({ error: "Dispute not found" });
      }
      
      res.json(dispute);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
