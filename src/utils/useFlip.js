import { useLayoutEffect, useRef } from 'react';

// Animasi FLIP: baris klasemen meluncur ke posisi baru saat peringkat berubah,
// jadi penonton bisa melihat siapa menyalip siapa.
export function useFlip(order) {
  const nodes = useRef(new Map());
  const last = useRef(new Map());

  useLayoutEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    nodes.current.forEach((el, key) => {
      if (!el) return;
      const now = el.offsetTop;
      const before = last.current.get(key);
      if (before !== undefined && before !== now && !reduce) {
        const dy = before - now;
        el.animate(
          [{ transform: `translateY(${dy}px)` }, { transform: 'translateY(0)' }],
          { duration: 420, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
        );
      }
      last.current.set(key, now);
    });
  }, [order]);

  return (key) => (el) => {
    if (el) nodes.current.set(key, el);
    else nodes.current.delete(key);
  };
}
