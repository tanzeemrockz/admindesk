import { useState } from 'react';
import { Client, Project } from '../../types/database';
import { IconCheck, IconCopy, IconGlobe, IconCheckCircle } from '../../lib/icons';
import { Button, Badge, Modal } from '../ui';

interface ClientMagicLinkModalProps {
  client: Client;
  projects: Project[];
  onClose: () => void;
}

export function ClientMagicLinkModal({ client, projects, onClose }: ClientMagicLinkModalProps) {
  const [copied, setCopied] = useState(false);
  const clientProjects = projects.filter((p) => p.client_id === client.id);

  const magicUrl = `${window.location.origin}/portal?client=${client.id}&token=${client.magic_token || 'csc_secure_demo'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(magicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title='Client "Magic Link" Portal'
      description={`${client.company_name} • ${client.contact_person}`}
    >
      <div className="space-y-4 text-xs">
        {/* Shareable Link Box */}
        <div className="p-3.5 bg-black border border-[#222222] rounded-md space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#ededed] font-medium font-sans">Shareable Read-Only Tracking URL</span>
            <span className="text-[11px] text-[#888888] font-mono">Tokenized</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={magicUrl}
              className="flex-1 px-3 py-1.5 bg-[#0a0a0a] border border-[#222222] rounded-md text-xs font-mono text-[#ededed] select-all focus:outline-none"
            />
            <Button
              type="button"
              variant={copied ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <IconCheck className="w-3.5 h-3.5 text-emerald-400" /> : <IconCopy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <p className="text-[11px] text-[#888888] leading-normal font-sans">
            Clients can view real-time asset readiness and staging previews without contacting you for updates.
          </p>
        </div>

        {/* Live Preview of Client View */}
        <div className="border border-[#222222] rounded-md p-3.5 bg-black space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-mono">Portal Preview</span>
            <span className="text-[11px] text-[#888888] font-sans">{clientProjects.length} linked project{clientProjects.length !== 1 ? 's' : ''}</span>
          </div>

          {clientProjects.length === 0 ? (
            <p className="text-xs text-[#666666] py-3 text-center font-sans">No active projects linked to this client yet.</p>
          ) : (
            clientProjects.map((p) => {
              const checklist = p.intake_checklist || {};
              const doneCount = Object.values(checklist).filter(Boolean).length;
              const pct = Math.round((doneCount / 8) * 100);

              return (
                <div key={p.id} className="bg-[#0a0a0a] border border-[#222222] rounded-md p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-white">{p.title}</h4>
                    <Badge variant="neutral" size="sm">
                      {p.stage}
                    </Badge>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-[#888888] mb-1 font-sans">
                      <span>Asset Readiness</span>
                      <span className="text-emerald-400 font-mono font-medium">{pct}% ({doneCount}/8)</span>
                    </div>
                    <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-[#222222]">
                      <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                  {p.vercel_url && (
                    <div className="pt-2 border-t border-[#1c1c1c] flex items-center justify-between">
                      <span className="text-[11px] text-[#888888] flex items-center gap-1.5 font-sans">
                        <IconCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Staging Ready</span>
                      </span>
                      <a
                        href={p.vercel_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-400 font-medium hover:underline flex items-center gap-1 font-sans"
                      >
                        <IconGlobe className="w-3 h-3" />
                        <span>View Preview</span>
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end pt-1 border-t border-[#222222]">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
