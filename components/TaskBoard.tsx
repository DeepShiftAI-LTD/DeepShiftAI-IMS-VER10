

import React, { useState } from 'react';
import { Task, TaskStatus, FeedbackType, Goal, User } from '../types';
import { Card, PriorityBadge, FeedbackBadge } from './UI';
import { Clock, CheckCircle2, Circle, Link as LinkIcon, UploadCloud, ExternalLink, MessageSquarePlus, AlertCircle, Target, Calendar as CalendarIcon, Layout, ChevronLeft, ChevronRight, MessageSquare, Send } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  goals?: Goal[];
  currentUser?: User;
  allUsers?: User[];
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  readOnly?: boolean;
  onSubmitDeliverable?: (task: Task) => void;
  onGiveFeedback?: (task: Task) => void;
  onAddComment?: (taskId: string, content: string) => void;
}

interface TaskItemProps {
  task: Task;
  columnStatus: TaskStatus;
  goals?: Goal[];
  currentUser?: User;
  allUsers?: User[];
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  readOnly?: boolean;
  onSubmitDeliverable?: (task: Task) => void;
  onGiveFeedback?: (task: Task) => void;
  onAddComment?: (taskId: string, content: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  columnStatus, 
  goals,
  currentUser,
  allUsers,
  onStatusChange, 
  readOnly, 
  onSubmitDeliverable, 
  onGiveFeedback,
  onAddComment
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleStatusAction = (newStatus: TaskStatus) => {
    if (onStatusChange) {
      if (newStatus === TaskStatus.COMPLETED && columnStatus !== TaskStatus.COMPLETED) {
        setIsExiting(true);
        setTimeout(() => {
          onStatusChange(task.id, newStatus);
        }, 400); 
      } else {
        onStatusChange(task.id, newStatus);
      }
    }
  };

  const handleSendComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (newComment.trim() && onAddComment) {
          onAddComment(task.id, newComment);
          setNewComment('');
      }
  };

  const getUserName = (userId: string) => {
      return allUsers?.find(u => u.id === userId)?.name || 'Unknown User';
  };
  
  const getUserAvatar = (userId: string) => {
      return allUsers?.find(u => u.id === userId)?.avatar;
  };

  const needsFeedback = onGiveFeedback && columnStatus === TaskStatus.COMPLETED && !task.feedback;
  const linkedGoal = goals?.find(g => g.id === task.linkedGoalId);
  const commentCount = task.comments?.length || 0;

  return (
    <Card 
      className={`p-4 hover:shadow-md border-l-4 hover:border-l-indigo-500 flex flex-col gap-2 transform transition-all duration-500 ease-in-out ${
        isExiting ? 'opacity-0 scale-90 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
      } ${needsFeedback ? 'border-l-indigo-400 ring-2 ring-indigo-50 border-t border-r border-b border-indigo-100' : 'border-l-transparent'}`}
    >
      <div className="flex justify-between items-start">
        <PriorityBadge priority={task.priority} />
        <span className="text-xs text-slate-400">{new Date(task.dueDate).toLocaleDateString()}</span>
      </div>

      {needsFeedback && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full w-fit animate-pulse">
              <AlertCircle size={10} /> Feedback Due
          </div>
      )}
      
      <h4 className="font-medium text-slate-900">{task.title}</h4>

      {linkedGoal && (
           <div className="flex items-center gap-1.5 text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit border border-blue-100" title={`Linked to: ${linkedGoal.description}`}>
               <Target size={10} className="flex-shrink-0" />
               <span className="truncate max-w-[180px] font-medium">{linkedGoal.description}</span>
           </div>
       )}

      <p className="text-sm text-slate-500 line-clamp-2">{task.description}</p>
      
      {/* Feedback Section */}
      {task.feedback && (
          <div className="mt-2 pt-2 border-t border-slate-50">
              <div className="mb-1">
                  <FeedbackBadge type={task.feedback.type} />
              </div>
              <p className="text-xs text-slate-600 italic break-words">"{task.feedback.comment}"</p>
          </div>
      )}

