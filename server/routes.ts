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

  // Generate dispute letter
  app.post("/api/disputes/generate-letter", async (req, res) => {
    try {
      const { issueId, bureau, issueType, description, creditor } = req.body;
      
      // Generate dispute letter content based on issue type
      let letterContent = "";
      
      switch (issueType) {
        case "COLLECTION":
          letterContent = `Dear ${bureau} Credit Bureau,

I am writing to formally dispute the following item on my credit report:

Creditor: ${creditor}
Description: ${description}

I believe this item is inaccurate for the following reasons:
- This debt does not belong to me
- The amount is incorrect
- This account has been paid in full
- This item is beyond the statute of limitations

I am requesting that you investigate this matter and remove this item from my credit report as it is negatively impacting my credit score.

Please provide me with written verification of this debt or remove it from my credit report within 30 days as required by the Fair Credit Reporting Act.

Sincerely,
[Your Name]
[Date]`;
          break;
          
        case "LATE_PAYMENT":
          letterContent = `Dear ${bureau} Credit Bureau,

I am writing to dispute the late payment reported by ${creditor} on my credit report.

Description: ${description}

I believe this late payment is inaccurate because:
- The payment was made on time
- There was a processing error by the creditor
- I was never notified of the late payment
- This was due to circumstances beyond my control

I request that you investigate this matter and remove this late payment from my credit report as it is unfairly impacting my credit score.

Please provide verification or remove this item within 30 days.

Sincerely,
[Your Name]
[Date]`;
          break;
          
        case "INQUIRY":
          letterContent = `Dear ${bureau} Credit Bureau,

I am disputing the following hard inquiry on my credit report:

Creditor: ${creditor}
Description: ${description}

I did not authorize this inquiry and believe it was made without my permission. Hard inquiries should only be made with my explicit consent.

Please investigate this unauthorized inquiry and remove it from my credit report immediately.

Sincerely,
[Your Name]
[Date]`;
          break;
          
        default:
          letterContent = `Dear ${bureau} Credit Bureau,

I am writing to dispute the following item on my credit report:

Creditor: ${creditor}
Description: ${description}

I believe this item is inaccurate and request that you investigate and remove it from my credit report.

Please provide verification or remove this item within 30 days as required by law.

Sincerely,
[Your Name]
[Date]`;
      }
      
      res.json({ letterContent });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate dispute letter" });
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

  const httpServer = createServer(app);
  return httpServer;
}
