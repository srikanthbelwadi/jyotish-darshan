import React from 'react';

export default function ConfirmModal({ isOpen, title, message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onClose, type = "danger" }) {
  if (!isOpen) return null;

  const confirmColor = type === 'danger' ? 'var(--bg-badge-red)' : 'var(--accent-gold)';
  const confirmTextColor = type === 'danger' ? 'var(--text-badge-red)' : '#000';
  const confirmBorder = type === 'danger' ? '1px solid var(--text-badge-red)' : 'none';

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="lux-card" style={{ width: '100%', maxWidth: 360, animation: 'slideIn 0.2s ease', border: '1px solid var(--border-light)' }}>
        <h3 style={{ margin: '0 0 12px', color: 'var(--text-main)', fontSize: 18, fontWeight: 600 }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize:  16, margin: '0 0 24px', lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', padding: '8px 16px', borderRadius: 6 }}>
            {cancelText}
          </button>
          <button type="button" onClick={() => { onConfirm(); onClose(); }} style={{ background: confirmColor, border: confirmBorder, color: confirmTextColor, fontSize: 14, cursor: 'pointer', padding: '8px 20px', borderRadius: 6, fontWeight: 600 }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
