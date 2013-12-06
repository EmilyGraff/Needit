var mongoose = require('mongoose')
var config   = require('../config')
var err      = require('../lib/APIError')
var APIError = err.APIError
var errors   = err.errors

var uri = process.env.MONGOLAB_URI || config.MongoDB_URL
var db = mongoose.createConnection(uri + '/conversations')

var Schema = mongoose.Schema;
var Conversation = new Schema({
	needer : { type: String, required: true },
	active : { type: Boolean, required: true},
	need : { type: String, required: true},
	traders : { type: Array, required: false},
	messages : [{ author: String, message: String, timestamp: Date}]
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

new ConversationModel({
	needer : "name@domain.com",
	active : true,
	need : "canape"
}).save(function(err) {
	if (err) throw err
	console.log('insert test conversation')
});

// Get by needer -> array conversations
exports.getByNeeder = function(req, res) {
	console.log(req.params.email)
	ConversationModel.find({ 'needer' : req.params.email }, function(err, conversations) {
		if(err)	res.send(500)
		res.json(conversations)
	});
}

// Post one
exports.post = function(req, res) {
	var myConversation = new ConversationModel({
		needer : req.body.needer,
		active : true,
		need   : req.body.need
	});

	myConversation.save(function(err) {
		if (err) throw new APIError(500, errors.save)
		res.send(200)
	});
}

// Put trader
exports.addTrader = function(req, res) {
	findOne(req, res, function (conversation) {
		conversation.traders.push(req.body.email)
		conversation.save(function(err) {
			if(err) throw new APIError(500, errors.save)
			res.send(200)
		});
	});
}

// put message
exports.addMessage = function(req, res) {
	findOne(req, res, function(conversation) {
		conversation.messages.push(req.body.message)
		conversation.save(function(err) {
			if(err) throw new APIError(500, errors.save)
			res.send(200)
		});
	});
}

// Get all
exports.getAll = function(req, res) {
	ConversationModel.find(function (err, conversations) {
		if (err) throw new APIError(500, errors.find)
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
  	throw new APIError(422, errors.invalidEmail)
  }
  ConversationModel.findById(req.params.id, function (err, conversation) {
      if (err) throw new APIError(500, errors.find)
      if (!conversation) throw new APIError(404, errors.conversationNotFound)
      return next(conversation)
  })
}

// Check if valid mongodb ObjectID
function isValidObjectID (str) {
  var len = str.length
  if (len == 12 || len == 24) {
    return /^[0-9a-fA-F]+$/.test(str)
  } else {
    return false
  }
}