/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "secret_admin" | "primary_admin" | "secondary_admin" | "third_admin" | "team_member" | "client" | "developer";

export type TeamDepartment = "sales" | "developer" | "designer" | "seo" | "general";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: TeamDepartment;
  avatar_url?: string;
  username?: string;
  permissions?: string[]; // e.g. ["view_leads", "manage_projects", "upload_designs", "manage_seo", "view_reports"]
  portfolio?: string;
  description?: string;
  status?: string;
}

export interface PricingTierObj {
  id: string;
  name: "Basic" | "Standard" | "Expert";
  tagline: string;
  priceUSD: string;
  priceINR: string;
  priceGBP: string;
  features: string[];
}

export interface PricingOption {
  id: string;
  title: string;
  type: "one-time" | "monthly-subscription";
  tiers: PricingTierObj[];
}

export type RequestStatus = 
  | "Submitted"
  | "Reviewing"
  | "Under Review"
  | "Quoted"
  | "Approved"
  | "Rejected"
  | "In Progress"
  | "Completed"
  | "Cancelled";

export interface ServiceRequest {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  service_type: string;
  description: string;
  budget?: string;
  status: RequestStatus;
  created_at: string;
  attachments?: QuoteAttachment[];
}

export interface QuoteReply {
  id: string;
  quote_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: UserRole;
  message_text: string;
  created_at: string;
  attachments?: QuoteAttachment[];
}

export interface QuoteAttachment {
  id: string;
  quote_id?: string;
  reply_id?: string;
  file_name: string;
  file_url: string;
  file_size?: string;
  created_at: string;
}

export interface QuoteStatusHistory {
  id: string;
  quote_id: string;
  status: RequestStatus;
  changed_by_name: string;
  changed_by_role: UserRole;
  notes?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  name: string; // Name of group chat or other participant
  type: "personal" | "group" | "team_team" | "team_admin" | "admin_admin" | "client_team";
  created_at: string;
  participants: string[]; // List of user Profile IDs
  typing_users?: string[]; // list of user IDs currently typing
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: "Website Development" | "Website Design" | "SEO" | "AI Automation";
  technologies: string[];
  image_url: string;
  completion_date: string;
  live_url?: string;
  status: "ongoing" | "completed" | "backlog";
  assigned_to?: string[]; // user profile IDs
  client_id?: string;
  client_name?: string;
  progress: number; // 0 to 100
  delivery_date?: string;
}

export interface ProjectUpdate {
  id: string;
  project_id: string;
  author_name: string;
  update_text: string;
  file_url?: string;
  file_name?: string;
  created_at: string;
}

export interface Contract {
  id: string;
  client_id: string;
  client_name: string;
  project_title: string;
  details: string;
  terms: string;
  status: "Draft" | "Pending Signature" | "Signed" | "Active" | "Expired";
  price: string;
  created_at: string;
}

export interface ActivePlan {
  id: string;
  client_id: string;
  plan_name: "Starter" | "Professional" | "Enterprise" | string;
  price: string;
  status: "Active" | "Expired" | "Cancelled" | string;
  billing_cycle: "Monthly" | "Annually" | string;
  start_date: string;
  renewal_date?: string;
  features?: string[];
  duration?: string;
  notes?: string;
}

export interface ClientReview {
  id: string;
  client_id: string;
  client_name: string;
  client_avatar?: string;
  rating: number; // 1 to 5 stars
  review_text: string;
  service_used: string;
  status: "Approved" | "Pending" | "Rejected" | "Hidden";
  is_featured: boolean;
  reply_text?: string;
  date: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: "Web Development" | "SEO" | "AI" | "Business Growth" | "Automation";
  author_name: string;
  image_url: string;
  created_at: string;
  read_time: string;
}

export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: UserRole;
  recipient_id: string; // "team" or specific client ID
  recipient_name: string;
  recipient_role: string;
  message_text: string;
  created_at: string;
  conversation_id?: string;
  file_url?: string;
  file_name?: string;
  file_size?: string;
  is_image?: boolean;
  is_read?: boolean;
}

export interface Notification {
  id: string;
  user_id: string; // Target user or "all_admins" or "all_team"
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface AgencyMetrics {
  revenue: number;
  activeClients: number;
  projectsCompleted: number;
  pendingLeads: number;
  teamCount: number;
  conversionRate: number; // percentage
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string;
  role: UserRole;
  timestamp: string;
  ip_address: string;
  action: string;
  previous_value?: string;
  new_value?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  client_name: string;
  client_email: string;
  services: string;
  amount: string;
  taxes: string;
  due_date: string;
  status: "paid" | "unpaid" | "cancelled";
  created_at: string;
}

export interface PaymentHistoryItem {
  id: string;
  payment_id: string;
  transaction_id: string;
  amount: string;
  method: string;
  date: string;
  invoice_id?: string;
  project_id?: string;
  client_id: string;
}

export interface AiKnowledgeItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  created_at: string;
}

