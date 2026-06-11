/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useStore } from "../store";
import { 
  Sun, Moon, LogIn, User, Laptop, Compass, Shield, Layers, 
  MessageSquare, LogOut, Code, Menu, X 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  onOpenAuth: () => void;
  onNavigate: (section: string) => void;
  activeSection: string;
}

export default function Header({ onOpenAuth, onNavigate, activeSection }: HeaderProps) {
  const { currentUser, logout, theme, toggleTheme } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "hero", label: "Home" },
    { id: "services", label: "Services" },
    { id: "portfolio", label: "Work" },
    { id: "pricing", label: "Pricing" },
    { id: "blog", label: "Insights" },
    { id: "reviews", label: "Reviews" },
    { id: "contact", label: "Get in Touch" },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      theme === "dark" 
        ? "bg-slate-950/80 border-b border-slate-900 text-white" 
        : "bg-white/80 border-b border-slate-100 text-slate-900"
    } backdrop-blur-md`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => onNavigate("hero")} 
          className="flex items-center space-x-2 cursor-pointer group"
          id="header-logo-container"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-purple-600 flex items-center justify-center text-white font-display font-bold shadow-lg shadow-cyan-500/10 group-hover:scale-105 transition-transform">
            D
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg tracking-tight leading-none text-slate-900 dark:text-white">
              Diavox <span className="text-cyan-500">Tech</span>
            </span>
            <span className="text-[9px] font-mono tracking-widest opacity-60 uppercase mt-0.5">
              GLOBAL REMOTE
            </span>
          </div>
        </div>

        {/* Global Navigation Links */}
        <nav className="hidden md:flex space-x-1 lg:space-x-2" id="header-desktop-nav">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? theme === "dark"
                      ? "text-cyan-400 bg-slate-900"
                      : "text-slate-950 bg-slate-100 font-semibold"
                    : theme === "dark"
                    ? "text-slate-400 hover:text-white hover:bg-slate-900/50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5" id="header-action-controls">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            id="theme-toggler-btn"
            className={`p-2 rounded-xl transition-colors ${
              theme === "dark" 
                ? "bg-slate-900 hover:bg-slate-800 text-yellow-400" 
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Profile Context / Controls */}
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (["primary_admin", "secondary_admin"].includes(currentUser.role)) {
                    onNavigate("admin-dash");
                  } else if (currentUser.role === "team_member") {
                    onNavigate("team-dash");
                  } else {
                    onNavigate("client-dash");
                  }
                }}
                id="header-shortcut-dash"
                className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border ${
                  theme === "dark"
                    ? "bg-cyan-950/20 text-cyan-400 border-cyan-800 hover:bg-cyan-950/40"
                    : "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100"
                } transition-all`}
              >
                {currentUser.role === "primary_admin" && <Shield size={12} />}
                {currentUser.role === "secondary_admin" && <Layers size={12} />}
                {currentUser.role === "team_member" && <Code size={12} />}
                {currentUser.role === "client" && <Compass size={12} />}
                <span className="capitalize">{currentUser.role.replace("_", " ")}</span>
              </button>

              <div className="relative group">
                <button
                  id="user-menu-btn"
                  className={`flex items-center space-x-2 p-1 rounded-xl border ${
                    theme === "dark" ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <img
                    src={currentUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                  <span className="hidden leading-tight lg:block text-xs font-medium pr-1 text-left max-w-[80px] truncate">
                    {currentUser.name}
                  </span>
                </button>
                
                {/* Micro Dropdown on Hover */}
                <div className={`absolute right-0 top-full mt-1.5 w-48 rounded-xl shadow-xl border scale-95 opacity-0 pointer-events-none group-hover:scale-100 group-hover:opacity-100 group-hover:pointer-events-auto transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-800 text-white shadow-black/40" 
                    : "bg-white border-slate-200 text-slate-800 shadow-slate-200/50"
                }`}>
                  <div className="p-3 border-b border-slate-800/10 dark:border-slate-700/30 text-xs">
                    <p className="font-bold truncate">{currentUser.name}</p>
                    <p className="opacity-60 text-[10px] truncate">{currentUser.email}</p>
                  </div>
                  <div className="p-1 text-xs">
                    <button
                      onClick={() => {
                        if (["primary_admin", "secondary_admin"].includes(currentUser.role)) {
                          onNavigate("admin-dash");
                        } else if (currentUser.role === "team_member") {
                          onNavigate("team-dash");
                        } else {
                          onNavigate("client-dash");
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors flex items-center space-x-2"
                    >
                      <Laptop size={14} />
                      <span>My Dashboard</span>
                    </button>
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center space-x-2"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              id="cta-auth-login-trigger"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-gradient-to-r from-cyan-500 hover:from-cyan-400 to-purple-600 hover:to-purple-500 text-white shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-98"
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}

          {/* Responsive Mobile Burger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-xl md:hidden transition-colors ${
              theme === "dark" 
                ? "bg-slate-900 hover:bg-slate-800 text-slate-200" 
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
            aria-label="Toggle Mobile Menu"
            id="mobile-menu-burger-btn"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={`md:hidden overflow-hidden border-t ${
              theme === "dark" 
                ? "bg-slate-950/95 border-slate-900 text-white" 
                : "bg-white/95 border-slate-100 text-slate-900"
            } backdrop-blur-md`}
            id="mobile-navigation-tray"
          >
            <div className="px-4 py-4 space-y-2 flex flex-col">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2.5 rounded-lg text-sm text-left font-medium transition-all ${
                      isActive
                        ? theme === "dark"
                          ? "text-cyan-400 bg-slate-900 font-bold"
                          : "text-slate-950 bg-slate-100 font-bold"
                        : theme === "dark"
                        ? "text-slate-400 hover:text-white hover:bg-slate-900/40"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              {/* Dynamic shortcut indicator on mobile menu */}
              {currentUser && (
                <div className="pt-2 border-t dark:border-slate-800 border-slate-100">
                  <button
                    onClick={() => {
                      if (["primary_admin", "secondary_admin"].includes(currentUser.role)) {
                        onNavigate("admin-dash");
                      } else if (currentUser.role === "team_member") {
                        onNavigate("team-dash");
                      } else {
                        onNavigate("client-dash");
                      }
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 flex items-center space-x-2"
                  >
                    <span className="capitalize">Go to {currentUser.role.replace("_", " ")} Dashboard</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
