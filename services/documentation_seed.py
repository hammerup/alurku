"""
services/documentation_seed.py
Structured seed dataset for alurku. documentation database.
Contains 14 comprehensive, Semrush-grade knowledge base chapters covering every page,
module, view, command bar shortcut, Luruka AI capability, and governance rule.
Written in professional, engaging, user-centric tone for both B2C and B2B users.
"""

DOCUMENTATIONS_SEED = [
    {
        "doc_id": "overview",
        "group_id": "get-started",
        "group_title_id": "Mulai",
        "group_title_en": "Get Started",
        "title_id": "Ikhtisar alurku. & Peta Platform",
        "title_en": "alurku. Overview & Platform Map",
        "desc_id": "Pelajari filosofi alurku., arsitektur platform anti-kewalahan, peta modul antarmuka, dan panduan memulai cepat 3 langkah.",
        "desc_en": "Discover the alurku. philosophy, anti-overwhelm platform architecture, interface module map, and 3-step quickstart guide.",
        "order_index": 1,
        "is_superadmin_only": 0,
        "see_also": ["workspace", "my-tasks", "command-bar", "views-workflow"],
        "sections": [
            {
                "id": "what-is-alurku",
                "title_id": "1. Apa itu alurku.? (What is alurku.?)",
                "title_en": "1. What is alurku.?",
                "content_id": "<strong>alurku.</strong> adalah asisten cerdas yang mengubah tumpukan rencana kerjamu menjadi alur eksekusi yang rapi. Berhenti mengingat semua tugasmu, mulailah menyelesaikannya.<br /><br />Berbeda dari aplikasi manajemen proyek konvensional yang rumit dan membuat kewalahan, alurku. dirancang agar kamu dan tim bisa fokus pada hasil nyata. Biarkan AI yang mengatur jadwal, memprediksi durasi tugas, dan menjaga beban kerja tetap seimbang agar tim tidak burnout.<br /><br />Didukung oleh <strong>Luruka</strong>—partner kerjamu yang proaktif—alurku. memastikan kamu selalu tahu apa yang harus dikerjakan hari ini, siapa yang bertanggung jawab, dan kapan target harus tercapai. Kuasai waktumu, lancarkan alurmu.",
                "content_en": "<strong>alurku.</strong> is an intelligent assistant that transforms cluttered project backlogs into smooth, structured execution. Stop remembering all your tasks—start completing them.<br /><br />Unlike conventional project tools that are overwhelming and rigid, alurku. is built so you and your team can focus on real outcomes. Let AI handle scheduling, predict project durations, and balance workloads to prevent burnout.<br /><br />Powered by <strong>Luruka</strong>—your proactive workspace partner—alurku. ensures you always know what matters today, who owns each milestone, and how to deliver on time. Master your time, smooth your flow."
            },
            {
                "id": "anti-overwhelm-philosophy",
                "title_id": "2. Filosofi Kerja 'Anti-Overwhelm'",
                "title_en": "2. The Anti-Overwhelm Philosophy",
                "content_id": "Tiga pilar utama yang menjadi pondasi setiap fitur di alurku.:<br /><br />• <strong>Satu Layar untuk Semua Progres</strong>: Empat sudut pandang visual (Kanban, Lini Masa Gantt, Tabel, dan Kalender) yang tersinkronisasi 100% secara real-time.<br />• <strong>Kerja Seimbang, Anti-Kewalahan</strong>: Sistem analitik otomatis yang membatasi beban kerja tim pada batas wajar (40 jam/minggu) untuk mencegah kejenuhan kerja (<em>burnout</em>).<br />• <strong>Asisten Perencana Otomatis</strong>: Luruka AI secara proaktif mengidentifikasi tugas yang terhambat, memberi rekomendasi redistribusi tugas, dan menyusun agenda harian tanpa perlu input manual yang melelahkan.",
                "content_en": "Three core pillars shape every experience within alurku.:<br /><br />• <strong>One Screen for All Progress</strong>: Four synchronized visual perspectives (Kanban, Gantt Timeline, Table, and Calendar) updated in real time.<br />• <strong>Balanced Work, Anti-Burnout</strong>: Automated analytics monitor weekly capacity thresholds (40 hours/week) to protect team well-being.<br />• <strong>Proactive Automated Planning</strong>: Luruka AI highlights stalled items, recommends task rebalancing, and formulates daily briefings without tedious manual data entry."
            },
            {
                "id": "platform-map",
                "title_id": "3. Peta Modul & Antarmuka Utama",
                "title_en": "3. Platform Navigation & Module Map",
                "content_id": "Antarmuka alurku. terbagi ke dalam area navigasi fungsional:<br /><br />1. <strong>Bilah Sisi Kiri (Left Sidebar)</strong>: Ruang Kerja, Beranda, Tugas Saya, Papan Global, Obrolan Tim, Pengajuan Cuti, dan daftar Papan Proyek.<br />2. <strong>Bilah Atas (Header Bar)</strong>: Pemilih Ruang Kerja, Tombol <code>/</code> Pencarian Global, Lencana <code>⌘K</code> Command Bar, Jam Digital Live, dan Menu Profil.<br />3. <strong>Ruang Kerja Utama (Main Workspace)</strong>: Tampilan dinamis sesuai modul aktif (Papan Kanban, Gantt, Analitik, atau Kalender).<br />4. <strong>Laci Samping (Drawers)</strong>: Kotak Masuk Notifikasi (Inbox) dan Ruang Konsultasi Luruka AI di kanan layar.",
                "content_en": "The alurku. workspace is organized into clear functional regions:<br /><br />1. <strong>Left Sidebar</strong>: Workspace Switcher, Home Dashboard, My Tasks, Global Board, Workspace Chat, Leaves, and Project Boards.<br />2. <strong>Header Bar</strong>: Workspace selector, <code>/</code> Global Search, <code>⌘K</code> Command Bar, Live Clock, and Account Menu.<br />3. <strong>Main Canvas</strong>: Dynamic operational view (Kanban, Gantt, Analytics, or Calendar).<br />4. <strong>Side Drawers</strong>: Notification Inbox and Luruka AI Assistant docked smoothly on the right."
            },
            {
                "id": "first-steps",
                "title_id": "4. Panduan Memulai Cepat (Quickstart 3 Langkah)",
                "title_en": "4. Getting Started in 3 Steps",
                "content_id": "1. <strong>Langkah 1 (Pilih / Buat Workspace)</strong>: Gunakan pemilih di bilah atas untuk membuat ruang kerja bagi tim atau departemenmu.<br />2. <strong>Langkah 2 (Buat Papan Proyek Pertama)</strong>: Klik tombol <strong>'+ Proyek Baru'</strong> pada bilah sisi kiri untuk inisiatif atau kampanye baru.<br />3. <strong>Langkah 3 (Buat Tugas Instan dengan Cmd/Ctrl + K)</strong>: Tekan <code>Cmd/Ctrl + K</code> dan ketik tugas pertamamu (misal: <code>Riset kompetitor @ahmad due:besok p:high #marketing</code>).",
                "content_en": "1. <strong>Step 1 (Select or Create Workspace)</strong>: Use the top switcher to establish a dedicated hub for your team.<br />2. <strong>Step 2 (Create First Project)</strong>: Click <strong>'+ New Project'</strong> in the left sidebar to host your campaign deliverables.<br />3. <strong>Step 3 (Instant Task via Cmd/Ctrl + K)</strong>: Hit <code>Cmd/Ctrl + K</code> and create your first task using natural language (e.g. <code>Competitor benchmark @ahmad due:tomorrow p:high #marketing</code>)."
            }
        ]
    },
    {
        "doc_id": "workspace",
        "group_id": "get-started",
        "group_title_id": "Mulai",
        "group_title_en": "Get Started",
        "title_id": "Ruang Kerja & Hierarki Organisasi",
        "title_en": "Workspaces & Organizational Hierarchy",
        "desc_id": "Panduan lengkap memahami arsitektur 4 tingkat alurku. (Workspace ➔ Project ➔ Task ➔ Subtask), matriks hak akses tim, dan kotak to-do pribadi.",
        "desc_en": "Complete guide to the 4-tier alurku. architecture (Workspace ➔ Project ➔ Task ➔ Subtask), team role permissions, and personal scratchpads.",
        "order_index": 2,
        "is_superadmin_only": 0,
        "see_also": ["overview", "my-tasks", "views-workflow", "pricing-tiers"],
        "sections": [
            {
                "id": "hierarchy-overview",
                "title_id": "1. Peta Hierarki Alur Kerja 4 Tingkat",
                "title_en": "1. 4-Tier Workflow Hierarchy Map",
                "content_id": "Untuk menjaga organisasi tetap rapi dan terukur, <strong>alurku.</strong> menyusun pekerjaan dalam 4 tingkatan terintegrasi:<br /><br /><pre><code>1. Ruang Kerja (Workspace)       ➔ Entitas organisasi tertinggi (Tim, Kuota Paket, Kebijakan Global)\n└── 2. Papan Proyek (Project Board) ➔ Ruang inisiatif tim (Kanban, Gantt, Kalender, Analitik)\n      └── 3. Kartu Tugas (Task)        ➔ Unit kerja utama (Status, Assignee, Deadline, Jam ETC, Lampiran)\n            └── 4. Sub-tugas / Checklist  ➔ Langkah aksi detail (Checklist terarah & delegasi mandiri)</code></pre>",
                "content_en": "To maintain structural clarity and eliminate sprawl, <strong>alurku.</strong> organizes deliverables across 4 connected layers:<br /><br /><pre><code>1. Workspace                    ➔ Top-level organizational entity (Team, Plan Subscriptions, Global Settings)\n└── 2. Project Board            ➔ Initiative execution space (Kanban, Gantt, Calendar, Analytics)\n      └── 3. Task Card             ➔ Primary deliverable (Status, Assignee, Deadline, ETC Hours, Files)\n            └── 4. Subtask / Checklist   ➔ Actionable micro-steps (Granular checklist & individual delegates)</code></pre>"
            },
            {
                "id": "level-workspace",
                "title_id": "2. Tingkat 1: Ruang Kerja (Workspace) — Kapabilitas & Cara Pakai",
                "title_en": "2. Level 1: Workspace — Capabilities & How-To Guide",
                "content_id": "<strong>Apa itu Workspace?</strong><br />Ruang Kerja adalah wadah organisasi tertinggi. Seluruh lisensi per-kursi (Seat), kuota penyimpanan awan, dan anggota tim melekat pada Ruang Kerja.<br /><br /><strong>Di Dalamnya Bisa Ngapain Saja?</strong><br />• Mengundang rekan kerja via email atau tautan undangan instan.<br />• Mengatur hak akses tim (Owner, Admin, Member, Viewer).<br />• Berpindah lintas workspace (misal: Ruang Kerja Kantor vs Ruang Kerja Pribadi) secara instan.<br /><br /><strong>Caranya Gimana?</strong><br />Klik dropdown nama ruang kerja di bilah atas (sebelah logo <code>alurku.</code>) ➔ pilih ruang kerja lain atau klik <strong>'+ Buat Ruang Kerja Baru'</strong>.",
                "content_en": "<strong>What is a Workspace?</strong><br />The Workspace is your top organizational boundary. All seat subscriptions, storage quotas, and team memberships attach to the Workspace.<br /><br /><strong>Key Capabilities:</strong><br />• Invite teammates via email or instant shareable join links.<br />• Manage team roles (Owner, Admin, Member, Viewer).<br />• Switch between organizations instantly without logging out.<br /><br /><strong>How To Do It:</strong><br />Click the workspace dropdown in the header ➔ select another workspace or click <strong>'+ New Workspace'</strong>."
            },
            {
                "id": "level-project",
                "title_id": "3. Tingkat 2: Papan Proyek (Project Board) — Kapabilitas & Cara Pakai",
                "title_en": "3. Level 2: Project Board — Capabilities & How-To Guide",
                "content_id": "<strong>Apa itu Project Board?</strong><br />Papan Proyek adalah kanvas kerja untuk inisiatif atau kampanye tertentu (misal: <em>'Redesain Aplikasi Mobile'</em>).<br /><br /><strong>Di Dalamnya Bisa Ngapain Saja?</strong><br />• Mengelola tugas dengan 4 sudut pandang: Papan Kanban, Lini Masa Gantt, Tabel, dan Kalender.<br />• Melakukan diskusi terpadu pada obrolan proyek.<br />• Memantau skor kesehatan proyek dan radar hambatan (<em>Bottleneck Radar</em>).<br /><br /><strong>Caranya Gimana?</strong><br />Klik tombol <strong>'+ Proyek Baru'</strong> di bilah sisi kiri ➔ masukkan nama dan visibilitas ➔ klik 'Buat Proyek'.",
                "content_en": "<strong>What is a Project Board?</strong><br />A Project Board is a focused execution canvas for a specific initiative or product cycle.<br /><br /><strong>Key Capabilities:</strong><br />• View tasks in 4 perspectives: Kanban Board, Gantt Timeline, Table, and Calendar.<br />• Collaborate via contextual project messaging.<br />• Track project health score and Bottleneck Radar.<br /><br /><strong>How To Do It:</strong><br />Click <strong>'+ New Project'</strong> in the left sidebar ➔ specify title and visibility ➔ click 'Create Project'."
            },
            {
                "id": "team-roles",
                "title_id": "4. Matriks Peran & Hak Akses Organisasi",
                "title_en": "4. Roles & Access Control Matrix",
                "content_id": "• <strong>Owner</strong>: Pemilik penuh ruang kerja, tagihan, dan transfer kepemilikan.<br />• <strong>Admin</strong>: Dapat mengelola proyek, mengundang/menghapus anggota, dan mengatur integrasi.<br />• <strong>Member</strong>: Dapat membuat, mengedit, memindahkan status, dan menyelesaikan tugas.<br />• <strong>Viewer</strong>: Akses hanya-baca (<em>Read-Only</em>), ideal untuk klien atau stakeholder luar.",
                "content_en": "• <strong>Owner</strong>: Full control over billing, team ownership, and organization policies.<br />• <strong>Admin</strong>: Can create/delete boards, invite/remove members, and manage integrations.<br />• <strong>Member</strong>: Can create, edit, transition, and complete assigned deliverables.<br />• <strong>Viewer</strong>: Read-Only access for external clients, partners, or auditors."
            },
            {
                "id": "scratchpad-personal",
                "title_id": "5. Tugas Pribadi: Catatan Mandiri (Personal Scratchpad)",
                "title_en": "5. Personal Tasks: Private Scratchpad",
                "content_id": "Butuh to-do list pribadi yang terisolasi 100% dari rekan kerja?<br />Klik menu <strong>'Tugas Pribadi'</strong> di bilah sisi kiri. Tugas di sini hanya dapat dilihat oleh akunmu sendiri dan tidak memengaruhi analitik jam kerja tim.",
                "content_en": "Need a private checklist hidden from teammates?<br />Click <strong>'Personal Tasks'</strong> in the left sidebar. Items recorded here are strictly private to your account and excluded from team workload calculations."
            }
        ]
    },
    {
        "doc_id": "my-tasks",
        "group_id": "get-started",
        "group_title_id": "Mulai",
        "group_title_en": "Get Started",
        "title_id": "Halaman Tugas Saya (My Tasks View)",
        "title_en": "My Tasks Page & Personal Focus",
        "desc_id": "Panduan lengkap halaman Tugas Saya: pusat fokus personal, anatomi kontrol filter, status flow, checklist safeguard, dan kartu tugas mandiri.",
        "desc_en": "Complete guide to the My Tasks page: personal focus hub, filter control anatomy, status flow, checklist safeguard, and task cards.",
        "order_index": 3,
        "is_superadmin_only": 0,
        "see_also": ["workspace", "views-workflow", "command-bar"],
        "sections": [
            {
                "id": "my-tasks-purpose",
                "title_id": "1. Tujuan Halaman & Fokus Personal",
                "title_en": "1. Page Purpose & Personal Focus",
                "content_id": "Halaman <strong>Tugas Saya (My Tasks — <code>/my-tasks</code>)</strong> adalah kokpit kerja harian bagi setiap anggota tim. Halaman ini secara otomatis menyaring seluruh tugas yang ditugaskan kepadamu dari seluruh proyek aktif, sehingga kamu dapat langsung mengeksekusi pekerjaan tanpa terdistraksi aktivitas rekan lain.",
                "content_en": "The <strong>My Tasks (<code>/my-tasks</code>)</strong> page is your personal daily command center. It automatically filters all tasks assigned to your account across all active boards, empowering you to execute with zero distractions from other team activities."
            },
            {
                "id": "my-tasks-anatomy",
                "title_id": "2. Anatomi Kontrol & Antarmuka Layar",
                "title_en": "2. UI Anatomy & Screen Controls",
                "content_id": "• <strong>Bilah Filter Atas</strong>: Filter kategori, tombol pencarian instan, dan tombol toggle <em>'Hanya Terlambat (Overdue)'</em>.<br />• <strong>Grup Kolom Status</strong>: Mengelompokkan tugasmu ke dalam Antrean (To Do), Dikerjakan (In Progress), Review, dan Selesai (Done).<br />• <strong>Lencana Tenggat Waktu Cerdas</strong>: Berwarna Merah (lewat deadline), Kuning (jatuh tempo hari ini/besok), atau Abu-abu (masih lama).<br />• <strong>Indikator Sub-tugas</strong>: Menampilkan rasio penyelesaian checklist (misal: <code>3/4 Selesai</code>).",
                "content_en": "• <strong>Top Filter Toolbar</strong>: Category dropdown, instant task keyword search, and the <em>'Overdue Only'</em> toggle.<br />• <strong>Status Columns</strong>: Segregates personal deliverables across To Do, In Progress, Review, and Done.<br />• <strong>Smart Due Date Badges</strong>: Highlighted in Red (overdue), Yellow (due today/tomorrow), or Slate (upcoming).<br />• <strong>Subtask Progress Chips</strong>: Displays checklist ratio at a glance (e.g. <code>3/4 Done</code>)."
            },
            {
                "id": "my-tasks-workflow",
                "title_id": "3. Cara Mengelola Tugas Harian (How-To)",
                "title_en": "3. Step-by-Step Daily Execution Guide",
                "content_id": "1. <strong>Buka Tugas Saya</strong>: Tekan <code>G</code> lalu <code>P</code> atau klik menu <strong>'Tugas Saya'</strong> pada bilah sisi kiri.<br />2. <strong>Mulai Mengerjakan</strong>: Buka kartu tugas ➔ ubah status menjadi <em>'Dikerjakan'</em>.<br />3. <strong>Centang Checklist</strong>: Buka modal detail dan tandai setiap butir sub-tugas yang telah tuntas.<br />4. <strong>Pencegahan Kesalahan (Checklist Safeguard)</strong>: Jika kamu mencoba memindahkan tugas ke 'Selesai' saat ada checklist yang belum tuntas, alurku. akan memunculkan konfirmasi pengingat untuk menjaga kualitas pengerjaan.",
                "content_en": "1. <strong>Open My Tasks</strong>: Press <code>G</code> then <code>P</code> or click <strong>'My Tasks'</strong> in the left sidebar.<br />2. <strong>Start Work</strong>: Open the card ➔ transition status to <em>'In Progress'</em>.<br />3. <strong>Check Subtasks</strong>: Inspect the modal and check off completed subtask milestones.<br />4. <strong>Checklist Safeguard</strong>: Moving a task to 'Done' while subtasks remain active triggers an intelligent quality prompt to ensure deliverables are truly finished."
            }
        ]
    },
    {
        "doc_id": "command-bar",
        "group_id": "features",
        "group_title_id": "Fitur Utama",
        "group_title_en": "Core Features",
        "title_id": "Command Bar Quick-Add & Pintasan Navigasi Keyboard",
        "title_en": "Command Bar Quick-Add & Keyboard Shortcuts",
        "desc_id": "Kuasai seluruh pintasan keyboard alurku.: tombol '/' untuk pencarian global, Cmd/Ctrl+K untuk Command Bar, pintasan bilah sisi (Ctrl+B), dan navigasi kilat huruf G.",
        "desc_en": "Master all alurku. keyboard shortcuts: '/' for instant global search, Cmd/Ctrl+K for Command Bar, sidebar toggle (Ctrl+B), and sequential G navigation.",
        "order_index": 4,
        "is_superadmin_only": 0,
        "see_also": ["overview", "workspace", "views-workflow"],
        "sections": [
            {
                "id": "how-to-open-cmdk",
                "title_id": "1. Cara Membuka Command Bar (Cmd/Ctrl + K)",
                "title_en": "1. Opening Command Bar Quick-Add (Cmd/Ctrl + K)",
                "content_id": "Tekan <code>Ctrl + K</code> (Windows/Linux) atau <code>Cmd + K</code> (macOS) dari halaman mana saja, atau klik lencana <strong>⌘K</strong> di bilah atas. Command Bar adalah pusat aksi kilat yang dirancang untuk mendukung alur kerja cepat tanpa mouse:<br /><br />• <strong>Buat Tugas NLP Instan</strong>: Ketik satu kalimat alami untuk membuat tugas tanpa membuka form bertahap.<br />• <strong>Tanya Luruka AI</strong>: Awali ketikan dengan <code>ai:</code> atau <code>tanya:</code> untuk langsung berkonsultasi dengan asisten cerdas.<br />• <strong>Lompat Papan Proyek</strong>: Ketik nama proyek untuk langsung membuka papan tersebut seketika.<br />• <strong>Navigasi Mode Tampilan</strong>: Ketik 'Kanban', 'Gantt', 'Analitik', atau 'Kalender' untuk berpindah tab tanpa klik mouse.",
                "content_en": "Press <code>Ctrl + K</code> (Windows/Linux) or <code>Cmd + K</code> (macOS) anywhere, or click the <strong>⌘K</strong> badge in the header. The Command Bar is your lightning-fast action launcher:<br /><br />• <strong>NLP Quick-Add</strong>: Type a natural sentence to generate tasks without clicking form fields.<br />• <strong>Ask Luruka AI</strong>: Prefix queries with <code>ai:</code> or <code>tanya:</code> to consult your AI assistant.<br />• <strong>Jump to Projects</strong>: Type any project name to switch boards instantly.<br />• <strong>Switch Views</strong>: Type 'Kanban', 'Timeline', 'Workload', or 'Calendar' to change perspectives."
            },
            {
                "id": "nlp-syntax",
                "title_id": "2. Format Sintaks Natural Language Parsing (NLP)",
                "title_en": "2. Natural Language Parsing (NLP) Syntax",
                "content_id": "Saat mengetik di Command Bar, mesin NLP cerdas alurku. otomatis mengekstrak atribut tugas secara real-time:<br /><br />• <strong>Prioritas</strong>: Gunakan <code>p:urgent</code>, <code>p:high</code>, <code>p:low</code>, atau <code>!urgent</code>, <code>!tinggi</code>.<br />• <strong>Tenggat Waktu</strong>: Gunakan kata alami seperti <code>due:today</code>, <code>due:tomorrow</code>, <code>tgl:besok</code>, <code>tgl:lusa</code>, atau tanggal spesifik <code>YYYY-MM-DD</code>.<br />• <strong>Penanggung Jawab</strong>: Ketik <code>@username</code> untuk menugaskan rekan tim aktif.<br />• <strong>Proyek Tujuan</strong>: Ketik <code>#nama-proyek</code> untuk mengarahkan tugas ke papan tertentu.<br /><br /><strong>Contoh Input Lengkap</strong>: <code>Perbaiki bug checkout @budi due:tomorrow p:urgent #mobile-app</code><br />Tekan <strong>Enter ↵</strong> untuk langsung menyimpan tugas ke papan kerja.",
                "content_en": "When typing in the Command Bar, alurku.'s client NLP engine extracts task attributes in real time:<br /><br />• <strong>Priority</strong>: Use <code>p:urgent</code>, <code>p:high</code>, <code>p:low</code>, or <code>!urgent</code>, <code>!high</code>.<br />• <strong>Due Date</strong>: Use natural terms like <code>due:today</code>, <code>due:tomorrow</code>, <code>tgl:besok</code>, or explicit dates <code>YYYY-MM-DD</code>.<br />• <strong>Assignee</strong>: Type <code>@username</code> to assign active team members.<br />• <strong>Target Board</strong>: Type <code>#project-name</code> to assign directly to a specific board.<br /><br /><strong>Complete Example</strong>: <code>Fix checkout bug @budi due:tomorrow p:urgent #mobile-app</code><br />Press <strong>Enter ↵</strong> to save immediately."
            },
            {
                "id": "global-search-slash",
                "title_id": "3. Pencarian Global Instan dengan Tombol '/' (Slash)",
                "title_en": "3. Instant Global Search with '/' (Slash Key)",
                "content_id": "Sesuai standar SaaS modern kelas dunia, kamu dapat menekan tombol <code>/</code> (garis miring) pada keyboard kapan saja saat kursor tidak sedang berada di dalam kolom teks/input.<br /><br />• <strong>Fokus Otomatis</strong>: Kursor akan seketika melompat ke kolom pencarian global di bilah atas (header).<br />• <strong>Cakupan Pencarian Fleksibel</strong>: Kamu dapat memilih mencari hanya di ruang kerja aktif saat ini, atau klik opsi dropdown untuk mencari lintas seluruh ruang kerja (<em>'Semua Workspace'</em>).<br />• <strong>Dropdown Hasil Instan & Tekan Enter</strong>: Saat mengetik, sistem langsung menampilkan pratinjau tugas dan proyek yang cocok. Tekan <strong>Enter ↵</strong> untuk membuka halaman hasil pencarian lengkap.",
                "content_en": "Following global SaaS best practices, pressing the <code>/</code> (slash) key anywhere outside active text inputs instantly shifts focus to the top Global Search bar.<br /><br />• <strong>Auto-Focus</strong>: Your cursor instantly highlights the search input without lifting hands from the keyboard.<br />• <strong>Flexible Search Scope</strong>: Toggle between searching your active workspace or searching across all workspaces (<em>'All Workspaces'</em>).<br />• <strong>Instant Previews & Enter Navigation</strong>: Real-time search matches appear in a floating dropdown. Hit <strong>Enter ↵</strong> to display full search results."
            },
            {
                "id": "sidebar-shortcuts",
                "title_id": "4. Pintasan Navigasi Bilah Sisi (Sidebar & Huruf G)",
                "title_en": "4. Sidebar & Sequential 'G' Shortcuts",
                "content_id": "alurku. mendukung pintasan dua langkah bergaya platform profesional (<em>Gmail / GitHub key sequences</em>) saat tidak sedang mengetik di dalam kolom teks:<br /><br />• <code>Ctrl + B</code> (atau <code>Cmd + B</code>): Membuka atau menciutkan bilah sisi (<em>Toggle Sidebar</em>).<br />• <code>G</code> lalu <code>H</code>: Langsung menuju <strong>Beranda Utama (Home Dashboard)</strong>.<br />• <code>G</code> lalu <code>P</code>: Langsung membuka <strong>Tugas Pribadi (Personal Scratchpad)</strong>.<br />• <code>G</code> lalu <code>A</code>: Langsung membuka <strong>Papan Global (All Projects Board)</strong>.<br />• <code>G</code> lalu <code>I</code>: Langsung membuka laci <strong>Kotak Masuk Notifikasi (Inbox)</strong>.<br />• <code>Esc</code>: Menutup modal aktif, jendela Command Bar, atau pratinjau pencarian.",
                "content_en": "alurku. supports two-step sequential key combinations inspired by professional platforms (Gmail/GitHub sequences) when outside input fields:<br /><br />• <code>Ctrl + B</code> (or <code>Cmd + B</code>): Toggle the left sidebar open/collapsed.<br />• <code>G</code> then <code>H</code>: Jump straight to <strong>Home Dashboard</strong>.<br />• <code>G</code> then <code>P</code>: Open your private <strong>Personal Tasks (Scratchpad)</strong>.<br />• <code>G</code> then <code>A</code>: Switch to the consolidated <strong>Global Board (All Projects)</strong>.<br />• <code>G</code> then <code>I</code>: Open your <strong>Notification Inbox</strong> drawer.<br />• <code>Esc</code>: Dismiss any open modal, Command Bar, or search preview."
            },
            {
                "id": "shortcuts-cheat-sheet",
                "title_id": "5. Tabel Rangkuman Pintasan Keyboard",
                "title_en": "5. Keyboard Shortcuts Cheat Sheet",
                "content_id": "Berikut tabel referensi cepat seluruh pintasan keyboard di alurku.:<br /><br />• <code>/</code> : Fokus ke Pencarian Global (Global Search)<br />• <code>Ctrl + K</code> / <code>Cmd + K</code> : Buka Command Bar Quick-Add<br />• <code>Ctrl + B</code> / <code>Cmd + B</code> : Sembunyikan / Tampilkan Bilah Sisi<br />• <code>G</code> ➔ <code>H</code> : Buka Beranda Utama (Home Dashboard)<br />• <code>G</code> ➔ <code>P</code> : Buka Ruang Tugas Pribadi (Personal Scratchpad)<br />• <code>G</code> ➔ <code>A</code> : Buka Papan Global Seluruh Proyek<br />• <code>G</code> ➔ <code>I</code> : Buka Kotak Masuk Notifikasi<br />• <code>Esc</code> : Tutup Modal / Batal / Kembali",
                "content_en": "Quick reference cheat sheet of all keyboard shortcuts in alurku.:<br /><br />• <code>/</code> : Focus Global Search input<br />• <code>Ctrl + K</code> / <code>Cmd + K</code> : Open Command Bar Quick-Add<br />• <code>Ctrl + B</code> / <code>Cmd + B</code> : Toggle Left Sidebar<br />• <code>G</code> ➔ <code>H</code> : Navigate to Home Dashboard<br />• <code>G</code> ➔ <code>P</code> : Open Personal Scratchpad Tasks<br />• <code>G</code> ➔ <code>A</code> : Open Consolidated Global Board<br />• <code>G</code> ➔ <code>I</code> : Open Notifications Inbox<br />• <code>Esc</code> : Close active modal / cancel / return"
            }
        ]
    },
    {
        "doc_id": "views-workflow",
        "group_id": "features",
        "group_title_id": "Fitur Utama",
        "group_title_en": "Core Features",
        "title_id": "Empat Tampilan Alur Kerja (4 Views)",
        "title_en": "Four Core Workflow Views",
        "desc_id": "Panduan lengkap memanfaatkan Papan Kanban, Lini Masa Gantt, Tampilan Tabel, Kalender Terpadu, dan Tong Sampah Mengambang.",
        "desc_en": "Comprehensive guide to leveraging Kanban, Gantt Timeline, Table View, Unified Calendar, and the Floating Trash Bin.",
        "order_index": 5,
        "is_superadmin_only": 0,
        "see_also": ["command-bar", "workload-analytics", "my-tasks"],
        "sections": [
            {
                "id": "kanban-view",
                "title_id": "1. Papan Kanban Interaktif",
                "title_en": "1. Interactive Kanban Board",
                "content_id": "Papan Kanban mengelompokkan tugas berdasarkan kolom status (Antrean, Dikerjakan, Review, Selesai). Anda dapat melakukan tarik-dan-lepas (<em>drag-and-drop</em>) kartu tugas dengan responsif dan mulus untuk memindahkan status pekerjaan secara real-time.<br /><br />• <strong>Penjaga Kepatuhan Sub-tugas (Checklist Safeguard)</strong>: Sistem akan otomatis meminta konfirmasi jika Anda memindahkan tugas ke kolom 'Selesai' saat masih ada sub-tugas yang belum selesai.<br />• <strong>Tong Sampah Interaktif Mengambang</strong>: Untuk menghapus tugas, cukup tarik kartu tugas dan jatuhkan ke ikon tong sampah interaktif yang membesar di pojok kanan bawah layar.",
                "content_en": "The Kanban board groups work items across transparent lifecycle columns (To Do, In Progress, Review, Done). Responsive drag-and-drop interactions make status updates effortless and immediate.<br /><br />• <strong>Checklist Safeguard</strong>: A built-in quality control mechanism automatically prompts you if you attempt to move a task to 'Done' while subtasks remain uncompleted.<br />• <strong>Interactive Floating Trash Bin</strong>: To delete a task, simply drag and drop its card into the responsive floating trash can icon that expands at the bottom-right of your screen."
            },
            {
                "id": "gantt-view",
                "title_id": "2. Lini Masa Gantt Chart",
                "title_en": "2. Gantt Timeline View",
                "content_id": "Menampilkan rentang tanggal mulai hingga tenggat waktu dalam visualisasi batang horizontal yang rapi. Fitur ini membantu manajer proyek melihat ketergantungan antar-tugas, mengantisipasi jalur kritis (<em>critical path</em>), dan memastikan target peluncuran tercapai tepat waktu.<br /><br />• <strong>Pengaturan Durasi Interaktif</strong>: Anda dapat menggeser batang jadwal secara horizontal untuk menyesuaikan tanggal mulai dan tenggat waktu secara visual.",
                "content_en": "Visualizes project timelines as clean horizontal bars spanning start dates to final deadlines. It helps project managers identify task dependencies, anticipate critical paths, and ensure target launch dates are met.<br /><br />• <strong>Interactive Drag-Adjust</strong>: Drag horizontal bars across the timeline to reschedule start dates and deadlines visually."
            },
            {
                "id": "table-view",
                "title_id": "3. Tampilan Tabel & Spreadsheet",
                "title_en": "3. Table Spreadsheet View",
                "content_id": "Tampilan Tabel menyajikan seluruh tugas dalam format baris dan kolom yang padat informasi, cocok untuk audit cepat, pemfilteran massal, dan pemilahan berdasarkan kategori, penanggung jawab, serta jam estimasi.",
                "content_en": "The Table View renders tasks into an information-dense spreadsheet grid, perfect for rapid audits, sorting, and bulk inspection across categories, owners, and duration estimates."
            },
            {
                "id": "calendar-view",
                "title_id": "4. Kalender Terpadu & Jadwal Libur",
                "title_en": "4. Unified Calendar & Leave Schedule",
                "content_id": "Menampilkan seluruh tenggat waktu tugas berdampingan dengan jadwal cuti tim dan hari libur nasional resmi. Hal ini memastikan perencanaan sprint selalu realistis dan terbebas dari jadwal bentrok.",
                "content_en": "Displays project deadlines side-by-side with team leave schedules and official public holidays, ensuring sprint commitments remain realistic and conflict-free."
            }
        ]
    },
    {
        "doc_id": "workload-analytics",
        "group_id": "features",
        "group_title_id": "Fitur Utama",
        "group_title_en": "Core Features",
        "title_id": "Analisis Beban Kerja & Kapasitas Jam",
        "title_en": "Workload Analytics & Capacity Management",
        "desc_id": "Ketahui batas kapasitas tim secara real-time, pantau estimasi jam kerja mingguan (40 jam), dan cegah kejenuhan kerja (burnout).",
        "desc_en": "Monitor real-time team capacity, track 40-hour weekly thresholds, and prevent workplace burnout.",
        "order_index": 6,
        "is_superadmin_only": 0,
        "see_also": ["views-workflow", "leaves-absensi", "ai-planning"],
        "sections": [
            {
                "id": "workload-logic",
                "title_id": "1. Logika Perhitungan Kapasitas Kerja",
                "title_en": "1. Capacity Calculation Logic",
                "content_id": "Analitik beban kerja alurku. mengagregasi seluruh nilai perkiraan jam penyelesaian tugas (ETC) yang aktif dalam satu minggu kerja terhadap batas standar 40 jam per orang.<br /><br />• <strong>Beban Bersih</strong>: Jam ETC tugas aktif dibagi ketersediaan hari kerja.<br />• <strong>Pengurang Otomatis Hari Cuti</strong>: Ketika anggota tim mengambil cuti yang disetujui, batas kapasitas mingguannya otomatis dikurangi 8 jam per hari cuti.",
                "content_en": "alurku.'s Workload Analytics engine aggregates all Estimated Time to Complete (ETC) hours assigned to each member against a standard 40-hour weekly threshold.<br /><br />• <strong>Net Workload</strong>: Active ETC hours divided across working days.<br />• <strong>Automatic Leave Deduction</strong>: Approved leaves deduct 8 hours per day from the teammate's weekly capacity ceiling."
            },
            {
                "id": "color-codes",
                "title_id": "2. Kamus Kode Warna Status Kapasitas",
                "title_en": "2. Capacity Color Coding Dictionary",
                "content_id": "• <strong>Abu-abu / Hijau (Under-Capacity)</strong>: Beban kerja < 30 jam. Masih memiliki ruang untuk menerima tugas baru.<br />• <strong>Biru (Optimal Capacity)</strong>: Beban kerja 30-40 jam. Distribusi tugas ideal dan produktif.<br />• <strong>Kuning (Near Capacity)</strong>: Beban kerja mendekati 40 jam. Disarankan tidak menambah tugas baru.<br />• <strong>Merah (Overloaded Alert)</strong>: Beban kerja > 40 jam. Peringatan dini potensi burnout, butuh redistribusi tugas.",
                "content_en": "• <strong>Slate / Green (Under-Capacity)</strong>: Workload < 30 hours. Teammate has available bandwidth for assignments.<br />• <strong>Blue (Optimal Capacity)</strong>: Workload 30-40 hours. Healthy, well-balanced workload.<br />• <strong>Yellow (Near Capacity)</strong>: Approaching 40 hours. Caution advised against assigning additional deliverables.<br />• <strong>Red (Overload Alert)</strong>: Workload exceeds 40 hours. Actionable warning indicating high risk of burnout; requires rebalancing."
            },
            {
                "id": "rebalancing-tasks",
                "title_id": "3. Cara Meratakan Beban Tugas (Rebalancing)",
                "title_en": "3. Rebalancing Deliverables",
                "content_id": "1. Buka tab <strong>'Analitik'</strong> pada papan proyek.<br />2. Temukan anggota tim dengan indikator merah (Overloaded).<br />3. Buka daftar tugas anggota tersebut, lalu pindahkan penanggung jawab tugas yang berprioritas rendah ke rekan tim lain yang memiliki indikator hijau.",
                "content_en": "1. Open the <strong>'Analytics'</strong> tab in your project board.<br />2. Identify teammates flagged with a red (Overload) indicator.<br />3. Inspect their task list and reassign lower-priority tasks to teammates with green (Under-Capacity) bandwidth."
            }
        ]
    },
    {
        "doc_id": "workspace-chat",
        "group_id": "features",
        "group_title_id": "Fitur Utama",
        "group_title_en": "Core Features",
        "title_id": "Ruang Obrolan Tim (Workspace Chat)",
        "title_en": "Workspace Chat & Team Channels",
        "desc_id": "Pusat komunikasi real-time terpadu per ruang kerja: kanal diskusi proyek, mention anggota tim, berbagi dokumen, dan pencarian riwayat obrolan.",
        "desc_en": "Real-time communication hub: workspace channels, @mentions, file sharing, and searchable message history.",
        "order_index": 7,
        "is_superadmin_only": 0,
        "see_also": ["workspace", "inbox-comments", "views-workflow"],
        "sections": [
            {
                "id": "chat-overview",
                "title_id": "1. Obrolan Kontekstual Tanpa Aplikasi Pihak Ketiga",
                "title_en": "1. Contextual In-App Team Messaging",
                "content_id": "Fitur <strong>Workspace Chat (<code>/chat</code>)</strong> memungkinkan seluruh anggota ruang kerja berkomunikasi secara langsung di dalam alurku. tanpa perlu berpindah ke Slack atau WhatsApp. Percakapan tersimpan rapi dan dapat ditautkan langsung ke kartu tugas yang sedang dibahas.",
                "content_en": "<strong>Workspace Chat (<code>/chat</code>)</strong> allows team members to communicate directly inside alurku. without switching to third-party tools. Conversations stay in context and can be referenced directly against related deliverables."
            },
            {
                "id": "chat-features",
                "title_id": "2. Fitur Unggulan Obrolan",
                "title_en": "2. Key Chat Capabilities",
                "content_id": "• <strong>Kanal Proyek Terisolasi</strong>: Setiap papan proyek memiliki kanal diskusi khusus.<br />• <strong>Pemberitahuan Instan (@Mention)</strong>: Ketik <code>@username</code> untuk memberi tahu rekan kerja tertentu.<br />• <strong>Kutipan Pesan (Reply Quote)</strong>: Balas pesan tertentu dengan kutipan yang jelas agar topik tidak bercampur.<br />• <strong>Berbagi Berkas & Cuplikan Kode</strong>: Lampirkan gambar atau salinan teks langsung ke dalam jendela percakapan.",
                "content_en": "• <strong>Dedicated Project Channels</strong>: Every board maintains its own contextual discussion stream.<br />• <strong>Instant @Mentions</strong>: Type <code>@username</code> to notify specific collaborators.<br />• <strong>Message Quoting</strong>: Reply directly to specific messages to maintain structured conversations.<br />• <strong>File & Code Sharing</strong>: Attach images, documents, or formatted code snippets directly into the conversation."
            }
        ]
    },
    {
        "doc_id": "inbox-comments",
        "group_id": "features",
        "group_title_id": "Fitur Utama",
        "group_title_en": "Core Features",
        "title_id": "Kotak Masuk & Komentar Ditugaskan",
        "title_en": "Notification Inbox & Assigned Comments",
        "desc_id": "Pusat notifikasi aktivitas kerja, feed komentar yang ditugaskan, peringatan deadline mendekat (auto-nudge), dan filter pesan belum dibaca.",
        "desc_en": "Centralized activity notifications, assigned comments feed, deadline proximity auto-nudges, and unread filters.",
        "order_index": 8,
        "is_superadmin_only": 0,
        "see_also": ["workspace-chat", "my-tasks", "command-bar"],
        "sections": [
            {
                "id": "inbox-hub",
                "title_id": "1. Kotak Masuk Notifikasi Terpusat (/inbox)",
                "title_en": "1. Centralized Notification Inbox (/inbox)",
                "content_id": "Buka laci <strong>Kotak Masuk (Inbox)</strong> dari ikon lonceng di bilah atas atau tekan pintasan <code>G</code> lalu <code>I</code>. Seluruh aktivitas penugasan tugas baru, pembaruan status oleh rekan tim, dan persetujuan cuti terkumpul di satu tempat.<br /><br />• <strong>Filter Belum Dibaca</strong>: Memisahkan pesan yang membutuhkan perhatian segera.<br />• <strong>Tandai Semua Selesai</strong>: Bersihkan notifikasi dengan satu klik setelah meninjau seluruh pembaruan.",
                "content_en": "Open the <strong>Inbox</strong> drawer from the top bell icon or press <code>G</code> then <code>I</code>. All new task assignments, teammate status updates, and leave approvals consolidate in one feed.<br /><br />• <strong>Unread Filter</strong>: Isolate notifications requiring your immediate attention.<br />• <strong>Mark All Read</strong>: Clear read notifications with one click after auditing updates."
            },
            {
                "id": "assigned-comments",
                "title_id": "2. Feed Komentar Ditugaskan (/assigned-comments)",
                "title_en": "2. Assigned Comments Hub (/assigned-comments)",
                "content_id": "Ketika rekan kerja menyebutmu dalam komentar kartu tugas (<code>@kamu tolong tinjau mockup ini</code>), komentar tersebut otomatis masuk ke feed <strong>Komentar Ditugaskan</strong>. Kamu dapat langsung membalas komentar tersebut tanpa harus mencari kartu tugasnya satu per satu di papan Kanban.",
                "content_en": "When a collaborator mentions you in a task discussion (<code>@you please review this mockup</code>), it logs into your <strong>Assigned Comments</strong> feed. Reply inline without digging through project boards."
            },
            {
                "id": "auto-nudge",
                "title_id": "3. Pengingat Otomatis Cerdas (Auto-Nudge)",
                "title_en": "3. Smart Auto-Nudge Alerts",
                "content_id": "Sistem alurku. menjalankan pemindai latar belakang cerdas sekali sehari untuk mengingatkan tugas-tugas yang mendekati tenggat waktu (H-1 atau hari H) langsung ke kotak masuk pengguna, menjaga proyek agar tidak pernah terlambat.",
                "content_en": "An automated background agent runs daily to notify assignees of deliverables due within 24 hours directly in their inbox, safeguarding target launch dates."
            }
        ]
    },
    {
        "doc_id": "ai-planning",
        "group_id": "ai-tools",
        "group_title_id": "Kecerdasan Buatan",
        "group_title_en": "AI Tools",
        "title_id": "Luruka AI: Asisten & Perencana Proaktif",
        "title_en": "Luruka AI: Proactive Assistant & Planner",
        "desc_id": "Kekuatan kecerdasan buatan alurku.: Daily Briefing pagi hari, estimasi waktu otomatis, dekomposisi sub-tugas, dan jaminan Zero Data Retention.",
        "desc_en": "alurku. AI capabilities: Morning Daily Briefing, automatic time estimation, task decomposition, and Zero Data Retention privacy.",
        "order_index": 9,
        "is_superadmin_only": 0,
        "see_also": ["overview", "workload-analytics", "command-bar"],
        "sections": [
            {
                "id": "ai-overview",
                "title_id": "1. Mengenal Luruka: Partner Kerja Pintarmu",
                "title_en": "1. Meet Luruka: Your Supportive AI Workspace Partner",
                "content_id": "<strong>Luruka</strong> bukan sekadar chatbot biasa. Luruka adalah asisten alur kerja yang memahami konteks seluruh proyek, beban kerja, dan tenggat waktu timmu. Luruka berkomunikasi dengan gaya bahasa yang ramah, hangat, dan suportif (menggunakan 'Aku' dan 'Kamu').",
                "content_en": "<strong>Luruka</strong> is an intelligent contextual partner aware of your projects, team bandwidth, and deadlines. Luruka communicates with a supportive, clear voice designed to empower your daily work."
            },
            {
                "id": "daily-briefing",
                "title_id": "2. Ringkasan Harian Cerdas (Daily Briefing)",
                "title_en": "2. Intelligent Daily Briefings",
                "content_id": "Setiap pagi saat membuka Beranda alurku., Luruka menyambutmu dengan kartu <strong>Daily Briefing</strong>:<br /><br />• Merangkum 3 tugas paling prioritas yang harus kamu tuntaskan hari ini.<br />• Mengingatkan tugas yang mendekati batas waktu.<br />• Memberikan tombol aksi langsung untuk memulai fokus kerja.",
                "content_en": "Every morning upon loading your Dashboard, Luruka presents a customized <strong>Daily Briefing</strong> card:<br /><br />• Summarizes your top 3 high-impact deliverables for today.<br />• Highlights tasks approaching deadlines.<br />• Offers one-click action buttons to begin focused execution."
            },
            {
                "id": "task-breakdown",
                "title_id": "3. Pemecahan Tugas Otomatis (⚡ AI Breakdown)",
                "title_en": "3. Automated Task Decomposition (⚡ AI Breakdown)",
                "content_id": "Punya proyek besar yang membingungkan? Buka kartu tugas ➔ klik tombol <strong>'⚡ AI Breakdown'</strong>. Luruka akan memecah inisiatif tersebut menjadi 3-6 butir checklist terstruktur dengan estimasi waktu yang realistis.",
                "content_en": "Facing an intimidating complex task? Open the card and click <strong>'⚡ AI Breakdown'</strong>. Luruka decomposes the initiative into 3-6 actionable checklist items with realistic duration estimates."
            },
            {
                "id": "ai-privacy",
                "title_id": "4. Kebijakan Privasi AI (Zero Data Retention)",
                "title_en": "4. Zero-Retention AI Privacy Policy",
                "content_id": "Seluruh data dan instruksi yang kamu berikan kepada Luruka dilindungi dengan kebijakan privasi yang ketat. Permintaan AI Anda <strong>tidak pernah disimpan</strong> atau digunakan untuk melatih model kecerdasan buatan publik.",
                "content_en": "All queries and task data processed with Luruka are strictly protected. Your prompts are <strong>never retained</strong> or utilized to train public LLM models."
            }
        ]
    },
    {
        "doc_id": "leaves-absensi",
        "group_id": "features",
        "group_title_id": "Fitur Utama",
        "group_title_en": "Core Features",
        "title_id": "Pusat Pengajuan Cuti & Hari Libur",
        "title_en": "Leave Management & Public Holidays",
        "desc_id": "Alur pengajuan cuti tim, persetujuan atasan, kalender libur nasional resmi, dan sinkronisasi kapasitas jam kerja mingguan.",
        "desc_en": "Team leave requests, manager approvals, official public holiday schedules, and automatic workload capacity rebalancing.",
        "order_index": 10,
        "is_superadmin_only": 0,
        "see_also": ["workload-analytics", "views-workflow", "workspace"],
        "sections": [
            {
                "id": "leave-types",
                "title_id": "1. Jenis Pengajuan & Kalender Libur Nasional",
                "title_en": "1. Request Types & Public Holiday Calendar",
                "content_id": "Melalui menu <strong>'Cuti & Pertemuan' (<code>/leaves</code>)</strong>, anggota tim dapat mengajukan Cuti Tahunan, Izin Sakit, atau Keperluan Mendesak. Admin Ruang Kerja juga dapat mengaktifkan kalender Libur Nasional resmi yang secara otomatis memblokir tanggal cuti bersama di seluruh kalender tim.",
                "content_en": "Through <strong>Leaves & Meetings (<code>/leaves</code>)</strong>, teammates can submit requests for Annual Leave, Sick Days, or Personal Time Off. Workspace Admins can also activate official Public Holiday calendars that automatically reserve non-working dates across the team."
            },
            {
                "id": "leave-sync",
                "title_id": "2. Sinkronisasi Otomatis dengan Beban Kerja",
                "title_en": "2. Automatic Workload Capacity Deduction",
                "content_id": "Ketika permohonan cuti disetujui, sistem secara otomatis mengurangi kuota jam kerja mingguan anggota tersebut di Analisis Beban Kerja (8 jam per hari cuti) dan menampilkan penanda cuti di tampilan Kalender dan Lini Masa Gantt.",
                "content_en": "When leave is approved, weekly capacity in Workload Analytics automatically deducts 8 hours per day, while Gantt and Calendar views display clear leave indicators to prevent unrealistic commitments."
            }
        ]
    },
    {
        "doc_id": "attachments",
        "group_id": "management",
        "group_title_id": "Manajemen & Berkas",
        "group_title_en": "Files & Productivity",
        "title_id": "Lampiran Berkas & Manajemen Dokumen",
        "title_en": "File Attachments & Document Storage",
        "desc_id": "Penyimpanan dokumen aman berstandar enterprise, batas ukuran berkas per paket, enkripsi berlapis, dan pratinjau instan dokumen.",
        "desc_en": "Enterprise-grade secure document storage, per-plan file limits, high-grade encryption, and instant document previews.",
        "order_index": 11,
        "is_superadmin_only": 0,
        "see_also": ["pricing-tiers", "security-governance", "views-workflow"],
        "sections": [
            {
                "id": "storage-engines",
                "title_id": "1. Keamanan & Aksesibilitas Berkas Dokumen",
                "title_en": "1. Secure Document Storage & Global Availability",
                "content_id": "alurku. memastikan seluruh berkas dan dokumen tim Anda tersimpan dengan aman, berkecepatan tinggi, dan selalu tersedia kapan saja:<br /><br />• <strong>Enkripsi & Privasi Penuh</strong>: Setiap aset dokumen dilindungi dengan standar keamanan tingkat tinggi sehingga hanya anggota ruang kerja yang berhak yang dapat mengaksesnya.<br />• <strong>Pengunduhan Berkecepatan Tinggi</strong>: Infrastruktur cloud terdistribusi menjamin pengunggahan dan pengunduhan berkas berlangsung instan tanpa lemot dari lokasi mana pun.",
                "content_en": "alurku. ensures all your team documents are securely managed, readily accessible, and globally fast:<br /><br />• <strong>Zero Compromise on Privacy & Encryption</strong>: Every uploaded asset is protected under strict access permissions and high-grade data encryption, ensuring confidentiality across your workspace.<br />• <strong>High-Speed Global Accessibility</strong>: Distributed cloud infrastructure delivers seamless, instant uploads and downloads with high reliability for distributed teams."
            },
            {
                "id": "supported-files",
                "title_id": "2. Format Berkas & Batas Ukuran",
                "title_en": "2. Supported File Formats & Size Limits",
                "content_id": "• <strong>Dokumen & Spreadsheet</strong>: PDF, DOCX, XLSX, CSV, TXT.<br />• <strong>Gambar Desain</strong>: PNG, JPG, JPEG, WEBP, SVG.<br />• <strong>Batas Ukuran Berkas</strong>: Paket Free hingga 10MB per berkas; Paket Pro & Business hingga 50MB per berkas.",
                "content_en": "• <strong>Documents & Spreadsheets</strong>: PDF, DOCX, XLSX, CSV, TXT.<br />• <strong>Design Assets</strong>: PNG, JPG, JPEG, WEBP, SVG.<br />• <strong>File Size Ceilings</strong>: Free tier up to 10MB per file; Pro and Business tiers up to 50MB per file."
            }
        ]
    },
    {
        "doc_id": "settings-privacy",
        "group_id": "management",
        "group_title_id": "Manajemen & Berkas",
        "group_title_en": "Files & Productivity",
        "title_id": "Pengaturan Akun, Mode Privasi Layar & Alat Fokus",
        "title_en": "Account Settings, Privacy Mode & Focus Tools",
        "desc_id": "Kustomisasi akun, preferensi tema & bahasa, Pomodoro timer, mode privasi presentasi (Screen-Share Privacy Mode), dan ekspor laporan CSV.",
        "desc_en": "Account customization, theme & language preferences, Pomodoro timer, Screen-Share Privacy Mode, and CSV report export.",
        "order_index": 12,
        "is_superadmin_only": 0,
        "see_also": ["overview", "security-governance", "pricing-tiers"],
        "sections": [
            {
                "id": "account-preferences",
                "title_id": "1. Profil, Preferensi Tema & Bahasa",
                "title_en": "1. Profile, Themes & Bilingual Support",
                "content_id": "Buka menu <strong>Pengaturan (<code>/settings</code>)</strong> untuk memperbarui profil akun, avatar, dan kata sandi. alurku. mendukung peralihan instan antara Tema Terang yang nyaman di mata dan Tema Gelap yang elegan, serta dukungan dwi-bahasa penuh (Bahasa Indonesia & English).",
                "content_en": "Navigate to <strong>Settings (<code>/settings</code>)</strong> to customize your profile, avatar, and security credentials. alurku. provides instant toggling between an eye-friendly Light Mode and an elegant Dark Mode, alongside comprehensive bilingual support (Indonesian & English)."
            },
            {
                "id": "screen-share-privacy",
                "title_id": "2. Mode Privasi Berbagi Layar (Screen-Share Privacy Mode)",
                "title_en": "2. Screen-Share Privacy Mode",
                "content_id": "Sering membagikan layar saat presentasi rapat Zoom atau Google Meet?<br />Aktifkan <strong>Mode Privasi Layar</strong> pada menu Pengaturan Akun. Saat aktif, seluruh judul tugas sensitif pada notifikasi pop-up akan otomatis disamarkan (<em>blurred</em>) sehingga informasi rahasia tidak bocor ke audiens.",
                "content_en": "Frequently sharing your screen in Zoom or Google Meet meetings?<br />Toggle <strong>Screen-Share Privacy Mode</strong> in Settings. Notification pop-ups automatically blur sensitive task titles, preventing accidental data leaks to viewers."
            },
            {
                "id": "pomodoro-and-export",
                "title_id": "3. Pomodoro Timer & Ekspor Laporan CSV",
                "title_en": "3. Pomodoro Timer & CSV Data Exports",
                "content_id": "• <strong>Widget Pomodoro Mengambang</strong>: Jalankan sesi fokus 25 menit di pojok layar untuk menyelesaikan tugas berprioritas tinggi tanpa terdistraksi.<br />• <strong>Ekspor CSV</strong>: Unduh seluruh data tugas proyek saat ini ke file Excel/CSV untuk pelaporan manajemen.",
                "content_en": "• <strong>Floating Pomodoro Timer</strong>: Launch 25-minute focus intervals at your screen corner to crush priority deliverables without interruptions.<br />• <strong>CSV Project Export</strong>: Download active project tasks into structured CSV/Excel reports for leadership audits."
            }
        ]
    },
    {
        "doc_id": "pricing-tiers",
        "group_id": "management",
        "group_title_id": "Manajemen & Berkas",
        "group_title_en": "Files & Productivity",
        "title_id": "Model Harga, Kuota & Paket Langganan",
        "title_en": "Pricing Plans, Quotas & Subscriptions",
        "desc_id": "Informasi paket langganan transparan sesuai halaman Harga (/harga): perbandingan paket Free, Pro, dan Business, serta batas kuota tim & AI.",
        "desc_en": "Transparent subscription tiers matching the official Pricing page (/harga): Free, Pro, and Business breakdown, quotas, and AI limits.",
        "order_index": 13,
        "is_superadmin_only": 0,
        "see_also": ["workspace", "attachments", "security-governance"],
        "sections": [
            {
                "id": "seat-model",
                "title_id": "1. Skema Paket Langganan Transparan",
                "title_en": "1. Transparent Subscription Structure",
                "content_id": "alurku. menerapkan skema paket langganan yang transparan dan fleksibel tanpa biaya tersembunyi. Anda dapat memulai secara gratis dan melakukan upgrade kapan saja sesuai perkembangan kebutuhan tim Anda melalui halaman <a href='/harga' class='text-amber-500 font-semibold underline'>Daftar Harga & Paket (/harga)</a>.",
                "content_en": "alurku. provides clear and transparent subscription tiers with no hidden fees. Start for free and upgrade as your team grows directly from the official <a href='/harga' class='text-amber-500 font-semibold underline'>Pricing Plans page (/harga)</a>."
            },
            {
                "id": "tier-breakdown",
                "title_id": "2. Perbandingan Fitur Antar-Paket Sesuai /harga",
                "title_en": "2. Plan Feature Breakdown Matching /harga",
                "content_id": "• <strong>Paket Gratis (Free)</strong>: Rp0 — 1 Workspace Aktif, maks. 3 Proyek Aktif, maks. 3 Anggota Tim, 500 MB Penyimpanan, 50 prompt Luruka AI / bulan, serta Papan Kanban & Kalender Dasar.<br /><br />• <strong>Paket Pro (Tim Profesional)</strong>: Mulai Rp79.000 / bulan (tahunan) atau Rp99.000 / bulan (bulanan) — 3 Workspace Aktif, Proyek Aktif Tanpa Batas, hingga 25 Anggota Tim, 15 GB Penyimpanan, 1.500 prompt Luruka AI / bulan, Lini Masa Gantt, Chat Workspace Terpadu, Analisis Beban Kerja (Workload), dan Ekspor Data CSV/Excel.<br /><br />• <strong>Paket Business (Skala Bisnis)</strong>: Mulai Rp199.000 / bulan (tahunan) atau Rp249.000 / bulan (bulanan) — Workspace, Proyek & Anggota Tanpa Batas, 100 GB Penyimpanan, 5.000 prompt Luruka AI / bulan, Kustom Alur Kerja & Tahapan, Hak Akses & Peran Kustom, Integrasi SSO / SAML, Audit Log Keamanan, Dasbor Admin Utama, dan Jaminan Uptime SLA 99.9%.",
                "content_en": "• <strong>Free Tier</strong>: Rp0 — 1 Active Workspace, up to 3 Active Projects, up to 3 Team Members, 500 MB Storage, 50 Luruka AI prompts / month, and Basic Kanban & Calendar.<br /><br />• <strong>Pro Tier (Professional Team)</strong>: From Rp79,000 / mo (annual) or Rp99,000 / mo (monthly) — 3 Active Workspaces, Unlimited Active Projects, up to 25 Team Members, 15 GB Storage, 1,500 Luruka AI prompts / month, Gantt Timeline, Unified Chat Workspace, Workload Analytics, and CSV/Excel Exports.<br /><br />• <strong>Business Tier</strong>: From Rp199,000 / mo (annual) or Rp249,000 / mo (monthly) — Unlimited Workspaces, Projects & Members, 100 GB Storage, 5,000 Luruka AI prompts / month, Custom Workflows & Stages, Custom Roles & Permissions, SSO / SAML Integration, Security Audit Logs, Main Admin Dashboard, and 99.9% Uptime SLA."
            }
        ]
    },
    {
        "doc_id": "security-governance",
        "group_id": "governance",
        "group_title_id": "Tata Kelola & Kepatuhan",
        "group_title_en": "Governance & Compliance",
        "title_id": "Tata Kelola Sistem, Keamanan & UU PDP",
        "title_en": "System Governance, Security & PDP Law Compliance",
        "desc_id": "Perlindungan data berstandar enterprise, kepatuhan UU PDP No. 27/2022, isolasi multitenant ketat, enkripsi TLS 1.3 & AES-256.",
        "desc_en": "Enterprise data protection, Indonesian PDP Law 2022 compliance, multi-tenant isolation, TLS 1.3 & AES-256 encryption.",
        "order_index": 14,
        "is_superadmin_only": 0,
        "see_also": ["workspace", "pricing-tiers", "settings-privacy"],
        "sections": [
            {
                "id": "pdp-compliance",
                "title_id": "1. Standar Kepatuhan Hukum & Enkripsi Data",
                "title_en": "1. Regulatory Compliance & Data Encryption",
                "content_id": "alurku. mematuhi ketentuan regulasi perlindungan data pribadi (<strong>UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi / UU PDP</strong>). Seluruh lalu lintas data dienkripsi dengan protokol <strong>TLS 1.3</strong> saat transit dan standar enkripsi <strong>AES-256</strong> saat tersimpan di basis data. Setiap Ruang Kerja menerapkan prinsip isolasi multitenant yang ketat untuk menjamin keamanan mutlak aset organisasi Anda.",
                "content_en": "alurku. fully complies with Indonesian personal data protection regulations (<strong>PDP Law No. 27/2022</strong>). All communications are encrypted in transit via <strong>TLS 1.3</strong> and at rest using <strong>AES-256</strong> encryption standards. Strict multi-tenant isolation ensures your organization's confidential workspace data remains securely partitioned."
            },
            {
                "id": "admin-console",
                "title_id": "2. Konsol Tata Kelola Superadmin (/admin)",
                "title_en": "2. Superadmin Governance Console (/admin)",
                "content_id": "Pemilik lisensi enterprise memiliki akses ke konsol <strong>Admin Sistem</strong> untuk memantau log audit keamanan, riwayat akses login, penggunaan kuota penyimpanan, dan status integritas sistem secara menyeluruh.",
                "content_en": "Enterprise license administrators access the <strong>System Admin Console</strong> to inspect security audit logs, authentication event histories, storage quota allocations, and system integrity telemetry."
            }
        ]
    }
]
