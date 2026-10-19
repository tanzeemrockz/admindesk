export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  author: string;
  branch: string;
  baseBranch: string;
  state: 'open' | 'closed' | 'merged';
  checksStatus: 'success' | 'failure' | 'pending';
  additions: number;
  deletions: number;
  changedFiles: number;
  updatedAt: string;
  htmlUrl: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  htmlUrl: string;
}

export interface GitHubWorkflowRun {
  id: number;
  name: string;
  status: 'completed' | 'in_progress' | 'queued';
  conclusion: 'success' | 'failure' | 'cancelled' | null;
  branch: string;
  event: string;
  updatedAt: string;
}
