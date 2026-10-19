import { VercelDeployment, VercelLogLine } from '../types/vercel';

export interface VercelProjectSummary {
  id: string;
  name: string;
  framework: string | null;
  updatedAt: number;
  gitRepo?: string;
  latestDeploymentUrl?: string;
}

export async function verifyVercelToken(token: string): Promise<{ valid: boolean; username?: string; email?: string; error?: string }> {
  if (!token || !token.trim()) return { valid: false, error: 'Token is empty.' };
  try {
    const res = await fetch('https://api.vercel.com/v2/user', {
      headers: { Authorization: `Bearer ${token.trim()}` }
    });
    if (res.ok) {
      const data = await res.json();
      return { valid: true, username: data.user?.username, email: data.user?.email };
    }
    const err = await res.json().catch(() => ({}));
    return { valid: false, error: err.error?.message || `Vercel error: HTTP ${res.status}` };
  } catch (e: any) {
    return { valid: false, error: e.message || 'Network connection failed.' };
  }
}

export async function fetchVercelProjects(token: string): Promise<VercelProjectSummary[]> {
  if (!token || !token.trim()) return [];
  try {
    const res = await fetch('https://api.vercel.com/v9/projects?limit=50', {
      headers: { Authorization: `Bearer ${token.trim()}` }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.projects || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      framework: p.framework,
      updatedAt: p.updatedAt,
      gitRepo: p.link?.repo,
      latestDeploymentUrl: p.latestDeployments?.[0]?.url ? `https://${p.latestDeployments[0].url}` : undefined
    }));
  } catch {
    return [];
  }
}

export async function fetchVercelDeployments(projectIdOrName?: string, token?: string): Promise<VercelDeployment[]> {
  if (!token || !token.trim()) return [];
  try {
    const url = projectIdOrName
      ? `https://api.vercel.com/v6/deployments?projectId=${projectIdOrName}&limit=10`
      : `https://api.vercel.com/v6/deployments?limit=10`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token.trim()}` }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.deployments || []).map((d: any) => ({
      id: d.uid,
      name: d.name,
      url: d.url ? `https://${d.url}` : '',
      state: d.state || 'READY',
      target: d.target || 'preview',
      branch: d.meta?.githubCommitRef || 'main',
      commitMessage: d.meta?.githubCommitMessage || 'Deploy',
      commitAuthor: d.meta?.githubCommitAuthorName || d.creator?.username || 'developer',
      createdAt: d.created,
      durationMs: d.buildingAt ? d.ready - d.buildingAt : 24000
    }));
  } catch {
    return [];
  }
}

export async function triggerVercelRedeploy(projectIdOrName: string, deploymentId?: string, token?: string): Promise<{ success: boolean; message: string }> {
  if (!token || !token.trim()) {
    return { success: false, message: 'Vercel API Token is required to trigger deployment.' };
  }
  try {
    const body: Record<string, any> = { name: projectIdOrName };
    if (deploymentId) body.deploymentId = deploymentId;

    const res = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      return { success: true, message: `Vercel redeploy triggered for ${projectIdOrName}. Build in progress.` };
    }
    const err = await res.json().catch(() => ({}));
    return { success: false, message: err.error?.message || `Failed to trigger deployment: HTTP ${res.status}` };
  } catch (e: any) {
    return { success: false, message: e.message || 'Network error triggering Vercel redeploy.' };
  }
}

export async function fetchVercelEnvKeys(projectIdOrName: string, token: string): Promise<string[]> {
  if (!token || !token.trim() || !projectIdOrName) return [];
  try {
    const res = await fetch(`https://api.vercel.com/v9/projects/${projectIdOrName}/env`, {
      headers: { Authorization: `Bearer ${token.trim()}` }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.envs || []).map((e: any) => e.key);
  } catch {
    return [];
  }
}

export async function syncEnvVarToVercel(
  projectIdOrName: string,
  token: string,
  key: string,
  value: string,
  target: string[] = ['production', 'preview', 'development']
): Promise<{ success: boolean; message: string }> {
  if (!token || !token.trim() || !projectIdOrName) {
    return { success: false, message: 'Vercel Token and Project Name are required.' };
  }
  try {
    const res = await fetch(`https://api.vercel.com/v10/projects/${projectIdOrName}/env`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key,
        value,
        type: 'encrypted',
        target
      })
    });
    if (res.ok) {
      return { success: true, message: `Environment variable ${key} synced to Vercel.` };
    }
    const err = await res.json().catch(() => ({}));
    return { success: false, message: err.error?.message || `Failed to sync env var: HTTP ${res.status}` };
  } catch (e: any) {
    return { success: false, message: e.message || 'Network error syncing env var to Vercel.' };
  }
}

export async function syncSupabaseToVercel(
  projectIdOrName: string,
  vercelToken: string,
  supabaseUrl: string,
  supabaseAnonKey: string,
  supabaseServiceKey?: string
): Promise<{ success: boolean; syncedCount: number; message: string }> {
  if (!vercelToken || !projectIdOrName) {
    return { success: false, syncedCount: 0, message: 'Vercel credentials required.' };
  }

  const varsToSync: Array<{ key: string; value: string }> = [
    { key: 'VITE_SUPABASE_URL', value: supabaseUrl },
    { key: 'VITE_SUPABASE_ANON_KEY', value: supabaseAnonKey }
  ];
  if (supabaseServiceKey) {
    varsToSync.push({ key: 'SUPABASE_SERVICE_ROLE_KEY', value: supabaseServiceKey });
  }

  let count = 0;
  for (const v of varsToSync) {
    const r = await syncEnvVarToVercel(projectIdOrName, vercelToken, v.key, v.value);
    if (r.success) count++;
  }

  return {
    success: count > 0,
    syncedCount: count,
    message: `Cross-Platform Bridge: Synced ${count} Supabase environment variables into Vercel project ${projectIdOrName}.`
  };
}
