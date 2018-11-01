# recoverable-iterator

[![Build Status](https://travis-ci.org/alanshaw/recoverable-iterator.svg?branch=master)](https://travis-ci.org/alanshaw/recoverable-iterator) [![dependencies Status](https://david-dm.org/alanshaw/recoverable-iterator/status.svg)](https://david-dm.org/alanshaw/recoverable-iterator) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> If an iterator errors, restart and continue.

## Install

```sh
npm install recoverable-iterator
```

## Usage

```js
const recoverable = require('recoverable-iterator')

// I fail after the third iteration
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

// Pass a function to create or re-create the iterable on error
const it = recoverable(err => {
  // Called with no error when the iteration starts
  if (!err) {
    // For this example, return the failing iterable initially
    return failingIterable
  } else {
    // Determine if the error is fatal...
    // ...if fatal then throw it...
    // if not, then recreate and return it - note this function can be async
    // and return a promise for delay and backoff if needed.
    return iterable
  }
})

console.log(await it.next()) // { done: false, value: 0 }
console.log(await it.next()) // { done: false, value: 1 }
console.log(await it.next()) // { done: false, value: 2 }
console.log(await it.next()) // { done: false, value: 3 }
console.log(await it.next()) // { done: false, value: 1 }
console.log(await it.next()) // { done: false, value: 2 }
console.log(await it.next()) // { done: false, value: 3 }
console.log(await it.next()) // { done: true, value: undefined }
```

## API

```js
const recoverable = require('recoverable-iterator')
```

### `recoverable(create)`

Returns an _async_ iterator (also iterable) that can recover when the iterator returned by the `create` function throws an error. When this happens, `create` will be called again (and passed the error object) to re-create a new iterator or re-throw the error if it's fatal.

`create` can return a promise so that delay and backoff can occur or if creation of the iterator just so happens to be async.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| create | 'Function' | Factory for creating and returning the iterator that should be recoverable. After the first call subsequent calls receive an `Error` parameter which can be used to determine if recovery should happen or not  |

#### Returns

| Type | Description |
|------|-------------|
| [`Iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol) | A "recoverable" async iterator. |

## Contribute

Feel free to dive in! [Open an issue](https://github.com/alanshaw/recoverable-iterator/issues/new) or submit PRs.

## License

[MIT](https://github.com/alanshaw/recoverable-iterator/blob/master/LICENSE) © Alan Shaw
