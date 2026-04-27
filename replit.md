# ScoreShift - Credit Repair Platform

## Overview
ScoreShift is a comprehensive credit repair platform providing AI-powered tools, dispute management, and related services for credit repair professionals and their clients. It aims to streamline the credit repair process, offer personalized insights, and facilitate effective communication. The platform includes features for credit score tracking, issue categorization, AI-powered dispute letter generation, and real-time tracking of dispute letters.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite.
- **UI Components**: Radix UI primitives with shadcn/ui.
- **Styling**: Tailwind CSS with custom credit app color scheme and dark mode support.
- **State Management**: TanStack Query (React Query).
- **Routing**: Wouter for lightweight client-side routing.
- **Forms**: React Hook Form with Zod validation.
- **UI/UX Decisions**: Animated credit score circles, gamified onboarding, mobile-optimized interfaces, professional layout with 12-tab navigation.
- **Admin Portal Design System**: Zinc near-black dark mode (zinc-950 base), white/smoke light mode, single gold accent (`--admin-accent: 38 90% 51%`), deep gold gradient stop (`--admin-accent-deep: 32 92% 38%`). Semantic-only color use: amber=warnings, red=danger/derogatory/collections, green=success/approval, blue=info/hard-inquiries, late-payment severity (30d=yellow/60d=orange). Bureau badges intentionally kept: Experian=blue-500, Equifax=red-500, TransUnion=purple-500.

### Backend Architecture
- **Framework**: Express.js with TypeScript.
- **Database ORM**: Drizzle ORM for type-safe database operations.
- **Session Management**: Express sessions with PostgreSQL session store.
- **API Design**: RESTful API with consistent error handling and logging.

### Database Architecture
- **Database**: PostgreSQL with Neon serverless hosting.
- **Schema Management**: Drizzle migrations.

