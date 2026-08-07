import { useState } from 'react';
import { motion } from 'framer-motion';
import { regularCollection, premiumCollection, type LandingProduct } from '../data/products';
import { ProductCard } from './ProductCard';
import { ProductModal } from './ProductModal';

export function ProductShowcase() {
  const [selected, setSelected] = useState<LandingProduct | null>(null);

  return (
    <section id="products" className="relative scroll-mt-20 bg-[#070707] px-6 py-28 sm:py-36">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-medium uppercase tracking-[0.35em] text-[#D4AF37]">Our Products</span>
          <h2 className="mt-4 font-display text-3xl text-white sm:text-4xl md:text-5xl">
            Fragrances Crafted for Every Ritual
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#CFCFCF]">
            From everyday rituals to rare, considered indulgences — each blend is rolled and cured
            under the same watchful discipline as everything Kalinga Lumi&egrave;re makes.
          </p>
        </motion.div>

        <div className="mt-16">
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-[#CFCFCF]">Regular Collection</p>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {regularCollection.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} onSelect={setSelected} />
            ))}
          </div>
        </div>

        <div className="mt-20">
          <div className="mb-6 flex items-center gap-4">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#FFD76A]">Premium Collection</p>
            <span className="h-px flex-1 bg-gradient-to-r from-[#D4AF37]/40 to-transparent" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {premiumCollection.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} onSelect={setSelected} />
            ))}
          </div>
        </div>
      </div>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
