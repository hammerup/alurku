# alurku. MVP

## Problem Statement

UMKM, agensi, freelancer, dan pekerja di Indonesia masih banyak yang hanya mengandalkan ingatan, buku catatan, atau Excel untuk mengelola tugasnya karena aplikasi seperti Monday.com, ClickUp, atau Notion dirasa terlalu mahal (berbasis USD) dan terlalu kompleks. Akibatnya, pekerjaan kolaboratif tidak terlacak dengan baik, beban kerja tidak terukur, dan lingkungan kerja menjadi rentan terhadap budaya saling menyalahkan (toxic/blame-shifting) ketika terjadi kesalahan atau *overload*.

## Evidence

- **Observasi Pasar:** Agensi dan UMKM Indonesia sering bekerja tanpa alur profesional karena keterbatasan pengetahuan tentang *tools* yang ada dan kendala biaya.
- **Observasi Perilaku:** Pekerja kantoran merasa kewalahan namun tidak ada transparansi beban kerja yang memadai antar tim, memicu konflik dan saling tunjuk kesalahan.

## Proposed Solution

Membangun **alurku.**, sebuah aplikasi produktivitas dan *to-do list* minimalis dengan kapabilitas AI (layaknya Notion versi lokal yang disederhanakan). Aplikasi ini difokuskan pada *progressive disclosure*—tampil sederhana untuk pemula, namun memiliki fitur kuat (AI task planner, integrasi eksternal, kalender lokal) bagi *power user*. Tujuannya adalah merapikan alur kerja, mendistribusikan beban kerja secara adil, dan mencegah budaya saling tunjuk kesalahan tanpa memerlukan kurva pembelajaran yang curam.

## Key Hypothesis

We believe **fitur manajemen tugas minimalis yang diperkuat AI** will **menyelesaikan masalah pelacakan kerja dan beban kerja yang tidak transparan** for **UMKM, agensi, dan pekerja kantoran di Indonesia**.
We'll know we're right when **tim dapat berkolaborasi menyelesaikan prioritas harian tanpa miskomunikasi atau drama saling menyalahkan akibat *overload* pekerjaan**.

## What We're NOT Building

- **Fitur *Employee Surveillance* / Pelacakan Mikro:** Aplikasi ini murni membantu pengguna menyelesaikan tugas. Kita tidak akan membangun fitur mata-mata (seperti pelacak layar atau laporan aktivitas invasif) yang bertujuan mencari celah/kemalasan staf.
- **Kustomisasi Workflow Skala Enterprise:** Kita tidak melayani pembuatan fitur kustom eksklusif untuk perusahaan raksasa (karena keterbatasan resource tim pengembangan), meskipun mereka tetap dipersilakan menggunakan fitur standar aplikasi.

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Task Completion Rate | > 70% | Rasio tugas yang diselesaikan dibanding tugas yang dibuat per minggu |
| Active Collaboration | > 2 user | Rata-rata anggota tim yang berinteraksi dalam satu *workspace* |
| AI Adoption | > 50% | Persentase pengguna yang menggunakan *AI Task Planner* untuk menyusun jadwal |

## Open Questions

- [ ] Integrasi pihak ketiga mana (Slack, GitHub, atau Google Workspace) yang paling krusial untuk dikerjakan pertama kali setelah MVP inti selesai?
- [ ] Bagaimana pembagian struktur *Database Schema* yang paling optimal untuk mengelola relasi antara User, Workspace, dan Kanban Columns?

---

## Users & Context

**Primary User**
- **Who**: Founder UMKM, Project Manager Agensi, Freelancer, Web Developer, dan Staf Kantoran.
- **Current behavior**: Mengandalkan ingatan, mencatat di kertas, atau terjebak dalam 100+ baris file Excel.
- **Trigger**: Ketika *project* mulai tumpang tindih, tenggat waktu terlewat, dan koordinasi tim menjadi kacau.
- **Success state**: Tahu persis prioritas tugas hari ini, tahu kapasitas diri sendiri dan rekan setim, serta dapat bekerja secara harmonis tanpa saling menyalahkan.

