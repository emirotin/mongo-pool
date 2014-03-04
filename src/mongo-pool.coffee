mongo = require 'mongodb'
Pool = require './pool'

cachedConnections = {}

connectMongo = (config, callback, useCache=true) ->
  cacheKey = "auth=#{!!config.user};user=#{config.user};password=#{config.password}"
  if useCache and cachedConnections[cacheKey]
    return callback null, cachedConnections[cacheKey]
  cb = (err, db) ->
    if not err
      cachedConnections[cacheKey] = db
    callback err, db
  dbServer = new mongo.Server config.host, config.port, auto_reconnect: true
  dbCon = new mongo.Db config.db, dbServer, safe: true
  dbCon.open (err, db) ->
    if err then throw err
    if config.user
      db.authenticate config.user, config.password, {}, (err, success) ->
        cb err, db
    else
      cb null, db

module.exports.connect = connectMongo

module.exports.create = (config, callback) ->
  new Pool
    max: config.max or 5
    create: (cb) ->
      connectMongo config, cb, false
    success: ->
      callback null, pool