/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useStore } from "../store";
import { Star, MessageSquarePlus, MessageSquare, ShieldAlert, Trash2, Edit2, CheckCircle2, User } from "lucide-react";

interface ReviewsProps {
  onOpenAuth: () => void;
}

export default function Reviews({ onOpenAuth }: ReviewsProps) {
  const { theme, reviews, currentUser, addReview, deleteReview } = useStore();
  const [composerOpen, setComposerOpen] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [text, setText] = useState<string>("");
  const [service, setService] = useState<string>("Website Development");
  const [isFeatureMsg, setIsFeatureMsg] = useState<boolean>(false);

  // Filter approved or featured reviews or client specific to client
  const approvedReviews = reviews.filter(rev => rev.status === "Approved");
  const averageRating = approvedReviews.length > 0 
    ? (approvedReviews.reduce((acc, curr) => acc + curr.rating, 0) / approvedReviews.length).toFixed(1)
    : "5.0";

  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    
    if (!text.trim()) return;

    await addReview({
      client_id: currentUser.id,
      client_name: currentUser.name,
      client_avatar: currentUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`,
      rating,
      review_text: text,
      service_used: service,
      status: "Pending", // Needs admin approval to display on public feed
      is_featured: false
    });

    setText("");
    setIsFeatureMsg(true);
    setComposerOpen(false);
    setTimeout(() => setIsFeatureMsg(false), 4000);
  };

  return (
    <section id="reviews" className={`py-20 md:py-28 text-left ${
      theme === "dark" 
        ? "bg-slate-900/40 text-white" 
        : "bg-slate-50 text-slate-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title and Ratings Statistics Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16" id="reviews-header-block">
          <div className="lg:col-span-8 space-y-4">
            <p className="text-xs font-mono uppercase tracking-widest text-cyan-500">CLIENT DELIGHT & FEEDBACK</p>
            <h2 className="text-3xl sm:text-4xl md:text-5.5xl font-display font-light tracking-tight leading-tight">
              Testimonials from <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-amber-250 to-purple-400 font-normal italic">Worldwide Teams</span>
            </h2>
            <p className="text-base font-light opacity-75">
              Read transparent client success stories. Client satisfaction is our primary metric. Authenticated customers are welcomed to write, update, or manage reviews immediately.
            </p>
          </div>

          {/* Quick Score Card */}
          <div className="lg:col-span-4 p-6 rounded-2xl border flex flex-col items-center justify-center text-center bg-slate-950/40 dark:border-slate-800 border-slate-200" id="reviews-scorebox">
            <h3 className="text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
              {averageRating}
            </h3>
            <div className="flex space-x-1 mt-2 mb-1.5" aria-label={`Average rating ${averageRating}`}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  className={s <= Math.round(Number(averageRating)) ? "text-yellow-400 fill-yellow-400" : "text-slate-700"}
                />
              ))}
            </div>
            <p className="text-xs font-mono opacity-60">Based on {approvedReviews.length} approved reviews</p>
            
            {/* Review composers trigger button */}
            <button
              onClick={() => {
                if (!currentUser) onOpenAuth();
                else setComposerOpen(!composerOpen);
              }}
              id="btn-composer-prompt"
              className="mt-4 px-4 py-2 rounded-xl text-xs font-mono font-bold border dark:border-slate-800 hover:dark:bg-slate-900 bg-white border-slate-200 text-slate-800 dark:text-white flex items-center space-x-1.5 transition-colors"
            >
              <MessageSquarePlus size={14} />
              <span>{composerOpen ? "Close composer" : "Compose Review"}</span>
            </button>
          </div>
        </div>

        {/* Informational banner */}
        {isFeatureMsg && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 flex items-start space-x-3 max-w-xl animate-fade-in">
            <CheckCircle2 className="shrink-0 text-emerald-400 mt-1" size={18} />
            <div className="text-xs font-mono">
              <p className="font-bold uppercase tracking-wider">Review Submitted Successfully</p>
              <p className="opacity-80 mt-1">Thank you! Your feedback has been queued for Diavox Team review and approval.</p>
            </div>
          </div>
        )}

        {/* Dynamic Composer form drawer */}
        {composerOpen && (
          <div className="mb-12 p-6 sm:p-8 rounded-2xl border max-w-2xl dark:bg-slate-950/80 bg-white dark:border-slate-800 border-slate-200" id="review-composer-form">
            <h3 className="text-lg font-display font-extrabold mb-6">Review Diavox Tech</h3>
            
            <form onSubmit={handleComposeSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase opacity-60 mb-1.5">Rating Star Count</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setRating(s)}
                        className="p-1 rounded-lg hover:bg-slate-500/10 transition-colors"
                        aria-label={`Rate ${s} stars`}
                      >
                        <Star
                          size={24}
                          className={s <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-400"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase opacity-60 mb-1.5" htmlFor="composer-service-used">Service Completed</label>
                  <select
                    id="composer-service-used"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className={`w-full text-xs p-2.5 rounded-lg border focus:outline-none ${
                        theme === "dark" 
                          ? "bg-slate-950 border-slate-800 text-white" 
                          : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  >
                    <option value="Website Development">Website Development</option>
                    <option value="Website Design">Website Design</option>
                    <option value="Technical SEO & Auditing">Technical SEO & Auditing</option>
                    <option value="AI Automation workflows">AI Automation workflows</option>
                    <option value="Sub-second Code Refactoring">Sub-second Code Refactoring</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase opacity-60 mb-1.5" htmlFor="composer-feedback-text">Review Description</label>
                <textarea
                  id="composer-feedback-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Tell us what you built with us and description of your remote partnership..."
                  rows={4}
                  className={`w-full text-xs p-3 rounded-xl border focus:outline-none ${
                    theme === "dark" 
                      ? "bg-slate-950 border-slate-800 text-white placeholder-slate-550" 
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  id="btn-submit-review"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold text-xs font-mono tracking-wider shadow-lg shadow-cyan-500/10"
                >
                  Submit review for audit
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Approved Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="reviews-feed-grid">
          {approvedReviews.map((rev) => {
            const canClientCrud = currentUser && currentUser.id === rev.client_id;
            return (
              <div
                key={rev.id}
                id={`review-item-${rev.id}`}
                className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
                  theme === "dark"
                    ? "bg-slate-950/80 border-slate-900 hover:border-slate-800"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-md shadow-slate-200/20"
                }`}
              >
                <div className="space-y-4">
                  {/* Star row */}
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-1" aria-label={`${rev.rating} stars`}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={13}
                          className={s <= rev.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-800 dark:text-slate-800/40"}
                        />
                      ))}
                    </div>

                    {/* Quick client delete rule */}
                    {canClientCrud && (
                      <button
                        onClick={() => deleteReview(rev.id)}
                        className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors"
                        title="Remove my feedback"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>

                  {/* Comment */}
                  <p className="text-xs opacity-80 leading-relaxed font-light min-h-[60px]">
                    "{rev.review_text}"
                  </p>
                </div>

                {/* Sender card and date info */}
                <div className="mt-6 pt-4 border-t dark:border-slate-900 border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={rev.client_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rev.client_name)}`}
                      alt={rev.client_name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full bg-slate-900 object-cover border dark:border-slate-800 border-slate-200"
                    />
                    <div className="text-left leading-none">
                      <h4 className="text-xs font-bold font-display">{rev.client_name}</h4>
                      <span className="text-[10px] font-mono opacity-50">{rev.service_used}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono opacity-40">{rev.date}</span>
                </div>

                {/* Team Replied node */}
                {rev.reply_text && (
                  <div className="mt-4 p-3 rounded-lg dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 text-[11px]">
                    <p className="font-bold font-mono text-cyan-500 mb-1">Diavox Support Response:</p>
                    <p className="opacity-85 font-light">"{rev.reply_text}"</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
