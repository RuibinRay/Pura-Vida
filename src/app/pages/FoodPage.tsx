import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useT } from '../../i18n';
import { useContent } from '../../content';
import { usePageTitle } from '../usePageTitle';
import { FoodEntry } from '../../ui/FoodEntry';
import { DISH_ART } from '../../journey/dishes';

export function FoodPage() {
  const { t, l } = useT();
  usePageTitle(t('food.title'));
  const content = useContent();
  const [params] = useSearchParams();
  const focus = params.get('focus');
  useEffect(() => {
    if (!content || !focus) return;
    document.getElementById(focus)?.scrollIntoView({ block: 'start' });
  }, [content, focus]);
  return (
    <article className="page container">
      <header className="page__head">
        <p className="eyebrow">{t('nav.culture')} · {t('nav.food')}</p>
        <h1>{t('food.title')}</h1>
        <p className="lede">{t('food.lede')}</p>
        {content && (
          <nav className="species-index ui" aria-label={t('food.index')}>
            {content.foods.map((f) => (
              <a key={f.id} href={'#' + f.id} onClick={(e) => { e.preventDefault(); document.getElementById(f.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{l(f.name)}</a>
            ))}
          </nav>
        )}
        <p className="muted"><small>{t('food.note')}</small></p>
      </header>
      {!content && <p className="muted">{t('common.loading')}</p>}
      {content?.foods.map((f) => {
        const Art = DISH_ART[f.id];
        return (
          <div key={f.id} className="food-row">
            {Art && (
              <svg className="food-row__art" viewBox="-260 -200 520 400" aria-hidden="true" focusable="false">
                <Art />
              </svg>
            )}
            <FoodEntry food={f} />
          </div>
        );
      })}
      <p className="ui"><Link to="/">{t('journey.ch5.backHome')}</Link></p>
    </article>
  );
}
