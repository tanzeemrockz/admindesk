import { ConnectorsHub } from '../connectors/ConnectorsHub';

interface ControlsViewProps {
  isAdmin: boolean;
  githubToken?: string;
  vercelToken?: string;
  googleMapsKey?: string;
  discordWebhookUrl?: string;
}

export function ControlsView({
  isAdmin,
  githubToken,
  vercelToken,
  googleMapsKey,
  discordWebhookUrl
}: ControlsViewProps) {
  return (
    <ConnectorsHub
      isAdmin={isAdmin}
      githubToken={githubToken}
      vercelToken={vercelToken}
      googleMapsKey={googleMapsKey}
      discordWebhookUrl={discordWebhookUrl}
    />
  );
}
