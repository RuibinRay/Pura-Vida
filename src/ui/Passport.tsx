// The discovery passport: everything the visitor has opened, by kind — the seven provinces as stamps, the animals and
// the dishes as their own pictures (grey until found), the places of the map as a count — with what there is still to
// find and a way to it. Stamps are saved on this device only (state/passport.ts).
import { useMemo } from 'react';
import { Link } from './Link';
import { Stamp } from './Stamp';
import { AnimalPicture } from './AnimalPicture';
import { DishPhoto } from './DishPhoto';
import { Icon } from './Icon';
import { useT, type MessageKey } from '../i18n';
import { usePassport } from '../state/passport';
import { useRoute } from '../state/route';
import { useMapData } from '../map/useMapData';
import { useContent } from '../content';
import { PROVINCE_ORDER, PROVINCE_COLORS } from '../map/geo';
import { landmarkName } from '../map/explore';

/** A passport level from the share of everything found: 0 below a tenth, 1 below a third, 2 below two thirds, 3 above. */
export function passportLevel(done: number, total: number): 0 | 1 | 2 | 3 {
  const share = total > 0 ? done / total : 0;
  return share < 0.1 ? 0 : share < 1 / 3 ? 1 : share < 2 / 3 ? 2 : 3;
}

function Meter({ done, total, label }: { done: number; total: number; label: string }) {
  return (
    <span className="pmeter" role="img" aria-label={`${label}: ${done} / ${total}`}>
      <span className="pmeter__bar"><span style={{ width: `${total ? Math.round((done / total) * 100) : 0}%` }} /></span>
      <b className="tnum">{done}<small> / {total}</small></b>
    </span>
  );
}

