const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Playlist = require('../models/Playlist.js');
const QueueManager = require('../utils/QueueManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playlist')
        .setDescription('Manage your personal custom playlists.')
        .addSubcommand(subcommand =>
            subcommand.setName('save')
                .setDescription('Saves the current queue as a custom playlist.')
                .addStringOption(option => 
                    option.setName('name')
                        .setDescription('The name of your new playlist')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('play')
                .setDescription('Plays one of your saved playlists.')
                .addStringOption(option => 
                    option.setName('name')
                        .setDescription('The name of the playlist to play')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('list')
                .setDescription('Lists all your saved playlists.')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('delete')
                .setDescription('Deletes one of your saved playlists.')
                .addStringOption(option => 
                    option.setName('name')
                        .setDescription('The name of the playlist to delete')
                        .setRequired(true)
                )
        ),
    async execute(interaction, client) {
        await interaction.deferReply(); 

        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        // --- SAVE ---
        if (subcommand === 'save') {
            const queue = client.queues.get(interaction.guild.id);
            if (!queue || !queue.currentTrack) {
                return interaction.editReply({ content: '❌ There is no music playing to save!' });
            }

            const name = interaction.options.getString('name').toLowerCase();

            const userPlaylists = await Playlist.countDocuments({ userId });
            if (userPlaylists >= 5) {
                return interaction.editReply({ content: '❌ You can only save up to 5 custom playlists.' });
            }

            const allTracks = [queue.currentTrack, ...queue.tracks];
            const tracksToSave = allTracks.slice(0, 50);

            await Playlist.findOneAndUpdate(
                { userId, name },
                { userId, name, tracks: tracksToSave },
                { upsert: true, new: true }
            );

            const embed = new EmbedBuilder()
                .setColor('#1DB954')
                .setDescription(`💾 Successfully saved **${tracksToSave.length}** tracks to playlist **"${name}"**!`);
            
            return interaction.editReply({ embeds: [embed] });
        }

        // --- PLAY ---
        if (subcommand === 'play') {
            const name = interaction.options.getString('name').toLowerCase();
            const memberVC = interaction.member.voice.channel;

            if (!memberVC) {
                return interaction.editReply({ content: '❌ You need to be in a voice channel to play music!' });
            }

            const botVC = interaction.guild.members.me.voice.channel;
            if (botVC && botVC.id !== memberVC.id) {
                return interaction.editReply({ content: `❌ I am already playing music in <#${botVC.id}>` });
            }

            const playlist = await Playlist.findOne({ userId, name });
            if (!playlist) {
                return interaction.editReply({ content: `❌ Could not find a playlist named **"${name}"**.` });
            }

            // --- UPDATED THIS LINE HERE ---
            const node = client.shoukaku.getIdealNode();
            if (!node) return interaction.editReply({ content: '❌ No music servers are currently available.' });

            let queue = client.queues.get(interaction.guild.id);

            if (!queue) {
                const player = await node.joinChannel({
                    guildId: interaction.guild.id,
                    channelId: memberVC.id,
                    shardId: interaction.guild.shardId
                });

                queue = new QueueManager(client, interaction.guild.id, interaction.channel, player);
                client.queues.set(interaction.guild.id, queue);
            }

            for (const track of playlist.tracks) {
                queue.addTrack(track, interaction.user);
            }

            const embed = new EmbedBuilder()
                .setColor('#1DB954')
                .setDescription(`▶️ Loaded **${playlist.tracks.length}** tracks from playlist **"${playlist.name}"** into the queue.`);
            
            await interaction.editReply({ embeds: [embed] });

            if (!queue.isPlaying) {
                queue.playNext();
            }
            return;
        }

        // --- LIST ---
        if (subcommand === 'list') {
            const playlists = await Playlist.find({ userId });

            if (playlists.length === 0) {
                return interaction.editReply({ content: '❌ You do not have any saved playlists.' });
            }

            const embed = new EmbedBuilder()
                .setColor('#1DB954')
                .setAuthor({ name: `${interaction.user.username}'s Playlists`, iconURL: interaction.user.displayAvatarURL() });

            playlists.forEach((pl, index) => {
                embed.addFields({ name: `${index + 1}. ${pl.name}`, value: `Tracks: ${pl.tracks.length}` });
            });

            return interaction.editReply({ embeds: [embed] });
        }

        // --- DELETE ---
        if (subcommand === 'delete') {
            const name = interaction.options.getString('name').toLowerCase();
            const result = await Playlist.findOneAndDelete({ userId, name });

            if (!result) {
                return interaction.editReply({ content: `❌ Could not find a playlist named **"${name}"** to delete.` });
            }

            const embed = new EmbedBuilder()
                .setColor('#E22134')
                .setDescription(`🗑️ Successfully deleted playlist **"${name}"**.`);
            
            return interaction.editReply({ embeds: [embed] });
        }
    }
};


