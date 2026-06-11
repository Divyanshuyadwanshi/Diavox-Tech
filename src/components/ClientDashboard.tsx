/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useStore } from "../store";
import { 
  Compass, Briefcase, FileSignature, Receipt, Bell, MessageSquare, 
  Send, AlertTriangle, Star, CheckCircle, Clock, Check, ChevronRight, X 
} from "lucide-react";
import { ClientReview, RequestStatus } from "../types";

export default function ClientDashboard() {
  const { 
    theme, currentUser, requests, projects, contracts, activePlans, 
    notifications, messages, reviews, sendMessage, signContract, addReview, deleteReview, markNotificationsRead 
  } = useStore();

  const [activeTab, setActiveTab] = useState<"projects" | "contracts" | "plans" | "requests" | "chat" | "reviews">("projects");
  
  // Chat input
  const [typedMessage, setTypedMessage] = useState<string>("");

  // Review states inside client dashboard
  const [reviewText, setReviewText] = useState<string>("");
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [selectedService, setSelectedService] = useState<string>("Website Development");
  const [alertText, setAlertText] = useState<string | null>(null);

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
  const clientProjects = projects.filter(p => p.client_id === currentUser.id || p.status === "ongoing" || p.id === "proj-3");
  const clientRequests = requests.filter(r => r.client_id === currentUser.id);
  const clientContracts = contracts.filter(c => c.client_id === currentUser.id || c.id === "con-1");
  const clientPlans = activePlans.filter(p => p.client_id === currentUser.id);
  
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
            onClick={() => setActiveTab("projects")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors ${
              activeTab === "projects" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <Briefcase size={15} />
            <span>Active Deliveries ({clientProjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors ${
              activeTab === "requests" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <Compass size={15} />
            <span>Quote Requests ({clientRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("contracts")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors ${
              activeTab === "contracts" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <FileSignature size={15} />
            <span>Digital Contracts ({clientContracts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("plans")}
            className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center space-x-2.5 transition-colors ${
              activeTab === "plans" ? "bg-slate-900 text-cyan-400 border border-cyan-500/10" : "hover:bg-slate-500/5 text-slate-400 hover:text-white"
            }`}
          >
            <Receipt size={15} />
            <span>Active Plans ({clientPlans.length})</span>
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
              <span>Project Chat Messenger</span>
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
            <span>Write reviews (CRUD)</span>
          </button>
        </div>

        {/* Dynamic Display Panels */}
        <div className="lg:col-span-9" id="client-workspace-pane">
          
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
                  <div key={req.id} className={`p-5 rounded-2xl border ${theme === "dark" ? "bg-slate-900/30 border-slate-900" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
                      <div>
                        <h4 className="text-sm font-bold font-display">{req.service_type}</h4>
                        <span className="text-[10px] font-mono opacity-55">SLA-ID: {req.id}</span>
                      </div>
                      
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold ${
                        req.status === "Approved" || req.status === "In Progress"
                          ? "bg-emerald-950/50 text-emerald-405 border border-emerald-900"
                          : req.status === "Completed"
                          ? "bg-blue-950/50 text-blue-400 border border-blue-900"
                          : "bg-amber-950/50 text-amber-500 border border-amber-900"
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <p className="text-xs opacity-80 leading-relaxed font-light">{req.description}</p>
                    
                    {req.budget && (
                      <div className="mt-4 text-xs font-mono flex items-center justify-between">
                        <span>Proposed budget: <span className="font-bold text-cyan-400">{req.budget}</span></span>
                        <span className="opacity-40 text-[9px]">SLA Response limit: &lt;24 hours</span>
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

                    {con.status !== "Signed" && (
                      <div className="mt-5 flex justify-end">
                        <button
                          onClick={() => {
                            signContract(con.id);
                            setAlertText("Legal contract signed! Initializing project timlines.");
                            setTimeout(() => setAlertText(null), 4000);
                          }}
                          id={`btn-sign-contract-${con.id}`}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white text-xs font-mono font-bold shadow"
                        >
                          I agree & Sign Contract Digital
                        </button>
                      </div>
                    )}
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
              <h3 className="text-lg font-display font-extrabold pb-3 border-b dark:border-slate-900 border-slate-100">Billing History & Plans</h3>
              
              {/* Active Plan mapped */}
              <div className="space-y-4" id="plans-history-list">
                {clientPlans.map((pl) => (
                  <div key={pl.id} className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-cyan-500/30 text-left flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/20 uppercase">
                        {pl.billing_cycle} CYCLE
                      </span>
                      <h4 className="text-lg font-display font-extrabold mt-1.5">Diavox Tech {pl.plan_name}</h4>
                      <p className="text-xs font-mono opacity-60 mt-1">Renewal rate: {pl.price} (Start: {pl.start_date})</p>
                    </div>

                    <div className="text-left py-1 sm:text-right font-mono text-xs text-emerald-400">
                      <span className="flex items-center space-x-1 justify-end font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>ACTIVE BILLING</span>
                      </span>
                    </div>
                  </div>
                ))}

                {/* Billing details invoices */}
                <h3 className="text-xs font-mono tracking-wider opacity-60 pt-4 mb-2 uppercase">Billed Invoices Log</h3>
                <div className="overflow-x-auto rounded-2xl border dark:border-slate-900 border-slate-205">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-slate-500">
                        <th className="p-4 font-bold">Invoice ID</th>
                        <th className="p-4 font-bold">Plan Description</th>
                        <th className="p-4 font-bold">Date Billed</th>
                        <th className="p-4 font-bold">Charge Amount</th>
                        <th className="p-4 font-bold text-center">Receipts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-900 divide-slate-100 opacity-80">
                      <tr>
                        <td className="p-4 font-bold">#INV-43209</td>
                        <td className="p-4">Diavox custom portal setup & design studies</td>
                        <td className="p-4">2026-06-11</td>
                        <td className="p-4 font-bold">$12,000</td>
                        <td className="p-4 text-emerald-400 font-bold text-center select-none">Paid (OK)</td>
                      </tr>
                      {clientPlans.map((pl, idx) => (
                        <tr key={idx}>
                          <td className="p-4 font-bold">#INV-{Math.floor(10000 + Math.random() * 90000)}</td>
                          <td className="p-4">Diavox subscription: {pl.plan_name}</td>
                          <td className="p-4">{pl.start_date}</td>
                          <td className="p-4 font-bold">{pl.price}</td>
                          <td className="p-4 text-emerald-400 font-bold text-center select-none">Paid (OK)</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Live messaging */}
          {activeTab === "chat" && (
            <div className="space-y-4" id="client-tab-chat">
              <h3 className="text-lg font-display font-extrabold pb-3 border-b dark:border-slate-900 border-slate-100">Diavox Team Messenger</h3>
              
              <div className="rounded-2xl border dark:border-slate-900 border-slate-200 overflow-hidden flex flex-col justify-between h-[450px]" id="chat-frame">
                {/* Header chat bar info */}
                <div className="bg-slate-900 p-4 border-b dark:border-slate-950 border-slate-150 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-white font-mono">REMOTE HELP RESPONDERS</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Responses SLA &lt;24 hours</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase">SECURED COCKPIT</span>
                </div>

                {/* Messages feeds */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 dark:bg-slate-950/20 bg-slate-50/50" id="chat-feed">
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
                            ? "bg-cyan-550 bg-cyan-600 text-white" 
                            : "dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 text-slate-900 dark:text-white"
                        }`}>
                          {m.message_text}
                        </div>
                      </div>
                    );
                  })}
                  {chatMessages.length === 0 && (
                    <p className="text-xs font-mono opacity-40 text-center py-20">Type a message below to connect with Diavox sales developers directly.</p>
                  )}
                </div>

                {/* Message input */}
                <form onSubmit={handleSendMessage} className={`p-3 border-t flex gap-2 ${
                  theme === "dark" ? "bg-slate-900 border-slate-950" : "bg-slate-100 border-slate-100"
                }`}>
                  <input
                    type="text"
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    placeholder="Enter project inquiry details or schedule links..."
                    className={`flex-1 text-xs p-2.5 rounded-lg border focus:outline-none ${
                        theme === "dark" 
                          ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500" 
                          : "bg-white border-slate-205 text-slate-900 placeholder-slate-400"
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
                            deleteReview(rev.id);
                            setAlertText("Review has been deleted from history logs.");
                            setTimeout(() => setAlertText(null), 4000);
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

        </div>

      </div>
    </div>
  );
}
