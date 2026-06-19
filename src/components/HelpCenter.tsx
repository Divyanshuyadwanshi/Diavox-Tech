import React, { useState, useEffect } from "react";
import { useStore } from "../store";
import { 
  Search, BookOpen, ThumbsUp, Eye, Bookmark, Plus, Edit2, Trash2, 
  Download, Video, HelpCircle, FileText, Globe, Check, AlertCircle, BookmarkCheck, ArrowRight
} from "lucide-react";
import { KnowledgeArticle, KnowledgeCategory } from "../types";

export default function HelpCenter() {
  const store = useStore();
  const theme = store.theme;
  const user = store.currentUser;
  const isAdmin = user && [
    "secret_admin", "primary_admin", "secondary_admin", "third_admin", "developer"
  ].includes(user.role);

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubTab, setSelectedSubTab] = useState<"all" | "faq" | "tutorial" | "guide" | "trouble" | "saved">("all");
  const [activeArticle, setActiveArticle] = useState<KnowledgeArticle | null>(null);

  // Form states (Create / Edit)
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formImg, setFormImg] = useState("");
  const [formVideo, setFormVideo] = useState("");
  const [formPdfUrl, setFormPdfUrl] = useState("");
  const [formPdfName, setFormPdfName] = useState("");
  const [formPublished, setFormPublished] = useState(true);
  const [formFeatured, setFormFeatured] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Categories & Tags management lists
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  useEffect(() => {
    store.fetchHelpCenterData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Open creation modal
  const openCreateForm = () => {
    setEditId(null);
    setFormTitle("");
    setFormContent("");
    setFormCategory(store.knowledgeCategories[0]?.id || "");
    setFormTags("");
    setFormImg("");
    setFormVideo("");
    setFormPdfUrl("");
    setFormPdfName("");
    setFormPublished(true);
    setFormFeatured(false);
    setIsEditing(true);
  };

  // Open edit modal
  const openEditForm = (art: KnowledgeArticle) => {
    setEditId(art.id);
    setFormTitle(art.title);
    setFormContent(art.content);
    setFormCategory(art.category_id || "");
    setFormTags(art.tags?.join(", ") || "");
    setFormImg(art.image_url || "");
    setFormVideo(art.video_url || "");
    setFormPdfUrl(art.pdf_url || "");
    setFormPdfName(art.pdf_name || "");
    setFormPublished(art.is_published);
    setFormFeatured(art.is_featured || false);
    setIsEditing(true);
  };

  // Save Article
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      showToast("Please enter both title and body content.");
      return;
    }

    const tagList = formTags.split(",").map(t => t.trim()).filter(Boolean);

    const articlePayload = {
      title: formTitle,
      content: formContent,
      category_id: formCategory || undefined,
      category_name: store.knowledgeCategories.find(c => c.id === formCategory)?.name || "General",
      tags: tagList,
      image_url: formImg || undefined,
      video_url: formVideo || undefined,
      pdf_url: formPdfUrl || undefined,
      pdf_name: formPdfName || undefined,
      is_published: formPublished,
      is_featured: formFeatured
    };

    if (editId) {
      await store.updateKnowledgeArticle(editId, articlePayload);
      showToast("Knowledge article updated successfully!");
    } else {
      await store.addKnowledgeArticle(articlePayload);
      showToast("Help Center article published successfully!");
    }

    setIsEditing(false);
    setEditId(null);
  };

  // Delete Article
  const handleDeleteArticle = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" help guide?`)) {
      await store.deleteKnowledgeArticle(id);
      showToast("Article deleted successfully.");
      if (activeArticle?.id === id) setActiveArticle(null);
    }
  };

  // Add Category admin helper
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await store.addKnowledgeCategory(newCatName.trim(), newCatDesc.trim());
    setNewCatName("");
    setNewCatDesc("");
    showToast("Help category created!");
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Verify you want to remove this category? Articles under it will become General.")) {
      await store.deleteKnowledgeCategory(id);
      showToast("Category removed.");
    }
  };

  // Helper counters views and likes securely
  const handleViewArticle = (art: KnowledgeArticle) => {
    setActiveArticle(art);
    store.incrementArticleViews(art.id);
  };

  const handleLike = (id: string) => {
    store.incrementArticleLikes(id);
    if (activeArticle && activeArticle.id === id) {
      setActiveArticle({
        ...activeArticle,
        likes_count: (activeArticle.likes_count || 0) + 1
      });
    }
    showToast("Liked article support metric logged!");
  };

  // Filter Logic
  const savedSet = new Set(store.savedArticles.filter(sa => sa.user_id === user?.id).map(sa => sa.article_id));

  const filteredArticles = store.knowledgeArticles.filter(art => {
    // Only admins see unpublished guides
    if (!isAdmin && !art.is_published) return false;

    // Search query match
    const matchesSearch = 
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    // Tab category filter
    const matchesCategory = selectedCategory === "all" || art.category_id === selectedCategory;

    // Subtype tag filters
    let matchesSubtype = true;
    if (selectedSubTab === "faq") {
      matchesSubtype = art.tags?.includes("faq") || art.title.toLowerCase().includes("faq") || art.title.toLowerCase().startsWith("how");
    } else if (selectedSubTab === "tutorial") {
      matchesSubtype = art.tags?.includes("tutorial") || art.content.toLowerCase().includes("step-by-step") || !!art.video_url;
    } else if (selectedSubTab === "guide") {
      matchesSubtype = art.tags?.includes("guide") || art.tags?.includes("workflow");
    } else if (selectedSubTab === "trouble") {
      matchesSubtype = art.tags?.includes("troubleshooting") || art.content.toLowerCase().includes("error") || art.content.toLowerCase().includes("fix");
    } else if (selectedSubTab === "saved") {
      matchesSubtype = savedSet.has(art.id);
    }

    return matchesSearch && matchesCategory && matchesSubtype;
  });

  // Calculate related articles
  const relatedArticles = activeArticle 
    ? store.knowledgeArticles
        .filter(art => art.id !== activeArticle.id && art.category_id === activeArticle.category_id && art.is_published)
        .slice(0, 3)
    : [];

  return (
    <div className="space-y-8 text-left w-full">
      {/* Toast alert indicator */}
      {toastMsg && (
        <div className="fixed top-24 right-8 z-[9999] bg-slate-900 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-mono">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header section with Glassmorphism Search */}
      <div className="relative p-6 md:p-8 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2 md:max-w-xl">
          <span className="text-xs font-mono uppercase bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-md font-semibold border border-amber-500/20">
            SYSTEM KNOWLEDGE DESK
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-medium tracking-tight text-white">
            Support Center & Knowledge Base
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
            Search our curated guides, tutorials, FAQ structures, troubleshooting files, and direct system procedures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={openCreateForm}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-mono font-medium tracking-wider uppercase shadow-lg shadow-teal-500/10 flex items-center space-x-1.5 focus:outline-none transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Article</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: Left Search + Categories / Right Content results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar panels (Index filters) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Quick Search Widget */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block pl-1">Search Keywords</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Fuzzy search titles, tags..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Quick Subtypes tabs */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block pl-1 mb-2">Article Type</label>
            {[
              { id: "all", label: "Show All Articles", icon: BookOpen },
              { id: "faq", label: "Browse FAQs Center", icon: HelpCircle },
              { id: "tutorial", label: "Interactive Tutorials", icon: Video },
              { id: "guide", label: "Standard Operations", icon: FileText },
              { id: "trouble", label: "Troubleshooting", icon: AlertCircle },
              { id: "saved", label: "My Saved Articles", icon: BookmarkCheck }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedSubTab(tab.id as any)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-xs rounded-lg transition-all ${
                    selectedSubTab === tab.id 
                      ? "bg-amber-500/15 text-amber-300 border border-amber-500/20" 
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Categories index card */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between pl-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">Category Filter</label>
            </div>
            
            <button
              onClick={() => setSelectedCategory("all")}
              className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-all ${
                selectedCategory === "all" ? "text-amber-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              • All Domains ({store.knowledgeArticles.length})
            </button>

            {store.knowledgeCategories.map(cat => {
              const count = store.knowledgeArticles.filter(art => art.category_id === cat.id).length;
              return (
                <div key={cat.id} className="flex items-center justify-between group">
                  <button
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-left px-3 py-1.5 text-xs rounded-lg transition-all truncate flex-1 ${
                      selectedCategory === cat.id ? "text-amber-400 font-bold" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    • {cat.name} ({count})
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-opacity"
                      title="Delete category"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Admin Add Category */}
            {isAdmin && (
              <form onSubmit={handleAddCategory} className="border-t border-slate-800/60 pt-3 mt-3 space-y-2">
                <input
                  type="text"
                  placeholder="New Category Name..."
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-[11px] text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono uppercase rounded text-slate-300"
                >
                  Add Category
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Content list block */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Active Article Viewer (Overlay Detail) */}
          {activeArticle ? (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-6 relative">
              <button
                onClick={() => setActiveArticle(null)}
                className="absolute top-4 right-4 text-xs font-mono p-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
              >
                ← Back to List
              </button>

              {/* Title & metadata panel */}
              <div className="space-y-3 max-w-xl">
                <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-[10px] font-mono uppercase rounded text-amber-400">
                  {store.knowledgeCategories.find(c => c.id === activeArticle.category_id)?.name || "General"}
                </span>
                <h3 className="text-2xl font-display font-bold text-white">{activeArticle.title}</h3>
                
                <div className="flex items-center space-x-4 text-xs text-slate-400 font-mono">
                  <span className="flex items-center"><Eye className="w-3.5 h-3.5 mr-1" /> {activeArticle.views_count || 0} hits</span>
                  <span className="flex items-center"><ThumbsUp className="w-3.5 h-3.5 mr-1 text-sky-400" /> {activeArticle.likes_count || 0} endorsements</span>
                  <span>Published: {new Date(activeArticle.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Tags */}
              {activeArticle.tags && activeArticle.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {activeArticle.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-950 text-[10px] font-mono rounded text-slate-400 border border-slate-800 uppercase tracking-widest">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Article Content Display */}
              <div className="prose prose-invert bg-slate-950 p-6 rounded-xl border border-slate-800 text-slate-300 whitespace-pre-wrap text-[13px] leading-relaxed font-sans font-light">
                {activeArticle.content}
              </div>

              {/* Media & Attachments */}
              {(activeArticle.video_url || activeArticle.pdf_url) && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-white pl-1">Media & Companion Files</h4>
                  <div className="flex flex-wrap gap-4">
                    {activeArticle.video_url && (
                      <a
                        href={activeArticle.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center px-3 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs hover:bg-blue-500/20 transition-all font-mono"
                      >
                        <Video className="w-4 h-4 mr-1.5" />
                        <span>Watch Tutorial Clip</span>
                      </a>
                    )}
                    {activeArticle.pdf_url && (
                      <a
                        href={activeArticle.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center px-3 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs hover:bg-emerald-500/20 transition-all font-mono"
                      >
                        <Download className="w-4 h-4 mr-1.5" />
                        <span>Download PDF: {activeArticle.pdf_name || "Attachment"}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Actions panel */}
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleLike(activeArticle.id)}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-colors focus:outline-none"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Recommend ({activeArticle.likes_count})</span>
                  </button>

                  <button
                    onClick={() => {
                      store.toggleSavedArticle(activeArticle.id);
                      showToast(savedSet.has(activeArticle.id) ? "Removed from Favorites" : "Added to Saved Guides!");
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-colors focus:outline-none ${
                      savedSet.has(activeArticle.id) 
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" 
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{savedSet.has(activeArticle.id) ? "Saved Article" : "Save / Bookmark"}</span>
                  </button>
                </div>

                {isAdmin && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditForm(activeArticle)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Article"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(activeArticle.id, activeArticle.title)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete Article"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Related Section articles */}
              {relatedArticles.length > 0 && (
                <div className="border-t border-slate-800/80 pt-6 space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 pl-1">Related Companion Works</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {relatedArticles.map(rel => (
                      <button
                        key={rel.id}
                        onClick={() => handleViewArticle(rel)}
                        className="p-3 bg-slate-950/80 hover:bg-slate-950 border border-slate-800/80 rounded-lg text-left transition-all space-y-1 group"
                      >
                        <p className="text-xs font-medium text-slate-200 group-hover:text-amber-400 truncate">{rel.title}</p>
                        <p className="text-[10px] text-slate-500 truncate">{rel.content.slice(0, 60)}...</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* List grid view */
            <div className="space-y-4">
              <div className="flex justify-between items-center pl-1 font-mono text-xs text-slate-400">
                <span>Displaying {filteredArticles.length} matching guides</span>
                <span>Sorted chronologically</span>
              </div>

              {filteredArticles.length === 0 ? (
                <div className="p-12 text-center bg-slate-900/20 border border-slate-800 rounded-xl space-y-2">
                  <HelpCircle className="w-12 h-12 text-slate-700 mx-auto" />
                  <p className="text-base text-slate-400">No help base articles match your query parameters.</p>
                  <p className="text-xs text-slate-500">Contact our specialist line directly for customized assistance.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredArticles.map(art => {
                    const countSaved = savedSet.has(art.id);
                    return (
                      <div
                        key={art.id}
                        className="p-5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-800 rounded-xl flex flex-col justify-between space-y-4 transition-all group"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md border border-slate-700/50 truncate max-w-[150px]">
                              {store.knowledgeCategories.find(c => c.id === art.category_id)?.name || "General"}
                            </span>

                            <div className="flex items-center space-x-1.5">
                              {countSaved && <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />}
                              {art.is_featured && <span className="text-[9px] font-mono text-cyan-400 border border-cyan-500/20 bg-cyan-500/5 px-1.5 py-0.5 rounded font-bold uppercase">FEATURED</span>}
                              {!art.is_published && <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 px-1 rounded">DRAFT</span>}
                            </div>
                          </div>

                          <h4 
                            onClick={() => handleViewArticle(art)}
                            className="text-base font-display font-semibold text-slate-100 group-hover:text-amber-400 cursor-pointer transition-colors"
                          >
                            {art.title}
                          </h4>

                          <p className="text-xs text-slate-450 opacity-80 leading-relaxed max-w-sm line-clamp-2">
                            {art.content}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-800/40 text-[10px] font-mono text-slate-500">
                          <div className="flex items-center space-x-3.5">
                            <span className="flex items-center"><Eye className="w-3 h-3 mr-1" /> {art.views_count || 0} hits</span>
                            <span className="flex items-center"><ThumbsUp className="w-3 h-3 mr-1" /> {art.likes_count || 0} likes</span>
                          </div>

                          <button
                            onClick={() => handleViewArticle(art)}
                            className="text-xs text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center space-x-1 pl-3 py-1"
                          >
                            <span>Read guide</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ADMIN CONSOLE/MODAL EDIT FOR ARTICLES */}
      {isEditing && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-lg font-display font-bold text-white">{editId ? "Edit KB Knowledge Article" : "Write System Knowledge Article"}</h4>
              <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-slate-800 rounded">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Article Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="e.g. How to connect external Stripe API"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Core Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none"
                  >
                    <option value="">No Domain / General</option>
                    {store.knowledgeCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Article Content / Body markdown text</label>
                <textarea
                  rows={8}
                  required
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  placeholder="Support detailed procedural lines. Enter guides details here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white font-sans focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Fuzzy Tags (Comma Separated)</label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={e => setFormTags(e.target.value)}
                    placeholder="faq, setup, guidelines, billing"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Mock Preview Image URL</label>
                  <input
                    type="text"
                    value={formImg}
                    onChange={e => setFormImg(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Video companion URL</label>
                  <input
                    type="text"
                    value={formVideo}
                    onChange={e => setFormVideo(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">PDF URL Attachment</label>
                  <input
                    type="text"
                    value={formPdfUrl}
                    onChange={e => setFormPdfUrl(e.target.value)}
                    placeholder="https://diavox.com/doc.pdf"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">PDF File Name</label>
                  <input
                    type="text"
                    value={formPdfName}
                    onChange={e => setFormPdfName(e.target.value)}
                    placeholder="e.g. stripe_docs_en.pdf"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6 py-2">
                <label className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                  <input
                    type="checkbox"
                    checked={formPublished}
                    onChange={e => setFormPublished(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                  />
                  <span>Publish article live</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={e => setFormFeatured(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                  />
                  <span>Pin as Featured guide</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 border-t border-slate-800/80 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-mono font-bold"
                >
                  {editId ? "Update Article" : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple absolute cross-icon helper imports for modal close
function X(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
