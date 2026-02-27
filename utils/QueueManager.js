const { EmbedBuilder } = require('discord.js');

class QueueManager {
    constructor(client, guildId, textChannel, player) {
        this.client = client;
        this.guildId = guildId;
        this.textChannel = textChannel;
        this.player = player;
        this.tracks = []; 
        this.currentTrack = null;
        this.isPlaying = false;
        
        // Loop states: 'off', 'track', 'queue'
        this.loopMode = 'off';

        // Listen for when a track finishes
        this.player.on('end', (reason) => {
            if (reason.reason === 'replaced') return; // Ignore if skipped manually
            this.playNext();
        });

        // Listen for player errors
        this.player.on('error', (err) => {
            console.error('Player Error:', err);
            this.playNext();
        });
    }

    addTrack(track, requester) {
        track.requester = requester;
        this.tracks.push(track);
    }

    async playNext() {
        // Handle looping
        if (this.loopMode === 'track' && this.currentTrack) {
            this.tracks.unshift(this.currentTrack); // Put current track back at the front
        } else if (this.loopMode === 'queue' && this.currentTrack) {
            this.tracks.push(this.currentTrack); // Put current track at the end of the line
        }

        // Check if queue is empty
        if (this.tracks.length === 0) {
            this.isPlaying = false;
            this.currentTrack = null;
            const node = this.client.shoukaku.getNode();
            if (node) node.leaveChannel(this.guildId);
            this.client.queues.delete(this.guildId);
            
            const embed = new EmbedBuilder()
                .setColor('#2F3136')
                .setDescription('🎵 Queue has ended. Leaving the voice channel.');
            this.textChannel.send({ embeds: [embed] }).catch(() => {});
            return;
        }

        // Get the next track and play it
        this.currentTrack = this.tracks.shift(); 
        this.isPlaying = true;

        await this.player.playTrack({ track: this.currentTrack.encoded });

        // Send Now Playing Message
        const embed = new EmbedBuilder()
            .setColor('#1DB954')
            .setAuthor({ name: 'Now Playing 🎶' })
            .setDescription(`**[${this.currentTrack.info.title}](${this.currentTrack.info.uri})**`)
            .addFields(
                { name: 'Author', value: this.currentTrack.info.author, inline: true },
                { name: 'Requested by', value: `${this.currentTrack.requester}`, inline: true }
            );

        this.textChannel.send({ embeds: [embed] }).catch(() => {});
    }

    destroy() {
        this.tracks = [];
        this.currentTrack = null;
        const node = this.client.shoukaku.getNode();
        if (node) node.leaveChannel(this.guildId);
        this.client.queues.delete(this.guildId);
    }
}

module.exports = QueueManager;

