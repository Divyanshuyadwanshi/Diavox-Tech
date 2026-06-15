import React from "react";
import { useStore } from "../../store";
import { Check, X, ShieldAlert, BadgeInfo, Zap } from "lucide-react";

export default function AdminActivePlans() {
  const { planApprovals, activePlans, updatePlanApprovalStatus, theme } = useStore();

  const handleApprove = (id: string) => {
    updatePlanApprovalStatus(id, "Approved");
  };

  const handleDecline = (id: string) => {
    updatePlanApprovalStatus(id, "Rejected");
  };

  const pendingApprovals = planApprovals.filter(pa => pa.status === "Pending Approval");
  const processedApprovals = planApprovals.filter(pa => pa.status !== "Pending Approval");

  return (
    <div className="space-y-6 text-left animate-fade-in" id="admin-activeplans-panel">
      <div className="border-b dark:border-slate-850 border-slate-100 pb-4">
        <h4 className="text-sm font-mono tracking-widest text-amber-500 font-bold uppercase">CLIENT ELEVATIONS</h4>
        <h3 className="text-lg font-display font-bold">Active Plans & Subscription Approvals</h3>
        <p className="text-xs text-slate-400 mt-1">
          Review, approve or reject self-checkout subscription plans initiated by clients. Approved plans trigger Razorpay AutoPay systems automatically.
        </p>
      </div>

      {pendingApprovals.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold text-amber-500 uppercase flex items-center space-x-1.5">
            <ShieldAlert size={14} />
            <span>Pending Subscription Requests ({pendingApprovals.length})</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingApprovals.map((req) => (
              <div
                key={req.id}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                  theme === "dark" 
                    ? "bg-amber-950/10 border-amber-505/20" 
                    : "bg-amber-50/20 border-amber-205 shadow-sm"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                      {req.billing_cycle} Recurring
                    </span>
                    <span className="text-xs font-mono text-slate-400">{req.price}</span>
                  </div>

                  <h3 className="text-sm font-display font-bold text-slate-900 dark:text-white mt-2.5">
                    {req.plan_name} Upgrade requested
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    Operative: <strong className="text-slate-300 font-medium">{req.client_name}</strong>
                  </p>
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t dark:border-slate-850 border-slate-100 text-xs">
                  <button
                    onClick={() => handleDecline(req.id)}
                    className="p-1.5 px-3 rounded-lg border dark:border-slate-800 border-slate-205 hover:bg-rose-500/10 hover:text-rose-450 font-mono flex items-center space-x-1 transition-all"
                  >
                    <X size={12} />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleApprove(req.id)}
                    className="p-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold flex items-center space-x-1 transition-all shadow-md shadow-cyan-500/10"
                  >
                    <Check size={12} />
                    <span>Approve Upgrade</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active plans in actual databases */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono font-bold text-cyan-405 uppercase flex items-center space-x-1.5">
          <Zap size={14} className="text-cyan-455" />
          <span>Active Client Maintenance Subscriptions ({activePlans.length})</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activePlans.map((plan) => (
            <div
              key={plan.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                plan.status === "Active" 
                  ? (theme === "dark" ? "bg-slate-900/40 border-slate-805" : "bg-white border-slate-100 shadow-sm")
                  : "opacity-60 bg-slate-950/20 border-slate-900/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase font-bold leading-none ${
                    plan.status === "Active" ? "bg-teal-500/10 text-teal-400" : "bg-slate-500/10 text-slate-500"
                  }`}>
                    {plan.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-450 font-bold uppercase">{plan.billing_cycle || "Monthly"}</span>
                </div>

                <h3 className="text-sm font-display font-semibold dark:text-white text-slate-900 leading-snug mt-2.5">
                  {plan.plan_name}
                </h3>
                <div className="mt-2 space-y-0.5 text-[11px] font-mono text-slate-450">
                  <p><span className="text-slate-550">Client ID:</span> {plan.client_id}</p>
                  <p><span className="text-slate-550">Billing Price:</span> {plan.price}</p>
                  <p><span className="text-slate-550">Start Date:</span> {plan.start_date}</p>
                </div>
              </div>

              <div className="text-[9px] font-mono text-slate-505 uppercase text-right pt-2 border-t border-slate-850">
                Razorpay Checkout Enabled
              </div>
            </div>
          ))}

          {activePlans.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-455 text-xs font-mono border border-dashed dark:border-slate-900 rounded-xl">
              No active maintenance tier cycles are running.
            </div>
          )}
        </div>
      </div>

      {processedApprovals.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-850">
          <h4 className="text-xs font-mono font-bold text-slate-505 uppercase flex items-center space-x-1.5">
            <BadgeInfo size={14} />
            <span>Subscription Request Archives</span>
          </h4>

          <div className="space-y-2">
            {processedApprovals.map((req) => (
              <div
                key={req.id}
                className="p-3 rounded-lg bg-slate-550/5 flex items-center justify-between font-mono text-[11px] text-slate-450 hover:bg-slate-550/10 transition-all text-left"
              >
                <div>
                  <span className="font-bold text-slate-300">{req.client_name}</span> Upgrade to{" "}
                  <strong className="text-cyan-405 font-semibold">{req.plan_name}</strong> ({req.price})
                </div>
                <span className={`text-[10px] uppercase font-bold ${
                  req.status === "Approved" ? "text-emerald-400" : "text-rose-500"
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
