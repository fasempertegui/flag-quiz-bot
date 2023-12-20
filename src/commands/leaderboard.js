const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { styleCodeBlock } = require('../utils/styles/styles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('show the leaderboard')
        .setDescriptionLocalizations({ 'es-ES': 'muestra la tabla de puntos' }),
    async execute(interaction, userLanguage) {

        const strings = require(`../locales/${userLanguage}/strings.json`);
        const { connection } = interaction.client;

        try {
            const criteria = { "scores": -1, "times_played": 1 }
            const results = await connection.find().sort(criteria).toArray();

            if (!results) return interaction.reply(string['EMPTY_LEADERBOARD']);

            let messageEmbed = new EmbedBuilder()
                .setTitle(strings['LEADERBOARD'])
                .setDescription(strings['SORTED_BY'])
                .setColor('#ce1126');
            let row = '';
            let index = 0;
            for (const result of results) {
                try {
                    const player = await interaction.client.users.cache.get(result["_id"]);
                    row += `${index + 1}. @${player.username}: ${result["score"]} points\n`;
                    index++;
                }
                catch (err) {
                    console.log(err);
                }
            }
            messageEmbed.addFields({ name: strings['TOP_10'], value: styleCodeBlock(row) });
            interaction.reply({ embeds: [messageEmbed] });
        }
        catch (err) {
            console.log(err);
        }
    }
}