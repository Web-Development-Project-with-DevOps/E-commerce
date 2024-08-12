// document.addEventListener('DOMContentLoaded', () => {
//     const productsContainer = document.getElementById('products-container');
//     const productModal = document.getElementById('product-modal');
//     const modalDescription = document.getElementById('modal-description');
//     const modalImg = document.getElementById('modal-img');
//     const modalPrice = document.getElementById('modal-price');
//     const addToCartBtn = document.querySelector('.add-to-cart');
//     const searchBar = document.getElementById('search-bar');
//     const cartCount = document.getElementById('cart-count');

//     // Check if user is logged in by checking for user_id in cookies
//     const userId = getCookie('user_id');

//     if (userId) {
//         // User is logged in
//         document.querySelector(".login").style.display = "none";
//         document.querySelector(".register").style.display = "none";
//         document.querySelector(".orders").style.display = "block";
//         document.querySelector(".logout").style.display = "block";
//     } else {
//         // User is not logged in
//         document.querySelector(".login").style.display = "block";
//         document.querySelector(".register").style.display = "block";
//         document.querySelector(".orders").style.display = "none";
//         document.querySelector(".logout").style.display = "none";
//     }

//     // Logout functionality
//     document.getElementById("logout").addEventListener("click", () => {
//         // Clear user_id cookie
//         document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
//         window.location.href = "/static/login.html";
//     });

//     async function fetchProducts() {
//         try {
//             const response = await fetch('http://127.0.0.1:8000/products');
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             const products = await response.json();
//             console.log('Fetched products:', products); // Debug: Check the fetched products
//             displayProducts(products);
//         } catch (error) {
//             console.error('Error fetching products:', error);
//         }
//     }

//     function displayProducts(products) {
//         productsContainer.innerHTML = '';
//         if (!Array.isArray(products)) {
//             console.error('Expected products to be an array but got:', products);
//             return;
//         }

//         products.forEach(product => {
//             const productCard = document.createElement('div');
//             productCard.classList.add('col-md-4', 'mb-4');
//             productCard.innerHTML = `
//                 <div class="card product-card" data-id="${product._id}">
//                     <img src="/static/assets/images/product-placeholder.jpg" class="card-img-top" alt="${product.description || ''}">
//                     <div class="card-body">
//                         <h5 class="card-title">${product.name}</h5>
//                         <p class="card-text">$${product.price.toFixed(2)}</p>
//                         <button class="btn btn-primary view-details">Details</button>
//                     </div>
//                 </div>
//             `;
//             productsContainer.appendChild(productCard);
//         });
//         attachEventListeners();
//     }

//     function attachEventListeners() {
//         const viewDetailsButtons = document.querySelectorAll('.view-details');
//         viewDetailsButtons.forEach(button => {
//             button.addEventListener('click', async (event) => {
//                 const productId = event.target.closest('.product-card').dataset.id;
//                 try {
//                     const response = await fetch(`http://127.0.0.1:8000/products/${productId}`);
//                     if (!response.ok) {
//                         throw new Error('Network response was not ok');
//                     }
//                     const product = await response.json();
//                     showModal(product);
//                 } catch (error) {
//                     console.error('Error fetching product details:', error);
//                 }
//             });
//         });

//         addToCartBtn.addEventListener('click', async () => {
//             const productId = productModal.dataset.id;
//             const quantity = 1; // Default quantity
//             try {
//                 await fetch(`http://127.0.0.1:8000/cart/add`, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json'
//                     },
//                     body: JSON.stringify({
//                         product_id: productId,
//                         quantity: quantity,
//                         price: parseFloat(modalPrice.textContent.slice(1))
//                     })
//                 });
//                 alert('Product added to cart!');
//                 updateCartCount();
//             } catch (error) {
//                 console.error('Error adding to cart:', error);
//             }
//         });
//     }

//     function showModal(product) {
//         modalDescription.textContent = product.name;
//         modalImg.src = '/static/assets/images/product-placeholder.jpg'; // Update with actual image if available
//         modalPrice.textContent = `$${product.price.toFixed(2)}`;
//         productModal.dataset.id = product._id;
//         $('#product-modal').modal('show'); // Use jQuery to show Bootstrap modal
//     }

