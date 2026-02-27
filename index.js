const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Connectors, Shoukaku } = require('shoukaku');
const config = require('./config.js');
const loadCommands = require('./handlers/loadCommands.js');
const loadEvents = require('./handlers/loadEvents.js');
const loadDatabase = require('./handlers/loadDatabase.js'); // <-- NEW IMPORT

// Initialize the Discord Client
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

// Initialize Database Connection <-- NEW ADDITION
loadDatabase();

// Initialize Shoukaku (Lavalink Wrapper)
const Nodes = config.lavalinkNodes;
const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), Nodes);

client.shoukaku = shoukaku;

shoukaku.on('error', (_, error) => console.error('Lavalink Error:', error));
shoukaku.on('ready', (name) => console.log(`[Lavalink] Node: ${name} is now connected.`));

// Load Handlers
loadCommands(client);
loadEvents(client);

// Login
client.login(config.token);


