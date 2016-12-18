var bodyParser = require('body-parser');
var express = require('express');
var morgan = require('morgan');
var path = require('path');
var debug = require('debug')('jobmon.app');
var request = require('superagent');
var winston = require('winston');

var cfg = require('./config.js');
var jmrouting = require('./routing/routingSetup.js');

// Put the root path into global scope so we can use it for the root directory
// when creating files such as job installs and log files.
global.appRoot = path.resolve(__dirname);
debug('appRoot: ' + global.appRoot);

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));

cfg.jobmonapi

jmrouting(app);

// process.env.PORT is set by host web server (such as IIS).  
var port = process.env.PORT || cfg.port || 8000;
app.listen(port, function () {
    console.log('Running on PORT ' + port);
});

// register the agent with the API.
request
    .post(cfg.jobmonapi + '/agents')
    .send({
        host: cfg.host,
        hostDetails: null,
        url: cfg.url
    })
    .set('Accept', 'application/json')
    .end(function(err, res){
        if (err || !res.ok) {
            winston.error('The agent was unable to register with the JobMon server.');
            if(err && err.response && err.response.body && err.response.body.message) {
                winston.error(err.response.body.message);
            } else {
                winston.error('Please check your configuration and verify that the JobMon server is running.');
            }
            process.exit(1);
        } else {
            
        }
    });

module.exports = app;
