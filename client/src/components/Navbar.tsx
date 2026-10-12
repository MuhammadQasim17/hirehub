import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Briefcase,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  PlusCircle,
  LayoutDashboard,
  Search,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setMobileMenuOpen(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              onClick={closeMenu}
              className="flex items-center gap-2.5 group transition-transform duration-200 hover:scale-[1.02]"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Hire<span className="text-indigo-600">Hub</span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center ml-10 space-x-1">
              {!isAuthenticated ? (
                <Link
                  to="/jobs"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/jobs')
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Find Jobs
                </Link>
              ) : user?.role === 'RECRUITER' ? (
                <>
                  <Link
                    to="/jobs"
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/jobs')
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    Find Jobs
                  </Link>
                  <Link
                    to="/post-job"
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/post-job')
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Post a Job
                  </Link>
                  <Link
                    to="/dashboard"
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/dashboard')
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/profile')
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                    }`}
                  >
                    <UserIcon className="w-4 h-4" />
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/jobs"
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/jobs')
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    Find Jobs
                  </Link>
                  <Link
                    to="/my-applications"
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/my-applications') || isActive('/applications')
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    My Applications
                  </Link>
                  <Link
                    to="/profile"
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/profile')
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                    }`}
                  >
                    <UserIcon className="w-4 h-4" />
                    Profile
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all shadow-indigo-200 hover:shadow-md"
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                {/* User Info & Role Badge - links to /profile */}
                <Link
                  to="/profile"
                  className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                    isActive('/profile')
                      ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 text-indigo-700'
                      : 'bg-gray-50 border-gray-200 hover:bg-indigo-50/60 hover:border-indigo-300 hover:shadow-xs'
                  }`}
                  title="View and edit profile"
                >
                  <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {user?.name ? user.name.charAt(0) : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-sm font-semibold text-slate-800 max-w-[120px] truncate group-hover:text-indigo-600 transition-colors">
                    {user?.name}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                      user?.role === 'RECRUITER'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {user?.role === 'RECRUITER' ? 'Recruiter' : 'Candidate'}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          {isAuthenticated && user && (
            <Link
              to="/profile"
              onClick={closeMenu}
              className="flex items-center justify-between pb-3 border-b border-gray-100 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm uppercase">
                  {user.name ? user.name.charAt(0) : <UserIcon className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>
              </div>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                  user.role === 'RECRUITER'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {user.role === 'RECRUITER' ? 'Recruiter' : 'Candidate'}
              </span>
            </Link>
          )}

          <div className="space-y-1">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/jobs"
                  onClick={closeMenu}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-gray-100"
                >
                  <Search className="w-5 h-5 text-indigo-600" />
                  Find Jobs
                </Link>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="w-full text-center py-2.5 px-4 rounded-lg text-sm font-medium border border-gray-300 text-slate-700 hover:bg-gray-50 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="w-full text-center py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                  >
                    Register
                  </Link>
                </div>
              </>
            ) : user?.role === 'RECRUITER' ? (
              <>
                <Link
                  to="/jobs"
                  onClick={closeMenu}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-gray-100"
                >
                  <Search className="w-5 h-5 text-indigo-600" />
                  Find Jobs
                </Link>
                <Link
                  to="/post-job"
                  onClick={closeMenu}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-gray-100"
                >
                  <PlusCircle className="w-5 h-5 text-indigo-600" />
                  Post a Job
                </Link>
                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-gray-100"
                >
                  <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/jobs"
                  onClick={closeMenu}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-gray-100"
                >
                  <Search className="w-5 h-5 text-indigo-600" />
                  Find Jobs
                </Link>
                <Link
                  to="/my-applications"
                  onClick={closeMenu}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-gray-100"
                >
                  <FileText className="w-5 h-5 text-indigo-600" />
                  My Applications
                </Link>
              </>
            )}

            {isAuthenticated && (
              <div className="pt-2 border-t border-gray-100 space-y-1">
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-gray-100 transition-colors"
                >
                  <UserIcon className="w-5 h-5 text-indigo-600" />
                  <span>My Profile</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

