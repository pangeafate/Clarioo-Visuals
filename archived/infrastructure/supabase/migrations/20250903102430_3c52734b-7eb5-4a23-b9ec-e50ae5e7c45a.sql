-- Create projects table to track multiple vendor discovery projects
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in-progress', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Users can view their own projects" 
ON public.projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add project_id to tech_requests table
ALTER TABLE public.tech_requests 
ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- Add project_id to vendor_selections table  
ALTER TABLE public.vendor_selections
ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- Create trigger for automatic timestamp updates on projects
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_tech_requests_project_id ON public.tech_requests(project_id);
CREATE INDEX idx_vendor_selections_project_id ON public.vendor_selections(project_id);