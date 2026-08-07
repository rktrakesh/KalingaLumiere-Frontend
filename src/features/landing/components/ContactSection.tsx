import { motion } from 'framer-motion';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { useCompanyBranding } from '@/services/api/branding.api';

export function ContactSection() {
  const { data: branding } = useCompanyBranding();
  const details = [
    { icon: MapPin, label: 'Address', value: branding?.companyAddress || 'Plot 14, Industrial Estate, Bhubaneswar, Odisha, India', href: undefined },
    { icon: Phone, label: 'Phone', value: branding?.companyPhone || '+91 98765 43210', href: `tel:${(branding?.companyPhone || '+91 98765 43210').replace(/[^+\d]/g, '')}` },
    { icon: Mail, label: 'Email', value: branding?.companyEmail || 'hello@kalingalumiere.com', href: `mailto:${branding?.companyEmail || 'hello@kalingalumiere.com'}` },
    { icon: Clock, label: 'Working Hours', value: 'Mon \u2013 Sat, 9:00 AM \u2013 6:00 PM IST', href: undefined },
  ];

  return (
    <section id="contact" className="relative scroll-mt-20 bg-[#070707] px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-xs font-medium uppercase tracking-[0.35em] text-[#D4AF37]">Contact Us</span>
          <h2 className="mt-4 font-display text-3xl text-white sm:text-4xl md:text-5xl">We&rsquo;d Love to Hear From You</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mx-auto mt-14 grid gap-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-left backdrop-blur-xl sm:grid-cols-2 sm:p-10"
        >
          {details.map((detail) => (
            <div key={detail.label} className="flex items-start gap-4">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10">
                <detail.icon size={17} className="text-[#FFD76A]" />
              </span>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#D4AF37]">{detail.label}</p>
                {detail.href ? (
                  <a
                    href={detail.href}
                    target={detail.label === 'Website' ? '_blank' : undefined}
                    rel={detail.label === 'Website' ? 'noreferrer' : undefined}
                    className="mt-1 block break-words text-sm leading-relaxed text-[#CFCFCF] transition-colors hover:text-[#FFD76A]"
                  >
                    {detail.value}
                  </a>
                ) : <p className="mt-1 text-sm leading-relaxed text-[#CFCFCF]">{detail.value}</p>}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
