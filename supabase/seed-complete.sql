-- =============================================
-- SQUAD FITNESS — Seed Completo
-- Datos biométricos + hábitos para los 3 usuarios
-- Ejecutar en el SQL Editor de Supabase
-- =============================================

DO $$
DECLARE
  v_juan_id uuid;
  v_cris_id uuid;
  v_anto_id uuid;
  v_date date;
  v_cfg_id uuid;
  v_day int;
  -- Body metrics vars
  v_weight numeric;
  v_bf numeric;
  v_muscle numeric;
  v_waist numeric;
  v_hip numeric;
  v_chest numeric;
  v_bicep numeric;
  v_thigh numeric;
BEGIN
  -- Obtener IDs
  SELECT id INTO v_juan_id FROM profiles WHERE name ILIKE '%juan%' LIMIT 1;
  SELECT id INTO v_cris_id FROM profiles WHERE name ILIKE '%crist%' LIMIT 1;
  SELECT id INTO v_anto_id FROM profiles WHERE name ILIKE '%antonio%' OR name ILIKE '%anto%' LIMIT 1;

  IF v_juan_id IS NULL OR v_cris_id IS NULL OR v_anto_id IS NULL THEN
    RAISE NOTICE 'No se encontraron los 3 usuarios. Juan: %, Cris: %, Anto: %', v_juan_id, v_cris_id, v_anto_id;
    RETURN;
  END IF;

  -- =============================================
  -- LIMPIAR datos previos
  -- =============================================
  DELETE FROM body_metrics WHERE user_id IN (v_juan_id, v_cris_id, v_anto_id);
  DELETE FROM routine_entries WHERE user_id IN (v_juan_id, v_cris_id, v_anto_id);
  DELETE FROM routine_configs WHERE user_id IN (v_juan_id, v_cris_id, v_anto_id);

  -- =============================================
  -- ROUTINE CONFIGS (hábitos)
  -- =============================================

  -- Juan: 5 hábitos (muy disciplinado)
  INSERT INTO routine_configs (user_id, name, icon, frequency, sort_order) VALUES
    (v_juan_id, 'Gym',          'gym',         'daily', 0),
    (v_juan_id, 'Hidratación',  'hidratacion', 'daily', 1),
    (v_juan_id, 'Sueño 8h',    'sueno',       'daily', 2),
    (v_juan_id, 'Nutrición',    'nutricion',   'daily', 3),
    (v_juan_id, 'Código',       'codigo',      'daily', 4);

  -- Cristóbal: 5 hábitos (estratégico)
  INSERT INTO routine_configs (user_id, name, icon, frequency, sort_order) VALUES
    (v_cris_id, 'Meditación',  'meditacion', 'daily', 0),
    (v_cris_id, 'Gym',         'gym',        'daily', 1),
    (v_cris_id, 'Lectura',     'lectura',    'daily', 2),
    (v_cris_id, 'Journaling',  'journaling', 'daily', 3),
    (v_cris_id, 'Madrugar',    'madrugar',   'daily', 4);

  -- Antonio: 4 hábitos (intenso pero irregular)
  INSERT INTO routine_configs (user_id, name, icon, frequency, sort_order) VALUES
    (v_anto_id, 'Cardio',        'cardio',       'daily', 0),
    (v_anto_id, 'Gym',           'gym',          'daily', 1),
    (v_anto_id, 'Ducha fría',    'duchaFria',    'daily', 2),
    (v_anto_id, 'Digital Detox', 'digitalDetox', 'daily', 3);

  -- =============================================
  -- ROUTINE ENTRIES (30 días de hábitos)
  -- =============================================

  -- Juan: 28/30 días completos, racha actual ~12
  FOR v_day IN 1..30 LOOP
    v_date := CURRENT_DATE - v_day;
    IF v_day IN (13, 25) THEN
      -- Días parciales
      FOR v_cfg_id IN (SELECT id FROM routine_configs WHERE user_id = v_juan_id ORDER BY sort_order LIMIT 2) LOOP
        INSERT INTO routine_entries (user_id, routine_config_id, date, completed, completed_at)
        VALUES (v_juan_id, v_cfg_id, v_date, true, v_date + interval '8 hours' + (random() * interval '4 hours'));
      END LOOP;
    ELSE
      FOR v_cfg_id IN (SELECT id FROM routine_configs WHERE user_id = v_juan_id ORDER BY sort_order) LOOP
        INSERT INTO routine_entries (user_id, routine_config_id, date, completed, completed_at)
        VALUES (v_juan_id, v_cfg_id, v_date, true, v_date + interval '7 hours' + (random() * interval '6 hours'));
      END LOOP;
    END IF;
  END LOOP;

  -- Cristóbal: 24/30 días, racha actual ~8
  FOR v_day IN 1..30 LOOP
    v_date := CURRENT_DATE - v_day;
    IF v_day IN (9, 15, 20, 22, 26, 28) THEN
      IF random() > 0.5 THEN
        FOR v_cfg_id IN (SELECT id FROM routine_configs WHERE user_id = v_cris_id ORDER BY sort_order LIMIT 3) LOOP
          INSERT INTO routine_entries (user_id, routine_config_id, date, completed, completed_at)
          VALUES (v_cris_id, v_cfg_id, v_date, true, v_date + interval '6 hours' + (random() * interval '5 hours'));
        END LOOP;
      END IF;
    ELSE
      FOR v_cfg_id IN (SELECT id FROM routine_configs WHERE user_id = v_cris_id ORDER BY sort_order) LOOP
        INSERT INTO routine_entries (user_id, routine_config_id, date, completed, completed_at)
        VALUES (v_cris_id, v_cfg_id, v_date, true, v_date + interval '5 hours' + (random() * interval '8 hours'));
      END LOOP;
    END IF;
  END LOOP;

  -- Antonio: 20/30 días, racha actual ~5
  FOR v_day IN 1..30 LOOP
    v_date := CURRENT_DATE - v_day;
    IF v_day IN (6, 10, 12, 14, 17, 19, 21, 24, 27, 29) THEN
      IF random() > 0.3 THEN
        FOR v_cfg_id IN (SELECT id FROM routine_configs WHERE user_id = v_anto_id ORDER BY sort_order LIMIT 2) LOOP
          INSERT INTO routine_entries (user_id, routine_config_id, date, completed, completed_at)
          VALUES (v_anto_id, v_cfg_id, v_date, true, v_date + interval '9 hours' + (random() * interval '6 hours'));
        END LOOP;
      END IF;
    ELSE
      FOR v_cfg_id IN (SELECT id FROM routine_configs WHERE user_id = v_anto_id ORDER BY sort_order) LOOP
        INSERT INTO routine_entries (user_id, routine_config_id, date, completed, completed_at)
        VALUES (v_anto_id, v_cfg_id, v_date, true, v_date + interval '10 hours' + (random() * interval '5 hours'));
      END LOOP;
    END IF;
  END LOOP;

  -- =============================================
  -- BODY METRICS (90 días, medición semanal)
  -- =============================================

  -- JUAN: 78kg→75.5kg, 18%→14.5% BF (definición exitosa)
  -- Atleta disciplinado, pierde grasa, mantiene músculo
  FOR v_day IN 0..12 LOOP
    v_date := CURRENT_DATE - (v_day * 7);
    v_weight := 78.0 - (v_day * 0.19) + (random() * 0.6 - 0.3);
    v_bf := 18.0 - (v_day * 0.27) + (random() * 0.4 - 0.2);
    v_muscle := 40.5 + (v_day * 0.08) + (random() * 0.3 - 0.15);
    v_waist := 82.0 - (v_day * 0.3) + (random() * 0.5 - 0.25);
    v_hip := 96.0 - (v_day * 0.1);
    v_chest := 102.0 + (v_day * 0.05);
    v_bicep := 36.5 + (v_day * 0.08);
    v_thigh := 58.0 + (v_day * 0.04);

    INSERT INTO body_metrics (
      user_id, date, weight, body_fat_pct, muscle_mass,
      waist, hip, chest, bicep_right, bicep_left,
      thigh_right, thigh_left, calf,
      bmi, body_water_pct, visceral_fat, basal_metabolism
    ) VALUES (
      v_juan_id,
      v_date + interval '8 hours',
      ROUND(v_weight::numeric, 1),
      ROUND(GREATEST(v_bf, 10)::numeric, 1),
      ROUND(v_muscle::numeric, 1),
      ROUND(v_waist::numeric, 1),
      ROUND(v_hip::numeric, 1),
      ROUND(v_chest::numeric, 1),
      ROUND(v_bicep::numeric, 1),
      ROUND((v_bicep - 0.3)::numeric, 1),
      ROUND(v_thigh::numeric, 1),
      ROUND((v_thigh - 0.2)::numeric, 1),
      ROUND((38.0 + v_day * 0.03)::numeric, 1),
      ROUND((v_weight / (1.78 * 1.78))::numeric, 1),
      ROUND((58.0 + v_day * 0.3)::numeric, 1),
      ROUND(GREATEST(8 - v_day * 0.15, 5)::numeric, 0),
      1780 + v_day * 5
    );
  END LOOP;

  -- CRISTÓBAL: 85kg→83kg, 20%→17% BF (recomposición lenta)
  -- Entrena consistente, come bien, progresa lento pero seguro
  FOR v_day IN 0..12 LOOP
    v_date := CURRENT_DATE - (v_day * 7);
    v_weight := 85.0 - (v_day * 0.15) + (random() * 0.8 - 0.4);
    v_bf := 20.0 - (v_day * 0.23) + (random() * 0.5 - 0.25);
    v_muscle := 42.0 + (v_day * 0.1) + (random() * 0.3 - 0.15);
    v_waist := 88.0 - (v_day * 0.25);
    v_hip := 100.0 - (v_day * 0.08);
    v_chest := 106.0 + (v_day * 0.06);
    v_bicep := 37.0 + (v_day * 0.1);
    v_thigh := 60.0 + (v_day * 0.05);

    INSERT INTO body_metrics (
      user_id, date, weight, body_fat_pct, muscle_mass,
      waist, hip, chest, bicep_right, bicep_left,
      thigh_right, thigh_left, calf,
      bmi, body_water_pct, visceral_fat, basal_metabolism
    ) VALUES (
      v_cris_id,
      v_date + interval '9 hours',
      ROUND(v_weight::numeric, 1),
      ROUND(GREATEST(v_bf, 12)::numeric, 1),
      ROUND(v_muscle::numeric, 1),
      ROUND(v_waist::numeric, 1),
      ROUND(v_hip::numeric, 1),
      ROUND(v_chest::numeric, 1),
      ROUND(v_bicep::numeric, 1),
      ROUND((v_bicep - 0.4)::numeric, 1),
      ROUND(v_thigh::numeric, 1),
      ROUND((v_thigh - 0.3)::numeric, 1),
      ROUND((39.5 + v_day * 0.02)::numeric, 1),
      ROUND((v_weight / (1.82 * 1.82))::numeric, 1),
      ROUND((56.0 + v_day * 0.35)::numeric, 1),
      ROUND(GREATEST(10 - v_day * 0.2, 6)::numeric, 0),
      1850 + v_day * 4
    );
  END LOOP;

  -- ANTONIO: 70kg→73kg, 15%→13% BF (volumen limpio)
  -- El más ligero, ganando músculo de forma limpia
  FOR v_day IN 0..12 LOOP
    v_date := CURRENT_DATE - (v_day * 7);
    v_weight := 70.0 + (v_day * 0.23) + (random() * 0.5 - 0.25);
    v_bf := 15.0 - (v_day * 0.15) + (random() * 0.3 - 0.15);
    v_muscle := 38.0 + (v_day * 0.15) + (random() * 0.2 - 0.1);
    v_waist := 76.0 + (v_day * 0.05);
    v_hip := 92.0 + (v_day * 0.06);
    v_chest := 96.0 + (v_day * 0.12);
    v_bicep := 33.5 + (v_day * 0.12);
    v_thigh := 54.0 + (v_day * 0.1);

    INSERT INTO body_metrics (
      user_id, date, weight, body_fat_pct, muscle_mass,
      waist, hip, chest, bicep_right, bicep_left,
      thigh_right, thigh_left, calf,
      bmi, body_water_pct, visceral_fat, basal_metabolism
    ) VALUES (
      v_anto_id,
      v_date + interval '7 hours',
      ROUND(v_weight::numeric, 1),
      ROUND(GREATEST(v_bf, 10)::numeric, 1),
      ROUND(v_muscle::numeric, 1),
      ROUND(v_waist::numeric, 1),
      ROUND(v_hip::numeric, 1),
      ROUND(v_chest::numeric, 1),
      ROUND(v_bicep::numeric, 1),
      ROUND((v_bicep - 0.2)::numeric, 1),
      ROUND(v_thigh::numeric, 1),
      ROUND((v_thigh - 0.1)::numeric, 1),
      ROUND((36.0 + v_day * 0.05)::numeric, 1),
      ROUND((v_weight / (1.73 * 1.73))::numeric, 1),
      ROUND((62.0 + v_day * 0.2)::numeric, 1),
      ROUND(GREATEST(6 - v_day * 0.1, 4)::numeric, 0),
      1680 + v_day * 6
    );
  END LOOP;

  -- =============================================
  -- Datos diarios de peso (más granulares, últimos 30 días)
  -- Para la gráfica de trend weight
  -- =============================================

  -- Juan: pesadas diarias
  FOR v_day IN 0..29 LOOP
    v_date := CURRENT_DATE - v_day;
    -- Skip si ya hay dato semanal para esta fecha
    IF NOT EXISTS (SELECT 1 FROM body_metrics WHERE user_id = v_juan_id AND date::date = v_date) THEN
      v_weight := 75.5 + (v_day * 0.08) + (sin(v_day * 0.5) * 0.4) + (random() * 0.6 - 0.3);
      INSERT INTO body_metrics (user_id, date, weight)
      VALUES (v_juan_id, v_date + interval '7 hours', ROUND(v_weight::numeric, 1));
    END IF;
  END LOOP;

  -- Cristóbal: pesa 4-5 veces por semana
  FOR v_day IN 0..29 LOOP
    v_date := CURRENT_DATE - v_day;
    IF random() > 0.3 AND NOT EXISTS (SELECT 1 FROM body_metrics WHERE user_id = v_cris_id AND date::date = v_date) THEN
      v_weight := 83.0 + (v_day * 0.06) + (sin(v_day * 0.4) * 0.5) + (random() * 0.8 - 0.4);
      INSERT INTO body_metrics (user_id, date, weight)
      VALUES (v_cris_id, v_date + interval '8 hours', ROUND(v_weight::numeric, 1));
    END IF;
  END LOOP;

  -- Antonio: pesa 3-4 veces por semana
  FOR v_day IN 0..29 LOOP
    v_date := CURRENT_DATE - v_day;
    IF random() > 0.45 AND NOT EXISTS (SELECT 1 FROM body_metrics WHERE user_id = v_anto_id AND date::date = v_date) THEN
      v_weight := 73.0 - (v_day * 0.07) + (sin(v_day * 0.6) * 0.3) + (random() * 0.5 - 0.25);
      INSERT INTO body_metrics (user_id, date, weight)
      VALUES (v_anto_id, v_date + interval '9 hours', ROUND(v_weight::numeric, 1));
    END IF;
  END LOOP;

  RAISE NOTICE 'Seed completo! Hábitos + Body Metrics para Juan, Cristóbal y Antonio (90 días)';
END $$;
