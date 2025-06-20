const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    entityId: { 
        type: mongoose.Schema.Types.ObjectId,
    },
    entityType: { 
        type: String,
    },
    iconKey: { 
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

activitySchema.index({ timestamp: -1 });

module.exports = mongoose.model('Activity', activitySchema);