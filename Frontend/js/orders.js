document.addEventListener("DOMContentLoaded", () => {
    const userId = getCookie("user_id");  // Retrieve user_id from cookie

    if (!userId) {
        window.location.href = "/login.html";  // Redirect to login if not logged in
    } else {
        fetchOrders(userId);
    }
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
});

function fetchOrders(userId) {
    fetch(`/orders?user_id=${userId}`)
        .then(response => response.json())
        .then(data => {
            const ordersContainer = document.getElementById("orders-container");

            if (data.orders && data.orders.length > 0) {
                data.orders.forEach(order => {
                    const orderElement = document.createElement("div");
                    orderElement.className = "order-card card mb-3";
                    orderElement.innerHTML = `
                        <div class="card-body">
                            <h5 class="card-title">Order ID: ${order._id}</h5>
                            <p class="card-text"><strong>Date:</strong> ${new Date(order.created_on).toLocaleDateString()}</p>
                            <p class="card-text"><strong>Total Amount:</strong> $${order.total_amount.toFixed(2)}</p>
                            <p class="card-text"><strong>Status:</strong> ${order.status}</p>
                            <h6>Items:</h6>
                            <ul class="list-group">
                                ${order.items.map(item => `
                                    <li class="list-group-item">
                                        <strong>${item.product_id}</strong> - ${item.quantity} x $${item.price.toFixed(2)} = $${item.subtotal.toFixed(2)}
                                    </li>
                                `).join('')}
                            </ul>
                            ${order.status !== "Cancelled" ? `
                                <button class="btn btn-danger mt-3 cancel-order-btn" data-order-id="${order._id}">Cancel Order</button>
                            ` : `
                                <p class="text-danger mt-3">This order has been cancelled.</p>
                            `}
                        </div>
                    `;
                    ordersContainer.appendChild(orderElement);
                });

                // Attach event listeners to the cancel buttons
                document.querySelectorAll('.cancel-order-btn').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const orderId = event.target.getAttribute('data-order-id');
                        cancelOrder(orderId, userId);
                    });
                });
            } else {
                ordersContainer.innerHTML = `<p>You have no orders yet.</p>`;
            }
        });
}

function cancelOrder(orderId, userId) {
    fetch('/orders/cancel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ order_id: orderId, user_id: userId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
            location.reload();  // Reload the page to reflect the cancelled order
        } else {
            alert("Failed to cancel the order.");
        }
    })
    .catch(error => {
        console.error('Error cancelling order:', error);
        alert("An error occurred while cancelling the order. Please try again later.");
    });
}

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
