/*
  # Create Users Table and Add Initial Users

  1. New Table
    - `users`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `email` (text, unique)
      - `role` (text with check constraint)
      - `can_create_users` (boolean)
      - `created_at` (timestamp)

  2. Initial Data
    - Add 4 initial users with specified roles and permissions
    
  3. Security
    - Enable RLS
    - Add policies for user management
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'exploit', 'compta', 'direction')),
  can_create_users boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Only users with can_create_users=true can create users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND can_create_users = true
    )
  );

-- Insert initial users
INSERT INTO users (name, email, role, can_create_users)
VALUES 
  ('Salomé', 'salome@mzn.fr', 'admin', true),
  ('Orlane', 'orlane@mzn.fr', 'admin', false),
  ('Eliot', 'eliot@mzn.fr', 'exploit', false),
  ('Mehdi', 'mehdi@mzn.fr', 'exploit', false)
ON CONFLICT (email) DO NOTHING;

-- Create function to check if user can create other users
CREATE OR REPLACE FUNCTION can_create_users()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND can_create_users = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;