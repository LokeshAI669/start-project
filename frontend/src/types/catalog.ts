/**
 * TypeScript Type Definitions for JobZen Catalog, Orders & Filter State
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
  
  // Premium & Private ZIP fields
  is_premium?: boolean;
  price?: number;
  zip_storage_key?: string | null;
  zip_file_name?: string | null;
  zip_file_size?: number;
  zip_version?: number;
  zip_updated_at?: string | null;
  status?: 'draft' | 'published' | 'hidden';
  is_deleted?: boolean;

  created_at?: string;
  updated_at?: string;
}

export interface Purchase {
  id: number;
  user_id?: number | null;
  user_email: string;
  user_name?: string | null;
  project_id: number;
  amount: number;
  currency: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string | null;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  zip_version_purchased: number;
  download_count: number;
  max_downloads: number;
  created_at: string;
  updated_at: string;

  // Joined fields from catalog
  project_title?: string;
  project_domain?: string;
  difficulty?: string;
  current_zip_version?: number;
  is_updated?: boolean;
}

export type SortOption = 'title-asc' | 'title-desc' | 'diff-asc' | 'newest' | 'price-asc' | 'price-desc';

export interface FilterState {
  q: string;
  domain: string;
  difficulty: string;
  duration: string;
  premium: string;
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