### Key Features & Technical Implementations
- **Credit Management System**: Credit score tracking, issue categorization, dispute tracking, credit building action plans, goal setting.
- **AI-Powered Features**: AI dispute letter generation (OpenAI), credit score simulation, personalized analysis, automated dispute strategy, 24/7 AI customer support with sentiment analysis.
- **USPS Tracking Integration**: Certified mail tracking with delivery confirmation, 14-day countdowns, follow-up alerts, mobile-optimized tracking.
- **Beta Testing Framework**: User access level management, feature-specific beta control, feedback collection, admin dashboard for test users.
- **Educational Content System**: Categorized content, interactive modules, search/filtering, progress tracking.
- **User Management Flow**: Default "STANDARD" access, admin-generated beta access codes unlocking specific features, feedback collection.
- **Credit Repair Workflow**: Credit report import/analysis, issue identification, AI dispute letter generation, certified mail sending, tracking number monitoring, follow-up alerts, results tracking.
- **Beta Testing Data Flow**: Admin-created access codes, feature unlocking, feedback collection, usage analytics, bug/suggestion management.
- **Security**: Token-based authentication, role-based access control (ADMIN vs CLIENT_VIEWER), secure password management (hashed passwords, forced resets, strong password requirements), elimination of hardcoded credentials.
- **File Management**: Mobile-optimized document viewing and downloading, secure document upload (ID, SSN, bank statements, bureau responses). Intake docs (ID photos, police/FTC reports) stored in `/uploads/intake/` via multer disk storage.
- **Client Intake System**: Editable client profile card in admin portal showing address, DOB, SSN last 4, case type (Standard/Identity Theft), ID photo upload. Identity Theft cases unlock police report #, FTC report #, and document uploads. API: `PATCH /api/admin/users/:id/intake`, `POST /api/admin/users/:id/intake-doc`.
- **Client Password Management**: Secure password change interface, strong password requirements, secure reset API.
- **Admin Portal**: Comprehensive client management, credit data access, user management, support monitoring, business metrics, AI usage tracking.
- **AI Assistant**: Real-time responses, conversation storage, dispute letter generation.
- **Credit Report AI Analysis**: Upload system with drag-and-drop, AI dispute letter generation, real-time credit analysis identifying issues.
- **Professional Dispute Packet Generator**: `server/dispute-packet.ts` generates comprehensive dispute letters with FCRA statute citations (§1681e(b), §1681i, §1681s-2(b), §1681b, §1681c-2), Metro 2 field violations (DA field, K4 payment pattern, ACCT_STATUS), numbered demands per item, cover page with package contents table. Preview dialog in Dispute Hub with copy/save-as-draft options. API: `POST /api/admin/dispute-packet/generate`.
- **Direct Lob Send from Packet Preview**: "Send via Certified Mail" button in the packet preview dialog opens a confirmation dialog showing client name/address and bureau. Calls `POST /api/lob/send-letter` directly; on success displays tracking number + expected delivery date + "View in Tracking Tab" button. Client address is pulled from the credit report's linked client record.
- **White-Label Multi-Tenant Configuration**: `WhiteLabelPage` component (used both as a sidebar route and as a tab inside the dispute hub) now loads real data from `GET /api/white-label/branding` and saves via `PATCH /api/white-label/branding`. Settings: brand name, logo URL, primary color (hex + color picker), accent color, custom domain. Live preview panel shows a mini sidebar mockup that updates as you type. Admin shell sidebar brand name is dynamically pulled from white-label branding (falls back to "ScoreShift" if no account). New endpoints: `PATCH /api/white-label/branding` (create-or-update), `GET /api/white-label/branding`.
- **Array.com Credit Monitoring Integration**: Full Array web component integration at `/credit-monitoring`. Backend issues short-lived tokens via `GET /api/array/token` (calls Array `/v2/user/token`). Enrollment stored in `arrayEnrollments` DB table; `POST /api/array/enroll` records enrollment. Admin endpoint `GET /api/admin/array/enrollments` lists all enrolled clients. Frontend: `client/src/hooks/use-array-script.ts` dynamically loads `https://embed.array.io/cms/array-web-component.js?appKey=<key>` once per session. `ArrayComponent` helper in `credit-monitoring.tsx` imperatively appends custom elements to a ref div. Enrollment badge shown in admin client detail card. Navigation includes "Credit Monitoring" link. Secrets: `ARRAY_API_KEY`, `ARRAY_API_SECRET`, `ARRAY_APP_KEY`.
- **Subscription Tier Feature Gating**: Three-tier system (`starter | pro | elite | none`) wired to Stripe webhooks and Array enrollment. `server/tier-features.ts` is the canonical feature map — maps each tier to in-app feature flags (dashboard, credit_alerts, identity_protect, etc.) and Array product codes. `server/array-service.ts` is a reusable server-side helper for enrolling users in Array products without an HTTP round-trip. Stripe webhook (`invoice.payment_succeeded`) resolves tier from price ID via `tierFromPriceId()`, updates `users.subscriptionTier`, and calls `enrollUserInArrayProducts()`. `customer.subscription.deleted` resets tier to `none`. Admin tier override: `PATCH /api/admin/users/:id/tier` allows admins to manually set a client's tier (triggers Array enrollment). Frontend: `client/src/hooks/use-feature-access.ts` provides `useFeatureAccess(feature)` hook returning `{ tier, hasFeature, canAccess, upgradeTarget, upgradeLabel, disputeLimit }`. Credit Monitoring page uses `TierUpgradeCard` component that links to `/pricing` with the correct tier label. Pricing page updated to show Starter ($29), Pro ($79), Elite ($149) with accurate feature lists. DB: `subscriptionTier` text column added to `users` table. Env vars: `STRIPE_STARTER_PRICE_ID`, `STRIPE_PRO_PRICE_ID`, `STRIPE_ELITE_PRICE_ID` map price IDs to tiers.
- **Business Credit Portal**: System for business credit building, funding options, trade lines, eligibility scoring.
- **Secure Chat System**: Admin-client communication with encrypted document uploads.
- **Comprehensive Analytics Dashboard**: Real business metrics, AI usage tracking, KPI monitoring.
- **Admin Portal Theme System**: Dark/light mode via ThemeProvider. `--admin-*` CSS vars in `:root` (dark) and `.light` (override). Portal dialogs (SelectContent, DialogContent) inherit theme via Radix data attributes.
- **Admin Settings**: Integrated with ThemeProvider for consistent theme toggle. Uses `auth_token` key for localStorage authentication.

## External Dependencies

- **Neon Database**: Serverless PostgreSQL hosting.
- **OpenAI API**: For AI-powered features like dispute letter generation and credit analysis.
- **USPS Tracking API**: For certified mail tracking (planned integration).
- **Plaid**: For banking integration (account verification, transaction history, balance monitoring, ACH transfers).
- **Experian API**: Direct integration for credit reports and real-time monitoring.
- **CRS Credit API**: Option for multi-bureau (Experian, Equifax, TransUnion) credit report access.
- **iSoftpull**: For soft credit pulls and prequalification.
- **Replit**: Development environment and deployment platform.
- **Vite**: Build tool and development server.
- **TypeScript**: For type safety across the application.