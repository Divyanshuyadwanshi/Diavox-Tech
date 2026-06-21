import React, { useState } from "react";
import { useStore } from "../../store";
import { Blog } from "../../types";
import { Plus, Edit2, Trash2, FileText, X, Upload, Loader2 } from "lucide-react";
import { uploadFileToBucket } from "../../supabase";

export default function AdminBlogs() {
  const { blogs, addBlog, updateBlog, deleteBlog, theme } = useStore();
  
  // Local interface form state
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"Web Development" | "SEO" | "AI" | "Business Growth" | "Automation">("Web Development");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop");

  const [filterCategory, setFilterCategory] = useState("All");

  const resetForm = () => {
    setTitle("");
    setCategory("Web Development");
    setContent("");
    setImageUrl("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop");
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
      const filePath = `blog_${Date.now()}_${Math.random().toString(36).substring(4)}.${extension}`;
      const url = await uploadFileToBucket("blog-images", filePath, file);
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
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const read_time = `${Math.ceil(content.split(/\s+/).length / 200) || 1} min read`;
    
    const blogData = {
      title,
      slug,
      content,
      category,
      author_name: "Diavox Tech Admin",
      image_url: imageUrl,
      read_time,
    };

    const saveBlog = async () => {
      try {
        if (editingId) {
          await updateBlog(editingId, blogData);
        } else {
          await addBlog(blogData);
        }
        resetForm();
      } catch (err: any) {
        console.error("[ADMIN BLOG] Submission failed:", err);
        alert("Failed to save blog post: " + (err.message || err));
      }
    };
    saveBlog();
  };

  const handleEdit = (blog: Blog) => {
    setEditingId(blog.id);
    setTitle(blog.title);
    setCategory(blog.category);
    setContent(blog.content);
    setImageUrl(blog.image_url || "");
    setIsAdding(true);
  };

  const filteredBlogs = filterCategory === "All" 
    ? blogs 
    : blogs.filter(b => b.category === filterCategory);

  const categories: Array<"Web Development" | "SEO" | "AI" | "Business Growth" | "Automation"> = [
    "Web Development",
    "SEO",
    "AI",
    "Business Growth",
    "Automation"
  ];

  return (
    <div className="space-y-6 text-left animate-fade-in" id="admin-blogs-main">
      <div className="flex items-center justify-between" id="admin-blogs-header">
        <div>
          <h4 className="text-sm font-mono tracking-widest text-cyan-400 font-bold uppercase">EDITORIAL SUITE</h4>
          <h3 className="text-lg font-display font-bold">Blog Management</h3>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold inline-flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-500/10 cursor-pointer"
            id="btn-add-blog"
          >
            <Plus size={14} />
            <span>Create Blog Post</span>
          </button>
        )}
      </div>

      {isAdding ? (
        <form onSubmit={handleSubmit} className={`p-6 rounded-2xl border ${
          theme === "dark" ? "bg-slate-950 border-slate-900" : "bg-white border-slate-200 shadow-sm"
        }`} id="blog-form">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-display font-bold text-cyan-400">
              {editingId ? "Edit Blog Article" : "Compose New Article"}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Article Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 5 Core Pillars of High-Speed Website Engineering"
                className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-800 focus:border-cyan-500 text-white" 
                    : "bg-white border-slate-200 focus:border-cyan-500 text-slate-900"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-800 focus:border-cyan-500 text-white" 
                    : "bg-white border-slate-200 focus:border-cyan-500 text-slate-900"
                }`}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Cover Image / Banner Photo</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="URL of cover banner photo..."
                  className={`flex-1 p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                    theme === "dark" 
                      ? "bg-slate-900 border-slate-800 focus:border-cyan-500 text-white" 
                      : "bg-white border-slate-200 focus:border-cyan-500 text-slate-900"
                  }`}
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
                  <img src={imageUrl} alt="Preview" className="w-16 h-10 object-cover rounded-md border border-slate-800" referrerPolicy="no-referrer" />
                  <span className="text-[10px] font-mono text-emerald-400">Preview Sync Active</span>
                </div>
              )}
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Full Article Content (Markdown supported)</label>
              <textarea
                required
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write full high-speed editorial post content..."
                className={`w-full p-3 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-800 focus:border-cyan-500 text-white" 
                    : "bg-white border-slate-200 focus:border-cyan-500 text-slate-900"
                }`}
              />
            </div>

            <div className="col-span-1 md:col-span-2 flex items-center justify-end border-t border-slate-850 pt-4 mt-2">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl border dark:border-slate-800 border-slate-205 hover:bg-slate-500/10 font-mono text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-md shadow-cyan-500/10 cursor-pointer"
                >
                  {editingId ? "Save Changes" : "Publish Article"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {/* Categories Filter tab row */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1" id="blogs-filter">
            <button
              onClick={() => setFilterCategory("All")}
              className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase shrink-0 transition-colors cursor-pointer ${
                filterCategory === "All" ? "bg-cyan-500 text-white" : "bg-slate-500/10 text-slate-400 hover:text-white"
              }`}
            >
              All Blogs
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase shrink-0 transition-colors cursor-pointer ${
                  filterCategory === cat ? "bg-cyan-500 text-white" : "bg-slate-500/10 text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredBlogs.length === 0 ? (
            <div className="text-center p-12 border border-dashed rounded-2xl dark:border-slate-800">
              <FileText className="mx-auto text-slate-500 opacity-50 mb-3" size={24} />
              <p className="text-xs font-mono text-slate-500">No blog posts found under this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 ${
                    theme === "dark" ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-100 shadow-sm"
                  }`}
                >
                  <div>
                    <div className="relative h-36 w-full rounded-lg overflow-hidden mb-3">
                      <img 
                        src={blog.image_url} 
                        alt={blog.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                      />
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 rounded text-[8px] font-mono uppercase bg-slate-950/80 text-cyan-400 font-bold">
                          {blog.category}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-xs font-mono font-bold text-slate-400 mb-1">
                      {new Date(blog.created_at).toLocaleDateString()} • {blog.read_time}
                    </h4>
                    <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white leading-snug">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-450 mt-1.5 line-clamp-2 leading-relaxed">
                      {blog.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t dark:border-slate-800 border-slate-100">
                    <span className="text-[10px] font-mono text-slate-500">
                      By {blog.author_name}
                    </span>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleEdit(blog)}
                        className="p-1.5 rounded-lg text-yellow-500 hover:bg-yellow-500/10 bg-slate-500/5 transition-all cursor-pointer"
                        title="Edit Article"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm("Are you sure you want to delete this post?")) {
                            try {
                              await deleteBlog(blog.id);
                            } catch (err: any) {
                              console.error("[ADMIN BLOG] Deletion failed:", err);
                              alert("Failed to delete blog post: " + (err.message || err));
                            }
                          }
                        }}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 bg-slate-500/5 transition-all cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
