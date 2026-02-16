-- =============================================
-- SQUAD FITNESS — RESET COMPLETO
-- Ejecutar en el SQL Editor de Supabase
-- Borra TODO y recrea desde cero
-- =============================================

-- =============================================
-- PASO 0: BORRAR TODO
-- =============================================
DROP TABLE IF EXISTS challenge_participants CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS activity_events CASCADE;
DROP TABLE IF EXISTS workout_template_exercises CASCADE;
DROP TABLE IF EXISTS workout_templates CASCADE;
DROP TABLE IF EXISTS session_sets CASCADE;
DROP TABLE IF EXISTS workout_sessions CASCADE;
DROP TABLE IF EXISTS routine_exercises CASCADE;
DROP TABLE IF EXISTS routines CASCADE;
DROP TABLE IF EXISTS routine_entries CASCADE;
DROP TABLE IF EXISTS routine_configs CASCADE;
DROP TABLE IF EXISTS body_metrics CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Limpiar auth
DELETE FROM auth.identities;
DELETE FROM auth.sessions;
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.mfa_factors;
DELETE FROM auth.users;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- =============================================
-- PASO 1: SCHEMA — TABLAS + RLS + TRIGGER
-- =============================================

-- PROFILES
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name text NOT NULL,
  avatar_url text,
  nickname text,
  color text DEFAULT '#00F0FF',
  squad_role text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos pueden ver perfiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Usuarios editan su perfil" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Usuarios insertan su perfil" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger: crear perfil al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (new.id, coalesce(new.raw_user_meta_data->>'name', 'Usuario'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- EXERCISES
CREATE TABLE exercises (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  muscle_group text NOT NULL,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos pueden ver ejercicios" ON exercises FOR SELECT USING (true);
CREATE POLICY "Usuarios crean ejercicios" ON exercises FOR INSERT WITH CHECK (auth.uid() = created_by);

-- ROUTINES
CREATE TABLE routines (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos pueden ver rutinas" ON routines FOR SELECT USING (true);
CREATE POLICY "Usuarios gestionan sus rutinas" ON routines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios editan sus rutinas" ON routines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuarios eliminan sus rutinas" ON routines FOR DELETE USING (auth.uid() = user_id);

-- ROUTINE_EXERCISES
CREATE TABLE routine_exercises (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id uuid REFERENCES routines(id) ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES exercises(id) NOT NULL,
  sets_target int DEFAULT 3,
  reps_target int DEFAULT 10,
  weight_target numeric(6,2),
  sort_order int DEFAULT 0,
  rest_seconds int DEFAULT 90
);
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos pueden ver ejercicios de rutina" ON routine_exercises FOR SELECT USING (true);
CREATE POLICY "Duenos insertan ejercicios en rutina" ON routine_exercises FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM routines WHERE id = routine_id AND user_id = auth.uid()));
CREATE POLICY "Duenos editan ejercicios en rutina" ON routine_exercises FOR UPDATE
  USING (EXISTS (SELECT 1 FROM routines WHERE id = routine_id AND user_id = auth.uid()));
CREATE POLICY "Duenos eliminan ejercicios de rutina" ON routine_exercises FOR DELETE
  USING (EXISTS (SELECT 1 FROM routines WHERE id = routine_id AND user_id = auth.uid()));

-- WORKOUT_SESSIONS
CREATE TABLE workout_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  routine_id uuid REFERENCES routines(id),
  started_at timestamptz DEFAULT now(),
  finished_at timestamptz,
  duration_minutes int,
  notes text,
  type text DEFAULT 'strength'
);
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos pueden ver sesiones" ON workout_sessions FOR SELECT USING (true);
CREATE POLICY "Usuarios crean sus sesiones" ON workout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios editan sus sesiones" ON workout_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuarios eliminan sus sesiones" ON workout_sessions FOR DELETE USING (auth.uid() = user_id);

-- SESSION_SETS
CREATE TABLE session_sets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES workout_sessions(id) ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES exercises(id) NOT NULL,
  set_number int NOT NULL,
  reps int,
  weight numeric(6,2),
  completed boolean DEFAULT false,
  rpe int,
  set_type text DEFAULT 'normal',
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE session_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos pueden ver sets" ON session_sets FOR SELECT USING (true);
CREATE POLICY "Duenos insertan sets" ON session_sets FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM workout_sessions WHERE id = session_id AND user_id = auth.uid()));
CREATE POLICY "Duenos editan sets" ON session_sets FOR UPDATE
  USING (EXISTS (SELECT 1 FROM workout_sessions WHERE id = session_id AND user_id = auth.uid()));
