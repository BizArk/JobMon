var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var cfg = require('./config.js');
var app = express();
var port = cfg.port || 8000;

mongoose.Promise = global.Promise;
mongoose.connect(cfg.mongoConnStr);

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(morgan('dev'));

var Agent = require('./models/agent.js')
//var agentRouter = require('./Routing/agentRoutes.js')(Agent);
//app.use('/api/agents', agentsRouter);

var Job = require('./models/job.js')
var jobRouter = require('./Routing/jobRoutes.js')(Job);
app.use('/api/jobs', jobRouter);

var Instance = require('./models/instance.js')
var instanceRouter = require('./Routing/instanceRoutes.js')(Instance);
app.use('/api/instances', instanceRouter);

app.listen(port, function() {
    console.log ('Running on PORT ' + port);
})