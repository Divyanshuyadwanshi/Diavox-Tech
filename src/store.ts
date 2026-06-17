/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from "zustand";
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase";
import { 
  UserProfile, Project, ServiceRequest, ClientReview, Blog, Message, 
  Notification, Contract, ActivePlan, AgencyMetrics, UserRole, RequestStatus, TeamDepartment,
  PricingOption, PricingTierObj, ActivityLog, Invoice, PaymentHistoryItem, AiKnowledgeItem,
  CmsContent, MilestonePayment, QuoteReply, QuoteAttachment, QuoteStatusHistory, Conversation,
  SocialMediaLink, PortfolioItem, PrivateMessage, TeamGroup, TeamMessage, ProjectGroup, AiTrainingFile, PlanApproval
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
  addContract: (contract: Omit<Contract, "id" | "created_at">) => void;
  signContract: (contractId: string) => void;
  purchasePlan: (planName: "Starter" | "Professional" | "Enterprise", isAnnual: boolean) => void;
  
  // Chat / Messages
  sendMessage: (recipientId: string, text: string) => void;
  
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
  milestones: MilestonePayment[];
  webhookLogs: any[];

  addActivityLog: (userId: string, action: string, prev?: string, next?: string) => void;
  addInvoice: (invoice: Omit<Invoice, "id" | "created_at">) => void;
  updateInvoiceStatus: (id: string, status: "paid" | "unpaid" | "cancelled") => void;
  addPayment: (payment: Omit<PaymentHistoryItem, "id">) => void;
  addAiKnowledge: (category: string, question: string, answer: string) => void;
  updateAiKnowledge: (id: string, updates: Partial<AiKnowledgeItem>) => void;
  deleteAiKnowledge: (id: string) => void;
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

  // Action methods
  addBlog: (blog: Omit<Blog, "id" | "created_at">) => Promise<void>;
  updateBlog: (id: string, updates: Partial<Blog>) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;

  addPortfolioItem: (item: Omit<PortfolioItem, "id" | "created_at">) => Promise<void>;
  updatePortfolioItem: (id: string, updates: Partial<PortfolioItem>) => Promise<void>;
  deletePortfolioItem: (id: string) => Promise<void>;

  sendPrivateMessage: (senderId: string, senderName: string, recipientId: string, text: string) => void;
  sendTeamMessage: (groupId: string, senderId: string, senderName: string, senderRole: string, text: string, file_url?: string, file_name?: string, is_image?: boolean) => void;
  createTeamGroup: (name: string, description?: string) => void;
  deleteTeamGroup: (id: string) => void;
  createProjectGroup: (projectId: string, name: string, assignedMembers: string[]) => void;
  deleteProjectGroup: (id: string) => void;

  addAiTrainingFile: (title: string, file_type: "pdf" | "faq" | "pricing" | "blog" | "service_info" | "project_info", content: string, uploaded_by_id: string, uploaded_by_name: string) => void;
  deleteAiTrainingFile: (id: string) => void;

  submitPlanApproval: (clientId: string, clientName: string, planName: "Starter" | "Professional" | "Enterprise", price: string, billingCycle: "Monthly" | "Annually") => void;
  updatePlanApprovalStatus: (id: string, status: "Approved" | "Rejected") => void;
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
      theme: state.theme !== undefined ? state.theme : existing.theme
    };
    localStorage.setItem("diavox_cached_state", JSON.stringify(cacheData));
  } catch (err) {
    console.error("Cache persistence failed:", err);
  }
};

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
    pricingOptions: [],

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
      }
    },
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
      // 1. Resolve and synchronize active Supabase Auth session on mount / synckey
      try {
        const currentLocalUser = get().currentUser;
        if (currentLocalUser && currentLocalUser.id === "admin-secret") {
          // Skip remote Supabase fetch for local/bypass account to avoid UUID type errors
          console.log("[STORE] Bypass Supabase profile check for admin-secret session sync.");
        } else {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && session.user) {
            if (!currentLocalUser || currentLocalUser.id !== session.user.id) {
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
                  permissions: dbProf.skills || dbProf.permissions || []
                };
                set({ currentUser: synchronizedUser });
                saveStateToCache({ currentUser: synchronizedUser });
              }
            }
          }
        }
      } catch (sessionErr) {
        console.warn("Session auto-discovery warning:", sessionErr);
      }

      try {
        // Fetch Profiles via Secure API to bypass RLS issues
        let profilesList: any[] = [];
        try {
          const res = await fetch("/api/admin/profiles");
          if (res.ok) {
            const data = await res.json();
            profilesList = data.profiles;
          } else {
            // Fallback to direct supabase if API fails
            const { data } = await supabase.from("profiles").select("*");
            profilesList = data || [];
          }
        } catch (fetchErr) {
          const { data } = await supabase.from("profiles").select("*");
          profilesList = data || [];
        }

        if (profilesList.length > 0) {
          const currentRole = get().currentUser?.role || "client";
          const roleValues: Record<string, number> = {
            secret_admin: 5,
            primary_admin: 4,
            secondary_admin: 3,
            third_admin: 2,
            team_member: 1,
            developer: 1,
            client: 0
          };
          const currentVal = roleValues[currentRole] || 0;
          
          let filtered = profilesList;
          const currentId = get().currentUser?.id;
          const isStaff = (r: string) => ["secret_admin", "primary_admin", "secondary_admin", "third_admin", "team_member", "developer"].includes(r);
          const isAdmin = (r: string) => ["secret_admin", "primary_admin", "secondary_admin", "third_admin"].includes(r);

          filtered = profilesList.filter(p => {
            const pRole = p.role || "client";
            const pVal = roleValues[pRole] || 0;

            // Anyone can view their own profile
            if (p.id === currentId) return true;

            // Secret Admin seen by themselves and primary_admin
            if (pRole === "secret_admin") {
              return currentRole === "secret_admin" || currentRole === "primary_admin";
            }

            // Staff members are publicly visible to all staff
            if (isStaff(currentRole) && isStaff(pRole)) return true;

            // Admins see everyone (clients/leads)
            if (isAdmin(currentRole)) return true;
            
            // Otherwise, only see self (already handled)
            return false;
          });
          
          set({ allUsers: filtered });
        }

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
            if (!grouped[u.project_id]) {
              grouped[u.project_id] = [];
            }
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

        // Fetch Quote Requests (Mapped to requests state)
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

        // Fetch Reviews
        const { data: revList } = await supabase.from("reviews").select("*");
        if (revList) {
          set({ reviews: revList as ClientReview[] });
        }

        // Fetch Blogs
        const { data: blogsList } = await supabase.from("blogs").select("*");
        if (blogsList) {
          set({ blogs: blogsList as Blog[] });
        }

        // Fetch Messages
        const { data: messagesList } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
        if (messagesList) {
          set({ messages: messagesList as Message[] });
        }

        // Fetch Team Groups
        const { data: teamGroupsList } = await supabase.from("team_groups").select("*");
        if (teamGroupsList) {
          set({ teamGroups: teamGroupsList as TeamGroup[] });
        }

        // Fetch Team Messages
        const { data: teamMessagesList } = await supabase.from("team_messages").select("*").order("created_at", { ascending: true });
        if (teamMessagesList) {
          set({ teamMessages: teamMessagesList as TeamMessage[] });
        }

        // Fetch Private Messages
        const { data: privateMessagesList } = await supabase.from("private_messages").select("*").order("created_at", { ascending: true });
        if (privateMessagesList) {
          set({ privateMessages: privateMessagesList as PrivateMessage[] });
        }

        // Fetch AI Training files
        const { data: trainingFiles } = await supabase.from("ai_training_files").select("*");
        if (trainingFiles) {
          set({ aiTrainingFiles: trainingFiles as AiTrainingFile[] });
        }

        // Fetch Plan Approvals
        const { data: planApprovalsList } = await supabase.from("plan_approvals").select("*");
        if (planApprovalsList) {
          set({ planApprovals: planApprovalsList as PlanApproval[] });
        }

        // Social links
        const { data: linksList } = await supabase.from("social_media_links").select("*").order("display_order", { ascending: true });
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
          set({ socialMediaLinks: actualSocialLinks as SocialMediaLink[] });
        }

        // Portfolio items
        const { data: portfolioItemsList } = await supabase.from("portfolio_items").select("*");
        if (portfolioItemsList) {
          set({ portfolioItems: portfolioItemsList as PortfolioItem[] });
        }

        // Notifications
        const { data: notifList } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
        if (notifList) {
          set({ notifications: notifList as Notification[] });
        }

        // Activity Logs
        const { data: activityLogsList } = await supabase.from("activity_logs").select("*").order("timestamp", { ascending: false });
        if (activityLogsList) {
          set({ activityLogs: activityLogsList as ActivityLog[] });
        }

        // AI Knowledge
        const { data: aiKnowledgeList } = await supabase.from("ai_knowledge").select("*");
        if (aiKnowledgeList) {
          set({ aiKnowledge: aiKnowledgeList as AiKnowledgeItem[] });
        }
      } catch (err) {
        console.warn("Supabase database synchronization failed, operating offline.", err);
      }
    },

    addSocialMediaLink: async (platform, url, icon) => {
      const newLink: SocialMediaLink = {
        id: "sml-" + Math.random().toString(36).substring(4),
        platform,
        url,
        icon,
        display_order: get().socialMediaLinks.length + 1,
        visible: true,
        created_at: new Date().toISOString()
      };
      const updated = [...get().socialMediaLinks, newLink];
      set({ socialMediaLinks: updated });
      saveStateToCache({ socialMediaLinks: updated });
      try {
        await supabase.from("social_media_links").insert([newLink]);
      } catch (err) {
        console.warn("Failed to insert to Supabase social_media_links, saved locally:", err);
      }
    },

    updateSocialMediaLink: async (id, updates) => {
      const updated = get().socialMediaLinks.map(l => l.id === id ? { ...l, ...updates } : l);
      set({ socialMediaLinks: updated });
      saveStateToCache({ socialMediaLinks: updated });
      try {
        await supabase.from("social_media_links").update(updates).eq("id", id);
      } catch (err) {
        console.warn("Failed to update Supabase social_media_links, saved locally:", err);
      }
    },

    deleteSocialMediaLink: async (id) => {
      const updated = get().socialMediaLinks.filter(l => l.id !== id);
      set({ socialMediaLinks: updated });
      saveStateToCache({ socialMediaLinks: updated });
      try {
        await supabase.from("social_media_links").delete().eq("id", id);
      } catch (err) {
        console.warn("Failed to delete from Supabase social_media_links, saved locally:", err);
      }
    },

    reorderSocialMediaLinks: async (newOrderList) => {
      const updated = newOrderList.map((link, idx) => ({ ...link, display_order: idx + 1 }));
      set({ socialMediaLinks: updated });
      saveStateToCache({ socialMediaLinks: updated });
      try {
        await Promise.allSettled(
          updated.map(link => supabase.from("social_media_links").update({ display_order: link.display_order }).eq("id", link.id))
        );
      } catch (err) {
        console.warn("Failed to reorder Supabase social_media_links, saved locally:", err);
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
    
    // Reviews & Testimonials operations (Synced directly to reviews table)
    addReview: async (review) => {
      const id = "rev-" + Math.random().toString(36).substring(4);
      const newReview: ClientReview = {
        id,
        ...review,
        status: "Pending", // Needs admin approval to print on main feed
        is_featured: false,
        date: new Date().toISOString().split("T")[0]
      };
      
      const updatedReviews = [newReview, ...get().reviews];
      set({ reviews: updatedReviews });
      saveStateToCache({ reviews: updatedReviews });
      
      try {
        await supabase.from("reviews").insert([newReview]);
      } catch (e) {
        console.warn("Supabase review write failed:", e);
      }
    },
    
    updateReviewStatus: async (reviewId, status) => {
      const updated = get().reviews.map(r => r.id === reviewId ? { ...r, status } : r);
      set({ reviews: updated });
      saveStateToCache({ reviews: updated });
      try {
        await supabase.from("reviews").update({ status }).eq("id", reviewId);
      } catch (err) {
        console.warn("Failed to update review status in Supabase:", err);
      }
    },
    
    toggleReviewFeature: async (reviewId) => {
      const target = get().reviews.find(r => r.id === reviewId);
      if (!target) return;
      const nextFeatured = !target.is_featured;
      const updated = get().reviews.map(r => r.id === reviewId ? { ...r, is_featured: nextFeatured } : r);
      set({ reviews: updated });
      saveStateToCache({ reviews: updated });
      try {
        await supabase.from("reviews").update({ is_featured: nextFeatured }).eq("id", reviewId);
      } catch (err) {
        console.warn("Failed to toggle review feature flag in Supabase:", err);
      }
    },
    
    replyToReview: async (reviewId, text) => {
      const updated = get().reviews.map(r => r.id === reviewId ? { ...r, reply_text: text } : r);
      set({ reviews: updated });
      saveStateToCache({ reviews: updated });
      try {
        await supabase.from("reviews").update({ reply_text: text }).eq("id", reviewId);
      } catch (err) {
        console.warn("Failed to reply to review in Supabase:", err);
      }
    },
    
    deleteReview: async (reviewId) => {
      const updated = get().reviews.filter(r => r.id !== reviewId);
      set({ reviews: updated });
      saveStateToCache({ reviews: updated });
      try {
        await supabase.from("reviews").delete().eq("id", reviewId);
      } catch (err) {
        console.warn("Failed to delete review from Supabase:", err);
      }
    },
    
    // Service submissions (Synced directly to quote_requests table)
    submitRequest: async (request) => {
      const id = "req-" + Math.random().toString(36).substring(4);
      const newRequest: ServiceRequest = {
        id,
        ...request,
        status: "Submitted",
        created_at: new Date().toISOString()
      };
      
      const updatedRequests = [newRequest, ...get().requests];
      
      const infoNotif: Notification = {
        id: "not-" + Math.random().toString(36).substring(4),
        user_id: "all_admins",
        title: "New Request Submitted",
        content: `Service requested: ${request.service_type} from ${request.client_name}.`,
        is_read: false,
        created_at: new Date().toISOString()
      };
      
      set({ 
        requests: updatedRequests,
        notifications: [infoNotif, ...get().notifications]
      });
      saveStateToCache({ 
        requests: updatedRequests, 
        notifications: [infoNotif, ...get().notifications] 
      });
      
      try {
        await supabase.from("quote_requests").insert([{
          id: newRequest.id,
          client_id: newRequest.client_id,
          client_name: newRequest.client_name,
          client_email: newRequest.client_email,
          service_type: newRequest.service_type,
          description: newRequest.description,
          budget: newRequest.budget,
          status: newRequest.status,
          created_at: newRequest.created_at
        }]);
        await supabase.from("notifications").insert([infoNotif]);
      } catch (err) {
        console.warn("Quote requests database insert failed:", err);
      }
    },
    
    updateRequestStatus: async (id, status) => {
      const updated = get().requests.map(r => r.id === id ? { ...r, status } : r);
      
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
            price: targetReq.budget || "$4,999",
            status: "Active",
            billing_cycle: "Monthly",
            start_date: new Date().toISOString().split("T")[0]
          };
          updatedPlans.push(newlyInsertedPlan);
        }
      }
      
      set({ requests: updated, activePlans: updatedPlans });
      saveStateToCache({ requests: updated, activePlans: updatedPlans });

      try {
        await supabase.from("quote_requests").update({ status }).eq("id", id);
        if (newlyInsertedPlan) {
          await supabase.from("active_plans").insert([newlyInsertedPlan]);
        }
      } catch (err) {
        console.warn("Failed to update quote request status in Supabase:", err);
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

      const updatedReplies = [...get().quoteReplies, newReply];
      const updatedAttachments = [...get().quoteAttachments, ...attachments];

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

      try {
        await supabase.from("quote_replies").insert([{
          id: newReply.id,
          quote_id: newReply.quote_id,
          sender_id: newReply.sender_id,
          sender_name: newReply.sender_name,
          sender_role: newReply.sender_role,
          message_text: newReply.message_text,
          created_at: newReply.created_at
        }]);
        if (attachments.length > 0) {
          await supabase.from("quote_attachments").insert(attachments);
        }
        await supabase.from("notifications").insert([newNotif]);
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
      // 1. Call Secure Onboarding API
      const response = await fetch("/api/admin/onboard-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, position, department, email, username, role, permissions, password, avatarUrl: avatar_url, description, portfolio })
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Staff onboarding failed.");

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
          const res = await fetch("/api/admin/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
        const updateRes = await fetch("/api/admin/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
          const res = await fetch("/api/admin/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
        const updateRes = await fetch("/api/admin/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
        const res = await fetch("/api/admin/delete-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      const updatedContracts = [newContract, ...get().contracts];
      
      set({ contracts: updatedContracts });
      saveStateToCache({ contracts: updatedContracts });

      try {
        await supabase.from("contracts").insert([{
          id: newContract.id,
          client_id: newContract.client_id,
          client_name: newContract.client_name,
          project_title: newContract.project_title,
          details: newContract.details,
          terms: newContract.terms,
          status: newContract.status,
          price: newContract.price,
          created_at: newContract.created_at
        }]);
      } catch (err) {
        console.warn("Failed to save contract definition in Supabase:", err);
      }
    },
    
    signContract: async (contractId) => {
      const updatedContracts = get().contracts.map(c => 
        c.id === contractId ? { ...c, status: "Signed" as const } : c
      );
      set({ contracts: updatedContracts });
      saveStateToCache({ contracts: updatedContracts });

      try {
        await supabase.from("contracts").update({ status: "Signed" }).eq("id", contractId);
      } catch (err) {
        console.warn("Failed to sign contract in Supabase:", err);
      }
    },
    
    purchasePlan: async (planName, isAnnual) => {
      const user = get().currentUser;
      if (!user) return;
      
      const planPrice = planName === "Starter" ? (isAnnual ? "$1,599/mo" : "$1,999/mo") : 
                        planName === "Professional" ? (isAnnual ? "$3,999/mo" : "$4,999/mo") : 
                        (isAnnual ? "$7,999/mo" : "$9,999/mo");
                        
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
      
      const purchaseNotif: Notification = {
        id: "not-" + Math.random().toString(36).substring(4),
        user_id: user.id,
        title: "Plan Activated",
        content: `Your subscription to Diavox ${planName} Plan is now registered successfully!`,
        is_read: false,
        created_at: new Date().toISOString()
      };
      
      set({ notifications: [purchaseNotif, ...get().notifications] });

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
        await supabase.from("notifications").insert([purchaseNotif]);
      } catch (err) {
        console.warn("Failed to activate plan subscription row in Supabase:", err);
      }
    },
    
    // Messages
    sendMessage: (recipientId, text) => {
      const user = get().currentUser;
      if (!user) return;
      
      const newMessage: Message = {
        id: "msg-" + Math.random().toString(36).substring(4),
        sender_id: user.id,
        sender_name: user.name,
        sender_role: user.role,
        recipient_id: recipientId,
        message_text: text,
        created_at: new Date().toISOString()
      };
      
      let nextMsgs = [...get().messages, newMessage];
      
      // Auto reply with the SLA AI message if a client sent a message
      if (user.role === "client") {
        // 1. SLA immediate alert message
        const slaMsg: Message = {
          id: "msg-" + Math.random().toString(36).substring(4),
          sender_id: "system-ai",
          sender_name: "Diavox AI Support",
          sender_role: "team_member",
          recipient_id: user.id,
          message_text: "Your request is marked under review. Our developers will post the complete API schema in about 4 hours.",
          created_at: new Date(Date.now() + 200).toISOString()
        };
        nextMsgs.push(slaMsg);

        // 2. AI conversational assistance based on trained knowledge base
        const query = text.toLowerCase();
        let aiReplyText = "";

        // Check our trained AI knowledge base
        const knowledge = get().aiKnowledge || [];
        const matched = knowledge.find(k => 
          query.includes(k.question.toLowerCase()) || 
          k.question.toLowerCase().split(" ").filter(w => w.length > 4).some(w => query.includes(w))
        );

        if (matched) {
          aiReplyText = matched.answer;
        } else if (query.includes("price") || query.includes("cost") || query.includes("pricing") || query.includes("plan") || query.includes("subscription")) {
          aiReplyText = "Diavox provides three main plans:\n1. Website Maintenance (basic $199/mo, standard $499/mo, expert $999/mo)\n2. SEO campaigns (starts at $399/mo)\n3. Custom Project Design & Development (on-demand starting at $1,999 one-time payment). Feel free to toggle the Currency converter on our website to see real-time price updates in INR or GBP!";
        } else if (query.includes("recommend") || query.includes("which one") || query.includes("suggest") || query.includes("need")) {
          aiReplyText = "For most new businesses looking to launch a SaaS, platform, or showcase layout, we recommend our 'Project Design & Development (Standard Tier)' at $4,999 (₹415,000) as it includes complete custom React & Supabase backend architecture, priority support cover, and full-stack responsiveness.";
        } else if (query.includes("service") || query.includes("what do you do") || query.includes("capabilities")) {
          aiReplyText = "Our core disciplines include high-speed React web app development, custom Supabase cloud database architectures, Search Engine Optimization (SEO) subscription growth, daily backups and maintenance helpdesk support, and workflow automation.";
        }

        if (aiReplyText) {
          const converseMsg: Message = {
            id: "msg-" + Math.random().toString(36).substring(4),
            sender_id: "system-ai-expert",
            sender_name: "Diavox Smart Agent",
            sender_role: "team_member",
            recipient_id: user.id,
            message_text: `[AI Co-pilot Insight]\n${aiReplyText}`,
            created_at: new Date(Date.now() + 800).toISOString()
          };
          nextMsgs.push(converseMsg);
        }
      }
      
      set({ messages: nextMsgs });
      saveStateToCache({ ...get(), messages: nextMsgs });
    },
    
    // Notifications & Alert rules
    addNotification: (userId, title, content) => {
      const newNotif: Notification = {
        id: "not-" + Math.random().toString(36).substring(4),
        user_id: userId,
        title,
        content,
        is_read: false,
        created_at: new Date().toISOString()
      };
      const updatedNotifs = [newNotif, ...get().notifications];
      set({ notifications: updatedNotifs });
      saveStateToCache({ ...get(), notifications: updatedNotifs });
    },
    
    markNotificationsRead: (userId) => {
      const updatedNotifs = get().notifications.map(n => 
        (n.user_id === userId || n.user_id === "all_admins" || n.user_id === "all_team") 
          ? { ...n, is_read: true } 
          : n
      );
      set({ notifications: updatedNotifs });
      saveStateToCache({ ...get(), notifications: updatedNotifs });
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

    updatePricingOption: (optionId, updates) => {
      const updated = get().pricingOptions.map(opt => opt.id === optionId ? { ...opt, ...updates } : opt);
      set({ pricingOptions: updated });
      saveStateToCache({ ...get(), pricingOptions: updated });
    },

    updatePricingTier: (optionId, tierId, updates) => {
      const updated = get().pricingOptions.map(opt => {
        if (opt.id !== optionId) return opt;
        return {
          ...opt,
          tiers: opt.tiers.map(t => t.id === tierId ? { ...t, ...updates } as any : t)
        };
      });
      set({ pricingOptions: updated });
      saveStateToCache({ ...get(), pricingOptions: updated });
    },

    addPricingOption: (title, type) => {
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
      const updated = [...get().pricingOptions, newOption];
      set({ pricingOptions: updated });
      saveStateToCache({ ...get(), pricingOptions: updated });
    },

    deletePricingOption: (optionId) => {
      const updated = get().pricingOptions.filter(opt => opt.id !== optionId);
      set({ pricingOptions: updated });
      saveStateToCache({ ...get(), pricingOptions: updated });
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

    addInvoice: (invoice) => {
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
        created_at: new Date().toISOString().split("T")[0]
      };
      const updated = [newInvoice, ...get().invoices];
      set({ invoices: updated });
      saveStateToCache({ ...get(), invoices: updated });
    },

    updateInvoiceStatus: (id, status) => {
      const updated = get().invoices.map(inv => inv.id === id ? { ...inv, status } : inv);
      set({ invoices: updated });
      saveStateToCache({ ...get(), invoices: updated });
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

    addAiKnowledge: (category, question, answer) => {
      const newItem: AiKnowledgeItem = {
        id: "know-" + Math.random().toString(36).substring(4),
        category,
        question,
        answer,
        created_at: new Date().toISOString().split("T")[0]
      };
      const updated = [newItem, ...get().aiKnowledge];
      set({ aiKnowledge: updated });
      saveStateToCache({ ...get(), aiKnowledge: updated });
    },

    updateAiKnowledge: (id, updates) => {
      const updated = get().aiKnowledge.map(item => item.id === id ? { ...item, ...updates } : item);
      set({ aiKnowledge: updated });
      saveStateToCache({ ...get(), aiKnowledge: updated });
    },

    deleteAiKnowledge: (id) => {
      const updated = get().aiKnowledge.filter(item => item.id !== id);
      set({ aiKnowledge: updated });
      saveStateToCache({ ...get(), aiKnowledge: updated });
    },

    updateCmsContent: async (content) => {
      const updated = { ...get().cmsContent, ...content };
      set({ cmsContent: updated });
      saveStateToCache({ ...get(), cmsContent: updated });
      try {
        await supabase.from("social_media_links").upsert({
          id: "cms_app_state",
          platform: "cms_json_config",
          url: JSON.stringify(updated),
          icon: "config",
          display_order: -999,
          visible: false
        });
      } catch (err) {
        console.warn("Failed to save CMS config to Supabase:", err);
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
      const updated = [newBlog, ...get().blogs];
      set({ blogs: updated });
      saveStateToCache({ ...get(), blogs: updated });
      try {
        await supabase.from("blogs").insert([newBlog]);
      } catch (err) {
        console.warn("Failed to insert blog to Supabase:", err);
      }
    },

    updateBlog: async (id, updates) => {
      const updated = get().blogs.map(item => item.id === id ? { ...item, ...updates } : item);
      set({ blogs: updated });
      saveStateToCache({ ...get(), blogs: updated });
      try {
        await supabase.from("blogs").update(updates).eq("id", id);
      } catch (err) {
        console.warn("Failed to update blog in Supabase:", err);
      }
    },

    deleteBlog: async (id) => {
      const updated = get().blogs.filter(item => item.id !== id);
      set({ blogs: updated });
      saveStateToCache({ ...get(), blogs: updated });
      try {
        await supabase.from("blogs").delete().eq("id", id);
      } catch (err) {
        console.warn("Failed to delete blog from Supabase:", err);
      }
    },

    addPortfolioItem: async (item) => {
      const newItem: PortfolioItem = {
        id: "port-" + Math.random().toString(36).substring(4),
        ...item,
        created_at: new Date().toISOString()
      };
      const updated = [newItem, ...get().portfolioItems];
      set({ portfolioItems: updated });
      saveStateToCache({ ...get(), portfolioItems: updated });
      try {
        await supabase.from("portfolio_items").insert([newItem]);
      } catch (err) {
        console.warn("Failed to insert portfolio item to Supabase:", err);
      }
    },

    updatePortfolioItem: async (id, updates) => {
      const updated = get().portfolioItems.map(item => item.id === id ? { ...item, ...updates } : item);
      set({ portfolioItems: updated });
      saveStateToCache({ ...get(), portfolioItems: updated });
      try {
        await supabase.from("portfolio_items").update(updates).eq("id", id);
      } catch (err) {
        console.warn("Failed to update portfolio item in Supabase:", err);
      }
    },

    deletePortfolioItem: async (id) => {
      const updated = get().portfolioItems.filter(item => item.id !== id);
      set({ portfolioItems: updated });
      saveStateToCache({ ...get(), portfolioItems: updated });
      try {
        await supabase.from("portfolio_items").delete().eq("id", id);
      } catch (err) {
        console.warn("Failed to delete portfolio item from Supabase:", err);
      }
    },

    sendPrivateMessage: (senderId, senderName, recipientId, text) => {
      const newMsg: PrivateMessage = {
        id: "pm-" + Math.random().toString(36).substring(4),
        sender_id: senderId,
        sender_name: senderName,
        recipient_id: recipientId,
        message_text: text,
        created_at: new Date().toISOString()
      };
      const updated = [...get().privateMessages, newMsg];
      set({ privateMessages: updated });
      saveStateToCache({ ...get(), privateMessages: updated });
    },

    sendTeamMessage: (groupId, senderId, senderName, senderRole, text, file_url, file_name, is_image) => {
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
      const updated = [...get().teamMessages, newMsg];
      set({ teamMessages: updated });
      saveStateToCache({ ...get(), teamMessages: updated });
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

    addAiTrainingFile: (title, file_type, content, uploaded_by_id, uploaded_by_name) => {
      const newFile: AiTrainingFile = {
        id: "aif-" + Math.random().toString(36).substring(4),
        title,
        file_type,
        content,
        uploaded_by_id,
        uploaded_by_name,
        created_at: new Date().toISOString()
      };
      const updated = [newFile, ...get().aiTrainingFiles];
      set({ aiTrainingFiles: updated });
      saveStateToCache({ ...get(), aiTrainingFiles: updated });
    },

    deleteAiTrainingFile: (id) => {
      const updated = get().aiTrainingFiles.filter(item => item.id !== id);
      set({ aiTrainingFiles: updated });
      saveStateToCache({ ...get(), aiTrainingFiles: updated });
    },

    submitPlanApproval: (clientId, clientName, planName, price, billingCycle) => {
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
      const updated = [newApproval, ...get().planApprovals];
      set({ planApprovals: updated });
      saveStateToCache({ ...get(), planApprovals: updated });
    },

    updatePlanApprovalStatus: (id, status) => {
      const target = get().planApprovals.find(pa => pa.id === id);
      const updatedApprovals = get().planApprovals.map(pa => pa.id === id ? { ...pa, status } : pa);
      
      let updatedPlans = [...get().activePlans];
      if (status === "Approved" && target) {
        const start = new Date();
        const nextActivePlan: ActivePlan = {
          id: "plan-" + Math.random().toString(36).substring(4),
          client_id: target.client_id,
          plan_name: target.plan_name,
          price: target.price,
          status: "Active",
          billing_cycle: target.billing_cycle,
          start_date: start.toISOString().split("T")[0]
        };
        updatedPlans = updatedPlans.map(p => p.client_id === target.client_id ? { ...p, status: "Expired" as const } : p);
        updatedPlans.push(nextActivePlan);
      }
      
      set({ planApprovals: updatedApprovals, activePlans: updatedPlans });
      saveStateToCache({ ...get(), planApprovals: updatedApprovals, activePlans: updatedPlans });
    }
  };
});
