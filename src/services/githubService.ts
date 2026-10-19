import { GitHubPullRequest, GitHubCommit } from '../types/github';

export interface GitHubRepoSummary {
  id: number;
  fullName: string;
  name: string;
  owner: string;
  defaultBranch: string;
  isPrivate: boolean;
  htmlUrl: string;
}

export async function verifyGitHubToken(token: string): Promise<{ valid: boolean; username?: string; error?: string }> {
  if (!token || !token.trim()) {
    return { valid: false, error: 'Token is empty.' };
  }
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token.trim()}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      return { valid: true, username: data.login };
    }
    const err = await res.json().catch(() => ({}));
    return { valid: false, error: err.message || `GitHub error: HTTP ${res.status}` };
  } catch (e: any) {
    return { valid: false, error: e.message || 'Network connection failed.' };
  }
}

export async function fetchUserRepos(token: string): Promise<GitHubRepoSummary[]> {
  if (!token || !token.trim()) return [];
  try {
    const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token.trim()}`
      }
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((r: any) => ({
      id: r.id,
      fullName: r.full_name,
      name: r.name,
      owner: r.owner?.login || '',
      defaultBranch: r.default_branch || 'main',
      isPrivate: Boolean(r.private),
      htmlUrl: r.html_url
    }));
  } catch {
    return [];
  }
}

export async function fetchGitHubPRs(repoOwner: string, repoName: string, token?: string): Promise<GitHubPullRequest[]> {
  if (!repoOwner || !repoName) return [];
  try {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
    if (token) headers.Authorization = `Bearer ${token.trim()}`;
    const res = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/pulls?state=all&per_page=10`, { headers });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((pr: any) => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      author: pr.user?.login || 'unknown',
      branch: pr.head?.ref || 'feature',
      baseBranch: pr.base?.ref || 'main',
      state: pr.state,
      checksStatus: 'success',
      additions: 0,
      deletions: 0,
      changedFiles: 0,
      updatedAt: pr.updated_at,
      htmlUrl: pr.html_url
    }));
  } catch {
    return [];
  }
}

export async function mergeGitHubPR(repoOwner: string, repoName: string, pullNumber: number, token?: string): Promise<{ success: boolean; message: string }> {
  if (!token) {
    return { success: false, message: 'GitHub Personal Access Token is required to execute PR merge.' };
  }
  try {
    const res = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${pullNumber}/merge`, {
      method: 'PUT',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        merge_method: 'squash',
        commit_title: `Merge PR #${pullNumber} via CSC AdminDesk`
      })
    });
    if (res.ok) {
      return { success: true, message: `PR #${pullNumber} successfully merged into main.` };
    }
    const err = await res.json().catch(() => ({}));
    return { success: false, message: err.message || `Merge failed: HTTP ${res.status}` };
  } catch (e: any) {
    return { success: false, message: e.message || 'Network error during merge.' };
  }
}

export async function fetchGitHubCommits(repoOwner: string, repoName: string, token?: string): Promise<GitHubCommit[]> {
  if (!repoOwner || !repoName) return [];
  try {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
    if (token) headers.Authorization = `Bearer ${token.trim()}`;
    const res = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/commits?per_page=10`, { headers });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((c: any) => ({
      sha: (c.sha || '').substring(0, 7),
      message: c.commit?.message || 'Commit',
      author: c.commit?.author?.name || c.author?.login || 'developer',
      date: c.commit?.author?.date || new Date().toISOString(),
      htmlUrl: c.html_url
    }));
  } catch {
    return [];
  }
}

export async function triggerGitHubWorkflow(repoOwner: string, repoName: string, workflowId: string, token: string): Promise<{ success: boolean; message: string }> {
  if (!token) {
    return { success: false, message: 'GitHub Personal Access Token is required to trigger workflow.' };
  }
  try {
    const res = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/actions/workflows/${workflowId}/dispatches`, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ref: 'main' })
    });
    if (res.status === 204) {
      return { success: true, message: 'Workflow dispatch event triggered successfully.' };
    }
    return { success: false, message: `Failed to trigger workflow: HTTP ${res.status}` };
  } catch (e: any) {
    return { success: false, message: e.message || 'Network error triggering workflow.' };
  }
}
