const mongoose = require('mongoose');
require('dotenv').config();

class Database {
    constructor() {
        this.connection = null;
    }

    connect() {
        console.log('Connecting to database...');
        mongoose.set('strictQuery', false);
        mongoose.connect(process.env.MONGO_URL)
            .then(() => {
                console.log('Connected to database');
                console.log('---------------------------------');
                this.connection = mongoose.connection;
            })
            .catch(err => {
                console.error(err);
            });
    }
}

module.exports = Database;
