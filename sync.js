module.exports = function (reducer, initialValue, onEnd) {
  var useFirstValue = true
  var reduced = initialValue
  var index = 0

  return function pullReductionSync (source) {
    readFromSource()

    function readFromSource () {
      var keepLooping = true
      var calledBackSynchronously

      while (keepLooping) {
        // The source could call back synchronously or asynchronously.
        // If it calls back synchronously, we want to loop, rather than
        // recurse, to keep the stack short.
        calledBackSynchronously = false

        source(null, function (end, currentValue) {
          calledBackSynchronously = true
          if (end) {
            keepLooping = false
            onEnd(end === true ? null : end, reduced)
          } else {
            if (useFirstValue && initialValue === undefined) {
              useFirstValue = false
              reduced = currentValue
            } else {
              reduced = reducer(reduced, currentValue, index)
              index++
            }
            if (!keepLooping) {
              readFromSource()
            }
          }
        })

        // If the callback flag isn't already set, the stream will call
        // back asynchronously, so don't loop.
        if (!calledBackSynchronously) {
          keepLooping = false
        }
      }
    }
  }
}
