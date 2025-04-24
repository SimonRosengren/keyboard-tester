-- Remove profiles table and update scores table to use auth.users directly

-- First drop the trigger that creates profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Update scores table to use auth.users directly
-- (No need to modify foreign key as it already references auth.users)

-- Drop the profiles table
DROP TABLE IF EXISTS profiles;

-- Update scores policies
DROP POLICY IF EXISTS "Scores are viewable by everyone" ON scores;
DROP POLICY IF EXISTS "Users can insert their own scores" ON scores;
DROP POLICY IF EXISTS "Users can update their own scores" ON scores;

-- Recreate policies
CREATE POLICY "Scores are viewable by everyone" 
ON scores FOR SELECT USING (true);

CREATE POLICY "Users can insert their own scores"
ON scores FOR INSERT WITH CHECK (
  auth.uid() = user_id OR user_id IS NULL
);

CREATE POLICY "Users can update their own scores"
ON scores FOR UPDATE USING (auth.uid() = user_id);
