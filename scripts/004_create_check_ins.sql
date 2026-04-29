-- Create check_ins table for tracking user check-ins at spots
-- Check-ins expire after 60 minutes

CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spot_id UUID NOT NULL REFERENCES public.spots(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '60 minutes'),
  
  -- Prevent duplicate active check-ins at same spot
  CONSTRAINT unique_active_checkin UNIQUE (user_id, spot_id)
);

-- Index for quick lookup of active check-ins
CREATE INDEX IF NOT EXISTS idx_check_ins_spot_active ON public.check_ins(spot_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_check_ins_user ON public.check_ins(user_id);

-- Function to clean up expired check-ins (can be called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_checkins()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.check_ins WHERE expires_at < now();
END;
$$;
