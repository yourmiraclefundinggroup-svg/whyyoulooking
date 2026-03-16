import { Link } from "wouter";
import { ArrowLeft, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
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
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              ScoreShift ("we," "us," or "our") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our credit repair platform and related services. Please read this policy carefully. If you disagree with its terms, please discontinue use of the platform.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">We collect information you provide directly to us, including:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" /><span><strong className="text-foreground">Personal Identification:</strong> Full name, date of birth, Social Security Number (SSN), address, phone number, and email address.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" /><span><strong className="text-foreground">Financial Information:</strong> Credit reports, account numbers, payment history, outstanding balances, and credit scores.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" /><span><strong className="text-foreground">Identity Documents:</strong> Government-issued ID, proof of address, and other verification documents you choose to upload.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" /><span><strong className="text-foreground">Communications:</strong> Messages, chat history, and support tickets submitted through the platform.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" /><span><strong className="text-foreground">Usage Data:</strong> IP address, browser type, pages visited, and actions taken within the platform.</span></li>
            </ul>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">We use the information we collect to:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" /><span>Generate and send dispute letters to credit bureaus (Experian, Equifax, TransUnion) on your behalf</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" /><span>Analyze your credit report using AI to identify errors and disputable items</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" /><span>Track the status of dispute letters via USPS certified mail</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" /><span>Provide personalized credit-building recommendations and action plans</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" /><span>Communicate with you about your account, updates, and support requests</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" /><span>Process billing and subscription payments securely through Stripe</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" /><span>Comply with legal obligations and protect against fraudulent activity</span></li>
            </ul>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Sharing Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">We do not sell your personal information. We may share your information with:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" /><span><strong className="text-foreground">Credit Bureaus:</strong> Experian, Equifax, and TransUnion for the purpose of submitting disputes on your behalf.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" /><span><strong className="text-foreground">Service Providers:</strong> Third-party vendors (such as OpenAI for AI analysis, USPS for mail tracking, and Stripe for payments) who assist us in operating the platform, bound by confidentiality agreements.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" /><span><strong className="text-foreground">Legal Requirements:</strong> When required by law, subpoena, or to protect the rights and safety of ScoreShift and its users.</span></li>
            </ul>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures including encrypted data transmission (SSL/TLS), hashed and salted password storage, role-based access controls, and secure document storage. However, no method of transmission over the internet is 100% secure. You are responsible for maintaining the confidentiality of your account credentials.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide services. If you close your account, we will retain certain information as required by law or for legitimate business purposes such as resolving disputes and enforcing agreements. You may request deletion of your data by contacting us.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Depending on your location, you may have the right to:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" /><span>Access the personal data we hold about you</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" /><span>Correct inaccurate or incomplete data</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" /><span>Request deletion of your personal data ("right to be forgotten")</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" /><span>Opt out of marketing communications at any time</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" /><span>Request a portable copy of your data</span></li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">To exercise any of these rights, please contact us at <strong className="text-foreground">support@scoreshift.com</strong>.</p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to maintain your session, remember your preferences, and analyze platform usage. You can control cookie settings through your browser; however, disabling certain cookies may affect platform functionality.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              ScoreShift is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from minors. If we learn that we have collected information from a child under 18, we will delete it promptly.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy periodically. We will notify you of significant changes by posting the new policy on this page with an updated date and, where appropriate, notifying you by email. Continued use of the platform after changes constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">11. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions, concerns, or requests regarding this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
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
