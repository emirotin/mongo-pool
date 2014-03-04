(function() {
  var Pool, cachedConnections, connectMongo, mongo;

  mongo = require('mongodb');

  Pool = require('./pool');

  cachedConnections = {};

  connectMongo = function(config, callback, useCache) {
    var cacheKey, cb, dbCon, dbServer;
    if (useCache == null) {
      useCache = true;
    }
    cacheKey = "auth=" + (!!config.user) + ";user=" + config.user + ";password=" + config.password;
    if (useCache && cachedConnections[cacheKey]) {
      return callback(null, cachedConnections[cacheKey]);
    }
    cb = function(err, db) {
      if (!err) {
        cachedConnections[cacheKey] = db;
      }
      return callback(err, db);
    };
    dbServer = new mongo.Server(config.host, config.port, {
      auto_reconnect: true
    });
    dbCon = new mongo.Db(config.db, dbServer, {
      safe: true
    });
    return dbCon.open(function(err, db) {
      if (err) {
        throw err;
      }
      if (config.user) {
        return db.authenticate(config.user, config.password, {}, function(err, success) {
          return cb(err, db);
        });
      } else {
        return cb(null, db);
      }
    });
  };

  module.exports.connect = connectMongo;

  module.exports.create = function(config, callback) {
    return new Pool({
      max: config.max || 5,
      create: function(cb) {
        return connectMongo(config, cb, false);
      },
      success: function() {
        return callback(null, pool);
      }
    });
  };

}).call(this);
