import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useAppContext } from '../hooks/useAppContext';

export default function MeetingsLeavesPage() {
  const context = useAppContext();
  const {
    leaves = [],
    handleAddLeave,
    handleDeleteLeave,
    leaveForm,
    setLeaveForm,
    isSuperAdmin,
    currentUser,
    language = 'id',
    isSubmitting,
  } = context;

  const tMsg = (en, id) => (language === 'id' ? id : en);

  // View state
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'list'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all'); // 'all' | 'personal' | 'mass_leave' | 'public_holiday'
  const [isAddLeaveOpen, setIsAddLeaveOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState(null); // Delete confirmation modal state

  // Google Calendar Indonesian Holidays API state
  const [googleHolidays, setGoogleHolidays] = useState([]);
  const [isFetchingGoogleHolidays, setIsFetchingGoogleHolidays] = useState(false);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthNamesId = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthName = language === 'id' ? monthNamesId[currentMonth] : monthNamesEn[currentMonth];

  const formatDateYYYYMMDD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const formatDateMMM = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Fetch Google Calendar Public Holidays for Indonesia (with API fetch + robust fallback)
  useEffect(() => {
    let isMounted = true;
    const fetchGoogleCalendarHolidays = async () => {
      setIsFetchingGoogleHolidays(true);
      try {
        const calendarId = encodeURIComponent('en.indonesian#holiday@group.v.calendar.google.com');
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || '';
        
        const timeMin = new Date(currentYear, 0, 1).toISOString();
        const timeMax = new Date(currentYear, 11, 31).toISOString();

        if (apiKey) {
          const res = await axios.get(
            `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`
          );
          if (isMounted && res.data?.items && res.data.items.length > 0) {
            const fetched = res.data.items.map((item) => ({
              id: `gcal-${item.id}`,
              leave_date: item.start?.date || item.start?.dateTime?.slice(0, 10),
              description: item.summary || 'Hari Libur Nasional',
              leave_type: 'public_holiday',
              is_google: true,
            }));
            setGoogleHolidays(fetched);
            setIsFetchingGoogleHolidays(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Google Calendar API error or key missing, applying national holiday set:', err);
      }

      // Fallback: Default Public Holidays for Indonesia if API Key is not set or network fails
      if (isMounted) {
        const defaultIDHolidays = [
          { leave_date: `${currentYear}-01-01`, description: 'Tahun Baru Masehi' },
          { leave_date: `${currentYear}-03-29`, description: 'Wafat Yesus Kristus' },
          { leave_date: `${currentYear}-03-31`, description: 'Hari Raya Nyepi' },
          { leave_date: `${currentYear}-04-10`, description: 'Hari Raya Idul Fitri' },
          { leave_date: `${currentYear}-04-11`, description: 'Hari Raya Idul Fitri' },
          { leave_date: `${currentYear}-05-01`, description: 'Hari Buruh Internasional' },
          { leave_date: `${currentYear}-05-09`, description: 'Kenaikan Yesus Kristus' },
          { leave_date: `${currentYear}-05-23`, description: 'Hari Raya Waisak' },
          { leave_date: `${currentYear}-06-01`, description: 'Hari Lahir Pancasila' },
          { leave_date: `${currentYear}-06-17`, description: 'Hari Raya Idul Adha' },
          { leave_date: `${currentYear}-07-07`, description: 'Tahun Baru Islam 1446 H' },
          { leave_date: `${currentYear}-08-17`, description: 'Hari Kemerdekaan RI' },
          { leave_date: `${currentYear}-09-16`, description: 'Maulid Nabi Muhammad SAW' },
          { leave_date: `${currentYear}-12-25`, description: 'Hari Raya Natal' },
        ].map((h, idx) => ({
          id: `gcal-fallback-${currentYear}-${idx}`,
          leave_date: h.leave_date,
          description: h.description,
          leave_type: 'public_holiday',
          is_google: true,
        }));
        setGoogleHolidays(defaultIDHolidays);
        setIsFetchingGoogleHolidays(false);
      }
    };

    fetchGoogleCalendarHolidays();
    return () => {
      isMounted = false;
    };
  }, [currentYear]);

  // Combine backend leaves + Google Calendar Holidays
  const combinedLeaves = useMemo(() => {
    const existingDates = new Set((leaves || []).map((l) => `${l.leave_date}_${(l.description || '').toLowerCase()}`));
    const uniqueGoogle = googleHolidays.filter(
      (g) => !existingDates.has(`${g.leave_date}_${(g.description || '').toLowerCase()}`)
    );
    return [...(leaves || []), ...uniqueGoogle];
  }, [leaves, googleHolidays]);

  // 1. SUNDAY FIRST (Minggu adalah hari pertama di kolom 0)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const days = [];

    // Previous month padding
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(currentYear, currentMonth - 1, prevMonthLastDay - i);
      const dayOfWeek = prevDate.getDay();
      days.push({
        dateStr: formatDateYYYYMMDD(prevDate),
        dayNum: prevDate.getDate(),
        isCurrentMonth: false,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const curDate = new Date(currentYear, currentMonth, d);
      const dayOfWeek = curDate.getDay();
      days.push({
        dateStr: formatDateYYYYMMDD(curDate),
        dayNum: d,
        isCurrentMonth: true,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }

    // Next month padding to complete 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(currentYear, currentMonth + 1, i);
      const dayOfWeek = nextDate.getDay();
      days.push({
        dateStr: formatDateYYYYMMDD(nextDate),
        dayNum: i,
        isCurrentMonth: false,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Index leaves by YYYY-MM-DD
  const leavesByDate = useMemo(() => {
    const map = {};
    combinedLeaves.forEach((l) => {
      const dateKey = l.leave_date;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(l);
    });
    return map;
  }, [combinedLeaves]);

  const filteredLeavesList = useMemo(() => {
    return combinedLeaves
      .filter((l) => {
        if (selectedTypeFilter === 'all') return true;
        return l.leave_type === selectedTypeFilter;
      })
      .sort((a, b) => new Date(a.leave_date) - new Date(b.leave_date));
  }, [combinedLeaves, selectedTypeFilter]);

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const onSubmitLeave = async (e) => {
    e.preventDefault();
    if (handleAddLeave) {
      await handleAddLeave(e);
      setIsAddLeaveOpen(false);
    }
  };

  const confirmRemoveLeave = () => {
    if (leaveToDelete && handleDeleteLeave) {
      handleDeleteLeave(leaveToDelete.id);
      setLeaveToDelete(null);
    }
  };

  const todayStr = formatDateYYYYMMDD(new Date());

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFAFA] dark:bg-[#0d0f11] overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-6">
      
      {/* ── HEADER BANNER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-5 md:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-[#FACC15] rounded-xl material-symbols-outlined text-xl">
              event_available
            </span>
            <h1 className="text-xl md:text-2xl font-black text-[#111E38] dark:text-white tracking-tight">
              {tMsg('Meetings & Leave Management', 'Jadwal Pertemuan & Cuti Tim')}
            </h1>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {tMsg(
              'Monitor team availability, mass leaves, and national holidays in a centralized workspace.',
              'Pantau ketersediaan anggota tim, cuti bersama, dan libur nasional secara terpusat.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddLeaveOpen(true)}
            className="px-4 py-2 bg-[#FACC15] text-[#111E38] text-xs font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>{tMsg('Request Leave / Add Holiday', 'Ajukan Cuti / Libur')}</span>
          </button>
        </div>
      </div>

      {/* ── CONTROLS & FILTER ROW ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-3.5 md:p-4 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 shadow-2xs">
        
        {/* Left Side: Navigation Controls + View Mode Switch */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleToday}
            className="px-3.5 py-1.5 bg-[#111E38]/5 dark:bg-white/10 hover:bg-[#111E38]/10 text-[#111E38] dark:text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer"
          >
            {tMsg('Today', 'Hari Ini')}
          </button>
          
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl p-1 border border-neutral-200/50 dark:border-neutral-700/50">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 rounded-lg transition-all cursor-pointer"
              title={tMsg('Previous Month', 'Bulan Sebelumnya')}
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <span className="px-3 text-xs font-black text-[#111E38] dark:text-[#FACC15] min-w-[130px] text-center">
              {currentMonthName} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 rounded-lg transition-all cursor-pointer"
              title={tMsg('Next Month', 'Bulan Berikutnya')}
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>

          {/* View Mode Toggle (Kalender / Daftar Cuti) */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-2xs'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">calendar_view_month</span>
              <span>{tMsg('Calendar', 'Kalender')}</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-2xs'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">view_list</span>
              <span>{tMsg('Leave List', 'Daftar Cuti')}</span>
            </button>
          </div>
        </div>

        {/* Right Side: Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider hidden xl:inline-block mr-1">
            {tMsg('Filter:', 'Filter:')}
          </span>
          <div className="flex flex-wrap items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl gap-0.5 border border-neutral-200/50 dark:border-neutral-700/50">
            <button
              onClick={() => setSelectedTypeFilter('all')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedTypeFilter === 'all'
                  ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-2xs'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">apps</span>
              <span>{tMsg('All', 'Semua')}</span>
            </button>
            <button
              onClick={() => setSelectedTypeFilter('personal')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedTypeFilter === 'personal'
                  ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-2xs'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] leading-none">flight_takeoff</span>
              <span>{tMsg('Team Leave', 'Cuti Tim')}</span>
            </button>
            <button
              onClick={() => setSelectedTypeFilter('mass_leave')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedTypeFilter === 'mass_leave'
                  ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-2xs'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] leading-none">event_busy</span>
              <span>{tMsg('Mass Leave', 'Cuti Bersama')}</span>
            </button>
            <button
              onClick={() => setSelectedTypeFilter('public_holiday')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedTypeFilter === 'public_holiday'
                  ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-2xs'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] leading-none">verified</span>
              <span>{tMsg('Public Holiday', 'Libur Nasional')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── CALENDAR VIEW MODE (SUNDAY FIRST & WEEKEND SHADED) ── */}
      {viewMode === 'month' ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 overflow-hidden shadow-2xs">
          
          {/* Day Names Header (Sunday First) */}
          <div className="grid grid-cols-7 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 text-center py-2.5 text-xs font-extrabold text-neutral-400 uppercase tracking-wider">
            <div className="text-rose-500">Min</div>
            <div>Sen</div>
            <div>Sel</div>
            <div>Rab</div>
            <div>Kam</div>
            <div>Jum</div>
            <div className="text-rose-500">Sab</div>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-neutral-200/50 dark:divide-neutral-800/60 border-b border-neutral-200/50 dark:border-neutral-800">
            {calendarDays.map((cell) => {
              const dayLeaves = (leavesByDate[cell.dateStr] || []).filter((l) => {
                if (selectedTypeFilter === 'all') return true;
                return l.leave_type === selectedTypeFilter;
              });

              const isToday = cell.dateStr === todayStr;

              return (
                <div
                  key={cell.dateStr}
                  className={`min-h-28 md:min-h-32 p-2 flex flex-col justify-between transition-colors ${
                    cell.isWeekend
                      ? 'bg-neutral-100/70 dark:bg-neutral-950/80 border-rose-100/30' // 2. Weekend Blocked Color
                      : cell.isCurrentMonth
                      ? 'bg-white dark:bg-neutral-900/90'
                      : 'bg-neutral-50/40 dark:bg-neutral-950/30 text-neutral-400'
                  } ${isToday ? 'ring-2 ring-inset ring-[#FACC15]' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-extrabold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-[#FACC15] text-[#111E38]'
                          : cell.isWeekend
                          ? 'text-rose-600 dark:text-rose-400 font-bold'
                          : cell.isCurrentMonth
                          ? 'text-[#111E38] dark:text-neutral-200'
                          : 'text-neutral-400'
                      }`}
                    >
                      {cell.dayNum}
                    </span>
                    {dayLeaves.length > 0 && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-[#FACC15]">
                        {dayLeaves.length} Event
                      </span>
                    )}
                  </div>

                  {/* Day Events Feed */}
                  <div className="space-y-1 overflow-y-auto max-h-20 custom-scrollbar pr-0.5">
                    {dayLeaves.map((item) => (
                      <div
                        key={item.id}
                        className={`p-1.5 rounded-lg text-[11px] border font-semibold flex items-center justify-between gap-1 shadow-2xs ${
                          item.leave_type === 'personal'
                            ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
                            : item.leave_type === 'mass_leave'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                            : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200/80 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
                        }`}
                        title={`${item.description} (${item.username || 'Sistem'})`}
                      >
                        <div className="truncate flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] shrink-0">
                            {item.leave_type === 'personal'
                              ? 'flight_takeoff'
                              : item.leave_type === 'mass_leave'
                              ? 'event_busy'
                              : 'verified'}
                          </span>
                          <span className="truncate">
                            {item.leave_type === 'personal' && item.username !== currentUser ? `@${item.username}: ` : ''}
                            {item.description}
                          </span>
                        </div>

                        {/* 4. Delete Confirmation modal trigger on X click */}
                        {(item.username === currentUser || isSuperAdmin) && item.leave_type !== 'public_holiday' && !item.is_google && (
                          <button
                            onClick={() => setLeaveToDelete(item)}
                            className="text-neutral-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                            title="Hapus Cuti"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── LIST VIEW MODE ── */
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 p-4 md:p-6 shadow-2xs space-y-3">
          <h3 className="text-sm font-extrabold text-[#111E38] dark:text-white uppercase tracking-wider mb-4">
            {tMsg('Daftar Agenda & Cuti Terdaftar', 'Daftar Agenda & Cuti Terdaftar')} ({filteredLeavesList.length})
          </h3>

          {filteredLeavesList.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
              <p className="text-xs font-bold">{tMsg('Tidak ada jadwal cuti atau libur ditemukan.', 'Tidak ada jadwal cuti atau libur ditemukan.')}</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredLeavesList.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-neutral-50 dark:bg-neutral-800/80 rounded-xl border border-neutral-200/60 dark:border-neutral-700/80 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="p-2 bg-neutral-200/60 dark:bg-neutral-700/60 text-[#111E38] dark:text-[#FACC15] rounded-xl material-symbols-outlined text-lg">
                      {item.leave_type === 'personal'
                        ? 'flight_takeoff'
                        : item.leave_type === 'mass_leave'
                        ? 'event_busy'
                        : 'verified'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#111E38] dark:text-white truncate">
                        {item.leave_type === 'personal' && item.username !== currentUser ? `@${item.username} - ` : ''}
                        {item.description}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">
                        {formatDateMMM(item.leave_date)} • <span className="capitalize">{item.leave_type.replace('_', ' ')}</span>
                        {item.username === currentUser && ' (Anda)'}
                      </p>
                    </div>
                  </div>

                  {(item.username === currentUser || isSuperAdmin) && item.leave_type !== 'public_holiday' && !item.is_google && (
                    <button
                      onClick={() => setLeaveToDelete(item)}
                      className="px-3 py-1 bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors"
                    >
                      {tMsg('Hapus', 'Hapus')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL FORM TAMBAH CUTI (Clean SVG Icons according to Brand Guideline) ── */}
      {isAddLeaveOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-80 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800 pb-3">
              <h3 className="text-sm font-extrabold text-[#111E38] dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-500">flight_takeoff</span>
                <span>{tMsg('Ajukan Cuti / Tambah Libur', 'Ajukan Cuti / Tambah Libur')}</span>
              </h3>
              <button
                onClick={() => setIsAddLeaveOpen(false)}
                className="text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={onSubmitLeave} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 mb-1 uppercase">
                  {tMsg('Tanggal Mulai', 'Tanggal Mulai')}
                </label>
                <input
                  type="date"
                  value={leaveForm.start_date}
                  onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-black dark:text-white outline-none focus:border-[#FACC15]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 mb-1 uppercase">
                  {tMsg('Tanggal Selesai (Opsional)', 'Tanggal Selesai (Opsional)')}
                </label>
                <input
                  type="date"
                  value={leaveForm.end_date}
                  onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-black dark:text-white outline-none focus:border-[#FACC15]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 mb-1 uppercase">
                  {tMsg('Alasan / Deskripsi', 'Alasan / Deskripsi')}
                </label>
                <input
                  type="text"
                  placeholder={tMsg('Contoh: Cuti Tahunan / Libur Idul Fitri', 'Contoh: Cuti Tahunan / Libur Idul Fitri')}
                  value={leaveForm.desc}
                  onChange={(e) => setLeaveForm({ ...leaveForm, desc: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-black dark:text-white outline-none focus:border-[#FACC15]"
                  required
                />
              </div>

              {isSuperAdmin && (
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 mb-1 uppercase">
                    {tMsg('Tipe Cuti', 'Tipe Cuti')}
                  </label>
                  <select
                    value={leaveForm.type}
                    onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-black dark:text-white outline-none focus:border-[#FACC15]"
                  >
                    <option value="personal">{tMsg('Cuti Pribadi', 'Cuti Pribadi')}</option>
                    <option value="mass_leave">{tMsg('Cuti Bersama / Libur Nasional (Admin)', 'Cuti Bersama / Libur Nasional (Admin)')}</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200/80 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddLeaveOpen(false)}
                  className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-xs font-bold rounded-xl text-neutral-700 dark:text-neutral-300"
                >
                  {tMsg('Batal', 'Batal')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#FACC15] text-[#111E38] text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? tMsg('Menyimpan...', 'Menyimpan...') : tMsg('Simpan Cuti', 'Simpan Cuti')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 4. MODAL KONFIRMASI HAPUS CUTI ── */}
      {leaveToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-90 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/60 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            
            <div>
              <h3 className="text-base font-extrabold text-[#111E38] dark:text-white">
                {tMsg('Konfirmasi Hapus Cuti', 'Konfirmasi Hapus Cuti')}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {tMsg('Apakah Anda yakin ingin menghapus jadwal cuti', 'Apakah Anda yakin ingin menghapus jadwal cuti')}{' '}
                <strong className="text-[#111E38] dark:text-white">"{leaveToDelete.description}"</strong>?
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2 border-t border-neutral-200/80 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setLeaveToDelete(null)}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-xs font-bold rounded-xl text-neutral-700 dark:text-neutral-300"
              >
                {tMsg('Batal', 'Batal')}
              </button>
              <button
                type="button"
                onClick={confirmRemoveLeave}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-all cursor-pointer shadow-xs"
              >
                {tMsg('Ya, Hapus', 'Ya, Hapus')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