CREATE POLICY "Duenos eliminan sets" ON session_sets FOR DELETE
  USING (EXISTS (SELECT 1 FROM workout_sessions WHERE id = session_id AND user_id = auth.uid()));

-- ROUTINE_CONFIGS (hábitos)
CREATE TABLE routine_configs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  icon text,
  frequency text DEFAULT 'daily',
  target numeric,
  unit text,
  active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE routine_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos ven configs" ON routine_configs FOR SELECT USING (true);
CREATE POLICY "Usuarios gestionan sus configs" ON routine_configs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios editan sus configs" ON routine_configs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuarios eliminan sus configs" ON routine_configs FOR DELETE USING (auth.uid() = user_id);

-- ROUTINE_ENTRIES (registro diario de hábitos)
CREATE TABLE routine_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  routine_config_id uuid REFERENCES routine_configs(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  completed boolean DEFAULT false,
  value numeric,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, routine_config_id, date)
);
ALTER TABLE routine_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos ven entries" ON routine_entries FOR SELECT USING (true);
CREATE POLICY "Usuarios crean entries" ON routine_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios editan entries" ON routine_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuarios eliminan entries" ON routine_entries FOR DELETE USING (auth.uid() = user_id);

-- BODY_METRICS
CREATE TABLE body_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date timestamptz DEFAULT now(),
  weight numeric(5,2),
  body_fat_pct numeric(4,1),
  muscle_mass numeric(5,2),
  body_water_pct numeric(4,1),
  visceral_fat numeric(3,0),
  basal_metabolism int,
  metabolic_age int,
  bmi numeric(4,1),
  bone_mass numeric(4,2),
  chest numeric(5,1),
  waist numeric(5,1),
  hip numeric(5,1),
  bicep_right numeric(5,1),
  bicep_left numeric(5,1),
  thigh_right numeric(5,1),
  thigh_left numeric(5,1),
  calf numeric(5,1),
  photo_front text,
  photo_side text,
  photo_back text,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE body_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos ven metricas" ON body_metrics FOR SELECT USING (true);
CREATE POLICY "Usuarios crean metricas" ON body_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios editan metricas" ON body_metrics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuarios eliminan metricas" ON body_metrics FOR DELETE USING (auth.uid() = user_id);

-- USER_BADGES
CREATE TABLE user_badges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos ven badges" ON user_badges FOR SELECT USING (true);
CREATE POLICY "Usuarios ganan badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ACTIVITY_EVENTS
CREATE TABLE activity_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos ven actividad" ON activity_events FOR SELECT USING (true);
CREATE POLICY "Usuarios crean eventos" ON activity_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CHALLENGES
CREATE TABLE challenges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by uuid REFERENCES profiles(id) NOT NULL,
  name text NOT NULL,
  description text,
  type text DEFAULT 'streak',
  target numeric,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos ven desafios" ON challenges FOR SELECT USING (true);
CREATE POLICY "Usuarios crean desafios" ON challenges FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE TABLE challenge_participants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  current_value numeric DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos ven participantes" ON challenge_participants FOR SELECT USING (true);
CREATE POLICY "Usuarios se unen" ON challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios actualizan" ON challenge_participants FOR UPDATE USING (auth.uid() = user_id);

-- GOALS
CREATE TABLE goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  metric text NOT NULL,
  target_value numeric NOT NULL,
  start_value numeric,
  start_date date DEFAULT CURRENT_DATE,
  deadline date,
  achieved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos ven goals" ON goals FOR SELECT USING (true);
