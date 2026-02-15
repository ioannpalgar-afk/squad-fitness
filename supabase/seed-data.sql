-- =============================================
-- SQUAD FITNESS — SEED COMPLETO
-- Ejercicios + Rutinas PPL + 1 mes de datos fake
-- =============================================

-- 1. LIMPIAR DATOS EXISTENTES
DELETE FROM session_sets;
DELETE FROM workout_sessions;
DELETE FROM routine_exercises;
DELETE FROM routines;
DELETE FROM exercises;

-- 2. CATÁLOGO DE EJERCICIOS PPL
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
-- PUSH (Tríceps)
('a0000003-0000-0000-0000-000000000001', 'Extensión de Tríceps en Polea', 'Tríceps'),
('a0000003-0000-0000-0000-000000000002', 'Press Francés', 'Tríceps'),
('a0000003-0000-0000-0000-000000000003', 'Fondos en Banco', 'Tríceps'),
-- PULL (Espalda)
('a0000004-0000-0000-0000-000000000001', 'Dominadas', 'Espalda'),
('a0000004-0000-0000-0000-000000000002', 'Jalón al Pecho', 'Espalda'),
('a0000004-0000-0000-0000-000000000003', 'Remo con Barra', 'Espalda'),
('a0000004-0000-0000-0000-000000000004', 'Remo en Polea Baja', 'Espalda'),
('a0000004-0000-0000-0000-000000000005', 'Remo con Mancuerna', 'Espalda'),
-- PULL (Bíceps)
('a0000005-0000-0000-0000-000000000001', 'Curl con Barra', 'Bíceps'),
('a0000005-0000-0000-0000-000000000002', 'Curl Martillo', 'Bíceps'),
('a0000005-0000-0000-0000-000000000003', 'Curl en Polea', 'Bíceps'),
('a0000005-0000-0000-0000-000000000004', 'Curl Concentrado', 'Bíceps'),
-- LEGS (Cuádriceps)
('a0000006-0000-0000-0000-000000000001', 'Sentadilla', 'Cuádriceps'),
('a0000006-0000-0000-0000-000000000002', 'Prensa de Piernas', 'Cuádriceps'),
('a0000006-0000-0000-0000-000000000003', 'Extensión de Cuádriceps', 'Cuádriceps'),
('a0000006-0000-0000-0000-000000000004', 'Sentadilla Búlgara', 'Cuádriceps'),
('a0000006-0000-0000-0000-000000000005', 'Zancadas', 'Cuádriceps'),
-- LEGS (Femoral)
('a0000007-0000-0000-0000-000000000001', 'Curl Femoral Tumbado', 'Femoral'),
('a0000007-0000-0000-0000-000000000002', 'Peso Muerto Rumano', 'Femoral'),
('a0000007-0000-0000-0000-000000000003', 'Curl Femoral Sentado', 'Femoral'),
-- LEGS (Glúteo)
('a0000008-0000-0000-0000-000000000001', 'Hip Thrust', 'Glúteo'),
('a0000008-0000-0000-0000-000000000002', 'Patada de Glúteo en Polea', 'Glúteo'),
-- LEGS (Gemelos)
('a0000009-0000-0000-0000-000000000001', 'Elevación de Gemelos de Pie', 'Gemelos'),
('a0000009-0000-0000-0000-000000000002', 'Elevación de Gemelos Sentado', 'Gemelos'),
-- CORE
('a000000a-0000-0000-0000-000000000001', 'Plancha', 'Core'),
('a000000a-0000-0000-0000-000000000002', 'Crunch en Polea', 'Core'),
('a000000a-0000-0000-0000-000000000003', 'Elevación de Piernas', 'Core'),
('a000000a-0000-0000-0000-000000000004', 'Russian Twist', 'Core'),
('a000000a-0000-0000-0000-000000000005', 'Ab Wheel', 'Core');

