'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { gsap } from 'gsap';
import { useGameStore } from '../store/useGameStore';
import { playSound } from '../lib/sound';

const INDIA_BOUNDS: L.LatLngBoundsExpression = [
  [6.5, 68],
  [35.5, 97]
];

export default function Map() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const { answerState, states, currentIndex, wrongAttempts, phase, setBlinking, isBlinking, highlightedState, nextQuestion } = useGameStore();
  
  const [geoData, setGeoData] = useState<any>(null);
  const [neighbourData, setNeighbourData] = useState<any>(null);

  // References for imperative layer access (like animation lookup)
  const stateLayerMap = useRef<Record<string, L.Path>>({});
  const utLayerMap = useRef<Record<string, L.CircleMarker[]>>({});

  const getColor = (_name: string) => '#d4dde8';

  // Specific pixel offsets for Northeast states to prevent text overlapping
  const getStateOffset = (name: string): [number, number] => {
    if (['Sikkim', 'Mizoram', 'Manipur', 'Nagaland'].includes(name)) return [35, 0];
    if (['Goa', 'Tripura', 'Meghalaya'].includes(name)) return [-35, 0];
    if (name === 'Uttar Pradesh') return [20, -15]; // UP needs to move slightly Right and UP
    if (name === 'Gujarat') return [10, 10];        // Gujarat needs to move slightly Right and DOWN
    return [0, 0];
  };

  // Advanced label formatting: wraps long names, adds visual callout lines for tiny states, and rotates specific states like Kerala
  const formatStateLabel = (name: string) => {
    let text = name;
    if (name.includes(' Pradesh')) text = name.replace(' Pradesh', '<br/>Pradesh');
    if (name === 'Tamil Nadu') text = 'Tamil<br/>Nadu';
    if (name === 'West Bengal') text = 'West<br/>Bengal';

    const baseFormat = `<div class="text-center leading-[1.05] tracking-tight">${text}</div>`;

    const getRightArrow = () => `
      <div class="absolute right-full top-1/2 -translate-y-1/2 mr-1 flex items-center pointer-events-none">
        <svg width="24" height="10" viewBox="0 0 24 10" class="drop-shadow-sm">
           <line x1="24" y1="5" x2="3" y2="5" stroke="#475569" stroke-width="1.5" />
           <polygon points="4,2 0,5 4,8" fill="#475569" />
        </svg>
      </div>`;

    const getLeftArrow = () => `
      <div class="absolute left-full top-1/2 -translate-y-1/2 ml-1 flex items-center pointer-events-none">
        <svg width="24" height="10" viewBox="0 0 24 10" class="drop-shadow-sm">
           <line x1="0" y1="5" x2="21" y2="5" stroke="#475569" stroke-width="1.5" />
           <polygon points="20,2 24,5 20,8" fill="#475569" />
        </svg>
      </div>`;

    if (['Sikkim', 'Mizoram', 'Manipur', 'Nagaland'].includes(name)) {
        return `<div class="relative flex items-center">${getRightArrow()}${baseFormat}</div>`;
    }
    if (['Goa', 'Tripura', 'Meghalaya'].includes(name)) {
        return `<div class="relative flex items-center">${getLeftArrow()}${baseFormat}</div>`;
    }
    if (name === 'Kerala') {
        return `<div class="text-center tracking-widest" style="transform: rotate(-65deg); transform-origin: center; margin-top: 15px; margin-left: -5px;">${name}</div>`;
    }

    return baseFormat;
  };

  // 1. Fetch JSON Payloads
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const response = await fetch('/api/map');
        if (!response.ok) throw new Error("Unified Redis Route Failed. Server Error");
        const payload = await response.json();
        setGeoData(payload.indiaMap);
        setNeighbourData(payload.worldMap);
      } catch (err) {
        console.warn("API map fetch failed, defaulting to local static pull.", err);
        fetch('/indian_states.geojson').then(r => r.json()).then(setGeoData);
        fetch('/neighbours.geojson').then(r => r.json()).then(setNeighbourData);
      }
    };
    fetchMaps();
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!geoData || !containerRef.current) return;

    if (!mapRef.current) {
      // Create Leaflet instance only once
      mapRef.current = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
        zoomSnap: 0.1, // allowing smooth fractional zooming
        scrollWheelZoom: true,
        dragging: true,
        doubleClickZoom: false,
        zoomAnimation: true,
      });

      // We fit the map precisely to the boundaries of the dataset
      mapRef.current.fitBounds(INDIA_BOUNDS, { padding: [20, 20] });
    }

    const map = mapRef.current;
    
    // Clear old layers safely holding state keys
    map.eachLayer((layer) => {
        if (!(layer as any)._url) { // don't remove base tiles theoretically
             map.removeLayer(layer);
        }
    });

    stateLayerMap.current = {};
    utLayerMap.current = {};

    // A. Draw Neighbours with rich earthy atlas styling
    if (neighbourData) {
      L.geoJSON(neighbourData, {
        style: {
          fillColor: '#f5f4eb',  // Premium Seterra solid land color
          fillOpacity: 1,
          color: '#d1cbb8',      // Slightly darker border outline
          opacity: 1,
          weight: 1.2,
          interactive: false // Native leaflet prop to completely ignore CSS/hit test logic
        }
      }).addTo(map);
    }

    // B. Draw States Layer Engine
    L.geoJSON(geoData, {
      style: {
        fillColor: '#d4dde8',
        fillOpacity: 1,
        color: '#8098b8',
        weight: 1,
        opacity: 1
      },
      onEachFeature: (feature, layer: any) => {
        const stateName = feature.properties.ST_NM;
        stateLayerMap.current[stateName] = layer;

        // Custom properties storage for state
        layer.options.stateInfo = { isCorrect: false };

        layer.on({
          mouseover: () => {
            if (phase === 'playing' && !isBlinking && !layer.options.stateInfo.isCorrect) {
              layer.setStyle({ fillColor: '#c7d2fe', weight: 2.5, color: '#6366f1' });
            }
          },
          mouseout: () => {
            if (!layer.options.stateInfo.isCorrect && !layer.options.stateInfo.isBlinking) {
              layer.setStyle({ fillColor: getColor(stateName), weight: 1, color: '#94a3b8' });
            }
          },
          click: () => {
            if (phase !== 'playing' || isBlinking || layer.options.stateInfo.isCorrect) return;

            const result = answerState(stateName);

            if (result === 'correct') {
              playSound('correct');
              layer.options.stateInfo.isCorrect = true;

              const attempts = useGameStore.getState().wrongAttempts;
              let restColor = '#4ade80', restStroke = '#16a34a'; // Green 1st try
              if (attempts === 1) { restColor = '#fde047'; restStroke = '#ca8a04'; } // Yellow 2nd
              else if (attempts >= 2) { restColor = '#fb923c'; restStroke = '#ea580c'; } // Orange 3rd

              // Leaflet-friendly GSAP proxy animation
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

              // Apply Permanent Interactive Label Tooltip via Leaflet
              layer.bindTooltip(formatStateLabel(stateName), { 
                permanent: true, direction: 'center', className: 'custom-map-tooltip', offset: getStateOffset(stateName)
              }).openTooltip();

              setTimeout(() => { nextQuestion(); }, 900);

            } else if (result === 'wrong') {
              playSound('wrong');
              
              const colorProxy = { fill: '#fca5a5', stroke: '#ef4444' };
              gsap.to(colorProxy, {
                  fill: getColor(stateName), stroke: '#94a3b8', duration: 0.35, ease: 'power2.inOut',
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

    // C. Draw Small UT Markers Setup
    const SMALL_STATES = [
      { name: 'Lakshadweep', label: 'Lakshadweep', lon: 72.7, lat: 11.0 },
      { name: 'Puducherry', label: 'Puducherry', lon: 79.80, lat: 11.94 },
      { name: 'Puducherry', label: 'Karaikal', lon: 79.83, lat: 10.92 },
      { name: 'Puducherry', label: 'Yanam', lon: 82.21, lat: 16.73 },
      { name: 'Puducherry', label: 'Mahe', lon: 75.53, lat: 11.70 },
      { name: 'Dadra and Nagar Haveli and Daman and Diu', label: 'DNHDD', lon: 72.9, lat: 20.4 },
      { name: 'Chandigarh', label: 'Chandigarh', lon: 76.78, lat: 30.73 },
      { name: 'Delhi', label: 'Delhi', lon: 77.10, lat: 28.70 },
    ];

    SMALL_STATES.forEach(st => {
      const marker = L.circleMarker([st.lat, st.lon], {
        radius: 5,
        fillColor: '#e8edf5',
        fillOpacity: 1,
        color: '#6366f1',
        weight: 1.5,
      }).addTo(map);
      
      const stName = st.name;
      if (!utLayerMap.current[stName]) utLayerMap.current[stName] = [];
      utLayerMap.current[stName].push(marker);

      (marker as any).options.stateInfo = { isCorrect: false };

      marker.on({
          mouseover: () => { if (phase === 'playing' && !(marker as any).options.stateInfo.isCorrect) marker.setRadius(7).setStyle({ fillColor: '#c7d2fe' }); },
          mouseout: () => { if (!(marker as any).options.stateInfo.isCorrect) marker.setRadius(5).setStyle({ fillColor: '#e8edf5' }); },
          click: () => {
             if (phase !== 'playing' || isBlinking || (marker as any).options.stateInfo.isCorrect) return;
             const result = answerState(stName);

             const markersList = utLayerMap.current[stName];

             if (result === 'correct') {
                 playSound('correct');
                 markersList.forEach(m => (m as any).options.stateInfo.isCorrect = true);

                 const attempts = useGameStore.getState().wrongAttempts;
                 let color = '#4ade80'; if (attempts === 1) color = '#fde047'; else if (attempts >= 2) color = '#fb923c';

                 markersList.forEach(m => {
                    m.setStyle({ fillColor: color, color: '#166534', weight: 1.5 });
                    m.setRadius(5); // reset size
                 });

                 // Bind UT title directly
                 marker.bindTooltip(st.label, { permanent: true, direction: 'right', className: 'font-bold text-[7px] bg-transparent border-none text-indigo-700 shadow-none', offset: [5, 0] }).openTooltip();

                 setTimeout(() => nextQuestion(), 900);

             } else if (result === 'wrong') {
                 playSound('wrong');
                 markersList.forEach(m => m.setStyle({ fillColor: '#fca5a5', color: '#ef4444' }));
                 setTimeout(() => {
                     markersList.forEach(m => {
                         if (!(m as any).options.stateInfo.isCorrect) m.setStyle({ fillColor: '#e8edf5', color: '#6366f1' });
                     });
                 }, 800);

                 if (useGameStore.getState().wrongAttempts >= 3) {
                     setBlinking(true, states[useGameStore.getState().currentIndex].name);
                 }
             }
          }
      });
    });

  }, [geoData, neighbourData]);

  // 3. Automated Blinking Effect isolated interval logic
  useEffect(() => {
    if (isBlinking && highlightedState && phase === 'playing') {
      const stateLayer = stateLayerMap.current[highlightedState];
      const utLayers = utLayerMap.current[highlightedState] || [];
      
      const targets = [stateLayer, ...utLayers].filter(Boolean);
      
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
               // Final Correct Output State
               targets.forEach((t: any) => {
                   t.options.stateInfo.isBlinking = false;
                   t.options.stateInfo.isCorrect = true;
                   t.setStyle({ fillColor: '#ef4444', color: '#b91c1c', weight: 2 });
                   
                   // Drop label
                   t.bindTooltip(formatStateLabel(highlightedState === "Delhi" ? "Delhi" : highlightedState), { 
                     permanent: true, direction: 'center', className: 'custom-map-tooltip error-tooltip', offset: getStateOffset(highlightedState)
                   }).openTooltip();
               });
               
               setBlinking(false, null as any);
               nextQuestion();
           }
        }, 200);

        return () => clearInterval(intr); // cleanup if interrupted
      } else {
         // Failsafe exit
         setTimeout(() => { setBlinking(false, null as any); nextQuestion(); }, 1500);
      }
    }
  }, [isBlinking, highlightedState, phase, nextQuestion, setBlinking]);


  // 4. UI Control Buttons Setup
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleReset = () => mapRef.current?.fitBounds(INDIA_BOUNDS, { padding: [20, 20] });

  return (
    <div className="w-full h-[100dvh] relative overflow-hidden leaflet-game-layer">
      
      {/* Global overrides for Leaflet tooltips to fix Seterra-like transparent texts */}
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
        /* Hide SVG pseudo shadow default leaflet adds */
        .leaflet-tooltip-left::before, .leaflet-tooltip-right::before, .leaflet-tooltip-top::before, .leaflet-tooltip-bottom::before {
          display: none !important;
        }
        /* Make leaflet container solid ocean blue to show a perfect base */
        .leaflet-container {
          background-color: #a6d0ed !important;
        }
      `}</style>
      
      {/* Base interactive map container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-0 leaflet-game-container"></div>

      {/* ── Footer Branding ── */}
      <a href="https://knobly.in" target="_blank" rel="noopener noreferrer" 
        className="hidden sm:flex absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto text-slate-500 hover:text-slate-800 transition-colors text-xs font-semibold items-center gap-1">
        Powered by <span className="text-slate-700 font-bold">Knobly</span>
      </a>

      {/* Zoom Controls Overlay */}
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

      {/* Legends Overlay */}
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
