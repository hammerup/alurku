export const isUserAssigned = (task, username) => {
  if (!task || !username) return false;
  const uname = username.toLowerCase();
  const reqLower = (task.requester || '').toLowerCase();
  const escapedUname = uname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const isMentionedExact = new RegExp(`@${escapedUname}(?![\\w.-])`, 'i').test(reqLower);
  const isAssignedSubtask =
    (task.subtask_assignees || '').toLowerCase().split(', ').includes(uname) ||
    (Array.isArray(task.subtasks) && task.subtasks.some((st) => (st.assignee || '').toLowerCase() === uname));
  const isOwner = (task.owner_username || '').toLowerCase() === uname;
  const hasAnyMention = reqLower.includes('@');

  return isMentionedExact || isAssignedSubtask || (isOwner && !hasAnyMention);
};

export const getTaskAssignee = (task) => {
  if (!task) return 'Unassigned';
  const match = (task.requester || '').match(/@([\w.-]+)/);
  if (match) return `@${match[1]}`;
  if (task.owner_username) return `@${task.owner_username}`;
  return 'Unassigned';
};

export const parseLocalZero = (dateStr) => {
  if (!dateStr) return new Date(0);
  const d = new Date(dateStr.split(' ')[0].replace(/-/g, '/'));
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getLocalToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(
    2,
    '0'
  )}`;
};

export const handleRequesterChange = (
  value,
  setFormFn,
  formDataState,
  setMentionQuery,
  setIsMentioning,
  setMentionIndex
) => {
  setFormFn({ ...formDataState, requester: value });
  const match = value.match(/(?:^|\s)@([\w.-]*)$/);
  if (match) {
    if (setMentionQuery) setMentionQuery(match[1].toLowerCase());
    if (setIsMentioning) setIsMentioning(true);
    if (setMentionIndex) setMentionIndex(0);
  } else {
    if (setIsMentioning) setIsMentioning(false);
  }
};

export const insertMention = (username, setFormFn, formDataState, setIsMentioning) => {
  const newVal = formDataState.requester.replace(/(?:^|\s)@([\w.-]*)$/, ` @${username} `);
  setFormFn({ ...formDataState, requester: newVal });
  if (setIsMentioning) setIsMentioning(false);
};

