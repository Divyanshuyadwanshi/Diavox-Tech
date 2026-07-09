/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from "zustand";
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase";
import { formatAmount, getCurrencySymbol } from "./utils/currency";
import { 
  UserProfile, Project, ServiceRequest, ClientReview, Blog, Message, 
  Notification, Contract, ActivePlan, AgencyMetrics, UserRole, RequestStatus, TeamDepartment,
  PricingOption, PricingTierObj, ActivityLog, Invoice, PaymentHistoryItem, AiKnowledgeItem,
  CmsContent, MilestonePayment, QuoteReply, QuoteAttachment, QuoteStatusHistory, Conversation,
  SocialMediaLink, PortfolioItem, PrivateMessage, TeamGroup, TeamMessage, ProjectGroup, AiTrainingFile, PlanApproval,
  KnowledgeCategory, KnowledgeTag, KnowledgeArticle, SavedArticle, TimelineEvent, UserActivity
} from "./types";

interface AgencyState {
  // Authentication & Profile States
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  
  // Dynamic Datasets
  projects: Project[];
  projectUpdates: { [projectId: string]: any[] };
  requests: ServiceRequest[];
  contracts: Contract[];
  activePlans: ActivePlan[];
  reviews: ClientReview[];
  blogs: Blog[];
  messages: Message[];
  notifications: Notification[];
  metrics: AgencyMetrics;

  // Quote replies and conversations
  quoteReplies: QuoteReply[];
  quoteAttachments: QuoteAttachment[];
  quoteStatusHistory: QuoteStatusHistory[];
  conversations: Conversation[];
  
  // Social media links
  socialMediaLinks: SocialMediaLink[];
  addSocialMediaLink: (platform: string, url: string, icon: string) => Promise<void>;
  updateSocialMediaLink: (id: string, updates: Partial<SocialMediaLink>) => Promise<void>;
  deleteSocialMediaLink: (id: string) => Promise<void>;
  reorderSocialMediaLinks: (newOrderList: SocialMediaLink[]) => Promise<void>;
  
  // Theme state
  theme: "light" | "dark";
  
  // Actions
  toggleTheme: () => void;
  setCurrentUser: (user: UserProfile | null) => void;
  syncSupabase: () => Promise<void>;
  
  // Quote Status and Replies
  submitQuoteReply: (quoteId: string, text: string, files?: { file_name: string; file_url: string }[]) => Promise<void>;
  updateQuoteStatusDetail: (quoteId: string, status: RequestStatus, notes?: string) => Promise<void>;
  
  // Authentication
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; isUnconfirmed?: boolean; profile?: any }>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  
  // Reviews & Testimonials (Full CRUD + Admin approval)
  addReview: (review: Omit<ClientReview, "id" | "date">) => Promise<void>;
  updateReviewStatus: (reviewId: string, status: "Approved" | "Rejected" | "Hidden") => void;
  toggleReviewFeature: (reviewId: string) => void;
  replyToReview: (reviewId: string, text: string) => void;
  deleteReview: (reviewId: string) => void;
  
  // Request Service / Client requests
  submitRequest: (request: Omit<ServiceRequest, "id" | "created_at" | "status">) => Promise<void>;
  updateRequestStatus: (id: string, status: RequestStatus) => void;
  
  // Team management
  addTeamMember: (name: string, position: string, department: TeamDepartment, email: string, username?: string, role?: UserRole, permissions?: string[], password?: string, avatar_url?: string, description?: string, portfolio?: string) => Promise<UserProfile>;
  updateTeamMember: (id: string, updates: Partial<UserProfile>) => void;
  updateUserProfile: (id: string, updates: Partial<UserProfile>) => void;
  deleteTeamMember: (id: string) => void;
  deleteUserAccount: (id: string) => Promise<void>;
  
  // Project management
  addProject: (project: Omit<Project, "id">) => void;
  updateProjectProgress: (projectId: string, progress: number, updateText?: string) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  
  // Contracts and Plans
  addContract: (contract: Omit<Contract, "id" | "created_at">) => Promise<void>;
  signContract: (contractId: string) => void;
  purchasePlan: (planName: "Starter" | "Professional" | "Enterprise", isAnnual: boolean) => void;
  
  // Chat / Messages
  sendMessage: (recipientId: string, text: string, file_url?: string, file_name?: string, is_image?: boolean) => void;
  markClientMessagesRead: (clientId: string) => Promise<void>;
  
  // Notifications
  addNotification: (userId: string, title: string, content: string) => void;
  markNotificationsRead: (userId: string) => void;

  // Dynamic Pricing CRUD
  pricingOptions: PricingOption[];
  updatePricingOption: (optionId: string, updates: Partial<PricingOption>) => void;
  updatePricingTier: (optionId: string, tierId: string, updates: Partial<PricingTierObj>) => void;
  addPricingOption: (title: string, type: "one-time" | "monthly-subscription") => void;
  deletePricingOption: (optionId: string) => void;

  // New modules
  activityLogs: ActivityLog[];
  invoices: Invoice[];
  payments: PaymentHistoryItem[];
  aiKnowledge: AiKnowledgeItem[];
  cmsContent: CmsContent;
  isCmsLoaded: boolean;
  isCmsFresh: boolean;
  milestones: MilestonePayment[];
  webhookLogs: any[];

  addActivityLog: (userId: string, action: string, prev?: string, next?: string) => void;
  addInvoice: (invoice: Omit<Invoice, "id" | "created_at">) => Promise<void>;
  updateInvoiceStatus: (id: string, status: "paid" | "unpaid" | "cancelled") => Promise<void>;
  addPayment: (payment: Omit<PaymentHistoryItem, "id">) => void;
  addAiKnowledge: (category: string, question: string, answer: string) => Promise<void>;
  updateAiKnowledge: (id: string, updates: Partial<AiKnowledgeItem>) => Promise<void>;
  deleteAiKnowledge: (id: string) => Promise<void>;
  updateCmsContent: (content: Partial<CmsContent>) => Promise<void>;
  addMilestone: (milestone: Omit<MilestonePayment, "id">) => void;
  payMilestone: (milestoneId: string, type: "advance" | "midway" | "final") => void;
  addWebhookLog: (log: any) => void;

  // New Tables for Complete Supabase & Dashboard Syncing
  portfolioItems: PortfolioItem[];
  privateMessages: PrivateMessage[];
  teamGroups: TeamGroup[];
  teamMessages: TeamMessage[];
  projectGroups: ProjectGroup[];
  aiTrainingFiles: AiTrainingFile[];
  planApprovals: PlanApproval[];

  // Help Center & Activity states
  knowledgeArticles: KnowledgeArticle[];
  knowledgeCategories: KnowledgeCategory[];
  knowledgeTags: KnowledgeTag[];
  savedArticles: SavedArticle[];
  timelineEvents: TimelineEvent[];
  userActivities: UserActivity[];

  // Help Center & Activity action methods
  fetchHelpCenterData: () => Promise<void>;
  addKnowledgeArticle: (article: Omit<KnowledgeArticle, "id" | "views_count" | "likes_count" | "created_at">) => Promise<void>;
  updateKnowledgeArticle: (id: string, updates: Partial<KnowledgeArticle>) => Promise<void>;
  deleteKnowledgeArticle: (id: string) => Promise<void>;
  addKnowledgeCategory: (name: string, description?: string) => Promise<void>;
  deleteKnowledgeCategory: (id: string) => Promise<void>;
  addKnowledgeTag: (name: string) => Promise<void>;
  deleteKnowledgeTag: (id: string) => Promise<void>;
  toggleSavedArticle: (articleId: string) => Promise<void>;
  incrementArticleViews: (id: string) => Promise<void>;
  incrementArticleLikes: (id: string) => Promise<void>;
  addTimelineEvent: (event: Omit<TimelineEvent, "id" | "created_at"> & { user_id?: string; user_name?: string }) => Promise<void>;
  addUserActivity: (activity: Omit<UserActivity, "id" | "created_at">) => Promise<void>;

  // Action methods
  addBlog: (blog: Omit<Blog, "id" | "created_at">) => Promise<void>;
  updateBlog: (id: string, updates: Partial<Blog>) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;

  addPortfolioItem: (item: Omit<PortfolioItem, "id" | "created_at">) => Promise<void>;
  updatePortfolioItem: (id: string, updates: Partial<PortfolioItem>) => Promise<void>;
  deletePortfolioItem: (id: string) => Promise<void>;
  fetchPortfolio: () => Promise<void>;

  sendPrivateMessage: (senderId: string, senderName: string, recipientId: string, text: string, file_url?: string, file_name?: string, is_image?: boolean) => void;
  sendTeamMessage: (groupId: string, senderId: string, senderName: string, senderRole: string, text: string, file_url?: string, file_name?: string, is_image?: boolean) => void;
  createTeamGroup: (name: string, description?: string) => void;
  deleteTeamGroup: (id: string) => void;
  createProjectGroup: (projectId: string, name: string, assignedMembers: string[]) => void;
  deleteProjectGroup: (id: string) => void;

  addAiTrainingFile: (title: string, file_type: "pdf" | "faq" | "pricing" | "blog" | "service_info" | "project_info", content: string, uploaded_by_id: string, uploaded_by_name: string) => Promise<void>;
  deleteAiTrainingFile: (id: string) => Promise<void>;

  submitPlanApproval: (clientId: string, clientName: string, planName: string, price: string, billingCycle: "Monthly" | "Annually") => Promise<void>;
  updatePlanApprovalStatus: (id: string, status: "Approved" | "Rejected") => Promise<void>;
  addActivePlan: (plan: Omit<ActivePlan, "id">) => Promise<void>;
  updateActivePlan: (id: string, updates: Partial<ActivePlan>) => Promise<void>;
  deleteActivePlan: (id: string) => Promise<void>;
}

// Key initial assets seeds
const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-1",
    title: "Apex E-Commerce Platform",
    description: "A luxury lifestyle e-commerce solution architected for high volume sales. Fully customized layout built with headless search engine integrations, responsive catalog visualizers, and sub-second loading states.",
    category: "Website Development",
    technologies: ["React", "TypeScript", "Tailwind CSS", "NextJS", "Supabase"],
    image_url: "https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=1200&auto=format&fit=crop",
    completion_date: "2026-04-12",
    live_url: "https://apex-luxury.com",
    status: "completed",
    progress: 100,
    delivery_date: "2026-04-12"
  },
  {
    id: "proj-2",
    title: "Vivid UI/UX Design System",
    description: "Modern complete overhaul design framework for SaaS software company. Handcrafted fluid micro-animations, customizable dark mode setups, and interactive client dashboard prototypes built strictly for enterprise scales.",
    category: "Website Design",
    technologies: ["Framer Motion", "Framer", "UI/UX", "Tailwind CSS", "Figma"],
    image_url: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?q=80&w=1200&auto=format&fit=crop",
    completion_date: "2026-05-18",
    live_url: "https://vivid-saas-design.io",
    status: "completed",
    progress: 100,
    delivery_date: "2026-05-18"
  },
  {
    id: "proj-3",
    title: "FlowState AI Automations",
    description: "Custom AI chatbot with smart workflows integrating CRM interfaces, customer request queues, and email responder nodes. Automated sales funnels, resulting in 80% customer support overhead savings.",
    category: "AI Automation",
    technologies: ["Google Gemini API", "FastAPI", "Python", "Supabase DB", "Tailwind"],
    image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    completion_date: "2026-06-01",
    live_url: "https://flowstate-ai.diavox.com",
    status: "ongoing",
    progress: 68,
    delivery_date: "2026-07-15"
  },
  {
    id: "proj-4",
    title: "Global SEO Campaign - Zenith",
    description: "Extensive performance tune-ups, keyword structures, search index strategies, and high-quality backlink pipelines. Accomplished number one rankings for core SaaS niche terms, accelerating organic clicks by +240%.",
    category: "SEO",
    technologies: ["Technical SEO", "On-page Optimization", "Search Console", "PageSpeed"],
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    completion_date: "2026-02-10",
    live_url: "https://zenith-analytics.net",
    status: "completed",
    progress: 100,
    delivery_date: "2026-02-10"
  },
  {
    id: "proj-5",
    title: "Verdant Estate - Real Estate Hub",
    description: "Premium property listing and agent presentation template with custom spatial filter layers, appointment schedules, beautiful interactive layout screens, and responsive maps integration.",
    category: "Website Development",
    technologies: ["React", "Lucide Icons", "Mapbox", "Tailwind CSS"],
    image_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
    completion_date: "2026-05-24",
    live_url: "https://verdant-homes.com",
    status: "completed",
    progress: 100,
    delivery_date: "2026-05-24"
  }
];

const INITIAL_REVIEWS: ClientReview[] = [
  {
    id: "rev-1",
    client_id: "client-marcus",
    client_name: "Marcus Vance",
    client_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=120&auto=format&fit=crop",
    rating: 5,
    review_text: "Our transition to Diavox Tech's automated workflow saved us over 20 hours a week in client bookings. Their design language is stunning and execution is impeccable.",
    service_used: "AI Automation & Custom Dev",
    status: "Approved",
    is_featured: true,
    date: "2026-05-20"
  },
  {
    id: "rev-2",
    client_id: "client-sarah",
    client_name: "Sarah Jenkins",
    client_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop",
    rating: 5,
    review_text: "The web development team blew past our expectations. Our site's load speed went from 4.2 seconds to 0.7 seconds, and the e-commerce sales have spiked drastically.",
    service_used: "E-Commerce Development",
    status: "Approved",
    is_featured: true,
    date: "2026-06-02"
  },
  {
    id: "rev-3",
    client_id: "client-david",
    client_name: "David Chen",
    client_avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=120&auto=format&fit=crop",
    rating: 5,
    review_text: "Diavox customized our search presence. They ran technical audits and on-page optimization, taking us to the top spots on Google. Best agency we've ever partnered with.",
    service_used: "Technical SEO & Optimization",
    status: "Approved",
    is_featured: true,
    date: "2026-04-15"
  }
];

const INITIAL_BLOGS: Blog[] = [
  {
    id: "blog-1",
    title: "Mastering Design Systems: Scaling UI in Modern SaaS",
    slug: "mastering-design-systems",
    content: "Building custom visual architectures demands pristine guidelines, consistent spacing metrics, and predictable component behavior. At Diavox, we use semantic token foundations, custom typography scales, and modular Framer Motion layers to create premium experiences that feel natural. Learn how a robust system speeds up developer ship-time by up to 60% while maintaining unified, luxury aesthetics.",
    category: "Web Development",
    author_name: "Emma Designer",
    image_url: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?q=80&w=600&auto=format&fit=crop",
    created_at: "2026-06-01",
    read_time: "5 min read"
  },
  {
    id: "blog-2",
    title: "How We Optimized Core Web Vitals to Sub-Second Load States",
    slug: "optimize-core-web-vitals",
    content: "Speed is directly correlated with conversions and SEO algorithms. By switching to Vite, stripping unused style sheets, optimizing vector images, and leveraging smart server-side streaming headers, we achieve instantaneous feedback loops for our clients. In this article, our leading development team walks through image lazy configurations, code-splitting chunks, and caching methods.",
    category: "SEO",
    author_name: "Alex Developer",
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop",
    created_at: "2026-06-08",
    read_time: "7 min read"
  },
  {
    id: "blog-3",
    title: "The Future of Business: Integrating Intelligent AI Automations",
    slug: "future-of-business-ai",
    content: "AI is no longer just a trend, it is a massive boost to efficiency. Standard customer queues and email funnels can be coupled with Gemini API modules to answer, categorize, tag, and forward client responses automatically. Diavox Tech constructs customizable API routing pipelines that eliminate manual tasks, reduce human oversight, and enable response times under 5 minutes.",
    category: "AI",
    author_name: "Divyanshu Admin",
    image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
    created_at: "2026-06-10",
    read_time: "6 min read"
  }
];

const INITIAL_TEAM: UserProfile[] = [
  {
    id: "team-john",
    email: "john.sales@diavox.com",
    name: "John Sales",
    role: "team_member",
    department: "sales",
    avatar_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=120&auto=format&fit=crop",
    permissions: ["view_leads", "manage_inquiries", "contact_clients"],
    portfolio: "https://john-sales.com",
    description: "Expert consultant in online growth strategies and SaaS pipeline development."
  },
  {
    id: "team-alex",
    email: "alex.developer@diavox.com",
    name: "Alex Developer",
    role: "team_member",
    department: "developer",
    avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=120&auto=format&fit=crop",
    permissions: ["view_assigned_projects", "update_progress", "upload_files"],
    portfolio: "https://alex-dev-solutions.io",
    description: "Full-stack engineer handling sub-second React apps and automated CRM links."
  },
  {
    id: "team-emma",
    email: "emma.designer@diavox.com",
    name: "Emma Designer",
    role: "team_member",
    department: "designer",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120&auto=format&fit=crop",
    permissions: ["access_design_assets", "upload_designs"],
    portfolio: "https://emma-vivid-art.net",
    description: "Creative designer specializing in elegant wireframing and user experience flowcharts."
  }
];

