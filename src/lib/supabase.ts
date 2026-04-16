import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'metro_employee' | 'water_employee';
  created_at: string;
};

export type Vehicle = {
  id: string;
  vehicle_type: 'metro_train' | 'water_boat';
  vehicle_number: string;
  vehicle_name: string;
  status: 'service' | 'maintenance' | 'cleaning' | 'standby' | 'ready';
  assigned_to: string;
  last_maintenance: string;
  next_maintenance: string;
  capacity: number;
  current_location: string;
  created_at: string;
  updated_at: string;
};

export type OperationalPlan = {
  id: string;
  plan_date: string;
  plan_type: 'ai_suggestion' | 'approved_plan';
  generated_by: string;
  approved_by?: string;
  plan_data: any;
  ai_confidence: number;
  status: 'draft' | 'approved' | 'sent';
  created_at: string;
  approved_at?: string;
};

export type PlanHistory = {
  id: string;
  plan_date: string;
  vehicle_type: 'metro' | 'water' | 'both';
  plan_data: any;
  generated_by: string;
  approved_by: string;
  created_at: string;
};

export type Issue = {
  id: string;
  reported_by: string;
  vehicle_id: string;
  vehicle_name: string;
  issue_description: string;
  photo_url?: string;
  status: 'new' | 'acknowledged' | 'resolved';
  created_at: string;
};

export type Certificate = {
  id: string;
  vehicle_id: string;
  certificate_type: 'safety' | 'fitness' | 'pollution' | 'insurance';
  issue_date: string;
  expiry_date: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  created_at: string;
};

export type AIReport = {
  id: string;
  report_type: 'operational_analysis' | 'maintenance_prediction' | 'efficiency_report';
  vehicle_type: 'metro' | 'water' | 'both';
  report_date: string;
  report_data: any;
  insights: string;
  created_at: string;
};

export type RidershipData = {
  id: string;
  vehicle_id: string;
  date: string;
  total_passengers: number;
  peak_hour_passengers: number;
  revenue: number;
  created_at: string;
};
