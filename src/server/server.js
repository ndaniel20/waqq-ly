const express = require('express');
const path = require('path');
const bodyParser = require('body-parser'); 
const multer = require('multer');
const cookieParser = require('cookie-parser');
const ObjectId = require('mongoose').Types.ObjectId;
const app = express();
const upload = multer(); 
const PORT = process.env.PORT || 3000;
//database connection
const Database = require('./connect.js'); 
const mongo = require('./mongo.js'); 
const db = new Database();
db.connect();
// set up express.js
app.use(express.static(path.join(__dirname, '../client')));
app.use(bodyParser.json());
app.use(cookieParser());

// GET requests
app.get('/', async (req, res) => {
    const userId = req.cookies.userId
    try {
        const collection = await mongo.findUserByID(userId)
        if (!collection || !collection?.type) return res.sendFile(path.join(__dirname, '../client/login/login.html'));
        if (collection.type == 1) return res.sendFile(path.join(__dirname, '../client/dog-owner/dashboard.html'));
        if (collection.type == 2) return res.sendFile(path.join(__dirname, '../client/dog-walker/dashboard.html'));
    } catch (error) {
        console.error(error)
        res.status(500).send({ error: error.message});
    }
});

app.get('/login', async (req, res) => {
    const userId = req.cookies.userId
    try {
        const collection = await mongo.findUserByID(userId)
        if (!collection || !collection?.type) return res.sendFile(path.join(__dirname, '../client/login/login.html'));
        if (collection.type == 1) return res.sendFile(path.join(__dirname, '../client/dog-owner/dashboard.html'));
        if (collection.type == 2) return res.sendFile(path.join(__dirname, '../client/dog-walker/dashboard.html'));
    } catch (error) {
        console.error(error)
        res.status(500).send({ error: error.message});
    }
});

app.post('/logout', function(req, res) {
    res.clearCookie('userId', { path: '/' });
    res.status(200).json({ message: 'Logout successful' });
});

app.get('/register', async (req, res) => {
    const userId = req.cookies.userId
    try {
        const collection = await mongo.findUserByID(userId)
        if (!collection || !collection?.type) return res.sendFile(path.join(__dirname, '../client/register/register.html'));
        if (collection.type == 1) return res.sendFile(path.join(__dirname, '../client/dog-owner/dashboard.html'));
        if (collection.type == 2) return res.sendFile(path.join(__dirname, '../client/dog-walker/dashboard.html'));
    } catch (error) {
        console.error(error)
        res.status(500).send({ error: error.message});
    }
});

app.get('/get-dogs', async (req, res) => {
    const userId = req.cookies.userId
    try {
        const collection = await mongo.findUserByID(userId)
        if (!collection) return res.status(400).json({ error: "You don't have access to perform this action" });
        const dogs = collection.dogs || []
        var userDogs = []
        for (const d of dogs) {
            var dog = await mongo.findDog(d)
            userDogs.push(dog)
        }
        res.send({ dogs: userDogs });
    } catch (error) {
        console.error(error)
        res.status(500).send({ error: error.message});
    }
});

app.get('/get-user', async (req, res) => {
    const userId = req.cookies.userId
    try {
        const collection = await mongo.findUserByID(userId)
        if (!collection) return res.status(400).json({ error: "You don't have access to perform this action" });
        const {name, email, type} = collection
        res.send({ name, email, type});
    } catch (error) {
        console.error(error)
        res.status(500).send({ error: error.message});
    }
});

app.get('/get-user-bookings', async (req, res) => {
    const userId = req.cookies.userId
    try {
        const collection = await mongo.findUserByID(userId)
        if (!collection) return res.status(400).json({ error: "You don't have access to perform this action" });
        const bookings = collection.bookings || []
        var userBookings = []
        for (const b of bookings) {
            var booking = await mongo.findBooking(b)
            userBookings.push(booking)
        }
        var arrayBookings = await mongo.sortBookings(userBookings)
        res.send({ bookings: arrayBookings });
    } catch (error) {
        console.error(error)
        res.status(500).send({ error: error.message});
    }
});

app.get('/get-bookings', async (req, res) => {
    const userId = req.cookies.userId
    try {
        const collection = await mongo.findUserByID(userId)
        if (!collection || collection.type != 2) return res.status(400).json({ error: "You don't have access to perform this action" });
        var bookings = await mongo.getBookings()
        bookings = bookings.filter(b=>!b.walker)
        var arrayBookings = await mongo.sortBookings(bookings)
        res.send({ bookings: arrayBookings });
    } catch (error) {
        console.error(error)
        res.status(500).send({ error: error.message});
    }
});

