-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_en VARCHAR(255) NOT NULL,
  title_ko VARCHAR(255),
  description_en TEXT,
  description_ko TEXT,
  image_url TEXT,
  price_usd DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  max_participants INTEGER NOT NULL,
  min_participants INTEGER DEFAULT 1,
  location VARCHAR(255),
  category VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on frequently queried fields
CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category);
CREATE INDEX IF NOT EXISTS idx_activities_is_active ON activities(is_active);
CREATE INDEX IF NOT EXISTS idx_activities_price ON activities(price_usd);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

-- Enable Row Level Security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic - can be enhanced later)
CREATE POLICY "Activities are viewable by everyone" ON activities
  FOR SELECT USING (true);

CREATE POLICY "Activities can be created by authenticated users" ON activities
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Activities can be updated by authenticated users" ON activities
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Activities can be deleted by authenticated users" ON activities
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
