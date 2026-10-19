export type UserRole = 'Founder' | 'Developer' | 'Designer' | 'Sales Outreach' | 'Intern';
export type UserStatus = 'Available' | 'Working on Project' | 'On Leave';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_admin: boolean;
  status: UserStatus;
  created_at?: string;
}

export interface IntakeChecklist {
  logo?: boolean;
  images?: boolean;
  bio?: boolean;
  catalog?: boolean;
  contact?: boolean;
  socials?: boolean;
  colors?: boolean;
  reviews?: boolean;
}

export type ProjectStage = 'Asset Intake' | 'In Development' | 'Client Review' | 'DNS / Launch' | 'Completed';
export type MilestoneStage = 'Milestone 1 (50% Advance)' | 'Milestone 2 (30% Staging)' | 'Milestone 3 (20% Launch)';

export interface Project {
  id: string;
  title: string;
  client_id?: string | null;
  stage: ProjectStage;
  milestone_stage?: MilestoneStage;
  fee_inr: number;
  advance_inr: number;
  github_url?: string;
  vercel_url?: string;
  domain_url?: string;
  drive_url?: string;
  intake_checklist?: IntakeChecklist;
  revision_round?: number;
  max_included_revisions?: number;
  created_at?: string;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Needs Review' | 'Approved';
export type TaskPriority = 'Urgent' | 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  title: string;
  project_id?: string | null;
  assigned_to_id?: string | null;
  preview_url?: string;
  github_pr_url?: string;
  priority?: TaskPriority;
  status: TaskStatus;
  created_at?: string;
}

export type LeadSource = 'Google Maps' | 'Reddit' | 'Instagram' | 'Cold Email' | 'Referral';
export type LeadStatus = 'Cold Contact' | 'In Discussion' | 'Proposal Sent' | 'Won' | 'Lost';

export interface Lead {
  id: string;
  name: string;
  company?: string;
  source: LeadSource;
  phone?: string;
  estimated_value_inr: number;
  notes?: string;
  has_website?: boolean;
  website_url?: string;
  status: LeadStatus;
  created_at?: string;
}

export interface Client {
  id: string;
  company_name: string;
  contact_person: string;
  email?: string;
  phone?: string;
  magic_token?: string;
  created_at?: string;
}

export interface ProjectCredential {
  id: string;
  project_id?: string;
  title: string;
  service_type: 'Domain Registrar' | 'Hosting' | 'DNS / CDN' | 'Social' | 'SMTP' | 'API Key';
  identifier?: string;
  secret: string;
  notes?: string;
}
