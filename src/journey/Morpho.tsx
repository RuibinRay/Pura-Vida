// A blue morpho (Morpho helenor) drawn as SVG: brilliant blue upper wings with a dark margin, the body between.
// It flies along a CSS motion path (offset-path) and flaps by scaling each wing about the body; both respect
// reduced motion through the stylesheet (the animations are only declared under no-preference).
export function Morpho({ className, size = 64, label }: { className?: string; size?: number; label?: string }) {
  return (
    <span className={'morpho ' + (className || '')} style={{ width: size, height: size * 0.8 }} aria-label={label} role={label ? 'img' : undefined} aria-hidden={label ? undefined : true}>
      <svg viewBox="0 0 100 80" width="100%" height="100%">
        <defs>
          <radialGradient id="morphoBlue" cx="40%" cy="45%" r="70%">
            <stop offset="0" stopColor="#8fd8ff" />
            <stop offset="0.45" stopColor="#2d8df0" />
            <stop offset="1" stopColor="#0d3fa8" />
          </radialGradient>
        </defs>
        <g className="morpho__wing morpho__wing--l">
          <path d="M49 40 C 38 10, 10 4, 4 20 C 0 32, 10 44, 26 42 C 12 46, 4 58, 10 70 C 18 80, 40 70, 49 46 Z" fill="url(#morphoBlue)" stroke="#0b1a3a" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M14 22 C 24 18, 34 22, 44 36" fill="none" stroke="#0b1a3a" strokeWidth="1.2" opacity="0.5" />
        </g>
        <g className="morpho__wing morpho__wing--r">
          <path d="M51 40 C 62 10, 90 4, 96 20 C 100 32, 90 44, 74 42 C 88 46, 96 58, 90 70 C 82 80, 60 70, 51 46 Z" fill="url(#morphoBlue)" stroke="#0b1a3a" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M86 22 C 76 18, 66 22, 56 36" fill="none" stroke="#0b1a3a" strokeWidth="1.2" opacity="0.5" />
        </g>
        <ellipse cx="50" cy="44" rx="3.2" ry="12" fill="#1a1a1a" />
        <path d="M48 32 C 44 24, 40 20, 36 18 M52 32 C 56 24, 60 20, 64 18" fill="none" stroke="#1a1a1a" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}
