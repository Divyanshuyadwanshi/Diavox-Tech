import React, { useState } from "react";
import { useStore } from "../../store";
import { Project } from "../../types";
import { Plus, Edit2, Trash2, X, Briefcase, Sparkles } from "lucide-react";

export default function AdminWorkProjects() {
  const { projects, allUsers, addProject, updateProject, deleteProject, theme } = useStore();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states matching Project interface exactly
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientId, setClientId] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"Website Development" | "Website Design" | "SEO" | "AI Automation">("Website Development");
  const [technologiesInput, setTechnologiesInput] = useState("");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop");
  const [completionDate, setCompletionDate] = useState("");
  const [status, setStatus] = useState<"ongoing" | "completed" | "backlog">("ongoing");
  const [progress, setProgress] = useState(0);
  const [assignedTo, setAssignedTo] = useState<string[]>([]);

  // Helpers
  const teamMembersList = allUsers.filter(u => u.role === "team_member" || u.role === "secondary_admin");
  const clientsList = allUsers.filter(u => u.role === "client");

  const resetForm = () => {
    setTitle("");
    setClientName("");
    setClientId("");
    setDescription("");
    setCategory("Website Development");
    setTechnologiesInput("");
    setImageUrl("https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop");
    setCompletionDate("");
    setStatus("ongoing");
    setProgress(0);
    setAssignedTo([]);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const techs = technologiesInput.split(",").map(t => t.trim()).filter(Boolean);

    const projectData = {
      title,
      description,
      category,
      technologies: techs,
      image_url: imageUrl,
      completion_date: completionDate,
      status,
      progress: Number(progress),
      assigned_to: assignedTo,
      client_id: clientId || undefined,
      client_name: clientName || undefined
    };

    if (editingId) {
      updateProject(editingId, projectData);
    } else {
      addProject(projectData);
    }
    resetForm();
  };

  const handleEdit = (proj: Project) => {
    setEditingId(proj.id);
    setTitle(proj.title);
    setClientName(proj.client_name || "");
    setClientId(proj.client_id || "");
    setDescription(proj.description || "");
    setCategory(proj.category);
    setTechnologiesInput(proj.technologies ? proj.technologies.join(", ") : "");
    setImageUrl(proj.image_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop");
    setCompletionDate(proj.completion_date || "");
    setStatus(proj.status);
    setProgress(proj.progress);
    setAssignedTo(proj.assigned_to || []);
    setIsAdding(true);
  };

  const toggleTeamAssignment = (id: string) => {
    if (assignedTo.includes(id)) {
      setAssignedTo(assignedTo.filter(memberId => memberId !== id));
    } else {
      setAssignedTo([...assignedTo, id]);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in" id="admin-workprojects-main">
      <div className="flex items-center justify-between" id="admin-workprojects-header">
        <div>
          <h4 className="text-sm font-mono tracking-widest text-cyan-400 font-bold uppercase">TEAM CASE MANAGER</h4>
          <h3 className="text-lg font-display font-bold">Work Projects</h3>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold inline-flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-500/10 cursor-pointer"
            id="btn-add-pcase"
          >
            <Plus size={14} />
            <span>Create New Project</span>
          </button>
        )}
      </div>

      {isAdding ? (
        <form onSubmit={handleSubmit} className={`p-6 rounded-2xl border text-left space-y-4 ${
          theme === "dark" ? "bg-slate-950 border-slate-900" : "bg-white border-slate-205 shadow-sm"
        }`} id="work-project-form">
          <div className="flex justify-between items-center pb-2 border-b dark:border-slate-900/50 border-slate-101">
            <h4 className="text-sm font-display font-bold text-cyan-400">
              {editingId ? "Edit Work Case" : "Register New Active Project"}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-405 font-bold">Project Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Athena SaaS Platform Development"
                className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-405 font-bold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                }`}
              >
                <option value="Website Development">Website Development</option>
                <option value="Website Design">Website Design</option>
                <option value="SEO">SEO Auditing</option>
                <option value="AI Automation">AI Automation</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-405 font-bold">Assign Client</label>
              <select
                value={clientId}
                onChange={(e) => {
                  const id = e.target.value;
                  setClientId(id);
                  const selectedUser = clientsList.find(c => c.id === id);
                  setClientName(selectedUser ? selectedUser.name : "");
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" ? "bg-slate-905 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                }`}
              >
                <option value="">Select pre-registered client...</option>
                {clientsList.map(client => (
                  <option key={client.id} value={client.id}>{client.name} ({client.email})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-405 font-bold">Custom Client Name (Fallback)</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Acme Corp Inc"
                className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                }`}
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-mono uppercase text-slate-405 font-bold">Case Study / Project Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the deliverable, milestones reached, and overall project objectives..."
                className={`w-full p-3 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-405 font-bold">Technologies Used (Comma Separated)</label>
              <input
                type="text"
                value={technologiesInput}
                onChange={(e) => setTechnologiesInput(e.target.value)}
                placeholder="React, Supabase, Tailwind CSS"
                className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-405 font-bold">Completion Date / Deadline</label>
              <input
                type="date"
                required
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-405 font-bold">Initial Milestone Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className={`w-full p-2.5 rounded-xl text-xs font-mono border focus:ring-1 outline-none transition-all ${
                    theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                  }`}
                >
                  <option value="ongoing">Ongoing Progress</option>
                  <option value="completed">Completed Study</option>
                  <option value="backlog">Backlog / Queue</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-450 font-bold flex justify-between">
                  <span>SLA Percentage Progress</span>
                  <span className="text-cyan-400 font-bold">{progress}%</span>
                </label>
                <div className="flex items-center space-x-2.5 pt-1.5">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="flex-1 accent-cyan-500 h-1.5 rounded-lg bg-slate-850"
                  />
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-[10px] font-mono uppercase text-slate-405 font-bold">Assign Team Members</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl border dark:border-slate-900 border-slate-100 max-h-40 overflow-y-auto">
                {teamMembersList.map(member => {
                  const isChecked = assignedTo.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleTeamAssignment(member.id)}
                      className={`p-2 rounded-lg text-xs font-mono text-left border flex items-center justify-between transition-all ${
                        isChecked 
                          ? "bg-cyan-950/20 border-cyan-500/40 text-cyan-400" 
                          : "border-slate-800 hover:bg-slate-500/5 text-slate-400"
                      }`}
                    >
                      <span className="truncate">{member.name}</span>
                      {isChecked && <Sparkles size={11} className="text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t dark:border-slate-900/50 border-slate-100">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl border dark:border-slate-800 border-slate-205 hover:bg-slate-500/10 font-mono text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-md shadow-cyan-500/10 cursor-pointer"
            >
              Commit Project Case
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                  theme === "dark" 
                    ? "bg-slate-900/30 border-slate-900 hover:border-slate-850" 
                    : "bg-white border-slate-201 shadow-sm hover:shadow"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[8px] font-mono bg-cyan-500/10 text-cyan-400 font-bold uppercase">
                        {proj.category}
                      </span>
                      <h3 className="text-sm font-display font-bold leading-tight text-slate-900 dark:text-white mt-1.5">{proj.title}</h3>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                      proj.status === "completed" 
                        ? "bg-teal-500/10 text-teal-400" 
                        : proj.status === "backlog" 
                          ? "bg-slate-800 text-slate-400" 
                          : "bg-amber-500/10 text-amber-400"
                    }`}>
                      {proj.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-450 mt-2.5 line-clamp-3 leading-relaxed font-light">
                    {proj.description}
                  </p>

                  <div className="space-y-1.5 pt-3 border-t dark:border-slate-900/50 border-slate-100 mt-3 font-mono text-[10px] text-slate-400">
                    <p><span className="text-slate-500 font-bold">Client:</span> {proj.client_name || "Self-Initiated"}</p>
                    <p><span className="text-slate-500 font-bold">Deadline:</span> {proj.completion_date || "Continuous"}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1.5">
                        {proj.technologies.map(tech => (
                          <span key={tech} className="bg-slate-500/5 border dark:border-slate-850 border-slate-100 text-slate-400 px-1 py-0.2 rounded text-[8px]">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-slate-500">Progress SLA:</span>
                      <span className="text-cyan-400 font-bold">{proj.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full" style={{ width: `${proj.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t dark:border-slate-800 border-slate-100 pt-2.5">
                    {/* Display assigned team members */}
                    <div className="flex -space-x-1 overflow-hidden">
                      {proj.assigned_to && proj.assigned_to.length > 0 ? (
                        proj.assigned_to.map(memberId => {
                          const mUser = allUsers.find(u => u.id === memberId);
                          return (
                            <span 
                              key={memberId} 
                              className="inline-block h-5 w-5 rounded-full ring-2 ring-slate-900 bg-cyan-900/20 text-[9px] font-mono font-bold text-cyan-400 flex items-center justify-center uppercase border border-cyan-850"
                              title={mUser ? mUser.name : "Team Member"}
                            >
                              {mUser ? mUser.name.substring(0, 2) : "TM"}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-[9px] text-slate-500 italic">No staff assigned</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        onClick={() => handleEdit(proj)}
                        className="p-1 px-1.5 rounded bg-cyan-950/20 text-cyan-400 hover:bg-cyan-500/10 text-[10px] font-mono flex items-center space-x-1 cursor-pointer font-bold border border-cyan-500/10"
                      >
                        <Edit2 size={10} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this project?")) {
                            deleteProject(proj.id);
                          }
                        }}
                        className="p-1 px-1.5 rounded bg-rose-955 text-rose-455 hover:bg-rose-500/10 text-[10px] font-mono flex items-center space-x-1 cursor-pointer font-bold border border-rose-550/10"
                      >
                        <Trash2 size={10} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {projects.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500 border border-dashed dark:border-slate-850 border-slate-100 rounded-2xl w-full">
                <Briefcase className="mx-auto text-slate-500 opacity-50 mb-3" size={24} />
                <p className="text-xs font-mono">No work projects configured in system.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
