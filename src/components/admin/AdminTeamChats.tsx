import React, { useState } from "react";
import { useStore } from "../../store";
import { TeamGroup, TeamMessage, PrivateMessage } from "../../types";
import { Send, Users, MessageSquare, Check, X, ShieldAlert, FileIcon, MessageCircle } from "lucide-react";

export default function AdminTeamChats() {
  const { 
    allUsers, currentUser, teamGroups, teamMessages, 
    privateMessages, sendTeamMessage, sendPrivateMessage, theme 
  } = useStore();

  const [activeChannelType, setActiveChannelType] = useState<"global" | "private" | "project">("global");
  const [selectedTargetId, setSelectedTargetId] = useState<string>("global");
  const [msgInput, setMsgInput] = useState("");

  const staffList = allUsers.filter(u => {
    if (u.id === currentUser.id) return false;
    const isStaff = ["secret_admin", "primary_admin", "secondary_admin", "third_admin", "team_member", "developer"].includes(u.role);
    if (!isStaff) return false;
    if (u.role === "secret_admin") {
      return currentUser?.role === "secret_admin" || currentUser?.role === "primary_admin";
    }
    return true;
  });

  // Subsections filters
  const activePrivateTarget = staffList.find(s => s.id === selectedTargetId);
  const activeProjectGroup = teamGroups.find(g => g.id === selectedTargetId);

  // Filter messages
  const filteredMessages = () => {
    if (activeChannelType === "global") {
      return teamMessages.filter(m => m.group_id === "global");
    } else if (activeChannelType === "project") {
      return teamMessages.filter(m => m.group_id === selectedTargetId);
    } else {
      // Private messages between currentUser and selectedTargetId
      return privateMessages.filter(m => 
        (m.sender_id === currentUser.id && m.recipient_id === selectedTargetId) ||
        (m.sender_id === selectedTargetId && m.recipient_id === currentUser.id)
      );
    }
  };

  const currentChannelName = () => {
    if (activeChannelType === "global") return "Global General Channel";
    if (activeChannelType === "project") return activeProjectGroup ? `#${activeProjectGroup.name}` : "Project Group";
    return activePrivateTarget ? `@${activePrivateTarget.name}` : "Direct Message";
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim()) return;

    if (activeChannelType === "global" || activeChannelType === "project") {
      sendTeamMessage(
        selectedTargetId,
        currentUser.id,
        currentUser.name,
        currentUser.role,
        msgInput.trim()
      );
    } else {
      sendPrivateMessage(
        currentUser.id,
        currentUser.name,
        selectedTargetId,
        msgInput.trim()
      );
    }

    setMsgInput("");
  };

  return (
    <div className="space-y-4 text-left font-sans" id="admin-teamchats-panel">
      <div className="border-b dark:border-slate-850 border-slate-100 pb-3">
        <h4 className="text-sm font-mono tracking-widest text-indigo-400 font-bold uppercase">SECURE CHANNELS</h4>
        <h3 className="text-lg font-display font-bold">Staff Backoffice Collaboration Workspace</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-[65vh]">
        {/* Left Side: Rooms and DM selection sidebar */}
        <div className="md:col-span-4 flex flex-col space-y-4 max-h-full overflow-y-auto pr-1">
          {/* Default Global Selection Button */}
          <div className="space-y-1.5 text-left">
            <h4 className="text-[10px] font-mono uppercase text-slate-505 font-bold">Workspace Rooms</h4>
            <button
              onClick={() => {
                setActiveChannelType("global");
                setSelectedTargetId("global");
              }}
              className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-mono font-bold transition-all text-left ${
                activeChannelType === "global" 
                  ? "bg-cyan-500 text-white" 
                  : "bg-slate-500/5 hover:bg-slate-500/10 text-slate-400"
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <Users size={14} />
                <span className="truncate">General HQ Channel</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-950/20 text-cyan-400">PUBLIC</span>
            </button>
          </div>

          {/* Project Groups Lists */}
          <div className="space-y-1.5 text-left">
            <h4 className="text-[10px] font-mono uppercase text-slate-505 font-bold">Project Deliverables Tasks Chats</h4>
            <div className="space-y-1">
              {teamGroups.map(group => {
                const isSelected = activeChannelType === "project" && selectedTargetId === group.id;
                return (
                  <button
                    key={group.id}
                    onClick={() => {
                      setActiveChannelType("project");
                      setSelectedTargetId(group.id);
                    }}
                    className={`w-full p-2.5 rounded-xl flex items-center space-x-2 text-xs font-mono transition-all text-left ${
                      isSelected 
                        ? "bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 font-bold" 
                        : "bg-slate-500/5 hover:bg-slate-500/10 text-slate-400"
                    }`}
                  >
                    <MessageSquare size={14} className="text-slate-500" />
                    <span className="truncate">#{group.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Individual Staff Contacts */}
          <div className="space-y-1.5 text-left flex-1 min-h-[150px]">
            <h4 className="text-[10px] font-mono uppercase text-slate-550 font-bold">Private DM Threads</h4>
            <div className="space-y-1">
              {staffList.map(member => {
                const isSelected = activeChannelType === "private" && selectedTargetId === member.id;
                return (
                  <button
                    key={member.id}
                    onClick={() => {
                      setActiveChannelType("private");
                      setSelectedTargetId(member.id);
                    }}
                    className={`w-full p-2.5 rounded-xl flex items-center space-x-2.5 text-xs transition-all text-left ${
                      isSelected 
                        ? "bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 font-bold" 
                        : "bg-slate-500/5 hover:bg-slate-550/10 text-slate-400"
                    }`}
                  >
                    <img 
                      src={member.avatar_url} 
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 rounded-full object-cover border border-slate-700 bg-slate-900 shrink-0"
                    />
                    <div className="truncate">
                      <p className="truncate text-slate-900 dark:text-white leading-tight font-medium">{member.name}</p>
                      <p className="text-[10px] font-mono text-slate-550 capitalize leading-none mt-0.5">{member.role.replace(/_/g, " ")}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Active scrolling panel */}
        <div className={`md:col-span-8 p-4 rounded-2xl border flex flex-col justify-between ${
          theme === "dark" ? "bg-slate-950/40 border-slate-900" : "bg-white border-slate-205 shadow-sm"
        }`} id="chat-scroller-main">
          <div>
            <div className="pb-3 border-b dark:border-slate-900 border-slate-100 flex items-center justify-between text-left">
              <div>
                <span className="text-[9px] font-mono uppercase text-indigo-405 font-bold">SECURE CHANNEL</span>
                <h3 className="text-sm font-display font-medium text-slate-900 dark:text-white mt-0.5">{currentChannelName()}</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase shrink-0 animate-pulse">● TLS Encryption</span>
            </div>

            {/* Conversation list */}
            <div className="space-y-3.5 max-h-[42vh] min-h-[42vh] overflow-y-auto p-2 mt-4 flex flex-col bg-slate-500/5 rounded-xl border dark:border-slate-900 border-slate-100">
              {filteredMessages().map((msg: any) => {
                const isMe = msg.sender_id === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl text-xs max-w-sm flex flex-col text-left ${
                      isMe 
                        ? "bg-cyan-950/20 border border-cyan-505/20 text-cyan-300 self-end ml-12" 
                        : "bg-slate-900/50 border border-slate-805 text-slate-300 self-start mr-12"
                    }`}
                  >
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 mb-1.5 gap-2">
                      <span className="font-bold">{msg.sender_name} ({msg.sender_role})</span>
                      <span>{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="font-sans leading-relaxed whitespace-pre-wrap">{msg.message_text}</p>
                  </div>
                );
              })}

              {filteredMessages().length === 0 && (
                <div className="text-center py-20 text-[10px] uppercase font-mono text-slate-455 flex flex-col items-center justify-center space-y-2">
                  <MessageCircle size={28} className="text-slate-600 mb-1" />
                  <span>Channel holds no records. Post a greeting!</span>
                </div>
              )}
            </div>
          </div>

          {/* Form input */}
          <form onSubmit={handleSend} className="mt-4 pt-3 border-t border-slate-850 flex items-center space-x-2">
            <input
              type="text"
              required
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              placeholder={`Send message to ${currentChannelName()}...`}
              className={`flex-1 p-2.5 rounded-xl text-xs font-sans border focus:ring-1 outline-none transition-all ${
                theme === "dark" 
                  ? "bg-slate-900 border-slate-800 focus:border-cyan-555 text-white" 
                  : "bg-white border-slate-205 focus:border-cyan-500 text-slate-900"
              }`}
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shrink-0"
              title="Post message"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
