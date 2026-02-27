const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the music, clears the queue, and leaves the channel.'),
    async execute(interaction, client) {
        const memberVC = interaction.member.voice.channel;
        const botVC = interaction.guild.members.me.voice.channel;

        if (!memberVC || (botVC && memberVC.id !== botVC.id)) {
            return interaction.reply({ content: '❌ You need to be in the same voice channel as me to use this!', ephemeral: true });
        }

        const queue = client.queues.get(interaction.guild.id);

        if (!queue) {
            return interaction.reply({ content: '❌ I am not playing any music right now.', ephemeral: true });
        }

        // Destroy the queue (this clears the tracks array and leaves the channel automatically)
        queue.destroy();

        const embed = new EmbedBuilder()
            .setColor('#E22134')
            .setDescription('🛑 **Music stopped.** Cleared the queue and left the voice channel.');

        await interaction.reply({ embeds: [embed] });
    }
};


