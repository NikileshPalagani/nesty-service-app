import React, { useEffect } from 'react';
import { ArrowLeft, Shield, FileText, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface TermsAndConditionsViewProps {
  onBack?: () => void;
}

export const TermsAndConditionsView: React.FC<TermsAndConditionsViewProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Terms & Conditions — NESTY Smart Campus Dining';
  }, []);

  return (
    <div
      data-testid="terms_and_conditions_page"
      className="min-h-screen w-full bg-nesty-cream py-6 sm:py-10 px-4 sm:px-6 lg:px-8 selection:bg-nesty-gold selection:text-nesty-textPrimary"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Bar / Back button */}
        <div className="flex items-center justify-between gap-4">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              data-testid="terms_back_button"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-nesty-creamSurface border border-nesty-gold text-xs font-extrabold text-nesty-burgundy hover:bg-nesty-creamElevated transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to App</span>
            </button>
          ) : (
            <a
              href="/"
              data-testid="terms_home_link"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-nesty-creamSurface border border-nesty-gold text-xs font-extrabold text-nesty-burgundy hover:bg-nesty-creamElevated transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Nesty</span>
            </a>
          )}

          <div className="flex items-center gap-2 text-xs font-bold text-nesty-textSecondary">
            <Shield className="w-4 h-4 text-nesty-goldDark" />
            <span>Official Legal Documentation</span>
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
                  NESTY — Terms &amp; Conditions
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
              <span>Introduction</span>
            </h2>
            <p className="text-nesty-textSecondary">
              Welcome to NESTY (“the App”), a college canteen ordering platform intended to help eligible students view available canteen items, place orders, make payments through the supported payment method, and collect accepted orders. These Terms &amp; Conditions govern access to and use of NESTY. By accessing the App or using its services, you agree to these terms. If you do not agree, do not use the App.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                2
              </span>
              <span>Eligibility and authorised use</span>
            </h2>
            <p className="text-nesty-textSecondary">
              NESTY is intended for authorised users of the participating college/canteen. Users must provide accurate registration and contact details, keep account credentials confidential, and use only accounts they are authorised to access. Do not impersonate another person, create fraudulent orders, misuse payment features, interfere with the App, or attempt unauthorised access to another user&apos;s data or administrative functions.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                3
              </span>
              <span>Accounts and security</span>
            </h2>
            <p className="text-nesty-textSecondary">
              You are responsible for activity performed through your account, subject to applicable law. Notify the designated NESTY support contact if you suspect unauthorised access. Do not share passwords or verification codes. NESTY may restrict access when reasonably necessary to investigate suspected fraud, security incidents, misuse, or violations of these terms, subject to applicable law.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                4
              </span>
              <span>Menu, prices and availability</span>
            </h2>
            <p className="text-nesty-textSecondary">
              Menu items, descriptions, images, prices and availability are displayed for ordering convenience and may change. Product images are illustrative; actual appearance and serving may vary. An item is subject to availability and order acceptance. The final amount shown before payment should be reviewed before confirming an order. Do not promise availability or preparation times beyond what the App or canteen confirms.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                5
              </span>
              <span>Placing and collecting orders</span>
            </h2>
            <p className="text-nesty-textSecondary">
              Review the items, quantities, total and any displayed pickup information before confirming an order. Orders are subject to successful submission and acceptance by the system/canteen. Follow the displayed pickup instructions and collect your order at the designated canteen within the communicated collection window. Do not collect an order that does not belong to you. If an order is delayed, unavailable, duplicated, or incorrectly fulfilled, contact the designated support/canteen contact.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                6
              </span>
              <span>Payments</span>
            </h2>
            <p className="text-nesty-textSecondary">
              Payments are processed using the payment methods made available in NESTY, which may include a third-party payment provider. Payment status is determined by the verified payment/order records, not merely by a screenshot or an amount deducted from a bank account. Do not share card details, UPI PINs, passwords or OTPs with anyone. If a payment is deducted but the order is not confirmed, retain the transaction reference and contact support. NESTY does not promise that every payment issue will resolve instantly.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                7
              </span>
              <span>Cancellations and refunds</span>
            </h2>
            <p className="text-nesty-textSecondary">
              Cancellation eligibility, refund handling and timelines depend on the order status, the displayed canteen policy, the payment provider&apos;s process and applicable law. Do not claim that every order can be cancelled or that every payment is automatically refundable. If a refund is approved or legally due, it will be handled through the applicable payment/refund process. Users should contact the designated support/canteen contact with the order reference for assistance. Nothing in these terms limits any consumer right that cannot legally be excluded.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                8
              </span>
              <span>Food and allergen information</span>
            </h2>
            <p className="text-nesty-textSecondary">
              Food is prepared and supplied by the participating canteen. Users should review available item descriptions and ask the canteen directly about ingredients, allergens, dietary restrictions and preparation practices before ordering if they have concerns. NESTY must not invent ingredient, allergen, vegetarian/non-vegetarian or food-safety claims that are not verified by the canteen. Report a suspected food-quality or safety issue promptly to the canteen and appropriate authorities where necessary.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                9
              </span>
              <span>Acceptable use and service availability</span>
            </h2>
            <p className="text-nesty-textSecondary">
              Do not exploit bugs, disrupt service, submit false information, misuse another user&apos;s account, or attempt to bypass security or payment verification. The App may occasionally be unavailable due to maintenance, network issues, provider outages or other causes. We will take reasonable steps to maintain reliable service, but continuous uninterrupted access is not guaranteed.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                10
              </span>
              <span>Third-party services</span>
            </h2>
            <p className="text-nesty-textSecondary">
              Payment providers, hosting providers, email providers and other integrated services may operate under their own terms and privacy notices. NESTY cannot guarantee the availability of an independent third-party service. This section does not remove responsibilities imposed on NESTY by applicable law.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                11
              </span>
              <span>Personal information and privacy</span>
            </h2>
            <p className="text-nesty-textSecondary">
              NESTY may process information necessary to provide its services, such as account/contact details, order records and payment status references. Actual information collected, purposes, retention, sharing, security practices and user choices must be explained in a separate Privacy Policy based on the real implementation. Do not invent privacy practices. Link to a genuine Privacy Policy when available. Handle personal data in accordance with applicable Indian data-protection and other relevant laws.
            </p>
          </section>

          {/* Section 12 */}
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                12
              </span>
              <span>Intellectual property</span>
            </h2>
            <p className="text-nesty-textSecondary">
              NESTY&apos;s original branding, interface and content are protected to the extent permitted by law. Users may not copy, redistribute or misuse protected content without permission. Third-party names, logos and materials remain the property of their respective owners.
            </p>
          </section>

          {/* Section 13 */}
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                13
              </span>
              <span>Suspension and misuse</span>
            </h2>
            <p className="text-nesty-textSecondary">
              Access may be restricted where reasonably necessary for suspected fraud, security, misuse or a breach of these terms, subject to applicable law. Where appropriate, users may contact support to seek clarification or resolution. This clause does not authorise arbitrary denial of legally protected consumer rights.
            </p>
          </section>

          {/* Section 14 */}
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                14
              </span>
              <span>Complaints and support</span>
            </h2>
            <p className="text-nesty-textSecondary">
              For order, payment, food-quality, account or technical concerns, contact the verified support/canteen contact published in the App. Before release, identify and display the actual responsible operator&apos;s name and appropriate contact details, and the grievance contact/designation where required by applicable law. Do not fabricate contact details. If these details are missing, report this as a release blocker requiring my input.
            </p>
          </section>

          {/* Section 15 */}
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                15
              </span>
              <span>Changes to these terms</span>
            </h2>
            <p className="text-nesty-textSecondary">
              These terms may be updated when services or legal requirements change. The latest version and its effective/updated date should be displayed on this page. Material changes should be communicated where appropriate. Continued use is subject to applicable law and any consent or notice requirements.
            </p>
          </section>

          {/* Section 16 */}
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                16
              </span>
              <span>Applicable law and disputes</span>
            </h2>
            <p className="text-nesty-textSecondary">
              These terms are subject to the laws of India and any applicable mandatory consumer-protection and other legal rights. Disputes will be handled by the competent forums or authorities under applicable law. Nothing here prevents a user from exercising a statutory right or filing a complaint before a competent authority.
            </p>
          </section>

          {/* Section 17 */}
          <section className="space-y-3 pt-2">
            <h2 className="text-base font-extrabold text-nesty-burgundy flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-nesty-goldLight text-nesty-burgundy border border-nesty-gold text-xs">
                17
              </span>
              <span>Contact information</span>
            </h2>
            <p className="text-nesty-textSecondary">
              Display only the verified legal/operator name, address and support/grievance contact information supplied by the project owner. If any required details are missing, use an obvious unpublished placeholder during development and report exactly what must be provided before public release. Never invent these details.
            </p>

            <div className="rounded-2xl border-2 border-dashed border-nesty-gold bg-nesty-creamElevated p-4 sm:p-5 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-extrabold text-nesty-burgundy">
                <AlertTriangle className="w-4 h-4 text-nesty-warning" />
                <span>Verified Operator &amp; Grievance Contact Status</span>
              </div>
              <p className="text-nesty-textSecondary">
                In strict adherence with our preservation rules against publishing fabricated credentials, the designated legal operator, physical registered address, support telephone, and statutory Grievance Officer details are held pending owner provision:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 font-mono text-[11px]">
                <div className="p-2.5 rounded-xl bg-nesty-creamSurface border border-nesty-creamBorder">
                  <span className="text-nesty-textSecondary block text-[10px] uppercase font-sans font-bold">
                    Legal Operator / Entity:
                  </span>
                  <span className="font-extrabold text-nesty-burgundy">[PENDING OWNER PROVISION]</span>
                </div>
                <div className="p-2.5 rounded-xl bg-nesty-creamSurface border border-nesty-creamBorder">
                  <span className="text-nesty-textSecondary block text-[10px] uppercase font-sans font-bold">
                    Campus Canteen Location:
                  </span>
                  <span className="font-extrabold text-nesty-burgundy">CVR College of Engineering Canteen</span>
                </div>
                <div className="p-2.5 rounded-xl bg-nesty-creamSurface border border-nesty-creamBorder">
                  <span className="text-nesty-textSecondary block text-[10px] uppercase font-sans font-bold">
                    Registered Postal Address:
                  </span>
                  <span className="font-extrabold text-nesty-burgundy">[PENDING OWNER PROVISION]</span>
                </div>
                <div className="p-2.5 rounded-xl bg-nesty-creamSurface border border-nesty-creamBorder">
                  <span className="text-nesty-textSecondary block text-[10px] uppercase font-sans font-bold">
                    Support / Grievance Officer:
                  </span>
                  <span className="font-extrabold text-nesty-burgundy">[PENDING OWNER PROVISION]</span>
                </div>
              </div>
            </div>
          </section>

          {/* Footer note */}
          <div className="pt-6 border-t border-nesty-creamBorder text-xs text-nesty-textSecondary italic bg-nesty-goldLight/40 p-4 rounded-2xl border border-nesty-gold/50">
            &ldquo;By using NESTY, you acknowledge that you have read these Terms &amp; Conditions. Any consent or acceptance required for registration or an order must be obtained through a clear affirmative action.&rdquo;
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
