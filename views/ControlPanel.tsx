
import React, { useState, useEffect, useRef } from 'react';
import { AppData, INITIAL_DATA, Boat, Flight, AcousticSystem, AcousticTransponder } from '../types';
import { getStoredData, saveData } from '../services/storage';
import { useAuth } from '../contexts/AuthContext';
import BoatList from '../components/BoatList';
import SlideRenderer from '../components/SlideRenderer';

const TABS = [
  { id: 'well', label: '1. POÇO & ROTA' },
  { id: 'eds_latch', label: '2. EDS & LATCH' },
  { id: 'boats', label: '3. BARCOS' },
  { id: 'equip_cargo', label: '4. EQUIP/CARGA' },
  { id: 'acoustic', label: '5. ACÚSTICO' },
  { id: 'weather', label: '6. PREV/VOOS' },
  { id: 'tags', label: '7. TAGS' },
  { id: 'config', label: '8. CONFIG' },
];

const ControlPanel: React.FC = () => {
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState('well');
  const [lastSaved, setLastSaved] = useState<string>('');
  const [previewIndex, setPreviewIndex] = useState(0);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.2);
  const { user, logout } = useAuth();
  
  const getAppBaseUrl = () => {
      let base = window.location.href.split('#')[0].split('?')[0];
      if (!base.endsWith('/')) base += '/';
      return base;
  };

  const currentBaseUrl = getAppBaseUrl();

  useEffect(() => {
    if (user?.username) {
        const loaded = getStoredData(user.username);
        setData(loaded);
        if (loaded.timestamp) setLastSaved(new Date(loaded.timestamp).toLocaleTimeString());
    }
  }, [user]);

  useEffect(() => {
    if (activeTab !== 'config') return;
    const updateScale = () => {
      if (previewContainerRef.current) {
        // limit scale to avoid the preview growing larger than its container
        const raw = previewContainerRef.current.offsetWidth / 1280;
        const limited = Math.max(0.2, Math.min(1, raw));
        setPreviewScale(limited);
      }
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (previewContainerRef.current) observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, [activeTab]);

  const handleSave = () => {
    if (user?.username) {
        saveData(user.username, data);
        setLastSaved(new Date().toLocaleTimeString());
    }
  };

  const shareLink = (url: string, title: string) => {
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copiado!');
    }
  };

  const openTvWindow = () => { if (user?.username) window.open(`${currentBaseUrl}#/tv?u=${encodeURIComponent(user.username)}`, '_blank'); };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans text-gray-800">
      <div className="bg-slate-800 p-4 sticky top-0 z-50 flex justify-between items-center shadow-md border-b-2 border-blue-500">
        <h1 className="text-white font-black text-lg hidden md:block uppercase tracking-tighter">DAQ DP SYSTEM V7</h1>
        <div className="flex items-center gap-4">
           <div className="bg-slate-700 px-3 py-1 rounded text-[10px] text-slate-300 font-bold uppercase">
              Operador: <span className="text-white">{user?.username}</span>
           </div>
           <button onClick={logout} className="bg-red-900/50 hover:bg-red-600 text-white text-[10px] font-bold px-3 py-2 rounded transition-colors uppercase border border-red-500/30">Sair</button>
           <button onClick={openTvWindow} className="bg-amber-400 text-black font-black px-4 py-2 text-xs rounded-lg shadow-[0_3px_0_#b45309] active:translate-y-1 transition-all uppercase">🖥️ Status Board</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="flex overflow-x-auto space-x-2 bg-white p-3 rounded-xl border-2 border-slate-200 mb-6 shadow-sm no-scrollbar">
          {TABS.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`px-5 py-2.5 rounded-lg text-xs font-black whitespace-nowrap transition-all uppercase ${activeTab === tab.id ? 'bg-[#002855] text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-slate-200">
          {activeTab === 'well' ? (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-2xl font-black text-[#002855] border-b-4 border-slate-100 pb-4 mb-6 uppercase">1. POÇO & ROTA</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Nome do Poço</label>
                    <input type="text" value={data.pocoNome || ''} onChange={e => setData({...data, pocoNome: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Coordenadas</label>
                    <input type="text" value={data.pocoCoordenadas || ''} onChange={e => setData({...data, pocoCoordenadas: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="LAT, LONG" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Informações da Rota</label>
                    <textarea value={data.pocoRota || ''} onChange={e => setData({...data, pocoRota: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 h-24" placeholder="Detalhes da rota..."></textarea>
                  </div>
               </div>
             </div>
          ) : activeTab === 'eds_latch' ? (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-2xl font-black text-[#002855] border-b-4 border-slate-100 pb-4 mb-6 uppercase">2. EDS & LATCH</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Status EDS</label>
                    <select value={data.edsStatus || ''} onChange={e => setData({...data, edsStatus: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500">
                      <option>Selecionar</option>
                      <option>OPERACIONAL</option>
                      <option>MANUTENÇÃO</option>
                      <option>INATIVO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Status LATCH</label>
                    <select value={data.latchStatus || ''} onChange={e => setData({...data, latchStatus: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500">
                      <option>Selecionar</option>
                      <option>ENGATED</option>
                      <option>DESENGATED</option>
                      <option>DEFEITO</option>
                    </select>
                  </div>
               </div>
             </div>
          ) : activeTab === 'equip_cargo' ? (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-2xl font-black text-[#002855] border-b-4 border-slate-100 pb-4 mb-6 uppercase">4. EQUIP/CARGA</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Tipo de Equipamento</label>
                    <input type="text" value={data.equipTipo || ''} onChange={e => setData({...data, equipTipo: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Quantidade</label>
                    <input type="number" value={data.equipQtd || ''} onChange={e => setData({...data, equipQtd: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Observações</label>
                    <textarea value={data.equipObs || ''} onChange={e => setData({...data, equipObs: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 h-20" placeholder="Notas sobre equipamento/carga..."></textarea>
                  </div>
               </div>
             </div>
          ) : activeTab === 'acoustic' ? (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-2xl font-black text-[#002855] border-b-4 border-slate-100 pb-4 mb-6 uppercase">5. ACÚSTICO</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Sistema Acústico</label>
                    <select value={data.acousticSystem || ''} onChange={e => setData({...data, acousticSystem: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500">
                      <option>Selecionar</option>
                      <option>ATIVO</option>
                      <option>INATIVO</option>
                      <option>TESTE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Frequência (kHz)</label>
                    <input type="number" value={data.acousticFreq || ''} onChange={e => setData({...data, acousticFreq: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Observações</label>
                    <textarea value={data.acousticObs || ''} onChange={e => setData({...data, acousticObs: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 h-20" placeholder="Notas acústicas..."></textarea>
                  </div>
               </div>
             </div>
          ) : activeTab === 'weather' ? (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-2xl font-black text-[#002855] border-b-4 border-slate-100 pb-4 mb-6 uppercase">6. PREVISÃO/VOOS</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Previsão Climática</label>
                    <select value={data.weatherStatus || ''} onChange={e => setData({...data, weatherStatus: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500">
                      <option>Selecionar</option>
                      <option>FAVORÁVEL</option>
                      <option>PARCIAL</option>
                      <option>DESFAVORÁVEL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Status de Voos</label>
                    <select value={data.flightStatus || ''} onChange={e => setData({...data, flightStatus: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500">
                      <option>Selecionar</option>
                      <option>NORMAL</option>
                      <option>RESTRITO</option>
                      <option>SUSPENSO</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Detalhes Adicionais</label>
                    <textarea value={data.weatherObs || ''} onChange={e => setData({...data, weatherObs: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 h-20" placeholder="Informações sobre previsão e voos..."></textarea>
                  </div>
               </div>
             </div>
          ) : activeTab === 'tags' ? (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-2xl font-black text-[#002855] border-b-4 border-slate-100 pb-4 mb-6 uppercase">7. TAGS</h2>
               <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Tags/Anotações</label>
                    <textarea value={data.tags || ''} onChange={e => setData({...data, tags: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 h-32" placeholder="Digite tags e anotações separadas por quebras de linha..."></textarea>
                  </div>
               </div>
             </div>
          ) : activeTab === 'config' ? (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-2xl font-black text-[#002855] border-b-4 border-slate-100 pb-4 mb-6 uppercase">8. CONFIGURAÇÃO</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <button 
                    onClick={() => shareLink(currentBaseUrl, 'Sistema DAQ DP - Login')}
                    className="bg-indigo-50 border-2 border-indigo-200 p-6 rounded-xl shadow-sm hover:bg-indigo-100 transition-all flex flex-col items-center gap-2 group"
                  >
                      <svg className="w-8 h-8 text-indigo-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      <span className="font-black text-[#002855] uppercase text-xs">Compartilhar Link de Acesso</span>
                   </button>

                   <button 
                    onClick={() => shareLink(`${currentBaseUrl}#/tv?u=${user?.username}`, 'DAQ DP - Status Board')}
                    className="bg-emerald-50 border-2 border-emerald-200 p-6 rounded-xl shadow-sm hover:bg-emerald-100 transition-all flex flex-col items-center gap-2 group"
                  >
                      <svg className="w-8 h-8 text-emerald-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="font-black text-[#002855] uppercase text-xs">Compartilhar Link da TV</span>
                   </button>
               </div>

               <div className="mt-10 border-t-2 border-slate-100 pt-6">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">🖥️ Visualização Prévia</h3>
                      <div className="flex gap-2">
                         {[0,1,2,3,4].map(idx => (
                           <button key={idx} onClick={() => setPreviewIndex(idx)} className={`w-8 h-8 rounded-full font-bold text-xs transition-all ${previewIndex === idx ? 'bg-blue-600 text-white scale-110 shadow-lg' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}>{idx + 1}</button>
                         ))}
                      </div>
                   </div>
                   
                   <div ref={previewContainerRef} className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden border-4 border-slate-200 shadow-2xl">
                       <div className="origin-top-left" style={{ width: '1280px', height: '720px', background: 'white', transform: `scale(${previewScale})` }}>
                          <SlideRenderer data={data} slideIndex={previewIndex} />
                       </div>
                   </div>
               </div>
             </div>
          ) : activeTab === 'boats' ? (
             <BoatList boats={data.listaBarcos} onChange={(newList) => setData({...data, listaBarcos: newList})} />
          ) : (
            <div className="text-center py-24 text-slate-400 font-black uppercase tracking-widest text-sm">Selecione uma das abas acima para editar</div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t-4 border-[#002855] p-5 flex flex-col items-center shadow-lg z-40">
         <div className="max-w-lg w-full">
            <button 
              onClick={handleSave} 
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 px-8 rounded-2xl w-full shadow-[0_5px_0_#059669] active:translate-y-1 active:shadow-none transition-all text-xl uppercase tracking-tighter"
            >
              SALVAR TUDO E ATUALIZAR TV
            </button>
            {lastSaved && <p className="text-center text-[10px] text-slate-400 font-bold mt-3 uppercase tracking-widest">Última atualização: {lastSaved}</p>}
         </div>
      </div>
    </div>
  );
};

export default ControlPanel;
