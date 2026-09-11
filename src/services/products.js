import { supabase } from './supabase.js';

export async function getProducts() {
    const { data, error } = await supabase
        .from('products')
        .select(`
            id,
            name,
            slug,
            description,
            origin,
            image_url,
            is_active,
            stock_quantity,
            stock_unit,
            low_stock_threshold,
            categories (
                id,
                name,
                slug
            ),
            product_variants (
                id,
                variant_name,
                price
            )
        `)
        .eq('is_active', true)
        .order('id');

    if (error) {
        console.error('Error loading products:', error);
        throw error;
    }

    return data;
}