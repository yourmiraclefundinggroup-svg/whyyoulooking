import { 
  users, creditReports, creditIssues, disputes, creditGoals, 
  educationalContent, creditBuildingActions, testingFeedback, betaAccess,
  creditMonitoringConnections, creditFileSyncHistory, bureauResponses, bureauResponseAnalysis,
  creditCards, utilizationOptimizations, utilizationAlerts, loanReadinessProfiles, loanReadinessAssessments,
  goodwillLetters, creditMixOptimizations, identityTheftCases, rentUtilityReporting,
  creditCardPredictions, financialBehaviorProfiles, bankAccountConnections, taxIntegrations,
  employmentVerifications, disputeSuccessPredictions, mlTrainingData, chatMessages, chatDocuments, documentTags, aiConversations,
  studentLoans, loanNegotiations, loanDocuments,
  creditReportUploads, creditReportAccounts, creditReportInquiries, creditReportCollections,
  creditReportPublicRecords, disputeItems, disputeLettersNew, disputeCalendarEvents,
  leads, affiliates, affiliateSignups, deletionEvents, creditScoreHistory, creditReportCache,
  managedClientPackages, clientCaseActivities, clientDocuments,
  type ManagedClientPackage, type InsertManagedClientPackage,
  type ClientCaseActivity, type InsertClientCaseActivity,
  type ClientDocument, type InsertClientDocument,
  type CreditScoreHistory, type InsertCreditScoreHistory,
  type CreditReportCacheEntry,
  type User,
  type InsertUser,
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
  type BureauResponseAnalysis, type InsertBureauResponseAnalysis,
  type CreditCard, type InsertCreditCard,
  type UtilizationOptimization, type InsertUtilizationOptimization,
  type UtilizationAlert, type InsertUtilizationAlert,
  type LoanReadinessProfile, type InsertLoanReadinessProfile,
  type LoanReadinessAssessment, type InsertLoanReadinessAssessment,
  type GoodwillLetter, type InsertGoodwillLetter,
  type CreditMixOptimization, type InsertCreditMixOptimization,
  type IdentityTheftCase, type InsertIdentityTheftCase,
  type RentUtilityReporting, type InsertRentUtilityReporting,
  type CreditCardPrediction, type InsertCreditCardPrediction,
  type FinancialBehaviorProfile, type InsertFinancialBehaviorProfile,
  type BankAccountConnection, type InsertBankAccountConnection,
  type TaxIntegration, type InsertTaxIntegration,
  type EmploymentVerification, type InsertEmploymentVerification,
  type DisputeSuccessPrediction, type InsertDisputeSuccessPrediction,
  type MlTrainingData, type InsertMlTrainingData,
  chatMessages as ChatMessage,
  type ChatDocument, type InsertChatDocument, type InsertChatMessage,
  type DocumentTag, type InsertDocumentTag,
  type AiConversation, type InsertAiConversation,
  type StudentLoan, type InsertStudentLoan,
  type LoanNegotiation, type InsertLoanNegotiation,
  type LoanDocument, type InsertLoanDocument,
  type CreditReportUpload, type InsertCreditReportUpload,
  type CreditReportAccount, type InsertCreditReportAccount,
  type CreditReportInquiry, type InsertCreditReportInquiry,
  type CreditReportCollection, type InsertCreditReportCollection,
  type CreditReportPublicRecord, type InsertCreditReportPublicRecord,
  type DisputeItem, type InsertDisputeItem,
  type DisputeLetterNew, type InsertDisputeLetterNew,
  type DisputeCalendarEvent, type InsertDisputeCalendarEvent,
  type Lead, type InsertLead,
  type Affiliate, type InsertAffiliate,
  type AffiliateSignup, type InsertAffiliateSignup,
  type DeletionEvent, type InsertDeletionEvent
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(userId: number, updates: Partial<User>): Promise<User | undefined>;
  updateUserPassword(userId: number, newPassword: string): Promise<User | undefined>;

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
  getAllDisputes(): Promise<Dispute[]>;
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
  getUsers(): Promise<User[]>;
  getTestUsers(): Promise<User[]>;
  updateUserAccess(userId: number, accessLevel: string): Promise<User | undefined>;

  // Credit Monitoring Connections
  getCreditMonitoringConnections(userId: number): Promise<CreditMonitoringConnection[]>;
  getCreditMonitoringConnection(id: number): Promise<CreditMonitoringConnection | undefined>;
  createCreditMonitoringConnection(connection: InsertCreditMonitoringConnection): Promise<CreditMonitoringConnection>;
  updateCreditMonitoringConnection(id: number, updates: Partial<CreditMonitoringConnection>): Promise<CreditMonitoringConnection | undefined>;
  deleteCreditMonitoringConnection(id: number): Promise<boolean>;
  getAllCreditMonitoringConnectionsWithUsers(): Promise<(CreditMonitoringConnection & { user?: User })[]>;

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

  // Credit Utilization Optimizer
  getCreditCards(userId: number): Promise<CreditCard[]>;
  getCreditCard(id: number): Promise<CreditCard | undefined>;
  createCreditCard(card: InsertCreditCard): Promise<CreditCard>;
  updateCreditCard(id: number, updates: Partial<CreditCard>): Promise<CreditCard | undefined>;
  getUtilizationOptimizations(userId: number): Promise<UtilizationOptimization[]>;
  createUtilizationOptimization(optimization: InsertUtilizationOptimization): Promise<UtilizationOptimization>;
  getUtilizationAlerts(userId: number): Promise<UtilizationAlert[]>;
  createUtilizationAlert(alert: InsertUtilizationAlert): Promise<UtilizationAlert>;
  markUtilizationAlertAsRead(alertId: number): Promise<UtilizationAlert | undefined>;

  // Loan Readiness Assessment
  getLoanReadinessProfile(userId: number): Promise<LoanReadinessProfile | null>;
  saveLoanReadinessProfile(data: any): Promise<LoanReadinessProfile>;
  getLoanReadinessAssessments(userId: number): Promise<LoanReadinessAssessment[]>;
  saveLoanReadinessAssessment(data: InsertLoanReadinessAssessment): Promise<LoanReadinessAssessment>;

  // Goodwill Letters
  getGoodwillLetters(userId: number): Promise<GoodwillLetter[]>;
  getGoodwillLetter(id: number): Promise<GoodwillLetter | undefined>;
  createGoodwillLetter(letter: InsertGoodwillLetter): Promise<GoodwillLetter>;
  updateGoodwillLetter(id: number, updates: Partial<GoodwillLetter>): Promise<GoodwillLetter | undefined>;

  // Credit Mix Optimization
  getCreditMixOptimizations(userId: number): Promise<CreditMixOptimization[]>;
  getCreditMixOptimization(id: number): Promise<CreditMixOptimization | undefined>;
  createCreditMixOptimization(optimization: InsertCreditMixOptimization): Promise<CreditMixOptimization>;
  updateCreditMixOptimization(id: number, updates: Partial<CreditMixOptimization>): Promise<CreditMixOptimization | undefined>;

  // Identity Theft Recovery
  getIdentityTheftCases(userId: number): Promise<IdentityTheftCase[]>;
  getIdentityTheftCase(id: number): Promise<IdentityTheftCase | undefined>;
  createIdentityTheftCase(case_: InsertIdentityTheftCase): Promise<IdentityTheftCase>;
  updateIdentityTheftCase(id: number, updates: Partial<IdentityTheftCase>): Promise<IdentityTheftCase | undefined>;

  // Rent/Utility Reporting
  getRentUtilityReporting(userId: number): Promise<RentUtilityReporting[]>;
  getRentUtilityReportingById(id: number): Promise<RentUtilityReporting | undefined>;
  createRentUtilityReporting(reporting: InsertRentUtilityReporting): Promise<RentUtilityReporting>;
  updateRentUtilityReporting(id: number, updates: Partial<RentUtilityReporting>): Promise<RentUtilityReporting | undefined>;

  // Credit Card Predictions
  getCreditCardPredictions(userId: number): Promise<CreditCardPrediction[]>;
  getCreditCardPrediction(id: number): Promise<CreditCardPrediction | undefined>;
  createCreditCardPrediction(prediction: InsertCreditCardPrediction): Promise<CreditCardPrediction>;
  updateCreditCardPrediction(id: number, updates: Partial<CreditCardPrediction>): Promise<CreditCardPrediction | undefined>;

  // Financial Behavior Profiles
  getFinancialBehaviorProfile(userId: number): Promise<FinancialBehaviorProfile | undefined>;
  createFinancialBehaviorProfile(profile: InsertFinancialBehaviorProfile): Promise<FinancialBehaviorProfile>;
  updateFinancialBehaviorProfile(id: number, updates: Partial<FinancialBehaviorProfile>): Promise<FinancialBehaviorProfile | undefined>;

  // Bank Account Connections
  getBankAccountConnections(userId: number): Promise<BankAccountConnection[]>;
  getBankAccountConnection(id: number): Promise<BankAccountConnection | undefined>;
  createBankAccountConnection(connection: InsertBankAccountConnection): Promise<BankAccountConnection>;
  updateBankAccountConnection(id: number, updates: Partial<BankAccountConnection>): Promise<BankAccountConnection | undefined>;

  // Tax Integrations
  getTaxIntegrations(userId: number): Promise<TaxIntegration[]>;
  getTaxIntegration(id: number): Promise<TaxIntegration | undefined>;
  createTaxIntegration(integration: InsertTaxIntegration): Promise<TaxIntegration>;
  updateTaxIntegration(id: number, updates: Partial<TaxIntegration>): Promise<TaxIntegration | undefined>;

  // Employment Verifications
  getEmploymentVerifications(userId: number): Promise<EmploymentVerification[]>;
  getEmploymentVerification(id: number): Promise<EmploymentVerification | undefined>;
  createEmploymentVerification(verification: InsertEmploymentVerification): Promise<EmploymentVerification>;
  updateEmploymentVerification(id: number, updates: Partial<EmploymentVerification>): Promise<EmploymentVerification | undefined>;

  // Dispute Success Predictions
  getDisputeSuccessPredictions(disputeId: number): Promise<DisputeSuccessPrediction[]>;
  getDisputeSuccessPrediction(id: number): Promise<DisputeSuccessPrediction | undefined>;
  createDisputeSuccessPrediction(prediction: InsertDisputeSuccessPrediction): Promise<DisputeSuccessPrediction>;

  // ML Training Data
  getMlTrainingData(dataType?: string): Promise<MlTrainingData[]>;
  createMlTrainingData(data: InsertMlTrainingData): Promise<MlTrainingData>;

  // Chat System
  getChatMessages(userId: number): Promise<any[]>;
  getChatDocuments(userId: number): Promise<any[]>;
  getAllChatDocuments(): Promise<any[]>;
  getChatDocument(id: number): Promise<any | undefined>;
  createChatMessage(message: InsertChatMessage): Promise<any>;
  createChatDocument(document: InsertChatDocument): Promise<any>;
  updateChatDocument(id: number, updates: Partial<ChatDocument>): Promise<ChatDocument | undefined>;

  // Document Tagging System
  getAllDocumentTags(): Promise<DocumentTag[]>;
  getDocumentTag(id: number): Promise<DocumentTag | undefined>;
  getDocumentTagByName(name: string): Promise<DocumentTag | undefined>;
  createDocumentTag(tag: InsertDocumentTag): Promise<DocumentTag>;
  updateDocumentTag(id: number, updates: Partial<DocumentTag>): Promise<DocumentTag | undefined>;
  incrementTagUsage(tagName: string): Promise<void>;
  getDocumentsByTag(tagName: string): Promise<ChatDocument[]>;
  searchDocuments(query: string, userId?: number): Promise<ChatDocument[]>;

  // AI Assistant Conversations
  getAIConversation(userId: number): Promise<AiConversation[]>;
  storeAIMessage(userId: number, message: {
    role: 'user' | 'assistant';
    content: string;
    attachments: { name: string; size: number; type: string }[];
    timestamp: string;
    letterGenerated?: boolean;
    letterUrl?: string;
  }): Promise<AiConversation>;

  // Student Loan Management
  getStudentLoansByUserId(userId: number): Promise<StudentLoan[]>;
  createStudentLoan(data: InsertStudentLoan): Promise<StudentLoan>;
  updateStudentLoan(id: number, data: Partial<StudentLoan>): Promise<StudentLoan>;
  getLoanNegotiationsByUserId(userId: number): Promise<LoanNegotiation[]>;
  createLoanNegotiation(data: InsertLoanNegotiation): Promise<LoanNegotiation>;
  updateLoanNegotiation(id: number, data: Partial<LoanNegotiation>): Promise<LoanNegotiation>;

  // Credit Report Uploads (Dispute Hub)
  getCreditReportUploads(clientId: number): Promise<CreditReportUpload[]>;
  getAllCreditReportUploads(): Promise<CreditReportUpload[]>;
  getCreditReportUpload(id: number): Promise<CreditReportUpload | undefined>;
  createCreditReportUpload(upload: InsertCreditReportUpload): Promise<CreditReportUpload>;
  updateCreditReportUpload(id: number, updates: Partial<CreditReportUpload>): Promise<CreditReportUpload | undefined>;

  // Credit Report Accounts
  getCreditReportAccounts(uploadId: number): Promise<CreditReportAccount[]>;
  createCreditReportAccount(account: InsertCreditReportAccount): Promise<CreditReportAccount>;
  updateCreditReportAccount(id: number, updates: Partial<CreditReportAccount>): Promise<CreditReportAccount | undefined>;

  // Credit Report Inquiries
  getCreditReportInquiries(uploadId: number): Promise<CreditReportInquiry[]>;
  createCreditReportInquiry(inquiry: InsertCreditReportInquiry): Promise<CreditReportInquiry>;

  // Credit Report Collections
  getCreditReportCollections(uploadId: number): Promise<CreditReportCollection[]>;
  createCreditReportCollection(collection: InsertCreditReportCollection): Promise<CreditReportCollection>;

  // Credit Report Public Records
  getCreditReportPublicRecords(uploadId: number): Promise<CreditReportPublicRecord[]>;
  createCreditReportPublicRecord(record: InsertCreditReportPublicRecord): Promise<CreditReportPublicRecord>;

  // Dispute Items
  getDisputeItems(uploadId: number): Promise<DisputeItem[]>;
  getDisputeItemsByClient(clientId: number): Promise<DisputeItem[]>;
  getDisputeItem(id: number): Promise<DisputeItem | undefined>;
  createDisputeItem(item: InsertDisputeItem): Promise<DisputeItem>;
  updateDisputeItem(id: number, updates: Partial<DisputeItem>): Promise<DisputeItem | undefined>;

  // Dispute Letters (New)
  getDisputeLettersNew(uploadId: number): Promise<DisputeLetterNew[]>;
  getAllDisputeLettersNew(): Promise<DisputeLetterNew[]>;
  getDisputeLettersNewByClient(clientId: number): Promise<DisputeLetterNew[]>;
  getDisputeLetterNew(id: number): Promise<DisputeLetterNew | undefined>;
  createDisputeLetterNew(letter: InsertDisputeLetterNew): Promise<DisputeLetterNew>;
  updateDisputeLetterNew(id: number, updates: Partial<DisputeLetterNew>): Promise<DisputeLetterNew | undefined>;

  // Dispute Calendar Events
  getDisputeCalendarEvents(clientId: number): Promise<DisputeCalendarEvent[]>;
  getAllDisputeCalendarEvents(): Promise<DisputeCalendarEvent[]>;
  getDisputeCalendarEvent(id: number): Promise<DisputeCalendarEvent | undefined>;
  createDisputeCalendarEvent(event: InsertDisputeCalendarEvent): Promise<DisputeCalendarEvent>;
  updateDisputeCalendarEvent(id: number, updates: Partial<DisputeCalendarEvent>): Promise<DisputeCalendarEvent | undefined>;

  // Leads CRM
  getLeads(): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, updates: Partial<Lead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<void>;

  // Affiliates
  getAffiliates(): Promise<Affiliate[]>;
  getAffiliate(id: number): Promise<Affiliate | undefined>;
  getAffiliateByCode(code: string): Promise<Affiliate | undefined>;
  createAffiliate(affiliate: InsertAffiliate): Promise<Affiliate>;
  updateAffiliate(id: number, updates: Partial<Affiliate>): Promise<Affiliate | undefined>;

  // Affiliate Signups
  getAffiliateSignups(affiliateId: number): Promise<AffiliateSignup[]>;
  createAffiliateSignup(signup: InsertAffiliateSignup): Promise<AffiliateSignup>;
  updateAffiliateSignup(id: number, updates: Partial<AffiliateSignup>): Promise<AffiliateSignup | undefined>;

  // Deletion Events (Pay-Per-Delete)
  getDeletionEvents(clientId: number): Promise<DeletionEvent[]>;
  getAllDeletionEvents(): Promise<DeletionEvent[]>;
  createDeletionEvent(event: InsertDeletionEvent): Promise<DeletionEvent>;
  updateDeletionEvent(id: number, updates: Partial<DeletionEvent>): Promise<DeletionEvent | undefined>;

  // Managed Client
  getManagedClientPackage(userId: number): Promise<ManagedClientPackage | undefined>;
  upsertManagedClientPackage(userId: number, data: Partial<InsertManagedClientPackage>): Promise<ManagedClientPackage>;
  getClientCaseActivities(userId: number): Promise<ClientCaseActivity[]>;
  createClientCaseActivity(activity: InsertClientCaseActivity): Promise<ClientCaseActivity>;
  updateClientCaseActivity(id: number, updates: Partial<ClientCaseActivity>): Promise<ClientCaseActivity | undefined>;
  deleteClientCaseActivity(id: number): Promise<void>;
  getClientDocuments(userId: number): Promise<ClientDocument[]>;
  createClientDocument(doc: InsertClientDocument): Promise<ClientDocument>;
  updateClientDocument(id: number, updates: Partial<ClientDocument>): Promise<ClientDocument | undefined>;

  // Credit Score History
  createCreditScoreHistory(entry: InsertCreditScoreHistory): Promise<CreditScoreHistory>;
  getCreditScoreHistory(userId: number): Promise<CreditScoreHistory[]>;

  // Credit Report Cache
  getCreditReportCache(userId: number): Promise<CreditReportCacheEntry | undefined>;
  setCreditReportCache(userId: number, data: any, source: string): Promise<void>;
  invalidateCreditReportCache(userId: number): Promise<void>;

  // Client dashboard stats
  getClientStats(userId: number, subscriptionTier: string): Promise<{
    ptsGained: number | null;
    itemsRemoved: number;
    topScore: number | null;
    activeIssues: number;
    disputesInProgress: number;
    itemsResolved: number;
    identityProtectionActive: boolean;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(userId: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ password: newPassword })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
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

  async getAllDisputes(): Promise<Dispute[]> {
    return await db.select().from(disputes);
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

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.accessLevel, users.firstName);
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

  // Chat System Implementation
  async getChatMessages(userId: number): Promise<any[]> {
    return await db.select().from(chatMessages).where(eq(chatMessages.userId, userId));
  }

  async getChatDocuments(userId: number): Promise<any[]> {
    return await db.select().from(chatDocuments).where(eq(chatDocuments.userId, userId));
  }

  async getAllChatDocuments(): Promise<any[]> {
    return await db.select().from(chatDocuments).orderBy(chatDocuments.createdAt);
  }

  async getChatDocument(id: number): Promise<any | undefined> {
    const [document] = await db.select().from(chatDocuments).where(eq(chatDocuments.id, id));
    return document || undefined;
  }

  async createChatMessage(message: InsertChatMessage): Promise<any> {
    const [chatMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return chatMessage;
  }

  async createChatDocument(document: InsertChatDocument): Promise<any> {
    const [chatDocument] = await db
      .insert(chatDocuments)
      .values(document)
      .returning();
    return chatDocument;
  }

  async updateChatDocument(id: number, updates: Partial<ChatDocument>): Promise<ChatDocument | undefined> {
    const [updatedDocument] = await db
      .update(chatDocuments)
      .set(updates)
      .where(eq(chatDocuments.id, id))
      .returning();
    return updatedDocument || undefined;
  }

  // Document Tagging System Implementation
  async getAllDocumentTags(): Promise<DocumentTag[]> {
    return await db.select().from(documentTags).orderBy(documentTags.category, documentTags.name);
  }

  async getDocumentTag(id: number): Promise<DocumentTag | undefined> {
    const [tag] = await db.select().from(documentTags).where(eq(documentTags.id, id));
    return tag || undefined;
  }

  async getDocumentTagByName(name: string): Promise<DocumentTag | undefined> {
    const [tag] = await db.select().from(documentTags).where(eq(documentTags.name, name));
    return tag || undefined;
  }

  async createDocumentTag(tag: InsertDocumentTag): Promise<DocumentTag> {
    const [newTag] = await db
      .insert(documentTags)
      .values(tag)
      .returning();
    return newTag;
  }

  async updateDocumentTag(id: number, updates: Partial<DocumentTag>): Promise<DocumentTag | undefined> {
    const [updatedTag] = await db
      .update(documentTags)
      .set(updates)
      .where(eq(documentTags.id, id))
      .returning();
    return updatedTag || undefined;
  }

  async incrementTagUsage(tagName: string): Promise<void> {
    await db
      .update(documentTags)
      .set({ usageCount: sql`${documentTags.usageCount} + 1` })
      .where(eq(documentTags.name, tagName));
  }

  async getDocumentsByTag(tagName: string): Promise<ChatDocument[]> {
    return await db
      .select()
      .from(chatDocuments)
      .where(sql`${tagName} = ANY(${chatDocuments.smartTags}) OR ${tagName} = ANY(${chatDocuments.customTags})`);
  }

  async searchDocuments(query: string, userId?: number): Promise<ChatDocument[]> {
    let whereCondition = sql`
      (${chatDocuments.fileName} ILIKE ${'%' + query + '%'} OR
       ${chatDocuments.extractedText} ILIKE ${'%' + query + '%'} OR
       array_to_string(${chatDocuments.smartTags}, ',') ILIKE ${'%' + query + '%'} OR
       array_to_string(${chatDocuments.customTags}, ',') ILIKE ${'%' + query + '%'})
    `;
    
    if (userId) {
      whereCondition = sql`${whereCondition} AND ${chatDocuments.userId} = ${userId}`;
    }
    
    return await db.select().from(chatDocuments).where(whereCondition);
  }

  // Credit Monitoring Connections
  async getCreditMonitoringConnections(userId: number): Promise<CreditMonitoringConnection[]> {
    return await db.select().from(creditMonitoringConnections).where(eq(creditMonitoringConnections.userId, userId));
  }
  
  async getCreditMonitoringConnection(id: number): Promise<CreditMonitoringConnection | undefined> {
    const [connection] = await db.select().from(creditMonitoringConnections).where(eq(creditMonitoringConnections.id, id));
    return connection || undefined;
  }
  
  async createCreditMonitoringConnection(connection: InsertCreditMonitoringConnection): Promise<CreditMonitoringConnection> {
    // Ensure all required fields are present with defaults
    const connectionWithDefaults = {
      userId: connection.userId,
      provider: connection.provider || 'EXPERIAN',
      accountEmail: connection.accountEmail || 'default@scoreshift.com',
      isActive: connection.isActive !== undefined ? connection.isActive : true,
      lastSyncDate: connection.lastSyncDate || null,
      syncFrequency: connection.syncFrequency || 'DAILY',
      credentialsEncrypted: connection.credentialsEncrypted || null,
      autoSyncEnabled: connection.autoSyncEnabled !== undefined ? connection.autoSyncEnabled : true,
      syncErrorMessage: connection.syncErrorMessage || null
    };
    
    const [newConnection] = await db.insert(creditMonitoringConnections).values(connectionWithDefaults).returning();
    return newConnection;
  }
  
  async updateCreditMonitoringConnection(id: number, updates: Partial<CreditMonitoringConnection>): Promise<CreditMonitoringConnection | undefined> {
    const [updatedConnection] = await db.update(creditMonitoringConnections)
      .set(updates)
      .where(eq(creditMonitoringConnections.id, id))
      .returning();
    return updatedConnection || undefined;
  }
  
  async deleteCreditMonitoringConnection(id: number): Promise<boolean> {
    const result = await db.delete(creditMonitoringConnections).where(eq(creditMonitoringConnections.id, id));
    return result.rowCount > 0;
  }
  async getCreditFileSyncHistory(userId: number): Promise<CreditFileSyncHistory[]> { return []; }
  async getCreditFileSyncHistoryByConnection(connectionId: number): Promise<CreditFileSyncHistory[]> { return []; }
  async createCreditFileSyncHistory(history: InsertCreditFileSyncHistory): Promise<CreditFileSyncHistory> { throw new Error("Not implemented"); }
  async getBureauResponses(userId: number): Promise<BureauResponse[]> { return []; }
  async getBureauResponse(id: number): Promise<BureauResponse | undefined> { return undefined; }
  async createBureauResponse(response: InsertBureauResponse): Promise<BureauResponse> { throw new Error("Not implemented"); }
  async updateBureauResponse(id: number, updates: Partial<BureauResponse>): Promise<BureauResponse | undefined> { return undefined; }
  async getBureauResponseAnalysis(responseId: number): Promise<BureauResponseAnalysis | undefined> { return undefined; }
  async createBureauResponseAnalysis(analysis: InsertBureauResponseAnalysis): Promise<BureauResponseAnalysis> { throw new Error("Not implemented"); }
  async getCreditCards(userId: number): Promise<CreditCard[]> { return []; }
  async getCreditCard(id: number): Promise<CreditCard | undefined> { return undefined; }
  async createCreditCard(card: InsertCreditCard): Promise<CreditCard> { throw new Error("Not implemented"); }
  async updateCreditCard(id: number, updates: Partial<CreditCard>): Promise<CreditCard | undefined> { return undefined; }
  async getUtilizationOptimizations(userId: number): Promise<UtilizationOptimization[]> { return []; }
  async createUtilizationOptimization(optimization: InsertUtilizationOptimization): Promise<UtilizationOptimization> { throw new Error("Not implemented"); }
  async getUtilizationAlerts(userId: number): Promise<UtilizationAlert[]> { return []; }
  async createUtilizationAlert(alert: InsertUtilizationAlert): Promise<UtilizationAlert> { throw new Error("Not implemented"); }
  async markUtilizationAlertAsRead(alertId: number): Promise<UtilizationAlert | undefined> { return undefined; }
  async getLoanReadinessProfile(userId: number): Promise<LoanReadinessProfile | null> { return null; }
  async saveLoanReadinessProfile(data: any): Promise<LoanReadinessProfile> { throw new Error("Not implemented"); }
  async getLoanReadinessAssessments(userId: number): Promise<LoanReadinessAssessment[]> { return []; }
  async saveLoanReadinessAssessment(data: InsertLoanReadinessAssessment): Promise<LoanReadinessAssessment> { throw new Error("Not implemented"); }
  async getGoodwillLetters(userId: number): Promise<GoodwillLetter[]> { return []; }
  async getGoodwillLetter(id: number): Promise<GoodwillLetter | undefined> { return undefined; }
  async createGoodwillLetter(letter: InsertGoodwillLetter): Promise<GoodwillLetter> { throw new Error("Not implemented"); }
  async updateGoodwillLetter(id: number, updates: Partial<GoodwillLetter>): Promise<GoodwillLetter | undefined> { return undefined; }
  async getCreditMixOptimizations(userId: number): Promise<CreditMixOptimization[]> { return []; }
  async getCreditMixOptimization(id: number): Promise<CreditMixOptimization | undefined> { return undefined; }
  async createCreditMixOptimization(optimization: InsertCreditMixOptimization): Promise<CreditMixOptimization> { throw new Error("Not implemented"); }
  async updateCreditMixOptimization(id: number, updates: Partial<CreditMixOptimization>): Promise<CreditMixOptimization | undefined> { return undefined; }
  async getIdentityTheftCases(userId: number): Promise<IdentityTheftCase[]> { return []; }
  async getIdentityTheftCase(id: number): Promise<IdentityTheftCase | undefined> { return undefined; }
  async createIdentityTheftCase(case_: InsertIdentityTheftCase): Promise<IdentityTheftCase> { throw new Error("Not implemented"); }
  async updateIdentityTheftCase(id: number, updates: Partial<IdentityTheftCase>): Promise<IdentityTheftCase | undefined> { return undefined; }
  async getRentUtilityReporting(userId: number): Promise<RentUtilityReporting[]> { return []; }
  async getRentUtilityReportingById(id: number): Promise<RentUtilityReporting | undefined> { return undefined; }
  async createRentUtilityReporting(reporting: InsertRentUtilityReporting): Promise<RentUtilityReporting> { throw new Error("Not implemented"); }
  async updateRentUtilityReporting(id: number, updates: Partial<RentUtilityReporting>): Promise<RentUtilityReporting | undefined> { return undefined; }
  async getCreditCardPredictions(userId: number): Promise<CreditCardPrediction[]> { return []; }
  async getCreditCardPrediction(id: number): Promise<CreditCardPrediction | undefined> { return undefined; }
  async createCreditCardPrediction(prediction: InsertCreditCardPrediction): Promise<CreditCardPrediction> { throw new Error("Not implemented"); }
  async updateCreditCardPrediction(id: number, updates: Partial<CreditCardPrediction>): Promise<CreditCardPrediction | undefined> { return undefined; }
  async getFinancialBehaviorProfile(userId: number): Promise<FinancialBehaviorProfile | undefined> { return undefined; }
  async createFinancialBehaviorProfile(profile: InsertFinancialBehaviorProfile): Promise<FinancialBehaviorProfile> { throw new Error("Not implemented"); }
  async updateFinancialBehaviorProfile(id: number, updates: Partial<FinancialBehaviorProfile>): Promise<FinancialBehaviorProfile | undefined> { return undefined; }
  async getBankAccountConnections(userId: number): Promise<BankAccountConnection[]> { return []; }
  async getBankAccountConnection(id: number): Promise<BankAccountConnection | undefined> { return undefined; }
  async createBankAccountConnection(connection: InsertBankAccountConnection): Promise<BankAccountConnection> { throw new Error("Not implemented"); }
  async updateBankAccountConnection(id: number, updates: Partial<BankAccountConnection>): Promise<BankAccountConnection | undefined> { return undefined; }
  async getTaxIntegrations(userId: number): Promise<TaxIntegration[]> { return []; }
  async getTaxIntegration(id: number): Promise<TaxIntegration | undefined> { return undefined; }
  async createTaxIntegration(integration: InsertTaxIntegration): Promise<TaxIntegration> { throw new Error("Not implemented"); }
  async updateTaxIntegration(id: number, updates: Partial<TaxIntegration>): Promise<TaxIntegration | undefined> { return undefined; }
  async getEmploymentVerifications(userId: number): Promise<EmploymentVerification[]> { return []; }
  async getEmploymentVerification(id: number): Promise<EmploymentVerification | undefined> { return undefined; }
  async createEmploymentVerification(verification: InsertEmploymentVerification): Promise<EmploymentVerification> { throw new Error("Not implemented"); }
  async updateEmploymentVerification(id: number, updates: Partial<EmploymentVerification>): Promise<EmploymentVerification | undefined> { return undefined; }
  async getDisputeSuccessPredictions(disputeId: number): Promise<DisputeSuccessPrediction[]> { return []; }
  async getDisputeSuccessPrediction(id: number): Promise<DisputeSuccessPrediction | undefined> { return undefined; }
  async createDisputeSuccessPrediction(prediction: InsertDisputeSuccessPrediction): Promise<DisputeSuccessPrediction> { throw new Error("Not implemented"); }
  async getMlTrainingData(dataType?: string): Promise<MlTrainingData[]> { return []; }
  async createMlTrainingData(data: InsertMlTrainingData): Promise<MlTrainingData> { throw new Error("Not implemented"); }

  async getAllCreditMonitoringConnectionsWithUsers(): Promise<(CreditMonitoringConnection & { user?: User })[]> {
    const connections = await db
      .select({
        id: creditMonitoringConnections.id,
        userId: creditMonitoringConnections.userId,
        provider: creditMonitoringConnections.provider,
        accountEmail: creditMonitoringConnections.accountEmail,
        isActive: creditMonitoringConnections.isActive,
        lastSyncDate: creditMonitoringConnections.lastSyncDate,
        syncFrequency: creditMonitoringConnections.syncFrequency,
        credentialsEncrypted: creditMonitoringConnections.credentialsEncrypted,
        autoSyncEnabled: creditMonitoringConnections.autoSyncEnabled,
        syncErrorMessage: creditMonitoringConnections.syncErrorMessage,
        createdAt: creditMonitoringConnections.createdAt,
        updatedAt: creditMonitoringConnections.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          accessLevel: users.accessLevel
        }
      })
      .from(creditMonitoringConnections)
      .leftJoin(users, eq(creditMonitoringConnections.userId, users.id));
    
    return connections.map(row => ({
      id: row.id,
      userId: row.userId,
      bureau: row.provider, // Map provider to bureau field expected by the interface
      serviceProvider: row.provider,
      accountEmail: row.accountEmail,
      isActive: row.isActive,
      lastSync: row.lastSyncDate,
      syncFrequency: row.syncFrequency,
      credentialsStored: !!row.credentialsEncrypted,
      apiEndpoint: null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: row.user.id ? {
        id: row.user.id,
        email: row.user.email,
        firstName: row.user.firstName,
        lastName: row.user.lastName,
        accessLevel: row.user.accessLevel,
        username: `${row.user.firstName} ${row.user.lastName}`,
        password: '',
        passwordResetRequired: false,
        createdAt: new Date(),
        updatedAt: new Date()
      } : undefined
    }));
  }

  // Credit Report Uploads (Dispute Hub)
  async getCreditReportUploads(clientId: number): Promise<CreditReportUpload[]> {
    return await db.select().from(creditReportUploads).where(eq(creditReportUploads.userId, clientId));
  }

  async getAllCreditReportUploads(): Promise<CreditReportUpload[]> {
    return await db.select().from(creditReportUploads);
  }

  async getCreditReportUpload(id: number): Promise<CreditReportUpload | undefined> {
    const [upload] = await db.select().from(creditReportUploads).where(eq(creditReportUploads.id, id));
    return upload || undefined;
  }

  async createCreditReportUpload(upload: InsertCreditReportUpload): Promise<CreditReportUpload> {
    const [result] = await db.insert(creditReportUploads).values(upload).returning();
    return result;
  }

  async updateCreditReportUpload(id: number, updates: Partial<CreditReportUpload>): Promise<CreditReportUpload | undefined> {
    const [result] = await db.update(creditReportUploads).set(updates).where(eq(creditReportUploads.id, id)).returning();
    return result || undefined;
  }

  // Credit Report Accounts
  async getCreditReportAccounts(uploadId: number): Promise<CreditReportAccount[]> {
    return await db.select().from(creditReportAccounts).where(eq(creditReportAccounts.uploadId, uploadId));
  }

  async createCreditReportAccount(account: InsertCreditReportAccount): Promise<CreditReportAccount> {
    const [result] = await db.insert(creditReportAccounts).values(account).returning();
    return result;
  }

  async updateCreditReportAccount(id: number, updates: Partial<CreditReportAccount>): Promise<CreditReportAccount | undefined> {
    const [result] = await db.update(creditReportAccounts).set(updates).where(eq(creditReportAccounts.id, id)).returning();
    return result || undefined;
  }

  // Credit Report Inquiries
  async getCreditReportInquiries(uploadId: number): Promise<CreditReportInquiry[]> {
    return await db.select().from(creditReportInquiries).where(eq(creditReportInquiries.uploadId, uploadId));
  }

  async createCreditReportInquiry(inquiry: InsertCreditReportInquiry): Promise<CreditReportInquiry> {
    const [result] = await db.insert(creditReportInquiries).values(inquiry).returning();
    return result;
  }

  // Credit Report Collections
  async getCreditReportCollections(uploadId: number): Promise<CreditReportCollection[]> {
    return await db.select().from(creditReportCollections).where(eq(creditReportCollections.uploadId, uploadId));
  }

  async createCreditReportCollection(collection: InsertCreditReportCollection): Promise<CreditReportCollection> {
    const [result] = await db.insert(creditReportCollections).values(collection).returning();
    return result;
  }

  // Credit Report Public Records
  async getCreditReportPublicRecords(uploadId: number): Promise<CreditReportPublicRecord[]> {
    return await db.select().from(creditReportPublicRecords).where(eq(creditReportPublicRecords.uploadId, uploadId));
  }

  async createCreditReportPublicRecord(record: InsertCreditReportPublicRecord): Promise<CreditReportPublicRecord> {
    const [result] = await db.insert(creditReportPublicRecords).values(record).returning();
    return result;
  }

  // Dispute Items
  async getDisputeItems(uploadId: number): Promise<DisputeItem[]> {
    return await db.select().from(disputeItems).where(eq(disputeItems.uploadId, uploadId));
  }

  async getDisputeItemsByClient(clientId: number): Promise<DisputeItem[]> {
    return await db.select().from(disputeItems).where(eq(disputeItems.clientId, clientId));
  }

  async getDisputeItem(id: number): Promise<DisputeItem | undefined> {
    const [item] = await db.select().from(disputeItems).where(eq(disputeItems.id, id));
    return item || undefined;
  }

  async createDisputeItem(item: InsertDisputeItem): Promise<DisputeItem> {
    const [result] = await db.insert(disputeItems).values(item).returning();
    return result;
  }

  async updateDisputeItem(id: number, updates: Partial<DisputeItem>): Promise<DisputeItem | undefined> {
    const [result] = await db.update(disputeItems).set(updates).where(eq(disputeItems.id, id)).returning();
    return result || undefined;
  }

  // Dispute Letters (New)
  async getDisputeLettersNew(uploadId: number): Promise<DisputeLetterNew[]> {
    return await db.select().from(disputeLettersNew).where(eq(disputeLettersNew.uploadId, uploadId));
  }

  async getAllDisputeLettersNew(): Promise<DisputeLetterNew[]> {
    return await db.select().from(disputeLettersNew);
  }

  async getDisputeLettersNewByClient(clientId: number): Promise<DisputeLetterNew[]> {
    return await db.select().from(disputeLettersNew).where(eq(disputeLettersNew.clientId, clientId));
  }

  async getDisputeLetterNew(id: number): Promise<DisputeLetterNew | undefined> {
    const [letter] = await db.select().from(disputeLettersNew).where(eq(disputeLettersNew.id, id));
    return letter || undefined;
  }

  async createDisputeLetterNew(letter: InsertDisputeLetterNew): Promise<DisputeLetterNew> {
    const [result] = await db.insert(disputeLettersNew).values(letter).returning();
    return result;
  }

  async updateDisputeLetterNew(id: number, updates: Partial<DisputeLetterNew>): Promise<DisputeLetterNew | undefined> {
    const [result] = await db.update(disputeLettersNew).set(updates).where(eq(disputeLettersNew.id, id)).returning();
    return result || undefined;
  }

  // Dispute Calendar Events
  async getDisputeCalendarEvents(clientId: number): Promise<DisputeCalendarEvent[]> {
    return await db.select().from(disputeCalendarEvents).where(eq(disputeCalendarEvents.clientId, clientId));
  }

  async getAllDisputeCalendarEvents(): Promise<DisputeCalendarEvent[]> {
    return await db.select().from(disputeCalendarEvents);
  }

  async getDisputeCalendarEvent(id: number): Promise<DisputeCalendarEvent | undefined> {
    const [event] = await db.select().from(disputeCalendarEvents).where(eq(disputeCalendarEvents.id, id));
    return event || undefined;
  }

  async createDisputeCalendarEvent(event: InsertDisputeCalendarEvent): Promise<DisputeCalendarEvent> {
    const [result] = await db.insert(disputeCalendarEvents).values(event).returning();
    return result;
  }

  async updateDisputeCalendarEvent(id: number, updates: Partial<DisputeCalendarEvent>): Promise<DisputeCalendarEvent | undefined> {
    const [result] = await db.update(disputeCalendarEvents).set(updates).where(eq(disputeCalendarEvents.id, id)).returning();
    return result || undefined;
  }

  // Leads CRM
  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(leads.createdAt);
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead || undefined;
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [result] = await db.insert(leads).values(lead).returning();
    return result;
  }

  async updateLead(id: number, updates: Partial<Lead>): Promise<Lead | undefined> {
    const setData: any = { ...updates };
    if (updates.stage !== undefined) {
      setData.stageUpdatedAt = new Date();
    }
    const [result] = await db.update(leads).set(setData).where(eq(leads.id, id)).returning();
    return result || undefined;
  }

  async deleteLead(id: number): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  // Affiliates
  async getAffiliates(): Promise<Affiliate[]> {
    return await db.select().from(affiliates).orderBy(affiliates.createdAt);
  }

  async getAffiliate(id: number): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, id));
    return affiliate || undefined;
  }

  async getAffiliateByCode(code: string): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.code, code));
    return affiliate || undefined;
  }

  async createAffiliate(affiliate: InsertAffiliate): Promise<Affiliate> {
    const [result] = await db.insert(affiliates).values(affiliate).returning();
    return result;
  }

  async updateAffiliate(id: number, updates: Partial<Affiliate>): Promise<Affiliate | undefined> {
    const [result] = await db.update(affiliates).set(updates).where(eq(affiliates.id, id)).returning();
    return result || undefined;
  }

  // Affiliate Signups
  async getAffiliateSignups(affiliateId: number): Promise<AffiliateSignup[]> {
    return await db.select().from(affiliateSignups).where(eq(affiliateSignups.affiliateId, affiliateId));
  }

  async createAffiliateSignup(signup: InsertAffiliateSignup): Promise<AffiliateSignup> {
    const [result] = await db.insert(affiliateSignups).values(signup).returning();
    return result;
  }

  async updateAffiliateSignup(id: number, updates: Partial<AffiliateSignup>): Promise<AffiliateSignup | undefined> {
    const [result] = await db.update(affiliateSignups).set(updates).where(eq(affiliateSignups.id, id)).returning();
    return result || undefined;
  }

  // Deletion Events (Pay-Per-Delete)
  async getDeletionEvents(clientId: number): Promise<DeletionEvent[]> {
    return await db.select().from(deletionEvents).where(eq(deletionEvents.clientId, clientId));
  }

  async getAllDeletionEvents(): Promise<DeletionEvent[]> {
    return await db.select().from(deletionEvents).orderBy(deletionEvents.deletedAt);
  }

  async createDeletionEvent(event: InsertDeletionEvent): Promise<DeletionEvent> {
    const [result] = await db.insert(deletionEvents).values(event).returning();
    return result;
  }

  async updateDeletionEvent(id: number, updates: Partial<DeletionEvent>): Promise<DeletionEvent | undefined> {
    const [result] = await db.update(deletionEvents).set(updates).where(eq(deletionEvents.id, id)).returning();
    return result || undefined;
  }

  // Credit Score History
  async createCreditScoreHistory(entry: InsertCreditScoreHistory): Promise<CreditScoreHistory> {
    const [result] = await db.insert(creditScoreHistory).values(entry).returning();
    return result;
  }

  async getCreditScoreHistory(userId: number): Promise<CreditScoreHistory[]> {
    return await db.select().from(creditScoreHistory).where(eq(creditScoreHistory.userId, userId)).orderBy(creditScoreHistory.recordedAt);
  }

  async getCreditReportCache(userId: number): Promise<CreditReportCacheEntry | undefined> {
    const [entry] = await db.select().from(creditReportCache).where(eq(creditReportCache.userId, userId));
    return entry || undefined;
  }

  async setCreditReportCache(userId: number, data: any, source: string): Promise<void> {
    await db
      .insert(creditReportCache)
      .values({ userId, data, source })
      .onConflictDoUpdate({
        target: creditReportCache.userId,
        set: { data, source, fetchedAt: new Date(), invalidatedAt: null },
      });
  }

  async invalidateCreditReportCache(userId: number): Promise<void> {
    await db
      .update(creditReportCache)
      .set({ invalidatedAt: new Date() })
      .where(eq(creditReportCache.userId, userId));
  }

  async getClientStats(userId: number, subscriptionTier: string) {
    const ACTIVE_DISPUTE_STATUSES = ["PENDING", "SENT", "DELIVERED", "FOLLOW_UP_REQUIRED"];

    const [issues, allDisputes, scoreHistory] = await Promise.all([
      this.getCreditIssues(userId),
      this.getDisputes(userId),
      this.getCreditScoreHistory(userId),
    ]);

    const activeIssues = issues.filter((i) => i.status === "ACTIVE").length;
    const resolvedIssues = issues.filter((i) => i.status === "RESOLVED").length;
    const disputesInProgress = allDisputes.filter((d) => ACTIVE_DISPUTE_STATUSES.includes(d.status)).length;
    const itemsResolved = resolvedIssues + allDisputes.filter((d) => d.status === "RESOLVED").length;

    const scores = scoreHistory.map((h) => h.score);
    const topScore = scores.length > 0 ? Math.max(...scores) : null;
    const ptsGained = scores.length >= 2 ? scores[scores.length - 1] - scores[0] : null;

    const identityProtectionActive = subscriptionTier === "pro" || subscriptionTier === "elite";

    return { ptsGained, itemsRemoved: resolvedIssues, topScore, activeIssues, disputesInProgress, itemsResolved, identityProtectionActive };
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
  private creditCards: Map<number, CreditCard> = new Map();
  private utilizationOptimizations: Map<number, UtilizationOptimization> = new Map();
  private utilizationAlerts: Map<number, UtilizationAlert> = new Map();
  private loanReadinessProfiles: Map<number, LoanReadinessProfile> = new Map();
  private loanReadinessAssessments: Map<number, LoanReadinessAssessment> = new Map();
  private documentTags: Map<number, DocumentTag> = new Map();
  private studentLoans: Map<number, StudentLoan> = new Map();
  private loanNegotiations: Map<number, LoanNegotiation> = new Map();
  private currentId: number = 1;

  constructor() {
    this.seedData();
    this.seedDocumentTags();
  }

  private seedData() {
    // Create admin user
    const adminUser: User = {
      id: 1,
      firstName: "Admin",
      lastName: "User",
      email: "admin@scoreshift.com",
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

    // Demo Credit Cards for Sarah Wilson (userId 2)
    const demoCard1: CreditCard = {
      id: 1,
      userId: 2,
      cardName: "Chase Sapphire Preferred",
      bank: "Chase",
      creditLimit: 800000, // $8,000 in cents
      currentBalance: 500000, // $5,000 in cents (62.5% utilization)
      minimumPayment: 10000, // $100 in cents
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      interestRate: 1799, // 17.99%
      lastUpdated: new Date(),
      isActive: true,
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // 1 year ago
    };

    const demoCard2: CreditCard = {
      id: 2,
      userId: 2,
      cardName: "Capital One Venture",
      bank: "Capital One",
      creditLimit: 500000, // $5,000 in cents
      currentBalance: 125000, // $1,250 in cents (25% utilization)
      minimumPayment: 2500, // $25 in cents
      dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
      interestRate: 2199, // 21.99%
      lastUpdated: new Date(),
      isActive: true,
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) // 6 months ago
    };

    const demoCard3: CreditCard = {
      id: 3,
      userId: 2,
      cardName: "American Express Gold",
      bank: "American Express",
      creditLimit: 1000000, // $10,000 in cents
      currentBalance: 75000, // $750 in cents (7.5% utilization)
      minimumPayment: 2500, // $25 in cents
      dueDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000), // 22 days from now
      interestRate: 1699, // 16.99%
      lastUpdated: new Date(),
      isActive: true,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 3 months ago
    };

    // Demo Utilization Alerts
    const demoAlert1: UtilizationAlert = {
      id: 1,
      userId: 2,
      cardId: 1,
      alertType: "UTILIZATION_THRESHOLD",
      message: "Chase Sapphire Preferred utilization is 62.5% - significantly impacting your score",
      actionSuggestion: "Pay down $4,200 to get below 30% utilization for maximum score impact",
      currentAmount: 500000,
      suggestedAmount: 420000,
      urgency: "HIGH",
      isRead: false,
      isActive: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    };

    const demoAlert2: UtilizationAlert = {
      id: 2,
      userId: 2,
      cardId: 2,
      alertType: "PAYMENT_DUE",
      message: "Capital One Venture payment due in 8 days",
      actionSuggestion: "Schedule payment to maintain low utilization and avoid late fees",
      currentAmount: 125000,
      suggestedAmount: 2500,
      urgency: "MEDIUM",
      isRead: false,
      isActive: true,
      expiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    };

    this.creditCards.set(1, demoCard1);
    this.creditCards.set(2, demoCard2);
    this.creditCards.set(3, demoCard3);
    this.utilizationAlerts.set(1, demoAlert1);
    this.utilizationAlerts.set(2, demoAlert2);

    this.currentId = 100; // Start from 100 for new entries
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, password: newPassword };
    this.users.set(userId, updatedUser);
    return updatedUser;
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

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort((a, b) => {
      if (a.accessLevel !== b.accessLevel) {
        return a.accessLevel === 'ADMIN' ? -1 : 1;
      }
      return a.firstName.localeCompare(b.firstName);
    });
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

  async getAllCreditMonitoringConnectionsWithUsers(): Promise<(CreditMonitoringConnection & { user?: User })[]> {
    const connections = Array.from(this.creditMonitoringConnections.values());
    const connectionsWithUsers = connections.map(connection => {
      const user = this.users.get(connection.userId);
      return { ...connection, user };
    });
    return connectionsWithUsers;
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

  // Credit Utilization Optimizer methods
  async getCreditCards(userId: number): Promise<CreditCard[]> {
    return Array.from(this.creditCards.values()).filter(card => card.userId === userId);
  }

  async getCreditCard(id: number): Promise<CreditCard | undefined> {
    return this.creditCards.get(id);
  }

  async createCreditCard(insertCard: InsertCreditCard): Promise<CreditCard> {
    const id = this.currentId++;
    const card: CreditCard = { 
      ...insertCard, 
      id, 
      lastUpdated: new Date(),
      createdAt: new Date() 
    };
    this.creditCards.set(id, card);
    return card;
  }

  async updateCreditCard(id: number, updates: Partial<CreditCard>): Promise<CreditCard | undefined> {
    const card = this.creditCards.get(id);
    if (card) {
      const updated = { ...card, ...updates, lastUpdated: new Date() };
      this.creditCards.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getUtilizationOptimizations(userId: number): Promise<UtilizationOptimization[]> {
    return Array.from(this.utilizationOptimizations.values()).filter(opt => opt.userId === userId);
  }

  async createUtilizationOptimization(insertOptimization: InsertUtilizationOptimization): Promise<UtilizationOptimization> {
    const id = this.currentId++;
    const optimization: UtilizationOptimization = { 
      ...insertOptimization, 
      id, 
      createdAt: new Date() 
    };
    this.utilizationOptimizations.set(id, optimization);
    return optimization;
  }

  async getUtilizationAlerts(userId: number): Promise<UtilizationAlert[]> {
    return Array.from(this.utilizationAlerts.values()).filter(alert => alert.userId === userId && alert.isActive);
  }

  async createUtilizationAlert(insertAlert: InsertUtilizationAlert): Promise<UtilizationAlert> {
    const id = this.currentId++;
    const alert: UtilizationAlert = { 
      ...insertAlert, 
      id, 
      createdAt: new Date() 
    };
    this.utilizationAlerts.set(id, alert);
    return alert;
  }

  async markUtilizationAlertAsRead(alertId: number): Promise<UtilizationAlert | undefined> {
    const alert = this.utilizationAlerts.get(alertId);
    if (alert) {
      const updated = { ...alert, isRead: true };
      this.utilizationAlerts.set(alertId, updated);
      return updated;
    }
    return undefined;
  }

  // Loan Readiness Assessment methods
  async getLoanReadinessProfile(userId: number): Promise<LoanReadinessProfile | null> {
    return Array.from(this.loanReadinessProfiles.values()).find(profile => profile.userId === userId) || null;
  }

  async saveLoanReadinessProfile(data: any): Promise<LoanReadinessProfile> {
    const existingProfile = Array.from(this.loanReadinessProfiles.values()).find(p => p.userId === data.userId);
    
    const profile: LoanReadinessProfile = {
      id: existingProfile?.id || this.currentId++,
      ...data,
      lastUpdated: new Date(),
      createdAt: existingProfile?.createdAt || new Date()
    };
    
    this.loanReadinessProfiles.set(profile.id, profile);
    return profile;
  }

  async getLoanReadinessAssessments(userId: number): Promise<LoanReadinessAssessment[]> {
    return Array.from(this.loanReadinessAssessments.values())
      .filter(assessment => assessment.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async saveLoanReadinessAssessment(data: InsertLoanReadinessAssessment): Promise<LoanReadinessAssessment> {
    const id = this.currentId++;
    const assessment: LoanReadinessAssessment = {
      ...data,
      id,
      createdAt: new Date()
    };
    
    this.loanReadinessAssessments.set(id, assessment);
    return assessment;
  }

  // Document Tagging System - MemStorage Implementation
  async updateChatDocument(id: number, updates: Partial<ChatDocument>): Promise<ChatDocument | undefined> {
    const document = this.chatDocuments.find(doc => doc.id === id);
    if (!document) return undefined;
    
    const updatedDocument = { ...document, ...updates, updatedAt: new Date() };
    const index = this.chatDocuments.findIndex(doc => doc.id === id);
    this.chatDocuments[index] = updatedDocument;
    return updatedDocument;
  }

  async getAllDocumentTags(): Promise<DocumentTag[]> {
    return Array.from(this.documentTags.values()).sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.name.localeCompare(b.name);
    });
  }

  async getDocumentTag(id: number): Promise<DocumentTag | undefined> {
    return this.documentTags.get(id);
  }

  async getDocumentTagByName(name: string): Promise<DocumentTag | undefined> {
    return Array.from(this.documentTags.values()).find(tag => tag.name === name);
  }

  async createDocumentTag(tag: InsertDocumentTag): Promise<DocumentTag> {
    const id = this.currentId++;
    const newTag: DocumentTag = {
      ...tag,
      id,
      createdAt: new Date()
    };
    this.documentTags.set(id, newTag);
    return newTag;
  }

  async updateDocumentTag(id: number, updates: Partial<DocumentTag>): Promise<DocumentTag | undefined> {
    const tag = this.documentTags.get(id);
    if (!tag) return undefined;
    
    const updatedTag = { ...tag, ...updates };
    this.documentTags.set(id, updatedTag);
    return updatedTag;
  }

  async incrementTagUsage(tagName: string): Promise<void> {
    const tag = Array.from(this.documentTags.values()).find(t => t.name === tagName);
    if (tag) {
      tag.usageCount = (tag.usageCount || 0) + 1;
      this.documentTags.set(tag.id, tag);
    }
  }

  async getDocumentsByTag(tagName: string): Promise<ChatDocument[]> {
    return this.chatDocuments.filter(doc => 
      [...(doc.smartTags || []), ...(doc.customTags || [])].includes(tagName)
    );
  }

  async searchDocuments(query: string, userId?: number): Promise<ChatDocument[]> {
    const lowerQuery = query.toLowerCase();
    return this.chatDocuments.filter(doc => {
      if (userId && doc.userId !== userId) return false;
      
      const matchesQuery = 
        doc.fileName.toLowerCase().includes(lowerQuery) ||
        doc.extractedText?.toLowerCase().includes(lowerQuery) ||
        [...(doc.smartTags || []), ...(doc.customTags || [])].some(tag => 
          tag.toLowerCase().includes(lowerQuery)
        );
      
      return matchesQuery;
    });
  }

  private seedDocumentTags() {
    // Content Tags
    const contentTags = [
      { name: "Government ID", category: "CONTENT", color: "#3B82F6", description: "Driver's license, passport, state ID" },
      { name: "Social Security", category: "CONTENT", color: "#3B82F6", description: "Social Security card or documentation" },
      { name: "Financial Document", category: "CONTENT", color: "#10B981", description: "Bank statements, financial records" },
      { name: "Credit Report", category: "CONTENT", color: "#8B5CF6", description: "Credit reports from bureaus" },
      { name: "Bureau Response", category: "CONTENT", color: "#F59E0B", description: "Responses from credit bureaus" },
      { name: "Utility Bill", category: "CONTENT", color: "#06B6D4", description: "Utility bills for address verification" },
      { name: "Pay Stub", category: "CONTENT", color: "#EC4899", description: "Employment income verification" },
      { name: "Tax Document", category: "CONTENT", color: "#84CC16", description: "Tax returns and related documents" }
    ];

    // Format Tags  
    const formatTags = [
      { name: "PDF Document", category: "FORMAT", color: "#DC2626", description: "Adobe PDF format" },
      { name: "Image File", category: "FORMAT", color: "#059669", description: "JPEG, PNG, or other image formats" },
      { name: "Scanned Document", category: "FORMAT", color: "#7C3AED", description: "Scanned paper documents" },
      { name: "Digital Native", category: "FORMAT", color: "#0EA5E9", description: "Digitally created documents" }
    ];

    // Purpose Tags
    const purposeTags = [
      { name: "Dispute Evidence", category: "PURPOSE", color: "#DC2626", description: "Documents for credit dispute process" },
      { name: "Identity Verification", category: "PURPOSE", color: "#0891B2", description: "Documents for identity verification" },
      { name: "Income Proof", category: "PURPOSE", color: "#65A30D", description: "Documents proving income" },
      { name: "Address Verification", category: "PURPOSE", color: "#C2410C", description: "Documents for address verification" }
    ];

    // Urgency Tags
    const urgencyTags = [
      { name: "High Priority", category: "URGENCY", color: "#DC2626", description: "Requires immediate attention" },
      { name: "Time Sensitive", category: "URGENCY", color: "#EA580C", description: "Has upcoming deadline" },
      { name: "Standard", category: "URGENCY", color: "#65A30D", description: "Normal processing priority" }
    ];

    // Compliance Tags
    const complianceTags = [
      { name: "FCRA Compliant", category: "COMPLIANCE", color: "#0891B2", description: "Meets Fair Credit Reporting Act requirements" },
      { name: "HIPAA Protected", category: "COMPLIANCE", color: "#7C3AED", description: "Protected health information" },
      { name: "PII Sensitive", category: "COMPLIANCE", color: "#DC2626", description: "Contains personally identifiable information" }
    ];

    // Combine all tags and insert
    const allTags = [...contentTags, ...formatTags, ...purposeTags, ...urgencyTags, ...complianceTags];
    let tagId = 1;
    
    for (const tag of allTags) {
      const documentTag: DocumentTag = {
        id: tagId++,
        name: tag.name,
        category: tag.category,
        color: tag.color,
        description: tag.description,
        isSystemTag: true,
        usageCount: 0,
        createdAt: new Date()
      };
      this.documentTags.set(documentTag.id, documentTag);
    }
    
    // Update currentId to start after tag IDs
    this.currentId = Math.max(this.currentId, tagId);
  }

  // AI Assistant Conversations Implementation
  async getAIConversation(userId: number): Promise<AiConversation[]> {
    return await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.userId, userId))
      .orderBy(aiConversations.createdAt);
  }

  async storeAIMessage(userId: number, message: {
    role: 'user' | 'assistant';
    content: string;
    attachments: { name: string; size: number; type: string }[];
    timestamp: string;
    letterGenerated?: boolean;
    letterUrl?: string;
  }): Promise<AiConversation> {
    const [aiMessage] = await db
      .insert(aiConversations)
      .values({
        userId,
        role: message.role,
        content: message.content,
        attachments: message.attachments,
        letterGenerated: message.letterGenerated || false,
        letterUrl: message.letterUrl || null,
        timestamp: message.timestamp
      })
      .returning();
    return aiMessage;
  }

  // Student Loan Management  
  async getStudentLoansByUserId(userId: number): Promise<StudentLoan[]> {
    return await db.select().from(studentLoans).where(eq(studentLoans.userId, userId));
  }

  async createStudentLoan(data: InsertStudentLoan): Promise<StudentLoan> {
    const [loan] = await db
      .insert(studentLoans)
      .values(data)
      .returning();
    return loan;
  }

  async updateStudentLoan(id: number, data: Partial<StudentLoan>): Promise<StudentLoan> {
    const [loan] = await db
      .update(studentLoans)
      .set(data)
      .where(eq(studentLoans.id, id))
      .returning();
    return loan;
  }

  async getLoanNegotiationsByUserId(userId: number): Promise<LoanNegotiation[]> {
    return await db.select().from(loanNegotiations).where(eq(loanNegotiations.userId, userId));
  }

  async createLoanNegotiation(data: InsertLoanNegotiation): Promise<LoanNegotiation> {
    const [negotiation] = await db
      .insert(loanNegotiations)
      .values(data)
      .returning();
    return negotiation;
  }

  async updateLoanNegotiation(id: number, data: Partial<LoanNegotiation>): Promise<LoanNegotiation> {
    const [negotiation] = await db
      .update(loanNegotiations)
      .set(data)
      .where(eq(loanNegotiations.id, id))
      .returning();
    return negotiation;
  }

  // Credit Report Uploads (Dispute Hub)
  async getCreditReportUploads(clientId: number): Promise<CreditReportUpload[]> {
    return await db.select().from(creditReportUploads).where(eq(creditReportUploads.userId, clientId));
  }

  async getAllCreditReportUploads(): Promise<CreditReportUpload[]> {
    return await db.select().from(creditReportUploads);
  }

  async getCreditReportUpload(id: number): Promise<CreditReportUpload | undefined> {
    const [upload] = await db.select().from(creditReportUploads).where(eq(creditReportUploads.id, id));
    return upload || undefined;
  }

  async createCreditReportUpload(upload: InsertCreditReportUpload): Promise<CreditReportUpload> {
    const [result] = await db.insert(creditReportUploads).values(upload).returning();
    return result;
  }

  async updateCreditReportUpload(id: number, updates: Partial<CreditReportUpload>): Promise<CreditReportUpload | undefined> {
    const [result] = await db.update(creditReportUploads).set(updates).where(eq(creditReportUploads.id, id)).returning();
    return result || undefined;
  }

  // Credit Report Accounts
  async getCreditReportAccounts(uploadId: number): Promise<CreditReportAccount[]> {
    return await db.select().from(creditReportAccounts).where(eq(creditReportAccounts.uploadId, uploadId));
  }

  async createCreditReportAccount(account: InsertCreditReportAccount): Promise<CreditReportAccount> {
    const [result] = await db.insert(creditReportAccounts).values(account).returning();
    return result;
  }

  async updateCreditReportAccount(id: number, updates: Partial<CreditReportAccount>): Promise<CreditReportAccount | undefined> {
    const [result] = await db.update(creditReportAccounts).set(updates).where(eq(creditReportAccounts.id, id)).returning();
    return result || undefined;
  }

  // Credit Report Inquiries
  async getCreditReportInquiries(uploadId: number): Promise<CreditReportInquiry[]> {
    return await db.select().from(creditReportInquiries).where(eq(creditReportInquiries.uploadId, uploadId));
  }

  async createCreditReportInquiry(inquiry: InsertCreditReportInquiry): Promise<CreditReportInquiry> {
    const [result] = await db.insert(creditReportInquiries).values(inquiry).returning();
    return result;
  }

  // Credit Report Collections
  async getCreditReportCollections(uploadId: number): Promise<CreditReportCollection[]> {
    return await db.select().from(creditReportCollections).where(eq(creditReportCollections.uploadId, uploadId));
  }

  async createCreditReportCollection(collection: InsertCreditReportCollection): Promise<CreditReportCollection> {
    const [result] = await db.insert(creditReportCollections).values(collection).returning();
    return result;
  }

  // Credit Report Public Records
  async getCreditReportPublicRecords(uploadId: number): Promise<CreditReportPublicRecord[]> {
    return await db.select().from(creditReportPublicRecords).where(eq(creditReportPublicRecords.uploadId, uploadId));
  }

  async createCreditReportPublicRecord(record: InsertCreditReportPublicRecord): Promise<CreditReportPublicRecord> {
    const [result] = await db.insert(creditReportPublicRecords).values(record).returning();
    return result;
  }

  // Dispute Items
  async getDisputeItems(uploadId: number): Promise<DisputeItem[]> {
    return await db.select().from(disputeItems).where(eq(disputeItems.uploadId, uploadId));
  }

  async getDisputeItemsByClient(clientId: number): Promise<DisputeItem[]> {
    return await db.select().from(disputeItems).where(eq(disputeItems.clientId, clientId));
  }

  async getDisputeItem(id: number): Promise<DisputeItem | undefined> {
    const [item] = await db.select().from(disputeItems).where(eq(disputeItems.id, id));
    return item || undefined;
  }

  async createDisputeItem(item: InsertDisputeItem): Promise<DisputeItem> {
    const [result] = await db.insert(disputeItems).values(item).returning();
    return result;
  }

  async updateDisputeItem(id: number, updates: Partial<DisputeItem>): Promise<DisputeItem | undefined> {
    const [result] = await db.update(disputeItems).set(updates).where(eq(disputeItems.id, id)).returning();
    return result || undefined;
  }

  // Dispute Letters (New)
  async getDisputeLettersNew(uploadId: number): Promise<DisputeLetterNew[]> {
    return await db.select().from(disputeLettersNew).where(eq(disputeLettersNew.uploadId, uploadId));
  }

  async getAllDisputeLettersNew(): Promise<DisputeLetterNew[]> {
    return await db.select().from(disputeLettersNew);
  }

  async getDisputeLettersNewByClient(clientId: number): Promise<DisputeLetterNew[]> {
    return await db.select().from(disputeLettersNew).where(eq(disputeLettersNew.clientId, clientId));
  }

  async getDisputeLetterNew(id: number): Promise<DisputeLetterNew | undefined> {
    const [letter] = await db.select().from(disputeLettersNew).where(eq(disputeLettersNew.id, id));
    return letter || undefined;
  }

  async createDisputeLetterNew(letter: InsertDisputeLetterNew): Promise<DisputeLetterNew> {
    const [result] = await db.insert(disputeLettersNew).values(letter).returning();
    return result;
  }

  async updateDisputeLetterNew(id: number, updates: Partial<DisputeLetterNew>): Promise<DisputeLetterNew | undefined> {
    const [result] = await db.update(disputeLettersNew).set(updates).where(eq(disputeLettersNew.id, id)).returning();
    return result || undefined;
  }

  // Dispute Calendar Events
  async getDisputeCalendarEvents(clientId: number): Promise<DisputeCalendarEvent[]> {
    return await db.select().from(disputeCalendarEvents).where(eq(disputeCalendarEvents.clientId, clientId));
  }

  async getAllDisputeCalendarEvents(): Promise<DisputeCalendarEvent[]> {
    return await db.select().from(disputeCalendarEvents);
  }

  async getDisputeCalendarEvent(id: number): Promise<DisputeCalendarEvent | undefined> {
    const [event] = await db.select().from(disputeCalendarEvents).where(eq(disputeCalendarEvents.id, id));
    return event || undefined;
  }

  async createDisputeCalendarEvent(event: InsertDisputeCalendarEvent): Promise<DisputeCalendarEvent> {
    const [result] = await db.insert(disputeCalendarEvents).values(event).returning();
    return result;
  }

  async updateDisputeCalendarEvent(id: number, updates: Partial<DisputeCalendarEvent>): Promise<DisputeCalendarEvent | undefined> {
    const [result] = await db.update(disputeCalendarEvents).set(updates).where(eq(disputeCalendarEvents.id, id)).returning();
    return result || undefined;
  }

  // Leads CRM
  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(leads.createdAt);
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead || undefined;
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [result] = await db.insert(leads).values(lead).returning();
    return result;
  }

  async updateLead(id: number, updates: Partial<Lead>): Promise<Lead | undefined> {
    const [result] = await db.update(leads).set({ ...updates, stageUpdatedAt: new Date() }).where(eq(leads.id, id)).returning();
    return result || undefined;
  }

  async deleteLead(id: number): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  // Affiliates
  async getAffiliates(): Promise<Affiliate[]> {
    return await db.select().from(affiliates).orderBy(affiliates.createdAt);
  }

  async getAffiliate(id: number): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, id));
    return affiliate || undefined;
  }

  async getAffiliateByCode(code: string): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.code, code));
    return affiliate || undefined;
  }

  async createAffiliate(affiliate: InsertAffiliate): Promise<Affiliate> {
    const [result] = await db.insert(affiliates).values(affiliate).returning();
    return result;
  }

  async updateAffiliate(id: number, updates: Partial<Affiliate>): Promise<Affiliate | undefined> {
    const [result] = await db.update(affiliates).set(updates).where(eq(affiliates.id, id)).returning();
    return result || undefined;
  }

  // Affiliate Signups
  async getAffiliateSignups(affiliateId: number): Promise<AffiliateSignup[]> {
    return await db.select().from(affiliateSignups).where(eq(affiliateSignups.affiliateId, affiliateId));
  }

  async createAffiliateSignup(signup: InsertAffiliateSignup): Promise<AffiliateSignup> {
    const [result] = await db.insert(affiliateSignups).values(signup).returning();
    return result;
  }

  async updateAffiliateSignup(id: number, updates: Partial<AffiliateSignup>): Promise<AffiliateSignup | undefined> {
    const [result] = await db.update(affiliateSignups).set(updates).where(eq(affiliateSignups.id, id)).returning();
    return result || undefined;
  }

  // Deletion Events (Pay-Per-Delete)
  async getDeletionEvents(clientId: number): Promise<DeletionEvent[]> {
    return await db.select().from(deletionEvents).where(eq(deletionEvents.clientId, clientId));
  }

  async getAllDeletionEvents(): Promise<DeletionEvent[]> {
    return await db.select().from(deletionEvents).orderBy(deletionEvents.deletedAt);
  }

  async createDeletionEvent(event: InsertDeletionEvent): Promise<DeletionEvent> {
    const [result] = await db.insert(deletionEvents).values(event).returning();
    return result;
  }

  async updateDeletionEvent(id: number, updates: Partial<DeletionEvent>): Promise<DeletionEvent | undefined> {
    const [result] = await db.update(deletionEvents).set(updates).where(eq(deletionEvents.id, id)).returning();
    return result || undefined;
  }

  // Credit Score History
  async createCreditScoreHistory(entry: InsertCreditScoreHistory): Promise<CreditScoreHistory> {
    const [result] = await db.insert(creditScoreHistory).values(entry).returning();
    return result;
  }

  async getCreditScoreHistory(userId: number): Promise<CreditScoreHistory[]> {
    return await db.select().from(creditScoreHistory).where(eq(creditScoreHistory.userId, userId)).orderBy(creditScoreHistory.recordedAt);
  }

  async getCreditReportCache(userId: number): Promise<CreditReportCacheEntry | undefined> {
    const [entry] = await db.select().from(creditReportCache).where(eq(creditReportCache.userId, userId));
    return entry || undefined;
  }

  async setCreditReportCache(userId: number, data: any, source: string): Promise<void> {
    await db
      .insert(creditReportCache)
      .values({ userId, data, source })
      .onConflictDoUpdate({
        target: creditReportCache.userId,
        set: { data, source, fetchedAt: new Date(), invalidatedAt: null },
      });
  }

  async invalidateCreditReportCache(userId: number): Promise<void> {
    await db
      .update(creditReportCache)
      .set({ invalidatedAt: new Date() })
      .where(eq(creditReportCache.userId, userId));
  }

  async getClientStats(userId: number, subscriptionTier: string) {
    const ACTIVE_DISPUTE_STATUSES = ["PENDING", "SENT", "DELIVERED", "FOLLOW_UP_REQUIRED"];

    const [issues, allDisputes, scoreHistory] = await Promise.all([
      this.getCreditIssues(userId),
      this.getDisputes(userId),
      this.getCreditScoreHistory(userId),
    ]);

    const activeIssues = issues.filter((i) => i.status === "ACTIVE").length;
    const resolvedIssues = issues.filter((i) => i.status === "RESOLVED").length;
    const disputesInProgress = allDisputes.filter((d) => ACTIVE_DISPUTE_STATUSES.includes(d.status)).length;
    const itemsResolved = resolvedIssues + allDisputes.filter((d) => d.status === "RESOLVED").length;

    const scores = scoreHistory.map((h) => h.score);
    const topScore = scores.length > 0 ? Math.max(...scores) : null;
    const ptsGained = scores.length >= 2 ? scores[scores.length - 1] - scores[0] : null;

    const identityProtectionActive = subscriptionTier === "pro" || subscriptionTier === "elite";

    return { ptsGained, itemsRemoved: resolvedIssues, topScore, activeIssues, disputesInProgress, itemsResolved, identityProtectionActive };
  }

  // ── Managed Client ──────────────────────────────────────────────────────────

  async getManagedClientPackage(userId: number): Promise<ManagedClientPackage | undefined> {
    const [pkg] = await db.select().from(managedClientPackages).where(eq(managedClientPackages.userId, userId));
    return pkg || undefined;
  }

  async upsertManagedClientPackage(userId: number, data: Partial<InsertManagedClientPackage>): Promise<ManagedClientPackage> {
    const existing = await this.getManagedClientPackage(userId);
    if (existing) {
      const [updated] = await db.update(managedClientPackages).set(data as any).where(eq(managedClientPackages.userId, userId)).returning();
      return updated;
    }
    const [created] = await db.insert(managedClientPackages).values({ userId, ...(data as any) }).returning();
    return created;
  }

  async getClientCaseActivities(userId: number): Promise<ClientCaseActivity[]> {
    return await db.select().from(clientCaseActivities)
      .where(eq(clientCaseActivities.userId, userId))
      .orderBy(desc(clientCaseActivities.occurredAt));
  }

  async createClientCaseActivity(activity: InsertClientCaseActivity): Promise<ClientCaseActivity> {
    const [created] = await db.insert(clientCaseActivities).values(activity as any).returning();
    return created;
  }

  async updateClientCaseActivity(id: number, updates: Partial<ClientCaseActivity>): Promise<ClientCaseActivity | undefined> {
    const [updated] = await db.update(clientCaseActivities).set(updates as any).where(eq(clientCaseActivities.id, id)).returning();
    return updated || undefined;
  }

  async deleteClientCaseActivity(id: number): Promise<void> {
    await db.delete(clientCaseActivities).where(eq(clientCaseActivities.id, id));
  }

  async getClientDocuments(userId: number): Promise<ClientDocument[]> {
    return await db.select().from(clientDocuments).where(eq(clientDocuments.userId, userId));
  }

  async createClientDocument(doc: InsertClientDocument): Promise<ClientDocument> {
    const [created] = await db.insert(clientDocuments).values(doc as any).returning();
    return created;
  }

  async updateClientDocument(id: number, updates: Partial<ClientDocument>): Promise<ClientDocument | undefined> {
    const [updated] = await db.update(clientDocuments).set(updates as any).where(eq(clientDocuments.id, id)).returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
