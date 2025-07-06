import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  accessLevel: text("access_level").notNull().default("STANDARD"), // STANDARD, CLIENT_VIEWER, BETA_TESTER, ADMIN
  isTestUser: boolean("is_test_user").default(false),
  testingNotes: text("testing_notes"), // Notes about their testing feedback
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const creditReports = pgTable("credit_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  creditScore: integer("credit_score").notNull(),
  creditRating: text("credit_rating").notNull(), // POOR, FAIR, GOOD, EXCELLENT
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  utilizationRate: real("utilization_rate").notNull(),
  accountAge: integer("account_age").notNull(), // in months
});

export const creditIssues = pgTable("credit_issues", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // COLLECTION, LATE_PAYMENT, CHARGE_OFF, INQUIRY
  title: text("title").notNull(),
  description: text("description").notNull(),
  amount: real("amount"),
  impact: integer("impact").notNull(), // negative points
  dateAdded: timestamp("date_added").notNull(),
  status: text("status").notNull().default("ACTIVE"), // ACTIVE, DISPUTED, RESOLVED
  creditor: text("creditor").notNull(),
});

export const disputes = pgTable("disputes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  issueId: integer("issue_id").notNull(),
  bureau: text("bureau").notNull(), // EQUIFAX, EXPERIAN, TRANSUNION
  status: text("status").notNull().default("PENDING"), // PENDING, SENT, DELIVERED, RESOLVED, REJECTED, FOLLOW_UP_REQUIRED
  dateSent: timestamp("date_sent").defaultNow().notNull(),
  expectedResponse: timestamp("expected_response").notNull(),
  actualResponse: timestamp("actual_response"),
  letterContent: text("letter_content").notNull(),
  uspsTrackingNumber: text("usps_tracking_number"),
  deliveryDate: timestamp("delivery_date"),
  followUpDate: timestamp("follow_up_date"), // 14 days after delivery
  alertSent: boolean("alert_sent").default(false)
});

export const creditGoals = pgTable("credit_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  targetScore: integer("target_score").notNull(),
  currentScore: integer("current_score").notNull(),
  targetDate: timestamp("target_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const educationalContent = pgTable("educational_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // CREDIT_SCORES, DISPUTE_PROCESS, CREDIT_BUILDING
  imageUrl: text("image_url"),
  readTime: integer("read_time").notNull(), // in minutes
});

export const creditBuildingActions = pgTable("credit_building_actions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // SECURED_CARD, UTILIZATION_REDUCTION, PAYMENT_HISTORY
  title: text("title").notNull(),
  description: text("description").notNull(),
  potentialImpact: integer("potential_impact").notNull(), // positive points
  timeframe: text("timeframe").notNull(), // "3-6 months", "6-12 months"
  status: text("status").notNull().default("RECOMMENDED"), // RECOMMENDED, IN_PROGRESS, COMPLETED
  priority: text("priority").notNull(), // HIGH, MEDIUM, LOW
});

