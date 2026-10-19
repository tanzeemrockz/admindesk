import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'icon-xs' | 'icon-sm' | 'icon-md';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'secondary',
      size = 'sm',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans tracking-tight transition-all duration-150 select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.98]';

    const variants = {
      primary:
        'bg-white text-black font-semibold hover:bg-[#eaeaea] active:bg-[#d4d4d4] shadow-[0_1px_2px_rgba(0,0,0,0.2)] border border-white',
      secondary:
        'bg-black hover:bg-[#111111] text-[#ededed] border border-[#2e2e2e] hover:border-[#454545] font-medium shadow-xs',
      ghost:
        'bg-transparent hover:bg-[#111111] text-zinc-400 hover:text-white font-medium',
      danger:
        'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 font-medium',
      outline:
        'bg-transparent hover:bg-[#111111] text-zinc-300 hover:text-white border border-[#222222] hover:border-[#383838] font-medium'
    };


    const sizes = {
      xs: 'h-6 px-2 text-[11px] gap-1 rounded',
      sm: 'h-7 px-2.5 text-xs gap-1.5 rounded-md',
      md: 'h-8 px-3 text-xs gap-2 rounded-lg',
      'icon-xs': 'h-6 w-6 p-0 rounded flex items-center justify-center',
      'icon-sm': 'h-7 w-7 p-0 rounded-md flex items-center justify-center',
      'icon-md': 'h-8 w-8 p-0 rounded-lg flex items-center justify-center'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0 flex items-center">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
