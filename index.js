const getIterator = require('get-iterator')

// If an iterator errors, restart and continue.
//
// `create` may will be called multiple times, if called twice or more it'll
// be passed the error that occurred in the previous iteration as a parameter.
// That way `create` can decide if the error is fatal (and rethrow) or recoverable
// and return a new iterator.
//
// `create` is optionally async so delay and backoff can occur between restarts.
module.exports = function createRecoverable (create) {
  return (async function * recoverable () {
    let it = getIterator(await create())
    while (true) {
      let result
      try {
        result = await it.next()
      } catch (err) {
        it = getIterator(await create(err))
        continue
      }
      if (result.done) return
      yield result.value
    }
  })()
}
