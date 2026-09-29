import { useState } from 'react';
import axios from 'axios';

const PAYMENT_OPTIONS = [
  { value: 'qris', label: 'QRIS', icon: '📱' },
  { value: 'va_bca', label: 'Virtual Account BCA', icon: '🏦' },
  { value: 'va_mandiri', label: 'Virtual Account Mandiri', icon: '🏦' },
  { value: 'credit_card', label: 'Kartu Kredit / Credit Card', icon: '💳' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div id="invoice-print-area" className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
        {/* Brand header */}
        <div className="bg-[#111E38] px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-extrabold tracking-tight">
                <span className="text-white">alur</span><span className="text-[#FACC15]">ku.</span>
              </div>
              <p className="text-white/60 text-xs mt-0.5">
                {lang === 'id' ? 'Bukti Pembayaran' : 'Payment Receipt'}
              </p>
            </div>
            <span className="bg-emerald-400/20 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full">
              {invoice.status?.toUpperCase() || 'PAID'}
            </span>
          </div>
        </div>

        {/* Invoice body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{lang === 'id' ? 'No. Faktur' : 'Invoice No.'}</span>
            <span className="font-mono font-semibold text-[#111E38]">{invoice.invoice_number}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{lang === 'id' ? 'Tanggal Bayar' : 'Payment Date'}</span>
            <span className="text-[#111E38]">
              {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{lang === 'id' ? 'Pengguna' : 'User'}</span>
            <span className="text-[#111E38] font-medium">@{invoice.username}</span>
          </div>
          {invoice.workspace_name && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Workspace</span>
              <span className="text-[#111E38]">{invoice.workspace_name}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{lang === 'id' ? 'Metode Bayar' : 'Payment Method'}</span>
            <span className="text-[#111E38]">{invoice.payment_method}</span>
          </div>

          {/* Line items */}
          <div className="border-t border-dashed border-gray-200 pt-4 flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {invoice.tier_label || invoice.tier} — {invoice.billing_cycle === 'yearly'
                  ? (lang === 'id' ? 'Langganan Tahunan' : 'Annual Subscription')
                  : (lang === 'id' ? 'Langganan Bulanan' : 'Monthly Subscription')}
              </span>
              <span className="text-[#111E38]">{formatRp(invoice.amount)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>PPN (0%)</span>
              <span>Rp 0</span>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-100 pt-3 flex justify-between">
            <span className="font-bold text-[#111E38]">Total</span>
            <span className="text-xl font-extrabold text-[#111E38]">{formatRp(invoice.amount)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-5 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-[#FACC15] text-[#111E38] font-semibold text-sm hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            {lang === 'id' ? 'Cetak / Simpan PDF' : 'Print / Save PDF'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#111E38] hover:bg-gray-50 transition-colors"
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

  const price = PRICING[tier]?.[cycle] ?? 0;

  const handleCheckout = async () => {
    setPaying(true);
    setError('');
    try {
      const r = await axios.post(
        `${apiBase}/workspaces/${workspaceId}/checkout`,
        { tier, billing_cycle: cycle, payment_method: payMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess?.(r.data.invoice);
    } catch (e) {
      setError(e?.response?.data?.detail || (lang === 'id' ? 'Pembayaran gagal.' : 'Payment failed.'));
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
        <div className="bg-[#111E38] px-6 py-5 flex items-center justify-between">
          <div className="text-base font-bold">
            <span className="text-white">alur</span><span className="text-[#FACC15]">ku.</span>
            <span className="text-white ml-2 font-normal text-sm">{lang === 'id' ? '— Upgrade Paket' : '— Upgrade Plan'}</span>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
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
                onClick={() => setTier(t)}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
                  tier === t ? 'border-[#FACC15] bg-yellow-50 text-[#111E38]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {t === 'pro' ? 'Pro (Agile Team)' : 'Business (Scale)'}
              </button>
            ))}
          </div>

          {/* Cycle toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-20">{lang === 'id' ? 'Siklus:' : 'Cycle:'}</span>
            <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
              {['monthly', 'yearly'].map(c => (
                <button
                  key={c}
                  onClick={() => setCycle(c)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    cycle === c ? 'bg-white text-[#111E38] shadow-sm' : 'text-gray-500'
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
          <div className="bg-[#F3F4F6] rounded-xl px-4 py-4 text-center">
            <p className="text-3xl font-extrabold text-[#111E38]">{formatRp(price)}<span className="text-sm font-normal text-gray-500">/bln</span></p>
            {cycle === 'yearly' && (
              <p className="text-xs text-emerald-600 mt-1">{lang === 'id' ? 'Tagihan tahunan, hemat dibanding bulanan' : 'Billed annually, save vs monthly'}</p>
            )}
          </div>

          {/* Payment method */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#111E38]">{lang === 'id' ? 'Metode Pembayaran' : 'Payment Method'}</label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_OPTIONS.map(pm => (
                <button
                  key={pm.value}
                  onClick={() => setPayMethod(pm.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                    payMethod === pm.value
                      ? 'border-[#111E38] bg-[#111E38]/5 text-[#111E38] font-semibold'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span>{pm.icon}</span>
                  <span className="text-xs">{pm.label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          <button
            onClick={handleCheckout}
            disabled={paying}
            className="w-full py-3 rounded-xl bg-[#FACC15] text-[#111E38] font-bold text-sm hover:bg-yellow-400 transition-colors disabled:opacity-50"
          >
            {paying
              ? (lang === 'id' ? 'Memproses…' : 'Processing…')
              : (lang === 'id' ? `Bayar Sekarang — ${formatRp(price)}` : `Pay Now — ${formatRp(price)}`)}
          </button>
        </div>
      </div>
    </div>
  );
}
