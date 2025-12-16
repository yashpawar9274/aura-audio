-- Add hero video URL field to site_settings
ALTER TABLE public.site_settings 
ADD COLUMN hero_video_url TEXT;

-- Add default video URL (can be changed through admin settings)
UPDATE public.site_settings 
SET hero_video_url = 'https://example.com/hero-video.mp4'
WHERE id = 'main';
