// The film's frames. Each shot is one H.264 clip in a small container (.pvf, written by tools/film_build.py) that
// lists every frame's bytes and where the keyframes are. The store streams the clips of the shots around the visitor,
// and decodes them a group of pictures at a time with WebCodecs, forwards or backwards, whichever way the scroll
// goes. The player asks for a frame and gets the nearest decoded one — or the shot's still while nothing of it has
// been decoded yet — so the picture is never blank.
//
// Where WebCodecs is missing (or the film runs as stills: reduced motion, the still tier) only the stills are used.
import { posterUrl, clipUrl, type SetName, type Shot } from './shots';

/** `exact`: the frame asked for; `still`: the shot's still, not a frame of the clip */
export type Picture = { img: CanvasImageSource; w: number; h: number; exact: boolean; still: boolean };

interface Head { codec: string; desc: Uint8Array; w: number; h: number; frames: number; offsets: Uint32Array; sizes: Uint32Array; keys: Uint8Array }
interface Clip {
  state: 'loading' | 'ready' | 'failed';
  /** the whole file; frames are decoded from it as soon as their bytes have arrived */
  data: Uint8Array | null;
  got: number;
  /** parsed from the start of the file */
  head: Head | null;
  abort: AbortController;
}

/** shots further than this from the current one give their clip back */
const KEEP = 2;
/** decoded groups of pictures kept (each `keyint` frames): the one on screen, the next, the one behind, and the
 *  other shot's during a dissolve */
const GOPS_KEPT = 5;
const STAMP = 100000; // frame id in a chunk's timestamp: shot × STAMP + frame

export const canDecode = (): boolean => typeof window !== 'undefined' && 'VideoDecoder' in window && 'EncodedVideoChunk' in window;

export function parseHead(buf: Uint8Array): Head | 'more' | 'bad' {
  if (buf.length < 16) return 'more';
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  if (dv.getUint32(0) !== 0x50564631) return 'bad'; // "PVF1"
  const w = dv.getUint16(4), h = dv.getUint16(6), frames = dv.getUint16(8);
  let o = 14;
  const codecLen = buf[o]; o += 1;
  if (buf.length < o + codecLen + 2) return 'more';
  const codec = String.fromCharCode(...buf.subarray(o, o + codecLen)); o += codecLen;
  const descLen = dv.getUint16(o); o += 2;
  if (buf.length < o + descLen + frames * 4) return 'more';
  const desc = buf.slice(o, o + descLen); o += descLen;
  const offsets = new Uint32Array(frames), sizes = new Uint32Array(frames), keys = new Uint8Array(frames);
  let at = o + frames * 4;
  for (let i = 0; i < frames; i++) {
    const v = dv.getUint32(o + i * 4);
    sizes[i] = v & 0x7fffffff; keys[i] = v >>> 31; offsets[i] = at; at += sizes[i];
  }
  return { codec, desc, w, h, frames, offsets, sizes, keys };
}

export class FrameStore {
  private posters: (HTMLImageElement | undefined)[];
  private clips: (Clip | undefined)[];
  /** decoded frames by shot × STAMP + frame. They are copies (bitmaps), not the decoder's own frames: a hardware
   *  decoder has only a few output buffers, and holding on to them would stall it */
  private frames = new Map<number, ImageBitmap>();
  private copying: Promise<void>[] = [];
  /** decoded groups, most recently used last: shot × STAMP + first frame */
  private gops: number[] = [];
  private decoder: VideoDecoder | null = null;
  private configured = ''; // the configuration the decoder has (codec and SPS/PPS): clips cut alike share it
  private busy = false;
  private want: number[] = []; // groups to decode, most wanted first
  private dead = false;
  private readonly video: boolean;
  /** bumped whenever a frame or a still arrives, so the player knows to redraw */
  version = 0;
  /** set when decoding failed for good: the film goes on as stills */
  broken = false;

  constructor(private base: string, private set: SetName, private shots: Shot[], private keyint: number, stillsOnly = false) {
    this.posters = new Array(shots.length);
    this.clips = new Array(shots.length);
    this.video = !stillsOnly && canDecode();
  }

  /** true when the picture moves: clips are decoded (false = one still per shot) */
  get moving(): boolean { return this.video && !this.broken; }

  dispose() {
    this.dead = true;
    for (const c of this.clips) c?.abort.abort();
    for (const f of this.frames.values()) f.close();
    this.frames.clear();
    try { if (this.decoder && this.decoder.state !== 'closed') this.decoder.close(); } catch { /* already closed */ }
    this.decoder = null;
  }

  /** The still of a shot (loaded on first ask). */
  poster(shot: number): HTMLImageElement | null {
    let img = this.posters[shot];
    if (!img) {
      img = new Image();
      img.decoding = 'async';
      img.onload = () => { this.version++; };
      img.src = posterUrl(this.base, this.shots[shot].id);
      this.posters[shot] = img;
    }
    return img.complete && img.naturalWidth > 0 ? img : null;
  }

