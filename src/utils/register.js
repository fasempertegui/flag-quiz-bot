const fs = require('node:fs');
const path = require('node:path');

async function registerCommands(client) {
    const commands = [];
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        }
        else console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
    return commands;
}

async function registerEvents(client) {
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

async function registerLanguages(client) {
    const languagesPath = path.join(__dirname, '../locales');
    const languages = fs.readdirSync(languagesPath);
    if (languages) {
        for (let language of languages) {
            const languagePath = path.join(languagesPath, language);
            const files = fs.readdirSync(languagePath);
            if (!files.includes("countries.json")) {
                throw new Error(`MISSING COUNTRIES FOR ${language}`);
            }
            if (!files.includes("strings.json")) {
                throw new Error(`MISSING STRINGS FOR ${language}`);
            }
            client.languages.push(language);
        }
    }
    else {
        throw new Error('MISSING LANGUAGE FOLDER(S) IN src/locales');
    }
}

module.exports = { registerCommands, registerEvents, registerLanguages };