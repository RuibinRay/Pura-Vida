import { useT } from '../../i18n';
import { MapStage } from '../../map/MapStage';
import { usePageTitle } from '../usePageTitle';

export function ExplorePage() {
  const { t } = useT();
  usePageTitle(t('explore.title'));
  return (
    <article className="page page--explore">
      <header className="container page__head">
        <p className="eyebrow">{t('nav.explore')}</p>
        <h1>{t('explore.title')}</h1>
        <p className="lede">{t('explore.lede')}</p>
      </header>
      <div className="container container--wide">
        <MapStage />
      </div>
    </article>
  );
}
