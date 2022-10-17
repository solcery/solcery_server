const Master = {};

Master.onCreate = function(data) {
    this.response = data.response;
    this.params = data.params;
    this.commandPath = data.commandPath;
    try {
        this.run(this, [...data.commandPath], data.params);
    } catch (e) {
        this.failure(e);
    }
}

Master.success = function(data) {
    this.respond({
        status: true,
        data,
    }) 
}

Master.failure = function(error) {
    this.respond({
        status: false,
        data: error.message
    })
}

Master.respond = function(result) {
    this.response.json(result)
}

Master.run = function(current, commandPath, params) {
    if (commandPath.length === 0) {
        this.success(current);
        return;
    }
    let command = commandPath.shift();
    let func = current[command];
    if (func.constructor.name === 'AsyncFunction') {
        func.call(current, params).then(next => {
            this.run(next, commandPath, params);
        })
    } 
    if (func.constructor.name === 'Function') {
        let next = func.call(current, params);
        this.run(next, commandPath, params)
    }
}

Master.help = async function() {
    return {
        commands: this.core.apiCommands,
    }
}

module.exports = Master
