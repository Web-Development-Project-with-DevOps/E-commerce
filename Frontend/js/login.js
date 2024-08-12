// document.addEventListener('DOMContentLoaded', () => {
//     const loginForm = document.getElementById('login-form');

//     loginForm.addEventListener('submit', async (event) => {
//         event.preventDefault();

//         const formData = new FormData(loginForm);
//         const user = {
//             email: formData.get('email'),
//             password: formData.get('password')
//         };

//         try {
//             const response = await fetch('http://127.0.0.1:8000/login', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(user)
//             });

//             if (response.ok) {
//                 // Redirect to the index page after successful login
//                 window.location.href = '/static/index.html';
//             } else {
//                 const result = await response.json();
//                 alert(`Error: ${result.detail || 'Something went wrong'}`);
//             }
//         } catch (error) {
//             console.error('Error logging in:', error);
//         }
//     });
// });
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(loginForm);
        const user = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });

            console.log('Response Status:', response.status);
            console.log('Response Headers:', response.headers);
            console.log('Response Body:', await response.text());  // Log response body

            if (response.ok) {
                window.location.href = '/static/index.html';
            } else {
                const result = await response.json();
                alert(`Error: ${result.detail || 'Something went wrong'}`);
            }
        } catch (error) {
            console.error('Error logging in:', error);
        }
    });
});
