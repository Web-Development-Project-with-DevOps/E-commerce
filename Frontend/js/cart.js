// js/cart.js

document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');

    async function fetchCart() {
        try {
            const response = await fetch(`/cart`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const cart = await response.json();
            console.log('Fetched cart:', cart); // Debug: Check the fetched cart
            displayCart(cart);
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    }

    function displayCart(cart) {
        cartItemsContainer.innerHTML = '';
        const items = cart.items || [];
        let total = 0;

        items.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('card', 'mb-3');
            cartItem.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">Product ID: ${item.product_id}</h5>
                    <p class="card-text">Quantity: ${item.quantity}</p>
                    <p class="card-text">Price: $${item.price.toFixed(2)}</p>
                    <button class="btn btn-danger remove-item" data-id="${item.product_id}">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
            total += item.quantity * item.price;
        });

        totalPriceElement.textContent = total.toFixed(2);

        attachEventListeners();
    }

    function attachEventListeners() {
        const removeButtons = document.querySelectorAll('.remove-item');
        removeButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const productId = event.target.dataset.id;
                try {
                    await fetch(`/cart/remove`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ product_id: productId, quantity: 0, price: 0 })
                    });
                    fetchCart();
                } catch (error) {
                    console.error('Error removing item from cart:', error);
                }
            });
        });
    }

    fetchCart();
});
