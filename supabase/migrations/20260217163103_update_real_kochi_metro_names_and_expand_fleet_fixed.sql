/*
  # Update KO-NECT Fleet with Real Kochi Metro Names and Complete Water Fleet
  
  ## Overview
  This migration updates the existing fleet with accurate Kochi Metro train names
  and expands the water boat fleet to 75 vessels as required for demo.
  
  ## Changes
  
  ### 1. Metro Train Names Update
  - Updates all 25 existing metro trains with real Kochi Metro train names:
    KRISHNA, TAPTI, NILA, SARAYU, ARUTH, VAIGAI, JHANAVI, DHWANIL,
    BHAVANI, PADMA, MANDAKINI, YAMUNA, PERIYAR, KABANI, VAAYU,
    KAVERI, SHIRIYA, PAMPA, NARMADA, MAHE, MAARUT, SABARMATHI,
    GODHAVARI, GANGA, PAVAN
  
  ### 2. Water Fleet Expansion
  - Adds 35 additional water boats (WMB-041 to WMB-075)
  - Total water fleet reaches 75 vessels
  - Mixed statuses for realistic operations
  
  ### 3. Demo Users Update
  - Updates existing users to match expected demo credentials
  - admin@konect.com, metro@konect.com, water@konect.com
  
  ### 4. Additional Data
  - Ridership data for last 3 days for all vehicles
  - Certificates for new water boats
  - More plan history entries (30 days)
  - More AI reports (14 days)
*/

-- Update Metro Train Names with Real Kochi Metro Names
UPDATE vehicles SET vehicle_name = 'KRISHNA' WHERE vehicle_number = 'KMRL-01';
UPDATE vehicles SET vehicle_name = 'TAPTI' WHERE vehicle_number = 'KMRL-02';
UPDATE vehicles SET vehicle_name = 'NILA' WHERE vehicle_number = 'KMRL-03';
UPDATE vehicles SET vehicle_name = 'SARAYU' WHERE vehicle_number = 'KMRL-04';
UPDATE vehicles SET vehicle_name = 'ARUTH' WHERE vehicle_number = 'KMRL-05';
UPDATE vehicles SET vehicle_name = 'VAIGAI' WHERE vehicle_number = 'KMRL-06';
UPDATE vehicles SET vehicle_name = 'JHANAVI' WHERE vehicle_number = 'KMRL-07';
UPDATE vehicles SET vehicle_name = 'DHWANIL' WHERE vehicle_number = 'KMRL-08';
UPDATE vehicles SET vehicle_name = 'BHAVANI' WHERE vehicle_number = 'KMRL-09';
UPDATE vehicles SET vehicle_name = 'PADMA' WHERE vehicle_number = 'KMRL-10';
UPDATE vehicles SET vehicle_name = 'MANDAKINI' WHERE vehicle_number = 'KMRL-11';
UPDATE vehicles SET vehicle_name = 'YAMUNA' WHERE vehicle_number = 'KMRL-12';
UPDATE vehicles SET vehicle_name = 'PERIYAR' WHERE vehicle_number = 'KMRL-13';
UPDATE vehicles SET vehicle_name = 'KABANI' WHERE vehicle_number = 'KMRL-14';
UPDATE vehicles SET vehicle_name = 'VAAYU' WHERE vehicle_number = 'KMRL-15';
UPDATE vehicles SET vehicle_name = 'KAVERI' WHERE vehicle_number = 'KMRL-16';
UPDATE vehicles SET vehicle_name = 'SHIRIYA' WHERE vehicle_number = 'KMRL-17';
UPDATE vehicles SET vehicle_name = 'PAMPA' WHERE vehicle_number = 'KMRL-18';
UPDATE vehicles SET vehicle_name = 'NARMADA' WHERE vehicle_number = 'KMRL-19';
UPDATE vehicles SET vehicle_name = 'MAHE' WHERE vehicle_number = 'KMRL-20';
UPDATE vehicles SET vehicle_name = 'MAARUT' WHERE vehicle_number = 'KMRL-21';
UPDATE vehicles SET vehicle_name = 'SABARMATHI' WHERE vehicle_number = 'KMRL-22';
UPDATE vehicles SET vehicle_name = 'GODHAVARI' WHERE vehicle_number = 'KMRL-23';
UPDATE vehicles SET vehicle_name = 'GANGA' WHERE vehicle_number = 'KMRL-24';
UPDATE vehicles SET vehicle_name = 'PAVAN' WHERE vehicle_number = 'KMRL-25';

