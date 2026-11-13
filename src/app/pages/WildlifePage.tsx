// The wildlife page: the trail (a scroll walk through seven habitats with the owner's animal cut-outs — a tap
// opens the sourced entry) and, below it, the journal of every species.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from '../../ui/Link';
import { useT, pickLang, type MessageKey } from '../../i18n';
import { useContent } from '../../content';
import { usePageTitle } from '../usePageTitle';
import { SpeciesEntry } from '../../ui/SpeciesEntry';
import { Sheet } from '../../ui/Sheet';
import { AnimalSvg } from '../../art/animals';
import { HABITATS } from '../../content/habitats';
import { landmarkName } from '../../map/explore';
import { Icon } from '../../ui/Icon';
import { useTier } from '../../perf/tier';
import { usePassport } from '../../state/passport';
import type { Species } from '../../content/types';
import { Trail } from '../../journey/Trail';
import { STICKERS, ZONES, stickerSrc, stickerSrcSet } from '../../journey/trailZones';
import { STOPS } from '../../journey/scenes';

import { ANIMAL_CLASSES, classOf, provincesOf, type AnimalClass } from '../../content/taxa';
import { useMapData } from '../../map/useMapData';
import { PROVINCE_ORDER } from '../../map/geo';
import type { ProvinceId } from '../../state/map';

const ZONE_OF = new Map(ZONES.flatMap((z) => z.animals.map((a) => [a.id, z.key] as const)));

/** The stop of the homepage walk where the species is drawn at home (the first one whose habitat verdict is yes). */
function walkStop(sp: Species): string | undefined {
  const fits = sp.stops || {};
  for (const stop of STOPS) {
    const key = stop.key === 'discover' ? 'opening' : stop.key;
    if (fits[key]?.fit) return stop.key;
  }
  return undefined;
}

