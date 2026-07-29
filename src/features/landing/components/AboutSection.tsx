import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="about" className="relative bg-[#070707] px-6 py-28 sm:py-36">
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span className="text-xs font-medium uppercase tracking-[0.35em] text-[#D4AF37]">Our Story</span>
          <h2 className="mt-4 font-display text-3xl leading-tight text-white sm:text-4xl md:text-5xl">
            Crafting Fragrance with Tradition &amp; Innovation
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#CFCFCF] sm:text-lg">
            Kalinga Lumi&egrave;re began as a small workshop dedicated to a single idea: that fragrance
            deserves the same discipline as fine craft. Every stick we roll still carries that
            intention — but behind the scenes, the way we manufacture, manage our people, and move
            materials has grown into a modern, considered operation.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#CFCFCF] sm:text-lg">
            Today, that discipline lives inside our own enterprise platform — built to keep our
            production floor, our workforce, and our finances in the same quiet rhythm as the
            fragrances we create.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
          className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#D4AF37]/10 via-transparent to-transparent" />
          <div className="relative flex flex-col items-center gap-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10">
              <Flame size={26} className="text-[#FFD76A]" />
            </span>
            <p className="font-display text-xl italic leading-snug text-white sm:text-2xl">
              &ldquo;Precision behind the scenes, so every fragrance in front of them
              stays exactly as intended.&rdquo;
            </p>
            <span className="h-px w-16 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
            <span className="text-xs uppercase tracking-[0.3em] text-[#CFCFCF]">Kalinga Lumi&egrave;re</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
