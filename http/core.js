const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');

const Master = {}

Master.onCreate = function (data) {
	const app = express();
    app.use(bodyParser.urlencoded({ limit: "1mb", extended: true }));
    app.use(bodyParser.json({ limit: "1mb" }));
    app.use(cors());
    this.execAllMixins('onExpressAppCreated', app);
    httpServer = require('http').createServer(app);
    this.execAllMixins('onHttpServerCreated', httpServer);
    this.httpServer = httpServer;
    this.httpServer.listen(process.env.PORT || 5000);
}

Master.onDelete = function(data) {
    this.httpServer.close();
}

module.exports = Master
