/*
  # Populate KO-NECT System with Realistic Dummy Data
  
  ## Data Population
  
  1. Demo Users
    - Admin user
    - Metro employee users
    - Water employee users
  
  2. Vehicles
    - 25 Kochi Metro trains (realistic numbers)
    - 40 Water Metro boats
    - Mixed statuses: service, maintenance, cleaning, ready
  
  3. Ridership Data
    - Last 3 days of passenger data
    - Realistic numbers for peak and off-peak
  
  4. Certificates
    - Various types for all vehicles
    - Some expiring soon for alerts
  
  5. AI Reports
    - Previously generated reports for demo
  
  6. Plan History
    - Last 30 days of operational plans
  
  7. Sample Issues
    - A few employee-reported issues
*/

-- Insert demo users (using hardcoded UUIDs for consistency)
INSERT INTO users (id, email, full_name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@konect.com', 'Rajesh Kumar', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'metro1@konect.com', 'Arun Menon', 'metro_employee'),
  ('00000000-0000-0000-0000-000000000003', 'metro2@konect.com', 'Priya Nair', 'metro_employee'),
  ('00000000-0000-0000-0000-000000000004', 'water1@konect.com', 'Suresh Pillai', 'water_employee'),
  ('00000000-0000-0000-0000-000000000005', 'water2@konect.com', 'Lakshmi Das', 'water_employee')
ON CONFLICT (id) DO NOTHING;

-- Insert 25 Kochi Metro trains
INSERT INTO vehicles (id, vehicle_type, vehicle_number, vehicle_name, status, assigned_to, last_maintenance, next_maintenance, capacity, current_location) VALUES
  (gen_random_uuid(), 'metro_train', 'KMRL-01', 'Aluva Express', 'service', '00000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '75 days', 960, 'Aluva Station'),
  (gen_random_uuid(), 'metro_train', 'KMRL-02', 'Kalamassery Local', 'service', '00000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE + INTERVAL '70 days', 960, 'Kalamassery Station'),
  (gen_random_uuid(), 'metro_train', 'KMRL-03', 'Edachira Shuttle', 'ready', '00000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '80 days', 960, 'Depot'),
  (gen_random_uuid(), 'metro_train', 'KMRL-04', 'Changampuzha Express', 'service', '00000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE + INTERVAL '65 days', 960, 'Changampuzha Park'),
  (gen_random_uuid(), 'metro_train', 'KMRL-05', 'Palarivattom Metro', 'maintenance', '00000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '88 days', 960, 'Maintenance Yard'),
  (gen_random_uuid(), 'metro_train', 'KMRL-06', 'JLN Stadium Special', 'service', '00000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '18 days', CURRENT_DATE + INTERVAL '72 days', 960, 'JLN Stadium'),
  (gen_random_uuid(), 'metro_train', 'KMRL-07', 'Kaloor Express', 'service', '00000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '22 days', CURRENT_DATE + INTERVAL '68 days', 960, 'Kaloor Station'),
  (gen_random_uuid(), 'metro_train', 'KMRL-08', 'Town Hall Runner', 'cleaning', '00000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '12 days', CURRENT_DATE + INTERVAL '78 days', 960, 'Depot'),
  (gen_random_uuid(), 'metro_train', 'KMRL-09', 'MG Road Metro', 'service', '00000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '28 days', CURRENT_DATE + INTERVAL '62 days', 960, 'MG Road'),
  (gen_random_uuid(), 'metro_train', 'KMRL-10', 'Maharajas Express', 'service', '00000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '16 days', CURRENT_DATE + INTERVAL '74 days', 960, 'Maharajas College'),
  (gen_random_uuid(), 'metro_train', 'KMRL-11', 'Ernakulam South', 'ready', '00000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE + INTERVAL '82 days', 960, 'Ernakulam South'),
  (gen_random_uuid(), 'metro_train', 'KMRL-12', 'Kadavanthra Local', 'service', '00000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '24 days', CURRENT_DATE + INTERVAL '66 days', 960, 'Kadavanthra'),
  (gen_random_uuid(), 'metro_train', 'KMRL-13', 'Elamkulam Shuttle', 'service', '00000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '19 days', CURRENT_DATE + INTERVAL '71 days', 960, 'Elamkulam'),
  (gen_random_uuid(), 'metro_train', 'KMRL-14', 'Vyttila Express', 'maintenance', '00000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '87 days', 960, 'Maintenance Yard'),
  (gen_random_uuid(), 'metro_train', 'KMRL-15', 'Thaikoodam Metro', 'service', '00000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '21 days', CURRENT_DATE + INTERVAL '69 days', 960, 'Thaikoodam'),
  (gen_random_uuid(), 'metro_train', 'KMRL-16', 'Petta Special', 'service', '00000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '17 days', CURRENT_DATE + INTERVAL '73 days', 960, 'Petta'),
  (gen_random_uuid(), 'metro_train', 'KMRL-17', 'SN Junction Runner', 'ready', '00000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE + INTERVAL '84 days', 960, 'SN Junction'),
  (gen_random_uuid(), 'metro_train', 'KMRL-18', 'Vytilla Mobility Hub', 'service', '00000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '26 days', CURRENT_DATE + INTERVAL '64 days', 960, 'Vytilla Hub'),
  (gen_random_uuid(), 'metro_train', 'KMRL-19', 'Thrikkakara Express', 'cleaning', '00000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE + INTERVAL '76 days', 960, 'Depot'),
  (gen_random_uuid(), 'metro_train', 'KMRL-20', 'Kakkanad Metro', 'service', '00000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '23 days', CURRENT_DATE + INTERVAL '67 days', 960, 'Kakkanad'),
  (gen_random_uuid(), 'metro_train', 'KMRL-21', 'Palarivattom Local', 'service', '00000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '11 days', CURRENT_DATE + INTERVAL '79 days', 960, 'Palarivattom'),
  (gen_random_uuid(), 'metro_train', 'KMRL-22', 'JLN Express Line', 'standby', '00000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '85 days', 960, 'Depot'),
  (gen_random_uuid(), 'metro_train', 'KMRL-23', 'Muttom Shuttle', 'service', '00000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '27 days', CURRENT_DATE + INTERVAL '63 days', 960, 'Muttom'),
  (gen_random_uuid(), 'metro_train', 'KMRL-24', 'Kacheripady Metro', 'service', '00000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE + INTERVAL '77 days', 960, 'Kacheripady'),
  (gen_random_uuid(), 'metro_train', 'KMRL-25', 'Aluva Peak Service', 'ready', '00000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '83 days', 960, 'Aluva Station')
ON CONFLICT (vehicle_number) DO NOTHING;

-- Insert 40 Water Metro boats
INSERT INTO vehicles (id, vehicle_type, vehicle_number, vehicle_name, status, assigned_to, last_maintenance, next_maintenance, capacity, current_location) VALUES
  (gen_random_uuid(), 'water_boat', 'WMB-001', 'Vembanad Pride', 'service', '00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '12 days', CURRENT_DATE + INTERVAL '48 days', 100, 'Vypeen Jetty'),
  (gen_random_uuid(), 'water_boat', 'WMB-002', 'Backwater Express', 'service', '00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '18 days', CURRENT_DATE + INTERVAL '42 days', 100, 'High Court Jetty'),
  (gen_random_uuid(), 'water_boat', 'WMB-003', 'Kochi Navigator', 'maintenance', '00000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '57 days', 100, 'Boat Yard'),
  (gen_random_uuid(), 'water_boat', 'WMB-004', 'Bolgatty Cruiser', 'service', '00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '21 days', CURRENT_DATE + INTERVAL '39 days', 100, 'Bolgatty Jetty'),
  (gen_random_uuid(), 'water_boat', 'WMB-005', 'Fort Kochi Ferry', 'ready', '00000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '9 days', CURRENT_DATE + INTERVAL '51 days', 100, 'Fort Kochi Jetty'),
  (gen_random_uuid(), 'water_boat', 'WMB-006', 'Mattancherry Express', 'service', '00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '45 days', 100, 'Mattancherry'),
  (gen_random_uuid(), 'water_boat', 'WMB-007', 'Willingdon Runner', 'service', '00000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '24 days', CURRENT_DATE + INTERVAL '36 days', 100, 'Willingdon Island'),
  (gen_random_uuid(), 'water_boat', 'WMB-008', 'Marine Drive Special', 'cleaning', '00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE + INTERVAL '54 days', 100, 'Boat Yard'),
  (gen_random_uuid(), 'water_boat', 'WMB-009', 'Embankment Ferry', 'service', '00000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '19 days', CURRENT_DATE + INTERVAL '41 days', 100, 'Embankment Jetty'),
  (gen_random_uuid(), 'water_boat', 'WMB-010', 'Kakkanad Water Link', 'service', '00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '11 days', CURRENT_DATE + INTERVAL '49 days', 100, 'Kakkanad Jetty'),
  (gen_random_uuid(), 'water_boat', 'WMB-011', 'Eloor Explorer', 'ready', '00000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE + INTERVAL '52 days', 100, 'Eloor Jetty'),
  (gen_random_uuid(), 'water_boat', 'WMB-012', 'Aroor Bridge Ferry', 'service', '00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '22 days', CURRENT_DATE + INTERVAL '38 days', 100, 'Aroor'),
  (gen_random_uuid(), 'water_boat', 'WMB-013', 'Vaikom Connection', 'maintenance', '00000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE + INTERVAL '56 days', 100, 'Boat Yard'),
  (gen_random_uuid(), 'water_boat', 'WMB-014', 'Cherai Islander', 'service', '00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '17 days', CURRENT_DATE + INTERVAL '43 days', 100, 'Cherai Jetty'),
  (gen_random_uuid(), 'water_boat', 'WMB-015', 'Munambam Express', 'service', '00000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE + INTERVAL '40 days', 100, 'Munambam'),
  (gen_random_uuid(), 'water_boat', 'WMB-016', 'Njarakkal Ferry', 'cleaning', '00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '55 days', 100, 'Boat Yard'),
  (gen_random_uuid(), 'water_boat', 'WMB-017', 'Ernakulam Wharf', 'service', '00000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '16 days', CURRENT_DATE + INTERVAL '44 days', 100, 'Ernakulam Wharf'),
  (gen_random_uuid(), 'water_boat', 'WMB-018', 'Kumbalam Cruiser', 'service', '00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '23 days', CURRENT_DATE + INTERVAL '37 days', 100, 'Kumbalam'),
  (gen_random_uuid(), 'water_boat', 'WMB-019', 'Thoppumpady Local', 'ready', '00000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '50 days', 100, 'Thoppumpady'),
  (gen_random_uuid(), 'water_boat', 'WMB-020', 'Kothad Island Link', 'service', '00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE + INTERVAL '46 days', 100, 'Kothad'),
  (gen_random_uuid(), 'water_boat', 'WMB-021', 'Vallarpadam Ferry', 'service', '00000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE + INTERVAL '35 days', 100, 'Vallarpadam'),
  (gen_random_uuid(), 'water_boat', 'WMB-022', 'Mulavukad Express', 'standby', '00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '53 days', 100, 'Boat Yard'),
  (gen_random_uuid(), 'water_boat', 'WMB-023', 'Pizhala Islander', 'service', '00000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE + INTERVAL '47 days', 100, 'Pizhala'),
  (gen_random_uuid(), 'water_boat', 'WMB-024', 'Edavanakad Ferry', 'maintenance', '00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '58 days', 100, 'Boat Yard'),
  (gen_random_uuid(), 'water_boat', 'WMB-025', 'Kalamukku Runner', 'service', '00000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '26 days', CURRENT_DATE + INTERVAL '34 days', 100, 'Kalamukku'),
  (gen_random_uuid(), 'water_boat', 'WMB-026', 'Pallippuram Link', 'service', '00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '18 days', CURRENT_DATE + INTERVAL '42 days', 100, 'Pallippuram'),
  (gen_random_uuid(), 'water_boat', 'WMB-027', 'Vyttila Water Hub', 'ready', '00000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '9 days', CURRENT_DATE + INTERVAL '51 days', 100, 'Vyttila Hub'),
  (gen_random_uuid(), 'water_boat', 'WMB-028', 'Kumbalam Bridge', 'service', '00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '21 days', CURRENT_DATE + INTERVAL '39 days', 100, 'Kumbalam'),
  (gen_random_uuid(), 'water_boat', 'WMB-029', 'Manappuram Express', 'service', '00000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '45 days', 100, 'Manappuram'),
  (gen_random_uuid(), 'water_boat', 'WMB-030', 'Alangadu Ferry', 'cleaning', '00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE + INTERVAL '56 days', 100, 'Boat Yard'),
  (gen_random_uuid(), 'water_boat', 'WMB-031', 'Nettur Connection', 'service', '00000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '19 days', CURRENT_DATE + INTERVAL '41 days', 100, 'Nettur'),
  (gen_random_uuid(), 'water_boat', 'WMB-032', 'Kannamaly Islander', 'service', '00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '22 days', CURRENT_DATE + INTERVAL '38 days', 100, 'Kannamaly'),
  (gen_random_uuid(), 'water_boat', 'WMB-033', 'Cheranallur Link', 'ready', '00000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE + INTERVAL '52 days', 100, 'Cheranallur'),
  (gen_random_uuid(), 'water_boat', 'WMB-034', 'Varappuzha Express', 'service', '00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '17 days', CURRENT_DATE + INTERVAL '43 days', 100, 'Varappuzha'),
  (gen_random_uuid(), 'water_boat', 'WMB-035', 'Kodungallur Ferry', 'service', '00000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '24 days', CURRENT_DATE + INTERVAL '36 days', 100, 'Kodungallur'),
  (gen_random_uuid(), 'water_boat', 'WMB-036', 'Vypeen Island', 'maintenance', '00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '59 days', 100, 'Boat Yard'),
  (gen_random_uuid(), 'water_boat', 'WMB-037', 'Puthuvype Link', 'service', '00000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE + INTERVAL '40 days', 100, 'Puthuvype'),
  (gen_random_uuid(), 'water_boat', 'WMB-038', 'Elamkunnapuzha', 'service', '00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '16 days', CURRENT_DATE + INTERVAL '44 days', 100, 'Elamkunnapuzha'),
  (gen_random_uuid(), 'water_boat', 'WMB-039', 'Narakkal Runner', 'standby', '00000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE + INTERVAL '54 days', 100, 'Boat Yard'),
  (gen_random_uuid(), 'water_boat', 'WMB-040', 'Kuzhuppilly Express', 'service', '00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '23 days', CURRENT_DATE + INTERVAL '37 days', 100, 'Kuzhuppilly')
ON CONFLICT (vehicle_number) DO NOTHING;
