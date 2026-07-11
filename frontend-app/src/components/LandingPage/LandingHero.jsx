import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function LandingHero({ setIsLoginMode, setShowAuthForm, language }) {
  const isId = language === 'id';

  const tagline = isId
    ? 'Berhenti mengingat semua tugasmu, mulailah menyelesaikannya.'
    : 'Stop remembering all your tasks, start completing them.';

  const title = isId
    ? 'Tingkatkan Alur Kerja Tim Anda'
    : "Supercharge Your Team's Workflow";

  const subtitle = isId
    ? 'alurku. adalah asisten cerdas yang mengubah tumpukan rencana kerjamu menjadi alur eksekusi yang rapi. Fokus pada hasil, biarkan AI kami yang mengatur jadwalnya.'
    : 'alurku. turns your pile of plans into a clean execution flow. Focus on results, let our AI manage the schedule.';

  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = () => {
    setIsLoginMode(false);
    setShowAuthForm(true);
  };

  const handleQuickSignup = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);

    axios.post('/api/quick-register', { email: email.trim(), origin: window.location.origin })
      .then((res) => {
        const { username, password } = res.data;
        // Langsung login otomatis
        return axios.post('/api/login', { username, password });
      })
      .then((loginRes) => {
        localStorage.setItem('alurku_auth', 'true');
        localStorage.setItem('alurku_token', loginRes.data.token);
        localStorage.setItem('alurku_username', loginRes.data.username || email.split('@')[0]);

        sessionStorage.setItem('alurku_trial_signup', 'true');
        window.location.href = '/';
      })
      .catch((err) => {
        setIsLoading(false);
        const errorMsg = err.response?.data?.detail || (isId ? 'Pendaftaran gagal!' : 'Registration failed!');
        window.dispatchEvent(new CustomEvent('show-notification', { 
          detail: { message: errorMsg, type: 'error' } 
        }));
      });
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-[#111E38] text-white"
      style={{ minHeight: '100vh', paddingTop: '80px', paddingBottom: '120px' }}
    >
      <div
        className="max-w-[1440px] mx-auto px-8 lg:px-16 grid items-center"
        style={{ gridTemplateColumns: '1fr 1.4fr', gap: '60px', minHeight: 'calc(100vh - 200px)' }}
      >
        {/* ── LEFT: COPY ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col"
        >
          {/* Tagline capsule pill above H1 */}
          <div className="inline-flex items-center self-start mb-5">
            <span className="text-xs font-semibold text-white/80 border border-white/20 bg-white/10 px-4 py-1.5 rounded-full leading-snug">
              {tagline}
            </span>
          </div>

          <h1
            className="font-bold text-white leading-none tracking-tight mb-8"
            style={{ fontSize: 'clamp(42px, 5vw, 76px)' }}
          >
            {title}
          </h1>
          <p className="text-neutral-300 leading-relaxed mb-12" style={{ fontSize: '1.1rem', maxWidth: '420px' }}>
            {subtitle}
          </p>

          {showEmailInput ? (
            <form onSubmit={handleQuickSignup} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-md animate-fade-up">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isId ? "Masukkan email Anda..." : "Enter your email..."}
                className="flex-1 px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-neutral-400 focus:outline-none focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] transition-all text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3.5 rounded-full font-bold text-[#111E38] bg-[#FACC15] hover:bg-[#EAB308] disabled:bg-neutral-500 disabled:text-neutral-300 transition-colors text-sm shrink-0 flex items-center justify-center min-w-[100px]"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-[#111E38]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  isId ? 'Daftar' : 'Sign Up'
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowEmailInput(false)}
                className="px-4 py-3.5 rounded-full text-white/60 hover:text-white transition-colors text-sm"
                disabled={isLoading}
              >
                {isId ? 'Batal' : 'Cancel'}
              </button>
            </form>
          ) : (
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleStart}
                className="px-8 py-4 rounded-full font-bold text-[#111E38] bg-[#FACC15] hover:bg-[#EAB308] transition-colors"
                style={{ fontSize: '1rem' }}
              >
                {isId ? 'Mulai Rapikan alurku.' : 'Start tidying up alurku.'}
              </button>
              <button
                onClick={() => setShowEmailInput(true)}
                className="px-8 py-4 rounded-full font-bold text-white border-2 border-white hover:bg-white/10 transition-colors"
                style={{ fontSize: '1rem' }}
              >
                {isId ? 'Coba Gratis' : 'Try Free'}
              </button>
            </div>
          )}
        </motion.div>

        {/* ── RIGHT: MOCKUP CLUSTER ── */}
        <motion.div
          initial={{ opacity: 0, x: 48 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative"
          style={{ height: '580px' }}
        >

          {/* ─── MAIN DASHBOARD WINDOW ─── */}
          <div
            className="absolute bg-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-200"
            style={{ top: '20px', left: '0px', right: '0px', bottom: '0px' }}
          >
            {/* Window Chrome */}
            <div className="flex items-center gap-2 px-4 border-b border-neutral-100 bg-white" style={{ height: '40px' }}>
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 flex justify-center">
                <div className="bg-neutral-50 border border-neutral-200 rounded px-6 py-0.5 text-[10px] text-neutral-400 font-medium">
                  app.alurku.id
                </div>
              </div>
            </div>

            {/* App Body */}
            <div className="flex h-full">

              {/* Sidebar */}
              <div className="border-r border-neutral-100 bg-white flex flex-col" style={{ width: '168px', padding: '16px 12px' }}>
                {/* Logo — lowercase 'a' in squircle */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-7 h-7 bg-[#FACC15] rounded-lg flex items-center justify-center font-black text-[#111E38] text-base leading-none">a</div>
                  <span className="font-extrabold text-[#111E38] text-sm tracking-tight">
                    <span>alur</span><span className="text-[#FACC15]">ku</span><span>.</span>
                  </span>
                </div>

                {/* Workspace label */}
                <div className="mb-3">
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider px-1 mb-1">Workspace</p>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-neutral-50 border border-neutral-100">
                    <div className="w-3 h-3 rounded-sm bg-purple-400 shrink-0" />
                    <span className="text-[10px] font-semibold text-[#111E38] truncate">Creative Agency</span>
                  </div>
                </div>

                {/* Nav items */}
                <div className="space-y-0.5">
                  {/* Active */}
                  <div className="flex items-center gap-2 px-2 py-1.5 bg-neutral-100 rounded-lg relative">
                    <div className="absolute left-0 inset-y-1.5 w-1 bg-[#FACC15] rounded-r-full" />
                    <svg className="w-3 h-3 text-[#111E38] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0v10m0-10a2 2 0 012 2h2a2 2 0 012-2V7" />
                    </svg>
                    <span className="text-[10px] font-bold text-[#111E38] leading-tight">Kanban Board</span>
                  </div>
                  {[
                    { label: 'My To-Do List', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                    { label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                    { label: 'Timeline', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
                      <svg className="w-3 h-3 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                      </svg>
                      <span className="text-[10px] text-neutral-400 font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom: Projects */}
                <div className="mt-4 pt-3 border-t border-neutral-100">
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider px-1 mb-1.5">All Projects</p>
                  {['Brand Identity', 'UI Design Sprint', 'Dev Sprint Q3'].map((proj, i) => (
                    <div key={proj} className="flex items-center gap-1.5 px-2 py-1">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${i === 0 ? 'bg-purple-400' : i === 1 ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                      <span className="text-[10px] text-neutral-400">{proj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 flex flex-col overflow-hidden bg-neutral-50/50" style={{ padding: '16px 16px 0' }}>
                {/* Header row */}
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <div>
                    <h3 className="font-extrabold text-[#111E38]" style={{ fontSize: '14px' }}>Kanban Board</h3>
                    <p className="text-[10px] text-neutral-400">Manage and track your creative tasks efficiently.</p>
                  </div>
                  <button className="flex items-center gap-1 text-[10px] font-bold text-white bg-[#111E38] hover:bg-neutral-800 transition-colors px-3 py-1.5 rounded-lg">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    New Request
                  </button>
                </div>

                {/* View tabs */}
                <div className="flex items-center gap-2 mb-4 shrink-0">
                  {['Board', 'List', 'Analytics', 'Timeline', 'Calendar'].map((t, i) => (
                    <span
                      key={t}
                      className={`text-[10px] font-semibold px-2 py-1 rounded ${i === 0 ? 'bg-white border border-neutral-200 text-[#111E38] shadow-sm' : 'text-neutral-400'}`}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Kanban grid — 4 columns matching real app */}
                <div className="flex gap-3 flex-1 overflow-hidden pb-4">

                  {/* ── COL 1: To Do ── */}
                  <div className="w-[148px] shrink-0 flex flex-col gap-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-neutral-700">To Do</span>
                        <span className="w-4 h-4 rounded-full bg-neutral-200 text-[8px] font-bold text-neutral-500 flex items-center justify-center">3</span>
                      </div>
                      <span className="text-neutral-300 text-xs">+</span>
                    </div>
                    {/* Task card 1 — Design Team */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-2.5 shadow-sm space-y-1.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-bold bg-purple-100 text-purple-500 px-1 py-0.5 rounded">P1</span>
                        <span className="text-[8px] text-neutral-400 bg-neutral-100 px-1 py-0.5 rounded">Design</span>
                      </div>
                      <p className="text-[9px] font-semibold text-neutral-700 leading-tight">Brand Identity Revamp — Logo System</p>
                      <div className="flex items-center justify-between pt-0.5">
                        <div className="flex items-center gap-0.5">
                          <div className="w-3.5 h-3.5 rounded-full bg-purple-400 border border-white" />
                          <div className="w-3.5 h-3.5 rounded-full bg-pink-300 border border-white -ml-1" />
                        </div>
                        <span className="text-[8px] text-neutral-400">10 Jul</span>
                      </div>
                    </div>
                    {/* Task card 2 — Dev Team */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-2.5 shadow-sm space-y-1.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-bold bg-blue-100 text-blue-500 px-1 py-0.5 rounded">P2</span>
                        <span className="text-[8px] text-neutral-400 bg-neutral-100 px-1 py-0.5 rounded">Dev</span>
                      </div>
                      <p className="text-[9px] font-semibold text-neutral-700 leading-tight">Setup CI/CD Pipeline & Staging Env</p>
                      <div className="flex items-center justify-between pt-0.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-blue-400 border border-white" />
                        <span className="text-[8px] text-neutral-400">12 Jul</span>
                      </div>
                    </div>
                  </div>

                  {/* ── COL 2: In Progress ── */}
                  <div className="w-[148px] shrink-0 flex flex-col gap-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-blue-600">In Progress</span>
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-[8px] font-bold text-blue-600 flex items-center justify-center">2</span>
                      </div>
                      <span className="text-neutral-300 text-xs">+</span>
                    </div>
                    {/* Task card — Design */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-2.5 shadow-sm space-y-1.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-bold bg-purple-100 text-purple-500 px-1 py-0.5 rounded">P1</span>
                        <span className="text-[8px] text-neutral-400 bg-neutral-100 px-1 py-0.5 rounded">Design</span>
                      </div>
                      <p className="text-[9px] font-semibold text-neutral-700 leading-tight">UI Mockup — Dashboard v2 Redesign</p>
                      <div className="w-full bg-neutral-100 rounded-full h-1.5">
                        <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: '70%' }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0.5">
                          <div className="w-3.5 h-3.5 rounded-full bg-purple-300 border border-white" />
                          <div className="w-3.5 h-3.5 rounded-full bg-pink-300 border border-white -ml-1" />
                        </div>
                        <span className="text-[8px] font-bold text-purple-500 bg-purple-50 px-1 py-0.5 rounded">4h ETC</span>
                      </div>
                    </div>
                    {/* Smart Nudge card — Dev */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-2.5 shadow-sm space-y-1.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-bold bg-amber-100 text-amber-600 px-1 py-0.5 rounded">Nudge</span>
                        <span className="text-[8px] text-neutral-400 bg-neutral-100 px-1 py-0.5 rounded">Dev</span>
                      </div>
                      <p className="text-[9px] font-semibold text-neutral-700 leading-tight">Refactor Auth Module & Write Unit Tests</p>
                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg px-1.5 py-1">
                        <svg className="w-2.5 h-2.5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="text-[8px] font-semibold text-amber-600">Smart Nudge aktif</span>
                      </div>
                    </div>
                  </div>

                  {/* ── COL 3: Done ── */}
                  <div className="w-[148px] shrink-0 flex flex-col gap-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-emerald-600">Done</span>
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-[8px] font-bold text-emerald-600 flex items-center justify-center">4</span>
                      </div>
                      <span className="text-neutral-300 text-xs">+</span>
                    </div>
                    <div className="bg-white rounded-xl border border-neutral-200 p-2.5 shadow-sm space-y-1 opacity-80">
                      <span className="text-[8px] font-bold bg-neutral-100 text-neutral-400 px-1.5 py-0.5 rounded">Completed</span>
                      <p className="text-[9px] font-semibold text-neutral-500 leading-tight line-through">Color Palette & Typography Guide</p>
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-[8px] text-emerald-500 font-semibold">Selesai</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-neutral-200 p-2.5 shadow-sm space-y-1 opacity-80">
                      <span className="text-[8px] font-bold bg-neutral-100 text-neutral-400 px-1.5 py-0.5 rounded">Completed</span>
                      <p className="text-[9px] font-semibold text-neutral-500 leading-tight line-through">API Integration — Figma Design Tokens</p>
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-[8px] text-emerald-500 font-semibold">Selesai</span>
                      </div>
                    </div>
                  </div>

                  {/* ── COL 4: Rejected ── */}
                  <div className="w-[110px] shrink-0 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold text-red-500">Rejected</span>
                      <span className="w-4 h-4 rounded-full bg-red-100 text-[8px] font-bold text-red-500 flex items-center justify-center">1</span>
                    </div>
                    <div className="border-2 border-dashed border-neutral-200 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5" style={{ minHeight: '60px' }}>
                      <svg className="w-4 h-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-[8px] text-neutral-300 font-medium text-center">Add Status</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* ─── TOP-RIGHT FLOATING CARD: AI Insight ─── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="absolute bg-white rounded-2xl shadow-xl border border-neutral-100 flex items-center gap-3 z-20"
            style={{ top: '-20px', right: '-32px', padding: '12px 16px', width: '256px' }}
          >
            <div className="w-10 h-10 bg-[#111E38] rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#FACC15]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-[#111E38]">Smart Assistant</p>
              <p className="text-[9px] text-neutral-500 leading-snug mt-0.5">UI Mockup task due today. 70% progress — on track!</p>
              <div className="flex items-center gap-1 mt-1.5">
                <div className="w-full bg-neutral-100 rounded-full h-1">
                  <div className="bg-[#FACC15] h-1 rounded-full" style={{ width: '70%' }} />
                </div>
                <span className="text-[8px] text-neutral-400 shrink-0">70%</span>
              </div>
            </div>
          </motion.div>

          {/* ─── BOTTOM-LEFT FLOATING: Collaboration card ─── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="absolute bg-white rounded-2xl shadow-2xl border border-neutral-100 z-20"
            style={{ bottom: '-44px', left: '-52px', padding: '16px', width: '270px' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm font-extrabold text-[#111E38]">Team Collaboration</p>
            </div>
            {/* Member row */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex -space-x-2">
                {[
                  { bg: 'bg-purple-400', init: 'R' },
                  { bg: 'bg-blue-400', init: 'A' },
                  { bg: 'bg-pink-400', init: 'S' },
                  { bg: 'bg-emerald-400', init: 'D' },
                ].map((m) => (
                  <div key={m.init} className={`w-8 h-8 rounded-full ${m.bg} border-2 border-white flex items-center justify-center text-[10px] font-bold text-white`}>{m.init}</div>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#111E38]">4 anggota aktif</p>
                <p className="text-[9px] text-neutral-400">Design + Dev Team</p>
              </div>
            </div>
            {/* Activity lines */}
            <div className="space-y-2">
              <div className="h-2 w-full bg-neutral-100 rounded-full" />
              <div className="h-2 w-4/5 bg-neutral-100 rounded-full" />
              <div className="h-2 w-full bg-neutral-100 rounded-full" />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer border border-blue-100">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Discuss
              </div>
              <div className="flex items-center gap-1.5 bg-neutral-50 text-neutral-600 font-bold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer border border-neutral-100">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Assign
              </div>
            </div>
          </motion.div>

          {/* ─── BOTTOM-RIGHT FLOATING: Task Detail (small) ─── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.3, duration: 0.5 }}
            className="absolute bg-white rounded-2xl shadow-xl border border-neutral-100 z-30"
            style={{ bottom: '-60px', right: '-36px', padding: '14px', width: '240px' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-[#111E38] rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-[#FACC15]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-extrabold text-[#111E38] truncate">UI Mockup Dashboard v2</p>
                <p className="text-[8px] text-neutral-400">#05 · Design · @rania</p>
              </div>
              <div className="bg-blue-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full shrink-0">In Progress</div>
            </div>
            <div className="space-y-1.5">
              {[
                { done: true, text: 'Wireframe screens mapped' },
                { done: true, text: 'Component library set up' },
                { done: false, text: 'High-fidelity mockup export' },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-2 bg-neutral-50 rounded-lg px-2 py-1.5">
                  <div className={`w-3 h-3 rounded border-2 shrink-0 flex items-center justify-center ${t.done ? 'bg-[#111E38] border-[#111E38]' : 'border-neutral-300'}`}>
                    {t.done && <svg className="w-1.5 h-1.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className={`text-[8px] leading-tight ${t.done ? 'line-through text-neutral-400' : 'text-neutral-600'}`}>{t.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
