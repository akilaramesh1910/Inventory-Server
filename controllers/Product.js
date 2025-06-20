const Product =  require('../models/product');
const Activity = require('../models/Activity'); 

exports.getProducts = async (req, res) => {
  try {
     const productsWithStock = await Product.aggregate([
      {
        $lookup: {
          from: 'stocks',
          localField: '_id',
          foreignField: 'productId', 
          as: 'stockInfo' 
        }
      },
      {
        $unwind: {
          path: '$stockInfo',
          preserveNullAndEmptyArrays: true 
        }
      },
      {
        $addFields: {
          stock: { $ifNull: ['$stockInfo.quantity', 0] }
        }
      },
      { $project: { stockInfo: 0 } }
    ]);
    res.json(productsWithStock);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    await Activity.create({
      type: 'PRODUCT_CREATED',
      message: `Product '${product.name}' was added.`,
      entityId: product._id,
      entityType: 'Product',
      iconKey: 'PackagePlus',
    });

    res.status(201).json(product); 
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: 'Failed to add product', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Activity.create({
      type: 'PRODUCT_UPDATED',
      message: `Product '${product.name}' was updated.`,
      entityId: product._id,
      entityType: 'Product',
      iconKey: 'FileEdit', 
    });

    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Activity.create({
      type: 'PRODUCT_DELETED',
      message: `Product '${product.name}' was deleted.`,
      entityId: product._id,
      entityType: 'Product',
      iconKey: 'Trash2',
    });

    res.status(204).end();
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};