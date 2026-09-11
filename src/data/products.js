// =====================================================
// FRESHCART PRODUCT CATALOG
// =====================================================

export const productCatalog = [

    // =========================
    // FRUITS
    // =========================

    {
        id: 'apple',
        name: 'Shimla Royal Apple',
        origin: 'Himachal Origin',
        image: 'https://images.pexels.com/photos/3746517/pexels-photo-3746517.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        section: 'fruits',

        variants: [
            { name: '500g', price: 90 },
            { name: '1 kg', price: 170 },
            { name: '2 kg', price: 320 }
        ]
    },


    {
        id: 'banana',
        name: 'Robusta Banana',
        origin: 'Tamil Nadu Direct',
        image: 'https://images.pexels.com/photos/47305/bananas-banana-shrub-fruits-yellow-47305.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        section: 'fruits',

        variants: [
            { name: '6 pcs', price: 35 },
            { name: '1 dz', price: 65 },
            { name: '2 dz', price: 120 }
        ]
    },


    {
        id: 'orange',
        name: 'Nagpur Sweet Orange (Santra)',
        origin: 'Nagpur Direct',
        image: 'https://images.pexels.com/photos/37543950/pexels-photo-37543950.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        section: 'fruits',

        variants: [
            { name: '500g', price: 65 },
            { name: '1 kg', price: 120 },
            { name: '2 kg', price: 220 }
        ]
    },


    {
        id: 'mango',
        name: 'Alphonso Mango (Hapus)',
        origin: 'Ratnagiri Orchard',
        image: 'https://images.pexels.com/photos/38802739/pexels-photo-38802739.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        section: 'fruits',

        variants: [
            { name: '1 Box', price: 450 },
            { name: '2 Boxes', price: 850 }
        ]
    },


    {
        id: 'grapes',
        name: 'Seedless Black Grapes',
        origin: 'Nashik Vineyard',
        image: 'https://images.pexels.com/photos/30542312/pexels-photo-30542312.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        section: 'fruits',

        variants: [
            { name: '500g', price: 140 },
            { name: '1 kg', price: 260 }
        ]
    },


    {
        id: 'watermelon',
        name: 'Hybrid Sweet Watermelon',
        origin: 'Local Farm',
        image: 'https://images.pexels.com/photos/8743922/pexels-photo-8743922.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        section: 'fruits',

        variants: [
            { name: '1 pc (~2.5kg)', price: 90 },
            { name: '2 pcs', price: 170 }
        ]
    },


    // =========================
    // VEGETABLES
    // =========================

    {
        id: 'tomato',
        name: 'Farm Fresh Red Tomato',
        origin: 'Karnataka Direct',
        image: 'https://images.pexels.com/photos/18254763/pexels-photo-18254763.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        section: 'vegetables',

        variants: [
            { name: '500g', price: 22 },
            { name: '1 kg', price: 40 },
            { name: '2 kg', price: 75 }
        ]
    },


    {
        id: 'potato',
        name: 'Pahadi Gold Potato (Aloo)',
        origin: 'Himachal Grown',
        image: 'https://images.pexels.com/photos/38742086/pexels-photo-38742086.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        section: 'vegetables',

        variants: [
            { name: '1 kg', price: 35 },
            { name: '2 kg', price: 65 },
            { name: '5 kg', price: 150 }
        ]
    },


    {
        id: 'onion',
        name: 'Nashik Red Onion (Pyaaz)',
        origin: 'Nashik Direct',
        image: 'https://images.pexels.com/photos/10159434/pexels-photo-10159434.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        section: 'vegetables',

        variants: [
            { name: '1 kg', price: 45 },
            { name: '2 kg', price: 85 },
            { name: '5 kg', price: 200 }
        ]
    },


    {
        id: 'carrot',
        name: 'Tender Ooty Carrot',
        origin: 'Ooty Hills',
        image: 'https://images.pexels.com/photos/38802742/pexels-photo-38802742.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        section: 'vegetables',

        variants: [
            { name: '500g', price: 32 },
            { name: '1 kg', price: 60 },
            { name: '2 kg', price: 110 }
        ]
    },


    {
        id: 'broccoli',
        name: 'Crisp Green Broccoli',
        origin: 'Hydroponic Green',
        image: 'https://images.pexels.com/photos/13133609/pexels-photo-13133609.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        section: 'vegetables',

        variants: [
            { name: '1 pc (400g)', price: 80 },
            { name: '2 pcs', price: 150 }
        ]
    },


    {
        id: 'spinach',
        name: 'Farm Crisp Spinach (Palak)',
        origin: 'Daily Harvest',
        image: 'https://images.pexels.com/photos/6083893/pexels-photo-6083893.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        section: 'vegetables',

        variants: [
            { name: '1 bunch', price: 30 },
            { name: '2 bunches', price: 55 }
        ]
    },


    // =========================
    // BUNDLES
    // =========================

    {
        id: 'family-fruit-combo',
        name: 'Daily Family Fruit Combo',
        origin: '5 Fruit Basket',
        image: 'https://images.pexels.com/photos/30542312/pexels-photo-30542312.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        section: 'bundles',

        variants: [
            { name: '1 Bundle', price: 399 }
        ]
    },


    {
        id: 'sabzi-essentials',
        name: 'Weekly Sabzi Essentials',
        origin: 'Kitchen Base',
        image: 'https://images.pexels.com/photos/39105767/pexels-photo-39105767.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        section: 'bundles',

        variants: [
            { name: '1 Bundle', price: 279 }
        ]
    },


    {
        id: 'detox-greens',
        name: 'Healthy Detox Greens Bundle',
        origin: 'Immunity Pack',
        image: 'https://images.pexels.com/photos/6083893/pexels-photo-6083893.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        section: 'bundles',

        variants: [
            { name: '1 Bundle', price: 449 }
        ]
    }

];