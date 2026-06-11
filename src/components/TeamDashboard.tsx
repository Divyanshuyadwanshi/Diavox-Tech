/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useStore } from "../store";
import { 
  Code, Compass, Layers, Bot, FolderUp, CheckCircle, 
  MessageSquare, Sliders, Play, TrendingUp, AlertCircle, FileText, Send, Shield, Lock
} from "lucide-react";
import { TeamDepartment, UserRole, RequestStatus, UserProfile, Message } from "../types";

export default function TeamDashboard() {
  const { theme, currentUser, projects, requests, updateProjectProgress, sendMessage, messages, allUsers } = useStore();
  const [activeProject, setActiveProject] = useState<string>("proj-3");
  const [progressVal, setProgressVal] = useState<number>(68);
  const [devText, setDevText] = useState<string>("");
  const [designAssetLink, setDesignAssetLink] = useState<string>("");
  const [seoTargetUrl, setSeoTargetUrl] = useState<string>("https://genesis-ventures.com");
  const [seoResultText, setSeoResultText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  // Tab views and chat helper state managers
  const [viewTab, setViewTab] = useState<"department" | "chats">("department");
  const [selectedClientId, setSelectedClientId] = useState<string>("client-test");
  const [chatReplyMsg, setChatReplyMsg] = useState<string>("");

  if (!currentUser || currentUser.role !== "team_member") {
    return (
      <div className="p-8 text-center" id="team-unauth-container">
        <AlertCircle className="mx-auto text-rose-500 mb-2" size={32} />
        <p className="text-sm font-mono opacity-65">Access denied. Registered Diavox team accounts required.</p>
      </div>
    );
  }

  const dept = currentUser.department || "developer";

  const handlePushDeveloperUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devText.trim()) return;

    updateProjectProgress(activeProject, progressVal, devText);
    setDevText("");
    setSuccessText("Developer code status update successfully published to client portal.");
    setTimeout(() => setSuccessText(null), 3550);
  };

  const handleUploadDesign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!designAssetLink.trim()) return;

    // Simulate design push
    setSuccessText(`Design asset compiled and shared. File location: ${designAssetLink}`);
    setDesignAssetLink("");
    setTimeout(() => setSuccessText(null), 4000);
  };

  const handleRunSeoAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seoTargetUrl.trim()) return;

    setSeoResultText("Running Technical PageSpeed and index audit algorithms...");
    setTimeout(() => {
      setSeoResultText(`Audit successfully concluded for ${seoTargetUrl}:
- PageSpeed Score: 98/100 (Sub-second loading state)
- Core Web Vitals: PASS (Fastest paint under 0.8s)
- Accessibility Indices: 99%
- Missing Meta Description Tags: 0
- Indexing Status: ACTIVE on Google Search console`);
    }, 1500);
  };

  return (
    <div className={`p-4 sm:p-6 lg:p-8 min-h-screen text-left transition-colors duration-300 ${
      theme === "dark" ? "bg-slate-950 text-white" : "bg-white text-slate-900"
    }`} id="team-dashboard-root">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b dark:border-slate-900 border-slate-100 pb-6 mb-8 gap-4" id="team-header-row">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-purple-500 font-bold uppercase">INTERNAL DIAVOX STAFF CONSOLE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold">
            Staff Workspace ({dept.toUpperCase()})
          </h2>
          <p className="text-xs opacity-65">Role Permissions tailored for Diavox {currentUser.name}. Track client tickets, push status metrics, or link design wireframes.</p>
        </div>

        {successText && (
          <div className="p-3.5 rounded-lg bg-emerald-950/20 text-emerald-400 border border-emerald-800/40 text-xs font-mono max-w-sm" id="team-success-notif">
            <span>✓ {successText}</span>
          </div>
        )}
      </div>

      {/* Grid workspace split: Adaptive to departments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="team-workspace-grid">
        
        {/* Left Side: Profile Stats of Team member */}
        <div className="lg:col-span-4 space-y-6" id="team-stats-profile">
          <div className={`p-5 rounded-2xl border text-center ${
            theme === "dark" ? "bg-slate-900/35 border-slate-900" : "bg-slate-50 border-slate-200 shadow-sm"
          }`}>
            <img
              src={currentUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl mx-auto object-cover border dark:border-slate-800 border-slate-200"
            />
            <h3 className="font-display font-bold text-base mt-4">{currentUser.name}</h3>
            <p className="text-xs font-mono text-purple-400 tracking-wider mt-0.5 uppercase">{dept} specialists</p>
            <p className="text-xs opacity-60 mt-1">{currentUser.email}</p>

            <div className="mt-6 pt-4 border-t dark:border-slate-905 border-slate-200 text-left text-xs font-mono space-y-2">
              <p className="font-bold opacity-50 uppercase text-[9px] tracking-wider">Assigned Security Permissions:</p>
              {currentUser.permissions?.map((p, idx) => (
                <div key={idx} className="flex items-start space-x-1.5 text-slate-300">
                  <span className="text-purple-500">✔</span>
                  <span className="opacity-85 text-[11px]">{p.replace(/_/g, " ")}</span>
                </div>
              ))}
            </div>

            {/* View Selection Menu */}
            <div className="mt-6 pt-5 border-t dark:border-slate-805 border-slate-200 flex flex-col space-y-2">
              <p className="font-bold opacity-50 uppercase text-[9px] tracking-wider mb-2 text-left">Workspace Navigation</p>
              
              <button
                onClick={() => setViewTab("department")}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-mono font-bold flex items-center space-x-2 transition-all ${
                  viewTab === "department"
                    ? "bg-purple-950/40 text-purple-400 border border-purple-800/20"
                    : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                }`}
              >
                <Sliders size={13} />
                <span>Department Actions</span>
              </button>

              <button
                onClick={() => setViewTab("chats")}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-mono font-bold flex items-center space-x-2 transition-all ${
                  viewTab === "chats"
                    ? "bg-purple-950/40 text-purple-400 border border-purple-800/20"
                    : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                }`}
              >
                <MessageSquare size={13} />
                <span>Clients Chat Helpdesk</span>
                <span className="bg-emerald-500/10 text-emerald-400 text-[8px] rounded px-1 ml-auto shrink-0 uppercase font-bold">CRM</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Department Action Boards */}
        <div className="lg:col-span-8" id="team-staff-action-pane">
          
          {viewTab === "department" && (
            <>
              {/* SECTION: DEVELOPERS DESK */}
              {dept === "developer" && (
            <div className="space-y-6" id="board-developer">
              <h3 className="text-lg font-display font-extrabold pb-3 border-b dark:border-slate-900 border-slate-100 flex items-center space-x-2">
                <Code className="text-purple-400" size={18} />
                <span>Assigned Repos & Progress push</span>
              </h3>

              <div className={`p-5 rounded-2xl border ${theme === "dark" ? "bg-slate-900/20 border-slate-900" : "bg-slate-50 border-slate-100"}`}>
                <h4 className="text-sm font-bold font-mono text-cyan-400 mb-4">Post Development Updates Log</h4>
                
                <form onSubmit={handlePushDeveloperUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] font-mono opacity-50 mb-1">Target active project:</span>
                      <select
                        id="select-dev-proj"
                        value={activeProject}
                        onChange={(e) => {
                          const pId = e.target.value;
                          setActiveProject(pId);
                          const matched = projects.find(p => p.id === pId);
                          if (matched) setProgressVal(matched.progress);
                        }}
                        className="w-full text-xs p-2.5 rounded border dark:bg-slate-950 bg-white"
                      >
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="block text-[10px] font-mono opacity-50 mb-1">Update progress to:</span>
                      <div className="flex items-center space-x-3 mt-2">
                        <input
                          type="range"
                          id="dev-progress-range"
                          min="0"
                          max="100"
                          value={progressVal}
                          onChange={(e) => setProgressVal(Number(e.target.value))}
                          className="flex-1 accent-purple-500 bg-slate-800 rounded h-1"
                        />
                        <span className="font-mono text-xs font-bold text-cyan-400">{progressVal}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[10px] font-mono opacity-50 mb-1">Update activity description:</span>
                    <textarea
                      id="dev-status-text"
                      value={devText}
                      onChange={(e) => setDevText(e.target.value)}
                      placeholder="e.g. Configured the secure row-level constraints inside Supabase..."
                      rows={3}
                      className="w-full text-xs p-2.5 rounded border dark:bg-slate-950 bg-white placeholder-slate-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      id="btn-post-developer-update"
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-xs font-mono rounded-xl shadow-lg"
                    >
                      Publish Progress update
                    </button>
                  </div>
                </form>
              </div>

              {/* Assignments catalog */}
              <h4 className="text-xs font-mono opacity-50 tracking-wider uppercase mb-2">Projects under code monitor</h4>
              <div className="space-y-3" id="dev-project-logs">
                {projects.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl border dark:border-slate-900 border-slate-205 flex items-center justify-between text-xs font-mono">
                    <div>
                      <p className="font-bold">{p.title}</p>
                      <p className="opacity-50 text-[10px] mt-0.5">Delivery due: {p.completion_date}</p>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] bg-slate-900 rounded-md text-cyan-400 font-bold">{p.progress}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: DESIGNERS DESK */}
          {dept === "designer" && (
            <div className="space-y-6" id="board-designer">
              <h3 className="text-lg font-display font-extrabold pb-3 border-b dark:border-slate-900 border-slate-100 flex items-center space-x-2">
                <Layers className="text-purple-400" size={18} />
                <span>Bespoke Visual Asset Manager</span>
              </h3>

              <div className={`p-5 rounded-2xl border ${theme === "dark" ? "bg-slate-900/20 border-slate-900" : "bg-slate-50 border-slate-100"}`}>
                <h4 className="text-sm font-bold font-mono text-cyan-400 mb-4">Post Figma Wireframe sharelink</h4>
                
                <form onSubmit={handleUploadDesign} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono opacity-50 mb-1" htmlFor="figma-link-field">Figma Assets or Frame link:</label>
                    <input
                      type="url"
                      id="figma-link-field"
                      value={designAssetLink}
                      onChange={(e) => setDesignAssetLink(e.target.value)}
                      placeholder="https://figma.com/file/diavox-custom-agency-layout"
                      className="w-full text-xs p-2.5 rounded border dark:bg-slate-950 bg-white"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      id="btn-upload-design-assets"
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs font-mono font-bold"
                    >
                      Publish Figma prototype Link
                    </button>
                  </div>
                </form>
              </div>

              {/* Design template systems */}
              <h4 className="text-xs font-mono opacity-50 tracking-wider uppercase mb-2">Exclusive Figma assets catalog</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="designer-templates-list">
                <div className="p-4 rounded-xl border dark:border-slate-900 border-slate-200">
                  <h5 className="font-bold font-display text-sm">Diavox Light Core kit</h5>
                  <p className="text-xs opacity-65 font-light mt-1">Unified Swiss grids, solid whites, and Space Grotesk pairing parameters.</p>
                </div>
                <div className="p-4 rounded-xl border dark:border-slate-900 border-slate-200">
                  <h5 className="font-bold font-display text-sm">Diavox Glassmorphism assets</h5>
                  <p className="text-xs opacity-65 font-light mt-1">Translucent custom card layers, sub-second overlays, and responsive margins.</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: SEO SPECIALISTS DESK */}
          {dept === "seo" && (
            <div className="space-y-6" id="board-seo">
              <h3 className="text-lg font-display font-extrabold pb-3 border-b dark:border-slate-900 border-slate-100 flex items-center space-x-2">
                <Sliders className="text-purple-400" size={18} />
                <span>SEO Index and Performance audit tools</span>
              </h3>

              <div className={`p-5 rounded-2xl border ${theme === "dark" ? "bg-slate-900/20 border-slate-900" : "bg-slate-50 border-slate-150"}`}>
                <h4 className="text-sm font-bold font-mono text-cyan-400 mb-4">Run Instant Technical Website audit</h4>
                
                <form onSubmit={handleRunSeoAudit} className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      id="field-seo-target-url"
                      value={seoTargetUrl}
                      onChange={(e) => setSeoTargetUrl(e.target.value)}
                      placeholder="Enter target URL for performance testing..."
                      className="flex-1 text-xs p-2.5 rounded border dark:bg-slate-950 bg-white"
                      required
                    />
                    <button
                      type="submit"
                      id="btn-run-seo-audit"
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs font-mono font-bold rounded-lg"
                    >
                      Audit
                    </button>
                  </div>
                </form>
              </div>

              {/* Audit feedback log display */}
              {seoResultText && (
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre-line text-left" id="seo-resultbox">
                  {seoResultText}
                </div>
              )}
            </div>
          )}

          {/* SECTION: VALUE SALES TEAM DESK */}
          {dept === "sales" && (
            <div className="space-y-6" id="board-sales">
              <h3 className="text-lg font-display font-extrabold pb-3 border-b dark:border-slate-900 border-slate-100 flex items-center space-x-2">
                <Compass className="text-purple-400" size={18} />
                <span>Sales Leads & Inquiries logs</span>
              </h3>

              <div className="space-y-4" id="staff-leads-tracker">
                {requests.map(lead => (
                  <div key={lead.id} className="p-4 rounded-xl border dark:border-slate-900 border-slate-200 text-xs font-mono text-left">
                    <div className="flex justify-between items-center mb-2.5">
                      <p className="font-bold text-white text-sm">{lead.service_type}</p>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold">{lead.status}</span>
                    </div>

                    <p className="opacity-80 py-1 font-light italic">"Lead Details: {lead.description}"</p>
                    <p className="opacity-50 mt-2 text-[10px]">Client: {lead.client_name} ({lead.client_email})</p>

                    <div className="mt-4 pt-3 border-t dark:border-slate-900 border-slate-100 flex justify-end">
                      <a
                        href={`mailto:${lead.client_email}?subject=Inquiry%20Response%20-%20Diavox%20Tech&body=Dear%20${lead.client_name}%2C%20thank%20you%20for%20reaching%20out...`}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-bold rounded text-[10px] inline-flex items-center space-x-1.5"
                      >
                        <Send size={11} />
                        <span>Send Client response Email</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
            </>
          )}

          {/* SECTION: CLIENTS CHAT HELPDESK */}
          {viewTab === "chats" && (
            <div className="space-y-6" id="board-team-chats">
              {(() => {
                const canChat = currentUser.permissions?.includes("contact_clients");
                if (!canChat) {
                  return (
                    <div className="p-10 rounded-2xl border dark:border-slate-900 border-rose-200 dark:bg-slate-900/10 bg-rose-500/5 text-center space-y-4" id="chat-locked-state">
                      <Lock className="mx-auto text-rose-500 mb-2 animate-bounce" size={40} />
                      <h4 className="text-base font-display font-extrabold text-white uppercase tracking-wider">Administrative Clearance Required</h4>
                      <div className="max-w-md mx-auto text-xs opacity-75 leading-relaxed space-y-2">
                        <p>Secure CRM tunnels are closed for your current profile credentials.</p>
                        <p className="bg-slate-950/30 p-3 rounded font-mono text-purple-400">
                          Required Capability: "contact_clients"
                        </p>
                        <p>To acquire clearance, please submit an elevation request to a Diavox high-tier administrator (e.g. Divyanshu Admin) to append this permission to your team registry record.</p>
                      </div>
                    </div>
                  );
                }

                const clientUsers = (allUsers as UserProfile[]).filter(u => u.role === "client" || u.id.startsWith("client-"));
                const msgSenderClientIds = Array.from(new Set((messages as Message[]).map(m => m.sender_id))).filter(id => id.startsWith("client-") || id === "client-test" || id === "client-guest");
                const clientIdsFromUsers = clientUsers.map(u => u.id);
                const allClientIds = Array.from(new Set([...clientIdsFromUsers, ...msgSenderClientIds]));

                if (allClientIds.length === 0) {
                  allClientIds.push("client-test", "client-guest");
                }

                const chatCandidates = allClientIds.map(clientId => {
                  const existingUser = (allUsers as UserProfile[]).find(u => u.id === clientId);
                  if (existingUser) return existingUser;
                  return {
                    id: clientId,
                    name: clientId === "client-test" ? "Jordan Sparks" : clientId === "client-guest" ? "Yuki Tanaka" : `Client (${clientId.replace("client-", "")})`,
                    email: clientId === "client-test" ? "jordan@genesis-ventures.com" : clientId === "client-guest" ? "yuki@tanaka-hotels.jp" : "client.desk@diavox.com",
                    role: "client" as const,
                    avatar_url: undefined,
                    department: undefined,
                    permissions: undefined
                  };
                });

                const activeClient = chatCandidates.find(c => c.id === selectedClientId) || chatCandidates[0];
                const activeConvo = (messages as Message[]).filter(m => m.sender_id === activeClient.id || m.recipient_id === activeClient.id);

                const handleTeamSend = (e: React.FormEvent) => {
                  e.preventDefault();
                  if (!chatReplyMsg.trim()) return;
                  sendMessage(activeClient.id, chatReplyMsg);
                  setChatReplyMsg("");
                  setSuccessText(`Message dispatched successfully to client channel ${activeClient.name}`);
                  setTimeout(() => setSuccessText(null), 3000);
                };

                return (
                  <div className="space-y-6 animate-fadeIn" id="team-crm-active">
                    <div className="border-b dark:border-slate-900 border-slate-100 pb-3">
                      <h3 className="text-lg font-display font-extrabold flex items-center space-x-2">
                        <MessageSquare className="text-purple-400" size={18} />
                        <span>Corporate Client Dialogue Link</span>
                      </h3>
                      <p className="text-xs opacity-65 mt-1">Direct end-to-end communication helpdesk with Diavox customers.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch" id="team-helpdesk-grid-wrapper">
                      
                      {/* Left Channels Column */}
                      <div className="md:col-span-4 space-y-3" id="team-helpdesk-client-channels">
                        <p className="text-[10px] font-mono uppercase tracking-wider opacity-60 text-left">Active Contacts</p>
                        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-2">
                          {chatCandidates.map(client => {
                            const isSelected = client.id === activeClient.id;
                            const clientLastMsg = [...(messages as Message[])].reverse().find(m => m.sender_id === client.id || m.recipient_id === client.id);
                            return (
                              <button
                                key={client.id}
                                onClick={() => {
                                  setSelectedClientId(client.id);
                                  setChatReplyMsg("");
                                }}
                                className={`w-full p-3 rounded-xl border text-left flex items-start space-x-2.5 transition-all ${
                                  isSelected 
                                    ? "bg-slate-900 border-purple-500/30 text-white shadow-md relative overflow-hidden" 
                                    : "bg-slate-900/10 dark:hover:bg-slate-900/30 hover:bg-slate-55 border-transparent text-slate-400 dark:text-slate-300"
                                }`}
                              >
                                {isSelected && (
                                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-purple-500" />
                                )}
                                <img
                                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(client.name)}`}
                                  alt={client.name}
                                  className="w-7 h-7 rounded-full bg-slate-950 shrink-0"
                                />
                                <div className="min-w-0 flex-1 leading-tight">
                                  <p className="text-xs font-bold font-sans truncate">{client.name}</p>
                                  <p className="text-[9px] font-mono opacity-50 truncate mt-0.5">{client.email}</p>
                                  <p className="text-[10px] opacity-75 truncate mt-2 font-mono italic">
                                    {clientLastMsg ? `"${clientLastMsg.message_text}"` : "No message logs yet"}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Dialogue Conversation Box */}
                      <div className="md:col-span-8 flex flex-col h-[380px]" id="team-helpdesk-active-convo-window">
                        <div className={`p-4 rounded-t-2xl border-t border-x ${theme === "dark" ? "bg-slate-900 border-slate-900" : "bg-slate-50 border-slate-200"} flex items-center justify-between`}>
                          <div className="flex items-center space-x-2.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-450 animate-pulse" />
                            <div className="text-left leading-none">
                              <span className="text-xs font-bold font-sans block">{activeClient.name}</span>
                              <span className="text-[9px] font-mono opacity-55">{activeClient.email}</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-400 font-bold border border-purple-800/40 uppercase">Connected Staff</span>
                        </div>

                        {/* Messages scroll body */}
                        <div className="flex-1 bg-slate-950/20 border-x border-b dark:border-slate-900 border-slate-200 overflow-y-auto p-4 space-y-3 pb-6 text-left flex flex-col">
                          {activeConvo.length === 0 ? (
                            <div className="m-auto text-center space-y-2 max-w-xs">
                              <MessageSquare className="mx-auto opacity-30 text-purple-405" size={24} />
                              <p className="text-xs opacity-60 font-mono">No communication logs recorded with {activeClient.name}.</p>
                            </div>
                          ) : (
                            activeConvo.map(msg => {
                              const isMe = msg.sender_id === currentUser.id || msg.sender_role?.includes("admin") || msg.sender_role === "team_member";
                              return (
                                <div
                                  key={msg.id}
                                  className={`flex flex-col max-w-[80%] ${isMe ? "ml-auto text-right items-end" : "mr-auto text-left items-start"}`}
                                >
                                  <span className="text-[9px] font-mono opacity-40 mb-1">
                                    {isMe ? currentUser.name : msg.sender_name} ({msg.sender_role?.replace("_", " ") || "Client"})
                                  </span>
                                  <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                                    isMe 
                                      ? "bg-gradient-to-r from-purple-600 to-pink-650 text-white rounded-tr-none shadow" 
                                      : "bg-slate-900 border dark:border-slate-800 border-slate-250 text-slate-100 rounded-tl-none"
                                  }`}>
                                    <p>{msg.message_text}</p>
                                  </div>
                                  <span className="text-[8px] font-mono opacity-30 mt-0.5">
                                    {new Date(msg.created_at).toLocaleString()}
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Message Input compose bar */}
                        <form onSubmit={handleTeamSend} className={`p-2.5 rounded-b-2xl border-x border-b ${theme === "dark" ? "bg-slate-900 border-slate-900" : "bg-slate-50 border-slate-200"} flex items-center space-x-2`}>
                          <input
                            type="text"
                            value={chatReplyMsg}
                            onChange={(e) => setChatReplyMsg(e.target.value)}
                            placeholder={`Reply to ${activeClient.name}...`}
                            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500/50"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs font-mono font-bold tracking-wide rounded-xl shadow-md shrink-0 hover:opacity-90"
                          >
                            Send
                          </button>
                        </form>

                      </div>

                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
