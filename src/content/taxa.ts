// The kind of animal a species is, read from the taxonomic order its sources give it, and the provinces its sourced
// places lie in. Nothing here is a new claim: the order comes from the species' own record, the places from
// habitats.ts, and the class of an order is textbook taxonomy.
import type { Species, Landmark } from './types';
import type { ProvinceId } from '../state/map';
import { HABITATS } from './habitats';

export type AnimalClass = 'bird' | 'mammal' | 'reptile' | 'amphibian' | 'insect';
export const ANIMAL_CLASSES: AnimalClass[] = ['bird', 'mammal', 'reptile', 'amphibian', 'insect'];

const ORDER_CLASS: Record<string, AnimalClass> = {
  // birds
  Piciformes: 'bird', Passeriformes: 'bird', Psittaciformes: 'bird', Trogoniformes: 'bird', Pelecaniformes: 'bird', Apodiformes: 'bird',
  // mammals
  Pilosa: 'mammal', Primates: 'mammal', Rodentia: 'mammal', Perissodactyla: 'mammal', Artiodactyla: 'mammal', Carnivora: 'mammal', Sirenia: 'mammal',
  // reptiles
  Squamata: 'reptile', Testudines: 'reptile', Crocodilia: 'reptile',
  // amphibians
  Anura: 'amphibian',
  // insects
  Lepidoptera: 'insect',
};

/** The class of a species, from the first word of its order ("Artiodactyla (infraorder Cetacea)" → mammal). */
export function classOf(sp: Pick<Species, 'order'>): AnimalClass | null {
  const order = (sp.order || '').trim().split(/[\s(]/)[0];
  return ORDER_CLASS[order] ?? null;
}

/** The provinces of the places where the sources put a species (see habitats.ts), in no particular order. */
export function provincesOf(speciesId: string, landmarks: Map<string, Landmark>): ProvinceId[] {
  const out = new Set<ProvinceId>();
  for (const h of HABITATS[speciesId] ?? []) {
    const lm = landmarks.get(h.at);
    if (lm?.province) out.add(lm.province);
    for (const p of lm?.provinces ?? []) out.add(p);
  }
  return [...out];
}
