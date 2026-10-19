import React, { useEffect, useRef } from 'react';
import { IconX } from '../../lib/icons';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  badge,
  children,
  maxWidth = 'lg',
  className = ''
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  }[maxWidth];

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        className={`bg-[#0a0a0a] border border-[#222222] rounded-xl w-full ${maxWidthClass} p-5 shadow-2xl my-8 space-y-4 animate-in zoom-in-95 duration-150 ${className}`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <h3 id="modal-title" className="font-display text-sm font-semibold text-white tracking-tight truncate">
                {title}
              </h3>
              {badge}
            </div>
            {description && (
              <p className="text-xs text-zinc-400 mt-0.5 truncate font-sans">
                {description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#111111] border border-[#2e2e2e] text-zinc-400">
              ESC
            </kbd>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-white rounded-md hover:bg-[#161616] transition-colors"
              aria-label="Close dialog"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>
        </div>


        <div>{children}</div>
      </div>
    </div>
  );
}
