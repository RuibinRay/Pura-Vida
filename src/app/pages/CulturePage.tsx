// The culture chapter: music and dance, traditions, and coffee — each entry written from sources (research/culture.json),
// with a photograph where a licensed one was found, the national symbols it involves, and where the map shows it.
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from '../../ui/Link';
import { useT, type MessageKey } from '../../i18n';
import { useContent } from '../../content';
import { usePageTitle } from '../usePageTitle';
import type { CultureEntry } from '../../content/types';
import { CULTURE_PHOTOS, CULTURE_ALT, culturePhotoSrc, culturePhotoSrcSet } from '../../content/culturePhotos';
import { SourceList, StatusTag } from '../../ui/Sources';
import { Icon } from '../../ui/Icon';
import { Marimba } from '../../ui/Marimba';
import { useInView } from '../../ui/useInView';
import { usePassport } from '../../state/passport';
import { useMapData } from '../../map/useMapData';
import { landmarkName } from '../../map/explore';

const GROUPS: CultureEntry['group'][] = ['music', 'traditions', 'coffee'];

/** A chorreador, drawn: a wooden stand, a cloth bag, a cup, and the drip. An illustration, and labelled as one. */
function Chorreador({ label }: { label: string }) {
  return (
    <figure className="chorreador">
      <svg viewBox="0 0 200 220" role="img" aria-label={label}>
        <rect x="24" y="196" width="152" height="12" rx="3" fill="#6b4a2d" />
        <rect x="40" y="26" width="10" height="172" rx="3" fill="#7d5836" />
        <rect x="150" y="26" width="10" height="172" rx="3" fill="#7d5836" />
        <rect x="34" y="22" width="132" height="12" rx="4" fill="#8c653f" />
        <ellipse cx="100" cy="34" rx="34" ry="7" fill="none" stroke="#3a3236" strokeWidth="3" />
        <path d="M66 34 C70 86 88 118 100 128 C112 118 130 86 134 34 Z" fill="#efe6d2" stroke="#b9ad90" strokeWidth="2" />
        <path d="M74 44 C80 84 92 108 100 116 C108 108 120 84 126 44 Z" fill="#5a3a22" opacity="0.5" />
        <circle className="chorreador__drop" cx="100" cy="136" r="4" fill="#3b2415" />
        <path d="M72 160 h56 v26 a10 10 0 0 1 -10 10 h-36 a10 10 0 0 1 -10 -10 z" fill="#f7f3ea" stroke="#b9ad90" strokeWidth="2" />
        <path d="M128 166 q16 2 14 14 q-2 10 -14 10" fill="none" stroke="#b9ad90" strokeWidth="4" />
        <ellipse cx="100" cy="162" rx="26" ry="4" fill="#3b2415" />
      </svg>
      <figcaption><small>{label}</small></figcaption>
    </figure>
  );
}

