# GAN Design Spec: Kanban Board Visual Elevation

## Target Component & Scope
- **Target File:** `frontend-app/src/KanbanBoard.jsx`
- **Brand Identity:** **alurku.** (lowercase with trailing period, Plus Jakarta Sans typography, Deep Navy `#111E38`, Flat Yellow `#FACC15`, Calm Gray `#F3F4F6` background, Off-White `#FAFAFA` column surface cards, Dark Navy `#121B2D` dark mode cards).

## Key UI/UX Objectives
1. **Column Surface & Header Elevation:**
   - Calibrated status indicator dots with subtle pulse rings (Amber for To Do, Flat Yellow for In Progress, Emerald for Done, Rose for Rejected).
   - High-contrast count badges (`bg-[#111E38] text-white` in light mode, `bg-white text-[#111E38]` in dark mode).
   - SVG icons for column renaming and deletion.

2. **Task Card Hierarchy & Aesthetics:**
   - Card container with subtle border (`border-neutral-200/80 dark:border-neutral-800/80`) and tactile hover lift (`hover:-translate-y-0.5 hover:shadow-md hover:border-amber-400/60`).
   - Project routing micro-badge with folder stroke SVG.
   - Position Queue Badge (`#1/5`) in Flat Yellow `#FACC15` accent.
   - Priority, Impact (High/Med/Low), ETC hours, and Recurring badges with desaturated backgrounds and crisp borders.

3. **Subtask Linear Micro Progress Bar:**
   - Linear progress bar (1.5px) rendering completion percentage in Flat Yellow (in-progress) or Emerald Green (100% done).

4. **Empty Column Drop Zone Placeholder:**
   - Clean dashed placeholder for empty columns (`Belum ada tugas di tahap ini`) and glowing `#FACC15` highlight on dragover (`Lepaskan tugas di sini`).

5. **Tactile Drag & Drop Micro-Physics:**
   - Rotate-2, 3D shadow-2xl, and ring-4 `#FACC15` highlights during drag interaction.
