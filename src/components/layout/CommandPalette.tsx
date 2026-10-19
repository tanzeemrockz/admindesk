import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, Lead, Client } from '../../types/database';
import { Badge } from '../ui/Badge';
import {
  IconSearch,
  IconHome,
  IconCheckSquare,
  IconBriefcase,
  IconTarget,
  IconBuilding,
  IconGitHub,
  IconVercel,
  IconSupabase,
  IconGoogleMaps,
  IconWhatsApp,
  IconDiscord,
  IconLayers,
  IconUsers,
  IconKey,
  IconDatabase,
  IconPlus,
  IconGlobe,
  IconZoho
} from '../../lib/icons';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  projects?: Project[];
  leads?: Lead[];
  clients?: Client[];
  onOpenNewProject?: () => void;
  onOpenNewLead?: () => void;
  onOpenNewTask?: () => void;
  onOpenWhatsAppDrafter?: () => void;
  onOpenBillingModal?: () => void;
}

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Actions' | 'Projects' | 'Leads' | 'Clients' | 'External';
  label: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  perform: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  projects = [],
  leads = [],
  clients = [],
  onOpenNewProject,
  onOpenNewLead,
  onOpenNewTask,
  onOpenWhatsAppDrafter,
  onOpenBillingModal
}: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keep active item scrolled into view during arrow key navigation
  useEffect(() => {
    const el = itemRefs.current[selectedIndex];
    if (el) {
      el.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build items list
  const allItems: CommandItem[] = [
    // Navigation
    {
      id: 'nav-overview',
      category: 'Navigation',
      label: 'Go to Overview',
      subtitle: 'CSC Operations dashboard and live metrics',
      icon: IconHome,
      perform: () => { navigate('/'); onClose(); }
    },
    {
      id: 'nav-reviews',
      category: 'Navigation',
      label: 'Go to Review Board',
      subtitle: 'Internal QA, staging verification, admin sign-off',
      icon: IconCheckSquare,
      perform: () => { navigate('/reviews'); onClose(); }
    },
    {
      id: 'nav-projects',
      category: 'Navigation',
      label: 'Go to Projects & Intake',
      subtitle: 'Active client contracts, milestones & asset dropzones',
      icon: IconBriefcase,
      perform: () => { navigate('/projects'); onClose(); }
    },
    {
      id: 'nav-leads',
      category: 'Navigation',
      label: 'Go to Leads & Maps Hunter',
      subtitle: 'Google Maps Places pipeline & prospect scoring',
      icon: IconTarget,
      perform: () => { navigate('/leads'); onClose(); }
    },
    {
      id: 'nav-clients',
      category: 'Navigation',
      label: 'Go to Clients Directory',
      subtitle: 'Client roster, magic links & portal tokens',
      icon: IconBuilding,
      perform: () => { navigate('/clients'); onClose(); }
    },
    {
      id: 'nav-github',
      category: 'Navigation',
      label: 'Go to GitHub Cockpit',
      subtitle: 'Live pull requests, branches, commits & merge trigger',
      icon: IconGitHub,
      perform: () => { navigate('/decks/github'); onClose(); }
    },
    {
      id: 'nav-vercel',
      category: 'Navigation',
      label: 'Go to Vercel Deployments',
      subtitle: 'Edge deployments, 1-click redeploy & Supabase sync bridge',
      icon: IconVercel,
      perform: () => { navigate('/decks/vercel'); onClose(); }
    },
    {
      id: 'nav-supabase',
      category: 'Navigation',
      label: 'Go to Supabase Studio',
      subtitle: 'Database latency ping, table schemas & member invitation',
      icon: IconSupabase,
      perform: () => { navigate('/decks/supabase'); onClose(); }
    },
    {
      id: 'nav-maps',
      category: 'Navigation',
      label: 'Go to Google Maps Engine',
      subtitle: 'Places Text Search prospecting & lead extraction',
      icon: IconGoogleMaps,
      perform: () => { navigate('/decks/maps'); onClose(); }
    },
    {
      id: 'nav-whatsapp',
      category: 'Navigation',
      label: 'Go to WhatsApp Gateway',
      subtitle: 'Direct WhatsApp templates for proposals and milestones',
      icon: IconWhatsApp,
      perform: () => { navigate('/decks/whatsapp'); onClose(); }
    },
    {
      id: 'nav-discord',
      category: 'Navigation',
      label: 'Go to Discord Broadcaster',
      subtitle: 'Webhook alert broadcasting & staging notifications',
      icon: IconDiscord,
      perform: () => { navigate('/decks/discord'); onClose(); }
    },
    {
      id: 'nav-connectors',
      category: 'Navigation',
      label: 'Go to Connectors Mesh',
      subtitle: 'Cross-platform automation mesh & credential configuration',
      icon: IconLayers,
      perform: () => { navigate('/connectors'); onClose(); }
    },
    {
      id: 'nav-team',
      category: 'Navigation',
      label: 'Go to Team Governance',
      subtitle: 'Team roster, roles, status and admin provisioning',
      icon: IconUsers,
      perform: () => { navigate('/team'); onClose(); }
    },
    {
      id: 'nav-credentials',
      category: 'Navigation',
      label: 'Go to Credentials Vault',
      subtitle: 'Project secret vault, domain logins, API keys',
      icon: IconKey,
      perform: () => { navigate('/credentials'); onClose(); }
    },
    {
      id: 'nav-settings-db',
      category: 'Navigation',
      label: 'Go to Database Initializer',
      subtitle: 'Supabase table health verification & PostgreSQL DDL migration wizard',
      icon: IconDatabase,
      perform: () => { navigate('/settings/database'); onClose(); }
    },

    // Actions
    ...(onOpenNewProject ? [{
      id: 'act-new-project',
      category: 'Actions' as const,
      label: 'Create New Project Contract',
      subtitle: 'Initialize client deliverables, milestone pricing, and repository URLs',
      icon: IconPlus,
      perform: () => { onClose(); onOpenNewProject(); }
    }] : []),
    ...(onOpenNewLead ? [{
      id: 'act-new-lead',
      category: 'Actions' as const,
      label: 'Log New Sales Lead',
      subtitle: 'Add prospective client to pipeline CRM',
      icon: IconTarget,
      perform: () => { onClose(); onOpenNewLead(); }
    }] : []),
    ...(onOpenNewTask ? [{
      id: 'act-new-task',
      category: 'Actions' as const,
      label: 'Create QA / Review Task',
      subtitle: 'Add task with Pull Request and staging preview links',
      icon: IconCheckSquare,
      perform: () => { onClose(); onOpenNewTask(); }
    }] : []),
    ...(onOpenWhatsAppDrafter ? [{
      id: 'act-wa-drafter',
      category: 'Actions' as const,
      label: 'Draft WhatsApp Outreach',
      subtitle: 'Generate formatted proposal or client update message',
      icon: IconWhatsApp,
      perform: () => { onClose(); onOpenWhatsAppDrafter(); }
    }] : []),
    ...(onOpenBillingModal ? [{
      id: 'act-invoice-calc',
      category: 'Actions' as const,
      label: 'Launch Milestone Billing Calculator',
      subtitle: 'Calculate project milestones & GST breakdowns',
      icon: IconBriefcase,
      perform: () => { onClose(); onOpenBillingModal(); }
    }] : []),

    // External Stack
    {
      id: 'ext-zoho',
      category: 'External',
      label: 'Open Zoho Webmail',
      subtitle: 'mail.zoho.in',
      icon: IconZoho,
      perform: () => { window.open('https://mail.zoho.in', '_blank'); onClose(); }
    },
    {
      id: 'ext-vercel',
      category: 'External',
      label: 'Open Vercel Dashboard',
      subtitle: 'vercel.com/dashboard',
      icon: IconVercel,
      perform: () => { window.open('https://vercel.com/dashboard', '_blank'); onClose(); }
    },
    {
      id: 'ext-github',
      category: 'External',
      label: 'Open GitHub',
      subtitle: 'github.com',
      icon: IconGitHub,
      perform: () => { window.open('https://github.com', '_blank'); onClose(); }
    },
    {
      id: 'ext-spaceship',
      category: 'External',
      label: 'Open Spaceship DNS',
      subtitle: 'spaceship.com/application',
      icon: IconGlobe,
      perform: () => { window.open('https://www.spaceship.com/application/', '_blank'); onClose(); }
    },
    {
      id: 'ext-supabase',
      category: 'External',
      label: 'Open Supabase Project',
      subtitle: 'supabase.com/dashboard',
      icon: IconSupabase,
      perform: () => { window.open('https://supabase.com/dashboard/project/jerjcyesegdpbicfhajz', '_blank'); onClose(); }
    },

    // Projects
    ...projects.map((p) => ({
      id: `proj-${p.id}`,
      category: 'Projects' as const,
      label: p.title,
      subtitle: `Stage: ${p.stage} • Value: ₹${(p.fee_inr || 0).toLocaleString('en-IN')}`,
      icon: IconBriefcase,
      perform: () => { navigate('/projects'); onClose(); }
    })),

    // Leads
    ...leads.map((l) => ({
      id: `lead-${l.id}`,
      category: 'Leads' as const,
      label: l.name,
      subtitle: `${l.company || 'Individual'} • Status: ${l.status}`,
      icon: IconTarget,
      perform: () => { navigate('/leads'); onClose(); }
    })),

    // Clients
    ...clients.map((c) => ({
      id: `client-${c.id}`,
      category: 'Clients' as const,
      label: c.company_name,
      subtitle: `Contact: ${c.contact_person} • ${c.email || c.phone || ''}`,
      icon: IconBuilding,
      perform: () => { navigate('/clients'); onClose(); }
    }))
  ];

  // Filter items
  const filtered = query.trim()
    ? allItems.filter(
        (it) =>
          it.label.toLowerCase().includes(query.toLowerCase()) ||
          it.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
          it.category.toLowerCase().includes(query.toLowerCase())
      )
    : allItems.slice(0, 24);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].perform();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-150"
        onClick={onClose}
      />

      {/* Palette Modal */}
      <div className="relative w-full max-w-xl bg-[#0a0a0a] border border-[#222222] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[70vh] z-10 animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input Bar */}
        <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-[#222222] bg-black">
          <IconSearch className="w-4 h-4 text-[#888888] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, route, project, lead or platform..."
            className="w-full bg-transparent text-xs text-white placeholder:text-[#555555] focus:outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[11px] text-[#888888] hover:text-white px-1 font-mono"
            >
              Clear
            </button>
          )}
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#111111] border border-[#2e2e2e] text-[#888888] shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-1.5 space-y-0.5 max-h-[380px] custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-[#666666] text-xs font-sans">
              No matching commands or records found for &quot;{query}&quot;.
            </div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              const isFirstInCategory =
                index === 0 || filtered[index - 1].category !== item.category;

              return (
                <React.Fragment key={item.id}>
                  {isFirstInCategory && (
                    <div className="px-2 pt-2.5 pb-1 text-[10px] font-semibold text-[#666666] uppercase tracking-wider font-mono">
                      {item.category}
                    </div>
                  )}
                  <div
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    onClick={() => item.perform()}
                    onMouseMove={() => {
                      if (selectedIndex !== index) {
                        setSelectedIndex(index);
                      }
                    }}
                    className={`px-2.5 py-1.5 rounded-md flex items-center justify-between gap-3 cursor-pointer transition-colors duration-100 ${
                      isSelected
                        ? 'bg-[#181818] text-white shadow-xs border border-[#333333]'
                        : 'text-[#a1a1a1] hover:bg-[#111111] hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`p-1.5 rounded-md shrink-0 border ${
                          isSelected
                            ? 'bg-[#242424] text-white border-[#383838]'
                            : 'bg-black text-[#888888] border-[#222222]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <div className="min-w-0 leading-tight">
                        <div className="text-xs font-medium truncate flex items-center gap-2">
                          <span className={isSelected ? 'text-white font-semibold' : 'text-[#ededed]'}>
                            {item.label}
                          </span>
                        </div>
                        {item.subtitle && (
                          <div className="text-[11px] text-[#888888] truncate font-sans mt-0.5">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black border border-[#2e2e2e] text-[#ededed] shrink-0">
                        ↵ Enter
                      </kbd>
                    )}
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>

        {/* Bottom Helper Bar */}
        <div className="px-3.5 py-2 border-t border-[#222222] bg-black flex items-center justify-between text-[10px] text-[#666666] font-mono">
          <div className="flex items-center gap-2.5">
            <span>↑↓ navigate</span>
            <span>•</span>
            <span>↵ select</span>
            <span>•</span>
            <span>esc close</span>
          </div>
          <span className="font-mono text-[#555555]">CSC AdminDesk</span>
        </div>
      </div>
    </div>
  );
}
