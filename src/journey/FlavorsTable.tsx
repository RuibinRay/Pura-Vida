// The table stop: a wooden table seen from above, set as the visitor scrolls. Each dish is a photograph of the real
// plate, cut out (tools/food_plates.py), so it can slide in from its own side of the table, settle, steam, lift under
// the pointer and open into its story. The scroll is the only clock for the setting of the table: scrolling back
// clears it again.
import { useEffect, useState } from 'react';
import { Link } from '../ui/Link';
import { Sheet } from '../ui/Sheet';
import { FoodEntry } from '../ui/FoodEntry';
import { DishPhoto, PhotoCredit } from '../ui/DishPhoto';
import { IngredientIcon, ingredientIconFor } from '../art/food/ingredients';
import { useT } from '../i18n';
import type { Food } from '../content/types';
import { usePassport } from '../state/passport';
import { Icon } from '../ui/Icon';

interface DishSpot {
  id: string;
  /** centre, in the table's drawing units */
  x: number; y: number;
  /** diameter, in the table's drawing units */
  d: number;
  /** where it comes from as the table is set: a direction in table widths, and the turn it arrives with (degrees) */
  from: [number, number]; turn: number;
  /** the angle it rests at */
  rest: number;
}
/** Where each plate rests, per orientation (the table is 1600 × 900 or 900 × 1600 drawing units). */
export const LAYOUTS: Record<'landscape' | 'portrait', { w: number; h: number; dishes: DishSpot[] }> = {
  landscape: {
    w: 1600, h: 900,
    dishes: [
      { id: 'casado', x: 890, y: 268, d: 372, from: [0, -0.5], turn: -24, rest: -4 },
      { id: 'tamal', x: 1330, y: 300, d: 360, from: [0.5, -0.3], turn: 30, rest: 6 },
      { id: 'gallo-pinto', x: 420, y: 646, d: 372, from: [-0.5, 0.2], turn: -36, rest: -8 },
      { id: 'olla-de-carne', x: 880, y: 668, d: 352, from: [0, 0.5], turn: 20, rest: 0 },
      { id: 'rice-and-beans', x: 1318, y: 690, d: 356, from: [0.5, 0.3], turn: 28, rest: 5 },
    ],
  },
  portrait: {
    // a phone is narrower than this 9:16 table, which covers the screen by its height: the plates keep to the middle
    // four fifths of the width, so none is cut by the screen's edge
    w: 900, h: 1600,
    dishes: [
      { id: 'gallo-pinto', x: 290, y: 740, d: 330, from: [-0.8, 0], turn: -30, rest: -6 },
      { id: 'casado', x: 612, y: 820, d: 336, from: [0.8, 0], turn: 26, rest: 4 },
      { id: 'tamal', x: 292, y: 1110, d: 330, from: [-0.8, 0.1], turn: -24, rest: -5 },
      { id: 'olla-de-carne', x: 612, y: 1180, d: 318, from: [0.8, 0.1], turn: 22, rest: 0 },
      { id: 'rice-and-beans', x: 440, y: 1436, d: 286, from: [0, 0.4], turn: 18, rest: 3 },
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

const FX = import.meta.env.BASE_URL.replace(/\/?$/, '/') + 'plates/fx/steam.png';

export function FlavorsTable({ foods }: { foods: Food[]; index?: number }) {
  const { t, l } = useT();
  const [open, setOpen] = useState<Food | null>(null);
  const stamp = usePassport((s) => s.stamp);
  const byId = new Map(foods.map((f) => [f.id, f]));
  const openFood = (id: string) => { const f = byId.get(id); if (f) { setOpen(f); stamp('food', f.id); } };
  const orientation = useOrientation();
  const layout = LAYOUTS[orientation];
  const rows = Math.ceil(layout.h / 150);
  const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`;
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
            <radialGradient id="tableLight" cx="0.56" cy="0.42" r="0.75">
              <stop offset="0" stopColor="#ffdca8" stopOpacity="0.26" />
              <stop offset="0.55" stopColor="#ffdca8" stopOpacity="0.02" />
              <stop offset="1" stopColor="#000000" stopOpacity="0.42" />
            </radialGradient>
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
          {/* a woven runner under the dishes */}
          <rect x={layout.w * 0.075} y={layout.h * 0.08} width={layout.w * 0.85} height={layout.h * 0.78} rx="10" fill="#e8d8b8" opacity="0.13" />
          <rect x={layout.w * 0.075} y={layout.h * 0.08} width={layout.w * 0.85} height={layout.h * 0.78} rx="10" fill="none" stroke="#f4eedf" strokeWidth="2" opacity="0.25" strokeDasharray="14 10" />
          <rect x="0" y="0" width={layout.w} height={layout.h} fill="url(#tableLight)" />
        </svg>
        <div className="tdishes" role="group" aria-label={t('journey.ch5.hotspots')}>
          {layout.dishes.map((d, i) => {
            const f = byId.get(d.id);
            if (!f) return null;
            const vars = { left: pct(d.x, layout.w), top: pct(d.y, layout.h), width: pct(d.d, layout.w), ['--i' as string]: i, ['--fx' as string]: d.from[0], ['--fy' as string]: d.from[1], ['--turn' as string]: `${d.turn}deg`, ['--rest' as string]: `${d.rest}deg` } as React.CSSProperties;
            return (
              <button key={d.id} type="button" className={'tdish tdish--' + d.id} style={vars} onClick={() => openFood(d.id)}>
                <span className="tdish__shadow" aria-hidden="true" />
                <span className="tdish__lift">
                  <DishPhoto id={d.id} size="100%" sizes="(max-aspect-ratio: 1/1) 46vw, 24vw" eager />
                  <span className="tdish__steam" aria-hidden="true">
                    <i style={{ backgroundImage: `url(${FX})` }} /><i style={{ backgroundImage: `url(${FX})` }} />
                  </span>
                </span>
                <span className="tdish__label"><b>{l(f.name)}</b>{f.kind && <i>{l(f.kind)}</i>}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="stage__vignette stage__vignette--table" />
      <Sheet open={!!open} onClose={() => setOpen(null)} title={open ? l(open.name) : ''}>
        {open && (
          <div className="sheet-entry">
            <div className="dish-present">
              <div className="dish-present__plate"><DishPhoto id={open.id} size="100%" sizes="220px" title={l(open.name)} eager /></div>
              <div className="dish-present__side">
                {open.ingredients && open.ingredients.length > 0 && (
                  <ul className="dish-present__chips ui" aria-label={t('food.ingredients')}>
                    {open.ingredients.slice(0, 8).map((ing, i) => {
                      const icon = ingredientIconFor(ing.en);
                      return (<li key={i} style={{ ['--i' as string]: i }}>{icon && <IngredientIcon name={icon} size={22} />}<span>{l(ing)}</span></li>);
                    })}
                  </ul>
                )}
                <p className="ui dish-present__links">
                  <Link to={'/food?focus=' + open.id} className="btn btn--primary btn--sm">{t('journey.ch5.openJournal')}</Link>
                  <Link to={'/explore?dish=' + open.id} className="btn btn--ghost btn--sm"><Icon name="pin" /> {t('food.onMap')}</Link>
                </p>
              </div>
            </div>
            <PhotoCredit id={open.id} />
            <FoodEntry food={open} heading="h3" compact />
          </div>
        )}
      </Sheet>
    </div>
  );
}
