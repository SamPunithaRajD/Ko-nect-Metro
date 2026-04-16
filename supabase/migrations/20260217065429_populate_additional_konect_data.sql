/*
  # Additional KO-NECT Data Population
  
  ## Additional Data
  
  1. Ridership data for last 3 days
  2. Certificates with some expiring soon
  3. AI reports (previously generated)
  4. Plan history for last 30 days
  5. Sample employee issues
*/

-- Ridership data for last 3 days (sampling vehicles)
INSERT INTO ridership_data (vehicle_id, date, total_passengers, peak_hour_passengers, revenue)
SELECT 
  v.id,
  CURRENT_DATE - INTERVAL '1 day',
  CASE 
    WHEN v.vehicle_type = 'metro_train' THEN FLOOR(RANDOM() * 3000 + 2000)::INTEGER
    ELSE FLOOR(RANDOM() * 250 + 150)::INTEGER
  END,
  CASE 
    WHEN v.vehicle_type = 'metro_train' THEN FLOOR(RANDOM() * 800 + 400)::INTEGER
    ELSE FLOOR(RANDOM() * 60 + 30)::INTEGER
  END,
  CASE 
    WHEN v.vehicle_type = 'metro_train' THEN FLOOR(RANDOM() * 45000 + 30000)::NUMERIC
    ELSE FLOOR(RANDOM() * 3500 + 2000)::NUMERIC
  END
FROM vehicles v
WHERE v.status = 'service'
LIMIT 30;

INSERT INTO ridership_data (vehicle_id, date, total_passengers, peak_hour_passengers, revenue)
SELECT 
  v.id,
  CURRENT_DATE - INTERVAL '2 days',
  CASE 
    WHEN v.vehicle_type = 'metro_train' THEN FLOOR(RANDOM() * 3200 + 1800)::INTEGER
    ELSE FLOOR(RANDOM() * 270 + 140)::INTEGER
  END,
  CASE 
    WHEN v.vehicle_type = 'metro_train' THEN FLOOR(RANDOM() * 850 + 380)::INTEGER
    ELSE FLOOR(RANDOM() * 65 + 28)::INTEGER
  END,
  CASE 
    WHEN v.vehicle_type = 'metro_train' THEN FLOOR(RANDOM() * 48000 + 27000)::NUMERIC
    ELSE FLOOR(RANDOM() * 3800 + 1900)::NUMERIC
  END
FROM vehicles v
WHERE v.status = 'service'
LIMIT 30;

INSERT INTO ridership_data (vehicle_id, date, total_passengers, peak_hour_passengers, revenue)
SELECT 
  v.id,
  CURRENT_DATE - INTERVAL '3 days',
  CASE 
    WHEN v.vehicle_type = 'metro_train' THEN FLOOR(RANDOM() * 2800 + 2200)::INTEGER
    ELSE FLOOR(RANDOM() * 240 + 160)::INTEGER
  END,
  CASE 
    WHEN v.vehicle_type = 'metro_train' THEN FLOOR(RANDOM() * 780 + 420)::INTEGER
    ELSE FLOOR(RANDOM() * 58 + 32)::INTEGER
  END,
  CASE 
    WHEN v.vehicle_type = 'metro_train' THEN FLOOR(RANDOM() * 42000 + 33000)::NUMERIC
    ELSE FLOOR(RANDOM() * 3300 + 2200)::NUMERIC
  END
FROM vehicles v
WHERE v.status = 'service'
LIMIT 30;

-- Certificates for all vehicles with some expiring soon
INSERT INTO certificates (vehicle_id, certificate_type, issue_date, expiry_date, status)
SELECT 
  v.id,
  'safety',
  CURRENT_DATE - INTERVAL '6 months',
  CURRENT_DATE + INTERVAL '6 months',
  'valid'
FROM vehicles v;

INSERT INTO certificates (vehicle_id, certificate_type, issue_date, expiry_date, status)
SELECT 
  v.id,
  'fitness',
  CURRENT_DATE - INTERVAL '8 months',
  CASE 
    WHEN RANDOM() < 0.15 THEN CURRENT_DATE + INTERVAL '25 days'
    ELSE CURRENT_DATE + INTERVAL '4 months'
  END,
  CASE 
    WHEN RANDOM() < 0.15 THEN 'expiring_soon'
    ELSE 'valid'
  END
