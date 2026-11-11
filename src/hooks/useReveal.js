import { useEffect } from 'react';

// Fade elements with class "reveal" in as they scroll into view, once.
// Also watches for ones that appear later (e.g. after content loads).
export function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reveal = (el) => el.classList.add('in');
    if (!('IntersectionObserver' in window)) {
      root.querySelectorAll('.reveal').forEach(reveal);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          reveal(e.target);
          io.unobserve(e.target);
        }
      }),
      { rootMargin: '0px 0px -8% 0px' }
    );
    const watch = () => root.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el));
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [rootRef]);
}