const INITIAL_PRICING: PricingOption[] = [
  {
    id: "design-dev",
    title: "Project Design & Development",
    type: "one-time",
    tiers: [
      {
        id: "tier-dd-basic",
        name: "Basic",
        tagline: "Ideal for basic landings, portfolio showcases, and quick MVP sites.",
        priceUSD: "1999",
        priceINR: "165000",
        priceGBP: "1600",
        features: [
          "1 Custom Showcase Website",
          "Standard UI/UX layout",
          "On-page basic SEO meta tag setup",
          "Includes 1 month of basic support warranty"
        ]
      },
      {
        id: "tier-dd-standard",
        name: "Standard",
        tagline: "Highly versatile custom business platform with database persistence.",
        priceUSD: "4999",
        priceINR: "415000",
        priceGBP: "4000",
        features: [
          "Full custom web app under React & Supabase",
          "Premium interactive animations",
          "Fully responsive layouts and multi-step inquiry routing",
          "Includes 3 months of priority support warranty"
        ]
      },
      {
        id: "tier-dd-expert",
        name: "Expert",
        tagline: "Complete enterprise portal or high-converting SaaS engine solution.",
        priceUSD: "9999",
        priceINR: "825000",
        priceGBP: "8000",
        features: [
          "Complete multi-branch SaaS or E-commerce platform",
          "Custom interactive database architecture & backup systems",
          "Dedicated developer resources allocated to your division",
          "Includes 1 year of continuous development iterations"
        ]
      }
    ]
  },
  {
    id: "maintenance",
    title: "Website Maintenance",
    type: "monthly-subscription",
    tiers: [
      {
        id: "tier-m-basic",
        name: "Basic",
        tagline: "Keep your single website healthy, active, and securely updated.",
        priceUSD: "199",
        priceINR: "16500",
        priceGBP: "160",
        features: [
          "Weekly security patches & package upgrades",
          "1 hour/month of dedicated text changes",
          "Uptime server monitoring (24/7 check blocks)",
          "Monthly health & velocity diagnostics report"
        ]
      },
      {
        id: "tier-m-standard",
        name: "Standard",
        tagline: "Ideal for business apps requiring active optimization updates.",
        priceUSD: "499",
        priceINR: "41500",
        priceGBP: "400",
        features: [
          "Daily cloud database backup configuration",
          "4 hours/month of custom content design iterations",
          "Continuous speed audits & sub-second loading tune-ups",
          "Priority security firewalls & emergency troubleshooting"
        ]
      },
      {
        id: "tier-m-expert",
        name: "Expert",
        tagline: "Dedicated helpdesk for major enterprise websites & active databases.",
        priceUSD: "999",
        priceINR: "82500",
        priceGBP: "805",
        features: [
          "Comprehensive database synchronization and schema edits",
          "15 hours/month of professional developer edits",
          "Instant messaging hotline with dedicated webmasters",
          "Full server scale monitoring & resource scaling coverage"
        ]
      }
    ]
  },
  {
    id: "seo",
    title: "SEO Subscription",
    type: "monthly-subscription",
    tiers: [
      {
        id: "tier-seo-basic",
        name: "Basic",
        tagline: "Acquire steady organic search growth on local market phrases.",
        priceUSD: "399",
        priceINR: "33000",
        priceGBP: "320",
        features: [
          "Monthly keyword search analytics & reporting",
          "Core Web Vitals fine-tune setup",
          "5 target keyword phrases on-page meta optimization",
          "Google Search Console integration mapping"
        ]
      },
      {
        id: "tier-seo-standard",
        name: "Standard",
        tagline: "Drive high-impact buyer search traffic to raise sales actions.",
        priceUSD: "799",
        priceINR: "66000",
        priceGBP: "640",
         features: [
          "Competitor backlink audit and strategy analysis",
          "20 target keywords tracking on organic ranking list",
          "In-depth monthly technical audit reviews",
          "Custom SEO article publishing and copy generation"
        ]
      },
      {
        id: "tier-seo-expert",
        name: "Expert",
        tagline: "Dominate international markets, acquiring top-ranking traffic.",
         priceUSD: "1499",
        priceINR: "123000",
        priceGBP: "1200",
        features: [
          "Bespoke omni-channel global indexing campaign",
          "Unlimited tracked keywords & premium rank dashboards",
          "Weekly competitor strategy briefings and SEO insights",
          "Dedicated content writers for monthly blog releases"
        ]
      }
    ]
  }
];

const DEFAULT_SOCIAL_MEDIA_LINKS: SocialMediaLink[] = [
  { id: "sml-facebook", platform: "Facebook", url: "https://facebook.com/diavoxtech", icon: "Facebook", display_order: 1, visible: true, created_at: new Date().toISOString() },
  { id: "sml-instagram", platform: "Instagram", url: "https://instagram.com/diavoxtech", icon: "Instagram", display_order: 2, visible: true, created_at: new Date().toISOString() },
  { id: "sml-linkedin", platform: "LinkedIn", url: "https://linkedin.com/company/diavoxtech", icon: "LinkedIn", display_order: 3, visible: true, created_at: new Date().toISOString() },
  { id: "sml-x", platform: "X (Twitter)", url: "https://x.com/diavoxtech", icon: "X", display_order: 4, visible: true, created_at: new Date().toISOString() },
  { id: "sml-youtube", platform: "YouTube", url: "https://youtube.com/c/diavoxtech", icon: "YouTube", display_order: 5, visible: true, created_at: new Date().toISOString() },
  { id: "sml-github", platform: "GitHub", url: "https://github.com/diavoxtech", icon: "GitHub", display_order: 6, visible: true, created_at: new Date().toISOString() }
];

const secureFetch = async (url: string, options: RequestInit = {}) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    let token = session?.access_token;

    // Support admin-secret bypass credentials if active
    try {
      const activeUser = useStore?.getState()?.currentUser;
      if (activeUser && activeUser.id === "admin-secret") {
        token = "admin-secret-bypass-token";
      }
    } catch (_) {}

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
    return fetch(url, { ...options, headers });
  } catch (err) {
    console.warn("[ZERO TRUST] Failed to retrieve session JWT for API route:", err);
    return fetch(url, options);
  }
};

