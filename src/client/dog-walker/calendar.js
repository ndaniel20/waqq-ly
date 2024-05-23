document.addEventListener('DOMContentLoaded', async function() {
    const walkerBookings = await getUserBookings()

    var bookingsModified = [...walkerBookings]
    bookingsModified.forEach(e=>{
        e.title = e.owner;
        e.start = e.date;
    })

    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        height: 400,
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next',
            right: 'title',
        },
        events: bookingsModified.map(booking => {
            const bookingDate = new Date(booking.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0); 
            const isPast = bookingDate < today;
            return {
                title: booking.owner, 
                id: booking._id,
                start: booking.date, 
                backgroundColor: isPast ? 'rgba(55, 135, 215,0.4)' : '', 
                borderColor: isPast ? 'rgba(55, 135, 215,0.4)' : '', 
                textColor: isPast ? 'white' : '',  
            };
        }),
        eventClick: function(info) {
            window.bookingInfoCalendar(walkerBookings, info.event.id);
        }
    });
    calendar.render();

    // REST API
    async function getUserBookings(){
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
})