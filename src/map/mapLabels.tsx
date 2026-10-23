// The DOM layer over the 3D map: province names, neighbour names, landmark labels, the active popover
// and the Isla del Coco inset caption. Positions come from the Projector (see overlay.tsx).
import { Anchor } from './overlay';
import { project, surfaceY, PLINTH } from './relief.js';
import { PROVINCE_COLORS, type MapData } from './geo';
import { useMap } from '../state/map';
import { useZoomLevel } from './camera';
import { visibleLandmarks, COCO_INSET } from './mapParts';
import type { Landmark } from '../content/types';
import { pickLang, type Lang, type MessageKey } from '../i18n';
import { useT } from '../i18n';

export function MapOverlay({ data, landmarks, lang }: { data: MapData; landmarks: Landmark[]; lang: Lang }) {
  const { t } = useT();
  const level = useZoomLevel((s) => s.level);
  const hovered = useMap((s) => s.hovered);
  const selected = useMap((s) => s.selected);
  const active = useMap((s) => s.activeLandmark);
  const setLandmark = useMap((s) => s.setLandmark);
  const layers = useMap((s) => s.layers);
  const kindLabel = (k: string) => t(('explore.kinds.' + k) as MessageKey);
  const countryLabels: { id: string; lon: number; lat: number; name: string }[] = data.neighbors.map((n) => ({ id: n.id, lon: n.id === 'nic' ? -85.3 : -82.0, lat: n.id === 'nic' ? 11.55 : 8.45, name: pickLang(n.name, lang).toUpperCase() }));
  const visible = visibleLandmarks(landmarks, layers, level);
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
      {visible.map((l) => {
        const [x, z] = project(l.lon, l.lat);
        const y = surfaceY(l.lon, l.lat) + 3.8;
        const isActive = active === l.id;
        const name = typeof l.name === 'string' ? l.name : pickLang(l.name, lang);
        const showLabel = layers.labels && (isActive || level === 'near' || (level === 'mid' && (l.kind === 'volcano' || l.kind === 'capital' || l.kind === 'province-capital')));
        if (!showLabel) return null;
        return (
          <Anchor key={l.id} id={'lm-' + l.id} position={[x, y, z]} interactive={isActive} className={isActive ? 'map-anchor--top' : ''}>
            {isActive ? (
              <div className="map-popover on-dark" role="dialog" aria-label={name}>
                <p className="map-popover__kind">{kindLabel(l.kind)}{l.elevationM ? ` · ${l.elevationM.toLocaleString(lang)} m` : ''}</p>
                <p className="map-popover__name">{name}</p>
                {l.text && <p className="map-popover__text">{pickLang(l.text, lang)}</p>}
                <button type="button" tabIndex={-1} className="btn btn--ghost btn--sm" onClick={() => setLandmark(null)} aria-label={t('common.close')}>×</button>
              </div>
            ) : (
              <span className="map-label map-label--place">{name}</span>
            )}
          </Anchor>
        );
      })}
      <Anchor id="coco-label" position={[COCO_INSET.cx, 0.3, COCO_INSET.cz + COCO_INSET.half + 7]}>
        <span className="map-label map-label--inset">{lang === 'es' ? 'Isla del Coco · ampliada ×7' : lang === 'zh' ? '科科岛 · 放大 7 倍' : 'Isla del Coco · enlarged ×7'}</span>
      </Anchor>
    </>
  );
}
