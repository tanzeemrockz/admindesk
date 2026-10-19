import { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import {
  Profile,
  Project,
  Task,
  Lead,
  Client,
  ProjectCredential,
  TaskStatus,
  ProjectStage,
  MilestoneStage,
  UserRole,
  UserStatus
} from './types/database';
import { GooglePlaceProspect } from './types/leads';

import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { ReviewAlertBanner } from './components/layout/ReviewAlertBanner';
import { AuthGate } from './components/auth/AuthGate';

import { OverviewView } from './components/overview/OverviewView';
import { ReviewBoardView } from './components/reviews/ReviewBoardView';
import { TaskModal } from './components/reviews/TaskModal';
import { ProjectsView } from './components/projects/ProjectsView';
import { ProjectModal } from './components/projects/ProjectModal';
import { IntakeModal } from './components/projects/IntakeModal';
import { LeadsView } from './components/leads/LeadsView';
import { LeadModal } from './components/leads/LeadModal';
import { WhatsAppDrafterModal } from './components/leads/WhatsAppDrafterModal';
import { ClientsView } from './components/clients/ClientsView';
import { ClientModal } from './components/clients/ClientModal';
import { ClientMagicLinkModal } from './components/clients/ClientMagicLinkModal';
import { ConnectorsHub } from './components/connectors/ConnectorsHub';
import { TeamView } from './components/team/TeamView';
import { CredentialsView } from './components/credentials/CredentialsView';
import { DatabaseMigrationWizard } from './components/settings/DatabaseMigrationWizard';
import { BillingCalculatorModal } from './components/billing/BillingCalculatorModal';
import { ClientPortalPage } from './pages/ClientPortalPage';

// Dedicated Platform Decks
import { GitHubDeck } from './components/decks/GitHubDeck';
import { VercelDeck } from './components/decks/VercelDeck';
import { SupabaseDeck } from './components/decks/SupabaseDeck';
import { GoogleMapsDeck } from './components/decks/GoogleMapsDeck';
import { WhatsAppDeck } from './components/decks/WhatsAppDeck';
import { DiscordDeck } from './components/decks/DiscordDeck';

import { sendDiscordNotification } from './services/discordService';
import { IconCSC, IconAlertCircle, IconCheck, IconX } from './lib/icons';

export function App() {
  const location = useLocation();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [authError, setAuthError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('csc_sidebar_collapsed') === 'true';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'warning' } | null>(null);

  const showToast = useCallback((message: string, type: 'error' | 'success' | 'warning' = 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 4000);
  }, []);


  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);


  // App Data State: strictly populated from live Supabase tables (zero hardcoded mock data)
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [credentials, setCredentials] = useState<ProjectCredential[]>([]);

  // Modals State
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [intakeProject, setIntakeProject] = useState<Project | null>(null);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [magicLinkClient, setMagicLinkClient] = useState<Client | null>(null);
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [whatsAppDrafter, setWhatsAppDrafter] = useState<{
    open: boolean;
    phone: string;
    businessName: string;
  }>({ open: false, phone: '', businessName: '' });

  const isAdmin = Boolean(currentProfile?.is_admin || currentProfile?.role === 'Founder');
  const isPortalRoute = location.pathname.startsWith('/portal');

  const sessionUserRef = useRef<any>(null);
  useEffect(() => {
    sessionUserRef.current = sessionUser;
  }, [sessionUser]);

  // Load database data from Supabase (strictly from tables, empty if tables are empty)
  const loadDatabaseData = useCallback(async (userId?: string) => {
    try {
      const [profRes, projRes, taskRes, leadRes, clientRes, credRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: true }),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('project_credentials').select('*').order('created_at', { ascending: false })
      ]);

      setProfiles(profRes.data || []);
      setProjects(projRes.data || []);
      setTasks(taskRes.data || []);
      setLeads(leadRes.data || []);
      setClients(clientRes.data || []);
      setCredentials(credRes.data || []);

      const targetId = userId || sessionUserRef.current?.id;
      const targetEmail = sessionUserRef.current?.email?.toLowerCase().trim();
      if (profRes.data && profRes.data.length > 0) {
        const found = profRes.data.find(
          (p: Profile) => p.id === targetId || (p.email && p.email.toLowerCase().trim() === targetEmail)
        );
        if (found) setCurrentProfile(found);
      }
    } catch {
      // Kept clean
    }
  }, []);

  // Strict verification: user MUST have an account created in profiles table by Admin
  const verifyAndAuthorizeUser = useCallback(async (user: any): Promise<boolean> => {
    if (!user || !user.email) {
      await supabase.auth.signOut();
      setSessionUser(null);
      setCurrentProfile(null);
      setAuthError('Access Denied: No authenticated identity or email found.');
      return false;
    }

    const email = user.email.toLowerCase().trim();

    // Query Supabase profiles table for this email or ID
    try {
      const { data: profileList, error } = await supabase
        .from('profiles')
        .select('*');

      if (!error && profileList && profileList.length > 0) {
        const matched = profileList.find(
          (p: Profile) =>
            (p.email && p.email.toLowerCase().trim() === email) ||
            p.id === user.id
        );

        if (matched) {
          // If profile had a placeholder ID, update it to auth user.id
          if (matched.id !== user.id) {
            await supabase.from('profiles').update({ id: user.id }).eq('email', matched.email);
            matched.id = user.id;
          }
          setSessionUser(user);
          setCurrentProfile(matched);
          setAuthError('');
          return true;
        }
      }
    } catch (err: any) {
      console.error('Error verifying profile:', err);
    }

    // The account does NOT exist in profiles table!
    // Sign out immediately and deny entry!
    await supabase.auth.signOut();
    setSessionUser(null);
    setCurrentProfile(null);
    setAuthError(
      `Access Denied: The account "${user.email}" does not exist in the database. Accounts can only be created by an Administrator.`
    );
    return false;
  }, []);

  // Session check on load
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (session?.user) {
          const isAuthorized = await verifyAndAuthorizeUser(session.user);
          if (isAuthorized && isMounted) {
            await loadDatabaseData(session.user.id);
          }
        }
      } catch {
        // Fallback
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        const isAuthorized = await verifyAndAuthorizeUser(session.user);
        if (isAuthorized && isMounted) {
          await loadDatabaseData(session.user.id);
        }
      } else {
        setSessionUser(null);
        setCurrentProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [verifyAndAuthorizeUser, loadDatabaseData]);

  // Realtime subscription
  useEffect(() => {
    const userId = sessionUser?.id;
    if (!userId) return;

    const channel = supabase
      .channel(`csc-realtime-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => loadDatabaseData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => loadDatabaseData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => loadDatabaseData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => loadDatabaseData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => loadDatabaseData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionUser?.id, loadDatabaseData]);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('csc_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSessionUser(null);
  };

  // User presence status update
  const handleUpdateStatus = async (status: UserStatus) => {
    if (!currentProfile) return;
    setCurrentProfile((prev) => (prev ? { ...prev, status } : null));
    setProfiles((prev) =>
      prev.map((p) => (p.id === currentProfile.id ? { ...p, status } : p))
    );

    if (sessionUser) {
      await supabase.from('profiles').update({ status }).eq('id', currentProfile.id);
    }
  };

  // Task Mutations
  const handleCreateTask = async (task: any) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...task,
      status: 'To Do'
    };
    setTasks((prev) => [newTask, ...prev]);
    setTaskModalOpen(false);

    if (sessionUser) {
      await supabase.from('tasks').insert([newTask]);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    if (status === 'Approved' && !isAdmin) {
      showToast('Access Denied: Only Admins can approve review tasks.', 'error');
      return;
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );

    if (status === 'Needs Review') {
      const discordCred = credentials.find((c) => c.title.toLowerCase().includes('discord'));
      if (discordCred) {
        sendDiscordNotification(
          discordCred.secret,
          'Task Submitted for QA Review',
          `A developer has submitted a task for review with branch/staging link.`,
          0xf59e0b
        );
      }
    }

    if (sessionUser) {
      await supabase.from('tasks').update({ status }).eq('id', taskId);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!isAdmin) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (sessionUser) {
      await supabase.from('tasks').delete().eq('id', taskId);
    }
  };

  // Project Mutations
  const handleCreateProject = async (p: any) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      stage: 'Asset Intake',
      intake_checklist: {},
      revision_round: 0,
      max_included_revisions: 2,
      created_at: new Date().toISOString(),
      ...p
    };
    setProjects((prev) => [newProject, ...prev]);
    setProjectModalOpen(false);

    if (sessionUser) {
      await supabase.from('projects').insert([newProject]);
    }
  };

  const handleUpdateProjectStage = async (projectId: string, stage: ProjectStage) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, stage } : p))
    );
    if (sessionUser) {
      await supabase.from('projects').update({ stage }).eq('id', projectId);
    }
  };

  const handleUpdateMilestone = async (projectId: string, milestone_stage: MilestoneStage) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, milestone_stage } : p))
    );
    if (sessionUser) {
      await supabase.from('projects').update({ milestone_stage }).eq('id', projectId);
    }
  };

  const handleIncrementRevision = async (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, revision_round: (p.revision_round ?? 0) + 1 } : p
      )
    );
    const target = projects.find((p) => p.id === projectId);
    if (sessionUser && target) {
      await supabase
        .from('projects')
        .update({ revision_round: (target.revision_round ?? 0) + 1 })
        .eq('id', projectId);
    }
  };

  const handleSaveIntake = async (projectId: string, checklist: any, driveUrl: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, intake_checklist: checklist, drive_url: driveUrl } : p
      )
    );
    setIntakeProject(null);
    if (sessionUser) {
      await supabase
        .from('projects')
        .update({ intake_checklist: checklist, drive_url: driveUrl })
        .eq('id', projectId);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!isAdmin) return;
    if (!confirm('Are you sure you want to delete this project?')) return;
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (sessionUser) {
      await supabase.from('projects').delete().eq('id', projectId);
    }
  };

  // Lead Mutations
  const handleCreateLead = async (lead: any) => {
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      status: 'Cold Contact',
      created_at: new Date().toISOString(),
      ...lead
    };
    setLeads((prev) => [newLead, ...prev]);
    setLeadModalOpen(false);

    if (sessionUser) {
      await supabase.from('leads').insert([newLead]);
    }
  };

  const handleImportProspect = async (prospect: GooglePlaceProspect) => {
    const importedLead: Lead = {
      id: `lead-maps-${Date.now()}`,
      name: prospect.name,
      company: prospect.name,
      source: 'Google Maps',
      phone: prospect.phone || '',
      estimated_value_inr: 45000,
      has_website: prospect.hasWebsite,
      website_url: prospect.websiteUrl,
      notes: `Discovered on Google Maps (${prospect.address}). Rating: ${prospect.rating ?? 'N/A'} (${prospect.userRatingsTotal ?? 0} reviews). Website status: ${prospect.hasWebsite ? 'Has site' : 'HOT LEAD: No website detected'}.`,
      status: 'Cold Contact',
      created_at: new Date().toISOString()
    };
    setLeads((prev) => [importedLead, ...prev]);

    if (sessionUser) {
      await supabase.from('leads').insert([importedLead]);
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, status: any) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
    if (sessionUser) {
      await supabase.from('leads').update({ status }).eq('id', leadId);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!isAdmin) return;
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    if (sessionUser) {
      await supabase.from('leads').delete().eq('id', leadId);
    }
  };

  // Client Mutations
  const handleCreateClient = async (client: any) => {
    const newClient: Client = {
      id: `client-${Date.now()}`,
      magic_token: `csc_${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
      ...client
    };
    setClients((prev) => [newClient, ...prev]);
    setClientModalOpen(false);

    if (sessionUser) {
      await supabase.from('clients').insert([newClient]);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!isAdmin) return;
    if (!confirm('Are you sure you want to delete this client?')) return;
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    if (sessionUser) {
      await supabase.from('clients').delete().eq('id', clientId);
    }
  };

  // Team Mutations
  const handleUpdateMemberRole = async (memberId: string, role: UserRole) => {
    if (!isAdmin) return;
    setProfiles((prev) =>
      prev.map((p) => (p.id === memberId ? { ...p, role } : p))
    );
    if (sessionUser) {
      await supabase.from('profiles').update({ role }).eq('id', memberId);
    }
  };

  const handleToggleAdmin = async (memberId: string, makeAdmin: boolean) => {
    if (!isAdmin) return;
    if (memberId === currentProfile?.id) {
      showToast('You cannot revoke your own Administrator status.', 'warning');
      return;
    }
    setProfiles((prev) =>
      prev.map((p) => (p.id === memberId ? { ...p, is_admin: makeAdmin } : p))
    );
    if (sessionUser) {
      await supabase.from('profiles').update({ is_admin: makeAdmin }).eq('id', memberId);
    }
  };

  const handleAddMember = async (member: Omit<Profile, 'id'>) => {
    if (!isAdmin) return;
    const newMember: Profile = {
      id: `usr-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...member
    };
    setProfiles((prev) => [...prev, newMember]);
    if (sessionUser) {
      const { error } = await supabase.from('profiles').insert([newMember]);
      if (error) throw error;
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!isAdmin) return;
    if (memberId === currentProfile?.id) {
      showToast('You cannot revoke or deprovision your own active administrator account.', 'warning');
      return;
    }
    setProfiles((prev) => prev.filter((p) => p.id !== memberId));

    if (sessionUser) {
      const { error } = await supabase.from('profiles').delete().eq('id', memberId);
      if (error) throw error;
    }
  };

  // Credentials
  const handleAddCredential = (cred: Omit<ProjectCredential, 'id'>) => {
    const newCred: ProjectCredential = {
      id: `cred-${Date.now()}`,
      ...cred
    };
    setCredentials((prev) => [newCred, ...prev]);
  };

  const handleDeleteCredential = (id: string) => {
    setCredentials((prev) => prev.filter((c) => c.id !== id));
  };

  // Standalone Client Portal Page
  if (isPortalRoute) {
    return <ClientPortalPage clients={clients} projects={projects} />;
  }

  // Loading Screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-[#888888]">
        <IconCSC className="w-12 h-12 animate-pulse mb-4 text-white" />
        <p className="text-xs font-mono tracking-wide text-[#888888]">Initializing CyberSlayerCorpz Operations Desk...</p>
      </div>
    );
  }

  // Strict Supabase Authentication Gate (Invite-only)
  if (!sessionUser) {
    return <AuthGate authError={authError} onClearAuthError={() => setAuthError('')} />;
  }

  const pendingReviewsCount = tasks.filter((t) => t.status === 'Needs Review').length;
  const openLeadsCount = leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost').length;
  const activeProjectsCount = projects.filter((p) => p.stage !== 'Completed').length;

  const githubPat = localStorage.getItem('csc_github_token') || credentials.find((c) => c.service_type === 'API Key' && c.title.toLowerCase().includes('github'))?.secret;
  const vercelPat = localStorage.getItem('csc_vercel_token') || credentials.find((c) => c.service_type === 'Hosting' || c.title.toLowerCase().includes('vercel'))?.secret;
  const googleMapsKey = localStorage.getItem('csc_maps_key') || credentials.find((c) => c.title.toLowerCase().includes('maps'))?.secret;
  const discordWebhookUrl = localStorage.getItem('csc_discord_webhook') || credentials.find((c) => c.title.toLowerCase().includes('discord'))?.secret;

  return (
    <div className="min-h-screen bg-base text-zinc-100 flex flex-row selection:bg-white selection:text-zinc-950 font-sans">
      {/* Linear-Style Collapsible Left Sidebar */}
      <Sidebar
        currentProfile={currentProfile}
        pendingReviewsCount={pendingReviewsCount}
        openLeadsCount={openLeadsCount}
        activeProjectsCount={activeProjectsCount}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onUpdateStatus={handleUpdateStatus}
        onSignOut={handleSignOut}
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header Command Bar */}
        <Header
          user={currentProfile}
          isAdmin={isAdmin}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenQuickDrafter={() => setWhatsAppDrafter({ open: true, phone: '', businessName: '' })}
          onOpenBillingModal={() => setBillingModalOpen(true)}
          onSignOut={handleSignOut}
          onToggleMobileMenu={() => setMobileMenuOpen((v) => !v)}
        />


        {/* Pending Reviews Alert Banner */}
        <ReviewAlertBanner pendingCount={pendingReviewsCount} />

        {/* Dynamic Canvas Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
          <Routes>
            {/* Core Hubs */}
            <Route
              path="/"
              element={
                <OverviewView
                  projects={projects}
                  tasks={tasks}
                  leads={leads}
                  currentProfile={currentProfile}
                  onUpdateStatus={handleUpdateStatus}
                  onOpenTaskModal={() => setTaskModalOpen(true)}
                  onOpenLeadModal={() => setLeadModalOpen(true)}
                />
              }
            />
            <Route path="/overview" element={<Navigate to="/" replace />} />
            <Route
              path="/reviews"
              element={
                <ReviewBoardView
                  tasks={tasks}
                  projects={projects}
                  profiles={profiles}
                  isAdmin={isAdmin}
                  onOpenTaskModal={() => setTaskModalOpen(true)}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onDeleteTask={handleDeleteTask}
                />
              }
            />
            <Route
              path="/projects"
              element={
                <ProjectsView
                  projects={projects}
                  clients={clients}
                  isAdmin={isAdmin}
                  onOpenNewProject={() => setProjectModalOpen(true)}
                  onOpenIntake={(proj) => setIntakeProject(proj)}
                  onUpdateStage={handleUpdateProjectStage}
                  onUpdateMilestone={handleUpdateMilestone}
                  onIncrementRevision={handleIncrementRevision}
                  onDeleteProject={handleDeleteProject}
                />
              }
            />
            <Route
              path="/leads"
              element={
                <LeadsView
                  leads={leads}
                  isAdmin={isAdmin}
                  onOpenLeadModal={() => setLeadModalOpen(true)}
                  onOpenWhatsApp={(phone, businessName) =>
                    setWhatsAppDrafter({ open: true, phone, businessName })
                  }
                  onUpdateStatus={handleUpdateLeadStatus}
                  onDeleteLead={handleDeleteLead}
                  onImportProspect={handleImportProspect}
                />
              }
            />
            <Route
              path="/clients"
              element={
                <ClientsView
                  clients={clients}
                  projects={projects}
                  isAdmin={isAdmin}
                  onOpenNewClient={() => setClientModalOpen(true)}
                  onOpenMagicLink={(client) => setMagicLinkClient(client)}
                  onDeleteClient={handleDeleteClient}
                />
              }
            />

            {/* Dedicated Platform Decks */}
            <Route
              path="/decks/github"
              element={
                <GitHubDeck
                  initialToken={githubPat}
                  onUpdateToken={(t) => localStorage.setItem('csc_github_token', t)}
                />
              }
            />
            <Route
              path="/decks/vercel"
              element={
                <VercelDeck
                  initialToken={vercelPat}
                  onUpdateToken={(t) => localStorage.setItem('csc_vercel_token', t)}
                />
              }
            />
            <Route
              path="/decks/supabase"
              element={<SupabaseDeck />}
            />
            <Route
              path="/decks/maps"
              element={
                <GoogleMapsDeck
                  initialKey={googleMapsKey}
                  onImportLead={handleImportProspect}
                />
              }
            />
            <Route
              path="/decks/whatsapp"
              element={
                <WhatsAppDeck
                  clients={clients}
                  leads={leads}
                />
              }
            />
            <Route
              path="/decks/discord"
              element={
                <DiscordDeck
                  initialWebhookUrl={discordWebhookUrl}
                  onUpdateWebhook={(w) => localStorage.setItem('csc_discord_webhook', w)}
                />
              }
            />

            {/* Agency & Integrations */}
            <Route
              path="/connectors"
              element={
                <ConnectorsHub
                  isAdmin={isAdmin}
                  githubToken={githubPat}
                  vercelToken={vercelPat}
                  googleMapsKey={googleMapsKey}
                  discordWebhookUrl={discordWebhookUrl}
                />
              }
            />
            <Route path="/controls" element={<Navigate to="/connectors" replace />} />
            <Route
              path="/team"
              element={
                <TeamView
                  profiles={profiles}
                  currentUserId={currentProfile?.id || ''}
                  isAdmin={isAdmin}
                  onUpdateRole={handleUpdateMemberRole}
                  onToggleAdmin={handleToggleAdmin}
                  onAddMember={handleAddMember}
                  onDeleteMember={handleDeleteMember}
                />
              }
            />
            <Route
              path="/credentials"
              element={
                <CredentialsView
                  credentials={credentials}
                  onAddCredential={handleAddCredential}
                  onDeleteCredential={handleDeleteCredential}
                />
              }
            />
            <Route
              path="/settings/database"
              element={<DatabaseMigrationWizard />}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        projects={projects}
        leads={leads}
        clients={clients}
        onOpenNewProject={() => setProjectModalOpen(true)}
        onOpenNewLead={() => setLeadModalOpen(true)}
        onOpenNewTask={() => setTaskModalOpen(true)}
        onOpenWhatsAppDrafter={() => setWhatsAppDrafter({ open: true, phone: '', businessName: '' })}
        onOpenBillingModal={() => setBillingModalOpen(true)}
      />

      {/* Modals */}
      {taskModalOpen && (
        <TaskModal
          projects={projects}
          profiles={profiles}
          onClose={() => setTaskModalOpen(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {projectModalOpen && (
        <ProjectModal
          clients={clients}
          onClose={() => setProjectModalOpen(false)}
          onSubmit={handleCreateProject}
        />
      )}

      {intakeProject && (
        <IntakeModal
          project={intakeProject}
          onClose={() => setIntakeProject(null)}
          onSaveIntake={handleSaveIntake}
        />
      )}

      {leadModalOpen && (
        <LeadModal
          onClose={() => setLeadModalOpen(false)}
          onSubmit={handleCreateLead}
        />
      )}

      {clientModalOpen && (
        <ClientModal
          onClose={() => setClientModalOpen(false)}
          onSubmit={handleCreateClient}
        />
      )}

      {magicLinkClient && (
        <ClientMagicLinkModal
          client={magicLinkClient}
          projects={projects}
          onClose={() => setMagicLinkClient(null)}
        />
      )}

      {billingModalOpen && (
        <BillingCalculatorModal onClose={() => setBillingModalOpen(false)} />
      )}

      {whatsAppDrafter.open && (
        <WhatsAppDrafterModal
          initialPhone={whatsAppDrafter.phone}
          initialBusinessName={whatsAppDrafter.businessName}
          onClose={() => setWhatsAppDrafter({ open: false, phone: '', businessName: '' })}
        />
      )}

      {/* Global In-App Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-3.5 py-2.5 bg-black border border-[#222222] text-[#ededed] shadow-2xl rounded-md text-xs animate-in slide-in-from-bottom duration-150">
          {toast.type === 'error' && <IconAlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === 'warning' && <IconAlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
          {toast.type === 'success' && <IconCheck className="w-4 h-4 text-emerald-400 shrink-0" />}
          <span className="font-sans font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 -mr-1 text-[#888888] hover:text-white rounded hover:bg-[#181818] transition-colors ml-2"
            aria-label="Dismiss toast"
          >
            <IconX className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

