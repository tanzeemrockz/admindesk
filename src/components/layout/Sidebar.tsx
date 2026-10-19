import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Profile, UserStatus } from '../../types/database';
import { Badge } from '../ui/Badge';
import {
  IconCSC,
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
  IconCommand,
  IconChevronLeft,
  IconLogOut,
  IconX
} from '../../lib/icons';

interface SidebarProps {
  currentProfile: Profile | null;
  pendingReviewsCount: number;
  openLeadsCount: number;
  activeProjectsCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCommandPalette: () => void;
  onUpdateStatus: (status: UserStatus) => void;
  onSignOut: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  currentProfile,
  pendingReviewsCount,
  openLeadsCount,
  activeProjectsCount,
  isCollapsed,
  onToggleCollapse,
  onOpenCommandPalette,
  onUpdateStatus,
  onSignOut,
  isMobileOpen = false,
  onCloseMobile
}: SidebarProps) {
  const location = useLocation();
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [mobileStatusMenuOpen, setMobileStatusMenuOpen] = useState(false);

  const statusColors: Record<UserStatus, string> = {
    'Available': 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]',
    'Working on Project': 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.6)]',
    'On Leave': 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]'
  };

  const navGroups = [
    {
      label: 'Core Workflows',
      items: [
        { path: '/', label: 'Overview', icon: IconHome, exact: true },
        {
          path: '/reviews',
          label: 'Review Board',
          icon: IconCheckSquare,
          badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
          badgeVariant: 'amber' as const
        },
        {
          path: '/projects',
          label: 'Projects & Intake',
          icon: IconBriefcase,
          badge: activeProjectsCount > 0 ? activeProjectsCount : undefined,
          badgeVariant: 'neutral' as const
        },
        {
          path: '/leads',
          label: 'Leads & Maps Hunter',
          icon: IconTarget,
          badge: openLeadsCount > 0 ? openLeadsCount : undefined,
          badgeVariant: 'emerald' as const
        },
        { path: '/clients', label: 'Clients Directory', icon: IconBuilding }
      ]
    },
    {
      label: 'Platform Decks',
      items: [
        { path: '/decks/github', label: 'GitHub Cockpit', icon: IconGitHub },
        { path: '/decks/vercel', label: 'Vercel Deployments', icon: IconVercel },
        { path: '/decks/supabase', label: 'Supabase Studio', icon: IconSupabase },
        { path: '/decks/maps', label: 'Google Maps Engine', icon: IconGoogleMaps },
        { path: '/decks/whatsapp', label: 'WhatsApp Gateway', icon: IconWhatsApp },
        { path: '/decks/discord', label: 'Discord Broadcaster', icon: IconDiscord }
      ]
    },
    {
      label: 'Governance & Settings',
      items: [
        { path: '/connectors', label: 'Connectors Mesh', icon: IconLayers },
        { path: '/team', label: 'Team Governance', icon: IconUsers },
        { path: '/credentials', label: 'Credentials Vault', icon: IconKey },
        { path: '/settings/database', label: 'Database Initializer', icon: IconDatabase }
      ]
    }
  ];

  return (
    <>
      {/* Desktop Sticky Sidebar (Hidden on Mobile) */}
      <aside
        className={`relative hidden md:flex flex-col border-r border-[#222222] bg-black transition-all duration-200 select-none z-20 shrink-0 h-screen sticky top-0 ${
          isCollapsed ? 'w-14' : 'w-60'
        }`}
      >
        {/* Brand & Workspace Header */}
        <div
          className={`h-12 border-b border-[#222222] flex items-center ${
            isCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'
          }`}
        >
          {isCollapsed ? (
            <button
              onClick={onToggleCollapse}
              title="Expand Sidebar (⌘B)"
              className="w-9 h-9 rounded-md flex items-center justify-center text-zinc-300 hover:text-white hover:bg-[#141414] transition group relative"
            >
              <IconCSC className="w-5 h-5 group-hover:scale-105 transition-transform" />
              <span className="absolute left-full ml-3 px-2.5 py-1 bg-black border border-[#333333] rounded-md text-[11px] text-white whitespace-nowrap shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 font-sans">
                Expand Sidebar
              </span>
            </button>
          ) : (
            <>
              <NavLink to="/" className="flex items-center gap-2.5 min-w-0 group">
                <IconCSC className="w-6 h-6 shrink-0 transition-transform group-hover:scale-105" />
                <div className="min-w-0 leading-tight">
                  <div className="font-display font-bold text-xs text-white tracking-tight truncate">
                    CyberSlayerCorpz
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono tracking-wide truncate">
                    CSC AdminDesk
                  </div>
                </div>
              </NavLink>

              <button
                onClick={onToggleCollapse}
                title="Collapse sidebar"
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#141414] transition shrink-0"
              >
                <IconChevronLeft className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Quick Search Trigger */}
        <div className={isCollapsed ? 'py-2 flex justify-center' : 'p-2.5'}>
          <button
            onClick={onOpenCommandPalette}
            className={
              isCollapsed
                ? 'w-9 h-9 rounded-md border border-[#222222] bg-[#0a0a0a] hover:bg-[#141414] hover:border-[#383838] text-zinc-400 hover:text-zinc-200 transition flex items-center justify-center group relative shadow-xs'
                : 'w-full h-7 rounded-md border border-[#222222] bg-[#0a0a0a] hover:bg-[#141414] hover:border-[#383838] text-zinc-400 hover:text-zinc-200 transition flex items-center justify-between px-2.5 text-xs shadow-xs'
            }
            title="Command Palette (Cmd+K / Ctrl+K)"
          >
            <div className="flex items-center gap-2">
              <IconCommand className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              {!isCollapsed && <span className="text-[11px] font-sans">Command Palette</span>}
            </div>
            {!isCollapsed && (
              <kbd className="text-[10px] font-mono px-1 rounded bg-[#111111] border border-[#2a2a2a] text-zinc-400">
                ⌘K
              </kbd>
            )}
            {isCollapsed && (
              <span className="absolute left-full ml-3 px-2.5 py-1 bg-black border border-[#333333] rounded-md text-[11px] text-white whitespace-nowrap shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 font-sans">
                Search (⌘K)
              </span>
            )}
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-1.5 space-y-2' : 'px-2 space-y-3.5'} pb-4 custom-scrollbar`}>
          {navGroups.map((group) => (
            <div key={group.label} className={isCollapsed ? 'space-y-1' : 'space-y-0.5'}>
              {!isCollapsed && (
                <div className="px-2 pt-2 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                  {group.label}
                </div>
              )}
              {isCollapsed && <div className="h-px bg-[#1f1f1f] my-1.5 mx-2" />}

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? location.pathname === item.path || (item.path === '/' && location.pathname === '/overview')
                  : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`group relative flex items-center rounded-md text-xs font-medium transition-colors duration-150 ${
                      isActive
                        ? 'bg-[#181818] text-white font-semibold shadow-xs border border-[#2a2a2a]'
                        : 'text-zinc-400 hover:text-white hover:bg-[#111111] border border-transparent'
                    } ${
                      isCollapsed
                        ? 'w-9 h-9 mx-auto justify-center'
                        : 'gap-2.5 px-2.5 py-1.5 h-7'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'
                      }`}
                    />

                    {/* Badge in collapsed mode: subtle dot indicator */}
                    {isCollapsed && item.badge !== undefined && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-black" />
                    )}

                    {/* Expanded text & count badge */}
                    {!isCollapsed && (
                      <span className="truncate flex-1 font-sans">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge !== undefined && (
                      <Badge variant={item.badgeVariant} size="xs">
                        {item.badge}
                      </Badge>
                    )}

                    {/* Hover Tooltip in collapsed mode */}
                    {isCollapsed && (
                      <span className="absolute left-full ml-3 px-2.5 py-1 bg-black border border-[#333333] rounded-md text-[11px] text-white whitespace-nowrap shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 font-sans flex items-center gap-2">
                        <span>{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-900 text-amber-300">
                            {item.badge}
                          </span>
                        )}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Presence & Sign Out */}
        <div className="p-2 border-t border-[#222222] bg-black">
          <div className="relative">
            <div
              className={`flex items-center gap-2 rounded-md transition ${
                isCollapsed ? 'justify-center p-1' : 'p-1.5 hover:bg-[#141414] cursor-pointer'
              }`}
              onClick={() => setStatusMenuOpen((v) => !v)}
            >
              {/* Status Dot & Avatar */}
              <div className="relative shrink-0 cursor-pointer group">
                <div className="w-7 h-7 rounded-md bg-[#161616] border border-[#2e2e2e] flex items-center justify-center font-bold text-xs text-white group-hover:border-zinc-500 transition-colors">
                  {currentProfile?.full_name?.charAt(0) || 'M'}
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black ${
                    statusColors[currentProfile?.status || 'Available']
                  }`}
                />

                {isCollapsed && (
                  <span className="absolute left-full ml-3 px-2.5 py-1 bg-black border border-[#333333] rounded-md text-[11px] text-white whitespace-nowrap shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 font-sans">
                    {currentProfile?.full_name || 'Mohamed Tanzeem'}
                  </span>
                )}
              </div>

              {!isCollapsed && (
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-xs font-semibold text-white truncate">
                    {currentProfile?.full_name || 'Mohamed Tanzeem'}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate font-sans">
                    {currentProfile?.role === 'Founder' || currentProfile?.is_admin
                      ? 'Founder & Principal Architect'
                      : currentProfile?.role || 'Principal Architect'}
                  </div>
                </div>
              )}

              {!isCollapsed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSignOut();
                  }}
                  title="Sign out of CSC Operations Desk"
                  className="p-1 text-zinc-400 hover:text-rose-400 rounded hover:bg-rose-500/10 transition"
                >
                  <IconLogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Quick Popover */}
            {statusMenuOpen && (
              <div
                className={`absolute mb-1.5 bg-[#0a0a0a] border border-[#2e2e2e] rounded-lg p-1.5 shadow-2xl space-y-0.5 z-50 animate-in fade-in duration-100 ${
                  isCollapsed
                    ? 'bottom-0 left-full ml-3 w-48'
                    : 'bottom-full left-0 w-full'
                }`}
              >
                <div className="px-2 py-0.5 text-[9px] font-mono text-zinc-400 uppercase tracking-wider">
                  Presence Status
                </div>
                {(['Available', 'Working on Project', 'On Leave'] as UserStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      onUpdateStatus(st);
                      setStatusMenuOpen(false);
                    }}
                    className={`w-full px-2 py-1 rounded text-[11px] text-left flex items-center gap-2 hover:bg-[#161616] transition ${
                      currentProfile?.status === st ? 'text-white font-semibold bg-[#1a1a1a]' : 'text-zinc-400'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusColors[st]}`} />
                    <span>{st === 'On Leave' ? 'Away' : st}</span>
                  </button>
                ))}

                {isCollapsed && (
                  <div className="pt-1 mt-1 border-t border-[#222222]">
                    <button
                      onClick={() => {
                        setStatusMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full px-2 py-1 rounded text-[11px] text-left flex items-center gap-2 text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <IconLogOut className="w-3 h-3" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Visible on screens < 768px when isMobileOpen is true) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          />

          {/* Sliding Drawer */}
          <aside className="fixed inset-y-0 left-0 w-72 bg-black border-r border-[#222222] flex flex-col z-50 animate-in slide-in-from-left duration-200 shadow-2xl select-none">
            {/* Header */}
            <div className="h-12 border-b border-[#222222] flex items-center justify-between px-3.5">
              <NavLink
                to="/"
                onClick={onCloseMobile}
                className="flex items-center gap-2.5 min-w-0"
              >
                <IconCSC className="w-6 h-6 shrink-0" />
                <div className="min-w-0 leading-tight">
                  <div className="font-display font-bold text-xs text-white tracking-tight truncate">
                    CyberSlayerCorpz
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono tracking-wide truncate">
                    CSC AdminDesk
                  </div>
                </div>
              </NavLink>

              <button
                onClick={onCloseMobile}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#141414] transition shrink-0"
                aria-label="Close navigation drawer"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Search */}
            <div className="p-2.5">
              <button
                onClick={() => {
                  onCloseMobile?.();
                  onOpenCommandPalette();
                }}
                className="w-full h-7 rounded-md border border-[#222222] bg-[#0a0a0a] hover:bg-[#141414] hover:border-[#383838] text-zinc-400 hover:text-zinc-200 transition flex items-center justify-between px-2.5 text-xs shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <IconCommand className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="text-[11px] font-sans">Command Palette</span>
                </div>
                <kbd className="text-[10px] font-mono px-1 rounded bg-[#111111] border border-[#2a2a2a] text-zinc-400">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Navigation Groups */}
            <nav className="flex-1 overflow-y-auto px-2 space-y-4 pb-4 custom-scrollbar">
              {navGroups.map((group) => (
                <div key={group.label} className="space-y-0.5">
                  <div className="px-2 pt-2 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                    {group.label}
                  </div>

                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.exact
                      ? location.pathname === item.path || (item.path === '/' && location.pathname === '/overview')
                      : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onCloseMobile}
                        className={`group relative flex items-center rounded-md text-xs font-medium transition-colors duration-150 gap-2.5 px-2.5 py-1.5 h-7 ${
                          isActive
                            ? 'bg-[#181818] text-white font-semibold shadow-xs border border-[#2a2a2a]'
                            : 'text-zinc-400 hover:text-white hover:bg-[#111111] border border-transparent'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                        <span className="truncate flex-1 font-sans">{item.label}</span>
                        {item.badge !== undefined && (
                          <Badge variant={item.badgeVariant} size="xs">
                            {item.badge}
                          </Badge>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* User Presence & Sign Out */}
            <div className="p-2 border-t border-[#222222] bg-black">
              <div className="relative">
                <div
                  className="flex items-center gap-2 rounded-md p-1.5 hover:bg-[#141414] cursor-pointer transition"
                  onClick={() => setMobileStatusMenuOpen((v) => !v)}
                >
                  <div className="relative shrink-0">
                    <div className="w-7 h-7 rounded-md bg-[#161616] border border-[#2e2e2e] flex items-center justify-center font-bold text-xs text-white">
                      {currentProfile?.full_name?.charAt(0) || 'M'}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black ${
                        statusColors[currentProfile?.status || 'Available']
                      }`}
                    />
                  </div>

                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="text-xs font-semibold text-white truncate">
                      {currentProfile?.full_name || 'Mohamed Tanzeem'}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate font-sans">
                      {currentProfile?.role === 'Founder' || currentProfile?.is_admin
                        ? 'Founder & Principal Architect'
                        : currentProfile?.role || 'Principal Architect'}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseMobile?.();
                      onSignOut();
                    }}
                    title="Sign out of CSC Operations Desk"
                    className="p-1 text-zinc-400 hover:text-rose-400 rounded hover:bg-rose-500/10 transition"
                  >
                    <IconLogOut className="w-3.5 h-3.5" />
                  </button>
                </div>

                {mobileStatusMenuOpen && (
                  <div className="absolute bottom-full left-0 w-full mb-1.5 bg-[#0a0a0a] border border-[#2e2e2e] rounded-lg p-1.5 shadow-2xl space-y-0.5 z-50 animate-in fade-in duration-100">
                    <div className="px-2 py-0.5 text-[9px] font-mono text-zinc-400 uppercase tracking-wider">
                      Presence Status
                    </div>
                    {(['Available', 'Working on Project', 'On Leave'] as UserStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          onUpdateStatus(st);
                          setMobileStatusMenuOpen(false);
                        }}
                        className={`w-full px-2 py-1 rounded text-[11px] text-left flex items-center gap-2 hover:bg-[#161616] transition ${
                          currentProfile?.status === st ? 'text-white font-semibold bg-[#1a1a1a]' : 'text-zinc-400'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusColors[st]}`} />
                        <span>{st === 'On Leave' ? 'Away' : st}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