  has(shot: number, frame: number): boolean {
    return this.frames.has(shot * STAMP + frame);
  }

  /** The decoded frame nearest to `frame` (0-based) of a shot, or its still while nothing near has been decoded. */
  nearest(shot: number, frame: number): Picture | null {
    if (this.moving) {
      const n = this.shots[shot].frames;
      const f = Math.max(0, Math.min(n - 1, frame));
      const hit = this.frames.get(shot * STAMP + f);
      if (hit) return { img: hit, w: hit.width, h: hit.height, exact: true, still: false };
      // a neighbour within two groups is better than the still (which may be from another moment of the shot)
      for (let d = 1; d <= this.keyint * 2; d++) {
        const a = (f - d >= 0 ? this.frames.get(shot * STAMP + f - d) : undefined) || (f + d < n ? this.frames.get(shot * STAMP + f + d) : undefined);
        if (a) return { img: a, w: a.width, h: a.height, exact: false, still: false };
      }
    }
    const p = this.poster(shot);
    return p ? { img: p, w: p.naturalWidth, h: p.naturalHeight, exact: !this.moving, still: true } : null;
  }

  /** How much of a shot's clip has arrived, 0–1. */
  loaded(shot: number): number {
    const c = this.clips[shot];
    return c?.data ? c.got / c.data.length : 0;
  }

  /** Tell the store where the film is: it fetches the clips around that shot and decodes around that frame. */
  seek(shot: number, frame: number, dir: number, also?: [number, number]) {
    this.poster(shot);
    if (shot + 1 < this.shots.length) this.poster(shot + 1);
    if (shot > 0) this.poster(shot - 1);
    if (!this.moving) return;
    const f = Math.max(0, Math.min(this.shots[shot].frames - 1, Math.round(frame)));
    // clips: this shot, then the one ahead, then the one behind; the rest are let go
    this.fetch(shot);
    const ahead = shot + dir;
    if (ahead >= 0 && ahead < this.shots.length) this.fetch(ahead);
    const behind = shot - dir;
    if (behind >= 0 && behind < this.shots.length && this.loaded(shot) > 0.6) this.fetch(behind);
    for (let s = 0; s < this.shots.length; s++) {
      if (Math.abs(s - shot) > KEEP && this.clips[s]) { this.clips[s]!.abort.abort(); this.clips[s] = undefined; }
    }
    // groups: the one under the frame, the next two in the direction of travel (crossing into the neighbouring shot
    // at either end), then the one behind
    const k = this.keyint;
    const g = Math.floor(f / k) * k;
    const list: number[] = [shot * STAMP + g];
    const step = (s: number, start: number, d: number): [number, number] | null => {
      const next = start + d * k;
      if (next >= 0 && next < this.shots[s].frames) return [s, next];
      const t = s + d;
      if (t < 0 || t >= this.shots.length) return null;
      return [t, d > 0 ? 0 : Math.floor((this.shots[t].frames - 1) / k) * k];
    };
    const a1 = step(shot, g, dir);
    if (also) {
      // inside a dissolve two shots are on screen: each needs the group under its frame and the one it is moving into
      const s2 = also[0];
      const g2 = Math.floor(Math.max(0, Math.min(this.shots[s2].frames - 1, Math.round(also[1]))) / k) * k;
      this.fetch(s2);
      list.push(s2 * STAMP + g2);
      if (a1) list.push(a1[0] * STAMP + a1[1]);
      const n2 = g2 + dir * k;
      if (n2 >= 0 && n2 < this.shots[s2].frames) list.push(s2 * STAMP + n2);
    } else {
      if (a1) { list.push(a1[0] * STAMP + a1[1]); const a2 = step(a1[0], a1[1], dir); if (a2) list.push(a2[0] * STAMP + a2[1]); }
    }
    const b1 = step(shot, g, -dir);
    if (b1) list.push(b1[0] * STAMP + b1[1]);
    list.length = Math.min(list.length, GOPS_KEPT);
    this.want = [...new Set(list)].filter((id) => !this.gops.includes(id));
    // touch the groups in use so they are the last to be dropped
    for (const id of list) { const i = this.gops.indexOf(id); if (i >= 0) { this.gops.splice(i, 1); this.gops.push(id); } }
    this.pump();
  }

