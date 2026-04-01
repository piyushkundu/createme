'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { gsap } from 'gsap';
import { useGameStore } from '../store/useGameStore';
import { playSound } from '../lib/sound';

export default function Map() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { answerState, states, currentIndex, wrongAttempts, phase, setBlinking, isBlinking, highlightedState, nextQuestion } = useGameStore();
  const [geoData, setGeoData] = useState<any>(null);
  const [neighbourData, setNeighbourData] = useState<any>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null);

  const zoomRef = useRef<any>(null);

  const getColor = (_name: string) => '#d4dde8';

  // ── ResizeObserver — re-measure when container size changes ──
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) setContainerSize({ width: w, height: h });
    };
    measure(); // initial measure
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    // Load India states
    fetch('/indian_states.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error('Could not load India map data', err));

    // Load world GeoJSON for surrounding countries (Asia)
    fetch('/neighbours.geojson')
      .then(res => res.json())
      .then(data => setNeighbourData(data))
      .catch(err => console.error('Could not load world data', err));
  }, []);


  useEffect(() => {
    if (!geoData || !svgRef.current || !containerSize) return;

    const width = containerSize.width;
    const height = containerSize.height;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    svg.selectAll('*').remove();

    const padding = 40;
    const projection = d3.geoMercator()
      .fitExtent([[padding, padding], [width - padding, height - padding]], geoData);

    const pathGenerator = d3.geoPath().projection(projection);

    // ── Defs ──────────────────────────────────────────────
    const defs = svg.append('defs');

    // Ocean gradient background
    const oceanGrad = defs.append('linearGradient')
      .attr('id', 'ocean-grad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '100%');
    oceanGrad.append('stop').attr('offset', '0%').attr('stop-color', '#38bdf8').attr('stop-opacity', 0.25);
    oceanGrad.append('stop').attr('offset', '100%').attr('stop-color', '#0284c7').attr('stop-opacity', 0.45);

    // State glow filter
    const glowFilter = defs.append('filter').attr('id', 'state-glow').attr('height', '130%').attr('width', '130%').attr('x', '-15%').attr('y', '-15%');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
    const glowMerge = glowFilter.append('feMerge');
    glowMerge.append('feMergeNode').attr('in', 'coloredBlur');
    glowMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Country shadow filter
    const countryFilter = defs.append('filter').attr('id', 'country-shadow');
    countryFilter.append('feDropShadow').attr('dx', '0').attr('dy', '1').attr('stdDeviation', '2').attr('flood-color', 'rgba(0,0,0,0.4)');

    // ── Ocean BG rect ──────────────────────────────────────
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#ocean-grad)')
      .attr('rx', 0);

    // ── Groups ─────────────────────────────────────────────
    const gNeighbours = svg.append('g').attr('class', 'neighbours-group');
    const g = svg.append('g').attr('class', 'states-group');
    const gSmall = svg.append('g').attr('class', 'small-uts-group');

    // ── Zoom ──────────────────────────────────────────────
    const zoom = d3.zoom()
      .scaleExtent([0.3, 15])
      .translateExtent([[-width * 2, -height * 2], [width * 3, height * 3]])
      .on('zoom', (event) => {
        gNeighbours.attr('transform', event.transform);
        g.attr('transform', event.transform);
        gSmall.attr('transform', event.transform);
        
        // Scale stroke widths inversely with zoom
        const k = event.transform.k;
        g.selectAll('.state-path').attr('stroke-width', Math.max(0.3, 0.7 / k));
        gNeighbours.selectAll('.neighbour-path').attr('stroke-width', Math.max(0.4, 0.8 / k));
      });

    svg.call(zoom as any);
    zoomRef.current = zoom;

    // ── Neighbouring Countries — accurate GeoJSON, white outline style ──────
    if (neighbourData) {
      gNeighbours.selectAll('path.neighbour-path')
        .data(neighbourData.features)
        .enter()
        .append('path')
        .attr('class', 'neighbour-path')
        .attr('d', pathGenerator as any)
        .attr('fill', 'rgba(255, 255, 255, 0.15)')   // slightly light white fill
        .attr('stroke', 'rgba(255, 255, 255, 0.4)')  // light white border
        .attr('stroke-width', 0.6)
        .attr('stroke-linejoin', 'round')
        .style('pointer-events', 'none');
    }


    // ── India States ──────────────────────────────
    g.selectAll('path')
      .data(geoData.features)
      .enter()
      .append('path')
      .attr('d', pathGenerator as any)
      .attr('data-id', (d: any) => d.properties.ST_NM)
      .attr('fill', (d: any) => getColor(d.properties.ST_NM))
      .attr('stroke', '#8098b8')
      .attr('stroke-width', 0.7)
      .attr('class', 'state-path cursor-pointer transition-all')
      .style('filter', 'none')
      .on('mouseover', function(_event, d: any) {
        if (phase === 'playing' && !isBlinking && !d3.select(this).classed('answered-correct')) {
          d3.select(this)
            .attr('fill', '#c7d2fe')
            .attr('stroke-width', 1.5)
            .attr('stroke', '#6366f1')
            .style('filter', 'url(#state-glow)');
        }
      })
      .on('mouseout', function(_event, d: any) {
        if (!d3.select(this).classed('answered-correct') && !d3.select(this).classed('blinker')) {
          d3.select(this)
            .attr('fill', getColor(d.properties.ST_NM))
            .attr('stroke-width', 0.7)
            .attr('stroke', '#94a3b8')
            .style('filter', 'none');
        }
      })
      .on('click', function(_event, d: any) {
        if (phase !== 'playing' || isBlinking) return;

        const stateName = d.properties.ST_NM;
        const result = answerState(stateName);

        if (result === 'correct') {
          playSound('correct');

          const attempts = useGameStore.getState().wrongAttempts;
          let restColor = '#4ade80'; // 1st try: Green
          let restStroke = '#16a34a';

          if (attempts === 1) {
            restColor = '#fde047'; // 2nd try: Yellow
            restStroke = '#ca8a04';
          } else if (attempts >= 2) {
            restColor = '#fb923c'; // 3rd try: Orange
            restStroke = '#ea580c';
          }

          d3.select(this)
            .classed('answered-correct', true)
            .style('filter', 'url(#state-glow)');

          gsap.timeline()
            .to(this, { fill: '#ffffff', duration: 0.15 })
            .to(this, {
              fill: restColor,
              stroke: restStroke,
              strokeWidth: 1.5,
              duration: 0.4,
              ease: 'bounce.out'
            });

          // Reveal the label for this state after correct answer
          svg.selectAll('text.state-label')
            .each(function() {
              if (d3.select(this).attr('data-nm') === stateName) {
                d3.select(this)
                  .style('display', 'block')
                  .style('fill-opacity', '0')
                  .transition().duration(500).delay(150)
                  .style('fill-opacity', '1');
              }
            });

          setTimeout(() => {
            nextQuestion();
          }, 900);

        } else if (result === 'wrong') {
          playSound('wrong');

          gsap.timeline()
            .to(this, { fill: '#fca5a5', stroke: '#ef4444', duration: 0.15 })
            .to(this, { fill: '#fecaca', duration: 0.2 })
            .to(this, { x: -4, duration: 0.05 })
            .to(this, { x: 4, duration: 0.05 })
            .to(this, { x: -3, duration: 0.05 })
            .to(this, { x: 0, duration: 0.05 })
            .to(this, {
              fill: getColor(d.properties.ST_NM),
              stroke: '#94a3b8',
              strokeWidth: 0.7,
              duration: 0.3,
              onComplete: () => {
                if (!d3.select(this).classed('answered-correct')) {
                  d3.select(this).style('filter', 'none');
                }
              }
            });

          if (useGameStore.getState().wrongAttempts >= 3) {
            const target = states[useGameStore.getState().currentIndex];
            setBlinking(true, target.name);
          }
        }
      });

    // ── State Labels — HIDDEN (display:none) until correct answer ──────────
    g.selectAll('text.state-label')
      .data(geoData.features)
      .enter()
      .append('text')
      .attr('class', 'pointer-events-none state-label')
      .attr('data-nm', (d: any) => d.properties.ST_NM)
      .attr('x', (d: any) => pathGenerator.centroid(d)[0])
      .attr('y', (d: any) => pathGenerator.centroid(d)[1])
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-family', 'Inter, sans-serif')
      .style('font-weight', '700')
      .style('font-size', '8px')
      .style('fill', '#1e293b')
      .style('pointer-events', 'none')
      .style('display', 'none')   // completely hidden until answered
      .text((d: any) => d.properties.ST_NM);

    // ── Small UT Markers (Lakshadweep, Puducherry, Dadar-Nagar Haveli) ──
    // gSmall is already created above and included in the main zoom handler
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
      const proj = projection([st.lon, st.lat]);
      if (!proj) return;
      const [px, py] = proj;

      // Dot marker for the actual state location
      const marker = gSmall.append('g')
        .attr('class', 'small-ut-marker cursor-pointer')
        .attr('data-name', st.name)
        .attr('transform', `translate(${px}, ${py})`);

      // Pulsing ring
      marker.append('circle')
        .attr('r', 5)
        .attr('fill', '#e8edf5')
        .attr('stroke', '#6366f1')
        .attr('stroke-width', 1.5)
        .attr('class', 'ut-dot');

      // Outer pulse ring
      marker.append('circle')
        .attr('r', 8)
        .attr('fill', 'none')
        .attr('stroke', '#6366f1')
        .attr('stroke-width', 0.8)
        .attr('opacity', 0.5);

      // Click handler for small UT markers
      marker.on('click', function() {
        if (phase !== 'playing' || isBlinking) return;
        const result = answerState(st.name);

        if (result === 'correct') {
          playSound('correct');
          const attempts = useGameStore.getState().wrongAttempts;
          let color = '#4ade80';
          if (attempts === 1) color = '#fde047';
          else if (attempts >= 2) color = '#fb923c';
          
          const allUtDots = gSmall.selectAll(`.small-ut-marker[data-name="${st.name}"] .ut-dot`);
          const allUtMarkers = gSmall.selectAll(`.small-ut-marker[data-name="${st.name}"]`);
          
          allUtMarkers.classed('ut-answered', true);
          allUtDots
            .attr('fill', color)
            .attr('stroke', '#166534');

          // Reveal the UT label
          gSmall.selectAll('.ut-label')
            .each(function() {
              if (d3.select(this).attr('data-ut-name') === st.name) {
                d3.select(this)
                  .style('display', 'block')
                  .style('fill-opacity', '0')
                  .transition().duration(400).delay(200)
                  .style('fill-opacity', '1');
              }
            });

          setTimeout(() => nextQuestion(), 900);

        } else if (result === 'wrong') {
          playSound('wrong');
          const allUtDots = gSmall.selectAll(`.small-ut-marker[data-name="${st.name}"] .ut-dot`);
          allUtDots
            .attr('fill', '#fca5a5')
            .attr('stroke', '#ef4444');
          setTimeout(() => {
            allUtDots
              .attr('fill', '#e8edf5')
              .attr('stroke', '#6366f1');
          }, 800);

          if (useGameStore.getState().wrongAttempts >= 3) {
            const target = states[useGameStore.getState().currentIndex];
            setBlinking(true, target.name);
          }
        }
      })
      .on('mouseover', function() {
        if (phase === 'playing' && !marker.classed('ut-answered')) {
          gSmall.selectAll(`.small-ut-marker[data-name="${st.name}"] .ut-dot`).attr('fill', '#c7d2fe').attr('r', 7);
        }
      })
      .on('mouseout', function() {
        if (!marker.classed('ut-answered')) {
          gSmall.selectAll(`.small-ut-marker[data-name="${st.name}"] .ut-dot`).attr('fill', '#e8edf5').attr('r', 5);
        } else {
          // If answered, just reset size but keep color
           gSmall.selectAll(`.small-ut-marker[data-name="${st.name}"] .ut-dot`).attr('r', 5);
        }
      });

      // UT label — HIDDEN (display:none) until answered correctly
      gSmall.append('text')
        .attr('class', 'ut-label')
        .attr('data-ut-name', st.name)
        .attr('x', px + 9)
        .attr('y', py)
        .attr('dy', '0.35em')
        .style('font-size', '7px')
        .style('font-family', 'Inter, sans-serif')
        .style('font-weight', '700')
        .style('fill', '#4f46e5')
        .style('pointer-events', 'none')
        .style('display', 'none')   // completely hidden until answered
        .text(st.label);
    });

  }, [geoData, neighbourData, containerSize]);

  // ── Blink Effect ─────────────────────────────────────
  useEffect(() => {
    if (isBlinking && highlightedState && phase === 'playing') {
      const svg = d3.select(svgRef.current);
      const allPaths = svg.selectAll('.state-path');
      let targetElements: Element[] = [];

      // Check regular state paths first
      allPaths.each(function(d: any) {
        if (d.properties.ST_NM === highlightedState) {
          targetElements.push(this as Element);
        }
      });

      // If not found in regular paths, check small UT markers
      if (targetElements.length === 0) {
        svg.selectAll('.small-ut-marker').each(function() {
          if (d3.select(this).attr('data-name') === highlightedState) {
            targetElements.push((this as Element).querySelector('.ut-dot') as Element);
          }
        });
      }

      if (targetElements.length > 0) {
        d3.selectAll(targetElements).classed('blinker', true);

        gsap.to(targetElements, {
          fill: '#60a5fa',
          stroke: '#2563eb',
          strokeWidth: 2,
          duration: 0.25,
          yoyo: true,
          repeat: 7,
          ease: 'sine.inOut',
          onComplete: () => {
            d3.selectAll(targetElements)
              .classed('blinker', false)
              .classed('answered-correct', true)
              .classed('ut-answered', true)
              .attr('fill', '#ef4444')
              .attr('stroke', '#b91c1c')
              .attr('stroke-width', 1.5);

            // Also reveal the label for the missed state
            d3.select(svgRef.current).selectAll('text.state-label')
              .each(function() {
                if (d3.select(this).attr('data-nm') === highlightedState) {
                  d3.select(this)
                    .style('display', 'block')
                    .style('fill', '#991b1b')
                    .style('fill-opacity', '0')
                    .transition().duration(400)
                    .style('fill-opacity', '1');
                }
              });

            setBlinking(false, null as any);
            nextQuestion();
          }
        });
      } else {
        setTimeout(() => {
          setBlinking(false, null as any);
          nextQuestion();
        }, 1500);
      }
    }
  }, [isBlinking, highlightedState, nextQuestion, setBlinking, phase]);

  const handleZoomIn = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(350).call(zoomRef.current.scaleBy as any, 1.6);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(350).call(zoomRef.current.scaleBy as any, 0.625);
    }
  };

  const handleReset = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(500).call(zoomRef.current.transform as any, d3.zoomIdentity);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-[100dvh] flex justify-center items-center relative overflow-hidden">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none" />

      {/* Zoom Controls */}
      <div className="absolute bottom-[5.5rem] md:bottom-8 right-3 md:right-6 flex flex-col gap-1.5 md:gap-2 z-10 pointer-events-auto">
        <button onClick={handleZoomIn} title="Zoom In"
          className="w-8 h-8 md:w-11 md:h-11 bg-slate-800/90 backdrop-blur-md rounded-lg md:rounded-xl flex items-center justify-center text-slate-200 text-base md:text-xl font-bold shadow-lg border border-white/10 hover:bg-indigo-700/80 active:scale-95 transition-all">
          +
        </button>
        <button onClick={handleZoomOut} title="Zoom Out"
          className="w-8 h-8 md:w-11 md:h-11 bg-slate-800/90 backdrop-blur-md rounded-lg md:rounded-xl flex items-center justify-center text-slate-200 text-base md:text-xl font-bold shadow-lg border border-white/10 hover:bg-indigo-700/80 active:scale-95 transition-all">
          −
        </button>
        <button onClick={handleReset} title="Reset View"
          className="w-8 h-8 md:w-11 md:h-11 bg-slate-800/90 backdrop-blur-md rounded-lg md:rounded-xl flex items-center justify-center text-slate-400 text-xs md:text-base shadow-lg border border-white/10 hover:bg-slate-700 active:scale-95 transition-all">
          ⊙
        </button>
      </div>

      {/* Legend — desktop full, mobile compact pill */}
      <div className="hidden sm:flex absolute bottom-8 left-4 md:left-6 z-10 pointer-events-none flex-col gap-1.5 bg-slate-900/60 backdrop-blur-md rounded-xl px-3 py-2.5 border border-white/8 shadow-lg">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Legend</span>
        {[{ color: '#4ade80', label: '1st try' }, { color: '#fde047', label: '2nd try' },
          { color: '#fb923c', label: '3rd try' }, { color: '#ef4444', label: 'Missed' }]
          .map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: item.color }} />
              <span className="text-[9px] text-slate-400">{item.label}</span>
            </div>
          ))}
      </div>
      <div className="sm:hidden absolute bottom-[5.5rem] left-3 z-10 pointer-events-none flex items-center gap-1 bg-slate-900/75 backdrop-blur-md rounded-full px-2 py-1 border border-white/10 shadow">
        {['#4ade80','#fde047','#fb923c','#ef4444'].map((c,i)=><div key={i} className="w-2 h-2 rounded-full" style={{background:c}}/>)}
        <span className="text-[7px] text-slate-400 font-semibold ml-0.5">×try</span>
      </div>

      {/* Powered by — desktop only */}
      <a href="https://knoblyweb.in" target="_blank" rel="noopener noreferrer"
        className="hidden sm:flex absolute bottom-5 left-1/2 -translate-x-1/2 z-10 pointer-events-auto text-slate-300 hover:text-white transition-colors text-xs font-semibold items-center gap-1">
        Powered by <span className="text-slate-100 font-bold">Knobly</span>
      </a>
    </div>
  );
}
