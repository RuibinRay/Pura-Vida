// "What if it erupted?" — the Irazú stop's eruption layer and its sourced dossier. The eruption is a state the
// visitor switches on and off: the crater lake darkens and steams, an ash column rises and drifts west (the way the
// 1963–65 ash went), the sky hazes over and ash falls across the valley. Under reduced motion the same states appear
// as crossfades. Nothing here claims a prediction: the panel's text is labelled as interpretation and sourced.
import { useEffect, useState } from 'react';
import { Link } from '../ui/Link';
import { PLATES, LayerImg } from './Plate';
import { useT } from '../i18n';
import { loadIrazu } from '../content';
import type { IrazuDossier } from '../content/types';
import { Sheet } from '../ui/Sheet';
import { StatusTag } from '../ui/Sources';

const FX = import.meta.env.BASE_URL.replace(/\/?$/, '/') + 'plates/fx/';
const pct = (v: number) => `${(v * 100).toFixed(3)}%`;
const PUFFS = [
  { s: 1, x: -0.02, y: -0.05, sc: 0.6, d: 0 },
  { s: 2, x: 0.03, y: -0.09, sc: 0.85, d: 0.9 },
  { s: 3, x: -0.05, y: -0.14, sc: 1.05, d: 1.8 },
  { s: 1, x: 0.01, y: -0.2, sc: 1.3, d: 2.7 },
  { s: 2, x: -0.08, y: -0.26, sc: 1.55, d: 3.6 },
  { s: 3, x: -0.14, y: -0.31, sc: 1.9, d: 4.5 },
  { s: 1, x: 0.04, y: -0.07, sc: 0.7, d: 5.4 },
  { s: 2, x: -0.03, y: -0.17, sc: 1.2, d: 6.3 },
  { s: 3, x: -0.1, y: -0.24, sc: 1.6, d: 7.2 },
  { s: 1, x: -0.18, y: -0.36, sc: 2.1, d: 8.1 },
];
const ASH = Array.from({ length: 72 }, (_, i) => ({ x: (i * 37 + 11) % 100, d: (i * 7919) % 6000 / 1000, t: 6 + ((i * 131) % 50) / 10, s: 1 + (i % 3) }));
const EMBERS = Array.from({ length: 14 }, (_, i) => ({ ex: `${((i * 53) % 21) - 10}vw`, ey: `${-6 - ((i * 29) % 9)}vw`, d: ((i * 617) % 3000) / 1000, t: 2.2 + ((i * 97) % 14) / 10, s: 1 + (i % 2) }));

/** The layers over the Irazú plate. `on` switches the eruption; `live` enables the animations. */
export function EruptionLayers({ on, live }: { on: boolean; live: boolean }) {
  const m = PLATES['irazu'];
  if (!m) return null;
  const lake = (m.water || []).find((w) => w.name === 'lake');
  const crater = (m.points?.crater as number[] | undefined) || [0.63, 0.34];
  return (
    <div className={'erupt' + (on ? ' is-on' : '')} aria-hidden="true">
      <div className="erupt__haze" />
      {lake && (
        <div className="erupt__lake" style={{ left: pct(lake.box[0]), top: pct(lake.box[1]), width: pct(lake.box[2]), height: pct(lake.box[3]) }}>
          <LayerImg plate="irazu" name="water-lake" box={lake.box} widths={lake.widths} />
          {live && [0, 1, 2].map((i) => (<span key={i} className={`erupt__steam erupt__steam--${i}`} style={{ backgroundImage: `url(${FX}steam.png)` }} />))}
        </div>
      )}
      <div className="erupt__glow" style={{ left: pct(crater[0]), top: pct(crater[1]) }} />
      <div className="erupt__plume" style={{ left: pct(crater[0]), top: pct(crater[1]) }}>
        {PUFFS.map((p, i) => (
          <span key={i} className={`erupt__puff erupt__puff--${i}`} style={{ backgroundImage: `url(${FX}puff-${p.s}.png)`, ['--ox' as string]: `${p.x * 100}vw`, ['--oy' as string]: `${p.y * 100}vw`, ['--sc' as string]: p.sc, ['--d' as string]: `${p.d}s` }} />
        ))}
        {live && <span className="erupt__flash" style={{ left: '-10vw', top: '-18vw' }} />}
        {live && <span className="erupt__flash erupt__flash--2" style={{ left: '-22vw', top: '-34vw' }} />}
        {live && EMBERS.map((e, i) => (<i key={i} className="erupt__ember" style={{ ['--ex' as string]: e.ex, ['--ey' as string]: e.ey, ['--d' as string]: `${e.d}s`, ['--t' as string]: `${e.t}s`, ['--s' as string]: e.s }} />))}
      </div>
      {live && (
        <div className="erupt__ash">
          {ASH.map((a, i) => (<i key={i} style={{ left: `${a.x}%`, ['--d' as string]: `${a.d}s`, ['--t' as string]: `${a.t}s`, ['--s' as string]: a.s }} />))}
        </div>
      )}
    </div>
  );
}

