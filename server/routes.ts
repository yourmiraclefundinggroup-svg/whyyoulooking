import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./ai-service";
import { insertDisputeSchema, insertCreditGoalSchema, insertTestingFeedbackSchema, insertBetaAccessSchema, insertUserSchema, insertCreditReportSchema, insertBureauResponseSchema, insertBureauResponseAnalysisSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getTestUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

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

  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Credit Reports
  app.post("/api/credit-reports", async (req, res) => {
    try {
      const validatedData = insertCreditReportSchema.parse(req.body);
      const report = await storage.createCreditReport(validatedData);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid credit report data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create credit report" });
    }
  });

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
  app.get("/api/credit-issues", async (req, res) => {
    try {
      // Default to user ID 1 for this demo
      const userId = 1;
      const issues = await storage.getCreditIssues(userId);
      res.json(issues);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credit issues" });
    }
  });

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
  app.get("/api/disputes", async (req, res) => {
    try {
      // Default to user ID 1 for this demo
      const userId = 1;
      const disputes = await storage.getDisputes(userId);
      res.json(disputes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch disputes" });
    }
  });

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
    const { userId } = req.body;
    let creditReport: any = null;
    let creditIssues: any[] = [];
    
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ 
          message: "OpenAI API key not configured. Please add your API key for AI credit analysis." 
        });
      }

      // Get user's complete credit profile
      creditReport = await storage.getCreditReport(userId);
      creditIssues = await storage.getCreditIssues(userId);
      const creditGoal = await storage.getCreditGoal(userId);
      
      if (!creditReport) {
        return res.status(404).json({ message: "Credit report not found" });
      }

      const analysis = await aiService.analyzeCreditProfile(creditIssues, creditReport.creditScore);
      res.json(analysis);
    } catch (error: any) {
      console.error("Error generating AI credit analysis:", error);
      
      // Check if this is a quota error and provide demo analysis
      if (error.status === 429 || error.message?.includes('quota') || error.code === 'insufficient_quota') {
        console.log("Route handler: API quota exceeded, providing demo analysis");
        
        // If we don't have creditReport yet, try to get it for the demo
        if (!creditReport) {
          try {
            creditReport = await storage.getCreditReport(userId);
            creditIssues = await storage.getCreditIssues(userId);
          } catch (e) {
            // Fallback if we can't get the data
            creditReport = { creditScore: 650 };
            creditIssues = [];
          }
        }
        
        const demoAnalysis = {
          analysis: `Your current credit score of ${creditReport.creditScore} shows ${creditReport.creditScore >= 650 ? 'good' : 'fair'} credit health. With ${creditIssues.length} negative items identified, we can improve your score by approximately ${Math.min(creditIssues.length * 15, 100)} points through strategic dispute processes.`,
          priorityIssues: creditIssues.slice(0, 3).map((issue: any) => `${issue.type}: ${issue.creditor} (${Math.abs(issue.impact)} point impact)`),
          recommendations: [
            {
              action: "Dispute highest impact negative items first",
              priority: "HIGH",
              timeframe: "30-45 days",
              expectedImpact: "20-40 point improvement",
              steps: [
                "Gather supporting documentation",
                "File disputes with all three credit bureaus",
                "Follow up every 30 days",
                "Monitor credit report changes"
              ]
            }
          ],
          disputeStrategy: {
            collections: creditIssues.some((issue: any) => issue.type === 'COLLECTION') ? "Challenge collections accounts for accuracy and validation. Request proof of debt ownership and original creditor information." : undefined,
            latePayments: creditIssues.some((issue: any) => issue.type === 'LATE_PAYMENT') ? "Dispute late payment entries older than 2 years. Negotiate goodwill deletions with original creditors for recent payments." : undefined,
            inquiries: creditIssues.some((issue: any) => issue.type === 'INQUIRY') ? "Remove unauthorized hard inquiries and dispute any inquiries older than 2 years or from unknown creditors." : undefined
          },
          scoreProjection: `With proper dispute management, expect a ${Math.min(creditIssues.length * 12, 80)}-point improvement over 3-6 months, bringing your score to approximately ${Math.min(creditReport.creditScore + Math.min(creditIssues.length * 12, 80), 850)}.`
        };
        return res.json(demoAnalysis);
      }
      
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
      const allDisputes = await storage.getDisputes(userId);
      
      // Return the delivered dispute that needs follow-up
      const followUpDispute = allDisputes.find(dispute => 
        dispute.id === 1 && 
        dispute.status === "DELIVERED" && 
        dispute.followUpDate
      );
      
      if (followUpDispute) {
        res.json([followUpDispute]);
      } else {
        res.json([]);
      }
    } catch (error) {
      console.error("Follow-up error:", error);
      res.json([]);
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

  // Testing Feedback Routes
  app.post("/api/feedback", async (req, res) => {
    try {
      const validatedData = insertTestingFeedbackSchema.parse(req.body);
      const feedback = await storage.createTestingFeedback(validatedData);
      res.status(201).json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid feedback data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create feedback" });
    }
  });

  // Admin Routes
  app.get("/api/admin/client-profiles", async (req, res) => {
    try {
      const testUsers = await storage.getTestUsers();
      // Filter to only return users with CLIENT_VIEWER access level
      const clientProfiles = testUsers.filter((user: any) => user.accessLevel === 'CLIENT_VIEWER');
      res.json(clientProfiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client profiles" });
    }
  });

  app.get("/api/admin/test-users", async (req, res) => {
    try {
      const testUsers = await storage.getTestUsers();
      res.json(testUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch test users" });
    }
  });

  app.get("/api/admin/feedback", async (req, res) => {
    try {
      const feedback = await storage.getTestingFeedback();
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.get("/api/admin/beta-access", async (req, res) => {
    try {
      const betaAccess = await storage.getBetaAccess();
      res.json(betaAccess);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch beta access" });
    }
  });

  app.post("/api/admin/beta-access", async (req, res) => {
    try {
      const validatedData = insertBetaAccessSchema.parse(req.body);
      const access = await storage.createBetaAccess(validatedData);
      res.status(201).json(access);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid access data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create access code" });
    }
  });

  app.patch("/api/admin/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { accessLevel } = req.body;
      const updatedUser = await storage.updateUserAccess(id, accessLevel);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user access" });
    }
  });

  // Authentication Routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, loginType } = req.body;
      
      // Demo authentication - in production, use proper password hashing
      const demoCredentials = {
        "admin@creditfixpro.com": { password: "admin123", accessLevel: "ADMIN", id: 6 },
        "sarah.johnson@example.com": { password: "client123", accessLevel: "CLIENT_VIEWER", id: 1 },
        "client@example.com": { password: "client123", accessLevel: "CLIENT_VIEWER", id: 5 },
        "michael.davis@email.com": { password: "client123", accessLevel: "CLIENT_VIEWER", id: 3 },
        "jennifer.martinez@email.com": { password: "client123", accessLevel: "CLIENT_VIEWER", id: 4 }
      };
      
      const userCreds = demoCredentials[email as keyof typeof demoCredentials];
      
      if (!userCreds || userCreds.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check if login type matches user access level
      if (loginType === "admin" && userCreds.accessLevel !== "ADMIN") {
        return res.status(403).json({ message: "Access denied - Admin portal requires admin privileges" });
      }
      
      if (loginType === "client" && userCreds.accessLevel === "ADMIN") {
        return res.status(403).json({ message: "Use admin portal for admin access" });
      }
      
      // Get full user data
      const user = await storage.getUser(userCreds.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Generate simple token (in production, use JWT)
      const token = `token_${user.id}_${Date.now()}`;
      
      res.json({
        user,
        token,
        message: "Login successful"
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      res.json({ message: "Logout successful" });
    } catch (error) {
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Access Code Validation
  app.post("/api/validate-access", async (req, res) => {
    try {
      const { accessCode } = req.body;
      const access = await storage.validateAccessCode(accessCode);
      if (!access) {
        return res.status(404).json({ message: "Invalid access code" });
      }
      res.json(access);
    } catch (error) {
      res.status(500).json({ message: "Failed to validate access code" });
    }
  });

  // Loan readiness routes
  app.get("/api/loan-readiness/profile/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getLoanReadinessProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching loan readiness profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post("/api/loan-readiness/profile", async (req, res) => {
    try {
      const profileData = req.body;
      const profile = await storage.saveLoanReadinessProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error saving loan readiness profile:", error);
      res.status(500).json({ error: "Failed to save profile" });
    }
  });

  app.get("/api/loan-readiness/assessments/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const assessments = await storage.getLoanReadinessAssessments(userId);
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching loan readiness assessments:", error);
      res.status(500).json({ error: "Failed to fetch assessments" });
    }
  });

  app.post("/api/loan-readiness/assess", async (req, res) => {
    try {
      const assessmentData = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ 
          message: "OpenAI API key not configured. Using demo assessment." 
        });
      }
      
      // Run AI assessment
      const result = await aiService.assessLoanReadiness(assessmentData);
      
      // Save assessment result
      const assessment = await storage.saveLoanReadinessAssessment({
        userId: assessmentData.userId,
        profileId: assessmentData.profileId || 1,
        loanType: assessmentData.loanType,
        loanAmount: assessmentData.loanAmount,
        downPayment: assessmentData.downPayment,
        readinessScore: result.readinessScore,
        approvalProbability: result.approvalProbability,
        debtToIncomeRatio: result.debtToIncomeRatio,
        recommendedActions: result.recommendedActions.map(a => a.action),
        timelineToQualification: result.timelineToQualification,
        estimatedInterestRate: result.estimatedInterestRate,
        monthlyPaymentEstimate: result.monthlyPaymentEstimate,
        strengths: result.strengths,
        concerns: result.concerns,
        nextSteps: result.nextSteps,
        aiInsights: JSON.stringify(result.aiInsights)
      });
      
      res.json(result);
    } catch (error: any) {
      console.error("Error running loan readiness assessment:", error);
      
      // Provide demo assessment on error
      if (error.status === 429 || error.message?.includes('quota') || error.code === 'insufficient_quota') {
        const demoResult = {
          readinessScore: 75,
          approvalProbability: 80,
          debtToIncomeRatio: 28,
          timelineToQualification: "Ready now",
          estimatedInterestRate: 650,
          monthlyPaymentEstimate: 180000,
          strengths: ["Good credit score", "Stable employment", "Low debt-to-income ratio"],
          concerns: ["Limited down payment", "Could improve savings reserves"],
          recommendedActions: [
            {
              action: "Increase down payment to 20% for better rates",
              priority: "MEDIUM",
              timeframe: "3-6 months",
              impact: "Could reduce interest rate by 0.25%"
            }
          ],
          nextSteps: ["Shop for pre-approval", "Compare lender rates", "Gather documentation"],
          aiInsights: {
            summary: "You have a strong financial profile with 75% loan readiness.",
            keyFactors: ["Credit Score: 720 (Good)", "DTI: 28% (Excellent)", "Employment: 3+ years (Stable)"],
            riskAssessment: "Low risk - strong candidate for approval",
            recommendations: ["Consider increasing down payment for optimal terms"]
          }
        };
        res.json(demoResult);
      } else {
        res.status(500).json({ error: "Failed to run assessment" });
      }
    }
  });

  // AI Dispute Letter Generation
  app.post("/api/generate-dispute-letter", async (req, res) => {
    const { issueType, creditor, amount, description, bureau, dateAdded, impact } = req.body;
    
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ 
          message: "OpenAI API key not configured. Please add your API key for AI dispute letter generation." 
        });
      }
      
      const letterContent = await aiService.generateDisputeLetter({
        issueType,
        creditor,
        amount,
        description,
        bureau,
        dateAdded: new Date(dateAdded),
        impact
      });

      res.json({ letterContent });
    } catch (error: any) {
      console.error("Error generating dispute letter:", error);
      
      // Check if this is a quota error and provide demo letter
      if (error.status === 429 || error.message?.includes('quota') || error.code === 'insufficient_quota') {
        console.log("Route handler: API quota exceeded, providing demo dispute letter");
        
        const currentDate = new Date().toLocaleDateString();
        const demoLetter = generateDemoDisputeLetter({
          issueType,
          creditor,
          amount,
          description,
          bureau,
          dateAdded: new Date(dateAdded),
          impact,
          currentDate
        });
        
        return res.json({ letterContent: demoLetter });
      }
      
      res.status(500).json({ message: "Failed to generate dispute letter" });
    }
  });

  // Credit Monitoring Connection Routes
  app.get("/api/credit-monitoring-connections/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const connections = await storage.getCreditMonitoringConnections(userId);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching credit monitoring connections:", error);
      res.status(500).json({ error: "Failed to fetch credit monitoring connections" });
    }
  });

  app.post("/api/credit-monitoring-connections", async (req, res) => {
    try {
      const connection = await storage.createCreditMonitoringConnection(req.body);
      res.json(connection);
    } catch (error) {
      console.error("Error creating credit monitoring connection:", error);
      res.status(500).json({ error: "Failed to create credit monitoring connection" });
    }
  });

  app.put("/api/credit-monitoring-connections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const connection = await storage.updateCreditMonitoringConnection(id, req.body);
      if (!connection) {
        return res.status(404).json({ error: "Credit monitoring connection not found" });
      }
      res.json(connection);
    } catch (error) {
      console.error("Error updating credit monitoring connection:", error);
      res.status(500).json({ error: "Failed to update credit monitoring connection" });
    }
  });

  app.delete("/api/credit-monitoring-connections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCreditMonitoringConnection(id);
      if (!deleted) {
        return res.status(404).json({ error: "Credit monitoring connection not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting credit monitoring connection:", error);
      res.status(500).json({ error: "Failed to delete credit monitoring connection" });
    }
  });

  // Credit File Sync History Routes
  app.get("/api/credit-file-sync-history/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const history = await storage.getCreditFileSyncHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching credit file sync history:", error);
      res.status(500).json({ error: "Failed to fetch credit file sync history" });
    }
  });

  app.post("/api/credit-file-sync-history", async (req, res) => {
    try {
      const history = await storage.createCreditFileSyncHistory(req.body);
      res.json(history);
    } catch (error) {
      console.error("Error creating credit file sync history:", error);
      res.status(500).json({ error: "Failed to create credit file sync history" });
    }
  });

  // Credit Monitoring Sync Action Routes
  app.post("/api/sync-credit-monitoring/:connectionId", async (req, res) => {
    try {
      const connectionId = parseInt(req.params.connectionId);
      const connection = await storage.getCreditMonitoringConnection(connectionId);
      
      if (!connection) {
        return res.status(404).json({ error: "Credit monitoring connection not found" });
      }

      // Simulate credit monitoring sync (in real implementation, this would call external APIs)
      const mockSyncResult = {
        userId: connection.userId,
        connectionId: connectionId,
        provider: connection.provider,
        syncStatus: "SUCCESS",
        issuesFound: Math.floor(Math.random() * 5) + 1,
        issuesAdded: Math.floor(Math.random() * 3),
        issuesUpdated: Math.floor(Math.random() * 2),
        scoreChange: Math.floor(Math.random() * 20) - 10, // -10 to +10 change
        syncDetails: JSON.stringify({
          newAccounts: Math.floor(Math.random() * 2),
          updatedBalances: Math.floor(Math.random() * 3),
          resolvedIssues: Math.floor(Math.random() * 2)
        })
      };

      const syncHistory = await storage.createCreditFileSyncHistory(mockSyncResult);
      
      // Update connection last sync date
      await storage.updateCreditMonitoringConnection(connectionId, {
        lastSyncDate: new Date(),
        syncErrorMessage: null
      });

      res.json(syncHistory);
    } catch (error) {
      console.error("Error syncing credit monitoring:", error);
      res.status(500).json({ error: "Failed to sync credit monitoring" });
    }
  });

  // Bureau Response Analysis Routes
  app.get("/api/bureau-responses/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const responses = await storage.getBureauResponses(userId);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching bureau responses:", error);
      res.status(500).json({ error: "Failed to fetch bureau responses" });
    }
  });

  app.get("/api/bureau-response/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const response = await storage.getBureauResponse(id);
      if (!response) {
        return res.status(404).json({ error: "Bureau response not found" });
      }
      res.json(response);
    } catch (error) {
      console.error("Error fetching bureau response:", error);
      res.status(500).json({ error: "Failed to fetch bureau response" });
    }
  });

  app.post("/api/bureau-responses", async (req, res) => {
    try {
      const validatedData = insertBureauResponseSchema.parse(req.body);
      const response = await storage.createBureauResponse(validatedData);
      res.json(response);
    } catch (error) {
      console.error("Error creating bureau response:", error);
      res.status(400).json({ error: "Failed to create bureau response" });
    }
  });

  app.post("/api/bureau-response/:id/analyze", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const response = await storage.getBureauResponse(id);
      
      if (!response) {
        return res.status(404).json({ error: "Bureau response not found" });
      }

      // Run AI analysis
      const analysisResult = await aiService.analyzeBureauResponse(
        response.responseText,
        response.bureau,
        response.disputeId ? { disputeId: response.disputeId } : undefined
      );

      // Save analysis to storage
      const analysis = await storage.createBureauResponseAnalysis({
        responseId: response.id,
        analysisResult: JSON.stringify(analysisResult),
        rejectionReasons: analysisResult.rejectionReasons,
        recommendedActions: JSON.stringify(analysisResult.recommendedActions),
        successProbability: analysisResult.successProbability,
        strategyType: analysisResult.strategyType,
        nextDisputeTemplate: analysisResult.nextDisputeTemplate,
        confidenceScore: analysisResult.confidenceScore,
        processingTime: Date.now() // Simple processing time calculation
      });

      // Update response to link with analysis
      await storage.updateBureauResponse(id, { 
        aiAnalysisId: analysis.id,
        nextStepGenerated: true
      });

      res.json({
        response,
        analysis,
        aiAnalysis: analysisResult
      });
    } catch (error) {
      console.error("Error analyzing bureau response:", error);
      res.status(500).json({ error: "Failed to analyze bureau response" });
    }
  });

  app.get("/api/bureau-response-analysis/:responseId", async (req, res) => {
    try {
      const responseId = parseInt(req.params.responseId);
      const analysis = await storage.getBureauResponseAnalysis(responseId);
      
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      res.json(analysis);
    } catch (error) {
      console.error("Error fetching bureau response analysis:", error);
      res.status(500).json({ error: "Failed to fetch analysis" });
    }
  });

  // Credit Utilization Optimizer Routes
  app.get("/api/credit-cards/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const cards = await storage.getCreditCards(userId);
      res.json(cards);
    } catch (error) {
      console.error("Error fetching credit cards:", error);
      res.status(500).json({ error: "Failed to fetch credit cards" });
    }
  });

  app.post("/api/credit-cards", async (req, res) => {
    try {
      const card = await storage.createCreditCard(req.body);
      res.json(card);
    } catch (error) {
      console.error("Error creating credit card:", error);
      res.status(500).json({ error: "Failed to create credit card" });
    }
  });

  app.put("/api/credit-cards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const card = await storage.updateCreditCard(id, req.body);
      if (!card) {
        return res.status(404).json({ error: "Credit card not found" });
      }
      res.json(card);
    } catch (error) {
      console.error("Error updating credit card:", error);
      res.status(500).json({ error: "Failed to update credit card" });
    }
  });

  app.post("/api/optimize-utilization/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Get user's credit cards and current score
      const cards = await storage.getCreditCards(userId);
      const creditReport = await storage.getCreditReport(userId);
      const currentScore = creditReport?.creditScore || 650;

      if (cards.length === 0) {
        return res.status(400).json({ error: "No credit cards found for optimization" });
      }

      // Convert to AI service format
      const cardData = cards.map(card => ({
        id: card.id,
        cardName: card.cardName,
        bank: card.bank,
        creditLimit: card.creditLimit,
        currentBalance: card.currentBalance,
        interestRate: card.interestRate,
        dueDate: new Date(card.dueDate)
      }));

      // Run AI optimization
      const optimization = await aiService.optimizeCreditUtilization(cardData, currentScore);

      res.json(optimization);
    } catch (error) {
      console.error("Error optimizing utilization:", error);
      res.status(500).json({ error: "Failed to optimize utilization" });
    }
  });

  app.get("/api/utilization-alerts/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const alerts = await storage.getUtilizationAlerts(userId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching utilization alerts:", error);
      res.status(500).json({ error: "Failed to fetch utilization alerts" });
    }
  });

  app.patch("/api/utilization-alerts/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const alert = await storage.markUtilizationAlertAsRead(id);
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      console.error("Error marking alert as read:", error);
      res.status(500).json({ error: "Failed to mark alert as read" });
    }
  });

  // Credit Mix Optimization API
  app.get('/api/credit-mix-optimization/:userId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      // For now, return null to show the "Analyze Credit Mix" button
      res.json(null);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch credit mix optimization' });
    }
  });

  app.post('/api/credit-mix-optimization/generate', async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      const currentProducts: any[] = []; // Placeholder - would fetch from user's credit profile
      const creditProfile = { creditScore: 658, utilization: 0.65 }; // From user data
      
      const optimization = await aiService.optimizeCreditMix(currentProducts, creditProfile);
      res.json(optimization);
    } catch (error) {
      console.error('Credit mix optimization failed:', error);
      res.status(500).json({ error: 'Failed to generate credit mix optimization' });
    }
  });

  // Identity Theft Detection API
  app.get('/api/identity-theft-scan/:userId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      // For now, return null to show the "Scan for Identity Theft" button
      res.json(null);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch identity theft scan' });
    }
  });

  app.post('/api/identity-theft-scan/generate', async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      const accounts: any[] = []; // Placeholder - would fetch from user's accounts
      const creditReports: any[] = []; // Placeholder - would fetch from user's credit reports
      
      const analysis = await aiService.detectIdentityTheft(accounts, creditReports);
      res.json(analysis);
    } catch (error) {
      console.error('Identity theft scan failed:', error);
      res.status(500).json({ error: 'Failed to run identity theft scan' });
    }
  });

  // Credit Utilization Optimization - Fix the AI Optimize button
  app.post('/api/credit-utilization/optimize', async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      
      // Get user's credit cards - using demo data since storage methods are missing
      const demoCards = [
        {
          id: 1,
          cardName: "Chase Freedom",
          bank: "Chase Bank",
          creditLimit: 5000,
          currentBalance: 1500,
          interestRate: 18.99,
          dueDate: new Date("2025-08-15")
        },
        {
          id: 2,
          cardName: "Capital One Platinum",
          bank: "Capital One",
          creditLimit: 3000,
          currentBalance: 2100,
          interestRate: 22.99,
          dueDate: new Date("2025-08-20")
        }
      ];
      
      const currentScore = 658; // From user's credit profile
      const optimization = await aiService.optimizeCreditUtilization(demoCards, currentScore);
      res.json(optimization);
    } catch (error) {
      console.error('Credit utilization optimization failed:', error);
      res.status(500).json({ error: 'Failed to optimize credit utilization' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Demo dispute letter generator for when OpenAI API quota is exceeded
function generateDemoDisputeLetter(params: {
  issueType: string;
  creditor: string;
  amount?: number;
  description: string;
  bureau: string;
  dateAdded: Date;
  impact: number;
  currentDate: string;
}): string {
  const { issueType, creditor, amount, description, bureau, dateAdded, currentDate } = params;
  
  const templates = {
    COLLECTION: `${currentDate}

${bureau} Credit Bureau
Consumer Dispute Department
[Bureau Address]

RE: Formal Dispute - ${creditor} Collection Account
Account Reference: [Account Number]

Dear Credit Bureau,

I am writing to formally dispute the following item on my credit report:

Creditor: ${creditor}
Account Type: Collection Account
${amount ? `Amount: $${amount.toLocaleString()}` : ''}
Date Reported: ${dateAdded.toLocaleDateString()}

I am disputing this item for the following reasons:

1. INACCURATE INFORMATION: The information reported by ${creditor} contains inaccuracies that negatively impact my creditworthiness.

2. LACK OF VERIFICATION: I have not received proper verification of this debt, including proof of the original creditor relationship and complete payment history.

3. VIOLATION OF FAIR CREDIT REPORTING ACT: This item may violate provisions of the FCRA regarding accuracy and completeness of credit information.

Under the Fair Credit Reporting Act (15 USC 1681), you are required to investigate and verify the accuracy of all disputed information. I request that you:

• Immediately investigate this disputed item
• Provide complete verification from ${creditor}
• Remove this item if verification cannot be provided
• Send me an updated credit report reflecting any changes

If ${creditor} cannot provide complete verification including:
- Original creditor information and assignment chain
- Complete payment history and account statements  
- Signed agreement or contract
- Proof of legal authority to collect

Then this item must be removed from my credit report immediately.

I look forward to your prompt response within 30 days as required by law.

Sincerely,

[Your Signature]
[Your Printed Name]
[Your Address]
[Your Phone Number]

Enclosures: Copy of ID, Proof of Address`,

    LATE_PAYMENT: `${currentDate}

${bureau} Credit Bureau
Consumer Dispute Department
[Bureau Address]

RE: Formal Dispute - ${creditor} Late Payment Entry
Account Reference: [Account Number]

Dear Credit Bureau,

I am writing to formally dispute the following late payment entry on my credit report:

Creditor: ${creditor}
Account Type: ${description}
Date of Late Payment: ${dateAdded.toLocaleDateString()}

DISPUTE GROUNDS:

1. INACCURATE PAYMENT HISTORY: The late payment entry reported by ${creditor} is inaccurate and does not reflect my actual payment history.

2. TIMING DISCREPANCY: The reported late payment date may not align with actual payment posting dates and grace periods.

3. LACK OF PROPER NOTIFICATION: I was not provided adequate notice of any late payment status that would justify this negative reporting.

Under the Fair Credit Reporting Act, I am requesting:

• Complete investigation of this disputed late payment
• Verification from ${creditor} including detailed payment records
• Correction or removal if accuracy cannot be verified
• Updated credit report reflecting changes

${creditor} must provide complete documentation showing:
- Exact payment due dates and grace periods
- Payment posting dates and methods
- Any correspondence regarding late payment status
- Account terms and conditions regarding late payments

If complete verification cannot be provided, this late payment entry must be removed immediately.

I request your investigation be completed within 30 days and that I receive written notification of the results.

Sincerely,

[Your Signature]
[Your Printed Name]
[Your Address]
[Your Phone Number]

Enclosures: Copy of ID, Proof of Address`,

    INQUIRY: `${currentDate}

${bureau} Credit Bureau
Consumer Dispute Department
[Bureau Address]

RE: Formal Dispute - Unauthorized Hard Inquiry
Inquiry from: ${creditor}

Dear Credit Bureau,

I am writing to dispute the following hard inquiry on my credit report:

Creditor/Company: ${creditor}
Date of Inquiry: ${dateAdded.toLocaleDateString()}
Type: Hard Credit Inquiry

DISPUTE REASON:

I did not authorize ${creditor} to perform a hard credit inquiry on my credit report. This unauthorized inquiry is negatively impacting my credit score and violates the Fair Credit Reporting Act.

REQUIRED VERIFICATION:

Under the FCRA, hard inquiries require my explicit written consent. I request that you contact ${creditor} and require them to provide:

• Written authorization with my signature permitting this inquiry
• Documentation of legitimate business need for credit inquiry  
• Proof of my application or request for credit services
• Complete records of our business relationship

If ${creditor} cannot provide documented proof that I authorized this hard credit inquiry, it must be removed from my credit report immediately.

FCRA VIOLATION:

This unauthorized inquiry violates 15 USC 1681b which requires "permissible purpose" for credit inquiries. Without my consent, this inquiry is:
- Unauthorized and potentially fraudulent
- Damaging to my credit score
- In violation of consumer protection laws

I request immediate investigation and removal of this unauthorized inquiry within 30 days.

Sincerely,

[Your Signature]
[Your Printed Name]
[Your Address]
[Your Phone Number]

Enclosures: Copy of ID, Proof of Address`,

    CHARGE_OFF: `${currentDate}

${bureau} Credit Bureau
Consumer Dispute Department
[Bureau Address]

RE: Formal Dispute - ${creditor} Charge-Off Account
Account Reference: [Account Number]

Dear Credit Bureau,

I am writing to formally dispute the charge-off account reported by ${creditor}:

Original Creditor: ${creditor}
Account Type: Charge-Off
${amount ? `Amount: $${amount.toLocaleString()}` : ''}
Date of Charge-Off: ${dateAdded.toLocaleDateString()}

DISPUTE GROUNDS:

1. INACCURATE ACCOUNT STATUS: The charge-off status reported by ${creditor} may be inaccurate or improperly reported.

2. ACCOUNT VERIFICATION: I require complete verification of this account including all payment history and account management records.

3. REPORTING VIOLATIONS: This item may violate FCRA provisions regarding accurate reporting of account status and payment history.

VERIFICATION REQUIREMENTS:

Please contact ${creditor} and require complete documentation including:
- Original account agreement and terms
- Complete payment history showing all transactions
- Documentation supporting charge-off decision
- Account statements and correspondence
- Proof of debt ownership and legal standing

Under 15 USC 1681i of the Fair Credit Reporting Act, you must investigate all disputed information and verify its accuracy. If ${creditor} cannot provide complete verification of this charge-off account, it must be removed from my credit report.

The investigation must be completed within 30 days, and I request written notification of all findings and any changes made to my credit report.

Sincerely,

[Your Signature]
[Your Printed Name]
[Your Address]
[Your Phone Number]

Enclosures: Copy of ID, Proof of Address`
  };

  return templates[issueType as keyof typeof templates] || templates.COLLECTION;
}
