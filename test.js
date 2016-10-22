var pull = require('pull-stream')
var reduceAsync = require('./').async
var reduceSync = require('./').sync
var syncValues = require('pull-stream').values
var tape = require('tape')

var add = {
  sync: function (a, b, index) {
    return a + b
  },
  callback: function (a, b, index, callback) {
    callback(null, a + b)
  },
  async: function (a, b, index, callback) {
    setImmediate(function () {
      callback(null, a + b)
    })
  }
}

test('add without initial', [1, 2, 3, 4, 5], add, undefined, 15)

test('add with initial', [1, 2, 3, 4, 5], add, 0, 15)

test('add with initial', [1, 2, 3, 4, 5], add, 10, 25)

tape('reducer error aborts', function (test) {
  var testError = new Error('test error')
  var reducerCalls = 0
  pull(
    pull.values([1, 2, 3, 4, 5]),
    reduceAsync(
      function (reduced, current, index, callback) {
        reducerCalls++
        if (index === 2) {
          callback(testError)
        } else {
          callback(null, reduced + current)
        }
      },
      0,
      function (error) {
        test.equal(error, testError, 'pipeline ends with reducer error')
        test.equal(reducerCalls, 3, 'reducer called thrice')
        test.end()
      }
    )
  )
})

function test (title, values, reduction, initial, expected) {
  [
    {source: true, reducer: 'async'},
    {source: true, reducer: 'sync'},
    {source: true, reducer: 'callback'},
    {source: false, reducer: 'async'},
    {source: false, reducer: 'sync'},
    {source: false, reducer: 'callback'}
  ].forEach(function (permutation) {
    var label = (
      permutation.reducer + ' ' + title +
      ' from ' + (permutation.source ? 'async' : 'sync')
    )
    tape(label, function (test) {
      pull(
        (permutation.source ? asyncValues : syncValues)(values),
        (permutation.reducer === 'sync' ? reduceSync : reduceAsync)(
          reduction[permutation.reducer], initial,
          function (error, reduced) {
            test.ifError(error, 'no stream error')
            test.equal(
              reduced, expected,
              'reduces ' + JSON.stringify(values) +
              ' to ' + JSON.stringify(expected)
            )
            test.end()
          }
        )
      )
    })
  })
}

function asyncValues (values) {
  var index = 0
  return function (end, callback) {
    setImmediate(function () {
      if (end) {
        callback(end)
      } else {
        if (index < values.length) {
          callback(null, values[index++])
        } else {
          callback(true)
        }
      }
    })
  }
}