/** The sourced dossier in a sheet: what would happen, the 1963–65 record, who watches the volcano. */
export function EruptionSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, l, lang } = useT();
  const [d, setD] = useState<IrazuDossier | null>(null);
  useEffect(() => { if (open && !d) loadIrazu().then(setD); }, [open, d]);
  const dateFmt = (iso: string) => {
    if (/^\d{4}$/.test(iso)) return iso;
    const [y, mo, da] = iso.split('-').map(Number);
    if (!mo) return iso;
    const dt = new Date(Date.UTC(y, mo - 1, da || 1));
    return dt.toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang === 'es' ? 'es-CR' : 'en-GB', da ? { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' } : { month: 'long', year: 'numeric', timeZone: 'UTC' });
  };
  const fmt = (v: number | string) => (typeof v === 'number' ? v.toLocaleString(lang === 'zh' ? 'zh-CN' : lang === 'es' ? 'es-CR' : 'en') : v);
  return (
    <Sheet open={open} onClose={onClose} title={t('journey.erupt.sheetTitle')}>
      {!d ? <p className="muted">{t('common.loading')}</p> : (
        <div className="sheet-entry dossier">
          {d.whatIf && (
            <section>
              <h3>{t('journey.erupt.whatWould')}</h3>
              <p className="ui dossier__meta"><StatusTag status={d.whatIf.status || 'interpretation'} /> <Link to="/sources">{t('common.sourcesN', { n: d.whatIf.sources?.length || 0 })}</Link></p>
              <p>{l(d.whatIf)}</p>
            </section>
          )}
          {d.facts.length > 0 && (
            <ul className="dossier__facts">
              {d.facts.slice(0, 6).map((f) => (
                <li key={f.key}>
                  <b className="tnum">{fmt(f.value)}</b>
                  <span>{l(f.label)}</span>
                  <small className="ui">{f.status !== 'confirmed' && <StatusTag status={f.status} />} {f.year ? f.year : ''} · <Link to="/sources">{t('common.sourcesN', { n: f.sources.length })}</Link></small>
                </li>
              ))}
            </ul>
          )}
          <section>
            <h3>{t('journey.erupt.record')}</h3>
            <ol className="dossier__timeline">
              {d.timeline.map((e) => (
                <li key={e.date + e.en.slice(0, 12)}>
                  <time dateTime={e.date}>{dateFmt(e.date)}</time>
                  <p>{lang === 'es' && e.es ? e.es : lang === 'zh' && e.zh ? e.zh : e.en} {e.status && e.status !== 'confirmed' && <StatusTag status={e.status} />}</p>
                </li>
              ))}
            </ol>
          </section>
          {d.monitoring && (
            <section>
              <h3>{t('journey.erupt.watching')}</h3>
              <p>{l(d.monitoring)}</p>
              {d.park && <p>{l(d.park)}</p>}
            </section>
          )}
          <p className="ui dossier__foot"><Link to="/sources" className="btn btn--ghost btn--sm">{t('nav.sources')}</Link> <Link to="/provinces/cartago" className="btn btn--ghost btn--sm">{t('journey.erupt.cartago')}</Link></p>
        </div>
      )}
    </Sheet>
  );
}
