const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { normalizeText, formatDate } = require('../utils/styles/styles.js');

function inUse(activeServers, serverID) {
    return activeServers.includes(serverID)
}

async function findPlayer(connection, userID) {
    const query = { "_id": userID };
    const result = await connection.findOne(query);
    return result;
}

function canPlay(player) {
    const today = formatDate(new Date())
    const lastPlayed = player["last_played"];
    return !(lastPlayed == today)
}

function buildTrivia(userLanguage, strings) {
    const countries = require(`../locales/${userLanguage}/countries.json`);
    const keys = Object.keys(countries);
    const trivia = [];
    for (let i = 0; i < 3; i++) {
        const index = Math.floor(Math.random() * keys.length);
        const key = keys[index];
        const country = countries[key];
        keys.splice(index, 1);
        const flagFile = `${country.flag_code}.png`;
        const flagPath = `src/assets/flags/${flagFile}`;
        const flagURL = `attachment://${flagFile}`;
        const flag = new AttachmentBuilder(flagPath);
        const embed = new EmbedBuilder()
            .setTitle(strings["GUESS"])
            .setImage(flagURL)
            .setColor("#FFFFFF");
        const answers = country.names.map(nombre => normalizeText(nombre));
        const t = { embed: embed, flag: flag, answers: answers };
        trivia.push(t);
    }
    return trivia
}

async function updatePlayer(connection, player, score) {
    const today = formatDate(new Date())
    const filter = { "_id": player["_id"] }
    const update = { $set: { "score": player["score"] + score, "last_played": today, "times_played": player["times_played"] + 1 } }
    await connection.updateOne(filter, update)
}

async function createPlayer(connection, userID, score) {
    const today = formatDate(new Date())
    const player = { "_id": userID, "score": score, "last_played": today, "times_played": 1 }
    await connection.insertOne(player)
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('your daily session of three random flags')
        .setDescriptionLocalizations({ 'es-ES': 'tu sesion diaria de tres banderas aleatorias' }),
    async execute(interaction, userLanguage) {

        const strings = require(`../locales/${userLanguage}/strings.json`)
        let { activeServers } = interaction.client

        if (inUse(activeServers, interaction.guild.id)) return interaction.reply(strings["IN_USE"]);

        const { connection } = interaction.client;
        const player = await findPlayer(connection, interaction.user.id);
        if (player && !canPlay(player)) return interaction.reply(strings['ALREADY_PLAYED']);

        activeServers.push(interaction.guild.id)

        const trivia = buildTrivia(userLanguage, strings)

        let correctAnswers = 0;
        try {
            await interaction.reply(strings['STARTING']);
            let message;
            for (const t of trivia) {
                const { embed, flag, answers } = t;
                if (!message) message = await interaction.channel.send({ embeds: [embed], files: [flag] });
                else await message.edit({ embeds: [embed], files: [flag] });
                const filter = response => { return answers.some(ans => ans === normalizeText(response.content) && interaction.user.id === response.author.id); }
                await interaction.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] })
                    .then(async (collected) => {
                        await collected.first().react('✅');
                        correctAnswers++;
                    })
                    .catch((err) => {
                    })
            }
            activeServers.splice(activeServers.indexOf(interaction.guild.id), 1);
            let score = correctAnswers * 10;
            if (player) await updatePlayer(connection, player, score);
            else await createPlayer(connection, interaction.user.id, score);
            await message.delete();
            await interaction.channel.send(`<@${interaction.user.id}>, ${strings['CORRECT_ANSWERS'].replace(/%REPL%/g, correctAnswers)}. ${strings['POINTS'].replace(/%REPL%/g, score)}`);
        }
        catch (err) {
            console.log(err);
        }
    }
}