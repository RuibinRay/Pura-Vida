// Scene specs for the place postcards. A spec is a small recipe the renderer in LandmarkArt.tsx turns into
// layered parts. Hand-tuned entries live in SCENES; everything else is generated from kind + province + id hash.

export type SceneTime = 'day' | 'dawn' | 'dusk' | 'night' | 'misty';
export type SceneBase = 'volcano' | 'cloud-forest' | 'rainforest' | 'dry-forest' | 'beach' | 'canal' | 'wetland' | 'river' | 'waterfall' | 'city' | 'town' | 'mountain' | 'island' | 'reef' | 'cave' | 'highland';
/** a built or living thing placed in the middle ground */
export type SceneSubject =
  | 'church' | 'basilica' | 'theatre' | 'museum' | 'castle' | 'fortin' | 'ruins' | 'lighthouse' | 'oxcart' | 'plane' | 'woodhall'
  | 'clocktower' | 'university' | 'station' | 'topiary' | 'mounds' | 'pier' | 'whale' | 'turtle' | 'boat' | 'canoe' | 'bridge'
  | 'suspension' | 'heron' | 'reef' | 'cave' | 'sailboat' | 'town' | 'casona' | 'garden';

export interface SceneSpec {
  time?: SceneTime;
  base: SceneBase;
  subject?: SceneSubject;
  /** secondary subjects */
  extras?: SceneSubject[];
  /** volcano: cone geometry (canvas units) */
  cone?: { x?: number; w?: number; h?: number; flat?: number; lake?: string; steam?: boolean; color?: string; second?: { x: number; w: number; h: number; lake?: string; steam?: boolean } };
  /** province flavour for town/city skylines and hills */
  province?: string | null;
  /** a volcano silhouette behind a town (name of a preset in LandmarkArt) */
  backdrop?: 'irazu' | 'poas' | 'arenal' | 'barva' | 'talamanca' | 'guanacaste' | 'turrialba' | 'none';
  /** override water colour */
  water?: string;
  palms?: number;
  rain?: boolean;
  birds?: boolean;
  fringe?: 'left' | 'right' | 'both' | 'none';
  sun?: boolean;
  seed?: number;
  /** number of haze ridge layers behind the subject */
  depth?: number;
}

