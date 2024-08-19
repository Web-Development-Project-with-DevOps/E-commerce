document.addEventListener("DOMContentLoaded", () => {
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    const userId = getCookie("user_id");

    if (!userId) {
        alert("User is not logged in!");
        window.location.href = "/static/login.html"; // Redirect to login if not logged in
        return;
    } else {
        document.querySelector(".login").style.display = "none";
        document.querySelector(".register").style.display = "none";
        document.querySelector(".orders").style.display = "block";
    }

    fetch(`/orders?user_id=${userId}`)
        .then(response => response.json())
        .then(orders => {
            const ordersContainer = document.getElementById("orders-container");
            ordersContainer.innerHTML = "";

            if (orders.length === 0) {
                ordersContainer.innerHTML = "<p>No orders found.</p>";
            } else {
                orders.forEach(order => {
                    const orderCard = document.createElement("div");
                    orderCard.className = "col-md-4 card-container"; // Add card-container class here
                    orderCard.innerHTML = `
                        <div class="card mb-4 order-card">
                            <div class="card-header">
                                <h5 class="card-title">Order ID: ${order._id}</h5>
                            </div>
                            <div class="card-body">
                                <p><strong>Total Amount:</strong> $${order.total_amount}</p>
                                <p><strong>Status:</strong> ${order.status}</p>
                                <p><strong>Created On:</strong> ${new Date(order.created_on).toLocaleDateString()}</p>
                                <h6>Items:</h6>
                                <ul class="list-group mb-3">
                                    ${order.items.map(item => `
                                        <li class="list-group-item">
                                            <p><strong>Product:</strong> ${item.product_name}</p>
                                            <p><strong>Quantity:</strong> ${item.quantity}</p>
                                            <p><strong>Price:</strong> $${item.price}</p>
                                            <p><strong>Subtotal:</strong> $${item.subtotal}</p>
                                        </li>
                                    `).join('')}
                                </ul>
                                <h6>Shipping Address:</h6>
                                <p><strong>City:</strong> ${order.shipping_address.city}</p>
                                <p><strong>Country:</strong> ${order.shipping_address.country}</p>
                                <p><strong>Zip Code:</strong> ${order.shipping_address.zip_code}</p>
                            </div>
                        </div>
                    `;
                    ordersContainer.appendChild(orderCard);
                });
            }
        })
        .catch(error => console.error("Error fetching orders:", error));
});
