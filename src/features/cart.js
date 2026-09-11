const STORAGE_KEY = 'freshcart_cart';

let cart = loadCart();

export function getCart() {
    return cart.map(item => ({ ...item }));
}



// ========================================
// INITIALIZE CART
// ========================================

export function initializeCart() {
    console.log("CART: initializeCart started");

    createCartDrawer();
    console.log("CART: drawer created");

    setupCartEvents();
    console.log("CART: events connected");

    updateAllProductCardQuantities();
    updateCartBadge();
    renderCart();

    console.log("CART: initialization complete");
}


// ========================================
// LOAD / SAVE CART
// ========================================

function loadCart() {

    try {

        const savedCart = localStorage.getItem(STORAGE_KEY);

        return savedCart ? JSON.parse(savedCart) : [];

    } catch (error) {

        console.error('FreshCart: Could not load cart', error);

        return [];
    }
}


function saveCart() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(cart)
    );
}


// ========================================
// EVENT HANDLERS
// ========================================

function setupCartEvents() {

    document.addEventListener('click', (event) => {

        // Product + button
        const plusButton =
            event.target.closest('.qty-plus');

        // Product - button
        const minusButton =
            event.target.closest('.qty-minus');


        if (plusButton) {

            const card =
                plusButton.closest('.product-card');

            addProductFromCard(card);

            return;
        }


        if (minusButton) {

            const card =
                minusButton.closest('.product-card');

            removeProductFromCard(card);

            return;
        }


        // Cart button
        const cartButton =
            event.target.closest('.nav-cart');

        if (cartButton) {

            event.preventDefault();

            openCart();

            return;
        }


        // Cart drawer + button
        const increase =
            event.target.closest('[data-cart-plus]');

        if (increase) {

            changeCartQuantity(
                Number(increase.dataset.cartPlus),
                1
            );

            return;
        }


        // Cart drawer - button
        const decrease =
            event.target.closest('[data-cart-minus]');

        if (decrease) {

            changeCartQuantity(
                Number(decrease.dataset.cartMinus),
                -1
            );

            return;
        }


        // Remove cart item
        const remove =
            event.target.closest('[data-cart-remove]');

        if (remove) {

            removeCartItem(
                Number(remove.dataset.cartRemove)
            );

            return;
        }


        // Clear cart
        const clear =
            event.target.closest('[data-cart-clear]');

        if (clear) {

            clearCart();

            return;
        }


        // Close cart
        const close =
            event.target.closest('[data-cart-close]');

        if (close) {

            closeCart();

            return;
        }


        // Click overlay
        if (
            event.target.classList.contains(
                'cart-overlay'
            )
        ) {

            closeCart();
        }

    });
}


// ========================================
// ADD PRODUCT
// ========================================

function addProductFromCard(card) {

    if (!card) return;


    const productId =
        card.dataset.productId;


    const nameElement =
        card.querySelector('.product-name');


    const priceElement =
        card.querySelector('.product-price');


    const activeVariant =
        card.querySelector(
            '.weight-pill.active'
        );


    if (
        !productId ||
        !nameElement ||
        !priceElement ||
        !activeVariant
    ) {

        console.warn(
            'FreshCart: Product card data missing'
        );

        return;
    }


    const productName =
        nameElement.textContent.trim();


    const variant =
        activeVariant.textContent.trim();


    const price =
    Number(
        activeVariant.dataset.price
    );


    // Find existing product + variant
    const existingItem =
        cart.find(item =>
            String(item.productId) === String(productId) &&
            item.variant === variant
        );


    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        cart.push({

            productId: String(productId),

            productName,

            variant,

            price,

            quantity: 1

        });
    }


    saveCart();

    updateCartBadge();

    updateProductCardQuantity(card);

    renderCart();

    animateCartBadge();
}


// ========================================
// REMOVE PRODUCT
// ========================================

function removeProductFromCard(card) {

    if (!card) return;


    const productId =
        card.dataset.productId;


    const activeVariant =
        card.querySelector(
            '.weight-pill.active'
        );


    if (
        !productId ||
        !activeVariant
    ) {

        return;
    }


    const variant =
        activeVariant.textContent.trim();


    const item =
        cart.find(item =>
            String(item.productId) === String(productId) &&
            item.variant === variant
        );


    if (!item) return;


    item.quantity -= 1;


    if (item.quantity <= 0) {

        cart = cart.filter(
            cartItem =>
                !(
                    String(cartItem.productId) === String(productId) &&
                    cartItem.variant === variant
                )
        );
    }


    saveCart();

    updateCartBadge();

    updateProductCardQuantity(card);

    renderCart();
}


// ========================================
// CART DRAWER QUANTITY
// ========================================

function changeCartQuantity(index, amount) {

    if (!cart[index]) return;


    cart[index].quantity += amount;


    if (cart[index].quantity <= 0) {

        cart.splice(index, 1);
    }


    saveCart();

    updateCartBadge();

    renderCart();

    updateAllProductCardQuantities();
}


// ========================================
// REMOVE CART ITEM
// ========================================

function removeCartItem(index) {

    if (!cart[index]) return;


    cart.splice(index, 1);


    saveCart();

    updateCartBadge();

    renderCart();

    updateAllProductCardQuantities();
}


// ========================================
// CLEAR CART
// ========================================

export function clearCart() {

    cart = [];


    saveCart();

    updateCartBadge();

    renderCart();

    updateAllProductCardQuantities();
}


// ========================================
// UPDATE CART BADGE
// ========================================

