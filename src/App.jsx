import { useState, useEffect, useMemo } from 'react';
import { collection, doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import AuthView from './components/Auth/AuthView';
import CornerThemeSwitcher from './components/UI/CornerThemeSwitcher';

import Sidebar from './components/Sidebar';
import WelcomeCard from './components/Dashboard/WelcomeCard';
import TaskList from './components/Dashboard/TaskList';
import { ProgressWidget, MiniCalendarWidget, WeeklyCalendarWidget } from './components/Dashboard/Widgets';
import TaskModal from './components/Dashboard/TaskModal';
import SettingsView from './components/Settings/SettingsView';
import KanbanView from './components/Kanban/KanbanView';
import FinancesView from './components/Finances/FinancesView';
import NotesView from './components/Notes/NotesView';
import HabitsView from './components/Habits/HabitsView';
import { AIAssistantProvider } from './context/AIAssistantContext';
import AICoachView from './components/AI/AICoachView';
import ChatInterface from './components/AI/ChatInterface';
import { Brain, X } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [projects, setProjects] = useState(['Work', 'Personal', 'Shopping']);
  const [priorities, setPriorities] = useState(['low', 'medium', 'high']);
  const [statuses, setStatuses] = useState(['todo', 'progress', 'done']);
  const [theme, setTheme] = useState(() => localStorage.getItem('nuri_theme') || 'light');
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('nuri_avatar') || null);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  
  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [sortBy, setSortBy] = useState('date_asc');
  const [showDone, setShowDone] = useState(false);
  const [calendarType, setCalendarType] = useState('weekly');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isSidebarMenuOpen, setIsSidebarMenuOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
    localStorage.setItem('nuri_theme', theme);
  }, [theme]);

  // Auth & DB Initialization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load data from Firebase
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    const unsubSettings = onSnapshot(doc(db, "users", user.uid, "settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.projects) setProjects(data.projects);
        if (data.priorities) setPriorities(data.priorities);
        if (data.statuses) setStatuses(data.statuses);
        if (data.theme) {
          setTheme(data.theme);
          localStorage.setItem('nuri_theme', data.theme);
        }
        if (data.avatarUrl !== undefined) {
          setAvatarUrl(data.avatarUrl);
          if (data.avatarUrl) localStorage.setItem('nuri_avatar', data.avatarUrl);
          else localStorage.removeItem('nuri_avatar');
        }
        if (data.geminiApiKey !== undefined) setGeminiApiKey(data.geminiApiKey);
      } else {
        setDoc(doc(db, "users", user.uid, "settings", "global"), {
          projects: ['Work', 'Personal', 'Shopping'],
          priorities: ['low', 'medium', 'high'],
          statuses: ['todo', 'progress', 'done'],
          theme: 'light',
          avatarUrl: null,
          geminiApiKey: ''
        });
      }
    });

    const unsubTasks = onSnapshot(collection(db, "users", user.uid, "tasks"), (snapshot) => {
      const loadedTasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setTasks(loadedTasks);
    }, (error) => {
      alert("Ошибка чтения задач: " + error.message);
      console.error(error);
    });

    const unsubNotes = onSnapshot(collection(db, "users", user.uid, "notes"), (snapshot) => {
      const loadedNotes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      loadedNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setNotes(loadedNotes);
    }, (error) => {
      console.error("Ошибка чтения заметок:", error);
    });

    return () => {
      unsubSettings();
      unsubTasks();
      unsubNotes();
    };
  }, [user]);

  const syncSettings = (updates) => {
    if (!user) return;
    setDoc(doc(db, "users", user.uid, "settings", "global"), updates, { merge: true }).catch(console.error);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    syncSettings({ theme: newTheme });
  };
  const handleOpenNewTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    if (!user) return;
    try {
      const id = taskData.id || crypto.randomUUID();
      const updatedTask = { ...taskData, id };
      await setDoc(doc(db, "users", user.uid, "tasks", id.toString()), updatedTask);

      // Bidirectional sync for linkedNotes
      if (updatedTask.linkedNotes && Array.isArray(updatedTask.linkedNotes)) {
        updatedTask.linkedNotes.forEach(noteId => {
          const note = notes.find(n => n.id === noteId);
          if (note) {
            const currentLinkedTasks = Array.isArray(note.linkedTasks) ? note.linkedTasks : [];
            if (!currentLinkedTasks.includes(id)) {
              setDoc(doc(db, "users", user.uid, "notes", noteId.toString()), { 
                ...note, 
                linkedTasks: [...currentLinkedTasks, id] 
              });
            }
          }
        });
      }
    } catch (e) {
      alert("Ошибка при сохранении задачи: " + e.message);
      console.error(e);
    }
  };

  const handleSaveNote = async (noteData) => {
    if (!user) return;
    try {
      const id = noteData.id || crypto.randomUUID();
      const updatedNote = { ...noteData, id };
      await setDoc(doc(db, "users", user.uid, "notes", id.toString()), updatedNote);

      // Bidirectional sync for linkedTasks
      if (updatedNote.linkedTasks && Array.isArray(updatedNote.linkedTasks)) {
        updatedNote.linkedTasks.forEach(taskId => {
          const task = tasks.find(t => t.id === taskId);
          if (task) {
            const currentLinkedNotes = Array.isArray(task.linkedNotes) ? task.linkedNotes : [];
            if (!currentLinkedNotes.includes(id)) {
              setDoc(doc(db, "users", user.uid, "tasks", taskId.toString()), { 
                ...task, 
                linkedNotes: [...currentLinkedNotes, id] 
              });
            }
          }
        });
      }
    } catch (e) {
      console.error("Ошибка при сохранении заметки: ", e);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "notes", id.toString()));
    } catch (e) {
      console.error("Ошибка при удалении заметки: ", e);
    }
  };

  const calculateNextDeadline = (currentDeadlineStr, recurrence) => {
    if (!currentDeadlineStr) return null;
    const [y, m, d] = currentDeadlineStr.split('-');
    const date = new Date(y, m - 1, d);
    if (isNaN(date.getTime())) return null;

    if (recurrence === 'daily') {
      date.setDate(date.getDate() + 1);
    } else if (recurrence === 'weekly') {
      date.setDate(date.getDate() + 7);
    } else if (recurrence === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    } else if (recurrence === 'yearly') {
      date.setFullYear(date.getFullYear() + 1);
    } else {
      return null;
    }

    const ny = date.getFullYear();
    const nm = String(date.getMonth() + 1).padStart(2, '0');
    const nd = String(date.getDate()).padStart(2, '0');
    return `${ny}-${nm}-${nd}`;
  };

  const updateTaskStatus = async (id, newStatus) => {
    const task = tasks.find(t => t.id === id || t.id.toString() === id.toString());
    if (!task || task.status === newStatus) return;

    const isBecomingDone = newStatus === (statuses.length > 0 ? statuses[statuses.length - 1] : 'done');

    await setDoc(doc(db, "users", user?.uid, "tasks", id.toString()), { ...task, status: newStatus });

    if (isBecomingDone && task.recurrence && task.recurrence !== 'none') {
      const nextDeadline = calculateNextDeadline(task.deadline, task.recurrence);
      if (nextDeadline) {
        const newId = crypto.randomUUID();
        await setDoc(doc(db, "users", user?.uid, "tasks", newId.toString()), {
          ...task,
          id: newId,
          status: statuses[0] || 'todo',
          deadline: nextDeadline,
          subtasks: task.subtasks ? task.subtasks.map(s => ({ ...s, isCompleted: false })) : []
        });
      }
    }
  };

  const handleToggleTaskStatus = (id, e) => {
    if (e) e.stopPropagation();
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const isCurrentlyDone = statuses.length > 0 && task.status === statuses[statuses.length - 1];
    const newStatus = isCurrentlyDone ? (statuses[0] || 'todo') : (statuses[statuses.length - 1] || 'done');
    updateTaskStatus(id, newStatus);
  };

  const handleRenameProject = (oldName, newName) => {
    if (projects.includes(newName)) return;
    const updated = projects.map(p => p === oldName ? newName : p);
    syncSettings({ projects: updated });
    tasks.filter(t => t.project === oldName).forEach(t => {
      setDoc(doc(db, "users", user?.uid, "tasks", t.id.toString()), { ...t, project: newName });
    });
  };

  const handleDeleteProject = (proj) => {
    const updated = projects.filter(p => p !== proj);
    syncSettings({ projects: updated });
    tasks.filter(t => t.project === proj).forEach(t => {
      setDoc(doc(db, "users", user?.uid, "tasks", t.id.toString()), { ...t, project: '' });
    });
  };

  const handleRenamePriority = (oldName, newName) => {
    if (priorities.includes(newName)) return;
    const updated = priorities.map(p => p === oldName ? newName : p);
    syncSettings({ priorities: updated });
    tasks.filter(t => t.priority === oldName).forEach(t => {
      setDoc(doc(db, "users", user?.uid, "tasks", t.id.toString()), { ...t, priority: newName });
    });
  };

  const handleDeletePriority = (pri) => {
    const updated = priorities.filter(p => p !== pri);
    const fallback = updated[0] || 'low';
    syncSettings({ priorities: updated });
    tasks.filter(t => t.priority === pri).forEach(t => {
      setDoc(doc(db, "users", user?.uid, "tasks", t.id.toString()), { ...t, priority: fallback });
    });
  };

  const handleRenameStatus = (oldName, newName) => {
    if (statuses.includes(newName)) return;
    const updated = statuses.map(s => s === oldName ? newName : s);
    syncSettings({ statuses: updated });
    tasks.filter(t => t.status === oldName).forEach(t => {
      setDoc(doc(db, "users", user?.uid, "tasks", t.id.toString()), { ...t, status: newName });
    });
  };

  const handleDeleteStatus = (stat) => {
    const updated = statuses.filter(s => s !== stat);
    const fallback = updated[0] || 'todo';
    syncSettings({ statuses: updated });
    tasks.filter(t => t.status === stat).forEach(t => {
      setDoc(doc(db, "users", user?.uid, "tasks", t.id.toString()), { ...t, status: fallback });
    });
  };

  const handleSetAvatarUrl = (url) => {
    syncSettings({ avatarUrl: url });
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    if (date && sortBy === 'overdue') {
      setSortBy('date_asc');
    }
  };

  // Filtering & Sorting
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Filter out Done tasks if showDone is false, unless in Kanban view
    if (!showDone && !(location.pathname === '/' && viewMode === 'kanban')) {
      const doneStatus = statuses.length > 0 ? statuses[statuses.length - 1] : 'done';
      result = result.filter(t => t.status !== doneStatus);
    }

    // Filter by Date from Calendar
    if (selectedDate) {
      // Create local YYYY-MM-DD
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      result = result.filter(t => t.deadline === dateStr);
    }

    // Filter by Overdue
    if (sortBy === 'overdue') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      result = result.filter(t => {
        if (!t.deadline) return false;
        const [y, m, d] = t.deadline.split('-');
        const deadlineDate = new Date(y, m - 1, d);
        return deadlineDate < today;
      });
    }

    // Filter by Search Query
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(lowerQ) || 
        (t.desc && t.desc.toLowerCase().includes(lowerQ)) ||
        (t.project && t.project.toLowerCase().includes(lowerQ)) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(lowerQ)))
      );
    }

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'date_asc' || sortBy === 'overdue') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      } else if (sortBy === 'date_desc') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(b.deadline) - new Date(a.deadline);
      } else if (sortBy === 'priority') {
        const pMap = { high: 3, medium: 2, low: 1 };
        return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
      }
      return 0;
    });

    return result;
  }, [tasks, searchQuery, selectedDate, showDone, sortBy, location.pathname, viewMode, statuses]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (authLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-primary)' }}>Загрузка...</div>;
  }

  if (!user) {
    return (
      <>
        <div className="bg-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>
        <AuthView />
      </>
    );
  }

  return (
    <AIAssistantProvider apiKey={geminiApiKey} user={user} onSaveTask={handleSaveTask} onSaveNote={handleSaveNote}>
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="app-container" style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '30px', minHeight: '100vh' }}>
        <Sidebar theme={theme} onThemeChange={handleThemeChange} avatarUrl={avatarUrl} onLogout={handleLogout} onMenuToggle={setIsSidebarMenuOpen} />

        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', width: '100%' }}>
          <CornerThemeSwitcher theme={theme} onChange={handleThemeChange} />
          
          <Routes>
            <Route path="/" element={
              <div className="main-content dashboard-page" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <WelcomeCard 
                  onAddTask={handleOpenNewTask} 
                  tasksCount={tasks.filter(t => t.status !== (statuses.length > 0 ? statuses[statuses.length - 1] : 'done')).length}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  theme={theme}
                  onThemeChange={handleThemeChange}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  showDone={showDone}
                  setShowDone={setShowDone}
                />
                
                {viewMode === 'list' ? (
                  <div className="dashboard-grid">
                    <TaskList 
                      tasks={filteredTasks} 
                      onEditTask={(t) => { setEditingTask(t); setIsModalOpen(true); }} 
                      onToggleStatus={handleToggleTaskStatus}
                      showDone={showDone}
                      setShowDone={setShowDone}
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      statuses={statuses}
                      onClearDate={() => setSelectedDate(null)}
                    />
                    <div className="dashboard-right-col" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                      {calendarType === 'weekly' ? (
                        <WeeklyCalendarWidget tasks={tasks} onAddTask={handleOpenNewTask} selectedDate={selectedDate} onSelectDate={handleSelectDate} onToggleCalendar={() => setCalendarType('mini')} />
                      ) : (
                        <MiniCalendarWidget tasks={tasks} selectedDate={selectedDate} onSelectDate={handleSelectDate} onToggleCalendar={() => setCalendarType('weekly')} />
                      )}
                      <div className="progress-widget-container">
                        <ProgressWidget tasks={tasks} statuses={statuses} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <KanbanView tasks={filteredTasks} setTasks={setTasks} onStatusChange={updateTaskStatus} onEditTask={(t) => { setEditingTask(t); setIsModalOpen(true); }} statuses={statuses} />
                )}
              </div>
            } />

            <Route path="/tasks" element={
              <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <WelcomeCard 
                  onAddTask={handleOpenNewTask} 
                  tasksCount={tasks.filter(t => t.status !== (statuses.length > 0 ? statuses[statuses.length - 1] : 'done')).length}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  viewMode={'list'}
                  setViewMode={null}
                  theme={theme}
                  onThemeChange={handleThemeChange}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  showDone={showDone}
                  setShowDone={setShowDone}
                />
                <TaskList 
                  tasks={filteredTasks} 
                  onEditTask={(t) => { setEditingTask(t); setIsModalOpen(true); }} 
                  onToggleStatus={handleToggleTaskStatus}
                  showDone={showDone}
                  setShowDone={setShowDone}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  statuses={statuses}
                  onClearDate={() => setSelectedDate(null)}
                />
              </div>
            } />

            <Route path="/settings" element={
              <SettingsView 
                projects={projects} setProjects={(arr) => syncSettings({ projects: arr })} onRenameProject={handleRenameProject} onDeleteProject={handleDeleteProject}
                priorities={priorities} setPriorities={(arr) => syncSettings({ priorities: arr })} onRenamePriority={handleRenamePriority} onDeletePriority={handleDeletePriority}
                statuses={statuses} setStatuses={(arr) => syncSettings({ statuses: arr })} onRenameStatus={handleRenameStatus} onDeleteStatus={handleDeleteStatus}
                avatarUrl={avatarUrl} setAvatarUrl={handleSetAvatarUrl}
                geminiApiKey={geminiApiKey} setGeminiApiKey={(k) => { setGeminiApiKey(k); syncSettings({ geminiApiKey: k }); }}
              />
            } />

            <Route path="/finances" element={<FinancesView />} />
            <Route path="/notes" element={<NotesView tasks={tasks} notes={notes} onSaveNote={handleSaveNote} onDeleteNote={handleDeleteNote} />} />
            <Route path="/habits" element={<HabitsView />} />
            <Route path="/ai" element={<AICoachView />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        
        {/* Floating AI Button & Popup Container */}
        <div className="ai-chat-btn" style={{
          position: 'fixed',
          zIndex: 9999,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}>
          {/* AI Chat Popup */}
          {isAIChatOpen && (
            <div className="glass-panel ai-chat-modal" style={{
              animation: 'slideUp 0.3s ease',
              padding: 0,
              pointerEvents: 'auto',
            }}>
              <ChatInterface isPopup={true} />
            </div>
          )}

          <div style={{
            transform: isSidebarMenuOpen ? 'translateX(-80px)' : 'translateX(0)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <button 
              onClick={() => setIsAIChatOpen(!isAIChatOpen)}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-coral), var(--accent-pink))',
              color: 'white',
              border: 'none',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              pointerEvents: 'auto',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isAIChatOpen ? <X size={28} /> : <Brain size={28} />}
            </button>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Global Modals */}
      <TaskModal 
        isOpen={isModalOpen || !!editingTask} 
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }} 
        onSave={handleSaveTask} 
        onDelete={(id) => deleteDoc(doc(db, "users", user?.uid, "tasks", id.toString()))} 
        task={editingTask} 
        projects={projects}
        priorities={priorities}
        statuses={statuses}
        notes={notes}
      />
    </AIAssistantProvider>
  );
}

export default App;
