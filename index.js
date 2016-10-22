module.exports = function (reducer, initialValue, onEnd) {
  // If `initialValue` is `undefined`, we will use the first stream
  // value as the first reduced value.
  var useFirstValue = true
  var reduced = initialValue
  var index = 0

  return function pullReduction (source) {
    readFromSource()

    function readFromSource () {
      // If both the source stream and the reducer call back
      // synchronously, we want to loop, rather than recurse, to keep
      // the stack short. We use boolean flags checked immediately after
      // callback invocation to check if they call back synchronously.
      var keepLooping = true
      var sourceAlreadyCalledBack
      var reducerAlreadyCalledBack

      while (keepLooping) {
        sourceAlreadyCalledBack = false
        reducerAlreadyCalledBack = false

        source(null, function (end, currentValue) {
          sourceAlreadyCalledBack = true
          // Source stream ended.
          if (end) {
            keepLooping = false
            onEnd(end === true ? null : end, reduced)
          // Source stream called back with a value.
          } else {
            if (useFirstValue && initialValue === undefined) {
              // We are using the first stream value as the initial
              // reduced value.
              useFirstValue = false
              reduced = currentValue
              if (!keepLooping) {
                // Something is async. Recurse.
                readFromSource()
              }
            } else {
              reducer(
                reduced, currentValue, index,
                function (error, newReduced) {
                  reducerAlreadyCalledBack = true
                  index++
                  if (error) {
                    keepLooping = false
                    source(true, function () {
                      onEnd(error)
                    })
                  } else {
                    reduced = newReduced
                    if (!keepLooping) {
                      // Something is async. Recurse.
                      readFromSource()
                    }
                  }
                }
              )
              if (!reducerAlreadyCalledBack) {
                keepLooping = false
              }
            }
          }
        }) // source(null, function (...) { ... })

        if (!sourceAlreadyCalledBack && !reducerAlreadyCalledBack) {
          keepLooping = false
        }
      } // while (keepLooping)
    }
  }
}
