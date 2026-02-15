-- =============================================
-- GymTracker - Schema completo para Supabase
-- Ejecutar en el SQL Editor de Supabase
-- =============================================

-- 1. PROFILES
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  avatar_url text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Todos pueden ver perfiles"
  on profiles for select using (true);

create policy "Usuarios editan su perfil"
  on profiles for update using (auth.uid() = id);

create policy "Usuarios insertan su perfil"
  on profiles for insert with check (auth.uid() = id);

-- Trigger: crear perfil automáticamente al registrarse
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Usuario'));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 2. EXERCISES (catálogo compartido)
create table if not exists exercises (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  muscle_group text not null,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

alter table exercises enable row level security;

create policy "Todos pueden ver ejercicios"
  on exercises for select using (true);

create policy "Usuarios autenticados crean ejercicios"
  on exercises for insert with check (auth.uid() = created_by);

-- 3. ROUTINES
create table if not exists routines (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table routines enable row level security;

create policy "Todos pueden ver rutinas"
  on routines for select using (true);

create policy "Usuarios gestionan sus rutinas"
  on routines for insert with check (auth.uid() = user_id);

create policy "Usuarios editan sus rutinas"
  on routines for update using (auth.uid() = user_id);

create policy "Usuarios eliminan sus rutinas"
  on routines for delete using (auth.uid() = user_id);

-- 4. ROUTINE_EXERCISES
create table if not exists routine_exercises (
  id uuid default gen_random_uuid() primary key,
  routine_id uuid references routines(id) on delete cascade not null,
  exercise_id uuid references exercises(id) not null,
  sets_target int default 3,
  reps_target int default 10,
  weight_target numeric(6,2),
  sort_order int default 0,
  rest_seconds int default 90
);

alter table routine_exercises enable row level security;

create policy "Todos pueden ver ejercicios de rutina"
  on routine_exercises for select using (true);

create policy "Dueños insertan ejercicios en rutina"
  on routine_exercises for insert
  with check (exists (select 1 from routines where id = routine_id and user_id = auth.uid()));

create policy "Dueños editan ejercicios en rutina"
  on routine_exercises for update
  using (exists (select 1 from routines where id = routine_id and user_id = auth.uid()));

create policy "Dueños eliminan ejercicios de rutina"
  on routine_exercises for delete
  using (exists (select 1 from routines where id = routine_id and user_id = auth.uid()));

-- 5. WORKOUT_SESSIONS
create table if not exists workout_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  routine_id uuid references routines(id),
  started_at timestamptz default now(),
  finished_at timestamptz,
  duration_minutes int,
  notes text
);

alter table workout_sessions enable row level security;

create policy "Todos pueden ver sesiones"
  on workout_sessions for select using (true);

create policy "Usuarios crean sus sesiones"
  on workout_sessions for insert with check (auth.uid() = user_id);

create policy "Usuarios editan sus sesiones"
  on workout_sessions for update using (auth.uid() = user_id);

create policy "Usuarios eliminan sus sesiones"
  on workout_sessions for delete using (auth.uid() = user_id);

-- 6. SESSION_SETS
create table if not exists session_sets (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references workout_sessions(id) on delete cascade not null,
  exercise_id uuid references exercises(id) not null,
  set_number int not null,
  reps int,
  weight numeric(6,2),
  completed boolean default false,
  created_at timestamptz default now()
);

alter table session_sets enable row level security;

create policy "Todos pueden ver sets"
  on session_sets for select using (true);

create policy "Dueños insertan sets"
  on session_sets for insert
  with check (exists (select 1 from workout_sessions where id = session_id and user_id = auth.uid()));

create policy "Dueños editan sets"
  on session_sets for update
  using (exists (select 1 from workout_sessions where id = session_id and user_id = auth.uid()));

create policy "Dueños eliminan sets"
  on session_sets for delete
  using (exists (select 1 from workout_sessions where id = session_id and user_id = auth.uid()));

-- =============================================
-- SEED: Ejercicios comunes
-- =============================================

insert into exercises (name, muscle_group) values
  ('Press de banca', 'Pecho'),
  ('Press inclinado con mancuernas', 'Pecho'),
  ('Aperturas con mancuernas', 'Pecho'),
  ('Fondos en paralelas', 'Pecho'),
  ('Dominadas', 'Espalda'),
  ('Remo con barra', 'Espalda'),
  ('Remo con mancuerna', 'Espalda'),
  ('Jalón al pecho', 'Espalda'),
  ('Peso muerto', 'Espalda'),
  ('Press militar', 'Hombros'),
  ('Elevaciones laterales', 'Hombros'),
  ('Elevaciones frontales', 'Hombros'),
  ('Pájaros', 'Hombros'),
  ('Sentadilla', 'Piernas'),
  ('Prensa de piernas', 'Piernas'),
  ('Extensión de cuádriceps', 'Piernas'),
  ('Curl femoral', 'Piernas'),
  ('Zancadas', 'Piernas'),
  ('Elevación de gemelos', 'Piernas'),
  ('Curl de bíceps con barra', 'Bíceps'),
  ('Curl de bíceps con mancuernas', 'Bíceps'),
  ('Curl martillo', 'Bíceps'),
  ('Extensión de tríceps en polea', 'Tríceps'),
  ('Press francés', 'Tríceps'),
  ('Fondos en banco', 'Tríceps'),
  ('Plancha', 'Core'),
  ('Crunch abdominal', 'Core'),
  ('Elevación de piernas', 'Core');
