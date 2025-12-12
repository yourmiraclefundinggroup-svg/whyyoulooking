# ScoreShift Design Guidelines

## Design Approach
**System-Based Approach:** Drawing from Stripe's minimal fintech aesthetic combined with Linear's data clarity. This creates a professional, trustworthy foundation perfect for financial services while maintaining modern appeal.

**Core Principles:**
- Clarity over decoration
- Trust through consistency
- Data legibility as priority
- Progressive disclosure for complexity

## Typography System

**Font Family:** Inter (Google Fonts) - exceptional readability for financial data
- Headings: Inter 600-700 (Semibold-Bold)
- Body: Inter 400 (Regular)
- Data/Numbers: Inter 500 (Medium) for emphasis

**Hierarchy:**
- H1: text-4xl/5xl font-bold
- H2: text-3xl font-semibold  
- H3: text-xl font-semibold
- Body: text-base
- Small/Captions: text-sm
- Data Points: text-lg/xl font-medium (credit scores, metrics)

## Layout System

**Spacing Primitives:** Use 2, 4, 6, 8, 12, 16 units
- Component padding: p-4 to p-6
- Section spacing: py-12 to py-16
- Card spacing: p-6 to p-8
- Tight groupings: gap-2
- Standard groupings: gap-4
- Section gaps: gap-8

**Grid Strategy:**
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Data tables: Full-width with horizontal scroll on mobile
- Forms: Single column mobile, 2-column desktop (md:grid-cols-2)

## Component Library

### Navigation
**Top Navigation Bar:**
- Fixed header with logo, main nav links, user profile dropdown
- Height: h-16
- Shadow: subtle bottom shadow for depth
- Mobile: Hamburger menu collapsing to slide-out drawer

**Admin Sidebar:**
- Fixed left sidebar (w-64) with collapsible option
- Organized sections: Dashboard, Clients, Reports, Settings
- Active state: subtle background fill with border accent
- Icons: Heroicons (outline for inactive, solid for active)

### Cards & Containers
**Dashboard Cards:**
- Rounded corners: rounded-lg
- Border: subtle 1px border
- Padding: p-6
- Hover: subtle elevation increase
- Include header, metric value (large), supporting text (small)

**Client Portal Cards:**
- Credit score display: Large circular progress indicator
- Dispute status: Timeline component with checkpoints
- Action items: List with checkbox interactions

### Forms & Inputs
**Input Fields:**
- Height: h-10 to h-12 for comfort
- Padding: px-4
- Rounded: rounded-md
- Labels: text-sm font-medium, mb-2
- Helper text: text-sm muted below input

**Buttons:**
- Primary: px-4 py-2, rounded-md, font-medium
- Secondary: outlined variant
- Destructive: for dangerous actions
- On hero images: backdrop-blur-md with semi-transparent background

### Data Visualization
**Credit Score Display:**
- Large circular gauge (200-250px) showing score range
- Segmented by credit tiers (Poor-Excellent)
- Animated fill on load

**Progress Tracking:**
- Horizontal step indicator for dispute process
- Timeline view for client history
- Small trend charts (sparklines) for score changes

**Tables:**
- Striped rows for readability
- Sortable headers with icons
- Sticky header on scroll
- Row hover state
- Action column (right-aligned)

### Interactive Elements
**Status Badges:**
- Pill-shaped: px-3 py-1, rounded-full, text-xs font-medium
- States: In Progress, Under Review, Resolved, Pending
- Icons paired with text

**Tooltips:**
- Small arrow pointer
- Max-width for wrapping
- On hover for info icons throughout

## Page Structures

### Landing Page (5 Sections)
1. **Hero Section:** Full-width (min-h-screen) with professional business/handshake background image showing financial success. Overlay gradient for text legibility. Centered headline, subheading, dual CTAs (Get Started + Learn More). Trust indicators below: "Trusted by 10,000+ clients" with small logo strip.

2. **Benefits Grid:** 3-column layout showcasing key value props (Personalized Plans, Expert Guidance, Track Progress). Icon + headline + description per card.

3. **How It Works:** Numbered step cards (1-4) in horizontal flow, showing process from consultation to credit improvement.

4. **Social Proof:** 2-column testimonials with client photos, quote, name/role, star ratings.

5. **CTA Section:** Centered CTA with supporting text, small FAQ accordion below, trust badges (security certifications).

### Admin Portal
- Dashboard: 6-card metric overview, recent activity table, quick actions
- Client List: Filterable/searchable table with status indicators
- Client Detail: Tabbed interface (Profile, Disputes, Documents, Communication)

### Client Portal  
- Dashboard: Personal credit score prominently displayed, current disputes timeline, action items checklist
- My Progress: Visual timeline, score history chart, milestone achievements
- Documents: Upload interface, document list with previews

## Images

**Hero Image:** Professional financial consultation scene - diverse professionals reviewing documents/tablets in modern office. Warm, trustworthy lighting. Image should span full viewport width with 60% opacity overlay for text contrast.

**Testimonial Section:** Authentic client headshots (circular crops, 80-100px diameter)

**How It Works Icons:** Use Heroicons - DocumentCheck, UserGroup, ChartBar, CheckBadge for each step

## Animations
Minimal and purposeful:
- Card hover: translate-y-1 transition
- Score gauge: Animated fill on mount (1.5s duration)
- Page transitions: Fade in content (300ms)
- Button interactions: Scale on press (scale-95)

## Mobile Responsiveness
- Collapsible sidebar to hamburger menu
- Stack dashboard cards vertically
- Tables convert to card view on mobile
- Touch-friendly targets (min 44px height)
- Bottom navigation for client portal on mobile

This creates a premium, trustworthy financial platform that balances professional credibility with modern UX expectations.