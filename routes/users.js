var mongoose = require('mongoose')
var config   = require('../config')

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
    timestamp: { type: Date, required: true },
    keywords: { type: Array, required: true }
  }],
  needs: [{
    timestamp: { type: Date, required: true },
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
    timestamp: { type: Date, required: true },
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
  description: 'Cooll user',
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
    if (err) {
      res.send(404)
    }
    res.json(users)
  })
}

exports.getOne = function (req, res) {
  console.log(req.params.email)
  findOne(req, res, function (user) {
    res.json(user)
  })
}

exports.post = function (req, res) {
  if (!req.body.email || req.body.pseudo === '') {
      res.send(404)
  }

  UserModel.findOne(req, res, function(user){
    if(err) {

    }
    else if(!user) {
      var user = new UserModel({
        pseudo : req.body.pseudo,
        email : req.body.email,
        inscription: req.body.inscription,
        adress: req.body.adress,
        description: req.body.description || '',
        score: req.body.score, 
        area_width: req.body.area_width,
        delay: req.body.delay,
        trades: req.body.trades || null,
        needs: req.body.needs || null,
        notifications: req.body.notifications || null,
        comments_on_me: req.body.comments_on_me || null,
        transactions: req.body.transactions || null
      }).save(function (err) {
        if (err) {
          res.send(500)
        }
        res.send(200)
      })
    }
    else {
      res.send(400)
    }
  })
}

// find by id from request.params.id
function findOne (req, res, next) {
  if (!isValidEmail(req.params.email)) {
    res.send(422, 'invalid parameter: email')
  }
  UserModel.findOne({"email": req.params.email}, function (err, user) {
      if (err) {
        res.send(500)
      } else if (!user) {
        res.send(404)
      }
      return next(user)
  })
}

// check if valid mongodb object id
function isValidEmail (str) {
  return /^[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/.test(str)  -
}