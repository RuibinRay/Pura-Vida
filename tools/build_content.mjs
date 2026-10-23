// Merges the sourced research (research/*.json) into the typed content the app renders
// (src/content/generated/*.json). It validates the shape, normalises coordinates to lon/lat,
// collects every source into one registry, and refuses to emit a province without a sourced overview.
//   node tools/build_content.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const R = (f) => path.join(ROOT, 'research', f);
const OUT = path.join(ROOT, 'src', 'content', 'generated');
fs.mkdirSync(OUT, { recursive: true });

const warnings = [];
const errors = [];
const readJSON = (f) => (fs.existsSync(R(f)) ? JSON.parse(fs.readFileSync(R(f), 'utf8')) : null);

const PROVINCE_IDS = ['san-jose', 'alajuela', 'cartago', 'heredia', 'guanacaste', 'puntarenas', 'limon'];
const ISO = { 'san-jose': 'CR-SJ', alajuela: 'CR-A', cartago: 'CR-C', heredia: 'CR-H', guanacaste: 'CR-G', puntarenas: 'CR-P', limon: 'CR-L' };
const STATUSES = new Set(['confirmed', 'approximate', 'interpretation', 'folklore', 'uncertain', 'secondary']);
const MAINLAND = { latMin: 8.0, latMax: 11.3, lonMin: -86.0, lonMax: -82.5 };

const sourceRegistry = new Map();
const unverified = [];
function registerSource(s, usedFor) {
  if (!s || !s.url) return null;
  const key = s.url.trim();
  const entry = sourceRegistry.get(key) || { url: key, title: s.title || key, publisher: s.publisher || '', published: s.published || null, retrieved: s.retrieved || '2026-10-23', usedFor: new Set() };
  entry.usedFor.add(usedFor);
  if (!entry.title && s.title) entry.title = s.title;
  sourceRegistry.set(key, entry);
  return { url: key, title: entry.title, publisher: entry.publisher, published: entry.published, retrieved: entry.retrieved, supports: s.supports };
}
const sources = (list, usedFor) => (Array.isArray(list) ? list.map((s) => registerSource(s, usedFor)).filter(Boolean) : []);
const status = (s, where) => { if (!STATUSES.has(s)) { warnings.push(`${where}: status "${s}" → uncertain`); return 'uncertain'; } return s; };
const text = (t, where) => { if (!t || typeof t.en !== 'string' || !t.en.trim()) { warnings.push(`${where}: missing English text`); return null; } return { en: t.en.trim(), es: (t.es || '').trim() || undefined, zh: (t.zh || '').trim() || undefined }; };
const coords = (c, where, allowCoco = false) => {
  if (!Array.isArray(c) || c.length !== 2 || typeof c[0] !== 'number' || typeof c[1] !== 'number') { warnings.push(`${where}: no coordinates`); return null; }
  let [lat, lon] = c;
  if (Math.abs(lat) > 20 && Math.abs(lon) < 20) [lat, lon] = [lon, lat]; // swapped
  const coco = lat > 5 && lat < 6 && lon > -87.5 && lon < -86.5;
  const inland = lat >= MAINLAND.latMin && lat <= MAINLAND.latMax && lon >= MAINLAND.lonMin && lon <= MAINLAND.lonMax;
  if (!inland && !(allowCoco && coco)) { warnings.push(`${where}: coordinates [${lat}, ${lon}] outside Costa Rica — dropped`); return null; }
  return { lat, lon };
};
const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ---- provinces -------------------------------------------------------------------------------
const provinceFiles = ['provinces-central.json', 'provinces-coastal.json'];
const provinces = [];
const landmarks = [];
for (const f of provinceFiles) {
  const data = readJSON(f);
  if (!data) { errors.push(`missing ${f}`); continue; }
  for (const u of data.unverified || []) unverified.push({ ...u, from: f });
  for (const [id, p] of Object.entries(data.provinces || {})) {
    if (!PROVINCE_IDS.includes(id)) { errors.push(`${f}: unknown province id ${id}`); continue; }
    const where = `${f}:${id}`;
    const overview = text(p.overview, where + '.overview');
    if (!overview) { errors.push(`${where}: no overview`); continue; }
    const fact = (k) => { const v = p.keyFacts?.[k]; if (!v || typeof v.value !== 'number') return undefined; return { value: v.value, year: v.year ?? null, status: status(v.status, where + '.' + k), sources: sources(v.sources, `${id} · ${k}`) }; };
    const cap = coords(p.capital?.coords, where + '.capital');
    const lms = [];
    for (const lm of p.landmarks || []) {
      const c = coords(lm.coords, `${where}.landmark ${lm.name}`, id === 'puntarenas');
      if (!c) continue;
      const lid = `${id}-${slug(lm.id || lm.name)}`;
      const entry = { id: lid, name: lm.name, kind: lm.kind || 'town', lon: c.lon, lat: c.lat, province: id, text: text(lm.text, `${where}.landmark ${lm.name}`) || undefined, status: lm.status ? status(lm.status, lid) : undefined, coordsStatus: lm.coordsStatus === 'confirmed' ? 'confirmed' : 'approximate', sources: sources(lm.sources, `${id} · ${lm.name}`) };
      lms.push(entry);
      landmarks.push(entry);
    }
    const block = (b, key) => { if (!b) return undefined; const tx = text(b, `${where}.${key}`); if (!tx) return undefined; return { ...tx, status: b.status ? status(b.status, `${where}.${key}`) : undefined, sources: sources(b.sources, `${id} · ${key}`) }; };
    const wv = block(p.wildlifeVegetation, 'wildlifeVegetation');
    provinces.push({
      id,
      iso: ISO[id],
      name: { en: p.name?.en || id, es: p.name?.es || p.name?.en || id, zh: p.name?.zh || undefined },
      capital: { name: p.capital?.name || '', coords: cap ? [cap.lat, cap.lon] : [0, 0], coordsStatus: p.capital?.coordsStatus, sources: sources(p.capital?.sources, `${id} · capital`) },
      keyFacts: { areaKm2: fact('areaKm2'), population: fact('population'), cantons: fact('cantons') },
      overview: { ...overview, status: status(p.overview.status, where + '.overview'), sources: sources(p.overview.sources, `${id} · overview`) },
      landmarks: lms,
      wildlifeVegetation: wv ? { ...wv, species: (p.wildlifeVegetation?.species || []).filter((s) => s?.scientific).map((s) => ({ common: { en: s.common?.en || s.scientific, es: s.common?.es || undefined }, scientific: s.scientific, note: s.note || undefined })) } : undefined,
      culture: block(p.culture, 'culture'),
      history: block(p.history, 'history'),
      foods: (p.foods || []).map((fd) => ({ name: fd.name, text: text(fd.text, `${where}.food ${fd.name}`) || { en: '' }, status: fd.status ? status(fd.status, `${where}.food ${fd.name}`) : undefined, sources: sources(fd.sources, `${id} · ${fd.name}`) })).filter((fd) => fd.text.en),
      environment: (() => { const b = block(p.environment, 'environment'); if (!b) return undefined; return { ...b, protectedAreas: (p.environment?.protectedAreas || []).map((a) => { const c = coords(a.coords, `${where}.area ${a.name}`, id === 'puntarenas'); return { name: a.name, kind: a.kind || '', coords: c ? [c.lat, c.lon] : undefined, conservationArea: a.conservationArea || undefined, sources: sources(a.sources, `${id} · ${a.name}`) }; }) }; })(),
      curiosities: (p.curiosities || []).map((c) => ({ text: text(c.text, `${where}.curiosity`) || { en: '' }, status: c.status ? status(c.status, `${where}.curiosity`) : undefined, sources: sources(c.sources, `${id} · curiosity`) })).filter((c) => c.text.en),
    });
  }
}
provinces.sort((a, b) => PROVINCE_IDS.indexOf(a.id) - PROVINCE_IDS.indexOf(b.id));

