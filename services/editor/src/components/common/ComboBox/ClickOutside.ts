import { useEffect, useRef } from 'react';

const events = ['mousedown', 'touchstart'] as const;

const clickedScrollbar = (evt: MouseEvent) =>
  document.documentElement.clientWidth <= evt.clientX ||
  document.documentElement.clientHeight <= evt.clientY;

export const useClickOutside = (onClickOutside: () => void) => {
  const ref = useRef<HTMLDivElement>(null);
  const fnRef = useRef(onClickOutside);
  fnRef.current = onClickOutside;

  useEffect(() => {
    const handle = (e: MouseEvent | TouchEvent) => {
      if (clickedScrollbar(e as MouseEvent)) {
        return;
      }

      if (!ref.current?.contains(e.target as Node)) {
        fnRef.current();
      }
    };

    events.forEach((eventName) => document.addEventListener(eventName, handle, true));

    return () => {
      events.forEach((eventName) => document.removeEventListener(eventName, handle, true));
    };
  }, []);

  return ref;
};
