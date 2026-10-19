import { useNavigate } from 'react-router-dom';
import { Project, Task, Lead, Profile } from '../../types/database';
import { formatINR, safeUrl } from '../../lib/formatters';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import {
  IconBriefcase,
  IconClock,
  IconTarget,
  IconGlobe,
  IconPlus,
  IconExternalLink,
  IconGitPullRequest,
  IconGitHub,
  IconVercel,
  IconSupabase,
  IconWhatsApp,
  IconChevronRight
} from '../../lib/icons';

interface OverviewViewProps {
  projects: Project[];
  tasks: Task[];
  leads: Lead[];
  currentProfile: Profile | null;
  onUpdateStatus: (status: 'Available' | 'Working on Project' | 'On Leave') => void;
  onOpenTaskModal: () => void;
  onOpenLeadModal: () => void;
}

export function OverviewView({
  projects,
  tasks,
  leads,
  currentProfile,
  onUpdateStatus,
  onOpenTaskModal,
  onOpenLeadModal
}: OverviewViewProps) {
  const navigate = useNavigate();

  const activeProjects = projects.filter((p) => p.stage !== 'Completed');
  const pendingReviews = tasks.filter((t) => t.status === 'Needs Review');
  const activeLeads = leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost');

  const totalFee = projects.reduce((acc, p) => acc + (Number(p.fee_inr) || 0), 0);
  const totalAdvance = projects.reduce((acc, p) => acc + (Number(p.advance_inr) || 0), 0);
  const totalBalanceDue = Math.max(0, totalFee - totalAdvance);
  const totalPipelineValue = activeLeads.reduce((acc, l) => acc + (Number(l.estimated_value_inr) || 0), 0);

  const statusColors = {
    'Available': 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]',
    'Working on Project': 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.6)]',
    'On Leave': 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]'
  };

  return (
    <div className="space-y-4">
      {/* Executive Command Header */}
      <div className="bg-[#0a0a0a] border border-[#222222] rounded-lg p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-md bg-[#161616] border border-[#2e2e2e] flex items-center justify-center font-bold text-xs text-white">
              {currentProfile?.full_name?.charAt(0) || 'M'}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black ${
                statusColors[currentProfile?.status || 'Available']
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xs font-bold text-white tracking-tight">
                {currentProfile?.full_name || 'Mohamed Tanzeem'}
              </h1>
              <Badge variant="emerald" size="xs">
                {currentProfile?.role === 'Founder' || currentProfile?.is_admin
                  ? 'Founder'
                  : currentProfile?.role || 'Engineer'}
              </Badge>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              CyberSlayerCorpz Operations Command Center
            </p>
          </div>
        </div>

        {/* Presence Switcher */}
        <div className="flex items-center gap-1 bg-black p-0.5 rounded-md border border-[#222222] self-start sm:self-auto">
          {(['Available', 'Working on Project', 'On Leave'] as const).map((status) => (
            <button
              key={status}
              onClick={() => onUpdateStatus(status)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                currentProfile?.status === status
                  ? 'bg-[#1a1a1a] text-white font-semibold border border-[#2e2e2e] shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {status === 'On Leave' ? 'Away' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Information-Dense KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => navigate('/projects')}
          className="bg-[#0a0a0a] hover:bg-[#0f0f0f] border border-[#222222] hover:border-[#383838] rounded-lg p-4 cursor-pointer transition-all shadow-[0_0_0_1px_rgba(255,255,255,0.02)] group"
        >
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Active Contracts</span>
            <IconBriefcase className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-sans text-2xl font-bold text-white tracking-tight">{activeProjects.length}</span>
            <span className="text-[11px] text-zinc-500 font-mono">
              {projects.length === 0 ? '0 registered' : `${projects.length} total`}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 truncate font-sans">
            {activeProjects.filter((p) => p.stage === 'In Development').length} in dev •{' '}
            {activeProjects.filter((p) => p.stage === 'Client Review').length} in review
          </p>
        </div>

        <div
          onClick={() => navigate('/reviews')}
          className="bg-[#0a0a0a] hover:bg-[#0f0f0f] border border-[#222222] hover:border-[#383838] rounded-lg p-4 cursor-pointer transition-all shadow-[0_0_0_1px_rgba(255,255,255,0.02)] group"
        >
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Review Queue</span>
            <IconClock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span
              className={`font-sans text-2xl font-bold tracking-tight ${
                pendingReviews.length > 0 ? 'text-amber-300' : 'text-white'
              }`}
            >
              {pendingReviews.length}
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">
              {tasks.length} total tasks
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 truncate font-sans">
            {pendingReviews.length > 0 ? 'Awaiting QA & admin sign-off' : 'All PRs & tasks verified'}
          </p>
        </div>

        <div
          onClick={() => navigate('/leads')}
          className="bg-[#0a0a0a] hover:bg-[#0f0f0f] border border-[#222222] hover:border-[#383838] rounded-lg p-4 cursor-pointer transition-all shadow-[0_0_0_1px_rgba(255,255,255,0.02)] group"
        >
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Sales Pipeline</span>
            <IconTarget className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-sans text-2xl font-bold text-white tracking-tight">{activeLeads.length}</span>
            <span className="text-[11px] text-emerald-400 font-mono font-medium">
              {formatINR(totalPipelineValue)}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 truncate font-sans">
            {leads.filter((l) => l.status === 'Cold Contact').length} cold •{' '}
            {leads.filter((l) => l.status === 'In Discussion').length} discussions
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222222] rounded-lg p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Contract Value</span>
            <Badge variant="emerald" size="xs">INR</Badge>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-sans text-2xl font-bold text-emerald-400 tracking-tight">
              {formatINR(totalFee)}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 truncate font-sans">
            <span className="text-amber-300 font-mono font-medium">{formatINR(totalBalanceDue)}</span> outstanding
          </p>
        </div>
      </div>

      {/* Main Workspace: 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Workstreams & Review Queue (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Projects Panel */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <CardTitle>Active Client Contracts</CardTitle>
                <Badge variant="neutral" size="xs">{activeProjects.length}</Badge>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => navigate('/projects')}
                rightIcon={<IconChevronRight className="w-3 h-3" />}
              >
                View all
              </Button>
            </CardHeader>
            <CardContent>
              {activeProjects.length === 0 ? (
                <EmptyState
                  title="No active contracts found"
                  description="Initialize a client contract to begin asset intake, milestone billing, and deployment tracking."
                  icon={IconBriefcase}
                  action={
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate('/projects')}
                      leftIcon={<IconPlus className="w-3.5 h-3.5" />}
                    >
                      New Project
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-2">
                  {activeProjects.slice(0, 4).map((p) => {
                    const checklist = p.intake_checklist || {};
                    const doneCount = Object.values(checklist).filter(Boolean).length;
                    const pct = Math.round((doneCount / 8) * 100);

                    return (
                      <div
                        key={p.id}
                        onClick={() => navigate('/projects')}
                        className="bg-black/60 hover:bg-[#111111] border border-[#1f1f1f] hover:border-[#383838] rounded-md p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-sans text-xs font-semibold text-white tracking-tight truncate">
                              {p.title}
                            </h4>
                            <Badge variant="neutral" size="xs">
                              {p.stage}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-zinc-400 font-sans flex items-center gap-2">
                            <span className="font-mono text-zinc-300">{formatINR(p.fee_inr)}</span>
                            <span>•</span>
                            <span className="text-zinc-500 font-mono text-[10px]">
                              {p.milestone_stage || 'Milestone 1'}
                            </span>
                          </div>
                        </div>

                        {/* Intake Progress */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="w-24 bg-zinc-900 border border-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-zinc-400 w-8 text-right">
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Queue Panel */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <CardTitle>Needs Review Queue</CardTitle>
                <Badge variant={pendingReviews.length > 0 ? 'amber' : 'neutral'} size="xs">
                  {pendingReviews.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => navigate('/reviews')}
                rightIcon={<IconChevronRight className="w-3 h-3" />}
              >
                Review Board
              </Button>
            </CardHeader>
            <CardContent>
              {pendingReviews.length === 0 ? (
                <div className="py-6 text-center text-zinc-500 text-xs font-sans">
                  Review queue is clean. All pull requests and staging tasks are verified.
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingReviews.slice(0, 3).map((t) => {
                    const proj = projects.find((p) => p.id === t.project_id);
                    const cleanPr = safeUrl(t.github_pr_url);
                    const cleanStaging = safeUrl(t.preview_url);

                    return (
                      <div
                        key={t.id}
                        className="bg-black/60 border border-amber-500/25 rounded-md p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-sans text-xs font-medium text-white truncate">
                              {t.title}
                            </span>
                            {proj && (
                              <Badge variant="neutral" size="xs">
                                {proj.title}
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 font-sans">
                            Awaiting admin sign-off before merging to production.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {cleanPr && (
                            <a
                              href={cleanPr}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-7 px-2 bg-black hover:bg-[#141414] border border-[#222222] hover:border-[#383838] text-zinc-300 hover:text-white text-xs rounded-md flex items-center gap-1.5 transition-colors"
                            >
                              <IconGitPullRequest className="w-3 h-3 text-indigo-400" />
                              <span className="text-[11px] font-mono">PR</span>
                            </a>
                          )}
                          {cleanStaging && (
                            <a
                              href={cleanStaging}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-7 px-2 bg-black hover:bg-[#141414] border border-[#222222] hover:border-[#383838] text-zinc-300 hover:text-white text-xs rounded-md flex items-center gap-1.5 transition-colors"
                            >
                              <IconExternalLink className="w-3 h-3 text-sky-400" />
                              <span className="text-[11px]">Staging</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Dispatch & Quick Controls (1 Col) */}
        <div className="space-y-4">
          {/* Quick Actions Panel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Operational Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={onOpenTaskModal}
                leftIcon={<IconPlus className="w-3.5 h-3.5 text-zinc-400" />}
                className="w-full justify-between"
              >
                <span>Create QA Task</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={onOpenLeadModal}
                leftIcon={<IconPlus className="w-3.5 h-3.5 text-zinc-400" />}
                className="w-full justify-between"
              >
                <span>Log New Lead</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/leads')}
                leftIcon={<IconTarget className="w-3.5 h-3.5 text-emerald-400" />}
                className="w-full justify-between"
              >
                <span>Google Maps Hunter</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/connectors')}
                leftIcon={<IconGlobe className="w-3.5 h-3.5 text-sky-400" />}
                className="w-full justify-between"
              >
                <span>Connectors Mesh</span>
              </Button>
            </CardContent>
          </Card>

          {/* Infrastructure Health Panel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Connected Mesh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div
                onClick={() => navigate('/decks/github')}
                className="p-2.5 rounded-md bg-black/60 hover:bg-[#141414] border border-[#1f1f1f] hover:border-[#383838] flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2">
                  <IconGitHub className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-xs text-zinc-300 font-sans">GitHub Cockpit</span>
                </div>
                <Badge variant="neutral" size="xs">REST API</Badge>
              </div>

              <div
                onClick={() => navigate('/decks/vercel')}
                className="p-2.5 rounded-md bg-black/60 hover:bg-[#141414] border border-[#1f1f1f] hover:border-[#383838] flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2">
                  <IconVercel className="w-3 h-3 text-zinc-400" />
                  <span className="text-xs text-zinc-300 font-sans">Vercel Deployments</span>
                </div>
                <Badge variant="neutral" size="xs">Edge API</Badge>
              </div>

              <div
                onClick={() => navigate('/decks/supabase')}
                className="p-2.5 rounded-md bg-black/60 hover:bg-[#141414] border border-[#1f1f1f] hover:border-[#383838] flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2">
                  <IconSupabase className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-zinc-300 font-sans">Supabase Studio</span>
                </div>
                <Badge variant="emerald" size="xs" dot>Live</Badge>
              </div>

              <div
                onClick={() => navigate('/decks/whatsapp')}
                className="p-2.5 rounded-md bg-black/60 hover:bg-[#141414] border border-[#1f1f1f] hover:border-[#383838] flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2">
                  <IconWhatsApp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-zinc-300 font-sans">WhatsApp Outreach</span>
                </div>
                <Badge variant="neutral" size="xs">Templates</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
