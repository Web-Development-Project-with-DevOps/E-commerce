document.addEventListener('DOMContentLoaded', function() {
    // Retrieve user ID from cookies
    const userId = getCookie('user_id');

    if (!userId) {
        alert('You need to log in to access the cart.');
        window.location.href = '/static/login.html'; // Updated path for login
        return;
    }

    // Update the navigation bar based on user login status
    const loginItem = document.querySelector('.login-item');
    const registerItem = document.querySelector('.register-item');
    const logoutItem = document.querySelector('.logout-item');

    if (userId) {
        loginItem.style.display = 'none';
        registerItem.style.display = 'none';
        logoutItem.style.display = 'block';
    }

    document.getElementById('logout').addEventListener('click', () => {
        // Remove user ID cookie on logout
        document.cookie = 'user_id=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        window.location.href = '/static/index.html'; // Updated path for index
    });

    // Fetch and display cart items
    function loadCart() {
        fetch(`/cart`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include' // Ensure cookies are sent with request
        })
        .then(response => response.json())
        .then(data => {
            const cartItemsContainer = document.getElementById('cart-items');
            const totalPriceElement = document.getElementById('total-price');
            let total = 0;
            cartItemsContainer.innerHTML = ''; // Clear previous items
            data.items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.textContent = `Product ID: ${item.product_id}, Quantity: ${item.quantity}, Price: $${item.price}`;
                cartItemsContainer.appendChild(itemElement);
                total += item.quantity * item.price;
            });
            totalPriceElement.textContent = total.toFixed(2);
            document.getElementById('cart-count').textContent = data.items.length;
        })
        .catch(error => console.error('Failed to load cart:', error));
    }

    // Checkout functionality
    document.getElementById('checkout').addEventListener('click', function() {
        const userAddress = {
            city: prompt('Enter your city:'),
            country: prompt('Enter your country:'),
            zip_code: prompt('Enter your ZIP code:')
        };

        fetch(`/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Ensure cookies are sent with request
            body: JSON.stringify({ user_address: userAddress })
        })
        .then(response => response.json())
        .then(data => {
            alert('Order created successfully! Order ID: ' + data._id);
            window.location.href = '/static/orders.html'; // Updated path for orders
        })
        .catch(error => {
            alert('Failed to create order: ' + error.message);
        });
    });

    loadCart(); // Load cart items when page loads
});

// Helper function to get a cookie value
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
