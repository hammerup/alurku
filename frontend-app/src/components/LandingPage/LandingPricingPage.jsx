import React, { useState } from 'react';

export default function LandingPricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annual'

  const pricingTiers = [
    {
      name: 'Mulai Saja',
      description: 'Cocok untuk individu atau tim kecil yang baru mulai merapikan alur kerjanya.',
      priceMonthly: 0,
      priceAnnual: 0,
      features: [
        '1 Papan Proyek Aktif',
        'Hingga 5 Anggota Tim',
        'Kapasitas Penyimpanan 100MB',
        'Asisten AI Skala Dasar',
        'Dukungan Komunitas'
      ],
      ctaText: 'Mulai Gratis Sekarang',
      isPopular: false,
    },
    {
      name: 'Tim Profesional',
      description: 'Solusi lengkap untuk tim profesional yang membutuhkan fleksibilitas penuh.',
      priceMonthly: 79000,
      priceAnnual: 63000, // ~20% discount
      features: [
        'Papan Proyek Tanpa Batas',
        'Anggota Tim Tanpa Batas',
        'Kapasitas Penyimpanan 10GB',
        'Asisten AI Lengkap & Real-time',
        'Garis Waktu (Gantt Chart)',
        'Dukungan Prioritas 24 Jam'
      ],
      ctaText: 'Mulai Uji Coba Gratis',
      isPopular: true,
    },
    {
      name: 'Skala Bisnis',
      description: 'Untuk organisasi besar yang memerlukan keamanan, kontrol, dan dukungan khusus.',
      priceMonthly: 'Custom',
      priceAnnual: 'Custom',
      features: [
        'Penyimpanan Awan Khusus (Dedicated)',
        'Integrasi Keamanan SSO & SAML',
        'Pelatihan AI Kustom untuk Tim',
        'Manajer Akun Pribadi (Dedicated Account)',
        'Jaminan Layanan SLA 99.9%',
        'Dukungan Telepon 24/7'
      ],
      ctaText: 'Hubungi Tim Penjualan',
      isPopular: false,
    }
  ];

  const formatPrice = (price) => {
    if (typeof price === 'string') return price;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

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
                Hemat 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
          {pricingTiers.map((tier, idx) => (
            <div
              key={idx}
              className={`bg-slate-50 dark:bg-neutral-900 border rounded-3xl p-8 flex flex-col justify-between transition-all reveal-on-scroll relative ${
                tier.isPopular
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl md:-translate-y-4 z-10'
                  : 'border-slate-200/60 dark:border-slate-800 shadow-sm'
              }`}
            >
              {tier.isPopular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
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
                  {typeof (billingCycle === 'monthly' ? tier.priceMonthly : tier.priceAnnual) === 'string' ? (
                    <span className="text-4xl font-black text-[#111E38] dark:text-white">
                      {billingCycle === 'monthly' ? tier.priceMonthly : tier.priceAnnual}
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
                      <span className="text-indigo-600 dark:text-indigo-400 text-lg">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className={`w-full py-3.5 px-6 rounded-full font-bold text-sm transition-all text-center hover:-translate-y-0.5 ${
                  tier.isPopular
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
                    : 'bg-white dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {tier.ctaText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
