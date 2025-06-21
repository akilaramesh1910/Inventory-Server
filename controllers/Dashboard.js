const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Stock = require('../models/Stock');
const Activity = require('../models/Activity'); 

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

exports.getStats = async (req, res) => {
    try {
        const periodDays = 30;
        const periodStartDate = new Date();
        periodStartDate.setDate(periodStartDate.getDate() - periodDays);

        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();

        const monthlyRevenueTarget = 50000;
        const monthlyOrderTarget = 500;
        const monthlyProductTarget = 50;
        const monthlyUserTarget = 100;

        const allTimeRevenueData = await Order.aggregate([
            { $group: { _id: null, totalRevenue: { $sum: "$total" } } }
        ]);
        
        const allTimeTotalRevenue = allTimeRevenueData.length > 0 ? allTimeRevenueData[0].totalRevenue : 0;

        const revenueLastPeriodData = await Order.aggregate([
            { $match: { createdAt: { $gte: periodStartDate } } },
            { $group: { _id: null, totalRevenue: { $sum: "$total" } } }
        ]);
        const revenueLastPeriod = revenueLastPeriodData.length > 0 ? revenueLastPeriodData[0].totalRevenue : 0;

        const ordersLastPeriod = await Order.countDocuments({ createdAt: { $gte: periodStartDate } });
        const productsAddedLastPeriod = await Product.countDocuments({ createdAt: { $gte: periodStartDate } });
        const usersRegisteredLastPeriod = await User.countDocuments({ createdAt: { $gte: periodStartDate } });

        const calculateChangeString = (currentPeriodValue, overallTotalValue) => {
            const valueBeforePeriod = overallTotalValue - currentPeriodValue;
            let percentageChange;

            if (valueBeforePeriod === 0) {
                if (currentPeriodValue > 0) {
                    percentageChange = 100.0; 
                } else {
                    percentageChange = 0.0; 
                }
            } else if (overallTotalValue === 0 && currentPeriodValue === 0) {
                 percentageChange = 0.0; 
            }
            else {
                percentageChange = (currentPeriodValue / valueBeforePeriod) * 100;
            }
            if (isNaN(percentageChange) || !isFinite(percentageChange)) {
                percentageChange = 0.0; 
            }

            return `${percentageChange >= 0 ? '+' : ''}${percentageChange.toFixed(1)}%`;
        };

        const revenueChangeStr = calculateChangeString(revenueLastPeriod, allTimeTotalRevenue);
        const ordersChangeStr = calculateChangeString(ordersLastPeriod, totalOrders);
        const productsChangeStr = calculateChangeString(productsAddedLastPeriod, totalProducts);
        const usersChangeStr = calculateChangeString(usersRegisteredLastPeriod, totalUsers);

        const lowStockItemsResult = await Product.aggregate([
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
                $addFields: { quantity: { $ifNull: ['$stockInfo.quantity', 0] } }
            },
            { $match: { quantity: 0 } },
            { $count: 'count' }
        ]);

        const lowStockItems = lowStockItemsResult.length > 0 ? lowStockItemsResult[0].count : 0;

        const stats = [
            {
                title: "Total Revenue",
                value: formatCurrency(allTimeTotalRevenue),
                change: revenueChangeStr,
                iconKey: "DollarSign",
                color: "emerald",
                progress: (() => {
                    if (monthlyRevenueTarget === 0) {
                        return 0;
                    }
                    const rawProgress = (revenueLastPeriod / monthlyRevenueTarget) * 100;
                    return parseFloat(Math.min(rawProgress, 100).toFixed(2));
                })(),
            },
            {
                title: "Total Orders",
                value: totalOrders.toString(),
                change: ordersChangeStr, 
                iconKey: "ShoppingCart",
                color: "indigo",
                progress: (() => {
                    if (monthlyOrderTarget === 0) {
                        return 0;
                    }
                    const rawProgress = (ordersLastPeriod / monthlyOrderTarget) * 100;
                    return parseFloat(Math.min(rawProgress, 100).toFixed(2));
                })(),
            },
            {
                title: "Total Products",
                value: totalProducts.toString(),
                change: productsChangeStr, 
                iconKey: "Package",
                color: "amber",
                progress: (() => {
                    if (monthlyProductTarget === 0) {
                        return 0;
                    }
                    const rawProgress = (productsAddedLastPeriod / monthlyProductTarget) * 100;
                    return parseFloat(Math.min(rawProgress, 100).toFixed(2));
                })(),
            },
            {
                title: "Low Stock Items",
                value: lowStockItems.toString(),
                change: "Items at zero stock",
                iconKey: "AlertTriangle",
                color: "red",
                progress: lowStockItems > 0 ? 100 : 0,
            }
        ];

        res.json(stats);
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: "Failed to fetch dashboard stats", error: error.message });
    }
};

