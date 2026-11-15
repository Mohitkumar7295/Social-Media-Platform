# WriteSpace Production Deployment Guide 🚀

This document details the build optimization, environment provisioning, hosting setup, and post-deployment checklist for WriteSpace.

---

## 1. Environment Configuration

WriteSpace uses Vite's built-in environment variable handling. Only variables prefixed with `VITE_` are bundled into the client build.

### Production Environment Variables (`.env.production`)

```env
# InsForge Production URL (e.g. https://your-app.insforge.app)
VITE_INSFORGE_URL=https://writespace-prod.insforge.app

# InsForge Public Anonymous API Key (Safe for browser client)
VITE_INSFORGE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Base URL
VITE_APP_URL=https://writespace.app
```

> [!CAUTION]
> NEVER expose the InsForge `service_role` or admin database credentials in client `.env` files or frontend source code. Only the public anonymous key is safe for client-side inclusion.

---

## 2. InsForge BaaS Production Provisioning

Before deploying the frontend application, the backend resources on **InsForge** must be provisioned:

1. **Database Schema & RLS Execution**:
   - Execute the SQL DDL commands from `DATABASE_SCHEMA.md` on the production InsForge PostgreSQL instance.
   - Verify that Row Level Security is enabled on all 8 tables:
     ```sql
     SELECT tablename, rowsecurity 
     FROM pg_tables 
     WHERE schemaname = 'public';
     ```
2. **Storage Buckets Creation**:
   - Create two public S3-compatible buckets in InsForge Storage:
     - `avatars` (Public read, authenticated write)
     - `covers` (Public read, authenticated write)
   - Configure allowed MIME types: `image/jpeg, image/png, image/webp`.
   - Configure max file size: `5MB`.
3. **CORS Origin Configuration**:
   - In the InsForge Project settings, add your production frontend domain (e.g., `https://writespace.app`) to the allowed CORS origins list.

---

## 3. Frontend Build Pipeline

### 3.1 Local Build Verification
```bash
# 1. Install clean production dependencies
npm ci

# 2. Run linting & type checks
npm run lint

# 3. Compile optimized production bundle
npm run build

# 4. Preview compiled build locally
npm run preview
```

### 3.2 Build Artifacts Inspection
The Vite build outputs clean static assets into `dist/`:
- `dist/index.html`
- `dist/assets/*.js` (code-split vendor and page chunks)
- `dist/assets/*.css` (purged, minified Tailwind utility classes)

---

## 4. Hosting Platform Deployment

Because WriteSpace is a Single Page Application (SPA), the hosting provider must route all non-static requests to `index.html` for client-side routing.

### 4.1 Vercel Deployment
Create `vercel.json` in root:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
Deploy command:
```bash
vercel --prod
```

### 4.2 Netlify Deployment
Create `netlify.toml` in root:
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 4.3 Cloudflare Pages / Static CDN
Configure single-page application fallback rule: `/* -> /index.html` (200).

---

## 5. Post-Deployment Smoke Test Checklist

- [ ] HTTPS is active with a valid SSL/TLS certificate.
- [ ] Direct deep links (e.g. `https://writespace.app/story/sample-slug`) resolve properly without 404 errors.
- [ ] User registration, login, and session persistence function cleanly.
- [ ] Author can upload cover image and publish article.
- [ ] Reader can like article and submit comments.
- [ ] RLS policies block unauthorized draft access across distinct accounts.
- [ ] Lighthouse performance audit achieves > 90 across Performance, Accessibility, and Best Practices.
