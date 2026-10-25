// The pinned copy block of a scene stop: kicker, place name, the sourced overview, two fact tiles, links.
import { Link } from '../ui/Link';
import { useT } from '../i18n';
import type { Place, PlaceFact } from '../content/types';
import type { Stop } from './scenes';
import { StatusTag } from '../ui/Sources';

const TILES: Record<string, string[]> = {
  monteverde: ['areaHa', 'birdSpecies'],
  'rio-celeste': ['particleSize', 'waterfall'],
  irazu: ['summit', 'craterLakeDepth'],
  guanacaste: ['pasturesRegrown', 'oxcartHeritage'],
  'manuel-antonio': ['dailyCap', 'areaHa'],
  corcovado: ['areaHa', 'worldBiodiversityShare'],
  tortuguero: ['greenTurtleSeason', 'rainfall'],
};

function unitOf(f: PlaceFact) {
  const u = (f.unit || '').split(/[ (;,]/)[0];
  if (!u || u === 'year') return '';
  return u;
}

export function PlaceFacts({ place, keys }: { place: Place; keys?: string[] }) {
  const { t, l, lang } = useT();
  const want = keys || TILES[place.id] || [];
  const tiles = want.map((k) => place.facts.find((f) => f.key === k)).filter((f): f is PlaceFact => !!f);
  if (!tiles.length) return null;
  const fmt = (v: number | string) => (typeof v === 'number' ? v.toLocaleString(lang === 'zh' ? 'zh-CN' : lang === 'es' ? 'es-CR' : 'en', { maximumFractionDigits: 1 }) : v);
  return (
    <ul className="facts-grid facts-grid--place">
      {tiles.map((f) => (
        <li key={f.key} className="fact fact--plain">
          <div className="fact__body">
            <p className="fact__value tnum">{fmt(f.value)}{unitOf(f) ? <small> {unitOf(f)}</small> : null}</p>
            <p className="fact__label">{l(f.label)}</p>
            <p className="fact__meta ui">
              {f.status !== 'confirmed' && <StatusTag status={f.status} />}
              {f.year ? <span className="muted">{f.year}</span> : null}
              <Link to="/sources" className="fact__src">{t('common.sourcesN', { n: f.sources.length })}</Link>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function StopCopy({ index, stop, place, children, extraLinks }: { index: number; stop: Stop; place?: Place; children?: React.ReactNode; extraLinks?: React.ReactNode }) {
  const { t, l } = useT();
  const n = String(index).padStart(2, '0');
  const id = `ch${index}-title`;
  const placeClass = stop.copy === 'right' ? ' jcopy--right' : stop.copy === 'bottom' ? ' jcopy--bottom' : stop.copy === 'top-center' ? ' jcopy--topcenter' : stop.copy === 'top' ? ' jcopy--top' : '';
  return (
    <div className={'jcopy jcopy--panel on-dark' + placeClass} style={{ ['--pn' as string]: `var(--p${index})` }}>
      <p className="jcopy__kicker">{n} / {t(`journey.stops.${stop.key}.kicker` as never)}</p>
      <h2 id={id} className="jcopy__h2">{place ? l(place.name) : t(`journey.stops.${stop.key}.title` as never)}</h2>
      {place?.overview ? <p className="jcopy__text">{l(place.overview)}</p> : <p className="jcopy__text">{t(`journey.stops.${stop.key}.text` as never)}</p>}
      {place && <PlaceFacts place={place} />}
      {children}
      <p className="jcopy__links ui">
        {place?.province && <Link to={'/provinces/' + place.province}>{t('journey.stopProvince')}</Link>}
        {extraLinks}
      </p>
      {place?.overview?.status && place.overview.status !== 'confirmed' && <p className="jcopy__caption ui"><StatusTag status={place.overview.status} /> <Link to="/sources">{t('common.sourcesN', { n: place.overview.sources?.length || 0 })}</Link></p>}
      <p className="jcopy__caption"><small>{t('journey.plateCredit')}</small></p>
    </div>
  );
}
