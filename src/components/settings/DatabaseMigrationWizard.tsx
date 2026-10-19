import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  DEMO_PROFILES,
  DEMO_PROJECTS,
  DEMO_TASKS,
  DEMO_LEADS,
  DEMO_CLIENTS,
  DEMO_CREDENTIALS
} from '../../lib/demoData';
import {
  IconDatabase,
  IconCheckCircle,
  IconAlertCircle,
  IconCopy,
  IconCheck,
  IconRefresh,
  IconExternalLink,
  IconPlay
} from '../../lib/icons';
import { Button, Badge } from '../ui';

interface TableCheck {
  table: string;
  exists: boolean;
  count: number;
  loading: boolean;
  error?: string;
}

export function DatabaseMigrationWizard() {
  const [tableChecks, setTableChecks] = useState<TableCheck[]>([
    { table: 'profiles', exists: false, count: 0, loading: true },
    { table: 'projects', exists: false, count: 0, loading: true },
    { table: 'tasks', exists: false, count: 0, loading: true },
    { table: 'leads', exists: false, count: 0, loading: true },
    { table: 'clients', exists: false, count: 0, loading: true },
    { table: 'project_credentials', exists: false, count: 0, loading: true }
  ]);
  const [seeding, setSeeding] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const checkTables = async () => {
    const updated = await Promise.all(
      tableChecks.map(async (t) => {
        try {
          const { count, error } = await supabase
            .from(t.table)
            .select('*', { count: 'exact', head: true });

          if (error) {
            return {
              ...t,
              exists: false,
              count: 0,
              loading: false,
              error: error.message
            };
          }
          return {
            ...t,
            exists: true,
            count: count ?? 0,
            loading: false,
            error: undefined
          };
        } catch (e: any) {
          return {
            ...t,
            exists: false,
            count: 0,
            loading: false,
            error: e.message || 'Connection failed'
          };
        }
      })
    );
    setTableChecks(updated);
  };

  useEffect(() => {
    checkTables();
  }, []);

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setLogs([]);
    const appendLog = (msg: string) => setLogs((prev) => [...prev, msg]);

    try {
      appendLog('Initiating CyberSlayerCorpz portfolio database sync...');

      // 1. Profiles
      appendLog('Upserting Founder Mohamed Tanzeem and core team profiles...');
      const { error: profErr } = await supabase
        .from('profiles')
        .upsert(DEMO_PROFILES, { onConflict: 'id' });
      if (profErr) throw new Error(`Profiles: ${profErr.message}`);
      appendLog(`Successfully synced ${DEMO_PROFILES.length} profiles.`);

      // 2. Clients
      appendLog('Upserting authentic CSC clients directory...');
      const { error: clientErr } = await supabase
        .from('clients')
        .upsert(DEMO_CLIENTS, { onConflict: 'id' });
      if (clientErr) throw new Error(`Clients: ${clientErr.message}`);
      appendLog(`Successfully synced ${DEMO_CLIENTS.length} client organizations.`);

      // 3. Projects
      appendLog('Upserting authentic CSC portfolio projects...');
      const { error: projErr } = await supabase
        .from('projects')
        .upsert(DEMO_PROJECTS, { onConflict: 'id' });
      if (projErr) throw new Error(`Projects: ${projErr.message}`);
      appendLog(`Successfully synced ${DEMO_PROJECTS.length} active portfolio contracts.`);

      // 4. Tasks
      appendLog('Upserting internal review and development tasks...');
      const { error: taskErr } = await supabase
        .from('tasks')
        .upsert(DEMO_TASKS, { onConflict: 'id' });
      if (taskErr) throw new Error(`Tasks: ${taskErr.message}`);
      appendLog(`Successfully synced ${DEMO_TASKS.length} tasks.`);

      // 5. Leads
      appendLog('Upserting verified Google Maps pipeline leads...');
      const { error: leadErr } = await supabase
        .from('leads')
        .upsert(DEMO_LEADS, { onConflict: 'id' });
      if (leadErr) throw new Error(`Leads: ${leadErr.message}`);
      appendLog(`Successfully synced ${DEMO_LEADS.length} pipeline leads.`);

      // 6. Credentials
      appendLog('Upserting production project credentials vault...');
      const { error: credErr } = await supabase
        .from('project_credentials')
        .upsert(DEMO_CREDENTIALS, { onConflict: 'id' });
      if (credErr) throw new Error(`Credentials: ${credErr.message}`);
      appendLog(`Successfully synced ${DEMO_CREDENTIALS.length} credential entries.`);

      appendLog('Production portfolio database sync completed successfully!');
      await checkTables();
    } catch (err: any) {
      appendLog(`ERROR: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const copySqlScript = () => {
    navigator.clipboard.writeText(FULL_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-zinc-800/80">
        <div>
          <h2 className="font-display text-lg font-semibold text-zinc-100 tracking-tight">
            Database Migration &amp; Schema Wizard
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            PostgreSQL schema verification, table health monitoring, and CSC schema synchronization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={checkTables}
            leftIcon={<IconRefresh className="w-3.5 h-3.5" />}
          >
            Check Connectivity
          </Button>
          <a
            href="https://supabase.com/dashboard/project/jerjcyesegdpbicfhajz/sql/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<IconExternalLink className="w-3.5 h-3.5 text-emerald-400" />}
            >
              Supabase SQL Editor
            </Button>
          </a>
        </div>
      </div>

      {/* Grid: Live Tables Health & 1-Click Seeder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Table Status Checklist */}
        <div className="lg:col-span-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              PostgreSQL Table Registry
            </h3>
            <span className="text-[11px] text-zinc-400 font-mono">
              {tableChecks.filter((t) => t.exists).length} of {tableChecks.length} tables active
            </span>
          </div>

          <div className="space-y-2">
            {tableChecks.map((t) => (
              <div
                key={t.table}
                className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  {t.loading ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 animate-pulse" />
                  ) : t.exists ? (
                    <IconCheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <IconAlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <span className="font-mono font-medium text-zinc-100">{t.table}</span>
                    {t.error && (
                      <div className="text-[10px] text-rose-400 truncate max-w-xs mt-0.5">
                        {t.error}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {t.loading ? '...' : `${t.count} records`}
                  </span>
                  <Badge variant={t.exists ? 'emerald' : 'rose'} size="sm">
                    {t.exists ? 'Ready' : 'Missing'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* 1-Click Seeder Button */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleSeedDatabase}
              disabled={seeding}
              isLoading={seeding}
              className="w-full justify-center"
              leftIcon={<IconPlay className="w-3.5 h-3.5" />}
            >
              {seeding ? 'Syncing Authentic CSC Portfolio...' : 'Seed Production CSC Portfolio Data'}
            </Button>
          </div>

          {/* Realtime Seeder Logs */}
          {logs.length > 0 && (
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-[11px] space-y-1 max-h-44 overflow-y-auto">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={log.startsWith('ERROR') ? 'text-rose-400' : 'text-emerald-400'}
                >
                  &gt; {log}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Copyable DDL SQL Script */}
        <div className="lg:col-span-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-3 flex flex-col shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                Supabase DDL Migration Script
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Run in Supabase SQL Web Editor if tables are missing
              </p>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={copySqlScript}
              leftIcon={copiedSql ? <IconCheck className="w-3.5 h-3.5 text-emerald-400" /> : <IconCopy className="w-3.5 h-3.5" />}
            >
              {copiedSql ? 'Copied' : 'Copy SQL'}
            </Button>
          </div>

          <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-[11px] text-zinc-300 overflow-y-auto max-h-[460px] leading-relaxed select-all">
            <pre className="text-zinc-400">{FULL_SQL_SCHEMA}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

const FULL_SQL_SCHEMA = `-- ==============================================================================
-- CyberSlayerCorpz (CSC) AdminDesk Production PostgreSQL Schema
-- Founder: Mohamed Tanzeem | Brand: CyberSlayerCorpz
-- ==============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Developer', 'Designer', 'Intern')),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Busy', 'Away', 'Offline')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  magic_token TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  client_id TEXT REFERENCES public.clients(id) ON DELETE SET NULL,
  stage TEXT NOT NULL CHECK (stage IN ('Asset Intake', 'In Development', 'Client Review', 'DNS / Launch', 'Completed')),
  milestone_stage TEXT CHECK (milestone_stage IN ('Intake & Discovery', 'Design & Wireframes', 'Core Development', 'Client Feedback QA', 'DNS Cutover & Launch')),
  contract_value_inr NUMERIC NOT NULL DEFAULT 0,
  intake_checklist JSONB NOT NULL DEFAULT '{}'::jsonb,
  drive_url TEXT,
  staging_url TEXT,
  production_url TEXT,
  revision_round INTEGER NOT NULL DEFAULT 0,
  max_included_revisions INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('To Do', 'In Progress', 'Needs Review', 'Approved')),
  review_pr_url TEXT,
  review_staging_url TEXT,
  review_branch TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  source TEXT NOT NULL,
  phone TEXT,
  estimated_value_inr NUMERIC NOT NULL DEFAULT 0,
  has_website BOOLEAN NOT NULL DEFAULT false,
  website_url TEXT,
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('Cold Contact', 'Contacted', 'Pitch Scheduled', 'Proposal Sent', 'Won', 'Lost')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Project Credentials Table
CREATE TABLE IF NOT EXISTS public.project_credentials (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  service_type TEXT NOT NULL,
  username TEXT,
  secret TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS) Configuration
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_credentials ENABLE ROW LEVEL SECURITY;

-- Development / Operations Permissive Policies
CREATE POLICY IF NOT EXISTS "Allow read all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow modify profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Allow read all clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow modify clients" ON public.clients FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Allow read all projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow modify projects" ON public.projects FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Allow read all tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow modify tasks" ON public.tasks FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Allow read all leads" ON public.leads FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow modify leads" ON public.leads FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Allow read all credentials" ON public.project_credentials FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow modify credentials" ON public.project_credentials FOR ALL USING (true);
`;
