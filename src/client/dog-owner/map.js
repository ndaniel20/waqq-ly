const searchButton = document.getElementById("searchButton");
const map = L.map('map').setView([51.505, -0.09], 13);
var marker;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


async function findLocation() {
    var postcode = document.getElementById('postcode').value;
    var postcodeRegex = /^(GIR ?0AA|[A-Z]{1,2}[0-9][0-9A-Z]? ?[0-9][A-Z]{2})$/i; // verify if the postcode is in the UK
    if (!postcodeRegex.test(postcode)) return alert("Please enter a valid UK postcode.");

    const request = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=gb&q=${postcode}`)
    const data = await request.json()
    if (!data) return;
    if (data.error) return console.error(data.error);
    if (data.length == 0) return alert('Location not found');

    if (data.length > 0) {
        var location = data[0];
        map.setView([location.lat, location.lon], 13);
        
        if (marker) marker.setLatLng([location.lat, location.lon]); 
        else marker = L.marker([location.lat, location.lon]).addTo(map); 
        marker.bindPopup(location.display_name).openPopup();
    }
}

searchButton.onclick = async function() {
    await findLocation();
}