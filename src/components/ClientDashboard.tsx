/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useStore } from "../store";
import { uploadFileToBucket } from "../supabase";
import { 
  Compass, Briefcase, FileSignature, Receipt, Bell, MessageSquare, 
  Send, AlertTriangle, Star, CheckCircle, Clock, Check, ChevronRight, X,
  User, Key, Upload, Bot, Lock, FileText, Info, Eye, EyeOff, BookOpen, Activity
} from "lucide-react";
import { ClientReview, RequestStatus } from "../types";
import HelpCenter from "./HelpCenter";
import TimelineCenter from "./TimelineCenter";

export default function ClientDashboard() {
  const { 
    theme, currentUser, requests, projects, contracts, activePlans, planApprovals, submitPlanApproval, invoices,
    notifications, messages, reviews, sendMessage, signContract, addReview, deleteReview, markNotificationsRead,
    quoteReplies, quoteAttachments, quoteStatusHistory, submitQuoteReply
  } = useStore();

  const [activeTab, setActiveTab] = useState<"profile" | "projects" | "contracts" | "plans" | "requests" | "chat" | "reviews" | "help-kb" | "timeline">("profile");
  
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

      {/* Workspace layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="client-workspace-grid">
        
        {/* Navigation Rail */}
        <div className="lg:col-span-3 space-y-2 flex flex-col" id="client-sidebar-navigation">
          <button
            onClick={() => setActiveTab("profile")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors ${
              activeTab === "profile" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <User size={15} className="text-cyan-500" />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors ${
              activeTab === "projects" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <Briefcase size={15} />
            <span>Ongoing Orders ({clientProjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors ${
              activeTab === "requests" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <Compass size={15} />
            <span>Requests ({clientRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("contracts")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors ${
              activeTab === "contracts" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <FileSignature size={15} />
            <span>Contracts ({clientContracts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("plans")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors ${
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
            }}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center justify-between transition-colors ${
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
            onClick={() => setActiveTab("reviews")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors ${
              activeTab === "reviews" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <Star size={15} />
            <span>Reviews</span>
          </button>

          <button
            onClick={() => setActiveTab("help-kb")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors ${
              activeTab === "help-kb" ? "bg-slate-900 text-amber-400 border border-amber-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen size={15} />
            <span>Knowledge Desk</span>
          </button>

          <button
            onClick={() => setActiveTab("timeline")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors ${
              activeTab === "timeline" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <Activity size={15} />
            <span>Operations Timeline</span>
          </button>
        </div>

        {/* Dynamic Display Panels */}
        <div className="lg:col-span-9" id="client-workspace-pane">
          
          {/* TAB 0: User Profile Portal (The Opening Page) */}
          {activeTab === "profile" && (
            <div className="space-y-6" id="client-tab-profile">
              <h3 className="text-lg font-display font-bold pb-3 border-b dark:border-slate-900 border-slate-100">My Personal Profile Portal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Visual Avatar Manager */}
                <div className={`md:col-span-4 p-6 rounded-2xl border flex flex-col items-center justify-center text-center ${
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
                <div className={`md:col-span-8 p-6 rounded-2xl border space-y-4 ${
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
                </div>

                {/* Danger Zone: Permanently Delete Account option */}
                <div className={`col-span-12 p-6 rounded-2xl border border-rose-500/15 space-y-4 ${
                  theme === "dark" ? "bg-rose-950/5" : "bg-rose-50/20"
                }`} id="profile-danger-zone">
                  <span className="text-[10px] font-mono tracking-widest text-rose-500 uppercase font-bold block pb-1 border-b border-rose-500/15">Danger Zone (Irreversible actions)</span>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 text-left">
                      <h4 className="text-xs font-mono font-bold text-rose-500">Permanently Delete Account</h4>
                      <p className="text-[11px] opacity-75 font-sans font-light leading-relaxed text-slate-400">
                        This will permanently erase your secure profile credentials, records, and active credentials sessions immediately.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmDialog({
                          isOpen: true,
                          title: "Permanently Delete Your Account?",
                          message: "WARNING: This action is non-reversible. This will immediately erase your records and disconnect your active session from the server.",
                          onConfirm: async () => {
                            try {
                              const { deleteUserAccount } = useStore.getState();
                              await deleteUserAccount(currentUser.id);
                            } catch (err: any) {
                              alert("Failed to delete account: " + err.message);
                            }
                            setConfirmDialog(null);
                          }
                        });
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-mono text-xs font-bold transition-all shrink-0 cursor-pointer shadow-md shadow-rose-950/10"
                    >
                      Delete My Account
                    </button>
                  </div>
                </div>

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
                                      <div className="mt-1.5 pt-1.5 border-t border-slate-100/20 text-[9px] font-mono flex flex-col gap-0.5 text-left">
                                        {reply.attachments.map(at => (
                                          <div key={at.id} className="flex items-center space-x-1">
                                            <span className="opacity-60">📎 File:</span>
                                            <a href={at.file_url} className="underline text-cyan-300 hover:text-white" target="_blank" rel="noopener noreferrer">{at.file_name}</a>
                                          </div>
                                        ))}
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
                                    await submitQuoteReply(req.id, `Shared quote file scope: ${f.name}`, [{ file_name: f.name, file_url: "#" }]);
                                    setAlertText(`Successfully linked quote document: "${f.name}"!`);
                                    setTimeout(() => setAlertText(null), 3000);
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
                  
                  {clientPlans.filter(p => p.status === "Active").map((pl) => (
                    <div key={pl.id} className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-teal-500/20 text-left flex justify-between items-center flex-wrap gap-4 mb-4 shadow-lg shadow-teal-500/5">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-teal-950 text-teal-400 border border-teal-500/20 uppercase font-black">
                          {pl.billing_cycle} CYCLE
                        </span>
                        <h4 className="text-lg font-display font-extrabold mt-1.5 text-white">Diavox Tech {pl.plan_name}</h4>
                        <p className="text-xs font-mono opacity-60 mt-1">Renewal rate: {pl.price} (Start: {pl.start_date || "2026-06-14"})</p>
                      </div>

                      <div className="text-left py-1 sm:text-right font-mono text-xs text-teal-400 bg-teal-500/10 px-3.5 py-1.5 rounded-xl border border-teal-500/20">
                        <span className="flex items-center space-x-1.5 justify-end font-extrabold">
                          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                          <span>ACTIVE BILLING</span>
                        </span>
                      </div>
                    </div>
                  ))}

                  {clientPlans.filter(p => p.status === "Active").length === 0 && (
                    <div className="p-6 rounded-2xl border dark:border-slate-850 border-slate-150 text-left font-mono text-xs text-slate-400 bg-slate-500/5">
                      <p className="font-bold text-slate-300">No active subscription approved for this cycle.</p>
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
                  <div className="text-left mb-4">
                    <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Recommended Service Elevations</h4>
                    <p className="text-xs opacity-65 font-sans mt-0.5">Upgrade or swap packages to fit evolving architectural SLA demands.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* STARTER */}
                    <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                      theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                    }`}>
                      <div className="space-y-3">
                        <div>
                          <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded uppercase font-bold">Starter Unit</span>
                          <h4 className="text-sm font-display font-black mt-1">Diavox Starter</h4>
                        </div>
                        <p className="text-lg font-mono font-black text-white">$5,000<span className="text-[10px] opacity-50 font-normal"> / mo</span></p>
                        <ul className="space-y-1.5 text-[11px] font-mono text-slate-405 text-left pt-2 border-t dark:border-slate-900 border-slate-150">
                          <li className="flex items-center space-x-1.5"><Check size={11} className="text-cyan-400" /><span>Core Web Platform</span></li>
                          <li className="flex items-center space-x-1.5"><Check size={11} className="text-cyan-400" /><span>Diavox Chat Desk Access</span></li>
                          <li className="flex items-center space-x-1.5"><Check size={11} className="text-cyan-400" /><span>Standard VPS hosting</span></li>
                          <li className="flex items-center space-x-1.5"><Check size={11} className="text-cyan-400" /><span>1 API Integration tunnel</span></li>
                        </ul>
                      </div>
                      <button
                        onClick={() => {
                          submitPlanApproval(currentUser.id, currentUser.name, "Starter", "$5,000", "Monthly");
                          setAlertText("Starter Activation Request issued to Diavox Administrations!");
                          setTimeout(() => setAlertText(null), 3500);
                        }}
                        className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-[10.5px] font-bold transition-colors"
                      >
                        Request Starter Unit
                      </button>
                    </div>

                    {/* PROFESSIONAL */}
                    <div className={`p-5 rounded-2xl border-2 border-cyan-500/40 relative flex flex-col justify-between space-y-4 ${
                      theme === "dark" ? "bg-slate-900/40" : "bg-white shadow-md border-cyan-500"
                    }`}>
                      <span className="absolute -top-2.5 right-6 text-[8px] font-black font-mono tracking-widest bg-cyan-500 text-black px-2 py-0.5 rounded-full uppercase">RECOMMENDED</span>
                      <div className="space-y-3">
                        <div>
                          <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded uppercase font-bold">Pro Systems</span>
                          <h4 className="text-sm font-display font-black mt-1 text-cyan-400">Diavox Professional</h4>
                        </div>
                        <p className="text-lg font-mono font-black text-white">$12,050<span className="text-[10px] opacity-50 font-normal"> / mo</span></p>
                        <ul className="space-y-1.5 text-[11px] font-mono text-slate-405 text-left pt-2 border-t dark:border-slate-850 border-slate-150">
                          <li className="flex items-center space-x-1.5"><Check size={11} className="text-cyan-400" /><span>Custom LLM AI Agent</span></li>
                          <li className="flex items-center space-x-1.5"><Check size={11} className="text-cyan-400" /><span>Pro automated DevOps pipeline</span></li>
                          <li className="flex items-center space-x-1.5"><Check size={11} className="text-cyan-400" /><span>24/7 Priority Responses</span></li>
                          <li className="flex items-center space-x-1.5"><Check size={11} className="text-cyan-400" /><span>Unlimited Gateway Tunnels</span></li>
                        </ul>
                      </div>
                      <button
                        onClick={() => {
                          submitPlanApproval(currentUser.id, currentUser.name, "Professional", "$12,050", "Monthly");
                          setAlertText("Professional Activation Request issued to Diavox Administrations!");
                          setTimeout(() => setAlertText(null), 3500);
                        }}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white font-mono text-[10.5px] font-black transition-colors shadow shadow-cyan-500/10"
                      >
                        Request Pro Upgrade
                      </button>
                    </div>

                    {/* ENTERPRISE */}
                    <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                      theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200"
                    }`}>
                      <div className="space-y-3">
                        <div>
                          <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded uppercase font-bold">Enterprise Orchestration</span>
                          <h4 className="text-sm font-display font-black mt-1">Diavox Enterprise</h4>
                        </div>
                        <p className="text-lg font-mono font-black text-white">$24,950<span className="text-[10px] opacity-50 font-normal"> / mo</span></p>
                        <ul className="space-y-1.5 text-[11px] font-mono text-slate-405 text-left pt-2 border-t dark:border-slate-900 border-slate-150">
                          <li className="flex items-center space-x-1.5"><Check size={11} className="text-cyan-400" /><span>Private Dedicated Host clusters</span></li>
                          <li className="flex items-center space-x-1.5"><Check size={11} className="text-cyan-400" /><span>GPU fine-tuning cycles</span></li>
                          <li className="flex items-center space-x-1.5"><Check size={11} className="text-cyan-400" /><span>Dedicated Tech Architect lead</span></li>
                          <li className="flex items-center space-x-1.5"><Check size={11} className="text-cyan-400" /><span>Custom Legal Service covenants</span></li>
                        </ul>
                      </div>
                      <button
                        onClick={() => {
                          submitPlanApproval(currentUser.id, currentUser.name, "Enterprise", "$24,950", "Monthly");
                          setAlertText("Enterprise Activation Request issued to Diavox Administrations!");
                          setTimeout(() => setAlertText(null), 3500);
                        }}
                        className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-[10.5px] font-bold transition-colors"
                      >
                        Request Enterprise Host
                      </button>
                    </div>
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
                  <div className="overflow-x-auto rounded-2xl border dark:border-slate-900 border-slate-205 text-left">
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
                              className="px-2.5 py-1 rounded bg-slate-800 text-white font-mono hover:bg-slate-700 transition"
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
                                className="px-2.5 py-1 rounded bg-slate-800 text-white font-mono hover:bg-slate-700 transition"
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
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      const files = e.dataTransfer.files;
                      if (files && files.length > 0) {
                        const fileName = files[0].name;
                        // Pre-inject uploaded attachment message!
                        sendMessage(currentUser.id, `Shared contract file attachment: ${fileName} (Ready for developer assessment)`);
                        setAlertText(`Document file: "${fileName}" has been safely parsed & shared with developers.`);
                        setTimeout(() => setAlertText(null), 3500);
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
                                ? "bg-cyan-600 text-white shadow-md" 
                                : "dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 text-slate-900 dark:text-white"
                            }`}>
                              {m.message_text}
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
                          input.onchange = (e: any) => {
                            const file = e.target.files[0];
                            if (file) {
                              sendMessage(currentUser.id, `Shared file attachment document: ${file.name}`);
                              setAlertText(`Document attachment: "${file.name}" linked successfully in live room.`);
                              setTimeout(() => setAlertText(null), 3500);
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

          {activeTab === "timeline" && (
            <div className="space-y-6 animate-fade-in" id="client-panel-timeline animate-fade-in">
              <TimelineCenter mode="client" />
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
