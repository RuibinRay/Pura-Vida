// The 2D map: the same geodata as an SVG. It is the still/accessible version of the relief model, with the same
// selection state, search, filters, layers (cartoon animals and dishes drawn in place) and fly-to goals.
import { useEffect, useMemo, useRef, useState } from 'react';
import { PROVINCE_COLORS, type MapData } from './geo';
import { project } from './relief.js';
import { useMap, type ProvinceId } from '../state/map';
import { useT, pickLang, type MessageKey } from '../i18n';
import { useCalmMotion } from '../state/settings';
import { useContent } from '../content';
import type { Landmark } from '../content/types';
import { COCO_INSET, MARKER_COLORS, displayLonLat, landmarkName, showAtLevel } from './explore';
import { spritePositions, SPRITE_PX } from './sprites';
import { ANIMAL_ART } from '../art/animals';
import { DISH_ART } from '../journey/dishes';

type Box = [number, number, number, number];

function ringPath(ring: [number, number][]) {
  let d = '';
  ring.forEach(([lon, lat], i) => {
    const [x, z] = project(lon, lat);
    d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + z.toFixed(1);
  });
  return d + 'Z';
}

export function Map2D({ data, landmarks }: { data: MapData; landmarks: Landmark[] }) {
  const { t, lang, l: loc } = useT();
  const calm = useCalmMotion();
  const content = useContent();
  const selected = useMap((s) => s.selected);
  const hovered = useMap((s) => s.hovered);
  const select = useMap((s) => s.select);
  const hover = useMap((s) => s.hover);
  const layers = useMap((s) => s.layers);
  const filter = useMap((s) => s.filter);
  const goal = useMap((s) => s.goal);
  const active = useMap((s) => s.activeLandmark);
  const setLandmark = useMap((s) => s.setLandmark);
  const showWildlife = useMap((s) => s.showWildlife);
  const showFood = useMap((s) => s.showFood);
  const activeAnimal = useMap((s) => s.activeAnimal);
  const setAnimal = useMap((s) => s.setAnimal);
  const activeFood = useMap((s) => s.activeFood);
  const setFood = useMap((s) => s.setFood);

  const countryBox: Box = useMemo(() => { const [x0, z0, x1, z1] = data.bbox; const pad = 18; return [Math.min(x0, COCO_INSET.cx - COCO_INSET.half) - pad, z0 - pad, Math.max(x1, 0) - Math.min(x0, COCO_INSET.cx - COCO_INSET.half) + pad * 2, Math.max(z1, COCO_INSET.cz + COCO_INSET.half) - z0 + pad * 2]; }, [data]);
  const [box, setBox] = useState<Box>(countryBox);
  const anim = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [pxWidth, setPxWidth] = useState(900);
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setPxWidth(el.clientWidth || 900));
    ro.observe(el);
    setPxWidth(el.clientWidth || 900);
    return () => ro.disconnect();
  }, []);

  // goal → animated viewBox
  useEffect(() => {
    let target: Box = countryBox;
    if (goal.kind === 'province') {
      const p = data.provinces.find((q) => q.id === goal.id);
      if (p) { const [x0, z0, x1, z1] = p.bbox; const pad = Math.max(x1 - x0, z1 - z0) * 0.18 + 6; target = [x0 - pad, z0 - pad, x1 - x0 + pad * 2, z1 - z0 + pad * 2]; }
    } else if (goal.kind === 'point') {
      const [x, z] = project(goal.lon, goal.lat); const r = (goal.distance ?? 60) * 0.5; target = [x - r, z - r * 0.7, r * 2, r * 1.4];
    }
    if (calm) { setBox(target); return; }
    const from = box.slice() as Box; const start = performance.now(); const dur = 700;
    const step = (now: number) => {
      const u = Math.min(1, (now - start) / dur); const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      setBox(from.map((v, i) => v + (target[i] - v) * e) as Box);
      if (u < 1) anim.current = requestAnimationFrame(step);
    };
    if (anim.current) cancelAnimationFrame(anim.current);
    anim.current = requestAnimationFrame(step);
    return () => { if (anim.current) cancelAnimationFrame(anim.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal, countryBox, calm]);

  const paths = useMemo(() => data.shapes.map((s) => ({ id: s.id, d: s.rings.filter((r) => { const [lon] = r[0]; return lon > -86.5; }).map(ringPath).join(' ') })), [data]);
  // Isla del Coco, enlarged in an inset (the same frame as the relief model)
  const coco = useMemo(() => {
    const ring = data.shapes.find((s) => s.id === 'puntarenas')?.rings.find((r) => r[0][0] <= -86.5);
    if (!ring) return null;
    const pts = ring.map(([lon, lat]) => project(lon, lat));
    const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cz = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    const d = pts.map(([x, z], i) => (i ? 'L' : 'M') + ((x - cx) * COCO_INSET.scale + COCO_INSET.cx).toFixed(1) + ' ' + ((z - cz) * COCO_INSET.scale + COCO_INSET.cz).toFixed(1)).join('') + 'Z';
    return d;
  }, [data]);
  const neighborPaths = useMemo(() => data.neighbors.map((n) => n.rings.map(ringPath).join(' ')), [data]);
  const lakePaths = useMemo(() => data.lakes.map(ringPath), [data]);
  const riverPaths = useMemo(() => data.rivers.map((r) => r.map(([lon, lat], i) => { const [x, z] = project(lon, lat); return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + z.toFixed(1); }).join('')), [data]);

  const scale = box[2] / countryBox[2]; // 1 = whole country; smaller = zoomed in
  const unit = box[2] / pxWidth; // viewBox units per CSS pixel
  const fontSize = unit * 13;
  const markerR = unit * 4.5;
  const level: 'far' | 'mid' | 'near' = scale > 0.7 ? 'far' : scale > 0.35 ? 'mid' : 'near';
  const visibleLandmarks = landmarks.filter((lm) => lm.id === active || showAtLevel(lm, filter, level));
  const sprites = spritePositions(landmarks, { wildlife: showWildlife, food: showFood }, level === 'far' ? 1 : Infinity);
  const spritePx = unit * SPRITE_PX[level]; // a fixed CSS-px sprite, whatever the zoom
  const speciesName = (id: string) => { const sp = content?.species.find((s) => s.id === id); return sp ? loc(sp.commonNames) : id; };
  const dishName = (id: string) => { const f = content?.foods.find((s) => s.id === id); return f ? loc(f.name) : id; };

  return (
    <svg ref={svgRef} className="map2d" viewBox={box.join(' ')} role="group" aria-label={t('explore.stage')} onClick={() => setLandmark(null)}>
      <defs>
        <linearGradient id="map2d-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bfe0ee" /><stop offset="1" stopColor="#7fb6d3" /></linearGradient>
      </defs>
      <rect x={countryBox[0] - 400} y={countryBox[1] - 400} width={countryBox[2] + 800} height={countryBox[3] + 800} fill="url(#map2d-sea)" />
      {neighborPaths.map((d, i) => (
        <path key={'n' + i} d={d} fill="#e6dcc4" stroke="#b9ad90" strokeWidth={0.6} />
      ))}
      {lakePaths.map((d, i) => (
        <path key={'l' + i} d={d} fill="#8fbbd6" />
      ))}
      {riverPaths.map((d, i) => (
        <path key={'r' + i} d={d} fill="none" stroke="#5f98bd" strokeWidth={0.8} />
      ))}
      <g>
        {paths.map((p) => {
          const isSel = selected === p.id, isHov = hovered === p.id;
          const prov = data.provinces.find((q) => q.id === p.id)!;
          return (
            <path
              key={p.id}
              d={p.d}
              className={'map2d__province' + (isSel ? ' is-selected' : '') + (isHov ? ' is-hovered' : '')}
              fill={PROVINCE_COLORS[p.id as ProvinceId]}
              fillOpacity={selected && !isSel && !isHov ? 0.55 : isSel || isHov ? 1 : 0.85}
              stroke={isSel ? '#f0c25a' : '#2a2420'}
              strokeWidth={isSel ? unit * 2.2 : layers.borders ? unit * 0.9 : 0}
              strokeLinejoin="round"
              tabIndex={0}
              role="button"
              aria-pressed={isSel}
              aria-label={pickLang(prov.name, lang)}
              onMouseEnter={() => hover(p.id as ProvinceId)}
              onMouseLeave={() => hover(null)}
              onFocus={() => hover(p.id as ProvinceId)}
              onBlur={() => hover(null)}
              onClick={(e) => { e.stopPropagation(); select(p.id as ProvinceId); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(p.id as ProvinceId); } }}
            />
          );
        })}
      </g>
      {coco && (
        <g className="map2d__inset" aria-hidden="true">
          <rect x={COCO_INSET.cx - COCO_INSET.half} y={COCO_INSET.cz - COCO_INSET.half} width={COCO_INSET.half * 2} height={COCO_INSET.half * 2} fill="#0d3657" fillOpacity={0.85} stroke="#f4eedf" strokeWidth={unit * 0.8} />
          <path d={coco} fill={PROVINCE_COLORS.puntarenas} stroke="#2a2420" strokeWidth={unit * 0.6} />
          <text x={COCO_INSET.cx} y={COCO_INSET.cz + COCO_INSET.half + fontSize * 0.9} className="map2d__place" textAnchor="middle" fontSize={fontSize * 0.62} fill="#1d2b22" paintOrder="stroke" stroke="#f4eedf" strokeWidth={fontSize * 0.2}>Isla del Coco ×7</text>
        </g>
      )}
      {layers.labels && data.provinces.map((p) => { const [x, z] = project(p.centroid[0], p.centroid[1]); return (
        <text key={p.id} x={x} y={z} className={'map2d__label' + (selected === p.id || hovered === p.id ? ' is-active' : '')} fontSize={fontSize} textAnchor="middle" paintOrder="stroke" stroke="#f4eedf" strokeWidth={fontSize * 0.28}>{pickLang(p.name, lang)}</text>
      ); })}
      {visibleLandmarks.map((lm) => { const [lon, lat] = displayLonLat(lm); const [x, z] = project(lon, lat); const isActive = active === lm.id; const name = landmarkName(lm, lang); const showLabel = layers.labels && (isActive || scale < 0.45 || filter !== 'all' || ['volcano', 'capital', 'province-capital'].includes(lm.kind)); const color = MARKER_COLORS[lm.kind] || '#5a6358'; return (
        <g key={lm.id} className={'map2d__landmark' + (isActive ? ' is-active' : '')} onClick={(e) => { e.stopPropagation(); if (lm.province) select(lm.province, false); setLandmark(isActive ? null : lm.id); }} tabIndex={0} role="button" aria-label={name + (isActive && lm.elevationM ? ` · ${lm.elevationM.toLocaleString(lang)} m` : '') + ' · ' + t(('explore.kinds.' + lm.kind) as MessageKey)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLandmark(isActive ? null : lm.id); } }}>
          {isActive && <circle cx={x} cy={z} r={markerR * 2.2} fill="none" stroke="#f0c25a" strokeWidth={markerR * 0.4} />}
          {lm.kind === 'volcano' || lm.kind === 'mountain' ? (
            <polygon points={`${x},${z - markerR * 1.4} ${x - markerR * 1.2},${z + markerR * 0.8} ${x + markerR * 1.2},${z + markerR * 0.8}`} fill={color} stroke="#f4eedf" strokeWidth={markerR * 0.25} />
          ) : lm.kind === 'museum' || lm.kind === 'building' || lm.kind === 'monument' ? (
            <rect x={x - markerR * 0.9} y={z - markerR * 0.9} width={markerR * 1.8} height={markerR * 1.8} rx={markerR * 0.25} fill={color} stroke="#f4eedf" strokeWidth={markerR * 0.25} />
          ) : (
            <circle cx={x} cy={z} r={markerR * (lm.kind === 'capital' ? 1.2 : 0.9)} fill={color} stroke="#f4eedf" strokeWidth={markerR * 0.28} />
          )}
          {showLabel && <text x={x + markerR * 1.6} y={z + fontSize * 0.3} fontSize={fontSize * 0.72} className={'map2d__place' + (isActive ? ' is-active' : '')} paintOrder="stroke" stroke="#f4eedf" strokeWidth={fontSize * 0.22}>{name}{isActive && lm.elevationM ? ` · ${lm.elevationM.toLocaleString(lang)} m` : ''}</text>}
        </g>
      ); })}
      {sprites.map((s) => {
        const [lon, lat] = displayLonLat(s.lm);
        const [x0, z0] = project(lon, lat);
        const x = x0 + s.dx, z = z0 + s.dz;
        const Art = s.kind === 'animal' ? ANIMAL_ART[s.id] : DISH_ART[s.id];
        if (!Art) return null;
        const isOn = s.kind === 'animal' ? activeAnimal === s.id : activeFood === s.id;
        const name = s.kind === 'animal' ? speciesName(s.id) : dishName(s.id);
        // animals are drawn in a 200-unit box, dishes in a 520×400 box centred on 0,0
        const k = s.kind === 'animal' ? spritePx / 200 : spritePx / 520;
        const tf = s.kind === 'animal' ? `translate(${x - spritePx / 2} ${z - spritePx}) scale(${k})` : `translate(${x} ${z - spritePx * 0.4}) scale(${k})`;
        return (
          <g key={s.key} className={'map2d__sprite map2d__sprite--' + s.kind + (isOn ? ' is-on' : '')} tabIndex={0} role="button" aria-label={name + ' · ' + landmarkName(s.lm, lang)} onClick={(e) => { e.stopPropagation(); if (s.kind === 'animal') { if (s.lm.province) select(s.lm.province, false); setAnimal(isOn ? null : s.id); } else setFood(isOn ? null : s.id); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (s.kind === 'animal') setAnimal(isOn ? null : s.id); else setFood(isOn ? null : s.id); } }}>
            <circle cx={x} cy={z - spritePx * 0.45} r={spritePx * 0.56} fill="#ffffff" fillOpacity={isOn ? 1 : 0.85} stroke={isOn ? '#f0c25a' : '#2a1d14'} strokeWidth={unit * (isOn ? 2 : 0.8)} />
            <g transform={tf}><Art /></g>
          </g>
        );
      })}
    </svg>
  );
}
