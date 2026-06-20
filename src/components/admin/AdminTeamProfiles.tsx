import React, { useState, useEffect } from "react";
import { useStore } from "../../store";
import { UserProfile, TeamDepartment, UserRole } from "../../types";
import { Plus, Edit2, Trash2, Shield, UserPlus, Check, X, KeyRound, Lock, Eye, EyeOff } from "lucide-react";

export default function AdminTeamProfiles() {
  const { allUsers, addTeamMember, updateTeamMember, deleteTeamMember, addActivityLog, currentUser, theme } = useStore();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Administrative Deactivation trackers
  const [subTab, setSubTab] = useState<"roster" | "deactivations">("roster");
  const [deactivationRequests, setDeactivationRequests] = useState<any[]>([]);
  const [isFetchingRequests, setIsFetchingRequests] = useState(false);

  const fetchDeactivationRequests = async () => {
    setIsFetchingRequests(true);
    try {
      const response = await fetch("/api/admin/deactivation-requests");
      const result = await response.json();
      if (response.ok && result.success) {
        setDeactivationRequests(result.requests || []);
      }
    } catch (err) {
      console.warn("Failed to fetch admin deactivation requests:", err);
    } finally {
      setIsFetchingRequests(false);
    }
  };

  const handleUpdateDeactivationStatus = async (requestId: string, targetStatus: string) => {
    try {
      const response = await fetch("/api/admin/deactivate-user-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status: targetStatus })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        fetchDeactivationRequests();
        const msg = `Request status updated to "${targetStatus}" successfully.`;
        setFormAlert(msg);
        setTimeout(() => setFormAlert(null), 3500);
      } else {
        setFormAlert(`Error: ${result.error || "Failed to update request status."}`);
        setTimeout(() => setFormAlert(null), 3500);
      }
    } catch (err: any) {
      console.warn("Failed to update status:", err);
      setFormAlert(`Error: ${err.message}`);
      setTimeout(() => setFormAlert(null), 3500);
    }
  };

  useEffect(() => {
    fetchDeactivationRequests();
  }, []);

  // Form states variables
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("team_member");
  const [department, setDepartment] = useState<TeamDepartment>("operations");
  const [username, setUsername] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [permissions, setPermissions] = useState<string[]>(["view_assigned_projects", "update_progress"]);
  const [description, setDescription] = useState("");
  const [portfolio, setPortfolio] = useState("");

  // Local alert indicators
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [formAlert, setFormAlert] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("team_member");
    setDepartment("operations");
    setUsername("");
    setTempPassword("");
    setAvatarUrl("");
    setPermissions(["view_assigned_projects", "update_progress"]);
    setDescription("");
    setPortfolio("");
    setIsAdding(false);
    setEditingId(null);
    setFormAlert(null);
  };

  const togglePermission = (perm: string) => {
    if (permissions.includes(perm)) {
      setPermissions(permissions.filter(p => p !== perm));
    } else {
      setPermissions([...permissions, perm]);
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check unique username restriction
    if (!editingId) {
      const usernameExists = allUsers.some(u => u.username?.toLowerCase() === username.trim().toLowerCase());
      if (usernameExists) {
        setFormAlert("Error: Username is already claimed by another operative.");
        return;
      }
    }

    if (editingId) {
      // Editing details (retaining original username)
      const originalUser = allUsers.find(u => u.id === editingId);
      const updates: any = {
        name,
        email,
        role,
        department,
        permissions,
        description,
        portfolio,
        avatar_url: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
      };
      if (tempPassword) {
        updates.password = tempPassword;
      }
      updateTeamMember(editingId, updates);
      addActivityLog(currentUser.id, `Updated staff profile of ${name}`, JSON.stringify(originalUser), JSON.stringify(updates));
      resetForm();
    } else {
      // Creating new staff account
      const securePass = tempPassword || "DiavoxPass2026!";
      const finalAvatar = avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

      try {
        await addTeamMember(
          name,
          "Specialist",
          department,
          email,
          username.trim().toLowerCase(),
          role,
          permissions,
          securePass,
          finalAvatar,
          description,
          portfolio
        );

        addActivityLog(
          currentUser.id,
          `Onboarded new team profile: ${name} (Username: @${username})`,
          "Account created",
          `Temporary Credential Secure Password assigned: ${securePass}`
        );
        resetForm();
      } catch (err: any) {
        setFormAlert("Creation Error: " + (err.message || "Failed to create user."));
      }
    }
  };

  const triggerEdit = (user: UserProfile) => {
    setEditingId(user.id);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setDepartment(user.department || "operations");
    setUsername(user.username || "");
    setAvatarUrl(user.avatar_url || "");
    setPermissions(user.permissions || []);
    setDescription(user.description || "");
    setPortfolio(user.portfolio || "");
    setIsAdding(true);
  };

  // Role calculation hierarchy values
  const roleValues: Record<UserRole, number> = {
    secret_admin: 5,
    primary_admin: 4,
    secondary_admin: 3,
    third_admin: 2,
    team_member: 1,
    developer: 1,
    client: 0
  };

  const getManageableRoles = (currentUserRole: UserRole) => {
    switch (currentUserRole) {
      case "secret_admin":
        return [
          { value: "primary_admin", label: "Primary Admin" },
          { value: "secondary_admin", label: "Secondary Admin" },
          { value: "third_admin", label: "Third Admin" },
          { value: "team_member", label: "Standard Team Specialist" }
        ];
      case "primary_admin":
        return [
          { value: "secondary_admin", label: "Secondary Admin" },
          { value: "third_admin", label: "Third Admin" },
          { value: "team_member", label: "Standard Team Specialist" }
        ];
      case "secondary_admin":
        return [
          { value: "third_admin", label: "Third Admin" },
          { value: "team_member", label: "Standard Team Specialist" }
        ];
      case "third_admin":
        return [
          { value: "team_member", label: "Standard Team Specialist" }
        ];
      default:
        return [];
    }
  };

  const getManageableUsers = (currentUserRole: UserRole, users: UserProfile[]) => {
    const isStaff = (r: string) => ["secret_admin", "primary_admin", "secondary_admin", "third_admin", "team_member", "developer"].includes(r);
    
    return users.filter(u => {
      // Show all staff to other staff for visibility
      if (isStaff(currentUserRole) && isStaff(u.role)) return true;
      
      const maxVal = roleValues[currentUserRole] || 0;
      const uVal = roleValues[u.role] || 0;
      // Only return team/staff accounts
      return uVal > 0 && uVal <= maxVal;
    });
  };

  const currentUserRole = currentUser?.role || "team_member";
  const teamList = getManageableUsers(currentUserRole, allUsers);

  const availablePermissions = [
    { key: "view_assigned_projects", label: "Read Work deliverables" },
    { key: "update_progress", label: "Unlock & adjust milestones progress" },
    { key: "upload_files", label: "Upload & sync client documents" },
    { key: "client_chat_access", label: "Access & reply Client Chats (RBAC)" },
    { key: "ai_training_access", label: "AI Agent databases training access" }
  ];

  return (
    <div className="space-y-6 text-left" id="admin-team-main">
      <div className="flex items-center justify-between" id="admin-team-header">
        <div>
          <h4 className="text-sm font-mono tracking-widest text-cyan-400 font-bold uppercase">PERSONNEL PROTOCOL</h4>
          <h3 className="text-lg font-display font-bold">Team Profiles & Onboarding</h3>
        </div>
        {!isAdding && subTab === "roster" && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold inline-flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-500/10"
            id="btn-onboard-staff"
          >
            <UserPlus size={14} />
            <span>Onboard Team Operative</span>
          </button>
        )}
      </div>

      {formAlert && (
        <div className="p-3.5 rounded-xl border border-cyan-500/25 bg-cyan-950/20 text-cyan-400 text-xs font-mono font-bold">
          <span>{formAlert}</span>
        </div>
      )}

      {/* Tab Selector pills for non-adding states */}
      {!isAdding && (
        <div className="flex space-x-2 border-b dark:border-slate-900 border-slate-100 pb-2">
          <button
            onClick={() => setSubTab("roster")}
            className={`px-4 py-2 font-mono text-xs font-bold rounded-lg border transition-all ${
              subTab === "roster"
                ? "bg-slate-950 border-cyan-500/25 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-white hover:bg-slate-500/5"
            }`}
          >
            Staff Roster ({teamList.length})
          </button>
          <button
            onClick={() => setSubTab("deactivations")}
            className={`px-4 py-2 font-mono text-xs font-bold rounded-lg border transition-all flex items-center space-x-1.5 ${
              subTab === "deactivations"
                ? "bg-slate-950 border-cyan-500/25 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-white hover:bg-slate-500/5"
            }`}
          >
            <span>Deactivation Protocol</span>
            {deactivationRequests.filter(r => r.status === "Pending Review").length > 0 && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full font-mono font-normal">
              {deactivationRequests.length}
            </span>
          </button>
        </div>
      )}

      {isAdding ? (
        <form onSubmit={handleOnboardSubmit} className={`p-6 rounded-2xl border text-left space-y-4 ${
          theme === "dark" ? "bg-slate-950 border-slate-900" : "bg-white border-slate-200 shadow-sm"
        }`} id="team-onboard-form">
          <div className="flex justify-between items-center pb-2 border-b dark:border-slate-900/50 border-slate-100">
            <h4 className="text-sm font-display font-bold text-cyan-400">
              {editingId ? `Update Operative Credentials: ${name}` : "Create Secure Operative Profile"}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 rounded-full hover:bg-slate-500/10 text-slate-400 hover:text-white transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {formAlert && (
            <div className="p-3 bg-rose-500/15 text-rose-450 border border-rose-500/20 text-xs rounded-xl font-mono">
              {formAlert}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Full Intellectual Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Abinash..."
                className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-800 focus:border-cyan-50 w-full text-white" 
                    : "bg-white border-slate-205 focus:border-cyan-500 text-slate-900"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Email Address ID</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="abinash@diavox.com"
                className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-800 focus:border-cyan-50 w-full text-white" 
                    : "bg-white border-slate-200 focus:border-cyan-500 text-slate-900"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Profile Image URL (Avatar)</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://api.dicebear.com/7.x/initials/svg?seed=Diavox"
                className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-800 focus:border-cyan-50 w-full text-white" 
                    : "bg-white border-slate-200 focus:border-cyan-500 text-slate-900"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                Operational Username {editingId && <span className="text-rose-400 font-normal tracking-tight">(Immutable field)</span>}
              </label>
              <input
                type="text"
                required
                disabled={!!editingId} // Immutability rule
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="abinash_tech"
                className={`w-full p-2.5 rounded-xl text-xs font-mono border focus:ring-1 outline-none transition-all ${
                  editingId ? "opacity-60 bg-slate-950/20 cursor-not-allowed border-none text-slate-500 font-bold" : (
                    theme === "dark" 
                      ? "bg-slate-900 border-slate-800 focus:border-cyan-50 text-white" 
                      : "bg-white border-slate-205 focus:border-cyan-500 text-slate-900"
                  )
                }`}
              />
            </div>

            <div className="space-y-1 relative">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                {editingId ? "Change Password (Leave blank to keep current)" : "Secure Setup Password"}
              </label>
              <div className="relative">
                <input
                  type={showPasswordText ? "text" : "password"}
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  placeholder={editingId ? "Enter brand new password..." : "Enforce high-strength password..."}
                  className={`w-full p-2.5 rounded-xl text-xs font-mono border focus:ring-1 outline-none transition-all pr-10 ${
                    theme === "dark" 
                      ? "bg-slate-900 border-slate-800 focus:border-cyan-50 text-white" 
                      : "bg-white border-slate-205 focus:border-cyan-500 text-slate-900"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordText(!showPasswordText)}
                  className="absolute right-3 top-2.5 text-slate-405 hover:text-white"
                >
                  {showPasswordText ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Role Hierarchy Profile</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-800 focus:border-cyan-50 w-full text-white" 
                    : "bg-white border-slate-200 focus:border-cyan-500 text-slate-900"
                }`}
              >
                {getManageableRoles(currentUserRole).map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Specialist Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as TeamDepartment)}
                className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-800 focus:border-cyan-50 w-full text-white" 
                    : "bg-white border-slate-200 focus:border-cyan-500 text-slate-900"
                }`}
              >
                <option value="engineering">Engineering & Architecture</option>
                <option value="design">Aesthetic Visual Design</option>
                <option value="operations">General Services Operations</option>
                <option value="sales">Corporate Growth & Sales</option>
              </select>
            </div>

            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Biographic Biography Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Diavox system certified development supervisor specializing in elite-scale full-stack delivery modules."
                  rows={2}
                  className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                    theme === "dark" 
                      ? "bg-slate-900 border-slate-800 focus:border-cyan-50 text-white" 
                      : "bg-white border-slate-200 focus:border-cyan-500 text-slate-900"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Portfolio Website Address Link</label>
                <input
                  type="url"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="https://portfolio.diavox.com/specialist"
                  className={`w-full p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                    theme === "dark" 
                      ? "bg-slate-900 border-slate-800 focus:border-cyan-50 text-white" 
                      : "bg-white border-slate-200 focus:border-cyan-500 text-slate-900"
                  }`}
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2 border-t border-slate-850 pt-3">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Configure System Clearance Permissions</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {availablePermissions.map(item => {
                  const hasPerm = permissions.includes(item.key);
                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => togglePermission(item.key)}
                      className={`p-2 rounded-xl border flex items-center justify-between text-left transition-all ${
                        hasPerm 
                          ? "bg-cyan-950/30 border-cyan-500/20 text-cyan-405 font-medium" 
                          : "bg-slate-900/40 border-slate-850 text-slate-450 hover:text-white"
                      }`}
                    >
                      <span className="font-sans text-[11px]">{item.label}</span>
                      {hasPerm ? <Check size={12} className="text-cyan-450 shrink-0 ml-1" /> : <X size={12} className="text-slate-600 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 pt-4 flex justify-end space-x-2 border-t border-slate-850">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl border dark:border-slate-800 border-slate-205 hover:bg-slate-500/10 font-mono text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-md shadow-cyan-500/10"
              >
                {editingId ? "Apply Modifications" : "Authorise Onboarding"}
              </button>
            </div>
          </div>
        </form>
      ) : subTab === "roster" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamList.map((user) => (
            <div
              key={user.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 ${
                theme === "dark" ? "bg-slate-900/40 border-slate-805" : "bg-white border-slate-100 shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center space-x-3">
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full border border-slate-800 object-cover bg-slate-900 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-display font-semibold text-slate-900 dark:text-white truncate">
                      {user.name}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-450 leading-none">
                      @{user.username || "unset_handle"}
                    </p>
                    <p className="text-[10px] font-mono font-bold text-cyan-405 uppercase tracking-wide mt-1">
                      {["primary_admin", "secondary_admin", "third_admin"].includes(user.role) ? "ADMIN" : "OPERATIVE"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 border-t border-slate-850 pt-3 text-[11px] font-mono text-slate-400 text-left">
                  <p className="truncate"><span className="text-slate-550">Email:</span> {user.email}</p>
                  <p className="capitalize"><span className="text-slate-550">Dept:</span> {user.department || "General Operations"}</p>
                  {user.description && (
                    <p className="text-[10px] text-slate-400 font-sans line-clamp-2 mt-1">
                      <span className="text-slate-500 font-mono text-[11px]">Bio: </span>
                      {user.description}
                    </p>
                  )}
                  {user.portfolio && (
                    <p className="text-[10px] text-cyan-400 font-mono truncate mt-0.5">
                      <span className="text-slate-500">Portfolio: </span>
                      <a href={user.portfolio} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        Link ↗
                      </a>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {user.permissions?.map(p => (
                    <span key={p} className="text-[8px] font-mono px-1 rounded bg-indigo-505/10 text-indigo-400">
                      {p.replace(/_/g, " ")}
                    </span>
                  ))}
                  {(!user.permissions || user.permissions.length === 0) && (
                    <span className="text-[8px] font-mono px-1 rounded bg-slate-500/10 text-slate-500">
                      No high keys assigned
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-850">
                <span className="text-[8px] font-mono text-slate-500 uppercase">UID: {user.id.substring(0, 8)}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => triggerEdit(user)}
                    className="p-1.5 rounded-lg text-yellow-500 hover:bg-yellow-500/10 bg-slate-500/5 transition-all"
                    title="Edit Profile"
                  >
                    <Edit2 size={11} />
                  </button>
                  <button
                    onClick={() => deleteTeamMember(user.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 bg-slate-500/5 transition-all"
                    title="Offboard operative"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {teamList.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-450 text-xs font-mono">
              No staff profiles found. Onboard specialists above.
            </div>
          )}
        </div>
      ) : (
        /* Render Deactivation Requests Queue UI */
        <div className="space-y-4" id="deactivation-requests-queue">
          <div className="p-5 rounded-2xl border dark:border-slate-900 border-[#a855f7]/15 dark:bg-slate-950/20 bg-slate-50 text-left space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Protocol Clearance Hub</h4>
            <p className="text-xs opacity-75 font-sans leading-relaxed text-slate-400 font-light">
              Review received client and team deactivation requests below. Under verification state signals active security checks of deliverables, credential handovers, and security audits. 
              Confirming deactivation will lock out the respective user's credentials immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {deactivationRequests.map((req) => (
              <div
                key={req.id}
                className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  theme === "dark" 
                    ? "bg-slate-950 border-slate-900 hover:border-[#a855f7]/30" 
                    : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <div className="space-y-2 text-left">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#a855f7] shrink-0 animate-pulse" />
                    <div>
                      <h4 className="text-sm font-display font-bold text-slate-900 dark:text-white leading-tight">{req.user_name}</h4>
                      <p className="text-[10px] font-mono text-slate-400">{req.user_email}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] font-mono text-slate-450">
                    <span>Submitted: {new Date(req.created_at).toLocaleDateString()} {new Date(req.created_at).toLocaleTimeString()}</span>
                    <span className="hidden md:inline text-slate-750">•</span>
                    <span>Request ID: {req.id.substring(0, 8)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
                  {/* Status Indicator Badges */}
                  <div>
                    {req.status === "Pending Review" && (
                      <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-mono font-bold uppercase animate-pulse">
                        Pending Review
                      </span>
                    )}
                    {req.status === "Under Verification" && (
                      <span className="px-2.5 py-1 rounded bg-[#a855f7]/10 border border-[#a855f7]/25 text-[#a855f7] text-[10px] font-mono font-bold uppercase">
                        Under Verification
                      </span>
                    )}
                    {req.status === "Deactivated" && (
                      <span className="px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[10px] font-mono font-bold uppercase">
                        Deactivated
                      </span>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center space-x-2">
                    {req.status === "Pending Review" && (
                      <button
                        onClick={() => handleUpdateDeactivationStatus(req.id, "Under Verification")}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] font-bold transition-all"
                      >
                        Verify Request
                      </button>
                    )}
                    {req.status === "Under Verification" && (
                      <button
                        onClick={() => handleUpdateDeactivationStatus(req.id, "Deactivated")}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-[10px] font-bold transition-all"
                      >
                        Deactivate & Suspend
                      </button>
                    )}
                    {req.status === "Deactivated" && (
                      <div className="text-[10px] font-mono text-rose-400 font-bold flex items-center space-x-1">
                        <Check size={12} className="text-rose-400" />
                        <span>Closed & Blocked</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {deactivationRequests.length === 0 && (
              <div className="text-center py-12 text-slate-450 border border-dashed dark:border-slate-900 border-slate-200 rounded-2xl text-xs font-mono">
                No active or closed deactivation requests found in general database registries.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
