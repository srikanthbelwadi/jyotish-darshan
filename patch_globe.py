import sys
import re

with open('src/components/CelestialDomeViewer.jsx', 'r') as f:
    content = f.read()

# 1. Update projection to Orthographic
proj_old = "const projection = d3.geoStereographic()"
proj_new = "const projection = d3.geoOrthographic()"
content = content.replace(proj_old, proj_new)

# 2. Extract Star opacity and color based on altitude
star_old = """    skyGroup.selectAll('.star')
      .data(starFeatures)
      .enter().append('path')
      .attr('class', 'star')
      .attr('d', path)
      .style('fill', '#ffffff')
      .style('opacity', d => 1 / d.properties.mag)
      .attr('r', d => 3 / d.properties.mag);"""

star_new = """    // Draw Stars with Horizon Horizon Coloring (Below Horizon = Ghosted)
    const starNodes = skyGroup.selectAll('.star')
      .data(starFeatures)
      .enter().append('path')
      .attr('class', 'star')
      .attr('d', path)
      .attr('r', d => 3 / d.properties.mag)
      .style('fill', d => d.geometry.coordinates[1] < 0 ? '#4b5563' : '#ffffff')
      .style('opacity', d => (d.geometry.coordinates[1] < 0 ? 0.3 : 1) / d.properties.mag);
"""
content = content.replace(star_old, star_new)

# 3. Modify Yogataras to have Names
yogatara_old = """        return { lon: siderealLon, lat, mag };
    });
    
    // Close the loop for the constellation outline
    yogataras.push(yogataras[0]);"""

yogatara_new = """        return { lon: siderealLon, lat, mag, name: (L_NAKS[lang] || L_NAKS.en)[i] };
    });
    
    // Draw Named Yogatara Anchor Stars
    const yogataraFeatures = yogataras.map(star => {
        const [az, alt] = convertToAltAz(star.lon, star.lat);
        return {
           type: "Feature", name: star.name,
           geometry: { type: "Point", coordinates: [az, alt] }
        };
    });
    
    // Close the loop for the constellation outline AFTER creating labeled points
    yogataras.push(yogataras[0]);"""
content = content.replace(yogatara_old, yogatara_new)


ground_old = """    // Ground Overlay (Rendered last so it sits on top of stars below the horizon)
    skyGroup.append('path')
      .datum(groundFeature)
      .attr('d', path)
      .style('fill', 'url(#groundGradient)')
      .style('stroke', 'rgba(52, 211, 153, 0.5)') // Emerald 400 horizon glow
      .style('stroke-width', 3);"""

ground_new = """    // Faint Equatorial Horizon Ring (Replacing the solid blocked ground)
    const equatorCoord = d3.range(0, 361, 2).map(az => [az, 0]);
    const equatorFeature = { type: "LineString", coordinates: equatorCoord };
    skyGroup.append('path')
      .datum(equatorFeature)
      .attr('class', 'horizon-ring')
      .attr('d', path)
      .style('fill', 'none')
      .style('stroke', 'rgba(52, 211, 153, 0.4)') // Emerald horizon glow
      .style('stroke-width', 2);
      
    // Draw Yogatara Labels
    const nakLabels = skyGroup.selectAll('.yogatara-label')
       .data(yogataraFeatures)
       .enter().append('text')
       .attr('class', 'yogatara-label')
       .text(d => d.name)
       .style('font-size', '8px')
       .style('fill', d => d.geometry.coordinates[1] < 0 ? 'rgba(156,163,175,0.4)' : 'rgba(255,255,255,0.6)')
       .style('text-anchor', 'middle')
       .attr('dy', 12);
       
    // Draw Structural Constellation Stick Figures (Procedural Rashi skeletons)
    const RASHI_STICKS = Array.from({length: 12}).map((_, i) => {
        const s = i * 30;
        const pts = [
           [s+2, Math.sin(i)*10], [s+8, Math.cos(i)*15], [s+15, Math.sin(i+1)*20],
           [s+22, Math.cos(i+1)*5], [s+28, Math.sin(i)*-10], [s+15, Math.sin(i+2)*-15], [s+2, Math.sin(i)*10]
        ];
        return {
           type: "LineString",
           coordinates: pts.map(pt => convertToAltAz(pt[0], pt[1]))
        };
    });
    
    skyGroup.selectAll('.rashi-stick')
      .data(RASHI_STICKS)
      .enter().append('path')
      .attr('class', 'rashi-stick')
      .attr('d', path)
      .style('fill', 'none')
      .style('stroke', 'rgba(250, 204, 21, 0.15)')
      .style('stroke-width', 1);
"""
content = content.replace(ground_old, ground_new)


# Rebuild Planet Advanced SVGs
planet_circle_old = """    planetGroups.append('circle')
       .attr('r', 10)
       .style('fill', d => PLANET_META[d.key]?.color || '#fff')
       .style('filter', 'url(#planetGlow)')
       .style('stroke', '#fff')
       .style('stroke-width', 1.5);"""

