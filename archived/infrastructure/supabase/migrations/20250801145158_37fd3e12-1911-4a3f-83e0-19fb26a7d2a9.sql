-- Create table for storing vendor selections for analytics
CREATE TABLE public.vendor_selections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tech_request_id UUID REFERENCES public.tech_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  selected_vendors TEXT[] NOT NULL,
  vendor_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vendor_selections ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics access
CREATE POLICY "Users can insert their own vendor selections" 
ON public.vendor_selections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own vendor selections" 
ON public.vendor_selections 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);