import { db } from "./db";
import { 
  users, creditReports, creditIssues, disputes, creditGoals, 
  educationalContent, creditBuildingActions
} from "@shared/schema";

async function seedDatabase() {
  try {
    console.log("Seeding database...");

    // Create admin user
    const [adminUser] = await db.insert(users).values({
      firstName: "Admin",
      lastName: "User",
      email: "admin@scoreshift.com",
      password: "admin123",
      accessLevel: "ADMIN",
      passwordResetRequired: true
    }).returning();

    console.log("Created admin user:", adminUser);

    // Create Sarah Johnson client user
    const [user] = await db.insert(users).values({
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@example.com",
      password: "client123",
      accessLevel: "CLIENT_VIEWER",
      passwordResetRequired: true
    }).returning();

    console.log("Created user:", user);

    // Create sample credit report
    const [creditReport] = await db.insert(creditReports).values({
      userId: user.id,
      creditScore: 658,
      creditRating: "FAIR",
      utilizationRate: 0.65,
      accountAge: 18
    }).returning();

    console.log("Created credit report:", creditReport);

    // Create sample credit issues
    const issuesData = [
      {
        userId: user.id,
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
        userId: user.id,
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
        userId: user.id,
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

    const createdIssues = await db.insert(creditIssues).values(issuesData).returning();
    console.log("Created credit issues:", createdIssues);

    // Create sample disputes
    const disputesData = [
      {
        userId: user.id,
        issueId: createdIssues[0].id,
        bureau: "EQUIFAX",
        status: "PENDING",
        expectedResponse: new Date("2024-04-14"),
        letterContent: "Dispute letter content for collection account..."
      },
      {
        userId: user.id,
        issueId: createdIssues[1].id,
        bureau: "EXPERIAN",
        status: "RESOLVED",
        expectedResponse: new Date("2024-03-21"),
        actualResponse: new Date("2024-03-10"),
        letterContent: "Dispute letter content for late payment..."
      }
    ];

    const createdDisputes = await db.insert(disputes).values(disputesData).returning();
    console.log("Created disputes:", createdDisputes);

    // Create sample credit goal
    const [creditGoal] = await db.insert(creditGoals).values({
      userId: user.id,
      targetScore: 720,
      currentScore: 658,
      targetDate: new Date("2024-12-31")
    }).returning();

    console.log("Created credit goal:", creditGoal);

    // Create educational content
    const educationalData = [
      {
        title: "Understanding Credit Scores",
        description: "Learn the factors that impact your credit score",
        content: "Credit scores are calculated based on five main factors...",
        category: "CREDIT_SCORES",
        imageUrl: "https://images.unsplash.com/photo-1559526324-593bc073d938?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=150",
        readTime: 5
      },
      {
        title: "Dispute Process Guide",
        description: "Step-by-step dispute filing instructions",
        content: "The dispute process involves several steps...",
        category: "DISPUTE_PROCESS",
        imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=150",
        readTime: 8
      },
      {
        title: "Building Credit Fast",
        description: "Proven strategies to improve your score quickly",
        content: "There are several proven strategies to build credit...",
        category: "CREDIT_BUILDING",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=150",
        readTime: 6
      }
    ];

    const createdContent = await db.insert(educationalContent).values(educationalData).returning();
    console.log("Created educational content:", createdContent);

    // Create credit building actions
    const buildingActionsData = [
      {
        userId: user.id,
        type: "SECURED_CARD",
        title: "Secured Credit Card",
        description: "Apply for a secured credit card to establish positive payment history",
        potentialImpact: 35,
        timeframe: "6 months",
        status: "RECOMMENDED",
        priority: "HIGH"
      },
      {
        userId: user.id,
        type: "UTILIZATION_REDUCTION",
        title: "Lower Credit Utilization",
        description: "Pay down balances to get below 30% utilization",
        potentialImpact: 25,
        timeframe: "3 months",
        status: "RECOMMENDED",
        priority: "HIGH"
      }
    ];

    const createdActions = await db.insert(creditBuildingActions).values(buildingActionsData).returning();
    console.log("Created credit building actions:", createdActions);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run seeding if this file is executed directly
seedDatabase();

export { seedDatabase };