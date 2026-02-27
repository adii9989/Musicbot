const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filters')
        .setDescription('Apply premium audio effects to the music.')
        .addStringOption(option => 
            option.setName('effect')
                .setDescription('The filter to apply')
                .setRequired(true)
                .addChoices(
                    { name: '🚫 Clear Filters', value: 'clear' },
                    { name: '🔊 Bassboost', value: 'bassboost' },
                    { name: '🐿️ Nightcore', value: 'nightcore' },
                    { name: '🌌 Vaporwave', value: 'vaporwave' },
                    { name: '🎤 Karaoke', value: 'karaoke' }
                )
        ),
    async execute(interaction, client) {
        const memberVC = interaction.member.voice.channel;
        const botVC = interaction.guild.members.me.voice.channel;

        if (!memberVC || (botVC && memberVC.id !== botVC.id)) {
            return interaction.reply({ content: '❌ You need to be in the same voice channel as me!', ephemeral: true });
        }

        const queue = client.queues.get(interaction.guild.id);
        if (!queue || !queue.isPlaying) {
            return interaction.reply({ content: '❌ I am not playing any music right now.', ephemeral: true });
        }

        const effect = interaction.options.getString('effect');
        const player = queue.player;

        let description = '';

        // Apply Shoukaku/Lavalink Filters
        switch (effect) {
            case 'clear':
                await player.clearFilters();
                description = '🚫 **All audio filters have been cleared.**';
                break;
            case 'bassboost':
                await player.setFilters({
                    equalizer: [
                        { band: 0, gain: 0.6 },
                        { band: 1, gain: 0.67 },
                        { band: 2, gain: 0.67 },
                        { band: 3, gain: 0.4 },
                        { band: 4, gain: -0.5 },
                        { band: 5, gain: 0.15 },
                        { band: 6, gain: -0.45 },
                        { band: 7, gain: 0.23 },
                        { band: 8, gain: 0.35 },
                        { band: 9, gain: 0.45 },
                        { band: 10, gain: 0.55 },
                        { band: 11, gain: 0.6 },
                        { band: 12, gain: 0.55 },
                        { band: 13, gain: 0 },
                    ]
                });
                description = '🔊 **Bassboost** filter applied!';
                break;
            case 'nightcore':
                await player.setFilters({
                    timescale: { speed: 1.2, pitch: 1.2, rate: 1.0 }
                });
                description = '🐿️ **Nightcore** filter applied! (Sped up and higher pitch)';
                break;
            case 'vaporwave':
                await player.setFilters({
                    timescale: { speed: 0.8, pitch: 0.8, rate: 1.0 }
                });
                description = '🌌 **Vaporwave** filter applied! (Slowed down and reverb-like)';
                break;
            case 'karaoke':
                await player.setFilters({
                    karaoke: { level: 1.0, monoLevel: 1.0, filterBand: 220.0, filterWidth: 100.0 }
                });
                description = '🎤 **Karaoke** filter applied! (Vocals reduced)';
                break;
        }

        const embed = new EmbedBuilder()
            .setColor('#9B59B6') // Purple for premium features
            .setDescription(description);

        await interaction.reply({ embeds: [embed] });
    }
};

