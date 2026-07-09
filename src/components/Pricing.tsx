/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useStore } from "../store";
import { Check, ArrowUpRight, CheckCircle2, ShieldCheck, Globe, CreditCard, X, MessageSquare, MessageCircle } from "lucide-react";

interface PricingProps {
  onOpenAuth: () => void;
  onNavigate: (section: string) => void;
  preview?: boolean;
}

export default function Pricing({ onOpenAuth, onNavigate, preview }: PricingProps) {
  const { theme, currentUser, pricingOptions, purchasePlan, cmsContent } = useStore();
  const [isAnnual, setIsAnnual] = useState<boolean>(false);
  const [currency, setCurrency] = useState<"USD" | "INR" | "GBP">("INR"); 
  const [notification, setNotification] = useState<string | null>(null);

  // Synchronize initial currency tab with cmsContent default currency
  useEffect(() => {
    if (cmsContent?.defaultCurrency) {
      const def = cmsContent.defaultCurrency.toUpperCase();
      if (def === "USD" || def === "INR" || def === "GBP") {
        setCurrency(def as any);
      }
    }
  }, [cmsContent?.defaultCurrency]);

  const displayedPricing = preview ? pricingOptions.slice(0, 1) : pricingOptions;

  const activeCurrency: "USD" | "INR" | "GBP" = currency === "INR" ? "INR" : currency === "GBP" ? "GBP" : "USD";

  const getPriceValue = (tier: any) => {
    if (activeCurrency === "INR") return tier.priceINR;
    if (activeCurrency === "GBP") return tier.priceGBP;
    return tier.priceUSD;
  };

  const getDisplayPriceString = (tier: any, type: string) => {
    const rawVal = getPriceValue(tier);
    let value = parseFloat(rawVal.replace(/,/g, ""));
    if (isNaN(value)) return rawVal;

    // Apply 20% discount on monthly subscriptions if annual is chosen
    if (type === "monthly-subscription" && isAnnual) {
      value = value * 0.8;
    }

    const rounded = Math.round(value);
    if (activeCurrency === "INR") {
      return "₹" + rounded.toLocaleString("en-IN");
    } else if (activeCurrency === "GBP") {
      return "£" + rounded.toLocaleString("en-GB");
    } else {
      return "$" + rounded.toLocaleString("en-US");
    }
  };

  const [selectedPlan, setSelectedPlan] = useState<{
    optionTitle: string;
    tierName: string;
    price: string;
    type: string;
  } | null>(null);

  const handlePurchase = (optionTitle: string, tierName: string) => {
    if (!currentUser) {
      onOpenAuth();
    } else {
      const option = pricingOptions.find(o => o.title === optionTitle);
      const tier = option?.tiers.find(t => t.name === tierName);
      const displayPrice = tier ? getDisplayPriceString(tier, option?.type || "one-time") : "";
      setSelectedPlan({
        optionTitle,
        tierName,
        price: displayPrice,
        type: option?.type || "one-time"
      });
    }
  };

  const executeRazorpayPayment = () => {
    if (!selectedPlan) return;
    
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      const cleanPrice = selectedPlan.price.replace(/[^0-9]/g, "");
      const finalAmount = (parseInt(cleanPrice) || 500) * 100; // paise

      const options = {
        key: "rzp_test_T0OlV0a77lOpMA",
        amount: finalAmount,
        currency: activeCurrency === "INR" ? "INR" : "USD",
        name: "Diavox Tech",
        description: `Secure Settlement: ${selectedPlan.optionTitle} - ${selectedPlan.tierName}`,
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&h=80",
        handler: function (response: any) {
          purchasePlan(`${selectedPlan.optionTitle} (${selectedPlan.tierName})` as any, isAnnual);
          
          const state = useStore.getState();
          const invoiceId = "inv-" + Math.random().toString(36).substring(4);
          
          state.addPayment({
            payment_id: response.razorpay_payment_id || "pay_" + Math.random().toString(36).substring(4),
            transaction_id: "txn_" + Math.random().toString(36).substring(4),
            amount: selectedPlan.price,
            method: "Razorpay Checkout (UPI)",
            date: new Date().toISOString().split("T")[0],
            invoice_id: invoiceId,
            client_id: currentUser.id
          });

          state.addActivityLog(
            currentUser.id,
            `Processed payment for ${selectedPlan.optionTitle} (${selectedPlan.tierName}) with payment code ID ${response.razorpay_payment_id}`
          );

          setNotification(`Invoice Settlement Success! Registered ${selectedPlan.optionTitle} - ${selectedPlan.tierName} using Razorpay Autopay! Code: ${response.razorpay_payment_id || "Sucess"}`);
          setSelectedPlan(null);

          setTimeout(() => {
            setNotification(null);
            onNavigate("client-dash");
          }, 3500);
        },
        prefill: {
          name: currentUser.name,
          email: currentUser.email,
        },
        theme: {
          color: "#06b6d4"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    };
    
    document.body.appendChild(script);
  };

  return (
    <section id="pricing" className={`py-20 md:py-28 text-left transition-colors duration-300 ${
      theme === "dark" 
        ? "bg-slate-950 text-white" 
        : "bg-white text-slate-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title and Controls Panel */}
        <div className="max-w-4xl mx-auto text-center mb-16 space-y-6" id="pricing-header-root">
          <p className="text-xs font-mono uppercase tracking-widest text-cyan-500 font-bold">
            {cmsContent?.sectionTitles?.pricing || "MUTUAL SUCCESS ROADMAPS"}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5.5xl font-display font-light tracking-tight leading-tight">
            {cmsContent?.sectionSubtitles?.pricing ? (
              cmsContent.sectionSubtitles.pricing
            ) : (
              <>
                Plans Suited for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-amber-250 to-purple-400 font-normal italic">Every Scale</span>
              </>
            )}
          </h2>
          <p className="text-sm sm:text-base opacity-75 font-light max-w-2xl mx-auto">
            {cmsContent?.sectionDescriptions?.pricing || "Choose an on-demand service package. Toggle between global and Indian billing gateways below to view real-time converted rates instantly."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4" id="pricing-billing-gateways">
            
            {/* Currency switcher gateway */}
            <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 border-slate-200">
              <button
                onClick={() => setCurrency("INR")}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeCurrency === "INR"
                    ? "bg-gradient-to-tr from-cyan-500 to-sky-600 text-white shadow-md shadow-cyan-500/10"
                    : "opacity-60 hover:opacity-100 text-slate-700 dark:text-slate-350"
                }`}
                title="Settle billing in Indian Rupees"
              >
                🇮🇳 INR (₹)
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeCurrency === "USD"
                    ? "bg-gradient-to-tr from-cyan-500 to-sky-600 text-white shadow-md shadow-cyan-500/10"
                    : "opacity-60 hover:opacity-100 text-slate-700 dark:text-slate-350"
                }`}
                title="Settle billing in US Dollars"
              >
                🇺🇸 USD ($)
              </button>
              <button
                onClick={() => setCurrency("GBP")}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeCurrency === "GBP"
                    ? "bg-gradient-to-tr from-cyan-500 to-sky-600 text-white shadow-md shadow-cyan-500/10"
                    : "opacity-60 hover:opacity-100 text-slate-700 dark:text-slate-350"
                }`}
                title="Settle billing in British Pounds"
              >
                🇬🇧 GBP (£)
              </button>
            </div>

            {/* Monthly / Annual Toggle for dynamic discount caching */}
            <div className="flex items-center space-x-3" id="pricing-freq-toggle">
              <span className={`text-xs font-mono select-none ${!isAnnual ? "font-bold text-cyan-400" : "opacity-60"}`}>Monthly Rate</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-11 h-6 rounded-full p-0.5 bg-slate-200 dark:bg-slate-800 transition-colors border dark:border-slate-700 relative flex items-center"
                aria-label="Toggle annual frequency"
              >
                <div className={`w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-500 to-sky-600 transition-transform ${isAnnual ? "translate-x-5" : "translate-x-0"}`} />
              </button>
              <span className={`text-xs font-mono select-none inline-flex items-center space-x-1.5 ${isAnnual ? "font-bold text-cyan-400" : "opacity-60"}`}>
                <span>Annual Shave</span>
                <span className="px-1.5 py-0.5 text-[8px] font-bold font-mono text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">SAVE 20%</span>
              </span>
            </div>

          </div>
        </div>

        {/* Dynamic Success Alert Floating Toast */}
        {notification && (
          <div className="mb-12 p-4 rounded-xl bg-cyan-950/40 text-cyan-405 border border-cyan-800/60 flex items-start space-x-3 max-w-xl mx-auto shadow-lg animate-pulse" id="pricing-notification-bar">
            <CheckCircle2 className="shrink-0 text-cyan-400 mt-1" size={18} />
            <div className="text-xs font-mono">
              <p className="font-bold uppercase tracking-wider">Registration Confirmed</p>
              <p className="opacity-80 mt-1 text-cyan-400">{notification}</p>
            </div>
          </div>
        )}

        {/* Loop Options */}
        <div className="space-y-24" id="pricing-options-stack">
          {displayedPricing.map((opt) => (
            <div key={opt.id} className="space-y-8" id={`pricing-option-group-${opt.id}`}>
              
              {/* Option title & badges */}
              <div className="border-b dark:border-slate-900 border-slate-200 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider uppercase ${
                    opt.type === "one-time"
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      : "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20"
                  }`}>
                    {opt.type === "one-time" ? "Capital Investment (One-Time)" : "Retainer Subscription (Monthly)"}
                  </span>
                  <h3 className="text-2xl font-display font-light tracking-tight">{opt.title}</h3>
                </div>
                <div className="text-[10px] opacity-50 font-mono flex items-center space-x-1">
                  <ShieldCheck size={11} className="text-cyan-500" />
                  <span>Encrypted PCI Billing Gateways Enabled</span>
                </div>
              </div>

              {/* Tiers grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                {opt.tiers.map((tier) => {
                  const displayPrice = getDisplayPriceString(tier, opt.type);
                  return (
                    <div
                      key={tier.id}
                      className={`rounded-2xl border p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                        tier.name === "Standard"
                          ? theme === "dark"
                            ? "bg-gradient-to-b from-slate-900/90 to-slate-950 border-cyan-500/40 shadow-xl shadow-cyan-500/5 scale-[1.01]"
                            : "bg-white border-cyan-500 shadow-lg shadow-cyan-550/5 scale-[1.01]"
                          : theme === "dark"
                          ? "bg-slate-900/20 border-slate-900 hover:border-slate-850"
                          : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
                      }`}
                      id={`pricing-tier-${tier.id}`}
                    >
                      {tier.name === "Standard" && (
                        <span className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full text-[8px] font-mono font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-sky-600 text-white">
                          RECOMMENDED
                        </span>
                      )}

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-lg font-display font-black leading-none">{tier.name}</h4>
                          <p className="text-xs opacity-65 min-h-[36px] mt-2 font-sans font-light leading-relaxed">{tier.tagline}</p>
                        </div>

                        <div className="flex items-baseline space-x-1.5 pt-1">
                          <span className="text-4xl font-display font-black tracking-tight">{displayPrice}</span>
                          <span className="text-[10px] opacity-60 font-mono uppercase">
                            {opt.type === "one-time" ? "Fixed price" : isAnnual ? "/ mo (billed annually)" : "/ mo"}
                          </span>
                        </div>

                        <button
                          onClick={() => handlePurchase(opt.title, tier.name)}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider transition-all flex items-center justify-center space-x-1.5 ${
                            tier.name === "Standard"
                              ? "bg-gradient-to-r from-cyan-500 to-purple-600 hover:brightness-110 text-white shadow-md shadow-cyan-500/10"
                              : theme === "dark"
                              ? "bg-slate-800 hover:bg-slate-700 text-slate-100"
                              : "bg-slate-900 hover:bg-slate-800 text-white"
                          }`}
                          id={`btn-order-tier-${tier.id}`}
                        >
                          <span>Settle with {tier.name}</span>
                          <ArrowUpRight size={13} />
                        </button>
                      </div>

                      {/* Features listed */}
                      <div className="mt-8 pt-5 border-t dark:border-slate-900 border-slate-200/80 space-y-3">
                        <p className="text-[9px] font-mono uppercase tracking-widest opacity-45 font-bold">Scope bounds:</p>
                        <ul className="space-y-2 text-xs">
                          {tier.features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start space-x-2">
                              <Check size={13} className="text-cyan-500 mt-0.5 shrink-0" />
                              <span className="opacity-80 leading-relaxed font-sans font-light">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>

        {preview && (
          <div className="mt-12 text-center" id="pricing-see-more-block">
            <button
              onClick={() => onNavigate("pricing-page")}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl border dark:border-slate-800 dark:hover:bg-slate-900 border-slate-200 bg-white hover:bg-slate-50 text-slate-900 dark:text-cyan-400 font-mono text-xs font-bold shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <span>Compare All Pricing Plans & Maintenance Retainers ({pricingOptions.length})</span>
              <span>→</span>
            </button>
          </div>
        )}

        {/* Premium bottom seal */}
        <div className="mt-20 p-6 rounded-2xl border dark:border-slate-900 border-slate-200 bg-slate-500/5 flex flex-col md:flex-row items-center justify-between gap-6" id="pricing-seal-footer">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Globe size={24} />
            </div>
            <div className="text-left">
              <h4 className="font-display font-bold text-sm">Need a completely personalized corporate retainer?</h4>
              <p className="text-xs opacity-60 mt-0.5">Connect with our primary managers to provision bespoke development hours.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate("contact")}
            className="px-6 py-2.5 rounded-xl bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 font-mono font-bold text-xs transition-colors"
          >
            Settle Custom SLA
          </button>
        </div>

        {/* Bespoke option choice dialog modal */}
        {selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in" id="pricing-choice-modal">
            <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border transition-all duration-300 ${
              theme === "dark" 
                ? "bg-slate-900 border-slate-800 text-white" 
                : "bg-white border-slate-200 text-slate-900"
            }`}>
              
              <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-100 pb-4 mb-4">
                <div className="flex items-center space-x-2">
                  <CreditCard className="text-cyan-500" size={18} />
                  <span className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-500">Checkout Options</span>
                </div>
                <button 
                  onClick={() => setSelectedPlan(null)}
                  className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-slate-500/10 transition-colors"
                  aria-label="Close dialog"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <h4 className="text-lg font-display font-bold">Configure {selectedPlan.optionTitle}</h4>
                <p className="text-xs opacity-75 font-sans leading-relaxed">
                  Choose how you would like to settle the <span className="font-bold text-cyan-400">{selectedPlan.tierName} Tier</span>. 
                  You can coordinate terms directly with our core engineering specialists or settle the invoice immediately in full.
                </p>

                <div className="p-3.5 rounded-xl dark:bg-slate-950/40 bg-slate-50 border dark:border-slate-800 border-slate-200/60 font-mono text-xs flex justify-between items-center">
                  <span className="opacity-60 text-[10px] uppercase">Plan Cost:</span>
                  <span className="text-base font-black text-cyan-400 font-display">{selectedPlan.price}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setSelectedPlan(null);
                    onNavigate("client-dash");
                  }}
                  className="p-3 rounded-xl border dark:border-slate-800 dark:hover:bg-slate-800 border-slate-200 hover:bg-slate-50 font-mono text-xs font-bold transition-all flex items-center justify-center space-x-2 text-left"
                >
                  <MessageSquare size={13} className="text-cyan-500" />
                  <span>Talk With Team</span>
                </button>

                <a
                  href={`https://wa.me/${cmsContent?.contactSettings?.whatsapp?.replace(/[^0-9]/g, "") || "911234567890"}?text=${encodeURIComponent(`Hello Diavox Team, I would like to purchase the ${selectedPlan?.optionTitle} (${selectedPlan?.tierName} Tier) for ${selectedPlan?.price}. Let's discuss details!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.02] text-white font-mono text-xs font-bold transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center space-x-2 cursor-pointer text-center"
                >
                  <MessageCircle size={13} />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
