# Workspace Guidelines & Brand Book - alurku.

This document contains the complete visual identity, UI rules, brand message guidelines, and development constraints for the **alurku.** web app. All developers and AI agents must strictly adhere to these rules when modifying the codebase.

---

## 1. Brand Identity & Naming Guidelines
- **Product Name Spelling:** Always write the brand name as **`alurku.`** in lowercase.
- **Brand Colors:** The prefix `alur` is neutral (slate/white), and the suffix `ku` should be colored with brand yellow (`#FACC15` or `#EAB308`).
- **Logo Suffix:** Always append a period `.` to the logo name (e.g., `alurku.`).
- **Logo & Wordmark Styling:**
  - **Format:** All lowercase to appear friendly and accessible (B2C focus).
  - **Font:** Plus Jakarta Sans in Extra Bold.
  - **Colors:** "alur" is white/slate, and "ku" is Flat Yellow (`#FACC15`) to emphasize personal ownership ("my flow").
- **PWA App Icon (Monogram):**
  - **Concept:** A lowercase "a" inside a squircle (rounded square).
  - **Colors:** Flat Yellow (`#FACC15`) background with Deep Navy (`#111E38`) typography.

---

## 2. Global Development Directives
- **Default Language & Bilingual Support:** All pages must support 2 languages: Indonesian (ID) and English (EN). The application defaults to Indonesian on first load, with accessible switches to toggle between ID and EN.
- **Default Theme:** Light Theme. The application must render in Light Theme upon first load.
- **Homepage Base Styling:** The homepage design must utilize the Light Theme color palette (Calm Gray `#F3F4F6` background, Deep Navy `#111E38` primary text, Flat Yellow `#FACC15` accents).
- **Permalink & URL Ownership:** Every page (including auth pages like login, register, and password recovery) must own a dedicated, persistent permalink. Pages must only be rendered when the browser path matches their assigned permalink. Navigating away from a page must always restore the correct URL of the destination page. Refreshing the browser must never redirect the user to a different page than the one currently being viewed.
  - **Auth Page Permalinks (Indonesian):** `/masuk` (login), `/daftar` (register), `/lupa-sandi` (forgot password).
  - **Landing Page Permalinks (Indonesian):** `/` (homepage/beranda), `/fitur`, `/harga`, `/panduan`, `/tentang`, `/dokumentasi`.
  - **URL sync is bidirectional:** URL changes (popstate / browser back-forward) must update the UI state, and UI state changes (tab switch, auth form open/close) must update the URL.

---

## 3. UI/UX Design & Aesthetic Rules
- **Aesthetic Direction:** Premium, clean corporate startup SaaS design.
- **Design Philosophy:** Adopt a **Flat Design** approach that is clean, simple, and modern:
  - **Simple & Flat:** Avoid heavy gradients, soft-blurry shadows, or skeuomorphic effects. Use solid color blocks, crisp borders, and ample whitespace.
  - **Dynamic & Contrasting:** Combine stable Navy and energetic Yellow to create high contrast, ideal for distinguishing main workspaces and proactive AI-driven action elements.
  - **Calm & Eye-Friendly:** Use soft, calm backgrounds in light mode to prevent eye strain during prolonged use, eliminating harsh bright whites.
- **Mobile Friendly Optimization:** Every page, view, and form component must be optimized for mobile devices (using responsive design, touch-friendly layouts, and fluid grids).
- **Iconography Rule:** Always use **modern, simple, inline SVG icons** instead of old-fashioned/raw emojis for list elements, buttons, feature badges, and indicators. Emojis should be completely avoided in professional feature layouts.
- **Contrast & Legibility:** Never render light or yellow text on light backgrounds. Ensure a high-contrast dark color (like dark navy `#111E38` or slate-800) is used for maximum readability in Light Mode.
- **Capitalization:** Writing casing must be normal (e.g. Sentence case or Capitalize Each Word), avoiding overuse of full uppercase or dominant capitalization across page sections and headlines. Label text should use normal casing.
- **AI Persona & Tone of Voice:** The AI Assistant must communicate in a **casual, supportive, and friendly** tone. It acts as a helpful personal assistant, not a strict manager or robotic system.
  - **Pronouns:** Use "Aku" to refer to the AI and "Kamu" for the user (to build a personal, less formal connection in Indonesian).
  - **Microcopy:** Error messages, empty states, and AI suggestions should be encouraging (e.g., "Belum ada tugas nih, yuk buat satu!" instead of "No tasks found.").

---

## 4. Typography System (Fonts)
- **Primary Font:** Plus Jakarta Sans or Inter.
- **UI Typography Scale:**
  - Main Heading (Dashboard Title): 24px / Bold
  - Sub-heading (Section/Kanban Column): 16px / SemiBold
  - Body Text / Task Content: 14px / Regular
  - Meta Data / Tags: 12px / Medium

---

## 5. Color Palette Tokens

### A. Light Mode Color Palette
| UI Component | Color Name | Hex Code | Application Spec |
| :--- | :--- | :--- | :--- |
| **Primary Brand** | Deep Navy | `#111E38` | Sidebar, Header, Main Text |
| **Accent Action** | Flat Yellow | `#FACC15` | Primary Buttons, Active Status, AI Features |
| **Background** | Calm Gray | `#F3F4F6` | Base App Background (Anti-glare) |
| **Surface Card** | Off White | `#FAFAFA` | Task Cards, Kanban Columns |

