var errors = {
  unknown      : { code: 0,  msg: 'Unkown error' },
  save         : { code: 1,  msg: 'Error on save' },
  remove       : { code: 2,  msg: 'Error on remove' },
  find         : { code: 3,  msg: 'Error on find' },
  userNotFound : { code: 10, msg: 'User not found' },
  conversationNotFound : { code: 10, msg: 'Conversation not found' },
  notAllowed   : { code: 11, msg: 'Method not allowed' },
  invalidEmail : { code: 12, msg: 'Invalid email' },
  find         : { code: 20, msg: 'Error on ElasticSearch find' },
  search       : { code: 21, msg: 'Error on ElasticSearch search' },
  index        : { code: 22, msg: 'Error on ElasticSearch indexing'},
  update       : { code: 23, msg: 'Error on ElasticSearch update'},
  remove       : { code: 24, msg: 'Error on ElasticSearch remove'}
}

var APIError = function (HTTPStatus, error, message) {
  this.HTTPStatus = HTTPStatus
  this.error = error
  this.message = message

  this.handleError = function (req, res) {
    console.error('Error: ' + this.HTTPStatus + ' code: ' + this.error.code +'\n'+ this.stack)
    res.send(this.HTTPStatus, { status: this.HTTPStatus, code: this.error.code, message: this.error.msg }, req, res)
  }
}

APIError.prototype = new Error
APIError.prototype.constructor = APIError
APIError.prototype.name = 'APIError'

module.exports.APIError = APIError
module.exports.errors = errors