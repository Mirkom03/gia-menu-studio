-- supabase/migrations/001_initial_schema.sql

-- Styles table
CREATE TABLE styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  prompt_template TEXT NOT NULL,
  preview_url TEXT,
  colors JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Menus table
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  type TEXT NOT NULL CHECK (type IN ('weekly', 'event')),
  week_start DATE NOT NULL,
  week_end DATE,
  active_days TEXT[] DEFAULT '{}',
  title TEXT,
  price DECIMAL(6,2),
  style_id UUID REFERENCES styles(id),
  source_menu_id UUID REFERENCES menus(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'final')),
  notes TEXT,
  user_id UUID NOT NULL
);

-- Menu items table
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('starter', 'main', 'dessert', 'drink', 'other')),
  name_es TEXT NOT NULL,
  name_en TEXT,
  name_fr TEXT,
  description_es TEXT,
  description_en TEXT,
  description_fr TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Menu images table
CREATE TABLE menu_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('es', 'en', 'fr')),
  image_url TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('png', 'pdf')),
  width INTEGER,
  height INTEGER,
  size_bytes BIGINT,
  prompt_used TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies (single authenticated user)
-- styles: read-only for authenticated users (seeded data)
CREATE POLICY "Authenticated users can read styles"
  ON styles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage styles"
  ON styles FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- menus: user owns their data
CREATE POLICY "Users can manage their menus"
  ON menus FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- menu_items: access via menu ownership
CREATE POLICY "Users can manage items of their menus"
  ON menu_items FOR ALL TO authenticated
  USING (menu_id IN (SELECT id FROM menus WHERE user_id = auth.uid()))
  WITH CHECK (menu_id IN (SELECT id FROM menus WHERE user_id = auth.uid()));

-- menu_images: access via menu ownership
CREATE POLICY "Users can manage images of their menus"
  ON menu_images FOR ALL TO authenticated
  USING (menu_id IN (SELECT id FROM menus WHERE user_id = auth.uid()))
  WITH CHECK (menu_id IN (SELECT id FROM menus WHERE user_id = auth.uid()));
