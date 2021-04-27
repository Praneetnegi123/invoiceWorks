const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    productName: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' }
})

const Product = mongoose.model('product', productSchema);

module.exports = Product;