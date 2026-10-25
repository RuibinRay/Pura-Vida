// The DOM layer over the 3D map: province names, neighbour names, landmark labels, the active popover with its
// picture, the Isla del Coco inset caption, and the sprites of the wildlife and food layers (cartoon animals and
// dishes pinned to the places where the sources put them). Positions come from the Projector (see overlay.tsx).
import { Anchor } from './overlay';
import { project, surfaceY, PLINTH } from './relief.js';
import { PROVINCE_COLORS, type MapData } from './geo';
import { useMap } from '../state/map';
import { useZoomLevel } from './camera';
import { visibleLandmarks } from './mapParts';
import { COCO_INSET, displayLonLat, isCocoPlace, landmarkName } from './explore';
import type { Landmark } from '../content/types';
import { pickLang, type Lang, type MessageKey } from '../i18n';
import { useT } from '../i18n';
import { AnimalSvg } from '../art/animals';
import { DishCard } from '../art/food/DishCard';
import { PlacePicture } from '../ui/PlacePicture';
import { useContent } from '../content';
import { spritePositions, SPRITE_PX } from './sprites';

export function MapOverlay({ data, landmarks, lang }: { data: MapData; landmarks: Landmark[]; lang: Lang }) {
  const { t, l } = useT();
  const level = useZoomLevel((s) => s.level);
  const hovered = useMap((s) => s.hovered);
  const selected = useMap((s) => s.selected);
  const active = useMap((s) => s.activeLandmark);
  const setLandmark = useMap((s) => s.setLandmark);
  const layers = useMap((s) => s.layers);
  const filter = useMap((s) => s.filter);
  const showWildlife = useMap((s) => s.showWildlife);
  const showFood = useMap((s) => s.showFood);
  const activeAnimal = useMap((s) => s.activeAnimal);
  const setAnimal = useMap((s) => s.setAnimal);
  const activeFood = useMap((s) => s.activeFood);
  const setFood = useMap((s) => s.setFood);
  const content = useContent();
  const kindLabel = (k: string) => t(('explore.kinds.' + k) as MessageKey);
  const countryLabels: { id: string; lon: number; lat: number; name: string }[] = data.neighbors.map((n) => ({ id: n.id, lon: n.id === 'nic' ? -85.3 : -82.0, lat: n.id === 'nic' ? 11.55 : 8.45, name: pickLang(n.name, lang).toUpperCase() }));
  const visible = visibleLandmarks(landmarks, filter, level, active);
  const sprites = spritePositions(landmarks, { wildlife: showWildlife, food: showFood }, level === 'far' ? 1 : Infinity);
  const px = SPRITE_PX[level];
  const speciesName = (id: string) => { const sp = content?.species.find((s) => s.id === id); return sp ? l(sp.commonNames) : id; };
  const dishName = (id: string) => { const f = content?.foods.find((s) => s.id === id); return f ? l(f.name) : id; };
  return (
    <>
      {countryLabels.map((c) => { const [x, z] = project(c.lon, c.lat); return (
        <Anchor key={c.id} id={'country-' + c.id} position={[x, PLINTH, z]}><span className="map-label map-label--country">{c.name}</span></Anchor>
      ); })}
      {layers.labels && data.provinces.map((p) => {
        const [x, z] = project(p.centroid[0], p.centroid[1]);
        const y = surfaceY(p.centroid[0], p.centroid[1]) + 4;
        const isActive = hovered === p.id || selected === p.id;
        return (
          <Anchor key={p.id} id={'prov-' + p.id} position={[x, y, z]}>
            <span className={'map-label map-label--province' + (isActive ? ' is-active' : '') + (level === 'near' && !isActive ? ' is-faint' : '')} style={{ ['--swatch' as string]: PROVINCE_COLORS[p.id] }}>{pickLang(p.name, lang)}</span>
          </Anchor>
        );
      })}
      {visible.map((lm) => {
        const [lon, lat] = displayLonLat(lm);
        const [x, z] = project(lon, lat);
        const y = surfaceY(lon, lat) + 3.8 + (isCocoPlace(lm.id) ? 1.8 : 0);
        const isActive = active === lm.id;
        const name = landmarkName(lm, lang);
        const showLabel = layers.labels && (isActive || level === 'near' || filter !== 'all' || (level === 'mid' && (lm.kind === 'volcano' || lm.kind === 'capital' || lm.kind === 'province-capital')));
        if (!showLabel) return null;
        return (
          <Anchor key={lm.id} id={'lm-' + lm.id} position={[x, y, z]} interactive={isActive} className={isActive ? 'map-anchor--top' : ''}>
            {isActive ? (
              <div className="map-popover on-dark" role="dialog" aria-label={name}>
                <PlacePicture landmark={lm} size="thumb" className="map-popover__pic" />
                <p className="map-popover__kind">{kindLabel(lm.kind)}{lm.elevationM ? ` · ${lm.elevationM.toLocaleString(lang)} m` : ''}</p>
                <p className="map-popover__name">{name}</p>
                {lm.text && <p className="map-popover__text">{pickLang(lm.text, lang)}</p>}
                <button type="button" tabIndex={-1} className="btn btn--ghost btn--sm" onClick={() => setLandmark(null)} aria-label={t('common.close')}>×</button>
              </div>
            ) : (
              <span className="map-label map-label--place">{name}</span>
            )}
          </Anchor>
        );
      })}
      {sprites.map((s) => {
        const [lon, lat] = displayLonLat(s.lm);
        const [x0, z0] = project(lon, lat);
        const x = x0 + s.dx, z = z0 + s.dz;
        const y = surfaceY(lon, lat) + 2.2 + (isCocoPlace(s.lm.id) ? 1.8 : 0);
        const isOn = s.kind === 'animal' ? activeAnimal === s.id : activeFood === s.id;
        const name = s.kind === 'animal' ? speciesName(s.id) : dishName(s.id);
        return (
          <Anchor key={s.key} id={'sprite-' + s.key} position={[x, y, z]} interactive className={'map-anchor--sprite' + (isOn ? ' map-anchor--top' : '')}>
            <button type="button" tabIndex={-1} className={'map-sprite map-sprite--' + s.kind + (isOn ? ' is-on' : '')} style={{ ['--px' as string]: px + 'px' }} onClick={(e) => { e.stopPropagation(); if (s.kind === 'animal') { if (s.lm.province) useMap.getState().select(s.lm.province, false); setAnimal(isOn ? null : s.id); } else setFood(isOn ? null : s.id); }} aria-label={name + ' · ' + landmarkName(s.lm, lang)} title={name}>
              {s.kind === 'animal' ? <AnimalSvg species={s.id} size={40} /> : <DishCard id={s.id} size={44} backdrop="none" />}
            </button>
          </Anchor>
        );
      })}
      <Anchor id="coco-label" position={[COCO_INSET.cx, 0.3, COCO_INSET.cz + COCO_INSET.half + 7]}>
        <span className="map-label map-label--inset">{lang === 'es' ? 'Isla del Coco · ampliada ×7' : lang === 'zh' ? '科科岛 · 放大 7 倍' : 'Isla del Coco · enlarged ×7'}</span>
      </Anchor>
    </>
  );
}
