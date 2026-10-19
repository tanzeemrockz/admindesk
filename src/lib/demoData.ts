import { Project, Task, Lead, Client, Profile, ProjectCredential } from '../types/database';

export const INITIAL_PROFILES: Profile[] = [];
export const INITIAL_CLIENTS: Client[] = [];
export const INITIAL_PROJECTS: Project[] = [];
export const INITIAL_TASKS: Task[] = [];
export const INITIAL_LEADS: Lead[] = [];
export const INITIAL_CREDENTIALS: ProjectCredential[] = [];

// Aliases for compatibility
export const DEMO_PROFILES = INITIAL_PROFILES;
export const DEMO_CLIENTS = INITIAL_CLIENTS;
export const DEMO_PROJECTS = INITIAL_PROJECTS;
export const DEMO_TASKS = INITIAL_TASKS;
export const DEMO_LEADS = INITIAL_LEADS;
export const DEMO_CREDENTIALS = INITIAL_CREDENTIALS;
