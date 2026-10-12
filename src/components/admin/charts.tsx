// Gráficas SVG sencillas, renderizadas en el servidor (sin librerías).

export function AreaChart({ data }: { data: { label: string; value: number }[] }) {
  const W = 640, H = 220, padX = 28, padTop = 28, padBottom = 34;
  const max = Math.max(1, ...data.map((d) => d.value));
  const niceMax = Math.max(2, Math.ceil(max / 2) * 2);
  const x = (i: number) => padX + (i * (W - padX * 2)) / Math.max(1, data.length - 1);
  const y = (v: number) => padTop + (1 - v / niceMax) * (H - padTop - padBottom);
  const pts = data.map((d, i) => [x(i), y(d.value)] as const);

  // Curva suave (Catmull-Rom → Bézier)
  let line = pts.length ? `M ${pts[0][0]} ${pts[0][1]}` : "";
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    line += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  const base = H - padBottom;
  const area = pts.length ? `${line} L ${pts[pts.length - 1][0]} ${base} L ${pts[0][0]} ${base} Z` : "";
  const grid = [0, 0.5, 1].map((t) => ({ v: Math.round(niceMax * t), y: y(niceMax * t) }));
  const every = data.length > 8 ? 2 : 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Actividad por día" className="h-auto w-full">
      <defs>
        <linearGradient id="ad-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#165a43" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#165a43" stopOpacity="0" />
        </linearGradient>
      </defs>
      {grid.map((g) => (
        <g key={g.v}>
          <line x1={padX} x2={W - padX} y1={g.y} y2={g.y} stroke="#e4e2d6" strokeDasharray="4 5" />
          <text x={4} y={g.y + 4} fontSize="11" fill="#8a978f">{g.v}</text>
        </g>
      ))}
      {area && <path d={area} fill="url(#ad-area)" />}
      {line && <path d={line} fill="none" stroke="#0f3d2e" strokeWidth="2.6" strokeLinecap="round" />}
      {pts.map(([px, py], i) => (
        <g key={i}>
          {data[i].value > 0 && <text x={px} y={py - 10} fontSize="11" fontWeight="700" textAnchor="middle" fill="#0f3d2e">{data[i].value}</text>}
          <circle cx={px} cy={py} r={data[i].value > 0 ? 4.5 : 3.2} fill="#fff" stroke="#0f3d2e" strokeWidth="2" />
          {i % every === 0 && <text x={px} y={H - 10} fontSize="11" textAnchor="middle" fill="#8a978f">{data[i].label}</text>}
        </g>
      ))}
    </svg>
  );
}

export function Donut({ segments, centerValue, centerLabel }: { segments: { label: string; value: number; color: string }[]; centerValue: string; centerLabel: string }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const R = 56, C = 2 * Math.PI * R;
  const lens = segments.map((s) => (s.value / total) * C);
  const starts = lens.map((_, i) => lens.slice(0, i).reduce((a, b) => a + b, 0));
  return (
    <svg viewBox="0 0 160 160" role="img" aria-label="Estado del contenido" className="mx-auto h-44 w-44">
      <circle cx="80" cy="80" r={R} fill="none" stroke="#eceae0" strokeWidth="16" />
      {segments.map((s, i) => (
        <circle
          key={s.label}
          cx="80" cy="80" r={R} fill="none" stroke={s.color} strokeWidth="16" strokeLinecap="butt"
          strokeDasharray={`${Math.max(0, lens[i] - 2)} ${C}`} strokeDashoffset={-starts[i]} transform="rotate(-90 80 80)"
        />
      ))}
      <text x="80" y="82" textAnchor="middle" fontSize="30" fontWeight="700" fill="#11271d" fontFamily="var(--font-display)">{centerValue}</text>
      <text x="80" y="102" textAnchor="middle" fontSize="9" letterSpacing="2" fill="#8a978f">{centerLabel}</text>
    </svg>
  );
}
