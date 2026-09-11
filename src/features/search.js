import { productCatalog } from '../data/products.js';


// ===== SEARCH FUNCTIONALITY =====

export function initializeSearch() {

    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');


    // Safety check
    if (!searchInput || !searchBtn || !searchResults) {
        console.error('Search elements not found');
        return;
    }


    // ===== PERFORM SEARCH =====

    function performSearch() {

        const query = searchInput.value.trim().toLowerCase();


        // Empty search
        if (!query) {

            searchResults.classList.remove('visible');
            searchResults.innerHTML = '';

            return;
        }


        // Find matching products
        const matches = productCatalog.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.origin.toLowerCase().includes(query)
        );


        // No results
        if (matches.length === 0) {

            searchResults.innerHTML = `
                <div class="search-no-results">
                    No products found for "${escapeHtml(query)}".
                    Try searching for apple, tomato, banana, mango, broccoli, or spinach.
                </div>
            `;

        } else {

            // Results found
            searchResults.innerHTML =
                `
                <div class="search-results-title">
                    ${matches.length}
                    result${matches.length > 1 ? 's' : ''} found
                </div>
                `

                +

                matches.map(product =>

                    `
                    <div
                        class="search-result-item"
                        data-section="${product.section}"
                    >

                        <img
                            src="${product.img}"
                            alt="${escapeHtml(product.name)}"
                            loading="lazy"
                        >

                        <div class="info">

                            <div class="name">
                                ${escapeHtml(product.name)}
                            </div>

                            <div class="meta">
                                ${escapeHtml(product.origin)}
                                ·
                                ${product.price}
                            </div>

                        </div>

                    </div>
                    `

                ).join('');
        }


        searchResults.classList.add('visible');


        // Add click events to search results
        searchResults
            .querySelectorAll('.search-result-item')
            .forEach(item => {

                item.addEventListener('click', () => {

                    const sectionId = item.dataset.section;

                    const section = document.getElementById(sectionId);

                    if (section) {

                        section.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });

                    }

                });

            });
    }


    // ===== ESCAPE HTML =====

    function escapeHtml(str) {

        const div = document.createElement('div');

        div.textContent = str;

        return div.innerHTML;
    }


    // ===== SEARCH BUTTON =====

    searchBtn.addEventListener('click', performSearch);


    // ===== LIVE SEARCH =====

    searchInput.addEventListener('input', performSearch);


    // ===== ENTER KEY =====

    searchInput.addEventListener('keydown', function (event) {

        if (event.key === 'Enter') {

            event.preventDefault();

            performSearch();
        }

    });


    // ===== TRENDING TAGS =====

    document
        .querySelectorAll('.trending-tag')
        .forEach(tag => {

            tag.addEventListener('click', function (event) {

                event.preventDefault();

                searchInput.value = this.dataset.query;

                performSearch();

                searchInput.focus();

            });

        });

}