import React, { useState } from 'react';
import { useSEO } from '../../hooks/useSEO';
import {
  HeartPulse,
  ShieldCheck,
  Scale,
  Sparkles,
  Users2,
  Lock,
  ChevronDown,
  Mail,
  MapPin,
  Building2,
  CheckCircle2,
  Layers,
  BarChart3,
  Award,
} from 'lucide-react';

export default function LandingAboutPage({ language }) {
  const t = (en, id) => (language === 'id' ? id : en);

  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 50, y: 50 });
  };

  // SEO configuration with authoritative schema
  useSEO({
    title: t('About Us - Mission & Workload Philosophy', 'Tentang Kami - Misi & Filosofi Kerja Seimbang'),
    description: t(
      'Discover alurku.\'s company mission: human-centric project orchestration, workload-aware scheduling, ethical AI assistance, and enterprise-grade data privacy.',
      'Pelajari misi alurku.: orkestrasi proyek ramah manusia, penjadwalan sadar beban kerja, asisten AI etis, dan privasi data berstandar enterprise.'
    ),
    path: '/tentang',
    schemaData: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": t("About alurku. - Modern Work Orchestration", "Tentang alurku. - Platform Alur Kerja Modern"),
      "description": t(
        "alurku. is an intelligent, workload-aware project orchestration platform that protects teams from burnout while accelerating delivery.",
        "alurku. adalah platform orkestrasi proyek cerdas yang sadar beban kerja untuk melindungi tim dari kejenuhan kerja serta mempercepat pencapaian target."
      ),
      "url": typeof window !== 'undefined' ? `${window.location.origin}/tentang` : "https://alurku.com/tentang",
      "inLanguage": language === 'id' ? 'id-ID' : 'en-US',
      "mainEntity": {
        "@type": "Organization",
        "name": "alurku.",
        "url": typeof window !== 'undefined' ? window.location.origin : "https://alurku.com",
        "logo": typeof window !== 'undefined' ? `${window.location.origin}/favicon.png` : "https://alurku.com/favicon.png",
        "foundingLocation": {
          "@type": "Place",
          "name": "Jakarta, Indonesia"
        },
        "knowsAbout": [
          "Team Workload Analytics",
          "Visual Project Management",
          "Proactive AI Planning",
          "Kanban & Gantt Timeline",
          "Enterprise Data Protection"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "contact@alurku.com",
          "contactType": "Customer Support",
          "areaServed": "ID",
          "availableLanguage": ["Indonesian", "English"]
        }
      }
    }
  });

  return (
    <div className="bg-[#f8f9ff] text-slate-900 dark:bg-neutral-950 dark:text-white transition-colors duration-200">
      <style>{`
        .hero-gradient {
            background: radial-gradient(circle at 50% 50%, rgba(212, 227, 255, 0.4) 0%, rgba(248, 249, 255, 0) 70%);
        }
        .dark .hero-gradient {
            background: radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.6) 0%, rgba(9, 13, 22, 0) 70%);
        }
      `}</style>

      {/* Section 1: Hero & Vision */}
      <section className="relative min-h-[520px] flex items-center justify-center text-center px-6 overflow-hidden py-20 md:py-28">
        <div className="hero-gradient absolute inset-0 -z-10"></div>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#e5eeff] dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700/60 rounded-full text-[#111E38] dark:text-amber-400 font-bold text-xs uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t("Our Mission & Heritage", "Misi & Dedikasi Kami")}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#111E38] dark:text-white tracking-tight leading-[1.15]">
            {t(
              "Building Sustainable Workspaces for High-Performing Teams",
              "Membangun Ruang Kerja yang Berkelanjutan untuk Tim Berkinerja Tinggi"
            )}
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            {t(
              "alurku. was born from a fundamental premise: true productivity does not stem from relentless pressure, chaotic notification sprawl, or sleepless sprints. It emerges when technology respects human cognitive capacity and provides clarity, structure, and balance.",
              "alurku. lahir dari keyakinan mendasar: produktivitas sejati tidak pernah berasal dari tekanan berlebihan, kekacauan notifikasi yang melelahkan, atau lembur tanpa henti. Produktivitas sejati lahir saat teknologi menghargai kapasitas kognitif manusia dengan menghadirkan kejelasan, keteraturan, dan keseimbangan alur kerja."
            )}
          </p>

          <div className="pt-6 flex justify-center">
            <a
              href="#philosophy"
              className="p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-[#111E38] dark:hover:text-amber-400 transition-colors animate-bounce cursor-pointer"
              aria-label={t("Scroll to philosophy", "Gulir ke bagian filosofi")}
            >
              <ChevronDown className="w-6 h-6" />
            </a>
          </div>
        </div>
      </section>

      {/* Section 2: Story, Brand Philosophy & Name Origin */}
      <section
        id="philosophy"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative py-20 md:py-32 px-6 overflow-hidden bg-[#0d172b] dark:bg-[#090D16] border-y border-slate-800"
      >
        {/* Glow Torch (Follows Cursor) */}
        <div
          className="absolute w-96 h-96 rounded-full bg-[#FACC15]/20 blur-[130px] pointer-events-none z-10"
          style={{
            left: `${mousePos.x}%`,
            top: `${mousePos.y}%`,
            transform: 'translate(-50%, -50%)',
            transition: isHovered ? 'left 0.15s ease-out, top 0.15s ease-out' : 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
        {/* Ambient Dark Background Accents */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d172b]/80 via-transparent to-[#0d172b]/80 dark:from-[#090D16]/80 dark:via-transparent dark:to-[#090D16]/80 pointer-events-none"></div>
        <div className="absolute left-[5%] bottom-[10%] w-72 h-72 rounded-full bg-sky-500/10 blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
          {/* Main Story Narrative (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-8 bg-white/5 dark:bg-neutral-900/40 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-white/10 shadow-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FACC15]/20 border border-[#FACC15]/30 text-[#FACC15] text-xs font-bold uppercase tracking-wider">
              {t("The Narrative Behind alurku.", "Kisah di Balik alurku.")}
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {t("Why We Exist: From Work Chaos to Calm Execution", "Mengapa Kami Hadir: Mengubah Kekacauan Menjadi Alur Eksekusi yang Tenang")}
            </h2>

            <div className="space-y-5 text-slate-200 leading-relaxed font-normal text-base md:text-lg">
              <p>
                {t(
                  "Every day, modern teams lose hundreds of hours juggling fractured tools—switching from disconnected chats to rigid spreadsheets and overwhelming task trackers. Rather than assisting people in achieving meaningful results, work technology has inadvertently bred \"work sprawl\" and chronic alert fatigue.",
                  "Setiap hari, tim modern kehilangan ratusan jam berharga karena terpecah di berbagai aplikasi—berpindah dari grup obrolan yang bising ke lembar kerja yang kaku dan daftar tugas yang menumpuk. Alih-alih membantu menyelesaikan target utama, alat kerja konvensional justru memicu keletihan alat (work sprawl) dan kelelahan mental."
                )}
              </p>

              <p>
                {t(
                  "The name alurku. represents personal ownership of clarity: giving every organization and professional the right to control their own rhythmic execution flow (\"My Flow\"). In Indonesian, \"alur\" signifies an unbroken narrative, a natural stream where every milestone progresses smoothly without friction.",
                  "Nama alurku. mencerminkan kepemilikan sejati atas ketenangan kerja: memberikan setiap organisasi dan individu hak untuk menguasai alur kerjanya sendiri (\"My Flow\"). Kata \"alur\" melambangkan jalan cerita yang runtut dan aliran yang mengalir tanpa hambatan dari awal hingga akhir."
                )}
              </p>

              <p>
                {t(
                  "Guided by our core motto, \"Master Your Time, Streamline Your Flow\", we engineered alurku. around human capacity thresholds. Instead of measuring success purely by speed, we focus on balanced throughput, sustainable work-hours, and calm execution.",
                  "Berpijak pada motto utama kami, \"Kuasai Waktumu, Lancarkan Alurmu\", alurku. dibangun dengan memperhitungkan batas kapasitas energi manusia. Kami tidak sekadar mengejar kecepatan semu, melainkan memastikan pekerjaan selesai tepat waktu dengan beban tim yang seimbang dan terlindungi dari kelelahan kerja."
                )}
              </p>
            </div>

            <div className="p-6 bg-[#121c32] dark:bg-neutral-950/80 rounded-xl border-l-4 border-[#FACC15]">
              <h4 className="text-xs font-bold text-[#FACC15] uppercase tracking-widest mb-1.5">
                {t("Our Core Axiom", "Prinsip Utama Kami")}
              </h4>
              <p className="text-base md:text-lg italic text-white font-medium leading-relaxed">
                {t(
                  "\"High standards require high endurance. Protecting the mental health and balance of your team is not a perk—it is the prerequisite of long-term market leadership.\"",
                  "\"Kualitas kerja yang tinggi membutuhkan stamina jangka panjang. Menjaga keseimbangan dan kesehatan kerja tim Anda bukanlah fasilitas sampingan—melainkan syarat mutlak untuk memenangkan persaingan bisnis.\""
                )}
              </p>
            </div>
          </div>

          {/* Value Highlights Showcase (Right 5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/5 dark:bg-neutral-900/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
              <div className="w-12 h-12 bg-[#FACC15]/20 rounded-xl flex items-center justify-center text-[#FACC15] mb-5">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {t("Workload-Aware by Design", "Dirancang Sadar Beban Kerja")}
              </h3>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed font-normal">
                {t(
                  "Unlike typical task software that accepts infinite assignments without warning, alurku. measures estimated hours against standard 40-hour weekly thresholds, alerting managers before burnout occurs.",
                  "Berbeda dari aplikasi manajemen tugas biasa yang membiarkan tugas ditumpuk tanpa batas, alurku. mengukur estimasi jam kerja terhadap batas standar 40 jam per minggu, memberi peringatan dini sebelum tim mengalami kejenuhan kerja."
                )}
              </p>
            </div>

            <div className="bg-white/5 dark:bg-neutral-900/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
              <div className="w-12 h-12 bg-sky-400/20 rounded-xl flex items-center justify-center text-sky-400 mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {t("Proactive, Not Intrusive AI", "AI Proaktif & Suportif")}
              </h3>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed font-normal">
                {t(
                  "Luruka AI doesn't dictate commands; it assists as an empathetic workspace partner. It automates daily morning briefings, calculates task durations, and decomposes daunting milestones into manageable subtasks.",
                  "Luruka AI tidak bertindak seperti sistem yang kaku, melainkan asisten cerdas yang suportif. Ia merangkum prioritas harian setiap pagi, memprediksi durasi tugas, dan memecah proyek rumit menjadi langkah eksekusi yang realistis."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Core Operating Principles (Values) */}
      <section className="py-20 md:py-28 bg-[#f8f9ff] dark:bg-neutral-950 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="px-3.5 py-1 bg-amber-100 dark:bg-amber-400/10 text-amber-800 dark:text-amber-400 rounded-full text-xs font-bold uppercase tracking-widest">
              {t("Operating Principles", "Prinsip Operasional")}
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-[#111E38] dark:text-white tracking-tight">
              {t("Our Core Values", "Nilai-Nilai Utama Kami")}
            </h2>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
              {t(
                "These foundational values govern every feature decision, user experience interaction, and line of code we ship.",
                "Prinsip fundamental ini memandu setiap keputusan desain produk, arsitektur sistem, dan baris kode yang kami kembangkan."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-400/80 dark:hover:border-amber-400/80 transition-all duration-300 space-y-5">
              <div className="w-14 h-14 bg-amber-400/15 text-amber-600 dark:text-amber-400 flex items-center justify-center rounded-xl">
                <HeartPulse className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#111E38] dark:text-white">
                {t("Human-Centric Innovation", "Inovasi Ramah Manusia")}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed font-normal">
                {t(
                  "We believe technology must adapt to organic human behavior, not force employees to bend to mechanical rigidity. Our interfaces reduce cognitive strain, avoid aggressive red flags, and cultivate focus.",
                  "Kami percaya teknologi harus beradaptasi dengan ritme kerja alami manusia, bukan memaksa karyawan menyesuaikan diri pada sistem yang kaku. Seluruh antarmuka alurku. dirancang untuk meminimalkan beban pikiran dan menjaga ketenangan fokus kerja."
                )}
              </p>
            </div>

            {/* Value 2 */}
            <div className="p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-400/80 dark:hover:border-amber-400/80 transition-all duration-300 space-y-5">
              <div className="w-14 h-14 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center rounded-xl">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#111E38] dark:text-white">
                {t("Radical Privacy & Trust", "Privasi Mutlak & Transparansi")}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed font-normal">
                {t(
                  "Trust is the cornerstone of collaboration. We adhere to Indonesian PDP Law standards, enforce end-to-end encryption, and guarantee zero retention of confidential company data in external AI training sets.",
                  "Kepercayaan adalah fondasi kerja sama jangka panjang. Kami mematuhi regulasi UU PDP No. 27/2022, menerapkan enkripsi data yang ketat, dan menjamin dokumen ruang kerja Anda tidak pernah digunakan untuk melatih model AI publik."
                )}
              </p>
            </div>

            {/* Value 3 */}
            <div className="p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-400/80 dark:hover:border-amber-400/80 transition-all duration-300 space-y-5">
              <div className="w-14 h-14 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center rounded-xl">
                <Users2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#111E38] dark:text-white">
                {t("Sustainable Team Growth", "Pertumbuhan Berkelanjutan")}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed font-normal">
                {t(
                  "True company scale requires sustainable velocity. We empower leaders to distribute responsibilities fairly, respect leave schedules, and build resilient organizations where team members thrive over years.",
                  "Pertumbuhan bisnis yang hebat membutuhkan ritme kerja yang sehat. Kami membantu para manajer mendistribusikan tanggung jawab secara adil, menghormati jadwal cuti tim, dan membangun organisasi yang tangguh tanpa mengorbankan kesejahteraan anggotanya."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Enterprise Engineering Foundation & Standards */}
      <section className="py-20 md:py-32 bg-[#111E38] text-white px-6 overflow-hidden relative border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="max-w-3xl space-y-4">
            <span className="px-3.5 py-1 bg-amber-400/20 text-[#FACC15] rounded-full text-xs font-bold uppercase tracking-widest">
              {t("Platform Architecture", "Arsitektur Platform")}
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {t("Engineered for Reliability, Governance & Speed", "Direkayasa untuk Keandalan, Tata Kelola & Kecepatan")}
            </h2>
            <p className="text-slate-300 text-base md:text-lg font-normal leading-relaxed">
              {t(
                "alurku. is architected from the ground up as a production-grade enterprise platform, uniting real-time collaboration with stringent governance, data sovereignty, and performance.",
                "alurku. dirancang sejak awal sebagai platform enterprise yang tangguh, menggabungkan kolaborasi tim waktu-nyata dengan tata kelola data yang ketat, kedaulatan informasi, dan kecepatan performa tinggi."
              )}
            </p>
          </div>

          {/* 4-Pillar Grid Bento Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="bg-[#121b2d] p-7 rounded-2xl border border-slate-800 space-y-4 hover:border-amber-400/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-[#FACC15] flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">
                {t("Real-Time Capacity Guard", "Sistem Proteksi Kapasitas")}
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed font-normal">
                {t(
                  "Algorithmic distribution monitors task ETCs, automatically deducting approved leave hours and visually warning teams before overtime thresholds are breached.",
                  "Algoritma cerdas memantau estimasi jam kerja, mengurangkan kuota hari cuti yang disetujui secara otomatis, dan memberi peringatan visual sebelum batas kerja lembur terlewati."
                )}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-amber-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{t("40-hr Weekly Threshold", "Batas Standar 40 Jam / Minggu")}</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-[#121b2d] p-7 rounded-2xl border border-slate-800 space-y-4 hover:border-amber-400/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-400/10 text-indigo-400 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">
                {t("Strict Multi-Tenant Isolation", "Isolasi Multi-Tenant Ketat")}
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed font-normal">
                {t(
                  "Each workspace operates in strict data isolation. Encryption standards (TLS 1.3 in transit and AES-256 at rest) protect all team conversations and attached assets.",
                  "Setiap ruang kerja terpartisi secara independen. Standar enkripsi TLS 1.3 saat transit dan AES-256 saat tersimpan melindungi seluruh komunikasi dan lampiran berkas tim Anda."
                )}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-indigo-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{t("Indonesian PDP Law 2022", "Kepatuhan UU PDP No. 27/2022")}</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-[#121b2d] p-7 rounded-2xl border border-slate-800 space-y-4 hover:border-amber-400/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">
                {t("Zero-Retention AI Privacy", "Privasi AI Tanpa Retensi")}
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed font-normal">
                {t(
                  "All task breakdowns and daily briefings processed through Luruka AI are ephemeral. Customer data is strictly never retained or utilized to train general foundation models.",
                  "Seluruh pemecahan tugas dan ringkasan harian melalui Luruka AI bersifat privat. Data organisasi Anda tidak pernah disimpan untuk melatih model kecerdasan buatan umum."
                )}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{t("100% Data Confidentiality", "100% Kerahasiaan Data")}</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="bg-[#121b2d] p-7 rounded-2xl border border-slate-800 space-y-4 hover:border-amber-400/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-sky-400/10 text-sky-400 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">
                {t("Synchronized 4-Perspective Views", "Sinkronisasi 4 Sudut Pandang")}
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed font-normal">
                {t(
                  "Kanban boards, Gantt timelines, tabular spreadsheets, and unified leave calendars operate on a singular real-time state, eliminating discrepancies across department views.",
                  "Papan Kanban, lini masa Gantt, tabel spreadsheet, dan kalender cuti tersinkronisasi 100% dalam satu sumber data tunggal, mencegah tumpang tindih rencana antar departemen."
                )}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-sky-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{t("Instant Real-Time State", "Pembaruan Seketika Real-Time")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Corporate Inquiries & Headquarters */}
      <section className="py-20 md:py-28 bg-white dark:bg-neutral-900 px-6 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-start">
          <div className="lg:w-1/2 space-y-8">
            <div>
              <span className="px-3.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-bold uppercase tracking-widest">
                {t("Corporate & Support", "Korporat & Dukungan")}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#111E38] dark:text-white mt-4">
                {t("Connect with Our Team", "Hubungi Tim Kami")}
              </h2>
            </div>

            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
              {t(
                "Whether you represent a growing startup seeking to streamline task execution or an enterprise requiring custom workflows and dedicated security audits, our team is ready to assist you.",
                "Baik Anda memimpin tim startup yang ingin merapikan alur eksekusi maupun organisasi skala besar yang membutuhkan kustomisasi alur kerja dan kepatuhan keamanan khusus, kami siap berdiskusi bersama Anda."
              )}
            </p>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-amber-400/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                    {t("Official Email", "Email Resmi")}
                  </p>
                  <a
                    href="mailto:contact@alurku.com"
                    className="text-lg md:text-xl font-bold text-[#111E38] dark:text-amber-400 hover:underline"
                  >
                    contact@alurku.com
                  </a>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {t("Response within 1 business day", "Dibalas dalam waktu maksimal 1 hari kerja")}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                    {t("Operational Headquarters", "Kantor Operasional")}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-[#111E38] dark:text-white">
                    Jakarta, Indonesia
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {t("Operating hours: Monday – Friday, 09:00 – 18:00 WIB", "Jam operasional: Senin – Jumat, 09:00 – 18:00 WIB")}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                    {t("Enterprise SLA & Support", "SLA & Dukungan Enterprise")}
                  </p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t("Dedicated Account Manager & 99.9% Uptime SLA for Business Tier", "Manajer Akun Khusus & Jaminan Uptime 99.9% untuk Paket Business")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 w-full">
            <div className="bg-[#f8f9ff] dark:bg-neutral-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-full h-96 relative rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDY7rhrea5yEXXkUU8ORY54woiqZVP4oh5Xoz-Y9amcdZAP5H1kg32q4F8B2-sTohVHfvtC0q-_Xq_jW_lKZJ1IR2dTwbKX7zvWvMzPVPXdno4qEwOEJGwyqybA2YXZUbQxCQKPgagleXPoe92tLK5PfK1SSqknywpJNIPviFCjN3YTlGyc18xrEnzkKSAshb_a5R-RYVV1qjIqNtYj8i1CI9qdfIMvjiUQ-4_mmDmN4Agbx6h1tFLmp24aXcWm4_LI6ded4oANFLNV')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111E38]/80 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white">
                    <p className="font-bold text-base flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <span>alurku. Technology Hub</span>
                    </p>
                    <p className="text-xs text-slate-300">
                      {t("Empowering modern collaboration across Southeast Asia and beyond", "Mendukung kolaborasi modern di Asia Tenggara dan global")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

