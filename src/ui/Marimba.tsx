// A marimba to play: two octaves of wooden bars, struck with the pointer, a finger, or the keyboard. The notes are
// synthesized (src/audio/marimba.ts) and the instrument is a drawing: it is here to be played, not to stand for a
// recording of one.
import { useCallback, useEffect, useRef, useState } from 'react';
import { strike } from '../audio/marimba';
import { useT } from '../i18n';

const NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const STEPS = [0, 2, 4, 5, 7, 9, 11];
/** Fifteen bars: C4 to C6, the white notes. */
export const BARS = Array.from({ length: 15 }, (_, i) => ({ name: NAMES[i % 7] + (4 + Math.floor(i / 7)), midi: 60 + 12 * Math.floor(i / 7) + STEPS[i % 7] }));
const KEYS = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'z', 'x', 'c', 'v'];

export function Marimba() {
  const { t } = useT();
  const [hit, setHit] = useState<Record<number, number>>({});
  const [silent, setSilent] = useState(false);
  const down = useRef(false);
  const play = useCallback((i: number, when = 0) => {
    if (!strike(BARS[i].midi, when)) setSilent(true);
    window.setTimeout(() => setHit((h) => ({ ...h, [i]: (h[i] || 0) + 1 })), when * 1000);
  }, []);
  // the keyboard plays while the instrument (or a bar) has the focus
  const onKey = (e: React.KeyboardEvent) => {
    if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    const i = KEYS.indexOf(e.key.toLowerCase());
    if (i >= 0) { e.preventDefault(); play(i); }
  };
  useEffect(() => { const up = () => { down.current = false; }; window.addEventListener('pointerup', up); return () => window.removeEventListener('pointerup', up); }, []);
  const scale = () => BARS.forEach((_, i) => play(i, i * 0.16));
  return (
    <div className="marimba ui" onKeyDown={onKey}>
      <div className="marimba__bars" role="group" aria-label={t('culture.marimbaLabel')}>
        {BARS.map((b, i) => (
          <button
            key={b.name}
            type="button"
            className="marimba__bar"
            style={{ ['--i' as string]: i, ['--n' as string]: BARS.length }}
            aria-label={b.name}
            onPointerDown={(e) => { down.current = true; (e.target as HTMLElement).releasePointerCapture?.(e.pointerId); play(i); }}
            onPointerEnter={() => { if (down.current) play(i); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(i); } }}
          >
            <span key={hit[i] || 0} className={'marimba__wood' + (hit[i] ? ' is-hit' : '')} />
            <span className="marimba__note" aria-hidden="true">{b.name[0]}</span>
          </button>
        ))}
      </div>
      <p className="marimba__foot">
        <button type="button" className="btn btn--ghost btn--sm" onClick={scale}>{t('culture.marimbaScale')}</button>
        <small className="muted">{silent ? t('culture.marimbaSilent') : t('culture.marimbaNote')}</small>
      </p>
    </div>
  );
}
