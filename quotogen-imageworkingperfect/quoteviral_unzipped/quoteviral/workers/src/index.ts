import { handleRequest } from './handlers';

interface Env {
  DOMAIN: string;
  QUOTE_CACHE: KVNamespace;
  ASSETS_BUCKET: R2Bucket;
  UPLOADS: R2Bucket;
  GENERATED: R2Bucket;
  TEMPLATES: R2Bucket;
  IMAGES: any; // Cloudflare Images binding
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env);
  },
};
