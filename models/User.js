
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String },
    mobile: { type: String },
    email: { type: String, required: true, unique: true },
    address: { type: String },
    role: { type: String, default: 1 },
    password: { type: String, default: true },
    organizations: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'organizations' }
    ],
}, { timestamps: true })


const User = mongoose.model('users', userSchema);

module.exports = User;

