import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from '../../ui/Link';
import { useT, pickLang } from '../../i18n';
import { useContent } from '../../content';
import { usePageTitle } from '../usePageTitle';
import { FoodEntry } from '../../ui/FoodEntry';
import { DishCard } from '../../art/food/DishCard';
import { FOOD_PLACES } from '../../content/foodPlaces';
import { landmarkName } from '../../map/explore';
import { Icon } from '../../ui/Icon';

export function FoodPage() {
  const { t, l, lang } = useT();
  usePageTitle(t('food.title'));
  const content = useContent();
  const [params] = useSearchParams();
  const focus = params.get('focus');
  const byId = useMemo(() => new Map((content?.landmarks ?? []).map((x) => [x.id, x])), [content]);
  useEffect(() => {
    if (!content || !focus) return;
    document.getElementById(focus)?.scrollIntoView({ block: 'start' });
  }, [content, focus]);
  return (
    <article className="page container page--food">
      <header className="page__head page__head--nature page__head--food">
        <p className="eyebrow">{t('nav.culture')} · {t('nav.food')}</p>
        <h1>{t('food.title')}</h1>
        <p className="lede">{t('food.lede')}</p>
        {content && (
          <nav className="avatar-index avatar-index--dishes ui" aria-label={t('food.index')}>
            {content.foods.map((f) => (
              <a key={f.id} href={'#' + f.id} className="avatar avatar--index avatar--dish" onClick={(e) => { e.preventDefault(); document.getElementById(f.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                <DishCard id={f.id} size={84} backdrop="none" />
                <span>{l(f.name)}</span>
              </a>
            ))}
          </nav>
        )}
        <p className="muted"><small>{t('food.note')} {t('food.pictureNote')}</small></p>
      </header>
      {!content && <p className="muted">{t('common.loading')}</p>}
      {content?.foods.map((f) => {
        const places = (FOOD_PLACES[f.id] ?? []).map((h) => ({ h, lm: byId.get(h.at) })).filter((x) => !!x.lm);
        return (
          <div key={f.id} className="food-row">
            <aside className="food-row__side">
              <div className="dish-hero dish-hero--big"><DishCard id={f.id} size="100%" title={l(f.name)} backdrop="wood" /></div>
              {places.length > 0 && (
                <div className="where ui">
                  <p className="eyebrow">{t('explore.whereEaten')}</p>
                  <ul className="where-list">
                    {places.map(({ h, lm }) => (
                      <li key={h.at}>
                        <Link to={'/explore?place=' + h.at}><Icon name="pin" /> <span><b>{landmarkName(lm!, lang)}</b><small>{pickLang(h.note, lang)}</small></span></Link>
                      </li>
                    ))}
                  </ul>
                  <Link className="btn btn--ghost btn--sm" to={'/explore?dish=' + f.id}><Icon name="bowl" /> {t('food.onMap')}</Link>
                </div>
              )}
            </aside>
            <FoodEntry food={f} />
          </div>
        );
      })}
      <p className="ui"><Link to="/">{t('journey.ch5.backHome')}</Link></p>
    </article>
  );
}
