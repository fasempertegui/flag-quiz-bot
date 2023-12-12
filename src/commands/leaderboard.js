const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const styleCodeBlock = require('../utils/styles/codeBlock.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('show the leaderboard')
        .setDescriptionLocalizations({ 'es-ES': 'muestra la tabla de puntos' }),
    async execute(interaction, userLanguage) {

        const { connection, languageFiles } = interaction.client;

        const { strings } = languageFiles.get(userLanguage);

        try {
            const sort = { "scores": -1, "times_played": 1, "last_played": -1 }
            const results = await connection.find().sort(sort).toArray();

            if (!results) {
                interaction.reply(string['EMPTY_LEADERBOARD']);
                return;
            }

            let messageEmbed = new EmbedBuilder();
            messageEmbed.setTitle(strings['LEADERBOARD']);
            messageEmbed.setDescription('Ordenados por:\n > puntos\n > dias jugados\n > ult. vez jugado');
            messageEmbed.setColor('#ce1126');
            let fieldText = '';
            let index = 0;
            for(let result of results){
                try {
                    const player = await interaction.client.users.cache.get(result["_id"]);
                    fieldText += `${index + 1}. @${player.username}: ${result["score"]} points\n`;
                    index++;
                }
                catch (err) {
                    console.log(err);
                }
            }
            console.log(fieldText);
            messageEmbed.addFields(
                {
                    name: strings['TOP_10'],
                    value: styleCodeBlock(fieldText)
                }
            )

            interaction.reply({ embeds: [messageEmbed] });
        }
        catch (err) {
            console.log(err);
        }
    }
}