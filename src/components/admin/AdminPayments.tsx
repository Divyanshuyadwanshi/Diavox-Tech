import React from "react";
import { useStore } from "../../store";
import { formatAmount } from "../../utils/currency";
import { DollarSign, ShieldCheck, CreditCard, Activity } from "lucide-react";

export default function AdminPayments() {
  const { payments, metrics, invoices, theme, cmsContent } = useStore();
  const defCurrency = cmsContent?.defaultCurrency || "USD";

  return (
    <div className="space-y-6 text-left" id="admin-payments-panel">
      <div className="border-b dark:border-slate-850 border-slate-100 pb-4">
        <h4 className="text-sm font-mono tracking-widest text-emerald-500 font-bold uppercase">TREASURY MONITOR</h4>
        <h3 className="text-lg font-display font-bold">Payments Ledger & Transactions</h3>
        <p className="text-xs text-slate-405 mt-1">
          Monitor incoming automated Razorpay Webhook payments, bank settlement codes, and aggregate revenue metrics.
        </p>
      </div>

      {/* Aggregate metrics box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="payments-metrics">
        <div className={`p-5 rounded-2xl border ${
          theme === "dark" ? "bg-slate-900/40 border-slate-805" : "bg-white border-slate-100 shadow-sm"
        }`}>
          <div className="flex items-center justify-between text-slate-455">
            <span className="text-xs font-mono uppercase">Gross Settlement</span>
            <DollarSign size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-display font-bold text-slate-900 dark:text-white mt-2">
            {formatAmount(metrics.revenue, defCurrency)}
          </p>
          <span className="text-[10px] font-mono text-emerald-400">● Live Razorpay API</span>
        </div>

        <div className={`p-5 rounded-2xl border ${
          theme === "dark" ? "bg-slate-900/40 border-slate-805" : "bg-white border-slate-100 shadow-sm"
        }`}>
          <div className="flex items-center justify-between text-slate-455">
            <span className="text-xs font-mono uppercase">Settled Invoices</span>
            <ShieldCheck size={16} className="text-cyan-500" />
          </div>
          <p className="text-2xl font-display font-bold text-slate-900 dark:text-white mt-2">
            {invoices.filter(i => i.status === "paid").length} Settlements
          </p>
          <span className="text-[10px] font-mono text-slate-500">Of {invoices.length} general claims</span>
        </div>

        <div className={`p-5 rounded-2xl border ${
          theme === "dark" ? "bg-slate-900/40 border-slate-805" : "bg-white border-slate-100 shadow-sm"
        }`}>
          <div className="flex items-center justify-between text-slate-455">
            <span className="text-xs font-mono uppercase">Total Transactions</span>
            <Activity size={16} className="text-indigo-400" />
          </div>
          <p className="text-2xl font-display font-bold text-slate-900 dark:text-white mt-2">
            {payments.length} Settlements
          </p>
          <span className="text-[10px] font-mono text-indigo-450">Razorpay Direct API synced</span>
        </div>
      </div>

      {/* Actual ledger list */}
      <div className={`p-6 rounded-2xl border text-left ${
        theme === "dark" ? "bg-slate-950/40 border-slate-900" : "bg-white border-slate-100 shadow"
      }`} id="payments-list">
        <h4 className="text-xs font-mono font-bold text-slate-450 uppercase mb-4 tracking-wider">
          Direct Razorpay Transaction History log
        </h4>

        <div className="block md:hidden space-y-4">
          {payments.map((pay) => (
            <div key={pay.id} className="p-4 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-slate-50 space-y-2">
              <div className="flex justify-between items-center border-b dark:border-slate-800 border-slate-200 pb-2">
                <span className="font-mono text-[10px] text-slate-450 truncate max-w-[120px]">{pay.id}</span>
                <span className="font-mono text-xs font-bold text-emerald-400">{formatAmount(pay.amount, defCurrency)}</span>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-slate-400">
                <p><span className="text-slate-500">Razorpay ID:</span> <span className="text-cyan-400 break-all">{pay.transaction_id}</span></p>
                <p><span className="text-slate-500">Invoice:</span> {pay.invoice_id || "Direct Upgrade"}</p>
                <p><span className="text-slate-500">Date:</span> {new Date(pay.date).toLocaleDateString()}</p>
                <p><span className="text-slate-500">Method:</span> {pay.method || "Razorpay API Check"}</p>
              </div>
            </div>
          ))}
          {payments.length === 0 && (
            <div className="text-center py-6 text-slate-500 font-mono text-xs">
              Direct telemetry database lists no webhook captures.
            </div>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-slate-850 text-slate-550 font-mono text-[10px] uppercase">
                <th className="pb-3 text-left">Internal Payment ID</th>
                <th className="pb-3 text-left">Razorpay Transaction ID</th>
                <th className="pb-3 text-left">Invoice Covered</th>
                <th className="pb-3 text-left">Date Sync</th>
                <th className="pb-3 text-left">UPI/Method</th>
                <th className="pb-3 text-right">Settled Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {payments.map((pay) => (
                <tr key={pay.id} className="text-slate-350 hover:bg-slate-500/5 transition-all">
                  <td className="py-3.5 font-mono text-[11px] text-slate-450">{pay.id}</td>
                  <td className="py-3.5 font-mono text-[11px] text-cyan-400">{pay.transaction_id}</td>
                  <td className="py-3.5 font-mono text-[11px]">{pay.invoice_id || "Direct Upgrade"}</td>
                  <td className="py-3.5">{new Date(pay.date).toLocaleDateString()}</td>
                  <td className="py-3.5 text-slate-400">{pay.method || "Razorpay API Check"}</td>
                  <td className="py-3.5 text-right font-mono font-bold text-emerald-400">{formatAmount(pay.amount, defCurrency)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {payments.length === 0 && (
            <div className="text-center py-12 text-slate-500 font-mono text-xs">
              Direct telemetry database lists no webhook captures.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
