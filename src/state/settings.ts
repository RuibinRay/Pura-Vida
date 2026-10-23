import { create } from 'zustand';
import { loadJSON, saveJSON } from '../save/storage';
import type { Lang } from '../i18n';

export type MotionPref = 'auto' | 'calm' | 'full';
export type QualityPref = 'auto' | 'full' | 'lite' | 'still' | 'text';

export interface SettingsState {
  lang: Lang;
  motion: MotionPref;
  quality: QualityPref;
  sound: boolean;
  paused: boolean;
  setLang: (lang: Lang) => void;
  setMotion: (m: MotionPref) => void;
  setQuality: (q: QualityPref) => void;
  setSound: (on: boolean) => void;
  setPaused: (p: boolean) => void;
}

const defaults = { lang: 'en' as Lang, motion: 'auto' as MotionPref, quality: 'auto' as QualityPref, sound: false, paused: false };
const persisted = loadJSON('settings', defaults);

export const useSettings = create<SettingsState>((set) => ({
  ...persisted,
  sound: false, // sound is never on at page load
  setLang: (lang) => set({ lang }),
  setMotion: (motion) => set({ motion }),
  setQuality: (quality) => set({ quality }),
  setSound: (sound) => set({ sound }),
  setPaused: (paused) => set({ paused }),
}));

useSettings.subscribe((s) => {
  saveJSON('settings', { lang: s.lang, motion: s.motion, quality: s.quality, paused: s.paused });
  if (typeof document !== 'undefined') document.documentElement.lang = s.lang;
});

/** True when motion should be calm: the user asked for it, or the OS asks and the user did not override. */
export function useCalmMotion(): boolean {
  const pref = useSettings((s) => s.motion);
  if (pref === 'calm') return true;
  if (pref === 'full') return false;
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}
