-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  avatar_url TEXT,
  bio TEXT,
  languages TEXT[] DEFAULT '{}',
  specialties TEXT[] DEFAULT '{}',
  hourly_rate DECIMAL(10,2),
  max_hours_per_day INTEGER DEFAULT 8,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on frequently queried fields
CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email);
CREATE INDEX IF NOT EXISTS idx_agents_is_active ON agents(is_active);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at);

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic - can be enhanced later)
CREATE POLICY "Agents are viewable by everyone" ON agents
  FOR SELECT USING (true);

CREATE POLICY "Agents can be created by authenticated users" ON agents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Agents can be updated by authenticated users" ON agents
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Agents can be deleted by authenticated users" ON agents
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
