/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useStore } from "../store";
import { X, LogIn, Mail, Lock, User, KeyRound, ShieldAlert, CheckCircle2, ChevronRight, Sparkles, Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

        // Public registration always creates client role. Admin and Staff accounts are only onboarded inside by admins
        const result = await signup(email, password, name, "client");
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
      <div className={`w-full max-w-md rounded-2xl overflow-hidden border shadow-2xl flex flex-col relative max-h-[92vh] ${
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

        {/* Unified Authentication Panel */}
        <div className="w-full p-6 sm:p-8 flex flex-col justify-center overflow-y-auto" id="auth-form-panel">
          <div className="w-full mx-auto space-y-6">
            <div className="text-left">
              <h3 className="text-xl font-display font-extrabold leading-none">
                {isForgotPassword ? "Password Recovery" : isLogin ? "Welcome to Diavox" : "Create Diavox Account"}
              </h3>
              <p className="text-xs opacity-60 mt-1.5 font-light">
                {isForgotPassword ? "Transmit custom reset tokens" : isLogin ? "Log in to track plans and submit requests" : "Register profile for secure service boards"}
              </p>
            </div>

            {/* Error notifications */}
            {errorMsg && (
              <div className="p-3 sm:p-4 rounded-xl bg-rose-950/25 text-rose-300 border border-rose-500/30 text-xs font-sans flex flex-col space-y-2 animate-in fade-in slide-in-from-top-1 shadow-md" id="auth-error-alert">
                <div className="flex items-start space-x-2">
                  <ShieldAlert size={14} className="shrink-0 mt-0.5 text-rose-400" />
                  <div className="space-y-1">
                    <p className="font-semibold text-rose-200">Supabase Auth: {errorMsg}</p>
                  </div>
                </div>
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
                  <div className="relative font-sans">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="auth-password-field"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full text-xs p-3 pl-10 pr-11 rounded-xl border focus:border-cyan-500 focus:outline-none ${
                        theme === "dark" 
                          ? "bg-slate-950 border-slate-800 text-white placeholder-slate-550" 
                          : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                      }`}
                      required
                    />
                    <Lock className="absolute left-3.5 top-3.5 text-slate-500" size={15} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-cyan-500 transition-colors"
                      aria-label={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
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