  private fetch(shot: number) {
    if (this.clips[shot]) return;
    const clip: Clip = { state: 'loading', data: null, got: 0, head: null, abort: new AbortController() };
    this.clips[shot] = clip;
    const fail = () => { if (!clip.abort.signal.aborted) clip.state = 'failed'; };
    fetch(clipUrl(this.base, this.shots[shot].id, this.set), { signal: clip.abort.signal }).then(async (res) => {
      if (!res.ok || !res.body) return fail();
      // the manifest's size, not Content-Length: a compressing server reports the size on the wire
      const size = this.shots[shot].bytes[this.set] || Number(res.headers.get('content-length')) || 0;
      if (!size) return fail();
      clip.data = new Uint8Array(size);
      const reader = res.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done || this.dead) break;
        if (clip.got + value.length > clip.data.length) return fail(); // not the file the manifest describes
        clip.data.set(value, clip.got);
        clip.got += value.length;
        if (!clip.head) {
          const head = parseHead(clip.data.subarray(0, clip.got));
          if (head === 'bad') return fail();
          if (head !== 'more') clip.head = head;
        }
        if (clip.head) this.pump();
      }
      if (clip.got === clip.data.length && clip.head) { clip.state = 'ready'; this.pump(); } else fail();
    }).catch(fail);
  }

  private ensureDecoder(shot: number): boolean {
    const head = this.clips[shot]!.head!;
    if (!this.decoder || this.decoder.state === 'closed') {
      this.decoder = new VideoDecoder({
        output: (frame) => {
          if (this.dead || this.broken) { frame.close(); return; }
          const id = frame.timestamp;
          this.copying.push(createImageBitmap(frame).then((bitmap) => {
            frame.close();
            if (this.dead || this.broken) { bitmap.close(); return; }
            this.frames.get(id)?.close();
            this.frames.set(id, bitmap);
            this.version++;
          }, () => { frame.close(); }));
        },
        error: () => { this.fail(); },
      });
      this.configured = '';
    }
    // re-configuring restarts a hardware decoder (a fifth of a second): only when the clip really differs
    const key = `${head.codec}/${head.w}x${head.h}/${Array.from(head.desc).join(',')}`;
    if (this.configured !== key) {
      try {
        this.decoder.configure({ codec: head.codec, codedWidth: head.w, codedHeight: head.h, description: head.desc, optimizeForLatency: true });
      } catch { this.fail(); return false; }
      this.configured = key;
    }
    return true;
  }

  private fail() {
    // decoding is not going to work on this device: drop what there is and carry on with the stills
    this.broken = true;
    for (const f of this.frames.values()) f.close();
    this.frames.clear();
    this.gops = [];
    this.version++;
  }

  private pump() {
    if (this.busy || this.dead || this.broken) return;
    for (let n = 0; n < this.want.length; n++) {
      const id = this.want[n];
      // a group that finished decoding since the list was made is not decoded again
      if (this.gops.includes(id)) { this.want.splice(n, 1); n--; continue; }
      const shot = Math.floor(id / STAMP), first = id % STAMP;
      const clip = this.clips[shot];
      if (!clip?.head || !clip.data) continue;
      const { offsets, sizes, keys, frames } = clip.head;
      const last = Math.min(frames, first + this.keyint) - 1;
      if (!keys[first] || offsets[last] + sizes[last] > clip.got) continue; // its bytes have not all arrived yet
      this.want.splice(n, 1);
      if (!this.ensureDecoder(shot)) return;
      this.busy = true;
      const decoder = this.decoder!;
      try {
        for (let f = first; f <= last; f++) {
          decoder.decode(new EncodedVideoChunk({ type: keys[f] ? 'key' : 'delta', timestamp: shot * STAMP + f, data: clip.data.subarray(offsets[f], offsets[f] + sizes[f]) }));
        }
      } catch { this.busy = false; this.fail(); return; }
      decoder.flush().then(() => Promise.all(this.copying.splice(0))).then(() => {
        this.busy = false;
        if (this.dead || this.broken) return;
        this.gops.push(id);
        this.trim();
        this.pump();
      }).catch(() => { this.busy = false; if (!this.dead) this.fail(); });
      return;
    }
  }

  /** Keeps the most recently used groups and gives the frames of the others back. */
  private trim() {
    while (this.gops.length > GOPS_KEPT) {
      const id = this.gops.shift()!;
      const shot = Math.floor(id / STAMP), first = id % STAMP;
      for (let f = first; f < first + this.keyint; f++) {
        const key = shot * STAMP + f;
        const frame = this.frames.get(key);
        if (frame) { frame.close(); this.frames.delete(key); }
      }
    }
  }
}

/** Which size set suits this screen: the large one when the picture is drawn wider than 1100 device pixels, the
 *  small one on phones, on the lite tier and on a slow or metered link. */
export function pickSet(lite: boolean): SetName {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const px = Math.max(window.innerWidth, window.innerHeight * (16 / 9)) * dpr;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  const slow = !!conn && (conn.saveData === true || /(^|-)2g|3g/.test(conn.effectiveType || ''));
  const phone = Math.min(window.innerWidth, window.innerHeight) < 700;
  return px > 1100 && !phone && !lite && !slow ? 'hd' : 'sd';
}
