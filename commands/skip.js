const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the currently playing song.'),
    async execute(interaction, client) {
        const memberVC = interaction.member.voice.channel;
        const botVC = interaction.guild.members.me.voice.channel;

        if (!memberVC || (botVC && memberVC.id !== botVC.id)) {
            return interaction.reply({ content: '❌ You need to be in the same voice channel as me to use this!', ephemeral: true });
        }

        const queue = client.queues.get(interaction.guild.id);

        if (!queue || !queue.currentTrack) {
            return interaction.reply({ content: '❌ There is no music playing right now.', ephemeral: true });
        }

        // Stopping the Lavalink player forces the 'end' event, which triggers queue.playNext()
        await queue.player.stopTrack();

        const embed = new EmbedBuilder()
            .setColor('#FFCC00')
            .setDescription('⏭️ **Skipped the current song.**');

        await interaction.reply({ embeds: [embed] });
    }
};


