require('dotenv').config();

module.exports = {
    // Discord Bot settings
    token: process.env.TOKEN,
    clientId: process.env.CLIENT_ID,
    
    // Database
    mongoUri: process.env.MONGO_URI,

    // Lavalink settings
    lavalinkNodes: [
        {
            name: 'Public-Test-Node',
            url: 'lavalink.oops.wtf:2000', 
            auth: 'www.freelavalink.ooo',
            secure: false
        }
    ]
};


