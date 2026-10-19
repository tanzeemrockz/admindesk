import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function Card({ className, hoverEffect = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-[#0a0a0a] border border-[#222222] rounded-lg transition-all duration-150 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]',
        hoverEffect && 'hover:border-[#383838] hover:bg-[#0e0e0e] cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}


export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-4 pb-2 flex flex-col space-y-1', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('font-display text-xs font-semibold text-white tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-[11px] text-zinc-400 font-sans', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-4 pt-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-3 px-4 bg-[#050505] border-t border-[#222222] rounded-b-lg flex items-center justify-between text-xs text-zinc-400 font-sans', className)} {...props}>
      {children}
    </div>
  );
}

