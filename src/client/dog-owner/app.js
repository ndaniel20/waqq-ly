document.addEventListener('DOMContentLoaded', async function() {
    // setting variables for HTML elements
    const logOutBTN = document.getElementById('logOut')
    // Dog form
    const dogsList = document.getElementById('dogs');
    const dogFormContainer = document.getElementById('dogForm');
    const dogForm = document.getElementById('addDogForm');
    const dogBtn = document.getElementById('addDogButton');
    const dogClose = document.getElementById("closeDog");
    // Booking form
    const bookingsList = document.getElementById('bookingsList');
    const bookFormContainer = document.getElementById('bookForm');
    const bookBtn = document.getElementById('addBookButton');
    const bookClose = document.getElementById("closeBook");
    const dogSelection = document.getElementById('dogSelection');
    // Booking info 
    const infoContainer = document.getElementById("bookingInfo");
    const infoClose = document.getElementById("closeInfo");
    // prevent users from selecting a date before today on the calendar
    var todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    var dd = String(todayDate.getDate()).padStart(2, '0');
    var mm = String(todayDate.getMonth() + 1).padStart(2, '0'); 
    var yyyy = todayDate.getFullYear();
    var today = yyyy + '-' + mm + '-' + dd;
    document.getElementById('bookingDate').setAttribute('min', today);

    // fetch data from the API 
    var dogsArray = await getDogs() || []
    var bookings = await getBookings() || []
    dogsArray = dogsArray.filter(x=>x)
    bookings = bookings.filter(x=>x).filter(b => new Date(b.date) >= todayDate);
    bookings.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
    });

    // fill profile info container
    const userData = await getUser(); 
    if (userData) {
        const nameElement = document.querySelector('#userName span');
        const emailElement = document.querySelector('#userEmail span');
        const typeElement = document.querySelector('#userType span');

        nameElement.textContent = userData.name;
        emailElement.textContent = userData.email;
        typeElement.textContent = userData.type === 1 ? 'Dog Owner' : 'Dog Walker'; 
    }
    // listen if the user wants to log out
    logOutBTN.addEventListener('click', async function() {
        await logOut()
        window.location.href = '/login';
    });

    // append the user's dog list on the HTML page
    if (dogsArray.length == 0) dogsList.innerHTML = '<div class="empty-message">You have no dogs added</div>';
    dogsArray.forEach((dog, index) => {
        const dogCard = createDogCard(dog)
        dogCard.onclick = function() {
            showDogInfo(this.dataset.id)
        };
        dogsList.appendChild(dogCard);

        const bookDiv = document.createElement('div');
        bookDiv.textContent = dog.name;
        bookDiv.dataset.id = dog._id; 
        bookDiv.onclick = function() {
            this.classList.toggle('selected'); 
        };
        dogSelection.appendChild(bookDiv);
    });

    // Event listeners on dog form being opened/closed
    dogBtn.onclick = function() {
        dogFormContainer.style.display = "block";
        dogForm.reset()
        document.getElementById('formHeader').textContent = 'Add Dog Information';
        document.getElementById('updateDogButton').style.display = 'none';
        document.getElementById('deleteDogButton').style.display = 'none';
        document.getElementById('insertDogButton').style.display = 'block';
        document.getElementById('dogForm').style.display = 'block';
    }
    dogClose.onclick = function() {
        dogFormContainer.style.display = "none";
    }

    // Event listeners on submit buttons
    bookForm.addEventListener('submit', async function(event) {
        await insertBook(event);
    });

    dogForm.addEventListener('submit', async function(event) {
        await insertDog(event);
    });

    // Event listeners on booking form being opened/closed
    bookBtn.onclick = function() {
        bookFormContainer.style.display = "block";
        map.invalidateSize();
    }
    bookClose.onclick = function() {
        bookFormContainer.style.display = "none";
    }
    infoClose.onclick = function() {
        infoContainer.style.display = "none";
    }

    // Close window if user clicks outside of the pop up window
    window.onclick = function(event) {
        if (event.target == dogFormContainer) {
            dogFormContainer.style.display = "none";
        }
        if (event.target == bookFormContainer) {
            bookFormContainer.style.display = 'none';
        }
        if (event.target == infoContainer) {
            infoContainer.style.display = 'none';
        }
    }

    // Present information about user's dog on the form
    function showDogInfo(id) {
        dogFormContainer.style.display = "block";
        const dog = dogsArray.find(x=>x._id == id);
        dogForm.elements['dogName'].value = dog.name;
        dogForm.elements['dogBreed'].value = dog.breed;
        dogForm.elements['dogSize'].value = dog.size;
        dogForm.elements['dogAge'].value = dog.age;
        dogForm.elements['vaccinated'].checked = dog.vaccinated;
        dogForm.elements['extraInfo'].value = dog.extraInfo || '';

        document.getElementById('formHeader').textContent = 'Edit Dog Information';
        document.getElementById('updateDogButton').style.display = 'block';
        document.getElementById('deleteDogButton').style.display = 'block';
        document.getElementById('insertDogButton').style.display = 'none';
        document.getElementById('dogPhoto').value = "";

        document.getElementById('updateDogButton').onclick = async function() {
            const dogData = createDogObject()
            await editDogObject(id, dogData);
        };
        document.getElementById('deleteDogButton').onclick = async function() {
            await deleteDogObject(id);
        };
    }

    // append the user's bookings on the HTML page
    if (bookings.length == 0) bookingsList.innerHTML = '<div class="empty-message">You have no bookings added</div>';
    bookings.forEach(booking => {
        const bookingDiv = document.createElement('div');
        bookingDiv.className = booking.walker ? `booking` : `booking available`;
        bookingDiv.dataset.id = booking._id
        bookingDiv.innerHTML = `
            <p>Date: ${booking.date}</p>
            <p>Walker: ${booking.walker ? booking.walker : "N/A"}</p>
            <p>Location: ${shortenLocation(booking.location)}</p>
        `;
        bookingDiv.onclick = function() {
            showBookingInfo(booking)
        };
        bookingsList.appendChild(bookingDiv);
    }); 

    // show information about the booking
    function showBookingInfo(booking) {
        const bookingDetails = document.getElementById('bookingDetails');
        bookingDetails.textContent = ''; 

        const walker = document.createElement('p');
        walker.innerHTML = `<strong>Walker:</strong> ${booking.walker ? booking.walker : "N/A"}`;
        const date = document.createElement('p');
        date.innerHTML = `<strong>Date:</strong> ${booking.date}`;
        const location = document.createElement('p');
        location.innerHTML = `<strong>Location:</strong> ${booking.location}`;
        const dog = document.createElement('p');
        dog.innerHTML = `<strong>Dog(s):</strong>`;

        const dogs = document.createElement('div');
        dogs.className = 'dogs-list';
        booking.dogs.forEach(dog => {
            const card = createDogCard(dog)
            dogs.appendChild(card);
        });

        bookingDetails.appendChild(walker);
        bookingDetails.appendChild(date);
        bookingDetails.appendChild(location);
        bookingDetails.appendChild(dog);
        bookingDetails.appendChild(dogs);

        infoContainer.style.display = 'block';
    }

    // create the individual dog cards
    function createDogCard(dog) {
        const dogCard = document.createElement('div');
        dogCard.className = 'dog-card';
        if (dog.photo && dog.photo.buffer) {
            dogCard.style.backgroundImage = `url('data:${dog.photo.mimetype};base64,${dog.photo.buffer}')`;
        } else {
            dogCard.style.backgroundImage = "url('../images/default-dog.png')";
        }

        const dogInfo = document.createElement('div');
        dogInfo.className = 'dog-info';

        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = `
            <strong>Breed:</strong> ${dog.breed}<br>
            <strong>Size:</strong> ${dog.size}<br>
            <strong>Age:</strong> ${dog.age}<br>
            <strong>Vaccinated:</strong> ${dog.vaccinated ? 'Yes' : 'No'}<br>
            <strong>Info:</strong> ${dog.extraInfo}
        `;

        const dogName = document.createElement('div');
        dogName.className = 'dog-name';
        dogName.textContent = dog.name;

        dogInfo.appendChild(tooltip);
        dogCard.appendChild(dogInfo);
        dogCard.appendChild(dogName);
        dogCard.dataset.id = dog._id

        return dogCard;
    }

    // get all the dogs selected on the booking page
    function getSelectedDogs() {
        const selectedDogs = [];
        const dogDivs = document.querySelectorAll('#dogSelection div.selected');
        dogDivs.forEach(div => {
            selectedDogs.push(div.dataset.id); 
        });
        return selectedDogs;
    }

    // shorten the length of the location
    function shortenLocation(location){
        return location.split(",").slice(1,3)
    }

    // get the date of the booking
    function getBookingDate() {
        return document.getElementById('bookingDate').value;
    }

    // get location of the marker that was added on the map
    function getSelectedLocation() {
        if (marker) return marker.getPopup().getContent()
        return null;
    }

    function createDogObject(){
        const name = dogForm.elements['dogName'].value;
        const breed = dogForm.elements['dogBreed'].value;
        const photo = dogForm.elements['dogPhoto'].files[0];
        //const photo = file
        const size = dogForm.elements['dogSize'].value;
        const age = dogForm.elements['dogAge'].value;
        const vaccinated = dogForm.elements['vaccinated'].checked;
        const extraInfo = dogForm.elements['extraInfo'].value;

        const dogData = {name, breed, photo, size, age, vaccinated: vaccinated, extraInfo: extraInfo}
        return dogData
    }

    //-------DATABASE MANIPULATION--------//
    // Insert new dog data into database
    async function insertDog(event) {
        event.preventDefault();
        const dogData = createDogObject()
        await sendDogObject(dogData)
    }

    // Insert booking data into database after form has been submitted
    async function insertBook(event) {
        event.preventDefault();

        const dogs = getSelectedDogs();
        const location = getSelectedLocation();
        const date = getBookingDate();

        document.getElementById('dogError').textContent = dogs.length == 0 ? "Please select at least one dog." : "" ;
        document.getElementById('locationError').textContent = !location ? "Please enter a valid location." : "" ;
        document.getElementById('dateError').textContent = !date ? "Please select a valid date." : "" ;

        if (dogs.length == 0 || !location || !date) return;
        const bookingData = {dogs, location, date}
        await sendBookingObject(bookingData)
    }

    async function logOut(){
        const request = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        const response = await request.json()
        if (!response) return;
        if (response.error) return console.error(response.error);

        return response
    } 

    async function getUser(){
        const request = await fetch('/get-user', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        const response = await request.json()
        if (!response) return;
        if (response.error) return console.error(response.error);

        return response
    } 

    async function sendDogObject(dogData){
        const formData = new FormData();
        formData.append('name', dogData.name);
        formData.append('breed', dogData.breed);
        if (dogData.photo) formData.append('photo', dogData.photo);
        formData.append('size', dogData.size);
        formData.append('age', dogData.age);
        formData.append('vaccinated', String(dogData.vaccinated));
        formData.append('extraInfo', dogData.extraInfo);

        const request = await fetch('/insert-dog', {
            method: 'POST',
            body: formData
        })

        const response = await request.json()
        if (!response) return;
        if (response.error) return console.error(response.error);

        location.reload()
    } 

    async function editDogObject(id, dogData){
        const formData = new FormData();
        formData.append('name', dogData.name);
        formData.append('breed', dogData.breed);
        if (dogData.photo) formData.append('photo', dogData.photo);
        formData.append('size', dogData.size);
        formData.append('age', dogData.age);
        formData.append('vaccinated', String(dogData.vaccinated));
        formData.append('extraInfo', dogData.extraInfo);
        formData.append('id', id);

        const request = await fetch('/edit-dog', {
            method: 'PATCH',
            body: formData
        })

        const response = await request.json()
        if (!response) return;
        if (response.error) return console.error(response.error);

        location.reload()
    } 

    async function deleteDogObject(id){
        const request = await fetch('/delete-dog', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({id: id})
        })

        const response = await request.json()
        if (!response) return;
        if (response.error) return console.error(response.error);

        location.reload()
    } 

    async function getDogs(){
        const request = await fetch('/get-dogs', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        const response = await request.json()
        if (!response) return;
        if (response.error) return console.error(response.error);

        return response.dogs
    } 

    async function getBookings(){
        const request = await fetch('/get-user-bookings', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        const response = await request.json()
        if (!response) return;
        if (response.error) return console.error(response.error);

        return response.bookings
    } 

    async function sendBookingObject(bookingData){
        const request = await fetch('/insert-booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        })

        const response = await request.json()
        if (!response) return;
        if (response.error) return console.error(response.error);

        location.reload()
    } 
})