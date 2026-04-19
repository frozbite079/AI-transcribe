/**
 * ProjectContext: manage project state
 */
import { createContext, useContext, useState, type ReactNode } from 'react';
import { projectsService } from '../services/projects';
import type { Project } from '../types/api';
import { useAuth } from './AuthContext';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  setCurrentProject: (project: Project | null) => void;
  createProject: (name: string, file: File) => Promise<Project>;
  loadProjects: () => Promise<void>;
  refreshProject: (id: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const loadProjects = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const data = await projectsService.list();
      setProjects(data);
    } catch (e) {
      console.error('Failed to load projects', e);
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (name: string, file: File): Promise<Project> => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);
    const project = await projectsService.create(formData);
    setProjects(prev => [project, ...prev]);
    return project;
  };

  const refreshProject = async (id: string) => {
    const updated = await projectsService.get(id);
    setProjects(prev => prev.map(p => (p.id === id ? updated : p)));
    if (currentProject?.id === id) {
      setCurrentProject(updated);
    }
  };

  return (
    <ProjectContext.Provider value={{ projects, currentProject, isLoading, setCurrentProject, createProject, loadProjects, refreshProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}
