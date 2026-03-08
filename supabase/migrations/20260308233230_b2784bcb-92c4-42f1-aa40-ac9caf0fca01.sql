
-- Create public storage bucket for course resources
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-resources', 'course-resources', true);

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload resources"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-resources' AND auth.uid() IS NOT NULL
);

-- Allow anyone to view/download files (public bucket)
CREATE POLICY "Public read access for course resources"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-resources');

-- Allow file owners to delete their uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'course-resources' AND auth.uid() IS NOT NULL);
