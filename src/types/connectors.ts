export type ConnectorId = 'github' | 'vercel' | 'supabase' | 'google-maps' | 'whatsapp' | 'discord';

export type ConnectorStatus = 'connected' | 'disconnected' | 'configuring' | 'error';

export interface ConnectorConfigField {
  key: string;
  label: string;
  placeholder: string;
  isSecret?: boolean;
  required?: boolean;
  description?: string;
}

export interface ConnectorToolParam {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  label: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
  defaultValue?: string | number | boolean;
}

export interface ConnectorTool {
  name: string;
  displayName: string;
  description: string;
  parameters: ConnectorToolParam[];
}

export interface ConnectorResource {
  uri: string;
  name: string;
  type: string;
  badge?: string;
  updatedAt?: string;
  details?: Record<string, any>;
  url?: string;
}

export interface ConnectorMeta {
  id: ConnectorId;
  name: string;
  tagline: string;
  category: 'DevOps & SCM' | 'Edge & Cloud' | 'Database & Storage' | 'Outreach & Geo' | 'Communication';
  status: ConnectorStatus;
  authType: 'Personal Access Token' | 'Bearer Token' | 'API Key' | 'Webhook URL' | 'Database Connection';
  docsUrl: string;
  configFields: ConnectorConfigField[];
  tools: ConnectorTool[];
}

export interface CrossPlatformBridge {
  id: string;
  sourceConnector: ConnectorId;
  targetConnector: ConnectorId;
  title: string;
  description: string;
  supportedActions: string[];
}
