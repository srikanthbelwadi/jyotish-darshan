import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Line, Stars, Html, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { eclipticToHorizontal, getCartesianFromAltAz } from '../../engine/astroTransforms';
import skyData from '../../data/skyData.json';

// --- STYLES ---
const OVERLAY_STYLES = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: '#02040A', zIndex: 99999, overflow: 'hidden',
  display: 'flex', flexDirection: 'column'
};
const HEADER_STYLES = {
  position: 'absolute', top: 0, left: 0, width: '100%', padding: '20px',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', zIndex: 1,
  background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)'
};
const TITLE_STYLES = { color: 'var(--accent-gold)', margin: 0, fontSize: 24, fontVariant: 'small-caps', letterSpacing: 2 };
const SUB_STYLES = { color: '#8BA0B3', margin: '4px 0 0 0', fontSize: 13, letterSpacing: 1 };
const CLOSE_BTN = {
  pointerEvents: 'auto', background: 'rgba(255,100,100,0.2)', border: '1px solid rgba(255,100,100,0.5)',
  color: '#FFCCCC', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600
};

// --- DATA & COLORS ---
const R = 100; // Dome radius
const P_COLORS = { sun: '#FFD700', moon: '#F4F6F0', mars: '#FF4D4D', mercury: '#76D7C4', jupiter: '#F5B041', venus: '#F9E79F', saturn: '#e6ccb3', rahu: '#8E44AD', ketu: '#AAB7B8' };
const PLANET_GLYPHS = { sun: '☉', moon: '☽', mars: '♂', mercury: '☿', jupiter: '♃', venus: '♀', saturn: '♄', rahu: '☊', ketu: '☋' };
const P_MAP = { surya: 'sun', chandra: 'moon', mangal: 'mars', budha: 'mercury', guru: 'jupiter', shukra: 'venus', shani: 'saturn', rahu: 'rahu', ketu: 'ketu', sun: 'sun', moon: 'moon', mars: 'mars', mercury: 'mercury', jupiter: 'jupiter', venus: 'venus', saturn: 'saturn' };
const N_NAMES = ["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"];
const RASHI_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
const RASHI_NAMES = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"];

// Critical Reference Stars in Vedic tradition
const YOGATARAS = [
  { name: "Dhruva (Polaris)", long: 89.26, lat: 66.1, color: "#FFFFFF", sz: 2.5 },
  { name: "Rohini (Aldebaran)", long: 69.78, lat: -5.46, color: "#FFFFFF", sz: 1.8 },
  { name: "Ardra (Betelgeuse)", long: 88.75, lat: -16.02, color: "#FFFFFF", sz: 2 },
  { name: "Magha (Regulus)", long: 149.8, lat: 0.46, color: "#FFFFFF", sz: 1.8 },
  { name: "Chitra (Spica)", long: 203.8, lat: -2.05, color: "#FFFFFF", sz: 1.8 },
  { name: "Jyeshtha (Antares)", long: 249.7, lat: -4.5, color: "#FFFFFF", sz: 1.8 },
  { name: "Abhijit (Vega)", long: 285.3, lat: 61.7, color: "#FFFFFF", sz: 2 }
];

const SECONDARY_STARS = [
  { name: "Lubdhaka (Sirius)", long: 104.1, lat: -39.6, color: "#FFFFFF", sz: 1.6 },
  { name: "Agastya (Canopus)", long: 105.0, lat: -75.8, color: "#FFFFFF", sz: 1.5 },
  { name: "Swati (Arcturus)", long: 204.2, lat: 30.7, color: "#FFFFFF", sz: 1.5 },
  { name: "Shravana (Altair)", long: 281.8, lat: 29.3, color: "#FFFFFF", sz: 1.4 },
  { name: "Krittika (Alcyone)", long: 60.0, lat: 4.0, color: "#FFFFFF", sz: 1.2 },
  { name: "Brahma Hridaya (Capella)", long: 81.8, lat: 22.8, color: "#FFFFFF", sz: 1.4 },
  { name: "Raja (Rigel)", long: 76.8, lat: -31.1, color: "#FFFFFF", sz: 1.4 },
  { name: "Shyama (Procyon)", long: 115.8, lat: -16.0, color: "#FFFFFF", sz: 1.3 },
  { name: "Punarvasu (Castor)", long: 110.2, lat: 10.1, color: "#FFFFFF", sz: 1.2 },
  { name: "Aditi (Pollux)", long: 113.2, lat: 6.7, color: "#FFFFFF", sz: 1.2 },
  { name: "Hamsa (Deneb)", long: 305.2, lat: 59.9, color: "#FFFFFF", sz: 1.2 },
  { name: "Shatabhisha (Sadal)", long: 333.4, lat: 8.5, color: "#FFFFFF", sz: 1.2 },
  { name: "Mula (Shaula)", long: 264.6, lat: -13.8, color: "#FFFFFF", sz: 1.2 }
];

