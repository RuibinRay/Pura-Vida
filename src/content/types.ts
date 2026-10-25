import type { Localized } from '../i18n';
import type { ProvinceId } from '../state/map';

export type Status = 'confirmed' | 'approximate' | 'interpretation' | 'folklore' | 'uncertain' | 'secondary';

export interface Source {
  url: string;
  title: string;
  publisher?: string;
  published?: string | null;
  retrieved: string;
  supports?: string;
}

export interface Fact<T = string> {
  value: T;
  year?: number | null;
  status: Status;
  sources: Source[];
}

export interface TextBlock {
  en: string;
  es?: string;
  zh?: string;
  status?: Status;
  sources?: Source[];
}

export type LandmarkKind = 'city' | 'town' | 'capital' | 'province-capital' | 'volcano' | 'mountain' | 'park' | 'reserve' | 'refuge' | 'monument' | 'island' | 'waterfall' | 'beach' | 'museum' | 'river' | 'building' | 'wetland';

export interface Landmark {
  id: string;
  name: Localized | string;
  kind: LandmarkKind;
  lon: number;
  lat: number;
  province: ProvinceId | null;
  provinces?: ProvinceId[];
  elevationM?: number;
  text?: Localized;
  status?: Status;
  coordsStatus?: 'confirmed' | 'approximate';
  conservationArea?: string;
  unesco?: boolean;
  sources?: Source[];
}

export interface SpeciesRef {
  common: Localized;
  scientific: string;
  note?: string;
}

export interface ProtectedArea {
  name: string;
  kind: string;
  coords?: [number, number];
  conservationArea?: string;
  sources?: Source[];
}

export interface ProvinceContent {
  id: ProvinceId;
  iso: string;
  name: Localized;
  capital: { name: string; coords: [number, number]; coordsStatus?: string; sources?: Source[] };
  keyFacts: {
    areaKm2?: Fact<number>;
    population?: Fact<number>;
    cantons?: Fact<number>;
  };
  overview: TextBlock;
  landmarks: Landmark[];
  wildlifeVegetation?: TextBlock & { species?: SpeciesRef[] };
  culture?: TextBlock;
  history?: TextBlock;
  foods?: { name: string; text: Localized; status?: Status; sources?: Source[] }[];
  environment?: TextBlock & { protectedAreas?: ProtectedArea[] };
  curiosities?: { text: Localized; status?: Status; sources?: Source[] }[];
}

export interface Species {
  id: string;
  commonNames: Localized;
  scientific: string;
  family?: string;
  order?: string;
  iucn?: { category: string; year?: number | null; url?: string } | null;
  size?: Localized | null;
  habitat?: Localized;
  distributionCR?: Localized;
  diet?: Localized;
  ecologicalRole?: Localized;
  behaviour?: Localized;
  facts?: { en: string; es?: string; status?: Status; sources?: Source[] }[];
  nationalSymbol?: { isSymbol: boolean; year?: number | null; instrument?: string; sources?: Source[] };
  /** whether the species occurs in the Pacific lowland coastal forests shown on the wildlife plate */
  habitatFit?: { pacificLowland: boolean; note?: Localized; status?: Status };
  /** per-stop habitat fit for the homepage walk (stop id → does the species belong in that scene?) */
  stops?: Record<string, { fit: boolean; note?: Localized; status?: Status; sources?: Source[] }>;
  sources?: Source[];
}

export interface PlaceFact {
  key: string;
  label: Localized;
  value: number | string;
  unit?: string;
  year?: number | null;
  status: Status;
  text?: Localized;
  sources: Source[];
}
/** A stop of the homepage walk: a sourced place with its province, overview and fact tiles. */
export interface Place {
  id: string;
  name: Localized;
  province?: ProvinceId;
  provinceNote?: Localized;
  coords?: [number, number];
  coordsStatus: 'confirmed' | 'approximate';
  kind?: Localized;
  overview?: TextBlock;
  facts: PlaceFact[];
  protectedArea?: { name: Localized; managedBy?: string; established?: number | null; areaHa?: number | null; status?: Status; sources?: Source[] };
  sources?: Source[];
}

/** The Irazú "what if it erupted?" dossier. */
export interface IrazuDossier {
  name: Localized;
  summitM: number | null;
  type?: string;
  lastEruption?: { year: number | null; note?: Localized; status?: Status; sources?: Source[] };
  craters?: TextBlock;
  monitoring?: TextBlock;
  park?: TextBlock;
  timeline: { date: string; en: string; es?: string; zh?: string; status?: Status; sources?: Source[] }[];
  whatIf?: TextBlock;
  facts: PlaceFact[];
  sources?: Source[];
}

export interface Food {
  id: string;
  name: Localized;
  kind?: Localized;
  region?: TextBlock;
  description?: TextBlock;
  ingredients?: { en: string; es?: string; optional?: boolean }[];
  ingredientsNote?: TextBlock;
  preparation?: TextBlock;
  culture?: TextBlock;
  history?: TextBlock;
  heritage?: { declared: boolean | null; instrument?: string; year?: number | null; note?: Localized; status?: Status; sources?: Source[] };
  facts?: { en: string; es?: string; status?: Status; sources?: Source[] }[];
  sources?: Source[];
}