export const SCENES: Record<string, SceneSpec> = {
  // ---- peaks ----
  'peak-chirripo': { base: 'highland', time: 'dawn', depth: 3, birds: true, fringe: 'left', seed: 11 },
  'peak-cerro-de-la-muerte': { base: 'highland', time: 'misty', depth: 3, fringe: 'right', seed: 12 },
  'peak-irazu': { base: 'volcano', time: 'day', cone: { x: 150, w: 300, h: 70, flat: 0.34, lake: '#7bc8a0', color: '#6f6a62', second: { x: 236, w: 110, h: 40, lake: '#c9c27a' } }, fringe: 'left', seed: 13 },
  'peak-turrialba': { base: 'volcano', time: 'dawn', cone: { x: 170, w: 280, h: 86, flat: 0.16, steam: true, color: '#5a6a56' }, fringe: 'right', birds: true, seed: 14 },
  'peak-poas': { base: 'volcano', time: 'day', cone: { x: 160, w: 330, h: 64, flat: 0.44, lake: '#4fd0c8', steam: true, color: '#857a6a' }, fringe: 'both', seed: 15 },
  'peak-barva': { base: 'volcano', time: 'misty', cone: { x: 160, w: 260, h: 60, flat: 0.3, lake: '#5f8d83', color: '#3f6a44' }, fringe: 'both', seed: 16 },
  'peak-arenal': { base: 'volcano', time: 'day', cone: { x: 190, w: 200, h: 110, flat: 0.06, color: '#4e5a4c', steam: true }, water: '#2a7fa1', fringe: 'left', birds: true, seed: 17 },
  'peak-chato': { base: 'volcano', time: 'day', cone: { x: 150, w: 230, h: 80, flat: 0.3, lake: '#2f8f7a', color: '#3f7a44' }, fringe: 'right', seed: 18 },
  'peak-tenorio': { base: 'river', time: 'day', water: '#4fc3e6', backdrop: 'none', cone: { x: 190, w: 240, h: 76, flat: 0.1, color: '#4f7f58' }, fringe: 'both', seed: 19 },
  'peak-miravalles': { base: 'volcano', time: 'day', cone: { x: 160, w: 260, h: 84, flat: 0.1, color: '#5f7a56', steam: true }, fringe: 'left', seed: 20 },
  'peak-rincon-de-la-vieja': { base: 'dry-forest', time: 'day', cone: { x: 170, w: 260, h: 72, flat: 0.14, steam: true, color: '#7a6a58' }, fringe: 'right', seed: 21 },
  'peak-orosi': { base: 'dry-forest', time: 'dusk', cone: { x: 150, w: 220, h: 70, flat: 0.1, color: '#5a6a4e' }, fringe: 'left', birds: true, seed: 22 },
  // ---- parks ----
  'area-corcovado': { base: 'beach', time: 'day', subject: 'boat', palms: 2, depth: 2, fringe: 'both', birds: true, seed: 30 },
  'area-manuel-antonio': { base: 'beach', time: 'day', palms: 3, extras: ['sailboat'], fringe: 'left', seed: 31 },
  'area-tortuguero': { base: 'canal', time: 'misty', subject: 'canoe', rain: true, fringe: 'both', seed: 32 },
  'area-cahuita': { base: 'reef', time: 'day', palms: 2, subject: 'reef', fringe: 'right', seed: 33 },
  'area-arenal': { base: 'volcano', time: 'dawn', cone: { x: 200, w: 190, h: 106, flat: 0.06, color: '#4a5848', steam: true }, water: '#2a7fa1', fringe: 'right', seed: 34 },
  'area-poas': { base: 'volcano', time: 'misty', cone: { x: 160, w: 330, h: 60, flat: 0.44, lake: '#5ed3cb', steam: true, color: '#7f7466' }, fringe: 'left', seed: 35 },
  'area-irazu': { base: 'volcano', time: 'dawn', cone: { x: 150, w: 300, h: 72, flat: 0.34, lake: '#8fd0a2', color: '#6a645c', second: { x: 240, w: 100, h: 36, lake: '#cfc37c' } }, fringe: 'right', seed: 36 },
  'area-turrialba': { base: 'volcano', time: 'day', cone: { x: 160, w: 290, h: 86, flat: 0.16, steam: true, color: '#5f6c58' }, fringe: 'left', seed: 37 },
  'area-rincon-de-la-vieja': { base: 'dry-forest', time: 'dawn', cone: { x: 160, w: 260, h: 72, flat: 0.14, steam: true, color: '#7a6a58' }, fringe: 'left', seed: 38 },
  'area-chirripo': { base: 'highland', time: 'day', depth: 3, fringe: 'both', birds: true, seed: 39 },
  'area-braulio-carrillo': { base: 'cloud-forest', time: 'misty', depth: 3, fringe: 'both', seed: 40 },
  'area-santa-rosa': { base: 'dry-forest', time: 'day', subject: 'casona', fringe: 'left', seed: 41 },
  'area-guanacaste': { base: 'dry-forest', time: 'dusk', cone: { x: 200, w: 260, h: 70, flat: 0.12, color: '#6a6a52' }, fringe: 'right', birds: true, seed: 42 },
  'area-palo-verde': { base: 'wetland', time: 'day', subject: 'heron', extras: ['heron'], birds: true, fringe: 'right', seed: 43 },
  'area-barra-honda': { base: 'cave', time: 'day', subject: 'cave', fringe: 'left', seed: 44 },
  'area-tenorio': { base: 'river', time: 'misty', water: '#56c8e8', cone: { x: 170, w: 240, h: 70, flat: 0.1, color: '#4f7f58' }, fringe: 'both', seed: 45 },
  'area-marino-ballena': { base: 'reef', time: 'day', subject: 'whale', palms: 1, fringe: 'left', birds: true, seed: 46 },
  'area-carara': { base: 'river', time: 'day', subject: 'bridge', water: '#5a9a8a', fringe: 'both', birds: true, seed: 47 },
  'area-tapanti': { base: 'cloud-forest', time: 'misty', rain: true, water: '#5aa0b0', depth: 3, fringe: 'both', seed: 48 },
  'area-la-amistad': { base: 'mountain', time: 'dawn', depth: 4, fringe: 'left', birds: true, seed: 49 },
  'area-isla-del-coco': { base: 'island', time: 'day', extras: ['boat'], fringe: 'none', birds: true, seed: 50 },
  'area-las-baulas': { base: 'beach', time: 'dusk', subject: 'turtle', palms: 1, fringe: 'right', seed: 51 },
  'area-piedras-blancas': { base: 'rainforest', time: 'day', water: '#2cb1a6', depth: 2, fringe: 'both', seed: 52 },
  'area-juan-castro-blanco': { base: 'waterfall', time: 'misty', depth: 2, fringe: 'both', seed: 53 },
  'area-monteverde': { base: 'cloud-forest', time: 'misty', subject: 'suspension', depth: 3, fringe: 'both', seed: 54 },
  'area-cano-negro': { base: 'wetland', time: 'dawn', subject: 'heron', extras: ['canoe'], birds: true, fringe: 'left', seed: 55 },
  'area-guayabo': { base: 'rainforest', time: 'day', subject: 'mounds', fringe: 'both', seed: 56 },
  // ---- San José ----
  'san-jose-san-jose-city': { base: 'city', time: 'day', province: 'san-jose', backdrop: 'irazu', fringe: 'left', seed: 60 },
  'city-san-jose': { base: 'city', time: 'dusk', province: 'san-jose', backdrop: 'irazu', fringe: 'right', birds: true, seed: 61 },
  'san-jose-teatro-nacional': { base: 'city', time: 'day', subject: 'theatre', province: 'san-jose', backdrop: 'none', fringe: 'left', seed: 62 },
  'san-jose-museo-nacional': { base: 'city', time: 'day', subject: 'museum', province: 'san-jose', backdrop: 'none', fringe: 'right', seed: 63 },
  'san-jose-museo-oro-precolombino': { base: 'city', time: 'dusk', subject: 'station', province: 'san-jose', backdrop: 'none', fringe: 'left', seed: 64 },
  'san-jose-museo-del-jade': { base: 'city', time: 'day', subject: 'university', province: 'san-jose', backdrop: 'none', fringe: 'right', seed: 65 },
  'san-jose-museo-de-los-ninos': { base: 'city', time: 'day', subject: 'castle', province: 'san-jose', backdrop: 'none', fringe: 'left', seed: 66 },
  'san-jose-barrio-amon': { base: 'town', time: 'dawn', province: 'san-jose', backdrop: 'none', fringe: 'left', seed: 67 },
  'san-jose-cerros-de-escazu': { base: 'mountain', time: 'dusk', depth: 2, province: 'san-jose', fringe: 'right', seed: 68 },
  'san-jose-cerro-de-la-muerte': { base: 'highland', time: 'misty', depth: 3, fringe: 'left', seed: 69 },
  // ---- Cartago ----
  'cartago-basilica-nuestra-senora-de-los-angeles': { base: 'city', time: 'day', subject: 'basilica', province: 'cartago', backdrop: 'irazu', fringe: 'left', seed: 70 },
  'cartago-ruinas-de-santiago-apostol': { base: 'town', time: 'day', subject: 'ruins', province: 'cartago', backdrop: 'irazu', fringe: 'right', seed: 71 },
  'cartago-cartago-city': { base: 'town', time: 'misty', province: 'cartago', backdrop: 'irazu', fringe: 'left', seed: 72 },
  'city-cartago': { base: 'town', time: 'dawn', province: 'cartago', backdrop: 'irazu', fringe: 'right', seed: 73 },
  'cartago-volcan-irazu': { base: 'volcano', time: 'day', cone: { x: 160, w: 300, h: 70, flat: 0.34, lake: '#7bc8a0', color: '#6f6a62', second: { x: 246, w: 110, h: 40, lake: '#c9c27a' } }, fringe: 'right', seed: 74 },
  'cartago-volcan-turrialba': { base: 'volcano', time: 'dusk', cone: { x: 160, w: 280, h: 86, flat: 0.16, steam: true, color: '#5a6a56' }, fringe: 'left', seed: 75 },
  'cartago-turrialba-city': { base: 'town', time: 'day', province: 'cartago', backdrop: 'turrialba', fringe: 'left', seed: 76 },
  'cartago-valle-de-orosi': { base: 'town', time: 'day', subject: 'church', province: 'cartago', backdrop: 'talamanca', fringe: 'right', seed: 77 },
  'cartago-jardin-botanico-lankester': { base: 'rainforest', time: 'day', subject: 'garden', depth: 1, fringe: 'both', seed: 78 },
  // ---- Heredia ----
  'heredia-el-fortin': { base: 'town', time: 'day', subject: 'fortin', province: 'heredia', backdrop: 'barva', fringe: 'left', seed: 80 },
  'heredia-iglesia-inmaculada-concepcion': { base: 'town', time: 'day', subject: 'church', province: 'heredia', backdrop: 'barva', fringe: 'right', seed: 81 },
  'heredia-universidad-nacional': { base: 'city', time: 'day', subject: 'university', province: 'heredia', backdrop: 'barva', fringe: 'left', seed: 82 },
  'heredia-heredia-city': { base: 'town', time: 'dawn', province: 'heredia', backdrop: 'barva', fringe: 'right', seed: 83 },
  'city-heredia': { base: 'town', time: 'day', province: 'heredia', backdrop: 'barva', fringe: 'left', seed: 84 },
  'heredia-barva': { base: 'town', time: 'misty', province: 'heredia', backdrop: 'barva', fringe: 'right', seed: 85 },
  'heredia-volcan-barva': { base: 'volcano', time: 'misty', cone: { x: 160, w: 270, h: 60, flat: 0.3, lake: '#5f8d83', color: '#3f6a44' }, fringe: 'left', seed: 86 },
  'heredia-estacion-biologica-la-selva': { base: 'river', time: 'day', subject: 'suspension', extras: ['station'], water: '#5a8a6a', fringe: 'both', birds: true, seed: 87 },
  'heredia-puerto-viejo-de-sarapiqui': { base: 'river', time: 'day', subject: 'boat', water: '#5a8a6a', extras: ['town'], fringe: 'left', seed: 88 },
  // ---- Alajuela ----
  'alajuela-alajuela-city': { base: 'town', time: 'day', province: 'alajuela', backdrop: 'poas', fringe: 'right', seed: 90 },
  'city-alajuela': { base: 'town', time: 'dusk', province: 'alajuela', backdrop: 'poas', fringe: 'left', seed: 91 },
  'alajuela-museo-juan-santamaria': { base: 'town', time: 'day', subject: 'museum', province: 'alajuela', backdrop: 'poas', fringe: 'left', seed: 92 },
  'alajuela-aeropuerto-juan-santamaria': { base: 'city', time: 'dusk', subject: 'plane', province: 'alajuela', backdrop: 'poas', fringe: 'none', seed: 93 },
  'alajuela-volcan-poas': { base: 'volcano', time: 'day', cone: { x: 160, w: 330, h: 64, flat: 0.44, lake: '#4fd0c8', steam: true, color: '#857a6a' }, fringe: 'right', seed: 94 },
  'alajuela-volcan-arenal': { base: 'volcano', time: 'day', cone: { x: 180, w: 200, h: 110, flat: 0.06, color: '#4e5a4c', steam: true }, water: '#2a7fa1', fringe: 'right', seed: 95 },
  'alajuela-la-fortuna': { base: 'town', time: 'day', province: 'alajuela', backdrop: 'arenal', fringe: 'left', seed: 96 },
  'alajuela-catarata-la-paz': { base: 'waterfall', time: 'day', subject: 'bridge', depth: 2, fringe: 'both', seed: 97 },
  'alajuela-zarcero': { base: 'town', time: 'day', subject: 'topiary', province: 'alajuela', backdrop: 'poas', fringe: 'none', seed: 98 },
  'alajuela-sarchi': { base: 'town', time: 'day', subject: 'oxcart', province: 'alajuela', backdrop: 'poas', fringe: 'right', seed: 99 },
  'alajuela-parque-nacional-juan-castro-blanco': { base: 'waterfall', time: 'misty', depth: 2, fringe: 'both', seed: 100 },
  'city-quesada': { base: 'town', time: 'day', province: 'alajuela', backdrop: 'arenal', fringe: 'right', seed: 101 },
  // ---- Guanacaste ----
  'guanacaste-liberia': { base: 'town', time: 'day', province: 'guanacaste', backdrop: 'guanacaste', fringe: 'left', seed: 110 },
  'city-liberia': { base: 'town', time: 'dusk', province: 'guanacaste', backdrop: 'guanacaste', fringe: 'right', seed: 111 },
  'guanacaste-rincon-de-la-vieja': { base: 'dry-forest', time: 'day', cone: { x: 160, w: 260, h: 72, flat: 0.14, steam: true, color: '#7a6a58' }, fringe: 'left', seed: 112 },
  'guanacaste-nicoya': { base: 'town', time: 'day', subject: 'church', province: 'guanacaste', backdrop: 'none', fringe: 'left', seed: 113 },
  'guanacaste-tamarindo': { base: 'beach', time: 'dusk', palms: 2, extras: ['sailboat'], fringe: 'left', birds: true, seed: 114 },
  'guanacaste-nosara-and-samara': { base: 'beach', time: 'day', palms: 2, fringe: 'right', seed: 115 },
  'guanacaste-tempisque-river': { base: 'wetland', time: 'dusk', subject: 'bridge', extras: ['heron'], water: '#7f9a8c', birds: true, fringe: 'left', seed: 116 },
  'city-canas': { base: 'town', time: 'day', province: 'guanacaste', backdrop: 'guanacaste', fringe: 'right', seed: 117 },
  'city-la-cruz': { base: 'town', time: 'dusk', province: 'guanacaste', backdrop: 'none', fringe: 'left', seed: 118 },
  // ---- Puntarenas ----
  'puntarenas-puntarenas-city': { base: 'beach', time: 'dusk', subject: 'pier', extras: ['lighthouse'], palms: 1, fringe: 'left', seed: 120 },
  'city-puntarenas': { base: 'beach', time: 'day', subject: 'pier', palms: 2, fringe: 'right', seed: 121 },
  'puntarenas-monteverde': { base: 'cloud-forest', time: 'misty', subject: 'suspension', depth: 3, fringe: 'both', seed: 122 },
  'puntarenas-isla-del-coco': { base: 'island', time: 'dawn', extras: ['boat'], fringe: 'none', birds: true, seed: 123 },
  'puntarenas-jaco-garabito': { base: 'beach', time: 'dusk', palms: 3, fringe: 'right', seed: 124 },
  'puntarenas-golfito-and-puerto-jimenez': { base: 'beach', time: 'day', subject: 'boat', extras: ['town'], palms: 1, fringe: 'left', seed: 125 },
  'city-golfito': { base: 'beach', time: 'dawn', subject: 'boat', extras: ['town'], palms: 1, fringe: 'right', seed: 126 },
  'puntarenas-quepos': { base: 'beach', time: 'day', extras: ['town', 'boat'], palms: 2, fringe: 'left', seed: 127 },
  'city-ciudad-cortes': { base: 'town', time: 'day', province: 'puntarenas', backdrop: 'talamanca', fringe: 'left', seed: 128 },
  // ---- Limón ----
  'limon-puerto-limon': { base: 'beach', time: 'day', subject: 'town', palms: 2, rain: false, extras: ['boat'], fringe: 'right', seed: 130 },
  'city-limon': { base: 'town', time: 'misty', province: 'limon', backdrop: 'none', rain: true, fringe: 'left', seed: 131 },
  'limon-black-star-line': { base: 'town', time: 'day', subject: 'woodhall', province: 'limon', backdrop: 'none', fringe: 'right', seed: 132 },
  'limon-tortuguero-village': { base: 'canal', time: 'day', subject: 'town', extras: ['canoe'], rain: true, fringe: 'left', seed: 133 },
  'limon-cahuita-and-puerto-viejo': { base: 'reef', time: 'day', palms: 3, extras: ['boat'], fringe: 'right', seed: 134 },
  'limon-gandoca-manzanillo-refuge': { base: 'wetland', time: 'day', subject: 'heron', water: '#5fb0a6', fringe: 'both', seed: 135 },
  'limon-barra-del-colorado-refuge': { base: 'canal', time: 'misty', rain: true, subject: 'canoe', fringe: 'both', seed: 136 },
  'limon-talamanca-la-amistad': { base: 'mountain', time: 'misty', depth: 4, fringe: 'right', birds: true, seed: 137 },
  'city-sixaola': { base: 'river', time: 'day', water: '#6a9a7a', subject: 'bridge', extras: ['town'], rain: true, fringe: 'right', seed: 138 },
};
