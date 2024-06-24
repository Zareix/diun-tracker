import type { MetadataRow, UpdatesRow } from '~/db/schema';

export interface DiunWebhookBody {
  diun_version: string;
  hostname: string;
  status: 'new';
  provider: string;
  image: string;
  hub_link: string;
  mime_type: string;
  digest: string;
  created: Date;
  platform: string;
  metadata: Metadata;
}

export interface Metadata {
  ctn_command: string;
  ctn_createdat: string;
  ctn_id: string;
  ctn_names: string;
  ctn_size: string;
  ctn_state: string;
  ctn_status: string;
}
