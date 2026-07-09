/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
// To bypass peer-dependency problems with hook-form resolvers, we can do manual Zod schema parsing inside onSubmit, or handle standard React Hook Form validation.
// Manual Zod schema parsing is extremely reliable and robust, let's write it to ensure perfect react-hook-form usage without needing other packages.
import { useStore } from "../store";
import { 
  Phone, Mail, MessageCircle, Send, CheckCircle2, 
  HelpCircle, Sparkles, Building, ChevronRight, AlertTriangle 
} from "lucide-react";
import { z } from "zod";

// Zod Schema declaration
const inquirySchema = z.object({
  service_type: z.string().min(1, "Please select an appropriate service niche."),
  description: z.string().min(10, "Please describe your scope in at least 10 characters so we can quote accurately."),
  budget: z.string().min(1, "Please specify a budget range.")
});

interface ContactProps {
  onOpenAuth: () => void;
  onNavigate: (section: string) => void;
}

export default function Contact({ onOpenAuth, onNavigate }: ContactProps) {
  const { theme, currentUser, submitRequest, cmsContent } = useStore();
  const contact = cmsContent?.contactSettings || {
    whatsapp: "911234567890",
    email: "hello@diavox.com",
    phone: "+1 (800) 555-3210",
    supportEmail: "support@diavox.com",
    businessHours: "Mon - Fri: 9:00 AM - 6:00 PM (GMT-5)"
  };
  const [successMsg, setSuccessMsg] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  
  // React Hook Form
  const { register, handleSubmit, formState: { errors }, setError, reset } = useForm({
    defaultValues: {
      service_type: "Website Development",
      description: "",
      budget: "$4,500 - $8,000"
    }
  });

  const onSubmit = async (data: any) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    try {
      setErrorMsg("");
      // Validate schema manually to fully leverage Zod's robust parsing
      inquirySchema.parse(data);

      await submitRequest({
        client_id: currentUser.id,
        client_name: currentUser.name,
        client_email: currentUser.email,
        service_type: data.service_type,
        description: data.description,
        budget: data.budget
      });

      setSuccessMsg(true);
      reset();
      setTimeout(() => {
        setSuccessMsg(false);
        // Navigate client to dashboard to let them monitor their submitted request status live!
        onNavigate("client-dash");
      }, 3500);
    } catch (err: any) {
      console.error("Validation or submission error:", err);
      if (err instanceof z.ZodError) {
        // Map zod validation errors to React Hook Form errors so they show up beautifully under each field
        err.issues.forEach((issue) => {
          const path = issue.path[0] as "service_type" | "description" | "budget";
          if (path) {
            setError(path, {
              type: "manual",
              message: issue.message
            });
          }
        });
        setErrorMsg(err.issues[0]?.message || "Please correct the form errors first.");
      } else {
        setErrorMsg(err.message || "Failed to submit quote request. Please try again.");
      }
    }
  };

  return (
    <section id="contact" className={`py-20 md:py-28 text-left ${
      theme === "dark" 
        ? "bg-slate-900/40 text-white" 
        : "bg-slate-50 text-slate-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title row */}
        <div className="max-w-3xl mb-16 space-y-4" id="contact-header">
          <p className="text-xs font-mono uppercase tracking-widest text-cyan-500 font-bold">
            {cmsContent?.sectionTitles?.contact || "DIAVOX COMMUNICATIONS HUB"}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5.5xl font-display font-light tracking-tight leading-tight">
            {cmsContent?.sectionSubtitles?.contact ? (
              cmsContent.sectionSubtitles.contact
            ) : (
              <>
                Schedule a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-amber-250 to-purple-400 font-normal italic">Free Consultation</span>
              </>
            )}
          </h2>
          <p className="text-sm sm:text-base opacity-75 font-light">
            {cmsContent?.sectionDescriptions?.contact || "We are fully remote, assisting businesses around the globe. Get in touch with us via WhatsApp, phone, email, or post your direct project checklist inquiries below."}
          </p>
        </div>

        {/* Outer content layout - Col-span 4 for details, Col-span 8 for quote form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12" id="contact-grid-wrapper">
          
          {/* Contact Methods (Phone, Email, WhatsApp) */}
          <div className="lg:col-span-5 space-y-6" id="contact-methods-panel">
            <h3 className="text-lg font-display font-bold">Direct Channels</h3>
            
            <div className="space-y-4" id="contact-methods-box">
              {/* WhatsApp Option */}
              <a
                href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}?text=Hello%20Diavox%2C%20I'd%20love%20to%20discuss%20a%20development%20project.`}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-5 rounded-xl border flex items-start space-x-4 hover:-translate-y-0.5 transition-all block ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-900 hover:border-emerald-500/30 text-white"
                    : "bg-white border-slate-200 hover:border-emerald-500 text-slate-950 shadow-sm"
                }`}
              >
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
                  <MessageCircle size={20} />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase block">Fastest response</span>
                  <h4 className="text-sm font-bold font-display mt-0.5">WhatsApp Chat</h4>
                  <p className="text-xs opacity-75 mt-1">Connect instantly with our project leaders. Available around the clock.</p>
                  <span className="text-xs font-mono text-emerald-400 font-semibold inline-flex items-center space-x-1 mt-2">
                    <span>Chat Now</span>
                    <ChevronRight size={12} />
                  </span>
                </div>
              </a>

              {/* Email Option */}
              <a
                href={`mailto:${contact.email}?subject=Project%20Inquiry`}
                className={`p-5 rounded-xl border flex items-start space-x-4 hover:-translate-y-0.5 transition-all block ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-900 hover:border-cyan-500/30 text-white"
                    : "bg-white border-slate-200 hover:border-cyan-500 text-slate-950 shadow-sm"
                }`}
              >
                <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-lg shrink-0">
                  <Mail size={20} />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-semibold uppercase block">General Inquiries</span>
                  <h4 className="text-sm font-bold font-display mt-0.5">{contact.email}</h4>
                  <p className="text-xs opacity-75 mt-1">Submit attachments, blueprints, or RFP documents directly for general review.</p>
                </div>
              </a>

              {/* Phone Option */}
              <a
                href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}
                className={`p-5 rounded-xl border flex items-start space-x-4 hover:-translate-y-0.5 transition-all block ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-900 hover:border-purple-500/30 text-white"
                    : "bg-white border-slate-200 hover:border-purple-500 text-slate-950 shadow-sm"
                }`}
              >
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg shrink-0">
                  <Phone size={20} />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-mono tracking-widest text-purple-400 font-semibold uppercase block">Corporate Hot line</span>
                  <h4 className="text-sm font-bold font-display mt-0.5">{contact.phone}</h4>
                  <p className="text-xs opacity-75 mt-1">Speak directly with sales officers. Calls answered within minutes.</p>
                </div>
              </a>

              {/* Chat With Us Option */}
              <div
                onClick={() => {
                  if (!currentUser) {
                    localStorage.setItem("redirect_after_login", "chat");
                    onOpenAuth();
                  } else {
                    localStorage.setItem("preselected_tab", "chat");
                    if (["primary_admin", "secondary_admin", "secret_admin", "third_admin"].includes(currentUser.role)) {
                      onNavigate("admin-dash");
                    } else if (currentUser.role === "team_member") {
                      onNavigate("team-dash");
                    } else {
                      onNavigate("client-dash");
                    }
                  }
                }}
                className={`p-5 rounded-xl border flex items-start space-x-4 hover:-translate-y-0.5 hover:scale-[1.01] transition-all cursor-pointer block ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-900 hover:border-cyan-500/30 text-white"
                    : "bg-white border-slate-200 hover:border-cyan-500 text-slate-950 shadow-sm"
                }`}
                id="btn-chat-with-us-card"
              >
                <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-lg shrink-0">
                  <MessageCircle size={20} />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase block">Omni-Channel Helpdesk</span>
                  <h4 className="text-sm font-bold font-display mt-0.5">Chat With Us</h4>
                  <p className="text-xs opacity-75 mt-1">Our technical leaders are available via WhatsApp, Email, Phone, and the secure Enterprise Chat room.</p>
                  <span className="text-xs font-mono text-cyan-400 font-semibold inline-flex items-center space-x-1 mt-2">
                    <span>Enter Enterprise Chat</span>
                    <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Quote Inquiry Form */}
          <div className="lg:col-span-7" id="contact-form-panel">
            <div className={`p-6 sm:p-8 rounded-2xl border ${
              theme === "dark" ? "bg-slate-950/80 border-slate-900" : "bg-white border-slate-200 shadow-xl shadow-slate-200/50"
            }`}>
              
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-display font-bold">Request a Service Quote</h3>
                <span className="text-[10px] font-mono opacity-50 uppercase">24HR REPLY SLA GUARANTEED</span>
              </div>

              {/* Success notification */}
              {successMsg && (
                <div className="mb-6 p-4 rounded-xl bg-cyan-950/40 text-cyan-400 border border-cyan-800/60 flex items-start space-x-3 text-xs font-mono animate-pulse">
                  <CheckCircle2 className="shrink-0 text-cyan-400 mt-1" size={18} />
                  <div>
                    <p className="font-bold uppercase tracking-wider">Quote Submitted!</p>
                    <p className="opacity-80 mt-1">SLA ticket generated. Loading your private dashboard to monitor review progress...</p>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-rose-950/40 text-rose-400 border border-rose-800/60 flex items-start space-x-3 text-xs font-mono animate-fade-in">
                  <AlertTriangle className="shrink-0 text-rose-400 mt-1" size={18} />
                  <div>
                    <p className="font-bold uppercase tracking-wider">Submission Failed</p>
                    <p className="opacity-80 mt-1">{errorMsg}</p>
                  </div>
                </div>
              )}

              {/* Unauthenticated Security warnings */}
              {!currentUser && (
                <div className="mb-6 p-4 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-start space-x-3 text-xs" id="contact-unauth-warning">
                  <AlertTriangle className="shrink-0 mt-0.5 text-amber-500" size={18} />
                  <div>
                    <p className="font-bold font-mono uppercase tracking-wider">Authentication Required</p>
                    <p className="opacity-80 mt-1">You must sign in before you can request a service, send a demo ticket, or trigger quote schedules.</p>
                    <button
                      onClick={onOpenAuth}
                      type="button"
                      className="mt-2 text-xs font-bold underline text-amber-400 hover:text-amber-300"
                    >
                      Sign In Now
                    </button>
                  </div>
                </div>
              )}

              {/* Form elements */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div>
                    <label className="block text-xs font-mono uppercase opacity-60 mb-1.5" htmlFor="field-service">Service Target Niche</label>
                    <select
                      id="field-service"
                      {...register("service_type")}
                      className="w-full text-xs p-3 rounded-lg border bg-slate-50 border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none"
                    >
                      <option value="Website Development">Website Development</option>
                      <option value="Website Design">Website Design</option>
                      <option value="Technical SEO & Performance audits">Technical SEO & Performance audits</option>
                      <option value="AI Automation (Gemini Integration)">AI Automation (Gemini Integration)</option>
                      <option value="Industrial Business Templates pack">Industrial Business Templates pack</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase opacity-60 mb-1.5" htmlFor="field-budget">Estimated Budget Cover</label>
                    <select
                      id="field-budget"
                      {...register("budget")}
                      className="w-full text-xs p-3 rounded-lg border bg-slate-50 border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none"
                    >
                      <option value="$1,500 - $3,000">$1,500 - $3,000</option>
                      <option value="$3,000 - $6,000">$3,000 - $6,000</option>
                      <option value="$6,000 - $12,000">$6,000 - $12,000</option>
                      <option value="$12,000 - $25,000">$12,000 - $25,000</option>
                      <option value="Enterprise project over $25,000">Enterprise project over $25,000</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase opacity-60 mb-1.5" htmlFor="field-description">Detailed Needs & Blueprints</label>
                  <textarea
                    id="field-description"
                    {...register("description")}
                    placeholder="We require a responsive real estate layout, with maps, and standard PDF contract download states..."
                    rows={5}
                    className={`w-full text-xs p-3.5 rounded-xl border focus:outline-none transition-all ${
                      errors.description 
                        ? "border-rose-500/70 bg-rose-500/5 text-slate-900 dark:text-white focus:border-rose-500" 
                        : "bg-slate-50 border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-850 dark:text-white focus:border-cyan-500/40"
                    }`}
                  />
                  {errors.description && (
                    <span className="text-[10px] font-mono text-rose-500 mt-1 block">{errors.description.message}</span>
                  )}
                </div>

                {/* Submit operations */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    id="btn-submit-quote-request"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:brightness-110 text-white font-semibold text-xs font-mono tracking-wider shadow-lg shadow-cyan-500/15 flex items-center space-x-2"
                  >
                    <span>Submit Quote Request</span>
                    <Send size={13} />
                  </button>
                </div>
              </form>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
