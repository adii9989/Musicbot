const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Changes the volume of the bot.')
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Volume level (1 to 150)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(150)
        ),
    async execute(interaction, client) {
        const memberVC = interaction.member.voice.channel;
        const botVC = interaction.guild.members.me.voice.channel;

        // Standard Voice Channel Checks
        if (!memberVC || (botVC && memberVC.id !== botVC.id)) {
            return interaction.reply({ content: '❌ You need to be in the same voice channel as me to use this!', ephemeral: true });
        }

        const queue = client.queues.get(interaction.guild.id);

        if (!queue || !queue.isPlaying) {
            return interaction.reply({ content: '❌ I am not playing any music right now.', ephemeral: true });
        }

        const volume = interaction.options.getInteger('amount');

        // Shoukaku's setGlobalVolume takes a number (100 is default)
        await queue.player.setGlobalVolume(volume);

        const embed = new EmbedBuilder()
            .setColor('#1DB954')
            .setDescription(`🔊 **Volume has been set to \`${volume}%\`**`);

        await interaction.reply({ embeds: [embed] });
    }
};