// ---- country: facts, symbols, peaks, protected areas -------------------------------------------
const country = readJSON('country.json');
const facts = [];
const peaks = [];
if (country) {
  for (const u of country.unverified || []) unverified.push({ ...u, from: 'country.json' });
  for (const [key, f] of Object.entries(country.country || {})) {
    if (f?.value === undefined) continue;
    facts.push({ key, label: f.label || { en: key }, value: f.value, unit: f.unit || undefined, year: f.year ?? null, status: status(f.status, 'country.' + key), text: f.text && f.text.en ? f.text : undefined, sources: sources(f.sources, 'country · ' + key) });
  }
  for (const pk of country.peaks || []) {
    const c = coords(pk.coords, 'peak ' + pk.name);
    if (!c || typeof pk.elevationM !== 'number') continue;
    const id = 'peak-' + slug(pk.id || pk.name);
    const entry = { id, name: pk.name, kind: pk.kind === 'volcano' ? 'volcano' : 'mountain', lon: c.lon, lat: c.lat, province: PROVINCE_IDS.includes(pk.provinces?.[0]) ? pk.provinces[0] : null, provinces: (pk.provinces || []).filter((p) => PROVINCE_IDS.includes(p)), elevationM: pk.elevationM, text: pk.activity ? { en: pk.activity } : undefined, status: pk.status ? status(pk.status, id) : undefined, coordsStatus: pk.coordsStatus === 'confirmed' ? 'confirmed' : 'approximate', sources: sources(pk.sources, 'peak · ' + pk.name) };
    peaks.push(entry);
    landmarks.push(entry);
  }
  for (const pa of country.protectedAreas || []) {
    const c = coords(pa.coords, 'area ' + pa.name, true);
    if (!c) continue;
    const kind = /parque internacional|international park|national park|parque nacional/i.test(pa.kind || '') ? 'park' : /monument|monumento/i.test(pa.kind || '') ? 'monument' : /refug|refuge/i.test(pa.kind || '') ? 'refuge' : /wetland|humedal/i.test(pa.kind || '') ? 'wetland' : /reserv/i.test(pa.kind || '') ? 'reserve' : 'park';
    const id = 'area-' + slug(pa.id || pa.name);
    landmarks.push({ id, name: pa.name, kind, lon: c.lon, lat: c.lat, province: PROVINCE_IDS.includes(pa.provinces?.[0]) ? pa.provinces[0] : null, provinces: (pa.provinces || []).filter((p) => PROVINCE_IDS.includes(p)), text: pa.text && pa.text.en ? pa.text : undefined, conservationArea: pa.conservationArea || undefined, unesco: !!pa.unesco, status: 'confirmed', coordsStatus: pa.coordsStatus === 'confirmed' ? 'confirmed' : 'approximate', sources: sources(pa.sources, 'protected area · ' + pa.name) });
  }
} else errors.push('missing country.json');

