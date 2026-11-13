// The home page's film: the shots laid on the scroll, what is on screen at any position, the clips on disk against
// the manifest, the captions in three languages, and the credits of the photographs some shots start from.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { CHAPTERS, FILM, KEYINT, SHOT_DEFS, SETS, captionShot, layout, stateAt } from '../src/film/shots';
import { parseHead } from '../src/film/frames';
import { captionAlpha } from '../src/film/usePlayer';
import { PHOTO_CREDITS, photoCredit, FILM_SOURCES } from '../src/film/photoCredits';
import en from '../src/i18n/messages/en';
import es from '../src/i18n/messages/es';
import zh from '../src/i18n/messages/zh';

const ROOT = path.resolve(__dirname, '..');
const { shots, total } = FILM;

describe('the film on the scroll', () => {
  it('has every shot of the list, in order, each with frames', () => {
    expect(shots.map((s) => s.id)).toEqual(SHOT_DEFS.map((s) => s.id));
    for (const s of shots) expect(s.frames, s.id).toBeGreaterThan(24);
  });

  it('lays the shots end to end, overlapping only where they dissolve', () => {
    expect(shots[0].start).toBe(0);
    expect(shots[shots.length - 1].end).toBe(total);
    for (let i = 1; i < shots.length; i++) {
      const a = shots[i - 1], b = shots[i];
      expect(b.start, b.id).toBeCloseTo(a.end - b.overlap, 6);
      expect(b.overlap, b.id).toBe(b.into === 'join' ? 0 : b.overlap);
      if (b.into !== 'join') expect(b.overlap, b.id).toBeGreaterThan(20);
      // a dissolve never eats more than a third of either shot
      expect(b.overlap).toBeLessThanOrEqual((b.end - b.start) / 3 + 1e-6);
      expect(b.overlap).toBeLessThan((a.end - a.start) / 2);
    }
  });

  it('groups the shots into the chapters of the rail, in order', () => {
    const order = shots.map((s) => CHAPTERS.indexOf(s.chapter));
    expect(order.every((n) => n >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(new Set(shots.map((s) => s.chapter)).size).toBe(CHAPTERS.length);
  });

  it('shows the first frame at the top and the last frame at the bottom', () => {
    const top = stateAt(0), bottom = stateAt(total);
    expect([top.shot, top.frame, top.next]).toEqual([0, 0, -1]);
    expect(bottom.shot).toBe(shots.length - 1);
    expect(bottom.frame).toBeCloseTo(shots[shots.length - 1].frames - 1, 6);
  });

  it('moves forward through the film without jumping back, and stays inside every clip', () => {
    let last = -1;
    let lastCaption = 0;
    for (let x = 0; x <= total; x += 0.5) {
      const st = stateAt(x);
      expect(st.frame).toBeGreaterThanOrEqual(0);
      expect(st.frame).toBeLessThanOrEqual(shots[st.shot].frames - 1);
      if (st.next >= 0) {
        expect(st.next).toBe(st.shot + 1);
        expect(st.mix).toBeGreaterThanOrEqual(0);
        expect(st.mix).toBeLessThanOrEqual(1);
        expect(st.nextFrame).toBeLessThanOrEqual(shots[st.next].frames - 1);
      }
      // position in the film as one number: shot + progress
      const at = st.shot + st.p;
      expect(at).toBeGreaterThanOrEqual(last - 1e-9);
      last = at;
      const cap = captionShot(st);
      expect(cap).toBeGreaterThanOrEqual(lastCaption);
      lastCaption = cap;
    }
    expect(lastCaption).toBe(shots.length - 1);
  });

  it('dissolves through white only where a shot comes in through cloud', () => {
    for (const s of shots.slice(1)) {
      const mid = stateAt(s.start + s.overlap / 2);
      if (s.into === 'cloud') expect(mid.veil, s.id).toBeGreaterThan(0.9);
      else expect(mid.veil, s.id).toBe(0);
    }
  });

  it('joins a continued shot to the one before it with no gap', () => {
    for (const s of shots.filter((x) => x.into === 'join')) {
      const before = stateAt(s.start - 0.01), after = stateAt(s.start + 0.01);
      expect(before.shot).toBe(s.index - 1);
      expect(before.next).toBe(-1);
      expect(after.shot).toBe(s.index);
      expect(after.frame).toBeLessThan(0.1);
    }
  });

  it('skips a shot whose clip has not been cut, and closes the gap', () => {
    const { shots: two, total: len } = layout(SHOT_DEFS.filter((s) => s.id !== 'sky'));
    expect(two.some((s) => s.id === 'sky')).toBe(false);
    expect(two[1].index).toBe(1);
    expect(len).toBeLessThan(total);
  });
});

describe('captions', () => {
  it('shows the opening caption from the start and the closing one to the end', () => {
    expect(captionAlpha(0, 18, 0)).toBe(1);
    expect(captionAlpha(0, 18, 0.9)).toBe(0);
    expect(captionAlpha(17, 18, 1)).toBe(1);
    expect(captionAlpha(17, 18, 0)).toBe(0);
  });
  it('keeps a middle caption out of the dissolves at both ends of its shot', () => {
    expect(captionAlpha(5, 18, 0.05)).toBe(0);
    expect(captionAlpha(5, 18, 0.5)).toBe(1);
    expect(captionAlpha(5, 18, 0.97)).toBe(0);
  });

  it('has a kicker, a title and a text for every shot in English, Spanish and Chinese', () => {
    for (const [lang, m] of [['en', en], ['es', es], ['zh', zh]] as const) {
      const all = m.film.shots as Record<string, { kicker: string; title: string; text: string }>;
      for (const s of SHOT_DEFS) {
        const c = all[s.id];
        expect(c, `${lang} ${s.id}`).toBeTruthy();
        expect(c.kicker.length, `${lang} ${s.id} kicker`).toBeGreaterThan(1);
        expect(c.title.length, `${lang} ${s.id} title`).toBeGreaterThan(1);
        expect(c.text.length, `${lang} ${s.id} text`).toBeGreaterThan(8);
      }
      expect(Object.keys(all).sort()).toEqual(SHOT_DEFS.map((s) => s.id).sort());
      for (const c of CHAPTERS) expect((m.film.chapters as Record<string, string>)[c], `${lang} chapter ${c}`).toBeTruthy();
    }
  });

  it('links out of the film only to pages the site has', () => {
    const labels = Object.keys(en.film.open);
    for (const s of SHOT_DEFS) {
      if (!s.link) continue;
      expect(labels).toContain(s.link.label);
      expect(s.link.to).toMatch(/^\/(explore|wildlife|culture|provinces\/[a-z-]+)(\?[a-z]+=[a-z-]+)?$/);
    }
  });
});

describe('the clips', () => {
  it('are on disk for every shot and size set, as large as the manifest says', () => {
    for (const s of shots) {
      for (const set of Object.keys(SETS)) {
        const file = path.join(ROOT, 'public', 'film', s.id, set + '.pvf');
        expect(fs.existsSync(file), file).toBe(true);
        expect(fs.statSync(file).size, file).toBe(s.bytes[set]);
      }
      expect(fs.existsSync(path.join(ROOT, 'public', 'film', s.id, 'poster.webp')), s.id + ' poster').toBe(true);
    }
  });

  it('carry what the player needs: size, frame count, a keyframe every group, frames that fill the file', () => {
    for (const s of shots) {
      for (const [set, size] of Object.entries(SETS)) {
        const buf = new Uint8Array(fs.readFileSync(path.join(ROOT, 'public', 'film', s.id, set + '.pvf')));
        const head = parseHead(buf);
        expect(typeof head, `${s.id} ${set}`).toBe('object');
        if (typeof head !== 'object') continue;
        expect([head.w, head.h]).toEqual([size.w, size.h]);
        expect(head.frames).toBe(s.frames);
        expect(head.codec).toMatch(/^avc1\.(42|4d)[0-9a-f]{4}$/);
        expect(head.desc[0]).toBe(1);
        for (let f = 0; f < head.frames; f++) expect(head.keys[f], `${s.id} ${set} frame ${f}`).toBe(f % KEYINT === 0 ? 1 : 0);
        expect(head.offsets[head.frames - 1] + head.sizes[head.frames - 1]).toBe(buf.length);
      }
    }
  });

  it('asks for more bytes while the head is incomplete, and refuses a file that is not a clip', () => {
    const buf = new Uint8Array(fs.readFileSync(path.join(ROOT, 'public', 'film', shots[0].id, 'sd.pvf')));
    expect(parseHead(buf.subarray(0, 10))).toBe('more');
    expect(parseHead(buf.subarray(0, 40))).toBe('more');
    expect(parseHead(new Uint8Array(64))).toBe('bad');
  });

  it('are cut from the takes named in tools/film_shots.json, one per shot', () => {
    const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'film_shots.json'), 'utf8'));
    expect(cfg.shots.map((s: { id: string }) => s.id)).toEqual(SHOT_DEFS.map((s) => s.id));
    expect(cfg.keyint).toBe(KEYINT);
    for (const s of cfg.shots) expect(s.take, s.id).toMatch(/^[a-z0-9-]+$/);
  });

  it('stay a reasonable download: under 40 MB for the small set and 90 MB for the large one', () => {
    const sum = (set: string) => shots.reduce((n, s) => n + s.bytes[set], 0) / 1e6;
    expect(sum('sd')).toBeLessThan(40);
    expect(sum('hd')).toBeLessThan(90);
  });
});

