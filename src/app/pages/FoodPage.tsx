import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from '../../ui/Link';
import { useT, pickLang } from '../../i18n';
import { useContent } from '../../content';
import { usePageTitle } from '../usePageTitle';
import { FoodEntry } from '../../ui/FoodEntry';
import { DishPhoto, FoodPicture, PhotoCredit } from '../../ui/DishPhoto';
import { FOOD_PHOTOS } from '../../content/foodPhotos';
import { IngredientIcon, ingredientIconFor } from '../../art/food/ingredients';
import { FOOD_PLACES } from '../../content/foodPlaces';
import { landmarkName } from '../../map/explore';
import { Icon } from '../../ui/Icon';
import { StatusTag } from '../../ui/Sources';
import { useInView } from '../../ui/useInView';
import type { Food } from '../../content/types';

/** The dish on a wooden board with its typical ingredients gathering round it as the row comes into view. */
function DishStage({ food }: { food: Food }) {
  const { t, l } = useT();
  const [ref, seen] = useInView<HTMLDivElement>();
  const icons = useMemo(() => {
    const out: { icon: string; name: string }[] = [];
    for (const ing of food.ingredients ?? []) {
      const icon = ingredientIconFor(ing.en);
      if (icon && !out.some((o) => o.icon === icon)) out.push({ icon, name: l(ing) });
    }
    return out.slice(0, 9);
  }, [food, l]);
  return (
    <div ref={ref} className={'dish-stage' + (seen ? ' is-in' : '')}>
      <div className="dish-stage__plate"><DishPhoto id={food.id} size="100%" sizes="(min-width: 900px) 230px, 60vw" title={l(food.name)} /></div>
      {icons.length > 0 && (
        <ul className="dish-stage__ring" aria-label={t('food.ringLabel')}>
          {icons.map((o, i) => (
            <li key={o.icon} style={{ ['--a' as string]: `${-90 + (i * 360) / icons.length}deg`, ['--i' as string]: i }} title={o.name}>
              <IngredientIcon name={o.icon} size={34} />
              <span className="visually-hidden">{o.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The preparation, one sentence a step. The sentences are the sourced text, unchanged; only the layout is new. */
function PrepSteps({ food }: { food: Food }) {
  const { t, l } = useT();
  const text = l(food.preparation);
  const steps = useMemo(() => text.split(/(?<=[.!?。])\s*/).map((s) => s.trim()).filter((s) => s.length > 3), [text]);
  if (steps.length < 2) return null;
  return (
    <section className="prep" aria-labelledby={'prep-' + food.id}>
      <h3 id={'prep-' + food.id} className="h-small">{t('food.steps')} {food.preparation?.status && food.preparation.status !== 'confirmed' && <StatusTag status={food.preparation.status} />}</h3>
      <ol className="prep-steps">
        {steps.map((s, i) => (<li key={i}><span className="prep-steps__n tnum" aria-hidden="true">{i + 1}</span><span>{s}</span></li>))}
      </ol>
    </section>
  );
}

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
                <DishPhoto id={f.id} size={84} eager />
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
        const extra = f.id + '-ingredients';
        return (
          <div key={f.id} className="food-row">
            <aside className="food-row__side">
              <DishStage food={f} />
              <PhotoCredit id={f.id} />
              {FOOD_PHOTOS[extra] && (
                <figure className="food-extra">
                  <FoodPicture id={extra} alt={t('food.intoPot')} />
                  <figcaption>{t('food.intoPot')}<PhotoCredit id={extra} /></figcaption>
                </figure>
              )}
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
            <div className="food-row__main">
              <FoodEntry food={f} hidePreparation />
              <PrepSteps food={f} />
            </div>
          </div>
        );
      })}
      <p className="ui"><Link to="/">{t('journey.ch5.backHome')}</Link></p>
    </article>
  );
}
