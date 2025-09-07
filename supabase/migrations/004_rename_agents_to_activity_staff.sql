-- Migration: Rename agents table to activity_staff and update references
-- Description: Changes terminology from "Agent" to "ActivityStaff" throughout the database

-- Step 1: Drop existing indexes and constraints that will be recreated
DROP INDEX IF EXISTS idx_agents_email;
DROP INDEX IF EXISTS idx_agents_is_active;
DROP INDEX IF EXISTS idx_agents_created_at;
DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;

-- Step 2: Rename the agents table to activity_staff
ALTER TABLE agents RENAME TO activity_staff;

-- Step 3: Update foreign key references in other tables
-- Update bookings table agent_id column to activity_staff_id
ALTER TABLE bookings RENAME COLUMN agent_id TO activity_staff_id;

-- Update agent_schedules table if it exists (from other migrations)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_schedules') THEN
    ALTER TABLE agent_schedules RENAME TO activity_staff_schedules;
    ALTER TABLE activity_staff_schedules RENAME COLUMN agent_id TO activity_staff_id;
  END IF;
END $$;

-- Update agent_unavailable_dates table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_unavailable_dates') THEN
    ALTER TABLE agent_unavailable_dates RENAME TO activity_staff_unavailable_dates;
    ALTER TABLE activity_staff_unavailable_dates RENAME COLUMN agent_id TO activity_staff_id;
  END IF;
END $$;

-- Step 4: Recreate indexes with new naming
CREATE INDEX IF NOT EXISTS idx_activity_staff_email ON activity_staff(email);
CREATE INDEX IF NOT EXISTS idx_activity_staff_is_active ON activity_staff(is_active);
CREATE INDEX IF NOT EXISTS idx_activity_staff_created_at ON activity_staff(created_at);

-- Step 5: Update trigger function and recreate trigger
CREATE TRIGGER update_activity_staff_updated_at
  BEFORE UPDATE ON activity_staff
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Drop old RLS policies and create new ones
DROP POLICY IF EXISTS "Agents are viewable by everyone" ON activity_staff;
DROP POLICY IF EXISTS "Agents can be created by authenticated users" ON activity_staff;
DROP POLICY IF EXISTS "Agents can be updated by authenticated users" ON activity_staff;
DROP POLICY IF EXISTS "Agents can be deleted by authenticated users" ON activity_staff;

-- Create new RLS policies with updated names
CREATE POLICY "Activity staff are viewable by everyone" ON activity_staff
  FOR SELECT USING (true);

CREATE POLICY "Activity staff can be created by authenticated users" ON activity_staff
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Activity staff can be updated by authenticated users" ON activity_staff
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Activity staff can be deleted by authenticated users" ON activity_staff
  FOR DELETE USING (auth.role() = 'authenticated');

-- Step 7: Update any foreign key constraints
-- Check if there are any foreign key constraints referencing the old table name and update them
DO $$
DECLARE
  constraint_rec RECORD;
BEGIN
  -- Find and update foreign key constraints referencing the old agent_id
  FOR constraint_rec IN 
    SELECT tc.constraint_name, tc.table_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE kcu.column_name = 'activity_staff_id' 
      AND tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
  LOOP
    -- Drop and recreate foreign key constraints if they exist
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', 
                  constraint_rec.table_name, constraint_rec.constraint_name);
                  
    -- Recreate foreign key constraint with proper reference
    IF constraint_rec.table_name = 'bookings' THEN
      EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I 
                     FOREIGN KEY (activity_staff_id) REFERENCES activity_staff(id) 
                     ON DELETE SET NULL ON UPDATE CASCADE', 
                    constraint_rec.table_name, constraint_rec.constraint_name);
    END IF;
  END LOOP;
END $$;

-- Add comment to track this migration
COMMENT ON TABLE activity_staff IS 'Activity staff (formerly agents) - tour guides and staff members';
