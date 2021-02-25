function checkIfMemberUsePower(command, message, client) {

    switch(command){
        case 'bc':
            broadcast(message, client)
            break
    }
}
function broadcast(message, client) {
    const megaphone = client.emojis.cache.get('814508968957182012').toString()
    const replace = message.content.replace('!bc', '')
    message.delete()
    message.channel.send(megaphone + ' ****' + message.author.username + ' Broadcasted :' + replace +'**')

}

module.exports = {
    checkIfMemberUsePower: checkIfMemberUsePower
}