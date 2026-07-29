import { motion } from 'framer-motion';
import { Factory, Leaf, Cpu, ShieldCheck } from 'lucide-react';

const REASONS = [
  {
    icon: Factory,
    title: 'Premium Manufacturing',
    description: 'Every batch rolled, cured, and inspected under a single, disciplined production standard.',
  },
  {
    icon: Leaf,
    title: 'Finest Ingredients',
    description: 'Sourced sandalwood, florals, and resins chosen for fragrance quality, never for cost alone.',
  },
  {
    icon: Cpu,
    title: 'Modern Manufacturing Technology',
    description: 'Our own enterprise platform keeps production, workforce, and inventory in constant sync.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted Quality',
    description: 'Consistent fragrance and burn quality, batch after batch, backed by rigorous internal checks.',
  },
];

export function WhyUsSection() {
  return (
    <section className="relative bg-[#0a0a0a] px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-medium uppercase tracking-[0.35em] text-[#D4AF37]">Why Kalinga Lumi&egrave;re</span>
          <h2 className="mt-4 font-display text-3xl text-white sm:text-4xl md:text-5xl">Built on Craft, Run on Precision</h2>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl transition-colors hover:border-[#D4AF37]/30"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 transition-colors group-hover:bg-[#D4AF37]/20">
                <reason.icon size={20} className="text-[#FFD76A]" />
              </span>
              <h3 className="mt-5 font-display text-lg text-white">{reason.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#CFCFCF]">{reason.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
