import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/utils/cn';
import type { LandingProduct } from '../data/products';

interface ProductCardProps {
  product: LandingProduct;
  onSelect: (product: LandingProduct) => void;
  index: number;
}

export function ProductCard({ product, onSelect, index }: ProductCardProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [imageError, setImageError] = useState(false);
  const isPremium = product.collection === 'Premium';

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), { stiffness: 200, damping: 18 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), { stiffness: 200, damping: 18 });
  const glowX = useTransform(mouseX, [0, 1], ['10%', '90%']);
  const glowY = useTransform(mouseY, [0, 1], ['10%', '90%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const resetTilt = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.button
      ref={ref}
      onClick={() => onSelect(product)}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border p-5 text-left backdrop-blur-xl transition-shadow duration-300',
        isPremium
          ? 'border-[#D4AF37]/40 bg-gradient-to-b from-[#1a1508]/80 to-white/[0.03] shadow-[0_0_35px_rgba(212,175,55,0.12)]'
          : 'border-white/10 bg-white/[0.03] hover:border-[#D4AF37]/30',
      )}
    >
      {/* mouse-follow golden glow */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/25 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
        style={{ left: glowX, top: glowY }}
      />

      {isPremium && (
        <span className="absolute right-4 top-4 z-10 rounded-full border border-[#D4AF37]/50 bg-[#070707]/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FFD76A]">
          Premium
        </span>
      )}

      <div className="relative mb-5 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-black/30">
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1508] to-[#070707] text-[#D4AF37]/60">
            <span className="font-display text-sm tracking-widest">{product.name}</span>
          </div>
        )}
        {/* reflection sheen */}
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      </div>

      <div className="relative z-10">
        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#D4AF37]">{product.collection} Collection</p>
        <h3 className="mt-1.5 font-display text-xl text-white">{product.name}</h3>
        <p className="mt-1 text-sm text-[#CFCFCF]">{product.tagline}</p>
      </div>
    </motion.button>
  );
}
