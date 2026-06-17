/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useStore } from "../store";
import { ArrowRight, Globe, ShieldCheck, ChevronRight, MessageCircle, Cuboid as Cube } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Interactive3DScene from "./Interactive3DScene";

interface HeroProps {
  onNavigate: (section: string) => void;
  onOpenAuth: () => void;
}

const TypewriterText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayedText}</span>;
};

export default function Hero({ onNavigate, onOpenAuth }: HeroProps) {
  const { theme, currentUser, cmsContent } = useStore();
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slides = (cmsContent?.heroSlides || []).filter(s => s.status);
  const sliderConfig = cmsContent?.heroSliderConfig || { autoplay: true, duration: 4000, globalEffect: "fade" as const };

  const contact = cmsContent?.contactSettings || {
    whatsapp: "911234567890",
  };

  // Autoplay logic
  useEffect(() => {
    if (!sliderConfig.autoplay || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % slides.length);
    }, sliderConfig.duration);
    return () => clearInterval(interval);
  }, [sliderConfig.autoplay, sliderConfig.duration, slides.length]);

  const currentSlide = slides[currentSlideIndex] || {
    id: "default",
    title: cmsContent?.heroTitle || "Aesthetic Modern Digital Systems",
    subtitle: cmsContent?.heroSubtitle || "Empowering brands through precision engineering and design.",
    buttonText: cmsContent?.heroCtaPrimaryText || "Initialize Request",
    buttonLink: "#services",
    status: true,
    effect: undefined,
    backgroundImage: undefined
  };

  const handleCtaClick = () => {
    if (!currentUser) {
      onOpenAuth();
    } else if (currentSlide.buttonLink.startsWith("#")) {
      const section = currentSlide.buttonLink.replace("#", "");
      onNavigate(section === "services" ? "services" : "contact-page");
    } else {
      window.open(currentSlide.buttonLink, "_blank");
    }
  };

  // Transition variants
  const getVariants = (effect: string) => {
    switch (effect) {
      case "slide-left":
        return {
          initial: { opacity: 0, x: 100 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -100 }
        };
      case "slide-right":
        return {
          initial: { opacity: 0, x: -100 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 100 }
        };
      case "zoom-in":
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.2 }
        };
      case "blur-fade":
        return {
          initial: { opacity: 0, filter: "blur(15px)" },
          animate: { opacity: 1, filter: "blur(0px)" },
          exit: { opacity: 0, filter: "blur(15px)" }
        };
      case "typewriter":
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
      default: // fade
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  };

  const activeEffect = currentSlide.effect || sliderConfig.globalEffect;
  const variants = getVariants(activeEffect);

  return (
    <section id="hero" className={`relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 ${
      theme === "dark" 
        ? "bg-slate-950 text-white" 
        : "bg-slate-50 text-slate-900"
    }`}>
      {/* Dynamic Background Image Layer */}
      <AnimatePresence mode="wait">
        {currentSlide.backgroundImage && (
          <motion.div
            key={`bg-${currentSlideIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            <img 
              src={currentSlide.backgroundImage} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Absolute Radial ambient backgrounds */}
      {theme === "dark" && (
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
      )}
      {theme === "dark" && (
        <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-purple-500/10 blur-[160px] rounded-full pointer-events-none" />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center" id="hero-layout-grid">
          
          {/* Hero text panel */}
          <div className="lg:col-span-7 space-y-6 text-left min-h-[400px] flex flex-col justify-center" id="hero-text-panel">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlideIndex}
                initial={variants.initial}
                animate={variants.animate}
                exit={variants.exit}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                {/* World remote delivery badge */}
                {cmsContent?.heroBadgeEffect !== "hide" && (
                  <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-mono border transition-all duration-300 bg-cyan-500/10 dark:bg-cyan-950/40 text-cyan-500 border-cyan-400/30">
                    {cmsContent?.heroBadgeEffect === "ping" ? (
                      <span className="relative flex h-2 w-2 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                      </span>
                    ) : (
                      <Globe 
                        size={13} 
                        className={
                          cmsContent?.heroBadgeEffect === "spin" || !cmsContent?.heroBadgeEffect
                            ? "animate-spin-slow" 
                            : cmsContent?.heroBadgeEffect === "pulse" 
                            ? "animate-pulse text-cyan-400" 
                            : ""
                        } 
                      />
                    )}
                    <span>{cmsContent?.heroBadge || "Serving clients worldwide remotely"}</span>
                  </div>
                )}

                <h1 className="text-4xl sm:text-5xl md:text-7.5xl font-display font-light tracking-tight leading-tight text-slate-900 dark:text-slate-100" id="hero-core-title">
                  {activeEffect === "typewriter" ? (
                    <TypewriterText text={currentSlide.title} />
                  ) : (
                    <>
                      {currentSlide.title.split(" ").slice(0, -1).join(" ")}{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-amber-200 to-purple-400 font-normal italic">
                        {currentSlide.title.split(" ").pop()}
                      </span>
                    </>
                  )}
                </h1>

                <p className="text-base sm:text-lg opacity-80 max-w-2xl font-light leading-relaxed">
                  {currentSlide.subtitle}
                </p>

                {/* Direct primary workflows */}
                <div className="flex flex-wrap items-center gap-3 pt-4" id="hero-cta-group">
                  <button
                    onClick={handleCtaClick}
                    className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:brightness-110 text-white font-semibold rounded-xl text-sm transition-all shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-98"
                  >
                    <span>{currentSlide.buttonText}</span>
                    <ArrowRight size={16} />
                  </button>

                  <button
                    onClick={() => onNavigate("portfolio-page")}
                    className={`flex items-center space-x-1 px-6 py-4 font-medium rounded-xl text-sm transition-colors border glassmorphic ${
                      theme === "dark"
                        ? "bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-slate-200"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span>{cmsContent?.heroCtaSecondaryText || "Explore Work"}</span>
                    <ChevronRight size={15} />
                  </button>

                  {slides.length > 1 && (
                    <div className="flex items-center space-x-2 ml-4">
                      {slides.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlideIndex(idx)}
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            currentSlideIndex === idx ? "w-8 bg-cyan-500 shadow-sm shadow-cyan-500/40" : "w-1.5 bg-slate-300 dark:bg-slate-800"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Premium Tech Demo Visual Mockup Box */}
          <div className="lg:col-span-5 relative" id="hero-mockup-panel">
            <div className={`p-1.5 rounded-2xl border transition-all duration-300 ${
              theme === "dark" 
                ? "bg-slate-900/55 border-slate-800 shadow-2xl shadow-black/80" 
                : "bg-white border-slate-200/80 shadow-xl shadow-slate-200/50"
            }`}>
              
              {/* Fake Chrome window bar & Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-b dark:border-slate-800 bg-slate-100/55 dark:bg-slate-950/40 rounded-t-xl gap-2">
                <div className="flex items-center space-x-1.5 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-[10px] uppercase tracking-widest font-mono opacity-40 ml-2">
                    diavox-sandbox-interactive
                  </span>
                </div>
              </div>

              <div className="relative overflow-hidden min-h-[360px]" id="hero-chrome-content">
                <div className="absolute inset-0 w-full h-full">
                  <Interactive3DScene />
                </div>
              </div>
            </div>

            {/* Extra popovers for visual texture */}
            <div className="absolute -bottom-5 -right-3 rounded-2xl p-3 bg-gradient-to-tr from-cyan-950/90 to-slate-900/95 border border-cyan-500/20 backdrop-blur-md shadow-xl max-w-[170px] text-left hidden sm:block">
              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">Remote Office</p>
              <h5 className="text-sm text-white font-bold font-display mt-0.5">United worldwide</h5>
              <p className="text-[10px] text-slate-400 font-mono mt-1">24 Hour response SLA guaranteed.</p>
            </div>
          </div>

        </div>

        {/* Dynamic Static Statistics Section */}
        <div className="mt-20 pt-10 border-t dark:border-slate-900 border-slate-200" id="hero-stats">
          <p className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-8 max-w-sm mx-auto lg:mx-0">
            Diavox by the Numbers
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="space-y-1">
              <h3 className="text-3xl md:text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-500">
                99.8%
              </h3>
              <p className="text-xs font-mono opacity-70">Uptime SLA Shipped</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl md:text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-400">
                120+
              </h3>
              <p className="text-xs font-mono opacity-70">Remote Projects Done</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl md:text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                10x
              </h3>
              <p className="text-xs font-mono opacity-70">Automation ROI Average</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl md:text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-amber-500">
                24hr
              </h3>
              <p className="text-xs font-mono opacity-70">Support SLA Lock</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
