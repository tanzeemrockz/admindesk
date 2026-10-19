import React from 'react';
import { cn } from '../../lib/utils';
import { IconChevronRight } from '../../lib/icons';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  selectSize?: 'sm' | 'md';
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      selectSize = 'sm',
      disabled,
      children,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    const sizes = {
      sm: 'h-7 text-xs pl-2.5 pr-7',
      md: 'h-8 text-xs pl-3 pr-8'
    };

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={selectId} className="block text-[11px] font-medium text-zinc-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={cn(
              'w-full appearance-none bg-black border rounded-md font-sans text-white transition-all duration-150 cursor-pointer',
              'border-[#222222] hover:border-[#3a3a3a] focus:border-white focus:outline-none',
              'disabled:opacity-50 disabled:bg-zinc-950 disabled:cursor-not-allowed',
              error ? 'border-rose-500/80 focus:border-rose-400' : '',

              sizes[selectSize],
              className
            )}
            {...props}
          >
            {children}
          </select>
          <span className="absolute right-2 text-zinc-500 pointer-events-none rotate-90 flex items-center">
            <IconChevronRight className="w-3 h-3" />
          </span>
        </div>
        {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
