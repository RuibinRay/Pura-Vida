import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from '../../ui/Link';
import { useT } from '../../i18n';
import { useContent } from '../../content';
import { usePageTitle } from '../usePageTitle';
import { SpeciesEntry } from '../../ui/SpeciesEntry';
import { PlateImage } from '../../journey/Plate';

export function WildlifePage() {
  const { t, l } = useT();
  usePageTitle(t('wildlife.title'));
  const content = useContent();
  const [params] = useSearchParams();
  const focus = params.get('focus');

  // ?focus=<species id> scrolls to that entry once the content is in
  useEffect(() => {
    if (!content || !focus) return;
    const el = document.getElementById(focus);
    if (el) { el.scrollIntoView({ block: 'start' }); el.querySelector<HTMLElement>('h2')?.focus?.(); }
  }, [content, focus]);

  return (
    <article className="page container">
      <header className="page__head page__head--plate">
        <figure className="plate-figure">
          <PlateImage plate="beach" sizes="(min-width: 1100px) 1100px, 100vw" alt={t('journey.ch4.plateAlt')} />
          <figcaption className="muted ui"><small>{t('journey.ch4.plateCredit')}</small></figcaption>
        </figure>
        <p className="eyebrow">{t('nav.wildlife')}</p>
        <h1>{t('wildlife.title')}</h1>
        <p className="lede">{t('wildlife.lede')}</p>
        {content && (
          <nav className="species-index ui" aria-label={t('wildlife.index')}>
            {content.species.map((sp) => (
              <a key={sp.id} href={'#' + sp.id} onClick={(e) => { e.preventDefault(); document.getElementById(sp.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{l(sp.commonNames)}</a>
            ))}
          </nav>
        )}
      </header>
      {!content && <p className="muted">{t('common.loading')}</p>}
      {content?.species.map((sp) => <SpeciesEntry key={sp.id} sp={sp} />)}
      <p className="ui"><Link to="/explore">{t('nav.explore')}</Link></p>
    </article>
  );
}
