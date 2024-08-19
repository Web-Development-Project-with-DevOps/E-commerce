document.addEventListener("DOMContentLoaded", () => {
    const cartItemsDiv = document.getElementById("cart-items");
    const grandTotalSpan = document.getElementById("grand-total");
    const checkoutButton = document.getElementById('checkout-button');

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

    if (!userId) {
        console.error('User ID not found in cookies.');
        return;
    }

    if (!cartItemsDiv || !grandTotalSpan || !checkoutButton) {
        console.error("One or more elements are not found in the DOM.");
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
                            <p>Rs.${item.price.toFixed(2)}</p>
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

        if (cartItemDiv) {
            const productName = cartItemDiv.dataset.productName;
            const quantityInput = cartItemDiv.querySelector(".item-quantity");
            const price = parseFloat(cartItemDiv.dataset.price);

            if (target.classList.contains("increase-quantity") || target.classList.contains("decrease-quantity")) {
                let quantity = parseInt(quantityInput.value);

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
        }
    });

    // Redirect to checkout page on checkout button click
    checkoutButton.addEventListener('click', () => {
        window.location.href = 'checkout.html';
    });
});
