-- Create a security definer function to check user roles without triggering RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Drop and recreate the profiles SELECT policy to use the function
DROP POLICY IF EXISTS "Users can view own profile and admins can view all" ON public.profiles;

CREATE POLICY "Users can view own profile and admins can view all"
ON public.profiles
FOR SELECT
USING (
  (auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin')
);

-- Drop and recreate content_calendar policies to use the function
DROP POLICY IF EXISTS "Admins can view all content" ON public.content_calendar;

CREATE POLICY "Admins can view all content"
ON public.content_calendar
FOR SELECT
USING (
  (auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Admins can update approval status" ON public.content_calendar;

CREATE POLICY "Admins can update approval status"
ON public.content_calendar
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin')
);