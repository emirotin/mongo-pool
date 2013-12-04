mongo = require 'mongodb'
Pool = require './pool'

connectMongo = (config, callback)->
  dbServer = new mongo.Server config.host, config.port, auto_reconnect: true
  dbCon = new mongo.Db config.db, dbServer, safe: true
  dbCon.open (err, db) ->
    if err then throw err
    if config.user
      db.authenticate config.user, config.password, {}, (err, success) ->
        callback err, db
    else
      callback null, db

module.exports.connect = connectMongo

module.exports.create = (config, callback) ->
  pool = new Pool
    max: 5
    create: (cb) ->
      connectMongo config, cb
    success: ->
      callback null, pool