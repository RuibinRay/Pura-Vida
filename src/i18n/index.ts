import { useCallback } from 'react';
import en, { type Messages } from './messages/en';
import es from './messages/es';
import zh from './messages/zh';
import { useSettings } from '../state/settings';

export type Lang = 'en' | 'es' | 'zh';
export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'zh', label: '简体中文', short: '中文' },
];
const MESSAGES: Record<Lang, Messages> = { en, es, zh };

/** Localised text on content objects: `zh` may be missing and falls back to English. */
export type Localized = { en: string; es?: string; zh?: string };

export function pickLang(input: Localized | string | undefined | null, lang: Lang): string {
  if (!input) return '';
  if (typeof input === 'string') return input;
  return input[lang] || input.en || '';
}

export function detectLang(): Lang {
  const url = new URL(window.location.href);
  const fromQuery = url.searchParams.get('lang') || new URLSearchParams(window.location.hash.split('?')[1] || '').get('lang');
  if (fromQuery === 'en' || fromQuery === 'es' || fromQuery === 'zh') return fromQuery;
  const nav = (navigator.language || 'en').toLowerCase();
  if (nav.startsWith('es')) return 'es';
  if (nav.startsWith('zh')) return 'zh';
  return 'en';
}

type Path<T> = T extends string ? '' : { [K in keyof T & string]: T[K] extends string ? K : `${K}.${Path<T[K]>}` }[keyof T & string];
export type MessageKey = Path<Messages>;

function lookup(obj: unknown, key: string): string {
  const parts = key.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) cur = (cur as Record<string, unknown>)[p];
    else return '';
  }
  return typeof cur === 'string' ? cur : '';
}

export function translate(lang: Lang, key: MessageKey, params?: Record<string, string | number>): string {
  let s = lookup(MESSAGES[lang], key) || lookup(MESSAGES.en, key) || key;
  if (params) for (const [k, v] of Object.entries(params)) s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  return s;
}

export function useT() {
  const lang = useSettings((s) => s.lang);
  const t = useCallback((key: MessageKey, params?: Record<string, string | number>) => translate(lang, key, params), [lang]);
  const l = useCallback((input: Localized | string | undefined | null) => pickLang(input, lang), [lang]);
  return { t, l, lang };
}

export const messages = MESSAGES;
