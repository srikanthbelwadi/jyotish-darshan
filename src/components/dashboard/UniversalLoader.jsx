import React from 'react';

export const UniversalLoader = () => (
  <div className="mobile-loader-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
    <svg className="mobile-loader-svg" width="100%" height="100%" viewBox="0 0 450 150" style={{ overflow: 'visible', filter: 'drop-shadow(0 0 15px rgba(212,175,55,0.4))', maxWidth: '450px', maxHeight: '140px' }}>
       <style>
         {`
           @keyframes writeScript {
             0% { stroke-dashoffset: 200; opacity: 0; }
             10% { opacity: 1; }
             30% { stroke-dashoffset: 0; opacity: 1; }
             40% { stroke-dashoffset: 0; opacity: 1; }
             45% { opacity: 0; }
             100% { stroke-dashoffset: 0; opacity: 0; }
           }
           @keyframes flipNadiLeaf {
             0% { transform: translateY(0) scaleY(1); opacity: 1; }
             40% { transform: translateY(0) scaleY(1); opacity: 1; }
             45% { transform: translateY(-30px) scaleY(0.1); opacity: 0.5; }
             46% { opacity: 0; }
             100% { transform: translateY(0) scaleY(1); opacity: 0; }
           }
           .leaf-flip-1 { animation: flipNadiLeaf 5s infinite cubic-bezier(0.25, 1, 0.5, 1); transform-origin: center top; }
           .leaf-flip-2 { animation: flipNadiLeaf 5s infinite cubic-bezier(0.25, 1, 0.5, 1); animation-delay: 2.5s; transform-origin: center top; opacity: 0; }
           
           .leaf-write-1 { animation: writeScript 5s infinite cubic-bezier(0.4, 0, 0.2, 1); stroke-dasharray: 200; stroke-dashoffset: 200; }
           .leaf-write-2 { animation: writeScript 5s infinite cubic-bezier(0.4, 0, 0.2, 1); animation-delay: 2.5s; stroke-dasharray: 200; stroke-dashoffset: 200; }
           
           .chart-spin { animation: spin 10s linear infinite; transform-origin: 0 0; }
           .chart-spin-rev { animation: spin 15s linear reverse infinite; transform-origin: 0 0; }
         `}
       </style>
       <g>
         <g transform="translate(100, 75)">
           <g className="chart-spin-rev" opacity="0.3">
             <circle cx="0" cy="0" r="60" fill="none" stroke="var(--accent-gold)" strokeWidth="2" strokeDasharray="4 8" />
             <polygon points="0,-45 40,24 -40,24" fill="none" stroke="var(--accent-gold)" strokeWidth="2" />
             <polygon points="0,45 -40,-24 40,-24" fill="none" stroke="var(--accent-gold)" strokeWidth="2" />
           </g>
           <g className="chart-spin" opacity="0.6">
             <circle cx="0" cy="0" r="50" fill="none" stroke="var(--border-light)" strokeWidth="3" strokeDasharray="10 15" />
             <circle cx="0" cy="-50" r="4.5" fill="#ff4444" filter="drop-shadow(0 0 5px #ff4444)" />
             <circle cx="43" cy="25" r="3.5" fill="#44ccff" />
             <circle cx="-43" cy="25" r="5.5" fill="#fff" filter="drop-shadow(0 0 3px #fff)" />
           </g>
         </g>
         <g transform="translate(310, 75)">
            <path d="M-110,-15 Q0,-35 110,-15 Q120,0 110,15 Q0,35 -110,15 Q-120,0 -110,-15 Z" fill="#3a2f20" stroke="#6a5438" strokeWidth="4" opacity="0.5" transform="translate(0, 14) scale(1.08)" />
            <path d="M-110,-15 Q0,-35 110,-15 Q120,0 110,15 Q0,35 -110,15 Q-120,0 -110,-15 Z" fill="#4b3e2a" stroke="#8c704a" strokeWidth="4" opacity="0.8" transform="translate(0, 7) scale(1.04)" />
            
            <g className="leaf-flip-1">
              <path d="M-110,-15 Q0,-35 110,-15 Q120,0 110,15 Q0,35 -110,15 Q-120,0 -110,-15 Z" fill="#5f4d34" stroke="#d5ac68" strokeWidth="3" />
              <line x1="-100" y1="-6" x2="100" y2="-6" stroke="#3a2f20" strokeWidth="3" opacity="0.4" />
              <line x1="-105" y1="6" x2="105" y2="6" stroke="#3a2f20" strokeWidth="3" opacity="0.4" />
              <path d="M-80,-10 Q-60,-18 -40,-4 T-10,-10 T20,-4 T40,-10 T60,-4 T80,-10" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" className="leaf-write-1" filter="drop-shadow(0 0 4px #fff)"/>
              <path d="M-70,8 Q-50,2 -30,12 T0,8 T20,12 T40,8 T60,12" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" className="leaf-write-1" filter="drop-shadow(0 0 4px #fff)" />
            </g>

            <g className="leaf-flip-2">
              <path d="M-110,-15 Q0,-35 110,-15 Q120,0 110,15 Q0,35 -110,15 Q-120,0 -110,-15 Z" fill="#5f4d34" stroke="#d5ac68" strokeWidth="3" />
              <line x1="-100" y1="-6" x2="100" y2="-6" stroke="#3a2f20" strokeWidth="3" opacity="0.4" />
              <line x1="-105" y1="6" x2="105" y2="6" stroke="#3a2f20" strokeWidth="3" opacity="0.4" />
              <path d="M-75,-8 Q-55,-16 -35,-2 T-5,-8 T15,-2 T45,-8 T65,-2 T85,-8" fill="none" stroke="var(--accent-gold)" strokeWidth="4" strokeLinecap="round" className="leaf-write-2" filter="drop-shadow(0 0 4px var(--accent-gold))"/>
              <path d="M-65,10 Q-45,4 -25,14 T5,10 T25,14 T55,10 T75,14" fill="none" stroke="var(--accent-gold)" strokeWidth="4" strokeLinecap="round" className="leaf-write-2" filter="drop-shadow(0 0 4px var(--accent-gold))"/>
            </g>
         </g>
       </g>
    </svg>
  </div>
);
