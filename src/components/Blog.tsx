/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useStore } from "../store";
import { Search, Calendar, User, Clock, ArrowUpRight, BookOpen, ChevronRight, X } from "lucide-react";

export default function Blog() {
  const { theme, blogs, cmsContent } = useStore();
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [readableBlog, setReadableBlog] = useState<any | null>(null);

  const categories = ["All", "Web Development", "SEO", "AI", "Business Growth", "Automation"];

  const filteredBlogs = blogs.filter((bl) => {
    const matchesSearch = bl.title.toLowerCase().includes(search.toLowerCase()) || 
                          bl.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || bl.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="blog" className={`py-20 md:py-28 text-left ${
      theme === "dark" 
        ? "bg-slate-950 text-white" 
        : "bg-white text-slate-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header and Search control mapping */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end justify-between mb-12" id="blog-header-block">
          <div className="md:col-span-7 space-y-4">
            <p className="text-xs font-mono uppercase tracking-widest text-cyan-500 font-bold">
              {cmsContent?.sectionTitles?.blog || "DIAVOX KNOWLEDGE PORTAL"}
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5.5xl font-display font-light tracking-tight leading-tight">
              {cmsContent?.sectionSubtitles?.blog ? (
                cmsContent.sectionSubtitles.blog
              ) : (
                <>
                  Insights & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-amber-250 to-purple-400 font-normal italic">Industry Audits</span>
                </>
              )}
            </h2>
            <p className="text-sm opacity-75 font-light">
              {cmsContent?.sectionDescriptions?.blog || "We frequently dissect technical stacks, design conventions, and automation solutions. Search our posts to accelerate your team's knowledge database."}
            </p>
          </div>

          {/* Search bar input box */}
          <div className="md:col-span-5 relative" id="blog-searchbox">
            <input
              type="text"
              id="blog-search-query-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles, audits or guide terms..."
              className="w-full text-xs p-3.5 pl-10 rounded-xl border dark:bg-slate-900 bg-slate-50 dark:border-slate-850 border-slate-200 focus:outline-none focus:border-cyan-500/50"
            />
            <Search className="absolute left-3.5 top-3.5 text-slate-500" size={15} />
          </div>
        </div>

        {/* Categories select rail */}
        <div className="flex flex-wrap gap-2.5 mb-10 overflow-x-auto pb-1.5" id="blog-category-rail">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white dark:bg-cyan-500/20 text-cyan-400 font-bold border dark:border-cyan-500/30 border-slate-950"
                  : theme === "dark"
                  ? "bg-slate-950 text-slate-400 hover:text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blog cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="blog-posts-grid">
          {filteredBlogs.map((post) => (
            <article
              key={post.id}
              id={`blog-card-${post.id}`}
              className={`group rounded-2xl overflow-hidden border flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 ${
                theme === "dark"
                  ? "bg-slate-900/10 border-slate-900 hover:border-slate-800"
                  : "bg-white border-slate-200 hover:border-slate-350 shadow-md shadow-slate-200/25"
              }`}
            >
              <div>
                {/* Visual Cover Header */}
                <div className="aspect-video relative overflow-hidden bg-slate-900">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[9px] font-mono font-bold dark:bg-slate-950 bg-slate-100 text-cyan-400 dark:border dark:border-slate-800 uppercase">
                    {post.category}
                  </span>
                </div>

                <div className="p-5.5 space-y-4">
                  <div className="flex items-center space-x-3 text-[10px] sm:text-[11px] font-mono opacity-50">
                    <span className="flex items-center space-x-1">
                      <User size={11} />
                      <span>{post.author_name}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock size={11} />
                      <span>{post.read_time}</span>
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-display font-extrabold group-hover:text-cyan-400 transition-colors leading-tight line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-xs opacity-75 line-clamp-3 leading-relaxed font-light">
                    {post.content}
                  </p>
                </div>
              </div>

              {/* Footer row */}
              <div className="p-5.5 pt-0">
                <button
                  onClick={() => setReadableBlog(post)}
                  className="text-xs font-mono font-bold text-cyan-500 hover:text-cyan-400 inline-flex items-center space-x-1 cursor-pointer pt-3 border-t dark:border-slate-900 border-slate-100 w-full"
                >
                  <BookOpen size={13} />
                  <span>Read full insight</span>
                  <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Empty Search results */}
        {filteredBlogs.length === 0 && (
          <div className="text-center py-20 p-6 border border-dashed rounded-2xl dark:border-slate-800 border-slate-200">
            <p className="text-sm font-mono opacity-60">No articles matched "{search}". Check spelling or try other categories.</p>
          </div>
        )}

        {/* Full Readable BlogPost Modal */}
        {readableBlog && (
          <div id="blog-reader-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className={`w-full max-w-lg md:max-w-2xl rounded-2xl overflow-hidden border shadow-2xl relative max-h-[90vh] flex flex-col ${
              theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
            }`}>
              
              {/* Close Button top-right - stays fixed in place above the scrolling zone */}
              <button
                onClick={() => setReadableBlog(null)}
                className="absolute top-4 right-4 z-30 p-2 rounded-xl bg-slate-950/60 hover:bg-slate-950/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 transition-colors text-white active:scale-95 shadow-md flex items-center justify-center cursor-pointer"
                title="Close article"
              >
                <X size={15} />
              </button>

              {/* Securely Scrollable Content Body */}
              <div className="overflow-y-auto flex-1">
                <div className="aspect-video relative bg-slate-950">
                  <img src={readableBlog.image_url} alt={readableBlog.title} className="w-full h-full object-cover" />
                  <span className="absolute bottom-4 left-4 px-3 py-1 font-mono text-[10px] uppercase font-bold rounded-lg bg-cyan-950/90 text-cyan-400 border border-cyan-500/20 tracking-wider">
                    {readableBlog.category}
                  </span>
                </div>

                {/* Modal Body */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono opacity-50 border-b dark:border-slate-800 border-slate-100 pb-4">
                    <span className="inline-flex items-center space-x-1.5">
                      <User size={13} />
                      <span>Author: {readableBlog.author_name}</span>
                    </span>
                    <span className="inline-flex items-center space-x-1.5">
                      <Clock size={13} />
                      <span>Read latency: {readableBlog.read_time}</span>
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-display font-extrabold leading-tight">{readableBlog.title}</h3>
                  
                  <div className="text-sm opacity-85 leading-relaxed font-light space-y-4">
                    {readableBlog.content.split("\n\n").map((para: string, idx: number) => (
                      <p key={idx}>{para}</p>
                    ))}
                    <p>In addition, our Diavox remote team is constantly experimenting with server caching mechanics, automated indexing procedures, and state-of-the-art layout layouts. We deploy directly through continuous systems, reducing friction and delivering immediate metrics on day one.</p>
                    <p className="font-medium text-cyan-500">Diavox Tech — Crafting Digital Experiences Worldwide.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
