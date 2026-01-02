-- Fix DB linter warning: set immutable search_path for haversine_km
ALTER FUNCTION public.haversine_km(double precision, double precision, double precision, double precision)
SET search_path = public;
