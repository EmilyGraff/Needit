var mongoose = require('mongoose')
var config   = require('../config')

mongoose.connect(process.env.MONGOLAB_URI + '/users' || config.MongoDB_URL)

var Schema = mongoose.Schema;
var User = new Schema({
  pseudo : { type: String, required: true },
  email : { type: String, required: true},
  inscription: { type: Date, required: true, default: Date.now},
  adress: { type: String, required: true},
  description: String,
  score: { type: String, required: true },
  area_width: { type: int, required: true },
  delay: { type: int, required: true },
  trades: [{ 
    active: { type: boolean, required: true }, 
    timestamp: { type: Date, required: true },
    keywords: { type: Array, required: true }
  }],
  needs: [{
    timestamp: { type: Date, required: true },
    need: { type: String, required: true }
  }],
  notifications: [{
    seen: { type: boolean, required: true },
    notification_type: { type: String, required: true },
    transaction: { type: String, required: true }
  }],
  comments_on_me: [{
    user: { type: String, required: true },
    message: { type: String, required: true },
    transaction: { type: String, required: true }
  }],
  transactions: [{
    trader: { type: boolean, required: true },
    timestamp: { type: Date, required: true },
    need: { type: String, required: true }
  }]
}, { versionKey: false })

var UserModel = mongoose.model('User', User)

exports.getAll = function(req, res){
  UserModel.find(function (err, users) {
    if (err) {
      res.send(404);
    }
    res.json(users);
  });
};

exports.getOne = function (req, res) {
  findOne(req, res, function (user) {
    res.json(user);
  });
};

exports.post = function (req, res) {

  if (!req.body.pseudo || req.body.pseudo === '') {
      res.send(404);
  }

  var user = new UserModel({
    pseudo : req.body.pseudo
    email : req.body.email,
    inscription: req.body.inscription,
    adress: req.body.adress,
    description: req.body.description || '',
    score: req.body.score, 
    area_width: req.body.area_width,
    delay: req.body.delay,
    trades: req.body.trades || null,
    needs: req.body.needs || null,
    notifications: req.body.notifications,
    comments_on_me: req.body.comments_on_me,
    transactions: req.body.transactions
  });

  user.save(function (err) {
    if (err) {
      res.send(500);
    }
    res.send(200);
  });
};

// find by id from request.params.id
function findOne (req, res, next) {
  /*if (!isValidObjectID(req.params.id)) {
    res.send(422, 'invalid parameter: email');
    //throw new APIError(422, errors.wrongId, 'invalid parameter: id')
  }*/
  UserModel.findOne({"email": req.params.email}, function (err, user) {
      if (err) {
        res.send(500);
      } else if (!user) {
        res.send(404);
      }
      return next(user)
  });
};

// check if valid mongodb object id
function isValidObjectID (str) {
  var len = str.length
  if (len == 12 || len == 24) {
    return /^[0-9a-fA-F]+$/.test(str)
  } else {
    return false
  }
}