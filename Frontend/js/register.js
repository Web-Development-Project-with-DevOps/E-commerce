document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const registerMessage = document.getElementById("register-message");

    registerForm.addEventListener("submit", (event) => {
        event.preventDefault();
        
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, email, password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Registration failed");
            }
            return response.json();
        })
        .then(data => {
            registerMessage.textContent = "Registration successful!";
            registerMessage.style.color = "green";
            setTimeout(() => {
                window.location.href = "login.html"; // Redirect to login or another page
            }, 1000);
        })
        .catch(error => {
            registerMessage.textContent = error.message;
            registerMessage.style.color = "red";
        });
    });
});
