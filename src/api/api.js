const Master = { api: {} };

const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');

Master.listCommands = function(data = {}) {
    this.apiCommands = {}

    // const handleApiPath = function(props, params = {}, path = []) {
    //     let apiPath = objget(apiData, ...path);
    //     if (!apiPath) {
    //         let pathData = {
    //             params: {},
    //             commands: {},
    //             access: {}
    //         }
    //         objset(apiData, pathData, ...path)
    //     }
    //     apiPath = objget(apiData, ...path)
    //     for (let [paramName, param] of Object.entries(params)) {
    //         apiPath.params[paramName] = param;
    //     }
    //     if (props.params) {
    //         Object.assign(apiPath.params, props.params)
    //     }
    //     if (props.access && !data.public) {
    //         Object.assign(apiPath.access, props.access)
    //     }
    //     if (props.commands) {
    //         Object.assign(apiPath.commands, props.commands)
    //     }
    //     if (props.paths) {
    //         for (let [ next, nextProps ] of Object.entries(props.paths)) {
    //             path.push(next)
    //             handleApiPath(nextProps, { ...params}, path)
    //             path.pop()
    //         }
    //     }

    // }

    const apiCommands = {};
    const extractCommands = function(props, params = {}, access = {}, path = []) {
        let propsParams = {}
        if (props['.params']) {
            propsParams = { ...props['.params'] }
        }
        let propsAccess = {}
        if (props['.access']) {
            propsAccess = { ...props['.access'] }
        }
        if (props['.commands']) {
            for (let [commandName, command] of Object.entries(props['.commands'])) {
                let fullCommandPath = [...path, commandName];
                let fullCommandName = fullCommandPath.join('.');
                let cmd = {
                    name: fullCommandName,
                    params: { ...params, ...propsParams, ...command.params },
                    description: command.description,
                }
                if (!command.public) {
                    Object.assign(cmd.params, access, propsAccess);
                }
                apiCommands[fullCommandName] = cmd;
            }
        }
        for (let [next, nextProps] of Object.entries(props)) {
            if (next === '.commands') continue;
            if (next === '.access') continue;
            if (next === '.params') continue;
            path.push(next)
            extractCommands(nextProps, { ...params, ...propsParams }, { ...access, ...propsAccess }, path)
            path.pop()
        }
    }
    extractCommands(env.config.api);
    this.apiCommands = apiCommands;
}

Master.onCreate = function(data) {
    data.app.get("/*", (request, response) => {
        if (request.params['0'] && !request.query.command) {
            request.query.command = request.params['0'];
        }
        this.apiCall(request.query, response)
    });
    data.app.get("*", (request, response) => {
        this.apiCall(request.query, response)
    });
    data.app.post("/*", (request, response) => {
        if (request.params['0'] && !request.body.command) {
            request.body.command = request.params['0'];
        }
        this.apiCall(request.body, response)
    });
    data.app.post("*", (request, response) => {
        this.apiCall(request.body, response)
    });
    this.listCommands();
}

Master.apiCall = async function(queryParams, response) {
    let query = process.env.TEST ? JSON.parse(JSON.stringify(queryParams)) : queryParams;
    response.header("Access-Control-Allow-Origin", '*');
    let fullCommand = query.command;
    let params = {};

    let status = false;
    let result;
    try {
        assert(fullCommand, 'API error: No command specified in request');
        let commandConfig = this.apiCommands[fullCommand];
        assert(commandConfig, `API error: Unknown command '${fullCommand}'`);
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
        let commandPath = fullCommand.split('.');
        let commandName = commandPath.pop();
        let ctx = {};
        let current = this.api;
        for (let apiNode of commandPath) {
            current = current[apiNode];
            await current.ctx.call(this, params, ctx)
        }
        result = current[commandName].call(this, params, ctx);
        status = true;
    } catch (error) {
        result = env.test ? error : error.message;
    }
    result = {
        status, 
        data: result
    }
    if (!queryParams.format) {
        response.json(result);
        return;
    }
    if (queryParams.format === 'prettyJson') {
        response.header("Content-Type",'application/json');
        response.send(JSON.stringify(result, null, 2));
    } 
}

Master.api.help = function(params) {
    if (params.paths) return this.apiData;
    return this.apiCommands;
}


module.exports = Master