export function Passport({ onNavigate }: { onNavigate?: () => void }) {
  const { t, l, lang } = useT();
  const discoveries = usePassport((s) => s.discoveries);
  const clear = usePassport((s) => s.clear);
  const routeCount = useRoute((r) => r.stops.length);
  const { data } = useMapData();
  const content = useContent();
  const found = useMemo(() => {
    const by = { province: new Map<string, string>(), species: new Map<string, string>(), food: new Map<string, string>(), place: new Map<string, string>(), culture: new Map<string, string>() };
    for (const d of discoveries) if (d.kind in by) by[d.kind as keyof typeof by].set(d.id, d.at);
    return by;
  }, [discoveries]);
  const species = content?.species ?? [];
  const foods = content?.foods ?? [];
  const landmarks = content?.landmarks ?? [];
  const culture = content?.culture ?? [];
  // only what still exists counts (a stamp for a place that left the map is not a discovery to show)
  const doneProv = PROVINCE_ORDER.filter((id) => found.province.has(id)).length;
  const doneSp = species.filter((s) => found.species.has(s.id)).length;
  const doneFood = foods.filter((f) => found.food.has(f.id)).length;
  const donePlace = landmarks.filter((x) => found.place.has(x.id)).length;
  const doneCulture = culture.filter((c) => found.culture.has(c.id)).length;
  const total = PROVINCE_ORDER.length + species.length + foods.length + culture.length + landmarks.length;
  const done = doneProv + doneSp + doneFood + doneCulture + donePlace;
  const level = passportLevel(done, total);
  const provinceName = (id: string) => { const g = data?.provinces.find((p) => p.id === id); return g ? g.name[lang] || g.name.en : id; };

  // what to find next: the first of each kind not yet found, in the site's own order
  const nextProv = PROVINCE_ORDER.find((id) => !found.province.has(id));
  const nextSp = species.find((s) => !found.species.has(s.id));
  const nextFood = foods.find((f) => !found.food.has(f.id));
  const nextPlace = landmarks.find((x) => !found.place.has(x.id) && (x.kind === 'park' || x.kind === 'volcano'));
  const recent = discoveries.filter((d) => d.kind === 'place').slice(-5).reverse().map((d) => landmarks.find((x) => x.id === d.id)).filter((x): x is NonNullable<typeof x> => !!x);

  return (
    <div className="passport">
      <p>{t('passport.lede')}</p>
      <div className="passport__summary ui">
        <span className={'passport__level passport__level--' + level}><Icon name="stamp" /> {t(('passport.level' + level) as MessageKey)}</span>
        <Meter done={done} total={total} label={t('passport.overall', { done, total })} />
        {routeCount > 0 && <Link to="/explore" onClick={onNavigate} className="passport__route"><Icon name="route" /> {t('explore.route')} · {t('explore.routeStops', { n: routeCount })}</Link>}
      </div>

      {(nextProv || nextSp || nextFood || nextPlace) && (
        <section className="passport__next ui" aria-labelledby="pp-next">
          <h3 id="pp-next" className="eyebrow">{t('passport.next')}</h3>
          <ul>
            {nextProv && <li><Link to={'/provinces/' + nextProv} onClick={onNavigate}><Icon name="arrow" /> {t('passport.nextProvince', { name: provinceName(nextProv) })}</Link></li>}
            {nextSp && <li><Link to={'/wildlife?focus=' + nextSp.id} onClick={onNavigate}><Icon name="paw" /> {t('passport.nextSpecies', { name: l(nextSp.commonNames) })}</Link></li>}
            {nextFood && <li><Link to={'/food?focus=' + nextFood.id} onClick={onNavigate}><Icon name="bowl" /> {t('passport.nextDish', { name: l(nextFood.name) })}</Link></li>}
            {nextPlace && <li><Link to={'/explore?place=' + nextPlace.id} onClick={onNavigate}><Icon name="pin" /> {t('passport.nextPlace', { name: landmarkName(nextPlace, lang) })}</Link></li>}
          </ul>
        </section>
      )}

      <section aria-labelledby="pp-prov">
        <h3 id="pp-prov" className="passport__h">{t('passport.secProvinces')} <Meter done={doneProv} total={PROVINCE_ORDER.length} label={t('passport.secProvinces')} /></h3>
        <ul className="passport__grid">
          {PROVINCE_ORDER.map((id) => (
            <li key={id}>
              <Stamp label={provinceName(id)} date={found.province.get(id)} color={PROVINCE_COLORS[id]} stamped={found.province.has(id)} />
              <Link to={'/provinces/' + id} onClick={onNavigate} className="passport__name">{provinceName(id)}</Link>
            </li>
          ))}
        </ul>
      </section>

      {species.length > 0 && (
        <section aria-labelledby="pp-sp">
          <h3 id="pp-sp" className="passport__h">{t('passport.secWildlife')} <Meter done={doneSp} total={species.length} label={t('passport.secWildlife')} /></h3>
          <ul className="passport__tiles">
            {species.map((sp) => {
              const got = found.species.has(sp.id);
              return (
                <li key={sp.id} className={got ? 'is-found' : ''}>
                  <Link to={'/wildlife?focus=' + sp.id} onClick={onNavigate} title={l(sp.commonNames) + (got ? '' : ' — ' + t('passport.notYet'))}>
                    <AnimalPicture species={sp.id} size={52} />
                    <span className="visually-hidden">{l(sp.commonNames)}{got ? '' : ' — ' + t('passport.notYet')}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {foods.length > 0 && (
        <section aria-labelledby="pp-food">
          <h3 id="pp-food" className="passport__h">{t('passport.secDishes')} <Meter done={doneFood} total={foods.length} label={t('passport.secDishes')} /></h3>
          <ul className="passport__tiles passport__tiles--dishes">
            {foods.map((f) => {
              const got = found.food.has(f.id);
              return (
                <li key={f.id} className={got ? 'is-found' : ''}>
                  <Link to={'/food?focus=' + f.id} onClick={onNavigate} title={l(f.name) + (got ? '' : ' — ' + t('passport.notYet'))}>
                    <DishPhoto id={f.id} size={64} />
                    <span className="visually-hidden">{l(f.name)}{got ? '' : ' — ' + t('passport.notYet')}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {culture.length > 0 && (
        <section aria-labelledby="pp-culture">
          <h3 id="pp-culture" className="passport__h">{t('nav.culture')} <Meter done={doneCulture} total={culture.length} label={t('nav.culture')} /></h3>
          <p className="passport__recent ui">
            {culture.map((c) => (<Link key={c.id} to={'/culture?focus=' + c.id} onClick={onNavigate} className={'chip chip--sm' + (found.culture.has(c.id) ? ' is-on' : '')} title={found.culture.has(c.id) ? undefined : t('passport.notYet')}>{l(c.name)}</Link>))}
          </p>
        </section>
      )}

      {landmarks.length > 0 && (
        <section aria-labelledby="pp-place">
          <h3 id="pp-place" className="passport__h">{t('passport.secPlaces')} <Meter done={donePlace} total={landmarks.length} label={t('passport.secPlaces')} /></h3>
          {recent.length > 0 && (
            <p className="passport__recent ui"><span className="eyebrow">{t('passport.recentPlaces')}</span> {recent.map((lm) => (<Link key={lm.id} to={'/explore?place=' + lm.id} onClick={onNavigate} className="chip chip--sm">{landmarkName(lm, lang)}</Link>))}</p>
          )}
        </section>
      )}

      {discoveries.length > 0 && <button type="button" className="btn btn--ghost btn--sm" onClick={clear}>{t('passport.clear')}</button>}
    </div>
  );
}
