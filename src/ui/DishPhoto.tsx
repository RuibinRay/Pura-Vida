// A dish as it is served: the photograph of its plate, cut out so it can sit on any table and move on its own. Where
// the photograph crops its plate, the food is set into a drawn rim; where there is no photograph, the drawn sticker.
import type { CSSProperties } from 'react';
import { FOOD_PHOTOS, foodPhotoSrc, foodPhotoSrcSet } from '../content/foodPhotos';
import { DishCard } from '../art/food/DishCard';
import { useT } from '../i18n';

export function DishPhoto({ id, size, sizes, title, className, eager, style }: { id: string; /** CSS px, or any CSS length */ size: number | string; /** the `sizes` attribute when `size` is not a pixel count */ sizes?: string; title?: string; className?: string; eager?: boolean; style?: CSSProperties }) {
  const p = FOOD_PHOTOS[id];
  if (!p || p.plate === 'photo') return <DishCard id={id} size={size} title={title} backdrop="none" />;
  const px = typeof size === 'number' ? size : undefined;
  const mid = p.widths[Math.min(p.widths.length - 1, 1)];
  return (
    <span className={`dishphoto dishphoto--${p.plate}` + (className ? ' ' + className : '')} style={{ width: size, ...style }}>
      {(p.plate === 'drawn' || p.plate === 'drawn-bowl') && <span className="dishphoto__rim" aria-hidden="true" />}
      <img src={foodPhotoSrc(id, px ? (p.widths.find((w) => w >= px * 2) ?? p.widths[p.widths.length - 1]) : mid)} srcSet={px ? undefined : foodPhotoSrcSet(id)} sizes={px ? undefined : sizes ?? '(min-width: 900px) 320px, 80vw'} width={px ?? 720} height={px ?? 720} alt={title ?? ''} aria-hidden={title ? undefined : true} loading={eager ? 'eager' : 'lazy'} decoding="async" draggable={false} />
    </span>
  );
}

/** Who took the photograph and under which licence — required by CC BY and CC BY-SA, and simply fair. */
export function PhotoCredit({ id, className }: { id: string; className?: string }) {
  const { t } = useT();
  const p = FOOD_PHOTOS[id];
  if (!p) return null;
  return (
    <p className={'photo-credit ui' + (className ? ' ' + className : '')}>
      <small>
        {t('food.photoBy')} <a href={p.page} rel="noopener">{p.author || 'Wikimedia Commons'}</a>
        {' · '}{p.licenceUrl ? <a href={p.licenceUrl} rel="noopener license">{p.licence}</a> : p.licence}
        {' · Wikimedia Commons'}{p.plate !== 'photo' && <> · {t('food.photoCut')}</>}
      </small>
    </p>
  );
}

/** An uncut companion photograph (what goes into the pot). */
export function FoodPicture({ id, alt, className }: { id: string; alt: string; className?: string }) {
  const p = FOOD_PHOTOS[id];
  if (!p) return null;
  const w = p.widths[p.widths.length - 1];
  return <img className={className} src={foodPhotoSrc(id, w)} srcSet={foodPhotoSrcSet(id)} sizes="(min-width: 900px) 320px, 90vw" width={w} height={Math.round(w / (p.aspect ?? 1.4))} alt={alt} loading="lazy" decoding="async" />;
}
