import { Link } from 'react-router-dom';
import { IconAlertCircle } from '../../lib/icons';

interface ReviewAlertBannerProps {
  pendingCount: number;
}

export function ReviewAlertBanner({ pendingCount }: ReviewAlertBannerProps) {
  if (pendingCount <= 0) return null;

  return (
    <div className="bg-amber-500/[0.07] border-b border-amber-500/20 px-4 lg:px-6 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-amber-300/90 font-sans">
          <IconAlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
          <span>
            {pendingCount === 1
              ? '1 task is pending internal review & verification.'
              : `${pendingCount} tasks are pending internal review & verification.`}
          </span>
        </div>
        <Link
          to="/reviews"
          className="text-xs font-semibold text-amber-300 hover:text-white transition-colors underline underline-offset-2"
        >
          Open Review Board &rarr;
        </Link>
      </div>
    </div>
  );
}
