/* Mongoose schema for new users creating their new account */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { required: true, type: String},
    password: { required: true, type: String}
});

module.exports = mongoose.model('User', userSchema);