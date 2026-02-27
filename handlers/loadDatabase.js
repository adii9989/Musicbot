const mongoose = require('mongoose');
const config = require('../config.js');

module.exports = async () => {
    // If there's no URI provided yet, don't crash the bot, just skip it.
    if (!config.mongoUri) {
        console.log('[Database] No MONGO_URI found in .env. Skipping database connection.');
        return;
    }

    try {
        // Mongoose 6+ no longer requires deprecated options like useNewUrlParser
        await mongoose.connect(config.mongoUri);
        console.log('[Database] Successfully connected to MongoDB! 🍃');
    } catch (error) {
        console.error('[Database] Failed to connect to MongoDB:', error);
    }
};

