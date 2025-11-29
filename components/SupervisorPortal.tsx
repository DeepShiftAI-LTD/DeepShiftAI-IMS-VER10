

import React, { useState } from 'react';
import { User, LogEntry, Task, Report, Goal, Resource, Evaluation, Message, Meeting, Skill, SkillAssessment, Badge, UserBadge, LeaveRequest, SiteVisit, AttendanceException, TaskStatus } from '../types';
import { Card, Button } from './UI';
import { PermissionGuard } from './PermissionGuard';
import { Permission } from '../utils/permissions';
import { LayoutDashboard, Users, CheckSquare, FileText, BookOpen, Plus, Download } from 'lucide-react';

interface SupervisorPortalProps {
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
    attendanceExceptions: AttendanceException[];
    onApproveLog: (id: string, approved: boolean, comment?: string) => void;
    onAddTask: (task: any) => void;
    onUpdateTaskStatus: (id: string, status: TaskStatus) => void;
    onAddIntern: (user: any) => void;
    onUpdateIntern: (user: User) => void;
    onAddGoal: (goal: any) => void;
    onUpdateGoal: (goal: Goal) => void;
    onDeleteGoal: (id: string) => void;
    onAddResource: (res: any) => void;
    onGiveFeedback: (taskId: string, feedback: any) => void;
    onAddEvaluation: (evalItem: any) => void;
    onSendMessage: (msg: any) => void;
    onScheduleMeeting: (meeting: any) => void;
    onAddSkillAssessment: (assessment: any) => void;
    onAddSkill: (skill: any) => void;
    onSendNotification: (notif: any) => void;
    onUpdateLeaveStatus: (id: string, status: any) => void;
    onAddSiteVisit: (visit: any) => void;
    onUpdateSiteVisit: (visit: SiteVisit) => void;
    onDeleteSiteVisit: (id: string) => void;
    onAddAttendanceException: (ex: any) => void;
    onDeleteAttendanceException: (id: string) => void;
    onAddComment?: (taskId: string, content: string) => void;
}

export const SupervisorPortal: React.FC<SupervisorPortalProps> = ({
    user, users, logs, tasks, resources, onAddResource
}) => {
    const [activeTab, setActiveTab] = useState('DASHBOARD');
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);

    const renderContent = () => {
        switch (activeTab) {
            case 'DASHBOARD':
                return <div className="p-4">Dashboard content here...</div>;
            case 'INTERNS':
                 return <div className="p-4">Intern management here...</div>;
            case 'TASKS':
                 return <div className="p-4">Task management here...</div>;
            case 'resources':
                return (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Resource Library</h2>
                            <p className="text-slate-500">Shared documents and templates for students.</p>
                        </div>
                        <PermissionGuard user={user} permission={Permission.MANAGE_RESOURCES}>
                            <Button onClick={() => setIsResourceModalOpen(true)}>
                                <Plus size={16} /> Upload Resource
                            </Button>
                        </PermissionGuard>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {resources.map(res => (
                            <Card key={res.id} className="p-0 hover:shadow-md transition-all group border-transparent ring-1 ring-slate-200 hover:ring-indigo-300">
                                <a 
                                    href={res.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 w-full h-full hover:bg-slate-50/50 transition-colors"
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
                                        <p className="text-xs text-slate-400">Uploaded {new Date(res.uploadDate).toLocaleDateString()}</p>
                                    </div>
                                     <div className="text-slate-400 group-hover:text-indigo-600 p-2">
                                        <Download size={18} />
                                    </div>
                                </a>
                            </Card>
                        ))}
                        {resources.length === 0 && (
                            <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                                No resources uploaded yet.
                            </div>
                        )}
                    </div>
                    
                    {isResourceModalOpen && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                             <Card className="p-6 w-96">
                                 <h3 className="text-lg font-bold mb-2">Upload Resource</h3>
                                 <p className="text-xs text-slate-500 mb-4">Upload a document or share a link.</p>
                                 <div className="flex justify-end gap-2">
                                     <Button variant="secondary" onClick={() => setIsResourceModalOpen(false)}>Cancel</Button>
                                     <Button onClick={() => {
                                         const title = prompt("Resource Title");
                                         const url = prompt("Resource URL");
                                         if(title && url) {
                                             onAddResource({ title, url, type: 'LINK' });
                                             setIsResourceModalOpen(false);
                                         }
                                     }}>Upload</Button>
                                 </div>
                             </Card>
                        </div>
                    )}
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
                    { id: 'INTERNS', icon: Users, label: 'Interns' },
                    { id: 'TASKS', icon: CheckSquare, label: 'Tasks' },
                    { id: 'resources', icon: BookOpen, label: 'Resources' },
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