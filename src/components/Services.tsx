/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useStore } from "../store";
import { motion, AnimatePresence } from "motion/react";
import { 
  Laptop, Compass, Zap, Bot, Download, ArrowUpRight, 
  Settings, Layers, ShoppingBag, Terminal, CheckCircle2,
  HelpCircle, ChevronRight, MessageSquare, Code, Globe, ShieldCheck
} from "lucide-react";

interface ServicesProps {
  onNavigate: (section: string) => void;
  onOpenAuth: () => void;
  preview?: boolean;
}

export default function Services({ onNavigate, onOpenAuth, preview = true }: ServicesProps) {
  const { theme, currentUser, cmsContent } = useStore();
  const [selectedService, setSelectedService] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const iconMap: { [key: string]: React.ReactNode } = {
    Laptop: <Laptop className="text-cyan-400" size={24} />,
    Layers: <Layers className="text-blue-400" size={24} />,
    Settings: <Settings className="text-purple-400" size={24} />,
    Bot: <Bot className="text-pink-400" size={24} />,
    Download: <Download className="text-amber-400" size={24} />,
    HelpCircle: <HelpCircle className="text-cyan-400" size={24} />,
  };

  const defaultServices = [
    {
      id: "service-1",
icon: "Laptop",
title: "Website Development",
description:
  "We design and develop fast, modern websites that help businesses establish a strong online presence. Whether you need a professional company website, a custom web application, an online store, or a client portal, every project is built with performance, scalability, and long-term maintainability in mind. Our development approach focuses on clean code, responsive design, secure architecture, and an intuitive user experience across all devices.",

benefits:
  "Enjoy faster loading pages, a seamless experience on desktop and mobile, and a website that's easy to manage, scale, and maintain as your business grows.",

techUsed: [
  "React",
  "TypeScript",
  "Vite",
  "Node.js",
  "Express",
  "Supabase"
],

items: [
  "Business & Corporate Websites",
  "Custom Web Applications",
  "E-commerce Stores (Custom & Shopify)",
  "Client Portals & Admin Dashboards",
  "Portfolio & Personal Brand Websites"
]
    },
    {
     id: "service-2",
icon: "Layers",
title: "UI/UX Design",
description:
  "We design intuitive, user-focused interfaces that make digital products easy to use and visually engaging. Every design is created with your brand, audience, and business goals in mind, ensuring a seamless experience across desktop, tablet, and mobile devices. From wireframes to polished interfaces, we focus on clarity, consistency, and usability.",

benefits:
  "Create a better first impression, improve user engagement, and make it easier for visitors to find information, complete tasks, and take action.",

techUsed: [
  "Figma",
  "Tailwind CSS",
  "Framer Motion",
  "Design Systems"
],

items: [
  "Website & Web App UI Design",
  "Wireframes & Interactive Prototypes",
  "Responsive User Interfaces",
  "Design Systems & Component Libraries",
  "Brand Identity & Visual Design"
]
    },
    {
      id: "service-3",
icon: "Settings",
title: "Search Engine Optimization (SEO)",
description:
  "We optimize your website to improve its visibility in search engines and help potential customers find your business more easily. Our SEO approach combines technical optimization, on-page improvements, performance enhancements, and content strategy to build a strong foundation for sustainable organic growth.",

benefits:
  "Increase your website's visibility, attract more qualified visitors, and build long-term organic traffic without relying solely on paid advertising.",

techUsed: [
  "Google Search Console",
  "Google Analytics",
  "Schema.org",
  "Core Web Vitals"
],

items: [
  "Technical SEO Audits",
  "On-Page SEO Optimization",
  "Keyword Research & Content Strategy",
  "Website Performance & Core Web Vitals",
  "Local SEO & Search Console Setup"
]
    },
    {
      id: "service-4",
icon: "Bot",
title: "AI Automation",
description:
  "We build AI-powered automation solutions that streamline repetitive tasks, improve operational efficiency, and help your team work smarter. From customer inquiries and lead management to workflow automation and intelligent data processing, we create solutions that integrate seamlessly with your existing business systems.",

benefits:
  "Reduce manual work, improve response times, minimize repetitive tasks, and allow your team to focus on higher-value work while automated workflows handle routine processes.",

techUsed: [
  "Google Gemini API",
  "OpenAI API",
  "Workflow Automation",
  "Webhook Integrations"
],

items: [
  "AI Chatbots & Virtual Assistants",
  "Lead Capture & Qualification Automation",
  "WhatsApp & Email Workflow Automation",
  "CRM & Database Automation",
  "Document Processing & AI Classification"
]
    },
    {
      id: "service-5",
icon: "Download",
title: "Business Templates",
description:
  "Launch your website faster with professionally designed templates built for real business needs. Our templates provide a solid foundation for common industries while remaining flexible enough to match your brand, content, and business goals. Each template is optimized for performance, responsiveness, and future customization.",

benefits:
  "Reduce development time, lower project costs, and launch with a polished, professional website that can easily grow alongside your business.",

techUsed: [
  "React",
  "TypeScript",
  "Zustand",
  "Supabase"
],

items: [
  "Hotel & Hospitality Websites",
  "Restaurant & Café Websites",
  "Real Estate Listing Platforms",
  "Agency & Business Websites",
  "Appointment Booking & Service Websites"
]
    }
  ];

  const rawStoreServices = cmsContent?.services && cmsContent.services.length > 0 
    ? cmsContent.services 
    : [];

  const servicesData = defaultServices.map((defS) => {
    const storeS = rawStoreServices.find(s => s.id === defS.id || s.title.toLowerCase() === defS.title.toLowerCase());
    return {
      ...defS,
      title: storeS?.title || defS.title,
      description: storeS?.description || defS.description,
      icon: iconMap[storeS?.icon || defS.icon] || <Laptop className="text-cyan-400" size={24} />,
    };
  });

  if (rawStoreServices.length > defaultServices.length) {
    rawStoreServices.forEach((s) => {
      const alreadyIncluded = servicesData.some(sd => sd.title === s.title);
      if (!alreadyIncluded) {
        servicesData.push({
          id: s.id,
          title: s.title,
          description: s.description,
          icon: iconMap[s.icon] || <Laptop className="text-cyan-400" size={24} />,
          benefits: "Custom created digital capabilities to deliver enterprise and growth value.",
          techUsed: ["Core Frameworks", "Handcrafted Layouts", "API Systems"],
          items: ["Handcrafted delivery assets", "Custom parameters configuration"]
        });
      }
    });
  }

  const faqData = cmsContent?.faqs && cmsContent.faqs.length > 0
    ? cmsContent.faqs.map(f => ({ q: f.question, a: f.answer }))
    : [
  {
    q: "How long does it take to build a custom website?",
    a: "Project timelines depend on the scope and complexity. Most business websites are completed within 3–6 weeks, while larger web applications or platforms with custom features typically take 6–10 weeks. We'll provide a clear timeline before development begins."
  },
  {
    q: "Can I review the design before development starts?",
    a: "Yes. We begin with wireframes or high-fidelity designs so you can review the layout, branding, and user experience. Development only starts after you've approved the design."
  },
  {
    q: "Will I receive updates during the project?",
    a: "Absolutely. We keep you informed throughout the development process with regular progress updates, milestone reviews, and opportunities to provide feedback before moving to the next stage."
  },
  {
    q: "Will my website work on mobile devices?",
    a: "Yes. Every website we build is fully responsive and optimized to provide a smooth experience across desktops, tablets, and smartphones."
  },
  {
    q: "Can my website be updated as my business grows?",
    a: "Yes. We build scalable websites that can be expanded with new pages, features, integrations, or functionality as your business evolves."
  },
  {
    q: "Do you provide support after the website is launched?",
    a: "Yes. We offer post-launch support to help with updates, maintenance, performance improvements, and any technical issues that may arise."
  }
      ];

  const handleBookSelected = () => {
    if (!currentUser) {
      onOpenAuth();
    } else {
      onNavigate("contact-page");
    }
  };

  const renderServiceDetails = (index: number) => {
    const service = servicesData[index];
    if (!service) return null;
    return (
      <div className={`h-full p-6 sm:p-8 rounded-2xl border flex flex-col justify-between ${
        theme === "dark"
          ? "bg-slate-900/30 border-slate-900 text-white"
          : "bg-slate-50 border-slate-200 text-slate-900 shadow-md shadow-slate-100/50"
      }`}>
        <div className="space-y-6">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-gradient-to-tr from-cyan-500/20 to-purple-500/10 rounded-xl">
              {service.icon}
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-display font-bold">
                {service.title}
              </h3>
              <span className="text-[10px] font-mono tracking-widest text-cyan-500 bg-cyan-500/10 px-2.5 py-0.5 rounded-lg font-semibold uppercase mt-1 inline-block">
                Diavox Core Service
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm sm:text-base opacity-85 leading-relaxed font-light">
              {service.description}
            </p>
            
            {/* Human Friendly Benefits text block */}
            <div className={`p-4 rounded-xl border text-xs font-light leading-relaxed ${
              theme === "dark" 
                ? "bg-slate-950/60 border-slate-800 text-slate-300" 
                : "bg-white border-slate-200 text-slate-700"
            }`}>
              <strong className="font-semibold text-cyan-500 mr-1.5 font-mono uppercase text-[9px] tracking-wider block mb-1">Key Growth Outcome:</strong>
              {service.benefits}
            </div>
          </div>

          <div className="space-y-3.5 pt-2">
            <p className="text-xs font-mono font-bold uppercase tracking-wider opacity-60">Deliverable Assets:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="service-checklist">
              {service.items.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs">
                  <CheckCircle2 size={13} className="text-cyan-500 shrink-0" />
                  <span className="opacity-85 font-light leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technologies Grid */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-mono font-bold uppercase tracking-wider opacity-60">Technologies & Tools:</p>
            <div className="flex flex-wrap gap-1.5">
              {service.techUsed.map((t, idx) => (
                <span key={idx} className={`px-2.5 py-1 text-[10px] font-mono rounded-lg border ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-850 text-slate-300"
                    : "bg-white border-slate-200 text-slate-700 shadow-sm"
                }`}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action trigger footer */}
        <div className="mt-8 pt-6 border-t dark:border-slate-800 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left font-mono text-[10px] opacity-60 space-y-1">
            <p className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Free Tech Architecture Assessment</span>
            </p>
            <p className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>24-Hour Lead Response SLA Ticket</span>
            </p>
          </div>
          
          <button
            onClick={handleBookSelected}
            id="cta-active-service"
            className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-cyan-500 hover:brightness-110 to-purple-600 text-white flex items-center justify-center space-x-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Request Full Specification</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <section id="services" className={`py-16 md:py-24 text-left font-sans transition-colors duration-300 ${
      theme === "dark" 
        ? "bg-slate-950 text-white" 
        : "bg-white text-slate-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Title Presentation */}
        <div className="max-w-3xl space-y-4" id="services-title-wrapper">
          <p className="text-xs font-mono uppercase tracking-widest text-cyan-500 font-bold">EXPERTISE & CAPABILITIES</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-light leading-tight tracking-tight">
            How We Help Your Business <span className="font-semibold italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Stand Out & Grow</span>
          </h2>
          <p className="text-sm sm:text-base opacity-85 leading-relaxed font-light">
            We provide web development, AI automation, business templates, UI/UX design, and SEO services that help businesses launch faster, improve search visibility, automate workflows, and convert more visitors into clients.
          </p>
        </div>

        {/* Bento Board: Left selector tabs, Right expansive details display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch" id="services-bento-grid">
          
          {/* Tabs Selector list */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-3" id="services-tabs-panel">
            {servicesData.map((serv, index) => {
              const isActive = selectedService === index;
              return (
                <div key={index} className="flex flex-col gap-3">
                  <button
                    id={`service-tab-${index}`}
                    onClick={() => setSelectedService(index)}
                    className={`p-4 rounded-xl text-left border transition-all flex items-center space-x-4 cursor-pointer ${
                      isActive
                        ? theme === "dark"
                          ? "bg-slate-900 border-cyan-500/40 text-white shadow-lg shadow-cyan-500/5 scale-100 lg:scale-[1.01]"
                          : "bg-slate-50 border-slate-300 text-slate-950 font-semibold shadow-sm scale-100 lg:scale-[1.01]"
                        : theme === "dark"
                        ? "bg-slate-950/40 border-slate-900/60 text-slate-400 hover:bg-slate-900/40 hover:text-white"
                        : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-500/5 text-slate-500"}`}>
                      {serv.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold truncate leading-snug">{serv.title}</h3>
                      <p className={`text-xs mt-0.5 truncate ${isActive ? "text-cyan-400/80 dark:text-cyan-400" : "opacity-60"}`}>
                        {serv.description}
                      </p>
                    </div>
                    <ArrowUpRight size={14} className={`opacity-40 transition-transform ${isActive ? "rotate-90 lg:translate-x-0.5 lg:-translate-y-0.5 opacity-100 text-cyan-500 lg:rotate-0" : "rotate-90 lg:rotate-0"}`} />
                  </button>
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="lg:hidden overflow-hidden"
                      >
                        {renderServiceDetails(index)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Expansive Details View */}
          <div className="hidden lg:block lg:col-span-7" id="services-active-details">
            {renderServiceDetails(selectedService)}
          </div>

        </div>

        {/* Dedicated Page Only Additional Interactive Features */}
        {!preview && (
          <div className="space-y-16 pt-8 border-t dark:border-slate-900 border-slate-200" id="services-extra-sections">
            
            {/* Benefits Block (Why Choose Us) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3 p-6 rounded-2xl dark:bg-slate-900/10 border border-slate-200 dark:border-slate-900">
                <div className="p-2.5 rounded-lg bg-cyan-500/15 text-cyan-400 w-max">
                  <Globe size={18} />
                </div>
                <h4 className="text-lg font-bold font-display">Elite Remote Experts</h4>
                <p className="text-xs opacity-75 font-light leading-relaxed">
                  We are human experts, not a bloated sales agency. We manage directly on code branches, communicate transparently, and build custom database logic fast.
                </p>
              </div>

              <div className="space-y-3 p-6 rounded-2xl dark:bg-slate-900/10 border border-slate-200 dark:border-slate-900">
                <div className="p-2.5 rounded-lg bg-purple-500/15 text-purple-400 w-max">
                  <Code size={18} />
                </div>
                <h4 className="text-lg font-bold font-display">Clean, Fast Tech Stack</h4>
                <p className="text-xs opacity-75 font-light leading-relaxed">
                  We skip heavy framework bloats. Our layouts utilize Vite bundling, modular Tailwind CSS, local caches, and lightweight state managers so pages load instantly.
                </p>
              </div>

              <div className="space-y-3 p-6 rounded-2xl dark:bg-slate-900/10 border border-slate-200 dark:border-slate-900">
                <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-400 w-max">
                  <ShieldCheck size={18} />
                </div>
                <h4 className="text-lg font-bold font-display">Continuous Sprints Updates</h4>
                <p className="text-xs opacity-75 font-light leading-relaxed">
                  Track project milestone progress live. Submit design adjustments directly to our team, review active development code, and download clean deliverables safely.
                </p>
              </div>
            </div>

            {/* Simple FAQ Dropdown Board */}
            <div className="space-y-6 max-w-3xl mx-auto text-left" id="services-faq-section-accordion">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-display font-semibold">Service Delivery FAQs</h3>
                <p className="text-xs opacity-60">Answers to common onboarding and maintenance procedures.</p>
              </div>

              <div className="space-y-3 pt-4">
                {faqData.map((item, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div
                      key={index}
                      className={`rounded-xl border transition-all ${
                        isOpen 
                          ? "dark:bg-slate-900/40 border-slate-300 dark:border-slate-800" 
                          : "dark:bg-slate-950 border-slate-150 dark:border-slate-900"
                      }`}
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="w-full text-left p-4 flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
                      >
                        <span>{item.q}</span>
                        <ChevronRight size={14} className={`opacity-60 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
                      </button>
                      
                      {isOpen && (
                        <div className="px-4 pb-4 text-xs font-light opacity-80 leading-relaxed border-t dark:border-slate-850 border-slate-100 pt-3">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
          </div>
        )}

        {/* Small See More shortcut on general Home view */}
        {preview && (
          <div className="text-center pt-2">
            <button
              onClick={() => onNavigate("services-page")}
              className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold border transition-all inline-flex items-center space-x-1.5 cursor-pointer ${
                theme === "dark"
                  ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-white"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
              }`}
            >
              <span>Explore Detailed Deliverables & Pricing Guides</span>
              <ArrowUpRight size={12} className="text-cyan-500" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
