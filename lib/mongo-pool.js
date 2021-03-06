(function() {
  var Pool, cachedConnections, connectMongo, mongo;

  mongo = require('mongodb');

  Pool = require('./pool');

  cachedConnections = {};

  connectMongo = function(config, callback, useCache) {
    var cacheKey, cb, dbCon, dbServer, k, v;
    if (useCache == null) {
      useCache = true;
    }
    cacheKey = ((function() {
      var results;
      results = [];
      for (k in config) {
        v = config[k];
        results.push(k + "=" + v);
      }
      return results;
    })()).join(';');
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
        return cb(err, db);
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
    var pool;
    return pool = new Pool({
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
