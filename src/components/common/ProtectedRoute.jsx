import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Feather } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas-light flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-700 text-white flex items-center justify-center animate-pulse shadow-md mb-4">
          <Feather className="w-6 h-6 animate-bounce" />
        </div>
        <p className="text-sm font-medium text-stone-600">Restoring session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