export interface CmsContent {
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  heroBadgeEffect?: "spin" | "pulse" | "ping" | "none" | "hide";
  homepageSections?: string[];
  sectionVisibility?: { [key: string]: boolean };
  sectionColors?: { [key: string]: { bg: string; text: string } };
  sectionTitles?: { [key: string]: string };
  sectionSubtitles?: { [key: string]: string };
  sectionDescriptions?: { [key: string]: string };
  sectionButtons?: { [key: string]: { text: string; link: string } };
  faqs?: Array<{ id: string; question: string; answer: string }>;
  services?: Array<{ id: string; title: string; description: string; icon: string }>;
  customSections?: Array<{
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    content?: string;
    position: "Header" | "Body" | "Footer";
    backgroundColor?: string;
    textColor?: string;
    visible?: boolean;
    displayOrder: number;
  }>;
  contactSettings?: {
    whatsapp: string;
    email: string;
    phone: string;
    supportEmail: string;
    businessHours: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    github?: string;
  };
  fontSans?: string;
  defaultCurrency?: string;
  fontDisplay?: string;
  fontMono?: string;
  headerLogoTitle?: string;
  headerLogoAccent?: string;
  headerLogoSubtitle?: string;
  heroCtaPrimaryText?: string;
  heroCtaSecondaryText?: string;
  footerLogoText?: string;
  footerLogoAccent?: string;
  footerBrandDesc?: string;
  footerCopyright?: string;
  footerCredit?: string;
  footerNotation1?: string;
  footerNotation2?: string;
  sphereConfig?: {
    color: string;
    size: number;
    labels: string[];
    sparkEnabled: boolean;
    sparkFrequency: number;
    rotationSpeed: number;
    rings: number;
    segments: number;
  };
  heroSliderConfig?: {
    autoplay: boolean;
    duration: number;
    globalEffect: "fade" | "slide-left" | "slide-right" | "zoom-in" | "blur-fade" | "typewriter";
  };
  heroSlides?: HeroSlide[];
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage?: string;
  effect?: "fade" | "slide-left" | "slide-right" | "zoom-in" | "blur-fade" | "typewriter";
  status: boolean;
}

export interface MilestonePayment {
  id: string;
  project_id: string;
  project_title: string;
  client_id: string;
  advance_paid: boolean;  // 30%
  midway_paid: boolean;   // 40%
  final_paid: boolean;    // 30%
  advance_amount: number;
  midway_amount: number;
  final_amount: number;
  total_budget: number;
}

export interface SocialMediaLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  display_order: number;
  visible: boolean;
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  is_featured: boolean;
  live_url?: string;
  created_at: string;
  tags?: string[];
}

export interface PrivateMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  message_text: string;
  created_at: string;
  file_url?: string;
  file_name?: string;
  is_image?: boolean;
}

export interface TeamGroup {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface TeamMessage {
  id: string;
  group_id: string; // "global" or specific team group ID
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message_text: string;
  file_url?: string;
  file_name?: string;
  is_image?: boolean;
  created_at: string;
}

export interface ProjectGroup {
  id: string;
  project_id: string;
  name: string;
  assigned_members: string[]; // UserProfile ids
  created_at: string;
}

export interface AiTrainingFile {
  id: string;
  title: string;
  file_type: "pdf" | "faq" | "pricing" | "blog" | "service_info" | "project_info";
  content: string; // text representation
  uploaded_by_id: string;
  uploaded_by_name: string;
  created_at: string;
}

export interface PlanApproval {
  id: string;
  client_id: string;
  client_name: string;
  plan_name: string;
  price: string;
  billing_cycle: "Monthly" | "Annually";
  status: "Pending Approval" | "Approved" | "Rejected";
  created_at: string;
}export interface KnowledgeCategory {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface KnowledgeTag {
  id: string;
  name: string;
  created_at?: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category_id?: string;
  category_name?: string;
  tags?: string[];
  image_url?: string;
  video_url?: string;
  pdf_url?: string;
  pdf_name?: string;
  is_published: boolean;
  views_count: number;
  likes_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at?: string;
}

export interface SavedArticle {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  user_id?: string;
  user_name?: string;
  event_type: string;
  title: string;
  details?: string;
  status?: string;
  created_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action: string;
  category: string;
  details?: string;
  created_at: string;
}
