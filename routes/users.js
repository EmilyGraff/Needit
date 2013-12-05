var mongoose      = require('mongoose')
var config        = require('../config')
var err           = require('../lib/APIError')
var APIError      = err.APIError
var errors        = err.errors
var elasticSearch = require('../lib/elastic-client')

var uri = process.env.MONGOLAB_URI || config.MongoDB_URL
var db = mongoose.createConnection(uri + '/users')

var Schema = mongoose.Schema
var User = new Schema({
  pseudo : { type: String, required: true },
  email : { type: String, required: true},
  inscription: { type: Date, required: true, default: Date.now},
  adress: { type: String, required: true},
  description: String,
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

new UserModel({
  pseudo: "thomas",
  email: "name@domain.com",
  inscription: new Date(),
  adress: "130 rue difj",
  description: 'Cool user',
  score: 1234, 
  area_width: 12,
  delay: 0,
  trades: [],
  needs: [],
  notifications: [],
  comments_on_me: [],
  transactions: []
}).save(function (err) {
  if (err) throw err
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
  findOne(req.body.email, res, function(user){
    if(!user) {
      var user = new UserModel({
        pseudo : req.body.pseudo,
        email : req.body.email,
        inscription: req.body.inscription,
        adress: req.body.adress,
        description: req.body.description || '',
        score: req.body.score, 
        area_width: req.body.area_width,
        delay: req.body.delay,
        trades: req.body.trades || [],
        needs: req.body.needs || [],
        notifications: req.body.notifications || [],
        comments_on_me: req.body.comments_on_me || [],
        transactions: req.body.transactions || []
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
    if(!user) {
      res.send(400)
    }
    else {
      user.trades.push({
        active: req.body.active,
        keywords: req.body.keywords
      })
      console.log(user)
      res.send(200)
    }
  })
}

exports.addNeed = function (req, res) {
  findOne(req.params.email, res, function(user){
    if(!user) {
      res.send(400)
    }
    else {
      user.needs.push({
        need: { type: String, required: true }
      })
      console.log(user)
      res.send(200)
    }
  })
}

// find by id from request.params.id
function findOne (email, res, next) {
  if (!isValidEmail(email)) {
    res.send(422, 'invalid parameter: email')
  }
  UserModel.findOne({"email": email}, function (err, user) {
    if (err) throw new APIError(500, errors.find).handleError(res)
    else if (!user) throw new APIError(404, errors.userNotFound).handleError(res)
    return next(user)
  })
}

// check if valid mongodb object id
function isValidEmail (str) {
  return /^[a-zA-Z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/.test(str)
}
