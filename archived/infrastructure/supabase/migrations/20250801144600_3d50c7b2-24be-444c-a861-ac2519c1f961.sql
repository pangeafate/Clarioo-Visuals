-- Create table for storing customer tech requests for analytics
CREATE TABLE public.tech_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_name TEXT,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  budget TEXT NOT NULL,
  urgency TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tech_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics access
CREATE POLICY "Users can insert their own tech requests" 
ON public.tech_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own tech requests" 
ON public.tech_requests 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tech_requests_updated_at
BEFORE UPDATE ON public.tech_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();