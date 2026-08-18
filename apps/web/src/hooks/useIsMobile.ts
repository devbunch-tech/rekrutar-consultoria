import { useEffect, useState } from 'react';
import { layout } from '@rekrutar/tokens';

/**
 * O design não usa media queries de CSS — a bottom nav e o toast reagem a esta
 * flag, como o `isMobile` do protótipo.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < layout.mobileBreakpoint,
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < layout.mobileBreakpoint);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isMobile;
}
