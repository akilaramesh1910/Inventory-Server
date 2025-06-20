const Stock = require('../models/Stock');
const StockCount = require('../models/StockCount');
const Product = require('../models/product');

exports.addStock = async (req, res) => {
  const { productId, quantity } = req.body;
  const stock = await Stock.findOneAndUpdate(
    { productId },
    { $inc: { quantity }, lastUpdated: new Date() },
    { upsert: true, new: true }
  );
  res.json(stock);
};

exports.reduceStock = async (req, res) => {
  const { productId, quantity } = req.body;
  const stock = await Stock.findOneAndUpdate(
    { productId },
    { $inc: { quantity: -quantity }, lastUpdated: new Date() },
    { new: true }
  );
  res.json(stock);
};

exports.getStock = async (req, res) => {
  const stock = await Stock.findOne({ productId: req.params.productId });
  res.json(stock);
};

exports.setStockQuantity = async (req, res) => {
  try {
    const { productId, newQuantity } = req.body;

    if (productId === undefined || newQuantity === undefined) {
      return res.status(400).json({ message: 'productId and newQuantity are required.' });
    }

    if (typeof newQuantity !== 'number' || newQuantity < 0) {
      return res.status(400).json({ message: 'newQuantity must be a non-negative number.' });
    }

    const updatedStock = await Stock.findOneAndUpdate(
      { productId },
      { quantity: newQuantity, lastUpdated: new Date() },
      { upsert: true, new: true, runValidators: true }
    );
    res.json(updatedStock);
  } catch (error) {
    console.error("Error setting stock quantity:", error);
    res.status(500).json({ message: 'Failed to set stock quantity', error: error.message });
  }
};

exports.recountStock = async (req, res) => {
  try {
    const { productId, countedQuantity } = req.body;

    const existing = await Stock.findOne({ productId });
    const actualQuantity = existing ? existing.quantity : 0;
    const adjustment = countedQuantity - actualQuantity;

    const updated = await Stock.findOneAndUpdate(
      { productId },
      { quantity: countedQuantity, lastUpdated: new Date() },
      { upsert: true, new: true }
    );

    await StockCount.create({
      productId,
      countedQuantity,
      actualQuantity,
      adjustment,
      countedAt: new Date(),
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Recount failed', error: err });
  }
};

exports.getAllStockWithProduct = async (req, res) => {
  try {
    const products = await Product.find({});
    const stocks = await Stock.find({});
    const stockMap = stocks.reduce((map, s) => {
      map[s.productId.toString()] = s;
      return map;
    }, {});

    const result = products.map((p) => ({
      productId: p,
      quantity: stockMap[p._id]?.quantity || 0,
      lastUpdated: stockMap[p._id]?.lastUpdated || null,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stock', error: err });
  }
};
