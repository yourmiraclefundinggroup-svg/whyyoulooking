import { UserContext } from "@/hooks/use-user-context";
import ClientPortal from "@/pages/client-portal";
import type { User } from "@shared/schema";

const DEMO_USER: User = {
  id: 999,
  firstName: "Jordan",
  lastName: "K.",
  email: "jordan.demo@scoreshift.io",
  phone: null,
  addressLine1: "742 Evergreen Terrace",
  addressLine2: null,
  city: "Phoenix",
  state: "AZ",
  zipCode: "85001",
  smsOptIn: false,
  dateOfBirth: "1990-03-15",
  ssnLast4: "7890",
  password: "",
  accessLevel: "CLIENT_VIEWER",
  isTestUser: false,
  testingNotes: null,
  passwordResetRequired: false,
  studentLoansEnrolled: false,
  monthlyStudentLoanPayment: null,
  employmentInfo: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  subscriptionStatus: "ACTIVE",
  subscriptionPlan: "PROFESSIONAL",
  subscriptionStartDate: new Date("2025-02-12"),
  subscriptionEndDate: null,
  billingCycle: "monthly",
  caseType: "STANDARD",
  idPhotoPath: null,
  policeReportNumber: null,
  ftcReportNumber: null,
  policeReportPath: null,
  ftcReportPath: null,
  croaDisclosureAccepted: true,
  croaDisclosureTimestamp: new Date("2025-02-12"),
  aiConsentAccepted: true,
  aiConsentTimestamp: new Date("2025-02-12"),
  payPerDeleteRate: "99.00",
  subscriptionTier: "pro",
  accountType: "MANAGED_CLIENT",
  programType: "premium_managed",
  createdAt: new Date("2025-02-12"),
};

export default function PortalDemo() {
  return (
    <UserContext.Provider
      value={{
        user: DEMO_USER,
        isAdmin: false,
        isBetaTester: false,
        isClientViewer: true,
        canCreateDisputes: false,
        canAccessAI: false,
        canAccessCreditBuilding: false,
        canAccessEducation: false,
        setCurrentUserId: () => {},
        logout: () => { window.location.href = "/auth"; },
      }}
    >
      <ClientPortal />
    </UserContext.Provider>
  );
}
