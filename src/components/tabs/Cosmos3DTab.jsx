import React, { useState, useEffect, useRef } from 'react';
import { PLANET_COLORS } from '../../engine/constants.js';

export default function Cosmos3DTab({ kundali, lang, onSkyUpdate }) {
    if (!kundali) return null;
    
    // Fallbacks
    const qLat = kundali.input?.lat || 12.9716;
    const qLng = kundali.input?.lng || 77.5946;
    const qUtc = kundali.input?.utcOffset || 5.5;
    
    const initDate = kundali.input?.dob || '1974-09-03';
    const initTime = kundali.input?.tob || '18:30';
    const [initY, initM, initD] = initDate.split('-').map(Number);
    const [initH, initMin] = initTime.split(':').map(Number);

    const [scrubDate, setScrubDate] = useState({ y: initY, m: initM, d: initD, h: initH, min: initMin });
    const [skyData, setSkyData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const iframeRef = useRef(null);

    // Initial query for SRC URL to set defaults inside HTML
    const query = new URLSearchParams({
        lat: qLat,
        lng: qLng,
        utc: qUtc,
        lang: lang,
        date: initDate,
        time: initTime
    }).toString();

    // Debounced Fetch
    useEffect(() => {
        const fetchSky = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/astrosky?year=${scrubDate.y}&month=${scrubDate.m}&day=${scrubDate.d}&hour=${scrubDate.h}&minute=${scrubDate.min}&lat=${qLat}&lng=${qLng}&utcOffset=${qUtc}&lang=${lang}`);
                const data = await res.json();
                setSkyData(data);
                if (onSkyUpdate && data.kundali) {
                    onSkyUpdate(data.kundali);
                }
                
                // Blast the fresh geometry down into the visualizer!
                if (iframeRef.current && iframeRef.current.contentWindow) {
                    iframeRef.current.contentWindow.postMessage({ type: 'RENDER_SKY', payload: data }, '*');
                }
            } catch (err) {
                console.error("Error fetching astrosky data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchSky, 150);
        return () => clearTimeout(timeoutId);
    }, [scrubDate.y, scrubDate.m, scrubDate.d, scrubDate.h, scrubDate.min, qLat, qLng, qUtc, lang]);

    const handleScrub = (field, val) => {
        setScrubDate(prev => {
            const next = { ...prev, [field]: parseInt(val) };
            if (field === 'm' || field === 'y') {
                const mxDays = new Date(next.y, next.m, 0).getDate();
                if (next.d > mxDays) next.d = mxDays;
            }
            return next;
        });
    };
    
    // UI Helpers
    const timeMins = scrubDate.h * 60 + scrubDate.min;
    const uiD = skyData?.uiDict || {};

    return (
        <div style={{ animation: 'slideIn 0.25s ease', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 3D Render Window (Dumb Frame) */}
            <div style={{ 
                width: '100%', 
                height: '60vh',
                minHeight: '400px',
                background: '#050510', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                border: '1px solid var(--border-light)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                position: 'relative'
            }}>
                {isLoading && (
                    <div style={{ position: 'absolute', top: 15, right: 20, color: '#f9d77e', fontSize: 13, zIndex: 10, fontWeight: 'bold' }}>
                        Computing Mechanics...
                    </div>
                )}
                <iframe 
                   ref={iframeRef}
                   src={`/3d-sky.html?${query}`} 
                   style={{ width: '100%', height: '100%', border: 'none' }}
                   title="3D Cosmic Visualizer"
                />
            </div>

            {/* Native Data Layout */}
            {skyData && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                    
                    {/* Planet Card */}
                    <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: 15, color: 'var(--text-primary)', fontWeight: 700, borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                            {uiD.planetsLabel || 'Planetary Positions'}
                        </h3>

                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                            {skyData.kundali.planets.map(p => {
                                const isMoon = p.key === 'moon';
                                const mkIdx = p.nakshatraIndex !== undefined ? p.nakshatraIndex : (p.nakshatra ? p.nakshatra - 1 : 0);
                                const nt = uiD.nakshatras || [];
                                const nNak = nt[mkIdx] || skyData.nakshatras?.[mkIdx]?.name || p.nakshatraName;
                                
                                return (
                                    <li key={p.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '4px 0', borderBottom: '1px solid var(--bg-hover)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100px' }}>
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: PLANET_COLORS[p.key] || '#9CA3AF', flexShrink: 0 }} />
                                            <strong style={{ color: 'var(--text-primary)' }}>{p.name.split(' ')[0]}</strong>
                                        </div>
                                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{p.degreeFormatted}</span>
                                        <span style={{ color: isMoon ? '#7C3AED' : 'var(--text-tertiary)', fontSize: 11, textAlign: 'right', flex: 1, fontWeight: isMoon ? 'bold' : 'normal' }}>({nNak})</span>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>

                    {/* Time Machine Card */}
                    <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: 15, color: 'var(--text-primary)', fontWeight: 700, borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                            {uiD.timeTravelLabel || 'Time Travel'}
                        </h3>
                        
                        {/* System Context Data */}
                        <div style={{ marginBottom: 15, paddingBottom: 15, borderBottom: '1px solid var(--border-light)', fontSize: 13, display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-primary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                                <span>{String(scrubDate.d).padStart(2,'0')} / {String(scrubDate.m).padStart(2,'0')} / {scrubDate.y}</span>
                                <span>{String(scrubDate.h).padStart(2,'0')}:{String(scrubDate.min).padStart(2,'0')}</span>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{color: 'var(--text-secondary)'}}>{uiD.locationLabel || 'Location'}:</span>
                                <span style={{fontFamily: 'var(--font-mono)'}}>{qLat.toFixed(2)}°, {qLng.toFixed(2)}°</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{color: 'var(--text-secondary)'}}>{uiD.lagna || 'Lagna'}:</span>
                                <span>{skyData.localizedRashis?.[skyData.kundali.lagna.rashi] || skyData.kundali.lagna.rashiName} <span style={{fontFamily: 'var(--font-mono)', fontSize: 11}}>({skyData.kundali.lagna.degreeFormatted})</span></span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{color: 'var(--text-secondary)'}}>{uiD.tithi || 'Tithi'}:</span>
                                <span>{skyData.panchang?.tithi || 1} {skyData.panchang?.paksha ? `(${uiD[skyData.panchang.paksha.toLowerCase()] || skyData.panchang.paksha})` : ''}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{color: 'var(--text-secondary)'}}>{uiD.vara || 'Vara'}:</span>
                                <span>{skyData.vara || ''}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{color: 'var(--text-secondary)'}}>{uiD.ayanamsa || 'Ayanamsa'}:</span>
                                <span style={{fontFamily: 'var(--font-mono)'}}>{skyData.kundali.ayanamsaDMS}</span>
                            </div>
                        </div>

                        {/* Sliders */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {[
                                { label: uiD.yearLabel || "YEAR", val: scrubDate.y, max: 2100, min: 1900, field: 'y' },
                                { label: uiD.monthLabel || "MONTH", val: scrubDate.m, max: 12, min: 1, field: 'm' },
                                { label: uiD.dayLabel || "DAY", val: scrubDate.d, max: 31, min: 1, field: 'd' }
                            ].map(item => (
                                <div key={item.field} style={{ display: 'flex', alignItems: 'center', fontSize: 12 }}>
                                    <span style={{ width: '60px', color: 'var(--text-secondary)', fontWeight: 600 }}>{item.label}</span>
                                    <input 
                                        type="range" min={item.min} max={item.max} value={item.val} 
                                        onChange={(e) => handleScrub(item.field, e.target.value)}
                                        style={{ flex: 1, margin: '0 15px', cursor: 'pointer', accentColor: 'var(--primary-color)' }} 
                                    />
                                    <span style={{ width: '35px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 600 }}>
                                        {String(item.val).padStart(2,'0')}
                                    </span>
                                </div>
                            ))}
                            
                            <div style={{ display: 'flex', alignItems: 'center', fontSize: 12, marginTop: 5 }}>
                                <span style={{ width: '60px', color: 'var(--text-secondary)', fontWeight: 600 }}>{uiD.timeLabel || "TIME"}</span>
                                <input 
                                    type="range" min={0} max={1425} step={15} value={timeMins} 
                                    onChange={(e) => {
                                        const v = parseInt(e.target.value);
                                        handleScrub('h', Math.floor(v/60));
                                        handleScrub('min', v % 60);
                                    }}
                                    style={{ flex: 1, margin: '0 15px', cursor: 'pointer', accentColor: 'var(--primary-color)' }} 
                                />
                                <span style={{ width: '35px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 600 }}>
                                    {String(scrubDate.h).padStart(2,'0')}:{String(scrubDate.min).padStart(2,'0')}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button 
                                    onClick={() => setScrubDate({ y: initY, m: initM, d: initD, h: initH, min: initMin })}
                                    style={{ flex: 1, padding: '10px', background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', borderRadius: '6px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', transition: 'background 0.2s' }}
                                >
                                    {uiD.birthTimeLabel || "Birth Time"}
                                </button>
                                <button 
                                    onClick={() => {
                                        const nd = new Date(Date.now() + (qUtc * 3600000));
                                        setScrubDate({ y: nd.getUTCFullYear(), m: nd.getUTCMonth()+1, d: nd.getUTCDate(), h: nd.getUTCHours(), min: nd.getUTCMinutes() });
                                    }}
                                    style={{ flex: 1, padding: '10px', background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', borderRadius: '6px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', transition: 'background 0.2s' }}
                                >
                                    {uiD.nowLabel || "Now"}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
