const mongoose = require('mongoose');
var date = new Date()



const itemSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    quantity: { type: String, required: true },
    description: { type: String, required: false },
    unitPrice: { type: String, required: true },
    total: { type: String, required: true }
})



const invoiceSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'organizations' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    to: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "organizations" },
    dueDate: { type: Date, default: new Date(date.getTime() + (10 * 24 * 60 * 60 * 1000)) },
    notes: { type: String },
    items: [itemSchema],
    status: { type: String, required: true, enum: ["pending", "underReview", "approved"], default: "pending" }
}, { timestamps: true });


const invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = invoice