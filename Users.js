const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true } // ✅ Add this line
});

module.exports = mongoose.model('Users', userSchema);
