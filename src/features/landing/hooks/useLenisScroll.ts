import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Buttery-smooth inertial scrolling for the landing page only.
 *
 * Scoped to this page on purpose: Lenis is created on mount and destroyed on
 * unmount, so navigating into the authenticated ERP (which relies on normal
 * native scrolling inside its own scroll containers) is never affected.
 */
export function useLenisScroll() {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Lenis blocks anchor navigation by default. Enabling it here keeps the
      // landing navigation functional and offsets fixed-header overlap.
      anchors: true,
    });

    // Drive Lenis off GSAP's own ticker (already rAF-synced) so any future
    // GSAP-timed animations on this page stay perfectly in step with scroll.
    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, [prefersReducedMotion]);
}
