/**
 * TypeScript Type Definitions for JobZen Catalog & Filter State
 */

export interface Project {
  id: number;
  title: string;
  domain: string;
  short_description?: string | null;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  is_active?: boolean;
  full_description?: string | null;
  tech_stack?: string | null;
  estimated_duration?: string | null;
  objectives?: string[] | string | null;
  prerequisites?: string | null;
  github_url?: string | null;
  zip_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type SortOption = 'title-asc' | 'title-desc' | 'diff-asc' | 'newest';

export interface FilterState {
  q: string;
  domain: string;
  difficulty: string;
  duration: string;
  sort: SortOption;
  page: number;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface ActiveFilterChip {
  id: string;
  label: string;
  value: string;
  onRemove: () => void;
}
