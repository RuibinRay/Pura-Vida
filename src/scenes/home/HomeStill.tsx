// The illustrated (still) version of the opening scene. It is the loading preview behind the canvas,
// the whole scene on devices without WebGL, and a first paint that never shifts layout.
export function HomeStill({ className = '' }: { className?: string }) {
  return (
    <svg className={'home-still ' + className} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f80d8" />
          <stop offset="0.55" stopColor="#9ec3e6" />
          <stop offset="1" stopColor="#e9d9bf" />
        </linearGradient>
        <linearGradient id="hs-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fb8d4" />
          <stop offset="1" stopColor="#2f6f9a" />
        </linearGradient>
        <radialGradient id="hs-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6dd" stopOpacity="1" />
          <stop offset="0.3" stopColor="#ffe7b0" stopOpacity="0.7" />
          <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hs-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5f8f4a" />
          <stop offset="1" stopColor="#1f4a2a" />
        </linearGradient>
        <linearGradient id="hs-wing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5aa9ff" />
          <stop offset="1" stopColor="#0c2c8a" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#hs-sky)" />
      <circle cx="1180" cy="330" r="150" fill="url(#hs-sun)" />
      {/* far ridges */}
      <path d="M0 470 C 150 420 260 440 380 400 C 500 360 600 420 720 390 C 860 350 960 400 1100 380 C 1250 360 1350 420 1600 380 L1600 560 L0 560Z" fill="#7d9fb5" opacity="0.9" />
      <path d="M0 520 C 120 480 240 500 360 470 C 480 440 560 490 700 460 C 820 430 900 480 1040 455 C 1180 430 1300 480 1600 440 L1600 620 L0 620Z" fill="#4f7a7a" />
      {/* volcano */}
      <path d="M980 540 L1125 300 L1150 300 L1300 540Z" fill="#54584a" />
      <path d="M1040 540 L1125 300 L1150 300 L1180 540Z" fill="#6e6a66" opacity="0.5" />
      <g fill="#ffffff" opacity="0.9">
        <ellipse cx="1080" cy="372" rx="40" ry="14" /><ellipse cx="1200" cy="360" rx="46" ry="15" /><ellipse cx="1140" cy="395" rx="34" ry="12" opacity="0.7" />
      </g>
      {/* sea */}
      <rect x="0" y="540" width="1600" height="70" fill="url(#hs-sea)" />
      <path d="M1100 560 L1260 560 L1230 605 L1130 605Z" fill="#fff0c8" opacity="0.45" />
      {/* near hills & valley */}
      <path d="M0 600 C 200 560 400 620 600 580 C 800 540 1000 600 1200 570 C 1400 540 1500 590 1600 580 L1600 900 L0 900Z" fill="url(#hs-ground)" />
      <path d="M0 660 C 180 640 320 680 520 650 C 700 620 900 680 1100 650 C 1300 620 1450 660 1600 640 L1600 900 L0 900Z" fill="#2e5a34" />
      {/* forest frame */}
      <g fill="#153b22">
        <path d="M0 0 L420 0 C 360 90 390 160 330 230 C 420 240 440 320 380 400 C 430 430 420 520 340 560 C 420 600 400 700 300 740 C 360 800 320 870 240 900 L0 900Z" />
        <path d="M1600 0 L1220 0 C 1270 80 1240 170 1300 230 C 1210 250 1200 330 1250 400 C 1180 450 1190 540 1270 580 C 1200 620 1210 720 1300 760 C 1240 820 1270 880 1350 900 L1600 900Z" />
        <path d="M0 900 L1600 900 L1600 800 C 1400 760 1200 820 1000 790 C 800 760 600 830 400 800 C 250 780 100 820 0 790Z" />
      </g>
      {/* big leaves */}
      <g fill="#1f6a2f" opacity="0.95">
        <path d="M60 900 C 20 760 120 640 260 600 C 230 720 220 820 180 900Z" />
        <path d="M1540 900 C 1580 740 1470 640 1330 610 C 1370 720 1380 820 1420 900Z" />
      </g>
      {/* toucan on a branch */}
      <g transform="translate(300 300)">
        <path d="M-10 70 L 260 90" stroke="#5a3f2a" strokeWidth="10" strokeLinecap="round" />
        <ellipse cx="120" cy="40" rx="42" ry="30" fill="#121212" />
        <ellipse cx="135" cy="46" rx="22" ry="20" fill="#f2d23a" />
        <circle cx="155" cy="18" r="22" fill="#121212" />
        <circle cx="166" cy="24" r="4" fill="#8fd0b8" />
        <path d="M172 10 L 262 20 L 176 32Z" fill="#8cc63f" />
        <path d="M172 14 L 240 16 L 176 22Z" fill="#f28c28" opacity="0.8" />
        <path d="M78 46 L 40 58 L 82 60Z" fill="#121212" />
      </g>
      {/* morphos */}
      <g className="hs-morpho" transform="translate(520 560)">
        <path d="M0 0 C -30 -40 -70 -30 -60 0 C -70 30 -30 40 0 0Z" fill="url(#hs-wing)" stroke="#0a0f1f" strokeWidth="3" />
        <path d="M0 0 C 30 -40 70 -30 60 0 C 70 30 30 40 0 0Z" fill="url(#hs-wing)" stroke="#0a0f1f" strokeWidth="3" />
      </g>
      <g className="hs-morpho hs-morpho--2" transform="translate(1010 640) scale(0.7)">
        <path d="M0 0 C -30 -40 -70 -30 -60 0 C -70 30 -30 40 0 0Z" fill="url(#hs-wing)" stroke="#0a0f1f" strokeWidth="3" />
        <path d="M0 0 C 30 -40 70 -30 60 0 C 70 30 30 40 0 0Z" fill="url(#hs-wing)" stroke="#0a0f1f" strokeWidth="3" />
      </g>
    </svg>
  );
}
