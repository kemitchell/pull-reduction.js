On an array:

```javascript
var assert = require('assert')
assert.equal(
  [1, 2, 3, 4, 5].reduce(function (a, b) { return a + b }),
  15
)
```

On a [pull-stream] source:

[pull-stream]: https://www.npmjs.com/package/pull-stream

```javascript
var reduction = require('pull-reduction')
var pull = require('pull-stream')

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
```

On an array:

```javascript
assert.equal(
  [1, 2, 3, 4, 5].reduce(function (a, b) { return a + b }, 100),
  115
)
```

On a [pull-stream] source:

```javascript
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
```

Reducers can fail with errors:

```javascript
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