//     searchBar.addEventListener('input', () => {
//         const query = searchBar.value.toLowerCase();
//         const productCards = document.querySelectorAll('.product-card');
//         productCards.forEach(card => {
//             const title = card.querySelector('.card-title').textContent.toLowerCase();
//             card.style.display = title.includes(query) ? 'block' : 'none';
//         });
//     });

//     async function updateCartCount() {
//         if (!userId) return; // Skip if no user ID
//         try {
//             const response = await fetch(`http://127.0.0.1:8000/cart/${userId}`);
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             const cart = await response.json();
//             cartCount.textContent = cart.items.length;
//         } catch (error) {
//             console.error('Error fetching cart count:', error);
//         }
//     }

//     fetchProducts();
//     if (userId) {
//         updateCartCount();
//     }
// });

// // Helper function to get a cookie value
// function getCookie(name) {
//     const value = `; ${document.cookie}`;
//     const parts = value.split(`; ${name}=`);
//     if (parts.length === 2) return parts.pop().split(';').shift();
// }


document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products-container');
    const productModal = document.getElementById('product-modal');
    const modalDescription = document.getElementById('modal-description');
    const modalImg = document.getElementById('modal-img');
    const modalName = document.getElementById('modal-name');
    const addToCartBtn = document.querySelector('.add-to-cart');
    const searchBar = document.getElementById('search-bar');
    const cartCount = document.getElementById('cart-count');

    // Function to get a cookie by name
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // Retrieve user ID from cookie
    const userId = getCookie('user_id');

    if (userId) {
        // User is logged in
        document.querySelector(".login").style.display = "none";
        document.querySelector(".register").style.display = "none";
        document.querySelector(".orders").style.display = "block";
        document.querySelector(".logout").style.display = "block";
    } else {
        // User is not logged in
        document.querySelector(".login").style.display = "block";
        document.querySelector(".register").style.display = "block";
        document.querySelector(".orders").style.display = "none";
        document.querySelector(".logout").style.display = "none";
    }

    // Logout functionality
    document.getElementById("logout").addEventListener("click", () => {
        // Remove user_id cookie
        document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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
                <div class="product-card">
                    <img src="${product.image || '/static/assets/images/product-placeholder.jpg'}" class="product-img" alt="${product.name}">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-quantity">Available: ${product.quantity}</div>
                    <button class="btn details-btn" data-toggle="modal" data-target="#product-modal" data-id="${product._id}">Details</button>
                </div>
            `;
            productsContainer.appendChild(productCard);
        });
        attachEventListeners();
    }

    function attachEventListeners() {
        const detailsButtons = document.querySelectorAll('.details-btn');
        detailsButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const productId = event.target.dataset.id;
                try {
                    const response = await fetch(`http://127.0.0.1:8000/products/${productId}`);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const product = await response.json();
                    showModal(product);
                } catch (error) {
                    console.error('Error fetching product details:', error);
                }
            });
        });

        addToCartBtn.addEventListener('click', async () => {
            const productId = productModal.dataset.id;
            const quantity = 1; // Default quantity
            try {
                await fetch(`http://127.0.0.1:8000/cart/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // No Authorization header, use cookies instead
                    },
                    body: JSON.stringify({
                        product_id: productId,
                        quantity: quantity
                    })
                });
                alert('Product added to cart!');
                updateCartCount();
            } catch (error) {
                console.error('Error adding to cart:', error);
            }
        });
    }

    function showModal(product) {
        modalName.textContent = product.name;
        modalDescription.textContent = product.description;
        modalImg.src = product.image || '/static/assets/images/product-placeholder.jpg';
        productModal.dataset.id = product._id;
        $('#product-modal').modal('show'); // Use jQuery to show Bootstrap modal
    }

    searchBar.addEventListener('input', () => {
        const query = searchBar.value.toLowerCase();
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const title = card.querySelector('.product-name').textContent.toLowerCase();
            card.style.display = title.includes(query) ? 'block' : 'none';
        });
    });

    async function updateCartCount() {
        if (!userId) return; // Skip if no user ID
        try {
            const response = await fetch(`http://127.0.0.1:8000/cart`, {
                headers: { 
                    // No Authorization header, use cookies instead
                }
            });
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
    if (userId) {
        updateCartCount();
    }
});
