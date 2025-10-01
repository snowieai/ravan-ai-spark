-- Allow admins to delete any content calendar entry
CREATE POLICY "Admins can delete content"
ON public.content_calendar
FOR DELETE
USING (has_role(auth.uid(), 'admin'::text));