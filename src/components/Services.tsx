/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useStore } from "../store";
import { 
  Laptop, Compass, Zap, Bot, Download, ArrowUpRight, 
  Settings, Layers, ShoppingBag, Terminal, CheckCircle2 
} from "lucide-react";

interface ServicesProps {
  onNavigate: (section: string) => void;
  onOpenAuth: () => void;
}

export default function Services({ onNavigate, onOpenAuth }: ServicesProps) {
  const { theme, currentUser } = useStore();
  const [selectedService, setSelectedService] = useState<number>(0);

  const servicesData = [
    {
      icon: <Laptop className="text-cyan-400" size={24} />,
      title: "Website Development",
      description: "Bespoke production-grade software engineered with React, Next, and Supabase. Fast, intuitive, and conversion-optimized.",
      items: [
        "Corporate & Business Websites",
        "Personal & Creative Portfolios",
        "E-Commerce Websites (Shopify & Custom)",
        "SaaS Web Applications",
        "Custom Database-Driven Software Platforms"
      ]
    },
    {
      icon: <Layers className="text-blue-400" size={24} />,
      title: "Website Design",
      description: "Stunning interfaces crafted with luxury, Swiss-inspired typography, subtle offsets, and fluid micro-interactions.",
      items: [
        "Figma UI/UX Prototypes",
        "Fluid Responsive Slaes Layouts",
        "Complete Legacy Website Redesigns",
        "Corporate Brand Identity & Color Schemes",
        "Tailwind CSS Layout Components"
      ]
    },
    {
      icon: <Settings className="text-purple-400" size={24} />,
      title: "Technical SEO",
      description: "Search ranking architecture that drives organic leads sustainably, focusing on core web vitals and fast speed indices.",
      items: [
        "In-depth Technical SEO Audits",
        "Keywords Optimization & Mapping",
        "Core Web Vitals Speed Metrics Tuning",
        "Organic Backlink Campaigns",
        "Google Search Console & Metadata Setups"
      ]
    },
    {
      icon: <Bot className="text-pink-400" size={24} />,
      title: "AI Automation",
      description: "Integrate Google Gemini API modules inside manual business flows. Eliminate manual entry and respond in minutes.",
      items: [
        "Custom Smart Support & Sales Chatbots",
        "Automation Pipelines & Lead Filters",
        "CRM Syncing (Hubspot, Salesforce, Keep)",
        "Automated Client Feedback Queues",
        "Slack & Telegram Notification Modules"
      ]
    },
    {
      icon: <Download className="text-amber-400" size={24} />,
      title: "Business Templates",
      description: "Downloadable ready-to-wire frameworks that help fast-track launch times for various common industries.",
      items: [
        "Premium Boutique Hotel Systems",
        "Interactive Fine Dining & Restaurant Menus",
        "Real Estate Spatial Listings Templates",
        "E-Commerce Catalog Frameworks",
        "One-Page Landing Pages for SaaS Projects"
      ]
    }
  ];

  const handleBookSelected = () => {
    if (!currentUser) {
      onOpenAuth();
    } else {
      onNavigate("contact");
    }
  };

  return (
    <section id="services" className={`py-20 md:py-28 text-left ${
      theme === "dark" 
        ? "bg-slate-950 text-white" 
        : "bg-white text-slate-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="max-w-3xl mb-16 space-y-4" id="services-header">
          <p className="text-xs font-mono uppercase tracking-widest text-cyan-500">EXPERTISE & SERVICE OFFERINGS</p>
          <h2 className="text-3xl sm:text-4xl md:text-5.5xl font-display font-light tracking-tight leading-tight">
            How We Empower <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-amber-250 to-purple-400 font-normal italic">Your Enterprise</span>
          </h2>
          <p className="text-base sm:text-lg opacity-75 font-light">
            We provide deep technological solutions to help establish authoritative visual brands, build flawless software infrastructure, and automate repetitive workflows.
          </p>
        </div>

        {/* Bento Service layout: Left is quick tabs, Right is comprehensive active service display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch" id="services-grid-wrapper">
          
          {/* Tabs Selector Map - Col spans 5 */}
          <div className="lg:col-span-5 flex flex-col space-y-3 justify-center" id="services-tabs-container">
            {servicesData.map((serv, index) => {
              const acts = selectedService === index;
              return (
                <button
                  key={index}
                  id={`service-tab-${index}`}
                  onClick={() => setSelectedService(index)}
                  className={`p-4 rounded-xl text-left border transition-all flex items-center space-x-4 ${
                    acts
                      ? theme === "dark"
                        ? "bg-slate-900 border-cyan-500/40 text-white shadow-lg shadow-cyan-500/5"
                        : "bg-slate-100 border-slate-300 text-slate-950 font-semibold"
                      : theme === "dark"
                      ? "bg-slate-950 border-slate-900/60 text-slate-400 hover:bg-slate-900/40 hover:text-white"
                      : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className={`p-2.5 rounded-lg ${acts ? "bg-cyan-500/20" : "bg-slate-400/5"}`}>
                    {serv.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-display font-bold truncate">{serv.title}</h3>
                    <p className="text-xs opacity-60 truncate mt-0.5">{serv.description}</p>
                  </div>
                  <ArrowUpRight size={14} className={`opacity-40 transition-transform ${acts ? "translate-x-1 -translate-y-1 opacity-100 text-cyan-400" : ""}`} />
                </button>
              );
            })}
          </div>

          {/* Broad Active Details Display Card - Col spans 7 */}
          <div className="lg:col-span-7" id="services-details-pane">
            <div className={`h-full p-6 sm:p-8 rounded-2xl border flex flex-col justify-between ${
              theme === "dark"
                ? "bg-slate-900/40 border-slate-900 text-white"
                : "bg-slate-50/50 border-slate-200 text-slate-900"
            }`}>
              <div className="space-y-6">
                <div className="flex items-center space-x-3.5">
                  <div className="p-3 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 rounded-xl">
                    {servicesData[selectedService].icon}
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-display font-bold">
                      {servicesData[selectedService].title}
                    </h3>
                    <p className="text-xs font-mono tracking-widest text-cyan-500 uppercase mt-0.5">Diavox Solutions</p>
                  </div>
                </div>

                <p className="text-sm sm:text-base opacity-80 leading-relaxed font-light">
                  {servicesData[selectedService].description}
                </p>

                <div className="space-y-3.5 pt-2">
                  <p className="text-xs font-mono font-bold uppercase tracking-wider opacity-60">Specific service deliverables:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="service-checklist">
                    {servicesData[selectedService].items.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs">
                        <CheckCircle2 size={14} className="text-cyan-500 mt-0.5 shrink-0" />
                        <span className="opacity-90">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Booking CTA Section helper */}
              <div className="mt-8 pt-6 border-t dark:border-slate-800 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left font-mono text-xs opacity-60">
                  <p>✓ Fast 24 Hours Reply SLA</p>
                  <p>✓ Remote World Wide Support</p>
                </div>
                <button
                  onClick={handleBookSelected}
                  id="cta-active-service"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-cyan-500 hover:brightness-110 to-purple-600 text-white flex items-center justify-center space-x-1.5 self-start sm:self-auto"
                >
                  <span>Build This Service</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
