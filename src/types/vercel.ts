export interface VercelDeployment {
  id: string;
  name: string;
  url: string;
  state: 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED';
  target: 'production' | 'preview';
  branch: string;
  commitMessage: string;
  commitAuthor: string;
  createdAt: number;
  durationMs: number;
}

export interface VercelLogLine {
  id: string;
  timestamp: string;
  type: 'info' | 'warn' | 'error' | 'stdout';
  message: string;
}
