import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../store";
import { 
  Search, X, Briefcase, User, Calendar, BookOpen, Layers, FileText, 
  CreditCard, MessageSquare, HelpCircle, ArrowRight, ShieldCheck, Clock, Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GlobalCommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (id: string, params?: any) => void;
}

export default function GlobalCommandCenter({ isOpen, onClose, onNavigate }: GlobalCommandCenterProps) {
  const store = useStore();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "projects" | "people" | "help" | "billing" | "chats">("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("diavox_recent_searches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not load recent searches", e);
    }
  }, []);

  // Autofocus input
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Save a query to recents
  const addRecentSearch = (q: string) => {
    if (!q.trim()) return;
    const filtered = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
    setRecentSearches(filtered);
    localStorage.setItem("diavox_recent_searches", JSON.stringify(filtered));
  };

  const removeRecentSearch = (s: string) => {
    const filtered = recentSearches.filter(item => item !== s);
    setRecentSearches(filtered);
    localStorage.setItem("diavox_recent_searches", JSON.stringify(filtered));
  };

  if (!isOpen) return null;

  const currentUser = store.currentUser;
  const isAdmin = currentUser && [
    "secret_admin", "primary_admin", "secondary_admin", "third_admin", "developer"
  ].includes(currentUser.role);

  // Normalize query for quick search
  const term = query.toLowerCase().trim();

  // Categories definition
  const searchResults: {
    category: string;
    items: {
      id: string;
      title: string;
      subtitle: string;
      type: string;
      meta?: string;
      icon: any;
      onClick: () => void;
    }[];
  }[] = [];

  // 1. Projects
  const projectsFiltered = store.projects.filter(p => 
    p.title.toLowerCase().includes(term) || p.description.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)
  );
  if (projectsFiltered.length > 0 && (activeTab === "all" || activeTab === "projects")) {
    searchResults.push({
      category: "Projects",
      items: projectsFiltered.map(p => ({
        id: p.id,
        title: p.title,
        subtitle: `${p.category} • Progress: ${p.progress}%`,
        type: "Project",
        meta: p.status,
        icon: Briefcase,
        onClick: () => {
          addRecentSearch(p.title);
          onClose();
          if (onNavigate) onNavigate("projects", { projectId: p.id });
        }
      }))
    });
  }

  // 2. Clients & Users
  const peopleFiltered = store.allUsers.filter(u => 
    u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || (u.role && u.role.toLowerCase().includes(term))
  );
  if (peopleFiltered.length > 0 && (activeTab === "all" || activeTab === "people")) {
    searchResults.push({
      category: "Team & Clients",
      items: peopleFiltered.map(u => ({
        id: u.id,
        title: u.name,
        subtitle: `${u.email} • Role: ${u.role.replace("_", " ")}`,
        type: "Person",
        icon: User,
        onClick: () => {
          addRecentSearch(u.name);
          onClose();
          if (onNavigate) onNavigate("people", { userId: u.id });
        }
      }))
    });
  }

  // 3. Knowledge Base Articles
  const kbFiltered = store.knowledgeArticles.filter(a => 
    a.title.toLowerCase().includes(term) || a.content.toLowerCase().includes(term) || (a.tags && a.tags.some(t => t.toLowerCase().includes(term)))
  );
  if (kbFiltered.length > 0 && (activeTab === "all" || activeTab === "help")) {
    searchResults.push({
      category: "Help Articles",
      items: kbFiltered.map(a => ({
        id: a.id,
        title: a.title,
        subtitle: `${a.is_published ? "Published" : "Draft"} • ${a.views_count} views • ${a.likes_count} likes`,
        type: "Knowledge KB",
        icon: BookOpen,
        onClick: () => {
          addRecentSearch(a.title);
          onClose();
          if (onNavigate) onNavigate("help", { articleId: a.id });
        }
      }))
    });
  }

  // 4. Portfolio Items
  const portfolioFiltered = store.portfolioItems.filter(p => 
    p.title.toLowerCase().includes(term) || p.description.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)
  );
  if (portfolioFiltered.length > 0 && (activeTab === "all" || activeTab === "projects")) {
    searchResults.push({
      category: "Portfolio Showcase",
      items: portfolioFiltered.map(p => ({
        id: p.id,
        title: p.title,
        subtitle: `${p.category} ${p.is_featured ? "• Featured" : ""}`,
        type: "Portfolio",
        icon: Layers,
        onClick: () => {
          addRecentSearch(p.title);
          onClose();
          if (onNavigate) onNavigate("portfolio", { id: p.id });
        }
      }))
    });
  }

  // 5. Contracts, Quotes, Invoices
  const billingItems: any[] = [];
  store.contracts.filter(c => c.client_name.toLowerCase().includes(term) || c.project_title.toLowerCase().includes(term)).forEach(c => {
    billingItems.push({
      id: c.id,
      title: `Contract: ${c.project_title}`,
      subtitle: `Client: ${c.client_name} • Value: ${c.price}`,
      type: "Contract",
      meta: c.status,
      icon: FileText,
      onClick: () => {
        addRecentSearch(c.project_title);
        onClose();
        if (onNavigate) onNavigate("billing", { type: "contract", id: c.id });
      }
    });
  });

  store.invoices.filter(i => i.client_name.toLowerCase().includes(term) || (i.services && i.services.toLowerCase().includes(term))).forEach(i => {
    billingItems.push({
      id: i.id,
      title: `Invoice #${i.invoice_number} - ${i.services}`,
      subtitle: `Amount: $${i.amount} • Due: ${i.due_date}`,
      type: "Invoice",
      meta: i.status,
      icon: CreditCard,
      onClick: () => {
        addRecentSearch(i.services);
        onClose();
        if (onNavigate) onNavigate("billing", { type: "invoice", id: i.id });
      }
    });
  });

  store.requests.filter(r => r.client_name.toLowerCase().includes(term) || r.service_type.toLowerCase().includes(term) || r.description.toLowerCase().includes(term)).forEach(r => {
    billingItems.push({
      id: r.id,
      title: `Quote: ${r.service_type}`,
      subtitle: `Budget: ${r.budget || "TBD"} • Status: ${r.status}`,
      type: "Quote / Request",
      meta: r.status,
      icon: HelpCircle,
      onClick: () => {
        addRecentSearch(r.service_type);
        onClose();
        if (onNavigate) onNavigate("quotes", { id: r.id });
      }
    });
  });

  if (billingItems.length > 0 && (activeTab === "all" || activeTab === "billing")) {
    searchResults.push({
      category: "Billing, Contracts & Quotes",
      items: billingItems
    });
  }

  // 6. Chats & Messages
  const chatsItems: any[] = [];
  store.teamMessages.filter(m => m.message_text.toLowerCase().includes(term) || m.sender_name.toLowerCase().includes(term)).slice(0, 10).forEach(m => {
    chatsItems.push({
      id: m.id,
      title: `Team Message: "${m.message_text.slice(0, 60)}${m.message_text.length > 60 ? "..." : ""}"`,
      subtitle: `Sent by: ${m.sender_name} (${m.sender_role})`,
      type: "Channel Chat",
      icon: MessageSquare,
      onClick: () => {
         addRecentSearch(m.message_text);
         onClose();
         if (onNavigate) onNavigate("chats", { type: "team", id: m.group_id });
      }
    });
  });

  store.privateMessages.filter(m => m.message_text.toLowerCase().includes(term) || m.sender_name.toLowerCase().includes(term)).slice(0, 10).forEach(m => {
    chatsItems.push({
      id: m.id,
      title: `Direct PM: "${m.message_text.slice(0, 60)}${m.message_text.length > 60 ? "..." : ""}"`,
      subtitle: `From: ${m.sender_name}`,
      type: "Private DM",
      icon: MessageSquare,
      onClick: () => {
         addRecentSearch(m.message_text);
         onClose();
         if (onNavigate) onNavigate("chats", { type: "private", id: m.sender_id });
      }
    });
  });

  if (chatsItems.length > 0 && (activeTab === "all" || activeTab === "chats")) {
    searchResults.push({
      category: "Chats, Messages & Threads",
      items: chatsItems
    });
  }

  // 7. Administrations Only search index (Activity LOGS, audit logs, notifications)
  if (isAdmin) {
    const adminItems: any[] = [];
    store.activityLogs.filter(log => log.action.toLowerCase().includes(term) || (log.previous_value && log.previous_value.toLowerCase().includes(term)) || (log.new_value && log.new_value.toLowerCase().includes(term))).slice(0, 10).forEach(log => {
      adminItems.push({
        id: log.id,
        title: `Audit Activity: ${log.action}`,
        subtitle: `${log.timestamp} • Prev: ${log.previous_value || "-"} • Next: ${log.new_value || "-"}`,
        type: "Audit Log",
        icon: ShieldCheck,
        onClick: () => {
          onClose();
          if (onNavigate) onNavigate("audit", { id: log.id });
        }
      });
    });

    store.userActivities.filter(act => act.action.toLowerCase().includes(term) || (act.details && act.details.toLowerCase().includes(term))).slice(0, 10).forEach(act => {
      adminItems.push({
        id: act.id,
        title: `User Log: ${act.action}`,
        subtitle: `${act.user_name} (${act.user_role}) • Category: ${act.category}`,
        type: "User Activity Log",
        icon: Clock,
        onClick: () => {
          onClose();
          if (onNavigate) onNavigate("audit", { id: act.id });
        }
      });
    });

    if (adminItems.length > 0 && activeTab === "all") {
      searchResults.push({
        category: "System logs & Governance (Admin Only)",
        items: adminItems
      });
    }
  }

  const hasResults = searchResults.some(cat => cat.items.length > 0);

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 px-4 md:px-0">
      {/* Background dimmer backdrop overlay */}
      <motion.div 
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950 backdrop-blur-sm"
      />

      {/* Floating search card container */}
      <motion.div
        key="modal"
        initial={{ scale: 0.95, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -20 }}
        transition={{ duration: 0.15 }}
        ref={containerRef}
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col text-slate-100"
      >
        {/* Input box */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type query to filter projects, services, tickets..."
            className="w-full bg-transparent text-white border-0 outline-none text-base placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-1 hover:bg-slate-800 rounded text-slate-400 focus:outline-none">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="p-1 px-2.5 ml-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono uppercase tracking-widest focus:outline-none">
            ESC
          </button>
        </div>

        {/* Tab filters */}
        <div className="flex items-center space-x-1 px-4 py-2 bg-slate-900/60 border-b border-slate-800 overflow-x-auto text-xs">
          {[
            { id: "all", label: "All Index" },
            { id: "projects", label: "Projects" },
            { id: "people", label: "Team & Clients" },
            { id: "help", label: "Help Articles" },
            { id: "billing", label: "Billing & Invoices" },
            { id: "chats", label: "Chats" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all uppercase font-mono text-[10px] tracking-wider ${
                activeTab === tab.id 
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                  : "text-slate-400 hover:bg-slate-800 border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content lists */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[50vh]">
          {/* Recent searches when input is empty */}
          {!query && (
            <div className="space-y-4">
              {recentSearches.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-2 pl-1">Recent Searches</h4>
                  <div className="space-y-1">
                    {recentSearches.map((search, i) => (
                      <div key={i} className="flex items-center justify-between group px-2 py-1.5 hover:bg-slate-800 rounded-lg text-sm text-slate-300 transition-colors">
                        <button 
                          onClick={() => setQuery(search)} 
                          className="flex items-center text-left w-full focus:outline-none"
                        >
                          <Search className="w-3.5 h-3.5 text-slate-500 mr-2" />
                          <span>{search}</span>
                        </button>
                        <button 
                          onClick={() => removeRecentSearch(search)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-700 rounded text-slate-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div>
                <h4 className="text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-2 pl-1">Suggested Targets & Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { label: "Request Custom Service Quote", search: "Quote" },
                    { label: "Check Help FAQ Center", search: "Introduction" },
                    { label: "Active Project Workspaces", search: "Platform" },
                    { label: "Team Members rosters", search: "sales" },
                    { label: "Bespoke pricing options", search: "expert" }
                  ].map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuery(s.search);
                        addRecentSearch(s.label);
                      }}
                      className="flex items-center justify-between p-2.5 bg-slate-800/40 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs transition-colors group"
                    >
                      <span className="text-slate-300 group-hover:text-white transition-colors">{s.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Matches lists */}
          {query && hasResults && (
            <div className="space-y-4">
              {searchResults.map((cat, catIdx) => (
                <div key={catIdx} className="space-y-1.5">
                  <h4 className="text-[10px] font-mono tracking-widest uppercase text-amber-400/80 pl-1">{cat.category}</h4>
                  <div className="space-y-1">
                    {cat.items.map((item, itemIdx) => {
                      const Icon = item.icon || Search;
                      return (
                        <button
                          key={itemIdx}
                          onClick={item.onClick}
                          className="w-full flex items-center justify-between text-left p-2.5 hover:bg-slate-800/80 rounded-lg transition-colors border border-transparent hover:border-slate-800 group"
                        >
                          <div className="flex items-center min-w-0 pr-4">
                            <div className="p-2 bg-slate-800 rounded-lg text-slate-300 group-hover:bg-amber-500/10 group-hover:text-amber-400 mr-3 transition-colors">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-200 group-hover:text-white truncate">{item.title}</p>
                              <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-slate-800 text-[9px] font-mono rounded text-slate-400 border border-slate-700/50 uppercase tracking-widest whitespace-nowrap">
                              {item.type}
                            </span>
                            {item.meta && (
                              <span className={`px-2 py-0.5 text-[9px] font-mono rounded border uppercase tracking-widest whitespace-nowrap ${
                                ["success", "Signed", "Active", "paid", "Completed", "Approved"].includes(item.meta)
                                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              }`}>
                                {item.meta}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results message */}
          {query && !hasResults && (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <HelpCircle className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-base font-medium">No results found for "{query}"</p>
              <p className="text-xs">Try selecting a different filter tab or refining your query.</p>
            </div>
          )}
        </div>

        {/* Footer help layout */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center"><span className="p-1 px-1.5 bg-slate-900 border border-slate-800 rounded text-slate-300 mr-1">↑↓</span> Move</span>
            <span className="flex items-center"><span className="p-1 px-1.5 bg-slate-900 border border-slate-800 rounded text-slate-300 mr-1">Enter</span> Open target</span>
          </div>
          <p className="hidden md:block">Diavox Enterprise Core Indexer v2.0</p>
        </div>
      </motion.div>
    </div>
  );
}
