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
- **File Management**: Mobile-optimized document viewing and downloading, secure document upload (ID, SSN, bank statements, bureau responses).
- **Client Password Management**: Secure password change interface, strong password requirements, secure reset API.
- **Admin Portal**: Comprehensive client management, credit data access, user management, support monitoring, business metrics, AI usage tracking.
- **AI Assistant**: Real-time responses, conversation storage, dispute letter generation.
- **Credit Report AI Analysis**: Upload system with drag-and-drop, AI dispute letter generation, real-time credit analysis identifying issues.
- **Credit Monitoring Service Integration**: Display of connection status and active monitoring.
- **Business Credit Portal**: System for business credit building, funding options, trade lines, eligibility scoring.
- **Secure Chat System**: Admin-client communication with encrypted document uploads.
- **Comprehensive Analytics Dashboard**: Real business metrics, AI usage tracking, KPI monitoring.

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