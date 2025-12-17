import React, { useLayoutEffect, useRef } from 'react';
import { AppData } from '../types';

interface SlideRendererProps {
  data: AppData;
  slideIndex: number;
}

// Helper Component: Auto Scale Text
const AutoFitText: React.FC<{ text: string; max?: number; min?: number; className?: string }> = ({ text, max = 72, min = 14, className = '' }) => {
   const innerRef = useRef<HTMLDivElement>(null);
   const outerRef = useRef<HTMLDivElement>(null);

   useLayoutEffect(() => {
      const el = innerRef.current;
      const container = outerRef.current;
      if (!el || !container) return;

      let size = max;
      el.style.fontSize = `${size}px`;
      el.style.lineHeight = '1';

      while (
         size > min && 
         (el.scrollWidth > container.clientWidth || el.scrollHeight > container.clientHeight)
      ) {
         size -= 2;
         el.style.fontSize = `${size}px`;
      }
   }, [text, max, min]);

   return (
      <div ref={outerRef} className="w-full h-full flex items-center justify-center overflow-hidden px-2">
         <div ref={innerRef} className={`whitespace-nowrap font-mono font-bold text-slate-900 text-center transition-all duration-100 ${className}`}>
            {text}
         </div>
      </div>
   );
};

// Helper to format sector string "000-111" -> "000° - 111°"
const formatSector = (val: string) => {
    if (!val) return '--';
    const parts = val.split('-');
    if (parts.length === 2 && (parts[0] || parts[1])) {
        return `${parts[0] || '?'}° - ${parts[1] || '?'}°`;
    }
    return val + '°';
};

