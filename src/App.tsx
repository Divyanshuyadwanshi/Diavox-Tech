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
import About from "./components/About";
import AuthModal from "./components/AuthModal";
import AdminDashboard from "./components/AdminDashboard";
import ClientDashboard from "./components/ClientDashboard";
import TeamDashboard from "./components/TeamDashboard";
import AIAssistantPopup from "./components/AIAssistantPopup";
import { 
  Phone, Mail, MessageCircle, Laptop, ArrowUp, 
  MapPin, CheckCircle, Globe, Shield, ShieldCheck, Heart,
  Facebook, Instagram, Linkedin, Twitter, Youtube, Github, HelpCircle
} from "lucide-react";

const getSocialIcon = (iconName: string) => {
  switch (iconName?.toLowerCase()) {
    case "facebook": return Facebook;
    case "instagram": return Instagram;
    case "linkedin": return Linkedin;
    case "x":
    case "twitter": return Twitter;
    case "youtube": return Youtube;
    case "github": return Github;
    default: return HelpCircle;
  }
};

export default function App() {
  const { theme, currentUser, syncSupabase, cmsContent, socialMediaLinks } = useStore();
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
        ) : [
          "services-page", 
          "pricing-page", 
          "portfolio-page", 
          "projects-page", 
          "team-page", 
          "reviews-page", 
          "contact-page", 
          "about-page", 
          "blog-page"
        ].includes(activeSection) ? (
          <div className="py-8" id="dedicated-page-view">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-left">
              <button
                onClick={() => handleNavigate("hero")}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center space-x-1.5 cursor-pointer ${
                  theme === "dark"
                    ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <span>← Back to Homepage</span>
              </button>
            </div>

            {activeSection === "services-page" && <Services preview={false} onNavigate={handleNavigate} onOpenAuth={() => setAuthModalOpen(true)} />}
            {activeSection === "portfolio-page" && <Portfolio preview={false} onNavigate={handleNavigate} />}
            {activeSection === "team-page" && <Team preview={false} onNavigate={handleNavigate} />}
            {activeSection === "reviews-page" && <Reviews preview={false} onOpenAuth={() => setAuthModalOpen(true)} onNavigate={handleNavigate} />}
            {activeSection === "pricing-page" && <Pricing preview={false} onOpenAuth={() => setAuthModalOpen(true)} onNavigate={handleNavigate} />}
            {activeSection === "contact-page" && <Contact onOpenAuth={() => setAuthModalOpen(true)} onNavigate={handleNavigate} />}
            {activeSection === "about-page" && <About onNavigate={handleNavigate} />}
            {activeSection === "blog-page" && <Blog />}
            
            {activeSection === "projects-page" && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-12">
                <div className="space-y-4">
                  <p className="text-xs font-mono uppercase tracking-widest text-cyan-500 font-bold">DIAVOX REMOTE PORTALS</p>
                  <h2 className="text-3xl sm:text-5xl font-display font-light">
                    Active <span className="font-semibold italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 font-normal">Work Projects</span> Pipeline
                  </h2>
                  <p className="text-sm opacity-70 font-light max-w-2xl">
                    Follow client development status, active sprints, and verified system operations live. All work is built with extreme compliance.
                  </p>
                </div>

                {/* Grid of Work Projects */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { id: "wp-1", title: "Apex Custom Marketplace", client: "Apex Inc", progress: 85, phase: "Beta Testing", tech: ["React", "Express", "Supabase", "Tailwind"], status: "In Sprints" },
                    { id: "wp-2", title: "Omni Automation Flow", client: "Sovereign Logistics", progress: 100, phase: "Production Host", tech: ["Node.js", "Gemini AI SDK", "Invoicing Modules"], status: "Live & Maintained" },
                    { id: "wp-3", title: "Genesis Lifestyle App", client: "Jordan Sparks", progress: 40, phase: "Core Architecture Setup", tech: ["Vite", "Zustand State", "Custom Assets"], status: "In Sprints" },
                    { id: "wp-4", title: "SEO Strategy & Pipeline Campaign", client: "Equinox Elite", progress: 70, phase: "Organic Indexing", tech: ["Semrush Engines", "Google Analytics", "Sitemaps"], status: "In Sprints" },
                  ].map((work) => (
                    <div
                      key={work.id}
                      className={`p-6 rounded-2xl border flex flex-col justify-between space-y-6 ${
                        theme === "dark" ? "bg-slate-950 border-slate-900" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-400 px-2.5 py-0.5 rounded-lg font-bold border border-cyan-500/10">
                            {work.status}
                          </span>
                          <span className="text-xs font-mono text-slate-500">{work.phase}</span>
                        </div>
                        <h3 className="text-xl font-display font-bold">{work.title}</h3>
                        <p className="text-xs opacity-60">Client: <strong className="font-bold">{work.client}</strong></p>
                      </div>

                      {/* Progress line */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span>Progress Tracker</span>
                          <span>{work.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-900 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full transition-all duration-500"
                            style={{ width: `${work.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Tech badges */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {work.tech.map((t, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 text-[9px] font-mono rounded bg-slate-900/10 dark:bg-slate-900 border dark:border-slate-800 text-slate-600 dark:text-slate-400">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div id="landing-sections-stack">
            {((cmsContent && cmsContent.homepageSections) || ["hero", "services", "portfolio", "team", "reviews", "pricing", "blog", "contact"]).map((sectionKey) => {
              const rootCms = cmsContent || { sectionVisibility: {} };
              const visible = rootCms.sectionVisibility ? rootCms.sectionVisibility[sectionKey] !== false : true;
              if (!visible) return null;

              switch (sectionKey) {
                case "hero":
                  return (
                    <div key="hero" id="home-section-hero">
                      <Hero 
                        onNavigate={handleNavigate} 
                        onOpenAuth={() => setAuthModalOpen(true)} 
                      />
                    </div>
                  );
                case "services":
                  return (
                    <div key="services" id="home-section-services">
                      <Services 
                        onNavigate={handleNavigate}
                        onOpenAuth={() => setAuthModalOpen(true)}
                      />
                    </div>
                  );
                case "portfolio":
                  return (
                    <div key="portfolio" id="home-section-portfolio">
                      <Portfolio 
                        preview={true} 
                        onNavigate={handleNavigate}
                      />
                    </div>
                  );
                case "team":
                  return (
                    <div key="team" id="home-section-team">
                      <Team 
                        preview={true} 
                        onNavigate={handleNavigate}
                      />
                    </div>
                  );
                case "pricing":
                  return (
                    <div key="pricing" id="home-section-pricing">
                      <Pricing 
                        preview={true}
                        onOpenAuth={() => setAuthModalOpen(true)}
                        onNavigate={handleNavigate}
                      />
                    </div>
                  );
                case "blog":
                  return (
                    <div key="blog" id="home-section-blog">
                      <Blog />
                    </div>
                  );
                case "reviews":
                  return (
                    <div key="reviews" id="home-section-reviews">
                      <Reviews 
                        preview={true}
                        onOpenAuth={() => setAuthModalOpen(true)} 
                        onNavigate={handleNavigate}
                      />
                    </div>
                  );
                case "contact":
                  return (
                    <div key="contact" id="home-section-contact">
                      <Contact 
                        onOpenAuth={() => setAuthModalOpen(true)} 
                        onNavigate={handleNavigate}
                      />
                    </div>
                  );
                default:
                  return null;
              }
            })}
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

            {/* Dynamic Social Icons */}
            <div className="flex items-center space-x-2.5 py-1" id="footer-social-panel">
              {socialMediaLinks.filter(link => link.visible).map((link) => {
                const IconComponent = getSocialIcon(link.icon);
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-800/60 bg-slate-500/5 hover:bg-gradient-to-tr hover:from-cyan-500 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-300"
                    title={link.platform}
                  >
                    <IconComponent size={13} />
                  </a>
                );
              })}
            </div>

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
          <div className="md:col-span-7 space-y-4" id="footer-links">
            <h4 className="text-slate-900 dark:text-white font-bold font-display uppercase tracking-wider text-[10px]">Jump Navigation</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button onClick={() => handleNavigate("about-page")} className="hover:text-cyan-400 transition-colors text-left font-sans cursor-pointer">About us</button>
              <button onClick={() => handleNavigate("services-page")} className="hover:text-cyan-400 transition-colors text-left font-sans cursor-pointer">Our Services</button>
              <button onClick={() => handleNavigate("portfolio-page")} className="hover:text-cyan-400 transition-colors text-left font-sans cursor-pointer">Our Work</button>
              <button onClick={() => handleNavigate("pricing-page")} className="hover:text-cyan-400 transition-colors text-left font-sans cursor-pointer">Pricing</button>
              <button onClick={() => handleNavigate("projects-page")} className="hover:text-cyan-400 transition-colors text-left font-sans cursor-pointer">Active Pipelines</button>
              <button onClick={() => handleNavigate("blog-page")} className="hover:text-cyan-400 transition-colors text-left font-sans cursor-pointer">Blogs Portal</button>
              <button onClick={() => handleNavigate("reviews-page")} className="hover:text-cyan-400 transition-colors text-left font-sans cursor-pointer">Reviews</button>
              <button onClick={() => handleNavigate("contact-page")} className="hover:text-cyan-400 transition-colors text-left font-sans cursor-pointer">Get in touch</button>
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
              const redirectAction = localStorage.getItem("redirect_after_login");
              if (redirectAction === "chat") {
                localStorage.setItem("preselected_tab", "chat");
                localStorage.removeItem("redirect_after_login");
              }
              if (["primary_admin", "secondary_admin", "secret_admin", "third_admin"].includes(user.role)) {
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
          className="fixed bottom-6 right-20 p-3 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 text-white z-40 shadow-xl shadow-cyan-500/10 transition-transform scale-100 hover:scale-110 cursor-pointer"
          title="Scroll to top"
        >
          <ArrowUp size={16} />
        </button>
      )}

      {/* Global AI Assistant Floating Popup */}
      <AIAssistantPopup />

    </div>
  );
}
