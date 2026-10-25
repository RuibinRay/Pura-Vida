// Chapter 2's facts: a few sourced numbers with restrained visualisations (rings, bars, counts).
// Every tile reads from the generated content; a missing fact simply does not render.
import { Link } from '../ui/Link';
import { useT } from '../i18n';
import type { CountryFact } from '../content';
import { StatusTag } from '../ui/Sources';

function Ring({ pct, color }: { pct: number; color: string }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, pct));
  return (
    <svg className="fact__viz" viewBox="0 0 56 56" width="56" height="56" aria-hidden="true">
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(244,238,223,0.18)" strokeWidth="6" />
      <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(c * p) / 100} ${c}`} transform="rotate(-90 28 28)" />
    </svg>
  );
}

function Bars({ values, color }: { values: { label: string; v: number }[]; color: string }) {
  const max = Math.max(...values.map((x) => x.v), 1);
  return (
    <svg className="fact__viz fact__viz--bars" viewBox="0 0 120 56" width="120" height="56" aria-hidden="true">
      {values.map((x, i) => (
        <g key={x.label} transform={`translate(0 ${i * 26})`}>
          <rect x="0" y="4" width={(x.v / max) * 120} height="12" rx="3" fill={color} opacity={i === 0 ? 1 : 0.6} />
          <text x="0" y="26" fontSize="9" fill="rgba(244,238,223,0.75)" fontFamily="var(--font-ui)">{x.label}</text>
        </g>
      ))}
    </svg>
  );
}

function Dots({ of, color }: { of: number; color: string }) {
  // "1 in N": a 5×4 grid with one dot lit when N ≥ 20, otherwise the share of 20 dots
  const lit = of >= 20 ? 1 : Math.max(1, Math.min(20, Math.round(20 / of)));
  return (
    <svg className="fact__viz" viewBox="0 0 70 56" width="70" height="56" aria-hidden="true">
      {Array.from({ length: 20 }, (_, i) => (
        <circle key={i} cx={8 + (i % 5) * 13.5} cy={8 + Math.floor(i / 5) * 13} r="4.6" fill={i < lit ? color : 'rgba(244,238,223,0.2)'} />
      ))}
    </svg>
  );
}

const fmt = (v: number | string, lang: string, digits = 0) => (typeof v === 'number' ? v.toLocaleString(lang === 'zh' ? 'zh-CN' : lang === 'es' ? 'es-CR' : 'en', { maximumFractionDigits: digits }) : v);

export function NatureFacts({ facts, limit = 6 }: { facts: CountryFact[]; limit?: number }) {
  const { t, l, lang } = useT();
  const by = (k: string) => facts.find((f) => f.key === k);
  const area = by('area');
  const bio = by('biodiversityShare');
  const protectedT = by('protectedTerritory');
  const renewable = by('renewableElectricity');
  const birds = by('birdSpecies');
  const coasts = by('coastlines');
  const volcanoes = by('volcanoes');
  const species = by('speciesKnown');
  const forest = by('forestCover');
  const high = by('highestPoint');
  const tiles: { key: string; label: string; value: string; unit?: string; viz: React.ReactNode; fact: CountryFact }[] = [];
  const EARTH_LAND_KM2 = 148_900_000;
  if (area && typeof area.value === 'number') {
    tiles.push({ key: 'area', label: t('journey.ch2.lbl.area'), value: fmt(area.value, lang), unit: 'km²', viz: <Dots of={Math.round(EARTH_LAND_KM2 / area.value / 100) * 100} color="var(--gold)" />, fact: area });
  }
  if (bio && typeof bio.value === 'number') {
    tiles.push({ key: 'bio', label: t('journey.ch2.lbl.bio'), value: `≈ ${fmt(bio.value, lang)} %`, viz: <Dots of={Math.round(100 / bio.value)} color="var(--canopy)" />, fact: bio });
  }
  if (protectedT && typeof protectedT.value === 'number') {
    tiles.push({ key: 'prot', label: t('journey.ch2.lbl.protected'), value: `${fmt(protectedT.value, lang)} %`, viz: <Ring pct={protectedT.value} color="var(--turquoise)" />, fact: protectedT });
  }
  if (forest && typeof forest.value === 'number') {
    tiles.push({ key: 'forest', label: t('journey.ch2.forest'), value: `${fmt(forest.value, lang)} %`, viz: <Ring pct={forest.value} color="var(--canopy)" />, fact: forest });
  }
  if (birds && typeof birds.value === 'number') {
    const groups = [{ label: t('journey.ch2.birds'), v: birds.value }];
    const mam = by('mammalSpecies'); const amp = by('amphibianSpecies'); const rep = by('reptileSpecies');
    if (mam && typeof mam.value === 'number') groups.push({ label: t('journey.ch2.mammals'), v: mam.value });
    if (rep && typeof rep.value === 'number') groups.push({ label: t('journey.ch2.reptiles'), v: rep.value });
    if (amp && typeof amp.value === 'number') groups.push({ label: t('journey.ch2.amphibians'), v: amp.value });
    tiles.push({ key: 'birds', label: t('journey.ch2.lbl.birds'), value: fmt(birds.value, lang), viz: <Bars values={groups.slice(0, 2)} color="var(--sunset)" />, fact: birds });
  }
  if (coasts && typeof coasts.value === 'number') {
    const m = /([\d,.]+)\s*km\s*Pacific.*?([\d,.]+)\s*km\s*Caribbean/.exec(coasts.unit || '');
    const pac = m ? Number(m[1].replace(/,/g, '')) : NaN; const car = m ? Number(m[2].replace(/,/g, '')) : NaN;
    const viz = Number.isFinite(pac) && Number.isFinite(car) ? <Bars values={[{ label: t('journey.ch2.pacific'), v: pac }, { label: t('journey.ch2.caribbean'), v: car }]} color="var(--turquoise)" /> : <Bars values={[{ label: 'km', v: coasts.value }]} color="var(--turquoise)" />;
    tiles.push({ key: 'coasts', label: t('journey.ch2.lbl.coast'), value: `${fmt(coasts.value, lang)} km`, viz, fact: coasts });
  }
  if (volcanoes && typeof volcanoes.value === 'number') {
    tiles.push({ key: 'volc', label: l(volcanoes.label), value: fmt(volcanoes.value, lang), unit: t('journey.ch2.active'), viz: <Dots of={2} color="var(--sunset)" />, fact: volcanoes });
  }
  if (species && typeof species.value === 'number') {
    tiles.push({ key: 'species', label: l(species.label), value: fmt(species.value, lang), viz: <Bars values={[{ label: t('journey.ch2.known'), v: species.value }]} color="var(--canopy)" />, fact: species });
  }
  if (renewable && typeof renewable.value === 'number') {
    tiles.push({ key: 'ren', label: l(renewable.label), value: `${fmt(renewable.value, lang, 1)} %`, viz: <Ring pct={renewable.value} color="var(--gold)" />, fact: renewable });
  }
  if (high && typeof high.value === 'string') {
    tiles.push({ key: 'high', label: l(high.label), value: high.value.replace(/^.*?,\s*/, ''), viz: <Bars values={[{ label: high.value.split(',')[0], v: 3820 }]} color="var(--stone)" />, fact: high });
  }
  if (!tiles.length) return null;
  return (
    <ul className="facts-grid">
      {tiles.slice(0, limit).map((tile) => (
        <li key={tile.key} className="fact">
          {tile.viz}
          <div className="fact__body">
            <p className="fact__label">{tile.label}</p>
            <p className="fact__value tnum">{tile.value}{tile.unit && tile.unit !== 'km²' ? <small> {tile.unit}</small> : null}</p>
            <p className="fact__meta ui">
              {tile.fact.status !== 'confirmed' && <StatusTag status={tile.fact.status} />}
              {tile.fact.year ? <span className="muted">{tile.fact.year}</span> : null}
              <Link to="/sources" className="fact__src">{t('common.sourcesN', { n: tile.fact.sources.length })}</Link>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
