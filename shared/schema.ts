import { pgTable, text, serial, integer, boolean, timestamp, real, date, json, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  smsOptIn: boolean("sms_opt_in").default(false),
  dateOfBirth: text("date_of_birth"),
  ssnLast4: text("ssn_last4"),
  password: text("password").notNull(),
  accessLevel: text("access_level").notNull().default("STANDARD"), // STANDARD, CLIENT_VIEWER, BETA_TESTER, ADMIN
  isTestUser: boolean("is_test_user").default(false),
  testingNotes: text("testing_notes"), // Notes about their testing feedback
  passwordResetRequired: boolean("password_reset_required").default(false),
  studentLoansEnrolled: boolean("student_loans_enrolled").default(false),
  monthlyStudentLoanPayment: decimal("monthly_student_loan_payment", { precision: 10, scale: 2 }),
  employmentInfo: json("employment_info").$type<{
    employer?: string;
    income?: number;
    employmentType?: string; // for PSLF eligibility
    startDate?: string;
  }>(),
  // Stripe billing fields
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status"), // ACTIVE, CANCELED, PAST_DUE, TRIALING
  subscriptionPlan: text("subscription_plan"), // BASIC, PREMIUM, PROFESSIONAL
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  billingCycle: text("billing_cycle").default("monthly"), // monthly, yearly
  // Client intake fields
  caseType: text("case_type").default("STANDARD"), // STANDARD | IDENTITY_THEFT
  idPhotoPath: text("id_photo_path"),
  policeReportNumber: text("police_report_number"),
  ftcReportNumber: text("ftc_report_number"),
  policeReportPath: text("police_report_path"),
  ftcReportPath: text("ftc_report_path"),
  // CROA & AI compliance consent fields
  croaDisclosureAccepted: boolean("croa_disclosure_accepted").default(false),
  croaDisclosureTimestamp: timestamp("croa_disclosure_timestamp"),
  aiConsentAccepted: boolean("ai_consent_accepted").default(false),
  aiConsentTimestamp: timestamp("ai_consent_timestamp"),
  payPerDeleteRate: decimal("pay_per_delete_rate", { precision: 10, scale: 2 }).default("99.00"),
  // Subscription tier for feature gating: none | starter | pro | elite
  subscriptionTier: text("subscription_tier").default("none"), // none, starter, pro, elite
  // Account model: SELF_SERVICE (DIY portal) or MANAGED_CLIENT (concierge/done-for-you)
  accountType: text("account_type").notNull().default("SELF_SERVICE"),
  programType: text("program_type"), // e.g. "standard", "premium_managed", "identity_theft"
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

// Billing and payment tables
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Basic, Premium, Professional
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  billingInterval: text("billing_interval").notNull(), // monthly, yearly
  stripePriceId: text("stripe_price_id").notNull(),
  features: text("features").array().notNull(),
  maxDisputes: integer("max_disputes"),
  maxClients: integer("max_clients"), // for admin plans
  aiCreditsPerMonth: integer("ai_credits_per_month"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("usd"),
  status: text("status").notNull(), // PENDING, SUCCEEDED, FAILED, CANCELED
  description: text("description"),
  paymentType: text("payment_type").notNull(), // SUBSCRIPTION, ONE_TIME, SETUP_FEE
  createdAt: timestamp("created_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  stripeInvoiceId: text("stripe_invoice_id").notNull(),
  subscriptionId: text("subscription_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("usd"),
  status: text("status").notNull(), // DRAFT, OPEN, PAID, VOID, UNCOLLECTIBLE
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usageTracking = pgTable("usage_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  disputesGenerated: integer("disputes_generated").default(0),
  aiCreditsUsed: integer("ai_credits_used").default(0),
  documentsGenerated: integer("documents_generated").default(0),
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

// Billing schema validations
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, paidAt: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true, paidAt: true });
export const insertUsageTrackingSchema = createInsertSchema(usageTracking).omit({ id: true, createdAt: true });

// Gamified Onboarding Progress Tracker
export const userOnboardingProgress = pgTable("user_onboarding_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  currentStep: integer("current_step").notNull().default(1),
  totalSteps: integer("total_steps").notNull().default(10),
  completedSteps: text("completed_steps").array().notNull().default([]), // Array of completed step IDs
  experiencePoints: integer("experience_points").notNull().default(0),
  level: integer("level").notNull().default(1),
  badges: text("badges").array().notNull().default([]), // Array of earned badge IDs
  streakDays: integer("streak_days").notNull().default(0),
  lastActivityDate: timestamp("last_activity_date").defaultNow(),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const onboardingSteps = pgTable("onboarding_steps", {
  id: serial("id").primaryKey(),
  stepNumber: integer("step_number").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category", { enum: ["SETUP", "CREDIT_ANALYSIS", "GOAL_SETTING", "DISPUTE_PROCESS", "MONITORING"] }).notNull(),
  requiredAction: text("required_action").notNull(), // What user needs to do
  experienceReward: integer("experience_reward").notNull().default(100),
  isOptional: boolean("is_optional").notNull().default(false),
  estimatedTime: text("estimated_time").notNull(), // e.g., "5 minutes"
  helpText: text("help_text"),
  unlockConditions: text("unlock_conditions").array(), // Prerequisites for this step
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const gamificationBadges = pgTable("gamification_badges", {
  id: serial("id").primaryKey(),
  badgeId: text("badge_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category", { enum: ["PROGRESS", "ACHIEVEMENT", "STREAK", "MILESTONE", "SPECIAL"] }).notNull(),
  condition: text("condition").notNull(), // JSON string describing unlock condition
  rarity: text("rarity", { enum: ["COMMON", "RARE", "EPIC", "LEGENDARY"] }).notNull(),
  experienceReward: integer("experience_reward").notNull().default(50),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  badgeId: text("badge_id").notNull().references(() => gamificationBadges.badgeId),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
  experienceAwarded: integer("experience_awarded").notNull(),
  isNewBadge: boolean("is_new_badge").notNull().default(true) // For notification purposes
});

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

// Customer Support AI System Tables
export const supportConversations = pgTable("support_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: text("session_id").notNull().unique(),
  status: text("status", {
    enum: ["ACTIVE", "RESOLVED", "ESCALATED", "CLOSED"]
  }).notNull().default("ACTIVE"),
  priority: text("priority", {
    enum: ["LOW", "MEDIUM", "HIGH", "URGENT"]
  }).notNull().default("MEDIUM"),
  category: text("category", {
    enum: ["CREDIT_REPAIR", "DISPUTE_HELP", "APP_NAVIGATION", "BILLING", "TECHNICAL", "GENERAL"]
  }),
  escalated: boolean("escalated").default(false),
  escalatedAt: timestamp("escalated_at"),
  assignedAgent: text("assigned_agent"),
  customerSatisfaction: integer("customer_satisfaction"), // 1-5 rating
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const supportMessages = pgTable("support_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => supportConversations.id).notNull(),
  sender: text("sender", {
    enum: ["USER", "AI", "AGENT"]
  }).notNull(),
  message: text("message").notNull(),
  messageType: text("message_type", {
    enum: ["TEXT", "FORM_DATA", "FILE_ATTACHMENT", "SYSTEM_NOTE"]
  }).notNull().default("TEXT"),
  metadata: jsonb("metadata").default({}),
  sentiment: text("sentiment", {
    enum: ["POSITIVE", "NEUTRAL", "NEGATIVE", "FRUSTRATED"]
  }),
  confidence: real("confidence"), // AI confidence score 0-1
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => supportConversations.id).notNull(),
  ticketNumber: text("ticket_number").notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status", {
    enum: ["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"]
  }).notNull().default("OPEN"),
  priority: text("priority", {
    enum: ["LOW", "MEDIUM", "HIGH", "URGENT"]
  }).notNull().default("MEDIUM"),
  assignedTo: text("assigned_to"),
  customerInfo: jsonb("customer_info").default({}),
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at")
});

export const supportKnowledgeBase = pgTable("support_knowledge_base", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array().default([]),
  isPublic: boolean("is_public").default(true),
  viewCount: integer("view_count").default(0),
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Insert schemas for support system
export const insertSupportConversationSchema = createInsertSchema(supportConversations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSupportMessageSchema = createInsertSchema(supportMessages).omit({ id: true, createdAt: true });
export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSupportKnowledgeBaseSchema = createInsertSchema(supportKnowledgeBase).omit({ id: true, createdAt: true, updatedAt: true });

// Support system types
export type SupportConversation = typeof supportConversations.$inferSelect;
export type InsertSupportConversation = z.infer<typeof insertSupportConversationSchema>;
export type SupportMessage = typeof supportMessages.$inferSelect;
export type InsertSupportMessage = z.infer<typeof insertSupportMessageSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportKnowledgeBase = typeof supportKnowledgeBase.$inferSelect;
export type InsertSupportKnowledgeBase = z.infer<typeof insertSupportKnowledgeBaseSchema>;

// Credit Report Analysis (Admin Feature)
export const creditReportUploads = pgTable("credit_report_uploads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  bureau: text("bureau", { enum: ["EXPERIAN", "EQUIFAX", "TRANSUNION"] }).default("EXPERIAN").notNull(),
  sourceFormat: text("source_format", { enum: ["pdf", "html", "txt", "csv"] }).notNull(),
  creditScore: integer("credit_score"),
  parseStatus: text("parse_status", { enum: ["queued", "processing", "succeeded", "failed"] }).default("queued").notNull(),
  parseError: text("parse_error"),
  rawExtractionJson: jsonb("raw_extraction_json"),
  reportDate: date("report_date"),
  analysisComplete: boolean("analysis_complete").default(false),
  rawAnalysis: text("raw_analysis"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const creditReportFindings = pgTable("credit_report_findings", {
  id: serial("id").primaryKey(),
  uploadId: integer("upload_id").references(() => creditReportUploads.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  findingType: text("finding_type").notNull(),
  creditor: text("creditor").notNull(),
  amount: real("amount"),
  description: text("description").notNull(),
  impact: text("impact").notNull(),
  suggestedAction: text("suggested_action").notNull(),
  status: text("status").default("PENDING"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const creditReportLetters = pgTable("credit_report_letters", {
  id: serial("id").primaryKey(),
  findingId: integer("finding_id").references(() => creditReportFindings.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  letterContent: text("letter_content").notNull(),
  bureau: text("bureau").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

// Credit Report Accounts (Tradelines) - NEW for Dispute Hub
export const creditReportAccounts = pgTable("credit_report_accounts", {
  id: serial("id").primaryKey(),
  uploadId: integer("upload_id").references(() => creditReportUploads.id).notNull(),
  clientId: integer("client_id").references(() => users.id).notNull(),
  creditorName: text("creditor_name").notNull(),
  accountNumberMasked: text("account_number_masked"),
  accountType: text("account_type"),
  status: text("status"),
  balance: integer("balance"),
  creditLimit: integer("credit_limit"),
  highBalance: integer("high_balance"),
  paymentStatus: text("payment_status"),
  dateOpened: date("date_opened"),
  dateReported: date("date_reported"),
  dateLastPayment: date("date_last_payment"),
  derogatoryFlags: jsonb("derogatory_flags").$type<string[]>(),
  latePayments: jsonb("late_payments_30_60_90").$type<{ days30?: number; days60?: number; days90?: number }>(),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Credit Report Inquiries - NEW for Dispute Hub
export const creditReportInquiries = pgTable("credit_report_inquiries", {
  id: serial("id").primaryKey(),
  uploadId: integer("upload_id").references(() => creditReportUploads.id).notNull(),
  clientId: integer("client_id").references(() => users.id).notNull(),
  creditorName: text("creditor_name").notNull(),
  inquiryDate: date("inquiry_date"),
  inquiryType: text("inquiry_type", { enum: ["hard", "soft", "unknown"] }).default("unknown"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Credit Report Collections - NEW for Dispute Hub
export const creditReportCollections = pgTable("credit_report_collections", {
  id: serial("id").primaryKey(),
  uploadId: integer("upload_id").references(() => creditReportUploads.id).notNull(),
  clientId: integer("client_id").references(() => users.id).notNull(),
  agencyName: text("agency_name").notNull(),
  originalCreditor: text("original_creditor"),
  amount: integer("amount"),
  dateOpened: date("date_opened"),
  dateReported: date("date_reported"),
  dateLastPayment: date("date_last_payment"),
  status: text("status"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Credit Report Public Records - NEW for Dispute Hub
export const creditReportPublicRecords = pgTable("credit_report_public_records", {
  id: serial("id").primaryKey(),
  uploadId: integer("upload_id").references(() => creditReportUploads.id).notNull(),
  clientId: integer("client_id").references(() => users.id).notNull(),
  recordType: text("record_type"),
  court: text("court"),
  dateFiled: date("date_filed"),
  status: text("status"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Dispute Items - NEW for Dispute Hub selection and tracking
export const disputeItems = pgTable("dispute_items", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => users.id).notNull(),
  uploadId: integer("upload_id").references(() => creditReportUploads.id).notNull(),
  itemType: text("item_type", { enum: ["account", "inquiry", "collection", "public_record"] }).notNull(),
  itemRefId: integer("item_ref_id").notNull(),
  negativeReasonTags: text("negative_reason_tags").array(),
  severityScore: integer("severity_score").default(0),
  recommendedStrategy: text("recommended_strategy"),
  recommendedLetterType: text("recommended_letter_type", { enum: ["round1", "round2", "validation", "goodwill", "inquiry"] }),
  selected: boolean("selected").default(false),
  adminNotes: text("admin_notes"),
  status: text("status", { enum: ["draft", "ready", "sent", "awaiting_response", "resolved"] }).default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Dispute Letters - NEW for letter generation and tracking
export const disputeLettersNew = pgTable("dispute_letters_new", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => users.id).notNull(),
  uploadId: integer("upload_id").references(() => creditReportUploads.id),
  letterType: text("letter_type", { enum: ["round1", "round2", "validation", "goodwill", "inquiry"] }).notNull(),
  bureau: text("bureau", { enum: ["EXPERIAN", "EQUIFAX", "TRANSUNION"] }).notNull(),
  content: text("content").notNull(),
  generatedByAdminId: integer("generated_by_admin_id").references(() => users.id),
  status: text("status", { enum: ["draft", "approved", "sent", "removed", "mailed", "deleted"] }).default("draft"),
  downloadUrl: text("download_url"),
  disputeItemIds: integer("dispute_item_ids").array(),
  trackingNumber: text("tracking_number"),
  sentDate: date("sent_date"),
  lobId: text("lob_id"),
  lobStatus: text("lob_status"),
  expectedDeliveryDate: date("expected_delivery_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Dispute Calendar Events - NEW for scheduling and round tracking
export const disputeCalendarEvents = pgTable("dispute_calendar_events", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => users.id).notNull(),
  disputeItemIds: integer("dispute_item_ids").array(),
  letterId: integer("letter_id").references(() => disputeLettersNew.id),
  round: text("round", { enum: ["1", "2", "validation"] }).notNull(),
  scheduledSendDate: date("scheduled_send_date").notNull(),
  followUpDate: date("follow_up_date"),
  expectedResponseBy: date("expected_response_by"),
  status: text("status", { enum: ["scheduled", "sent", "follow-up", "completed", "overdue"] }).default("scheduled"),
  createdByAdminId: integer("created_by_admin_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCreditReportUploadSchema = createInsertSchema(creditReportUploads).omit({ id: true, createdAt: true });
export const insertCreditReportFindingSchema = createInsertSchema(creditReportFindings).omit({ id: true, createdAt: true });
export const insertCreditReportLetterSchema = createInsertSchema(creditReportLetters).omit({ id: true, generatedAt: true });
export const insertCreditReportAccountSchema = createInsertSchema(creditReportAccounts).omit({ id: true, createdAt: true });
export const insertCreditReportInquirySchema = createInsertSchema(creditReportInquiries).omit({ id: true, createdAt: true });
export const insertCreditReportCollectionSchema = createInsertSchema(creditReportCollections).omit({ id: true, createdAt: true });
export const insertCreditReportPublicRecordSchema = createInsertSchema(creditReportPublicRecords).omit({ id: true, createdAt: true });
export const insertDisputeItemSchema = createInsertSchema(disputeItems).omit({ id: true, createdAt: true });
export const insertDisputeLetterNewSchema = createInsertSchema(disputeLettersNew).omit({ id: true, createdAt: true });
export const insertDisputeCalendarEventSchema = createInsertSchema(disputeCalendarEvents).omit({ id: true, createdAt: true });

export type CreditReportUpload = typeof creditReportUploads.$inferSelect;
export type InsertCreditReportUpload = z.infer<typeof insertCreditReportUploadSchema>;
export type CreditReportFinding = typeof creditReportFindings.$inferSelect;
export type InsertCreditReportFinding = z.infer<typeof insertCreditReportFindingSchema>;
export type CreditReportLetter = typeof creditReportLetters.$inferSelect;
export type InsertCreditReportLetter = z.infer<typeof insertCreditReportLetterSchema>;
export type CreditReportAccount = typeof creditReportAccounts.$inferSelect;
export type InsertCreditReportAccount = z.infer<typeof insertCreditReportAccountSchema>;
export type CreditReportInquiry = typeof creditReportInquiries.$inferSelect;
export type InsertCreditReportInquiry = z.infer<typeof insertCreditReportInquirySchema>;
export type CreditReportCollection = typeof creditReportCollections.$inferSelect;
export type InsertCreditReportCollection = z.infer<typeof insertCreditReportCollectionSchema>;
export type CreditReportPublicRecord = typeof creditReportPublicRecords.$inferSelect;
export type InsertCreditReportPublicRecord = z.infer<typeof insertCreditReportPublicRecordSchema>;
export type DisputeItem = typeof disputeItems.$inferSelect;
export type InsertDisputeItem = z.infer<typeof insertDisputeItemSchema>;
export type DisputeLetterNew = typeof disputeLettersNew.$inferSelect;
export type InsertDisputeLetterNew = z.infer<typeof insertDisputeLetterNewSchema>;
export type DisputeCalendarEvent = typeof disputeCalendarEvents.$inferSelect;
export type InsertDisputeCalendarEvent = z.infer<typeof insertDisputeCalendarEventSchema>;

// Gamification schema inserts and types
export const insertUserOnboardingProgressSchema = createInsertSchema(userOnboardingProgress).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOnboardingStepSchema = createInsertSchema(onboardingSteps).omit({ id: true, createdAt: true });
export const insertGamificationBadgeSchema = createInsertSchema(gamificationBadges).omit({ id: true, createdAt: true });
export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({ id: true, earnedAt: true });

export type UserOnboardingProgress = typeof userOnboardingProgress.$inferSelect;
export type InsertUserOnboardingProgress = z.infer<typeof insertUserOnboardingProgressSchema>;
export type OnboardingStep = typeof onboardingSteps.$inferSelect;
export type InsertOnboardingStep = z.infer<typeof insertOnboardingStepSchema>;
export type GamificationBadge = typeof gamificationBadges.$inferSelect;
export type InsertGamificationBadge = z.infer<typeof insertGamificationBadgeSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

// Referrals
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull().references(() => users.id),
  referredEmail: text("referred_email"),
  referredUserId: integer("referred_user_id").references(() => users.id),
  status: text("status").default("pending"), // pending, signed_up, paid, earned
  rewardAmount: integer("reward_amount").default(25),
  rewardPaid: boolean("reward_paid").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReferralSchema = createInsertSchema(referrals);
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

// ============================================
// AUTOMATION TABLES — Phase 2/4/7/9
// ============================================

// Audit Log — tracks every significant action
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  adminId: integer("admin_id").references(() => users.id),
  action: text("action").notNull(),
  entity: text("entity"), // e.g. "credit_report", "dispute_letter", "user"
  entityId: integer("entity_id"),
  details: text("details"), // JSON string of relevant data
  status: text("status").default("success"), // success | error | warning
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin Alerts — exception-based notifications for admin attention
export const adminAlerts = pgTable("admin_alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // error | warning | info
  title: text("title").notNull(),
  message: text("message").notNull(),
  entityType: text("entity_type"),
  entityId: integer("entity_id"),
  resolved: boolean("resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Communications Log — tracks all automated messages sent
export const commsLog = pgTable("comms_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  trigger: text("trigger").notNull(),
  channel: text("channel").notNull(), // sms | email
  status: text("status").notNull(), // sent | failed | skipped
  message: text("message"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
});

// White-Label Accounts
export const whiteLabelAccounts = pgTable("white_label_accounts", {
  id: serial("id").primaryKey(),
  ownerUserId: integer("owner_user_id").references(() => users.id),
  brandName: text("brand_name").notNull(),
  brandLogoUrl: text("brand_logo_url"),
  primaryColor: text("primary_color").default("#0F172A"),
  accentColor: text("accent_color").default("#F59E0B"),
  customDomain: text("custom_domain"),
  planTier: text("plan_tier").default("standard"), // standard | premium | enterprise
  status: text("status").default("active"), // active | suspended | trial
  stripeCustomerId: text("stripe_customer_id"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  setupProgress: integer("setup_progress").default(0), // 0-100%
  createdAt: timestamp("created_at").defaultNow(),
});

// White-Label Onboarding Steps
export const whiteLabelOnboardingSteps = pgTable("white_label_onboarding_steps", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => whiteLabelAccounts.id),
  stepName: text("step_name").notNull(),
  stepStatus: text("step_status").default("pending"), // pending | completed | skipped
  completedAt: timestamp("completed_at"),
  autoCompleted: boolean("auto_completed").default(false),
});

// Insert schemas
export const insertAuditLogSchema = createInsertSchema(auditLog).omit({ id: true, createdAt: true });
export const insertAdminAlertSchema = createInsertSchema(adminAlerts).omit({ id: true, createdAt: true });
export const insertCommsLogSchema = createInsertSchema(commsLog).omit({ id: true, createdAt: true });
export const insertWhiteLabelAccountSchema = createInsertSchema(whiteLabelAccounts).omit({ id: true, createdAt: true });
export const insertWhiteLabelOnboardingStepSchema = createInsertSchema(whiteLabelOnboardingSteps).omit({ id: true });

// Types
export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AdminAlert = typeof adminAlerts.$inferSelect;
export type InsertAdminAlert = z.infer<typeof insertAdminAlertSchema>;
export type CommsLog = typeof commsLog.$inferSelect;
export type InsertCommsLog = z.infer<typeof insertCommsLogSchema>;
export type WhiteLabelAccount = typeof whiteLabelAccounts.$inferSelect;
export type InsertWhiteLabelAccount = z.infer<typeof insertWhiteLabelAccountSchema>;
export type WhiteLabelOnboardingStep = typeof whiteLabelOnboardingSteps.$inferSelect;
export type InsertWhiteLabelOnboardingStep = z.infer<typeof insertWhiteLabelOnboardingStepSchema>;

// ============================================
// DISPUTEFOX COMPETITOR FEATURE TABLES
// ============================================

// Lead CRM Pipeline
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  source: text("source"), // "referral", "website", "affiliate", "cold_call", "social"
  stage: text("stage").notNull().default("new"), // "new", "contacted", "consultation", "onboarded", "archived"
  creditScoreEstimate: integer("credit_score_estimate"),
  assignedTo: integer("assigned_to").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  stageUpdatedAt: timestamp("stage_updated_at").defaultNow().notNull(),
});

// Affiliate Program
export const affiliates = pgTable("affiliates", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  commissionType: text("commission_type").notNull().default("flat"), // "flat" | "percent"
  commissionRate: decimal("commission_rate", { precision: 10, scale: 2 }).notNull().default("25.00"),
  totalClients: integer("total_clients").notNull().default(0),
  totalEarned: decimal("total_earned", { precision: 10, scale: 2 }).notNull().default("0.00"),
  totalPaid: decimal("total_paid", { precision: 10, scale: 2 }).notNull().default("0.00"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Affiliate Signup Tracking
export const affiliateSignups = pgTable("affiliate_signups", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliate_id").references(() => affiliates.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }),
  commissionPaid: boolean("commission_paid").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Array.com enrollment tracking
export const arrayEnrollments = pgTable("array_enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  arrayUserId: text("array_user_id").notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  productCodes: text("product_codes").array().notNull().default([]),
  lastTokenIssuedAt: timestamp("last_token_issued_at"),
  welcomeShownAt: timestamp("welcome_shown_at"),
});

export const insertArrayEnrollmentSchema = createInsertSchema(arrayEnrollments).omit({ id: true, enrolledAt: true, lastTokenIssuedAt: true, welcomeShownAt: true });
export type ArrayEnrollment = typeof arrayEnrollments.$inferSelect;
export type InsertArrayEnrollment = z.infer<typeof insertArrayEnrollmentSchema>;

// Credit Score History — tracks score snapshots over time for analytics
export const creditScoreHistory = pgTable("credit_score_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  score: integer("score").notNull(),
  source: text("source").notNull().default("credit_report_upload"), // 'credit_report_upload', 'manual', etc.
  uploadId: integer("upload_id").references(() => creditReportUploads.id).unique(), // nullable; unique prevents duplicate snapshots per upload
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const insertCreditScoreHistorySchema = createInsertSchema(creditScoreHistory).omit({ id: true, recordedAt: true });
export type CreditScoreHistory = typeof creditScoreHistory.$inferSelect;
export type InsertCreditScoreHistory = z.infer<typeof insertCreditScoreHistorySchema>;

// Pay-Per-Delete Billing Events
export const deletionEvents = pgTable("deletion_events", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => users.id).notNull(),
  uploadId: integer("upload_id").references(() => creditReportUploads.id),
  accountName: text("account_name").notNull(),
  bureau: text("bureau").notNull(),
  billingRate: decimal("billing_rate", { precision: 10, scale: 2 }).notNull().default("0.00"),
  billedAt: timestamp("billed_at"),
  isPaid: boolean("is_paid").notNull().default(false),
  deletedAt: timestamp("deleted_at").defaultNow().notNull(),
});

// Credit Report Cache — stores the last successfully fetched/parsed report per user (24h TTL)
export const creditReportCache = pgTable("credit_report_cache", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  data: jsonb("data").notNull(),
  source: text("source").notNull().default("array"), // 'array' | 'pdf'
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
  invalidatedAt: timestamp("invalidated_at"),
});

export const insertCreditReportCacheSchema = createInsertSchema(creditReportCache).omit({ id: true, fetchedAt: true, invalidatedAt: true });
export type CreditReportCacheEntry = typeof creditReportCache.$inferSelect;
export type InsertCreditReportCache = z.infer<typeof insertCreditReportCacheSchema>;

export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true, stageUpdatedAt: true });
export const insertAffiliateSchema = createInsertSchema(affiliates).omit({ id: true, createdAt: true });
export const insertAffiliateSignupSchema = createInsertSchema(affiliateSignups).omit({ id: true, createdAt: true });
export const insertDeletionEventSchema = createInsertSchema(deletionEvents).omit({ id: true, deletedAt: true });

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = z.infer<typeof insertAffiliateSchema>;
export type AffiliateSignup = typeof affiliateSignups.$inferSelect;
export type InsertAffiliateSignup = z.infer<typeof insertAffiliateSignupSchema>;
export type DeletionEvent = typeof deletionEvents.$inferSelect;
export type InsertDeletionEvent = z.infer<typeof insertDeletionEventSchema>;

// ─── Managed Client Tables ────────────────────────────────────────────────────

// Service package assigned by admin for a managed (done-for-you) client
export const managedClientPackages = pgTable("managed_client_packages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  packageName: text("package_name").notNull().default("Standard Credit Repair"),
  status: text("status").notNull().default("active"), // active | on_hold | completed | cancelled
  startDate: timestamp("start_date").defaultNow().notNull(),
  estimatedCompletionDate: timestamp("estimated_completion_date"),
  itemsIdentified: integer("items_identified").notNull().default(0),
  itemsRemoved: integer("items_removed").notNull().default(0),
  itemsInProgress: integer("items_in_progress").notNull().default(0),
  pointsGained: integer("points_gained").notNull().default(0),
  nextActionDate: timestamp("next_action_date"),
  nextActionNote: text("next_action_note"),
  internalNotes: text("internal_notes"),
  monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }).default("199.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity log entries visible to client on the managed home
export const clientCaseActivities = pgTable("client_case_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  activityType: text("activity_type").notNull(), // letter_sent | dispute_filed | document_reviewed | call_completed | score_update | note_added | follow_up_scheduled
  title: text("title").notNull(),
  description: text("description"),
  performedBy: text("performed_by").notNull().default("ScoreShift Team"),
  isVisibleToClient: boolean("is_visible_to_client").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Documents requested/uploaded for managed client case
export const clientDocuments = pgTable("client_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  filePath: text("file_path").notNull().default(""),
  documentType: text("document_type").notNull(), // id | ssn_card | bank_statement | bureau_response | other
  label: text("label").notNull().default("Document"),
  status: text("status").notNull().default("needed"), // needed | uploaded | reviewed | approved
  requestedAt: timestamp("requested_at").defaultNow(),
  uploadedAt: timestamp("uploaded_at"),
  reviewedAt: timestamp("reviewed_at"),
  adminNotes: text("admin_notes"),
});

export const insertManagedClientPackageSchema = createInsertSchema(managedClientPackages).omit({ id: true, createdAt: true });
export const insertClientCaseActivitySchema = createInsertSchema(clientCaseActivities).omit({ id: true, createdAt: true });
export const insertClientDocumentSchema = createInsertSchema(clientDocuments).omit({ id: true });

export type ManagedClientPackage = typeof managedClientPackages.$inferSelect;
export type InsertManagedClientPackage = z.infer<typeof insertManagedClientPackageSchema>;
export type ClientCaseActivity = typeof clientCaseActivities.$inferSelect;
export type InsertClientCaseActivity = z.infer<typeof insertClientCaseActivitySchema>;
export type ClientDocument = typeof clientDocuments.$inferSelect;
export type InsertClientDocument = z.infer<typeof insertClientDocumentSchema>;
