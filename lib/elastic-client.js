var ElasticSearchClient = require('elasticsearchclient')
var config   = require('../config')
var unirest  = require('unirest')
var err      = require('./APIError')

var elasticsearchURL = process.env.SEARCHBOX_URL || config.ElasticSearch_URL
var connectionString = require('url').parse(elasticsearchURL)
var auth = process.env.SEARCHBOX_URL ? connectionString.auth.split(":")[0] : ''
var pass = process.env.SEARCHBOX_URL ? connectionString.auth.split(":")[1] : ''
var serverOptions = {
  host   : connectionString.hostname,
  port   : connectionString.port,
  secure : false,
  auth   : {
    username: auth,
    password: pass
  }
}

var elasticSearchClient = new ElasticSearchClient(serverOptions)

var _index = 'users'
var _type = 'user'

elasticSearchClient.createIndex(_index)
.on('error', function (err) {
  console.error(err)
}).exec()

exports.index = function (user) {
  // inserting custom object for id field
  elasticSearchClient.index(_index, _type, user)
  .on('error', function (err) {
    throw new APIError(500, errors.index, err.message)
  }).exec()
}

exports.update = function (user) {
  var query = {
    'query': {
      'query_string': {
        'fields': ['email'],
        'query': user.email
      }
    }
  }

  elasticSearchClient.search(_index, _type, query)
  .on('data', function (data) {
    data = JSON.parse(data)
    // node-elasticsearch-client does not support update of 
    // ElasticSearch 0.90 so we will do it manually
    unirest.post(elasticsearchURL+'/'+_index+'/'+_type+'/'+data.hits.hits[0]._id+'/_update')
    .auth({
      user: auth,
      pass: pass,
      sendImmediately: true
    })
    .send({
      "doc": user
    })
    .end(function (response) {
      if (response.status >= 300) {
        throw new APIError(500, errors.update, response.body)
      }
    })
  })
  .on('error', function (err) {
    throw new APIError(500, errors.search, err.message)
  }).exec()
}

exports.remove = function (user) {
  var query = {
    'query': {
      'query_string': {
        'fields': ['email'],
        'query': user.email
      }
    }
  }

  // This also appears to be broken, so we will use search to retrieve the elastic id
  // of the item and use deleteDocument to remove it.
  
  // elasticSearchClient.deleteByQuery(_index, _type, query)
  // .on('data', function (data) {
  //   console.log(data)
  // })
  // .on('error', function (err) {
  //   throw new APIError(500, errors.remove, err.message)
  // }).exec()

  elasticSearchClient.search(_index, _type, query)
  .on('data', function (data) {
    data = JSON.parse(data) //srsly
    elasticSearchClient.deleteDocument(_index, _type, data.hits.hits[0]._id)
    .on('error', function (err) {
      throw new APIError(500, errors.remove, err.message)
    }).exec()
  })
  .on('error', function (err) {
    throw new APIError(500, errors.search, err.message)
  }).exec()
}

exports.search = function (q, next) {  
  var query = {
    'query': {
      'query_string': {
        'fields': ["needs"],
        'query': q,
        'use_dis_max': true,
      }
    }
  }
 
  elasticSearchClient.search(_index, _type, query)
  .on('data', function (data) {
    next(data)
  })
  .on('error', function (err) {
    throw new APIError(500, errors.search, err.message)
  }).exec()
}