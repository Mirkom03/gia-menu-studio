-- Create private storage bucket (run in Supabase Dashboard SQL Editor or via API)
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', false);

-- Storage policy: authenticated users can manage their files
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'menu-images');

CREATE POLICY "Authenticated users can read images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'menu-images');

CREATE POLICY "Authenticated users can delete images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'menu-images');
