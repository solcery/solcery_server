const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');

const Master = {};

Master.onDelete = function(data) {
    this.apiListener.close();
}

Master.onCreate = function(data) {
    this.apiCommands = {}
    const PORT = process.env.API_PORT || 5000;
    const app = express();
    app.use(bodyParser.urlencoded({ limit: "1mb", extended: true }));
    app.use(bodyParser.json({ limit: "1mb" }));
    app.use(cors());
    app.get("/api", (request, response) => this.getRequest(request, response));
    app.post("/api", (request, response) => this.postRequest(request, response));
    this.apiListener = app.listen(PORT);

    const exportCommands = function(command, data, ctx) {
        let oldParams = ctx.params;
        ctx.params = Object.assign({}, ctx.params, data.params);
        if (data.paths) {
            ctx.path.push(command);
            for (let [ command, commandData ] of Object.entries(data.paths)) {
                exportCommands(command, commandData, ctx);
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

    for (let { config } of Object.values(this.core.loadedModules)) {
        let paths = objget(config, 'api', 'paths');
        if (!paths) continue;
        for (let [ path, props ] of Object.entries(paths)) {
            let ctx = {
                path: [],
                params: {},
                result: []
            }
            exportCommands(path, props, ctx)
            for (let cmd of ctx.result) {
                commandName = cmd.name.join('.');
                delete cmd.name;
                this.apiCommands[commandName] = cmd;
            }
        }
    }
}

Master.sendResult = function(result, response) {
    response.header("Access-Control-Allow-Origin", '*');
    response.json(result)
}

Master.getRequest = async function(request, response) {
    let res = await this.apiCall(request.query);
    this.sendResult(res, response);
}

Master.postRequest = async function(request, response) {
    let res = await this.apiCall(request.body);
    this.sendResult(res, response);
}

Master.apiCall = async function(query) {
    let command = query.command;
    let data = {
        params: {},
    }
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
                data.params[paramName] = value
                objset(data, value, paramName);
            }
        }
        let commandPath = command.split('.');
        // TODO: Check for responses
        await this.execAllMixins('onApiCommand', commandPath, data)
    } catch (e) {
        return {
            status: false,
            data: e.message,
        }
    }
    return {
        status: true,
        data: data.result,
    }
}

Master.onApiCommand = async function(commandPath, data) {
    if (commandPath[0] !== 'help') return;
    data.result = {
        commands: this.apiCommands,
    }
}

module.exports = Master
