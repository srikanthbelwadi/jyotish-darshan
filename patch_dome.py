import sys
import re

with open('src/components/CelestialDomeViewer.jsx', 'r') as f:
    content = f.read()

# Add ZODIAC_GLYPHS after L_RASHI
zodiac_str = "const ZODIAC_GLYPHS = ['♈︎','♉︎','♊︎','♋︎','♌︎','♍︎','♎︎','♏︎','♐︎','♑︎','♒︎','♓︎'];\n"
content = content.replace("};\n\n// Data for planets", "};\n\n" + zodiac_str + "\n// Data for planets")

# Replace viewDrag state and the start of useEffect
drag_state_old = "const [viewDrag, setViewDrag] = useState({ yaw: 180, pitch: 15 }); // Face South initially, tilted slightly up"
drag_state_new = """const currentDrag = useRef({ yaw: 180, pitch: 15 }); // Face South initially, tilted slightly up
  const [activeTarget, setActiveTarget] = useState(null);"""

content = content.replace(drag_state_old, drag_state_new)

# Inside useEffect, update the dependencies and initial rotation
rot_old = "projection.rotate([-viewDrag.yaw, -viewDrag.pitch, 0]);"
rot_new = "projection.rotate([-currentDrag.current.yaw, -currentDrag.current.pitch, 0]);"
content = content.replace(rot_old, rot_new)

# Add defs and gradients
bg_old = """    // Dark space background
    svg.append('rect')
       .attr('width', w)
       .attr('height', h)
       .attr('fill', '#050a16');"""

bg_new = """    // Deep Space Radial Gradient
    const defs = svg.append('defs');
    const skyGrad = defs.append('radialGradient')
       .attr('id', 'skyGradient')
       .attr('cx', '50%').attr('cy', '70%').attr('r', '80%');
    skyGrad.append('stop').attr('offset', '0%').attr('stop-color', '#10172a');
    skyGrad.append('stop').attr('offset', '100%').attr('stop-color', '#02040a');
    
    const groundGrad = defs.append('linearGradient')
       .attr('id', 'groundGradient')
       .attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
    groundGrad.append('stop').attr('offset', '0%').attr('stop-color', '#091515'); // faint earth glow
    groundGrad.append('stop').attr('offset', '100%').attr('stop-color', '#000000');

    // Dark space background
    svg.append('rect')
       .attr('width', w)
       .attr('height', h)
       .attr('fill', 'url(#skyGradient)');"""
content = content.replace(bg_old, bg_new)

# Update stars generation to be 500 stars
stars_old = """    // Plot Stars (Yogatāras for Nakshatras)
    const yogataras = Array.from({length: 27}).map((_, i) => {"""
stars_new = """    // Generate Starry Milky Way (Procedural)
    const organicStars = Array.from({ length: 600 }).map((_, i) => {
        const lon = Math.random() * 360;
        const lat = (Math.random() - 0.5) * 180;
        // Increase density along the ecliptic and equator
        let mag = Math.random() * 5 + 1;
        if (Math.abs(lat) < 30) mag -= 0.5;
        return { lon, lat: lat, mag: Math.max(0.5, mag) };
    });

    const yogatasAndStars = [...organicStars];
    // Add bright anchor stars for Nakshatras randomly for visual effect if needed
    
    // Plot Stars (Organic + Yogatāras)
    const yogataras = yogatasAndStars;
    """
content = content.replace(stars_old, stars_new)

# Update Zodiac labels to Glyphs
rashi_old = "label: (L_RASHI[lang] || L_RASHI.en)[i],"
rashi_new = "label: ZODIAC_GLYPHS[i] + ' ' + (L_RASHI[lang] || L_RASHI.en)[i],"
content = content.replace(rashi_old, rashi_new)

rashi_font_old = ".style('font-size', '10px')"
rashi_font_new = ".style('font-size', '14px')"
content = content.replace(rashi_font_old, rashi_font_new)

rashi_stroke_old = "rgba(212, 175, 55, 0.15)"
rashi_stroke_new = "rgba(212, 175, 55, 0.25)"
content = content.replace(rashi_stroke_old, rashi_stroke_new)

# Update Nakshatra labels
nak_font_old = ".style('font-size', '8px')"
nak_font_new = ".style('font-size', '9px')"
content = content.replace(nak_font_old, nak_font_new)

