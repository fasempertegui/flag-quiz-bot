const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { normalizeText, addLineBreaks, styleCodeBlock } = require('../utils/styles/styles.js');

function findCountry(countries, option) {
    let country = null;
    for (const countryCode in countries) {
        const c = countries[countryCode];
        const countryNames = c.names.map(name => normalizeText(name));
        if (countryNames.includes(normalizeText(option))) {
            country = c;
            break;
        }
    }
    return country;
}

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
        ),
    async execute(interaction, userLanguage) {

        const strings = require(`../locales/${userLanguage}/strings.json`);
        const countries = require(`../locales/${userLanguage}/countries.json`);

        const option = interaction.options.getString('country');
        const country = findCountry(countries, option);
        if (!country) return interaction.reply(strings['COUNTRY_NOT_FOUND']);

        const flagFile = `${country.flag_code}.png`;
        const flagPath = `src/assets/flags/${flagFile}`;
        const flagURL = `attachment://${flagFile}`;
        const flag = new AttachmentBuilder(flagPath);

        let borders = '';
        if (country.borders.length) {
            for (const countryCode of country.borders) {
                const c = countries[countryCode];
                borders += `${c.flag_emoji} ${c.names[1]}\n`;
            }
        }
        else borders += strings['DOES_NOT_HAVE'];

        let capital = '';
        if (country.capital.length) {
            for (const c of country.capital) {
                capital += `${c}\n`;
            }
        }
        else capital += strings['DOES_NOT_HAVE'];

        const embed = new EmbedBuilder()
            .setAuthor({ name: country.names[1].toUpperCase(), iconURL: flagURL })
            .setImage(flagURL)
            .setColor('#e0e0e0')
            .addFields(
                { name: strings['OFFICIAL_NAME'], value: styleCodeBlock(addLineBreaks(country.names[0], 30)) },
                { name: strings['CAPITAL'], value: styleCodeBlock(capital) },
                { name: strings['CONTINENT'], value: styleCodeBlock(country.continent), inline: true },
                { name: strings['REGION'], value: styleCodeBlock(country.region), inline: true },
                { name: strings['BORDERS_WITH'], value: borders },
                { name: strings['AREA'], value: styleCodeBlock(country.area + ' km²') }
            );
        interaction.reply({ embeds: [embed], files: [flag] });
    }
}