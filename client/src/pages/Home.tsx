import React from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  FileText,
  Zap,
  Target,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  Building2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Home: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // Determine contextual routing for dual CTA buttons
  const browseJobsDestination = '/jobs';
  let secondaryCtaText = 'Post a Job';
  let secondaryCtaDestination = '/register';
  let SecondaryCtaIcon = PlusCircle;

  if (isAuthenticated) {
    if (user?.role === 'CANDIDATE') {
      secondaryCtaText = 'My Applications';
      secondaryCtaDestination = '/my-applications';
      SecondaryCtaIcon = FileText;
    } else if (user?.role === 'RECRUITER') {
      secondaryCtaText = 'Post a Job';
      secondaryCtaDestination = '/post-job';
      SecondaryCtaIcon = PlusCircle;
    }
  } else {
    secondaryCtaText = 'Post a Job';
    secondaryCtaDestination = '/register';
    SecondaryCtaIcon = PlusCircle;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
          {/* Subtle background glow effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-indigo-200/40 via-purple-100/30 to-blue-200/40 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Pill Banner */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs sm:text-sm font-semibold mb-8 shadow-2xs">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Next-Generation Career Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Connecting <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Top Talent</span> With Verified Companies
            </h1>

            {/* Subheadline */}
            <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 leading-relaxed">
              HireHub eliminates the friction of modern hiring. Whether you are an engineer seeking high-growth opportunities or an employer scaling your dream team, connect with clarity and speed.
            </p>

            {/* Dual CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
              <Link
                to={browseJobsDestination}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:-translate-y-0.5 cursor-pointer text-base"
              >
                <Search className="w-5 h-5" />
                <span>Browse Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to={secondaryCtaDestination}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-slate-800 bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer text-base"
              >
                <SecondaryCtaIcon className="w-5 h-5 text-indigo-600" />
                <span>{secondaryCtaText}</span>
              </Link>
            </div>

            {/* Trust Metrics Bar */}
            <div className="mt-16 pt-10 border-t border-gray-200/80 grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-2xl sm:text-3xl font-extrabold text-slate-900">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <span>10,000+</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Active Career Openings
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-2xl sm:text-3xl font-extrabold text-slate-900">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <span>2,500+</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Vetted Employers
                </div>
              </div>

              <div className="col-span-2 md:col-span-1 flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-2xl sm:text-3xl font-extrabold text-slate-900">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span>98%</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Placement Satisfaction
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition Feature Highlights Grid */}
        <section className="py-16 sm:py-24 bg-white border-y border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs sm:text-sm font-bold tracking-widest uppercase text-indigo-600 mb-2">
                Why HireHub
              </h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Built to modernize every stage of hiring
              </h3>
              <p className="mt-4 text-base text-slate-600">
                Say goodbye to ghost jobs, generic auto-responses, and tedious multi-page forms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature Card 1 */}
              <div className="bg-slate-50/70 hover:bg-slate-50 border border-gray-200 hover:border-indigo-200 rounded-2xl p-8 transition-all hover:shadow-md hover:-translate-y-1 flex flex-col">
                <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">
                  Quick Applications
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">
                  Apply in one click with your synced profile and resume. Keep your application progress transparent with real-time status updates from recruiters.
                </p>
                <div className="mt-6 pt-4 border-t border-gray-200/60 flex items-center text-xs font-semibold text-indigo-600">
                  <span>Streamlined submission flow</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="bg-slate-50/70 hover:bg-slate-50 border border-gray-200 hover:border-indigo-200 rounded-2xl p-8 transition-all hover:shadow-md hover:-translate-y-1 flex flex-col">
                <div className="h-12 w-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-6">
                  <Target className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">
                  Role-Targeted Matching
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">
                  Intelligent filtering matches candidates with open roles based on real technical proficiencies, compensation criteria, and preferred work environments.
                </p>
                <div className="mt-6 pt-4 border-t border-gray-200/60 flex items-center text-xs font-semibold text-violet-600">
                  <span>Precision candidate discovery</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>

              {/* Feature Card 3 */}
              <div className="bg-slate-50/70 hover:bg-slate-50 border border-gray-200 hover:border-indigo-200 rounded-2xl p-8 transition-all hover:shadow-md hover:-translate-y-1 flex flex-col">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">
                  Verified Recruiters
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">
                  Every company profile and posting is verified to ensure legitimate opportunities. Protect yourself against counterfeit postings, phantom listings, and salary ambiguity.
                </p>
                <div className="mt-6 pt-4 border-t border-gray-200/60 flex items-center text-xs font-semibold text-emerald-600">
                  <span>100% authenticated employers</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;

