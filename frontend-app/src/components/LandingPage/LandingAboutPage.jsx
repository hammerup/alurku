import React, { useState } from 'react';
import { useSEO } from '../../hooks/useSEO';
import ekaImage from '../../assets/ekahary_image.jpg';

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

  // SEO configuration
  useSEO({
    title: t('About Us', 'Tentang Kami'),
    description: t(
      'Learn about alurku.\'s mission: Balancing team productivity and workload management to prevent burnout.',
      'Ketahui misi alurku.: Menyeimbangkan produktivitas tim dan manajemen beban kerja untuk mencegah burnout.'
    ),
    path: '/tentang',
    schemaData: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": t("About alurku.", "Tentang alurku."),
      "description": t(
        "alurku. is a workload-aware collaborative task assistant designed to optimize team productivity.",
        "alurku. adalah asisten tugas kolaboratif sadar beban kerja yang dirancang untuk mengoptimalkan produktivitas tim."
      ),
      "publisher": {
        "@type": "Organization",
        "name": "alurku."
      }
    }
  });

  return (
    <div className="bg-[#f8f9ff] text-slate-900 dark:bg-neutral-950 dark:text-white transition-colors duration-200">
      <style>{`
        .ambient-shadow {
            box-shadow: 0 4px 20px rgba(0, 31, 63, 0.08);
        }
        .hero-gradient {
            background: radial-gradient(circle at 50% 50%, rgba(212, 227, 255, 0.3) 0%, rgba(248, 249, 255, 0) 70%);
        }
        .dark .hero-gradient {
            background: radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.5) 0%, rgba(9, 13, 22, 0) 70%);
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            display: inline-block;
            vertical-align: middle;
        }
      `}</style>

      {/* Section 1: Mission-Driven Hero */}
      <section className="relative min-h-[500px] flex items-center justify-center text-center px-6 overflow-hidden py-16">
        <div className="hero-gradient absolute inset-0 -z-10"></div>
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-block px-4 py-1.5 bg-[#e5eeff] dark:bg-slate-800 rounded-full text-[#111E38] dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
            {t("Our Mission", "Misi Kami")}
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-[#111E38] dark:text-white tracking-tighter leading-tight">
            {t("Our Mission: Balancing Productivity", "Misi Kami: Menyeimbangkan Produktivitas")}
          </h1>
          <p className="text-lg md:text-xl text-slate-650 dark:text-slate-405 max-w-2xl mx-auto font-medium leading-relaxed">
            {t(
              "At alurku., we believe that the best productivity is not born from excessive pressure, but from a balanced and organized execution flow.",
              "Di alurku., kami percaya bahwa produktivitas terbaik tidak lahir dari tekanan kerja berlebih, melainkan dari alur eksekusi yang seimbang dan teratur."
            )}
          </p>
          <div className="pt-8">
            <span className="material-symbols-outlined text-[#111E38] dark:text-slate-500 animate-bounce text-4xl">expand_more</span>
          </div>
        </div>
      </section>

      {/* Section 2: Our Story / Philosophy */}
      <section 
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative py-20 md:py-32 px-6 overflow-hidden bg-[#0d172b] dark:bg-[#090D16] border-y border-slate-800"
      >
        {/* Static Background Office Image (Low Opacity for subtle texture) */}
        <div 
          className="absolute inset-0 bg-cover bg-center pointer-events-none scale-[1.03] opacity-20 dark:opacity-10"
          style={{ 
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAAC7cPwGFNRRVROnZFdwUn_ISwXI76immUN60NsJ7Nl5wtoIzvIQrFo6hZhMAdD9Pm6hCqrGl5DTglI587K-2f_XzhI1FhK7BxFS9ErYd7H3XS709OBV2FlnFFBxV7q6egD5vYotNAt2Ir0ANKV_hYN2tVhCwCiLU8qEa5yZkgSgx29lWcb9W_IErzBTp0YglxX1r1wa8cf7qmn4yx7hxE-hO9B-Rbtq2M8UT1itTnpEZiPLgar0FFlOGFTvinsMUeCLitC9q3GVys')",
          }}
        />
        {/* Glow Torch (Follows Cursor) */}
        <div 
          className="absolute w-[350px] h-[350px] rounded-full bg-[#FACC15]/20 blur-[120px] pointer-events-none z-10"
          style={{
            left: `${mousePos.x}%`,
            top: `${mousePos.y}%`,
            transform: 'translate(-50%, -50%)',
            transition: isHovered ? 'left 0.15s ease-out, top 0.15s ease-out' : 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
        {/* Dark Navy Gradient Overlay to blend with borders */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d172b]/80 via-transparent to-[#0d172b]/80 dark:from-[#090D16]/80 dark:via-transparent dark:to-[#090D16]/80 pointer-events-none"></div>
        {/* Glowing Orbs for ambient lighting */}
        <div className="absolute left-[5%] bottom-[10%] w-[250px] h-[250px] rounded-full bg-sky-500/10 blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Glassmorphic Content Card (Left) */}
          <div className="space-y-8 bg-white/5 dark:bg-neutral-900/40 backdrop-blur-md p-8 md:p-10 rounded-2xl border border-white/10 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {t("Brand Philosophy of alurku.", "Filosofi Brand alurku.")}
            </h2>
            <div className="space-y-6 text-slate-200 leading-relaxed font-medium">
              <p className="text-lg">
                {t(
                  "The name alurku. is taken from our desire to give freedom to every individual and organization to own their own workflow (\"My Flow\").",
                  "Nama alurku. diambil dari keinginan kami untuk memberikan kebebasan bagi setiap individu dan organisasi untuk memiliki alur kerjanya sendiri (\"My Flow\")."
                )}
              </p>
              <p className="text-lg">
                {t(
                  "With our main tagline, \"Master Your Time, Streamline Your Flow\", we shift the focus of management technology from just \"high speed\" to \"harmonious human workload management\".",
                  "Dengan tagline utama kami, \"Kuasai Waktumu, Lancarkan Alurmu\", kami menggeser fokus teknologi manajemen dari sekadar \"kecepatan tinggi\" menjadi \"pengelolaan beban kerja manusia secara harmonis\"."
                )}
              </p>
            </div>
            <div className="p-6 bg-[#1a2844] dark:bg-neutral-950/80 rounded-xl border-l-4 border-[#FACC15]">
              <h4 className="text-xs font-bold text-[#FACC15] mb-2 tracking-wide">
                {t("Our Main Motto", "Motto Utama Kami")}
              </h4>
              <p className="text-lg md:text-xl italic text-white leading-snug font-semibold">
                {t(
                  "\"Hard work is important, but maintaining team balance and happiness is the key to long-term success.\"",
                  "\"Kerja keras itu penting, namun menjaga keseimbangan dan kebahagiaan tim adalah kunci dari kesuksesan jangka panjang.\""
                )}
              </p>
            </div>
          </div>

          {/* Interactive Highlight Card (Right) */}
          <div className="bg-white/5 dark:bg-neutral-900/40 backdrop-blur-md p-8 md:p-10 rounded-2xl border border-white/10 shadow-2xl space-y-6">
            <div className="w-12 h-12 bg-[#FACC15]/20 rounded-xl flex items-center justify-center text-[#FACC15] mb-6">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>offline_bolt</span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {t("Why alurku.?", "Mengapa alurku.?")}
            </h3>
            <div className="space-y-4 text-slate-350 text-white text-slate-300 text-base leading-relaxed font-medium">
              <p>
                {t(
                  "We believe that productivity tools should adapt to human limits, not the other way around. By managing work balance, teams perform better and stay healthier.",
                  "Kami percaya bahwa alat produktivitas seharusnya beradaptasi dengan batas kapasitas manusia, bukan sebaliknya. Dengan menjaga keseimbangan kerja, tim dapat berkinerja lebih baik dan tetap sehat."
                )}
              </p>
              <p>
                {t(
                  "Our automated scheduling and visual timelines are designed to keep you focused on execution, not planning details.",
                  "Penjadwalan otomatis dan lini masa visual kami dirancang agar Anda dapat fokus pada eksekusi, bukan pada detail perencanaan."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Core Values */}
      <section className="py-20 bg-[#f8f9ff] dark:bg-neutral-950 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#111E38] dark:text-white">
              {t("Our Core Values", "Nilai-Nilai Utama Kami")}
            </h2>
            <p className="text-slate-650 dark:text-slate-400 font-medium">
              {t("Principles that guide every line of code we write.", "Prinsip yang membimbing setiap baris kode yang kami tulis.")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="ambient-shadow p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-800 group hover:border-[#111E38] dark:hover:border-[#FACC15] transition-all duration-300">
              <div className="w-12 h-12 bg-[#e5eeff] dark:bg-slate-800 text-[#111E38] dark:text-[#FACC15] flex items-center justify-center rounded-lg mb-6 group-hover:bg-[#111E38] group-hover:text-white transition-colors duration-300">
                <span className="material-symbols-outlined">psychology</span>
              </div>
              <h3 className="text-xl font-bold text-[#111E38] dark:text-white mb-4">
                {t("Human-Centric Innovation", "Human-Centric Innovation")}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                {t(
                  "We design features based on natural human behavior, not forcing humans to adapt to machines.",
                  "Kami merancang fitur berdasarkan perilaku alami manusia, bukan memaksa manusia beradaptasi dengan mesin."
                )}
              </p>
            </div>
            {/* Value 2 */}
            <div className="ambient-shadow p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-800 group hover:border-[#111E38] dark:hover:border-[#FACC15] transition-all duration-300">
              <div className="w-12 h-12 bg-[#e5eeff] dark:bg-slate-800 text-[#111E38] dark:text-[#FACC15] flex items-center justify-center rounded-lg mb-6 group-hover:bg-[#111E38] group-hover:text-white transition-colors duration-300">
                <span className="material-symbols-outlined">visibility</span>
              </div>
              <h3 className="text-xl font-bold text-[#111E38] dark:text-white mb-4">
                {t("Radical Transparency", "Radical Transparency")}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                {t(
                  "Trust is the foundation. We are transparent in how we handle data and manage our product roadmap.",
                  "Kepercayaan adalah fondasi. Kami transparan dalam cara kami menangani data dan mengelola roadmap produk kami."
                )}
              </p>
            </div>
            {/* Value 3 */}
            <div className="ambient-shadow p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-800 group hover:border-[#111E38] dark:hover:border-[#FACC15] transition-all duration-300">
              <div className="w-12 h-12 bg-[#e5eeff] dark:bg-slate-800 text-[#111E38] dark:text-[#FACC15] flex items-center justify-center rounded-lg mb-6 group-hover:bg-[#111E38] group-hover:text-white transition-colors duration-300">
                <span className="material-symbols-outlined">eco</span>
              </div>
              <h3 className="text-xl font-bold text-[#111E38] dark:text-white mb-4">
                {t("Sustainable Growth", "Sustainable Growth")}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                {t(
                  "We help companies grow organically without sacrificing employee mental well-being.",
                  "Kami membantu perusahaan tumbuh secara organik tanpa mengorbankan kesejahteraan mental karyawan."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Leadership/Meet the Minds */}
      <section className="py-20 md:py-32 bg-[#111E38] text-white px-6 overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 space-y-4 group">
              <div className="aspect-[4/5] overflow-hidden rounded-xl">
                <img 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-550 scale-100 group-hover:scale-105" 
                  alt="Eka Hary" 
                  src={ekaImage}
                />
              </div>
              <div>
                <h4 className="text-2xl font-bold">Eka Hary</h4>
                <p className="text-[#FACC15] font-semibold text-base">{t("Founder of alurku.", "Founder alurku.")}</p>
              </div>
            </div>
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-black">{t("Meet the Founder", "Kenali Sang Founder")}</h2>
                <p className="text-slate-300 mt-2 font-medium">
                  {t("Behind the innovation of alurku.", "Di balik layar inovasi alurku.")}
                </p>
              </div>
              <div className="text-lg text-slate-300 dark:text-slate-350 space-y-6 leading-relaxed font-medium">
                <p>
                  {t(
                    "Hello! I am Eka Hary, the founder of alurku. Like many of you, I faced the relentless challenge of managing daily tasks without losing my peace of mind. I realized that productivity shouldn't be about working ourselves to exhaustion, but about flowing with structure. That is why I built alurku. — a workload-aware assistant designed to balance your daily load, protect your team from burnout, and bring clarity to your execution.",
                    "Halo! Saya Eka Hary, founder dari alurku. Seperti kebanyakan dari Anda, saya sempat menghadapi tantangan tanpa akhir dalam mengelola tugas harian tanpa kehilangan kedamaian pikiran. Saya menyadari bahwa produktivitas seharusnya bukan tentang memaksa diri kita bekerja hingga kelelahan, melainkan tentang mengalir secara teratur. Itulah mengapa saya membangun alurku. — asisten cerdas berbasis beban kerja yang dirancang untuk menyeimbangkan beban harian Anda, melindungi tim dari burnout, dan menghadirkan kejelasan alur kerja."
                  )}
                </p>
                <p>
                  {t(
                    "Today, we are on a mission to build a healthier, more human way of working. Let's smooth your flow together.",
                    "Hari ini, kami memiliki misi untuk menciptakan cara kerja yang lebih sehat dan manusiawi. Yuk, kita lancarkan alur kerjamu bersama!"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Contact/Office */}
      <section className="py-20 md:py-32 bg-white dark:bg-neutral-900 px-6 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
          <div className="lg:w-1/2 space-y-8">
            <h2 className="text-3xl font-bold text-[#111E38] dark:text-white">
              {t("Contact Us", "Hubungi Kami")}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
              {t(
                "Have questions about products, partnerships, or need technical help? Send your message directly to our team.",
                "Punya pertanyaan seputar produk, kemitraan, atau butuh bantuan teknis? Kirimkan pesan Anda langsung kepada tim kami."
              )}
            </p>
            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-[#e5eeff] dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-[#111E38] dark:text-[#FACC15]">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-wider">{t("Contact via Email", "Hubungi via Email")}</p>
                  <a href="mailto:contact@alurku.com" className="text-xl font-bold text-[#111E38] dark:text-[#FACC15] hover:underline">contact@alurku.com</a>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-[#e5eeff] dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-[#111E38] dark:text-[#FACC15]">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-wider">{t("Headquarters", "Kantor Utama")}</p>
                  <p className="text-xl font-bold text-[#111E38] dark:text-white">Jakarta, Indonesia</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="bg-[#f8f9ff] dark:bg-neutral-950 p-2 rounded-2xl overflow-hidden ambient-shadow h-[400px] border border-slate-200 dark:border-slate-800">
              <div className="w-full h-full relative rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                <div 
                  className="absolute inset-0 bg-cover bg-center" 
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDY7rhrea5yEXXkUU8ORY54woiqZVP4oh5Xoz-Y9amcdZAP5H1kg32q4F8B2-sTohVHfvtC0q-_Xq_jW_lKZJ1IR2dTwbKX7zvWvMzPVPXdno4qEwOEJGwyqybA2YXZUbQxCQKPgagleXPoe92tLK5PfK1SSqknywpJNIPviFCjN3YTlGyc18xrEnzkKSAshb_a5R-RYVV1qjIqNtYj8i1CI9qdfIMvjiUQ-4_mmDmN4Agbx6h1tFLmp24aXcWm4_LI6ded4oANFLNV')" }}
                ></div>
                <div className="absolute inset-0 pointer-events-none border border-[#111E38]/5 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
