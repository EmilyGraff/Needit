var mongoose = require('mongoose')
var config   = require('../config')

mongoose.connect(process.env.MONGOLAB_URI + '/Conversations' || config.MongoDB_URL)

var Schema = mongoose.Schema;
var Conversation = new Schema({
	needer : { type: String, required: true },
	active : { type: Boolean, required: true},
	need : { type: String, required: true},
	traders : { type: Array, required: false},
	messages : [{ author: String, Conversation: String, timestamp: Date}]
}, { versionKey: false })

var ConversationModel = mongoose.model('Conversation', Conversation)

// Post one
exports.postOne = function(req, res) {
	var myConversation = new ConversationModel({
		needer : req.body.needer,
		active : true, 
		need : req.body.need
	});

	myConversation.save(function(err) {
		if(err) {
			res.send(500)
		}
		else {
			//elasticSearch.index(myConversation)
		}
		res.json(myConversation)
	});
}

// Put trader

// Get all
exports.getAll = function(req, res) {
	ConversationModel.find(function (err, conversation) {
		if (err) {
			res.send(500)
		}
		res.json(conversation)
	});
};

// Get one
exports.getOne = function(req, res) {
	findOne(req, res, function(conversation) {
		res.json(conversation)
	});
};

// find by id from request.params.id
function findOne (req, res, next) {
  if (!isValidObjectID(req.params.id)) {
  	res.send(422)
  }
  ConversationModel.findById(req.params.id, function (err, conversation) {
      if (err) {
      	res.send(500)
      } else if (!conversation) {
      	res.send(404)
      }
      return next(conversation)
  });
};

// Check if valid mongodb ObjectID
function isValidObjectID (str) {
  var len = str.length
  if (len == 12 || len == 24) {
    return /^[0-9a-fA-F]+$/.test(str)
  } else {
    return false
  }
}