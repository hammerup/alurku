import { useState } from 'react';
import axios from 'axios';
import { isUserAssigned } from './helpers';

export function useAIAssistantState({
  currentUser,
  filteredTasks,
  showNotification,
  setIsLoading,
  setIsSubmitting,
  language,
  setIsExportModalOpen,
  setIsFeedbackOpen,
  setIsSupportOpen,
}) {
  const [feedbackText, setFeedbackText] = useState('');
  const [supportText, setSupportText] = useState('');
  const [exportMode, setExportMode] = useState('board');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  const handleExportCSV = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (setIsLoading) setIsLoading(true);
    let tasksToExport = filteredTasks || [];
    let isGlobal = exportMode === 'global';

    if (isGlobal) {
      try {
        const res = await axios.get('/api/tasks/global-export');
        tasksToExport = res.data.tasks || [];

        tasksToExport = tasksToExport.filter((task) => {
          const uname = (currentUser || '').toLowerCase();
          if (isUserAssigned(task, currentUser)) return true;
          if ((task.requester || '').toLowerCase().trim() === uname) return true;

          const isCreator = (task.owner_username || '').toLowerCase() === uname;
          const hasOtherAssignees = (task.requester || '').includes('@') || task.subtask_assignees;

          return isCreator && !hasOtherAssignees;
        });
      } catch (err) {
        if (setIsLoading) setIsLoading(false);
        if (showNotification) showNotification('Failed to fetch global tasks', 'error');
        return;
      }
    }

    if (exportStartDate || exportEndDate) {
      const start = exportStartDate ? new Date(exportStartDate) : new Date('2000-01-01');
      const end = exportEndDate ? new Date(exportEndDate) : new Date('2100-01-01');
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      tasksToExport = tasksToExport.filter((t) => {
        const createdDate = new Date(t.timestamp ? t.timestamp.split(' ')[0] : '1970-01-01');
        const deadlineDate = t.deadline ? new Date(t.deadline.split(' ')[0]) : new Date('1970-01-01');
        const completedDate = t.completed_time ? new Date(t.completed_time.split(' ')[0]) : new Date('1970-01-01');

        const isCompletedInRange = completedDate >= start && completedDate <= end;
        const isDeadlineInRange = deadlineDate >= start && deadlineDate <= end;
        const isCreatedInRange = createdDate >= start && createdDate <= end;

        return isCompletedInRange || isDeadlineInRange || isCreatedInRange;
      });
    }

    if (tasksToExport.length === 0) {
      if (setIsLoading) setIsLoading(false);
      if (showNotification) showNotification('No tasks found in this period.', 'error');
      return;
    }

    const headers = isGlobal
      ? [
          'Workspace',
          'Task Name',
          'Description',
          'Task Creator',
          'Requester',
          'Subtasks',
          'Category',
          'Status',
          'Start Date',
          'Deadline',
          'Completed Time',
          'Impact',
          'ETC (Hrs)',
          'Recurring',
        ]
      : [
          'ID',
          'Task Name',
          'Description',
          'Task Creator',
          'Requester',
          'Subtasks',
          'Category',
          'Status',
          'Start Date',
          'Deadline',
          'Completed Time',
          'Impact',
          'ETC (Hrs)',
          'Recurring',
        ];

    const escapeCSV = (str) => {
      if (!str && str !== 0) return '""';
      return `"${String(str).replace(/"/g, '""')}"`;
    };

    const csvRows = [
      headers.join(','),
      ...tasksToExport.map((t) => {
        let displayedSubtasks = t.subtask_details;

        const escapedUname = (currentUser || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const exactMentionRegex = new RegExp(`@${escapedUname}(?![\\w.-])`, 'i');

        if (
          isGlobal &&
          !exactMentionRegex.test(t.requester) &&
          (t.requester || '').toLowerCase().trim() !== (currentUser || '').toLowerCase()
        ) {
          displayedSubtasks = (t.subtask_details || '')
            .split('\n')
            .filter((line) => exactMentionRegex.test(line))
            .join('\n');
        }

        return [
          isGlobal ? escapeCSV(t.board_name) : t.id,
          escapeCSV(t.project_name),
          escapeCSV(t.description),
          escapeCSV(t.owner_username),
          escapeCSV(t.requester),
          escapeCSV(displayedSubtasks),
          escapeCSV(t.category),
          escapeCSV(t.status),
          escapeCSV(t.start_date || (t.timestamp ? t.timestamp.split(' ')[0] : '')),
          escapeCSV(t.deadline),
          escapeCSV(t.completed_time),
          escapeCSV(t.impact || 'Medium'),
          escapeCSV(t.etc || 2),
          escapeCSV(t.recurring || 'none'),
        ].join(',');
      }),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `alurku_Export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    if (setIsExportModalOpen) setIsExportModalOpen(false);
    if (setIsLoading) setIsLoading(false);
    if (showNotification) showNotification('Data exported to CSV successfully!', 'success');
  };

  const handleFeedbackSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!feedbackText.trim()) return;
    if (setIsSubmitting) setIsSubmitting(true);
    axios
      .post('/api/feedback', { text: feedbackText })
      .then((res) => {
        if (showNotification) showNotification(res.data.message, 'success');
        if (setIsFeedbackOpen) setIsFeedbackOpen(false);
        setFeedbackText('');
      })
      .catch(() => {
        if (showNotification) showNotification('Failed to submit feedback', 'error');
      })
      .finally(() => {
        if (setIsSubmitting) setIsSubmitting(false);
      });
  };

  const handleSupportSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!supportText.trim()) return;
    if (setIsSubmitting) setIsSubmitting(true);
    axios
      .post('/api/feedback', { text: `[SUPPORT TICKET] ${supportText}` })
      .then(() => {
        if (showNotification) {
          showNotification(
            language === 'id'
              ? 'Tiket dukungan berhasil dikirim ke tim IT!'
              : 'Support ticket sent to IT successfully!',
            'success'
          );
        }
        if (setIsSupportOpen) setIsSupportOpen(false);
        setSupportText('');
      })
      .catch(() => {
        if (showNotification) showNotification('Failed to submit support ticket', 'error');
      })
      .finally(() => {
        if (setIsSubmitting) setIsSubmitting(false);
      });
  };

  return {
    feedbackText,
    setFeedbackText,
    supportText,
    setSupportText,
    exportMode,
    setExportMode,
    exportStartDate,
    setExportStartDate,
    exportEndDate,
    setExportEndDate,
    handleExportCSV,
    handleFeedbackSubmit,
    handleSupportSubmit,
  };
}
