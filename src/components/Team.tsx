/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useStore } from "../store";
import { ExternalLink, ShieldCheck, Mail, Briefcase } from "lucide-react";

interface TeamProps {
  preview?: boolean;
  onNavigate?: (section: string) => void;
}

export default function Team({ preview, onNavigate }: TeamProps) {
  const { theme, allUsers } = useStore();

  // Filter team members and admins to showcase
  const teamMembers = allUsers.filter(u => 
    ["team_member", "secondary_admin", "third_admin", "primary_admin"].includes(u.role)
  );

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
          <p className="text-xs font-mono uppercase tracking-widest text-cyan-500 font-bold">RELIABLE WORLDWIDE SPECIALISTS</p>
          <h2 className="text-3xl sm:text-4xl md:text-5.5xl font-display font-light tracking-tight leading-tight">
            Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-amber-250 to-purple-400 font-normal italic">Remote Specialists</span>
          </h2>
          <p className="text-sm sm:text-base opacity-75 font-light leading-relaxed">
            Our multi-branch divisions operate 24/7 across hemispheres to deploy sub-second custom portals, modern responsive layouts, and technical ranking algorithms.
          </p>
        </div>

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
