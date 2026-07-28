# GAN Design Spec: Workspace Overview & Dashboard Elevation

## Target Component & Scope
- **Target File:** `frontend-app/src/components/WorkspaceOverview.jsx` and related dashboard widgets.
- **Brand Identity:** **alurku.** (lowercase with period, Plus Jakarta Sans, Deep Navy `#111E38`, Flat Yellow `#FACC15`, Calm Gray `#F3F4F6` background, Off-White `#FAFAFA` surface cards).

## Design Objectives
1. **Bento Grid Layout:**
   - Transform Workspace Overview metrics (Total Active Projects, Workload Distribution, Member Participation, Supervised Projects) into a clean, gapless, high-contrast Bento Grid layout.
2. **Visual Hierarchy & Typography:**
   - Bold, crisp headings with Plus Jakarta Sans. High contrast text (Deep Navy `#111E38` in Light Mode) for zero eye strain.
3. **Card Polish & Micro-Interactions:**
   - Elevated project cards with subtle hover scale, crisp borders (`border-neutral-200/80`), smooth status badges, project owner `@username` tags with avatars, and team member avatar stacks (`+N`).
4. **Role & Governance Indicators:**
   - Supervisor Read-Only badge indicator for public projects watched by Workspace Admins/Owners.
5. **Workload & Progress Analytics:**
   - Visual progress bars, workload balance gauges, and clean task completion indicators without heavy blurry shadows or skeuomorphism.
