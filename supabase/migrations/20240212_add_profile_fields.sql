-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS subscription_status text;

-- Policy to allow users to update their own profile
-- CREATE POLICY "Users can update their own profile" 
-- ON public.profiles FOR UPDATE 
-- USING (auth.uid() = id);
