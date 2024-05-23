// setting variables for HTML elements
const form = document.getElementById('login-form');
const errorField = document.getElementById('error');
const emailField = document.getElementById('email');
const passwordField = document.getElementById('password')


form.addEventListener('submit', async function(event) {
    event.preventDefault();
    const email = emailField.value;
    const password = passwordField.value;

    if (!email || !password) return errorField.textContent = 'Please fill in all fields.';

    const userData = {
        email: email,
        password: password
    };

    await sendLogin(userData)
});


async function sendLogin(userData){
    const request = await fetch('/login', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(userData)
    });
    const response = await request.json()
    if (!response) return;
    if (response.error) return errorField.textContent = 'Invalid email or password. Please try again.';

    window.location.href = window.location.origin
}