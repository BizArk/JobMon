var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var cfg = require('./config.js');
var port = cfg.port || 8000;
var jmdb = require('./models/_jmdb.js');
var jmrouting = require('./routing/routingSetup.js'); 

mongoose.Promise = global.Promise;
mongoose.connect(cfg.mongoConnStr);

var app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(express.static(cfg.dashboardPath));

jmrouting(app, jmdb);

app.listen(port, function() {
    console.log ('Running on PORT ' + port);
});
