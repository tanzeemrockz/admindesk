import { useSearchParams } from 'react-router-dom';
import { Project, Client } from '../types/database';
import { IconCSC, IconGlobe, IconCheckCircle } from '../lib/icons';
import { Button, Badge, EmptyState } from '../components/ui';

interface ClientPortalPageProps {
  clients: Client[];
  projects: Project[];
}

export function ClientPortalPage({ clients, projects }: ClientPortalPageProps) {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('client');

  const client = clients.find((c) => c.id === clientId) || clients[0];
  const clientProjects = projects.filter((p) => p.client_id === client?.id);

  if (!client) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 text-center">
        <IconCSC className="w-12 h-12 mb-4" />
        <h1 className="font-display text-base font-semibold text-zinc-100">Client Portal Link Invalid</h1>
        <p className="text-xs text-zinc-400 mt-1">Please verify the link provided by CyberSlayerCorpz or contact your project lead.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#ededed] p-4 sm:p-8 md:p-12">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
          <div className="flex items-center gap-3">
            <IconCSC className="w-9 h-9" />
            <div>
              <h1 className="font-display text-base font-semibold text-white tracking-tight">CyberSlayerCorpz</h1>
              <p className="text-xs text-[#888888] font-sans">Client Live Delivery Portal</p>
            </div>
          </div>
          <Badge variant="emerald" size="sm" dot>
            Live Tracking
          </Badge>
        </div>

        {/* Welcome Banner */}
        <div className="bg-[#0a0a0a] border border-[#222222] rounded-lg p-5 shadow-xs space-y-1">
          <h2 className="font-display text-base font-semibold text-white">Welcome, {client.contact_person}</h2>
          <p className="text-xs text-[#888888] font-sans">
            Real-time delivery progress, asset readiness, and staging previews for <span className="text-white font-medium">{client.company_name}</span>.
          </p>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-white">Active Project Deliverables</h3>
            <span className="text-xs text-[#888888] font-mono">{clientProjects.length} linked project{clientProjects.length !== 1 ? 's' : ''}</span>
          </div>

          {clientProjects.length === 0 ? (
            <EmptyState
              title="No active projects linked"
              description="Your agency representative has not attached an active build contract yet. Please check back shortly."
            />
          ) : (
            clientProjects.map((p) => {
              const checklist = p.intake_checklist || {};
              const doneCount = Object.values(checklist).filter(Boolean).length;
              const pct = Math.round((doneCount / 8) * 100);

              return (
                <div key={p.id} className="bg-[#0a0a0a] border border-[#222222] rounded-lg p-5 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="neutral" size="sm">
                          {p.stage}
                        </Badge>
                        {p.milestone_stage && (
                          <Badge variant="cyber" size="sm">
                            {p.milestone_stage}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-display text-base font-semibold text-white mt-2">{p.title}</h4>
                    </div>

                    {p.vercel_url && (
                      <a
                        href={p.vercel_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<IconGlobe className="w-3.5 h-3.5" />}
                        >
                          Open Live Staging
                        </Button>
                      </a>
                    )}
                  </div>

                  {/* Asset Readiness */}
                  <div className="bg-black border border-[#222222] rounded-md p-3.5 space-y-2">
                    <div className="flex justify-between text-xs text-[#ededed] font-medium font-sans">
                      <span>8-Point Asset Intake Completion</span>
                      <span className="text-emerald-400 font-mono font-medium">{pct}% ({doneCount}/8 received)</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#141414] rounded-full overflow-hidden border border-[#222222]">
                      <div className="h-full bg-emerald-400 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* Milestone status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#888888] pt-2.5 border-t border-[#1c1c1c] gap-1.5 font-mono">
                    <span className="flex items-center gap-1.5">
                      <IconCheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Phase: {p.milestone_stage || 'Intake & Discovery'}</span>
                    </span>
                    <span>Revisions: Round {p.revision_round ?? 0} of {p.max_included_revisions ?? 2}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[#666666] pt-6 border-t border-[#222222] font-mono">
          <p>Powered by CyberSlayerCorpz (CSC) Operations Command Center</p>
        </div>
      </div>
    </div>
  );
}
