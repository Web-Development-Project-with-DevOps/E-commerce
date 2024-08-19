document.addEventListener("DOMContentLoaded", () => {
    // Function to get the value of a specific cookie by name
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // Retrieve user_id from cookie
    const userId = getCookie("user_id");
    const checkoutForm = document.getElementById("checkout-form");


    // Handle form submission for checkout
    checkoutForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const shippingAddress = {
            city: document.getElementById("city").value,
            country: document.getElementById("country").value,
            zip_code: document.getElementById("zip_code").value
        };

        const orderData = {
            user_id: userId,
            shipping_address: shippingAddress
        };

        // Send order data to backend
        fetch("/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Order Response: ", data);
            if (data._id) {
                // Redirect to orders page with order_id
                window.location.href = 'orders.html';
            } else {
                alert("Error: " + (data.detail || "Unknown error"));
            }
        })
        .catch(error => console.error("Error placing order:", error));
    });
});