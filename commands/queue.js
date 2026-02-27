const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Shows the current list of upcoming songs.'),
    async execute(interaction, client) {
        // Fetch the queue from the Map we created in index.js
        const queue = client.queues.get(interaction.guild.id);

        if (!queue || !queue.currentTrack) {
            return interaction.reply({ content: '❌ The queue is currently empty.', ephemeral: true });
        }

        const current = queue.currentTrack;
        const tracks = queue.tracks;

        // Map the upcoming tracks into a readable string (limit to 10 so Discord embeds don't break)
        const upcomingSongs = tracks.slice(0, 10).map((track, index) => {
            return `**${index + 1}.** [${track.info.title}](${track.info.uri}) - \`${Math.floor(track.info.length / 60000)}:${Math.floor((track.info.length % 60000) / 1000).toString().padStart(2, '0')}\``;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setColor('#1DB954')
            .setAuthor({ name: `Server Queue - ${interaction.guild.name}` })
            .addFields(
                { name: '🎶 Now Playing:', value: `**[${current.info.title}](${current.info.uri})**` },
                { name: `📥 Upcoming Songs: ${tracks.length}`, value: upcomingSongs || 'No more songs in the queue.' }
            )
            .setFooter({ text: tracks.length > 10 ? `And ${tracks.length - 10} more...` : 'End of queue.' });

        await interaction.reply({ embeds: [embed] });
    }
};


