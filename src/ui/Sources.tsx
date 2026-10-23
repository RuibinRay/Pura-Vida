import { useState } from 'react';
import { useT, type MessageKey } from '../i18n';
import type { Source, Status } from '../content/types';
import { Icon } from './Icon';

export function dedupeSources(list: Source[]): Source[] {
  const seen = new Map<string, Source>();
  for (const s of list) if (s?.url && !seen.has(s.url)) seen.set(s.url, s);
  return [...seen.values()];
}

export function StatusTag({ status }: { status: Status }) {
  const { t } = useT();
  return <span className={'status ' + status}>{t(('status.' + status) as MessageKey)}</span>;
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Sources list. Compact = a "n sources" disclosure; full = the list itself. */
export function SourceList({ sources, compact }: { sources: Source[]; compact?: boolean }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const list = dedupeSources(sources);
  if (!list.length) return null;
  const items = (
    <ul className="sources">
      {list.map((s) => (
        <li key={s.url}>
          <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title || hostOf(s.url)} <Icon name="external" size={13} /></a>
          <span className="sources__meta"> — {s.publisher || hostOf(s.url)}{s.published ? `, ${t('sources.published')} ${s.published}` : ''}, {t('sources.retrieved')} {s.retrieved}</span>
        </li>
      ))}
    </ul>
  );
  if (!compact) return items;
  return (
    <span className="sources-compact">
      <button type="button" className="btn btn--link btn--xs" aria-expanded={open} onClick={() => setOpen(!open)}>
        {t('common.sourcesN', { n: list.length })} <Icon name="chevron" size={13} />
      </button>
      {open && items}
    </span>
  );
}
