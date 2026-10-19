import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { IconCSC, IconGoogle, IconLock, IconShield, IconAlertCircle } from '../../lib/icons';
import { Button, Input, Badge } from '../ui';

interface AuthGateProps {
  authError?: string;
  onClearAuthError?: () => void;
}

export function AuthGate({ authError = '', onClearAuthError }: AuthGateProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const activeError = authError || localError;

  const handleGoogleSignIn = async () => {
    setLocalError('');
    if (onClearAuthError) onClearAuthError();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) setLocalError(error.message);
    } catch (e: any) {
      setLocalError(e.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (onClearAuthError) onClearAuthError();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (error) throw error;
    } catch (err: any) {
      setLocalError(err.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-black select-none">
      <div className="w-full max-w-sm bg-[#0a0a0a] border border-[#222222] rounded-lg p-6 sm:p-7 shadow-2xl space-y-5">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <IconCSC className="w-10 h-10 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-base font-semibold tracking-tight text-white">
                CSC AdminDesk
              </h1>
              <Badge variant="neutral" size="xs">
                v3.0
              </Badge>
            </div>
            <p className="text-xs text-[#888888] font-sans">CyberSlayerCorpz Command Center</p>
          </div>
        </div>

        {/* Access Restriction Notice */}
        <div className="p-3 rounded-md bg-black border border-[#222222] flex items-start gap-2.5 text-xs text-[#888888] leading-normal font-sans">
          <IconShield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-white font-medium">Invite-Only Access:</span> Pre-provisioned team authorization is required. Unregistered identities are rejected.
          </div>
        </div>

        {/* Prominent Access Denied Alert */}
        {activeError && (
          <div className="p-3 rounded-md border bg-rose-500/10 border-rose-500/30 text-rose-300 text-xs space-y-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-semibold text-rose-200">
                <IconAlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                <span>Access Denied</span>
              </div>
              {onClearAuthError && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalError('');
                    onClearAuthError();
                  }}
                  className="text-[11px] text-rose-400 hover:text-rose-200"
                >
                  Dismiss
                </button>
              )}
            </div>
            <p className="leading-relaxed text-[11px] text-[#ededed]">
              {activeError}
            </p>
          </div>
        )}

        {/* Google OAuth Button */}
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full justify-center text-xs"
          leftIcon={<IconGoogle className="w-4 h-4" />}
        >
          Sign In with Google Workspace
        </Button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#222222] w-full" />
          <span className="bg-[#0a0a0a] px-3 text-[10px] text-[#666666] uppercase tracking-wider font-semibold font-mono">
            Or Work Credentials
          </span>
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-3.5">
          <Input
            label="Authorized Work Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tanzeem@cyberslayercorpz.dev"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            minLength={6}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isLoading}
            isLoading={isLoading}
            className="w-full justify-center text-xs"
            leftIcon={<IconLock className="w-3.5 h-3.5" />}
          >
            {isLoading ? 'Verifying Authorization...' : 'Sign In to Workspace'}
          </Button>
        </form>

        <div className="pt-3 border-t border-[#222222] flex items-center justify-between text-[11px] text-[#666666] font-mono">
          <span>RLS Active</span>
          <span>Invite-Only Gate</span>
        </div>
      </div>
    </div>
  );
}
