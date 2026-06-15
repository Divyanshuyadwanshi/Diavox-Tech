import React, { useState } from "react";
import { useStore } from "../../store";
import { Project } from "../../types";
import { Lock, Unlock, CheckSquare, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";

export default function AdminOngoingProgress() {
  const { projects, updateProjectProgress, addActivityLog, currentUser, theme } = useStore();
  
  // Custom tracking for unlocked project edits state variables
  const [unlockedProgressIds, setUnlockedProgressIds] = useState<string[]>([]);
  
  // Form sliders tracking states for temporary uncommitted changes
  const [localProgress, setLocalProgress] = useState<{ [id: string]: number }>({});
  
  // Double confirmation states variables
  const [confirmingUpdate, setConfirmingUpdate] = useState<{
    projectId: string;
    original: number;
    proposed: number;
    title: string;
  } | null>(null);

  const toggleLock = (projectId: string, current: number) => {
    if (unlockedProgressIds.includes(projectId)) {
      // Locking back
      setUnlockedProgressIds(unlockedProgressIds.filter(id => id !== projectId));
      // Revert local changes
      const updatedLocal = { ...localProgress };
      delete updatedLocal[projectId];
      setLocalProgress(updatedLocal);
    } else {
      // Unlocking
      setUnlockedProgressIds([...unlockedProgressIds, projectId]);
      setLocalProgress({ ...localProgress, [projectId]: current });
    }
  };

  const handleSliderChange = (projectId: string, val: number) => {
    setLocalProgress({
      ...localProgress,
      [projectId]: val
    });
  };

  const handleSaveTrigger = (proj: Project) => {
    const proposed = localProgress[proj.id];
    if (proposed === undefined || proposed === proj.progress) {
      // No actual modification
      toggleLock(proj.id, proj.progress);
      return;
    }

    setConfirmingUpdate({
      projectId: proj.id,
      original: proj.progress,
      proposed: proposed,
      title: proj.title
    });
  };

  const commitUpdate = () => {
    if (!confirmingUpdate) return;
    const { projectId, original, proposed, title } = confirmingUpdate;

    // Call store action
    updateProjectProgress(projectId, proposed);

    // Call activity logs
    addActivityLog(
      currentUser.id,
      `Adjusted completion progress of project "${title}"`,
      `Started: ${original}%`,
      `Updated: ${proposed}%`
    );

    // Re-lock project input range controls
    setUnlockedProgressIds(unlockedProgressIds.filter(id => id !== projectId));
    const updatedLocal = { ...localProgress };
    delete updatedLocal[projectId];
    setLocalProgress(updatedLocal);

    // Reset modals
    setConfirmingUpdate(null);
  };

  return (
    <div className="space-y-6 text-left" id="admin-ongoing-progress">
      <div className="border-b dark:border-slate-850 border-slate-100 pb-4">
        <h4 className="text-sm font-mono tracking-widest text-teal-400 font-bold uppercase">DOUBLE VERIFICATION SUITE</h4>
        <h3 className="text-lg font-display font-bold">Ongoing Work Progress Tracker</h3>
        <p className="text-xs text-slate-400 mt-1">
          Lock/unlock progress sliders and utilize dual-confirmation protocols to eliminate accidental clicks and ensure real-time audit logging.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="projects-grid-progress">
        {projects.map((proj) => {
          const isUnlocked = unlockedProgressIds.includes(proj.id);
          const currentVal = localProgress[proj.id] !== undefined ? localProgress[proj.id] : proj.progress;

          return (
            <div
              key={proj.id}
              className={`p-5 rounded-2xl border transition-all duration-300 ${
                isUnlocked 
                  ? "border-cyan-500/30 ring-1 ring-cyan-500/10 bg-cyan-950/5" 
                  : (theme === "dark" ? "bg-slate-900/40 border-slate-805" : "bg-white border-slate-100 shadow-sm")
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase bg-slate-950 px-2 py-0.5 rounded text-slate-400">
                  Client: {proj.client_name}
                </span>

                <button
                  onClick={() => toggleLock(proj.id, proj.progress)}
                  className={`p-1.5 rounded-lg flex items-center space-x-1 text-[10px] font-mono font-bold transition-all uppercase ${
                    isUnlocked 
                      ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20" 
                      : "bg-slate-500/10 text-slate-400 hover:bg-slate-500/25"
                  }`}
                  id={`btn-toggle-lock-${proj.id}`}
                  title={isUnlocked ? "Click to lock and revert" : "Unlock progress adjustment slider"}
                >
                  {isUnlocked ? (
                    <>
                      <Unlock size={11} className="text-amber-400" />
                      <span>Unlocked</span>
                    </>
                  ) : (
                    <>
                      <Lock size={11} className="text-slate-500" />
                      <span>Locked</span>
                    </>
                  )}
                </button>
              </div>

              <h4 className="text-base font-display font-semibold dark:text-white text-slate-900 leading-snug">
                {proj.title}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-1 mt-1 font-mono">
                Category: {proj.category} | Deadline: {proj.completion_date || "Unscheduled"}
              </p>

              {/* Progress update controls */}
              <div className="mt-5 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">Completion Status:</span>
                  <span className={`font-bold transition-all ${isUnlocked ? "text-cyan-400 text-sm scale-110" : "text-emerald-400"}`}>
                    {currentVal}% Completed
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    disabled={!isUnlocked}
                    value={currentVal}
                    onChange={(e) => handleSliderChange(proj.id, Number(e.target.value))}
                    className={`flex-1 h-2 rounded-lg cursor-pointer accent-cyan-400 ${
                      isUnlocked 
                        ? "bg-slate-700 dark:bg-slate-800" 
                        : "bg-slate-200 dark:bg-slate-950 opacity-45 cursor-not-allowed"
                    }`}
                  />
                  
                  {isUnlocked && (
                    <button
                      onClick={() => handleSaveTrigger(proj)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] uppercase font-bold flex items-center space-x-1 shadow-md shadow-emerald-500/10"
                      title="Update and Lock changes"
                    >
                      <CheckSquare size={12} />
                      <span>Commit</span>
                    </button>
                  )}
                </div>

                <div className="flex h-1.5 w-full bg-slate-800/50 dark:bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className="bg-cyan-500 h-full rounded-full transition-all duration-355" 
                    style={{ width: `${currentVal}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {projects.length === 0 && (
          <div className="col-span-2 text-center py-12 text-slate-450 text-xs font-mono">
            No active project deliverables tracked. Start a Work Project first!
          </div>
        )}
      </div>

      {/* Double confirmation drawer overlay modal */}
      {confirmingUpdate && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in" id="anti-accident-overlay">
          <div className={`w-full max-w-sm p-6 rounded-2xl border ${
            theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center space-x-2 text-amber-500 mb-3">
              <AlertTriangle size={18} />
              <h4 className="text-sm font-mono uppercase font-bold tracking-wider">Accidental Change Prevention</h4>
            </div>
            
            <h3 className="text-base font-display font-bold leading-snug mb-4">
              Confirm progress modification for &ldquo;{confirmingUpdate.title}&rdquo;?
            </h3>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-500/5 py-3 mb-6 font-mono text-center">
              <div>
                <p className="text-[10px] text-slate-450 uppercase">Current Progress</p>
                <p className="text-xl font-bold text-slate-400">{confirmingUpdate.original}%</p>
              </div>
              <div>
                <p className="text-[10px] text-cyan-400 uppercase">Proposed Progress</p>
                <p className="text-xl font-bold text-cyan-400">{confirmingUpdate.proposed}%</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 text-xs">
              <button
                onClick={() => setConfirmingUpdate(null)}
                className="px-4 py-2 rounded-xl border dark:border-slate-800 border-slate-205 hover:bg-slate-500/10 font-mono transition-colors"
              >
                Cancel Revert
              </button>
              <button
                onClick={commitUpdate}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-500/10"
              >
                <ShieldCheck size={14} />
                <span>Verify & Publish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
