

import { requireAdmin, logoutAdmin } from './admin-auth.js';
import { supabase } from './services/supabase.js';

const isAuthenticated = await requireAdmin();

if (!isAuthenticated) {
    throw new Error('Admin authentication required.');
}



// =====================================================
// LOAD ORDERS
// =====================================================

async function loadOrders() {

    const loading =
        document.querySelector('#ordersLoading');

    const tableBody =
        document.querySelector('#ordersTableBody');

    loading.style.display = 'block';

    try {

        const { data, error } =
            await supabase
                .from('orders')
                .select('*')
                .order('created_at', {
                    ascending: false
                });

        if (error) {
            throw error;
        }

        console.log(
            'FreshCart Admin Orders:',
            data
        );

        updateStatistics(data);

        updateOrderStatusAnalytics(data);
        updateSalesChart(data);
        loadTopSellingProducts();
        renderOrders(data);

    } catch (error) {

        console.error(
            'FreshCart Admin Error:',
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    Unable to load orders.
                </td>
            </tr>
        `;

    } finally {

        loading.style.display = 'none';

    }
}


// =====================================================
// UPDATE STATISTICS
// =====================================================

function updateStatistics(orders) {

    const totalOrders =
        orders.length;


    const pendingOrders =
        orders.filter(order =>
            order.order_status === 'placed' ||
            order.order_status === 'pending'
        ).length;


    const deliveredOrders =
        orders.filter(order =>
            order.order_status === 'delivered'
        ).length;


    const totalSales =
        orders.reduce(
            (total, order) =>
                total +
                Number(order.total_amount || 0),
            0
        );


    document.querySelector('#totalOrders')
        .textContent = totalOrders;


    document.querySelector('#pendingOrders')
        .textContent = pendingOrders;


    document.querySelector('#deliveredOrders')
        .textContent = deliveredOrders;


    document.querySelector('#totalSales')
        .textContent =
            formatPrice(totalSales);
}

function updateOrderStatusAnalytics(orders) {
    const statusCounts = {
        placed: 0,
        confirmed: 0,
        packed: 0,
        out_for_delivery: 0,
        delivered: 0,
        cancelled: 0
    };

    orders.forEach(order => {
        const status = order.order_status;

        if (statusCounts.hasOwnProperty(status)) {
            statusCounts[status]++;
        }
    });

    const placedElement =
        document.getElementById('placedOrders');

    const confirmedElement =
        document.getElementById('confirmedOrders');

    const packedElement =
        document.getElementById('packedOrders');

    const outForDeliveryElement =
        document.getElementById('outForDeliveryOrders');

    const cancelledElement =
        document.getElementById('cancelledOrders');

    if (placedElement) {
        placedElement.textContent =
            statusCounts.placed;
    }

    if (confirmedElement) {
        confirmedElement.textContent =
            statusCounts.confirmed;
    }

    if (packedElement) {
        packedElement.textContent =
            statusCounts.packed;
    }

    if (outForDeliveryElement) {
        outForDeliveryElement.textContent =
            statusCounts.out_for_delivery;
    }

    if (cancelledElement) {
        cancelledElement.textContent =
            statusCounts.cancelled;
    }
}

function updateSalesChart(orders) {
    const canvas = document.getElementById('salesChart');

    if (!canvas || typeof Chart === 'undefined') {
        return;
    }

    const today = new Date();

    const salesByDay = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setHours(0, 0, 0, 0);
        date.setDate(today.getDate() - i);

        salesByDay.push({
            date,
            label: date.toLocaleDateString('en-IN', {
                weekday: 'short'
            }),
            sales: 0
        });
    }

    orders.forEach(order => {
        if (!order.created_at) return;

        const orderDate = new Date(order.created_at);
        orderDate.setHours(0, 0, 0, 0);

        const matchingDay = salesByDay.find(day =>
            day.date.getTime() === orderDate.getTime()
        );

        if (matchingDay) {
            matchingDay.sales += Number(order.total_amount) || 0;
        }
    });

    const labels = salesByDay.map(day => day.label);
    const sales = salesByDay.map(day => day.sales);

    const existingChart = Chart.getChart(canvas);

    if (existingChart) {
        existingChart.destroy();
    }

    new Chart(canvas, {
        type: 'line',

        data: {
            labels,

            datasets: [{
                label: 'Sales',

                data: sales,

                tension: 0.4,

                fill: true,

                borderWidth: 3,

                pointRadius: 4,

                pointHoverRadius: 6
            }]
        },

        options: {
            responsive: true,

            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `₹${Number(context.raw).toLocaleString('en-IN')}`;
                        }
                    }
                }
            },

            scales: {
                y: {
                    beginAtZero: true,

                    ticks: {
                        callback: function(value) {
                            return `₹${Number(value).toLocaleString('en-IN')}`;
                        }
                    }
                }
            }
        }
    });
}

async function loadTopSellingProducts() {

    const container =
        document.getElementById('topProductsList');

    if (!container) return;

    try {

        const { data, error } =
            await supabase
                .from('order_items')
                .select(
                    'product_name, quantity'
                );

        if (error) {
            throw error;
        }

        const productTotals = {};

        data.forEach(item => {

            const name =
                item.product_name;

            const quantity =
                Number(item.quantity) || 0;

            if (!productTotals[name]) {
                productTotals[name] = 0;
            }

            productTotals[name] += quantity;

        });

        const products =
            Object.entries(productTotals)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

        if (products.length === 0) {

            container.innerHTML = `
                <div class="top-products-empty">
                    No sales yet.
                </div>
            `;

            return;
        }

        container.innerHTML =
            products.map(
                ([name, quantity], index) => `

                    <div class="top-product-item">

                        <div class="top-product-rank">
                            ${index + 1}
                        </div>

                        <div class="top-product-info">

                            <strong>
                                ${escapeHTML(name)}
                            </strong>

                            <span>
                                ${quantity} units sold
                            </span>

                        </div>

                    </div>

                `
            ).join('');

    }  catch (error) {

    console.error(
        'FreshCart: Failed to load top products:',
        error
    );

    console.error(
        'Supabase error message:',
        error?.message
    );

    console.error(
        'Supabase error details:',
        error?.details
    );

    container.innerHTML = `
        <div class="top-products-empty">
            Unable to load product sales.
            <br>
            <small>${escapeHTML(error?.message || 'Unknown error')}</small>
        </div>
    `;
   }
}

// =====================================================
// RENDER ORDERS
// =====================================================

function renderOrders(orders) {

    const tableBody =
        document.querySelector('#ordersTableBody');


    if (!orders || orders.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    No orders found.
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML =
        orders.map(order => {

            const date =
                new Date(
                    order.created_at
                ).toLocaleString('en-IN');


            return `
                <tr
                    class="order-row"
                    data-order-id="${order.id}"
                    title="Click to view order details"
                >

                    <td>
                        <strong>
                            #${order.id}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            order.customer_name
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            order.customer_phone
                        )}
                    </td>

                    <td>
                        <strong>
                            ${formatPrice(
                                order.total_amount
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            order.payment_method
                        )}
                    </td>

                    <td>
                        <span class="status">
                            ${escapeHTML(
                                order.order_status
                            )}
                        </span>
                    </td>

                    <td>
                        ${date}
                    </td>

                </tr>
            `;

        }).join('');
}


// =====================================================
// ORDER ROW CLICK
// =====================================================

document.addEventListener('click', event => {
    const row = event.target.closest('.order-row');

    if (!row) return;

    const orderId = Number(row.dataset.orderId);

    if (!orderId) return;

    openOrderDetails(orderId);
});


// UPDATE ORDER STATUS
document.addEventListener('click', event => {
    const button = event.target.closest('#updateOrderStatus');

    if (!button) return;

    const orderId = Number(button.dataset.orderId);

    const select = document.querySelector('#orderStatusSelect');

    if (!orderId || !select) return;

    updateOrderStatus(
        orderId,
        select.value
    );
});


// =====================================================
// OPEN ORDER DETAILS
// =====================================================

async function openOrderDetails(orderId) {

    createOrderModal();

    const modal =
        document.querySelector('#orderDetailsModal');

    const content =
        document.querySelector('#orderDetailsContent');

    modal.classList.add('active');

    content.innerHTML = `
        <div class="order-details-loading">
            Loading order details...
        </div>
    `;


    try {

        // Get order

        const {
            data: order,
            error: orderError
        } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();


        if (orderError) {
            throw orderError;
        }


        // Get order items

        const {
            data: items,
            error: itemsError
        } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderId)
            .order('id');


        if (itemsError) {
            throw itemsError;
        }


        renderOrderDetails(
            order,
            items || []
        );


    } catch (error) {

        console.error(
            'FreshCart: Order details error:',
            error
        );

        content.innerHTML = `
            <div class="order-details-error">
                <h3>Unable to load order</h3>
                <p>
                    ${escapeHTML(
                        error.message ||
                        'Something went wrong.'
                    )}
                </p>
            </div>
        `;
    }
}


// =====================================================
// CREATE ORDER DETAILS MODAL
// =====================================================

function createOrderModal() {

    if (
        document.querySelector(
            '#orderDetailsModal'
        )
    ) {
        return;
    }


    const modal =
        document.createElement('div');

    modal.id =
        'orderDetailsModal';

    modal.className =
        'order-details-modal';


    modal.innerHTML = `
        <div class="order-details-overlay"></div>

        <div class="order-details-container">

            <div class="order-details-header">

                <div>
                    <h2>Order Details</h2>
                    <p>
                        Complete order information
                    </p>
                </div>

                <button
                    type="button"
                    class="order-details-close"
                    aria-label="Close"
                >
                    ×
                </button>

            </div>


            <div
                id="orderDetailsContent"
                class="order-details-content"
            ></div>

        </div>
    `;


    document.body.appendChild(modal);


    modal
        .querySelector(
            '.order-details-close'
        )
        .addEventListener(
            'click',
            closeOrderDetails
        );


    modal
        .querySelector(
            '.order-details-overlay'
        )
        .addEventListener(
            'click',
            closeOrderDetails
        );
}


// =====================================================
// RENDER ORDER DETAILS
// =====================================================

function renderOrderDetails(
    order,
    items
) {

    const content =
        document.querySelector(
            '#orderDetailsContent'
        );


    const orderDate =
        new Date(
            order.created_at
        ).toLocaleString('en-IN');


    const paymentMethod =
        formatPaymentMethod(
            order.payment_method
        );


    const paymentStatus =
        formatPaymentStatus(
            order.payment_status
        );


    const itemsHTML =
        items.length === 0

            ? `
                <div class="no-order-items">
                    No products found for this order.
                </div>
            `

            : items.map(item => {

                const itemTotal =
                    Number(
                        item.total_price || 0
                    );


                return `
                    <div class="order-product">

                        <div class="order-product-info">

                            <strong>
                                ${escapeHTML(
                                    item.product_name
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    item.variant_name
                                )}
                                ×
                                ${Number(
                                    item.quantity
                                )}
                            </span>

                        </div>

                        <strong>
                            ${formatPrice(
                                itemTotal
                            )}
                        </strong>

                    </div>
                `;

            }).join('');


    content.innerHTML = `

        <!-- ORDER ID -->

        <div class="order-detail-top">

            <div>

                <span>Order ID</span>

                <strong>
                    #${order.id}
                </strong>

            </div>

            <div>

                <span>Order Date</span>

                <strong>
                    ${orderDate}
                </strong>

            </div>

        </div>


        <!-- CUSTOMER -->

        <div class="detail-card">

            <h3>Customer Information</h3>

            <div class="detail-grid">

                <div>
                    <span>Name</span>
                    <strong>
                        ${escapeHTML(
                            order.customer_name
                        )}
                    </strong>
                </div>

                <div>
                    <span>Phone</span>
                    <strong>
                        ${escapeHTML(
                            order.customer_phone
                        )}
                    </strong>
                </div>

                <div>
                    <span>Email</span>
                    <strong>
                        ${
                            order.customer_email
                                ? escapeHTML(
                                    order.customer_email
                                  )
                                : 'Not provided'
                        }
                    </strong>
                </div>

            </div>

        </div>


        <!-- ADDRESS -->

        <div class="detail-card">

            <h3>Delivery Address</h3>

            <div class="address-box">

                ${escapeHTML(
                    order.address
                )}

                <br>

                ${escapeHTML(
                    order.city
                )}

                -

                ${escapeHTML(
                    order.pincode
                )}

            </div>

        </div>


        <!-- PRODUCTS -->

        <div class="detail-card">

            <h3>Ordered Products</h3>

            <div class="order-products">

                ${itemsHTML}

            </div>

        </div>


        <!-- PAYMENT -->

        <div class="detail-card">

            <h3>Payment Information</h3>

            <div class="detail-grid">

                <div>
                    <span>Payment Method</span>
                    <strong>
                        ${paymentMethod}
                    </strong>
                </div>

                <div>
                    <span>Payment Status</span>
                    <strong>
                        ${paymentStatus}
                    </strong>
                </div>

               <div class="order-status-control">

    <span>Order Status</span>

    <select
        id="orderStatusSelect"
        data-order-id="${order.id}"
    >
        <option value="placed"
            ${order.order_status === 'placed' ? 'selected' : ''}>
            Placed
        </option>

        <option value="confirmed"
            ${order.order_status === 'confirmed' ? 'selected' : ''}>
            Confirmed
        </option>

        <option value="packed"
            ${order.order_status === 'packed' ? 'selected' : ''}>
            Packed
        </option>

        <option value="out_for_delivery"
            ${order.order_status === 'out_for_delivery' ? 'selected' : ''}>
            Out for Delivery
        </option>

        <option value="delivered"
            ${order.order_status === 'delivered' ? 'selected' : ''}>
            Delivered
        </option>

        <option value="cancelled"
            ${order.order_status === 'cancelled' ? 'selected' : ''}>
            Cancelled
        </option>

    </select>

    <button
        type="button"
        id="updateOrderStatus"
        data-order-id="${order.id}"
    >
        Update Status
    </button>

</div>

            </div>

        </div>


        <!-- SUMMARY -->

        <div class="order-summary">

            <div>
                <span>Subtotal</span>
                <strong>
                    ${formatPrice(
                        order.subtotal
                    )}
                </strong>
            </div>

            <div>
                <span>Delivery</span>
                <strong>
                    ${
                        Number(
                            order.delivery_charge
                        ) === 0

                        ? 'FREE'

                        : formatPrice(
                            order.delivery_charge
                          )
                    }
                </strong>
            </div>

            <div class="order-total">

                <span>Total</span>

                <strong>
                    ${formatPrice(
                        order.total_amount
                    )}
                </strong>

            </div>

        </div>

    `;
}


// =====================================================
// CLOSE ORDER DETAILS
// =====================================================

function closeOrderDetails() {

    const modal =
        document.querySelector(
            '#orderDetailsModal'
        );

    if (!modal) return;

    modal.classList.remove('active');
}

// =====================================================
// UPDATE ORDER STATUS
// =====================================================

async function updateOrderStatus(orderId, newStatus) {

    const button =
        document.querySelector('#updateOrderStatus');

    if (!button) return;

    button.disabled = true;
    button.textContent = 'Updating...';

    try {

        const { error } =
            await supabase
                .from('orders')
                .update({
                    order_status: newStatus
                })
                .eq('id', orderId);

        if (error) {
            throw error;
        }

        button.textContent = 'Updated ✓';

        // Refresh the main order table
        await loadOrders();

        setTimeout(() => {
            button.textContent = 'Update Status';
            button.disabled = false;
        }, 1200);

    } catch (error) {

        console.error(
            'FreshCart: Status update failed:',
            error
        );

        alert(
            error.message ||
            'Unable to update order status.'
        );

        button.disabled = false;
        button.textContent = 'Update Status';
    }
}

// =====================================================
// HELPERS
// =====================================================

function formatPrice(price) {

    return `₹${Number(
        price || 0
    ).toLocaleString('en-IN')}`;

}


function formatPaymentMethod(method) {

    if (method === 'cod') {
        return 'Cash on Delivery';
    }

    if (method === 'demo_online') {
        return 'Demo Online Payment';
    }

    return method || 'Unknown';
}


function formatPaymentStatus(status) {

    if (status === 'paid') {
        return 'Paid';
    }

    if (status === 'pending') {
        return 'Pending';
    }

    return status || 'Unknown';
}


function escapeHTML(value) {

    const div =
        document.createElement('div');

    div.textContent =
        value ?? '';

    return div.innerHTML;

}

async function loadAdminProducts() {
    const container =
        document.getElementById('productsManagementList');

    if (!container) return;

    try {
        const { data, error } = await supabase
            .from('products')
            .select(`
                id,
                name,
                origin,
                image_url,
                is_active,
                product_variants (
                    id,
                    variant_name,
                    price
                )
            `)
            .order('id');

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            container.innerHTML = `
                <div class="products-loading">
                    No products found.
                </div>
            `;
            return;
        }

        container.innerHTML = data.map(product => {

            const variants =
                product.product_variants || [];

            const variantText = variants.length
                ? variants.map(variant =>
                    `${escapeHTML(variant.variant_name)} - ₹${Number(variant.price).toLocaleString('en-IN')}`
                  ).join(', ')
                : 'No variants';

            return `
                <div class="admin-product-card">

                    <div class="admin-product-image">
                        ${
                            product.image_url
                                ? `<img
                                    src="${escapeHTML(product.image_url)}"
                                    alt="${escapeHTML(product.name)}"
                                  >`
                                : '🥬'
                        }
                    </div>

                    <div class="admin-product-info">

                        <h3>
                            ${escapeHTML(product.name)}
                        </h3>

                        <p>
                            ${escapeHTML(product.origin || 'FreshCart')}
                        </p>

                        <div class="admin-product-variants">
                            ${variantText}
                        </div>

                        <span class="product-active-status ${
                            product.is_active
                                ? 'active'
                                : 'inactive'
                        }">
                            ${
                                product.is_active
                                    ? 'Active'
                                    : 'Inactive'
                            }
                        </span>

                    </div>

                    <div class="admin-product-actions">

                        <button
                            class="edit-product-button"
                            data-product-id="${product.id}"
                        >
                            Edit
                        </button>

                        <button
                            class="toggle-product-button"
                            data-product-id="${product.id}"
                        >
                            ${
                                product.is_active
                                    ? 'Deactivate'
                                    : 'Activate'
                            }
                        </button>

                    </div>

                </div>
            `;

        }).join('');

    } catch (error) {

        console.error(
            'FreshCart: Failed to load admin products:',
            error
        );

        container.innerHTML = `
            <div class="products-loading">
                Unable to load products.
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
// =====================================================
// REFRESH
// =====================================================

document
    .querySelector('#refreshOrders')
    .addEventListener(
        'click',
        loadOrders
    );




document.addEventListener('click', async (event) => {

    const logoutButton =
        event.target.closest('#adminLogoutButton');

    if (!logoutButton) {
        return;
    }

    console.log('FreshCart: Logout button clicked');

    logoutButton.disabled = true;
    logoutButton.textContent = 'Logging out...';

    await logoutAdmin();

});





// =====================================================
// INITIAL LOAD
// =====================================================

loadOrders();


document.addEventListener('click', async (event) => {

    const logoutButton =
        event.target.closest('#adminLogoutButton');

    if (!logoutButton) {
        return;
    }

    console.log('FreshCart: Logout button clicked');

    logoutButton.disabled = true;
    logoutButton.textContent = 'Logging out...';

    const success = await logoutAdmin();

    if (!success) {
        logoutButton.disabled = false;
        logoutButton.textContent = 'Logout';
    }

});
