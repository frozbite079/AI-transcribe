/**
 * Projects API service
 */
import { api } from '../lib/api';
import type { Project } from '../types/api';

export interface CreateProjectData {
  name: string;
  file: File;
}

export const projectsService = {
  async list(params?: { limit?: number; offset?: number }): Promise<Project[]> {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  async get(id: string): Promise<Project> {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  async create(formData: FormData): Promise<Project> {
    const response = await api.post('/projects', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async update(id: string, data: Partial<Pick<Project, 'name' | 'transcript_text' | 'segments'>>): Promise<Project> {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  async getAudioUrl(id: string): Promise<string> {
    const token = localStorage.getItem('access_token') || '';
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    return `${base}/api/v1/projects/${id}/audio?token=${encodeURIComponent(token)}`;
  },

  async transcribe(id: string, model?: string): Promise<{ transcript: string; language: string }> {
    const response = await api.post(`/ai/transcribe/${id}`, { model });
    return response.data;
  },

  async align(id: string, transcript: string, model?: string): Promise<{ segments: any[] }> {
    const response = await api.post(`/ai/align/${id}`, { transcript, model });
    return response.data;
  },

  async getSrtUrl(id: string): Promise<string> {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    return `${base}/api/v1/projects/${id}/export/srt`;
  },

  async downloadSrt(id: string): Promise<string> {
    // Use direct fetch to get text response (Axios auto-parse might interfere)
    const token = localStorage.getItem('access_token');
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const url = `${base}/api/v1/projects/${id}/export/srt`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to download SRT: ${response.statusText}`);
    }
    return await response.text();
  },
};
