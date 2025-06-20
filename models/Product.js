const mongoose = require('mongoose');

module.exports = mongoose.model('Product', new mongoose.Schema({
        name: String,
        sku: String,
        description: String,
        category: String,
        price: Number,
        cost: Number,
        unit: String,
        minStock: { type: Number, default: 0 }, 
        maxStock: { type: Number, default: 100 }
}, { timestamps: true })) 