**Job to Be Done**
When **saya memiliki tumpukan pekerjaan kolaboratif**, I want to **memvisualisasikan beban kerja dan diatur secara otomatis oleh AI**, so I can **fokus mengeksekusi tugas tanpa drama mencari siapa yang salah**.

**Non-Users**
Perusahaan *Enterprise* raksasa di Indonesia yang membutuhkan *on-premise deployment* atau kustomisasi alur kerja yang sangat spesifik dan rumit.

---

## Solution Detail

### Core Capabilities (MoSCoW)

| Priority | Capability | Rationale |
|----------|------------|-----------|
| Must | **List To-Do** | Fitur paling mendasar untuk mencatat tugas |
| Must | **Kanban Board** | Visualisasi alur progres (To Do, In Progress, Done) |
| Must | **AI Task Planner** | Membantu mengatur prioritas dan estimasi pengerjaan otomatis |
| Must | **Kalender Lokal ID** | *Smart deadline engine* yang mengenali tanggal merah & libur nasional Indonesia |
| Should | **Role/Visibility** | Atasan bisa melihat analitik, bawahan melihat UI sederhana |
| Could | **App Integrations** | Integrasi Slack, GitHub, Google Workspace |
| Won't | **Surveillance Tools**| Melanggar visi produk yang berpusat pada kenyamanan pengguna |

### MVP Scope

Rilis versi pertama (1-2 bulan pengembangan) dibatasi pada:
1. List To-Do
2. Kanban Board (Kolaboratif)
3. AI Task Planner
4. Deteksi Kalender/Tanggal Merah Lokal

### User Flow

Daftar/Masuk -> Buat Workspace -> AI menyusun rencana awal / User membuat tugas manual -> User memindahkan kartu progres di Kanban -> Tim saling melihat ketersediaan beban kerja -> Tugas selesai.

---

## Technical Approach

**Feasibility**: MEDIUM-HIGH

**Architecture Notes**
- **Frontend**: React & TailwindCSS (Desain UI Landing Page sudah jadi dan solid).
- **Backend/Database**: PostgreSQL (Self-hosted via Docker di VPS)
- **AI Engine**: Gemini dan GPT OSS via Groq API untuk Task Planner.

**Technical Risks**

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Biaya API Google AI | Medium | Membatasi prompt, *caching* hasil AI, dan *rate-limiting* request. Target MVP maksimal 1-2 bulan agar pemanfaatan lisensi langganan efektif. |
| Konflik Sinkronisasi Kanban | Medium | Menggunakan Optimistic UI updates dan *Realtime Database* yang kuat. |

---

## Implementation Phases


| # | Phase | Description | Status | Parallel | Depends | PRP Plan |
|---|-------|-------------|--------|----------|---------|----------|
| 1 | **Foundation & Auth** | Setup DB Schema, Autentikasi User (Login/Register), dan Workspace Routing | pending | - | - | - |
| 2 | **Core Task Engine** | CRUD Task (List To-do) & *Drag-and-Drop* Kanban Board logic | pending | - | 1 | - |
| 3 | **AI & Smart Engine** | Integrasi Google AI API (Task Planner) & Modul Kalender Lokal ID | pending | with 4 | 2 | - |
| 4 | **UI/UX Polish** | Menerapkan UI *glassmorphism* & *brand-guidelines* ke dalam *Dashboard* | pending | with 3 | 2 | - |
| 5 | **Launch MVP** | E2E Testing, Bug fixing, & Final Deployment | pending | - | 3, 4 | - |

---

## Decisions Log

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| **Target Timeline** | Maks. 1-2 Bulan | Santai (3-6 Bulan) | Mengejar ROI biaya langganan Google AI Pro bulanan. |
| **Pencegahan Toxic Culture** | Tidak ada fitur *monitoring* | Menambahkan pelacak waktu (*time tracker*) | Aplikasi harus menjadi asisten, bukan mandor, agar *adoption rate* tinggi. |

---

*Generated: 2026-07-07*
*Status: DRAFT - Terverifikasi oleh Founder*
