const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const commandsPath = path.join(__dirname, '../commands');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`[Command Handler] Loaded /${command.data.name}`);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing "data" or "execute" property.`);
        }
    }
};

