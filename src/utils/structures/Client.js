const { Client, Collection, GatewayIntentBits } = require('discord.js');
const connection = require('../../../database/database.js');

class DiscordClient extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.MessageContent
            ]
        })
        connection()
            .then(connection => {
                const collection = connection.collection("players")
                this.connection = collection
            })
            .catch(err => {
                throw err;
            })
        this.commands = new Collection();
        this.activeServers = new Collection();
        this.languages = [];
    }
}

module.exports = DiscordClient;