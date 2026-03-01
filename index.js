const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Connectors, Shoukaku } = require('shoukaku');
const config = require('./config.js');
const loadCommands = require('./handlers/loadCommands.js');
const loadEvents = require('./handlers/loadEvents.js');
const loadDatabase = require('./handlers/loadDatabase.js');
const keepAlive = require('./utils/keepAlive.js'); // <-- NEW: Import Keep Alive

// 1. Start the web server to keep Replit awake
keepAlive();

// 2. Initialize the Discord Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages
    ]
});

// Collections
client.commands = new Collection();
client.queues = new Map(); 

// 3. Initialize Database Connection
loadDatabase();

// 4. Initialize Shoukaku (Lavalink Wrapper)
const Nodes = config.lavalinkNodes;
const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), Nodes);

client.shoukaku = shoukaku;

shoukaku.on('error', (_, error) => console.error('Lavalink Error:', error));
shoukaku.on('ready', (name) => console.log(`[Lavalink] Node: ${name} is now connected.`));

// 5. Load Handlers
loadCommands(client);
loadEvents(client);

// 6. Login
client.login(config.token);


