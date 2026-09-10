import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Avatar } from './SharedUI';

export default function AnalyticsView({
  filteredTasks,
  columns,
  avatarsMap,
  teamMembers,
  setSelectedTask,
  currentUser,
  language = 'id',
  leaves: initialLeaves = [],
  fetchLeaves,
}) {
  const tMsg = (en, id) => (language === 'id' ? id : en);

  const getISODate = (date) => date.toISOString().split('T')[0];
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(today.getDate() - 30);

  const [timeFilter, setTimeFilter] = useState('30'); // 7, 30, 90, all, custom
  const [customStartDate, setCustomStartDate] = useState(getISODate(oneMonthAgo));
  const [customEndDate, setCustomEndDate] = useState(getISODate(today));
  const [activeLines, setActiveLines] = useState({ created: true, progress: false, done: true });
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [aiInsight, setAiInsight] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiProvider, setAiProvider] = useState('');

  // Workload Analytics & Burnout Prevention State
  const [fallbackLeaves, setFallbackLeaves] = useState([]);
  const [workloadFilter, setWorkloadFilter] = useState('all'); // 'all' | 'overloaded' | 'near_capacity' | 'optimal' | 'available' | 'on_leave'
  const [inspectingMember, setInspectingMember] = useState(null);

  useEffect(() => {
    const hasPropsLeaves =
      (Array.isArray(initialLeaves) && initialLeaves.length > 0) ||
      (initialLeaves?.leaves && Array.isArray(initialLeaves.leaves) && initialLeaves.leaves.length > 0);

    if (!hasPropsLeaves) {
      if (typeof fetchLeaves === 'function') {
        fetchLeaves();
      } else {
        axios
          .get('/api/leaves')
          .then((res) => {
            if (res.data?.leaves) setFallbackLeaves(res.data.leaves);
          })
          .catch(() => {});
      }
    }
  }, [initialLeaves, fetchLeaves]);

  const leavesList = useMemo(() => {
    if (Array.isArray(initialLeaves) && initialLeaves.length > 0) return initialLeaves;
    if (initialLeaves?.leaves && Array.isArray(initialLeaves.leaves) && initialLeaves.leaves.length > 0) {
      return initialLeaves.leaves;
    }
    return fallbackLeaves;
  }, [initialLeaves, fallbackLeaves]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && inspectingMember) {
        setInspectingMember(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectingMember]);

  const analyticsTasks = useMemo(() => {
    if (timeFilter === 'all') return filteredTasks;

    if (timeFilter === 'custom') {
      if (!customStartDate || !customEndDate) return []; // Return empty if range is incomplete
      const start = new Date(customStartDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);

      return filteredTasks.filter((t) => {
        const createdDate = new Date(t.timestamp.replace(/-/g, '/'));
        const completedDate = t.completed_time ? new Date(t.completed_time.replace(/-/g, '/')) : null;
        const relevantStart = createdDate <= end;
        const relevantEnd = !completedDate || completedDate >= start;
        return relevantStart && relevantEnd;
      });
    }

    const days = parseInt(timeFilter);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    cutoffDate.setHours(0, 0, 0, 0);

    return filteredTasks.filter((t) => {
      const createdDate = new Date(t.timestamp.replace(/-/g, '/').split(' ')[0]);
      const completedDate = t.completed_time ? new Date(t.completed_time.replace(/-/g, '/').split(' ')[0]) : null;
      return (
        createdDate >= cutoffDate ||
        (completedDate && completedDate >= cutoffDate) ||
        (t.status !== 'Done' && t.status !== 'Rejected')
      );
    });
  }, [filteredTasks, timeFilter, customStartDate, customEndDate]);

  const tasksWithLivePriority = useMemo(() => {
    const getPriorityLevel = (task) => {
      if (!task.deadline || task.status === 'Done' || task.status === 'Rejected') {
        return task.priority_lvl || 'normal';
      }
      const now = new Date();
      const deadlineDate = new Date(task.deadline.replace(/-/g, '/'));
      const diffHours = (deadlineDate - now) / (1000 * 60 * 60);

      if (diffHours <= 24) {
        return 'critical';
      }
      if (diffHours <= 72) {
        return 'warning';
      }
      return 'normal';
    };

    return analyticsTasks.map((task) => ({
      ...task,
      priority_lvl: getPriorityLevel(task),
    }));
  }, [analyticsTasks]);

  // Advanced Calculations
  const completedTasks = tasksWithLivePriority.filter((t) => {
    if (t.status !== 'Done' || !t.completed_time || !t.timestamp) return false;
    if (timeFilter === 'custom') {
      if (!customStartDate || !customEndDate) return false;
      const start = new Date(customStartDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      const compDate = new Date(t.completed_time.replace(/-/g, '/'));
      return compDate >= start && compDate <= end;
    }
    return true;
  });
  let avgCycleTime = 0;
  if (completedTasks.length > 0) {
    const totalDays = completedTasks.reduce((sum, t) => {
      const start = new Date(t.timestamp.replace(/-/g, '/'));
      const end = new Date(t.completed_time.replace(/-/g, '/'));
      return sum + (end - start) / (1000 * 60 * 60 * 24);
    }, 0);
    avgCycleTime = Math.round((totalDays / completedTasks.length) * 10) / 10;
  }

  const totalSubtasks = tasksWithLivePriority.reduce((sum, t) => sum + (t.subtask_total || 0), 0);
  const doneSubtasks = tasksWithLivePriority.reduce((sum, t) => sum + (t.subtask_done || 0), 0);
  const subtaskCompletionPct = totalSubtasks > 0 ? Math.round((doneSubtasks / totalSubtasks) * 100) : 0;

  // Project Health Score Calculation
  // Memfilter tugas yang ditolak agar tidak memengaruhi skor kesehatan
  const healthAnalyticsTasks = tasksWithLivePriority.filter((t) => t.status !== 'Rejected');
  const totalHealthEtc = healthAnalyticsTasks.reduce((sum, t) => sum + (t.etc || 2), 0);
  const doneHealthEtc = healthAnalyticsTasks
    .filter((t) => t.status === 'Done')
    .reduce((sum, t) => sum + (t.etc || 2), 0);
  const activeHealthEtc = healthAnalyticsTasks
    .filter((t) => t.status !== 'Done')
    .reduce((sum, t) => sum + (t.etc || 2), 0);
  const overdueHealthEtc = healthAnalyticsTasks
    .filter((t) => t.priority_lvl === 'critical' && t.status !== 'Done')
    .reduce((sum, t) => sum + (t.etc || 2), 0);

  let projectHealth = 100;
  if (totalHealthEtc > 0) {
    const doneScore = (doneHealthEtc / totalHealthEtc) * 100;
    const wipScore = (activeHealthEtc / totalHealthEtc) * subtaskCompletionPct;
    const overduePenalty = (overdueHealthEtc / totalHealthEtc) * 50; // Penalti berat untuk task critical
    projectHealth = Math.max(0, Math.min(100, Math.round(doneScore + wipScore - overduePenalty)));
  }

  let healthColor = 'text-emerald-500';
  if (projectHealth < 50) healthColor = 'text-red-500';
  else if (projectHealth < 80) healthColor = 'text-amber-500';

  // Dynamic Trend Chart Data
  const { daysCount, trendDays } = useMemo(() => {
    if (timeFilter === 'custom') {
      if (!customStartDate || !customEndDate) return { daysCount: 0, trendDays: [] };
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      const diffTime = Math.abs(end - start);
      const count = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (count > 365 || count < 2) {
        return { daysCount: 0, trendDays: [] };
      }

      const days = Array.from({ length: count }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return d;
      });
      return { daysCount: count, trendDays: days };
    }

    const count = timeFilter === 'all' ? 30 : parseInt(timeFilter);
    const days = Array.from({ length: count }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (count - 1 - i));
      return d;
    });
    return { daysCount: count, trendDays: days };
  }, [timeFilter, customStartDate, customEndDate]);

  const trendData = trendDays.map((d) => {
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(
      2,
      '0'
    )}`;
    const displayDay =
      daysCount <= 14
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const displayFullDate = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const created = tasksWithLivePriority.filter((t) => t.timestamp && t.timestamp.startsWith(dateStr)).length;
    const done = tasksWithLivePriority.filter((t) => t.completed_time && t.completed_time.startsWith(dateStr)).length;
    const progress = tasksWithLivePriority.filter((t) => {
      const cDate = t.timestamp.split(' ')[0];
      const dDate = t.completed_time ? t.completed_time.split(' ')[0] : '9999-12-31';
      return cDate <= dateStr && dDate > dateStr && t.status !== 'Rejected';
    }).length;

    return { dateStr, displayDay, displayFullDate, created, progress, done };
  });

  const maxTrendVal = Math.max(
    ...trendData.map((d) =>
      Math.max(
        activeLines.created ? d.created : 0,
        activeLines.progress ? d.progress : 0,
        activeLines.done ? d.done : 0
      )
    ),
    4
  );
  const getX = (index) => index * (100 / (daysCount - 1 || 1));
  const getYPct = (val) => 85 - (val / maxTrendVal) * 70;

  // Smart Workload & Insight Logic (Empathy / Workload Support POV)
  const memberDetailedStats = useMemo(() => {
    const stats = {};
    const currentMembersLookup = new Set((teamMembers || []).map((m) => m.toLowerCase()));

    // Inisialisasi seluruh anggota tim aktif agar yang berbeban 0 jam tetap terpantau kapasitas tersedianya
    (teamMembers || []).forEach((member) => {
      const clean = member.replace(/^@/, '').trim();
      if (clean && !stats[clean]) {
        stats[clean] = {
          total: 0,
          total_etc: 0,
          done: 0,
          done_etc: 0,
          active: 0,
          active_etc: 0,
          critical: 0,
          tasks: [],
        };
      }
    });

    tasksWithLivePriority.forEach((t) => {
      if (t.status === 'Rejected') return; // Abaikan tugas yang ditolak secara keseluruhan untuk analisis beban kerja

      const involvedUsers = new Set();

      if (t.owner_username) involvedUsers.add(t.owner_username);

      if (t.requester) {
        const matches = t.requester.match(/@([\w.-]+)/g);
        if (matches) {
          matches.forEach((m) => involvedUsers.add(m.substring(1)));
        }
      }

      if (t.subtask_details) {
        const lines = t.subtask_details.split('\n');
        lines.forEach((line) => {
          const match = line.match(/\(@([\w.-]+)\)$/);
          if (match) involvedUsers.add(match[1]);
        });
      }

      // DISTRIBUSI BEBAN KERJA: Membagi rata total ETC tugas ke semua orang yang terlibat
      const validUsers = Array.from(involvedUsers).filter(
        (p) => p && p.toLowerCase() !== 'unassigned' && currentMembersLookup.has(p.toLowerCase())
      );
      const divisor = validUsers.length > 0 ? validUsers.length : 1;
      const splitEtc = (t.etc || 2) / divisor;

      validUsers.forEach((person) => {
        if (!stats[person]) {
          stats[person] = {
            total: 0,
            total_etc: 0,
            done: 0,
            done_etc: 0,
            active: 0,
            active_etc: 0,
            critical: 0,
            tasks: [],
          };
        }

        stats[person].total += 1;
        stats[person].total_etc += splitEtc;
        stats[person].tasks.push({ ...t, splitEtc });

        if (t.status === 'Done') {
          stats[person].done += 1;
          stats[person].done_etc += splitEtc;
        } else {
          if (t.status !== 'Pending') {
            stats[person].active += 1;
            stats[person].active_etc += splitEtc;
          }
          if (t.priority_lvl === 'critical') stats[person].critical += 1;
        }
      });
    });

    return stats;
  }, [teamMembers, tasksWithLivePriority]);

  // Dynamic Leave & Capacity Integration
  const memberLeaveInfo = useMemo(() => {
    const info = {};
    const nowDt = new Date();
    const todayYMD = nowDt.toISOString().split('T')[0];

    // Hitung awal (Senin) dan akhir (Minggu) pekan ini
    const curDay = nowDt.getDay();
    const diffToMon = curDay === 0 ? -6 : 1 - curDay;
    const monDt = new Date(nowDt);
    monDt.setDate(nowDt.getDate() + diffToMon);
    monDt.setHours(0, 0, 0, 0);

    const sunDt = new Date(monDt);
    sunDt.setDate(monDt.getDate() + 6);
    sunDt.setHours(23, 59, 59, 999);

    const monYMD = monDt.toISOString().split('T')[0];
    const sunYMD = sunDt.toISOString().split('T')[0];

    const allMemberKeys = new Set([
      ...(teamMembers || []).map((m) => m.replace(/^@/, '').trim().toLowerCase()),
      ...Object.keys(memberDetailedStats).map((m) => m.toLowerCase()),
    ]);

    allMemberKeys.forEach((memberLower) => {
      const memberLeaves = (leavesList || []).filter((l) => {
        const isMass = l.leave_type === 'mass_leave' || l.leave_type === 'public_holiday';
        const isPersonal = l.leave_type === 'personal' && l.username && l.username.toLowerCase() === memberLower;
        return isMass || isPersonal;
      });

      const onLeaveToday = memberLeaves.some((l) => l.leave_date === todayYMD);
      const todayLeaveMatch = memberLeaves.find((l) => l.leave_date === todayYMD);

      const thisWeekLeaveDates = new Set(
        memberLeaves
          .filter((l) => l.leave_date >= monYMD && l.leave_date <= sunYMD)
          .map((l) => l.leave_date)
      );
      const leaveDaysThisWeek = thisWeekLeaveDates.size;
      const leaveHoursDeducted = leaveDaysThisWeek * 8;
      const effectiveCapacity = Math.max(0, 40 - leaveHoursDeducted);

      info[memberLower] = {
        memberLeaves,
        onLeaveToday,
        activeLeaveDescription: todayLeaveMatch?.description || (onLeaveToday ? 'Cuti' : null),
        leaveDaysThisWeek,
        leaveHoursDeducted,
        effectiveCapacity,
      };
    });

    return info;
  }, [leavesList, teamMembers, memberDetailedStats]);

  const memberWorkloadAnalysis = useMemo(() => {
    const analysis = {};

    Object.entries(memberDetailedStats).forEach(([person, stats]) => {
      const pLower = person.toLowerCase();
      const leave = memberLeaveInfo[pLower] || {
        onLeaveToday: false,
        activeLeaveDescription: null,
        leaveDaysThisWeek: 0,
        leaveHoursDeducted: 0,
        effectiveCapacity: 40,
        memberLeaves: [],
      };

      const activeLoad = Math.round((stats.total_etc - stats.done_etc) * 10) / 10;
      const effectiveCap = leave.effectiveCapacity;

      let utilizationPct;
      if (effectiveCap > 0) {
        utilizationPct = Math.round((activeLoad / effectiveCap) * 100);
      } else if (activeLoad > 0) {
        utilizationPct = 999;
      } else {
        utilizationPct = 0;
      }

      let healthStatus;
      if (utilizationPct > 100 || (effectiveCap === 0 && activeLoad > 0)) {
        healthStatus = 'overloaded';
      } else if (utilizationPct >= 81) {
        healthStatus = 'near_capacity';
      } else if (utilizationPct >= 40) {
        healthStatus = 'optimal';
      } else {
        healthStatus = 'available';
      }

      // Check task-leave collisions (active tasks due during scheduled leave)
      const collisions = [];
      (stats.tasks || []).forEach((t) => {
        if (t.status !== 'Done' && t.status !== 'Rejected' && t.deadline) {
          const taskDueDate = t.deadline.split(' ')[0];
          const matchedLeave = leave.memberLeaves.find((l) => l.leave_date === taskDueDate);
          if (matchedLeave) {
            collisions.push({
              taskId: t.id,
              taskTitle: t.title,
              deadline: taskDueDate,
              leaveDate: matchedLeave.leave_date,
              leaveDesc: matchedLeave.description || 'Cuti',
            });
          }
        }
      });

      analysis[person] = {
        person,
        stats,
        leave,
        activeLoad,
        effectiveCap,
        utilizationPct,
        healthStatus,
        collisions,
      };
    });

    return analysis;
  }, [memberDetailedStats, memberLeaveInfo]);

  const teamCapacityMetrics = useMemo(() => {
    const entries = Object.values(memberWorkloadAnalysis);
    if (entries.length === 0) {
      return {
        totalMembers: 0,
        overloadedCount: 0,
        nearCapacityCount: 0,
        optimalCount: 0,
        availableCount: 0,
        onLeaveCount: 0,
        totalActiveHours: 0,
        totalEffectiveCapacity: 0,
        overallUtilizationPct: 0,
        burnoutRiskLevel: 'low',
        collisions: [],
        rebalancingAdvice: [],
      };
    }

    let overloadedCount = 0;
    let nearCapacityCount = 0;
    let optimalCount = 0;
    let availableCount = 0;
    let onLeaveCount = 0;
    let totalActiveHours = 0;
    let totalEffectiveCapacity = 0;
    const allCollisions = [];

    entries.forEach((m) => {
      totalActiveHours += m.activeLoad;
      totalEffectiveCapacity += m.effectiveCap;
      if (m.leave.onLeaveToday || m.leave.leaveDaysThisWeek > 0) onLeaveCount += 1;

      if (m.healthStatus === 'overloaded') overloadedCount++;
      else if (m.healthStatus === 'near_capacity') nearCapacityCount++;
      else if (m.healthStatus === 'optimal') optimalCount++;
      else availableCount++;

      if (m.collisions.length > 0) {
        m.collisions.forEach((c) => {
          allCollisions.push({ ...c, member: m.person });
        });
      }
    });

    totalActiveHours = Math.round(totalActiveHours * 10) / 10;
    const overallUtilizationPct =
      totalEffectiveCapacity > 0 ? Math.round((totalActiveHours / totalEffectiveCapacity) * 100) : 0;

    let burnoutRiskLevel = 'low';
    if (overloadedCount >= 2 || entries.some((m) => m.utilizationPct >= 150)) {
      burnoutRiskLevel = 'severe';
    } else if (overloadedCount === 1 || nearCapacityCount >= 2) {
      burnoutRiskLevel = 'moderate';
    }

    const rebalancingAdvice = [];
    const overloadedList = entries.filter((m) => m.healthStatus === 'overloaded');
    const availableList = entries
      .filter((m) => m.healthStatus === 'available')
      .sort((a, b) => a.activeLoad - b.activeLoad);

    if (overloadedList.length > 0 && availableList.length > 0) {
      overloadedList.forEach((ov) => {
        const excessHours = Math.round((ov.activeLoad - ov.effectiveCap) * 10) / 10;
        const target = availableList[0];
        const availableSpace = Math.max(0, Math.round((target.effectiveCap * 0.8 - target.activeLoad) * 10) / 10);
        if (target && excessHours > 0) {
          rebalancingAdvice.push({
            from: ov.person,
            to: target.person,
            excessHours,
            availableSpace,
            messageId: `Alihkan ~${excessHours} jam beban kerja dari @${ov.person} ke @${target.person} (memiliki sisa kapasitas ${availableSpace} jam).`,
            messageEn: `Shift ~${excessHours}h of workload from @${ov.person} to @${target.person} (has ${availableSpace}h remaining capacity).`,
          });
        }
      });
    }

    return {
      totalMembers: entries.length,
      overloadedCount,
      nearCapacityCount,
      optimalCount,
      availableCount,
      onLeaveCount,
      totalActiveHours,
      totalEffectiveCapacity,
      overallUtilizationPct,
      burnoutRiskLevel,
      collisions: allCollisions,
      rebalancingAdvice,
    };
  }, [memberWorkloadAnalysis]);

  let maxActiveEtc = 0;
  let maxCritical = 0;

  // 1. Cari nilai absolut tertinggi untuk menentukan tingkat bahaya (Threshold)
  Object.values(memberDetailedStats).forEach((stats) => {
    const pendingEtc = stats.total_etc - stats.done_etc; // Active + Pending Work in Hours
    if (pendingEtc > maxActiveEtc) maxActiveEtc = pendingEtc;
    if (stats.critical > maxCritical) maxCritical = stats.critical;
  });

  // 2. Kumpulkan SEMUA orang yang melebihi batas bahaya (Threshold Based)
  // Standard work week is 40 hours. If pending ETC is >= 32 (4 days), consider heavily loaded.
  const etcThreshold = maxActiveEtc >= 40 ? 40 : maxActiveEtc >= 32 ? 32 : maxActiveEtc >= 24 ? 24 : Infinity;
  const criticalThreshold = 1; // Siapapun yang punya >= 1 Critical Task akan diangkat

  let topMembers = [];
  let topCriticalMembers = [];

  Object.entries(memberDetailedStats).forEach(([member, stats]) => {
    const pendingEtc = stats.total_etc - stats.done_etc;
    if (pendingEtc >= etcThreshold && etcThreshold <= maxActiveEtc) topMembers.push(member);
    if (stats.critical >= criticalThreshold) topCriticalMembers.push(member);
  });

  // --- NEW ADVANCED INSIGHTS CALCULATIONS (1-4) ---

  // 1. On-Time Delivery Rate (SLA)
  let onTimeCount = 0;
  completedTasks.forEach((t) => {
    if (t.deadline) {
      const doneDate = new Date(t.completed_time.replace(/-/g, '/')).getTime();
      const deadlineDate = new Date(t.deadline.replace(/-/g, '/')).getTime();
      if (doneDate <= deadlineDate) onTimeCount++;
    } else {
      onTimeCount++; // If no deadline, technically on time
    }
  });
  const onTimeRate = completedTasks.length > 0 ? Math.round((onTimeCount / completedTasks.length) * 100) : 0;
  let onTimeColor = 'text-emerald-500';
  if (onTimeRate < 60) onTimeColor = 'text-red-500';
  else if (onTimeRate < 85) onTimeColor = 'text-amber-500';

  // 2. Cycle Time Breakdown by Category
  const ctByCat = {};
  completedTasks.forEach((t) => {
    const cat = t.category || 'Uncategorized';
    const s = new Date(t.timestamp.replace(/-/g, '/'));
    const e = new Date(t.completed_time.replace(/-/g, '/'));
    const days = (e - s) / (1000 * 60 * 60 * 24);
    if (!ctByCat[cat]) ctByCat[cat] = { sum: 0, count: 0 };
    ctByCat[cat].sum += days;
    ctByCat[cat].count += 1;
  });
  const cycleTimeData = Object.entries(ctByCat)
    .map(([cat, data]) => ({ category: cat, avgDays: Math.round((data.sum / data.count) * 10) / 10 }))
    .sort((a, b) => b.avgDays - a.avgDays);
  const maxCycleTime = cycleTimeData.length > 0 ? cycleTimeData[0].avgDays : 1;

  // 3. Velocity Leaderboard (Top Performers)
  const velocityLeaderboard = Object.entries(memberDetailedStats)
    .map(([member, stats]) => ({ member, done: stats.done_etc }))
    .filter((m) => m.done > 0)
    .sort((a, b) => b.done - a.done)
    .slice(0, 5);

  // 4. Bottleneck Radar (Stalled Tasks)
  const activeTasksForRadar = tasksWithLivePriority.filter((t) => t.status !== 'Done' && t.status !== 'Rejected');
  const bottleneckThreshold = Math.max(avgCycleTime * 1.5, 5); // At least 5 days, or 1.5x average cycle time
  const stalledTasks = activeTasksForRadar
    .map((t) => {
      const start = new Date((t.start_date || t.timestamp).replace(/-/g, '/'));
      const daysOpen = Math.round((today - start) / (1000 * 60 * 60 * 24));
      return { ...t, daysOpen };
    })
    .filter((t) => t.daysOpen > bottleneckThreshold)
    .sort((a, b) => b.daysOpen - a.daysOpen)
    .slice(0, 5);

  // Fungsi pembuat kalimat dinamis (contoh:"@alice, @bob, and @charlie")
  const formatNames = (names) => {
    if (!names || names.length === 0) return '';
    if (names.length === 1) return `@${names[0]}`;
    if (names.length === 2) return `@${names[0]} and @${names[1]}`;
    return (
      names
        .map((n) => `@${n}`)
        .slice(0, -1)
        .join(', ') + `, and @${names[names.length - 1]}`
    );
  };

  // Fungsi untuk menampilkan rentang angka (misal:"4-7" atau"5")
  const getTaskRangeStr = (membersArr, isCritical = false) => {
    if (membersArr.length === 0) return '0';
    if (isCritical) {
      const counts = membersArr.map((m) => memberDetailedStats[m].critical);
      const minC = Math.min(...counts);
      const maxC = Math.max(...counts);
      return minC === maxC ? `${maxC}` : language === 'id' ? `hingga ${maxC}` : `up to ${maxC}`;
    } else {
      const counts = membersArr.map((m) => memberDetailedStats[m].total_etc - memberDetailedStats[m].done_etc);
      const minC = Math.round(Math.min(...counts) * 10) / 10;
      const maxC = Math.round(Math.max(...counts) * 10) / 10;
      return minC === maxC ? `${maxC}h` : language === 'id' ? `hingga ${maxC}h` : `up to ${maxC}h`;
    }
  };

  let insightMsg =
    language === 'id'
      ? 'Beban kerja tim Anda terlihat sangat seimbang. Semua orang bekerja dengan kecepatan yang sehat!'
      : "Your team's workload looks nicely balanced. Everyone is operating at a healthy pace!";
  let insightIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      ></path>
    </svg>
  );
  let insightColor =
    'bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-900 dark:text-emerald-200 border-emerald-200/70 dark:border-emerald-800/50';

  const topMembersStr = formatNames(topMembers);
  const topCriticalStr = formatNames(topCriticalMembers);
  const isSamePeople = JSON.stringify(topMembers.sort()) === JSON.stringify(topCriticalMembers.sort());
  const taskRangeStr = getTaskRangeStr(topMembers, false);
  const criticalRangeStr = getTaskRangeStr(topCriticalMembers, true);

  if (maxActiveEtc >= 40 && maxCritical > 0) {
    insightIcon = (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        ></path>
      </svg>
    );
    insightColor =
      'bg-red-50/50 dark:bg-red-900/10 text-red-900 dark:text-red-200 border-red-200/70 dark:border-red-800/50';
    if (isSamePeople) {
      const allAreCriticalOnly = topMembers.length > 0 && topMembers.every((m) => memberDetailedStats[m].critical > 0);
      if (allAreCriticalOnly) {
        insightMsg =
          language === 'id'
            ? `Peringatan Kritis! ${topMembersStr} sangat kewalahan dengan ${taskRangeStr} tugas aktif, dan SEMUANYA memiliki tenggat waktu kritis! Mereka butuh bantuan segera!`
            : `Critical Alert! ${topMembersStr} ${
                topMembers.length > 1 ? 'are' : 'is'
              } severely overloaded with ${taskRangeStr} active tasks, and ALL of them are critical deadlines! They need immediate backup right now!`;
      } else {
        insightMsg =
          language === 'id'
            ? `Peringatan Kritis! ${topMembersStr} sangat kewalahan dengan ${taskRangeStr} tugas aktif, termasuk ${criticalRangeStr} tenggat waktu kritis. Mereka butuh bantuan segera!`
            : `Critical Alert! ${topMembersStr} ${
                topMembers.length > 1 ? 'are' : 'is'
              } severely overloaded with ${taskRangeStr} active tasks, including ${criticalRangeStr} critical deadline(s). They need immediate backup!`;
      }
    } else {
      insightMsg =
        language === 'id'
          ? `Peringatan Tim! ${topMembersStr} kewalahan dengan ${taskRangeStr} tugas aktif, sementara ${topCriticalStr} menghadapi ${criticalRangeStr} tenggat waktu kritis. Redistribusi beban kerja sangat disarankan segera!`
          : `Team Alert! ${topMembersStr} ${
              topMembers.length > 1 ? 'are' : 'is'
            } overwhelmed with ${taskRangeStr} active tasks, while ${topCriticalStr} ${
              topCriticalMembers.length > 1 ? 'are' : 'is'
            } facing ${criticalRangeStr} critical deadline(s). Immediate workload redistribution is highly recommended!`;
    }
  } else if (maxCritical > 0) {
    insightMsg =
      language === 'id'
        ? `Perhatian! ${topCriticalStr} memiliki ${criticalRangeStr} tugas kritis/terlambat. Mereka mungkin butuh bantuan segera untuk memperlancar pekerjaan.`
        : `Attention! ${topCriticalStr} ${
            topCriticalMembers.length > 1 ? 'have' : 'has'
          } ${criticalRangeStr} critical/overdue task(s). They might need immediate backup to clear the bottleneck.`;
    insightIcon = (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        ></path>
      </svg>
    );
    insightColor =
      'bg-red-50/50 dark:bg-red-900/10 text-red-900 dark:text-red-200 border-red-200/70 dark:border-red-800/50';
  } else if (maxActiveEtc >= 24) {
    insightMsg =
      language === 'id'
        ? `Sepertinya ${topMembersStr} saat ini memikul beban berat dengan ${taskRangeStr} tugas aktif. Pertimbangkan untuk memeriksa atau membagikan ulang beberapa tugas untuk mendukung mereka!`
        : `It looks like ${topMembersStr} ${
            topMembers.length > 1 ? 'are' : 'is'
          } currently carrying a heavy load with ${taskRangeStr} active requests. Consider checking in or redistributing some tasks to support them!`;
    insightIcon = (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        ></path>
      </svg>
    );
    insightColor =
      'bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-900 dark:text-indigo-200 border-indigo-200/70 dark:border-indigo-800/50';
  }

  const handleGenerateGeminiInsight = async () => {
    setIsGeneratingAi(true);

    const completionRate = totalHealthEtc > 0 ? Math.round((doneHealthEtc / totalHealthEtc) * 100) : 0;

    const taskByStatus = columns.reduce((acc, status) => {
      acc[status] = tasksWithLivePriority.filter((t) => t.status === status).length;
      return acc;
    }, {});

    const taskByCategory = tasksWithLivePriority.reduce((acc, t) => {
      const cat = t.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const activeTaskPriority = activeTasksForRadar.reduce(
      (acc, t) => {
        const prio = t.priority_lvl || 'normal';
        acc[prio] = (acc[prio] || 0) + 1;
        return acc;
      },
      { critical: 0, warning: 0, normal: 0 }
    );

    const statsForAI = {
      projectHealth: `${projectHealth}%`,
      systemAlert: insightMsg,
      totalTasks: tasksWithLivePriority.length,
      totalHoursETC: totalHealthEtc,
      completedHoursETC: doneHealthEtc,
      activeHoursETC: activeHealthEtc,
      completedTasks: tasksWithLivePriority.filter((t) => t.status === 'Done').length,
      activeTasks: tasksWithLivePriority.filter((t) => t.status !== 'Done' && t.status !== 'Rejected').length,
      overdueTasks: tasksWithLivePriority.filter(
        (t) => t.priority_lvl === 'critical' && t.status !== 'Done' && t.status !== 'Rejected'
      ).length,
      completionRate: `${completionRate}%`,
      onTimeSLA: `${onTimeRate}%`,
      avgCycleTime: `${avgCycleTime} days`,
      subtaskCompletion: `${subtaskCompletionPct}%`,
      topPerformers: topMembers,
      bottleneckTasks: stalledTasks.length,
      taskByStatus,
      taskByCategory,
      activeTaskPriority,
      cycleByCategory: cycleTimeData.reduce((acc, c) => {
        acc[c.category] = `${c.avgDays} days`;
        return acc;
      }, {}),
      teamWorkload: Object.entries(memberDetailedStats).reduce((acc, [member, stats]) => {
        acc[member] = {
          total: stats.total_etc,
          done: stats.done_etc,
          active: stats.active_etc,
          critical: stats.critical,
        };
        return acc;
      }, {}),
    };
    const prompt = `You are a professional Project Manager AI Assistant for Alurku. Analyze these workspace stats for the last ${timeFilter} days: ${JSON.stringify(
      statsForAI
    )}. Write a 2 to 3 sentence insightful, encouraging, and analytical summary for the team that uncovers hidden trends from the data. Do NOT just paraphrase the systemAlert. Focus on cycle times, completion rates, or bottlenecks. Keep it professional but modern. You can use markdown like bold text. Please respond strictly in ${
      language === 'id' ? 'Indonesian' : 'English'
    }.`;

    try {
      const res = await axios.post('/api/ai/generate', { prompt });
      setAiInsight(res.data.text);
      setAiProvider(res.data.provider || 'AI');
    } catch (err) {
      const errorDetail = err.response?.data?.detail;
      const cleanMsg =
        errorDetail && !/gemini|groq|gpt-oss|llama|openai|claude|cloudflare/i.test(errorDetail)
          ? errorDetail
          : (language === 'id'
              ? 'Asisten AI sedang mengalami kendala koneksi sementara. Silakan coba beberapa saat lagi.'
              : 'AI Assistant is temporarily experiencing connection issues. Please try again in a moment.');
      setAiInsight(`⚠️ ${cleanMsg}`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* 1. Rule-Based System Insight */}
        <div
          className={`summary-card p-5 rounded-2xl border shadow-sm flex flex-col gap-3 transition-all ${insightColor}`}
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl leading-none">{insightIcon}</div>
            <h4 className="text-[10px] font-bold opacity-70">
              {language === 'id' ? 'Peringatan Kesehatan Sistem' : 'System Health Alert'}
            </h4>
          </div>
          <p className="text-sm font-medium leading-relaxed">{insightMsg}</p>
        </div>

        {/* 2. Gemini AI Executive Summary */}
        <div className="summary-card p-5 rounded-2xl border shadow-sm flex flex-col gap-3 transition-all bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-900 dark:text-indigo-200 border-indigo-200/70 dark:border-indigo-800/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-2xl leading-none">
                <svg
                  className="w-6 h-6 text-indigo-500 dark:text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  ></path>
                </svg>
              </div>
              <h4 className="text-[10px] font-bold opacity-70">
                {language === 'id' ? 'Ringkasan Eksekutif AI' : 'Executive AI Summary'}{' '}
                {aiProvider && `• ${aiProvider}`}
              </h4>
            </div>
            {!aiInsight && (
              <button
                onClick={handleGenerateGeminiInsight}
                disabled={isGeneratingAi}
                className="text-xs font-bold bg-[#FACC15] text-[#111E38] hover:bg-[#eab308] shadow-sm transition-transform hover:scale-105 disabled:opacity-50 px-5 py-2 rounded-full"
              >
                {isGeneratingAi
                  ? language === 'id'
                    ? 'Membuat...'
                    : 'Generating...'
                  : language === 'id'
                  ? 'Buat Ringkasan AI'
                  : 'Generate Insight'}
              </button>
            )}
          </div>
          {isGeneratingAi ? (
            <div className="animate-pulse flex flex-col gap-2 mt-1">
              <div className="h-3 bg-indigo-200 dark:bg-indigo-800/50 rounded w-full"></div>
              <div className="h-3 bg-indigo-200 dark:bg-indigo-800/50 rounded w-4/5"></div>
            </div>
          ) : aiInsight ? (
            <p
              className="text-sm font-medium leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: String(aiInsight).replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>'),
              }}
            ></p>
          ) : (
            <p className="text-sm font-medium opacity-70 italic mt-1">
              {language === 'id'
                ? 'Klik buat untuk mendapatkan analisis AI mendalam tentang beban kerja Anda saat ini.'
                : 'Click generate to get a deep-dive AI analysis of your current workload.'}
            </p>
          )}
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <h2 className="overview-title text-xl font-bold text-slate-800 dark:text-white">Performance Overview</h2>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <span className="timeframe-label text-xs font-bold text-slate-500">Timeframe:</span>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500 transition-all [&>option]:bg-white dark:[&>option]:bg-slate-800 w-full sm:w-auto"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="all">All Time</option>
            <option value="custom">Custom Range</option>
          </select>
          {timeFilter === 'custom' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold py-2 px-3 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-full"
              />
              <span className="text-xs font-bold text-slate-500">-</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                min={customStartDate}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold py-2 px-3 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-full"
              />
            </div>
          )}
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 lg:gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 lg:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative hover:z-50 transition-all duration-300 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 truncate">Project Health</p>
            <div className="relative group/tooltip flex items-center">
              <span className="cursor-help text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 text-xs transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </span>
              <div className="hidden sm:block absolute top-full left-0 mt-3 w-56 sm:w-64 p-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-100 text-left pointer-events-none whitespace-normal border border-slate-700 dark:border-slate-200">
                <p className="font-medium mb-2 pb-2 border-b border-slate-700/50 dark:border-slate-200/50 leading-relaxed">
                  Overall workspace health score combining global completion and micro-progress, weighted by Estimated
                  Time Consumption (ETC).
                </p>
                <p className="font-bold text-[8px] opacity-50 mb-1">Logic / Method</p>
                <p className="font-mono text-[9px] bg-black/20 dark:bg-black/5 p-1.5 rounded wrap-break-word">
                  (Done ETC% + WIP ETC%) - Overdue Penalty
                </p>
                <div className="absolute bottom-full left-2 border-4 border-transparent border-b-slate-900 dark:border-b-white"></div>
              </div>
            </div>
          </div>
          <div className="mt-3 relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center self-center group/gauge">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-700/50"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className={
                  projectHealth >= 80 ? 'text-emerald-500' : projectHealth >= 50 ? 'text-[#FACC15]' : 'text-red-500'
                }
                strokeDasharray={`${projectHealth}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm sm:text-base font-bold ${healthColor}`}>{projectHealth}%</span>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 lg:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative hover:z-50 transition-all duration-300 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 truncate">Total Tasks</p>
            <div className="relative group/tooltip flex items-center">
              <span className="cursor-help text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 text-xs transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </span>
              <div className="hidden sm:block absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 sm:w-64 p-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-100 text-left pointer-events-none whitespace-normal border border-slate-700 dark:border-slate-200">
                <p className="font-medium mb-2 pb-2 border-b border-slate-700/50 dark:border-slate-200/50 leading-relaxed">
                  Total number of tasks matching the current workspace and timeframe filters.
                </p>
                <p className="font-bold text-[8px] opacity-50 mb-1">Logic / Method</p>
                <p className="font-mono text-[9px] bg-black/20 dark:bg-black/5 p-1.5 rounded wrap-break-word">
                  Count(Filtered Tasks)
                </p>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-white"></div>
              </div>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
            {tasksWithLivePriority.length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 lg:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative hover:z-50 transition-all duration-300 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 truncate">Active / WIP</p>
            <div className="relative group/tooltip flex items-center">
              <span className="cursor-help text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 text-xs transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </span>
              <div className="hidden sm:block absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 sm:w-64 p-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-100 text-left pointer-events-none whitespace-normal border border-slate-700 dark:border-slate-200">
                <p className="font-medium mb-2 pb-2 border-b border-slate-700/50 dark:border-slate-200/50 leading-relaxed">
                  Tasks that are active and currently being worked on.
                </p>
                <p className="font-bold text-[8px] opacity-50 mb-1">Logic / Method</p>
                <p className="font-mono text-[9px] bg-black/20 dark:bg-black/5 p-1.5 rounded wrap-break-word">
                  Count(Status ∉ ['Done', 'Rejected', 'Pending'])
                </p>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-white"></div>
              </div>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">
            {
              tasksWithLivePriority.filter(
                (t) => t.status !== 'Done' && t.status !== 'Rejected' && t.status !== 'Pending'
              ).length
            }
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 lg:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative hover:z-50 transition-all duration-300 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 truncate">Completed</p>
            <div className="relative group/tooltip flex items-center">
              <span className="cursor-help text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 text-xs transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </span>
              <div className="hidden sm:block absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 sm:w-64 p-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-100 text-left pointer-events-none whitespace-normal border border-slate-700 dark:border-slate-200">
                <p className="font-medium mb-2 pb-2 border-b border-slate-700/50 dark:border-slate-200/50 leading-relaxed">
                  Tasks that have been successfully finished.
                </p>
                <p className="font-bold text-[8px] opacity-50 mb-1">Logic / Method</p>
                <p className="font-mono text-[9px] bg-black/20 dark:bg-black/5 p-1.5 rounded wrap-break-word">
                  Count(Status == 'Done')
                </p>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-white"></div>
              </div>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600">
            {tasksWithLivePriority.filter((t) => t.status === 'Done').length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 lg:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative hover:z-50 transition-all duration-300 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 truncate">Overdue</p>
            <div className="relative group/tooltip flex items-center">
              <span className="cursor-help text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 text-xs transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </span>
              <div className="hidden sm:block absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 sm:w-64 p-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-100 text-left pointer-events-none whitespace-normal border border-slate-700 dark:border-slate-200">
                <p className="font-medium mb-2 pb-2 border-b border-slate-700/50 dark:border-slate-200/50 leading-relaxed">
                  Active tasks that are critically approaching deadline or overdue.
                </p>
                <p className="font-bold text-[8px] opacity-50 mb-1">Logic / Method</p>
                <p className="font-mono text-[9px] bg-black/20 dark:bg-black/5 p-1.5 rounded wrap-break-word">
                  Count(Status != 'Done' & Priority == 'Critical')
                </p>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-white"></div>
              </div>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-red-500">
            {
              tasksWithLivePriority.filter(
                (t) => t.priority_lvl === 'critical' && t.status !== 'Done' && t.status !== 'Rejected'
              ).length
            }
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 lg:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative hover:z-50 transition-all duration-300 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 truncate">Completion Rate</p>
            <div className="relative group/tooltip flex items-center">
              <span className="cursor-help text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 text-xs transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </span>
              <div className="hidden sm:block absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 sm:w-64 p-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-100 text-left pointer-events-none whitespace-normal border border-slate-700 dark:border-slate-200">
                <p className="font-medium mb-2 pb-2 border-b border-slate-700/50 dark:border-slate-200/50 leading-relaxed">
                  Percentage of successfully finished tasks based on total Estimated Time Consumption (ETC).
                </p>
                <p className="font-bold text-[8px] opacity-50 mb-1">Logic / Method</p>
                <p className="font-mono text-[9px] bg-black/20 dark:bg-black/5 p-1.5 rounded wrap-break-word">
                  (Completed ETC / Total ETC) × 100%
                </p>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-white"></div>
              </div>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-500">
            {totalHealthEtc > 0 ? Math.round((doneHealthEtc / totalHealthEtc) * 100) : 0}%
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 lg:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative hover:z-50 transition-all duration-300 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 truncate">Avg Cycle Time</p>
            <div className="relative group/tooltip flex items-center">
              <span className="cursor-help text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 text-xs transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </span>
              <div className="hidden sm:block absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 sm:w-64 p-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-100 text-left pointer-events-none whitespace-normal border border-slate-700 dark:border-slate-200">
                <p className="font-medium mb-2 pb-2 border-b border-slate-700/50 dark:border-slate-200/50 leading-relaxed">
                  Average number of days taken to complete a task from creation to done.
                </p>
                <p className="font-bold text-[8px] opacity-50 mb-1">Logic / Method</p>
                <p className="font-mono text-[9px] bg-black/20 dark:bg-black/5 p-1.5 rounded wrap-break-word">
                  Σ(Done Date - Start Date) / Completed Tasks
                </p>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-white"></div>
              </div>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-purple-500">
            {avgCycleTime} <span className="text-xs sm:text-sm font-bold text-slate-400">days</span>
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 lg:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative hover:z-50 transition-all duration-300 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 truncate">Sub-task Comp.</p>
            <div className="relative group/tooltip flex items-center">
              <span className="cursor-help text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 text-xs transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </span>
              <div className="hidden sm:block absolute top-full right-0 mt-3 w-56 sm:w-64 p-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-100 text-left pointer-events-none whitespace-normal border border-slate-700 dark:border-slate-200">
                <p className="font-medium mb-2 pb-2 border-b border-slate-700/50 dark:border-slate-200/50 leading-relaxed">
                  Percentage of completed checklists across all tasks.
                </p>
                <p className="font-bold text-[8px] opacity-50 mb-1">Logic / Method</p>
                <p className="font-mono text-[9px] bg-black/20 dark:bg-black/5 p-1.5 rounded wrap-break-word">
                  (Total Done Subtasks / Total Subtasks) × 100%
                </p>
                <div className="absolute bottom-full right-2 border-4 border-transparent border-b-slate-900 dark:border-b-white"></div>
              </div>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-teal-500">{subtaskCompletionPct}%</p>
        </div>
      </div>

      {/* TREND LINE CHART (Full Width) */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative hover:z-50 transition-all duration-300 lg:col-span-full">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  Activity Trend{' '}
                  {timeFilter === 'all' ? '(Last 30 Days)' : timeFilter !== 'custom' ? `(Last ${timeFilter} Days)` : ''}
                </h3>
                <div className="relative group/tooltip flex items-center">
                  <span className="cursor-help text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 text-sm transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </span>
                  <div className="hidden sm:block absolute top-full left-0 mt-3 w-56 sm:w-64 p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-100 text-left pointer-events-none whitespace-normal border border-slate-700 dark:border-slate-200">
                    <p className="font-medium leading-relaxed">
                      Shows task volumes over time. Click the metric buttons to toggle visibility on the chart.
                    </p>
                    <div className="absolute bottom-full left-4 border-4 border-transparent border-b-slate-900 dark:border-b-white"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
              <button
                onClick={() => setActiveLines((prev) => ({ ...prev, created: !prev.created }))}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-2 select-none ${
                  activeLines.created
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-400 shadow-sm'
                    : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-400 grayscale opacity-60 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Created
              </button>
              <button
                onClick={() => setActiveLines((prev) => ({ ...prev, progress: !prev.progress }))}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-2 select-none ${
                  activeLines.progress
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 shadow-sm'
                    : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-400 grayscale opacity-60 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-blue-500"></div> Active / WIP
              </button>
              <button
                onClick={() => setActiveLines((prev) => ({ ...prev, done: !prev.done }))}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-2 select-none ${
                  activeLines.done
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 shadow-sm'
                    : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-400 grayscale opacity-60 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Completed
              </button>
            </div>
          </div>

          {daysCount === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-500 font-bold">
                {language === 'id'
                  ? 'Rentang tanggal tidak valid atau terlalu besar (maks 365 hari).'
                  : 'Invalid date range or range is too large (max 365 days).'}
              </p>
            </div>
          )}
          {daysCount > 0 && (
            <div className="w-full relative mt-4 overflow-x-auto custom-scrollbar pb-4 -mx-6 px-6 sm:mx-0 sm:px-0">
              <div className="min-w-175 xl:min-w-full w-full relative pt-2">
                {hoveredIdx !== null && (
                  <div
                    className={`absolute z-50 pointer-events-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-xl p-3.5 text-xs min-w-37.5 transform ${
                      hoveredIdx < 3
                        ? 'translate-x-0'
                        : hoveredIdx > daysCount - 4
                        ? '-translate-x-full'
                        : '-translate-x-1/2'
                    } transition-all duration-75 ease-out`}
                    style={{
                      left: hoveredIdx < 3 ? '0%' : hoveredIdx > daysCount - 4 ? '100%' : `${getX(hoveredIdx)}%`,
                      top: '0px',
                    }}
                  >
                    <div className="font-bold text-slate-800 dark:text-white mb-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                      {trendData[hoveredIdx].displayFullDate}
                    </div>
                    <div className="space-y-2.5">
                      {activeLines.created && (
                        <div className="flex justify-between items-center gap-4">
                          <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-[9px]">
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Created
                          </span>
                          <span className="font-bold text-slate-800 dark:text-white">
                            {trendData[hoveredIdx].created}
                          </span>
                        </div>
                      )}
                      {activeLines.progress && (
                        <div className="flex justify-between items-center gap-4">
                          <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-[9px]">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div> Active
                          </span>
                          <span className="font-bold text-slate-800 dark:text-white">
                            {trendData[hoveredIdx].progress}
                          </span>
                        </div>
                      )}
                      {activeLines.done && (
                        <div className="flex justify-between items-center gap-4">
                          <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-[9px]">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Completed
                          </span>
                          <span className="font-bold text-slate-800 dark:text-white">{trendData[hoveredIdx].done}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <svg className="w-full h-64 overflow-visible" onMouseLeave={() => setHoveredIdx(null)}>
                  <line
                    x1="0%"
                    y1={`${getYPct(maxTrendVal)}%`}
                    x2="100%"
                    y2={`${getYPct(maxTrendVal)}%`}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-slate-200 dark:text-slate-700"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="0%"
                    y1={`${getYPct(maxTrendVal / 2)}%`}
                    x2="100%"
                    y2={`${getYPct(maxTrendVal / 2)}%`}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-slate-200 dark:text-slate-700"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="0%"
                    y1={`${getYPct(0)}%`}
                    x2="100%"
                    y2={`${getYPct(0)}%`}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-slate-200 dark:text-slate-700"
                  />

                  <text
                    x="0%"
                    y={`${getYPct(maxTrendVal)}%`}
                    dy="-6"
                    fontSize="11"
                    fill="currentColor"
                    className="text-slate-400 font-bold"
                    textAnchor="start"
                  >
                    {maxTrendVal}
                  </text>
                  <text
                    x="0%"
                    y={`${getYPct(maxTrendVal / 2)}%`}
                    dy="-6"
                    fontSize="11"
                    fill="currentColor"
                    className="text-slate-400 font-bold"
                    textAnchor="start"
                  >
                    {Math.round(maxTrendVal / 2)}
                  </text>
                  <text
                    x="0%"
                    y={`${getYPct(0)}%`}
                    dy="-6"
                    fontSize="11"
                    fill="currentColor"
                    className="text-slate-400 font-bold"
                    textAnchor="start"
                  >
                    0
                  </text>

                  {hoveredIdx !== null && (
                    <line
                      x1={`${getX(hoveredIdx)}%`}
                      y1="5%"
                      x2={`${getX(hoveredIdx)}%`}
                      y2="95%"
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-slate-300 dark:text-slate-600"
                      strokeDasharray="4 4"
                      pointerEvents="none"
                    />
                  )}

                  {activeLines.created &&
                    trendData
                      .slice(0, -1)
                      .map((d, i) => (
                        <line
                          key={`c-${i}`}
                          x1={`${getX(i)}%`}
                          y1={`${getYPct(d.created)}%`}
                          x2={`${getX(i + 1)}%`}
                          y2={`${getYPct(trendData[i + 1].created)}%`}
                          stroke="#6366f1"
                          strokeWidth="3"
                          strokeLinecap="round"
                          pointerEvents="none"
                        />
                      ))}
                  {activeLines.progress &&
                    trendData
                      .slice(0, -1)
                      .map((d, i) => (
                        <line
                          key={`p-${i}`}
                          x1={`${getX(i)}%`}
                          y1={`${getYPct(d.progress)}%`}
                          x2={`${getX(i + 1)}%`}
                          y2={`${getYPct(trendData[i + 1].progress)}%`}
                          stroke="#3b82f6"
                          strokeWidth="3"
                          strokeLinecap="round"
                          pointerEvents="none"
                        />
                      ))}
                  {activeLines.done &&
                    trendData
                      .slice(0, -1)
                      .map((d, i) => (
                        <line
                          key={`d-${i}`}
                          x1={`${getX(i)}%`}
                          y1={`${getYPct(d.done)}%`}
                          x2={`${getX(i + 1)}%`}
                          y2={`${getYPct(trendData[i + 1].done)}%`}
                          stroke="#10b981"
                          strokeWidth="3"
                          strokeLinecap="round"
                          pointerEvents="none"
                        />
                      ))}

                  {trendData.map((d, i) => {
                    const showText = daysCount <= 14 || i % Math.ceil(daysCount / 7) === 0 || i === daysCount - 1;
                    const isHovered = hoveredIdx === i;
                    return (
                      <g key={i}>
                        {activeLines.created && (
                          <circle
                            cx={`${getX(i)}%`}
                            cy={`${getYPct(d.created)}%`}
                            r={isHovered ? '6' : '4'}
                            className="fill-white dark:fill-slate-800 transition-all pointer-events-none"
                            stroke="#6366f1"
                            strokeWidth="2"
                          />
                        )}
                        {activeLines.progress && (
                          <circle
                            cx={`${getX(i)}%`}
                            cy={`${getYPct(d.progress)}%`}
                            r={isHovered ? '6' : '4'}
                            className="fill-white dark:fill-slate-800 transition-all pointer-events-none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                          />
                        )}
                        {activeLines.done && (
                          <circle
                            cx={`${getX(i)}%`}
                            cy={`${getYPct(d.done)}%`}
                            r={isHovered ? '6' : '4'}
                            className="fill-white dark:fill-slate-800 transition-all pointer-events-none"
                            stroke="#10b981"
                            strokeWidth="2"
                          />
                        )}

                        {showText && (
                          <text
                            x={`${getX(i)}%`}
                            y="100%"
                            fontSize="11"
                            fill="currentColor"
                            textAnchor={i === 0 ? 'start' : i === daysCount - 1 ? 'end' : 'middle'}
                            className={`font-bold transition-colors pointer-events-none ${
                              isHovered ? 'text-black dark:text-white' : 'text-slate-500'
                            }`}
                          >
                            {d.displayDay.toUpperCase()}
                          </text>
                        )}

                        <rect
                          x={`${getX(i) - 100 / (daysCount - 1 || 1) / 2}%`}
                          y="0%"
                          width={`${100 / (daysCount - 1 || 1)}%`}
                          height="100%"
                          fill="transparent"
                          className="cursor-crosshair outline-none"
                          onMouseEnter={() => setHoveredIdx(i)}
                          onClick={() => setHoveredIdx(i)}
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADVANCED INSIGHTS ROW (4 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
        {/* 1. On-Time Delivery Rate (SLA) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">On-Time SLA</h3>
            <div className="relative group/tooltip flex items-center z-50">
              <span className="cursor-help text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 text-sm transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </span>
              <div className="hidden sm:block absolute top-full left-0 mt-3 w-56 p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-100 text-left pointer-events-none border border-slate-700 dark:border-slate-200">
                <p className="font-medium leading-relaxed">
                  Percentage of tasks delivered before or strictly on their target deadline date.
                </p>
                <div className="absolute bottom-full left-4 border-4 border-transparent border-b-slate-900 dark:border-b-white"></div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-6">
            <p className={`text-6xl font-bold ${onTimeColor}`}>{onTimeRate}%</p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-4 text-center">
              <span className="text-slate-800 dark:text-white">{onTimeCount}</span> of {completedTasks.length} Delivered
              On Schedule
            </p>
          </div>
        </div>

        {/* 2. Velocity Leaderboard */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Top Performers</h3>
            <div className="relative group/tooltip flex items-center z-50">
              <span className="cursor-help text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 text-sm transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </span>
              <div className="hidden sm:block absolute top-full left-0 mt-3 w-56 p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-100 text-left pointer-events-none border border-slate-700 dark:border-slate-200">
                <p className="font-medium leading-relaxed">
                  The most productive members based on total Estimated Time Consumption (ETC) delivered.
                </p>
                <div className="absolute bottom-full left-4 border-4 border-transparent border-b-slate-900 dark:border-b-white"></div>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {velocityLeaderboard.length === 0 ? (
              <p className="text-slate-400 dark:text-slate-500 text-sm italic text-center py-4">
                No completed tasks yet.
              </p>
            ) : (
              velocityLeaderboard.map((u, i) => (
                <div
                  key={u.member}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 text-center text-lg">
                      {i === 0 ? (
                        '🥇'
                      ) : i === 1 ? (
                        '🥈'
                      ) : i === 2 ? (
                        '🥉'
                      ) : (
                        <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                      )}
                    </div>
                    <Avatar
                      name={u.member}
                      url={avatarsMap[u.member.replace('@', '').trim()]}
                      size="w-8 h-8"
                      textClass="text-[10px]"
                    />
                    <span
                      className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate max-w-25"
                      title={u.member}
                    >
                      {u.member}
                    </span>
                  </div>
                  <span className="text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 px-2 py-1 rounded-md">
                    {u.done.toFixed(1)}h <span className="opacity-50 font-medium">Delivered</span>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Cycle Time Breakdown */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Cycle by Category</h3>
            <div className="relative group/tooltip flex items-center z-50">
              <span className="cursor-help text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 text-sm transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </span>
              <div className="hidden sm:block absolute top-full left-0 mt-3 w-56 p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-100 text-left pointer-events-none border border-slate-700 dark:border-slate-200">
                <p className="font-medium leading-relaxed">
                  Breakdown of average days taken to complete a task, grouped by category type.
                </p>
                <div className="absolute bottom-full left-4 border-4 border-transparent border-b-slate-900 dark:border-b-white"></div>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {cycleTimeData.length === 0 ? (
              <p className="text-slate-400 dark:text-slate-500 text-sm italic text-center py-4">No data available.</p>
            ) : (
              cycleTimeData.map((c) => {
                const pct = (c.avgDays / maxCycleTime) * 100;
                return (
                  <div key={c.category}>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-700 dark:text-slate-300 truncate max-w-35">{c.category}</span>
                      <span className="text-slate-500 dark:text-slate-400">{c.avgDays} days</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 4. Bottleneck Radar */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Bottleneck Radar</h3>
            <div className="relative group/tooltip flex items-center z-50">
              <span className="cursor-help text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 text-sm transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </span>
              <div className="hidden sm:block absolute top-full right-0 mt-3 w-56 p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-100 text-left pointer-events-none border border-slate-700 dark:border-slate-200">
                <p className="font-medium leading-relaxed">
                  Identifies active tasks that have been open abnormally longer than the average cycle time (
                  {Math.round(bottleneckThreshold)} days limit).
                </p>
                <div className="absolute bottom-full right-4 border-4 border-transparent border-b-slate-900 dark:border-b-white"></div>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
            {stalledTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 opacity-70">
                <span className="text-4xl mb-2">✨</span>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold text-center">
                  Zero Bottlenecks.
                  <br />
                  Tasks flowing smoothly!
                </p>
              </div>
            ) : (
              stalledTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTask && setSelectedTask(t)}
                  className="p-3 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all"
                >
                  <p
                    className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mb-1"
                    title={t.project_name}
                  >
                    {t.project_name}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] font-medium text-slate-500 truncate max-w-25">{t.requester}</span>
                    <span className="text-[9px] font-bold bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 px-2 py-0.5 rounded-full animate-pulse">
                      Open {t.daysOpen} Days
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Visual Breakdown Charts (Top 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {tMsg('Task by Status', 'Tugas Berdasarkan Status')}
            </h3>
            <div className="relative group/tooltip flex items-center z-50">
              <span className="cursor-help text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 text-sm transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </span>
              <div className="hidden sm:block absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 sm:w-64 p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-100 text-left pointer-events-none whitespace-normal border border-slate-700 dark:border-slate-200">
                <p className="font-medium leading-relaxed">
                  {tMsg(
                    'Shows the distribution of tasks across different workflow columns to track overall project progress.',
                    'Menampilkan distribusi tugas di berbagai kolom alur kerja untuk melacak progres keseluruhan proyek.'
                  )}
                </p>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-white"></div>
              </div>
            </div>
          </div>
          <div className="space-y-5">
            {columns.map((status) => {
              const count = tasksWithLivePriority.filter((t) => t.status === status).length;
              const pct = tasksWithLivePriority.length > 0 ? (count / tasksWithLivePriority.length) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-700 dark:text-slate-300">{status}</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {count} ({Math.round(pct)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        status === 'Done'
                          ? 'bg-emerald-500'
                          : status === 'Rejected'
                          ? 'bg-slate-400'
                          : status === 'Pending'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {tMsg('Task by Category', 'Tugas Berdasarkan Kategori')}
            </h3>
            <div className="relative group/tooltip flex items-center z-50">
              <span className="cursor-help text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 text-sm transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </span>
              <div className="hidden sm:block absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 sm:w-64 p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-100 text-left pointer-events-none whitespace-normal border border-slate-700 dark:border-slate-200">
                <p className="font-medium leading-relaxed">
                  {tMsg(
                    'Breaks down tasks by category. Helps identify which type of work consumes the most resources.',
                    'Merinci tugas berdasarkan kategori. Membantu mengetahui jenis pekerjaan yang paling banyak menyita sumber daya.'
                  )}
                </p>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-white"></div>
              </div>
            </div>
          </div>
          <div className="space-y-5 max-h-64 overflow-y-auto pr-2">
            {Object.entries(
              tasksWithLivePriority.reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + 1;
                return acc;
              }, {})
            )
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => {
                const pct = tasksWithLivePriority.length > 0 ? (count / tasksWithLivePriority.length) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span className="text-slate-700 dark:text-slate-300">{cat}</span>
                      <span className="text-slate-500 dark:text-slate-400">{count}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3">
                      <div
                        className="bg-indigo-500 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            {tasksWithLivePriority.length === 0 && (
              <p className="text-slate-400 dark:text-slate-500 text-sm italic">
                {tMsg('No data available.', 'Tidak ada data tersedia.')}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {tMsg('Active Task Priority', 'Prioritas Tugas Aktif')}
            </h3>
            <div className="relative group/tooltip flex items-center z-50">
              <span className="cursor-help text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 text-sm transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </span>
              <div className="hidden sm:block absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 sm:w-64 p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-100 text-left pointer-events-none whitespace-normal border border-slate-700 dark:border-slate-200">
                <p className="font-medium leading-relaxed">
                  {tMsg(
                    'Displays the urgency of active tasks. Critical tasks are due within 24h, Warning within 3 days.',
                    'Menampilkan urgensi tugas aktif. Tugas kritis jatuh tempo dalam 24 jam, peringatan dalam 3 hari.'
                  )}
                </p>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-white"></div>
              </div>
            </div>
          </div>
          <div className="space-y-5 max-h-64 overflow-y-auto pr-2">
            {(() => {
              const activeTasks = tasksWithLivePriority.filter((t) => t.status !== 'Done' && t.status !== 'Rejected');
              const prioCounts = { critical: 0, warning: 0, normal: 0 };
              activeTasks.forEach((t) => {
                if (t.priority_lvl) prioCounts[t.priority_lvl] = (prioCounts[t.priority_lvl] || 0) + 1;
                else prioCounts.normal += 1;
              });

              return [
                {
                  label: tMsg('Critical', 'Kritis'),
                  dotColor: 'bg-red-500',
                  count: prioCounts.critical,
                  color: 'bg-red-500',
                },
                {
                  label: tMsg('Warning', 'Peringatan'),
                  dotColor: 'bg-amber-500',
                  count: prioCounts.warning,
                  color: 'bg-amber-500',
                },
                {
                  label: tMsg('Normal', 'Normal'),
                  dotColor: 'bg-emerald-500',
                  count: prioCounts.normal,
                  color: 'bg-emerald-500',
                },
              ].map((prio) => {
                const pct = activeTasks.length > 0 ? (prio.count / activeTasks.length) * 100 : 0;
                return (
                  <div key={prio.label}>
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <span className={`w-2 h-2 rounded-full ${prio.dotColor}`}></span>
                        {prio.label}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {prio.count} ({Math.round(pct)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3">
                      <div
                        className={`${prio.color} h-3 rounded-full transition-all duration-1000`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              });
            })()}
            {tasksWithLivePriority.filter((t) => t.status !== 'Done' && t.status !== 'Rejected').length === 0 && (
              <p className="text-slate-400 dark:text-slate-500 text-sm italic">
                {tMsg('No active tasks available.', 'Tidak ada tugas aktif tersedia.')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* BRAND BOOK PILLAR 2: Kerja Seimbang, Anti-Kewalahan (Workload Analytics & Burnout Prevention) */}
      <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FACC15]/20 border border-[#FACC15]/40 text-[#111E38] dark:text-[#FACC15] text-xs font-bold uppercase tracking-wider mb-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                ></path>
              </svg>
              <span>{tMsg('Pillar 2 • Workload Intelligence', 'Pilar 2 • Analisis Beban Kerja')}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#111E38] dark:text-white">
              {tMsg('Workload Analytics & Burnout Prevention', 'Kerja Seimbang, Anti-Kewalahan')}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
              {tMsg(
                "Know your team's capacity limit. alurku. visualizes workload in real time to distribute tasks fairly, prevent burnout, and enable on-time rest.",
                'Ketahui batas kapasitasmu dan timmu. alurku. memvisualisasikan beban kerja secara real time agar kamu bisa membagi tugas dengan adil, mencegah burnout, dan bisa istirahat tepat waktu.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Burnout Risk Badge */}
            <div
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                teamCapacityMetrics.burnoutRiskLevel === 'severe'
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 animate-pulse'
                  : teamCapacityMetrics.burnoutRiskLevel === 'moderate'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {teamCapacityMetrics.burnoutRiskLevel === 'severe' || teamCapacityMetrics.burnoutRiskLevel === 'moderate' ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                )}
              </svg>
              <div>
                <span className="block text-[10px] uppercase tracking-wider opacity-80">
                  {tMsg('Burnout Risk Index', 'Indeks Risiko Burnout')}
                </span>
                <span className="font-extrabold">
                  {teamCapacityMetrics.burnoutRiskLevel === 'severe'
                    ? tMsg('High Risk / Overloaded', 'Tinggi (Kelebihan Beban)')
                    : teamCapacityMetrics.burnoutRiskLevel === 'moderate'
                    ? tMsg('Moderate / Warning', 'Waspada (Mendekati Batas)')
                    : tMsg('Low / Balanced', 'Sehat & Seimbang')}
                </span>
              </div>
            </div>

            {/* Total Team Utilization Pill */}
            <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold">
              <span className="block text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-400">
                {tMsg('Total Workload / Capacity', 'Total Beban / Kapasitas')}
              </span>
              <span>
                {teamCapacityMetrics.totalActiveHours}h / {teamCapacityMetrics.totalEffectiveCapacity}h (
                {teamCapacityMetrics.overallUtilizationPct}%)
              </span>
            </div>
          </div>
        </div>

        {/* 4 Summary Stat Mini Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
          <div className="p-4 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-700 dark:text-red-400">
                {tMsg('Overloaded Members', 'Kelebihan Beban')}
              </span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            </div>
            <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-2">
              {teamCapacityMetrics.overloadedCount}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">
                {tMsg('people (>100%)', 'orang (>100%)')}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                {tMsg('Near Capacity', 'Mendekati Batas')}
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-300 mt-2">
              {teamCapacityMetrics.nearCapacityCount}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">
                {tMsg('people (81-100%)', 'orang (81-100%)')}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                {tMsg('Optimal & Available', 'Optimal & Longgar')}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-300 mt-2">
              {teamCapacityMetrics.optimalCount + teamCapacityMetrics.availableCount}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">
                {tMsg('people (<=80%)', 'orang (<=80%)')}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                {tMsg('Leaves / Holidays', 'Cuti & Libur')}
              </span>
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-300 mt-2">
              {teamCapacityMetrics.onLeaveCount}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">
                {tMsg('active this week', 'aktif pekan ini')}
              </span>
            </div>
          </div>
        </div>

        {/* Task-Leave Collisions Warning Banner */}
        {teamCapacityMetrics.collisions.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-red-900 dark:text-red-100">
                  {tMsg('Leave Conflict Alert: Active Deadlines on Leave Dates', 'Peringatan Konflik Cuti: Tenggat Tugas Bertepatan dengan Hari Cuti')}
                </h4>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  {tMsg(
                    'The following active tasks are scheduled with deadlines on dates when the assignee is on leave. Reschedule or reassign them to prevent project delays:',
                    'Tugas aktif berikut memiliki batas waktu pada hari ketika anggota sedang cuti. Jadwalkan ulang atau alihkan tugas untuk mencegah penundaan proyek:'
                  )}
                </p>
                <div className="mt-2.5 space-y-1.5">
                  {teamCapacityMetrics.collisions.map((c, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap items-center justify-between text-xs bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-red-200 dark:border-red-800/60"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-100">@{c.member}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-xs">{c.taskTitle}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 sm:mt-0">
                        <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 font-semibold text-[11px]">
                          {c.deadline} ({c.leaveDesc})
                        </span>
                        <button
                          onClick={() => setInspectingMember(c.member)}
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          {tMsg('Inspect', 'Periksa')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Smart Rebalancing Recommendations */}
        {teamCapacityMetrics.rebalancingAdvice.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                ></path>
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-amber-950 dark:text-amber-100">
                  {tMsg('AI Workload Rebalancing Advice', 'Saran Penyeimbangan Beban Kerja Otomatis')}
                </h4>
                <div className="mt-2 space-y-1.5">
                  {teamCapacityMetrics.rebalancingAdvice.map((adv, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap items-center justify-between text-xs bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-amber-200/80 dark:border-amber-800/60"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {tMsg(adv.messageEn, adv.messageId)}
                      </span>
                      <div className="flex items-center gap-2 mt-1 sm:mt-0">
                        <button
                          onClick={() => setInspectingMember(adv.from)}
                          className="px-2.5 py-1 rounded-md bg-[#FACC15] hover:bg-yellow-400 text-[#111E38] font-bold text-[11px] transition-colors"
                        >
                          {tMsg('Inspect Tasks', 'Periksa Tugas')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
            {tMsg('Filter View:', 'Filter Tampilan:')}
          </span>
          {[
            { id: 'all', label: tMsg('All Members', 'Semua Anggota'), count: teamCapacityMetrics.totalMembers },
            { id: 'overloaded', label: tMsg('Overloaded', 'Kelebihan Beban'), count: teamCapacityMetrics.overloadedCount },
            { id: 'near_capacity', label: tMsg('Near Capacity', 'Mendekati Batas'), count: teamCapacityMetrics.nearCapacityCount },
            { id: 'optimal', label: tMsg('Optimal', 'Optimal'), count: teamCapacityMetrics.optimalCount },
            { id: 'available', label: tMsg('Available Bandwidth', 'Kapasitas Longgar'), count: teamCapacityMetrics.availableCount },
            { id: 'on_leave', label: tMsg('On Leave', 'Sedang Cuti'), count: teamCapacityMetrics.onLeaveCount },
          ].map((tab) => {
            const isActive = workloadFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setWorkloadFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#111E38] text-white dark:bg-[#FACC15] dark:text-[#111E38] shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-[#111E38]'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Member Capacity Balancing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Object.values(memberWorkloadAnalysis)
            .filter((m) => {
              if (workloadFilter === 'all') return true;
              if (workloadFilter === 'overloaded') return m.healthStatus === 'overloaded';
              if (workloadFilter === 'near_capacity') return m.healthStatus === 'near_capacity';
              if (workloadFilter === 'optimal') return m.healthStatus === 'optimal';
              if (workloadFilter === 'available') return m.healthStatus === 'available';
              if (workloadFilter === 'on_leave') return m.leave.onLeaveToday || m.leave.leaveDaysThisWeek > 0;
              return true;
            })
            .sort((a, b) => {
              // Priority sorting: Overloaded first, then descending by utilization
              if (a.healthStatus === 'overloaded' && b.healthStatus !== 'overloaded') return -1;
              if (b.healthStatus === 'overloaded' && a.healthStatus !== 'overloaded') return 1;
              return b.utilizationPct - a.utilizationPct;
            })
            .map((m) => {
              const isOverloaded = m.healthStatus === 'overloaded';
              const isNearCap = m.healthStatus === 'near_capacity';
              const isOpt = m.healthStatus === 'optimal';

              const barColor = isOverloaded
                ? 'bg-red-500'
                : isNearCap
                ? 'bg-amber-500'
                : isOpt
                ? 'bg-emerald-500'
                : 'bg-blue-400';

              const badgeColor = isOverloaded
                ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-800'
                : isNearCap
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                : isOpt
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800';

              const barWidth = Math.min(100, m.utilizationPct);

              return (
                <div
                  key={m.person}
                  className={`p-5 rounded-xl border transition-all ${
                    isOverloaded
                      ? 'bg-red-50/20 dark:bg-red-950/10 border-red-300 dark:border-red-900 shadow-sm'
                      : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {/* Member Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        name={m.person}
                        url={avatarsMap[m.person.replace('@', '').trim()]}
                        size="w-9 h-9"
                        textClass="text-xs font-bold"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-[#111E38] dark:text-white truncate max-w-35" title={m.person}>
                            {m.person}
                          </span>
                          {currentUser && m.person.toLowerCase() === currentUser.toLowerCase() && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {tMsg('You', 'Kamu')}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                          {m.stats.total} {tMsg('tasks assigned', 'tugas teralokasi')}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 ${badgeColor}`}>
                      {isOverloaded
                        ? tMsg('Overloaded', 'Overload')
                        : isNearCap
                        ? tMsg('Near Capacity', 'Mendekati Batas')
                        : isOpt
                        ? tMsg('Optimal', 'Optimal')
                        : tMsg('Available', 'Tersedia')}
                    </span>
                  </div>

                  {/* Leave Banner if active */}
                  {m.leave.onLeaveToday ? (
                    <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                      <span className="truncate">
                        {tMsg('On Leave Today:', 'Sedang Cuti Hari Ini:')} {m.leave.activeLeaveDescription || tMsg('Leave', 'Cuti')}
                      </span>
                    </div>
                  ) : m.leave.leaveDaysThisWeek > 0 ? (
                    <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/50 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                      <span>
                        {tMsg(
                          `Leave ${m.leave.leaveDaysThisWeek}d this week (-${m.leave.leaveHoursDeducted}h)`,
                          `Cuti ${m.leave.leaveDaysThisWeek} hari pekan ini (-${m.leave.leaveHoursDeducted} jam)`
                        )}
                      </span>
                    </div>
                  ) : null}

                  {/* Task-Leave Collision in card */}
                  {m.collisions.length > 0 && (
                    <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-red-100/70 dark:bg-red-950/50 border border-red-200 text-[11px] font-bold text-red-700 dark:text-red-300 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <span>
                        {tMsg(
                          `${m.collisions.length} task(s) due during leave!`,
                          `${m.collisions.length} tugas jatuh tempo saat cuti!`
                        )}
                      </span>
                    </div>
                  )}

                  {/* Capacity Balance Meter */}
                  <div className="space-y-1.5 my-3">
                    <div className="flex justify-between items-baseline text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-400">
                        {tMsg('Capacity Load:', 'Beban Kapasitas:')}
                      </span>
                      <span className={isOverloaded ? 'text-red-600 dark:text-red-400 font-extrabold' : 'text-slate-800 dark:text-slate-200'}>
                        {m.activeLoad}h / {m.effectiveCap}h{' '}
                        <span className="text-[10px] font-normal opacity-80">({m.utilizationPct}%)</span>
                      </span>
                    </div>

                    <div className="relative w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`${barColor} h-full transition-all duration-1000 rounded-full`}
                        style={{ width: `${barWidth}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                      <span>0h</span>
                      <span>{tMsg('Max 40h/wk', 'Maks 40j/mgg')}</span>
                    </div>
                  </div>

                  {/* Mini breakdown tiles */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 dark:border-slate-700/60 text-center">
                    <div className="bg-white dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/40">
                      <span className="block text-[9px] uppercase font-bold text-slate-400">
                        {tMsg('Done', 'Selesai')}
                      </span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {m.stats.done} ({Math.round(m.stats.done_etc * 10) / 10}h)
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/40">
                      <span className="block text-[9px] uppercase font-bold text-slate-400">
                        {tMsg('Active', 'Aktif')}
                      </span>
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                        {m.stats.active} ({Math.round(m.stats.active_etc * 10) / 10}h)
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/40">
                      <span className="block text-[9px] uppercase font-bold text-slate-400">
                        {tMsg('Critical', 'Kritis')}
                      </span>
                      <span className="text-xs font-black text-red-600 dark:text-red-400">
                        {m.stats.critical}
                      </span>
                    </div>
                  </div>

                  {/* Inspect CTA Button */}
                  <button
                    onClick={() => setInspectingMember(m.person)}
                    className="w-full mt-3.5 py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-600 hover:border-[#111E38] dark:hover:border-[#FACC15] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-[#111E38] dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      ></path>
                    </svg>
                    <span>{tMsg('Inspect Tasks & Schedule', 'Periksa Tugas & Jadwal')}</span>
                  </button>
                </div>
              );
            })}
        </div>

        {Object.keys(memberWorkloadAnalysis).length === 0 && (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm italic">
            {tMsg('No team members or tasks recorded for workload analysis.', 'Belum ada anggota tim atau tugas yang tercatat untuk analisis beban kerja.')}
          </div>
        )}
      </div>

      {/* Task Inspector Modal / Drawer */}
      {inspectingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex items-center gap-3">
                <Avatar
                  name={inspectingMember}
                  url={avatarsMap[inspectingMember.replace('@', '').trim()]}
                  size="w-11 h-11"
                  textClass="text-sm font-bold"
                />
                <div>
                  <h4 className="text-lg font-bold text-[#111E38] dark:text-white flex items-center gap-2">
                    <span>@{inspectingMember}</span>
                    {memberWorkloadAnalysis[inspectingMember]?.healthStatus === 'overloaded' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                        {tMsg('Burnout Alert', 'Risiko Burnout')}
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {tMsg('Workload Load:', 'Beban Kapasitas:')}{' '}
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {memberWorkloadAnalysis[inspectingMember]?.activeLoad || 0}h /{' '}
                      {memberWorkloadAnalysis[inspectingMember]?.effectiveCap || 40}h (
                      {memberWorkloadAnalysis[inspectingMember]?.utilizationPct || 0}%)
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectingMember(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title={tMsg('Close', 'Tutup')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Modal Task List Body */}
            <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-1">
                <span>{tMsg('Assigned Tasks', 'Daftar Tugas Terbuka')}</span>
                <span>
                  {(memberDetailedStats[inspectingMember]?.tasks || []).length} {tMsg('tasks', 'tugas')}
                </span>
              </div>

              {(!memberDetailedStats[inspectingMember]?.tasks ||
                memberDetailedStats[inspectingMember]?.tasks.length === 0) && (
                <div className="text-center py-8 text-slate-400 text-sm italic">
                  {tMsg('No tasks currently assigned to this member.', 'Tidak ada tugas yang teralokasi untuk anggota ini saat ini.')}
                </div>
              )}

              {(memberDetailedStats[inspectingMember]?.tasks || []).map((task) => {
                const isTaskDone = task.status === 'Done';
                const isTaskCritical = task.priority_lvl === 'critical';
                const isTaskWarning = task.priority_lvl === 'warning';

                // Check if this task conflicts with member's leave
                const memberLeaves = memberLeaveInfo[inspectingMember.toLowerCase()]?.memberLeaves || [];
                const dueDate = task.deadline ? task.deadline.split(' ')[0] : null;
                const leaveCollision = dueDate ? memberLeaves.find((l) => l.leave_date === dueDate) : null;

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border transition-all ${
                      leaveCollision
                        ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                        : isTaskDone
                        ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              task.status === 'Done'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : task.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {task.status}
                          </span>

                          {isTaskCritical && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                              {tMsg('Critical Priority', 'Prioritas Kritis')}
                            </span>
                          )}

                          {isTaskWarning && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              {tMsg('Warning Priority', 'Peringatan')}
                            </span>
                          )}

                          {leaveCollision && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500 text-white animate-pulse">
                              {tMsg('Due on Leave!', 'Jatuh Tempo Saat Cuti!')}
                            </span>
                          )}
                        </div>

                        <h5 className="font-bold text-sm text-slate-800 dark:text-white truncate" title={task.project_name || task.title}>
                          {task.project_name || task.title}
                        </h5>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          {task.deadline && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              <span>{tMsg('Deadline:', 'Tenggat:')} {task.deadline}</span>
                            </span>
                          )}

                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>ETC: {task.splitEtc ? Math.round(task.splitEtc * 10) / 10 : (task.etc || 2)}h</span>
                          </span>

                          {task.category && (
                            <span className="text-slate-400">• {task.category}</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (setSelectedTask) setSelectedTask(task);
                          setInspectingMember(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#111E38] dark:bg-[#FACC15] text-white dark:text-[#111E38] font-bold text-xs hover:opacity-90 transition-all shrink-0 flex items-center gap-1"
                      >
                        <span>{tMsg('Open', 'Buka')}</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end bg-slate-50 dark:bg-slate-900/50">
              <button
                onClick={() => setInspectingMember(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
              >
                {tMsg('Close', 'Tutup')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
