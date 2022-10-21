const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');

const Master = {
    api: {},
};

Master.onExpressAppCreated = function(app) {
    app.get("/api", (request, response) => this.apiCall(request.query, response));
    app.post("/api", (request, response) => this.apiCall(request.body, response));
}

Master.onCreate = function(data) {
    this.apiCommands = {};

    const extractCommands = function(command, data, ctx) {
        let oldParams = ctx.params;
        ctx.params = Object.assign({}, ctx.params, data.params);
        if (data.paths) {
            ctx.path.push(command);
            for (let [ command, commandData ] of Object.entries(data.paths)) {
                extractCommands(command, commandData, ctx);
            }
            ctx.path.pop();
        } else {
            ctx.result.push({
                name: ctx.path.concat([command]),
                description: data.description,
                params: ctx.params,
            })
        }
        ctx.params = oldParams;
    }

    for (let { config } of Object.values(data.loadedModules)) {
        let paths = objget(config, 'api', 'paths');
        if (!paths) continue;
        for (let [ path, props ] of Object.entries(paths)) {
            let ctx = {
                path: [],
                params: {},
                result: []
            }
            extractCommands(path, props, ctx)
            for (let cmd of ctx.result) {
                commandName = cmd.name.join('.');
                delete cmd.name;
                this.apiCommands[commandName] = cmd;
            }
        }
    }
}

Master.apiCall = async function(query, response) {
    response.header("Access-Control-Allow-Origin", '*');
    let command = query.command;
    let params = {};

    let status = false;
    let result;
    try {
        assert(command, 'API error: No command specified in request!');
        let commandConfig = this.apiCommands[command];
        assert(commandConfig, `API error: Unknown command ${command}!`);
        if (query.help) {
            return commandConfig;
        }
        if (commandConfig.params) {
            for (let [paramName, paramConfig] of Object.entries(commandConfig.params)) {
                let paramInvalid = paramConfig.required && query[paramName] === undefined;
                assert(!paramInvalid, `API error: Missing param '${paramName}'`);
                let value = query[paramName];
                if (paramConfig.type === 'json' && typeof value === 'string') {
                    value = JSON.parse(value);
                }
                params[paramName] = value;
            }
        }
        let cmd = this.api[command];
        assert(cmd, `API error: Command ${command} has no callback!`);
        result = await cmd.call(this, params);
        status = true;
    } catch (error) {
        result = error;
    }
    response.json({
        status, 
        data: result
    })
}

Master.api['help'] = function() {
    return {
        commands: this.apiCommands,
    }
}

module.exports = Master
