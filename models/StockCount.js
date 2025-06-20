const mongoose = require('mongoose');

module.exports = mongoose.model('StockCount', new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  countedQuantity: Number,
  actualQuantity: Number,
  adjustment: Number,
  countedAt: { type: Date, default: Date.now },
}));
