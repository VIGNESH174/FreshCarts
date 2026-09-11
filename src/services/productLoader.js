import { getProducts } from './products.js';

export async function loadProductsFromSupabase() {

    try {

        const products = await getProducts();

        console.log(
            `FreshCart: ${products.length} products loaded from Supabase`
        );


        products.forEach(product => {

            updateProductCard(product);

        });


        return products;

    } catch (error) {

        console.error(
            'FreshCart: Failed to load products',
            error
        );

        return [];

    }
}


// =====================================================
// UPDATE PRODUCT CARD
// =====================================================

function updateProductCard(product) {

    const cards =
        document.querySelectorAll('.product-card');


    cards.forEach(card => {

        const nameElement =
            card.querySelector('.product-name');


        if (!nameElement) return;


        const cardName =
            nameElement.textContent.trim();


        if (cardName !== product.name) return;


        // ---------------------------------------------
        // Supabase product ID
        // ---------------------------------------------

        card.dataset.productId =
            String(product.id);

        card.dataset.stockQuantity =
             String(product.stock_quantity || 0);

        card.dataset.stockUnit =
          product.stock_unit || 'kg';

        card.dataset.lowStockThreshold =
             String(product.low_stock_threshold || 5);


        // ---------------------------------------------
        // Origin
        // ---------------------------------------------

        const originElement =
            card.querySelector('.product-origin');


        if (
            originElement &&
            product.origin
        ) {

            originElement.textContent =
                product.origin;

        }


        // ---------------------------------------------
        // Description
        // ---------------------------------------------

        const descriptionElement =
            card.querySelector('.product-desc');


        if (
            descriptionElement &&
            product.description
        ) {

            descriptionElement.textContent =
                product.description;

        }


        // ---------------------------------------------
        // Image
        // ---------------------------------------------

        const imageElement =
            card.querySelector(
                '.product-card-img img'
            );


        if (
            imageElement &&
            product.image_url
        ) {

            imageElement.src =
                product.image_url;

        }


        // ---------------------------------------------
        // Variants
        // ---------------------------------------------

        updateVariants(
            card,
            product
        );

        updateStockDisplay(card, product);


        console.log(
            `✓ ${product.name} connected to Supabase`
        );

    });

}


// =====================================================
// UPDATE VARIANTS
// =====================================================

function updateVariants(
    card,
    product
) {

    const weightContainer =
        card.querySelector(
            '.product-weights'
        );


    const priceElement =
        card.querySelector(
            '.product-price'
        );


    if (
        !weightContainer ||
        !priceElement
    ) {

        return;

    }


    const variants =
        product.product_variants || [];


    if (variants.length === 0) {

        return;

    }


    // ---------------------------------------------
    // Remove old buttons
    // ---------------------------------------------

    weightContainer.innerHTML = '';


    // ---------------------------------------------
    // Create Supabase variant buttons
    // ---------------------------------------------

    variants.forEach(
        (variant, index) => {

            const button =
                document.createElement(
                    'button'
                );


            button.type = 'button';


            button.className =
                'weight-pill';


            // Store variant name
            button.dataset.variant =
                variant.variant_name;


            // Store variant price
            button.dataset.price =
                String(variant.price);


            // First variant active
            if (index === 0) {

                button.classList.add(
                    'active'
                );

            }


            button.textContent =
                variant.variant_name;


            weightContainer.appendChild(
                button
            );

        }
    );


    // ---------------------------------------------
    // First variant price
    // ---------------------------------------------

    const firstVariant =
        variants[0];


    priceElement.textContent =
        formatPrice(
            firstVariant.price
        );

}


function updateStockDisplay(card, product) {

    const quantity = Number(product.stock_quantity || 0);
    const threshold = Number(product.low_stock_threshold || 5);
    const unit = product.stock_unit || 'kg';

    let status;
    let message;

    if (quantity <= 0) {

        status = 'out-of-stock';
        message = 'Out of Stock';

    } else if (quantity <= threshold) {

        status = 'low-stock';
        message = `Only ${quantity} ${unit} left`;

    } else {

        status = 'in-stock';
        message = 'In Stock';

    }

    let stockElement =
        card.querySelector('.store-stock-status');

    if (!stockElement) {

        stockElement =
            document.createElement('div');

        stockElement.className =
            'store-stock-status';

        const priceElement =
            card.querySelector('.product-price');

        if (priceElement) {

            priceElement
                .parentElement
                .appendChild(stockElement);

        }

    }

    stockElement.className =
        `store-stock-status ${status}`;

    stockElement.textContent = message;
}


// =====================================================
// FORMAT PRICE
// =====================================================

function formatPrice(price) {

    return `₹${Number(price).toLocaleString('en-IN')}`;

}