planet_circle_new = """    // Render Dynamic Planetary Grahpics
    planetGroups.each(function(d) {
        const g = d3.select(this);
        const color = PLANET_META[d.key]?.color || '#fff';
        const isBelow = d.geometry.coordinates[1] < 0;
        const opacityNode = isBelow ? 0.4 : 1;
        
        g.style('opacity', opacityNode);
        
        if (d.key === 'sun') {
            g.append('circle').attr('r', 16).style('fill', 'rgba(250, 204, 21, 0.3)').style('filter', 'url(#planetGlow)');
            g.append('circle').attr('r', 10).style('fill', color);
            // Solar rays
            for(let i=0; i<8; i++) {
                g.append('line')
                 .attr('x1', 0).attr('y1', 12)
                 .attr('x2', 0).attr('y2', 18)
                 .attr('transform', `rotate(${i*45})`)
                 .style('stroke', color).style('stroke-width', 2);
            }
        } else if (d.key === 'moon') {
            // Crescent Moon
            g.append('path')
             .attr('d', 'M -5,-8 A 10 10 0 1 0 -5,8 A 7 7 0 1 1 -5,-8')
             .style('fill', '#f3f4f6')
             .style('filter', 'url(#planetGlow)');
        } else if (d.key === 'saturn') {
            g.append('ellipse')
             .attr('rx', 18).attr('ry', 5)
             .attr('transform', 'rotate(-25)')
             .style('fill', 'none')
             .style('stroke', 'rgba(250, 204, 21, 0.8)')
             .style('stroke-width', 3);
            g.append('circle').attr('r', 8).style('fill', color);
        } else {
            // Standard marble
            g.append('circle')
             .attr('r', 9)
             .style('fill', color)
             .style('filter', 'url(#planetGlow)')
             .style('stroke', '#fff')
             .style('stroke-width', 1.5);
        }
    });
"""
content = content.replace(planet_circle_old, planet_circle_new)


# Remove the Emoji texts since we have rich icons
planet_text_old = """    planetGroups.append('text')
       .text(d => PLANET_META[d.key]?.icon || '✨')
       .attr('y', 3)
       .attr('x', -6)
       .style('font-size', '12px');"""
planet_text_new = """    // Removed Emoji to favor advanced SVGs """
content = content.replace(planet_text_old, planet_text_new)


# Update updateAll logic to handle new elements
update_old = """       skyGroup.selectAll('path.star, path.grid, path.rashi-boundary, path.nak-boundary, path.constellation-line')
          .attr('d', path)
          .style('display', function() {
             return d3.select(this).attr('d') ? 'block' : 'none';
          });
       
       skyGroup.selectAll('path').filter(function(d) { 
           return d && d.type === 'LineString' && !d.label; 
       }).attr('d', path);

       // Ground
       skyGroup.selectAll('path').filter(function(d) {
           return d && d.type === 'Polygon';
       }).attr('d', path);"""

update_new = """       skyGroup.selectAll('path.star, path.grid, path.rashi-boundary, path.nak-boundary, path.constellation-line, path.horizon-ring, path.rashi-stick')
          .attr('d', path)
          .style('display', function() {
             return d3.select(this).attr('d') ? 'block' : 'none';
          });
       
       skyGroup.selectAll('.yogatara-label')
          .attr('transform', d => {
             const pt = getSafePt(d.geometry.coordinates);
             return pt ? `translate(${pt[0]},${pt[1]})` : 'translate(-1000,-1000)';
          })
          .style('display', d => getSafePt(d.geometry.coordinates) ? 'block' : 'none');
          
       skyGroup.selectAll('.star')
          .style('fill', d => d.geometry.coordinates[1] < 0 ? '#4b5563' : '#ffffff')
          .style('opacity', d => (d.geometry.coordinates[1] < 0 ? 0.3 : 1) / d.properties.mag);
"""
content = content.replace(update_old, update_new)

# Force planets to update conditional styles if they drag above/below horizon
update_planet_old = """       planetGroups
         .attr('transform', d => {
            const pt = getSafePt(d.geometry.coordinates);
            return pt ? `translate(${pt[0]},${pt[1]})` : 'translate(-1000,-1000)';
         })
         .style('display', d => getSafePt(d.geometry.coordinates) ? 'block' : 'none');"""
update_planet_new = """       planetGroups
         .attr('transform', d => {
            const pt = getSafePt(d.geometry.coordinates);
            return pt ? `translate(${pt[0]},${pt[1]})` : 'translate(-1000,-1000)';
         })
         .style('display', d => getSafePt(d.geometry.coordinates) ? 'block' : 'none')
         .style('opacity', d => d.geometry.coordinates[1] < 0 ? 0.4 : 1);"""
content = content.replace(update_planet_old, update_planet_new)

with open('src/components/CelestialDomeViewer.jsx', 'w') as f:
    f.write(content)
print("Patch script executed fully!")
