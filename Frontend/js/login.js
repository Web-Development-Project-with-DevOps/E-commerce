document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const loginMessage = document.getElementById("login-message");

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Login failed");
            }
            return response.json();
        })
        .then(data => {
            // Create a cookie with the user_id
            document.cookie = `user_id=${data.user_id}; path=/; max-age=86400`; // Cookie expires in 1 day
            loginMessage.textContent = "Login successful!";
            loginMessage.style.color = "green";
            setTimeout(() => {
                window.location.href = "index.html"; // Redirect to home or another page
            }, 1000);
        })
        .catch(error => {
            loginMessage.textContent = error.message;
            loginMessage.style.color = "red";
        });
    });
});