FROM vehicles v;

INSERT INTO certificates (vehicle_id, certificate_type, issue_date, expiry_date, status)
SELECT 
  v.id,
  'pollution',
  CURRENT_DATE - INTERVAL '5 months',
  CURRENT_DATE + INTERVAL '7 months',
  'valid'
FROM vehicles v
WHERE v.vehicle_type = 'water_boat';

INSERT INTO certificates (vehicle_id, certificate_type, issue_date, expiry_date, status)
SELECT 
  v.id,
  'insurance',
  CURRENT_DATE - INTERVAL '10 months',
  CASE 
    WHEN RANDOM() < 0.1 THEN CURRENT_DATE + INTERVAL '20 days'
    ELSE CURRENT_DATE + INTERVAL '2 months'
  END,
  CASE 
    WHEN RANDOM() < 0.1 THEN 'expiring_soon'
    ELSE 'valid'
  END
FROM vehicles v;

-- AI Reports (previously generated for demo)
INSERT INTO ai_reports (report_type, vehicle_type, report_date, report_data, insights) VALUES
  ('operational_analysis', 'metro', CURRENT_DATE - INTERVAL '2 days', 
   '{"efficiency": 94.5, "on_time_performance": 97.2, "maintenance_compliance": 100, "passenger_satisfaction": 4.6}'::jsonb,
   'Metro operations show excellent performance with 97.2% on-time performance. Peak hour capacity utilization at 87%. Recommend adding one more train during evening rush.'),
  
  ('operational_analysis', 'water', CURRENT_DATE - INTERVAL '2 days',
   '{"efficiency": 91.3, "on_time_performance": 93.8, "maintenance_compliance": 98, "passenger_satisfaction": 4.4}'::jsonb,
   'Water metro maintaining strong operational standards. Weather-related delays reduced by 15% with new monitoring system. Consider expanding Vypeen-Fort Kochi route frequency.'),
  
  ('maintenance_prediction', 'metro', CURRENT_DATE - INTERVAL '5 days',
   '{"vehicles_requiring_attention": 3, "predicted_failures": ["KMRL-05 brake system", "KMRL-14 door mechanism"], "cost_estimate": 450000}'::jsonb,
   'Predictive analysis indicates KMRL-05 and KMRL-14 require brake system inspection within 2 weeks. Early intervention can prevent service disruption and reduce maintenance costs by 30%.'),
  
  ('maintenance_prediction', 'water', CURRENT_DATE - INTERVAL '5 days',
   '{"vehicles_requiring_attention": 4, "predicted_failures": ["WMB-003 engine", "WMB-013 hull inspection", "WMB-024 electrical"], "cost_estimate": 380000}'::jsonb,
   'Four boats show signs requiring proactive maintenance. WMB-003 engine performance degrading, recommend immediate inspection. Hull integrity checks needed for 3 boats before monsoon season.'),
  
  ('efficiency_report', 'both', CURRENT_DATE - INTERVAL '7 days',
   '{"fuel_efficiency": 88.7, "cost_per_passenger": 12.5, "revenue_growth": 8.3, "operational_cost_savings": 420000}'::jsonb,
   'Integrated metro-water operations showing 8.3% revenue growth. Average cost per passenger reduced to ₹12.5. Smart scheduling reduced idle time by 22%, saving ₹4.2L monthly.'),
  
  ('operational_analysis', 'metro', CURRENT_DATE - INTERVAL '9 days',
   '{"efficiency": 93.8, "on_time_performance": 96.5, "maintenance_compliance": 100, "passenger_satisfaction": 4.5}'::jsonb,
   'Consistent high performance across metro network. Aluva-Petta corridor showing highest demand. Weekend services can be optimized by reducing frequency on northern section.'),
  
  ('efficiency_report', 'water', CURRENT_DATE - INTERVAL '12 days',
   '{"fuel_efficiency": 87.2, "cost_per_passenger": 15.8, "revenue_growth": 6.7, "operational_cost_savings": 280000}'::jsonb,
   'Water metro fuel efficiency improved with regular maintenance schedule. Tourist routes generating 35% higher revenue. Recommend dynamic pricing for peak tourist seasons.');

