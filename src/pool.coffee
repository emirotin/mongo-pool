_ = require 'lodash'
async = require 'async'

noop = ->

module.exports = class Pool
  constructor: (params) ->
    @connections = []
    @create = params.create
    @max = params.max or 5
    @success = params.success or noop

    @connect()

  connect: ->
    async.times @max, (n, next) =>
      @create (err, conn) =>
        if err
          console.error "Mongo Pool conn #{n}: error", err
        else
          @connections.push conn
        next err, conn
    , (err, connections) =>
      @success err

  close: (cb) ->
    async.each @connections, (conn, callback) ->
      conn.close false, callback
    , cb

  acquire: ->
    if @connections.length > 0
      clientId = _.random(0, @connections.length - 1)
      #console.log "Mongo Pool conn #{clientId} acquired"
      @connections[clientId]



