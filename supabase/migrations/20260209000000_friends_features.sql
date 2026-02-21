-- Add columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username text,
ADD COLUMN IF NOT EXISTS friend_tag text UNIQUE,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS share_activity boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS share_score boolean DEFAULT true;

-- Function to generate unique friend_tag
CREATE OR REPLACE FUNCTION generate_unique_friend_tag() 
RETURNS TEXT AS $$
DECLARE
  new_tag TEXT;
  done BOOLEAN DEFAULT FALSE;
BEGIN
  WHILE NOT done LOOP
    -- Generate random 5 digit number
    new_tag := '#' || lpad(floor(random() * 100000)::text, 5, '0');
    -- Check if it exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE friend_tag = new_tag) THEN
      done := TRUE;
    END IF;
  END LOOP;
  RETURN new_tag;
END;
$$ LANGUAGE plpgsql;

-- Trigger to assign friend_tag on insert if null
CREATE OR REPLACE FUNCTION public.set_friend_tag()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.friend_tag IS NULL THEN
    NEW.friend_tag := generate_unique_friend_tag();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_friend_tag_trigger
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_friend_tag();

-- Backfill existing profiles
DO $$
DECLARE 
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE friend_tag IS NULL LOOP
    UPDATE public.profiles 
    SET friend_tag = generate_unique_friend_tag() 
    WHERE id = r.id;
  END LOOP;
END $$;

-- Create Friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  friend_id uuid REFERENCES public.profiles(id) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, friend_id),
  CONSTRAINT different_users CHECK (user_id != friend_id)
);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their friendships" ON public.friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can add friends" ON public.friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update profiles policy to allow reading other users (needed to search by tag)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

-- Allow updates to own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
