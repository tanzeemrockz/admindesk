import { Link, useLocation } from 'react-router-dom';

interface NavigationProps {
  pendingReviewsCount: number;
  openLeadsCount: number;
}

export function Navigation({ pendingReviewsCount, openLeadsCount }: NavigationProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Overview' },
    {
      path: '/reviews',
      label: 'Review Board',
      badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    },
    { path: '/projects', label: 'Projects & Intake' },
    {
      path: '/leads',
      label: 'Leads & Maps Hunter',
      badge: openLeadsCount > 0 ? openLeadsCount : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
    },
    { path: '/clients', label: 'Clients' },
    { path: '/connectors', label: 'Connectors Mesh' },
    { path: '/team', label: 'Team' },
    { path: '/credentials', label: 'Credentials' }
  ];

  return (
    <div className="bg-surface/80 backdrop-blur border-b border-border px-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-2">
        {navItems.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/' || location.pathname === '/overview'
            : location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-2 ${
                isActive
                  ? 'bg-white text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-elevated'
              }`}
            >
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${item.badgeColor || 'bg-elevated text-zinc-300'}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
