const ytdl = require('ytdl-core')
const { YTSearcher } = require('ytsearcher');
const { YT_TOKEN } = require('../config.json')
const searcher = new YTSearcher({
    key: YT_TOKEN,
    revealed: true
})


/**
 * @description Add a song to the playlist
 * @param {*} args 
 * @param {*} queue 
 * @param {*} message 
 * @param {*} serverQueue 
 */
async function addSong(args, queue, message, serverQueue, client) {
    // Check if user in voice chat
    let vc = message.member.voice.channel 

    if (!vc) {
        return message.channel.send('**Please join a voice chat first**')
    } else {
        try {
            // Search for a video
            let result = await searcher.search(args.join(" "), { type: 'video'})
            //message.channel.send('**Result : **' + result.first.url)
            const songInfo = await ytdl.getInfo(result.first.url)
                .catch(error => { 
                    console.log(error)
                })
        
            let song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url
            }
            // If No server queue
            if(!serverQueue) {
                const queueConstructor = {
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
                    playSong(queue, message.guild, queueConstructor.songs[0], client)
                } catch (err) {
                    console.error(err)
                    queue.delete(message.guild.id)
                    return message.channel.send('**Unable to join the voice chat : **' + error)
                }
            } else {
                serverQueue.songs.push(song)
                return message.channel.send('**The song has been added to the playlist : ** *'+ song.title + '*')
            }
        } catch(error) {
            message.channel.send('** An error occured **')
            message.channel.send('`'+error.message+'`')
        }
    
    }      
}

/**
 * @description Plays a song in the playlist
 * @param {*} queue 
 * @param {*} guild 
 * @param {*} song 
 */
function playSong(queue, guild, song, client) {
    const serverQueue = queue.get(guild.id)
    const sad = client.emojis.cache.get('814510838350086154').toString()
    const megaphone = client.emojis.cache.get('814508968957182012').toString()

    if (!song) {

        serverQueue.vChannel.leave()
        queue.delete(guild.id)
        serverQueue.txtChannel.send(sad + ' ** There is no more music in the playlist...**')
        return
    }

    const dispatcher = serverQueue.connection
                            .play(ytdl(song.url))
                            .on('finish', () => {
                                serverQueue.songs.shift()
                                playSong(queue, guild, serverQueue.songs[0], client)
                            })

    serverQueue.txtChannel.send(megaphone + ` **Now playing :** *${serverQueue.songs[0].title}*`)
    serverQueue.connection.dispatcher = dispatcher
}

/**
 * @description Stop the music in the playlist and make the bot leave the channel
 * @param {*} message 
 * @param {*} serverQueue 
 */
function stopSong(message, serverQueue) {
    if(!message.member.voice.channel) 
        return message.channel.send('**You need to join the voice channel first**')
    serverQueue.songs = []
    serverQueue.connection.dispatcher.end()   
}

/**
 * @description End the song and it will shift to the next song if there's any
 * @param {*} message 
 * @param {*} serverQueue 
 */
function skipSong(message, serverQueue) {
    if(!message.member.voice.channel)
        return message.channel.send('**You need to join the voice channel first**')
    if(!serverQueue)
        return message.channel.send('**There is nothing to skip...**')
    serverQueue.connection.dispatcher.end()   
}

function getSongQueue( message, serverQueue, client) {  
    if(serverQueue) {
        let constructor = ''
        constructor += `** Song Queue :** \n`
        serverQueue.songs.forEach((item, index) => {
            if (index == 0) {
                constructor += `> Now Playing : *${item.title}* \n`
            } else if (index == 1) {
                constructor += `> Up Next : *${item.title}* \n`
            } else {
                constructor += `> *${item.title}* \n`
            }
        })
        return message.channel.send(constructor)
    } else {
        const sad = client.emojis.cache.get('814510838350086154').toString()
        return message.channel.send(sad + '** There is no music in the queue...**')
    }
}

module.exports = {
    addSong: addSong,
    stopSong: stopSong,
    skipSong: skipSong,
    getSongQueue: getSongQueue,
}
