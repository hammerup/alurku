import React from 'react';

export default function ProFeatureGate({
  feature = 'timeline', // 'timeline' | 'analytics'
  language = 'id',
  onUpgradeClick,
}) {
  const tMsg = (en, id) => (language === 'id' ? id : en);

  const isTimeline = feature === 'timeline';

  const title = isTimeline
    ? tMsg('Interactive Gantt & Timeline is a Pro Feature', 'Timeline Gantt Interaktif Tersedia di Paket Pro')
    : tMsg('Workload & Capacity Analytics is a Pro Feature', 'Analisis Beban Kerja & Kapasitas Tersedia di Paket Pro');

  const subtitle = isTimeline
    ? tMsg(
        'Visualize dependencies, drag-and-drop task schedules across months, and streamline project deadlines with ease.',
        'Visualisasikan dependensi tugas, atur jadwal deadline dengan drag-and-drop antar tanggal, dan koordinasikan progres proyek dalam satu layar interaktif.'
      )
    : tMsg(
        'Monitor individual workload distributions, prevent team burnout, and balance tasks dynamically before deadlines slip.',
        'Pantau distribusi beban kerja tim secara real-time, cegah kelelahan anggota (burnout), dan seimbangkan penugasan sebelum deadline terlewat.'
      );

  const perks = isTimeline
    ? [
        tMsg('Interactive drag-and-drop Gantt scheduling', 'Penjadwalan Gantt interaktif dengan drag-and-drop'),
        tMsg('Multi-project timeline synchronization', 'Sinkronisasi timeline multi-proyek'),
        tMsg('Export high-resolution timeline to PDF / PNG', 'Ekspor timeline resolusi tinggi ke PDF & PNG'),
        tMsg('Automatic deadline conflict alerts', 'Deteksi otomatis konflik jadwal dan deadline'),
      ]
    : [
        tMsg('Live team workload capacity indicators', 'Indikator kapasitas beban kerja tim real-time'),
        tMsg('Burnout prevention & smart warning alerts', 'Peringatan dini pencegahan burnout anggota tim'),
        tMsg('Leave & holiday schedule integration', 'Integrasi jadwal cuti & hari libur kerja'),
        tMsg('AI Workload Optimizer & automatic reassignment', 'Optimasi beban kerja otomatis dengan asisten AI'),
      ];

  return (
    <div className="w-full flex-1 flex items-center justify-center p-6 sm:p-12 min-h-[60vh] animate-in fade-in duration-300">
      <div className="max-w-xl w-full bg-white dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-10 shadow-xl text-center relative overflow-hidden">
        {/* Subtle top banner accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#FACC15]"></div>

        {/* Icon & Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#FACC15]/20 text-[#111E38] dark:text-[#FACC15] flex items-center justify-center mb-6 shadow-inner border border-[#FACC15]/40">
          <span className="material-symbols-outlined text-3xl">
            {isTimeline ? 'timeline' : 'analytics'}
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] text-[10px] font-black uppercase tracking-widest mb-3">
          <span className="material-symbols-outlined text-xs">lock</span>
          <span>{tMsg('Pro Tier Required', 'Tersedia di Paket Pro')}</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-[#111E38] dark:text-white tracking-tight mb-3">
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed mb-6">
          {subtitle}
        </p>

        {/* Perks Card */}
        <div className="bg-[#F3F4F6] dark:bg-slate-900/60 rounded-2xl p-5 mb-8 text-left border border-neutral-200/70 dark:border-neutral-800">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
            {tMsg('What you unlock in Pro:', 'Yang Anda dapatkan di Paket Pro:')}
          </div>
          <ul className="space-y-2.5">
            {perks.map((perk, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <svg className="w-4 h-4 text-[#EAB308] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onUpgradeClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#FACC15] hover:bg-yellow-400 text-[#111E38] font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">stars</span>
            <span>{tMsg('Upgrade to Pro (Rp 29k / mo)', 'Tingkatkan ke Pro (Rp 29rb / bln)')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
