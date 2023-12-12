require('dotenv').config();
const { MongoClient } = require('mongodb')

const url = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/`

let db;

module.exports = async function () {
    if (!db) {
        const client = new MongoClient(url);
        try {
            await client.connect();
            console.log('Succesfully connected to the database');
            db = client.db(process.env.DB_NAME);
        } catch (error) {
            console.error('Error connecting to the database', error);
            throw error;
        }
    }

    return db;
}