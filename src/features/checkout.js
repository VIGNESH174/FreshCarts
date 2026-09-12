// =====================================================
// FRESHCART CHECKOUT
// =====================================================

import { supabase } from '../services/supabase.js';
import { getCart, clearCart } from './cart.js';

const DELIVERY_THRESHOLD = 499;
const DELIVERY_CHARGE = 40;


// =====================================================
// INITIALIZE CHECKOUT
// =====================================================

// INITIALIZE CHECKOUT
export function initializeCheckout() {
    createCheckoutModal();

    document.addEventListener('click', function (event) {

        const button = event.target.closest('.cart-checkout');

        if (!button) {
            return;
        }

        console.log('CHECKOUT: Proceed to Checkout clicked');

        event.preventDefault();

        openCheckout();
    });

    console.log('FreshCart: Checkout initialized');
}

// =====================================================
// CREATE CHECKOUT MODAL
// =====================================================

function createCheckoutModal() {

    if (document.querySelector('#checkoutModal')) {
        return;
    }

    const modal = document.createElement('div');

    modal.id = 'checkoutModal';
    modal.className = 'checkout-modal';

    modal.innerHTML = `

        <div class="checkout-overlay"></div>

        <div class="checkout-container">

            <div class="checkout-header">

                <div>
                    <h2>Checkout</h2>
                    <p>Complete your order</p>
                </div>

                <button
                    type="button"
                    class="checkout-close"
                >
                    ×
                </button>

            </div>


            <div class="checkout-body">

                <div class="checkout-section">

                    <h3>Delivery Details</h3>

                    <form id="checkoutForm">

                        <div class="checkout-grid">

                            <div class="checkout-field">

                                <label for="checkoutName">
                                    Full Name *
                                </label>

                                <input
                                    id="checkoutName"
                                    name="customer_name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    required
                                >

                            </div>


                            <div class="checkout-field">

                                <label for="checkoutPhone">
                                    Phone Number *
                                </label>

                                <input
                                    id="checkoutPhone"
                                    name="customer_phone"
                                    type="tel"
                                    placeholder="10-digit mobile number"
                                    maxlength="10"
                                    pattern="[0-9]{10}"
                                    required
                                >

                            </div>


                            <div class="checkout-field checkout-full">

                                <label for="checkoutEmail">
                                    Email
                                </label>

                                <input
                                    id="checkoutEmail"
                                    name="customer_email"
                                    type="email"
                                    placeholder="Enter your email"
                                >

                            </div>


                            <div class="checkout-field checkout-full">

                                <label for="checkoutAddress">
                                    Address *
                                </label>

                                <textarea
                                    id="checkoutAddress"
                                    name="address"
                                    rows="3"
                                    placeholder="House / Flat number, Street, Area"
                                    required
                                ></textarea>

                            </div>


                            <div class="checkout-field">

                                <label for="checkoutCity">
                                    City *
                                </label>

                                <input
                                    id="checkoutCity"
                                    name="city"
                                    type="text"
                                    placeholder="Enter city"
                                    required
                                >

                            </div>


                            <div class="checkout-field">

                                <label for="checkoutPincode">
                                    Pincode *
                                </label>

                                <input
                                    id="checkoutPincode"
                                    name="pincode"
                                    type="text"
                                    placeholder="6-digit pincode"
                                    maxlength="6"
                                    pattern="[0-9]{6}"
                                    required
                                >

                            </div>

                        </div>


                        <!-- PAYMENT -->

                        <div class="checkout-payment">

                            <h3>Payment Method</h3>

                            <label class="payment-option">

                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="cod"
                                    checked
                                >

                                <span>
                                    <strong>
                                        Cash on Delivery
                                    </strong>

                                    <small>
                                        Pay when your order arrives
                                    </small>
                                </span>

                            </label>


                            <label class="payment-option">

                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="demo_online"
                                >

                                <span>
                                    <strong>
                                        Demo Online Payment
                                    </strong>

                                    <small>
                                        No real payment will be charged
                                    </small>
                                </span>

                            </label>

                        </div>


                        <!-- ORDER SUMMARY -->

                        <div class="checkout-summary">

                            <h3>Order Summary</h3>

                            <div id="checkoutItems"></div>

                            <div class="checkout-summary-row">

                                <span>Subtotal</span>

                                <strong id="checkoutSubtotal">
                                    ₹0
                                </strong>

                            </div>


                            <div class="checkout-summary-row">

                                <span>Delivery</span>

                                <strong id="checkoutDelivery">
                                    ₹0
                                </strong>

                            </div>


                            <div class="checkout-total">

                                <span>Total</span>

                                <strong id="checkoutTotal">
                                    ₹0
                                </strong>

                            </div>

                        </div>


                        <div
                            id="checkoutError"
                            class="checkout-error"
                            hidden
                        ></div>


                        <button
                            type="submit"
                            class="checkout-place-order"
                        >
                            Place Order
                        </button>

                    </form>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(modal);


    // Close button

    modal
        .querySelector('.checkout-close')
        .addEventListener('click', closeCheckout);


    // Overlay

    modal
        .querySelector('.checkout-overlay')
        .addEventListener('click', closeCheckout);


    // Form

    modal
        .querySelector('#checkoutForm')
        .addEventListener(
            'submit',
            handleCheckoutSubmit
        );
}


// =====================================================
// OPEN CHECKOUT
// =====================================================

function openCheckout() {
    console.log("CHECKOUT: openCheckout called");

    const cart = getCart();

    console.log('Checkout cart:', cart);

    if (!cart || cart.length === 0) {

        alert('Your cart is empty.');

        return;
    }

    renderCheckoutSummary(cart);

    const modal =
        document.querySelector('#checkoutModal');

    modal.classList.add('active');

    document.body.classList.add('checkout-open');
}


// =====================================================
// CLOSE CHECKOUT
// =====================================================

function closeCheckout() {

    const modal =
        document.querySelector('#checkoutModal');

    if (!modal) return;

    modal.classList.remove('active');

    document.body.classList.remove('checkout-open');
}


// =====================================================
// RENDER CHECKOUT SUMMARY
// =====================================================

function renderCheckoutSummary(cart) {

    const itemsContainer =
        document.querySelector('#checkoutItems');

    const subtotalElement =
        document.querySelector('#checkoutSubtotal');

    const deliveryElement =
        document.querySelector('#checkoutDelivery');

    const totalElement =
        document.querySelector('#checkoutTotal');


    itemsContainer.innerHTML = '';


    let subtotal = 0;


    cart.forEach(item => {

        const price =
            Number(item.price) || 0;

        const quantity =
            Number(item.quantity) || 0;

        const itemTotal =
            price * quantity;

        subtotal += itemTotal;


        const row =
            document.createElement('div');

        row.className = 'checkout-item';


        row.innerHTML = `

            <div>

                <strong>
                    ${escapeHTML(item.productName)}
                </strong>

                <small>
                    ${escapeHTML(item.variant)}
                    × ${quantity}
                </small>

            </div>

            <strong>
                ${formatPrice(itemTotal)}
            </strong>

        `;


        itemsContainer.appendChild(row);

    });


    const delivery =
        subtotal >= DELIVERY_THRESHOLD
            ? 0
            : DELIVERY_CHARGE;


    const total =
        subtotal + delivery;


    subtotalElement.textContent =
        formatPrice(subtotal);


    deliveryElement.textContent =
        delivery === 0
            ? 'FREE'
            : formatPrice(delivery);


    totalElement.textContent =
        formatPrice(total);


    console.log('Checkout subtotal:', subtotal);
    console.log('Checkout delivery:', delivery);
    console.log('Checkout total:', total);
}


// =====================================================
// PLACE ORDER
// =====================================================

async function handleCheckoutSubmit(event) {

    event.preventDefault();


    const form = event.currentTarget;

    const submitButton =
        form.querySelector('.checkout-place-order');

    const errorElement =
        document.querySelector('#checkoutError');


    errorElement.hidden = true;


    const cart = getCart();


    if (!cart || cart.length === 0) {

        showCheckoutError(
            'Your cart is empty.'
        );

        return;
    }


    const formData =
        new FormData(form);


    const customerName =
        formData
            .get('customer_name')
            .trim();


    const customerPhone =
        formData
            .get('customer_phone')
            .trim();


    const customerEmail =
        formData
            .get('customer_email')
            .trim();


    const address =
        formData
            .get('address')
            .trim();


    const city =
        formData
            .get('city')
            .trim();


    const pincode =
        formData
            .get('pincode')
            .trim();


    const paymentMethod =
        formData.get('payment_method');


    // Calculate subtotal

    const subtotal =
        cart.reduce(
            (total, item) => {

                return total +
                    Number(item.price) *
                    Number(item.quantity);

            },
            0
        );


    const deliveryCharge =
        subtotal >= DELIVERY_THRESHOLD
            ? 0
            : DELIVERY_CHARGE;


    const totalAmount =
        subtotal + deliveryCharge;


    submitButton.disabled = true;

    submitButton.textContent =
        'Placing Order...';


    try {

        // =================================================
        // INSERT ORDER
        // =================================================

        const {
            data: order,
            error: orderError
        } = await supabase
            .from('orders')
            .insert({

                customer_name:
                    customerName,

                customer_email:
                    customerEmail || null,

                customer_phone:
                    customerPhone,

                address:
                    address,

                city:
                    city,

                pincode:
                    pincode,

                subtotal:
                    subtotal,

                delivery_charge:
                    deliveryCharge,

                total_amount:
                    totalAmount,

                payment_method:
                    paymentMethod,

                payment_status:
                    paymentMethod === 'demo_online'
                        ? 'paid'
                        : 'pending',

                order_status:
                    'placed'

            })
            .select('id, tracking_token')
            .single();


        if (orderError) {
            throw orderError;
        }


        // =================================================
        // INSERT ORDER ITEMS
        // =================================================

        const orderItems = cart.map(item => ({
    order_id: order.id,
    product_id: Number(item.productId),
    product_name: item.productName,
    variant_name: item.variant,
    quantity: Number(item.quantity),
    unit_price: Number(item.price),
    total_price:
        Number(item.price) *
        Number(item.quantity)
}));

              


        const {
            error: itemsError
        } = await supabase
            .from('order_items')
            .insert(orderItems);


        if (itemsError) {
            throw itemsError;
        }

       for (const item of cart) {

    const productId = Number(item.productId);

    const { data: product, error: productFetchError } =
        await supabase
            .from('products')
            .select('stock_quantity, stock_unit')
            .eq('id', productId)
            .single();

    if (productFetchError) {
        throw productFetchError;
    }

    const orderedAmount =
        getVariantStockAmount(
            item.variant,
            product.stock_unit
        ) * Number(item.quantity);

    if (orderedAmount <= 0) {
        throw new Error(
            `Unable to convert ${item.variant} to ${product.stock_unit}`
        );
    }
    
    const { error: stockUpdateError } =
    await supabase.rpc('reduce_product_stock', {
        p_product_id: productId,
        p_quantity: orderedAmount
    });

if (stockUpdateError) {
    throw stockUpdateError;
}

console.log(
    `FreshCart: Product ${productId} stock reduced by`,
    orderedAmount
);
}

        // =================================================
        // SUCCESS
        // =================================================

        clearCart();

        showOrderSuccess(
            order.id,
            order.tracking_token,
            totalAmount
        );


    } catch (error) {

        console.error(
            'FreshCart: Order creation failed:',
            error
        );


        showCheckoutError(
            error.message ||
            'Unable to place order.'
        );


        submitButton.disabled = false;

        submitButton.textContent =
            'Place Order';
    }
}


// =====================================================
// SUCCESS SCREEN
// =====================================================

function showOrderSuccess(
    orderId,
    trackingToken,
    totalAmount
) {

    const container =
        document.querySelector(
            '.checkout-container'
        );

    container.innerHTML = `

        <div class="checkout-success">

            <div class="checkout-success-icon">
                ✓
            </div>

            <h2>
                Order Placed Successfully!
            </h2>

            <p>
                Thank you for shopping with FreshCart.
            </p>

            <div class="order-success-details">

                <div>
                    <span>Order ID</span>

                    <strong>
                        #${orderId}
                    </strong>
                </div>

                <div>
                    <span>Total Amount</span>

                    <strong>
                        ${formatPrice(totalAmount)}
                    </strong>
                </div>

            </div>

            <p class="order-success-message">
                Your fresh fruits and vegetables
                will be delivered to your doorstep.
            </p>

            <div class="checkout-success-actions">

                <button
                    type="button"
                    class="checkout-track-button"
                >
                    Track Order
                </button>

                <button
                    type="button"
                    class="checkout-success-button"
                >
                    Continue Shopping
                </button>

            </div>

        </div>

    `;

    const trackButton = container.querySelector('.checkout-track-button');

if (trackButton) {
    trackButton.addEventListener('click', () => {
        window.location.href =
            `/order-tracking.html?orderId=${orderId}&token=${trackingToken}`;
    });
}

    container
        .querySelector('.checkout-success-button')
        .addEventListener(
            'click',
            () => {

                closeCheckout();

                window.location.reload();

            }
        );

}
// =====================================================
// ERROR
// =====================================================

function showCheckoutError(message) {

    const errorElement =
        document.querySelector(
            '#checkoutError'
        );


    if (!errorElement) return;


    errorElement.textContent =
        message;

    errorElement.hidden = false;
}


// =====================================================
// FORMAT PRICE
// =====================================================

function formatPrice(price) {

    return `₹${Number(price).toLocaleString('en-IN')}`;
}


function getVariantStockAmount(variantName, stockUnit) {
    const text = String(variantName || '')
        .toLowerCase()
        .trim();

    const unit = String(stockUnit || '')
        .toLowerCase()
        .trim();

    /*
     * -----------------------------------------
     * Extract quantity from the selected variant
     * -----------------------------------------
     */

    // Kilograms
    const kgMatch = text.match(/(\d+(?:\.\d+)?)\s*kg/);
    if (kgMatch) {
        const kg = Number(kgMatch[1]);

        if (unit === 'kg') {
            return kg;
        }

        if (unit === 'g' || unit === 'gram' || unit === 'grams') {
            return kg * 1000;
        }

        return kg;
    }

    // Grams
    const gramMatch = text.match(/(\d+(?:\.\d+)?)\s*g\b/);
    if (gramMatch) {
        const grams = Number(gramMatch[1]);

        if (unit === 'kg') {
            return grams / 1000;
        }

        if (
            unit === 'g' ||
            unit === 'gram' ||
            unit === 'grams'
        ) {
            return grams;
        }

        return grams;
    }

    // Dozen
    const dozenMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:dz|dozen)/);
    if (dozenMatch) {
        const dozen = Number(dozenMatch[1]);
        const pieces = dozen * 12;

        if (
            unit === 'pcs' ||
            unit === 'pc' ||
            unit === 'piece' ||
            unit === 'pieces'
        ) {
            return pieces;
        }

        /*
         * If inventory is stored as dozen,
         * keep it as dozen.
         */
        if (unit === 'dozen' || unit === 'dz') {
            return dozen;
        }

        /*
         * Dozen → kg cannot be calculated safely
         * without knowing the average weight of one piece.
         */
        console.warn(
            `FreshCart: Cannot safely convert ${variantName} to ${stockUnit}`
        );

        return 0;
    }

    // Pieces
    const pieceMatch = text.match(
        /(\d+(?:\.\d+)?)\s*(?:pcs?|pieces?)/
    );

    if (pieceMatch) {
        const pieces = Number(pieceMatch[1]);

        if (
            unit === 'pcs' ||
            unit === 'pc' ||
            unit === 'piece' ||
            unit === 'pieces'
        ) {
            return pieces;
        }

        if (unit === 'dozen' || unit === 'dz') {
            return pieces / 12;
        }

        /*
         * Pieces → kg requires the average weight
         * of one piece, so don't guess.
         */
        console.warn(
            `FreshCart: Cannot safely convert ${variantName} to ${stockUnit}`
        );

        return 0;
    }

    // Boxes
    const boxMatch = text.match(
        /(\d+(?:\.\d+)?)\s*(?:boxes?|box)/
    );

    if (boxMatch) {
        const boxes = Number(boxMatch[1]);

        if (unit === 'box' || unit === 'boxes') {
            return boxes;
        }

        console.warn(
            `FreshCart: Cannot safely convert ${variantName} to ${stockUnit}`
        );

        return 0;
    }

    // Bunches
    const bunchMatch = text.match(
        /(\d+(?:\.\d+)?)\s*(?:bunch(?:es)?)/
    );

    if (bunchMatch) {
        const bunches = Number(bunchMatch[1]);

        if (unit === 'bunch' || unit === 'bunches') {
            return bunches;
        }

        console.warn(
            `FreshCart: Cannot safely convert ${variantName} to ${stockUnit}`
        );

        return 0;
    }

    // Single piece / single box / single bunch
    if (/\b(?:pc|piece)\b/.test(text)) {
        if (
            unit === 'pcs' ||
            unit === 'pc' ||
            unit === 'piece' ||
            unit === 'pieces'
        ) {
            return 1;
        }
    }

    if (/\bbox\b/.test(text)) {
        if (unit === 'box' || unit === 'boxes') {
            return 1;
        }
    }

    if (/\bbunch\b/.test(text)) {
        if (unit === 'bunch' || unit === 'bunches') {
            return 1;
        }
    }

    console.warn(
        `FreshCart: Unknown stock conversion for variant "${variantName}" with stock unit "${stockUnit}"`
    );

    return 0;
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}