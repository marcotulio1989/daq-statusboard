import React, { useState, useEffect } from 'react';
import { AppData, INITIAL_DATA } from '../types';
import { getStoredData } from '../services/storage';
import SlideRenderer from '../components/SlideRenderer';

const SLIDE_DURATION = 15000;
const TOTAL_SLIDES = 5; // 0=Well/EDS, 1=Route/Latch, 2=Fleet, 3=Equip/Cargo, 4=Weather/Flights

const TvView: React.FC = () => {
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Get User from URL (hash based)
  const getUserFromUrl = () => {
      // Since we use HashRouter, the URL is like .../#/tv?u=username
      const parts = window.location.hash.split('?');
      if (parts.length > 1) {
          const params = new URLSearchParams(parts[1]);
          return params.get('u');
      }
      return null;
  };

  useEffect(() => {
    const user = getUserFromUrl();

    // Initial Load
    setData(getStoredData(user || undefined));

    // Polling for updates
    const pollInterval = setInterval(() => {
       // Only update if we have a user target or falling back to default
       setData(getStoredData(user || undefined));
    }, 2000);

    // Slide Loop
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => {
        let next = prev + 1;
        if (next >= TOTAL_SLIDES) next = 0;
        
        // Skip weather/flight slide (last one, index 4) if no image AND no flights
        const currentData = getStoredData(user || undefined); // Ensure we check fresh data
        const hasWeather = currentData.weatherImgBase64 && currentData.weatherImgBase64.length > 100;
        const hasFlights = currentData.flightsList && currentData.flightsList.length > 0;

        if (next === 4 && !hasWeather && !hasFlights) {
           return 0;
        }
        return next;
      });
    }, SLIDE_DURATION);

    return () => {
      clearInterval(pollInterval);
      clearInterval(slideInterval);
    };
  }, []);

  return (
    <div className="bg-black w-screen h-screen overflow-hidden flex justify-center items-center font-sans">
      <div className="relative bg-white w-[1280px] h-[720px] shadow-2xl flex flex-col p-8 overflow-hidden scale-[var(--scale)]">
        
        {/* Progress Bar */}
        <div key={currentSlide} className="absolute top-0 left-0 h-1.5 bg-sky-500 z-50 animate-[width_15s_linear]" style={{ width: '100%' }}></div>

        {/* Logo */}
        {data.logoImgBase64 && (
           <img src={data.logoImgBase64} className="absolute top-6 right-8 w-48 h-20 object-contain z-50" />
        )}

        {/* Generic Slide Renderer */}
        <SlideRenderer data={data} slideIndex={currentSlide} />

        {/* LED TICKER */}
        {data.statusTags.length > 0 && (
           <div className="absolute bottom-0 left-0 w-full h-[70px] bg-neutral-900 border-t-4 border-neutral-700 flex items-center px-4 gap-6 overflow-x-auto no-scrollbar z-50">
              {data.statusTags.filter(t => t.active).map(tag => {
                 let style = '';
                 if (tag.color === 'red') style = 'bg-red-700 border-red-500 text-white';
                 else if (tag.color === 'yellow') style = 'bg-amber-600 border-amber-400 text-white';
                 else if (tag.color === 'blue') style = 'bg-blue-800 border-blue-500 text-white';
                 else style = 'bg-green-800 border-green-500 text-white';

                 return (
                    <div key={tag.id} className={`flex-shrink-0 px-6 py-2 rounded border-2 font-bold text-2xl uppercase flex items-center gap-3 animate-glow shadow-[0_0_10px_rgba(255,255,255,0.3)] ${style}`}>
                       {tag.img && <img src={tag.img} className="h-8 bg-white rounded p-0.5" />}
                       {tag.text}
                    </div>
                 );
              })}
           </div>
        )}

        {/* Connectivity Dot */}
        <div className="absolute bottom-24 right-4 w-4 h-4 bg-emerald-500 rounded-full animate-pulse z-50"></div>
      </div>
    </div>
  );
};

export default TvView;