import React, { useState } from "react";
import { useStore } from "../../store";
import { Plus, Trash2, X, Hash, Calendar, FileText } from "lucide-react";

export default function AdminProjectGroups() {
  const { teamGroups, createTeamGroup, deleteTeamGroup, theme } = useStore();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createTeamGroup(
      name.trim().toLowerCase().replace(/\s+/g, "-"),
      description.trim()
    );

    setName("");
    setDescription("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in" id="admin-projectgroups-panel">
      <div className="flex items-center justify-between pb-3 border-b dark:border-slate-850 border-slate-100" id="admin-projectgroups-header">
        <div>
          <h4 className="text-sm font-mono tracking-widest text-cyan-400 font-bold uppercase">WORK SPACES</h4>
          <h3 className="text-lg font-display font-bold">Project Team Groups</h3>
          <p className="text-xs text-slate-400 mt-0.5">Spin up custom discussion channels and focus design sprints around individual deliverables.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold inline-flex items-center space-x-1.5 transition-all shadow-md"
          >
            <Plus size={14} />
            <span>Spin-up Channel</span>
          </button>
        )}
      </div>

      {isAdding ? (
        <form onSubmit={handleSubmit} className={`p-6 rounded-2xl border text-left space-y-4 ${
          theme === "dark" ? "bg-slate-950 border-slate-900" : "bg-white border-slate-200 shadow-sm"
        }`} id="project-group-form">
          <div className="flex justify-between items-center pb-2 border-b dark:border-slate-900 border-slate-100">
            <h4 className="text-sm font-display font-bold text-cyan-400">Initiate Focus Channel</h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="p-1 rounded-full hover:bg-slate-500/10 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Channel Topic / Name</label>
              <div className="relative">
                <Hash size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="apex-custom-saas"
                  className={`w-full p-2.5 pl-9 rounded-xl text-xs font-mono border focus:ring-1 outline-none transition-all ${
                    theme === "dark" 
                      ? "bg-slate-900 border-slate-800 focus:border-cyan-555 text-white" 
                      : "bg-white border-slate-200 focus:border-cyan-500 text-slate-900"
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Workspace Focus Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Backoffice discussion for backend schema alignments..."
                className={`w-full p-3 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-805 focus:border-cyan-555 text-white" 
                    : "bg-white border-slate-205 focus:border-cyan-500 text-slate-900"
                }`}
              />
            </div>

            <div className="pt-3 flex justify-end space-x-2 border-t border-slate-850">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl border dark:border-slate-800 border-slate-205 hover:bg-slate-500/10 font-mono text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all"
              >
                Publish channel
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamGroups.map((group) => (
            <div
              key={group.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 text-left ${
                theme === "dark" ? "bg-slate-900/40 border-slate-805" : "bg-white border-slate-100 shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-cyan-405 font-bold flex items-center space-x-1">
                    <Hash size={12} />
                    <span>{group.name}</span>
                  </span>

                  <button
                    onClick={() => deleteTeamGroup(group.id)}
                    className="p-1.5 rounded hover:bg-slate-500/10 text-rose-500 transition-all"
                    title="Delete Group"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <p className="text-xs text-slate-400 font-sans mt-3 leading-relaxed bg-slate-500/5 p-3 rounded-lg border dark:border-slate-850 border-slate-100">
                  {group.description || "Discussion focus not formulated yet."}
                </p>
              </div>

              <div className="text-[9px] font-mono text-slate-500 uppercase text-right leading-none border-t border-slate-850 pt-2.5">
                Channel ID: {group.id}
              </div>
            </div>
          ))}

          {teamGroups.length === 0 && (
            <div className="col-span-2 text-center py-12 text-slate-500 font-mono text-xs border border-dashed dark:border-slate-900 rounded-xl">
              No bespoke focus channels initialized.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
