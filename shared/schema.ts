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
