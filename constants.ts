import { User, Project, Task, UserRole, TaskStatus, TaskTemplate } from './types';

export const USERS: User[] = [
  { id: 'user-1', name: 'Paulo Guanais (Admin)', email: 'paulo@guanais.com.br', phone: '11999998888', role: UserRole.ADMIN, password: 'PauloP27' },
  { id: 'user-2', name: 'Bruno Costa', email: 'bruno.costa@example.com', phone: '11988887777', role: UserRole.COLLABORATOR, password: 'user' },
  { id: 'user-3', name: 'Carla Dias', email: 'carla.dias@example.com', phone: '11977776666', role: UserRole.COLLABORATOR, password: 'user' },
];

export const PROJECTS: Project[] = [
  { id: 'proj-1', name: 'Lançamento Website', description: 'Desenvolvimento e lançamento do novo website corporativo.' },
  { id: 'proj-2', name: 'Campanha de Marketing Q3', description: 'Planejamento e execução da campanha de marketing para o terceiro trimestre.' },
  { id: 'proj-3', name: 'Reestruturação Interna', description: 'Projeto para otimizar processos internos da equipe.' },
];

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
const nextWeek = new Date();
nextWeek.setDate(today.getDate() + 7);
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);
const twoDaysAgo = new Date();
twoDaysAgo.setDate(today.getDate() - 2);

export const TASKS: Task[] = [
  { id: 'task-1', title: 'Definir wireframes da home', description: 'Criar os wireframes para a página inicial do novo site.', dueDate: today.toISOString(), assigneeId: 'user-2', projectId: 'proj-1', status: TaskStatus.TODO, createdAt: twoDaysAgo.toISOString() },
  { id: 'task-2', title: 'Configurar ambiente de dev', description: 'Preparar o ambiente de desenvolvimento para o projeto.', dueDate: yesterday.toISOString(), assigneeId: 'user-3', projectId: 'proj-1', status: TaskStatus.TODO, createdAt: twoDaysAgo.toISOString() },
  { id: 'task-3', title: 'Pesquisa de palavras-chave', description: 'Realizar pesquisa de palavras-chave para a campanha de SEO.', dueDate: tomorrow.toISOString(), assigneeId: 'user-2', projectId: 'proj-2', status: TaskStatus.TODO, createdAt: yesterday.toISOString() },
  { id: 'task-4', title: 'Criar posts para redes sociais', description: 'Elaborar 5 posts para o Instagram e Facebook.', dueDate: nextWeek.toISOString(), assigneeId: 'user-3', projectId: 'proj-2', status: TaskStatus.TODO, createdAt: yesterday.toISOString() },
  { id: 'task-5', title: 'Revisar documentação de onboarding', description: 'Revisar e atualizar a documentação para novos colaboradores.', dueDate: today.toISOString(), assigneeId: 'user-1', projectId: 'proj-3', status: TaskStatus.TODO, createdAt: twoDaysAgo.toISOString() },
  { id: 'task-6', title: 'Agendar reunião de kickoff', description: 'Marcar a reunião inicial com todos os stakeholders.', dueDate: twoDaysAgo.toISOString(), assigneeId: 'user-1', projectId: 'proj-1', status: TaskStatus.DONE, createdAt: new Date(new Date().setDate(today.getDate() - 5)).toISOString(), completedAt: yesterday.toISOString() },
  { id: 'task-7', title: 'Análise de concorrentes', description: 'Analisar as estratégias de marketing dos principais concorrentes.', dueDate: nextWeek.toISOString(), assigneeId: 'user-2', projectId: 'proj-2', status: TaskStatus.TODO, createdAt: today.toISOString() },
];

export const TEMPLATES: TaskTemplate[] = [
    {
        id: 'template-1',
        name: 'Onboarding de Novo Cliente',
        tasks: [
            { title: 'Reunião de Kickoff', description: 'Agendar e conduzir a reunião inicial.', dueDate: '2', assigneeId: '', },
            { title: 'Configuração da Conta', description: 'Criar e configurar a conta do cliente no sistema.', dueDate: '3', assigneeId: '', },
            { title: 'Treinamento Inicial', description: 'Realizar o treinamento da plataforma para o cliente.', dueDate: '7', assigneeId: '', },
        ]
    }
];

export const NAV_ITEMS = [
    { name: 'Home', page: 'home' },
    { name: 'Colaboradores', page: 'collaborators', adminOnly: true },
    { name: 'Projetos', page: 'projects' },
    { name: 'Modelos de Tarefas', page: 'templates', adminOnly: true },
    { name: 'Relatórios', page: 'reports' },
];
