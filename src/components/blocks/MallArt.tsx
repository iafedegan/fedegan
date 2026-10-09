const POINTS = 22;

// Curva cerrada y orgánica (tipo curva de nivel) suavizada con Catmull-Rom.
function contour(cx: number, cy: number, r: number, seed: number) {
  const pts: [number, number][] = [];
  for (let i = 0; i < POINTS; i++) {
    const t = (i / POINTS) * Math.PI * 2;
    const k =
      1 +
      0.18 * Math.sin(2 * t + seed) +
      0.1 * Math.sin(3 * t + seed * 1.9) +
      0.05 * Math.sin(5 * t + seed * 0.7);
    pts.push([cx + Math.cos(t) * r * k * 1.3, cy + Math.sin(t) * r * k * 0.8]);
  }
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < POINTS; i++) {
    const p0 = pts[(i - 1 + POINTS) % POINTS];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % POINTS];
    const p3 = pts[(i + 2) % POINTS];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${f(c1x)},${f(c1y)} ${f(c2x)},${f(c2y)} ${f(p2[0])},${f(p2[1])}`;
  }
  return `${d}Z`;
}

export function MallArt({ seed }: { seed: number }) {
  const rings = Array.from({ length: 8 }, (_, i) => contour(120, 94, 11 + i * 12.5, seed + i * 0.32));
  return (
    <svg viewBox="0 0 240 190" preserveAspectRatio="xMidYMid slice" className="mr-topo" aria-hidden="true" focusable="false">
      {rings.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth={0.8} strokeOpacity={0.1 + (rings.length - i) * 0.04} />
      ))}
    </svg>
  );
}
