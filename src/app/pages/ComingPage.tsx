import { Link } from '../../ui/Link';
import { useT } from '../../i18n';
import type { Section } from '../sections';
import { usePageTitle } from '../usePageTitle';

export function ComingPage({ section }: { section: Section }) {
  const { t } = useT();
  usePageTitle(t(section.labelKey));
  return (
    <article className="page container">
      <p className="eyebrow" style={{ color: section.color }}>{t(section.labelKey)}</p>
      <h1>{t('coming.title')}</h1>
      <p className="prose">{t('coming.text', { n: typeof section.ready === 'number' ? section.ready : 2 })}</p>
      <Link className="btn btn--ghost" to="/">{t('coming.back')}</Link>
    </article>
  );
}
