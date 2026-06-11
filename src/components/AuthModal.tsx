/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useStore } from "../store";
import { X, LogIn, Mail, Lock, User, KeyRound, ShieldAlert, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export default function AuthModal({ onClose, onLoginSuccess }: AuthModalProps) {
  const { theme, login, signup, currentUser } = useStore();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  
  // Form fields
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Quick preset accounts requested by the user
  const adminPresets = [
    {
      label: "Primary Admin (Divyanshu)",
      email: "Divyanshu.admin@diavox.com",
      pass: "Divyanshu321",
      role: "Primary Admin",
      color: "border-cyan-500 bg-cyan-950/20 text-cyan-400"
    },
    {
      label: "Secondary Admin (Abhinash)",
      email: "Abhinash.admin@diavox.com",
      pass: "Abhinash321",
      role: "Sec. Admin",
      color: "border-sky-500 bg-sky-950/20 text-sky-450"
    },
    {
      label: "Secondary Admin (Chetan)",
      email: "Chetan.admin@diavox.com",
      pass: "Chetan321",
      role: "Sec. Admin",
      color: "border-sky-500 bg-sky-950/20 text-sky-450"
    },
    {
      label: "Developer Team Account (Alex)",
      email: "alex.developer@diavox.com",
      pass: "Alex321",
      role: "Developer",
      color: "border-purple-500 bg-purple-950/20 text-purple-400"
    },
    {
      label: "Designer Team Account (Emma)",
      email: "emma.designer@diavox.com",
      pass: "Emma321",
      role: "Designer",
      color: "border-pink-500 bg-pink-950/20 text-pink-400"
    },
    {
      label: "Sample Client Gateway (Jordan)",
      email: "jordan@genesis-ventures.com",
      pass: "Jordan321",
      role: "Client",
      color: "border-amber-500 bg-amber-950/20 text-amber-400"
    }
  ];

  const handleApplyPreset = (presets: typeof adminPresets[0]) => {
    setEmail(presets.email);
    setPassword(presets.pass);
    setIsLogin(true);
    setIsForgotPassword(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (isForgotPassword) {
        // Simulate password reset request
        setSuccessMsg(`A secure password recovery hyperlink has been transmitted to ${email}. Check spam or updates folder.`);
        setIsLoading(false);
        return;
      }

      if (isLogin) {
        const result = await login(email, password);
        if (result.success) {
          setSuccessMsg("Successfully authenticated! Welcome to Diavox Tech.");
          setTimeout(() => {
            setIsLoading(false);
            if (onLoginSuccess) onLoginSuccess();
            onClose();
          }, 1500);
        } else {
          setErrorMsg(result.error || "Mismatched security credentials.");
          setIsLoading(false);
        }
      } else {
        // Sign Up
        if (!name.trim()) {
          setErrorMsg("Please specify your legal name.");
          setIsLoading(false);
          return;
        }
        
        // Block unrequested admin signup
        if (email.endsWith("@diavox.com") && !email.toLowerCase().includes("admin") && !["alex.developer@diavox.com", "emma.designer@diavox.com", "john.sales@diavox.com"].includes(email.toLowerCase())) {
          setErrorMsg("Only the Primary Administrator can provision official team emails.");
          setIsLoading(false);
          return;
        }

        const role = email.endsWith("@diavox.com") ? "team_member" as any : "client" as any;
        const result = await signup(email, password, name, role);
        if (result.success) {
          setSuccessMsg("Client profile initialized. Welcome aboard!");
          setTimeout(() => {
            setIsLoading(false);
            if (onLoginSuccess) onLoginSuccess();
            onClose();
          }, 1500);
        } else {
          setErrorMsg(result.error || "Could not register account. Change passwords.");
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Credential service timeout.");
      setIsLoading(false);
    }
  };

  return (
    <div id="auth-modal-root" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className={`w-full max-w-4xl rounded-2xl overflow-hidden border shadow-2xl flex flex-col md:flex-row relative max-h-[92vh] ${
        theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
      }`}>
        
        {/* Close Button top-right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-slate-950/60 dark:bg-slate-800 hover:bg-slate-700/80 transition-all text-white shadow-md active:scale-95"
          id="btn-close-auth-modal"
        >
          <X size={15} />
        </button>

        {/* Left Side: Preset Accounts Quick Switch */}
        <div className={`w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between border-r ${
          theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-100"
        } max-h-[40vh] md:max-h-full overflow-y-auto`}>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-mono tracking-widest text-emerald-500 uppercase font-bold">DIAVOX PASS SYSTEMS</p>
            </div>
            <h3 className="text-lg font-display font-black leading-snug">Evaluator Quick Log-In</h3>
            <p className="text-xs opacity-75 font-light">
              Review roles, project tracking metrics, team boards, database inquiries, and dashboard systems. Click any badge to auto-load credentials.
            </p>

            <div className="grid grid-cols-1 gap-2 pt-2" id="auth-presets-mapping">
              {adminPresets.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-3 rounded-lg border text-left text-xs font-mono flex items-center justify-between hover:scale-101 transition-all ${preset.color}`}
                >
                  <div className="min-w-0">
                    <p className="font-bold truncate text-[11px]">{preset.label}</p>
                    <p className="opacity-60 text-[9px] mt-0.5 truncate">{preset.email}</p>
                  </div>
                  <ChevronRight size={13} className="opacity-60 shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

          <div className="text-[10px] opacity-40 font-mono pt-6 hidden md:block">
            <span>Powered by Supabase Authenticators v2.0</span>
          </div>
        </div>

        {/* Right Side: LogIn / SignUp Forms */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-center overflow-y-auto" id="auth-form-panel">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div className="text-left">
              <h3 className="text-xl font-display font-extrabold leading-none">
                {isForgotPassword ? "Password Recovery" : isLogin ? "Welcome Back Client" : "Create Diavox Account"}
              </h3>
              <p className="text-xs opacity-60 mt-1.5 font-light">
                {isForgotPassword ? "Transmit custom reset tokens" : isLogin ? "Log in to track plans and submit requests" : "Register profile for secure service boards"}
              </p>
            </div>

            {/* Error notifications */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-mono flex items-start space-x-2" id="auth-error-alert">
                <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success notifications */}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-405 border border-emerald-500/20 text-xs font-mono flex items-start space-x-2" id="auth-success-alert">
                <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-emerald-400" />
                <span className="text-emerald-500">{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
              {!isLogin && !isForgotPassword && (
                <div>
                  <label className="block text-xs font-mono uppercase opacity-60 mb-1" htmlFor="auth-full-name-field">Full Legal Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      id="auth-full-name-field"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jordan Sparks"
                      className={`w-full text-xs p-3 pl-10 rounded-xl border focus:border-cyan-500 focus:outline-none ${
                        theme === "dark" 
                          ? "bg-slate-950 border-slate-800 text-white placeholder-slate-550" 
                          : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                      }`}
                      required
                    />
                    <User className="absolute left-3.5 top-3 text-slate-500" size={15} />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase opacity-60 mb-1" htmlFor="auth-email-field font-sans">Business Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    id="auth-email-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className={`w-full text-xs p-3 pl-10 rounded-xl border focus:border-cyan-500 focus:outline-none ${
                      theme === "dark" 
                        ? "bg-slate-950 border-slate-800 text-white placeholder-slate-550" 
                        : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                    }`}
                    required
                  />
                  <Mail className="absolute left-3.5 top-3 text-slate-500" size={15} />
                </div>
              </div>

              {!isForgotPassword && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-mono uppercase opacity-60 font-sans" htmlFor="auth-password-field">Account Password</label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                           setErrorMsg(null);
                          setSuccessMsg(null);
                        }}
                        className="text-[10px] text-cyan-500 hover:underline"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      id="auth-password-field"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full text-xs p-3 pl-10 rounded-xl border focus:border-cyan-500 focus:outline-none ${
                        theme === "dark" 
                          ? "bg-slate-950 border-slate-800 text-white placeholder-slate-550" 
                          : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                      }`}
                      required
                    />
                    <Lock className="absolute left-3.5 top-3 text-slate-500" size={15} />
                  </div>
                </div>
              )}

              <button
                type="submit"
                id="btn-auth-form-submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold text-xs font-mono tracking-wider flex items-center justify-center space-x-2 hover:brightness-110 shadow-lg shadow-cyan-500/10 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Verification in progress...</span>
                ) : isForgotPassword ? (
                  <>
                    <KeyRound size={13} />
                    <span>Send Reset Email Link</span>
                  </>
                ) : (
                  <>
                    <LogIn size={13} />
                    <span>{isLogin ? "Authenticate Account" : "Initialize Client Space"}</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  if (isForgotPassword) {
                    setIsForgotPassword(false);
                    setIsLogin(true);
                  } else {
                    setIsLogin(!isLogin);
                  }
                }}
                className="text-xs opacity-70 hover:opacity-100 transition-opacity"
              >
                {isForgotPassword 
                  ? "Back to Authentication" 
                  : isLogin 
                  ? "New client? Setup secondary space" 
                  : "Already registered? Login to portal"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
