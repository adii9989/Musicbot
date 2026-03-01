require('dotenv').config();

module.exports = {
    token: process.env.TOKEN,
    clientId: process.env.CLIENT_ID,
    mongoUri: process.env.MONGO_URI,

    // THE ABSOLUTE LAST VERIFIED PUBLIC NODES
    lavalinkNodes: [
        {
            name: 'Lava-Link-Official',
            url: 'lava.link:80',
            auth: 'youshallnotpass',
            secure: false
        },
        {
            name: 'Lexis-Node',
            url: 'lavalink.lexis.host:443',
            auth: 'lexishost',
            secure: true
        }
    ]
};

