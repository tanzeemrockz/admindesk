import { useState } from 'react';
import { Lead, LeadStatus } from '../../types/database';
import { GooglePlaceProspect } from '../../types/leads';
import { GoogleMapsLeadHunter } from './GoogleMapsLeadHunter';
import { formatINR, formatWhatsAppNumber } from '../../lib/formatters';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { IconPlus, IconTrash, IconWhatsApp, IconGoogleMaps, IconTarget } from '../../lib/icons';

interface LeadsViewProps {
  leads: Lead[];
  isAdmin: boolean;
  onOpenLeadModal: () => void;
  onOpenWhatsApp: (phone: string, businessName: string) => void;
  onUpdateStatus: (leadId: string, status: LeadStatus) => void;
  onDeleteLead: (leadId: string) => void;
  onImportProspect: (prospect: GooglePlaceProspect) => void;
}

const LEAD_STATUSES: LeadStatus[] = [
  'Cold Contact',
  'In Discussion',
  'Proposal Sent',
  'Won',
  'Lost'
];

export function LeadsView({
  leads,
  isAdmin,
  onOpenLeadModal,
  onOpenWhatsApp,
  onUpdateStatus,
  onDeleteLead,
  onImportProspect
}: LeadsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'crm' | 'hunter'>('crm');

  const getStatusBadgeVariant = (status: LeadStatus) => {
    switch (status) {
      case 'Cold Contact':
        return 'neutral' as const;
      case 'In Discussion':
        return 'cyber' as const;
      case 'Proposal Sent':
        return 'amber' as const;
      case 'Won':
        return 'emerald' as const;
      case 'Lost':
        return 'rose' as const;
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
            <h1 className="font-display text-sm font-bold text-white tracking-tight">Sales Pipeline &amp; Outreach</h1>
            <Badge variant="neutral" size="xs">{leads.length} leads</Badge>
          </div>
          <p className="text-[11px] text-[#888888] font-sans mt-0.5">
            Prospect CRM, Google Maps intelligence scraper, and WhatsApp direct outreach.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Subtab Switcher */}
          <div className="flex items-center p-0.5 bg-black border border-[#222222] rounded-md text-xs">
            <button
              onClick={() => setActiveSubTab('crm')}
              className={`px-3 py-1 rounded text-[11px] font-medium transition-all ${
                activeSubTab === 'crm'
                  ? 'bg-[#181818] text-white font-medium border border-[#333333] shadow-xs'
                  : 'text-[#888888] hover:text-[#ededed]'
              }`}
            >
              Pipeline ({leads.length})
            </button>
            <button
              onClick={() => setActiveSubTab('hunter')}
              className={`px-3 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                activeSubTab === 'hunter'
                  ? 'bg-[#181818] text-white font-medium border border-[#333333] shadow-xs'
                  : 'text-[#888888] hover:text-[#ededed]'
              }`}
            >
              <IconGoogleMaps className="w-3.5 h-3.5 text-rose-400" />
              <span>Maps Hunter</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenLeadModal}
            leftIcon={<IconPlus className="w-3.5 h-3.5" />}
          >
            Add Lead
          </Button>
        </div>
      </div>

      {activeSubTab === 'hunter' ? (
        <GoogleMapsLeadHunter
          onImportLead={onImportProspect}
          onOpenWhatsApp={onOpenWhatsApp}
        />
      ) : (
        <div>
          {leads.length === 0 ? (
            <EmptyState
              title="No leads in sales pipeline"
              description="Discover prospects with the Google Maps Hunter or manually log a contact to initiate outreach."
              icon={IconTarget}
              action={
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setActiveSubTab('hunter')}
                    leftIcon={<IconGoogleMaps className="w-3.5 h-3.5 text-rose-400" />}
                  >
                    Open Maps Hunter
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onOpenLeadModal}
                    leftIcon={<IconPlus className="w-3.5 h-3.5" />}
                  >
                    Add Lead
                  </Button>
                </div>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {leads.map((l) => {
                const waNum = formatWhatsAppNumber(l.phone);

                return (
                  <div
                    key={l.id}
                    className="bg-[#0a0a0a] border border-[#222222] hover:border-[#383838] rounded-lg p-4 space-y-3 flex flex-col justify-between shadow-xs transition-all"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Badge variant="neutral" size="xs">
                            {l.source}
                          </Badge>
                          <h3 className="font-display text-xs font-semibold text-white mt-1.5 truncate">
                            {l.name}
                          </h3>
                          <p className="text-[11px] text-[#888888] font-sans truncate">
                            {l.company || 'Direct Contact'}
                          </p>
                        </div>
                        <span className="font-mono text-xs font-bold text-emerald-400 shrink-0">
                          {formatINR(l.estimated_value_inr)}
                        </span>
                      </div>

                      {l.notes && (
                        <p className="text-[11px] text-[#a1a1a1] bg-black p-2.5 rounded-md border border-[#1c1c1c] leading-relaxed font-sans line-clamp-3">
                          {l.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-[#1c1c1c]">
                      <select
                        value={l.status}
                        onChange={(e) => onUpdateStatus(l.id, e.target.value as LeadStatus)}
                        className="h-6.5 px-2 bg-black border border-[#222222] hover:border-[#383838] focus:border-white rounded text-[11px] text-[#ededed] focus:outline-none cursor-pointer font-sans transition-colors"
                      >
                        {LEAD_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {waNum && (
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => onOpenWhatsApp(waNum, l.company || l.name)}
                            leftIcon={<IconWhatsApp className="w-3 h-3 text-emerald-400" />}
                            className="text-[11px] text-emerald-300 font-mono"
                          >
                            WhatsApp
                          </Button>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => onDeleteLead(l.id)}
                            className="p-1 text-[#666666] hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                            title="Delete lead"
                          >
                            <IconTrash className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
