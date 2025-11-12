-- Add current_step field to projects table to save progress
ALTER TABLE public.projects 
ADD COLUMN current_step text DEFAULT 'tech-input';

-- Add current_step_data field to store step-specific data
ALTER TABLE public.projects 
ADD COLUMN current_step_data jsonb DEFAULT '{}'::jsonb;