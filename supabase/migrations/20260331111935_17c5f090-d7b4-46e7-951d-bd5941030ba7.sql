
-- Fix broken product images
UPDATE products SET images = '["https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600"]' WHERE slug = 'hyaluronic-acid-moisturizer';
UPDATE products SET images = '["https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600"]' WHERE slug = 'waterproof-mascara';

-- Fix broken category image for sunscreen (was showing text instead of image)
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400' WHERE slug = 'sunscreen';
