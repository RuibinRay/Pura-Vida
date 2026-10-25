// The map widget used by /explore and by each province chapter: toolbar (view, search, kind filters, the wildlife
// and food layers, display options, the guided tour), stage (3D, 2D or text), the contextual panel with its picture
// cards (place, animal, dish, province) and the keyboard twin list.
import { lazy, Suspense, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from '../ui/Link';
import { useMapData } from './useMapData';
import { Map2D } from './Map2D';
import { PROVINCE_COLORS, PROVINCE_ORDER } from './geo';
import { useMap, type ProvinceId, type Layers } from '../state/map';
import { usePassport } from '../state/passport';
import { useTier } from '../perf/tier';
import { useSettings } from '../state/settings';
import { useT, pickLang, type MessageKey } from '../i18n';
import { useContent } from '../content';
import type { Landmark, ProvinceContent, Species, Food } from '../content/types';
import { HABITATS, speciesAt } from '../content/habitats';
import { FOOD_PLACES, dishesAt } from '../content/foodPlaces';
import { FILTERS, TOUR_STOPS, displayLonLat, landmarkName, type KindFilter } from './explore';
import { Icon } from '../ui/Icon';
import { PlacePicture } from '../ui/PlacePicture';
import { AnimalSvg } from '../art/animals';
import { DishCard } from '../art/food/DishCard';
import { StatusTag } from '../ui/Sources';

const Map3D = lazy(() => import('./Map3D').then((m) => ({ default: m.Map3D })));

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const FILTER_KEY: Record<KindFilter, MessageKey> = { all: 'explore.filterAll', volcanoes: 'explore.filterVolcanoes', parks: 'explore.filterParks', water: 'explore.filterWater', culture: 'explore.filterCulture' };
const FILTER_ICON: Record<KindFilter, string> = { all: 'globe', volcanoes: 'volcano', parks: 'leaf', water: 'wave', culture: 'town' };

/** camera distance for a landmark card: the small places get a closer look */
function distanceFor(l: Landmark) {
  return l.kind === 'volcano' || l.kind === 'mountain' || l.kind === 'park' || l.kind === 'island' ? 120 : 80;
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
  const filter = useMap((s) => s.filter);
  const setFilter = useMap((s) => s.setFilter);
  const showWildlife = useMap((s) => s.showWildlife);
  const setShowWildlife = useMap((s) => s.setShowWildlife);
  const showFood = useMap((s) => s.showFood);
  const setShowFood = useMap((s) => s.setShowFood);
  const flyTo = useMap((s) => s.flyTo);
  const activeLandmark = useMap((s) => s.activeLandmark);
  const setLandmark = useMap((s) => s.setLandmark);
  const activeAnimal = useMap((s) => s.activeAnimal);
  const setAnimal = useMap((s) => s.setAnimal);
  const activeFood = useMap((s) => s.activeFood);
  const setFood = useMap((s) => s.setFood);
  const tour = useMap((s) => s.tour);
  const setTour = useMap((s) => s.setTour);
  const content = useContent();
  const stageRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState('');
  const listId = useId();

  const landmarks: Landmark[] = useMemo(() => content?.landmarks ?? [], [content]);
  const provinces: ProvinceContent[] = content?.provinces ?? [];
  const byId = useMemo(() => new Map(landmarks.map((x) => [x.id, x])), [landmarks]);

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

  /** open a place: its card, its province (without flying), and the camera on it */
  const goToPlace = (lm: Landmark, fly = true) => {
    if (lm.province) select(lm.province, false);
    setLandmark(lm.id);
    if (fly) { const [lon, lat] = displayLonLat(lm); flyTo({ kind: 'point', lon, lat, distance: distanceFor(lm) }); }
  };

  // the guided tour: each step opens one place; auto-play advances every few seconds
  const tourStops = useMemo(() => TOUR_STOPS.map((id) => byId.get(id)).filter((x): x is Landmark => !!x), [byId]);
  useEffect(() => {
    if (!tour.active || !tourStops.length) return;
    const lm = tourStops[Math.min(tour.step, tourStops.length - 1)];
    goToPlace(lm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour.active, tour.step, tourStops]);
  useEffect(() => {
    if (!tour.active || !tour.auto) return;
    const id = setTimeout(() => setTour({ step: (tour.step + 1) % tourStops.length }), 7000);
    return () => clearTimeout(id);
  }, [tour, tourStops.length, setTour]);
  const startTour = () => { setShowWildlife(true); setTour({ active: true, step: 0, auto: false }); };
  const surprise = () => {
    if (!landmarks.length) return;
    const lm = landmarks[Math.floor(Math.random() * landmarks.length)];
    setTour({ active: false });
    goToPlace(lm);
  };

  // search: provinces, places, animals and dishes
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    if (!data || !query.trim()) return [];
    const q = normalize(query.trim());
    const out: { id: string; label: string; sub: string; go: () => void }[] = [];
    for (const p of data.provinces) {
      const name = pickLang(p.name, lang);
      if (normalize(name).includes(q) || normalize(p.name.en).includes(q) || normalize(p.name.es || '').includes(q)) out.push({ id: 'p:' + p.id, label: name, sub: t('nav.provinces'), go: () => select(p.id, true) });
    }
    for (const sp of content?.species ?? []) {
      const name = l(sp.commonNames);
      if (normalize(name + ' ' + sp.commonNames.en + ' ' + sp.scientific).includes(q)) out.push({ id: 's:' + sp.id, label: name, sub: t('nav.wildlife'), go: () => { setShowWildlife(true); setAnimal(sp.id); const first = byId.get(HABITATS[sp.id]?.[0]?.at ?? ''); if (first) flyTo({ kind: 'point', lon: first.lon, lat: first.lat, distance: 140 }); } });
    }
    for (const f of content?.foods ?? []) {
      const name = l(f.name);
      if (normalize(name + ' ' + f.name.en).includes(q)) out.push({ id: 'f:' + f.id, label: name, sub: t('nav.food'), go: () => { setShowFood(true); setFood(f.id); const first = byId.get(FOOD_PLACES[f.id]?.[0]?.at ?? ''); if (first) flyTo({ kind: 'point', lon: first.lon, lat: first.lat, distance: 140 }); } });
    }
    for (const lm of landmarks) {
      const name = landmarkName(lm, lang);
      const alt = typeof lm.name === 'string' ? '' : lm.name.en + ' ' + (lm.name.es || '');
      if (normalize(name).includes(q) || normalize(alt).includes(q)) out.push({ id: 'l:' + lm.id, label: name, sub: t(('explore.kinds.' + lm.kind) as MessageKey), go: () => goToPlace(lm) });
    }
    return out.slice(0, 9);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, query, lang, landmarks, content, select, setAnimal, setFood, flyTo, t, l]);

  const selectedProvince = provinces.find((p) => p.id === selected);
  const selectedGeo = data?.provinces.find((p) => p.id === selected);
  const activeLm = activeLandmark ? byId.get(activeLandmark) : undefined;
  const activeSp = activeAnimal ? content?.species.find((s) => s.id === activeAnimal) : undefined;
  const activeDish = activeFood ? content?.foods.find((f) => f.id === activeFood) : undefined;

  const displayKeys: (keyof Layers)[] = ['relief', 'borders', 'labels'];
  const layerLabel: Record<keyof Layers, MessageKey> = { relief: 'explore.layerRelief', borders: 'explore.layerBorders', labels: 'explore.layerLabels', cities: 'explore.layerCities', peaks: 'explore.layerPeaks', parks: 'explore.layerParks' };
  const tourIndex = tour.active ? Math.min(tour.step, tourStops.length - 1) : -1;

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
          <summary className="btn btn--ghost btn--sm"><Icon name="layers" /> {t('explore.display')}</summary>
          <div className="menu__panel">
            {displayKeys.map((k) => (
              <label key={k} className="check">
                <input type="checkbox" checked={layers[k]} onChange={() => toggleLayer(k)} /> {t(layerLabel[k])}
              </label>
            ))}
          </div>
        </details>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => reset()} disabled={!selected && !activeLandmark && !activeAnimal && !activeFood && !tour.active}><Icon name="globe" /> {t('explore.reset')}</button>
        {effectiveView === '3d' && (
          <button type="button" className="btn btn--ghost btn--sm" aria-pressed={paused} onClick={() => setPaused(!paused)} title={paused ? t('explore.play') : t('explore.pause')}>
            <Icon name={paused ? 'play' : 'pause'} /> <span className="visually-hidden">{paused ? t('explore.play') : t('explore.pause')}</span>
          </button>
        )}
      </div>

      <div className="map-chips ui" role="group" aria-label={t('explore.filters')}>
        {FILTERS.map((f) => (
          <button key={f} type="button" className={'chip chip--filter chip--' + f + (filter === f ? ' is-on' : '')} aria-pressed={filter === f} onClick={() => setFilter(f)}>
            <Icon name={FILTER_ICON[f]} /> {t(FILTER_KEY[f])}
          </button>
        ))}
        <span className="map-chips__sep" aria-hidden="true" />
        <button type="button" className={'chip chip--layer chip--wildlife' + (showWildlife ? ' is-on' : '')} aria-pressed={showWildlife} onClick={() => setShowWildlife(!showWildlife)}>
          <Icon name="paw" /> {t('explore.layerWildlife')}
        </button>
        <button type="button" className={'chip chip--layer chip--food' + (showFood ? ' is-on' : '')} aria-pressed={showFood} onClick={() => setShowFood(!showFood)}>
          <Icon name="bowl" /> {t('explore.layerFood')}
        </button>
        <span className="map-chips__sep" aria-hidden="true" />
        <button type="button" className={'chip chip--tour' + (tour.active ? ' is-on' : '')} aria-pressed={tour.active} onClick={() => (tour.active ? setTour({ active: false, auto: false }) : startTour())}>
          <Icon name="route" /> {tour.active ? t('explore.tourStop') : t('explore.tour')}
        </button>
        <button type="button" className="chip" onClick={surprise}><Icon name="spark" /> {t('explore.surprise')}</button>
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
          {effectiveView === '3d' && !tour.active && <p className="map-hint ui">{t('explore.hoverHint')}</p>}
          {tour.active && tourStops.length > 0 && (
            <div className="tour-bar on-dark ui" role="group" aria-label={t('explore.tour')}>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setTour({ step: (tourIndex + tourStops.length - 1) % tourStops.length, auto: false })} aria-label={t('explore.tourPrev')}><Icon name="back" /></button>
              <span className="tour-bar__label"><b className="tnum">{tourIndex + 1}/{tourStops.length}</b> {landmarkName(tourStops[tourIndex], lang)}</span>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setTour({ step: (tourIndex + 1) % tourStops.length, auto: false })} aria-label={t('explore.tourNext')}><Icon name="arrow" /></button>
              <button type="button" className={'btn btn--ghost btn--sm' + (tour.auto ? ' is-on' : '')} aria-pressed={tour.auto} onClick={() => setTour({ auto: !tour.auto })} aria-label={tour.auto ? t('explore.tourPauseAuto') : t('explore.tourAuto')} title={tour.auto ? t('explore.tourPauseAuto') : t('explore.tourAuto')}><Icon name={tour.auto ? 'pause' : 'play'} /></button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setTour({ active: false, auto: false })} aria-label={t('explore.tourStop')}><Icon name="close" /></button>
            </div>
          )}
        </div>

        <aside className="map-panel paper" aria-live="polite">
          <p className="visually-hidden" aria-live="polite">{live}</p>
          {activeSp ? (
            <AnimalCard sp={activeSp} byId={byId} onClose={() => setAnimal(null)} onPlace={(lm) => { const [lon, lat] = displayLonLat(lm); flyTo({ kind: 'point', lon, lat, distance: 120 }); }} />
          ) : activeDish ? (
            <FoodCard food={activeDish} byId={byId} onClose={() => setFood(null)} onPlace={(lm) => { const [lon, lat] = displayLonLat(lm); flyTo({ kind: 'point', lon, lat, distance: 120 }); }} />
          ) : activeLm ? (
            <LandmarkCard lm={activeLm} species={content?.species ?? []} foods={content?.foods ?? []} provinces={provinces} tourIndex={tourIndex} tourTotal={tourStops.length} onClose={() => { setLandmark(null); if (tour.active) setTour({ active: false, auto: false }); }} onAnimal={(id) => { setShowWildlife(true); setAnimal(id); }} onFood={(id) => { setShowFood(true); setFood(id); }} />
          ) : selectedGeo && !(focus && selectedGeo.id === focus) ? (
            <div className="map-panel__province map-card">
              <p className="eyebrow" style={{ color: PROVINCE_COLORS[selectedGeo.id] }}>{t('nav.provinces')}</p>
              <h2 className="map-panel__title">{pickLang(selectedGeo.name, lang)}</h2>
              {selectedProvince && <p className="map-panel__text">{l(selectedProvince.overview)}</p>}
              <dl className="facts ui">
                {selectedProvince?.capital?.name && (<div><dt>{t('explore.capital')}</dt><dd>{selectedProvince.capital.name}</dd></div>)}
                <div><dt>{t('explore.area')}</dt><dd className="tnum">{Math.round(selectedProvince?.keyFacts?.areaKm2?.value ?? selectedGeo.areaKm2).toLocaleString(lang)} {t('explore.km2')}</dd></div>
                {selectedProvince?.keyFacts?.population?.value && (<div><dt>{t('explore.population')}</dt><dd className="tnum">{selectedProvince.keyFacts.population.value.toLocaleString(lang)} <small className="muted">({selectedProvince.keyFacts.population.year} {t('explore.census')})</small></dd></div>)}
                {selectedProvince?.keyFacts?.cantons?.value && (<div><dt>{t('explore.cantons')}</dt><dd className="tnum">{selectedProvince.keyFacts.cantons.value}</dd></div>)}
              </dl>
              <PostcardStrip title={t('explore.postcardsFrom', { name: pickLang(selectedGeo.name, lang) })} items={landmarks.filter((x) => x.province === selectedGeo.id)} onPick={(lm) => goToPlace(lm)} />
              {!focus && <Link className="btn btn--primary" to={'/provinces/' + selectedGeo.id}>{t('explore.openProvince', { name: pickLang(selectedGeo.name, lang) })} <Icon name="arrow" /></Link>}
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => reset()}>{t('explore.back')}</button>
            </div>
          ) : (
            <div className="map-panel__intro map-card">
              <p className="map-panel__text">{t('explore.hoverHint')}</p>
              <PostcardStrip title={t('explore.highlights')} items={tourStops.slice(0, 8)} onPick={(lm) => goToPlace(lm)} />
              <div className="map-card__actions">
                <button type="button" className="btn btn--primary btn--sm" onClick={startTour}><Icon name="route" /> {t('explore.tour')}</button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={surprise}><Icon name="spark" /> {t('explore.surprise')}</button>
              </div>
              <p className="note">{t('explore.reliefNote')}</p>
            </div>
          )}
          <ProvinceList data={data} listId={listId} />
        </aside>
      </div>
      <p className="map-footnote muted ui">{effectiveView === '3d' ? t('explore.controls') + ' ' : ''}{t('explore.dataNote')} {t('explore.cocoNote')} {t('explore.picturesNote')}</p>
    </div>
  );
}

