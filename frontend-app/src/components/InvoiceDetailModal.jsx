import { useState } from 'react';
import axios from 'axios';

function QrIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
    </svg>
  );
}

function BankIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11m5-11v11m6-11v11m5-11v11" />
    </svg>
  );
}

function CardIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

const PAYMENT_OPTIONS = [
  { value: 'qris', label: 'QRIS', icon: QrIcon },
  { value: 'va_bca', label: 'Virtual Account BCA', icon: BankIcon },
  { value: 'va_mandiri', label: 'Virtual Account Mandiri', icon: BankIcon },
  { value: 'credit_card', label: 'Kartu Kredit / Credit Card', icon: CardIcon },
];

const PRICING = {
  pro: { monthly: 99_000, yearly: 79_000 },
  business: { monthly: 249_000, yearly: 199_000 },
};

function formatRp(amount) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export default function InvoiceDetailModal({ invoice, lang = 'id', onClose }) {
  if (!invoice) return null;

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
      <div id="invoice-print-area" className="bg-white dark:bg-[#121B2D] border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
        {/* Brand header */}
        <div className="bg-[#111E38] px-6 py-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-extrabold tracking-tight">
                <span className="text-white">alur</span><span className="text-[#FACC15]">ku.</span>
              </div>
              <p className="text-white/60 text-xs mt-0.5">
                {lang === 'id' ? 'Bukti Pembayaran' : 'Payment Receipt'}
              </p>
            </div>
            <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold px-3 py-1.5 rounded-full">
              {invoice.status?.toUpperCase() || 'PAID'}
            </span>
          </div>
        </div>

        {/* Invoice body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-slate-400">{lang === 'id' ? 'No. Faktur' : 'Invoice No.'}</span>
            <span className="font-mono font-semibold text-[#111E38] dark:text-[#FACC15]">{invoice.invoice_number}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-slate-400">{lang === 'id' ? 'Tanggal Bayar' : 'Payment Date'}</span>
            <span className="text-[#111E38] dark:text-slate-100 font-medium">
              {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-slate-400">{lang === 'id' ? 'Pengguna' : 'User'}</span>
            <span className="text-[#111E38] dark:text-slate-100 font-medium">@{invoice.username}</span>
          </div>
          {invoice.workspace_name && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">Workspace</span>
              <span className="text-[#111E38] dark:text-slate-100 font-medium">{invoice.workspace_name}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-slate-400">{lang === 'id' ? 'Metode Bayar' : 'Payment Method'}</span>
            <span className="text-[#111E38] dark:text-slate-100 font-medium">{invoice.payment_method}</span>
          </div>

          {/* Line items */}
          <div className="border-t border-dashed border-gray-200 dark:border-slate-700/80 pt-4 flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-slate-300">
                {invoice.tier_label || invoice.tier} — {invoice.billing_cycle === 'yearly'
                  ? (lang === 'id' ? 'Langganan Tahunan (12 Bulan)' : 'Annual Subscription (12 Months)')
                  : (lang === 'id' ? 'Langganan Bulanan' : 'Monthly Subscription')}
              </span>
              <span className="text-[#111E38] dark:text-white font-semibold">{formatRp(invoice.amount)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400 dark:text-slate-500">
              <span>PPN (0%)</span>
              <span>Rp 0</span>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-100 dark:border-slate-700/80 pt-3 flex justify-between items-baseline">
            <span className="font-bold text-[#111E38] dark:text-white">Total</span>
            <span className="text-xl font-extrabold text-[#111E38] dark:text-[#FACC15]">{formatRp(invoice.amount)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-5 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-[#FACC15] text-[#111E38] font-bold text-sm hover:bg-yellow-400 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            {lang === 'id' ? 'Cetak / Simpan PDF' : 'Print / Save PDF'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold text-[#111E38] dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {lang === 'id' ? 'Tutup' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CheckoutModal({ workspaceId, currentTier = 'free', lang = 'id', apiBase = '/api', token, onSuccess, onClose }) {
  const [tier, setTier] = useState('pro');
  const [cycle, setCycle] = useState('yearly');
  const [payMethod, setPayMethod] = useState('qris');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  const monthlyRate = PRICING[tier]?.[cycle] ?? 0;
  const totalAmount = cycle === 'yearly' ? monthlyRate * 12 : monthlyRate;
  const yearlySavings = (PRICING[tier].monthly - PRICING[tier].yearly) * 12;

  const handleCheckout = async () => {
    setPaying(true);
    setError('');
    const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    try {
      const r = await axios.post(
        `${apiBase}/workspaces/${workspaceId}/checkout`,
        { tier, billing_cycle: cycle, payment_method: payMethod, idempotency_key: idempotencyKey },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Idempotency-Key': idempotencyKey,
          },
        }
      );
      onSuccess?.(r.data.invoice, r.data.subscription);
    } catch (e) {
      setError(e?.response?.data?.detail || (lang === 'id' ? 'Pembayaran gagal.' : 'Payment failed.'));
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
      <div className="bg-white dark:bg-[#121B2D] border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
        <div className="bg-[#111E38] px-6 py-5 flex items-center justify-between border-b border-white/10">
          <div className="text-base font-bold">
            <span className="text-white">alur</span><span className="text-[#FACC15]">ku.</span>
            <span className="text-white/80 ml-2 font-normal text-sm">{lang === 'id' ? '— Upgrade Paket' : '— Upgrade Plan'}</span>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors cursor-pointer" aria-label="Close modal">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Tier select */}
          <div className="flex gap-2">
            {(['pro', 'business']).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTier(t)}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer ${
                  tier === t
                    ? 'border-[#FACC15] bg-yellow-50 text-[#111E38] dark:bg-[#FACC15]/15 dark:text-[#FACC15] dark:border-[#FACC15] shadow-xs'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800/40'
                }`}
              >
                {t === 'pro' ? 'Pro (Agile Team)' : 'Business (Scale)'}
              </button>
            ))}
          </div>

          {/* Cycle toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 w-20">{lang === 'id' ? 'Siklus:' : 'Cycle:'}</span>
            <div className="flex bg-gray-100 dark:bg-slate-800/90 rounded-lg p-1 gap-1 border border-transparent dark:border-slate-700/60">
              {['monthly', 'yearly'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCycle(c)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    cycle === c
                      ? 'bg-white text-[#111E38] dark:bg-[#111E38] dark:text-[#FACC15] dark:border dark:border-[#FACC15]/40 shadow-xs font-bold'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 font-medium'
                  }`}
                >
                  {c === 'monthly'
                    ? (lang === 'id' ? 'Bulanan' : 'Monthly')
                    : (lang === 'id' ? `Tahunan ${c === 'yearly' ? '(Hemat!)' : ''}` : 'Yearly (Save!)')}
                </button>
              ))}
            </div>
          </div>

          {/* Price display */}
          <div className="bg-[#F3F4F6] dark:bg-slate-800/70 border border-gray-200/60 dark:border-slate-700/60 rounded-xl px-4 py-4 text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-extrabold text-[#111E38] dark:text-white">
                {formatRp(monthlyRate)}
              </span>
              <span className="text-sm font-normal text-gray-500 dark:text-slate-400">/bln</span>
            </div>

            {cycle === 'yearly' ? (
              <div className="mt-2.5 pt-2.5 border-t border-gray-200/60 dark:border-slate-700/60 flex flex-col gap-0.5">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {lang === 'id' ? 'Total Ditagih di Muka:' : 'Billed Upfront:'}{' '}
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                    {formatRp(totalAmount)} / {lang === 'id' ? 'tahun' : 'year'}
                  </span>
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  {lang === 'id'
                    ? `Hemat ${formatRp(yearlySavings)} / tahun dibanding bayar bulanan`
                    : `Save ${formatRp(yearlySavings)} / year vs monthly`}
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                {lang === 'id' ? 'Ditagih setiap bulan, batalkan kapan saja' : 'Billed monthly, cancel anytime'}
              </p>
            )}
          </div>

          {/* Payment method */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#111E38] dark:text-slate-200 tracking-wide">
              {lang === 'id' ? 'Metode Pembayaran' : 'Payment Method'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_OPTIONS.map(pm => {
                const IconComponent = pm.icon;
                const isSelected = payMethod === pm.value;
                return (
                  <button
                    key={pm.value}
                    type="button"
                    onClick={() => setPayMethod(pm.value)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#111E38] dark:border-[#FACC15] bg-[#111E38]/5 dark:bg-[#FACC15]/15 text-[#111E38] dark:text-[#FACC15] font-bold shadow-xs dark:ring-1 dark:ring-[#FACC15]/40'
                        : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600 dark:hover:bg-slate-800/50 font-medium'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0 text-current" />
                    <span className="text-xs truncate">{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-xs text-red-500 dark:text-red-400 font-medium text-center">{error}</p>}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={paying}
            className="w-full py-3 rounded-xl bg-[#FACC15] text-[#111E38] font-bold text-sm hover:bg-yellow-400 active:scale-[0.99] transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {paying
              ? (lang === 'id' ? 'Memproses…' : 'Processing…')
              : (lang === 'id' ? `Bayar Sekarang — ${formatRp(totalAmount)}` : `Pay Now — ${formatRp(totalAmount)}`)}
          </button>
        </div>
      </div>
    </div>
  );
}
