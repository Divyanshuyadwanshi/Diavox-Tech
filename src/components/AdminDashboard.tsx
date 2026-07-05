/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useStore } from "../store";
import { uploadFileToBucket } from "../supabase";
import { motion, AnimatePresence } from "motion/react";

// Import modular backoffice managers
import AdminBlogs from "./admin/AdminBlogs";
import AdminWorkProjects from "./admin/AdminWorkProjects";
import AdminOngoingProgress from "./admin/AdminOngoingProgress";
import AdminPortfolio from "./admin/AdminPortfolio";
import AdminTeamProfiles from "./admin/AdminTeamProfiles";
import AdminContracts from "./admin/AdminContracts";
import AdminActivePlans from "./admin/AdminActivePlans";
import AdminPayments from "./admin/AdminPayments";
import AdminQuotes from "./admin/AdminQuotes";
import AdminAiTraining from "./admin/AdminAiTraining";
import AdminCms from "./admin/AdminCms";
import AdminTeamChats from "./admin/AdminTeamChats";
import AdminProjectGroups from "./admin/AdminProjectGroups";
import HelpCenter from "./HelpCenter";
import TimelineCenter from "./TimelineCenter";

import { 
  BarChart3, Users, Briefcase, FileSignature, CheckCircle2, 
  Trash2, Plus, Edit2, Lock, Shield, UserCheck, AlertCircle, 
  MessageSquare, LockKeyhole, Mail, UserPlus, Star, Save, Tag, DollarSign, PlusCircle,
  History, CreditCard, Cpu, Layout, Eye, Download, Search, FileText, Filter,
  ChevronUp, ChevronDown, GripVertical, EyeOff, Globe, Clock, Upload,
  Facebook, Instagram, Linkedin, Twitter, Youtube, Github, HelpCircle, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from "lucide-react";
import { TeamDepartment, UserRole, RequestStatus, UserProfile, Message, PricingOption, PricingTierObj } from "../types";

const getSocialIcon = (iconName: string) => {
  switch (iconName?.toLowerCase()) {
    case "facebook": return Facebook;
    case "instagram": return Instagram;
    case "linkedin": return Linkedin;
    case "x":
    case "twitter": return Twitter;
    case "youtube": return Youtube;
    case "github": return Github;
    default: return HelpCircle;
  }
};

export default function AdminDashboard() {
  const { 
    theme, currentUser, allUsers, projects, requests, reviews, metrics, messages, pricingOptions, blogs,
    addTeamMember, deleteTeamMember, updateTeamMember, addProject, updateProject, deleteProject,
    updateRequestStatus, updateProjectProgress, updateReviewStatus, toggleReviewFeature, replyToReview, 
    deleteReview, sendMessage, updatePricingOption, updatePricingTier, addPricingOption, deletePricingOption,
    activityLogs, invoices, payments, aiKnowledge, cmsContent, milestones, webhookLogs,
    addActivityLog, addInvoice, updateInvoiceStatus, addPayment, addAiKnowledge, updateAiKnowledge, deleteAiKnowledge,
    updateCmsContent, addMilestone, payMilestone, addWebhookLog, updateUserProfile,
    quoteReplies, quoteAttachments, quoteStatusHistory, submitQuoteReply, updateQuoteStatusDetail,
    socialMediaLinks, addSocialMediaLink, updateSocialMediaLink, deleteSocialMediaLink, reorderSocialMediaLinks,
    portfolioItems, privateMessages, teamGroups, teamMessages, projectGroups, aiTrainingFiles, planApprovals,
    addBlog, updateBlog, deleteBlog, addPortfolioItem, updatePortfolioItem, deletePortfolioItem,
    sendPrivateMessage, sendTeamMessage, createTeamGroup, createProjectGroup, deleteProjectGroup,
    addAiTrainingFile, deleteAiTrainingFile, submitPlanApproval, updatePlanApprovalStatus, markClientMessagesRead
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    | "profile"
    | "analytics"
    | "requests"
    | "pricing"
    | "reviews"
    | "settings"
    | "audit"
    | "cms"
    | "socials"
    | "blogs"
    | "work_projects"
    | "ongoing_progress"
    | "portfolio"
    | "team_profiles"
    | "contracts"
    | "active_plans"
    | "quotes"
    | "payments"
    | "team_chats"
    | "project_groups"
    | "chats"
    | "help-kb"
    | "timeline"
  >("profile");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Local state for searching/filtering quote requests
  const [requestSearch, setRequestSearch] = useState<string>("");
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>("All");
  const [expAdminReqId, setExpAdminReqId] = useState<string | null>(null);
  const [adminReplyInput, setAdminReplyInput] = useState<string>("");

  // Admin Profile management states
  const [profileName, setProfileName] = useState<string>(currentUser?.name || "");
  const [profileUsername, setProfileUsername] = useState<string>(currentUser?.username || "admin");
  const [profileAvatar, setProfileAvatar] = useState<string>(currentUser?.avatar_url || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150");
  const [passOld, setPassOld] = useState<string>("");
  const [passNew, setPassNew] = useState<string>("");
  const [passConfirm, setPassConfirm] = useState<string>("");
  const [showPassOld, setShowPassOld] = useState<boolean>(false);
  const [showPassNew, setShowPassNew] = useState<boolean>(false);
  const [showPassConfirm, setShowPassConfirm] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  
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

  useEffect(() => {
    if (selectedClientId) {
      markClientMessagesRead(selectedClientId);
    }
  }, [selectedClientId, messages.length, markClientMessagesRead]);

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

  // Social media link editor states
  const [newSmlPlat, setNewSmlPlat] = useState<string>("Facebook");
  const [newSmlUrl, setNewSmlUrl] = useState<string>("");
  const [newSmlIcon, setNewSmlIcon] = useState<string>("Facebook");
  const [editingSmlId, setEditingSmlId] = useState<string | null>(null);
  const [editSmlPlat, setEditSmlPlat] = useState<string>("");
  const [editSmlUrl, setEditSmlUrl] = useState<string>("");
  const [editSmlIcon, setEditSmlIcon] = useState<string>("");

  // CMS Content customizer states
  const [cmsHeroTitle, setCmsHeroTitle] = useState<string>(cmsContent?.heroTitle || "");
  const [cmsHeroSubtitle, setCmsHeroSubtitle] = useState<string>(cmsContent?.heroSubtitle || "");
  const [cmsHeroBadge, setCmsHeroBadge] = useState<string>(cmsContent?.heroBadge || "");
  const [cmsSections, setCmsSections] = useState<string[]>(
    cmsContent?.homepageSections || ["hero", "services", "portfolio", "team", "reviews", "pricing", "blog", "contact"]
  );
  const [cmsVisibility, setCmsVisibility] = useState<Record<string, boolean>>(
    cmsContent?.sectionVisibility || {
      hero: true,
      services: true,
      portfolio: true,
      team: true,
      reviews: true,
      pricing: true,
      blog: true,
      contact: true
    }
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || "");
      setProfileUsername(currentUser.username || currentUser.email?.split("@")[0] || "admin");
      setProfileAvatar(currentUser.avatar_url || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150");
    }
  }, [currentUser]);

  useEffect(() => {
    const preselected = localStorage.getItem("preselected_tab");
    if (preselected === "chat") {
      setActiveTab("chats");
      localStorage.removeItem("preselected_tab");
    }

    const linkedTab = localStorage.getItem("diavox_admin_active_tab");
    if (linkedTab) {
      setActiveTab(linkedTab as any);
      localStorage.removeItem("diavox_admin_active_tab");
    }
  }, []);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const reordered = [...cmsSections];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);

    setCmsSections(reordered);
    setDraggedIndex(null);
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    const reordered = [...cmsSections];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    setCmsSections(reordered);
  };

  const moveSectionDown = (index: number) => {
    if (index === cmsSections.length - 1) return;
    const reordered = [...cmsSections];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;
    setCmsSections(reordered);
  };

  const toggleSectionVisibility = (sectionKey: string) => {
    setCmsVisibility(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey] === false ? true : false
    }));
  };

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

  const handleCreateTeamMember = async (e: React.FormEvent) => {
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

    let initialPerms = ["view_assigned_projects", "update_progress", "upload_files"];
    if (teamRole === "secondary_admin") {
      initialPerms = ["view_assigned_projects", "update_progress", "upload_files", "view_leads", "manage_inquiries", "contact_clients", "upload_designs"];
    } else if (teamRole === "third_admin") {
      initialPerms = ["view_assigned_projects", "update_progress", "upload_files", "view_leads", "contact_clients"];
    }

    try {
      const newlyCreated = await addTeamMember(
        teamName,
        teamPosition,
        teamDept,
        resolvedEmail,
        formattedName + "_" + Math.random().toString(36).substring(4),
        teamRole,
        initialPerms,
        "DiavoxPass2026!",
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(teamName)}`
      );

      if (newlyCreated) {
        await updateTeamMember(newlyCreated.id, {
          portfolio: teamPortfolio || `https://portfolio.diavox.com/${formattedName}`,
          description: teamDescription || "Diavox system specialist deploying clean standard responsive components."
        });
      }

      setTeamName("");
      setTeamPosition("");
      setTeamDept("developer");
      setTeamRole("team_member");
      setTeamEmail("");
      setTeamPortfolio("");
      setTeamDescription("");
      
      setDashAlert(`Diavox team account created! Credentials matched. Email: ${resolvedEmail}. Temporary password: DiavoxPass2026!`);
      setTimeout(() => setDashAlert(null), 5000);
    } catch (err: any) {
      setDashAlert(`Error: Could not onboard team account. ${err.message || err}`);
      setTimeout(() => setDashAlert(null), 7000);
    }
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

      {/* Mobile Dashboard Nav Trigger */}
      <div className="lg:hidden flex items-center justify-between p-3.5 rounded-2xl border dark:bg-slate-900 bg-slate-50 dark:border-slate-800 border-slate-200 mb-6" id="admin-mobile-tab-trigger">
        <div className="flex items-center space-x-2.5">
          <span className="text-[10px] font-mono tracking-wider font-bold uppercase opacity-60">Admin Unit:</span>
          <span className="text-xs font-mono font-bold text-cyan-400 capitalize">{activeTab.replace("_", " ").replace("-", " ")}</span>
        </div>
        <button 
          onClick={() => setShowMobileSidebar(true)}
          className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 active:scale-95 transition-all cursor-pointer"
        >
          Navigate Section
        </button>
      </div>

      {/* Collapsible Mobile Sidebar Overlay Drawer */}
      <AnimatePresence>
        {showMobileSidebar && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileSidebar(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            
            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] p-6 shadow-2xl border-r flex flex-col justify-between lg:hidden overflow-y-auto ${
                theme === "dark" ? "bg-slate-950 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
              id="admin-mobile-drawer"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4 dark:border-slate-900 border-slate-100">
                  <div>
                    <p className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">NAVIGATION</p>
                    <h4 className="text-lg font-display font-bold">Admin Console</h4>
                  </div>
                  <button 
                    onClick={() => setShowMobileSidebar(false)} 
                    className="p-1.5 rounded-lg dark:bg-slate-900 bg-slate-100 dark:hover:bg-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Operations Menu inside Drawer */}
                <div className="space-y-1 py-1 flex flex-col overflow-y-auto max-h-[70vh] scrollbar-none" id="admin-mobile-sidebar-navigation">
                  
                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold px-2 pt-1 pb-1 text-left">Internal Ops</div>
                  
                  <button
                    onClick={() => { setActiveTab("profile"); setShowMobileSidebar(false); }}
                    className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "profile" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Shield size={14} className="text-cyan-500" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("analytics"); setShowMobileSidebar(false); }}
                    className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "analytics" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <BarChart3 size={14} />
                    <span>Reports</span>
                  </button>

                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold px-2 pt-3 pb-1 text-left">Content & Brand</div>

                  <button
                    onClick={() => { setActiveTab("blogs"); setShowMobileSidebar(false); }}
                    className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "blogs" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <FileText size={14} />
                    <span>Blogs</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("portfolio"); setShowMobileSidebar(false); }}
                    className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "portfolio" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Star size={14} />
                    <span>Our Work</span>
                  </button>

                  {["secret_admin", "primary_admin", "secondary_admin", "third_admin"].includes(currentUser.role) && (
                    <button
                      onClick={() => { setActiveTab("cms"); setShowMobileSidebar(false); }}
                      className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                        activeTab === "cms" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Layout size={14} />
                      <span>Website Content</span>
                    </button>
                  )}

                  {["secret_admin", "primary_admin", "secondary_admin", "third_admin"].includes(currentUser.role) && (
                    <button
                      onClick={() => { setActiveTab("socials"); setShowMobileSidebar(false); }}
                      className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                        activeTab === "socials" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Globe size={14} />
                      <span>Social Links</span>
                    </button>
                  )}

                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold px-2 pt-3 pb-1 text-left">Projects & Work</div>

                  <button
                    onClick={() => { setActiveTab("work_projects"); setShowMobileSidebar(false); }}
                    className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "work_projects" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Briefcase size={14} />
                    <span>My Tasks</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("ongoing_progress"); setShowMobileSidebar(false); }}
                    className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "ongoing_progress" ? "bg-cyan-950/50 border border-cyan-500/10 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <CheckCircle2 size={14} className="text-teal-400" />
                    <span>Ongoing Orders</span>
                  </button>

                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold px-2 pt-3 pb-1 text-left">Staffing & Intelligence</div>

                  <button
                    onClick={() => { setActiveTab("team_profiles"); setShowMobileSidebar(false); }}
                    className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "team_profiles" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Users size={14} />
                    <span>Team</span>
                  </button>

                  {(["secret_admin", "primary_admin", "secondary_admin"].includes(currentUser.role) || (currentUser.role === "team_member")) && (
                    <button
                      onClick={() => { setActiveTab("aitrain"); setShowMobileSidebar(false); }}
                      className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                        activeTab === "aitrain" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Cpu size={14} className="text-indigo-400" />
                      <span>AI Assistant</span>
                    </button>
                  )}

                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold px-2 pt-3 pb-1 text-left">Sales & Finance</div>

                  <button
                    onClick={() => { setActiveTab("quotes"); setShowMobileSidebar(false); }}
                    className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "quotes" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <FileSignature size={14} />
                    <span>Requests</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("contracts"); setShowMobileSidebar(false); }}
                    className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "contracts" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <FileText size={14} className="text-orange-400" />
                    <span>Contracts</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("billing"); setShowMobileSidebar(false); }}
                    className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "billing" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <CreditCard size={14} />
                    <span>Invoices</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("payments"); setShowMobileSidebar(false); }}
                    className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "payments" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <DollarSign size={14} className="text-emerald-400" />
                    <span>Payments</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("active_plans"); setShowMobileSidebar(false); }}
                    className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "active_plans" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Tag size={14} className="text-amber-400" />
                    <span>Active Plans</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("pricing"); setShowMobileSidebar(false); }}
                    className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "pricing" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Tag size={14} />
                    <span>Settings</span>
                  </button>

                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold px-2 pt-3 pb-1 text-left">Communication & Logs</div>

                  <button
                    onClick={() => { setActiveTab("team_chats"); setShowMobileSidebar(false); }}
                    className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "team_chats" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <MessageSquare size={14} className="text-indigo-400" />
                    <span>Messages</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("project_groups"); setShowMobileSidebar(false); }}
                    className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "project_groups" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Briefcase size={14} className="text-sky-400" />
                    <span>Groups</span>
                  </button>

                  {(["secret_admin", "primary_admin", "secondary_admin"].includes(currentUser.role) || 
                    (currentUser.role === "team_member" && currentUser.permissions?.includes("client_chat_access"))) && (
                    <button
                      onClick={() => { setActiveTab("chats"); setShowMobileSidebar(false); }}
                      className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                        activeTab === "chats" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      <MessageSquare size={14} className="text-teal-400" />
                      <span>Customer Chats</span>
                    </button>
                  )}

                  <button
                    onClick={() => { setActiveTab("reviews"); setShowMobileSidebar(false); }}
                    className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "reviews" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Star size={14} />
                    <span>Reviews</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("audit"); setShowMobileSidebar(false); }}
                    className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "audit" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <History size={14} />
                    <span>Alerts</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("help-kb"); setShowMobileSidebar(false); }}
                    className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "help-kb" ? "bg-cyan-950/50 border border-cyan-500/20 text-amber-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <HelpCircle size={14} className="text-amber-500" />
                    <span>Knowledge Desk</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("timeline"); setShowMobileSidebar(false); }}
                    className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "timeline" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Clock size={14} className="text-cyan-400" />
                    <span>Timeline</span>
                  </button>
                </div>
              </div>
              
              <div className="border-t pt-4 dark:border-slate-900 border-slate-100 text-center">
                <p className="text-[9px] font-mono opacity-50">Diavox Tech Admin Portal © 2026</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Grid wrapper - Left sidebar nav, Right full workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="admin-workspace-grid">
        
         {/* Navigation panel */}
        <div className={`hidden lg:flex ${isSidebarCollapsed ? "lg:col-span-1 items-center px-1.5" : "lg:col-span-3 p-4"} space-y-1.5 flex flex-col rounded-2xl bg-slate-900/40 border border-slate-800/60 max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 transition-all duration-300`} id="admin-sidebar-navigation">
          
          {/* Collapse/Expand Toggle Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="flex items-center justify-between p-2.5 rounded-xl w-full text-xs font-mono font-bold dark:bg-slate-950 bg-slate-100 hover:bg-slate-900 border dark:border-slate-800 border-slate-200 text-slate-400 hover:text-white transition-all cursor-pointer mb-2 shrink-0"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {!isSidebarCollapsed && <span>Toggle Sidebar</span>}
            {isSidebarCollapsed ? <ChevronsRight size={14} className="mx-auto" /> : <ChevronsLeft size={14} />}
          </button>

          {isSidebarCollapsed && (
            <style>{`
              #admin-sidebar-navigation button {
                justify-content: center !important;
                width: 2.40rem !important;
                height: 2.40rem !important;
                padding: 0 !important;
              }
              #admin-sidebar-navigation button span {
                display: none !important;
              }
              #admin-sidebar-navigation div {
                display: none !important;
              }
            `}</style>
          )}

          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold px-3 pt-2 pb-1 text-left">Internal Ops</div>
          
          <button
            onClick={() => setActiveTab("profile")}
            className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
              activeTab === "profile" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <Shield size={14} className="text-cyan-500" />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
              activeTab === "analytics" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 size={14} />
            <span>Reports</span>
          </button>

          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold px-3 pt-3 pb-1 text-left">Content & Brand</div>

          <button
            onClick={() => setActiveTab("blogs")}
            className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
              activeTab === "blogs" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <FileText size={14} />
            <span>Blogs</span>
          </button>

          <button
            onClick={() => setActiveTab("portfolio")}
            className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
              activeTab === "portfolio" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <Star size={14} />
            <span>Our Work</span>
          </button>

          {/* CMS: Visible to secret_admin, primary_admin, secondary_admin, third_admin */}
          {["secret_admin", "primary_admin", "secondary_admin", "third_admin"].includes(currentUser.role) && (
            <button
              onClick={() => setActiveTab("cms")}
              className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                activeTab === "cms" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
              }`}
            >
              <Layout size={14} />
              <span>Website Content</span>
            </button>
          )}

          {/* Socials: Visible to secret_admin, primary_admin, secondary_admin, third_admin */}
          {["secret_admin", "primary_admin", "secondary_admin", "third_admin"].includes(currentUser.role) && (
            <button
              onClick={() => setActiveTab("socials")}
              className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                activeTab === "socials" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
              }`}
            >
              <Globe size={14} />
              <span>Social Links</span>
            </button>
          )}

          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold px-3 pt-3 pb-1 text-left">Projects & Work</div>

          <button
            onClick={() => setActiveTab("work_projects")}
            className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
              activeTab === "work_projects" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <Briefcase size={14} />
            <span>My Tasks</span>
          </button>

          <button
            onClick={() => setActiveTab("ongoing_progress")}
            className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
              activeTab === "ongoing_progress" ? "bg-cyan-950/50 border border-cyan-500/10 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <CheckCircle2 size={14} className="text-teal-400" />
            <span>Ongoing Orders</span>
          </button>

          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold px-3 pt-3 pb-1 text-left">Staffing & Intelligence</div>

          <button
            onClick={() => setActiveTab("team_profiles")}
            className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
              activeTab === "team_profiles" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <Users size={14} />
            <span>Team</span>
          </button>

          {/* AI training accessible to secret_admin, primary_admin, secondary_admin, or team_member with permission */}
          {(["secret_admin", "primary_admin", "secondary_admin"].includes(currentUser.role) || (currentUser.role === "team_member")) && (
            <button
              onClick={() => setActiveTab("aitrain")}
              className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                activeTab === "aitrain" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
              }`}
            >
              <Cpu size={14} className="text-indigo-400" />
              <span>AI Assistant</span>
            </button>
          )}

          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold px-3 pt-3 pb-1 text-left">Sales & Finance</div>

          <button
            onClick={() => setActiveTab("quotes")}
            className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
              activeTab === "quotes" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <FileSignature size={14} />
            <span>Requests</span>
            {requests.filter(r => r.status === "Submitted").length > 0 && (
              <span className="bg-cyan-500 text-white text-[9px] rounded-full px-1.5 py-0.5 font-bold font-sans">
                {requests.filter(r => r.status === "Submitted").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("contracts")}
            className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
              activeTab === "contracts" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <FileText size={14} className="text-orange-400" />
            <span>Contracts</span>
          </button>

          <button
            onClick={() => setActiveTab("billing")}
            className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
              activeTab === "billing" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <CreditCard size={14} />
            <span>Invoices</span>
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
              activeTab === "payments" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <DollarSign size={14} className="text-emerald-400" />
            <span>Payments</span>
          </button>

          <button
            onClick={() => setActiveTab("active_plans")}
            className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
              activeTab === "active_plans" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <Tag size={14} className="text-amber-400" />
            <span>Active Plans</span>
          </button>

          <button
            onClick={() => setActiveTab("pricing")}
            className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
              activeTab === "pricing" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <Tag size={14} />
            <span>Settings</span>
          </button>

          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold px-3 pt-3 pb-1 text-left">Communication & Logs</div>

          <button
            onClick={() => setActiveTab("team_chats")}
            className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
              activeTab === "team_chats" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <MessageSquare size={14} className="text-indigo-400" />
            <span>Messages</span>
          </button>

          <button
            onClick={() => setActiveTab("project_groups")}
            className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
              activeTab === "project_groups" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <Briefcase size={14} className="text-sky-400" />
            <span>Groups</span>
          </button>

          {/* Client Chats: Restricted by permissions / RBAC for non-admin team members */}
          {(["secret_admin", "primary_admin", "secondary_admin"].includes(currentUser.role) || 
            (currentUser.role === "team_member" && currentUser.permissions?.includes("client_chat_access"))) && (
            <button
              onClick={() => setActiveTab("chats")}
              className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                activeTab === "chats" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
              }`}
            >
              <MessageSquare size={14} className="text-teal-400" />
              <span>Customer Chats</span>
              <span className="bg-emerald-500/10 text-emerald-400 text-[8px] rounded px-1 font-bold font-mono">RBAC</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("reviews")}
            className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
              activeTab === "reviews" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <Star size={14} />
            <span>Reviews</span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
              activeTab === "audit" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <History size={14} />
            <span>Alerts</span>
          </button>

          <button
            onClick={() => setActiveTab("help-kb")}
            className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
              activeTab === "help-kb" ? "bg-cyan-950/50 border border-cyan-500/20 text-amber-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <HelpCircle size={14} className="text-amber-500" />
            <span>Knowledge Desk</span>
          </button>

          <button
            onClick={() => setActiveTab("timeline")}
            className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
              activeTab === "timeline" ? "bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <Clock size={14} className="text-cyan-400" />
            <span>Operations Timeline</span>
          </button>
        </div>

        {/* Main Work Panels */}
        <div className={`${isSidebarCollapsed ? "lg:col-span-11" : "lg:col-span-9"} transition-all duration-300`} id="admin-workspace-pane">
          
          {/* TAB 0: ADMIN PROFILE PORTAL */}
          {activeTab === "profile" && (
            <div className="space-y-6" id="admin-tab-profile">
              <h3 className="text-lg font-display font-bold pb-3 border-b dark:border-slate-900 border-slate-100">My Admin Profile Portal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Avatar Controller */}
                <div className={`md:col-span-4 p-6 rounded-2xl border flex flex-col items-center justify-center text-center ${
                  theme === "dark" ? "bg-slate-900/30 border-slate-900" : "bg-slate-50 border-slate-200"
                }`} id="admin-avatar-mgmt">
                  <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold mb-4 font-sans">Corporate Badge</span>
                  
                  <div className="relative group mb-4">
                    <img 
                      src={profileAvatar} 
                      alt={profileName} 
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 rounded-full border-2 border-cyan-500 object-cover shadow-lg"
                    />
                    <div className="absolute inset-0 bg-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-mono uppercase tracking-widest">
                      ADMIN
                    </div>
                  </div>

                  {/* Drag and Drop File Upload */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={async (e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith("image/")) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setProfileAvatar(reader.result as string);
                          setConfirmDialog({
                            isOpen: true,
                            title: "Save Profile Badge Image?",
                            message: "Do you want to apply this badge image permanently?",
                            onConfirm: async () => {
                              try {
                                const ext = file.name.split('.').pop() || 'png';
                                const filePath = `${currentUser.id}_${Date.now()}.${ext}`;
                                const publicUrl = await uploadFileToBucket("profile-images", filePath, file);
                                const state = useStore.getState();
                                await state.updateUserProfile(currentUser.id, { avatar_url: publicUrl });
                                setProfileAvatar(publicUrl);
                              } catch (err) {
                                console.error("Permanent upload failed:", err);
                              }
                              setConfirmDialog(null);
                            }
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className={`p-4 rounded-xl border border-dashed text-xs cursor-pointer w-full transition-all ${
                      isDragOver 
                        ? "border-cyan-400 bg-cyan-500/10" 
                        : theme === "dark" 
                        ? "border-slate-800 bg-slate-950/40 hover:border-slate-700" 
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = async (e: any) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = async () => {
                            setProfileAvatar(reader.result as string);
                            try {
                              const ext = file.name.split('.').pop() || 'png';
                              const filePath = `${currentUser.id}_${Date.now()}.${ext}`;
                              const publicUrl = await uploadFileToBucket("profile-images", filePath, file);
                              const state = useStore.getState();
                              await state.updateUserProfile(currentUser.id, { avatar_url: publicUrl });
                              setProfileAvatar(publicUrl);
                            } catch (err) {
                              console.error("Permanent upload failed:", err);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                  >
                    <Save className="mx-auto text-cyan-400 mb-1.5" size={16} />
                    <p className="font-bold">Drop Corporate Badge</p>
                    <p className="opacity-50 text-[10px] mt-0.5">PNG, JPG up to 1MB</p>
                  </div>
                </div>

                {/* Info Fields */}
                <div className={`md:col-span-8 p-6 rounded-2xl border space-y-4 ${
                  theme === "dark" ? "bg-slate-900/30 border-slate-900" : "bg-slate-50 border-slate-200"
                }`} id="admin-info-form">
                  <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold block pb-1 border-b dark:border-slate-800 border-slate-200">System Clearance</span>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    setConfirmDialog({
                      isOpen: true,
                      title: "Confirm Admin Profile Edits?",
                      message: "Commit changes to your central account metadata variables?",
                      onConfirm: () => {
                        const state = useStore.getState();
                        state.updateUserProfile(currentUser.id, {
                          name: profileName,
                          username: profileUsername,
                          avatar_url: profileAvatar
                        });
                        setConfirmDialog(null);
                      }
                    });
                  }} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase opacity-60">Admin Full Name</label>
                        <input 
                          type="text" 
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors ${
                            theme === "dark" ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                          }`}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase opacity-60">Admin Username</label>
                        <input 
                          type="text" 
                          value={profileUsername}
                          onChange={(e) => setProfileUsername(e.target.value)}
                          className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors ${
                            theme === "dark" ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-950"
                          }`}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase opacity-60">Official Admin Email</label>
                        <input 
                          type="email" 
                          value={currentUser.email}
                          disabled
                          className="w-full p-2.5 rounded-xl text-xs border bg-slate-900/10 dark:bg-slate-950/45 dark:border-slate-800/80 border-slate-200 text-slate-400 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase opacity-60">Admin clearance rank</label>
                        <div className="p-2.5 rounded-xl border dark:border-slate-800 border-slate-200 text-xs font-mono font-bold tracking-wider text-rose-500 bg-rose-500/5 select-none uppercase">
                          👑 SUPER ADM CL-1 {["primary_admin", "secondary_admin", "third_admin"].includes(currentUser.role) ? "Admin" : currentUser.role.replace("_", " ")}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button 
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-600 hover:brightness-110 text-white font-mono text-xs font-bold transition-all"
                      >
                        Write Profile
                      </button>
                    </div>
                  </form>
                </div>

                {/* Password Reset Section */}
                <div className={`col-span-12 md:col-span-12 p-6 rounded-2xl border space-y-4 ${
                  theme === "dark" ? "bg-slate-900/30 border-slate-900" : "bg-slate-50 border-slate-200"
                }`} id="admin-pass-mgmt">
                  <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold block pb-1 border-b dark:border-slate-800 border-slate-200">Reset administration passkey</span>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (passNew !== passConfirm) {
                      alert("Passwords do not match!");
                      return;
                    }
                    setConfirmDialog({
                      isOpen: true,
                      title: "Reset Admin Password?",
                      message: "This will update your master security credentials.",
                      onConfirm: async () => {
                        try {
                          await updateUserProfile(currentUser.id, { password: passNew } as any);
                          setDashAlert("Your security passkey has been successfully updated in Supabase Auth.");
                          setTimeout(() => setDashAlert(null), 4000);
                        } catch (err) {
                          alert("Failed to reset password: " + err);
                        }
                        setPassOld("");
                        setPassNew("");
                        setPassConfirm("");
                        setConfirmDialog(null);
                      }
                    });
                  }} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase opacity-60">Current Key</label>
                      <div className="relative">
                        <input 
                          type={showPassOld ? "text" : "password"} 
                          value={passOld}
                          onChange={(e) => setPassOld(e.target.value)}
                          className={`w-full p-2.5 pr-10 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors ${
                            theme === "dark" ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                          }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassOld(!showPassOld)}
                          className="absolute right-3 top-3 text-slate-500 hover:text-cyan-550 transition-colors"
                        >
                          {showPassOld ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase opacity-60">Next Master Key</label>
                      <div className="relative">
                        <input 
                          type={showPassNew ? "text" : "password"} 
                          value={passNew}
                          onChange={(e) => setPassNew(e.target.value)}
                          className={`w-full p-2.5 pr-10 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors ${
                            theme === "dark" ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                          }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassNew(!showPassNew)}
                          className="absolute right-3 top-3 text-slate-500 hover:text-cyan-550 transition-colors"
                        >
                          {showPassNew ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="space-y-1 flex-1">
                        <label className="text-[10px] font-mono uppercase opacity-60">Re-type next key</label>
                        <div className="relative">
                          <input 
                            type={showPassConfirm ? "text" : "password"} 
                            value={passConfirm}
                            onChange={(e) => setPassConfirm(e.target.value)}
                            className={`w-full p-2.5 pr-10 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors ${
                              theme === "dark" ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                            }`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassConfirm(!showPassConfirm)}
                            className="absolute right-3 top-3 text-slate-500 hover:text-cyan-550 transition-colors"
                          >
                            {showPassConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>
                      <button 
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/10 font-mono text-xs font-bold transition-all h-[41px]"
                      >
                        Reset passkey
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          )}

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
          {/* MODULAR PORTFOLIO AND EDITORIAL TABS */}
          {activeTab === "blogs" && (
            <AdminBlogs />
          )}

          {activeTab === "portfolio" && (
            <AdminPortfolio />
          )}

          {activeTab === "work_projects" && (
            <AdminWorkProjects />
          )}

          {activeTab === "ongoing_progress" && (
            <AdminOngoingProgress />
          )}

          {activeTab === "team_profiles" && (
            <AdminTeamProfiles />
          )}

          {activeTab === "quotes" && (
            <AdminQuotes />
          )}

          {activeTab === "contracts" && (
            <AdminContracts />
          )}

          {activeTab === "active_plans" && (
            <AdminActivePlans />
          )}

          {activeTab === "payments" && (
            <AdminPayments />
          )}

          {activeTab === "team_chats" && (
            <AdminTeamChats />
          )}

          {activeTab === "project_groups" && (
            <AdminProjectGroups />
          )}

          {activeTab === "requests" && (
            <div className="space-y-6" id="tab-requests">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b dark:border-slate-900 border-slate-100 pb-3 gap-2">
                <div className="text-left">
                  <h3 className="text-lg font-display font-extrabold">Leads & Quotes Management Console</h3>
                  <p className="text-xs opacity-65">Review submitted quotes, maintain SLA timelines, change state statuses, and coordinate with clients directly.</p>
                </div>
              </div>
              
              {/* Search and filter bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    value={requestSearch}
                    onChange={(e) => setRequestSearch(e.target.value)}
                    placeholder="Search by client name, email, service type or message keywords..."
                    className={`w-full text-xs pl-9 p-2.5 rounded-lg border focus:outline-none ${
                        theme === "dark" ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                    }`}
                  />
                </div>

                <div className="w-full sm:w-[200px] flex items-center space-x-2">
                  <span className="text-[10px] font-mono opacity-50 uppercase whitespace-nowrap">Filter Status:</span>
                  <select
                    value={requestStatusFilter}
                    onChange={(e) => setRequestStatusFilter(e.target.value)}
                    className={`w-full text-xs p-2.5 rounded-lg border focus:outline-none ${
                      theme === "dark" ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-205 text-slate-900"
                    }`}
                  >
                    <option value="All">All statuses</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Quoted">Quoted</option>
                    <option value="Approved">Approved</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Quotes card listing */}
              <div className="space-y-4" id="leads-mapping-container">
                {requests.filter((req) => {
                  const mSearch = 
                    (req.client_name || "").toLowerCase().includes(requestSearch.toLowerCase()) ||
                    (req.client_email || "").toLowerCase().includes(requestSearch.toLowerCase()) ||
                    (req.service_type || "").toLowerCase().includes(requestSearch.toLowerCase()) ||
                    (req.description || "").toLowerCase().includes(requestSearch.toLowerCase());
                  
                  const mStatus = requestStatusFilter === "All" || req.status === requestStatusFilter;
                  return mSearch && mStatus;
                }).map((req) => (
                  <div key={req.id} className={`p-5 rounded-2xl border text-left ${theme === "dark" ? "bg-slate-900/30 border-slate-900" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <h4 className="text-sm font-bold font-display">{req.service_type}</h4>
                        <div className="flex items-center space-x-2.5 flex-wrap gap-y-1 mt-1">
                          <span className="text-[10px] font-mono opacity-50">From: {req.client_name} ({req.client_email})</span>
                          <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase truncate max-w-[150px]">ID: {req.id}</span>
                          <button
                            onClick={() => setExpAdminReqId(expAdminReqId === req.id ? null : req.id)}
                            className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-405 border border-cyan-500/20 uppercase transition-all"
                          >
                            {expAdminReqId === req.id ? "Hide details" : `Inspect Thread (${quoteReplies.filter(r => r.quote_id === req.id).length} Replies)`}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono opacity-50 font-bold uppercase">SLA status:</span>
                        <select
                          id={`change-state-${req.id}`}
                          value={req.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value as RequestStatus;
                            await updateQuoteStatusDetail(req.id, newStatus);
                            setDashAlert(`Quote ID: ${req.id} has been transitioned to status "${newStatus}" cleanly!`);
                            setTimeout(() => setDashAlert(null), 3000);
                          }}
                          className={`text-[11px] p-1.5 rounded-lg border focus:outline-none font-bold uppercase cursor-pointer ${
                            req.status === "Approved" || req.status === "Completed" || req.status === "In Progress"
                              ? "bg-emerald-950 text-emerald-400 border-emerald-900"
                              : req.status === "Rejected"
                              ? "bg-rose-950 text-rose-400 border-rose-900"
                              : "bg-slate-900 text-white border-slate-750"
                          }`}
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Quoted">Quoted</option>
                          <option value="Approved">Approved</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>

                    <p className="text-xs opacity-85 leading-relaxed font-light whitespace-pre-wrap">"{req.description}"</p>
                    {req.budget && (
                      <div className="mt-4 text-xs font-mono border-b dark:border-slate-800/30 border-slate-200/30 pb-4">
                        <span className="opacity-50">Proposed Budget: </span>
                        <span className="font-bold text-cyan-400">{req.budget}</span>
                      </div>
                    )}

                    {/* EXPANDED ADMIN DETAIL PANEL WITH TRANSITION TIMELINE AND REPLIES */}
                    {expAdminReqId === req.id && (
                      <div className="mt-5 space-y-6 animate-fade-in" id={`admin-expanded-panel-${req.id}`}>
                        
                        {/* Status history log listing */}
                        <div className="space-y-2">
                          <h5 className="text-[10px] font-mono opacity-50 uppercase tracking-widest">State Progression Timeline Records</h5>
                          <div className="space-y-1">
                            <div className="p-2 dark:bg-slate-950 bg-white border dark:border-slate-850 border-slate-200 rounded text-[10px] font-mono flex items-center justify-between">
                              <span className="text-slate-400">Step 1: Quote initialized as <strong className="text-white">Submitted</strong> by client</span>
                              <span className="opacity-40">System Record</span>
                            </div>
                            {quoteStatusHistory.filter(h => h.quote_id === req.id).map((history) => (
                              <div key={history.id} className="p-2 dark:bg-slate-950 bg-white border dark:border-slate-850 border-slate-200 rounded text-[10px] font-mono flex items-center justify-between flex-wrap gap-2">
                                <span className="opacity-80">
                                  Transition state changed to <strong className="text-cyan-405 uppercase font-black">{history.status}</strong> by <strong className="text-cyan-405">{history.changed_by_name}</strong> ({history.changed_by_role})
                                </span>
                                <span className="opacity-45 text-[9px]">{new Date(history.created_at).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Thread replies widget with user context */}
                        <div className="space-y-2">
                          <h5 className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Quote Negotiation Discussion Thread</h5>
                          
                          <div className="p-3 rounded-xl border dark:border-slate-850 border-slate-200 dark:bg-slate-950 bg-white space-y-3 max-h-[220px] overflow-y-auto">
                            {quoteReplies.filter(r => r.quote_id === req.id).map((reply) => {
                              const isMe = reply.sender_id === currentUser?.id;
                              return (
                                <div key={reply.id} className={`flex flex-col max-w-[85%] ${isMe ? "ml-auto text-right items-end" : "mr-auto text-left items-start"}`}>
                                  <div className="flex items-center space-x-1 opacity-55 text-[9px] font-mono mb-1">
                                    <span>{reply.sender_name}</span>
                                    <span>({reply.sender_role.replace("_", " ")})</span>
                                  </div>
                                  <div className={`p-2.5 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed ${
                                    isMe 
                                      ? "bg-purple-650 bg-cyan-600 text-white" 
                                      : "dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 text-slate-900 dark:text-white"
                                  }`}>
                                    {reply.message_text}
                                    
                                    {/* Uploaded attachments render */}
                                    {reply.attachments && reply.attachments.length > 0 && (
                                      <div className="mt-1.5 pt-1.5 border-t border-slate-100/20 text-[9px] font-mono flex flex-col gap-0.5 text-left">
                                        {reply.attachments.map(at => (
                                          <div key={at.id} className="flex items-center space-x-1">
                                            <span className="opacity-60">📎 Attachment:</span>
                                            <a href={at.file_url} className="underline text-cyan-300 hover:text-white shadow-sm" target="_blank" rel="noopener noreferrer">{at.file_name}</a>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            {quoteReplies.filter(r => r.quote_id === req.id).length === 0 && (
                              <p className="text-[10px] font-mono opacity-55 text-center py-8">Conversation thread is currently silent. Reply below to bid or advise the customer.</p>
                            )}
                          </div>

                          {/* Submit quote replies widget */}
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              if (!adminReplyInput.trim()) return;
                              await submitQuoteReply(req.id, adminReplyInput);
                              setAdminReplyInput("");
                            }}
                            className="flex gap-2 mt-2"
                          >
                            <input
                              type="text"
                              value={adminReplyInput}
                              onChange={(e) => setAdminReplyInput(e.target.value)}
                              placeholder="Message user: submit contract draft, proposal pricing or ask specs..."
                              className={`flex-1 text-xs px-3 py-2 rounded-lg border focus:outline-none ${
                                theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                              }`}
                            />
                            
                            <button
                              type="button"
                              onClick={() => {
                                const addInput = document.createElement("input");
                                addInput.type = "file";
                                addInput.onchange = async (evt: any) => {
                                  const filesObj = evt.target.files[0];
                                  if (filesObj) {
                                    await submitQuoteReply(req.id, `Uploaded proposal schema document: ${filesObj.name}`, [{ file_name: filesObj.name, file_url: "#" }]);
                                    setDashAlert(`Supplied client file: "${filesObj.name}" cleanly!`);
                                    setTimeout(() => setDashAlert(null), 3000);
                                  }
                                };
                                addInput.click();
                              }}
                              className={`px-3 py-2.5 rounded-lg border text-[11px] font-mono font-bold shrink-0 ${
                                theme === "dark" 
                                  ? "bg-slate-905 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850" 
                                  : "bg-white border-slate-205 text-slate-655 hover:bg-slate-50"
                              }`}
                              title="Attach agreement or quote spreadsheet"
                            >
                              📎 Attach Specs
                            </button>

                            <button
                              type="submit"
                              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-[11px] font-mono font-bold hover:brightness-110"
                            >
                              Reply Customer
                            </button>
                          </form>
                        </div>

                      </div>
                    )}
                  </div>
                ))}

                {requests.filter((req) => {
                  const mSearch = 
                    (req.client_name || "").toLowerCase().includes(requestSearch.toLowerCase()) ||
                    (req.client_email || "").toLowerCase().includes(requestSearch.toLowerCase()) ||
                    (req.service_type || "").toLowerCase().includes(requestSearch.toLowerCase()) ||
                    (req.description || "").toLowerCase().includes(requestSearch.toLowerCase());
                  
                  const mStatus = requestStatusFilter === "All" || req.status === requestStatusFilter;
                  return mSearch && mStatus;
                }).length === 0 && (
                  <p className="text-xs font-mono opacity-50 text-center py-10 font-sans">No matching quote action tickets found for query "{requestSearch}" or status filter.</p>
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
                
                {/* Mobile Card View (< 768px) */}
                <div className="block md:hidden space-y-4">
                  {allUsers.filter(u => ["secret_admin", "primary_admin", "secondary_admin", "third_admin", "team_member", "developer"].includes(u.role || "")).map((member) => (
                    <div key={member.id} className="p-4 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-slate-50 space-y-3">
                      <div className="flex justify-between items-start border-b dark:border-slate-800 border-slate-200 pb-2">
                        <div>
                          <span className="block font-bold text-sm text-cyan-400">{member.name} {member.id === currentUser.id && <span className="text-[9px] text-amber-500 font-mono uppercase ml-1">(You)</span>}</span>
                          <span className="block text-xs font-mono text-slate-400 mt-0.5">{member.email}</span>
                        </div>
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
                      </div>
                      <div className="space-y-1.5 text-xs font-mono">
                        <p><span className="text-slate-500">Department:</span> {member.department || "Admin Desk"}</p>
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-500">Permissions Set:</span>
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
                        </div>
                      </div>
                      <div className="pt-2 flex justify-end">
                        {canModifyUser(member) && member.id !== currentUser.id ? (
                          <div className="flex items-center space-x-2">
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
                              className="px-3 py-1.5 text-xs rounded bg-slate-800 text-cyan-400 hover:bg-slate-700 transition"
                            >
                              Edit Profile
                            </button>
                            <button
                              onClick={() => {
                                deleteTeamMember(member.id);
                                setDashAlert(`Decommissioned account: ${member.name}`);
                                setTimeout(() => setDashAlert(null), 3000);
                              }}
                              className="px-3 py-1.5 text-xs rounded bg-rose-950 text-rose-400 hover:bg-rose-900 transition"
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span className="opacity-40 italic text-[10px] select-none text-sans">No action allowed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View (>= 768px) */}
                <div className="hidden md:block overflow-x-auto rounded-2xl border dark:border-slate-900 border-slate-200 text-xs text-left">
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
                      {allUsers.filter(u => ["secret_admin", "primary_admin", "secondary_admin", "third_admin", "team_member", "developer"].includes(u.role || "")).map((member) => (
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
                const msgSenderClientIds = Array.from(new Set((messages as Message[]).filter(m => m.sender_role === "client").map(m => m.sender_id)));
                const clientIdsFromUsers = clientUsers.map(u => u.id);
                const allClientIds = Array.from(new Set([...clientIdsFromUsers, ...msgSenderClientIds])).filter(clientId => {
                  const u = (allUsers as UserProfile[]).find(usr => usr.id === clientId);
                  if (u) {
                    return u.role === "client";
                  }
                  return clientId !== "system-ai" && clientId !== "system-ai-expert" && clientId !== "admin-secret";
                });

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
                                {(() => {
                                  const clientUnreadCount = (messages as Message[]).filter(m => 
                                    m.sender_role === "client" && 
                                    m.sender_id === client.id && 
                                    (m.recipient_id === "team" || m.recipient_id === currentUser?.id) && 
                                    !m.is_read
                                  ).length;

                                  return (
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs font-bold font-sans truncate">{client.name}</p>
                                      {clientUnreadCount > 0 && (
                                        <span className="bg-cyan-500 text-slate-950 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full shrink-0 ml-1.5">
                                          {clientUnreadCount}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })()}
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
                                  ? "bg-cyan-600 text-white shadow-md text-left" 
                                  : "dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 text-slate-900 dark:text-white text-left"
                              }`}>
                                <div>{m.message_text}</div>
                                {m.file_url && (
                                  <div className="mt-2 pt-2 border-t border-white/10 dark:border-slate-800">
                                    {(m.is_image || /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(m.file_url)) ? (
                                      <img 
                                        src={m.file_url} 
                                        alt={m.file_name || "Attachment"} 
                                        className="max-w-xs max-h-48 rounded-lg object-cover border border-slate-700/50 shadow-sm"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : (
                                      <a 
                                        href={m.file_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className={`flex items-center space-x-1.5 p-1.5 rounded text-[11px] font-mono transition-all max-w-xs border ${
                                          isRepByAdmin
                                            ? "bg-cyan-700 hover:bg-cyan-800 text-white border-cyan-500/30"
                                            : "bg-slate-800 hover:bg-slate-850 text-cyan-400 border-slate-750"
                                        }`}
                                      >
                                        <span className="shrink-0">📎</span>
                                        <span className="truncate">{m.file_name || "Download Attachment"}</span>
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {activeConvo.length === 0 && (
                          <p className="text-xs font-mono opacity-40 text-center py-20">Type a message below to coordinate directly with this client.</p>
                        )}
                      </div>

                      {/* Reply form */}
                      <form onSubmit={handleHelpdeskSend} className="p-3 bg-slate-100 dark:bg-slate-900 border-t dark:border-slate-950 border-slate-150 flex gap-2">
                        {/* Manual upload paperclip trigger */}
                        <button 
                          type="button"
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.onchange = async (e: any) => {
                              const file = e.target.files[0];
                              if (file) {
                                try {
                                  setDashAlert(`Uploading "${file.name}" to secure storage...`);
                                  const path = `chats/${currentUser.id}/${Date.now()}_${file.name}`;
                                  const publicUrl = await uploadFileToBucket("chat-files", path, file);
                                  const isImg = file.type.startsWith("image/");
                                  sendMessage(activeClient.id, `Sent attachment: ${file.name}`, publicUrl, file.name, isImg);
                                  setDashAlert(`File "${file.name}" uploaded and shared with client.`);
                                  setTimeout(() => setDashAlert(null), 3500);
                                } catch (err: any) {
                                  setDashAlert(`Upload failed: ${err.message || err}`);
                                  setTimeout(() => setDashAlert(null), 5000);
                                }
                              }
                            };
                            input.click();
                          }}
                          className={`p-2.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center ${
                            theme === "dark" 
                              ? "bg-slate-950 border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white" 
                              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                          }`}
                          title="Upload attachment document"
                        >
                          <Upload size={14} />
                        </button>

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
              
              {/* Mobile Card View (< 768px) */}
              <div className="block md:hidden space-y-4 text-left font-mono">
                {activityLogs
                  .filter(log => {
                    const term = auditSearch.toLowerCase();
                    const matchesTerm = (log.action || "").toLowerCase().includes(term) || (log.user_email || "").toLowerCase().includes(term) || (log.ip_address || "").includes(term);
                    const matchesRole = auditRoleFilter === "all" || log.role === auditRoleFilter;
                    return matchesTerm && matchesRole;
                  })
                  .map(log => (
                  <div key={log.id} className="p-4 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-slate-50 space-y-3">
                    <div className="flex justify-between items-start border-b dark:border-slate-800 border-slate-200 pb-2">
                       <div>
                         <p className="font-bold text-xs text-slate-200">{log.timestamp}</p>
                         <p className="text-[10px] opacity-40 mt-0.5">{log.ip_address}</p>
                       </div>
                       <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold text-center ${
                          log.role === "secret_admin" ? "bg-rose-550/20 text-rose-400 border border-rose-500/10" :
                          log.role === "primary_admin" ? "bg-cyan-550/20 text-cyan-400 border border-cyan-500/10" :
                          log.role === "secondary_admin" ? "bg-purple-550/20 text-purple-400 border border-purple-500/10" :
                          "bg-slate-700/25 text-slate-300 border border-slate-700/50"
                        }`}>
                          {log.role.replace("_", " ")}
                        </span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                       <p className="text-slate-300"><span className="text-slate-500 font-bold">Executor:</span> <span className="font-sans">{log.user_email}</span></p>
                       <p className="text-slate-300"><span className="text-slate-500 font-bold">Action:</span> <span className="font-sans">{log.action}</span></p>
                    </div>
                    {(log.previous_value || log.new_value) && (
                      <div className="pt-2 border-t dark:border-slate-800 border-slate-200 space-y-1">
                         {log.previous_value && <p className="text-[10px] opacity-60 w-full truncate"><span className="text-slate-500 font-bold">Prev:</span> {log.previous_value}</p>}
                         {log.new_value && <p className="text-[10px] opacity-60 w-full truncate"><span className="text-slate-500 font-bold">New:</span> {log.new_value}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Table View (>= 768px) */}
              <div className="hidden md:block overflow-x-auto rounded-xl border dark:border-slate-900 border-slate-200">
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

          {activeTab === "help-kb" && (
            <div className="space-y-6 animate-fade-in text-left" id="admin-tab-help-kb animate-fade-in">
              <HelpCenter />
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="space-y-6 animate-fade-in text-left" id="admin-tab-timeline animate-fade-in">
              <TimelineCenter mode="admin" />
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
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!invAmount || !invServices) return;
                    const taxVal = Math.round(parseInt(invAmount) * 0.18).toString();
                    try {
                      await addInvoice({
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
                    } catch (err: any) {
                      console.error("Failed to generate invoice:", err);
                      setDashAlert(`Error generating invoice: ${err.message || err}`);
                    }
                    setTimeout(() => setDashAlert(null), 5000);
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
                              onChange={async (e) => {
                                const newStat = e.target.value as "paid" | "unpaid" | "cancelled";
                                try {
                                  await updateInvoiceStatus(inv.id, newStat);
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
                                } catch (err: any) {
                                  console.error("Failed to update invoice status:", err);
                                  setDashAlert(`Error updating invoice: ${err.message || err}`);
                                }
                                setTimeout(() => setDashAlert(null), 5000);
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
          {activeTab === "aitrain" && (
            <AdminAiTraining />
          )}

          {/* TAB 11: WEBSITE CMS CONTROLLER (SECRET & PRIMARY ADMIN, MORE) */}
          {activeTab === "cms" && ["secret_admin", "primary_admin", "secondary_admin", "third_admin"].includes(currentUser.role) && (
            <AdminCms />
          )}

          {/* TAB: SOCIAL MEDIA MANAGEMENT PORTAL */}
          {activeTab === "socials" && ["secret_admin", "primary_admin", "secondary_admin", "third_admin"].includes(currentUser.role) && (
            <div className="space-y-6" id="admin-tab-socials">
              <h3 className="text-lg font-display font-bold pb-3 border-b dark:border-slate-900 border-slate-100">Social Media Links Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Panel A: Create or Edit Link */}
                <div className="col-span-12 md:col-span-5 space-y-4">
                  <div className={`p-6 rounded-2xl border ${
                    theme === "dark" ? "bg-slate-950 border-slate-900" : "bg-white border-slate-200 shadow-sm"
                  }`}>
                    <h4 className="text-sm font-display font-bold text-cyan-400 mb-4">
                      {editingSmlId ? "Edit Connected Link" : "Add New Platform Link"}
                    </h4>
                    
                    <div className="space-y-3 text-left">
                      <div>
                        <label className="block text-[10px] font-mono tracking-wider uppercase opacity-60 mb-1">Platform Name</label>
                        <select
                          value={editingSmlId ? editSmlPlat : newSmlPlat}
                          onChange={(e) => editingSmlId ? setEditSmlPlat(e.target.value) : setNewSmlPlat(e.target.value)}
                          className={`w-full p-2.5 rounded-xl text-xs font-sans outline-none border focus:border-cyan-500/40 bg-transparent ${
                            theme === "dark" ? "border-slate-800 text-slate-200" : "border-slate-200 text-slate-800"
                          }`}
                        >
                          <option value="Facebook">Facebook</option>
                          <option value="Instagram">Instagram</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="X (Twitter)">X (Twitter)</option>
                          <option value="YouTube">YouTube</option>
                          <option value="GitHub">GitHub</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono tracking-wider uppercase opacity-60 mb-1">Destination URL</label>
                        <input
                          type="url"
                          placeholder="https://facebook.com/diavoxtech"
                          value={editingSmlId ? editSmlUrl : newSmlUrl}
                          onChange={(e) => editingSmlId ? setEditSmlUrl(e.target.value) : setNewSmlUrl(e.target.value)}
                          className={`w-full p-2.5 rounded-xl text-xs font-sans outline-none border focus:border-cyan-500/40 bg-transparent ${
                            theme === "dark" ? "border-slate-800 text-slate-200" : "border-slate-200 text-slate-800"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono tracking-wider uppercase opacity-60 mb-1">Vector Icon</label>
                        <select
                          value={editingSmlId ? editSmlIcon : newSmlIcon}
                          onChange={(e) => editingSmlId ? setEditSmlIcon(e.target.value) : setNewSmlIcon(e.target.value)}
                          className={`w-full p-2.5 rounded-xl text-xs font-sans outline-none border focus:border-cyan-500/40 bg-transparent ${
                            theme === "dark" ? "border-slate-800 text-slate-200" : "border-slate-200 text-slate-800"
                          }`}
                        >
                          <option value="Facebook">Facebook Icon</option>
                          <option value="Instagram">Instagram Icon</option>
                          <option value="LinkedIn">LinkedIn Icon</option>
                          <option value="X">X Icon</option>
                          <option value="YouTube">YouTube Icon</option>
                          <option value="GitHub">GitHub Icon</option>
                        </select>
                      </div>

                      <div className="pt-2 flex space-x-2">
                        {editingSmlId ? (
                          <>
                            <button
                              onClick={async () => {
                                try {
                                  await updateSocialMediaLink(editingSmlId, {
                                    platform: editSmlPlat,
                                    url: editSmlUrl,
                                    icon: editSmlIcon
                                  });
                                  addActivityLog(currentUser.id, `Modified social platform connection details for ${editSmlPlat}`, "Saved updates", editSmlUrl);
                                  setEditingSmlId(null);
                                  setDashAlert("Social link updated successfully.");
                                  setTimeout(() => setDashAlert(null), 3000);
                                } catch (err: any) {
                                  console.error("Failed to update social media link:", err);
                                  setDashAlert(`Error: ${err.message || "Failed to update social link"}`);
                                  setTimeout(() => setDashAlert(null), 6000);
                                }
                              }}
                              className="flex-1 py-1.5 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl text-white text-xs font-mono font-bold hover:brightness-110 flex items-center justify-center space-x-1"
                            >
                              <Save size={12} />
                              <span>Save Link</span>
                            </button>
                            <button
                              onClick={() => setEditingSmlId(null)}
                              className="p-1 px-3 border dark:border-slate-800 border-slate-200 rounded-xl hover:bg-slate-500/5 text-slate-400 text-xs font-mono"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={async () => {
                              if (!newSmlUrl.trim()) return;
                              try {
                                await addSocialMediaLink(newSmlPlat, newSmlUrl, newSmlIcon);
                                addActivityLog(currentUser.id, `Created dynamic social platform connection to ${newSmlPlat}`, "Saved brand links", newSmlUrl);
                                setNewSmlUrl("");
                                setDashAlert("Social link connected.");
                                setTimeout(() => setDashAlert(null), 3000);
                              } catch (err: any) {
                                console.error("Failed to add social media link:", err);
                                setDashAlert(`Error: ${err.message || "Failed to add social link"}`);
                                setTimeout(() => setDashAlert(null), 6000);
                              }
                            }}
                            className="w-full py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-xl text-white text-xs font-mono font-bold hover:brightness-110 flex items-center justify-center space-x-1"
                          >
                            <Plus size={12} />
                            <span>Add Platform Connection</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Panel B: Connected Social Links Layout List */}
                <div className="col-span-12 md:col-span-7 space-y-4 text-left">
                  <div className={`p-6 rounded-2xl border ${
                    theme === "dark" ? "bg-slate-950 border-slate-900" : "bg-white border-slate-200 shadow-sm"
                  }`}>
                    <h4 className="text-sm font-display font-bold text-slate-350 dark:text-slate-300 mb-3 flex items-center justify-between">
                      <span>Currently Connected Channels ({socialMediaLinks.length})</span>
                      <span className="text-[10px] font-mono text-cyan-400 font-normal">Saves dynamically to Supabase</span>
                    </h4>

                    {socialMediaLinks.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 font-mono text-xs">
                        No active dynamic social links configured. Connect a channel!
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {socialMediaLinks.map((link, index) => {
                          const IconComponent = getSocialIcon(link.icon);
                          return (
                            <div
                              key={link.id}
                              className={`p-3 rounded-xl border flex items-center justify-between space-x-2.5 ${
                                theme === "dark" ? "border-slate-900 bg-slate-900/40" : "border-slate-100 bg-slate-50/50"
                              }`}
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                                  <IconComponent size={14} />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-display font-medium text-slate-900 dark:text-white flex items-center space-x-1.5">
                                    <span>{link.platform}</span>
                                    {link.visible ? (
                                      <span className="text-[8px] px-1.5 py-0.2 rounded-full font-mono bg-emerald-500/10 text-emerald-400 uppercase tracking-widest leading-none">Visible</span>
                                    ) : (
                                      <span className="text-[8px] px-1.5 py-0.2 rounded-full font-mono bg-rose-500/10 text-rose-450 uppercase tracking-widest leading-none">Hidden</span>
                                    )}
                                  </div>
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] font-mono text-slate-400 hover:text-cyan-400 truncate max-w-[200px] inline-block"
                                    title={link.url}
                                  >
                                    {link.url}
                                  </a>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1.5 shrink-0">
                                {/* Up button */}
                                <button
                                  disabled={index === 0}
                                  onClick={async () => {
                                    if (index === 0) return;
                                    const nextOrder = [...socialMediaLinks];
                                    const temp = nextOrder[index - 1];
                                    nextOrder[index - 1] = nextOrder[index];
                                    nextOrder[index] = temp;
                                    try {
                                      await reorderSocialMediaLinks(nextOrder);
                                    } catch (err: any) {
                                      console.error("Failed to reorder social media links:", err);
                                      setDashAlert(`Error reordering: ${err.message || err}`);
                                      setTimeout(() => setDashAlert(null), 5000);
                                    }
                                  }}
                                  className="p-1 rounded bg-slate-500/5 hover:bg-slate-500/15 text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
                                >
                                  <ChevronUp size={12} />
                                </button>

                                {/* Down button */}
                                <button
                                  disabled={index === socialMediaLinks.length - 1}
                                  onClick={async () => {
                                    if (index === socialMediaLinks.length - 1) return;
                                    const nextOrder = [...socialMediaLinks];
                                    const temp = nextOrder[index + 1];
                                    nextOrder[index + 1] = nextOrder[index];
                                    nextOrder[index] = temp;
                                    try {
                                      await reorderSocialMediaLinks(nextOrder);
                                    } catch (err: any) {
                                      console.error("Failed to reorder social media links:", err);
                                      setDashAlert(`Error reordering: ${err.message || err}`);
                                      setTimeout(() => setDashAlert(null), 5000);
                                    }
                                  }}
                                  className="p-1 rounded bg-slate-500/5 hover:bg-slate-500/15 text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
                                >
                                  <ChevronDown size={12} />
                                </button>

                                {/* Hide/show Toggle */}
                                <button
                                  onClick={async () => {
                                    try {
                                      await updateSocialMediaLink(link.id, { visible: !link.visible });
                                    } catch (err: any) {
                                      console.error("Failed to toggle visibility of social media link:", err);
                                      setDashAlert(`Error: ${err.message || err}`);
                                      setTimeout(() => setDashAlert(null), 5000);
                                    }
                                  }}
                                  className={`p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-500/5 hover:bg-slate-500/15`}
                                  title={link.visible ? "Hide Link" : "Show Link"}
                                >
                                  {link.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                                </button>

                                {/* Edit Button */}
                                <button
                                  onClick={() => {
                                    setEditingSmlId(link.id);
                                    setEditSmlPlat(link.platform);
                                    setEditSmlUrl(link.url);
                                    setEditSmlIcon(link.icon);
                                  }}
                                  className="p-1.5 rounded-lg text-yellow-550 hover:bg-yellow-500/10 bg-slate-500/5"
                                  title="Edit Connected Details"
                                >
                                  <Edit2 size={12} />
                                </button>

                                {/* Delete Button */}
                                <button
                                  onClick={() => {
                                    setConfirmDialog({
                                      isOpen: true,
                                      title: "Confirm brand channel dissociation?",
                                      message: `Are you absolute certain you want to permanently delete and disconnect your ${link.platform} channel option? This will instantly remove it from the footer.`,
                                      onConfirm: async () => {
                                        try {
                                          await deleteSocialMediaLink(link.id);
                                          addActivityLog(currentUser.id, `Removed branding channel connection to ${link.platform}`, "Dissociated option", link.url);
                                          setConfirmDialog(null);
                                          setDashAlert("Connected channel disconnected.");
                                          setTimeout(() => setDashAlert(null), 3000);
                                        } catch (err: any) {
                                          console.error("Failed to delete social media link:", err);
                                          setConfirmDialog(null);
                                          setDashAlert(`Error: ${err.message || "Failed to delete social link"}`);
                                          setTimeout(() => setDashAlert(null), 6000);
                                        }
                                      }
                                    });
                                  }}
                                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 bg-slate-500/5"
                                  title="Delete Link"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

      {/* Global admin confirmation overlay modal */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in" id="admin-confirmation-overlay">
          <div className={`w-full max-w-sm p-6 rounded-2xl shadow-2xl border transition-all duration-355 ${
            theme === "dark" 
              ? "bg-slate-900 border-slate-800 text-white" 
              : "bg-white border-slate-200 text-slate-900"
          }`}>
            <h4 className="text-base font-display font-bold text-left text-cyan-400 mb-2">{confirmDialog.title}</h4>
            <p className="text-xs opacity-75 font-sans leading-relaxed text-left mb-6">{confirmDialog.message}</p>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl border dark:border-slate-800 border-slate-200 hover:bg-slate-500/10 font-mono text-xs transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  confirmDialog.onConfirm();
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-md shadow-cyan-500/10"
              >
                Confirm changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
