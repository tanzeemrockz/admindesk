import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'emerald' | 'amber' | 'rose' | 'cyber' | 'purple';
  size?: 'xs' | 'sm';
  dot?: boolean;
}

export function Badge({
  className,
  variant = 'neutral',
  size = 'xs',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center gap-1.5 font-sans select-none tracking-tight shrink-0';

  const variants = {
    neutral: 'bg-zinc-900 text-zinc-300 border border-zinc-800',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    cyber: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    purple: 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
  };

  const dots = {
    neutral: 'bg-zinc-500',
    emerald: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]',
    amber: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]',
    rose: 'bg-rose-400',
    cyber: 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.5)]',
    purple: 'bg-purple-400'
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5 rounded-full leading-none font-medium',
    sm: 'text-[11px] px-2.5 py-0.5 rounded-full leading-tight font-medium'
  };


  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dots[variant])} />}
      {children}
    </span>
  );
}
