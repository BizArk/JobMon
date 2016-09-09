var bodyParser = require('body-parser');
var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var path = require('path');
var debug = require('debug')('jobmon.app');

var cfg = require('./config.js');
var jmdb = require('./models/_jmdb.js');
var jmrouting = require('./routing/routingSetup.js'); 

// Put the root path into global scope so we can use it for the root directory
// when creating files such as job installs and log files.
global.appRoot = path.resolve(__dirname);
debug('appRoot: ' + global.appRoot);

mongoose.Promise = global.Promise;
mongoose.connect(cfg.mongoConnStr);

var app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(express.static(cfg.dashboardPath));
app.use('/downloads', express.static(cfg.downloadPath));

jmrouting(app, jmdb);

// process.env.PORT is set by host web server (such as IIS).  
var port = process.env.PORT || cfg.port || 8000;
app.listen(port, function() {
    console.log ('Running on PORT ' + port);
});

module.exports = app;
