/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useStore } from "./store";
import { supabase } from "./supabase";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Portfolio from "./components/Portfolio";
import Team from "./components/Team";
import SEO from "./components/SEO";
import GoogleAnalytics from "./components/GoogleAnalytics";
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
import GlobalCommandCenter from "./components/GlobalCommandCenter";
import logoUrl from "./assets/images/diavox_tech_logo_1781679695870.jpg";
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

const LandingSkeleton = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24 animate-pulse text-left">
      {/* Hero Skeleton */}
      <div className="space-y-8 max-w-4xl pt-8">
        <div className="h-4 bg-slate-850 dark:bg-slate-200/10 rounded w-1/4" />
        <div className="h-16 bg-slate-850 dark:bg-slate-200/10 rounded w-11/12" />
        <div className="h-16 bg-slate-850 dark:bg-slate-200/10 rounded w-3/4" />
        <div className="h-24 bg-slate-850 dark:bg-slate-200/10 rounded w-full" />
        <div className="flex space-x-4 pt-4">
          <div className="h-12 bg-slate-850 dark:bg-slate-200/10 rounded-xl w-40" />
          <div className="h-12 bg-slate-850 dark:bg-slate-200/10 rounded-xl w-40" />
        </div>
      </div>

      {/* Services Grid Skeleton */}
      <div className="space-y-12 pt-12 border-t border-slate-800/20 dark:border-slate-800/60">
        <div className="space-y-4">
          <div className="h-4 bg-slate-850 dark:bg-slate-200/10 rounded w-1/6" />
          <div className="h-10 bg-slate-850 dark:bg-slate-200/10 rounded w-1/3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-8 rounded-2xl border border-slate-800/10 dark:border-slate-800/40 space-y-6">
              <div className="w-12 h-12 rounded-xl bg-slate-850 dark:bg-slate-200/10" />
              <div className="h-8 bg-slate-850 dark:bg-slate-200/10 rounded w-2/3" />
              <div className="h-20 bg-slate-850 dark:bg-slate-200/10 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
const pathToSection: Record<string, string> = {
  "/": "hero",
  "/services": "services-page",
  "/pricing": "pricing-page",
  "/portfolio": "portfolio-page",
  "/projects": "projects-page",
  "/team": "team-page",
  "/reviews": "reviews-page",
  "/contact": "contact-page",
  "/about": "about-page",
  "/blog": "blog-page",
};

const sectionToPath: Record<string, string> = {
  hero: "/",
  "services-page": "/services",
  "pricing-page": "/pricing",
  "portfolio-page": "/portfolio",
  "projects-page": "/projects",
  "team-page": "/team",
  "reviews-page": "/reviews",
  "contact-page": "/contact",
  "about-page": "/about",
  "blog-page": "/blog",
};

