const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Toggle looping for the current track or the whole queue.')
        .addStringOption(option => 
            option.setName('mode')
                .setDescription('The loop mode to set')
                .setRequired(true)
                .addChoices(
                    { name: '🚫 Off', value: 'off' },
                    { name: '🔂 Track', value: 'track' },
                    { name: '🔁 Queue', value: 'queue' }
                )
        ),
    async execute(interaction, client) {
        const memberVC = interaction.member.voice.channel;
        const botVC = interaction.guild.members.me.voice.channel;

        if (!memberVC || (botVC && memberVC.id !== botVC.id)) {
            return interaction.reply({ content: '❌ You need to be in the same voice channel as me to use this!', ephemeral: true });
        }

        const queue = client.queues.get(interaction.guild.id);

        if (!queue || !queue.isPlaying) {
            return interaction.reply({ content: '❌ I am not playing any music right now.', ephemeral: true });
        }

        const mode = interaction.options.getString('mode');
        queue.loopMode = mode; // We added this property in our Queue.js earlier!

        let modeText = '';
        if (mode === 'off') modeText = '🚫 Looping is now **Disabled**.';
        if (mode === 'track') modeText = '🔂 Now looping the **Current Track**.';
        if (mode === 'queue') modeText = '🔁 Now looping the **Entire Queue**.';

        const embed = new EmbedBuilder()
            .setColor('#1DB954')
            .setDescription(modeText);

        await interaction.reply({ embeds: [embed] });
    }
};

