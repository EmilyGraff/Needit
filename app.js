var express  = require('express')
var http     = require('http')
var path     = require('path')

var config        = require('./config')
var routes        = require('./routes')
var users         = require('./routes/users')
var conversations = require('./routes/conversations')

var app = express()

process.on('uncaughtException', function (exception) {
  console.error(exception.stack)
})

// all environments
app.set('port', process.env.PORT || config.port)
app.use(express.logger('dev'))
app.use(express.json())
app.use(express.urlencoded())
app.use(express.methodOverride())
app.use(app.router)
  app.use(function (err, req, res, next) {
  	console.error(err.stack)
  	res.send(500)
 })

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler())
}

// Users
app.get(routes.users.getAll, users.getAll)
app.get(routes.users.getOne, users.getOne)
app.post(routes.users.post,  users.post)

// Messages
app.get(routes.conversations.getAll, conversations.getAll)
app.get(routes.conversations.getOne, conversations.getOne)
app.post(routes.conversations.post, conversations.post)
app.put(routes.conversations.addTrader, conversations.addTrader)
app.put(routes.conversations.addMessage, conversations.addMessage)


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'))
})
