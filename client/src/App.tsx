import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Jobs } from './pages/Jobs';
import { PostJob } from './pages/PostJob';
import { MyApplications } from './pages/MyApplications';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { Profile } from './pages/Profile';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Primary Authentication & Landing Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Job Routes */}
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/post-job" element={<PostJob />} />

              {/* Application & Dashboard Routes */}
              <Route path="/my-applications" element={<MyApplications />} />
              <Route path="/applications" element={<Navigate to="/my-applications" replace />} />
              <Route path="/dashboard" element={<RecruiterDashboard />} />

              {/* Phase 4 Profile Route */}
              <Route path="/profile" element={<Profile />} />

              {/* Catch-all 404 route: redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
