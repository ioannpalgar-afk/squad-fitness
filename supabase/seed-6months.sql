-- =============================================
-- SQUAD FITNESS — Seed 6 Meses (180 dias)
-- Ejercicios + Rutinas PPL + Sesiones con progresion
-- + Body Metrics + Habitos para 3 usuarios
-- Ejecutar en el SQL Editor de Supabase
-- =============================================

-- =============================================
-- PASO 1: LIMPIAR DATOS EXISTENTES (orden FK)
-- =============================================
DELETE FROM session_sets;
DELETE FROM workout_sessions;
DELETE FROM routine_exercises;
DELETE FROM routines;
DELETE FROM body_metrics;
DELETE FROM routine_entries;
DELETE FROM routine_configs;
DELETE FROM exercises;

-- =============================================
-- PASO 2: CATALOGO DE EJERCICIOS PPL
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
-- PASO 3: BLOQUE PRINCIPAL — Rutinas, Sesiones,
--         Body Metrics y Habitos (180 dias)
-- =============================================
DO $$
DECLARE
  -- User IDs
  v_juan_id  uuid;
  v_cris_id  uuid;
  v_anto_id  uuid;

  -- Routine IDs (per user)
  v_push_id  uuid;
  v_pull_id  uuid;
  v_legs_id  uuid;

  -- Session generation
  v_sess_id        uuid;
  v_current_rt_id  uuid;
  v_sess_date      timestamptz;
  v_day_offset     int;
  v_routine_cycle  int;
  v_set_num        int;
  v_base_weight    numeric;
  v_week_num       int;
  v_progression    numeric;
  v_duration_min   int;
  v_reps_done      int;
  v_weight_done    numeric;
  v_ex             RECORD;
  v_i              int;

  -- Body metrics
  v_date        date;
  v_weight      numeric;
  v_bf          numeric;
  v_muscle      numeric;
  v_waist       numeric;
  v_hip         numeric;
  v_chest       numeric;
  v_bicep       numeric;
  v_thigh       numeric;
  v_calf_val    numeric;
  v_bmi         numeric;
  v_water       numeric;
  v_visc        numeric;
  v_basal       int;
  v_frac        numeric;  -- 0..1 progress fraction

  -- Habits
  v_cfg_id      uuid;
  v_rand        numeric;
  v_habit_count int;

  -- Schedule arrays — Juan 5x/week pattern [1,2,3,5,6] repeating in 7-day blocks
  -- We build them inline in the loop, so we just need the pattern offsets
  -- Pattern within each 7-day block:
  --   Juan:  day 1,2,3,5,6
  --   Cris:  day 1,2,4,5
  --   Anto phase1 (day 1-90): day 2,4,6  |  phase2 (day 91-180): day 1,3,5,6
  v_pattern_day  int;
  v_block        int;
  v_abs_day      int;
  v_is_train_day boolean;

  -- Per-user starting weights for routines (indexed by user 1=juan,2=cris,3=anto)
  v_user_idx     int;
  v_user_id      uuid;
  v_user_name    text;

  -- Weight multipliers for starting weights per user relative to Juan's base
  -- We'll use arrays for the 3 users' starting weights per exercise

  -- Push exercise starting weights: [Juan, Cris, Anto]
  -- 8 exercises in push
  push_w_1 numeric[]; -- Press Banca
  push_w_2 numeric[]; -- Press Inclinado
  push_w_3 numeric[]; -- Aperturas
  push_w_4 numeric[]; -- Press Militar
  push_w_5 numeric[]; -- Elevaciones Lat
  push_w_6 numeric[]; -- Face Pull
  push_w_7 numeric[]; -- Triceps Polea
  push_w_8 numeric[]; -- Press Frances

  -- Pull exercise starting weights
  pull_w_1 numeric[]; -- Dominadas
  pull_w_2 numeric[]; -- Jalon
  pull_w_3 numeric[]; -- Remo Barra
  pull_w_4 numeric[]; -- Remo Polea
  pull_w_5 numeric[]; -- Curl Barra
  pull_w_6 numeric[]; -- Curl Martillo
  pull_w_7 numeric[]; -- Curl Polea

  -- Legs exercise starting weights
  legs_w_1 numeric[]; -- Sentadilla
  legs_w_2 numeric[]; -- Prensa
  legs_w_3 numeric[]; -- Ext Cuad
  legs_w_4 numeric[]; -- Curl Femoral
  legs_w_5 numeric[]; -- Peso Muerto Rumano
  legs_w_6 numeric[]; -- Hip Thrust
  legs_w_7 numeric[]; -- Gemelos
  legs_w_8 numeric[]; -- Plancha (0)

  v_start_weight numeric;

