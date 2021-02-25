function checkIfAdministratorUsePower(command, message) {
    switch(command) {
        case 'deleteMessages':
            deleteMessages(message)
            break
    }
}

function deleteMessages(message) {
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

module.exports = {
    checkIfAdministratorUsePower: checkIfAdministratorUsePower
}