import React, { useEffect } from 'react';
import { ArrowLeft, Shield, Lock, Eye, FileText, Database, Server, Smartphone, AlertTriangle } from 'lucide-react';

interface PrivacyPolicyViewProps {
  onBack?: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Privacy Policy — NESTY Smart Campus Dining';
  }, []);

  return (
    <div
      data-testid="privacy_policy_page"
      className="min-h-screen w-full bg-nesty-cream py-6 sm:py-10 px-4 sm:px-6 lg:px-8 selection:bg-nesty-gold selection:text-nesty-textPrimary"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Bar / Back button */}
        <div className="flex items-center justify-between gap-4">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              data-testid="privacy_back_button"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-nesty-creamSurface border border-nesty-gold text-xs font-extrabold text-nesty-burgundy hover:bg-nesty-creamElevated transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to App</span>
            </button>
          ) : (
            <a
              href="/"
              data-testid="privacy_home_link"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-nesty-creamSurface border border-nesty-gold text-xs font-extrabold text-nesty-burgundy hover:bg-nesty-creamElevated transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Nesty</span>
            </a>
          )}

          <div className="flex items-center gap-2 text-xs font-bold text-nesty-textSecondary">
            <Lock className="w-4 h-4 text-nesty-goldDark" />
            <span>Data Protection &amp; Privacy Practices</span>
          </div>
        </div>

        {/* Header Card */}
        <header className="rounded-3xl bg-gradient-to-r from-nesty-burgundyDark via-nesty-burgundy to-nesty-burgundyLight border-[1.5px] border-nesty-gold p-6 sm:p-8 text-nesty-cream shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-nesty-creamSurface border-2 border-nesty-gold p-1.5 shrink-0 shadow-md">
                <img
                  src="/images/nesty-logo.jpg"
                  alt="NESTY Official Logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div>
                <div className="text-[11px] font-extrabold tracking-widest uppercase text-nesty-gold">
                  SMART CAMPUS FOOD ORDERING • CVR CANTEEN
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
                  NESTY — Privacy Policy
                </h1>
              </div>
            </div>
            <div className="text-xs sm:text-right text-nesty-cream/85 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-nesty-gold/30">
              <div>
                <span className="text-nesty-gold font-bold">Effective Date:</span> October 14, 2026
              </div>
              <div className="mt-0.5">
                <span className="text-nesty-gold font-bold">Last Updated:</span> October 14, 2026
              </div>
              <div className="mt-0.5">
                <span className="text-nesty-gold font-bold">Policy Version:</span> 1.0
              </div>
            </div>
          </div>
        </header>

        {/* Content Body Card */}
        <main className="bg-nesty-creamSurface border border-nesty-creamBorder rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 text-nesty-textPrimary text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                1
              </span>
              <span>Overview &amp; Purpose</span>
            </h2>
            <p className="text-nesty-textSecondary">
              NESTY (&ldquo;the App&rdquo;) provides college students and faculty at CVR College of Engineering with digital canteen food ordering, menu browsing, campus counter pickup, and verified digital payment records. This Privacy Policy describes how NESTY collects, stores, processes, and protects your personal information in strict compliance with the Digital Personal Data Protection Act (DPDPA), 2023, the Information Technology Act, 2000, and applicable Indian data-protection regulations.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                2
              </span>
              <span>Information We Actually Collect</span>
            </h2>
            <p className="text-nesty-textSecondary">
              NESTY operates on data minimization. We collect only what is strictly necessary to provide canteen dining services:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-nesty-textSecondary">
              <li>
                <strong className="text-nesty-textPrimary">Student Account Details:</strong> Full name, campus email address (e.g. <code className="bg-nesty-cream px-1.5 py-0.5 rounded border border-nesty-creamBorder text-xs text-nesty-burgundy">@cvr.ac.in</code>), student roll number, contact telephone number, and designated pickup block counter (e.g., CB, CM, FB, PG).
              </li>
              <li>
                <strong className="text-nesty-textPrimary">Account Security Credentials:</strong> Passwords are never stored in plaintext; they are salted and hashed using cryptographic SHA-256 before persistence.
              </li>
              <li>
                <strong className="text-nesty-textPrimary">Order &amp; Food Records:</strong> Selected canteen menu items, quantities, order timestamps, preferred campus pickup block, order status (e.g., Preparing, Ready, Claimed), and Nesty reward coin transactions.
              </li>
              <li>
                <strong className="text-nesty-textPrimary">Payment Transaction References:</strong> Payment status (&apos;PAID&apos;, &apos;SUCCESS&apos;, &apos;FAILED&apos;), transaction IDs, payment gateway identifiers (e.g., Razorpay Order IDs), and payment mode (UPI / Online Gateway). <span className="font-bold text-nesty-burgundy">NESTY never collects, handles, or stores debit/credit card numbers, CVVs, or UPI PINs</span>; all financial transactions are processed securely through regulated third-party payment gateways.
              </li>
              <li>
                <strong className="text-nesty-textPrimary">Legal Consent Records:</strong> Installation identifier, accepted Terms &amp; Conditions version, accepted Privacy Policy version, and acceptance timestamp.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                3
              </span>
              <span>How We Use Your Information</span>
            </h2>
            <p className="text-nesty-textSecondary">
              Your information is processed exclusively for campus dining operations:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-nesty-textSecondary">
              <li>Authenticating student and admin logins via HMAC-SHA256 session tokens.</li>
              <li>Transmitting order line-items to the canteen preparation counter for fulfillment.</li>
              <li>Providing Order ID and Transaction ID verification receipts at counter pickup.</li>
              <li>Managing Nesty coin rewards and applying valid coupon discounts.</li>
              <li>Preventing unauthorized canteen counter claims and fraudulent duplicates.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                4
              </span>
              <span>Data Sharing &amp; Third Parties</span>
            </h2>
            <p className="text-nesty-textSecondary">
              NESTY does not sell, lease, or monetize your personal data. Data is shared strictly as necessary for operational fulfillment:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-nesty-textSecondary">
              <li>
                <strong className="text-nesty-textPrimary">Campus Canteen Staff / Administrators:</strong> Canteen staff receive order items, student names, and roll numbers solely to prepare, pack, and verify handover of campus meals.
              </li>
              <li>
                <strong className="text-nesty-textPrimary">Payment Service Providers (Razorpay / UPI):</strong> Payment metadata is transmitted over TLS/HTTPS directly to the payment aggregator to facilitate and verify transactions.
              </li>
              <li>
                <strong className="text-nesty-textPrimary">Hosting Infrastructure:</strong> NESTY application services and encrypted databases are hosted on ISO/IEC 27001-compliant cloud infrastructure (Render) with Cloudflare edge encryption.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                5
              </span>
              <span>Data Retention &amp; Storage</span>
            </h2>
            <p className="text-nesty-textSecondary">
              Data is retained only as long as necessary to serve your campus dining experience and satisfy financial audit requirements. Active orders are maintained for verification during the academic semester. First-launch legal consent status is stored in browser local storage on the user&apos;s device and synced with the authoritative backend consent register. You may request account deletion or data purge upon completing your academic program.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                6
              </span>
              <span>Security Practices</span>
            </h2>
            <p className="text-nesty-textSecondary">
              We employ strict technical and organizational safeguards:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-nesty-textSecondary">
              <li>End-to-end encrypted transport over HTTPS/TLS (TLS 1.2+).</li>
              <li>Salted SHA-256 cryptographic password hashing with zero plaintext password storage.</li>
              <li>Role-based access control (RBAC): student users cannot access admin endpoints or other student order records.</li>
              <li>Strict server-side validation preventing untrusted client data modification.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                7
              </span>
              <span>User Rights &amp; Choices</span>
            </h2>
            <p className="text-nesty-textSecondary">
              Under applicable Indian data protection law, you have the right to review your registered profile information, update inaccurate details via the Profile screen, review past order history, and withdraw consent or request account closure through the designated contact channel.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 pt-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                8
              </span>
              <span>Grievance Officer &amp; Contact Information</span>
            </h2>
            <p className="text-nesty-textSecondary">
              In compliance with the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the DPDPA, 2023, the designated legal operator, support email, and statutory Grievance Officer details are held pending owner provision:
            </p>

            <div className="rounded-2xl border-2 border-dashed border-nesty-gold bg-nesty-creamElevated p-4 sm:p-5 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-extrabold text-nesty-burgundy">
                <AlertTriangle className="w-4 h-4 text-nesty-warning" />
                <span>Verified Data Controller &amp; Grievance Status</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 font-mono text-[11px]">
                <div className="p-2.5 rounded-xl bg-nesty-creamSurface border border-nesty-creamBorder">
                  <span className="text-nesty-textSecondary block text-[10px] uppercase font-sans font-bold">
                    Data Controller:
                  </span>
                  <span className="font-extrabold text-nesty-burgundy">[PENDING OWNER PROVISION]</span>
                </div>
                <div className="p-2.5 rounded-xl bg-nesty-creamSurface border border-nesty-creamBorder">
                  <span className="text-nesty-textSecondary block text-[10px] uppercase font-sans font-bold">
                    Campus Location:
                  </span>
                  <span className="font-extrabold text-nesty-burgundy">CVR College of Engineering Canteen</span>
                </div>
                <div className="p-2.5 rounded-xl bg-nesty-creamSurface border border-nesty-creamBorder">
                  <span className="text-nesty-textSecondary block text-[10px] uppercase font-sans font-bold">
                    Privacy Inquiries:
                  </span>
                  <span className="font-extrabold text-nesty-burgundy">[PENDING OWNER PROVISION]</span>
                </div>
                <div className="p-2.5 rounded-xl bg-nesty-creamSurface border border-nesty-creamBorder">
                  <span className="text-nesty-textSecondary block text-[10px] uppercase font-sans font-bold">
                    Grievance Officer:
                  </span>
                  <span className="font-extrabold text-nesty-burgundy">[PENDING OWNER PROVISION]</span>
                </div>
              </div>
            </div>
          </section>

          {/* Footer note */}
          <div className="pt-6 border-t border-nesty-creamBorder text-xs text-nesty-textSecondary italic bg-nesty-goldLight/40 p-4 rounded-2xl border border-nesty-gold/50">
            &ldquo;By using NESTY, you acknowledge that you have reviewed this Privacy Policy and consent to the lawful processing of data necessary to provide canteen dining services.&rdquo;
          </div>
        </main>

        {/* Bottom Back Button */}
        <div className="text-center pt-2">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-nesty-burgundy text-nesty-cream font-extrabold text-xs hover:bg-nesty-burgundyDark transition shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to NESTY Application</span>
            </button>
          ) : (
            <a
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-nesty-burgundy text-nesty-cream font-extrabold text-xs hover:bg-nesty-burgundyDark transition shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to NESTY Application</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
