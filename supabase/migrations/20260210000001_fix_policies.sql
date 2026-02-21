-- Fix missing Policies for Update/Delete
-- Fix column existence

-- 1. Ensure columns exist (idempotent)
ALTER TABLE public.friendships 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted'));

-- 2. Drop OLD restrictive policies
DROP POLICY IF EXISTS "Users can add friends" ON public.friendships;
DROP POLICY IF EXISTS "Users can view their friendships" ON public.friendships;

-- 3. Create NEW Full/Comprehensive Policies

-- READ: View friendships where you are either User or Friend
CREATE POLICY "Users can view their friendships" ON public.friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- INSERT: Send request (You must be the 'user_id' initiator)
CREATE POLICY "Users can send requests" ON public.friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: Accept request (You must be the 'friend_id' receiver)
CREATE POLICY "Users can accept requests" ON public.friendships
  FOR UPDATE USING (auth.uid() = friend_id);

-- DELETE: Cancel request (Sender) or Decline/Remove (Receiver)
CREATE POLICY "Users can delete friendships" ON public.friendships
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Legacy fix: Update any old pending tasks if status column was just added and is null (unlikely with default but good to be safe)
UPDATE public.friendships SET status = 'accepted' WHERE status IS NULL;
