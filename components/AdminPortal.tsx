

import React, { useState } from 'react';
import { User, LogEntry, Task, Resource, Role } from '../types';
import { Card, Button } from './UI';
import { Plus, FileText, Download, Users, BarChart2, BookOpen, Search, Pencil, Trash2, X, Save, Shield, Mail, Phone, Building } from 'lucide-react';

interface AdminPortalProps {
  currentUser: User;
  users: User[];
  logs: LogEntry[];
  tasks: Task[];
  resources: Resource[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onAddResource: (resource: Omit<Resource, 'id' | 'uploadDate' | 'uploadedBy'>) => void;
  onAddComment?: (taskId: string, content: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ currentUser, users, logs, tasks, resources, onAddUser, onUpdateUser, onDeleteUser, onAddResource, onAddComment }) => {
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  
  // Resource State
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);

  // User Management State
  const [searchTerm, setSearchTerm] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingUser?.id) {
          onUpdateUser(editingUser as User);
      } else if (editingUser) {
          onAddUser(editingUser as Omit<User, 'id'>);
      }
      setIsUserModalOpen(false);
      setEditingUser(null);
  };

  const openAddUser = () => {
      setEditingUser({
          name: '',
          email: '',
          role: Role.STUDENT,
          phone: '',
          institution: '',
          department: '',
      });
      setIsUserModalOpen(true);
  };

  const openEditUser = (user: User) => {
      setEditingUser({ ...user });
      setIsUserModalOpen(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'DASHBOARD':
          return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <h2 className="text-2xl font-bold text-slate-800">System Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4 flex items-center gap-4 border-l-4 border-l-blue-500">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><Users size={24} /></div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Users</p>
                            <h3 className="text-2xl font-bold text-slate-800">{users.length}</h3>
                        </div>
                    </Card>
                    <Card className="p-4 flex items-center gap-4 border-l-4 border-l-emerald-500">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full"><FileText size={24} /></div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Logs</p>
                            <h3 className="text-2xl font-bold text-slate-800">{logs.length}</h3>
                        </div>
                    </Card>
                    <Card className="p-4 flex items-center gap-4 border-l-4 border-l-amber-500">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-full"><BookOpen size={24} /></div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Resources</p>
                            <h3 className="text-2xl font-bold text-slate-800">{resources.length}</h3>
                        </div>
                    </Card>
                    <Card className="p-4 flex items-center gap-4 border-l-4 border-l-indigo-500">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full"><Shield size={24} /></div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Admins</p>
                            <h3 className="text-2xl font-bold text-slate-800">{users.filter(u => u.role === Role.ADMIN).length}</h3>
                        </div>
                    </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <h3 className="font-bold text-slate-800 mb-4">Recent Users</h3>
                        <div className="space-y-3">
                            {users.slice(-5).reverse().map(u => (
                                <div key={u.id} className="flex items-center gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                                    <img src={u.avatar} alt="" className="w-8 h-8 rounded-full" />
                                    <div>
                                        <div className="font-medium text-sm">{u.name}</div>
                                        <div className="text-xs text-slate-500">{u.role}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
          );
      case 'USERS':
          return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
                        <p className="text-slate-500">Manage accounts, roles, and permissions.</p>
                    </div>
                    <Button onClick={openAddUser}>
                        <Plus size={16} /> Add User
                    </Button>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Contact</th>
                                    <th className="px-6 py-3">Institution</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={user.avatar} alt="" className="w-8 h-8 rounded-full bg-slate-200" />
                                                <div>
                                                    <div className="font-bold text-slate-800">{user.name}</div>
                                                    <div className="text-xs text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                user.role === Role.ADMIN ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                user.role === Role.SUPERVISOR ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                'bg-indigo-50 text-indigo-700 border-indigo-100'
                                            }`}>
                                                <Shield size={10} /> {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {user.phone ? (
                                                <div className="flex items-center gap-1 text-xs">
                                                    <Phone size={12} /> {user.phone}
                                                </div>
                                            ) : <span className="text-slate-400 italic">No phone</span>}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {user.institution ? (
                                                <div className="flex items-center gap-1 text-xs">
                                                    <Building size={12} /> {user.institution}
                                                </div>
                                            ) : <span className="text-slate-400 italic">-</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => openEditUser(user)}
                                                    className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                {user.id !== currentUser.id && (
                                                    <button 
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to delete this user?')) {
                                                                onDeleteUser(user.id);
                                                            }
                                                        }}
                                                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                            No users found matching "{searchTerm}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit/Add User Modal */}
                {isUserModalOpen && editingUser && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <Card className="w-full max-w-lg p-0 overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-lg text-slate-800">
                                    {editingUser.id ? 'Edit User' : 'Add New User'}
                                </h3>
                                <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={editingUser.name || ''}
                                            onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                                            className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                                        <input 
                                            type="email" 
                                            value={editingUser.email || ''}
                                            onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                            className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                            required
                                            disabled={!!editingUser.id} // Disable email edit for existing users to keep simple
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[Role.STUDENT, Role.SUPERVISOR, Role.ADMIN].map(role => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => setEditingUser({...editingUser, role: role})}
                                                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                                                    editingUser.role === role 
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                }`}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Institution</label>
                                        <input 
                                            type="text" 
                                            value={editingUser.institution || ''}
                                            onChange={(e) => setEditingUser({...editingUser, institution: e.target.value})}
                                            className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                                        <input 
                                            type="text" 
                                            value={editingUser.department || ''}
                                            onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
                                            className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                                    <input 
                                        type="tel" 
                                        value={editingUser.phone || ''}
                                        onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                                        className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
                                    <Button type="button" variant="secondary" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
                                    <Button type="submit"><Save size={16} /> Save Changes</Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}
            </div>
          );
      case 'RESOURCES':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-center">
                  <div>
                      <h2 className="text-2xl font-bold text-slate-800">Resource Library</h2>
                      <p className="text-slate-500">Manage global documents and templates.</p>
                  </div>
                  <Button onClick={() => setIsResourceModalOpen(true)}>
                      <Plus size={16} /> Upload Resource
                  </Button>
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
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
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
                { id: 'DASHBOARD', icon: BarChart2, label: 'Dashboard' },
                { id: 'USERS', icon: Users, label: 'User Management' },
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