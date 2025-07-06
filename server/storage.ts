import { 
  users, creditReports, creditIssues, disputes, creditGoals, 
  educationalContent, creditBuildingActions, testingFeedback, betaAccess,
  creditMonitoringConnections, creditFileSyncHistory, bureauResponses, bureauResponseAnalysis,
  type User, type InsertUser,
  type CreditReport, type InsertCreditReport,
  type CreditIssue, type InsertCreditIssue,
  type Dispute, type InsertDispute,
  type CreditGoal, type InsertCreditGoal,
  type EducationalContent, type InsertEducationalContent,
  type CreditBuildingAction, type InsertCreditBuildingAction,
  type TestingFeedback, type InsertTestingFeedback,
  type BetaAccess, type InsertBetaAccess,
  type CreditMonitoringConnection, type InsertCreditMonitoringConnection,
  type CreditFileSyncHistory, type InsertCreditFileSyncHistory,
  type BureauResponse, type InsertBureauResponse,
  type BureauResponseAnalysis, type InsertBureauResponseAnalysis
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Credit Reports
  getCreditReport(userId: number): Promise<CreditReport | undefined>;
  createCreditReport(report: InsertCreditReport): Promise<CreditReport>;
  updateCreditReport(userId: number, updates: Partial<CreditReport>): Promise<CreditReport | undefined>;

  // Credit Issues
  getCreditIssues(userId: number): Promise<CreditIssue[]>;
  getCreditIssue(id: number): Promise<CreditIssue | undefined>;
  createCreditIssue(issue: InsertCreditIssue): Promise<CreditIssue>;
  updateCreditIssue(id: number, updates: Partial<CreditIssue>): Promise<CreditIssue | undefined>;

  // Disputes
  getDisputes(userId: number): Promise<Dispute[]>;
  getDispute(id: number): Promise<Dispute | undefined>;
  createDispute(dispute: InsertDispute): Promise<Dispute>;
  updateDispute(id: number, updates: Partial<Dispute>): Promise<Dispute | undefined>;

  // Credit Goals
  getCreditGoal(userId: number): Promise<CreditGoal | undefined>;
  createCreditGoal(goal: InsertCreditGoal): Promise<CreditGoal>;
  updateCreditGoal(userId: number, updates: Partial<CreditGoal>): Promise<CreditGoal | undefined>;

  // Educational Content
  getEducationalContent(): Promise<EducationalContent[]>;
  getEducationalContentByCategory(category: string): Promise<EducationalContent[]>;

  // Credit Building Actions
  getCreditBuildingActions(userId: number): Promise<CreditBuildingAction[]>;
  createCreditBuildingAction(action: InsertCreditBuildingAction): Promise<CreditBuildingAction>;
  updateCreditBuildingAction(id: number, updates: Partial<CreditBuildingAction>): Promise<CreditBuildingAction | undefined>;

  // Testing Feedback
  getTestingFeedback(): Promise<TestingFeedback[]>;
  createTestingFeedback(feedback: InsertTestingFeedback): Promise<TestingFeedback>;

  // Beta Access
  getBetaAccess(): Promise<BetaAccess[]>;
  createBetaAccess(access: InsertBetaAccess): Promise<BetaAccess>;
  validateAccessCode(code: string): Promise<BetaAccess | undefined>;

  // Admin Users
  getTestUsers(): Promise<User[]>;
  updateUserAccess(userId: number, accessLevel: string): Promise<User | undefined>;

  // Credit Monitoring Connections
  getCreditMonitoringConnections(userId: number): Promise<CreditMonitoringConnection[]>;
  getCreditMonitoringConnection(id: number): Promise<CreditMonitoringConnection | undefined>;
  createCreditMonitoringConnection(connection: InsertCreditMonitoringConnection): Promise<CreditMonitoringConnection>;
  updateCreditMonitoringConnection(id: number, updates: Partial<CreditMonitoringConnection>): Promise<CreditMonitoringConnection | undefined>;
  deleteCreditMonitoringConnection(id: number): Promise<boolean>;

  // Credit File Sync History
  getCreditFileSyncHistory(userId: number): Promise<CreditFileSyncHistory[]>;
  getCreditFileSyncHistoryByConnection(connectionId: number): Promise<CreditFileSyncHistory[]>;
  createCreditFileSyncHistory(history: InsertCreditFileSyncHistory): Promise<CreditFileSyncHistory>;

  // Bureau Response Analysis
  getBureauResponses(userId: number): Promise<BureauResponse[]>;
  getBureauResponse(id: number): Promise<BureauResponse | undefined>;
  createBureauResponse(response: InsertBureauResponse): Promise<BureauResponse>;
  updateBureauResponse(id: number, updates: Partial<BureauResponse>): Promise<BureauResponse | undefined>;
  getBureauResponseAnalysis(responseId: number): Promise<BureauResponseAnalysis | undefined>;
  createBureauResponseAnalysis(analysis: InsertBureauResponseAnalysis): Promise<BureauResponseAnalysis>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCreditReport(userId: number): Promise<CreditReport | undefined> {
    const [report] = await db.select().from(creditReports).where(eq(creditReports.userId, userId));
    return report || undefined;
  }

  async createCreditReport(insertReport: InsertCreditReport): Promise<CreditReport> {
    const [report] = await db
      .insert(creditReports)
      .values(insertReport)
      .returning();
    return report;
  }

  async updateCreditReport(userId: number, updates: Partial<CreditReport>): Promise<CreditReport | undefined> {
    const [updatedReport] = await db
      .update(creditReports)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(creditReports.userId, userId))
      .returning();
    return updatedReport || undefined;
  }

  async getCreditIssues(userId: number): Promise<CreditIssue[]> {
    return await db.select().from(creditIssues).where(eq(creditIssues.userId, userId));
  }

  async getCreditIssue(id: number): Promise<CreditIssue | undefined> {
    const [issue] = await db.select().from(creditIssues).where(eq(creditIssues.id, id));
    return issue || undefined;
  }

  async createCreditIssue(insertIssue: InsertCreditIssue): Promise<CreditIssue> {
    const [issue] = await db
      .insert(creditIssues)
      .values(insertIssue)
      .returning();
    return issue;
  }

  async updateCreditIssue(id: number, updates: Partial<CreditIssue>): Promise<CreditIssue | undefined> {
    const [updatedIssue] = await db
      .update(creditIssues)
      .set(updates)
      .where(eq(creditIssues.id, id))
      .returning();
    return updatedIssue || undefined;
  }

  async getDisputes(userId: number): Promise<Dispute[]> {
    return await db.select().from(disputes).where(eq(disputes.userId, userId));
  }

  async getDispute(id: number): Promise<Dispute | undefined> {
    const [dispute] = await db.select().from(disputes).where(eq(disputes.id, id));
    return dispute || undefined;
  }

  async createDispute(insertDispute: InsertDispute): Promise<Dispute> {
    const [dispute] = await db
      .insert(disputes)
      .values(insertDispute)
      .returning();
    return dispute;
  }

  async updateDispute(id: number, updates: Partial<Dispute>): Promise<Dispute | undefined> {
    const [updatedDispute] = await db
      .update(disputes)
      .set(updates)
      .where(eq(disputes.id, id))
      .returning();
    return updatedDispute || undefined;
  }

  async getCreditGoal(userId: number): Promise<CreditGoal | undefined> {
    const [goal] = await db.select().from(creditGoals).where(eq(creditGoals.userId, userId));
    return goal || undefined;
  }

  async createCreditGoal(insertGoal: InsertCreditGoal): Promise<CreditGoal> {
    const [goal] = await db
      .insert(creditGoals)
      .values(insertGoal)
      .returning();
    return goal;
  }

  async updateCreditGoal(userId: number, updates: Partial<CreditGoal>): Promise<CreditGoal | undefined> {
    const [updatedGoal] = await db
      .update(creditGoals)
      .set(updates)
      .where(eq(creditGoals.userId, userId))
      .returning();
    return updatedGoal || undefined;
  }

  async getEducationalContent(): Promise<EducationalContent[]> {
    return await db.select().from(educationalContent);
  }

  async getEducationalContentByCategory(category: string): Promise<EducationalContent[]> {
    return await db.select().from(educationalContent).where(eq(educationalContent.category, category));
  }

  async getCreditBuildingActions(userId: number): Promise<CreditBuildingAction[]> {
    return await db.select().from(creditBuildingActions).where(eq(creditBuildingActions.userId, userId));
  }

  async createCreditBuildingAction(insertAction: InsertCreditBuildingAction): Promise<CreditBuildingAction> {
    const [action] = await db
      .insert(creditBuildingActions)
      .values(insertAction)
      .returning();
    return action;
  }

  async updateCreditBuildingAction(id: number, updates: Partial<CreditBuildingAction>): Promise<CreditBuildingAction | undefined> {
    const [updatedAction] = await db
      .update(creditBuildingActions)
      .set(updates)
      .where(eq(creditBuildingActions.id, id))
      .returning();
    return updatedAction || undefined;
  }

  async getTestingFeedback(): Promise<TestingFeedback[]> {
    return await db.select().from(testingFeedback).orderBy(testingFeedback.createdAt);
  }

  async createTestingFeedback(insertFeedback: InsertTestingFeedback): Promise<TestingFeedback> {
    const [feedback] = await db
      .insert(testingFeedback)
      .values(insertFeedback)
      .returning();
    return feedback;
  }

  async getBetaAccess(): Promise<BetaAccess[]> {
    return await db.select().from(betaAccess).orderBy(betaAccess.createdAt);
  }

  async createBetaAccess(insertAccess: InsertBetaAccess): Promise<BetaAccess> {
    const [access] = await db
      .insert(betaAccess)
      .values(insertAccess)
      .returning();
    return access;
  }

  async validateAccessCode(code: string): Promise<BetaAccess | undefined> {
    const [access] = await db.select().from(betaAccess).where(eq(betaAccess.accessCode, code));
    return access || undefined;
  }

  async getTestUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isTestUser, true));
  }

  async updateUserAccess(userId: number, accessLevel: string): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ accessLevel })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser || undefined;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private creditReports: Map<number, CreditReport> = new Map();
  private creditIssues: Map<number, CreditIssue> = new Map();
  private disputes: Map<number, Dispute> = new Map();
  private creditGoals: Map<number, CreditGoal> = new Map();
  private educationalContent: Map<number, EducationalContent> = new Map();
  private creditBuildingActions: Map<number, CreditBuildingAction> = new Map();
  private testingFeedback: Map<number, TestingFeedback> = new Map();
  private betaAccess: Map<number, BetaAccess> = new Map();
  private creditMonitoringConnections: Map<number, CreditMonitoringConnection> = new Map();
  private creditFileSyncHistory: Map<number, CreditFileSyncHistory> = new Map();
  private bureauResponses: Map<number, BureauResponse> = new Map();
  private bureauResponseAnalysis: Map<number, BureauResponseAnalysis> = new Map();
  private currentId: number = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create admin user
    const adminUser: User = {
      id: 1,
      firstName: "Admin",
      lastName: "User",
      email: "admin@creditfixpro.com",
      accessLevel: "ADMIN",
      isTestUser: false,
      testingNotes: null,
      createdAt: new Date()
    };
    this.users.set(1, adminUser);

    // Create demo client users
    const clientUser1: User = {
      id: 2,
      firstName: "Sarah",
      lastName: "Johnson",
      email: "client@example.com",
      accessLevel: "CLIENT_VIEWER",
      isTestUser: false,
      testingNotes: "Demo client account for testing client portal",
      createdAt: new Date()
    };
    this.users.set(2, clientUser1);

    const clientUser2: User = {
      id: 3,
      firstName: "Michael",
      lastName: "Davis",
      email: "michael.davis@email.com",
      accessLevel: "CLIENT_VIEWER",
      isTestUser: false,
      testingNotes: "Second demo client - different credit situation",
      createdAt: new Date()
    };
    this.users.set(3, clientUser2);

    const clientUser3: User = {
      id: 4,
      firstName: "Jennifer",
      lastName: "Martinez",
      email: "jennifer.martinez@email.com",
      accessLevel: "CLIENT_VIEWER",
      isTestUser: false,
      testingNotes: "Third demo client - high score client",
      createdAt: new Date()
    };
    this.users.set(4, clientUser3);
    
    this.currentId = 5;

    // Create separate credit reports for each client
    
    // Sarah Johnson (ID 2) - Fair credit with collections
    const creditReport1: CreditReport = {
      id: 1,
      userId: 2,
      creditScore: 658,
      creditRating: "FAIR",
      lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      utilizationRate: 0.65,
      accountAge: 18
    };
    this.creditReports.set(1, creditReport1);

    // Michael Davis (ID 3) - Poor credit with multiple issues
    const creditReport2: CreditReport = {
      id: 2,
      userId: 3,
      creditScore: 542,
      creditRating: "POOR",
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      utilizationRate: 0.89,
      accountAge: 8
    };
    this.creditReports.set(2, creditReport2);

    // Jennifer Martinez (ID 4) - Good credit, minor optimization needed
    const creditReport3: CreditReport = {
      id: 3,
      userId: 4,
      creditScore: 734,
      creditRating: "GOOD",
      lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      utilizationRate: 0.23,
      accountAge: 25
    };
    this.creditReports.set(3, creditReport3);

    // Create credit issues for each client
    const issues: CreditIssue[] = [
      // Sarah Johnson (ID 2) issues
      {
        id: 1,
        userId: 2,
        type: "COLLECTION",
        title: "Medical Collection",
        description: "Medical collection from ABC Medical Center - $1,247",
        amount: 1247,
        impact: -45,
        dateAdded: new Date("2023-03-15"),
        status: "ACTIVE",
        creditor: "ABC Medical Center"
      },
      {
        id: 2,
        userId: 2,
        type: "LATE_PAYMENT",
        title: "Late Payment",
        description: "Chase Credit Card - 30 days late payment",
        amount: null,
        impact: -15,
        dateAdded: new Date("2024-01-15"),
        status: "ACTIVE",
        creditor: "Chase Bank"
      },
      // Michael Davis (ID 3) issues - more severe
      {
        id: 3,
        userId: 3,
        type: "COLLECTION",
        title: "Credit Card Collection",
        description: "Capital One charge-off collection - $3,892",
        amount: 3892,
        impact: -78,
        dateAdded: new Date("2022-08-20"),
        status: "ACTIVE",
        creditor: "Capital One"
      },
      {
        id: 4,
        userId: 3,
        type: "COLLECTION",
        title: "Utility Collection",
        description: "Electric utility collection - $456",
        amount: 456,
        impact: -35,
        dateAdded: new Date("2023-11-05"),
        status: "ACTIVE",
        creditor: "City Electric Co"
      },
      {
        id: 5,
        userId: 3,
        type: "LATE_PAYMENT",
        title: "Multiple Late Payments",
        description: "Bank of America - 90+ days late",
        amount: null,
        impact: -65,
        dateAdded: new Date("2023-06-10"),
        status: "ACTIVE",
        creditor: "Bank of America"
      },
      // Jennifer Martinez (ID 4) issues - minor
      {
        id: 6,
        userId: 4,
        type: "INQUIRY",
        title: "Hard Inquiry",
        description: "Auto loan inquiry from Wells Fargo",
        amount: null,
        impact: -5,
        dateAdded: new Date("2023-12-10"),
        status: "ACTIVE",
        creditor: "Wells Fargo"
      }
    ];
    issues.forEach(issue => this.creditIssues.set(issue.id, issue));

    // Create sample disputes with USPS tracking data
    const disputesData: Dispute[] = [
      {
        id: 1,
        userId: 2, // Sarah Johnson
        issueId: 1,
        bureau: "EQUIFAX",
        status: "PENDING",
        dateSent: new Date("2024-12-20"),
        expectedResponse: new Date("2025-01-19"),
        actualResponse: null,
        letterContent: "Dispute letter for ABC Medical Center collection account...",
        uspsTrackingNumber: "9400109699937865678123",
        deliveryDate: new Date("2024-12-23"),
        followUpDate: new Date("2025-01-06"),
        alertSent: false
      },
      {
        id: 2,
        userId: 2, // Sarah Johnson  
        issueId: 2,
        bureau: "EXPERIAN",
        status: "SENT",
        dateSent: new Date("2024-12-18"),
        expectedResponse: new Date("2024-01-17"),
        actualResponse: null,
        letterContent: "Dispute letter for Chase Bank late payment...",
        uspsTrackingNumber: "9400109699937865678124",
        deliveryDate: null,
        followUpDate: null,
        alertSent: false
      },
      {
        id: 3,
        userId: 3, // Michael Thompson
        issueId: 3,
        bureau: "TRANSUNION",
        status: "PENDING", 
        dateSent: new Date("2024-12-10"),
        expectedResponse: new Date("2025-01-09"),
        actualResponse: null,
        letterContent: "Dispute letter for Capital One charge-off...",
        uspsTrackingNumber: "9400109699937865678125",
        deliveryDate: new Date("2024-12-13"),
        followUpDate: new Date("2024-12-27"),
        alertSent: true
      }
    ];
    disputesData.forEach(dispute => this.disputes.set(dispute.id, dispute));

    // Create sample credit goal
    const creditGoal: CreditGoal = {
      id: 1,
      userId: 1,
      targetScore: 720,
      currentScore: 658,
      targetDate: new Date("2024-12-31"),
      createdAt: new Date()
    };
    this.creditGoals.set(1, creditGoal);

    // Create educational content
    const educationalContentData: EducationalContent[] = [
      {
        id: 1,
        title: "Understanding Credit Scores",
        description: "Learn the factors that impact your credit score",
        content: "Credit scores are calculated based on five main factors...",
        category: "CREDIT_SCORES",
        imageUrl: "https://images.unsplash.com/photo-1559526324-593bc073d938?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=150",
        readTime: 5
      },
      {
        id: 2,
        title: "Dispute Process Guide",
        description: "Step-by-step dispute filing instructions",
        content: "The dispute process involves several steps...",
        category: "DISPUTE_PROCESS",
        imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=150",
        readTime: 8
      },
      {
        id: 3,
        title: "Building Credit Fast",
        description: "Proven strategies to improve your score quickly",
        content: "There are several proven strategies to build credit...",
        category: "CREDIT_BUILDING",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=150",
        readTime: 6
      }
    ];
    educationalContentData.forEach(content => this.educationalContent.set(content.id, content));

    // Create credit building actions
    const buildingActions: CreditBuildingAction[] = [
      {
        id: 1,
        userId: 1,
        type: "SECURED_CARD",
        title: "Secured Credit Card",
        description: "Apply for a secured credit card to establish positive payment history",
        potentialImpact: 35,
        timeframe: "6 months",
        status: "RECOMMENDED",
        priority: "HIGH"
      },
      {
        id: 2,
        userId: 1,
        type: "UTILIZATION_REDUCTION",
        title: "Lower Credit Utilization",
        description: "Pay down balances to get below 30% utilization",
        potentialImpact: 25,
        timeframe: "3 months",
        status: "RECOMMENDED",
        priority: "HIGH"
      }
    ];
    buildingActions.forEach(action => this.creditBuildingActions.set(action.id, action));

    // Demo Credit Monitoring Connections
    const demoConnection1: CreditMonitoringConnection = {
      id: 1,
      userId: 2,
      provider: "EXPERIAN",
      accountEmail: "sarah.wilson@example.com",
      isActive: true,
      lastSyncDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      syncFrequency: "DAILY",
      credentialsEncrypted: btoa("demo_encrypted_password"),
      autoSyncEnabled: true,
      syncErrorMessage: null,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    };

    const demoConnection2: CreditMonitoringConnection = {
      id: 2,
      userId: 2,
      provider: "IDENTITY_IQ",
      accountEmail: "sarah.wilson@example.com",
      isActive: true,
      lastSyncDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      syncFrequency: "WEEKLY",
      credentialsEncrypted: btoa("demo_encrypted_password"),
      autoSyncEnabled: true,
      syncErrorMessage: null,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    };

    // Demo Sync History
    const demoSyncHistory1: CreditFileSyncHistory = {
      id: 1,
      userId: 2,
      connectionId: 1,
      provider: "EXPERIAN",
      syncStatus: "SUCCESS",
      issuesFound: 3,
      issuesAdded: 1,
      issuesUpdated: 2,
      scoreChange: 8,
      syncDetails: JSON.stringify({
        newAccounts: 0,
        updatedBalances: 2,
        resolvedIssues: 1,
        newInquiries: 0
      }),
      errorMessage: null,
      syncDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    };

    const demoSyncHistory2: CreditFileSyncHistory = {
      id: 2,
      userId: 2,
      connectionId: 2,
      provider: "IDENTITY_IQ",
      syncStatus: "SUCCESS",
      issuesFound: 2,
      issuesAdded: 0,
      issuesUpdated: 1,
      scoreChange: 5,
      syncDetails: JSON.stringify({
        newAccounts: 0,
        updatedBalances: 1,
        resolvedIssues: 0,
        newInquiries: 1
      }),
      errorMessage: null,
      syncDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    };

    const demoSyncHistory3: CreditFileSyncHistory = {
      id: 3,
      userId: 2,
      connectionId: 1,
      provider: "EXPERIAN",
      syncStatus: "PARTIAL",
      issuesFound: 1,
      issuesAdded: 0,
      issuesUpdated: 1,
      scoreChange: 2,
      syncDetails: JSON.stringify({
        newAccounts: 0,
        updatedBalances: 1,
        resolvedIssues: 0,
        newInquiries: 0
      }),
      errorMessage: "Some data could not be synchronized due to temporary provider issues",
      syncDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
    };

    this.creditMonitoringConnections.set(1, demoConnection1);
    this.creditMonitoringConnections.set(2, demoConnection2);
    this.creditFileSyncHistory.set(1, demoSyncHistory1);
    this.creditFileSyncHistory.set(2, demoSyncHistory2);
    this.creditFileSyncHistory.set(3, demoSyncHistory3);

    // Demo Bureau Responses
    const demoBureauResponse1: BureauResponse = {
      id: 1,
      userId: 2,
      disputeId: 1,
      bureau: "EXPERIAN",
      responseType: "VERIFIED",
      responseText: "After investigation, we have verified the information with the data furnisher and determined that the information is accurate as reported. No changes will be made to your credit file.",
      responseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      documentUrl: null,
      aiAnalysisId: 1,
      nextStepGenerated: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    };

    const demoBureauResponse2: BureauResponse = {
      id: 2,
      userId: 2,
      disputeId: 2,
      bureau: "EQUIFAX",
      responseType: "FRIVOLOUS",
      responseText: "Your dispute has been determined to be frivolous or irrelevant. We will not process this dispute as it lacks sufficient information to warrant an investigation.",
      responseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      documentUrl: null,
      aiAnalysisId: 2,
      nextStepGenerated: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    };

    const demoAnalysis1: BureauResponseAnalysis = {
      id: 1,
      responseId: 1,
      analysisResult: JSON.stringify({
        summary: "Standard verification response - can be challenged",
        legalIssues: ["Insufficient verification procedures", "No specific evidence provided"],
        nextSteps: ["Request method of verification", "Direct furnisher dispute"]
      }),
      rejectionReasons: ["Item verified with data furnisher", "Information deemed accurate"],
      recommendedActions: JSON.stringify([
        {
          action: "Request method of verification",
          priority: "HIGH",
          timeframe: "10 days",
          description: "Demand details of their verification procedures"
        },
        {
          action: "Direct furnisher dispute",
          priority: "MEDIUM", 
          timeframe: "30 days",
          description: "Dispute directly with the original creditor"
        }
      ]),
      successProbability: 65,
      strategyType: "DOCUMENTATION",
      nextDisputeTemplate: "Method of verification request template generated",
      confidenceScore: 85,
      processingTime: 2500,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    };

    const demoAnalysis2: BureauResponseAnalysis = {
      id: 2,
      responseId: 2,
      analysisResult: JSON.stringify({
        summary: "Improper frivolous determination - FCRA violation",
        legalIssues: ["Frivolous determination without basis", "Violation of FCRA Section 611"],
        nextSteps: ["File CFPB complaint", "Send method of verification request"]
      }),
      rejectionReasons: ["Dispute marked as frivolous", "Insufficient investigation conducted"],
      recommendedActions: JSON.stringify([
        {
          action: "File CFPB complaint",
          priority: "HIGH",
          timeframe: "7 days",
          description: "Submit complaint citing improper frivolous determination"
        },
        {
          action: "Send method of verification request",
          priority: "HIGH",
          timeframe: "14 days", 
          description: "Demand proof of verification procedures used"
        }
      ]),
      successProbability: 80,
      strategyType: "ESCALATION",
      nextDisputeTemplate: "FCRA violation escalation letter template generated",
      confidenceScore: 90,
      processingTime: 3200,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    };

    this.bureauResponses.set(1, demoBureauResponse1);
    this.bureauResponses.set(2, demoBureauResponse2);
    this.bureauResponseAnalysis.set(1, demoAnalysis1);
    this.bureauResponseAnalysis.set(2, demoAnalysis2);

    this.currentId = 100; // Start from 100 for new entries
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  // Credit Reports
  async getCreditReport(userId: number): Promise<CreditReport | undefined> {
    return Array.from(this.creditReports.values()).find(report => report.userId === userId);
  }

  async createCreditReport(insertReport: InsertCreditReport): Promise<CreditReport> {
    const id = this.currentId++;
    const report: CreditReport = { ...insertReport, id, lastUpdated: new Date() };
    this.creditReports.set(id, report);
    return report;
  }

  async updateCreditReport(userId: number, updates: Partial<CreditReport>): Promise<CreditReport | undefined> {
    const report = await this.getCreditReport(userId);
    if (!report) return undefined;
    
    const updatedReport = { ...report, ...updates, lastUpdated: new Date() };
    this.creditReports.set(report.id, updatedReport);
    return updatedReport;
  }

  // Credit Issues
  async getCreditIssues(userId: number): Promise<CreditIssue[]> {
    return Array.from(this.creditIssues.values()).filter(issue => issue.userId === userId);
  }

  async getCreditIssue(id: number): Promise<CreditIssue | undefined> {
    return this.creditIssues.get(id);
  }

  async createCreditIssue(insertIssue: InsertCreditIssue): Promise<CreditIssue> {
    const id = this.currentId++;
    const issue: CreditIssue = { ...insertIssue, id };
    this.creditIssues.set(id, issue);
    return issue;
  }

  async updateCreditIssue(id: number, updates: Partial<CreditIssue>): Promise<CreditIssue | undefined> {
    const issue = this.creditIssues.get(id);
    if (!issue) return undefined;
    
    const updatedIssue = { ...issue, ...updates };
    this.creditIssues.set(id, updatedIssue);
    return updatedIssue;
  }

  // Disputes
  async getDisputes(userId: number): Promise<Dispute[]> {
    return Array.from(this.disputes.values()).filter(dispute => dispute.userId === userId);
  }

  async getDispute(id: number): Promise<Dispute | undefined> {
    return this.disputes.get(id);
  }

  async createDispute(insertDispute: InsertDispute): Promise<Dispute> {
    const id = this.currentId++;
    const dispute: Dispute = { 
      ...insertDispute, 
      id, 
      dateSent: new Date(),
      actualResponse: null
    };
    this.disputes.set(id, dispute);
    return dispute;
  }

  async updateDispute(id: number, updates: Partial<Dispute>): Promise<Dispute | undefined> {
    const dispute = this.disputes.get(id);
    if (!dispute) return undefined;
    
    const updatedDispute = { ...dispute, ...updates };
    this.disputes.set(id, updatedDispute);
    return updatedDispute;
  }

  // Credit Goals
  async getCreditGoal(userId: number): Promise<CreditGoal | undefined> {
    return Array.from(this.creditGoals.values()).find(goal => goal.userId === userId);
  }

  async createCreditGoal(insertGoal: InsertCreditGoal): Promise<CreditGoal> {
    const id = this.currentId++;
    const goal: CreditGoal = { ...insertGoal, id, createdAt: new Date() };
    this.creditGoals.set(id, goal);
    return goal;
  }

  async updateCreditGoal(userId: number, updates: Partial<CreditGoal>): Promise<CreditGoal | undefined> {
    const goal = await this.getCreditGoal(userId);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...updates };
    this.creditGoals.set(goal.id, updatedGoal);
    return updatedGoal;
  }

  // Educational Content
  async getEducationalContent(): Promise<EducationalContent[]> {
    return Array.from(this.educationalContent.values());
  }

  async getEducationalContentByCategory(category: string): Promise<EducationalContent[]> {
    return Array.from(this.educationalContent.values()).filter(content => content.category === category);
  }

  // Credit Building Actions
  async getCreditBuildingActions(userId: number): Promise<CreditBuildingAction[]> {
    return Array.from(this.creditBuildingActions.values()).filter(action => action.userId === userId);
  }

  async createCreditBuildingAction(insertAction: InsertCreditBuildingAction): Promise<CreditBuildingAction> {
    const id = this.currentId++;
    const action: CreditBuildingAction = { ...insertAction, id };
    this.creditBuildingActions.set(id, action);
    return action;
  }

  async updateCreditBuildingAction(id: number, updates: Partial<CreditBuildingAction>): Promise<CreditBuildingAction | undefined> {
    const action = this.creditBuildingActions.get(id);
    if (!action) return undefined;
    
    const updatedAction = { ...action, ...updates };
    this.creditBuildingActions.set(id, updatedAction);
    return updatedAction;
  }

  async getTestingFeedback(): Promise<TestingFeedback[]> {
    return Array.from(this.testingFeedback.values());
  }

  async createTestingFeedback(feedback: InsertTestingFeedback): Promise<TestingFeedback> {
    const newFeedback: TestingFeedback = {
      ...feedback,
      id: this.currentId++,
      createdAt: new Date()
    };
    this.testingFeedback.set(newFeedback.id, newFeedback);
    return newFeedback;
  }

  async getBetaAccess(): Promise<BetaAccess[]> {
    return Array.from(this.betaAccess.values());
  }

  async createBetaAccess(access: InsertBetaAccess): Promise<BetaAccess> {
    const newAccess: BetaAccess = {
      ...access,
      id: this.currentId++,
      createdAt: new Date()
    };
    this.betaAccess.set(newAccess.id, newAccess);
    return newAccess;
  }

  async validateAccessCode(code: string): Promise<BetaAccess | undefined> {
    return Array.from(this.betaAccess.values()).find(access => access.accessCode === code);
  }

  async getTestUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUserAccess(userId: number, accessLevel: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, accessLevel };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Credit Monitoring Connections
  async getCreditMonitoringConnections(userId: number): Promise<CreditMonitoringConnection[]> {
    return Array.from(this.creditMonitoringConnections.values()).filter(conn => conn.userId === userId);
  }

  async getCreditMonitoringConnection(id: number): Promise<CreditMonitoringConnection | undefined> {
    return this.creditMonitoringConnections.get(id);
  }

  async createCreditMonitoringConnection(insertConnection: InsertCreditMonitoringConnection): Promise<CreditMonitoringConnection> {
    const id = this.currentId++;
    const connection: CreditMonitoringConnection = {
      ...insertConnection,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.creditMonitoringConnections.set(id, connection);
    return connection;
  }

  async updateCreditMonitoringConnection(id: number, updates: Partial<CreditMonitoringConnection>): Promise<CreditMonitoringConnection | undefined> {
    const connection = this.creditMonitoringConnections.get(id);
    if (!connection) return undefined;
    
    const updatedConnection = { ...connection, ...updates, updatedAt: new Date() };
    this.creditMonitoringConnections.set(id, updatedConnection);
    return updatedConnection;
  }

  async deleteCreditMonitoringConnection(id: number): Promise<boolean> {
    return this.creditMonitoringConnections.delete(id);
  }

  // Credit File Sync History
  async getCreditFileSyncHistory(userId: number): Promise<CreditFileSyncHistory[]> {
    return Array.from(this.creditFileSyncHistory.values())
      .filter(history => history.userId === userId)
      .sort((a, b) => b.syncDate.getTime() - a.syncDate.getTime());
  }

  async getCreditFileSyncHistoryByConnection(connectionId: number): Promise<CreditFileSyncHistory[]> {
    return Array.from(this.creditFileSyncHistory.values())
      .filter(history => history.connectionId === connectionId)
      .sort((a, b) => b.syncDate.getTime() - a.syncDate.getTime());
  }

  async createCreditFileSyncHistory(insertHistory: InsertCreditFileSyncHistory): Promise<CreditFileSyncHistory> {
    const id = this.currentId++;
    const history: CreditFileSyncHistory = {
      ...insertHistory,
      id,
      syncDate: new Date()
    };
    this.creditFileSyncHistory.set(id, history);
    return history;
  }

  // Bureau Response Analysis methods
  async getBureauResponses(userId: number): Promise<BureauResponse[]> {
    return Array.from(this.bureauResponses.values()).filter(response => response.userId === userId);
  }

  async getBureauResponse(id: number): Promise<BureauResponse | undefined> {
    return this.bureauResponses.get(id);
  }

  async createBureauResponse(insertResponse: InsertBureauResponse): Promise<BureauResponse> {
    const id = this.currentId++;
    const response: BureauResponse = { 
      ...insertResponse, 
      id, 
      createdAt: new Date() 
    };
    this.bureauResponses.set(id, response);
    return response;
  }

  async updateBureauResponse(id: number, updates: Partial<BureauResponse>): Promise<BureauResponse | undefined> {
    const response = this.bureauResponses.get(id);
    if (response) {
      const updated = { ...response, ...updates };
      this.bureauResponses.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getBureauResponseAnalysis(responseId: number): Promise<BureauResponseAnalysis | undefined> {
    return Array.from(this.bureauResponseAnalysis.values()).find(analysis => analysis.responseId === responseId);
  }

  async createBureauResponseAnalysis(insertAnalysis: InsertBureauResponseAnalysis): Promise<BureauResponseAnalysis> {
    const id = this.currentId++;
    const analysis: BureauResponseAnalysis = { 
      ...insertAnalysis, 
      id, 
      createdAt: new Date() 
    };
    this.bureauResponseAnalysis.set(id, analysis);
    return analysis;
  }
}

export const storage = new MemStorage();
