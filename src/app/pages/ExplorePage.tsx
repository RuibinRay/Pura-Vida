import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useT, type MessageKey } from '../../i18n';
import { MapStage } from '../../map/MapStage';
import { useMapData } from '../../map/useMapData';
import { useContent } from '../../content';
import { useMap } from '../../state/map';
import { FILTERS, displayLonLat, groupOf, landmarkName, matchesFilter, type KindFilter } from '../../map/explore';
import { PlacePicture } from '../../ui/PlacePicture';
import { Icon } from '../../ui/Icon';
import { usePageTitle } from '../usePageTitle';
import type { Landmark } from '../../content/types';
import { HABITATS } from '../../content/habitats';
import { FOOD_PLACES } from '../../content/foodPlaces';

const FILTER_KEY: Record<KindFilter, MessageKey> = { all: 'explore.filterAll', volcanoes: 'explore.filterVolcanoes', parks: 'explore.filterParks', water: 'explore.filterWater', culture: 'explore.filterCulture' };

export function ExplorePage() {
  const { t, lang } = useT();
  usePageTitle(t('explore.title'));
  const content = useContent();
  const { data } = useMapData();
  const [params, setParams] = useSearchParams();
  const place = params.get('place');
  const animal = params.get('animal');
  const dish = params.get('dish');
  const select = useMap((s) => s.select);
  const setLandmark = useMap((s) => s.setLandmark);
  const flyTo = useMap((s) => s.flyTo);
  const setAnimal = useMap((s) => s.setAnimal);
  const setFood = useMap((s) => s.setFood);
  const setShowWildlife = useMap((s) => s.setShowWildlife);
  const setShowFood = useMap((s) => s.setShowFood);

  // ?place=<landmark id> opens that place's card and flies to it (links from the journal pages and the gallery)
  useEffect(() => {
    if (!place || !content || !data) return;
    const lm = content.landmarks.find((x) => x.id === place);
    if (!lm) return;
    if (lm.province) select(lm.province, false);
    setLandmark(lm.id);
    const [lon, lat] = displayLonLat(lm);
    flyTo({ kind: 'point', lon, lat, distance: 110 });
    setParams((p) => { p.delete('place'); return p; }, { replace: true });
  }, [place, content, data, select, setLandmark, flyTo, setParams]);

  // ?animal=<species id> / ?dish=<dish id> open that card on its layer and fly to its first place
  useEffect(() => {
    if ((!animal && !dish) || !content || !data) return;
    const first = animal ? HABITATS[animal]?.[0]?.at : FOOD_PLACES[dish!]?.[0]?.at;
    const lm = content.landmarks.find((x) => x.id === first);
    if (animal) { setShowWildlife(true); setAnimal(animal); } else { setShowFood(true); setFood(dish); }
    if (lm) { if (lm.province) select(lm.province, false); const [lon, lat] = displayLonLat(lm); flyTo({ kind: 'point', lon, lat, distance: 140 }); }
    setParams((p) => { p.delete('animal'); p.delete('dish'); return p; }, { replace: true });
  }, [animal, dish, content, data, select, setAnimal, setFood, setShowWildlife, setShowFood, flyTo, setParams]);

  return (
    <article className="page page--explore">
      <header className="container page__head page__head--nature">
        <p className="eyebrow">{t('nav.explore')}</p>
        <h1>{t('explore.title')}</h1>
        <p className="lede">{t('explore.lede')}</p>
      </header>
      <div className="container container--wide">
        <MapStage />
      </div>
      {content && <PlaceGallery landmarks={content.landmarks} lang={lang} provinceName={(id) => { const p = content.provinces.find((x) => x.id === id); return p ? p.name[lang] || p.name.en : id; }} />}
    </article>
  );
}

/** Every place of the map as an illustrated postcard; a click opens it on the map above. */
function PlaceGallery({ landmarks, lang, provinceName }: { landmarks: Landmark[]; lang: 'en' | 'es' | 'zh'; provinceName: (id: string) => string }) {
  const { t } = useT();
  const [filter, setFilter] = useState<KindFilter>('all');
  const [q, setQ] = useState('');
  const select = useMap((s) => s.select);
  const setLandmark = useMap((s) => s.setLandmark);
  const flyTo = useMap((s) => s.flyTo);
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const items = useMemo(() => {
    const query = norm(q.trim());
    return landmarks.filter((lm) => matchesFilter(lm, filter) && (!query || norm(landmarkName(lm, lang) + ' ' + (typeof lm.name === 'string' ? '' : lm.name.en) + ' ' + (lm.province ?? '')).includes(query)));
  }, [landmarks, filter, q, lang]);
  const open = (lm: Landmark) => {
    if (lm.province) select(lm.province, false);
    setLandmark(lm.id);
    const [lon, lat] = displayLonLat(lm);
    flyTo({ kind: 'point', lon, lat, distance: 110 });
    document.querySelector('.map-stage')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <section className="container container--wide gallery" aria-labelledby="gallery-title">
      <header className="gallery__head">
        <div>
          <p className="eyebrow">{t('explore.galleryKicker')}</p>
          <h2 id="gallery-title">{t('explore.galleryTitle', { n: landmarks.length })}</h2>
          <p className="lede">{t('explore.galleryLede')}</p>
        </div>
        <div className="gallery__tools ui">
          <div className="map-search">
            <label className="visually-hidden" htmlFor="gallery-q">{t('explore.search')}</label>
            <Icon name="search" />
            <input id="gallery-q" type="search" className="map-search__input" placeholder={t('explore.galleryFilter')} value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
          </div>
          <div className="map-chips" role="group" aria-label={t('explore.filters')}>
            {FILTERS.map((f) => (
              <button key={f} type="button" className={'chip chip--filter chip--' + f + (filter === f ? ' is-on' : '')} aria-pressed={filter === f} onClick={() => setFilter(f)}>{t(FILTER_KEY[f])}</button>
            ))}
          </div>
        </div>
      </header>
      {items.length === 0 && <p className="muted">{t('explore.noResults')}</p>}
      <ul className="gallery__grid">
        {items.map((lm) => (
          <li key={lm.id} className={'postcard postcard--' + groupOf(lm.kind)}>
            <button type="button" className="postcard__btn" onClick={() => open(lm)}>
              <PlacePicture landmark={lm} size="card" title={landmarkName(lm, lang)} />
              <span className="postcard__body">
                <span className="postcard__kind ui">{t(('explore.kinds.' + lm.kind) as MessageKey)}{lm.elevationM ? ` · ${lm.elevationM.toLocaleString(lang)} m` : ''}</span>
                <span className="postcard__name">{landmarkName(lm, lang)}</span>
                {lm.province && <span className="postcard__prov ui">{provinceName(lm.province)}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
