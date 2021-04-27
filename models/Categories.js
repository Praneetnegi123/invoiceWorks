const mongoose = require("mongoose");

const categoriesSchema = new mongoose.Schema({
    categoryName: { type: String, required: true },
    tax: { type: mongoose.Schema.Types.ObjectId, ref: 'tax' },
}, { timestamps: true })

const Categories = mongoose.model('categories', categoriesSchema);

module.exports = Categories;