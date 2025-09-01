-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  participants INTEGER NOT NULL CHECK (participants > 0),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  total_price_usd DECIMAL(10,2) NOT NULL CHECK (total_price_usd >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create agent_schedules table
CREATE TABLE IF NOT EXISTS agent_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  max_bookings_per_day INTEGER CHECK (max_bookings_per_day > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, day_of_week)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_agent_id ON bookings(agent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_activity_id ON bookings(activity_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);

CREATE INDEX IF NOT EXISTS idx_agent_schedules_agent_id ON agent_schedules(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_schedules_day_of_week ON agent_schedules(day_of_week);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_schedules_updated_at BEFORE UPDATE ON agent_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for bookings table
CREATE POLICY "Users can view all bookings" ON bookings
  FOR SELECT USING (true);

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update bookings" ON bookings
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete bookings" ON bookings
  FOR DELETE USING (true);

-- Create policies for agent_schedules table
CREATE POLICY "Users can view all agent schedules" ON agent_schedules
  FOR SELECT USING (true);

CREATE POLICY "Users can create agent schedules" ON agent_schedules
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update agent schedules" ON agent_schedules
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete agent schedules" ON agent_schedules
  FOR DELETE USING (true);

-- Insert some sample agent schedules (optional)
-- This creates a default schedule for all agents: Monday-Friday, 9 AM - 6 PM
INSERT INTO agent_schedules (agent_id, day_of_week, start_time, end_time, is_available, max_bookings_per_day)
SELECT 
  a.id,
  d.day_of_week,
  '09:00'::time,
  '18:00'::time,
  true,
  10
FROM agents a
CROSS JOIN (
  SELECT generate_series(1, 5) as day_of_week -- Monday to Friday
) d
WHERE a.is_active = true
ON CONFLICT (agent_id, day_of_week) DO NOTHING;