CREATE POLICY "Usuarios crean goals" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios editan goals" ON goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuarios eliminan goals" ON goals FOR DELETE USING (auth.uid() = user_id);

-- WORKOUT_TEMPLATES
CREATE TABLE workout_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos ven templates" ON workout_templates FOR SELECT USING (true);
CREATE POLICY "Usuarios crean templates" ON workout_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios editan templates" ON workout_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuarios eliminan templates" ON workout_templates FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE workout_template_exercises (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid REFERENCES workout_templates(id) ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES exercises(id) NOT NULL,
  default_sets int DEFAULT 3,
  default_reps int DEFAULT 10,
  rest_seconds int DEFAULT 90,
  sort_order int DEFAULT 0
);
ALTER TABLE workout_template_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos ven template exercises" ON workout_template_exercises FOR SELECT USING (true);
CREATE POLICY "Duenos insertan" ON workout_template_exercises FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM workout_templates WHERE id = template_id AND user_id = auth.uid()));
CREATE POLICY "Duenos editan" ON workout_template_exercises FOR UPDATE
  USING (EXISTS (SELECT 1 FROM workout_templates WHERE id = template_id AND user_id = auth.uid()));
CREATE POLICY "Duenos eliminan" ON workout_template_exercises FOR DELETE
  USING (EXISTS (SELECT 1 FROM workout_templates WHERE id = template_id AND user_id = auth.uid()));

-- =============================================
-- PASO 2: CREAR LOS 3 USUARIOS
-- (con emails derivados + contraseña fija)
-- =============================================

-- Juan
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  aud, role, confirmation_token
) VALUES (
  'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa',
  '00000000-0000-0000-0000-000000000000',
  'juan@squad.app',
  crypt('squad-fitness-2024!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Juan"}',
  'authenticated', 'authenticated', ''
);

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa',
  'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa',
  '{"sub":"aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa","email":"juan@squad.app"}',
  'email',
  'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa',
  now(), now(), now()
);

-- Cristobal
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  aud, role, confirmation_token
) VALUES (
  'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb',
  '00000000-0000-0000-0000-000000000000',
  'cristobal@squad.app',
  crypt('squad-fitness-2024!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Cristóbal"}',
  'authenticated', 'authenticated', ''
);

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb',
  'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb',
  '{"sub":"bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb","email":"cristobal@squad.app"}',
  'email',
  'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb',
  now(), now(), now()
);

-- Antonio
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  aud, role, confirmation_token
) VALUES (
  'cccccccc-3333-3333-3333-cccccccccccc',
  '00000000-0000-0000-0000-000000000000',
  'antonio@squad.app',
  crypt('squad-fitness-2024!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Antonio"}',
  'authenticated', 'authenticated', ''
);

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  'cccccccc-3333-3333-3333-cccccccccccc',
  'cccccccc-3333-3333-3333-cccccccccccc',
  '{"sub":"cccccccc-3333-3333-3333-cccccccccccc","email":"antonio@squad.app"}',
  'email',
  'cccccccc-3333-3333-3333-cccccccccccc',
  now(), now(), now()
);

-- Actualizar profiles con nicknames y colores
UPDATE profiles SET nickname = 'El Tanque',      color = '#00F0FF' WHERE id = 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa';
UPDATE profiles SET nickname = 'El Estratega',   color = '#BF00FF' WHERE id = 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb';
UPDATE profiles SET nickname = 'El Loco Rápido', color = '#FF3D5A' WHERE id = 'cccccccc-3333-3333-3333-cccccccccccc';

