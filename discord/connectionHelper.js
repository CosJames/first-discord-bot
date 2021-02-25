const Discord = require('discord.js');
const client = new Discord.Client();

function connect() {
    return client.login(DISCORD_TOKEN);
}

function ready(callback) {
    client.on('ready', callback);
}

function onMessage(callback) {
    client.on('message', async(message) => {
        callback(message)
    })
}


module.exports = {
    connect: connect,
    ready: ready,
    onMessage: onMessage,
}