// setting variables for HTML elements
const form = document.getElementById('registration-form')
const dogOwnerBTN = document.getElementById('dog-owner');
const dogWalkerBTN = document.getElementById('dog-walker');
const nameField = document.getElementById('name');
const emailField = document.getElementById('email');
const passwordField = document.getElementById('password');
const errorField = document.getElementById('error')
const registerField = document.getElementById('register');
let selectedType = null;

// Event listener for type of account (dog owner or dog walker)
dogOwnerBTN.addEventListener('click', function() {
    selectedType = 1
    dogOwnerBTN.classList.add('active');
    dogWalkerBTN.classList.remove('active')
});

dogWalkerBTN.addEventListener('click', function() {
    selectedType = 2
    dogWalkerBTN.classList.add('active');
    dogOwnerBTN.classList.remove('active')
});

// register button event listener to verify every field
form.addEventListener('submit', async function(event) {
    event.preventDefault();
    const name = nameField.value
    const email = emailField.value
    const password = passwordField.value
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!selectedType || !name || !email || !password) return errorField.textContent = 'Please make sure all fields are filled.';
    if (!nameRegex.test(name)) return errorField.textContent = 'Name must not contain special characters.'; 
    if (!emailRegex.test(email)) return errorField.textContent = 'Please enter a valid email address.'; 
    if (password.length < 8) return errorField.textContent = 'Password must be at least 8 characters long.'; 

    const userData = {
        name: name,
        email: email,
        password: password,
        type: selectedType
    };
    await sendRegistration(userData)
});

async function sendRegistration(userData){
    const request = await fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    })
    const response = await request.json()
    if (!response) return;

    if (response.code == 400) return errorField.textContent = 'Email has already been used before.'; 
    if (response.error) return console.error(result.error);

    window.location.href = window.location.origin
}