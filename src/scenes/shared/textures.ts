// Procedural canvas textures for the stylised vegetation and creatures. Everything is drawn once and cached.
import * as THREE from 'three';

const cache = new Map<string, THREE.Texture>();

function make(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void): THREE.Texture {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}

/** Soft radial sprite (clouds, motes, glow). */
export function softSprite() {
  return make('soft', 128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.45, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
}

/** Vertical light-shaft gradient. */
export function shaftTexture() {
  return make('shaft', 64, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,240,200,0.85)');
    g.addColorStop(0.5, 'rgba(255,240,200,0.35)');
    g.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const side = ctx.createLinearGradient(0, 0, w, 0);
    side.addColorStop(0, 'rgba(0,0,0,1)'); side.addColorStop(0.3, 'rgba(0,0,0,0)'); side.addColorStop(0.7, 'rgba(0,0,0,0)'); side.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = side; ctx.fillRect(0, 0, w, h);
  });
}

/** Palm frond: a rachis with leaflets, alpha outside. Drawn pointing up (+y). */
export function palmFrond() {
  return make('frond', 256, 1024, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    ctx.strokeStyle = '#2f6b33';
    ctx.lineCap = 'round';
    for (let i = 0; i < 46; i++) {
      const t = i / 46;
      const y = h - 40 - t * (h - 120);
      const len = 90 * Math.sin(Math.PI * Math.min(1, t * 1.15 + 0.08)) + 18;
      const ang = 0.55 + t * 0.35;
      const shade = ['#2f6b33', '#3d8a44', '#2a5e2e', '#47984f'][i % 4];
      ctx.strokeStyle = shade; ctx.lineWidth = 5 - t * 2;
      ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx - Math.cos(ang) * len, y - Math.sin(ang) * len * 0.35); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx + Math.cos(ang) * len, y - Math.sin(ang) * len * 0.35); ctx.stroke();
    }
    ctx.strokeStyle = '#4a6a2a'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(cx, h); ctx.lineTo(cx, 60); ctx.stroke();
  });
}

/** Fern: a fan of fronds. */
export function fernTexture() {
  return make('fern', 256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h - 10;
    for (let f = -3; f <= 3; f++) {
      const ang = -Math.PI / 2 + f * 0.33;
      const len = 150 - Math.abs(f) * 18;
      ctx.strokeStyle = f % 2 ? '#2b6d3a' : '#3f8c4c'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len); ctx.stroke();
      for (let i = 1; i < 14; i++) {
        const t = i / 14;
        const px = cx + Math.cos(ang) * len * t, py = cy + Math.sin(ang) * len * t;
        const ll = (1 - Math.abs(t - 0.5) * 1.6) * 26 + 6;
        ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(ang + 1.0) * ll, py + Math.sin(ang + 1.0) * ll); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(ang - 1.0) * ll, py + Math.sin(ang - 1.0) * ll); ctx.stroke();
      }
    }
  });
}

/** Heliconia: a stem with red bracts tipped yellow. */
export function heliconiaTexture() {
  return make('heliconia', 128, 384, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#3b7a3a'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(w / 2, h); ctx.lineTo(w / 2 + 6, 60); ctx.stroke();
    for (let i = 0; i < 7; i++) {
      const y = 70 + i * 36;
      const dir = i % 2 ? 1 : -1;
      ctx.fillStyle = '#c8302a';
      ctx.beginPath(); ctx.moveTo(w / 2 + 3, y); ctx.lineTo(w / 2 + dir * 46, y - 26); ctx.lineTo(w / 2 + dir * 34, y + 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f2c62e';
      ctx.beginPath(); ctx.moveTo(w / 2 + dir * 46, y - 26); ctx.lineTo(w / 2 + dir * 40, y - 12); ctx.lineTo(w / 2 + dir * 34, y + 4); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#3f8a44';
    ctx.beginPath(); ctx.ellipse(w / 2 - 22, h - 70, 24, 70, -0.25, 0, Math.PI * 2); ctx.fill();
  });
}

/** Big tropical leaf with slits. */
export function bigLeafTexture() {
  return make('bigleaf', 256, 320, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#2d7a3b'); g.addColorStop(1, '#1d5a2c');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(w / 2, h);
    ctx.bezierCurveTo(w * 0.05, h * 0.75, w * 0.02, h * 0.25, w / 2, 8);
    ctx.bezierCurveTo(w * 0.98, h * 0.25, w * 0.95, h * 0.75, w / 2, h);
    ctx.fill();
    ctx.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 5; i++) {
      const y = 70 + i * 48;
      ctx.beginPath(); ctx.moveTo(14, y); ctx.lineTo(w * 0.42, y + 18); ctx.lineTo(w * 0.42, y + 30); ctx.lineTo(8, y + 20); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w - 14, y + 20); ctx.lineTo(w * 0.58, y + 36); ctx.lineTo(w * 0.58, y + 48); ctx.lineTo(w - 8, y + 40); ctx.closePath(); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(190,230,170,0.5)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(w / 2, h); ctx.lineTo(w / 2, 12); ctx.stroke();
  });
}

/** Morpho wing (right wing; mirrored for the left). Blue with a dark margin and white spots. */
export function morphoWing() {
  return make('morpho', 256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createRadialGradient(40, 150, 10, 40, 150, 230);
    g.addColorStop(0, '#5aa9ff'); g.addColorStop(0.45, '#1f63e6'); g.addColorStop(1, '#0c2c8a');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(8, 150);
    ctx.bezierCurveTo(30, 20, 180, 10, 248, 60);
    ctx.bezierCurveTo(250, 120, 220, 150, 200, 160);
    ctx.bezierCurveTo(230, 200, 190, 250, 120, 245);
    ctx.bezierCurveTo(60, 240, 20, 210, 8, 150);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 14; ctx.strokeStyle = '#0a0f1f'; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    [[205, 70], [222, 95], [228, 125], [214, 190]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill(); });
  });
}

/** Bark-ish vertical streaks for trunks. */
export function barkTexture() {
  return make('bark', 128, 256, (ctx, w, h) => {
    ctx.fillStyle = '#5b4631'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      ctx.strokeStyle = i % 2 ? 'rgba(40,28,18,0.45)' : 'rgba(120,96,70,0.35)';
      ctx.lineWidth = 1 + (i % 3);
      const x = (i * 37) % w;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + ((i * 13) % 7) - 3, h); ctx.stroke();
    }
    const t = cache.get('bark');
    if (t) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  });
}
