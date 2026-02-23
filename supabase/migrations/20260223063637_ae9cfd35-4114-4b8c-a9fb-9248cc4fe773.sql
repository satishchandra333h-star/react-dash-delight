
-- Create species enum
CREATE TYPE public.pet_species AS ENUM ('dog', 'cat', 'rabbit', 'bird', 'other');

-- Create pet status enum
CREATE TYPE public.pet_status AS ENUM ('available', 'pending', 'adopted');

-- Create adoption request status enum
CREATE TYPE public.adoption_status AS ENUM ('pending', 'approved', 'rejected');

-- Pets table (publicly browsable)
CREATE TABLE public.pets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  species public.pet_species NOT NULL DEFAULT 'dog',
  breed TEXT,
  age_months INTEGER NOT NULL DEFAULT 12,
  gender TEXT NOT NULL DEFAULT 'unknown',
  description TEXT,
  image_url TEXT,
  status public.pet_status NOT NULL DEFAULT 'available',
  shelter_location TEXT,
  weight_kg NUMERIC(5,2),
  is_vaccinated BOOLEAN DEFAULT false,
  is_neutered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adoption requests table
CREATE TABLE public.adoption_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_phone TEXT,
  message TEXT,
  status public.adoption_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adoption_requests ENABLE ROW LEVEL SECURITY;

-- Pets: anyone can view
CREATE POLICY "Anyone can view pets" ON public.pets FOR SELECT USING (true);

-- Adoption requests: anyone can submit (public form)
CREATE POLICY "Anyone can submit adoption requests" ON public.adoption_requests FOR INSERT WITH CHECK (true);

-- Adoption requests: only viewable via admin (we'll add admin later, for now allow select for all to show in dashboard)
CREATE POLICY "Anyone can view adoption requests" ON public.adoption_requests FOR SELECT USING (true);

-- Update trigger for timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_pets_updated_at
BEFORE UPDATE ON public.pets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_adoption_requests_updated_at
BEFORE UPDATE ON public.adoption_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
