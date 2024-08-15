document.addEventListener("DOMContentLoaded", () => {
    const cartItemsDiv = document.getElementById("cart-items");
    const grandTotalSpan = document.getElementById("grand-total");
    const checkoutButton = document.getElementById('checkout-button');

    // Function to get a specific cookie by name
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // Retrieve user_id from cookie
    const userId = getCookie('user_id');

    if (!userId) {
        console.error('User ID not found in cookies.');
        return;
    }

    // Fetch cart data from backend
    fetch(`/cart?user_id=${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                let grandTotal = 0;
                cartItemsDiv.innerHTML = ''; // Clear previous content
                data.items.forEach(item => {
                    grandTotal += item.subtotal;
                    cartItemsDiv.innerHTML += `
                        <div class="cart-item" data-product-name="${item.product_name}" data-price="${item.price}">
                            <p>${item.product_name}</p>
                            <p>$${item.price.toFixed(2)}</p>
                            <div class="item-quantity-container">
                                <button class="quantity-btn decrease-quantity">-</button>
                                <input type="number" value="${item.quantity}" min="1" class="item-quantity">
                                <button class="quantity-btn increase-quantity">+</button>
                            </div>
                            <p>Subtotal: $<span class="item-subtotal">${item.subtotal.toFixed(2)}</span></p>
                            <button class="remove-item">Remove</button>
                        </div>
                    `;
                });
                grandTotalSpan.textContent = grandTotal.toFixed(2);
            } else {
                cartItemsDiv.innerHTML = "<p>Your cart is empty.</p>";
            }
        })
        .catch(error => console.error("Error fetching cart data:", error));

    // Handle quantity adjustments and removal
    cartItemsDiv.addEventListener("click", (event) => {
        const target = event.target;
        const cartItemDiv = target.closest(".cart-item");

        if (target.classList.contains("increase-quantity") || target.classList.contains("decrease-quantity")) {
            const productName = cartItemDiv.dataset.productName;
            const quantityInput = cartItemDiv.querySelector(".item-quantity");
            let quantity = parseInt(quantityInput.value);
            const price = parseFloat(cartItemDiv.dataset.price);

            if (target.classList.contains("increase-quantity")) {
                quantity++;
            } else if (target.classList.contains("decrease-quantity")) {
                quantity = Math.max(1, quantity - 1); // Ensure quantity is at least 1
            }

            const newSubtotal = price * quantity;

            fetch(`/cart/update?user_id=${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ product_name: productName, quantity, price, subtotal: newSubtotal })
            })
                .then(response => response.json())
                .then(data => {
                    quantityInput.value = quantity;
                    cartItemDiv.querySelector(".item-subtotal").textContent = newSubtotal.toFixed(2);
                    grandTotalSpan.textContent = data.grand_total.toFixed(2);
                })
                .catch(error => console.error("Error updating cart item:", error));
        } else if (target.classList.contains("remove-item")) {
            const productName = cartItemDiv.dataset.productName;
            const price = parseFloat(cartItemDiv.dataset.price);
            const subtotal = parseFloat(cartItemDiv.querySelector(".item-subtotal").textContent.slice(1));

            fetch(`/cart/remove?user_id=${userId}&product_name=${encodeURIComponent(productName)}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(data => {
                    cartItemDiv.remove();
                    grandTotalSpan.textContent = data.grand_total.toFixed(2);
                    if (data.grand_total === 0) {
                        cartItemsDiv.innerHTML = "<p>Your cart is empty.</p>";
                    }
                })
                .catch(error => console.error("Error removing cart item:", error));
        }
    });

    // Redirect to checkout page on checkout button click
    checkoutButton.addEventListener('click', () => {
        window.location.href = 'checkout.html';
    });
});
