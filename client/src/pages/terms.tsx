import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import "../styles/landing.css";

export default function Terms() {
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
          src="/images/ss-legal-terms.png"
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
            Terms &amp; Conditions
          </h1>
          <p style={{ fontSize: "17px", color: "rgba(30,27,24,0.55)", lineHeight: "1.7", maxWidth: "500px", margin: "0 auto" }}>
            The terms that govern your use of ScoreShift products, tools, and services.
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

          <Section title="1. Introduction">
            Welcome to ScoreShift, Inc. ("ScoreShift," "we," "us," or "our"). By accessing or using our credit repair and financial services platform, you ("User," "Client," or "you") agree to be bound by these Terms of Use ("Terms"). These Terms are governed by applicable federal and state laws, including the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681 et seq., and the Credit Repair Organizations Act (CROA), 15 U.S.C. § 1679 et seq. If you do not agree to these Terms, you must immediately discontinue use of our platform.
          </Section>

          <Section title="2. FCRA Consumer Rights">
            Under the FCRA, you have the following rights regarding your credit information:
            <BulletList color="#7C3AED" items={[
              <><B>Right to Access:</B> You have the right to request and review a copy of your credit report from each of the three major credit bureaus once every 12 months at no cost through AnnualCreditReport.com.</>,
              <><B>Right to Dispute:</B> If you believe any information in your credit report is inaccurate, incomplete, or outdated, you have the right to dispute that information directly with the credit bureau or the information furnisher.</>,
              <><B>Right to Correction:</B> If your dispute is found to be valid, the credit bureau must correct or delete the inaccurate information, typically within 30 days of receiving your dispute.</>,
              <><B>Right to Know Who Accessed Your Report:</B> You have the right to know who has accessed your credit report. The credit bureaus are required to maintain records of inquiries.</>,
              <><B>Right to Opt Out:</B> You have the right to opt out of pre-screened credit and insurance offers by calling 1-888-5-OPT-OUT or visiting OptOutPrescreen.com.</>,
              <><B>Right to Sue:</B> You have the right to sue a company that violates the FCRA in state or federal court.</>,
            ]} />
          </Section>

          <Section title="3. Permissible Purpose & User Authorization">
            By using ScoreShift's platform, you expressly authorize us to:
            <BulletList color="#4338CA" items={[
              "Access, review, and analyze your credit reports from Experian, Equifax, and/or TransUnion on your behalf.",
              "Submit dispute letters to credit bureaus and data furnishers on your behalf as your authorized representative.",
              "Receive credit bureau responses and communicate outcomes to you through our platform.",
              "Use your personal information solely for the purpose of providing credit repair and related financial services.",
            ]} />
            This authorization constitutes a permissible purpose under the FCRA, 15 U.S.C. § 1681b(a)(3)(A). You may revoke this authorization at any time by contacting us in writing, though revocation will terminate your ability to use our services.
          </Section>

          <Section title="4. Credit Disputes & Educational Services">
            ScoreShift provides credit dispute assistance and educational resources to help you improve your credit health. You acknowledge and agree that:
            <BulletList color="#D97706" items={[
              "ScoreShift will only dispute information that appears to be inaccurate, incomplete, unverifiable, or outdated under the FCRA.",
              <>ScoreShift will never advise you to dispute accurate and verifiable negative information, create a new credit identity (also known as "credit privacy numbers" or "CPN"), or engage in any form of credit fraud.</>,
              "Credit repair results vary. ScoreShift does not guarantee a specific improvement in your credit score, the removal of any specific item, or any particular outcome.",
              "You have the right to dispute inaccurate information directly with credit bureaus at no cost, without the use of a credit repair organization.",
              "In accordance with CROA, you may cancel your agreement without penalty within three (3) business days of signing up. To cancel, email us at support@scoreshift.io with the subject line \"Cancel My ScoreShift Account.\"",
            ]} />
          </Section>

          <Section title="5. Accuracy of Information">
            You agree to provide accurate, current, and complete information when creating your account and using our services. Providing false or misleading information — including but not limited to your identity, Social Security Number, or credit history — is strictly prohibited and may constitute a violation of federal law, including identity fraud and wire fraud statutes. ScoreShift reserves the right to suspend or terminate your account and report suspected fraud to the appropriate authorities.
          </Section>

          <Section title="6. Data Security & Privacy">
            ScoreShift takes the security of your personal and financial information seriously. We implement industry-standard safeguards including:
            <BulletList color="#16A34A" items={[
              "Encrypted data transmission using SSL/TLS protocols",
              "Secure, encrypted storage of all personal and financial data",
              "Role-based access controls limiting who can view your data",
              "Regular security audits and vulnerability assessments",
            ]} />
            Your use of this platform is also subject to our{" "}
            <Link href="/privacy-policy" style={{ color: "#4338CA", textDecoration: "none" }}>Privacy Policy</Link>,
            which is incorporated into these Terms by reference.
          </Section>

          <Section title="7. Third-Party Services">
            ScoreShift may integrate with or utilize third-party service providers — including credit bureaus (Experian, Equifax, TransUnion), payment processors (Stripe), AI technology providers (OpenAI, Anthropic), mail delivery services (Lob, USPS), and credit data providers — to facilitate our services. These third parties have their own terms and privacy policies that govern their services. ScoreShift is not responsible for the practices or content of third-party services. Your authorization to use our platform includes authorization for us to interact with these third parties on your behalf solely for the purpose of providing our contracted services.
          </Section>

          <Section title="8. Limitation of Liability">
            To the fullest extent permitted by applicable law, ScoreShift, Inc. and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, consequential, or punitive damages arising out of or related to your use of the platform or services, including but not limited to changes to your credit score, denial of credit, or errors by credit bureaus. Our total cumulative liability to you for any claims arising under these Terms shall not exceed the total fees you paid to ScoreShift in the six (6) months preceding the claim. Nothing in these Terms limits our liability for fraud, gross negligence, or willful misconduct, or any liability that cannot be excluded under applicable law.
          </Section>

          <Section title="9. Changes to Terms">
            ScoreShift reserves the right to update or modify these Terms at any time. We will notify you of material changes by posting the updated Terms on our platform with a revised effective date, and where required by law, by providing direct notice via email. Your continued use of the platform following notification of changes constitutes your acceptance of the updated Terms. If you do not agree to any updated Terms, you must discontinue use of the platform.
          </Section>

          <Section title="10. Contact Information" last>
            If you have questions about these Terms, wish to exercise your FCRA rights, or need to contact us for any reason, please reach out to us at:
            <ContactBox
              name="ScoreShift, Inc."
              email="support@scoreshift.io"
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