-- Update user emails to match demo credentials and remove foreign key constraints
DO $$
DECLARE
  v_metro_old_id UUID;
  v_metro_new_id UUID;
  v_water_old_id UUID;
  v_water_new_id UUID;
BEGIN
  -- Get IDs for users to be updated
  SELECT id INTO v_metro_new_id FROM users WHERE email = 'metro1@konect.com';
  SELECT id INTO v_water_new_id FROM users WHERE email = 'water1@konect.com';
  SELECT id INTO v_metro_old_id FROM users WHERE email = 'metro2@konect.com';
  SELECT id INTO v_water_old_id FROM users WHERE email = 'water2@konect.com';
  
  -- Update vehicle assignments from old users to new users
  IF v_metro_old_id IS NOT NULL THEN
    UPDATE vehicles SET assigned_to = v_metro_new_id WHERE assigned_to = v_metro_old_id;
    UPDATE plan_history SET generated_by = v_metro_new_id WHERE generated_by = v_metro_old_id;
    UPDATE plan_history SET approved_by = v_metro_new_id WHERE approved_by = v_metro_old_id;
    UPDATE operational_plans SET generated_by = v_metro_new_id WHERE generated_by = v_metro_old_id;
    UPDATE operational_plans SET approved_by = v_metro_new_id WHERE approved_by = v_metro_old_id;
    UPDATE issues SET reported_by = v_metro_new_id WHERE reported_by = v_metro_old_id;
    UPDATE vehicle_updates SET updated_by = v_metro_new_id WHERE updated_by = v_metro_old_id;
  END IF;
  
  IF v_water_old_id IS NOT NULL THEN
    UPDATE vehicles SET assigned_to = v_water_new_id WHERE assigned_to = v_water_old_id;
    UPDATE plan_history SET generated_by = v_water_new_id WHERE generated_by = v_water_old_id;
    UPDATE plan_history SET approved_by = v_water_new_id WHERE approved_by = v_water_old_id;
    UPDATE operational_plans SET generated_by = v_water_new_id WHERE generated_by = v_water_old_id;
    UPDATE operational_plans SET approved_by = v_water_new_id WHERE approved_by = v_water_old_id;
    UPDATE issues SET reported_by = v_water_new_id WHERE reported_by = v_water_old_id;
    UPDATE vehicle_updates SET updated_by = v_water_new_id WHERE updated_by = v_water_old_id;
  END IF;
  
  -- Now safe to delete the old users
  DELETE FROM users WHERE email IN ('metro2@konect.com', 'water2@konect.com');
  
  -- Update emails
  UPDATE users SET email = 'metro@konect.com' WHERE email = 'metro1@konect.com';
  UPDATE users SET email = 'water@konect.com' WHERE email = 'water1@konect.com';
END $$;

