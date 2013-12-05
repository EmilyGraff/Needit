var mongoose = require('mongoose')
var config   = require('../config')

var uri = process.env.MONGOLAB_URI || config.MongoDB_URL
var db = mongoose.createConnection(uri + '/conversations')

var Schema = mongoose.Schema;
var Conversation = new Schema({
	needer : { type: String, required: true },
	active : { type: Boolean, required: true},
	need : { type: String, required: true},
	traders : { type: Array, required: false},
	messages : [{ author: String, Conversation: String, timestamp: Date}]
}, { versionKey: false })

var ConversationModel = db.model('Conversation', Conversation)

// TEST
new ConversationModel({
	needer : "name@domain.com",
	active : true,
	need : "macbook pro"
}).save(function(err) {
	if (err) throw err
	console.log('insert test conversation')
});

// Post one
exports.post = function(req, res) {
	var myConversation = new ConversationModel({
		needer : req.body.needer,
		active : true,
		need : req.body.need
	});

	myConversation.save(function(err) {
		if (err) res.send(500)
		res.send(200)
	});
}

// Put trader

// Get all
exports.getAll = function(req, res) {
	ConversationModel.find(function (err, conversations) {
		if (err) {
			res.send(500)
		}
		res.json(conversations)
	});
};

// Get one
exports.getOne = function(req, res) {
	findOne(req, res, function (conversation) {
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