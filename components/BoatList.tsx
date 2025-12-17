import React, { useState } from 'react';
import { Boat, Op } from '../types';

interface BoatListProps {
  boats: Boat[];
  onChange: (boats: Boat[]) => void;
}

const OP_LOCATIONS = ['PORT FWD', 'PORT AFT', 'STBD FWD', 'STBD AFT'];

const BoatList: React.FC<BoatListProps> = ({ boats, onChange }) => {
  const [newOpText, setNewOpText] = useState<{ [key: number]: string }>({});
  const [newOpPrio, setNewOpPrio] = useState<{ [key: number]: number }>({});
  
  // Track which boats have unsaved changes
  const [unsavedBoats, setUnsavedBoats] = useState<{ [key: number]: boolean }>({});

  // Modals state
  const [reportBoat, setReportBoat] = useState<Boat | null>(null);
  const [departureModalBoatIndex, setDepartureModalBoatIndex] = useState<number | null>(null);
  
  // Edit Operation Modal State
  const [editingOpState, setEditingOpState] = useState<{ boatIndex: number, opId: number, text: string, prio: number } | null>(null);
  
  // Temporary state for departure modal editing
  const [tempDepartureData, setTempDepartureData] = useState({
     departureTime: '',
     destination: '',
     eta: ''
  });

  // Calculate taken locations globally for the list
  const takenLocations = new Set(boats.filter(b => b.tipo === 'OPERANDO' && b.local).map(b => b.local));

  // Helper to get current formatted time DD/MM HH:MM
  const getCurrentDateTime = () => {
     const now = new Date();
     const d = String(now.getDate()).padStart(2, '0');
     const m = String(now.getMonth() + 1).padStart(2, '0');
     const h = String(now.getHours()).padStart(2, '0');
     const min = String(now.getMinutes()).padStart(2, '0');
     return `${d}/${m} ${h}:${min}`;
  };

  // Helper: Format DD/MM HH:MM (strict mask)
  const formatDateTimeInput = (val: string) => {
     const v = val.replace(/\D/g, '').slice(0, 8); // max 8 digits
     if (v.length > 6) return `${v.slice(0,2)}/${v.slice(2,4)} ${v.slice(4,6)}:${v.slice(6)}`;
     if (v.length > 4) return `${v.slice(0,2)}/${v.slice(2,4)} ${v.slice(4)}`;
     if (v.length > 2) return `${v.slice(0,2)}/${v.slice(2)}`;
     return v;
  };

  const markDirty = (index: number) => {
    setUnsavedBoats(prev => ({ ...prev, [index]: true }));
  };

  const markClean = (index: number) => {
    setUnsavedBoats(prev => ({ ...prev, [index]: false }));
  };

  const updateBoat = (index: number, field: keyof Boat, value: any) => {
    const newBoats = [...boats];
    newBoats[index] = { ...newBoats[index], [field]: value };
    
    // Auto-logic for type changes
    if (field === 'tipo') {
      if (value === 'OPERANDO') {
          // Find first available location, excluding current boats
          // Recalculate taken locations excluding THIS boat (since we are changing it)
          const otherTaken = new Set(newBoats.filter((b, idx) => idx !== index && b.tipo === 'OPERANDO' && b.local).map(b => b.local));
          const firstFree = OP_LOCATIONS.find(loc => !otherTaken.has(loc)) || 'PORT FWD'; // Default to PORT FWD if all full (conflict handled visually)
          
          newBoats[index].local = firstFree;
          // Ensure orientation has a default
          if (!newBoats[index].orientation) newBoats[index].orientation = 'BOW TO BOW';
      }
      else if (value === 'STAND BY') newBoats[index].local = 'AM 11';
      else if (value === 'DEPARTED') {
         newBoats[index].local = '';
         if (!newBoats[index].departureTime) {
             newBoats[index].departureTime = new Date().toLocaleTimeString().slice(0, 5);
         }
      } else {
        newBoats[index].local = '';
      }
    }
    onChange(newBoats);
    markDirty(index);
  };

  const saveBoat = (index: number) => {
    // Updates the time and marks as clean
    const newBoats = [...boats];
    newBoats[index] = { ...newBoats[index], hora: new Date().toLocaleTimeString().slice(0, 5) };
    onChange(newBoats);
    markClean(index);
  };

  const removeBoat = (index: number) => {
    if (window.confirm('Remover Barco?')) {
      const newBoats = boats.filter((_, i) => i !== index);
      onChange(newBoats);
    }
  };

  const openReportModal = (boat: Boat) => {
    setReportBoat(boat);
  };

  const generateIndividualReportText = (boat: Boat) => {
     let txt = `RELATÓRIO INDIVIDUAL: ${boat.nome}\n`;
     
     if (boat.tipo === 'DEPARTED') {
         txt += `Status: ${boat.tipo}\n`;
         if (boat.departureTime) txt += `Saída: ${boat.departureTime}\n`;
         if (boat.destination) txt += `Destino: ${boat.destination}\n`;
         if (boat.eta) txt += `ETA: ${boat.eta}\n`;
     } else {
         txt += `Status: ${boat.tipo}\nLocal: ${boat.local}\nChegada: ${boat.arrival}\n`;
         if (boat.tipo === 'OPERANDO' && boat.orientation) {
             txt += `Orientação: ${boat.orientation}\n`;
         }
     }
     
     if(boat.ops.length > 0) {
        txt += "Operações:\n";
        boat.ops.forEach(o => {
           const status = o.status === 'PENDING' ? (boat.activeOpId === o.id ? '[EM ANDAMENTO]' : '[PENDENTE]') : `[${o.status}]`;
           txt += `- ${o.desc} (P${o.prio}) ${status}\n`;
        });
     }
     return txt;
  };

  const addOp = (index: number) => {
    const text = newOpText[index];
    const prio = newOpPrio[index] || 1;
    if (!text) return;

    const newBoats = [...boats];
    newBoats[index] = {
      ...newBoats[index],
      ops: [
        ...newBoats[index].ops,
        {
          id: Date.now(),
          desc: text,
          prio: prio,
          status: 'PENDING'
        }
      ]
    };
    newBoats[index].ops.sort((a, b) => a.prio - b.prio);
    onChange(newBoats);
    setNewOpText(prev => ({ ...prev, [index]: '' }));
    markDirty(index);
  };

  const toggleOp = (boatIndex: number, opId: number) => {
    const newBoats = [...boats];
    const currentActive = newBoats[boatIndex].activeOpId;
    newBoats[boatIndex] = {
      ...newBoats[boatIndex],
      activeOpId: currentActive === opId ? null : opId
    };
    onChange(newBoats);
    markDirty(boatIndex);
  };

  const changeOpStatus = (boatIndex: number, opId: number, status: Op['status']) => {
    const newBoats = [...boats];
    const boat = newBoats[boatIndex];
    
    const newOps = boat.ops.map(o => {
      if (o.id === opId) {
        return { ...o, status: o.status === status ? 'PENDING' : status };
      }
      return o;
    });

    let newActiveId = boat.activeOpId;
    if (boat.activeOpId === opId && status !== 'PENDING') {
       newActiveId = null;
    }

    newBoats[boatIndex] = { ...boat, ops: newOps, activeOpId: newActiveId };
    onChange(newBoats);
    markDirty(boatIndex);
  };

  const openEditOpModal = (boatIndex: number, opId: number) => {
    const boat = boats[boatIndex];
    const op = boat.ops.find(o => o.id === opId);
    if (!op) return;
    setEditingOpState({ boatIndex, opId, text: op.desc, prio: op.prio });
  };

  const saveEditOp = () => {
    if (!editingOpState) return;
    const { boatIndex, opId, text, prio } = editingOpState;
    
    if (text.trim() === '') return;

    const newBoats = [...boats];
    const boat = newBoats[boatIndex];
    const newOps = boat.ops.map(o => o.id === opId ? { ...o, desc: text, prio: prio } : o);
    
    // Sort ops by prio again
    newOps.sort((a, b) => a.prio - b.prio);

    newBoats[boatIndex] = { ...boat, ops: newOps };
    
    onChange(newBoats);
    markDirty(boatIndex);
    setEditingOpState(null);
  };

  const removeOp = (boatIndex: number, opId: number) => {
    const newBoats = [...boats];
    const newOps = newBoats[boatIndex].ops.filter(o => o.id !== opId);
    newBoats[boatIndex] = { ...newBoats[boatIndex], ops: newOps };
    onChange(newBoats);
    markDirty(boatIndex);
  };

  const openDepartureModal = (index: number) => {
      const boat = boats[index];
      setTempDepartureData({
          departureTime: boat.departureTime || '',
          destination: boat.destination || '',
          eta: boat.eta || ''
      });
      setDepartureModalBoatIndex(index);
  };

  const saveDepartureData = () => {
      if (departureModalBoatIndex === null) return;
      const index = departureModalBoatIndex;
      const newBoats = [...boats];
      newBoats[index] = {
          ...newBoats[index],
          departureTime: tempDepartureData.departureTime,
          destination: tempDepartureData.destination,
          eta: tempDepartureData.eta
      };
      onChange(newBoats);
      markDirty(index);
      setDepartureModalBoatIndex(null);
  };

  return (
    <div className="space-y-6">
      {boats.map((b, i) => {
        let borderColor = 'border-l-gray-400';
        let bgColor = 'bg-gray-50';
        
        if (b.tipo === 'OPERANDO') {
           if (b.local && b.local.includes('PORT')) {
              borderColor = 'border-l-red-500';
              bgColor = 'bg-red-50';
           } else {
              // Default to green (STBD or undefined)
              borderColor = 'border-l-emerald-500';
              bgColor = 'bg-green-50';
           }
        }
        else if (b.tipo === 'STAND BY') { 
           borderColor = 'border-l-amber-500'; 
           bgColor = 'bg-amber-50'; 
        }

        const isDirty = unsavedBoats[i];
        
        // Check if departure info is filled
        const hasDepartureInfo = !!(b.destination || b.eta);
        
        // Calculate available locations for THIS boat (all global taken minus this boat's current location)
        const availableLocations = OP_LOCATIONS.filter(loc => !takenLocations.has(loc) || loc === b.local);

        return (
          <div key={b.id} className={`border border-gray-200 border-l-8 rounded-lg shadow-sm ${borderColor} ${bgColor}`}>
            
            {/* Header / Toolbar */}
            <div className="flex justify-between items-center p-3 border-b bg-white/50 rounded-t-lg">
              <div className="flex items-center gap-3">
                 <span className="font-bold text-xl text-slate-700">#{i + 1}</span>
                 {isDirty ? (
                    <span className="flex items-center gap-1 text-[10px] uppercase font-black text-red-600 bg-red-100 px-2 py-1 rounded-full border border-red-200">
                       <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> Não Salvo
                    </span>
                 ) : (
                    <span className="flex items-center gap-1 text-[10px] uppercase font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full border border-emerald-200">
                       <span className="w-2 h-2 rounded-full bg-emerald-600"></span> Salvo
                    </span>
                 )}
              </div>
              <div className="flex gap-2">
                 <button 
                   onClick={() => openReportModal(b)}
                   className="bg-sky-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-sky-700 transition-colors shadow-sm"
                   title="Ver Relatório Individual"
                 >
                   📋 RELATÓRIO
                 </button>
                 <button 
                   onClick={() => removeBoat(i)}
                   className="bg-red-100 text-red-700 border border-red-200 px-3 py-1 rounded text-xs font-bold hover:bg-red-200 transition-colors"
                   title="Excluir Barco"
                 >
                   EXCLUIR
                 </button>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
                  <input 
                    type="text" 
                    value={b.nome} 
                    onChange={(e) => updateBoat(i, 'nome', e.target.value)}
                    className="w-full p-2 border rounded font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Chegada</label>
                  <div className="flex gap-1 w-full">
                      <input 
                        type="text" 
                        value={b.arrival} 
                        onChange={(e) => updateBoat(i, 'arrival', formatDateTimeInput(e.target.value))}
                        className="flex-1 w-full min-w-0 p-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 uppercase"
                      />
                      <button 
                        onClick={() => updateBoat(i, 'arrival', getCurrentDateTime())}
                        className="bg-sky-500 text-white font-bold px-3 rounded shadow-sm hover:bg-sky-600 flex-shrink-0"
                        title="Inserir Hora Atual"
                      >
                        🕒
                      </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                  <select 
                    value={b.tipo} 
                    onChange={(e) => updateBoat(i, 'tipo', e.target.value)}
                    className="w-full p-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                  >
                    <option value="OPERANDO">OPERANDO</option>
                    <option value="STAND BY">STAND BY</option>
                    <option value="DEPARTED">DEPARTED</option>
                    <option value="OUTRO">OUTRO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Detalhes</label>
                  {b.tipo === 'OPERANDO' ? (
                    <select 
                      value={b.local} 
                      onChange={(e) => updateBoat(i, 'local', e.target.value)}
                      className={`w-full p-2 border rounded font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white ${b.local.includes('PORT') ? 'text-red-700' : 'text-green-700'}`}
                    >
                      {availableLocations.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  ) : b.tipo === 'STAND BY' ? (
                     <select 
                      value={b.local} 
                      onChange={(e) => updateBoat(i, 'local', e.target.value)}
                      className="w-full p-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                    >
                      <option value="AM 11">AM 11</option>
                      <option value="AM 05">AM 05</option>
                      <option value="OM 11">OM 11</option>
                    </select>
                  ) : b.tipo === 'DEPARTED' ? (
                     <button 
                       onClick={() => openDepartureModal(i)}
                       className={`w-full p-2 border rounded shadow-sm font-bold transition-colors flex justify-between items-center px-4 ${hasDepartureInfo ? 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700' : 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300'}`}
                     >
                        <span>{hasDepartureInfo ? '✓ INFO SALVA' : 'ℹ️ INFO PARTIDA'}</span>
                        <span className={`text-xs font-normal ${hasDepartureInfo ? 'text-emerald-100' : 'text-slate-500'}`}>Editar &rarr;</span>
                     </button>
                  ) : (
                    <input 
                      type="text" 
                      value={b.local} 
                      onChange={(e) => updateBoat(i, 'local', e.target.value)}
                      className="w-full p-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 uppercase"
                    />
                  )}
                </div>
              </div>
              
              {/* ORIENTATION TOGGLE FOR OPERANDO */}
              {b.tipo === 'OPERANDO' && (
                  <div className="mb-3">
                     <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Orientação</label>
                     <div className="flex rounded-md shadow-sm border border-gray-300 overflow-hidden" role="group">
                        <button 
                           type="button" 
                           onClick={() => updateBoat(i, 'orientation', 'BOW TO BOW')}
                           className={`flex-1 py-1.5 text-xs font-bold transition-colors ${!b.orientation || b.orientation === 'BOW TO BOW' ? 'bg-[#002855] text-white' : 'bg-white text-slate-500 hover:bg-gray-100'}`}
                        >
                           BOW TO BOW
                        </button>
                        <div className="w-px bg-gray-300"></div>
                        <button 
                           type="button" 
                           onClick={() => updateBoat(i, 'orientation', 'BOW TO STERN')}
                           className={`flex-1 py-1.5 text-xs font-bold transition-colors ${b.orientation === 'BOW TO STERN' ? 'bg-[#002855] text-white' : 'bg-white text-slate-500 hover:bg-gray-100'}`}
                        >
                           BOW TO STERN
                        </button>
                     </div>
                  </div>
              )}

              <div className="border-t pt-4 mt-4">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Operações</label>
                <div className="flex gap-2 mb-2">
                   <input 
                      className="flex-1 p-2 text-sm border rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 uppercase"
                      placeholder="Nova operação..." 
                      value={newOpText[i] || ''}
                      onChange={(e) => setNewOpText(prev => ({...prev, [i]: e.target.value}))}
                      onKeyDown={(e) => e.key === 'Enter' && addOp(i)}
                   />
                   <select 
                      className="w-16 p-2 text-sm border rounded shadow-sm bg-white text-slate-900"
                      value={newOpPrio[i] || 1}
                      onChange={(e) => setNewOpPrio(prev => ({...prev, [i]: parseInt(e.target.value)}))}
                   >
                      {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                   </select>
                   <button onClick={() => addOp(i)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 rounded shadow-sm transition-colors">+</button>
                </div>

                <div className="space-y-2 mt-2">
                  {b.ops.map(op => {
                    let bg = 'bg-white';
                    let icon = '○';
                    if (op.status === 'COMPLETED') { bg = 'bg-emerald-50'; icon = '✅'; }
                    else if (op.status === 'CANCELED') { bg = 'bg-red-50'; icon = '🚫'; }
                    else if (b.activeOpId === op.id) { bg = 'bg-emerald-100 border-emerald-300'; icon = '▶'; }

                    return (
                      <div key={op.id} className={`flex items-center gap-2 p-2 rounded border border-gray-200 transition-colors ${bg}`}>
                         <div 
                           className={`w-8 h-8 flex items-center justify-center rounded-full border cursor-pointer hover:scale-105 transition-transform ${b.activeOpId === op.id ? 'bg-emerald-500 border-emerald-600 text-white font-bold' : 'bg-white hover:bg-gray-100'}`}
                           onClick={() => toggleOp(i, op.id)}
                           title="Clique para ativar/desativar"
                         >
                           {icon}
                         </div>
                         <div className="flex-1 text-sm leading-tight text-slate-900">
                           {op.desc} <span className="text-gray-400 text-xs ml-1">(P{op.prio})</span>
                         </div>
                         
                         {/* Action Buttons */}
                         <div className="flex gap-1">
                            <button onClick={() => openEditOpModal(i, op.id)} className="w-7 h-7 flex items-center justify-center text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100" title="Editar">✏️</button>
                            <button onClick={() => changeOpStatus(i, op.id, 'COMPLETED')} className={`w-7 h-7 flex items-center justify-center text-xs border rounded hover:opacity-80 ${op.status === 'COMPLETED' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'}`} title="Concluir">✓</button>
                            <button onClick={() => changeOpStatus(i, op.id, 'CANCELED')} className={`w-7 h-7 flex items-center justify-center text-xs border rounded hover:opacity-80 ${op.status === 'CANCELED' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800'}`} title="Cancelar">✕</button>
                            <button onClick={() => removeOp(i, op.id)} className="w-7 h-7 flex items-center justify-center text-xs bg-gray-100 text-gray-500 border border-gray-200 rounded hover:bg-gray-200" title="Remover">🗑️</button>
                         </div>
                      </div>
                    );
                  })}
                  {b.ops.length === 0 && <div className="text-center text-xs text-gray-400 italic py-2">Sem operações</div>}
                </div>
              </div>
            </div>

            {/* Footer: Save & Status */}
            <div className="bg-gray-100 p-3 rounded-b-lg border-t border-gray-200 flex justify-between items-center">
               <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  Last updated at: <span className="text-gray-800 text-xs">{b.hora}</span>
               </div>
               <button 
                  onClick={() => saveBoat(i)} 
                  className={`px-6 py-2 rounded font-bold text-sm shadow-md transition-all transform active:scale-95 ${isDirty ? 'bg-emerald-500 hover:bg-emerald-600 text-white animate-pulse' : 'bg-white text-gray-400 border border-gray-300'}`}
               >
                  {isDirty ? 'SALVAR ALTERAÇÕES' : 'SALVO'}
               </button>
            </div>

          </div>
        );
      })}

      {/* INDIVIDUAL REPORT MODAL */}
      {reportBoat && (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
               <h3 className="text-xl font-bold mb-4 text-slate-900">RELATÓRIO INDIVIDUAL</h3>
               <textarea 
                 className="flex-1 p-4 bg-white text-slate-900 font-mono text-sm mb-4 rounded border border-gray-300 h-64 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                 readOnly 
                 value={generateIndividualReportText(reportBoat)} 
               />
               <div className="flex gap-4">
                  <button onClick={() => {navigator.clipboard.writeText(generateIndividualReportText(reportBoat)); alert('Copiado!');}} className="flex-1 bg-emerald-600 text-white font-bold py-2 rounded">COPIAR</button>
                  <button onClick={() => setReportBoat(null)} className="flex-1 bg-gray-500 text-white font-bold py-2 rounded">FECHAR</button>
               </div>
            </div>
         </div>
      )}

      {/* EDIT OPERATION MODAL */}
      {editingOpState && (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl flex flex-col">
               <h3 className="text-xl font-bold mb-4 text-[#002855]">EDITAR OPERAÇÃO</h3>
               <div className="mb-4">
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Descrição</label>
                   <textarea 
                       className="w-full p-3 border rounded text-slate-900 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                       rows={4}
                       value={editingOpState.text}
                       onChange={(e) => setEditingOpState(prev => prev ? ({...prev, text: e.target.value}) : null)}
                   />
               </div>
               <div className="mb-6">
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Prioridade</label>
                   <select 
                       className="w-full p-3 border rounded text-slate-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                       value={editingOpState.prio}
                       onChange={(e) => setEditingOpState(prev => prev ? ({...prev, prio: parseInt(e.target.value)}) : null)}
                   >
                       {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                   </select>
               </div>
               <div className="flex gap-4">
                  <button onClick={saveEditOp} className="flex-1 bg-emerald-600 text-white font-bold py-2 rounded hover:bg-emerald-700">SALVAR</button>
                  <button onClick={() => setEditingOpState(null)} className="flex-1 bg-gray-500 text-white font-bold py-2 rounded hover:bg-gray-600">CANCELAR</button>
               </div>
            </div>
         </div>
      )}

      {/* DEPARTURE INFO MODAL */}
      {departureModalBoatIndex !== null && (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl flex flex-col">
               <h3 className="text-xl font-bold mb-4 text-[#002855]">INFORMAÇÕES DE PARTIDA</h3>
               
               <div className="space-y-4 mb-6">
                   <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data/Hora de Saída</label>
                       <div className="flex gap-1">
                           <input 
                               type="text" 
                               className="flex-1 p-2 border rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                               value={tempDepartureData.departureTime}
                               onChange={(e) => setTempDepartureData(prev => ({...prev, departureTime: formatDateTimeInput(e.target.value)}))}
                           />
                           <button 
                               onClick={() => setTempDepartureData(prev => ({...prev, departureTime: getCurrentDateTime()}))}
                               className="bg-sky-500 text-white font-bold px-3 rounded shadow-sm hover:bg-sky-600"
                               title="Inserir Hora Atual"
                           >
                               🕒
                           </button>
                       </div>
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Destino</label>
                       <input 
                           type="text" 
                           className="w-full p-2 border rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                           value={tempDepartureData.destination}
                           onChange={(e) => setTempDepartureData(prev => ({...prev, destination: e.target.value}))}
                       />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ETA (Estimated Time of Arrival)</label>
                       <div className="flex gap-1">
                           <input 
                               type="text" 
                               className="flex-1 p-2 border rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                               value={tempDepartureData.eta}
                               onChange={(e) => setTempDepartureData(prev => ({...prev, eta: formatDateTimeInput(e.target.value)}))}
                           />
                           <button 
                               onClick={() => setTempDepartureData(prev => ({...prev, eta: getCurrentDateTime()}))}
                               className="bg-sky-500 text-white font-bold px-3 rounded shadow-sm hover:bg-sky-600"
                               title="Inserir Hora Atual"
                           >
                               🕒
                           </button>
                       </div>
                   </div>
               </div>

               <div className="flex gap-4">
                  <button onClick={saveDepartureData} className="flex-1 bg-emerald-600 text-white font-bold py-2 rounded">SALVAR</button>
                  <button onClick={() => setDepartureModalBoatIndex(null)} className="flex-1 bg-gray-500 text-white font-bold py-2 rounded">CANCELAR</button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default BoatList;