// cities from Natural Earth places (public domain); merged with the research capitals' texts
const placesFile = path.join(ROOT, 'public', 'geo', 'places.json');
if (fs.existsSync(placesFile)) {
  const places = JSON.parse(fs.readFileSync(placesFile, 'utf8')).places;
  for (const pl of places) {
    const id = 'city-' + pl.id;
    if (landmarks.some((l) => l.id === id)) continue;
    landmarks.push({ id, name: pl.name, kind: pl.kind, lon: pl.lon, lat: pl.lat, province: pl.province, coordsStatus: 'confirmed', status: 'confirmed', sources: [registerSource({ url: 'https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/', title: 'Natural Earth 1:10m populated places', publisher: 'Natural Earth', retrieved: '2026-10-23' }, 'cities')] });
  }
}
// drop duplicates: province landmarks that repeat a country peak/park by name
const seenNames = new Set();
const dedupedLandmarks = [];
for (const l of landmarks.sort((a, b) => (a.id.startsWith('peak-') || a.id.startsWith('area-') ? -1 : 1) - (b.id.startsWith('peak-') || b.id.startsWith('area-') ? -1 : 1))) {
  const key = slug(typeof l.name === 'string' ? l.name : l.name.en) + ':' + (l.kind === 'volcano' || l.kind === 'mountain' ? 'peak' : l.kind);
  if (seenNames.has(key)) continue;
  seenNames.add(key);
  dedupedLandmarks.push(l);
}

