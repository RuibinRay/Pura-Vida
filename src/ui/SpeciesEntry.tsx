// One species as a journal entry: name, scientific name, status tags, the sourced facts and the sources.
// Used by the Wildlife page and by the homepage's wildlife panel.
import { useT } from '../i18n';
import type { Species } from '../content/types';
import { SourceList, StatusTag, dedupeSources } from './Sources';

export function SpeciesEntry({ sp, heading = 'h2', compact }: { sp: Species; heading?: 'h2' | 'h3'; compact?: boolean }) {
  const { t, l, lang } = useT();
  const H = heading;
  const row = (label: string, v?: { en: string; es?: string; zh?: string } | null) => (v && v.en ? (<div><dt>{label}</dt><dd>{l(v)}</dd></div>) : null);
  const all = dedupeSources([...(sp.sources ?? []), ...(sp.facts ?? []).flatMap((f) => f.sources ?? []), ...(sp.nationalSymbol?.sources ?? [])]);
  return (
    <section id={sp.id} className={'species chapter-part' + (compact ? ' species--compact' : '')} aria-labelledby={'sp-' + sp.id}>
      <header className="species__head">
        <H id={'sp-' + sp.id}>{l(sp.commonNames)}</H>
        <p className="species__sci"><i>{sp.scientific}</i>{sp.family ? <span className="muted"> · {sp.family}</span> : null}</p>
        <p className="species__tags ui">
          {sp.iucn?.category && <span className={'tag tag--iucn-' + sp.iucn.category.toLowerCase()}>{t('wildlife.iucn')}: <b>{sp.iucn.category}</b>{sp.iucn.year ? ` (${t('wildlife.assessed', { year: sp.iucn.year })})` : ''}</span>}
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
      <SourceList sources={all} compact={compact} />
    </section>
  );
}
