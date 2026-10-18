import { useState } from 'react';
import axios from 'axios';
import { usePublicPolicies } from '../hooks/usePublicPolicies';

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
  return `Rp ${(Number(amount) || 0).toLocaleString('id-ID')}`;
}

export default function InvoiceDetailModal({ invoice, lang = 'id', onClose }) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const rawSubtotal = invoice.subtotal != null ? invoice.subtotal : (invoice.tax_amount ? invoice.amount - invoice.tax_amount : invoice.amount);
  const rawTaxRate = invoice.tax_rate != null ? invoice.tax_rate : (invoice.tax_amount && rawSubtotal ? (invoice.tax_amount / rawSubtotal) * 100 : 0);
  const rawTaxAmount = invoice.tax_amount != null ? invoice.tax_amount : (invoice.amount - rawSubtotal);

  const formattedDate = invoice.created_at
    ? new Date(invoice.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  const formattedPaidDate = invoice.paid_at
    ? new Date(invoice.paid_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
    : formattedDate;

  return (
    <div id="invoice-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      {/* Scoped Print Stylesheet */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          html, body {
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body > * {
            visibility: hidden !important;
          }
          #invoice-modal-backdrop {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            visibility: visible !important;
            display: block !important;
          }
          #invoice-modal-backdrop * {
            visibility: visible !important;
          }
          .no-print {
            display: none !important;
          }
          #invoice-print-card {
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 8px !important;
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            background: #ffffff !important;
            color: #0f172a !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print-header-brand {
            color: #111e38 !important;
          }
          .print-accent-gold {
            color: #b45309 !important;
          }
          .print-badge-paid {
            border: 1px solid #059669 !important;
            background: #ecfdf5 !important;
            color: #047857 !important;
          }
          .print-table-th {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            border-color: #cbd5e1 !important;
          }
          .print-table-td {
            border-color: #e2e8f0 !important;
            color: #1e293b !important;
          }
        }
      `}</style>

      <div
        id="invoice-print-card"
        className="bg-white dark:bg-[#121B2D] border border-gray-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden my-auto transition-all"
      >
        {/* On-screen Modal Header & Actions (Hidden on Print) */}
        <div className="no-print bg-[#111E38] px-6 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold tracking-tight">
              <span className="text-white">alur</span>
              <span className="text-[#FACC15]">ku.</span>
            </span>
            <span className="text-white/60 text-xs font-semibold ml-2 pl-2 border-l border-white/20">
              {lang === 'id' ? 'Faktur Pembayaran Resmi' : 'Official Tax Invoice'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-[#FACC15] hover:bg-yellow-400 text-[#111E38] font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>{lang === 'id' ? 'Cetak / Simpan PDF' : 'Print / Save PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Official Printable Invoice Document Body */}
        <div className="p-6 sm:p-8 flex flex-col gap-6 text-[#111E38] dark:text-slate-100">
          {/* Corporate Letterhead Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-200 dark:border-slate-800">
            <div>
              <div className="text-2xl font-extrabold tracking-tight print-header-brand">
                <span className="text-[#111E38] dark:text-white print-header-brand">alur</span>
                <span className="text-[#FACC15] print-accent-gold">ku.</span>
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                PT Alurku Digital Kreasi
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                Equity Tower Lt. 29, SCBD Kav. 52-53, Jakarta Selatan 12190
                <br />
                NPWP: 01.345.678.9-012.000 | billing@alurku.com | www.alurku.com
              </p>
            </div>

            <div className="sm:text-right flex flex-col sm:items-end">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {lang === 'id' ? 'FAKTUR RESMI / BUKTI PEMBAYARAN' : 'OFFICIAL TAX INVOICE & RECEIPT'}
              </span>
              <span className="font-mono text-base sm:text-lg font-black text-[#111E38] dark:text-[#FACC15] mt-0.5">
                {invoice.invoice_number}
              </span>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-700/60 print-badge-paid">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{invoice.status?.toUpperCase() || 'LUNAS / PAID'}</span>
              </div>
            </div>
          </div>

          {/* Customer & Transaction Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Left: Customer Info */}
            <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-slate-800/40 border border-gray-200/80 dark:border-slate-800 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                {lang === 'id' ? 'Ditagihkan Kepada (Pelanggan)' : 'Billed To (Customer)'}
              </span>
              <div className="font-bold text-sm text-[#111E38] dark:text-white">
                @{invoice.username}
              </div>
              {invoice.workspace_name && (
                <div className="text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">{lang === 'id' ? 'Ruang Kerja: ' : 'Workspace: '}</span>
                  <span className="font-semibold">{invoice.workspace_name}</span>
                </div>
              )}
              {invoice.company_name && (
                <div className="text-slate-600 dark:text-slate-300 pt-1 border-t border-gray-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400">{lang === 'id' ? 'Instansi / PT: ' : 'Company: '}</span>
                  <span className="font-semibold">{invoice.company_name}</span>
                </div>
              )}
              {invoice.tax_id && (
                <div className="text-slate-600 dark:text-slate-300 font-mono">
                  <span className="text-slate-400">NPWP: </span>
                  <span className="font-semibold">{invoice.tax_id}</span>
                </div>
              )}
              {invoice.billing_address && (
                <div className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  {invoice.billing_address}
                </div>
              )}
            </div>

            {/* Right: Payment & Invoicing Details */}
            <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-slate-800/40 border border-gray-200/80 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                {lang === 'id' ? 'Rincian Transaksi' : 'Transaction Details'}
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">{lang === 'id' ? 'Tanggal Terbit' : 'Issue Date'}</span>
                <span className="font-semibold">{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">{lang === 'id' ? 'Tanggal Bayar' : 'Payment Date'}</span>
                <span className="font-semibold">{formattedPaidDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">{lang === 'id' ? 'Metode Pembayaran' : 'Payment Method'}</span>
                <span className="font-semibold">{invoice.payment_method || 'QRIS'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">{lang === 'id' ? 'Status Transaksi' : 'Transaction Status'}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{lang === 'id' ? 'Terverifikasi Berhasil' : 'Verified Successful'}</span>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-gray-200 dark:border-slate-800 print-table-th">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">#</th>
                  <th className="px-4 py-3">{lang === 'id' ? 'Deskripsi Layanan' : 'Service Description'}</th>
                  <th className="px-4 py-3">{lang === 'id' ? 'Siklus' : 'Cycle'}</th>
                  <th className="px-4 py-3 text-right">{lang === 'id' ? 'Subtotal (IDR)' : 'Subtotal (IDR)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                <tr className="print-table-td">
                  <td className="px-4 py-3.5 text-center text-slate-400">1</td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      Langganan alurku. Paket {invoice.tier_label || (invoice.tier ? invoice.tier.toUpperCase() : 'PRO')}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {lang === 'id'
                        ? 'Akses penuh fitur kolaborasi tim, penjadwalan AI cerdas, visualisasi Kanban & Gantt, dan kuota penyimpanan cloud terenkripsi.'
                        : 'Full access to team collaboration, smart AI planning, interactive Kanban & Gantt, and encrypted storage quota.'}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                    {invoice.billing_cycle === 'yearly'
                      ? (lang === 'id' ? 'Tahunan (12 Bulan)' : 'Yearly (12 Months)')
                      : (lang === 'id' ? 'Bulanan (1 Bulan)' : 'Monthly (1 Month)')}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    {formatRp(rawSubtotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals & Tax Calculation Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 max-w-sm">
              <div className="font-bold text-slate-700 dark:text-slate-300">
                {lang === 'id' ? 'Catatan Perpajakan:' : 'Tax & Legal Notes:'}
              </div>
              <p className="text-[11px] leading-relaxed">
                {lang === 'id'
                  ? 'Dokumen ini merupakan bukti transaksi elektronik yang sah dan diakui sesuai dengan ketentuan perpajakan & UU ITE Republik Indonesia. Tidak memerlukan tanda tangan basah.'
                  : 'This invoice is a valid electronic transaction document recognized under applicable Indonesian tax and electronic commerce laws. No physical signature is required.'}
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Subtotal</span>
                <span className="font-mono font-semibold">{formatRp(rawSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>
                  PPN ({Number(rawTaxRate).toFixed(rawTaxRate % 1 === 0 ? 0 : 1)}%)
                </span>
                <span className="font-mono font-semibold">{formatRp(rawTaxAmount)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t-2 border-[#111E38] dark:border-slate-700">
                <span className="text-sm font-bold text-[#111E38] dark:text-white">
                  {lang === 'id' ? 'Total Tagihan' : 'Grand Total'}
                </span>
                <span className="text-lg font-black text-[#111E38] dark:text-[#FACC15] font-mono">
                  {formatRp(invoice.amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Digital Signature & Verification Seal */}
          <div className="pt-4 border-t border-dashed border-gray-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>{lang === 'id' ? 'Terverifikasi secara digital oleh alurku. Billing Engine' : 'Digitally verified by alurku. Billing Engine'}</span>
            </div>
            <div className="font-mono text-[10px]">
              ID: {invoice.invoice_number}
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden on Print) */}
        <div className="no-print bg-gray-50 dark:bg-slate-900/60 px-6 py-4 border-t border-gray-200 dark:border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {lang === 'id' ? 'Tutup' : 'Close'}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-[#FACC15] text-[#111E38] font-black text-xs hover:bg-yellow-400 active:scale-[0.99] transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>{lang === 'id' ? 'Cetak Faktur (PDF)' : 'Print Invoice (PDF)'}</span>
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
  const [showB2B, setShowB2B] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  // Pull dynamic tax rate (PPN %) configured by administrator
  const { policies } = usePublicPolicies();
  const taxRatePercent = typeof policies?.tax_rate_percent === 'number' ? policies.tax_rate_percent : 11;

  const monthlyRate = PRICING[tier]?.[cycle] ?? 0;
  const subtotal = cycle === 'yearly' ? monthlyRate * 12 : monthlyRate;
  const taxAmount = Math.round(subtotal * (taxRatePercent / 100));
  const totalAmount = subtotal + taxAmount;
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
        {
          tier,
          billing_cycle: cycle,
          payment_method: payMethod,
          idempotency_key: idempotencyKey,
          company_name: companyName.trim() || undefined,
          tax_id: taxId.trim() || undefined,
          billing_address: billingAddress.trim() || undefined,
        },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#121B2D] border border-gray-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden my-auto transition-all">
        {/* Header */}
        <div className="bg-[#111E38] px-6 py-4 flex items-center justify-between border-b border-white/10">
          <div className="text-base font-bold">
            <span className="text-white">alur</span><span className="text-[#FACC15]">ku.</span>
            <span className="text-white/80 ml-2 font-normal text-xs">{lang === 'id' ? '— Upgrade & Pembayaran' : '— Upgrade & Checkout'}</span>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors cursor-pointer" aria-label="Close modal">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Plan selection */}
          <div className="flex gap-2">
            {(['pro', 'business']).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTier(t)}
                className={`flex-1 py-3 px-3 rounded-2xl border-2 text-xs font-bold transition-all cursor-pointer ${
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
          <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800/60 p-2 rounded-2xl border border-gray-200/80 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 pl-2">
              {lang === 'id' ? 'Siklus Penagihan:' : 'Billing Cycle:'}
            </span>
            <div className="flex bg-white dark:bg-[#111E38] rounded-xl p-1 gap-1 border border-gray-200 dark:border-slate-700">
              {['monthly', 'yearly'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCycle(c)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    cycle === c
                      ? 'bg-[#111E38] text-[#FACC15] dark:bg-[#FACC15] dark:text-[#111E38] shadow-xs'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                  }`}
                >
                  {c === 'monthly'
                    ? (lang === 'id' ? 'Bulanan' : 'Monthly')
                    : (lang === 'id' ? 'Tahunan (Hemat 20%)' : 'Yearly (Save 20%)')}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing & Tax Breakdown Card */}
          <div className="bg-[#F3F4F6]/70 dark:bg-slate-800/70 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                {lang === 'id' ? 'Tarif Dasar Paket' : 'Base Plan Price'}
              </span>
              <div className="text-right">
                <span className="text-xl font-black text-[#111E38] dark:text-white">
                  {formatRp(monthlyRate)}
                </span>
                <span className="text-xs font-normal text-slate-400">/bln</span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200/70 dark:border-slate-700/70 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>
                  Subtotal ({cycle === 'yearly' ? (lang === 'id' ? '12 Bulan' : '12 Months') : (lang === 'id' ? '1 Bulan' : '1 Month')}):
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formatRp(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <span>PPN ({taxRatePercent}%)</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {taxRatePercent > 0 ? (lang === 'id' ? '(Otomatis)' : '(Automatic)') : (lang === 'id' ? '(Bebas PPN)' : '(0% Tax)')}
                  </span>
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formatRp(taxAmount)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-gray-200 dark:border-slate-700 text-sm">
                <span className="font-black text-[#111E38] dark:text-white">
                  {lang === 'id' ? 'Total Ditagihkan' : 'Total Billed'}
                </span>
                <span className="text-base font-black text-[#111E38] dark:text-[#FACC15] font-mono">
                  {formatRp(totalAmount)}
                </span>
              </div>
            </div>

            {cycle === 'yearly' && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-center">
                {lang === 'id'
                  ? `Kamu hemat ${formatRp(yearlySavings)} per tahun dibanding bayar bulanan!`
                  : `You save ${formatRp(yearlySavings)} per year compared to monthly billing!`}
              </p>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#111E38] dark:text-slate-200">
              {lang === 'id' ? 'Pilih Metode Pembayaran' : 'Select Payment Method'}
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
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#111E38] dark:border-[#FACC15] bg-[#111E38]/5 dark:bg-[#FACC15]/15 text-[#111E38] dark:text-[#FACC15] font-bold shadow-xs'
                        : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600 dark:hover:bg-slate-800/50 font-medium'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0 text-current" />
                    <span className="truncate">{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional B2B Tax Invoice Section */}
          <div className="border border-gray-200 dark:border-slate-800 rounded-2xl p-3 bg-gray-50/60 dark:bg-slate-800/30">
            <button
              type="button"
              onClick={() => setShowB2B(!showB2B)}
              className="w-full flex items-center justify-between text-xs font-bold text-[#111E38] dark:text-slate-200 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#FACC15]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {lang === 'id' ? 'Faktur Pajak B2B / NPWP (Opsional)' : 'B2B Tax Invoice & NPWP (Optional)'}
              </span>
              <span className="text-[10px] text-gray-400">{showB2B ? '▲' : '▼'}</span>
            </button>
            {showB2B && (
              <div className="mt-3 space-y-2 pt-2 border-t border-gray-200 dark:border-slate-700/60 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 block mb-1">
                    {lang === 'id' ? 'Nama Perusahaan / PT / Instansi' : 'Company / Entity Name'}
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="PT Solusi Digital Nusantara"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#111E38] dark:text-slate-100 focus:outline-none focus:border-[#FACC15]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 block mb-1">
                    {lang === 'id' ? 'NPWP (16 Digit Baru / 15 Digit)' : 'Tax ID / NPWP'}
                  </label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="01.234.567.8-901.000"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#111E38] dark:text-slate-100 focus:outline-none focus:border-[#FACC15]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 block mb-1">
                    {lang === 'id' ? 'Alamat Faktur Pajak' : 'Billing Address'}
                  </label>
                  <input
                    type="text"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="Gedung Artha Graha Lt. 12, SCBD, Jakarta Selatan"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#111E38] dark:text-slate-100 focus:outline-none focus:border-[#FACC15]"
                  />
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-500 dark:text-red-400 font-medium text-center">{error}</p>}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={paying}
            className="w-full py-3.5 rounded-2xl bg-[#FACC15] text-[#111E38] font-black text-sm hover:bg-yellow-400 active:scale-[0.99] transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {paying
              ? (lang === 'id' ? 'Memproses Pembayaran…' : 'Processing Payment…')
              : (lang === 'id' ? `Bayar Sekarang — ${formatRp(totalAmount)}` : `Pay Now — ${formatRp(totalAmount)}`)}
          </button>
        </div>
      </div>
    </div>
  );
}
