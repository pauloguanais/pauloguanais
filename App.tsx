
import React, { useState, useEffect, useMemo } from 'react';
import { NAV_ITEMS, USERS, PROJECTS, TASKS, TEMPLATES } from './constants';
import { User, UserRole, Project, Task, TaskTemplate, TaskStatus } from './types';

// Helper to get initials from name
const getInitials = (name: string) => {
  if (!name) return '...';
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start pt-16" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b p-4 dark:border-gray-700">
          <h3 className="text-xl font-semibold dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => JSON.parse(localStorage.getItem('guan-users') || 'null') || USERS);
  const [projects, setProjects] = useState<Project[]>(() => JSON.parse(localStorage.getItem('guan-projects') || 'null') || PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(() => JSON.parse(localStorage.getItem('guan-tasks') || 'null') || TASKS);
  const [templates, setTemplates] = useState<TaskTemplate[]>(() => JSON.parse(localStorage.getItem('guan-templates') || 'null') || TEMPLATES);

  const [currentUser, setCurrentUser] = useState<User | null>(() => JSON.parse(sessionStorage.getItem('guan-currentUser') || 'null'));
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Modals state
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);


  // Form states
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({ name: '', email: '', phone: '', role: UserRole.COLLABORATOR, password: '' });
  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({ name: '', description: '' });
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'status' | 'createdAt'>>({ title: '', description: '', dueDate: '', assigneeId: '', projectId: '' });
  const [newTemplate, setNewTemplate] = useState<{name: string, tasks: Array<Omit<Task, 'id' | 'projectId' | 'createdAt' | 'status' | 'completedAt'>>}>({ name: '', tasks: [] });
  const [templateTask, setTemplateTask] = useState({ title: '', description: '', dueDate: '1' });

  // --- LOCALSTORAGE PERSISTENCE EFFECTS ---
  useEffect(() => { localStorage.setItem('guan-users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('guan-projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('guan-tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('guan-templates', JSON.stringify(templates)); }, [templates]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      sessionStorage.setItem('guan-currentUser', JSON.stringify(user));
      setError('');
    } else {
      setError('Credenciais inválidas. Tente "paulo@guanais.com.br" / "PauloP27" ou "bruno.costa@example.com" / "user".');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('guan-currentUser');
    setEmail('');
    setPassword('');
  };

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => {
        if (task.id === taskId) {
            const isDone = task.status === TaskStatus.DONE;
            return {
                ...task,
                status: isDone ? TaskStatus.TODO : TaskStatus.DONE,
                completedAt: isDone ? undefined : new Date().toISOString()
            };
        }
        return task;
    }));
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUsers([...users, { id: crypto.randomUUID(), ...newUser }]);
    setNewUser({ name: '', email: '', phone: '', role: UserRole.COLLABORATOR, password: '' });
    setUserModalOpen(false);
  };
  
  const handleDeleteUser = (userId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este colaborador? As tarefas atribuídas a ele ficarão sem responsável.')) return;
    if (currentUser?.id === userId) {
        alert("Você não pode excluir sua própria conta.");
        return;
    }
    setUsers(users.filter(u => u.id !== userId));
    setTasks(tasks.map(t => (t.assigneeId === userId ? { ...t, assigneeId: '' } : t)));
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    setProjects([...projects, { id: crypto.randomUUID(), ...newProject }]);
    setNewProject({ name: '', description: '' });
    setProjectModalOpen(false);
  };

  const handleDeleteProject = (projectId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este projeto? Todas as tarefas associadas também serão excluídas.')) return;
    setProjects(projects.filter(p => p.id !== projectId));
    setTasks(tasks.filter(t => t.projectId !== projectId));
  };
  
  const handleCreateTask = (e: React.FormEvent) => {
      e.preventDefault();
      const taskToAdd: Task = {
        id: crypto.randomUUID(),
        ...newTask,
        status: TaskStatus.TODO,
        createdAt: new Date().toISOString()
      };
      setTasks([...tasks, taskToAdd]);
      setNewTask({ title: '', description: '', dueDate: '', assigneeId: '', projectId: '' });
      setTaskModalOpen(false);
  };

  const handleDeleteTask = (taskId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleAddTemplateTask = () => {
      if (!templateTask.title || !templateTask.dueDate) return;
      setNewTemplate({
          ...newTemplate,
          tasks: [...newTemplate.tasks, { ...templateTask, assigneeId: '' }],
      });
      setTemplateTask({ title: '', description: '', dueDate: '1' });
  };

  const handleRemoveTemplateTask = (index: number) => {
      setNewTemplate({
          ...newTemplate,
          tasks: newTemplate.tasks.filter((_, i) => i !== index),
      });
  };

  const handleCloseTemplateModal = () => {
    setTemplateModalOpen(false);
    setEditingTemplate(null);
    setNewTemplate({ name: '', tasks: [] });
    setTemplateTask({ title: '', description: '', dueDate: '1' });
  };

  const handleOpenEditTemplateModal = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setNewTemplate({ name: template.name, tasks: [...template.tasks] });
    setTemplateModalOpen(true);
  };
  
  const handleSaveTemplate = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTemplate.name || newTemplate.tasks.length === 0) return;

      if (editingTemplate) {
          setTemplates(templates.map(t =>
              t.id === editingTemplate.id ? { ...t, name: newTemplate.name, tasks: newTemplate.tasks } : t
          ));
      } else {
        const templateToAdd: TaskTemplate = {
            id: crypto.randomUUID(),
            name: newTemplate.name,
            tasks: newTemplate.tasks,
        };
        setTemplates([...templates, templateToAdd]);
      }
      handleCloseTemplateModal();
  };

  const handleDeleteTemplate = (templateId: string) => {
      if (!window.confirm('Tem certeza que deseja excluir este modelo?')) return;
      setTemplates(templates.filter(t => t.id !== templateId));
  };

  const visibleNavItems = useMemo(() => {
    if (!currentUser) return [];
    return NAV_ITEMS.filter(item => !item.adminOnly || currentUser.role === UserRole.ADMIN);
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-center text-gray-900">GUANAIS TASK</h2>
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
              <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
              <label htmlFor="password"  className="text-sm font-medium text-gray-700">Senha</label>
              <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="w-full py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  const renderPage = () => {
     switch (currentPage) {
      case 'home':
        const myTasks = tasks.filter(t => t.assigneeId === currentUser.id || (currentUser.role === UserRole.ADMIN && t.assigneeId));
        const overdueTasks = myTasks.filter(t => new Date(t.dueDate) < new Date() && t.status === TaskStatus.TODO);
        const todayTasks = myTasks.filter(t => new Date(t.dueDate).toDateString() === new Date().toDateString() && t.status === TaskStatus.TODO);
        const upcomingTasks = myTasks.filter(t => new Date(t.dueDate) > new Date() && new Date(t.dueDate).toDateString() !== new Date().toDateString() && t.status === TaskStatus.TODO);

        return (
          <div>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-semibold dark:text-white">Minhas Tarefas</h2>
                 <button onClick={() => setTaskModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Nova Tarefa</button>
            </div>
            <div className="space-y-6">
                {[
                  ['Atrasadas', overdueTasks], 
                  ['Para Hoje', todayTasks], 
                  ['Próximas', upcomingTasks]
                ].map(([title, taskList]) => (
                    <div key={title as string}>
                        <h3 className="text-lg font-medium mb-2 dark:text-gray-300">{title as string} ({taskList.length})</h3>
                        <div className="space-y-2">
                            {taskList.length > 0 ? taskList.map(task => (
                                <div key={task.id} className={`flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 ${new Date(task.dueDate) < new Date() && task.status === TaskStatus.TODO ? 'border-red-500' : 'border-transparent'}`}>
                                    <button onClick={() => toggleTaskStatus(task.id)} className="mr-4">
                                        {task.status === TaskStatus.DONE ? (
                                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        ) : (
                                            <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" style={{opacity: 0.3}}></path></svg>
                                        )}
                                    </button>
                                    <div className="flex-1">
                                        <p className="font-medium dark:text-white">{task.title}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{projects.find(p => p.id === task.projectId)?.name} - Vence: {new Date(task.dueDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">{users.find(u => u.id === task.assigneeId)?.name}</div>
                                </div>
                            )) : <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma tarefa aqui.</p>}
                        </div>
                    </div>
                ))}
            </div>
          </div>
        );
      case 'collaborators':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-semibold dark:text-white">Colaboradores</h2>
                 <button onClick={() => setUserModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Adicionar Colaborador</button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                 <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map(user => (
                        <li key={user.id} className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-medium dark:text-white">{user.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email} - {user.role}</p>
                            </div>
                            <div>
                                <button className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                                <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                            </div>
                        </li>
                    ))}
                 </ul>
            </div>
          </div>
        );
      case 'projects':
         return (
          <div>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-semibold dark:text-white">Projetos</h2>
                 {currentUser.role === UserRole.ADMIN && <button onClick={() => setProjectModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Novo Projeto</button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex flex-col justify-between">
                        <div>
                             <h3 className="font-semibold text-lg dark:text-white">{project.name}</h3>
                             <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">{project.description}</p>
                        </div>
                         <div className="mt-4 flex justify-end space-x-2">
                            <button onClick={() => setViewingProject(project)} className="text-sm text-indigo-600 hover:underline">Ver Tarefas</button>
                            {currentUser.role === UserRole.ADMIN && <button onClick={() => handleDeleteProject(project.id)} className="text-sm text-red-600 hover:underline">Excluir</button>}
                         </div>
                    </div>
                ))}
            </div>
          </div>
        );
       case 'templates':
        return (
            <div>
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold dark:text-white">Modelos de Tarefas</h2>
                    <button onClick={() => setTemplateModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Novo Modelo</button>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {templates.map(template => (
                         <li key={template.id} className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-medium dark:text-white">{template.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{template.tasks.length} tarefas</p>
                            </div>
                            <div>
                                <button onClick={() => handleOpenEditTemplateModal(template)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                                <button onClick={() => handleDeleteTemplate(template.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                            </div>
                        </li>
                    ))}
                    </ul>
                </div>
            </div>
        );
      case 'reports':
        const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE);
        return (
            <div>
                <h2 className="text-2xl font-semibold dark:text-white mb-6">Relatórios de Tarefas Concluídas</h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {completedTasks.length > 0 ? completedTasks.map(task => (
                             <li key={task.id} className="p-4">
                                <p className="font-medium dark:text-white">{task.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Concluída por: {users.find(u => u.id === task.assigneeId)?.name || 'N/A'} em {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </li>
                        )) : (
                            <li className="p-4 text-center text-gray-500 dark:text-gray-400">Nenhuma tarefa concluída ainda.</li>
                        )}
                    </ul>
                </div>
            </div>
        );
      default:
        return <h2>Home</h2>;
    }
  };
  
  const formInputStyle = "w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white";
  const formLabelStyle = "text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <nav className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold">GUANAIS TASK</h1>
        </div>
        <ul className="flex-1 p-4 space-y-2">
          {visibleNavItems.map(item => (
            <li key={item.page}>
                <a href="#"
                   className={`flex items-center p-2 text-base font-normal rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 ${currentPage === item.page ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                   onClick={(e) => { e.preventDefault(); setCurrentPage(item.page); }}>
                    {item.name}
                </a>
            </li>
          ))}
        </ul>
      </nav>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div></div> {/* Placeholder for potential breadcrumbs */}
            <div className="flex items-center space-x-4">
                <button onClick={toggleTheme}>
                     {theme === 'light' ? 
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg> : 
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                     }
                </button>
                <div className="relative">
                    <button className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                            {getInitials(currentUser.name)}
                        </div>
                        <span className="hidden md:inline">{currentUser.name}</span>
                    </button>
                </div>
                 <button onClick={handleLogout} className="text-sm text-gray-600 dark:text-gray-400 hover:underline">Sair</button>
            </div>
        </header>
        <div className="flex-1 p-6 overflow-y-auto">
            {renderPage()}
        </div>
      </main>

      <Modal isOpen={isTaskModalOpen} onClose={() => setTaskModalOpen(false)} title="Nova Tarefa">
        <form onSubmit={handleCreateTask} className="space-y-4">
           <div><label className={formLabelStyle}>Título</label><input type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required className={formInputStyle}/></div>
           <div><label className={formLabelStyle}>Descrição</label><textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} className={formInputStyle}/></div>
           <div><label className={formLabelStyle}>Data de Vencimento</label><input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} required className={formInputStyle}/></div>
           <div><label className={formLabelStyle}>Responsável</label><select value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value})} required className={formInputStyle}><option value="">Selecione...</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
           <div><label className={formLabelStyle}>Projeto</label><select value={newTask.projectId} onChange={e => setNewTask({...newTask, projectId: e.target.value})} required className={formInputStyle}><option value="">Selecione...</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
           <div className="flex justify-end pt-4"><button type="submit" className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Criar Tarefa</button></div>
        </form>
      </Modal>

      <Modal isOpen={isUserModalOpen} onClose={() => setUserModalOpen(false)} title="Adicionar Colaborador">
        <form onSubmit={handleCreateUser} className="space-y-4">
           <div><label className={formLabelStyle}>Nome Completo</label><input type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required className={formInputStyle}/></div>
           <div><label className={formLabelStyle}>Email</label><input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required className={formInputStyle}/></div>
           <div><label className={formLabelStyle}>Telefone</label><input type="tel" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} className={formInputStyle}/></div>
           <div><label className={formLabelStyle}>Senha</label><input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required className={formInputStyle}/></div>
           <div><label className={formLabelStyle}>Cargo</label><select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})} required className={formInputStyle}><option value={UserRole.COLLABORATOR}>Colaborador</option><option value={UserRole.ADMIN}>Admin</option></select></div>
           <div className="flex justify-end pt-4"><button type="submit" className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Adicionar</button></div>
        </form>
      </Modal>

      <Modal isOpen={isProjectModalOpen} onClose={() => setProjectModalOpen(false)} title="Novo Projeto">
        <form onSubmit={handleCreateProject} className="space-y-4">
            <div><label className={formLabelStyle}>Nome do Projeto</label><input type="text" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} required className={formInputStyle}/></div>
            <div><label className={formLabelStyle}>Descrição</label><textarea value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} className={formInputStyle}/></div>
            <div className="flex justify-end pt-4"><button type="submit" className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Criar Projeto</button></div>
        </form>
      </Modal>
      
      <Modal isOpen={isTemplateModalOpen} onClose={handleCloseTemplateModal} title={editingTemplate ? "Editar Modelo" : "Novo Modelo de Tarefas"}>
        <form onSubmit={handleSaveTemplate} className="space-y-4">
            <div><label className={formLabelStyle}>Nome do Modelo</label><input type="text" value={newTemplate.name} onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })} required className={formInputStyle}/></div>
            <div className="border-t dark:border-gray-700 pt-4 mt-4">
                <h4 className="font-medium mb-2 dark:text-white">Tarefas do Modelo</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {newTemplate.tasks.map((task, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded">
                            <span className="text-sm">{task.title} (Vence em {task.dueDate} dias)</span>
                            <button type="button" onClick={() => handleRemoveTemplateTask(index)} className="text-red-500 text-xs">Remover</button>
                        </div>
                    ))}
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t dark:border-gray-700 pt-4">
                    <div><label className={formLabelStyle}>Título da Tarefa</label><input type="text" value={templateTask.title} onChange={e => setTemplateTask({...templateTask, title: e.target.value})} className={formInputStyle}/></div>
                    <div><label className={formLabelStyle}>Descrição</label><input type="text" value={templateTask.description} onChange={e => setTemplateTask({...templateTask, description: e.target.value})} className={formInputStyle}/></div>
                    <div><label className={formLabelStyle}>Vencimento em (dias)</label><input type="number" min="1" value={templateTask.dueDate} onChange={e => setTemplateTask({...templateTask, dueDate: e.target.value})} className={formInputStyle}/></div>
                    <div className="self-end"><button type="button" onClick={handleAddTemplateTask} className="w-full px-4 py-2 text-sm text-white bg-gray-500 rounded-md hover:bg-gray-600">Adicionar Tarefa ao Modelo</button></div>
                </div>
            </div>
            <div className="flex justify-end pt-4"><button type="submit" className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">{editingTemplate ? "Salvar Alterações" : "Criar Modelo"}</button></div>
        </form>
      </Modal>

      <Modal isOpen={!!viewingProject} onClose={() => setViewingProject(null)} title={`Tarefas de "${viewingProject?.name}"`}>
         <div className="space-y-3">
            {tasks.filter(t => t.projectId === viewingProject?.id).length > 0 ? (
                tasks.filter(t => t.projectId === viewingProject?.id).map(task => (
                    <div key={task.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg justify-between">
                         <div>
                            <p className={`font-medium dark:text-white ${task.status === TaskStatus.DONE ? 'line-through' : ''}`}>{task.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Responsável: {users.find(u => u.id === task.assigneeId)?.name || 'Ninguém'} - Vence: {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                        </div>
                        {currentUser.role === UserRole.ADMIN && (
                            <button onClick={() => handleDeleteTask(task.id)} className="text-xs text-red-500 hover:text-red-700">Excluir</button>
                        )}
                    </div>
                ))
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">Nenhuma tarefa neste projeto.</p>
            )}
        </div>
      </Modal>

    </div>
  );
};

export default App;
