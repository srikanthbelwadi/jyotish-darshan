import { PLANET_ABBR, PLANET_COLORS } from '../../engine/constants.js';

// North Indian chart: diamond/hexagonal layout
// Houses are fixed positions, Rashi rotates based on Lagna
const HOUSE_PATHS = [
  // House 1: top diamond (center-top)
  'M 200,20 L 280,100 L 200,180 L 120,100 Z',
  // House 2: top-right
  'M 280,100 L 380,20 L 380,180 L 280,100 Z',
  // House 3: right-top
  'M 380,20 L 380,180 L 280,100 Z',
  // House 4: right (center-right)
  'M 380,180 L 280,100 L 380,300 Z',
  // House 5: bottom-right
  'M 380,180 L 380,380 L 280,300 L 380,180 Z',
  // House 6: bottom-right outer
  'M 280,300 L 380,380 L 200,380 Z',
  // House 7: bottom diamond
  'M 200,180 L 280,300 L 200,380 L 120,300 Z',
  // House 8: bottom-left outer
  'M 120,300 L 200,380 L 20,380 Z',
  // House 9: bottom-left
  'M 20,380 L 120,300 L 20,180 L 120,300 Z',
  // House 10: left (center-left)
  'M 20,180 L 120,300 L 120,100 Z',
  // House 11: top-left
  'M 20,20 L 120,100 L 20,180 Z',
  // House 12: top-left outer
  'M 20,20 L 200,20 L 120,100 Z',
];

// Label positions for each house
const HOUSE_LABEL_POS = [
  [200, 95],   // 1
  [320, 105],  // 2
  [355, 60],   // 3
  [355, 245],  // 4
  [320, 310],  // 5
  [270, 355],  // 6
  [200, 295],  // 7
  [130, 355],  // 8
  [45, 310],   // 9
  [45, 245],   // 10
  [45, 60],    // 11
  [130, 45],   // 12
];

export default function NorthIndianChart({ planets, lagnaRashi, title, size = 340, small = false }) {
  const scale = size / 400;

  const getPlanetsInHouse = (house) => planets.filter(p => p.house === house);
  const getRashiForHouse = (house) => (lagnaRashi + house - 1) % 12;

  const RASHI_SHORT = ['Me','Vr','Mi','Ka','Si','Kn','Tu','Vr','Dh','Ma','Ku','Pi'];

  return (
    <div style={{ textAlign: 'center' }}>
      {title && (
        <p style={{ fontSize: small ? 11 : 13, fontWeight: 700, color: '#7C3AED', marginBottom: 6,
          fontFamily: "'Noto Serif', Georgia, serif" }}>{title}</p>
      )}
      <svg viewBox="0 0 400 400" width={size} height={size}
        style={{ border: '2px solid #7C3AED', borderRadius: 6, background: '#FFFCF5', display: 'block', margin: '0 auto' }}>

        {HOUSE_PATHS.map((path, i) => {
          const house = i + 1;
          const rashi = getRashiForHouse(house);
          const planetsHere = getPlanetsInHouse(house);
          const [lx, ly] = HOUSE_LABEL_POS[i];
          const isLagna = house === 1;

          return (
            <g key={i}>
              <path d={path}
                fill={isLagna ? 'rgba(124,58,237,0.07)' : (i % 2 === 0 ? '#FFFCF5' : '#FEFCF0')}
                stroke="#7C3AED" strokeWidth={1.5} />
              {/* House number */}
              <text x={lx} y={ly - (small ? 8 : 12)} textAnchor="middle"
                fontSize={small ? 8 : 10} fill="#C4A882">
                {house}
              </text>
              {/* Rashi name */}
              <text x={lx} y={ly} textAnchor="middle"
                fontSize={small ? 7 : 9} fill="#9CA3AF">
                {RASHI_SHORT[rashi]}
              </text>
              {/* Planets */}
              {planetsHere.map((p, pi) => (
                <text key={pi} x={lx} y={ly + (small ? 10 : 14) + pi * (small ? 10 : 14)} textAnchor="middle"
                  fontSize={small ? 8 : 12} fill={p.isRetrograde ? '#DC2626' : (PLANET_COLORS[p.key] || '#1E3A5F')} fontWeight="700">
                  {PLANET_ABBR[p.key]}{p.isRetrograde ? '℞' : ''}
                </text>
              ))}
              {/* Asc marker */}
              {isLagna && (
                <text x={lx} y={ly + (small ? 26 : 38)} textAnchor="middle"
                  fontSize={small ? 7 : 10} fill="#EF4444" fontWeight="bold">Asc</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
