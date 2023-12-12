const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const normalizeText = require('../utils/normalizeText.js');
const formatDate = require('../utils/formatDate.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('your daily session of five random flags')
        .setDescriptionLocalizations({ 'es-ES': 'tu sesion diaria de cinco banderas aleatorias' }),
    async execute(interaction, userLanguage) {

        const { connection, activeServers, languageFiles } = interaction.client;
        const { id: serverID } = interaction.guild;
        const { id: userID } = interaction.user;

        const { strings, countries } = languageFiles.get(userLanguage);

        if (activeServers.has(serverID)) {
            interaction.reply(strings["IN_USE"]);
            return;
        }

        const today = new Date();
        const query = { "_id": userID };
        const result = await connection.findOne(query);

        if (result) {
            const lastPlayed = result["last_played"];
            if (formatDate(lastPlayed) === formatDate(today)) {
                interaction.reply(strings['ALREADY_PLAYED']);
                return;
            }
        }

        activeServers.set(serverID, true);

        const attachments = [];

        for (let i = 0; i < 5; i++) {
            const index = Math.floor(Math.random() * countries.length);
            const country = countries.splice(index, 1)[0];
            const flag = new AttachmentBuilder(`src/assets/flags/${country.cca2}.png`);
            const messageEmbed = new EmbedBuilder();
            messageEmbed.setTitle(strings['GUESS']);
            messageEmbed.setImage(`attachment://${country.cca2}.png`);
            messageEmbed.setColor('#FFFFFF');
            const attachment = {
                embed: messageEmbed,
                flag: flag,
                answers: [country.name.official, country.name.common]
            };
            attachments.push(attachment);
        }

        let sessionCorrectAnswers = 0;
        let sessionScore = 0;

        try {
            await interaction.reply(strings['STARTING']);
            let message = null;
            for (const attachment of attachments) {
                const { embed, flag, answers } = attachment;
                if (message) {
                    message.edit({ embeds: [embed], files: [flag] });
                }
                else {
                    message = await interaction.channel.send({ embeds: [embed], files: [flag] });
                }
                const filter = response => {
                    return answers.some(r => normalizeText(r) === normalizeText(response.content) && userID === response.author.id);
                }
                await interaction.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] })
                    .then((collected) => {
                        collected.first().react('✅');
                        sessionScore += 10;
                        sessionCorrectAnswers++;
                    })
                    .catch((err) => {
                    })
            }
            interaction.channel.send(`${strings['CORRECT_ANSWERS'].replace(/%REPL%/g, sessionCorrectAnswers)}. ${strings['POINTS'].replace(/%REPL%/g, sessionScore)}`);
            let values;
            if (result) {
                values = { $set: { "score": result["score"] + sessionScore, "last_played": today, "times_played": result["times_played"] + 1 } };
                await connection.updateOne(query, values);
            }
            else {
                values = { "_id": userID, "score": sessionScore, "last_played": today, "times_played": 1 }
                await connection.insertOne(values)
            }
            activeServers.delete(serverID);
        }
        catch (err) {
            console.log(err);
        }
    }
}