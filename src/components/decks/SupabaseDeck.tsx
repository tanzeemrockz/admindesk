import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import {
  IconSupabase,
  IconRefresh,
  IconExternalLink,
  IconCheckCircle,
  IconAlertCircle,
  IconDatabase,
  IconUsers,
  IconActivity
} from '../../lib/icons';

export function SupabaseDeck() {
  const [activeTable, setActiveTable] = useState<'projects' | 'tasks' | 'leads' | 'clients' | 'profiles' | 'project_credentials'>('projects');
  const [tableData, setTableData] = useState<any[]>([]);
  const [recordCount, setRecordCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Quick Member Invite State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'Developer' | 'Designer' | 'Intern'>('Developer');
  const [inviting, setInviting] = useState(false);

  const showNotice = (text: string, type: 'success' | 'error') => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 4000);
  };

  const loadTable = useCallback(async (tableName: string) => {
    setIsLoading(true);
    try {
      const { data, count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(10);

      if (error) {
        setTableData([]);
        setRecordCount(0);
        showNotice(error.message, 'error');
      } else {
        setTableData(data || []);
        setRecordCount(count || data?.length || 0);
      }
    } catch (e: any) {
      setTableData([]);
      showNotice(e.message || 'Query failed', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTable(activeTable);
  }, [activeTable, loadTable]);

  const handlePingLatency = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      await supabase.from('profiles').select('id', { count: 'exact', head: true });
      const duration = Math.round(performance.now() - start);
      setLatency(duration);
      showNotice(`PostgreSQL Connection Pooler responded in ${duration}ms`, 'success');
    } catch (e: any) {
      setLatency(null);
      showNotice(`Ping error: ${e.message}`, 'error');
    } finally {
      setIsPinging(false);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    setInviting(true);
    try {
      const { error } = await supabase.from('profiles').insert([
        {
          id: `usr-${Date.now()}`,
          full_name: inviteName.trim(),
          email: inviteEmail.trim(),
          role: inviteRole,
          is_admin: false,
          status: 'Available',
          created_at: new Date().toISOString()
        }
      ]);

      if (error) throw error;
      showNotice(`Added ${inviteName} (${inviteEmail}) to workspace profiles.`, 'success');
      setInviteEmail('');
      setInviteName('');
      if (activeTable === 'profiles') loadTable('profiles');
    } catch (e: any) {
      showNotice(e.message || 'Failed to add profile', 'error');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-surface border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-base border border-border text-emerald-400">
            <IconSupabase className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-display text-white">Supabase Studio</h1>
              {latency !== null && (
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  {latency}ms Latency
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Live PostgreSQL table inspection, pooler latency diagnostics, and team profiles dispatcher.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePingLatency}
            disabled={isPinging}
            className="px-3 py-1.5 rounded-lg bg-base hover:bg-elevated border border-border text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <IconActivity className={`w-3.5 h-3.5 text-emerald-400 ${isPinging ? 'animate-spin' : ''}`} />
            <span>{isPinging ? 'Pinging...' : 'Ping Latency'}</span>
          </button>

          <button
            onClick={() => loadTable(activeTable)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-base hover:bg-elevated border border-border text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
          >
            <IconRefresh className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <a
            href="https://supabase.com/dashboard/project/jerjcyesegdpbicfhajz"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-base hover:bg-elevated border border-border text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <IconExternalLink className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </a>
        </div>
      </div>

      {notice && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
            notice.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)} className="opacity-75 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Table Browser (8 cols) */}
        <div className="lg:col-span-8 bg-surface border border-border rounded-xl p-5 space-y-4">
          {/* Table Selector Tabs */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 border-b border-border">
            <div className="flex items-center gap-1">
              {(['projects', 'tasks', 'leads', 'clients', 'profiles', 'project_credentials'] as const).map((tbl) => (
                <button
                  key={tbl}
                  onClick={() => setActiveTable(tbl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                    activeTable === tbl
                      ? 'bg-white text-zinc-950 font-bold shadow'
                      : 'text-zinc-400 hover:text-white hover:bg-elevated'
                  }`}
                >
                  {tbl}
                </button>
              ))}
            </div>

            <span className="text-[11px] font-mono text-zinc-400 shrink-0">
              {recordCount} total rows
            </span>
          </div>

          {/* Table Data Preview */}
          {isLoading ? (
            <div className="py-12 text-center text-zinc-500 text-xs font-mono animate-pulse">
              Querying table {activeTable}...
            </div>
          ) : tableData.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              Zero records returned for {activeTable}. Seed data in Database Initializer.
            </div>
          ) : (
            <div className="space-y-2.5 overflow-x-auto">
              {tableData.map((row, index) => (
                <div
                  key={row.id || index}
                  className="p-3 rounded-lg bg-base border border-border text-xs font-mono space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-emerald-400 truncate">
                      {row.id || `Row #${index + 1}`}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {row.created_at ? new Date(row.created_at).toLocaleString() : ''}
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-300 break-words bg-surface/50 p-2 rounded border border-border/50">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(row, null, 2)}</pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Team Profile Dispatcher & Health (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Profile Dispatcher */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <IconUsers className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Add Team Profile
              </h2>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  required
                  className="w-full px-3 py-1.5 bg-base border border-border rounded-lg text-xs text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="alex@cyberslayercorpz.dev"
                  required
                  className="w-full px-3 py-1.5 bg-base border border-border rounded-lg text-xs text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-base border border-border rounded-lg text-xs text-white focus:outline-none focus:border-zinc-500"
                >
                  <option value="Developer">Developer</option>
                  <option value="Designer">Designer</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={inviting}
                className="w-full py-2 px-3 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition disabled:opacity-50"
              >
                {inviting ? 'Saving Profile...' : 'Insert Profile to Database'}
              </button>
            </form>
          </div>

          {/* Database Info Card */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-3 text-xs text-zinc-400">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Instance Details
            </h3>
            <div className="space-y-1 font-mono text-[11px]">
              <div>Engine: PostgreSQL 15.6</div>
              <div>Host: aws-0-ap-south-1</div>
              <div>Region: Mumbai, India</div>
              <div>Pooler: Transaction Mode (Port 6543)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
