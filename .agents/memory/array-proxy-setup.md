---
name: Array DO proxy setup
description: Architecture and lessons from getting Array web components working via the DigitalOcean proxy droplet.
---

# Array DO Proxy Setup

## Architecture
- Replit app → `RAILWAY_BACKEND_URL` (DO droplet at `165.245.161.19`) → `sandbox.array.io` or `api.array.io`
- DO droplet is IP-allowlisted by Array; Replit's IP is NOT allowlisted
- DO droplet runs on **port 3001** (not 3000)
- DO droplet app: `/root/Scoreshift-array-backend/`, managed by pm2 as `scoreshift-array-backend`

## Auth between Replit and DO droplet
- Middleware: `Authorization: Bearer <INTERNAL_API_SECRET>` (NOT `x-internal-secret`)
- Both sides must have identical `INTERNAL_API_SECRET`
- Current value: `ScoreShiftProxy2024!` (set June 2026)
- To update droplet: `sed -i 's/INTERNAL_API_SECRET=.*/INTERNAL_API_SECRET=NEW/' .env && pm2 restart all --update-env`
- `pm2 restart all` WITHOUT `--update-env` does NOT pick up new .env values

## Sandbox vs Production token flow
- Sandbox demo mode: static fallback token `AD45C4BF-5C0A-40B3-8A53-ED29D091FA11` (Thomas Devos persona) used with `mock.array.io` — no proxy needed
- Real sandbox: user must enroll via Array web component → Array assigns UUID → store in `arrayEnrollments.arrayUserId` → proxy calls `sandbox.array.io`
- Production: set `ARRAY_PRODUCTION_MODE=true` in Replit secrets + production Array credentials
- `isRealArrayId` check in routes.ts gates whether proxy is called: must be a proper UUID format

## Key credentials (do not store values here — use Replit secrets)
- `ARRAY_APP_KEY` sandbox: `EA23400D-C8B0-4D2D-834B-355C8D86BA0D`
- `ARRAY_SERVER_TOKEN`: sent as `x-array-server-token` header to Array API
- `RAILWAY_BACKEND_URL`: points to DO droplet public IP/domain

## Why
- Replit's outbound IP is not on Array's allowlist and cannot be permanently fixed (dynamic IPs)
- DO droplet has a static IP that Array can permanently allowlist
- The proxy adds auth overhead but is necessary for live (non-demo) token generation
