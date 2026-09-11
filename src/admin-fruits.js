import { supabase } from './services/supabase.js';

const PRODUCT_IMAGES = {
    "Shimla Royal Apple":
        "https://images.pexels.com/photos/3746517/pexels-photo-3746517.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",

    "Robusta Banana":
        "https://images.pexels.com/photos/47305/bananas-banana-shrub-fruits-yellow-47305.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",

    "Nagpur Sweet Orange (Santra)":
        "https://images.pexels.com/photos/37543950/pexels-photo-37543950.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",

    "Alphonso Mango (Hapus)":
        "https://images.pexels.com/photos/38802739/pexels-photo-38802739.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",

    "Seedless Black Grapes":
        "https://images.pexels.com/photos/30542312/pexels-photo-30542312.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",

    "Hybrid Sweet Watermelon":
        "https://images.pexels.com/photos/8743922/pexels-photo-8743922.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
};


let fruits = [];


async function loadFruits() {

    const container =
        document.getElementById('fruitsList');

    if (!container) return;

    try {

        const { data, error } =
            await supabase
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

        fruits = (data || []).filter(product =>
            product.categories &&
            product.categories.slug === 'fruits'
        );

        renderFruits(fruits);

    } catch (error) {

        console.error(
            'FreshCart: Failed to load fruits:',
            error
        );

        container.innerHTML = `
            <div class="products-loading">

                Unable to load fruits.

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
    const quantity = Number(product.stock_quantity || 0);
    const threshold = Number(product.low_stock_threshold || 5);

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

function renderFruits(products) {

    const container =
        document.getElementById('fruitsList');

    if (!container) return;


    if (products.length === 0) {

        container.innerHTML = `
            <div class="products-loading">
                No fruits found.
            </div>
        `;

        return;
    }


    container.innerHTML =
        products.map(product => {

            const variants =
                product.product_variants || [];


            const variantText =
                variants.length

                    ? variants
                        .map(variant =>
                            `${escapeHTML(
                                variant.variant_name
                            )} - ₹${Number(
                                variant.price
                            ).toLocaleString('en-IN')}`
                        )
                        .join(' • ')

                    : 'No variants';


            return `

                <div
                    class="admin-product-card"
                    data-product-id="${product.id}"
                >

                    <div class="admin-product-image">

    <img
        src="${product.image_url || PRODUCT_IMAGES[product.name] || ''}"
        alt="${escapeHTML(product.name)}"
        loading="lazy"
        onerror="this.style.display='none'; this.parentElement.classList.add('image-error');"
    >

</div>


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


                        <div class="admin-product-variants">

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

        }).join('');
}

function setupEditButtons() {

    document.addEventListener('click', event => {

        const button =
            event.target.closest('.edit-product-button');

        if (!button) return;

        const productId =
            Number(button.dataset.productId);

        if (!productId) return;

        openEditProduct(productId);
    });
}


function openEditProduct(productId) {

    const product =
        fruits.find(
            item => Number(item.id) === productId
        );

    if (!product) {
        console.error(
            'FreshCart: Product not found:',
            productId
        );
        return;
    }

    // Product ID
    document.getElementById(
        'editProductId'
    ).value = product.id;

    // Product name
    document.getElementById(
        'editProductName'
    ).value = product.name || '';

    // Description
    document.getElementById(
        'editProductDescription'
    ).value = product.description || '';

    // Origin
    document.getElementById(
        'editProductOrigin'
    ).value = product.origin || '';

    // Stock
    document.getElementById(
        'editProductStock'
    ).value = Number(
        product.stock_quantity || 0
    );

    document.getElementById(
        'editProductStockUnit'
    ).value =
        product.stock_unit || 'kg';

    document.getElementById(
        'editLowStockThreshold'
    ).value = Number(
        product.low_stock_threshold || 5
    );

    // Reset image file input
    const imageInput =
        document.getElementById(
            'editProductImageFile'
        );

    if (imageInput) {
        imageInput.value = '';
    }

    // Show existing image
    const preview =
        document.getElementById(
            'editProductPreviewImg'
        );

    if (preview) {
        preview.src =
            product.image_url ||
            PRODUCT_IMAGES[product.name] ||
            '';
    }

    // Load variants
    renderEditVariants(
        product.product_variants || []
    );

    // Open modal
    document
        .getElementById('productEditModal')
        .classList.add('active');
}


function closeEditProduct() {

    const modal =
        document.getElementById(
            'productEditModal'
        );

    if (!modal) return;

    modal.classList.remove('active');
}


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


