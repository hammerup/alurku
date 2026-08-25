import React, { useMemo, useEffect } from 'react';

// Modern SVG Icons replacing emojis per Brand Guidelines
const IconCalendar = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h12.75A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
  </svg>
);

const IconHoliday = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
  </svg>
);

const IconLeave = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

export default function CalendarView({
  calDate,
  setCalDate,
  leaves = [],
  filteredTasks = [],
  setSelectedTask,
  currentUser,
  isUserAssigned,
  timelineDrag,
  setTimelineDrag,
  accountStatus,
  selectedBoard,
  isSuperAdmin,
  isTrashHovered,
  language = 'id',
  dateFormat = 'DD/MM/YYYY',
}) {
  const [subView, setSubView] = React.useState('month'); // 'month' | 'week' | 'schedule'
  const [expandedDate, setExpandedDate] = React.useState(null);
  const [selectedLeave, setSelectedLeave] = React.useState(null);

  const tMsg = (en, id) => (language === 'id' ? id : en);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedLeave) {
        setSelectedLeave(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLeave]);

  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const monthNames = useMemo(() => {
    return language === 'id'
      ? [
          'Januari',
          'Februari',
          'Maret',
          'April',
          'Mei',
          'Juni',
          'Juli',
          'Agustus',
          'September',
          'Oktober',
          'November',
          'Desember',
        ]
      : [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];
  }, [language]);

  const dayNames = useMemo(() => {
    return language === 'id'
      ? ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB']
      : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  }, [language]);

  const dayFullNames = useMemo(() => {
    return language === 'id'
      ? ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
      : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  }, [language]);

  const formatDatePref = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString.replace(/-/g, '/'));
    if (isNaN(d)) return dateString.split(' ')[0];
    const months = language === 'id'
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (dateFormat === 'DD/MM/YYYY') {
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } else if (dateFormat === 'YYYY-MM-DD') {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } else if (dateFormat === 'MMM DD, YYYY') {
      return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
    }
    return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const grid = useMemo(() => {
    const resGrid = [];
    let week = [];
    for (let i = 0; i < firstDay; i++) week.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      week.push(d);
      if (week.length === 7) {
        resGrid.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      resGrid.push(week);
    }
    return resGrid;
  }, [firstDay, daysInMonth]);

  // Helper functions for week view
  const getStartOfWeek = (d) => {
    const res = new Date(d);
    const day = res.getDay();
    res.setDate(res.getDate() - day);
    res.setHours(0, 0, 0, 0);
    return res;
  };

  const getWeekDays = (d) => {
    const start = getStartOfWeek(d);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const currentRows = useMemo(() => {
    if (subView === 'week') {
      return [getWeekDays(calDate)];
    }
    // month view
    return grid.map(w => w.map(d => d ? new Date(year, month, d) : null));
  }, [subView, calDate, grid, year, month]);

  const parseDate = (d) => {
    if (!d) return null;
    const p = new Date(d.replace(/-/g, '/'));
    if (isNaN(p)) return null;
    p.setHours(0, 0, 0, 0);
    return p;
  };

  const parsedTasks = useMemo(() => {
    return filteredTasks.map((t) => {
      let start = parseDate(t.start_date || (t.timestamp && t.timestamp.split(' ')[0]));
      if (!start) start = new Date();

      while (true) {
        const dStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(
          start.getDate()
        ).padStart(2, '0')}`;
        const isWeekend = start.getDay() === 0 || start.getDay() === 6;
        const isHoliday = leaves.some(
          (l) => l.leave_date === dStr && (l.leave_type !== 'personal' || isUserAssigned(t, l.username))
        );
        if (isWeekend || isHoliday) start.setDate(start.getDate() + 1);
        else break;
      }

      let end = parseDate(
        (t.status === 'Done' || t.status === 'Rejected') && t.completed_time ? t.completed_time : t.deadline
      );
      if (!end) end = new Date(start);
      if (end < start) end = new Date(start.getTime());

      if (timelineDrag && timelineDrag.task && timelineDrag.task.id === t.id) {
        if (timelineDrag.mode === 'end') {
          end.setDate(end.getDate() + timelineDrag.startOffsetDays);
          if (end < start) end = new Date(start.getTime());
        } else if (timelineDrag.mode === 'start') {
          start.setDate(start.getDate() + timelineDrag.startOffsetDays);
          if (start > end) start = new Date(end.getTime());
        } else if (timelineDrag.mode === 'both') {
          start.setDate(start.getDate() + timelineDrag.startOffsetDays);
          end.setDate(end.getDate() + timelineDrag.startOffsetDays);
        }
      }

      let effectiveEnd = new Date(end);
      while (true) {
        const dStr = `${effectiveEnd.getFullYear()}-${String(effectiveEnd.getMonth() + 1).padStart(2, '0')}-${String(
          effectiveEnd.getDate()
        ).padStart(2, '0')}`;
        const isWeekend = effectiveEnd.getDay() === 0 || effectiveEnd.getDay() === 6;
        const isHoliday = leaves.some(
          (l) => l.leave_date === dStr && (l.leave_type !== 'personal' || isUserAssigned(t, l.username))
        );
        if ((isWeekend || isHoliday) && effectiveEnd > start) effectiveEnd.setDate(effectiveEnd.getDate() - 1);
        else break;
      }

      return { ...t, start, end, effectiveEnd };
    });
  }, [filteredTasks, leaves, timelineDrag, isUserAssigned]);

  const handleDragStart = (e, t, mode) => {
    e.stopPropagation();
    e.preventDefault(); // Mencegah native browser drag-and-drop
    if (accountStatus === 'suspended') return;
    const cell = e.currentTarget.closest('.calendar-day-cell');
    const dragWidth = cell ? cell.offsetWidth : 100;
    const dragHeight = cell ? cell.offsetHeight : 100;
    setTimelineDrag({
      task: t,
      startX: e.pageX,
      startY: e.pageY,
      startOffsetDays: 0,
      mode,
      dragWidth,
      dragHeight,
      isCalendar: true,
    });
  };

  // Schedule View Calculations
  const scheduleDays = useMemo(() => {
    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [year, month, daysInMonth]);

  const scheduleActiveDays = useMemo(() => {
    return scheduleDays.map((cellDate) => {
      const cellDateStr = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(
        cellDate.getDate()
      ).padStart(2, '0')}`;
      const dayLeaves = leaves.filter((l) => l.leave_date === cellDateStr);
      const dayTasks = parsedTasks.filter((t) => {
        const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6;
        const isTaskHoliday = dayLeaves.some(
          (l) => l.leave_type !== 'personal' || isUserAssigned(t, l.username)
        );
        if (isWeekend || isTaskHoliday) return false;
        return cellDate.getTime() >= t.start.getTime() && cellDate.getTime() <= t.end.getTime();
      });
      return { cellDate, cellDateStr, dayLeaves, dayTasks };
    }).filter((d) => d.dayTasks.length > 0 || d.dayLeaves.length > 0);
  }, [scheduleDays, parsedTasks, leaves, isUserAssigned]);

  const navigatePrev = () => {
    if (subView === 'week') {
      setCalDate(new Date(calDate.getFullYear(), calDate.getMonth(), calDate.getDate() - 7));
    } else {
      setCalDate(new Date(year, month - 1, 1));
    }
  };

  const navigateNext = () => {
    if (subView === 'week') {
      setCalDate(new Date(calDate.getFullYear(), calDate.getMonth(), calDate.getDate() + 7));
    } else {
      setCalDate(new Date(year, month + 1, 1));
    }
  };

  const getHeaderTitle = () => {
    if (subView === 'week') {
      const weekDays = currentRows[0];
      const start = weekDays[0];
      const end = weekDays[6];
      if (start.getMonth() === end.getMonth()) {
        return `${monthNames[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${end.getFullYear()}`;
      }
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${monthNames[month]} ${year}`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[calc(100vh-140px)] min-h-125 sm:min-h-150">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-center p-3 sm:p-4 gap-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80">
        <h2 className="text-sm sm:text-lg md:text-xl font-extrabold text-[#111E38] dark:text-white text-center md:text-left min-w-0 truncate w-full md:w-auto">
          {subView === 'week' ? getHeaderTitle() : `${monthNames[month]} ${year}`}
        </h2>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 w-full md:w-auto">
          {/* Navigation Button Group */}
          <div className="flex bg-slate-200/80 dark:bg-slate-700 p-1 rounded-lg shrink-0">
            <button
              onClick={navigatePrev}
              aria-label={tMsg('Previous period', 'Periode sebelumnya')}
              className="px-2.5 sm:px-3.5 py-1.5 font-bold text-slate-600 dark:text-slate-300 hover:text-[#111E38] dark:hover:text-white rounded-md transition-colors text-xs cursor-pointer"
            >
              &lt; {tMsg('Prev', 'Sebelumnya')}
            </button>
            <button
              onClick={() => {
                setCalDate(new Date());
                if (subView === 'schedule') {
                  setTimeout(() => {
                    const el = document.getElementById('schedule-today');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }, 100);
                }
              }}
              className="px-2.5 sm:px-3.5 py-1.5 font-bold text-[#111E38] dark:text-[#FACC15] hover:bg-white dark:hover:bg-slate-800 rounded-md transition-colors text-xs cursor-pointer"
            >
              {tMsg('Today', 'Hari Ini')}
            </button>
            <button
              onClick={navigateNext}
              aria-label={tMsg('Next period', 'Periode berikutnya')}
              className="px-2.5 sm:px-3.5 py-1.5 font-bold text-slate-600 dark:text-slate-300 hover:text-[#111E38] dark:hover:text-white rounded-md transition-colors text-xs cursor-pointer"
            >
              {tMsg('Next', 'Berikutnya')} &gt;
            </button>
          </div>

          {/* View Switcher Tabs */}
          <div className="flex bg-slate-200/80 dark:bg-slate-700 p-1 rounded-lg shrink-0">
            {[
              { id: 'month', label: tMsg('Month', 'Bulan') },
              { id: 'week', label: tMsg('Week', 'Minggu') },
              { id: 'schedule', label: tMsg('Schedule', 'Jadwal') },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setSubView(v.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  subView === v.id
                    ? 'bg-white dark:bg-slate-800 text-[#111E38] dark:text-[#FACC15] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {subView !== 'schedule' ? (
        <>
          {/* Day of week headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50">
            {dayNames.map((d, dIdx) => (
              <div
                key={d}
                className={`py-1.5 sm:py-2.5 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider border-r border-slate-200 dark:border-slate-700 last:border-0 ${
                  dIdx === 0 || dIdx === 6
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div
            className="flex-1 grid min-h-0"
            style={{ gridTemplateRows: `repeat(${currentRows.length}, minmax(0, 1fr))` }}
          >
            {currentRows.map((w, wIdx) => (
              <div
                key={wIdx}
                className="min-h-0 grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 last:border-0"
              >
                {w.map((cellDate, dIdx) => {
                  const isWeekend = dIdx === 0 || dIdx === 6;
                  const isToday = cellDate && cellDate.toDateString() === new Date().toDateString();
                  const cellDateStr = cellDate
                    ? `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(
                        cellDate.getDate()
                      ).padStart(2, '0')}`
                    : null;
                  const dayLeaves = cellDateStr ? leaves.filter((l) => l.leave_date === cellDateStr) : [];
                  const hasGlobalHoliday = dayLeaves.some(
                    (l) => l.leave_type !== 'personal' || l.username === currentUser
                  );

                  let cellBg = 'bg-white dark:bg-slate-800';
                  if (!cellDate) cellBg = 'bg-slate-50/50 dark:bg-slate-900/40';
                  else if (isToday) cellBg = 'bg-amber-50/60 dark:bg-amber-950/20 ring-2 ring-[#FACC15] z-10';
                  else if (hasGlobalHoliday) cellBg = 'bg-rose-50/70 dark:bg-rose-950/20';
                  else if (isWeekend) cellBg = 'bg-slate-100/70 dark:bg-slate-900/60';

                  const dayTasks = cellDate
                    ? parsedTasks.filter((t) => {
                        const isTaskHoliday = dayLeaves.some(
                          (l) => l.leave_type !== 'personal' || isUserAssigned(t, l.username)
                        );
                        if (isWeekend || isTaskHoliday) return false;
                        return cellDate.getTime() >= t.start.getTime() && cellDate.getTime() <= t.end.getTime();
                      })
                    : [];

                  const isExpanded = expandedDate === cellDateStr;
                  const limit = subView === 'week' ? 10 : 3;
                  const visibleTasks = isExpanded ? dayTasks : dayTasks.slice(0, limit);
                  const hiddenCount = dayTasks.length - limit;

                  return (
                    <div
                      key={dIdx}
                      className={`calendar-day-cell relative min-w-0 min-h-0 border-r border-slate-200 dark:border-slate-700 last:border-0 p-1 flex flex-col ${cellBg}`}
                    >
                      {cellDate && (
                        <>
                          <div
                            className={`text-right text-[10px] sm:text-xs font-bold p-1 sm:p-1.5 ${
                              isToday
                                ? 'text-[#111E38] dark:text-[#FACC15]'
                                : hasGlobalHoliday || isWeekend
                                ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            <span
                              className={`inline-flex items-center justify-center ${
                                isToday
                                  ? 'bg-[#FACC15] text-[#111E38] w-5 h-5 rounded-full font-black text-[11px] shadow-xs'
                                  : ''
                              }`}
                            >
                              {cellDate.getDate()}
                            </span>

                            {dayLeaves.map((l) => (
                              <div
                                key={l.id}
                                className="text-[8px] text-rose-700 dark:text-rose-300 bg-rose-50/90 dark:bg-rose-950/50 shadow-xs border border-rose-200/60 dark:border-rose-800/60 px-1 py-0.5 rounded mt-1 truncate cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors flex items-center gap-1"
                                title={tMsg('Click for details', 'Klik untuk rincian')}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLeave(l);
                                }}
                              >
                                <span className="shrink-0">
                                  {l.leave_type === 'personal' ? (
                                    <IconLeave className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                                  ) : (
                                    <IconHoliday className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" />
                                  )}
                                </span>
                                <span className="truncate">
                                  {l.leave_type === 'personal' && l.username !== currentUser ? `@${l.username} ` : ''}
                                  {l.description}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1 mt-0.5">
                            {visibleTasks.map((t) => {
                              let bgColor =
                                'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40';
                              if (t.status === 'Rejected')
                                bgColor =
                                  'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600';
                              else if (t.status === 'In Progress')
                                bgColor =
                                  'bg-amber-100 dark:bg-amber-900/30 text-[#111E38] dark:text-[#FACC15] border border-amber-300/70 dark:border-amber-700/50';
                              else if (t.status === 'Pending')
                                bgColor =
                                  'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40';

                              const isFirst = cellDate.getTime() === t.start.getTime();
                              const isLast = cellDate.getTime() === t.effectiveEnd.getTime();
                              const isTaskAdmin =
                                isSuperAdmin ||
                                t.owner_username === currentUser ||
                                (selectedBoard && selectedBoard.owner_username === currentUser) ||
                                (t.requester &&
                                  new RegExp(
                                    `@${currentUser.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w.-])`,
                                    'i'
                                  ).test(t.requester));
                              const isDraggable =
                                t.status !== 'Done' &&
                                t.status !== 'Rejected' &&
                                accountStatus !== 'suspended' &&
                                isTaskAdmin;
                              const isDraggingThis = timelineDrag?.task?.id === t.id;

                              return (
                                <div
                                  key={t.id}
                                  className={`flex items-stretch text-[8px] sm:text-[10px] font-bold rounded-md hover:brightness-95 ${bgColor} ${
                                    isDraggingThis
                                      ? isTrashHovered
                                        ? 'cursor-grabbing z-60 opacity-0! bg-transparent! shadow-none! border-transparent! text-transparent! transition-opacity duration-150'
                                        : 'shadow-2xl -rotate-1 cursor-grabbing z-60 ring-4 ring-[#FACC15] scale-105 opacity-95 transition-[box-shadow,transform,opacity,border-color] duration-200'
                                      : 'transition-all duration-200 hover:scale-[1.02] hover:shadow-xs'
                                  }`}
                                  title={t.project_name}
                                >
                                  {isFirst && isDraggable && (
                                    <div
                                      className="w-2 sm:w-3 bg-black/10 dark:bg-white/10 hover:bg-black/30 dark:hover:bg-white/30 cursor-ew-resize shrink-0 rounded-l-md"
                                      onMouseDown={(e) => handleDragStart(e, t, 'start')}
                                    />
                                  )}
                                  <div
                                    className={`flex-1 px-1 sm:px-2 py-0.5 sm:py-1 truncate ${
                                      isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                                    }`}
                                    onClick={() => {
                                      if (!timelineDrag || timelineDrag.startOffsetDays === 0) setSelectedTask(t);
                                    }}
                                    onMouseDown={(e) => {
                                      if (isDraggable) handleDragStart(e, t, 'both');
                                    }}
                                  >
                                    {isFirst && <span className="opacity-70 font-black mr-1">{tMsg('Start:', 'Mulai:')}</span>}
                                    {t.project_name}
                                    {isLast && <span className="opacity-70 font-black ml-1">:{tMsg('End', 'Akhir')}</span>}
                                  </div>
                                  {isLast && isDraggable && (
                                    <div
                                      className="w-2 sm:w-3 bg-black/10 dark:bg-white/10 hover:bg-black/30 dark:hover:bg-white/30 cursor-ew-resize shrink-0 rounded-r-md"
                                      onMouseDown={(e) => handleDragStart(e, t, 'end')}
                                    />
                                  )}
                                </div>
                              );
                            })}

                            {!isExpanded && hiddenCount > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedDate(cellDateStr);
                                }}
                                className="w-full text-[10px] font-bold text-slate-500 hover:text-[#111E38] dark:text-slate-400 dark:hover:text-[#FACC15] text-left px-1 py-0.5 transition-colors cursor-pointer"
                              >
                                +{hiddenCount} {tMsg('more', 'lainnya')}
                              </button>
                            )}
                            {isExpanded && hiddenCount > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedDate(null);
                                }}
                                className="w-full text-[10px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-left px-1 py-0.5 transition-colors cursor-pointer"
                              >
                                {tMsg('Show less', 'Tampilkan lebih sedikit')}
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Schedule View */
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/30">
          {scheduleActiveDays.length > 0 ? (
            scheduleActiveDays.map(({ cellDate, cellDateStr, dayLeaves, dayTasks }) => {
              const isToday = cellDate.toDateString() === new Date().toDateString();
              const hasGlobalHoliday = dayLeaves.some(
                (l) => l.leave_type !== 'personal' || l.username === currentUser
              );

              let headerBg = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700';
              if (isToday)
                headerBg =
                  'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60 ring-1 ring-[#FACC15]/50';
              else if (hasGlobalHoliday)
                headerBg = 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60';

              return (
                <div
                  key={cellDateStr}
                  id={isToday ? 'schedule-today' : undefined}
                  className={`flex flex-col sm:flex-row border rounded-xl overflow-hidden shadow-xs transition-all hover:shadow-md ${headerBg}`}
                >
                  {/* Date Card Header */}
                  <div className="p-3 sm:p-4 sm:w-48 shrink-0 flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-2 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-900/50">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 sm:flex-col sm:items-center sm:gap-0">
                      <span className="text-[10px] sm:text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                        {dayFullNames[cellDate.getDay()]}
                      </span>
                      <span className="text-base sm:text-2xl font-black text-[#111E38] dark:text-white my-0 sm:my-1">
                        {cellDate.getDate()}
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
                        {monthNames[cellDate.getMonth()]} {cellDate.getFullYear()}
                      </span>
                    </div>
                    {isToday && (
                      <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-[#FACC15] text-[#111E38] rounded-full sm:mt-2 shadow-xs">
                        {tMsg('Today', 'Hari Ini')}
                      </span>
                    )}
                  </div>

                  {/* Tasks and Leaves */}
                  <div className="flex-1 p-4 space-y-3">
                    {dayLeaves.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {dayLeaves.map((l) => (
                          <div
                            key={l.id}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-200 bg-rose-100/70 dark:bg-rose-950/40 border border-rose-200/50 dark:border-rose-800/50 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors shadow-xs"
                            onClick={() => setSelectedLeave(l)}
                          >
                            <span className="shrink-0">
                              {l.leave_type === 'personal' ? (
                                <IconLeave className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              ) : (
                                <IconHoliday className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                              )}
                            </span>
                            <span>
                              {l.leave_type === 'personal' && l.username !== currentUser ? `@${l.username}: ` : ''}
                              {l.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {dayTasks.length > 0 ? (
                      <div className="grid gap-2">
                        {dayTasks.map((t) => {
                          let statusBg =
                            'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50';
                          if (t.status === 'Rejected')
                            statusBg =
                              'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600';
                          else if (t.status === 'In Progress')
                            statusBg =
                              'bg-amber-100 dark:bg-amber-900/30 text-[#111E38] dark:text-[#FACC15] border-amber-300 dark:border-amber-700/50';
                          else if (t.status === 'Pending')
                            statusBg =
                              'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50';

                          return (
                            <div
                              key={t.id}
                              onClick={() => setSelectedTask(t)}
                              className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 gap-2 rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:border-amber-400 dark:hover:border-amber-400/50 cursor-pointer shadow-xs hover:shadow-md transition-all hover:scale-[1.01]"
                            >
                              <div className="flex-1 min-w-0 w-full">
                                <h4 className="text-xs sm:text-sm font-bold text-[#111E38] dark:text-white line-clamp-2 wrap-break-word">
                                  {t.project_name}
                                </h4>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-x-2 gap-y-1">
                                  {t.owner_username && (
                                    <span>
                                      {tMsg('Assigned to:', 'Ditugaskan:')} <strong>@{t.owner_username}</strong>
                                    </span>
                                  )}
                                  {t.start_date && (
                                    <span>
                                      • {tMsg('Start:', 'Mulai:')} <strong>{formatDatePref(t.start_date)}</strong>
                                    </span>
                                  )}
                                  {t.deadline && (
                                    <span>
                                      • {tMsg('Deadline:', 'Tenggat:')} <strong>{formatDatePref(t.deadline)}</strong>
                                    </span>
                                  )}
                                </p>
                              </div>
                              <span
                                className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider shrink-0 self-start sm:self-auto border ${statusBg}`}
                              >
                                {t.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      !dayLeaves.length && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                          {tMsg('No schedules or holidays', 'Tidak ada jadwal atau libur')}
                        </p>
                      )
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full min-h-75 flex flex-col justify-center items-center text-center p-8">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-[#111E38] dark:text-[#FACC15] flex items-center justify-center mb-3 shadow-xs">
                <IconCalendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#111E38] dark:text-slate-200">
                {tMsg('No Tasks Scheduled', 'Tidak Ada Tugas Terjadwal')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                {tMsg(
                  `There are no tasks or leaves scheduled for ${monthNames[month]} ${year}. Use the navigation at the top to check other months.`,
                  `Tidak ada tugas atau libur yang dijadwalkan untuk ${monthNames[month]} ${year}. Gunakan navigasi di atas untuk memeriksa bulan lainnya.`
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Leave Detail Modal */}
      {selectedLeave && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedLeave.leave_type === 'personal' ? tMsg('Personal Leave Details', 'Rincian Cuti Pribadi') : tMsg('Public Holiday Details', 'Rincian Hari Libur Nasional')}
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 transition-opacity duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLeave(null);
          }}
        >
          <div
            className="bg-white dark:bg-[#121B2D] p-6 sm:p-7 w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs border border-rose-200/60 dark:border-rose-800/60">
              {selectedLeave.leave_type === 'personal' ? (
                <IconLeave className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              ) : (
                <IconHoliday className="w-7 h-7 text-rose-600 dark:text-rose-400" />
              )}
            </div>

            <h3 className="text-base font-extrabold text-[#111E38] dark:text-white mb-2">
              {selectedLeave.leave_type === 'personal'
                ? tMsg('Personal Leave', 'Cuti Pribadi')
                : tMsg('Public Holiday', 'Hari Libur Nasional')}
            </h3>

            <div className="text-slate-600 dark:text-slate-300 mb-5 text-xs font-medium leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 text-left space-y-1">
              {selectedLeave.leave_type === 'personal' && selectedLeave.username !== currentUser && (
                <div>
                  <span className="text-slate-400 font-semibold">{tMsg('User:', 'Pengguna:')}</span>{' '}
                  <strong className="text-indigo-600 dark:text-indigo-400">@{selectedLeave.username}</strong>
                </div>
              )}
              <div>
                <span className="text-slate-400 font-semibold">{tMsg('Date:', 'Tanggal:')}</span>{' '}
                <strong className="text-[#111E38] dark:text-white">{selectedLeave.leave_date}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">{tMsg('Description:', 'Keterangan:')}</span>{' '}
                <span className="text-[#111E38] dark:text-white font-semibold">{selectedLeave.description}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedLeave(null)}
              className="w-full px-4 py-2.5 rounded-xl font-bold text-[#111E38] bg-[#FACC15] hover:brightness-95 transition-colors text-xs shadow-xs cursor-pointer"
            >
              {tMsg('Close', 'Tutup')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
