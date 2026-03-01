const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const QueueManager = require('../utils/QueueManager.js');

// Regex to check if the input is a direct YouTube link
const ytRegex = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song from YouTube, Spotify, or Soundcloud.')
        .addStringOption(option => 
            option.setName('query')
                .setDescription('The song name, YouTube link, or Spotify link')
                .setRequired(true)
        ),
    async execute(interaction, client) {
        // Defer the reply to give the bot time to fetch the track from the engine
        await interaction.deferReply();
        
        const query = interaction.options.getString('query');
        const memberVC = interaction.member.voice.channel;

        // Check if user is in a voice channel
        if (!memberVC) {
            return interaction.editReply({ content: '❌ You need to be in a voice channel to play music!' });
        }

        // Check if the bot is already in a different voice channel
        const botVC = interaction.guild.members.me.voice.channel;
        if (botVC && botVC.id !== memberVC.id) {
            return interaction.editReply({ content: `❌ I am already playing music in <#${botVC.id}>` });
        }

        // --- SEARCH FORMATTING ---
        let searchQuery = query;
        
        // If the user just types a name (e.g., "starboy"), default to YouTube Search
        // The node will automatically handle raw Spotify links if pasted directly.
        if (!ytRegex.test(query) && !query.startsWith('http')) {
            searchQuery = `ytsearch:${query}`; 
        }

        // --- FETCHING THE MUSIC ENGINE ---
        const node = client.shoukaku.getIdealNode();
        if (!node) return interaction.editReply({ content: '❌ No music servers are currently available.' });

        // --- RESOLVING THE TRACK ---
        const result = await node.rest.resolve(searchQuery);
        if (!result || result.loadType === 'empty' || result.loadType === 'error') {
            return interaction.editReply({ content: '❌ No results found or an error occurred while searching.' });
        }

        let tracks = [];
        let isPlaylist = false;
        let playlistName = "";

        // Handle different types of results (Single Track, Playlist, or Search Results)
        if (result.loadType === 'track') {
            tracks.push(result.data);
        } else if (result.loadType === 'playlist') {
            tracks = result.data.tracks;
            isPlaylist = true;
            playlistName = result.data.info.name;
        } else if (result.loadType === 'search') {
            tracks.push(result.data[0]); // Grab the top search result
        }

        if (tracks.length === 0) return interaction.editReply({ content: '❌ Could not load any tracks.' });

        // --- QUEUE MANAGEMENT ---
        let queue = client.queues.get(interaction.guild.id);

        // If there is no queue, create one and join the voice channel
        if (!queue) {
            const player = await node.joinChannel({
                guildId: interaction.guild.id,
                channelId: memberVC.id,
                shardId: interaction.guild.shardId
            });

            queue = new QueueManager(client, interaction.guild.id, interaction.channel, player); 
            client.queues.set(interaction.guild.id, queue);
        }

        // Add the track(s) to the queue
        for (const track of tracks) {
            queue.addTrack(track, interaction.user);
        }

        // --- SUCCESS EMBED ---
        const embed = new EmbedBuilder().setColor('#1DB954'); // Spotify Green
        if (isPlaylist) {
            embed.setDescription(`✅ Added **${tracks.length}** tracks from **${playlistName}** to the queue.`);
        } else {
            embed.setDescription(`✅ Added **[${tracks[0].info.title}](${tracks[0].info.uri})** to the queue.`);
        }
        await interaction.editReply({ embeds: [embed] });

        // Start playing if nothing is currently playing
        if (!queue.isPlaying) {
            queue.playNext();
        }
    }
};


