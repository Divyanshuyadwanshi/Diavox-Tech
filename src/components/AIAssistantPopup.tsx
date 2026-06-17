import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, ArrowRight, Sparkles, MessageCircle } from "lucide-react";
import { useStore } from "../store";
import logoUrl from "../assets/images/diavox_tech_logo_1781679695870.jpg";

export default function AIAssistantPopup() {
  const { theme, currentUser, aiKnowledge, pricingOptions } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: string; sender: "user" | "ai"; text: string; time: string }>>([
    {
      id: "greet",
      sender: "ai",
      text: "Hello 👋 Welcome to Diavox Tech.\n\nHow can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [typingInput, setTypingInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(1);
  const [showEscalation, setShowEscalation] = useState(false);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typingInput.trim()) return;

    const userText = typingInput;
    setTypingInput("");

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { id: "u-" + Date.now(), sender: "user" as const, text: userText, time: timestamp };
    
    setMessages(prev => [...prev, userMsg]);

    // Check if query triggers Smart Escalation
    const lower = userText.toLowerCase();
    const triggerEscalation = 
      lower.includes("quote") || 
      lower.includes("quotation") || 
      lower.includes("price") || 
      lower.includes("cost") || 
      lower.includes("buy") || 
      lower.includes("purchase") || 
      lower.includes("hire") || 
      lower.includes("human") || 
      lower.includes("support") || 
      lower.includes("chat") || 
      lower.includes("developer") || 
      lower.includes("project") || 
      lower.includes("discuss") || 
      lower.includes("consultation") ||
      lower.includes("talk to team");

    setTimeout(() => {
      let aiResponseText = "";

      // Match Knowledge Base questions or keyword match
      const matched = aiKnowledge.find(k => 
        lower.includes(k.question.toLowerCase()) || 
        k.question.toLowerCase().includes(lower) ||
        lower.split(" ").some(word => word.length > 4 && k.question.toLowerCase().includes(word))
      );

      if (matched) {
        aiResponseText = matched.answer;
      } else if (lower.includes("services") || lower.includes("offer") || lower.includes("what you do")) {
        aiResponseText = "At Diavox Tech, we specialize in high-performance digital solutions: Custom Website Development (React/Vite/Next.js), Creative Design, Technical SEO audit optimization, AI & Automation pipelines, and custom maintenance services.";
      } else if (lower.includes("price") || lower.includes("pricing") || lower.includes("plan") || lower.includes("cost")) {
        aiResponseText = "We offer flexible retainer plans for every stage: our Starter package begins at ₹1,65,000/mo covering 1 developer, our Professional package at ₹3,20,000/mo with dedicated designers and managers, and our Enterprise package at ₹6,50,000/mo for full-scale custom systems.";
      } else if (lower.includes("seo")) {
        aiResponseText = "Our Technical SEO campaigns include complete competitor backlink analyses, core web vitals optimization, tracking up to unlimited strategic keywords, and monthly copywriting releases to index your operations on top search results.";
      } else if (lower.includes("automation") || lower.includes("ai")) {
        aiResponseText = "We build sub-second custom artificial intelligence pipelines integrating Google Gemini, OpenAI, custom workflows, system bots, automatic webhook syncing, and automated data loaders.";
      } else if (lower.includes("website") || lower.includes("development") || lower.includes("design")) {
        aiResponseText = "Diavox develops completely custom systems with React 18 and Vite, designed to resolve at sub-second latency with clean layouts, complete transitions, dark mode support, and interactive client workspaces.";
      } else {
        aiResponseText = "I have noted your request. To coordinate this project with full specifications, I highly recommend consulting directly with our lead developers on our Enterprise Chat!";
      }

      const aiMsg = {
        id: "ai-" + Date.now(),
        sender: "ai" as const,
        text: aiResponseText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages(prev => [...prev, aiMsg]);

      if (triggerEscalation) {
        setShowEscalation(true);
      }
    }, 600);
  };

  const handleEscalateRedirect = () => {
    setIsOpen(false);
    // Redirect to Enterprise Chat
    const btnHome = document.getElementById("btn-return-home");
    if (currentUser) {
      // Set Client Tab to chat
      const chatBtn = document.querySelector('[id*="chat"]');
      if (chatBtn) {
        (chatBtn as HTMLButtonElement).click();
      }
      window.location.hash = "#client-dash";
      // Try navigating via store page if there's any trigger
      const element = document.getElementById("btn-client-dashboard");
      if (element) {
        element.click();
      } else {
        // Find if someone can help us navigate
        // Just trigger hash routing or scroll to client-dash
        const rootNavigation = document.getElementById("nav-client-dashboard");
        if (rootNavigation) rootNavigation.click();
      }
    } else {
      // Open login modal
      const authTrigger = document.getElementById("btn-header-login") || document.getElementById("btn-trigger-presets");
      if (authTrigger) {
        authTrigger.click();
      } else {
        // Fallback alert
        alert("Please sign in or use preset logs to access our secure Enterprise Chat Helpdesk!");
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 text-left font-sans" id="diavox-ai-assistant-wrapper">
      {/* MINIMIZED BUTTON STATE */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          id="btn-ai-assistant-toggle"
          className={`relative p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center cursor-pointer ${
            theme === "dark"
              ? "bg-gradient-to-tr from-cyan-500 to-purple-600 text-white hover:brightness-110"
              : "bg-gradient-to-tr from-cyan-600 to-purple-600 text-white shadow-cyan-500/20"
          }`}
          title="Diavox AI Support Concierge"
        >
          <img 
            src={logoUrl} 
            alt="AI Assistant" 
            className="w-8 h-8 rounded-full object-cover border border-white/20 shadow-md"
            referrerPolicy="no-referrer"
          />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* POPUP OPENED STATE */}
      {isOpen && (
        <div 
          className={`w-[360px] sm:w-[380px] h-[550px] rounded-2xl border shadow-2xl flex flex-col justify-between overflow-hidden animate-fade-in ${
            theme === "dark"
              ? "bg-slate-950 border-slate-900 text-white shadow-black/80"
              : "bg-white border-slate-200 text-slate-900 shadow-slate-300/50"
          }`}
          id="ai-assistant-drawer"
        >
          {/* Header Banner */}
          <div className="p-4 bg-gradient-to-r from-cyan-600 to-purple-600 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <img 
                  src={logoUrl} 
                  alt="AI Assistant" 
                  className="w-6 h-6 rounded-full object-cover border border-white/10"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wider uppercase">Diavox Assistant</h4>
                <p className="text-[9px] text-cyan-200 font-mono mt-0.5 mt-0.5">Automated Support Co-pilot</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/85 hover:text-white transition-colors p-1"
              id="btn-close-ai-assistant"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat scrolling frame */}
          <div 
            className={`flex-1 p-4 overflow-y-auto space-y-4 text-xs ${
              theme === "dark" ? "bg-slate-950/20" : "bg-slate-50/50"
            }`}
            id="ai-assistant-history"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col max-w-[85%] ${
                  m.sender === "user" ? "ml-auto text-right items-end" : "mr-auto text-left items-start"
                }`}
              >
                <div className="flex items-center space-x-1 mb-1 opacity-50 text-[9px] font-mono">
                  {m.sender === "ai" && <Sparkles size={10} className="text-cyan-400" />}
                  <span>{m.sender === "user" ? "You" : "Diavox Agent"}</span>
                  <span>({m.time})</span>
                </div>
                <div 
                  className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    m.sender === "user"
                      ? "bg-cyan-600 text-white"
                      : theme === "dark" 
                        ? "bg-slate-905 border border-slate-900 text-slate-100" 
                        : "bg-white border border-slate-200 text-slate-900 shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            
            {showEscalation && (
              <div 
                className={`p-4 rounded-xl border space-y-3 mt-2 text-center animate-fade-in ${
                  theme === "dark"
                    ? "bg-slate-900/40 border-cyan-500/20 text-white"
                    : "bg-cyan-50/20 border-cyan-200/50 text-slate-800"
                }`}
                id="smart-escalation-card"
              >
                <MessageCircle size={22} className="mx-auto text-cyan-400 animate-bounce" />
                <div className="space-y-1">
                  <h5 className="font-bold text-xs">Request Quotation & Support?</h5>
                  <p className="text-[10px] opacity-75">Connect to a dedicated human product specialist for secure contracts or customized billing discussions.</p>
                </div>
                
                <button
                  type="button"
                  onClick={handleEscalateRedirect}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-[10px] font-mono font-bold hover:brightness-110 flex items-center justify-center space-x-1"
                >
                  <span>Chat With Our Team</span>
                  <ArrowRight size={10} />
                </button>
                <p className="text-[9px] opacity-50 font-mono">Our team typically responds within 24 hours.</p>
              </div>
            )}
            
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Actions Panel */}
          <div className="p-2 border-t border-slate-200/30 dark:border-slate-800 flex flex-wrap gap-1.5 justify-start bg-slate-900/5 dark:bg-slate-950/20">
            <button
              onClick={() => {
                setTypingInput("What retainer plans are available?");
              }}
              className="px-2.5 py-1 text-[9px] font-mono rounded bg-slate-900/10 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200/20"
            >
              Plans & Pricing
            </button>
            <button
              onClick={() => {
                setTypingInput("Explain your Web Development expertise.");
              }}
              className="px-2.5 py-1 text-[9px] font-mono rounded bg-slate-900/10 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200/20"
            >
              Web Dev
            </button>
            <button
              onClick={() => {
                setTypingInput("Tell me about SEO audit optimization.");
              }}
              className="px-2.5 py-1 text-[9px] font-mono rounded bg-slate-900/10 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200/20"
            >
              SEO Campaigns
            </button>
          </div>

          {/* Interaction composer form */}
          <form 
            onSubmit={handleSend} 
            className={`p-3 border-t flex gap-2 ${
              theme === "dark" ? "bg-slate-900 border-slate-950" : "bg-slate-100 border-slate-100"
            }`}
          >
            <input
              type="text"
              value={typingInput}
              onChange={(e) => setTypingInput(e.target.value)}
              placeholder="Ask about deliverables, design delivery, SEO SLA..."
              className={`flex-1 text-xs px-3 py-2 rounded-lg border focus:outline-none ${
                theme === "dark" 
                  ? "bg-slate-955 border-slate-800 text-white placeholder-slate-500" 
                  : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />
            <button
              type="submit"
              className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:brightness-110 flex items-center justify-center transition-all shadow"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
