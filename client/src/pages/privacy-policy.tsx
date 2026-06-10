import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import "../styles/landing.css";

export default function PrivacyPolicy() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const nav = navRef.current;
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: "#F7F3EC", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>

      <nav className="ss-nav" ref={navRef}>
        <div className="ss-wrap ss-nav-inner">
          <Link href="/" className="ss-nav-logo">
            <img src="/images/scoreshift-wordmark-transparent.png" alt="ScoreShift" className="ss-nav-logo-img" />
          </Link>
          <ul className="ss-nav-links">
            <li><Link href="/#product">Product</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/#trust">Results</Link></li>
          </ul>
          <div className="ss-nav-actions">
            <Link href="/auth" className="ss-nav-ghost">Sign in</Link>
            <Link href="/pricing" className="ss-btn-nav">
              Start My Plan <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        position: "relative",
        height: "66vh",
        minHeight: "420px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        textAlign: "center",
      }}>
        <img
          src="/images/ss-legal-privacy.png"
          alt=""
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 40%",
            filter: "blur(1px) saturate(0.92)",
            transform: "scale(1.03)",
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(247,243,236,0.30) 0%, rgba(247,243,236,0.55) 50%, rgba(247,243,236,1) 100%)" }} />
        <div style={{ position: "relative", zIndex: 2, padding: "130px 24px 0", width: "100%" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.20em", textTransform: "uppercase", color: "rgba(67,56,202,0.80)", marginBottom: "16px" }}>Legal</p>
          <h1 style={{ fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 500, letterSpacing: "-2px", lineHeight: "1.04", color: "#1E1B18", margin: "0 0 20px" }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: "17px", color: "rgba(30,27,24,0.55)", lineHeight: "1.7", maxWidth: "500px", margin: "0 auto" }}>
            How ScoreShift protects your information and supports a guided financial experience.
          </p>
        </div>
      </div>

      {/* Content card */}
      <div style={{ padding: "0 20px 100px", marginTop: "-24px", position: "relative", zIndex: 3 }}>
        <div style={{
          maxWidth: "960px",
          margin: "0 auto",
          background: "rgba(255,252,248,0.97)",
          borderRadius: "32px",
          boxShadow: "0 32px 100px rgba(20,16,10,0.10), 0 2px 16px rgba(20,16,10,0.06)",
          border: "1px solid rgba(30,27,24,0.07)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          padding: "64px clamp(28px, 7vw, 88px) 80px",
        }}>
          <p style={{ fontSize: "12.5px", color: "rgba(30,27,24,0.34)", marginBottom: "56px", letterSpacing: "0.01em" }}>
            Last updated: June 10, 2026 &nbsp;·&nbsp; Effective Date: May 11, 2026
          </p>

          <Section title="1. Overview">
            ScoreShift, Inc. ("ScoreShift," "we," "us," or "our") is committed to protecting your privacy and handling your personal and financial information in accordance with applicable federal and state laws, including the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681 et seq., the Gramm-Leach-Bliley Act (GLBA), and applicable state privacy regulations. This Privacy Policy describes how we collect, use, share, and protect information obtained through your use of our credit repair and financial services platform. By using ScoreShift, you consent to the practices described in this Policy.
          </Section>

          <Section title="2. Information We Collect">
            We collect the following categories of information in connection with providing our services:
            <BulletList color="#4338CA" items={[
              <><B>Identity Information:</B> Full legal name, date of birth, Social Security Number (last 4 digits for verification), current and prior addresses, phone number, and email address.</>,
              <><B>Credit Report Data:</B> Credit scores, account history, payment records, derogatory marks, public records, and inquiry history obtained from Experian, Equifax, and TransUnion through your authorization.</>,
              <><B>Identity Verification Data:</B> Government-issued ID images, proof of address documents, police or FTC Identity Theft reports (where applicable), and other verification materials you choose to upload.</>,
              <><B>Financial Information:</B> Account numbers, balances, creditor information, and payment history as it appears on your credit report.</>,
              <><B>Communications:</B> Messages, support tickets, chat history, and any other communications submitted through our platform.</>,
              <><B>Usage & Technical Data:</B> IP address, browser type, device information, pages visited, time spent, and other analytics data used to improve our services.</>,
              <><B>Payment Information:</B> Subscription payment information processed securely through Stripe. ScoreShift does not store full payment card numbers.</>,
            ]} />
          </Section>

          <Section title="3. How We Use Your Information">
            We use the information we collect exclusively for the purpose of providing and improving our services, including:
            <BulletList color="#16A34A" items={[
              "Analyzing your credit reports to identify inaccurate, outdated, or unverifiable items eligible for dispute under the FCRA",
              "Generating and submitting dispute letters to Experian, Equifax, and/or TransUnion on your behalf",
              "Tracking the status of certified mail dispute letters and communicating outcomes to you",
              "Providing personalized credit-building recommendations, action plans, and educational resources",
              "Communicating with you about your account, progress updates, billing, and support",
              "Processing subscription payments and maintaining billing records",
              "Complying with applicable legal obligations, including FCRA, GLBA, and other federal and state requirements",
              "Detecting, preventing, and investigating fraudulent activity, identity theft, and unauthorized access",
            ]} />
            We do not use your personal or credit information for targeted advertising, data brokering, or any purpose unrelated to the credit repair and financial services described above.
          </Section>

          <Section title="4. FCRA Consumer Rights">
            As a consumer whose credit information is accessed through our platform, you have the following rights under the FCRA:
            <BulletList color="#7C3AED" items={[
              <><B>Right to Know:</B> You have the right to know what is in your credit file and to receive a free annual credit report from each bureau at AnnualCreditReport.com.</>,
              <><B>Right to Dispute:</B> You have the right to dispute inaccurate or incomplete information directly with the credit bureau or the information furnisher. ScoreShift assists clients in exercising this right.</>,
              <><B>Right to Correction:</B> Credit bureaus must correct or delete information found to be inaccurate, incomplete, or unverifiable, generally within 30 days of receiving a dispute.</>,
              <><B>Right to Limit Access:</B> You have the right to place a security freeze on your credit file with each of the major bureaus to restrict access to your credit report.</>,
              <><B>Right to Seek Damages:</B> If any entity violates your FCRA rights, you may have the right to seek actual damages, statutory damages, punitive damages, and attorney's fees by bringing a civil lawsuit.</>,
            ]} />
          </Section>

          <Section title="5. Sharing of Information">
            <strong style={{ color: "#1E1B18" }}>We do not sell, rent, or trade your personal information to any third party.</strong> We may share your information only in the following limited circumstances:
            <BulletList color="#D97706" items={[
              <><B>Credit Bureaus:</B> Experian, Equifax, and TransUnion, for the purpose of submitting disputes and communicating on your behalf as authorized under the FCRA.</>,
              <><B>Service Providers:</B> Carefully vetted third-party vendors including credit data access providers, Lob and USPS (certified mail), OpenAI and Anthropic (AI analysis), and Stripe (payment processing). All vendors are contractually required to protect your data.</>,
              <><B>Legal Requirements:</B> When required by applicable law, court order, subpoena, or regulatory request, or to protect the rights, property, or safety of ScoreShift, our clients, or the public.</>,
              <><B>Business Transfers:</B> In the event of a merger, acquisition, or sale of assets. We will notify you before your information is transferred and becomes subject to a different privacy policy.</>,
            ]} />
          </Section>

          <Section title="6. Data Protection">
            We implement robust administrative, technical, and physical safeguards to protect your information from unauthorized access, use, alteration, and disclosure. These measures include SSL/TLS encryption for all data in transit, AES-256 encryption for data at rest, hashed and salted password storage, multi-factor authentication options, role-based access controls, and regular security audits. In the event of a data breach that affects your personal information, we will notify you in accordance with applicable law.
          </Section>

          <Section title="7. Data Retention">
            We retain your personal and credit-related information for as long as your account is active or as necessary to provide services, comply with legal obligations, resolve disputes, and enforce our agreements. If you close your account or request deletion of your data, we will delete or anonymize your information within a reasonable timeframe. Certain records related to credit disputes, correspondence with credit bureaus, and financial transactions may be retained for up to seven (7) years in accordance with applicable law.
          </Section>

          <Section title="8. Consumer Choices">
            You have the following choices regarding your information:
            <BulletList color="#4338CA" items={[
              <><B>Access & Correction:</B> You may access and update your personal information at any time through your account settings or by contacting us.</>,
              <><B>Data Deletion:</B> You may request deletion of your personal data by contacting us, subject to any legal obligations requiring us to retain certain records.</>,
              <><B>Marketing Opt-Out:</B> You may opt out of promotional communications at any time using the unsubscribe link in any marketing email or by contacting us directly.</>,
              <><B>SMS Opt-Out:</B> If you have consented to receive SMS messages, you may opt out at any time by replying STOP to any message.</>,
              <><B>Credit Freeze:</B> You have the right to place a security freeze on your credit file directly with each credit bureau.</>,
            ]} />
          </Section>

          <Section title="9. Children's Privacy">
            ScoreShift's platform and services are intended solely for individuals who are 18 years of age or older. We do not knowingly collect, use, or disclose personal information from anyone under the age of 18. If we discover that we have collected personal information from a minor, we will promptly delete that information. If you believe we have inadvertently collected information from a minor, please contact us immediately.
          </Section>

          <Section title="10. Policy Updates">
            We may update this Privacy Policy periodically to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will update the date at the top of this Policy and provide notice through our platform and, where required by law, by direct communication to affected users. Your continued use of our platform following such notice constitutes your acceptance of the updated Policy.
          </Section>

          <Section title="11. Contact Information" last>
            If you have questions, concerns, or requests regarding this Privacy Policy, your personal information, or your FCRA rights, please contact us at:
            <ContactBox
              name="ScoreShift, Inc."
              email="privacy@scoreshift.io"
              location="Atlanta, Georgia, USA"
            />
          </Section>
        </div>
      </div>

      <footer className="ss-footer">
        <div className="ss-wrap ss-footer-inner">
          <Link href="/" className="ss-footer-logo">
            <img src="/images/scoreshift-logo-full.png" alt="ScoreShift" className="ss-footer-logo-img ss-footer-logo-bars" />
          </Link>
          <ul className="ss-footer-links">
            <li><Link href="/privacy-policy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><a href="mailto:hello@scoreshift.com">Contact</a></li>
          </ul>
          <span className="ss-footer-copy">© {new Date().getFullYear()} ScoreShift, Inc.</span>
        </div>
      </footer>
    </div>
  );
}

