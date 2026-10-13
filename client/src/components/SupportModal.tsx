import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api/axios';
import {
  X,
  Mail,
  Copy,
  Check,
  Send,
  Loader2,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const [senderEmail, setSenderEmail] = useState(() => user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClose = () => {
    setIsSubmitted(false);
    setErrorMessage(null);
    setMessage('');
    setSubject('');
    if (user?.email) {
      setSenderEmail(user.email);
    }
    onClose();
  };

  // Handle Escape key to close
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

  if (!isOpen) return null;

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('chirehub@gmail.com');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!senderEmail.trim() || !subject.trim() || !message.trim()) {
      setErrorMessage('Please provide your email address, subject, and message.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/support', {
        email: senderEmail.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
      setIsSubmitted(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(
          err.response?.data?.error ||
            err.response?.data?.message ||
            'Failed to dispatch message. Please try again or email chirehub@gmail.com directly.'
        );
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred while sending your inquiry.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setMessage('');
    setSubject('');
    setIsSubmitted(false);
    setErrorMessage(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 id="support-modal-title" className="text-lg font-black text-slate-900 tracking-tight">
                Contact Platform Support
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Reach our team for account assistance, verification, or platform feedback.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Official Mailbox Banner with 1-Click Copy */}
          <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Official Support Mailbox</span>
              </div>
              <div className="font-mono text-sm font-semibold text-slate-800">
                chirehub@gmail.com
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 border border-indigo-200 shadow-2xs transition-all cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Email</span>
                  </>
                )}
              </button>

              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=chirehub@gmail.com&su=${encodeURIComponent(
                  subject.trim() || 'HireHub Support Inquiry'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-gray-200 shadow-2xs transition-colors"
                title="Compose email directly in Gmail Web"
              >
                <span>Open Gmail</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Interactive Form or Success View */}
          {isSubmitted ? (
            <div className="py-6 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">Message Dispatched!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out! Our support team will review your inquiry and reply to{' '}
                  <span className="font-medium text-slate-800">{senderEmail}</span> shortly.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Your Email */}
              <div>
                <label
                  htmlFor="supportSenderEmail"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Your Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="supportSenderEmail"
                  type="email"
                  required
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full px-3.5 py-2 text-xs sm:text-sm text-slate-900 bg-white border border-gray-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="supportSubject"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  id="supportSubject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Account verification or Job application inquiry"
                  className="block w-full px-3.5 py-2 text-xs sm:text-sm text-slate-900 bg-white border border-gray-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="supportMessage"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Message / Inquiry <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="supportMessage"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can our support team assist you today?"
                  className="block w-full p-3 text-xs sm:text-sm text-slate-900 bg-white border border-gray-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors leading-relaxed"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Inquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
