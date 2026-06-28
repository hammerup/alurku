import React, { useState } from 'react';

export default function LandingPricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annual'

  const pricingTiers = [
    {
      name: 'Gratis (Free)',
      description: 'Untuk individu dan tim kecil yang baru mulai merapikan alur kerjanya.',
      priceMonthly: 0,
      priceAnnual: 0,
      features: [
        '1 Workspace Aktif',
        'Maksimal 3 Proyek Aktif',
        'Maksimal 5 Anggota Tim',
        '500 MB Penyimpanan',
        '100 Kueri AI / Bulan',
        'Papan Kanban & Kalender Dasar'
      ],
      ctaText: 'Mulai Gratis',
      isPopular: false,
    },
    {
      name: 'Pro (Tim Profesional)',
      description: 'Kolaborasi tanpa batas untuk tim berkembang yang memerlukan produktivitas penuh.',
      priceMonthly: 99000,
      priceAnnual: 79000, // ~20% discount (hemat 2 bulan)
      features: [
        '3 Workspace Aktif',
        'Proyek Aktif Tanpa Batas',
        'Maksimal 25 Anggota Tim',
        '10 GB Penyimpanan',
        '1.000 Kueri AI / Bulan',
        'Gantt Chart (Lini Masa)',
        'Chat Workspace Terpadu',
        'Analisis Beban Kerja (Workload)'
      ],
      ctaText: 'Mulai Uji Coba Gratis',
      isPopular: true,
    },
    {
      name: 'Business (Skala Bisnis)',
      description: 'Untuk organisasi besar yang memerlukan keamanan, kontrol, dan kustomisasi penuh.',
      priceMonthly: 249000,
      priceAnnual: 199000, // ~20% discount (hemat 2 bulan)
      features: [
        'Workspace Tanpa Batas',
        'Proyek & Anggota Tanpa Batas',
        '100 GB Penyimpanan',
        '5.000 Kueri AI / Bulan',
        'Kustom Alur Kerja & Tahapan',
        'Pengaturan Peran & Izin Kustom',
        'Integrasi SSO / SAML',
        'Audit Log & Dasbor Admin'
      ],
      ctaText: 'Hubungi Sales / Mulai',
      isPopular: false,
    }
  ];

  const formatPrice = (price) => {
    if (typeof price === 'string') return price;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const comparisonData = [
    {
      category: 'Fitur Inti & Batasan',
      rows: [
        { name: 'Workspace Aktif', free: '1 Workspace', pro: '3 Workspace', business: 'Tanpa Batas' },
        { name: 'Proyek Aktif', free: 'Maks. 3 Proyek', pro: 'Tanpa Batas', business: 'Tanpa Batas' },
        { name: 'Anggota Tim', free: 'Maks. 5 Anggota', pro: 'Maks. 25 Anggota', business: 'Tanpa Batas' },
        { name: 'Kapasitas Penyimpanan', free: '500 MB', pro: '10 GB', business: '100 GB' },
        { name: 'Papan Kanban', free: 'Dasar', pro: 'Lanjutan', business: 'Lanjutan' },
        { name: 'Kalender Proyek', free: '✔', pro: '✔', business: '✔' },
      ]
    },
    {
      category: 'Kolaborasi & Produktivitas',
      rows: [
        { name: 'Lini Masa (Gantt Chart)', free: '✖', pro: '✔', business: '✔' },
        { name: 'Chat Workspace Terpadu', free: 'Dasar', pro: 'Lanjutan', business: 'Lanjutan' },
        { name: 'Analisis Beban Kerja (Workload)', free: '✖', pro: '✔', business: '✔' },
        { name: 'Kustom Alur Kerja & Tahapan', free: '✖', pro: '✖', business: '✔' },
        { name: 'Ekspor Data (CSV/Excel)', free: '✖', pro: '✔', business: '✔' },
      ]
    },
    {
      category: 'Kecerdasan Buatan (AI)',
      rows: [
        { name: 'AI Requests / Bulan', free: '100 requests', pro: '1.000 requests', business: '5.000 requests' },
        { name: 'AI Task Breakdown & Planner', free: '✖', pro: '✔', business: '✔' },
        { name: 'Pelatihan AI Kustom (Custom Training)', free: '✖', pro: '✖', business: '✔' },
      ]
    },
    {
      category: 'Keamanan, Administrasi & Dukungan',
      rows: [
        { name: 'Hak Akses & Peran Kustom', free: '✖', pro: '✖', business: '✔' },
        { name: 'Integrasi SSO / SAML', free: '✖', pro: '✖', business: '✔' },
        { name: 'Audit Log Keamanan', free: '✖', pro: '✖', business: '✔' },
        { name: 'Dasbor Admin Utama', free: '✖', pro: '✖', business: '✔' },
        { name: 'Layanan Dukungan', free: 'Komunitas', pro: 'Prioritas (Email)', business: 'Dedicated (24/7)' },
        { name: 'Jaminan Uptime SLA', free: '✖', pro: '✖', business: '99.9%' },
      ]
    }
  ];

  return (
    <div className="py-24 bg-white dark:bg-neutral-950 text-slate-900 dark:text-white transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 reveal-on-scroll">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[#111E38] dark:text-white mb-6">
            Pilih Paket yang Sesuai dengan Kebutuhan Anda
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-8">
            Dapatkan transparansi harga tanpa biaya tersembunyi. Mulai gratis dan tingkatkan paket Anda kapan saja.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-4 bg-slate-100 dark:bg-neutral-900 p-1.5 rounded-full border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Bayar Bulanan
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Bayar Tahunan
              <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 py-0.5 px-2 rounded-full font-black text-[9px] scale-95">
                Hemat 2 Bulan
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-24">
          {pricingTiers.map((tier, idx) => (
            <div
              key={idx}
              className={`bg-slate-50 dark:bg-neutral-900 border rounded-3xl p-8 flex flex-col justify-between transition-all reveal-on-scroll relative ${
                tier.isPopular
                  ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-xl md:-translate-y-4 z-10'
                  : 'border-slate-200/60 dark:border-slate-800 shadow-sm'
              }`}
            >
              {tier.isPopular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#111E38] dark:bg-sky-600 text-[#FACC15] dark:text-white font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md border border-slate-200/20">
                  Paling Populer
                </span>
              )}

              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">{tier.name}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6 leading-relaxed">
                  {tier.description}
                </p>

                {/* Price Display */}
                <div className="mb-8">
                  {tier.priceMonthly === 0 ? (
                    <span className="text-4xl font-black text-[#111E38] dark:text-white">
                      Gratis
                    </span>
                  ) : (
                    <>
                      <span className="text-4xl font-black text-[#111E38] dark:text-white">
                        {formatPrice(billingCycle === 'monthly' ? tier.priceMonthly : tier.priceAnnual)}
                      </span>
                      <span className="text-slate-500 text-xs font-bold ml-1.5">
                        / user / bulan
                      </span>
                    </>
                  )}
                </div>

                <hr className="border-slate-200 dark:border-slate-800 mb-6" />

                <ul className="space-y-4 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mb-8">
                  {tier.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-3">
                      <span className="text-sky-600 dark:text-sky-400 text-lg">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className={`w-full py-3.5 px-6 rounded-full font-bold text-sm transition-all text-center hover:-translate-y-0.5 ${
                  tier.isPopular
                    ? 'bg-[#FACC15] text-[#111E38] hover:bg-yellow-500 shadow-lg'
                    : 'bg-white dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {tier.ctaText}
              </button>
            </div>
          ))}
        </div>

        {/* Comparison Table Section */}
        <div className="reveal-on-scroll">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-black tracking-tight text-[#111E38] dark:text-white mb-4">
              Bandingkan Detail Fitur
            </h2>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">
              Analisis perbandingan mendalam untuk membantu Anda memilih paket yang tepat.
            </p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md bg-white dark:bg-neutral-900/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-neutral-900/80">
                    <th className="p-6 text-sm font-black text-[#111E38] dark:text-white w-2/5">Fitur Lengkap</th>
                    <th className="p-6 text-sm font-black text-center text-slate-600 dark:text-slate-300 w-1/5">Gratis (Free)</th>
                    <th className="p-6 text-sm font-black text-center text-[#111E38] dark:text-sky-400 w-1/5 bg-sky-50/20 dark:bg-sky-950/10">Pro</th>
                    <th className="p-6 text-sm font-black text-center text-slate-600 dark:text-slate-300 w-1/5">Business</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((cat, cIdx) => (
                    <React.Fragment key={cIdx}>
                      {/* Category Header Row */}
                      <tr className="bg-slate-100/60 dark:bg-neutral-950/60">
                        <td colSpan="4" className="p-4 pl-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                          {cat.category}
                        </td>
                      </tr>
                      {cat.rows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-neutral-900/20 transition-colors last:border-0"
                        >
                          <td className="p-5 pl-6 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {row.name}
                          </td>
                          <td className="p-5 text-sm font-medium text-center text-slate-500 dark:text-slate-400">
                            {row.free === '✔' ? (
                              <span className="text-emerald-500 font-bold text-lg">✓</span>
                            ) : row.free === '✖' ? (
                              <span className="text-slate-300 dark:text-slate-700">—</span>
                            ) : (
                              row.free
                            )}
                          </td>
                          <td className="p-5 text-sm font-bold text-center text-slate-800 dark:text-slate-200 bg-sky-50/10 dark:bg-sky-950/5">
                            {row.pro === '✔' ? (
                              <span className="text-emerald-500 font-bold text-lg">✓</span>
                            ) : row.pro === '✖' ? (
                              <span className="text-slate-300 dark:text-slate-700">—</span>
                            ) : (
                              row.pro
                            )}
                          </td>
                          <td className="p-5 text-sm font-medium text-center text-slate-600 dark:text-slate-400">
                            {row.business === '✔' ? (
                              <span className="text-emerald-500 font-bold text-lg">✓</span>
                            ) : row.business === '✖' ? (
                              <span className="text-slate-300 dark:text-slate-700">—</span>
                            ) : (
                              row.business
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
