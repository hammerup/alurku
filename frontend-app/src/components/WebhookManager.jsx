import { useState, useEffect } from 'react';
import axios from 'axios';

const EVENT_OPTIONS = [
  { value: 'task.created', label: 'Tugas Dibuat / Task Created' },
  { value: 'task.status_changed', label: 'Status Berubah / Status Changed' },
  { value: 'task.completed', label: 'Tugas Selesai / Task Completed' },
  { value: 'comment.created', label: 'Komentar Baru / New Comment' },
];

function WebhookLogModal({ webhookId, onClose, token, lang, apiBase }) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${apiBase}/webhooks/${webhookId}/deliveries`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => setDeliveries(r.data.deliveries || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [webhookId, token, apiBase]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
      <div className="bg-white dark:bg-[#121B2D] rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-base font-bold text-[#111E38] dark:text-slate-100">
            {lang === 'id' ? 'Log Pengiriman Webhook' : 'Webhook Delivery Logs'}
          </h3>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
          {loading ? (
            <p className="text-sm text-neutral-400 text-center py-6">
              {lang === 'id' ? 'Memuat…' : 'Loading…'}
            </p>
          ) : deliveries.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-6">
              {lang === 'id' ? 'Belum ada pengiriman.' : 'No deliveries yet.'}
            </p>
          ) : deliveries.map(d => (
            <div key={d.id} className="flex items-center gap-3 py-2 border-b border-neutral-100 dark:border-neutral-800/80">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${d.success ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className="text-xs font-semibold text-[#111E38] dark:text-slate-100 w-36 truncate">{d.event_type}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${d.success ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'}`}>
                {d.response_status ?? '—'}
              </span>
              <span className="text-[10px] text-neutral-400 ml-auto whitespace-nowrap">
                {d.created_at ? new Date(d.created_at).toLocaleString() : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WebhookManager({ workspaceId, lang = 'id', apiBase = '/api', token }) {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ url: '', secret: '', events: ['task.created', 'task.status_changed', 'task.completed', 'comment.created'] });
  const [saving, setSaving] = useState(false);
  const [pingResults, setPingResults] = useState({});
  const [logModal, setLogModal] = useState(null);
  const [error, setError] = useState('');

  const fetchWebhooks = () => {
    setLoading(true);
    axios.get(`${apiBase}/workspaces/${workspaceId}/webhooks`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => setWebhooks(r.data.webhooks || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWebhooks(); }, [workspaceId, token]);

  const toggleEvent = (ev) => {
    setForm(f => ({
      ...f,
      events: f.events.includes(ev) ? f.events.filter(e => e !== ev) : [...f.events, ev],
    }));
  };

  const handleCreate = async () => {
    if (!form.url.startsWith('http')) {
      setError(lang === 'id' ? 'URL harus dimulai dengan http:// atau https://' : 'URL must start with http:// or https://');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await axios.post(`${apiBase}/workspaces/${workspaceId}/webhooks`, {
        url: form.url,
        secret: form.secret || undefined,
        events: form.events,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowForm(false);
      setForm({ url: '', secret: '', events: ['task.created', 'task.status_changed', 'task.completed', 'comment.created'] });
      fetchWebhooks();
    } catch (e) {
      setError(e?.response?.data?.detail || (lang === 'id' ? 'Gagal menyimpan webhook.' : 'Failed to save webhook.'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (wh) => {
    await axios.put(`${apiBase}/webhooks/${wh.id}`, { is_active: wh.is_active ? 0 : 1 }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchWebhooks();
  };

  const handleDelete = async (id) => {
    if (!window.confirm(lang === 'id' ? 'Hapus webhook ini?' : 'Delete this webhook?')) return;
    await axios.delete(`${apiBase}/webhooks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchWebhooks();
  };

  const handleTestPing = async (id) => {
    setPingResults(p => ({ ...p, [id]: 'loading' }));
    try {
      const r = await axios.post(`${apiBase}/webhooks/${id}/test-ping`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPingResults(p => ({ ...p, [id]: r.data.success ? 'success' : `fail:${r.data.status_code}` }));
    } catch {
      setPingResults(p => ({ ...p, [id]: 'error' }));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {logModal && (
        <WebhookLogModal
          webhookId={logModal}
          onClose={() => setLogModal(null)}
          token={token}
          lang={lang}
          apiBase={apiBase}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-[#111E38] dark:text-slate-100 tracking-tight">
            {lang === 'id' ? 'Webhook & Integrasi' : 'Webhooks & Integrations'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'id'
              ? 'Kirim event otomatis ke Slack, Discord, atau sistem internal saat ada aktivitas tugas.'
              : 'Automatically dispatch events to Slack, Discord, or internal systems on task events.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FACC15] text-[#111E38] text-xs sm:text-sm font-black hover:bg-yellow-400 transition-colors shadow-xs"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {lang === 'id' ? 'Tambah Webhook' : 'Add Webhook'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-[#F3F4F6]/70 dark:bg-[#090D16]/50 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 border border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#111E38] dark:text-slate-300">
              {lang === 'id' ? 'URL Target *' : 'Target URL *'}
            </label>
            <input
              type="url"
              placeholder="https://hooks.slack.com/services/..."
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              className="px-3.5 py-2.5 text-xs sm:text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#121B2D] text-[#111E38] dark:text-slate-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#111E38] dark:text-slate-300">
              {lang === 'id' ? 'Secret (opsional, untuk verifikasi HMAC signature)' : 'Secret (optional, for HMAC signature verification)'}
            </label>
            <input
              type="text"
              placeholder="my-secret-token"
              value={form.secret}
              onChange={e => setForm(f => ({ ...f, secret: e.target.value }))}
              className="px-3.5 py-2.5 text-xs sm:text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#121B2D] text-[#111E38] dark:text-slate-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#111E38] dark:text-slate-300">
              {lang === 'id' ? 'Event yang Dilacak' : 'Subscribed Events'}
            </label>
            <div className="flex flex-wrap gap-2">
              {EVENT_OPTIONS.map(ev => (
                <button
                  type="button"
                  key={ev.value}
                  onClick={() => toggleEvent(ev.value)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-colors ${
                    form.events.includes(ev.value)
                      ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] border-[#111E38] dark:border-[#FACC15]'
                      : 'bg-white dark:bg-[#121B2D] text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  {ev.label}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleCreate}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-[#FACC15] text-[#111E38] text-xs sm:text-sm font-black hover:bg-yellow-400 transition-colors disabled:opacity-50"
            >
              {saving ? (lang === 'id' ? 'Menyimpan…' : 'Saving…') : (lang === 'id' ? 'Simpan Webhook' : 'Save Webhook')}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm font-semibold text-[#111E38] dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors"
            >
              {lang === 'id' ? 'Batal' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Webhooks list */}
      {loading ? (
        <div className="py-8 text-center text-neutral-400 text-xs">{lang === 'id' ? 'Memuat webhook…' : 'Loading webhooks…'}</div>
      ) : webhooks.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#F3F4F6]/50 dark:bg-[#090D16]/50 border border-neutral-200 dark:border-neutral-800 text-center text-xs text-neutral-400">
          {lang === 'id'
            ? 'Belum ada webhook. Tambahkan webhook pertama untuk menghubungkan alurku. dengan tool lain.'
            : 'No webhooks yet. Add your first webhook to connect alurku. with other tools.'}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {webhooks.map(wh => {
            const pingResult = pingResults[wh.id];
            return (
              <div key={wh.id} className="bg-white dark:bg-[#121B2D] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-4 sm:p-5 flex flex-col gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${wh.is_active ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-[#111E38] dark:text-slate-100 font-mono truncate">{wh.url}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {wh.events?.map(ev => (
                        <span key={ev} className="text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2 py-0.5 rounded-full font-mono">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800/80">
                  <button
                    type="button"
                    onClick={() => handleTestPing(wh.id)}
                    disabled={pingResult === 'loading'}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-[#111E38] dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    {pingResult === 'loading'
                      ? (lang === 'id' ? 'Mengirim…' : 'Sending…')
                      : pingResult === 'success'
                      ? (lang === 'id' ? 'Ping Berhasil' : 'Ping OK')
                      : pingResult?.startsWith('fail')
                      ? `Ping gagal (${pingResult.split(':')[1]})`
                      : (lang === 'id' ? 'Uji Kirim (Ping)' : 'Test Ping')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogModal(wh.id)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-[#111E38] dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    {lang === 'id' ? 'Lihat Log' : 'View Log'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(wh)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                      wh.is_active
                        ? 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                        : 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                    }`}
                  >
                    {wh.is_active
                      ? (lang === 'id' ? 'Nonaktifkan' : 'Disable')
                      : (lang === 'id' ? 'Aktifkan' : 'Enable')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(wh.id)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 dark:border-red-900/60 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ml-auto"
                  >
                    {lang === 'id' ? 'Hapus' : 'Delete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
