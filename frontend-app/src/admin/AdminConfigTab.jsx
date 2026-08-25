import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function AdminConfigTab({ language, showNotification, isSudoVerified }) {
  const tMsg = useCallback((en, id) => (language === 'id' ? id : en), [language]);

  // Credentials / System Config State
  const [configData, setConfigData] = useState({
    database_url: '',
    secret_key: '',
    google_calendar_api_key: '',
    smtp_server: '',
    smtp_port: '',
    smtp_username: '',
    smtp_password: '',
    gemini_api_key: '',
    groq_api_key: '',
  });
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  const [showPass, setShowPass] = useState({
    db: false,
    jwt: false,
    cal: false,
    smtp: false,
    gemini: false,
    groq: false,
  });

  const togglePass = (key, val) => setShowPass((prev) => ({ ...prev, [key]: val }));

  // Fetch Config
  const fetchConfig = useCallback(() => {
    axios
      .get('/api/admin/config')
      .then((res) => {
        if (res.data) {
          setConfigData({
            database_url: res.data.database_url || '',
            secret_key: res.data.secret_key || '',
            google_calendar_api_key: res.data.google_calendar_api_key || '',
            smtp_server: res.data.smtp_server || '',
            smtp_port: res.data.smtp_port || '',
            smtp_username: res.data.smtp_username || '',
            smtp_password: res.data.smtp_password || '',
            gemini_api_key: res.data.gemini_api_key || '',
            groq_api_key: res.data.groq_api_key || '',
          });
        }
      })
      .catch(() => showNotification(tMsg('Failed to load system config', 'Gagal memuat konfigurasi sistem'), 'error'));
  }, [showNotification, tMsg]);

  useEffect(() => {
    if (isSudoVerified) fetchConfig();
  }, [isSudoVerified, fetchConfig]);

  // Config Save Handler
  const handleSaveConfig = (e) => {
    e.preventDefault();
    setIsConfigSaving(true);
    axios
      .put('/api/admin/config', configData)
      .then((res) => {
        showNotification(res.data.message || tMsg('Config saved', 'Konfigurasi berhasil disimpan'), 'success');
        fetchConfig();
      })
      .catch((err) => {
        showNotification(err.response?.data?.detail || tMsg('Failed to save config', 'Gagal menyimpan konfigurasi'), 'error');
      })
      .finally(() => setIsConfigSaving(false));
  };

  return (
    <form onSubmit={handleSaveConfig} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database & Security Keys */}
        <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-6 rounded-3xl shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <span className="material-symbols-outlined text-blue-500">database</span>
            <h3 className="text-sm font-extrabold text-[#111E38] dark:text-white">
              {tMsg('Database & Security Keys', 'Database & Kunci Keamanan')}
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              PostgreSQL Database URL
            </label>
            <div className="relative">
              <input
                type={showPass.db ? 'text' : 'password'}
                value={configData.database_url}
                onChange={(e) => setConfigData({ ...configData, database_url: e.target.value })}
                className="w-full p-3 pr-10 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                placeholder="postgresql://user:password@host:5432/dbname"
              />
              <button
                type="button"
                onClick={() => togglePass('db', !showPass.db)}
                className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPass.db ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              JWT Secret Key
            </label>
            <div className="relative">
              <input
                type={showPass.jwt ? 'text' : 'password'}
                value={configData.secret_key}
                onChange={(e) => setConfigData({ ...configData, secret_key: e.target.value })}
                className="w-full p-3 pr-10 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
              />
              <button
                type="button"
                onClick={() => togglePass('jwt', !showPass.jwt)}
                className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPass.jwt ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Google Calendar API Key
            </label>
            <div className="relative">
              <input
                type={showPass.cal ? 'text' : 'password'}
                value={configData.google_calendar_api_key}
                onChange={(e) => setConfigData({ ...configData, google_calendar_api_key: e.target.value })}
                className="w-full p-3 pr-10 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
              />
              <button
                type="button"
                onClick={() => togglePass('cal', !showPass.cal)}
                className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPass.cal ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* SMTP Mail Server */}
        <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-6 rounded-3xl shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <span className="material-symbols-outlined text-emerald-500">mail</span>
            <h3 className="text-sm font-extrabold text-[#111E38] dark:text-white">
              {tMsg('SMTP Email Server (Notifications & OTP)', 'Server Email SMTP (Notifikasi & OTP)')}
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                SMTP Host
              </label>
              <input
                type="text"
                value={configData.smtp_server}
                onChange={(e) => setConfigData({ ...configData, smtp_server: e.target.value })}
                className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Port
              </label>
              <input
                type="text"
                value={configData.smtp_port}
                onChange={(e) => setConfigData({ ...configData, smtp_port: e.target.value })}
                className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                placeholder="587"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              SMTP Username / Email
            </label>
            <input
              type="text"
              value={configData.smtp_username}
              onChange={(e) => setConfigData({ ...configData, smtp_username: e.target.value })}
              className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              SMTP Password / App Password
            </label>
            <div className="relative">
              <input
                type={showPass.smtp ? 'text' : 'password'}
                value={configData.smtp_password}
                onChange={(e) => setConfigData({ ...configData, smtp_password: e.target.value })}
                className="w-full p-3 pr-10 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
              />
              <button
                type="button"
                onClick={() => togglePass('smtp', !showPass.smtp)}
                className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPass.smtp ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* AI Provider Keys */}
        <div className="bg-white dark:bg-[#121B2D] border border-neutral-200/80 dark:border-neutral-800/80 p-6 rounded-3xl shadow-2xs space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <span className="material-symbols-outlined text-amber-500">smart_toy</span>
            <h3 className="text-sm font-extrabold text-[#111E38] dark:text-white">
              {tMsg('Artificial Intelligence (AI) API Keys', 'Kunci API Kecerdasan Buatan (AI)')}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Google Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showPass.gemini ? 'text' : 'password'}
                  value={configData.gemini_api_key}
                  onChange={(e) => setConfigData({ ...configData, gemini_api_key: e.target.value })}
                  className="w-full p-3 pr-10 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                />
                <button
                  type="button"
                  onClick={() => togglePass('gemini', !showPass.gemini)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPass.gemini ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Groq API Key (GPT-OSS 120B Fast Inference)
              </label>
              <div className="relative">
                <input
                  type={showPass.groq ? 'text' : 'password'}
                  value={configData.groq_api_key}
                  onChange={(e) => setConfigData({ ...configData, groq_api_key: e.target.value })}
                  className="w-full p-3 pr-10 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-mono outline-none focus:border-[#111E38] dark:focus:border-[#FACC15]"
                />
                <button
                  type="button"
                  onClick={() => togglePass('groq', !showPass.groq)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPass.groq ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isConfigSaving}
          className="px-8 py-3 bg-[#FACC15] hover:bg-amber-400 text-[#111E38] font-black text-xs rounded-2xl shadow-md border border-amber-400/80 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span>{isConfigSaving ? tMsg('Updating...', 'Memperbarui...') : tMsg('Save System Configuration', 'Simpan Konfigurasi Sistem')}</span>
        </button>
      </div>
    </form>
  );
}
