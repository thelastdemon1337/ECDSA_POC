const mongoose = require('mongoose')
require('dotenv').config()
require('express-async-errors')
const connectDB = async () => {
    console.log("Attempting to connect to Mongo")
    const URID = process.env.ENVI === "docker" ? process.env.DATABASE_URI_D : process.env.DATABASE_URI;
    console.log(URID)
    try {
        await mongoose.connect(URID).then(console.log("MongoDB connected!")).catch(err => console.log(err))
    } catch (err) {
        console.log(err)
    }
}

module.exports = connectDB