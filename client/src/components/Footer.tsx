import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Mail,
  ShieldCheck,
  Search,
  PlusCircle,
  FileText,
  UserCheck,
} from 'lucide-react';
import { LegalModal, type LegalModalType } from './LegalModal';
import { SupportModal } from './SupportModal';

export const Footer: React.FC = () => {
  const [activeLegalModal, setActiveLegalModal] = useState<LegalModalType | null>(null);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      {/* Trust & Notifications Notice Banner */}
      <div className="bg-indigo-50/70 border-b border-indigo-100 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-200">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  Official System Notifications:
                </span>
                <button
                  type="button"
                  onClick={() => setIsSupportOpen(true)}
                  className="inline-flex items-center gap-1 font-mono text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-white px-2.5 py-0.5 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                  title="Contact Support or copy official email"
                >
                  <span>chirehub@gmail.com</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                All automated status updates, application receipts, and hiring alerts are dispatched exclusively from this address.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white/80 px-3.5 py-1.5 rounded-xl border border-gray-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Automated Transactional Dispatch Online</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                Hire<span className="text-indigo-600">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
              The modern career platform connecting top verified talent with vetted companies. Zero friction, automated candidate feedback, and fast hiring.
            </p>
          </div>

          {/* Candidate Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              For Candidates
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span>Find Jobs</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/my-applications"
                  className="inline-flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Track Applications</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Candidate Profile</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Recruiter Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              For Employers
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link
                  to="/post-job"
                  className="inline-flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Post a Job Opening</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                >
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>Recruiter Pipeline</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsSupportOpen(true)}
                  className="inline-flex items-center gap-1.5 hover:text-indigo-600 transition-colors group cursor-pointer text-left"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  <span>Contact Support</span>
                  <span className="text-[11px] font-mono text-slate-400 group-hover:text-indigo-500 transition-colors">
                    (chirehub@gmail.com)
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Legal Links */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} HireHub Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveLegalModal('privacy')}
              className="text-xs text-slate-500 hover:text-slate-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setActiveLegalModal('terms')}
              className="text-xs text-slate-500 hover:text-slate-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => setActiveLegalModal('security')}
              className="text-xs text-slate-500 hover:text-slate-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              Security
            </button>
          </div>
        </div>
      </div>

      {/* Legal & Security Modal */}
      <LegalModal
        isOpen={Boolean(activeLegalModal)}
        type={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
      />

      {/* Contact Support Modal */}
      {isSupportOpen && (
        <SupportModal
          isOpen={isSupportOpen}
          onClose={() => setIsSupportOpen(false)}
        />
      )}
    </footer>
  );
};

export default Footer;

