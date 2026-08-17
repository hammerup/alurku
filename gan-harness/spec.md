# Alurku. — Production Readiness & Feature Completeness Specification

## 1. Objective
Achieve full production-ready status for **alurku.** by auditing, debugging, and fully implementing all core and secondary features across the frontend (React + Tailwind) and backend (FastAPI + SQLite/PostgreSQL), ensuring zero dead buttons, robust state management, 100% bidirectional URL routing, and seamless UX across all views.

## 2. Core Functional Pillars to Verify & Implement

### A. Sidebar Navigation & Global Routing
- **Permalinks & State Sync:**
  - `/my-tasks` (Tugas Saya with filters: `all`, `today`, `this-week`, `overdue`, `completed`)
  - `/inbox` (Kotak Masuk: unread, read, system notifications)
  - `/assigned-comments` (Komentar Ditugaskan: pending, resolved)
  - `/leaves` & `/meetings` (Izin & Rapat: calendar, submission form, deletion)
  - `/personal-dashboard` (Dashboard Pribadi: workload analytics, quick stats)
  - `/workspace/:wsSlug/:wsId/overview` (Ringkasan Workspace)
  - `/workspace/:wsSlug/:wsId/chat` (Chat Workspace)
  - `/project/:bSlug/:bId` (Kanban, List, Calendar, Timeline, Analytics)
  - `/settings` (Pengaturan Akun, Tampilan, Notifikasi, Format Tanggal)
  - `/masuk`, `/daftar`, `/lupa-sandi` (Auth permalinks & sync)
- **Zero Dead Links:** Every button in the sidebar (Smart Views, Private Tasks, Workspaces, Settings) must route properly without no-ops or page desync.

### B. MyTasksPage (Tugas Saya)
- Full task status toggling with smooth completion animations.
- Inline subtask dropdown popover with instant toggle & live counter synchronization.
- Filter switching (`all`, `today`, `this-week`, `overdue`, `completed`) with correct count badges.
- Project grouping with collapsible state and direct project navigation.
- Search and sorting (by Deadline, Impact/Priority, Status).
- Human-friendly deadlines complying with user `dateFormat` setting.

### C. Inbox & Notifications (Kotak Masuk)
- Realtime notification polling / websocket sync.
- Mark all as read, individual mark read/unread, delete notification.
- Direct jump to related task / comment / board when clicking a notification item.
- Empty states with encouraging microcopy ("Belum ada notifikasi baru!").

### D. Assigned Comments (Komentar Ditugaskan)
- Render all comments where user is @mentioned or assigned.
- Resolve / unresolve action with backend API persistence.
- Direct reply inline or jump to task modal with comment highlight.

### E. Meetings & Leaves (Izin & Rapat)
- Submit personal leave requests (start date, end date, reason) affecting workload calculations.
- Display leave dates on the calendar and timeline view.
- Delete or cancel leave requests.
- Add and sync meetings / calendar events.

### F. Kanban Board, Table List, Calendar & Timeline
- Drag-and-drop task movement between columns in Kanban.
- Table list inline editing, sorting, column toggling.
- Calendar view month/week navigation with accurate date format.
- Timeline Gantt chart with task dependencies and milestone rendering.

### G. Smart Assistant & Proactive AI
- Interactive AI prompt bar with contextual board and task awareness.
- Task generation draft preview and 1-click batch creation.
- Voice/text toggle and friendly Indonesian persona ("Aku" & "Kamu").

### H. Auth Flow & Multi-tenant Workspace Isolation
- Login, registration, token persistence, logout cleanup.
- Workspace creation, member invitation, role management (Admin vs Member).
- Private board isolation preventing data leaks between workspaces.
