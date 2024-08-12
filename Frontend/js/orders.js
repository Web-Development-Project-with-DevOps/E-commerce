document.addEventListener('DOMContentLoaded', () => {
    const orderList = document.getElementById('orders-list');
    const userId = getCookie('user_id'); // Obtain userId from cookies

    if (!userId) {
        alert('You need to log in to view your orders.');
        window.location.href = '/static/login.html'; // Updated path
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
        window.location.href = '/static/index.html'; // Updated path
    });

    async function fetchOrders() {
        try {
            const response = await fetch(`/orders`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include' // Ensure cookies are sent with request
            });
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const orders = await response.json();
            displayOrders(orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            alert('There was an issue fetching your orders. Please try again later.');
        }
    }

    function displayOrders(orders) {
        orderList.innerHTML = '';
        if (orders.length === 0) {
            orderList.innerHTML = '<p>No orders found.</p>';
            return;
        }

        orders.forEach(order => {
            const orderItem = document.createElement('a');
            orderItem.classList.add('list-group-item', 'list-group-item-action');
            orderItem.href = '#';
            orderItem.innerHTML = `
                <h5>Order #${order._id}</h5>
                <p>Total Amount: $${order.total_amount.toFixed(2)}</p>
                <p>Status: ${order.status}</p>
                <button class="btn btn-primary view-order" data-id="${order._id}">View Details</button>
            `;
            orderList.appendChild(orderItem);
        });

        attachEventListeners();
    }

    function attachEventListeners() {
        const viewOrderButtons = document.querySelectorAll('.view-order');
        viewOrderButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const orderId = event.target.dataset.id;
                try {
                    const response = await fetch(`/orders/${orderId}`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include' // Ensure cookies are sent with request
                    });
                    if (!response.ok) {
                        throw new Error('Failed to fetch order details');
                    }
                    const order = await response.json();
                    alert(JSON.stringify(order, null, 2)); // Display order details
                } catch (error) {
                    console.error('Error fetching order details:', error);
                    alert('There was an issue fetching the order details. Please try again later.');
                }
            });
        });
    }

    fetchOrders(); // Load orders when page loads
});

// Helper function to get a cookie value
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
