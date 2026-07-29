import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import SplitType from 'split-type';
import { EmberField } from './EmberField';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export function HeroSection() {
  const navigate = useNavigate();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!headingRef.current) return;

    if (prefersReducedMotion) {
      gsap.set(headingRef.current, { opacity: 1 });
      return;
    }

    const split = new SplitType(headingRef.current, { types: 'chars' });
    const tl = gsap.timeline({ delay: 0.3 });
    tl.set(headingRef.current, { opacity: 1 });
    tl.from(split.chars, {
      yPercent: 120,
      opacity: 0,
      rotateZ: 6,
      stagger: 0.025,
      duration: 0.9,
      ease: 'power4.out',
    });

    return () => split.revert();
  }, [prefersReducedMotion]);

  return (
    <section id="home" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070707] px-6">
      {/* ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/10 blur-[140px]" />
      <EmberField density={50} />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 text-xs font-medium uppercase tracking-[0.35em] text-[#D4AF37]"
        >
          Kalinga Lumi&egrave;re &middot; Est. Manufacturing Excellence
        </motion.span>

        <h1
          ref={headingRef}
          className="font-display text-[2.75rem] leading-[1.05] text-white opacity-0 sm:text-6xl md:text-7xl"
        >
          Kalinga Lumi&egrave;re ERP
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1 }}
          className="mt-6 text-sm font-medium uppercase tracking-[0.3em] text-[#FFD76A]/90 sm:text-base"
        >
          Enterprise Manufacturing Management System
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.3 }}
          className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-[#CFCFCF] sm:text-lg"
        >
          A single, considered system behind every batch we craft — coordinating production, our
          people, payroll, and inventory with the same precision we bring to every stick of incense
          we make.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.5 }}
          onClick={() => navigate('/login')}
          className="mt-10 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD76A] px-10 py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-[#070707] shadow-[0_0_30px_rgba(212,175,55,0.35)] transition-transform hover:scale-105"
        >
          Sign In
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { delay: 2, duration: 0.6 }, y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#D4AF37]/70"
      >
        <ChevronDown size={22} />
      </motion.div>
    </section>
  );
}
