import React, { useState, useEffect, useCallback } from 'react';
import {
  verifyGitHubToken,
  fetchUserRepos,
  fetchGitHubPRs,
  fetchGitHubCommits,
  mergeGitHubPR,
  triggerGitHubWorkflow,
  GitHubRepoSummary
} from '../../services/githubService';
import { GitHubPullRequest, GitHubCommit } from '../../types/github';
import {
  IconGitHub,
  IconRefresh,
  IconExternalLink,
  IconCheckCircle,
  IconGitPullRequest,
  IconAlertCircle,
  IconKey,
  IconTerminal
} from '../../lib/icons';

interface GitHubDeckProps {
  initialToken?: string;
  onUpdateToken?: (token: string) => void;
}

export function GitHubDeck({ initialToken = '', onUpdateToken }: GitHubDeckProps) {
  const [token, setToken] = useState(() => localStorage.getItem('csc_github_token') || initialToken);
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'verifying' | 'error'>('disconnected');
  const [username, setUsername] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [repos, setRepos] = useState<GitHubRepoSummary[]>([]);
  const [activeRepo, setActiveRepo] = useState<string>(() => localStorage.getItem('csc_github_active_repo') || '');
  const [prs, setPrs] = useState<GitHubPullRequest[]>([]);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mergingPr, setMergingPr] = useState<number | null>(null);
  const [workflowFile, setWorkflowFile] = useState('production-deploy.yml');
  const [actionNotice, setActionNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotice = (text: string, type: 'success' | 'error') => {
    setActionNotice({ text, type });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const verifyAndLoad = useCallback(async (tokenVal: string) => {
    if (!tokenVal.trim()) {
      setStatus('disconnected');
      setUsername(null);
      setRepos([]);
      return;
    }
    setStatus('verifying');
    setErrorMsg(null);

    const res = await verifyGitHubToken(tokenVal);
    if (res.valid) {
      setStatus('connected');
      setUsername(res.username || 'Authenticated');
      const loadedRepos = await fetchUserRepos(tokenVal);
      setRepos(loadedRepos);
      if (loadedRepos.length > 0 && !activeRepo) {
        setActiveRepo(loadedRepos[0].fullName);
        localStorage.setItem('csc_github_active_repo', loadedRepos[0].fullName);
      }
    } else {
      setStatus('error');
      setErrorMsg(res.error || 'Token validation failed.');
    }
  }, [activeRepo]);

  useEffect(() => {
    if (token) verifyAndLoad(token);
  }, []);

  const loadRepoDetails = useCallback(async () => {
    if (!activeRepo || status !== 'connected') return;
    const [owner, repoName] = activeRepo.split('/');
    if (!owner || !repoName) return;

    setIsLoading(true);
    try {
      const [fetchedPrs, fetchedCommits] = await Promise.all([
        fetchGitHubPRs(owner, repoName, token),
        fetchGitHubCommits(owner, repoName, token)
      ]);
      setPrs(fetchedPrs);
      setCommits(fetchedCommits);
    } catch {
      // Handled in services
    } finally {
      setIsLoading(false);
    }
  }, [activeRepo, status, token]);

  useEffect(() => {
    loadRepoDetails();
  }, [loadRepoDetails]);

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('csc_github_token', token);
    if (onUpdateToken) onUpdateToken(token);
    verifyAndLoad(token);
  };

  const handleMerge = async (prNumber: number) => {
    if (!activeRepo) return;
    const [owner, repoName] = activeRepo.split('/');
    setMergingPr(prNumber);

    const result = await mergeGitHubPR(owner, repoName, prNumber, token);
    setMergingPr(null);

    if (result.success) {
      showNotice(result.message, 'success');
      setPrs((prev) => prev.filter((p) => p.number !== prNumber));
    } else {
      showNotice(result.message, 'error');
    }
  };

  const handleTriggerWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRepo || !workflowFile.trim()) return;
    const [owner, repoName] = activeRepo.split('/');

    showNotice(`Dispatching workflow: ${workflowFile}...`, 'success');
    const result = await triggerGitHubWorkflow(owner, repoName, workflowFile, token);
    if (result.success) {
      showNotice(result.message, 'success');
    } else {
      showNotice(result.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-surface border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-base border border-border text-white">
            <IconGitHub className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-display text-white">GitHub Cockpit</h1>
              {status === 'connected' && (
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  @{username}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Live repository inspection, pull request review gates, commit streams, and Actions workflow dispatcher.
            </p>
          </div>
        </div>

        {/* Active Repo Selector & Refresh */}
        <div className="flex items-center gap-2">
          {status === 'connected' && repos.length > 0 && (
            <select
              value={activeRepo}
              onChange={(e) => {
                setActiveRepo(e.target.value);
                localStorage.setItem('csc_github_active_repo', e.target.value);
              }}
              className="bg-base border border-border rounded-lg px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-zinc-500"
            >
              {repos.map((r) => (
                <option key={r.id} value={r.fullName} className="bg-zinc-900">
                  {r.fullName}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={loadRepoDetails}
            disabled={isLoading || status !== 'connected'}
            className="px-3 py-1.5 rounded-lg bg-base hover:bg-elevated border border-border text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50"
            title="Refresh repository data"
          >
            <IconRefresh className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          {activeRepo && (
            <a
              href={`https://github.com/${activeRepo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-base hover:bg-elevated border border-border text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
            >
              <IconExternalLink className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          )}
        </div>
      </div>

      {actionNotice && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
            actionNotice.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{actionNotice.text}</span>
          <button onClick={() => setActionNotice(null)} className="opacity-75 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: PR Gate & Commit History (Left 8 cols), Controls & PAT (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* PR Review Gate */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <IconGitPullRequest className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Pull Request Review Gate ({prs.length})
                </h2>
              </div>
              <span className="text-[11px] text-zinc-400">Squash &amp; Merge Gate</span>
            </div>

            {status !== 'connected' ? (
              <div className="p-8 text-center text-zinc-400 text-xs">
                Enter your GitHub Personal Access Token in the right panel to inspect pull requests.
              </div>
            ) : isLoading ? (
              <div className="py-8 text-center text-zinc-500 text-xs animate-pulse">
                Querying GitHub REST API for pull requests...
              </div>
            ) : prs.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs">
                Zero open pull requests on <span className="font-mono text-zinc-400">{activeRepo}</span>.
              </div>
            ) : (
              <div className="space-y-3">
                {prs.map((pr) => (
                  <div
                    key={pr.id}
                    className="p-4 rounded-xl bg-base border border-border space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-400 text-xs">
                            #{pr.number}
                          </span>
                          <span className="font-semibold text-white text-sm">{pr.title}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-2 font-mono">
                          <span>by @{pr.author}</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 rounded bg-surface border border-border text-zinc-300">
                            {pr.branch}
                          </span>
                          <span>&rarr;</span>
                          <span className="px-1.5 py-0.2 rounded bg-surface border border-border text-zinc-300">
                            {pr.baseBranch}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={pr.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-surface hover:bg-elevated border border-border text-zinc-400 hover:text-white transition"
                          title="View on GitHub"
                        >
                          <IconExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleMerge(pr.number)}
                          disabled={mergingPr === pr.number}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <IconCheckCircle className="w-3.5 h-3.5" />
                          <span>{mergingPr === pr.number ? 'Merging...' : 'Squash & Merge'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Commit Stream */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Recent Commit Stream
              </h2>
              <span className="text-[11px] text-zinc-400 font-mono">{commits.length} commits loaded</span>
            </div>

            {commits.length === 0 ? (
              <div className="py-6 text-center text-zinc-500 text-xs">
                No recent commits found or repository not loaded.
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {commits.slice(0, 8).map((c) => (
                  <div key={c.sha} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex items-center gap-2.5">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-base border border-border text-zinc-400 shrink-0">
                        {c.sha.slice(0, 7)}
                      </span>
                      <span className="text-zinc-200 font-medium truncate">{c.message}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono shrink-0">
                      {c.author}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Actions Workflow Dispatcher & PAT */}
        <div className="lg:col-span-4 space-y-6">
          {/* Workflow Dispatcher */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <IconTerminal className="w-4 h-4 text-sky-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Actions Dispatcher
              </h2>
            </div>

            <form onSubmit={handleTriggerWorkflow} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Workflow File Name
                </label>
                <input
                  type="text"
                  value={workflowFile}
                  onChange={(e) => setWorkflowFile(e.target.value)}
                  placeholder="deploy.yml"
                  className="w-full px-3 py-1.5 bg-base border border-border rounded-lg text-xs text-white font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>

              <button
                type="submit"
                disabled={!activeRepo || !workflowFile.trim() || status !== 'connected'}
                className="w-full py-2 px-3 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition disabled:opacity-50"
              >
                Dispatch Workflow
              </button>
            </form>
          </div>

          {/* PAT Token Configuration */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <IconKey className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                GitHub PAT Settings
              </h2>
            </div>

            <form onSubmit={handleSaveToken} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Personal Access Token (classic or fine-grained)
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_••••••••••••••••••••••••••••••••"
                  className="w-full px-3 py-1.5 bg-base border border-border rounded-lg text-xs text-white font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-2">
                  <IconAlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 px-3 rounded-lg bg-elevated hover:bg-zinc-800 border border-border text-white font-semibold text-xs transition"
              >
                Save &amp; Verify Token
              </button>
            </form>

            <div className="text-[11px] text-zinc-500 space-y-1">
              <p>Required scopes for full cockpit operations:</p>
              <ul className="list-disc list-inside font-mono text-[10px] text-zinc-400">
                <li>repo (Full control of repositories)</li>
                <li>workflow (Update GitHub Action workflows)</li>
                <li>read:user (Read user profile data)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
