// A passport stamp: a ring of text with the province name, a date in the middle. Drawn in SVG so it scales.
export function Stamp({ label, date, color, stamped }: { label: string; date?: string; color: string; stamped: boolean }) {
  const id = 'stamp-' + label.replace(/\W+/g, '-').toLowerCase();
  const text = (label + ' · ').repeat(3).toUpperCase();
  return (
    <svg className={'stamp' + (stamped ? ' is-stamped' : '')} viewBox="0 0 120 120" width="112" height="112" role="img" aria-label={stamped ? `${label} — ${date}` : label} style={{ ['--stamp' as string]: color }}>
      <defs>
        <path id={id} d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
      </defs>
      <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth={stamped ? 2.4 : 1} strokeDasharray={stamped ? undefined : '3 4'} />
      <circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" strokeWidth={stamped ? 1.4 : 0.6} />
      <text fontSize="10" letterSpacing="1.4" fill="currentColor" fontFamily="Albert Sans Variable, system-ui, sans-serif" fontWeight={700}>
        <textPath href={'#' + id} startOffset="2">{text}</textPath>
      </text>
      {stamped ? (
        <>
          <text x="60" y="56" textAnchor="middle" fontSize="9" fill="currentColor" fontFamily="Albert Sans Variable, system-ui, sans-serif" fontWeight={600} letterSpacing="1">PURA VIDA</text>
          <text x="60" y="70" textAnchor="middle" fontSize="9.5" fill="currentColor" fontFamily="Albert Sans Variable, system-ui, sans-serif">{date}</text>
        </>
      ) : (
        <text x="60" y="64" textAnchor="middle" fontSize="18" fill="currentColor" opacity="0.45">·</text>
      )}
    </svg>
  );
}