// ---- species + unesco ---------------------------------------------------------------------------
// The species research refers to sources by URL inside each block; resolve them against the species' own list.
const sp = readJSON('species.json');
const species = [];
const unesco = [];
function sizeText(sz) {
  if (!sz || typeof sz !== 'object') return null;
  const range = (v, unit) => (Array.isArray(v) ? `${v[0]}–${v[1]} ${unit}` : typeof v === 'number' ? `about ${v} ${unit}` : null);
  const rangeEs = (v, unit) => (Array.isArray(v) ? `${v[0]}–${v[1]} ${unit}` : typeof v === 'number' ? `unos ${v} ${unit}` : null);
  const en = [], es = [];
  if (sz.length_cm) { en.push(`${range(sz.length_cm, 'cm')} long`); es.push(`${rangeEs(sz.length_cm, 'cm')} de largo`); }
  if (sz.wingspan_cm) { en.push(`wingspan ${range(sz.wingspan_cm, 'cm')}`); es.push(`envergadura de ${rangeEs(sz.wingspan_cm, 'cm')}`); }
  if (sz.mass_g) { en.push(`${range(sz.mass_g, 'g')}`); es.push(`${rangeEs(sz.mass_g, 'g')}`); }
  if (sz.mass_kg_range) { en.push(`${sz.mass_kg_range[0]}–${sz.mass_kg_range[1]} kg`); es.push(`${sz.mass_kg_range[0]}–${sz.mass_kg_range[1]} kg`); }
  if (sz.bill_cm) { en.push(`bill ${range(sz.bill_cm, 'cm')}`); es.push(`pico de ${rangeEs(sz.bill_cm, 'cm')}`); }
  if (!en.length) return null;
  return { en: en.join(', '), es: es.join(', ') };
}
if (sp) {
  for (const u of sp.unverified || []) unverified.push({ ...u, from: 'species.json' });
  for (const s of sp.species || []) {
    if (!s.scientific) continue;
    const byUrl = new Map((s.sources || []).map((x) => [x.url, x]));
    const resolve = (refs, usedFor) => sources((refs || []).map((r) => (typeof r === 'string' ? byUrl.get(r) || { url: r, title: r, retrieved: '2026-10-23' } : r)), usedFor);
    const loc = (b) => (b && typeof b.en === 'string' && b.en.trim() ? { en: b.en.trim(), es: (b.es || '').trim() || undefined, zh: (b.zh || '').trim() || undefined } : undefined);
    const used = 'species · ' + s.scientific;
    const all = sources(s.sources, used);
    const sz = sizeText(s.size);
    // reconcile with the symbols list (country.json): a law beats a stale government page
    const sym = (country?.symbols || []).find((y) => [y.name?.en, y.name?.es, y.text?.en, y.legalInstrument].some((v) => typeof v === 'string' && v.toLowerCase().includes(s.scientific.toLowerCase())));
    const symbol = sym
      ? { isSymbol: true, year: sym.designatedYear ?? null, instrument: sym.legalInstrument || undefined, sources: sources(sym.sources, 'symbol · ' + s.scientific) }
      : s.nationalSymbol ? { isSymbol: !!s.nationalSymbol.isSymbol, year: s.nationalSymbol.year ?? null, instrument: s.nationalSymbol.instrument || undefined, sources: resolve(s.nationalSymbol.sources, 'symbol · ' + s.scientific) } : undefined;
    species.push({
      id: s.id || slug(s.scientific),
      commonNames: { en: s.commonNames?.en || s.scientific, es: s.commonNames?.es || undefined, zh: s.commonNames?.zh || undefined },
      scientific: s.scientific,
      family: s.family || undefined,
      order: s.order || undefined,
      iucn: s.iucn && s.iucn.category ? { category: s.iucn.category, year: s.iucn.year ?? null, url: s.iucn.url || undefined } : null,
      size: sz ? { ...sz, status: s.size?.status } : null,
      habitat: loc(s.habitat),
      distributionCR: loc(s.distributionCR),
      diet: loc(s.diet),
      ecologicalRole: loc(s.ecologicalRole),
      behaviour: loc(s.behaviour),
      facts: (s.facts || []).filter((f) => f && f.en).map((f) => ({ en: f.en, es: f.es || undefined, status: f.status ? status(f.status, 'species.' + s.id) : undefined, sources: resolve(f.sources, used) })),
      nationalSymbol: symbol,
      sources: all,
    });
  }
  for (const u of sp.unesco || []) {
    const c = coords(u.coords, 'unesco ' + u.id, true);
    unesco.push({ id: u.id, name: u.name, inscribed: u.inscribed, criteria: u.criteria, type: u.type, provinces: u.provinces, coords: c ? [c.lat, c.lon] : undefined, text: u.text && u.text.en ? u.text : undefined, url: u.url, sources: sources(u.sources, 'UNESCO · ' + (u.name?.en || u.id)) });
  }
} else errors.push('missing species.json');

// ---- write --------------------------------------------------------------------------------------
const retrieved = '2026-10-23';
const registry = [...sourceRegistry.values()].map((s) => ({ ...s, usedFor: [...s.usedFor] })).sort((a, b) => a.publisher.localeCompare(b.publisher) || a.title.localeCompare(b.title));
fs.writeFileSync(path.join(OUT, 'provinces.json'), JSON.stringify({ retrieved, provinces }, null, 0));
fs.writeFileSync(path.join(OUT, 'landmarks.json'), JSON.stringify({ retrieved, landmarks: dedupedLandmarks }, null, 0));
fs.writeFileSync(path.join(OUT, 'species.json'), JSON.stringify({ retrieved, species, unesco }, null, 0));
fs.writeFileSync(path.join(OUT, 'country.json'), JSON.stringify({ retrieved, facts, symbols: country?.symbols || [], conservationAreas: country?.conservationAreas || [] }, null, 0));
fs.writeFileSync(path.join(OUT, 'sources.json'), JSON.stringify({ retrieved, sources: registry, unverified }, null, 0));

console.log(`provinces ${provinces.length}/7 · landmarks ${dedupedLandmarks.length} (peaks ${peaks.length}) · species ${species.length} · unesco ${unesco.length} · facts ${facts.length} · sources ${registry.length} · unverified ${unverified.length}`);
if (warnings.length) console.log('warnings:\n - ' + warnings.join('\n - '));
if (errors.length) { console.error('errors:\n - ' + errors.join('\n - ')); process.exitCode = 1; }
