document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products-container');
    const productModal = document.getElementById('product-modal');
    const modalDescription = document.getElementById('modal-description');
    const modalImg = document.getElementById('modal-img');
    const modalName = document.getElementById('modal-name');
    const addToCartBtn = document.querySelector('.add-to-cart');
    const searchBar = document.getElementById('search-bar');
    const cartCount = document.getElementById('cart-count');

    function getCookie(name) {
        let cookieArr = document.cookie.split(";");
        for (let i = 0; i < cookieArr.length; i++) {
            let cookiePair = cookieArr[i].split("=");
            if (name == cookiePair[0].trim()) {
                return decodeURIComponent(cookiePair[1]);
            }
        }
        return null;
    }

    const userId = getCookie('user_id');

    if (userId) {
        document.querySelector(".login").style.display = "none";
        document.querySelector(".register").style.display = "none";
        document.querySelector(".orders").style.display = "block";
        document.querySelector(".logout").style.display = "block";
    } else {
        document.querySelector(".login").style.display = "block";
        document.querySelector(".register").style.display = "block";
        document.querySelector(".orders").style.display = "none";
        document.querySelector(".logout").style.display = "none";
        addToCartBtn.disabled = true;
        addToCartBtn.textContent = "Login to Add to Cart";
    }

    document.getElementById("logout").addEventListener("click", () => {
        document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        window.location.href = "/static/login.html";
    });

    async function fetchProducts() {
        try {
            const response = await fetch('http://127.0.0.1:8000/products');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    function displayProducts(products) {
        productsContainer.innerHTML = '';
        if (!Array.isArray(products)) {
            console.error('Expected products to be an array but got:', products);
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('col-md-4', 'mb-4');
            productCard.innerHTML = `
                <div class="product-card" data-name="${product.product_name}" data-price="${product.price}" data-description="${product.description}">
                    <img src="${product.image_url || '/static/assets/images/product-placeholder.jpg'}" class="product-img" alt="${product.product_name}">
                    <div class="product-name">${product.product_name}</div>
                    <div class="product-price">Rs.${product.price.toFixed(2)}</div>
                    <div class="product-quantity">Available: ${product.quantity}</div>
                    <button class="btn details-btn" data-toggle="modal" data-target="#product-modal" data-name="${product.product_name}" data-price="${product.price}" data-id="${product._id}">Details</button>
                </div>
            `;
            productsContainer.appendChild(productCard);
        });
        attachEventListeners();
    }

    function attachEventListeners() {
        const detailsButtons = document.querySelectorAll('.details-btn');
        detailsButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const productCard = event.target.closest('.product-card');
                showModal(productCard);
            });
        });

        if (userId) {
            addToCartBtn.addEventListener('click', () => {
                const productCard = document.querySelector('.product-card[data-name="' + modalName.textContent + '"]');
                const price = parseFloat(productCard.dataset.price);
                const quantity = 1; // Default quantity
                const subtotal = price * quantity; // Calculate subtotal

                // Debugging logs
                console.log('Product Name:', modalName.textContent);
                console.log('Price from Product Card:', price);

                // Call the add_to_cart endpoint
                fetch(`http://127.0.0.1:8000/cart/add?user_id=${userId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        product_name: modalName.textContent,
                        price: price,
                        quantity: quantity,
                        subtotal: subtotal
                    })
                })
                .then(response => {
                    if (response.ok) {
                        alert('Product added to cart!');
                        updateCartCount(); // Update the cart count only after adding to cart
                    } else {
                        console.error('Error adding to cart:', response.statusText);
                    }
                })
                .catch(error => {
                    console.error('Error adding to cart:', error);
                });
            });
        }
    }

    function showModal(productCard) {
        const productName = productCard.dataset.name;
        const productPrice = productCard.dataset.price;
        const productDescription = productCard.dataset.description; // Get product description
        modalName.textContent = productName;
        modalDescription.textContent = productDescription; // Set product description
        modalImg.src = productCard.querySelector('img').src;
        productModal.dataset.id = productCard.dataset.id;

        // Debugging log
        console.log('Showing Modal for Product:', { name: productName, price: productPrice, description: productDescription });

        $('#product-modal').modal('show'); // Use jQuery to show Bootstrap modal
    }

    async function updateCartCount() {
        try {
            const response = await fetch(`http://127.0.0.1:8000/cart?user_id=${userId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const cart = await response.json();
            cartCount.textContent = cart.items.length;
        } catch (error) {
            console.error('Error fetching cart count:', error);
        }
    }

    fetchProducts();
});
