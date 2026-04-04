import React from 'react';

export default function Cosmos3DTab({ kundali, lang }) {
    if (!kundali) return null;
    
    // Fallbacks
    const qLat = kundali.input?.lat || 12.9716;
    const qLng = kundali.input?.lng || 77.5946;
    const qUtc = kundali.input?.utcOffset || 5.5;
    const qDate = kundali.input?.dob || '1974-09-03';
    const qTime = kundali.input?.tob || '18:30';

    // Build URL parameters
    const query = new URLSearchParams({
        lat: qLat,
        lng: qLng,
        utc: qUtc,
        lang: lang,
        date: qDate,
        time: qTime
    }).toString();

    // The iframe loads the static HTML file
    return (
        <div style={{ 
            width: '100%', 
            height: '92vh',
            minHeight: '800px',
            background: '#050510', 
            borderRadius: '8px', 
            overflow: 'hidden', 
            border: '1px solid var(--border-light)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            marginTop: '10px'
        }}>
            <iframe 
               src={`/3d-sky.html?${query}`} 
               style={{ width: '100%', height: '100%', border: 'none' }}
               title="3D Cosmic Visualizer"
            />
        </div>
    );
}