function showSaveSuccessMessage() {

    const existingMessage =
        document.getElementById('saveSuccessMessage');

    if (existingMessage) {
        existingMessage.remove();
    }

    const message =
        document.createElement('div');

    message.id = 'saveSuccessMessage';

    message.textContent =
        'Saved successfully ✓';

    message.style.position = 'fixed';
    message.style.top = '25px';
    message.style.right = '25px';
    message.style.zIndex = '999999';
    message.style.padding = '14px 22px';
    message.style.borderRadius = '10px';
    message.style.background = '#16a34a';
    message.style.color = '#ffffff';
    message.style.fontSize = '15px';
    message.style.fontWeight = '600';
    message.style.boxShadow =
        '0 8px 25px rgba(0,0,0,0.15)';

    document.body.appendChild(message);

    setTimeout(() => {
        message.remove();
    }, 2500);
}





async function saveProduct(event) {
    event.preventDefault();

    const productId = Number(
        document.getElementById('editProductId').value
    );

    const name = document
        .getElementById('editProductName')
        .value
        .trim();

    const description = document
        .getElementById('editProductDescription')
        .value
        .trim();

    const origin = document
        .getElementById('editProductOrigin')
        .value
        .trim();

    const stockQuantity = Number(
        document.getElementById('editProductStock').value
    );

    const stockUnit =
        document.getElementById('editProductStockUnit').value;

    const lowStockThreshold = Number(
        document.getElementById('editLowStockThreshold').value
    );

    const imageInput =
        document.getElementById('editProductImageFile');

    const imageFile =
        imageInput?.files?.[0] || null;

    const button =
        document.getElementById('saveProductButton');

    if (!productId || !name) {
        alert('Product ID and name are required.');
        return;
    }

    button.disabled = true;
    button.textContent = 'Saving...';

    try {

        // Find current product FIRST
        const currentProduct =
            fruits.find(
                product =>
                    Number(product.id) === productId
            );

        if (!currentProduct) {
            throw new Error('Product not found.');
        }

        // Keep current image if user did not upload a new one
        let imageUrl =
            currentProduct.image_url || null;

        // Upload new image only when selected
        if (imageFile) {
            imageUrl =
                await uploadProductImage(
                    imageFile,
                    productId
                );
        }

        // ========================================
        // UPDATE PRODUCT
        // ========================================

        const { error: productError } =
            await supabase
                .from('products')
                .update({
                    name,
                    description,
                    origin,
                    image_url: imageUrl,
                    stock_quantity: stockQuantity,
                    stock_unit: stockUnit,
                    low_stock_threshold:
                        lowStockThreshold
                })
                .eq('id', productId);

        if (productError) {
            throw productError;
        }

        // ========================================
        // GET FORM VARIANTS
        // ========================================

        const variantRows =
            document.querySelectorAll(
                '#editVariantsList .edit-variant-row'
            );

        const formVariants = [];

        variantRows.forEach(row => {

            const variantId =
                row.dataset.variantId
                    ? Number(row.dataset.variantId)
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
                    ? Number(priceInput.value)
                    : NaN;

            if (!variantName || Number.isNaN(price)) {
                return;
            }

            formVariants.push({
                id: variantId,
                variant_name: variantName,
                price
            });
        });

        // ========================================
        // EXISTING VARIANTS
        // ========================================

        const existingVariants =
            currentProduct.product_variants || [];

        // ========================================
        // UPDATE / INSERT VARIANTS
        // ========================================

        for (const variant of formVariants) {

            if (variant.id) {

                const { error } =
                    await supabase
                        .from('product_variants')
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
                        .from('product_variants')
                        .insert({
                            product_id: productId,
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

        // ========================================
        // DELETE REMOVED VARIANTS
        // ========================================

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

        for (const variant of removedVariants) {

            const { error } =
                await supabase
                    .from('product_variants')
                    .delete()
                    .eq('id', variant.id)
                    .eq(
                        'product_id',
                        productId
                    );

            if (error) {
                throw error;
            }
        }

        // ========================================
        // SUCCESS
        // ========================================

        button.textContent = 'Saved ✓';

        showToast(
            'Saved successfully ✓'
        );

        // Update local data immediately
        currentProduct.name = name;
        currentProduct.description = description;
        currentProduct.origin = origin;
        currentProduct.image_url = imageUrl;
        currentProduct.stock_quantity =
            stockQuantity;
        currentProduct.stock_unit =
            stockUnit;
        currentProduct.low_stock_threshold =
            lowStockThreshold;

        // Close modal quickly
        setTimeout(() => {

            closeEditProduct();

            button.disabled = false;
            button.textContent =
                'Save Changes';

            renderFruits(fruits);

        }, 700);

    } catch (error) {

        console.error(
            'FreshCart: Failed to save product:',
            error
        );

        alert(
            error?.message ||
            'Unable to save product changes.'
        );

        button.disabled = false;
        button.textContent =
            'Save Changes';
    }
}

    

function setupSearch() {

    const searchInput =
        document.getElementById('fruitSearch');

    if (!searchInput) return;


    searchInput.addEventListener(
        'input',
        () => {

            const searchTerm =
                searchInput.value
                    .trim()
                    .toLowerCase();


            const filtered =
                fruits.filter(product =>
                    product.name
                        .toLowerCase()
                        .includes(searchTerm)
                );


            renderFruits(filtered);

        }
    );
}

function showToast(message, type = 'success') {

    const oldToast =
        document.getElementById(
            'freshcartToast'
        );

    if (oldToast) {
        oldToast.remove();
    }

    const toast =
        document.createElement('div');

    toast.id =
        'freshcartToast';

    toast.textContent =
        message;

    toast.style.position =
        'fixed';

    toast.style.top =
        '25px';

    toast.style.right =
        '25px';

    toast.style.zIndex =
        '9999999';

    toast.style.padding =
        '14px 22px';

    toast.style.borderRadius =
        '10px';

    toast.style.background =
        type === 'success'
            ? '#16a34a'
            : '#dc2626';

    toast.style.color =
        '#ffffff';

    toast.style.fontSize =
        '15px';

    toast.style.fontWeight =
        '600';

    toast.style.boxShadow =
        '0 8px 25px rgba(0,0,0,0.18)';

    document.body.appendChild(
        toast
    );

    setTimeout(() => {
        toast.remove();
    }, 2500);
}



function escapeHTML(value) {

    const div =
        document.createElement('div');

    div.textContent =
        value ?? '';

    return div.innerHTML;
}

function renderEditVariants(variants = []) {
    const container = document.getElementById('editVariantsList');

    if (!container) return;

    if (variants.length === 0) {
        container.innerHTML = `
            <div class="no-variants-message">
                No variants added yet.
            </div>
        `;
        return;
    }

    container.innerHTML = variants.map(variant => `
        <div class="edit-variant-row" data-variant-id="${variant.id || ''}">
            <input
                type="text"
                class="edit-variant-name"
                value="${escapeHTML(variant.variant_name || '')}"
                placeholder="Variant name"
            >

            <input
                type="number"
                class="edit-variant-price"
                value="${Number(variant.price) || 0}"
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
    `).join('');
}


function addNewVariantRow() {
    const container = document.getElementById('editVariantsList');

    if (!container) return;

    const row = document.createElement('div');

    row.className = 'edit-variant-row';
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

function setupVariantControls() {
    document
        .getElementById('addVariantButton')
        ?.addEventListener('click', addNewVariantRow);

    document.addEventListener('click', event => {
        const button = event.target.closest('.remove-variant-button');

        if (!button) return;

        const row = button.closest('.edit-variant-row');

        if (row) {
            row.remove();
        }
    });
}

// ========================================
// OPEN ADD PRODUCT MODAL
// ========================================

function openAddProduct() {

    const modal =
        document.getElementById(
            'productAddModal'
        );

    if (!modal) return;

    document.getElementById(
        'productAddForm'
    )?.reset();

    const variantsList =
        document.getElementById(
            'addVariantsList'
        );

    if (variantsList) {

        variantsList.innerHTML = `

            <div
                class="edit-variant-row"
            >

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

// ========================================
// CLOSE ADD PRODUCT MODAL
// ========================================

function closeAddProduct() {

    const modal =
        document.getElementById(
            'productAddModal'
        );

    if (!modal) return;

    modal.classList.remove('active');
}

// ========================================
// ADD NEW VARIANT TO NEW PRODUCT
// ========================================

function addNewProductVariant() {

    const container =
        document.getElementById(
            'addVariantsList'
        );

    if (!container) return;


    const row =
        document.createElement('div');


    row.className =
        'edit-variant-row';


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

// ========================================
// REMOVE NEW VARIANT
// ========================================

function setupAddVariantControls() {

    document
        .getElementById(
            'addNewVariantButton'
        )
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


            if (!row) return;


            const container =
                document.getElementById(
                    'addVariantsList'
                );


            if (
                container &&
                container.children.length > 1
            ) {

                row.remove();

            }

        }
    );
}

// ========================================
// CREATE PRODUCT SLUG
// ========================================

function createSlug(text) {

    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

// ========================================
// CREATE NEW PRODUCT
// ========================================

async function createProduct(event) {

    event.preventDefault();


    const name =
        document.getElementById(
            'addProductName'
        ).value.trim();


    const description =
        document.getElementById(
            'addProductDescription'
        ).value.trim();


    const origin =
        document.getElementById(
            'addProductOrigin'
        ).value.trim();


    const imageUrl =
        document.getElementById(
            'addProductImage'
        ).value.trim();


    const button =
        document.getElementById(
            'createProductButton'
        );


    if (!name) {

        alert(
            'Product name is required.'
        );

        return;
    }


    // ====================================
    // COLLECT VARIANTS
    // ====================================

    const variantRows =
        document.querySelectorAll(
            '#addVariantsList .edit-variant-row'
        );


    const variants = [];


    variantRows.forEach(row => {

        const nameInput =
            row.querySelector(
                '.add-variant-name'
            );


        const priceInput =
            row.querySelector(
                '.add-variant-price'
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
            variantName &&
            !Number.isNaN(price)
        ) {

            variants.push({

                variant_name:
                    variantName,

                price

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

    button.textContent =
        'Creating...';


    try {

        // ====================================
        // 1. GET FRUITS CATEGORY
        // ====================================

        const {
            data: category,
            error: categoryError
        } = await supabase

            .from('categories')

            .select('id')

            .eq(
                'slug',
                'fruits'
            )

            .single();


        if (categoryError) {
            throw categoryError;
        }


        // ====================================
// 2. CREATE PRODUCT
// ====================================

const slug = createSlug(name);

const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
        name: name,
        slug: slug,
        description: description,
        origin: origin,
        image_url: imageUrl || null,
        category_id: category.id,
        is_active: true
    })
    .select('id')
    .single();

if (productError) {
    throw productError;
}


        if (productError) {
            throw productError;
        }


        // ====================================
        // 3. CREATE VARIANTS
        // ====================================

        const variantData =
            variants.map(
                variant => ({

                    product_id:
                        product.id,

                    variant_name:
                        variant.variant_name,

                    price:
                        variant.price

                })
            );


        const {
            error: variantError
        } = await supabase

            .from(
                'product_variants'
            )

            .insert(
                variantData
            );


        if (variantError) {
            throw variantError;
        }



       // ========================================
// 6. SUCCESS
// ========================================

button.textContent = 'Saved ✓';

showSaveSuccessMessage();

closeEditProduct();

button.disabled = false;
button.textContent = 'Save Changes';

// Refresh product list in the background
loadFruits();
 

    } catch (error) {

        console.error(
            'FreshCart: Failed to create fruit:',
            error
        );


        alert(
            error?.message ||
            'Unable to create product.'
        );


        button.disabled = false;

        button.textContent =
            'Create Product';
    }
}

// ========================================
// ADD PRODUCT MODAL CONTROLS
// ========================================

function setupAddProductModal() {

    document
        .getElementById(
            'addFruitButton'
        )
        ?.addEventListener(
            'click',
            openAddProduct
        );


    document
        .getElementById(
            'closeProductAdd'
        )
        ?.addEventListener(
            'click',
            closeAddProduct
        );


    document
        .getElementById(
            'cancelProductAdd'
        )
        ?.addEventListener(
            'click',
            closeAddProduct
        );


    const overlay =
        document.querySelector(
            '#productAddModal .product-edit-overlay'
        );


    overlay?.addEventListener(
        'click',
        closeAddProduct
    );


    document
        .getElementById(
            'productAddForm'
        )
        ?.addEventListener(
            'submit',
            createProduct
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
            `FreshCart: Product ${productId} is now ${
                newStatus ? 'active' : 'inactive'
            }`
        );

        await loadFruits();

    } catch (error) {

        console.error(
            'FreshCart: Failed to update product status:',
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

async function uploadProductImage(file, productId) {
    if (!file) {
        return null;
    }

    if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file.');
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
        throw new Error('Image size must be less than 5 MB.');
    }

    const extension =
        file.name.split('.').pop().toLowerCase();

    const filePath =
        `fruits/${productId}-${Date.now()}.${extension}`;

    const { error: uploadError } =
        await supabase
            .storage
            .from('product-images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

    if (uploadError) {
        throw uploadError;
    }

    const { data } =
        supabase
            .storage
            .from('product-images')
            .getPublicUrl(filePath);

    return data.publicUrl;
}

function setupImagePreview() {

    const input =
        document.getElementById('editProductImageFile');

    const preview =
        document.getElementById('editProductPreviewImg');

    if (!input || !preview) return;

    input.addEventListener('change', () => {

        const file = input.files[0];

        if (!file) {
            preview.src = '';
            return;
        }

        const imageUrl =
            URL.createObjectURL(file);

        preview.src = imageUrl;
    });
}





document.addEventListener(
    'DOMContentLoaded',
    () => {

         loadFruits();
         setupSearch();
         setupEditButtons();
         setupEditModal();
         setupVariantControls();
         setupAddProductModal();
         setupAddVariantControls();
         setupImagePreview();

    }
);
