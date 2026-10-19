import { useLocation } from 'react-router-dom';
import { Profile } from '../../types/database';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  IconZoho,
  IconVercel,
  IconGitHub,
  IconSupabase,
  IconGlobe,
  IconCommand,
  IconWhatsApp,
  IconMenu
} from '../../lib/icons';

interface HeaderProps {
  user: Profile | null;
  isAdmin: boolean;
  onOpenCommandPalette: () => void;
  onOpenQuickDrafter: () => void;
  onOpenBillingModal: () => void;
  onSignOut: () => void;
  onToggleMobileMenu?: () => void;
}

export function Header({
  user,
  isAdmin,
  onOpenCommandPalette,
  onOpenQuickDrafter,
  onOpenBillingModal,
  onToggleMobileMenu
}: HeaderProps) {

  const location = useLocation();

  const getBreadcrumb = () => {
    const p = location.pathname;
    if (p === '/' || p === '/overview') return { category: 'Core', title: 'Operations Overview' };
    if (p === '/reviews') return { category: 'Core', title: 'Internal Review Board' };
    if (p === '/projects') return { category: 'Core', title: 'Projects & Asset Intake' };
    if (p === '/leads') return { category: 'Core', title: 'Leads & Maps Hunter' };
    if (p === '/clients') return { category: 'Core', title: 'Clients Directory' };
    if (p === '/decks/github') return { category: 'Platform Decks', title: 'GitHub Cockpit' };
    if (p === '/decks/vercel') return { category: 'Platform Decks', title: 'Vercel Deployments' };
    if (p === '/decks/supabase') return { category: 'Platform Decks', title: 'Supabase Studio' };
    if (p === '/decks/maps') return { category: 'Platform Decks', title: 'Google Maps Engine' };
    if (p === '/decks/whatsapp') return { category: 'Platform Decks', title: 'WhatsApp Gateway' };
    if (p === '/decks/discord') return { category: 'Platform Decks', title: 'Discord Broadcaster' };
    if (p === '/connectors') return { category: 'Integrations', title: 'Connectors Mesh' };
    if (p === '/team') return { category: 'Agency', title: 'Team Governance' };
    if (p === '/credentials') return { category: 'Agency', title: 'Credentials Vault' };
    if (p === '/settings/database') return { category: 'Agency', title: 'Database Initializer' };
    return { category: 'Workspace', title: 'Console' };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="sticky top-0 z-10 h-12 bg-black/90 backdrop-blur-md border-b border-[#222222] px-4 lg:px-6 flex items-center justify-between gap-3 select-none">
      {/* Left: Hamburger (mobile) & Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs min-w-0">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 -ml-1 text-zinc-400 hover:text-white rounded-md hover:bg-[#141414] transition-colors shrink-0"
            aria-label="Toggle navigation drawer"
            title="Toggle Menu"
          >
            <IconMenu className="w-4 h-4" />
          </button>
        )}
        <span className="text-zinc-500 font-mono text-[11px] shrink-0 hidden sm:inline">{breadcrumb.category}</span>
        <span className="text-zinc-700 shrink-0 hidden sm:inline">/</span>
        <span className="text-white font-semibold font-sans tracking-tight truncate">{breadcrumb.title}</span>
        {isAdmin ? (
          <Badge variant="emerald" size="xs">
            Admin
          </Badge>
        ) : (
          <Badge variant="neutral" size="xs">
            {user?.role || 'Member'}
          </Badge>
        )}
      </div>

      {/* Right: Quick Launchers & Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Global Search Button */}
        <button
          onClick={onOpenCommandPalette}
          className="h-7 px-2.5 bg-[#0a0a0a] hover:bg-[#141414] border border-[#222222] hover:border-[#383838] rounded-md text-xs text-zinc-300 hover:text-white flex items-center gap-2 transition-all shadow-xs"
          title="Command Palette (Cmd+K)"
        >
          <IconCommand className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline text-[11px] font-sans">Search</span>
          <kbd className="text-[10px] font-mono px-1 rounded bg-[#111111] border border-[#2a2a2a] text-zinc-400">
            ⌘K
          </kbd>
        </button>

        <div className="h-3.5 w-px bg-[#222222] mx-0.5 hidden sm:block" />


        {/* External Stack Launchers */}
        <div className="hidden md:flex items-center gap-1">
          <a
            href="https://mail.zoho.in"
            target="_blank"
            rel="noopener noreferrer"
            className="h-7 px-2 rounded-md bg-transparent hover:bg-[#141414] text-zinc-400 hover:text-zinc-100 text-xs flex items-center gap-1.5 transition-colors"
            title="Zoho Webmail"
          >
            <IconZoho className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[11px]">Zoho</span>
          </a>
          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="h-7 px-2 rounded-md bg-transparent hover:bg-[#141414] text-zinc-400 hover:text-zinc-100 text-xs flex items-center gap-1.5 transition-colors"
            title="Vercel Dashboard"
          >
            <IconVercel className="w-3 h-3 text-zinc-400" />
            <span className="text-[11px]">Vercel</span>
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="h-7 px-2 rounded-md bg-transparent hover:bg-[#141414] text-zinc-400 hover:text-zinc-100 text-xs flex items-center gap-1.5 transition-colors"
            title="GitHub"
          >
            <IconGitHub className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[11px]">GitHub</span>
          </a>
          <a
            href="https://www.spaceship.com/application/"
            target="_blank"
            rel="noopener noreferrer"
            className="h-7 px-2 rounded-md bg-transparent hover:bg-[#141414] text-zinc-400 hover:text-zinc-100 text-xs flex items-center gap-1.5 transition-colors"
            title="Spaceship DNS"
          >
            <IconGlobe className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[11px]">Spaceship</span>
          </a>
          {isAdmin && (
            <a
              href="https://supabase.com/dashboard/project/jerjcyesegdpbicfhajz"
              target="_blank"
              rel="noopener noreferrer"
              className="h-7 px-2 rounded-md bg-transparent hover:bg-[#141414] text-emerald-400/80 hover:text-emerald-300 text-xs flex items-center gap-1.5 transition-colors"
              title="Supabase Project"
            >
              <IconSupabase className="w-3.5 h-3.5" />
              <span className="text-[11px]">Supabase</span>
            </a>
          )}
        </div>

        <div className="h-3.5 w-px bg-[#222222] mx-0.5" />


        {/* Quick Modal Triggers */}
        <Button
          size="sm"
          variant="secondary"
          onClick={onOpenQuickDrafter}
          leftIcon={<IconWhatsApp className="w-3 h-3 text-emerald-400" />}
          className="text-[11px] h-7"
        >
          <span className="hidden sm:inline">WhatsApp</span>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={onOpenBillingModal}
          className="text-[11px] h-7 text-zinc-400 hover:text-zinc-200"
        >
          Calculator
        </Button>
      </div>
    </header>
  );
}
