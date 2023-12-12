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
                this.connection = connection.collection("players")
            })
            .catch(err => {
                throw err;
            })
        this.commands = new Collection();
        this.languageFiles = new Collection();
        this.activeServers = new Collection();
        this.defaultLanguage = 'en-US';

    }
}

module.exports = DiscordClient;