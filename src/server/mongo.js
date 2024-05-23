const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const schema = new mongoose.Schema({}, { strict: false });
const userDatas = mongoose.model("users", schema);
const dogDatas = mongoose.model("dogs", schema);
const bookingDatas = mongoose.model("bookings", schema);


module.exports = {
    registerUser: async function(userData) {
        try {
            userData.dogs = []
            userData.bookings = []
            const user = new userDatas(userData);
            await user.save();
            return { success: true, userId: user._id };
        } catch (error) {
            throw error;  
        }
    },
    registerDog: async function(dogData) {
        try {
            const dog = new dogDatas(dogData);
            await dog.save();
            return { success: true, dogId: dog._id };
        } catch (error) {
            throw error;  
        }
    },
    registerBooking: async function(bookingData) {
        try {
            const booking = new bookingDatas(bookingData);
            await booking.save();
            return { success: true, bookingId: booking._id };
        } catch (error) {
            throw error;  
        }
    },
    insertDog: async function(dogID, userID) {
        try {
            await userDatas.findByIdAndUpdate(userID, 
                { $push: { dogs: dogID }}, 
                { new: true,upsert: true,}
            );
            return { success: true };
        } catch (error) {
            throw error;  
        }
    },
    insertBooking: async function(bookingId, userID) {
        try {
            await userDatas.findByIdAndUpdate(userID, 
                { $push: { bookings: new ObjectId(bookingId) }}, 
                { new: true,upsert: true,}
            );
            return { success: true };
        } catch (error) {
            throw error;  
        }
    },
    updateBooking: async function(bookingId, walkerName) {
        try {
            await bookingDatas.findByIdAndUpdate(new ObjectId(bookingId),
                { $set: { walker: walkerName } },
            );
            return { success: true };
        } catch (error) {
            throw error;  
        }
    },
    editDog: async function(id, data) {
        try {
            await dogDatas.findByIdAndUpdate(id, data, { new: true });
        } catch (error) {
            throw error;
        }
    },
    deleteDog: async function(dogID) {
        try {
            await dogDatas.findByIdAndDelete(dogID);
        } catch (error) {
            throw error;
        }
    },
    removeDog: async function(userID, dogID) {
        try {
            var dog = await userDatas.findByIdAndUpdate(userID, { $pull: { dogs: new ObjectId(dogID) } });
            return dog
        } catch (error) {
            throw error;
        }
    },
    emailExists: async function(email) {
        try {
            const user = await userDatas.findOne({ email: email });
            return user != null; 
        } catch (error) {
            throw error; 
        }
    },
    findUserByEmail: async function(email) {
        try {
            const user = await userDatas.findOne({ email: email });
            return user
        } catch (error) {
            throw error;
        }
    },
    findUserByID: async function(id) {
        try {
            const user = await userDatas.findOne({ _id: id });
            return user
        } catch (error) {
            throw error; 
        }
    },
    findDog: async function(id) {
        try {
            const dog = await dogDatas.findOne({ _id: new ObjectId(id) });
            return dog
        } catch (error) {
            throw error; 
        }
    },
    findBooking: async function(id) {
        try {
            const booking = await bookingDatas.findOne({ _id: id }).lean();;
            return booking
        } catch (error) {
            throw error; 
        }
    },
    sortBookings: async function(bookings){
        try {
            var arrayBookings = []
            for (let i = 0; i < bookings.length; i++){
                var booking = bookings[i]
                var arrayDogs = [];
                for (let x = 0; x < booking.dogs?.length; x++){
                    var dogId = booking.dogs[x]
                    var dogDetails = await this.findDog(dogId);
                    if (dogDetails) arrayDogs.push(dogDetails);
                }
                booking.dogs = arrayDogs
                arrayBookings.push(booking)
            }
            return arrayBookings
        } catch (error) {
            throw error; 
        }
    },
    getBookings: async function() {
        try {
            const bookings = await bookingDatas.find({}).lean();
            return bookings
        } catch (error) {
            throw error; 
        }
    },
};