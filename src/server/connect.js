const mongoose = require('mongoose');
const config = require('./config');

class Database {
    constructor() {
        this.connection = null;
    }

    connect() {
        console.log('Connecting to database...');
        mongoose.set('strictQuery', false);
        mongoose.connect(config.mongodbUri)
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
