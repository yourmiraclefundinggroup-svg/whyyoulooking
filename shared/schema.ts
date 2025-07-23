import { pgTable, text, serial, integer, boolean, timestamp, real, date, json, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  accessLevel: text("access_level").notNull().default("STANDARD"), // STANDARD, CLIENT_VIEWER, BETA_TESTER, ADMIN
  isTestUser: boolean("is_test_user").default(false),
  testingNotes: text("testing_notes"), // Notes about their testing feedback
  passwordResetRequired: boolean("password_reset_required").default(true), // Force password reset on first login
  studentLoansEnrolled: boolean("student_loans_enrolled").default(false),
  monthlyStudentLoanPayment: decimal("monthly_student_loan_payment", { precision: 10, scale: 2 }),
  employmentInfo: json("employment_info").$type<{
    employer?: string;
    income?: number;
    employmentType?: string; // for PSLF eligibility
    startDate?: string;
  }>(),
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

export const studentLoans = pgTable("student_loans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  servicerName: text("servicer_name").notNull(),
  loanBalance: decimal("loan_balance", { precision: 12, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  monthlyPayment: decimal("monthly_payment", { precision: 10, scale: 2 }).notNull(),
  repaymentPlan: text("repayment_plan").notNull(),
  loanType: text("loan_type").notNull(), // FEDERAL, PRIVATE
  originalBalance: decimal("original_balance", { precision: 12, scale: 2 }),
  graduationDate: date("graduation_date"),
  status: text("status").notNull().default("ACTIVE"), // ACTIVE, PAID_OFF, DEFAULT, FORBEARANCE
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const loanNegotiations = pgTable("loan_negotiations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  loanId: integer("loan_id"),
  negotiationType: text("negotiation_type").notNull(), // PAYMENT_REDUCTION, FORBEARANCE, FORGIVENESS, CONSOLIDATION
  status: text("status").notNull().default("INITIATED"), // INITIATED, IN_PROGRESS, COMPLETED, REJECTED
  documentsGenerated: text("documents_generated").array(),
  outcome: text("outcome"),
  savingsAchieved: decimal("savings_achieved", { precision: 10, scale: 2 }),
  monthlyPaymentBefore: decimal("monthly_payment_before", { precision: 10, scale: 2 }),
  monthlyPaymentAfter: decimal("monthly_payment_after", { precision: 10, scale: 2 }),
  negotiationNotes: text("negotiation_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const loanDocuments = pgTable("loan_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  negotiationId: integer("negotiation_id"),
  documentType: text("document_type").notNull(), // HARDSHIP_LETTER, PAYMENT_MODIFICATION, CONSOLIDATION_APP
  fileName: text("file_name").notNull(),
  content: text("content").notNull(),
  generated: boolean("generated").default(true), // true if AI generated, false if uploaded
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  responseId: integer("response_id").notNull(),
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
export const insertDisputeSchema = createInsertSchema(disputes).omit({ 
  id: true, 
  dateSent: true, 
  actualResponse: true, 
  deliveryDate: true, 
  followUpDate: true, 
  alertSent: true 
}).extend({
  expectedResponse: z.string().transform((val) => new Date(val))
});
export const insertCreditGoalSchema = createInsertSchema(creditGoals).omit({ id: true, createdAt: true });
export const insertEducationalContentSchema = createInsertSchema(educationalContent).omit({ id: true });
export const insertCreditBuildingActionSchema = createInsertSchema(creditBuildingActions).omit({ id: true });
export const insertTestingFeedbackSchema = createInsertSchema(testingFeedback).omit({ id: true, createdAt: true });
export const insertBetaAccessSchema = createInsertSchema(betaAccess).omit({ id: true, createdAt: true });
export const insertCreditMonitoringConnectionSchema = createInsertSchema(creditMonitoringConnections).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCreditFileSyncHistorySchema = createInsertSchema(creditFileSyncHistory).omit({ id: true, syncDate: true });
export const insertBureauResponseSchema = createInsertSchema(bureauResponses).omit({ id: true, createdAt: true });
export const insertBureauResponseAnalysisSchema = createInsertSchema(bureauResponseAnalysis).omit({ id: true, createdAt: true });
export const insertStudentLoanSchema = createInsertSchema(studentLoans).omit({ id: true, createdAt: true });
export const insertLoanNegotiationSchema = createInsertSchema(loanNegotiations).omit({ id: true, createdAt: true, completedAt: true });
export const insertLoanDocumentSchema = createInsertSchema(loanDocuments).omit({ id: true, createdAt: true });

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

// Chat System
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  senderType: text("sender_type", { enum: ["CLIENT", "ADMIN"] }).notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const chatDocuments = pgTable("chat_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  messageId: integer("message_id").references(() => chatMessages.id),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(), // in bytes
  fileType: text("file_type").notNull(), // MIME type
  documentType: text("document_type", { 
    enum: ["ID", "SSN_CARD", "BANK_STATEMENT", "BUREAU_RESPONSE", "INCOME_VERIFICATION", "OTHER"] 
  }).notNull(),
  filePath: text("file_path").notNull(), // Server file path
  uploadedBy: text("uploaded_by", { enum: ["CLIENT", "ADMIN"] }).notNull(),
  isEncrypted: boolean("is_encrypted").notNull().default(true),
  smartTags: text("smart_tags").array(), // AI-generated tags
  customTags: text("custom_tags").array(), // User-added tags
  extractedText: text("extracted_text"), // OCR/text extraction for analysis
  confidence: real("confidence"), // AI tagging confidence score
  needsReview: boolean("needs_review").default(false), // Flag for low confidence tags
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// AI Assistant Conversations
export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  attachments: json("attachments").$type<{ name: string; size: number; type: string }[]>().default([]),
  letterGenerated: boolean("letter_generated").default(false),
  letterUrl: text("letter_url"),
  timestamp: text("timestamp").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const documentTags = pgTable("document_tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category").notNull(), // CONTENT, FORMAT, PURPOSE, URGENCY, COMPLIANCE
  color: text("color").notNull().default("#3B82F6"), // Hex color for UI
  description: text("description"),
  isSystemTag: boolean("is_system_tag").default(true), // System vs user-created
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertChatDocumentSchema = createInsertSchema(chatDocuments).omit({ id: true, createdAt: true });
export const insertDocumentTagSchema = createInsertSchema(documentTags).omit({ id: true, createdAt: true });
export const insertAiConversationSchema = createInsertSchema(aiConversations).omit({ id: true, createdAt: true });

// Types for Smart Document Tagging
export type DocumentTag = typeof documentTags.$inferSelect;
export type InsertDocumentTag = typeof insertDocumentTagSchema._type;
export type ChatDocument = typeof chatDocuments.$inferSelect;
export type InsertChatDocument = typeof insertChatDocumentSchema._type;
export type InsertChatMessage = typeof insertChatMessageSchema._type;
export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = typeof insertAiConversationSchema._type;

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
export type StudentLoan = typeof studentLoans.$inferSelect;
export type InsertStudentLoan = z.infer<typeof insertStudentLoanSchema>;
export type LoanNegotiation = typeof loanNegotiations.$inferSelect;
export type InsertLoanNegotiation = z.infer<typeof insertLoanNegotiationSchema>;
export type LoanDocument = typeof loanDocuments.$inferSelect;
export type InsertLoanDocument = z.infer<typeof insertLoanDocumentSchema>;
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

// Goodwill Letters
export const goodwillLetters = pgTable("goodwill_letters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  creditorName: text("creditor_name").notNull(),
  accountNumber: text("account_number").notNull(),
  latePaymentDate: date("late_payment_date").notNull(),
  paymentAmount: integer("payment_amount").notNull(), // in cents
  circumstance: text("circumstance").notNull(),
  customerRelationshipYears: integer("customer_relationship_years").notNull(),
  letterContent: text("letter_content").notNull(),
  personalizations: json("personalizations"),
  status: text("status", { enum: ["DRAFT", "SENT", "RESPONDED", "SUCCESSFUL", "REJECTED"] }).notNull().default("DRAFT"),
  sentDate: date("sent_date"),
  responseDate: date("response_date"),
  outcome: text("outcome"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Credit Mix Optimization
export const creditMixOptimizations = pgTable("credit_mix_optimizations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  currentMixScore: integer("current_mix_score").notNull(), // 0-100
  targetMixScore: integer("target_mix_score").notNull(), // 0-100
  improvementPotential: integer("improvement_potential").notNull(), // points
  recommendedProducts: json("recommended_products").notNull(),
  currentProducts: json("current_products").notNull(),
  aiAnalysis: text("ai_analysis").notNull(),
  actionPlan: json("action_plan").notNull(),
  preApprovedOffers: json("pre_approved_offers"),
  implementationTimeline: text("implementation_timeline").notNull(),
  riskAssessment: text("risk_assessment").notNull(),
  status: text("status", { enum: ["ACTIVE", "COMPLETED", "PAUSED"] }).notNull().default("ACTIVE"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Identity Theft Recovery
export const identityTheftCases = pgTable("identity_theft_cases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  detectionDate: date("detection_date").notNull(),
  fraudulentAccounts: json("fraudulent_accounts").notNull(),
  affectedBureaus: text("affected_bureaus").array().notNull(),
  policeReportNumber: text("police_report_number"),
  policeReportDate: date("police_report_date"),
  recoverySteps: json("recovery_steps").notNull(),
  completedSteps: json("completed_steps").notNull(),
  status: text("status", { enum: ["ACTIVE", "COMPLETED", "PAUSED", "ESCALATED"] }).notNull().default("ACTIVE"),
  estimatedCompletionDate: date("estimated_completion_date"),
  aiDetectionConfidence: integer("ai_detection_confidence").notNull(), // 0-100
  recoveryProgress: integer("recovery_progress").notNull().default(0), // 0-100
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Rent/Utility Reporting
export const rentUtilityReporting = pgTable("rent_utility_reporting", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  serviceProvider: text("service_provider").notNull(), // RentTrack, Rental Kharma, etc.
  reportingType: text("reporting_type", { enum: ["RENT", "UTILITIES", "BOTH"] }).notNull(),
  monthlyAmount: integer("monthly_amount").notNull(), // in cents
  paymentHistory: json("payment_history"), // array of payment records
  enrollmentDate: date("enrollment_date").notNull(),
  scoreImpact: integer("score_impact"), // estimated points
  status: text("status", { enum: ["PENDING", "ACTIVE", "PAUSED", "CANCELLED"] }).notNull().default("PENDING"),
  aiOptimizationSuggestions: json("ai_optimization_suggestions"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Credit Card Approval Predictor
export const creditCardPredictions = pgTable("credit_card_predictions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  cardName: text("card_name").notNull(),
  bank: text("bank").notNull(),
  cardType: text("card_type"), // rewards, cashback, travel, etc.
  creditLimit: integer("credit_limit"), // in cents
  annualFee: integer("annual_fee"), // in cents
  approvalProbability: integer("approval_probability").notNull(), // 0-100
  recommendedTiming: text("recommended_timing"),
  preQualificationStatus: text("prequalification_status", { enum: ["AVAILABLE", "NOT_AVAILABLE", "CHECKING"] }),
  aiAnalysis: text("ai_analysis").notNull(),
  requirements: json("requirements"),
  benefits: json("benefits"),
  hardInquiryRisk: text("hard_inquiry_risk", { enum: ["LOW", "MEDIUM", "HIGH"] }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Financial Behavior Coaching
export const financialBehaviorProfiles = pgTable("financial_behavior_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  spendingPatterns: json("spending_patterns").notNull(),
  budgetGoals: json("budget_goals"),
  currentBudget: json("current_budget"),
  behavioralTriggers: json("behavioral_triggers"),
  improvementAreas: json("improvement_areas"),
  coachingPlan: json("coaching_plan").notNull(),
  progressMetrics: json("progress_metrics"),
  rewardsEarned: integer("rewards_earned").notNull().default(0),
  lastAnalysisDate: date("last_analysis_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Bank Account Integration
export const bankAccountConnections = pgTable("bank_account_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bankName: text("bank_name").notNull(),
  accountType: text("account_type", { enum: ["CHECKING", "SAVINGS", "CREDIT"] }).notNull(),
  accountNumber: text("account_number"), // encrypted/masked
  connectionStatus: text("connection_status", { enum: ["CONNECTED", "DISCONNECTED", "ERROR", "PENDING"] }).notNull(),
  lastSync: timestamp("last_sync"),
  autoPaymentOptimization: boolean("auto_payment_optimization").notNull().default(false),
  paymentSchedule: json("payment_schedule"),
  balanceHistory: json("balance_history"),
  aiRecommendations: json("ai_recommendations"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Tax Software Integration
export const taxIntegrations = pgTable("tax_integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  taxSoftware: text("tax_software").notNull(), // TurboTax, H&R Block, etc.
  taxYear: integer("tax_year").notNull(),
  incomeVerification: json("income_verification"),
  employmentVerification: json("employment_verification"),
  verificationStatus: text("verification_status", { enum: ["PENDING", "VERIFIED", "FAILED", "EXPIRED"] }).notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Employment Verification
export const employmentVerifications = pgTable("employment_verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  employer: text("employer").notNull(),
  jobTitle: text("job_title").notNull(),
  employmentType: text("employment_type", { enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "SELF_EMPLOYED"] }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  verificationMethod: text("verification_method", { enum: ["HR_SYSTEM", "PAYSTUB", "TAX_RETURN", "MANUAL"] }).notNull(),
  verificationStatus: text("verification_status", { enum: ["PENDING", "VERIFIED", "FAILED"] }).notNull(),
  hrSystemConnection: json("hr_system_connection"),
  documents: json("documents"),
  lastVerified: timestamp("last_verified"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Dispute Success Prediction
export const disputeSuccessPredictions = pgTable("dispute_success_predictions", {
  id: serial("id").primaryKey(),
  disputeId: integer("dispute_id").notNull().references(() => disputes.id),
  successProbability: integer("success_probability").notNull(), // 0-100
  predictionFactors: json("prediction_factors").notNull(),
  historicalData: json("historical_data"),
  modelVersion: text("model_version").notNull(),
  confidenceScore: integer("confidence_score").notNull(), // 0-100
  recommendedStrategy: text("recommended_strategy").notNull(),
  estimatedTimeframe: text("estimated_timeframe"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Machine Learning Training Data
export const mlTrainingData = pgTable("ml_training_data", {
  id: serial("id").primaryKey(),
  dataType: text("data_type", { enum: ["DISPUTE_OUTCOME", "CREDIT_IMPROVEMENT", "BEHAVIOR_PATTERN"] }).notNull(),
  inputFeatures: json("input_features").notNull(),
  outputResult: json("output_result").notNull(),
  modelVersion: text("model_version").notNull(),
  accuracy: integer("accuracy"), // 0-100
  isTrainingData: boolean("is_training_data").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Insert schemas for new tables
export const insertGoodwillLetterSchema = createInsertSchema(goodwillLetters).omit({ id: true, createdAt: true });
export const insertCreditMixOptimizationSchema = createInsertSchema(creditMixOptimizations).omit({ id: true, createdAt: true });
export const insertIdentityTheftCaseSchema = createInsertSchema(identityTheftCases).omit({ id: true, createdAt: true });
export const insertRentUtilityReportingSchema = createInsertSchema(rentUtilityReporting).omit({ id: true, createdAt: true });
export const insertCreditCardPredictionSchema = createInsertSchema(creditCardPredictions).omit({ id: true, createdAt: true });
export const insertFinancialBehaviorProfileSchema = createInsertSchema(financialBehaviorProfiles).omit({ id: true, createdAt: true });
export const insertBankAccountConnectionSchema = createInsertSchema(bankAccountConnections).omit({ id: true, createdAt: true });
export const insertTaxIntegrationSchema = createInsertSchema(taxIntegrations).omit({ id: true, createdAt: true, lastUpdated: true });
export const insertEmploymentVerificationSchema = createInsertSchema(employmentVerifications).omit({ id: true, createdAt: true });
export const insertDisputeSuccessPredictionSchema = createInsertSchema(disputeSuccessPredictions).omit({ id: true, createdAt: true });
export const insertMlTrainingDataSchema = createInsertSchema(mlTrainingData).omit({ id: true, createdAt: true });

// Types for new tables
export type GoodwillLetter = typeof goodwillLetters.$inferSelect;
export type InsertGoodwillLetter = z.infer<typeof insertGoodwillLetterSchema>;
export type CreditMixOptimization = typeof creditMixOptimizations.$inferSelect;
export type InsertCreditMixOptimization = z.infer<typeof insertCreditMixOptimizationSchema>;
export type IdentityTheftCase = typeof identityTheftCases.$inferSelect;
export type InsertIdentityTheftCase = z.infer<typeof insertIdentityTheftCaseSchema>;
export type RentUtilityReporting = typeof rentUtilityReporting.$inferSelect;
export type InsertRentUtilityReporting = z.infer<typeof insertRentUtilityReportingSchema>;
export type CreditCardPrediction = typeof creditCardPredictions.$inferSelect;
export type InsertCreditCardPrediction = z.infer<typeof insertCreditCardPredictionSchema>;
export type FinancialBehaviorProfile = typeof financialBehaviorProfiles.$inferSelect;
export type InsertFinancialBehaviorProfile = z.infer<typeof insertFinancialBehaviorProfileSchema>;
export type BankAccountConnection = typeof bankAccountConnections.$inferSelect;
export type InsertBankAccountConnection = z.infer<typeof insertBankAccountConnectionSchema>;
export type TaxIntegration = typeof taxIntegrations.$inferSelect;
export type InsertTaxIntegration = z.infer<typeof insertTaxIntegrationSchema>;
export type EmploymentVerification = typeof employmentVerifications.$inferSelect;
export type InsertEmploymentVerification = z.infer<typeof insertEmploymentVerificationSchema>;
export type DisputeSuccessPrediction = typeof disputeSuccessPredictions.$inferSelect;
export type InsertDisputeSuccessPrediction = z.infer<typeof insertDisputeSuccessPredictionSchema>;
export type MlTrainingData = typeof mlTrainingData.$inferSelect;
export type InsertMlTrainingData = z.infer<typeof insertMlTrainingDataSchema>;
