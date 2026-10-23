import { create } from 'zustand';
import { loadJSON, saveJSON } from '../save/storage';

export type DiscoveryKind = 'province' | 'species' | 'food' | 'plant' | 'event' | 'symbol' | 'game';
export interface Discovery {
  kind: DiscoveryKind;
  id: string;
  at: string; // ISO date
}

interface PassportState {
  discoveries: Discovery[];
  stamp: (kind: DiscoveryKind, id: string) => boolean; // returns true when newly stamped
  has: (kind: DiscoveryKind, id: string) => boolean;
  clear: () => void;
}

const persisted = loadJSON<{ discoveries: Discovery[] }>('passport', { discoveries: [] });

export const usePassport = create<PassportState>((set, get) => ({
  discoveries: Array.isArray(persisted.discoveries) ? persisted.discoveries : [],
  stamp: (kind, id) => {
    if (get().has(kind, id)) return false;
    set({ discoveries: [...get().discoveries, { kind, id, at: new Date().toISOString().slice(0, 10) }] });
    return true;
  },
  has: (kind, id) => get().discoveries.some((d) => d.kind === kind && d.id === id),
  clear: () => set({ discoveries: [] }),
}));

usePassport.subscribe((s) => saveJSON('passport', { discoveries: s.discoveries }));
