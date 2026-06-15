/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useStore } from "../store";
import { ArrowRight, Globe, ShieldCheck, Mail, Zap, CheckCircle2, ChevronRight, MessageCircle, Activity, Cuboid as Cube } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Interactive3DScene from "./Interactive3DScene";

interface HeroProps {
  onNavigate: (section: string) => void;
  onOpenAuth: () => void;
}

export default function Hero({ onNavigate, onOpenAuth }: HeroProps) {
  const { theme, currentUser, cmsContent } = useStore();
  const contact = cmsContent?.contactSettings || {
    whatsapp: "911234567890",
    email: "hello@diavox.com",
    phone: "+1 (800) 555-3210",
    supportEmail: "support@diavox.com",
    businessHours: "Mon - Fri: 9:00 AM - 6:00 PM (GMT-5)"
  };
  const [activeTab, setActiveTab] = useState<"telemetry" | "interactive3d">("interactive3d");

  const handleCtaClick = () => {
    if (!currentUser) {
      onOpenAuth();
    } else {
      onNavigate("contact-page");
    }
  };

  return (
    <section id="hero" className={`relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 ${
      theme === "dark" 
        ? "bg-slate-950 text-white" 
        : "bg-slate-50 text-slate-900"
    }`}>
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
          <div className="lg:col-span-7 space-y-6 text-left" id="hero-text-panel">
            
            {/* World remote delivery badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-mono border transition-all duration-300 bg-cyan-500/10 dark:bg-cyan-950/40 text-cyan-500 border-cyan-400/30">
              <Globe size={13} className="animate-spin-slow" />
              <span>{cmsContent?.heroBadge || "Serving clients worldwide remotely"}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7.5xl font-display font-light tracking-tight leading-tight text-slate-900 dark:text-slate-100" id="hero-core-title">
              {cmsContent?.heroTitle ? (
                <span className="text-slate-900 dark:text-slate-100 transition-colors duration-300">
                  {cmsContent.heroTitle}
                </span>
              ) : (
                <>
                  Crafting Divine <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-amber-200 to-purple-400 font-normal italic">
                    Aesthetic Digital
                  </span>
                  <br className="hidden sm:inline" /> High-Utility Systems
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg opacity-80 max-w-2xl font-light leading-relaxed">
              {cmsContent?.heroSubtitle || "Diavox Tech helps modern brands establish a strong online presence and automate operational bottlenecks. We craft high-speed websites, bespoke SEO campaigns, AI automations, and downloadable digital assets that turn traffic into long-term growth."}
            </p>

            {/* Crucial response metrics banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg pt-2" id="hero-trust-indicators">
              <div className="flex items-start space-x-2.5">
                <div className="p-1 px-1 rounded-md bg-emerald-500/10 text-emerald-500 mt-1">
                  <CheckCircle2 size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-mono tracking-wide uppercase opacity-90">Customer Support</h4>
                  <p className="text-xs opacity-75">Guaranteed responses within 24 hours.</p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className="p-1 rounded-md bg-cyan-500/10 text-cyan-500 mt-1">
                  <ShieldCheck size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-mono tracking-wide uppercase opacity-90">Absolute Security</h4>
                  <p className="text-xs opacity-75">Row-Level Database Guard Security.</p>
                </div>
              </div>
            </div>

            {/* Direct primary workflows */}
            <div className="flex flex-wrap items-center gap-3 pt-4" id="hero-cta-group">
              <button
                onClick={handleCtaClick}
                className="flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:brightness-110 text-white font-semibold rounded-xl text-sm transition-all shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-98"
              >
                <span>Request Custom Quote</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => onNavigate("portfolio-page")}
                className={`flex items-center space-x-1 px-5 py-3.5 font-medium rounded-xl text-sm transition-colors border ${
                  theme === "dark"
                    ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <span>Explore Work</span>
                <ChevronRight size={15} />
              </button>

              <a
                href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}?text=Hello%20Diavox%20Tech%2C%20I%20would%20like%20to%20inquire%20about%20your%20services.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 px-4 py-3.5 text-xs text-emerald-500 hover:text-emerald-400 transition-colors font-mono"
              >
                <MessageCircle size={15} />
                <span>Instant WhatsApp</span>
              </a>
            </div>
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
                  <span className="text-[10px] uppercase tracking-widest font-mono opacity-40 ml-2 hidden sm:inline">
                    diavox-sandbox
                  </span>
                </div>
                
                {/* Premium Interactive tab triggers */}
                <div className="flex items-center space-x-1 bg-slate-200/50 dark:bg-slate-900 p-0.5 rounded-lg border dark:border-slate-800/80 border-slate-300/40 select-none">
                  <button
                    onClick={() => setActiveTab("interactive3d")}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[9px] font-mono font-bold transition-all ${
                      activeTab === "interactive3d"
                        ? "bg-cyan-500 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-250 dark:hover:text-white"
                    }`}
                  >
                    <Cube size={10} />
                    <span>3D ORBIT MAP</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("telemetry")}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[9px] font-mono font-bold transition-all ${
                      activeTab === "telemetry"
                        ? "bg-cyan-500 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-250 dark:hover:text-white"
                    }`}
                  >
                    <Activity size={10} />
                    <span>SYS TELEMETRY</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Panel Display with smooth transitions */}
              <div className="relative overflow-hidden min-h-[360px]" id="hero-chrome-content">
                <AnimatePresence mode="wait">
                  {activeTab === "interactive3d" ? (
                    <motion.div
                      key="interactive3d"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.25 }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <Interactive3DScene />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="telemetry"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 sm:p-5 text-left font-mono text-xs space-y-4 max-h-[360px] overflow-y-auto"
                    >
                      <div className="space-y-1">
                        <p className="text-cyan-400"># System Audit Performance Metrics:</p>
                        <p className="text-slate-450 dark:text-slate-400">Initializing Diavox core audit tracker v3.0...</p>
                      </div>

                      <div className="p-3.5 rounded-xl dark:bg-slate-950/60 bg-slate-55 border dark:border-slate-800/60 border-slate-100 space-y-2.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400 uppercase">Load Latency</span>
                          <span className="text-emerald-400 font-bold font-mono">0.45s (Sub-second)</span>
                        </div>
                        <div className="w-full bg-slate-300 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-400 h-full rounded-full" style={{ width: "95%" }} />
                        </div>

                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400 uppercase">Search Authority</span>
                          <span className="text-cyan-400 font-bold font-mono">98/100 (Technical SEO)</span>
                        </div>
                        <div className="w-full bg-slate-300 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-cyan-400 h-full rounded-full" style={{ width: "98%" }} />
                        </div>

                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400 uppercase">Automation Efficiency</span>
                          <span className="text-purple-400 font-bold font-mono">+840 Hrs/Yr Shaved</span>
                        </div>
                        <div className="w-full bg-slate-300 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full rounded-full" style={{ width: "88%" }} />
                        </div>
                      </div>

                      {/* Simulated log outputs */}
                      <div className="space-y-1.5 text-[10px] sm:text-[11px]">
                        <p className="text-green-400 flex items-center space-x-1.5">
                          <span>✔</span> <span>Database indexing verified with Supabase pgSQL.</span>
                        </p>
                        <p className="text-green-400 flex items-center space-x-1.5">
                          <span>✔</span> <span>HMR disabled. Static caching deployment compiled.</span>
                        </p>
                        <p className="text-purple-400 flex items-center space-x-1.5">
                          <span>⚙</span> <span>Workspace remote dispatch active worldwide.</span>
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
