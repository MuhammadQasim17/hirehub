import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types/auth';
import {
  User as UserIcon,
  Mail,
  Briefcase,
  Link2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Save,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [resumeUrl, setResumeUrl] = useState(user?.resumeUrl || '');
  const [createdAt, setCreatedAt] = useState<string | undefined>(user?.createdAt);

  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(() => Boolean(isAuthenticated));
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showResumeHelp, setShowResumeHelp] = useState(false);

  // Authentication protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true, state: { from: '/profile' } });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Fetch current user's profile from backend on mount
  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      try {
        const response = await api.get<User>('/profile/me');
        if (!active) return;

        const data = response.data;
        setName(data.name || '');
        setHeadline(data.headline || '');
        setBio(data.bio || '');
        setResumeUrl(data.resumeUrl || '');
        setCreatedAt(data.createdAt);

        // Sync with AuthContext in case DB has newer fields
        updateUser(data);
      } catch {
        // Already initialized from user context
      } finally {
        if (active) {
          setIsLoadingProfile(false);
        }
      }
    };

    if (isAuthenticated) {
      void fetchProfile();
    }

    return () => {
      active = false;
    };
  }, [isAuthenticated, updateUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: {
        name: string;
        headline?: string;
        bio?: string;
        resumeUrl?: string;
      } = {
        name: name.trim(),
        headline: headline.trim() || undefined,
        bio: bio.trim() || undefined,
      };

      if (user?.role === 'CANDIDATE') {
        payload.resumeUrl = resumeUrl.trim() || undefined;
      }

      const response = await api.put<User>('/profile/me', payload);

      // Instantly synchronize with AuthContext and localStorage
      updateUser(response.data);

      setSuccessMessage('Profile saved successfully! Your details are now updated across HireHub.');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(
          err.response?.data?.error ||
            err.response?.data?.message ||
            'Failed to update profile. Please try again.'
        );
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred while saving profile.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Active Member';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'Active Member';
    }
  };

  if (authLoading || isLoadingProfile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
              {/* Avatar Initial */}
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-black text-2xl uppercase shadow-md shadow-indigo-100 shrink-0">
                {name ? name.charAt(0) : <UserIcon className="w-8 h-8" />}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{name}</h1>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                      user?.role === 'RECRUITER'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {user?.role === 'RECRUITER' ? 'Recruiter' : 'Candidate'}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user?.email}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Member since {formatDate(createdAt || user?.createdAt)}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Alert Banners */}
          {successMessage && (
            <div
              role="alert"
              className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm animate-fade-in"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm animate-fade-in"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Profile Edit Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
            {/* Full Name */}
            <div>
              <label
                htmlFor="profileName"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  id="profileName"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Your full name"
                  className="block w-full pl-10 pr-4 py-2.5 text-slate-900 bg-white border border-gray-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Email Address (Read-only) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="profileEmail"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>
                <span className="text-[11px] font-medium text-slate-400">Account login (read-only)</span>
              </div>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="profileEmail"
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="block w-full pl-10 pr-4 py-2.5 text-slate-500 bg-gray-50 border border-gray-200 rounded-lg text-sm cursor-not-allowed select-none"
                />
              </div>
            </div>

            {/* Professional Headline */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="profileHeadline"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Professional Headline
                </label>
                <span className="text-xs text-slate-400">One-line summary</span>
              </div>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <input
                  id="profileHeadline"
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder={
                    user?.role === 'RECRUITER'
                      ? 'e.g. Lead Technical Recruiter at Acme Corp'
                      : 'e.g. Full-Stack Software Engineer | React, Node.js & TypeScript'
                  }
                  className="block w-full pl-10 pr-4 py-2.5 text-slate-900 bg-white border border-gray-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Bio / About */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="profileBio"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Bio / About Me
                </label>
                <span className="text-xs text-slate-400">Tell recruiters or candidates about yourself</span>
              </div>
              <div className="relative rounded-lg shadow-2xs">
                <textarea
                  id="profileBio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your technical background, years of experience, key achievements, or team hiring objectives..."
                  className="block w-full p-3.5 text-slate-900 bg-white border border-gray-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors leading-relaxed"
                />
              </div>
            </div>

            {/* Resume URL Field (Candidate Only) */}
            {user?.role === 'CANDIDATE' && (
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <label
                      htmlFor="profileResumeUrl"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Default Resume Link
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowResumeHelp(!showResumeHelp)}
                      className="text-slate-400 hover:text-indigo-600 focus:outline-none cursor-pointer"
                      title="Learn about resume links"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>

                  {(() => {
                    const isResumeUrlValid = (() => {
                      if (!resumeUrl.trim()) return false;
                      try {
                        const parsed = new URL(resumeUrl.trim());
                        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
                      } catch {
                        return false;
                      }
                    })();

                    if (isResumeUrlValid) {
                      return (
                        <a
                          href={resumeUrl.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                          title="Preview resume in a new tab"
                        >
                          <span>Preview Resume</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      );
                    }

                    return (
                      <button
                        type="button"
                        disabled
                        title={
                          !resumeUrl.trim()
                            ? 'Enter a resume link below to enable preview'
                            : 'Please enter a valid URL starting with http:// or https:// to preview'
                        }
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 cursor-not-allowed select-none"
                      >
                        <span>Preview Resume</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                      </button>
                    );
                  })()}
                </div>

                <div className="relative rounded-lg shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Link2 className="h-4 w-4" />
                  </div>
                  <input
                    id="profileResumeUrl"
                    type="url"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    placeholder="https://drive.google.com/your-resume or https://yoursite.com/cv.pdf"
                    className="block w-full pl-10 pr-4 py-2.5 text-slate-900 bg-white border border-gray-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Helper Tooltip Box */}
                {showResumeHelp && (
                  <div className="mt-2.5 p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs text-slate-700 space-y-1.5 animate-in fade-in duration-150">
                    <div className="font-bold text-indigo-900 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                      <span>How to share your resume link:</span>
                    </div>
                    <p className="leading-relaxed">
                      Upload your PDF to Google Drive, Dropbox, Notion, or personal website. Set access to{' '}
                      <strong>&quot;Anyone with the link can view&quot;</strong> and paste the link here. This will automatically pre-fill your applications!
                    </p>
                  </div>
                )}
                {!showResumeHelp && (
                  <p className="mt-1 text-xs text-slate-500">
                    Auto-fills when applying to jobs. Supports Google Drive, Dropbox, Notion, or hosted PDFs.
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md shadow-indigo-100 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

