import { initializeAstroEngine } from './api/engine/swissephLoader.js';
import { computeKundali } from './api/engine/vedic.js';
import { NAKSHATRAS } from './src/engine/constants.js';
import fs from 'fs';

async function main() {
    await initializeAstroEngine();
    
    // Details: 3rd Sep 1974, born in Bangalore, India, at 6.30PM local time
    const params = {
        year: 1974,
        month: 9,
        day: 3,
        hour: 18,
        minute: 30,
        lat: 12.9716,
        lng: 77.5946,
        utcOffset: 5.5
    };

    const kundali = computeKundali(params);
    
    // Generate HTML with embedded threejs
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jyotish 3D Sky Prototype</title>
    <style>
        body { margin: 0; overflow: hidden; background: #050510; color: #fff; font-family: "Inter", sans-serif; }
        #info { position: absolute; top: 15px; left: 15px; z-index: 100; pointer-events: none; background: rgba(0,0,0,0.6); padding: 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(5px); }
        h2 { margin: 0 0 10px 0; font-size: 1.2rem; color: #f9d77e; }
        p { margin: 5px 0; font-size: 0.9rem; color: #ccc; }
        ul { list-style: none; padding: 0; margin: 10px 0 0 0; }
        li { font-size: 0.85rem; margin-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 4px;}
        canvas { display: block; }
    </style>
</head>
<body>
    <div id="info">
        <h2>Birth Sky (3rd Sep 1974, Bangalore, 18:30)</h2>
        <p>Ayanamsa: ${kundali.ayanamsaDMS} (Lahiri)</p>
        <p>Lagna: ${kundali.lagna.degreeFormatted} in Rashi ${kundali.lagna.rashi}</p>
        <div style="margin-top: 15px; height: 300px; overflow-y: auto; padding-right: 10px;">
        <ul>
            ${kundali.planets.map(p => `<li><strong style="color: ${getPlanetColorStr(p.key)}">${p.name.split(' ')[0]}</strong>: ${p.degreeFormatted} (${p.nakshatraName})</li>`).join('')}
        </ul>
        </div>
    </div>
    <script async src="https://unpkg.com/es-module-shims@1.6.3/dist/es-module-shims.js"></script>
    <script type="importmap">
      {
        "imports": {
          "three": "https://unpkg.com/three@0.154.0/build/three.module.js",
          "three/addons/": "https://unpkg.com/three@0.154.0/examples/jsm/"
        }
      }
    </script>
    <script type="module">
        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        // Kundali Data injected from backend
        const planetsData = ${JSON.stringify(kundali.planets)};
        const lagna = ${JSON.stringify(kundali.lagna)};
        const nakshatrasData = ${JSON.stringify(NAKSHATRAS)};
        const sunRashi = ${kundali.planets.find(p => p.key === 'sun').rashi};
        const moonRashi = ${kundali.planets.find(p => p.key === 'moon').rashi};

        const scene = new THREE.Scene();
        // Add a subtle starfield background
        scene.fog = new THREE.FogExp2(0x050510, 0.015);

        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 15, 25);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Colors
        const planetColors = {
            sun: 0xffd700, moon: 0xffffff, mars: 0xff4422,
            mercury: 0x22ff22, jupiter: 0xffaa00, venus: 0xe0e0ff,
            saturn: 0x4444ff, rahu: 0x888888, ketu: 0xaa4444
        };

        const radius = 12;

        const group = new THREE.Group();
        scene.add(group);

        // Add Ecliptic Ring
        const ringGeo = new THREE.RingGeometry(radius - 0.05, radius + 0.05, 128);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x444444, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        group.add(ring);

        // Plot Planets
        planetsData.forEach(p => {
            const isNode = p.key === 'rahu' || p.key === 'ketu';
            
            // Sphere
            const geometry = new THREE.SphereGeometry(isNode ? 0.3 : 0.5, 32, 32);
            const material = new THREE.MeshBasicMaterial({ color: planetColors[p.key] || 0xffffff });
            const sphere = new THREE.Mesh(geometry, material);

            const r = THREE.MathUtils.degToRad(p.longitude); 
            
            // Convert to Cartesian (X, Z on the ecliptic plane)
            sphere.position.x = radius * Math.cos(r);
            sphere.position.z = radius * -Math.sin(r); // -sin to go anticlockwise if looking from top

            group.add(sphere);

            // Add glow 
            const glowGeo = new THREE.SphereGeometry(isNode ? 0.5 : 0.8, 32, 32);
            const glowMat = new THREE.MeshBasicMaterial({ 
                color: planetColors[p.key], 
                transparent: true, 
                opacity: 0.3,
                blending: THREE.AdditiveBlending
            });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            glow.position.copy(sphere.position);
            group.add(glow);

            // Text label
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256; canvas.height = 128;
            context.fillStyle = '#ffffff';
            context.font = 'bold 36px Arial';
            context.textAlign = 'center';
            context.fillText(p.name.split(' ')[0], 128, 40);
            context.font = '24px Arial';
            context.fillStyle = '#aaaaaa';
            context.fillText(p.degreeFormatted, 128, 80);

            const tex = new THREE.CanvasTexture(canvas);
            const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.scale.set(4, 2, 1);
            sprite.position.copy(sphere.position);
            sprite.position.y += 1.5;
            group.add(sprite);
        });

        // Plot Lagna (Ascendant)
        const lagnaRad = THREE.MathUtils.degToRad(lagna.longitude);
        const lCanvas = document.createElement('canvas');
        const lContext = lCanvas.getContext('2d');
        lCanvas.width = 256; lCanvas.height = 128;
        lContext.fillStyle = '#ffaa22';
        lContext.font = 'bold 36px Arial';
        lContext.textAlign = 'center';
        lContext.fillText('ASCENDANT', 128, 40);
        lContext.font = '24px Arial';
        lContext.fillText(lagna.degreeFormatted, 128, 80);
        const lTex = new THREE.CanvasTexture(lCanvas);
        const lMat = new THREE.SpriteMaterial({ map: lTex, transparent: true });
        const lSprite = new THREE.Sprite(lMat);
        lSprite.scale.set(4, 2, 1);
        lSprite.position.set( radius * Math.cos(lagnaRad), 1.5, radius * -Math.sin(lagnaRad) );
        group.add(lSprite);

        // Add basic Zodiac sections
        const rashis = ['Aries (Mesha)','Taurus (Vrishabha)','Gemini (Mithuna)','Cancer (Karka)','Leo (Simha)','Virgo (Kanya)','Libra (Tula)','Scorpio (Vrishchika)','Sagittarius (Dhanu)','Capricorn (Makara)','Aquarius (Kumbha)','Pisces (Meena)'];
        
        for(let i=0; i<12; i++) {
            // Rashi boundary line
            const lineMat = new THREE.LineBasicMaterial({ color: 0x333344 });
            const lineGeo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(radius - 2, 0, 0),
                new THREE.Vector3(radius + 4, 0, 0)
            ]);
            const line = new THREE.Line(lineGeo, lineMat);
            const lineRad = THREE.MathUtils.degToRad(i * 30);
            line.position.set(0,0,0);
            // Apply rotation around Y
            line.rotation.y = lineRad;
            group.add(line);

            // Rashi label
            const midRad = THREE.MathUtils.degToRad(i * 30 + 15);
            const rRashi = radius + 3;
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256; canvas.height = 128;
            context.fillStyle = 'rgba(255, 100, 100, 0.6)';
            context.font = 'bold 24px Arial';
            context.textAlign = 'center';
            context.fillText(rashis[i], 128, 64);

            // Highlighting Sun/Moon Signs
            if (i === sunRashi || i === moonRashi) {
                const isSun = i === sunRashi;
                context.fillStyle = isSun ? '#ffcc00' : '#bbccff';
                context.font = 'bold 18px Arial';
                context.fillText(isSun ? 'SUN SIGN' : 'MOON SIGN', 128, 100);
                
                // Add a glowing wedge
                const highlightGeo = new THREE.RingGeometry(radius - 0.5, radius + 3.5, 32, 1, 0, THREE.MathUtils.degToRad(30));
                const highlightMat = new THREE.MeshBasicMaterial({ 
                    color: isSun ? 0xffaa00 : 0x88aaff, 
                    transparent: true, 
                    opacity: 0.15,
                    side: THREE.DoubleSide
                });
                const highlight = new THREE.Mesh(highlightGeo, highlightMat);
                highlight.rotation.x = -Math.PI / 2;
                const ringContainer = new THREE.Group();
                ringContainer.rotation.y = lineRad;
                ringContainer.add(highlight);
                group.add(ringContainer);
            }

            const tex = new THREE.CanvasTexture(canvas);
            const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.scale.set(5, 2.5, 1);
            sprite.position.x = rRashi * Math.cos(midRad);
            sprite.position.z = rRashi * -Math.sin(midRad);
            group.add(sprite);
        }

        // Overlay Nakshatras (27 segments)
        for(let i=0; i<27; i++) {
            const nakDeg = i * (360/27);
            const lineMat = new THREE.LineBasicMaterial({ color: 0x447744, transparent: true, opacity: 0.6 });
            const lineGeo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(radius - 0.5, 0, 0),
                new THREE.Vector3(radius + 2, 0, 0)
            ]);
            const line = new THREE.Line(lineGeo, lineMat);
            line.rotation.y = THREE.MathUtils.degToRad(nakDeg);
            group.add(line);

            // Nakshatra label
            const midNakRad = THREE.MathUtils.degToRad(nakDeg + (360/27)/2);
            const rNak = radius + 1.8;
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256; canvas.height = 64;
            context.fillStyle = '#aaddaa';
            context.font = '18px Arial';
            context.textAlign = 'center';
            context.fillText(nakshatrasData[i].name, 128, 40);
            const tex = new THREE.CanvasTexture(canvas);
            const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.scale.set(3, 0.75, 1);
            sprite.position.x = rNak * Math.cos(midNakRad);
            sprite.position.z = rNak * -Math.sin(midNakRad);
            sprite.position.y = -0.8; // push them slightly below ecliptic
            group.add(sprite);
        }

        // Overlay Important Stars (Yoga Taras with approximate sidereal longitudes)
        const yogaTaras = [
            { name: "Rohini (Aldebaran)", lon: 45.47, color: 0xffaaaa },
            { name: "Magha (Regulus)", lon: 125.13, color: 0xaaaaff },
            { name: "Chitra (Spica)", lon: 179.99, color: 0xffffff }, // Chitra paksha ayanamsa 180 opposite Aries 0
            { name: "Jyeshtha (Antares)", lon: 225.76, color: 0xff6666 },
            { name: "Shravana (Altair)", lon: 277.77, color: 0xaaffaa }
        ];

        yogaTaras.forEach(star => {
            const rad = THREE.MathUtils.degToRad(star.lon);
            const dist = radius + 6; 
            
            const starGeo = new THREE.SphereGeometry(0.25, 16, 16);
            const starMat = new THREE.MeshBasicMaterial({ color: star.color });
            const starMesh = new THREE.Mesh(starGeo, starMat);
            starMesh.position.set(dist * Math.cos(rad), (Math.random()-0.5)*5, dist * -Math.sin(rad)); 
            group.add(starMesh);

            const glowGeo = new THREE.SphereGeometry(0.6, 16, 16);
            const glowMat = new THREE.MeshBasicMaterial({ color: star.color, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            glow.position.copy(starMesh.position);
            group.add(glow);

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256; canvas.height = 64;
            context.fillStyle = '#' + star.color.toString(16).padStart(6, '0');
            context.font = 'bold 20px Arial';
            context.textAlign = 'center';
            context.fillText(star.name, 128, 40);
            const tex = new THREE.CanvasTexture(canvas);
            const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.scale.set(5, 1.25, 1);
            sprite.position.copy(starMesh.position);
            sprite.position.y += 1.0;
            group.add(sprite);
            
            const lineMat = new THREE.LineBasicMaterial({ color: star.color, transparent: true, opacity: 0.3 });
            const lineGeo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(radius * Math.cos(rad), 0, radius * -Math.sin(rad)),
                starMesh.position
            ]);
            group.add(new THREE.Line(lineGeo, lineMat));
        });

        // Add 1000 background stars
        const starsGeo = new THREE.BufferGeometry();
        const starsPos = new Float32Array(3000);
        for(let i=0; i<3000; i++) {
            starsPos[i] = (Math.random() - 0.5) * 100;
        }
        starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
        const starsMat = new THREE.PointsMaterial({color: 0xaaaaaa, size: 0.1});
        const stars = new THREE.Points(starsGeo, starsMat);
        scene.add(stars);

        window.addEventListener('resize', onWindowResize, false);
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            // Slowly rotate the entire ecliptic to simulate time passing/Earth spinning
            // group.rotation.y -= 0.0005; 
            renderer.render(scene, camera);
        }
        animate();
    </script>
</body>
</html>
    `;

    fs.writeFileSync('3d_prototype_output.html', htmlContent);
    console.log("Successfully generated 3d_prototype_output.html");
}

function getPlanetColorStr(key) {
    const colors = {
        sun: '#ffd700', moon: '#ffffff', mars: '#ff4422',
        mercury: '#22ff22', jupiter: '#ffaa00', venus: '#e0e0ff',
        saturn: '#4444ff', rahu: '#888888', ketu: '#aa4444'
    };
    return colors[key] || '#ffffff';
}

main().catch(console.error);
