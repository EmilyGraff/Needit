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
  UserModel.find(function (err, items) {
    if (err) {
      res.send(404);
      //throw new APIError(500, errors.find);
    }
    res.json(users);
    //return respond(200, items, req, res);
  });
};

exports.getOne = function (req, res) {
  findOne(req, res, function (user) {
    res.json(user);
    //return respond(200, item, req, res);
  });
};

exports.create = function (req, res) {
  if (!req.body.title || req.body.title === '') {
      res.send(404);
    //throw new APIError(400, errors.noTitle);
  }

  var item = new UserModel({
    title : req.body.title,
    body  : req.body.body || '',
    done  : false
  });

  item.save(function (err) {
    if (err) {
      res.send(500);
      //throw new APIError(500, errors.save, err.message);
    } else {
        elasticSearch.index(item);
    }
    res.send(200);
    //return respond(200, item, req, res);
  });
};

// find by id from request.params.id
function findOne (req, res, next) {
  if (typeof(next) !== 'function') {
    next = function(){}
  }
  /*if (!isValidObjectID(req.params.id)) {
    res.send(422, 'invalid parameter: email');
    //throw new APIError(422, errors.wrongId, 'invalid parameter: id')
  }*/
  ItemModel.findOne({"email": req.params.email}, function (err, user) {
      // The workaround is to use handleError since express.js does not catch those errors
      if (err) {
        res.send(500);
        //new APIError(500, errors.find, err.message).handleError(req, res)
      } else if (!user) {
        res.send(404);
        //new APIError(404, errors.itemNotFound).handleError(req, res)
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