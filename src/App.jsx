import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Landing & Auth Pages
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// User Profiles (Phase 2)
import PublicProfile from './pages/PublicProfile';
import EditProfile from './pages/EditProfile';

// Authenticated Experience & Social Feed (Phase 3)
import Home from './pages/Home';
import Subscriptions from './pages/Subscriptions';
import Chat from './pages/Chat';
import Activity from './pages/Activity';
import Explore from './pages/Explore';
import Bookmarks from './pages/Bookmarks';

// Article Writing, Publishing & Reading (Phase 4 & 5)
import Write from './pages/Write';
import ArticleReadingView from './pages/ArticleReadingView';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing Page (Unauthenticated Visitors) */}
          <Route path="/" element={<Landing />} />

          {/* Authentication Pages */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Authenticated Home & Social Feed (Phase 3) */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Authenticated Navigation Pages */}
          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <Subscriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <ProtectedRoute>
                <Activity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <Explore />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookmarks"
            element={
              <ProtectedRoute>
                <Bookmarks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <Bookmarks />
              </ProtectedRoute>
            }
          />

          {/* Phase 4: Article Writing Editor & Draft Management */}
          <Route
            path="/write"
            element={
              <ProtectedRoute>
                <Write />
              </ProtectedRoute>
            }
          />
          <Route
            path="/write/:id"
            element={
              <ProtectedRoute>
                <Write />
              </ProtectedRoute>
            }
          />

          {/* Phase 4: My Stories / Author Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stories"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Phase 5: Professional Article Reading Experience */}
          <Route path="/p/:slug" element={<ArticleReadingView />} />
          <Route path="/story/:slug" element={<ArticleReadingView />} />
          <Route path="/post/:slug" element={<ArticleReadingView />} />

          {/* User Profile System (Phase 2) */}
          <Route path="/profile/:username" element={<PublicProfile />} />
          <Route
            path="/settings/profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
