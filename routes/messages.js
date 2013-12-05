var mongoose = require('mongoose')
var config   = require('../config')

mongoose.connect(process.env.MONGOLAB_URI + '/messages' || config.MongoDB_URL)

var Schema = mongoose.Schema;
var Message = new Schema({
  title : { type: String, required: true },
  body  : { type: String },
  done  : { type: Boolean, required: true }
}, { versionKey: false })

var MessageModel = mongoose.model('Message', Message)