-- Add 35 more water boats (WMB-041 to WMB-075)
INSERT INTO vehicles (vehicle_type, vehicle_number, vehicle_name, status, capacity, current_location, last_maintenance, next_maintenance)
VALUES
  ('water_boat', 'WMB-041', 'Paravur Link', 'service', 80, 'Paravur Jetty', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days'),
  ('water_boat', 'WMB-042', 'Chendamangalam Ferry', 'ready', 80, 'Chendamangalam Jetty', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE + INTERVAL '10 days'),
  ('water_boat', 'WMB-043', 'Chennamangalam Express', 'service', 100, 'Chennamangalam', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days'),
  ('water_boat', 'WMB-044', 'Kottapuram Bridge', 'service', 120, 'Kottapuram', CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE + INTERVAL '5 days'),
  ('water_boat', 'WMB-045', 'Kottuvally Link', 'maintenance', 80, 'Kottuvally', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '28 days'),
  ('water_boat', 'WMB-046', 'Malayattoor Ferry', 'service', 80, 'Malayattoor', CURRENT_DATE - INTERVAL '18 days', CURRENT_DATE + INTERVAL '12 days'),
  ('water_boat', 'WMB-047', 'Perumbavoor Link', 'ready', 80, 'Perumbavoor', CURRENT_DATE - INTERVAL '12 days', CURRENT_DATE + INTERVAL '18 days'),
  ('water_boat', 'WMB-048', 'Aluva River Express', 'service', 120, 'Aluva Terminal', CURRENT_DATE - INTERVAL '22 days', CURRENT_DATE + INTERVAL '8 days'),
  ('water_boat', 'WMB-049', 'Bhoothathankettu Link', 'service', 100, 'Bhoothathankettu', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE + INTERVAL '16 days'),
  ('water_boat', 'WMB-050', 'Kalady Ferry', 'cleaning', 80, 'Kalady', CURRENT_DATE - INTERVAL '28 days', CURRENT_DATE + INTERVAL '2 days'),
  ('water_boat', 'WMB-051', 'Muvattupuzha Link', 'service', 80, 'Muvattupuzha', CURRENT_DATE - INTERVAL '16 days', CURRENT_DATE + INTERVAL '14 days'),
  ('water_boat', 'WMB-052', 'Piravom Express', 'service', 100, 'Piravom', CURRENT_DATE - INTERVAL '11 days', CURRENT_DATE + INTERVAL '19 days'),
  ('water_boat', 'WMB-053', 'Kothamangalam Ferry', 'standby', 80, 'Kothamangalam', CURRENT_DATE - INTERVAL '24 days', CURRENT_DATE + INTERVAL '6 days'),
  ('water_boat', 'WMB-054', 'Thattekad Link', 'service', 80, 'Thattekad', CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE + INTERVAL '17 days'),
  ('water_boat', 'WMB-055', 'Thodupuzha Express', 'service', 100, 'Thodupuzha', CURRENT_DATE - INTERVAL '19 days', CURRENT_DATE + INTERVAL '11 days'),
  ('water_boat', 'WMB-056', 'Edappally Link', 'service', 120, 'Edappally', CURRENT_DATE - INTERVAL '21 days', CURRENT_DATE + INTERVAL '9 days'),
  ('water_boat', 'WMB-057', 'Kadungalloor Ferry', 'ready', 80, 'Kadungalloor', CURRENT_DATE - INTERVAL '17 days', CURRENT_DATE + INTERVAL '13 days'),
  ('water_boat', 'WMB-058', 'Angamaly Express', 'service', 100, 'Angamaly', CURRENT_DATE - INTERVAL '9 days', CURRENT_DATE + INTERVAL '21 days'),
  ('water_boat', 'WMB-059', 'Chalakudy Link', 'service', 80, 'Chalakudy', CURRENT_DATE - INTERVAL '26 days', CURRENT_DATE + INTERVAL '4 days'),
  ('water_boat', 'WMB-060', 'Irinjalakuda Ferry', 'maintenance', 80, 'Irinjalakuda', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '27 days'),
  ('water_boat', 'WMB-061', 'Kodungalloor Express', 'service', 120, 'Kodungalloor Port', CURRENT_DATE - INTERVAL '23 days', CURRENT_DATE + INTERVAL '7 days'),
  ('water_boat', 'WMB-062', 'Methala Link', 'service', 80, 'Methala', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days'),
  ('water_boat', 'WMB-063', 'Azhikode Ferry', 'cleaning', 100, 'Azhikode', CURRENT_DATE - INTERVAL '27 days', CURRENT_DATE + INTERVAL '3 days'),
  ('water_boat', 'WMB-064', 'Azheekal Express', 'service', 80, 'Azheekal', CURRENT_DATE - INTERVAL '12 days', CURRENT_DATE + INTERVAL '18 days'),
  ('water_boat', 'WMB-065', 'Kannur Link', 'service', 80, 'Kannur', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE + INTERVAL '10 days'),
  ('water_boat', 'WMB-066', 'Payyannur Ferry', 'ready', 80, 'Payyannur', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE + INTERVAL '16 days'),
  ('water_boat', 'WMB-067', 'Thalassery Express', 'service', 100, 'Thalassery', CURRENT_DATE - INTERVAL '18 days', CURRENT_DATE + INTERVAL '12 days'),
  ('water_boat', 'WMB-068', 'Mahe Link', 'service', 120, 'Mahe', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days'),
  ('water_boat', 'WMB-069', 'Beypore Ferry', 'standby', 80, 'Beypore', CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE + INTERVAL '5 days'),
  ('water_boat', 'WMB-070', 'Kozhikode Express', 'service', 120, 'Kozhikode', CURRENT_DATE - INTERVAL '16 days', CURRENT_DATE + INTERVAL '14 days'),
  ('water_boat', 'WMB-071', 'Kappad Link', 'service', 80, 'Kappad Beach', CURRENT_DATE - INTERVAL '11 days', CURRENT_DATE + INTERVAL '19 days'),
  ('water_boat', 'WMB-072', 'Kadalundi Ferry', 'service', 100, 'Kadalundi', CURRENT_DATE - INTERVAL '22 days', CURRENT_DATE + INTERVAL '8 days'),
  ('water_boat', 'WMB-073', 'Ponnani Express', 'maintenance', 80, 'Ponnani', CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE + INTERVAL '26 days'),
  ('water_boat', 'WMB-074', 'Tanur Link', 'service', 80, 'Tanur', CURRENT_DATE - INTERVAL '19 days', CURRENT_DATE + INTERVAL '11 days'),
  ('water_boat', 'WMB-075', 'Tirur Ferry', 'service', 100, 'Tirur', CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE + INTERVAL '17 days');

-- Add certificates for new water boats (4 per boat: safety, fitness, pollution, insurance)
DO $$
DECLARE
  v_record RECORD;
  v_safety_status TEXT;
  v_fitness_status TEXT;
  v_pollution_status TEXT;
  v_insurance_status TEXT;
BEGIN
  FOR v_record IN SELECT id FROM vehicles WHERE vehicle_number LIKE 'WMB-0%' AND vehicle_number >= 'WMB-041'
  LOOP
    -- Randomly assign certificate statuses
    v_safety_status := CASE WHEN RANDOM() < 0.15 THEN 'expiring_soon' ELSE 'valid' END;
    v_fitness_status := CASE WHEN RANDOM() < 0.15 THEN 'expiring_soon' ELSE 'valid' END;
    v_pollution_status := CASE WHEN RANDOM() < 0.15 THEN 'expiring_soon' ELSE 'valid' END;
    v_insurance_status := CASE WHEN RANDOM() < 0.15 THEN 'expiring_soon' ELSE 'valid' END;
    
    -- Insert safety certificate
    INSERT INTO certificates (vehicle_id, certificate_type, issue_date, expiry_date, status)
    VALUES (
      v_record.id,
      'safety',
      CURRENT_DATE - INTERVAL '6 months',
      CASE WHEN v_safety_status = 'expiring_soon' 
        THEN CURRENT_DATE + INTERVAL '25 days'
        ELSE CURRENT_DATE + INTERVAL '6 months'
      END,
      v_safety_status
    );
    
    -- Insert fitness certificate
    INSERT INTO certificates (vehicle_id, certificate_type, issue_date, expiry_date, status)
    VALUES (
      v_record.id,
      'fitness',
      CURRENT_DATE - INTERVAL '8 months',
      CASE WHEN v_fitness_status = 'expiring_soon'
        THEN CURRENT_DATE + INTERVAL '20 days'
        ELSE CURRENT_DATE + INTERVAL '4 months'
      END,
      v_fitness_status
    );
    
    -- Insert pollution certificate
    INSERT INTO certificates (vehicle_id, certificate_type, issue_date, expiry_date, status)
    VALUES (
      v_record.id,
      'pollution',
      CURRENT_DATE - INTERVAL '5 months',
      CASE WHEN v_pollution_status = 'expiring_soon'
        THEN CURRENT_DATE + INTERVAL '15 days'
        ELSE CURRENT_DATE + INTERVAL '7 months'
      END,
      v_pollution_status
    );
    
    -- Insert insurance certificate
    INSERT INTO certificates (vehicle_id, certificate_type, issue_date, expiry_date, status)
    VALUES (
      v_record.id,
      'insurance',
      CURRENT_DATE - INTERVAL '10 months',
      CASE WHEN v_insurance_status = 'expiring_soon'
        THEN CURRENT_DATE + INTERVAL '28 days'
        ELSE CURRENT_DATE + INTERVAL '2 months'
      END,
      v_insurance_status
    );
  END LOOP;
END $$;

-- Add ridership data for last 3 days for all 100 vehicles
DO $$
DECLARE
  v_record RECORD;
  v_day INTEGER;
  v_base_passengers INTEGER;
  v_is_metro BOOLEAN;
BEGIN
  FOR v_record IN SELECT id, vehicle_type FROM vehicles
  LOOP
    v_is_metro := v_record.vehicle_type = 'metro_train';
    v_base_passengers := CASE WHEN v_is_metro THEN 1200 ELSE 150 END;
    
    FOR v_day IN 1..3
    LOOP
      INSERT INTO ridership_data (vehicle_id, date, total_passengers, peak_hour_passengers, revenue)
      VALUES (
        v_record.id,
        CURRENT_DATE - (v_day || ' days')::INTERVAL,
        v_base_passengers + FLOOR(RANDOM() * 300)::INTEGER,
        FLOOR((v_base_passengers + FLOOR(RANDOM() * 300)::INTEGER) * 0.35)::INTEGER,
        CASE WHEN v_is_metro
          THEN (v_base_passengers + FLOOR(RANDOM() * 300)::INTEGER) * 15
          ELSE (150 + FLOOR(RANDOM() * 50)::INTEGER) * 20
        END
      );
    END LOOP;
  END LOOP;
END $$;

-- Add 30 days of plan history
DO $$
DECLARE
  v_day INTEGER;
  v_admin_id UUID;
BEGIN
  SELECT id INTO v_admin_id FROM users WHERE role = 'admin' LIMIT 1;
  
  FOR v_day IN 1..30
  LOOP
    INSERT INTO plan_history (plan_date, vehicle_type, plan_data, generated_by, approved_by)
    VALUES (
      CURRENT_DATE - (v_day || ' days')::INTERVAL,
      CASE 
        WHEN v_day % 3 = 0 THEN 'both'
        WHEN v_day % 2 = 0 THEN 'metro'
        ELSE 'water'
      END,
      jsonb_build_object(
        'total_vehicles', FLOOR(RANDOM() * 30 + 70)::INTEGER,
        'service', FLOOR(RANDOM() * 15 + 50)::INTEGER,
        'maintenance', FLOOR(RANDOM() * 5 + 5)::INTEGER,
        'ready', FLOOR(RANDOM() * 10 + 10)::INTEGER,
        'efficiency_score', ROUND((RANDOM() * 15 + 85)::NUMERIC, 1)
      ),
      v_admin_id,
      v_admin_id
    );
  END LOOP;
END $$;

-- Add 14 days of AI reports
DO $$
DECLARE
  v_day INTEGER;
BEGIN
  FOR v_day IN 1..14
  LOOP
    -- Metro operational analysis
    INSERT INTO ai_reports (report_type, vehicle_type, report_date, report_data, insights)
    VALUES (
      'operational_analysis',
      'metro',
      CURRENT_DATE - (v_day || ' days')::INTERVAL,
      jsonb_build_object(
        'total_trips', FLOOR(RANDOM() * 50 + 150)::INTEGER,
        'avg_passengers', FLOOR(RANDOM() * 200 + 1000)::INTEGER,
        'efficiency', ROUND((RANDOM() * 10 + 88)::NUMERIC, 1),
        'on_time_percentage', ROUND((RANDOM() * 5 + 93)::NUMERIC, 1)
      ),
      'Metro operations showing strong performance with ' || (ROUND((RANDOM() * 5 + 93)::NUMERIC, 1))::TEXT || '% on-time arrivals. Recommend continuing current scheduling pattern.'
    );
    
    -- Water operational analysis
    INSERT INTO ai_reports (report_type, vehicle_type, report_date, report_data, insights)
    VALUES (
      'operational_analysis',
      'water',
      CURRENT_DATE - (v_day || ' days')::INTERVAL,
      jsonb_build_object(
        'total_trips', FLOOR(RANDOM() * 100 + 400)::INTEGER,
        'avg_passengers', FLOOR(RANDOM() * 30 + 120)::INTEGER,
        'efficiency', ROUND((RANDOM() * 10 + 85)::NUMERIC, 1),
        'weather_delays', FLOOR(RANDOM() * 5)::INTEGER
      ),
      'Water metro fleet maintaining good efficiency. ' || (FLOOR(RANDOM() * 5)::INTEGER)::TEXT || ' weather-related delays recorded. Consider route optimization during monsoon season.'
    );
    
    -- Maintenance prediction (every 3 days)
    IF v_day % 3 = 0 THEN
      INSERT INTO ai_reports (report_type, vehicle_type, report_date, report_data, insights)
      VALUES (
        'maintenance_prediction',
        'both',
        CURRENT_DATE - (v_day || ' days')::INTERVAL,
        jsonb_build_object(
          'vehicles_due_maintenance', FLOOR(RANDOM() * 5 + 3)::INTEGER,
          'critical_alerts', FLOOR(RANDOM() * 2)::INTEGER,
          'predicted_issues', ARRAY['brake system check', 'engine oil change', 'safety inspection']
        ),
        'AI predicts ' || (FLOOR(RANDOM() * 5 + 3)::INTEGER)::TEXT || ' vehicles will require maintenance within next 7 days. Proactive scheduling recommended to avoid service disruptions.'
      );
    END IF;
  END LOOP;
END $$;
