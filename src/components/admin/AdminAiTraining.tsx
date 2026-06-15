import React, { useState } from "react";
import { useStore } from "../../store";
import { AiKnowledgeItem, UserRole } from "../../types";
import { Plus, Edit2, Trash2, Cpu, X, HelpCircle, Save, BadgeInfo } from "lucide-react";

export default function AdminAiTraining() {
  const { aiKnowledge, addAiKnowledge, updateAiKnowledge, deleteAiKnowledge, currentUser, theme } = useStore();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states variables
  const [category, setCategory] = useState("General Pricing");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const resetForm = () => {
    setCategory("General Pricing");
    setQuestion("");
    setAnswer("");
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateAiKnowledge(editingId, { category, question, answer });
    } else {
      addAiKnowledge(category, question, answer);
    }
    resetForm();
  };

  const handleEdit = (item: AiKnowledgeItem) => {
    setEditingId(item.id);
    setCategory(item.category);
    setQuestion(item.question);
    setAnswer(item.answer);
    setIsAdding(true);
  };

  // RBAC safety check: Authorized users are secret_admin, primary_admin, secondary_admin, or team_member with explicit ai_training_access permission
  const hasAccess = ["secret_admin", "primary_admin", "secondary_admin"].includes(currentUser.role) || 
                    (currentUser.role === "team_member" && currentUser.permissions?.includes("ai_training_access"));

  if (!hasAccess) {
    return (
      <div className="p-8 rounded-2xl border border-rose-500/10 bg-rose-500/5 text-center space-y-3 font-mono text-xs max-w-md mx-auto min-h-[40vh] flex flex-col items-center justify-center">
        <BadgeInfo size={32} className="text-rose-450" />
        <h3 className="font-bold uppercase text-rose-400">Security Clearance Insufficient</h3>
        <p className="text-slate-400 font-sans leading-relaxed">
          Your current personnel hierarchy profile does not hold explicit clearance keys to modify standard artificial intelligence dataset modules.
        </p>
      </div>
    );
  }

  const categories = ["General Pricing", "Turnaround Time", "AutoPay Subscription", "Milestones Security", "Visual parameters", "Bespoke technology"];

  return (
    <div className="space-y-6 text-left" id="admin-aitraining-panel">
      <div className="flex items-center justify-between pb-3 border-b dark:border-slate-850 border-slate-100" id="admin-aitraining-header">
        <div>
          <h4 className="text-sm font-mono tracking-widest text-indigo-400 font-bold uppercase">KNOWLEDGE INJECTOR</h4>
          <h3 className="text-lg font-display font-bold">AI Agent Training Hub</h3>
          <p className="text-xs text-slate-400 mt-0.5">Define FAQ, training databases, pricing models, and specific information modules processed by the custom Gemini support engine.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold inline-flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-505/10"
          >
            <Plus size={14} />
            <span>Add QA Record</span>
          </button>
        )}
      </div>

      {isAdding ? (
        <form onSubmit={handleSubmit} className={`p-6 rounded-2xl border text-left space-y-4 ${
          theme === "dark" ? "bg-slate-950 border-slate-900" : "bg-white border-slate-200 shadow-sm"
        }`} id="aitrain-form">
          <div className="flex justify-between items-center pb-2 border-b dark:border-slate-900 border-slate-100">
            <h4 className="text-sm font-display font-bold text-indigo-400">
              {editingId ? "Refine Training Module" : "Inject Knowledge Module"}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 rounded-full hover:bg-slate-500/10 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Classification Domain Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-800 focus:border-indigo-550 w-full text-white" 
                    : "bg-white border-slate-205 focus:border-indigo-500 text-slate-900"
                }`}
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Client Query Phrase / Topic Question</label>
              <input
                type="text"
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What occurs in case milestones payments are overdue?"
                className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-800 focus:border-indigo-550 w-full text-white" 
                    : "bg-white border-slate-205 focus:border-indigo-500 text-slate-900"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Resolved Intelligence Answer (Processed verbatim by Gemini)</label>
              <textarea
                required
                rows={5}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Provide accurate, comprehensive service terms or instructions..."
                className={`w-full p-3 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-800 focus:border-indigo-550 w-full text-white" 
                    : "bg-white border-slate-200 focus:border-indigo-500 text-slate-900"
                }`}
              />
            </div>

            <div className="pt-3 flex justify-end space-x-2 border-t border-slate-850">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl border dark:border-slate-800 border-slate-205 hover:bg-slate-500/10 font-mono text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition-all shadow-md"
              >
                Inject database
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          {aiKnowledge.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 text-left ${
                theme === "dark" ? "bg-slate-900/40 border-slate-805" : "bg-white border-slate-100 shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="px-2 py-0.5 rounded text-[8px] font-mono bg-indigo-550/15 text-indigo-400 uppercase font-bold tracking-wider leading-none">
                  {item.category}
                </span>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1 rounded hover:bg-slate-500/10 text-yellow-500"
                    title="Edit Record"
                  >
                    <Edit2 size={11} />
                  </button>
                  <button
                    onClick={() => deleteAiKnowledge(item.id)}
                    className="p-1 rounded hover:bg-slate-500/10 text-rose-500"
                    title="Delete Record"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-mono font-bold dark:text-slate-200 text-slate-800 leading-snug">
                  Q: {item.question}
                </h4>
                <p className="text-xs text-slate-400 font-sans mt-1.5 leading-relaxed bg-slate-500/5 p-3 rounded-lg border dark:border-slate-850 border-slate-100">
                  {item.answer}
                </p>
              </div>

              <div className="text-[8px] font-mono text-slate-550 uppercase text-right leading-none">
                Module ID: {item.id} | Timestamped sync
              </div>
            </div>
          ))}

          {aiKnowledge.length === 0 && (
            <div className="text-center py-12 text-slate-500 font-mono text-xs">
              AI agent operating on base model limits. Training catalog is empty.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