// Combine all seeded items with localStorage caching to guarantee persistence. (Save Zustand UI state ONLY, remove local business data caching)
const loadSavedState = () => {
  if (typeof window === "undefined") return {};
  try {
    const data = localStorage.getItem("diavox_cached_state");
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const saveStateToCache = (state: Partial<AgencyState>) => {
  try {
    const existing = loadSavedState();
    const cacheData = {
      currentUser: state.currentUser !== undefined ? state.currentUser : existing.currentUser,
      theme: state.theme !== undefined ? state.theme : existing.theme,
      cmsContent: state.cmsContent !== undefined ? state.cmsContent : existing.cmsContent
    };
    localStorage.setItem("diavox_cached_state", JSON.stringify(cacheData));
  } catch (err) {
    console.error("Cache persistence failed:", err);
  }
};

const mapDbReviewToClientReview = (row: any): ClientReview => {
  return {
    id: row.id,
    client_id: row.client_id || "",
    client_name: row.client_name || row.name || "Anonymous",
    client_avatar: row.client_avatar || row.avatar_url || "",
    rating: row.rating || 5,
    review_text: row.review_text || "",
    service_used: row.service_used || row.role || "Website Development",
    status: row.status || "Pending",
    is_featured: row.featured !== undefined ? row.featured : (row.is_featured || false),
    reply_text: row.admin_reply || row.reply_text || "",
    date: row.date || new Date().toISOString().split("T")[0]
  };
};

let isSyncingSupabase = false;

export const useStore = create<AgencyState>((set, get) => {
  const cached = loadSavedState();

  return {
    // Authenticated Profiles
    currentUser: cached.currentUser || null,
    allUsers: [
      { id: "admin-secret", email: "-Lamep@diavox.com", name: "Secret Admin", role: "secret_admin", username: "-lamep_root" }
    ],
    
    // Social media links
    socialMediaLinks: DEFAULT_SOCIAL_MEDIA_LINKS,
    
    // Core data (Mock-free empty defaults)
    projects: [],
    projectUpdates: {},
    requests: [],

    // Quote details and Conversations state
    quoteReplies: [],
    quoteAttachments: [],
    quoteStatusHistory: [],
    conversations: [],
    contracts: [],
    activePlans: [],
    reviews: [],
    blogs: [],
    messages: [],
    notifications: [],
    metrics: {
      revenue: 0,
      activeClients: 0,
      projectsCompleted: 0,
      pendingLeads: 0,
      teamCount: 1,
      conversionRate: 0
    },
    
    // Theme Preference
    theme: cached.theme || "dark",
    
    // Dynamic Pricing Dataset
    pricingOptions: INITIAL_PRICING,

    activityLogs: [],
    invoices: [],
    payments: [],
    aiKnowledge: [],
    cmsContent: {
      heroTitle: "Crafting Divine Aesthetic Digital High-Utility Systems",
      heroSubtitle: "Diavox Tech helps modern brands establish a strong online presence and automate operational bottlenecks. We craft high-speed websites, bespoke SEO campaigns, AI automations, and downloadable digital assets that turn traffic into long-term growth.",
      heroBadge: "Serving clients worldwide remotely",
      heroBadgeEffect: "spin",
      fontSans: "Inter",
      defaultCurrency: "USD",
      fontDisplay: "Space Grotesk",
      fontMono: "JetBrains Mono",
      headerLogoTitle: "Diavox",
      headerLogoAccent: "Tech",
      headerLogoSubtitle: "GLOBAL REMOTE",
      heroCtaPrimaryText: "Request Custom Quote",
      heroCtaSecondaryText: "Explore Work",
      footerLogoText: "Diavox",
      footerLogoAccent: "Tech",
      footerBrandDesc: '"Building Digital Experiences, Automating Businesses, Driving Growth." Crafting sub-second applications, custom automated CRM logic, and technical SEO algorithms.',
      footerCopyright: "© 2026 Diavox Tech Inc. Serving global remote divisions. All rights reserved.",
      footerCredit: "Made with precision by Diavox Desk",
      footerNotation1: "Serving clients worldwide remotely.",
      footerNotation2: "Customer support available with responses within 24 hours.",
      heroSliderConfig: {
        autoplay: true,
        duration: 4000,
        globalEffect: "fade"
      },
      heroSlides: [
        {
          id: "slide-1",
          title: "Innovative Solutions",
          subtitle: "Transforming ideas into powerful digital experiences.",
          buttonText: "Explore Now",
          buttonLink: "#services",
          status: true
        },
        {
          id: "slide-2",
          title: "Smart Technology",
          subtitle: "Building modern software that drives success.",
          buttonText: "View Solutions",
          buttonLink: "#portfolio",
          status: true
        },
        {
          id: "slide-3",
          title: "Where Ideas Become Reality",
          subtitle: "Creating intelligent solutions for businesses worldwide.",
          buttonText: "Contact Us",
          buttonLink: "#contact",
          status: true
        }
      ],
      sphereConfig: {
        color: "rgba(188, 156, 110, 1)",
        size: 0.42,
        labels: [
          "DISPATCH.STATE: REMOTE",
          "SYS.LATENCY: 0.45s",
          "NODES.ACTIVE: 120+",
          "DB.SECURITY: COMPLAINT",
          "AI.MODULATOR: G.GEMINI",
          "CORE.INDEX: TECHNICAL SEO",
        ],
        sparkEnabled: true,
        sparkFrequency: 0.05,
        rotationSpeed: 0.25,
        rings: 5,
        segments: 12
      },
      homepageSections: ["hero", "services", "portfolio", "team", "reviews", "pricing", "blog", "contact"],
      sectionVisibility: {
        hero: true,
        services: true,
        portfolio: true,
        team: true,
        reviews: true,
        pricing: true,
        blog: true,
        contact: true
      },
      sectionColors: {
        hero: { bg: "slate-950", text: "white" },
        services: { bg: "slate-950", text: "white" },
        portfolio: { bg: "slate-950", text: "slate-900" },
        team: { bg: "slate-950", text: "white" },
        reviews: { bg: "slate-950", text: "white" },
        pricing: { bg: "slate-950", text: "white" },
        blog: { bg: "slate-950", text: "white" },
        contact: { bg: "slate-950", text: "white" }
      },
      sectionTitles: {
        hero: "Crafting Divine Aesthetic Digital High-Utility Systems",
        services: "EXPERTISE & CAPABILITIES",
        portfolio: "CASE STUDIES & SHOWCASE",
        team: "OUR TEAM OF EXPERTS",
        reviews: "CLIENT APPRECIATION",
        pricing: "CLEAR, VALUE-DRIVEN PLANS",
        blog: "AGENCY CHRONICLES",
        contact: "START YOUR INITIATION"
      },
      sectionSubtitles: {
        services: "How We Help Your Business Stand Out & Grow",
        portfolio: "Handcrafted Digital Interfaces That Work",
        team: "The Creative Minds Behind Diavox Tech",
        reviews: "What Our Partners Say About Us",
        pricing: "Select a Strategic Engagement Model",
        blog: "Bespoke Insights On Engineering & Design",
        contact: "Connect with our executive specialists instantly"
      },
      sectionDescriptions: {
        services: "We provide clear, reliable web development, corporate design, search ranking configurations, and smart script integrations to eliminate operational bottlenecks and turn traffic into clients.",
        portfolio: "We don't build generic boxes. We craft tailored, high-utility systems that represent your voice accurately.",
        team: "A strategic coalition of engineers, designers, and marketers focused on creating high-speed platforms.",
        reviews: "Read real stories of transformation and success from founders and system curators globally.",
        pricing: "Transparent structures centered on long-term values, offering predictable billing with zero surprise items.",
        blog: "Explore custom tutorials, engineering logs, design audits, and digital assets available for immediate reference.",
        contact: "Submit blueprints, request custom consultations, or start direct live chats for project reviews."
      },
      sectionButtons: {},
      faqs: [
        {
          id: "faq-1",
          question: "How long does it take to deploy a custom business website?",
          answer: "A standard custom project (like a corporate landing page or visual portfolio) typically delivers an active beta layout in 2 to 3 weeks. Complex web applications with databases and user logins may take 6 to 8 weeks in sprints."
        },
        {
          id: "faq-2",
          question: "Do we get to review the UI layouts before development begins?",
          answer: "Yes, absolutely. We design comprehensive prototypes in Figma first. We collect your direct text feedback and iterate on layouts, colors, and typography until you approve. Only then do we start writing clean code."
        },
        {
          id: "faq-3",
          question: "Can we track active development status in real-time?",
          answer: "Yes. Once you sign in, your dedicated Customer Dashboard lists your active development portal, database states, payment invoices, and a live chat window with your engineering lead."
        }
      ],
      services: [
        {
          id: "service-1",
          title: "Website Development",
          description: "We build clean, ultra-responsive web applications tailored for modern businesses. Our stack focuses on rapid load times, custom CMS panels, reliable security standards, and seamless database structures.",
          icon: "Laptop"
        },
        {
          id: "service-2",
          title: "Website Design",
          description: "We craft professional layouts that tell your corporate story elegantly. Our design layouts balance beautiful readability with clever interactive details to keep visitors engaged and guide them toward your key actions.",
          icon: "Layers"
        },
        {
          id: "service-3",
          title: "Technical SEO",
          description: "We audit and configure your web platform structure so search engines index it correctly. We focus on fast server response indices, clean sitemaps, structured schema data, and smart keyword density plans.",
          icon: "Settings"
        },
        {
          id: "service-4",
          title: "AI Automation",
          description: "We connect Google Gemini API features to your daily manual procedures, helping you filter raw customer inquires, update databases automatically, and send instant notification alerts to your team.",
          icon: "Bot"
        },
        {
          id: "service-5",
          title: "Business Templates",
          description: "We deliver pre-built digital architectural layouts for common business fields, letting you fast-track your launch schedules. Each template includes high-end styling, database tables, and fully designed client widgets.",
          icon: "Download"
        }
      ],
      customSections: [],
      contactSettings: {
        whatsapp: "911234567890",
        email: "hello@diavox.com",
        phone: "+1 (800) 555-3210",
        supportEmail: "support@diavox.com",
        businessHours: "Mon - Fri: 9:00 AM - 6:00 PM (GMT-5)"
      },
      ...cached.cmsContent
    },
    isCmsLoaded: !!(cached && cached.cmsContent),
    isCmsFresh: false,
    milestones: [],
    webhookLogs: [],

    portfolioItems: [],
    privateMessages: [],
    teamGroups: [
      { id: "global", name: "Global Team Room", description: "General discussion lounge for all Diavox agency personnel.", created_at: "2026-06-14T00:00:00.000Z" }
    ],
    teamMessages: [],
    projectGroups: [],
    aiTrainingFiles: [],
    planApprovals: [],
    
    // Help Center & Activity states
    knowledgeArticles: [
      {
        id: "ka-1",
        title: "Introduction to Diavox Automated Workflows",
        content: "### Getting Started\n\nWelcome to Diavox Tech! In this guide, we will walk you through how our automatic client portals, invoice flows, and custom micro-databases function together securely under standard encryption systems.\n\n#### Key Milestones:\n- **Beta Layout Phase (30% value realization):** Review the interactive layout and test client portals.\n- **Midway Integration (40% value realization):** Database schemas are populated, and API connectors are activated.\n- **Final Verification (30% value realization):** Complete compliance checks and live hosting initiation.",
        category_id: "kc-1",
        tags: ["intro", "workflows", "database"],
        is_published: true,
        views_count: 52,
        likes_count: 12,
        is_featured: true,
        created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
      },
      {
        id: "ka-2",
        title: "How to manage and customize your Dynamic CMS",
        content: "### Managing Website Content via the Live Admin Console\n\nAdmins can modify headings, brand logos, primary banners, action buttons, and slide presentations directly using our high-utility visual controls.\n\n1. Sign in to the administrative dashboard\n2. Open the **Branding & Layout** segment tabs\n3. Click **Update** to publish changes live instantly",
        category_id: "kc-2",
        tags: ["cms", "guide"],
        is_published: true,
        views_count: 31,
        likes_count: 7,
        is_featured: false,
        created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
      },
      {
        id: "ka-3",
        title: "Connecting and Training custom Gemini AI models",
        content: "### Training Your Custom Assistant\n\nYou can feed plain-text documentation, specialized service spreadsheets, FAQs, or raw service guidelines directly to the AI trainer.\n\n- Supported types: PDF content, FAQ lists, pricing schedules, or blog references.\n- Training files have absolute security and isolation strictly per-workspace.",
        category_id: "kc-3",
        tags: ["ai", "gemini", "tutorial"],
        is_published: true,
        views_count: 85,
        likes_count: 24,
        is_featured: true,
        created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString()
      }
    ],
    knowledgeCategories: [
      { id: "kc-1", name: "Client Workflows", description: "Operational guidelines and engagement workflows" },
      { id: "kc-2", name: "Dynamic CMS & Systems", description: "Learn how to manage and customize your web presence" },
      { id: "kc-3", name: "Gemini AI Automation", description: "Supercharging workflows using smart model rules" }
    ],
    knowledgeTags: [
      { id: "kt-1", name: "intro" },
      { id: "kt-2", name: "workflows" },
      { id: "kt-3", name: "database" },
      { id: "kt-4", name: "cms" },
      { id: "kt-5", name: "guide" },
      { id: "kt-6", name: "ai" },
      { id: "kt-7", name: "gemini" },
      { id: "kt-8", name: "tutorial" }
    ],
    savedArticles: [],
    timelineEvents: [
      {
        id: "te-1",
        event_type: "project_created",
        title: "Apex E-Commerce Platform project initialized",
        details: "Development schedule established and linked to standard client workspace.",
        status: "success",
        created_at: new Date(Date.now() - 3600000 * 24 * 12).toISOString()
      },
      {
        id: "te-2", // Keep unique fallback or use te-2
        event_type: "contract_generated",
        title: "Bespoke development agreement generated",
        details: "Draft contract compiled by billing admin. Awaiting authorization.",
        status: "pending",
        created_at: new Date(Date.now() - 3600000 * 24 * 11).toISOString()
      }
    ],
    userActivities: [],
    
    // Actions implementation
    toggleTheme: () => {
      set((state) => {
        const nextTheme: "light" | "dark" = state.theme === "dark" ? "light" : "dark";
        const updated = { theme: nextTheme };
        saveStateToCache({ ...get(), ...updated });
        return updated;
      });
    },
    
    setCurrentUser: (user) => {
      set({ currentUser: user });
      saveStateToCache({ ...get(), currentUser: user });
    },
    
    syncSupabase: async () => {
      if (isSyncingSupabase) {
        console.log("[STORE] Supabase sync is already in progress, skipping duplicate call.");
        return;
      }
      isSyncingSupabase = true;
      const startTime = performance.now();

      try {
        // 1. Resolve and synchronize active Supabase Auth session on mount / synckey
        try {
          const currentLocalUser = get().currentUser;
          if (currentLocalUser) {
            // Already initialized via AuthListener or Cache, no need to perform duplicate getSession + profile fetch
            console.log("[STORE] Utilizing already resolved active session.");
          } else {
            const { data: { session } } = await supabase.auth.getSession();
            if (session && session.user) {
              const { data: dbProf } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
              if (dbProf) {
                const synchronizedUser: UserProfile = {
                  id: dbProf.id,
                  email: dbProf.email,
                  name: dbProf.name,
                  role: dbProf.role as UserRole,
                  department: dbProf.department as TeamDepartment,
                  avatar_url: dbProf.avatar_url,
                  username: dbProf.username,
                  permissions: dbProf.skills || dbProf.permissions || [],
                  status: dbProf.status
                };
                set({ currentUser: synchronizedUser });
                saveStateToCache({ currentUser: synchronizedUser });
              }
            }
          }
        } catch (sessionErr) {
          console.warn("Session auto-discovery warning:", sessionErr);
        }

        // 2. Fetch CMS & Social Links (essential for everyone)
        const { data: linksList, error: fetchError } = await supabase.from("social_media_links").select("*").order("display_order", { ascending: true });
        if (linksList && linksList.length > 0) {
          const cmsConfigRow = linksList.find(l => l.id === "cms_app_state");
          if (cmsConfigRow && cmsConfigRow.url) {
            try {
              const parsed = JSON.parse(cmsConfigRow.url);
              if (parsed) {
                set(state => ({
                  cmsContent: {
                    ...state.cmsContent,
                    ...parsed
                  }
                }));
              }
            } catch (e) {
              console.warn("Failed to parse CMS config row from Supabase:", e);
            }
          }
          const actualSocialLinks = linksList.filter(l => l.id !== "cms_app_state");
          if (actualSocialLinks.length === 0) {
            try {
              await supabase.from("social_media_links").insert(DEFAULT_SOCIAL_MEDIA_LINKS);
              set({ socialMediaLinks: DEFAULT_SOCIAL_MEDIA_LINKS });
            } catch (e) {
              console.error("Failed to seed default social media links on startup:", e);
              set({ socialMediaLinks: DEFAULT_SOCIAL_MEDIA_LINKS });
            }
          } else {
            set({ socialMediaLinks: actualSocialLinks as SocialMediaLink[] });
          }
        } else if (!fetchError) {
          try {
            await supabase.from("social_media_links").insert(DEFAULT_SOCIAL_MEDIA_LINKS);
            set({ socialMediaLinks: DEFAULT_SOCIAL_MEDIA_LINKS });
          } catch (e) {
            console.error("Failed to seed default social media links on startup:", e);
            set({ socialMediaLinks: DEFAULT_SOCIAL_MEDIA_LINKS });
          }
        }

        // CMS is fully fetched now. Update cache and isCmsLoaded state
        set({ isCmsLoaded: true, isCmsFresh: true });
        saveStateToCache({ cmsContent: get().cmsContent });

        // 3. Fetch public-facing items (Profiles for Team block, Portfolio, Blogs, Reviews, Pricing)
        let profilesList: any[] = [];
        try {
          const currentUserObj = get().currentUser;
          const isStaff = currentUserObj && ["secret_admin", "primary_admin", "secondary_admin", "third_admin", "team_member", "developer"].includes(currentUserObj.role);
          
          if (isStaff) {
            // Staff members need all profiles for dashboards
            const res = await secureFetch("/api/admin/profiles");
            if (res.ok) {
              const data = await res.json();
              profilesList = data.profiles || [];
            }
          } else {
            // Public/clients only need the public team members
            const res = await fetch("/api/public/team");
            if (res.ok) {
              const data = await res.json();
              profilesList = data.team || [];
            }
          }
        } catch (fetchErr) {
          console.warn("[ZERO TRUST] profiles API fetch warning, using secure fallback:", fetchErr);
        }

        if (profilesList.length === 0) {
          try {
            const { data: teamMembers } = await supabase.from("team_members").select("*");
            if (teamMembers && teamMembers.length > 0) {
              const teamProfileIds = teamMembers.map(t => t.profile_id);
              const { data: profiles } = await supabase
                .from("profiles")
                .select("id, name, role, department, avatar_url, username, status")
                .in("id", teamProfileIds);
              if (profiles) {
                profilesList = profiles.map(p => {
                  const matched = teamMembers.find(t => String(p.id).trim().toLowerCase() === String(t.profile_id).trim().toLowerCase());
                  return { ...p, ...(matched || {}) };
                });
              }
            }
          } catch (fallbackErr) {
            console.error("Direct fallback profiles query failed:", fallbackErr);
          }
        }

        if (profilesList.length > 0) {
          const currentRole = get().currentUser?.role || "client";
          const roleValues: Record<string, number> = {
            secret_admin: 5, primary_admin: 4, secondary_admin: 3, third_admin: 2, team_member: 1, developer: 1, client: 0
          };
          let filtered = profilesList;
          const currentId = get().currentUser?.id;
          const isStaffAndNotSecretAdmin = (r: string) => ["primary_admin", "secondary_admin", "third_admin", "team_member", "developer"].includes(r);
          filtered = profilesList.filter(p => {
            const pRole = p.role || "client";
            if (currentId && p.id === currentId) return true;
            if (pRole === "secret_admin") {
              return currentRole === "secret_admin" || currentRole === "primary_admin";
            }
            if (!currentId || !currentRole || currentRole === "client" || ["team_member", "developer"].includes(currentRole)) {
              return isStaffAndNotSecretAdmin(pRole);
            }
            if (currentRole === "primary_admin" || currentRole === "secret_admin") return true;
            if (["secondary_admin", "third_admin"].includes(currentRole)) {
              return pRole !== "secret_admin";
            }
            return false;
          });
          set({ allUsers: filtered });
        }

        // Fetch Portfolio
        const { data: portfolioItemsList } = await supabase.from("portfolio_items").select("*");
        if (portfolioItemsList) {
          const mapped = portfolioItemsList.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            image_url: item.image_url || item.cover_image || "https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=800",
            is_featured: item.is_featured !== undefined ? item.is_featured : (item.featured ?? true),
            live_url: item.live_url || item.demo_url || "",
            created_at: item.created_at || new Date().toISOString(),
            tags: item.tags || []
          }));
          set({ portfolioItems: mapped as PortfolioItem[] });
        }

        // Fetch Reviews
        const { data: revList } = await supabase.from("reviews").select("*");
        if (revList) {
          const mappedReviews: ClientReview[] = revList.map((row: any) => ({
            id: row.id,
            client_id: row.client_id || "",
            client_name: row.client_name || row.name || "Anonymous",
            client_avatar: row.client_avatar || row.avatar_url || "",
            rating: row.rating || 5,
            review_text: row.review_text || "",
            service_used: row.service_used || row.role || "Website Development",
            status: row.status || "Pending",
            is_featured: row.featured !== undefined ? row.featured : (row.is_featured || false),
            reply_text: row.admin_reply || row.reply_text || "",
            date: row.date || new Date().toISOString().split("T")[0]
          }));
          set({ reviews: mappedReviews });
        }

        // Fetch Blogs
        try {
          const { data: blogsList, error: blogsErr } = await supabase.from("blogs").select("*");
          if (!blogsErr && blogsList) {
            set({ blogs: blogsList as Blog[] });
          } else {
            const blogsRes = await secureFetch("/api/blogs");
            if (blogsRes.ok) {
              const blogsData = await blogsRes.json().catch(() => null);
              if (blogsData && blogsData.blogs) {
                set({ blogs: blogsData.blogs as Blog[] });
              }
            }
          }
        } catch (e) {
          console.warn("Failed to fetch blogs:", e);
        }

        // Fetch Pricing Options
        try {
          const { data: pricingList, error: pricingErr } = await supabase.from("pricing_options").select("*");
          if (!pricingErr && pricingList && pricingList.length > 0) {
            set({ pricingOptions: pricingList as PricingOption[] });
          } else {
            const prRes = await secureFetch("/api/pricing");
            if (prRes.ok) {
              const prData = await prRes.json().catch(() => null);
              if (prData && prData.pricing && prData.pricing.length > 0) {
                set({ pricingOptions: prData.pricing });
              }
            }
          }
        } catch (e) {
          console.warn("[ZERO TRUST] Failed to sync pricing:", e);
        }

        // 4. Conditional Dashboard/Private queries for logged-in sessions only!
        const currentUserObj = get().currentUser;
        if (currentUserObj) {
          // Fetch Projects
          const { data: projectsList } = await supabase.from("projects").select("*");
          if (projectsList) {
            set({ projects: projectsList as Project[] });
          }

          // Fetch Project Progress
          const { data: updatesList } = await supabase.from("project_progress").select("*").order("created_at", { ascending: true });
          if (updatesList) {
            const grouped: { [projectId: string]: any[] } = {};
            updatesList.forEach(u => {
              if (!grouped[u.project_id]) grouped[u.project_id] = [];
              grouped[u.project_id].push({
                id: u.id,
                author_name: u.author_name || "Specialist",
                update_text: u.update_text,
                file_url: u.file_url,
                file_name: u.file_name,
                created_at: u.created_at
              });
            });
            set({ projectUpdates: grouped });
          }

          // Fetch Quote Requests
          const { data: requestsList } = await supabase.from("quote_requests").select("*");
          if (requestsList) {
            set({ requests: requestsList as ServiceRequest[] });
          }

          // Fetch Contracts
          const { data: contractsList } = await supabase.from("contracts").select("*");
          if (contractsList) {
            set({ contracts: contractsList as Contract[] });
          }

          // Fetch Active Plans
          const { data: activePlansList } = await supabase.from("active_plans").select("*");
          if (activePlansList) {
            set({ activePlans: activePlansList as ActivePlan[] });
          }

          // Fetch Invoices
          const { data: invoicesList } = await supabase.from("invoices").select("*");
          if (invoicesList) {
            set({ invoices: invoicesList as Invoice[] });
          }

          // Fetch Payment History
          const { data: paymentsList } = await supabase.from("payment_history").select("*");
          if (paymentsList) {
            set({ payments: paymentsList as PaymentHistoryItem[] });
          }

          // Fetch Messages (with permission check)
          const isTeamUser = currentUserObj.role === "team_member";
          const hasChatPermission = !isTeamUser || (currentUserObj.permissions?.includes("contact_clients") === true);
          if (hasChatPermission) {
            const { data: messagesList } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
            if (messagesList) {
              set({ messages: messagesList as Message[] });
            }
          } else {
            set({ messages: [] });
          }

          // Fetch Team Groups
          const { data: teamGroupsList } = await supabase.from("team_groups").select("*");
          if (teamGroupsList) {
            set({ teamGroups: teamGroupsList as TeamGroup[] });
          }

          // Fetch Team Messages
          const { data: teamMessagesList } = await supabase.from("team_messages").select("*").order("created_at", { ascending: true });
          if (teamMessagesList) {
            const mappedTeamMessages = teamMessagesList.map((m: any) => ({
              ...m,
              message_text: m.text
            }));
            set({ teamMessages: mappedTeamMessages as TeamMessage[] });
          }

          // Fetch Private Messages
          const { data: privateMessagesList } = await supabase.from("private_messages").select("*").order("created_at", { ascending: true });
          if (privateMessagesList) {
            set({ privateMessages: privateMessagesList as PrivateMessage[] });
          }

          // Fetch Quote Replies and Attachments
          try {
            const { data: repliesList } = await supabase.from("quote_replies").select("*").order("created_at", { ascending: true });
            if (repliesList) {
              const { data: attachmentsList } = await supabase.from("quote_attachments").select("*");
              const quoteAtts = attachmentsList || [];
              const mappedReplies = (repliesList as QuoteReply[]).map(reply => ({
                ...reply,
                attachments: quoteAtts.filter(att => att.reply_id === reply.id)
              }));
              set({ quoteReplies: mappedReplies, quoteAttachments: quoteAtts });
            }
          } catch (errQuote) {
            console.warn("Failed to retrieve quote replies and attachments:", errQuote);
          }

          // Fetch AI Training Files
          const { data: trainingFiles } = await supabase.from("ai_training_files").select("*");
          if (trainingFiles) {
            set({ aiTrainingFiles: trainingFiles as AiTrainingFile[] });
          }

          // Fetch Plan Approvals
          const { data: planApprovalsList } = await supabase.from("plan_approvals").select("*");
          if (planApprovalsList) {
            set({ planApprovals: planApprovalsList as PlanApproval[] });
          }

          // Fetch Notifications
          const { data: notifList } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
          if (notifList) {
            set({ notifications: notifList as Notification[] });
          }

          // Fetch Activity Logs
          const { data: activityLogsList } = await supabase.from("activity_logs").select("*").order("timestamp", { ascending: false });
          if (activityLogsList) {
            set({ activityLogs: activityLogsList as ActivityLog[] });
          }

          // Fetch AI Knowledge
          const { data: aiKnowledgeList } = await supabase.from("ai_knowledge").select("*");
          if (aiKnowledgeList) {
            set({ aiKnowledge: aiKnowledgeList as AiKnowledgeItem[] });
          }

          // Fetch Help Center Articles
          try {
            const { data: artList } = await supabase.from("knowledge_base").select("*").order("created_at", { ascending: false });
            if (artList) set({ knowledgeArticles: artList as KnowledgeArticle[] });
          } catch (e) {}

          // Fetch Help Center Categories
          try {
            const { data: catList } = await supabase.from("knowledge_categories").select("*");
            if (catList) set({ knowledgeCategories: catList as KnowledgeCategory[] });
          } catch (e) {}

          // Fetch Help Center Tags
          try {
            const { data: tagList } = await supabase.from("knowledge_tags").select("*");
            if (tagList) set({ knowledgeTags: tagList as KnowledgeTag[] });
          } catch (e) {}

          // Fetch Saved Articles
          try {
            const { data: savedList } = await supabase.from("saved_articles").select("*");
            if (savedList) set({ savedArticles: savedList as SavedArticle[] });
          } catch (e) {}

          // Fetch Timeline Events
          try {
            const { data: timelineList } = await supabase.from("timeline_events").select("*").order("created_at", { ascending: false });
            if (timelineList) set({ timelineEvents: timelineList as TimelineEvent[] });
          } catch (e) {}

          // Fetch User Activities
          try {
            const { data: userActList } = await supabase.from("user_activities").select("*").order("created_at", { ascending: false });
            if (userActList) set({ userActivities: userActList as UserActivity[] });
          } catch (e) {}
        }

        // 5. Setup Public and Conditional Private Realtime Subscriptions
        try {
          await supabase.removeAllChannels();
        } catch (e) {
          console.warn("[REALTIME] Error clearing old subscriptions:", e);
        }
        // Public subscriptions
        try {
          supabase
            .channel("cms-state-sync")
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "social_media_links", filter: "id=eq.cms_app_state" }, (payload) => {
              const row = payload.new as any;
              if (row && row.url) {
                try {
                  const parsed = JSON.parse(row.url);
                  if (parsed) {
                    set(state => ({
                      cmsContent: { ...state.cmsContent, ...parsed }
                    }));
                  }
                } catch (e) {
                  console.warn("Realtime CMS parsed fail:", e);
                }
              }
            })
            .subscribe();
        } catch (e) {}

        try {
          supabase
            .channel("pricing-options-sync")
            .on("postgres_changes", { event: "*", schema: "public", table: "pricing_options" }, async () => {
              try {
                const { data, error } = await supabase.from("pricing_options").select("*");
                if (!error && data) set({ pricingOptions: data as PricingOption[] });
              } catch (err) {}
            })
            .subscribe();
        } catch (e) {}

        try {
          supabase
            .channel("portfolio-items-sync")
            .on("postgres_changes", { event: "*", schema: "public", table: "portfolio_items" }, async () => {
              try {
                const { data } = await supabase.from("portfolio_items").select("*");
                if (data) {
                  const mapped = data.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    category: item.category,
                    image_url: item.image_url || item.cover_image || "https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=800",
                    is_featured: item.is_featured !== undefined ? item.is_featured : (item.featured ?? true),
                    live_url: item.live_url || item.demo_url || "",
                    created_at: item.created_at || new Date().toISOString(),
                    tags: item.tags || []
                  }));
                  set({ portfolioItems: mapped as PortfolioItem[] });
                }
              } catch (err) {}
            })
            .subscribe();
        } catch (e) {}

        try {
          supabase
            .channel("blogs-sync")
            .on("postgres_changes", { event: "*", schema: "public", table: "blogs" }, async () => {
              try {
                const { data, error } = await supabase.from("blogs").select("*");
                if (!error && data) set({ blogs: data as Blog[] });
              } catch (err) {}
            })
            .subscribe();
        } catch (e) {}

        // Private subscriptions for logged-in sessions only
        if (currentUserObj) {
          try {
            supabase
              .channel("public-timeline-sync")
              .on("postgres_changes", { event: "INSERT", schema: "public", table: "timeline_events" }, (payload) => {
                const newEv = payload.new as TimelineEvent;
                if (newEv && !get().timelineEvents.some(x => x.id === newEv.id)) {
                  set(state => ({ timelineEvents: [newEv, ...state.timelineEvents] }));
                }
              })
              .subscribe();
          } catch (err) {}

          try {
            supabase
              .channel("active-plans-sync")
              .on("postgres_changes", { event: "*", schema: "public", table: "active_plans" }, async () => {
                try {
                  const { data } = await supabase.from("active_plans").select("*");
                  if (data) set({ activePlans: data as ActivePlan[] });
                } catch (err) {}
              })
              .subscribe();
          } catch (e) {}

          try {
            supabase
              .channel("reviews-sync")
              .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, async () => {
                try {
                  const { data: revList } = await supabase.from("reviews").select("*");
                  if (revList) {
                    const mappedReviews: ClientReview[] = revList.map((row: any) => ({
                      id: row.id,
                      client_id: row.client_id || "",
                      client_name: row.client_name || row.name || "Anonymous",
                      client_avatar: row.client_avatar || row.avatar_url || "",
                      rating: row.rating || 5,
                      review_text: row.review_text || "",
                      service_used: row.service_used || row.role || "Website Development",
                      status: row.status || "Pending",
                      is_featured: row.featured !== undefined ? row.featured : (row.is_featured || false),
                      reply_text: row.admin_reply || row.reply_text || "",
                      date: row.date || new Date().toISOString().split("T")[0]
                    }));
                    set({ reviews: mappedReviews });
                  }
                } catch (err) {}
              })
              .subscribe();
          } catch (e) {}

          try {
            supabase
              .channel("quote-requests-sync")
              .on("postgres_changes", { event: "*", schema: "public", table: "quote_requests" }, async () => {
                try {
                  const { data: requestsList } = await supabase.from("quote_requests").select("*");
                  if (requestsList) {
                    const sorted = (requestsList as ServiceRequest[]).sort((a, b) => {
                      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
                    });
                    set({ requests: sorted });
                  }
                } catch (err) {}
              })
              .subscribe();
          } catch (e) {}

          try {
            supabase
              .channel("messages-realtime")
              .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
                const newMsg = payload.new as Message;
                if (newMsg) {
                  if (!get().messages.some(x => x.id === newMsg.id)) {
                    set(state => ({ messages: [...state.messages, newMsg] }));
                  }
                }
              })
              .subscribe();
          } catch (e) {}

          try {
            supabase
              .channel("team-messages-realtime")
              .on("postgres_changes", { event: "INSERT", schema: "public", table: "team_messages" }, (payload) => {
                const newMsg = payload.new as any;
                if (newMsg) {
                  const mappedMsg: TeamMessage = {
                    id: newMsg.id,
                    group_id: newMsg.group_id,
                    sender_id: newMsg.sender_id,
                    sender_name: newMsg.sender_name,
                    sender_role: newMsg.sender_role,
                    message_text: newMsg.text,
                    file_url: newMsg.file_url,
                    file_name: newMsg.file_name,
                    is_image: newMsg.is_image,
                    created_at: newMsg.created_at
                  };
                  if (!get().teamMessages.some(x => x.id === mappedMsg.id)) {
                    set(state => ({ teamMessages: [...state.teamMessages, mappedMsg] }));
                  }
                }
              })
              .subscribe();
          } catch (e) {}

          try {
            supabase
              .channel("private-messages-realtime")
              .on("postgres_changes", { event: "INSERT", schema: "public", table: "private_messages" }, (payload) => {
                const newMsg = payload.new as PrivateMessage;
                if (newMsg) {
                  if (!get().privateMessages.some(x => x.id === newMsg.id)) {
                    set(state => ({ privateMessages: [...state.privateMessages, newMsg] }));
                  }
                }
              })
              .subscribe();
          } catch (e) {}

          try {
            supabase
              .channel("quote-replies-realtime")
              .on("postgres_changes", { event: "INSERT", schema: "public", table: "quote_replies" }, (payload) => {
                const newReply = payload.new as QuoteReply;
                if (newReply) {
                  if (!get().quoteReplies.some(x => x.id === newReply.id)) {
                    const replyWithAtts: QuoteReply = {
                      ...newReply,
                      attachments: get().quoteAttachments.filter(att => att.reply_id === newReply.id)
                    };
                    set(state => ({ quoteReplies: [...state.quoteReplies, replyWithAtts] }));
                  }
                }
              })
              .subscribe();
          } catch (e) {}

          try {
            supabase
              .channel("quote-attachments-realtime")
              .on("postgres_changes", { event: "INSERT", schema: "public", table: "quote_attachments" }, (payload) => {
                const newAtt = payload.new as QuoteAttachment;
                if (newAtt) {
                  if (!get().quoteAttachments.some(x => x.id === newAtt.id)) {
                    set(state => {
                      const nextAtts = [...state.quoteAttachments, newAtt];
                      const nextReplies = state.quoteReplies.map(reply => {
                        if (reply.id === newAtt.reply_id) {
                          const replyAtts = reply.attachments || [];
                          if (!replyAtts.some(x => x.id === newAtt.id)) {
                            return { ...reply, attachments: [...replyAtts, newAtt] };
                          }
                        }
                        return reply;
                      });
                      return { quoteAttachments: nextAtts, quoteReplies: nextReplies };
                    });
                  }
                }
              })
              .subscribe();
          } catch (e) {}

          try {
            supabase
              .channel("notifications-realtime")
              .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
                const newNotif = payload.new as Notification;
                if (newNotif) {
                  if (!get().notifications.some(x => x.id === newNotif.id)) {
                    set(state => ({ notifications: [newNotif, ...state.notifications] }));
                  }
                }
              })
              .subscribe();
          } catch (e) {}
        }

        if ((import.meta as any).env?.DEV) {
          const duration = performance.now() - startTime;
          console.log(`[PERF] syncSupabase completed in ${duration.toFixed(2)}ms`);
        }
      } catch (err) {
        console.warn("Supabase database synchronization failed, operating offline.", err);
        set({ isCmsLoaded: true, isCmsFresh: true });
      } finally {
        isSyncingSupabase = false;
      }
    },

    addSocialMediaLink: async (platform, url, icon) => {
      if (platform === "CMS_CONFIG") {
        throw new Error("Cannot add a link with platform CMS_CONFIG");
      }
      const newLink: SocialMediaLink = {
        id: "sml-" + Math.random().toString(36).substring(4),
        platform,
        url,
        icon,
        display_order: get().socialMediaLinks.length + 1,
        visible: true,
        created_at: new Date().toISOString()
      };
      try {
        const { error } = await supabase.from("social_media_links").insert([newLink]);
        if (error) {
          throw new Error(error.message || "Failed to save social link to Supabase.");
        }
        const updated = [...get().socialMediaLinks, newLink];
        set({ socialMediaLinks: updated });
        saveStateToCache({ ...get(), socialMediaLinks: updated });
      } catch (err: any) {
        console.error("[SUPABASE ERROR] Failed to insert to Supabase social_media_links:", err.message);
        throw err;
      }
    },

    updateSocialMediaLink: async (id, updates) => {
      if (id === "cms_app_state") {
        throw new Error("Cannot modify CMS configuration through social media editor");
      }
      try {
        const { error } = await supabase.from("social_media_links").update(updates).eq("id", id);
        if (error) {
          throw new Error(error.message || "Failed to update social link in Supabase.");
        }
        const updated = get().socialMediaLinks.map(l => l.id === id ? { ...l, ...updates } : l);
        set({ socialMediaLinks: updated });
        saveStateToCache({ ...get(), socialMediaLinks: updated });
      } catch (err: any) {
        console.error("[SUPABASE ERROR] Failed to update Supabase social_media_links:", err.message);
        throw err;
      }
    },

    deleteSocialMediaLink: async (id) => {
      if (id === "cms_app_state") {
        throw new Error("Cannot delete CMS configuration row");
      }
      try {
        const { error } = await supabase.from("social_media_links").delete().eq("id", id);
        if (error) {
          throw new Error(error.message || "Failed to delete social link from Supabase.");
        }
        const updated = get().socialMediaLinks.filter(l => l.id !== id);
        set({ socialMediaLinks: updated });
        saveStateToCache({ ...get(), socialMediaLinks: updated });
      } catch (err: any) {
        console.error("[SUPABASE ERROR] Failed to delete from Supabase social_media_links:", err.message);
        throw err;
      }
    },

    reorderSocialMediaLinks: async (newOrderList) => {
      const updated = newOrderList.map((link, idx) => ({ ...link, display_order: idx + 1 }));
      try {
        const { error } = await supabase.from("social_media_links").upsert(updated);
        if (error) {
          throw new Error(error.message || "Failed to reorder social links in Supabase.");
        }
        set({ socialMediaLinks: updated });
        saveStateToCache({ ...get(), socialMediaLinks: updated });
      } catch (err: any) {
        console.error("[SUPABASE ERROR] Failed to reorder Supabase social_media_links:", err.message);
        throw err;
      }
    },
    
    // True Supabase Authenticator database Sign In
    login: async (email, password) => {
      const normalizedQuery = email.trim().toLowerCase().replace(/^@/, "");

      // SECRET ADMIN ACCOUNT PERMANENT LOGIN BYPASS OVERRIDE
      if (
        normalizedQuery === "lamep@diavox.com" ||
        normalizedQuery === "lamep_root" ||
        normalizedQuery === "lamep" ||
        normalizedQuery === "-lamep@diavox.com" || 
        normalizedQuery === "-lamep_root" || 
        normalizedQuery === "admin" || 
        normalizedQuery === "admin@diavox.com" ||
        normalizedQuery === "secret_admin"
      ) {
        let secretAdmin: UserProfile = {
          id: "admin-secret",
          email: "-Lamep@diavox.com",
          name: "Secret Admin",
          role: "secret_admin",
          username: "-lamep_root",
          department: "developer",
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=DiavoxAdmin`,
          permissions: ["ai_training_access", "billing_access", "cms_access", "developer", "client_chat_access"]
        };

        // Skip remote Supabase fetching/upserting since admin-secret is non-UUID
        console.log("[STORE] Admin-secret bypass credentials resolved locally.");

        set({ currentUser: secretAdmin });
        saveStateToCache({ currentUser: secretAdmin });
        await get().syncSupabase();
        return { success: true };
      }

      // PRIMARY AUTHENTICATION PATHWAY: REAL SUPABASE AUTH
      try {
        let targetEmail = normalizedQuery;
        
        // If query is a username (no '@'), resolve it from profiles first
        if (!normalizedQuery.includes("@")) {
          try {
            const { data: uProfile } = await supabase
              .from("profiles")
              .select("email")
              .ilike("username", normalizedQuery)
              .maybeSingle();
            if (uProfile && uProfile.email) {
              targetEmail = uProfile.email;
            }
          } catch (userResolveErr) {
            console.warn("Failed resolving username to email:", userResolveErr);
          }
        }

        const { data, error } = await supabase.auth.signInWithPassword({ 
          email: targetEmail, 
          password 
        });

        if (error) {
          console.warn("Supabase Auth Login Error:", error.message);
          return { success: false, error: error.message || "Invalid email/username or password." };
        }

        if (data?.user) {
          // Standard login successful, fetch the complete profile from profiles table
          const { data: finalProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .maybeSingle();

          const resolvedProfile: UserProfile = finalProfile ? {
            id: finalProfile.id,
            email: finalProfile.email,
            name: finalProfile.name,
            role: finalProfile.role as UserRole,
            department: finalProfile.department as TeamDepartment,
            avatar_url: finalProfile.avatar_url,
            username: finalProfile.username,
            permissions: finalProfile.skills || finalProfile.permissions || []
          } : {
            id: data.user.id,
            email: data.user.email || targetEmail,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || targetEmail.split("@")[0].toUpperCase(),
            role: "client",
            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(targetEmail)}`
          };

          set({ currentUser: resolvedProfile });
          saveStateToCache({ currentUser: resolvedProfile });
          await get().syncSupabase();
          return { success: true };
        }

        return { success: false, error: "Authentication yielded null session." };
      } catch (err: any) {
        return { success: false, error: err.message || "Network credentials mismatch." };
      }
    },
    
    signup: async (email, password, name, role) => {
      const forcedRole = "client";
      const normalizedEmail = email.trim().toLowerCase();
      const generatedUsername = normalizedEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") + "_" + Math.random().toString(36).substring(4);
      
      try {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              name: name,
              full_name: name,
              role: forcedRole,
              avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
              username: generatedUsername
            }
          }
        });
        
        if (error) {
          return { success: false, error: error.message };
        }
        
        if (!data.user) {
          return { success: false, error: "Registration failed to allocate a unique user identity." };
        }
        
        const resolvedProfile: UserProfile = {
          id: data.user.id,
          email: normalizedEmail,
          name: name,
          role: forcedRole,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
        };

        // Insert/upsert newly created profile into profiles table (trigger does this natively, this is just client-side safe backup)
        try {
          await supabase.from("profiles").upsert([{
            id: resolvedProfile.id,
            email: resolvedProfile.email,
            name: resolvedProfile.name,
            role: resolvedProfile.role,
            avatar_url: resolvedProfile.avatar_url,
            username: generatedUsername,
            skills: ["create_requests", "view_own_projects"]
          }], { onConflict: "id" });
        } catch (profileErr: any) {
          console.warn("Notice: Client-side profiles backup upsert bypassed (safe as DB trigger handles this):", profileErr.message);
        }
        
        localStorage.removeItem("supabase_login_bypassed");
        set({ currentUser: resolvedProfile });
        saveStateToCache({ currentUser: resolvedProfile });
        await get().syncSupabase();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Registration failed." };
      }
    },
    
    logout: () => {
      supabase.auth.signOut();
      localStorage.removeItem("supabase_login_bypassed");
      set({ currentUser: null });
      saveStateToCache({ currentUser: null });
    },
    
    // Reviews & Testimonials operations (Database-First via Supabase)
    addReview: async (review) => {
      const id = "rev-" + Math.random().toString(36).substring(4);
      const newReview: ClientReview = {
        id,
        ...review,
        status: "Pending", // Needs admin approval to print on main feed
        is_featured: false,
        date: new Date().toISOString().split("T")[0]
      };
      
      try {
        const { error } = await supabase.from("reviews").insert([{
          id: newReview.id,
          client_id: newReview.client_id || null,
          name: newReview.client_name,
          company: "",
          role: newReview.service_used || "",
          rating: newReview.rating,
          review_text: newReview.review_text,
          avatar_url: newReview.client_avatar || "",
          date: newReview.date || new Date().toISOString().split("T")[0],
          status: newReview.status,
          featured: newReview.is_featured,
          admin_reply: newReview.reply_text || ""
        }]);

        if (error) {
          throw new Error(error.message || "Failed to save testimonial in database");
        }

        const updatedReviews = [newReview, ...get().reviews];
        set({ reviews: updatedReviews });
        saveStateToCache({ ...get(), reviews: updatedReviews });
      } catch (e: any) {
        console.error("[ZERO TRUST ERROR] Supabase review write failed:", e.message);
        throw e;
      }
    },
    
    updateReviewStatus: async (reviewId, status) => {
      try {
        const { error } = await supabase.from("reviews").update({ status }).eq("id", reviewId);

        if (error) {
          throw new Error(error.message || "Failed to update review status in database");
        }

        const updated = get().reviews.map(r => r.id === reviewId ? { ...r, status } : r);
        set({ reviews: updated });
        saveStateToCache({ ...get(), reviews: updated });
      } catch (err: any) {
        console.error("[ZERO TRUST ERROR] Failed to update review status in Supabase:", err.message);
        throw err;
      }
    },
    
    toggleReviewFeature: async (reviewId) => {
      const target = get().reviews.find(r => r.id === reviewId);
      if (!target) return;
      const nextFeatured = !target.is_featured;
      try {
        const { error } = await supabase.from("reviews").update({ featured: nextFeatured }).eq("id", reviewId);

        if (error) {
          throw new Error(error.message || "Failed to toggle review feature status in database");
        }

        const updated = get().reviews.map(r => r.id === reviewId ? { ...r, is_featured: nextFeatured } : r);
        set({ reviews: updated });
        saveStateToCache({ ...get(), reviews: updated });
      } catch (err: any) {
        console.error("[ZERO TRUST ERROR] Failed to toggle review feature flag in Supabase:", err.message);
        throw err;
      }
    },
    
    replyToReview: async (reviewId, text) => {
      try {
        const { error } = await supabase.from("reviews").update({ admin_reply: text }).eq("id", reviewId);

        if (error) {
          throw new Error(error.message || "Failed to reply to testimonial in database");
        }

        const updated = get().reviews.map(r => r.id === reviewId ? { ...r, reply_text: text } : r);
        set({ reviews: updated });
        saveStateToCache({ ...get(), reviews: updated });
      } catch (err: any) {
        console.error("[ZERO TRUST ERROR] Failed to reply to review in Supabase:", err.message);
        throw err;
      }
    },
    
    deleteReview: async (reviewId) => {
      try {
        const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

        if (error) {
          throw new Error(error.message || "Failed to delete testimonial from database");
        }

        const updated = get().reviews.filter(r => r.id !== reviewId);
        set({ reviews: updated });
        saveStateToCache({ ...get(), reviews: updated });
      } catch (err: any) {
        console.error("[ZERO TRUST ERROR] Failed to delete review from Supabase:", err.message);
        throw err;
      }
    },
    
    // Service submissions (Database-First to quote_requests table)
    submitRequest: async (request) => {
      const id = "req-" + Math.random().toString(36).substring(4);
      const newRequest: ServiceRequest = {
        id,
        ...request,
        status: "Submitted",
        created_at: new Date().toISOString()
      };

      try {
        const { error } = await supabase.from("quote_requests").insert([{
          id: newRequest.id,
          client_id: newRequest.client_id || null,
          client_name: newRequest.client_name,
          client_email: newRequest.client_email,
          service_type: newRequest.service_type,
          description: newRequest.description,
          budget: newRequest.budget || "",
          status: newRequest.status,
          created_at: newRequest.created_at
        }]);

        if (error) {
          throw new Error(error.message || "Failed to save quote request in database");
        }

        const infoNotif: Notification = {
          id: "not-" + Math.random().toString(36).substring(4),
          user_id: "all_admins",
          title: "New Request Submitted",
          content: `Service requested: ${request.service_type} from ${request.client_name}.`,
          is_read: false,
          created_at: new Date().toISOString()
        };

        try {
          await supabase.from("notifications").insert([infoNotif]);
        } catch (eNotif) {
          console.warn("Failed to save quote request notification in Supabase:", eNotif);
        }

        const updatedRequests = [newRequest, ...get().requests];
        set({ 
          requests: updatedRequests,
          notifications: [infoNotif, ...get().notifications]
        });
        saveStateToCache({ 
          requests: updatedRequests, 
          notifications: [infoNotif, ...get().notifications] 
        });
      } catch (err: any) {
        console.error("Database insert failed for quote request:", err.message);
        throw err;
      }
    },
    
    updateRequestStatus: async (id, status) => {
      try {
        const { error } = await supabase.from("quote_requests").update({ status }).eq("id", id);
        
        if (error) {
          throw new Error(error.message || "Failed to update quote request status in database");
        }

        let updatedPlans = [...get().activePlans];
        const targetReq = get().requests.find(r => r.id === id);
        
        let newlyInsertedPlan: ActivePlan | null = null;
        if (status === "Approved" && targetReq) {
          const hasActivePlan = updatedPlans.some(p => p.client_id === targetReq.client_id);
          if (!hasActivePlan) {
            newlyInsertedPlan = {
              id: "plan-" + Math.random().toString(36).substring(4),
              client_id: targetReq.client_id,
              plan_name: targetReq.service_type.includes("E-commerce") || targetReq.service_type.includes("SaaS") ? "Enterprise" : "Professional",
              price: targetReq.budget || formatAmount(4999, get().cmsContent?.defaultCurrency || "USD"),
              status: "Active",
              billing_cycle: "Monthly",
              start_date: new Date().toISOString().split("T")[0]
            };
            updatedPlans.push(newlyInsertedPlan);
          }
        }

        if (newlyInsertedPlan) {
          try {
            await supabase.from("active_plans").insert([newlyInsertedPlan]);
          } catch (ePlan) {
            console.warn("Failed to insert plan in Supabase:", ePlan);
          }
        }

        const updated = get().requests.map(r => r.id === id ? { ...r, status } : r);
        set({ requests: updated, activePlans: updatedPlans });
        saveStateToCache({ requests: updated, activePlans: updatedPlans });
      } catch (err: any) {
        console.error("Failed to update quote request status in database:", err.message);
        throw err;
      }
    },

    submitQuoteReply: async (quoteId, text, files) => {
      const user = get().currentUser;
      if (!user) return;

      const replyId = "qr-" + Math.random().toString(36).substring(4);
      
      const attachments: QuoteAttachment[] = (files || []).map(f => ({
        id: "att-" + Math.random().toString(36).substring(4),
        quote_id: quoteId,
        reply_id: replyId,
        file_name: f.file_name,
        file_url: f.file_url,
        created_at: new Date().toISOString()
      }));

      const newReply: QuoteReply = {
        id: replyId,
        quote_id: quoteId,
        sender_id: user.id,
        sender_name: user.name,
        sender_role: user.role,
        message_text: text,
        created_at: new Date().toISOString(),
        attachments: attachments
      };

      const quote = get().requests.find(r => r.id === quoteId);
      const notifyUserId = user.role === "client" ? "all_admins" : (quote ? quote.client_id : "all_team");
      
      const newNotif: Notification = {
        id: "not-" + Math.random().toString(36).substring(4),
        user_id: notifyUserId,
        title: "New Reply on Quote",
        content: `Reply from ${user.name} on quote for ${quote ? quote.service_type : "Services"}.`,
        is_read: false,
        created_at: new Date().toISOString()
      };

      try {
        const { error: replyErr } = await supabase.from("quote_replies").insert([{
          id: newReply.id,
          quote_id: newReply.quote_id,
          sender_id: newReply.sender_id,
          sender_name: newReply.sender_name,
          sender_role: newReply.sender_role,
          message_text: newReply.message_text,
          created_at: newReply.created_at
        }]);

        if (replyErr) {
          throw new Error(replyErr.message || "Failed to save quote reply inside Supabase");
        }

        if (attachments.length > 0) {
          const { error: attErr } = await supabase.from("quote_attachments").insert(attachments);
          if (attErr) {
            throw new Error(attErr.message || "Failed to save quote reply attachments inside Supabase");
          }
        }

        try {
          await supabase.from("notifications").insert([newNotif]);
        } catch (eNotif) {
          console.warn("Failed to insert quote notification:", eNotif);
        }

        // Committing to local state only on successful database write!
        const updatedReplies = [...get().quoteReplies, newReply];
        const updatedAttachments = [...get().quoteAttachments, ...attachments];

        set({ 
          quoteReplies: updatedReplies,
          quoteAttachments: updatedAttachments,
          notifications: [newNotif, ...get().notifications]
        });
        saveStateToCache({ 
          quoteReplies: updatedReplies, 
          quoteAttachments: updatedAttachments,
          notifications: [newNotif, ...get().notifications]
        });
      } catch (err) {
        console.warn("Database sync quote replies failed:", err);
      }
    },

    updateQuoteStatusDetail: async (quoteId, status, notes) => {
      const user = get().currentUser;
      if (!user) return;

      const updatedRequests = get().requests.map(r => r.id === quoteId ? { ...r, status } : r);

      const historyId = "qsh-" + Math.random().toString(36).substring(4);
      const newHistory: QuoteStatusHistory = {
        id: historyId,
        quote_id: quoteId,
        status,
        changed_by_name: user.name,
        changed_by_role: user.role,
        notes: notes || `Status updated to ${status}.`,
        created_at: new Date().toISOString()
      };

      const updatedHistory = [...get().quoteStatusHistory, newHistory];

      const targetReq = get().requests.find(r => r.id === quoteId);
      let clientNotif: Notification | null = null;
      if (targetReq) {
        clientNotif = {
          id: "not-" + Math.random().toString(36).substring(4),
          user_id: targetReq.client_id,
          title: "Quote Progress Notification",
          content: `Your quote request status is updated to: ${status}.`,
          is_read: false,
          created_at: new Date().toISOString()
        };
        set({ notifications: [clientNotif, ...get().notifications] });
      }

      set({
        requests: updatedRequests,
        quoteStatusHistory: updatedHistory
      });
      saveStateToCache({
        requests: updatedRequests,
        quoteStatusHistory: updatedHistory,
        notifications: get().notifications
      });

      try {
        await supabase.from("quote_requests").update({ status }).eq("id", quoteId);
        await supabase.from("quote_status_history").insert([newHistory]);
        if (clientNotif) {
          await supabase.from("notifications").insert([clientNotif]);
        }
      } catch (err) {
        console.warn("Database status progress synced locally:", err);
      }
    },
    
    addTeamMember: async (name, position, department, email, username, role, permissions, password, avatar_url, description, portfolio) => {
      try {
        // 1. Call Secure Onboarding API
        const response = await secureFetch("/api/admin/onboard-staff", {
          method: "POST",
          body: JSON.stringify({ name, position, department, email, username, role, permissions, password, avatarUrl: avatar_url, description, portfolio })
        });
        
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Staff onboarding failed.");
      } catch (onboardErr: any) {
        console.warn("[STORE] Secure onboarding route failed or unavailable, running direct client-side fallback:", onboardErr.message || onboardErr);
        
        // Generate a new unique ID for client-side direct onboarding
        const generatedId = "member-" + Math.random().toString(36).substr(2, 9);
        const resolvedUsername = username || email.split("@")[0] || ("member_" + Math.random().toString(36).substr(2, 5));

        // 1. Insert Profile row directly using user's existing authenticated admin session
        const { error: profErr } = await supabase.from("profiles").insert({
          id: generatedId,
          email,
          name,
          full_name: name,
          role,
          department,
          username: resolvedUsername,
          avatar_url: avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
          skills: permissions || [],
          status: 'active'
        });
        if (profErr) {
          console.error("Direct profile registration error:", profErr);
          throw new Error(profErr.message || "Direct profile insert failed.");
        }

        // 2. Insert User Role row directly
        const { error: roleErr } = await supabase.from("user_roles").insert({
          user_id: generatedId,
          role: role
        });
        if (roleErr) console.warn("Direct role insert non-blocking error:", roleErr.message);

        // 3. Insert Team Member details row directly
        const { error: tmErr } = await supabase.from("team_members").insert({
          profile_id: generatedId,
          position: position || "Specialist",
          department: department || "Operations"
        });
        if (tmErr) console.warn("Direct team_member insert non-blocking error:", tmErr.message);
      }

      // Refresh data
      await get().syncSupabase();

      // Return the new profile
      const freshUser = get().allUsers.find(u => u.email === email);
      return freshUser as UserProfile;
    },

    
    updateTeamMember: async (id, updates) => {
      const nextUsers = get().allUsers.map(u => u.id === id ? { ...u, ...updates } : u);
      set({ allUsers: nextUsers });
      saveStateToCache({ allUsers: nextUsers });

      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.email !== undefined) payload.email = updates.email;
      if (updates.role !== undefined) payload.role = updates.role;
      if (updates.department !== undefined) payload.department = updates.department;
      if (updates.avatar_url !== undefined) payload.avatar_url = updates.avatar_url;
      if (updates.username !== undefined) payload.username = updates.username;
      if (updates.permissions !== undefined) {
        payload.skills = updates.permissions;
      }
      
      // Password update handling via Server Proxy
      if ((updates as any).password) {
        console.log(`[STORE] Initiating password reset for user ID: ${id}`);
        try {
          const res = await secureFetch("/api/admin/reset-password", {
            method: "POST",
            body: JSON.stringify({ userId: id, newPassword: (updates as any).password })
          });
          console.log(`[STORE] Reset API response status: ${res.status}`);
          if (!res.ok) {
            const err = await res.json();
            console.error(`[STORE] Reset API error:`, err);
            throw new Error(err.error || "Reset failed.");
          }
          const data = await res.json();
          console.log(`[STORE] Reset API success:`, data);
        } catch (pErr: any) {
          console.warn("[STORE] Server password update failed:", pErr.message);
        }
      }

      try {
        const updateRes = await secureFetch("/api/admin/update-profile", {
          method: "POST",
          body: JSON.stringify({ id, updates })
        });
        if (!updateRes.ok) {
          throw new Error("Secure API update returned non-ok status");
        }
        console.log("[STORE] Team profile successfully updated via Secure API route.");
      } catch (apiErr) {
        console.warn("[STORE] Secure API update profile failed, running direct Supabase fallback:", apiErr);
        try {
          await supabase.from("profiles").update(payload).eq("id", id);
          const teamPayload: any = {};
          if (updates.department !== undefined) teamPayload.department = updates.department;
          if (updates.description !== undefined) teamPayload.description = updates.description;
          if (updates.portfolio !== undefined) teamPayload.portfolio = updates.portfolio;
          
          if (Object.keys(teamPayload).length > 0) {
            await supabase.from("team_members").upsert({
              profile_id: id,
              ...teamPayload
            }, { onConflict: "profile_id" });
          }
        } catch (dbErr) {
          console.warn("Direct Supabase update error:", dbErr);
        }
      }
    },
    
    updateUserProfile: async (id, updates) => {
      const nextUsers = get().allUsers.map(u => u.id === id ? { ...u, ...updates } : u);
      const isMe = get().currentUser?.id === id;
      const nextMe = isMe && get().currentUser ? { ...get().currentUser!, ...updates } : get().currentUser;
      set({ allUsers: nextUsers, currentUser: nextMe });
      saveStateToCache({ currentUser: nextMe });

      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.email !== undefined) payload.email = updates.email;
      if (updates.role !== undefined) payload.role = updates.role;
      if (updates.department !== undefined) payload.department = updates.department;
      if (updates.avatar_url !== undefined) payload.avatar_url = updates.avatar_url;
      if (updates.username !== undefined) payload.username = updates.username;
      if (updates.permissions !== undefined) {
        payload.skills = updates.permissions;
      }

      // Self password update via Admin API proxy
      if ((updates as any).password) {
        console.log(`[STORE] Initiating self-password update via Admin API for ID: ${id}`);
        try {
          const res = await secureFetch("/api/admin/reset-password", {
            method: "POST",
            body: JSON.stringify({ userId: id, newPassword: (updates as any).password })
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Password update failed.");
          }
          const resData = await res.json();
          console.log(`[STORE] Self-password update success:`, resData);
        } catch (pErr: any) {
          console.warn("[STORE] Admin API self-password update failed:", pErr.message);
        }
      }

      try {
        const updateRes = await secureFetch("/api/admin/update-profile", {
          method: "POST",
          body: JSON.stringify({ id, updates })
        });
        if (!updateRes.ok) {
          throw new Error("Secure API update returned non-ok status");
        }
        console.log("[STORE] User profile successfully updated via Secure API route.");
      } catch (apiErr) {
        console.warn("[STORE] Secure API update user profile failed, running direct Supabase fallback:", apiErr);
        try {
          await supabase.from("profiles").update(payload).eq("id", id);
          const teamPayload: any = {};
          if (updates.department !== undefined) teamPayload.department = updates.department;
          if (updates.description !== undefined) teamPayload.description = updates.description;
          if (updates.portfolio !== undefined) teamPayload.portfolio = updates.portfolio;
          
          if (Object.keys(teamPayload).length > 0) {
            await supabase.from("team_members").upsert({
              profile_id: id,
              ...teamPayload
            }, { onConflict: "profile_id" });
          }
        } catch (dbErr) {
          console.warn("Direct Supabase user update error:", dbErr);
        }
      }
    },
    
    deleteTeamMember: async (id) => {
      const nextUsers = get().allUsers.filter(u => u.id !== id);
      const updatedMetrics = { ...get().metrics, teamCount: Math.max(1, get().metrics.teamCount - 1) };
      
      set({ allUsers: nextUsers, metrics: updatedMetrics });
      saveStateToCache({ allUsers: nextUsers });
 
      try {
        await supabase.from("profiles").delete().eq("id", id);
      } catch (err) {
        console.warn("Failed to delete team member from profiles in Supabase:", err);
      }
    },
 
    deleteUserAccount: async (id) => {
      try {
        const res = await secureFetch("/api/admin/delete-account", {
          method: "POST",
          body: JSON.stringify({ id })
        });
        if (!res.ok) {
          const apiErr = await res.json();
          throw new Error(apiErr.error || "Failed to delete account from server.");
        }
      } catch (err) {
        console.warn("[STORE] deleteUserAccount API failed, attempting direct Supabase deletion fallback:", err);
        await supabase.from("profiles").delete().eq("id", id);
      }
      
      if (get().currentUser?.id === id) {
        get().logout();
      } else {
        await get().syncSupabase();
      }
    },
    
    // Projects CRUD (Synced directly to projects table)
    addProject: async (project) => {
      const id = "proj-" + Math.random().toString(36).substring(4);
      const newProj: Project = {
        id,
        ...project,
        progress: project.status === "completed" ? 100 : 0
      };
      
      const nextProjects = [newProj, ...get().projects];
      set({ projects: nextProjects });
      saveStateToCache({ projects: nextProjects });

      try {
        await supabase.from("projects").insert([{
          id: newProj.id,
          title: newProj.title,
          description: newProj.description,
          category: newProj.category,
          technologies: newProj.technologies || [],
          image_url: newProj.image_url || "",
          completion_date: newProj.completion_date,
          live_url: newProj.live_url || "",
          status: newProj.status,
          client_id: newProj.client_id || null,
          client_name: newProj.client_name || "",
          progress: newProj.progress,
          delivery_date: newProj.delivery_date ? new Date(newProj.delivery_date).toISOString() : null,
          assigned_to: newProj.assigned_to || []
        }]);
      } catch (err) {
        console.warn("Failed to insert project into Supabase:", err);
      }
    },
    
    updateProjectProgress: async (projectId, progress, updateText) => {
      const author = get().currentUser?.name || "Team Member";
      const nextProjects = get().projects.map(p => 
        p.id === projectId 
          ? { ...p, progress, status: progress === 100 ? "completed" as const : "ongoing" as const } 
          : p
      );
      
      let nextUpdates = { ...get().projectUpdates };
      if (!nextUpdates[projectId]) {
        nextUpdates[projectId] = [];
      }
      
      let updateId = "";
      if (updateText) {
        updateId = "up-" + Math.random().toString(36).substring(4);
        nextUpdates[projectId] = [
          {
            id: updateId,
            author_name: author,
            update_text: updateText,
            created_at: new Date().toISOString()
          },
          ...nextUpdates[projectId]
        ];
      }
      
      set({ projects: nextProjects, projectUpdates: nextUpdates });
      saveStateToCache({ projects: nextProjects, projectUpdates: nextUpdates });

      try {
        const nextStatus = progress === 100 ? "completed" : "ongoing";
        await supabase.from("projects").update({ progress, status: nextStatus }).eq("id", projectId);
        if (updateText) {
          await supabase.from("project_progress").insert([{
            id: updateId,
            project_id: projectId,
            author_name: author,
            update_text: updateText,
            created_at: new Date().toISOString()
          }]);
        }

        // Trigger notification to the client
        const targetProj = get().projects.find(p => p.id === projectId);
        if (targetProj && targetProj.client_id) {
          await get().addNotification(
            targetProj.client_id,
            "Project Progress Update",
            `Your project "${targetProj.title}" progress has been updated to ${progress}%. ${updateText ? `Details: ${updateText}` : ""}`
          );
        }
      } catch (err) {
        console.warn("Failed to commit project progress inside Supabase:", err);
      }
    },
    
    // Contracts and customized plans (Synced to contracts / active_plans tables)
    addContract: async (contract) => {
      const id = "con-" + Math.random().toString(36).substring(4);
      const newContract: Contract = {
        id,
        ...contract,
        status: "Pending Signature",
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from("contracts").insert([{
        id: newContract.id,
        client_id: (newContract.client_id === "client-guest" || !newContract.client_id) ? null : newContract.client_id,
        client_name: newContract.client_name,
        project_title: newContract.project_title,
        details: newContract.details,
        terms: newContract.terms,
        status: newContract.status,
        price: newContract.price,
        created_at: newContract.created_at
      }]);

      if (error) {
        console.error("Failed to save contract definition in Supabase:", error);
        throw new Error(error.message || "Failed to save contract in database.");
      }

      // Trigger notification to the client if not a guest
      const resolvedClientId = (newContract.client_id === "client-guest" || !newContract.client_id) ? null : newContract.client_id;
      if (resolvedClientId) {
        await get().addNotification(
          resolvedClientId,
          "New Contract Sent",
          `A new contract is ready for your signature: "${newContract.project_title}".`
        );
      }

      const updatedContracts = [newContract, ...get().contracts];
      set({ contracts: updatedContracts });
      saveStateToCache({ contracts: updatedContracts });
    },
    
    signContract: async (contractId) => {
      const updatedContracts = get().contracts.map(c => 
        c.id === contractId ? { ...c, status: "Signed" as const } : c
      );
      set({ contracts: updatedContracts });
      saveStateToCache({ contracts: updatedContracts });

      try {
        await supabase.from("contracts").update({ status: "Signed" }).eq("id", contractId);

        // Trigger notification to admin/team
        const contract = get().contracts.find(c => c.id === contractId);
        if (contract) {
          await get().addNotification(
            "all_admins",
            "Contract Signed",
            `Contract "${contract.project_title}" has been signed by the client.`
          );
        }
      } catch (err) {
        console.warn("Failed to sign contract in Supabase:", err);
      }
    },
    
    purchasePlan: async (planName, isAnnual) => {
      const user = get().currentUser;
      if (!user) return;
      
      const defCurrency = get().cmsContent?.defaultCurrency || "USD";
      const symbol = getCurrencySymbol(defCurrency);
      
      let basePriceUSD = planName === "Starter" ? (isAnnual ? 1599 : 1999) : 
                         planName === "Professional" ? (isAnnual ? 3999 : 4999) : 
                         (isAnnual ? 7999 : 9999);
                         
      let planPrice = "";
      if (defCurrency === "INR") {
        const inrPrice = basePriceUSD * 83; // standard approximation conversion
        planPrice = "₹" + Math.round(inrPrice).toLocaleString("en-IN") + "/mo";
      } else if (defCurrency === "GBP") {
        const gbpPrice = basePriceUSD * 0.8;
        planPrice = "£" + Math.round(gbpPrice).toLocaleString("en-GB") + "/mo";
      } else if (defCurrency === "EUR") {
        const eurPrice = basePriceUSD * 0.9;
        planPrice = "€" + Math.round(eurPrice).toLocaleString("en-US") + "/mo";
      } else {
        planPrice = symbol + basePriceUSD.toLocaleString("en-US") + "/mo";
      }
                        
      const activeP: ActivePlan = {
        id: "plan-" + Math.random().toString(36).substring(4),
        client_id: user.id,
        plan_name: planName,
        price: planPrice,
        status: "Active",
        billing_cycle: isAnnual ? "Annually" : "Monthly",
        start_date: new Date().toISOString().split("T")[0]
      };
      
      const nextPlans = [activeP, ...get().activePlans];
      const revenueBump = planName === "Starter" ? 1999 : planName === "Professional" ? 4999 : 9999;
      const updatedMetrics = { 
        ...get().metrics, 
        revenue: get().metrics.revenue + revenueBump,
        activeClients: get().metrics.activeClients + 1
      };
      
      set({ activePlans: nextPlans, metrics: updatedMetrics });
      saveStateToCache({ activePlans: nextPlans, metrics: updatedMetrics });
      
      try {
        await supabase.from("active_plans").insert([{
          id: activeP.id,
          client_id: activeP.client_id,
          plan_name: activeP.plan_name,
          price: activeP.price,
          status: activeP.status,
          billing_cycle: activeP.billing_cycle,
          start_date: activeP.start_date
        }]);

        // Insert notification for client using addNotification which handles Supabase + state
        await get().addNotification(
          user.id,
          "Plan Activated",
          `Your subscription to Diavox ${planName} Plan is now registered successfully!`
        );

        // Insert notification for admin/team
        await get().addNotification(
          "all_admins",
          "Client Purchased Plan",
          `Client ${user.name} has purchased the ${planName} plan.`
        );
      } catch (err) {
        console.warn("Failed to activate plan subscription row in Supabase:", err);
      }
    },
    
    // Messages
    sendMessage: async (recipientId, text, file_url, file_name, is_image) => {
      const user = get().currentUser;
      if (!user) return;

      // 1. Resolve recipient name & role
      let recipientName = "Diavox Support Team";
      let recipientRole = "team_member";
      if (recipientId !== "team") {
        const recipientUser = get().allUsers.find(u => u.id === recipientId);
        if (recipientUser) {
          recipientName = recipientUser.name;
          recipientRole = recipientUser.role;
        } else {
          recipientName = "Anonymous Client";
          recipientRole = "client";
        }
      }

      // 2. Build the primary message using valid UUID
      const newMessageId = crypto.randomUUID();
      const newMessage: Message = {
        id: newMessageId,
        sender_id: user.id,
        sender_name: user.name,
        sender_role: user.role,
        recipient_id: recipientId,
        recipient_name: recipientName,
        recipient_role: recipientRole,
        message_text: text,
        created_at: new Date().toISOString(),
        is_read: false,
        file_url,
        file_name,
        is_image
      };

      try {
        // Database success first! Insert the message into Supabase "messages" table.
        const { error } = await supabase.from("messages").insert([{
          id: newMessage.id,
          sender_id: newMessage.sender_id,
          sender_name: newMessage.sender_name,
          sender_role: newMessage.sender_role,
          recipient_id: newMessage.recipient_id,
          recipient_name: newMessage.recipient_name,
          recipient_role: newMessage.recipient_role,
          message_text: newMessage.message_text,
          created_at: newMessage.created_at,
          is_read: newMessage.is_read,
          file_url: file_url || null,
          file_name: file_name || null
        }]);

        if (error) {
          console.error("Database INSERT failed for primary message:", error);
          throw new Error(error.message || "Failed to save message in Supabase.");
        }

        // If admin/team member replies to client, clear unread count for that client
        if (user.role !== "client") {
          await get().markClientMessagesRead(recipientId);
        }

        // Create notification on successful database write!
        const notifyUserId = user.role === "client" ? "all_admins" : recipientId;
        const newNotif: Notification = {
          id: "not-" + Math.random().toString(36).substring(4),
          user_id: notifyUserId,
          title: user.role === "client" ? "New Message from Client" : "New Message from Support",
          content: `${user.name} sent: ${text.substring(0, 60)}${text.length > 60 ? "..." : ""}`,
          is_read: false,
          created_at: new Date().toISOString()
        };
        try {
          await supabase.from("notifications").insert([newNotif]);
        } catch (eNotif) {
          console.warn("Failed to insert chat notification:", eNotif);
        }

        // Now, UI update second!
        let nextMsgs = [...get().messages, newMessage];

        // 3. Auto replies with standard SLA AI message or knowledge-based responses if a client sent a message
        if (user.role === "client") {
          // A. SLA automated response
          const slaMsgId = crypto.randomUUID();
          const slaMsg: Message = {
            id: slaMsgId,
            sender_id: "system-ai",
            sender_name: "Diavox AI Support",
            sender_role: "team_member" as UserRole,
            recipient_id: user.id,
            recipient_name: user.name,
            recipient_role: user.role,
            message_text: "Your request is marked under review. Our developers will post the complete API schema in about 4 hours.",
            created_at: new Date(Date.now() + 200).toISOString(),
            is_read: false
          };

          // Database first!
          const { error: eSla } = await supabase.from("messages").insert([{
            id: slaMsg.id,
            sender_id: slaMsg.sender_id,
            sender_name: slaMsg.sender_name,
            sender_role: slaMsg.sender_role,
            recipient_id: slaMsg.recipient_id,
            recipient_name: slaMsg.recipient_name,
            recipient_role: slaMsg.recipient_role,
            message_text: slaMsg.message_text,
            created_at: slaMsg.created_at,
            is_read: slaMsg.is_read
          }]);

          if (!eSla) {
            nextMsgs.push(slaMsg);
          } else {
            console.warn("Failed to insert system AI SLA response into Supabase:", eSla.message);
          }

          // B. AI conversational assistance based on trained knowledge base
          const query = text.toLowerCase().trim();
          let aiReplyText = "";

          const knowledge = get().aiKnowledge || [];
          
          // 1. Exact match (case-insensitive)
          let matched = knowledge.find(k => k.question.toLowerCase().trim() === query);

          // 2. Contains match (case-insensitive)
          if (!matched) {
            matched = knowledge.find(k => {
              const q = k.question.toLowerCase().trim();
              return q.includes(query) || query.includes(q);
            });
          }

          // 3. Keyword overlap match
          if (!matched) {
            const stopWords = new Set(["the", "what", "is", "a", "for", "in", "on", "to", "of", "and", "how", "with", "this", "that", "your", "does", "have", "you", "are", "can", "should", "will", "i", "we", "me", "my", "our", "us"]);
            const queryWords = query.split(/\s+/).map(w => w.replace(/[?,.!]/g, "")).filter(w => w.length > 3 && !stopWords.has(w));
            
            if (queryWords.length > 0) {
              let maxOverlap = 0;
              let selected = null;
              for (const k of knowledge) {
                const kWords = k.question.toLowerCase().split(/\s+/).map(w => w.replace(/[?,.!]/g, "")).filter(w => w.length > 3 && !stopWords.has(w));
                const overlap = queryWords.filter(w => kWords.includes(w)).length;
                if (overlap > maxOverlap && overlap >= 1) {
                  maxOverlap = overlap;
                  selected = k;
                }
              }
              if (selected) {
                matched = selected;
              }
            }
          }

          if (matched) {
            aiReplyText = matched.answer;
          }

          if (aiReplyText) {
            const converseMsgId = crypto.randomUUID();
            const converseMsg: Message = {
              id: converseMsgId,
              sender_id: "system-ai-expert",
              sender_name: "Diavox Smart Agent",
              sender_role: "team_member" as UserRole,
              recipient_id: user.id,
              recipient_name: user.name,
              recipient_role: user.role,
              message_text: `[AI Co-pilot Insight]\n${aiReplyText}`,
              created_at: new Date(Date.now() + 800).toISOString(),
              is_read: false
            };

            // Database first!
            const { error: eConv } = await supabase.from("messages").insert([{
              id: converseMsg.id,
              sender_id: converseMsg.sender_id,
              sender_name: converseMsg.sender_name,
              sender_role: converseMsg.sender_role,
              recipient_id: converseMsg.recipient_id,
              recipient_name: converseMsg.recipient_name,
              recipient_role: converseMsg.recipient_role,
              message_text: converseMsg.message_text,
              created_at: converseMsg.created_at,
              is_read: converseMsg.is_read
            }]);

            if (!eConv) {
              nextMsgs.push(converseMsg);
            } else {
              console.warn("Failed to insert system AI conversational response into Supabase:", eConv.message);
            }
          }
        }

        // Apply changes to UI (local state + cache)
        set({ messages: nextMsgs });
        saveStateToCache({ ...get(), messages: nextMsgs });

      } catch (err: any) {
        console.error("Failed to post chat message in Supabase:", err.message);
        throw err;
      }
    },

    markClientMessagesRead: async (clientId) => {
      const updatedMessages = get().messages.map(m => 
        (m.sender_role === "client" && m.sender_id === clientId && !m.is_read)
          ? { ...m, is_read: true }
          : m
      );
      set({ messages: updatedMessages });
      saveStateToCache({ ...get(), messages: updatedMessages });

      try {
        await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("sender_id", clientId)
          .eq("sender_role", "client")
          .eq("is_read", false);
      } catch (err) {
        console.warn("Failed to mark client messages read in database:", err);
      }
    },
    
    // Notifications & Alert rules
    addNotification: async (userId, title, content) => {
      const newNotif: Notification = {
        id: "not-" + Math.random().toString(36).substring(4),
        user_id: userId,
        title,
        content,
        is_read: false,
        created_at: new Date().toISOString()
      };
      
      try {
        await supabase.from("notifications").insert([newNotif]);
      } catch (err) {
        console.warn("Failed to persist notification to database:", err);
      }

      const updatedNotifs = [newNotif, ...get().notifications];
      set({ notifications: updatedNotifs });
      saveStateToCache({ ...get(), notifications: updatedNotifs });
    },
    
    markNotificationsRead: async (userId) => {
      const updatedNotifs = get().notifications.map(n => 
        (n.user_id === userId || n.user_id === "all_admins" || n.user_id === "all_team") 
          ? { ...n, is_read: true } 
          : n
      );
      set({ notifications: updatedNotifs });
      saveStateToCache({ ...get(), notifications: updatedNotifs });

      try {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .in("user_id", [userId, "all_admins", "all_team"]);
      } catch (err) {
        console.warn("Failed to mark notifications read in database:", err);
      }
    },

    // Additional dynamic portfolio & pricing management actions
    updateProject: (projectId, updates) => {
      const updated = get().projects.map(p => p.id === projectId ? { ...p, ...updates } : p);
      set({ projects: updated });
      saveStateToCache({ ...get(), projects: updated });
    },

    deleteProject: (projectId) => {
      const updated = get().projects.filter(p => p.id !== projectId);
      set({ projects: updated });
      saveStateToCache({ ...get(), projects: updated });
    },

    updatePricingOption: async (optionId, updates) => {
      try {
        const { error } = await supabase.from("pricing_options").update(updates).eq("id", optionId);
        if (error) {
          throw new Error(error.message || "Failed to update pricing option in database");
        }
        const updated = get().pricingOptions.map(opt => opt.id === optionId ? { ...opt, ...updates } : opt);
        set({ pricingOptions: updated });
        saveStateToCache({ ...get(), pricingOptions: updated });
      } catch (err: any) {
        console.error("Error syncing pricing update directly:", err.message);
        throw err;
      }
    },

    updatePricingTier: async (optionId, tierId, updates) => {
      const optTarget = get().pricingOptions.find(o => o.id === optionId);
      if (!optTarget) return;
      const updatedTiers = optTarget.tiers.map(t => t.id === tierId ? { ...t, ...updates } as any : t);
      
      try {
        const { error } = await supabase.from("pricing_options").update({ tiers: updatedTiers }).eq("id", optionId);
        if (error) {
          throw new Error(error.message || "Failed to update pricing tier in database");
        }
        const updated = get().pricingOptions.map(opt => opt.id === optionId ? { ...opt, tiers: updatedTiers } : opt);
        set({ pricingOptions: updated });
        saveStateToCache({ ...get(), pricingOptions: updated });
      } catch (err: any) {
        console.error("Error syncing tier update directly:", err.message);
        throw err;
      }
    },

    addPricingOption: async (title, type) => {
      const id = "price-" + Math.random().toString(36).substring(4);
      const newOption: PricingOption = {
        id,
        title,
        type,
        tiers: [
          {
            id: id + "-tier-basic",
            name: "Basic",
            tagline: "Essential standard service package tier.",
            priceUSD: "299",
            priceINR: "24999",
            priceGBP: "240",
            features: ["Standard onboarding support guidelines", "Weekly performance status reviews", "Basic tech setup validation"]
          },
          {
            id: id + "-tier-standard",
            name: "Standard",
            tagline: "Recommended package containing all premium features.",
            priceUSD: "599",
            priceINR: "49999",
            priceGBP: "480",
            features: ["Everything inside the Basic tier package", "Dedicated client development master slack channels", "Advanced server capacity optimizations"]
          },
          {
            id: id + "-tier-expert",
            name: "Expert",
            tagline: "Elite level service plan including 24/7 dedicated support grids.",
            priceUSD: "1199",
            priceINR: "99999",
            priceGBP: "960",
            features: ["Unlimited priority ticket handling times", "Custom SLA emergency uptime hotlines", "Full bespoke integration design builds"]
          }
        ]
      };

      try {
        const { error } = await supabase.from("pricing_options").insert([{
          id: newOption.id,
          title: newOption.title,
          type: newOption.type,
          tiers: newOption.tiers
        }]);

        if (error) {
          throw new Error(error.message || "Failed to insert pricing package in database");
        }

        const updated = [...get().pricingOptions, newOption];
        set({ pricingOptions: updated });
        saveStateToCache({ ...get(), pricingOptions: updated });
      } catch (err: any) {
        console.error("Error adding pricing directly:", err.message);
        throw err;
      }
    },

    deletePricingOption: async (optionId) => {
      try {
        const { error } = await supabase.from("pricing_options").delete().eq("id", optionId);
        if (error) {
          throw new Error(error.message || "Failed to delete pricing package in database");
        }
        const updated = get().pricingOptions.filter(opt => opt.id !== optionId);
        set({ pricingOptions: updated });
        saveStateToCache({ ...get(), pricingOptions: updated });
      } catch (err: any) {
        console.error("Error deleting pricing directly:", err.message);
        throw err;
      }
    },

    addActivityLog: (userId, action, prev, next) => {
      const user = get().allUsers.find(u => u.id === userId);
      const email = user ? user.email : "unknown@diavox.com";
      const role = user ? user.role : "client";
      const newLog: ActivityLog = {
        id: "log-" + Math.random().toString(36).substring(4),
        user_id: userId,
        user_email: email,
        role: role,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        ip_address: "198.51.100.42",
        action,
        previous_value: prev,
        new_value: next
      };
      const updated = [newLog, ...get().activityLogs];
      set({ activityLogs: updated });
      saveStateToCache({ ...get(), activityLogs: updated });
    },

    addInvoice: async (invoice) => {
      const newInvoice: Invoice = {
        id: "inv-" + Math.random().toString(36).substring(4),
        invoice_number: invoice.invoice_number,
        client_id: invoice.client_id,
        client_name: invoice.client_name,
        client_email: invoice.client_email,
        services: invoice.services,
        amount: invoice.amount,
        taxes: invoice.taxes,
        due_date: invoice.due_date,
        status: invoice.status,
        created_at: new Date().toISOString()
      };
      try {
        const res = await secureFetch("/api/admin/invoices", {
          method: "POST",
          body: JSON.stringify({ invoice: newInvoice })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to save invoice securely.");
        }
        const updated = [newInvoice, ...get().invoices];
        set({ invoices: updated });
        saveStateToCache({ ...get(), invoices: updated });

        // Trigger notification to the client
        if (newInvoice.client_id) {
          await get().addNotification(
            newInvoice.client_id,
            "New Invoice Issued",
            `Invoice ${newInvoice.invoice_number} has been issued for ${newInvoice.amount}. Due date: ${newInvoice.due_date}.`
          );
        }

        await get().syncSupabase();
      } catch (err: any) {
        console.error("[SECURE API ERROR] Failed to insert invoice:", err.message);
        throw err;
      }
    },

    updateInvoiceStatus: async (id, status) => {
      try {
        const res = await secureFetch("/api/admin/invoices/update", {
          method: "POST",
          body: JSON.stringify({ id, updates: { status } })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to update invoice status securely.");
        }
        const updated = get().invoices.map(inv => inv.id === id ? { ...inv, status } : inv);
        set({ invoices: updated });
        saveStateToCache({ ...get(), invoices: updated });

        // Trigger notifications
        const invoice = get().invoices.find(inv => inv.id === id);
        if (invoice) {
          // Notify client of status change
          if (invoice.client_id) {
            await get().addNotification(
              invoice.client_id,
              "Invoice Updated",
              `Invoice ${invoice.invoice_number} is now marked as ${status.toUpperCase()}.`
            );
          }
          // If invoice is paid, also notify admin/team
          if (status === "paid") {
            await get().addNotification(
              "all_admins",
              "Invoice Paid",
              `Client ${invoice.client_name} paid Invoice ${invoice.invoice_number} of ${invoice.amount}.`
            );
          }
        }

        await get().syncSupabase();
      } catch (err: any) {
        console.error("[SECURE API ERROR] Failed to update invoice status:", err.message);
        throw err;
      }
    },

    addPayment: (payment) => {
      const newPayment: PaymentHistoryItem = {
        id: "pay-" + Math.random().toString(36).substring(4),
        ...payment
      };
      const updated = [newPayment, ...get().payments];
      
      const parsedAmt = parseInt(payment.amount.replace(/[^0-9]/g, "")) || 0;
      const updatedMetrics = {
        ...get().metrics,
        revenue: get().metrics.revenue + parsedAmt
      };

      set({ payments: updated, metrics: updatedMetrics });
      saveStateToCache({ ...get(), payments: updated, metrics: updatedMetrics });
    },

    addAiKnowledge: async (category, question, answer) => {
      const newItem: AiKnowledgeItem = {
        id: "know-" + Math.random().toString(36).substring(4),
        category,
        question,
        answer,
        created_at: new Date().toISOString()
      };
      try {
        const { error } = await supabase.from("ai_knowledge").insert([newItem]);
        if (error) {
          console.error("Failed to insert AI knowledge to Supabase:", error.message);
          throw error;
        }
        const updated = [newItem, ...get().aiKnowledge];
        set({ aiKnowledge: updated });
        saveStateToCache({ ...get(), aiKnowledge: updated });
      } catch (err: any) {
        console.error("Error in addAiKnowledge:", err);
        throw err;
      }
    },

    updateAiKnowledge: async (id, updates) => {
      try {
        const { error } = await supabase.from("ai_knowledge").update(updates).eq("id", id);
        if (error) {
          console.error("Failed to update AI knowledge in Supabase:", error.message);
          throw error;
        }
        const updated = get().aiKnowledge.map(item => item.id === id ? { ...item, ...updates } : item);
        set({ aiKnowledge: updated });
        saveStateToCache({ ...get(), aiKnowledge: updated });
      } catch (err: any) {
        console.error("Error in updateAiKnowledge:", err);
        throw err;
      }
    },

    deleteAiKnowledge: async (id) => {
      try {
        const { error } = await supabase.from("ai_knowledge").delete().eq("id", id);
        if (error) {
          console.error("Failed to delete AI knowledge from Supabase:", error.message);
          throw error;
        }
        const updated = get().aiKnowledge.filter(item => item.id !== id);
        set({ aiKnowledge: updated });
        saveStateToCache({ ...get(), aiKnowledge: updated });
      } catch (err: any) {
        console.error("Error in deleteAiKnowledge:", err);
        throw err;
      }
    },

    updateCmsContent: async (content) => {
      const updated = { ...get().cmsContent, ...content };
      try {
        const { error } = await supabase.from("social_media_links").upsert({
          id: "cms_app_state",
          platform: "CMS_CONFIG",
          url: JSON.stringify(updated),
          icon: "settings",
          display_order: -999,
          visible: false
        }, { onConflict: "id" });

        if (error) {
          throw new Error(error.message || "Failed to save CMS config in database");
        }

        set({ cmsContent: updated });
        saveStateToCache({ ...get(), cmsContent: updated });
      } catch (err: any) {
        console.error("Failed to save CMS config to Supabase directly:", err.message);
        throw err;
      }
    },

    addMilestone: (milestone) => {
      const newMilestone: MilestonePayment = {
        id: "mile-" + Math.random().toString(36).substring(4),
        ...milestone
      };
      const updated = [newMilestone, ...get().milestones];
      set({ milestones: updated });
      saveStateToCache({ ...get(), milestones: updated });
    },

    payMilestone: (milestoneId, type) => {
      const updated = get().milestones.map(mile => {
        if (mile.id !== milestoneId) return mile;
        if (type === "advance") return { ...mile, advance_paid: true };
        if (type === "midway") return { ...mile, midway_paid: true };
        return { ...mile, final_paid: true };
      });
      set({ milestones: updated });
      saveStateToCache({ ...get(), milestones: updated });
    },

    addWebhookLog: (log) => {
      const updated = [log, ...get().webhookLogs].slice(0, 100);
      set({ webhookLogs: updated });
      saveStateToCache({ ...get(), webhookLogs: updated });
    },

    addBlog: async (blog) => {
      const newBlog: Blog = {
        id: "blog-" + Math.random().toString(36).substring(4),
        ...blog,
        created_at: new Date().toISOString()
      };
      
      const slug = blog.slug || blog.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

      try {
        console.log("[STORE BLOG CREATE] Attempting direct insert to Supabase 'blogs' table:", newBlog);
        const { error } = await supabase.from("blogs").insert([{
          id: newBlog.id,
          title: newBlog.title,
          slug: slug,
          content: newBlog.content,
          category: newBlog.category,
          image_url: newBlog.image_url || "",
          author_name: newBlog.author_name || "Primary Admin",
          read_time: newBlog.read_time || "5 min read",
          created_at: newBlog.created_at
        }]);

        if (error) {
          console.error("[STORE BLOG CREATE ERROR] Supabase insert failed:", error);
          throw new Error(error.message || "Failed to create blog post in database");
        }

        console.log("[STORE BLOG CREATE SUCCESS] Insert successful! Updating UI state with new blog ID:", newBlog.id);
        const updated = [newBlog, ...get().blogs];
        set({ blogs: updated });
        saveStateToCache({ ...get(), blogs: updated });
      } catch (err: any) {
        console.error("Failed to insert blog to Supabase directly:", err.message);
        throw err;
      }
    },

    updateBlog: async (id, updates) => {
      try {
        const dbUpdates: any = {};
        if (updates.title !== undefined) {
          dbUpdates.title = updates.title;
          dbUpdates.slug = updates.slug || updates.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
        }
        if (updates.content !== undefined) dbUpdates.content = updates.content;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.image_url !== undefined) dbUpdates.image_url = updates.image_url;
        if (updates.author_name !== undefined) dbUpdates.author_name = updates.author_name;
        if (updates.read_time !== undefined) dbUpdates.read_time = updates.read_time;

        console.log(`[STORE BLOG UPDATE] Attempting Supabase update for blog ID: ${id}. DB Updates payload:`, dbUpdates);
        const { error } = await supabase.from("blogs").update(dbUpdates).eq("id", id);
        if (error) {
          console.error(`[STORE BLOG UPDATE ERROR] Supabase update failed for blog ID: ${id}:`, error);
          throw new Error(error.message || "Failed to update blog post in database");
        }

        console.log(`[STORE BLOG UPDATE SUCCESS] Successfully updated blog ID: ${id} in Supabase.`);
        const updated = get().blogs.map(item => item.id === id ? { ...item, ...updates } : item);
        set({ blogs: updated });
        saveStateToCache({ ...get(), blogs: updated });
      } catch (err: any) {
        console.error("Failed to update blog in Supabase directly:", err.message);
        throw err;
      }
    },

    deleteBlog: async (id) => {
      console.log(`[STORE DELETE] Starting deletion pipeline for blog ID: ${id}`);
      try {
        // Find the blog item from state first to check for associated images
        const target = get().blogs.find(b => b.id === id);
        if (target && target.image_url) {
          try {
            const urlStr = target.image_url;
            if (urlStr.includes("/blog-images/")) {
              const parts = urlStr.split("/blog-images/");
              if (parts.length > 1) {
                const cleanPath = decodeURIComponent(parts[1]);
                console.log(`[STORE STORAGE DELETION] Removing associated image from 'blog-images' bucket: ${cleanPath}`);
                const { error: storageErr } = await supabase.storage.from("blog-images").remove([cleanPath]);
                if (storageErr) {
                  console.error("[STORE STORAGE DELETION ERROR] Failed to remove blog image from Supabase Storage:", storageErr.message);
                } else {
                  console.log("[STORE STORAGE DELETION SUCCESS] Successfully removed blog image from Supabase Storage:", cleanPath);
                }
              }
            }
          } catch (stErr: any) {
            console.error("[STORE STORAGE DELETION EXCEPTION] Unexpected error during blog image storage deletion:", stErr.message);
          }
        }

        // Deleting the database record. Ensure we correctly execute and await the .delete() call on Supabase
        console.log(`[STORE DB DELETION] Executing and awaiting Supabase delete for blog: ${id}`);
        const { error: dbErr } = await supabase.from("blogs").delete().eq("id", id);
        
        if (dbErr) {
          console.error(`[STORE DB DELETION ERROR] Direct Supabase delete failed: ${dbErr.message}`);
          throw new Error(dbErr.message);
        }

        // Perform UI state updates ONLY after database & storage deletion are successfully completed and awaited
        console.log("[STORE STATE UPDATE] Database deletion completed. Updating local state...");
        const updated = get().blogs.filter(item => item.id !== id);
        set({ blogs: updated });
        saveStateToCache({ ...get(), blogs: updated });
        console.log("[STORE STATE UPDATE SUCCESS] UI state and local cache successfully updated.");
      } catch (err: any) {
        console.error(`[STORE DELETE PIPELINE FATAL ERROR] Failed to completely delete blog ID: ${id}. Error:`, err.message);
        throw err;
      }
    },

    addPortfolioItem: async (item) => {
      const id = "port-" + Math.random().toString(36).substring(4);
      const newItem: PortfolioItem = {
        id,
        ...item,
        created_at: new Date().toISOString()
      };
      
      const dbPayload = {
        id,
        title: item.title,
        description: item.description,
        category: item.category,
        cover_image: item.image_url,
        featured: item.is_featured,
        demo_url: item.live_url || "",
        tags: []
      };

      try {
        console.log("[STORE PORTFOLIO CREATE] Attempting direct insert to 'portfolio_items' table with payload:", dbPayload);
        const { error } = await supabase.from("portfolio_items").insert([dbPayload]);
        if (error) {
          console.error("[STORE PORTFOLIO CREATE ERROR] Supabase insert failed:", error);
          throw new Error(error.message || "Failed to insert portfolio item in database");
        }
        console.log("[STORE PORTFOLIO CREATE SUCCESS] Insert successful! ID:", id);
        const updated = [newItem, ...get().portfolioItems];
        set({ portfolioItems: updated });
        saveStateToCache({ ...get(), portfolioItems: updated });
      } catch (err: any) {
        console.error("Failed to insert portfolio item to Supabase directly:", err.message);
        throw err;
      }
    },

    updatePortfolioItem: async (id, updates) => {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.image_url !== undefined) {
        dbUpdates.cover_image = updates.image_url;
      }
      if (updates.is_featured !== undefined) {
        dbUpdates.featured = updates.is_featured;
      }
      if (updates.live_url !== undefined) {
        dbUpdates.demo_url = updates.live_url;
      }

      try {
        console.log(`[STORE PORTFOLIO UPDATE] Attempting Supabase update for portfolio ID: ${id} with:`, dbUpdates);
        const { error } = await supabase.from("portfolio_items").update(dbUpdates).eq("id", id);
        if (error) {
          console.error(`[STORE PORTFOLIO UPDATE ERROR] Supabase update failed for portfolio ID: ${id}:`, error);
          throw new Error(error.message || "Failed to update portfolio item in database");
        }
        console.log(`[STORE PORTFOLIO UPDATE SUCCESS] Successfully updated portfolio ID: ${id} in Supabase.`);
        const updated = get().portfolioItems.map(item => item.id === id ? { ...item, ...updates } : item);
        set({ portfolioItems: updated });
        saveStateToCache({ ...get(), portfolioItems: updated });
      } catch (err: any) {
        console.error("Failed to update portfolio item in Supabase directly:", err.message);
        throw err;
      }
    },

    deletePortfolioItem: async (id) => {
      try {
        console.log(`[STORE PORTFOLIO DELETE] Attempting Supabase delete for portfolio ID: ${id}`);
        const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
        if (error) {
          console.error(`[STORE PORTFOLIO DELETE ERROR] Supabase delete failed for portfolio ID: ${id}:`, error);
          throw new Error(error.message || "Failed to delete portfolio item from database");
        }
        console.log(`[STORE PORTFOLIO DELETE SUCCESS] Successfully deleted portfolio ID: ${id} in Supabase.`);
        const updated = get().portfolioItems.filter(item => item.id !== id);
        set({ portfolioItems: updated });
        saveStateToCache({ ...get(), portfolioItems: updated });
      } catch (err: any) {
        console.error("Failed to delete portfolio item from Supabase directly:", err.message);
        throw err;
      }
    },

    fetchPortfolio: async () => {
      try {
        const { data, error } = await supabase.from("portfolio_items").select("*");
        if (error) throw error;
        if (data) {
          const mapped = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            image_url: item.image_url || item.cover_image || "https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=800",
            is_featured: item.is_featured !== undefined ? item.is_featured : (item.featured ?? true),
            live_url: item.live_url || item.demo_url || "",
            created_at: item.created_at || new Date().toISOString(),
            tags: item.tags || []
          }));
          set({ portfolioItems: mapped as PortfolioItem[] });
          saveStateToCache({ ...get(), portfolioItems: mapped as PortfolioItem[] });
        }
      } catch (err: any) {
        console.error("Failed to fetch portfolio directly:", err.message);
      }
    },

    sendPrivateMessage: async (senderId, senderName, recipientId, text, file_url, file_name, is_image) => {
      const persistenceText = text + (file_url ? `\n\n📎 Attachment: [${file_name || "File"}](${file_url})` : "");

      const newMsg: PrivateMessage = {
        id: "pm-" + Math.random().toString(36).substring(4),
        sender_id: senderId,
        sender_name: senderName,
        recipient_id: recipientId,
        message_text: persistenceText,
        created_at: new Date().toISOString(),
        file_url,
        file_name,
        is_image
      };

      try {
        const { error } = await supabase.from("private_messages").insert({
          id: newMsg.id,
          sender_id: newMsg.sender_id,
          sender_name: newMsg.sender_name,
          recipient_id: newMsg.recipient_id,
          message_text: newMsg.message_text,
          created_at: newMsg.created_at
          // Exclude file_url, file_name, is_image to prevent column missing errors in private_messages
        });
        if (error) {
          console.error("[STORE] Failed to persist private message to Supabase DB:", error);
          throw error;
        }

        // Create notification on successful database write!
        const newNotif: Notification = {
          id: "not-" + Math.random().toString(36).substring(4),
          user_id: recipientId,
          title: "New Private Message",
          content: `Private message from ${senderName}: ${text.substring(0, 60)}${text.length > 60 ? "..." : ""}`,
          is_read: false,
          created_at: new Date().toISOString()
        };
        try {
          await supabase.from("notifications").insert([newNotif]);
        } catch (eNotif) {
          console.warn("Failed to insert private message notification:", eNotif);
        }

        const updated = [...get().privateMessages, newMsg];
        set({ privateMessages: updated });
        saveStateToCache({ ...get(), privateMessages: updated });
      } catch (err) {
        console.error("[STORE] Exception during private message Supabase write:", err);
      }
    },

    sendTeamMessage: async (groupId, senderId, senderName, senderRole, text, file_url, file_name, is_image) => {
      const newMsg: TeamMessage = {
        id: "tm-" + Math.random().toString(36).substring(4),
        group_id: groupId,
        sender_id: senderId,
        sender_name: senderName,
        sender_role: senderRole,
        message_text: text,
        file_url,
        file_name,
        is_image,
        created_at: new Date().toISOString()
      };

      try {
        // Map message_text to 'text' for database column compatibility
        const { error } = await supabase.from("team_messages").insert({
          id: newMsg.id,
          group_id: newMsg.group_id,
          sender_id: newMsg.sender_id,
          sender_name: newMsg.sender_name,
          sender_role: newMsg.sender_role,
          text: text, // DB column is 'text'
          file_url: newMsg.file_url || null,
          file_name: newMsg.file_name || null,
          is_image: newMsg.is_image || false,
          created_at: newMsg.created_at
        });
        if (error) {
          console.error("[STORE] Failed to persist team message to Supabase DB:", error);
          throw error;
        }

        // Create notification on successful database write!
        const newNotif: Notification = {
          id: "not-" + Math.random().toString(36).substring(4),
          user_id: "all_team",
          title: "New Channel Message",
          content: `${senderName} posted in a team channel: ${text.substring(0, 60)}${text.length > 60 ? "..." : ""}`,
          is_read: false,
          created_at: new Date().toISOString()
        };
        try {
          await supabase.from("notifications").insert([newNotif]);
        } catch (eNotif) {
          console.warn("Failed to insert team message notification:", eNotif);
        }

        const updated = [...get().teamMessages, newMsg];
        set({ teamMessages: updated });
        saveStateToCache({ ...get(), teamMessages: updated });
      } catch (err) {
        console.error("[STORE] Exception during team message Supabase write:", err);
      }
    },

    createTeamGroup: (name, description) => {
      const newGroup: TeamGroup = {
        id: "tg-" + Math.random().toString(36).substring(4),
        name,
        description,
        created_at: new Date().toISOString()
      };
      const updated = [...get().teamGroups, newGroup];
      set({ teamGroups: updated });
      saveStateToCache({ ...get(), teamGroups: updated });
    },

    deleteTeamGroup: (id) => {
      const updated = get().teamGroups.filter(g => g.id !== id);
      set({ teamGroups: updated });
      saveStateToCache({ ...get(), teamGroups: updated });
    },

    createProjectGroup: (projectId, name, assignedMembers) => {
      const newGroup: ProjectGroup = {
        id: "pg-" + Math.random().toString(36).substring(4),
        project_id: projectId,
        name,
        assigned_members: assignedMembers,
        created_at: new Date().toISOString()
      };
      const updated = [...get().projectGroups, newGroup];
      set({ projectGroups: updated });
      saveStateToCache({ ...get(), projectGroups: updated });
    },

    deleteProjectGroup: (id) => {
      const updated = get().projectGroups.filter(g => g.id !== id);
      set({ projectGroups: updated });
      saveStateToCache({ ...get(), projectGroups: updated });
    },

    addAiTrainingFile: async (title, file_type, content, uploaded_by_id, uploaded_by_name) => {
      const newFile: AiTrainingFile = {
        id: "aif-" + Math.random().toString(36).substring(4),
        title,
        file_type,
        content,
        uploaded_by_id,
        uploaded_by_name,
        created_at: new Date().toISOString()
      };
      try {
        const { error } = await supabase.from("ai_training_files").insert([newFile]);
        if (error) {
          console.error("Failed to insert AI training file in Supabase:", error.message);
          throw error;
        }
        const updated = [newFile, ...get().aiTrainingFiles];
        set({ aiTrainingFiles: updated });
        saveStateToCache({ ...get(), aiTrainingFiles: updated });
      } catch (err: any) {
        console.error("Error in addAiTrainingFile:", err);
        throw err;
      }
    },

    deleteAiTrainingFile: async (id) => {
      try {
        const { error } = await supabase.from("ai_training_files").delete().eq("id", id);
        if (error) {
          console.error("Failed to delete AI training file from Supabase:", error.message);
          throw error;
        }
        const updated = get().aiTrainingFiles.filter(item => item.id !== id);
        set({ aiTrainingFiles: updated });
        saveStateToCache({ ...get(), aiTrainingFiles: updated });
      } catch (err: any) {
        console.error("Error in deleteAiTrainingFile:", err);
        throw err;
      }
    },

    submitPlanApproval: async (clientId, clientName, planName, price, billingCycle) => {
      const newApproval: PlanApproval = {
        id: "pa-" + Math.random().toString(36).substring(4),
        client_id: clientId,
        client_name: clientName,
        plan_name: planName,
        price,
        billing_cycle: billingCycle,
        status: "Pending Approval",
        created_at: new Date().toISOString()
      };
      try {
        const { error } = await supabase.from("plan_approvals").insert([newApproval]);
        if (error) {
          throw new Error(error.message || "Failed to submit plan request to Supabase");
        }
        const updated = [newApproval, ...get().planApprovals];
        set({ planApprovals: updated });
        saveStateToCache({ ...get(), planApprovals: updated });

        // Trigger notification to admin/team
        await get().addNotification(
          "all_admins",
          "New Plan Request",
          `Client ${clientName} requested approval for the ${planName} plan.`
        );
      } catch (err: any) {
        console.error("[SUPABASE ERROR] Failed to submit plan request:", err.message);
        throw err;
      }
    },

    updatePlanApprovalStatus: async (id, status) => {
      const target = get().planApprovals.find(pa => pa.id === id);
      if (!target) return;

      try {
        // 1. Update plan_approvals status directly in Supabase
        const { error: appErr } = await supabase
          .from("plan_approvals")
          .update({ status })
          .eq("id", id);
        if (appErr) throw appErr;

        let planId = "plan-" + Math.random().toString(36).substring(4);
        let nextActivePlanObj: ActivePlan | null = null;

        if (status === "Approved") {
          const start = new Date();
          const renewal = new Date();
          renewal.setMonth(renewal.getMonth() + (target.billing_cycle === "Annually" ? 12 : 1));

          // 2. Expire older active plans for this client
          const { error: expErr } = await supabase
            .from("active_plans")
            .update({ status: "Expired" })
            .eq("client_id", target.client_id);
          if (expErr) {
            console.warn("Failed to expire old active plans, proceeding:", expErr.message);
          }

          nextActivePlanObj = {
            id: planId,
            client_id: target.client_id,
            plan_name: target.plan_name,
            price: target.price,
            status: "Active",
            billing_cycle: target.billing_cycle,
            start_date: start.toISOString().split("T")[0],
            renewal_date: renewal.toISOString().split("T")[0],
            features: [
              "Standard customer support queue priority access",
              "Sub-second loading times custom cache configs",
              "Bi-weekly system updates audits",
              "Visual activity logging"
            ],
            duration: target.billing_cycle === "Annually" ? "12 Months" : "1 Month",
            notes: "Approved automatically via Client Elevations panel."
          };

          // 3. Insert new active plan directly in Supabase with safe duration column fallback check
          const { error: planErr } = await supabase
            .from("active_plans")
            .insert([nextActivePlanObj]);
          
          if (planErr) {
            if (planErr.message && (planErr.message.includes("duration") || planErr.message.includes("column"))) {
              console.warn("duration column missing on active_plans, retrying approval plan insert with duration mapped to notes");
              const fallbackPlanObj = { ...nextActivePlanObj };
              delete fallbackPlanObj.duration;
              fallbackPlanObj.notes = `[Duration: ${nextActivePlanObj.duration}] ${fallbackPlanObj.notes}`;
              
              const { error: fallbackErr } = await supabase
                .from("active_plans")
                .insert([fallbackPlanObj]);
              if (fallbackErr) throw fallbackErr;
            } else {
              throw planErr;
            }
          }
        }

        // 4. Update Zustand state immediately for seamless UX
        const updatedApprovals = get().planApprovals.map(pa => pa.id === id ? { ...pa, status } : pa);
        let updatedPlans = get().activePlans;
        if (status === "Approved" && nextActivePlanObj) {
          updatedPlans = updatedPlans.map(p => p.client_id === target.client_id ? { ...p, status: "Expired" } : p);
          updatedPlans = [nextActivePlanObj, ...updatedPlans];
        }

        set({ 
          planApprovals: updatedApprovals,
          activePlans: updatedPlans
        });

        saveStateToCache({ 
          ...get(), 
          planApprovals: updatedApprovals,
          activePlans: updatedPlans 
        });

        // Trigger notification to client
        if (target.client_id) {
          await get().addNotification(
            target.client_id,
            "Plan Request Update",
            `Your request for the ${target.plan_name} plan has been ${status.toLowerCase()}.`
          );
        }

        // 5. Complete full sync
        await get().syncSupabase();
      } catch (err: any) {
        console.error("Failed to update plan approval status securely:", err.message);
        throw err;
      }
    },

    addActivePlan: async (plan) => {
      try {
        const planId = "plan-" + Math.random().toString(36).substring(4);
        const fullPlan = {
          id: planId,
          ...plan
        };

        const { error } = await supabase
          .from("active_plans")
          .insert([fullPlan]);
        
        if (error) {
          if (error.message && (error.message.includes("duration") || error.message.includes("column"))) {
            console.warn("duration column missing on active_plans, retrying insert with duration mapped to notes");
            const fallbackPlan = { ...fullPlan };
            delete fallbackPlan.duration;
            if (fallbackPlan.notes) {
              fallbackPlan.notes = `[Duration: ${fullPlan.duration}] ${fallbackPlan.notes}`;
            } else {
              fallbackPlan.notes = `[Duration: ${fullPlan.duration}]`;
            }
            const { error: fallbackErr } = await supabase
              .from("active_plans")
              .insert([fallbackPlan]);
            if (fallbackErr) throw fallbackErr;
          } else {
            throw error;
          }
        }

        // Immediately update Zustand state locally
        const updatedPlans = [fullPlan, ...get().activePlans];
        set({ activePlans: updatedPlans });
        saveStateToCache({ ...get(), activePlans: updatedPlans });

        await get().syncSupabase();
      } catch (err: any) {
        console.error("Failed to insert active plan to Supabase directly:", err.message);
        throw err;
      }
    },

    updateActivePlan: async (id, updates) => {
      try {
        const { error } = await supabase
          .from("active_plans")
          .update(updates)
          .eq("id", id);
        
        if (error) {
          if (error.message && (error.message.includes("duration") || error.message.includes("column"))) {
            console.warn("duration column missing on active_plans, retrying update with duration mapped to notes");
            const fallbackUpdates = { ...updates };
            delete fallbackUpdates.duration;
            if (updates.duration !== undefined) {
              const currentPlan = get().activePlans.find(p => p.id === id);
              const originalNotes = fallbackUpdates.notes !== undefined ? fallbackUpdates.notes : (currentPlan?.notes || "");
              if (originalNotes) {
                fallbackUpdates.notes = `[Duration: ${updates.duration}] ${originalNotes}`;
              } else {
                fallbackUpdates.notes = `[Duration: ${updates.duration}]`;
              }
            }
            const { error: fallbackErr } = await supabase
              .from("active_plans")
              .update(fallbackUpdates)
              .eq("id", id);
            if (fallbackErr) throw fallbackErr;
          } else {
            throw error;
          }
        }

        // Immediately update Zustand state locally
        const updatedPlans = get().activePlans.map(p => p.id === id ? { ...p, ...updates } : p);
        set({ activePlans: updatedPlans });
        saveStateToCache({ ...get(), activePlans: updatedPlans });

        await get().syncSupabase();
      } catch (err: any) {
        console.error("Failed to update active plan directly:", err.message);
        throw err;
      }
    },

    deleteActivePlan: async (id) => {
      console.log("Attempting to delete active plan:", id);
      try {
        const { error } = await supabase
          .from("active_plans")
          .delete()
          .eq("id", id);
        if (error) throw error;

        // Immediately update Zustand state locally
        const updatedPlans = get().activePlans.filter(p => p.id !== id);
        set({ activePlans: updatedPlans });
        saveStateToCache({ ...get(), activePlans: updatedPlans });

        await get().syncSupabase();
        console.log("Active plans synced after deletion.");
      } catch (err: any) {
        console.error("Failed to delete active plan directly:", err.message);
        throw err;
      }
    },

    fetchHelpCenterData: async () => {
      await get().syncSupabase();
    },

    addKnowledgeArticle: async (article) => {
      const newArticle: KnowledgeArticle = {
        id: "ka-" + Math.random().toString(36).substring(4),
        title: article.title,
        content: article.content,
        category_id: article.category_id,
        category_name: article.category_name,
        tags: article.tags,
        image_url: article.image_url,
        video_url: article.video_url,
        pdf_url: article.pdf_url,
        pdf_name: article.pdf_name,
        is_published: article.is_published,
        views_count: 0,
        likes_count: 0,
        is_featured: article.is_featured || false,
        created_at: new Date().toISOString()
      };
      const updated = [newArticle, ...get().knowledgeArticles];
      set({ knowledgeArticles: updated });
      saveStateToCache({ ...get(), knowledgeArticles: updated });

      try {
        await supabase.from("knowledge_base").insert([newArticle]);
      } catch (err) {
        console.warn("Offline knowledge_base bypass insert:", err);
      }
    },

    updateKnowledgeArticle: async (id, updates) => {
      const updated = get().knowledgeArticles.map(art => art.id === id ? { ...art, ...updates, updated_at: new Date().toISOString() } : art);
      set({ knowledgeArticles: updated });
      saveStateToCache({ ...get(), knowledgeArticles: updated });

      try {
        await supabase.from("knowledge_base").update(updates).eq("id", id);
      } catch (err) {
        console.warn("Offline knowledge_base bypass update:", err);
      }
    },

    deleteKnowledgeArticle: async (id) => {
      const updated = get().knowledgeArticles.filter(art => art.id !== id);
      set({ knowledgeArticles: updated });
      saveStateToCache({ ...get(), knowledgeArticles: updated });

      try {
        await supabase.from("knowledge_base").delete().eq("id", id);
      } catch (err) {
        console.warn("Offline knowledge_base bypass delete:", err);
      }
    },

    addKnowledgeCategory: async (name, description) => {
      const newCat: KnowledgeCategory = {
        id: "kc-" + Math.random().toString(36).substring(4),
        name,
        description,
        created_at: new Date().toISOString()
      };
      const updated = [...get().knowledgeCategories, newCat];
      set({ knowledgeCategories: updated });
      saveStateToCache({ ...get(), knowledgeCategories: updated });

      try {
        await supabase.from("knowledge_categories").insert([newCat]);
      } catch (err) {
        console.warn("Offline knowledge_categories bypass insert:", err);
      }
    },

    deleteKnowledgeCategory: async (id) => {
      const updated = get().knowledgeCategories.filter(cat => cat.id !== id);
      set({ knowledgeCategories: updated });
      saveStateToCache({ ...get(), knowledgeCategories: updated });

      try {
        await supabase.from("knowledge_categories").delete().eq("id", id);
      } catch (err) {
        console.warn("Offline knowledge_categories bypass delete:", err);
      }
    },

    addKnowledgeTag: async (name) => {
      const newTag: KnowledgeTag = {
        id: "kt-" + Math.random().toString(36).substring(4),
        name,
        created_at: new Date().toISOString()
      };
      const updated = [...get().knowledgeTags, newTag];
      set({ knowledgeTags: updated });
      saveStateToCache({ ...get(), knowledgeTags: updated });

      try {
        await supabase.from("knowledge_tags").insert([newTag]);
      } catch (err) {
        console.warn("Offline knowledge_tags bypass insert:", err);
      }
    },

    deleteKnowledgeTag: async (id) => {
      const updated = get().knowledgeTags.filter(tag => tag.id !== id);
      set({ knowledgeTags: updated });
      saveStateToCache({ ...get(), knowledgeTags: updated });

      try {
        await supabase.from("knowledge_tags").delete().eq("id", id);
      } catch (err) {
        console.warn("Offline knowledge_tags bypass delete:", err);
      }
    },

    toggleSavedArticle: async (articleId) => {
      const me = get().currentUser;
      if (!me) return;
      const existing = get().savedArticles.find(sa => sa.user_id === me.id && sa.article_id === articleId);
      let updated: SavedArticle[] = [];
      if (existing) {
        updated = get().savedArticles.filter(sa => sa.id !== existing.id);
        try {
          await supabase.from("saved_articles").delete().eq("id", existing.id);
        } catch (err) {
          console.warn("Offline saved_articles bypass delete:", err);
        }
      } else {
        const newSaved: SavedArticle = {
          id: "sa-" + Math.random().toString(36).substring(4),
          user_id: me.id,
          article_id: articleId,
          created_at: new Date().toISOString()
        };
        updated = [...get().savedArticles, newSaved];
        try {
          await supabase.from("saved_articles").insert([newSaved]);
        } catch (err) {
          console.warn("Offline saved_articles bypass insert:", err);
        }
      }
      set({ savedArticles: updated });
      saveStateToCache({ ...get(), savedArticles: updated });
    },

    incrementArticleViews: async (id) => {
      const list = get().knowledgeArticles;
      const target = list.find(art => art.id === id);
      if (!target) return;
      const views = (target.views_count || 0) + 1;
      const updated = list.map(art => art.id === id ? { ...art, views_count: views } : art);
      set({ knowledgeArticles: updated });
      try {
        await supabase.from("knowledge_base").update({ views_count: views }).eq("id", id);
      } catch (err) {
        console.warn("Offline views update bypass:", err);
      }
    },

    incrementArticleLikes: async (id) => {
      const list = get().knowledgeArticles;
      const target = list.find(art => art.id === id);
      if (!target) return;
      const likes = (target.likes_count || 0) + 1;
      const updated = list.map(art => art.id === id ? { ...art, likes_count: likes } : art);
      set({ knowledgeArticles: updated });
      try {
        await supabase.from("knowledge_base").update({ likes_count: likes }).eq("id", id);
      } catch (err) {
        console.warn("Offline likes update bypass:", err);
      }
    },

    addTimelineEvent: async (event) => {
      const newEv: TimelineEvent = {
        id: "te-" + Math.random().toString(36).substring(4),
        user_id: event.user_id,
        user_name: event.user_name || "System",
        event_type: event.event_type,
        title: event.title,
        details: event.details,
        status: event.status || "success",
        created_at: new Date().toISOString()
      };
      
      const updated = [newEv, ...get().timelineEvents];
      set({ timelineEvents: updated });
      saveStateToCache({ ...get(), timelineEvents: updated });

      try {
        await supabase.from("timeline_events").insert([newEv]);
      } catch (err) {
        console.warn("Offline timeline_events bypass insert:", err);
      }
    },

    addUserActivity: async (activity) => {
      const newAct: UserActivity = {
        id: "ua-" + Math.random().toString(36).substring(4),
        user_id: activity.user_id,
        user_name: activity.user_name,
        user_role: activity.user_role,
        action: activity.action,
        category: activity.category,
        details: activity.details,
        created_at: new Date().toISOString()
      };
      
      const updated = [newAct, ...get().userActivities];
      set({ userActivities: updated });
      saveStateToCache({ ...get(), userActivities: updated });

      try {
        await supabase.from("user_activities").insert([newAct]);
      } catch (err) {
        console.warn("Offline user_activities bypass insert:", err);
      }
    }
  };
});