function Entry({ e }: { e: CultureEntry }) {
  const { t, l, lang } = useT();
  const content = useContent();
  const { data } = useMapData();
  const stamp = usePassport((s) => s.stamp);
  const [ref, seen] = useInView<HTMLElement>('0px 0px -35% 0px');
  useEffect(() => { if (seen) stamp('culture', e.id); }, [seen, stamp, e.id]);
  const photo = CULTURE_PHOTOS[e.id];
  const places = e.places.map((id) => content?.landmarks.find((x) => x.id === id)).filter((x): x is NonNullable<typeof x> => !!x);
  const province = e.province ? data?.provinces.find((p) => p.id === e.province) : undefined;
  return (
    <article ref={ref} id={e.id} className={'culture-entry' + (seen ? ' is-in' : '') + (photo ? '' : ' culture-entry--plain')} aria-labelledby={'cu-' + e.id}>
      {photo && (
        <figure className="culture-entry__photo" style={{ ['--ratio' as string]: photo.aspect }}>
          <img src={culturePhotoSrc(e.id, photo.widths[photo.widths.length - 1])} srcSet={culturePhotoSrcSet(e.id)} sizes="(min-width: 900px) 420px, 92vw" width={photo.widths[photo.widths.length - 1]} height={Math.round(photo.widths[photo.widths.length - 1] / photo.aspect)} alt={l(CULTURE_ALT[e.id])} loading="lazy" decoding="async" />
          <figcaption className="photo-credit ui"><small>{t('food.photoBy')} <a href={photo.page} rel="noopener">{photo.author}</a> · {photo.licenceUrl ? <a href={photo.licenceUrl} rel="noopener license">{photo.licence}</a> : photo.licence} · Wikimedia Commons</small></figcaption>
        </figure>
      )}
      <div className="culture-entry__body">
        <h3 id={'cu-' + e.id}>{l(e.name)}</h3>
        {e.summary && <p className="culture-entry__summary">{l(e.summary)}</p>}
        {e.symbols.length > 0 && (
          <p className="species__tags ui">
            {e.symbols.filter((s) => s.year).map((s) => (<span key={s.id} className="tag tag--gold" title={s.instrument}>{t('culture.symbolSince', { year: s.year as number })}</span>))}
          </p>
        )}
        <p className="culture-entry__text">{l(e.text)} {e.status !== 'confirmed' && <StatusTag status={e.status} />}</p>
        {e.id === 'marimba' && <Marimba />}
        {e.steps.length > 0 && (
          <div className="culture-steps">
            <ol className="prep-steps">
              {e.steps.map((s, i) => (<li key={i}><span className="prep-steps__n tnum" aria-hidden="true">{i + 1}</span><span>{l(s)}</span></li>))}
            </ol>
            <Chorreador label={t('culture.chorreadorAlt')} />
          </div>
        )}
        {e.facts.length > 0 && (
          <ul className="culture-facts ui">
            {e.facts.map((f, i) => (
              <li key={i}><b className="tnum">{f.value}{f.unit ? <small> {l(f.unit)}</small> : null}</b><span>{l(f.label)} {f.status && f.status !== 'confirmed' && <StatusTag status={f.status} />}</span></li>
            ))}
          </ul>
        )}
        {(places.length > 0 || province) && (
          <p className="culture-entry__where ui">
            {places.map((lm) => (<Link key={lm.id} to={'/explore?place=' + lm.id} className="chip chip--sm"><Icon name="pin" /> {landmarkName(lm, lang)}</Link>))}
            {province && <Link to={'/provinces/' + province.id} className="chip chip--sm">{province.name[lang] || province.name.en} <Icon name="arrow" /></Link>}
          </p>
        )}
        <SourceList sources={e.sources} compact />
      </div>
    </article>
  );
}

export function CulturePage() {
  const { t } = useT();
  usePageTitle(t('culture.title'));
  const content = useContent();
  const [params] = useSearchParams();
  const focus = params.get('focus');
  useEffect(() => { if (content && focus) document.getElementById(focus)?.scrollIntoView({ block: 'start' }); }, [content, focus]);
  const entries = content?.culture ?? [];
  return (
    <article className="page container page--culture">
      <header className="page__head page__head--nature">
        <p className="eyebrow">{t('nav.culture')}</p>
        <h1>{t('culture.title')}</h1>
        <p className="lede">{t('culture.lede')}</p>
        <nav className="culture-nav ui" aria-label={t('culture.sections')}>
          {GROUPS.map((g) => (<a key={g} href={'#cu-group-' + g} className="chip" onClick={(e) => { e.preventDefault(); document.getElementById('cu-group-' + g)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{t(('culture.groups.' + g) as MessageKey)}</a>))}
          <Link to="/food" className="chip"><Icon name="bowl" /> {t('nav.food')}</Link>
        </nav>
        <p className="muted"><small>{t('culture.note')}</small></p>
      </header>
      {!content && <p className="muted">{t('common.loading')}</p>}
      {GROUPS.map((g) => {
        const list = entries.filter((e) => e.group === g);
        if (!list.length) return null;
        return (
          <section key={g} id={'cu-group-' + g} className="culture-group" aria-labelledby={'cu-h-' + g}>
            <header className="culture-group__head">
              <h2 id={'cu-h-' + g}>{t(('culture.groups.' + g) as MessageKey)}</h2>
              <p className="lede">{t(('culture.groupLede.' + g) as MessageKey)}</p>
            </header>
            {list.map((e) => (<Entry key={e.id} e={e} />))}
          </section>
        );
      })}
      <p className="ui"><Link to="/">{t('journey.ch5.backHome')}</Link></p>
    </article>
  );
}