BEGIN
  -- ===========================================
  -- FIND THE 3 USERS
  -- ===========================================
  SELECT id INTO v_juan_id FROM profiles WHERE name ILIKE '%juan%' LIMIT 1;
  SELECT id INTO v_cris_id FROM profiles WHERE name ILIKE '%crist%' LIMIT 1;
  SELECT id INTO v_anto_id FROM profiles WHERE name ILIKE '%antonio%' OR name ILIKE '%anto%' LIMIT 1;

  IF v_juan_id IS NULL OR v_cris_id IS NULL OR v_anto_id IS NULL THEN
    RAISE NOTICE 'No se encontraron los 3 usuarios. Juan: %, Cris: %, Anto: %',
      v_juan_id, v_cris_id, v_anto_id;
    RETURN;
  END IF;

  RAISE NOTICE 'Usuarios encontrados: Juan=%, Cris=%, Anto=%', v_juan_id, v_cris_id, v_anto_id;

  -- ===========================================
  -- STARTING WEIGHT ARRAYS [Juan, Cris, Anto]
  -- ===========================================
  -- Push
  push_w_1 := ARRAY[60, 70, 40];   -- Press Banca
  push_w_2 := ARRAY[22, 26, 16];   -- Press Inclinado Mancuernas
  push_w_3 := ARRAY[15, 18, 10];   -- Aperturas
  push_w_4 := ARRAY[40, 45, 30];   -- Press Militar
  push_w_5 := ARRAY[10, 12, 8];    -- Elevaciones Laterales
  push_w_6 := ARRAY[15, 18, 12];   -- Face Pull
  push_w_7 := ARRAY[25, 30, 18];   -- Triceps Polea
  push_w_8 := ARRAY[20, 25, 15];   -- Press Frances

  -- Pull
  pull_w_1 := ARRAY[0, 0, 0];      -- Dominadas (bodyweight)
  pull_w_2 := ARRAY[55, 60, 40];   -- Jalon al Pecho
  pull_w_3 := ARRAY[60, 70, 45];   -- Remo con Barra
  pull_w_4 := ARRAY[45, 50, 35];   -- Remo en Polea Baja
  pull_w_5 := ARRAY[30, 35, 20];   -- Curl con Barra
  pull_w_6 := ARRAY[14, 16, 10];   -- Curl Martillo
  pull_w_7 := ARRAY[20, 22, 15];   -- Curl en Polea

  -- Legs
  legs_w_1 := ARRAY[80, 90, 60];    -- Sentadilla
  legs_w_2 := ARRAY[120, 140, 90];  -- Prensa
  legs_w_3 := ARRAY[40, 45, 30];    -- Extension Cuadriceps
  legs_w_4 := ARRAY[30, 35, 25];    -- Curl Femoral Tumbado
  legs_w_5 := ARRAY[60, 70, 50];    -- Peso Muerto Rumano
  legs_w_6 := ARRAY[80, 90, 60];    -- Hip Thrust
  legs_w_7 := ARRAY[60, 70, 45];    -- Gemelos
  legs_w_8 := ARRAY[0, 0, 0];       -- Plancha (bodyweight)

  -- ===========================================
  -- LOOP OVER EACH USER
  -- ===========================================
  FOR v_user_idx IN 1..3 LOOP

    IF v_user_idx = 1 THEN
      v_user_id := v_juan_id;
      v_user_name := 'Juan';
    ELSIF v_user_idx = 2 THEN
      v_user_id := v_cris_id;
      v_user_name := 'Cristobal';
    ELSE
      v_user_id := v_anto_id;
      v_user_name := 'Antonio';
    END IF;

    RAISE NOTICE 'Generando datos para % (idx=%)', v_user_name, v_user_idx;

    -- =========================================
    -- CREATE PPL ROUTINES
    -- =========================================

    -- PUSH
    INSERT INTO routines (user_id, name, description)
    VALUES (v_user_id, 'Push (Pecho + Hombros + Triceps)', 'Dia de empuje: pectorales, deltoides y triceps')
    RETURNING id INTO v_push_id;

    INSERT INTO routine_exercises (routine_id, exercise_id, sets_target, reps_target, weight_target, sort_order) VALUES
      (v_push_id, 'a0000001-0000-0000-0000-000000000001', 4,  8,  push_w_1[v_user_idx], 1),
      (v_push_id, 'a0000001-0000-0000-0000-000000000002', 4,  10, push_w_2[v_user_idx], 2),
      (v_push_id, 'a0000001-0000-0000-0000-000000000003', 3,  12, push_w_3[v_user_idx], 3),
      (v_push_id, 'a0000002-0000-0000-0000-000000000001', 4,  8,  push_w_4[v_user_idx], 4),
      (v_push_id, 'a0000002-0000-0000-0000-000000000002', 4,  15, push_w_5[v_user_idx], 5),
      (v_push_id, 'a0000002-0000-0000-0000-000000000003', 3,  15, push_w_6[v_user_idx], 6),
      (v_push_id, 'a0000003-0000-0000-0000-000000000001', 3,  12, push_w_7[v_user_idx], 7),
      (v_push_id, 'a0000003-0000-0000-0000-000000000002', 3,  10, push_w_8[v_user_idx], 8);

    -- PULL
    INSERT INTO routines (user_id, name, description)
    VALUES (v_user_id, 'Pull (Espalda + Biceps)', 'Dia de tiron: dorsales, trapecios y biceps')
    RETURNING id INTO v_pull_id;

    INSERT INTO routine_exercises (routine_id, exercise_id, sets_target, reps_target, weight_target, sort_order) VALUES
      (v_pull_id, 'a0000004-0000-0000-0000-000000000001', 4,  8,  pull_w_1[v_user_idx], 1),
      (v_pull_id, 'a0000004-0000-0000-0000-000000000002', 4,  10, pull_w_2[v_user_idx], 2),
      (v_pull_id, 'a0000004-0000-0000-0000-000000000003', 4,  8,  pull_w_3[v_user_idx], 3),
      (v_pull_id, 'a0000004-0000-0000-0000-000000000004', 3,  12, pull_w_4[v_user_idx], 4),
      (v_pull_id, 'a0000005-0000-0000-0000-000000000001', 3,  10, pull_w_5[v_user_idx], 5),
      (v_pull_id, 'a0000005-0000-0000-0000-000000000002', 3,  12, pull_w_6[v_user_idx], 6),
      (v_pull_id, 'a0000005-0000-0000-0000-000000000003', 3,  12, pull_w_7[v_user_idx], 7);

    -- LEGS
    INSERT INTO routines (user_id, name, description)
    VALUES (v_user_id, 'Legs (Piernas + Core)', 'Dia de piernas: cuadriceps, femorales, gluteos y core')
    RETURNING id INTO v_legs_id;

    INSERT INTO routine_exercises (routine_id, exercise_id, sets_target, reps_target, weight_target, sort_order) VALUES
      (v_legs_id, 'a0000006-0000-0000-0000-000000000001', 4,  8,  legs_w_1[v_user_idx], 1),
      (v_legs_id, 'a0000006-0000-0000-0000-000000000002', 4,  10, legs_w_2[v_user_idx], 2),
      (v_legs_id, 'a0000006-0000-0000-0000-000000000003', 3,  12, legs_w_3[v_user_idx], 3),
      (v_legs_id, 'a0000007-0000-0000-0000-000000000001', 4,  10, legs_w_4[v_user_idx], 4),
      (v_legs_id, 'a0000007-0000-0000-0000-000000000002', 4,  8,  legs_w_5[v_user_idx], 5),
      (v_legs_id, 'a0000008-0000-0000-0000-000000000001', 4,  10, legs_w_6[v_user_idx], 6),
      (v_legs_id, 'a0000009-0000-0000-0000-000000000001', 4,  15, legs_w_7[v_user_idx], 7),
      (v_legs_id, 'a000000a-0000-0000-0000-000000000001', 3,  1,  legs_w_8[v_user_idx], 8);

    -- =========================================
    -- GENERATE 180 DAYS OF WORKOUT SESSIONS
    -- =========================================
    v_routine_cycle := 0;

    FOR v_day_offset IN REVERSE 180..1 LOOP
      -- Determine if this is a training day for this user
      -- v_day_offset goes from 180 (oldest) down to 1 (yesterday)
      -- block = which 7-day block (0-indexed)
      v_block := (v_day_offset - 1) / 7;
      -- pattern_day = position within the 7-day block (1-indexed, 1=Mon equivalent)
      v_pattern_day := ((v_day_offset - 1) % 7) + 1;
      v_is_train_day := false;

      IF v_user_idx = 1 THEN
        -- Juan: pattern [1,2,3,5,6]
        IF v_pattern_day IN (1,2,3,5,6) THEN
          v_is_train_day := true;
        END IF;
      ELSIF v_user_idx = 2 THEN
        -- Cristobal: pattern [1,2,4,5]
        IF v_pattern_day IN (1,2,4,5) THEN
          v_is_train_day := true;
        END IF;
      ELSE
        -- Antonio: first 90 days (day_offset 180..91) pattern [2,4,6], last 90 (90..1) pattern [1,3,5,6]
        IF v_day_offset > 90 THEN
          -- Phase 1: 3x/week
          IF v_pattern_day IN (2,4,6) THEN
            v_is_train_day := true;
          END IF;
        ELSE
          -- Phase 2: 4x/week
          IF v_pattern_day IN (1,3,5,6) THEN
            v_is_train_day := true;
          END IF;
        END IF;
      END IF;

      IF NOT v_is_train_day THEN
        CONTINUE;
      END IF;

      -- Cycle through Push -> Pull -> Legs
      v_routine_cycle := v_routine_cycle + 1;
      CASE (v_routine_cycle % 3)
        WHEN 1 THEN v_current_rt_id := v_push_id;
        WHEN 2 THEN v_current_rt_id := v_pull_id;
        WHEN 0 THEN v_current_rt_id := v_legs_id;
      END CASE;

      -- Week number (0-indexed from start, for progressive overload)
      -- day_offset 180 = week 0, day_offset 1 = week ~25
      v_week_num := (180 - v_day_offset) / 7;

      -- Progressive overload: ~2% per week compounded
      -- Over 25 weeks: (1.02)^25 ~ 1.64 = 64% gain
      -- This matches the specified gains (e.g. bench 60->90 = 50% for Juan)
      v_progression := power(1.02, v_week_num::numeric);

      -- Session time: random between 7:00 and 20:00
      v_sess_date := (CURRENT_DATE - v_day_offset)::timestamptz
                     + ((7 + floor(random() * 13))::int || ' hours')::interval
                     + (floor(random() * 60)::int || ' minutes')::interval;

      v_duration_min := 45 + floor(random() * 30)::int;

      INSERT INTO workout_sessions (user_id, routine_id, started_at, finished_at, duration_minutes)
      VALUES (
        v_user_id,
        v_current_rt_id,
        v_sess_date,
        v_sess_date + (v_duration_min || ' minutes')::interval,
        v_duration_min
      )
      RETURNING id INTO v_sess_id;

      -- Generate sets for each exercise in the routine
      FOR v_ex IN
        SELECT re.exercise_id, re.sets_target, re.reps_target, re.weight_target, re.sort_order
        FROM routine_exercises re
        WHERE re.routine_id = v_current_rt_id
        ORDER BY re.sort_order
      LOOP
        FOR v_set_num IN 1..v_ex.sets_target LOOP
          -- Calculate weight with progressive overload
          v_start_weight := v_ex.weight_target;

          IF v_start_weight > 0 THEN
            v_base_weight := v_start_weight * v_progression;
            -- Round to nearest 2.5 kg, add small random variation (-2.5 to +2.5)
            v_weight_done := round((v_base_weight + (random() * 5.0 - 2.5)) / 2.5) * 2.5;
            IF v_weight_done < 2.5 THEN v_weight_done := 2.5; END IF;
          ELSE
            -- Bodyweight exercises (Dominadas, Plancha): weight = 0
            v_weight_done := 0;
          END IF;

          -- Reps with variation: base +/- 2, last sets have fatigue
          v_reps_done := v_ex.reps_target + floor(random() * 3)::int - 1;
          IF v_set_num >= v_ex.sets_target THEN
            -- Last set fatigue: lose 0-2 reps
            v_reps_done := v_reps_done - floor(random() * 3)::int;
          ELSIF v_set_num = v_ex.sets_target - 1 THEN
            -- Second to last: might lose 0-1 rep
            v_reps_done := v_reps_done - floor(random() * 2)::int;
          END IF;
          IF v_reps_done < 1 THEN v_reps_done := 1; END IF;

          INSERT INTO session_sets (session_id, exercise_id, set_number, reps, weight, completed)
          VALUES (v_sess_id, v_ex.exercise_id, v_set_num, v_reps_done, v_weight_done, true);
        END LOOP;
      END LOOP;

    END LOOP; -- day_offset loop

    RAISE NOTICE '  % sesiones generadas para %', v_routine_cycle, v_user_name;

    -- =========================================
    -- BODY METRICS: 180 DAYS
    -- Weekly full measurements + daily weight
    -- =========================================

    FOR v_day_offset IN REVERSE 180..0 LOOP
      v_date := CURRENT_DATE - v_day_offset;
      -- Progress fraction: 0.0 at day 180 (start), 1.0 at day 0 (today)
      v_frac := (180.0 - v_day_offset::numeric) / 180.0;

      IF v_user_idx = 1 THEN
        -- JUAN: 82kg->76kg, 20%->13% BF, chest 100->106, waist 86->78, bicep 34->38
        v_weight := 82.0 + (76.0 - 82.0) * v_frac + (random() - 0.5) * 0.8;
        v_bf     := 20.0 + (13.0 - 20.0) * v_frac + (random() - 0.5) * 0.6;
        v_muscle := 35.0 + 3.0 * v_frac + (random() - 0.5) * 0.4;
        v_chest  := 100.0 + (106.0 - 100.0) * v_frac + (random() - 0.5) * 0.4;
        v_waist  := 86.0 + (78.0 - 86.0) * v_frac + (random() - 0.5) * 0.4;
        v_hip    := 96.0 + (93.0 - 96.0) * v_frac;
        v_bicep  := 34.0 + (38.0 - 34.0) * v_frac + (random() - 0.5) * 0.3;
        v_thigh  := 56.0 + (59.0 - 56.0) * v_frac;
        v_calf_val := 37.0 + 1.0 * v_frac;
        v_water  := 58.0 + 5.0 * v_frac + (random() - 0.5) * 0.4;
        v_visc   := GREATEST(8.0 - 3.0 * v_frac, 5.0);
        v_basal  := (1750 + (80 * v_frac))::int;
        v_bmi    := round((v_weight / (1.78 * 1.78))::numeric, 1);
      ELSIF v_user_idx = 2 THEN
        -- CRISTOBAL: 88kg->83kg, 22%->16% BF, chest 104->110, waist 90->84, bicep 36->40
        v_weight := 88.0 + (83.0 - 88.0) * v_frac + (random() - 0.5) * 1.0;
        v_bf     := 22.0 + (16.0 - 22.0) * v_frac + (random() - 0.5) * 0.6;
        v_muscle := 38.0 + 3.5 * v_frac + (random() - 0.5) * 0.4;
        v_chest  := 104.0 + (110.0 - 104.0) * v_frac + (random() - 0.5) * 0.4;
        v_waist  := 90.0 + (84.0 - 90.0) * v_frac + (random() - 0.5) * 0.5;
        v_hip    := 100.0 + (97.0 - 100.0) * v_frac;
        v_bicep  := 36.0 + (40.0 - 36.0) * v_frac + (random() - 0.5) * 0.3;
        v_thigh  := 59.0 + (62.0 - 59.0) * v_frac;
        v_calf_val := 39.0 + 1.0 * v_frac;
        v_water  := 56.0 + 5.0 * v_frac + (random() - 0.5) * 0.5;
        v_visc   := GREATEST(10.0 - 3.5 * v_frac, 6.0);
        v_basal  := (1830 + (70 * v_frac))::int;
        v_bmi    := round((v_weight / (1.82 * 1.82))::numeric, 1);
      ELSE
        -- ANTONIO: 68kg->74kg, 16%->12% BF, chest 92->100, waist 74->76, bicep 30->35
        v_weight := 68.0 + (74.0 - 68.0) * v_frac + (random() - 0.5) * 0.6;
        v_bf     := 16.0 + (12.0 - 16.0) * v_frac + (random() - 0.5) * 0.5;
        v_muscle := 32.0 + 4.0 * v_frac + (random() - 0.5) * 0.3;
        v_chest  := 92.0 + (100.0 - 92.0) * v_frac + (random() - 0.5) * 0.4;
        v_waist  := 74.0 + (76.0 - 74.0) * v_frac + (random() - 0.5) * 0.3;
        v_hip    := 90.0 + (93.0 - 90.0) * v_frac;
        v_bicep  := 30.0 + (35.0 - 30.0) * v_frac + (random() - 0.5) * 0.3;
        v_thigh  := 52.0 + (56.0 - 52.0) * v_frac;
        v_calf_val := 35.0 + 1.5 * v_frac;
        v_water  := 62.0 + 3.0 * v_frac + (random() - 0.5) * 0.3;
        v_visc   := GREATEST(6.0 - 2.0 * v_frac, 4.0);
        v_basal  := (1650 + (100 * v_frac))::int;
        v_bmi    := round((v_weight / (1.73 * 1.73))::numeric, 1);
      END IF;

      -- Every 7 days: FULL measurement entry (all body composition data)
      IF (v_day_offset % 7) = 0 THEN
        INSERT INTO body_metrics (
          user_id, date,
          weight, body_fat_pct, muscle_mass, body_water_pct,
          visceral_fat, basal_metabolism, bmi,
          chest, waist, hip,
          bicep_right, bicep_left,
          thigh_right, thigh_left, calf,
          notes
        ) VALUES (
          v_user_id,
          v_date::timestamptz + interval '8 hours',
          round(v_weight::numeric, 2),
          round(GREATEST(v_bf, 8.0)::numeric, 1),
          round(v_muscle::numeric, 2),
          round(GREATEST(v_water, 50.0)::numeric, 1),
          round(GREATEST(v_visc, 3.0)::numeric, 0),
          v_basal,
          round(v_bmi::numeric, 1),
          round(v_chest::numeric, 1),
          round(v_waist::numeric, 1),
          round(v_hip::numeric, 1),
          round(v_bicep::numeric, 1),
          round((v_bicep - 0.3)::numeric, 1),
          round(v_thigh::numeric, 1),
          round((v_thigh - 0.2)::numeric, 1),
          round(v_calf_val::numeric, 1),
          CASE
            WHEN v_frac < 0.1 THEN 'Medicion inicial'
            WHEN v_frac > 0.9 THEN 'Medicion reciente - gran progreso!'
            ELSE NULL
          END
        );
      ELSE
        -- Non-weekly days: daily weight-only entry with fluctuation
        INSERT INTO body_metrics (user_id, date, weight)
        VALUES (
          v_user_id,
          v_date::timestamptz + interval '7 hours' + (floor(random() * 120)::int || ' minutes')::interval,
          round(v_weight::numeric, 2)
        );
      END IF;

    END LOOP; -- body metrics day loop

    RAISE NOTICE '  Body metrics (180 dias) generados para %', v_user_name;

  END LOOP; -- user loop

  -- =========================================
  -- HABITS: ROUTINE CONFIGS + 180 DAYS ENTRIES
  -- =========================================

  -- Clean any that might exist (shouldn't since we cleaned above, but safe)
  -- Already cleaned in PASO 1

  -- ==================
  -- JUAN: 5 habits, ~93% completion
  -- ==================
  INSERT INTO routine_configs (user_id, name, icon, frequency, sort_order) VALUES
    (v_juan_id, 'Gym',          'gym',         'daily', 0),
    (v_juan_id, 'Hidratacion',  'hidratacion', 'daily', 1),
    (v_juan_id, 'Sueno 8h',    'sueno',       'daily', 2),
    (v_juan_id, 'Nutricion',    'nutricion',   'daily', 3),
    (v_juan_id, 'Codigo',       'codigo',      'daily', 4);

  FOR v_day_offset IN REVERSE 180..1 LOOP
    v_date := CURRENT_DATE - v_day_offset;
    v_rand := random();

    IF v_rand < 0.93 THEN
      -- Complete day: all 5 habits
      FOR v_cfg_id IN (SELECT id FROM routine_configs WHERE user_id = v_juan_id ORDER BY sort_order) LOOP
        INSERT INTO routine_entries (user_id, routine_config_id, date, completed, completed_at)
        VALUES (
          v_juan_id, v_cfg_id, v_date, true,
          v_date::timestamptz + interval '7 hours' + (floor(random() * 600)::int || ' minutes')::interval
        );
      END LOOP;
    ELSIF v_rand < 0.97 THEN
      -- Partial day: 2-3 habits
      v_habit_count := 0;
      FOR v_cfg_id IN (SELECT id FROM routine_configs WHERE user_id = v_juan_id ORDER BY sort_order) LOOP
        v_habit_count := v_habit_count + 1;
        EXIT WHEN v_habit_count > 2 + floor(random() * 2)::int;
        INSERT INTO routine_entries (user_id, routine_config_id, date, completed, completed_at)
        VALUES (
          v_juan_id, v_cfg_id, v_date, true,
          v_date::timestamptz + interval '8 hours' + (floor(random() * 480)::int || ' minutes')::interval
        );
      END LOOP;
    END IF;
    -- else: ~3% days fully skipped
  END LOOP;

  RAISE NOTICE '  Habitos (180 dias) generados para Juan';

  -- ==================
  -- CRISTOBAL: 5 habits, ~85% completion
  -- ==================
  INSERT INTO routine_configs (user_id, name, icon, frequency, sort_order) VALUES
    (v_cris_id, 'Meditacion',  'meditacion', 'daily', 0),
    (v_cris_id, 'Gym',         'gym',        'daily', 1),
    (v_cris_id, 'Lectura',     'lectura',    'daily', 2),
    (v_cris_id, 'Journaling',  'journaling', 'daily', 3),
    (v_cris_id, 'Madrugar',    'madrugar',   'daily', 4);

  FOR v_day_offset IN REVERSE 180..1 LOOP
    v_date := CURRENT_DATE - v_day_offset;
    v_rand := random();

    IF v_rand < 0.85 THEN
      -- Complete day
      FOR v_cfg_id IN (SELECT id FROM routine_configs WHERE user_id = v_cris_id ORDER BY sort_order) LOOP
        INSERT INTO routine_entries (user_id, routine_config_id, date, completed, completed_at)
        VALUES (
          v_cris_id, v_cfg_id, v_date, true,
          v_date::timestamptz + interval '6 hours' + (floor(random() * 660)::int || ' minutes')::interval
        );
      END LOOP;
    ELSIF v_rand < 0.93 THEN
      -- Partial day: 2-3 habits
      v_habit_count := 0;
      FOR v_cfg_id IN (SELECT id FROM routine_configs WHERE user_id = v_cris_id ORDER BY sort_order) LOOP
        v_habit_count := v_habit_count + 1;
        EXIT WHEN v_habit_count > 2 + floor(random() * 2)::int;
        INSERT INTO routine_entries (user_id, routine_config_id, date, completed, completed_at)
        VALUES (
          v_cris_id, v_cfg_id, v_date, true,
          v_date::timestamptz + interval '6 hours' + (floor(random() * 540)::int || ' minutes')::interval
        );
      END LOOP;
    END IF;
    -- else: ~7% days fully skipped
  END LOOP;

  RAISE NOTICE '  Habitos (180 dias) generados para Cristobal';

  -- ==================
  -- ANTONIO: 4 habits, ~75% completion
  -- ==================
  INSERT INTO routine_configs (user_id, name, icon, frequency, sort_order) VALUES
    (v_anto_id, 'Cardio',        'cardio',       'daily', 0),
    (v_anto_id, 'Gym',           'gym',          'daily', 1),
    (v_anto_id, 'Ducha fria',    'duchaFria',    'daily', 2),
    (v_anto_id, 'Digital Detox', 'digitalDetox', 'daily', 3);

  FOR v_day_offset IN REVERSE 180..1 LOOP
    v_date := CURRENT_DATE - v_day_offset;
    v_rand := random();

    IF v_rand < 0.75 THEN
      -- Complete day
      FOR v_cfg_id IN (SELECT id FROM routine_configs WHERE user_id = v_anto_id ORDER BY sort_order) LOOP
        INSERT INTO routine_entries (user_id, routine_config_id, date, completed, completed_at)
        VALUES (
          v_anto_id, v_cfg_id, v_date, true,
          v_date::timestamptz + interval '9 hours' + (floor(random() * 540)::int || ' minutes')::interval
        );
      END LOOP;
    ELSIF v_rand < 0.88 THEN
      -- Partial day: 1-2 habits
      v_habit_count := 0;
      FOR v_cfg_id IN (SELECT id FROM routine_configs WHERE user_id = v_anto_id ORDER BY sort_order) LOOP
        v_habit_count := v_habit_count + 1;
        EXIT WHEN v_habit_count > 1 + floor(random() * 2)::int;
        INSERT INTO routine_entries (user_id, routine_config_id, date, completed, completed_at)
        VALUES (
          v_anto_id, v_cfg_id, v_date, true,
          v_date::timestamptz + interval '10 hours' + (floor(random() * 480)::int || ' minutes')::interval
        );
      END LOOP;
    END IF;
    -- else: ~12% days fully skipped
  END LOOP;

  RAISE NOTICE '  Habitos (180 dias) generados para Antonio';
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'SEED DE 6 MESES COMPLETADO EXITOSAMENTE!';
  RAISE NOTICE '=========================================';

END $$;

-- =============================================
-- PASO 4: VERIFICACION
-- =============================================

-- Resumen de sesiones y volumen
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

-- Resumen de body metrics
SELECT
  p.name,
  count(bm.id) as total_mediciones,
  count(bm.chest) as mediciones_completas,
  round(min(bm.weight)::numeric, 1) as peso_min,
  round(max(bm.weight)::numeric, 1) as peso_max,
  round(min(bm.body_fat_pct)::numeric, 1) as bf_min,
  round(max(bm.body_fat_pct)::numeric, 1) as bf_max
FROM profiles p
LEFT JOIN body_metrics bm ON bm.user_id = p.id
GROUP BY p.name
ORDER BY total_mediciones DESC;

-- Resumen de habitos
SELECT
  p.name,
  count(DISTINCT rc.id) as num_habitos,
  count(re.id) as entries_totales,
  round(count(re.id)::numeric / GREATEST(count(DISTINCT rc.id), 1) / 180.0 * 100, 1) as pct_completado
FROM profiles p
LEFT JOIN routine_configs rc ON rc.user_id = p.id
LEFT JOIN routine_entries re ON re.routine_config_id = rc.id AND re.completed = true
GROUP BY p.name
ORDER BY pct_completado DESC;
