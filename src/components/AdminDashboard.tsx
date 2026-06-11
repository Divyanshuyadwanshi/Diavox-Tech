/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useStore } from "../store";
import { 
  BarChart3, Users, Briefcase, FileSignature, CheckCircle2, 
  Trash2, Plus, Edit2, Lock, Shield, UserCheck, AlertCircle, 
  MessageSquare, LockKeyhole, Mail, UserPlus, Star, Save, Tag, DollarSign, PlusCircle,
  History, CreditCard, Cpu, Layout, Eye, Download, Search, FileText, Filter
} from "lucide-react";
import { TeamDepartment, UserRole, RequestStatus, UserProfile, Message, PricingOption, PricingTierObj } from "../types";

export default function AdminDashboard() {
  const { 
    theme, currentUser, allUsers, projects, requests, reviews, metrics, messages, pricingOptions,
    addTeamMember, deleteTeamMember, updateTeamMember, addProject, updateProject, deleteProject,
    updateRequestStatus, updateProjectProgress, updateReviewStatus, toggleReviewFeature, replyToReview, 
    deleteReview, sendMessage, updatePricingOption, updatePricingTier, addPricingOption, deletePricingOption,
    activityLogs, invoices, payments, aiKnowledge, cmsContent, milestones, webhookLogs,
    addActivityLog, addInvoice, updateInvoiceStatus, addPayment, addAiKnowledge, updateAiKnowledge, deleteAiKnowledge,
    updateCmsContent, addMilestone, payMilestone, addWebhookLog
  } = useStore();

  const [activeTab, setActiveTab] = useState<"analytics" | "projects" | "requests" | "team" | "reviews" | "chats" | "pricing" | "settings" | "audit" | "billing" | "aitrain" | "cms">("analytics");
  
  // Dynamic Pricing CRUD local states
  const [newOptionTitle, setNewOptionTitle] = useState<string>("");
  const [newOptionType, setNewOptionType] = useState<"one-time" | "monthly-subscription font-sans">("monthly-subscription");

  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editOptionTitle, setEditOptionTitle] = useState<string>("");
  const [editOptionType, setEditOptionType] = useState<"one-time" | "monthly-subscription">("monthly-subscription");

  const [editingTierOptionId, setEditingTierOptionId] = useState<string | null>(null);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [editTierName, setEditTierName] = useState<string>("");
  const [editTierTagline, setEditTierTagline] = useState<string>("");
  const [editTierPriceUSD, setEditTierPriceUSD] = useState<string>("");
  const [editTierPriceINR, setEditTierPriceINR] = useState<string>("");
  const [editTierPriceGBP, setEditTierPriceGBP] = useState<string>("");
  const [editTierFeatures, setEditTierFeatures] = useState<string>("");

  // States for forms
  const [teamName, setTeamName] = useState<string>("");
  const [teamPosition, setTeamPosition] = useState<string>("");
  const [teamDept, setTeamDept] = useState<TeamDepartment>("developer");
  const [teamRole, setTeamRole] = useState<UserRole>("team_member");
  const [teamEmail, setTeamEmail] = useState<string>("");
  const [teamPortfolio, setTeamPortfolio] = useState<string>("");
  const [teamDescription, setTeamDescription] = useState<string>("");
  
  // Project creation state
  const [projTitle, setProjTitle] = useState<string>("");
  const [projDesc, setProjDesc] = useState<string>("");
  const [projCat, setProjCat] = useState<any>("Website Development");
  const [projTechs, setProjTechs] = useState<string>("React, Tailwinds, TS");
  const [projImg, setProjImg] = useState<string>("https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600");
  const [projDate, setProjDate] = useState<string>("2026-07-30");

  // Project edit state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProjTitle, setEditProjTitle] = useState<string>("");
  const [editProjDesc, setEditProjDesc] = useState<string>("");
  const [editProjCat, setEditProjCat] = useState<any>("Website Development");
  const [editProjTechs, setEditProjTechs] = useState<string>("");
  const [editProjImg, setEditProjImg] = useState<string>("");
  const [editProjDate, setEditProjDate] = useState<string>("");

  // Review reply state helper
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");

  // Notifications alerts
  const [dashAlert, setDashAlert] = useState<string | null>(null);

  // Security profiles edit states inline
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>("team_member");
  const [editDept, setEditDept] = useState<TeamDepartment>("developer");
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editName, setEditName] = useState<string>("");
  const [editPortfolio, setEditPortfolio] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");

  // Customer chat selection states
  const [selectedClientId, setSelectedClientId] = useState<string>("client-test");
  const [chatReplyMsg, setChatReplyMsg] = useState<string>("");

  // Audit Logs filters
  const [auditSearch, setAuditSearch] = useState<string>("");
  const [auditRoleFilter, setAuditRoleFilter] = useState<string>("all");

  // Invoices & Billing creation states
  const [invNum, setInvNum] = useState<string>("DX-2026-101");
  const [invClientId, setInvClientId] = useState<string>("client-test");
  const [invClientName, setInvClientName] = useState<string>("Jordan Sparks");
  const [invClientEmail, setInvClientEmail] = useState<string>("jordan@genesis-ventures.com");
  const [invServices, setInvServices] = useState<string>("Custom React Portal MVP delivery");
  const [invAmount, setInvAmount] = useState<string>("1299");
  const [invDueDate, setInvDueDate] = useState<string>("2026-07-30");

  // AI Training states
  const [aiQ, setAiQ] = useState<string>("");
  const [aiA, setAiA] = useState<string>("");
  const [aiCat, setAiCat] = useState<string>("General Pricing");

  // CMS Content customizer states
  const [cmsHeroTitle, setCmsHeroTitle] = useState<string>(cmsContent?.heroTitle || "");
  const [cmsHeroSubtitle, setCmsHeroSubtitle] = useState<string>(cmsContent?.heroSubtitle || "");
  const [cmsHeroBadge, setCmsHeroBadge] = useState<string>(cmsContent?.heroBadge || "");

  if (!currentUser || !["secret_admin", "primary_admin", "secondary_admin", "third_admin"].includes(currentUser.role)) {
    return (
      <div className="p-8 text-center" id="admin-unauth-container">
        <Shield className="mx-auto text-rose-500 mb-2" size={32} />
        <p className="text-sm font-mono opacity-60">Access denied. Admin authorization required.</p>
      </div>
    );
  }

  const isSecret = currentUser.role === "secret_admin";
  const isPrimary = currentUser.role === "primary_admin";
  const isSecondary = currentUser.role === "secondary_admin";
  const isThird = currentUser.role === "third_admin";
  const hasTeamMgmtPower = isSecret || isPrimary || isSecondary || isThird;

  // STRICT PROGRAMMATIC SECURITY TIER HIERARCHY VALUES:
  const roleValue = (roleStr: string) => {
    if (roleStr === "secret_admin") return 5;
    if (roleStr === "primary_admin") return 4;
    if (roleStr === "secondary_admin") return 3;
    if (roleStr === "third_admin") return 2;
    if (roleStr === "team_member") return 1;
    return 0; // clients / guests
  };

  const canModifyUser = (targetUser: UserProfile) => {
    // Cannot manage self or roles equal-to/greater-than oneself
    if (currentUser.id === targetUser.id) return false;
    return roleValue(currentUser.role) > roleValue(targetUser.role);
  };

  const handleCreateTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !teamPosition) return;

    // Reject role creation if escalating privileges beyond hierarchical limits
    if (roleValue(currentUser.role) <= roleValue(teamRole)) {
      setDashAlert(`Decline: You cannot provision a role (${teamRole}) that is equal to or higher than your own system authority.`);
      setTimeout(() => setDashAlert(null), 5000);
      return;
    }

    // Convention validation check: name.position@diavox.com
    const formattedName = teamName.toLowerCase().replace(/\s+/g, "");
    const formattedPos = teamPosition.toLowerCase().replace(/\s+/g, "");
    const resolvedEmail = teamEmail || `${formattedName}.${formattedPos}@diavox.com`;

    addTeamMember(teamName, teamPosition, teamDept, resolvedEmail);

    // Prompt user fields like portfolio and description directly using our store caching queue
    setTimeout(() => {
      const all = useStore.getState().allUsers;
      const newlyCreated = all.find(u => u.email === resolvedEmail);
      if (newlyCreated) {
        let initialPerms = ["view_assigned_projects", "update_progress", "upload_files"];
        if (teamRole === "secondary_admin") {
          initialPerms = ["view_assigned_projects", "update_progress", "upload_files", "view_leads", "manage_inquiries", "contact_clients", "upload_designs"];
        } else if (teamRole === "third_admin") {
          initialPerms = ["view_assigned_projects", "update_progress", "upload_files", "view_leads", "contact_clients"];
        }
        
        updateTeamMember(newlyCreated.id, {
          role: teamRole,
          portfolio: teamPortfolio || `https://portfolio.diavox.com/${formattedName}`,
          description: teamDescription || "Diavox system specialist deploying clean standard responsive components.",
          permissions: initialPerms
        });
      }
    }, 100);

    setTeamName("");
    setTeamPosition("");
    setTeamDept("developer");
    setTeamRole("team_member");
    setTeamEmail("");
    setTeamPortfolio("");
    setTeamDescription("");
    
    setDashAlert(`Diavox team member successfully created. System email logged: ${resolvedEmail}`);
    setTimeout(() => setDashAlert(null), 5000);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle || !projDesc) return;

    addProject({
      title: projTitle,
      description: projDesc,
      category: projCat,
      technologies: projTechs.split(",").map(t => t.trim()),
      image_url: projImg,
      completion_date: projDate,
      status: "ongoing",
      progress: 0
    });

    setProjTitle("");
    setProjDesc("");
    setProjTechs("React, Tailwinds, TS");
    
    setDashAlert(`New company portfolio project published in general catalog.`);
    setTimeout(() => setDashAlert(null), 5000);
  };

  const handleUpdateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProjectId || !editProjTitle || !editProjDesc) return;

    updateProject(editingProjectId, {
      title: editProjTitle,
      description: editProjDesc,
      category: editProjCat,
      technologies: editProjTechs.split(",").map(t => t.trim()),
      image_url: editProjImg,
      completion_date: editProjDate
    });

    setEditingProjectId(null);
    setDashAlert(`Updated company portfolio study metadata successfully.`);
    setTimeout(() => setDashAlert(null), 4000);
  };

  const handleReviewReplySubmit = (reviewId: string) => {
    if (!replyText.trim()) return;
    replyToReview(reviewId, replyText);
    setReplyText("");
    setSelectedReviewId(null);
    setDashAlert("Review feedback reply published successfully.");
    setTimeout(() => setDashAlert(null), 5000);
  };

  const handleAddPricingOptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionTitle) return;

    // Safe type coercion helper
    const optionType = newOptionType.includes("subscription") ? "monthly-subscription" : "one-time";
    addPricingOption(newOptionTitle, optionType);
    setNewOptionTitle("");
    setDashAlert("Pricing option package initialized. Standard tiers auto-generated.");
    setTimeout(() => setDashAlert(null), 4000);
  };

  const handleSaveTierChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTierOptionId || !editingTierId) return;

    updatePricingTier(editingTierOptionId, editingTierId, {
      name: editTierName,
      tagline: editTierTagline,
      priceUSD: editTierPriceUSD,
      priceINR: editTierPriceINR,
      priceGBP: editTierPriceGBP,
      features: editTierFeatures.split("\n").map(f => f.trim()).filter(Boolean)
    });

    setEditingTierId(null);
    setEditingTierOptionId(null);
    setDashAlert("Pricing plan tier metrics saved successfully.");
    setTimeout(() => setDashAlert(null), 4000);
  };

  return (
    <div className={`p-4 sm:p-6 lg:p-8 min-h-screen text-left transition-colors duration-300 ${
      theme === "dark" ? "bg-slate-950 text-white" : "bg-white text-slate-900"
    }`} id="admin-dashboard-container">
      
      {/* Upper Status bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b dark:border-slate-950 border-slate-100 pb-6 mb-8 gap-4" id="admin-header-row">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10px] font-mono tracking-widest text-cyan-500 font-bold uppercase">ADMINISTRATION DESK</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold inline-flex items-center gap-2">
            Workspace Hub
            {isPrimary ? (
              <span className="px-2 py-0.5 text-[9px] font-mono tracking-wide rounded bg-cyan-950 text-cyan-405 border border-cyan-500/20">PRIMARY AUTHORITY</span>
            ) : isSecondary ? (
              <span className="px-2 py-0.5 text-[9px] font-mono tracking-wide rounded bg-purple-950 text-purple-400 border border-purple-500/20 md:inline">SECONDARY ADMIN</span>
            ) : (
              <span className="px-2 py-0.5 text-[9px] font-mono tracking-wide rounded bg-zinc-900 text-zinc-400 border border-zinc-700 md:inline">THIRD ADMIN OPERATIONS</span>
            )}
          </h2>
          <p className="text-xs opacity-65">Hello, {currentUser.name}. Access operations, client requests, metrics, and manage permissions.</p>
        </div>

        {/* Dash Alert system */}
        {dashAlert && (
          <div className="p-3.5 rounded-lg bg-cyan-950/45 text-cyan-405 border border-cyan-800/60 text-xs font-mono max-w-sm flex items-start space-x-2 shadow-lg animate-fade-in" id="dash-alert">
            <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
            <span className="text-cyan-400">{dashAlert}</span>
          </div>
        )}
      </div>

      {/* Grid wrapper - Left sidebar nav, Right full workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="admin-workspace-grid">
        
        {/* Navigation panel */}
        <div className="lg:col-span-3 space-y-2 flex flex-col" id="admin-sidebar-navigation">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors ${
              activeTab === "analytics" ? "bg-slate-900 border border-cyan-500/10 text-cyan-400" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 size={15} />
            <span>Metrics & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors ${
              activeTab === "requests" ? "bg-slate-900 border border-cyan-500/10 text-cyan-400" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <FileSignature size={15} />
            <span>Inquiries & Leads</span>
            {requests.filter(r => r.status === "Submitted").length > 0 && (
              <span className="bg-cyan-500 text-white text-[9px] rounded-full px-1.5 py-0.5 font-bold font-sans">
                {requests.filter(r => r.status === "Submitted").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors ${
              activeTab === "projects" ? "bg-slate-900 border border-cyan-500/10 text-cyan-400" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <Briefcase size={15} />
            <span>Portfolio Cases</span>
          </button>

          <button
            onClick={() => setActiveTab("team")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors ${
              activeTab === "team" ? "bg-slate-900 border border-cyan-500/10 text-cyan-400" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <Users size={15} />
            <span>Team & Permissions</span>
          </button>

          <button
            onClick={() => setActiveTab("pricing")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors ${
              activeTab === "pricing" ? "bg-slate-900 border border-cyan-500/10 text-cyan-400" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <Tag size={15} />
            <span>Pricing & Plans Config</span>
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors ${
              activeTab === "reviews" ? "bg-slate-900 border border-cyan-500/10 text-cyan-400" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <Star size={15} />
            <span>Reviews Auditing</span>
            {reviews.filter(r => r.status === "Pending").length > 0 && (
              <span className="bg-amber-500 text-white text-[9px] rounded-full px-1.5 py-0.5 font-bold font-sans">
                {reviews.filter(r => r.status === "Pending").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("chats")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors ${
              activeTab === "chats" ? "bg-slate-900 border border-cyan-500/10 text-cyan-400" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <MessageSquare size={15} />
            <span>Clients Chat Helpdesk</span>
            <span className="bg-emerald-500/20 text-emerald-450 text-[9px] rounded px-1 font-bold font-mono uppercase">LIVE</span>
          </button>

          {/* Activity Logs tab: Visible to secret, primary, secondary */}
          {["secret_admin", "primary_admin", "secondary_admin"].includes(currentUser.role) && (
            <button
              onClick={() => setActiveTab("audit")}
              className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors ${
                activeTab === "audit" ? "bg-slate-900 border border-cyan-500/10 text-cyan-400" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
              }`}
              id="btn-nav-audit"
            >
              <History size={15} />
              <span>Activity Audit Logs</span>
            </button>
          )}

          {/* Billing & Invoices tab: Visible to secret, primary, secondary */}
          {["secret_admin", "primary_admin", "secondary_admin"].includes(currentUser.role) && (
            <button
              onClick={() => setActiveTab("billing")}
              className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors ${
                activeTab === "billing" ? "bg-slate-900 border border-cyan-500/10 text-cyan-400" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
              }`}
              id="btn-nav-billing"
            >
              <CreditCard size={15} />
              <span>Invoices & Billing</span>
            </button>
          )}

          {/* AI Training tab: Visible to secret, primary */}
          {["secret_admin", "primary_admin"].includes(currentUser.role) && (
            <button
              onClick={() => setActiveTab("aitrain")}
              className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors ${
                activeTab === "aitrain" ? "bg-slate-900 border border-cyan-500/10 text-cyan-400" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
              }`}
              id="btn-nav-aitrain"
            >
              <Cpu size={15} />
              <span>AI Agent Training</span>
            </button>
          )}

          {/* CMS Customizer tab: Visible exclusively to secret_admin */}
          {["secret_admin"].includes(currentUser.role) && (
            <button
              onClick={() => setActiveTab("cms")}
              className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors ${
                activeTab === "cms" ? "bg-slate-900 border border-cyan-500/10 text-cyan-400" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
              }`}
              id="btn-nav-cms"
            >
              <Layout size={15} />
              <span>Website CMS Editor</span>
            </button>
          )}
        </div>

        {/* Main Work Panels */}
        <div className="lg:col-span-9" id="admin-workspace-pane">
          
          {/* TAB 1: ANALYTICS HUB */}
          {activeTab === "analytics" && (
            <div className="space-y-8" id="tab-analytics">
              <h3 className="text-lg font-display font-extrabold pb-3 border-b dark:border-slate-900 border-slate-100">Performance Index</h3>
              
              {/* Stats Widgets */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4" id="analytics-widgets">
                <div className={`p-5 rounded-2xl border ${theme === "dark" ? "bg-slate-900/40 border-slate-905" : "bg-slate-50 border-slate-200"}`}>
                  <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Total Agency Revenue</p>
                  <h4 className="text-2xl sm:text-3xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-500 mt-1">
                    ${metrics.revenue.toLocaleString()}
                  </h4>
                  <p className="text-[9px] font-mono text-emerald-400 mt-2">▲ +14% monthly jump</p>
                </div>

                <div className={`p-5 rounded-2xl border ${theme === "dark" ? "bg-slate-900/40 border-slate-905" : "bg-slate-50 border-slate-200"}`}>
                  <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest font-sans">Active Clients</p>
                  <h4 className="text-2xl sm:text-3xl font-display font-extrabold mt-1">{metrics.activeClients}</h4>
                  <p className="text-[9px] font-mono opacity-60 mt-2">Assigned remote managers</p>
                </div>

                <div className={`p-5 rounded-2xl border ${theme === "dark" ? "bg-slate-900/40 border-slate-905" : "bg-slate-50 border-slate-200"}`}>
                  <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Conversion Index</p>
                  <h4 className="text-2xl sm:text-3xl font-display font-extrabold mt-1">{metrics.conversionRate}%</h4>
                  <p className="text-[9px] font-mono text-emerald-400 mt-2">▲ +2.5% audit shift</p>
                </div>
              </div>

              {/* SVG Line Chart */}
              <div className={`p-6 rounded-2xl border ${theme === "dark" ? "bg-slate-900/40 border-slate-900" : "bg-slate-50 border-slate-200"}`} id="analytics-chart-panel">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="text-sm font-bold font-display">Revenue growth (USD) over past Quarters</h4>
                    <span className="text-[10px] font-mono opacity-50">Remote service contracts sharding</span>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">LIVE REVENUE FEED</span>
                </div>

                <div className="w-full h-44 bg-slate-950/20 border border-slate-800/10 dark:border-slate-800/40 rounded-xl relative p-2 overflow-hidden flex items-end">
                  <svg className="w-full h-full text-cyan-500" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <line x1="0" y1="5" x2="100" y2="5" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" />
                    <line x1="0" y1="15" x2="100" y2="15" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" />
                    <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" />
                    <path
                      d="M 0 30 L 0 25 L 20 20 L 40 22 L 60 14 L 80 18 L 100 5 L 100 30 Z"
                      fill="url(#gradient-area)"
                      opacity="0.15"
                    />
                    <path
                      d="M 0 25 L 20 20 L 40 22 L 60 14 L 80 18 L 100 5"
                      fill="none"
                      stroke="url(#gradient-line)"
                      strokeWidth="0.85"
                    />
                    <defs>
                      <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                      <linearGradient id="gradient-area" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[8px] font-mono opacity-55">
                    <span>Q1: $18K</span>
                    <span>Q2: $26K</span>
                    <span>Q3: $32K</span>
                    <span>Q4: $54.9K</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REQUESTS & LEADS */}
          {activeTab === "requests" && (
            <div className="space-y-6" id="tab-requests">
              <h3 className="text-lg font-display font-extrabold pb-3 border-b dark:border-slate-900 border-slate-100">Leads Tracking Console</h3>
              
              <div className="space-y-4" id="leads-mapping-container">
                {requests.map((req) => (
                  <div key={req.id} className={`p-5 rounded-2xl border ${theme === "dark" ? "bg-slate-900/30 border-slate-900" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <h4 className="text-sm font-bold font-display">{req.service_type}</h4>
                        <span className="text-[10px] font-mono opacity-50">From: {req.client_name} ({req.client_email})</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono opacity-50">SLA status:</span>
                        <select
                          id={`change-state-${req.id}`}
                          value={req.status}
                          onChange={(e) => updateRequestStatus(req.id, e.target.value as RequestStatus)}
                          className={`text-xs p-1.5 rounded-lg border focus:outline-none font-bold ${
                            req.status === "Approved" || req.status === "Completed" ? "bg-emerald-955/20 text-emerald-400 border-emerald-900" : "bg-slate-800 text-white border-slate-750"
                          }`}
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Quoted">Quoted</option>
                          <option value="Approved">Approved</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <p className="text-xs opacity-85 leading-relaxed font-light">"{req.description}"</p>
                    {req.budget && (
                      <div className="mt-4 text-xs font-mono">
                        <span className="opacity-50">Proposed Budget: </span>
                        <span className="font-bold text-cyan-400">{req.budget}</span>
                      </div>
                    )}
                  </div>
                ))}

                {requests.length === 0 && (
                  <p className="text-xs font-mono opacity-50 text-center py-10 font-sans">No inquiries or leads posted.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PROJECTS & COMPANY PORTFOLIO MANAGER */}
          {activeTab === "projects" && (
            <div className="space-y-6" id="tab-projects">
              
              {/* Add Project study form */}
              {!editingProjectId && (
                <div className={`p-5 rounded-2xl border mb-6 text-left ${theme === "dark" ? "bg-slate-900/20 border-slate-900" : "bg-slate-50 border-slate-100"}`} id="form-upload-project">
                  <h4 className="text-sm font-bold font-display mb-4">Register/Upload New Company Portfolio Case</h4>
                  <form onSubmit={handleCreateProject} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono opacity-60 mb-1" htmlFor="p-title-field">Project Title</label>
                        <input
                          type="text"
                          id="p-title-field"
                          value={projTitle}
                          onChange={(e) => setProjTitle(e.target.value)}
                          placeholder="e.g. Athena SaaS Platform"
                          className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-950 bg-white border-slate-200 dark:border-slate-800 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono opacity-60 mb-1" htmlFor="p-cat-field">Category / Service</label>
                        <select
                          id="p-cat-field"
                          value={projCat}
                          onChange={(e) => setProjCat(e.target.value as any)}
                          className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-950 bg-white border-slate-200 dark:border-slate-800 focus:outline-none"
                        >
                          <option value="Website Development">Website Development</option>
                          <option value="Website Design">Website Design</option>
                          <option value="SEO">SEO Auditing</option>
                          <option value="AI Automation">AI Workflow Automations</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono opacity-60 mb-1" htmlFor="p-desc-field">Case Study Description</label>
                      <textarea
                        id="p-desc-field"
                        value={projDesc}
                        onChange={(e) => setProjDesc(e.target.value)}
                        placeholder="Detail the scope of development or design accomplishments..."
                        rows={2}
                        className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-950 bg-white border-slate-200 dark:border-slate-800 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono opacity-60 mb-1" htmlFor="p-tech-field">Technologies used (comma separated)</label>
                        <input
                          type="text"
                          id="p-tech-field"
                          value={projTechs}
                          onChange={(e) => setProjTechs(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-950 bg-white border-slate-200 dark:border-slate-800 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono opacity-60 mb-1" htmlFor="p-img-field">Launch Image URL Link</label>
                        <input
                          type="text"
                          id="p-img-field"
                          value={projImg}
                          onChange={(e) => setProjImg(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-950 bg-white border-slate-200 dark:border-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        id="btn-upload-project-submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs font-mono tracking-wider font-bold shadow-md shadow-cyan-500/10 hover:brightness-110 transition-all font-sans"
                      >
                        Publish Brand Project
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Project editing modal inline */}
              {editingProjectId && (
                <div className={`p-5 rounded-2xl border mb-6 text-left bg-cyan-950/15 border-cyan-800/40`} id="edit-project-dialog">
                  <div className="flex justify-between items-center pb-2 mb-4 border-b dark:border-slate-850 border-slate-200">
                    <h4 className="text-sm font-bold font-display text-cyan-400">Edit Company Portfolio Project</h4>
                    <button onClick={() => setEditingProjectId(null)} className="text-xs font-mono opacity-60 hover:underline">Cancel</button>
                  </div>
                  <form onSubmit={handleUpdateProjectSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono opacity-60 mb-1">Project Title</label>
                        <input
                          type="text"
                          value={editProjTitle}
                          onChange={(e) => setEditProjTitle(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-950 bg-white border-slate-200 dark:border-slate-800 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono opacity-60 mb-1">Category</label>
                        <select
                          value={editProjCat}
                          onChange={(e) => setEditProjCat(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-950 bg-white border-slate-200 dark:border-slate-800 focus:outline-none"
                        >
                          <option value="Website Development">Website Development</option>
                          <option value="Website Design">Website Design</option>
                          <option value="SEO">SEO Auditing</option>
                          <option value="AI Automation">AI Workflow Automations</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono opacity-60 mb-1">Description</label>
                      <textarea
                        value={editProjDesc}
                        onChange={(e) => setEditProjDesc(e.target.value)}
                        rows={2}
                        className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-950 bg-white border-slate-200 dark:border-slate-800 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono opacity-60 mb-1">Technologies Used (csv)</label>
                        <input
                          type="text"
                          value={editProjTechs}
                          onChange={(e) => setEditProjTechs(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-950 bg-white border-slate-200 dark:border-slate-800 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono opacity-60 mb-1">Launch Date</label>
                        <input
                          type="date"
                          value={editProjDate}
                          onChange={(e) => setEditProjDate(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-950 bg-white border-slate-200 dark:border-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono opacity-60 mb-1">Image URL</label>
                      <input
                        type="text"
                        value={editProjImg}
                        onChange={(e) => setEditProjImg(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-950 bg-white border-slate-200 dark:border-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditingProjectId(null)}
                        className="px-4 py-2 rounded-lg text-xs bg-slate-850 hover:bg-slate-800 border dark:border-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-lg text-xs font-mono font-bold bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
                      >
                        Save Project Study
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Deliveries Monitor */}
              <h3 className="text-sm font-mono font-bold tracking-wider opacity-60 text-left pt-4">ACTIVE TIMELINES & PORTFOLIO CASES</h3>
              <div className="space-y-4" id="project-timeline-monitor">
                {projects.map((proj) => (
                  <div key={proj.id} className={`p-5 rounded-2xl border ${theme === "dark" ? "bg-slate-900/35 border-slate-900" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
                      <div>
                        <h4 className="text-sm font-bold font-display">{proj.title}</h4>
                        <span className="text-[10px] font-mono text-cyan-400 capitalize">{proj.category}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingProjectId(proj.id);
                            setEditProjTitle(proj.title);
                            setEditProjDesc(proj.description);
                            setEditProjCat(proj.category);
                            setEditProjTechs(proj.technologies ? proj.technologies.join(", ") : "");
                            setEditProjImg(proj.image_url || "");
                            setEditProjDate(proj.completion_date || "");
                          }}
                          className="p-1 px-1.5 sm:px-2.5 rounded-lg bg-cyan-950/20 text-cyan-400 hover:bg-cyan-500/10 text-xs font-mono flex items-center space-x-1"
                        >
                          <Edit2 size={11} />
                          <span className="hidden sm:inline">Modify</span>
                        </button>
                        <button
                          onClick={() => {
                            deleteProject(proj.id);
                            setDashAlert("Successfully deleted project package study.");
                            setTimeout(() => setDashAlert(null), 3000);
                          }}
                          className="p-1 px-1.5 sm:px-2.5 rounded-lg bg-rose-950/20 text-rose-500 hover:bg-rose-500/10 text-xs font-mono flex items-center space-x-1"
                        >
                          <Trash2 size={11} />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                        <span className="text-xs font-mono bg-slate-950 text-slate-400 px-2 rounded">Deliverable: {proj.completion_date}</span>
                      </div>
                    </div>

                    <p className="text-xs opacity-75 font-light leading-relaxed mb-4">"{proj.description}"</p>

                    {/* Progress slider bar info */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="opacity-60">Client Progress Timeline:</span>
                        <span className="font-bold text-cyan-400">{proj.progress}%</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="range"
                          id={`progress-range-${proj.id}`}
                          min="0"
                          max="100"
                          value={proj.progress}
                          onChange={(e) => updateProjectProgress(proj.id, Number(e.target.value), `Admin aligned progress milestone to ${e.target.value}%`)}
                          className="flex-1 accent-cyan-500 h-1.5 rounded-lg bg-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: TEAM REGISTRY */}
          {activeTab === "team" && (
            <div className="space-y-6" id="tab-team">
              
              {/* Add Team Member form */}
              {hasTeamMgmtPower ? (
                <div className={`p-5 rounded-2xl border ${theme === "dark" ? "bg-slate-900/20 border-slate-900" : "bg-slate-50 border-slate-100"}`} id="form-invite-team">
                  <h4 className="text-sm font-bold font-display mb-4 flex items-center space-x-2">
                    <UserPlus size={16} className="text-cyan-500" />
                    <span>Invite/Create Diavox Team Member Account</span>
                  </h4>
                  <form onSubmit={handleCreateTeamMember} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono opacity-60 mb-1" htmlFor="team-name-field">Member Name</label>
                        <input
                          type="text"
                          id="team-name-field"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          placeholder="e.g. Jordan Sparks"
                          className="w-full text-xs p-2.5 rounded-lg border text-slate-900 dark:text-white bg-white dark:bg-slate-950 border-slate-205 dark:border-slate-800 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono opacity-60 mb-1" htmlFor="team-pos-field font-sans">Role Position</label>
                        <input
                          type="text"
                          id="team-pos-field"
                          value={teamPosition}
                          onChange={(e) => setTeamPosition(e.target.value)}
                          placeholder="e.g. Sales Expert"
                          className="w-full text-xs p-2.5 rounded-lg border text-slate-900 dark:text-white bg-white dark:bg-slate-950 border-slate-205 dark:border-slate-800 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono opacity-60 mb-1" htmlFor="team-dept-field">Department</label>
                        <select
                          id="team-dept-field"
                          value={teamDept}
                          onChange={(e) => setTeamDept(e.target.value as TeamDepartment)}
                          className="w-full text-xs p-2.5 rounded-lg border text-slate-900 dark:text-white bg-white dark:bg-slate-950 border-slate-205 dark:border-slate-800 focus:outline-none"
                        >
                          <option value="sales">Sales & Leads</option>
                          <option value="developer">Developer</option>
                          <option value="designer">Designer</option>
                          <option value="seo">SEO Specialists</option>
                          <option value="general">General</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono opacity-60 mb-1" htmlFor="team-role-select">System Role Assignment</label>
                        <select
                          id="team-role-select"
                          value={teamRole}
                          onChange={(e) => setTeamRole(e.target.value as UserRole)}
                          className="w-full text-xs p-2.5 rounded-lg border text-slate-900 dark:text-white bg-white dark:bg-slate-950 border-slate-205 dark:border-slate-800 focus:outline-none"
                        >
                          <option value="team_member">Team Member</option>
                          {isPrimary && (
                            <option value="secondary_admin">Secondary Admin</option>
                          )}
                          {(isPrimary || isSecondary) && (
                            <option value="third_admin">Third Admin (Operations)</option>
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono opacity-60 mb-1">Professional Portfolio URL</label>
                        <input
                          type="url"
                          value={teamPortfolio}
                          onChange={(e) => setTeamPortfolio(e.target.value)}
                          placeholder="https://portfolio.diavox.com/username"
                          className="w-full text-xs p-2.5 rounded-lg border text-slate-900 dark:text-white bg-white dark:bg-slate-950 border-slate-205 dark:border-slate-800 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono opacity-60 mb-1">Brief Description / Bio</label>
                        <input
                          type="text"
                          value={teamDescription}
                          onChange={(e) => setTeamDescription(e.target.value)}
                          placeholder="Elite system certified full-stack engineer..."
                          className="w-full text-xs p-2.5 rounded-lg border text-slate-900 dark:text-white bg-white dark:bg-slate-950 border-slate-205 dark:border-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        id="btn-register-team-submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 font-bold text-xs font-mono text-white tracking-wider shadow-lg"
                      >
                        Provision Team Account
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs flex items-center space-x-2" id="sec-admin-permissions-block">
                  <AlertCircle size={15} />
                  <span>Only the designated administrators have security permissions to manage Diavox team accounts.</span>
                </div>
              )}

              {/* Inline Editor Panel for Security Profiles */}
              {editingMemberId && (
                <div className={`p-5 rounded-2xl border ${theme === "dark" ? "bg-slate-900/40 border-amber-500/20" : "bg-amber-50 border-amber-200"} space-y-4`} id="admin-security-profile-editor">
                  <div className="flex justify-between items-center pb-2 border-b dark:border-slate-800 border-amber-200">
                    <h4 className="text-sm font-bold font-display flex items-center space-x-2 text-cyan-400">
                      <Shield size={16} />
                      <span>Configure Security Profile: {editName}</span>
                    </h4>
                    <button className="text-xs opacity-60 font-mono hover:underline" onClick={() => setEditingMemberId(null)}>Close</button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono opacity-60 mb-1">Display Name</label>
                      <input
                        type="text"
                        className="w-full text-xs p-2.5 rounded-lg border text-slate-900 dark:text-white bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:outline-none"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono opacity-60 mb-1">System Authority Role</label>
                      <select
                        className="w-full text-xs p-2.5 rounded-lg border text-slate-900 dark:text-white bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:outline-none"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as UserRole)}
                        disabled={allUsers.find(u => u.id === editingMemberId)?.role === "primary_admin"}
                      >
                        <option value="team_member">Team Member</option>
                        {isPrimary && (
                          <option value="secondary_admin">Secondary Admin</option>
                        )}
                        {(isPrimary || isSecondary) && (
                          <option value="third_admin">Third Admin (Operations)</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono opacity-60 mb-1">Staff Department</label>
                      <select
                        className="w-full text-xs p-2.5 rounded-lg border text-slate-900 dark:text-white bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:outline-none"
                        value={editDept}
                        onChange={(e) => setEditDept(e.target.value as TeamDepartment)}
                      >
                        <option value="sales">Sales & Leads</option>
                        <option value="developer">Developer</option>
                        <option value="designer">Designer</option>
                        <option value="seo">SEO Specialists</option>
                        <option value="general">General</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono opacity-60 mb-1">Portfolio Link URL</label>
                      <input
                        type="url"
                        className="w-full text-xs p-2.5 rounded-lg border text-slate-900 dark:text-white bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:outline-none"
                        value={editPortfolio}
                        onChange={(e) => setEditPortfolio(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono opacity-60 mb-1">Bio Description</label>
                      <input
                        type="text"
                        className="w-full text-xs p-2.5 rounded-lg border text-slate-900 dark:text-white bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:outline-none"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="block text-[10px] font-mono opacity-60 mb-1">Security Permissions Scope</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 border dark:border-slate-800 border-slate-200 p-3 rounded-lg dark:bg-slate-950 bg-white max-h-40 overflow-y-auto">
                      {[
                        { key: "view_assigned_projects", label: "View Projects Tracking" },
                        { key: "update_progress", label: "Update Milestone Metrics" },
                        { key: "upload_files", label: "Upload Custom Files" },
                        { key: "access_design_assets", label: "Access & Showcase Designs" },
                        { key: "upload_designs", label: "Publish Brand Assets" },
                        { key: "view_leads", label: "Monitor Leads & Inquiries" },
                        { key: "manage_inquiries", label: "Govern Customer Inquiries" },
                        { key: "contact_clients", label: "Live Client Support Chat" }
                      ].map((perm) => {
                        const isChecked = editPermissions.includes(perm.key);
                        return (
                          <label key={perm.key} className="flex items-center space-x-2.5 cursor-pointer hover:opacity-85 text-slate-700 dark:text-slate-300">
                            <input
                              type="checkbox"
                              className="rounded accent-cyan-500 h-3.5 w-3.5"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setEditPermissions(editPermissions.filter(p => p !== perm.key));
                                } else {
                                  setEditPermissions([...editPermissions, perm.key]);
                                }
                              }}
                            />
                            <span className="text-[11px] font-mono">{perm.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-mono rounded-lg hover:bg-slate-705"
                      onClick={() => setEditingMemberId(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-mono text-white font-bold rounded-lg shadow"
                      onClick={() => {
                        updateTeamMember(editingMemberId, {
                          name: editName,
                          role: editRole,
                          department: editDept,
                          portfolio: editPortfolio,
                          description: editDescription,
                          permissions: editPermissions
                        });
                        setEditingMemberId(null);
                        setDashAlert(`Updated security permissions & privileges for ${editName} successfully!`);
                        setTimeout(() => setDashAlert(null), 4000);
                      }}
                    >
                      Commit Profile Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Members Table */}
              <div className="pt-4" id="team-registry-list">
                <h3 className="text-sm font-mono tracking-wider opacity-60 mb-4 uppercase">Diavox Registry Logs</h3>
                <div className="overflow-x-auto rounded-2xl border dark:border-slate-900 border-slate-200 text-xs text-left">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-900 font-mono text-slate-500 border-b dark:border-slate-900 border-slate-200">
                        <th className="p-4 font-bold">Registry Name</th>
                        <th className="p-4 font-bold">Email Address</th>
                        <th className="p-4 font-bold font-sans">Department</th>
                        <th className="p-4 font-bold">System Role</th>
                        <th className="p-4 font-bold">Permissions Set</th>
                        <th className="p-4 font-bold text-center">Safety Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-900 divide-slate-100 font-mono text-xs">
                      {allUsers.map((member) => (
                        <tr key={member.id} className="hover:bg-slate-500/5">
                          <td className="p-4 font-bold">
                            <span className="block">{member.name}</span>
                            {member.id === currentUser.id && (
                              <span className="text-[9px] text-amber-500 font-mono font-bold uppercase">(You)</span>
                            )}
                          </td>
                          <td className="p-4 text-slate-400">{member.email}</td>
                          <td className="p-4 capitalize">{member.department || "Admin Desk"}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                              member.role === "primary_admin" 
                                ? "bg-cyan-950 text-cyan-400 border border-cyan-800/30" 
                                : member.role === "secondary_admin"
                                  ? "bg-purple-950 text-purple-400 border border-purple-800/30"
                                  : member.role === "third_admin"
                                    ? "bg-yellow-950/40 text-yellow-500 border border-yellow-805/30"
                                    : "bg-slate-800 text-slate-300"
                            }`}>
                              {member.role.replace("_", " ")}
                            </span>
                          </td>
                          <td className="p-4 max-w-[200px] overflow-hidden whitespace-normal">
                            <div className="flex flex-wrap gap-1">
                              {member.role === "primary_admin" ? (
                                <span className="text-[9px] bg-cyan-955/20 text-cyan-400/80 px-1 py-0.5 rounded border border-cyan-900/30">ALL_SYSTEM_KEYS</span>
                              ) : member.permissions && member.permissions.length > 0 ? (
                                member.permissions.map(p => (
                                  <span key={p} className="text-[8px] bg-slate-950/40 text-slate-400 px-1 py-0.5 rounded border dark:border-slate-900 border-slate-200">
                                    {p.replace(/_/g, " ")}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-slate-500 italic">No custom keys</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center text-sans">
                            {/* Actions guarded strictly by target hierarchy check */}
                            {canModifyUser(member) && member.id !== currentUser.id ? (
                              <div className="flex items-center justify-center space-x-1.5">
                                <button
                                  onClick={() => {
                                    setEditingMemberId(member.id);
                                    setEditName(member.name);
                                    setEditRole(member.role);
                                    setEditDept(member.department || "general");
                                    setEditPortfolio(member.portfolio || "");
                                    setEditDescription(member.description || "");
                                    setEditPermissions(member.permissions || []);
                                  }}
                                  className="text-cyan-400 hover:bg-cyan-500/10 p-1.5 rounded-lg transition-colors"
                                  title="Edit security permission roles"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => {
                                    deleteTeamMember(member.id);
                                    setDashAlert(`Decommissioned account: ${member.name}`);
                                    setTimeout(() => setDashAlert(null), 3000);
                                  }}
                                  className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors"
                                  title="Decommission account"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ) : (
                              <span className="opacity-40 italic flex justify-center text-[10px] select-none text-sans">No action allowed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: CENTRAL PRICING CONFIG DIALOG */}
          {activeTab === "pricing" && (
            <div className="space-y-6" id="tab-pricing">
              <div className="border-b dark:border-slate-900 border-slate-100 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-display font-extrabold">PCI Gateway Pricing Config</h3>
                  <p className="text-xs opacity-65">Create, adjust and delete payment, maintenance, website or SEO plans dynamically.</p>
                </div>
              </div>

              {/* Add pricing option */}
              <div className={`p-5 rounded-2xl border text-left ${theme === "dark" ? "bg-slate-900/20 border-slate-900" : "bg-slate-50 border-slate-100"}`}>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider mb-3">Add Brand New Service Package Options</h4>
                <form onSubmit={handleAddPricingOptionSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={newOptionTitle}
                    onChange={(e) => setNewOptionTitle(e.target.value)}
                    placeholder="e.g. Enterprise SEO retainer"
                    className="flex-1 text-xs p-2.5 rounded-lg border dark:bg-slate-950 bg-white border-slate-200 dark:border-slate-800 focus:outline-none"
                    required
                  />
                  <select
                    value={newOptionType}
                    onChange={(e) => setNewOptionType(e.target.value as any)}
                    className="text-xs p-2.5 rounded-lg border dark:bg-slate-950 bg-white border-slate-200 dark:border-slate-800 focus:outline-none font-mono"
                  >
                    <option value="monthly-subscription">Monthly Subscription / Retainer</option>
                    <option value="one-time">One-time Payment</option>
                  </select>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg text-xs font-bold font-mono text-white bg-gradient-to-r from-cyan-500 to-purple-600 shadow flex items-center space-x-1 hover:brightness-110"
                  >
                    <PlusCircle size={14} />
                    <span>Create Option</span>
                  </button>
                </form>
              </div>

              {/* Inline edit tier form */}
              {editingTierOptionId && editingTierId && (
                <div className="p-5 rounded-2xl border bg-cyan-950/15 border-cyan-800/40 text-left space-y-4">
                  <div className="flex justify-between items-center border-b dark:border-slate-850 border-slate-200 pb-2">
                    <h4 className="text-sm font-bold font-display text-cyan-400">Modify Package Tier: {editTierName}</h4>
                    <button onClick={() => setEditingTierId(null)} className="text-xs font-mono opacity-60 hover:underline">Cancel</button>
                  </div>
                  <form onSubmit={handleSaveTierChanges} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono opacity-60 mb-1">Tier Title</label>
                        <input
                          type="text"
                          value={editTierName}
                          onChange={(e) => setEditTierName(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-950 bg-white border-slate-200 dark:border-slate-800 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono opacity-60 mb-1">Tagline</label>
                        <input
                          type="text"
                          value={editTierTagline}
                          onChange={(e) => setEditTierTagline(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-950 bg-white border-slate-200 dark:border-slate-800 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono opacity-60 mb-1">Price USD ($)</label>
                        <input
                          type="text"
                          value={editTierPriceUSD}
                          onChange={(e) => setEditTierPriceUSD(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-950 bg-white border-slate-200 dark:border-slate-800 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono opacity-60 mb-1">Price INR (₹ - Indian clients)</label>
                        <input
                          type="text"
                          value={editTierPriceINR}
                          onChange={(e) => setEditTierPriceINR(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-950 bg-white border-slate-200 dark:border-slate-800 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono opacity-60 mb-1">Price GBP (£)</label>
                        <input
                          type="text"
                          value={editTierPriceGBP}
                          onChange={(e) => setEditTierPriceGBP(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-950 bg-white border-slate-200 dark:border-slate-800 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono opacity-60 mb-1">Scope Features (one per line)</label>
                      <textarea
                        value={editTierFeatures}
                        onChange={(e) => setEditTierFeatures(e.target.value)}
                        rows={4}
                        className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-950 bg-white border-slate-200 dark:border-slate-800 focus:outline-none font-mono"
                        required
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => { setEditingTierId(null); setEditingTierOptionId(null); }}
                        className="px-4 py-2 rounded-lg text-xs bg-slate-800 hover:bg-slate-70 mr-1"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-lg text-xs font-mono font-bold bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow"
                      >
                        Save Dynamic Tier Values
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Options lists */}
              <div className="space-y-6" id="pricing-options-crud-mapping">
                {pricingOptions.map((opt) => (
                  <div key={opt.id} className={`p-5 rounded-2xl border ${theme === "dark" ? "bg-slate-900/30 border-slate-900" : "bg-slate-50 border-slate-200"} text-left space-y-4`}>
                    <div className="flex justify-between items-center border-b dark:border-slate-850 border-slate-200 pb-2">
                      <div>
                        <h4 className="font-bold text-sm">{opt.title}</h4>
                        <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest text-cyan-400">
                          {opt.type === "one-time" ? "Unit purchase (one-time)" : "Monthly subscription"}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          deletePricingOption(opt.id);
                          setDashAlert("Pricing service option decommissioned.");
                          setTimeout(() => setDashAlert(null), 3500);
                        }}
                        className="p-1 px-2.5 rounded text-xs bg-rose-950/20 text-rose-500 border border-rose-800/20"
                      >
                        Decommission Option
                      </button>
                    </div>

                    {/* Tiers lists */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      {opt.tiers.map((tier) => (
                        <div key={tier.id} className="p-3.5 rounded-xl border dark:bg-slate-950/50 bg-white dark:border-slate-900 border-slate-100 space-y-2.5">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs">{tier.name}</span>
                            <button
                              onClick={() => {
                                setEditingTierOptionId(opt.id);
                                setEditingTierId(tier.id);
                                setEditTierName(tier.name);
                                setEditTierTagline(tier.tagline);
                                setEditTierPriceUSD(tier.priceUSD);
                                setEditTierPriceINR(tier.priceINR);
                                setEditTierPriceGBP(tier.priceGBP);
                                setEditTierFeatures(tier.features.join("\n"));
                              }}
                              className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center space-x-0.5"
                            >
                              <Edit2 size={9} />
                              <span>Adjust</span>
                            </button>
                          </div>
                          <p className="text-[11px] opacity-60 truncate">{tier.tagline}</p>
                          <div className="text-[11px] font-mono py-1 border-t border-b dark:border-slate-900 border-slate-100 flex flex-wrap gap-1 leading-none text-slate-500">
                            <span>$: {tier.priceUSD}</span>
                            <span className="opacity-30">|</span>
                            <span>₹: {tier.priceINR}</span>
                            <span className="opacity-30">|</span>
                            <span>£: {tier.priceGBP}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 6: REVIEWS AUDITING */}
          {activeTab === "reviews" && (
            <div className="space-y-6" id="tab-reviews">
              <h3 className="text-lg font-display font-extrabold pb-3 border-b dark:border-slate-900 border-slate-100">Reviews & Verification Feed</h3>
              
              <div className="space-y-4" id="reviews-audit-mapping">
                {reviews.map((rev) => (
                  <div key={rev.id} className={`p-5 rounded-2xl border ${theme === "dark" ? "bg-slate-900/30 border-slate-950" : "bg-slate-50 border-slate-200"} flex flex-col justify-between text-left`}>
                    <div className="flex items-start justify-between flex-wrap gap-4 mb-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={rev.client_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rev.client_name)}`}
                          className="w-10 h-10 rounded-full"
                          alt="avatar"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="text-sm font-bold font-display">{rev.client_name}</h4>
                          <span className="text-[10px] font-mono opacity-50">Transmitted for: {rev.service_used} ({rev.date})</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5" id={`review-actions-${rev.id}`}>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono leading-none font-bold uppercase mr-2 ${
                          rev.status === "Approved" ? "bg-emerald-950 text-emerald-400" : "bg-amber-950 text-amber-500"
                        }`}>
                          {rev.status}
                        </span>
                        
                        {rev.status !== "Approved" && (
                          <button
                            onClick={() => {
                              updateReviewStatus(rev.id, "Approved");
                              setDashAlert("Review successfully approved and published on main channels.");
                              setTimeout(() => setDashAlert(null), 3000);
                            }}
                            className="p-1 px-2 h-7 rounded bg-emerald-950/20 hover:bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold border border-emerald-900/40"
                          >
                            Approve
                          </button>
                        )}

                        <button
                          onClick={() => toggleReviewFeature(rev.id)}
                          className={`p-1 px-2 h-7 rounded text-xs font-mono font-bold border ${
                            rev.is_featured 
                              ? "bg-amber-950/30 text-amber-500 border-amber-800/40" 
                              : "bg-slate-800 text-slate-300 border-slate-700/50"
                          }`}
                        >
                          {rev.is_featured ? "Featured ★" : "Make Featured"}
                        </button>
                        
                        <button
                          onClick={() => {
                            deleteReview(rev.id);
                            setDashAlert("Review study log cleared successfully.");
                            setTimeout(() => setDashAlert(null), 3000);
                          }}
                          className="p-1.5 rounded bg-rose-950/20 text-rose-500 hover:bg-rose-500/10 border border-rose-800/20"
                          title="Purge review"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs opacity-85 leading-relaxed font-light pl-13 italic">"{rev.review_text}"</p>

                    {/* Supports Replies */}
                    {rev.reply_text ? (
                      <div className="mt-4 p-3.5 rounded-xl dark:bg-slate-950 bg-white border border-slate-200 dark:border-slate-900 text-xs pl-13">
                        <p className="font-bold text-cyan-500 font-mono text-[11px] mb-1">Diavox Official Response log:</p>
                        <p className="opacity-80">"{rev.reply_text}"</p>
                      </div>
                    ) : selectedReviewId === rev.id ? (
                      <div className="mt-4 pl-13 space-y-2">
                        <textarea
                          placeholder="Compose representative reply message..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-950 bg-white focus:outline-none"
                          rows={2}
                        />
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => setSelectedReviewId(null)} className="text-xs font-mono opacity-50">Cancel</button>
                          <button
                            onClick={() => handleReviewReplySubmit(rev.id)}
                            className="px-4 py-1.5 bg-gradient-to-tr from-cyan-500 to-sky-600 text-white rounded-lg text-xs font-mono font-bold"
                          >
                            Save Reply
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedReviewId(rev.id)}
                        className="mt-3 text-cyan-400 hover:underline text-xs flex items-center space-x-1 pl-13 font-mono font-bold"
                      >
                        <MessageSquare size={11} />
                        <span>Compose support reply</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: LIVE MESSAGING COCKPIT */}
          {activeTab === "chats" && (
            <div className="space-y-6" id="tab-client-chats font-sans">
              <div className="border-b dark:border-slate-900 border-slate-100 pb-3 text-left">
                <h3 className="text-lg font-display font-extrabold flex items-center space-x-2">
                  <MessageSquare className="text-cyan-500" size={20} />
                  <span>Diavox Helpdesk: Customer Live Assistance</span>
                </h3>
                <p className="text-xs opacity-65 mt-1 font-sans font-light leading-relaxed">
                  Select a live client communication line to send updates, schedule scopes, or publish proposal schemas directly.
                </p>
              </div>

              {(() => {
                const clientUsers = (allUsers as UserProfile[]).filter(u => u.role === "client" || u.id.startsWith("client-") || u.id === "client-test" || u.id === "client-guest");
                const msgSenderClientIds = Array.from(new Set((messages as Message[]).map(m => m.sender_id))).filter(id => id.startsWith("client-") || id === "client-test" || id === "client-guest" || id.startsWith("team-") === false);
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

                const handleHelpdeskSend = (e: React.FormEvent) => {
                  e.preventDefault();
                  if (!chatReplyMsg.trim()) return;
                  sendMessage(activeClient.id, chatReplyMsg);
                  setChatReplyMsg("");
                  setDashAlert(`Message dispatched successfully back to ${activeClient.name}`);
                  setTimeout(() => setDashAlert(null), 3000);
                };

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="helpdesk-grid-wrapper">
                    
                    {/* Left Channels Column */}
                    <div className="lg:col-span-4 space-y-3 text-left" id="helpdesk-client-channels">
                      <p className="text-[10px] font-mono uppercase tracking-wider opacity-60">Customer Channels</p>
                      <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
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
                              className={`w-full p-3.5 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                                isSelected 
                                  ? "bg-slate-900 border-cyan-500/30 text-white shadow relative overflow-hidden" 
                                  : "bg-slate-900/10 hover:bg-slate-900/20 dark:hover:bg-slate-900/35 border-transparent text-slate-400 dark:text-slate-300"
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-cyan-400" />
                              )}
                              <img
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(client.name)}`}
                                alt={client.name}
                                className="w-8 h-8 rounded-full bg-slate-950 shrink-0"
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
                    <div className="lg:col-span-8 flex flex-col h-[450px] rounded-2xl border dark:border-slate-900 border-slate-200 overflow-hidden text-left bg-slate-900/5" id="helpdesk-active-convo-window">
                      <div className="bg-slate-900 p-4 border-b dark:border-slate-950 border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activeClient.name)}`}
                            className="w-7 h-7 rounded-full bg-slate-950"
                            alt="recipient"
                          />
                          <div>
                            <h4 className="text-xs font-black text-white">{activeClient.name}</h4>
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5">{activeClient.email}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">SECURED LINE</span>
                      </div>

                      {/* Chat dialog feeds */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-3 dark:bg-slate-950/20 bg-slate-100/30 font-sans text-xs">
                        {activeConvo.map((m) => {
                          const isRepByAdmin = m.sender_id === currentUser.id || m.sender_id === "system-ai";
                          return (
                            <div key={m.id} className={`flex flex-col max-w-[80%] ${isRepByAdmin ? "ml-auto text-right items-end" : "mr-auto text-left items-start"}`}>
                              <span className="text-[9px] font-mono opacity-50 mb-1">{m.sender_name} ({m.sender_role.replace("_", " ")})</span>
                              <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                                isRepByAdmin 
                                  ? "bg-cyan-600 text-white" 
                                  : "dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 text-slate-900 dark:text-white"
                              }`}>
                                {m.message_text}
                              </div>
                            </div>
                          );
                        })}
                        {activeConvo.length === 0 && (
                          <p className="text-xs font-mono opacity-40 text-center py-20">Type a message below to coordinate directly with this client.</p>
                        )}
                      </div>

                      {/* Reply form */}
                      <form onSubmit={handleHelpdeskSend} className="p-3 bg-slate-80 bg-slate-100 dark:bg-slate-900 border-t dark:border-slate-950 border-slate-150 flex gap-2">
                        <input
                          type="text"
                          value={chatReplyMsg}
                          onChange={(e) => setChatReplyMsg(e.target.value)}
                          placeholder={`Type live helpdesk reply back to ${activeClient.name}...`}
                          className={`flex-1 text-xs p-2.5 rounded-lg border focus:outline-none ${
                            theme === "dark" 
                              ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500" 
                              : "bg-white border-slate-205 text-slate-900 placeholder-slate-400"
                          }`}
                        />
                        <button
                          type="submit"
                          className="px-4 rounded-lg text-xs font-mono font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600"
                        >
                          Send Message
                        </button>
                      </form>
                    </div>

                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 8: ACTIVITY AUDIT LOGS REGISTRY */}
          {activeTab === "audit" && ["secret_admin", "primary_admin", "secondary_admin"].includes(currentUser.role) && (
            <div className="space-y-6" id="tab-audit-logs">
              <div className="border-b dark:border-slate-900 border-slate-100 pb-3 text-left">
                <h3 className="text-lg font-display font-extrabold flex items-center space-x-2">
                  <History className="text-cyan-500" size={20} />
                  <span>Administrative Activity Log Registry</span>
                </h3>
                <p className="text-xs opacity-65 mt-1 font-light">
                  Real-time tamper-resistant log tracking system capturing administrative activities, settings updates, and privilege assignments across the Diavox platform.
                </p>
              </div>

              {/* Filters row */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/40 p-4 rounded-xl border dark:border-slate-900 border-slate-200">
                <div className="relative flex-1 w-full text-left">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Search logs by action, email, or IP..."
                    className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border dark:border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0 justify-end">
                  <Filter size={12} className="text-slate-400" />
                  <select
                    value={auditRoleFilter}
                    onChange={(e) => setAuditRoleFilter(e.target.value)}
                    className="text-xs p-2 rounded-lg border dark:border-slate-800 bg-slate-950 text-slate-300 focus:outline-none"
                  >
                    <option value="all">All Roles</option>
                    <option value="secret_admin">Secret Admin</option>
                    <option value="primary_admin">Primary Admin</option>
                    <option value="secondary_admin">Secondary Admin</option>
                    <option value="third_admin">Third Admin</option>
                    <option value="team_member">Team Member</option>
                  </select>

                  <button
                    onClick={() => {
                      const textData = activityLogs.map(l => `[${l.timestamp}] - ID: ${l.user_id} | Email: ${l.user_email} | Role: ${l.role} | IP: ${l.ip_address} | Action: ${l.action} | Prev: ${l.previous_value} | Next: ${l.new_value}`).join("\n");
                      const blob = new Blob([textData], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "diavox_audit_logs.txt";
                      a.click();
                      setDashAlert("System Audit Logs downloaded successfully.");
                      setTimeout(() => setDashAlert(null), 3000);
                    }}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-mono font-bold text-white bg-slate-900 border dark:border-slate-800 hover:bg-slate-850"
                  >
                    <Download size={13} />
                    <span>Download TXT</span>
                  </button>
                </div>
              </div>

              {/* Monospace Logs list */}
              <div className="overflow-x-auto rounded-xl border dark:border-slate-900 border-slate-200">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-900/70 border-b dark:border-slate-900 border-slate-200 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="p-4">Timestamp (UTC) / IP</th>
                      <th className="p-4">Executor / Role</th>
                      <th className="p-4">Action Performed</th>
                      <th className="p-4">Previous Value</th>
                      <th className="p-4">New Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-900 divide-slate-100 font-mono text-left">
                    {activityLogs
                      .filter(log => {
                        const term = auditSearch.toLowerCase();
                        const matchesTerm = (log.action || "").toLowerCase().includes(term) || (log.user_email || "").toLowerCase().includes(term) || (log.ip_address || "").includes(term);
                        const matchesRole = auditRoleFilter === "all" || log.role === auditRoleFilter;
                        return matchesTerm && matchesRole;
                      })
                      .map((log) => (
                        <tr key={log.id} className="dark:hover:bg-slate-900/20 hover:bg-slate-50/40">
                          <td className="p-4 whitespace-nowrap leading-tight">
                            <p className="font-bold text-slate-200">{log.timestamp}</p>
                            <p className="text-[10px] opacity-40 mt-0.5">{log.ip_address}</p>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <p className="text-slate-205 font-sans text-slate-200">{log.user_email}</p>
                            <span className={`inline-block text-[9px] px-1.5 rounded uppercase font-bold mt-1 ${
                              log.role === "secret_admin" ? "bg-rose-550/20 text-rose-400" :
                              log.role === "primary_admin" ? "bg-cyan-550/20 text-cyan-400" :
                              log.role === "secondary_admin" ? "bg-purple-550/20 text-purple-400" :
                              "bg-slate-700/25 text-slate-300"
                            }`}>
                              {log.role.replace("_", " ")}
                            </span>
                          </td>
                          <td className="p-4 min-w-[200px] text-xs font-sans text-slate-200 leading-relaxed">
                            {log.action}
                          </td>
                          <td className="p-4 text-[10px] max-w-[150px] truncate opacity-50" title={log.previous_value}>
                            {log.previous_value || "-"}
                          </td>
                          <td className="p-4 text-[10px] max-w-[150px] truncate text-emerald-400 font-bold" title={log.new_value}>
                            {log.new_value || "-"}
                          </td>
                        </tr>
                      ))}
                    {activityLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-12 text-center opacity-40">No matching activities captured in server memory.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: INVOICES & BILLING WITH RAZORPAY AND SUBSCRIPTIONS */}
          {activeTab === "billing" && ["secret_admin", "primary_admin", "secondary_admin"].includes(currentUser.role) && (
            <div className="space-y-6" id="tab-billing">
              <div className="border-b dark:border-slate-900 border-slate-100 pb-3 text-left">
                <h3 className="text-lg font-display font-extrabold flex items-center space-x-2">
                  <CreditCard className="text-cyan-500" size={20} />
                  <span>Invoices & Billing Panel</span>
                </h3>
                <p className="text-xs opacity-65 mt-1 font-light">
                  Provision new invoices, audit received payments, monitor project milestones (advance, midway, final), and manage Razorpay AutoPay subscription products.
                </p>
              </div>

              {/* Overview widgets */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                <div className="bg-slate-900/60 p-4 rounded-xl border dark:border-slate-800 border-slate-200">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Raised Amount</p>
                  <h4 className="text-xl font-bold font-display text-white mt-1">
                    ${invoices.reduce((acc, inv) => acc + (parseInt(inv.amount) || 0), 0).toLocaleString()}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1">Sum of all generated client invoices</p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border dark:border-slate-800 border-slate-200">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Cleared Revenue</p>
                  <h4 className="text-xl font-bold font-display text-emerald-450 text-emerald-400 mt-1">
                    ${invoices.filter(i => i.status === "paid").reduce((acc, inv) => acc + (parseInt(inv.amount) || 0), 0).toLocaleString()}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1">Cleared invoice revenue in ledger</p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border dark:border-slate-800 border-slate-200">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Pending Outstandings</p>
                  <h4 className="text-xl font-bold font-display text-amber-500 text-amber-400 mt-1">
                    ${invoices.filter(i => i.status === "unpaid").reduce((acc, inv) => acc + (parseInt(inv.amount) || 0), 0).toLocaleString()}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1">Awaiting client payment checkouts</p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border dark:border-slate-800 border-slate-200">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">AutoPay Subscriptions</p>
                  <h4 className="text-xl font-bold font-display text-cyan-400 mt-1">
                    Active (3 Users)
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1">Monthly subscriptions processed hands-free</p>
                </div>
              </div>

              {/* Creator form for Invoices & Milestone progress */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
                
                {/* Provision Invoice Form */}
                <div className="lg:col-span-5 bg-slate-900/30 p-5 rounded-2xl border dark:border-slate-900 border-slate-200 space-y-4">
                  <h4 className="text-xs font-mono font-bold tracking-widest uppercase border-b dark:border-slate-900 pb-2 text-slate-200">Generate Invoice</h4>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!invAmount || !invServices) return;
                    const taxVal = Math.round(parseInt(invAmount) * 0.18).toString();
                    addInvoice({
                      invoice_number: invNum,
                      client_id: invClientId,
                      client_name: invClientName,
                      client_email: invClientEmail,
                      services: invServices,
                      amount: invAmount,
                      taxes: taxVal,
                      due_date: invDueDate,
                      status: "unpaid"
                    });
                    addActivityLog(currentUser.id, `Created dynamic client invoice ${invNum}`, "", `Amount: $${invAmount}, Tax: $${taxVal}`);
                    setDashAlert(`Invoice ${invNum} generated successfully and synced.`);
                    setInvNum("DX-2026-" + Math.floor(Math.random() * 900 + 100));
                    setTimeout(() => setDashAlert(null), 3000);
                  }} className="space-y-3 font-sans text-xs">
                    <div>
                      <label className="text-[10px] font-mono opacity-50 block mb-1">Invoice Number</label>
                      <input type="text" value={invNum} onChange={e => setInvNum(e.target.value)} className="w-full bg-slate-950 border dark:border-slate-800 p-2.5 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono opacity-50 block mb-1">Client Name & ID (Assignee)</label>
                      <select value={invClientId} onChange={e => {
                        const targetUser = allUsers.find(u => u.id === e.target.value);
                        if (targetUser) {
                          setInvClientId(targetUser.id);
                          setInvClientName(targetUser.name);
                          setInvClientEmail(targetUser.email);
                        }
                      }} className="w-full bg-slate-950 p-2.5 rounded-lg text-white border dark:border-slate-800">
                        {allUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono opacity-50 block mb-1">Service / Description</label>
                      <input type="text" value={invServices} onChange={e => setInvServices(e.target.value)} className="w-full bg-slate-950 border dark:border-slate-800 p-2.5 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono opacity-50 block mb-1">Amount (USD)</label>
                      <input type="number" value={invAmount} onChange={e => setInvAmount(e.target.value)} className="w-full bg-slate-950 border dark:border-slate-800 p-2.5 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono opacity-50 block mb-1">Due Date</label>
                      <input type="date" value={invDueDate} onChange={e => setInvDueDate(e.target.value)} className="w-full bg-slate-950 border dark:border-slate-800 p-2.5 rounded-lg text-white" />
                    </div>
                    <button type="submit" className="w-full p-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg text-white font-mono font-bold uppercase text-[10px] hover:brightness-110">
                      Generate & Sync Invoice
                    </button>
                  </form>
                </div>

                {/* Invoices List table */}
                <div className="lg:col-span-7 bg-slate-900/30 p-5 rounded-2xl border dark:border-slate-900 border-slate-200 space-y-4">
                  <h4 className="text-xs font-mono font-bold tracking-widest uppercase border-b dark:border-slate-900 pb-2 text-slate-200">Active Invoices Registry</h4>
                  <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1">
                    {invoices.map((inv) => (
                      <div key={inv.id} className="p-3.5 bg-slate-950/40 rounded-xl border dark:border-slate-850 flex justify-between items-center text-xs">
                        <div className="leading-relaxed text-left">
                          <p className="font-bold text-slate-200">{inv.invoice_number} - {inv.client_name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{inv.services}</p>
                          <p className="text-[10px] text-slate-500 mt-1">Due: {inv.due_date} | Tax (18%): ${inv.taxes}</p>
                        </div>
                        <div className="text-right space-y-2 shrink-0">
                          <p className="font-extrabold text-cyan-405 text-cyan-400 font-mono">${inv.amount}</p>
                          <div className="flex gap-1.5 justify-end">
                            <select
                              value={inv.status}
                              onChange={(e) => {
                                const newStat = e.target.value as "paid" | "unpaid" | "cancelled";
                                updateInvoiceStatus(inv.id, newStat);
                                addActivityLog(currentUser.id, `Status update on invoice ${inv.invoice_number}`, inv.status, newStat);
                                if (newStat === "paid") {
                                  addPayment({
                                    payment_id: "pay_manual_" + Math.random().toString(36).substring(4),
                                    transaction_id: "txn_man_" + Math.random().toString(36).substring(4),
                                    amount: inv.amount,
                                    method: "Admin Direct Ledger Clear",
                                    date: new Date().toISOString().split("T")[0],
                                    invoice_id: inv.id,
                                    client_id: inv.client_id
                                  });
                                }
                                setDashAlert(`Invoice ${inv.invoice_number} changed to ${newStat}`);
                                setTimeout(() => setDashAlert(null), 3000);
                              }}
                              className="text-[10px] bg-slate-950 border dark:border-slate-800 p-1.5 rounded font-mono text-white focus:outline-none"
                            >
                              <option value="unpaid">Unpaid</option>
                              <option value="paid">Paid</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Milestone Tracking sub-panel */}
              <div className="p-5 rounded-2xl bg-slate-900/20 border dark:border-slate-900 text-left space-y-4">
                <h4 className="text-xs font-mono font-bold tracking-widest uppercase border-b dark:border-slate-900 pb-2 text-slate-200">Project Milestone Disbursements (30% - 40% - 30%)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {milestones.map((mile) => {
                    return (
                      <div key={mile.id} className="p-4 bg-slate-950/40 rounded-xl border dark:border-slate-850 space-y-3 font-sans text-xs">
                        <div className="flex justify-between font-bold border-b dark:border-slate-800 pb-2">
                          <span className="text-slate-200">{mile.project_title}</span>
                          <span className="font-mono text-cyan-400">${mile.total_budget.toLocaleString()}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 leading-tight">
                          <div className={`p-2 rounded-lg text-center ${mile.advance_paid ? "bg-emerald-950/30 border border-emerald-500/20" : "bg-slate-900/40 border dark:border-slate-800"}`}>
                            <p className="text-[10px] font-mono opacity-50">Advance (30%)</p>
                            <p className="font-mono text-xs font-bold mt-1 text-slate-200">${mile.advance_amount}</p>
                            <button
                              onClick={() => {
                                if (mile.advance_paid) return;
                                payMilestone(mile.id, "advance");
                                addActivityLog(currentUser.id, `Cleared Advance milestone for ${mile.project_title}`, "false", "true");
                              }}
                              className={`w-full mt-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase ${
                                mile.advance_paid ? "bg-emerald-500/20 text-emerald-400 cursor-default" : "bg-cyan-600 hover:bg-cyan-500 text-white"
                              }`}
                            >
                              {mile.advance_paid ? "Paid" : "Mark paid"}
                            </button>
                          </div>
                          <div className={`p-2 rounded-lg text-center ${mile.midway_paid ? "bg-emerald-950/30 border border-emerald-500/20" : "bg-slate-900/40 border dark:border-slate-800"}`}>
                            <p className="text-[10px] font-mono opacity-50">Midway (40%)</p>
                            <p className="font-mono text-xs font-bold mt-1 text-slate-200">${mile.midway_amount}</p>
                            <button
                              onClick={() => {
                                if (mile.midway_paid) return;
                                payMilestone(mile.id, "midway");
                                addActivityLog(currentUser.id, `Cleared Midway milestone for ${mile.project_title}`, "false", "true");
                              }}
                              className={`w-full mt-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase ${
                                mile.midway_paid ? "bg-emerald-500/20 text-emerald-400 cursor-default" : "bg-cyan-600 hover:bg-cyan-500 text-white"
                              }`}
                            >
                              {mile.midway_paid ? "Paid" : "Mark paid"}
                            </button>
                          </div>
                          <div className={`p-2 rounded-lg text-center ${mile.final_paid ? "bg-emerald-950/30 border border-emerald-500/20" : "bg-slate-900/40 border dark:border-slate-800"}`}>
                            <p className="text-[10px] font-mono opacity-50">Final (30%)</p>
                            <p className="font-mono text-xs font-bold mt-1 text-slate-200">${mile.final_amount}</p>
                            <button
                              onClick={() => {
                                if (mile.final_paid) return;
                                payMilestone(mile.id, "final");
                                addActivityLog(currentUser.id, `Cleared Final milestone for ${mile.project_title}`, "false", "true");
                              }}
                              className={`w-full mt-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase ${
                                mile.final_paid ? "bg-emerald-500/20 text-emerald-400 cursor-default" : "bg-cyan-600 hover:bg-cyan-500 text-white"
                              }`}
                            >
                              {mile.final_paid ? "Paid" : "Mark paid"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Webhook logs display */}
              <div className="p-5 rounded-2xl bg-slate-900/20 border dark:border-slate-900 text-left space-y-4">
                <h4 className="text-xs font-mono font-bold tracking-widest uppercase border-b dark:border-slate-900 pb-2 text-slate-200">Razorpay Webhook Stream Listeners (AutoPay logs)</h4>
                <div className="bg-slate-950 p-4 rounded-xl border dark:border-slate-800 font-mono text-[10px] text-slate-300 leading-normal max-h-[150px] overflow-y-auto">
                  <p className="text-emerald-400 font-bold">[2026-06-11 12:44:03] - EVENT: payment.captured | TXN: txn_238491823 | STS: active</p>
                  <p className="text-cyan-400">[2026-06-11 10:15:30] - EVENT: subscription.activated | SUB_ID: sub_DX39485 | STS: running</p>
                  <p className="text-slate-500">[2026-06-11 09:00:15] - EVENT: link.created | INV_ID: inv-x8z | STS: issued</p>
                  <p className="text-amber-500/80">[2026-06-10 18:22:11] - EVENT: subscription.charged | SUB_ID: sub_DX12948 | STS: AutoPay_success</p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 10: AI KNOWLEDGE BASE TRAINING CORE */}
          {activeTab === "aitrain" && ["secret_admin", "primary_admin"].includes(currentUser.role) && (
            <div className="space-y-6" id="tab-ai-training">
              <div className="border-b dark:border-slate-900 border-slate-100 pb-3 text-left">
                <h3 className="text-lg font-display font-extrabold flex items-center space-x-2">
                  <Cpu className="text-cyan-500" size={20} />
                  <span>Intelligent AI Co-pilot Training Core</span>
                </h3>
                <p className="text-xs opacity-65 mt-1 font-light">
                  Input custom Q&As to seed the Diavox semantic knowledge base. Stored responses automatically dictate recommendations and answers dispatched back on client support threads.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left font-sans text-xs">
                {/* Form column */}
                <div className="lg:col-span-5 bg-slate-900/30 p-5 rounded-2xl border dark:border-slate-900 border-slate-200 space-y-4">
                  <h4 className="text-xs font-mono font-bold tracking-widest uppercase border-b dark:border-slate-900 pb-2 text-slate-250">Train New Q&A Block</h4>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!aiQ.trim() || !aiA.trim()) return;
                    addAiKnowledge(aiCat, aiQ.trim(), aiA.trim());
                    addActivityLog(currentUser.id, `Trained AI conversational agent on question: "${aiQ.substring(0, 30)}..."`, "", `Category: ${aiCat}`);
                    setAiQ("");
                    setAiA("");
                    setDashAlert("AI knowledge seeded and actively deployed.");
                    setTimeout(() => setDashAlert(null), 3000);
                  }} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-mono opacity-50 block mb-1">Knowledge Topic Category</label>
                      <select value={aiCat} onChange={e => setAiCat(e.target.value)} className="w-full bg-slate-950 p-2.5 rounded-lg border dark:border-slate-800 text-white">
                        <option value="General Pricing">General Pricing</option>
                        <option value="Turnaround Time">Turnaround Time</option>
                        <option value="Core Tech Stack">Core Tech Stack</option>
                        <option value="API Integration">API Integration</option>
                        <option value="Subscription Cancellation">Subscription Cancellation</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono opacity-50 block mb-1">Target Client Question (Keywords Matched)</label>
                      <input
                        type="text"
                        value={aiQ}
                        onChange={e => setAiQ(e.target.value)}
                        placeholder="e.g., Do you support React Native?"
                        className="w-full bg-slate-950 border dark:border-slate-800 p-2.5 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono opacity-50 block mb-1">Trained Responder Insight (Answer)</label>
                      <textarea
                        value={aiA}
                        onChange={e => setAiA(e.target.value)}
                        rows={4}
                        placeholder="Type the exact expert response description you'd like the chatbot to output..."
                        className="w-full bg-slate-950 border dark:border-slate-800 p-2.5 rounded-lg text-white focus:outline-none"
                      />
                    </div>
                    <button type="submit" className="w-full p-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg text-white font-mono font-bold uppercase tracking-wide cursor-pointer hover:brightness-110">
                      Seed AI brain
                    </button>
                  </form>
                </div>

                {/* Stored brain list */}
                <div className="lg:col-span-7 bg-slate-900/30 p-5 rounded-2xl border dark:border-slate-900 border-slate-200 space-y-4">
                  <h4 className="text-xs font-mono font-bold tracking-widest uppercase border-b dark:border-slate-900 pb-2 text-slate-200">Active AI Synapses</h4>
                  <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                    {aiKnowledge.map((k) => (
                      <div key={k.id} className="p-3.5 bg-slate-950/40 rounded-xl border dark:border-slate-850 leading-relaxed text-left space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono uppercase bg-cyan-950 text-cyan-400 font-bold px-2 py-0.5 rounded border border-cyan-800/10">{k.category}</span>
                          <button
                            onClick={() => {
                              deleteAiKnowledge(k.id);
                              addActivityLog(currentUser.id, `Deleted trained synapse block "${k.question.substring(0, 20)}..."`, k.question, "DELETED");
                              setDashAlert("Synapse block deleted from core memory.");
                              setTimeout(() => setDashAlert(null), 3000);
                            }}
                            className="text-rose-500 hover:text-rose-400 shrink-0"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <p className="font-bold text-slate-200">Q: "{k.question}"</p>
                        <p className="opacity-75 text-slate-300 bg-slate-900/10 p-2.5 rounded-lg border dark:border-slate-900 text-[11px]">A: {k.answer}</p>
                      </div>
                    ))}
                    {aiKnowledge.length === 0 && (
                      <p className="text-center opacity-40 py-20 text-slate-400">AI knowledge base is currently empty. Train the synapses on the left.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: WEBSITE CMS CONTROLLER (SECRET ADMIN ONLY) */}
          {activeTab === "cms" && ["secret_admin"].includes(currentUser.role) && (
            <div className="space-y-6" id="tab-cms-panel">
              <div className="border-b dark:border-slate-900 border-slate-100 pb-3 text-left">
                <h3 className="text-lg font-display font-extrabold flex items-center space-x-2">
                  <Layout className="text-cyan-500" size={20} />
                  <span>Website CMS Content Editor (no-code)</span>
                </h3>
                <p className="text-xs opacity-65 mt-1 font-light">
                  Exclusively for the **Secret Admin**. Live edit layout copywriting parameters without touching any raw code files.
                </p>
              </div>

              <div className="bg-slate-900/30 p-6 rounded-2xl border dark:border-slate-900 border-slate-200 text-left font-sans text-xs space-y-4 max-w-2xl">
                <h4 className="text-xs font-mono font-bold tracking-widest uppercase border-b dark:border-slate-900 pb-2 text-slate-200">Hero Section Content Controls</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1">Badge Copy Text</label>
                    <input
                      type="text"
                      value={cmsHeroBadge}
                      onChange={e => setCmsHeroBadge(e.target.value)}
                      className="w-full bg-slate-950 border dark:border-slate-800 p-2.5 rounded-lg text-white focus:outline-none focus:border-cyan-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1">Hero Title Typography Text</label>
                    <input
                      type="text"
                      value={cmsHeroTitle}
                      onChange={e => setCmsHeroTitle(e.target.value)}
                      className="w-full bg-slate-950 border dark:border-slate-800 p-2.5 rounded-lg text-white font-bold focus:outline-none focus:border-cyan-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono opacity-50 block mb-1">Hero Body Paragraph Copy</label>
                    <textarea
                      value={cmsHeroSubtitle}
                      onChange={e => setCmsHeroSubtitle(e.target.value)}
                      rows={5}
                      className="w-full bg-slate-950 border dark:border-slate-800 p-2.5 rounded-lg text-white focus:outline-none focus:border-cyan-500/40 leading-relaxed"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setCmsHeroTitle("Crafting Divine Aesthetic Digital High-Utility Systems");
                      setCmsHeroSubtitle("Diavox Tech helps modern brands establish a strong online presence and automate operational bottlenecks. We craft high-speed websites, bespoke SEO campaigns, AI automations, and downloadable digital assets that turn traffic into long-term growth.");
                      setCmsHeroBadge("Serving clients remote remote operations");
                    }}
                    className="px-4 py-2 border dark:border-slate-850 hover:bg-slate-850 text-slate-300 rounded-lg text-xs font-mono cursor-pointer"
                  >
                    Reset Defaults
                  </button>
                  <button
                    onClick={() => {
                      updateCmsContent({
                        heroTitle: cmsHeroTitle,
                        heroSubtitle: cmsHeroSubtitle,
                        heroBadge: cmsHeroBadge
                      });
                      addActivityLog(currentUser.id, "Executed structural Website CMS copy update", "Customized layout title", cmsHeroTitle);
                      setDashAlert("Website landing page updated in database.");
                      setTimeout(() => setDashAlert(null), 3000);
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg text-white font-mono font-bold hover:brightness-110 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Save size={13} />
                    <span>Apply website edits</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
