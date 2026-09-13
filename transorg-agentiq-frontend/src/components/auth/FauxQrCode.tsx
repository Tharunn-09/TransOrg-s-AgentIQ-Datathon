// Deterministic pseudo-QR pattern for visual purposes only (not scannable).
// Renders a stable grid seeded from the given string so it looks like a real
// authenticator enrollment QR without needing an external QR dependency.

function seededRandom(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export default function FauxQrCode({ seed, size = 176 }: { seed: string; size?: number }) {
  const cells = 21;
  const rand = seededRandom(seed);
  const grid: boolean[][] = Array.from({ length: cells }, () =>
    Array.from({ length: cells }, () => rand() > 0.56)
  );

  const cell = size / cells;
  const isFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= cells - 7) || (r >= cells - 7 && c < 7);

  const finderCorners = [
    [0, 0],
    [0, cells - 7],
    [cells - 7, 0],
  ];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="TOTP enrollment QR code">
      <rect width={size} height={size} fill="#F1F6F4" rx={8} />
      {grid.map((row, r) =>
        row.map((on, c) => {
          if (!on || isFinder(r, c)) return null;
          return <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#10232B" />;
        })
      )}
      {finderCorners.map(([fr, fc], i) => (
        <g key={i}>
          <rect x={fc * cell} y={fr * cell} width={cell * 7} height={cell * 7} fill="#10232B" />
          <rect x={(fc + 1) * cell} y={(fr + 1) * cell} width={cell * 5} height={cell * 5} fill="#F1F6F4" />
          <rect x={(fc + 2) * cell} y={(fr + 2) * cell} width={cell * 3} height={cell * 3} fill="#10232B" />
        </g>
      ))}
    </svg>
  );
}
