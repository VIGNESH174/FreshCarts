import { supabase } from './services/supabase.js';

const PRODUCT_IMAGES = {
    "Farm Fresh Red Tomato":
        "https://images.pexels.com/photos/18254763/pexels-photo-18254763.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",

    "Pahadi Gold Potato (Aloo)":
        "https://images.pexels.com/photos/38742086/pexels-photo-38742086.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",

    "Nashik Red Onion (Pyaaz)":
        "https://images.pexels.com/photos/10159434/pexels-photo-10159434.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",

    "Tender Ooty Carrot":
        "https://images.pexels.com/photos/38802742/pexels-photo-38802742.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",

    "Crisp Green Broccoli":
        "https://images.pexels.com/photos/13133609/pexels-photo-13133609.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",

    "Farm Crisp Spinach (Palak)":
        "https://images.pexels.com/photos/6083893/pexels-photo-6083893.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
};

let vegetables = [];


// ========================================
// LOAD VEGETABLES
// ========================================

async function loadVegetables() {

    const container =
        document.getElementById('vegetablesList');

    if (!container) return;


    try {

        const { data, error } = await supabase

            .from('products')

            .select(`
                id,
                name,
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
            throw error;
        }


        vegetables = (data || []).filter(product => {

            return (
                product.categories &&
                product.categories.slug === 'vegetables'
            );

        });


        renderVegetables(vegetables);


    } catch (error) {

        console.error(
            'FreshCart: Failed to load vegetables:',
            error
        );


        container.innerHTML = `

            <div class="products-loading">

                Unable to load vegetables.

                <br>

                <small>
                    ${escapeHTML(
                        error?.message ||
                        'Unknown error'
                    )}
                </small>

            </div>

        `;
    }
}

function getStockStatus(product) {

    const quantity =
        Number(product.stock_quantity || 0);

    const threshold =
        Number(product.low_stock_threshold || 5);

    if (quantity <= 0) {

        return {
            label: 'Out of Stock',
            className: 'out-of-stock'
        };

    }

    if (quantity <= threshold) {

        return {
            label: 'Low Stock',
            className: 'low-stock'
        };

    }

    return {
        label: 'In Stock',
        className: 'in-stock'
    };
}

// ========================================
// RENDER VEGETABLES
// ========================================

function renderVegetables(products) {

    const container =
        document.getElementById('vegetablesList');

    if (!container) return;


    if (products.length === 0) {

        container.innerHTML = `

            <div class="products-loading">
                No vegetables found.
            </div>

        `;

        return;
    }


    container.innerHTML = products
        .map(product => {

            const variants =
                product.product_variants || [];


            const variantText = variants.length

                ? variants
                    .map(variant => {

                        return `
                            ${escapeHTML(
                                variant.variant_name
                            )}
                            - ₹${Number(
                                variant.price
                            ).toLocaleString('en-IN')}
                        `;

                    })
                    .join(' • ')

                : 'No variants';


            return `

                <div
                    class="admin-product-card"
                    data-product-id="${product.id}"
                >

                    <!-- IMAGE -->

                    <div class="admin-product-image">

    <img
        src="${product.image_url || PRODUCT_IMAGES[product.name] || ''}"
        alt="${escapeHTML(product.name)}"
        loading="lazy"
        onerror="this.style.display='none'; this.parentElement.classList.add('image-error');"
    >

</div>


                    <!-- INFORMATION -->

                    <div class="admin-product-info">

                        <h3>
                            ${escapeHTML(
                                product.name
                            )}
                        </h3>


                        <p>
                            ${escapeHTML(
                                product.origin ||
                                'FreshCart'
                            )}
                        </p>


                        <div
                            class="admin-product-variants"
                        >
                            ${variantText}
                        </div>


                  <div class="product-status-actions">

    <span class="product-active-status ${product.is_active ? 'active' : 'inactive'}">
        ${product.is_active ? 'Active' : 'Inactive'}
    </span>

    <button
        type="button"
        class="toggle-product-status"
        data-product-id="${product.id}"
        data-active="${product.is_active}"
    >
        ${product.is_active ? 'Deactivate' : 'Activate'}
    </button>

</div>
${(() => {

    const stock = getStockStatus(product);

    return `
        <div class="product-stock-info">

            <span class="product-stock-status ${stock.className}">
                ${stock.label}
            </span>

            <span class="product-stock-quantity">
                ${Number(product.stock_quantity || 0)}
                ${escapeHTML(product.stock_unit || 'kg')}
            </span>

        </div>
    `;

})()}

                    </div>


                    <!-- ACTIONS -->

                    <div class="admin-product-actions">

                        <button
                            type="button"
                            class="edit-product-button"
                            data-product-id="${product.id}"
                        >
                            Edit
                        </button>

                    </div>

                </div>

            `;

        })
        .join('');
}



// ========================================
// EDIT BUTTONS
// ========================================

function setupEditButtons() {

    document.addEventListener(
        'click',
        event => {

            const button =
                event.target.closest(
                    '.edit-product-button'
                );


            if (!button) return;


            const productId =
                Number(
                    button.dataset.productId
                );


            if (!productId) return;


            openEditProduct(productId);

        }
    );
}



// ========================================
// OPEN EDIT MODAL
// ========================================

function openEditProduct(productId) {

    const product =
        vegetables.find(
            item =>
                Number(item.id) === productId
        );


    if (!product) {

        console.error(
            'FreshCart: Product not found:',
            productId
        );

        return;
    }


    document.getElementById(
        'editProductId'
    ).value = product.id;


    document.getElementById(
        'editProductName'
    ).value = product.name || '';


    document.getElementById(
        'editProductDescription'
    ).value =
        product.description || '';


    document.getElementById(
        'editProductOrigin'
    ).value =
        product.origin || '';


    document.getElementById(
        'editProductImage'
    ).value =
        product.image_url || '';

    document.getElementById('editProductStock').value =
             Number(product.stock_quantity || 0);

    document.getElementById('editProductStockUnit').value =
             product.stock_unit || 'kg';

    document.getElementById('editLowStockThreshold').value =
               Number(product.low_stock_threshold || 5);


    renderEditVariants(
        product.product_variants || []
    );


    document.getElementById(
        'productEditModal'
    ).classList.add('active');

    
}



// ========================================
// CLOSE EDIT MODAL
// ========================================

function closeEditProduct() {

    const modal =
        document.getElementById(
            'productEditModal'
        );


    if (!modal) return;


    modal.classList.remove('active');
}



// ========================================
// EDIT MODAL CONTROLS
// ========================================

function setupEditModal() {

    const closeButton =
        document.getElementById(
            'closeProductEdit'
        );


    const cancelButton =
        document.getElementById(
            'cancelProductEdit'
        );


    const overlay =
        document.querySelector(
            '.product-edit-overlay'
        );


    closeButton?.addEventListener(
        'click',
        closeEditProduct
    );


    cancelButton?.addEventListener(
        'click',
        closeEditProduct
    );


    overlay?.addEventListener(
        'click',
        closeEditProduct
    );


    document
        .getElementById('productEditForm')
        ?.addEventListener(
            'submit',
            saveProduct
        );
}



// ========================================
// RENDER EDIT VARIANTS
// ========================================

function renderEditVariants(variants = []) {

    const container =
        document.getElementById(
            'editVariantsList'
        );


    if (!container) return;


    if (variants.length === 0) {

        container.innerHTML = `

            <div class="no-variants-message">
                No variants added yet.
            </div>

        `;

        return;
    }


    container.innerHTML = variants
        .map(variant => {

            return `

                <div
                    class="edit-variant-row"
                    data-variant-id="${variant.id || ''}"
                >

                    <input
                        type="text"
                        class="edit-variant-name"
                        value="${escapeHTML(
                            variant.variant_name || ''
                        )}"
                        placeholder="Variant name"
                    >


                    <input
                        type="number"
                        class="edit-variant-price"
                        value="${Number(
                            variant.price
                        ) || 0}"
                        min="0"
                        step="0.01"
                        placeholder="Price"
                    >


                    <button
                        type="button"
                        class="remove-variant-button"
                    >
                        ×
                    </button>

                </div>

            `;

        })
        .join('');
}



// ========================================
// ADD NEW VARIANT
// ========================================

function addNewVariantRow() {

    const container =
        document.getElementById(
            'editVariantsList'
        );


    if (!container) return;


    const row =
        document.createElement('div');


    row.className =
        'edit-variant-row';


    row.dataset.variantId = '';


    row.innerHTML = `

        <input
            type="text"
            class="edit-variant-name"
            placeholder="Variant name"
        >


        <input
            type="number"
            class="edit-variant-price"
            min="0"
            step="0.01"
            placeholder="Price"
        >


        <button
            type="button"
            class="remove-variant-button"
        >
            ×
        </button>

    `;


    container.appendChild(row);
}



// ========================================
// VARIANT CONTROLS
// ========================================

function setupVariantControls() {

    document
        .getElementById('addVariantButton')
        ?.addEventListener(
            'click',
            addNewVariantRow
        );


    document.addEventListener(
        'click',
        event => {

            const button =
                event.target.closest(
                    '.remove-variant-button'
                );


            if (!button) return;


            const row =
                button.closest(
                    '.edit-variant-row'
                );


            if (row) {
                row.remove();
            }

        }
    );
}



// ========================================
// SAVE PRODUCT
// ========================================

async function saveProduct(event) {

    event.preventDefault();

    const productId =
        Number(
            document.getElementById(
                'editProductId'
            ).value
        );


    const name =
        document.getElementById(
            'editProductName'
        ).value.trim();


    const description =
        document.getElementById(
            'editProductDescription'
        ).value.trim();


    const origin =
        document.getElementById(
            'editProductOrigin'
        ).value.trim();


    const imageUrl =
        document.getElementById(
            'editProductImage'
        ).value.trim();


    

    const stockQuantity = Number(
    document.getElementById('editProductStock').value
);

const stockUnit =
    document.getElementById('editProductStockUnit').value;

const lowStockThreshold = Number(
    document.getElementById('editLowStockThreshold').value
);

    const button =
        document.getElementById(
            'saveProductButton'
        );

    if (!productId || !name) {

        alert(
            'Product ID and name are required.'
        );

        return;
    }


    button.disabled = true;

    button.textContent = 'Saving...';


    try {

        // ====================================
        // 1. UPDATE PRODUCT
        // ====================================

        const {
            error: productError
        } = await supabase

            .from('products')

            .update({
    name,
    description,
    origin,
    image_url: imageUrl || null,
    stock_quantity: stockQuantity,
    stock_unit: stockUnit,
    low_stock_threshold: lowStockThreshold
})

            .eq('id', productId);


        if (productError) {
            throw productError;
        }



        // ====================================
        // 2. READ VARIANTS FROM FORM
        // ====================================

        const variantRows =
            document.querySelectorAll(
                '#editVariantsList .edit-variant-row'
            );


        const formVariants = [];


        variantRows.forEach(row => {

            const variantId =
                row.dataset.variantId
                    ? Number(
                        row.dataset.variantId
                    )
                    : null;


            const nameInput =
                row.querySelector(
                    '.edit-variant-name'
                );


            const priceInput =
                row.querySelector(
                    '.edit-variant-price'
                );


            const variantName =
                nameInput
                    ? nameInput.value.trim()
                    : '';


            const price =
                priceInput
                    ? Number(
                        priceInput.value
                    )
                    : NaN;


            if (
                !variantName ||
                Number.isNaN(price)
            ) {
                return;
            }


            formVariants.push({

                id: variantId,

                variant_name:
                    variantName,

                price

            });

        });



        // ====================================
        // 3. CURRENT DATABASE VARIANTS
        // ====================================

        const currentProduct =
            vegetables.find(
                product =>
                    Number(product.id) === productId
            );


        const existingVariants =
            currentProduct?.product_variants ||
            [];



        // ====================================
        // 4. UPDATE / INSERT VARIANTS
        // ====================================

        for (
            const variant of formVariants
        ) {

            if (variant.id) {

                const { error } =
                    await supabase

                        .from(
                            'product_variants'
                        )

                        .update({

                            variant_name:
                                variant.variant_name,

                            price:
                                variant.price

                        })

                        .eq(
                            'id',
                            variant.id
                        )

                        .eq(
                            'product_id',
                            productId
                        );


                if (error) {
                    throw error;
                }

            } else {

                const { error } =
                    await supabase

                        .from(
                            'product_variants'
                        )

                        .insert({

                            product_id:
                                productId,

                            variant_name:
                                variant.variant_name,

                            price:
                                variant.price

                        });


                if (error) {
                    throw error;
                }
            }
        }



        // ====================================
        // 5. DELETE REMOVED VARIANTS
        // ====================================

        const formVariantIds =
            formVariants

                .filter(
                    variant => variant.id
                )

                .map(
                    variant =>
                        Number(variant.id)
                );


        const removedVariants =
            existingVariants.filter(
                variant =>
                    !formVariantIds.includes(
                        Number(variant.id)
                    )
            );


        for (
            const variant of removedVariants
        ) {

            const { error } =
                await supabase

                    .from(
                        'product_variants'
                    )

                    .delete()

                    .eq(
                        'id',
                        variant.id
                    )

                    .eq(
                        'product_id',
                        productId
                    );


            if (error) {
                throw error;
            }
        }



        // ====================================
        // 6. SUCCESS
        // ====================================

        button.textContent =
            'Saved ✓';


        await loadVegetables();


        setTimeout(() => {

            closeEditProduct();

            button.disabled = false;

            button.textContent =
                'Save Changes';

        }, 700);


    } catch (error) {

        console.error(
            'FreshCart: Failed to save vegetable:',
            error
        );


        alert(
            error?.message ||
            'Unable to save vegetable changes.'
        );


        button.disabled = false;

        button.textContent =
            'Save Changes';
    }
}



// ========================================
// SEARCH
// ========================================

function setupSearch() {

    const searchInput =
        document.getElementById(
            'vegetableSearch'
        );


    if (!searchInput) return;


    searchInput.addEventListener(
        'input',
        () => {

            const searchTerm =
                searchInput.value
                    .trim()
                    .toLowerCase();


            const filtered =
                vegetables.filter(
                    product =>
                        product.name
                            .toLowerCase()
                            .includes(
                                searchTerm
                            )
                );


            renderVegetables(
                filtered
            );

        }
    );
}



// ========================================
// HTML ESCAPE
// ========================================

function escapeHTML(value) {

    const div =
        document.createElement('div');


    div.textContent =
        value ?? '';


    return div.innerHTML;
}

function createSlug(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function openAddProduct() {
    const modal = document.getElementById('productAddModal');

    if (!modal) return;

    document.getElementById('productAddForm')?.reset();

    const variantsList =
        document.getElementById('addVariantsList');

    if (variantsList) {
        variantsList.innerHTML = `
            <div class="edit-variant-row">
                <input
                    type="text"
                    class="add-variant-name"
                    placeholder="Variant name (e.g. 500g)"
                    required
                >

                <input
                    type="number"
                    class="add-variant-price"
                    placeholder="Price"
                    min="0"
                    step="0.01"
                    required
                >

                <button
                    type="button"
                    class="remove-add-variant-button"
                >
                    ×
                </button>
            </div>
        `;
    }

    modal.classList.add('active');
}


function closeAddProduct() {
    const modal =
        document.getElementById('productAddModal');

    if (!modal) return;

    modal.classList.remove('active');
}


function addNewProductVariant() {
    const container =
        document.getElementById('addVariantsList');

    if (!container) return;

    const row = document.createElement('div');

    row.className = 'edit-variant-row';

    row.innerHTML = `
        <input
            type="text"
            class="add-variant-name"
            placeholder="Variant name"
            required
        >

        <input
            type="number"
            class="add-variant-price"
            placeholder="Price"
            min="0"
            step="0.01"
            required
        >

        <button
            type="button"
            class="remove-add-variant-button"
        >
            ×
        </button>
    `;

    container.appendChild(row);
}

async function createProduct(event) {

    event.preventDefault();

    const name =
        document.getElementById('addProductName')
            .value.trim();

    const description =
        document.getElementById('addProductDescription')
            .value.trim();

    const origin =
        document.getElementById('addProductOrigin')
            .value.trim();

    const imageUrl =
        document.getElementById('addProductImage')
            .value.trim();

    const stockQuantity = Number(
        document.getElementById('addProductStock').value
    );

    const stockUnit =
        document.getElementById('addProductStockUnit').value;

    const lowStockThreshold = Number(
        document.getElementById('addLowStockThreshold').value
    );

    const button =
        document.getElementById('createProductButton');

    if (!name) {
        alert('Product name is required.');
        return;
    }


    const variantRows =
        document.querySelectorAll(
            '#addVariantsList .edit-variant-row'
        );

    const variants = [];

    variantRows.forEach(row => {

        const nameInput =
            row.querySelector('.add-variant-name');

        const priceInput =
            row.querySelector('.add-variant-price');

        const variantName =
            nameInput?.value.trim() || '';

        const price =
            priceInput
                ? Number(priceInput.value)
                : NaN;

        if (
            variantName &&
            !Number.isNaN(price)
        ) {
            variants.push({
                variant_name: variantName,
                price: price
            });
        }
    });


    if (variants.length === 0) {
        alert(
            'Please add at least one variant and price.'
        );
        return;
    }


    button.disabled = true;
    button.textContent = 'Creating...';


    try {

        // Get vegetables category
        const {
            data: category,
            error: categoryError
        } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', 'vegetables')
            .single();


        if (categoryError) {
            throw categoryError;
        }


        // Create product
        const slug = createSlug(name);

        const {
            data: product,
            error: productError
        } = await supabase
            .from('products')
            .insert({
                name: name,
                slug: slug,
                description: description,
                origin: origin,
                image_url: imageUrl || null,
                category_id: category.id,
                is_active: true,
                stock_quantity: stockQuantity,
                stock_unit: stockUnit,
                low_stock_threshold: lowStockThreshold
            })
            .select('id')
            .single();


        if (productError) {
            throw productError;
        }


        // Create variants
        const variantData =
            variants.map(variant => ({
                product_id: product.id,
                variant_name: variant.variant_name,
                price: variant.price
            }));


        const {
            error: variantError
        } = await supabase
            .from('product_variants')
            .insert(variantData);


        if (variantError) {
            throw variantError;
        }


        button.textContent = 'Created ✓';

        await loadVegetables();


        setTimeout(() => {

            closeAddProduct();

            button.disabled = false;

            button.textContent =
                'Create Product';

        }, 700);


    } catch (error) {

        console.error(
            'FreshCart: Failed to create vegetable:',
            error
        );

        alert(
            error?.message ||
            'Unable to create vegetable.'
        );

        button.disabled = false;

        button.textContent =
            'Create Product';
    }
}

function setupAddProductModal() {

    const addButton =
        document.getElementById('addVegetableButton');

    if (!addButton) {
        console.error(
            'FreshCart: addVegetableButton not found'
        );
        return;
    }

    addButton.addEventListener('click', () => {

        console.log(
            'FreshCart: Add Vegetable clicked'
        );

        openAddProduct();

    });

    document
        .getElementById('addVegetableButton')
        ?.addEventListener(
            'click',
            openAddProduct
        );

    document
        .getElementById('closeProductAdd')
        ?.addEventListener(
            'click',
            closeAddProduct
        );

    document
        .getElementById('cancelProductAdd')
        ?.addEventListener(
            'click',
            closeAddProduct
        );

    document
        .querySelector(
            '#productAddModal .product-edit-overlay'
        )
        ?.addEventListener(
            'click',
            closeAddProduct
        );

    document
        .getElementById('productAddForm')
        ?.addEventListener(
            'submit',
            createProduct
        );
}


function setupAddVariantControls() {

    document
        .getElementById('addNewVariantButton')
        ?.addEventListener(
            'click',
            addNewProductVariant
        );


    document.addEventListener(
        'click',
        event => {

            const button =
                event.target.closest(
                    '.remove-add-variant-button'
                );

            if (!button) return;

            const row =
                button.closest(
                    '.edit-variant-row'
                );

            const container =
                document.getElementById(
                    'addVariantsList'
                );

            if (
                row &&
                container &&
                container.children.length > 1
            ) {
                row.remove();
            }
        }
    );
}


async function toggleProductStatus(productId, currentStatus) {

    const newStatus = !currentStatus;

    const button = document.querySelector(
        `.toggle-product-status[data-product-id="${productId}"]`
    );

    if (button) {
        button.disabled = true;
        button.textContent = 'Updating...';
    }

    try {

        const { error } = await supabase
            .from('products')
            .update({
                is_active: newStatus
            })
            .eq('id', productId);

        if (error) {
            throw error;
        }

        console.log(
            `FreshCart: Vegetable ${productId} is now ${
                newStatus ? 'active' : 'inactive'
            }`
        );

        await loadVegetables();

    } catch (error) {

        console.error(
            'FreshCart: Failed to update vegetable status:',
            error
        );

        alert(
            error?.message ||
            'Unable to update product status.'
        );

        if (button) {
            button.disabled = false;

            button.textContent =
                currentStatus
                    ? 'Deactivate'
                    : 'Activate';
        }
    }
}


document.addEventListener('click', event => {

    const button =
        event.target.closest('.toggle-product-status');

    if (!button) return;

    const productId =
        Number(button.dataset.productId);

    const currentStatus =
        button.dataset.active === 'true';

    if (!productId) return;

    toggleProductStatus(
        productId,
        currentStatus
    );
});




// ========================================
// START
// ========================================

document.addEventListener('DOMContentLoaded', () => {

    loadVegetables();

    setupSearch();

    setupEditButtons();

    setupEditModal();

    setupVariantControls();

    setupAddProductModal();

    setupAddVariantControls();

});
