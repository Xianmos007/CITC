import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

// Accessible-dialog behavior for a component that is mounted only while
// the dialog is open:
//   - moves focus into the dialog on open
//   - keeps Tab / Shift+Tab inside it
//   - returns focus to whatever opened it when it closes
// Attach the returned ref to the element with role="dialog".
// Pass `active = false` while the dialog isn't rendered yet (e.g. still
// loading); the behavior starts once it becomes true.
export function useDialog(active = true) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!active || !node) return undefined;
    const trigger = document.activeElement;

    const focusables = () =>
      [...node.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);

    // Focus the dialog itself (it has tabIndex=-1) so screen readers start
    // at the title, and the first Tab lands on the first control.
    node.focus({ preventScroll: true });

    const onKey = (e) => {
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        node.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === node || !node.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !node.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      if (trigger && typeof trigger.focus === 'function' && document.contains(trigger)) {
        trigger.focus({ preventScroll: true });
      }
    };
  }, [active]);

  return ref;
}
