import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Show a simple loader while checking session to prevent flashing login screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
         <div className="text-slate-500 font-bold animate-pulse uppercase tracking-widest">Carregando Sistema...</div>
      </div>
    );
  }

  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user exists, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;