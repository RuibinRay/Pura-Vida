// One dish as a journal entry: what it is, where it is eaten, ingredients, how it is made, its place in daily
// life, its history, heritage status and the sources. Used by the Food page and the homepage's table panel.
import { useT } from '../i18n';
import type { Food, Source } from '../content/types';
import { SourceList, StatusTag, dedupeSources } from './Sources';

export function FoodEntry({ food, heading = 'h2', compact }: { food: Food; heading?: 'h2' | 'h3'; compact?: boolean }) {
  const { t, l } = useT();
  const H = heading;
  const blocks: { key: 'description' | 'region' | 'preparation' | 'culture' | 'history'; label: string }[] = [
    { key: 'description', label: t('food.what') },
    { key: 'region', label: t('food.where') },
    { key: 'preparation', label: t('food.how') },
    { key: 'culture', label: t('food.when') },
    { key: 'history', label: t('food.history') },
  ];
  const all = dedupeSources([
    ...(food.sources ?? []),
    ...blocks.flatMap((b) => food[b.key]?.sources ?? []),
    ...(food.facts ?? []).flatMap((f) => f.sources ?? []),
    ...(food.heritage?.sources ?? []),
  ] as Source[]);
  return (
    <section id={food.id} className={'food chapter-part' + (compact ? ' food--compact' : '')} aria-labelledby={'food-' + food.id}>
      <header className="species__head">
        <H id={'food-' + food.id}>{l(food.name)}</H>
        {food.kind && <p className="species__sci">{l(food.kind)}</p>}
        {food.heritage?.declared && (
          <p className="species__tags ui"><span className="tag tag--gold">{t('food.heritage')}{food.heritage.year ? ` · ${food.heritage.year}` : ''}</span></p>
        )}
      </header>
      <dl className="species__facts">
        {blocks.map((b) => {
          const v = food[b.key];
          if (!v || !v.en) return null;
          return (
            <div key={b.key}>
              <dt>{b.label}</dt>
              <dd>{l(v)} {v.status && v.status !== 'confirmed' && <StatusTag status={v.status} />}</dd>
            </div>
          );
        })}
        {food.ingredients && food.ingredients.length > 0 && (
          <div>
            <dt>{t('food.ingredients')}</dt>
            <dd>
              <ul className="ingredients">
                {food.ingredients.map((ing, i) => (
                  <li key={i}>{l(ing)}{ing.optional ? <small className="muted"> · {t('food.optional')}</small> : null}</li>
                ))}
              </ul>
              {food.ingredientsNote?.en && <p className="muted"><small>{l(food.ingredientsNote)}</small></p>}
            </dd>
          </div>
        )}
        {food.heritage?.note?.en && (
          <div>
            <dt>{t('food.heritageLabel')}</dt>
            <dd>{l(food.heritage.note)} {food.heritage.status && food.heritage.status !== 'confirmed' && <StatusTag status={food.heritage.status} />}</dd>
          </div>
        )}
      </dl>
      {food.facts && food.facts.length > 0 && (
        <>
          <h3 className="h-small">{t('wildlife.facts')}</h3>
          <ul className="facts-list">
            {food.facts.map((f, i) => (
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
