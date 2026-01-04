-- Create a table for Personal User Markers
CREATE TABLE IF NOT EXISTS user_personal_markers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    title TEXT NOT NULL,
    icon_name TEXT DEFAULT 'star', -- 'star', 'home', 'skull', 'flag'
    color TEXT DEFAULT '#ff0000',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_personal_markers ENABLE ROW LEVEL SECURITY;

-- Create Policy: Users can only see their own markers
CREATE POLICY "Users can view own markers" 
ON user_personal_markers FOR SELECT 
USING (auth.uid() = user_id);

-- Create Policy: Users can insert their own markers
CREATE POLICY "Users can insert own markers" 
ON user_personal_markers FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create Policy: Users can update own markers
CREATE POLICY "Users can update own markers" 
ON user_personal_markers FOR UPDATE 
USING (auth.uid() = user_id);

-- Create Policy: Users can delete own markers
CREATE POLICY "Users can delete own markers" 
ON user_personal_markers FOR DELETE 
USING (auth.uid() = user_id);
