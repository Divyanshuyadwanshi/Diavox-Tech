import React, { useState } from "react";
import { useStore } from "../../store";
import { PortfolioItem } from "../../types";
import { Plus, Edit2, Trash2, Globe, Star, X, Link, Upload, Loader2 } from "lucide-react";
import { uploadFileToBucket } from "../../supabase";

export default function AdminPortfolio() {
  const { portfolioItems, addPortfolioItem, updatePortfolioItem, deletePortfolioItem, theme } = useStore();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Form states variables
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Website Development");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=800&auto=format&fit=crop");
  const [liveUrl, setLiveUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(true);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("Website Development");
    setImageUrl("https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=800&auto=format&fit=crop");
    setLiveUrl("");
    setIsFeatured(true);
    setIsAdding(false);
    setEditingId(null);
    setUploadError("");
    setIsUploading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");
    try {
      const extension = file.name.split(".").pop();
      const filePath = `portfolio_${Date.now()}_${Math.random().toString(36).substring(4)}.${extension}`;
      const url = await uploadFileToBucket("portfolio-images", filePath, file);
      setImageUrl(url);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Upload failed. Check bucket permissions.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemData = {
      title,
      description,
      category,
      image_url: imageUrl,
      live_url: liveUrl,
      is_featured: isFeatured
    };

    if (editingId) {
      updatePortfolioItem(editingId, itemData);
    } else {
      addPortfolioItem(itemData);
    }
    resetForm();
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setCategory(item.category);
    setImageUrl(item.image_url);
    setLiveUrl(item.live_url || "");
    setIsFeatured(item.is_featured);
    setIsAdding(true);
  };

  const categories = ["Website Development", "Website Design", "SEO Automation", "Custom Software", "High-Utility Assets"];

  return (
    <div className="space-y-6 text-left" id="admin-portfolio-main">
      <div className="flex items-center justify-between" id="admin-portfolio-header">
        <div>
          <h4 className="text-sm font-mono tracking-widest text-cyan-400 font-bold uppercase">DISPLAY CASE</h4>
          <h3 className="text-lg font-display font-bold">Portfolio Showcase</h3>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold inline-flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-500/10"
            id="btn-add-pitem"
          >
            <Plus size={14} />
            <span>Add Showcase Item</span>
          </button>
        )}
      </div>

      {isAdding ? (
        <form onSubmit={handleSubmit} className={`p-6 rounded-2xl border text-left space-y-4 ${
          theme === "dark" ? "bg-slate-950 border-slate-900" : "bg-white border-slate-200 shadow-sm"
        }`} id="portfolio-form">
          <div className="flex justify-between items-center pb-2 border-b dark:border-slate-900 border-slate-100">
            <h4 className="text-sm font-display font-bold text-cyan-400">
              {editingId ? "Edit Showcase Item" : "Create Showcase Item"}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 rounded-full hover:bg-slate-500/10 text-slate-400 hover:text-white transition-all"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 col-span-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Showcase Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Apex e-commerce Hub..."
                className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-800 focus:border-cyan-50 w-full text-white" 
                    : "bg-white border-slate-205 focus:border-cyan-500 text-slate-900"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-800 focus:border-cyan-50 w-full text-white" 
                    : "bg-white border-slate-200 focus:border-cyan-500 text-slate-900"
                }`}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Image Asset / Cover photo</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className={`flex-1 p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                    theme === "dark" 
                      ? "bg-slate-900 border-slate-800 focus:border-cyan-50 text-white" 
                      : "bg-white border-slate-200 focus:border-cyan-500 text-slate-900"
                  }`}
                  placeholder="Paste URL or upload image..."
                />
                <label className="relative flex items-center justify-center p-2.5 rounded-xl border border-dashed border-cyan-500/40 cursor-pointer bg-cyan-950/10 hover:bg-cyan-500/10 text-cyan-400 transition-colors">
                  {isUploading ? (
                    <Loader2 size={16} className="animate-spin text-cyan-400" />
                  ) : (
                    <Upload size={16} />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>
              {uploadError && (
                <p className="text-[10px] text-red-400 font-mono mt-0.5">{uploadError}</p>
              )}
              {imageUrl && (
                <div className="mt-1.5 flex items-center space-x-2">
                  <img src={imageUrl} alt="Preview" className="w-10 h-10 object-cover rounded-md border border-slate-800" referrerPolicy="no-referrer" />
                  <span className="text-[10px] font-mono text-emerald-400">Preview Sync Active</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Live Link / Website URL</label>
              <input
                type="text"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://apex-luxury.com"
                className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-800 focus:border-cyan-50 w-full text-white" 
                    : "bg-white border-slate-205 focus:border-cyan-500 text-slate-900"
                }`}
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Showcase Excerpt / Details</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Highlight aesthetic parameters, headless structures, and conversion metric improvements..."
                className={`w-full p-3 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-800 focus:border-cyan-50 w-full text-white" 
                    : "bg-white border-slate-200 focus:border-cyan-500 text-slate-900"
                }`}
              />
            </div>

            <div className="col-span-1 md:col-span-2 flex items-center justify-between border-t border-slate-850 pt-4 mt-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="chk-featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded dark:bg-slate-950 border-slate-800 accent-cyan-405"
                />
                <label htmlFor="chk-featured" className="text-xs font-mono font-bold text-slate-400 cursor-pointer">
                  Feature prominently on static showcase
                </label>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl border dark:border-slate-800 border-slate-205 hover:bg-slate-500/10 font-mono text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-md shadow-cyan-500/10"
                >
                  {editingId ? "Save Changes" : "Create Item"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolioItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                theme === "dark" ? "bg-slate-900/40 border-slate-805" : "bg-white border-slate-100 shadow-sm"
              }`}
            >
              <div>
                <div className="relative h-32 w-full rounded-lg overflow-hidden mb-3.5">
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                  {item.is_featured && (
                    <div className="absolute top-2 left-2 p-1.5 rounded-full bg-amber-500/90 text-white" title="Featured Project">
                      <Star size={10} className="fill-current" />
                    </div>
                  )}
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[8px] font-mono bg-slate-950/80 text-cyan-400 font-bold uppercase">
                    {item.category}
                  </span>
                </div>

                <h3 className="text-sm font-display font-semibold dark:text-white text-slate-900 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-850">
                {item.live_url ? (
                  <a
                    href={item.live_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-mono text-cyan-405 hover:underline inline-flex items-center space-x-1"
                  >
                    <Globe size={11} />
                    <span>Visit Live Site</span>
                  </a>
                ) : (
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Offline Showcase</span>
                )}

                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1.5 rounded bg-slate-500/5 hover:bg-slate-550/15 text-yellow-550"
                  >
                    <Edit2 size={11} />
                  </button>
                  <button
                    onClick={() => deletePortfolioItem(item.id)}
                    className="p-1.5 rounded bg-slate-500/5 hover:bg-slate-550/15 text-rose-500"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {portfolioItems.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-450 text-xs font-mono">
              No showcase cases recorded yet. Add an item above.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