function updateCartBadge() {

    const badge =
        document.querySelector('.cart-count');


    if (!badge) return;


    const totalQuantity =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );


    badge.textContent =
        totalQuantity;
}


// ========================================
// UPDATE PRODUCT CARD QUANTITY
// ========================================

function updateProductCardQuantity(card) {

    if (!card) return;

    const productId = String(card.dataset.productId || '');

    const activeVariant = card.querySelector('.weight-pill.active');

    const quantityElement = card.querySelector('.qty-value');

    if (!productId || !activeVariant || !quantityElement) {
        return;
    }

    const variant = activeVariant.textContent.trim();

    const item = cart.find(item =>
        String(item.productId) === productId &&
        item.variant === variant
    );

    quantityElement.textContent = item
        ? String(item.quantity)
        : '0';
}



// ========================================
// UPDATE ALL PRODUCT CARDS
// ========================================

function updateAllProductCardQuantities() {

    const cards = document.querySelectorAll('.product-card');

    cards.forEach(card => {
        updateProductCardQuantity(card);
    });
}

// ========================================
// WHEN VARIANT CHANGES
// ========================================

document.addEventListener(
    'freshcart:variantChanged',
    (event) => {

        const card =
            event.detail?.card;

        if (card) {

            updateProductCardQuantity(card);

        } else {

            updateAllProductCardQuantities();

        }

    }
);


// ========================================
// CART DRAWER
// ========================================

function createCartDrawer() {

    if (
        document.getElementById(
            'freshcartCartDrawer'
        )
    ) {

        return;
    }


    const drawer =
        document.createElement('div');


    drawer.id =
        'freshcartCartDrawer';


    drawer.innerHTML = `

        <div class="cart-overlay"></div>

        <aside class="cart-drawer">

            <div class="cart-header">

                <div>

                    <h2>Your Cart</h2>

                    <p>
                        Freshness waiting for you
                    </p>

                </div>


                <button
                    class="cart-close"
                    data-cart-close
                    aria-label="Close cart"
                >
                    ×
                </button>

            </div>


            <div class="cart-items"></div>


            <div class="cart-footer">

                <div class="cart-subtotal-row">

                    <span>Subtotal</span>

                    <strong class="cart-subtotal">
                        ₹0
                    </strong>

                </div>


                <button class="cart-checkout">
                    Proceed to Checkout
                </button>


                <button
                    class="cart-clear"
                    data-cart-clear
                >
                    Clear Cart
                </button>

            </div>

        </aside>
    `;


    document.body.appendChild(drawer);
}


// ========================================
// RENDER CART
// ========================================

function renderCart() {

    const drawer =
        document.getElementById(
            'freshcartCartDrawer'
        );


    if (!drawer) return;


    const itemsContainer =
        drawer.querySelector(
            '.cart-items'
        );


    const subtotalElement =
        drawer.querySelector(
            '.cart-subtotal'
        );


    if (cart.length === 0) {

        itemsContainer.innerHTML = `

            <div class="cart-empty">

                <div class="cart-empty-icon">
                    🛒
                </div>

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Add some fresh products
                    to get started.
                </p>

            </div>

        `;


        subtotalElement.textContent =
            '₹0';


        return;
    }


    itemsContainer.innerHTML =
        cart.map(
            (item, index) => {

                const itemTotal =
                    item.price *
                    item.quantity;


                return `

                    <div class="cart-item">

                        <div class="cart-item-image">
                            🥬
                        </div>


                        <div class="cart-item-info">

                            <h3>
                                ${escapeHtml(
                                    item.productName
                                )}
                            </h3>


                            <p class="cart-item-variant">
                                ${escapeHtml(
                                    item.variant
                                )}
                            </p>


                            <strong>
                                ₹${itemTotal.toLocaleString(
                                    'en-IN'
                                )}
                            </strong>


                            <div
                                class="cart-item-controls"
                            >

                                <button
                                    data-cart-minus="${index}"
                                >
                                    −
                                </button>


                                <span>
                                    ${item.quantity}
                                </span>


                                <button
                                    data-cart-plus="${index}"
                                >
                                    +
                                </button>

                            </div>

                        </div>


                        <button
                            class="cart-item-remove"
                            data-cart-remove="${index}"
                        >
                            ×
                        </button>

                    </div>

                `;
            }
        ).join('');


    const subtotal =
        cart.reduce(
            (total, item) =>
                total +
                (
                    item.price *
                    item.quantity
                ),
            0
        );


    subtotalElement.textContent =
        `₹${subtotal.toLocaleString(
            'en-IN'
        )}`;
}


// ========================================
// OPEN CART
// ========================================

function openCart() {

    const drawer =
        document.getElementById(
            'freshcartCartDrawer'
        );


    if (!drawer) return;


    renderCart();


    drawer.classList.add('open');

    document.body.classList.add(
        'cart-open'
    );
}


// ========================================
// CLOSE CART
// ========================================

function closeCart() {

    const drawer =
        document.getElementById(
            'freshcartCartDrawer'
        );


    if (!drawer) return;


    drawer.classList.remove('open');

    document.body.classList.remove(
        'cart-open'
    );
}


// ========================================
// BADGE ANIMATION
// ========================================

function animateCartBadge() {

    const badge =
        document.querySelector(
            '.cart-count'
        );


    if (!badge) return;


    badge.style.transform =
        'scale(1.4)';


    setTimeout(() => {

        badge.style.transform =
            'scale(1)';

    }, 200);
}


// ========================================
// HTML SAFETY
// ========================================

function escapeHtml(value) {

    const div =
        document.createElement('div');


    div.textContent =
        value;


    return div.innerHTML;
}