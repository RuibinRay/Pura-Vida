// Shared vocabulary of the map page: the kind groups behind the filter chips, which landmarks show at each zoom
// level, the guided tour's stops, and which places are illustrated by one of the author's plates.
import type { Landmark, LandmarkKind } from '../content/types';
import { unproject } from './relief.js';

/** Isla del Coco is drawn enlarged in an inset at the south-west of the model; its places are shown there too. */
export const COCO_INSET = { scale: 7, cx: -205, cz: 165, half: 30 };
const COCO_LANDMARKS = new Set(['area-isla-del-coco', 'puntarenas-isla-del-coco']);
export const isCocoPlace = (id: string) => COCO_LANDMARKS.has(id);

/** The coordinates at which a landmark is drawn: real ones, except the Coco places, which sit in the inset. */
export function displayLonLat(l: Pick<Landmark, 'id' | 'lon' | 'lat'>): [number, number] {
  if (COCO_LANDMARKS.has(l.id)) { const [lon, lat] = unproject(COCO_INSET.cx, COCO_INSET.cz - 4); return [lon, lat]; }
  return [l.lon, l.lat];
}


export type KindFilter = 'all' | 'volcanoes' | 'parks' | 'water' | 'culture';

export const KIND_GROUPS: Record<Exclude<KindFilter, 'all'>, LandmarkKind[]> = {
  volcanoes: ['volcano', 'mountain'],
  parks: ['park', 'reserve', 'refuge', 'wetland'],
  water: ['beach', 'waterfall', 'river', 'island'],
  culture: ['city', 'town', 'capital', 'province-capital', 'museum', 'building', 'monument'],
};

export const FILTERS: KindFilter[] = ['all', 'volcanoes', 'parks', 'water', 'culture'];

export function groupOf(kind: LandmarkKind): Exclude<KindFilter, 'all'> {
  for (const [g, kinds] of Object.entries(KIND_GROUPS) as [Exclude<KindFilter, 'all'>, LandmarkKind[]][]) if (kinds.includes(kind)) return g;
  return 'culture';
}

export function matchesFilter(l: Landmark, filter: KindFilter) {
  return filter === 'all' || KIND_GROUPS[filter].includes(l.kind);
}

/** Density rule for the markers: at the whole-country view only the big names, more as the camera comes closer;
 *  a chosen filter shows everything of its kind at every zoom. */
export function showAtLevel(l: Landmark, filter: KindFilter, level: 'far' | 'mid' | 'near'): boolean {
  if (!matchesFilter(l, filter)) return false;
  if (filter !== 'all' || level === 'near') return true;
  const k = l.kind;
  if (level === 'far') return k === 'volcano' || k === 'park' || k === 'capital' || k === 'island';
  // mid
  return k !== 'town' && k !== 'building' && k !== 'museum' && k !== 'city';
}

/** The guided tour: a loop around the country, one card per stop. */
export const TOUR_STOPS: string[] = [
  'city-san-jose',
  'peak-poas',
  'alajuela-catarata-la-paz',
  'peak-arenal',
  'area-tenorio',
  'area-santa-rosa',
  'area-monteverde',
  'peak-irazu',
  'area-manuel-antonio',
  'area-marino-ballena',
  'area-corcovado',
  'area-la-amistad',
  'area-cahuita',
  'area-tortuguero',
  'area-isla-del-coco',
];

/** Places that one of the author's illustrated plates shows: the picture card uses the plate instead of a drawing. */
export const PLATE_FOR: Record<string, { plate: string; focal?: [number, number] }> = {
  'area-monteverde': { plate: 'monteverde' },
  'puntarenas-monteverde': { plate: 'monteverde' },
  // the Río Celeste pool plate of the first walk lives on here (the walk's stop now shows the waterfall plate)
  'area-tenorio': { plate: 'rio-celeste-pool' },
  'peak-tenorio': { plate: 'rio-celeste-pool' },
  'peak-arenal': { plate: 'arenal' },
  'area-arenal': { plate: 'arenal' },
  'alajuela-volcan-arenal': { plate: 'arenal' },
  'peak-chirripo': { plate: 'chirripo' },
  'area-chirripo': { plate: 'chirripo' },
  'cartago-basilica-nuestra-senora-de-los-angeles': { plate: 'cartago', focal: [0.6, 0.55] },
  'cartago-cartago-city': { plate: 'cartago', focal: [0.6, 0.55] },
  'city-cartago': { plate: 'cartago', focal: [0.6, 0.55] },
  'heredia-heredia-city': { plate: 'coffee' },
  'city-heredia': { plate: 'coffee' },
  'heredia-barva': { plate: 'coffee' },
  'heredia-volcan-barva': { plate: 'coffee', focal: [0.43, 0.2] },
  'peak-barva': { plate: 'coffee', focal: [0.43, 0.2] },
  'peak-irazu': { plate: 'irazu' },
  'area-irazu': { plate: 'irazu' },
  'cartago-volcan-irazu': { plate: 'irazu' },
  'area-corcovado': { plate: 'corcovado' },
  'area-tortuguero': { plate: 'tortuguero' },
  'limon-tortuguero-village': { plate: 'tortuguero' },
  'area-manuel-antonio': { plate: 'manuel-antonio' },
  'puntarenas-quepos': { plate: 'manuel-antonio-sunset' },
  'area-santa-rosa': { plate: 'guanacaste' },
  'area-guanacaste': { plate: 'guanacaste' },
  'area-braulio-carrillo': { plate: 'forest' },
  'puntarenas-jaco-garabito': { plate: 'beach' },
};

export const MARKER_COLORS: Record<string, string> = {
  volcano: '#b23a2f',
  mountain: '#6b5b4a',
  park: '#1f5a3a',
  reserve: '#3e8a52',
  refuge: '#3e8a52',
  wetland: '#2cb1a6',
  monument: '#8e4a9e',
  island: '#2a7fa1',
  beach: '#e0a526',
  waterfall: '#2cb1a6',
  river: '#2a7fa1',
  museum: '#8e4a9e',
  building: '#8c5a32',
  capital: '#1d2b22',
  'province-capital': '#1d2b22',
  city: '#1d2b22',
  town: '#5a6358',
};

export function landmarkName(l: Landmark, lang: 'en' | 'es' | 'zh'): string {
  return typeof l.name === 'string' ? l.name : l.name[lang] || l.name.en;
}
