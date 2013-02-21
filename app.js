var express = require('express')
  , http = require('http');
var app     = module.exports = express();
var server  = require('http').createServer(app);
var nforce  = require('nforce');

var port    = process.env.PORT || 5000;
var host	= process.env.HOST || 'http://localhost';
var key		= process.env.KEY || '';
var secret	= process.env.SECRET || '';

var org = nforce.createConnection({
  clientId: key,
  clientSecret: secret,
  redirectUri: host+':'+port+'/oauth/_callback'
});

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.engine('html', require('ejs').renderFile);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'nforce testing baby' }));
  app.use(org.expressOAuth({onSuccess: '/welcome', onError: '/oauth/error'}));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/oauth/authorize', function(req, res){
  res.redirect(org.getAuthUri());
});

app.get('/', function(req, res) {
    res.render('index.html');
});

app.get('/welcome', function(req, res) {
    res.render('query.html');
});

app.get('/query', function(req, res) {
  var query = 'SELECT Id, Name, CreatedDate FROM Account ORDER BY Name Asc';
  org.query(query, req.session.oauth, function(err, resp) {
    if(!err) {
        res.send(resp.records);
    } else {
        res.send(err.message);
    }
  });
});

app.listen(port);
console.log("Demo server listening on port " + port);