export const testingFeedback = pgTable("testing_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  feature: text("feature").notNull(), // Which feature they're testing
  rating: integer("rating").notNull(), // 1-5 stars
  feedback: text("feedback").notNull(),
  bugReport: text("bug_report"), // If they found bugs
  suggestions: text("suggestions"), // Feature suggestions
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const betaAccess = pgTable("beta_access", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  accessCode: text("access_code").notNull().unique(), // Special codes for your clients
  features: text("features").array().notNull(), // Which features they can access
  expiresAt: timestamp("expires_at"), // Optional expiration
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const creditMonitoringConnections = pgTable("credit_monitoring_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  provider: text("provider").notNull(), // 'IDENTITY_IQ', 'EXPERIAN', 'SMART_CREDIT'
  accountEmail: text("account_email").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastSyncDate: timestamp("last_sync_date"),
  syncFrequency: text("sync_frequency").default("DAILY").notNull(), // 'DAILY', 'WEEKLY', 'MONTHLY'
  credentialsEncrypted: text("credentials_encrypted"), // Encrypted login credentials
  autoSyncEnabled: boolean("auto_sync_enabled").default(true).notNull(),
  syncErrorMessage: text("sync_error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const creditFileSyncHistory = pgTable("credit_file_sync_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  connectionId: integer("connection_id").references(() => creditMonitoringConnections.id).notNull(),
  provider: text("provider").notNull(),
  syncStatus: text("sync_status").notNull(), // 'SUCCESS', 'FAILED', 'PARTIAL'
  issuesFound: integer("issues_found").default(0).notNull(),
  issuesAdded: integer("issues_added").default(0).notNull(),
  issuesUpdated: integer("issues_updated").default(0).notNull(),
  scoreChange: integer("score_change"), // Change in credit score from this sync
  syncDetails: text("sync_details"), // JSON string with detailed sync information
  errorMessage: text("error_message"),
  syncDate: timestamp("sync_date").defaultNow().notNull(),
});

// Bureau Response Analysis
export const bureauResponses = pgTable("bureau_responses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  disputeId: integer("dispute_id").references(() => disputes.id),
  bureau: text("bureau", { enum: ["EXPERIAN", "EQUIFAX", "TRANSUNION"] }).notNull(),
  responseType: text("response_type", { enum: ["VERIFIED", "DELETED", "UPDATED", "FRIVOLOUS", "PARTIAL"] }).notNull(),
  responseText: text("response_text").notNull(),
  responseDate: timestamp("response_date").notNull(),
  documentUrl: text("document_url"), // URL to uploaded response document
  aiAnalysisId: integer("ai_analysis_id").references(() => bureauResponseAnalysis.id),
  nextStepGenerated: boolean("next_step_generated").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const bureauResponseAnalysis = pgTable("bureau_response_analysis", {
  id: serial("id").primaryKey(),
  responseId: integer("response_id").notNull().references(() => bureauResponses.id),
  analysisResult: text("analysis_result").notNull(), // JSON string with AI analysis
  rejectionReasons: text("rejection_reasons").array(), // Array of identified rejection reasons
  recommendedActions: text("recommended_actions").notNull(), // JSON string with next steps
  successProbability: integer("success_probability"), // 0-100 percentage
  strategyType: text("strategy_type", { enum: ["ESCALATION", "REWRITE", "DOCUMENTATION", "VALIDATION", "LEGAL"] }).notNull(),
  nextDisputeTemplate: text("next_dispute_template"), // Generated follow-up dispute letter
  confidenceScore: integer("confidence_score").notNull(), // AI confidence in analysis (0-100)
  processingTime: integer("processing_time"), // Time taken for analysis in milliseconds
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCreditReportSchema = createInsertSchema(creditReports).omit({ id: true, lastUpdated: true });
export const insertCreditIssueSchema = createInsertSchema(creditIssues).omit({ id: true });
export const insertDisputeSchema = createInsertSchema(disputes).omit({ id: true, dateSent: true, actualResponse: true });
export const insertCreditGoalSchema = createInsertSchema(creditGoals).omit({ id: true, createdAt: true });
export const insertEducationalContentSchema = createInsertSchema(educationalContent).omit({ id: true });
export const insertCreditBuildingActionSchema = createInsertSchema(creditBuildingActions).omit({ id: true });
export const insertTestingFeedbackSchema = createInsertSchema(testingFeedback).omit({ id: true, createdAt: true });
export const insertBetaAccessSchema = createInsertSchema(betaAccess).omit({ id: true, createdAt: true });
export const insertCreditMonitoringConnectionSchema = createInsertSchema(creditMonitoringConnections).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCreditFileSyncHistorySchema = createInsertSchema(creditFileSyncHistory).omit({ id: true, syncDate: true });
export const insertBureauResponseSchema = createInsertSchema(bureauResponses).omit({ id: true, createdAt: true });
export const insertBureauResponseAnalysisSchema = createInsertSchema(bureauResponseAnalysis).omit({ id: true, createdAt: true });

// Credit Utilization Optimizer
export const creditCards = pgTable("credit_cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  cardName: text("card_name").notNull(),
  bank: text("bank").notNull(),
  creditLimit: integer("credit_limit").notNull(),
  currentBalance: integer("current_balance").notNull().default(0),
  minimumPayment: integer("minimum_payment").notNull().default(0),
  dueDate: timestamp("due_date").notNull(),
  interestRate: integer("interest_rate").notNull(), // stored as basis points (e.g., 1899 = 18.99%)
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const utilizationOptimizations = pgTable("utilization_optimizations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  optimizationType: text("optimization_type", { enum: ["SPENDING", "PAYMENT", "BALANCE_TRANSFER", "LIMIT_INCREASE"] }).notNull(),
  cardId: integer("card_id").references(() => creditCards.id),
  recommendation: text("recommendation").notNull(),
  currentUtilization: integer("current_utilization").notNull(), // percentage as integer (e.g., 85 = 85%)
  targetUtilization: integer("target_utilization").notNull(),
  potentialScoreImpact: integer("potential_score_impact").notNull(),
  actionRequired: text("action_required").notNull(),
  amountSuggestion: integer("amount_suggestion"), // dollar amount in cents
  priority: text("priority", { enum: ["HIGH", "MEDIUM", "LOW"] }).notNull(),
  timeframe: text("timeframe").notNull(), // e.g., "Within 7 days"
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const utilizationAlerts = pgTable("utilization_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  cardId: integer("card_id").references(() => creditCards.id),
  alertType: text("alert_type", { enum: ["SPENDING_LIMIT", "UTILIZATION_THRESHOLD", "PAYMENT_DUE", "OPTIMIZATION_OPPORTUNITY"] }).notNull(),
  message: text("message").notNull(),
  actionSuggestion: text("action_suggestion").notNull(),
  currentAmount: integer("current_amount"), // current spending/balance in cents
  suggestedAmount: integer("suggested_amount"), // suggested spending/payment in cents
  urgency: text("urgency", { enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"] }).notNull(),
  isRead: boolean("is_read").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const insertCreditCardSchema = createInsertSchema(creditCards).omit({ id: true, createdAt: true, lastUpdated: true });
export const insertUtilizationOptimizationSchema = createInsertSchema(utilizationOptimizations).omit({ id: true, createdAt: true, completedAt: true });
export const insertUtilizationAlertSchema = createInsertSchema(utilizationAlerts).omit({ id: true, createdAt: true });

// Mortgage/Loan Readiness Score
export const loanReadinessProfiles = pgTable("loan_readiness_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  annualIncome: integer("annual_income").notNull(), // in cents
  monthlyIncome: integer("monthly_income").notNull(), // in cents
  monthlyDebtPayments: integer("monthly_debt_payments").notNull().default(0), // in cents
  employmentStatus: text("employment_status", { enum: ["EMPLOYED", "SELF_EMPLOYED", "UNEMPLOYED", "RETIRED", "CONTRACTOR"] }).notNull(),
  employmentLength: integer("employment_length").notNull(), // in months
  jobTitle: text("job_title"),
  employer: text("employer"),
  savingsAmount: integer("savings_amount").notNull().default(0), // in cents
  checkingAmount: integer("checking_amount").notNull().default(0), // in cents
  investmentAmount: integer("investment_amount").notNull().default(0), // in cents
  hasOtherAssets: boolean("has_other_assets").notNull().default(false),
  otherAssetsValue: integer("other_assets_value").default(0), // in cents
  housingStatus: text("housing_status", { enum: ["RENT", "OWN", "LIVE_WITH_FAMILY", "OTHER"] }).notNull(),
  monthlyRentMortgage: integer("monthly_rent_mortgage").notNull().default(0), // in cents
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const loanReadinessAssessments = pgTable("loan_readiness_assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  profileId: integer("profile_id").notNull().references(() => loanReadinessProfiles.id),
  loanType: text("loan_type", { enum: ["MORTGAGE", "AUTO", "PERSONAL", "BUSINESS"] }).notNull(),
  loanAmount: integer("loan_amount").notNull(), // in cents
  downPayment: integer("down_payment").notNull().default(0), // in cents
  readinessScore: integer("readiness_score").notNull(), // 0-100
  approvalProbability: integer("approval_probability").notNull(), // 0-100
  debtToIncomeRatio: integer("debt_to_income_ratio").notNull(), // as percentage (e.g., 35 = 35%)
  recommendedActions: text("recommended_actions").array(),
  timelineToQualification: text("timeline_to_qualification"), // e.g., "3-6 months"
  estimatedInterestRate: integer("estimated_interest_rate"), // in basis points
  monthlyPaymentEstimate: integer("monthly_payment_estimate"), // in cents
  strengths: text("strengths").array(),
  concerns: text("concerns").array(),
  nextSteps: text("next_steps").array(),
  aiInsights: text("ai_insights"), // JSON string with detailed AI analysis
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const insertLoanReadinessProfileSchema = createInsertSchema(loanReadinessProfiles).omit({ id: true, createdAt: true, lastUpdated: true });
export const insertLoanReadinessAssessmentSchema = createInsertSchema(loanReadinessAssessments).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type CreditReport = typeof creditReports.$inferSelect;
export type InsertCreditReport = z.infer<typeof insertCreditReportSchema>;
export type CreditIssue = typeof creditIssues.$inferSelect;
export type InsertCreditIssue = z.infer<typeof insertCreditIssueSchema>;
export type Dispute = typeof disputes.$inferSelect;
export type InsertDispute = z.infer<typeof insertDisputeSchema>;
export type CreditGoal = typeof creditGoals.$inferSelect;
export type InsertCreditGoal = z.infer<typeof insertCreditGoalSchema>;
export type EducationalContent = typeof educationalContent.$inferSelect;
export type InsertEducationalContent = z.infer<typeof insertEducationalContentSchema>;
export type CreditBuildingAction = typeof creditBuildingActions.$inferSelect;
export type InsertCreditBuildingAction = z.infer<typeof insertCreditBuildingActionSchema>;
export type TestingFeedback = typeof testingFeedback.$inferSelect;
export type InsertTestingFeedback = z.infer<typeof insertTestingFeedbackSchema>;
export type BetaAccess = typeof betaAccess.$inferSelect;
export type InsertBetaAccess = z.infer<typeof insertBetaAccessSchema>;
export type CreditMonitoringConnection = typeof creditMonitoringConnections.$inferSelect;
export type InsertCreditMonitoringConnection = z.infer<typeof insertCreditMonitoringConnectionSchema>;
export type CreditFileSyncHistory = typeof creditFileSyncHistory.$inferSelect;
export type InsertCreditFileSyncHistory = z.infer<typeof insertCreditFileSyncHistorySchema>;
export type BureauResponse = typeof bureauResponses.$inferSelect;
export type InsertBureauResponse = z.infer<typeof insertBureauResponseSchema>;
export type BureauResponseAnalysis = typeof bureauResponseAnalysis.$inferSelect;
export type InsertBureauResponseAnalysis = z.infer<typeof insertBureauResponseAnalysisSchema>;
export type CreditCard = typeof creditCards.$inferSelect;
export type InsertCreditCard = z.infer<typeof insertCreditCardSchema>;
export type UtilizationOptimization = typeof utilizationOptimizations.$inferSelect;
export type InsertUtilizationOptimization = z.infer<typeof insertUtilizationOptimizationSchema>;
export type UtilizationAlert = typeof utilizationAlerts.$inferSelect;
export type InsertUtilizationAlert = z.infer<typeof insertUtilizationAlertSchema>;
export type LoanReadinessProfile = typeof loanReadinessProfiles.$inferSelect;
export type InsertLoanReadinessProfile = z.infer<typeof insertLoanReadinessProfileSchema>;
export type LoanReadinessAssessment = typeof loanReadinessAssessments.$inferSelect;
export type InsertLoanReadinessAssessment = z.infer<typeof insertLoanReadinessAssessmentSchema>;
