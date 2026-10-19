import { Project, Client, ProjectStage, MilestoneStage } from '../../types/database';
import { formatINR, safeUrl } from '../../lib/formatters';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import {
  IconPlus,
  IconTrash,
  IconExternalLink,
  IconGitHub,
  IconVercel,
  IconGlobe,
  IconFolder,
  IconBriefcase
} from '../../lib/icons';

interface ProjectsViewProps {
  projects: Project[];
  clients: Client[];
  isAdmin: boolean;
  onOpenNewProject: () => void;
  onOpenIntake: (project: Project) => void;
  onUpdateStage: (projectId: string, stage: ProjectStage) => void;
  onUpdateMilestone: (projectId: string, milestone: MilestoneStage) => void;
  onIncrementRevision: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

const STAGES: ProjectStage[] = [
  'Asset Intake',
  'In Development',
  'Client Review',
  'DNS / Launch',
  'Completed'
];

const MILESTONES: MilestoneStage[] = [
  'Milestone 1 (50% Advance)',
  'Milestone 2 (30% Staging)',
  'Milestone 3 (20% Launch)'
];

export function ProjectsView({
  projects,
  clients,
  isAdmin,
  onOpenNewProject,
  onOpenIntake,
  onUpdateStage,
  onUpdateMilestone,
  onIncrementRevision,
  onDeleteProject
}: ProjectsViewProps) {
  const getStageBadgeVariant = (stage: ProjectStage) => {
    switch (stage) {
      case 'Asset Intake':
        return 'amber' as const;
      case 'In Development':
        return 'cyber' as const;
      case 'Client Review':
        return 'purple' as const;
      case 'DNS / Launch':
        return 'emerald' as const;
      case 'Completed':
        return 'neutral' as const;
      default:
        return 'neutral' as const;
    }
  };

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0a0a0a] border border-[#222222] rounded-lg p-3.5 px-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-sm font-bold text-white tracking-tight">Agency Projects &amp; Contracts</h1>
            <Badge variant="neutral" size="xs">{projects.length}</Badge>
          </div>
          <p className="text-[11px] text-[#888888] font-sans mt-0.5">
            Contract delivery pipelines, 50/30/20 milestone gates, and 8-point asset verification.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfMF3Inm3AfIOPMHFS1sq2yTuSkACQ6QweBD9RDcf93SqHGeg/viewform?usp=header"
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 px-3 bg-black hover:bg-[#111111] border border-[#2e2e2e] hover:border-[#454545] text-[#ededed] hover:text-white text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Google Intake Form</span>
            <IconExternalLink className="w-3 h-3 text-[#888888]" />
          </a>
          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenNewProject}
              leftIcon={<IconPlus className="w-3.5 h-3.5" />}
            >
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* Projects Grid or Empty State */}
      {projects.length === 0 ? (
        <EmptyState
          title="No client projects registered"
          description="Initialize a new project contract to track staging deployments, milestone payments, and asset intake."
          icon={IconBriefcase}
          action={
            isAdmin ? (
              <Button
                variant="primary"
                size="sm"
                onClick={onOpenNewProject}
                leftIcon={<IconPlus className="w-3.5 h-3.5" />}
              >
                Create Project
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {projects.map((p) => {
            const client = clients.find((c) => c.id === p.client_id);
            const checklist = p.intake_checklist || {};
            const doneCount = Object.values(checklist).filter(Boolean).length;
            const pct = Math.round((doneCount / 8) * 100);

            const ghUrl = safeUrl(p.github_url);
            const vcUrl = safeUrl(p.vercel_url);
            const dmUrl = safeUrl(p.domain_url);
            const drUrl = safeUrl(p.drive_url);

            const due = Math.max(0, (Number(p.fee_inr) || 0) - (Number(p.advance_inr) || 0));
            const revRound = p.revision_round ?? 0;
            const maxRev = p.max_included_revisions ?? 2;
            const isExceeded = revRound > maxRev;

            return (
              <div
                key={p.id}
                className="bg-[#0a0a0a] border border-[#222222] hover:border-[#383838] rounded-lg flex flex-col justify-between overflow-hidden shadow-xs transition-all group"
              >
                <div className="p-4 space-y-3.5">
                  {/* Top Bar: Title & Stage */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant={getStageBadgeVariant(p.stage)} size="xs">
                          {p.stage}
                        </Badge>
                        {client && (
                          <span className="text-[11px] text-[#888888] font-sans truncate">
                            {client.company_name}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-sm font-semibold text-white mt-1.5 truncate">
                        {p.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => onOpenIntake(p)}
                        className="text-[11px] font-mono"
                      >
                        Intake {pct}%
                      </Button>
                      {isAdmin && (
                        <button
                          onClick={() => onDeleteProject(p.id)}
                          className="p-1 text-[#888888] hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                          title="Delete contract"
                        >
                          <IconTrash className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Financial & Milestone Track */}
                  <div className="bg-black border border-[#1c1c1c] rounded-md p-3 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#888888] font-sans">Payment Gate:</span>
                      <select
                        value={p.milestone_stage || 'Milestone 1 (50% Advance)'}
                        onChange={(e) => onUpdateMilestone(p.id, e.target.value as MilestoneStage)}
                        className="bg-[#0a0a0a] border border-[#2e2e2e] focus:border-white rounded px-2 py-0.5 text-[11px] text-emerald-400 font-mono font-medium focus:outline-none cursor-pointer"
                      >
                        {MILESTONES.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#1c1c1c] text-[11px] font-sans">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#888888]">Revisions:</span>
                        <Badge variant={isExceeded ? 'rose' : 'neutral'} size="xs">
                          Round {revRound} / {maxRev} {isExceeded ? '(Surcharge)' : 'Included'}
                        </Badge>
                      </div>
                      <button
                        onClick={() => onIncrementRevision(p.id)}
                        className="text-[10px] text-[#888888] hover:text-white font-mono transition-colors"
                      >
                        + Add Round
                      </button>
                    </div>
                  </div>

                  {/* 8-Point Asset Intake Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-[#888888] font-sans">
                      <span>Asset Intake ({doneCount}/8 verified)</span>
                      <span className="font-mono font-semibold text-emerald-400">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-[#222222]">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* External Links Bar */}
                  {(ghUrl || vcUrl || dmUrl || drUrl) && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {ghUrl && (
                        <a
                          href={ghUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-6 px-2.5 bg-black hover:bg-[#111111] border border-[#222222] hover:border-[#383838] rounded text-[11px] font-mono text-[#a1a1a1] hover:text-white flex items-center gap-1.5 transition-colors"
                        >
                          <IconGitHub className="w-3 h-3 text-[#888888]" />
                          <span>Repo</span>
                        </a>
                      )}
                      {vcUrl && (
                        <a
                          href={vcUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-6 px-2.5 bg-black hover:bg-[#111111] border border-[#222222] hover:border-[#383838] rounded text-[11px] font-mono text-[#a1a1a1] hover:text-white flex items-center gap-1.5 transition-colors"
                        >
                          <IconVercel className="w-3 h-3 text-[#ededed]" />
                          <span>Staging</span>
                        </a>
                      )}
                      {dmUrl && (
                        <a
                          href={dmUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-6 px-2.5 bg-black hover:bg-[#111111] border border-[#222222] hover:border-[#383838] rounded text-[11px] font-mono text-[#a1a1a1] hover:text-white flex items-center gap-1.5 transition-colors"
                        >
                          <IconGlobe className="w-3 h-3 text-cyan-400" />
                          <span>Live Site</span>
                        </a>
                      )}
                      {drUrl && (
                        <a
                          href={drUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-6 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 rounded text-[11px] font-mono text-emerald-300 flex items-center gap-1.5 transition-colors"
                        >
                          <IconFolder className="w-3 h-3" />
                          <span>Drive Assets</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer: Balance & Stage Dropdown */}
                <div className="p-3 px-4 bg-[#050505] border-t border-[#222222] flex items-center justify-between gap-2 text-xs">
                  <div className="font-sans">
                    <span className="font-bold text-white font-mono">{formatINR(p.fee_inr)}</span>
                    <span className="text-[#444444] mx-2">•</span>
                    <span className="text-amber-400 font-mono text-[11px]">{formatINR(due)} due</span>
                  </div>

                  <select
                    value={p.stage}
                    onChange={(e) => onUpdateStage(p.id, e.target.value as ProjectStage)}
                    className="h-7 px-2.5 bg-black border border-[#2e2e2e] hover:border-[#454545] focus:border-white rounded-md text-[11px] text-[#ededed] font-medium focus:outline-none cursor-pointer transition-colors"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
