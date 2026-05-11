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
            <h1 className="text-3xl font-bold text-foreground">FCRA Privacy Policy</h1>
            <p className="text-muted-foreground">Effective Date: May 11, 2026</p>
          </div>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              ScoreShift Capital ("ScoreShift," "we," "us," or "our") is committed to protecting your privacy and handling your personal and financial information in accordance with applicable federal and state laws, including the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681 et seq., the Gramm-Leach-Bliley Act (GLBA), and applicable state privacy regulations. This Privacy Policy describes how we collect, use, share, and protect information obtained through your use of our credit repair and financial services platform. By using ScoreShift, you consent to the practices described in this Policy.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">We collect the following categories of information in connection with providing our services:</p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <span><strong className="text-foreground">Identity Information:</strong> Full legal name, date of birth (DOB), Social Security Number (last 4 digits for verification purposes), current and prior addresses, phone number, and email address.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <span><strong className="text-foreground">Credit Report Data:</strong> Credit scores, account history, payment records, derogatory marks, public records, and inquiry history obtained from Experian, Equifax, and TransUnion through your authorization.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <span><strong className="text-foreground">Identity Verification Data:</strong> Government-issued ID images, proof of address documents, police or FTC Identity Theft reports (where applicable for identity theft cases), and other verification materials you choose to upload.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <span><strong className="text-foreground">Financial Information:</strong> Account numbers, balances, creditor information, and payment history as it appears on your credit report.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <span><strong className="text-foreground">Communications:</strong> Messages, support tickets, chat history, and any other communications submitted through our platform.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <span><strong className="text-foreground">Usage & Technical Data:</strong> IP address, browser type and version, device information, pages visited, time spent on the platform, and other analytics data used to improve our services.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <span><strong className="text-foreground">Payment Information:</strong> Subscription payment information processed securely through Stripe. ScoreShift does not store full payment card numbers.</span>
              </li>
            </ul>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">We use the information we collect exclusively for the purpose of providing and improving our services, including:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" /><span>Analyzing your credit reports to identify inaccurate, outdated, or unverifiable items eligible for dispute under the FCRA</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" /><span>Generating and submitting dispute letters to Experian, Equifax, and/or TransUnion on your behalf</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" /><span>Tracking the status of certified mail dispute letters and communicating outcomes to you</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" /><span>Providing personalized credit-building recommendations, action plans, and educational resources</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" /><span>Communicating with you about your account, progress updates, billing, and support</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" /><span>Processing subscription payments and maintaining billing records</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" /><span>Complying with applicable legal obligations, including FCRA, GLBA, and other federal and state requirements</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" /><span>Detecting, preventing, and investigating fraudulent activity, identity theft, and unauthorized access</span></li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We do not use your personal or credit information for targeted advertising, data brokering, or any purpose unrelated to the credit repair and financial services described above.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">4. FCRA Consumer Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              As a consumer whose credit information is accessed through our platform, you have the following rights under the FCRA:
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                <span><strong className="text-foreground">Right to Know:</strong> You have the right to know what is in your credit file at Experian, Equifax, and TransUnion, and to receive a free annual credit report from each bureau at AnnualCreditReport.com.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                <span><strong className="text-foreground">Right to Dispute:</strong> You have the right to dispute inaccurate or incomplete information in your credit report directly with the credit bureaus at no charge, with or without the assistance of a credit repair company.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                <span><strong className="text-foreground">Right to Correction:</strong> Credit bureaus must correct or delete information that is found to be inaccurate, incomplete, or unverifiable, generally within 30 days of receiving a dispute.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                <span><strong className="text-foreground">Right to Limit Access:</strong> You have the right to place a security freeze on your credit file with each of the major bureaus (Experian, Equifax, TransUnion) to restrict access to your credit report.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                <span><strong className="text-foreground">Right to Seek Damages:</strong> If any entity violates your FCRA rights, you may have the right to seek actual damages, statutory damages, punitive damages, and attorney's fees by bringing a civil lawsuit.</span>
              </li>
            </ul>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Sharing of Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong className="text-foreground">We do not sell, rent, or trade your personal information to any third party.</strong> We may share your information only in the following limited circumstances:
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span><strong className="text-foreground">Credit Bureaus:</strong> Experian, Equifax, and TransUnion, for the purpose of submitting disputes and communicating on your behalf as authorized under the FCRA.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span><strong className="text-foreground">Service Providers:</strong> Carefully vetted third-party vendors who assist in operating our platform, including Array.com (credit data access), Lob and USPS (certified mail services), OpenAI and Anthropic (AI-powered analysis and letter generation), and Stripe (payment processing). All vendors are contractually required to protect your data and use it only for the contracted purpose.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span><strong className="text-foreground">Legal Requirements:</strong> When required by applicable law, court order, subpoena, or regulatory request, or when necessary to protect the rights, property, or safety of ScoreShift, our clients, or the public.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span><strong className="text-foreground">Business Transfers:</strong> In the event of a merger, acquisition, or sale of all or substantially all of ScoreShift's assets, your information may be transferred as part of that transaction. We will notify you before your information is transferred and becomes subject to a different privacy policy.</span>
              </li>
            </ul>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Data Protection</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement robust administrative, technical, and physical safeguards to protect your information from unauthorized access, use, alteration, and disclosure. These measures include SSL/TLS encryption for all data in transit, AES-256 encryption for data at rest, hashed and salted password storage, multi-factor authentication options, role-based access controls that limit data access to authorized personnel only, and regular security audits. However, no method of transmission over the internet or electronic storage is completely secure. While we strive to protect your information, we cannot guarantee its absolute security. In the event of a data breach that affects your personal information, we will notify you in accordance with applicable law.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal and credit-related information for as long as your account is active or as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. If you close your account or request deletion of your data, we will delete or anonymize your information within a reasonable timeframe, subject to any legal retention requirements. Certain records related to credit disputes, correspondence with credit bureaus, and financial transactions may be retained for up to seven (7) years in accordance with applicable law.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Consumer Choices</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">You have the following choices regarding your information:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" /><span><strong className="text-foreground">Access & Correction:</strong> You may access and update your personal information at any time through your account settings or by contacting us.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" /><span><strong className="text-foreground">Data Deletion:</strong> You may request deletion of your personal data by contacting us. We will honor your request subject to any legal obligations requiring us to retain certain records.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" /><span><strong className="text-foreground">Marketing Opt-Out:</strong> You may opt out of promotional communications from ScoreShift at any time by using the unsubscribe link in any marketing email or by contacting us directly. Transactional and service-related communications are not subject to opt-out.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" /><span><strong className="text-foreground">SMS Opt-Out:</strong> If you have consented to receive SMS messages, you may opt out at any time by replying STOP to any message or contacting us.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" /><span><strong className="text-foreground">Credit Freeze:</strong> You have the right to place a security freeze on your credit file directly with each credit bureau, which restricts access to your credit report and is separate from your ScoreShift account.</span></li>
            </ul>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              ScoreShift's platform and services are intended solely for individuals who are 18 years of age or older. We do not knowingly collect, use, or disclose personal information from anyone under the age of 18. If we discover that we have collected personal information from a minor, we will promptly delete that information. If you believe we have inadvertently collected information from a minor, please contact us immediately at info@scoreshiftcapital.com.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Policy Updates</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy periodically to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will update the Effective Date at the top of this Policy and provide notice through our platform and, where required by law, by direct communication to affected users. Your continued use of our platform following such notice constitutes your acceptance of the updated Policy. We encourage you to review this Policy regularly to stay informed about how we protect your information.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">11. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy, your personal information, or your FCRA rights, please contact us at:
            </p>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-foreground font-semibold">ScoreShift Capital</p>
              <p className="text-muted-foreground">Email: <a href="mailto:info@scoreshiftcapital.com" className="text-blue-600 dark:text-blue-400 hover:underline">info@scoreshiftcapital.com</a></p>
              <p className="text-muted-foreground">Atlanta, Georgia, USA</p>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border mt-12">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ScoreShift Capital. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Use</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
