import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { LoadingScreen } from "./components/LoadingScreen";
import { LandingNavbar } from "./components/LandingNavbar";
import { HeroSection } from "./components/HeroSection";
import { AboutSection } from "./components/AboutSection";
import { ProductShowcase } from "./components/ProductShowcase";
import { WhyUsSection } from "./components/WhyUsSection";
import { ContactSection } from "./components/ContactSection";
import { LandingFooter } from "./components/LandingFooter";
import { useLenisScroll } from "./hooks/useLenisScroll";

const LOADER_SESSION_KEY = "kalinga-landing-loaded";

export default function LandingPage() {
  useLenisScroll();
  const [showLoader, setShowLoader] = useState(() => !sessionStorage.getItem(LOADER_SESSION_KEY));

  useEffect(() => {
    if (!showLoader) return;
    const timer = setTimeout(() => {
      setShowLoader(false);
      sessionStorage.setItem(LOADER_SESSION_KEY, "true");
    }, 1400);
    return () => clearTimeout(timer);
  }, [showLoader]);

  return (
    <div className="bg-[#070707]">
      <AnimatePresence>{showLoader && <LoadingScreen />}</AnimatePresence>

      <LandingNavbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ProductShowcase />
        <WhyUsSection />
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  );
}
