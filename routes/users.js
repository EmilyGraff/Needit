var mongoose = require('mongoose')
var config   = require('../config')

mongoose.connect(process.env.MONGOLAB_URI + '/users' || config.MongoDB_URL)

var Schema = mongoose.Schema;
var User = new Schema({
  title : { type: String, required: true },
  body  : { type: String },
  done  : { type: Boolean, required: true }
}, { versionKey: false })

var UserModel = mongoose.model('User', User)

exports.getAll = function(req, res){
	// get from mongodb
  res.send("respond with a resource")
}

exports.getOne = function(req, res) {

}

// find by id from request.params.id
function findOne (req, res, next) {
  if (typeof(next) !== 'function') {
    next = function(){}
  }
  if (!isValidObjectID(req.params.id)) {
    throw new APIError(422, errors.wrongId, 'invalid parameter: id')
  }
  ItemModel.findById(req.params.id, function (err, item) {
      // The workaround is to use handleError since express.js does not catch those errors
      if (err) {
        new APIError(500, errors.find, err.message).handleError(req, res)
      } else if (!item) {
        new APIError(404, errors.itemNotFound).handleError(req, res)
      }
      return next(item)
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