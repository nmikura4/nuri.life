import React, { useState, useEffect, useMemo } from 'react';
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

function App() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState(['Work', 'Personal', 'Shopping']);
  const [priorities, setPriorities] = useState(['low', 'medium', 'high']);
  const [statuses, setStatuses] = useState(['todo', 'progress', 'done']);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('home');
  const [viewMode, setViewMode] = useState('list');
  const [selectedDate, setSelectedDate] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  
  // New States for Sorting & Filtering
  const [showDone, setShowDone] = useState(false);
  const [sortBy, setSortBy] = useState('date_asc');
  const [calendarType, setCalendarType] = useState('weekly');

  const onToggleCalendar = () => {
    setCalendarType(prev => (prev === 'weekly' ? 'mini' : 'weekly'));
  };

  // Load data & theme
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('nuri-tasks');
      if (savedTasks) setTasks(JSON.parse(savedTasks));

      const savedProjects = localStorage.getItem('nuri-projects');
      if (savedProjects) setProjects(JSON.parse(savedProjects));

      const savedTheme = localStorage.getItem('nuri-theme');
      if (savedTheme) {
        setTheme(savedTheme);
      }

      const savedPriorities = localStorage.getItem('nuri-priorities');
      if (savedPriorities) setPriorities(JSON.parse(savedPriorities));

      const savedStatuses = localStorage.getItem('nuri-statuses');
      if (savedStatuses) setStatuses(JSON.parse(savedStatuses));

      const savedAvatar = localStorage.getItem('nuri-avatar');
      if (savedAvatar) setAvatarUrl(savedAvatar);
    } catch (e) {
      console.error("Storage error:", e);
    }
    setIsLoaded(true);
  }, []);

  // Save tasks and projects
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('nuri-tasks', JSON.stringify(tasks));
        localStorage.setItem('nuri-projects', JSON.stringify(projects));
        localStorage.setItem('nuri-priorities', JSON.stringify(priorities));
        localStorage.setItem('nuri-statuses', JSON.stringify(statuses));
        if (avatarUrl) {
          localStorage.setItem('nuri-avatar', avatarUrl);
        } else {
          localStorage.removeItem('nuri-avatar');
        }
      } catch (e) {
        console.error("Storage error:", e);
      }
    }
  }, [tasks, projects, priorities, statuses, avatarUrl, isLoaded]);

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('nuri-theme', newTheme);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const handleOpenNewTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData) => {
    setTasks(prev => {
      const existing = prev.find(t => t.id === taskData.id);
      if (existing) return prev.map(t => t.id === taskData.id ? taskData : t);
      return [taskData, ...prev];
    });
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

  const updateTaskStatus = (id, newStatus) => {
    setTasks(prev => {
      const taskIndex = prev.findIndex(t => t.id === id || t.id.toString() === id.toString());
      if (taskIndex === -1) return prev;

      const task = prev[taskIndex];
      if (task.status === newStatus) return prev;

      const isBecomingDone = newStatus === (statuses.length > 0 ? statuses[statuses.length - 1] : 'done');

      let updatedTasks = [...prev];
      updatedTasks[taskIndex] = { ...task, status: newStatus };

      if (isBecomingDone && task.recurrence && task.recurrence !== 'none') {
        const nextDeadline = calculateNextDeadline(task.deadline, task.recurrence);
        if (nextDeadline) {
          const newTask = {
            ...task,
            id: crypto.randomUUID(),
            status: statuses[0] || 'todo',
            deadline: nextDeadline,
            subtasks: task.subtasks ? task.subtasks.map(s => ({ ...s, isCompleted: false })) : []
          };
          updatedTasks = [newTask, ...updatedTasks];
        }
      }

      return updatedTasks;
    });
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
    setProjects(prev => prev.map(p => p === oldName ? newName : p));
    setTasks(prev => prev.map(t => t.project === oldName ? { ...t, project: newName } : t));
  };

  const handleDeleteProject = (proj) => {
    setProjects(prev => prev.filter(p => p !== proj));
    setTasks(prev => prev.map(t => t.project === proj ? { ...t, project: '' } : t));
  };

  const handleRenamePriority = (oldName, newName) => {
    if (priorities.includes(newName)) return;
    setPriorities(prev => prev.map(p => p === oldName ? newName : p));
    setTasks(prev => prev.map(t => t.priority === oldName ? { ...t, priority: newName } : t));
  };

  const handleDeletePriority = (pri) => {
    setPriorities(prev => prev.filter(p => p !== pri));
    const fallback = priorities.filter(p => p !== pri)[0] || 'low';
    setTasks(prev => prev.map(t => t.priority === pri ? { ...t, priority: fallback } : t));
  };

  const handleRenameStatus = (oldName, newName) => {
    if (statuses.includes(newName)) return;
    setStatuses(prev => prev.map(s => s === oldName ? newName : s));
    setTasks(prev => prev.map(t => t.status === oldName ? { ...t, status: newName } : t));
  };

  const handleDeleteStatus = (stat) => {
    setStatuses(prev => prev.filter(s => s !== stat));
    const fallback = statuses.filter(s => s !== stat)[0] || 'todo';
    setTasks(prev => prev.map(t => t.status === stat ? { ...t, status: fallback } : t));
  };

  // Filtering & Sorting
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Filter out Done tasks if showDone is false, unless in Kanban view
    if (!showDone && !(activeTab === 'home' && viewMode === 'kanban')) {
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
  }, [tasks, searchQuery, selectedDate, showDone, sortBy, activeTab, viewMode]);

  return (
    <>
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="app-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '80px 30px 30px 30px', display: 'flex', gap: '30px', minHeight: '100vh' }}>
        <Sidebar theme={theme} onThemeChange={handleThemeChange} activeTab={activeTab} setActiveTab={setActiveTab} avatarUrl={avatarUrl} />

        {activeTab === 'settings' ? (
          <SettingsView 
            projects={projects} setProjects={setProjects} onRenameProject={handleRenameProject} onDeleteProject={handleDeleteProject}
            priorities={priorities} setPriorities={setPriorities} onRenamePriority={handleRenamePriority} onDeletePriority={handleDeletePriority}
            statuses={statuses} setStatuses={setStatuses} onRenameStatus={handleRenameStatus} onDeleteStatus={handleDeleteStatus}
            avatarUrl={avatarUrl} setAvatarUrl={setAvatarUrl}
          />
        ) : activeTab === 'finances' ? (
          <FinancesView />
        ) : activeTab === 'notes' ? (
          <NotesView />
        ) : activeTab === 'habits' ? (
          <HabitsView />
        ) : (
          <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <WelcomeCard 
              onAddTask={handleOpenNewTask} 
              tasksCount={tasks.filter(t => t.status !== (statuses.length > 0 ? statuses[statuses.length - 1] : 'done')).length}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              viewMode={activeTab === 'tasks' ? 'list' : viewMode}
              setViewMode={activeTab === 'tasks' ? null : setViewMode}
              theme={theme}
              onThemeChange={handleThemeChange}
              sortBy={sortBy}
              setSortBy={setSortBy}
              showDone={showDone}
              setShowDone={setShowDone}
            />
            
            {activeTab === 'tasks' ? (
              <TaskList 
                tasks={filteredTasks} 
                onEditTask={(t) => { setEditingTask(t); setIsModalOpen(true); }} 
                onToggleStatus={handleToggleTaskStatus}
                showDone={showDone}
                setShowDone={setShowDone}
                sortBy={sortBy}
                setSortBy={setSortBy}
                statuses={statuses}
              />
            ) : viewMode === 'list' ? (
              <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignContent: 'start' }}>
                <TaskList 
                  tasks={filteredTasks} 
                  onEditTask={(t) => { setEditingTask(t); setIsModalOpen(true); }} 
                  onToggleStatus={handleToggleTaskStatus}
                  showDone={showDone}
                  setShowDone={setShowDone}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  statuses={statuses}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  {calendarType === 'weekly' ? (
                    <WeeklyCalendarWidget tasks={tasks} onAddTask={handleOpenNewTask} selectedDate={selectedDate} onSelectDate={setSelectedDate} onToggleCalendar={() => setCalendarType('mini')} />
                  ) : (
                    <MiniCalendarWidget tasks={tasks} selectedDate={selectedDate} onSelectDate={setSelectedDate} onToggleCalendar={() => setCalendarType('weekly')} />
                  )}
                  <ProgressWidget tasks={tasks} statuses={statuses} />
                </div>
              </div>
            ) : (
              <KanbanView tasks={filteredTasks} setTasks={setTasks} onStatusChange={updateTaskStatus} onEditTask={(t) => { setEditingTask(t); setIsModalOpen(true); }} statuses={statuses} />
            )}
          </div>
        )}
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTask} 
        onDelete={(id) => setTasks(prev => prev.filter(t => t.id !== id))} 
        task={editingTask} 
        projects={projects}
        priorities={priorities}
        statuses={statuses}
      />
    </>
  );
}

export default App;