function PostcardStrip({ title, items, onPick }: { title: string; items: Landmark[]; onPick: (lm: Landmark) => void }) {
  const { lang } = useT();
  if (!items.length) return null;
  return (
    <div className="postcards ui">
      <p className="eyebrow">{title}</p>
      <ul className="postcards__strip">
        {items.map((lm) => (
          <li key={lm.id}>
            <button type="button" className="postcard postcard--mini" onClick={() => onPick(lm)}>
              <PlacePicture landmark={lm} size="thumb" />
              <span className="postcard__name">{landmarkName(lm, lang)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LandmarkCard({ lm, species, foods, provinces, tourIndex, tourTotal, onClose, onAnimal, onFood }: { lm: Landmark; species: Species[]; foods: Food[]; provinces: ProvinceContent[]; tourIndex: number; tourTotal: number; onClose: () => void; onAnimal: (id: string) => void; onFood: (id: string) => void }) {
  const { t, l, lang } = useT();
  const stamp = usePassport((s) => s.stamp);
  const name = landmarkName(lm, lang);
  const animals = speciesAt(lm.id).map((id) => species.find((s) => s.id === id)).filter((s): s is Species => !!s);
  const dishes = dishesAt(lm.id).map((id) => foods.find((f) => f.id === id)).filter((f): f is Food => !!f);
  useEffect(() => { stamp('place', lm.id); }, [lm.id, stamp]);
  const provinceName = lm.province ? l(provinces.find((p) => p.id === lm.province)?.name ?? lm.province) : '';
  return (
    <div className="map-panel__landmark map-card map-card--place">
      <PlacePicture landmark={lm} size="card" title={name} />
      <p className="eyebrow">{t(('explore.kinds.' + lm.kind) as MessageKey)}{lm.elevationM ? ` · ${lm.elevationM.toLocaleString(lang)} m` : ''}{tourIndex >= 0 ? ` · ${t('explore.tourStep', { n: tourIndex + 1, total: tourTotal })}` : ''}</p>
      <h2 className="map-panel__title">{name}</h2>
      {lm.text && <p className="map-panel__text">{l(lm.text)}</p>}
      {lm.conservationArea && <p className="muted ui"><small>{t('provinces.conservationArea')}: {lm.conservationArea}</small></p>}
      {animals.length > 0 && (
        <div className="map-card__row">
          <p className="eyebrow">{t('explore.animalsHere')}</p>
          <ul className="avatar-row">
            {animals.map((sp) => (
              <li key={sp.id}>
                <button type="button" className="avatar" onClick={() => onAnimal(sp.id)} title={l(sp.commonNames)}>
                  <AnimalSvg species={sp.id} size={46} />
                  <span>{l(sp.commonNames)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {dishes.length > 0 && (
        <div className="map-card__row">
          <p className="eyebrow">{t('explore.dishesHere')}</p>
          <ul className="avatar-row">
            {dishes.map((f) => (
              <li key={f.id}>
                <button type="button" className="avatar avatar--dish" onClick={() => onFood(f.id)} title={l(f.name)}>
                  <DishCard id={f.id} size={54} backdrop="none" />
                  <span>{l(f.name)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="map-card__actions">
        {lm.province && <Link className="btn btn--primary btn--sm" to={'/provinces/' + lm.province}>{t('explore.openProvince', { name: provinceName })} <Icon name="arrow" /></Link>}
        <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>{t('common.close')}</button>
      </div>
      {lm.coordsStatus === 'approximate' && <p className="ui"><StatusTag status="approximate" /></p>}
    </div>
  );
}

function AnimalCard({ sp, byId, onClose, onPlace }: { sp: Species; byId: Map<string, Landmark>; onClose: () => void; onPlace: (lm: Landmark) => void }) {
  const { t, l, lang } = useT();
  const stamp = usePassport((s) => s.stamp);
  useEffect(() => { stamp('species', sp.id); }, [sp.id, stamp]);
  const places = (HABITATS[sp.id] ?? []).map((h) => ({ h, lm: byId.get(h.at) })).filter((x): x is { h: (typeof HABITATS)[string][number]; lm: Landmark } => !!x.lm);
  return (
    <div className="map-panel__animal map-card map-card--animal">
      <div className="animal-hero"><AnimalSvg species={sp.id} size={150} title={l(sp.commonNames)} /></div>
      <p className="eyebrow">{t('nav.wildlife')} · <i>{sp.scientific}</i></p>
      <h2 className="map-panel__title">{l(sp.commonNames)}</h2>
      {sp.habitat && <p className="map-panel__text">{l(sp.habitat)}</p>}
      <p className="eyebrow">{t('explore.whereToSee')}</p>
      <ul className="where-list ui">
        {places.map(({ h, lm }) => (
          <li key={lm.id}>
            <button type="button" onClick={() => onPlace(lm)}><Icon name="pin" /> <span><b>{landmarkName(lm, lang)}</b><small>{pickLang(h.note, lang)}</small></span></button>
          </li>
        ))}
      </ul>
      <p className="muted ui"><small>{t('explore.habitatNote')}</small></p>
      <div className="map-card__actions">
        <Link className="btn btn--primary btn--sm" to={'/wildlife?focus=' + sp.id}>{t('journey.habitat.open')} <Icon name="arrow" /></Link>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>{t('common.close')}</button>
      </div>
    </div>
  );
}

function FoodCard({ food, byId, onClose, onPlace }: { food: Food; byId: Map<string, Landmark>; onClose: () => void; onPlace: (lm: Landmark) => void }) {
  const { t, l, lang } = useT();
  const stamp = usePassport((s) => s.stamp);
  useEffect(() => { stamp('food', food.id); }, [food.id, stamp]);
  const places = (FOOD_PLACES[food.id] ?? []).map((h) => ({ h, lm: byId.get(h.at) })).filter((x): x is { h: (typeof FOOD_PLACES)[string][number]; lm: Landmark } => !!x.lm);
  return (
    <div className="map-panel__food map-card map-card--food">
      <div className="dish-hero"><DishCard id={food.id} size="100%" title={l(food.name)} backdrop="leaf" /></div>
      <p className="eyebrow">{t('nav.food')}{food.kind ? ` · ${l(food.kind)}` : ''}</p>
      <h2 className="map-panel__title">{l(food.name)}</h2>
      {food.description && <p className="map-panel__text">{l(food.description)}</p>}
      <p className="eyebrow">{t('explore.whereEaten')}</p>
      <ul className="where-list ui">
        {places.map(({ h, lm }) => (
          <li key={lm.id}>
            <button type="button" onClick={() => onPlace(lm)}><Icon name="pin" /> <span><b>{landmarkName(lm, lang)}</b><small>{pickLang(h.note, lang)}</small></span></button>
          </li>
        ))}
      </ul>
      <p className="muted ui"><small>{t('explore.foodNote')}</small></p>
      <div className="map-card__actions">
        <Link className="btn btn--primary btn--sm" to={'/food?focus=' + food.id}>{t('journey.ch5.openJournal')} <Icon name="arrow" /></Link>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>{t('common.close')}</button>
      </div>
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

