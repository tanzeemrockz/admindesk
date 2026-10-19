import React, { useState, useEffect, useCallback } from 'react';
import {
  verifyVercelToken,
  fetchVercelProjects,
  fetchVercelDeployments,
  triggerVercelRedeploy,
  fetchVercelEnvKeys,
  syncSupabaseToVercel,
  VercelProjectSummary
} from '../../services/vercelService';
import { VercelDeployment } from '../../types/vercel';
import {
  IconVercel,
  IconSupabase,
  IconRefresh,
  IconExternalLink,
  IconCheckCircle,
  IconLink,
  IconPlay,
  IconKey,
  IconAlertCircle
} from '../../lib/icons';

interface VercelDeckProps {
  initialToken?: string;
  onUpdateToken?: (token: string) => void;
}

export function VercelDeck({ initialToken = '', onUpdateToken }: VercelDeckProps) {
  const [token, setToken] = useState(() => localStorage.getItem('csc_vercel_token') || initialToken);
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'verifying' | 'error'>('disconnected');
  const [username, setUsername] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [projects, setProjects] = useState<VercelProjectSummary[]>([]);
  const [activeProject, setActiveProject] = useState<string>(() => localStorage.getItem('csc_vercel_active_project') || '');
  const [deployments, setDeployments] = useState<VercelDeployment[]>([]);
  const [envKeys, setEnvKeys] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [bridgeRunning, setBridgeRunning] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotice = (text: string, type: 'success' | 'error') => {
    setActionNotice({ text, type });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const verifyAndLoad = useCallback(async (tokenVal: string) => {
    if (!tokenVal.trim()) {
      setStatus('disconnected');
      setUsername(null);
      setProjects([]);
      return;
    }
    setStatus('verifying');
    setErrorMsg(null);

    const res = await verifyVercelToken(tokenVal);
    if (res.valid) {
      setStatus('connected');
      setUsername(res.username || res.email || 'Authenticated');
      const loadedProjects = await fetchVercelProjects(tokenVal);
      setProjects(loadedProjects);
      if (loadedProjects.length > 0 && !activeProject) {
        setActiveProject(loadedProjects[0].name);
        localStorage.setItem('csc_vercel_active_project', loadedProjects[0].name);
      }
    } else {
      setStatus('error');
      setErrorMsg(res.error || 'Vercel token validation failed.');
    }
  }, [activeProject]);

  useEffect(() => {
    if (token) verifyAndLoad(token);
  }, []);

  const loadProjectDetails = useCallback(async () => {
    if (!activeProject || status !== 'connected') return;
    setIsLoading(true);
    try {
      const [fetchedDeployments, fetchedEnvKeys] = await Promise.all([
        fetchVercelDeployments(activeProject, token),
        fetchVercelEnvKeys(activeProject, token)
      ]);
      setDeployments(fetchedDeployments);
      setEnvKeys(fetchedEnvKeys);
    } catch {
      // Handled in service
    } finally {
      setIsLoading(false);
    }
  }, [activeProject, status, token]);

  useEffect(() => {
    loadProjectDetails();
  }, [loadProjectDetails]);

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('csc_vercel_token', token);
    if (onUpdateToken) onUpdateToken(token);
    verifyAndLoad(token);
  };

  const handleRedeploy = async () => {
    if (!activeProject) return;
    setIsDeploying(true);
    const result = await triggerVercelRedeploy(activeProject, undefined, token);
    setIsDeploying(false);

    if (result.success) {
      showNotice(result.message, 'success');
      loadProjectDetails();
    } else {
      showNotice(result.message, 'error');
    }
  };

  const handleSyncSupabaseBridge = async () => {
    if (!activeProject || !token) {
      showNotice('Select active project and verify token.', 'error');
      return;
    }
    setBridgeRunning(true);
    const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://jerjcyesegdpbicfhajz.supabase.co';
    const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

    const result = await syncSupabaseToVercel(activeProject, token, supabaseUrl, supabaseAnonKey);
    setBridgeRunning(false);

    if (result.success) {
      showNotice(result.message, 'success');
      loadProjectDetails();
    } else {
      showNotice(result.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-surface border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-base border border-border text-white">
            <IconVercel className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-display text-white">Vercel Edge Deployments</h1>
              {status === 'connected' && (
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  {username}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Edge deployment monitoring, 1-click cloud redeployment, and cross-platform Supabase environment synchronization.
            </p>
          </div>
        </div>

        {/* Project Selector & Actions */}
        <div className="flex items-center gap-2">
          {status === 'connected' && projects.length > 0 && (
            <select
              value={activeProject}
              onChange={(e) => {
                setActiveProject(e.target.value);
                localStorage.setItem('csc_vercel_active_project', e.target.value);
              }}
              className="bg-base border border-border rounded-lg px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-zinc-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.name} className="bg-zinc-900">
                  {p.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={loadProjectDetails}
            disabled={isLoading || status !== 'connected'}
            className="px-3 py-1.5 rounded-lg bg-base hover:bg-elevated border border-border text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50"
            title="Refresh deployments"
          >
            <IconRefresh className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-base hover:bg-elevated border border-border text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
          >
            <IconExternalLink className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </a>
        </div>
      </div>

      {actionNotice && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
            actionNotice.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{actionNotice.text}</span>
          <button onClick={() => setActionNotice(null)} className="opacity-75 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Deployments (8 cols) & Bridge / Settings (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Deployments & Environment */}
        <div className="lg:col-span-8 space-y-6">
          {/* Deployments List */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Recent Deployments ({deployments.length})
              </h2>

              <button
                onClick={handleRedeploy}
                disabled={isDeploying || status !== 'connected' || !activeProject}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <IconPlay className="w-3.5 h-3.5 text-zinc-950" />
                <span>{isDeploying ? 'Triggering Build...' : 'Redeploy Project'}</span>
              </button>
            </div>

            {status !== 'connected' ? (
              <div className="p-8 text-center text-zinc-400 text-xs">
                Enter your Vercel API Token in the right panel to inspect deployments.
              </div>
            ) : isLoading ? (
              <div className="py-8 text-center text-zinc-500 text-xs animate-pulse">
                Querying Vercel REST API for deployments...
              </div>
            ) : deployments.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs">
                Zero deployments found for <span className="font-mono text-zinc-400">{activeProject}</span>.
              </div>
            ) : (
              <div className="space-y-3">
                {deployments.map((d) => (
                  <div
                    key={d.id}
                    className="p-4 rounded-xl bg-base border border-border flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs truncate">{d.name}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            d.state === 'READY'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : d.state === 'BUILDING'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {d.state}
                        </span>
                        {d.target === 'production' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-elevated border border-border text-zinc-300">
                            Production
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-2 font-mono">
                        <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <a
                          href={`https://${d.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-300 hover:text-white truncate max-w-xs underline underline-offset-2"
                        >
                          {d.url}
                        </a>
                      </div>
                    </div>

                    <a
                      href={`https://${d.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-surface hover:bg-elevated border border-border text-zinc-300 hover:text-white transition shrink-0"
                    >
                      <IconExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Project Environment Variables */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Configured Environment Keys ({envKeys.length})
              </h2>
              <span className="text-[11px] text-zinc-400">Production / Preview Encrypted</span>
            </div>

            {envKeys.length === 0 ? (
              <div className="py-6 text-center text-zinc-500 text-xs">
                No environment keys found or project not selected.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {envKeys.map((key) => (
                  <div
                    key={key}
                    className="p-2.5 rounded-lg bg-base border border-border font-mono text-xs flex items-center justify-between"
                  >
                    <span className="text-zinc-200 truncate">{key}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface text-emerald-400 border border-emerald-500/20">
                      SET
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Cross-Platform Bridge & PAT */}
        <div className="lg:col-span-4 space-y-6">
          {/* Cross-Platform Bridge Card */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <IconLink className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Cross-Platform Bridge
              </h2>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Instantly push active Supabase project credentials (<code className="text-zinc-300">VITE_SUPABASE_URL</code> &amp; <code className="text-zinc-300">VITE_SUPABASE_ANON_KEY</code>) to Vercel production environment variables.
            </p>

            <button
              onClick={handleSyncSupabaseBridge}
              disabled={bridgeRunning || status !== 'connected' || !activeProject}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
            >
              <IconSupabase className="w-4 h-4" />
              <IconLink className="w-3.5 h-3.5 text-indigo-200" />
              <IconVercel className="w-4 h-4" />
              <span>{bridgeRunning ? 'Pushing Env Vars...' : 'Sync Supabase $\\to$ Vercel'}</span>
            </button>
          </div>

          {/* Vercel Token Settings */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <IconKey className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Vercel API Token
              </h2>
            </div>

            <form onSubmit={handleSaveToken} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Access Token (vercel.com/account/tokens)
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste Vercel personal token"
                  className="w-full px-3 py-1.5 bg-base border border-border rounded-lg text-xs text-white font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-2">
                  <IconAlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 px-3 rounded-lg bg-elevated hover:bg-zinc-800 border border-border text-white font-semibold text-xs transition"
              >
                Save &amp; Verify Token
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
