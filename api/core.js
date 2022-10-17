const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');

const Master = {};

Master.onDelete = function(data) {
    this.apiListener.close();
}

Master.onCreate = function (data) {
    this.apiCommands = {}
    const PORT = process.env.API_PORT || 5000;
    const app = express();
    app.use(bodyParser.urlencoded({ limit: "1mb", extended: true }));
    app.use(bodyParser.json({ limit: "1mb" }));
    app.use(cors());
    app.get("/api", (request, response) => this.apiCall(request.query, response));
    app.post("/api", (request, response) => this.apiCall(request.body, response));
    this.apiListener = app.listen(PORT);

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

    for (let { config } of Object.values(this.loadedModules)) {
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

Master.apiCall = function(query, response) {
    let command = query.command;
    let params = {};

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
    } catch (e) {
        response.json({
            status: false,
            data: e.message,
        })
    }
    this.create(ApiRequest, {
        id: uuid(),
        response,
        commandPath: command.split('.'),
        params,
    });
}

module.exports = Master
