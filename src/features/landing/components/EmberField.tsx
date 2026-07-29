import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface Ember {
  x: number;
  y: number;
  radius: number;
  speed: number;
  drift: number;
  driftPhase: number;
  opacity: number;
  hue: 'gold' | 'light';
}

/**
 * The landing page's signature motif: slow, glowing embers rising like curls
 * of incense smoke. Pure canvas 2D — no WebGL/3D dependency — so it stays
 * cheap on low-end mobile devices while still feeling alive.
 */
export function EmberField({ density = 46 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const count = prefersReducedMotion ? Math.round(density / 3) : density;
    const embers: Ember[] = Array.from({ length: count }, () => spawnEmber(width, height, true));

    function spawnEmber(w: number, h: number, randomY = false): Ember {
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : h + 20,
        radius: 1 + Math.random() * 2.2,
        speed: 0.15 + Math.random() * 0.35,
        drift: 8 + Math.random() * 18,
        driftPhase: Math.random() * Math.PI * 2,
        opacity: 0.25 + Math.random() * 0.55,
        hue: Math.random() > 0.65 ? 'light' : 'gold',
      };
    }

    let raf: number;
    let t = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      t += 0.01;

      for (const e of embers) {
        const x = e.x + Math.sin(t + e.driftPhase) * e.drift * 0.05;
        const gradient = ctx.createRadialGradient(x, e.y, 0, x, e.y, e.radius * 6);
        const color = e.hue === 'gold' ? '212, 175, 55' : '255, 215, 106';
        gradient.addColorStop(0, `rgba(${color}, ${e.opacity})`);
        gradient.addColorStop(1, `rgba(${color}, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, e.y, e.radius * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${color}, ${Math.min(1, e.opacity + 0.2)})`;
        ctx.beginPath();
        ctx.arc(x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fill();

        if (!prefersReducedMotion) {
          e.y -= e.speed;
          if (e.y < -20) Object.assign(e, spawnEmber(width, height));
        }
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [density, prefersReducedMotion]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
