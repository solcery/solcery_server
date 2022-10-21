const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');

const Master = {
    api: {},
};

Master.onCreate = function(data) {
    const apiData = {
        params: {},
        commands: {}
    }
    const apiCommands = {};

    const handleApiPath = function(props, params = {}, path = []) {
        let apiPath = objget(apiData, ...path);
        if (!apiPath) {
            let data = {
                params: {},
                commands: {}
            }
            objset(apiData, data, ...path)
        }
        apiPath = objget(apiData, ...path)
        for (let [paramName, param] of Object.entries(params)) {
            apiPath.params[paramName] = param;
        }
        if (props.params) {
            for (let [paramName, param] of Object.entries(props.params)) {
                apiPath.params[paramName] = param;
            }
        }
        if (props.commands) {
            for (let [commandName, command] of Object.entries(props.commands)) {
                apiPath.commands[commandName] = command
            }
        }
        if (props.paths) {
            for (let [ next, nextProps ] of Object.entries(props.paths)) {
                path.push(next)
                handleApiPath(nextProps, { ...params}, path)
                path.pop()
            }
        }

    }

    const extractCommands = function(props, params = {}, path = []) {
        let propsParams = {}
        if (props.params) {
            propsParams = { ...props.params }
            delete props.params
        }
        if (props.commands) {
            for (let [commandName, command] of Object.entries(props.commands)) {
                let fullCommandPath = [...path, commandName];
                let fullCommandName = fullCommandPath.join('.');
                apiCommands[fullCommandName] = {
                    name: fullCommandName,
                    params: { ...params, ...propsParams, ...command.params },
                    description: command.description,
                }
            }
            delete props.commands
        }
        for (let [next, nextProps] of Object.entries(props)) {
            path.push(next)
            extractCommands(nextProps, { ...params, ...propsParams }, path)
            path.pop()
            
        }
    }

    for (let { config } of Object.values(data.loadedModules)) {
        let apiConfig = objget(config, 'api');
        if (!apiConfig) continue;
        handleApiPath(apiConfig);
    }
    extractCommands(apiData);

    data.app.get("/api/*", (request, response) => {
        if (request.params['0'] && !request.query.command) {
            request.query.command = request.params['0'];
        }
        console.log(request.query)
        this.apiCall(request.query, response)
    });
    data.app.post("/api/*", (request, response) => {
        if (request.params['0'] && !request.body.command) {
            request.body.command = request.params['0'];
        }
        this.apiCall(request.body, response)
    });
    this.apiCommands = apiCommands;
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
        result = error.message;
    }
    response.json({
        status, 
        data: result
    })
}

Master.api['api.help'] = function() {
    return {
        commands: this.apiCommands,
    }
}

module.exports = Master
