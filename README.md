On an array:

```javascript
var assert = require('assert')

assert([1, 2, 3, 4].reduce(function (a, b) { return a + b }) === 10)
```

In a [pull-stream] pipeline:

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
      assert(error === null, 'no stream error')
      assert(reduced === 10, 'reduces to sum')
    }
  )
)
```

If both the source and the reduction call back synchronously,
pull-reduction will loop, rather than recurse, to keep the stack short.

On an array:

```javascript
assert(
  [0, 0, 0, 0, 0].reduce(function (a, b, index) {
    return a + index
  }, 100) === 110
)
```

In a [pull-stream] pipeline:

```javascript
pull(
  pull.values([0, 0, 0, 0, 0]),
  reduction(
    // If the reducing function takes four arguments, it receives the
    // current index, as well.
    function add (reduced, current, index, callback) {
      callback(null, reduced + index)
    },
    // With three arguments, `reduction` sets an initial value.
    100,
    function (error, reduced) {
      assert(error === null, 'no stream error')
      assert(reduced === 110, 'reduces to sum of indices + initial')
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
    function (error, reduced) {
      assert(error.message === 'reduction error', 'aborts with error')
    }
  )
)
```
