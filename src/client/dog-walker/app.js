document.addEventListener('DOMContentLoaded', async function() {
    // setting variables for HTML elements
    const bookingsList = document.getElementById('bookingsList');
    const bookingDetails = document.getElementById('bookingDetails');
    const info = document.getElementById("bookingInfo");
    const closeButton = document.getElementById("closeInfo");
    const logOutBTN = document.getElementById('logOut')

    // fetch data from the API 
    var pendingBookings = await getBookings() || []
    pendingBookings.sort((a, b) => {
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

    // add bookings into container
    if (pendingBookings.length == 0) bookingsList.innerHTML = '<div class="empty-message">There are no available bookings</div>';
    pendingBookings.forEach((booking, index) => {
        const bookingDiv = document.createElement('div');
        bookingDiv.className = 'booking';
        bookingDiv.id = booking._id;
        bookingDiv.innerHTML = `
            <p>Date: ${booking.date}</p>
            <p>Owner: ${booking.owner ? booking.owner : "N/A"}</p>
            <p>Location: ${shortenLocation(booking.location)}</p>`;

        bookingDiv.onclick = function() { 
            showBookingInfo(booking, true); 
        };

        bookingsList.appendChild(bookingDiv);
    }); 
    
    // listen to events related to the calendar.js
    window.bookingInfoCalendar = function(walkerBookings, bookingId) {
        var booking = walkerBookings.find(x => x._id === bookingId);
        if (booking) {
            showBookingInfo(booking, false);
        }
    };
    
    // event listener for closing container
    closeButton.onclick = function() {
        info.style.display = "none";
    }

    // Close window if user clicks outside of the pop up window
    window.onclick = function(event) {
        if (event.target == info) {
            info.style.display = "none";
        }
    }

    // show information about the booking
    function showBookingInfo(booking, bool) {
        bookingDetails.textContent = ''; 

        const owner = document.createElement('p');
        owner.innerHTML = `<strong>Owner:</strong> ${booking.owner}`;
        const date = document.createElement('p');
        date.innerHTML = `<strong>Date:</strong> ${booking.date}`;
        const location = document.createElement('p');
        location.innerHTML = `<strong>Location:</strong> ${booking.location}`;
        const dog = document.createElement('p');
        dog.innerHTML = `<strong>Dog(s):</strong>`;

        const dogsList = document.createElement('div');
        dogsList.className = 'dogs-list';
        booking.dogs.forEach(dog => {
            const card = createDogCard(dog)
            dogsList.appendChild(card);
        });

        bookingDetails.appendChild(owner);
        bookingDetails.appendChild(date);
        bookingDetails.appendChild(location);
        bookingDetails.appendChild(dog);
        bookingDetails.appendChild(dogsList);

        if (bool) {
            const takeJobButton = document.createElement('button');
            takeJobButton.className = 'dashboard-button';
            takeJobButton.textContent = 'Take This Job';
            takeJobButton.onclick = async function() {
                await takeJob(booking)
            };
            bookingDetails.appendChild(takeJobButton);
        }

        info.style.display = 'block';
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

    // shorten the length of the location
    function shortenLocation(location){
        return location.split(",").slice(1,3)
    }

    //-------DATABASE MANIPULATION--------//
    async function takeJob(booking){
       await saveBooking({id: booking._id});
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

    async function getBookings(){
        const request = await fetch('/get-bookings', {
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

    async function saveBooking(bookingID){
        const request = await fetch('/save-booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingID)
        })

        const response = await request.json()
        if (!response) return;
        if (response.error) return console.error(response.error);

        location.reload()
    } 
});

