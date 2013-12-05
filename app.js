var express = require('express')
var config = require('./config')
var routes = require('./routes')
var users = require('./routes/users')
var messages = require('./routes/messages')
var http = require('http')
var path = require('path')

var app = express()

// all environments
app.set('port', process.env.PORT || config.PORT)
app.use(express.favicon())
app.use(express.logger('dev'))
app.use(express.json())
app.use(express.urlencoded())
app.use(express.methodOverride())
app.use(app.router)
app.use(express.static(path.join(__dirname, 'public')))

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler())
}

// Users
app.get(routes.user.getAll, users.getAll)

// Messages
app.get(routes.messages.getById..., messages.findOne)

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'))
})
