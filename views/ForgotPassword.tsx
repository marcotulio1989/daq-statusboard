import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/AuthLayout';

const ForgotPassword: React.FC = () => {
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const { resetPass } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPass(username, newPassword)) {
       setMsg('Senha redefinida com sucesso! Redirecionando...');
       setIsError(false);
       setTimeout(() => navigate('/login'), 2000);
    } else {
       setMsg('Usuário não encontrado.');
       setIsError(true);
    }
  };

  return (
    <AuthLayout title="Redefinir Senha">
      <form onSubmit={handleSubmit} className="space-y-4">
        {msg && <div className={`p-3 rounded text-sm text-center font-bold ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{msg}</div>}
        
        <p className="text-sm text-gray-500 text-center mb-4">
            Digite seu nome de usuário e uma nova senha.
        </p>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Usuário</label>
          <input 
            type="text" 
            className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Nova Senha</label>
          <input 
            type="password" 
            className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="w-full bg-amber-500 text-white font-bold py-3 rounded hover:bg-amber-600 transition-colors">
          REDEFINIR
        </button>
      </form>
      <div className="mt-6 text-center text-sm">
         <Link to="/login" className="text-gray-600 hover:text-gray-900 font-bold">Voltar para Login</Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;