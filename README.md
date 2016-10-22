On an array:

```javascript
var assert = require('assert')
assert.equal([1, 2, 3, 4].reduce(function (a, b) { return a + b }), 10)
```

On a [pull-stream] source:

[pull-stream]: https://www.npmjs.com/package/pull-stream

```javascript
var reduction = require('pull-reduction')
var pull = require('pull-stream')

pull(
  pull.values([1, 2, 3, 4]),
  reduction(
    function add (reduced, current, callback) {
      callback(null, reduced + current)
    },
    function (error, reduced) {
      assert.ifError(error, 'no stream error')
      assert.equal(reduced, 10, 'reduces to sum')
    }
  )
)
```

On an array:

```javascript
assert.equal(
  [0, 0, 0, 0, 0].reduce(function (a, b, index) {
    return a + index
  }, 100),
  110
)
```

On a [pull-stream] source:

```javascript
pull(
  pull.values([0, 0, 0, 0, 0]),
  reduction(
    // If the reducing function takes four arguments, it receives the
    // current index, as well.
    function add (reduced, current, index, callback) {
      callback(null, reduced + index)
    },
    100,
    function (error, reduced) {
      assert.ifError(error, 'no stream error')
      assert.equal(reduced, 110, 'reduces to sum of indices + initial')
    }
  )
)
```

Reductions can fail with errors:

```javascript
pull(
  pull.values([1, 2, 3, 4, 5]),
  reduction(
    function fail (reduced, current, callback) {
      callback(new Error('reduction error'))
    },
    100,
    function (error, reduced) {
      assert.equal(error.message, 'reduction error', 'aborts with error')
    }
  )
)
```
