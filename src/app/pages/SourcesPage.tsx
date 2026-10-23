import { useT } from '../../i18n';
import { useContent } from '../../content';
import { Icon } from '../../ui/Icon';
import { usePageTitle } from '../usePageTitle';

const ASSETS: { name: string; author: string; source: string; license: string; attribution: string }[] = [
  { name: 'Province, country, lake and river boundaries (1:10m)', author: 'Natural Earth (Nathaniel V. Kelso, Tom Patterson and contributors)', source: 'https://www.naturalearthdata.com/ · github.com/nvkelso/natural-earth-vector', license: 'Public domain', attribution: 'None required; credited as a courtesy' },
  { name: 'Populated places (1:10m)', author: 'Natural Earth', source: 'https://www.naturalearthdata.com/', license: 'Public domain', attribution: 'Population figures are Natural Earth estimates, labelled as such' },
  { name: 'Literata (variable)', author: 'TypeTogether for Google', source: '@fontsource-variable/literata', license: 'SIL Open Font License 1.1', attribution: 'None required' },
  { name: 'Albert Sans (variable)', author: 'Andreas Rasmussen', source: '@fontsource-variable/albert-sans', license: 'SIL Open Font License 1.1', attribution: 'None required' },
  { name: 'Caveat (variable)', author: 'Pablo Impallari', source: '@fontsource-variable/caveat', license: 'SIL Open Font License 1.1', attribution: 'None required' },
  { name: 'Three.js, React Three Fiber, Drei', author: 'mrdoob and contributors; Poimandres', source: 'npm', license: 'MIT', attribution: 'None required' },
  { name: 'React, React Router, Zustand, Vite, TopoJSON, cdt2d, shapefile', author: 'their maintainers', source: 'npm', license: 'MIT / ISC / BSD', attribution: 'None required' },
  { name: 'Rainforest scene, map relief, icons, stamps, illustrations', author: 'Built procedurally for this site', source: 'this repository', license: 'Part of the site', attribution: 'The scene is a stylised illustration, not a photograph or a survey' },
];

export function SourcesPage() {
  const { t, l } = useT();
  usePageTitle(t('sources.title'));
  const content = useContent();
  return (
    <article className="page container">
      <header className="page__head">
        <p className="eyebrow">{t('nav.sources')}</p>
        <h1>{t('sources.title')}</h1>
        <p className="lede">{t('sources.lede')}</p>
      </header>
      <section className="chapter-part">
        <h2>{t('sources.method')}</h2>
        <p className="prose">{t('sources.methodText')}</p>
        <p className="ui"><span className="status confirmed">{t('status.confirmed')}</span> · <span className="status approximate">{t('status.approximate')}</span> · <span className="status interpretation">{t('status.interpretation')}</span> · <span className="status folklore">{t('status.folklore')}</span> · <span className="status uncertain">{t('status.uncertain')}</span></p>
      </section>
      <section className="chapter-part" style={{ minHeight: content ? undefined : '70vh' }}>
        <h2>{t('sources.research')} {content && <small className="muted tnum">({content.sources.length})</small>}</h2>
        {!content && <p className="muted">{t('common.loading')}</p>}
        {content && (
          <ul className="sources sources--full">
            {content.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title || s.url} <Icon name="external" size={13} /></a>
                <span className="sources__meta"> — {s.publisher}{s.published ? `, ${t('sources.published')} ${s.published}` : ''}, {t('sources.retrieved')} {s.retrieved}</span>
                {s.usedFor.length > 0 && <span className="sources__used ui">{s.usedFor.join(' · ')}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
      {content && content.unverified.length > 0 && (
        <section className="chapter-part">
          <h2>{t('sources.unverified')} <small className="muted tnum">({content.unverified.length})</small></h2>
          <ul className="unverified">
            {content.unverified.map((u, i) => (
              <li key={i}><b>{u.claim}</b> <span className="muted">— {u.reason}</span> <small className="muted ui">[{u.from}]</small></li>
            ))}
          </ul>
        </section>
      )}
      <section className="chapter-part">
        <h2>{t('sources.data')} &amp; {t('sources.assets')}</h2>
        <table className="credits ui">
          <thead><tr><th>Asset</th><th>Author</th><th>Source</th><th>{t('sources.license')}</th><th>{t('sources.attribution')}</th></tr></thead>
          <tbody>
            {ASSETS.map((a) => (
              <tr key={a.name}><td>{a.name}</td><td>{a.author}</td><td>{a.source}</td><td>{a.license}</td><td>{a.attribution}</td></tr>
            ))}
          </tbody>
        </table>
        {content?.unesco && content.unesco.length > 0 && (
          <>
            <h3 className="h-small">UNESCO</h3>
            <ul className="sources">
              {content.unesco.map((u) => (
                <li key={u.id}><b>{l(u.name)}</b> — {u.inscribed.join(', ')}{u.url && <> · <a href={u.url} target="_blank" rel="noopener noreferrer">whc.unesco.org <Icon name="external" size={13} /></a></>}{u.text && <span className="sources__meta"> — {l(u.text)}</span>}</li>
              ))}
            </ul>
          </>
        )}
      </section>
    </article>
  );
}
