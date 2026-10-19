import React, { useState } from 'react';
import { ProjectCredential } from '../../types/database';
import { IconCopy, IconCheck, IconEye, IconEyeOff, IconPlus, IconTrash, IconKey } from '../../lib/icons';
import { Button, Badge, Input, Select, EmptyState } from '../ui';

interface CredentialsViewProps {
  credentials: ProjectCredential[];
  onAddCredential: (cred: Omit<ProjectCredential, 'id'>) => void;
  onDeleteCredential: (id: string) => void;
}

export function CredentialsView({ credentials, onAddCredential, onDeleteCredential }: CredentialsViewProps) {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New credential form state
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [serviceType, setServiceType] = useState<ProjectCredential['service_type']>('API Key');
  const [identifier, setIdentifier] = useState('');
  const [secret, setSecret] = useState('');
  const [notes, setNotes] = useState('');

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copySecret = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !secret.trim()) return;
    onAddCredential({
      title: title.trim(),
      service_type: serviceType,
      identifier: identifier.trim() || undefined,
      secret: secret.trim(),
      notes: notes.trim() || undefined
    });
    setTitle('');
    setIdentifier('');
    setSecret('');
    setNotes('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#0a0a0a] border border-[#222222] rounded-lg p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-sm font-bold text-white tracking-tight">Credentials &amp; Access Keys</h2>
            <Badge variant="neutral" size="xs">{credentials.length}</Badge>
          </div>
          <p className="text-[11px] text-[#888888] font-sans mt-0.5">
            Masked client-side, encrypted operational store for deployment tokens and access keys.
          </p>
        </div>
        <Button
          variant={isAdding ? 'secondary' : 'primary'}
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          leftIcon={<IconPlus className="w-3.5 h-3.5" />}
        >
          {isAdding ? 'Cancel' : 'Add Key'}
        </Button>
      </div>

      {/* Add New Key Form */}
      {isAdding && (
        <form onSubmit={handleSave} className="bg-[#0a0a0a] border border-[#222222] rounded-lg p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="border-b border-[#222222] pb-3">
            <h3 className="font-display text-sm font-semibold text-white">Save Service Key or Credential</h3>
            <p className="text-xs text-[#888888] mt-0.5 font-sans">Vault confidential environment tokens or registrar credentials</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Resend Production API Key"
            />
            <Select
              label="Category"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value as any)}
            >
              <option value="Domain Registrar">Domain Registrar</option>
              <option value="API Key">API Key / Token</option>
              <option value="Hosting">Hosting</option>
              <option value="SMTP">SMTP</option>
              <option value="DNS / CDN">DNS / CDN</option>
              <option value="Social">Social</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Identifier (Optional)"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Username, login email, or account ID"
            />
            <Input
              label="Secret / Token"
              type="text"
              required
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Paste token or credential value"
              className="font-mono text-emerald-400"
            />
          </div>

          <Input
            label="Internal Notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Usage instructions, project scoping, or expiry notes"
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#222222]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Save to Vault
            </Button>
          </div>
        </form>
      )}

      {/* Secrets Vault Grid or Empty State */}
      {credentials.length === 0 ? (
        <EmptyState
          icon={IconKey}
          title="No credentials registered"
          description="Store deployment tokens, domain registrar logins, and SMTP credentials safely in the project vault."
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAdding(true)}
              leftIcon={<IconPlus className="w-3.5 h-3.5" />}
            >
              Add Key
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {credentials.map((cred) => {
            const isRevealed = revealedIds.has(cred.id);
            const isCopied = copiedId === cred.id;

            return (
              <div
                key={cred.id}
                className="bg-[#0a0a0a] border border-[#222222] hover:border-[#383838] rounded-lg p-4 space-y-3 flex flex-col justify-between transition-all shadow-xs group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="purple" size="xs">
                        {cred.service_type}
                      </Badge>
                      <h3 className="font-display text-sm font-semibold text-white mt-1.5">
                        {cred.title}
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => {
                        if (confirm(`Delete credential "${cred.title}"?`)) {
                          onDeleteCredential(cred.id);
                        }
                      }}
                      className="text-[#666666] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete credential"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {cred.identifier && (
                    <div className="flex items-center gap-1.5 text-xs text-[#888888]">
                      <span className="text-[#555555] font-mono text-[11px]">User:</span>
                      <span className="text-[#ededed] font-mono select-all">{cred.identifier}</span>
                    </div>
                  )}

                  {/* Secret Value Card */}
                  <div className="bg-black border border-[#222222] rounded-md px-3 py-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-emerald-400 truncate max-w-[220px] select-all">
                      {isRevealed ? cred.secret : '••••••••••••••••••••••••'}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => toggleReveal(cred.id)}
                        aria-label={isRevealed ? 'Mask secret' : 'Reveal secret'}
                        title={isRevealed ? 'Mask' : 'Reveal'}
                      >
                        {isRevealed ? <IconEyeOff className="w-3.5 h-3.5 text-[#888888]" /> : <IconEye className="w-3.5 h-3.5 text-[#888888]" />}
                      </Button>
                      <Button
                        type="button"
                        variant={isCopied ? 'secondary' : 'outline'}
                        size="xs"
                        onClick={() => copySecret(cred.id, cred.secret)}
                        leftIcon={isCopied ? <IconCheck className="w-3 h-3 text-emerald-400" /> : <IconCopy className="w-3 h-3" />}
                        className="font-mono text-[11px]"
                      >
                        {isCopied ? 'Copied' : 'Copy'}
                      </Button>
                    </div>
                  </div>

                  {cred.notes && (
                    <p className="text-[11px] text-[#666666] italic leading-normal font-sans">
                      {cred.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
