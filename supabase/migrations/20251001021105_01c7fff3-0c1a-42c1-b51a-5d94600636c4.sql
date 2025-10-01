-- Backfill profiles for existing users who don't have profiles yet
INSERT INTO public.profiles (user_id, full_name, email, role)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  u.email,
  COALESCE(u.raw_user_meta_data->>'role', 'user')
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;