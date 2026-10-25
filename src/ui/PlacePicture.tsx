// The picture of a place: one of the author's illustrated plates when the place is on the walk, otherwise the
// place's own drawn postcard (src/art/places). Both are illustrations in the spirit of the place, never
// photographs of it, and the caption chip says which it is.
import { useT } from '../i18n';
import { LayerImg, PLATES } from '../journey/Plate';
import { LandmarkArt } from '../art/places/LandmarkArt';
import { PLATE_FOR } from '../map/explore';
import type { Landmark } from '../content/types';

export function hasPlate(id: string) {
  const p = PLATE_FOR[id];
  return !!p && !!PLATES[p.plate];
}

export function PlacePicture({ landmark, size = 'card', title, className, sizes }: { landmark: Pick<Landmark, 'id' | 'kind' | 'province'>; size?: 'thumb' | 'card' | 'hero'; title?: string; className?: string; sizes?: string }) {
  const { t } = useT();
  const plate = PLATE_FOR[landmark.id];
  const cls = 'place-pic place-pic--' + size + (className ? ' ' + className : '');
  if (plate && PLATES[plate.plate]) {
    const m = PLATES[plate.plate];
    const fx = plate.focal?.[0] ?? m.focal.x;
    const fy = plate.focal?.[1] ?? m.focal.y;
    return (
      <span className={cls + ' place-pic--plate'}>
        <LayerImg plate={plate.plate} name="base" sizes={sizes || (size === 'hero' ? '(min-width: 1100px) 1100px, 100vw' : size === 'card' ? '(min-width: 760px) 360px, 100vw' : '160px')} alt={title ?? ''} style={{ objectPosition: `${(fx * 100).toFixed(1)}% ${(fy * 100).toFixed(1)}%` }} />
        {size !== 'thumb' && <span className="place-pic__chip ui">{t('explore.pictureIsPlate')}</span>}
      </span>
    );
  }
  return (
    <span className={cls + ' place-pic--art'}>
      <LandmarkArt id={landmark.id} kind={landmark.kind} province={landmark.province} title={title} />
      {size !== 'thumb' && <span className="place-pic__chip ui">{t('explore.pictureIsDrawing')}</span>}
    </span>
  );
}
