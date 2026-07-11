import React from 'react';
import { motion } from 'framer-motion';

/* ─── Mini Kanban card component matching real alurku. task cards ─── */
function KanbanCard({ title, priority, priorityColor, category, assigneeColor, deadline, done = false, nudge = false }) {
  return (
    <div className={`rounded-xl border p-2.5 mb-2.5 shadow-sm bg-white border-neutral-200 ${done ? 'opacity-70' : ''}`}>
      {/* Priority + Category badges */}
      <div className="flex items-center gap-1 mb-1.5">
        {priority && (
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${priorityColor}`}>{priority}</span>
        )}
        {category && (
          <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-neutral-100 text-neutral-500">{category}</span>
        )}
        {nudge && (
          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-100 text-amber-600">Nudge</span>
        )}
      </div>
      {/* Title */}
      <p className={`text-[10px] font-semibold leading-tight mb-2 ${done ? 'line-through text-neutral-400' : 'text-neutral-700'}`}>
        {title}
      </p>
      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          {assigneeColor && (
            <div className={`w-4 h-4 rounded-full ${assigneeColor} border-2 border-white`} />
          )}
          {done && (
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[8px] text-emerald-500 font-semibold">Selesai</span>
            </div>
          )}
        </div>
        {deadline && <span className="text-[8px] text-neutral-400">{deadline}</span>}
      </div>
    </div>
  );
}

/* ─── Floating dragged card ─── */
function DragCard() {
  return (
    <motion.div
      animate={{ y: [0, -8, 0], rotate: [0, 1.5, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute top-[80px] left-[30%] z-20 w-[178px] bg-white rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.18)] border border-neutral-200 p-2.5 cursor-grab"
      style={{ transform: 'rotate(2deg)' }}
    >
      <div className="flex items-center gap-1 mb-1.5">
        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-purple-100 text-purple-600">P1</span>
        <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-neutral-100 text-neutral-500">Design</span>
      </div>
      <p className="text-[10px] font-semibold text-neutral-700 mb-2 leading-tight">Brand Identity Revamp — Logo System</p>
      <div className="flex items-center gap-0.5">
        <div className="w-4 h-4 rounded-full bg-purple-400 border-2 border-white" />
        <div className="w-4 h-4 rounded-full bg-pink-300 border-2 border-white -ml-1" />
        <span className="ml-auto text-[8px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-full">⟳ Move</span>
      </div>
    </motion.div>
  );
}

export default function LandingDetailedFeature({ language }) {
  const isId = language === 'id';

  const title = isId ? 'Visualisasikan & Kelola Setiap Langkah' : 'Visualize & Manage Every Step';
  const subtitle = isId
    ? 'alurku. menyajikan papan Kanban interaktif yang terhubung dengan linimasa proyek dan analitik beban kerja. Kelola semua tugas tim dalam satu tampilan yang bersih.'
    : 'alurku. provides interactive Kanban boards connected with project timelines and workload analytics. Manage all team tasks in one clean view.';
  const cta = isId ? 'Jelajahi Fitur' : 'Explore Features';

  return (
    <section className="w-full bg-neutral-100/60 overflow-hidden" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
      <div className="max-w-[1440px] mx-auto px-8 lg:px-16 grid items-center" style={{ gridTemplateColumns: '400px 1fr', gap: '80px' }}>

        {/* ── LEFT: Copy ── */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col"
        >
          <h2 className="font-bold text-[#111E38] leading-tight mb-6" style={{ fontSize: 'clamp(32px, 3.5vw, 50px)' }}>
            {title}
          </h2>
          <p className="text-neutral-500 leading-relaxed mb-10" style={{ fontSize: '15px', maxWidth: '360px' }}>
            {subtitle}
          </p>
          <button className="self-start px-8 py-4 rounded-full font-bold text-[#111E38] bg-[#FACC15] hover:bg-[#EAB308] transition-colors shadow-md" style={{ fontSize: '15px' }}>
            {cta}
          </button>
        </motion.div>

        {/* ── RIGHT: Large Kanban Mockup (bleeds to right edge) ── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative"
          style={{ height: '520px' }}
        >
          {/* Main App Window — starts mid-left, bleeds off right */}
          <div
            className="absolute bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-neutral-200 overflow-hidden flex flex-col"
            style={{ top: 0, left: 0, right: '-120px', bottom: 0 }}
          >
            {/* Window Chrome */}
            <div className="flex items-center gap-2 px-5 border-b border-neutral-100" style={{ height: '42px' }}>
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 flex justify-center">
                <div className="bg-neutral-50 border border-neutral-100 rounded px-10 py-0.5 text-[10px] text-neutral-400">app.alurku.id</div>
              </div>
              <button className="text-[10px] text-white bg-[#111E38] border border-neutral-200 px-3 py-1 rounded-lg font-semibold">+ New Request</button>
            </div>

            {/* App Content */}
            <div className="flex flex-1 overflow-hidden">

              {/* Sidebar */}
              <div className="border-r border-neutral-100 bg-white shrink-0 flex flex-col" style={{ width: '180px', padding: '16px 12px' }}>
                {/* Logo — lowercase 'a' */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 bg-[#FACC15] rounded-lg flex items-center justify-center font-black text-[#111E38] text-base leading-none">a</div>
                  <span className="font-extrabold text-sm text-[#111E38]">
                    <span>alur</span><span className="text-[#FACC15]">ku</span><span>.</span>
                  </span>
                </div>
                {/* Workspace */}
                <div className="mb-3">
                  <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider px-1 mb-1">Workspace</p>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-50 border border-neutral-100">
                    <div className="w-2.5 h-2.5 rounded-sm bg-blue-400 shrink-0" />
                    <span className="text-[10px] font-semibold text-[#111E38] truncate">Pribadi</span>
                  </div>
                </div>
                {/* Nav */}
                <div className="space-y-0.5 text-[11px]">
                  {[
                    { label: 'Kanban Board', active: true, iconPath: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0v10m0-10a2 2 0 012 2h2a2 2 0 012-2V7' },
                    { label: 'My To-Do List', iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                    { label: 'Analytics', iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                    { label: 'Timeline', iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${item.active ? 'bg-neutral-100 font-bold text-[#111E38]' : 'text-neutral-400'}`}
                    >
                      <svg className={`w-3 h-3 shrink-0 ${item.active ? 'text-[#111E38]' : 'text-neutral-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.iconPath} />
                      </svg>
                      <span className="leading-tight text-[10px]">{item.label}</span>
                    </div>
                  ))}
                </div>
                {/* Projects */}
                <div className="mt-4 pt-3 border-t border-neutral-100">
                  <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider px-1 mb-1.5">All Projects</p>
                  {['Design', 'System Feedback'].map((proj) => (
                    <div key={proj} className="flex items-center gap-1.5 px-2 py-1">
                      <div className="w-2 h-2 rounded-full bg-blue-300 shrink-0" />
                      <span className="text-[10px] text-neutral-400">{proj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kanban Area */}
              <div className="flex-1 bg-neutral-50/50 overflow-hidden relative" style={{ padding: '16px 16px 0' }}>
                {/* Sub-header */}
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <div>
                    <p className="text-sm font-extrabold text-[#111E38]">Kanban Board</p>
                    <p className="text-[10px] text-neutral-400">Manage and track your operational tasks efficiently.</p>
                  </div>
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

                {/* Columns */}
                <div className="flex gap-4 h-full pb-6" style={{ minWidth: '900px' }}>

                  {/* ── To Do ── */}
                  <div className="w-[200px] shrink-0">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-neutral-700">To Do</span>
                        <span className="w-4 h-4 rounded-full bg-neutral-200 text-[8px] font-bold text-neutral-500 flex items-center justify-center">3</span>
                      </div>
                      <span className="text-neutral-400 text-xs">+</span>
                    </div>
                    <KanbanCard
                      title="Brand Identity Revamp — Logo System"
                      priority="P1"
                      priorityColor="bg-purple-100 text-purple-600"
                      category="Design"
                      assigneeColor="bg-purple-400"
                      deadline="10 Jul"
                    />
                    <KanbanCard
                      title="Setup CI/CD Pipeline & Staging Env"
                      priority="P2"
                      priorityColor="bg-blue-100 text-blue-500"
                      category="Dev"
                      assigneeColor="bg-blue-400"
                      deadline="12 Jul"
                    />
                  </div>

                  {/* ── In Progress (with drag interaction) ── */}
                  <div className="w-[220px] shrink-0 relative">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-blue-600">In Progress</span>
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-[8px] font-bold text-blue-600 flex items-center justify-center">2</span>
                      </div>
                      <span className="text-neutral-400 text-xs">+</span>
                    </div>
                    {/* Drop target placeholder */}
                    <div className="bg-neutral-100 rounded-xl border-2 border-dashed border-neutral-300 h-24 flex items-center justify-center mb-3">
                      <span className="text-[10px] text-neutral-400">Drop here</span>
                    </div>
                    {/* Floating dragged card */}
                    <DragCard />
                    {/* Arrow — clean straight downward arrow from card into drop zone */}
                    <div className="absolute top-[54px] right-4 z-30">
                      <svg width="20" height="48" viewBox="0 0 20 48" fill="none">
                        {/* Vertical dashed line */}
                        <line x1="10" y1="2" x2="10" y2="36" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round"/>
                        {/* Clean arrowhead pointing straight down */}
                        <path d="M4 34 L10 44 L16 34" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                    </div>
                    <KanbanCard
                      title="UI Mockup — Dashboard v2 Redesign"
                      nudge={true}
                      assigneeColor="bg-purple-300"
                      deadline="8 Jul"
                    />
                  </div>

                  {/* ── Done ── */}
                  <div className="w-[200px] shrink-0">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-emerald-600">Done</span>
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-[8px] font-bold text-emerald-600 flex items-center justify-center">4</span>
                      </div>
                      <span className="text-neutral-400 text-xs">+</span>
                    </div>
                    <KanbanCard
                      title="Color Palette & Typography Guide"
                      assigneeColor="bg-purple-300"
                      deadline="1 Jul"
                      done
                    />
                    <KanbanCard
                      title="API Integration — Figma Design Tokens"
                      assigneeColor="bg-blue-300"
                      deadline="3 Jul"
                      done
                    />
                    <KanbanCard
                      title="Setup Dev Environment & Docker Config"
                      assigneeColor="bg-emerald-400"
                      deadline="5 Jul"
                      done
                    />
                  </div>

                  {/* ── Rejected ── */}
                  <div className="w-[180px] shrink-0">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-red-500">Rejected</span>
                        <span className="w-4 h-4 rounded-full bg-red-100 text-[8px] font-bold text-red-500 flex items-center justify-center">1</span>
                      </div>
                    </div>
                    <div className="border-2 border-dashed border-neutral-200 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5">
                      <svg className="w-4 h-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-[9px] text-neutral-300 font-medium text-center">Add Status</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
