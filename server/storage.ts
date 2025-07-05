import { 
  users, creditReports, creditIssues, disputes, creditGoals, 
  educationalContent, creditBuildingActions, testingFeedback, betaAccess,
  type User, type InsertUser,
  type CreditReport, type InsertCreditReport,
  type CreditIssue, type InsertCreditIssue,
  type Dispute, type InsertDispute,
  type CreditGoal, type InsertCreditGoal,
  type EducationalContent, type InsertEducationalContent,
  type CreditBuildingAction, type InsertCreditBuildingAction,
  type TestingFeedback, type InsertTestingFeedback,
  type BetaAccess, type InsertBetaAccess
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

    // Create demo client user
    const clientUser: User = {
      id: 2,
      firstName: "Sarah",
      lastName: "Johnson",
      email: "client@example.com",
      accessLevel: "CLIENT_VIEWER",
      isTestUser: false,
      testingNotes: "Demo client account for testing client portal",
      createdAt: new Date()
    };
    this.users.set(2, clientUser);
    this.currentId = 3;

    // Use client user for sample data
    const user: User = clientUser;

    // Create sample credit report for client user (ID 2)
    const creditReport: CreditReport = {
      id: 1,
      userId: 2,
      creditScore: 658,
      creditRating: "FAIR",
      lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      utilizationRate: 0.65,
      accountAge: 18
    };
    this.creditReports.set(1, creditReport);

    // Create sample credit issues
    const issues: CreditIssue[] = [
      {
        id: 1,
        userId: 1,
        type: "COLLECTION",
        title: "Collection Account",
        description: "Medical collection from ABC Medical Center - $1,247",
        amount: 1247,
        impact: -45,
        dateAdded: new Date("2023-03-15"),
        status: "ACTIVE",
        creditor: "ABC Medical Center"
      },
      {
        id: 2,
        userId: 1,
        type: "LATE_PAYMENT",
        title: "Late Payment",
        description: "Chase Credit Card - 30 days late payment",
        amount: null,
        impact: -15,
        dateAdded: new Date("2024-01-15"),
        status: "ACTIVE",
        creditor: "Chase Bank"
      },
      {
        id: 3,
        userId: 1,
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

    // Create sample disputes
    const disputesData: Dispute[] = [
      {
        id: 1,
        userId: 1,
        issueId: 1,
        bureau: "EQUIFAX",
        status: "PENDING",
        dateSent: new Date("2024-03-15"),
        expectedResponse: new Date("2024-04-14"),
        actualResponse: null,
        letterContent: "Dispute letter content for collection account..."
      },
      {
        id: 2,
        userId: 1,
        issueId: 2,
        bureau: "EXPERIAN",
        status: "RESOLVED",
        dateSent: new Date("2024-02-20"),
        expectedResponse: new Date("2024-03-21"),
        actualResponse: new Date("2024-03-10"),
        letterContent: "Dispute letter content for late payment..."
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
}

export const storage = new MemStorage();