export function WildlifePage() {
  const { t, l, lang } = useT();
  usePageTitle(t('wildlife.title'));
  const content = useContent();
  const tier = useTier((s) => s.tier);
  const [params, setParams] = useSearchParams();
  const focus = params.get('focus');
  const { data: mapData } = useMapData();
  const byId = useMemo(() => new Map((content?.landmarks ?? []).map((x) => [x.id, x])), [content]);
  const stamp = usePassport((s) => s.stamp);

  // the trail's popup
  const [open, setOpen] = useState<{ sp: Species; zone: string } | null>(null);
  const openSpecies = useCallback((sp: Species, zone: string) => { setOpen({ sp, zone }); stamp('species', sp.id); }, [stamp]);
  const close = useCallback(() => setOpen(null), []);

  // ?focus=<species id> scrolls to that journal entry once the content is in
  useEffect(() => {
    if (!content || !focus) return;
    const el = document.getElementById(focus);
    if (el) { el.scrollIntoView({ block: 'start' }); el.querySelector<HTMLElement>('h2')?.focus?.(); }
  }, [content, focus]);

  const places = (sp: Species) => (HABITATS[sp.id] ?? []).map((h) => ({ h, lm: byId.get(h.at) })).filter((x) => !!x.lm);

  // the journal's filters: kind of animal, habitat (the trail's zones), province. They live in the address, so a
  // filtered journal can be linked (/wildlife?kind=bird&province=limon)
  const fKind = (ANIMAL_CLASSES as string[]).includes(params.get('kind') || '') ? (params.get('kind') as AnimalClass) : null;
  const fZone = ZONES.some((z) => z.key === params.get('habitat')) ? params.get('habitat') : null;
  const fProv = (PROVINCE_ORDER as string[]).includes(params.get('province') || '') ? (params.get('province') as ProvinceId) : null;
  const setFilter = (key: 'kind' | 'habitat' | 'province', value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('focus');
    setParams(next, { replace: true, preventScrollReset: true });
  };
  const facets = useMemo(() => (content?.species ?? []).map((sp) => ({ sp, kind: classOf(sp), zone: ZONE_OF.get(sp.id) ?? null, provinces: provincesOf(sp.id, byId) })), [content, byId]);
  const shown = facets.filter((f) => (!fKind || f.kind === fKind) && (!fZone || f.zone === fZone) && (!fProv || f.provinces.includes(fProv)));
  // a facet's count is what choosing it would show, given the other two filters
  const countKind = (k: AnimalClass) => facets.filter((f) => f.kind === k && (!fZone || f.zone === fZone) && (!fProv || f.provinces.includes(fProv))).length;
  const countZone = (z: string) => facets.filter((f) => f.zone === z && (!fKind || f.kind === fKind) && (!fProv || f.provinces.includes(fProv))).length;
  const countProv = (p: ProvinceId) => facets.filter((f) => f.provinces.includes(p) && (!fKind || f.kind === fKind) && (!fZone || f.zone === fZone)).length;
  const provinceName = (id: ProvinceId) => { const g = mapData?.provinces.find((q) => q.id === id); return g ? g.name[lang] || g.name.en : id; };
  const filtered = !!(fKind || fZone || fProv);
  const clearFilters = () => { const next = new URLSearchParams(params); next.delete('kind'); next.delete('habitat'); next.delete('province'); setParams(next, { replace: true, preventScrollReset: true }); };
  const trail = tier !== 'text' && !!content;

  return (
    <article className={'page page--wildlife' + (trail ? ' page--trail' : ' container')}>
      {trail ? (
        <>
          <header className="trail-head container">
            <p className="eyebrow">{t('nav.wildlife')}</p>
            <h1>{t('trail.title')}</h1>
            <p className="lede">{t('trail.lede')}</p>
          </header>
          <Trail species={content!.species} onOpen={openSpecies} />
        </>
      ) : (
        <header className="page__head page__head--nature">
          <p className="eyebrow">{t('nav.wildlife')}</p>
          <h1>{t('wildlife.title')}</h1>
          <p className="lede">{t('wildlife.lede')}</p>
        </header>
      )}
      <div className={'trail-after' + (trail ? ' container' : '')}>
        <header className="trail-after__head">
          <h2 id="journal">{t('trail.journalTitle')}</h2>
          <p className="lede">{t('trail.journalLede')}</p>
          {content && (
            <div className="facets ui" role="group" aria-label={t('wildlife.filters')}>
              <div className="facets__row">
                <span className="facets__label">{t('wildlife.byKind')}</span>
                {ANIMAL_CLASSES.map((k) => (
                  <button key={k} type="button" className={'chip chip--facet' + (fKind === k ? ' is-on' : '')} aria-pressed={fKind === k} disabled={countKind(k) === 0 && fKind !== k} onClick={() => setFilter('kind', fKind === k ? null : k)}>{t(('wildlife.kinds.' + k) as MessageKey)} <b className="tnum">{countKind(k)}</b></button>
                ))}
              </div>
              <div className="facets__row">
                <span className="facets__label">{t('wildlife.byHabitat')}</span>
                {ZONES.map((z) => (
                  <button key={z.key} type="button" className={'chip chip--facet' + (fZone === z.key ? ' is-on' : '')} aria-pressed={fZone === z.key} disabled={countZone(z.key) === 0 && fZone !== z.key} onClick={() => setFilter('habitat', fZone === z.key ? null : z.key)}>{t(('trail.zones.' + z.key + '.name') as MessageKey)} <b className="tnum">{countZone(z.key)}</b></button>
                ))}
              </div>
              <div className="facets__row">
                <span className="facets__label">{t('wildlife.byProvince')}</span>
                {PROVINCE_ORDER.map((p) => (
                  <button key={p} type="button" className={'chip chip--facet' + (fProv === p ? ' is-on' : '')} aria-pressed={fProv === p} disabled={countProv(p) === 0 && fProv !== p} onClick={() => setFilter('province', fProv === p ? null : p)}>{provinceName(p)} <b className="tnum">{countProv(p)}</b></button>
                ))}
              </div>
              <p className="facets__status" aria-live="polite">
                {t('wildlife.showing', { n: shown.length, total: facets.length })}
                {filtered && <> · <button type="button" className="linklike" onClick={clearFilters}>{t('wildlife.clearFilters')}</button></>}
                <small className="muted"> · {t('wildlife.facetNote')}</small>
              </p>
            </div>
          )}
          {content && (
            <nav className="avatar-index ui" aria-label={t('wildlife.index')}>
              {shown.map(({ sp }) => (
                <a key={sp.id} href={'#' + sp.id} className="avatar avatar--index" onClick={(e) => { e.preventDefault(); document.getElementById(sp.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                  {STICKERS[sp.id] ? <img src={stickerSrc(sp.id, 240)} alt="" width={64} height={64} loading="lazy" decoding="async" /> : <AnimalSvg species={sp.id} size={64} />}
                  <span>{l(sp.commonNames)}</span>
                </a>
              ))}
            </nav>
          )}
        </header>
        {!content && <p className="muted">{t('common.loading')}</p>}
        {content && shown.length === 0 && <p className="muted">{t('wildlife.noMatch')}</p>}
        {shown.map(({ sp }) => {
          const where = places(sp);
          const sticker = STICKERS[sp.id];
          return (
            <div key={sp.id} className="species-row">
              <aside className="species-row__side">
                {sticker ? (
                  <figure className="animal-hero animal-hero--big animal-hero--sticker">
                    <img src={stickerSrc(sp.id, sticker.widths[Math.min(sticker.widths.length - 1, 1)])} srcSet={stickerSrcSet(sp.id)} sizes="(min-width: 900px) 22vw, 60vw" alt={l(sp.commonNames)} width={sticker.w} height={sticker.h} loading="lazy" decoding="async" />
                  </figure>
                ) : (
                  <div className="animal-hero animal-hero--big"><AnimalSvg species={sp.id} size="100%" title={t('wildlife.cartoonOf', { name: l(sp.commonNames) })} /></div>
                )}
                {where.length > 0 && (
                  <div className="where ui">
                    <p className="eyebrow">{t('explore.whereToSee')}</p>
                    <ul className="where-list">
                      {where.map(({ h, lm }) => (
                        <li key={h.at}>
                          <Link to={'/explore?place=' + h.at}><Icon name="pin" /> <span><b>{landmarkName(lm!, lang)}</b><small>{pickLang(h.note, lang)}</small></span></Link>
                        </li>
                      ))}
                    </ul>
                    <Link className="btn btn--ghost btn--sm" to={'/explore?animal=' + sp.id}><Icon name="paw" /> {t('wildlife.onMap')}</Link>
                  </div>
                )}
              </aside>
              <SpeciesEntry sp={sp} />
            </div>
          );
        })}
        <p className="ui"><Link to="/explore">{t('nav.explore')}</Link></p>
      </div>

      <Sheet open={!!open} onClose={close} title={open ? l(open.sp.commonNames) : ''}>
        {open && (
          <div className="sheet-entry sheet-entry--trail">
            <div className="trail-popup__top">
              {STICKERS[open.sp.id] && <img className="trail-popup__img" src={stickerSrc(open.sp.id, 400)} srcSet={stickerSrcSet(open.sp.id)} sizes="180px" alt="" width={STICKERS[open.sp.id].w} height={STICKERS[open.sp.id].h} />}
              <div className="trail-popup__meta ui">
                {ZONE_OF.has(open.sp.id) && <p className="trail-popup__zone"><Icon name="route" /> {t('trail.inZone', { zone: t(`trail.zones.${ZONE_OF.get(open.sp.id)}.name` as MessageKey) })}</p>}
                {places(open.sp).length > 0 && (
                  <>
                    <p className="eyebrow">{t('explore.whereToSee')}</p>
                    <ul className="where-list where-list--compact">
                      {places(open.sp).map(({ h, lm }) => (
                        <li key={h.at}><Link to={'/explore?place=' + h.at}><Icon name="pin" /> <span><b>{landmarkName(lm!, lang)}</b><small>{pickLang(h.note, lang)}</small></span></Link></li>
                      ))}
                    </ul>
                  </>
                )}
                <p className="trail-popup__links">
                  {walkStop(open.sp) && <Link to={'/walk?stop=' + walkStop(open.sp)} className="btn btn--ghost btn--sm"><Icon name="play" /> {t('trail.seeOnWalk')}</Link>}
                  <Link to={'/explore?animal=' + open.sp.id} className="btn btn--ghost btn--sm"><Icon name="paw" /> {t('wildlife.onMap')}</Link>
                  <a href={'#' + open.sp.id} className="btn btn--ghost btn--sm" onClick={(e) => { e.preventDefault(); close(); setTimeout(() => document.getElementById(open.sp.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); }}>{t('trail.readEntry')}</a>
                </p>
              </div>
            </div>
            <SpeciesEntry sp={open.sp} heading="h3" compact />
          </div>
        )}
      </Sheet>
    </article>
  );
}
