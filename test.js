const test = require('ava')
const recoverable = require('./')

test('should recover after error', async t => {
  const failingIterable = {
    [Symbol.iterator] () {
      let i = 0
      return {
        next () {
          if (i > 3) throw new Error('BOOM')
          return { done: false, value: i++ }
        }
      }
    }
  }

  const iterable = [1, 2, 3]
  const create = err => err ? iterable : failingIterable
  const output = []

  for await (const value of recoverable(create)) {
    output.push(value)
  }

  t.deepEqual(output, [0, 1, 2, 3, 1, 2, 3])
})

test('should recover asynchronously after error', async t => {
  const failingIterable = {
    [Symbol.iterator] () {
      let i = 0
      return {
        next () {
          if (i > 3) throw new Error('BOOM')
          return { done: false, value: i++ }
        }
      }
    }
  }

  const iterable = [1, 2, 3]
  const create = err => new Promise((resolve, reject) => {
    setTimeout(() => resolve(err ? iterable : failingIterable), 10)
  })
  const output = []

  for await (const value of recoverable(create)) {
    output.push(value)
  }

  t.deepEqual(output, [0, 1, 2, 3, 1, 2, 3])
})

test('should not recover', async t => {
  const failingIterable = {
    [Symbol.iterator] () {
      return {
        next () {
          throw new Error('BOOM')
        }
      }
    }
  }

  const create = err => {
    if (err) throw err
    return failingIterable
  }

  const error = await t.throwsAsync(async () => {
    for await (const value of recoverable(create)) {
      console.log(value)
    }
  })

  t.is(error.message, 'BOOM')
})
