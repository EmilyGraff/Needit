var unirest = require('unirest')
var config  = require('../config')

exports.notify = function (number, body, next) {
  unirest.post('https://api.twilio.com/2010-04-01/Accounts/' + config.twilioAccountSID + '/SMS/Messages.json')
  .auth({
    user: config.twilioAccountSID,
    pass: config.twilioAuthToken,
    sendImmediately: true
  })
  .form({ "From": config.twilioFromNumber, "To": number, "Body": body })
  .end(function (response) {
    if (next && typeof(next) === 'function') next()
  })
}
