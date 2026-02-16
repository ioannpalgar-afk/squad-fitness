-- =============================================
-- MIGRACIÓN: Login simplificado por nombre
--
-- Actualiza los usuarios existentes para usar
-- email derivado del nombre + contraseña fija.
--
-- Ejecutar UNA VEZ en el SQL Editor de Supabase.
-- =============================================

-- Actualizar email y contraseña de todos los usuarios existentes
UPDATE auth.users
SET
  email = lower(
    translate(
      regexp_replace(
        (SELECT name FROM public.profiles WHERE profiles.id = auth.users.id),
        '\s+', '', 'g'
      ),
      'áéíóúñÁÉÍÓÚÑ',
      'aeiounnAEIOUNN'
    )
  ) || '@squad.app',
  encrypted_password = crypt('squad-fitness-2024!', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE id IN (SELECT id FROM public.profiles);

-- Verificar resultado
SELECT
  p.name,
  u.email
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.name;
