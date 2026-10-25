import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from '../../ui/Link';
import { useT, pickLang } from '../../i18n';
import { useContent } from '../../content';
import { usePageTitle } from '../usePageTitle';
import { SpeciesEntry } from '../../ui/SpeciesEntry';
import { PlateImage } from '../../journey/Plate';
import { AnimalSvg } from '../../art/animals';
import { HABITATS } from '../../content/habitats';
import { landmarkName } from '../../map/explore';
import { Icon } from '../../ui/Icon';

export function WildlifePage() {
  const { t, l, lang } = useT();
  usePageTitle(t('wildlife.title'));
  const content = useContent();
  const [params] = useSearchParams();
  const focus = params.get('focus');
  const byId = useMemo(() => new Map((content?.landmarks ?? []).map((x) => [x.id, x])), [content]);

  // ?focus=<species id> scrolls to that entry once the content is in
  useEffect(() => {
    if (!content || !focus) return;
    const el = document.getElementById(focus);
    if (el) { el.scrollIntoView({ block: 'start' }); el.querySelector<HTMLElement>('h2')?.focus?.(); }
  }, [content, focus]);

  return (
    <article className="page container page--wildlife">
      <header className="page__head page__head--plate page__head--nature">
        <figure className="plate-figure">
          <PlateImage plate="beach" sizes="(min-width: 1100px) 1100px, 100vw" alt={t('journey.ch4.plateAlt')} />
          <figcaption className="muted ui"><small>{t('journey.ch4.plateCredit')}</small></figcaption>
        </figure>
        <p className="eyebrow">{t('nav.wildlife')}</p>
        <h1>{t('wildlife.title')}</h1>
        <p className="lede">{t('wildlife.lede')}</p>
        {content && (
          <nav className="avatar-index ui" aria-label={t('wildlife.index')}>
            {content.species.map((sp) => (
              <a key={sp.id} href={'#' + sp.id} className="avatar avatar--index" onClick={(e) => { e.preventDefault(); document.getElementById(sp.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                <AnimalSvg species={sp.id} size={64} />
                <span>{l(sp.commonNames)}</span>
              </a>
            ))}
          </nav>
        )}
        <p className="muted ui"><small>{t('wildlife.cartoonNote')}</small></p>
      </header>
      {!content && <p className="muted">{t('common.loading')}</p>}
      {content?.species.map((sp) => {
        const places = (HABITATS[sp.id] ?? []).map((h) => ({ h, lm: byId.get(h.at) })).filter((x) => !!x.lm);
        return (
          <div key={sp.id} className="species-row">
            <aside className="species-row__side">
              <div className="animal-hero animal-hero--big"><AnimalSvg species={sp.id} size="100%" title={t('wildlife.cartoonOf', { name: l(sp.commonNames) })} /></div>
              {places.length > 0 && (
                <div className="where ui">
                  <p className="eyebrow">{t('explore.whereToSee')}</p>
                  <ul className="where-list">
                    {places.map(({ h, lm }) => (
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
    </article>
  );
}
