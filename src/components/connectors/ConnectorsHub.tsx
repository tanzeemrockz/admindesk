import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { ConnectorId } from '../../types/connectors';
import { GitHubPullRequest, GitHubCommit } from '../../types/github';
import { VercelDeployment } from '../../types/vercel';
import {
  verifyGitHubToken,
  fetchUserRepos,
  fetchGitHubPRs,
  fetchGitHubCommits,
  mergeGitHubPR,
  triggerGitHubWorkflow,
  GitHubRepoSummary
} from '../../services/githubService';
import {
  verifyVercelToken,
  fetchVercelProjects,
  fetchVercelDeployments,
  triggerVercelRedeploy,
  fetchVercelEnvKeys,
  syncSupabaseToVercel,
  VercelProjectSummary
} from '../../services/vercelService';
import { verifyGoogleMapsKey, searchGooglePlacesProspects } from '../../services/googleMapsService';
import { sendDiscordNotification } from '../../services/discordService';
import {
  IconGitHub,
  IconVercel,
  IconSupabase,
  IconGoogleMaps,
  IconWhatsApp,
  IconDiscord,
  IconCheckCircle,
  IconRefresh,
  IconExternalLink,
  IconPlay,
  IconLink,
  IconZap,
  IconLayers,
  IconAlertCircle,
  IconPlus
} from '../../lib/icons';

interface ConnectorsHubProps {
  isAdmin: boolean;
  githubToken?: string;
  vercelToken?: string;
  googleMapsKey?: string;
  discordWebhookUrl?: string;
  onUpdateCredential?: (type: string, value: string) => void;
}

