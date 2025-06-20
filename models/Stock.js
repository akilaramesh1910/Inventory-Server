const mongoose = require('mongoose');

module.exports = mongoose.model('Stock', new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number,
  lastUpdated: { type: Date, default: Date.now },
}));
