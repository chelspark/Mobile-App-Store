/* Mongoose schema for new apps */
const mongoose = require('mongoose');

const appSchema = new mongoose.Schema({
    name: { type: String, required: true},
    description: { type: String, required: true},
    details: String,
    apk: { type: mongoose.Schema.Types.ObjectId, ref: 'apks.files' ,required: true},
    screenshot: [{ type: mongoose.Schema.Types.ObjectId, ref: 'screenshots.files'}],
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('App', appSchema);