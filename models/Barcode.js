const mongoose = require('mongoose');

module.exports = mongoose.model('Barcode', new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  barcodeImage: String, 
  createdAt: { type: Date, default: Date.now },
}));
