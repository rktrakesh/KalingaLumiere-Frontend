import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { LandingProduct } from '../data/products';

interface ProductModalProps {
  product: LandingProduct | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <AnimatePresence onExitComplete={() => setImageError(false)}>
      {product && (
        <motion.div
          key="product-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            key="product-modal-panel"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative grid w-full max-w-2xl grid-cols-1 overflow-hidden rounded-2xl border border-[#D4AF37]/25 bg-[#0d0d0d] shadow-[0_0_60px_rgba(212,175,55,0.15)] sm:grid-cols-2"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-black/50 p-2 text-white/80 transition-colors hover:text-[#FFD76A]"
            >
              <X size={16} />
            </button>

            <div className="flex items-center justify-center bg-black/40 p-8 sm:p-10">
              {!imageError ? (
                <img
                  src={product.image}
                  alt={product.name}
                  onError={() => setImageError(true)}
                  className="max-h-64 w-full object-contain"
                />
              ) : (
                <span className="font-display text-2xl tracking-widest text-[#D4AF37]/60">{product.name}</span>
              )}
            </div>

            <div className="flex flex-col justify-center p-8 sm:p-10">
              <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#D4AF37]">
                {product.collection} Collection
              </span>
              <h3 className="mt-2 font-display text-3xl text-white">{product.name}</h3>
              <p className="mt-2 text-sm italic text-[#FFD76A]/90">{product.tagline}</p>
              <p className="mt-5 text-sm leading-relaxed text-[#CFCFCF]">{product.description}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
