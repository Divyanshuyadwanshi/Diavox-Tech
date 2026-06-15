/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useStore } from "../store";
import { Globe, Heart, Shield, Award, Users, BookOpen, Clock, ArrowUpRight } from "lucide-react";

interface AboutProps {
  onNavigate: (section: string) => void;
}

export default function About({ onNavigate }: AboutProps) {
  const { theme } = useStore();

  const values = [
    {
      icon: <Globe className="text-cyan-400" size={20} />,
      title: "Global Excellence",
      desc: "Operating entirely as a remote-first team, we aggregate elite software engineering and design talent globally to solve hard business needs."
    },
    {
      icon: <Shield className="text-emerald-400" size={20} />,
      title: "Extreme Compliance",
      desc: "All client code, database schemas, and server configurations adhere to strict international reliability, safety, and performance specs."
    },
    {
      icon: <Award className="text-amber-400" size={20} />,
      title: "Craftsmanship & Design",
      desc: "We don't do boring. We focus on gorgeous typography, custom color layers, stunning motion curves, and fluid micro-interactions."
    },
    {
      icon: <Heart className="text-rose-450 text-rose-400" size={20} />,
      title: "Human Relationships",
      desc: "We talk like people, not robots or agencies. We build transparent partnerships, answer client texts fast, and deliver exact deliverables."
    }
  ];

  const steps = [
    {
      id: "01",
      title: "Collaborative Briefing",
      desc: "We start by learning everything about your business bottlenecks, target audience, and future-proof expansion needs."
    },
    {
      id: "02",
      title: "Aesthetic UI/UX Prototyping",
      desc: "Our design team translates details into high-fidelity Figma layouts mapping out typography pairs and sleek, seamless interactions."
    },
    {
      id: "03",
      title: "Bespoke Modern Engineering",
      desc: "We build using robust React, Next, and Express systems with sub-second performance indices and clean database tables."
    },
    {
      id: "04",
      title: "Performance & Security Audits",
      desc: "We test Core Web Vitals, run continuous security tests, and stress-test interactive forms so everything works flawlessly."
    }
  ];

  return (
    <div id="about-dedicated-page" className={`py-12 md:py-20 text-left ${
      theme === "dark" ? "bg-slate-950 text-white" : "bg-white text-slate-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Intro Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" id="about-intro-hero">
          <div className="lg:col-span-7 space-y-6">
            <p className="text-xs font-mono uppercase tracking-widest text-cyan-500 font-bold">OUR STORY & VISION</p>
            <h1 className="text-4xl sm:text-6xl font-display font-light leading-tight tracking-tight">
              Crafting High-Speed <span className="font-semibold italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Digital Solutions</span> with Human Precision.
            </h1>
            <p className="text-base sm:text-lg opacity-80 leading-relaxed font-light">
              Diavox Tech is a premium remote developer collective that empowers growing businesses with high-end websites, organic search algorithms, and custom AI tooling. We build elegant code with gorgeous, Swiss-inspired design and easy-to-use business backends.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => onNavigate("contact")}
                className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:brightness-110 shadow-lg shadow-cyan-500/10 cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Partner With Us</span>
                <ArrowUpRight size={16} />
              </button>
              <button
                onClick={() => onNavigate("services")}
                className={`px-6 py-3 rounded-xl font-bold border font-mono text-xs cursor-pointer text-center ${
                  theme === "dark"
                    ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-white"
                    : "bg-slate-55 bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"
                }`}
              >
                Our Capabilities
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative" id="about-hero-graphics">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 rounded-2xl blur-2xl z-0" />
            <div className={`relative z-10 p-8 rounded-2xl border ${
              theme === "dark" ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"
            } space-y-8`}>
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-cyan-500 uppercase font-bold tracking-widest">Est. Year 2024</span>
                <h3 className="text-2xl font-display font-bold">Diavox Collective</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl dark:bg-slate-950 bg-white border dark:border-slate-850 border-slate-150">
                  <p className="text-3xl font-display font-bold text-cyan-500">12+</p>
                  <p className="text-[10px] font-mono uppercase opacity-60 mt-1">Active Clienteles</p>
                </div>
                <div className="p-4 rounded-xl dark:bg-slate-950 bg-white border dark:border-slate-850 border-slate-150">
                  <p className="text-3xl font-display font-bold text-purple-500">99.8%</p>
                  <p className="text-[10px] font-mono uppercase opacity-60 mt-1">Sub-Second Speed</p>
                </div>
                <div className="p-4 rounded-xl dark:bg-slate-950 bg-white border dark:border-slate-850 border-slate-150 col-span-2">
                  <p className="text-xl font-sans font-bold text-emerald-500">24/7 Remote</p>
                  <p className="text-[10px] font-mono uppercase opacity-60 mt-1">Serving Worldwide Operations</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vision & Mission Core values */}
        <div className="space-y-12" id="about-vision-mission">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <p className="text-xs font-mono uppercase tracking-widest text-cyan-500 font-bold">CORE PRINCIPLES</p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold">The Values That Guard Every Line of Code</h2>
            <p className="text-sm opacity-70 font-light">
              We approach business software with extreme humility, a strict adherence to code clarity, and a dedication to high aesthetics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((v, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 ${
                  theme === "dark" 
                    ? "bg-slate-900/30 border-slate-900 hover:border-slate-800" 
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100/50"
                } transition-all`}
              >
                <div className="space-y-3">
                  <div className="p-3 w-max rounded-xl bg-cyan-500/10 text-cyan-400">
                    {v.icon}
                  </div>
                  <h3 className="text-lg font-display font-bold">{v.title}</h3>
                  <p className="text-sm opacity-75 font-light leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive process step guideline */}
        <div className="space-y-12" id="about-step-timeline">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <p className="text-xs font-mono uppercase tracking-widest text-cyan-500 font-bold">WORKFLOW TIMELINE</p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold">A Seamless Development Journey</h2>
            <p className="text-sm opacity-70 font-light">
              From the initial introductory call to the final launch and maintenance, we work iteratively in sprints with complete transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((st, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl border flex flex-col justify-between space-y-6 relative ${
                  theme === "dark" ? "bg-slate-900/10 border-slate-900" : "bg-white border-slate-200"
                } hover:border-cyan-500/25 transition-all`}
              >
                <div className="space-y-4">
                  <span className="text-3xl sm:text-4xl font-display font-black text-cyan-500 opacity-60 block leading-none">
                    {st.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {st.title}
                  </h3>
                  <p className="text-xs opacity-75 leading-relaxed font-light">
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simple friendly callout */}
        <div className={`p-8 sm:p-12 rounded-3xl border text-center relative overflow-hidden ${
          theme === "dark" 
            ? "bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 border-slate-900" 
            : "bg-slate-50 border-slate-200"
        }`} id="about-cta-footer">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h3 className="text-2xl sm:text-3xl font-display font-bold">Let's craft something amazing together.</h3>
            <p className="text-sm opacity-75 font-light">
              Ready to automate your operations, boost core search rankings, and deploy elegant user components? Our remote experts respond in minutes.
            </p>
            <button
              onClick={() => onNavigate("contact")}
              className="px-6 py-3 rounded-xl font-bold bg-white text-slate-950 hover:bg-slate-200 transition-colors mx-auto cursor-pointer text-xs font-mono"
            >
              Start Your Free Tech Assessment
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
