import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { IconPerson, IconPlus, Avatar } from './SharedUI';
import { getTaskAssignee } from './useAppLogic';
import { HighlightText } from './Utils';

export default function KanbanBoard({
  activeColumns,
  filteredTasks,
  searchQuery,
  groupBy,
  DEFAULT_COLUMNS,
  avatarsMap,
  currentUser,
  onDragEnd,
  handleOpenRenameBoard,
  handleOpenDeleteBoard,
  setSelectedTask,
  handleOpenAddBoard,
  formatDateMMM,
  accountStatus,
  selectedBoard,
  boards,
  setSelectedBoard,
  isSuperAdmin,
  notifications,
  cardTheme,
  isTrashHovered,
  language,
  clonedTaskIds,
  isKanbanDragging,
}) {
  const [expandedArchives, setExpandedArchives] = useState({});

  const toggleArchive = (colName) => {
    setExpandedArchives((prev) => ({ ...prev, [colName]: !prev[colName] }));
  };

  const tMsg = (en, id) => (language === 'id' ? id : en);

  // Column Status Dot Indicator Helper
  const getColumnDotColor = (name) => {
    const col = (name || '').toLowerCase();
    if (col === 'to do' || col === 'pending') return 'bg-amber-400 ring-2 ring-amber-400/20';
    if (col === 'in progress') return 'bg-[#FACC15] ring-2 ring-[#FACC15]/30 animate-pulse';
    if (col === 'done') return 'bg-emerald-500 ring-2 ring-emerald-500/20';
    if (col === 'rejected') return 'bg-rose-500 ring-2 ring-rose-500/20';
    return 'bg-indigo-500 ring-2 ring-indigo-500/20';
  };

  return (
    <div className="flex-1 flex gap-5 sm:gap-6 items-stretch pb-4 w-max min-w-full min-h-0 select-none">
      <Droppable droppableId="board" direction="horizontal" type="column">
        {(providedBoard) => (
          <div
            className="flex gap-5 sm:gap-6 items-stretch h-auto sm:h-full min-h-full"
            ref={providedBoard.innerRef}
            {...providedBoard.droppableProps}
          >
            {activeColumns.map((colName, index) => {
              let columnTasks = filteredTasks.filter((t) => {
                if (groupBy === 'Status') return t.status === colName;
                if (groupBy === 'Category') return t.category === colName;
                if (groupBy === 'Assignee') return getTaskAssignee(t) === colName;
                if (groupBy === 'Project') return (t.board_name || 'Unknown Project') === colName;
                return false;
              });

              const isArchiveCol = colName === 'Done' || colName === 'Rejected';
              if (isArchiveCol) {
                columnTasks = [...columnTasks].sort((a, b) => {
                  const tA = a.completed_time
                    ? new Date(a.completed_time.replace(/-/g, '/')).getTime()
                    : new Date(a.timestamp.replace(/-/g, '/')).getTime();
                  const tB = b.completed_time
                    ? new Date(b.completed_time.replace(/-/g, '/')).getTime()
                    : new Date(b.timestamp.replace(/-/g, '/')).getTime();
                  return tB - tA;
                });
              }

              const limit = 5;
              const isExpanded = expandedArchives[colName];
              const visibleTasks = isArchiveCol && !isExpanded ? columnTasks.slice(0, limit) : columnTasks;
              const archivedCount = columnTasks.length - visibleTasks.length;

              const renderTaskCardContent = (task, provided, snapshot, isClone = false) => {
                const isTaskAdmin =
                  isSuperAdmin ||
                  task.owner_username === currentUser ||
                  (selectedBoard && selectedBoard.owner_username === currentUser) ||
                  (task.requester &&
                    new RegExp(`@${currentUser.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}(?![\\\\w.-])`, 'i').test(
                      task.requester
                    ));
                const hasUnreadNotif = (notifications || []).some((n) => !n.is_read && n.related_task_id === task.id);
                const isNewClone =
                  clonedTaskIds &&
                  (clonedTaskIds.has(task.id) ||
                    clonedTaskIds.has(String(task.id)) ||
                    clonedTaskIds.has(Number(task.id)));
                const isOriginalBeingDragged = snapshot.isDragging && !isClone;

                return (
                  <div
                    id={isClone ? undefined : `task-card-${task.id}`}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`group/card relative task-card p-4 rounded-xl border mb-3 w-full max-w-full min-w-0 box-border transition-all duration-200 ${
                      hasUnreadNotif || isNewClone
                        ? 'bg-white dark:bg-[#121B2D] border-amber-400 dark:border-amber-400 ring-2 ring-[#FACC15]/50 shadow-md'
                        : 'bg-white dark:bg-[#121B2D] border-neutral-200/80 dark:border-neutral-800/80 hover:border-amber-400/60 dark:hover:border-amber-400/50 hover:shadow-md'
                    } ${
                      isOriginalBeingDragged
                        ? 'opacity-0! shadow-none! border-transparent! bg-transparent!'
                        : snapshot.isDragging && isTrashHovered
                        ? 'cursor-grabbing z-99999 opacity-0! bg-transparent! border-transparent! shadow-none!'
                        : snapshot.isDragging
                        ? 'shadow-2xl cursor-grabbing z-99999 border-[#FACC15] ring-4 ring-[#FACC15]/30 rotate-2 scale-102 bg-white dark:bg-[#121B2D]'
                        : 'shadow-xs cursor-grab active:cursor-grabbing'
                    } ${task.status === 'Done' || task.status === 'Rejected' ? 'opacity-65 hover:opacity-100' : ''} ${
                      isClone ? 'rotate-2 scale-102' : ''
                    }`}
                    onClick={() => setSelectedTask(task)}
                    style={{
                      ...provided.draggableProps.style,
                      margin: isClone ? 0 : provided.draggableProps.style?.margin,
                      transform:
                        snapshot.isDragging && !isTrashHovered && !isOriginalBeingDragged
                          ? `${provided.draggableProps.style?.transform || ''} scale(1.02) rotate(2deg)`
                          : provided.draggableProps.style?.transform,
                      ...(cardTheme &&
                      task.status !== 'Done' &&
                      task.status !== 'Rejected' &&
                      !(snapshot.isDragging && isTrashHovered) &&
                      !isOriginalBeingDragged
                        ? {
                            background:
                              cardTheme === 'sunset'
                                ? 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
                                : cardTheme,
                          }
                        : {}),
                    }}
                  >
                    {/* Card Header: Project & Category Badges + Date */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {task.board_name && task.board_name !== 'Unknown' && (
                          <>
                            <span
                              className="text-[9px] font-extrabold text-[#111E38] dark:text-neutral-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-[#FACC15] hover:text-[#111E38] px-2 py-0.5 rounded-md cursor-pointer flex items-center gap-1 truncate max-w-28 transition-colors border border-neutral-200/60 dark:border-neutral-700/60"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (boards && setSelectedBoard) {
                                  const targetBoard = boards.find((b) => b.id === task.board_id);
                                  if (targetBoard) setSelectedBoard(targetBoard);
                                }
                              }}
                              title={`Go to Project: ${task.board_name}`}
                            >
                              <svg className="w-3 h-3 text-neutral-500 dark:text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5-13.5h16.5" />
                              </svg>
                              <span className="truncate">{task.board_name}</span>
                            </span>
                            <span className="text-neutral-300 dark:text-neutral-700 font-bold text-[10px]">/</span>
                          </>
                        )}
                        <span
                          className="text-[9px] font-bold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md truncate max-w-24 border border-neutral-200/50 dark:border-neutral-700/50"
                          title={task.category}
                        >
                          {task.category || 'Task'}
                        </span>
                      </div>

                      <span className="text-[10px] font-semibold text-neutral-400 shrink-0 flex items-center gap-1">
                        <svg className="w-3 h-3 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h12.75A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
                        </svg>
                        {formatDateMMM(task.timestamp)}
                      </span>
                    </div>

                    {/* Card Title & Queue Badge */}
                    <div className="mb-2.5">
                      <div className="font-bold text-sm text-[#111E38] dark:text-white wrap-break-word leading-snug tracking-tight group-hover/card:text-amber-600 dark:group-hover/card:text-[#FACC15] transition-colors">
                        {(() => {
                          const isGlobal = !selectedBoard || selectedBoard.id === 'global';
                          const queuePos = isGlobal ? task.queue_global_number : task.queue_project_number;
                          const totalQueue = isGlobal ? task.total_global_queue : task.total_project_queue;
                          const queueType = isGlobal ? 'overall' : tMsg('project', 'proyek');

                          if (queuePos && totalQueue && task.status !== 'Done' && task.status !== 'Rejected') {
                            return (
                              <span
                                className="inline-block text-[9px] font-black bg-[#FACC15] text-[#111E38] px-1.5 py-0.5 rounded shadow-xs cursor-help mr-1.5 align-middle select-none"
                                title={tMsg(
                                  `This task is number ${queuePos} out of ${totalQueue} in ${
                                    task.main_assignee || 'their'
                                  }'s current ${queueType} queue.`,
                                  `Tugas ini berada di urutan ke-${queuePos} dari ${totalQueue} dalam antrean ${queueType} ${
                                    task.main_assignee || 'mereka'
                                  } saat ini.`
                                )}
                              >
                                #{queuePos}/{totalQueue}
                              </span>
                            );
                          }
                          return null;
                        })()}
                        <HighlightText text={task.project_name} query={searchQuery} />
                      </div>

                      {/* Metadata Badges: Priority, Impact, ETC, Recurring */}
                      {task.status !== 'Done' &&
                        task.status !== 'Rejected' &&
                        (task.priority_lvl || task.impact || task.recurring !== 'none') && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                            {task.priority_lvl && (
                              <span
                                className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border ${
                                  task.priority_lvl === 'critical'
                                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                    : task.priority_lvl === 'warning'
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                }`}
                              >
                                {task.priority_str}
                              </span>
                            )}

                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border ${
                                task.impact === 'High'
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                  : task.impact === 'Low'
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-neutral-200 dark:border-neutral-700'
                                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                              }`}
                              title={`Impact: ${task.impact}`}
                            >
                              {task.impact === 'High' ? 'High Impact' : task.impact === 'Low' ? 'Low Impact' : 'Med Impact'}
                            </span>

                            <span
                              className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 flex items-center gap-1"
                              title="Estimated Time Consumption"
                            >
                              <svg className="w-3 h-3 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {task.etc || 2}h
                            </span>

                            {((task.recurring && task.recurring !== 'none') || isNewClone) && (
                              <span
                                className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                                  isNewClone
                                    ? 'bg-[#FACC15] text-[#111E38] border-amber-400 animate-pulse'
                                    : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                                }`}
                                title={isNewClone ? 'Newly Cloned Task' : 'Recurring Task'}
                              >
                                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                                {isNewClone ? 'NEW CLONE' : task.recurring}
                              </span>
                            )}
                          </div>
                        )}
                    </div>

                    {/* Task Description */}
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-3 line-clamp-2 wrap-break-word font-medium leading-relaxed">
                      {task.description
                        ? String(task.description)
                            .replace(/<[^>]+>/g, '')
                            .replace(/[*_~`]/g, '')
                        : 'No description provided.'}
                    </div>

                    {/* Shared By Badge */}
                    {task.owner_username !== currentUser && (
                      <div className="mb-3 text-[9px] font-bold text-white bg-[#111E38] dark:bg-white dark:text-[#111E38] px-2.5 py-1 rounded-full w-max shadow-xs flex items-center gap-1">
                        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a5.97 5.97 0 00-.942 3.197m0 0A9.093 9.093 0 012.25 18.24a3 3 0 014.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584" />
                        </svg>
                        Shared by {task.owner_username}
                      </div>
                    )}

                    {/* Card Footer: Assignee & Indicators */}
                    <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 text-[10px] font-bold text-neutral-500 dark:text-neutral-400 min-w-0">
                      <div className="flex justify-between items-center gap-2 min-w-0">
                        <span
                          className="flex items-center gap-1.5 truncate text-[#111E38] dark:text-white min-w-0"
                          title={task.requester.includes('@') ? 'Assigned To' : 'Requester'}
                        >
                          <Avatar
                            name={task.requester}
                            url={avatarsMap[task.requester.replace('@', '').trim()]}
                            size="w-6 h-6"
                            textClass="text-[10px]"
                          />
                          <span className="truncate font-bold text-xs">{task.requester}</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          {(() => {
                            const unreadComments = (notifications || []).filter(
                              (n) =>
                                !n.is_read &&
                                n.related_task_id === task.id &&
                                (n.type === 'comment' || n.type === 'mention' || n.type === 'mention_no_email')
                            ).length;
                            if (unreadComments > 0) {
                              return (
                                <span
                                  className="flex items-center gap-1 text-[#111E38] bg-[#FACC15] px-2 py-0.5 rounded-md shadow-xs text-[9px] font-black animate-pulse"
                                  title={`${unreadComments} unread messages`}
                                >
                                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                  </svg>
                                  {unreadComments} New
                                </span>
                              );
                            }
                            return null;
                          })()}

                          {task.subtask_total > 0 && (
                            <span
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[10px] font-bold ${
                                task.subtask_done === task.subtask_total ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-neutral-600 dark:text-neutral-300'
                              }`}
                              title="Sub-tasks progress"
                            >
                              <svg className="w-3 h-3 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {task.subtask_done}/{task.subtask_total}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Subtask Mini Progress Bar */}
                      {task.subtask_total > 0 && (
                        <div className="w-full bg-neutral-100 dark:bg-neutral-800/80 h-1.5 rounded-full overflow-hidden mt-1 border border-neutral-200/50 dark:border-neutral-700/50">
                          <div
                            className={`h-full transition-all duration-300 ${
                              task.subtask_done === task.subtask_total ? 'bg-emerald-500' : 'bg-[#FACC15]'
                            }`}
                            style={{ width: `${Math.round((task.subtask_done / task.subtask_total) * 100)}%` }}
                          />
                        </div>
                      )}

                      {/* Deadline info */}
                      <div className="flex justify-end items-center gap-1.5 pt-1 text-[10px]">
                        <span
                          title={task.status === 'Done' ? 'Completed At' : 'Deadline'}
                          className={`flex items-center gap-1 font-semibold ${
                            task.status === 'Done' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-neutral-500 dark:text-neutral-400'
                          }`}
                        >
                          {task.status === 'Done' ? (
                            <>
                              <svg className="w-3 h-3 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              {formatDateMMM(task.completed_time)}
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatDateMMM(task.deadline)}
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              };

              return (
                <Draggable
                  key={colName}
                  draggableId={`col-${colName}`}
                  index={index}
                  isDragDisabled={(groupBy !== 'Status' && groupBy !== 'Category') || accountStatus === 'suspended'}
                >
                  {(providedCol, snapshotCol) => (
                    <div
                      ref={providedCol.innerRef}
                      {...providedCol.draggableProps}
                      className={`group/col bg-[#FAFAFA] dark:bg-[#121B2D] rounded-2xl w-[85vw] sm:w-88 shrink-0 border border-neutral-200/90 dark:border-neutral-800 transition-all flex flex-col h-fit sm:h-full min-h-100 max-h-none sm:max-h-full ${
                        snapshotCol.isDragging ? 'shadow-2xl -rotate-1 bg-white dark:bg-[#121B2D] z-50 ring-2 ring-[#FACC15]' : 'shadow-xs'
                      }`}
                      style={providedCol.draggableProps.style}
                    >
                      {/* Column Header */}
                      <h2
                        {...(groupBy === 'Status' || groupBy === 'Category' ? providedCol.dragHandleProps : {})}
                        className={`board-col-header font-bold text-xs text-[#111E38] dark:text-white flex justify-between items-center uppercase tracking-wider border-b border-neutral-200/70 dark:border-neutral-800 pb-3 pt-3 sm:pt-4 px-4 shrink-0 rounded-t-2xl ${
                          groupBy === 'Status' || groupBy === 'Category' ? 'cursor-grab active:cursor-grabbing' : ''
                        }`}
                      >
                        <div
                          className="flex items-center gap-2.5 flex-1 truncate"
                          onDoubleClick={() =>
                            (groupBy === 'Status' || groupBy === 'Category') && handleOpenRenameBoard(groupBy, colName)
                          }
                        >
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getColumnDotColor(colName)}`}></span>
                          <span className="font-extrabold truncate text-sm">
                            {colName === 'Pending' ? 'To do' : colName}
                          </span>
                          <span className="bg-[#111E38] text-white dark:bg-white dark:text-[#111E38] px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 shadow-xs">
                            {columnTasks.length}
                          </span>
                        </div>

                        {(groupBy === 'Status' || groupBy === 'Category') &&
                          !(groupBy === 'Status' && DEFAULT_COLUMNS.includes(colName)) &&
                          accountStatus !== 'suspended' && (
                            <div className="flex items-center gap-1.5 opacity-0 group-hover/col:opacity-100 transition-opacity shrink-0">
                              <button
                                onClick={() => handleOpenRenameBoard(groupBy, colName)}
                                className="p-1 rounded-md text-neutral-400 hover:text-[#111E38] dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
                                title={`Rename ${groupBy}`}
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleOpenDeleteBoard(groupBy, colName)}
                                className="p-1 rounded-md text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                                title={`Remove ${groupBy}`}
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}
                      </h2>

                      {/* Column Droppable Container */}
                      <Droppable
                        droppableId={colName}
                        key={colName}
                        type="task"
                        ignoreContainerClipping={true}
                        renderClone={(provided, snapshot, rubric) => {
                          const task = visibleTasks[rubric.source.index];
                          if (!task) return <div {...provided.draggableProps} ref={provided.innerRef}></div>;
                          return renderTaskCardContent(task, provided, snapshot, true);
                        }}
                      >
                        {(providedTask, snapshotTask) => (
                          <div className="flex flex-col flex-1 min-h-0 h-fit sm:h-full">
                            <div
                              ref={providedTask.innerRef}
                              {...providedTask.droppableProps}
                              className={`kanban-column-scroll flex flex-col flex-1 overflow-y-visible ${
                                isKanbanDragging ? 'sm:overflow-y-visible' : 'sm:overflow-y-auto'
                              } custom-scrollbar px-3.5 sm:px-4 pt-4 pb-3 sm:pb-4 transition-colors rounded-b-2xl h-fit sm:h-full min-h-37.5 ${
                                snapshotTask.isDraggingOver
                                  ? 'bg-amber-400/10 dark:bg-amber-400/5 ring-2 ring-[#FACC15]/40'
                                  : ''
                              }`}
                            >
                              {visibleTasks.length === 0 && !snapshotTask.isDraggingOver && (
                                <div className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-neutral-200/80 dark:border-neutral-800 rounded-xl my-auto select-none">
                                  <div className="w-8 h-8 rounded-full bg-neutral-200/50 dark:bg-neutral-800/50 flex items-center justify-center text-neutral-400 mb-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                  <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500">
                                    {tMsg('Belum ada tugas di tahap ini', 'No tasks in this stage')}
                                  </span>
                                </div>
                              )}

                              {visibleTasks.length === 0 && snapshotTask.isDraggingOver && (
                                <div className="flex flex-col items-center justify-center py-8 px-4 text-center border-2 border-dashed border-[#FACC15] bg-[#FACC15]/10 rounded-xl my-auto select-none">
                                  <span className="text-xs font-black text-[#111E38] dark:text-[#FACC15]">
                                    {tMsg('Lepaskan tugas di sini', 'Drop task here')}
                                  </span>
                                </div>
                              )}

                              {visibleTasks.map((task, taskIndex) => {
                                return (
                                  <Draggable
                                    key={task.id.toString()}
                                    draggableId={task.id.toString()}
                                    index={taskIndex}
                                    isDragDisabled={accountStatus === 'suspended'}
                                  >
                                    {(provided, snapshot) => renderTaskCardContent(task, provided, snapshot, false)}
                                  </Draggable>
                                );
                              })}
                              {providedTask.placeholder}
                            </div>
                            {isArchiveCol && columnTasks.length > limit && (
                              <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-2 shrink-0 border-t border-neutral-200/70 dark:border-neutral-800">
                                <button
                                  onClick={() => toggleArchive(colName)}
                                  className="w-full py-2.5 bg-neutral-200/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-[10px] font-extrabold uppercase tracking-widest rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors shadow-xs shrink-0 cursor-pointer"
                                >
                                  {isExpanded ? '⬆ Hide Archived Tasks' : `📂 View ${archivedCount} Archived Tasks`}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {providedBoard.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add Column Button */}
      {(groupBy === 'Status' || groupBy === 'Category') && accountStatus !== 'suspended' && (
        <div
          onClick={() => handleOpenAddBoard(groupBy)}
          className="bg-white/40 dark:bg-[#121B2D]/40 border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-[#FACC15] hover:bg-[#FACC15]/10 text-neutral-500 hover:text-[#111E38] dark:hover:text-white rounded-2xl w-80 h-14 shrink-0 flex items-center justify-center cursor-pointer transition-all uppercase tracking-widest text-xs font-black shadow-xs active:scale-98"
        >
          <IconPlus className="w-4 h-4 mr-2" />
          <span className="font-extrabold">Add {groupBy}</span>
        </div>
      )}
    </div>
  );
}
