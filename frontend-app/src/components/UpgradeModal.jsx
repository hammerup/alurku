import React, { useState } from 'react';
import axios from 'axios';

export default function UpgradeModal({
  isOpen,
  onClose,
  activeWorkspace,
  onUpgradeSuccess,
  showNotification,
  language = 'id',
}) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedTier, setSelectedTier] = useState('pro');
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'

  if (!isOpen) return null;

  const tMsg = (en, id) => (language === 'id' ? id : en);

  const currentTier = (activeWorkspace?.tier || 'free').toLowerCase();

  const handleUpgrade = async (tier) => {
    if (!activeWorkspace?.id) return;
    if (tier === currentTier) {
      showNotification(
        tMsg(`Your workspace is already on ${tier.toUpperCase()} plan.`, `Workspace Anda sudah berada pada paket ${tier.toUpperCase()}.`),
        'info'
      );
      return;
    }

    setIsUpgrading(true);
    try {
      const resp = await axios.put(`/api/workspaces/${activeWorkspace.id}/tier`, {
        tier: tier,
      });
      showNotification(
        tMsg(
          `Successfully upgraded ${activeWorkspace.name} to ${resp.data.tier_name}!`,
          `Selamat! Workspace ${activeWorkspace.name} berhasil ditingkatkan ke ${resp.data.tier_name}!`
        ),
        'success'
      );
      if (onUpgradeSuccess) {
        onUpgradeSuccess(resp.data);
      }
      onClose();
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || tMsg('Failed to update plan.', 'Gagal meningkatkan paket.');
      showNotification(detail, 'error');
    } finally {
      setIsUpgrading(false);
    }
  };

  const plans = [
    {
      id: 'free',
      name: tMsg('Starter', 'Gratis (Starter)'),
      priceMonthly: 'Rp 0',
      priceAnnual: 'Rp 0',
      period: tMsg('forever free', 'selamanya'),
      description: tMsg('Essential workflow tracking for individuals or small teams.', 'Manajemen tugas harian esensial untuk individu atau tim kecil.'),
      features: [
        tMsg('1 Owned Workspace', '1 Workspace Milik Pribadi'),
        tMsg('Up to 3 Team Members', 'Maksimal 3 Anggota Tim'),
        tMsg('3 Active Projects', 'Maksimal 3 Proyek Aktif'),
        tMsg('500 MB Storage', 'Kapasitas 500 MB'),
        tMsg('50 Luruka AI Prompts / mo', '50 Prompt Luruka AI / bulan'),
        tMsg('Kanban, List & Calendar views', 'Tampilan Kanban, List, & Kalender'),
      ],
      current: currentTier === 'free',
      ctaText: currentTier === 'free' ? tMsg('Current Plan', 'Paket Aktif') : tMsg('Downgrade', 'Pilih Starter'),
      badge: null,
      primaryColor: 'border-neutral-200 dark:border-neutral-800',
    },
    {
      id: 'pro',
      name: tMsg('Pro (Agile Team)', 'Pro (Agile Team)'),
      priceMonthly: 'Rp 99.000',
      priceAnnual: 'Rp 79.000',
      period: tMsg('/ user / mo', '/ user / bulan'),
      description: tMsg('Power and flexibility for growing teams with automated AI planning.', 'Kapasitas dan fleksibilitas penuh untuk tim berkembang dengan asisten AI.'),
      features: [
        tMsg('3 Owned Workspaces', 'Hingga 3 Ruang Kerja Pribadi'),
        tMsg('Up to 25 Team Members', 'Hingga 25 Anggota Tim'),
        tMsg('Unlimited Active Projects', 'Proyek Aktif Tanpa Batas'),
        tMsg('15 GB Storage Capacity', 'Kapasitas Penyimpanan 15 GB'),
        tMsg('1,500 Luruka AI Prompts / mo', '1.500 Prompt Luruka AI / bulan'),
        tMsg('Interactive Gantt & Timeline', 'Gantt Chart & Timeline Interaktif'),
        tMsg('Workload & Burnout Analytics', 'Analisis Beban Kerja & Kapasitas'),
        tMsg('Unified Chat Workspace', 'Chat Workspace Terpadu'),
      ],
      current: currentTier === 'pro',
      ctaText: currentTier === 'pro' ? tMsg('Current Plan', 'Paket Aktif') : tMsg('Upgrade to Pro', 'Tingkatkan ke Pro'),
      badge: tMsg('POPULAR', 'TERPOPULER'),
      primaryColor: 'border-[#FACC15] ring-2 ring-[#FACC15]/50 dark:ring-[#FACC15]/40',
    },
    {
      id: 'business',
      name: tMsg('Business (Scale)', 'Business (Skala Besar)'),
      priceMonthly: 'Rp 249.000',
      priceAnnual: 'Rp 199.000',
      period: tMsg('/ user / mo', '/ user / bulan'),
      description: tMsg('Enterprise controls, custom governance, and high AI capacity.', 'Tata kelola kustom, kontrol lanjutan, dan kuota AI komprehensif.'),
      features: [
        tMsg('Unlimited Workspaces', 'Workspace Tanpa Batas'),
        tMsg('Unlimited Team Members', 'Anggota Tim Tanpa Batas'),
        tMsg('Unlimited Projects', 'Proyek Tanpa Batas'),
        tMsg('100 GB Cloud Storage', 'Kapasitas Penyimpanan 100 GB'),
        tMsg('5,000 Luruka AI Prompts / mo', '5.000 Prompt Luruka AI / bulan'),
        tMsg('Custom Roles & RBAC', 'Hak Akses & Peran Kustom'),
        tMsg('SSO & SAML Integration', 'Integrasi SSO & SAML'),
        tMsg('Priority 24/7 SLA Support', 'Dukungan Prioritas SLA 24/7'),
      ],
      current: currentTier === 'business',
      ctaText: currentTier === 'business' ? tMsg('Current Plan', 'Paket Aktif') : tMsg('Upgrade to Business', 'Tingkatkan ke Business'),
      badge: tMsg('SCALE', 'SKALA BESAR'),
      primaryColor: 'border-indigo-500/40 dark:border-indigo-400/40',
    },
  ];

  return (
    <div className="fixed inset-0 bg-[#111E38]/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center z-100 p-4 transition-opacity animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#121B2D] border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-3xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#111E38] text-white px-6 py-6 sm:px-8 sm:py-7 flex justify-between items-start shrink-0 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#FACC15] bg-[#FACC15]/10 px-2.5 py-0.5 rounded-full border border-[#FACC15]/30">
                {tMsg('Subscription & Quota', 'Langganan & Kuota')}
              </span>
              <span className="text-xs font-semibold text-neutral-300">
                {activeWorkspace?.name || 'Workspace'}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {tMsg('Supercharge Your Workflow with alurku.', 'Tingkatkan Produktivitas Tim dengan alurku.')}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-xl font-medium">
              {tMsg(
                'Unlock unlimited projects, Gantt timelines, workload capacity analytics, and extensive Luruka AI assistant prompts.',
                'Buka kunci proyek tanpa batas, timeline Gantt, analisis kapasitas beban kerja, dan ribuan prompt asisten Luruka AI.'
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10 cursor-pointer shrink-0 relative z-10"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Workspace Scope Clarity Banner — Point 1 Fix */}
        <div className="px-6 sm:px-8 py-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-800/40 flex items-start gap-3 shrink-0">
          <svg className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
            {language === 'id' ? (
              <>Upgrade berlaku untuk: <span className="font-black">{activeWorkspace?.name || 'workspace ini'}</span>. Workspace lain yang kamu miliki tetap pada paket masing-masing, kecuali diupgrade secara terpisah.</>
            ) : (
              <>Upgrading workspace: <span className="font-black">{activeWorkspace?.name || 'this workspace'}</span>. Other workspaces you own will keep their current plan unless upgraded separately.</>
            )}
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center pt-5 pb-2 bg-[#F3F4F6] dark:bg-[#0d0f11] shrink-0 border-b border-neutral-200/60 dark:border-neutral-800/60">
          <div className="inline-flex items-center gap-1.5 bg-white dark:bg-[#121B2D] p-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 shadow-2xs">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              {tMsg('Monthly Billing', 'Tagihan Bulanan')}
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <span>{tMsg('Annual Billing', 'Tagihan Tahunan')}</span>
              <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 py-0.5 px-2 rounded-full font-black text-[9px]">
                {tMsg('Save 2 Months', 'Hemat 2 Bulan')}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 bg-[#F3F4F6] dark:bg-[#0d0f11]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isSelected = selectedTier === plan.id;
              const currentPrice = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedTier(plan.id)}
                  className={`bg-white dark:bg-[#121B2D] rounded-2xl p-6 flex flex-col justify-between relative border transition-all cursor-pointer shadow-xs ${
                    plan.primaryColor
                  } ${isSelected ? 'scale-[1.02] shadow-lg' : 'hover:scale-[1.01]'}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 right-6 bg-[#FACC15] text-[#111E38] font-black text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-xs">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="text-base font-extrabold text-[#111E38] dark:text-white">
                        {plan.name}
                      </h4>
                      {plan.current && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black px-2 py-0.5 rounded-md border border-emerald-500/30 uppercase">
                          {tMsg('Active', 'Aktif')}
                        </span>
                      )}
                    </div>

                    <div className="mb-3">
                      <span className="text-2xl sm:text-3xl font-black text-[#111E38] dark:text-white tracking-tight">
                        {currentPrice}
                      </span>
                      <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 ml-1">
                        {plan.period}
                      </span>
                      {billingCycle === 'annual' && plan.id !== 'free' && (
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                          {tMsg('Billed annually (discounted)', 'Ditagih tahunan (lebih hemat)')}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium mb-5 leading-relaxed min-h-[32px]">
                      {plan.description}
                    </p>

                    <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 mb-6">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 mb-3">
                        {tMsg('Included Features:', 'Fitur Termasuk:')}
                      </div>
                      <ul className="space-y-2.5">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200 font-medium leading-snug">
                            <svg className="w-4 h-4 shrink-0 text-amber-500 dark:text-[#FACC15] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isUpgrading || plan.current}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpgrade(plan.id);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                      plan.id === 'pro'
                        ? 'bg-[#FACC15] hover:bg-yellow-400 text-[#111E38] shadow-sm'
                        : plan.id === 'business'
                        ? 'bg-[#111E38] hover:bg-slate-800 text-white dark:bg-white dark:text-[#111E38]'
                        : 'bg-neutral-150 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}
                  >
                    {isUpgrading && selectedTier === plan.id ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></span>
                    ) : (
                      plan.ctaText
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
            {tMsg(
              'Sandbox Instant Upgrade Mode: Changes apply immediately to your active workspace.',
              'Mode Aktivasi Instan: Peningkatan paket langsung aktif seketika pada ruang kerja Anda.'
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
