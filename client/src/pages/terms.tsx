import { Link } from "wouter";
import { ArrowLeft, FileText } from "lucide-react";
import scoreshiftLogo from "@assets/scoreshift-logo.png";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border py-4 px-4 sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <img src={scoreshiftLogo} alt="ScoreShift" className="w-8 h-8 object-contain" />
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
            <h1 className="text-3xl font-bold text-foreground">FCRA Terms of Use</h1>
            <p className="text-muted-foreground">Effective Date: May 11, 2026</p>
          </div>
        </div>

        <div className="space-y-8">

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to ScoreShift Capital ("ScoreShift," "we," "us," or "our"). By accessing or using our credit repair and financial services platform, you ("User," "Client," or "you") agree to be bound by these Terms of Use ("Terms"). These Terms are governed by applicable federal and state laws, including the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681 et seq., and the Credit Repair Organizations Act (CROA), 15 U.S.C. § 1679 et seq. If you do not agree to these Terms, you must immediately discontinue use of our platform.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Fair Credit Reporting Act ("FCRA") Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Under the FCRA, you have the following rights regarding your credit information:
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                <span><strong className="text-foreground">Right to Access:</strong> You have the right to request and review a copy of your credit report from each of the three major credit bureaus (Experian, Equifax, and TransUnion) once every 12 months at no cost through AnnualCreditReport.com.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                <span><strong className="text-foreground">Right to Dispute:</strong> If you believe any information in your credit report is inaccurate, incomplete, or outdated, you have the right to dispute that information directly with the credit bureau or the information furnisher. ScoreShift assists clients in exercising this right.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                <span><strong className="text-foreground">Right to Correction:</strong> If your dispute is found to be valid, the credit bureau must correct or delete the inaccurate information, typically within 30 days of receiving your dispute.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                <span><strong className="text-foreground">Right to Know Who Accessed Your Report:</strong> You have the right to know who has accessed your credit report. The credit bureaus are required to maintain records of inquiries.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                <span><strong className="text-foreground">Right to Opt Out:</strong> You have the right to opt out of pre-screened credit and insurance offers by calling 1-888-5-OPT-OUT or visiting OptOutPrescreen.com.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                <span><strong className="text-foreground">Right to Sue:</strong> You have the right to sue a company that violates the FCRA in state or federal court.</span>
              </li>
            </ul>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Permissible Purpose & User Authorization</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              By using ScoreShift's platform, you expressly authorize us to:
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <span>Access, review, and analyze your credit reports from Experian, Equifax, and/or TransUnion on your behalf.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <span>Submit dispute letters to credit bureaus and data furnishers on your behalf as your authorized representative.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <span>Receive credit bureau responses and communicate outcomes to you through our platform.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <span>Use your personal information solely for the purpose of providing credit repair and related financial services.</span>
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              This authorization constitutes a permissible purpose under the FCRA, 15 U.S.C. § 1681b(a)(3)(A). You may revoke this authorization at any time by contacting us in writing, though revocation will terminate your ability to use our services.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Credit Disputes & Educational Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              ScoreShift provides credit dispute assistance and educational resources to help you improve your credit health. You acknowledge and agree that:
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>ScoreShift will only dispute information that appears to be inaccurate, incomplete, unverifiable, or outdated under the FCRA.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>ScoreShift will never advise you to dispute accurate and verifiable negative information, create a new credit identity (also known as "credit privacy numbers" or "CPN"), or engage in any form of credit fraud.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>Credit repair results vary. ScoreShift does not guarantee a specific improvement in your credit score, the removal of any specific item, or any particular outcome.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>You have the right to dispute inaccurate information directly with credit bureaus at no cost, without the use of a credit repair organization.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>In accordance with CROA, you may cancel your agreement without penalty within three (3) business days of signing up. To cancel, email us at info@scoreshiftcapital.com with the subject line "Cancel My ScoreShift Account."</span>
              </li>
            </ul>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Accuracy of Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to provide accurate, current, and complete information when creating your account and using our services. Providing false or misleading information — including but not limited to your identity, Social Security Number, or credit history — is strictly prohibited and may constitute a violation of federal law, including identity fraud and wire fraud statutes. ScoreShift reserves the right to suspend or terminate your account and report suspected fraud to the appropriate authorities.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Data Security & Privacy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              ScoreShift takes the security of your personal and financial information seriously. We implement industry-standard safeguards including:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" /><span>Encrypted data transmission using SSL/TLS protocols</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" /><span>Secure, encrypted storage of all personal and financial data</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" /><span>Role-based access controls limiting who can view your data</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" /><span>Regular security audits and vulnerability assessments</span></li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Your use of this platform is also subject to our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy for additional details on how we collect, use, and protect your information.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              ScoreShift may integrate with or utilize third-party service providers — including credit bureaus (Experian, Equifax, TransUnion), payment processors (Stripe), AI technology providers (OpenAI, Anthropic), mail delivery services (Lob, USPS), and credit data providers (Array.com) — to facilitate our services. These third parties have their own terms and privacy policies that govern their services. ScoreShift is not responsible for the practices or content of third-party services. Your authorization to use our platform includes authorization for us to interact with these third parties on your behalf solely for the purpose of providing our contracted services.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by applicable law, ScoreShift Capital and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, consequential, or punitive damages arising out of or related to your use of the platform or services, including but not limited to changes to your credit score, denial of credit, or errors by credit bureaus. Our total cumulative liability to you for any claims arising under these Terms shall not exceed the total fees you paid to ScoreShift in the six (6) months preceding the claim. Nothing in these Terms limits our liability for fraud, gross negligence, or willful misconduct, or any liability that cannot be excluded under applicable law.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              ScoreShift reserves the right to update or modify these Terms at any time. We will notify you of material changes by posting the updated Terms on our platform with a revised Effective Date, and where required by law, by providing direct notice via email. Your continued use of the platform following notification of changes constitutes your acceptance of the updated Terms. If you do not agree to any updated Terms, you must discontinue use of the platform.
            </p>
          </section>

          <section className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have questions about these Terms, wish to exercise your FCRA rights, or need to contact us for any reason, please reach out to us at:
            </p>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-foreground font-semibold">ScoreShift Capital</p>
              <p className="text-muted-foreground">Email: <a href="mailto:info@scoreshiftcapital.com" className="text-purple-600 dark:text-purple-400 hover:underline">info@scoreshiftcapital.com</a></p>
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
