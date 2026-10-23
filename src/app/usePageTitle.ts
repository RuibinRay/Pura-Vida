import { useEffect } from 'react';
import { useT } from '../i18n';

export function usePageTitle(title?: string) {
  const { t } = useT();
  useEffect(() => {
    document.title = title ? `${title} · ${t('site.short')}` : t('site.title');
  }, [title, t]);
}