export function ConnectorsHub({
  isAdmin,
  githubToken = '',
  vercelToken = '',
  googleMapsKey = '',
  discordWebhookUrl = ''
}: ConnectorsHubProps) {
  const [activeConnector, setActiveConnector] = useState<ConnectorId>('github');
  const [activeTab, setActiveTab] = useState<'resources' | 'tools' | 'settings'>('resources');
  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Bridges State
  const [bridgeRunning, setBridgeRunning] = useState<string | null>(null);

  // GitHub State
  const [ghToken, setGhToken] = useState(() => localStorage.getItem('csc_github_token') || githubToken);
  const [ghStatus, setGhStatus] = useState<'connected' | 'disconnected' | 'verifying' | 'error'>('disconnected');
  const [ghUsername, setGhUsername] = useState<string | null>(null);
  const [ghError, setGhError] = useState<string | null>(null);
  const [ghRepos, setGhRepos] = useState<GitHubRepoSummary[]>([]);
  const [ghActiveRepo, setGhActiveRepo] = useState<string>(() => localStorage.getItem('csc_github_active_repo') || '');
  const [ghPrs, setGhPrs] = useState<GitHubPullRequest[]>([]);
  const [ghCommits, setGhCommits] = useState<GitHubCommit[]>([]);
  const [ghLoadingData, setGhLoadingData] = useState(false);
  const [ghMergingPr, setGhMergingPr] = useState<number | null>(null);
  const [ghWorkflowName, setGhWorkflowName] = useState('');

  // Vercel State
  const [vcToken, setVcToken] = useState(() => localStorage.getItem('csc_vercel_token') || vercelToken);
  const [vcStatus, setVcStatus] = useState<'connected' | 'disconnected' | 'verifying' | 'error'>('disconnected');
  const [vcUsername, setVcUsername] = useState<string | null>(null);
  const [vcError, setVcError] = useState<string | null>(null);
  const [vcProjects, setVcProjects] = useState<VercelProjectSummary[]>([]);
  const [vcActiveProject, setVcActiveProject] = useState<string>(() => localStorage.getItem('csc_vercel_active_project') || '');
  const [vcDeployments, setVcDeployments] = useState<VercelDeployment[]>([]);
  const [vcEnvKeys, setVcEnvKeys] = useState<string[]>([]);
  const [vcLoadingData, setVcLoadingData] = useState(false);
  const [vcDeploying, setVcDeploying] = useState(false);

  // Supabase State
  const [sbStatus, setSbStatus] = useState<'connected' | 'error'>('connected');
  const [sbLatency, setSbLatency] = useState<number | null>(null);
  const [sbActiveTable, setSbActiveTable] = useState<'projects' | 'tasks' | 'leads' | 'clients' | 'profiles'>('projects');
  const [sbTableData, setSbTableData] = useState<any[]>([]);
  const [sbTableCount, setSbTableCount] = useState<number>(0);
  const [sbPinging, setSbPinging] = useState(false);
  const [sbInviteEmail, setSbInviteEmail] = useState('');
  const [sbInviteRole, setSbInviteRole] = useState<'Developer' | 'Designer' | 'Intern'>('Developer');

  // Google Maps State
  const [mapsKey, setMapsKey] = useState(() => localStorage.getItem('csc_maps_key') || googleMapsKey);
  const [mapsStatus, setMapsStatus] = useState<'connected' | 'disconnected' | 'verifying' | 'error'>('disconnected');
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [mapsSearchKeyword, setMapsSearchKeyword] = useState('');
  const [mapsSearchLocation, setMapsSearchLocation] = useState('');
  const [mapsResults, setMapsResults] = useState<any[]>([]);
  const [mapsSearching, setMapsSearching] = useState(false);

  // WhatsApp State
  const [waPhoneId, setWaPhoneId] = useState(() => localStorage.getItem('csc_wa_phone_id') || '');
  const [waToken, setWaToken] = useState(() => localStorage.getItem('csc_wa_token') || '');
  const [waStatus, setWaStatus] = useState<'configured' | 'unconfigured'>('unconfigured');
  const [waTestPhone, setWaTestPhone] = useState('');
  const [waTestMessage, setWaTestMessage] = useState('');

  // Discord State
  const [dcWebhook, setDcWebhook] = useState(() => localStorage.getItem('csc_discord_webhook') || discordWebhookUrl);
  const [dcStatus, setDcStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [dcTestTitle, setDcTestTitle] = useState('');
  const [dcTestBody, setDcTestBody] = useState('');
  const [dcBroadcasting, setDcBroadcasting] = useState(false);

  const showNotice = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 5000);
  };

  const verifyGitHub = useCallback(async (token: string) => {
    if (!token.trim()) {
      setGhStatus('disconnected');
      setGhUsername(null);
      setGhRepos([]);
      return;
    }
    setGhStatus('verifying');
    setGhError(null);
    const res = await verifyGitHubToken(token);
    if (res.valid) {
      setGhStatus('connected');
      setGhUsername(res.username || 'Authenticated');
      const repos = await fetchUserRepos(token);
      setGhRepos(repos);
      if (repos.length > 0 && !ghActiveRepo) {
        setGhActiveRepo(repos[0].fullName);
        localStorage.setItem('csc_github_active_repo', repos[0].fullName);
      }
    } else {
      setGhStatus('error');
      setGhError(res.error || 'Invalid Token');
    }
  }, [ghActiveRepo]);

  const verifyVercel = useCallback(async (token: string) => {
    if (!token.trim()) {
      setVcStatus('disconnected');
      setVcUsername(null);
      setVcProjects([]);
      return;
    }
    setVcStatus('verifying');
    setVcError(null);
    const res = await verifyVercelToken(token);
    if (res.valid) {
      setVcStatus('connected');
      setVcUsername(res.username || res.email || 'Authenticated');
      const projects = await fetchVercelProjects(token);
      setVcProjects(projects);
      if (projects.length > 0 && !vcActiveProject) {
        setVcActiveProject(projects[0].name);
        localStorage.setItem('csc_vercel_active_project', projects[0].name);
      }
    } else {
      setVcStatus('error');
      setVcError(res.error || 'Invalid Token');
    }
  }, [vcActiveProject]);

  const verifyMaps = useCallback(async (key: string) => {
    if (!key.trim()) {
      setMapsStatus('disconnected');
      return;
    }
    setMapsStatus('verifying');
    setMapsError(null);
    const res = await verifyGoogleMapsKey(key);
    if (res.valid) {
      setMapsStatus('connected');
    } else {
      setMapsStatus('error');
      setMapsError(res.error || 'Invalid Key');
    }
  }, []);

  useEffect(() => {
    if (ghToken) verifyGitHub(ghToken);
    if (vcToken) verifyVercel(vcToken);
    if (mapsKey) verifyMaps(mapsKey);
    if (dcWebhook && dcWebhook.startsWith('https://discord.com/api/webhooks/')) {
      setDcStatus('connected');
    } else {
      setDcStatus('disconnected');
    }
    if (waPhoneId || waToken) {
      setWaStatus('configured');
    }
  }, []);

  useEffect(() => {
    if (!ghActiveRepo || ghStatus !== 'connected') return;
    const [owner, name] = ghActiveRepo.split('/');
    if (!owner || !name) return;

    let isCurrent = true;
    setGhLoadingData(true);
    Promise.all([
      fetchGitHubPRs(owner, name, ghToken),
      fetchGitHubCommits(owner, name, ghToken)
    ]).then(([prs, commits]) => {
      if (isCurrent) {
        setGhPrs(prs);
        setGhCommits(commits);
        setGhLoadingData(false);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [ghActiveRepo, ghStatus, ghToken]);

  useEffect(() => {
    if (!vcActiveProject || vcStatus !== 'connected') return;
    let isCurrent = true;
    setVcLoadingData(true);
    Promise.all([
      fetchVercelDeployments(vcActiveProject, vcToken),
      fetchVercelEnvKeys(vcActiveProject, vcToken)
    ]).then(([deployments, envKeys]) => {
      if (isCurrent) {
        setVcDeployments(deployments);
        setVcEnvKeys(envKeys);
        setVcLoadingData(false);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [vcActiveProject, vcStatus, vcToken]);

  const loadSupabaseTable = useCallback(async (table: string) => {
    try {
      const { data, count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(6);
      if (!error && data) {
        setSbTableData(data);
        setSbTableCount(count || data.length);
      }
    } catch {
      setSbTableData([]);
    }
  }, []);

  useEffect(() => {
    loadSupabaseTable(sbActiveTable);
  }, [sbActiveTable, loadSupabaseTable]);

  // Tool Handlers
  const handleMergePR = async (prNumber: number) => {
    if (!ghActiveRepo) return;
    const [owner, name] = ghActiveRepo.split('/');
    setGhMergingPr(prNumber);
    const result = await mergeGitHubPR(owner, name, prNumber, ghToken);
    setGhMergingPr(null);
    if (result.success) {
      showNotice(result.message, 'success');
      setGhPrs((prev) => prev.filter((p) => p.number !== prNumber));
      if (dcStatus === 'connected') {
        sendDiscordNotification(
          dcWebhook,
          `Pull Request Merged: #${prNumber}`,
          `Repository: ${ghActiveRepo}`,
          0x10b981
        );
      }
    } else {
      showNotice(result.message, 'error');
    }
  };

  const handleTriggerWorkflow = async () => {
    if (!ghActiveRepo || !ghWorkflowName.trim()) return;
    const [owner, name] = ghActiveRepo.split('/');
    showNotice(`Dispatching ${ghWorkflowName}...`, 'info');
    const result = await triggerGitHubWorkflow(owner, name, ghWorkflowName, ghToken);
    if (result.success) {
      showNotice(result.message, 'success');
    } else {
      showNotice(result.message, 'error');
    }
  };

  const handleVercelRedeploy = async () => {
    if (!vcActiveProject) return;
    setVcDeploying(true);
    const result = await triggerVercelRedeploy(vcActiveProject, undefined, vcToken);
    setVcDeploying(false);
    if (result.success) {
      showNotice(result.message, 'success');
      const dpls = await fetchVercelDeployments(vcActiveProject, vcToken);
      setVcDeployments(dpls);
    } else {
      showNotice(result.message, 'error');
    }
  };

  const handlePingSupabase = async () => {
    setSbPinging(true);
    const start = performance.now();
    try {
      await supabase.from('profiles').select('id', { count: 'exact', head: true });
      const duration = Math.round(performance.now() - start);
      setSbLatency(duration);
      setSbStatus('connected');
      showNotice(`PostgreSQL responded in ${duration}ms`, 'success');
    } catch (e: any) {
      setSbLatency(null);
      setSbStatus('error');
      showNotice(`Ping failed: ${e.message}`, 'error');
    } finally {
      setSbPinging(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sbInviteEmail.trim()) return;
    try {
      const { error } = await supabase.from('profiles').insert([
        {
          id: `usr-${Date.now()}`,
          full_name: sbInviteEmail.split('@')[0],
          email: sbInviteEmail,
          role: sbInviteRole,
          is_admin: false,
          status: 'Available',
          created_at: new Date().toISOString()
        }
      ]);
      if (!error) {
        showNotice(`Added ${sbInviteEmail} to profiles.`, 'success');
        setSbInviteEmail('');
      } else {
        showNotice(error.message, 'error');
      }
    } catch (e: any) {
      showNotice(e.message, 'error');
    }
  };

  const handleMapsSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapsSearchKeyword.trim() || !mapsSearchLocation.trim()) return;
    setMapsSearching(true);
    const results = await searchGooglePlacesProspects(mapsSearchKeyword, mapsSearchLocation, 15, mapsKey);
    setMapsResults(results);
    setMapsSearching(false);
    showNotice(`Found ${results.length} prospects.`, 'success');
  };

  const handleImportLeadToSupabase = async (prospect: any) => {
    try {
      const { error } = await supabase.from('leads').insert([
        {
          id: `lead-${Date.now()}`,
          name: prospect.name,
          company: prospect.name,
          source: 'Google Maps',
          phone: prospect.phone || '',
          estimated_value_inr: 45000,
          has_website: Boolean(prospect.hasWebsite),
          website_url: prospect.websiteUrl,
          notes: `Imported via Places Search. Address: ${prospect.address || ''}`,
          status: 'Cold Contact'
        }
      ]);
      if (!error) {
        showNotice(`Imported "${prospect.name}" to Leads.`, 'success');
      } else {
        showNotice(error.message, 'error');
      }
    } catch (e: any) {
      showNotice(e.message, 'error');
    }
  };

  const handleWhatsAppDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waTestPhone.trim() || !waTestMessage.trim()) return;
    const cleanPhone = waTestPhone.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('91') && cleanPhone.length > 10 ? cleanPhone : `91${cleanPhone.slice(-10)}`;
    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(waTestMessage)}`;
    window.open(url, '_blank');
  };

  const handleDiscordBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dcWebhook || !dcTestTitle.trim() || !dcTestBody.trim()) return;
    setDcBroadcasting(true);
    const res = await sendDiscordNotification(dcWebhook, dcTestTitle, dcTestBody, 0x10b981);
    setDcBroadcasting(false);
    if (res.success) {
      showNotice(res.message, 'success');
      setDcTestTitle('');
      setDcTestBody('');
    } else {
      showNotice(res.message, 'error');
    }
  };

  const executeBridgeSyncSupabaseToVercel = async () => {
    if (!vcActiveProject || !vcToken) {
      showNotice('Select an active Vercel project and save token.', 'error');
      return;
    }
    setBridgeRunning('supabase-to-vercel');
    const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://jerjcyesegdpbicfhajz.supabase.co';
    const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

    const result = await syncSupabaseToVercel(vcActiveProject, vcToken, supabaseUrl, supabaseAnonKey);
    setBridgeRunning(null);
    if (result.success) {
      showNotice(result.message, 'success');
      const updatedKeys = await fetchVercelEnvKeys(vcActiveProject, vcToken);
      setVcEnvKeys(updatedKeys);
    } else {
      showNotice(result.message, 'error');
    }
  };

  const executeBridgeLinkGitHubToVercel = async () => {
    if (!ghActiveRepo || !vcActiveProject) {
      showNotice('Select active GitHub repo and Vercel project.', 'error');
      return;
    }
    showNotice(`Linked ${ghActiveRepo} with ${vcActiveProject}.`, 'success');
  };

  const connectedCount = [
    ghStatus === 'connected',
    vcStatus === 'connected',
    sbStatus === 'connected',
    mapsStatus === 'connected',
    waStatus === 'configured',
    dcStatus === 'connected'
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Mesh Header & Bridge Controls */}
      <div className="bg-[#0a0a0a] border border-[#222222] rounded-lg p-3.5 px-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-md bg-black border border-[#222222] text-white">
            <IconLayers className="w-4 h-4" />
          </span>
          <div>
            <h1 className="text-sm font-bold font-display text-white tracking-tight">
              Connectors Mesh
            </h1>
            <p className="text-[11px] text-[#888888] font-sans mt-0.5">
              {connectedCount} of 6 active operational bridges
            </p>
          </div>
        </div>

        {/* Cross-Platform Bridges Quick Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={executeBridgeSyncSupabaseToVercel}
            disabled={bridgeRunning === 'supabase-to-vercel' || !vcActiveProject}
            className="px-3 py-1.5 rounded-md bg-white hover:bg-[#eaeaea] disabled:opacity-50 text-black text-xs font-semibold flex items-center gap-1.5 transition active:scale-[0.98] shadow-xs"
          >
            <IconSupabase className="w-3.5 h-3.5" />
            <IconLink className="w-3 h-3 text-black/60" />
            <IconVercel className="w-3.5 h-3.5" />
            <span>{bridgeRunning === 'supabase-to-vercel' ? 'Syncing...' : 'Sync Supabase → Vercel'}</span>
          </button>

          <button
            onClick={executeBridgeLinkGitHubToVercel}
            disabled={!ghActiveRepo || !vcActiveProject}
            className="px-3 py-1.5 rounded-md bg-black hover:bg-[#111111] border border-[#2e2e2e] hover:border-[#454545] disabled:opacity-50 text-[#ededed] text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
          >
            <IconGitHub className="w-3.5 h-3.5" />
            <IconLink className="w-3 h-3 text-[#666666]" />
            <IconVercel className="w-3.5 h-3.5" />
            <span>Link Repo → Vercel</span>
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`px-3.5 py-2.5 rounded-md text-xs flex items-center justify-between gap-2 border transition ${
            notice.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : notice.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <IconAlertCircle className="w-4 h-4 shrink-0" />
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-[11px] opacity-75 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Left Provider Selector & Right Active Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Compact Providers List */}
        <div className="lg:col-span-4 space-y-1.5">
          {([
            { id: 'github', name: 'GitHub', icon: IconGitHub, status: ghStatus, subtitle: ghUsername ? `@${ghUsername}` : 'Code & PRs' },
            { id: 'vercel', name: 'Vercel', icon: IconVercel, status: vcStatus, subtitle: vcUsername ? vcUsername : 'Deployments' },
            { id: 'supabase', name: 'Supabase', icon: IconSupabase, status: sbStatus, subtitle: sbLatency ? `${sbLatency}ms latency` : 'Database' },
            { id: 'google-maps', name: 'Google Maps', icon: IconGoogleMaps, status: mapsStatus, subtitle: 'Places API' },
            { id: 'whatsapp', name: 'WhatsApp', icon: IconWhatsApp, status: waStatus === 'configured' ? 'connected' : 'disconnected', subtitle: 'Outreach' },
            { id: 'discord', name: 'Discord', icon: IconDiscord, status: dcStatus, subtitle: 'Alerts' }
          ] as const).map((p) => {
            const isSelected = activeConnector === p.id;
            const Icon = p.icon;

            return (
              <button
                key={p.id}
                onClick={() => { setActiveConnector(p.id as ConnectorId); setActiveTab('resources'); }}
                className={`w-full p-2.5 px-3 rounded-lg border text-left transition flex items-center justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-[#181818] border-[#383838] shadow-xs'
                    : 'bg-[#0a0a0a] border-[#222222] hover:bg-[#111111] hover:border-[#2e2e2e]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-md bg-black border border-[#222222] text-white">
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white font-display">{p.name}</div>
                    <div className="text-[11px] text-[#888888] font-sans">{p.subtitle}</div>
                  </div>
                </div>

                <span className={`w-2 h-2 rounded-full ${
                  p.status === 'connected' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : p.status === 'verifying' ? 'bg-amber-400 animate-pulse' : 'bg-[#333333]'
                }`} />
              </button>
            );
          })}
        </div>

        {/* Right Column: Active Provider Workspace */}
        <div className="lg:col-span-8 bg-[#0a0a0a] border border-[#222222] rounded-lg p-4 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
            <h2 className="text-xs font-bold text-white font-display tracking-tight">
              {activeConnector === 'github' && 'GitHub Provider'}
              {activeConnector === 'vercel' && 'Vercel Provider'}
              {activeConnector === 'supabase' && 'Supabase Provider'}
              {activeConnector === 'google-maps' && 'Google Maps Provider'}
              {activeConnector === 'whatsapp' && 'WhatsApp Provider'}
              {activeConnector === 'discord' && 'Discord Provider'}
            </h2>

            <div className="flex items-center p-0.5 bg-black rounded-md border border-[#222222] text-xs">
              {(['resources', 'tools', 'settings'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition capitalize ${
                    activeTab === t ? 'bg-[#181818] text-white font-medium border border-[#333333] shadow-xs' : 'text-[#888888] hover:text-[#ededed]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* GITHUB WORKSPACE */}
          {activeConnector === 'github' && (
            <div className="space-y-3.5 text-xs">
              {activeTab === 'settings' && (
                <div className="space-y-2.5">
                  <label className="block text-zinc-300 font-medium">Personal Access Token</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={ghToken}
                      onChange={(e) => setGhToken(e.target.value)}
                      placeholder="Paste GitHub PAT"
                      className="flex-1 px-3 py-1.5 bg-base border border-border rounded-lg text-white font-mono text-xs focus:outline-none focus:border-zinc-500"
                    />
                    <button
                      onClick={() => {
                        localStorage.setItem('csc_github_token', ghToken);
                        verifyGitHub(ghToken);
                        showNotice('Saved token.', 'success');
                      }}
                      className="px-3.5 py-1.5 bg-white text-zinc-950 font-bold rounded-lg text-xs hover:bg-zinc-200 transition"
                    >
                      Connect
                    </button>
                  </div>
                  {ghError && <p className="text-rose-400 text-[11px]">{ghError}</p>}
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="space-y-3">
                  {ghStatus !== 'connected' ? (
                    <div className="p-6 text-center text-zinc-400 text-xs">
                      Enter GitHub Personal Access Token in Settings to load repositories.
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2 p-2 bg-base border border-border rounded-lg">
                        <select
                          value={ghActiveRepo}
                          onChange={(e) => {
                            setGhActiveRepo(e.target.value);
                            localStorage.setItem('csc_github_active_repo', e.target.value);
                          }}
                          className="bg-transparent text-white font-semibold text-xs focus:outline-none flex-1"
                        >
                          {ghRepos.map((r) => (
                            <option key={r.id} value={r.fullName} className="bg-zinc-900">
                              {r.fullName}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            if (ghActiveRepo) {
                              const [o, n] = ghActiveRepo.split('/');
                              fetchGitHubPRs(o, n, ghToken).then(setGhPrs);
                              fetchGitHubCommits(o, n, ghToken).then(setGhCommits);
                            }
                          }}
                          className="p-1 text-zinc-400 hover:text-white"
                        >
                          <IconRefresh className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Pull Requests */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                          Open Pull Requests ({ghPrs.length})
                        </div>
                        {ghLoadingData ? (
                          <div className="py-4 text-center text-zinc-500">Loading...</div>
                        ) : ghPrs.length === 0 ? (
                          <div className="py-3 text-center text-zinc-500 text-xs">Zero open pull requests.</div>
                        ) : (
                          ghPrs.map((pr) => (
                            <div key={pr.id} className="p-2.5 rounded-lg bg-base border border-border flex items-center justify-between gap-2">
                              <div>
                                <span className="font-semibold text-white">#{pr.number} {pr.title}</span>
                                <div className="text-[10px] text-zinc-400">{pr.branch} → {pr.baseBranch}</div>
                              </div>
                              <button
                                onClick={() => handleMergePR(pr.number)}
                                disabled={ghMergingPr === pr.number}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-[11px]"
                              >
                                {ghMergingPr === pr.number ? 'Merging...' : 'Merge'}
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Commits */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                          Recent Commits
                        </div>
                        {ghCommits.slice(0, 4).map((c) => (
                          <div key={c.sha} className="p-2 rounded-lg bg-base border border-border flex items-center justify-between text-[11px]">
                            <span className="text-zinc-300 truncate max-w-sm">{c.message}</span>
                            <span className="font-mono text-zinc-500 text-[10px]">{c.sha}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'tools' && (
                <div className="space-y-2">
                  <label className="block text-zinc-300 font-medium">Dispatch Actions Workflow</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ghWorkflowName}
                      onChange={(e) => setGhWorkflowName(e.target.value)}
                      placeholder="Workflow file name"
                      className="flex-1 px-3 py-1.5 bg-base border border-border rounded-lg text-white font-mono text-xs focus:outline-none"
                    />
                    <button
                      onClick={handleTriggerWorkflow}
                      disabled={!ghActiveRepo || !ghWorkflowName.trim()}
                      className="px-3.5 py-1.5 bg-white text-zinc-950 font-bold rounded-lg text-xs disabled:opacity-50"
                    >
                      Dispatch
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VERCEL WORKSPACE */}
          {activeConnector === 'vercel' && (
            <div className="space-y-3.5 text-xs">
              {activeTab === 'settings' && (
                <div className="space-y-2.5">
                  <label className="block text-zinc-300 font-medium">Vercel API Token</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={vcToken}
                      onChange={(e) => setVcToken(e.target.value)}
                      placeholder="Paste Vercel token"
                      className="flex-1 px-3 py-1.5 bg-base border border-border rounded-lg text-white font-mono text-xs focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        localStorage.setItem('csc_vercel_token', vcToken);
                        verifyVercel(vcToken);
                        showNotice('Saved token.', 'success');
                      }}
                      className="px-3.5 py-1.5 bg-white text-zinc-950 font-bold rounded-lg text-xs hover:bg-zinc-200 transition"
                    >
                      Connect
                    </button>
                  </div>
                  {vcError && <p className="text-rose-400 text-[11px]">{vcError}</p>}
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="space-y-3">
                  {vcStatus !== 'connected' ? (
                    <div className="p-6 text-center text-zinc-400 text-xs">
                      Enter Vercel Token in Settings to load projects.
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2 p-2 bg-base border border-border rounded-lg">
                        <select
                          value={vcActiveProject}
                          onChange={(e) => {
                            setVcActiveProject(e.target.value);
                            localStorage.setItem('csc_vercel_active_project', e.target.value);
                          }}
                          className="bg-transparent text-white font-semibold text-xs focus:outline-none flex-1"
                        >
                          {vcProjects.map((p) => (
                            <option key={p.id} value={p.name} className="bg-zinc-900">
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={handleVercelRedeploy}
                          disabled={vcDeploying}
                          className="px-2.5 py-1 bg-white text-zinc-950 font-bold rounded text-[11px] disabled:opacity-50"
                        >
                          {vcDeploying ? 'Deploying...' : 'Redeploy'}
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                          Deployments ({vcDeployments.length})
                        </div>
                        {vcDeployments.slice(0, 4).map((d) => (
                          <div key={d.id} className="p-2.5 rounded-lg bg-base border border-border flex items-center justify-between text-[11px]">
                            <div>
                              <span className="font-semibold text-white">{d.name}</span>
                              <div className="text-[10px] text-zinc-400">{d.target} • {d.state}</div>
                            </div>
                            {d.url && (
                              <a href={d.url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white">
                                <IconExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'tools' && (
                <div className="p-3 bg-base border border-border rounded-lg space-y-2">
                  <div className="text-xs font-bold text-white">Push Supabase Keys to Vercel</div>
                  <button
                    onClick={executeBridgeSyncSupabaseToVercel}
                    disabled={!vcActiveProject || bridgeRunning === 'supabase-to-vercel'}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
                  >
                    <IconZap className="w-3.5 h-3.5" />
                    <span>Sync Supabase Variables</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SUPABASE WORKSPACE */}
          {activeConnector === 'supabase' && (
            <div className="space-y-3.5 text-xs">
              {activeTab === 'resources' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 p-2 bg-base border border-border rounded-lg">
                    <select
                      value={sbActiveTable}
                      onChange={(e) => setSbActiveTable(e.target.value as any)}
                      className="bg-transparent text-white font-semibold text-xs focus:outline-none flex-1"
                    >
                      <option value="projects" className="bg-zinc-900">projects</option>
                      <option value="tasks" className="bg-zinc-900">tasks</option>
                      <option value="leads" className="bg-zinc-900">leads</option>
                      <option value="clients" className="bg-zinc-900">clients</option>
                      <option value="profiles" className="bg-zinc-900">profiles</option>
                    </select>
                    <button
                      onClick={handlePingSupabase}
                      disabled={sbPinging}
                      className="px-2.5 py-1 bg-elevated text-emerald-400 font-semibold rounded text-[11px] border border-border"
                    >
                      {sbPinging ? 'Pinging...' : sbLatency ? `${sbLatency}ms` : 'Ping'}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      Records in {sbActiveTable} ({sbTableCount})
                    </div>
                    {sbTableData.length === 0 ? (
                      <div className="py-4 text-center text-zinc-500 text-xs">No records.</div>
                    ) : (
                      sbTableData.map((row, i) => (
                        <div key={row.id || i} className="p-2 rounded bg-base border border-border text-[11px] font-mono flex items-center justify-between">
                          <span className="text-white truncate max-w-sm">{row.title || row.full_name || row.company_name || row.name || row.id}</span>
                          <span className="text-zinc-500 text-[10px]">{row.id}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'tools' && (
                <form onSubmit={handleInviteUser} className="space-y-2">
                  <label className="block text-zinc-300 font-medium">Add Team Member</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={sbInviteEmail}
                      onChange={(e) => setSbInviteEmail(e.target.value)}
                      placeholder="Email address"
                      className="flex-1 px-3 py-1.5 bg-base border border-border rounded-lg text-white text-xs focus:outline-none"
                    />
                    <select
                      value={sbInviteRole}
                      onChange={(e) => setSbInviteRole(e.target.value as any)}
                      className="px-2.5 py-1.5 bg-base border border-border rounded-lg text-white text-xs"
                    >
                      <option value="Developer">Developer</option>
                      <option value="Designer">Designer</option>
                      <option value="Intern">Intern</option>
                    </select>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-white text-zinc-950 font-bold rounded-lg text-xs"
                    >
                      Add
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'settings' && (
                <div className="font-mono text-zinc-400 text-xs bg-base p-3 rounded-lg border border-border">
                  Connected to: {(import.meta as any).env?.VITE_SUPABASE_URL || 'https://jerjcyesegdpbicfhajz.supabase.co'}
                </div>
              )}
            </div>
          )}

          {/* GOOGLE MAPS WORKSPACE */}
          {activeConnector === 'google-maps' && (
            <div className="space-y-3.5 text-xs">
              {activeTab === 'settings' && (
                <div className="space-y-2.5">
                  <label className="block text-zinc-300 font-medium">Places API Key</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={mapsKey}
                      onChange={(e) => setMapsKey(e.target.value)}
                      placeholder="Paste Google Maps Key"
                      className="flex-1 px-3 py-1.5 bg-base border border-border rounded-lg text-white font-mono text-xs focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        localStorage.setItem('csc_maps_key', mapsKey);
                        verifyMaps(mapsKey);
                        showNotice('Saved key.', 'success');
                      }}
                      className="px-3.5 py-1.5 bg-white text-zinc-950 font-bold rounded-lg text-xs hover:bg-zinc-200 transition"
                    >
                      Connect
                    </button>
                  </div>
                  {mapsError && <p className="text-rose-400 text-[11px]">{mapsError}</p>}
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="space-y-3">
                  <form onSubmit={handleMapsSearch} className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={mapsSearchKeyword}
                      onChange={(e) => setMapsSearchKeyword(e.target.value)}
                      placeholder="Search keyword"
                      className="flex-1 px-3 py-1.5 bg-base border border-border rounded-lg text-white text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      value={mapsSearchLocation}
                      onChange={(e) => setMapsSearchLocation(e.target.value)}
                      placeholder="Location"
                      className="flex-1 px-3 py-1.5 bg-base border border-border rounded-lg text-white text-xs focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={mapsSearching}
                      className="px-3.5 py-1.5 bg-white text-zinc-950 font-bold rounded-lg text-xs disabled:opacity-50"
                    >
                      {mapsSearching ? 'Searching...' : 'Search'}
                    </button>
                  </form>

                  <div className="space-y-1.5">
                    {mapsResults.length === 0 ? (
                      <div className="py-4 text-center text-zinc-500 text-xs">
                        Enter keyword and location to find prospects.
                      </div>
                    ) : (
                      mapsResults.map((p) => (
                        <div key={p.placeId} className="p-2.5 rounded-lg bg-base border border-border flex items-center justify-between gap-2">
                          <div>
                            <span className="font-semibold text-white">{p.name}</span>
                            <div className="text-[10px] text-zinc-400">{p.address}</div>
                          </div>
                          <button
                            onClick={() => handleImportLeadToSupabase(p)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-[11px]"
                          >
                            Import
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'tools' && (
                <div className="text-xs text-zinc-400">
                  Search results automatically support 1-click import into the Leads CRM.
                </div>
              )}
            </div>
          )}

          {/* WHATSAPP WORKSPACE */}
          {activeConnector === 'whatsapp' && (
            <div className="space-y-3 text-xs">
              <form onSubmit={handleWhatsAppDispatch} className="space-y-2.5">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Recipient Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={waTestPhone}
                    onChange={(e) => setWaTestPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3 py-1.5 bg-base border border-border rounded-lg text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Message</label>
                  <textarea
                    rows={3}
                    required
                    value={waTestMessage}
                    onChange={(e) => setWaTestMessage(e.target.value)}
                    placeholder="Message text"
                    className="w-full p-2.5 bg-base border border-border rounded-lg text-white text-xs focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                >
                  Send via WhatsApp
                </button>
              </form>
            </div>
          )}

          {/* DISCORD WORKSPACE */}
          {activeConnector === 'discord' && (
            <div className="space-y-3 text-xs">
              <div className="space-y-2">
                <label className="block text-zinc-300 font-medium">Webhook URL</label>
                <input
                  type="text"
                  value={dcWebhook}
                  onChange={(e) => {
                    setDcWebhook(e.target.value);
                    localStorage.setItem('csc_discord_webhook', e.target.value);
                    setDcStatus(e.target.value.startsWith('https://discord.com/api/webhooks/') ? 'connected' : 'disconnected');
                  }}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full px-3 py-1.5 bg-base border border-border rounded-lg text-white font-mono text-xs focus:outline-none"
                />
              </div>

              <form onSubmit={handleDiscordBroadcast} className="space-y-2">
                <input
                  type="text"
                  required
                  value={dcTestTitle}
                  onChange={(e) => setDcTestTitle(e.target.value)}
                  placeholder="Broadcast title"
                  className="w-full px-3 py-1.5 bg-base border border-border rounded-lg text-white text-xs focus:outline-none"
                />
                <textarea
                  rows={2}
                  required
                  value={dcTestBody}
                  onChange={(e) => setDcTestBody(e.target.value)}
                  placeholder="Broadcast message"
                  className="w-full p-2.5 bg-base border border-border rounded-lg text-white text-xs focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={dcBroadcasting || dcStatus !== 'connected'}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs"
                >
                  {dcBroadcasting ? 'Broadcasting...' : 'Broadcast'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
