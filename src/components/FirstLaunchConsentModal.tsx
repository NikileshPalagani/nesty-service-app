import React, { useState } from 'react';
import { ShieldCheck, ExternalLink, AlertCircle, XCircle, CheckCircle2, FileText, Lock } from 'lucide-react';

export const CURRENT_TERMS_VERSION = '1.0';
export const CURRENT_PRIVACY_VERSION = '1.0';
export const CONSENT_STORAGE_KEY = 'nesty_legal_consent';

export interface LegalConsentRecord {
  termsVersion: string;
  privacyVersion: string;
  acceptedAt: string;
  installationId: string;
}

interface FirstLaunchConsentModalProps {
  onAccepted: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

export const FirstLaunchConsentModal: React.FC<FirstLaunchConsentModalProps> = ({
  onAccepted,
  onOpenTerms,
  onOpenPrivacy,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasRejected, setHasRejected] = useState(false);

  const handleAccept = async () => {
    if (!isChecked || isSaving) return;

    setIsSaving(true);
    setErrorMessage(null);

    try {
      // Generate or retrieve persistent installation identifier
      let installId = localStorage.getItem('nesty_install_id');
      if (!installId) {
        installId = `inst_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('nesty_install_id', installId);
      }

      const consentRecord: LegalConsentRecord = {
        termsVersion: CURRENT_TERMS_VERSION,
        privacyVersion: CURRENT_PRIVACY_VERSION,
        acceptedAt: new Date().toISOString(),
        installationId: installId,
      };

      // 1. Persist to local installation storage first (defensive check)
      const serialized = JSON.stringify(consentRecord);
      localStorage.setItem(CONSENT_STORAGE_KEY, serialized);

      // Verify that local write actually succeeded
      const verifyRead = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!verifyRead || verifyRead !== serialized) {
        throw new Error('Local device storage could not persist consent. Please check storage permissions.');
      }

      // 2. Attempt server-side consent logging (anonymous pre-login consent register)
      try {
        await fetch('/api/consent/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(consentRecord),
        });
      } catch (err) {
        // Non-blocking if offline/server cold start, as device consent is strictly verified
        console.warn('Anonymous server consent record sync deferred:', err);
      }

      // 3. Trigger parent transition to Login screen
      onAccepted();
    } catch (err: any) {
      console.error('Consent save failed:', err);
      setErrorMessage(
        err?.message || 'Failed to save consent. Please try again to continue.'
      );
      setIsSaving(false);
    }
  };

  const handleReject = () => {
    setHasRejected(true);
  };

  return (
    <div
      data-testid="first_launch_consent_screen"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto selection:bg-nesty-gold selection:text-nesty-textPrimary"
      style={{
        background: 'linear-gradient(135deg, rgba(43, 19, 23, 0.88) 0%, rgba(112, 31, 43, 0.92) 100%)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="w-full max-w-lg bg-nesty-creamSurface border-2 border-nesty-gold rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-fadeIn">
        {/* Header with NESTY branding */}
        <div className="flex items-center gap-4 border-b border-nesty-gold/40 pb-5">
          <div className="w-14 h-14 rounded-2xl bg-nesty-cream border-2 border-nesty-gold p-1.5 shrink-0 shadow-md">
            <img
              src="/images/nesty-logo.jpg"
              alt="Official Nesty Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-nesty-goldDark">
              SMART CAMPUS FOOD ORDERING
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-nesty-burgundy tracking-tight">
              Before you continue
            </h1>
          </div>
        </div>

        {/* Rejection State Modal View */}
        {hasRejected ? (
          <div className="space-y-5 py-2" data-testid="consent_rejection_notice">
            <div className="p-4 rounded-2xl bg-nesty-errorBg border border-nesty-error/40 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-nesty-error shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h2 className="text-sm font-extrabold text-nesty-error">Legal Agreement Required</h2>
                <p className="text-xs text-nesty-textSecondary leading-relaxed">
                  To ensure safe dining, counter order verification, and secure payment processing at CVR Canteen, acceptance of our Terms &amp; Conditions and Privacy Policy is required to use NESTY.
                </p>
              </div>
            </div>

            <p className="text-xs text-nesty-textSecondary">
              If you decline, you cannot proceed to sign in or order canteen meals through NESTY. You may return to review the policies at any time.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setHasRejected(false)}
                data-testid="consent_review_again_button"
                className="flex-1 py-3 px-4 rounded-xl bg-nesty-burgundy text-nesty-cream font-extrabold text-xs hover:bg-nesty-burgundyDark transition shadow-md"
              >
                Review &amp; Accept
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.history.length > 1) {
                    window.history.back();
                  } else {
                    window.location.href = 'about:blank';
                  }
                }}
                data-testid="consent_exit_button"
                className="py-3 px-4 rounded-xl border border-nesty-creamBorder text-nesty-textSecondary font-bold text-xs hover:bg-nesty-creamElevated transition"
              >
                Close / Exit
              </button>
            </div>
          </div>
        ) : (
          /* Main Consent Form */
          <div className="space-y-5">
            <p className="text-xs sm:text-sm text-nesty-textSecondary leading-relaxed">
              Please review and accept our Terms &amp; Conditions and Privacy Policy to continue to NESTY.
            </p>

            {/* Document Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="/terms-and-conditions"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  // Allow native ctrl+click / new tab or open via callback
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    e.preventDefault();
                    onOpenTerms();
                  }
                }}
                data-testid="consent_link_terms"
                className="p-3.5 rounded-2xl bg-nesty-creamElevated border border-nesty-gold/60 hover:border-nesty-gold flex items-center justify-between gap-3 group transition shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-nesty-burgundy text-nesty-cream flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-nesty-burgundy group-hover:text-nesty-burgundyDark truncate">
                      Terms &amp; Conditions
                    </div>
                    <div className="text-[10px] text-nesty-textSecondary font-medium">Version {CURRENT_TERMS_VERSION}</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-nesty-goldDark group-hover:translate-x-0.5 transition shrink-0" />
              </a>

              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    e.preventDefault();
                    onOpenPrivacy();
                  }
                }}
                data-testid="consent_link_privacy"
                className="p-3.5 rounded-2xl bg-nesty-creamElevated border border-nesty-gold/60 hover:border-nesty-gold flex items-center justify-between gap-3 group transition shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-nesty-burgundy text-nesty-cream flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-nesty-burgundy group-hover:text-nesty-burgundyDark truncate">
                      Privacy Policy
                    </div>
                    <div className="text-[10px] text-nesty-textSecondary font-medium">Version {CURRENT_PRIVACY_VERSION}</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-nesty-goldDark group-hover:translate-x-0.5 transition shrink-0" />
              </a>
            </div>

            {/* Affirmative Checkbox (Unchecked by default) */}
            <div className="p-4 rounded-2xl bg-nesty-goldLight/50 border border-nesty-gold/60">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    setIsChecked(e.target.checked);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  data-testid="consent_agreement_checkbox"
                  className="mt-0.5 w-4 h-4 rounded border-nesty-gold text-nesty-burgundy focus:ring-nesty-gold cursor-pointer shrink-0"
                />
                <span className="text-xs font-bold text-nesty-textPrimary leading-snug">
                  I have read and agree to the{' '}
                  <span className="text-nesty-burgundy font-extrabold">Terms &amp; Conditions</span> and{' '}
                  <span className="text-nesty-burgundy font-extrabold">Privacy Policy</span>.
                </span>
              </label>
            </div>

            {/* Error Message if persistence fails */}
            {errorMessage && (
              <div
                data-testid="consent_error_alert"
                className="p-3 rounded-xl bg-nesty-errorBg border border-nesty-error/40 flex items-center gap-2 text-xs font-extrabold text-nesty-error"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons: Reject & Accept */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReject}
                data-testid="consent_reject_button"
                className="py-3 px-5 rounded-xl border border-nesty-creamBorder bg-nesty-creamSurface text-nesty-textSecondary font-extrabold text-xs hover:bg-nesty-creamElevated transition"
              >
                Reject
              </button>

              <button
                type="button"
                onClick={handleAccept}
                disabled={!isChecked || isSaving}
                data-testid="consent_accept_continue_button"
                className="flex-1 py-3 px-4 rounded-xl bg-nesty-burgundy text-nesty-cream font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-nesty-burgundyDark transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isSaving ? (
                  <span>Saving Acceptance...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-nesty-gold" />
                    <span>Accept &amp; Continue</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
