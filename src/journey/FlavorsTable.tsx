// Chapter 5: a wooden table seen from above with five traditional dishes. Hovering a dish shows its name;
// clicking opens its journal entry (ingredients, preparation, cultural context, history, sources).
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sheet } from '../ui/Sheet';
import { FoodEntry } from '../ui/FoodEntry';
import { DISH_ART } from './dishes';
import { useT } from '../i18n';
import type { Food } from '../content/types';
import { usePassport } from '../state/passport';

interface DishSpot { id: string; x: number; y: number; box: [number, number, number, number]; scale?: number }
/** Dish placement in the table's drawing space and the matching hotspot boxes (fractions of the table). */
export const LAYOUTS: Record<'landscape' | 'portrait', { w: number; h: number; dishes: DishSpot[] }> = {
  landscape: {
    w: 1600, h: 900,
    dishes: [
      { id: 'casado', x: 880, y: 280, box: [41, 12, 30, 38] },
      { id: 'tamal', x: 1330, y: 290, box: [68, 14, 30, 36] },
      { id: 'gallo-pinto', x: 420, y: 650, box: [12, 54, 24, 42] },
      { id: 'olla-de-carne', x: 880, y: 680, box: [42, 54, 26, 42] },
      { id: 'rice-and-beans', x: 1310, y: 690, box: [69, 56, 24, 42] },
    ],
  },
  portrait: {
    w: 900, h: 1600,
    dishes: [
      { id: 'gallo-pinto', x: 250, y: 760, box: [6, 39, 40, 21], scale: 0.9 },
      { id: 'casado', x: 640, y: 800, box: [50, 39, 46, 23], scale: 0.8 },
      { id: 'tamal', x: 240, y: 1120, box: [5, 62, 42, 19], scale: 0.8 },
      { id: 'olla-de-carne', x: 650, y: 1140, box: [50, 62, 42, 21], scale: 0.85 },
      { id: 'rice-and-beans', x: 450, y: 1430, box: [28, 82, 44, 16], scale: 0.85 },
    ],
  },
};

function useOrientation(): 'landscape' | 'portrait' {
  const [o, setO] = useState<'landscape' | 'portrait'>(() => (typeof window !== 'undefined' && window.matchMedia('(max-aspect-ratio: 1/1)').matches ? 'portrait' : 'landscape'));
  useEffect(() => {
    const mq = window.matchMedia('(max-aspect-ratio: 1/1)');
    const on = () => setO(mq.matches ? 'portrait' : 'landscape');
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return o;
}

export function FlavorsTable({ foods }: { foods: Food[] }) {
  const { t, l } = useT();
  const [open, setOpen] = useState<Food | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const stamp = usePassport((s) => s.stamp);
  const byId = new Map(foods.map((f) => [f.id, f]));
  const openFood = (id: string) => { const f = byId.get(id); if (f) { setOpen(f); stamp('food', f.id); } };
  const orientation = useOrientation();
  const layout = LAYOUTS[orientation];
  const DISHES = layout.dishes;
  const rows = Math.ceil(layout.h / 150);
  return (
    <div className="stage__table">
      <div className="plate plate--table" style={{ aspectRatio: `${layout.w} / ${layout.h}`, ['--ratio' as string]: (layout.w / layout.h).toFixed(4) }}>
        <svg className="table" viewBox={`0 0 ${layout.w} ${layout.h}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <defs>
            <filter id="woodGrain" x="0" y="0" width="1" height="1">
              <feTurbulence type="fractalNoise" baseFrequency="0.004 0.09" numOctaves="4" seed="7" result="noise" />
              <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.36  0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 0.55 0" result="grain" />
              <feBlend in="SourceGraphic" in2="grain" mode="multiply" />
            </filter>
            <filter id="dishSoft" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="0.6" />
            </filter>
            <linearGradient id="tableLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.22" />
              <stop offset="0.5" stopColor="#ffd9a0" stopOpacity="0.02" />
              <stop offset="1" stopColor="#000000" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          {/* planks */}
          <g filter="url(#woodGrain)">
            <rect x="0" y="0" width={layout.w} height={layout.h} fill="#7a4a2a" />
            {Array.from({ length: rows }, (_, i) => i * 150).map((y) => (
              <rect key={y} x="0" y={y} width={layout.w} height="150" fill={y % 300 ? '#73452a' : '#7e4e2d'} />
            ))}
          </g>
          <g stroke="#3c2213" strokeWidth="3" opacity="0.55">
            {Array.from({ length: rows - 1 }, (_, i) => (i + 1) * 150).map((y) => <line key={y} x1="0" y1={y} x2={layout.w} y2={y} />)}
          </g>
          <rect x="0" y="0" width={layout.w} height={layout.h} fill="url(#tableLight)" />
          {/* a woven runner under the dishes */}
          <rect x={layout.w * 0.075} y={layout.h * 0.08} width={layout.w * 0.85} height={layout.h * 0.78} rx="10" fill="#e8d8b8" opacity="0.14" />
          <rect x={layout.w * 0.075} y={layout.h * 0.08} width={layout.w * 0.85} height={layout.h * 0.78} rx="10" fill="none" stroke="#f4eedf" strokeWidth="2" opacity="0.25" strokeDasharray="14 10" />
          {DISHES.map((d, i) => {
            const Art = DISH_ART[d.id];
            if (!Art) return null;
            return (
              <g key={d.id} transform={`translate(${d.x} ${d.y}) scale(${d.scale ?? 1})`}>
                <g className={'dish' + (hover === d.id ? ' is-on' : '')} style={{ ['--i' as string]: i }}>
                  <Art />
                </g>
              </g>
            );
          })}
        </svg>
        <div className="plate__hotspots plate__hotspots--table" role="group" aria-label={t('journey.ch5.hotspots')}>
          {DISHES.map((d, i) => {
            const f = byId.get(d.id);
            if (!f) return null;
            return (
              <button
                key={d.id}
                type="button"
                className={'hotspot hotspot--dish' + (hover === d.id ? ' is-on' : '')}
                style={{ left: `${d.box[0]}%`, top: `${d.box[1]}%`, width: `${d.box[2]}%`, height: `${d.box[3]}%`, ['--i' as string]: i }}
                onClick={() => openFood(d.id)}
                onPointerEnter={() => setHover(d.id)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(d.id)}
                onBlur={() => setHover(null)}
              >
                <span className="hotspot__label hotspot__label--dish"><b>{l(f.name)}</b>{f.kind && <i>{l(f.kind)}</i>}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="stage__vignette stage__vignette--table" />
      <Sheet open={!!open} onClose={() => setOpen(null)} title={open ? l(open.name) : ''}>
        {open && (
          <div className="sheet-entry">
            <FoodEntry food={open} heading="h3" compact />
            <p className="ui"><Link to={'/food?focus=' + open.id} className="btn btn--ghost btn--sm">{t('journey.ch5.openJournal')}</Link></p>
          </div>
        )}
      </Sheet>
    </div>
  );
}