exports.getActivities = async (req, res) => {
    try {
        const recentActivities = await Activity.find()
            .sort({ timestamp: -1 })
            .limit(5);

        const activities = recentActivities.map(activity => ({
            message: activity.message,
            time: activity.timestamp.toISOString(),
            iconKey: activity.iconKey,
        }));

        res.json(activities);
    } catch (error) {
        console.error("Error fetching recent activities:", error);
        res.status(500).json({ message: "Failed to fetch recent activities", error: error.message });
    }
};

exports.getTopProducts = async (req, res) => {
    try {
        const periodDays = 30; 
        const currentDate = new Date();

        const currentPeriodStartDate = new Date(currentDate);
        currentPeriodStartDate.setDate(currentDate.getDate() - periodDays + 1);
        currentPeriodStartDate.setHours(0, 0, 0, 0);

        const previousPeriodStartDate = new Date(currentPeriodStartDate);
        previousPeriodStartDate.setDate(currentPeriodStartDate.getDate() - periodDays);

        const overallStartDate = new Date(previousPeriodStartDate);

        const topProductsData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: overallStartDate, $lte: currentDate }
                }
            },
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.productId",
                    orderItemName: { $first: "$orderItems.name" }, 
                    currentPeriodSales: {
                        $sum: {
                            $cond: [ { $gte: ["$createdAt", currentPeriodStartDate] }, "$orderItems.quantity", 0 ]
                        }
                    },
                    currentPeriodRevenue: {
                        $sum: {
                            $cond: [ { $gte: ["$createdAt", currentPeriodStartDate] }, { $multiply: ["$orderItems.quantity", "$orderItems.price"] }, 0 ]
                        }
                    },
                    previousPeriodSales: {
                        $sum: {
                            $cond: [
                                { $and: [ { $gte: ["$createdAt", previousPeriodStartDate] }, { $lt: ["$createdAt", currentPeriodStartDate] } ] },
                                "$orderItems.quantity",
                                0
                            ]
                        }
                    }
                }
            },
            {
                $addFields: {
                    trend: {
                        $cond: {
                            if: { $gt: ["$previousPeriodSales", 0] },
                            then: { 
                                $multiply: [
                                    { $divide: [ { $subtract: ["$currentPeriodSales", "$previousPeriodSales"] }, "$previousPeriodSales" ] },
                                    100
                                ]
                            },
                            else: { 
                                $cond: {
                                    if: { $gt: ["$currentPeriodSales", 0] }, 
                                    then: 100.0, 
                                    else: 0.0  
                                }
                            }
                        }
                    }
                }
            },
            { $match: { currentPeriodSales: { $gt: 0 } } },
            { $sort: { currentPeriodRevenue: -1 } },
            { $limit: 5 },
            {
                $lookup: { 
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $project: {
                    _id: 0,
                    productId: "$_id",
                    name: { 
                        $ifNull: [ { $arrayElemAt: ["$productDetails.name", 0] }, "$orderItemName" ]
                    },
                    sales: "$currentPeriodSales",   
                    revenue: "$currentPeriodRevenue", 
                    trend: { $round: ["$trend", 1] },
                    image: "📦"
                }
            }
        ]);

        res.json(topProductsData);
    } catch (error) {
        console.error("Error fetching top products:", error);
        res.status(500).json({ message: "Failed to fetch top products", error: error.message });
    }
};