      {/* Give Feedback Trigger */}
      {needsFeedback && (
          <button 
              onClick={() => onGiveFeedback!(task)}
              className="mt-2 w-full py-2 bg-indigo-600 text-white rounded-md text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1 shadow-sm shadow-indigo-200"
          >
              <MessageSquarePlus size={14} /> Give Feedback
          </button>
      )}

      {/* Deliverable Section */}
      {task.deliverable ? (
          <div className="mt-3 bg-emerald-50/80 border border-emerald-200 rounded-lg p-3 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1 bg-emerald-100 rounded-full text-emerald-600">
                    <CheckCircle2 size={12} />
                  </div>
                  <span className="text-xs font-bold text-emerald-800">Submission Received</span>
                  <span className="ml-auto text-[10px] text-emerald-600 opacity-80">
                      {new Date(task.deliverable.submittedAt).toLocaleDateString()}
                  </span>
              </div>
              
              {task.deliverable.notes && (
                  <p className="text-xs text-slate-600 italic pl-7 mb-2 line-clamp-2">
                      "{task.deliverable.notes}"
                  </p>
              )}

              {task.deliverable.url && (
                  <div className="pl-7">
                      <a 
                        href={task.deliverable.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-white border border-indigo-100 px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                      >
                          <LinkIcon size={10}/> View Attached Work
                      </a>
                  </div>
              )}
          </div>
      ) : (
          !readOnly && onSubmitDeliverable && (columnStatus === TaskStatus.IN_PROGRESS || columnStatus === TaskStatus.COMPLETED || columnStatus === TaskStatus.OVERDUE) && (
              <button 
                  onClick={() => onSubmitDeliverable(task)}
                  className="mt-2 w-full py-2 bg-white border border-indigo-200 text-indigo-600 rounded-md text-xs font-bold hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                  <UploadCloud size={14} /> Submit Deliverable
              </button>
          )
      )}

      {/* Action Buttons & Comments Toggle */}
      {!readOnly && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
           <div className="flex gap-1">
                {onStatusChange && columnStatus !== TaskStatus.TODO && (
                    <button 
                        onClick={() => handleStatusAction(TaskStatus.TODO)}
                        className="text-xs px-2 py-1 rounded hover:bg-slate-100 text-slate-500">
                        To Do
                    </button>
                )}
                {onStatusChange && columnStatus !== TaskStatus.IN_PROGRESS && (
                    <button 
                        onClick={() => handleStatusAction(TaskStatus.IN_PROGRESS)}
                        className="text-xs px-2 py-1 rounded hover:bg-amber-50 text-amber-600 font-medium">
                        In Progress
                    </button>
                )}
                {onStatusChange && columnStatus !== TaskStatus.COMPLETED && (
                    <button 
                        onClick={() => handleStatusAction(TaskStatus.COMPLETED)}
                        className="text-xs px-2 py-1 rounded hover:bg-emerald-50 text-emerald-600 font-medium">
                        Done
                    </button>
                )}
           </div>
           
           {onAddComment && (
               <button 
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded transition-colors ${commentCount > 0 ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                    title="Comments"
               >
                   <MessageSquare size={14} />
                   {commentCount > 0 && <span>{commentCount}</span>}
               </button>
           )}
        </div>
      )}

      {/* Comments Section */}
      {showComments && onAddComment && (
          <div className="mt-2 border-t border-slate-100 pt-2 animate-in slide-in-from-top-2 fade-in">
              <div className="max-h-48 overflow-y-auto space-y-2 mb-2 custom-scrollbar">
                  {task.comments && task.comments.length > 0 ? (
                      task.comments.map(comment => {
                          const isMe = currentUser?.id === comment.authorId;
                          return (
                              <div key={comment.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                                  <div className="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                                       <img src={getUserAvatar(comment.authorId) || `https://ui-avatars.com/api/?name=User`} alt="" className="w-full h-full object-cover"/>
                                  </div>
                                  <div className={`flex flex-col max-w-[85%] ${isMe ? 'items-end' : 'items-start'}`}>
                                      <div className={`p-2 rounded-lg text-xs ${isMe ? 'bg-indigo-50 text-indigo-900 rounded-tr-none' : 'bg-slate-50 text-slate-700 rounded-tl-none'}`}>
                                          {comment.content}
                                      </div>
                                      <span className="text-[9px] text-slate-400 mt-0.5">
                                          {isMe ? 'You' : getUserName(comment.authorId)} • {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </span>
                                  </div>
                              </div>
                          );
                      })
                  ) : (
                      <p className="text-center text-xs text-slate-400 py-2">No comments yet. Start a discussion.</p>
                  )}
              </div>
              <form onSubmit={handleSendComment} className="flex gap-2">
                  <input 
                      type="text" 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..." 
                      className="flex-1 text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-indigo-400"
                  />
                  <button type="submit" disabled={!newComment.trim()} className="text-indigo-600 disabled:text-slate-300 p-1 hover:bg-indigo-50 rounded">
                      <Send size={14} />
                  </button>
              </form>
          </div>
      )}
    </Card>
  );
};

const TaskColumn: React.FC<{ 
  title: string; 
  status: TaskStatus; 
  tasks: Task[]; 
  goals?: Goal[];
  currentUser?: User;
  allUsers?: User[];
  icon: React.ReactNode;
  colorClass: string;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  readOnly?: boolean;
  onSubmitDeliverable?: (task: Task) => void;
  onGiveFeedback?: (task: Task) => void;
  onAddComment?: (taskId: string, content: string) => void;
}> = ({ title, status, tasks, goals, currentUser, allUsers, icon, colorClass, onStatusChange, readOnly, onSubmitDeliverable, onGiveFeedback, onAddComment }) => {
  return (
    <div className="flex-1 min-w-[280px] flex flex-col gap-3">
      <div className={`flex items-center gap-2 pb-2 border-b-2 ${colorClass} mb-2`}>
        {icon}
        <h3 className="font-semibold text-slate-700">{title}</h3>
        <span className="ml-auto bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      
      <div className="flex flex-col gap-3">
        {tasks.map(task => (
          <TaskItem 
            key={task.id}
            task={task}
            goals={goals}
            currentUser={currentUser}
            allUsers={allUsers}
            columnStatus={status}
            onStatusChange={onStatusChange}
            readOnly={readOnly}
            onSubmitDeliverable={onSubmitDeliverable}
            onGiveFeedback={onGiveFeedback}
            onAddComment={onAddComment}
          />
        ))}
        {tasks.length === 0 && (
            <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-sm">
                No tasks
            </div>
        )}
      </div>
    </div>
  );
};

const CalendarView: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 Sunday

  const handlePrev = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNext = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = [];
  // padding
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`pad-${i}`} className="bg-slate-50/50 border border-slate-100 min-h-[120px]" />);
  }
  
  // days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTasks = tasks.filter(t => t.dueDate && t.dueDate.startsWith(dateStr));
    
    days.push(
      <div key={day} className="bg-white border border-slate-100 min-h-[120px] p-2 hover:bg-slate-50 transition-colors flex flex-col gap-1">
        <div className="flex justify-between items-start mb-1">
            <span className={`text-xs font-bold ${new Date().toISOString().split('T')[0] === dateStr ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-700'}`}>{day}</span>
            {dayTasks.length > 0 && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded-full font-medium">{dayTasks.length}</span>}
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 max-h-[100px]">
            {dayTasks.map(task => (
                <div key={task.id} className={`text-[10px] p-1.5 rounded border truncate cursor-help ${
                    task.status === TaskStatus.COMPLETED ? 'bg-emerald-50 text-emerald-700 border-emerald-100 line-through opacity-70' :
                    task.status === TaskStatus.IN_PROGRESS ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    task.status === TaskStatus.OVERDUE ? 'bg-rose-50 text-rose-700 border-rose-100' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                }`} title={`${task.title} - ${task.status}`}>
                    {task.title}
                </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h3 className="font-bold text-lg text-slate-800">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-1">
                <button onClick={handlePrev} className="p-1 hover:bg-slate-100 rounded text-slate-600"><ChevronLeft size={20}/></button>
                <button onClick={handleNext} className="p-1 hover:bg-slate-100 rounded text-slate-600"><ChevronRight size={20}/></button>
            </div>
        </div>
        {/* Grid Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">{d}</div>
            ))}
        </div>
        {/* Grid Body */}
        <div className="grid grid-cols-7">
            {days}
        </div>
    </div>
  );
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ 
    tasks, 
    goals, 
    currentUser,
    allUsers,
    onStatusChange, 
    readOnly = false, 
    onSubmitDeliverable, 
    onGiveFeedback, 
    onAddComment 
}) => {
  const [viewMode, setViewMode] = useState<'BOARD' | 'CALENDAR'>('BOARD');
  
  const todoTasks = tasks.filter(t => t.status === TaskStatus.TODO);
  const progressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS);
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);

  return (
    <div className="space-y-4">
        {/* View Switcher */}
        <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-700 hidden md:block">
                {viewMode === 'BOARD' ? 'Kanban Board' : 'Deadlines Calendar'}
            </h3>
            <div className="bg-slate-100 p-1 rounded-lg flex gap-1 ml-auto">
                <button 
                    onClick={() => setViewMode('BOARD')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'BOARD' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Layout size={14} /> Board
                </button>
                <button 
                        onClick={() => setViewMode('CALENDAR')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'CALENDAR' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <CalendarIcon size={14} /> Calendar
                </button>
            </div>
        </div>

        {viewMode === 'BOARD' ? (
            <div className="flex overflow-x-auto gap-6 pb-4 animate-in fade-in slide-in-from-left-2">
            <TaskColumn 
                title="To Do" 
                status={TaskStatus.TODO} 
                tasks={todoTasks} 
                goals={goals}
                currentUser={currentUser}
                allUsers={allUsers}
                icon={<Circle size={18} className="text-slate-400" />}
                colorClass="border-slate-300"
                onStatusChange={onStatusChange}
                readOnly={readOnly}
                onSubmitDeliverable={onSubmitDeliverable}
                onGiveFeedback={onGiveFeedback}
                onAddComment={onAddComment}
            />
            <TaskColumn 
                title="In Progress" 
                status={TaskStatus.IN_PROGRESS} 
                tasks={progressTasks} 
                goals={goals}
                currentUser={currentUser}
                allUsers={allUsers}
                icon={<Clock size={18} className="text-amber-500" />}
                colorClass="border-amber-400"
                onStatusChange={onStatusChange}
                readOnly={readOnly}
                onSubmitDeliverable={onSubmitDeliverable}
                onGiveFeedback={onGiveFeedback}
                onAddComment={onAddComment}
            />
            <TaskColumn 
                title="Completed" 
                status={TaskStatus.COMPLETED} 
                tasks={completedTasks} 
                goals={goals}
                currentUser={currentUser}
                allUsers={allUsers}
                icon={<CheckCircle2 size={18} className="text-emerald-500" />}
                colorClass="border-emerald-400"
                onStatusChange={onStatusChange}
                readOnly={readOnly}
                onSubmitDeliverable={onSubmitDeliverable}
                onGiveFeedback={onGiveFeedback}
                onAddComment={onAddComment}
            />
            </div>
        ) : (
            <CalendarView tasks={tasks} />
        )}
    </div>
  );
};