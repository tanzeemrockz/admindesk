import React, { useState } from 'react';
import { Profile, UserRole } from '../../types/database';
import {
  IconUsers,
  IconPlus,
  IconShield,
  IconTrash,
  IconAlertCircle
} from '../../lib/icons';
import { Button, Badge, Input, Select, Modal } from '../ui';

interface TeamViewProps {
  profiles: Profile[];
  currentUserId: string;
  isAdmin: boolean;
  onUpdateRole: (memberId: string, role: UserRole) => void;
  onToggleAdmin: (memberId: string, makeAdmin: boolean) => void;
  onAddMember?: (member: Omit<Profile, 'id'>) => Promise<void>;
  onDeleteMember?: (memberId: string) => Promise<void>;
}

const ROLES: UserRole[] = ['Founder', 'Developer', 'Designer', 'Sales Outreach', 'Intern'];

export function TeamView({
  profiles,
  currentUserId,
  isAdmin,
  onUpdateRole,
  onToggleAdmin,
  onAddMember,
  onDeleteMember
}: TeamViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Developer');
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmitNewMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      if (onAddMember) {
        await onAddMember({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          role,
          is_admin: makeAdmin,
          status: 'Available'
        });
      }
      setFullName('');
      setEmail('');
      setRole('Developer');
      setMakeAdmin(false);
      setModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to provision account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-[#0a0a0a] border border-[#222222] rounded-lg p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-sm font-bold text-white tracking-tight">
              Team Governance &amp; Provisioning
            </h1>
            <Badge variant="neutral" size="xs">{profiles.length}</Badge>
          </div>
          <p className="text-[11px] text-[#888888] font-sans mt-0.5">
            Strict Supabase invite-only gate &bull; Administrator role assignments and access revocations.
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setErrorMessage('');
              setModalOpen(true);
            }}
            leftIcon={<IconPlus className="w-3.5 h-3.5" />}
          >
            Provision Member
          </Button>
        )}
      </div>

      {/* Team Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {profiles.map((m) => {
          const isSelf = m.id === currentUserId;
          const statusVariant =
            m.status === 'Available'
              ? 'emerald'
              : m.status === 'Working on Project'
              ? 'cyber'
              : 'neutral';

          return (
            <div
              key={m.id}
              className="bg-[#0a0a0a] border border-[#222222] hover:border-[#383838] rounded-lg p-4 flex flex-col justify-between transition-all shadow-xs space-y-3 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-black border border-[#222222] flex items-center justify-center font-display text-xs font-bold text-[#ededed] shrink-0">
                      {m.full_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-display text-sm font-semibold text-white truncate">
                          {m.full_name}
                        </h3>
                        {m.is_admin && (
                          <Badge variant="emerald" size="xs">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-[#888888] mt-0.5 font-mono truncate select-all">
                        {m.email}
                      </p>
                    </div>
                  </div>

                  <Badge variant={statusVariant} size="xs" dot>
                    {m.status || 'Available'}
                  </Badge>
                </div>
              </div>

              {isAdmin ? (
                <div className="pt-2.5 border-t border-[#1c1c1c] flex items-center justify-between gap-2 text-xs">
                  <select
                    value={m.role || 'Developer'}
                    onChange={(e) => onUpdateRole(m.id, e.target.value as UserRole)}
                    className="h-7 px-2 bg-black border border-[#222222] hover:border-[#383838] focus:border-white rounded-md text-xs text-[#ededed] focus:outline-none font-medium cursor-pointer transition-colors"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1.5">
                    {!isSelf && (
                      <Button
                        variant={m.is_admin ? 'danger' : 'outline'}
                        size="xs"
                        onClick={() => onToggleAdmin(m.id, !m.is_admin)}
                      >
                        {m.is_admin ? 'Revoke Admin' : 'Make Admin'}
                      </Button>
                    )}

                    {!isSelf && onDeleteMember && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => {
                          if (confirm(`Deprovision and revoke access for ${m.full_name} (${m.email})?`)) {
                            onDeleteMember(m.id);
                          }
                        }}
                        className="text-[#666666] hover:text-rose-400 transition"
                        aria-label="Deprovision member account"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                      </Button>
                    )}

                    {isSelf && (
                      <span className="text-[11px] text-[#666666] font-mono">You</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="pt-2.5 border-t border-[#1c1c1c] text-xs text-[#888888] flex items-center justify-between">
                  <span>Role:</span>
                  <span className="text-white font-medium">{m.role || 'Member'}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Account Provisioning Modal */}
      {modalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setModalOpen(false)}
          title="Provision Team Account"
          description="Pre-authorize email for gated sign in."
          badge={
            <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <IconShield className="w-3 h-3 text-emerald-400" />
            </div>
          }
        >
          <div className="space-y-4 text-xs font-sans">
            <p className="text-xs text-[#888888] leading-relaxed font-sans">
              Once provisioned, this team member will be authorized to sign in using their Google account or work email. Unregistered identities are rejected by the login gate.
            </p>

            {errorMessage && (
              <div className="p-2.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-2 text-xs">
                <IconAlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitNewMember} className="space-y-3.5">
              <Input
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                required
              />

              <Input
                label="Google Workspace / Work Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@cyberslayercorpz.dev or sarah@gmail.com"
                required
              />

              <Select
                label="Role Assignment"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <option value="Developer">Developer</option>
                <option value="Designer">Designer</option>
                <option value="Sales Outreach">Sales Outreach</option>
                <option value="Intern">Intern</option>
              </Select>

              <label className="flex items-center gap-2.5 cursor-pointer pt-1 text-xs text-[#ededed]">
                <input
                  type="checkbox"
                  checked={makeAdmin}
                  onChange={(e) => setMakeAdmin(e.target.checked)}
                  className="rounded bg-black border-[#222222] text-emerald-500 focus:ring-0 focus:ring-offset-0"
                />
                <span>Grant Administrator privileges (Can invite &amp; configure keys)</span>
              </label>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#222222]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                >
                  Provision Account
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
