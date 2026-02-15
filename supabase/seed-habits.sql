-- =============================================
-- SQUAD FITNESS — Seed Habits Data
-- Crea routine_configs y routine_entries para los 3 usuarios
-- Ejecutar en el SQL Editor de Supabase
-- =============================================

-- Primero obtenemos los IDs de los 3 usuarios
DO $$
DECLARE
  v_juan_id uuid;
  v_cris_id uuid;
  v_anto_id uuid;
  v_date date;
  v_cfg_id uuid;
  v_day_offset int;
  v_completed boolean;
BEGIN
  -- Obtener IDs de usuarios por nombre
  SELECT id INTO v_juan_id FROM profiles WHERE name ILIKE '%juan%' LIMIT 1;
  SELECT id INTO v_cris_id FROM profiles WHERE name ILIKE '%crist%' LIMIT 1;
  SELECT id INTO v_anto_id FROM profiles WHERE name ILIKE '%antonio%' OR name ILIKE '%anto%' LIMIT 1;

  IF v_juan_id IS NULL OR v_cris_id IS NULL OR v_anto_id IS NULL THEN
    RAISE NOTICE 'No se encontraron los 3 usuarios. Juan: %, Cris: %, Anto: %', v_juan_id, v_cris_id, v_anto_id;
    RETURN;
  END IF;

  -- Limpiar datos previos de hábitos
  DELETE FROM routine_entries WHERE user_id IN (v_juan_id, v_cris_id, v_anto_id);
  DELETE FROM routine_configs WHERE user_id IN (v_juan_id, v_cris_id, v_anto_id);

  -- =============================================
  -- ROUTINE CONFIGS para Juan (El Tanque)
  -- Gym, Hidratación, Sueño 8h, Nutrición, Código
  -- =============================================
  INSERT INTO routine_configs (user_id, name, icon, frequency, sort_order) VALUES
    (v_juan_id, 'Gym',          'gym',         'daily', 0),
    (v_juan_id, 'Hidratación',  'hidratacion', 'daily', 1),
    (v_juan_id, 'Sueño 8h',    'sueno',       'daily', 2),
    (v_juan_id, 'Nutrición',    'nutricion',   'daily', 3),
    (v_juan_id, 'Código',       'codigo',      'daily', 4);

  -- =============================================
  -- ROUTINE CONFIGS para Cristóbal (El Estratega)
  -- Meditación, Gym, Lectura, Journaling, Madrugar
  -- =============================================
  INSERT INTO routine_configs (user_id, name, icon, frequency, sort_order) VALUES
    (v_cris_id, 'Meditación',  'meditacion', 'daily', 0),
    (v_cris_id, 'Gym',         'gym',        'daily', 1),
    (v_cris_id, 'Lectura',     'lectura',    'daily', 2),
    (v_cris_id, 'Journaling',  'journaling', 'daily', 3),
    (v_cris_id, 'Madrugar',    'madrugar',   'daily', 4);

  -- =============================================
  -- ROUTINE CONFIGS para Antonio (El Loco Rápido)
  -- Cardio, Gym, Ducha fría, Digital Detox
  -- =============================================
  INSERT INTO routine_configs (user_id, name, icon, frequency, sort_order) VALUES
    (v_anto_id, 'Cardio',        'cardio',       'daily', 0),
    (v_anto_id, 'Gym',           'gym',          'daily', 1),
    (v_anto_id, 'Ducha fría',    'duchaFria',    'daily', 2),
    (v_anto_id, 'Digital Detox', 'digitalDetox', 'daily', 3);

  -- =============================================
  -- GENERAR 30 DÍAS DE ROUTINE_ENTRIES
  -- =============================================

  -- Juan: muy constante, 28/30 días completos (racha ~12 días actual)
  FOR v_day_offset IN 1..30 LOOP
    v_date := CURRENT_DATE - v_day_offset;

    -- Juan falla día 13 y 25 para romper monotonía
    IF v_day_offset IN (13, 25) THEN
      -- Día parcial: solo completa 2 de 5
      FOR v_cfg_id IN (SELECT id FROM routine_configs WHERE user_id = v_juan_id ORDER BY sort_order LIMIT 2) LOOP
        INSERT INTO routine_entries (user_id, routine_config_id, date, completed, completed_at)
        VALUES (v_juan_id, v_cfg_id, v_date, true, v_date + interval '8 hours' + (random() * interval '4 hours'));
      END LOOP;
    ELSE
      -- Día completo
      FOR v_cfg_id IN (SELECT id FROM routine_configs WHERE user_id = v_juan_id ORDER BY sort_order) LOOP
        INSERT INTO routine_entries (user_id, routine_config_id, date, completed, completed_at)
        VALUES (v_juan_id, v_cfg_id, v_date, true, v_date + interval '7 hours' + (random() * interval '6 hours'));
      END LOOP;
    END IF;
  END LOOP;

  -- Cristóbal: bastante constante, 24/30 días (racha ~8 días actual)
  FOR v_day_offset IN 1..30 LOOP
    v_date := CURRENT_DATE - v_day_offset;

    -- Cristóbal falla días 9, 15, 20, 22, 26, 28
    IF v_day_offset IN (9, 15, 20, 22, 26, 28) THEN
      -- Día parcial o nada
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

  -- Antonio: menos constante, 20/30 días (racha ~5 días actual)
  FOR v_day_offset IN 1..30 LOOP
    v_date := CURRENT_DATE - v_day_offset;

    -- Antonio falla días 6, 10, 12, 14, 17, 19, 21, 24, 27, 29
    IF v_day_offset IN (6, 10, 12, 14, 17, 19, 21, 24, 27, 29) THEN
      -- Solo completa 1-2 hábitos
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

  RAISE NOTICE 'Seed de hábitos completado! Juan: 5 hábitos, Cristóbal: 5 hábitos, Antonio: 4 hábitos + 30 días de datos';
END $$;
