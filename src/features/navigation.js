// ===== NAVIGATION =====

export function initializeNavigation() {

    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    // Make sure elements exist
    if (!navToggle || !navLinks) {
        console.error('Navigation elements not found');
        return;
    }

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });

    // Close mobile menu after clicking a link
    navLinks.querySelectorAll('a').forEach(link => {

        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
        });

    });

}