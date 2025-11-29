

import React, { useState } from 'react';
import { User, LogEntry, Task, Report, Goal, Resource, Evaluation, Message, Meeting, Skill, SkillAssessment, Badge, UserBadge, LeaveRequest, SiteVisit, TaskStatus, Role } from '../types';
import { Card, Button } from './UI';
import { TaskBoard } from './TaskBoard';
import { AttendanceCalendar } from './AttendanceCalendar';
import { SkillTracker } from './SkillTracker';
import { Gamification } from './Gamification';
import { LayoutDashboard, CheckSquare, Clock, Target, BookOpen, Download, FileText } from 'lucide-react';

interface StudentPortalProps {
  user: User;
  users: User[];
  logs: LogEntry[];
  tasks: Task[];
  reports: Report[];
  goals: Goal[];
  resources: Resource[];
  evaluations: Evaluation[];
  messages: Message[];
  meetings: Meeting[];
  skills: Skill[];
  skillAssessments: SkillAssessment[];
  badges: Badge[];
  userBadges: UserBadge[];
  leaveRequests: LeaveRequest[];
  siteVisits: SiteVisit[];
  onAddLog: (log: Omit<LogEntry, 'id' | 'status'>) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onAddReport: (report: Omit<Report, 'id' | 'submittedAt'>) => void;
  onUpdateGoal: (goal: Goal) => void;
  onSubmitDeliverable: (taskId: string, deliverable: any) => void;
  onSendMessage: (msg: any) => void;
  onAddSkillAssessment: (assessment: any) => void;
  onUpdateProfile: (user: User) => void;
  onAddLeaveRequest: (req: any) => void;
  onAddSiteVisit: (visit: any) => void;
  onAddComment?: (taskId: string, content: string) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  user, users, logs, tasks, reports, goals, resources, evaluations, messages, meetings, skills, skillAssessments, badges, userBadges, leaveRequests, siteVisits,
  onAddLog, onUpdateTaskStatus, onAddReport, onUpdateGoal, onSubmitDeliverable, onSendMessage, onAddSkillAssessment, onUpdateProfile, onAddLeaveRequest, onAddSiteVisit, onAddComment
}) => {
  const [activeTab, setActiveTab] = useState('DASHBOARD');

  // Filter data for this student
  const myTasks = tasks.filter(t => t.assignedToId === user.id);
  const myLogs = logs.filter(l => l.studentId === user.id);
  const myGoals = goals.filter(g => g.studentId === user.id);
  
  const renderContent = () => {
    switch(activeTab) {
      case 'DASHBOARD':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Welcome back, {user.name}</h2>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Gamification user={user} allUsers={users} userBadges={userBadges} badges={badges} tasks={tasks} />
                </div>
                <div>
                     <AttendanceCalendar studentId={user.id} logs={logs} />
                </div>
             </div>
          </div>
        );
      case 'TASKS':
        return (
             <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800">My Tasks</h2>
                <TaskBoard 
                    tasks={myTasks} 
                    goals={myGoals}
                    currentUser={user}
                    allUsers={users}
                    onStatusChange={onUpdateTaskStatus}
                    onAddComment={onAddComment}
                    onSubmitDeliverable={(task) => {
                         const url = prompt("Enter deliverable URL:");
                         const notes = prompt("Enter notes:");
                         if (url && notes) {
                             onSubmitDeliverable(task.id, { url, notes, submittedAt: new Date().toISOString() });
                         }
                    }}
                />
             </div>
        );
      case 'LOGS':
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">Daily Logs</h2>
                    <Button onClick={() => {
                        const hours = prompt("Hours worked:");
                        const desc = prompt("Description:");
                        if (hours && desc) {
                            onAddLog({
                                studentId: user.id,
                                date: new Date().toISOString().split('T')[0],
                                hoursWorked: parseFloat(hours),
                                activityDescription: desc,
                                challenges: ''
                            });
                        }
                    }}>Add Log</Button>
                </div>
                <div className="space-y-4">
                    {myLogs.length === 0 ? <p className="text-slate-500">No logs yet.</p> : myLogs.map(log => (
                        <Card key={log.id} className="p-4">
                            <div className="flex justify-between mb-2">
                                <span className="font-bold text-slate-800">{log.date}</span>
                                <span className="text-sm bg-indigo-50 text-indigo-700 px-2 py-1 rounded">{log.hoursWorked} hrs</span>
                            </div>
                            <p className="text-slate-600 text-sm">{log.activityDescription}</p>
                            <div className="mt-2 text-xs font-bold px-2 py-1 rounded bg-slate-100 w-fit">{log.status}</div>
                        </Card>
                    ))}
                </div>
            </div>
        );
      case 'SKILLS':
          return (
              <SkillTracker 
                student={user} 
                viewerRole={Role.STUDENT} 
                skills={skills} 
                assessments={skillAssessments} 
                onAddAssessment={onAddSkillAssessment} 
              />
          );
      case 'RESOURCES':
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Resource Library</h2>
                    <p className="text-slate-500">Documents, templates, and guidelines provided by your supervisor.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {resources.map(res => (
                        <Card key={res.id} className="p-0 hover:shadow-md transition-all group border-transparent ring-1 ring-slate-200 hover:ring-indigo-300">
                            <a 
                                href={res.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 p-4 w-full h-full hover:bg-slate-50/50 transition-colors"
                                download
                            >
                                <div className={`p-3 rounded-lg flex-shrink-0 ${
                                    res.type === 'PDF' ? 'bg-rose-100 text-rose-600' : 
                                    res.type === 'DOC' ? 'bg-blue-100 text-blue-600' :
                                    // @ts-ignore
                                    res.type === 'IMAGE' ? 'bg-purple-100 text-purple-600' :
                                    // @ts-ignore
                                    res.type === 'ZIP' ? 'bg-amber-100 text-amber-600' :
                                    'bg-slate-100 text-slate-600'
                                }`}>
                                    <FileText size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors truncate" title={res.title}>{res.title}</h4>
                                    <p className="text-xs text-slate-400">{new Date(res.uploadDate).toLocaleDateString()}</p>
                                </div>
                                <div className="text-slate-400 group-hover:text-indigo-600 bg-white group-hover:bg-indigo-50 p-2 rounded-full border border-slate-100 group-hover:border-indigo-100 transition-all shadow-sm">
                                    <Download size={18} />
                                </div>
                            </a>
                        </Card>
                    ))}
                    {resources.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-400">
                            No resources available.
                        </div>
                    )}
                </div>
            </div>
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 flex-shrink-0 space-y-2">
            {[
                { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Dashboard' },
                { id: 'TASKS', icon: CheckSquare, label: 'Tasks' },
                { id: 'LOGS', icon: Clock, label: 'Logs' },
                { id: 'SKILLS', icon: Target, label: 'Skills' },
                { id: 'RESOURCES', icon: BookOpen, label: 'Resources' },
            ].map(item => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <item.icon size={18} /> {item.label}
                </button>
            ))}
        </div>
        <div className="flex-1">
            {renderContent()}
        </div>
    </div>
  );
};