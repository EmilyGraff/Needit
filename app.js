var express  = require('express')
var http     = require('http')
var path     = require('path')

var config   = require('./config')
/*var routes   = require('./routes')
var users    = require('./routes/users')
var messages = require('./routes/messages')*/

var app = express()

process.on('uncaughtException', function (exception) {
  console.error(exception);
})

// all environments
app.set('port', process.env.PORT || config.port)
app.use(express.logger('dev'))
app.use(express.json())
app.use(express.urlencoded())
app.use(express.methodOverride())
app.use(app.router)
  app.use(function (err, req, res, next) {
  	console.error(err)
  	res.send(500)
 })

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler())
}

// Users
app.get('/users', function (req, res) {

})

// Messages
app.get('/messages/:id', function (req, res) {

})

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'))
})
