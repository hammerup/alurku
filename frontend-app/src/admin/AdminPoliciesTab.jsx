import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function AdminPoliciesTab({ language, showNotification }) {
  const tMsg = (en, id) => (language === 'id' ? id : en);

  // Policies State
  const [policies, setPolicies] = useState({
    org_name: 'alurku.',
    default_language: 'id',
    allow_public_signup: true,
    allowed_domains: '',
    session_duration_days: 30,
    soft_delete_grace_days: 90,
    max_upload_size_mb: 10,
    default_ai_engine: 'auto',
    enable_proactive_nudge: true,
    enable_auto_subtasks: true,
  });
  const [isPoliciesSaving, setIsPoliciesSaving] = useState(false);

  // Fetch Policies
  const fetchPolicies = useCallback(() => {
    axios
      .get('/api/admin/policies')
      .then((res) => {
        if (res.data) setPolicies(res.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  // Policy Save Handler
  const handleSavePolicies = (e) => {
    e.preventDefault();
    setIsPoliciesSaving(true);
    axios
      .put('/api/admin/policies', policies)
      .then((res) => {
        showNotification(res.data.message || tMsg('Policies saved', 'Kebijakan berhasil disimpan'), 'success');
      })
      .catch((err) => {
        showNotification(err.response?.data?.detail || tMsg('Failed to save policies', 'Gagal menyimpan kebijakan'), 'error');
      })
      .finally(() => setIsPoliciesSaving(false));
  };

  return (
    <form onSubmit={handleSavePolicies} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box 1: Organization Identity & Defaults */}
        <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-6 rounded-3xl shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <span className="material-symbols-outlined text-blue-500">apartment</span>
            <h3 className="text-sm font-extrabold text-[#111E38] dark:text-white">
              {tMsg('Organization Identity & Defaults', 'Identitas Organisasi & Bawaan')}
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              {tMsg('Organization / Workspace Brand Name', 'Nama Organisasi / Brand Workspace')}
            </label>
            <input
              type="text"
              value={policies.org_name}
              onChange={(e) => setPolicies({ ...policies, org_name: e.target.value })}
              className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
              placeholder="alurku."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              {tMsg('Default Application Language', 'Bahasa Default Aplikasi')}
            </label>
            <select
              value={policies.default_language}
              onChange={(e) => setPolicies({ ...policies, default_language: e.target.value })}
              className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold outline-none focus:border-[#111E38] dark:focus:border-[#FACC15] cursor-pointer"
            >
              <option value="id">Bahasa Indonesia (ID) — Default</option>
              <option value="en">English (EN)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              {tMsg('Max File Upload Limit (MB)', 'Batas Maksimal Ukuran Unggah File (MB)')}
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={policies.max_upload_size_mb}
              onChange={(e) => setPolicies({ ...policies, max_upload_size_mb: Number(e.target.value) })}
              className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
            />
          </div>
        </div>

        {/* Box 2: Registration & Access Controls */}
        <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-6 rounded-3xl shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <span className="material-symbols-outlined text-amber-500">lock_person</span>
            <h3 className="text-sm font-extrabold text-[#111E38] dark:text-white">
              {tMsg('Registration & Security Policies', 'Registrasi & Kebijakan Keamanan')}
            </h3>
          </div>

          <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50">
            <div>
              <div className="text-xs font-bold text-[#111E38] dark:text-white">
                {tMsg('Allow Public Self-Registration', 'Izinkan Pendaftaran Publik Mandiri')}
              </div>
              <div className="text-[10px] text-neutral-400">
                {tMsg('When disabled, only admins can create new accounts.', 'Jika dinonaktifkan, hanya admin yang bisa menambahkan akun baru.')}
              </div>
            </div>
            <input
              type="checkbox"
              checked={policies.allow_public_signup}
              onChange={(e) => setPolicies({ ...policies, allow_public_signup: e.target.checked })}
              className="w-5 h-5 accent-[#111E38] dark:accent-[#FACC15] cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              {tMsg('Restricted Email Domains (Whitelist)', 'Pembatasan Domain Email (Whitelist)')}
            </label>
            <input
              type="text"
              value={policies.allowed_domains}
              onChange={(e) => setPolicies({ ...policies, allowed_domains: e.target.value })}
              className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
              placeholder="e.g. company.com, agency.id (kosongkan untuk bebas)"
            />
            <span className="text-[10px] text-neutral-400 mt-1 block">
              {tMsg('Separate multiple domains with commas. Leave blank to allow any email.', 'Pisahkan domain dengan koma. Kosongkan jika mengizinkan semua email.')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                {tMsg('Session Timeout (Days)', 'Durasi Sesi Login (Hari)')}
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={policies.session_duration_days}
                onChange={(e) => setPolicies({ ...policies, session_duration_days: Number(e.target.value) })}
                className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                {tMsg('Soft Delete Grace (Days)', 'Retensi Hapus Akun (Hari)')}
              </label>
              <input
                type="number"
                min="7"
                max="365"
                value={policies.soft_delete_grace_days}
                onChange={(e) => setPolicies({ ...policies, soft_delete_grace_days: Number(e.target.value) })}
                className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
              />
            </div>
          </div>
        </div>

        {/* Box 3: AI Assistant & Automation Policies */}
        <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-6 rounded-3xl shadow-2xs space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <span className="material-symbols-outlined text-purple-500">auto_awesome</span>
            <h3 className="text-sm font-extrabold text-[#111E38] dark:text-white">
              {tMsg('AI Assistant & Automation Policies (Luruka AI)', 'Kebijakan Asisten AI & Otomasi (Luruka AI)')}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                {tMsg('Primary AI Engine Provider', 'Penyedia Model AI Utama')}
              </label>
              <select
                value={policies.default_ai_engine}
                onChange={(e) => setPolicies({ ...policies, default_ai_engine: e.target.value })}
                className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold outline-none focus:border-[#111E38] dark:focus:border-[#FACC15] cursor-pointer"
              >
                <option value="auto">Auto (Gemini & Groq Fallback)</option>
                <option value="gemini">Google Gemini 2.5 Flash</option>
                <option value="groq">Groq (GPT-OSS 120B)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50">
              <div>
                <div className="text-xs font-bold text-[#111E38] dark:text-white">
                  {tMsg('Proactive Deadline Nudge', 'Pengingat Deadline Otomatis')}
                </div>
                <div className="text-[10px] text-neutral-400">
                  {tMsg('AI nudges tasks nearing due date.', 'AI mengingatkan tugas mendekati deadline.')}
                </div>
              </div>
              <input
                type="checkbox"
                checked={policies.enable_proactive_nudge}
                onChange={(e) => setPolicies({ ...policies, enable_proactive_nudge: e.target.checked })}
                className="w-5 h-5 accent-[#111E38] dark:accent-[#FACC15] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50">
              <div>
                <div className="text-xs font-bold text-[#111E38] dark:text-white">
                  {tMsg('Automatic Subtask Breakdown', 'Pemecahan Subtask Otomatis')}
                </div>
                <div className="text-[10px] text-neutral-400">
                  {tMsg('AI generates suggested subtasks.', 'AI otomatis memecah tugas kompleks.')}
                </div>
              </div>
              <input
                type="checkbox"
                checked={policies.enable_auto_subtasks}
                onChange={(e) => setPolicies({ ...policies, enable_auto_subtasks: e.target.checked })}
                className="w-5 h-5 accent-[#111E38] dark:accent-[#FACC15] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPoliciesSaving}
          className="px-8 py-3 bg-[#FACC15] hover:bg-amber-400 text-[#111E38] font-black text-xs rounded-2xl shadow-md border border-amber-400/80 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span>{isPoliciesSaving ? tMsg('Saving...', 'Menyimpan...') : tMsg('Save Organization Policies', 'Simpan Kebijakan Organisasi')}</span>
        </button>
      </div>
    </form>
  );
}
