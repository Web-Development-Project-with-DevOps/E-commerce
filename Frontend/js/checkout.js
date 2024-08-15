document.addEventListener("DOMContentLoaded", () => {
    // Function to get the value of a specific cookie by name
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // Retrieve user_id from cookie
    const userId = getCookie("user_id"); // Assumes 'user_id' is the cookie name

    if (!userId) {
        alert("User is not logged in!");
        return; // Prevent further execution if user_id is not found
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

    const checkoutForm = document.getElementById("checkout-form");

    checkoutForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const userId = getCookie("user_id");
        const shippingAddress = {
            city: document.getElementById("city").value,
            country: document.getElementById("country").value,
            zip_code: document.getElementById("zip_code").value
        };

        // Fetch cart items to include in the order
        fetch(`/cart?user_id=${userId}`)
            .then(response => response.json())
            .then(cartData => {
                if (cartData.items && cartData.items.length > 0) {
                    const orderData = {
                        user_id: userId,
                        items: cartData.items,
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
                        if (data.success) {
                            // Redirect to orders.html with order_id as a query parameter
                            window.location.href = `/orders.html?order_id=${data.order_id}`;
                        } else {
                            alert("Error: " + data.message);
                        }
                    })
                    .catch(error => console.error("Error placing order:", error));
                } else {
                    alert("Your cart is empty.");
                }
            })
            .catch(error => console.error("Error fetching cart data:", error));
    });
});

function getCookie(name) {
    let cookieArr = document.cookie.split(";");
    for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");
        if (name === cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}
