const { Events, REST, Routes } = require('discord.js');
const config = require('../config.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`[Bot] Logged in as ${client.user.tag}`);

        // Register Slash Commands globally
        const rest = new REST({ version: '10' }).setToken(config.token);
        
        // Convert the commands collection to an array of command data
        const commandsData = client.commands.map(cmd => cmd.data.toJSON());

        try {
            console.log(`[Slash Commands] Started refreshing ${commandsData.length} application (/) commands.`);

            await rest.put(
                Routes.applicationCommands(config.clientId),
                { body: commandsData },
            );

            console.log(`[Slash Commands] Successfully reloaded commands.`);
        } catch (error) {
            console.error(error);
        }
    },
};

