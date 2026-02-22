-- BeautyBox Initial Schema

-- ============================================
-- Tables
-- ============================================

CREATE TABLE boxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    cover_image_url TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE box_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    box_id UUID NOT NULL REFERENCES boxes(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('day', 'night', 'party', 'everyday')),
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(box_id, event_type)
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES box_sections(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(10,2),
    product_url TEXT,
    image_url TEXT,
    store TEXT NOT NULL,
    shade TEXT,
    instructions TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_boxes_slug ON boxes(slug);
CREATE INDEX idx_boxes_published ON boxes(is_published);
CREATE INDEX idx_sections_box ON box_sections(box_id);
CREATE INDEX idx_products_section ON products(section_id);
CREATE INDEX idx_products_store ON products(store);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE box_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can read published boxes
CREATE POLICY "boxes_public_read" ON boxes
    FOR SELECT USING (is_published = true);

-- Public can read sections of published boxes
CREATE POLICY "sections_public_read" ON box_sections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM boxes WHERE boxes.id = box_sections.box_id AND boxes.is_published = true
        )
    );

-- Public can read products of published boxes
CREATE POLICY "products_public_read" ON products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM box_sections bs
            JOIN boxes b ON b.id = bs.box_id
            WHERE bs.id = products.section_id AND b.is_published = true
        )
    );

-- Service role bypasses RLS entirely (used by admin API routes)
