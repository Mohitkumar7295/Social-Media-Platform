import { createClient } from '@insforge/sdk';

const baseUrl = import.meta.env.VITE_INSFORGE_URL || 'https://u9367zk9.us-east.insforge.app';
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY || 'ik_7a92c79e83bf37e2f2791602c71bb359';

export const insforge = createClient({
  baseUrl,
  anonKey,
});
