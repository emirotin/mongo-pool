mongoPool = require('..')
testsCommon = require('./common')

describe 'Mongo Pool', ->
  it 'should connect to DB', (done) ->
    mongoPool.connect testsCommon.config, (err, db) ->
      (not err?).should.be.ok
      (db?).should.be.ok
      done()
