const mongoose = require('mongoose');

module.exports = mongoose.model('Order', new mongoose.Schema({
  orderItems: [{
    productId: mongoose.Schema.Types.ObjectId,
    name: String,
    quantity: Number,
    price: Number,
  }],
  total: Number,
  createdAt: { type: Date, default: Date.now },
}));
