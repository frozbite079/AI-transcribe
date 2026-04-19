/**
 * TypeScript types for API responses
 */

export interface User {
  id: string;
  email: string;
  name: string;
  mobile?: string | null;
  company?: string | null;
  language: string;
  avatar_url?: string | null;
  is_verified: boolean;
  two_factor_enabled: boolean;
  plan: string;
  plan_expires_at?: string | null;
  status: string;
  created_at: string;
}

// Alias for auth service compatibility
export type UserResponse = User;

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  audio_file_url: string;
  audio_duration: number;
  file_size_bytes?: number | null;
  language_detected?: string | null;
  transcript_text?: string | null;
  segments?: any[] | null;
  tokens_used: number;
  ai_model_used?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageLog {
  id: string;
  user_id: string;
  project_id?: string | null;
  action: string;
  tokens_consumed: number;
  ai_model?: string | null;
  created_at: string;
}

export interface UsageSummary {
  total_tokens: number;
  total_projects: number;
  total_duration_seconds: number;
}
