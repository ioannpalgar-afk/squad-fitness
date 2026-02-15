-- =============================================
-- SQUAD FITNESS — Schema V2
-- Ejecutar en el SQL Editor de Supabase
-- (después del schema original)
-- =============================================

-- Actualizar tabla profiles con campos squad
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nickname text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS color text DEFAULT '#00F0FF';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS squad_role text;

-- =============================================
-- ROUTINE CONFIGS (hábitos configurados por usuario)
-- =============================================
CREATE TABLE IF NOT EXISTS routine_configs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  icon text, -- nombre del archivo de icono
  frequency text DEFAULT 'daily', -- 'daily' o número de días/semana
  target numeric, -- meta numérica (vasos, minutos, etc.)
  unit text, -- unidad de la meta
  active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE routine_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos ven configs" ON routine_configs FOR SELECT USING (true);
CREATE POLICY "Usuarios gestionan sus configs" ON routine_configs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios editan sus configs" ON routine_configs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuarios eliminan sus configs" ON routine_configs FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- ROUTINE ENTRIES (registro diario de hábitos)
-- =============================================
CREATE TABLE IF NOT EXISTS routine_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  routine_config_id uuid REFERENCES routine_configs(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  completed boolean DEFAULT false,
  value numeric, -- valor si tiene meta numérica
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, routine_config_id, date)
);

ALTER TABLE routine_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos ven entries" ON routine_entries FOR SELECT USING (true);
CREATE POLICY "Usuarios crean entries" ON routine_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios editan entries" ON routine_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuarios eliminan entries" ON routine_entries FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- BODY METRICS (mediciones corporales)
-- =============================================
CREATE TABLE IF NOT EXISTS body_metrics (
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
  -- Circunferencias (cm)
  chest numeric(5,1),
  waist numeric(5,1),
  hip numeric(5,1),
  bicep_right numeric(5,1),
  bicep_left numeric(5,1),
  thigh_right numeric(5,1),
  thigh_left numeric(5,1),
  calf numeric(5,1),
  -- Fotos
  photo_front text,
  photo_side text,
  photo_back text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE body_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos ven métricas" ON body_metrics FOR SELECT USING (true);
CREATE POLICY "Usuarios crean métricas" ON body_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios editan métricas" ON body_metrics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuarios eliminan métricas" ON body_metrics FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- USER BADGES
-- =============================================
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos ven badges" ON user_badges FOR SELECT USING (true);
CREATE POLICY "Usuarios ganan badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- ACTIVITY EVENTS (feed social)
-- =============================================
CREATE TABLE IF NOT EXISTS activity_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL, -- routine_complete, workout_logged, new_pr, streak_milestone, badge_unlocked, body_metrics, all_routines_done, taunt
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos ven actividad" ON activity_events FOR SELECT USING (true);
CREATE POLICY "Usuarios crean eventos" ON activity_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- CHALLENGES (desafíos entre amigos)
-- =============================================
CREATE TABLE IF NOT EXISTS challenges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by uuid REFERENCES profiles(id) NOT NULL,
  name text NOT NULL,
  description text,
  type text DEFAULT 'streak', -- streak, volume, bodyfat, custom
  target numeric,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos ven desafíos" ON challenges FOR SELECT USING (true);
CREATE POLICY "Usuarios crean desafíos" ON challenges FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE TABLE IF NOT EXISTS challenge_participants (
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

-- =============================================
-- GOALS (metas personales)
-- =============================================
CREATE TABLE IF NOT EXISTS goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  metric text NOT NULL, -- weight, bodyFat, muscleMass, etc.
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

-- =============================================
-- WORKOUT TEMPLATES
-- =============================================
CREATE TABLE IF NOT EXISTS workout_templates (
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

CREATE TABLE IF NOT EXISTS workout_template_exercises (
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
CREATE POLICY "Dueños insertan" ON workout_template_exercises FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM workout_templates WHERE id = template_id AND user_id = auth.uid()));
CREATE POLICY "Dueños editan" ON workout_template_exercises FOR UPDATE
  USING (EXISTS (SELECT 1 FROM workout_templates WHERE id = template_id AND user_id = auth.uid()));
CREATE POLICY "Dueños eliminan" ON workout_template_exercises FOR DELETE
  USING (EXISTS (SELECT 1 FROM workout_templates WHERE id = template_id AND user_id = auth.uid()));

-- =============================================
-- Actualizar session_sets con campos extra
-- =============================================
ALTER TABLE session_sets ADD COLUMN IF NOT EXISTS rpe int;
ALTER TABLE session_sets ADD COLUMN IF NOT EXISTS set_type text DEFAULT 'normal';
ALTER TABLE session_sets ADD COLUMN IF NOT EXISTS notes text;

-- =============================================
-- Actualizar workout_sessions con tipo
-- =============================================
ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS type text DEFAULT 'strength';
