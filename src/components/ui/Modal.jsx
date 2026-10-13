import React, { useEffect, useRef } from 'react';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

// Dialog putih di atas latar malam. Tutup dengan Escape, klik latar, atau tombol tutup.
export default function Modal({ open, onClose, label, size = 'md', children, sheetOnMobile = true }) {
  const box = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose?.(); }
      if (e.key === 'Tab' && box.current) {
        const nodes = [...box.current.querySelectorAll(FOCUSABLE)];
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    const t = setTimeout(() => box.current?.querySelector(FOCUSABLE)?.focus(), 30);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const width = { sm: 'sm:max-w-sm', md: 'sm:max-w-md', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' }[size];

  return (
    <div
      className={`fade-in fixed inset-0 z-[60] flex justify-center bg-[#05060F]/75 ${sheetOnMobile ? 'items-end sm:items-center sm:p-4' : 'items-center p-4'}`}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`on-light ${sheetOnMobile ? 'sheet-up sm:pop-in rounded-t-[28px] sm:rounded-[28px]' : 'pop-in rounded-[28px]'} max-h-[92dvh] w-full ${width} overflow-y-auto bg-white text-ink shadow-[0_30px_80px_rgba(0,0,0,0.5)]`}
      >
        {children}
      </div>
    </div>
  );
}

export function CloseButton({ onClick, label = 'Tutup' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper text-ink transition-colors hover:bg-[#E6E3F7]"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </button>
  );
}
