import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/AuthLayout';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    if (username.length < 3) {
      setError('O usuário deve ter pelo menos 3 caracteres.');
      return;
    }
    if (register(username, password)) {
      alert('Conta criada com sucesso! Faça login.');
      navigate('/login');
    } else {
      setError('Nome de usuário já existe.');
    }
  };

  return (
    <AuthLayout title="Criar Conta">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded text-sm text-center font-bold">{error}</div>}
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
          <label className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
          <input 
            type="password" 
            className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Confirmar Senha</label>
          <input 
            type="password" 
            className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900" 
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded hover:bg-emerald-700 transition-colors">
          CRIAR CONTA
        </button>
      </form>
      <div className="mt-6 text-center text-sm">
         <span className="text-gray-600">Já tem uma conta? </span>
         <Link to="/login" className="text-blue-600 font-bold hover:underline">Fazer Login</Link>
      </div>
    </AuthLayout>
  );
};

export default Register;