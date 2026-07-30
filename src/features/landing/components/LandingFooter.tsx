import { Instagram, Facebook, Twitter } from "lucide-react";

const QUICK_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Our Products", href: "#products" },
  { label: "Contact Us", href: "#contact" },
];

const SOCIALS = [
  { icon: Instagram, label: "Instagram" },
  { icon: Facebook, label: "Facebook" },
  { icon: Twitter, label: "Twitter" },
];

export function LandingFooter() {
  const scrollTo = (href: string) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer className="relative border-t border-white/10 bg-[#050505] px-6 py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <img
            src="/assets/logo/kalinga-lumiere.png"
            alt="Kalinga Lumière"
            className="h-8 w-auto object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
          <span className="hidden font-display text-base tracking-[0.18em] text-white">KALINGA LUMI&Egrave;RE</span>
          <p className="max-w-xs text-center text-sm text-[#CFCFCF] sm:text-left">Fragrance crafted with tradition, manufactured with precision.</p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:items-start">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#D4AF37]">Quick Links</p>
          {QUICK_LINKS.map((link) => (
            <button key={link.href} onClick={() => scrollTo(link.href)} className="text-sm text-[#CFCFCF] transition-colors hover:text-[#FFD76A]">
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3 sm:items-end">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#D4AF37]">Follow Us</p>
          <div className="flex gap-3">
            {SOCIALS.map((social) => (
              <a key={social.label} href="#" aria-label={social.label} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[#CFCFCF] transition-colors hover:border-[#D4AF37]/40 hover:text-[#FFD76A]">
                <social.icon size={15} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-white/5 pt-6 text-center text-xs text-[#CFCFCF]/70">&copy; {new Date().getFullYear()} Kalinga Lumi&egrave;re. All rights reserved.</div>
    </footer>
  );
}
