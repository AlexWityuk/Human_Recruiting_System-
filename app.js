var express = require('express');

var app = express();

var port = process.env.PORT || 5000;
var path = require('path');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var dateFormat = require('dateformat');
var now = new Date();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
var methodOverride = require('method-override')
app.use(methodOverride('_method'))

/***************Postgresql configuratrion********************/
//set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)

//view engine setup
app.use(express.static(path.join(__dirname, 'public')));

// routes ======================================================================
var index = require('./config/routes.js');
app.use('/', index);

//launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);

exports = module.exports = app;