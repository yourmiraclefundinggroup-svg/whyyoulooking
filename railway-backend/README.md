# ScoreShift — Array API Proxy (Railway)

Stateless Express service that proxies Array token generation and credit-report fetches through Railway's **static outbound IP**.  
This lets you give Array a permanent IP to allowlist, instead of chasing Replit's rotating addresses.

---

## How it fits together

```
Browser → Replit app (frontend + most backend)
               ↓ server-to-server (INTERNAL_API_SECRET)
         Railway (this service)
               ↓ ARRAY_API_KEY / ARRAY_APP_KEY
            Array API
```

---

## Deploy to Railway (step by step)

### 1 — Push only this folder to a GitHub repo

You can push the entire ScoreShift repo, or just this `railway-backend/` folder as its own repo.  
If you push the whole repo, set the **Root Directory** to `railway-backend` in Railway's project settings.

### 2 — Create a new Railway project

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select your repo (and set Root Directory = `railway-backend` if needed)
3. Railway detects `package.json` automatically via Nixpacks — no extra config needed

### 3 — Set environment variables in Railway

In your Railway project → **Variables** tab, add:

| Variable | Value | Notes |
|---|---|---|
| `ARRAY_API_KEY` | *(your Array server-side API key)* | Goes in `x-array-server-token` header |
| `ARRAY_APP_KEY` | *(your Array app key UUID)* | Goes in the token request body |
| `INTERNAL_API_SECRET` | *(any long random string you choose)* | Must match `INTERNAL_API_SECRET` in your Replit secrets |
| `ALLOWED_ORIGIN` | `https://your-app.replit.app,https://yourdevurl.replit.dev` | Comma-separated list of allowed origins |
| `ARRAY_PRODUCTION_MODE` | `true` or leave unset | Unset = sandbox; `true` = production Array API |
| `PORT` | *(Railway sets this automatically — do not set it yourself)* | |

### 4 — Get your Railway static IP

1. In your Railway project → **Settings** → **Networking**
2. Copy the **outbound static IP** shown there
3. Send that IP to Array support: *"Please allowlist `<IP>` for my account — this is our Railway deployment IP and will not change."*

### 5 — Add Railway URL to Replit secrets

Once deployed, Railway gives you a URL like `https://scoreshift-array-proxy.up.railway.app`.

Add it to your Replit secrets:

| Secret | Value |
|---|---|
| `RAILWAY_BACKEND_URL` | `https://your-railway-url.up.railway.app` |
| `INTERNAL_API_SECRET` | *(same value you set in Railway)* |

The Replit server will automatically route all Array token/credit-report calls through Railway when `RAILWAY_BACKEND_URL` is set.

---

## Routes

### `GET /health`
No auth required. Returns:
```json
{ "status": "ok", "service": "scoreshift-array-proxy", "env": "sandbox", "timestamp": "..." }
```

### `POST /array/token`
**Auth:** `Authorization: Bearer <INTERNAL_API_SECRET>`  
**Body:**
```json
{ "userId": "<arrayUserId>", "appKey": "<optional override>" }
```
**Returns:**
```json
{ "token": "<short-lived user token>" }
```

### `GET /array/credit-report?userToken=<token>`
**Auth:** `Authorization: Bearer <INTERNAL_API_SECRET>`  
**Returns:** Raw Array credit-report JSON

---

## Local development

```bash
cd railway-backend
cp .env.example .env   # fill in your keys
npm install
npm run dev
```

Create a `.env` file (never commit it):
```
ARRAY_API_KEY=your_key_here
ARRAY_APP_KEY=your_app_key_here
INTERNAL_API_SECRET=any_long_random_string
ALLOWED_ORIGIN=http://localhost:5000
ARRAY_PRODUCTION_MODE=false
```