// POST requests
app.post('/register', async (req, res) => {
    const userData = req.body
    const { name, email, password, type} = userData;
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailExists = await mongo.emailExists(email)
    
    try {
        if (!type || !name || !email || !password) return res.status(400).json({ error: 'Please make sure all fields are filled.' }); 
        if (!nameRegex.test(name)) return res.status(400).json({ error: 'Name must not contain special characters.' }); 
        if (!emailRegex.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
        if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters long.' }); 
        if (emailExists) return res.status(400).send({ error: 'Email already in use.', code: 400 });

        var info = await mongo.registerUser(userData)
        var userID = info.userId
        res.cookie('userId', userID.toString(), { }); 
        res.send({ message: 'User registered successfully', userID: userID });
    } catch (error) {
        console.error(error)
        res.status(500).send({ error: error.message});
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await mongo.findUserByEmail(email);
        if (!user) return res.status(400).send({ error: 'No user found.'});
        if (password !== user.password) return res.status(400).send({ error: 'Wrong password.'});
        var userID = user._id
        res.cookie('userId', user._id.toString(), {  }); 
        res.send({ message: 'User login successful', userID: userID });
    } catch (error) {
        console.error(error)
        res.status(500).send({ error: error.message});
    }
});

app.post('/insert-dog', upload.single('photo'), async (req, res) => {
    const dogData = req.body
    const photo = req.file;
    const { name, breed, size, age, vaccinated, extraInfo } = dogData;
    const sizeOptions = ['small', 'medium', 'large', 'xl'];
    const ageOptions = ['puppy', 'adult', 'senior'];
    const vaccinatedBool = vaccinated === 'true';
    const userId = req.cookies.userId

    try {
        const collection = await mongo.findUserByID(userId)
        if (collection?.type != 1) return res.status(400).json({ error: "You don't have access to perform this action" });
        if (!name || !breed || !size || !age || typeof vaccinatedBool !== 'boolean') return res.status(400).json({ error: 'Some fields are filled incorrectly.' });
        if (!sizeOptions.includes(size)) return res.status(400).json({ error: 'Invalid size. Valid options are small, medium, large, xl.' });
        if (!ageOptions.includes(age)) return res.status(400).json({ error: 'Invalid age. Valid options are puppy, adult, senior.' });

        const updatedData = { name, breed, size, age, vaccinated: vaccinatedBool, extraInfo, photo };
        var info = await mongo.registerDog(updatedData)
        var dogID = info.dogId
        await mongo.insertDog(dogID, userId)
        res.json({ message: 'Dog added successfully', dogId: dogID });
    } catch (error) {
        console.error(error)
        res.status(500).send({ error: error.message});
    }
});

app.post('/insert-booking', async (req, res) => {
    const bookingData = req.body
    const { date, location, dogs} = bookingData;
    const userId = req.cookies.userId

    try {
        const collection = await mongo.findUserByID(userId)
        if (collection?.type != 1) return res.status(400).json({ error: "You don't have access to perform this action" });
        if (!date || !location) return res.status(400).json({ error: 'Some fields are filled incorrectly.' });
        bookingData.dogs = dogs.filter(d=>collection.dogs.map(e=>e.toString()).includes(d)).map(d=>new ObjectId(d))
        if (bookingData.dogs?.length < 1) return res.status(400).json({ error: 'Insufficient amount of dogs selected' });

        bookingData.owner = collection.name
        bookingData.walker = ""
        var info = await mongo.registerBooking(bookingData)
        var bookingId = info.bookingId
        await mongo.insertBooking(bookingId, userId)
        res.json({ message: 'Booking added successfully', bookingId: bookingId });
    } catch (error) {
        console.error(error)
        res.status(500).send({ error: error.message});
    }
});

app.post('/save-booking', async (req, res) => {
    const bookingData = req.body
    const bookingID = bookingData.id
    const userId = req.cookies.userId

    try {
        const collection = await mongo.findUserByID(userId)
        if (collection?.type != 2) return res.status(400).json({ error: "You don't have access to perform this action" });
        var booking = await mongo.findBooking(bookingID)
        if (booking.walker) return res.status(400).json({ error: "There is already a walker for this job." });
        await mongo.updateBooking(bookingID, collection.name)
        await mongo.insertBooking(bookingID, userId)
        res.json({ message: 'Booking added successfully' });
    } catch (error) {
        console.error(error)
        res.status(500).send({ error: error.message});
    }
});

// PATCH requests

app.patch('/edit-dog', upload.single('photo'), async (req, res) => {
    const dogData = req.body;
    const photo = req.file;
    const dogID = dogData.id
    const { name, breed, size, age, vaccinated, extraInfo } = dogData;
    const sizeOptions = ['small', 'medium', 'large', 'xl'];
    const ageOptions = ['puppy', 'adult', 'senior'];
    const vaccinatedBool = vaccinated === 'true';
    const userId = req.cookies.userId

    try {
        const collection = await mongo.findUserByID(userId)
        if (collection?.type != 1) return res.status(400).json({ error: "You don't have access to perform this action" });
        if (!name || !breed || !size || !age || typeof vaccinatedBool !== 'boolean') return res.status(400).json({ error: 'Some fields are filled incorrectly.' });
        if (!sizeOptions.includes(size)) return res.status(400).json({ error: 'Invalid size. Valid options are small, medium, large, xl.' });
        if (!ageOptions.includes(age)) return res.status(400).json({ error: 'Invalid age. Valid options are puppy, adult, senior.' });
        if (!collection.dogs.map(d=>d.toString()).includes(dogID)) return res.status(400).json({ error: 'That dog does not belong to you' });

        const updatedData = { name, breed, size, age, vaccinated: vaccinatedBool, extraInfo, photo };
        await mongo.editDog(dogID, updatedData);
        res.json({ message: 'Dog edited successfully'});
    } catch (error) {
        console.error(error)
        res.status(500).send({ error: error.message});
    }
});

//DELETE requests

app.delete('/delete-dog', async (req, res) => {
    const body = req.body
    const dogID = body.id
    const userId = req.cookies.userId

    try {
        const collection = await mongo.findUserByID(userId)
        if (collection?.type != 1) return res.status(400).json({ error: "You don't have access to perform this action" });
        if (!collection.dogs.map(d=>d.toString()).includes(dogID)) return res.status(400).json({ error: 'That dog does not belong to you' });
        await mongo.removeDog(userId, dogID)
        //await mongo.deleteDog(dogID)
        res.json({ message: 'Dog deleted successfully'});
    } catch (error) {
        console.error(error)
        res.status(500).send({ error: error.message});
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running`);
});