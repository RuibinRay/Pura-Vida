// The opening's descent. Before the forest, the visitor is above the country: two plates rendered from the site's own
// 3D map (measured relief, Sentinel-2 imagery) — Costa Rica from high over the Pacific, then a lower look across the
// Central Valley at Poás, Barva and Irazú with the Caribbean plain beyond. The scroll pushes into the first, hands
// over to the second, and drops through cloud into the clearing of the first stop. Everything is a function of the
// first stop's progress (--pn, written by the journey driver on data-scene="1"), so scrolling back climbs out again.
const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/') + 'plates/';
const WIDTHS = [960, 1600, 2560];
const set = (name: string) => WIDTHS.map((w) => `${BASE}aerial/${name}-${w}.webp ${w}w`).join(', ');

/** The share of the first stop the descent takes; the forest's own walk-in follows. Mirrored in journey.css (--aerial). */
export const AERIAL_SHARE = 0.36;

export function Aerial({ live }: { live: boolean }) {
  return (
    <div className="aerial" data-scene={1} aria-hidden="true">
      <img className="aerial__img aerial__img--low" src={`${BASE}aerial/low-1600.webp`} srcSet={set('low')} sizes="100vw" width={2544} height={1424} alt="" decoding="async" />
      <img className="aerial__img aerial__img--high" src={`${BASE}aerial/high-1600.webp`} srcSet={set('high')} sizes="100vw" width={2544} height={1424} alt="" decoding="async" fetchPriority="high" />
      {live && <div className="aerial__clouds aerial__clouds--far" style={{ backgroundImage: `url(${BASE}mist-2.png)` }} />}
      {live && <div className="aerial__clouds aerial__clouds--near" style={{ backgroundImage: `url(${BASE}mist-1.png)` }} />}
      <div className="aerial__shade" />
    </div>
  );
}
