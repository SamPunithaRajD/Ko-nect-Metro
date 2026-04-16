/*
  # KO-NECT Metro Operations Control System Schema
  
  ## Overview
  Complete database schema for the KO-NECT metro and water metro operations control system
  
  ## Tables Created
  
  ### 1. users
  - id (uuid, primary key)
  - email (text, unique)
  - full_name (text)
  - role (text) - admin, metro_employee, water_employee
  - created_at (timestamptz)
  
  ### 2. vehicles
  - id (uuid, primary key)
  - vehicle_type (text) - metro_train, water_boat
  - vehicle_number (text, unique)
  - vehicle_name (text)
  - status (text) - service, maintenance, cleaning, standby, ready
  - assigned_to (uuid, foreign key to users)
  - last_maintenance (date)
  - next_maintenance (date)
  - capacity (integer)
  - current_location (text)
  - created_at (timestamptz)
  - updated_at (timestamptz)
  
  ### 3. operational_plans
  - id (uuid, primary key)
  - plan_date (date)
  - plan_type (text) - ai_suggestion, approved_plan
  - generated_by (uuid, foreign key to users)
  - approved_by (uuid, foreign key to users)
  - plan_data (jsonb) - contains vehicle assignments and schedules
  - ai_confidence (numeric)
  - status (text) - draft, approved, sent
  - created_at (timestamptz)
  - approved_at (timestamptz)
  
  ### 4. plan_history
  - id (uuid, primary key)
  - plan_date (date)
  - vehicle_type (text)
  - plan_data (jsonb)
  - generated_by (uuid, foreign key to users)
  - approved_by (uuid, foreign key to users)
  - created_at (timestamptz)
  
  ### 5. ridership_data
  - id (uuid, primary key)
  - vehicle_id (uuid, foreign key to vehicles)
  - date (date)
  - total_passengers (integer)
  - peak_hour_passengers (integer)
  - revenue (numeric)
  - created_at (timestamptz)
  
  ### 6. certificates
  - id (uuid, primary key)
  - vehicle_id (uuid, foreign key to vehicles)
  - certificate_type (text) - safety, fitness, pollution, insurance
  - issue_date (date)
  - expiry_date (date)
  - status (text) - valid, expiring_soon, expired
  - created_at (timestamptz)
  
  ### 7. ai_reports
  - id (uuid, primary key)
  - report_type (text) - operational_analysis, maintenance_prediction, efficiency_report
  - vehicle_type (text)
  - report_date (date)
  - report_data (jsonb)
  - insights (text)
  - created_at (timestamptz)
  
  ### 8. issues
  - id (uuid, primary key)
  - reported_by (uuid, foreign key to users)
  - vehicle_id (uuid, foreign key to vehicles)
  - vehicle_name (text)
  - issue_description (text)
  - photo_url (text)
  - status (text) - new, acknowledged, resolved
  - created_at (timestamptz)
  
  ### 9. vehicle_updates
  - id (uuid, primary key)
  - vehicle_id (uuid, foreign key to vehicles)
  - updated_by (uuid, foreign key to users)
  - previous_status (text)
  - new_status (text)
  - notes (text)
  - created_at (timestamptz)
  
  ## Security
  - Enable RLS on all tables
  - Policies for admin, metro_employee, and water_employee roles
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'metro_employee', 'water_employee')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('metro_train', 'water_boat')),
  vehicle_number text UNIQUE NOT NULL,
  vehicle_name text NOT NULL,
  status text NOT NULL DEFAULT 'ready' CHECK (status IN ('service', 'maintenance', 'cleaning', 'standby', 'ready')),
  assigned_to uuid REFERENCES users(id),
  last_maintenance date,
  next_maintenance date,
  capacity integer NOT NULL,
  current_location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update vehicles"
  ON vehicles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Operational plans table
CREATE TABLE IF NOT EXISTS operational_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_date date NOT NULL,
  plan_type text NOT NULL CHECK (plan_type IN ('ai_suggestion', 'approved_plan')),
  generated_by uuid REFERENCES users(id),
  approved_by uuid REFERENCES users(id),
  plan_data jsonb NOT NULL,
  ai_confidence numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'sent')),
  created_at timestamptz DEFAULT now(),
  approved_at timestamptz
);

ALTER TABLE operational_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read operational plans"
  ON operational_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert operational plans"
  ON operational_plans FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update operational plans"
  ON operational_plans FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Plan history table
CREATE TABLE IF NOT EXISTS plan_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_date date NOT NULL,
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('metro', 'water', 'both')),
  plan_data jsonb NOT NULL,
  generated_by uuid REFERENCES users(id),
  approved_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE plan_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read plan history"
  ON plan_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert plan history"
  ON plan_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ridership data table
CREATE TABLE IF NOT EXISTS ridership_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id),
  date date NOT NULL,
  total_passengers integer NOT NULL DEFAULT 0,
  peak_hour_passengers integer NOT NULL DEFAULT 0,
  revenue numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ridership_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read ridership data"
  ON ridership_data FOR SELECT
  TO authenticated
  USING (true);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id),
  certificate_type text NOT NULL CHECK (certificate_type IN ('safety', 'fitness', 'pollution', 'insurance')),
  issue_date date NOT NULL,
  expiry_date date NOT NULL,
  status text NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'expiring_soon', 'expired')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (true);

-- AI reports table
CREATE TABLE IF NOT EXISTS ai_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text NOT NULL CHECK (report_type IN ('operational_analysis', 'maintenance_prediction', 'efficiency_report')),
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('metro', 'water', 'both')),
  report_date date NOT NULL,
  report_data jsonb NOT NULL,
  insights text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read ai reports"
  ON ai_reports FOR SELECT
  TO authenticated
  USING (true);

-- Issues table
CREATE TABLE IF NOT EXISTS issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by uuid REFERENCES users(id),
  vehicle_id uuid REFERENCES vehicles(id),
  vehicle_name text NOT NULL,
  issue_description text NOT NULL,
  photo_url text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'resolved')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read issues"
  ON issues FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert issues"
  ON issues FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update issues"
  ON issues FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Vehicle updates table
CREATE TABLE IF NOT EXISTS vehicle_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id),
  updated_by uuid REFERENCES users(id),
  previous_status text NOT NULL,
  new_status text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vehicle_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read vehicle updates"
  ON vehicle_updates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert vehicle updates"
  ON vehicle_updates FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_operational_plans_date ON operational_plans(plan_date);
CREATE INDEX IF NOT EXISTS idx_plan_history_date ON plan_history(plan_date);
CREATE INDEX IF NOT EXISTS idx_ridership_date ON ridership_data(date);
CREATE INDEX IF NOT EXISTS idx_certificates_expiry ON certificates(expiry_date);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