describe('the photographs some shots start from', () => {
  it('credits an author and a Creative Commons licence for each', () => {
    const used = SHOT_DEFS.filter((s) => s.made === 'photo');
    expect(used.length).toBeGreaterThan(0);
    for (const s of used) {
      expect(s.photo, s.id).toBeTruthy();
      const c = photoCredit(s.photo!);
      expect(c, s.id).toBeTruthy();
      expect(c!.author.length).toBeGreaterThan(2);
      expect(c!.author).not.toMatch(/\(\(/);
      expect(c!.licence).toMatch(/^(CC BY(-SA)? \d\.\d|CC0|Public domain)$/);
      expect(c!.page).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(c!.licenceUrl).toMatch(/^https:\/\/creativecommons\.org\//);
    }
    expect(PHOTO_CREDITS.length).toBe(used.length);
  });

  it('says how every shot was made, and only photograph shots name a photograph', () => {
    for (const s of SHOT_DEFS) {
      expect(['map', 'generated', 'scene', 'photo']).toContain(s.made);
      expect(!!s.photo, s.id).toBe(s.made === 'photo');
    }
    expect(SHOT_DEFS[0].made).toBe('map');
  });

  it('lists what the new captions were checked against', () => {
    expect(FILM_SOURCES.length).toBeGreaterThanOrEqual(3);
    for (const src of FILM_SOURCES) expect(src.url).toMatch(/^https:\/\//);
  });
});
