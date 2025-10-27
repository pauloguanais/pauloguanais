
import React, { useState, useEffect, useMemo } from 'react';
import { NAV_ITEMS, USERS, PROJECTS, TASKS, TEMPLATES } from './constants';
import { User, UserRole, Project, Task, TaskTemplate, TaskStatus } from './types';

// Helper to get initials from name
const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(USERS);
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [templates, setTemplates] = useState<TaskTemplate[]>(TEMPLATES);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
      setError('');
    } else {
      setError('Credenciais inválidas. Tente "paulo@guanais.com.br" / "PauloP27" ou "bruno.costa@example.com" / "user".');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
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
                 <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Nova Tarefa</button>
            </div>
            <div className="space-y-6">
                {/* FIX: Correctly create an array of arrays. The previous code used the comma operator, which resulted in only the last item being processed. */}
                {[
                  ['Atrasadas', overdueTasks], 
                  ['Para Hoje', todayTasks], 
                  ['Próximas', upcomingTasks]
                ].map(([title, taskList]) => (
                    <div key={title as string}>
                        <h3 className="text-lg font-medium mb-2 dark:text-gray-300">{title as string} ({taskList.length})</h3>
                        <div className="space-y-2">
                            {taskList.map(task => (
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
                            ))}
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
                 <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Adicionar Colaborador</button>
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
                                <button className="text-red-600 hover:text-red-900">Excluir</button>
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
                 {currentUser.role === UserRole.ADMIN && <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Novo Projeto</button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
                         <h3 className="font-semibold text-lg dark:text-white">{project.name}</h3>
                         <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">{project.description}</p>
                         <div className="mt-4 flex justify-end space-x-2">
                            <button className="text-sm text-indigo-600 hover:underline">Ver Tarefas</button>
                            {currentUser.role === UserRole.ADMIN && <button className="text-sm text-red-600 hover:underline">Excluir</button>}
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
                    <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Novo Modelo</button>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {templates.map(template => (
                         <li key={template.id} className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-medium dark:text-white">{template.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{template.tasks.length} tarefas</p>
                            </div>
                            <button className="text-indigo-600 hover:text-indigo-900">Editar</button>
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
                        {completedTasks.map(task => (
                             <li key={task.id} className="p-4">
                                <p className="font-medium dark:text-white">{task.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Concluída por: {users.find(u => u.id === task.assigneeId)?.name || 'N/A'} em {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
      default:
        return <h2>Home</h2>;
    }
  };

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
                    {/* Dropdown can be added here */}
                </div>
                 <button onClick={handleLogout} className="text-sm text-gray-600 dark:text-gray-400 hover:underline">Sair</button>
            </div>
        </header>
        <div className="flex-1 p-6 overflow-y-auto">
            {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default App;