# Update planet interactions
planet_old = "planetGroups.append('circle')"
planet_new = """
    planetGroups
       .on('click', (event, d) => {
           setActiveTarget(d);
           skyGroup.selectAll('.planet-selection-ring').remove();
           d3.select(event.currentTarget).append('circle')
              .attr('class', 'planet-selection-ring')
              .attr('r', 16)
              .style('fill', 'none')
              .style('stroke', 'rgba(255,255,255,0.8)')
              .style('stroke-width', 2)
              .transition().duration(2000)
              .attr('r', 24).style('opacity', 0).remove();
       })
       .on('mouseenter', (event, d) => setActiveTarget(d))
       .style('cursor', 'pointer');
       
    planetGroups.append('circle')"""
content = content.replace(planet_old, planet_new)

# Update ground filler
ground_old = ".style('fill', '#070b12') // Very dark slightly blue-ish black ground"
ground_new = ".style('fill', 'url(#groundGradient)') // Glowing dark earth"
content = content.replace(ground_old, ground_new)

ground_stroke_old = ".style('stroke', 'rgba(100,150,255,0.2)')"
ground_stroke_new = ".style('stroke', 'rgba(125,211,252,0.4)')"
content = content.replace(ground_stroke_old, ground_stroke_new)

# Update drag logic
drag_logic_old = """    const drag = d3.drag()
       .on("drag", (event) => {
          setViewDrag(prev => {
             let newYaw = prev.yaw - event.dx * 0.5;
             let newPitch = prev.pitch - event.dy * 0.5;
             if (newPitch > 90) newPitch = 90;
             if (newPitch < -10) newPitch = -10;
             return { yaw: newYaw, pitch: newPitch };
          });
       });"""

drag_logic_new = """    const drag = d3.drag()
       .on("drag", (event) => {
             let newYaw = currentDrag.current.yaw - event.dx * 0.4;
             let newPitch = currentDrag.current.pitch - event.dy * 0.4;
             if (newPitch > 90) newPitch = 90;
             if (newPitch < -20) newPitch = -20;
             currentDrag.current = { yaw: newYaw, pitch: newPitch };
             
             projection.rotate([-newYaw, -newPitch, 0]);
             updateAll();
       });"""
content = content.replace(drag_logic_old, drag_logic_new)

# Inject HUD Overlay into JSX Return
jsx_old = """         <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', pointerEvents: 'none' }}>
           <strong>Ecliptic Map</strong> (Sidereal Longitude)
         </div>"""

jsx_new = """         <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
           <strong>Stellarium Ecliptic Engine</strong> 
         </div>
         
         {activeTarget && (
           <div style={{
              position: 'absolute', top: '20px', left: '20px', 
              background: 'rgba(10, 15, 30, 0.75)',
              backdropFilter: 'blur(10px)',
              padding: '16px', borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              color: 'white', maxWidth: '240px',
              fontFamily: 'var(--font-sans)', pointerEvents: 'none'
           }}>
             <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px', marginRight: '8px', color: PLANET_META[activeTarget.key]?.color || '#fff' }}>
                  {PLANET_META[activeTarget.key]?.icon}
                </span>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', letterSpacing: '0.05em' }}>
                    {(PLANET_META[activeTarget.key]?.label || activeTarget.key).toUpperCase()}
                    {activeTarget.name && activeTarget.name !== activeTarget.key && 
                       <span style={{opacity: 0.6, fontSize: '12px', marginLeft:'4px'}}>({activeTarget.name})</span>}
                  </div>
                  {activeTarget.isRetrograde && <div style={{color:'#ef4444', fontSize:'10px', fontWeight:'bold'}}>RETROGRADE (R)</div>}
                </div>
             </div>
             
             <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px', opacity: 0.9 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Longitude:</span> 
                  <span style={{ fontFamily: 'monospace', color: 'var(--accent-gold)' }}>
                     {activeTarget.degreeFormatted || (Math.round(activeTarget.longitude * 100)/100 + '°')}
                  </span>
                </div>
                {activeTarget.rashi !== undefined && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Sign:</span> 
                    <span style={{ color: '#a78bfa' }}>{ZODIAC_GLYPHS[activeTarget.rashi]} {(L_RASHI[lang] || L_RASHI.en)[activeTarget.rashi]}</span>
                  </div>
                )}
                {activeTarget.nakshatraName && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Nakshatra:</span> 
                    <span>{activeTarget.nakshatraName}</span>
                  </div>
                )}
                {activeTarget.house && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>House (Bhava):</span> 
                    <span>{activeTarget.house}</span>
                  </div>
                )}
             </div>
           </div>
         )}"""
content = content.replace(jsx_old, jsx_new)

with open('src/components/CelestialDomeViewer.jsx', 'w') as f:
    f.write(content)
print("Patch applied successfully.")
