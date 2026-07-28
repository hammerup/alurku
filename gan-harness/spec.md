# GAN Design Spec: Home Dashboard Elevation

## Target Component & Scope
- **Target File:** `frontend-app/src/components/HomeDashboard.jsx`
- **Brand Identity:** **alurku.** (lowercase with trailing period, Plus Jakarta Sans typography, Deep Navy `#111E38`, Flat Yellow `#FACC15`, Calm Gray `#F3F4F6` background, Off-White `#FAFAFA` surface cards).

## Key UI/UX Objectives
1. **Hero Welcome & Quick Action Header:**
   - Personal greeting (`Selamat Pagi/Siang/Malam, @username`) with date indicator and "Proyek Baru" CTA button.
2. **AI Workload Briefing Center:**
   - Bento card with `tips_and_updates` icon, ambient glow background, executive workload summary with bold Markdown highlighting, and quick filter triggers.
3. **Bento Quick Stats Grid:**
   - Total Tasks, Active Projects, Overdue Tasks (with red warning accent), and Critical Projects.
   - Micro-interactions: Subtle scale on hover, crisp border highlights, clear status badges.
4. **Performance & Capacity Analytics:**
   - Circular capacity gauge showing completed vs total workload hours (ETC).
   - Project Distribution progress bars with percentage breakdown.
5. **My Top Queue & Priority Task Cards:**
   - Priority-ranked task cards with impact pills (High/Medium/Low), deadline countdown badges, and single-click task modal trigger.
