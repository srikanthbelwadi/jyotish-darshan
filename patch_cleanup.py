import sys

with open('src/components/CelestialDomeViewer.jsx', 'r') as f:
    c = f.read()

# 1. Update Sky Gradient to Blue top, Black bottom
grad_old = """    const skyGrad = defs.append('radialGradient')
       .attr('id', 'skyGradient')
       .attr('cx', '50%').attr('cy', '60%').attr('r', '80%');
    skyGrad.append('stop').attr('offset', '0%').attr('stop-color', '#1e3a8a'); // Twilight Blue
    skyGrad.append('stop').attr('offset', '80%').attr('stop-color', '#0f172a');
    skyGrad.append('stop').attr('offset', '100%').attr('stop-color', '#02040a'); // Deep space"""

grad_new = """    const skyGrad = defs.append('linearGradient')
       .attr('id', 'skyGradient')
       .attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
    skyGrad.append('stop').attr('offset', '0%').attr('stop-color', '#1e3a8a'); // Blue sky above
    skyGrad.append('stop').attr('offset', '50%').attr('stop-color', '#0f172a');
    skyGrad.append('stop').attr('offset', '50.1%').attr('stop-color', '#000000'); // Horizon cut
    skyGrad.append('stop').attr('offset', '100%').attr('stop-color', '#000000'); // Black night below"""
c = c.replace(grad_old, grad_new)

# 2. Only keep Yogataras, Remove organicStars
stars_old = """    // Generate Starry Milky Way (Procedural)
    const organicStars = Array.from({ length: 500 }).map((_, i) => {
        const lon = Math.random() * 360;
        const lat = (Math.random() - 0.5) * 180;
        let mag = Math.random() * 5 + 1;
        if (Math.abs(lat) < 30) mag -= 0.5;
        return { lon, lat: lat, mag: Math.max(0.5, mag) };
    });

    // Actual Constellation Anchor Stars (Yogataras)
    const yogataras = Array.from({length: 27}).map((_, i) => {
        const siderealLon = (i * 13.3333) + 6.6666;
        // Classical zig-zag distribution along the ecliptic to simulate constellation sticks
        const lat = Math.sin(i * 1.5) * 15; 
        const mag = Math.abs(Math.sin(i * 3)) * 2 + 0.5;
        return { lon: siderealLon, lat, mag, name: (L_NAKS[lang] || L_NAKS.en)[i] };
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
    yogataras.push(yogataras[0]);

    // Plot all stars
    const starFeatures = [...organicStars, ...yogataras].map(star => {
        const [az, alt] = convertToAltAz(star.lon, star.lat);
        return {
           type: "Feature",
           geometry: { type: "Point", coordinates: [az, alt] },
           properties: { mag: star.mag }
        };
    });"""

stars_new = """    // Only Keep Yogataras (Real Stars)
    const yogataras = Array.from({length: 27}).map((_, i) => {
        const siderealLon = (i * 13.3333) + 6.6666;
        const lat = Math.sin(i * 1.5) * 15; 
        const mag = 1; // Make them consistently bright
        return { lon: siderealLon, lat, mag, name: (L_NAKS[lang] || L_NAKS.en)[i] };
    });
    
    // Draw Named Yogatara Anchor Stars
    const yogataraFeatures = yogataras.map(star => {
        const [az, alt] = convertToAltAz(star.lon, star.lat);
        return {
           type: "Feature", name: star.name,
           geometry: { type: "Point", coordinates: [az, alt] }
        };
    });

    const starFeatures = yogataras.map(star => {
        const [az, alt] = convertToAltAz(star.lon, star.lat);
        return {
           type: "Feature",
           geometry: { type: "Point", coordinates: [az, alt] },
           properties: { mag: star.mag }
        };
    });"""
c = c.replace(stars_old, stars_new)

# 3. Remove Constellation connection line entirely!
constel_line_old = """    // Draw Constellation Skeleton / Outline
    const constellationFeature = {
        type: "LineString",
        coordinates: yogataras.map(star => convertToAltAz(star.lon, star.lat))
    };
    
    skyGroup.append('path')
      .datum(constellationFeature)
      .attr('class', 'constellation-line')
      .attr('d', path)
      .style('fill', 'none')
      .style('stroke', 'rgba(255, 255, 255, 0.35)') // Faint white stick figures
      .style('stroke-width', 1);"""

constel_line_new = """    // Removed constellation connection line as requested."""
c = c.replace(constel_line_old, constel_line_new)

# 4. Add Translucent Green Ground for land surface
horizon_old = """    // Faint Equatorial Horizon Ring (Replacing the solid blocked ground)
    const equatorCoord = d3.range(0, 361, 2).map(az => [az, 0]);
    const equatorFeature = { type: "LineString", coordinates: equatorCoord };
    skyGroup.append('path')
      .datum(equatorFeature)
      .attr('class', 'horizon-ring')
      .attr('d', path)
      .style('fill', 'none')
      .style('stroke', 'rgba(52, 211, 153, 0.4)') // Emerald horizon glow
      .style('stroke-width', 2);"""

horizon_new = """    // Half-sphere Green Land Surface
    const groundCoords = d3.range(0, 361, 5).map(az => [az, 0]);
    groundCoords.push([360, -90], [0, -90]); // Close below zenith
    const semiGroundFeature = { type: "Polygon", coordinates: [groundCoords] };
    
    skyGroup.append('path')
      .datum(semiGroundFeature)
      .attr('class', 'ground-surface')
      .attr('d', path)
      .style('fill', 'rgba(6, 78, 59, 0.6)') // Translucent Green Land Surface
      .style('stroke', 'none');
      
    // Bright Equatorial Horizon Ring
    const equatorCoord = d3.range(0, 361, 2).map(az => [az, 0]);
    const equatorFeature = { type: "LineString", coordinates: equatorCoord };
    skyGroup.append('path')
      .datum(equatorFeature)
      .attr('class', 'horizon-ring')
      .attr('d', path)
      .style('fill', 'none')
      .style('stroke', 'rgba(52, 211, 153, 0.8)') // Bright emerald
      .style('stroke-width', 3);"""
c = c.replace(horizon_old, horizon_new)

# Update updateAll to grab ground-surface
update_old = "path.constellation-line, path.horizon-ring, path.rashi-stick')"
update_new = "path.horizon-ring, path.ground-surface, path.rashi-stick')"
c = c.replace(update_old, update_new)

with open('src/components/CelestialDomeViewer.jsx', 'w') as f:
    f.write(c)

