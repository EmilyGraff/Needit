var mongoose      = require('mongoose')
var config        = require('../config')
var err           = require('../lib/APIError')
var APIError      = err.APIError
var errors        = err.errors
var elasticSearch = require('../lib/elastic-client')
var twilioClient  = require('../lib/twilio-client')
var bcrypt        = require('bcrypt')
var salt          = bcrypt.genSaltSync(10)

var uri = process.env.MONGOLAB_URI || config.MongoDB_URL
var db = mongoose.createConnection(uri + '/users')

var Schema = mongoose.Schema
var User = new Schema({
  pseudo : { type: String, required: true },
  password : { type: String, required: true },
  email : { type: String, required: true},
  inscription: { type: Date, required: true, default: Date.now},
  adress: { type: String, required: false},
  description: { type: String, required: false },
  score: { type: String, required: true },
  area_width: { type: Number, required: true },
  delay: { type: Number, required: true },
  trades: [{ 
    active: { type: Boolean, required: true }, 
    timestamp: { type: Date, required: true, default: Date.now },
    keywords: { type: Array, required: true }
  }],
  needs: [{
    timestamp: { type: Date, required: true, default: Date.now },
    need: { type: String, required: true }
  }],
  notifications: [{
    seen: { type: Boolean, required: true },
    notification_type: { type: String, required: true },
    transaction: { type: String, required: true }
  }],
  comments_on_me: [{
    user: { type: String, required: true },
    message: { type: String, required: true },
    transaction: { type: String, required: true }
  }],
  transactions: [{
    trader: { type: Boolean, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    need: { type: String, required: true }
  }]
}, { versionKey: false })

var UserModel = db.model('User', User)


// TEST INSERTS
var user = new UserModel({
  pseudo: "thomas",
  password: bcrypt.hashSync('password', salt),
  email: "toto@domain.com",
  inscription: new Date(),
  adress: "130 rue difj",
  description: 'Cool user',
  score: 1234, 
  area_width: 12,
  delay: 0,
  trades: [
    {
      "active": true,
      "timestamp": new Date(),
      "keywords": [
        "canapé"
      ]
    }
  ],
  needs: [],
  notifications: [],
  comments_on_me: [],
  transactions: []
})
user.save(function (err) {
  if (err) throw err
  elasticSearch.index(user)
  console.log('inserted test user')
})

exports.getAll = function(req, res){
  UserModel.find(function (err, users) {
    if (err) throw new APIError(500, errors.find)
    res.json(users)
  })
}

exports.getOne = function (req, res) {
  findOne(req.params.email, res, function (user) {
    res.json(user)
  })
}

exports.post = function (req, res) {
  UserModel.findOne({ "email": req.body.email}, function(err, user){
    if (err) throw new APIError(500, errors.find)
    if(!user) {
      var user = new UserModel({
        pseudo : req.body.pseudo,
        password : bcrypt.hashSync(req.body.password, salt),
        email : req.body.email,
        adress: req.body.adress || '',
        description: req.body.description || '',
        score: 0,
        area_width: 1,
        delay: 0,
        trades: [],
        needs: [],
        notifications: [],
        comments_on_me: [],
        transactions: []
      })
      user.save(function (err) {
        if (err) throw new APIError(500, errors.save)
        elasticSearch.index(user)
        res.send(200)
      })
    }
    else {
      throw new APIError(400, errors.userExists)
    }
  })
}

exports.addTrade = function (req, res) {
  findOne(req.params.email, res, function(user){
    if (!user) throw new APIError(404, errors.userNotFound)
    user.trades.push({
      active: true,
      keywords: req.body.keywords
    })
    elasticSearch.update(user)
    res.send(200)
  })
}

exports.addNeed = function (req, res) {
  findOne(req.params.email, res, function(user){
    if (!user) throw new APIError(404, req.userNotFound)
    else {
      user.needs.push({
        timestamp: new Date(),
        need: req.body.need
      })
      elasticSearch.searchForKeywords(req.body.need, function (data) {
        data.hits.hits.forEach(function (user, idx, users) {
          UserModel.findOne({ "email": user._source.email }, function (err, fetched_user) {
            if (err) throw new APIError(500, errors.find)
            fetched_user.notifications.push({
              seen: false,
              notification_type: "match",
              transaction: ' '
            })
            elasticSearch.update(fetched_user)
            twilioClient.notify(req.body.number, "Un acheteur a posté une recherche en rapport avec l'un de vos mots clés: " + req.body.need)
            fetched_user.save(function (err) {
              if (err) throw err
            })
          })
        })
      })
      res.send(200)
    }
  })
}

exports.addNotification = function (req, res) {
  findOne(req.params.email, res, function(user){
    if(!user) throw new APIError(404, errors.userNotFound)
    else {
      user.notifications.push({
        seen: false,
        notification_type: req.body.notification_type,
        transaction: req.body.transaction
      })
      res.send(200)
    }
  })
}

exports.addComment = function (req, res) {
  findOne(req.params.email, res, function(user){
    if(!user) throw new APIError(404, errors.userNotFound)
    else {
      user.comments_on_me.push({
        user: req.body.user,
        message: req.body.message,
        transaction: req.body.transaction
      })
      res.send(200)
    }
  })
}

exports.addTransaction = function (req, res) {
  findOne(req.params.email, res, function(user){
    if(!user) throw new APIError(404, errors.userNotFound)
    else {
      user.transactions.push({
        trader: req.body.trader,
        need: req.body.need
      })
      res.send(200)
    }
  })
}

exports.searchForKeywords = function (req, res) {
  elasticSearch.searchForKeywords(req.params.query, function (data) {
    res.json(data)
  })
}

// find by id from request.params.id
var findOne = function (email, res, next) {
  if (!isValidEmail(email)) {
    new APIError(422, errors.invalidEmail).handlerError(res)
  }
  UserModel.findOne({"email": email}, function (err, user) {
    if (err) new APIError(500, errors.find).handleError(res)
    else if (!user) new APIError(404, errors.userNotFound).handleError(res)
    return next(user)
  })
}
module.exports.findOne = findOne

// check if valid mongodb object id
function isValidEmail (str) {
  return /^[a-zA-Z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/.test(str)
}