### B. Dark Mode Color Palette
| UI Component | Color Name | Hex Code | Application Spec |
| :--- | :--- | :--- | :--- |
| **Primary Brand** | Deep Navy | `#111E38` | Logo Identity, Main Border Accents |
| **Accent Action** | Flat Yellow | `#FACC15` | CTA Buttons, Proactive AI Indicators |
| **Background** | Dark Navy Void | `#090D16` | Main Webapp Background |
| **Surface Card** | Navy Surface | `#121B2D` | Kanban Cards, Gantt Rows |

---

## 6. Core Value Propositions & Brand Messages

### A. Hero Section Copy
- **Hero Headline (H1):** `"Berhenti mengingat semua tugasmu, mulailah menyelesaikannya."` (Stop remembering all your tasks, start completing them.)
- **Sub-headline (H2/Paragraph):** `"alurku. adalah asisten cerdas yang mengubah tumpukan rencana kerjamu menjadi alur eksekusi yang rapi. Fokus pada hasil, biarkan AI kami yang mengatur jadwalnya."`
- **Primary Tagline:** `"Kuasai Waktumu, Lancarkan Alurmu."` (Master your time, smooth your flow.)

### B. Key Communication Pillars (Features to Benefits)
When designing features, translate system capabilities into user-centric benefits using the following structure:
- **Pillar 1: Automated AI Planning**
  - **Technical Feature:** AI Time Estimation & Scheduling
  - **UI Header:** Asisten Perencana Otomatis
  - **Body Copy:** `"Tidak yakin butuh waktu berapa lama untuk sebuah proyek? AI alurku. akan memprediksi durasi dan menyusun jadwal harianmu secara otomatis, sehingga kamu tidak perlu lagi menebak-nebak."`
- **Pillar 2: Workload Analytics**
  - **Technical Feature:** Workload Analytics & Distribution
  - **UI Header:** Kerja Seimbang, Anti-Kewalahan
  - **Body Copy:** `"Ketahui batas kapasitasmu dan timmu. alurku. memvisualisasikan beban kerja secara real time agar kamu bisa membagi tugas dengan adil, mencegah burnout, dan bisa istirahat tepat waktu."`
- **Pillar 3: Visual Workflow (Kanban & Gantt)**
  - **Technical Feature:** Real-time Kanban & Interactive Gantt
  - **UI Header:** Satu Layar untuk Semua Progres
  - **Body Copy:** `"Pantau jalan ceritamu dari awal hingga akhir proyek. Dengan tampilan yang bersih dan dinamis, kamu selalu tahu apa yang sedang dikerjakan, siapa yang mengerjakan, dan apa yang harus diselesaikan selanjutnya."`

### C. Homepage Call-to-Action (CTA) Strategy
- **Accent Contrast:** All CTA buttons must use the Flat Yellow (`#FACC15`) accent color with Deep Navy (`#111E38`) text for maximum contrast on the Light Theme background. The text must be action-oriented and inviting.
- **Primary CTA (Hero Section):** `"Mulai Rapikan alurku."` (or `"Mulai Rapikan Alurku"`)
- **Secondary CTA (Header/Navbar):** `"Coba Gratis"`

---

## 7. Competitive Analysis & Strategic Objectives
- **Competitors:**
  - **satutim.id** (Direct competitor with Indonesian localized target and package benchmarks).
  - **kanal.work** (Indonesian team/workflow collaboration competitor).
  - **notion.com** (Global benchmark for customizable workflows, wikis, and doc databases).
- **Core Objective:** To deliver and evolve features as powerful, customizable, and seamless as **notion.com**, while maintaining alurku.'s identity as a clean, automated, and workload-aware task assistant.

---

## 8. SEO & Crawler Compliance Standards
Every public landing page (such as Features, Pricing, Guides, About Us, and Documentation/White Paper pages) must strictly implement the following SEO features:
- **Dynamic Meta Headers:** Page-specific, unique, non-duplicate `<title>` and `<meta name="description">` must be injected on page mount.
- **Structured Data:** Appropriate JSON-LD Schema markup (e.g. `WebPage`, `AboutPage`, `TechArticle`) must be registered in `<head>`.
- **Hreflang Tags:** Alternate links for regional targeting must be provided (specifically targeting Indonesia region with both ID and EN versions):
  - `id-ID` for Indonesian language targeting.
  - `en-ID` for English language targeting.
- **GEO (Generative Engine Optimization):** Every public landing page must be optimized for AI search engines and LLM crawlers (e.g. Perplexity, ChatGPT Search, Gemini) by utilizing clean, authoritative structured content, semantic HTML5 tags, clear hierarchies, and rich JSON-LD structured data schema to maximize the likelihood of AI summaries and citations.
- **Canonical Self-References:** A `<link rel="canonical" href="...">` tag must be set pointing directly to the self-representative page path.
- **Cleanup:** All injected header elements (LD-JSON script tags, hreflangs, canonical links) must be cleanly removed from DOM when the user navigates away or the page unmounts to prevent DOM bloat.


