var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var cfg = require('./config.js');
var app = express();
var port = cfg.port || 8000;
var jmdb = require('./models/_jmdb.js');

mongoose.Promise = global.Promise;
mongoose.connect(cfg.mongoConnStr);

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(morgan('dev'));

//var agentRouter = require('./Routing/agentRoutes.js')(Agent);
//app.use('/api/agents', agentsRouter);

var jobRouter = require('./Routing/jobRoutes.js')(jmdb);
app.use('/api/jobs', jobRouter);

var instanceRouter = require('./Routing/instanceRoutes.js')(jmdb);
app.use('/api/instances', instanceRouter);

app.listen(port, function() {
    console.log ('Running on PORT ' + port);
})