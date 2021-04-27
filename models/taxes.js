const mongoose = require("mongoose");

const taxSchema = new mongoose.Schema({
    taxSlab: { type: Number, required:true },
    taxType: { type: String, default: "GST" }
}, { timestamps: true })

const Tax = mongoose.model('tax', taxSchema);

module.exports = Tax;