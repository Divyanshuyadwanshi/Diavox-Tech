import React, { useState } from "react";
import { useStore } from "../../store";
import { ServiceRequest, RequestStatus } from "../../types";
import { MessageSquare, Clock, ShieldAlert, Send, ArrowRight, UserCheck, Inbox } from "lucide-react";

export default function AdminQuotes() {
  const { 
    requests, updateRequestStatus, addActivityLog, currentUser, 
    quoteReplies, submitQuoteReply, theme 
  } = useStore();

  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState("");

  const handleStatusChange = (id: string, newStatus: RequestStatus, clientName: string) => {
    updateRequestStatus(id, newStatus);
    addActivityLog(
      currentUser.id,
      `Changed quote inquiry status for client "${clientName}"`,
      "Previous status cached",
      `New Status: ${newStatus}`
    );
  };

  const handleReplySubmit = (e: React.FormEvent, reqId: string) => {
    e.preventDefault();
    if (!replyInput.trim()) return;

    submitQuoteReply(reqId, replyInput.trim(), []);
    
    // Auto progress status to "In Progress" if submitted status was active
    const targetReq = requests.find(r => r.id === reqId);
    if (targetReq && targetReq.status === "Submitted") {
      updateRequestStatus(reqId, "In Progress");
    }

    addActivityLog(
      currentUser.id,
      `Submitted primary proposal reply on quote enquiry #${reqId}`,
      "Awaiting direct response",
      replyInput.trim().substring(0, 35) + "..."
    );

    setReplyInput("");
  };

  const activeReq = requests.find(r => r.id === selectedReqId);
  const activeReplies = quoteReplies.filter(qr => qr.quote_id === selectedReqId);

  return (
    <div className="space-y-6 text-left" id="admin-quotes-panel">
      <div className="border-b dark:border-slate-850 border-slate-100 pb-4">
        <h4 className="text-sm font-mono tracking-widest text-cyan-405 font-bold uppercase">TRIAGE PORTAL</h4>
        <h3 className="text-lg font-display font-bold">Quotes & Client Leads</h3>
        <p className="text-xs text-slate-400 mt-1">
          Review details of brand service requests, adjust client statuses, and respond with quotes files.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Quotes general list */}
        <div className="lg:col-span-5 space-y-3" id="quotes-list-container">
          <h4 className="text-xs font-mono font-bold text-slate-505 uppercase">Active Leads ({requests.length})</h4>
          
          <div className="space-y-2.5 max-h-[70vh] overflow-y-auto pr-1">
            {requests.map((req) => {
              const isSelected = selectedReqId === req.id;
              return (
                <button
                  key={req.id}
                  onClick={() => setSelectedReqId(req.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? "border-cyan-500/30 bg-cyan-950/10 ring-1 ring-cyan-500/10" 
                      : (theme === "dark" ? "bg-slate-900/40 border-slate-805 hover:bg-slate-900/70" : "bg-white border-slate-100 hover:bg-slate-50/50 shadow-sm")
                  }`}
                  id={`btn-select-quote-${req.id}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">ID: #{req.id}</span>
                    <span className={`px-2 py-0.2 rounded text-[8px] font-mono uppercase font-bold ${
                      req.status === "Submitted" ? "bg-cyan-500/15 text-cyan-400" :
                      req.status === "In Progress" ? "bg-indigo-550/15 text-indigo-400" :
                      req.status === "Approved" ? "bg-emerald-550/15 text-emerald-400" :
                      "bg-slate-500/15 text-slate-400"
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-2 truncate">
                    {req.service_type}
                  </h4>
                  <p className="text-xs text-slate-450 mt-1.5 line-clamp-2">{req.description}</p>

                  <div className="flex items-center justify-between mt-3 text-[10px] font-mono text-slate-500 border-t border-slate-850 pt-2.5">
                    <span className="truncate max-w-[100px]">{req.client_name}</span>
                    <span>{new Date(req.created_at).toLocaleDateString()}</span>
                  </div>
                </button>
              );
            })}

            {requests.length === 0 && (
              <div className="text-center py-12 text-slate-500 font-mono text-xs border border-dashed dark:border-slate-900 rounded-xl">
                No active sales channels found.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quote Work Space context */}
        <div className="lg:col-span-7">
          {activeReq ? (
            <div className={`p-6 rounded-2xl border text-left flex flex-col justify-between min-h-[60vh] h-full ${
              theme === "dark" ? "bg-slate-950/40 border-slate-900" : "bg-white border-slate-205 shadow-sm"
            }`} id="quote-work-workspace">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b dark:border-slate-900 border-slate-100 gap-2">
                  <div>
                    <h3 className="text-sm font-mono font-bold text-cyan-400">Enquiry details</h3>
                    <h2 className="text-base font-display font-bold text-slate-900 dark:text-white mt-0.5">{activeReq.service_type}</h2>
                  </div>

                  {/* Status switches */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className="text-[10px] font-mono text-slate-550 mr-1 font-bold">SET STATUS:</span>
                    {(["Submitted", "In Progress", "Approved", "Declined"] as RequestStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(activeReq.id, st, activeReq.client_name)}
                        className={`p-1 px-1.5 rounded text-[8px] font-mono font-bold uppercase transition-all ${
                          activeReq.status === st 
                            ? "bg-cyan-500 text-white" 
                            : "bg-slate-500/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub Metadata parameters */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-500/5 font-mono text-[11px] text-slate-400">
                  <p><span className="text-slate-550 font-bold">Client:</span> {activeReq.client_name}</p>
                  <p><span className="text-slate-550 font-bold">Contact:</span> {activeReq.client_email}</p>
                  <p><span className="text-slate-550 font-bold">Sub Date:</span> {new Date(activeReq.created_at).toLocaleString()}</p>
                  <p><span className="text-slate-550 font-bold">Budget Tier:</span> {activeReq.budget || "N/A"}</p>
                </div>

                {/* Scope Brief Box */}
                <div className="space-y-1">
                  <h4 className="text-[10px] font-mono uppercase text-slate-505 font-bold">Inquiry Details Scope Brief</h4>
                  <div className="p-4 rounded-xl dark:bg-slate-900 border dark:border-slate-850 border-slate-100 text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                    {activeReq.description}
                  </div>
                </div>

                {/* Replies Thread */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-[10px] font-mono uppercase text-slate-505 font-bold">Quotes & Conversation Thread</h4>
                  
                  <div className="space-y-2 max-h-[25vh] overflow-y-auto p-1 bg-slate-500/5 rounded-xl border dark:border-slate-900 border-slate-100">
                    {activeReplies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`p-3 rounded-lg text-xs flex flex-col text-left ${
                          reply.sender_role === "client" 
                            ? "bg-indigo-950/15 border border-indigo-500/20 text-indigo-300 self-start" 
                            : "bg-cyan-950/20 border border-cyan-500/20 text-cyan-300 self-end ml-4"
                        }`}
                      >
                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 mb-1">
                          <span className="font-bold">{reply.sender_name} ({reply.sender_role})</span>
                          <span>{new Date(reply.created_at).toLocaleTimeString()}</span>
                        </div>
                        <p className="font-sans leading-relaxed">{reply.message_text}</p>
                      </div>
                    ))}

                    {activeReplies.length === 0 && (
                      <div className="text-center py-6 text-[10px] font-mono text-slate-450 uppercase flex items-center justify-center space-x-1.5">
                        <Inbox size={14} />
                        <span>No proposals sent yet. Draft one below!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reply Form Footer block */}
              <form onSubmit={(e) => handleReplySubmit(e, activeReq.id)} className="mt-4 pt-3 border-t border-slate-850 flex items-center space-x-2">
                <input
                  type="text"
                  required
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder="Draft proposal specifications / response quote..."
                  className={`flex-1 p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                    theme === "dark" 
                      ? "bg-slate-900 border-slate-800 focus:border-cyan-550 text-white" 
                      : "bg-white border-slate-205 focus:border-cyan-500 text-slate-900"
                  }`}
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-500/10 shrink-0"
                  title="Deliver proposal reply"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full text-slate-450 font-mono border border-dashed dark:border-slate-900 rounded-2xl min-h-[60vh]">
              <MessageSquare size={32} className="text-slate-600 mb-3" />
              <p className="text-xs">Select active inquiry profile on the left side to enter responses workspace.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
