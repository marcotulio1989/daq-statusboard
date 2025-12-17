import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import ControlPanel from './views/ControlPanel';
import TvView from './views/TvView';
import Login from './views/Login';
import Register from './views/Register';
import ForgotPassword from './views/ForgotPassword';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* TV View is public (read-only) so it can be opened on other screens via link with ?u=param */}
          <Route path="/tv" element={<TvView />} />
          
          {/* Protected Routes (Requires Login) */}
          <Route element={<ProtectedRoute />}>
             <Route path="/" element={<ControlPanel />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;