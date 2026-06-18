-- Migration: Add categories table and link to books
-- Jalankan SQL ini di Supabase SQL Editor

-- 1. Buat tabel categories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Seed data kategori default
INSERT INTO categories (name) VALUES
    ('Fiksi'),
    ('Non-Fiksi'),
    ('Sains'),
    ('Teknologi'),
    ('Sejarah'),
    ('Agama'),
    ('Pendidikan'),
    ('Novel'),
    ('Komik'),
    ('Referensi')
ON CONFLICT (name) DO NOTHING;

-- 3. Tambah kolom category_id ke tabel books
ALTER TABLE books ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;

-- 4. Update RLS policy untuk tabel categories (jika pakai RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy: semua user bisa baca categories
DROP POLICY IF EXISTS "Categories readable by all users" ON categories;
CREATE POLICY "Categories readable by all users" ON categories
    FOR SELECT USING (true);

-- Policy: hanya admin yang bisa manage categories (opsional, sesuaikan)
DROP POLICY IF EXISTS "Categories writable by admin" ON categories;
CREATE POLICY "Categories writable by admin" ON categories
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profile WHERE role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Categories updatable by admin" ON categories;
CREATE POLICY "Categories updatable by admin" ON categories
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM profile WHERE role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Categories deletable by admin" ON categories;
CREATE POLICY "Categories deletable by admin" ON categories
    FOR DELETE USING (
        auth.uid() IN (
            SELECT id FROM profile WHERE role = 'admin'
        )
    );

-- 5. Update kategori untuk buku yang sudah ada
-- Novel & Fiksi Sastra: Andrea Hirata, Pramoedya, Eka Kurniawan, Ahmad Fuadi, Leila S. Chudori, Marah Rusli, dkk
UPDATE books SET category_id = (SELECT id FROM categories WHERE name = 'Novel')
WHERE title IN (
    'Laskar Pelangi', 'Sang Pemimpi', 'Edensor', 'Maryamah Karpov',
    'Bumi Manusia', 'Anak Semua Bangsa', 'Jejak Langkah', 'Rumah Kaca',
    'Cantik Itu Luka', 'Lelaki Harimau', 'O',
    'Negeri 5 Menara', 'Rantau 1 Muara', 'Anak Rantau',
    'Pulang',
    'Habis Gelap Terbitlah Terang',
    'Siti Nurbaya', 'Layar Terkembang', 'Atheis', 'Belenggu',
    'Robohnya Surau Kami',
    'Tenggelamnya Kapal Van Der Wijck', 'Di Bawah Lindungan Kabah',
    'Salah Asuhan', 'Max Havelaar'
);

-- Teknologi & Pemrograman
UPDATE books SET category_id = (SELECT id FROM categories WHERE name = 'Teknologi')
WHERE title IN (
    'Deep Work',
    'The Pragmatic Programmer',
    'Clean Code',
    'Introduction to Algorithms',
    'Design Patterns',
    'The Mythical Man-Month',
    'Code Complete',
    'You Don''t Know JS',
    'The Art of Computer Programming'
);

-- Non-Fiksi / Self-Development
UPDATE books SET category_id = (SELECT id FROM categories WHERE name = 'Non-Fiksi')
WHERE title IN (
    'Atomic Habits',
    'Think and Grow Rich',
    'The 7 Habits',
    'How to Win Friends',
    'Start With Why',
    'Zero to One',
    'The Lean Startup',
    'Good to Great',
    'Freakonomics',
    'The Tipping Point',
    'Outliers'
);

-- Sejarah & Biografi
UPDATE books SET category_id = (SELECT id FROM categories WHERE name = 'Sejarah')
WHERE title IN (
    'Sapiens',
    'Homo Deus',
    '21 Lessons for the 21st Century',
    'Steve Jobs',
    'Elon Musk',
    'The Diary of Anne Frank',
    'Nelson Mandela',
    'The Wright Brothers',
    'Einstein',
    'Becoming'
);

-- Komik & Cerita Rakyat Bergambar
UPDATE books SET category_id = (SELECT id FROM categories WHERE name = 'Komik')
WHERE title IN (
    'Si Juki: Serigala',
    'Kiko',
    'The Legend of Surabaya',
    'Malin Kundang',
    'Timun Mas'
);

-- 6. Seed buku tambahan untuk kategori yang masih kosong
-- Fiksi (non-Novell)
INSERT INTO books (title, author, stock, cover_url, category_id) VALUES
    ('The Hobbit', 'J.R.R. Tolkien', 5, 'https://picsum.photos/id/80/200/300', (SELECT id FROM categories WHERE name = 'Fiksi')),
    ('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 7, 'https://picsum.photos/id/81/200/300', (SELECT id FROM categories WHERE name = 'Fiksi')),
    ('The Alchemist', 'Paulo Coelho', 6, 'https://picsum.photos/id/82/200/300', (SELECT id FROM categories WHERE name = 'Fiksi')),
    ('The Da Vinci Code', 'Dan Brown', 4, 'https://picsum.photos/id/83/200/300', (SELECT id FROM categories WHERE name = 'Fiksi'))
ON CONFLICT DO NOTHING;

-- Sains
INSERT INTO books (title, author, stock, cover_url, category_id) VALUES
    ('A Brief History of Time', 'Stephen Hawking', 4, 'https://picsum.photos/id/84/200/300', (SELECT id FROM categories WHERE name = 'Sains')),
    ('The Selfish Gene', 'Richard Dawkins', 3, 'https://picsum.photos/id/85/200/300', (SELECT id FROM categories WHERE name = 'Sains')),
    ('Cosmos', 'Carl Sagan', 5, 'https://picsum.photos/id/86/200/300', (SELECT id FROM categories WHERE name = 'Sains')),
    ('The Origin of Species', 'Charles Darwin', 3, 'https://picsum.photos/id/87/200/300', (SELECT id FROM categories WHERE name = 'Sains'))
ON CONFLICT DO NOTHING;

-- Agama
INSERT INTO books (title, author, stock, cover_url, category_id) VALUES
    ('The God Delusion', 'Richard Dawkins', 2, 'https://picsum.photos/id/88/200/300', (SELECT id FROM categories WHERE name = 'Agama')),
    ('Mencari Tuhan yang Hilang', 'Moh. Fudoli', 5, 'https://picsum.photos/id/89/200/300', (SELECT id FROM categories WHERE name = 'Agama')),
    ('Islam: A Short History', 'Karen Armstrong', 4, 'https://picsum.photos/id/90/200/300', (SELECT id FROM categories WHERE name = 'Agama'))
ON CONFLICT DO NOTHING;

-- Pendidikan
INSERT INTO books (title, author, stock, cover_url, category_id) VALUES
    ('Pedagogi Kaum Tertindas', 'Paulo Freire', 3, 'https://picsum.photos/id/91/200/300', (SELECT id FROM categories WHERE name = 'Pendidikan')),
    ('Pendidikan Karakter', 'Thomas Lickona', 4, 'https://picsum.photos/id/92/200/300', (SELECT id FROM categories WHERE name = 'Pendidikan')),
    ('Teach Like Finland', 'Timothy D. Walker', 5, 'https://picsum.photos/id/93/200/300', (SELECT id FROM categories WHERE name = 'Pendidikan'))
ON CONFLICT DO NOTHING;

-- Referensi
INSERT INTO books (title, author, stock, cover_url, category_id) VALUES
    ('Kamus Besar Bahasa Indonesia', 'Tim Penyusun KBBI', 3, 'https://picsum.photos/id/94/200/300', (SELECT id FROM categories WHERE name = 'Referensi')),
    ('Encyclopedia Britannica', 'Britannica Editorial', 2, 'https://picsum.photos/id/95/200/300', (SELECT id FROM categories WHERE name = 'Referensi')),
    ('Atlas Dunia', 'National Geographic', 4, 'https://picsum.photos/id/96/200/300', (SELECT id FROM categories WHERE name = 'Referensi'))
ON CONFLICT DO NOTHING;

-- 7. Update role 'siswa' menjadi 'member' di tabel profile
UPDATE profile SET role = 'member' WHERE role = 'siswa';
