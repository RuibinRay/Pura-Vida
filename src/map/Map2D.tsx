// The 2D map: the same geodata as an SVG. It is the still/accessible version of the relief model,
// with the same selection state, search and fly-to goals.
import { useEffect, useMemo, useRef, useState } from 'react';
import { PROVINCE_COLORS, type MapData } from './geo';
import { project } from './relief.js';
import { useMap, type ProvinceId } from '../state/map';
import { useT, pickLang, type MessageKey } from '../i18n';
import { useCalmMotion } from '../state/settings';
import type { Landmark } from '../content/types';

type Box = [number, number, number, number];

function ringPath(ring: [number, number][]) {
  let d = '';
  ring.forEach(([lon, lat], i) => {
    const [x, z] = project(lon, lat);
    d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + z.toFixed(1);
  });
  return d + 'Z';
}

const KIND_COLOR: Record<string, string> = { volcano: '#b23a2f', mountain: '#6b5b4a', park: '#1f5a3a', reserve: '#3e8a52', refuge: '#3e8a52', wetland: '#2cb1a6', monument: '#8e4a9e', island: '#2cb1a6', capital: '#1d2b22', 'province-capital': '#1d2b22', city: '#1d2b22', town: '#5a6358' };

export function Map2D({ data, landmarks }: { data: MapData; landmarks: Landmark[] }) {
  const { t, lang } = useT();
  const calm = useCalmMotion();
  const selected = useMap((s) => s.selected);
  const hovered = useMap((s) => s.hovered);
  const select = useMap((s) => s.select);
  const hover = useMap((s) => s.hover);
  const layers = useMap((s) => s.layers);
  const goal = useMap((s) => s.goal);
  const active = useMap((s) => s.activeLandmark);
  const setLandmark = useMap((s) => s.setLandmark);

  const countryBox: Box = useMemo(() => { const [x0, z0, x1, z1] = data.bbox; const pad = 18; return [x0 - pad, z0 - pad, x1 - x0 + pad * 2, z1 - z0 + pad * 2]; }, [data]);
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
  const neighborPaths = useMemo(() => data.neighbors.map((n) => n.rings.map(ringPath).join(' ')), [data]);
  const lakePaths = useMemo(() => data.lakes.map(ringPath), [data]);
  const riverPaths = useMemo(() => data.rivers.map((r) => r.map(([lon, lat], i) => { const [x, z] = project(lon, lat); return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + z.toFixed(1); }).join('')), [data]);

  const scale = box[2] / countryBox[2]; // 1 = whole country; smaller = zoomed in
  const unit = box[2] / pxWidth; // viewBox units per CSS pixel
  const fontSize = unit * 13;
  const markerR = unit * 4.5;
  const nameOf = (l: Landmark) => (typeof l.name === 'string' ? l.name : pickLang(l.name, lang));
  const visibleLandmarks = landmarks.filter((l) => {
    const isCity = ['city', 'town', 'capital', 'province-capital'].includes(l.kind);
    if (isCity) return layers.cities && (scale < 0.7 || l.kind === 'capital');
    if (l.kind === 'volcano' || l.kind === 'mountain') return layers.peaks;
    return layers.parks;
  });

  return (
    <svg ref={svgRef} className="map2d" viewBox={box.join(' ')} role="group" aria-label={t('explore.stage')} onClick={() => setLandmark(null)}>
      <rect x={countryBox[0] - 400} y={countryBox[1] - 400} width={countryBox[2] + 800} height={countryBox[3] + 800} fill="#cfe0ec" />
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
      {layers.labels && data.provinces.map((p) => { const [x, z] = project(p.centroid[0], p.centroid[1]); return (
        <text key={p.id} x={x} y={z} className={'map2d__label' + (selected === p.id || hovered === p.id ? ' is-active' : '')} fontSize={fontSize} textAnchor="middle" paintOrder="stroke" stroke="#f4eedf" strokeWidth={fontSize * 0.28}>{pickLang(p.name, lang)}</text>
      ); })}
      {visibleLandmarks.map((l) => { const [x, z] = project(l.lon, l.lat); const isActive = active === l.id; const name = nameOf(l); const showLabel = layers.labels && (isActive || scale < 0.45 || ['volcano', 'capital', 'province-capital'].includes(l.kind)); return (
        <g key={l.id} className="map2d__landmark" onClick={(e) => { e.stopPropagation(); setLandmark(isActive ? null : l.id); }} tabIndex={0} role="button" aria-label={name + ' · ' + t(('explore.kinds.' + l.kind) as MessageKey)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLandmark(isActive ? null : l.id); } }}>
          {l.kind === 'volcano' || l.kind === 'mountain' ? (
            <polygon points={`${x},${z - markerR * 1.4} ${x - markerR * 1.2},${z + markerR * 0.8} ${x + markerR * 1.2},${z + markerR * 0.8}`} fill={KIND_COLOR[l.kind]} stroke="#f4eedf" strokeWidth={markerR * 0.25} />
          ) : (
            <circle cx={x} cy={z} r={markerR * (l.kind === 'capital' ? 1.2 : 0.9)} fill={KIND_COLOR[l.kind] || '#5a6358'} stroke="#f4eedf" strokeWidth={markerR * 0.28} />
          )}
          {showLabel && <text x={x + markerR * 1.6} y={z + fontSize * 0.3} fontSize={fontSize * 0.72} className={'map2d__place' + (isActive ? ' is-active' : '')} paintOrder="stroke" stroke="#f4eedf" strokeWidth={fontSize * 0.22}>{name}{isActive && l.elevationM ? ` · ${l.elevationM.toLocaleString(lang)} m` : ''}</text>}
        </g>
      ); })}
    </svg>
  );
}
