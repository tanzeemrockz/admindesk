import { Client, Project } from '../../types/database';
import { formatWhatsAppNumber } from '../../lib/formatters';
import { INTAKE_FORM_URL } from '../../lib/supabase';
import { IconPlus, IconTrash, IconWhatsApp, IconGlobe, IconUsers } from '../../lib/icons';
import { Button, Badge, EmptyState } from '../ui';

interface ClientsViewProps {
  clients: Client[];
  projects: Project[];
  isAdmin: boolean;
  onOpenNewClient: () => void;
  onOpenMagicLink: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
}

export function ClientsView({
  clients,
  projects,
  isAdmin,
  onOpenNewClient,
  onOpenMagicLink,
  onDeleteClient
}: ClientsViewProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#0a0a0a] border border-[#222222] rounded-lg p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-sm font-bold text-white tracking-tight">Clients Directory</h1>
            <Badge variant="neutral" size="xs">{clients.length}</Badge>
          </div>
          <p className="text-[11px] text-[#888888] font-sans mt-0.5">
            Registered agency clients &bull; Magic Portal URLs and project associations.
          </p>
        </div>
        {isAdmin && (
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenNewClient}
            leftIcon={<IconPlus className="w-3.5 h-3.5" />}
          >
            Add Client
          </Button>
        )}
      </div>

      {/* Directory Grid or Empty State */}
      {clients.length === 0 ? (
        <EmptyState
          icon={IconUsers}
          title="No clients registered"
          description="Register your first client organization to generate magic portal links and attach active project contracts."
          action={
            isAdmin ? (
              <Button
                variant="primary"
                size="sm"
                onClick={onOpenNewClient}
                leftIcon={<IconPlus className="w-3.5 h-3.5" />}
              >
                Add Client
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {clients.map((c) => {
            const waNum = formatWhatsAppNumber(c.phone);
            const intakeMsg = encodeURIComponent(
              `Hi ${c.contact_person}, welcome to CyberSlayerCorpz (CSC)! Please submit your brand logos, photos, and requirements on our official intake form here: ${INTAKE_FORM_URL}`
            );
            const clientProjects = projects.filter((p) => p.client_id === c.id);

            return (
              <div
                key={c.id}
                className="bg-[#0a0a0a] border border-[#222222] hover:border-[#383838] rounded-lg p-4 flex flex-col justify-between transition-all shadow-xs group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-black border border-[#222222] flex items-center justify-center font-display text-xs font-bold text-[#ededed]">
                        {c.company_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-display text-sm font-semibold text-white leading-tight">
                          {c.company_name}
                        </h3>
                        <p className="text-xs text-[#888888] mt-0.5 font-sans">{c.contact_person}</p>
                      </div>
                    </div>

                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => {
                          if (confirm(`Remove ${c.company_name} from clients directory?`)) {
                            onDeleteClient(c.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:text-rose-400 text-[#666666] transition-opacity"
                        aria-label="Delete client"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    {c.email && (
                      <div className="flex items-center gap-2 text-[#888888] truncate">
                        <span className="text-[#555555] text-[11px] w-12 font-mono">Email:</span>
                        <span className="truncate text-[#ededed] select-all font-mono">{c.email}</span>
                      </div>
                    )}
                    {c.phone && (
                      <div className="flex items-center gap-2 text-[#888888]">
                        <span className="text-[#555555] text-[11px] w-12 font-mono">Phone:</span>
                        <span className="text-[#ededed] font-mono select-all">{c.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-[#1c1c1c] flex items-center justify-between">
                    <span className="text-[11px] text-[#888888] font-sans">Active Contracts</span>
                    <Badge variant={clientProjects.length > 0 ? 'cyber' : 'neutral'} size="xs">
                      {clientProjects.length} linked {clientProjects.length === 1 ? 'project' : 'projects'}
                    </Badge>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#1c1c1c] flex items-center gap-2">
                  {waNum && (
                    <a
                      href={`https://wa.me/${waNum}?text=${intakeMsg}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="xs"
                        className="w-full text-emerald-400 hover:text-emerald-300 border-emerald-500/20 hover:border-emerald-500/40 bg-black hover:bg-[#111111]"
                        leftIcon={<IconWhatsApp className="w-3.5 h-3.5" />}
                      >
                        Intake
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => onOpenMagicLink(c)}
                    className="flex-1"
                    leftIcon={<IconGlobe className="w-3.5 h-3.5 text-cyan-400" />}
                  >
                    Portal Link
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
