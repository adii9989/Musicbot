const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const QueueManager = require('../utils/QueueManager.js'); // <-- UPDATED IMPORT

const ytRegex = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song. (YouTube links = YT, Text/Spotify links = Spotify)')
        .addStringOption(option => 
            option.setName('query')
                .setDescription('The song name or link to play')
                .setRequired(true)
        ),
    async execute(interaction, client) {
        await interaction.deferReply();
        
        const query = interaction.options.getString('query');
        const memberVC = interaction.member.voice.channel;

        if (!memberVC) {
            return interaction.editReply({ content: '❌ You need to be in a voice channel to play music!' });
        }

        const botVC = interaction.guild.members.me.voice.channel;
        if (botVC && botVC.id !== memberVC.id) {
            return interaction.editReply({ content: `❌ I am already playing music in <#${botVC.id}>` });
        }

        let searchQuery = query;
        if (!ytRegex.test(query) && !query.startsWith('http')) {
            searchQuery = `spsearch:${query}`;
        }

        const node = client.shoukaku.getNode();
        if (!node) return interaction.editReply({ content: '❌ No music servers are currently available.' });

        const result = await node.rest.resolve(searchQuery);
        if (!result || result.loadType === 'empty' || result.loadType === 'error') {
            return interaction.editReply({ content: '❌ No results found or an error occurred while searching.' });
        }

        let tracks = [];
        let isPlaylist = false;
        let playlistName = "";

        if (result.loadType === 'track') {
            tracks.push(result.data);
        } else if (result.loadType === 'playlist') {
            tracks = result.data.tracks;
            isPlaylist = true;
            playlistName = result.data.info.name;
        } else if (result.loadType === 'search') {
            tracks.push(result.data[0]); 
        }

        if (tracks.length === 0) return interaction.editReply({ content: '❌ Could not load any tracks.' });

        let queue = client.queues.get(interaction.guild.id);

        if (!queue) {
            const player = await node.joinChannel({
                guildId: interaction.guild.id,
                channelId: memberVC.id,
                shardId: interaction.guild.shardId
            });

            // <-- UPDATED CLASS INSTANTIATION
            queue = new QueueManager(client, interaction.guild.id, interaction.channel, player); 
            client.queues.set(interaction.guild.id, queue);
        }

        for (const track of tracks) {
            queue.addTrack(track, interaction.user);
        }

        const embed = new EmbedBuilder().setColor('#1DB954');
        if (isPlaylist) {
            embed.setDescription(`✅ Added **${tracks.length}** tracks from **${playlistName}** to the queue.`);
        } else {
            embed.setDescription(`✅ Added **[${tracks[0].info.title}](${tracks[0].info.uri})** to the queue.`);
        }
        await interaction.editReply({ embeds: [embed] });

        if (!queue.isPlaying) {
            queue.playNext();
        }
    }
};


