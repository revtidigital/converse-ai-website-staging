-- Add faq_placement column to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS faq_placement text NOT NULL DEFAULT 'last';
