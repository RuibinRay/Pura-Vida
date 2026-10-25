import { Link } from '../../ui/Link';
import { useT } from '../../i18n';
import { usePageTitle } from '../usePageTitle';

export function NotFoundPage() {
  const { t } = useT();
  usePageTitle(t('common.notFound'));
  return (
    <article className="page container">
      <h1>{t('common.notFound')}</h1>
      <p>{t('common.notFoundText')}</p>
      <Link className="btn btn--primary" to="/">{t('common.home')}</Link>
    </article>
  );
}
