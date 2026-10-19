import React from 'react';
import { cn } from '../../lib/utils';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'bg-[#050505] border border-dashed border-[#262626] rounded-lg p-10 sm:p-14 text-center flex flex-col items-center justify-center space-y-3',
        className
      )}
    >
      {Icon && (
        <div className="w-10 h-10 rounded-md bg-black border border-[#222222] flex items-center justify-center text-[#888888] shadow-xs mb-1">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="max-w-sm space-y-1">
        <h4 className="font-display text-xs font-semibold text-[#ededed]">{title}</h4>
        <p className="text-[11px] text-[#888888] leading-relaxed font-sans">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
