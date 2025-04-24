-- Add anonymous_id column to scores table
ALTER TABLE scores ADD COLUMN anonymous_id TEXT;

-- Create index on anonymous_id for faster lookups
CREATE INDEX idx_scores_anonymous_id ON scores(anonymous_id);

-- Update policies to allow anonymous users to claim their scores
DROP POLICY IF EXISTS "Users can update their own scores" ON scores;

CREATE POLICY "Users can update their own scores"
ON scores FOR UPDATE USING (
  auth.uid() = user_id OR 
  (user_id IS NULL AND anonymous_id IS NOT NULL)
);

-- Allow users to claim their anonymous scores
CREATE POLICY "Users can claim their anonymous scores" 
ON scores FOR UPDATE 
USING (anonymous_id IS NOT NULL)
WITH CHECK (auth.uid() = user_id);