const ALL_NAMED_STARS = [...YOGATARAS, ...SECONDARY_STARS];

// --- 3D COMPONENTS ---

const BackgroundStars = ({ lst, obsLat }) => {
  const meshRef = useRef();
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Apply coordinates
  useEffect(() => {
    if (!meshRef.current) return;
    skyData.stars.forEach((star, i) => {
      const hz = eclipticToHorizontal(star.long, star.lat, lst, obsLat);
      const pos = getCartesianFromAltAz(hz.alt, hz.az, R);
      
      dummy.position.set(pos.x, pos.y, pos.z);
      // scale based on magnitude (dimmer = smaller)
      const scale = Math.max(0.2, (6 - star.mag) * 0.4);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [lst, obsLat, dummy]);

  return (
    <instancedMesh ref={meshRef} args={[null, null, skyData.stars.length]}>
      {/* Octahedron with 0 detail forms a perfectly sharp diamond/pointy star in 3D */}
      <octahedronGeometry args={[0.5, 0]} />
      <meshBasicMaterial color="#FFFFFF" transparent opacity={0.6} />
    </instancedMesh>
  );
};

const YogataraStars = ({ lst, obsLat, safeT }) => {
  return (
    <group>
      {ALL_NAMED_STARS.map((star, i) => {
        const hz = eclipticToHorizontal(star.long, star.lat, lst, obsLat);
        const pos = getCartesianFromAltAz(hz.alt, hz.az, R);
        
        // Extract inner and outer names for translation
        const p1 = star.name.split(' ')[0];
        const match = star.name.match(/\((.*?)\)/);
        const p2 = match ? match[1] : '';
        const t1 = safeT ? safeT(p1) : p1;
        
        return (
          <group key={i} position={[pos.x, pos.y, pos.z]}>
             {/* Dramatic Radiant 3D Star shape with points */}
             <group>
                <mesh><octahedronGeometry args={[star.sz * 1.5, 0]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
                <mesh scale={[0.2, 2.5, 0.2]}><octahedronGeometry args={[star.sz * 1.5, 0]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
                <mesh scale={[2.5, 0.2, 0.2]}><octahedronGeometry args={[star.sz * 1.5, 0]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
                <mesh scale={[0.2, 0.2, 2.5]}><octahedronGeometry args={[star.sz * 1.5, 0]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
             </group>
             
             {/* Star Label distinctly placed BELOW the star */}
             <Html distanceFactor={R} style={{ pointerEvents: "none" }} center zIndexRange={[80,0]}>
               <div style={{ color: '#FFFFFF', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', textShadow: `0 0 8px #000, 0 0 10px #000`, transform: `translateY(${30 + star.sz * 10}px)` }}>
                 <span>
                    {t1}
                    {p2 && <span style={{ fontSize: '0.7em', opacity: 0.85, marginLeft: '4px' }}>({p2.toUpperCase()})</span>}
                 </span>
               </div>
             </Html>
          </group>
        );
      })}
    </group>
  );
};

const NakshatraMeridians = ({ lst, obsLat, safeT }) => {
  const meridians = useMemo(() => {
    const lines = [];
    for (let i = 0; i < 27; i++) {
       const long = i * 13.333333;
       const pts = [];
       // Draw thin separating tick crossing the ecliptic plane (lat -10 to +10)
       for(let lat = 10; lat >= -10; lat -= 2) {
           const hz = eclipticToHorizontal(long, lat, lst, obsLat);
           const pos = getCartesianFromAltAz(hz.alt, hz.az, R);
           pts.push([pos.x, pos.y, pos.z]);
       }
       
       // Name label slightly above the Ecliptic plane
       const hzMid = eclipticToHorizontal(long + 6.666, 8, lst, obsLat);
       const lblPos = getCartesianFromAltAz(hzMid.alt, hzMid.az, R + 2);
       
       const nakLabel = safeT ? safeT(N_NAMES[i]) : N_NAMES[i];
       lines.push({ pts, lblPos, label: nakLabel });
    }
    return lines;
  }, [lst, obsLat]);

  return (
    <group>
      {meridians.map((m, i) => (
        <group key={`meridian-${i}`}>
           <Line points={m.pts} color="rgba(255,255,255,0.5)" lineWidth={2} />
           <Html distanceFactor={R} style={{ pointerEvents: "none" }} position={[m.lblPos.x, m.lblPos.y, m.lblPos.z]} center zIndexRange={[40,0]}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', textShadow: '0 0 10px #000' }}>
                {m.label}
              </div>
           </Html>
        </group>
      ))}
    </group>
  );
};

const ConstellationLines = ({ lst, obsLat, safeT }) => {
  // Line segments
  return (
    <group>
      {skyData.lines.map((pair, idx) => {
        const s1 = skyData.stars.find(s => s.id === pair[0]);
        const s2 = skyData.stars.find(s => s.id === pair[1]);
        if (!s1 || !s2) return null;
        
        const hz1 = eclipticToHorizontal(s1.long, s1.lat, lst, obsLat);
        const p1 = getCartesianFromAltAz(hz1.alt, hz1.az, R);
        
        const hz2 = eclipticToHorizontal(s2.long, s2.lat, lst, obsLat);
        const p2 = getCartesianFromAltAz(hz2.alt, hz2.az, R);
        
        // Add Floating Name for the Zodiac stick-figure at the very first line of each constellation
        const isFirstLine = pair[0].endsWith('_1');
        let rashiName = null;
        if (pair[0].startsWith('r_') && isFirstLine) {
            const rIdx = parseInt(pair[0].split('_')[1], 10);
            rashiName = safeT ? safeT(RASHI_NAMES[rIdx]) : RASHI_NAMES[rIdx];
        }
        
        return (
          <group key={idx}>
            {/* Constellation stick lines removed upon user request */}
            {rashiName && (
              <Html distanceFactor={R} style={{ pointerEvents: "none" }} position={[p1.x, p1.y, p1.z]} center zIndexRange={[30,0]}>
                 <div style={{ color: 'rgba(255,215,0,0.4)', fontSize: '14px', letterSpacing: '4px', textTransform: 'uppercase' }}>
                   {rashiName}
                 </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

const EclipticRing = ({ lst, obsLat }) => {
  // Generate 12 Rashi segmented colored lines and Mid-points for Glyphs
  const { rashiLines, rashiMarkers } = useMemo(() => {
    const lines = [];
    const markers = [];
    for (let i = 0; i < 12; i++) {
        const pts = [];
        for(let l = i*30; l <= (i+1)*30; l += 1) {
            const hz = eclipticToHorizontal(l, 0, lst, obsLat);
            const pos = getCartesianFromAltAz(hz.alt, hz.az, R);
            pts.push([pos.x, pos.y, pos.z]);
        }
        lines.push({ idx: i, points: pts, color: i % 2 === 0 ? 'rgba(212,175,55,0.45)' : 'rgba(120,180,255,0.35)' });
        
        // Midpoint for the glowing Zodiac glyph and label
        const hzMid = eclipticToHorizontal(i*30 + 15, 0, lst, obsLat);
        const mPos = getCartesianFromAltAz(hzMid.alt, hzMid.az, R + 1);
        markers.push({ pos: mPos, glyph: RASHI_GLYPHS[i], name: RASHI_NAMES[i] });
    }
    return { rashiLines: lines, rashiMarkers: markers };
  }, [lst, obsLat]);

  // Generate 27 minimal dots just to show Nakshatra splits quietly along the main belt
  const nakDots = useMemo(() => {
    const dots = [];
    for (let i = 0; i < 27; i++) {
      const long = i * 13.333333;
      const hz = eclipticToHorizontal(long, 0, lst, obsLat);
      const pos = getCartesianFromAltAz(hz.alt, hz.az, R - 0.5);
      dots.push({ pos, label: N_NAMES[i], isVisible: hz.alt > 0 });
    }
    return dots;
  }, [lst, obsLat]);

  return (
    <group>
      {rashiLines.map((r, i) => (
         <Line key={`rashi-line-${i}`} points={r.points} color={r.color} lineWidth={4} />
      ))}
      {nakDots.map((n, i) => (
         <mesh key={`nak-${i}`} position={[n.pos.x, n.pos.y, n.pos.z]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshBasicMaterial color="#ffffff" opacity={0.6} transparent />
         </mesh>
      ))}
    </group>
  );
};

// Generates a circle array of vectors for precise grid rings
const createCircle = (radius, y, axis='y') => {
  const pts = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i/64)*Math.PI*2;
    if (axis === 'y') pts.push([Math.cos(a)*radius, y, Math.sin(a)*radius]);
    if (axis === 'z') pts.push([Math.cos(a)*radius, Math.sin(a)*radius, y]);
    if (axis === 'x') pts.push([y, Math.sin(a)*radius, Math.cos(a)*radius]);
  }
  return pts;
};

const CameraController = ({ resetTick }) => {
  const { camera, controls } = useThree();
  useEffect(() => {
    if (resetTick > 0) {
       camera.position.set(0, 30, 180);
       if (controls) {
         controls.target.set(0, 0, 0);
         controls.update();
       }
    }
  }, [resetTick, camera, controls]);
  return null;
};

const CentralEarth = () => {
  const earthMat = useRef();
  const atmoMat = useRef();
  
  // Real NASA Earth visual metrics fetched dynamically
  const earthTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'Anonymous';
    return loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
  }, []);
  const specularMap = useMemo(() => {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'Anonymous';
    return loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg');
  }, []);
  
  useFrame((state) => {
    // Dynamically calculate camera zoom out distance.
    const dist = state.camera.position.length();
    // The globe is totally invisible when zoomed in close (dist < 30) so it doesn't block the screen. 
    // It fades into full magnificent visibility at dist > 70.
    const op = THREE.MathUtils.clamp((dist - 30) / 40, 0, 1);
    
    if (earthMat.current) {
      earthMat.current.opacity = op;
      earthMat.current.transparent = true;
    }
    if (atmoMat.current) {
      atmoMat.current.opacity = op * 0.4;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* The Blue Marble: Realistic Phototexture */}
      <mesh>
         <sphereGeometry args={[6, 64, 64]} />
         <meshPhongMaterial ref={earthMat} map={earthTexture} specularMap={specularMap} specular={new THREE.Color('grey')} shininess={15} transparent />
      </mesh>
      {/* Earth's natural atmosphere dispersion */}
      <mesh>
         <sphereGeometry args={[6.4, 64, 64]} />
         <meshBasicMaterial ref={atmoMat} color="#66aaff" transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
};

const HorizonTracker = ({ safeT }) => {
  return (
    <group>
      {/* Explicit structured Lat/Long Spherical Grid (Altitude/Azimuth rings) */}
      <group>
         {Array.from({length: 13}).map((_, i) => { 
            const lat = (i - 6) * (Math.PI / 12); // -90 to +90
            const rL = R * Math.cos(lat);
            const yL = R * Math.sin(lat);
            return <Line key={`lat-${i}`} points={createCircle(rL, yL, 'y')} color="rgba(42, 69, 99, 0.35)" lineWidth={1} />
         })}
         {Array.from({length: 12}).map((_, i) => {
            const rot = (i/12)*Math.PI;
            return (
              <group key={`lng-${i}`} rotation={[0, rot, 0]}>
                 <Line points={createCircle(R, 0, 'z')} color="rgba(42, 69, 99, 0.25)" lineWidth={1} />
              </group>
            )
         })}
      </group>
      
      {/* Restoring the massive glowing floor grid */}
      <Grid position={[0, -0.1, 0]} args={[R * 2, R * 2]} cellSize={10} cellThickness={0.5} cellColor="#173147" sectionSize={30} sectionThickness={1} sectionColor="#102538" fadeDistance={R+20} infiniteGrid={true} />
      
      {/* Solid flat earth disc to clarify Above vs Below */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <circleGeometry args={[R * 1.5, 64]} />
        <meshBasicMaterial color="#010308" transparent opacity={0.85} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      
      {/* Underworld Dark Tint mapping */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}>
        <sphereGeometry args={[R - 0.5, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshBasicMaterial color="#000000" depthWrite={false} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Heavy glowing ring on the exact horizon line */}
      <Line points={Array.from({length:120}).map((_,i) => {
        const p = getCartesianFromAltAz(0, i * (360/120), R-1);
        return [p.x, 0, p.z];
      })} color="rgba(0,180,255,0.6)" lineWidth={5} />
      
      {/* Cardinal Directions */}
      {[
        { t: safeT('North') !== 'North' ? Array.from(safeT('North'))[0].toUpperCase() : 'N', az: 0, c: '#FF5555' }, 
        { t: safeT('East') !== 'East' ? Array.from(safeT('East'))[0].toUpperCase() : 'E', az: 90, c: '#55FF55' },
        { t: safeT('South') !== 'South' ? Array.from(safeT('South'))[0].toUpperCase() : 'S', az: 180, c: '#5555FF' }, 
        { t: safeT('West') !== 'West' ? Array.from(safeT('West'))[0].toUpperCase() : 'W', az: 270, c: '#FFFF55' }
      ].map(dir => {
        const p = getCartesianFromAltAz(0, dir.az, Math.min(R - 10, 80));
        return (
          <Html distanceFactor={R} style={{ pointerEvents: "none" }} key={dir.t} position={[p.x, 2, p.z]} center>
             <div style={{ color: dir.c, fontSize: '48px', fontFamily: 'serif', fontWeight: 'bold', textShadow: `0 0 25px ${dir.c}` }}>{dir.t}</div>
          </Html>
        )
      })}
      
      {/* Horizon Line Grid Rings */}
      <Line points={Array.from({length:65}).map((_,i) => {
        const p = getCartesianFromAltAz(0, i * (360/64), R);
        return [p.x, 0, p.z];
      })} color="rgba(0,255,100,0.25)" lineWidth={2} />
    </group>
  );
}

const Planets = ({ planets, lst, obsLat, safeT }) => {
  const moonTexture = useMemo(() => {
     const loader = new THREE.TextureLoader();
     loader.crossOrigin = 'Anonymous';
     return loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg');
  }, []);

  if (!planets || !Array.isArray(planets)) return null;

  return (
    <group>
      {planets.map((p, index) => {
        if (!p) return null;
        const identifier = (p.key || p.id || p.name || 'Unknown').trim();
        // Backend passes strings like "Shukra (Venus)" or language strings. We must extract just the first word for color mapping.
        const cleanNamePiece = identifier.split(/[ \()]/)[0];
        const cleanName = cleanNamePiece.toLowerCase();
        
        if (cleanName === 'ascendant' || cleanName === 'lagna') return null; // Only physical bodies
        const mappedPid = P_MAP[cleanName] || cleanName;
        const clr = P_COLORS[mappedPid] || '#FFFFFF';
        const glyph = PLANET_GLYPHS[mappedPid] || identifier.substring(0, 1).toUpperCase();
        
        // Construct localized language string, backing it with the English astronomical descriptor in smaller print
        const localSan = (safeT ? safeT(mappedPid, 'pl.') : cleanNamePiece).toUpperCase();
        const engTitle = mappedPid.toUpperCase();
        
        // Ensure positional data is present by reading API longitude, falling back to older normDeg
        const rawLng = typeof p.longitude === 'number' ? p.longitude : (typeof p.normDeg === 'number' ? p.normDeg : (index * 30));
        const hz = eclipticToHorizontal(rawLng, 0, lst, obsLat);
        const pos = getCartesianFromAltAz(hz.alt, hz.az, R - 5);
        
        return (
           <group key={identifier || index} position={[pos.x, pos.y, pos.z]}>
             <pointLight color={clr} intensity={1.5} distance={R} decay={2} />
             
             {/* Dynamic Body Rendering based on Graha type */}
             {mappedPid === 'sun' ? (
                <group>
                  {/* Central Core */}
                  <mesh><sphereGeometry args={[6, 64, 64]} /><meshBasicMaterial color="#FFD700" /></mesh>
                  {/* Pointy Views (Octahedrons exactly like Yogatara stars) */}
                  <group>
                    <mesh scale={[1, 1, 1]}><octahedronGeometry args={[9, 0]} /><meshBasicMaterial color="#FFD700" /></mesh>
                    <mesh scale={[0.25, 2.8, 0.25]}><octahedronGeometry args={[9, 0]} /><meshBasicMaterial color="#FFD700" /></mesh>
                    <mesh scale={[2.8, 0.25, 0.25]}><octahedronGeometry args={[9, 0]} /><meshBasicMaterial color="#FFD700" /></mesh>
                    <mesh scale={[0.25, 0.25, 2.8]}><octahedronGeometry args={[9, 0]} /><meshBasicMaterial color="#FFD700" /></mesh>
                  </group>
                </group>
             ) : mappedPid === 'moon' ? (
                <group>
                  <mesh>
                    {/* The Moon: Pure pristine photorealistic sphere, absolutely NO outer atmospheric flat discs */}
                    <sphereGeometry args={[5.5, 64, 64]} />
                    <meshStandardMaterial map={moonTexture} roughness={0.8} metalness={0.2} emissiveMap={moonTexture} emissive="#FFFFFF" emissiveIntensity={0.6} />
                  </mesh>
                </group>
             ) : mappedPid === 'rahu' || mappedPid === 'ketu' ? (
                <mesh rotation={[Math.PI/4, 0, 0]}>
                   <torusGeometry args={[3.2, 0.8, 16, 64]} />
                   <meshStandardMaterial color={clr} roughness={0.7} metalness={0.4} emissive={clr} emissiveIntensity={0.3} />
                </mesh>
             ) : (
                <group>
                  <mesh>
                    {/* Other physical planets remain perfectly clean marbles with NO flat glow spheres */}
                    <sphereGeometry args={[3.5, 32, 32]} />
                    <meshStandardMaterial color={clr} roughness={0.4} metalness={0.2} emissive={clr} emissiveIntensity={0.15} />
                  </mesh>
                </group>
             )}
             
             {/* Saturn physically rendered with delicate Rings */}
             {mappedPid === 'saturn' && (
                <mesh rotation={[Math.PI / 3, 0, 0]}>
                   <ringGeometry args={[3.8, 6, 64]} />
                   <meshStandardMaterial color={clr} side={THREE.DoubleSide} transparent opacity={0.9} roughness={0.6} />
                </mesh>
             )}
             
             {/* Subtle Minimalist Planet Text Array floating beneath the objects */}
             <Html distanceFactor={R} style={{ pointerEvents: "none" }} center zIndexRange={[100, 0]}>
               <div style={{
                 color: '#FFF', textAlign: 'center', pointerEvents: 'none',
                 fontFamily: 'sans-serif', letterSpacing: '1px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                 textShadow: `0 0 8px ${clr}, 0 0 15px #000, 0 0 15px #000`, transform: `translateY(${mappedPid === 'sun' ? 55 : mappedPid === 'moon' ? 45 : 35}px)`
               }}>
                 <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {localSan}
                    {localSan !== engTitle && (
                       <span style={{ fontSize: '0.7em', opacity: 0.85, marginLeft: '3px' }}>({engTitle})</span>
                    )}
                 </span>
               </div>
             </Html>
           </group>
        );
      })}
    </group>
  );
};

export const CelestialDomeViewer = ({ K, lang, t, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [resetTick, setResetTick] = useState(0);
  
  useEffect(() => setMounted(true), []);

  if (!mounted || !K) return null;

  const safeT = (str, prefix = '') => {
     if (typeof t === 'function' && str) {
         if (prefix) {
             const preEx = `${prefix}${str}`;
             if (t(preEx) && t(preEx) !== preEx) return t(preEx);
             const preLw = `${prefix}${str.toLowerCase()}`;
             if (t(preLw) && t(preLw) !== preLw) return t(preLw);
         }
         if (t(str) && t(str) !== str) return t(str);
         if (t(str.toLowerCase()) && t(str.toLowerCase()) !== str.toLowerCase()) return t(str.toLowerCase());
     }
     return str;
  };

  // LST is required. If it's a formatted string (e.g. "16h 59m"), we must parse it to decimal hours to avoid math NaN crashing the 3D projection matrix.
  const lst = K.lstDegrees ? (K.lstDegrees / 15.0) : (() => {
      let l = K.lst || K.panchanga?.LST || 12;
      if (typeof l === 'string') {
          const p = l.match(/(\d+)[h:]\s*(\d+)/i);
          if (p) return parseInt(p[1], 10) + parseInt(p[2], 10) / 60.0;
          return parseFloat(l) || 12;
      }
      return l;
  })();
  const obsLat = K.input?.lat || 0;
  const obsLng = K.input?.lng || 0;
  const dob = K.input?.dob || '';
  const tob = K.input?.tob || '';
  const locationName = K.input?.city ? `${K.input.city}${K.input.country ? `, ${K.input.country}` : ''}` : '';
  const ayanamsaText = K.ayanamsaDMS || (K.ayanamsa ? Number(K.ayanamsa).toFixed(4) : '');

  return (
    <div style={OVERLAY_STYLES}>
      <div style={HEADER_STYLES}>
        <div>
           <h2 style={TITLE_STYLES}>{safeT('vedic planetarium') || 'Vedic Planetarium'}</h2>
           <p style={SUB_STYLES}>
             {safeT('topocentric projection') || 'Topocentric Projection'} · {safeT('observer') || 'Observer'}: {obsLat.toFixed(2)}°N, {obsLng.toFixed(2)}°E {locationName ? `(${locationName})` : ''}
           </p>
           <p style={{ ...SUB_STYLES, color: '#A0B8C8', marginTop: 6 }}>
              {dob && tob ? `🗓 ${dob}  ⌚ ${tob}` : ''}
              <span style={{ marginLeft: 15, paddingLeft: 15, borderLeft: '1px solid #446688', fontVariant: 'small-caps' }}>
                 {safeT('ayanamsa') || 'Ayanamsa'} (Lahiri): {ayanamsaText}
              </span>
           </p>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, display: 'flex', gap: '15px' }}>
        <button onClick={() => setResetTick(prev => prev + 1)} style={{ background: '#1c2e4a', color: '#88ccff', border: '1px solid #446688', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'sans-serif', fontWeight: 'bold', fontSize: '13px' }}>
          {safeT('reset view').toUpperCase()}
        </button>
        <button onClick={onClose} style={{ background: '#4a1c1c', color: '#ff8888', border: '1px solid #884444', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'sans-serif', fontWeight: 'bold', fontSize: '13px' }}>
          {safeT('exit planetarium').toUpperCase()}
        </button>
      </div>

      <Canvas camera={{ position: [0, 30, 180], fov: 60, near: 0.1, far: 2000 }}>
         <CameraController resetTick={resetTick} />
         {/* Low ambient light for deep space contrast, and angled sun light to generate gorgeous 3D spherical shading */}
         <ambientLight intensity={0.2} color="#ffffff" />
         <directionalLight position={[100, 50, 50]} intensity={2.5} color="#ffffff" />
         {/* Secondary underworld light to heavily illuminate planets crossing visibly below the horizon line */}
         <directionalLight position={[-100, -100, -50]} intensity={1.8} color="#AACCFF" />

         {/* Fake distant ambient stars covering the whole expanded sphere */}
         <Stars radius={R * 8} depth={100} count={5000} factor={8} saturation={0.5} fade speed={1.5} />
         
         <BackgroundStars lst={lst} obsLat={obsLat} />
         <YogataraStars lst={lst} obsLat={obsLat} safeT={safeT} />
         <NakshatraMeridians lst={lst} obsLat={obsLat} safeT={safeT} />
         <ConstellationLines lst={lst} obsLat={obsLat} safeT={safeT} />
         <EclipticRing lst={lst} obsLat={obsLat} />
         <Planets planets={K.planets || []} lst={lst} obsLat={obsLat} safeT={safeT} />
         <HorizonTracker safeT={safeT} />
         <CentralEarth />
         
         {/* Pan controls: User can stay centrally or zoom massive distances like Snowglobe scale */}
         <OrbitControls 
            enableZoom={true} 
            zoomSpeed={4}
            enablePan={true}
            panSpeed={2}
            minDistance={5}
            maxDistance={R * 8} // Incredible zoom range out into deep space
            rotateSpeed={-0.35} 
         />
      </Canvas>
    </div>
  );
};
