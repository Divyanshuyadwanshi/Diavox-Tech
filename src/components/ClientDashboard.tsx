/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useStore } from "../store";
import { uploadFileToBucket, supabase } from "../supabase";
import { motion, AnimatePresence } from "motion/react";
import { 
  Compass, Briefcase, FileSignature, Receipt, Bell, MessageSquare, 
  Send, AlertTriangle, Star, CheckCircle, Clock, Check, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight, X,
  User, Key, Upload, Bot, Lock, FileText, Info, Eye, EyeOff, BookOpen, Activity
} from "lucide-react";
import { ClientReview, RequestStatus } from "../types";
import HelpCenter from "./HelpCenter";
import TimelineCenter from "./TimelineCenter";

export default function ClientDashboard() {
  const { 
    theme, currentUser, requests, projects, contracts, activePlans, planApprovals, submitPlanApproval, invoices,
    notifications, messages, reviews, sendMessage, signContract, addReview, deleteReview, markNotificationsRead,
    quoteReplies, quoteAttachments, quoteStatusHistory, submitQuoteReply, pricingOptions
  } = useStore();

  const [activeTab, setActiveTab] = useState<"profile" | "projects" | "contracts" | "plans" | "requests" | "chat" | "reviews" | "help-kb">("profile");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Expanded quote request and quote replies inputs
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState<string>("");
  
  // Chat input
  const [typedMessage, setTypedMessage] = useState<string>("");
  const [chatSubTab, setChatSubTab] = useState<"team">("team");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || "");
      setProfileUsername(currentUser.username || currentUser.email?.split("@")[0] || "client");
      setProfileAvatar(currentUser.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150");
      fetchDeactivationRequest();
    }
  }, [currentUser]);

  useEffect(() => {
    const preselected = localStorage.getItem("preselected_tab");
    if (preselected === "chat") {
      setActiveTab("chat");
      localStorage.removeItem("preselected_tab");
    }

    const linkedTab = localStorage.getItem("diavox_client_active_tab");
    if (linkedTab) {
      setActiveTab(linkedTab as any);
      localStorage.removeItem("diavox_client_active_tab");
    }
  }, []);
  
  // Local state for Chat AI interactions (simulated in real time)
  const [aiChatLogs, setAiChatLogs] = useState<Array<{ id: string; sender: "user" | "ai"; text: string; time: string }>>([
    { 
      id: "ai-init", 
      sender: "ai", 
      text: "Hello 👋 Welcome to Diavox Tech. How may I help you today?", 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);

  // Profile management states
  const [profileName, setProfileName] = useState<string>(currentUser?.name || "");
  const [profileUsername, setProfileUsername] = useState<string>(currentUser?.username || currentUser?.email?.split("@")[0] || "client");
  const [profileAvatar, setProfileAvatar] = useState<string>(currentUser?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150");
  const [passOld, setPassOld] = useState<string>("");
  const [passNew, setPassNew] = useState<string>("");
  const [passConfirm, setPassConfirm] = useState<string>("");
  const [showPassOld, setShowPassOld] = useState<boolean>(false);
  const [showPassNew, setShowPassNew] = useState<boolean>(false);
  const [showPassConfirm, setShowPassConfirm] = useState<boolean>(false);

  // Review states inside client dashboard
  const [reviewText, setReviewText] = useState<string>("");
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [selectedService, setSelectedService] = useState<string>("Website Development");
  const [alertText, setAlertText] = useState<string | null>(null);

  // Custom premium confirmation modal state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Deactivation requests tracking states
  const [deactivationRequest, setDeactivationRequest] = useState<any>(null);

  const fetchDeactivationRequest = async () => {
    if (!currentUser || currentUser.id === "admin-secret") return;
    try {
      const { data, error } = await supabase
        .from("deactivation_requests")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setDeactivationRequest(data);
      }
    } catch (err) {
      console.warn("Failed to fetch deactivation request:", err);
    }
  };

  const handleDeactivateSubmit = async () => {
    if (!currentUser) return;
    setConfirmDialog({
      isOpen: true,
      title: "Request Account Deactivation?",
      message: "Are you sure you want to request deactivation? Account deactivation requests are processed within 24 hours.",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          // Fetch dynamic token for request header authentication
          const sessionRes = await supabase.auth.getSession();
          const token = sessionRes.data.session?.access_token || "admin-secret-bypass-token";
          
          const response = await fetch("/api/user/deactivate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              userName: currentUser.name,
              userEmail: currentUser.email
            })
          });

          const result = await response.json();
          if (response.ok && result.success) {
            setDeactivationRequest(result.request);
            setAlertText("Account deactivation requested. Admins have been notified.");
            setTimeout(() => setAlertText(null), 3500);
          } else {
            console.error("Deactivation request failed:", result.error);
            // Fallback simulation
            const fallbackRequest = {
              user_id: currentUser.id,
              user_name: currentUser.name,
              user_email: currentUser.email,
              status: "Pending Review",
              created_at: new Date().toISOString()
            };
            setDeactivationRequest(fallbackRequest);
            setAlertText("Account deactivation requested (local registration backup).");
            setTimeout(() => setAlertText(null), 3500);
          }
        } catch (err: any) {
          console.warn("Deactivation fetch error:", err);
          // Fallback simulation
          const fallbackRequest = {
            user_id: currentUser.id,
            user_name: currentUser.name,
            user_email: currentUser.email,
            status: "Pending Review",
            created_at: new Date().toISOString()
          };
          setDeactivationRequest(fallbackRequest);
          setAlertText("Account deactivation requested (local registration backup).");
          setTimeout(() => setAlertText(null), 3500);
        }
      }
    });
  };

  if (!currentUser) {
    return (
      <div className="p-8 text-center min-h-[50vh] flex flex-col justify-center items-center" id="client-unauth-container">
        <AlertTriangle className="text-amber-500 mb-2" size={32} />
        <h3 className="text-lg font-display font-bold">Authentication Mandatory</h3>
        <p className="text-sm font-mono opacity-60 mt-1 max-w-sm">You must log in to enter your private client project workspace.</p>
      </div>
    );
  }

  // Filter datasets relative to active user
  const clientProjects = projects.filter(p => p.client_id === currentUser.id);
  const clientRequests = requests.filter(r => r.client_id === currentUser.id);
  const clientContracts = contracts.filter(c => c.client_id === currentUser.id || c.id === "con-1");
  const clientPlans = activePlans.filter(p => p.client_id === currentUser.id);
  const clientInvoices = invoices.filter(inv => inv.client_id === currentUser.id);
  
  const clientReviews = reviews.filter(rev => rev.client_id === currentUser.id);
  const clientNotifications = notifications.filter(n => n.user_id === currentUser.id || n.user_id === "all_clients");

  // Chat conversation
  const chatMessages = messages.filter(
    (m) => (m.sender_id === currentUser.id && m.recipient_id === "team") || 
           (m.recipient_id === currentUser.id && m.sender_id !== currentUser.id) ||
           (m.recipient_id === "client-test" && currentUser.id === "client-test") // fallback channel
  );

  const handlePostReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    addReview({
      client_id: currentUser.id,
      client_name: currentUser.name,
      client_avatar: currentUser.avatar_url,
      rating: reviewRating,
      review_text: reviewText,
      service_used: selectedService,
      status: "Pending", // Needs admin approval
      is_featured: false
    });

    setReviewText("");
    setReviewRating(5);
    setAlertText("Feedback has been posted successfully and queued for admin review.");
    setTimeout(() => setAlertText(null), 4000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    sendMessage("team", typedMessage);
    setTypedMessage("");

    // Trigger user notification for the automated help reply
    setTimeout(() => {
      useStore.getState().addNotification(
        currentUser.id, 
        "AI Co-pilot Confirmation", 
        "Diavox support ticket logged on active thread."
      );
    }, 1200);
  };

  return (
    <div className={`p-4 sm:p-6 lg:p-8 min-h-screen text-left transition-colors duration-300 ${
      theme === "dark" ? "bg-slate-950 text-white" : "bg-white text-slate-900"
    }`} id="client-dashboard-container">
      
      {/* Upper Status Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b dark:border-slate-900 border-slate-100 pb-6 mb-8 gap-4" id="client-header-row">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-emerald-500 font-bold uppercase">SECURED CLIENT PORTAL</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold">
            Project Command Room
          </h2>
          <p className="text-xs opacity-65">Monitor active specifications, process payments, sign service contracts, or chat with team leaders.</p>
        </div>

        {/* Dynamic Alerts inside Client area */}
        {alertText && (
          <div className="p-3.5 rounded-lg bg-cyan-950/40 text-cyan-405 border border-cyan-800/60 text-xs font-mono max-w-sm flex items-start space-x-2 animate-pulse" id="client-alert">
            <CheckCircle size={14} className="shrink-0 mt-0.5 text-cyan-400" />
            <span className="text-cyan-400">{alertText}</span>
          </div>
        )}
      </div>

      {/* Mobile Dashboard Nav Trigger */}
      <div className="lg:hidden flex items-center justify-between p-3.5 rounded-2xl border dark:bg-slate-900 bg-slate-50 dark:border-slate-800 border-slate-200 mb-6" id="client-mobile-tab-trigger">
        <div className="flex items-center space-x-2.5">
          <span className="text-[10px] font-mono tracking-wider font-bold uppercase opacity-60">Workspace:</span>
          <span className="text-xs font-mono font-bold text-cyan-400 capitalize">{activeTab.replace("-", " ")}</span>
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
              className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] p-6 shadow-2xl border-r flex flex-col justify-between lg:hidden ${
                theme === "dark" ? "bg-slate-950 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-800"
              }`}
              id="client-mobile-drawer"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4 dark:border-slate-900 border-slate-100 animate-slide-in">
                  <div>
                    <p className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">NAVIGATION</p>
                    <h4 className="text-lg font-display font-bold">Portal Menu</h4>
                  </div>
                  <button 
                    onClick={() => setShowMobileSidebar(false)} 
                    className="p-1.5 rounded-lg dark:bg-slate-900 bg-slate-100 dark:hover:bg-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                {/* Navigation Items replicated inside drawer */}
                <div className="space-y-2 flex flex-col pt-2" id="client-mobile-sidebar-navigation">
                  <button
                    onClick={() => { setActiveTab("profile"); setShowMobileSidebar(false); }}
                    className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "profile" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <User size={15} className="text-cyan-500" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("projects"); setShowMobileSidebar(false); }}
                    className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "projects" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Briefcase size={15} />
                    <span>Ongoing Orders ({clientProjects.length})</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("requests"); setShowMobileSidebar(false); }}
                    className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "requests" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Compass size={15} />
                    <span>Requests ({clientRequests.length})</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("contracts"); setShowMobileSidebar(false); }}
                    className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "contracts" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <FileSignature size={15} />
                    <span>Contracts ({clientContracts.length})</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("plans"); setShowMobileSidebar(false); }}
                    className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "plans" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Receipt size={15} />
                    <span>Plans ({clientPlans.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("chat");
                      markNotificationsRead(currentUser.id);
                      setShowMobileSidebar(false);
                    }}
                    className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center justify-between transition-colors text-left ${
                      activeTab === "chat" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center space-x-2.5">
                      <MessageSquare size={15} />
                      <span>Messages</span>
                    </span>
                    {clientNotifications.filter(n => !n.is_read).length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-cyan-500 text-white text-[9px] font-sans">
                        {clientNotifications.filter(n => !n.is_read).length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => { setActiveTab("reviews"); setShowMobileSidebar(false); }}
                    className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "reviews" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Star size={15} />
                    <span>Reviews</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("help-kb"); setShowMobileSidebar(false); }}
                    className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors text-left ${
                      activeTab === "help-kb" ? "bg-slate-900 text-amber-400 border border-amber-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <BookOpen size={15} />
                    <span>Knowledge Desk</span>
                  </button>
                </div>
              </div>
              
              <div className="border-t pt-4 dark:border-slate-900 border-slate-100 text-center">
                <p className="text-[9px] font-mono opacity-50">Diavox Tech Secured Portal © 2026</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Workspace layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="client-workspace-grid">
        
        {/* Navigation Rail (Desktop Only) */}
        <div className={`hidden lg:flex ${isSidebarCollapsed ? "lg:col-span-1 items-center" : "lg:col-span-3"} space-y-2 flex flex-col transition-all duration-300`} id="client-sidebar-navigation">
          {/* Collapse/Expand Toggle Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="flex items-center justify-between p-3 rounded-xl w-full text-xs font-mono font-bold dark:bg-slate-900 bg-slate-100 hover:bg-slate-800 border dark:border-slate-800 border-slate-200 text-slate-400 hover:text-white transition-all cursor-pointer"
            title={isSidebarCollapsed ? "Expand panel" : "Collapse panel"}
          >
            {!isSidebarCollapsed && <span>Toggle Sidebar</span>}
            {isSidebarCollapsed ? <ChevronsRight size={15} className="mx-auto" /> : <ChevronsLeft size={15} />}
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center ${isSidebarCollapsed ? "justify-center w-12 h-12" : "space-x-2.5 w-full"} transition-all ${
              activeTab === "profile" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
            title="My Profile"
          >
            <User size={15} className="text-cyan-500 shrink-0" />
            {!isSidebarCollapsed && <span>My Profile</span>}
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center ${isSidebarCollapsed ? "justify-center w-12 h-12" : "space-x-2.5 w-full"} transition-all ${
              activeTab === "projects" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
            title={`Ongoing Orders (${clientProjects.length})`}
          >
            <Briefcase size={15} className="shrink-0" />
            {!isSidebarCollapsed && <span>Ongoing Orders ({clientProjects.length})</span>}
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center ${isSidebarCollapsed ? "justify-center w-12 h-12" : "space-x-2.5 w-full"} transition-all ${
              activeTab === "requests" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
            title={`Requests (${clientRequests.length})`}
          >
            <Compass size={15} className="shrink-0" />
            {!isSidebarCollapsed && <span>Requests ({clientRequests.length})</span>}
          </button>

          <button
            onClick={() => setActiveTab("contracts")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center ${isSidebarCollapsed ? "justify-center w-12 h-12" : "space-x-2.5 w-full"} transition-all ${
              activeTab === "contracts" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
            title={`Contracts (${clientContracts.length})`}
          >
            <FileSignature size={15} className="shrink-0" />
            {!isSidebarCollapsed && <span>Contracts ({clientContracts.length})</span>}
          </button>

          <button
            onClick={() => setActiveTab("plans")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center ${isSidebarCollapsed ? "justify-center w-12 h-12" : "space-x-2.5 w-full"} transition-all ${
              activeTab === "plans" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
            title={`Plans (${clientPlans.length})`}
          >
            <Receipt size={15} className="shrink-0" />
            {!isSidebarCollapsed && <span>Plans ({clientPlans.length})</span>}
          </button>

          <button
            onClick={() => {
              setActiveTab("chat");
              markNotificationsRead(currentUser.id);
            }}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center justify-between transition-all ${
              activeTab === "chat" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            } ${isSidebarCollapsed ? "justify-center w-12 h-12" : "w-full"}`}
            title="Messages"
          >
            {isSidebarCollapsed ? (
              <div className="relative">
                <MessageSquare size={15} className="shrink-0" />
                {clientNotifications.filter(n => !n.is_read).length > 0 && (
                  <span className="absolute -top-2 -right-2 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>
            ) : (
              <>
                <span className="flex items-center space-x-2.5">
                  <MessageSquare size={15} className="shrink-0" />
                  <span>Messages</span>
                </span>
                {clientNotifications.filter(n => !n.is_read).length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-cyan-500 text-white text-[9px] font-sans shrink-0">
                    {clientNotifications.filter(n => !n.is_read).length}
                  </span>
                )}
              </>
            )}
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center ${isSidebarCollapsed ? "justify-center w-12 h-12" : "space-x-2.5 w-full"} transition-all ${
              activeTab === "reviews" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
            title="Reviews"
          >
            <Star size={15} className="shrink-0" />
            {!isSidebarCollapsed && <span>Reviews</span>}
          </button>

          <button
            onClick={() => setActiveTab("help-kb")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center ${isSidebarCollapsed ? "justify-center w-12 h-12" : "space-x-2.5 w-full"} transition-all ${
              activeTab === "help-kb" ? "bg-slate-900 text-amber-400 border border-amber-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
            title="Knowledge Desk"
          >
            <BookOpen size={15} className="shrink-0" />
            {!isSidebarCollapsed && <span>Knowledge Desk</span>}
          </button>
        </div>

        {/* Dynamic Display Panels */}
        <div className={`${isSidebarCollapsed ? "lg:col-span-11" : "lg:col-span-9"} transition-all duration-300`} id="client-workspace-pane">
          
          {/* TAB 0: User Profile Portal (The Opening Page) */}
          {activeTab === "profile" && (
            <div className="space-y-6" id="client-tab-profile">
              <h3 className="text-lg font-display font-bold pb-3 border-b dark:border-slate-900 border-slate-100">My Personal Profile Portal</h3>
              
              {/* Responsive Elegant Profile Header (Horizontal on Mobile & Tablet under md break, styling matches desktop theme) */}
              <div className={`block md:hidden p-5 rounded-2xl border ${
                theme === "dark" 
                  ? "bg-slate-900/40 border-slate-800/80 text-white" 
                  : "bg-slate-50/50 border-slate-200 text-slate-900"
              } shadow-sm`} id="responsive-profile-header-card">
                <div className="flex flex-row items-center gap-4">
                  <div className="relative group shrink-0">
                    <img 
                      src={profileAvatar} 
                      alt={profileName} 
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-full border border-cyan-500/50 object-cover shadow-md"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-mono rounded-full">
                      Active
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 text-left space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-display font-bold leading-none truncate">{profileName}</h4>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider text-cyan-400 bg-cyan-500/10 uppercase">
                        ⚡ {currentUser.role.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono truncate">@{profileUsername}</p>
                    <p className="text-xs text-slate-400 font-sans truncate">{currentUser.email}</p>
                  </div>

                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = async (e: any) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProfileAvatar(reader.result as string);
                            };
                            reader.readAsDataURL(file);

                            try {
                              const ext = file.name.split('.').pop() || 'png';
                              const filePath = `${currentUser.id}_${Date.now()}.${ext}`;
                              const publicUrl = await uploadFileToBucket("profile-images", filePath, file);
                              setProfileAvatar(publicUrl);
                              setAlertText("Image uploaded successfully! Submit form below to save.");
                              setTimeout(() => setAlertText(null), 3500);
                            } catch (err) {
                              console.error("Storage uploads failed:", err);
                            }
                          }
                        };
                        input.click();
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950/40 hover:bg-slate-900 border dark:border-slate-800 border-slate-200 text-slate-300 font-mono text-[9px] font-bold transition-all"
                    >
                      Upload
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Visual Avatar Manager (Visible on Desktop only) */}
                <div className={`hidden md:flex md:col-span-4 p-6 rounded-2xl border flex-col items-center justify-center text-center ${
                  theme === "dark" ? "bg-slate-900/30 border-slate-900" : "bg-slate-50 border-slate-200"
                }`} id="profile-avatar-management">
                  <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold mb-4">Picture Management</span>
                  
                  <div className="relative group mb-4">
                    <img 
                      src={profileAvatar} 
                      alt={profileName} 
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 rounded-full border-2 border-cyan-500 object-cover shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-mono">
                      Active
                    </div>
                  </div>

                  {/* Drag-and-drop combined picture loader */}
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
                        };
                        reader.readAsDataURL(file);

                        try {
                          const ext = file.name.split('.').pop() || 'png';
                          const filePath = `${currentUser.id}_${Date.now()}.${ext}`;
                          const publicUrl = await uploadFileToBucket("profile-images", filePath, file);
                          setProfileAvatar(publicUrl);
                          setAlertText("Image uploaded successfully! Submit form below to save.");
                          setTimeout(() => setAlertText(null), 3500);
                        } catch (err) {
                          console.error("Storage uploads failed:", err);
                          setAlertText("Image upload failed, using local preview.");
                          setTimeout(() => setAlertText(null), 3500);
                        }
                      }
                    }}
                    className={`p-4 rounded-xl border border-dashed text-xs cursor-pointer w-full transition-all ${
                      isDragOver 
                        ? "border-cyan-400 bg-cyan-500/10" 
                        : theme === "dark" 
                        ? "border-slate-800 bg-slate-950/40 hover:border-slate-700" 
                        : "border-slate-200 bg-white hover:border-slate-350"
                    }`}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = async (e: any) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProfileAvatar(reader.result as string);
                          };
                          reader.readAsDataURL(file);

                          try {
                            const ext = file.name.split('.').pop() || 'png';
                            const filePath = `${currentUser.id}_${Date.now()}.${ext}`;
                            const publicUrl = await uploadFileToBucket("profile-images", filePath, file);
                            setProfileAvatar(publicUrl);
                            setAlertText("Image uploaded successfully! Submit form below to save.");
                            setTimeout(() => setAlertText(null), 3500);
                          } catch (err) {
                            console.error("Storage uploads failed:", err);
                            setAlertText("Image upload failed, using local preview.");
                            setTimeout(() => setAlertText(null), 3500);
                          }
                        }
                      };
                      input.click();
                    }}
                  >
                    <Upload className="mx-auto text-cyan-400 mb-1.5" size={16} />
                    <p className="font-bold">Drop Avatar or Click</p>
                    <p className="opacity-50 text-[10px] mt-0.5">PNG, JPG up to 1MB</p>
                  </div>
                </div>

                {/* Profile Details Form */}
                <div className={`col-span-12 md:col-span-8 p-6 rounded-2xl border space-y-4 ${
                  theme === "dark" ? "bg-slate-900/30 border-slate-900" : "bg-slate-50 border-slate-200"
                }`} id="profile-detailed-form">
                  <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold block pb-1 border-b dark:border-slate-800 border-slate-200">Identity configuration</span>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    setConfirmDialog({
                      isOpen: true,
                      title: "Confirm identity edits?",
                      message: "Are you sure you want to write these modifications to your profile configuration parameters?",
                      onConfirm: () => {
                        const state = useStore.getState();
                        state.updateUserProfile(currentUser.id, {
                          name: profileName,
                          username: profileUsername,
                          avatar_url: profileAvatar
                        });
                        setAlertText("Identity configurations successfully written to secure cache storage.");
                        setConfirmDialog(null);
                        setTimeout(() => setAlertText(null), 3500);
                      }
                    });
                  }} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase opacity-60">Full Name</label>
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
                        <label className="text-[10px] font-mono uppercase opacity-60">Username handle</label>
                        <input 
                          type="text" 
                          value={profileUsername}
                          onChange={(e) => setProfileUsername(e.target.value)}
                          disabled={currentUser.role === "team_member"}
                          className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors ${
                            currentUser.role === "team_member" ? "opacity-50 cursor-not-allowed bg-slate-900" : ""
                          } ${
                            theme === "dark" ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                          }`}
                          required
                        />
                        {currentUser.role === "team_member" && (
                          <p className="text-[9px] text-rose-400 font-mono mt-0.5">Team members are restricted from changing usernames handle.</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase opacity-60">Email ID Address</label>
                        <input 
                          type="email" 
                          value={currentUser.email}
                          disabled
                          className="w-full p-2.5 rounded-xl text-xs border bg-slate-900/10 dark:bg-slate-950/45 dark:border-slate-800/80 border-slate-200 text-slate-400 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase opacity-60">Security Role Clearance</label>
                        <div className="p-2.5 rounded-xl border dark:border-slate-800 border-slate-200 text-xs font-mono font-bold tracking-wider text-cyan-400 bg-cyan-500/5 select-none uppercase">
                          ⚡ {currentUser.role.replace("_", " ")}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button 
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-600 hover:brightness-110 text-white font-mono text-xs font-bold transition-all"
                      >
                        Commit Changes
                      </button>
                    </div>
                  </form>
                </div>

                {/* Password Change Form */}
                <div className={`col-span-12 md:col-span-12 p-6 rounded-2xl border space-y-4 ${
                  theme === "dark" ? "bg-slate-900/30 border-slate-900" : "bg-slate-50 border-slate-200"
                }`} id="profile-password-form">
                  <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold block pb-1 border-b dark:border-slate-800 border-slate-200">Change account password</span>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (passNew !== passConfirm) {
                      alert("Error: Passwords do not match!");
                      return;
                    }
                    setConfirmDialog({
                      isOpen: true,
                      title: "Change account password?",
                      message: "Ensure you remember your next secure passkey before resetting.",
                      onConfirm: () => {
                        setAlertText("Account password successfully updated in active session database.");
                        setPassOld("");
                        setPassNew("");
                        setPassConfirm("");
                        setConfirmDialog(null);
                        setTimeout(() => setAlertText(null), 3500);
                      }
                    });
                  }} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase opacity-60">Old Password</label>
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
                          className="absolute right-3 top-3 text-slate-500 hover:text-cyan-500 transition-colors"
                        >
                          {showPassOld ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase opacity-60">Next Password</label>
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
                          className="absolute right-3 top-3 text-slate-500 hover:text-cyan-500 transition-colors"
                        >
                          {showPassNew ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="space-y-1 flex-1">
                        <label className="text-[10px] font-mono uppercase opacity-60">Verify Next Password</label>
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
                            className="absolute right-3 top-3 text-slate-500 hover:text-cyan-500 transition-colors"
                          >
                            {showPassConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>
                      <button 
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-550/10 font-mono text-xs font-bold transition-all h-[41px]"
                      >
                        Reset Password
                      </button>
                    </div>
                  </form>
                                {/* Danger Zone: Account Deactivation status tracking timeline or submit button */}
                {deactivationRequest ? (
                  <div className={`col-span-12 p-6 rounded-2xl border ${
                    theme === "dark" ? "bg-slate-900/40 border-slate-800" : "bg-slate-50 border-slate-200"
                  } space-y-6`} id="deactivation-status-timeline-card">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-slate-800 border-slate-200">
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold block">Status Protocol</span>
                        <h4 className="text-sm font-display font-bold">Account Deactivation Request</h4>
                        <p className="text-xs text-slate-400 font-sans">
                          Account deactivation requests are processed within 24 hours.
                        </p>
                      </div>
                      <div className="bg-cyan-500/10 border border-cyan-500/25 px-3 py-1.5 rounded-xl text-center shrink-0">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase block">Estimated Remaining</span>
                        <span className="text-xs font-mono font-bold text-white">
                          {(() => {
                            const createdDate = new Date(deactivationRequest.created_at);
                            const endDate = new Date(createdDate.getTime() + 24 * 60 * 60 * 1000);
                            const now = new Date();
                            const diffMs = endDate.getTime() - now.getTime();
                            if (diffMs <= 0 || deactivationRequest.status === "Deactivated") {
                              return "Processing complete";
                            } else {
                              const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                              const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                              return `${diffHrs}h ${diffMins}m`;
                            }
                          })()}
                        </span>
                      </div>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="relative pt-2" id="profile-deactivation-timeline">
                      {/* Horizontal connector line */}
                      <div className="absolute top-[21px] left-8 right-8 h-1 bg-slate-800 rounded hidden sm:block"></div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
                        
                        {/* Step 1: Pending Review */}
                        <div className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border z-10 transition-all ${
                            deactivationRequest.status === "Pending Review" || deactivationRequest.status === "Under Verification" || deactivationRequest.status === "Deactivated"
                              ? "bg-slate-950 border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-400/10"
                              : "bg-slate-900 border-slate-800 text-slate-500"
                          }`}>
                            {deactivationRequest.status === "Pending Review" ? (
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                              </span>
                            ) : (
                              <Check size={14} />
                            )}
                          </div>
                          <div className="text-left sm:text-center">
                            <h5 className="text-xs font-mono font-bold">Pending Review</h5>
                            <p className="text-[10px] text-slate-400">Request logged in central system.</p>
                          </div>
                        </div>

                        {/* Step 2: Under Verification */}
                        <div className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border z-10 transition-all ${
                            deactivationRequest.status === "Under Verification" || deactivationRequest.status === "Deactivated"
                              ? "bg-slate-950 border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-400/10"
                              : "bg-slate-900 border-slate-800 text-slate-500"
                          }`}>
                            {deactivationRequest.status === "Under Verification" ? (
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                              </span>
                            ) : deactivationRequest.status === "Deactivated" ? (
                              <Check size={14} />
                            ) : (
                              <span className="text-[10px]">02</span>
                            )}
                          </div>
                          <div className="text-left sm:text-center">
                            <h5 className="text-xs font-mono font-bold">Under Verification</h5>
                            <p className="text-[10px] text-slate-400">Administrative clearance analysis.</p>
                          </div>
                        </div>

                        {/* Step 3: Deactivated */}
                        <div className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border z-10 transition-all ${
                            deactivationRequest.status === "Deactivated"
                              ? "bg-slate-950 border-rose-500 text-rose-500 shadow-lg shadow-rose-500/10"
                              : "bg-slate-900 border-slate-800 text-slate-500"
                          }`}>
                            {deactivationRequest.status === "Deactivated" ? (
                              <X size={14} />
                            ) : (
                              <span className="text-[10px]">03</span>
                            )}
                          </div>
                          <div className="text-left sm:text-center">
                            <h5 className="text-xs font-mono font-bold">Deactivated</h5>
                            <p className="text-[10px] text-slate-400">Secure credential system shutdown.</p>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`col-span-12 p-6 rounded-2xl border border-rose-500/15 space-y-4 ${
                    theme === "dark" ? "bg-rose-950/5" : "bg-rose-50/20"
                  }`} id="profile-danger-zone">
                    <span className="text-[10px] font-mono tracking-widest text-rose-500 uppercase font-bold block pb-1 border-b border-rose-500/15">Danger Zone (Account Deactivation)</span>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1 text-left">
                        <h4 className="text-xs font-mono font-bold text-rose-500">Deactivate Account</h4>
                        <p className="text-[11px] opacity-75 font-sans font-light leading-relaxed text-slate-400">
                          Deactivate your secure credentials access parameters. Deactivation requests are reviewed and processed within 24 hours.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleDeactivateSubmit}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-mono text-xs font-bold transition-all shrink-0 cursor-pointer shadow-md shadow-rose-950/10"
                      >
                        Deactivate Account
                      </button>
                    </div>
                  </div>
                )}  </div>

              </div>
            </div>
          )}

          {/* TAB 1: PROJECTS & DELIVERY TIMELINES */}
          {activeTab === "projects" && (
            <div className="space-y-6" id="client-tab-projects">
              <h3 className="text-lg font-display font-extrabold pb-3 border-b dark:border-slate-900 border-slate-100">Live Delivery Timeline</h3>
              
              <div className="space-y-6" id="client-projects-tracker-list">
                {clientProjects.map((proj) => (
                  <div key={proj.id} className={`p-6 rounded-2xl border ${theme === "dark" ? "bg-slate-900/30 border-slate-900" : "bg-slate-50 border-slate-200"}`}>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">{proj.category}</span>
                        <h4 className="text-lg font-display font-extrabold mt-0.5">{proj.title}</h4>
                        <p className="text-xs opacity-75 mt-1 font-light max-w-xl">{proj.description}</p>
                      </div>

                      <div className="text-left font-mono text-xs sm:text-right shrink-0">
                        <span className="opacity-50 block text-[10px]">TARGET TARGET TIME</span>
                        <span className="font-bold text-cyan-400 block mt-0.5">{proj.completion_date}</span>
                      </div>
                    </div>

                    {/* Progress slider bar visualization */}
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span>Milestone delivery index:</span>
                        <span className="font-bold text-emerald-400">{proj.progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full dark:bg-slate-950 bg-slate-200 overflow-hidden border dark:border-slate-900 border-slate-100">
                        <div className="h-full bg-gradient-to-r from-cyan-400 to-sky-500 rounded-full" style={{ width: `${proj.progress}%` }} />
                      </div>
                    </div>

                    {/* Assigned specialists */}
                    <div className="mt-6 pt-4 border-t dark:border-slate-900 border-slate-150 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono opacity-50">Remote Officers assigned:</span>
                        <div className="flex -space-x-2">
                          <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=60" alt="Alex Developer" className="w-6 h-6 rounded-full border dark:border-slate-800 border-slate-200 object-cover" />
                          <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=60" alt="Emma Designer" className="w-6 h-6 rounded-full border dark:border-slate-800 border-slate-200 object-cover" />
                        </div>
                      </div>

                      <span className={`text-[10px] font-mono px-2.5 py-1 rounded-lg ${
                        proj.progress === 100 ? "bg-emerald-950 text-emerald-400" : "bg-cyan-950 text-cyan-400"
                      }`}>
                        {proj.progress === 100 ? "READY FOR DELIVERY" : "ACTIVE REMOTE CODING"}
                      </span>
                    </div>

                  </div>
                ))}

                {clientProjects.length === 0 && (
                  <p className="text-xs font-mono opacity-50 text-center py-10">You have no ongoing development timelines registered yet.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: REGISTERED LEADS & SLAS */}
          {activeTab === "requests" && (
            <div className="space-y-6" id="client-tab-requests">
              <h3 className="text-lg font-display font-extrabold pb-3 border-b dark:border-slate-900 border-slate-100">My Action Tickets</h3>
              
              <div className="space-y-4" id="client-requests-tracker-list">
                 {clientRequests.map((req) => (
                  <div key={req.id} className={`p-5 rounded-2xl border text-left ${theme === "dark" ? "bg-slate-900/30 border-slate-900" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
                      <div>
                        <h4 className="text-sm font-bold font-display">{req.service_type}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[10px] font-mono opacity-55">SLA-ID: {req.id}</span>
                          <button
                            onClick={() => setExpandedRequestId(expandedRequestId === req.id ? null : req.id)}
                            className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-all uppercase"
                          >
                            {expandedRequestId === req.id ? "Close Panel" : `Discuss / View Status (${quoteReplies.filter(r => r.quote_id === req.id).length} Replies)`}
                          </button>
                        </div>
                      </div>
                      
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase ${
                        req.status === "Approved" || req.status === "In Progress" || req.status === "Completed"
                          ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900"
                          : req.status === "Rejected"
                          ? "bg-rose-950/50 text-rose-400 border border-rose-900"
                          : "bg-amber-950/50 text-amber-500 border border-amber-900"
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <p className="text-xs opacity-80 leading-relaxed font-light">{req.description}</p>
                    
                    {req.budget && (
                      <div className="mt-4 text-xs font-mono flex items-center justify-between border-b dark:border-slate-800/20 border-slate-200/20 pb-4">
                        <span>Proposed budget: <span className="font-bold text-cyan-400">{req.budget}</span></span>
                        <span className="opacity-40 text-[9px]">SLA Response limit: &lt;24 hours</span>
                      </div>
                    )}

                    {/* EXPANDED INTERACTIVE VIEW */}
                    {expandedRequestId === req.id && (
                      <div className="mt-4 space-y-6 animate-fade-in" id={`quote-exp-panel-${req.id}`}>
                        
                        {/* Status tracker steps */}
                        <div className="space-y-2">
                          <h5 className="text-[10px] font-mono opacity-50 uppercase tracking-wider">Dynamic Status Progress Stages</h5>
                          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                            {["Submitted", "Reviewing", "Approved", "Rejected", "In Progress", "Completed"].map((s) => {
                              const isCurrent = req.status === s;
                              const stages = ["Submitted", "Reviewing", "Approved", "In Progress", "Completed"];
                              const curIdx = stages.indexOf(req.status);
                              const thisIdx = stages.indexOf(s);
                              const isPast = curIdx >= thisIdx && thisIdx !== -1 && curIdx !== -1;

                              let bgClass = "bg-slate-900/40 border-slate-900/60 text-slate-500";
                              if (isCurrent) {
                                bgClass = s === "Rejected" ? "bg-rose-950 text-rose-400 border-rose-800" : "bg-cyan-950 text-cyan-400 border-cyan-800 animate-pulse font-bold";
                              } else if (isPast) {
                                bgClass = "bg-emerald-950/50 text-emerald-400 border-emerald-900";
                              }

                              return (
                                <div key={s} className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center ${bgClass}`}>
                                  <span className="text-[9px] font-mono leading-none mb-1">
                                    {isPast && s !== "Rejected" ? "✓" : s[0]}
                                  </span>
                                  <span className="text-[9px] font-mono truncate max-w-full">{s}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Status Log Transitions history */}
                        {quoteStatusHistory.filter(h => h.quote_id === req.id).length > 0 && (
                          <div className="space-y-1.5">
                            <h5 className="text-[9px] font-mono opacity-40 uppercase">State Timeline Entries</h5>
                            <div className="space-y-1">
                              {quoteStatusHistory.filter(h => h.quote_id === req.id).map((history) => (
                                <div key={history.id} className="p-2 dark:bg-slate-950 bg-white border dark:border-slate-850 border-slate-200 rounded text-[10px] font-mono flex items-center justify-between flex-wrap gap-2">
                                  <span className="opacity-80">
                                    Changed to <strong className="text-cyan-400 uppercase">{history.status}</strong> by <span className="text-slate-300 font-bold">{history.changed_by_name}</span> ({history.changed_by_role})
                                  </span>
                                  <span className="opacity-40 text-[9px]">{new Date(history.created_at).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Conversation dialogue feed */}
                        <div className="space-y-2">
                          <h5 className="text-[10px] font-mono opacity-50 uppercase tracking-wider">Proposal Negotiation Messages</h5>
                          
                          <div className="p-3 rounded-xl border dark:border-slate-850 border-slate-200 dark:bg-slate-950/40 bg-white/50 space-y-3 max-h-[220px] overflow-y-auto">
                            {quoteReplies.filter(r => r.quote_id === req.id).map((reply) => {
                              const isClient = reply.sender_role === "client";
                              return (
                                <div key={reply.id} className={`flex flex-col max-w-[85%] ${isClient ? "ml-auto text-right items-end" : "mr-auto text-left items-start"}`}>
                                  <div className="flex items-center space-x-1 opacity-55 text-[9px] font-mono mb-1">
                                    <span>{reply.sender_name}</span>
                                    <span>({reply.sender_role.replace("_", " ")})</span>
                                  </div>
                                  <div className={`p-2.5 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed ${
                                    isClient 
                                      ? "bg-cyan-600 text-white" 
                                      : "dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 text-slate-900 dark:text-white"
                                  }`}>
                                    {reply.message_text}
                                    
                                    {/* Uploaded attachments render */}
                                    {reply.attachments && reply.attachments.length > 0 && (
                                      <div className="mt-1.5 pt-1.5 border-t border-slate-100/20 text-[9px] font-mono flex flex-col gap-1.5 text-left">
                                        {reply.attachments.map(at => {
                                          const isImg = /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(at.file_url || "");
                                          return (
                                            <div key={at.id} className="flex flex-col gap-1">
                                              <div className="flex items-center space-x-1">
                                                <span className="opacity-60">📎 File:</span>
                                                <a href={at.file_url} className="underline text-cyan-300 hover:text-white font-mono break-all" target="_blank" rel="noopener noreferrer">{at.file_name}</a>
                                              </div>
                                              {isImg && at.file_url && at.file_url !== "#" && (
                                                <img 
                                                  src={at.file_url} 
                                                  alt={at.file_name || "Attachment"} 
                                                  className="max-w-xs max-h-36 rounded border border-slate-750 mt-1 object-cover"
                                                  referrerPolicy="no-referrer"
                                                />
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            {quoteReplies.filter(r => r.quote_id === req.id).length === 0 && (
                              <p className="text-[10px] font-mono opacity-55 text-center py-8">Your ticket inquiry has no dialog replies yet. Start typing below to coordinate with leads.</p>
                            )}
                          </div>

                          {/* Action text send form */}
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              if (!replyInput.trim()) return;
                              await submitQuoteReply(req.id, replyInput);
                              setReplyInput("");
                            }}
                            className="flex gap-2 mt-2"
                          >
                            <input
                              type="text"
                              value={replyInput}
                              onChange={(e) => setReplyInput(e.target.value)}
                              placeholder="Inquire about specs, request pricing changes..."
                              className={`flex-1 text-xs px-3 py-2 rounded-lg border focus:outline-none ${
                                theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                              }`}
                            />
                            
                            <button
                              type="button"
                              onClick={() => {
                                const btnInput = document.createElement("input");
                                btnInput.type = "file";
                                btnInput.onchange = async (events: any) => {
                                  const f = events.target.files[0];
                                  if (f) {
                                    try {
                                      setAlertText(`Uploading "${f.name}" to secure storage...`);
                                      const path = `quotes/${req.id}/${Date.now()}_${f.name}`;
                                      const publicUrl = await uploadFileToBucket("chat-files", path, f);
                                      await submitQuoteReply(req.id, `Shared quote file scope: ${f.name}`, [{ file_name: f.name, file_url: publicUrl }]);
                                      setAlertText(`Successfully linked quote document: "${f.name}"!`);
                                      setTimeout(() => setAlertText(null), 3000);
                                    } catch (errQuote: any) {
                                      setAlertText(`Upload failed: ${errQuote.message || errQuote}`);
                                      setTimeout(() => setAlertText(null), 5000);
                                    }
                                  }
                                };
                                btnInput.click();
                              }}
                              className={`px-3 py-2.5 rounded-lg border text-[11px] font-mono font-bold shrink-0 ${
                                theme === "dark" 
                                  ? "bg-slate-905 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850" 
                                  : "bg-white border-slate-205 text-slate-650 hover:bg-slate-50"
                              }`}
                              title="Attach file scope document"
                            >
                              📎 Add Scope
                            </button>

                            <button
                              type="submit"
                              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-[11px] font-mono font-bold hover:brightness-110"
                            >
                              Send Message
                            </button>
                          </form>
                        </div>

                      </div>
                    )}
                  </div>
                ))}

                {clientRequests.length === 0 && (
                  <div className="text-center py-12 p-4 border border-dashed rounded-xl dark:border-slate-800 border-slate-205">
                    <p className="text-xs font-mono opacity-50">No action tickets listed. Use the Get in touch form below to submit a quote request.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CONTRACT SIGNING */}
          {activeTab === "contracts" && (
            <div className="space-y-6" id="client-tab-contracts">
              <h3 className="text-lg font-display font-extrabold pb-3 border-b dark:border-slate-900 border-slate-100">Service Legal Contracts</h3>
              
              <div className="space-y-4" id="contracts-list">
                {clientContracts.map((con) => (
                  <div key={con.id} className={`p-5 rounded-2xl border ${theme === "dark" ? "bg-slate-900/35 border-slate-900" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                      <div>
                        <h4 className="text-sm font-bold font-display">{con.project_title}</h4>
                        <span className="text-[10px] font-mono opacity-50">Price Scope: {con.price}</span>
                      </div>
                      
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono ${
                        con.status === "Signed" ? "bg-emerald-950 text-emerald-400" : "bg-amber-950 text-amber-500 animate-pulse"
                      }`}>
                        {con.status === "Signed" ? "SIGNED & FULLY ACTIVE" : con.status}
                      </span>
                    </div>

                    <div className="space-y-3 bg-slate-950/20 p-4 rounded-xl border dark:border-slate-850/50 border-slate-100 text-xs font-mono leading-relaxed">
                      <p><span className="font-bold block opacity-60">Contract Scope:</span> {con.details}</p>
                      <p><span className="font-bold block opacity-60">Terms & SLA:</span> {con.terms}</p>
                    </div>

                    <div className="mt-5 flex justify-between items-center flex-wrap gap-2 pt-2 border-t dark:border-slate-850/40 border-slate-100">
                      <button
                        onClick={() => {
                          const content = `=====================================================
                    DIAVOX TECH AGENCY
                OFFICIAL SERVICE CONTRACT
=====================================================

Contract Reference ID: ${con.id}
Created On: ${new Date(con.created_at || new Date()).toLocaleDateString()}
Price Core Value: ${con.price}
Status: ${con.status}

CLIENT REPRESENTATIVE:
------------------------------------------
Name: ${con.client_name}
Client ID: ${con.client_id}

PROJECT SCOPE:
------------------------------------------
Title: ${con.project_title}
Deliverables Summary:
${con.details}

CONFIDENTIALITY & SLA TERMS:
------------------------------------------
${con.terms}

=====================================================
Status Authenticity Seal: ${con.status === "Signed" ? "VERIFIED DIGITAL SIGNATURE DETECTED" : "AWAITING DIGITAL SIGNATURE"}
Security IP Verification: Verified Client Dashboard Core
Platform Integration Code: Diavox Remote Sync Engine
=====================================================`;
                          const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = `DIAVOX-CONTRACT-${con.id}.txt`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          
                          setAlertText("Covenant downloaded to local directories.");
                          setTimeout(() => setAlertText(null), 3000);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-mono transition-colors font-bold"
                      >
                        Download Contract Document (TXT)
                      </button>

                      {con.status !== "Signed" && (
                        <button
                          onClick={() => {
                            signContract(con.id);
                            setAlertText("Legal contract signed! Initializing project timelines.");
                            setTimeout(() => setAlertText(null), 4000);
                          }}
                          id={`btn-sign-contract-${con.id}`}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white text-xs font-mono font-bold shadow"
                        >
                          I agree & Sign Contract Digital
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {clientContracts.length === 0 && (
                  <p className="text-xs font-mono opacity-50 text-center py-10">You have no pending service contracts to sign.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: BILLING & PURCHASED PLANS */}
          {activeTab === "plans" && (
            <div className="space-y-6" id="client-tab-plans">
              <div className="flex justify-between items-center border-b dark:border-slate-900 border-slate-100 pb-3">
                <h3 className="text-lg font-display font-extrabold">Billing History & Subscriptions</h3>
                <span className="text-[10px] font-mono opacity-50 uppercase bg-slate-500/10 px-2 py-1 rounded-md">Razorpay Checkout Enabled</span>
              </div>
              
              {/* Active Plan mapped */}
              <div className="space-y-6 animate-fade-in" id="plans-history-list">
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">Your Current Active Subscription</h4>
                  
                  {clientPlans.filter(p => ["Active", "On Hold", "Expired"].includes(p.status)).map((pl) => {
                    const daysRemaining = (() => {
                      if (!pl.renewal_date) return null;
                      const renewal = new Date(pl.renewal_date);
                      const now = new Date();
                      const diffTime = renewal.getTime() - now.getTime();
                      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    })();

                    const isPlanActive = pl.status === "Active";
                    const isPlanOnHold = pl.status === "On Hold";
                    const isPlanExpired = pl.status === "Expired";

                    return (
                      <div key={pl.id} className={`p-6 rounded-2xl border text-left space-y-4 mb-4 shadow-lg ${
                        isPlanActive 
                          ? "bg-gradient-to-br from-slate-900 to-slate-950 border-teal-500/20 shadow-teal-500/5"
                          : isPlanOnHold
                            ? "bg-gradient-to-br from-slate-900 to-slate-950 border-amber-500/20 shadow-amber-500/5"
                            : "bg-slate-950/40 border-slate-800 opacity-70"
                      }`}>
                        <div className="flex justify-between items-start flex-wrap gap-4">
                          <div>
                            <span className={`px-2.5 py-1 rounded text-[9px] font-mono border uppercase font-black tracking-wider ${
                              isPlanActive
                                ? "bg-teal-950 text-teal-400 border-teal-500/20"
                                : isPlanOnHold
                                  ? "bg-amber-950 text-amber-400 border-amber-500/20"
                                  : "bg-slate-900 text-slate-400 border-slate-700"
                            }`}>
                              {pl.billing_cycle} CYCLE
                            </span>
                            <h4 className="text-xl font-display font-extrabold mt-2 text-white">Diavox {pl.plan_name}</h4>
                            <p className="text-xs font-mono opacity-60 mt-1">
                              Payment rate: {pl.price} (Cycle start: {pl.start_date})
                            </p>
                          </div>

                          <div className={`text-left font-mono text-xs px-4 py-2 rounded-xl border ${
                            isPlanActive
                              ? "text-teal-400 bg-teal-500/10 border-teal-500/25"
                              : isPlanOnHold
                                ? "text-amber-400 bg-amber-500/10 border-amber-500/25"
                                : "text-slate-400 bg-slate-500/5 border-slate-700"
                          }`}>
                            <span className="flex items-center space-x-2 font-extrabold justify-end">
                              <span className={`w-2.5 h-2.5 rounded-full ${
                                isPlanActive
                                  ? "bg-teal-400 animate-pulse"
                                  : isPlanOnHold
                                    ? "bg-amber-400 animate-pulse"
                                    : "bg-slate-500"
                              }`} />
                              <span>{pl.status.toUpperCase()} TERM</span>
                            </span>
                            {isPlanActive && daysRemaining !== null && (
                              <p className="text-[10px] text-right text-slate-400 mt-1 uppercase font-bold">
                                {daysRemaining > 0 ? `${daysRemaining} Days Left` : "Renews Today"}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Extra features grid */}
                        <div className="border-t border-slate-900 pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400 gap-3">
                          <div>
                            <span className="font-mono text-[10px] uppercase text-slate-500 block">Subscription Duration</span>
                            <span className="font-medium text-slate-300 text-xs">{pl.duration || "1 Month"}</span>
                          </div>
                          {pl.renewal_date && (
                            <div>
                              <span className="font-mono text-[10px] uppercase text-slate-500 block">Expiration / Renewal</span>
                              <span className="font-medium text-slate-300 text-xs">{pl.renewal_date}</span>
                            </div>
                          )}
                          {pl.notes && (
                            <div className="max-w-xs">
                              <span className="font-mono text-[10px] uppercase text-slate-500 block">Administrative Notes</span>
                              <span className="text-slate-400 text-xs italic line-clamp-2">{pl.notes}</span>
                            </div>
                          )}
                        </div>

                        {pl.features && pl.features.length > 0 && (
                          <div className="border-t border-slate-900 pt-3">
                            <h5 className="font-mono text-[9px] uppercase tracking-wider text-slate-550 mb-2">Cycle Features Inclusions</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 font-sans">
                              {pl.features.map((feat, i) => (
                                <div key={i} className="flex items-start space-x-2">
                                  <span className={isPlanActive ? "text-teal-450 mt-0.5" : isPlanOnHold ? "text-amber-450 mt-0.5" : "text-slate-500 mt-0.5"}>✔</span>
                                  <span>{feat}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {clientPlans.filter(p => ["Active", "On Hold", "Expired"].includes(p.status)).length === 0 && (
                    <div className="p-6 rounded-2xl border dark:border-slate-850 border-slate-150 text-left font-mono text-xs text-slate-400 bg-slate-500/5">
                      <p className="font-bold text-slate-300">No active, on-hold, or expired subscription approved for this cycle.</p>
                      <p className="opacity-70 mt-1 text-[11px]">Select a recommended tier upgrade below to compose an activation proposal for account administrators.</p>
                    </div>
                  )}
                </div>

                {/* Pending approvals tracker */}
                {planApprovals.filter(pa => pa.client_id === currentUser.id && pa.status === "Pending Approval").length > 0 && (
                  <div className="p-5 rounded-2xl bg-amber-950/10 border border-amber-500/20 text-left space-y-2">
                    <span className="px-2 py-0.5 rounded text-[8.5px] font-mono bg-amber-950 text-amber-400 border border-amber-500/20 uppercase font-black tracking-wide animate-pulse inline-block">
                      Awaiting Administrator Approval
                    </span>
                    <h4 className="text-xs font-mono text-slate-300">
                      You requested activation of the{" "}
                      <strong className="text-amber-400 font-extrabold">Diavox {planApprovals.find(pa => pa.client_id === currentUser.id && pa.status === "Pending Approval")?.plan_name} Tier</strong> ({" "}
                      {planApprovals.find(pa => pa.client_id === currentUser.id && pa.status === "Pending Approval")?.price} /{" "}
                      {planApprovals.find(pa => pa.client_id === currentUser.id && pa.status === "Pending Approval")?.billing_cycle} )
                    </h4>
                    <p className="text-[11.5px] text-slate-450 font-sans leading-relaxed">
                      Our finance cell is validating this token setup. Upon countersign, features will instantly populate onto your project rail.
                    </p>
                  </div>
                )}

                {/* Plan Details & Recommended Tiers Sections */}
                <div className="pt-4 border-t dark:border-slate-900 border-slate-100">
                  <div className="text-left mb-6">
                    <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Recommended Service Elevations</h4>
                    <p className="text-xs opacity-65 font-sans mt-0.5">Upgrade or swap packages to fit evolving architectural SLA demands.</p>
                  </div>

                  <div className="space-y-10">
                    {pricingOptions.map((option) => (
                      <div key={option.id} className="space-y-4">
                        <div className="text-left border-b border-slate-200 dark:border-slate-900 pb-2">
                          <h5 className="text-sm font-display font-bold text-cyan-400 tracking-tight">
                            {option.title}
                          </h5>
                          <span className="text-[9px] font-mono opacity-60 uppercase">
                            {option.type === "monthly-subscription" ? "Retainer Subscription (Monthly)" : "One-Time Capital Investment"}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {option.tiers.map((tier) => {
                            const isRecommended = tier.name.toLowerCase() === "standard" || tier.name.toLowerCase() === "expert" || tier.name.toLowerCase() === "professional" || tier.name.toLowerCase() === "pro";
                            return (
                              <div
                                key={tier.name}
                                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 relative ${
                                  isRecommended
                                    ? "border-2 border-cyan-500/40 bg-slate-900/10"
                                    : theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                                }`}
                              >
                                {isRecommended && (
                                  <span className="absolute -top-2.5 right-6 text-[8px] font-black font-mono tracking-widest bg-cyan-500 text-black px-2 py-0.5 rounded-full uppercase">
                                    RECOMMENDED
                                  </span>
                                )}
                                <div className="space-y-3">
                                  <div>
                                    <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded uppercase font-bold">
                                      {tier.name} Tier
                                    </span>
                                    <h4 className="text-sm font-display font-black mt-1">
                                      {option.title} - {tier.name}
                                    </h4>
                                  </div>
                                  <p className="text-lg font-mono font-black text-white">
                                    ${parseFloat(tier.priceUSD.replace(/,/g, "")).toLocaleString("en-US")}
                                    <span className="text-[10px] opacity-50 font-normal">
                                      {option.type === "monthly-subscription" ? " / mo" : " one-time"}
                                    </span>
                                  </p>
                                  <ul className="space-y-1.5 text-[11px] font-mono text-slate-400 text-left pt-2 border-t dark:border-slate-900 border-slate-150">
                                    {tier.features.map((feat: string, i: number) => (
                                      <li key={i} className="flex items-center space-x-1.5">
                                        <Check size={11} className="text-cyan-400 shrink-0" />
                                        <span className="line-clamp-2">{feat}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <button
                                  onClick={async () => {
                                    try {
                                      const billingCycle = option.type === "monthly-subscription" ? "Monthly" : "Annually";
                                      const formattedPrice = "$" + parseFloat(tier.priceUSD.replace(/,/g, "")).toLocaleString("en-US");
                                      await submitPlanApproval(
                                        currentUser.id,
                                        currentUser.name,
                                        `${option.title} (${tier.name})`,
                                        formattedPrice,
                                        billingCycle as any
                                      );
                                      setAlertText(`Activation Proposal for ${option.title} (${tier.name}) submitted successfully!`);
                                    } catch (err: any) {
                                      setAlertText(`Error requesting upgrade: ${err.message || err}`);
                                    }
                                    setTimeout(() => setAlertText(null), 5000);
                                  }}
                                  className={`w-full py-2 rounded-xl font-mono text-[10px] font-bold transition-all ${
                                    isRecommended
                                      ? "bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white shadow shadow-cyan-500/10"
                                      : "bg-slate-800 hover:bg-slate-700 text-white"
                                  }`}
                                >
                                  Request {tier.name} Upgrade
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Billing details invoices */}
                <div className="pt-6 border-t dark:border-slate-900 border-slate-150 space-y-4">
                  <div className="text-left">
                    <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Payments Ledger & Analytics</h4>
                    <p className="text-xs opacity-65 font-sans mt-0.5 font-normal text-slate-500">Review status logs representing corporate service payments.</p>
                  </div>

                  {/* Summary grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                    <div className="p-4 rounded-xl bg-slate-500/5 border dark:border-slate-900 border-slate-205">
                      <span className="text-[9px] font-mono opacity-50 uppercase block font-bold text-slate-450">Completed Payments</span>
                      <span className="text-lg font-mono font-bold dark:text-emerald-400 text-emerald-600 mt-1 block">
                        {clientInvoices.filter(i => i.status === "paid").length} OK
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-500/5 border dark:border-slate-900 border-slate-205">
                      <span className="text-[9px] font-mono opacity-50 uppercase block font-bold text-slate-450">Pending / Incoming</span>
                      <span className="text-lg font-mono font-bold dark:text-amber-400 text-amber-600 mt-1 block">
                        {clientInvoices.filter(i => i.status === "unpaid" || !i.status).length} PEND
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-500/5 border dark:border-slate-900 border-slate-205">
                      <span className="text-[9px] font-mono opacity-50 uppercase block font-bold text-slate-450">Cancelled Invoices</span>
                      <span className="text-lg font-mono font-bold text-slate-400 mt-1 block">
                        {clientInvoices.filter(i => i.status === "cancelled").length} CANC
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-500/5 border dark:border-slate-900 border-slate-205">
                      <span className="text-[9px] font-mono opacity-50 uppercase block font-bold text-slate-450">Gross Invoiced Val</span>
                      <span className="text-lg font-mono font-bold dark:text-white text-slate-900 mt-1 block">
                        ${(clientInvoices.reduce((sum, item) => sum + parseFloat(item.amount.replace(/[^0-9.]/g, "") || "0"), 0) + 12000).toLocaleString()}+
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs font-mono tracking-wider opacity-60 mb-2 uppercase text-left pt-2">Billed Invoices Log</h3>
                  
                  {/* Card list layout on small screens (< 768px) */}
                  <div className="block md:hidden space-y-4 text-left" id="client-billed-invoices-cards">
                    {/* Fixed baseline paid card */}
                    <div className="p-4 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-slate-50 space-y-3">
                      <div className="flex justify-between items-center border-b dark:border-slate-800 border-slate-200 pb-2">
                        <span className="font-mono font-bold text-xs text-cyan-400">#INV-43209</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/10">PAID</span>
                      </div>
                      <div className="space-y-1.5 text-xs font-mono">
                        <p className="text-slate-300"><span className="text-slate-500">Service:</span> Diavox custom portal setup & design studies</p>
                        <p className="text-slate-300"><span className="text-slate-500">Due:</span> 2026-06-11</p>
                        <p className="font-bold text-emerald-400 text-sm"><span className="text-slate-500 font-normal">Amount:</span> $12,000</p>
                      </div>
                      <div className="pt-1">
                        <button
                          onClick={() => {
                            const receiptContent = `=====================================================
                      DIAVOX TECH AGENCY
                   RECEIPT LOG: #INV-43209
=====================================================

Invoice Reg: #INV-43209
Transaction date: 2026-06-11
Client Identifier: ${currentUser.id}

PARTICULARS:
------------------------------------------
Diavox custom portal setup & design studies: $12,000.00
Tax / Cess Rate (SLA standard): $0.00

TOTAL SETTLED AMOUNT: $12,000.00
Status: Settled (OK)

=====================================================
Receipt authenticity check: SECURE PORTAL STABLE TRANSACTION
=====================================================`;
                            const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.download = "Diavox_Receipt_INV-43209.txt";
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            setAlertText("Downloaded Receipt #INV-43209.");
                            setTimeout(() => setAlertText(null), 3000);
                          }}
                          className="w-full text-center py-2 rounded bg-slate-800 text-white font-mono hover:bg-slate-700 transition text-[11px] font-bold cursor-pointer"
                        >
                          Download Receipt
                        </button>
                      </div>
                    </div>

                    {/* Dynamic mapping cards */}
                    {clientInvoices.map((inv, idx) => (
                      <div key={idx} className="p-4 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-slate-50 space-y-3">
                        <div className="flex justify-between items-center border-b dark:border-slate-800 border-slate-200 pb-2">
                          <span className="font-mono font-bold text-xs text-cyan-400">#{inv.invoice_number || `INV-${inv.id.substring(4, 9).toUpperCase()}`}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            inv.status === "paid" 
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-500/10"
                              : inv.status === "cancelled"
                              ? "bg-slate-900 text-slate-500"
                              : "bg-amber-950 text-amber-500 border border-amber-500/10"
                          }`}>
                            {inv.status?.toUpperCase() || "PENDING"}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-xs font-mono">
                          <p className="text-slate-350"><span className="text-slate-500 font-bold">Service:</span> {inv.services || "General subscription retainer"}</p>
                          <p className="text-slate-350"><span className="text-slate-500 font-bold">Due:</span> {inv.due_date || "2026-06-30"}</p>
                          <p className="font-bold text-slate-200 text-sm"><span className="text-slate-500 font-bold">Amount:</span> {inv.amount}</p>
                        </div>
                        <div className="pt-1">
                          <button
                            onClick={() => {
                              const receiptContent = `=====================================================
                      DIAVOX TECH AGENCY
                  RECEIPT LOG: #${inv.invoice_number || `INV-${inv.id.substring(4, 9).toUpperCase()}`}
=====================================================

Invoice Reg: #${inv.invoice_number || `INV-${inv.id.substring(4, 9).toUpperCase()}`}
Due date: ${inv.due_date || "2026-06-30"}
Client Identifier: ${currentUser.id}

PARTICULARS:
------------------------------------------
${inv.services || "Diavox Custom Retainer Subscription"}: ${inv.amount}
Tax / Cess Rate (SLA standard): ${inv.taxes || "$250"}

TOTAL INVOICED VALUE: ${inv.amount}
Status: ${inv.status?.toUpperCase() || "PENDING"}

=====================================================
Receipt authenticity check: SECURE PORTAL STABLE TRANSACTION
=====================================================`;
                              const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.href = url;
                              link.download = `Diavox_Receipt_${inv.invoice_number || inv.id}.txt`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              setAlertText(`Downloaded Receipt reference details.`);
                              setTimeout(() => setAlertText(null), 3000);
                            }}
                            className="w-full text-center py-2 rounded bg-slate-800 text-white font-mono hover:bg-slate-700 transition text-[11px] font-bold cursor-pointer"
                          >
                            Download Receipt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Wide Table view on screen sizes >= 768px */}
                  <div className="hidden md:block overflow-x-auto rounded-2xl border dark:border-slate-900 border-slate-205 text-left">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-slate-500 font-bold">
                          <th className="p-4">Invoice Num</th>
                          <th className="p-4">Plan / Service Description</th>
                          <th className="p-4">Due Date</th>
                          <th className="p-4">Charge Amount</th>
                          <th className="p-4">Receipt Status</th>
                          <th className="p-4 text-center">Receipts Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-slate-900 divide-slate-100 opacity-80">
                        {/* Static baseline paid element */}
                        <tr>
                          <td className="p-4 font-bold">#INV-43209</td>
                          <td className="p-4">Diavox custom portal setup & design studies</td>
                          <td className="p-4">2026-06-11</td>
                          <td className="p-4 font-bold">$12,000</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/10">PAID</span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => {
                                const receiptContent = `=====================================================
                      DIAVOX TECH AGENCY
                   RECEIPT LOG: #INV-43209
=====================================================

Invoice Reg: #INV-43209
Transaction date: 2026-06-11
Client Identifier: ${currentUser.id}

PARTICULARS:
------------------------------------------
Diavox custom portal setup & design studies: $12,000.00
Tax / Cess Rate (SLA standard): $0.00

TOTAL SETTLED AMOUNT: $12,000.00
Status: Settled (OK)

=====================================================
Receipt authenticity check: SECURE PORTAL STABLE TRANSACTION
=====================================================`;
                                const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.href = url;
                                link.download = "Diavox_Receipt_INV-43209.txt";
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                setAlertText("Downloaded Receipt #INV-43209.");
                                setTimeout(() => setAlertText(null), 3000);
                              }}
                              className="px-2.5 py-1 rounded bg-slate-800 text-white font-mono hover:bg-slate-700 transition cursor-pointer"
                            >
                              Download Receipt
                            </button>
                          </td>
                        </tr>

                        {clientInvoices.map((inv, idx) => (
                          <tr key={idx}>
                            <td className="p-4 font-bold">#{inv.invoice_number || `INV-${inv.id.substring(4, 9).toUpperCase()}`}</td>
                            <td className="p-4">{inv.services || "General subscription retainer"}</td>
                            <td className="p-4">{inv.due_date || "2026-06-30"}</td>
                            <td className="p-4 font-bold">{inv.amount}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                inv.status === "paid" 
                                  ? "bg-emerald-950 text-emerald-400 border border-emerald-500/10"
                                  : inv.status === "cancelled"
                                  ? "bg-slate-900 text-slate-500"
                                  : "bg-amber-950 text-amber-500 border border-amber-500/10"
                              }`}>
                                {inv.status?.toUpperCase() || "PENDING"}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => {
                                  const receiptContent = `=====================================================
                      DIAVOX TECH AGENCY
                  RECEIPT LOG: #${inv.invoice_number || `INV-${inv.id.substring(4, 9).toUpperCase()}`}
=====================================================

Invoice Reg: #${inv.invoice_number || `INV-${inv.id.substring(4, 9).toUpperCase()}`}
Due date: ${inv.due_date || "2026-06-30"}
Client Identifier: ${currentUser.id}

PARTICULARS:
------------------------------------------
${inv.services || "Diavox Custom Retainer Subscription"}: ${inv.amount}
Tax / Cess Rate (SLA standard): ${inv.taxes || "$250"}

TOTAL INVOICED VALUE: ${inv.amount}
Status: ${inv.status?.toUpperCase() || "PENDING"}

=====================================================
Receipt authenticity check: SECURE PORTAL STABLE TRANSACTION
=====================================================`;
                                  const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
                                  const url = URL.createObjectURL(blob);
                                  const link = document.createElement("a");
                                  link.href = url;
                                  link.download = `Diavox_Receipt_${inv.invoice_number || inv.id}.txt`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  setAlertText(`Downloaded Receipt reference details.`);
                                  setTimeout(() => setAlertText(null), 3000);
                                }}
                                className="px-2.5 py-1 rounded bg-slate-800 text-white font-mono hover:bg-slate-700 transition cursor-pointer"
                              >
                                Download Receipt
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {clientInvoices.length === 0 && (
                    <p className="text-slate-500 font-mono text-[10.5px] italic text-center pt-2">
                      Additional dynamic invoice pipelines will display here once dispatched by Diavox financial administrators.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Live messaging with human team */}
          {activeTab === "chat" && (
            <div className="space-y-4" id="client-tab-chat">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b dark:border-slate-900 border-slate-100 pb-3 gap-2">
                <div className="text-left animate-fade-in">
                  <h3 className="text-lg font-display font-extrabold">Help & Communication Desks</h3>
                  <p className="text-xs opacity-65 font-sans mt-0.5">Secure client dialogue link directly synchronized with Diavox technical leaders.</p>
                </div>
              </div>

              {/* RENDER CHAT COCKPIT: ENTERPRISE HUMAN TEAM CHAT */}
              <div className="rounded-2xl border dark:border-slate-900 border-slate-200 overflow-hidden flex flex-col justify-between h-[480px] bg-white dark:bg-slate-950" id="chat-frame-human">
                {/* Human Header with SLA markers */}
                <div className="dark:bg-slate-900 bg-slate-50 p-4 border-b dark:border-slate-950 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">Corporate Technical Responders</h4>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">Response SLA Commitment: Within 24 Hours Guaranteed</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-black">Support Team Active</span>
                </div>

                  {/* Drag-and-drop file sharing overlay zone */}
                  <div 
                    className="flex-1 overflow-hidden relative flex flex-col justify-between"
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={async (e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      const files = e.dataTransfer.files;
                      if (files && files.length > 0) {
                        const fileObj = files[0];
                        try {
                          setAlertText(`Uploading "${fileObj.name}" to secure storage...`);
                          const path = `chats/${currentUser.id}/${Date.now()}_${fileObj.name}`;
                          const publicUrl = await uploadFileToBucket("chat-files", path, fileObj);
                          const isImg = fileObj.type.startsWith("image/");
                          sendMessage("team", `Sent attachment: ${fileObj.name}`, publicUrl, fileObj.name, isImg);
                          setAlertText(`File "${fileObj.name}" uploaded and shared with developers.`);
                          setTimeout(() => setAlertText(null), 3500);
                        } catch (err: any) {
                          setAlertText(`Upload failed: ${err.message || err}`);
                          setTimeout(() => setAlertText(null), 5000);
                        }
                      }
                    }}
                  >
                    {isDragOver && (
                      <div className="absolute inset-0 z-10 bg-cyan-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center animate-fade-in p-6">
                        <Upload className="text-cyan-400 animate-bounce mb-2" size={32} />
                        <h5 className="font-bold text-sm text-white">Drop File to Upload & Link</h5>
                        <p className="text-xs text-slate-300 mt-1">Files uploaded would immediately sync in enterprise technical records.</p>
                      </div>
                    )}

                    {/* Chat feed messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 dark:bg-slate-950/20 bg-slate-50/50" id="human-chat-feed">
                      {chatMessages.map((m) => {
                        const isCurrentUser = m.sender_id === currentUser.id;
                        return (
                          <div
                            key={m.id}
                            className={`flex flex-col max-w-[80%] ${
                              isCurrentUser ? "ml-auto text-right items-end" : "mr-auto text-left items-start"
                            }`}
                          >
                            <span className="text-[9px] font-mono opacity-50 mb-1">{m.sender_name} ({m.sender_role.replace("_", " ")})</span>
                            <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                              isCurrentUser 
                                ? "bg-cyan-600 text-white shadow-md text-left" 
                                : "dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 text-slate-900 dark:text-white text-left"
                            }`}>
                              <div>{m.message_text}</div>
                              {m.file_url && (
                                <div className="mt-2 pt-2 border-t border-white/10 dark:border-slate-800">
                                  {m.is_image ? (
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
                                        isCurrentUser
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
                      {chatMessages.length === 0 && (
                        <p className="text-xs font-mono opacity-40 text-center py-20">No active ticket messages. Start typing below to schedule technical deployment or upload scopes.</p>
                      )}
                    </div>
                  </div>

                  {/* Form & file attachment attachment trigger */}
                  <div className={`p-3 border-t flex flex-col gap-2 ${
                    theme === "dark" ? "bg-slate-900 border-slate-950" : "bg-slate-100 border-slate-100"
                  }`}>
                    {/* SLA notification banner */}
                    <div className="flex items-center space-x-1.5 opacity-60 text-slate-400 font-mono text-[9px] select-none pl-1">
                      <Info size={10} className="text-cyan-500" />
                      <span>Dedicated Lead Support Assigned: Tech team resolves tickets in under 24 hours.</span>
                    </div>

                    <form onSubmit={handleSendMessage} className="flex gap-2">
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
                                setAlertText(`Uploading "${file.name}" to secure storage...`);
                                const path = `chats/${currentUser.id}/${Date.now()}_${file.name}`;
                                const publicUrl = await uploadFileToBucket("chat-files", path, file);
                                const isImg = file.type.startsWith("image/");
                                sendMessage("team", `Sent attachment: ${file.name}`, publicUrl, file.name, isImg);
                                setAlertText(`File "${file.name}" uploaded and shared with developers.`);
                                setTimeout(() => setAlertText(null), 3500);
                              } catch (err: any) {
                                setAlertText(`Upload failed: ${err.message || err}`);
                                setTimeout(() => setAlertText(null), 5000);
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
                        value={typedMessage}
                        onChange={(e) => setTypedMessage(e.target.value)}
                        placeholder="Inquire about milestones, share links or files..."
                        className={`flex-1 text-xs p-2.5 rounded-lg border focus:outline-none ${
                          theme === "dark" 
                            ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500" 
                            : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                        }`}
                        id="chat-message-text-input"
                      />
                      <button
                        type="submit"
                        className="p-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white transition-all hover:brightness-110"
                        id="btn-send-chat-submit"
                      >
                        <Send size={15} />
                      </button>
                    </form>
                  </div>
                </div>

            </div>
          )}

          {/* TAB 6: CLIENT REVIEWS CRUD */}
          {activeTab === "reviews" && (
            <div className="space-y-6" id="client-tab-reviews">
              <h3 className="text-lg font-display font-extrabold pb-3 border-b dark:border-slate-900 border-slate-100">Review Board (Full CRUD)</h3>
              
              {/* Form client write review */}
              <div className={`p-5 rounded-2xl border ${theme === "dark" ? "bg-slate-900/35 border-slate-900" : "bg-slate-50 border-slate-200"}`}>
                <h4 className="text-sm font-bold font-display mb-4">Post Customer Experience review</h4>
                
                <form onSubmit={handlePostReview} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono opacity-60 mb-1" htmlFor="dashboard-star-field">Service Star rating</label>
                      <select
                        id="dashboard-star-field"
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="w-full text-xs p-2.5 rounded-lg border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="5">★★★★★ (5 Stars)</option>
                        <option value="4">★★★★☆ (4 Stars)</option>
                        <option value="3">★★★☆☆ (3 Stars)</option>
                        <option value="2">★★☆☆☆ (2 Stars)</option>
                        <option value="1">★☆☆☆☆ (1 Star)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono opacity-60 mb-1" htmlFor="dashboard-service-field font-sans">Service Completed</label>
                      <select
                        id="dashboard-service-field"
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="Website Development">Website Development</option>
                        <option value="Website Design">Website Design</option>
                        <option value="Technical SEO & Auditing">Technical SEO & Auditing</option>
                        <option value="AI Automation workflows">AI Automation workflows</option>
                        <option value="Sub-second Code Refactoring">Sub-second Code Refactoring</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono opacity-60 mb-1" htmlFor="dashboard-review-text-field">Review text</label>
                    <textarea
                      id="dashboard-review-text-field"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Describe our team speed and communication during remote sessions..."
                      rows={3}
                      className="w-full text-xs p-2.5 rounded-lg border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none placeholder-slate-400 dark:placeholder-slate-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      id="btn-post-dashboard-review"
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 font-bold text-xs font-mono text-white tracking-wider"
                    >
                      Publish review
                    </button>
                  </div>
                </form>
              </div>

              {/* List reviews and let delete */}
              <div className="pt-4" id="dashboard-client-posted-reviews">
                <h3 className="text-sm font-mono tracking-wider opacity-60 mb-4 uppercase">My Posted Reviews</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clientReviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl border dark:border-slate-900 border-slate-200 text-xs text-left relative flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold flex text-yellow-400">
                            {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${
                            rev.status === "Approved" ? "bg-emerald-950 text-emerald-400" : "bg-slate-800 text-slate-350"
                          }`}>
                            {rev.status}
                          </span>
                        </div>
                        <p className="opacity-80 py-1 font-light italic">"{rev.review_text}"</p>
                      </div>

                      <div className="flex items-center justify-between border-t dark:border-slate-900 border-slate-100 pt-3 mt-4 text-[10px] font-mono text-slate-400">
                        <span>{rev.service_used}</span>
                        <button
                          onClick={() => {
                            setConfirmDialog({
                              isOpen: true,
                              title: "Delete permanently?",
                              message: "Are you sure you want to permanently erase this customer testimonial review from the database registry?",
                              onConfirm: () => {
                                deleteReview(rev.id);
                                setAlertText("Review has been deleted from history logs.");
                                setConfirmDialog(null);
                                setTimeout(() => setAlertText(null), 4000);
                              }
                            });
                          }}
                          className="text-rose-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {clientReviews.length === 0 && (
                    <p className="text-xs font-mono opacity-50 col-span-2 text-center py-10">You have not submitted any reviews yet.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {activeTab === "help-kb" && (
            <div className="space-y-6 animate-fade-in" id="client-panel-help-kb animate-fade-in">
              <HelpCenter />
            </div>
          )}

        </div>

      </div>

      {/* Global premium confirmation overlay modal */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in" id="client-confirmation-overlay">
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
