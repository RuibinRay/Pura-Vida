import { useT } from '../../i18n';
import { useContent } from '../../content';
import { SourceList, StatusTag, dedupeSources } from '../../ui/Sources';
import { usePageTitle } from '../usePageTitle';
import { Link } from 'react-router-dom';

export function WildlifePage() {
  const { t, l, lang } = useT();
  usePageTitle(t('wildlife.title'));
  const content = useContent();
  return (
    <article className="page container">
      <header className="page__head">
        <p className="eyebrow">{t('nav.wildlife')}</p>
        <h1>{t('wildlife.title')}</h1>
        <p className="lede">{t('wildlife.lede')}</p>
      </header>
      {!content && <p className="muted">{t('common.loading')}</p>}
      {content?.species.map((sp) => {
        const row = (label: string, v?: { en: string; es?: string; zh?: string } | null) => (v && v.en ? (<div><dt>{label}</dt><dd>{l(v)}</dd></div>) : null);
        const all = dedupeSources([...(sp.sources ?? []), ...(sp.facts ?? []).flatMap((f) => f.sources ?? []), ...(sp.nationalSymbol?.sources ?? [])]);
        return (
          <section key={sp.id} className="species chapter-part" aria-labelledby={'sp-' + sp.id}>
            <header className="species__head">
              <h2 id={'sp-' + sp.id}>{l(sp.commonNames)}</h2>
              <p className="species__sci"><i>{sp.scientific}</i>{sp.family ? <span className="muted"> · {sp.family}</span> : null}</p>
              <p className="species__tags ui">
                {sp.iucn?.category && <span className="tag">{t('wildlife.iucn')}: <b>{sp.iucn.category}</b>{sp.iucn.year ? ` (${t('wildlife.assessed', { year: sp.iucn.year })})` : ''}</span>}
                {sp.nationalSymbol?.isSymbol ? <span className="tag tag--gold">{t('wildlife.nationalSymbol')}{sp.nationalSymbol.year ? ` · ${t('wildlife.sinceYear', { year: sp.nationalSymbol.year })}` : ''}</span> : <span className="tag tag--muted">{t('wildlife.notSymbol')}</span>}
              </p>
            </header>
            <dl className="species__facts">
              {row(t('wildlife.habitat'), sp.habitat)}
              {row(t('wildlife.distribution'), sp.distributionCR)}
              {row(t('wildlife.diet'), sp.diet)}
              {row(t('wildlife.role'), sp.ecologicalRole)}
              {row(t('wildlife.behaviour'), sp.behaviour)}
              {sp.size && row(lang === 'es' ? 'Tamaño' : lang === 'zh' ? '体型' : 'Size', sp.size)}
            </dl>
            {sp.facts && sp.facts.length > 0 && (
              <>
                <h3 className="h-small">{t('wildlife.facts')}</h3>
                <ul className="facts-list">
                  {sp.facts.map((f, i) => (
                    <li key={i}>{l(f)} {f.status && <StatusTag status={f.status} />}</li>
                  ))}
                </ul>
              </>
            )}
            <h3 className="h-small">{t('wildlife.sources')}</h3>
            <SourceList sources={all} />
          </section>
        );
      })}
      <p className="ui"><Link to="/explore">{t('nav.explore')}</Link></p>
    </article>
  );
}
