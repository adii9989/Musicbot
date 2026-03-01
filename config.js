require('dotenv').config();

module.exports = {
    token: process.env.TOKEN,
    clientId: process.env.CLIENT_ID,
    mongoUri: process.env.MONGO_URI,

    // Public nodes will now connect because Discloud allows outbound traffic
    lavalinkNodes: [
        {
            name: 'Lavalink-Official-Public',
            url: 'lava.link:80',
            auth: 'youshallnotpass',
            secure: false
        }
    ]
};


