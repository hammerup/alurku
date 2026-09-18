"""
services/documentation_seed.py
Structured seed dataset for alurku. documentation database.
Contains 10 mature, comprehensive chapters covering all features, workflows,
command bar shortcuts, AI capabilities, and per-user seat pricing models.
"""

DOCUMENTATIONS_SEED = [
    {
        "doc_id": "overview",
        "group_id": "get-started",
        "group_title_id": "Mulai",
        "group_title_en": "Get Started",
        "title_id": "Ikhtisar alurku.",
        "title_en": "alurku. Overview",
        "desc_id": "Segala yang perlu Anda ketahui tentang alur kerja alurku., filosofi Flat UI, dan asisten kerja tim cerdas.",
        "desc_en": "Everything you need to know about alurku. workflow, Flat UI philosophy, and smart team workspace assistant.",
        "order_index": 1,
        "is_superadmin_only": 0,
        "see_also": ["workspace", "command-bar", "views-workflow"],
        "sections": [
            {
                "id": "what-is-alurku",
                "title_id": "Apa itu alurku.?",
                "title_en": "What is alurku.?",
                "content_id": "<strong>alurku.</strong> adalah platform manajemen alur kerja dan kolaborasi tim cerdas yang dirancang untuk mengubah tumpukan rencana kerjamu menjadi alur eksekusi yang rapi. Berbeda dari tools konvensional yang rumit dan melelahkan (<em>work sprawl</em>), alurku. mengusung filosofi <strong>Flat Design anti-glare</strong> dengan warna utama Deep Navy (<code>#111E38</code>) dan aksen Flat Yellow (<code>#FACC15</code>). Didukung asisten AI <strong>Luruka</strong> untuk mengestimasi durasi, memecah tugas otomatis, dan memprediksi beban kerja harian.",
                "content_en": "<strong>alurku.</strong> is an intelligent workflow and team collaboration platform designed to turn your work plans into smooth, actionable execution. Unlike cluttered tools causing work sprawl, alurku. adopts an anti-glare <strong>Flat Design</strong> with Deep Navy (<code>#111E38</code>) and energetic Flat Yellow (<code>#FACC15</code>). Powered by <strong>Luruka AI</strong> to forecast durations, break down tasks automatically, and balance daily workloads."
            },
            {
                "id": "core-pillars",
                "title_id": "Tiga Pilar Utama alurku.",
                "title_en": "Three Core Pillars of alurku.",
                "content_id": "1. <strong>Asisten Perencana Otomatis (Automated AI Planning)</strong>: Menghilangkan tebak-tebakan durasi proyek dan menyusun agenda harian secara instan.<br />2. <strong>Kerja Seimbang, Anti-Kewalahan (Workload Analytics)</strong>: Memvisualisasikan kapasitas jam kerja tim secara real-time untuk mencegah kejenuhan (<em>burnout</em>).<br />3. <strong>Satu Layar untuk Semua Progres (Visual Workflow)</strong>: Empat tampilan tersinkronisasi (Kanban, Timeline Gantt, Tabel, dan Kalender).",
                "content_en": "1. <strong>Automated AI Planning</strong>: Eliminates guesswork in task estimation and schedules daily agendas automatically.<br />2. <strong>Workload Analytics & Burnout Prevention</strong>: Real-time team capacity meters to distribute tasks fairly.<br />3. <strong>One Screen for All Progress</strong>: Four synchronized views (Kanban, Gantt Timeline, Table List, and Calendar)."
            }
        ]
    },
    {
        "doc_id": "workspace",
        "group_id": "get-started",
        "group_title_id": "Mulai",
        "group_title_en": "Get Started",
        "title_id": "Ruang Kerja (Workspace) & Peran",
        "title_en": "Workspaces & Team Roles",
        "desc_id": "Memahami hierarki Ruang Kerja, Papan Proyek, dan pembagian hak akses (Owner, Admin, Member, Viewer).",
        "desc_en": "Understanding the hierarchy of Workspaces, Project Boards, and permissions (Owner, Admin, Member, Viewer).",
        "order_index": 2,
        "is_superadmin_only": 0,
        "see_also": ["overview", "pricing-tiers"],
        "sections": [
            {
                "id": "workspace-hierarchy",
                "title_id": "Hierarki Ruang Kerja",
                "title_en": "Workspace Hierarchy",
                "content_id": "Struktur kerja alurku. terdiri dari 3 tingkat:<br />1. <strong>Workspace (Ruang Kerja)</strong>: Wadah tertinggi milik organisasi atau tim Anda. Paket langganan (Free/Pro/Business) melekat pada Workspace.<br />2. <strong>Project Board (Papan Proyek)</strong>: Ruang kolaborasi untuk inisiatif tertentu (misal: 'Redesign Web', 'Kampanye Q4').<br />3. <strong>Task (Tugas)</strong>: Unit kerja terkecil yang dilengkapi status, penanggung jawab, tenggat waktu, dan perkiraan jam kerja (ETC).",
                "content_en": "alurku. structure is divided into 3 levels:<br />1. <strong>Workspace</strong>: The top-level container owned by your team. Subscription plans attach directly to the Workspace.<br />2. <strong>Project Board</strong>: Specific initiative rooms (e.g. 'Web Redesign', 'Q4 Campaign').<br />3. <strong>Task</strong>: The unit of work with status, assignees, deadlines, and Estimated Time to Complete (ETC)."
            },
            {
                "id": "team-roles",
                "title_id": "Peran & Hak Akses Anggota",
                "title_en": "Roles & Access Control",
                "content_id": "• <strong>Owner (Pemilik)</strong>: Memiliki kontrol penuh atas workspace, penagihan paket (billing), penggantian nama, dan transfer kepemilikan.<br />• <strong>Admin</strong>: Dapat mengundang anggota, membuat proyek, mengatur peran, dan mengubah pengaturan tim.<br />• <strong>Member (Anggota)</strong>: Dapat membuat, mengedit, dan menyelesaikan tugas pada proyek yang diikutinya.<br />• <strong>Viewer (Tamu Pengawas)</strong>: Hak akses baca (<em>Read-Only</em>) khusus klien atau auditor tanpa izin mengubah data.",
                "content_en": "• <strong>Owner</strong>: Full control over the workspace, billing, renaming, and ownership transfer.<br />• <strong>Admin</strong>: Can invite team members, create projects, adjust member roles, and manage team settings.<br />• <strong>Member</strong>: Can create, edit, and complete tasks in assigned boards.<br />• <strong>Viewer</strong>: Read-Only guest mode ideal for clients and auditors without modification rights."
            }
        ]
    },
    {
        "doc_id": "command-bar",
        "group_id": "features",
        "group_title_id": "Fitur Utama",
        "group_title_en": "Core Features",
        "title_id": "Command Bar Quick-Add (Cmd/Ctrl + K)",
        "title_en": "Command Bar Quick-Add (Cmd/Ctrl + K)",
        "desc_id": "Panduan membuat tugas instan dengan Natural Language Parsing (NLP) dan navigasi cepat keyboard sekelas Linear.",
        "desc_en": "Guide to instant task creation with local Natural Language Parsing (NLP) and keyboard shortcuts ala Linear.",
        "order_index": 3,
        "is_superadmin_only": 0,
        "see_also": ["overview", "views-workflow"],
        "sections": [
            {
                "id": "how-to-open",
                "title_id": "Cara Membuka Command Bar",
                "title_en": "Opening the Command Bar",
                "content_id": "Tekan <code>Ctrl + K</code> (Windows/Linux) atau <code>Cmd + K</code> (macOS) dari halaman mana saja di aplikasi, atau klik badge <strong>⌘K</strong> di samping bilah pencarian header.",
                "content_en": "Press <code>Ctrl + K</code> (Windows/Linux) or <code>Cmd + K</code> (macOS) from any screen, or click the <strong>⌘K</strong> badge next to the header search bar."
            },
            {
                "id": "nlp-syntax",
                "title_id": "Format Sintaks Natural Language Parsing (NLP)",
                "title_en": "Natural Language Parsing Syntax",
                "content_id": "Anda dapat mengetik satu kalimat langsung tanpa mengisi formulir bertahap. Sistem akan memisahkan parameter secara otomatis:<br /><br />• <strong>Prioritas</strong>: Gunakan <code>p:urgent</code>, <code>p:high</code>, <code>p:low</code>, atau <code>!tinggi</code>, <code>!mendesak</code>.<br />• <strong>Tenggat Waktu</strong>: Gunakan <code>due:tomorrow</code>, <code>due:today</code>, <code>tgl:besok</code>, <code>tgl:lusa</code>, atau format <code>YYYY-MM-DD</code>.<br />• <strong>Penanggung Jawab</strong>: Ketik <code>@username</code> untuk menugaskan anggota tim aktif.<br />• <strong>Proyek Tujuan</strong>: Ketik <code>#nama-proyek</code> untuk memasukkan tugas ke papan tertentu.<br /><br /><strong>Contoh Input</strong>: <code>Perbaiki bug checkout p:urgent due:tomorrow @eko #mobile-app</code><br />Tekan <strong>Enter ↵</strong> untuk langsung menyimpan tugas.",
                "content_en": "Type a single sentence and the system will extract parameters automatically without opening forms:<br /><br />• <strong>Priority</strong>: Use <code>p:urgent</code>, <code>p:high</code>, <code>p:low</code>, or <code>!urgent</code>, <code>!high</code>.<br />• <strong>Due Date</strong>: Use <code>due:tomorrow</code>, <code>due:today</code>, <code>tgl:besok</code>, or <code>YYYY-MM-DD</code>.<br />• <strong>Assignee</strong>: Type <code>@username</code> to assign to active workspace members.<br />• <strong>Target Board</strong>: Type <code>#project-name</code> to assign to a specific project.<br /><br /><strong>Example</strong>: <code>Fix checkout bug p:urgent due:tomorrow @eko #mobile-app</code><br />Press <strong>Enter ↵</strong> to save instantly."
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
        "desc_id": "Panduan lengkap memanfaatkan Kanban, Gantt Timeline, Workload Analytics, dan Kalender Proyek.",
        "desc_en": "Comprehensive guide to leveraging Kanban, Gantt Timeline, Workload Analytics, and Calendar views.",
        "order_index": 4,
        "is_superadmin_only": 0,
        "see_also": ["command-bar", "workload-analytics"],
        "sections": [
            {
                "id": "kanban-view",
                "title_id": "1. Papan Kanban Interaktif",
                "title_en": "1. Interactive Kanban Board",
                "content_id": "Papan Kanban mengelompokkan tugas ke dalam kolom status (Pending, In Progress, Done, dll.). Anda dapat menarik dan melepaskan (<em>drag-and-drop</em>) kartu tugas secara halus untuk mengubah status pekerjaan.",
                "content_en": "Kanban columns organize tasks by status (Pending, In Progress, Done, etc.). Smooth drag-and-drop allows effortless state transitions."
            },
            {
                "id": "gantt-view",
                "title_id": "2. Lini Masa Gantt Chart (Pro)",
                "title_en": "2. Gantt Timeline View (Pro)",
                "content_id": "Tersedia di Paket Pro. Menampilkan rentang tanggal mulai hingga deadline dalam tampilan batang horizontal. Membantu tim melihat ketergantungan antar-tugas dan memprediksi jalur kritis proyek.",
                "content_en": "Available in Pro plan. Displays start-to-deadline schedules as horizontal bars to identify task dependencies and critical project paths."
            },
            {
                "id": "workload-view",
                "title_id": "3. Analisis Beban Kerja & Kapasitas (Pro)",
                "title_en": "3. Workload Capacity & Health (Pro)",
                "content_id": "Tersedia di Paket Pro. Mengukur akumulasi jam estimasi (ETC) setiap anggota tim terhadap jam kerja standar (8 jam/hari atau 40 jam/minggu). Kartu anggota akan menyala merah jika mendekati batas kelelahan (*burnout alert*).",
                "content_en": "Available in Pro plan. Sums up Estimated Time to Complete (ETC) per member against standard thresholds (8 hrs/day or 40 hrs/week) with proactive burnout alerts."
            },
            {
                "id": "calendar-view",
                "title_id": "4. Kalender Proyek & Cuti",
                "title_en": "4. Project Calendar & Schedule",
                "content_id": "Menampilkan jadwal tenggat waktu tugas berdampingan dengan tanggal cuti dan libur nasional, memastikan estimasi target realistis.",
                "content_en": "Displays project deadlines side-by-side with team leaves and national holidays to keep delivery targets realistic."
            }
        ]
    },
    {
        "doc_id": "ai-planning",
        "group_id": "features",
        "group_title_id": "Fitur Utama",
        "group_title_en": "Core Features",
        "title_id": "Asisten Cerdas Luruka AI",
        "title_en": "Luruka AI Assistant & Planning",
        "desc_id": "Mengenal Luruka AI untuk breakdown tugas otomatis, estimasi waktu, failover ganda, dan smart auto-nudges.",
        "desc_en": "Meet Luruka AI for automated task breakdown, duration forecasting, dual failover, and smart auto-nudges.",
        "order_index": 5,
        "is_superadmin_only": 0,
        "see_also": ["workload-analytics", "overview"],
        "sections": [
            {
                "id": "ai-persona",
                "title_id": "Persona & Gaya Komunikasi Luruka",
                "title_en": "Luruka Persona & Tone of Voice",
                "content_id": "Luruka adalah asisten pribadi yang ramah, suportif, dan menggunakan kata ganti <em>'Aku'</em> dan <em>'Kamu'</em>. Luruka bukan bos yang kaku, melainkan partner kerja yang membantu Anda tetap fokus dan teratur.",
                "content_en": "Luruka is a friendly, supportive assistant that communicates informally and helpfully, acting as a personal productivity partner rather than a rigid boss."
            },
            {
                "id": "ai-features",
                "title_id": "Kemampuan Utama AI",
                "title_en": "Core AI Capabilities",
                "content_id": "• <strong>Auto Task Breakdown</strong>: Memecah tugas besar menjadi 3-5 subtask logis dan terukur.<br />• <strong>Time Duration Estimator</strong>: Memperkirakan waktu pengerjaan (ETC) berdasarkan deskripsi tugas.<br />• <strong>Daily Standup Summary</strong>: Merangkum apa yang selesai kemarin dan apa yang perlu dikerjakan hari ini.<br />• <strong>High-Availability Failover</strong>: Didukung arsitektur ganda Gemini 2.5 Flash + Groq Llama 3.3 70B.",
                "content_en": "• <strong>Auto Task Breakdown</strong>: Splits large tasks into 3-5 actionable subtasks.<br />• <strong>Time Duration Estimator</strong>: Predicts Estimated Time to Complete (ETC) from task descriptions.<br />• <strong>Daily Standup Summary</strong>: Summarizes completed tasks and sets daily priorities.<br />• <strong>High-Availability Dual Failover</strong>: Backed by Gemini 2.5 Flash + Groq Llama 3.3 70B."
            }
        ]
    },
    {
        "doc_id": "workload-analytics",
        "group_id": "features",
        "group_title_id": "Fitur Utama",
        "group_title_en": "Core Features",
        "title_id": "Analisis Beban Kerja & Kapasitas Tim",
        "title_en": "Workload Analytics & Balance",
        "desc_id": "Metrik kapasitas kerja, pencegahan burnout tim, dan pembagian tugas yang adil.",
        "desc_en": "Capacity metrics, burnout prevention alerts, and equitable task distribution.",
        "order_index": 6,
        "is_superadmin_only": 0,
        "see_also": ["views-workflow", "leaves-calendar"],
        "sections": [
            {
                "id": "burnout-thresholds",
                "title_id": "Ambang Batas Kelebihan Beban (Overload)",
                "title_en": "Overload Thresholds",
                "content_id": "Setiap anggota tim memiliki kuota standar 40 jam kerja aktif per minggu. Jika total akumulasi ETC tugas aktif melebihi 40 jam atau 160 jam per bulan, sistem akan menandai status <strong>Overload</strong> dan menampilkan badge peringatan.",
                "content_en": "Each member has a standard 40-hour weekly threshold. When cumulative active task ETC exceeds 40 hours weekly or 160 hours monthly, the system triggers an <strong>Overload Alert</strong>."
            },
            {
                "id": "rebalancing-workload",
                "title_id": "Cara Menyeimbangkan Beban Kerja",
                "title_en": "Rebalancing Workload",
                "content_id": "Pada tab Workload Analytics, manajer proyek dapat menarik kartu tugas dari anggota yang sedang merah (overload) dan meletakkannya ke anggota lain yang masih memiliki kapasitas luang.",
                "content_en": "In the Workload Analytics tab, project managers can drag task cards from overloaded members directly onto peers with open capacity."
            }
        ]
    },
    {
        "doc_id": "pricing-tiers",
        "group_id": "advanced",
        "group_title_id": "Lanjutan & Akun",
        "group_title_en": "Advanced & Accounts",
        "title_id": "Paket Lisensi & Model Per User / Seat",
        "title_en": "Pricing Plans & Per-User Seats",
        "desc_id": "Perbandingan kuota paket Free, Pro, dan Business, serta cara kerja lisensi berbasis Ruang Kerja.",
        "desc_en": "Comparison of Free, Pro, and Business tiers, and how workspace-based seats operate.",
        "order_index": 7,
        "is_superadmin_only": 0,
        "see_also": ["workspace", "task-attachments"],
        "sections": [
            {
                "id": "per-seat-model",
                "title_id": "Cara Kerja Lisensi Per-Seat",
                "title_en": "How Per-Seat Licensing Works",
                "content_id": "Paket Pro dan Business dibeli untuk <strong>sebuah Workspace</strong>. Pemilik workspace membayar sesuai jumlah kursi/anggota di dalamnya. Rekan tim yang diundang <strong>tidak perlu membayar</strong> dan otomatis menikmati fitur Pro di workspace tersebut.",
                "content_en": "Pro and Business plans attach to a <strong>Workspace</strong>. The workspace owner pays per seat. Invited team members <strong>do not pay</strong> and immediately enjoy Pro features within that workspace."
            },
            {
                "id": "tier-comparison",
                "title_id": "Rincian Kuota Paket",
                "title_en": "Plan Quota Breakdown",
                "content_id": "• <strong>Gratis (Starter)</strong>: Rp 0 selamanya. Maks. 1 Workspace Pribadi, 3 Anggota Tim, 3 Proyek Aktif, 500 MB Storage, 50 AI Prompts/bulan.<br />• <strong>Pro (Agile Team)</strong>: Rp 99.000 / user / bulan (Rp 79.000 jika tahunan). Hingga 3 Workspace Pribadi, 25 Anggota Tim, Proyek Tanpa Batas, 15 GB Storage, 1.500 AI Prompts/user/bulan, Gantt Chart & Workload.<br />• <strong>Business (Scale)</strong>: Rp 249.000 / user / bulan. Unlimited Anggota & Proyek, 100 GB Storage, 5.000 AI Prompts/user/bulan, Custom Roles & Audit Logs.",
                "content_en": "• <strong>Free (Starter)</strong>: $0 forever. Max 1 Workspace, 3 Members, 3 Projects, 500 MB Storage, 50 AI Prompts/mo.<br />• <strong>Pro (Agile Team)</strong>: Rp 99.000 / user / mo (Rp 79.000 annual). Up to 3 Workspaces, 25 Members, Unlimited Projects, 15 GB Storage, 1,500 AI Prompts/user/mo, Gantt & Workload.<br />• <strong>Business (Scale)</strong>: Rp 249.000 / user / mo. Unlimited Members & Projects, 100 GB Storage, 5,000 AI Prompts/user/mo, Custom Roles & Audit Logs."
            }
        ]
    },
    {
        "doc_id": "task-attachments",
        "group_id": "advanced",
        "group_title_id": "Lanjutan & Akun",
        "group_title_en": "Advanced & Accounts",
        "title_id": "Manajemen File & Lampiran Tugas",
        "title_en": "File & Attachment Management",
        "desc_id": "Panduan upload dokumen, thumbnail preview, dan arsitektur penyimpanan dual-engine.",
        "desc_en": "Guide to document uploads, thumbnail previews, and dual-engine storage architecture.",
        "order_index": 8,
        "is_superadmin_only": 0,
        "see_also": ["pricing-tiers", "workspace"],
        "sections": [
            {
                "id": "upload-limits",
                "title_id": "Kapasitas & Batasan File",
                "title_en": "Storage Capacity & Limits",
                "content_id": "Kartu tugas mendukung unggahan file langsung melalui area drag-and-drop. Format yang didukung meliputi PDF, dokumen (DOCX, XLSX), gambar (PNG, JPG, SVG), dan arsip ZIP. Maksimal ukuran per file adalah 25 MB.",
                "content_en": "Task cards support drag-and-drop file uploads for PDFs, documents (DOCX, XLSX), images (PNG, JPG, SVG), and ZIP archives. Maximum size per file is 25 MB."
            },
            {
                "id": "dual-storage",
                "title_id": "Arsitektur Dual-Engine Storage",
                "title_en": "Dual-Engine Storage Architecture",
                "content_id": "alurku. menggunakan adapter penyimpanan pintar yang otomatis memilih penyimpanan lokal aman untuk lingkungan development dan Cloudflare R2 / S3 Object Storage untuk server produksi.",
                "content_en": "alurku. features a smart storage adapter that seamlessly routes files to secure local disk in development and Cloudflare R2 / S3 in production."
            }
        ]
    },
    {
        "doc_id": "leaves-calendar",
        "group_id": "advanced",
        "group_title_id": "Lanjutan & Akun",
        "group_title_en": "Advanced & Accounts",
        "title_id": "Pengelolaan Cuti & Hari Libur (/leaves)",
        "title_en": "Leave Management & Holidays (/leaves)",
        "desc_id": "Cara mengajukan cuti personal, memantau libur nasional, dan sinkronisasi kapasitas tim.",
        "desc_en": "How to file personal leaves, track holidays, and sync team delivery capacity.",
        "order_index": 9,
        "is_superadmin_only": 0,
        "see_also": ["workload-analytics", "views-workflow"],
        "sections": [
            {
                "id": "leave-types",
                "title_id": "Jenis Cuti & Pengajuan",
                "title_en": "Leave Types & Requests",
                "content_id": "Halaman <code>/leaves</code> memungkinkan anggota mengajukan Cuti Tahunan, Sakit, atau Izin Pribadi. Admin workspace dapat menambahkan Hari Libur Nasional atau Cuti Bersama yang langsung memblokir kalender seluruh anggota.",
                "content_en": "The <code>/leaves</code> hub allows members to file Annual, Sick, or Personal leaves. Admins can register Public Holidays which automatically reflect on all team calendars."
            }
        ]
    },
    {
        "doc_id": "security-privacy",
        "group_id": "governance",
        "group_title_id": "Tata Kelola & Kepatuhan",
        "group_title_en": "Governance & Compliance",
        "title_id": "Keamanan Data & Kepatuhan UU PDP 2022",
        "title_en": "Data Security & PDP Law Compliance",
        "desc_id": "Prinsip perlindungan data pribadi, enkripsi, isolasi multitenant, dan AI zero data retention.",
        "desc_en": "Principles of data privacy, encryption, multi-tenant isolation, and AI zero data retention.",
        "order_index": 10,
        "is_superadmin_only": 0,
        "see_also": ["workspace", "pricing-tiers"],
        "sections": [
            {
                "id": "pdp-compliance",
                "title_id": "Kepatuhan Hukum & Privasi",
                "title_en": "Legal & Privacy Standards",
                "content_id": "alurku. patuh pada Undang-Undang Perlindungan Data Pribadi (UU No. 27 Tahun 2022). Data Anda dienkripsi saat transit (TLS 1.3) dan saat diam (AES-256). Setiap Workspace diisolasi secara ketat sehingga data tidak dapat diakses oleh pihak luar.",
                "content_en": "alurku. strictly adheres to Indonesian PDP Law (UU No. 27/2022). All data is encrypted in transit (TLS 1.3) and at rest (AES-256) with full multi-tenant isolation."
            },
            {
                "id": "zero-retention",
                "title_id": "AI Zero Data Retention",
                "title_en": "AI Zero Data Retention",
                "content_id": "Permintaan AI yang diproses oleh Luruka tidak pernah disimpan atau digunakan untuk melatih model publik LLM eksternal. Privasi dan kerahasiaan proyek tim Anda terjamin 100%.",
                "content_en": "AI prompts processed by Luruka are never stored or used to train external LLM models. Your team's project confidentiality is 100% preserved."
            }
        ]
    }
]