-- =============================================
-- PASO 3: CATÁLOGO DE EJERCICIOS PPL
-- =============================================
INSERT INTO exercises (id, name, muscle_group) VALUES
-- PUSH (Pecho)
('a0000001-0000-0000-0000-000000000001', 'Press Banca', 'Pecho'),
('a0000001-0000-0000-0000-000000000002', 'Press Inclinado Mancuernas', 'Pecho'),
('a0000001-0000-0000-0000-000000000003', 'Aperturas con Poleas', 'Pecho'),
('a0000001-0000-0000-0000-000000000004', 'Fondos en Paralelas', 'Pecho'),
-- PUSH (Hombros)
('a0000002-0000-0000-0000-000000000001', 'Press Militar', 'Hombros'),
('a0000002-0000-0000-0000-000000000002', 'Elevaciones Laterales', 'Hombros'),
('a0000002-0000-0000-0000-000000000003', 'Face Pull', 'Hombros'),
('a0000002-0000-0000-0000-000000000004', 'Pájaros (Reverse Fly)', 'Hombros'),
-- PUSH (Triceps)
('a0000003-0000-0000-0000-000000000001', 'Extensión de Tríceps en Polea', 'Tríceps'),
('a0000003-0000-0000-0000-000000000002', 'Press Francés', 'Tríceps'),
('a0000003-0000-0000-0000-000000000003', 'Fondos en Banco', 'Tríceps'),
-- PULL (Espalda)
('a0000004-0000-0000-0000-000000000001', 'Dominadas', 'Espalda'),
('a0000004-0000-0000-0000-000000000002', 'Jalón al Pecho', 'Espalda'),
('a0000004-0000-0000-0000-000000000003', 'Remo con Barra', 'Espalda'),
('a0000004-0000-0000-0000-000000000004', 'Remo en Polea Baja', 'Espalda'),
('a0000004-0000-0000-0000-000000000005', 'Remo con Mancuerna', 'Espalda'),
-- PULL (Biceps)
('a0000005-0000-0000-0000-000000000001', 'Curl con Barra', 'Bíceps'),
('a0000005-0000-0000-0000-000000000002', 'Curl Martillo', 'Bíceps'),
('a0000005-0000-0000-0000-000000000003', 'Curl en Polea', 'Bíceps'),
('a0000005-0000-0000-0000-000000000004', 'Curl Concentrado', 'Bíceps'),
-- LEGS (Cuadriceps)
('a0000006-0000-0000-0000-000000000001', 'Sentadilla', 'Cuádriceps'),
('a0000006-0000-0000-0000-000000000002', 'Prensa de Piernas', 'Cuádriceps'),
('a0000006-0000-0000-0000-000000000003', 'Extensión de Cuádriceps', 'Cuádriceps'),
('a0000006-0000-0000-0000-000000000004', 'Sentadilla Búlgara', 'Cuádriceps'),
('a0000006-0000-0000-0000-000000000005', 'Zancadas', 'Cuádriceps'),
-- LEGS (Femoral)
('a0000007-0000-0000-0000-000000000001', 'Curl Femoral Tumbado', 'Femoral'),
('a0000007-0000-0000-0000-000000000002', 'Peso Muerto Rumano', 'Femoral'),
('a0000007-0000-0000-0000-000000000003', 'Curl Femoral Sentado', 'Femoral'),
-- LEGS (Gluteo)
('a0000008-0000-0000-0000-000000000001', 'Hip Thrust', 'Glúteo'),
('a0000008-0000-0000-0000-000000000002', 'Patada de Gluteo en Polea', 'Glúteo'),
-- LEGS (Gemelos)
('a0000009-0000-0000-0000-000000000001', 'Elevación de Gemelos de Pie', 'Gemelos'),
('a0000009-0000-0000-0000-000000000002', 'Elevación de Gemelos Sentado', 'Gemelos'),
-- CORE
('a000000a-0000-0000-0000-000000000001', 'Plancha', 'Core'),
('a000000a-0000-0000-0000-000000000002', 'Crunch en Polea', 'Core'),
('a000000a-0000-0000-0000-000000000003', 'Elevación de Piernas', 'Core'),
('a000000a-0000-0000-0000-000000000004', 'Russian Twist', 'Core'),
('a000000a-0000-0000-0000-000000000005', 'Ab Wheel', 'Core');

-- =============================================
-- PASO 4: VERIFICACIÓN
-- =============================================
SELECT
  p.name, p.nickname, p.color, u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.name;
