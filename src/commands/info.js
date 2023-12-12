const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { normalizeText, addLineBreaks, styleCodeBlock } = require('../utils/styles/styles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('get info about the specified country')
        .setDescriptionLocalizations({ 'es-ES': 'muestra informacion sobre el pais indicado' })
        .addStringOption((option) =>
            option
                .setName('country')
                .setNameLocalizations({ 'es-ES': 'pais' })
                .setDescription('country from which you want to get info')
                .setDescriptionLocalizations({ 'es-ES': 'pais del que quieres obtener informacion' })
                .setRequired(true)
                .addChoices()),
    async execute(interaction, userLanguage) {

        const { languageFiles } = interaction.client;

        const { strings, countries } = languageFiles.get(userLanguage);

        let option = interaction.options.getString('country');
        let country = await countries.find(c => normalizeText(c.name.common) === normalizeText(option) || normalizeText(c.name.official) === normalizeText(option));

        if (!country) {
            interaction.reply(strings['COUNTRY_NOT_VALID']);
            return;
        }

        const messageEmbed = new EmbedBuilder();
        const flagImage = new AttachmentBuilder(`src/assets/flags/${country.cca2}.png`);
        messageEmbed.setAuthor({ name: `${country.name.common.toUpperCase()}`, iconURL: `attachment://${country.cca2}.png` });
        messageEmbed.setImage(`attachment://${country.cca2}.png`);
        messageEmbed.setColor('#e0e0e0');

        let bordersText = '';
        if (country.borders.length) {
            country.borders.forEach(b => bordersText += `${b.flag} ${b.name}\n`);
        }
        else {
            bordersText += strings['DOES_NOT_HAVE'];
        }

        let capitalsText = '';
        if (country.capital.length) {
            country.capital.forEach(c => capitalsText += `${c}\n`);
        }
        else {
            capitalsText += strings['DOES_NOT_HAVE'];
        }

        messageEmbed.addFields(
            {
                name: strings['OFFICIAL_NAME'],
                value: styleCodeBlock(addLineBreaks(country.name.official, 30))
            },
            {
                name: strings['CAPITAL'],
                value: styleCodeBlock(capitalsText)
            },
            {
                name: strings['CONTINENT'],
                value: styleCodeBlock(country.continent),
                inline: true
            },
            {
                name: strings['SUBREGION'],
                value: styleCodeBlock(country.subregion),
                inline: true
            },
            {
                name: strings['BORDERS_WITH'],
                value: bordersText
            },
            {
                name: strings['AREA'],
                value: styleCodeBlock(country.area + 'km²')
            }
        )

        interaction.reply({ embeds: [messageEmbed], files: [flagImage] });

    }
}