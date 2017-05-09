var express = require('express');

var app = express();

var port = process.env.PORT || 8042;
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
//var db = require('./config/database.js');

//set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
//app.use(bodyParser()); // get information from html forms

//view engine setup
var engine = require('ejs-locals');
app.use(express.static(path.join(__dirname, 'public')));
// use ejs-locals for all ejs templates:
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');
//app.set('view engine', 'ejs'); // set up ejs for templating

// routes ======================================================================
//require('./config/routes.js');
//app.use('/', express.static(__dirname + '/public'));
var index = require('./config/routes.js');
app.use('/', index);

//launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);

//catch 404 and forward to error handler
app.use(function (req, res, next) {
    res.status(404).render('404', {title: "Sorry, page not found", session: req.sessionbo});
});

app.use(function (req, res, next) {
    res.status(500).render('404', {title: "Sorry, page not found"});
});
exports = module.exports = app;