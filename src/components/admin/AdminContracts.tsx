import React, { useState } from "react";
import { useStore } from "../../store";
import { Plus, Check, X, FileText, Clipboard, DollarSign, UserCheck } from "lucide-react";
import { Contract } from "../../types";

export default function AdminContracts() {
  const { contracts, allUsers, theme, addContract } = useStore();

  const [isAdding, setIsAdding] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientId, setClientId] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [price, setPrice] = useState("");
  const [details, setDetails] = useState("");
  const [terms, setTerms] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [errMessage, setErrMessage] = useState("");

  const clientsList = allUsers.filter(u => u.role === "client");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setErrMessage("");

    try {
      await addContract({
        client_id: clientId || "client-guest",
        client_name: clientName,
        project_title: projectTitle,
        details,
        terms,
        status: "Pending Signature",
        price,
      });

      // Reset
      setIsAdding(false);
      setClientId("");
      setClientName("");
      setProjectTitle("");
      setPrice("");
      setDetails("");
      setTerms("");
    } catch (err: any) {
      console.error("Failed to create contract:", err);
      setErrMessage(err?.message || "Failed to publish contract draft. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6 text-left" id="admin-contracts-panel">
      <div className="flex items-center justify-between" id="admin-contracts-header">
        <div>
          <h4 className="text-sm font-mono tracking-widest text-cyan-400 font-bold uppercase">SERVICE COVENANTS</h4>
          <h3 className="text-lg font-display font-bold">Contracts & Agreements</h3>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold inline-flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-500/10"
          >
            <Plus size={14} />
            <span>Generate Contract</span>
          </button>
        )}
      </div>

      {isAdding ? (
        <form onSubmit={handleSubmit} className={`p-6 rounded-2xl border text-left space-y-4 ${
          theme === "dark" ? "bg-slate-950 border-slate-900" : "bg-white border-slate-205 shadow-sm"
        }`} id="contract-form">
          <div className="flex justify-between items-center pb-2 border-b dark:border-slate-900 border-slate-100">
            <h4 className="text-sm font-display font-bold text-cyan-400">Compose Legal Service Covenant</h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="p-1 rounded-full hover:bg-slate-500/10 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Select Client ID</label>
              <select
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  const matched = clientsList.find(c => c.id === e.target.value);
                  if (matched) setClientName(matched.name);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-800 focus:border-cyan-550 w-full text-white" 
                    : "bg-white border-slate-200 focus:border-cyan-500 text-slate-900"
                }`}
              >
                <option value="">-- Choose Client Profile --</option>
                {clientsList.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Client Full Name (Guest Manual)</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Or input guest client..."
                className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-800 focus:border-cyan-550 w-full text-white" 
                    : "bg-white border-slate-205 focus:border-cyan-500 text-slate-900"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Target project Title</label>
              <input
                type="text"
                required
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Apex Custom AI Automation campaign"
                className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-800 focus:border-cyan-550 w-full text-white" 
                    : "bg-white border-slate-205 focus:border-cyan-500 text-slate-900"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Agreed Value Price</label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="$12,000 / ₹9,95,000"
                className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-800 focus:border-cyan-550 w-full text-white" 
                    : "bg-white border-slate-205 focus:border-cyan-500 text-slate-900"
                }`}
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Agreed Work Deliverables & Scope Details</label>
              <textarea
                required
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Define explicit scope of developmental capabilities..."
                className={`w-full p-3 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-800 focus:border-cyan-550 w-full text-white" 
                    : "bg-white border-slate-200 focus:border-cyan-500 text-slate-900"
                }`}
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Contract Clause terms & Milestone Releases</label>
              <textarea
                required
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="50% advance release, 50% on final presentation. Overdue interests standard details..."
                className={`w-full p-3 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-800 focus:border-cyan-550 w-full text-white" 
                    : "bg-white border-slate-200 focus:border-cyan-500 text-slate-900"
                }`}
              />
            </div>

            {errMessage && (
              <div className="col-span-1 md:col-span-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
                {errMessage}
              </div>
            )}

            <div className="col-span-1 md:col-span-2 pt-3 flex justify-end space-x-2 border-t border-slate-850">
              <button
                type="button"
                disabled={isPublishing}
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl border dark:border-slate-800 border-slate-205 hover:bg-slate-500/10 disabled:opacity-50 font-mono text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPublishing}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono text-xs font-bold transition-all"
              >
                {isPublishing ? "Publishing..." : "Publish Covenant draft"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contracts.map((con) => (
            <div
              key={con.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                theme === "dark" ? "bg-slate-900/40 border-slate-805" : "bg-white border-slate-100 shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase font-bold ${
                    con.status === "Signed" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/15 text-amber-500 border border-amber-500/20"
                  }`}>
                    {con.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-550 font-bold uppercase">{con.price}</span>
                </div>

                <div className="flex items-center space-x-2 mt-3 text-slate-900 dark:text-white">
                  <FileText size={16} className="text-cyan-500 shrinking-0" />
                  <h3 className="text-sm font-display font-bold truncate leading-tight">{con.project_title}</h3>
                </div>

                <p className="text-xs text-slate-450 font-mono mt-1.5 leading-snug"><span className="text-slate-550">Client:</span> {con.client_name}</p>
                <div className="mt-3 p-3 rounded-lg bg-slate-500/5 text-xs text-slate-400 text-left space-y-1 font-sans">
                  <p className="line-clamp-2"><span className="text-[10px] font-mono uppercase block text-slate-550">Scope deliverables:</span>{con.details}</p>
                  <p className="line-clamp-1 mt-1"><span className="text-[10px] font-mono uppercase block text-slate-550">Payment Clause Terms:</span>{con.terms}</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 uppercase border-t border-slate-850 pt-2.5">
                <span>Created: {new Date(con.created_at).toLocaleDateString()}</span>
                {con.status === "Signed" ? (
                  <span className="text-emerald-400 font-bold inline-flex items-center space-x-1">
                    <UserCheck size={11} />
                    <span>Countersigned</span>
                  </span>
                ) : (
                  <span className="text-amber-500 font-medium shrink-0 animate-pulse">Awaiting countersign</span>
                )}
              </div>
            </div>
          ))}

          {contracts.length === 0 && (
            <div className="col-span-2 text-center py-12 text-slate-450 text-xs font-mono border border-dashed dark:border-slate-900 rounded-xl">
              No legal service agreements drafted yet. Generate one above.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
