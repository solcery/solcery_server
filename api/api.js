const express = require("express");

const Dweller = {};

Dweller.onCreate = function(data) {
    console.log('onCreate: ', this);
    const PORT = process.env.API_PORT || 5000;
    const app = express();
    app.get("/api", (request, response) => this.apiGetRequest(request, response));
    app.listen(PORT, function () {
        console.error(`Node ${process.pid}: listening on port ${PORT}`);
  });
}

Dweller.apiGetRequest = function(request, response) {
    let params = request.query;
    params.moduleName = request.params['0'];
    let result = {
        status: true
    }
    this.execAllMixins('onApiCall', { params, result });
    response.header("Access-Control-Allow-Origin", '*');
    response.json(result)
    // apiCall(response, request.body);
}

Dweller.onApiCall = function(data) {
    // if (!data.params.username) {
    //     data.result.status = false;
    //     data.result.error = 'No username provided';
    //     return;
    // }
    // data.result.message = `Hello, ${data.params.username}!`;
}

module.exports = Dweller
