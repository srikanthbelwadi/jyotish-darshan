import React, { useState, useEffect } from 'react';
import './ExpandableBottomSheet.css';

/**
 * ExpandableBottomSheet
 * A pure-CSS driven bottom sheet supporting 3 states: 'HIDDEN', 'PEEK', 'FULL'
 * Falls back to a floating side-panel on desktop devices.
 */
const ExpandableBottomSheet = ({ 
  isOpen, 
  onClose, 
  children, 
  peekTitle, 
  forceState = null // Optional override to force 'FULL' or 'PEEK' externally
}) => {
  const [sheetState, setSheetState] = useState('HIDDEN');

  useEffect(() => {
    if (isOpen) {
      setSheetState(forceState || 'FULL');
    } else {
      setSheetState('HIDDEN');
    }
  }, [isOpen, forceState]);

  const handleHeaderClick = () => {
    if (sheetState === 'FULL') setSheetState('PEEK');
    else if (sheetState === 'PEEK') setSheetState('FULL');
  };

  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  // If HIDDEN, don't render content to save DOM weight? 
  // No, we want CSS transitions. We just move it out of viewport.
  
  return (
    <div className={`jd-bottom-sheet sheet-state-${sheetState.toLowerCase()}`}>
      <div className="sheet-header" onClick={handleHeaderClick}>
        <div className="drag-handle"></div>
        <div className="peek-content">
          <strong className="peek-title">{peekTitle || "Results"}</strong>
          <div className="sheet-controls">
            {sheetState === 'PEEK' && <span className="control-icon" title="Expand">⌃</span>}
            {sheetState === 'FULL' && (
              <>
                <span className="control-icon collapse-icon" onClick={(e) => { e.stopPropagation(); handleHeaderClick(); }} title="Minimize">⌄</span>
                <span className="control-icon close-icon" onClick={handleClose} title="Close">✕</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="sheet-scroll-area">
        {children}
      </div>
    </div>
  );
};

export default ExpandableBottomSheet;