const pageSeo: Record<string, { title: string; description: string; path: string }> = {
  hero: {
    title: "Diavox Tech | Web Development, AI Automation & SEO Services",
    description:
      "Diavox Tech builds fast websites, custom web apps, AI automation systems, business templates, UI/UX designs, and SEO-ready digital solutions.",
    path: "/",
  },
  "services-page": {
    title: "Services | Web Development, AI Automation, UI/UX & SEO | Diavox Tech",
    description:
      "Explore Diavox Tech services including web development, AI automation, business templates, UI/UX design, and search engine optimization.",
    path: "/services",
  },
  "pricing-page": {
    title: "Pricing | Diavox Tech",
    description:
      "View Diavox Tech pricing for websites, business software, automation systems, UI/UX design, and SEO services.",
    path: "/pricing",
  },
  "portfolio-page": {
    title: "Portfolio | Diavox Tech",
    description:
      "Explore Diavox Tech projects, websites, dashboards, automation tools, and custom software work.",
    path: "/portfolio",
  },
  "blog-page": {
    title: "Blog | Web Development, AI Automation & SEO Insights | Diavox Tech",
    description:
      "Read Diavox Tech articles about web development, AI automation, SEO, UI/UX design, business growth, and digital systems.",
    path: "/blog",
  },
  "reviews-page": {
    title: "Client Reviews | Diavox Tech",
    description:
      "Read client reviews for Diavox Tech web development, automation, design, and SEO services.",
    path: "/reviews",
  },
  "contact-page": {
    title: "Contact Diavox Tech | Start Your Project",
    description:
      "Contact Diavox Tech to discuss websites, web apps, AI automation, business templates, UI/UX design, and SEO services.",
    path: "/contact",
  },
  "about-page": {
    title: "About Diavox Tech | Digital Systems & Automation Company",
    description:
      "Learn about Diavox Tech, a digital systems company building websites, AI automation, dashboards, and business software.",
    path: "/about",
  },
  "team-page": {
    title: "Team | Diavox Tech",
    description:
      "Meet the Diavox Tech team behind web development, AI automation, UI/UX design, SEO, and custom digital systems.",
    path: "/team",
  },
};
export default function App() {
  const { theme, currentUser, syncSupabase, cmsContent, socialMediaLinks, isCmsLoaded, isCmsFresh, blogs } = useStore();
  const [activeSection, setActiveSection] = useState<string>(() => {
  if (window.location.pathname.startsWith("/blog/")) {
    return "blog-page";
  }

  return pathToSection[window.location.pathname] || "hero";
});
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [commandCenterOpen, setCommandCenterOpen] = useState<boolean>(false);

  useEffect(() => {
    // Sync review data from Supabase if tables exist
    syncSupabase();

    // Hotkey listener for advanced command center
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandCenterOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
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

  // Real-time Supabase Auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Supabase Auth State changed event:", event, "User ID:", session?.user?.id);
      
      if (session?.user) {
        try {
          const { data: dbProf } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();

          if (dbProf) {
            const synchronizedUser = {
              id: dbProf.id,
              email: dbProf.email,
              name: dbProf.name,
              role: dbProf.role,
              department: dbProf.department,
              avatar_url: dbProf.avatar_url,
              username: dbProf.username,
              permissions: dbProf.skills || dbProf.permissions || []
            };
            useStore.setState({ currentUser: synchronizedUser });
          } else {
            // Default profile fallback from auth metadata to prevent blocking
            const nameFromMeta = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0].toUpperCase() || "Operative";
            const roleFromMeta = session.user.user_metadata?.role || "client";
            const fallbackUser = {
              id: session.user.id,
              email: session.user.email || "",
              name: nameFromMeta,
              role: roleFromMeta,
              avatar_url: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session.user.id)}`,
              permissions: ["create_requests", "view_own_projects"]
            };
            useStore.setState({ currentUser: fallbackUser });
          }
        } catch (err) {
          console.error("Error updating profile in subscription callback:", err);
        }
      } else {
        // Explicit logout state sync: preserve bypassed auth states
        const isBypassed = localStorage.getItem("supabase_login_bypassed") === "true";
        if (!isBypassed) {
          useStore.setState({ currentUser: null });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Dynamically load Google Webfonts and override CSS layout custom properties
  useEffect(() => {
    const sans = cmsContent?.fontSans || "Inter";
    const display = cmsContent?.fontDisplay || "Space Grotesk";
    const mono = cmsContent?.fontMono || "JetBrains Mono";

    // Format query families safe for HTTP requests
    const uniqueFamilies = Array.from(new Set([sans, display, mono]));
    const formattedUrl = uniqueFamilies.map(f => f.replace(/\s+/g, "+")).join("&family=");

    // Link loader element
    let fontLink = document.getElementById("g-fonts-dynamic") as HTMLLinkElement;
    if (!fontLink) {
      fontLink = document.createElement("link");
      fontLink.id = "g-fonts-dynamic";
      fontLink.rel = "stylesheet";
      document.head.appendChild(fontLink);
    }
    fontLink.href = `https://fonts.googleapis.com/css2?family=${formattedUrl}:wght@300;400;500;600;700;800;905;900&display=swap`;

    // Dynamic style rules override element
    let customStyleEl = document.getElementById("g-styles-dynamic") as HTMLStyleElement;
    if (!customStyleEl) {
      customStyleEl = document.createElement("style");
      customStyleEl.id = "g-styles-dynamic";
      document.head.appendChild(customStyleEl);
    }
    customStyleEl.innerHTML = `
      :root {
        --font-sans: "${sans}", ui-sans-serif, system-ui, -apple-system, sans-serif !important;
        --font-mono: "${mono}", ui-monospace, monospace !important;
      }
      .font-display {
        font-family: "${display}", "${sans}", ui-sans-serif, system-ui, sans-serif !important;
      }
      body {
        font-family: var(--font-sans);
      }
    `;
  }, [cmsContent?.fontSans, cmsContent?.fontDisplay, cmsContent?.fontMono]);

  const handleNavigate = (sectionId: string) => {
  setActiveSection(sectionId);

  const path = sectionToPath[sectionId];

  if (path && window.location.pathname !== path) {
    window.history.pushState({}, "", path);
  }

  const element = document.getElementById(sectionId);

  if (element && sectionId === "hero") {
    element.scrollIntoView({ behavior: "smooth" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};
useEffect(() => {
  const handlePopState = () => {
    if (window.location.pathname.startsWith("/blog/")) {
  setActiveSection("blog-page");
} else {
  setActiveSection(pathToSection[window.location.pathname] || "hero");
}
  };

  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, []);

  const handleScrollTopAction = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isShowingDashboard = ["admin-dash", "client-dash", "team-dash"].includes(activeSection);

  const renderCustomSectionsByPosition = (pos: "Header" | "Footer") => {
    if (isShowingDashboard) return null;
    return (cmsContent?.customSections || [])
      .filter(cs => cs.position === pos && cs.visible !== false)
      .map(customSec => (
        <section
          key={customSec.id}
          id={`home-section-${customSec.id}`}
          style={{
            backgroundColor: customSec.backgroundColor || undefined,
            color: customSec.textColor || undefined
          }}
          className="py-16 md:py-24 text-left transition-colors duration-300 border-b border-white/5"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                {customSec.subtitle || "Custom Block Extension"}
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight">
                {customSec.title}
              </h2>
            </div>
            
            {customSec.description && (
              <p className="text-sm sm:text-base opacity-85 max-w-4xl font-sans font-light leading-relaxed">
                {customSec.description}
              </p>
            )}
            
            {customSec.content && (
              <div className="text-xs sm:text-sm opacity-80 max-w-4xl font-sans font-light leading-relaxed whitespace-pre-wrap border-t border-slate-700/30 pt-4">
                {customSec.content}
              </div>
            )}
          </div>
        </section>
      ));
  };
  const blogSlug = window.location.pathname.startsWith("/blog/")
    ? window.location.pathname.replace("/blog/", "").replace(/\/$/, "")
    : "";

  const activeBlogSeo = blogSlug
    ? blogs.find((blog: any) => blog.slug === blogSlug)
    : null;

  const seo: { title: string; description: string; path: string; image?: string } = activeBlogSeo
    ? {
        title: `${activeBlogSeo.title} | Diavox Tech`,
        description: (activeBlogSeo.content || "")
          .replace(/\s+/g, " ")
          .slice(0, 155),
        path: `/blog/${activeBlogSeo.slug}`,
        image: activeBlogSeo.image_url || "https://www.diavoxtech.in/og-image.png",
      }
    : pageSeo[activeSection] || pageSeo.hero;

  if (!isCmsLoaded) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-sans ${
        theme === "dark" ? "bg-slate-950 text-white" : "bg-white text-slate-900"
      }`}>
        <div className="space-y-4 text-center">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border border-cyan-500/10 animate-ping" />
            <div className="absolute inset-0 rounded-full border-2 border-t-cyan-500 border-r-cyan-500 border-b-cyan-550/10 border-l-cyan-550/10 animate-spin" />
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-slate-500 animate-pulse">
            Establishing Secured Portals...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title={seo.title} description={seo.description} path={seo.path} image={seo.image} />
      <GoogleAnalytics />

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
        ) : !isCmsFresh ? (
          <LandingSkeleton />
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
          <>
            {renderCustomSectionsByPosition("Header")}
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
                default: {
                  if (sectionKey.startsWith("custom-")) {
                    const customSec = (cmsContent?.customSections || []).find(cs => cs.id === sectionKey);
                    if (customSec && customSec.visible !== false) {
                      return (
                        <section
                          key={customSec.id}
                          id={`home-section-${customSec.id}`}
                          style={{
                            backgroundColor: customSec.backgroundColor || undefined,
                            color: customSec.textColor || undefined
                          }}
                          className="py-16 md:py-24 text-left transition-colors duration-300 border-b border-white/5"
                        >
                          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                            <div className="space-y-2">
                              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                                {customSec.subtitle || "Custom Block Extension"}
                              </span>
                              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight">
                                {customSec.title}
                              </h2>
                            </div>
                            
                            {customSec.description && (
                              <p className="text-sm sm:text-base opacity-85 max-w-4xl font-sans font-light leading-relaxed">
                                {customSec.description}
                              </p>
                            )}
                            
                            {customSec.content && (
                              <div className="text-xs sm:text-sm opacity-80 max-w-4xl font-sans font-light leading-relaxed whitespace-pre-wrap border-t border-slate-700/30 pt-4">
                                {customSec.content}
                              </div>
                            )}
                          </div>
                        </section>
                      );
                    }
                  }
                  return null;
                }
              }
            })}
          </div>
          {renderCustomSectionsByPosition("Footer")}
          </>
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
              <img 
                src={logoUrl} 
                alt="Diavox Tech" 
                className="w-10 h-10 rounded-full object-cover border border-slate-200/20 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <span className="font-display font-black text-slate-900 dark:text-white tracking-tight">
                {cmsContent?.footerLogoText || "Diavox"} <span className="text-cyan-500">{cmsContent?.footerLogoAccent || "Tech"}</span>
              </span>
            </div>
            
            <p className="text-xs leading-relaxed max-w-sm font-sans font-light">
              {cmsContent?.footerBrandDesc || '"Building Digital Experiences, Automating Businesses, Driving Growth." Crafting sub-second applications, custom automated CRM logic, and technical SEO algorithms.'}
            </p>

            {/* Dynamic Social Icons */}
            <div className="flex items-center space-x-2.5 py-1" id="footer-social-panel">
              {socialMediaLinks.filter(link => link.visible).map((link) => {
                const IconComponent = getSocialIcon(link.icon);
                let url = link.url;
                if (cmsContent && cmsContent.contactSettings) {
                  const platformKey = link.icon.toLowerCase();
                  if (platformKey === "facebook" && cmsContent.contactSettings.facebook) url = cmsContent.contactSettings.facebook;
                  else if (platformKey === "instagram" && cmsContent.contactSettings.instagram) url = cmsContent.contactSettings.instagram;
                  else if (platformKey === "linkedin" && cmsContent.contactSettings.linkedin) url = cmsContent.contactSettings.linkedin;
                  else if (platformKey === "x" && cmsContent.contactSettings.twitter) url = cmsContent.contactSettings.twitter;
                  else if (platformKey === "youtube" && cmsContent.contactSettings.youtube) url = cmsContent.contactSettings.youtube;
                  else if (platformKey === "github" && cmsContent.contactSettings.github) url = cmsContent.contactSettings.github;
                }
                return (
                  <a
                    key={link.id}
                    href={url}
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
                <span>{cmsContent?.footerNotation1 || "Serving clients worldwide remotely."}</span>
              </p>
              <p className="flex items-center space-x-2">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>{cmsContent?.footerNotation2 || "Customer support available with responses within 24 hours."}</span>
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
          <p>{cmsContent?.footerCopyright || "© 2026 Diavox Tech Inc. Serving global remote divisions. All rights reserved."}</p>
          <p className="flex items-center space-x-1 font-sans">
            <span>{cmsContent?.footerCredit || "Made with precision by Diavox Desk"}</span>
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

      {/* Floating WhatsApp Quick Contact Button */}
      <a
        href={`https://wa.me/${cmsContent?.contactSettings?.whatsapp?.replace(/[^0-9]/g, "") || "911234567890"}?text=${encodeURIComponent("Hello Diavox, I'd like to discuss a development project.")}`}
        target="_blank"
        rel="noopener noreferrer"
        id="floating-whatsapp-btn"
        className="fixed bottom-6 left-6 z-50 p-3.5 rounded-full bg-[#25d366] hover:bg-[#20ba5a] text-white shadow-xl shadow-emerald-500/20 transition-all duration-300 scale-100 hover:scale-110 flex items-center justify-center cursor-pointer group"
        title="Chat on WhatsApp"
      >
        <span className="absolute left-14 bg-slate-900/90 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-slate-800">
          Chat on WhatsApp
        </span>
        <span className="absolute inset-0 rounded-full bg-[#25d366] opacity-30 animate-pulse pointer-events-none" />
        <MessageCircle size={20} className="relative z-10 fill-white text-[#25d366]" style={{ strokeWidth: 1.5 }} />
      </a>

      {/* Global Advanced Command Center Modal Overlay */}
      <GlobalCommandCenter 
        isOpen={commandCenterOpen}
        onClose={() => setCommandCenterOpen(false)}
        onNavigate={(section, params) => {
          if (!currentUser) {
            setAuthModalOpen(true);
            return;
          }
          if (section === "help") {
            if (["primary_admin", "secondary_admin", "secret_admin", "third_admin"].includes(currentUser.role)) {
              setActiveSection("admin-dash");
              localStorage.setItem("diavox_admin_active_tab", "help-kb");
            } else if (currentUser.role === "team_member") {
              setActiveSection("team-dash");
            } else {
              setActiveSection("client-dash");
              localStorage.setItem("diavox_client_active_tab", "help-kb");
            }
          } else if (["projects", "quotes", "billing", "chats"].includes(section)) {
            if (["primary_admin", "secondary_admin", "secret_admin", "third_admin"].includes(currentUser.role)) {
              setActiveSection("admin-dash");
              if (section === "projects") localStorage.setItem("diavox_admin_active_tab", "projects");
              if (section === "billing") localStorage.setItem("diavox_admin_active_tab", "payments");
              if (section === "quotes") localStorage.setItem("diavox_admin_active_tab", "leads");
              if (section === "chats") localStorage.setItem("diavox_admin_active_tab", "chats");
            } else if (currentUser.role === "team_member") {
              setActiveSection("team-dash");
            } else {
              setActiveSection("client-dash");
              if (section === "projects") localStorage.setItem("diavox_client_active_tab", "workspace");
              if (section === "billing") localStorage.setItem("diavox_client_active_tab", "billing");
              if (section === "quotes") localStorage.setItem("diavox_client_active_tab", "quote");
              if (section === "chats") localStorage.setItem("diavox_client_active_tab", "chat");
            }
          } else if (section === "portfolio") {
            handleNavigate("portfolio");
          } else if (section === "people") {
            if (["primary_admin", "secondary_admin", "secret_admin", "third_admin"].includes(currentUser.role)) {
              setActiveSection("admin-dash");
              localStorage.setItem("diavox_admin_active_tab", "team");
            }
          }
        }}
      />

      </div>
    </>
  );
}