function B({ children }: { children: React.ReactNode }) {
  return <strong style={{ color: "#1E1B18", fontWeight: 600 }}>{children}</strong>;
}

function BulletList({ items, color }: { items: React.ReactNode[]; color: string }) {
  return (
    <ul style={{ margin: "16px 0 8px", padding: 0, listStyle: "none" }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, marginTop: "9px", flexShrink: 0 }} />
          <span style={{ fontSize: "15px", color: "rgba(30,27,24,0.60)", lineHeight: "1.80" }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Section({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ marginBottom: last ? 0 : "52px" }}>
      <h2 style={{
        fontSize: "19px", fontWeight: 600, letterSpacing: "-0.2px",
        color: "#1E1B18", margin: "0 0 16px",
        paddingBottom: "13px",
        borderBottom: "1px solid rgba(30,27,24,0.08)",
      }}>{title}</h2>
      <div style={{ fontSize: "15.5px", color: "rgba(30,27,24,0.60)", lineHeight: "1.85" }}>
        {children}
      </div>
    </div>
  );
}

function ContactBox({ name, email, location }: { name: string; email: string; location: string }) {
  return (
    <div style={{
      marginTop: "20px",
      padding: "24px 28px",
      background: "rgba(67,56,202,0.04)",
      borderRadius: "16px",
      border: "1px solid rgba(67,56,202,0.10)",
    }}>
      <p style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 600, color: "#1E1B18" }}>{name}</p>
      <p style={{ margin: "0 0 4px", fontSize: "14.5px", color: "rgba(30,27,24,0.55)" }}>
        Email: <a href={`mailto:${email}`} style={{ color: "#4338CA", textDecoration: "none" }}>{email}</a>
      </p>
      <p style={{ margin: 0, fontSize: "14.5px", color: "rgba(30,27,24,0.55)" }}>{location}</p>
    </div>
  );
}
