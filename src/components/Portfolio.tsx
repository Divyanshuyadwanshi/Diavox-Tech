/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useStore } from "../store";
import { ExternalLink, Calendar, Eye, Tag, X } from "lucide-react";

interface PortfolioProps {
  preview?: boolean;
  onNavigate?: (section: string) => void;
}

export default function Portfolio({ preview, onNavigate }: PortfolioProps) {
  const { theme, portfolioItems, fetchPortfolio } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const categories = ["All", "Website Development", "Website Design", "SEO", "AI Automation"];

  const filteredProjects = activeCategory === "All"
    ? portfolioItems
    : portfolioItems.filter(p => p.category === activeCategory);

  const displayedProjects = preview ? filteredProjects.slice(0, 3) : filteredProjects;

  return (
    <section id="portfolio" className={`py-20 md:py-28 text-left ${
      theme === "dark" 
        ? "bg-slate-900/40 text-white" 
        : "bg-slate-50 text-slate-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core title and filter buttons */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6" id="portfolio-header">
          <div className="max-w-xl space-y-4">
            <p className="text-xs font-mono uppercase tracking-widest text-cyan-500">OUR RECENT PORTFOLIO</p>
            <h2 className="text-3xl sm:text-4xl md:text-5.5xl font-display font-light tracking-tight leading-tight">
              Crafted with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-amber-250 to-purple-400 font-normal italic">Absolute Precision</span>
            </h2>
            <p className="text-sm opacity-75 font-light">
              Explore solutions we have delivered remotely to clients globally. Filter by industry niche to see our execution capabilities.
            </p>
          </div>

          {/* Quick categories select */}
          <div className="flex flex-wrap gap-2" id="portfolio-categories-rail">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-mono transition-all ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-lg shadow-cyan-500/10 font-bold"
                    : theme === "dark"
                    ? "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="portfolio-grid">
          {displayedProjects.map((project) => {
            const projectTags = project.tags && project.tags.length > 0 
              ? project.tags 
              : ["React", "TypeScript", "Tailwind CSS", "Enterprise Integration"];
            const formattedDate = project.created_at 
              ? new Date(project.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" }) 
              : "Jun 2026";

            return (
              <div
                key={project.id}
                id={`portfolio-card-${project.id}`}
                className={`group rounded-2xl overflow-hidden border flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-900 shadow-xl shadow-black/30 hover:border-slate-800"
                    : "bg-white border-slate-200 shadow-md shadow-slate-200/40 hover:border-slate-300"
                }`}
              >
                <div>
                  {/* Product Cover image */}
                  <div className="relative overflow-hidden aspect-video bg-slate-900">
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors" />
                    
                    {/* Category overlay label */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-mono tracking-wide rounded-lg bg-slate-950/80 backdrop-blur-md text-cyan-400 border border-cyan-400/20 uppercase font-bold">
                      {project.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between text-[11px] font-mono opacity-60">
                      <span className="flex items-center space-x-1">
                        <Calendar size={12} />
                        <span>{formattedDate}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>RELEASED</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-display font-extrabold group-hover:text-cyan-400 transition-colors line-clamp-1">
                      {project.title}
                    </h3>

                    <p className="text-xs opacity-75 line-clamp-3 leading-relaxed font-light">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Technologies list in footer */}
                <div className="p-5 pt-0 space-y-4">
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t dark:border-slate-900 border-slate-100">
                    {projectTags.slice(0, 4).map((tech: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] font-mono dark:bg-slate-900 bg-slate-100 dark:text-slate-400 text-slate-600"
                      >
                        {tech}
                      </span>
                    ))}
                    {projectTags.length > 4 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono dark:bg-slate-900 bg-slate-100 opacity-60">
                        +{projectTags.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Launch details buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="text-xs font-mono font-bold text-cyan-500 hover:text-cyan-400 inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <Eye size={12} />
                      <span>Case details</span>
                    </button>

                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 rounded-lg border transition-colors ${
                          theme === "dark"
                            ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                        }`}
                        title="Launch live app demo"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty placeholder warning */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16 p-6 border border-dashed rounded-2xl dark:border-slate-800 border-slate-200">
            <Tag className="mx-auto text-slate-500 mb-2" size={24} />
            <p className="text-sm font-mono opacity-60">No projects listed under this category yet.</p>
          </div>
        )}

        {/* Premium Case Details Modal Overlay */}
        {selectedProject && (() => {
          const projectTags = selectedProject.tags && selectedProject.tags.length > 0 
            ? selectedProject.tags 
            : ["React", "TypeScript", "Tailwind CSS", "Enterprise Integration"];
          const formattedDate = selectedProject.created_at 
            ? new Date(selectedProject.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" }) 
            : "Jun 2026";

          return (
            <div id="project-detail-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/90 backdrop-blur-md">
              <div className={`w-full max-w-lg md:max-w-2xl rounded-2xl overflow-hidden border shadow-2xl relative max-h-[90vh] flex flex-col ${
                theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}>
                
                {/* Close Button absolute - stays fixed in place above the scrolling zone */}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 z-30 p-2 rounded-xl bg-slate-950/60 hover:bg-slate-950/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 transition-colors text-white active:scale-95 shadow-md flex items-center justify-center cursor-pointer"
                  title="Close panel"
                >
                  <X size={16} />
                </button>

                {/* Securely Scrollable Content Body */}
                <div className="overflow-y-auto flex-1">
                  <div className="aspect-video relative bg-slate-950">
                    <img src={selectedProject.image_url} alt={selectedProject.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-4 left-4 px-3 py-1 font-mono text-[10px] uppercase font-bold rounded-lg bg-cyan-950/90 text-cyan-400 border border-cyan-500/20 tracking-wider">
                      {selectedProject.category}
                    </span>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 sm:p-8 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono opacity-60">
                      <span className="inline-flex items-center space-x-1.5">
                        <Calendar size={13} />
                        <span>Release date: {formattedDate}</span>
                      </span>
                      <span>Delivery segment: International Quality Standard</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-display font-extrabold">{selectedProject.title}</h3>
                    
                    <p className="text-sm opacity-80 leading-relaxed font-light">{selectedProject.description}</p>

                    {/* Tech stack mapping */}
                    <div className="space-y-2.5 pt-2">
                      <p className="text-xs font-mono font-bold uppercase tracking-wider opacity-60">Architectural Framework Index:</p>
                      <div className="flex flex-wrap gap-2">
                        {projectTags.map((tech: string, i: number) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg text-xs font-mono dark:bg-slate-950 bg-slate-100 dark:text-cyan-400 text-slate-700 font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action CTA link */}
                    {selectedProject.live_url && (
                      <div className="pt-4 flex justify-end">
                        <a
                          href={selectedProject.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white text-xs font-bold font-mono tracking-wide shadow-lg shadow-cyan-500/10 hover:brightness-115"
                        >
                          <ExternalLink size={13} />
                          <span>Launch live project site</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {preview && (
          <div className="mt-12 text-center" id="portfolio-see-more-block">
            <button
              onClick={() => onNavigate?.("portfolio-page")}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl border dark:border-slate-850 dark:hover:bg-slate-900 border-slate-200 bg-white hover:bg-slate-50 text-slate-900 dark:text-cyan-400 font-mono text-xs font-bold shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <span>Explore Full Portfolio Case Studies ({portfolioItems.length})</span>
              <span>→</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
