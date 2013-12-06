var express  = require('express')
var http     = require('http')
var path     = require('path')

var config        = require('./config')
var err     	  = require('./lib/APIError')
var routes        = require('./routes')
var users         = require('./routes/users')
var conversations = require('./routes/conversations')

var app = express()

process.on('uncaughtException', function (exception) {
  console.error(exception.stack)
})

// all environments
app.set('views', __dirname + '/views') // html files
app.engine('html', require('ejs').renderFile)
app.use(express.static(__dirname + '/public'))
app.set('port', process.env.PORT || config.port)
app.use(express.logger('dev'))
app.use(express.json())
app.use(express.urlencoded())
app.use(express.methodOverride())
app.use(app.router)
app.use(function (err, req, res, next) {
	err.handleError(res)
})

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler())
}

// Views
app.get('/', function (req, res) {
	res.render('index.html')
})
app.get('/login', function (req, res) {
	res.render('login.html')
})

// Users
app.get(routes.users.getAll, users.getAll)
app.get(routes.users.getOne, users.getOne)
app.post(routes.users.post,  users.post)
app.post(routes.users.addTrade, users.addTrade)
app.post(routes.users.addNeed, users.addNeed)
app.post(routes.users.addNotification, users.addNotification)
app.post(routes.users.addComment, users.addComment)
app.post(routes.users.addTransaction, users.addTransaction)

// Messages
app.get(routes.conversations.getAll, conversations.getAll)
app.get(routes.conversations.getOne, conversations.getOne)
app.get(routes.conversations.getByNeeder, conversations.getByNeeder)
app.post(routes.conversations.post, conversations.post)
app.put(routes.conversations.addTrader, conversations.addTrader)
app.put(routes.conversations.addMessage, conversations.addMessage)



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'))
})