-- 3. CREAR RUTINAS PPL + GENERAR 1 MES DE DATOS PARA CADA USUARIO
DO $$
DECLARE
  usr RECORD;
  push_id uuid;
  pull_id uuid;
  legs_id uuid;
  sess_id uuid;
  current_routine_id uuid;
  sess_date timestamptz;
  day_offset int;
  routine_cycle int;
  set_num int;
  base_weight numeric;
  week_num int;
  progression numeric;
  workout_count int;
  duration_min int;
  ex RECORD;
  reps_done int;
  weight_done numeric;
  -- Schedule: arrays of day offsets for each user (different activity levels)
  -- Juan: 5x/week beast mode
  juan_days int[] := ARRAY[1,2,3,5,6, 8,9,10,12,13, 15,16,17,19,20, 22,23,24,26,27, 29,30];
  -- Cristobal: 4x/week solid
  cris_days int[] := ARRAY[1,3,5,6, 8,10,12,13, 15,17,19,20, 22,24,26,27, 29,30];
  -- Antonio: 3x/week but improving
  anto_days int[] := ARRAY[2,4,6, 9,11,13, 16,18,20, 23,25,27, 29];
  user_days int[];
  i int;
BEGIN
  FOR usr IN SELECT id, name FROM profiles LOOP

    -- ========== CREAR RUTINAS ==========

    -- PUSH
    INSERT INTO routines (id, user_id, name)
    VALUES (gen_random_uuid(), usr.id, 'Push (Pecho + Hombros + Tríceps)')
    RETURNING id INTO push_id;

    INSERT INTO routine_exercises (routine_id, exercise_id, sets_target, reps_target, weight_target, sort_order) VALUES
    (push_id, 'a0000001-0000-0000-0000-000000000001', 4, 8, 60, 1),   -- Press Banca
    (push_id, 'a0000001-0000-0000-0000-000000000002', 4, 10, 22, 2),  -- Press Inclinado
    (push_id, 'a0000001-0000-0000-0000-000000000003', 3, 12, 15, 3),  -- Aperturas
    (push_id, 'a0000002-0000-0000-0000-000000000001', 4, 8, 40, 4),   -- Press Militar
    (push_id, 'a0000002-0000-0000-0000-000000000002', 4, 15, 10, 5),  -- Elevaciones Lat
    (push_id, 'a0000002-0000-0000-0000-000000000003', 3, 15, 15, 6),  -- Face Pull
    (push_id, 'a0000003-0000-0000-0000-000000000001', 3, 12, 25, 7),  -- Tríceps Polea
    (push_id, 'a0000003-0000-0000-0000-000000000002', 3, 10, 20, 8);  -- Press Francés

    -- PULL
    INSERT INTO routines (id, user_id, name)
    VALUES (gen_random_uuid(), usr.id, 'Pull (Espalda + Bíceps)')
    RETURNING id INTO pull_id;

    INSERT INTO routine_exercises (routine_id, exercise_id, sets_target, reps_target, weight_target, sort_order) VALUES
    (pull_id, 'a0000004-0000-0000-0000-000000000001', 4, 8, 0, 1),    -- Dominadas
    (pull_id, 'a0000004-0000-0000-0000-000000000002', 4, 10, 55, 2),  -- Jalón al Pecho
    (pull_id, 'a0000004-0000-0000-0000-000000000003', 4, 8, 60, 3),   -- Remo Barra
    (pull_id, 'a0000004-0000-0000-0000-000000000004', 3, 12, 45, 4),  -- Remo Polea
    (pull_id, 'a0000005-0000-0000-0000-000000000001', 3, 10, 30, 5),  -- Curl Barra
    (pull_id, 'a0000005-0000-0000-0000-000000000002', 3, 12, 14, 6),  -- Curl Martillo
    (pull_id, 'a0000005-0000-0000-0000-000000000003', 3, 12, 20, 7);  -- Curl Polea

    -- LEGS
    INSERT INTO routines (id, user_id, name)
    VALUES (gen_random_uuid(), usr.id, 'Legs (Piernas + Core)')
    RETURNING id INTO legs_id;

    INSERT INTO routine_exercises (routine_id, exercise_id, sets_target, reps_target, weight_target, sort_order) VALUES
    (legs_id, 'a0000006-0000-0000-0000-000000000001', 4, 8, 80, 1),    -- Sentadilla
    (legs_id, 'a0000006-0000-0000-0000-000000000002', 4, 10, 120, 2),  -- Prensa
    (legs_id, 'a0000006-0000-0000-0000-000000000003', 3, 12, 40, 3),   -- Extensión Cuád
    (legs_id, 'a0000007-0000-0000-0000-000000000001', 4, 10, 30, 4),   -- Curl Femoral
    (legs_id, 'a0000007-0000-0000-0000-000000000002', 4, 8, 60, 5),    -- Peso Muerto Rum
    (legs_id, 'a0000008-0000-0000-0000-000000000001', 4, 10, 80, 6),   -- Hip Thrust
    (legs_id, 'a0000009-0000-0000-0000-000000000001', 4, 15, 60, 7),   -- Gemelos
    (legs_id, 'a000000a-0000-0000-0000-000000000001', 3, 1, 0, 8);     -- Plancha

    -- ========== GENERAR SESIONES DE ENTRENAMIENTO ==========

    -- Elegir schedule según nombre
    IF lower(usr.name) = 'juan' THEN
      user_days := juan_days;
    ELSIF lower(usr.name) LIKE 'crist%' THEN
      user_days := cris_days;
    ELSE
      user_days := anto_days;
    END IF;

    routine_cycle := 0;

    FOR i IN 1..array_length(user_days, 1) LOOP
      day_offset := user_days[i];
      week_num := day_offset / 7;
      -- Progresión: +2.5% por semana
      progression := 1.0 + (week_num * 0.025);

      -- Ciclar Push -> Pull -> Legs
      routine_cycle := routine_cycle + 1;
      CASE (routine_cycle % 3)
        WHEN 1 THEN current_routine_id := push_id;
        WHEN 2 THEN current_routine_id := pull_id;
        WHEN 0 THEN current_routine_id := legs_id;
      END CASE;

      -- Hora random entre 7:00 y 21:00
      sess_date := (now() - (day_offset || ' days')::interval)
                   + ((7 + floor(random() * 14)) || ' hours')::interval
                   + (floor(random() * 60) || ' minutes')::interval;

      duration_min := 45 + floor(random() * 30)::int; -- 45-75 min

      INSERT INTO workout_sessions (id, user_id, routine_id, started_at, finished_at, duration_minutes)
      VALUES (
        gen_random_uuid(),
        usr.id,
        current_routine_id,
        sess_date,
        sess_date + (duration_min || ' minutes')::interval,
        duration_min
      )
      RETURNING id INTO sess_id;

      -- Generar sets para cada ejercicio de la rutina
      FOR ex IN
        SELECT re.exercise_id, re.sets_target, re.reps_target, re.weight_target, re.sort_order
        FROM routine_exercises re
        WHERE re.routine_id = current_routine_id
        ORDER BY re.sort_order
      LOOP
        FOR set_num IN 1..ex.sets_target LOOP
          -- Peso con progresión semanal + variación random (-5% a +5%)
          base_weight := ex.weight_target * progression;
          weight_done := round((base_weight * (0.95 + random() * 0.1)) / 2.5) * 2.5;
          IF weight_done < 0 THEN weight_done := 0; END IF;

          -- Reps con ligera variación (±2), últimos sets pueden tener menos
          reps_done := ex.reps_target + floor(random() * 3)::int - 1;
          IF set_num >= ex.sets_target THEN
            reps_done := reps_done - floor(random() * 2)::int; -- fatiga
          END IF;
          IF reps_done < 1 THEN reps_done := 1; END IF;

          INSERT INTO session_sets (session_id, exercise_id, set_number, reps, weight, completed)
          VALUES (sess_id, ex.exercise_id, set_num, reps_done, weight_done, true);
        END LOOP;
      END LOOP;

    END LOOP;

  END LOOP;
END $$;

-- 4. VERIFICAR DATOS GENERADOS
SELECT
  p.name,
  count(DISTINCT ws.id) as sesiones,
  count(ss.id) as sets_totales,
  round(sum(ss.weight * ss.reps)) as volumen_total_kg
FROM profiles p
LEFT JOIN workout_sessions ws ON ws.user_id = p.id
LEFT JOIN session_sets ss ON ss.session_id = ws.id
GROUP BY p.name
ORDER BY sesiones DESC;
