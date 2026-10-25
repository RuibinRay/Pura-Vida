// The map widget used by /explore and by each province chapter: toolbar, stage (3D, 2D or text),
// the keyboard twin list and the contextual panel.
import { lazy, Suspense, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from '../ui/Link';
import { useMapData } from './useMapData';
import { Map2D } from './Map2D';
import { PROVINCE_COLORS, PROVINCE_ORDER } from './geo';
import { useMap, type ProvinceId, type Layers } from '../state/map';
import { useTier } from '../perf/tier';
import { useSettings } from '../state/settings';
import { useT, pickLang, type MessageKey } from '../i18n';
import { useContent } from '../content';
import type { Landmark, ProvinceContent } from '../content/types';
import { Icon } from '../ui/Icon';

const Map3D = lazy(() => import('./Map3D').then((m) => ({ default: m.Map3D })));

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function MapStage({ focus, compact }: { focus?: ProvinceId; compact?: boolean }) {
  const { data, error } = useMapData();
  const { t, l, lang } = useT();
  const tier = useTier((s) => s.tier);
  const paused = useSettings((s) => s.paused);
  const setPaused = useSettings((s) => s.setPaused);
  const view = useMap((s) => s.view);
  const setView = useMap((s) => s.setView);
  const selected = useMap((s) => s.selected);
  const select = useMap((s) => s.select);
  const reset = useMap((s) => s.reset);
  const layers = useMap((s) => s.layers);
  const toggleLayer = useMap((s) => s.toggleLayer);
  const flyTo = useMap((s) => s.flyTo);
  const activeLandmark = useMap((s) => s.activeLandmark);
  const setLandmark = useMap((s) => s.setLandmark);
  const content = useContent();
  const stageRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState('');
  const listId = useId();

  const landmarks: Landmark[] = content?.landmarks ?? [];
  const provinces: ProvinceContent[] = content?.provinces ?? [];

  // focus mode: a province chapter opens with its province selected
  useEffect(() => {
    if (focus && data) select(focus, true);
    return () => { if (focus) useMap.getState().reset(); };
  }, [focus, data, select]);

  useEffect(() => {
    if (!selected || !data) return;
    const p = data.provinces.find((q) => q.id === selected);
    if (p) setLive(t('explore.selected', { name: pickLang(p.name, lang) }));
  }, [selected, data, lang, t]);

  const effectiveView: '3d' | '2d' | 'text' = tier === 'text' ? 'text' : tier === 'still' ? '2d' : view;

  // search
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    if (!data || !query.trim()) return [];
    const q = normalize(query.trim());
    const out: { id: string; label: string; sub: string; go: () => void }[] = [];
    for (const p of data.provinces) {
      const name = pickLang(p.name, lang);
      if (normalize(name).includes(q) || normalize(p.name.en).includes(q) || normalize(p.name.es || '').includes(q)) out.push({ id: 'p:' + p.id, label: name, sub: t('nav.provinces'), go: () => select(p.id, true) });
    }
    for (const lm of landmarks) {
      const name = typeof lm.name === 'string' ? lm.name : pickLang(lm.name, lang);
      const alt = typeof lm.name === 'string' ? '' : lm.name.en + ' ' + (lm.name.es || '');
      if (normalize(name).includes(q) || normalize(alt).includes(q)) out.push({ id: 'l:' + lm.id, label: name, sub: t(('explore.kinds.' + lm.kind) as MessageKey), go: () => { if (lm.province) select(lm.province, false); setLandmark(lm.id); flyTo({ kind: 'point', lon: lm.lon, lat: lm.lat, distance: 90 }); } });
    }
    return out.slice(0, 8);
  }, [data, query, lang, landmarks, select, setLandmark, flyTo, t]);

  const selectedProvince = provinces.find((p) => p.id === selected);
  const selectedGeo = data?.provinces.find((p) => p.id === selected);
  const activeLm = landmarks.find((x) => x.id === activeLandmark);

  const layerKeys: (keyof Layers)[] = ['relief', 'borders', 'labels', 'cities', 'peaks', 'parks'];
  const layerLabel: Record<keyof Layers, MessageKey> = { relief: 'explore.layerRelief', borders: 'explore.layerBorders', labels: 'explore.layerLabels', cities: 'explore.layerCities', peaks: 'explore.layerPeaks', parks: 'explore.layerParks' };

  return (
    <div className={'map-stage' + (compact ? ' map-stage--compact' : '')}>
      <div className="map-toolbar ui" role="toolbar" aria-label={t('explore.title')}>
        {effectiveView !== 'text' && tier !== 'still' && (
          <div className="seg" role="group" aria-label={t('explore.viewLabel')}>
            <button type="button" className={'seg__btn' + (view === '3d' ? ' is-on' : '')} aria-pressed={view === '3d'} onClick={() => setView('3d')}>{t('explore.view3d')}</button>
            <button type="button" className={'seg__btn' + (view === '2d' ? ' is-on' : '')} aria-pressed={view === '2d'} onClick={() => setView('2d')}>{t('explore.view2d')}</button>
          </div>
        )}
        <div className="map-search">
          <label className="visually-hidden" htmlFor={listId + '-q'}>{t('explore.search')}</label>
          <Icon name="search" />
          <input id={listId + '-q'} type="search" className="map-search__input" placeholder={t('explore.searchPlaceholder')} value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" aria-controls={listId + '-results'} aria-expanded={results.length > 0} role="combobox" />
          {query && (
            <ul id={listId + '-results'} className="map-search__results" role="listbox">
              {results.length === 0 && <li className="map-search__empty" aria-disabled="true">{t('explore.noResults')}</li>}
              {results.map((r) => (
                <li key={r.id} role="option" aria-selected={false}>
                  <button type="button" onClick={() => { r.go(); setQuery(''); }}>
                    <span>{r.label}</span> <small>{r.sub}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <details className="menu">
          <summary className="btn btn--ghost btn--sm"><Icon name="layers" /> {t('explore.layers')}</summary>
          <div className="menu__panel">
            {layerKeys.map((k) => (
              <label key={k} className="check">
                <input type="checkbox" checked={layers[k]} onChange={() => toggleLayer(k)} /> {t(layerLabel[k])}
              </label>
            ))}
          </div>
        </details>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => reset()} disabled={!selected && !activeLandmark}><Icon name="globe" /> {t('explore.reset')}</button>
        {effectiveView === '3d' && (
          <button type="button" className="btn btn--ghost btn--sm" aria-pressed={paused} onClick={() => setPaused(!paused)} title={paused ? t('explore.play') : t('explore.pause')}>
            <Icon name={paused ? 'play' : 'pause'} /> <span className="visually-hidden">{paused ? t('explore.play') : t('explore.pause')}</span>
          </button>
        )}
      </div>

      <div className="map-body">
        <div ref={stageRef} className={'map-canvas' + (effectiveView === '3d' ? ' map-canvas--3d' : '')} tabIndex={effectiveView === '3d' ? 0 : -1} role={effectiveView === '3d' ? 'application' : undefined} aria-label={effectiveView === '3d' ? t('explore.stage') + '. ' + t('explore.controls') : undefined}>
          {error && <p className="map-error">{error}</p>}
          {!data && !error && <p className="map-loading">{t('explore.loading')}</p>}
          {data && effectiveView === '3d' && (
            <Suspense fallback={<p className="map-loading">{t('explore.loading')}</p>}>
              <Map3D data={data} landmarks={landmarks} stageRef={stageRef} />
            </Suspense>
          )}
          {data && effectiveView === '2d' && <Map2D data={data} landmarks={landmarks} />}
          {effectiveView === 'text' && <p className="map-textnote">{t('explore.textTier')}</p>}
          {effectiveView === '3d' && <p className="map-hint ui">{t('explore.hoverHint')}</p>}
        </div>

        <aside className="map-panel paper" aria-live="polite">
          <p className="visually-hidden" aria-live="polite">{live}</p>
          {activeLm ? (
            <LandmarkCard lm={activeLm} onClose={() => setLandmark(null)} />
          ) : selectedGeo && !(focus && selectedGeo.id === focus) ? (
            <div className="map-panel__province">
              <p className="eyebrow" style={{ color: PROVINCE_COLORS[selectedGeo.id] }}>{t('nav.provinces')}</p>
              <h2 className="map-panel__title">{pickLang(selectedGeo.name, lang)}</h2>
              {selectedProvince && <p className="map-panel__text">{l(selectedProvince.overview)}</p>}
              <dl className="facts ui">
                {selectedProvince?.capital?.name && (<div><dt>{t('explore.capital')}</dt><dd>{selectedProvince.capital.name}</dd></div>)}
                <div><dt>{t('explore.area')}</dt><dd className="tnum">{Math.round(selectedProvince?.keyFacts?.areaKm2?.value ?? selectedGeo.areaKm2).toLocaleString(lang)} {t('explore.km2')}</dd></div>
                {selectedProvince?.keyFacts?.population?.value && (<div><dt>{t('explore.population')}</dt><dd className="tnum">{selectedProvince.keyFacts.population.value.toLocaleString(lang)} <small className="muted">({selectedProvince.keyFacts.population.year} {t('explore.census')})</small></dd></div>)}
                {selectedProvince?.keyFacts?.cantons?.value && (<div><dt>{t('explore.cantons')}</dt><dd className="tnum">{selectedProvince.keyFacts.cantons.value}</dd></div>)}
              </dl>
              {!focus && <Link className="btn btn--primary" to={'/provinces/' + selectedGeo.id}>{t('explore.openProvince', { name: pickLang(selectedGeo.name, lang) })} <Icon name="arrow" /></Link>}
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => reset()}>{t('explore.back')}</button>
            </div>
          ) : (
            <div className="map-panel__intro">
              <p className="map-panel__text">{t('explore.hoverHint')}</p>
              <p className="note">{t('explore.reliefNote')}</p>
              <p className="map-panel__text">{t('explore.cocoNote')}</p>
            </div>
          )}
          <ProvinceList data={data} listId={listId} />
        </aside>
      </div>
      <p className="map-footnote muted ui">{effectiveView === '3d' ? t('explore.controls') + ' ' : ''}{t('explore.dataNote')} {t('explore.reliefNote')}</p>
    </div>
  );
}

function LandmarkCard({ lm, onClose }: { lm: Landmark; onClose: () => void }) {
  const { t, l, lang } = useT();
  const name = typeof lm.name === 'string' ? lm.name : pickLang(lm.name, lang);
  return (
    <div className="map-panel__landmark">
      <p className="eyebrow">{t(('explore.kinds.' + lm.kind) as MessageKey)}{lm.elevationM ? ` · ${lm.elevationM.toLocaleString(lang)} m` : ''}</p>
      <h2 className="map-panel__title">{name}</h2>
      {lm.text && <p className="map-panel__text">{l(lm.text)}</p>}
      {lm.conservationArea && <p className="muted ui"><small>{t('provinces.conservationArea')}: {lm.conservationArea}</small></p>}
      {lm.province && <p className="ui"><Link to={'/provinces/' + lm.province}>{t('explore.openProvince', { name: lm.province.replace('-', ' ') })}</Link></p>}
      <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>{t('common.close')}</button>
    </div>
  );
}

function ProvinceList({ data, listId }: { data: ReturnType<typeof useMapData>['data']; listId: string }) {
  const { t, lang } = useT();
  const selected = useMap((s) => s.selected);
  const select = useMap((s) => s.select);
  const ref = useRef<HTMLUListElement>(null);
  const items = PROVINCE_ORDER.map((id) => ({ id, name: data ? pickLang(data.provinces.find((p) => p.id === id)!.name, lang) : id }));
  const onKey = (e: React.KeyboardEvent) => {
    const idx = items.findIndex((i) => i.id === (selected ?? items[0].id));
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = items[(idx + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length];
      select(next.id, true);
      (ref.current?.querySelector(`[data-id="${next.id}"]`) as HTMLElement | null)?.focus();
    }
  };
  return (
    <div className="province-list ui">
      <p className="eyebrow" id={listId + '-label'}>{t('explore.provinceList')}</p>
      <ul ref={ref} role="listbox" aria-labelledby={listId + '-label'} onKeyDown={onKey}>
        {items.map((it) => (
          <li key={it.id} role="option" aria-selected={selected === it.id} data-id={it.id} tabIndex={selected === it.id || (!selected && it.id === items[0].id) ? 0 : -1} onClick={() => select(it.id, true)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(it.id, true); } }}>
            <span className="swatch" style={{ background: PROVINCE_COLORS[it.id] }} aria-hidden="true" /> {it.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
