module.exports = function (/* reducer, [initialValue,] onEnd */) {
  var reducer = arguments[0]
  var threeArguments = arguments.length === 3
  var initialValue = threeArguments ? arguments[1] : undefined
  var onEnd = threeArguments ? arguments[2] : arguments[1]

  // If `initialValue` is `undefined`, we will use the first stream
  // value as the first reduced value.
  var firstValue = true
  var reducedValue = initialValue
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
        // Reset callback flags on each iteration of the loop.
        sourceAlreadyCalledBack = false
        reducerAlreadyCalledBack = false

        source(null, function (end, currentValue) {
          sourceAlreadyCalledBack = true

          // Source stream ended.
          if (end) {
            keepLooping = false
            onEnd(end === true ? null : end, reducedValue)
          // Source stream called back with a value.
          } else {
            if (firstValue && initialValue === undefined) {
              // We are using the first stream value as the initial
              // reduced value.
              reducedValue = currentValue

              if (!keepLooping) {
                // Something is async. Recurse.
                readFromSource()
              }
            } else {
              reducer(
                reducedValue, currentValue, index,
                function (error, newReducedValue) {
                  reducerAlreadyCalledBack = true
                  index++

                  if (error) {
                    // Stop looping, abort the source stream, and call
                    // back with the error.
                    keepLooping = false
                    source(true, function () {
                      onEnd(error)
                    })
                  } else {
                    reducedValue = newReducedValue

                    if (!keepLooping) {
                      // Something is async. Recurse.
                      readFromSource()
                    }
                  }
                }
              )

              // If the reducer hasn't already called back, it's
              // asynchronous.  Stop looping.
              if (!reducerAlreadyCalledBack) {
                keepLooping = false
              }
            }
            firstValue = false
          }
        }) // source(null, function (...) { ... })

        if (!sourceAlreadyCalledBack && !reducerAlreadyCalledBack) {
          keepLooping = false
        }
      } // while (keepLooping)
    }
  }
}
