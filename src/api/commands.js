const Master = { entrypoints: {}, commands: {} }

Master.entrypoints.api = function (params) {
    return this;
}

Master.commands.help = function(params) {
    if (params.paths) return this.apiData;
    return this.apiCommands;
}

module.exports = Master;
