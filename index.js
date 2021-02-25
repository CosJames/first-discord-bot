const Discord = require('discord.js');
const AdministratorPowers = require('./commands/AdministratorPowers');
const client = new Discord.Client();
let { SongQueue, MemberPowers } = require('./commands/index')
let { DISCORD_TOKEN } = require('./config.json')
const queue = new Map();

client.on('ready', () => { console.log('Bot Fully Setup!') });
client.on('message', async(message) => { checkCommand(message) });
client.login(DISCORD_TOKEN);

function checkCommand(message) {
    const prefix = '!';
    // get the map of the server id
    const serverQueue = queue.get(message.guild.id)
    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase()
       
    switch(command) {
        case 'play':
            SongQueue.addSong(args, queue, message, serverQueue, client)
            break
        case 'stop':
            SongQueue.stopSong(message, serverQueue)
            break
        case 'skip':
            SongQueue.skipSong(message, serverQueue)
            break
        case 'queue':
            SongQueue.getSongQueue(message, serverQueue, client)
            break
        default:
            MemberPowers.checkIfMemberUsePower(command, message, client)

            if (message.author.username === 'CoDaniel') {
                AdministratorPowers.checkIfAdministratorUsePower(command, message)
            } 
            break
    } 
}


