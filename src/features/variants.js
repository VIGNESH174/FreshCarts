// =====================================================
// PRODUCT VARIANTS & PRICING
// =====================================================


// =====================================================
// INITIALIZE VARIANTS
// =====================================================

export function initializeVariants() {

    document
        .querySelectorAll('.product-card')
        .forEach(card => {

            setupProductCard(card);

        });

}


// =====================================================
// SETUP INDIVIDUAL PRODUCT CARD
// =====================================================

function setupProductCard(card) {

    const priceElement =
        card.querySelector('.product-price');

    const weightButtons =
        card.querySelectorAll('.weight-pill');


    if (
        !priceElement ||
        weightButtons.length === 0
    ) {

        return;

    }


    // -------------------------------------------------
    // Initial price
    // -------------------------------------------------

    updatePrice(
        card,
        weightButtons[0]
    );


    // -------------------------------------------------
    // Variant buttons
    // -------------------------------------------------

    weightButtons.forEach(button => {

        // Prevent duplicate listeners
        if (
            button.dataset.variantInitialized === 'true'
        ) {

            return;

        }


        button.dataset.variantInitialized = 'true';


        button.addEventListener('click', () => {

            // Remove active state
            weightButtons.forEach(item => {

                item.classList.remove('active');

            });


            // Activate selected variant
            button.classList.add('active');


            // Update price
            updatePrice(
                card,
                button
            );


            // Notify cart
           document.dispatchEvent(
    new CustomEvent(
        'freshcart:variantChanged',
        {
            detail: {
                card: card
            }
        }
    )
);

        });

    });

}


// =====================================================
// UPDATE PRICE
// =====================================================

function updatePrice(
    card,
    selectedButton
) {

    const priceElement =
        card.querySelector('.product-price');


    if (!priceElement) {
        return;
    }


    // The product loader stores variant prices
    // directly on the buttons.

    const price =
        selectedButton.dataset.price;


    if (
        price === undefined ||
        price === null
    ) {

        console.warn(
            'FreshCart: Variant price missing'
        );

        return;

    }


    priceElement.textContent =
        formatPrice(
            Number(price)
        );

}


// =====================================================
// FORMAT PRICE
// =====================================================

function formatPrice(price) {

    return `₹${Number(price).toLocaleString('en-IN')}`;

}