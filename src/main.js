import './style.css';

import { initializeSearch } from './features/search.js';
import { initializeNavigation } from './features/navigation.js';
import { initializeCart } from './features/cart.js';
import { initializeVariants } from './features/variants.js';
import { loadProductsFromSupabase } from './services/productLoader.js';
import { initializeCheckout } from './features/checkout.js';


// =====================================================
// GOOGLE APPS SCRIPT
// =====================================================

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzBf-P_c2mtgBvmfkJ76PUfw8VJ_vSQKrXYdRk5GEvpelv7VaAK_0M5Qpg340lc1TOH/exec";




// =====================================================
// COUNTDOWN TIMER
// =====================================================

let totalSeconds = 4 * 3600 + 38 * 60 + 15;

function updateCountdown() {

  if (totalSeconds <= 0) {
    totalSeconds = 6 * 3600;
  }

  const hrs =
    Math.floor(totalSeconds / 3600);

  const min =
    Math.floor((totalSeconds % 3600) / 60);

  const sec =
    totalSeconds % 60;

  const hrsEl =
    document.getElementById('cdHrs');

  const minEl =
    document.getElementById('cdMin');

  const secEl =
    document.getElementById('cdSec');

  if (hrsEl) {
    hrsEl.textContent =
      String(hrs).padStart(2, '0');
  }

  if (minEl) {
    minEl.textContent =
      String(min).padStart(2, '0');
  }

  if (secEl) {
    secEl.textContent =
      String(sec).padStart(2, '0');
  }

  totalSeconds--;
}

updateCountdown();

setInterval(updateCountdown, 1000);


// =====================================================
// NEWSLETTER / FORM
// =====================================================

const form =
  document.getElementById('auditForm');

const formName =
  document.getElementById('formName');

const formEmail =
  document.getElementById('formEmail');

const formPhone =
  document.getElementById('formPhone');

const formSubmit =
  document.getElementById('formSubmit');

const formMessage =
  document.getElementById('formMessage');


function showFormMessage(type, text) {

  if (!formMessage) {
    return;
  }

  formMessage.className =
    'form-message ' + type;

  formMessage.textContent =
    text;

}


if (form) {

  form.addEventListener('submit', function (e) {

    e.preventDefault();

    const name =
      formName.value.trim();

    const email =
      formEmail.value.trim();

    const phone =
      formPhone.value.trim();


    let valid = true;


    // Name
    if (!name) {

      formName.classList.add('error');

      valid = false;

    } else {

      formName.classList.remove('error');

    }


    // Email
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !email ||
      !emailRegex.test(email)
    ) {

      formEmail.classList.add('error');

      valid = false;

    } else {

      formEmail.classList.remove('error');

    }


    // Phone
    const phoneDigits =
      phone.replace(/\D/g, '');

    const phoneValid =
      phoneDigits.length === 10 ||
      (
        phoneDigits.length === 12 &&
        phoneDigits.startsWith('91')
      );


    if (!phone || !phoneValid) {

      formPhone.classList.add('error');

      valid = false;

    } else {

      formPhone.classList.remove('error');

    }


    if (!valid) {
      return;
    }


    formSubmit.disabled = true;

    formSubmit.textContent =
      'Submitting...';


    formMessage.className = '';

    formMessage.textContent = '';


    const url =
      SCRIPT_URL +
      "?" +
      new URLSearchParams({
        name,
        email,
        phone
      });


    fetch(url, {
      method: "GET",
      mode: "no-cors"
    })
      .then(() => {

        showFormMessage(
          'success',
          'Thank you! Your details have been submitted successfully.'
        );

        form.reset();

        formSubmit.disabled = false;

        formSubmit.textContent =
          'Subscribe';

      })
      .catch(() => {

        showFormMessage(
          'error',
          'Something went wrong. Please try again.'
        );

        formSubmit.disabled = false;

        formSubmit.textContent =
          'Subscribe';

      });

  });

}


// =====================================================
// PAYMENT BUTTON
// =====================================================

const auditButton =
  document.getElementById('free-audit-btn');

if (auditButton) {

  auditButton.addEventListener(
    'click',
    function (e) {

      e.preventDefault();

      // Payment gateway will be connected later.

    }
  );

}





// =====================================================
// INITIALIZE APPLICATION
// =====================================================

initializeSearch();
initializeNavigation();
initializeCart();
initializeCheckout();

loadProductsFromSupabase()
    .then(() => {

        initializeVariants();

        document.dispatchEvent(
            new CustomEvent(
                'freshcart:productsLoaded'
            )
        );

    });