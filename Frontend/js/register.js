document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(registerForm);
        const user = {
            userName: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user),
                credentials: 'include' // Ensure cookies are sent with the request
            });

            // Check if the response is OK
            if (response.ok) {
                const result = await response.json();
                alert(result.msg);

                // Store the user ID in a cookie
                const { user_id } = result;
                document.cookie = `user_id=${user_id}; path=/`;

                // Redirect to login page
                window.location.href = '/static/login.html'; // Updated path
            } else {
                // Handle non-OK responses
                const result = await response.json();
                alert(`Error: ${result.detail || 'Something went wrong'}`);
            }
        } catch (error) {
            console.error('Error registering user:', error);
        }
    });
});
