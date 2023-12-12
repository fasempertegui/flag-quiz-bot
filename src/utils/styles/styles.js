const unorm = require('unorm');

function normalizeText(text) {
    return unorm.nfkd(text).replace(/[\u0300-\u036F]/g, '').toLowerCase();
}

function formatDate(date) {
    return date.toISOString().split("T")[0];
}

function addLineBreaks(text, maxCharsPerLine) {
    if (text.length <= maxCharsPerLine) {
        return text;
    } else {
        let words = text.split(" ");
        let result = [];
        let line = [];
        for (let word of words) {
            if ((line.join(" ") + word).length <= maxCharsPerLine) {
                line.push(word);
            } else {
                result.push(line.join(" "));
                line = [word];
            }
        }
        result.push(line.join(" "));
        return result.join("\n");
    }
}

function styleCodeBlock(text) {
    return `\`\`\`${text}\`\`\``
}

module.exports = { normalizeText, formatDate, addLineBreaks, styleCodeBlock }