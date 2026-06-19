import React, { useState, useEffect } from "react";
import { useStore } from "../store";
import { 
  Briefcase, CheckCircle, Upload, FileText, ArrowRight,
  TrendingUp, CreditCard, Clock, MessageSquare, Plus, RefreshCw, Zap, Award, AlertCircle
} from "lucide-react";
import { TimelineEvent } from "../types";

interface TimelineCenterProps {
  mode: "client" | "admin";
  targetUserId?: string;
}

export default function TimelineCenter({ mode, targetUserId }: TimelineCenterProps) {
  const store = useStore();
  const theme = store.theme;
  const [filterType, setFilterType] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync state on load
  useEffect(() => {
    store.fetchHelpCenterData(); // ensures sync is current
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await store.syncSupabase();
    setIsRefreshing(false);
  };

  // Get raw list based on roles
  let list = [...store.timelineEvents];

  if (mode === "client" && store.currentUser) {
    // Clients see their own events OR general system releases
    const currentId = targetUserId || store.currentUser.id;
    list = list.filter(e => !e.user_id || e.user_id === currentId || e.user_id === "system");
  }

  // Filter types logic mapping
  const filteredEvents = list.filter(e => {
    if (filterType === "all") return true;
    if (filterType === "billing") return ["payment_completed", "invoice_generated", "subscription_renewed", "plan_activated"].includes(e.event_type);
    if (filterType === "projects") return ["project_created", "project_assigned", "milestone_completed"].includes(e.event_type);
    if (filterType === "documents") return ["contract_generated", "contract_signed", "file_uploaded", "quote_reply"].includes(e.event_type);
    if (filterType === "communication") return ["message_received", "quote_reply"].includes(e.event_type);
    return true;
  });

  // Unique icons picker for event types
  const getEventMeta = (type: string) => {
    switch (type) {
      case "project_created":
        return { icon: Plus, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
      case "project_assigned":
        return { icon: Briefcase, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" };
      case "milestone_completed":
        return { icon: Award, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" };
      case "file_uploaded":
        return { icon: Upload, color: "text-sky-400 bg-sky-500/10 border-sky-500/20" };
      case "contract_generated":
      case "contract_signed":
        return { icon: FileText, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" };
      case "invoice_generated":
        return { icon: FileText, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
      case "payment_completed":
        return { icon: CreditCard, color: "text-green-400 bg-green-500/10 border-green-500/20" };
      case "plan_activated":
      case "subscription_renewed":
        return { icon: Zap, color: "text-pink-400 bg-pink-500/10 border-pink-500/20" };
      case "quote_reply":
        return { icon: ArrowRight, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
      case "message_received":
      default:
        return { icon: MessageSquare, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
    }
  };

  // Human-readable names from event constants
  const formatEventType = (type: string) => {
    return type.replace(/_/g, " ").toUpperCase();
  };

  return (
    <div className="space-y-6 text-left w-full">
      
      {/* Top filter utility block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        
        {/* Category filter tabs */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: "all", label: "Full Activity feed" },
            { id: "projects", label: "Projects & Milestones" },
            { id: "billing", label: "Payments & Invoices" },
            { id: "documents", label: "Files & Contracts" },
            { id: "communication", label: "Quotes & Messages" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-mono uppercase tracking-widest text-[9px] transition-all border ${
                filterType === tab.id 
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Real-time sync badge */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 text-green-400 font-mono text-[10px]">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>SOCKET ON</span>
          </div>

          <button
            onClick={handleRefresh}
            className={`p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all focus:outline-none ${
              isRefreshing ? "animate-spin text-amber-400" : ""
            }`}
            title="Force refresh logs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid: Statistics cards above timeline for quick insights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Payments Completed", category: "payment_completed", amount: list.filter(e => e.event_type === "payment_completed").length, icon: CreditCard, col: "text-green-400" },
          { label: "Milestones Cleared", category: "milestone_completed", amount: list.filter(e => e.event_type === "milestone_completed").length, icon: CheckCircle, col: "text-purple-400" },
          { label: "Active Project Operations", category: "project_created", amount: list.filter(e => ["project_created", "project_assigned"].includes(e.event_type)).length, icon: Briefcase, col: "text-cyan-400" }
        ].map((stat, idx) => {
          const StatIcon = stat.icon;
          return (
            <div key={idx} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{stat.label}</span>
                <p className="text-xl font-bold font-mono text-white">{stat.amount} records</p>
              </div>
              <StatIcon className={`w-5 h-5 ${stat.col}`} />
            </div>
          );
        })}
      </div>

      {/* Primary Timeline tree list */}
      <div className="relative border-l border-slate-850 pl-5 sm:pl-8 space-y-6">
        {filteredEvents.length === 0 ? (
          <div className="py-12 text-center bg-slate-900/20 border border-slate-800 rounded-xl pl-0 text-slate-500 space-y-2">
            <Clock className="w-8 h-8 text-slate-700 mx-auto" />
            <p className="text-sm font-mono uppercase tracking-widest">No activities recorded</p>
            <p className="text-xs font-sans">Timeline events are instantly populated upon workflow actions.</p>
          </div>
        ) : (
          filteredEvents.map((evt, idx) => {
            const { icon: EventIcon, color: eventColors } = getEventMeta(evt.event_type);
            const rawDate = new Date(evt.created_at);
            const dateStr = rawDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
            const timeStr = rawDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

            return (
              <div key={evt.id || idx} className="relative group">
                
                {/* Visual node bullet indicator */}
                <div className={`absolute -left-10 sm:-left-13 top-1.5 w-6 h-6 rounded-full border flex items-center justify-center transition-all group-hover:scale-110 z-10 ${eventColors}`}>
                  <EventIcon className="w-3 h-3" />
                </div>

                {/* Event details card */}
                <div className="p-5 bg-slate-900/40 hover:bg-slate-900/70 border border-slate-850 hover:border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start gap-4 transition-all shadow-sm">
                  <div className="space-y-2 flex-grow">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 bg-slate-950 text-slate-400 border border-slate-850 rounded">
                        {formatEventType(evt.event_type)}
                      </span>
                      
                      {evt.user_name && (
                        <span className="text-[10px] font-mono text-slate-400">
                          by <strong className="text-slate-300 font-semibold">{evt.user_name}</strong>
                        </span>
                      )}

                      <span className={`w-1.5 h-1.5 rounded-full ${
                        evt.status === "success" ? "bg-emerald-500" : "bg-amber-500"
                      }`} />
                    </div>

                    <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {evt.title}
                    </h4>

                    {evt.details && (
                      <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-2xl font-light">
                        {evt.details}
                      </p>
                    )}
                  </div>

                  {/* Date and time display */}
                  <div className="text-right whitespace-nowrap pt-1 font-mono shrink-0 md:min-w-[100px]">
                    <p className="text-xs text-slate-300 font-bold">{dateStr}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{timeStr}</p>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
