import React from 'react';

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-800 p-6 text-center">
           <h1 className="text-white font-bold text-xl uppercase tracking-wider">Sistema DAQ DP</h1>
        </div>
        <div className="p-8">
           <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center border-b pb-4">{title}</h2>
           {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;