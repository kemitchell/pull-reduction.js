```javascript
var reduction = require('pull-reduction')
var pull = require('pull-stream')
var assert = require('assert')

pull(
  pull.values([1, 2, 3, 4, 5]),
  reduction(
    function add (reduced, current, index, callback) {
      callback(null, reduced + current)
    },
    undefined, // Use the first value, just like `[].reduce()`.
    function (error, reduced) {
      assert.ifError(error, 'no stream error')
      assert.equal(reduced, 15, 'reduces to sum')
    }
  )
)

pull(
  pull.values([1, 2, 3, 4, 5]),
  reduction(
    function add (reduced, current, index, callback) {
      callback(null, reduced + current)
    },
    100,
    function (error, reduced) {
      assert.ifError(error, 'no stream error')
      assert.equal(reduced, 115, 'reduces to sum + initial')
    }
  )
)

pull(
  pull.values([1, 2, 3, 4, 5]),
  reduction(
    function fail (reduced, current, index, callback) {
      callback(new Error('reduction error'))
    },
    100,
    function (error, reduced) {
      assert.equal(error.message, 'reduction error', 'aborts with error')
    }
  )
)
```
