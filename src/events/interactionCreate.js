const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) return console.log(`No command matching ${interaction.commandName} was found.`);

        const { languages } = interaction.client
        userLanguage = interaction.locale

        if (!languages.includes(userLanguage)) userLanguage = "en-US"

        try {
            await command.execute(interaction, userLanguage);
        }
        catch (err) {
            console.log(`Error executing ${interaction.commandName}`);
            console.log(err);
        }
    }
}