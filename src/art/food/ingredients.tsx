// Ingredient stickers: 32-unit `<g>` drawings (viewBox 0 0 32 32) in the site's sticker style — ink outline,
// flat fill, one highlight, one shade. `ingredientIconFor` picks one from an ingredient's English text.

const INK = '#2a1d14';
const S = { stroke: INK, strokeWidth: 1.6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

const Rice = () => (
  <g>
    <path d="M4 15 C 4 24, 28 24, 28 15 C 28 10, 4 10, 4 15 Z" fill="#f5efe2" {...S} />
    <path d="M6 15 C 8 20, 24 20, 26 15" fill="#fffbf0" stroke="none" />
    <g fill="#fffbf0" stroke="#d8c9a0" strokeWidth={0.6}>
      <ellipse cx={10} cy={14} rx={2.4} ry={1.1} transform="rotate(-20 10 14)" /><ellipse cx={16} cy={12} rx={2.4} ry={1.1} transform="rotate(15 16 12)" />
      <ellipse cx={22} cy={14} rx={2.4} ry={1.1} transform="rotate(-30 22 14)" /><ellipse cx={13} cy={17} rx={2.4} ry={1.1} transform="rotate(40 13 17)" />
      <ellipse cx={19} cy={17} rx={2.4} ry={1.1} transform="rotate(-10 19 17)" />
    </g>
    <path d="M4 15 C 4 24, 28 24, 28 15" fill="none" stroke="#e0d2b0" strokeWidth={1} />
    <path d="M5 19 C 8 25, 24 25, 27 19 L 26 24 C 24 28, 8 28, 6 24 Z" fill="#3a6f7a" {...S} />
    <path d="M8 22 C 12 25, 20 25, 24 22" fill="none" stroke="#6aa0aa" strokeWidth={1.4} />
  </g>
);

const Bean = ({ c, h, d }: { c: string; h: string; d: string }) => (
  <g>
    <path d="M10 6 C 4 8, 4 18, 10 22 C 16 26, 24 24, 26 16 C 28 8, 16 4, 10 6 Z" fill={c} {...S} />
    <path d="M10 9 C 8 12, 9 17, 13 19" fill="none" stroke={h} strokeWidth={2.2} strokeLinecap="round" />
    <path d="M16 21 C 20 22, 24 19, 24 15" fill="none" stroke={d} strokeWidth={1.8} strokeLinecap="round" />
    <ellipse cx={15} cy={13} rx={1.6} ry={3} fill={h} opacity={0.9} transform="rotate(-30 15 13)" />
    <path d="M20 24 C 18 28, 12 29, 8 26 C 12 26, 16 26, 20 24 Z" fill={c} {...S} />
  </g>
);
const BeansBlack = () => <Bean c="#2b1a1a" h="#5a4040" d="#140c0c" />;
const BeansRed = () => <Bean c="#8f3a2c" h="#c0604a" d="#5a1e18" />;

const Egg = () => (
  <g>
    <path d="M5 16 C 4 9, 12 5, 18 7 C 26 9, 29 16, 26 22 C 23 28, 8 28, 5 22 Z" fill="#fbf6ee" {...S} />
    <path d="M9 11 C 12 8, 17 8, 21 10" fill="none" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" />
    <path d="M8 22 C 12 25, 20 25, 24 22" fill="none" stroke="#e9d9b8" strokeWidth={1.6} strokeLinecap="round" />
    <circle cx={15} cy={16} r={5.5} fill="#f2a71c" stroke="#c9780f" strokeWidth={1.2} />
    <ellipse cx={13.5} cy={14.5} rx={1.8} ry={1.2} fill="#fde38a" />
  </g>
);

const Plantain = () => (
  <g>
    <path d="M6 22 C 4 14, 10 6, 20 5 C 23 5, 26 6, 27 8 C 20 10, 13 16, 12 26 C 9 26, 7 25, 6 22 Z" fill="#e8b23a" {...S} />
    <path d="M9 19 C 10 13, 15 8, 21 7" fill="none" stroke="#f8d57a" strokeWidth={2} strokeLinecap="round" />
    <path d="M12 25 C 14 18, 18 12, 25 9" fill="none" stroke="#a8711a" strokeWidth={1.6} strokeLinecap="round" />
    <path d="M26 7 L 29 5" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
    <circle cx={8} cy={23} r={1.2} fill="#5a3a12" /><circle cx={18} cy={9} r={1} fill="#5a3a12" />
  </g>
);

const Tortilla = () => (
  <g>
    <ellipse cx={16} cy={17} rx={13} ry={9} fill="#efd9a6" {...S} />
    <ellipse cx={14} cy={15} rx={9} ry={4.5} fill="#f6e6bd" />
    <g fill="#c9a25c"><circle cx={9} cy={18} r={1.3} /><circle cx={14} cy={21} r={1.1} /><circle cx={20} cy={13} r={1.3} /><circle cx={22} cy={19} r={1.1} /><circle cx={16} cy={12} r={1} /></g>
    <path d="M7 21 C 11 24, 21 24, 25 21" fill="none" stroke="#d9b874" strokeWidth={1} />
  </g>
);

const Cheese = () => (
  <g>
    <path d="M4 22 L 18 9 L 28 15 L 28 24 L 4 27 Z" fill="#f3e6b8" {...S} />
    <path d="M4 22 L 18 9 L 28 15 L 16 20 Z" fill="#fbf3d4" {...S} />
    <path d="M16 20 L 16 26" stroke={INK} strokeWidth={1.2} opacity={0.6} />
    <g fill="#e2cf90" stroke="#c9b26c" strokeWidth={0.6}><circle cx={9} cy={23} r={1.7} /><circle cx={22} cy={22} r={1.5} /><circle cx={20} cy={15.5} r={1.3} /><circle cx={13} cy={17} r={1.2} /></g>
    <path d="M7 21 L 17 12" stroke="#ffffff" strokeWidth={1.4} strokeLinecap="round" opacity={0.8} />
  </g>
);

const Natilla = () => (
  <g>
    <path d="M6 14 C 6 8, 26 8, 26 14 L 24 25 C 24 27, 8 27, 8 25 Z" fill="#f5efe2" {...S} />
    <path d="M6 14 C 6 19, 26 19, 26 14" fill="none" stroke="#c8793a" strokeWidth={1.4} />
    <path d="M9 12 C 11 8, 21 8, 23 12 C 20 14, 12 14, 9 12 Z" fill="#ffffff" {...S} />
    <path d="M12 11 C 14 9, 18 9, 20 11" fill="none" stroke="#e6dcc4" strokeWidth={1.2} />
    <path d="M10 24 L 12 17" stroke="#ffffff" strokeWidth={1.4} opacity={0.8} />
  </g>
);

const Culantro = () => (
  <g>
    <path d="M16 28 C 10 22, 8 14, 12 8 C 14 10, 16 6, 18 4 C 22 8, 24 16, 20 22 C 19 24, 17 26, 16 28 Z" fill="#4f9a4a" {...S} />
    <path d="M16 27 L 17 8" stroke="#2f6b3a" strokeWidth={1.3} />
    <path d="M12 14 l 4 -1 M13 19 l 3 -1 M21 12 l -3 -1 M20 18 l -3 -1" stroke="#8cc04b" strokeWidth={1.2} strokeLinecap="round" />
    <path d="M12 8 l -1 -2 M18 4 l 1 -2" stroke="#cfe3a0" strokeWidth={1.2} strokeLinecap="round" />
  </g>
);

const Onion = () => (
  <g>
    <path d="M16 6 C 24 10, 28 16, 27 22 C 26 28, 6 28, 5 22 C 4 16, 8 10, 16 6 Z" fill="#c9a0c8" {...S} />
    <path d="M12 9 C 9 13, 8 19, 10 25" fill="none" stroke="#e9d2e6" strokeWidth={2} strokeLinecap="round" />
    <path d="M20 9 C 23 13, 24 19, 22 25" fill="none" stroke="#8e4a9e" strokeWidth={1.6} strokeLinecap="round" />
    <path d="M16 8 C 16 14, 16 20, 16 26" fill="none" stroke="#8e4a9e" strokeWidth={1.2} opacity={0.7} />
    <path d="M14 6 C 15 4, 17 3, 19 3 C 18 5, 17 6, 17 7" fill="#8cc04b" {...S} />
  </g>
);

const SweetPepper = () => (
  <g>
    <path d="M9 11 C 6 12, 5 18, 7 23 C 9 28, 14 28, 16 26 C 18 28, 23 28, 25 23 C 27 18, 26 12, 23 11 Z" fill="#d9484f" {...S} />
    <path d="M9 13 C 7 17, 8 22, 10 25" fill="none" stroke="#f08a8a" strokeWidth={2} strokeLinecap="round" />
    <path d="M23 13 C 25 17, 24 22, 22 25" fill="none" stroke="#9a2a30" strokeWidth={1.6} strokeLinecap="round" />
    <path d="M16 11 L 16 26" stroke="#9a2a30" strokeWidth={1.2} opacity={0.6} />
    <path d="M12 10 C 14 8, 18 8, 20 10 C 18 12, 14 12, 12 10 Z" fill="#4f9a4a" {...S} />
    <path d="M16 9 L 16 5" stroke="#2f6b3a" strokeWidth={2.2} strokeLinecap="round" />
  </g>
);

const Garlic = () => (
  <g>
    <path d="M16 7 C 10 11, 6 16, 7 22 C 8 27, 24 27, 25 22 C 26 16, 22 11, 16 7 Z" fill="#f3ecdf" {...S} />
    <path d="M12 12 C 10 16, 10 21, 11 25" fill="none" stroke={INK} strokeWidth={1} opacity={0.5} />
    <path d="M20 12 C 22 16, 22 21, 21 25" fill="none" stroke={INK} strokeWidth={1} opacity={0.5} />
    <path d="M16 10 L 16 25" stroke={INK} strokeWidth={1} opacity={0.5} />
    <path d="M13 13 C 12 17, 12 21, 13 24" fill="none" stroke="#ffffff" strokeWidth={1.4} strokeLinecap="round" />
    <path d="M23 20 C 24 23, 23 25, 22 26" fill="none" stroke="#c9b9a0" strokeWidth={1.4} strokeLinecap="round" />
    <path d="M16 7 C 15 5, 16 3, 18 2 C 18 4, 17 6, 17 7" fill="#c9b9a0" {...S} />
  </g>
);

const Coffee = () => (
  <g>
    <ellipse cx={15} cy={25} rx={12} ry={3.5} fill="#f5efe2" {...S} />
    <path d="M6 11 C 6 20, 8 24, 15 24 C 22 24, 24 20, 24 11 Z" fill="#f5efe2" {...S} />
    <ellipse cx={15} cy={11} rx={9} ry={3.4} fill="#f5efe2" {...S} />
    <ellipse cx={15} cy={11} rx={6.5} ry={2.2} fill="#4a2a18" />
    <ellipse cx={13} cy={10.5} rx={2.5} ry={0.8} fill="#9c6a44" opacity={0.8} />
    <path d="M24 13 c 4 -1, 5 5, 1 6" fill="none" stroke={INK} strokeWidth={3.2} strokeLinecap="round" />
    <path d="M24 13 c 4 -1, 5 5, 1 6" fill="none" stroke="#f5efe2" strokeWidth={1.6} strokeLinecap="round" />
    <path d="M8 14 L 9 21" stroke="#ffffff" strokeWidth={1.4} strokeLinecap="round" opacity={0.8} />
    <path d="M12 7 c -2 -2, 2 -3, 0 -5 M17 7 c -2 -2, 2 -3, 0 -5" fill="none" stroke="#a9a192" strokeWidth={1.2} strokeLinecap="round" />
  </g>
);

const Pork = () => (
  <g>
    <path d="M9 9 C 14 5, 24 6, 27 12 C 29 17, 26 23, 20 25 C 14 27, 7 24, 6 18 C 5 14, 6 11, 9 9 Z" fill="#e39a8c" {...S} />
    <path d="M10 10 C 14 7, 22 8, 25 12" fill="none" stroke="#f3c7bf" strokeWidth={2.4} strokeLinecap="round" />
    <path d="M9 20 C 13 24, 19 25, 24 22" fill="none" stroke="#b5695a" strokeWidth={1.8} strokeLinecap="round" />
    <path d="M24 12 C 27 10, 29 14, 27 19 C 25 23, 21 24, 20 22" fill="none" stroke="#fbf6ee" strokeWidth={3} strokeLinecap="round" />
    <path d="M4 22 C 2 24, 2 28, 6 29 C 8 29, 9 27, 8 25 L 11 20 L 8 18 Z" fill="#fbf6ee" {...S} />
    <circle cx={14} cy={15} r={1.4} fill="#fbf6ee" opacity={0.8} />
  </g>
);

const Chicken = () => (
  <g>
    <path d="M12 8 C 18 4, 27 8, 27 15 C 27 21, 21 24, 15 23 C 10 22, 7 18, 8 13 C 8 11, 10 9, 12 8 Z" fill="#c4782f" {...S} />
    <path d="M13 10 C 17 7, 23 8, 25 12" fill="none" stroke="#e8a85c" strokeWidth={2.2} strokeLinecap="round" />
    <path d="M11 18 C 15 22, 21 22, 25 18" fill="none" stroke="#8a4a1a" strokeWidth={1.8} strokeLinecap="round" />
    <path d="M10 14 C 14 13, 20 13, 24 15" fill="none" stroke="#5e2f0e" strokeWidth={1.2} strokeLinecap="round" opacity={0.8} />
    <path d="M9 19 C 7 22, 5 25, 4 28" fill="none" stroke={INK} strokeWidth={4.4} strokeLinecap="round" />
    <path d="M9 19 C 7 22, 5 25, 4 28" fill="none" stroke="#f3ecdf" strokeWidth={2.2} strokeLinecap="round" />
    <circle cx={3.5} cy={28.5} r={2} fill="#f3ecdf" stroke={INK} strokeWidth={1.1} /><circle cx={6} cy={29} r={1.6} fill="#f3ecdf" stroke={INK} strokeWidth={1.1} />
  </g>
);

const Beef = () => (
  <g>
    <path d="M6 10 C 10 6, 22 6, 26 10 C 29 14, 27 24, 20 26 C 12 27, 4 22, 6 10 Z" fill="#8c3b2c" {...S} />
    <path d="M9 10 C 13 8, 20 8, 24 11" fill="none" stroke="#c0604a" strokeWidth={2} strokeLinecap="round" />
    <path d="M9 21 C 14 24, 20 24, 24 20" fill="none" stroke="#5a1e18" strokeWidth={1.8} strokeLinecap="round" />
    <path d="M12 15 C 16 13, 20 14, 23 17" fill="none" stroke="#fbf6ee" strokeWidth={1.8} strokeLinecap="round" opacity={0.85} />
    <path d="M6 14 C 5 18, 6 22, 9 24" fill="none" stroke="#fbf6ee" strokeWidth={2.2} strokeLinecap="round" />
  </g>
);

const Fish = () => (
  <g>
    <path d="M6 16 C 10 9, 18 8, 24 13 L 29 9 L 28 16 L 29 23 L 24 19 C 18 24, 10 23, 6 16 Z" fill="#2a7fa1" {...S} />
    <path d="M9 14 C 12 11, 17 11, 21 13" fill="none" stroke="#8fd3cf" strokeWidth={2} strokeLinecap="round" />
    <path d="M9 19 C 13 21, 18 21, 22 18" fill="none" stroke="#12456b" strokeWidth={1.6} strokeLinecap="round" />
    <circle cx={10} cy={15} r={1.8} fill="#ffffff" stroke={INK} strokeWidth={1} /><circle cx={10.4} cy={15.2} r={0.8} fill="#1d1a16" />
    <path d="M15 12 C 16 15, 16 18, 15 21" fill="none" stroke="#12456b" strokeWidth={1.2} strokeLinecap="round" />
  </g>
);

const Corn = () => (
  <g>
    <path d="M12 6 C 16 4, 22 8, 22 16 C 22 23, 18 28, 14 28 C 9 28, 7 22, 8 14 C 8 10, 10 7, 12 6 Z" fill="#e6c54a" {...S} />
    <g fill="#f5df7c" stroke="#b89426" strokeWidth={0.5}>
      <circle cx={12} cy={10} r={1.6} /><circle cx={17} cy={10} r={1.6} /><circle cx={11} cy={14} r={1.6} /><circle cx={16} cy={14} r={1.6} /><circle cx={20} cy={14} r={1.4} />
      <circle cx={11} cy={18} r={1.6} /><circle cx={16} cy={18} r={1.6} /><circle cx={20} cy={18} r={1.4} /><circle cx={12} cy={22} r={1.6} /><circle cx={17} cy={22} r={1.6} /><circle cx={14} cy={25} r={1.4} />
    </g>
    <path d="M8 14 C 4 12, 3 20, 6 27 C 8 24, 8 20, 8 14 Z" fill="#8cc04b" {...S} />
    <path d="M22 12 C 26 10, 28 17, 26 25 C 23 22, 22 18, 22 12 Z" fill="#4f9a4a" {...S} />
    <path d="M14 4 L 16 2" stroke="#8c5a1a" strokeWidth={1.4} strokeLinecap="round" />
  </g>
);

const Carrot = () => (
  <g>
    <path d="M8 26 C 10 18, 14 12, 22 9 C 25 8, 27 10, 26 13 C 22 19, 16 24, 8 26 Z" fill="#e8812a" {...S} />
    <path d="M12 21 C 15 16, 19 13, 23 11" fill="none" stroke="#f6a85a" strokeWidth={2} strokeLinecap="round" />
    <path d="M12 24 l 3 -1 M16 20 l 3 -1 M20 16 l 2 -1" stroke="#b85a14" strokeWidth={1.2} strokeLinecap="round" />
    <path d="M24 9 C 25 5, 28 4, 30 5 M25 9 C 23 5, 24 2, 25 2" fill="none" stroke="#4f9a4a" strokeWidth={2.2} strokeLinecap="round" />
  </g>
);

const Peas = () => (
  <g>
    <path d="M5 18 C 6 12, 10 10, 14 10 L 24 10 C 28 10, 29 14, 27 18 C 24 24, 10 24, 5 18 Z" fill="#8cc04b" {...S} />
    <path d="M7 14 C 10 11, 20 10, 26 12" fill="none" stroke="#cfe3a0" strokeWidth={1.6} strokeLinecap="round" />
    <g fill="#5fa33a" stroke={INK} strokeWidth={1.3}><circle cx={10} cy={17} r={3.4} /><circle cx={17} cy={17} r={3.4} /><circle cx={24} cy={17} r={3.2} /></g>
    <g fill="#a6d46e"><circle cx={9} cy={16} r={1.1} /><circle cx={16} cy={16} r={1.1} /><circle cx={23} cy={16} r={1} /></g>
    <path d="M26 10 C 27 7, 29 6, 30 8" fill="none" stroke="#4f9a4a" strokeWidth={1.6} strokeLinecap="round" />
  </g>
);

const Chayote = () => (
  <g>
    <path d="M16 5 C 22 6, 27 12, 26 20 C 25 26, 20 28, 16 28 C 12 28, 7 26, 6 20 C 5 12, 10 6, 16 5 Z" fill="#b9d48a" {...S} />
    <path d="M12 9 C 9 12, 8 18, 9 24" fill="none" stroke="#dfeab8" strokeWidth={2} strokeLinecap="round" />
    <path d="M21 9 C 24 13, 24 20, 22 25" fill="none" stroke="#7a9a4a" strokeWidth={1.6} strokeLinecap="round" />
    <path d="M16 8 C 16 14, 16 20, 16 26" stroke="#7a9a4a" strokeWidth={1.2} opacity={0.6} />
    <path d="M13 26 C 14 24, 18 24, 19 26" fill="none" stroke={INK} strokeWidth={1.2} />
  </g>
);

const Yuca = () => (
  <g>
    <path d="M4 20 C 8 14, 14 10, 24 8 C 27 8, 29 10, 28 12 C 24 16, 16 22, 7 25 C 4 25, 3 22, 4 20 Z" fill="#8a5a34" {...S} />
    <path d="M12 14 C 16 11, 20 10, 25 9" fill="none" stroke="#b38055" strokeWidth={1.6} strokeLinecap="round" />
    <path d="M8 20 l 2 -3 M14 17 l 2 -3 M20 13 l 2 -3" stroke="#5a3a1a" strokeWidth={1.2} strokeLinecap="round" />
    <path d="M18 22 L 28 26 L 28 29 L 17 25 Z" fill="#f3ecdf" {...S} />
    <path d="M20 24 L 26 26.5" stroke="#ffffff" strokeWidth={1} />
  </g>
);

const Potato = () => (
  <g>
    <path d="M7 14 C 8 8, 16 6, 22 8 C 27 10, 28 18, 25 23 C 22 27, 10 27, 7 22 C 5 19, 6 16, 7 14 Z" fill="#d9b574" {...S} />
    <path d="M10 12 C 13 9, 18 9, 22 11" fill="none" stroke="#f0d49a" strokeWidth={2} strokeLinecap="round" />
    <path d="M10 23 C 14 25, 20 25, 24 22" fill="none" stroke="#a8803e" strokeWidth={1.6} strokeLinecap="round" />
    <g fill="#8c6a32"><ellipse cx={11} cy={17} rx={1.3} ry={0.9} /><ellipse cx={19} cy={14} rx={1.3} ry={0.9} /><ellipse cx={22} cy={19} rx={1.2} ry={0.8} /><ellipse cx={15} cy={21} rx={1.2} ry={0.8} /></g>
  </g>
);

const Squash = () => (
  <g>
    <path d="M16 8 C 24 8, 29 13, 28 20 C 27 26, 21 28, 16 28 C 11 28, 5 26, 4 20 C 3 13, 8 8, 16 8 Z" fill="#e0a526" {...S} />
    <path d="M10 9 C 7 13, 6 20, 8 26 M22 9 C 25 13, 26 20, 24 26 M16 8 L 16 28" fill="none" stroke="#b07a10" strokeWidth={1.3} opacity={0.8} />
    <path d="M11 11 C 12 10, 14 9, 15 9.5" fill="none" stroke="#f6d27a" strokeWidth={2} strokeLinecap="round" />
    <path d="M9 23 C 12 26, 20 26, 23 23" fill="none" stroke="#b07a10" strokeWidth={1.6} strokeLinecap="round" />
    <path d="M15 8 C 15 5, 16 4, 19 3 C 19 5, 18 7, 17 8 Z" fill="#4f9a4a" {...S} />
  </g>
);

const Lime = () => (
  <g>
    <circle cx={13} cy={18} r={9} fill="#8cc04b" {...S} />
    <ellipse cx={10} cy={15} rx={3.5} ry={2.4} fill="#cfe3a0" />
    <path d="M20 6 L 30 10 A 11 11 0 0 1 20 20 Z" fill="#d9ea7a" {...S} />
    <path d="M22 8 L 28 10.5 A 7.5 7.5 0 0 1 22 17 Z" fill="none" stroke="#7aa52a" strokeWidth={1.2} />
    <path d="M22 9 L 27 11 M22 9 L 22 16 M22 9 L 26 14" stroke="#b8d34a" strokeWidth={0.9} />
  </g>
);

const Coconut = () => (
  <g>
    <circle cx={12} cy={16} r={9} fill="#6b4a2d" {...S} />
    <path d="M7 11 C 9 9, 13 8, 16 9" fill="none" stroke="#8a6a44" strokeWidth={2} strokeLinecap="round" />
    <path d="M9 15 c 2 2, 2 5, 0 7 M13 14 c 2 2, 2 5, 0 7" fill="none" stroke="#4a3220" strokeWidth={1.2} strokeLinecap="round" />
    <circle cx={23} cy={19} r={7.5} fill="#6b4a2d" {...S} />
    <circle cx={23} cy={19} r={5.2} fill="#fbf7ee" stroke={INK} strokeWidth={1} />
    <circle cx={23} cy={19} r={2.2} fill="#e9f3f7" />
  </g>
);

const Chile = () => (
  <g>
    <path d="M8 14 C 10 8, 22 8, 24 14 C 26 20, 20 26, 16 26 C 11 26, 6 21, 8 14 Z" fill="#ef6a24" {...S} />
    <path d="M11 13 C 13 10, 18 10, 21 12" fill="none" stroke="#f9a05a" strokeWidth={2} strokeLinecap="round" />
    <path d="M10 21 C 13 24, 19 24, 22 20" fill="none" stroke="#c4441a" strokeWidth={1.6} strokeLinecap="round" />
    <path d="M12 12 C 13 18, 13 22, 13 24 M19 12 C 19 18, 19 22, 19 24" fill="none" stroke="#c4441a" strokeWidth={1} opacity={0.6} />
    <path d="M12 10 C 13 8, 19 8, 20 10 C 18 11, 14 11, 12 10 Z" fill="#4f9a4a" {...S} />
    <path d="M16 9 C 16 7, 18 5, 20 4" fill="none" stroke="#2f6b3a" strokeWidth={2.2} strokeLinecap="round" />
  </g>
);

const Thyme = () => (
  <g>
    <path d="M8 27 C 12 20, 18 13, 26 6" fill="none" stroke="#6b4a2d" strokeWidth={2.2} strokeLinecap="round" />
    <g fill="#4f9a4a" stroke={INK} strokeWidth={1.1}>
      <ellipse cx={11} cy={21} rx={3} ry={1.8} transform="rotate(-50 11 21)" /><ellipse cx={16} cy={21} rx={3} ry={1.8} transform="rotate(40 16 21)" />
      <ellipse cx={14} cy={16} rx={3} ry={1.8} transform="rotate(-50 14 16)" /><ellipse cx={20} cy={16} rx={3} ry={1.8} transform="rotate(40 20 16)" />
      <ellipse cx={18} cy={11} rx={3} ry={1.8} transform="rotate(-50 18 11)" /><ellipse cx={24} cy={11} rx={3} ry={1.8} transform="rotate(40 24 11)" />
      <ellipse cx={23} cy={6} rx={2.6} ry={1.6} transform="rotate(-50 23 6)" />
    </g>
    <g fill="#cfe3a0"><circle cx={10} cy={20} r={0.7} /><circle cx={13} cy={15} r={0.7} /><circle cx={17} cy={10} r={0.7} /></g>
  </g>
);

const Salad = () => (
  <g>
    <path d="M5 18 C 6 10, 14 8, 18 11 C 22 7, 28 10, 27 16 C 29 20, 24 25, 16 25 C 9 25, 4 23, 5 18 Z" fill="#8cc04b" {...S} />
    <path d="M8 16 C 11 12, 16 11, 20 13" fill="none" stroke="#cfe3a0" strokeWidth={2} strokeLinecap="round" />
    <path d="M9 21 C 14 23, 20 23, 25 20" fill="none" stroke="#4f9a4a" strokeWidth={1.6} strokeLinecap="round" />
    <path d="M12 15 l 7 -3 l 3 6 z" fill="#d94b3a" {...S} />
    <path d="M13.5 15 l 4.5 -2 l 2 4 z" fill="#ef6f55" />
    <ellipse cx={22} cy={19} rx={3} ry={2} fill="#f3f0f7" stroke="#8e4a9e" strokeWidth={1} />
  </g>
);

const Achiote = () => (
  <g>
    <path d="M16 6 C 22 6, 27 11, 26 18 C 25 24, 20 27, 16 27 C 12 27, 7 24, 6 18 C 5 11, 10 6, 16 6 Z" fill="#c43a1e" {...S} />
    <g stroke="#f08a5a" strokeWidth={1.3} strokeLinecap="round"><path d="M9 11 l 1 -3 M13 8 l 0 -3 M19 8 l 0 -3 M23 11 l -1 -3 M8 17 l -3 0 M24 17 l 3 0 M10 23 l -2 2 M22 23 l 2 2" /></g>
    <path d="M12 10 C 10 13, 10 18, 12 22" fill="none" stroke="#e8602f" strokeWidth={2} strokeLinecap="round" />
    <g fill="#f2a63a" stroke={INK} strokeWidth={0.8}><circle cx={15} cy={13} r={1.8} /><circle cx={19} cy={16} r={1.8} /><circle cx={14} cy={19} r={1.8} /><circle cx={19} cy={21} r={1.6} /></g>
  </g>
);

const PlantainLeaf = () => (
  <g>
    <path d="M4 24 C 6 12, 16 5, 29 5 C 28 16, 20 26, 6 28 C 5 27, 4 26, 4 24 Z" fill="#3f7a34" {...S} />
    <path d="M5 27 C 12 20, 20 12, 28 6" fill="none" stroke="#1e4218" strokeWidth={1.8} strokeLinecap="round" />
    <g stroke="#7fbf5a" strokeWidth={1} strokeLinecap="round" opacity={0.9}><path d="M10 21 l 4 1 M13 17 l 5 1 M17 13 l 5 1 M21 9 l 4 1 M9 20 l 1 -4 M13 16 l 1 -4 M17 12 l 1 -4" /></g>
  </g>
);

const Salsa = () => (
  <g>
    <path d="M12 3 L 20 3 L 20 10 C 24 12, 25 15, 25 19 L 25 27 C 25 29, 7 29, 7 27 L 7 19 C 7 15, 8 12, 12 10 Z" fill="#7a4a1a" {...S} />
    <rect x={9} y={15} width={14} height={10} rx={1.5} fill="#e8d6a8" stroke={INK} strokeWidth={1.2} />
    <rect x={11} y={17} width={10} height={2.4} rx={1} fill="#2f6b3a" />
    <rect x={11} y={21} width={10} height={1.8} rx={0.9} fill="#d9484f" />
    <rect x={11} y={2} width={10} height={4} rx={1.2} fill="#e0a526" stroke={INK} strokeWidth={1.4} />
    <path d="M9.5 13 L 9.5 26" stroke="#ffffff" strokeWidth={1.4} strokeLinecap="round" opacity={0.4} />
  </g>
);

const Olive = () => (
  <g>
    <ellipse cx={13} cy={18} rx={7} ry={8.5} fill="#5f6b2a" {...S} />
    <ellipse cx={11} cy={14} rx={2.4} ry={3.2} fill="#8a9a44" opacity={0.9} />
    <ellipse cx={13} cy={18} rx={2.4} ry={2.8} fill="#c9484f" stroke={INK} strokeWidth={1} />
    <ellipse cx={23} cy={20} rx={5} ry={6} fill="#3a3236" {...S} />
    <ellipse cx={21.5} cy={17.5} rx={1.6} ry={2.2} fill="#6b6370" />
    <path d="M19 9 C 21 6, 25 6, 27 8" fill="none" stroke="#4f9a4a" strokeWidth={1.8} strokeLinecap="round" />
    <path d="M14 10 L 20 8" stroke="#6b4a2d" strokeWidth={1.6} strokeLinecap="round" />
  </g>
);

const Raisins = () => (
  <g>
    <g fill="#4a2a4e" stroke={INK} strokeWidth={1.5} strokeLinejoin="round">
      <path d="M7 12 C 7 8, 13 8, 13 12 C 13 16, 7 16, 7 12 Z" transform="rotate(-20 10 12)" />
      <path d="M15 9 C 15 5, 21 5, 21 9 C 21 13, 15 13, 15 9 Z" transform="rotate(20 18 9)" />
      <path d="M18 18 C 18 14, 25 14, 25 18 C 25 23, 18 23, 18 18 Z" transform="rotate(-10 21 18)" />
      <path d="M8 21 C 8 17, 15 17, 15 21 C 15 25, 8 25, 8 21 Z" transform="rotate(15 11 21)" />
    </g>
    <g fill="none" stroke="#8a5a8e" strokeWidth={1.1} strokeLinecap="round"><path d="M9 11 c 1 1, 1 2, 0 3 M17 8 c 1 1, 1 2, 0 3 M20 17 c 1 1, 1 3, 0 4 M10 20 c 1 1, 1 2, 0 3" /></g>
    <g fill="#b48ab8" opacity={0.9}><circle cx={9} cy={10} r={0.8} /><circle cx={17} cy={7} r={0.8} /><circle cx={20} cy={16} r={0.8} /><circle cx={10} cy={19} r={0.8} /></g>
  </g>
);

const Celery = () => (
  <g>
    <path d="M10 29 C 9 22, 9 14, 11 10 L 21 10 C 23 14, 23 22, 22 29 Z" fill="#9fd16a" {...S} />
    <path d="M13 27 C 12 20, 12 14, 13 11" fill="none" stroke="#cfe3a0" strokeWidth={2} strokeLinecap="round" />
    <path d="M16 27 L 16 11 M19 27 C 20 20, 20 14, 19 11" fill="none" stroke="#5c8f3b" strokeWidth={1.2} strokeLinecap="round" />
    <path d="M11 10 C 6 9, 4 5, 6 3 C 9 3, 12 5, 13 10 Z" fill="#4f9a4a" {...S} />
    <path d="M21 10 C 26 9, 28 5, 26 3 C 23 3, 20 5, 19 10 Z" fill="#4f9a4a" {...S} />
    <path d="M16 10 C 14 6, 15 3, 17 2 C 19 4, 18 8, 17 10 Z" fill="#8cc04b" {...S} />
    <path d="M9 29 C 12 31, 20 31, 23 29" fill="none" stroke={INK} strokeWidth={1.2} />
  </g>
);

const Butter = () => (
  <g>
    <path d="M4 18 L 12 12 L 28 12 L 28 20 L 20 26 L 4 26 Z" fill="#f2cf5a" {...S} />
    <path d="M4 18 L 12 12 L 28 12 L 20 18 Z" fill="#fae38a" {...S} />
    <path d="M20 18 L 20 26" stroke={INK} strokeWidth={1.3} opacity={0.7} />
    <path d="M7 24 L 17 24" stroke="#c9a12c" strokeWidth={1.4} strokeLinecap="round" />
    <path d="M22 16 L 26 13" stroke="#ffffff" strokeWidth={1.4} strokeLinecap="round" opacity={0.8} />
  </g>
);

const BayLeaf = () => (
  <g>
    <path d="M4 26 C 6 16, 14 8, 28 5 C 27 15, 20 24, 8 28 C 6 28, 4 28, 4 26 Z" fill="#5f8a3a" {...S} />
    <path d="M6 26 C 12 20, 20 12, 27 6" fill="none" stroke="#2f5a24" strokeWidth={1.4} strokeLinecap="round" />
    <path d="M9 20 C 12 16, 17 11, 22 8" fill="none" stroke="#9fc46a" strokeWidth={1.6} strokeLinecap="round" opacity={0.8} />
    <g stroke="#2f5a24" strokeWidth={0.8} opacity={0.8}><path d="M10 22 l 3 2 M14 18 l 3 2 M18 14 l 3 2 M22 10 l 3 1" /></g>
  </g>
);

const StringIcon = () => (
  <g>
    <ellipse cx={16} cy={16} rx={10} ry={8} fill="#e8d6a8" {...S} />
    <g fill="none" stroke="#b89a5a" strokeWidth={1.2} strokeLinecap="round"><path d="M8 13 C 12 11, 20 11, 24 13 M7 16 C 12 14, 20 14, 25 16 M8 19 C 12 17, 20 17, 24 19 M10 22 C 14 20, 18 20, 22 22" /></g>
    <path d="M9 11 C 11 10, 13 10, 15 11" fill="none" stroke="#ffffff" strokeWidth={1.6} strokeLinecap="round" />
    <path d="M24 18 C 28 20, 30 24, 28 28 C 26 30, 24 28, 25 26" fill="none" stroke="#e8d6a8" strokeWidth={3.2} strokeLinecap="round" />
    <path d="M24 18 C 28 20, 30 24, 28 28 C 26 30, 24 28, 25 26" fill="none" stroke={INK} strokeWidth={1.2} strokeLinecap="round" />
  </g>
);

export const INGREDIENT_ICONS: Record<string, () => React.JSX.Element> = {
  rice: Rice, 'beans-black': BeansBlack, 'beans-red': BeansRed, egg: Egg, plantain: Plantain, tortilla: Tortilla, cheese: Cheese,
  natilla: Natilla, culantro: Culantro, onion: Onion, 'sweet-pepper': SweetPepper, garlic: Garlic, coffee: Coffee, pork: Pork,
  chicken: Chicken, beef: Beef, fish: Fish, corn: Corn, carrot: Carrot, peas: Peas, chayote: Chayote, yuca: Yuca, potato: Potato,
  squash: Squash, lime: Lime, coconut: Coconut, chile: Chile, thyme: Thyme, salad: Salad, achiote: Achiote, 'plantain-leaf': PlantainLeaf,
  salsa: Salsa, olive: Olive, raisins: Raisins, celery: Celery, butter: Butter, 'bay-leaf': BayLeaf, string: StringIcon,
};

/** keyword → icon, checked in order (first match wins), so the more specific phrases come first */
const RULES: [RegExp, string][] = [
  [/plantain leaf|plantain leaves|banana leaf|banana leaves|\bwrapper\b/, 'plantain-leaf'],
  [/\bstring\b|twine/, 'string'],
  [/salsa|lizano|worcestershire/, 'salsa'],
  [/bay leaf|bay leaves|laurel/, 'bay-leaf'],
  [/achiote|annatto/, 'achiote'],
  [/protein/, 'chicken'],
  [/sweet pepper|bell pepper|chile dulce/, 'sweet-pepper'],
  [/chile|chili|paname|habanero|hot pepper/, 'chile'],
  [/green beans|vainica|\bpeas\b|garbanzo|chickpea/, 'peas'],
  [/black beans?/, 'beans-black'],
  [/red beans?/, 'beans-red'],
  [/\bbeans?\b|frijol/, 'beans-black'],
  [/coconut/, 'coconut'],
  [/corn tortilla|tortilla/, 'tortilla'],
  [/corn masa|\bmasa\b|corn on the cob|elote|\bcorn\b/, 'corn'],
  [/\brice\b|arroz/, 'rice'],
  [/natilla|sour cream|crema/, 'natilla'],
  [/cheese|queso/, 'cheese'],
  [/\beggs?\b|huevo/, 'egg'],
  [/plantain|guineo|patac/, 'plantain'],
  [/culantro|cilantro|coriander/, 'culantro'],
  [/thyme|tomillo/, 'thyme'],
  [/\bonion/, 'onion'],
  [/garlic|ajo/, 'garlic'],
  [/coffee|caf\u00e9/, 'coffee'],
  [/\bpork|cerdo|chancho|\bham\b|bacon|lard/, 'pork'],
  [/chicken|pollo|\bhen\b/, 'chicken'],
  [/\bbeef|cecina|\brib\b|shank|carne|steak/, 'beef'],
  [/\bfish|pescado|seafood|shrimp/, 'fish'],
  [/carrot|zanahoria/, 'carrot'],
  [/chayote|tacaco/, 'chayote'],
  [/yuca|cassava|\u00f1amp\u00ed|tiquisque|malanga|\u00f1ame|taro/, 'yuca'],
  [/sweet potato|camote|potato|\bpapa\b/, 'potato'],
  [/squash|ayote|pumpkin|zapallo/, 'squash'],
  [/\blime|lemon|lim\u00f3n/, 'lime'],
  [/salad|lettuce|tomato|cabbage|ensalada|picadillo|spaghetti|pasta/, 'salad'],
  [/olive|aceituna/, 'olive'],
  [/raisin|pasas/, 'raisins'],
  [/celery|apio/, 'celery'],
  [/butter|mantequilla|margarine|\boil\b/, 'butter'],
  [/oregano|\bherb/, 'thyme'],
];

export function ingredientIconFor(text: string): string | null {
  const t = text.toLowerCase();
  if (/^salt|black pepper|salt and pepper/.test(t)) return null;
  for (const [re, key] of RULES) if (re.test(t)) return key;
  return null;
}

export function IngredientIcon({ name, size = 28, className }: { name: string; size?: number; className?: string }) {
  const Icon = INGREDIENT_ICONS[name];
  if (!Icon) return null;
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className} aria-hidden="true" focusable="false">
      <Icon />
    </svg>
  );
}
