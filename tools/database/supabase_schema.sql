-- Table: recitations
CREATE TABLE recitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  text TEXT,
  surah INT,
  ayah INT,
  tajweed_errors TEXT[],
  pronunciation_score INT,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE recitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User recitations access" ON recitations
  FOR ALL USING (auth.uid() = user_id);

-- Table: documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT,
  content TEXT,
  source_type VARCHAR(20),
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storage Buckets
-- Bucket: recitations (Public read, authenticated upload)
-- Bucket: documents (Public read, authenticated upload)
