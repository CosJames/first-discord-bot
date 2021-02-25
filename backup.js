const Discord = require('discord.js');
const client = new Discord.Client();
const commands = require('./commands.json')
const  { token } = require('./config.json')

const ytdl = require('ytdl-core')
const { YTSearcher } = require('ytsearcher');
const searcher = new YTSearcher({
    key: 'AIzaSyBaQXgpJsjbEqLh6MZMMhIvEATZFnr4L4M',
    revealed: true
})

const queue = new Map();




client.once('ready', () => {
	console.log('Bot Fully Setup!');
});


client.on('message', async(message) => {
    const prefix = '!';

    // get the map of the server id
    const serverQueue = queue.get(message.guild.id)
    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase()
       
    switch(command) {
        case 'play':
            addSong(message, serverQueue)
            break
        case 'stop':
            stopSong(message, serverQueue)
            break
        case 'skip':
            skipSong(message, serverQueue)
            break
    } 



    
    async function addSong(message, serverQueue) {
        // Check if user in voice chat
        let vc = message.member.voice.channel 
    
        if (!vc) {
            return message.channel.send('**Please join a voice chat first**')
        } else {
            // Search for a video
            let result = await searcher.search(args.join(" "), { type: 'video'})
            //message.channel.send('**Result : **' + result.first.url)
            const songInfo = await ytdl.getInfo(result.first.url)
        
            let song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url
            }
            // If No server queue
            if(!serverQueue) {
                let queueConstructor = {
                    txtChannel: message.channel,
                    vChannel: vc,
                    // No Connection before it
                    connection: null,
                    // No songs default
                    songs: [],
                    volume: 10,
                    playing: true,
                }

                queue.set(message.guild.id, queueConstructor)
                queueConstructor.songs.push(song)

                try {
                    let connection = await vc.join()
                    queueConstructor.connection = connection
                    play(message.guild, queueConstructor.songs[0])
                } catch (err) {
                    console.error(err)
                    queue.delete(message.guild.id)
                    return message.channel.send('**Unable to join the voice chat : **' + error)
                }
            } else {
                serverQueue.songs.push(song)
                return message.channel.send('**The song has been added to the playlist : **' + song.url)
            }
        
        }

        
    }
    
    // Play a song
    async function play(guild, song) {
        console.log(song)
        const serverQueue = queue.get(guild.id)

        if (!song) {
            serverQueue.vChannel.leave()
            queue.delete(guild.id)
            message.channel.send('Playlist done...')
            return
        }

        const dispatcher = serverQueue.connection
                                .play(ytdl(song.url))
                                .on('finish', () => {
                                    console.log('Done')
                                    serverQueue.songs.shift()
                                    play(guild, serverQueue.songs[0])
                                })
        serverQueue.txtChannel.send(`Now playing ${serverQueue.songs[0].url}`)

    }
    
    function stopSong(message, serverQueue) {
        if(!message.member.voice.channel) 
            return message.channel.send('**You need to join the voice channel first**')
        serverQueue.songs = []
        serverQueue.connection.dispatcher.end()   
    }

    function skipSong(message, serverQueue) {
        if(!message.member.voice.channel)
            return message.channel.send('**You need to join the voice channel first**')
        if(!serverQueue)
            return message.channel.send('**There is nothing to skip**')
        serverQueue.connection.dispatcher.end()   
    }

    
    
    if (message.author.username === 'CoDaniel') {
        administratorPowers(message)
    } 

    function administratorPowers(message) {
        if (message.content.includes('!deleteMessages')) {
            let count = message.content.replace('!deleteMessages ', '')
            message.channel.send('**Administrator Command : Deleting ' + count + ' messages...**')
    
            setTimeout(() => {
                client.channels.cache.get(message.channel.id).messages.fetch({ limit: count + 1 })
                    .then(messages => {
                        message.channel.bulkDelete(messages).catch(error => console.log(error.stack));
                        message.channel.send('** Administrator deleted ' + count + ' messages**')
                    });
            }, 3000)
        }
    }
    
    function memberPowers(message) {
        if(message.content.charAt(0) == prefix) {
            if(message.content.includes(`${prefix}bc`)) {
                if (message.content.charAt(1) === 'b' && message.content.charAt(2) === 'c') {
                    message.delete()
                    let string = '!bc'
                    let remove = message.content.replace(string, '')
                    message.channel.send('****' + message.author.username + ' Broadcasted :' + remove +'**')
                }
            }
    
            if(message.content.includes(`${prefix}?`)) {
                if (message.content.charAt(1) === '?') {
                    let divider = '--------------------------------'
                    let string = divider + '\nHere are the command lines : \n'
                    commands.commands.forEach(item => {
                        string += '**'+item.command+ ' - ' + item.description + '**\n'
                    })
                    string += divider
                    message.channel.send(string)
                }
            }
        }
    }
    memberPowers(message)
});


client.login(token);


