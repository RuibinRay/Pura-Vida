import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from '../../ui/Link';
import { useT, pickLang, type MessageKey } from '../../i18n';
import { useContent } from '../../content';
import { useMapData } from '../../map/useMapData';
import { MapStage } from '../../map/MapStage';
import { PROVINCE_COLORS, PROVINCE_ORDER } from '../../map/geo';
import { PROVINCE_IDS, useMap, type ProvinceId } from '../../state/map';
import { usePassport } from '../../state/passport';
import { ProvinceSilhouette } from '../../ui/ProvinceSilhouette';
import { SourceList, StatusTag, dedupeSources } from '../../ui/Sources';
import { Icon } from '../../ui/Icon';
import type { Source, TextBlock } from '../../content/types';
import { usePageTitle } from '../usePageTitle';
import { PlacePicture } from '../../ui/PlacePicture';
import { AnimalSvg } from '../../art/animals';
import { displayLonLat } from '../../map/explore';

export function ProvincePage() {
  const { id } = useParams();
  const { t, l, lang } = useT();
  const content = useContent();
  const { data } = useMapData();
  const stamp = usePassport((s) => s.stamp);
  const flyTo = useMap((s) => s.flyTo);
  const setLandmark = useMap((s) => s.setLandmark);
  const valid = PROVINCE_IDS.includes(id as ProvinceId);
  const pid = id as ProvinceId;
  const p = content?.provinces.find((q) => q.id === pid);
  const geo = data?.provinces.find((q) => q.id === pid);
  const name = p ? l(p.name) : geo ? l(geo.name) : id ?? '';
  usePageTitle(name);

  useEffect(() => {
    if (valid) stamp('province', pid);
  }, [valid, pid, stamp]);

  const allSources: Source[] = useMemo(() => {
    if (!p) return [];
    const blocks: (TextBlock | undefined)[] = [p.overview, p.wildlifeVegetation, p.culture, p.history, p.environment];
    const s: Source[] = [];
    for (const b of blocks) if (b?.sources) s.push(...b.sources);
    for (const lm of p.landmarks) if (lm.sources) s.push(...lm.sources);
    for (const f of p.foods ?? []) if (f.sources) s.push(...f.sources);
    for (const c of p.curiosities ?? []) if (c.sources) s.push(...c.sources);
    for (const pa of p.environment?.protectedAreas ?? []) if (pa.sources) s.push(...pa.sources);
    for (const k of Object.values(p.keyFacts)) if (k?.sources) s.push(...k.sources);
    if (p.capital?.sources) s.push(...p.capital.sources);
    return dedupeSources(s);
  }, [p]);

  if (!valid) {
    return (
      <article className="page container">
        <h1>{t('provinces.notFound')}</h1>
        <Link className="btn btn--primary" to="/provinces">{t('nav.provinces')}</Link>
      </article>
    );
  }
  const idx = PROVINCE_ORDER.indexOf(pid);
  const prev = PROVINCE_ORDER[(idx + 6) % 7];
  const next = PROVINCE_ORDER[(idx + 1) % 7];
  const nameOf = (q: ProvinceId) => { const c = content?.provinces.find((x) => x.id === q); return c ? l(c.name) : q; };
  const block = (b: TextBlock | undefined, titleKey: MessageKey, extra?: React.ReactNode) =>
    b && b.en ? (
      <section className="chapter-part" aria-labelledby={'h-' + titleKey}>
        <h2 id={'h-' + titleKey}>{t(titleKey)}</h2>
        <p className="prose">{l(b)}</p>
        {extra}
        <footer className="chapter-part__foot ui">{b.status && <StatusTag status={b.status} />}{b.sources && b.sources.length > 0 && <SourceList sources={b.sources} compact />}</footer>
      </section>
    ) : null;

  return (
    <article className="page page--province" style={{ ['--tab' as string]: PROVINCE_COLORS[pid] }}>
      <header className="container province-head">
        <div className="province-head__title">
          <ProvinceSilhouette data={data} id={pid} size={120} label={name} />
          <div>
            <p className="eyebrow">{t('provinces.chapter', { n: idx + 1 })} · {t('nav.provinces')}</p>
            <h1 className="province-head__name">{name}</h1>
            <p className="lede province-head__lede">{p ? l(p.overview) : ''}</p>
          </div>
        </div>
        <dl className="facts facts--row ui">
          {p && (<>
            <div><dt>{t('explore.capital')}</dt><dd>{p.capital.name}</dd></div>
            {p.keyFacts.areaKm2 && <div><dt>{t('explore.area')}</dt><dd className="tnum">{Math.round(p.keyFacts.areaKm2.value).toLocaleString(lang)} {t('explore.km2')} <StatusTag status={p.keyFacts.areaKm2.status} /></dd></div>}
            {p.keyFacts.population && <div><dt>{t('explore.population')}</dt><dd className="tnum">{p.keyFacts.population.value.toLocaleString(lang)} <small className="muted">({p.keyFacts.population.year})</small> <StatusTag status={p.keyFacts.population.status} /></dd></div>}
            {p.keyFacts.cantons && <div><dt>{t('explore.cantons')}</dt><dd className="tnum">{p.keyFacts.cantons.value} <StatusTag status={p.keyFacts.cantons.status} /></dd></div>}
          </>)}
        </dl>
      </header>

      <section className="container container--wide chapter-part" aria-label={t('provinces.map')}>
        <h2 className="visually-hidden">{t('provinces.map')}</h2>
        <MapStage focus={pid} compact />
      </section>

      <div className="container">
        {!p && <p className="muted">{t('common.loading')}</p>}
        {p && (
          <>
            <section className="chapter-part" aria-labelledby="h-landmarks">
              <h2 id="h-landmarks">{t('provinces.landmarks')}</h2>
              <ul className="landmarks">
                {p.landmarks.map((lm) => {
                  const lname = typeof lm.name === 'string' ? lm.name : pickLang(lm.name, lang);
                  return (
                    <li key={lm.id} className="landmark landmark--pic">
                      <button type="button" className="landmark__pic" onClick={() => { setLandmark(lm.id); const [lon, lat] = displayLonLat(lm); flyTo({ kind: 'point', lon, lat, distance: 80 }); document.getElementById('main')?.querySelector('.map-stage')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} aria-label={t('provinces.showOnMap') + ': ' + lname}>
                        <PlacePicture landmark={lm} size="thumb" />
                      </button>
                      <div className="landmark__body">
                      <div className="landmark__head">
                        <h3 className="landmark__name">{lname}</h3>
                        <span className="landmark__kind ui">{t(('explore.kinds.' + lm.kind) as MessageKey)}{lm.elevationM ? ` · ${lm.elevationM.toLocaleString(lang)} m` : ''}</span>
                      </div>
                      {lm.text && <p>{l(lm.text)}</p>}
                      <div className="landmark__foot ui">
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setLandmark(lm.id); const [lon, lat] = displayLonLat(lm); flyTo({ kind: 'point', lon, lat, distance: 80 }); document.getElementById('main')?.querySelector('.map-stage')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>
                          <Icon name="pin" /> {t('provinces.showOnMap')}
                        </button>
                        {lm.status && <StatusTag status={lm.status} />}
                        {lm.sources && lm.sources.length > 0 && <SourceList sources={lm.sources} compact />}
                      </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            {block(p.wildlifeVegetation, 'provinces.wildlife', p.wildlifeVegetation?.species && p.wildlifeVegetation.species.length > 0 && (
              <>
                <h3 className="h-small">{t('provinces.species')}</h3>
                <ul className="species-list species-list--avatars">
                  {p.wildlifeVegetation.species.map((s) => {
                    const known = content?.species.find((x) => x.scientific.toLowerCase() === s.scientific.toLowerCase());
                    return (
                      <li key={s.scientific} className={known ? 'has-avatar' : undefined}>
                        {known && <Link to={'/wildlife?focus=' + known.id} className="species-list__avatar" aria-label={l(s.common)}><AnimalSvg species={known.id} size={56} /></Link>}
                        <span><b>{l(s.common)}</b> <i className="muted">{s.scientific}</i>{s.note ? <span className="muted"> — {s.note}</span> : null}</span>
                      </li>
                    );
                  })}
                </ul>
              </>
            ))}
            {block(p.culture, 'provinces.culture')}
            {block(p.history, 'provinces.history')}
            {p.foods && p.foods.length > 0 && (
              <section className="chapter-part" aria-labelledby="h-foods">
                <h2 id="h-foods">{t('provinces.foods')}</h2>
                <ul className="foods">
                  {p.foods.map((f) => (
                    <li key={f.name} className="food">
                      <h3 className="food__name">{f.name}</h3>
                      <p>{l(f.text)}</p>
                      <div className="ui">{f.status && <StatusTag status={f.status} />}{f.sources && f.sources.length > 0 && <SourceList sources={f.sources} compact />}</div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {block(p.environment, 'provinces.environment', p.environment?.protectedAreas && p.environment.protectedAreas.length > 0 && (
              <>
                <h3 className="h-small">{t('provinces.protectedAreas')}</h3>
                <ul className="areas ui">
                  {p.environment.protectedAreas.map((a) => (
                    <li key={a.name}><b>{a.name}</b> <span className="muted">· {a.kind}{a.conservationArea ? ` · ${a.conservationArea}` : ''}</span>{a.coords && <button type="button" className="btn btn--ghost btn--xs" onClick={() => { flyTo({ kind: 'point', lon: a.coords![1], lat: a.coords![0], distance: 70 }); document.getElementById('main')?.querySelector('.map-stage')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}><Icon name="pin" /> {t('provinces.showOnMap')}</button>}</li>
                  ))}
                </ul>
              </>
            ))}
            {p.curiosities && p.curiosities.length > 0 && (
              <section className="chapter-part" aria-labelledby="h-cur">
                <h2 id="h-cur">{t('provinces.curiosities')}</h2>
                <ul className="curiosities">
                  {p.curiosities.map((c, i) => (
                    <li key={i}><p>{l(c.text)}</p><div className="ui">{c.status && <StatusTag status={c.status} />}{c.sources && c.sources.length > 0 && <SourceList sources={c.sources} compact />}</div></li>
                  ))}
                </ul>
              </section>
            )}
            <section className="chapter-part" aria-labelledby="h-src">
              <h2 id="h-src">{t('provinces.sources')}</h2>
              <SourceList sources={allSources} />
            </section>
          </>
        )}
        <nav className="chapter-nav ui" aria-label={t('nav.provinces')}>
          <Link to={'/provinces/' + prev} className="btn btn--ghost"><Icon name="back" /> {t('provinces.prevChapter')}: {nameOf(prev)}</Link>
          <Link to={'/provinces/' + next} className="btn btn--ghost">{t('provinces.nextChapter')}: {nameOf(next)} <Icon name="arrow" /></Link>
        </nav>
      </div>
    </article>
  );
}
