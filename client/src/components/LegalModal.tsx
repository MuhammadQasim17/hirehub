import React, { useEffect } from 'react';
import { X, Shield, ShieldCheck, FileText, Lock, Mail, ExternalLink } from 'lucide-react';

export type LegalModalType = 'privacy' | 'terms' | 'security';

interface LegalModalProps {
  isOpen: boolean;
  type: LegalModalType | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, type, onClose }) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !type) return null;

  const renderContent = () => {
    switch (type) {
      case 'privacy':
        return (
          <div className="space-y-5 text-sm text-slate-600 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
              <Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-950 font-medium">
                At HireHub, protecting your personal data, resume links, and job search privacy is fundamental to our core values. We do not sell your personal information.
              </p>
            </div>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900">1. Information We Collect</h4>
              <p>
                When you create an account as a Candidate or Recruiter, we collect your name, email address, account role, and encrypted password. Candidates may optionally provide professional headlines, biographies, and direct resume URLs (hosted via Google Drive, Dropbox, Notion, or personal portfolios).
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900">2. How Your Data Is Used</h4>
              <p>
                Your information is solely used to facilitate job applications, recruiter candidate discovery, and automated status communication. Candidate resumes and contact details are only visible to verified recruiters of job listings to which you explicitly submit an application.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900">3. Zero Third-Party Monetization</h4>
              <p>
                We do not sell, rent, or trade your candidate profile, contact details, or resume files to marketing platforms, advertisers, or external data brokers under any circumstances.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900">4. Candidate Control & Profile Rights</h4>
              <p>
                You retain complete ownership over your profile data. You can update your resume link, biography, or professional headline at any time from your HireHub Candidate Profile.
              </p>
            </section>
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-5 text-sm text-slate-600 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
              <FileText className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-950 font-medium">
                These Terms govern the rights, standards, and responsibilities of Candidates and Employers on the HireHub career platform.
              </p>
            </div>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900">1. Employer & Job Posting Guidelines</h4>
              <p>
                Recruiters must only publish legitimate, active, and lawful employment opportunities. Job listings must accurately represent job titles, compensation bands, employment type (Full-Time, Part-Time, Remote, Internship), and company identity. Unsolicited marketing or misleading postings are strictly prohibited.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900">2. Candidate Application Standards</h4>
              <p>
                Candidates agree to submit accurate, truthful information regarding their work experience, certifications, and skills. Submission of malicious links, fraudulent credentials, or automated application spam will result in immediate account suspension.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900">3. Fair Hiring & Non-Discrimination</h4>
              <p>
                HireHub upholds equal opportunity hiring principles. Employers may not discriminate based on race, gender, nationality, age, religion, or disability when evaluating submitted candidate applications.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900">4. Account Responsibility</h4>
              <p>
                Users are solely responsible for maintaining the confidentiality of their login credentials. Any activity originating from your authenticated account remains your sole legal responsibility.
              </p>
            </section>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-5 text-sm text-slate-600 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-950 font-medium">
                Our security architecture is built on defense-in-depth principles, cryptographic hashing, and verified transactional dispatch channels.
              </p>
            </div>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-indigo-600" />
                <span>1. Cryptographic Password Hashing</span>
              </h4>
              <p>
                All account passwords are encrypted prior to database persistence using salted bcrypt cryptographic hashing (<code className="text-xs font-mono bg-slate-100 px-1 py-0.5 rounded">bcryptjs</code>). Plaintext passwords are never logged, transmitted, or accessible to system administrators.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>2. JWT Stateless Session Security</span>
              </h4>
              <p>
                Client authentication is governed by digitally signed JSON Web Tokens (<code className="text-xs font-mono bg-slate-100 px-1 py-0.5 rounded">jsonwebtoken</code>). Every protected endpoint validates cryptographic token signatures and strictly enforces role permissions (<code className="text-xs font-mono bg-slate-100 px-1 py-0.5 rounded">CANDIDATE</code> vs <code className="text-xs font-mono bg-slate-100 px-1 py-0.5 rounded">RECRUITER</code>).
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-indigo-600" />
                <span>3. Verified System Dispatch (chirehub@gmail.com)</span>
              </h4>
              <p>
                To shield candidates from phishing attempts, all automated status alerts (Under Review, Accepted, and Concluded) are dispatched exclusively through our verified platform mailbox:
              </p>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800">
                <span>Official Mailbox:</span>
                <span className="text-indigo-600">chirehub@gmail.com</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                You can cross-reference this address directly with candidate alerts in your HireHub dashboard. HireHub will never ask for your password via email.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900">4. Reporting Vulnerabilities</h4>
              <p>
                If you detect a suspected security vulnerability or suspicious recruitment activity, please reach out directly to our security dispatch team at{' '}
                <a
                  href="mailto:chirehub@gmail.com?subject=Security%20Vulnerability%20Report"
                  className="font-medium text-indigo-600 hover:underline inline-flex items-center gap-0.5"
                >
                  <span>chirehub@gmail.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                .
              </p>
            </section>
          </div>
        );
    }
  };

  const getHeaderInfo = () => {
    switch (type) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          subtitle: 'How HireHub protects candidate & recruiter personal information',
          icon: <Shield className="w-5 h-5 text-indigo-600" />,
        };
      case 'terms':
        return {
          title: 'Terms of Service',
          subtitle: 'Platform usage rules, recruiter obligations, and candidate integrity',
          icon: <FileText className="w-5 h-5 text-indigo-600" />,
        };
      case 'security':
        return {
          title: 'Security & Trust Overview',
          subtitle: 'Cryptographic hashing, token authentication, and verified email dispatch',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-2xs">
              {headerInfo.icon}
            </div>
            <div>
              <h3 id="legal-modal-title" className="text-lg font-black text-slate-900 tracking-tight">
                {headerInfo.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{headerInfo.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex items-center justify-between gap-4">
          <span className="text-[11px] text-slate-400">
            Last updated: October 2026 • HireHub Platform
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

