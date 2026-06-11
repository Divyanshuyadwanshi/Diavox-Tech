/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useStore } from "./store";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Portfolio from "./components/Portfolio";
import Team from "./components/Team";
import Pricing from "./components/Pricing";
import Blog from "./components/Blog";
import Reviews from "./components/Reviews";
import Contact from "./components/Contact";
import AuthModal from "./components/AuthModal";
import AdminDashboard from "./components/AdminDashboard";
import ClientDashboard from "./components/ClientDashboard";
import TeamDashboard from "./components/TeamDashboard";
import { 
  Phone, Mail, MessageCircle, Laptop, ArrowUp, 
  MapPin, CheckCircle, Globe, Shield, ShieldCheck, Heart 
} from "lucide-react";

export default function App() {
  const { theme, currentUser, syncSupabase } = useStore();
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  useEffect(() => {
    // Sync review data from Supabase if tables exist
    syncSupabase();
    
    // Theme setup initial
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [theme]);

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    
    // Scroll to section block if on general Home view
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleScrollTopAction = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isShowingDashboard = ["admin-dash", "client-dash", "team-dash"].includes(activeSection);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      theme === "dark" ? "bg-slate-950 text-white" : "bg-white text-slate-900"
    }`}>
      
      {/* Premium Header navigation */}
      <Header 
        onOpenAuth={() => setAuthModalOpen(true)} 
        onNavigate={handleNavigate}
        activeSection={activeSection}
      />

      {/* Main Body */}
      <main className="flex-1" id="main-content-wrapper">
        {isShowingDashboard ? (
          <div className="relative pt-6">
            
            {/* Quick action return to main feed */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 flex justify-start">
              <button
                onClick={() => handleNavigate("hero")}
                id="btn-return-home"
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-colors flex items-center space-x-1.5 ${
                  theme === "dark"
                    ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <span>← Return to Home Portals</span>
              </button>
            </div>

            {/* Render matched dashboard and pass active state */}
            {activeSection === "admin-dash" && <AdminDashboard />}
            {activeSection === "client-dash" && <ClientDashboard />}
            {activeSection === "team-dash" && <TeamDashboard />}

          </div>
        ) : (
          <div id="landing-sections-stack">
            {/* 1. Hero Landing */}
            <Hero 
              onNavigate={handleNavigate} 
              onOpenAuth={() => setAuthModalOpen(true)} 
            />

            {/* 2. Services List */}
            <Services 
              onNavigate={handleNavigate}
              onOpenAuth={() => setAuthModalOpen(true)}
            />

            {/* 3. Portfolio Case Studies */}
            <Portfolio />

            {/* Team Members List Section */}
            <Team />

            {/* 4. Pricing / Packages比较 */}
            <Pricing 
              onOpenAuth={() => setAuthModalOpen(true)}
              onNavigate={handleNavigate}
            />

            {/* 5. Blogs insights */}
            <Blog />

            {/* 6. Client reviews feeds */}
            <Reviews onOpenAuth={() => setAuthModalOpen(true)} />

            {/* 7. Contact quote form */}
            <Contact 
              onOpenAuth={() => setAuthModalOpen(true)} 
              onNavigate={handleNavigate}
            />
          </div>
        )}
      </main>

      {/* Global Brand Footer */}
      <footer className={`py-16 border-t font-mono text-xs transition-colors duration-300 ${
        theme === "dark" 
          ? "bg-slate-950 border-slate-900 text-slate-400" 
          : "bg-slate-50 border-slate-200 text-slate-600"
      }`} id="app-global-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-12 text-left">
          
          {/* Logo brand */}
          <div className="md:col-span-5 space-y-4" id="footer-brandbox">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                D
              </div>
              <span className="font-display font-black text-slate-900 dark:text-white tracking-tight">
                Diavox <span className="text-cyan-500">Tech</span>
              </span>
            </div>
            
            <p className="text-xs leading-relaxed max-w-sm font-sans font-light">
              "Building Digital Experiences, Automating Businesses, Driving Growth." Crafting sub-second applications, custom automated CRM logic, and technical SEO algorithms.
            </p>

            <div className="space-y-1.5 pt-2 font-mono text-[10px]" id="footer-notations">
              <p className="flex items-center space-x-2 text-cyan-550 dark:text-cyan-400 font-semibold">
                <Globe size={12} />
                <span>Serving clients worldwide remotely.</span>
              </p>
              <p className="flex items-center space-x-2">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>Customer support available with responses within 24 hours.</span>
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-4 space-y-4" id="footer-links">
            <h4 className="text-slate-900 dark:text-white font-bold font-display uppercase tracking-wider text-[10px]">Jump Navigation</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button onClick={() => handleNavigate("services")} className="hover:text-cyan-405 transition-colors text-left font-sans">Our Services</button>
              <button onClick={() => handleNavigate("portfolio")} className="hover:text-cyan-405 transition-colors text-left font-sans">Our Work</button>
              <button onClick={() => handleNavigate("pricing")} className="hover:text-cyan-410 transition-colors text-left font-sans">Pricing</button>
              <button onClick={() => handleNavigate("blog")} className="hover:text-cyan-410 transition-colors text-left font-sans">Blogs Portal</button>
              <button onClick={() => handleNavigate("reviews")} className="hover:text-cyan-415 transition-colors text-left font-sans">Reviews</button>
              <button onClick={() => handleNavigate("contact")} className="hover:text-cyan-415 transition-colors text-left font-sans">Get in touch</button>
            </div>
          </div>

          {/* Preset Admin Logins Shortcuts */}
          <div className="md:col-span-3 space-y-4" id="footer-presets">
            <h4 className="text-slate-900 dark:text-white font-bold font-display uppercase tracking-wider text-[10px]">Auditor Cockpits</h4>
            <div className="space-y-2">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="w-full p-2.5 rounded-lg border dark:border-slate-900 bg-slate-900/10 hover:bg-slate-900 text-left text-[10px] text-cyan-400 font-semibold flex items-center justify-between"
              >
                <span>Trigger Preset logins</span>
                <span>🔑</span>
              </button>
              <p className="text-[9px] opacity-45">Access testing spaces for Divyanshu (Admin), alex (Dev) or clients.</p>
            </div>
          </div>

        </div>

        {/* Legal copyrights */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t dark:border-slate-900 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] opacity-50 gap-4">
          <p>© 2026 Diavox Tech Inc. Serving global remote divisions. All rights reserved.</p>
          <p className="flex items-center space-x-1 font-sans">
            <span>Made with precision by Diavox Desk</span>
            <Heart size={10} className="text-rose-500 fill-rose-500" />
          </p>
        </div>
      </footer>

      {/* Login / Setup Auth modal pops on CTA trigger */}
      {authModalOpen && (
        <AuthModal 
          onClose={() => setAuthModalOpen(false)} 
          onLoginSuccess={() => {
            // Check newly authenticated user's role and auto-route them to their respective workspace dashboard!
            const user = useStore.getState().currentUser;
            if (user) {
              if (["primary_admin", "secondary_admin"].includes(user.role)) {
                setActiveSection("admin-dash");
              } else if (user.role === "team_member") {
                setActiveSection("team-dash");
              } else {
                setActiveSection("client-dash");
              }
            }
          }}
        />
      )}

      {/* Floating Scroll Top button */}
      {showScrollTop && (
        <button
          onClick={handleScrollTopAction}
          id="scroll-top-btn"
          className="fixed bottom-6 right-6 p-3 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 text-white z-40 shadow-xl shadow-cyan-500/10 transition-transform scale-100 hover:scale-110 cursor-pointer"
          title="Scroll to top"
        >
          <ArrowUp size={16} />
        </button>
      )}

    </div>
  );
}
