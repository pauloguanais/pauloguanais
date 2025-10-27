
export enum UserRole {
  ADMIN = 'ADMIN',
  COLLABORATOR = 'COLLABORATOR',
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
}

export enum TaskStatus {
  TODO = 'A Fazer',
  DONE = 'Concluída',
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO string format
  assigneeId: string;
  projectId: string;
  status: TaskStatus;
  completedAt?: string; // ISO string format
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  tasks: Array<Omit<Task, 'id' | 'projectId' | 'createdAt' | 'status' | 'completedAt'>>;
}
