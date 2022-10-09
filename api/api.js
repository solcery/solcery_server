const express = require("express");

const Dweller = {};

Dweller.onCreate = function(data) {
    this.commands = {}
    const PORT = process.env.API_PORT || 5000;
    const app = express();
    app.get("/api", (request, response) => this.apiGetRequest(request, response));
    app.listen(PORT, function () {
        console.error(`Node ${process.pid}: listening on port ${PORT}`);
    });
    for (let { config } of Object.values(this.core.loadedModules)) {
        let commands = objget(config, 'api', 'commands');
        if (!commands) continue;
        for (let [ commandName, commandData ] of Object.entries(commands)) {
            this.commands[commandName] = commandData;
        }
    }
}

Dweller.sendResult = function(result, response) {
    response.header("Access-Control-Allow-Origin", '*');
    response.json(result)
}

Dweller.apiGetRequest = function(request, response) {
    let res = this.apiCall(request.query);
    this.sendResult(res, response);
}

Dweller.apiCall = function(query) {
    let command = query.command;
    let params = {};
    let result = {};
    try {
        if (query.help && !command) {
            return this.commands;
        }
        assert(command, 'API error: No command specified in request!');
        let commandConfig = this.commands[command];
        assert(commandConfig, `API error: Unknown command ${command}!`);
        if (query.help) {
            return commandConfig;
        }
        if (commandConfig.params) {
            for (let [paramName, paramConfig] of Object.entries(commandConfig.params)) {
                let paramInvalid = paramConfig.required && query[paramName] === undefined;
                console.log(paramInvalid)
                assert(!paramInvalid, `API error: Missing param '${paramName}'`);
                params[paramName] = query[paramName];
            }
        }
        this.execAllMixins('onCommand', command, result, params);
    } catch (e) {
        console.error(e)
        return {
            status: false,
            data: e.message,
        }
    }
    return {
        status: true,
        data: result,
    }
}

module.exports = Dweller
