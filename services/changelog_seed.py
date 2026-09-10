# Changelog seed dataset
CHANGELOGS_SEED = [
    {
        "version": "v2.5.0",
        "release_date": "2026-09-10",
        "type": "major",
        "title_id": "Analitik Beban Kerja, Pencegahan Burnout & Failover Dual-Engine AI",
        "title_en": "Workload Analytics, Burnout Prevention & Dual-Engine AI Failover",
        "changes_id": [
            "Penyeimbangan Kapasitas & Pencegahan Burnout: Mengintegrasikan jadwal cuti anggota ke dalam perhitungan kapasitas kerja tim (mengurangi 8 jam per hari cuti aktif), visualisasi utilisasi real-time, dan indeks risiko burnout tim (Kritis, Waspada, Optimal).",
            "Peringatan Tabrakan Cuti: Sistem otomatis mendeteksi dan memberi peringatan pada tugas aktif yang tanggal tenggatnya jatuh pada hari cuti anggota.",
            "Rekomendasi Rebalancing Beban Otomatis: Asisten menganalisis anggota tim yang kelebihan beban (overload) dan menyarankan pengalihan tugas ke rekan tim yang memiliki kapasitas longgar.",
            "Modal Pemeriksa Tugas Anggota: Memeriksa rincian tugas per anggota dengan filter status beban cepat dan tombol langsung untuk mendelegasikan tugas.",
            "Arsitektur AI Dual-Engine Failover: Menerapkan pengalihan cerdas otomatis antara Groq dan Gemini dengan penyembunyian error vendor dari pengguna serta fallback lokal yang ramah.",
            "Dialog Konfirmasi Kustom: Menghapus dialog alert/confirm browser standar pada formulir pembuatan tugas dan menggantinya dengan modal konfirmasi interaktif internal.",
            "Kepatuhan Brand System & Pembersihan Chat: Menghapus tag HTML mentah dari riwayat percakapan AI dan menstandardisasi seluruh ikon menjadi SVG inline modern tanpa emoji mentah."
        ],
        "changes_en": [
            "Visual Capacity Balancing & Burnout Prevention: Integrated leave schedules into team workload calculations (deducting 8h per active leave day), real-time utilization visualization, and a 3-tier team burnout risk index (Severe, Moderate, Optimal).",
            "Leave Collision Alerts: The system automatically detects and flags active tasks whose deadlines collide with an assignee's scheduled time off.",
            "Smart Workload Rebalancing Advice: The assistant analyzes overloaded team members and provides instant delegation suggestions to colleagues with surplus capacity.",
            "Interactive Member Task Inspector: Drill down into individual workloads with quick status filter pills and direct task management shortcuts.",
            "Dual-Engine AI Failover Architecture: Implemented seamless automatic fallback between Groq and Gemini with complete vendor error masking and friendly localized guidance.",
            "In-Modal Custom Alert Dialogs: Replaced primitive browser alert/confirm prompts in task modals with high-contrast, brand-compliant internal dialogs.",
            "Brand System & Chat History Cleanup: Eliminated naked HTML leakage in AI chat transcripts and standardized 100% inline SVG iconography with zero raw emojis."
        ],
        "order_index": 22
    },
    {
        "version": "v2.4.0",
        "release_date": "2026-09-03",
        "type": "feature",
        "title_id": "Preset Lini Masa Interaktif, Hari Libur Kalender & Audit Workflow",
        "title_en": "Interactive Timeline Presets, Calendar Holidays & Workflow Audit",
        "changes_id": [
            "Preset Rentang Tanggal Gantt Lini Masa: Menambahkan preset 1 Bulan, 3 Bulan, 6 Bulan, dan Pas Semua (Fit All) dengan tombol gulir otomatis ke Hari Ini.",
            "Pemilih Tanggal Kustom Lini Masa: Pemilih tanggal fleksibel dengan batas 3 bulan untuk menjaga performa rendering visual.",
            "Sinkronisasi Hari Libur Nasional Google Calendar: Integrasi langsung API kalender untuk menampilkan libur nasional resmi Indonesia pada Kalender Proyek dan Manajemen Cuti.",
            "Pemisahan Kalender Tugas & Manajemen Cuti: Memisahkan tampilan kalender tugas proyek dari kalender cuti bersama dan mengalihkan navigasi cuti ke rute khusus /leaves.",
            "Audit Alur Kerja Inti: Pengujian otomatis komprehensif untuk Kanban drag-and-drop, penjadwalan Gantt, dan kalkulasi analitik kapasitas."
        ],
        "changes_en": [
            "Timeline Gantt Range Presets: Added 1 Month, 3 Months, 6 Months, and Fit All presets alongside an auto-scroll to Today button.",
            "Custom Timeline Range Picker: Intuitive date picker guarded by a 3-month boundary to ensure ultra-smooth rendering performance.",
            "Google Calendar Holiday Sync: Direct integration displaying official Indonesian public holidays across CalendarView and Leave Management.",
            "Decoupled Task Calendar & Leave Tracking: Separated project task schedules from company-wide leaves, routing leaves to a dedicated /leaves page.",
            "Core Workflow Verification: Comprehensive automated test suites verifying Kanban drag-and-drop, Gantt scheduling, and capacity calculations."
        ],
        "order_index": 21
    },
    {
        "version": "v2.3.0",
        "release_date": "2026-08-28",
        "type": "major",
        "title_id": "Kebijakan Tata Kelola Organisasi & Modularisasi Panel Admin",
        "title_en": "Organization Governance Policies & Modular Admin Panel",
        "changes_id": [
            "Kebijakan Organisasi Perusahaan: Konfigurasi kebijakan terpusat untuk pendaftaran publik, pembatasan domain email perusahaan, durasi sesi, dan hak akses asisten AI.",
            "Modularisasi Panel Admin: Merombak AdminPage menjadi komponen modular terpisah (Pengguna, Proyek, Kebijakan, Konfigurasi Sistem, Pemeliharaan, dan Kartu Statistik).",
            "Telemetri Sistem & Pemulihan Orphan: Diagnostik server real-time, jam ganda UTC/Lokal, pemulihan proyek yatim, dan pembatalan penghapusan akun pengguna (soft-delete).",
            "Resolusi Host & CORS Dinamis: Pengenalan domain cerdas yang fleksibel tanpa ketergantungan konfigurasi host kaku pada server produksi."
        ],
        "changes_en": [
            "Enterprise Organization Policies: Centralized governance rules for public signup controls, corporate email domain whitelisting, session timeouts, and AI assistant permissions.",
            "Modular Admin Architecture: Refactored the monolithic AdminPage into isolated micro-tabs (Users, Projects, Policies, System Config, Maintenance, and Stats Cards).",
            "Live System Telemetry & Orphan Rescue: Real-time server health diagnostics, dual UTC/Local clocks, orphaned board reassignment, and user soft-delete restoration.",
            "Dynamic Host & Resilient CORS: Domain-agnostic URL resolution and robust security policies adapting smoothly to custom domains and staging environments."
        ],
        "order_index": 20
    },
    {
        "version": "v2.2.0",
        "release_date": "2026-08-18",
        "type": "feature",
        "title_id": "Undangan Workspace Multi-Tenancy & Stabilitas Papan Kanban",
        "title_en": "Workspace Multi-Tenancy Invites & Kanban Stability",
        "changes_id": [
            "Arsitektur Multi-Workspace Mandiri: Dukungan isolasi proyek antar perusahaan dengan slug URL dinamis (/workspace/{nama}/{id}) dan pergantian workspace instan.",
            "Alur Undangan Email & Token Aman: Mengundang anggota tim via tautan berbatas waktu dengan pengiriman email SMTP dan onboarding otomatis.",
            "Preservasi Scroll Kanban: Mencegah lompatan posisi scroll kolom saat melakukan drag-and-drop tugas antar status.",
            "Sematkan Proyek Favorit: Fitur bintang emas untuk menandai dan mengelompokkan proyek prioritas tinggi pada bagian atas sidebar."
        ],
        "changes_en": [
            "Multi-Workspace Tenancy Architecture: Isolated project workspaces with dynamic slug URLs (/workspace/{name}/{id}) and seamless switching.",
            "Secure Email Invitations & Onboarding: Invite team members via time-limited cryptographic tokens with SMTP email dispatch and one-click join.",
            "Preserved Kanban Scroll Offsets: Eliminated vertical/horizontal jitter and scroll-jumping during task drag-and-drop actions.",
            "Pinned Projects & Quick Favorites: Gold star bookmarking system elevating key boards to a dedicated favorite section in the navigation tree."
        ],
        "order_index": 19
    },
    {
        "version": "v2.1.0",
        "release_date": "2026-08-02",
        "type": "major",
        "title_id": "Halaman Obrolan Tim Khusus, Kotak Masuk & Navigasi Dual-Dock",
        "title_en": "Dedicated Workspace Chat Page, Inbox & Dual-Dock Navigation",
        "changes_id": [
            "Halaman Obrolan Penuh (/chat): Memindahkan ruang obrolan tim dari modal popup ke halaman penuh khusus dengan laci pratinjau detail tugas interaktif.",
            "Halaman Kotak Masuk Terpusat (/inbox): Hub notifikasi khusus untuk memantau sebutan (@mention), perubahan tugas, dan pembaruan tim secara terorganisir.",
            "Navigasi Dual-Sidebar ClickUp-Grade: Bilah sisi ganda dengan rel kategori kiri, laci navigasi hierarkis, pintasan keyboard, dan tombol +Buat universal.",
            "WebSocket Real-Time Presence: Indikator status anggota daring secara langsung, penyiaran pesan instan, dan sinkronisasi komentar latar belakang."
        ],
        "changes_en": [
            "Dedicated Workspace Chat Route (/chat): Transformed team discussions from a modal popup into a standalone full-page view featuring an inline task drawer.",
            "Centralized Inbox Page (/inbox): Dedicated notification hub tracking direct mentions, task assignments, and activity feeds with mark-as-read controls.",
            "ClickUp-Grade Dual Navigation: Double sidebar architecture with a left category dock rail, collapsible drawer, keyboard shortcuts, and global +Create action.",
            "Live WebSocket Presence: Real-time online user indicators, instant message broadcasting, and silent background comment synchronization."
        ],
        "order_index": 18
    },
    {
        "version": "v2.0.0",
        "release_date": "2026-07-25",
        "type": "major",
        "title_id": "Riwayat Chat Luruka AI, Landing Page Publik & Workspace Multi-Tenancy",
        "title_en": "Luruka AI Chat History, Public Landing & Multi-Tenancy Workspaces",
        "changes_id": [
            "Riwayat Chat Luruka AI: Sistem riwayat obrolan AI berbasis database (AIChatSession), lengkap dengan sidebar responsif, penyimpanan otomatis, pencarian judul, dan sematkan sesi.",
            "Landing Page Publik Komersial & Mesin SEO: Pengalaman landing page publik premium dengan permalink khusus (/masuk, /daftar, /lupa-sandi, /fitur, /harga, /panduan, /tentang, /dokumentasi), tema Light default, skema JSON-LD, dan tag hreflang regional.",
            "Workspace Multi-Tenancy: Arsitektur ruang kerja terisolasi untuk banyak tim, memungkinkan pergantian workspace instan dan hak akses peran fleksibel.",
            "Pencarian Global Tingkat Lanjut: Peningkatan pencarian dengan alih cakupan (Workspace Saat Ini vs Semua Workspace), pintasan keyboard, dan filter proyek/tugas.",
            "Pengaman AI Bebas Halusinasi: Menyuntikkan konteks database berhak akses (jumlah tugas terlambat nyata, daftar proyek, direktori tim) serta persona ramah 'Aku/Kamu'.",
            "Alur SaaS Dashboard-First: Membawa pengguna pasca-login langsung ke Dasbor Beranda (/dashboard) dengan Banner Ringkasan AI & Daftar Tugas."
        ],
        "changes_en": [
            "Persistent Luruka AI Chat History: Full database persistence for AI chat sessions (AIChatSession), complete with a responsive sidebar, auto-saving, instant search, and pinning.",
            "Commercial Public Landing & SEO Engine: Premium public landing experience with dedicated permalinks (/masuk, /daftar, /lupa-sandi, /fitur, /harga, /panduan, /tentang, /dokumentasi), default Light Theme, JSON-LD schemas, and regional hreflang tags.",
            "Workspace Multi-Tenancy & Management: Isolated multi-tenant workspace architecture enabling instant switching, invitations, and customizable role permissions.",
            "Enhanced Global Search: Upgraded global search with scope toggling (Current Workspace vs All Workspaces), keyboard shortcuts, and auto-switching upon selection.",
            "Anti-Hallucination AI Safeguards: Injected security-scoped database context (real overdue counts, project list, team directory) into AI prompts, strictly enforcing friendly 'Aku/Kamu' persona rules.",
            "Dashboard-First SaaS Flow: Refactored post-login flow to direct users straight to the Personal Dashboard (/dashboard) with an AI Briefing Banner and Task List."
        ],
        "order_index": 17
    },
    {
        "version": "v1.16.0",
        "release_date": "2026-07-20",
        "type": "major",
        "title_id": "Pelindung Percakapan AI & Penyempurnaan Tampilan Cerdas",
        "title_en": "Conversational AI Guards & Smart View Refinements",
        "changes_id": [
            "Batasan Percakapan AI: Memperkuat Asisten Pintar agar tetap fokus pada fitur manajemen tugas dan menolak dengan sopan perintah di luar konteks.",
            "Optimasi UI Kotak Masuk: Merapikan kartu notifikasi kotak masuk dengan menghapus tag markdown/HTML berlebih dan memadatkan tata letak.",
            "Footer Seluler Responsif: Merombak bagian footer aplikasi agar menyesuaikan secara dinamis pada layar seluler dengan tata letak adaptif.",
            "Sinkronisasi Hitung Mundur & Keterlambatan: Menyatukan logika hitung mundur tenggat waktu dan memperbaiki perbandingan tengah malam untuk mencegah false-positive.",
            "Keamanan Nudge Otomatis: Mengonfigurasi logika nudge saat startup server agar hanya berjalan setelah pukul 08:00 pagi.",
            "Desain Tampilan Daftar Modern: Memperkenalkan tata letak tampilan daftar berbasis kartu yang bersih, fleksibel, dan modern."
        ],
        "changes_en": [
            "Conversational AI Guardrails: Strengthened the Smart Assistant to stay strictly focused on task tracker features, politely rejecting off-topic prompts.",
            "Optimized Inbox UI: Streamlined inbox notification cards inside the Chat Workspace by stripping rich-text tags and packing elements into a clean layout.",
            "Responsive Mobile Footer: Overhauled the application footer to dynamically adjust on mobile screens using a multi-row adaptive layout.",
            "Countdown & Overdue Sync: Unified overdue and deadline countdown logic across views, correcting midnight comparisons to prevent false alarms.",
            "Auto-Nudge Safeguards: Configured startup nudge logic to prevent premature midnight alerts, implementing failsafe checks executing after 8:00 AM.",
            "Modern List View Design: Introduced a brand-new card-based stream layout departing from rigid tables."
        ],
        "order_index": 16
    },
    {
        "version": "v1.15.0",
        "release_date": "2026-07-15",
        "type": "feature",
        "title_id": "Desain Ulang Dasbor & Refaktor Database (Alembic)",
        "title_en": "Dashboard Redesign & Backend Refactor (Alembic)",
        "changes_id": [
            "Desain Ulang Frontend: Mengganti grid monolitik dengan tata letak split-pane yang menampilkan Bilah Sisi yang dapat diciutkan dan Dasbor Beranda terfokus.",
            "Migrasi Database Alembic: Mengonfigurasi dan menginisialisasi Alembic untuk migrasi skema database yang kuat tanpa eksekusi SQL mentah.",
            "Integritas Data DateTime: Mengonversi kolom tanggal/waktu menjadi tipe DateTime untuk dukungan TIMESTAMP PostgreSQL yang tangguh.",
            "Keamanan & Pembersihan Kode: Menyatukan model Request dan memperbaiki masalah linting serta pemformatan tanggal."
        ],
        "changes_en": [
            "Frontend Redesign: Replaced the monolithic grid dashboard with a split-pane layout featuring a collapsible Sidebar and focused Home Dashboard.",
            "Alembic Database Migrations: Configured Alembic for robust schema migrations, moving away from raw dynamic SQL DDL execution.",
            "DateTime Data Integrity: Converted date/time columns from strings to proper DateTime types for robust PostgreSQL TIMESTAMP support.",
            "Security & Code Cleanup: Unified database models and resolved linting inconsistencies across frontend date formatters."
        ],
        "order_index": 15
    },
    {
        "version": "v1.14.0",
        "release_date": "2026-07-10",
        "type": "feature",
        "title_id": "Deteksi Intensi AI & Peningkatan Nudge Otomatis",
        "title_en": "AI Intent Detection & Auto-Nudge Upgrades",
        "changes_id": [
            "Deteksi Tenggat Waktu Cerdas: AI secara selektif mengekstrak tenggat waktu hanya saat disebutkan secara eksplisit dalam instruksi.",
            "Nudge Otomatis Percakapan: Meminta AI untuk 'ingatkan' otomatis menyalakan fitur Auto Nudge pada draf tugas di keranjang tugas.",
            "Sorotan Tugas Berulang: Tugas berulang yang baru dikloning tampil menonjol dengan lencana berkedip pada tampilan Kanban dan Daftar."
        ],
        "changes_en": [
            "Smart Deadline Detection: The AI selectively extracts deadlines only when explicitly mentioned, avoiding accidental due dates.",
            "Conversational Auto-Nudge: Asking the AI to 'remind' you automatically toggles Auto Nudge ON for drafted tasks in the cart.",
            "Recurring Task Highlights: Freshly cloned recurring cycles stand out with a glowing border and pulsing badge in Kanban and List views."
        ],
        "order_index": 14
    },
    {
        "version": "v1.13.0",
        "release_date": "2026-07-06",
        "type": "major",
        "title_id": "Stabilitas AI & Tugas Berulang Tingkat Lanjut",
        "title_en": "AI Stability & Robust Recurring Tasks",
        "changes_id": [
            "Optimasi Jaringan AI: Menyelesaikan kendala koneksi dan CORS saat menghasilkan tugas melalui Asisten Pintar.",
            "Pelacakan Kloning Akurat: Kloning siklus baru untuk tugas berulang langsung disorot tanpa memerlukan penyegaran halaman manual.",
            "Pengaman Subtugas: Memindahkan tugas ke Selesai saat subtugas belum rampung memicu konfirmasi dan melahirkan kloning jika dipaksa selesai."
        ],
        "changes_en": [
            "AI Network Optimization: Resolved CORS and connection bottlenecks during task generation via the Smart Assistant.",
            "Robust Clone Tracking: When a recurring task is completed, its new cycle is tracked by the backend and highlighted instantly.",
            "Subtask Safeguards: Moving a task to Done with open subtasks triggers confirmation and handles recurring clones reliably."
        ],
        "order_index": 13
    },
    {
        "version": "v1.12.0",
        "release_date": "2026-07-04",
        "type": "feature",
        "title_id": "Perencana AI Interaktif & Peningkatan Asisten Pintar",
        "title_en": "Interactive AI Planner & Smart Assistant Upgrades",
        "changes_id": [
            "Perencana AI dalam Laci: Mengintegrasikan perencana tugas AI ke dalam drawer samping sebagai alur kerja yang ringkas.",
            "Keranjang Draf Interaktif: Tugas hasil AI disajikan dalam keranjang interaktif yang dapat dipilih, disesuaikan proyeknya, dan diperiksa ETC-nya.",
            "Perlindungan Reset & Buang Draf: Menambahkan tombol reset universal dan perlindungan modal konfirmasi saat ada draf yang belum tersimpan.",
            "Animasi Penyusunan Bertahap: Asisten Pintar menggulir otomatis ke tugas terbaru dan mendukung pengiriman perintah cepat via tombol Enter."
        ],
        "changes_en": [
            "In-Drawer AI Task Planner: Integrated the proactive planner into the assistant drawer as a seamless mini-application.",
            "Interactive Draft Cart: AI-generated tasks are presented in a cart where users can toggle items, adjust boards, and review ETCs.",
            "Smart Reset & Discard Protection: Added a universal reset button with confirmation modals preventing accidental draft loss.",
            "Auto-Scroll & Step Animations: The assistant scrolls dynamically to new draft items and supports instant Enter key submissions."
        ],
        "order_index": 12
    },
    {
        "version": "v1.11.0",
        "release_date": "2026-07-02",
        "type": "feature",
        "title_id": "Ekspor Lini Masa ke PDF dan Gambar PNG",
        "title_en": "Timeline Export to PDF and PNG Image",
        "changes_id": [
            "Ekspor Lini Masa Resolusi Tinggi: Mengekspor seluruh tampilan diagram Gantt Lini Masa sebagai berkas PDF atau gambar PNG beresolusi tinggi.",
            "Pencocokan Tema Otomatis: Mesin ekspor menangkap tema aktif (Terang atau Gelap) dan mempertahankan kontras warna tugas secara presisi."
        ],
        "changes_en": [
            "High-Resolution Timeline Export: Export the entire Gantt timeline view as a clean, high-resolution PDF or PNG image.",
            "Theme-Aware Capture: The export renderer respects active Light and Dark mode palettes while preserving crisp text contrast."
        ],
        "order_index": 11
    },
    {
        "version": "v1.10.0",
        "release_date": "2026-06-30",
        "type": "feature",
        "title_id": "Pratinjau Tugas Publik & Sistem Antrean Hibrida",
        "title_en": "Public Task Preview & Hybrid Queue System",
        "changes_id": [
            "Pratinjau Tamu Aman: Tautan tugas publik menampilkan pratinjau buram data sensitif untuk tamu unauthenticated tanpa kebocoran data.",
            "Sistem Antrean Hibrida: Kartu tugas menampilkan posisi antrean dinamis (Antrean Proyek vs Antrean Keseluruhan).",
            "Perutean Multi-Proyek AI: AI mendukung pengalihan proyek via tag #proyek serta membedakan Assignee (@user) dan Peminta tugas.",
            "Desain Ulang Keranjang Tugas: Tampilan kartu bergaya Kanban dalam keranjang tugas dengan animasi slide-up dan indikator beban kerja."
        ],
        "changes_en": [
            "Secure Guest Preview: Shareable task links provide a blurred read-only preview for guests while protecting proprietary data.",
            "Hybrid Queue System: Task cards display real-time queue rankings switching smoothly between Project and Global views.",
            "Multi-Project Routing in AI: Natural language prompt routing via #project tags and clear separation between Assignee and Requester.",
            "Redesigned Task Cart: Kanban-style cards in the drafting cart with slide-up animations and workload indicators."
        ],
        "order_index": 10
    },
    {
        "version": "v1.9.0",
        "release_date": "2026-06-29",
        "type": "feature",
        "title_id": "Pantauan Cerdas & Tindak Lanjut Otomatis (Auto Nudge)",
        "title_en": "Smart Nudge & Automated Follow-ups",
        "changes_id": [
            "Ruang Kerja Proyek Pribadi: Opsi membuat Proyek Pribadi yang terkunci secara aman hanya untuk Anda.",
            "Pantauan Cerdas (Smart Nudge): AI membuat draf pesan tindak lanjut peka konteks untuk pekerja tugas dengan satu klik.",
            "Penjadwal Nudge Otomatis: Scheduler harian pukul 08:00 pagi yang secara otomatis mengingatkan pekerja tentang tenggat waktu kritis.",
            "Tugas Berulang Harian, Mingguan, & Bulanan: Siklus baru dibuat secara otomatis saat tugas yang sedang berjalan ditandai Selesai.",
            "Pencarian Multi-Kata Bebas Urutan: Bilah pencarian mendukung pencocokan kata kunci acak untuk tugas, proyek, dan obrolan.",
            "Tautan Dalam (Deep Linking): Menghasilkan dan membagikan tautan langsung ke tugas atau proyek tertentu."
        ],
        "changes_en": [
            "Private Project Boards: Create private projects locked exclusively to the creator with restricted invitations.",
            "Smart Nudge Assistant: Generate context-aware follow-up messages for task assignees with a single click.",
            "Auto Nudge Daily Scheduler: Stateless background scheduler running at 08:00 AM reminding assignees of approaching deadlines.",
            "Recurring Tasks Engine: Repeat tasks Daily, Weekly, or Monthly with automated next-cycle creation upon completion.",
            "Multi-Word Unordered Search: Search bars matching keywords in any order across tasks, projects, and discussions.",
            "Internal Deep Linking: Generate and share direct URL links to specific tasks or project views."
        ],
        "order_index": 9
    },
    {
        "version": "v1.8.0",
        "release_date": "2026-06-28",
        "type": "major",
        "title_id": "Analitik Beban Kerja ETC & Peningkatan Privasi Data",
        "title_en": "ETC Workload Analytics & Privacy Enhancements",
        "changes_id": [
            "Estimasi Waktu Pengerjaan (ETC): Tugas diukur dalam satuan jam untuk mencerminkan akurasi kapasitas beban kerja nyata.",
            "Dasbor Analitik Berbasis ETC: Perhitungan Skor Kesehatan Proyek, Tingkat Penyelesaian, dan Kecepatan Kerja Tim menggunakan ETC.",
            "Estimasi Otomatis AI: AI Asisten Pintar secara otomatis memprediksi kebutuhan jam pengerjaan jika tidak diisi secara manual.",
            "Privasi Pengguna Terkoneksi: Pengguna yang belum terhubung disembunyikan dari pencarian pesan pribadi dan undangan tim."
        ],
        "changes_en": [
            "Estimated Time Consumption (ETC): Measure tasks in hours rather than count for realistic workload capacity modeling.",
            "ETC-Driven Analytics: Upgraded Project Health Scores, Velocity, and Completion Rates to compute based on ETC hours.",
            "Automated ETC Estimation: The AI assistant automatically estimates task complexity hours if left unspecified.",
            "Enhanced User Privacy: Unconnected users are completely shielded from partial searches in direct messages."
        ],
        "order_index": 8
    },
    {
        "version": "v1.7.0",
        "release_date": "2026-06-28",
        "type": "feature",
        "title_id": "Asisten AI Proaktif & Peningkatan Interaksi Pengguna",
        "title_en": "Proactive AI & User Interaction Enhancements",
        "changes_id": [
            "Asisten AI Proaktif: Membantu pengguna baru membuat proyek daftar tugas pertama setelah tur pengenalan.",
            "Tingkat Dampak Tugas (Impact Level): Mengklasifikasikan tugas ke dalam tingkat Tinggi, Sedang, atau Rendah dengan hitung mundur tenggat.",
            "Transfer Tugas Lintas Proyek: Memindahkan tugas antar proyek via drag-and-drop di tampilan Kanban global atau formulir edit.",
            "Integrasi Tugas Baru dengan AI: Tombol Tugas Baru terhubung langsung dengan AI untuk mengekstrak tugas dan sub-tugas secara otomatis."
        ],
        "changes_en": [
            "Proactive AI Assistant: Guides new users to generate their first structured to-do list project right after onboarding.",
            "Task Impact Levels: Categorize tasks into High, Medium, or Low impact with real-time deadline countdowns.",
            "Cross-Project Task Transfers: Move tasks between boards via global Kanban drag-and-drop or edit forms.",
            "Smart Task Creation: Integrated natural language extraction directly into the New Task modal."
        ],
        "order_index": 7
    },
    {
        "version": "v1.6.0",
        "release_date": "2026-06-27",
        "type": "major",
        "title_id": "Ruang Obrolan Terpadu & Pesan Pribadi 1-on-1",
        "title_en": "Unified Workspace Chat & Direct Messaging",
        "changes_id": [
            "Pesan Pribadi (Direct Messages): Komunikasi privat 1-on-1 antar anggota tim di dalam ruang kerja.",
            "Kotak Masuk Ruang Obrolan: Melacak aktivitas percakapan terbaru dalam tata letak obrolan terpadu.",
            "Pratinjau Tugas Berdampingan: Membuka dan menyunting tugas langsung di sebelah kanan riwayat percakapan.",
            "Pencarian & Pelompat Obrolan: Mencari percakapan lama dan melompat langsung ke pesan yang dimaksud."
        ],
        "changes_en": [
            "Direct Messaging (DM): Secure 1-on-1 private messaging between workspace colleagues.",
            "Chat Activity Inbox: Keep track of active discussions in a unified workspace feed.",
            "Side-by-Side Task Preview: Inspect and edit related task cards directly alongside the chat thread.",
            "In-Chat Search & Message Jumper: Search past messages and jump instantly to relevant discussion threads."
        ],
        "order_index": 6
    },
    {
        "version": "v1.5.0",
        "release_date": "2026-06-27",
        "type": "feature",
        "title_id": "Bagan Alir ASCII Pintar & Filter Aktivitas Lanjutan",
        "title_en": "Smart ASCII Flowcharts & Advanced Activity Filters",
        "changes_id": [
            "Bagan Alir Konseptual ASCII: Agen AI mampu merancang diagram alir arsitektur dalam format diagram teks ASCII.",
            "Blok Kode Bergaya Terminal: Tampilan blok kode yang rapi dan dapat diciutkan untuk kemudahan membaca.",
            "Filter Belum Dibaca: Menyaring tugas yang memiliki komentar baru atau sebutan (@mention) belum terbaca.",
            "Ekstraksi Notula Rapat (MoM): Mengubah ringkasan rapat mentah menjadi daftar tugas terstruktur secara massal."
        ],
        "changes_en": [
            "Smart ASCII Flowcharts: The AI assistant generates conceptual workflow architectures in clean ASCII format.",
            "Terminal-Styled Code Blocks: Collapsible code sections formatted for clean readability.",
            "Unread Activity Filter: Instantly isolate tasks containing unread mentions or new comments.",
            "Meeting Minutes (MoM) Extraction: Convert meeting transcripts and notes into actionable bulk tasks."
        ],
        "order_index": 5
    },
    {
        "version": "v1.4.0",
        "release_date": "2026-06-27",
        "type": "major",
        "title_id": "Peningkatan UI, Tong Sampah Mengambang & Interaksi Mikro",
        "title_en": "UI Enhancements, Floating Trash & Micro-Interactions",
        "changes_id": [
            "Tata Letak Detail Tugas 3-Kolom: Menyusun data tugas, subtugas, dan riwayat aktivitas secara padat dan efisien.",
            "Tong Sampah Mengambang Interaktif: Menghapus tugas dengan menyeret dan menjatuhkan kartu langsung ke tempat sampah mengambang.",
            "Aksi Google Meet & Kalender Cepat: Tombol pintas untuk menjadwalkan rapat dan kalender dari detail tugas.",
            "Pencegahan Penyelesaian Prematur: Melarang pemindahan tugas ke status Selesai jika masih ada subtugas yang belum tuntas."
        ],
        "changes_en": [
            "Compact 3-Column Task Layout: Efficient structure organizing metadata, checklists, and activity feeds.",
            "Interactive Floating Trash Bin: Delete tasks intuitively by dragging and dropping them into the floating bin.",
            "Google Meet & Calendar Integrations: Quick popup triggers to schedule team syncs directly from task cards.",
            "Checklist Completion Safeguards: Prevents moving a task to Done while checklist items remain incomplete."
        ],
        "order_index": 4
    },
    {
        "version": "v1.3.0",
        "release_date": "2026-06-27",
        "type": "major",
        "title_id": "Keamanan Enterprise Zero-Trust & Sistem Tiket Bantuan",
        "title_en": "Enterprise Zero-Trust Security & Support Tickets",
        "changes_id": [
            "Arsitektur Keamanan Zero-Trust: Perlindungan terhadap kerentanan OWASP Top 10 (XSS, CSWSH, DoS, IDOR, BOLA).",
            "Sistem Tiket Internal: Mengajukan ide fitur atau permintaan bantuan IT langsung ke antrean Super Admin.",
            "Panel Tiket Saya: Memantau status penanganan dan tanggapan admin atas masukan yang diajukan."
        ],
        "changes_en": [
            "Zero-Trust Security Architecture: Hardened protection against OWASP Top 10 vulnerabilities (XSS, CSWSH, DoS, IDOR, BOLA).",
            "Internal Support Ticketing: Submit technical issues or feature ideas directly to the Super Admin queue.",
            "My Tickets Tracker: Monitor resolution progress and administrative responses for submitted requests."
        ],
        "order_index": 3
    },
    {
        "version": "v1.2.0",
        "release_date": "2026-06-27",
        "type": "feature",
        "title_id": "Manajemen Cuti Tim & Pencarian Global",
        "title_en": "Team Leave Management & Global Search",
        "changes_id": [
            "Manajemen Cuti & Hari Libur: Mendaftarkan cuti pribadi atau cuti bersama untuk menyesuaikan jadwal pengerjaan proyek.",
            "Panel Kontrol Super Admin: Mengelola pengguna, membekukan akun yang melanggar, dan menyelamatkan proyek yatim.",
            "Pencarian Global: Mencari dan melompat langsung ke tugas, proyek, atau rekan tim di seluruh workspace.",
            "Kartu Lampiran Tautan Cerdas: URL Google Drive, Figma, dan OneDrive otomatis berubah menjadi kartu pratinjau visual."
        ],
        "changes_en": [
            "Team Leaves & Vacation Management: Register personal time off or mass holidays to auto-adjust timeline projections.",
            "Super Admin Control Panel: Manage accounts, freeze suspicious users, and reassign orphaned project assets.",
            "Global Quick Search: Instantly find and jump to tasks, boards, or teammates across workspaces.",
            "Smart Link Cards: URLs from Google Drive, Figma, and OneDrive automatically format into visual preview cards."
        ],
        "order_index": 2
    },
    {
        "version": "v1.1.0",
        "release_date": "2026-06-27",
        "type": "feature",
        "title_id": "Notifikasi Cerdas & Kustomisasi Tampilan Ruang Kerja",
        "title_en": "Smart Notifications & Workspace Customization",
        "changes_id": [
            "Notifikasi Cerdas: Peringatan visual dalam aplikasi, notifikasi browser native, dan pengiriman email.",
            "Kustomisasi Tema & Tekstur: Mode Gelap, tema aksen warna kustom, dan overlay tekstur latar belakang.",
            "Ekspor CSV: Mengekspor papan proyek tertentu atau laporan global semua tugas ke dalam format lembar kerja.",
            "Penyusunan Ulang Sub-tugas: Menata ulang prioritas item daftar periksa dengan seret dan lepas."
        ],
        "changes_en": [
            "Smart Notifications: Real-time in-app alerts, desktop native notifications, and email notifications.",
            "UI Themes & Texture Overlays: Dark Mode, custom accent color themes, and subtle background textures.",
            "CSV Data Export: Export individual boards or global workload reports into spreadsheet format.",
            "Sub-task Drag-and-Drop Reordering: Reorganize checklist priorities effortlessly."
        ],
        "order_index": 1
    },
    {
        "version": "v1.0.0",
        "release_date": "2026-06-27",
        "type": "release",
        "title_id": "Peluncuran Perdana Alurku MVP",
        "title_en": "Initial Alurku MVP Launch",
        "changes_id": [
            "Peluncuran Inti Alurku: Tampilan Papan Kanban interaktif, Lini Masa (Gantt Chart), dan Kalender Jadwal.",
            "Manajemen Tugas Fleksibel: Pembuatan tugas, penugasan rekan kerja, status kolom alur kerja, dan penandaan kategori."
        ],
        "changes_en": [
            "Alurku Core Release: Interactive Kanban Board, Gantt Timeline, and Calendar views.",
            "Flexible Task Management: Task creation, team assignment, workflow status columns, and category tagging."
        ],
        "order_index": 0
    }
]
