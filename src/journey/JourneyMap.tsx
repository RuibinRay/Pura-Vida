// "Where am I in Costa Rica?" — a small map of the country in the corner of the walk: the seven provinces, the route
// through the stops that are real places, and a marker that travels it with the scroll. The outlines are the map
// page's own (OpenStreetMap-derived), the positions are the stops' sourced coordinates, so the marker is where the
// plate on stage is set. The marker is moved straight in the DOM from the journey driver: no render per frame.
import { useEffect, useMemo, useRef } from 'react';
import { Link } from '../ui/Link';
import { PROVINCE_COLORS, type MapData } from '../map/geo';
import { project } from '../map/relief.js';
import { journey, onJourney } from './driver';
import type { ProvinceId } from '../state/map';

export interface RouteStop {
  /** 0-based index of the stop in the walk */
  index: number;
  key: string;
  name: string;
  province?: ProvinceId;
  provinceName?: string;
  /** [lat, lon] */
  coords: [number, number];
}

export function JourneyMap({ data, route, total, label, stopLabel, hideAt = [] }: { data: MapData; route: RouteStop[]; total: number; label: string; stopLabel: (n: number, total: number) => string; /** stops (0-based) that are not places and need the corner: the table */ hideAt?: number[] }) {
  const dot = useRef<SVGGElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const nameEl = useRef<HTMLSpanElement>(null);
  const countEl = useRef<HTMLSpanElement>(null);
  const root = useRef<HTMLDivElement>(null);

  const { box, paths, pts, line } = useMemo(() => {
    const [x0, z0, x1, z1] = data.bbox;
    const pad = 10;
    const box = [x0 - pad, z0 - pad, x1 - x0 + pad * 2, z1 - z0 + pad * 2];
    const ringPath = (ring: [number, number][]) => {
      // every third point is plenty at this size
      let d = '';
      for (let i = 0; i < ring.length; i += 3) { const [x, z] = project(ring[i][0], ring[i][1]); d += (d ? 'L' : 'M') + x.toFixed(0) + ' ' + z.toFixed(0); }
      return d + 'Z';
    };
    const paths = data.shapes.map((s) => ({ id: s.id, d: s.rings.filter((r) => r[0][0] > -86.5 && r.length > 24).map(ringPath).join('') }));
    const pts = route.map((r) => project(r.coords[1], r.coords[0]) as [number, number]);
    const line = pts.map(([x, z], i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + z.toFixed(1)).join('');
    return { box, paths, pts, line };
  }, [data, route]);

  useEffect(() => {
    if (!route.length) return;
    let lastStop = -2;
    const lengths: number[] = [0];
    for (let i = 1; i < pts.length; i++) lengths.push(lengths[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const routeKm = lengths[lengths.length - 1] || 1;
    const update = () => {
      // the walk's time → a position between the last place reached and the next one
      const t = journey.t;
      let a = 0;
      while (a + 1 < route.length && route[a + 1].index <= t) a++;
      const b = Math.min(route.length - 1, a + 1);
      // the marker waits at a place through its stop and travels during the last third before the next one
      const k = t < route[0].index || a === b ? 0 : Math.min(1, Math.max(0, (t - (route[b].index - 0.34)) / 0.34));
      const e = k * k * (3 - 2 * k);
      const x = pts[a][0] + (pts[b][0] - pts[a][0]) * e, z = pts[a][1] + (pts[b][1] - pts[a][1]) * e;
      dot.current?.setAttribute('transform', `translate(${x.toFixed(1)} ${z.toFixed(1)})`);
      if (trail.current) trail.current.style.strokeDasharray = `${(lengths[a] + (lengths[b] - lengths[a]) * e).toFixed(1)} ${(routeKm + 10).toFixed(1)}`;
      if (root.current) root.current.dataset.before = t < route[0].index - 0.3 || hideAt.some((i) => t > i - 0.12 && t < i + 1.02) ? '1' : '0';
      const cur = e > 0.5 ? b : a;
      if (cur !== lastStop) {
        lastStop = cur;
        const r = route[cur];
        // most stop names already say their province ("Arenal · Alajuela")
        if (nameEl.current) nameEl.current.textContent = r.provinceName && !r.name.includes(r.provinceName) ? `${r.name} · ${r.provinceName}` : r.name;
        if (countEl.current) countEl.current.textContent = stopLabel(r.index + 1, total);
        root.current?.querySelectorAll<SVGPathElement>('[data-prov]').forEach((el) => { el.dataset.on = el.dataset.prov === r.province ? '1' : '0'; });
      }
    };
    update();
    return onJourney(update);
  }, [route, pts, stopLabel, total, hideAt]);

  if (!route.length) return null;
  return (
    <div ref={root} className="jmap ui on-dark" data-before="1">
      <Link to="/explore" className="jmap__link" aria-label={label}>
        <svg viewBox={box.join(' ')} className="jmap__svg" aria-hidden="true">
          {paths.map((p) => (<path key={p.id} d={p.d} data-prov={p.id} className="jmap__prov" style={{ ['--c' as string]: PROVINCE_COLORS[p.id] }} />))}
          <path d={line} className="jmap__route" />
          <path ref={trail} d={line} className="jmap__route jmap__route--done" />
          {pts.map(([x, z], i) => (<circle key={route[i].key} cx={x} cy={z} r={3.2} className="jmap__stop" />))}
          <g ref={dot} className="jmap__dot"><circle r={11} className="jmap__halo" /><circle r={5} /></g>
        </svg>
        <span className="jmap__text"><span ref={countEl} className="jmap__count tnum" /><span ref={nameEl} className="jmap__name" /></span>
      </Link>
    </div>
  );
}
