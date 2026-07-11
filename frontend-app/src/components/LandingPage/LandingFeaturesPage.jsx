import React from 'react';
import { useSEO } from '../../hooks/useSEO';
import { motion } from 'framer-motion';
import featuresIntegrationsImg from '../../assets/features_integrations.png';

export default function LandingFeaturesPage({ language }) {
  const isId = language === 'id';
  const tMsg = (en, id) => (language === 'id' ? id : en);

  useSEO({
    title: tMsg('Key Features', 'Fitur Utama'),
    description: tMsg(
      'Discover alurku.\'s smart features: Automated AI planning, workload balancing, and seamless visual task management.',
      'Jelajahi fitur cerdas alurku.: Perencana AI otomatis, keseimbangan beban kerja, dan manajemen tugas visual yang mulus.'
    ),
    path: '/fitur',
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": tMsg("alurku. Features", "Fitur alurku."),
      "description": tMsg(
        "Complete overview of alurku.\'s features including AI planning and workload analytics.",
        "Ringkasan lengkap fitur-fitur alurku. termasuk perencanaan AI dan analitik beban kerja."
      )
    }
  });

  // Action to open auth modal
  const handleOpenAuth = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { isLogin: false } }));
    }
  };

  return (
    <div className="relative z-0 min-h-screen py-24 bg-[#f8f9ff] text-slate-900 transition-colors duration-200 overflow-hidden">
      
      {/* ─── Background Blur Blobs for Bluish Tint / Color Shifts (Exact Stitch Feel) ─── */}
      <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-[#dce9ff] rounded-full opacity-50 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-[500px] right-10 w-[500px] h-[500px] bg-[#d3e4fe] rounded-full opacity-50 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[300px] left-5 w-[450px] h-[450px] bg-[#e5eeff] rounded-full opacity-45 blur-[110px] pointer-events-none -z-10" />

      {/* ─── Hero Section ─── */}
      <section className="relative py-20 px-4 md:px-10 max-w-[1280px] mx-auto text-center overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="bg-[#FACC15] text-[#111E38] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest inline-block">
            {tMsg('Product Capabilities', 'Kapasitas Produk')}
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#111E38] leading-tight">
            {tMsg('Fitur Cerdas untuk Kolaborasi Modern', 'Fitur Cerdas untuk Kolaborasi Modern')}
          </h1>
          <p className="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            {tMsg(
              'Jelajahi bagaimana alurku. membantu tim Anda merencanakan, melaksanakan, dan mengontrol proyek tanpa rasa kewalahan dengan AI yang dipersonalisasi.',
              'Jelajahi bagaimana alurku. membantu tim Anda merencanakan, melaksanakan, dan mengontrol proyek tanpa rasa kewalahan dengan AI yang dipersonalisasi.'
            )}
          </p>
        </div>
      </section>

      {/* ─── Bento Grid Section (Exact 1280px Container Width & 40px Padding) ─── */}
      <section className="py-12 px-4 md:px-10 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Feature 1: AI Planning (Col-span 7) - White Background */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/60 flex flex-col md:flex-row gap-8 justify-between hover:shadow-lg transition-all duration-300"
          >
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 bg-[#001f3f] flex items-center justify-center rounded-xl">
                <svg className="w-6 h-6 text-[#FACC15]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21L8.188 15.904L3 15L8.188 14.096L9 9L9.813 14.096L15 15L9.813 15.904Z M19 3L19.5 5.5L22 6L19.5 6.5L19 9L18.5 6.5L16 6L18.5 5.5Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#111E38] mb-3">
                  {tMsg('Asisten Perencana Otomatis', 'Asisten Perencana Otomatis')}
                </h3>
                <p className="text-sm text-neutral-500">
                  {tMsg(
                    "Menghilangkan tebakan dalam manajemen waktu. alurku. memecah tugas besar dan memprediksi durasi pengerjaan secara cerdas agar proyek selesai tepat waktu.",
                    "Menghilangkan tebakan dalam manajemen waktu. alurku. memecah tugas besar dan memprediksi durasi pengerjaan secara cerdas agar proyek selesai tepat waktu."
                  )}
                </p>
              </div>
              <ul className="space-y-3">
                {[
                  tMsg('Prediksi durasi pengerjaan berbasis AI', 'Prediksi durasi pengerjaan berbasis AI'),
                  tMsg('Pemecahan tugas & estimasi waktu otomatis', 'Pemecahan tugas & estimasi waktu otomatis'),
                  tMsg('Penyesuaian prioritas tugas yang fleksibel', 'Penyesuaian prioritas tugas yang fleksibel')
                ].map((pt, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#111E38]">
                    <svg className="w-4 h-4 text-[#10B981] shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Visual simulation */}
            <div className="flex-1 w-full bg-[#e5eeff] rounded-2xl p-6 border border-neutral-200/50 flex items-center justify-center overflow-hidden">
              <div className="w-full space-y-4">
                <div className="h-6 bg-white rounded-md w-3/4 animate-pulse" />
                <div className="h-20 bg-[#001f3f] rounded-xl w-full flex items-center justify-center relative overflow-hidden">
                  <span className="text-[#FACC15] font-black text-xs uppercase tracking-widest animate-pulse">AI Calculating...</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                </div>
                <div className="flex gap-2">
                  <div className="h-5 bg-[#FACC15]/25 rounded-md w-1/4" />
                  <div className="h-5 bg-white rounded-md w-1/2" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature 2: Workload (Col-span 5) - Deep Navy Background */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="md:col-span-5 bg-[#001f3f] text-white rounded-3xl p-8 sm:p-10 border border-[#001f3f] flex flex-col justify-between hover:shadow-lg transition-all duration-300"
          >
            <div className="w-12 h-12 bg-[#FACC15] flex items-center justify-center rounded-xl mb-8">
              <svg className="w-6 h-6 text-[#111E38]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="space-y-6 flex-1">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                {tMsg('Kerja Seimbang & Anti-Kewalahan', 'Kerja Seimbang & Anti-Kewalahan')}
              </h3>
              <p className="text-sm text-neutral-300">
                {tMsg(
                  "Keseimbangan kerja adalah prioritas kami. Lacak beban kerja tim secara real-time dan bagikan tugas secara adil untuk mencegah burnout.",
                  "Keseimbangan kerja adalah prioritas kami. Lacak beban kerja tim secara real-time dan bagikan tugas secara adil untuk mencegah burnout."
                )}
              </p>
              
              {/* Capacity Scale */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center text-xs font-bold text-neutral-300">
                  <span>Team Workload Capacity</span>
                  <span className="text-[#FACC15]">82%</span>
                </div>
                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#FACC15] h-full w-[82%]" />
                </div>
              </div>

              <ul className="space-y-3 pt-2">
                {[
                  tMsg('Grafik pemantauan beban kerja tim', 'Grafik pemantauan beban kerja tim'),
                  tMsg('Deteksi dini potensi stres', 'Deteksi dini potensi stres')
                ].map((pt, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-neutral-300">
                    <svg className="w-4 h-4 text-[#FACC15] shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Feature 3: Centralized View (Col-span 5) - Match Stitch exactly */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="md:col-span-5 bg-[#eff4ff] rounded-3xl p-8 sm:p-10 border border-neutral-200/60 flex flex-col justify-between hover:shadow-lg transition-all duration-300"
          >
            <div>
              <div className="w-12 h-12 bg-white flex items-center justify-center rounded-xl mb-8 border border-neutral-200 shadow-sm">
                <svg className="w-6 h-6 text-[#111E38]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#111E38]">
                  {tMsg('Satu Layar untuk Semua Progres', 'Satu Layar untuk Semua Progres')}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed mb-6">
                  {tMsg(
                    "Dapatkan gambaran besar proyek Anda dalam satu tempat. Desain visual interaktif memudahkan kolaborasi dan pelacakan tugas secara real-time.",
                    "Dapatkan gambaran besar proyek Anda dalam satu tempat. Desain visual interaktif memudahkan kolaborasi dan pelacakan tugas secara real-time."
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Smart Deadline sub-card */}
              <div className="bg-white p-4 rounded-xl border border-neutral-200/50 flex items-start gap-4 shadow-sm">
                <div className="mt-1 w-5 h-5 bg-[#FACC15]/20 rounded flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#111E38]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm text-[#111E38] block mb-1">Smart Deadline Engine</span>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    {tMsg(
                      'Otomatis menghitung hari libur nasional Indonesia, akhir pekan, dan cuti tim untuk tenggat waktu yang realistis.',
                      'Otomatis menghitung hari libur nasional Indonesia, akhir pekan, dan cuti tim untuk tenggat waktu yang realistis.'
                    )}
                  </p>
                </div>
              </div>

              {/* Gantt Chart sub-card */}
              <div className="bg-white p-4 rounded-xl border border-neutral-200/50 flex items-start gap-4 shadow-sm">
                <div className="mt-1 w-5 h-5 bg-[#FACC15]/20 rounded flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#111E38]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm text-[#111E38] block mb-1">Gantt Chart Interaktif</span>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    {tMsg(
                      'Geser durasi tugas dan delegasikan ulang ke anggota tim langsung dari tampilan timeline dengan drag-and-drop.',
                      'Geser durasi tugas dan delegasikan ulang ke anggota tim langsung dari tampilan timeline dengan drag-and-drop.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature 4: Security & Integrations (Col-span 7) - Match Stitch exactly with overlay text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="md:col-span-7 bg-white rounded-3xl border border-neutral-200/60 flex flex-col md:flex-row overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <div className="flex-1 p-8 sm:p-10 space-y-6">
              <div className="w-12 h-12 bg-neutral-100 flex items-center justify-center rounded-xl border border-neutral-200">
                <svg className="w-6 h-6 text-[#111E38]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#111E38]">
                {tMsg('Integrasi Luas & Keamanan Tinggi', 'Integrasi Luas & Keamanan Tinggi')}
              </h3>
              <p className="text-sm text-neutral-500">
                {tMsg(
                  "Hubungkan alurku dengan alur kerja Anda yang sudah ada dengan aman melalui sistem otentikasi zero-trust.",
                  "Hubungkan alurku dengan alur kerja Anda yang sudah ada dengan aman melalui sistem otentikasi zero-trust."
                )}
              </p>
              <ul className="space-y-3">
                {[
                  tMsg('Otentikasi aman via Google OAuth', 'Otentikasi aman via Google OAuth'),
                  tMsg('Proteksi enkripsi data tingkat tinggi', 'Proteksi enkripsi data tingkat tinggi')
                ].map((pt, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#111E38]">
                    <svg className="w-4 h-4 text-[#10B981] shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                    </svg>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Visual simulation: Split panel with 3D illustration and top text as shown in Stitch */}
            <div className="flex-1 bg-[#111E38] relative min-h-[260px]">
              <img 
                alt="Integrations Illustration" 
                className="absolute inset-0 w-full h-full object-cover opacity-100" 
                src={featuresIntegrationsImg}
              />
              
            </div>
          </motion.div>

        </div>
      </section>

      {/* ─── Workspace Chat & Collaboration Section (Exact Stitch Mockup & Markup) ─── */}
      <section className="py-12 px-4 md:px-10 max-w-[1280px] mx-auto">
        <div className="bg-[#111E38] rounded-3xl overflow-hidden shadow-xl border border-[#000613] flex flex-col md:flex-row group transition-all duration-300">
          
          {/* Chat Interface Copy (Left) */}
          <div className="flex-1 p-8 sm:p-12 lg:p-16 space-y-6 flex flex-col justify-center">
            <div className="w-12 h-12 bg-[#FACC15] flex items-center justify-center rounded-xl shadow-sm">
              <svg className="w-6 h-6 text-[#111E38]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {tMsg('Workspace Chat Terfokus', 'Workspace Chat Terfokus')}
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed">
              {tMsg(
                'Komunikasi tim tanpa kehilangan konteks. Diskusikan proyek langsung di dalam workspace dengan pratinjau tugas yang tetap terlihat untuk fokus maksimal.',
                'Komunikasi tim tanpa kehilangan konteks. Diskusikan proyek langsung di dalam workspace dengan pratinjau tugas yang tetap terlihat untuk fokus maksimal.'
              )}
            </p>
            <ul className="space-y-3">
              {[
                tMsg('Thread diskusi berbasis tugas spesifik', 'Thread diskusi berbasis tugas spesifik'),
                tMsg('Berbagi file & aset dalam satu klik', 'Berbagi file & aset dalam satu klik')
              ].map((pt, i) => (
                <li key={i} className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-neutral-300">
                  <svg className="w-4 h-4 text-[#FACC15] shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Split Screen Visual (Right) - Match Stitch exactly with vertical divider border */}
          <div className="flex-1 bg-white/5 border-l border-white/10 p-6 flex gap-4 min-h-[320px]">
            
            {/* Chat Mockup - Pure Stitch styling */}
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-lg p-4 space-y-3 border border-white/20">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#FACC15]"></div>
                <div className="h-2 bg-white/30 rounded w-1/2"></div>
              </div>
              <div className="bg-white/5 p-2 rounded text-xs text-white/70">
                Bagaimana progres desain landing page?
              </div>
              <div className="flex items-center gap-2 justify-end">
                <div className="h-2 bg-white/30 rounded w-1/3"></div>
                <div className="w-6 h-6 rounded-full bg-[#111E38]"></div>
              </div>
              <div className="bg-[#FACC15]/20 p-2 rounded text-xs text-white/70 ml-4">
                Sudah 80%, tinggal bagian CTA.
              </div>
            </div>

            {/* Task Detail Mockup - Pure Stitch styling */}
            <div className="w-1/3 bg-white rounded-lg p-4 shadow-lg border border-neutral-200 hidden md:block">
              <div className="h-3 bg-[#111E38]/20 rounded w-full mb-4"></div>
              <div className="space-y-2">
                <div className="h-2 bg-[#eff4ff] rounded w-3/4"></div>
                <div className="h-2 bg-[#eff4ff] rounded w-1/2"></div>
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <div className="h-6 bg-[#FACC15] rounded w-full"></div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── Bottom CTA Section ─── */}
      <section className="py-24 px-4 md:px-10 max-w-[1280px] mx-auto">
        <div className="bg-[#FACC15] rounded-3xl p-12 text-center relative overflow-hidden shadow-xl shadow-[#FACC15]/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#111E38]/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111E38]">
              {tMsg('Siap Meningkatkan Produktivitas Tim?', 'Ready to Boost Team Productivity?')}
            </h2>
            <p className="text-sm sm:text-base font-semibold text-[#111E38]/80 leading-relaxed">
              {tMsg(
                'Bergabunglah dengan ribuan tim yang telah mengoptimalkan alur kerja mereka dengan alurku. Mulai uji coba gratis 14 hari Anda hari ini.',
                'Join thousands of teams already optimizing their workflow with alurku. Start your 14-day free trial today.'
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleOpenAuth}
                className="bg-[#111E38] text-white hover:bg-neutral-900 font-bold px-8 py-4 rounded-xl hover:scale-103 transition-transform shadow-lg text-sm"
              >
                {tMsg('Coba Gratis Sekarang', 'Try for Free Now')}
              </button>
              <button className="bg-white/30 backdrop-blur-md text-[#111E38] border border-white/20 font-bold px-8 py-4 rounded-xl hover:bg-white/50 transition-all text-sm">
                {tMsg('Jadwalkan Demo', 'Schedule a Demo')}
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
