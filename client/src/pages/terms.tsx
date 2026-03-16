import { Link } from "wouter";
import { ArrowLeft, FileText, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border py-4 px-4 sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-foreground">ScoreShift</span>
            </div>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Terms & Conditions</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
        </div>

        <div className="space-y-8">

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using the ScoreShift platform ("Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, do not use the Service. These Terms apply to all users, including clients and administrators. ScoreShift reserves the right to modify these Terms at any time, and continued use of the Service constitutes acceptance of any changes.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              ScoreShift is a credit repair platform that provides:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" /><span>AI-powered credit report analysis and issue identification</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" /><span>Automated dispute letter generation for credit bureaus</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" /><span>USPS certified mail tracking for dispute letters</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" /><span>Credit score monitoring and improvement recommendations</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" /><span>Educational resources and credit-building tools</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" /><span>Secure communication between clients and credit repair professionals</span></li>
            </ul>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              You must be at least 18 years of age and a legal resident of the United States to use ScoreShift. By using the Service, you represent and warrant that you meet these requirements. ScoreShift reserves the right to refuse service to anyone at its sole discretion.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">4. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You are responsible for:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" /><span>Maintaining the confidentiality of your account credentials</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" /><span>All activity that occurs under your account</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" /><span>Providing accurate and complete information when creating your account</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" /><span>Notifying us immediately of any unauthorized access to your account</span></li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              ScoreShift is not liable for any loss or damage arising from unauthorized use of your account.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Credit Repair Services Disclosure</h2>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 mb-4">
              <p className="text-amber-800 dark:text-amber-300 font-medium text-sm">
                Important Notice: In accordance with the Credit Repair Organizations Act (CROA)
              </p>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" /><span>You have the right to dispute inaccurate information in your credit report directly with credit bureaus at no charge.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" /><span>ScoreShift cannot remove accurate, verifiable negative information from your credit report.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" /><span>Results vary. ScoreShift does not guarantee specific improvements to your credit score.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" /><span>You may cancel services within 3 business days of signing this agreement without penalty.</span></li>
            </ul>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Fees and Payment</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Subscription fees are billed in accordance with the plan you select. By providing payment information, you authorize ScoreShift to charge your payment method for all fees incurred. All fees are non-refundable unless otherwise stated or required by applicable law. We reserve the right to modify pricing with 30 days' notice to existing subscribers.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Payments are processed securely through Stripe. ScoreShift does not store your full payment card details.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">You agree not to:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" /><span>Provide false, fraudulent, or misleading information</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" /><span>Use the Service to commit fraud or any illegal activity</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" /><span>Attempt to gain unauthorized access to other accounts or systems</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" /><span>Reverse engineer, copy, or resell the platform or its AI tools</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" /><span>Submit dispute letters for debts that are valid and accurately reported</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" /><span>Use the platform on behalf of another person without their written authorization</span></li>
            </ul>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content, features, and functionality of the ScoreShift platform — including software, text, graphics, logos, and AI-generated outputs — are owned by ScoreShift and protected by applicable intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the Service solely for its intended personal credit repair purposes.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. ScoreShift does not warrant that the Service will be uninterrupted, error-free, or that any defects will be corrected. We make no guarantees regarding specific credit score outcomes or the success of any dispute submitted on your behalf.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by law, ScoreShift shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service. Our total cumulative liability shall not exceed the amount you paid for the Service in the 12 months preceding the claim.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">11. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              Either party may terminate this agreement at any time. ScoreShift may suspend or terminate your account immediately if you violate these Terms. Upon termination, your right to access the Service ceases and we may delete your data in accordance with our Privacy Policy and applicable retention requirements.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">12. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms are governed by and construed in accordance with the laws of the United States and applicable state laws, without regard to conflict of law principles. Any disputes arising from these Terms shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">13. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these Terms, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-foreground font-medium">ScoreShift</p>
              <p className="text-muted-foreground">Email: support@scoreshift.com</p>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border mt-12">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ScoreShift. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
