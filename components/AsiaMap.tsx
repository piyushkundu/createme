'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { gsap } from 'gsap';
import { useGameStore } from '../store/useGameStore';
import { playSound } from '../lib/sound';
import asiaCountriesData from '../data/asiaCountries.json';

const ASIA_BOUNDS: L.LatLngBoundsExpression = [
  [-11.0, 25.0], // Southwest roughly (Indonesia down south, Red sea west)
  [55.0, 150.0]  // Northeast roughly (Russia border north, Japan east)
];

export default function AsiaMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const { answerState, states, currentIndex, wrongAttempts, phase, setBlinking, isBlinking, highlightedState, nextQuestion } = useGameStore();

  const [geoData, setGeoData] = useState<any>(null);
  const [neighbourData, setNeighbourData] = useState<any>(null);

  // References for imperative layer access (like animation lookup)
  const countryLayerMap = useRef<Record<string, L.Path>>({});

  const getColor = (_name: string) => '#d4dde8';

  // Specific pixel offsets for small countries if needed later
  const getCountryOffset = (name: string): [number, number] => {
    // Tweak offsets for small countries if labels overlap
    if (name === 'Singapore') return [0, 10];
    if (name === 'Bahrain') return [15, 0];
    if (name === 'Maldives') return [15, 0];
    if (name === 'Palestine') return [-15, 0];
    if (name === 'Lebanon') return [-15, 0];
    return [0, 0];
  };

  const formatCountryLabel = (name: string) => {
    let text = name;
    if (name === 'United Arab Emirates') text = 'UAE';
    if (name === 'Saudi Arabia') text = 'Saudi<br/>Arabia';
    if (name === 'North Korea') text = 'North<br/>Korea';
    if (name === 'South Korea') text = 'South<br/>Korea';

    return `<div class="text-center leading-[1.05] tracking-tight">${text}</div>`;
  };

  // 1. Fetch JSON Payloads
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const response = await fetch('/api/asia-map?v=3', { cache: 'no-store' });
        if (!response.ok) throw new Error("Asia API Route Failed");
        const payload = await response.json();
        setGeoData(payload.asiaMap);
        setNeighbourData(payload.worldBg);
      } catch (err) {
        console.warn("API map fetch failed, using fallback static files.", err);
        fetch('/asia_countries.geojson').then(r => r.json()).then(setGeoData);
        fetch('/asia_background.geojson').then(r => r.json()).then(setNeighbourData);
      }
    };
    fetchMaps();
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!geoData || !containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
        zoomSnap: 0.1,
        scrollWheelZoom: true,
        dragging: true,
        doubleClickZoom: false,
        zoomAnimation: true,
      });

      mapRef.current.fitBounds(ASIA_BOUNDS, { padding: [20, 20] });
    }

    const map = mapRef.current;
    
    map.eachLayer((layer) => {
        if (!(layer as any)._url) {
             map.removeLayer(layer);
        }
    });

    countryLayerMap.current = {};

    // A. Draw Neighbours (Rest of World)
    if (neighbourData) {
      L.geoJSON(neighbourData, {
        style: {
          fillColor: '#f5f4eb',
          fillOpacity: 1,
          color: '#d1cbb8',
          opacity: 1,
          weight: 1.2,
          interactive: false
        }
      }).addTo(map);
    }

    // B. Draw Interactive Asia Countries
    L.geoJSON(geoData, {
      style: {
        fillColor: '#d4dde8',
        fillOpacity: 1,
        color: '#8098b8',
        weight: 1,
        opacity: 1
      },
      onEachFeature: (feature, layer: any) => {
        const countryName = feature.properties.NAME;
        countryLayerMap.current[countryName] = layer;

        layer.options.stateInfo = { isCorrect: false };

        layer.on({
          mouseover: () => {
            if (phase === 'playing' && !isBlinking && !layer.options.stateInfo.isCorrect) {
              layer.setStyle({ fillColor: '#c7d2fe', weight: 2.5, color: '#6366f1' });
            }
          },
          mouseout: () => {
            if (!layer.options.stateInfo.isCorrect && !layer.options.stateInfo.isBlinking) {
              layer.setStyle({ fillColor: getColor(countryName), weight: 1, color: '#94a3b8' });
            }
          },
          click: () => {
            if (phase !== 'playing' || isBlinking || layer.options.stateInfo.isCorrect) return;

            const result = answerState(countryName);

            if (result === 'correct') {
              playSound('correct');
              layer.options.stateInfo.isCorrect = true;

              const attempts = useGameStore.getState().wrongAttempts;
              let restColor = '#4ade80', restStroke = '#16a34a';
              if (attempts === 1) { restColor = '#fde047'; restStroke = '#ca8a04'; }
              else if (attempts >= 2) { restColor = '#fb923c'; restStroke = '#ea580c'; }

              const colorProxy = { fill: '#ffffff', stroke: '#10b981', weight: 1.5 };
              gsap.to(colorProxy, {
                fill: restColor,
                stroke: restStroke,
                weight: 2,
                duration: 0.4,
                ease: 'bounce.out',
                onUpdate: () => {
                  layer.setStyle({ fillColor: colorProxy.fill, color: colorProxy.stroke, weight: colorProxy.weight });
                }
              });

              layer.bindTooltip(formatCountryLabel(countryName), { 
                permanent: true, direction: 'center', className: 'custom-map-tooltip', offset: getCountryOffset(countryName)
              }).openTooltip();

              setTimeout(() => { nextQuestion(); }, 900);

            } else if (result === 'wrong') {
              playSound('wrong');
              
              // NEW LOGIC: Temporary Tooltip
              const mode = useGameStore.getState().gameMode;
              const countryInfo = asiaCountriesData.find((c: any) => c.name === countryName);
              const wrongLabel = (mode === 'capitals' || mode === 'asia_capitals') && countryInfo?.capital ? countryInfo.capital : countryName;
              
              layer.bindTooltip(`<div class="text-center leading-[1.05] tracking-tight text-rose-600 font-bold">${wrongLabel}</div>`, {
                 permanent: true, direction: 'center', className: 'custom-map-tooltip', offset: getCountryOffset(countryName)
              }).openTooltip();

              setTimeout(() => {
                 if (!layer.options.stateInfo.isCorrect) {
                     layer.closeTooltip();
                     layer.unbindTooltip();
                 }
              }, 1000);

              const colorProxy = { fill: '#fca5a5', stroke: '#ef4444' };
              gsap.to(colorProxy, {
                  fill: getColor(countryName), stroke: '#94a3b8', duration: 0.35, ease: 'power2.inOut',
                  onUpdate: () => {
                      layer.setStyle({ fillColor: colorProxy.fill, color: colorProxy.stroke });
                  }
              });

              if (useGameStore.getState().wrongAttempts >= 3) {
                const target = states[useGameStore.getState().currentIndex];
                setBlinking(true, target.name);
              }
            }
          }
        });
      }
    }).addTo(map);

  }, [geoData, neighbourData]);

  // 3. Automated Blinking Effect
  useEffect(() => {
    if (isBlinking && highlightedState && phase === 'playing') {
      const countryLayer = countryLayerMap.current[highlightedState];
      
      const targets = [countryLayer].filter(Boolean);
      
      if (targets.length > 0) {
        targets.forEach((t: any) => t.options.stateInfo.isBlinking = true);

        let blinkCycle = 0;
        const intr = setInterval(() => {
           targets.forEach(t => t.setStyle({
              fillColor: blinkCycle % 2 === 0 ? '#60a5fa' : '#ef4444',
              color: blinkCycle % 2 === 0 ? '#2563eb' : '#b91c1c',
              weight: blinkCycle % 2 === 0 ? 3 : 2
           }));
           blinkCycle++;
           
           if (blinkCycle >= 14) {
               clearInterval(intr);
               targets.forEach((t: any) => {
                   t.options.stateInfo.isBlinking = false;
                   t.options.stateInfo.isCorrect = true;
                   t.setStyle({ fillColor: '#ef4444', color: '#b91c1c', weight: 2 });
                   
                   t.bindTooltip(formatCountryLabel(highlightedState), { 
                     permanent: true, direction: 'center', className: 'custom-map-tooltip error-tooltip', offset: getCountryOffset(highlightedState)
                   }).openTooltip();
               });
               
               setBlinking(false, null as any);
               nextQuestion();
           }
        }, 200);

        return () => clearInterval(intr);
      } else {
         setTimeout(() => { setBlinking(false, null as any); nextQuestion(); }, 1500);
      }
    }
  }, [isBlinking, highlightedState, phase, nextQuestion, setBlinking]);


  // 4. Controls
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleReset = () => mapRef.current?.fitBounds(ASIA_BOUNDS, { padding: [20, 20] });

  return (
    <div className="w-full h-[100dvh] relative overflow-hidden leaflet-game-layer">
      <style>{`
        .leaflet-tooltip.custom-map-tooltip {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          font-weight: 800 !important;
          font-size: 8px !important;
          color: #1e293b !important;
          text-shadow: 0px 0px 2px #ffffff, 0px 0px 3px #ffffff, 0px 0px 4px #ffffff !important;
        }
        .leaflet-tooltip.custom-map-tooltip.error-tooltip {
          color: #7f1d1d !important;
        }
        .leaflet-tooltip-left::before, .leaflet-tooltip-right::before, .leaflet-tooltip-top::before, .leaflet-tooltip-bottom::before {
          display: none !important;
        }
        .leaflet-container {
          background-color: #a6d0ed !important;
        }
      `}</style>
      
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-0 leaflet-game-container"></div>

      <a href="https://knobly.in" target="_blank" rel="noopener noreferrer" 
        className="hidden sm:flex absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto text-slate-500 hover:text-slate-800 transition-colors text-xs font-semibold items-center gap-1">
        Powered by <span className="text-slate-700 font-bold">Knobly</span>
      </a>

      <div className="absolute bottom-[5.5rem] md:bottom-8 right-3 md:right-6 flex flex-col gap-1.5 md:gap-2 z-20 pointer-events-auto">
        <button onClick={handleZoomIn} title="Zoom In"
          className="w-8 h-8 md:w-11 md:h-11 bg-white/90 backdrop-blur-md rounded-lg md:rounded-xl flex items-center justify-center text-slate-700 text-base md:text-xl font-bold shadow-md border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all">
          +
        </button>
        <button onClick={handleZoomOut} title="Zoom Out"
          className="w-8 h-8 md:w-11 md:h-11 bg-white/90 backdrop-blur-md rounded-lg md:rounded-xl flex items-center justify-center text-slate-700 text-base md:text-xl font-bold shadow-md border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all">
          −
        </button>
        <button onClick={handleReset} title="Reset View"
          className="w-8 h-8 md:w-11 md:h-11 bg-white/90 backdrop-blur-md rounded-lg md:rounded-xl flex items-center justify-center text-slate-500 text-xs md:text-base shadow-md border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all">
          ⊙
        </button>
      </div>

      <div className="hidden sm:flex absolute bottom-8 left-4 md:left-6 z-20 pointer-events-none flex-col gap-1.5 bg-white/90 backdrop-blur-md rounded-xl px-3 py-2.5 border border-slate-200 shadow-md">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Legend</span>
        {[{ color: '#4ade80', label: '1st try' }, { color: '#fde047', label: '2nd try' },
          { color: '#fb923c', label: '3rd try' }, { color: '#ef4444', label: 'Missed' }]
          .map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm border border-slate-100" style={{ background: item.color }} />
              <span className="text-[9px] font-semibold text-slate-600">{item.label}</span>
            </div>
          ))}
      </div>

      <div className="sm:hidden absolute bottom-[5.5rem] left-3 z-20 pointer-events-none flex items-center gap-1 bg-white/90 backdrop-blur-md rounded-full px-2 py-1 border border-slate-200 shadow-sm">
        {['#4ade80','#fde047','#fb923c','#ef4444'].map((c,i)=><div key={i} className="w-2 h-2 rounded-full border border-slate-50" style={{background:c}}/>)}
        <span className="text-[7px] text-slate-500 font-bold ml-0.5">×try</span>
      </div>
      
    </div>
  );
}
