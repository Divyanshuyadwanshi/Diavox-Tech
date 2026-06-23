import React, { useState } from "react";
import { useStore } from "../../store";
import { 
  Check, 
  X, 
  ShieldAlert, 
  BadgeInfo, 
  Zap, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  DollarSign, 
  FileText, 
  Clock, 
  UserPlus 
} from "lucide-react";
import { ActivePlan } from "../../types";

export default function AdminActivePlans() {
  const { 
    planApprovals, 
    activePlans, 
    allUsers, 
    updatePlanApprovalStatus, 
    addActivePlan, 
    updateActivePlan, 
    deleteActivePlan, 
    theme 
  } = useStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // Form states
  const [clientId, setClientId] = useState("");
  const [planName, setPlanName] = useState("Starter");
  const [status, setStatus] = useState("Active");
  const [billingCycle, setBillingCycle] = useState("Monthly");
  const [price, setPrice] = useState("$250.00");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [renewalDate, setRenewalDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split("T")[0];
  });
  const [duration, setDuration] = useState("1 Month");
  const [notes, setNotes] = useState("");
  const [featuresText, setFeaturesText] = useState(
    "Standard customer support queue priority access\nSub-second loading times custom cache configs\nBi-weekly system updates audits"
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter clients to select from for manual assignment
  const clientsOnly = allUsers.filter(u => u.role === "client" || !u.role || u.role === "developer");

  const handleApprove = async (id: string) => {
    try {
      await updatePlanApprovalStatus(id, "Approved");
      alert("Elevation request approved and activated successfully!");
    } catch (err: any) {
      alert("Error approving elevation: " + (err.message || err));
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await updatePlanApprovalStatus(id, "Rejected");
      alert("Elevation request has been rejected.");
    } catch (err: any) {
      alert("Error declining request: " + (err.message || err));
    }
  };

  const openAddForm = () => {
    setEditingPlanId(null);
    setClientId(clientsOnly[0]?.id || "");
    setPlanName("Starter");
    setStatus("Active");
    setBillingCycle("Monthly");
    setPrice("$250.00");
    setStartDate(new Date().toISOString().split("T")[0]);
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    setRenewalDate(d.toISOString().split("T")[0]);
    setDuration("1 Month");
    setNotes("");
    setFeaturesText(
      "Standard support priority queue\nEdge routing CDN cache config\nCore metrics reporting"
    );
    setIsFormOpen(true);
  };

  const openEditForm = (plan: ActivePlan) => {
    setEditingPlanId(plan.id);
    setClientId(plan.client_id);
    setPlanName(plan.plan_name);
    setStatus(plan.status);
    setBillingCycle(plan.billing_cycle);
    setPrice(plan.price);
    setStartDate(plan.start_date);
    setRenewalDate(plan.renewal_date || "");
    setDuration(plan.duration || "1 Month");
    setNotes(plan.notes || "");
    setFeaturesText((plan.features || []).join("\n"));
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to completely remove this active client subscription?")) {
      await deleteActivePlan(id);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      alert("Please select a valid client.");
      return;
    }

    setIsSubmitting(true);
    const features = featuresText
      .split("\n")
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const payload = {
      client_id: clientId,
      plan_name: planName,
      status,
      billing_cycle: billingCycle,
      price,
      start_date: startDate,
      renewal_date: renewalDate,
      features,
      duration,
      notes
    };

    try {
      if (editingPlanId) {
        await updateActivePlan(editingPlanId, payload);
      } else {
        await addActivePlan(payload);
      }
      setIsFormOpen(false);
    } catch (err: any) {
      alert("Error saving subscription details: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingApprovals = planApprovals.filter(pa => pa.status === "Pending Approval");
  const processedApprovals = planApprovals.filter(pa => pa.status !== "Pending Approval");

  return (
    <div className="space-y-8 text-left animate-fade-in" id="admin-activeplans-panel">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b dark:border-slate-850 border-slate-100 pb-5 gap-4">
        <div>
          <h4 className="text-xs font-mono tracking-widest text-[#fbbf24] font-bold uppercase">CLIENT SUBSCRIPTION CONTROL</h4>
          <h3 className="text-2xl font-display font-light text-slate-900 dark:text-white mt-1">
            Active Plans & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-450 to-teal-400 font-semibold italic">Elevations</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Assign custom plans, modify renewals, edit features, and approve client elevation requests with instant Supabase indexing.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-mono text-xs font-bold shadow-lg shadow-cyan-500/10 hover:brightness-110 active:scale-95 transition-all text-center self-start"
        >
          <Plus size={14} />
          <span>Assign Client Plan</span>
        </button>
      </div>

      {/* Manual Assignment & Editing Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/90 backdrop-blur-md">
          <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-y-auto max-h-[90vh] ${
            theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="p-6 border-b dark:border-slate-800 border-slate-100 flex items-center justify-between">
              <h3 className="font-display font-semibold text-lg">
                {editingPlanId ? "Edit Client Subscription Details" : "Assign New Subscription Plan"}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono"
              >
                ESC X
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Client Selector */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1.5">
                    <UserPlus size={12} />
                    <span>Assign Client Account</span>
                  </label>
                  <select
                    disabled={!!editingPlanId}
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full rounded-xl p-2 px-3 text-xs dark:bg-slate-950 border dark:border-slate-800 border-slate-200 text-slate-300 focus:border-cyan-500"
                    required
                  >
                    <option value="">-- Choose Operative --</option>
                    {clientsOnly.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name || u.email} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Plan Tier Name Name */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Plan Service Tier
                  </label>
                  <select
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full rounded-xl p-2 px-3 text-xs dark:bg-slate-950 border dark:border-slate-800 border-slate-200 text-slate-300 focus:border-cyan-500"
                    required
                  >
                    <option value="Starter">Starter Plan</option>
                    <option value="Professional">Professional Plan</option>
                    <option value="Enterprise">Enterprise Premium</option>
                    <option value="Custom Dev Node">Custom Dev Node</option>
                  </select>
                </div>

                {/* Pricing amount */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1.5">
                    <DollarSign size={12} />
                    <span>Price (Custom Terms ok)</span>
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl p-2 px-3 text-xs dark:bg-slate-950 border dark:border-slate-800 border-slate-200 text-slate-300 focus:border-cyan-500"
                    required
                    placeholder="e.g. $450.00"
                  />
                </div>

                {/* Billing cycle */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Billing Cycle Period
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                    className="w-full rounded-xl p-2 px-3 text-xs dark:bg-slate-950 border dark:border-slate-800 border-slate-200 text-slate-300 focus:border-cyan-500"
                    required
                  >
                    <option value="Monthly">Monthly Cycle</option>
                    <option value="Annually">Annually Cycle</option>
                    <option value="One-Time Fixed">One-Time Fixed</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1.5">
                    <Calendar size={12} />
                    <span>Start Cycle Date</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl p-2 px-3 text-xs dark:bg-slate-950 border dark:border-slate-800 border-slate-200 text-slate-300 focus:border-cyan-500"
                    required
                  />
                </div>

                {/* Renewal Date */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1.5">
                    <Calendar size={12} />
                    <span>Cycle Renewal Date</span>
                  </label>
                  <input
                    type="date"
                    value={renewalDate}
                    onChange={(e) => setRenewalDate(e.target.value)}
                    className="w-full rounded-xl p-2 px-3 text-xs dark:bg-slate-950 border dark:border-slate-800 border-slate-200 text-slate-300 focus:border-cyan-500"
                    required
                  />
                </div>

                {/* Cycle Duration */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1.5">
                    <Clock size={12} />
                    <span>Duration Description</span>
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full rounded-xl p-2 px-3 text-xs dark:bg-slate-950 border dark:border-slate-800 border-slate-200 text-slate-300 focus:border-cyan-500"
                    placeholder="e.g. 1 Month, 12 Months, Permanent"
                    required
                  />
                </div>

                {/* Status Dropup */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Subscription Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl p-2 px-3 text-xs dark:bg-slate-950 border dark:border-slate-800 border-slate-200 text-slate-300 focus:border-cyan-500"
                    required
                  >
                    <option value="Active">Operational / Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Expired">Dormant / Expired</option>
                    <option value="Cancelled">Terminated / Cancelled</option>
                  </select>
                </div>

              </div>

              {/* Administrative Notes */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1.5">
                  <FileText size={12} />
                  <span>Administrative Notes</span>
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl p-2 px-3 text-xs dark:bg-slate-950 border dark:border-slate-800 border-slate-200 text-slate-300 focus:border-cyan-500 font-sans"
                  placeholder="Specify details, client demands, contract codes, support exclusions, etc."
                />
              </div>

              {/* Tier features list */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Specific Tier Inclusions & Features (one per line)
                </label>
                <textarea
                  rows={3}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  className="w-full rounded-xl p-2 px-3 text-xs dark:bg-slate-950 border dark:border-slate-800 border-slate-200 text-slate-300 focus:border-cyan-500 font-mono text-[11px]"
                  placeholder="Feature index 1&#10;Feature index 2"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t dark:border-slate-805">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 px-4 rounded-xl border dark:border-slate-800 border-slate-200 hover:bg-white/5 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="p-2 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-mono text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg"
                >
                  {isSubmitting ? "Syncing..." : "Publish Subscription State"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pending Client Elevations Requests */}
      {pendingApprovals.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs font-mono font-bold text-[#fbbf24] uppercase flex items-center space-x-1.5">
            <ShieldAlert size={14} />
            <span>Pending Elevation Requests ({pendingApprovals.length})</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingApprovals.map((req) => (
              <div
                key={req.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                  theme === "dark" 
                    ? "bg-[#fbbf24]/5 border-[#fbbf24]/20 shadow-xl shadow-black/20" 
                    : "bg-[#fbbf24]/5 border-[#fbbf24]/25 shadow-sm"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-mono font-bold uppercase bg-[#fbbf24]/20 text-[#fbbf24] px-2.5 py-1 rounded-lg">
                      {req.billing_cycle} Cycle
                    </span>
                    <span className="text-sm font-mono font-extrabold text-[#fbbf24]">{req.price}</span>
                  </div>

                  <h3 className="text-base font-display font-bold text-slate-900 dark:text-white mt-3">
                    Elevation to {req.plan_name} requested
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    Client Operative: <strong className="text-slate-350 font-medium">{req.client_name}</strong>
                  </p>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t dark:border-slate-850 border-slate-100 text-xs">
                  <button
                    onClick={() => handleDecline(req.id)}
                    className="p-2 px-4 rounded-xl border dark:border-slate-800 border-slate-205 hover:bg-rose-500/10 hover:text-rose-400 font-mono text-xs inline-flex items-center space-x-1 transition-all cursor-pointer"
                  >
                    <X size={12} />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleApprove(req.id)}
                    className="p-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs inline-flex items-center space-x-1 transition-all shadow-md shadow-cyan-500/10 cursor-pointer"
                  >
                    <Check size={12} />
                    <span>Approve state change</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Client Subscriptions Grid */}
      <div className="space-y-4">
        <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase flex items-center space-x-1.5">
          <Zap size={14} />
          <span>Active Client Maintenance Subscriptions ({activePlans.length})</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activePlans.map((plan) => {
            const clientUser = allUsers.find(u => u.id === plan.client_id);
            const isCompleted = plan.status !== "Active";

            return (
              <div
                key={plan.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 hover:border-slate-800 transition-all ${
                  plan.status === "Active" 
                    ? (theme === "dark" ? "bg-slate-950 border-slate-900 shadow-md shadow-black/25" : "bg-white border-slate-200 shadow-sm")
                    : "opacity-60 bg-slate-950/20 border-slate-900/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-mono uppercase font-bold leading-none ${
                      plan.status === "Active" 
                        ? "bg-teal-500/10 text-teal-400 border border-teal-550/20" 
                        : plan.status === "On Hold"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-slate-500/10 text-slate-450"
                    }`}>
                      {plan.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{plan.billing_cycle || "Monthly"}</span>
                  </div>

                  <h3 className="text-base font-display font-semibold dark:text-white text-slate-900 leading-snug mt-3">
                    {plan.plan_name}
                  </h3>
                  
                  <div className="mt-3.5 space-y-1.5 text-[11px] font-mono text-slate-400 border-t border-dashed dark:border-slate-900 pt-3">
                    <p className="line-clamp-1"><span className="text-slate-550 font-medium">Recipient:</span> {clientUser ? `${clientUser.name || clientUser.email}` : plan.client_id}</p>
                    <p><span className="text-slate-550 font-medium">Remuneration:</span> {plan.price}</p>
                    <p><span className="text-slate-550 font-medium">Cycle span:</span> {plan.duration || "1 Month"}</p>
                    <p><span className="text-slate-550 font-medium">Setup:</span> {plan.start_date}</p>
                    <p><span className="text-slate-550 font-medium">Renewal:</span> {plan.renewal_date}</p>
                    {plan.notes && (
                      <p className="mt-2 text-[10px] italic leading-relaxed text-slate-500 bg-slate-950/40 p-2 rounded-lg border border-slate-900/60 font-sans">
                        Notes: {plan.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end items-center space-x-2 pt-3 border-t dark:border-slate-900 border-slate-100 flex-wrap gap-y-2">
                  {plan.status === "Active" && (
                    <button
                      onClick={async () => {
                        try {
                          await updateActivePlan(plan.id, { status: "On Hold" });
                          alert("Subscription has been put on hold.");
                        } catch (err: any) {
                          alert("Error putting plan on hold: " + err.message);
                        }
                      }}
                      className="p-1.5 px-3 rounded-xl border border-amber-500/10 hover:border-amber-500/30 text-amber-500 hover:bg-amber-500/15 text-[11px] font-mono transition-all"
                      title="Put on Hold"
                    >
                      Hold
                    </button>
                  )}
                  {(plan.status === "On Hold" || plan.status === "Expired" || plan.status === "Cancelled") && (
                    <button
                      onClick={async () => {
                        try {
                          await updateActivePlan(plan.id, { status: "Active" });
                          alert("Subscription reactivated successfully!");
                        } catch (err: any) {
                          alert("Error reactivating plan: " + err.message);
                        }
                      }}
                      className="p-1.5 px-3 rounded-xl border border-teal-500/10 hover:border-teal-500/30 text-teal-400 hover:bg-teal-500/15 text-[11px] font-mono transition-all"
                      title="Reactivate"
                    >
                      Reactivate
                    </button>
                  )}
                  <button
                    onClick={() => openEditForm(plan)}
                    className="p-2 rounded-xl border dark:border-slate-800 border-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-white transition-colors"
                    title="Edit configurations"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="p-2 rounded-xl border border-rose-500/10 hover:border-rose-500/30 text-rose-500 hover:bg-rose-500/15 transition-all"
                    title="Terminate Subscription"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}

          {activePlans.length === 0 && (
            <div className="col-span-3 text-center py-16 text-slate-505 text-xs font-mono border border-dashed dark:border-slate-850 rounded-2xl">
              No active maintenance tier cycles are running. Use Assign Client Plan to configure custom subscription state!
            </div>
          )}
        </div>
      </div>

      {/* Elevation Archives */}
      {processedApprovals.length > 0 && (
        <div className="space-y-4 pt-6 border-t dark:border-slate-850 border-slate-100">
          <h4 className="text-xs font-mono font-bold text-slate-500 uppercase flex items-center space-x-1.5">
            <BadgeInfo size={14} />
            <span>Subscription Request Archives</span>
          </h4>

          <div className="space-y-2.5">
            {processedApprovals.map((req) => (
              <div
                key={req.id}
                className="p-3 px-4 rounded-xl bg-slate-905/30 border border-slate-900/40 flex items-center justify-between font-mono text-[11px] text-slate-400 hover:bg-slate-950/40 transition-all text-left"
              >
                <div>
                  <span className="font-bold text-slate-300">{req.client_name}</span> Elevation to{" "}
                  <strong className="text-cyan-400 font-semibold">{req.plan_name}</strong> ({req.price})
                </div>
                <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-lg ${
                  req.status === "Approved" ? "text-emerald-450 bg-emerald-500/10" : "text-rose-450 bg-rose-500/10"
                }`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
