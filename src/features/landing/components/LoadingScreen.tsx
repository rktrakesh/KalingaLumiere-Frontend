import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <motion.div key="landing-loader" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: "easeInOut" }} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#070707]">
      <div className="relative flex flex-col items-center gap-5">
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: "easeOut" }} className="relative">
          <img
            src="/assets/logo/kalinga-lumiere.png"
            alt="Kalinga Lumière"
            className="h-12 w-auto object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
          <span className="hidden font-display text-2xl tracking-[0.2em] text-white">KALINGA LUMI&Egrave;RE</span>
          <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-[#FFD76A]/70 to-transparent" initial={{ x: "-120%" }} animate={{ x: "120%" }} transition={{ duration: 1.1, ease: "easeInOut", delay: 0.15 }} />
        </motion.div>
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }} className="h-px w-32 origin-left bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
      </div>
    </motion.div>
  );
}
