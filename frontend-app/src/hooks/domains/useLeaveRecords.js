import { useState, useCallback } from 'react';
import axios from 'axios';

export function useLeaveRecords({
  isAuthenticated,
  showNotification,
  fetchTasks,
}) {
  const [leaves, setLeaves] = useState([]);
  const [leaveForm, setLeaveForm] = useState({ start_date: '', end_date: '', desc: '', type: 'personal' });

  const fetchLeaves = useCallback(() => {
    if (!isAuthenticated) return;
    axios
      .get('/api/leaves')
      .then((res) => setLeaves(res.data.leaves || []))
      .catch((err) => console.error(err));
  }, [isAuthenticated]);

  const handleAddLeave = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    axios
      .post('/api/leaves', {
        start_date: leaveForm.start_date,
        end_date: leaveForm.end_date,
        description: leaveForm.desc,
        leave_type: leaveForm.type,
      })
      .then(() => {
        if (showNotification) showNotification('Leave added successfully!', 'success');
        setLeaveForm({ start_date: '', end_date: '', desc: '', type: 'personal' });
        fetchLeaves();
        if (fetchTasks) fetchTasks();
      })
      .catch((err) => {
        if (showNotification) showNotification(err.response?.data?.detail || 'Error adding leave', 'error');
      });
  };

  const handleDeleteLeave = (id) => {
    axios
      .delete(`/api/leaves/${id}`)
      .then(() => {
        fetchLeaves();
        if (fetchTasks) fetchTasks();
      })
      .catch(() => {
        if (showNotification) showNotification('Failed to delete', 'error');
      });
  };

  return {
    leaves,
    setLeaves,
    leaveForm,
    setLeaveForm,
    fetchLeaves,
    handleAddLeave,
    handleDeleteLeave,
  };
}
