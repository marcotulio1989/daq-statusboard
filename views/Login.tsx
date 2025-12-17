
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/AuthLayout';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Captura a URL base para compartilhamento
    let base = window.location.href.split('#')[0].split('?')[0];
    if (!base.endsWith('/')) base += '/';
    setCurrentUrl(base);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/');
    } else {
      setError('Credenciais inválidas.');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sistema DAQ DP',
          text: 'Acesse o Sistema DAQ DP',
          url: currentUrl,
        });
      } catch (err) {
        // Usuário cancelou ou erro
      }
    } else {
      navigator.clipboard.writeText(currentUrl);
      alert('Link copiado para a área de transferência!');
    }
  };

  return (
    <AuthLayout title="Acesso ao Sistema">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm text-center font-bold border border-red-200">
            {error}
          </div>
        )}
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase mb-1">Usuário</label>
          <input 
            type="text" 
            className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 font-bold" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase mb-1">Senha</label>
          <input 
            type="password" 
            className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 font-bold" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="w-full bg-[#002855] text-white font-black py-4 rounded-lg hover:bg-slate-900 transition-all shadow-lg active:scale-95 uppercase">
          Entrar no Sistema
        </button>
      </form>
      
      <div className="mt-6 text-center flex flex-col gap-4">
         <Link to="/register" className="text-blue-600 font-bold hover:underline text-sm uppercase tracking-tighter">
           Criar nova conta de acesso
         </Link>
         
         <div className="pt-4 border-t border-slate-100">
            <button 
              onClick={handleShare}
              className="text-slate-400 font-bold text-[10px] hover:text-[#002855] transition-colors uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Compartilhar Link do Sistema
            </button>
         </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
