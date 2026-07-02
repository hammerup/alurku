import React, { useState, useEffect } from 'react';
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

  return (
    <div className="flex-1 flex gap-4 sm:gap-6 items-stretch pb-2 w-max min-w-full min-h-0">
      <Droppable droppableId="board" direction="horizontal" type="column">
        {(providedBoard) => (
          <div
            className="flex gap-4 sm:gap-6 items-stretch h-auto sm:h-full min-h-full"
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
                    className={`task-card p-3.5 rounded-xl border mb-2.5 w-full max-w-full min-w-0 box-border ${
                      hasUnreadNotif || isNewClone
                        ? 'bg-white dark:bg-neutral-950 border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all duration-300'
                        : 'bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 transition-all duration-300'
                    } ${
                      isOriginalBeingDragged
                        ? 'opacity-0! shadow-none! border-transparent! bg-transparent!'
                        : snapshot.isDragging && isTrashHovered
                        ? 'cursor-grabbing z-99999 opacity-0! bg-transparent! border-transparent! shadow-none!'
                        : snapshot.isDragging
                        ? 'shadow-2xl cursor-grabbing z-99999 border-indigo-500 dark:border-indigo-400 ring-4 ring-indigo-500/30'
                        : 'shadow-sm cursor-grab active:cursor-grabbing hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-shadow duration-200'
                    } ${task.status === 'Done' || task.status === 'Rejected' ? 'opacity-50 hover:opacity-100' : ''} ${
                      isClone ? 'rotate-3 scale-105' : ''
                    }`}
                    onClick={() => setSelectedTask(task)}
                    style={{
                      ...provided.draggableProps.style,
                      margin: isClone ? 0 : provided.draggableProps.style?.margin,
                      transform:
                        snapshot.isDragging && !isTrashHovered && !isOriginalBeingDragged
                          ? `${provided.draggableProps.style?.transform || ''} scale(1.05) rotate(3deg)`
                          : provided.draggableProps.style?.transform,
                      ...(cardTheme &&
                      task.status !== 'Done' &&
                      task.status !== 'Rejected' &&
                      !(snapshot.isDragging && isTrashHovered) &&
                      !isOriginalBeingDragged
                        ? {
                            background:
                              cardTheme === 'sunset'
                                ? 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
                                : cardTheme,
                          }
                        : {}),
                    }}
                  >
                    <div className="flex justify-between items-center mb-2.5 pb-1">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {task.board_name && task.board_name !== 'Unknown' && (
                          <>
                            <span
                              className="text-[9px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-2 py-1 rounded-md cursor-pointer flex items-center gap-1 truncate max-w-25 transition-colors border border-indigo-100 dark:border-indigo-800/50"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (boards && setSelectedBoard) {
                                  const targetBoard = boards.find((b) => b.id === task.board_id);
                                  if (targetBoard) setSelectedBoard(targetBoard);
                                }
                              }}
                              title={`Go to Project: ${task.board_name}`}
                            >
                              <svg className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                              {task.board_name}
                            </span>
                            <span className="text-neutral-300 dark:text-neutral-700 font-bold text-[10px]">/</span>
                          </>
                        )}
                        <span
                          className="text-[9px] font-bold text-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 px-2 py-1 rounded-md truncate max-w-20 border border-neutral-200 dark:border-neutral-700"
                          title={task.category}
                        >
                          {task.category || 'Task'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className="text-[9px] font-bold text-neutral-400 shrink-0 flex items-center gap-1"
                          title="Date Created"
                        >
                          <svg className="w-3 h-3 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {formatDateMMM(task.timestamp)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="font-bold text-sm text-slate-800 dark:text-white wrap-break-word leading-snug">
                        {(() => {
                          const isGlobal = !selectedBoard || selectedBoard.id === 'global';
                          const queuePos = isGlobal ? task.queue_global_number : task.queue_project_number;
                          const totalQueue = isGlobal ? task.total_global_queue : task.total_project_queue;
                          const queueLabel = isGlobal
                            ? tMsg('Overall Queue', 'Antrean Total')
                            : tMsg('Queue', 'Antrean');
                          const queueType = isGlobal ? 'overall' : tMsg('project', 'proyek');

                          if (queuePos && totalQueue && task.status !== 'Done' && task.status !== 'Rejected') {
                            return (
                              <span
                                className="inline-block text-[9px] font-black bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/50 cursor-help mr-1.5 align-middle select-none"
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
                      {task.status !== 'Done' &&
                        task.status !== 'Rejected' &&
                        (task.priority_lvl || task.impact || task.recurring !== 'none') && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                            {task.priority_lvl && (
                              <span
                                className={`text-[9px] font-bold px-2 py-1 rounded-md shadow-sm ${
                                  task.priority_lvl === 'critical'
                                    ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                    : task.priority_lvl === 'warning'
                                    ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                    : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                }`}
                              >
                                {task.priority_str}
                              </span>
                            )}
                            <span
                              className={`text-[9px] font-bold px-2 py-1 rounded-md shadow-sm ${
                                task.impact === 'High'
                                  ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                  : task.impact === 'Low'
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                  : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                              }`}
                              title={`Impact: ${task.impact}`}
                            >
                              {task.impact === 'High' ? 'High' : task.impact === 'Low' ? 'Low' : 'Med'}
                            </span>
                            <span
                              className="text-[9px] font-bold px-2 py-1 rounded-md shadow-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 cursor-help flex items-center gap-1"
                              title="Estimated Time Consumption"
                            >
                              <svg className="w-3 h-3 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {task.etc || 2}h
                            </span>
                            {((task.recurring && task.recurring !== 'none') || isNewClone) && (
                              <span
                                className={`text-[9px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1 ${
                                  isNewClone
                                    ? 'bg-indigo-500 dark:bg-indigo-600 text-white animate-pulse shadow-indigo-500/50'
                                    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                }`}
                                title={isNewClone ? 'Newly Cloned Task' : 'Recurring Task'}
                              >
                                <svg className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" /></svg>
                                {isNewClone ? 'NEW CLONE' : task.recurring}
                              </span>
                            )}
                          </div>
                        )}
                    </div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-3 line-clamp-2 wrap-break-word font-medium leading-relaxed">
                      {task.description
                        ? String(task.description)
                            .replace(/<[^>]+>/g, '')
                            .replace(/[*_~`]/g, '')
                        : 'No description provided.'}
                    </div>
                    {task.owner_username !== currentUser && (
                      <div className="mb-3 text-[9px] font-bold text-white bg-black dark:bg-white dark:text-black px-2 py-1 rounded-full w-max shadow-sm flex items-center gap-1">
                        <svg className="w-3 h-3 text-white dark:text-black shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        Shared by {task.owner_username}
                      </div>
                    )}
                    <div className="flex flex-col gap-2 mt-2.5 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/50 text-[9px] font-bold text-neutral-500 dark:text-neutral-400 min-w-0">
                      <div className="flex justify-between items-center gap-2 min-w-0">
                        <span
                          className="flex items-center gap-1.5 truncate text-black dark:text-white min-w-0"
                          title={task.requester.includes('@') ? 'Assigned To' : 'Requester'}
                        >
                          {task.requester.includes('@') ? (
                            <svg className="w-3.5 h-3.5 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                          ) : (
                            <IconPerson className="w-4 h-4 shrink-0" />
                          )}
                          <Avatar
                            name={task.requester}
                            url={avatarsMap[task.requester.replace('@', '').trim()]}
                            size="w-6 h-6"
                            textClass="text-[10px]"
                          />{' '}
                          <span className="truncate">{task.requester}</span>
                        </span>
                        <div className="flex items-center gap-2">
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
                                  className="flex items-center gap-1.5 text-white bg-red-500 px-2 py-0.5 rounded-md shadow-sm text-[9px] font-black animate-pulse"
                                  title={`${unreadComments} unread messages`}
                                >
                                  <svg className="w-3.5 h-3.5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                  {unreadComments} New
                                </span>
                              );
                            }
                            return null;
                          })()}
                          {task.subtask_total > 0 && (
                            <span
                              className={`flex items-center gap-1 whitespace-nowrap ${
                                task.subtask_done === task.subtask_total ? 'text-black dark:text-white' : ''
                              }`}
                              title="Sub-tasks"
                            >
                              <svg className="w-3 h-3 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                              {task.subtask_done}/{task.subtask_total}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center flex-wrap gap-1.5">
                        <span title="Created At" className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {formatDateMMM(task.timestamp)}
                        </span>
                        <span
                          title={task.status === 'Done' ? 'Completed At' : 'Deadline'}
                          className={`flex items-center gap-1 ${task.status === 'Done' ? 'text-black dark:text-white' : ''}`}
                        >
                          {task.status === 'Done' ? (
                            <>
                              <svg className="w-3 h-3 text-emerald-500 shrink-0 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {formatDateMMM(task.completed_time)}
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 text-neutral-500 shrink-0 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
                      className={`group/col bg-neutral-100/50 dark:bg-neutral-900/50 rounded-2xl w-[85vw] sm:w-85 shrink-0 border border-neutral-200 dark:border-neutral-800 transition-all flex flex-col h-fit sm:h-full min-h-100 max-h-none sm:max-h-full ${
                        snapshotCol.isDragging ? 'shadow-2xl -rotate-2 bg-white dark:bg-neutral-800 z-50' : 'shadow-sm'
                      }`}
                      style={providedCol.draggableProps.style}
                    >
                      <h2
                        {...(groupBy === 'Status' || groupBy === 'Category' ? providedCol.dragHandleProps : {})}
                        className={`board-col-header font-bold text-sm text-black dark:text-white flex justify-between items-center uppercase tracking-widest border-b border-neutral-200 dark:border-neutral-800 pb-3 pt-3 sm:pt-4 px-3 sm:px-4 shrink-0 rounded-t-2xl ${
                          groupBy === 'Status' || groupBy === 'Category' ? 'cursor-grab active:cursor-grabbing' : ''
                        }`}
                      >
                        <div
                          className="flex items-center gap-2 flex-1 truncate"
                          onDoubleClick={() =>
                            (groupBy === 'Status' || groupBy === 'Category') && handleOpenRenameBoard(groupBy, colName)
                          }
                        >
                          {colName === 'Pending' ? 'To do' : colName}
                          <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 rounded-full text-[9px] shrink-0 shadow-sm">
                            {columnTasks.length}
                          </span>
                        </div>
                        {(groupBy === 'Status' || groupBy === 'Category') &&
                          !(groupBy === 'Status' && DEFAULT_COLUMNS.includes(colName)) &&
                          accountStatus !== 'suspended' && (
                            <div className="flex items-center gap-2 opacity-0 group-hover/col:opacity-100 transition-opacity shrink-0">
                              <button
                                onClick={() => handleOpenRenameBoard(groupBy, colName)}
                                className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                                title={`Rename ${groupBy}`}
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleOpenDeleteBoard(groupBy, colName)}
                                className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors font-bold text-lg"
                                title={`Remove ${groupBy}`}
                              >
                                ✖
                              </button>
                            </div>
                          )}
                      </h2>

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
                              } custom-scrollbar px-3 sm:px-4 pt-4 pb-3 sm:pb-4 transition-colors rounded-b-2xl h-fit sm:h-full min-h-37.5 ${
                                snapshotTask.isDraggingOver
                                  ? 'bg-neutral-200/50 dark:bg-neutral-800/50 ring-2 ring-indigo-500/20'
                                  : ''
                              }`}
                            >
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
                              <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 shrink-0 border-t border-neutral-200 dark:border-neutral-800">
                                <button
                                  onClick={() => toggleArchive(colName)}
                                  className="w-full py-3 bg-neutral-200/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors shadow-sm shrink-0"
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

      {(groupBy === 'Status' || groupBy === 'Category') && accountStatus !== 'suspended' && (
        <div
          onClick={() => handleOpenAddBoard(groupBy)}
          className="bg-transparent border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl w-80 h-14 shrink-0 flex items-center justify-center text-neutral-500 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white cursor-pointer transition-all uppercase tracking-widest text-xs font-bold"
        >
          <IconPlus className="w-5 h-5 mr-2" />
          <span className="font-bold">Add {groupBy}</span>
        </div>
      )}
    </div>
  );
}
