import { PLANET_ABBR, PLANET_COLORS } from '../../engine/constants.js';
import { getRashiName } from '../../i18n/astroTerms.js';

// Fixed positions of each Rashi in the 4×4 South Indian grid
// [col, row] in a 4-wide, 4-tall grid
const RASHI_POS = [
  [1, 0], // 0 Mesha
  [2, 0], // 1 Vrishabha
  [3, 0], // 2 Mithuna
  [3, 1], // 3 Karka
  [3, 2], // 4 Simha
  [3, 3], // 5 Kanya
  [2, 3], // 6 Tula
  [1, 3], // 7 Vrischika
  [0, 3], // 8 Dhanu
  [0, 2], // 9 Makara
  [0, 1], // 10 Kumbha
  [0, 0], // 11 Meena
];

export default function SouthIndianChart({ planets, lagnaRashi, title, size = 340, small = false, lang = 'sa' }) {
  const cell = size / 4;
  const fontSize = small ? 7.5 : 10;
  const planetFontSize = small ? 9 : 13;
  const rashiFontSize = small ? 6.5 : 8.5;

  const getPlanetsInRashi = (rashi) => planets.filter(p => p.rashi === rashi);

  return (
    <div style={{ textAlign: 'center' }}>
      {title && (
        <p style={{ fontSize: small ? 11 : 13, fontWeight: 700, color: '#7C3AED', marginBottom: 6,
          fontFamily: "'Noto Serif', Georgia, serif" }}>{title}</p>
      )}
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}
        style={{ border: '2px solid #7C3AED', borderRadius: 6, background: '#FFFCF5', display: 'block', margin: '0 auto' }}>

        {/* Grid lines */}
        {[1, 2, 3].map(i => (
          <g key={i}>
            <line x1={cell * i} y1={0} x2={cell * i} y2={size} stroke="#D4B896" strokeWidth={1} />
            <line x1={0} y1={cell * i} x2={size} y2={cell * i} stroke="#D4B896" strokeWidth={1} />
          </g>
        ))}

        {/* Center box (logo) */}
        <rect x={cell} y={cell} width={cell * 2} height={cell * 2} fill="#F8F4FF" stroke="#7C3AED" strokeWidth={1.5} />
        <text x={size / 2} y={size / 2 - (small ? 6 : 10)} textAnchor="middle"
          fontSize={small ? 14 : 20} fill="#7C3AED" opacity={0.5}>☀</text>
        <text x={size / 2} y={size / 2 + (small ? 4 : 8)} textAnchor="middle"
          fontSize={small ? 6 : 8} fill="#9CA3AF" fontFamily="Georgia, serif">
          {small ? '' : 'Lagna Kundali'}
        </text>

        {/* Rashi cells */}
        {RASHI_POS.map(([col, row], rashiIdx) => {
          const x = col * cell;
          const y = row * cell;
          const planetsHere = getPlanetsInRashi(rashiIdx);
          const isLagna = rashiIdx === lagnaRashi;

          return (
            <g key={rashiIdx}>
              {/* Lagna highlight */}
              {isLagna && (
                <rect x={x + 1} y={y + 1} width={cell - 2} height={cell - 2}
                  fill="rgba(124,58,237,0.05)" rx={2} />
              )}
              {/* Rashi number */}
              <text x={x + 3} y={y + rashiFontSize + 2}
                fontSize={rashiFontSize} fill="#C4A882" fontFamily="Georgia, serif">
                {rashiIdx + 1}
              </text>
              {/* Rashi name */}
              <text x={x + cell - 3} y={y + rashiFontSize + 2}
                textAnchor="end" fontSize={rashiFontSize} fill="#C4A882" fontFamily="Georgia, serif">
                {getRashiName(rashiIdx, lang).substring(0, small ? 3 : 5)}
              </text>
              {/* Lagna marker */}
              {isLagna && (
                <text x={x + 3} y={y + cell - 3}
                  fontSize={rashiFontSize + 1} fill="#EF4444" fontWeight="bold">Asc</text>
              )}
              {/* Planets */}
              {planetsHere.map((p, pi) => {
                const planetColor = p.isRetrograde ? '#DC2626' : (PLANET_COLORS[p.key] || '#1E3A5F');
                const cols = planetsHere.length > 3 ? 2 : 1;
                const col_ = cols === 2 ? pi % 2 : 0;
                const row_ = cols === 2 ? Math.floor(pi / 2) : pi;
                const px = x + 5 + col_ * (cell / 2 - 4);
                const py = y + (small ? 18 : 24) + row_ * (small ? 11 : 16);
                return (
                  <g key={pi}>
                    <text x={px} y={py}
                      fontSize={planetFontSize}
                      fill={planetColor}
                      fontWeight="700"
                      fontFamily="'Noto Serif', Georgia, serif">
                      {PLANET_ABBR[p.key]}{p.isRetrograde ? '℞' : ''}
                      {p.isExalted ? '↑' : ''}
                      {p.isDebilitated ? '↓' : ''}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
