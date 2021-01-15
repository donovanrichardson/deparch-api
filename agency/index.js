const mongoose = require('mongoose');
const {Schema, model} = mongoose
require('dotenv').config()

// mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
//   console.log("Mongo has connected");
// });

const agencySchema = new Schema({
    key: String,
    name: String,
    uri: String,
})

const Agency = model('Agency', agencySchema)

module.exports = {Agency}