const SlideRenderer: React.FC<SlideRendererProps> = ({ data, slideIndex }) => {

  // ... (Ship Boats rendering helper - same as before)
  const renderShipBoats = () => {
    return data.listaBarcos.filter(b => b.tipo === 'OPERANDO').map((b, i) => {
       const isPort = b.local.includes('PORT');
       const isFwd = b.local.includes('FWD');
       let cardPosClass = '';
       if (isPort && isFwd) cardPosClass = 'top-[12%] left-[3%]';
       else if (isPort && !isFwd) cardPosClass = 'bottom-[12%] left-[3%]';
       else if (!isPort && isFwd) cardPosClass = 'top-[12%] right-[3%]';
       else if (!isPort && !isFwd) cardPosClass = 'bottom-[12%] right-[3%]';
       let iconPosClass = '';
       if (isPort && isFwd) iconPosClass = 'top-[25%] right-[58%]';
       else if (isPort && !isFwd) iconPosClass = 'bottom-[25%] right-[58%]';
       else if (!isPort && isFwd) iconPosClass = 'top-[25%] left-[58%]';
       else if (!isPort && !isFwd) iconPosClass = 'bottom-[25%] left-[58%]';
       const rotationClass = b.orientation === 'BOW TO STERN' ? 'rotate-180' : '';

       return (
          <React.Fragment key={i}>
             <div className={`absolute w-[260px] bg-white p-4 rounded-lg shadow-xl border-l-8 z-20 ${cardPosClass} ${isPort ? 'border-red-500' : 'border-emerald-500'}`}>
                <div className="text-xs text-slate-500 font-bold mb-1 relative z-10">{b.local}</div>
                <div className="text-xs text-sky-700 font-bold mb-2 relative z-10">Arr: {b.arrival}</div>
                <h4 className="text-xl font-extrabold text-slate-900 leading-tight mb-2 relative z-10 uppercase">{b.nome}</h4>
                <div className="border-t border-slate-100 pt-2 space-y-1 relative z-10">
                   {b.ops.map(op => {
                      let color = 'text-slate-600';
                      let icon = '•';
                      let decor = '';
                      if (op.status === 'COMPLETED') { color = 'text-emerald-700 opacity-60'; icon = '✓'; decor = 'line-through'; }
                      else if (op.status === 'CANCELED') { color = 'text-red-700 opacity-60'; icon = '✕'; decor = 'line-through'; }
                      else if (b.activeOpId === op.id) { color = 'text-emerald-800 font-black bg-emerald-100 px-1 rounded'; icon = '▶'; }
                      return (
                         <div key={op.id} className={`text-xs flex gap-1 ${color} ${decor} uppercase`}><span>{icon}</span><span>{op.desc}</span></div>
                      );
                   })}
                </div>
                <div className="text-[10px] text-slate-400 italic mt-2 text-right border-t pt-1 relative z-10">Last Updated: {b.hora}</div>
             </div>
             <div className={`absolute w-12 h-24 z-10 flex items-center justify-center transition-all duration-500 ${iconPosClass}`}>
                <div className={`absolute top-1/2 w-32 h-0 border-t-2 border-dashed border-slate-400 opacity-50 ${isPort ? 'right-full mr-2' : 'left-full ml-2'}`}></div>
                <div className={`drop-shadow-lg text-slate-700 transition-transform duration-500 ${rotationClass}`}>
                   <svg width="40" height="80" viewBox="0 0 100 200" fill="currentColor">
                      <path d="M50 0 C 80 15, 95 50, 95 180 L 95 200 L 5 200 L 5 180 C 5 50, 20 15, 50 0 Z" stroke="white" strokeWidth="4" />
                      <path d="M50 5 C 75 18, 90 50, 90 180 L 90 195 L 10 195 L 10 180 C 10 50, 25 18, 50 5 Z" fill={isPort ? '#fee2e2' : '#dcfce7'} opacity="0.8" />
                      <rect x="15" y="40" width="70" height="40" rx="5" fill="white" stroke="currentColor" strokeWidth="2" />
                      <rect x="20" y="45" width="60" height="10" rx="2" fill="currentColor" fillOpacity="0.4" />
                      <rect x="15" y="90" width="70" height="100" fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                      <line x1="15" y1="90" x2="85" y2="190" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
                      <line x1="85" y1="90" x2="15" y2="190" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
                   </svg>
                </div>
                <div className={`absolute ${rotationClass === 'rotate-180' ? '-top-6' : '-bottom-6'} left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/80 px-1 rounded text-[10px] font-bold text-slate-600 uppercase`}>{b.nome}</div>
             </div>
          </React.Fragment>
       );
    });
  };

  const renderSideBoats = () => {
    return data.listaBarcos.filter(b => b.tipo !== 'OPERANDO').map((b, i) => {
       const isDeparted = b.tipo === 'DEPARTED';
       return (
          <div key={i} className={`bg-white border border-slate-300 border-l-8 p-3 mb-3 rounded shadow-sm ${isDeparted ? 'border-l-slate-400 bg-slate-100 opacity-80' : 'border-l-amber-500'}`}>
             <div className="flex justify-between items-center font-extrabold text-slate-900 text-sm uppercase">
                <span className="flex items-center gap-2">
                    <svg width="14" height="28" viewBox="0 0 100 200" fill="currentColor" className="text-slate-400"><path d="M50 0 C 80 15, 95 50, 95 180 L 95 200 L 5 200 L 5 180 C 5 50, 20 15, 50 0 Z" /><rect x="15" y="40" width="70" height="50" rx="5" fill="white" fillOpacity="0.6" /></svg>
                    {b.nome}
                </span>
             </div>
             <div className="text-xs text-slate-500 font-semibold mt-1 pl-6 uppercase">{b.tipo} ({b.local || '-'})</div>
             <div className="flex justify-between mt-2 pt-1 border-t border-slate-100 pl-1">
                <span className="text-xs text-sky-700 font-bold">{isDeparted ? `Saiu: ${b.departureTime}` : `Arr: ${b.arrival}`}</span>
                <span className="text-[10px] text-slate-400 italic">Upd: {b.hora}</span>
             </div>
             {!isDeparted && (
                <div className="mt-1 pt-1 space-y-1 pl-1">
                   {b.ops.map(op => (<div key={op.id} className="text-[11px] text-slate-600 flex gap-1 uppercase"><span>•</span><span>{op.desc}</span></div>))}
                </div>
             )}
          </div>
       );
    });
  };

  const getVisibleEds = () => {
    const list = [];
    if (data.eds1Visible) list.push({ label: 'EDS 1', val: data.eds1 });
    if (data.eds2Visible) list.push({ label: 'EDS 2', val: data.eds2 });
    if (data.eds3Visible) list.push({ label: 'EDS 3', val: data.eds3 });
    if (data.eds4Visible) list.push({ label: 'EDS 4', val: data.eds4 });
    if (data.eds5Visible) list.push({ label: 'EDS 5', val: data.eds5 });
    return list;
  };

  return (
    <>
        {/* SLIDE 0: WELL & ROUTE */}
        {slideIndex === 0 && (
           <>
              <h2 className="text-5xl font-black text-[#002855] mb-6 pb-2 border-b-4 border-slate-200 uppercase flex justify-between items-center">
                 <span>POÇO & ROTA DE FUGA</span>
              </h2>
              <div className="grid grid-cols-[35%_63%] gap-8 h-[82%]">
                 <div className="flex flex-col gap-3 h-full">
                    {[
                       { title: 'BLOCO', val: data.wellName, hl: true },
                       { title: 'CHEGADA', val: data.arrivalDate },
                       { title: 'COORDENADAS', val: `${data.lat} / ${data.long}` },
                       { title: 'UTM ZONE', val: data.utm },
                       { title: 'PROFUNDIDADE', val: data.depth },
                    ].map((item, i) => (
                       <div key={i} className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-lg flex flex-col justify-center px-6 shadow-sm">
                          <h3 className="text-sm text-slate-500 font-bold uppercase tracking-widest">{item.title}</h3>
                          <div className={`font-mono font-bold ${item.hl ? 'text-4xl text-[#002855]' : 'text-3xl text-slate-800'} leading-tight truncate uppercase`}>
                             {item.val}
                          </div>
                       </div>
                    ))}
                 </div>
                 <div className="relative bg-slate-50 border-2 border-slate-300 rounded-xl overflow-hidden shadow-sm">
                    {data.routeImgBase64 ? (<img src={data.routeImgBase64} className="w-full h-full object-contain" />) : (<div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-xl">SEM IMAGEM DA ROTA</div>)}
                 </div>
              </div>
           </>
        )}

        {/* SLIDE 1: EDS & LATCH */}
        {slideIndex === 1 && (
           <>
              <h2 className="text-5xl font-black text-[#002855] mb-6 pb-2 border-b-4 border-slate-200 uppercase flex justify-between items-center">
                 <span>EDS STATUS & LATCH</span>
                 <span className="text-2xl text-slate-500">{data.edsUpdate}</span>
              </h2>
              <div className="grid grid-cols-[60%_40%] gap-6 h-[85%]">
                 <div className="flex flex-col gap-4 h-full">
                    <div className="grid grid-cols-2 gap-4 h-[45%]">
                       <div className="bg-amber-50 border-4 border-amber-300 rounded-xl flex flex-col justify-center items-center text-center shadow-sm">
                          <h3 className="text-2xl text-slate-500 font-bold mb-1">AMARELO</h3>
                          <div className="font-mono text-5xl font-bold text-slate-900">{data.yellowM ? data.yellowM + 'm' : '--'}</div>
                          <div className="font-mono text-3xl font-bold text-slate-600 mt-1">{data.yellowTime}</div>
                       </div>
                       <div className="bg-red-50 border-4 border-red-300 rounded-xl flex flex-col justify-center items-center text-center shadow-sm">
                          <h3 className="text-2xl text-slate-500 font-bold mb-1">VERMELHO</h3>
                          <div className="font-mono text-5xl font-bold text-red-700">{data.redM ? data.redM + 'm' : '--'}</div>
                          <div className="font-mono text-3xl font-bold text-red-800 mt-1">{data.redTime}</div>
                       </div>
                    </div>
                    <div className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-xl p-6 flex gap-6 shadow-sm overflow-hidden">
                        <div className="w-1/2 flex flex-col justify-center gap-6 border-r border-slate-200 pr-6">
                            <div>
                               <div className="text-slate-500 text-lg font-bold uppercase mb-1">PREP TIME</div>
                               <div className="text-7xl font-mono font-bold text-slate-900">{data.kposTime}</div>
                            </div>
                            <div>
                               <div className="text-slate-500 text-lg font-bold uppercase mb-1">RISER TIME</div>
                               <div className="text-7xl font-mono font-bold text-slate-900">{data.riserTime}</div>
                            </div>
                        </div>
                        <div className="w-1/2 overflow-y-auto flex flex-col gap-3 justify-center pl-4">
                            {getVisibleEds().length > 0 ? (getVisibleEds().map((eds, idx) => (<div key={idx} className="flex justify-start items-center border-b border-slate-200 pb-1"><span className="text-xl font-bold text-slate-600 w-24 uppercase">{eds.label}</span><span className="text-2xl font-mono font-black text-[#002855]">{eds.val}s</span></div>))) : (<div className="text-gray-400 italic text-xl text-center">Nenhum modo selecionado</div>)}
                        </div>
                    </div>
                 </div>
                 <div className="flex flex-col gap-4">
                     <div className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-xl flex flex-col justify-center items-center text-center shadow-sm p-4">
                        <h3 className="text-lg text-slate-500 font-bold mb-2 uppercase tracking-wide">ILEGAL SECTOR</h3>
                        <div className="font-mono text-6xl font-bold text-red-600 leading-none">{formatSector(data.illegalSector)}</div>
                     </div>
                     <div className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-xl flex flex-col justify-center items-center text-center shadow-sm p-4">
                        <h3 className="text-lg text-slate-500 font-bold mb-2 uppercase tracking-wide">RIG LATCH UP HEADING</h3>
                        <div className="font-mono text-6xl font-bold text-slate-900 leading-none">{data.rigHeading ? data.rigHeading + '°' : '--'}</div>
                     </div>
                     <div className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-xl flex flex-col justify-center items-center text-center shadow-sm p-4">
                        <h3 className="text-lg text-slate-500 font-bold mb-2 uppercase tracking-wide">BOP LATCH UP HEADING</h3>
                        <div className="font-mono text-6xl font-bold text-slate-900 leading-none">{data.bopHeading ? data.bopHeading + '°' : '--'}</div>
                     </div>
                 </div>
              </div>
           </>
        )}

        {/* SLIDE 2: FLEET */}
        {slideIndex === 2 && (
           <>
              <h2 className="text-5xl font-black text-[#002855] mb-6 pb-2 border-b-4 border-slate-200 uppercase">FROTA</h2>
              <div className="grid grid-cols-[65%_35%] gap-6 h-full overflow-hidden pb-20">
                 <div className="relative bg-slate-100 border-2 border-slate-300 rounded-xl overflow-hidden h-full">
                    <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#94a3b8 2px, transparent 2px)', backgroundSize: '30px 30px'}}></div>
                    <div className="absolute top-5 left-5 text-xl font-black text-red-700 opacity-50">PORT</div>
                    <div className="absolute bottom-5 left-5 text-xl font-black text-red-700 opacity-50">PORT</div>
                    <div className="absolute top-5 right-5 text-xl font-black text-green-700 opacity-50">STBD</div>
                    <div className="absolute bottom-5 right-5 text-xl font-black text-green-700 opacity-50">STBD</div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-[400px] bg-slate-700 rounded-[60px_60px_30px_30px] border-4 border-white shadow-2xl flex flex-col items-center justify-center text-white font-bold text-2xl z-0">
                       <span className="mb-20">FWD</span>
                       <span className="text-4xl">H</span>
                       <span className="mt-20">AFT</span>
                    </div>
                    {renderShipBoats()}
                 </div>
                 <div className="h-full overflow-hidden relative border-l pl-4 border-slate-300">
                    <h3 className="text-[#002855] font-bold border-b-2 border-slate-200 pb-2 mb-2 text-xl">STAND BY / OUTROS</h3>
                    <div className="absolute w-full top-0 left-0 side-list-animation">
                       <div id="sideListContent" style={{ animation: data.listaBarcos.filter(b=>b.tipo!=='OPERANDO').length > 5 ? 'scrollUp 20s linear infinite alternate' : 'none' }}>
                          {renderSideBoats()}
                       </div>
                    </div>
                 </div>
              </div>
           </>
        )}

        {/* SLIDE 3: EQUIP & CARGO */}
        {slideIndex === 3 && (
           <>
              <h2 className="text-5xl font-black text-[#002855] mb-6 pb-2 border-b-4 border-slate-200 uppercase">EQUIPAMENTOS & CARGA</h2>
              {/* Top Section */}
              <div className="grid grid-cols-2 gap-8 h-[45%] mb-6">
                 {/* EQUIP COLUMN */}
                 <div className="flex flex-col gap-4 h-full">
                    <h3 className="text-2xl font-bold text-slate-500 uppercase border-b pb-1">Status Equipamentos</h3>
                    <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
                        <div className="bg-slate-50 border-2 border-slate-300 rounded-xl flex flex-col justify-center items-center p-4 shadow-sm overflow-hidden"><h4 className="text-2xl text-slate-500 font-bold mb-2">MOTORES OFF</h4><AutoFitText text={data.engUnav} max={72} className="uppercase" /></div>
                        <div className="bg-slate-50 border-2 border-slate-300 rounded-xl flex flex-col justify-center items-center p-4 shadow-sm overflow-hidden"><h4 className="text-2xl text-slate-500 font-bold mb-2">THRUSTERS OFF</h4><AutoFitText text={data.thrUnav} max={72} className="uppercase" /></div>
                    </div>
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl h-24 flex flex-col justify-center p-4 shadow-sm flex-shrink-0 overflow-hidden"><h4 className="text-sm text-slate-500 font-bold mb-1 uppercase">OBSERVAÇÕES (Equip)</h4><div className="font-mono text-2xl font-bold text-slate-900 leading-tight truncate uppercase">{data.equipRemarks}</div></div>
                 </div>

                 {/* CARGO COLUMN */}
                 <div className="flex flex-col gap-4 h-full">
                    <h3 className="text-2xl font-bold text-slate-500 uppercase border-b pb-1">Carga Perigosa</h3>
                    <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
                        <div className="bg-slate-50 border-2 border-slate-300 border-l-[10px] border-l-red-500 rounded-xl p-4 shadow-sm flex flex-col justify-center overflow-hidden"><h4 className="text-2xl text-slate-500 font-bold mb-2 uppercase">EXPLOSIVO</h4><AutoFitText text={data.cargoExplosive} max={60} className="uppercase" /></div>
                        <div className="bg-slate-50 border-2 border-slate-300 border-l-[10px] border-l-amber-400 rounded-xl p-4 shadow-sm flex flex-col justify-center overflow-hidden"><h4 className="text-2xl text-slate-500 font-bold mb-2 uppercase">RADIOATIVO</h4><AutoFitText text={data.cargoRadio} max={60} className="uppercase" /></div>
                    </div>
                    <div className="bg-slate-50 border-2 border-slate-300 rounded-xl h-24 flex flex-col justify-center p-4 shadow-sm flex-shrink-0 overflow-hidden"><h4 className="text-sm text-slate-500 font-bold mb-1 uppercase">NOTA DE CARGA</h4><p className="text-lg font-bold text-slate-800 whitespace-pre-wrap leading-tight line-clamp-2 uppercase">{data.cargoNote}</p></div>
                 </div>
              </div>
              
              {/* Acoustic Systems Area (Bottom 40%) */}
              <div className="h-[40%]">
                 <h3 className="text-xl font-bold text-slate-500 uppercase border-b pb-1 mb-2">Acoustic System</h3>
                 <div className="flex gap-4 h-full items-end pb-4 overflow-x-auto">
                    {data.acousticSystems && data.acousticSystems.map(sys => {
                        // RENDER LBL GROUP
                        if (sys.type === 'LBL') {
                            return (
                                <div key={sys.id} className="min-w-[200px] h-full border-2 border-slate-300 rounded-xl bg-slate-50 p-2 flex flex-col">
                                    <div className="text-center font-black text-slate-700 mb-2 border-b uppercase">{sys.name}</div>
                                    <div className="flex-1 flex justify-center items-end gap-2">
                                        {sys.transponders.map(t => {
                                            let color = 'bg-sky-500';
                                            if (t.val >= 50) color = 'bg-amber-500';
                                            if (t.val >= 90) color = 'bg-red-500';
                                            return (
                                                <div key={t.id} className="flex-1 flex flex-col items-center h-full justify-end group">
                                                    <div className="text-[10px] font-bold text-slate-400 mb-1">{t.floatId}</div>
                                                    <span className="text-xs font-bold mb-1">{t.val}%</span>
                                                    <div className={`w-full max-w-[40px] ${color} rounded-t shadow transition-all duration-1000`} style={{ height: `${Math.max(t.val, 5)}%` }}></div>
                                                    <div className="mt-1 text-[10px] font-bold text-slate-600 truncate w-full text-center uppercase">{t.name}</div>
                                                    <div className="text-[9px] text-slate-400 text-center leading-none mt-1">
                                                        {t.channelM && <div>M:{t.channelM}</div>}
                                                        {t.channelB && <div>B:{t.channelB}</div>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        } 
                        // RENDER SSBL / SINGLE
                        else {
                            const t = sys.transponders[0];
                            if(!t) return null;
                            let color = 'bg-sky-500';
                            if (t.val >= 50) color = 'bg-amber-500';
                            if (t.val >= 90) color = 'bg-red-500';
                            return (
                                <div key={sys.id} className="flex-1 min-w-[130px] max-w-[160px] flex flex-col h-full bg-white border border-slate-200 rounded p-1 shadow-sm">
                                    <div className="flex justify-between px-1 pt-1">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">{t.name}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{t.floatId}</span>
                                    </div>
                                    <div className="w-full flex-1 flex flex-col justify-end pb-2 min-h-0 relative">
                                        <span className="text-center font-bold text-2xl mb-1 absolute top-0 w-full">{t.val}%</span>
                                        <div className={`w-full ${color} rounded-t-lg shadow-lg transition-all duration-1000 mx-auto`} style={{ height: `${t.val}%`, width: '60%' }}></div>
                                    </div>
                                    <div className="border-t border-slate-200 bg-slate-50 p-1 text-center">
                                        <div className="text-sm font-black text-slate-700 uppercase leading-none truncate mb-1 uppercase">{sys.name}</div>
                                        <div className="flex justify-center gap-2 text-[9px] text-slate-500 font-mono">
                                            {t.channelM && <span>M:{t.channelM}</span>}
                                            {t.channelB && <span>B:{t.channelB}</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                    })}
                 </div>
              </div>
           </>
        )}

        {/* SLIDE 4: WEATHER & FLIGHTS */}
        {slideIndex === 4 && (
           <div className="w-full h-full flex gap-6 pb-20">
              <div className="w-[65%] h-full relative bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200">
                 {data.weatherImgBase64 ? (<img src={data.weatherImgBase64} className="w-full h-full object-contain" />) : (<div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-2xl">SEM IMAGEM METEOROLÓGICA</div>)}
                 <div className="absolute top-0 left-0 w-full bg-gradient-to-b from-white/90 to-transparent px-6 py-4"><h2 className="text-3xl font-black text-[#002855] uppercase">{data.weatherTitle || 'PREVISÃO METEOROLÓGICA'}</h2></div>
              </div>
              <div className="flex-1 flex flex-col">
                  <h2 className="text-3xl font-black text-[#002855] mb-4 uppercase border-b-4 border-slate-200 pb-2 text-right">VOOS DO DIA</h2>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                     {data.flightsList && data.flightsList.map(f => {
                         let statusColor = 'bg-gray-100 text-gray-500 border-gray-300';
                         if(f.status === 'ON TIME') statusColor = 'bg-green-100 text-green-700 border-green-300';
                         if(f.status === 'DELAYED') statusColor = 'bg-yellow-50 text-yellow-700 border-yellow-300';
                         if(f.status === 'ARRIVED') statusColor = 'bg-blue-50 text-blue-700 border-blue-300';
                         if(f.status === 'CANCELED') statusColor = 'bg-red-50 text-red-700 border-red-300';
                         return (
                            <div key={f.id} className={`bg-white border-l-8 p-4 rounded shadow-md flex flex-col gap-2 ${statusColor.replace('bg-', 'border-l-').split(' ')[0]}`}>
                               <div className="flex justify-between items-center"><div className="flex items-center gap-3"><span className="text-2xl">✈️</span><span className="text-2xl font-black text-slate-800 uppercase">{f.prefix}</span></div><span className={`text-xs font-bold px-2 py-1 rounded border uppercase ${statusColor}`}>{f.status}</span></div>
                               <div className="grid grid-cols-2 gap-2 mt-1 border-t border-slate-100 pt-2"><div><span className="block text-[10px] font-bold text-slate-400 uppercase">ETD</span><span className="text-xl font-bold text-slate-700">{f.etd || '--:--'}</span></div><div><span className="block text-[10px] font-bold text-slate-400 uppercase">ETA</span><span className="text-xl font-bold text-slate-700">{f.eta || '--:--'}</span></div></div>
                               {f.info && (<div className="text-sm font-semibold text-slate-500 mt-1 uppercase">{f.info}</div>)}
                            </div>
                         );
                     })}
                     {(!data.flightsList || data.flightsList.length === 0) && (<div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl text-slate-400 font-bold italic">SEM VOOS PROGRAMADOS</div>)}
                  </div>
              </div>
           </div>
        )}
    </>
  );
};

export default SlideRenderer;