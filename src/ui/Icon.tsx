// Inline, stroke-based icons (currentColor). Decorative by default; pass `label` to make one meaningful.
const PATHS: Record<string, string> = {
  search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm9 16-4.3-4.3',
  layers: 'M12 3 2 8l10 5 10-5-10-5zM2 12l10 5 10-5M2 16l10 5 10-5',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18',
  play: 'M7 5v14l11-7z',
  pause: 'M8 5v14M16 5v14',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  back: 'M19 12H5M11 6l-6 6 6 6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  stamp: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8 4-2-1-.3-1.6 1.2-1.8-1.5-1.5-1.8 1.2L14 7l-1-2h-2l-1 2-1.6.3-1.8-1.2L5.1 7.6l1.2 1.8L6 11l-2 1 2 1 .3 1.6-1.2 1.8 1.5 1.5 1.8-1.2L10 17l1 2h2l1-2 1.6-.3 1.8 1.2 1.5-1.5-1.2-1.8L18 13z',
  sound: 'M4 10v4h4l5 4V6l-5 4H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11',
  mute: 'M4 10v4h4l5 4V6l-5 4H4zM16 9l5 6M21 9l-5 6',
  language: 'M3 5h12M9 3v2c0 5-3 9-6 11M6 9c1 3 4 6 8 8M13 20l4-9 4 9M14.5 17h5',
  sun: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  chevron: 'M6 9l6 6 6-6',
  external: 'M14 4h6v6M20 4l-9 9M19 14v6H5V6h6',
  check: 'M5 12l5 5 9-11',
  pin: 'M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11zm0-9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  leaf: 'M4 20c0-9 5-14 16-16-1 11-6 16-15 16M4 20l8-8',
  skip: 'M5 5l9 7-9 7zM17 5v14',
  spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z',
  volcano: 'M3 20l6-12 2 3 1-5 3 6 2-3 4 11zM10 5c0-2 1-3 2-3s2 1 2 3',
  wave: 'M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 7c2-2 4-2 6 0s4 2 6 0 4-2 6 0',
  town: 'M3 21V10l5-4 5 4v11M8 21v-5h4v5M13 21V8l4-3 4 3v13M16 21v-4h3v4M3 21h18',
  paw: 'M12 21c-3 0-5-2-5-4 0-1.6 1.4-3 2.5-4 1-1 1.5-2 2.5-2s1.5 1 2.5 2c1.1 1 2.5 2.4 2.5 4 0 2-2 4-5 4zM5.5 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18.5 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM9 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM15 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  bowl: 'M3 11h18a9 9 0 0 1-18 0zM8 11c0-3 1-5 4-6M14 5c2 1 3 3 3 6M9 20h6',
  route: 'M5 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM19 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM7 18c6 0 4-10 10-10',
  photo: 'M4 7h3l2-2h6l2 2h3v12H4zM12 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
};

export function Icon({ name, label, size = 18 }: { name: keyof typeof PATHS | string; label?: string; size?: number }) {
  const d = PATHS[name] ?? PATHS.arrow;
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden={label ? undefined : true} role={label ? 'img' : undefined} aria-label={label} focusable="false">
      <path d={d} />
    </svg>
  );
}
