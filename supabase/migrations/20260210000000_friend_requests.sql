-- Add status column to friendships
ALTER TABLE public.friendships 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted'));

-- Update existing friendships to be accepted (legacy support)
UPDATE public.friendships SET status = 'accepted' WHERE status = 'pending';

-- Drop unique constraint if it exists to ensure we don't have dupes in reverse order if we decide to use single row? 
-- Actually, strict checking: if A->B exists, we shouldn't allow B->A insert?
-- OR we allow B->A insert but handle it? 
-- Simplest approach: A->B is the single source of truth. B->A is just a lookup.
-- But if B wants to add A, and A hasn't added B? B creates B->A (pending).
-- If A adds B while B->A (pending) exists? 
-- Let's stick to: One row per relationship direction is NOT needed. One row `user_id, friend_id` represents the link.
-- To prevent duplicate inverted rows (A->B and B->A), invite logic should check both.

-- Function to check if friendship exists in either direction
CREATE OR REPLACE FUNCTION public.check_friendship_exists(uid1 uuid, uid2 uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.friendships 
    WHERE (user_id = uid1 AND friend_id = uid2) 
       OR (user_id = uid2 AND friend_id = uid1)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
