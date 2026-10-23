import { describe, it, expect } from 'vitest';
import en from '../src/i18n/messages/en';
import es from '../src/i18n/messages/es';
import zh from '../src/i18n/messages/zh';

function keys(obj: unknown, prefix = ''): string[] {
  if (typeof obj === 'string') return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => keys(v, prefix ? prefix + '.' + k : k));
}
function get(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj);
}

describe('translations', () => {
  const enKeys = keys(en);
  it('has a reasonable number of keys', () => expect(enKeys.length).toBeGreaterThan(150));
  for (const [name, dict] of [['es', es], ['zh', zh]] as const) {
    it(`${name} has every English key with a non-empty string`, () => {
      const missing = enKeys.filter((k) => { const v = get(dict, k); return typeof v !== 'string' || !v.trim(); });
      expect(missing).toEqual([]);
    });
    it(`${name} has no extra keys`, () => {
      const extra = keys(dict).filter((k) => typeof get(en, k) !== 'string');
      expect(extra).toEqual([]);
    });
    it(`${name} keeps every {placeholder} of the English string`, () => {
      const broken = enKeys.filter((k) => {
        const ph = (get(en, k) as string).match(/\{\w+\}/g) || [];
        const tr = get(dict, k) as string;
        return ph.some((p) => !tr.includes(p));
      });
      expect(broken).toEqual([]);
    });
  }
  it('keeps Spanish place names accented in every language', () => {
    for (const dict of [en, es, zh]) {
      const all = keys(dict).map((k) => get(dict, k) as string).join(' ');
      expect(all).not.toMatch(/Limon\b|San Jose\b|Poas\b|Irazu\b/);
    }
  });
});