-- Plan history for last 30 days (sample entries)
INSERT INTO plan_history (plan_date, vehicle_type, plan_data, generated_by, approved_by) VALUES
  (CURRENT_DATE - INTERVAL '1 day', 'both', 
   '{"metro_trains": {"service": 18, "maintenance": 2, "standby": 5}, "water_boats": {"service": 32, "maintenance": 3, "standby": 5}}'::jsonb,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  
  (CURRENT_DATE - INTERVAL '2 days', 'both',
   '{"metro_trains": {"service": 19, "maintenance": 1, "standby": 5}, "water_boats": {"service": 33, "maintenance": 2, "standby": 5}}'::jsonb,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  
  (CURRENT_DATE - INTERVAL '3 days', 'both',
   '{"metro_trains": {"service": 18, "maintenance": 3, "standby": 4}, "water_boats": {"service": 31, "maintenance": 4, "standby": 5}}'::jsonb,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  
  (CURRENT_DATE - INTERVAL '5 days', 'both',
   '{"metro_trains": {"service": 19, "maintenance": 2, "standby": 4}, "water_boats": {"service": 32, "maintenance": 3, "standby": 5}}'::jsonb,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  
  (CURRENT_DATE - INTERVAL '7 days', 'both',
   '{"metro_trains": {"service": 18, "maintenance": 2, "standby": 5}, "water_boats": {"service": 33, "maintenance": 2, "standby": 5}}'::jsonb,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  
  (CURRENT_DATE - INTERVAL '10 days', 'both',
   '{"metro_trains": {"service": 17, "maintenance": 3, "standby": 5}, "water_boats": {"service": 31, "maintenance": 4, "standby": 5}}'::jsonb,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  
  (CURRENT_DATE - INTERVAL '14 days', 'both',
   '{"metro_trains": {"service": 19, "maintenance": 1, "standby": 5}, "water_boats": {"service": 34, "maintenance": 2, "standby": 4}}'::jsonb,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  
  (CURRENT_DATE - INTERVAL '21 days', 'both',
   '{"metro_trains": {"service": 18, "maintenance": 2, "standby": 5}, "water_boats": {"service": 32, "maintenance": 3, "standby": 5}}'::jsonb,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  
  (CURRENT_DATE - INTERVAL '28 days', 'both',
   '{"metro_trains": {"service": 19, "maintenance": 2, "standby": 4}, "water_boats": {"service": 33, "maintenance": 2, "standby": 5}}'::jsonb,
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

-- Sample employee issues
INSERT INTO issues (reported_by, vehicle_id, vehicle_name, issue_description, photo_url, status)
SELECT 
  '00000000-0000-0000-0000-000000000002',
  v.id,
  v.vehicle_name,
  'Door mechanism making unusual noise during operation. Requires inspection.',
  'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg',
  'new'
FROM vehicles v
WHERE v.vehicle_number = 'KMRL-05'
LIMIT 1;

INSERT INTO issues (reported_by, vehicle_id, vehicle_name, issue_description, photo_url, status)
SELECT 
  '00000000-0000-0000-0000-000000000004',
  v.id,
  v.vehicle_name,
  'Minor fuel leak observed near engine compartment. Needs urgent attention.',
  'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg',
  'acknowledged'
FROM vehicles v
WHERE v.vehicle_number = 'WMB-003'
LIMIT 1;

INSERT INTO issues (reported_by, vehicle_id, vehicle_name, issue_description, photo_url, status)
SELECT 
  '00000000-0000-0000-0000-000000000003',
  v.id,
  v.vehicle_name,
  'Air conditioning not functioning properly in coach 2. Passenger complaints received.',
  'https://images.pexels.com/photos/5835358/pexels-photo-5835358.jpeg',
  'new'
FROM vehicles v
WHERE v.vehicle_number = 'KMRL-14'
LIMIT 1;
