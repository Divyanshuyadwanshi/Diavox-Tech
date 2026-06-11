/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "secret_admin" | "primary_admin" | "secondary_admin" | "third_admin" | "team_member" | "client";

export type TeamDepartment = "sales" | "developer" | "designer" | "seo" | "general";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: TeamDepartment;
  avatar_url?: string;
  permissions?: string[]; // e.g. ["view_leads", "manage_projects", "upload_designs", "manage_seo", "view_reports"]
  portfolio?: string;
  description?: string;
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
  | "Under Review"
  | "Quoted"
  | "Approved"
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
  plan_name: "Starter" | "Professional" | "Enterprise";
  price: string;
  status: "Active" | "Expired" | "Cancelled";
  billing_cycle: "Monthly" | "Annually";
  start_date: string;
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
  message_text: string;
  created_at: string;
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
  homepageSections?: string[];
  sectionVisibility?: { [key: string]: boolean };
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
