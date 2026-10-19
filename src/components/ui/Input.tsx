import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: 'sm' | 'md';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      leftIcon,
      rightIcon,
      inputSize = 'sm',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    const sizes = {
      sm: 'h-7 text-xs px-2.5',
      md: 'h-8 text-xs px-3'
    };

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-[11px] font-medium text-zinc-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-2.5 text-zinc-500 pointer-events-none flex items-center">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'w-full bg-black border rounded-md font-sans text-white placeholder:text-zinc-600 transition-all duration-150',
              'border-[#222222] hover:border-[#3a3a3a] focus:border-white focus:bg-black focus:outline-none',
              'disabled:opacity-50 disabled:bg-zinc-950 disabled:cursor-not-allowed',
              error ? 'border-rose-500/80 focus:border-rose-400' : '',

              leftIcon ? 'pl-8' : '',
              rightIcon ? 'pr-8' : '',
              sizes[inputSize],
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-2.5 text-zinc-500 pointer-events-none flex items-center">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
