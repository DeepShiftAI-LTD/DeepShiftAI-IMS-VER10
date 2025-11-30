import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from './lib/supabaseClient';
import { APP_NAME, MOCK_SKILLS, MOCK_BADGES } from './constants';
import { Role, User, LogEntry, Task, TaskStatus, LogStatus, Report, Goal, Resource, TaskDeliverable, TaskFeedback, Evaluation, Message, Meeting, Skill, SkillAssessment, Notification, NotificationType, Badge, UserBadge, LeaveRequest, LeaveStatus, FeedbackType, SiteVisit, GoalStatus, AttendanceException, LeaveType, TaskComment } from './types';
import { StudentPortal } from './components/StudentPortal';
import { SupervisorPortal } from './components/SupervisorPortal';
import { AdminPortal } from './components/AdminPortal';
import { Auth } from './components/Auth';
import { Bell, X, Megaphone, Info, LogOut, Loader2, AlertTriangle, WifiOff, RefreshCw, CloudOff } from 'lucide-react';

// --- Mappers: DB (snake_case) to Local (camelCase) ---

const mapUser = (d: any): User => ({
  id: d?.id ?? '',
  name: d?.name ?? 'Unknown User',
  email: d?.email ?? '',
  role: (d?.role as Role) ?? Role.STUDENT,
  avatar: d?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(d?.name || 'User')}&background=random`,
  totalHoursRequired: d?.total_hours_required ?? 120,
  assignedSupervisorId: d?.assigned_supervisor_id,
  internshipStartDate: d?.internship_start_date,
  internshipEndDate: d?.internship_end_date,
  institution: d?.institution,
  department: d?.department,
  bio: d?.bio,
  phone: d?.phone,
  hobbies: d?.hobbies || [],
  profileSkills: d?.profile_skills || [],
  achievements: d?.achievements || [],
  futureGoals: d?.future_goals || [],
  instituteSupervisorName: d?.institute_supervisor_name,
  instituteSupervisorPhone: d?.institute_supervisor_phone,
  nextOfKinName: d?.next_of_kin_name,
  nextOfKinRelationship: d?.next_of_kin_relationship,
  nextOfKinPhone: d?.next_of_kin_phone
});

const mapLog = (d: any): LogEntry => ({
  id: d?.id ?? '',
  studentId: d?.student_id ?? '',
  date: d?.date ?? new Date().toISOString(),
  hoursWorked: d?.hours_worked ?? 0,
  activityDescription: d?.activity_description ?? '',
  challenges: d?.challenges,
  status: d?.status ?? LogStatus.PENDING,
  supervisorComment: d?.supervisor_comment
});

const mapTask = (d: any): Task => ({
  id: d?.id ?? '',
  title: d?.title ?? '',
  description: d?.description ?? '',
  assignedToId: d?.assigned_to_id ?? '',
  assignedById: d?.assigned_by_id ?? '',
  status: d?.status ?? TaskStatus.TODO,
  priority: d?.priority ?? 'MEDIUM',
  dueDate: d?.due_date ?? '',
  createdAt: d?.created_at ?? new Date().toISOString(),
  deliverable: d?.deliverable,
  feedback: d?.feedback,
  linkedGoalId: d?.linked_goal_id,
  comments: [] // Initialize empty, populated later
});

const mapTaskComment = (d: any): TaskComment => ({
    id: d?.id ?? '',
    taskId: d?.task_id ?? '',
    authorId: d?.author_id ?? '',
    content: d?.content ?? '',
    createdAt: d?.created_at ?? new Date().toISOString()
});

const mapReport = (d: any): Report => ({
  id: d?.id ?? '',
  studentId: d?.student_id ?? '',
  type: d?.type ?? 'WEEKLY',
  periodStart: d?.period_start ?? '',
  periodEnd: d?.period_end ?? '',
  summary: d?.summary ?? '',
  keyLearnings: d?.key_learnings ?? '',
  nextSteps: d?.next_steps ?? '',
  submittedAt: d?.submitted_at ?? new Date().toISOString()
});

const mapGoal = (d: any): Goal => ({
  id: d?.id ?? '',
  studentId: d?.student_id ?? '',
  description: d?.description ?? '',
  category: d?.category ?? '',
  alignment: d?.alignment ?? '',
  status: d?.status ?? GoalStatus.NOT_STARTED,
  progress: d?.progress ?? 0
});

const mapResource = (d: any): Resource => ({
  id: d?.id ?? '',
  title: d?.title ?? '',
  type: d?.type ?? 'LINK',
  url: d?.url ?? '#',
  uploadedBy: d?.uploaded_by ?? '',
  uploadDate: d?.upload_date ?? new Date().toISOString()
});

const mapEvaluation = (d: any): Evaluation => ({
  id: d?.id ?? '',
  studentId: d?.student_id ?? '',
  supervisorId: d?.supervisor_id ?? '',
  type: d?.type ?? 'MID_TERM',
  date: d?.date ?? new Date().toISOString(),
  scores: d?.scores ?? [],
  overallFeedback: d?.overall_feedback ?? ''
});

const mapMessage = (d: any): Message => ({
  id: d?.id ?? '',
  senderId: d?.sender_id ?? '',
  content: d?.content ?? '',
  timestamp: d?.timestamp ?? new Date().toISOString(),
  channel: d?.channel ?? 'DIRECT',
  relatedStudentId: d?.related_student_id ?? ''
});

const mapMeeting = (d: any): Meeting => ({
  id: d?.id ?? '',
  title: d?.title ?? '',
  organizerId: d?.organizer_id ?? '',
  date: d?.date ?? '',
  time: d?.time ?? '',
  attendees: d?.attendees || [],
  link: d?.link
});

const mapNotification = (d: any): Notification => ({
  id: d?.id ?? '',
  recipientId: d?.recipient_id ?? '',
  senderId: d?.sender_id ?? '',
  title: d?.title ?? '',
  message: d?.message ?? '',
  type: d?.type ?? NotificationType.INFO,
  timestamp: d?.timestamp ?? new Date().toISOString(),
  read: d?.read ?? false
});

const mapSkill = (d: any): Skill => ({
  id: d?.id ?? '',
  name: d?.name ?? '',
  category: d?.category ?? 'Technical'
});

const mapSkillAssessment = (d: any): SkillAssessment => ({
  id: d?.id ?? '',
  studentId: d?.student_id ?? '',
  raterId: d?.rater_id ?? '',
  role: d?.role ?? Role.STUDENT,
  date: d?.date ?? new Date().toISOString(),
  ratings: d?.ratings ?? []
});

const mapBadge = (d: any): Badge => ({
  id: d?.id ?? '',
  name: d?.name ?? '',
  description: d?.description ?? '',
  icon: d?.icon ?? 'Star',
  color: d?.color ?? 'bg-gray-100',
  points: d?.points ?? 0
});

const mapUserBadge = (d: any): UserBadge => ({
  id: d?.id ?? '',
  userId: d?.user_id ?? '',
  badgeId: d?.badge_id ?? '',
  earnedAt: d?.earned_at ?? new Date().toISOString()
});

const mapLeaveRequest = (d: any): LeaveRequest => ({
  id: d?.id ?? '',
  studentId: d?.student_id ?? '',
  startDate: d?.start_date ?? '',
  endDate: d?.end_date ?? '',
  type: d?.type ?? LeaveType.SICK,
  reason: d?.reason ?? '',
  status: d?.status ?? LeaveStatus.PENDING
});

const mapSiteVisit = (d: any): SiteVisit => ({
  id: d?.id ?? '',
  studentId: d?.student_id ?? '',
  visitorId: d?.visitor_id ?? '',
  date: d?.date ?? '',
  location: d?.location ?? '',
  purpose: d?.purpose ?? '',
  notes: d?.notes ?? ''
});

const mapAttendanceException = (d: any): AttendanceException => ({
  id: d?.id ?? '',
  studentId: d?.student_id ?? '',
  date: d?.date ?? '',
  reason: d?.reason ?? '',
  type: d?.type ?? 'EXCUSED'
});

// Simple UUID generator for client-side ID generation
const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// --- Storage Helpers ---
const saveToLocal = (key: string, data: any) => {
    try {
        localStorage.setItem(`deepshift_${key}`, JSON.stringify(data));
    } catch (e) {
        console.warn(`Failed to save ${key} locally`, e);
    }
};

const getFromLocal = (key: string) => {
    try {
        const item = localStorage.getItem(`deepshift_${key}`);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        return null;
    }
};

// --- Sync Types ---
interface PendingAction {
    id: string; // Unique ID for the action request
    type: string;
    payload: any;
    timestamp: number;
}

function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Sync State
  const [pendingActions, setPendingActions] = useState<PendingAction[]>(() => getFromLocal('queue') || []);
  const [isSyncing, setIsSyncing] = useState(false);

  // Data State - Initialized as empty, fetched from Supabase
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskComments, setTaskComments] = useState<TaskComment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillAssessments, setSkillAssessments] = useState<SkillAssessment[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [attendanceExceptions, setAttendanceExceptions] = useState<AttendanceException[]>([]);

  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // --- Persistence Effects ---
  useEffect(() => { saveToLocal('users', users); }, [users]);
  useEffect(() => { saveToLocal('logs', logs); }, [logs]);
  useEffect(() => { saveToLocal('tasks', tasks); }, [tasks]);
  useEffect(() => { saveToLocal('taskComments', taskComments); }, [taskComments]);
  useEffect(() => { saveToLocal('reports', reports); }, [reports]);
  useEffect(() => { saveToLocal('goals', goals); }, [goals]);
  useEffect(() => { saveToLocal('resources', resources); }, [resources]);
  useEffect(() => { saveToLocal('evaluations', evaluations); }, [evaluations]);
  useEffect(() => { saveToLocal('messages', messages); }, [messages]);
  useEffect(() => { saveToLocal('meetings', meetings); }, [meetings]);
  useEffect(() => { saveToLocal('notifications', notifications); }, [notifications]);
  useEffect(() => { saveToLocal('skills', skills); }, [skills]);
  useEffect(() => { saveToLocal('assessments', skillAssessments); }, [skillAssessments]);
  useEffect(() => { saveToLocal('badges', badges); }, [badges]);
  useEffect(() => { saveToLocal('userBadges', userBadges); }, [userBadges]);
  useEffect(() => { saveToLocal('leaves', leaveRequests); }, [leaveRequests]);
  useEffect(() => { saveToLocal('visits', siteVisits); }, [siteVisits]);
  useEffect(() => { saveToLocal('exceptions', attendanceExceptions); }, [attendanceExceptions]);
  
  // Queue Persistence
  useEffect(() => {
      saveToLocal('queue', pendingActions);
  }, [pendingActions]);

  // Online Status Listeners
  useEffect(() => {
    const handleOnline = () => {
        setIsOnline(true);
        // Attempt sync when coming back online
        if (pendingActions.length > 0) {
            syncData();
        }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingActions]);

  useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
          if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
              setIsNotifDropdownOpen(false);
          }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadOfflineData = () => {
      console.log("Loading offline data...");
      setUsers(getFromLocal('users') || []);
      setLogs(getFromLocal('logs') || []);
      setTasks(getFromLocal('tasks') || []);
      setTaskComments(getFromLocal('taskComments') || []);
      setReports(getFromLocal('reports') || []);
      setGoals(getFromLocal('goals') || []);
      setResources(getFromLocal('resources') || []);
      setEvaluations(getFromLocal('evaluations') || []);
      setMessages(getFromLocal('messages') || []);
      setMeetings(getFromLocal('meetings') || []);
      setNotifications(getFromLocal('notifications') || []);
      setSkills(getFromLocal('skills') || MOCK_SKILLS);
      setSkillAssessments(getFromLocal('assessments') || []);
      setBadges(getFromLocal('badges') || MOCK_BADGES);
      setUserBadges(getFromLocal('userBadges') || []);
      setLeaveRequests(getFromLocal('leaves') || []);
      setSiteVisits(getFromLocal('visits') || []);
      setAttendanceExceptions(getFromLocal('exceptions') || []);
  };

  const fetchUsers = async () => {
    if (!navigator.onLine) return;
    try {
        const { data, error } = await supabase.from('users').select('*');
        if (error) throw error;
        if (data) {
            setUsers(data.map(mapUser));
        }
    } catch (err) {
        console.error("Error fetching users:", err);
    }
  };

  const fetchAllData = async () => {
    if (!navigator.onLine) {
        loadOfflineData();
        return;
    }

    try {
        const [
            logsRes, tasksRes, reportsRes, goalsRes, resourcesRes, 
            evalsRes, msgsRes, meetingsRes, notifsRes, 
            skillsRes, assessmentsRes, badgesRes, userBadgesRes,
            leavesRes, visitsRes, exceptionsRes, taskCommentsRes
        ] = await Promise.all([
            supabase.from('logs').select('*'),
            supabase.from('tasks').select('*'),
            supabase.from('reports').select('*'),
            supabase.from('goals').select('*'),
            supabase.from('resources').select('*'),
            supabase.from('evaluations').select('*'),
            supabase.from('messages').select('*'),
            supabase.from('meetings').select('*'),
            supabase.from('notifications').select('*'),
            supabase.from('skills').select('*'),
            supabase.from('skill_assessments').select('*'),
            supabase.from('badges').select('*'),
            supabase.from('user_badges').select('*'),
            supabase.from('leave_requests').select('*'),
            supabase.from('site_visits').select('*'),
            supabase.from('attendance_exceptions').select('*'),
            supabase.from('task_comments').select('*')
        ]);

        if(logsRes.data) setLogs(logsRes.data.map(mapLog));
        if(tasksRes.data) setTasks(tasksRes.data.map(mapTask));
        if(reportsRes.data) setReports(reportsRes.data.map(mapReport));
        if(goalsRes.data) setGoals(goalsRes.data.map(mapGoal));
        if(resourcesRes.data) setResources(resourcesRes.data.map(mapResource));
        if(evalsRes.data) setEvaluations(evalsRes.data.map(mapEvaluation));
        if(msgsRes.data) setMessages(msgsRes.data.map(mapMessage));
        if(meetingsRes.data) setMeetings(meetingsRes.data.map(mapMeeting));
        if(notifsRes.data) setNotifications(notifsRes.data.map(mapNotification));
        
        if(skillsRes.data && skillsRes.data.length > 0) setSkills(skillsRes.data.map(mapSkill));
        else setSkills(MOCK_SKILLS);

        if(badgesRes.data && badgesRes.data.length > 0) setBadges(badgesRes.data.map(mapBadge));
        else setBadges(MOCK_BADGES);

        if(assessmentsRes.data) setSkillAssessments(assessmentsRes.data.map(mapSkillAssessment));
        if(userBadgesRes.data) setUserBadges(userBadgesRes.data.map(mapUserBadge));
        if(leavesRes.data) setLeaveRequests(leavesRes.data.map(mapLeaveRequest));
        if(visitsRes.data) setSiteVisits(visitsRes.data.map(mapSiteVisit));
        if(exceptionsRes.data) setAttendanceExceptions(exceptionsRes.data.map(mapAttendanceException));
        if(taskCommentsRes.data) setTaskComments(taskCommentsRes.data.map(mapTaskComment));

    } catch (e) {
        console.error("Error fetching data, falling back to local", e);
        loadOfflineData();
    }
  };

  // Merge comments into tasks for the UI
  const tasksWithComments = useMemo(() => {
      return tasks.map(task => ({
          ...task,
          comments: taskComments.filter(c => c.taskId === task.id).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      }));
  }, [tasks, taskComments]);

  // --- Offline & Sync Logic ---
  const queueAction = (type: string, payload: any) => {
      const action: PendingAction = {
          id: generateUUID(),
          type,
          payload,
          timestamp: Date.now()
      };
      setPendingActions(prev => [...prev, action]);
  };

  const syncData = async () => {
    if (pendingActions.length === 0 || isSyncing) return;
    setIsSyncing(true);

    const failedActions: PendingAction[] = [];
    const actionsToProcess = [...pendingActions]; // Copy

    // Clear current queue to avoid double processing if more actions added during sync
    setPendingActions([]); 

    console.log(`Starting sync for ${actionsToProcess.length} items...`);

    for (const action of actionsToProcess) {
        try {
            let error: any = null;
            
            // Artificial delay for UI feedback
            await new Promise(r => setTimeout(r, 200));

            switch (action.type) {
                case 'ADD_LOG':
                    ({ error } = await supabase.from('logs').insert(action.payload));
                    break;
                case 'UPDATE_LOG_STATUS':
                    ({ error } = await supabase.from('logs').update(action.payload.updates).eq('id', action.payload.id));
                    break;
                case 'ADD_TASK':
                    ({ error } = await supabase.from('tasks').insert(action.payload));
                    break;
                case 'UPDATE_TASK_STATUS':
                    ({ error } = await supabase.from('tasks').update({ status: action.payload.status }).eq('id', action.payload.id));
                    break;
                case 'SUBMIT_DELIVERABLE':
                    ({ error } = await supabase.from('tasks').update({ deliverable: action.payload.deliverable, status: action.payload.status }).eq('id', action.payload.id));
                    break;
                case 'ADD_TASK_COMMENT':
                    ({ error } = await supabase.from('task_comments').insert(action.payload));
                    break;
                case 'ADD_REPORT':
                    ({ error } = await supabase.from('reports').insert(action.payload));
                    break;
                case 'ADD_GOAL':
                    ({ error } = await supabase.from('goals').insert(action.payload));
                    break;
                case 'UPDATE_GOAL':
                    ({ error } = await supabase.from('goals').update(action.payload.updates).eq('id', action.payload.id));
                    break;
                case 'ADD_EVALUATION':
                    ({ error } = await supabase.from('evaluations').insert(action.payload));
                    break;
                case 'ADD_MESSAGE':
                    ({ error } = await supabase.from('messages').insert(action.payload));
                    break;
                case 'ADD_LEAVE':
                    ({ error } = await supabase.from('leave_requests').insert(action.payload));
                    break;
                 case 'ADD_SITE_VISIT':
                    ({ error } = await supabase.from('site_visits').insert(action.payload));
                    break;
                case 'GIVE_FEEDBACK':
                    ({ error } = await supabase.from('tasks').update({ feedback: action.payload.feedback }).eq('id', action.payload.id));
                    break;
                default:
                    console.warn("Unknown action type", action.type);
            }

            if (error) throw error;

        } catch (e) {
            console.error(`Sync failed for action ${action.type}`, e);
            failedActions.push(action);
        }
    }

    // Put failed actions back in queue
    if (failedActions.length > 0) {
        setPendingActions(prev => [...failedActions, ...prev]);
        console.warn(`${failedActions.length} actions failed to sync.`);
    } else {
        console.log("Sync completed successfully.");
        // Refresh data to ensure consistency with backend triggers/formatting
        await fetchAllData();
    }

    setIsSyncing(false);
  };


  // Check Session on Mount
  useEffect(() => {
      let mounted = true;

      const initAuth = async () => {
          try {
              setIsAuthLoading(true);
              
              if (navigator.onLine) {
                  const { data: { session }, error } = await supabase.auth.getSession();
                  if (error) throw error;
                  
                  if (mounted && session?.user) {
                      const { data, error: profileError } = await supabase.from('users').select('*').eq('id', session.user.id).maybeSingle();
                      
                      if (!profileError && data) {
                          const user = mapUser(data);
                          setCurrentUser(user);
                          setIsAuthenticated(true);
                          saveToLocal('currentUser', user);
                      }
                  }
              } else {
                  // Offline Auth - Load from local
                  const savedUser = getFromLocal('currentUser');
                  if (savedUser) {
                      setCurrentUser(savedUser);
                      setIsAuthenticated(true);
                  }
              }

              if (mounted) await fetchAllData();
          } catch (err) {
              console.error("Auth init error:", err);
          } finally {
              if (mounted) setIsAuthLoading(false);
          }
      };

      initAuth();

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;
          
          if (event === 'SIGNED_IN' && session?.user) {
              try {
                  const { data } = await supabase.from('users').select('*').eq('id', session.user.id).maybeSingle();
                  if (data) {
                      const user = mapUser(data);
                      setCurrentUser(user);
                      setIsAuthenticated(true);
                      saveToLocal('currentUser', user);
                      await fetchAllData();
                  }
              } catch (e) {
                  console.error("Auth state change error:", e);
              }
          } else if (event === 'SIGNED_OUT') {
              setCurrentUser(null);
              setIsAuthenticated(false);
              localStorage.removeItem('deepshift_currentUser');
          }
      });

      return () => {
          mounted = false;
          subscription.unsubscribe();
      };
  }, []);

  // --- Auth Logic ---
  const handleLogin = async (email: string, password: string) => {
      if (!navigator.onLine) {
          setLoginError("Cannot log in while offline. Please connect to the internet.");
          return;
      }
      setLoginError('');
      try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          
          if (error) {
              setLoginError(error.message);
              return;
          }

          if (data.user) {
              const { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).maybeSingle();
              if (profile) {
                const user = mapUser(profile);
                setCurrentUser(user);
                setIsAuthenticated(true);
                saveToLocal('currentUser', user);
                await fetchAllData();
              }
          }
      } catch (e: any) {
          setLoginError(`Unexpected login error: ${e.message}`);
      }
  };

  const handleRegister = async (userData: Omit<User, 'id' | 'role' | 'avatar' | 'assignedSupervisorId'>, password: string) => {
      if (!navigator.onLine) {
          setLoginError("Cannot register while offline.");
          return;
      }
      
      setLoginError('');
      console.log("Starting registration for:", userData.email);
      
      let targetUserId = '';
      let shouldCreateProfile = false;

      try {
        const { data, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: password,
            options: {
                data: {
                    full_name: userData.name,
                    role: 'STUDENT'
                }
            }
        });

        if (authError) {
            // Check if user already exists
            if (authError.message.toLowerCase().includes("already registered") || authError.status === 400 || authError.status === 422) {
                 console.log("User already exists. Attempting auto-login to verify profile status...");
                 const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                     email: userData.email,
                     password: password
                 });

                 if (loginError) {
                     setLoginError("User already registered. Please log in.");
                     return;
                 }
                 
                 if (loginData.user) {
                     targetUserId = loginData.user.id;
                     // Check if profile exists
                     const { data: existingProfile } = await supabase.from('users').select('id').eq('id', targetUserId).maybeSingle();
                     if (existingProfile) {
                         // User is fine, just process login
                         const { data: profile } = await supabase.from('users').select('*').eq('id', targetUserId).single();
                         if (profile) {
                            const user = mapUser(profile);
                            setCurrentUser(user);
                            setIsAuthenticated(true);
                            saveToLocal('currentUser', user);
                            await fetchAllData();
                         }
                         return; // Done
                     } else {
                         // Auth exists, Login worked, but Profile missing. Create it.
                         shouldCreateProfile = true;
                     }
                 }
            } else {
                console.error("Supabase Auth Error:", authError);
                setLoginError(authError.message);
                return;
            }
        } else if (data.user) {
            targetUserId = data.user.id;
            shouldCreateProfile = true;
        }

        if (shouldCreateProfile && targetUserId) {
            console.log("Creating profile for user:", targetUserId);
            // Use safe defaults for optional fields to avoid issues with missing columns or undefined values
            const dbUser = {
                id: targetUserId,
                email: userData.email,
                password: password, // ADDED: Fix for NOT NULL constraint on 'password' column
                name: userData.name,
                role: 'STUDENT',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
                phone: userData.phone || null,
                institution: userData.institution || null,
                department: userData.department || null,
                bio: userData.bio || null,
                total_hours_required: 120,
                // The following fields are commented out because they are missing from the Supabase schema
                // If you add these columns to your Supabase 'users' table, you can uncomment them.
                // hobbies: userData.hobbies || [],
                // profile_skills: userData.profileSkills || [],
                // achievements: [],
                // future_goals: [],
                // institute_supervisor_name: userData.instituteSupervisorName || null,
                // institute_supervisor_phone: userData.instituteSupervisorPhone || null,
                // next_of_kin_name: userData.nextOfKinName || null,
                // next_of_kin_relationship: userData.nextOfKinRelationship || null,
                // next_of_kin_phone: userData.nextOfKinPhone || null
            };

            // Use upsert instead of insert to handle race conditions or partial failures safely
            const { error: dbError } = await supabase.from('users').upsert(dbUser);

            if (dbError) {
                // IMPORTANT: Stringify the error object so the user sees the actual code/details, not [object Object]
                console.error("Profile Insert Error:", dbError);
                setLoginError("Profile Setup Failed: " + (dbError.message || JSON.stringify(dbError)));
            } else {
                // Success - fetch profile and set session
                 const { data: profile } = await supabase.from('users').select('*').eq('id', targetUserId).single();
                 if (profile) {
                    const user = mapUser(profile);
                    setCurrentUser(user);
                    setIsAuthenticated(true);
                    saveToLocal('currentUser', user);
                    await fetchAllData();
                 } else {
                    alert('Registration successful! Please login.');
                 }
            }
        }
      } catch (err: any) {
          console.error("Unexpected Register Error:", err);
          // Ensure err object is stringified if message is missing
          setLoginError("Unexpected error: " + (err.message || JSON.stringify(err)));
      }
  };

  const handlePasswordReset = (email: string, newPassword: string): boolean => {
      return true; // Mock impl
  };
  
  const getUserByEmail = async (email: string): Promise<User | null> => {
      if (!navigator.onLine) return null;
      const { data } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
      return data ? mapUser(data) : null;
  };

  const handleLogout = async () => {
      try {
          setCurrentUser(null);
          setIsAuthenticated(false);
          setUsers([]); 
          localStorage.removeItem('deepshift_currentUser');
          await supabase.auth.signOut();
      } catch (e) {
          console.error("Sign out error:", e);
      }
  };

  // --- Handlers with Offline Support ---

  const awardBadge = async (userId: string, badgeId: string) => {
      const hasBadge = userBadges.some(ub => ub.userId === userId && ub.badgeId === badgeId);
      if (hasBadge) return;
      
      const badge = badges.find(b => b.id === badgeId);
      
      const newBadge = {
          id: generateUUID(),
          user_id: userId,
          badge_id: badgeId,
          earned_at: new Date().toISOString()
      };

      setUserBadges(prev => [...prev, mapUserBadge(newBadge)]);

      if (isOnline) {
          const { error } = await supabase.from('user_badges').insert(newBadge);
          if (error) console.error("Badge award failed", error);
      } else {
          queueAction('ADD_USER_BADGE', newBadge);
      }
  };

  const checkLogStreak = (studentId: string, currentLogs: LogEntry[]) => {
      const uniqueDates = Array.from(new Set(
          currentLogs
          .filter(l => l.studentId === studentId)
          .map(l => l.date)
      )).sort();

      let streak = 0;
      for (let i = 0; i < uniqueDates.length; i++) {
          if (i === 0) {
              streak = 1;
              continue;
          }
          const prev = new Date(uniqueDates[i-1]);
          const curr = new Date(uniqueDates[i]);
          const diffTime = Math.abs(curr.getTime() - prev.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

          if (diffDays === 1) {
              streak++;
          } else {
              streak = 1;
          }

          if (streak >= 5) {
              awardBadge(studentId, 'b1');
              break;
          }
      }
  };

  const handleAddLog = async (newLogData: Omit<LogEntry, 'id' | 'status'>) => {
    const payload = {
        id: generateUUID(),
        student_id: newLogData.studentId,
        date: newLogData.date,
        hours_worked: newLogData.hoursWorked,
        activity_description: newLogData.activityDescription,
        challenges: newLogData.challenges,
        status: LogStatus.PENDING
    };

    const newLog = mapLog(payload);
    setLogs(prev => {
        const updatedLogs = [newLog, ...prev];
        checkLogStreak(newLogData.studentId, updatedLogs);
        return updatedLogs;
    });

    if (isOnline) {
        const { error } = await supabase.from('logs').insert(payload);
        if (error) {
            console.error("Online Add Log Failed, queuing...", error);
            queueAction('ADD_LOG', payload);
        }
    } else {
        queueAction('ADD_LOG', payload);
    }
  };

  const handleApproveLog = async (logId: string, approved: boolean, comment?: string) => {
    const status = approved ? LogStatus.APPROVED : LogStatus.REJECTED;
    const updates = {
        status: status,
        supervisor_comment: comment
    };
    
    setLogs(prev => prev.map(log => 
        log.id === logId 
        ? { ...log, status: status, supervisorComment: comment } 
        : log
    ));

    if (isOnline) {
        const { error } = await supabase.from('logs').update(updates).eq('id', logId);
        if (error) queueAction('UPDATE_LOG_STATUS', { id: logId, updates });
    } else {
        queueAction('UPDATE_LOG_STATUS', { id: logId, updates });
    }
  };

  const handleAddTask = async (newTaskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
    const payload = {
        id: generateUUID(),
        title: newTaskData.title,
        description: newTaskData.description,
        assigned_to_id: newTaskData.assignedToId,
        assigned_by_id: newTaskData.assignedById,
        status: TaskStatus.TODO,
        priority: newTaskData.priority,
        due_date: newTaskData.dueDate,
        linked_goal_id: newTaskData.linkedGoalId || null,
        created_at: new Date().toISOString()
    };

    setTasks(prev => [...prev, mapTask(payload)]);

    if (isOnline) {
        const { error } = await supabase.from('tasks').insert(payload);
        if (error) queueAction('ADD_TASK', payload);
    } else {
        queueAction('ADD_TASK', payload);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
      setTasks(prev => {
          const updatedTasks = prev.map(task => task.id === taskId ? { ...task, status } : task);
          if (status === TaskStatus.COMPLETED) {
              const task = updatedTasks.find(t => t.id === taskId);
              if (task) {
                  const completedCount = updatedTasks.filter(t => t.assignedToId === task.assignedToId && t.status === TaskStatus.COMPLETED).length;
                  if (completedCount >= 10) awardBadge(task.assignedToId, 'b2');
              }
          }
          return updatedTasks;
      });

      if (isOnline) {
          const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId);
          if (error) queueAction('UPDATE_TASK_STATUS', { id: taskId, status });
      } else {
          queueAction('UPDATE_TASK_STATUS', { id: taskId, status });
      }
  };
  
  const handleSubmitDeliverable = async (taskId: string, deliverable: TaskDeliverable) => {
      setTasks(prev => {
          const updatedTasks = prev.map(task =>
            task.id === taskId ? { ...task, deliverable, status: TaskStatus.COMPLETED } : task
          );
          return updatedTasks;
      });

      if (isOnline) {
          const { error } = await supabase.from('tasks').update({
              deliverable: deliverable,
              status: TaskStatus.COMPLETED
          }).eq('id', taskId);
          if (error) queueAction('SUBMIT_DELIVERABLE', { id: taskId, deliverable, status: TaskStatus.COMPLETED });
      } else {
           queueAction('SUBMIT_DELIVERABLE', { id: taskId, deliverable, status: TaskStatus.COMPLETED });
      }
  };

  const handleAddTaskComment = async (taskId: string, content: string) => {
      if (!currentUser) return;
      const payload = {
          id: generateUUID(),
          task_id: taskId,
          author_id: currentUser.id,
          content: content,
          created_at: new Date().toISOString()
      };

      setTaskComments(prev => [...prev, mapTaskComment(payload)]);

      if (isOnline) {
          const { error } = await supabase.from('task_comments').insert(payload);
          if (error) queueAction('ADD_TASK_COMMENT', payload);
      } else {
          queueAction('ADD_TASK_COMMENT', payload);
      }
  };

  const handleGiveFeedback = async (taskId: string, feedback: TaskFeedback) => {
      setTasks(prev => prev.map(task =>
          task.id === taskId ? { ...task, feedback } : task
      ));
      if (feedback.type === FeedbackType.PRAISE) {
          const task = tasks.find(t => t.id === taskId);
          if (task) awardBadge(task.assignedToId, 'b4');
      }

      if (isOnline) {
          const { error } = await supabase.from('tasks').update({ feedback }).eq('id', taskId);
          if (error) queueAction('GIVE_FEEDBACK', { id: taskId, feedback });
      } else {
          queueAction('GIVE_FEEDBACK', { id: taskId, feedback });
      }
  };

  const handleAddIntern = (userData: Omit<User, 'id' | 'role' | 'avatar'>) => {
      alert("Please note: Adding interns requires an internet connection for them to register.");
  };

  const handleUpdateIntern = async (updatedUser: User) => {
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));

      if (isOnline) {
           const { error } = await supabase.from('users').update({
              name: updatedUser.name,
              phone: updatedUser.phone,
              institution: updatedUser.institution,
              department: updatedUser.department,
              bio: updatedUser.bio,
              // Removed potential problematic fields for safety if schema is basic
              // hobbies: updatedUser.hobbies, 
              // profile_skills: updatedUser.profileSkills,
              // achievements: updatedUser.achievements,
              // future_goals: updatedUser.futureGoals,
              role: updatedUser.role
          }).eq('id', updatedUser.id);
          if (error) console.error("Update profile failed", error);
      }
  };

  const handleAddUser = async (user: Omit<User, 'id'>) => {
      if (!isOnline) {
          alert("Must be online to create new accounts.");
          return;
      }
      
      const tempId = generateUUID();
      const payload = { 
          id: tempId,
          email: user.email,
          password: user.password || '123456', // ADDED: Fix for NOT NULL constraint
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone || null,
          institution: user.institution || null,
          department: user.department || null,
          bio: user.bio || null,
          hobbies: user.hobbies || [],
          profile_skills: user.profileSkills || [],
          achievements: user.achievements || [],
          future_goals: user.futureGoals || [],
          total_hours_required: user.totalHoursRequired || 120,
          internship_start_date: user.internshipStartDate || null,
          internship_end_date: user.internshipEndDate || null,
          assigned_supervisor_id: user.assignedSupervisorId || null,
      };

      const { data, error } = await supabase.from('users').insert(payload).select().single();
      
      if (data) {
          setUsers(prev => [...prev, mapUser(data)]);
          alert(`User "${user.name}" added successfully.`);
      } else {
          console.error("Error adding user:", error);
          alert(`Error adding user: ${error?.message}`);
      }
  };

  const handleDeleteUser = async (userId: string) => {
      if (!isOnline) {
          alert("Must be online to delete users.");
          return;
      }
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (!error) {
          setUsers(prev => prev.filter(u => u.id !== userId));
      }
  };

  const switchRole = () => {
      let newRole = Role.STUDENT;
      if (currentUser?.role === Role.STUDENT) newRole = Role.SUPERVISOR;
      else if (currentUser?.role === Role.SUPERVISOR) newRole = Role.ADMIN;
      else if (currentUser?.role === Role.ADMIN) newRole = Role.STUDENT;

      const newUser = users.find(u => u.role === newRole);
      if (newUser) setCurrentUser(newUser);
  };

  const handleAddReport = async (reportData: Omit<Report, 'id' | 'submittedAt'>) => {
    const payload = {
        id: generateUUID(),
        student_id: reportData.studentId,
        type: reportData.type,
        period_start: reportData.periodStart,
        period_end: reportData.periodEnd,
        summary: reportData.summary,
        key_learnings: reportData.keyLearnings,
        next_steps: reportData.nextSteps,
        submitted_at: new Date().toISOString()
    };
    
    setReports(prev => [...prev, mapReport(payload)]);

    if (isOnline) {
        const { error } = await supabase.from('reports').insert(payload);
        if (error) queueAction('ADD_REPORT', payload);
    } else {
        queueAction('ADD_REPORT', payload);
    }
  };

  const handleAddGoal = async (goalData: Omit<Goal, 'id' | 'progress' | 'status'>) => {
      const payload = {
          id: generateUUID(),
          student_id: goalData.studentId,
          description: goalData.description,
          category: goalData.category,
          alignment: goalData.alignment,
          status: GoalStatus.NOT_STARTED,
          progress: 0
      };
      
      setGoals(prev => [...prev, mapGoal(payload)]);

      if (isOnline) {
          const { error } = await supabase.from('goals').insert(payload);
          if (error) queueAction('ADD_GOAL', payload);
      } else {
          queueAction('ADD_GOAL', payload);
      }
  };

  const handleUpdateGoal = async (updatedGoal: Goal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));

    const updates = {
        description: updatedGoal.description,
        category: updatedGoal.category,
        alignment: updatedGoal.alignment,
        status: updatedGoal.status,
        progress: updatedGoal.progress
    };

    if (isOnline) {
        const { error } = await supabase.from('goals').update(updates).eq('id', updatedGoal.id);
        if (error) queueAction('UPDATE_GOAL', { id: updatedGoal.id, updates });
    } else {
        queueAction('UPDATE_GOAL', { id: updatedGoal.id, updates });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
      setGoals(prev => prev.filter(g => g.id !== goalId));
      if (isOnline) await supabase.from('goals').delete().eq('id', goalId);
  };

  const handleAddResource = async (resourceData: Omit<Resource, 'id' | 'uploadDate' | 'uploadedBy'>) => {
    if (!isOnline && resourceData.type !== 'LINK') {
        alert("Cannot upload files while offline.");
        return;
    }

    const payload = {
        id: generateUUID(),
        title: resourceData.title,
        type: resourceData.type,
        url: resourceData.url,
        uploaded_by: currentUser!.id,
        upload_date: new Date().toISOString()
    };
    
    setResources(prev => [...prev, mapResource(payload)]);

    if (isOnline) {
        const { error } = await supabase.from('resources').insert(payload);
        if (error) console.error("Error adding resource record", error);
    } 
  };

  const handleAddEvaluation = async (evalData: Omit<Evaluation, 'id'>) => {
    const payload = {
        id: generateUUID(),
        student_id: evalData.studentId,
        supervisor_id: evalData.supervisorId,
        type: evalData.type,
        date: evalData.date,
        scores: evalData.scores,
        overall_feedback: evalData.overallFeedback
    };
    setEvaluations(prev => [...prev, mapEvaluation(payload)]);
    
    if (isOnline) {
        const { error } = await supabase.from('evaluations').insert(payload);
        if (error) queueAction('ADD_EVALUATION', payload);
    } else {
        queueAction('ADD_EVALUATION', payload);
    }
  };

  const handleSendMessage = async (msgData: Omit<Message, 'id' | 'timestamp'>) => {
      const payload = {
          id: generateUUID(),
          sender_id: msgData.senderId,
          content: msgData.content,
          channel: msgData.channel,
          related_student_id: msgData.relatedStudentId,
          timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, mapMessage(payload)]);
      
      if (isOnline) {
          const { error } = await supabase.from('messages').insert(payload);
          if (error) queueAction('ADD_MESSAGE', payload);
      } else {
          queueAction('ADD_MESSAGE', payload);
      }
  };

  const handleScheduleMeeting = async (meetingData: Omit<Meeting, 'id'>) => {
      if (!isOnline) {
          alert("Must be online to schedule meetings (to prevent conflicts).");
          return;
      }
      const payload = {
          title: meetingData.title,
          organizer_id: meetingData.organizerId,
          date: meetingData.date,
          time: meetingData.time,
          attendees: meetingData.attendees,
          link: meetingData.link
      };
      const { data } = await supabase.from('meetings').insert(payload).select().single();
      if (data) {
          setMeetings(prev => [...prev, mapMeeting(data)]);
      }
  };

  const handleSendNotification = async (notifData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const payload = {
          recipient_id: notifData.recipientId,
          sender_id: notifData.senderId,
          title: notifData.title,
          message: notifData.message,
          type: notifData.type,
          timestamp: new Date().toISOString(),
          read: false
      };
      if (isOnline) {
          const { data } = await supabase.from('notifications').insert(payload).select().single();
          if (data) setNotifications(prev => [mapNotification(data), ...prev]);
      }
  };

  const markNotificationRead = async (id: string) => {
      if (isOnline) {
           await supabase.from('notifications').update({ read: true }).eq('id', id);
      }
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleAddSkillAssessment = async (assessmentData: Omit<SkillAssessment, 'id'>) => {
    const payload = {
        id: generateUUID(),
        student_id: assessmentData.studentId,
        rater_id: assessmentData.raterId,
        role: assessmentData.role,
        date: assessmentData.date,
        ratings: assessmentData.ratings
    };
    setSkillAssessments(prev => [...prev, mapSkillAssessment(payload)]);
    if (isOnline) {
        await supabase.from('skill_assessments').insert(payload);
    }
  };

  const handleAddSkill = async (skillData: Omit<Skill, 'id'>) => {
    const { data } = await supabase.from('skills').insert(skillData).select().single();
    if (data) setSkills(prev => [...prev, mapSkill(data)]);
  };

  const handleUpdateProfile = async (updatedUser: User) => {
    handleUpdateIntern(updatedUser); 
  };

  const handleAddLeaveRequest = async (requestData: Omit<LeaveRequest, 'id' | 'status'>) => {
      const payload = {
          id: generateUUID(),
          student_id: requestData.studentId,
          start_date: requestData.startDate,
          end_date: requestData.endDate,
          type: requestData.type,
          reason: requestData.reason,
          status: LeaveStatus.PENDING
      };
      setLeaveRequests(prev => [...prev, mapLeaveRequest(payload)]);

      if (isOnline) {
          const { error } = await supabase.from('leave_requests').insert(payload);
          if (error) queueAction('ADD_LEAVE', payload);
      } else {
          queueAction('ADD_LEAVE', payload);
      }
  };

  const handleUpdateLeaveStatus = async (requestId: string, status: LeaveStatus) => {
      setLeaveRequests(prev => prev.map(lr => lr.id === requestId ? { ...lr, status } : lr));
      if (isOnline) await supabase.from('leave_requests').update({ status }).eq('id', requestId);
  };
  
  const handleAddSiteVisit = async (visitData: Omit<SiteVisit, 'id'>) => {
      const payload = {
          id: generateUUID(),
          student_id: visitData.studentId,
          visitor_id: visitData.visitorId,
          date: visitData.date,
          location: visitData.location,
          purpose: visitData.purpose,
          notes: visitData.notes
      };
      setSiteVisits(prev => [...prev, mapSiteVisit(payload)]);
      
      if (isOnline) {
          const { error } = await supabase.from('site_visits').insert(payload);
          if (error) queueAction('ADD_SITE_VISIT', payload);
      } else {
          queueAction('ADD_SITE_VISIT', payload);
      }
  };

  const handleUpdateSiteVisit = async (updatedVisit: SiteVisit) => {
      setSiteVisits(prev => prev.map(sv => sv.id === updatedVisit.id ? updatedVisit : sv));
      if (isOnline) {
          await supabase.from('site_visits').update({
              date: updatedVisit.date,
              location: updatedVisit.location,
              purpose: updatedVisit.purpose,
              notes: updatedVisit.notes
          }).eq('id', updatedVisit.id);
      }
  };

  const handleDeleteSiteVisit = async (visitId: string) => {
      setSiteVisits(prev => prev.filter(sv => sv.id !== visitId));
      if (isOnline) await supabase.from('site_visits').delete().eq('id', visitId);
  };

  const handleAddAttendanceException = async (exceptionData: Omit<AttendanceException, 'id'>) => {
      const payload = {
          student_id: exceptionData.studentId,
          date: exceptionData.date,
          reason: exceptionData.reason,
          type: exceptionData.type
      };
      const { data } = await supabase.from('attendance_exceptions').insert(payload).select().single();
      if (data) setAttendanceExceptions(prev => [...prev, mapAttendanceException(data)]);
  };

  const handleDeleteAttendanceException = async (id: string) => {
      const { error } = await supabase.from('attendance_exceptions').delete().eq('id', id);
      if (!error) setAttendanceExceptions(prev => prev.filter(ae => ae.id !== id));
  };

  const myNotifications = useMemo(() => {
      if (!currentUser) return [];
      return notifications.filter(n => n.recipientId === 'ALL' || n.recipientId === currentUser.id)
          .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications, currentUser]);
  
  const unreadCount = myNotifications.filter(n => !n.read).length;

  if (isAuthLoading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400">
              <Loader2 className="animate-spin mb-4" size={48} />
              <p className="text-sm font-medium">Initializing Application...</p>
          </div>
      );
  }

  // Safety fallback
  if (isAuthenticated && !currentUser) {
       return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 text-rose-600 p-8 text-center">
              <AlertTriangle className="mb-4" size={48} />
              <h2 className="text-xl font-bold mb-2">Account State Error</h2>
              <p className="mb-4">You are authenticated but your user profile could not be loaded.</p>
              <button 
                  onClick={handleLogout}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
              >
                  Reset & Sign Out
              </button>
          </div>
       );
  }

  if (!isAuthenticated || !currentUser) {
      return (
          <Auth 
            onLogin={handleLogin} 
            onRegister={handleRegister} 
            onResetPassword={handlePasswordReset}
            getUserByEmail={getUserByEmail}
            loginError={loginError}
            setLoginError={setLoginError}
          />
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
               <img src="https://i.postimg.cc/xdsSw8X5/DEEP_SHIFT_LOGOOO.png" alt="Deep Shift Logo" className="h-10 w-auto" />
               <span className="text-xl font-bold text-slate-900 tracking-tight hidden md:block">{APP_NAME}</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative" ref={notifDropdownRef}>
                    <button 
                        onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                        className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-colors"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                            </span>
                        )}
                    </button>

                    {isNotifDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 py-2 animate-in fade-in zoom-in-95 z-50">
                            <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={() => setNotifications(prev => prev.map(n => ({...n, read:true})))} className="text-xs text-indigo-600 hover:underline">
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {myNotifications.length === 0 ? (
                                    <div className="p-4 text-center text-slate-400 text-sm">No notifications</div>
                                ) : (
                                    myNotifications.map(notif => (
                                        <div 
                                            key={notif.id} 
                                            className={`px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none cursor-pointer ${!notif.read ? 'bg-indigo-50/50' : ''}`}
                                            onClick={() => markNotificationRead(notif.id)}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`mt-1 flex-shrink-0 p-1.5 rounded-full h-fit ${notif.type === NotificationType.ANNOUNCEMENT ? 'bg-purple-100 text-purple-600' : notif.type === NotificationType.ALERT ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {notif.type === NotificationType.ANNOUNCEMENT ? <Megaphone size={14}/> : notif.type === NotificationType.ALERT ? <X size={14}/> : <Info size={14}/>}
                                                </div>
                                                <div>
                                                    <h4 className={`text-sm ${!notif.read ? 'font-bold text-slate-800' : 'font-medium text-slate-700'}`}>{notif.title}</h4>
                                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                                    <span className="text-[10px] text-slate-400 mt-1 block">
                                                        {new Date(notif.timestamp).toLocaleDateString()} • {new Date(notif.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-medium text-slate-900">{currentUser.name}</span>
                    <span className="text-xs text-slate-500 font-mono uppercase">{currentUser.role}</span>
                </div>
                <img 
                    src={currentUser.avatar} 
                    alt="Profile" 
                    className="h-10 w-10 rounded-full ring-2 ring-white shadow-sm"
                />
                <div className="h-8 w-px bg-slate-200 mx-2"></div>
                
                <button 
                    onClick={switchRole}
                    className="hidden lg:block text-xs bg-slate-100 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                >
                    Switch Persona (Demo)
                </button>
                <button 
                    onClick={handleLogout}
                    className="text-xs bg-slate-800 text-white px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
                >
                    <LogOut size={14} /> <span className="hidden md:inline">Logout</span>
                </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentUser.role === Role.ADMIN ? (
          <AdminPortal
            currentUser={currentUser}
            users={users}
            logs={logs}
            tasks={tasksWithComments}
            resources={resources}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateIntern}
            onDeleteUser={handleDeleteUser}
            onAddResource={handleAddResource}
            onAddComment={handleAddTaskComment}
          />
        ) : currentUser.role === Role.STUDENT ? (
            <StudentPortal 
                user={currentUser} 
                users={users}
                logs={logs} 
                tasks={tasksWithComments} 
                reports={reports}
                goals={goals}
                resources={resources}
                evaluations={evaluations}
                messages={messages}
                meetings={meetings}
                skills={skills}
                skillAssessments={skillAssessments}
                badges={badges}
                userBadges={userBadges}
                leaveRequests={leaveRequests}
                siteVisits={siteVisits}
                onAddLog={handleAddLog}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onAddReport={handleAddReport}
                onUpdateGoal={handleUpdateGoal}
                onSubmitDeliverable={handleSubmitDeliverable}
                onSendMessage={handleSendMessage}
                onAddSkillAssessment={handleAddSkillAssessment}
                onUpdateProfile={handleUpdateProfile}
                onAddLeaveRequest={handleAddLeaveRequest}
                onAddSiteVisit={handleAddSiteVisit}
                onAddComment={handleAddTaskComment}
            />
        ) : (
            <SupervisorPortal 
                user={currentUser}
                users={users}
                logs={logs}
                tasks={tasksWithComments}
                reports={reports}
                goals={goals}
                resources={resources}
                evaluations={evaluations}
                messages={messages}
                meetings={meetings}
                skills={skills}
                skillAssessments={skillAssessments}
                badges={badges}
                userBadges={userBadges}
                leaveRequests={leaveRequests}
                siteVisits={siteVisits}
                attendanceExceptions={attendanceExceptions}
                onApproveLog={handleApproveLog}
                onAddTask={handleAddTask}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onAddIntern={handleAddIntern}
                onUpdateIntern={handleUpdateIntern}
                onAddGoal={handleAddGoal}
                onUpdateGoal={handleUpdateGoal}
                onDeleteGoal={handleDeleteGoal}
                onAddResource={handleAddResource}
                onGiveFeedback={handleGiveFeedback}
                onAddEvaluation={handleAddEvaluation}
                onSendMessage={handleSendMessage}
                onScheduleMeeting={handleScheduleMeeting}
                onAddSkillAssessment={handleAddSkillAssessment}
                onAddSkill={handleAddSkill}
                onSendNotification={handleSendNotification}
                onUpdateLeaveStatus={handleUpdateLeaveStatus}
                onAddSiteVisit={handleAddSiteVisit}
                onUpdateSiteVisit={handleUpdateSiteVisit}
                onDeleteSiteVisit={handleDeleteSiteVisit}
                onAddAttendanceException={handleAddAttendanceException}
                onDeleteAttendanceException={handleDeleteAttendanceException}
                onAddComment={handleAddTaskComment}
            />
        )}
      </main>

      {/* Offline / Sync Banner */}
      {(!isOnline || pendingActions.length > 0) && (
        <div className={`fixed bottom-0 left-0 right-0 py-3 px-4 text-center text-sm z-50 flex items-center justify-center gap-3 shadow-lg border-t animate-in slide-in-from-bottom duration-300 ${isOnline ? 'bg-amber-100 text-amber-900 border-amber-200' : 'bg-slate-800 text-white border-slate-700'}`}>
            {!isOnline ? (
                <>
                    <WifiOff size={18} className="text-rose-400" />
                    <span className="font-medium">You are offline. Changes saved locally.</span>
                </>
            ) : (
                 <>
                    {isSyncing ? (
                        <>
                            <RefreshCw size={18} className="animate-spin text-indigo-600" />
                            <span className="font-medium">Syncing data with cloud...</span>
                        </>
                    ) : (
                         <>
                            <CloudOff size={18} className="text-amber-600" />
                            <span className="font-medium">{pendingActions.length} changes pending sync.</span>
                            <button 
                                onClick={syncData}
                                className="ml-2 px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-md text-xs font-bold transition-colors"
                            >
                                Sync Now
                            </button>
                        </>
                    )}
                </>
            )}
        </div>
      )}
    </div>
  );
}

export default App;