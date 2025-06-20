const Order = require('../models/Order');
const Stock = require('../models/Stock');
const Activity = require('../models/Activity'); 

const formatCurrency = (amount) => { 
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

exports.createOrder = async (req, res) => {
  try {
    const { orderItems, total } = req.body;

    if (!orderItems || orderItems.length === 0 || total === undefined) {
      return res.status(400).json({ message: 'Order items and total are required.' });
    }

    for (let item of orderItems) {
      if (!item.productId) {
        throw new Error(`productId is missing for order item: ${item.name || 'Unknown item'}`);
      }

      const stockItem = await Stock.findOneAndUpdate(
        { productId: item.productId, quantity: { $gte: item.quantity } }, 
        {
          $inc: { quantity: -item.quantity },
          lastUpdated: new Date(),
        },
        { new: true }
      );

      if (!stockItem) {
        throw new Error(`Insufficient stock or product not found for product ID ${item.productId}`);
      }
    }

    const order = new Order({ orderItems, total, user: req.user.id }); 
    await order.save();

    await Activity.create({
      type: 'ORDER_CREATED',
      message: `New order #${order._id.toString().slice(-6)} placed for ${formatCurrency(order.total)}.`,
      entityId: order._id,
      entityType: 'Order',
      iconKey: 'ShoppingCart',
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};
