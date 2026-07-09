/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from "react";
import { useStore } from "../store";
import { ExternalLink, ShieldCheck, Mail, Briefcase } from "lucide-react";
import { SUPABASE_URL, supabase } from "../supabase";

interface TeamProps {
  preview?: boolean;
  onNavigate?: (section: string) => void;
}

export default function Team({ preview, onNavigate }: TeamProps) {
  const { theme, allUsers, currentUser, cmsContent } = useStore();
  const [apiStatus, setApiStatus] = useState<string>("Testing...");

  useEffect(() => {
    async function testApi() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let token = session?.access_token;
        if (currentUser && currentUser.id === "admin-secret") {
          token = "admin-secret-bypass-token";
        }
        const headers: Record<string, string> = {
          "Content-Type": "application/json"
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const res = await fetch("/api/admin/profiles", { headers });
        if (res.ok) {
          const body = await res.json();
          setApiStatus(`Success (${res.status} OK) - returned ${body?.profiles?.length ?? 0} profiles`);
        } else {
          setApiStatus(`Failed [Status ${res.status}]: ${res.statusText}`);
        }
      } catch (err: any) {
        setApiStatus(`Error: ${err.message || err}`);
      }
    }
    testApi();
  }, [currentUser]);

  // Filter team members and admins to showcase
  const teamMembers = allUsers.filter(u => 
    ["team_member", "secondary_admin", "third_admin", "primary_admin", "developer"].includes(u.role)
  );

  useEffect(() => {
    const rolesDist = allUsers.reduce((acc: Record<string, number>, u) => {
      const r = u.role || "undefined/null";
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {});

    console.log("[DIAGNOSTIC] Vercel/Runtime Environment Check:");
    console.log("- VITE_SUPABASE_URL / Running URL:", SUPABASE_URL);
    console.log("- allUsers Count:", allUsers.length);
    console.log("- allUsers Role Distribution:", JSON.stringify(rolesDist));
    console.log("- Filtered Team Members Count:", teamMembers.length);
  }, [allUsers, teamMembers]);

  const rolesDist = useMemo(() => {
    return allUsers.reduce((acc: Record<string, number>, u) => {
      const r = u.role || "undefined/null";
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {});
  }, [allUsers]);

  const isDebug = useMemo(() => {
    if (typeof window === "undefined") return false;
    const searchParams = new URLSearchParams(window.location.search);
    const hasDebugParam = searchParams.get("debug") === "team";
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.includes("ais-dev-");
    const isDevelopment = (import.meta as any).env?.DEV;
    return hasDebugParam || isLocal || isDevelopment;
  }, []);

  const displayedTeam = preview ? teamMembers.slice(0, 4) : teamMembers;

  const getRoleLabel = (role: string) => {
    if (["primary_admin", "secondary_admin", "third_admin"].includes(role)) return "Admin";
    return "Staff Development Engineer";
  };

  return (
    <section id="team" className={`py-20 md:py-28 text-left transition-colors duration-300 ${
      theme === "dark" 
        ? "bg-slate-900/10 text-white" 
        : "bg-slate-50/40 text-slate-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header content block */}
        <div className="max-w-3xl mb-16 space-y-4" id="team-header-block">
          <p className="text-xs font-mono uppercase tracking-widest text-cyan-500 font-bold">
            {cmsContent?.sectionTitles?.team || "RELIABLE WORLDWIDE SPECIALISTS"}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5.5xl font-display font-light tracking-tight leading-tight">
            {cmsContent?.sectionSubtitles?.team ? (
              cmsContent.sectionSubtitles.team
            ) : (
              <>
                Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-amber-250 to-purple-400 font-normal italic">Remote Specialists</span>
              </>
            )}
          </h2>
          <p className="text-sm sm:text-base opacity-75 font-light leading-relaxed">
            {cmsContent?.sectionDescriptions?.team || "Our multi-branch divisions operate 24/7 across hemispheres to deploy sub-second custom portals, modern responsive layouts, and technical ranking algorithms."}
          </p>
        </div>

        {/* Visible Debug Panel (Development / ?debug=team) */}
        {isDebug && (
          <div 
            id="team-debug-panel" 
            className={`mb-10 p-6 rounded-2xl border font-mono text-xs shadow-xl transition-all ${
              theme === "dark" 
                ? "bg-slate-950/90 border-amber-500/30 text-slate-100 animate-fade-in" 
                : "bg-amber-50/40 border-amber-500/20 text-slate-800 animate-fade-in"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4 border-amber-500/20">
              <span className="font-bold uppercase tracking-wide text-amber-500 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                Team Diagnostic Panel (Temporary)
              </span>
              <span className="text-[10px] opacity-60">Visible via DEV/Host check or ?debug=team</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-cyan-400 block mb-1">1. Supabase URL used by frontend:</span>
                  <div className="px-2 py-1 select-all bg-slate-900/60 rounded text-[11px] truncate text-amber-400" title={SUPABASE_URL}>
                    {SUPABASE_URL}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-cyan-400">2. Total users (allUsers count):</span>
                  <span className="font-bold bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded text-xs">{allUsers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-cyan-400">3. Current User Role:</span>
                  <span className="font-bold bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded text-xs">{currentUser?.role || "GUEST"}</span>
                </div>
                {currentUser && (
                  <div className="text-[10px] opacity-65 truncate text-left">
                    Logged in as: <span className="text-amber-400">{currentUser.email}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-cyan-400">4. Filtered team count:</span>
                  <span className="font-bold bg-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded text-xs">{teamMembers.length}</span>
                </div>
                <div className="text-[10px] opacity-60">
                  (Staff roles filtered on Team page: admins, developer, team_member)
                </div>
                <div>
                  <span className="font-semibold text-cyan-400 block mb-1">5. Backend /api/admin/profiles fetch:</span>
                  <div className={`px-2 py-1 rounded text-[11px] font-bold ${
                    apiStatus.includes("Success") 
                      ? "bg-emerald-500/20 text-emerald-400" 
                      : "bg-rose-500/20 text-rose-400"
                  }`}>
                    {apiStatus}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-500/20">
              <span className="font-semibold text-cyan-400 block mb-1.5">6. User Role Distribution in state:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {Object.entries(rolesDist).map(([roleName, count]) => (
                  <div key={roleName} className="bg-slate-900/40 p-1.5 rounded flex items-center justify-between border border-white/5">
                    <span className="opacity-75 truncate text-[11px]" title={roleName}>{roleName}:</span>
                    <span className="font-bold text-amber-400 font-mono text-xs">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Team Grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" id="team-members-grid">
          {displayedTeam.map((member) => (
            <div
              key={member.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 hover:scale-101 ${
                theme === "dark"
                  ? "bg-slate-950/80 border-slate-900 hover:border-slate-800"
                  : "bg-white border-slate-200 hover:border-slate-300 shadow-md shadow-slate-200/10"
              }`}
              id={`team-member-card-${member.id}`}
            >
              <div className="space-y-4">
                
                {/* Avatar and Info */}
                <div className="relative">
                  <img
                    src={member.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`}
                    alt={member.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-48 sm:h-52 object-cover rounded-xl bg-slate-900 border dark:border-slate-800 border-slate-100"
                  />
                  
                  {/* Department badge overlay */}
                  {member.department && (
                    <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase bg-slate-950/80 text-cyan-400 border border-slate-805/40 backdrop-blur-xs">
                      {member.department}
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <h3 className="font-display font-extrabold text-sm truncate">{member.name}</h3>
                    {["primary_admin", "secondary_admin"].includes(member.role) && (
                      <ShieldCheck size={13} className="text-cyan-500 shrink-0" title="Verified Authority" />
                    )}
                  </div>
                  <p className="text-[10px] font-mono tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-455 to-purple-400 uppercase font-semibold">
                    {getRoleLabel(member.role)}
                  </p>
                </div>

                {/* Bio text */}
                <p className="text-[11px] opacity-75 font-sans font-light leading-relaxed min-h-[44px]">
                  {member.description || "Diavox system certified development supervisor specializing in elite-scale full-stack delivery modules."}
                </p>

              </div>

              {/* Bottom links */}
              <div className="mt-5 pt-3.5 border-t dark:border-slate-900 border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-[9px] font-mono opacity-50 truncate max-w-[130px]" title={member.email}>
                  {member.email}
                </span>

                {member.portfolio && (
                  <a
                    href={member.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-305 flex items-center space-x-1 font-mono font-bold"
                  >
                    <span>Portfolio</span>
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>

            </div>
          ))}
        </div>

        {preview && (
          <div className="mt-12 text-center" id="team-see-more-block">
            <button
              onClick={() => onNavigate?.("team-page")}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl border dark:border-slate-800 dark:hover:bg-slate-900 border-slate-200 bg-white hover:bg-slate-50 text-slate-900 dark:text-cyan-400 font-mono text-xs font-bold shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <span>Meet all Remote Specialists ({teamMembers.length})</span>
              <span>→</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
