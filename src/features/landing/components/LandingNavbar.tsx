import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { publicAssetUrl, useCompanyBranding } from "@/services/api/branding.api";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Our Products", href: "#products" },
  { label: "Contact Us", href: "#contact" },
];

export function LandingNavbar() {
  const { data: branding } = useCompanyBranding();
  const companyName = branding?.companyName ?? "ERP System";
  const companyShortName = branding?.companyShortName ?? "ERP";
  const companyLogoUrl = publicAssetUrl(branding?.companyLogoUrl);
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    setLogoFailed(false);
  }, [companyLogoUrl]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-500", scrolled ? "border-b border-white/10 bg-[#070707]/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]" : "bg-transparent")}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <button onClick={() => scrollTo("#home")} className="flex items-center gap-3" aria-label={`${companyName} - Home`}>
          {companyLogoUrl && !logoFailed && <img
            src={companyLogoUrl}
            alt={`${companyName} logo`}
            className="h-10 w-auto object-contain"
            onError={() => setLogoFailed(true)}
          />}
          {(!companyLogoUrl || logoFailed) && <span className="font-display text-lg tracking-[0.18em] text-white">{companyShortName}</span>}
        </button>

        <div className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <button key={link.href} onClick={() => scrollTo(link.href)} className="text-sm font-medium tracking-wide text-[#CFCFCF] transition-colors hover:text-[#FFD76A]">
              {link.label}
            </button>
          ))}
          <button onClick={() => navigate("/login")} className="rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD76A] px-6 py-2 text-sm font-semibold tracking-wide text-[#070707] shadow-[0_0_20px_rgba(212,175,55,0.35)] transition-transform hover:scale-105">
            Sign In
          </button>
        </div>

        <button className="text-white md:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label={mobileOpen ? "Close menu" : "Open menu"}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden border-t border-white/10 bg-[#070707]/95 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link) => (
                <button key={link.href} onClick={() => scrollTo(link.href)} className="rounded-lg px-2 py-3 text-left text-base text-[#CFCFCF] hover:bg-white/5 hover:text-[#FFD76A]">
                  {link.label}
                </button>
              ))}
              <button onClick={() => navigate("/login")} className="mt-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD76A] px-6 py-3 text-sm font-semibold text-[#070707]">
                Sign In
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
