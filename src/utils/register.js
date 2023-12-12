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
    const languagesPath = path.join(__dirname, '../assets/localization');
    const languages = fs.readdirSync(languagesPath);
    if (languages.length) {
        for (const language of languages) {
            try {
                const files = {
                    strings: require(`${languagesPath}/${language}/strings.json`),
                    countries: require(`${languagesPath}/${language}/countries.json`)
                }
                client.languageFiles.set(language, files);
            }
            catch (err) {
                throw new Error(`MISSING_FILES (${language})`);
            }
        }
    }
    else {
        throw new Error('NO_LANGUAGE_DIRECTORY');
    }
}

module.exports = { registerCommands, registerEvents, registerLanguages };