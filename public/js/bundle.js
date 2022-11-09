(function () { function r(e, n, t) { function o(i, f) { if (!n[i]) { if (!e[i]) { var c = "function" == typeof require && require; if (!f && c) return c(i, !0); if (u) return u(i, !0); var a = new Error("Cannot find module '" + i + "'"); throw a.code = "MODULE_NOT_FOUND", a } var p = n[i] = { exports: {} }; e[i][0].call(p.exports, function (r) { var n = e[i][1][r]; return o(n || r) }, p, p.exports, r, e, n, t) } return n[i].exports } for (var u = "function" == typeof require && require, i = 0; i < t.length; i++)o(t[i]); return o } return r })()({
  1: [function (require, module, exports) {
    'use strict'

    exports.byteLength = byteLength
    exports.toByteArray = toByteArray
    exports.fromByteArray = fromByteArray

    var lookup = []
    var revLookup = []
    var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

    var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i]
      revLookup[code.charCodeAt(i)] = i
    }

    // Support decoding URL-safe base64 strings, as Node.js does.
    // See: https://en.wikipedia.org/wiki/Base64#URL_applications
    revLookup['-'.charCodeAt(0)] = 62
    revLookup['_'.charCodeAt(0)] = 63

    function getLens(b64) {
      var len = b64.length

      if (len % 4 > 0) {
        throw new Error('Invalid string. Length must be a multiple of 4')
      }

      // Trim off extra bytes after placeholder bytes are found
      // See: https://github.com/beatgammit/base64-js/issues/42
      var validLen = b64.indexOf('=')
      if (validLen === -1) validLen = len

      var placeHoldersLen = validLen === len
        ? 0
        : 4 - (validLen % 4)

      return [validLen, placeHoldersLen]
    }

    // base64 is 4/3 + up to two characters of the original data
    function byteLength(b64) {
      var lens = getLens(b64)
      var validLen = lens[0]
      var placeHoldersLen = lens[1]
      return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
    }

    function _byteLength(b64, validLen, placeHoldersLen) {
      return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
    }

    function toByteArray(b64) {
      var tmp
      var lens = getLens(b64)
      var validLen = lens[0]
      var placeHoldersLen = lens[1]

      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

      var curByte = 0

      // if there are placeholders, only get up to the last complete 4 chars
      var len = placeHoldersLen > 0
        ? validLen - 4
        : validLen

      var i
      for (i = 0; i < len; i += 4) {
        tmp =
          (revLookup[b64.charCodeAt(i)] << 18) |
          (revLookup[b64.charCodeAt(i + 1)] << 12) |
          (revLookup[b64.charCodeAt(i + 2)] << 6) |
          revLookup[b64.charCodeAt(i + 3)]
        arr[curByte++] = (tmp >> 16) & 0xFF
        arr[curByte++] = (tmp >> 8) & 0xFF
        arr[curByte++] = tmp & 0xFF
      }

      if (placeHoldersLen === 2) {
        tmp =
          (revLookup[b64.charCodeAt(i)] << 2) |
          (revLookup[b64.charCodeAt(i + 1)] >> 4)
        arr[curByte++] = tmp & 0xFF
      }

      if (placeHoldersLen === 1) {
        tmp =
          (revLookup[b64.charCodeAt(i)] << 10) |
          (revLookup[b64.charCodeAt(i + 1)] << 4) |
          (revLookup[b64.charCodeAt(i + 2)] >> 2)
        arr[curByte++] = (tmp >> 8) & 0xFF
        arr[curByte++] = tmp & 0xFF
      }

      return arr
    }

    function tripletToBase64(num) {
      return lookup[num >> 18 & 0x3F] +
        lookup[num >> 12 & 0x3F] +
        lookup[num >> 6 & 0x3F] +
        lookup[num & 0x3F]
    }

    function encodeChunk(uint8, start, end) {
      var tmp
      var output = []
      for (var i = start; i < end; i += 3) {
        tmp =
          ((uint8[i] << 16) & 0xFF0000) +
          ((uint8[i + 1] << 8) & 0xFF00) +
          (uint8[i + 2] & 0xFF)
        output.push(tripletToBase64(tmp))
      }
      return output.join('')
    }

    function fromByteArray(uint8) {
      var tmp
      var len = uint8.length
      var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
      var parts = []
      var maxChunkLength = 16383 // must be multiple of 3

      // go through the array every three bytes, we'll deal with trailing stuff later
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
        parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
      }

      // pad the end with zeros, but make sure to not forget the extra bytes
      if (extraBytes === 1) {
        tmp = uint8[len - 1]
        parts.push(
          lookup[tmp >> 2] +
          lookup[(tmp << 4) & 0x3F] +
          '=='
        )
      } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + uint8[len - 1]
        parts.push(
          lookup[tmp >> 10] +
          lookup[(tmp >> 4) & 0x3F] +
          lookup[(tmp << 2) & 0x3F] +
          '='
        )
      }

      return parts.join('')
    }

  }, {}], 2: [function (require, module, exports) {

  }, {}], 3: [function (require, module, exports) {
    (function (Buffer) {
      (function () {
        /*!
         * The buffer module from node.js, for the browser.
         *
         * @author   Feross Aboukhadijeh <https://feross.org>
         * @license  MIT
         */
        /* eslint-disable no-proto */

        'use strict'

        var base64 = require('base64-js')
        var ieee754 = require('ieee754')

        exports.Buffer = Buffer
        exports.SlowBuffer = SlowBuffer
        exports.INSPECT_MAX_BYTES = 50

        var K_MAX_LENGTH = 0x7fffffff
        exports.kMaxLength = K_MAX_LENGTH

        /**
         * If `Buffer.TYPED_ARRAY_SUPPORT`:
         *   === true    Use Uint8Array implementation (fastest)
         *   === false   Print warning and recommend using `buffer` v4.x which has an Object
         *               implementation (most compatible, even IE6)
         *
         * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
         * Opera 11.6+, iOS 4.2+.
         *
         * We report that the browser does not support typed arrays if the are not subclassable
         * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
         * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
         * for __proto__ and has a buggy typed array implementation.
         */
        Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

        if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
          typeof console.error === 'function') {
          console.error(
            'This browser lacks typed array (Uint8Array) support which is required by ' +
            '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
          )
        }

        function typedArraySupport() {
          // Can typed array instances can be augmented?
          try {
            var arr = new Uint8Array(1)
            arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
            return arr.foo() === 42
          } catch (e) {
            return false
          }
        }

        Object.defineProperty(Buffer.prototype, 'parent', {
          enumerable: true,
          get: function () {
            if (!Buffer.isBuffer(this)) return undefined
            return this.buffer
          }
        })

        Object.defineProperty(Buffer.prototype, 'offset', {
          enumerable: true,
          get: function () {
            if (!Buffer.isBuffer(this)) return undefined
            return this.byteOffset
          }
        })

        function createBuffer(length) {
          if (length > K_MAX_LENGTH) {
            throw new RangeError('The value "' + length + '" is invalid for option "size"')
          }
          // Return an augmented `Uint8Array` instance
          var buf = new Uint8Array(length)
          buf.__proto__ = Buffer.prototype
          return buf
        }

        /**
         * The Buffer constructor returns instances of `Uint8Array` that have their
         * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
         * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
         * and the `Uint8Array` methods. Square bracket notation works as expected -- it
         * returns a single octet.
         *
         * The `Uint8Array` prototype remains unmodified.
         */

        function Buffer(arg, encodingOrOffset, length) {
          // Common case.
          if (typeof arg === 'number') {
            if (typeof encodingOrOffset === 'string') {
              throw new TypeError(
                'The "string" argument must be of type string. Received type number'
              )
            }
            return allocUnsafe(arg)
          }
          return from(arg, encodingOrOffset, length)
        }

        // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
        if (typeof Symbol !== 'undefined' && Symbol.species != null &&
          Buffer[Symbol.species] === Buffer) {
          Object.defineProperty(Buffer, Symbol.species, {
            value: null,
            configurable: true,
            enumerable: false,
            writable: false
          })
        }

        Buffer.poolSize = 8192 // not used by this implementation

        function from(value, encodingOrOffset, length) {
          if (typeof value === 'string') {
            return fromString(value, encodingOrOffset)
          }

          if (ArrayBuffer.isView(value)) {
            return fromArrayLike(value)
          }

          if (value == null) {
            throw TypeError(
              'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
              'or Array-like Object. Received type ' + (typeof value)
            )
          }

          if (isInstance(value, ArrayBuffer) ||
            (value && isInstance(value.buffer, ArrayBuffer))) {
            return fromArrayBuffer(value, encodingOrOffset, length)
          }

          if (typeof value === 'number') {
            throw new TypeError(
              'The "value" argument must not be of type number. Received type number'
            )
          }

          var valueOf = value.valueOf && value.valueOf()
          if (valueOf != null && valueOf !== value) {
            return Buffer.from(valueOf, encodingOrOffset, length)
          }

          var b = fromObject(value)
          if (b) return b

          if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
            typeof value[Symbol.toPrimitive] === 'function') {
            return Buffer.from(
              value[Symbol.toPrimitive]('string'), encodingOrOffset, length
            )
          }

          throw new TypeError(
            'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
            'or Array-like Object. Received type ' + (typeof value)
          )
        }

        /**
         * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
         * if value is a number.
         * Buffer.from(str[, encoding])
         * Buffer.from(array)
         * Buffer.from(buffer)
         * Buffer.from(arrayBuffer[, byteOffset[, length]])
         **/
        Buffer.from = function (value, encodingOrOffset, length) {
          return from(value, encodingOrOffset, length)
        }

        // Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
        // https://github.com/feross/buffer/pull/148
        Buffer.prototype.__proto__ = Uint8Array.prototype
        Buffer.__proto__ = Uint8Array

        function assertSize(size) {
          if (typeof size !== 'number') {
            throw new TypeError('"size" argument must be of type number')
          } else if (size < 0) {
            throw new RangeError('The value "' + size + '" is invalid for option "size"')
          }
        }

        function alloc(size, fill, encoding) {
          assertSize(size)
          if (size <= 0) {
            return createBuffer(size)
          }
          if (fill !== undefined) {
            // Only pay attention to encoding if it's a string. This
            // prevents accidentally sending in a number that would
            // be interpretted as a start offset.
            return typeof encoding === 'string'
              ? createBuffer(size).fill(fill, encoding)
              : createBuffer(size).fill(fill)
          }
          return createBuffer(size)
        }

        /**
         * Creates a new filled Buffer instance.
         * alloc(size[, fill[, encoding]])
         **/
        Buffer.alloc = function (size, fill, encoding) {
          return alloc(size, fill, encoding)
        }

        function allocUnsafe(size) {
          assertSize(size)
          return createBuffer(size < 0 ? 0 : checked(size) | 0)
        }

        /**
         * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
         * */
        Buffer.allocUnsafe = function (size) {
          return allocUnsafe(size)
        }
        /**
         * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
         */
        Buffer.allocUnsafeSlow = function (size) {
          return allocUnsafe(size)
        }

        function fromString(string, encoding) {
          if (typeof encoding !== 'string' || encoding === '') {
            encoding = 'utf8'
          }

          if (!Buffer.isEncoding(encoding)) {
            throw new TypeError('Unknown encoding: ' + encoding)
          }

          var length = byteLength(string, encoding) | 0
          var buf = createBuffer(length)

          var actual = buf.write(string, encoding)

          if (actual !== length) {
            // Writing a hex string, for example, that contains invalid characters will
            // cause everything after the first invalid character to be ignored. (e.g.
            // 'abxxcd' will be treated as 'ab')
            buf = buf.slice(0, actual)
          }

          return buf
        }

        function fromArrayLike(array) {
          var length = array.length < 0 ? 0 : checked(array.length) | 0
          var buf = createBuffer(length)
          for (var i = 0; i < length; i += 1) {
            buf[i] = array[i] & 255
          }
          return buf
        }

        function fromArrayBuffer(array, byteOffset, length) {
          if (byteOffset < 0 || array.byteLength < byteOffset) {
            throw new RangeError('"offset" is outside of buffer bounds')
          }

          if (array.byteLength < byteOffset + (length || 0)) {
            throw new RangeError('"length" is outside of buffer bounds')
          }

          var buf
          if (byteOffset === undefined && length === undefined) {
            buf = new Uint8Array(array)
          } else if (length === undefined) {
            buf = new Uint8Array(array, byteOffset)
          } else {
            buf = new Uint8Array(array, byteOffset, length)
          }

          // Return an augmented `Uint8Array` instance
          buf.__proto__ = Buffer.prototype
          return buf
        }

        function fromObject(obj) {
          if (Buffer.isBuffer(obj)) {
            var len = checked(obj.length) | 0
            var buf = createBuffer(len)

            if (buf.length === 0) {
              return buf
            }

            obj.copy(buf, 0, 0, len)
            return buf
          }

          if (obj.length !== undefined) {
            if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
              return createBuffer(0)
            }
            return fromArrayLike(obj)
          }

          if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
            return fromArrayLike(obj.data)
          }
        }

        function checked(length) {
          // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
          // length is NaN (which is otherwise coerced to zero.)
          if (length >= K_MAX_LENGTH) {
            throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
              'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
          }
          return length | 0
        }

        function SlowBuffer(length) {
          if (+length != length) { // eslint-disable-line eqeqeq
            length = 0
          }
          return Buffer.alloc(+length)
        }

        Buffer.isBuffer = function isBuffer(b) {
          return b != null && b._isBuffer === true &&
            b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
        }

        Buffer.compare = function compare(a, b) {
          if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
          if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
          if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
            throw new TypeError(
              'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
            )
          }

          if (a === b) return 0

          var x = a.length
          var y = b.length

          for (var i = 0, len = Math.min(x, y); i < len; ++i) {
            if (a[i] !== b[i]) {
              x = a[i]
              y = b[i]
              break
            }
          }

          if (x < y) return -1
          if (y < x) return 1
          return 0
        }

        Buffer.isEncoding = function isEncoding(encoding) {
          switch (String(encoding).toLowerCase()) {
            case 'hex':
            case 'utf8':
            case 'utf-8':
            case 'ascii':
            case 'latin1':
            case 'binary':
            case 'base64':
            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return true
            default:
              return false
          }
        }

        Buffer.concat = function concat(list, length) {
          if (!Array.isArray(list)) {
            throw new TypeError('"list" argument must be an Array of Buffers')
          }

          if (list.length === 0) {
            return Buffer.alloc(0)
          }

          var i
          if (length === undefined) {
            length = 0
            for (i = 0; i < list.length; ++i) {
              length += list[i].length
            }
          }

          var buffer = Buffer.allocUnsafe(length)
          var pos = 0
          for (i = 0; i < list.length; ++i) {
            var buf = list[i]
            if (isInstance(buf, Uint8Array)) {
              buf = Buffer.from(buf)
            }
            if (!Buffer.isBuffer(buf)) {
              throw new TypeError('"list" argument must be an Array of Buffers')
            }
            buf.copy(buffer, pos)
            pos += buf.length
          }
          return buffer
        }

        function byteLength(string, encoding) {
          if (Buffer.isBuffer(string)) {
            return string.length
          }
          if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
            return string.byteLength
          }
          if (typeof string !== 'string') {
            throw new TypeError(
              'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
              'Received type ' + typeof string
            )
          }

          var len = string.length
          var mustMatch = (arguments.length > 2 && arguments[2] === true)
          if (!mustMatch && len === 0) return 0

          // Use a for loop to avoid recursion
          var loweredCase = false
          for (; ;) {
            switch (encoding) {
              case 'ascii':
              case 'latin1':
              case 'binary':
                return len
              case 'utf8':
              case 'utf-8':
                return utf8ToBytes(string).length
              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return len * 2
              case 'hex':
                return len >>> 1
              case 'base64':
                return base64ToBytes(string).length
              default:
                if (loweredCase) {
                  return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
                }
                encoding = ('' + encoding).toLowerCase()
                loweredCase = true
            }
          }
        }
        Buffer.byteLength = byteLength

        function slowToString(encoding, start, end) {
          var loweredCase = false

          // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
          // property of a typed array.

          // This behaves neither like String nor Uint8Array in that we set start/end
          // to their upper/lower bounds if the value passed is out of range.
          // undefined is handled specially as per ECMA-262 6th Edition,
          // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
          if (start === undefined || start < 0) {
            start = 0
          }
          // Return early if start > this.length. Done here to prevent potential uint32
          // coercion fail below.
          if (start > this.length) {
            return ''
          }

          if (end === undefined || end > this.length) {
            end = this.length
          }

          if (end <= 0) {
            return ''
          }

          // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
          end >>>= 0
          start >>>= 0

          if (end <= start) {
            return ''
          }

          if (!encoding) encoding = 'utf8'

          while (true) {
            switch (encoding) {
              case 'hex':
                return hexSlice(this, start, end)

              case 'utf8':
              case 'utf-8':
                return utf8Slice(this, start, end)

              case 'ascii':
                return asciiSlice(this, start, end)

              case 'latin1':
              case 'binary':
                return latin1Slice(this, start, end)

              case 'base64':
                return base64Slice(this, start, end)

              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return utf16leSlice(this, start, end)

              default:
                if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
                encoding = (encoding + '').toLowerCase()
                loweredCase = true
            }
          }
        }

        // This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
        // to detect a Buffer instance. It's not possible to use `instanceof Buffer`
        // reliably in a browserify context because there could be multiple different
        // copies of the 'buffer' package in use. This method works even for Buffer
        // instances that were created from another copy of the `buffer` package.
        // See: https://github.com/feross/buffer/issues/154
        Buffer.prototype._isBuffer = true

        function swap(b, n, m) {
          var i = b[n]
          b[n] = b[m]
          b[m] = i
        }

        Buffer.prototype.swap16 = function swap16() {
          var len = this.length
          if (len % 2 !== 0) {
            throw new RangeError('Buffer size must be a multiple of 16-bits')
          }
          for (var i = 0; i < len; i += 2) {
            swap(this, i, i + 1)
          }
          return this
        }

        Buffer.prototype.swap32 = function swap32() {
          var len = this.length
          if (len % 4 !== 0) {
            throw new RangeError('Buffer size must be a multiple of 32-bits')
          }
          for (var i = 0; i < len; i += 4) {
            swap(this, i, i + 3)
            swap(this, i + 1, i + 2)
          }
          return this
        }

        Buffer.prototype.swap64 = function swap64() {
          var len = this.length
          if (len % 8 !== 0) {
            throw new RangeError('Buffer size must be a multiple of 64-bits')
          }
          for (var i = 0; i < len; i += 8) {
            swap(this, i, i + 7)
            swap(this, i + 1, i + 6)
            swap(this, i + 2, i + 5)
            swap(this, i + 3, i + 4)
          }
          return this
        }

        Buffer.prototype.toString = function toString() {
          var length = this.length
          if (length === 0) return ''
          if (arguments.length === 0) return utf8Slice(this, 0, length)
          return slowToString.apply(this, arguments)
        }

        Buffer.prototype.toLocaleString = Buffer.prototype.toString

        Buffer.prototype.equals = function equals(b) {
          if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
          if (this === b) return true
          return Buffer.compare(this, b) === 0
        }

        Buffer.prototype.inspect = function inspect() {
          var str = ''
          var max = exports.INSPECT_MAX_BYTES
          str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
          if (this.length > max) str += ' ... '
          return '<Buffer ' + str + '>'
        }

        Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
          if (isInstance(target, Uint8Array)) {
            target = Buffer.from(target, target.offset, target.byteLength)
          }
          if (!Buffer.isBuffer(target)) {
            throw new TypeError(
              'The "target" argument must be one of type Buffer or Uint8Array. ' +
              'Received type ' + (typeof target)
            )
          }

          if (start === undefined) {
            start = 0
          }
          if (end === undefined) {
            end = target ? target.length : 0
          }
          if (thisStart === undefined) {
            thisStart = 0
          }
          if (thisEnd === undefined) {
            thisEnd = this.length
          }

          if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
            throw new RangeError('out of range index')
          }

          if (thisStart >= thisEnd && start >= end) {
            return 0
          }
          if (thisStart >= thisEnd) {
            return -1
          }
          if (start >= end) {
            return 1
          }

          start >>>= 0
          end >>>= 0
          thisStart >>>= 0
          thisEnd >>>= 0

          if (this === target) return 0

          var x = thisEnd - thisStart
          var y = end - start
          var len = Math.min(x, y)

          var thisCopy = this.slice(thisStart, thisEnd)
          var targetCopy = target.slice(start, end)

          for (var i = 0; i < len; ++i) {
            if (thisCopy[i] !== targetCopy[i]) {
              x = thisCopy[i]
              y = targetCopy[i]
              break
            }
          }

          if (x < y) return -1
          if (y < x) return 1
          return 0
        }

        // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
        // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
        //
        // Arguments:
        // - buffer - a Buffer to search
        // - val - a string, Buffer, or number
        // - byteOffset - an index into `buffer`; will be clamped to an int32
        // - encoding - an optional encoding, relevant is val is a string
        // - dir - true for indexOf, false for lastIndexOf
        function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
          // Empty buffer means no match
          if (buffer.length === 0) return -1

          // Normalize byteOffset
          if (typeof byteOffset === 'string') {
            encoding = byteOffset
            byteOffset = 0
          } else if (byteOffset > 0x7fffffff) {
            byteOffset = 0x7fffffff
          } else if (byteOffset < -0x80000000) {
            byteOffset = -0x80000000
          }
          byteOffset = +byteOffset // Coerce to Number.
          if (numberIsNaN(byteOffset)) {
            // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
            byteOffset = dir ? 0 : (buffer.length - 1)
          }

          // Normalize byteOffset: negative offsets start from the end of the buffer
          if (byteOffset < 0) byteOffset = buffer.length + byteOffset
          if (byteOffset >= buffer.length) {
            if (dir) return -1
            else byteOffset = buffer.length - 1
          } else if (byteOffset < 0) {
            if (dir) byteOffset = 0
            else return -1
          }

          // Normalize val
          if (typeof val === 'string') {
            val = Buffer.from(val, encoding)
          }

          // Finally, search either indexOf (if dir is true) or lastIndexOf
          if (Buffer.isBuffer(val)) {
            // Special case: looking for empty string/buffer always fails
            if (val.length === 0) {
              return -1
            }
            return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
          } else if (typeof val === 'number') {
            val = val & 0xFF // Search for a byte value [0-255]
            if (typeof Uint8Array.prototype.indexOf === 'function') {
              if (dir) {
                return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
              } else {
                return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
              }
            }
            return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
          }

          throw new TypeError('val must be string, number or Buffer')
        }

        function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
          var indexSize = 1
          var arrLength = arr.length
          var valLength = val.length

          if (encoding !== undefined) {
            encoding = String(encoding).toLowerCase()
            if (encoding === 'ucs2' || encoding === 'ucs-2' ||
              encoding === 'utf16le' || encoding === 'utf-16le') {
              if (arr.length < 2 || val.length < 2) {
                return -1
              }
              indexSize = 2
              arrLength /= 2
              valLength /= 2
              byteOffset /= 2
            }
          }

          function read(buf, i) {
            if (indexSize === 1) {
              return buf[i]
            } else {
              return buf.readUInt16BE(i * indexSize)
            }
          }

          var i
          if (dir) {
            var foundIndex = -1
            for (i = byteOffset; i < arrLength; i++) {
              if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
                if (foundIndex === -1) foundIndex = i
                if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
              } else {
                if (foundIndex !== -1) i -= i - foundIndex
                foundIndex = -1
              }
            }
          } else {
            if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
            for (i = byteOffset; i >= 0; i--) {
              var found = true
              for (var j = 0; j < valLength; j++) {
                if (read(arr, i + j) !== read(val, j)) {
                  found = false
                  break
                }
              }
              if (found) return i
            }
          }

          return -1
        }

        Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
          return this.indexOf(val, byteOffset, encoding) !== -1
        }

        Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
          return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
        }

        Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
          return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
        }

        function hexWrite(buf, string, offset, length) {
          offset = Number(offset) || 0
          var remaining = buf.length - offset
          if (!length) {
            length = remaining
          } else {
            length = Number(length)
            if (length > remaining) {
              length = remaining
            }
          }

          var strLen = string.length

          if (length > strLen / 2) {
            length = strLen / 2
          }
          for (var i = 0; i < length; ++i) {
            var parsed = parseInt(string.substr(i * 2, 2), 16)
            if (numberIsNaN(parsed)) return i
            buf[offset + i] = parsed
          }
          return i
        }

        function utf8Write(buf, string, offset, length) {
          return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
        }

        function asciiWrite(buf, string, offset, length) {
          return blitBuffer(asciiToBytes(string), buf, offset, length)
        }

        function latin1Write(buf, string, offset, length) {
          return asciiWrite(buf, string, offset, length)
        }

        function base64Write(buf, string, offset, length) {
          return blitBuffer(base64ToBytes(string), buf, offset, length)
        }

        function ucs2Write(buf, string, offset, length) {
          return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
        }

        Buffer.prototype.write = function write(string, offset, length, encoding) {
          // Buffer#write(string)
          if (offset === undefined) {
            encoding = 'utf8'
            length = this.length
            offset = 0
            // Buffer#write(string, encoding)
          } else if (length === undefined && typeof offset === 'string') {
            encoding = offset
            length = this.length
            offset = 0
            // Buffer#write(string, offset[, length][, encoding])
          } else if (isFinite(offset)) {
            offset = offset >>> 0
            if (isFinite(length)) {
              length = length >>> 0
              if (encoding === undefined) encoding = 'utf8'
            } else {
              encoding = length
              length = undefined
            }
          } else {
            throw new Error(
              'Buffer.write(string, encoding, offset[, length]) is no longer supported'
            )
          }

          var remaining = this.length - offset
          if (length === undefined || length > remaining) length = remaining

          if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
            throw new RangeError('Attempt to write outside buffer bounds')
          }

          if (!encoding) encoding = 'utf8'

          var loweredCase = false
          for (; ;) {
            switch (encoding) {
              case 'hex':
                return hexWrite(this, string, offset, length)

              case 'utf8':
              case 'utf-8':
                return utf8Write(this, string, offset, length)

              case 'ascii':
                return asciiWrite(this, string, offset, length)

              case 'latin1':
              case 'binary':
                return latin1Write(this, string, offset, length)

              case 'base64':
                // Warning: maxLength not taken into account in base64Write
                return base64Write(this, string, offset, length)

              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return ucs2Write(this, string, offset, length)

              default:
                if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
                encoding = ('' + encoding).toLowerCase()
                loweredCase = true
            }
          }
        }

        Buffer.prototype.toJSON = function toJSON() {
          return {
            type: 'Buffer',
            data: Array.prototype.slice.call(this._arr || this, 0)
          }
        }

        function base64Slice(buf, start, end) {
          if (start === 0 && end === buf.length) {
            return base64.fromByteArray(buf)
          } else {
            return base64.fromByteArray(buf.slice(start, end))
          }
        }

        function utf8Slice(buf, start, end) {
          end = Math.min(buf.length, end)
          var res = []

          var i = start
          while (i < end) {
            var firstByte = buf[i]
            var codePoint = null
            var bytesPerSequence = (firstByte > 0xEF) ? 4
              : (firstByte > 0xDF) ? 3
                : (firstByte > 0xBF) ? 2
                  : 1

            if (i + bytesPerSequence <= end) {
              var secondByte, thirdByte, fourthByte, tempCodePoint

              switch (bytesPerSequence) {
                case 1:
                  if (firstByte < 0x80) {
                    codePoint = firstByte
                  }
                  break
                case 2:
                  secondByte = buf[i + 1]
                  if ((secondByte & 0xC0) === 0x80) {
                    tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
                    if (tempCodePoint > 0x7F) {
                      codePoint = tempCodePoint
                    }
                  }
                  break
                case 3:
                  secondByte = buf[i + 1]
                  thirdByte = buf[i + 2]
                  if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                    tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
                    if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                      codePoint = tempCodePoint
                    }
                  }
                  break
                case 4:
                  secondByte = buf[i + 1]
                  thirdByte = buf[i + 2]
                  fourthByte = buf[i + 3]
                  if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                    tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
                    if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                      codePoint = tempCodePoint
                    }
                  }
              }
            }

            if (codePoint === null) {
              // we did not generate a valid codePoint so insert a
              // replacement char (U+FFFD) and advance only 1 byte
              codePoint = 0xFFFD
              bytesPerSequence = 1
            } else if (codePoint > 0xFFFF) {
              // encode to utf16 (surrogate pair dance)
              codePoint -= 0x10000
              res.push(codePoint >>> 10 & 0x3FF | 0xD800)
              codePoint = 0xDC00 | codePoint & 0x3FF
            }

            res.push(codePoint)
            i += bytesPerSequence
          }

          return decodeCodePointsArray(res)
        }

        // Based on http://stackoverflow.com/a/22747272/680742, the browser with
        // the lowest limit is Chrome, with 0x10000 args.
        // We go 1 magnitude less, for safety
        var MAX_ARGUMENTS_LENGTH = 0x1000

        function decodeCodePointsArray(codePoints) {
          var len = codePoints.length
          if (len <= MAX_ARGUMENTS_LENGTH) {
            return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
          }

          // Decode in chunks to avoid "call stack size exceeded".
          var res = ''
          var i = 0
          while (i < len) {
            res += String.fromCharCode.apply(
              String,
              codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
            )
          }
          return res
        }

        function asciiSlice(buf, start, end) {
          var ret = ''
          end = Math.min(buf.length, end)

          for (var i = start; i < end; ++i) {
            ret += String.fromCharCode(buf[i] & 0x7F)
          }
          return ret
        }

        function latin1Slice(buf, start, end) {
          var ret = ''
          end = Math.min(buf.length, end)

          for (var i = start; i < end; ++i) {
            ret += String.fromCharCode(buf[i])
          }
          return ret
        }

        function hexSlice(buf, start, end) {
          var len = buf.length

          if (!start || start < 0) start = 0
          if (!end || end < 0 || end > len) end = len

          var out = ''
          for (var i = start; i < end; ++i) {
            out += toHex(buf[i])
          }
          return out
        }

        function utf16leSlice(buf, start, end) {
          var bytes = buf.slice(start, end)
          var res = ''
          for (var i = 0; i < bytes.length; i += 2) {
            res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
          }
          return res
        }

        Buffer.prototype.slice = function slice(start, end) {
          var len = this.length
          start = ~~start
          end = end === undefined ? len : ~~end

          if (start < 0) {
            start += len
            if (start < 0) start = 0
          } else if (start > len) {
            start = len
          }

          if (end < 0) {
            end += len
            if (end < 0) end = 0
          } else if (end > len) {
            end = len
          }

          if (end < start) end = start

          var newBuf = this.subarray(start, end)
          // Return an augmented `Uint8Array` instance
          newBuf.__proto__ = Buffer.prototype
          return newBuf
        }

        /*
         * Need to make sure that buffer isn't trying to write out of bounds.
         */
        function checkOffset(offset, ext, length) {
          if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
          if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
        }

        Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
          offset = offset >>> 0
          byteLength = byteLength >>> 0
          if (!noAssert) checkOffset(offset, byteLength, this.length)

          var val = this[offset]
          var mul = 1
          var i = 0
          while (++i < byteLength && (mul *= 0x100)) {
            val += this[offset + i] * mul
          }

          return val
        }

        Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
          offset = offset >>> 0
          byteLength = byteLength >>> 0
          if (!noAssert) {
            checkOffset(offset, byteLength, this.length)
          }

          var val = this[offset + --byteLength]
          var mul = 1
          while (byteLength > 0 && (mul *= 0x100)) {
            val += this[offset + --byteLength] * mul
          }

          return val
        }

        Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
          offset = offset >>> 0
          if (!noAssert) checkOffset(offset, 1, this.length)
          return this[offset]
        }

        Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
          offset = offset >>> 0
          if (!noAssert) checkOffset(offset, 2, this.length)
          return this[offset] | (this[offset + 1] << 8)
        }

        Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
          offset = offset >>> 0
          if (!noAssert) checkOffset(offset, 2, this.length)
          return (this[offset] << 8) | this[offset + 1]
        }

        Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
          offset = offset >>> 0
          if (!noAssert) checkOffset(offset, 4, this.length)

          return ((this[offset]) |
            (this[offset + 1] << 8) |
            (this[offset + 2] << 16)) +
            (this[offset + 3] * 0x1000000)
        }

        Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
          offset = offset >>> 0
          if (!noAssert) checkOffset(offset, 4, this.length)

          return (this[offset] * 0x1000000) +
            ((this[offset + 1] << 16) |
              (this[offset + 2] << 8) |
              this[offset + 3])
        }

        Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
          offset = offset >>> 0
          byteLength = byteLength >>> 0
          if (!noAssert) checkOffset(offset, byteLength, this.length)

          var val = this[offset]
          var mul = 1
          var i = 0
          while (++i < byteLength && (mul *= 0x100)) {
            val += this[offset + i] * mul
          }
          mul *= 0x80

          if (val >= mul) val -= Math.pow(2, 8 * byteLength)

          return val
        }

        Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
          offset = offset >>> 0
          byteLength = byteLength >>> 0
          if (!noAssert) checkOffset(offset, byteLength, this.length)

          var i = byteLength
          var mul = 1
          var val = this[offset + --i]
          while (i > 0 && (mul *= 0x100)) {
            val += this[offset + --i] * mul
          }
          mul *= 0x80

          if (val >= mul) val -= Math.pow(2, 8 * byteLength)

          return val
        }

        Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
          offset = offset >>> 0
          if (!noAssert) checkOffset(offset, 1, this.length)
          if (!(this[offset] & 0x80)) return (this[offset])
          return ((0xff - this[offset] + 1) * -1)
        }

        Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
          offset = offset >>> 0
          if (!noAssert) checkOffset(offset, 2, this.length)
          var val = this[offset] | (this[offset + 1] << 8)
          return (val & 0x8000) ? val | 0xFFFF0000 : val
        }

        Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
          offset = offset >>> 0
          if (!noAssert) checkOffset(offset, 2, this.length)
          var val = this[offset + 1] | (this[offset] << 8)
          return (val & 0x8000) ? val | 0xFFFF0000 : val
        }

        Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
          offset = offset >>> 0
          if (!noAssert) checkOffset(offset, 4, this.length)

          return (this[offset]) |
            (this[offset + 1] << 8) |
            (this[offset + 2] << 16) |
            (this[offset + 3] << 24)
        }

        Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
          offset = offset >>> 0
          if (!noAssert) checkOffset(offset, 4, this.length)

          return (this[offset] << 24) |
            (this[offset + 1] << 16) |
            (this[offset + 2] << 8) |
            (this[offset + 3])
        }

        Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
          offset = offset >>> 0
          if (!noAssert) checkOffset(offset, 4, this.length)
          return ieee754.read(this, offset, true, 23, 4)
        }

        Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
          offset = offset >>> 0
          if (!noAssert) checkOffset(offset, 4, this.length)
          return ieee754.read(this, offset, false, 23, 4)
        }

        Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
          offset = offset >>> 0
          if (!noAssert) checkOffset(offset, 8, this.length)
          return ieee754.read(this, offset, true, 52, 8)
        }

        Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
          offset = offset >>> 0
          if (!noAssert) checkOffset(offset, 8, this.length)
          return ieee754.read(this, offset, false, 52, 8)
        }

        function checkInt(buf, value, offset, ext, max, min) {
          if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
          if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
          if (offset + ext > buf.length) throw new RangeError('Index out of range')
        }

        Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
          value = +value
          offset = offset >>> 0
          byteLength = byteLength >>> 0
          if (!noAssert) {
            var maxBytes = Math.pow(2, 8 * byteLength) - 1
            checkInt(this, value, offset, byteLength, maxBytes, 0)
          }

          var mul = 1
          var i = 0
          this[offset] = value & 0xFF
          while (++i < byteLength && (mul *= 0x100)) {
            this[offset + i] = (value / mul) & 0xFF
          }

          return offset + byteLength
        }

        Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
          value = +value
          offset = offset >>> 0
          byteLength = byteLength >>> 0
          if (!noAssert) {
            var maxBytes = Math.pow(2, 8 * byteLength) - 1
            checkInt(this, value, offset, byteLength, maxBytes, 0)
          }

          var i = byteLength - 1
          var mul = 1
          this[offset + i] = value & 0xFF
          while (--i >= 0 && (mul *= 0x100)) {
            this[offset + i] = (value / mul) & 0xFF
          }

          return offset + byteLength
        }

        Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
          value = +value
          offset = offset >>> 0
          if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
          this[offset] = (value & 0xff)
          return offset + 1
        }

        Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
          value = +value
          offset = offset >>> 0
          if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
          this[offset] = (value & 0xff)
          this[offset + 1] = (value >>> 8)
          return offset + 2
        }

        Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
          value = +value
          offset = offset >>> 0
          if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
          this[offset] = (value >>> 8)
          this[offset + 1] = (value & 0xff)
          return offset + 2
        }

        Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
          value = +value
          offset = offset >>> 0
          if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
          this[offset + 3] = (value >>> 24)
          this[offset + 2] = (value >>> 16)
          this[offset + 1] = (value >>> 8)
          this[offset] = (value & 0xff)
          return offset + 4
        }

        Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
          value = +value
          offset = offset >>> 0
          if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
          this[offset] = (value >>> 24)
          this[offset + 1] = (value >>> 16)
          this[offset + 2] = (value >>> 8)
          this[offset + 3] = (value & 0xff)
          return offset + 4
        }

        Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
          value = +value
          offset = offset >>> 0
          if (!noAssert) {
            var limit = Math.pow(2, (8 * byteLength) - 1)

            checkInt(this, value, offset, byteLength, limit - 1, -limit)
          }

          var i = 0
          var mul = 1
          var sub = 0
          this[offset] = value & 0xFF
          while (++i < byteLength && (mul *= 0x100)) {
            if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
              sub = 1
            }
            this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
          }

          return offset + byteLength
        }

        Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
          value = +value
          offset = offset >>> 0
          if (!noAssert) {
            var limit = Math.pow(2, (8 * byteLength) - 1)

            checkInt(this, value, offset, byteLength, limit - 1, -limit)
          }

          var i = byteLength - 1
          var mul = 1
          var sub = 0
          this[offset + i] = value & 0xFF
          while (--i >= 0 && (mul *= 0x100)) {
            if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
              sub = 1
            }
            this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
          }

          return offset + byteLength
        }

        Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
          value = +value
          offset = offset >>> 0
          if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
          if (value < 0) value = 0xff + value + 1
          this[offset] = (value & 0xff)
          return offset + 1
        }

        Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
          value = +value
          offset = offset >>> 0
          if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
          this[offset] = (value & 0xff)
          this[offset + 1] = (value >>> 8)
          return offset + 2
        }

        Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
          value = +value
          offset = offset >>> 0
          if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
          this[offset] = (value >>> 8)
          this[offset + 1] = (value & 0xff)
          return offset + 2
        }

        Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
          value = +value
          offset = offset >>> 0
          if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
          this[offset] = (value & 0xff)
          this[offset + 1] = (value >>> 8)
          this[offset + 2] = (value >>> 16)
          this[offset + 3] = (value >>> 24)
          return offset + 4
        }

        Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
          value = +value
          offset = offset >>> 0
          if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
          if (value < 0) value = 0xffffffff + value + 1
          this[offset] = (value >>> 24)
          this[offset + 1] = (value >>> 16)
          this[offset + 2] = (value >>> 8)
          this[offset + 3] = (value & 0xff)
          return offset + 4
        }

        function checkIEEE754(buf, value, offset, ext, max, min) {
          if (offset + ext > buf.length) throw new RangeError('Index out of range')
          if (offset < 0) throw new RangeError('Index out of range')
        }

        function writeFloat(buf, value, offset, littleEndian, noAssert) {
          value = +value
          offset = offset >>> 0
          if (!noAssert) {
            checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
          }
          ieee754.write(buf, value, offset, littleEndian, 23, 4)
          return offset + 4
        }

        Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
          return writeFloat(this, value, offset, true, noAssert)
        }

        Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
          return writeFloat(this, value, offset, false, noAssert)
        }

        function writeDouble(buf, value, offset, littleEndian, noAssert) {
          value = +value
          offset = offset >>> 0
          if (!noAssert) {
            checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
          }
          ieee754.write(buf, value, offset, littleEndian, 52, 8)
          return offset + 8
        }

        Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
          return writeDouble(this, value, offset, true, noAssert)
        }

        Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
          return writeDouble(this, value, offset, false, noAssert)
        }

        // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
        Buffer.prototype.copy = function copy(target, targetStart, start, end) {
          if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
          if (!start) start = 0
          if (!end && end !== 0) end = this.length
          if (targetStart >= target.length) targetStart = target.length
          if (!targetStart) targetStart = 0
          if (end > 0 && end < start) end = start

          // Copy 0 bytes; we're done
          if (end === start) return 0
          if (target.length === 0 || this.length === 0) return 0

          // Fatal error conditions
          if (targetStart < 0) {
            throw new RangeError('targetStart out of bounds')
          }
          if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
          if (end < 0) throw new RangeError('sourceEnd out of bounds')

          // Are we oob?
          if (end > this.length) end = this.length
          if (target.length - targetStart < end - start) {
            end = target.length - targetStart + start
          }

          var len = end - start

          if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
            // Use built-in when available, missing from IE11
            this.copyWithin(targetStart, start, end)
          } else if (this === target && start < targetStart && targetStart < end) {
            // descending copy from end
            for (var i = len - 1; i >= 0; --i) {
              target[i + targetStart] = this[i + start]
            }
          } else {
            Uint8Array.prototype.set.call(
              target,
              this.subarray(start, end),
              targetStart
            )
          }

          return len
        }

        // Usage:
        //    buffer.fill(number[, offset[, end]])
        //    buffer.fill(buffer[, offset[, end]])
        //    buffer.fill(string[, offset[, end]][, encoding])
        Buffer.prototype.fill = function fill(val, start, end, encoding) {
          // Handle string cases:
          if (typeof val === 'string') {
            if (typeof start === 'string') {
              encoding = start
              start = 0
              end = this.length
            } else if (typeof end === 'string') {
              encoding = end
              end = this.length
            }
            if (encoding !== undefined && typeof encoding !== 'string') {
              throw new TypeError('encoding must be a string')
            }
            if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
              throw new TypeError('Unknown encoding: ' + encoding)
            }
            if (val.length === 1) {
              var code = val.charCodeAt(0)
              if ((encoding === 'utf8' && code < 128) ||
                encoding === 'latin1') {
                // Fast path: If `val` fits into a single byte, use that numeric value.
                val = code
              }
            }
          } else if (typeof val === 'number') {
            val = val & 255
          }

          // Invalid ranges are not set to a default, so can range check early.
          if (start < 0 || this.length < start || this.length < end) {
            throw new RangeError('Out of range index')
          }

          if (end <= start) {
            return this
          }

          start = start >>> 0
          end = end === undefined ? this.length : end >>> 0

          if (!val) val = 0

          var i
          if (typeof val === 'number') {
            for (i = start; i < end; ++i) {
              this[i] = val
            }
          } else {
            var bytes = Buffer.isBuffer(val)
              ? val
              : Buffer.from(val, encoding)
            var len = bytes.length
            if (len === 0) {
              throw new TypeError('The value "' + val +
                '" is invalid for argument "value"')
            }
            for (i = 0; i < end - start; ++i) {
              this[i + start] = bytes[i % len]
            }
          }

          return this
        }

        // HELPER FUNCTIONS
        // ================

        var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

        function base64clean(str) {
          // Node takes equal signs as end of the Base64 encoding
          str = str.split('=')[0]
          // Node strips out invalid characters like \n and \t from the string, base64-js does not
          str = str.trim().replace(INVALID_BASE64_RE, '')
          // Node converts strings with length < 2 to ''
          if (str.length < 2) return ''
          // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
          while (str.length % 4 !== 0) {
            str = str + '='
          }
          return str
        }

        function toHex(n) {
          if (n < 16) return '0' + n.toString(16)
          return n.toString(16)
        }

        function utf8ToBytes(string, units) {
          units = units || Infinity
          var codePoint
          var length = string.length
          var leadSurrogate = null
          var bytes = []

          for (var i = 0; i < length; ++i) {
            codePoint = string.charCodeAt(i)

            // is surrogate component
            if (codePoint > 0xD7FF && codePoint < 0xE000) {
              // last char was a lead
              if (!leadSurrogate) {
                // no lead yet
                if (codePoint > 0xDBFF) {
                  // unexpected trail
                  if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
                  continue
                } else if (i + 1 === length) {
                  // unpaired lead
                  if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
                  continue
                }

                // valid lead
                leadSurrogate = codePoint

                continue
              }

              // 2 leads in a row
              if (codePoint < 0xDC00) {
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
                leadSurrogate = codePoint
                continue
              }

              // valid surrogate pair
              codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
            } else if (leadSurrogate) {
              // valid bmp char, but last char was a lead
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
            }

            leadSurrogate = null

            // encode utf8
            if (codePoint < 0x80) {
              if ((units -= 1) < 0) break
              bytes.push(codePoint)
            } else if (codePoint < 0x800) {
              if ((units -= 2) < 0) break
              bytes.push(
                codePoint >> 0x6 | 0xC0,
                codePoint & 0x3F | 0x80
              )
            } else if (codePoint < 0x10000) {
              if ((units -= 3) < 0) break
              bytes.push(
                codePoint >> 0xC | 0xE0,
                codePoint >> 0x6 & 0x3F | 0x80,
                codePoint & 0x3F | 0x80
              )
            } else if (codePoint < 0x110000) {
              if ((units -= 4) < 0) break
              bytes.push(
                codePoint >> 0x12 | 0xF0,
                codePoint >> 0xC & 0x3F | 0x80,
                codePoint >> 0x6 & 0x3F | 0x80,
                codePoint & 0x3F | 0x80
              )
            } else {
              throw new Error('Invalid code point')
            }
          }

          return bytes
        }

        function asciiToBytes(str) {
          var byteArray = []
          for (var i = 0; i < str.length; ++i) {
            // Node's code seems to be doing this and not & 0x7F..
            byteArray.push(str.charCodeAt(i) & 0xFF)
          }
          return byteArray
        }

        function utf16leToBytes(str, units) {
          var c, hi, lo
          var byteArray = []
          for (var i = 0; i < str.length; ++i) {
            if ((units -= 2) < 0) break

            c = str.charCodeAt(i)
            hi = c >> 8
            lo = c % 256
            byteArray.push(lo)
            byteArray.push(hi)
          }

          return byteArray
        }

        function base64ToBytes(str) {
          return base64.toByteArray(base64clean(str))
        }

        function blitBuffer(src, dst, offset, length) {
          for (var i = 0; i < length; ++i) {
            if ((i + offset >= dst.length) || (i >= src.length)) break
            dst[i + offset] = src[i]
          }
          return i
        }

        // ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
        // the `instanceof` check but they should be treated as of that type.
        // See: https://github.com/feross/buffer/issues/166
        function isInstance(obj, type) {
          return obj instanceof type ||
            (obj != null && obj.constructor != null && obj.constructor.name != null &&
              obj.constructor.name === type.name)
        }
        function numberIsNaN(obj) {
          // For IE11 support
          return obj !== obj // eslint-disable-line no-self-compare
        }

      }).call(this)
    }).call(this, require("buffer").Buffer)
  }, { "base64-js": 1, "buffer": 3, "ieee754": 4 }], 4: [function (require, module, exports) {
    /*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
    exports.read = function (buffer, offset, isLE, mLen, nBytes) {
      var e, m
      var eLen = (nBytes * 8) - mLen - 1
      var eMax = (1 << eLen) - 1
      var eBias = eMax >> 1
      var nBits = -7
      var i = isLE ? (nBytes - 1) : 0
      var d = isLE ? -1 : 1
      var s = buffer[offset + i]

      i += d

      e = s & ((1 << (-nBits)) - 1)
      s >>= (-nBits)
      nBits += eLen
      for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) { }

      m = e & ((1 << (-nBits)) - 1)
      e >>= (-nBits)
      nBits += mLen
      for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) { }

      if (e === 0) {
        e = 1 - eBias
      } else if (e === eMax) {
        return m ? NaN : ((s ? -1 : 1) * Infinity)
      } else {
        m = m + Math.pow(2, mLen)
        e = e - eBias
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
    }

    exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c
      var eLen = (nBytes * 8) - mLen - 1
      var eMax = (1 << eLen) - 1
      var eBias = eMax >> 1
      var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
      var i = isLE ? 0 : (nBytes - 1)
      var d = isLE ? 1 : -1
      var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

      value = Math.abs(value)

      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0
        e = eMax
      } else {
        e = Math.floor(Math.log(value) / Math.LN2)
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--
          c *= 2
        }
        if (e + eBias >= 1) {
          value += rt / c
        } else {
          value += rt * Math.pow(2, 1 - eBias)
        }
        if (value * c >= 2) {
          e++
          c /= 2
        }

        if (e + eBias >= eMax) {
          m = 0
          e = eMax
        } else if (e + eBias >= 1) {
          m = ((value * c) - 1) * Math.pow(2, mLen)
          e = e + eBias
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
          e = 0
        }
      }

      for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) { }

      e = (e << mLen) | m
      eLen += mLen
      for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) { }

      buffer[offset + i - d] |= s * 128
    }

  }, {}], 5: [function (require, module, exports) {
    // Copyright Joyent, Inc. and other Node contributors.
    //
    // Permission is hereby granted, free of charge, to any person obtaining a
    // copy of this software and associated documentation files (the
    // "Software"), to deal in the Software without restriction, including
    // without limitation the rights to use, copy, modify, merge, publish,
    // distribute, sublicense, and/or sell copies of the Software, and to permit
    // persons to whom the Software is furnished to do so, subject to the
    // following conditions:
    //
    // The above copyright notice and this permission notice shall be included
    // in all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
    // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
    // USE OR OTHER DEALINGS IN THE SOFTWARE.

    'use strict';

    // If obj.hasOwnProperty has been overridden, then calling
    // obj.hasOwnProperty(prop) will break.
    // See: https://github.com/joyent/node/issues/1707
    function hasOwnProperty(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }

    module.exports = function (qs, sep, eq, options) {
      sep = sep || '&';
      eq = eq || '=';
      var obj = {};

      if (typeof qs !== 'string' || qs.length === 0) {
        return obj;
      }

      var regexp = /\+/g;
      qs = qs.split(sep);

      var maxKeys = 1000;
      if (options && typeof options.maxKeys === 'number') {
        maxKeys = options.maxKeys;
      }

      var len = qs.length;
      // maxKeys <= 0 means that we should not limit keys count
      if (maxKeys > 0 && len > maxKeys) {
        len = maxKeys;
      }

      for (var i = 0; i < len; ++i) {
        var x = qs[i].replace(regexp, '%20'),
          idx = x.indexOf(eq),
          kstr, vstr, k, v;

        if (idx >= 0) {
          kstr = x.substr(0, idx);
          vstr = x.substr(idx + 1);
        } else {
          kstr = x;
          vstr = '';
        }

        k = decodeURIComponent(kstr);
        v = decodeURIComponent(vstr);

        if (!hasOwnProperty(obj, k)) {
          obj[k] = v;
        } else if (isArray(obj[k])) {
          obj[k].push(v);
        } else {
          obj[k] = [obj[k], v];
        }
      }

      return obj;
    };

    var isArray = Array.isArray || function (xs) {
      return Object.prototype.toString.call(xs) === '[object Array]';
    };

  }, {}], 6: [function (require, module, exports) {
    // Copyright Joyent, Inc. and other Node contributors.
    //
    // Permission is hereby granted, free of charge, to any person obtaining a
    // copy of this software and associated documentation files (the
    // "Software"), to deal in the Software without restriction, including
    // without limitation the rights to use, copy, modify, merge, publish,
    // distribute, sublicense, and/or sell copies of the Software, and to permit
    // persons to whom the Software is furnished to do so, subject to the
    // following conditions:
    //
    // The above copyright notice and this permission notice shall be included
    // in all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
    // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
    // USE OR OTHER DEALINGS IN THE SOFTWARE.

    'use strict';

    var stringifyPrimitive = function (v) {
      switch (typeof v) {
        case 'string':
          return v;

        case 'boolean':
          return v ? 'true' : 'false';

        case 'number':
          return isFinite(v) ? v : '';

        default:
          return '';
      }
    };

    module.exports = function (obj, sep, eq, name) {
      sep = sep || '&';
      eq = eq || '=';
      if (obj === null) {
        obj = undefined;
      }

      if (typeof obj === 'object') {
        return map(objectKeys(obj), function (k) {
          var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
          if (isArray(obj[k])) {
            return map(obj[k], function (v) {
              return ks + encodeURIComponent(stringifyPrimitive(v));
            }).join(sep);
          } else {
            return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
          }
        }).join(sep);

      }

      if (!name) return '';
      return encodeURIComponent(stringifyPrimitive(name)) + eq +
        encodeURIComponent(stringifyPrimitive(obj));
    };

    var isArray = Array.isArray || function (xs) {
      return Object.prototype.toString.call(xs) === '[object Array]';
    };

    function map(xs, f) {
      if (xs.map) return xs.map(f);
      var res = [];
      for (var i = 0; i < xs.length; i++) {
        res.push(f(xs[i], i));
      }
      return res;
    }

    var objectKeys = Object.keys || function (obj) {
      var res = [];
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
      }
      return res;
    };

  }, {}], 7: [function (require, module, exports) {
    'use strict';

    exports.decode = exports.parse = require('./decode');
    exports.encode = exports.stringify = require('./encode');

  }, { "./decode": 5, "./encode": 6 }], 8: [function (require, module, exports) {

    /**
     * Expose `Emitter`.
     */

    if (typeof module !== 'undefined') {
      module.exports = Emitter;
    }

    /**
     * Initialize a new `Emitter`.
     *
     * @api public
     */

    function Emitter(obj) {
      if (obj) return mixin(obj);
    };

    /**
     * Mixin the emitter properties.
     *
     * @param {Object} obj
     * @return {Object}
     * @api private
     */

    function mixin(obj) {
      for (var key in Emitter.prototype) {
        obj[key] = Emitter.prototype[key];
      }
      return obj;
    }

    /**
     * Listen on the given `event` with `fn`.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.on =
      Emitter.prototype.addEventListener = function (event, fn) {
        this._callbacks = this._callbacks || {};
        (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
          .push(fn);
        return this;
      };

    /**
     * Adds an `event` listener that will be invoked a single
     * time then automatically removed.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.once = function (event, fn) {
      function on() {
        this.off(event, on);
        fn.apply(this, arguments);
      }

      on.fn = fn;
      this.on(event, on);
      return this;
    };

    /**
     * Remove the given callback for `event` or all
     * registered callbacks.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.off =
      Emitter.prototype.removeListener =
      Emitter.prototype.removeAllListeners =
      Emitter.prototype.removeEventListener = function (event, fn) {
        this._callbacks = this._callbacks || {};

        // all
        if (0 == arguments.length) {
          this._callbacks = {};
          return this;
        }

        // specific event
        var callbacks = this._callbacks['$' + event];
        if (!callbacks) return this;

        // remove all handlers
        if (1 == arguments.length) {
          delete this._callbacks['$' + event];
          return this;
        }

        // remove specific handler
        var cb;
        for (var i = 0; i < callbacks.length; i++) {
          cb = callbacks[i];
          if (cb === fn || cb.fn === fn) {
            callbacks.splice(i, 1);
            break;
          }
        }

        // Remove event specific arrays for event types that no
        // one is subscribed for to avoid memory leak.
        if (callbacks.length === 0) {
          delete this._callbacks['$' + event];
        }

        return this;
      };

    /**
     * Emit `event` with the given args.
     *
     * @param {String} event
     * @param {Mixed} ...
     * @return {Emitter}
     */

    Emitter.prototype.emit = function (event) {
      this._callbacks = this._callbacks || {};

      var args = new Array(arguments.length - 1)
        , callbacks = this._callbacks['$' + event];

      for (var i = 1; i < arguments.length; i++) {
        args[i - 1] = arguments[i];
      }

      if (callbacks) {
        callbacks = callbacks.slice(0);
        for (var i = 0, len = callbacks.length; i < len; ++i) {
          callbacks[i].apply(this, args);
        }
      }

      return this;
    };

    /**
     * Return array of callbacks for `event`.
     *
     * @param {String} event
     * @return {Array}
     * @api public
     */

    Emitter.prototype.listeners = function (event) {
      this._callbacks = this._callbacks || {};
      return this._callbacks['$' + event] || [];
    };

    /**
     * Check if this emitter has `event` handlers.
     *
     * @param {String} event
     * @return {Boolean}
     * @api public
     */

    Emitter.prototype.hasListeners = function (event) {
      return !!this.listeners(event).length;
    };

  }, {}], 9: [function (require, module, exports) {
    module.exports = stringify
    stringify.default = stringify
    stringify.stable = deterministicStringify
    stringify.stableStringify = deterministicStringify

    var LIMIT_REPLACE_NODE = '[...]'
    var CIRCULAR_REPLACE_NODE = '[Circular]'

    var arr = []
    var replacerStack = []

    function defaultOptions() {
      return {
        depthLimit: Number.MAX_SAFE_INTEGER,
        edgesLimit: Number.MAX_SAFE_INTEGER
      }
    }

    // Regular stringify
    function stringify(obj, replacer, spacer, options) {
      if (typeof options === 'undefined') {
        options = defaultOptions()
      }

      decirc(obj, '', 0, [], undefined, 0, options)
      var res
      try {
        if (replacerStack.length === 0) {
          res = JSON.stringify(obj, replacer, spacer)
        } else {
          res = JSON.stringify(obj, replaceGetterValues(replacer), spacer)
        }
      } catch (_) {
        return JSON.stringify('[unable to serialize, circular reference is too complex to analyze]')
      } finally {
        while (arr.length !== 0) {
          var part = arr.pop()
          if (part.length === 4) {
            Object.defineProperty(part[0], part[1], part[3])
          } else {
            part[0][part[1]] = part[2]
          }
        }
      }
      return res
    }

    function setReplace(replace, val, k, parent) {
      var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k)
      if (propertyDescriptor.get !== undefined) {
        if (propertyDescriptor.configurable) {
          Object.defineProperty(parent, k, { value: replace })
          arr.push([parent, k, val, propertyDescriptor])
        } else {
          replacerStack.push([val, k, replace])
        }
      } else {
        parent[k] = replace
        arr.push([parent, k, val])
      }
    }

    function decirc(val, k, edgeIndex, stack, parent, depth, options) {
      depth += 1
      var i
      if (typeof val === 'object' && val !== null) {
        for (i = 0; i < stack.length; i++) {
          if (stack[i] === val) {
            setReplace(CIRCULAR_REPLACE_NODE, val, k, parent)
            return
          }
        }

        if (
          typeof options.depthLimit !== 'undefined' &&
          depth > options.depthLimit
        ) {
          setReplace(LIMIT_REPLACE_NODE, val, k, parent)
          return
        }

        if (
          typeof options.edgesLimit !== 'undefined' &&
          edgeIndex + 1 > options.edgesLimit
        ) {
          setReplace(LIMIT_REPLACE_NODE, val, k, parent)
          return
        }

        stack.push(val)
        // Optimize for Arrays. Big arrays could kill the performance otherwise!
        if (Array.isArray(val)) {
          for (i = 0; i < val.length; i++) {
            decirc(val[i], i, i, stack, val, depth, options)
          }
        } else {
          var keys = Object.keys(val)
          for (i = 0; i < keys.length; i++) {
            var key = keys[i]
            decirc(val[key], key, i, stack, val, depth, options)
          }
        }
        stack.pop()
      }
    }

    // Stable-stringify
    function compareFunction(a, b) {
      if (a < b) {
        return -1
      }
      if (a > b) {
        return 1
      }
      return 0
    }

    function deterministicStringify(obj, replacer, spacer, options) {
      if (typeof options === 'undefined') {
        options = defaultOptions()
      }

      var tmp = deterministicDecirc(obj, '', 0, [], undefined, 0, options) || obj
      var res
      try {
        if (replacerStack.length === 0) {
          res = JSON.stringify(tmp, replacer, spacer)
        } else {
          res = JSON.stringify(tmp, replaceGetterValues(replacer), spacer)
        }
      } catch (_) {
        return JSON.stringify('[unable to serialize, circular reference is too complex to analyze]')
      } finally {
        // Ensure that we restore the object as it was.
        while (arr.length !== 0) {
          var part = arr.pop()
          if (part.length === 4) {
            Object.defineProperty(part[0], part[1], part[3])
          } else {
            part[0][part[1]] = part[2]
          }
        }
      }
      return res
    }

    function deterministicDecirc(val, k, edgeIndex, stack, parent, depth, options) {
      depth += 1
      var i
      if (typeof val === 'object' && val !== null) {
        for (i = 0; i < stack.length; i++) {
          if (stack[i] === val) {
            setReplace(CIRCULAR_REPLACE_NODE, val, k, parent)
            return
          }
        }
        try {
          if (typeof val.toJSON === 'function') {
            return
          }
        } catch (_) {
          return
        }

        if (
          typeof options.depthLimit !== 'undefined' &&
          depth > options.depthLimit
        ) {
          setReplace(LIMIT_REPLACE_NODE, val, k, parent)
          return
        }

        if (
          typeof options.edgesLimit !== 'undefined' &&
          edgeIndex + 1 > options.edgesLimit
        ) {
          setReplace(LIMIT_REPLACE_NODE, val, k, parent)
          return
        }

        stack.push(val)
        // Optimize for Arrays. Big arrays could kill the performance otherwise!
        if (Array.isArray(val)) {
          for (i = 0; i < val.length; i++) {
            deterministicDecirc(val[i], i, i, stack, val, depth, options)
          }
        } else {
          // Create a temporary object in the required way
          var tmp = {}
          var keys = Object.keys(val).sort(compareFunction)
          for (i = 0; i < keys.length; i++) {
            var key = keys[i]
            deterministicDecirc(val[key], key, i, stack, val, depth, options)
            tmp[key] = val[key]
          }
          if (typeof parent !== 'undefined') {
            arr.push([parent, k, val])
            parent[k] = tmp
          } else {
            return tmp
          }
        }
        stack.pop()
      }
    }

    // wraps replacer function to handle values we couldn't replace
    // and mark them as replaced value
    function replaceGetterValues(replacer) {
      replacer =
        typeof replacer !== 'undefined'
          ? replacer
          : function (k, v) {
            return v
          }
      return function (key, val) {
        if (replacerStack.length > 0) {
          for (var i = 0; i < replacerStack.length; i++) {
            var part = replacerStack[i]
            if (part[1] === key && part[0] === val) {
              val = part[2]
              replacerStack.splice(i, 1)
              break
            }
          }
        }
        return replacer.call(this, key, val)
      }
    }

  }, {}], 10: [function (require, module, exports) {
    (function (Buffer) {
      (function () {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports["default"] = void 0;
        var _superagent = _interopRequireDefault(require("superagent"));
        var _querystring = _interopRequireDefault(require("querystring"));
        function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
        function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
        function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
        function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
        function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
        /**
        * @module ApiClient
        * @version v1
        */
        /**
        * Manages low level client-server communications, parameter marshalling, etc. There should not be any need for an
        * application to use this class directly - the *Api and model classes provide the public API for the service. The
        * contents of this file should be regarded as internal but are documented for completeness.
        * @alias module:ApiClient
        * @class
        */
        var ApiClient = /*#__PURE__*/function () {
          /**
           * The base URL against which to resolve every API call's (relative) path.
           * Overrides the default value set in spec file if present
           * @param {String} basePath
           */
          function ApiClient() {
            var basePath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'http://localhost';
            _classCallCheck(this, ApiClient);
            /**
             * The base URL against which to resolve every API call's (relative) path.
             * @type {String}
             * @default http://localhost
             */
            this.basePath = basePath.replace(/\/+$/, '');

            /**
             * The authentication methods to be included for all API calls.
             * @type {Array.<String>}
             */
            this.authentications = {};

            /**
             * The default HTTP headers to be included for all API calls.
             * @type {Array.<String>}
             * @default {}
             */
            this.defaultHeaders = {
              'User-Agent': 'OpenAPI-Generator/v1/Javascript'
            };

            /**
             * The default HTTP timeout for all API calls.
             * @type {Number}
             * @default 60000
             */
            this.timeout = 60000;

            /**
             * If set to false an additional timestamp parameter is added to all API GET calls to
             * prevent browser caching
             * @type {Boolean}
             * @default true
             */
            this.cache = true;

            /**
             * If set to true, the client will save the cookies from each server
             * response, and return them in the next request.
             * @default false
             */
            this.enableCookies = false;

            /*
             * Used to save and return cookies in a node.js (non-browser) setting,
             * if this.enableCookies is set to true.
             */
            if (typeof window === 'undefined') {
              this.agent = new _superagent["default"].agent();
            }

            /*
             * Allow user to override superagent agent
             */
            this.requestAgent = null;

            /*
             * Allow user to add superagent plugins
             */
            this.plugins = null;
          }

          /**
          * Returns a string representation for an actual parameter.
          * @param param The actual parameter.
          * @returns {String} The string representation of <code>param</code>.
          */
          _createClass(ApiClient, [{
            key: "paramToString",
            value: function paramToString(param) {
              if (param == undefined || param == null) {
                return '';
              }
              if (param instanceof Date) {
                return param.toJSON();
              }
              if (ApiClient.canBeJsonified(param)) {
                return JSON.stringify(param);
              }
              return param.toString();
            }

            /**
            * Returns a boolean indicating if the parameter could be JSON.stringified
            * @param param The actual parameter
            * @returns {Boolean} Flag indicating if <code>param</code> can be JSON.stringified
            */
          }, {
            key: "buildUrl",
            value:
              /**
               * Builds full URL by appending the given path to the base URL and replacing path parameter place-holders with parameter values.
               * NOTE: query parameters are not handled here.
               * @param {String} path The path to append to the base URL.
               * @param {Object} pathParams The parameter values to append.
               * @param {String} apiBasePath Base path defined in the path, operation level to override the default one
               * @returns {String} The encoded path with parameter values substituted.
               */
              function buildUrl(path, pathParams, apiBasePath) {
                var _this = this;
                if (!path.match(/^\//)) {
                  path = '/' + path;
                }
                var url = this.basePath + path;

                // use API (operation, path) base path if defined
                if (apiBasePath !== null && apiBasePath !== undefined) {
                  url = apiBasePath + path;
                }
                url = url.replace(/\{([\w-\.]+)\}/g, function (fullMatch, key) {
                  var value;
                  if (pathParams.hasOwnProperty(key)) {
                    value = _this.paramToString(pathParams[key]);
                  } else {
                    value = fullMatch;
                  }
                  return encodeURIComponent(value);
                });
                return url;
              }

            /**
            * Checks whether the given content type represents JSON.<br>
            * JSON content type examples:<br>
            * <ul>
            * <li>application/json</li>
            * <li>application/json; charset=UTF8</li>
            * <li>APPLICATION/JSON</li>
            * </ul>
            * @param {String} contentType The MIME content type to check.
            * @returns {Boolean} <code>true</code> if <code>contentType</code> represents JSON, otherwise <code>false</code>.
            */
          }, {
            key: "isJsonMime",
            value: function isJsonMime(contentType) {
              return Boolean(contentType != null && contentType.match(/^application\/json(;.*)?$/i));
            }

            /**
            * Chooses a content type from the given array, with JSON preferred; i.e. return JSON if included, otherwise return the first.
            * @param {Array.<String>} contentTypes
            * @returns {String} The chosen content type, preferring JSON.
            */
          }, {
            key: "jsonPreferredMime",
            value: function jsonPreferredMime(contentTypes) {
              for (var i = 0; i < contentTypes.length; i++) {
                if (this.isJsonMime(contentTypes[i])) {
                  return contentTypes[i];
                }
              }
              return contentTypes[0];
            }

            /**
            * Checks whether the given parameter value represents file-like content.
            * @param param The parameter to check.
            * @returns {Boolean} <code>true</code> if <code>param</code> represents a file.
            */
          }, {
            key: "isFileParam",
            value: function isFileParam(param) {
              // fs.ReadStream in Node.js and Electron (but not in runtime like browserify)
              if (typeof require === 'function') {
                var fs;
                try {
                  fs = require('fs');
                } catch (err) { }
                if (fs && fs.ReadStream && param instanceof fs.ReadStream) {
                  return true;
                }
              }

              // Buffer in Node.js
              if (typeof Buffer === 'function' && param instanceof Buffer) {
                return true;
              }

              // Blob in browser
              if (typeof Blob === 'function' && param instanceof Blob) {
                return true;
              }

              // File in browser (it seems File object is also instance of Blob, but keep this for safe)
              if (typeof File === 'function' && param instanceof File) {
                return true;
              }
              return false;
            }

            /**
            * Normalizes parameter values:
            * <ul>
            * <li>remove nils</li>
            * <li>keep files and arrays</li>
            * <li>format to string with `paramToString` for other cases</li>
            * </ul>
            * @param {Object.<String, Object>} params The parameters as object properties.
            * @returns {Object.<String, Object>} normalized parameters.
            */
          }, {
            key: "normalizeParams",
            value: function normalizeParams(params) {
              var newParams = {};
              for (var key in params) {
                if (params.hasOwnProperty(key) && params[key] != undefined && params[key] != null) {
                  var value = params[key];
                  if (this.isFileParam(value) || Array.isArray(value)) {
                    newParams[key] = value;
                  } else {
                    newParams[key] = this.paramToString(value);
                  }
                }
              }
              return newParams;
            }

            /**
            * Builds a string representation of an array-type actual parameter, according to the given collection format.
            * @param {Array} param An array parameter.
            * @param {module:ApiClient.CollectionFormatEnum} collectionFormat The array element separator strategy.
            * @returns {String|Array} A string representation of the supplied collection, using the specified delimiter. Returns
            * <code>param</code> as is if <code>collectionFormat</code> is <code>multi</code>.
            */
          }, {
            key: "buildCollectionParam",
            value: function buildCollectionParam(param, collectionFormat) {
              if (param == null) {
                return null;
              }
              switch (collectionFormat) {
                case 'csv':
                  return param.map(this.paramToString, this).join(',');
                case 'ssv':
                  return param.map(this.paramToString, this).join(' ');
                case 'tsv':
                  return param.map(this.paramToString, this).join('\t');
                case 'pipes':
                  return param.map(this.paramToString, this).join('|');
                case 'multi':
                  //return the array directly as SuperAgent will handle it as expected
                  return param.map(this.paramToString, this);
                case 'passthrough':
                  return param;
                default:
                  throw new Error('Unknown collection format: ' + collectionFormat);
              }
            }

            /**
            * Applies authentication headers to the request.
            * @param {Object} request The request object created by a <code>superagent()</code> call.
            * @param {Array.<String>} authNames An array of authentication method names.
            */
          }, {
            key: "applyAuthToRequest",
            value: function applyAuthToRequest(request, authNames) {
              var _this2 = this;
              authNames.forEach(function (authName) {
                var auth = _this2.authentications[authName];
                switch (auth.type) {
                  case 'basic':
                    if (auth.username || auth.password) {
                      request.auth(auth.username || '', auth.password || '');
                    }
                    break;
                  case 'bearer':
                    if (auth.accessToken) {
                      var localVarBearerToken = typeof auth.accessToken === 'function' ? auth.accessToken() : auth.accessToken;
                      request.set({
                        'Authorization': 'Bearer ' + localVarBearerToken
                      });
                    }
                    break;
                  case 'apiKey':
                    if (auth.apiKey) {
                      var data = {};
                      if (auth.apiKeyPrefix) {
                        data[auth.name] = auth.apiKeyPrefix + ' ' + auth.apiKey;
                      } else {
                        data[auth.name] = auth.apiKey;
                      }
                      if (auth['in'] === 'header') {
                        request.set(data);
                      } else {
                        request.query(data);
                      }
                    }
                    break;
                  case 'oauth2':
                    if (auth.accessToken) {
                      request.set({
                        'Authorization': 'Bearer ' + auth.accessToken
                      });
                    }
                    break;
                  default:
                    throw new Error('Unknown authentication type: ' + auth.type);
                }
              });
            }

            /**
             * Deserializes an HTTP response body into a value of the specified type.
             * @param {Object} response A SuperAgent response object.
             * @param {(String|Array.<String>|Object.<String, Object>|Function)} returnType The type to return. Pass a string for simple types
             * or the constructor function for a complex type. Pass an array containing the type name to return an array of that type. To
             * return an object, pass an object with one property whose name is the key type and whose value is the corresponding value type:
             * all properties on <code>data<code> will be converted to this type.
             * @returns A value of the specified type.
             */
          }, {
            key: "deserialize",
            value: function deserialize(response, returnType) {
              if (response == null || returnType == null || response.status == 204) {
                return null;
              }

              // Rely on SuperAgent for parsing response body.
              // See http://visionmedia.github.io/superagent/#parsing-response-bodies
              var data = response.body;
              if (data == null || _typeof(data) === 'object' && typeof data.length === 'undefined' && !Object.keys(data).length) {
                // SuperAgent does not always produce a body; use the unparsed response as a fallback
                data = response.text;
              }
              return ApiClient.convertToType(data, returnType);
            }

            /**
             * Callback function to receive the result of the operation.
             * @callback module:ApiClient~callApiCallback
             * @param {String} error Error message, if any.
             * @param data The data returned by the service call.
             * @param {String} response The complete HTTP response.
             */

            /**
             * Invokes the REST service using the supplied settings and parameters.
             * @param {String} path The base URL to invoke.
             * @param {String} httpMethod The HTTP method to use.
             * @param {Object.<String, String>} pathParams A map of path parameters and their values.
             * @param {Object.<String, Object>} queryParams A map of query parameters and their values.
             * @param {Object.<String, Object>} headerParams A map of header parameters and their values.
             * @param {Object.<String, Object>} formParams A map of form parameters and their values.
             * @param {Object} bodyParam The value to pass as the request body.
             * @param {Array.<String>} authNames An array of authentication type names.
             * @param {Array.<String>} contentTypes An array of request MIME types.
             * @param {Array.<String>} accepts An array of acceptable response MIME types.
             * @param {(String|Array|ObjectFunction)} returnType The required type to return; can be a string for simple types or the
             * constructor for a complex type.
             * @param {String} apiBasePath base path defined in the operation/path level to override the default one
             * @param {module:ApiClient~callApiCallback} callback The callback function.
             * @returns {Object} The SuperAgent request object.
             */
          }, {
            key: "callApi",
            value: function callApi(path, httpMethod, pathParams, queryParams, headerParams, formParams, bodyParam, authNames, contentTypes, accepts, returnType, apiBasePath, callback) {
              var _this3 = this;
              var url = this.buildUrl(path, pathParams, apiBasePath);
              var request = (0, _superagent["default"])(httpMethod, url);
              if (this.plugins !== null) {
                for (var index in this.plugins) {
                  if (this.plugins.hasOwnProperty(index)) {
                    request.use(this.plugins[index]);
                  }
                }
              }

              // apply authentications
              this.applyAuthToRequest(request, authNames);

              // set query parameters
              if (httpMethod.toUpperCase() === 'GET' && this.cache === false) {
                queryParams['_'] = new Date().getTime();
              }
              request.query(this.normalizeParams(queryParams));

              // set header parameters
              request.set(this.defaultHeaders).set(this.normalizeParams(headerParams));

              // set requestAgent if it is set by user
              if (this.requestAgent) {
                request.agent(this.requestAgent);
              }

              // set request timeout
              request.timeout(this.timeout);
              var contentType = this.jsonPreferredMime(contentTypes);
              if (contentType) {
                // Issue with superagent and multipart/form-data (https://github.com/visionmedia/superagent/issues/746)
                if (contentType != 'multipart/form-data') {
                  request.type(contentType);
                }
              }
              if (contentType === 'application/x-www-form-urlencoded') {
                request.send(_querystring["default"].stringify(this.normalizeParams(formParams)));
              } else if (contentType == 'multipart/form-data') {
                var _formParams = this.normalizeParams(formParams);
                for (var key in _formParams) {
                  if (_formParams.hasOwnProperty(key)) {
                    var _formParamsValue = _formParams[key];
                    if (this.isFileParam(_formParamsValue)) {
                      // file field
                      request.attach(key, _formParamsValue);
                    } else if (Array.isArray(_formParamsValue) && _formParamsValue.length && this.isFileParam(_formParamsValue[0])) {
                      // multiple files
                      _formParamsValue.forEach(function (file) {
                        return request.attach(key, file);
                      });
                    } else {
                      request.field(key, _formParamsValue);
                    }
                  }
                }
              } else if (bodyParam !== null && bodyParam !== undefined) {
                if (!request.header['Content-Type']) {
                  request.type('application/json');
                }
                request.send(bodyParam);
              }
              var accept = this.jsonPreferredMime(accepts);
              if (accept) {
                request.accept(accept);
              }
              if (returnType === 'Blob') {
                request.responseType('blob');
              } else if (returnType === 'String') {
                request.responseType('text');
              }

              // Attach previously saved cookies, if enabled
              if (this.enableCookies) {
                if (typeof window === 'undefined') {
                  this.agent._attachCookies(request);
                } else {
                  request.withCredentials();
                }
              }
              request.end(function (error, response) {
                if (callback) {
                  var data = null;
                  if (!error) {
                    try {
                      data = _this3.deserialize(response, returnType);
                      if (_this3.enableCookies && typeof window === 'undefined') {
                        _this3.agent._saveCookies(response);
                      }
                    } catch (err) {
                      error = err;
                    }
                  }
                  callback(error, data, response);
                }
              });
              return request;
            }

            /**
            * Parses an ISO-8601 string representation or epoch representation of a date value.
            * @param {String} str The date value as a string.
            * @returns {Date} The parsed date object.
            */
          }, {
            key: "hostSettings",
            value:
              /**
                * Gets an array of host settings
                * @returns An array of host settings
                */
              function hostSettings() {
                return [{
                  'url': "",
                  'description': "No description provided"
                }];
              }
          }, {
            key: "getBasePathFromSettings",
            value: function getBasePathFromSettings(index) {
              var variables = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
              var servers = this.hostSettings();

              // check array index out of bound
              if (index < 0 || index >= servers.length) {
                throw new Error("Invalid index " + index + " when selecting the host settings. Must be less than " + servers.length);
              }
              var server = servers[index];
              var url = server['url'];

              // go through variable and assign a value
              for (var variable_name in server['variables']) {
                if (variable_name in variables) {
                  var variable = server['variables'][variable_name];
                  if (!('enum_values' in variable) || variable['enum_values'].includes(variables[variable_name])) {
                    url = url.replace("{" + variable_name + "}", variables[variable_name]);
                  } else {
                    throw new Error("The variable `" + variable_name + "` in the host URL has invalid value " + variables[variable_name] + ". Must be " + server['variables'][variable_name]['enum_values'] + ".");
                  }
                } else {
                  // use default value
                  url = url.replace("{" + variable_name + "}", server['variables'][variable_name]['default_value']);
                }
              }
              return url;
            }

            /**
            * Constructs a new map or array model from REST data.
            * @param data {Object|Array} The REST data.
            * @param obj {Object|Array} The target object or array.
            */
          }], [{
            key: "canBeJsonified",
            value: function canBeJsonified(str) {
              if (typeof str !== 'string' && _typeof(str) !== 'object') return false;
              try {
                var type = str.toString();
                return type === '[object Object]' || type === '[object Array]';
              } catch (err) {
                return false;
              }
            }
          }, {
            key: "parseDate",
            value: function parseDate(str) {
              if (isNaN(str)) {
                return new Date(str.replace(/(\d)(T)(\d)/i, '$1 $3'));
              }
              return new Date(+str);
            }

            /**
            * Converts a value to the specified type.
            * @param {(String|Object)} data The data to convert, as a string or object.
            * @param {(String|Array.<String>|Object.<String, Object>|Function)} type The type to return. Pass a string for simple types
            * or the constructor function for a complex type. Pass an array containing the type name to return an array of that type. To
            * return an object, pass an object with one property whose name is the key type and whose value is the corresponding value type:
            * all properties on <code>data<code> will be converted to this type.
            * @returns An instance of the specified type or null or undefined if data is null or undefined.
            */
          }, {
            key: "convertToType",
            value: function convertToType(data, type) {
              if (data === null || data === undefined) return data;
              switch (type) {
                case 'Boolean':
                  return Boolean(data);
                case 'Integer':
                  return parseInt(data, 10);
                case 'Number':
                  return parseFloat(data);
                case 'String':
                  return String(data);
                case 'Date':
                  return ApiClient.parseDate(String(data));
                case 'Blob':
                  return data;
                default:
                  if (type === Object) {
                    // generic object, return directly
                    return data;
                  } else if (typeof type.constructFromObject === 'function') {
                    // for model type like User and enum class
                    return type.constructFromObject(data);
                  } else if (Array.isArray(type)) {
                    // for array type like: ['String']
                    var itemType = type[0];
                    return data.map(function (item) {
                      return ApiClient.convertToType(item, itemType);
                    });
                  } else if (_typeof(type) === 'object') {
                    // for plain object type like: {'String': 'Integer'}
                    var keyType, valueType;
                    for (var k in type) {
                      if (type.hasOwnProperty(k)) {
                        keyType = k;
                        valueType = type[k];
                        break;
                      }
                    }
                    var result = {};
                    for (var k in data) {
                      if (data.hasOwnProperty(k)) {
                        var key = ApiClient.convertToType(k, keyType);
                        var value = ApiClient.convertToType(data[k], valueType);
                        result[key] = value;
                      }
                    }
                    return result;
                  } else {
                    // for unknown type, return the data directly
                    return data;
                  }
              }
            }
          }, {
            key: "constructFromObject",
            value: function constructFromObject(data, obj, itemType) {
              if (Array.isArray(data)) {
                for (var i = 0; i < data.length; i++) {
                  if (data.hasOwnProperty(i)) obj[i] = ApiClient.convertToType(data[i], itemType);
                }
              } else {
                for (var k in data) {
                  if (data.hasOwnProperty(k)) obj[k] = ApiClient.convertToType(data[k], itemType);
                }
              }
            }
          }]);
          return ApiClient;
        }();
        /**
         * Enumeration of collection format separator strategies.
         * @enum {String}
         * @readonly
         */
        ApiClient.CollectionFormatEnum = {
          /**
           * Comma-separated values. Value: <code>csv</code>
           * @const
           */
          CSV: ',',
          /**
           * Space-separated values. Value: <code>ssv</code>
           * @const
           */
          SSV: ' ',
          /**
           * Tab-separated values. Value: <code>tsv</code>
           * @const
           */
          TSV: '\t',
          /**
           * Pipe(|)-separated values. Value: <code>pipes</code>
           * @const
           */
          PIPES: '|',
          /**
           * Native array. Value: <code>multi</code>
           * @const
           */
          MULTI: 'multi'
        };

        /**
        * The default API client implementation.
        * @type {module:ApiClient}
        */
        ApiClient.instance = new ApiClient();
        var _default = ApiClient;
        exports["default"] = _default;
      }).call(this)
    }).call(this, require("buffer").Buffer)
  }, { "buffer": 3, "fs": 2, "querystring": 7, "superagent": 29 }], 11: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports["default"] = void 0;
    var _ApiClient = _interopRequireDefault(require("../ApiClient"));
    var _BugetPlan = _interopRequireDefault(require("../model/BugetPlan"));
    var _Month = _interopRequireDefault(require("../model/Month"));
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
    /**
    * BugetPlan service.
    * @module api/BugetPlanApi
    * @version v1
    */
    var BugetPlanApi = /*#__PURE__*/function () {
      /**
      * Constructs a new BugetPlanApi. 
      * @alias module:api/BugetPlanApi
      * @class
      * @param {module:ApiClient} [apiClient] Optional API client implementation to use,
      * default to {@link module:ApiClient#instance} if unspecified.
      */
      function BugetPlanApi(apiClient) {
        _classCallCheck(this, BugetPlanApi);
        this.apiClient = apiClient || _ApiClient["default"].instance;
      }

      /**
       * Callback function to receive the result of the createBugetPlan operation.
       * @callback module:api/BugetPlanApi~createBugetPlanCallback
       * @param {String} error Error message, if any.
       * @param data This operation does not return a value.
       * @param {String} response The complete HTTP response.
       */

      /**
       * можно создать только 1 на департамент
       * @param {Number} companyId 
       * @param {Number} departmnetId 
       * @param {Object} opts Optional parameters
       * @param {module:model/BugetPlan} opts.bugetPlan 
       * @param {module:api/BugetPlanApi~createBugetPlanCallback} callback The callback function, accepting three arguments: error, data, response
       */
      _createClass(BugetPlanApi, [{
        key: "createBugetPlan",
        value: function createBugetPlan(companyId, departmnetId, opts, callback) {
          opts = opts || {};
          var postBody = opts['bugetPlan'];
          // verify the required parameter 'companyId' is set
          if (companyId === undefined || companyId === null) {
            throw new Error("Missing the required parameter 'companyId' when calling createBugetPlan");
          }
          // verify the required parameter 'departmnetId' is set
          if (departmnetId === undefined || departmnetId === null) {
            throw new Error("Missing the required parameter 'departmnetId' when calling createBugetPlan");
          }
          var pathParams = {
            'companyId': companyId,
            'departmnetId': departmnetId
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = ['application/json', 'text/json', 'application/*+json'];
          var accepts = [];
          var returnType = null;
          return this.apiClient.callApi('/api/Company/{companyId}/Department/{departmnetId}/BugetPlan', 'POST', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the deletBugetPlan operation.
         * @callback module:api/BugetPlanApi~deletBugetPlanCallback
         * @param {String} error Error message, if any.
         * @param data This operation does not return a value.
         * @param {String} response The complete HTTP response.
         */

        /**
         * delet bugetplan
         * @param {Number} companyId 
         * @param {Number} departmnetId 
         * @param {Number} bugetPlanId 
         * @param {module:api/BugetPlanApi~deletBugetPlanCallback} callback The callback function, accepting three arguments: error, data, response
         */
      }, {
        key: "deletBugetPlan",
        value: function deletBugetPlan(companyId, departmnetId, bugetPlanId, callback) {
          var postBody = null;
          // verify the required parameter 'companyId' is set
          if (companyId === undefined || companyId === null) {
            throw new Error("Missing the required parameter 'companyId' when calling deletBugetPlan");
          }
          // verify the required parameter 'departmnetId' is set
          if (departmnetId === undefined || departmnetId === null) {
            throw new Error("Missing the required parameter 'departmnetId' when calling deletBugetPlan");
          }
          // verify the required parameter 'bugetPlanId' is set
          if (bugetPlanId === undefined || bugetPlanId === null) {
            throw new Error("Missing the required parameter 'bugetPlanId' when calling deletBugetPlan");
          }
          var pathParams = {
            'companyId': companyId,
            'departmnetId': departmnetId,
            'bugetPlanId': bugetPlanId
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = [];
          var returnType = null;
          return this.apiClient.callApi('/api/Company/{companyId}/Department/{departmnetId}/BugetPlan/{bugetPlanId}', 'DELETE', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the getBugetPlan operation.
         * @callback module:api/BugetPlanApi~getBugetPlanCallback
         * @param {String} error Error message, if any.
         * @param {module:model/BugetPlan} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * get buget plan
         * @param {Number} companyId 
         * @param {Number} departmnetId 
         * @param {Number} bugetPlanId 
         * @param {module:api/BugetPlanApi~getBugetPlanCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link module:model/BugetPlan}
         */
      }, {
        key: "getBugetPlan",
        value: function getBugetPlan(companyId, departmnetId, bugetPlanId, callback) {
          var postBody = null;
          // verify the required parameter 'companyId' is set
          if (companyId === undefined || companyId === null) {
            throw new Error("Missing the required parameter 'companyId' when calling getBugetPlan");
          }
          // verify the required parameter 'departmnetId' is set
          if (departmnetId === undefined || departmnetId === null) {
            throw new Error("Missing the required parameter 'departmnetId' when calling getBugetPlan");
          }
          // verify the required parameter 'bugetPlanId' is set
          if (bugetPlanId === undefined || bugetPlanId === null) {
            throw new Error("Missing the required parameter 'bugetPlanId' when calling getBugetPlan");
          }
          var pathParams = {
            'companyId': companyId,
            'departmnetId': departmnetId,
            'bugetPlanId': bugetPlanId
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = ['application/json'];
          var returnType = _BugetPlan["default"];
          return this.apiClient.callApi('/api/Company/{companyId}/Department/{departmnetId}/BugetPlan/{bugetPlanId}', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the setMonthBuget operation.
         * @callback module:api/BugetPlanApi~setMonthBugetCallback
         * @param {String} error Error message, if any.
         * @param {module:model/BugetPlan} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * 
         * @param {Number} companyId 
         * @param {Number} departmnetId 
         * @param {Number} bugetPlanId 
         * @param {Object} opts Optional parameters
         * @param {module:model/Month} opts.month 
         * @param {Number} opts.amount 
         * @param {module:api/BugetPlanApi~setMonthBugetCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link module:model/BugetPlan}
         */
      }, {
        key: "setMonthBuget",
        value: function setMonthBuget(companyId, departmnetId, bugetPlanId, opts, callback) {
          opts = opts || {};
          var postBody = null;
          // verify the required parameter 'companyId' is set
          if (companyId === undefined || companyId === null) {
            throw new Error("Missing the required parameter 'companyId' when calling setMonthBuget");
          }
          // verify the required parameter 'departmnetId' is set
          if (departmnetId === undefined || departmnetId === null) {
            throw new Error("Missing the required parameter 'departmnetId' when calling setMonthBuget");
          }
          // verify the required parameter 'bugetPlanId' is set
          if (bugetPlanId === undefined || bugetPlanId === null) {
            throw new Error("Missing the required parameter 'bugetPlanId' when calling setMonthBuget");
          }
          var pathParams = {
            'companyId': companyId,
            'departmnetId': departmnetId,
            'bugetPlanId': bugetPlanId
          };
          var queryParams = {
            'month': opts['month'],
            'amount': opts['amount']
          };
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = ['application/json'];
          var returnType = _BugetPlan["default"];
          return this.apiClient.callApi('/api/Company/{companyId}/Department/{departmnetId}/BugetPlan/{bugetPlanId}', 'PUT', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }
      }]);
      return BugetPlanApi;
    }();
    exports["default"] = BugetPlanApi;
  }, { "../ApiClient": 10, "../model/BugetPlan": 21, "../model/Month": 27 }], 12: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports["default"] = void 0;
    var _ApiClient = _interopRequireDefault(require("../ApiClient"));
    var _Company = _interopRequireDefault(require("../model/Company"));
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
    /**
    * Company service.
    * @module api/CompanyApi
    * @version v1
    */
    var CompanyApi = /*#__PURE__*/function () {
      /**
      * Constructs a new CompanyApi. 
      * @alias module:api/CompanyApi
      * @class
      * @param {module:ApiClient} [apiClient] Optional API client implementation to use,
      * default to {@link module:ApiClient#instance} if unspecified.
      */
      function CompanyApi(apiClient) {
        _classCallCheck(this, CompanyApi);
        this.apiClient = apiClient || _ApiClient["default"].instance;
      }

      /**
       * Callback function to receive the result of the changeName operation.
       * @callback module:api/CompanyApi~changeNameCallback
       * @param {String} error Error message, if any.
       * @param {module:model/Company} data The data returned by the service call.
       * @param {String} response The complete HTTP response.
       */

      /**
       * change name company by id
       * @param {Number} id 
       * @param {String} name 
       * @param {module:api/CompanyApi~changeNameCallback} callback The callback function, accepting three arguments: error, data, response
       * data is of type: {@link module:model/Company}
       */
      _createClass(CompanyApi, [{
        key: "changeName",
        value: function changeName(id, name, callback) {
          var postBody = null;
          // verify the required parameter 'id' is set
          if (id === undefined || id === null) {
            throw new Error("Missing the required parameter 'id' when calling changeName");
          }
          // verify the required parameter 'name' is set
          if (name === undefined || name === null) {
            throw new Error("Missing the required parameter 'name' when calling changeName");
          }
          var pathParams = {
            'id': id,
            'name': name
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = ['application/json'];
          var returnType = _Company["default"];
          return this.apiClient.callApi('/api/Company/{id}/{name}', 'PUT', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the createCompany operation.
         * @callback module:api/CompanyApi~createCompanyCallback
         * @param {String} error Error message, if any.
         * @param data This operation does not return a value.
         * @param {String} response The complete HTTP response.
         */

        /**
         * create company from object
         * @param {Object} opts Optional parameters
         * @param {module:model/Company} opts.company 
         * @param {module:api/CompanyApi~createCompanyCallback} callback The callback function, accepting three arguments: error, data, response
         */
      }, {
        key: "createCompany",
        value: function createCompany(opts, callback) {
          opts = opts || {};
          var postBody = opts['company'];
          var pathParams = {};
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = ['application/json', 'text/json', 'application/*+json'];
          var accepts = [];
          var returnType = null;
          return this.apiClient.callApi('/api/Company', 'POST', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the deletCompany operation.
         * @callback module:api/CompanyApi~deletCompanyCallback
         * @param {String} error Error message, if any.
         * @param data This operation does not return a value.
         * @param {String} response The complete HTTP response.
         */

        /**
         * Delete company by id
         * @param {Number} id 
         * @param {module:api/CompanyApi~deletCompanyCallback} callback The callback function, accepting three arguments: error, data, response
         */
      }, {
        key: "deletCompany",
        value: function deletCompany(id, callback) {
          var postBody = null;
          // verify the required parameter 'id' is set
          if (id === undefined || id === null) {
            throw new Error("Missing the required parameter 'id' when calling deletCompany");
          }
          var pathParams = {
            'id': id
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = [];
          var returnType = null;
          return this.apiClient.callApi('/api/Company/{id}', 'DELETE', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the getCompany operation.
         * @callback module:api/CompanyApi~getCompanyCallback
         * @param {String} error Error message, if any.
         * @param {module:model/Company} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * get company by id
         * @param {Number} id 
         * @param {module:api/CompanyApi~getCompanyCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link module:model/Company}
         */
      }, {
        key: "getCompany",
        value: function getCompany(id, callback) {
          var postBody = null;
          // verify the required parameter 'id' is set
          if (id === undefined || id === null) {
            throw new Error("Missing the required parameter 'id' when calling getCompany");
          }
          var pathParams = {
            'id': id
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = ['application/json'];
          var returnType = _Company["default"];
          return this.apiClient.callApi('/api/Company/{id}', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the getCompanyes operation.
         * @callback module:api/CompanyApi~getCompanyesCallback
         * @param {String} error Error message, if any.
         * @param {Array.<module:model/Company>} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * get all company
         * @param {module:api/CompanyApi~getCompanyesCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link Array.<module:model/Company>}
         */
      }, {
        key: "getCompanyes",
        value: function getCompanyes(callback) {
          var postBody = null;
          var pathParams = {};
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = ['application/json'];
          var returnType = [_Company["default"]];
          return this.apiClient.callApi('/api/Company', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }
      }]);
      return CompanyApi;
    }();
    exports["default"] = CompanyApi;
  }, { "../ApiClient": 10, "../model/Company": 22 }], 13: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports["default"] = void 0;
    var _ApiClient = _interopRequireDefault(require("../ApiClient"));
    var _Department = _interopRequireDefault(require("../model/Department"));
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
    /**
    * Department service.
    * @module api/DepartmentApi
    * @version v1
    */
    var DepartmentApi = /*#__PURE__*/function () {
      /**
      * Constructs a new DepartmentApi. 
      * @alias module:api/DepartmentApi
      * @class
      * @param {module:ApiClient} [apiClient] Optional API client implementation to use,
      * default to {@link module:ApiClient#instance} if unspecified.
      */
      function DepartmentApi(apiClient) {
        _classCallCheck(this, DepartmentApi);
        this.apiClient = apiClient || _ApiClient["default"].instance;
      }

      /**
       * Callback function to receive the result of the createDepartment operation.
       * @callback module:api/DepartmentApi~createDepartmentCallback
       * @param {String} error Error message, if any.
       * @param data This operation does not return a value.
       * @param {String} response The complete HTTP response.
       */

      /**
       * create department in company
       * @param {Number} companyId 
       * @param {Object} opts Optional parameters
       * @param {module:model/Department} opts.department 
       * @param {module:api/DepartmentApi~createDepartmentCallback} callback The callback function, accepting three arguments: error, data, response
       */
      _createClass(DepartmentApi, [{
        key: "createDepartment",
        value: function createDepartment(companyId, opts, callback) {
          opts = opts || {};
          var postBody = opts['department'];
          // verify the required parameter 'companyId' is set
          if (companyId === undefined || companyId === null) {
            throw new Error("Missing the required parameter 'companyId' when calling createDepartment");
          }
          var pathParams = {
            'companyId': companyId
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = ['application/json', 'text/json', 'application/*+json'];
          var accepts = [];
          var returnType = null;
          return this.apiClient.callApi('/api/Company/{companyId}/Department', 'POST', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the deleteDepartment operation.
         * @callback module:api/DepartmentApi~deleteDepartmentCallback
         * @param {String} error Error message, if any.
         * @param data This operation does not return a value.
         * @param {String} response The complete HTTP response.
         */

        /**
         * Delete department in company
         * @param {Number} companyId 
         * @param {Object} opts Optional parameters
         * @param {Number} opts.departmnetId 
         * @param {module:api/DepartmentApi~deleteDepartmentCallback} callback The callback function, accepting three arguments: error, data, response
         */
      }, {
        key: "deleteDepartment",
        value: function deleteDepartment(companyId, opts, callback) {
          opts = opts || {};
          var postBody = null;
          // verify the required parameter 'companyId' is set
          if (companyId === undefined || companyId === null) {
            throw new Error("Missing the required parameter 'companyId' when calling deleteDepartment");
          }
          var pathParams = {
            'companyId': companyId
          };
          var queryParams = {
            'departmnetId': opts['departmnetId']
          };
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = [];
          var returnType = null;
          return this.apiClient.callApi('/api/Company/{companyId}/Department', 'DELETE', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the getDepartment operation.
         * @callback module:api/DepartmentApi~getDepartmentCallback
         * @param {String} error Error message, if any.
         * @param {module:model/Department} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * get department by id in company
         * @param {Number} companyId 
         * @param {Number} departmnetId 
         * @param {module:api/DepartmentApi~getDepartmentCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link module:model/Department}
         */
      }, {
        key: "getDepartment",
        value: function getDepartment(companyId, departmnetId, callback) {
          var postBody = null;
          // verify the required parameter 'companyId' is set
          if (companyId === undefined || companyId === null) {
            throw new Error("Missing the required parameter 'companyId' when calling getDepartment");
          }
          // verify the required parameter 'departmnetId' is set
          if (departmnetId === undefined || departmnetId === null) {
            throw new Error("Missing the required parameter 'departmnetId' when calling getDepartment");
          }
          var pathParams = {
            'companyId': companyId,
            'departmnetId': departmnetId
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = ['application/json'];
          var returnType = _Department["default"];
          return this.apiClient.callApi('/api/Company/{companyId}/Department/{departmnetId}', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the getDepartments operation.
         * @callback module:api/DepartmentApi~getDepartmentsCallback
         * @param {String} error Error message, if any.
         * @param {Array.<module:model/Department>} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * get departments in company
         * @param {Number} companyId 
         * @param {module:api/DepartmentApi~getDepartmentsCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link Array.<module:model/Department>}
         */
      }, {
        key: "getDepartments",
        value: function getDepartments(companyId, callback) {
          var postBody = null;
          // verify the required parameter 'companyId' is set
          if (companyId === undefined || companyId === null) {
            throw new Error("Missing the required parameter 'companyId' when calling getDepartments");
          }
          var pathParams = {
            'companyId': companyId
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = ['application/json'];
          var returnType = [_Department["default"]];
          return this.apiClient.callApi('/api/Company/{companyId}/Department', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the setBugetDeparmtnet operation.
         * @callback module:api/DepartmentApi~setBugetDeparmtnetCallback
         * @param {String} error Error message, if any.
         * @param {module:model/Department} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * set buget department by id in company
         * @param {Number} departmnetId 
         * @param {String} companyId 
         * @param {Object} opts Optional parameters
         * @param {Number} opts.buget 
         * @param {module:api/DepartmentApi~setBugetDeparmtnetCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link module:model/Department}
         */
      }, {
        key: "setBugetDeparmtnet",
        value: function setBugetDeparmtnet(departmnetId, companyId, opts, callback) {
          opts = opts || {};
          var postBody = null;
          // verify the required parameter 'departmnetId' is set
          if (departmnetId === undefined || departmnetId === null) {
            throw new Error("Missing the required parameter 'departmnetId' when calling setBugetDeparmtnet");
          }
          // verify the required parameter 'companyId' is set
          if (companyId === undefined || companyId === null) {
            throw new Error("Missing the required parameter 'companyId' when calling setBugetDeparmtnet");
          }
          var pathParams = {
            'departmnetId': departmnetId,
            'companyId': companyId
          };
          var queryParams = {
            'buget': opts['buget']
          };
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = ['application/json'];
          var returnType = _Department["default"];
          return this.apiClient.callApi('/api/Company/{companyId}/Department/{departmnetId}', 'PUT', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }
      }]);
      return DepartmentApi;
    }();
    exports["default"] = DepartmentApi;
  }, { "../ApiClient": 10, "../model/Department": 23 }], 14: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports["default"] = void 0;
    var _ApiClient = _interopRequireDefault(require("../ApiClient"));
    var _Employee = _interopRequireDefault(require("../model/Employee"));
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
    /**
    * Employee service.
    * @module api/EmployeeApi
    * @version v1
    */
    var EmployeeApi = /*#__PURE__*/function () {
      /**
      * Constructs a new EmployeeApi. 
      * @alias module:api/EmployeeApi
      * @class
      * @param {module:ApiClient} [apiClient] Optional API client implementation to use,
      * default to {@link module:ApiClient#instance} if unspecified.
      */
      function EmployeeApi(apiClient) {
        _classCallCheck(this, EmployeeApi);
        this.apiClient = apiClient || _ApiClient["default"].instance;
      }

      /**
       * Callback function to receive the result of the createEmployee operation.
       * @callback module:api/EmployeeApi~createEmployeeCallback
       * @param {String} error Error message, if any.
       * @param data This operation does not return a value.
       * @param {String} response The complete HTTP response.
       */

      /**
       * @param {Object} opts Optional parameters
       * @param {module:model/Employee} opts.employee 
       * @param {module:api/EmployeeApi~createEmployeeCallback} callback The callback function, accepting three arguments: error, data, response
       */
      _createClass(EmployeeApi, [{
        key: "createEmployee",
        value: function createEmployee(opts, callback) {
          opts = opts || {};
          var postBody = opts['employee'];
          var pathParams = {};
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = ['application/json', 'text/json', 'application/*+json'];
          var accepts = [];
          var returnType = null;
          return this.apiClient.callApi('/api/Employee', 'POST', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the deleteEmployee operation.
         * @callback module:api/EmployeeApi~deleteEmployeeCallback
         * @param {String} error Error message, if any.
         * @param data This operation does not return a value.
         * @param {String} response The complete HTTP response.
         */

        /**
         * @param {Number} id 
         * @param {module:api/EmployeeApi~deleteEmployeeCallback} callback The callback function, accepting three arguments: error, data, response
         */
      }, {
        key: "deleteEmployee",
        value: function deleteEmployee(id, callback) {
          var postBody = null;
          // verify the required parameter 'id' is set
          if (id === undefined || id === null) {
            throw new Error("Missing the required parameter 'id' when calling deleteEmployee");
          }
          var pathParams = {
            'id': id
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = [];
          var returnType = null;
          return this.apiClient.callApi('/api/Employee/{id}', 'DELETE', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the getEmployee operation.
         * @callback module:api/EmployeeApi~getEmployeeCallback
         * @param {String} error Error message, if any.
         * @param {module:model/Employee} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * @param {Number} id 
         * @param {module:api/EmployeeApi~getEmployeeCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link module:model/Employee}
         */
      }, {
        key: "getEmployee",
        value: function getEmployee(id, callback) {
          var postBody = null;
          // verify the required parameter 'id' is set
          if (id === undefined || id === null) {
            throw new Error("Missing the required parameter 'id' when calling getEmployee");
          }
          var pathParams = {
            'id': id
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = ['application/json'];
          var returnType = _Employee["default"];
          return this.apiClient.callApi('/api/Employee/{id}', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the getEmployees operation.
         * @callback module:api/EmployeeApi~getEmployeesCallback
         * @param {String} error Error message, if any.
         * @param {Array.<module:model/Employee>} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * @param {module:api/EmployeeApi~getEmployeesCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link Array.<module:model/Employee>}
         */
      }, {
        key: "getEmployees",
        value: function getEmployees(callback) {
          var postBody = null;
          var pathParams = {};
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = ['application/json'];
          var returnType = [_Employee["default"]];
          return this.apiClient.callApi('/api/Employee', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }
      }]);
      return EmployeeApi;
    }();
    exports["default"] = EmployeeApi;
  }, { "../ApiClient": 10, "../model/Employee": 24 }], 15: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports["default"] = void 0;
    var _ApiClient = _interopRequireDefault(require("../ApiClient"));
    var _Employee = _interopRequireDefault(require("../model/Employee"));
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
    /**
    * EmployeeFromDepartment service.
    * @module api/EmployeeFromDepartmentApi
    * @version v1
    */
    var EmployeeFromDepartmentApi = /*#__PURE__*/function () {
      /**
      * Constructs a new EmployeeFromDepartmentApi. 
      * @alias module:api/EmployeeFromDepartmentApi
      * @class
      * @param {module:ApiClient} [apiClient] Optional API client implementation to use,
      * default to {@link module:ApiClient#instance} if unspecified.
      */
      function EmployeeFromDepartmentApi(apiClient) {
        _classCallCheck(this, EmployeeFromDepartmentApi);
        this.apiClient = apiClient || _ApiClient["default"].instance;
      }

      /**
       * Callback function to receive the result of the dismissEmployee operation.
       * @callback module:api/EmployeeFromDepartmentApi~dismissEmployeeCallback
       * @param {String} error Error message, if any.
       * @param {module:model/Employee} data The data returned by the service call.
       * @param {String} response The complete HTTP response.
       */

      /**
       * remove employee from department in company
       * @param {Number} companyId 
       * @param {Number} departmnetId 
       * @param {Number} employeeId 
       * @param {module:api/EmployeeFromDepartmentApi~dismissEmployeeCallback} callback The callback function, accepting three arguments: error, data, response
       * data is of type: {@link module:model/Employee}
       */
      _createClass(EmployeeFromDepartmentApi, [{
        key: "dismissEmployee",
        value: function dismissEmployee(companyId, departmnetId, employeeId, callback) {
          var postBody = null;
          // verify the required parameter 'companyId' is set
          if (companyId === undefined || companyId === null) {
            throw new Error("Missing the required parameter 'companyId' when calling dismissEmployee");
          }
          // verify the required parameter 'departmnetId' is set
          if (departmnetId === undefined || departmnetId === null) {
            throw new Error("Missing the required parameter 'departmnetId' when calling dismissEmployee");
          }
          // verify the required parameter 'employeeId' is set
          if (employeeId === undefined || employeeId === null) {
            throw new Error("Missing the required parameter 'employeeId' when calling dismissEmployee");
          }
          var pathParams = {
            'companyId': companyId,
            'departmnetId': departmnetId,
            'employeeId': employeeId
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = ['application/json'];
          var returnType = _Employee["default"];
          return this.apiClient.callApi('/api/Company/{companyId}/Department/{departmnetId}/EmployeeFromDepartment/{employeeId}', 'DELETE', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the getEmployeeInDepartment operation.
         * @callback module:api/EmployeeFromDepartmentApi~getEmployeeInDepartmentCallback
         * @param {String} error Error message, if any.
         * @param {module:model/Employee} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * get employee in department in company by id
         * @param {Number} companyId 
         * @param {Number} departmnetId 
         * @param {Number} employeeId 
         * @param {module:api/EmployeeFromDepartmentApi~getEmployeeInDepartmentCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link module:model/Employee}
         */
      }, {
        key: "getEmployeeInDepartment",
        value: function getEmployeeInDepartment(companyId, departmnetId, employeeId, callback) {
          var postBody = null;
          // verify the required parameter 'companyId' is set
          if (companyId === undefined || companyId === null) {
            throw new Error("Missing the required parameter 'companyId' when calling getEmployeeInDepartment");
          }
          // verify the required parameter 'departmnetId' is set
          if (departmnetId === undefined || departmnetId === null) {
            throw new Error("Missing the required parameter 'departmnetId' when calling getEmployeeInDepartment");
          }
          // verify the required parameter 'employeeId' is set
          if (employeeId === undefined || employeeId === null) {
            throw new Error("Missing the required parameter 'employeeId' when calling getEmployeeInDepartment");
          }
          var pathParams = {
            'companyId': companyId,
            'departmnetId': departmnetId,
            'employeeId': employeeId
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = ['application/json'];
          var returnType = _Employee["default"];
          return this.apiClient.callApi('/api/Company/{companyId}/Department/{departmnetId}/EmployeeFromDepartment/{employeeId}', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the getEmployeesInDepartment operation.
         * @callback module:api/EmployeeFromDepartmentApi~getEmployeesInDepartmentCallback
         * @param {String} error Error message, if any.
         * @param {Array.<module:model/Employee>} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * get employees in department in company
         * @param {Number} companyId 
         * @param {Number} departmnetId 
         * @param {module:api/EmployeeFromDepartmentApi~getEmployeesInDepartmentCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link Array.<module:model/Employee>}
         */
      }, {
        key: "getEmployeesInDepartment",
        value: function getEmployeesInDepartment(companyId, departmnetId, callback) {
          var postBody = null;
          // verify the required parameter 'companyId' is set
          if (companyId === undefined || companyId === null) {
            throw new Error("Missing the required parameter 'companyId' when calling getEmployeesInDepartment");
          }
          // verify the required parameter 'departmnetId' is set
          if (departmnetId === undefined || departmnetId === null) {
            throw new Error("Missing the required parameter 'departmnetId' when calling getEmployeesInDepartment");
          }
          var pathParams = {
            'companyId': companyId,
            'departmnetId': departmnetId
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = ['application/json'];
          var returnType = [_Employee["default"]];
          return this.apiClient.callApi('/api/Company/{companyId}/Department/{departmnetId}/EmployeeFromDepartment', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the hireEmployee operation.
         * @callback module:api/EmployeeFromDepartmentApi~hireEmployeeCallback
         * @param {String} error Error message, if any.
         * @param data This operation does not return a value.
         * @param {String} response The complete HTTP response.
         */

        /**
         * add epmployee to department
         * @param {Number} companyId 
         * @param {Number} departmnetId 
         * @param {Number} employeeId 
         * @param {module:api/EmployeeFromDepartmentApi~hireEmployeeCallback} callback The callback function, accepting three arguments: error, data, response
         */
      }, {
        key: "hireEmployee",
        value: function hireEmployee(companyId, departmnetId, employeeId, callback) {
          var postBody = null;
          // verify the required parameter 'companyId' is set
          if (companyId === undefined || companyId === null) {
            throw new Error("Missing the required parameter 'companyId' when calling hireEmployee");
          }
          // verify the required parameter 'departmnetId' is set
          if (departmnetId === undefined || departmnetId === null) {
            throw new Error("Missing the required parameter 'departmnetId' when calling hireEmployee");
          }
          // verify the required parameter 'employeeId' is set
          if (employeeId === undefined || employeeId === null) {
            throw new Error("Missing the required parameter 'employeeId' when calling hireEmployee");
          }
          var pathParams = {
            'companyId': companyId,
            'departmnetId': departmnetId,
            'employeeId': employeeId
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = [];
          var returnType = null;
          return this.apiClient.callApi('/api/Company/{companyId}/Department/{departmnetId}/EmployeeFromDepartment/{employeeId}', 'POST', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }
      }]);
      return EmployeeFromDepartmentApi;
    }();
    exports["default"] = EmployeeFromDepartmentApi;
  }, { "../ApiClient": 10, "../model/Employee": 24 }], 16: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports["default"] = void 0;
    var _ApiClient = _interopRequireDefault(require("../ApiClient"));
    var _Expense = _interopRequireDefault(require("../model/Expense"));
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
    /**
    * ExpenseFromDepartment service.
    * @module api/ExpenseFromDepartmentApi
    * @version v1
    */
    var ExpenseFromDepartmentApi = /*#__PURE__*/function () {
      /**
      * Constructs a new ExpenseFromDepartmentApi. 
      * @alias module:api/ExpenseFromDepartmentApi
      * @class
      * @param {module:ApiClient} [apiClient] Optional API client implementation to use,
      * default to {@link module:ApiClient#instance} if unspecified.
      */
      function ExpenseFromDepartmentApi(apiClient) {
        _classCallCheck(this, ExpenseFromDepartmentApi);
        this.apiClient = apiClient || _ApiClient["default"].instance;
      }

      /**
       * Callback function to receive the result of the getExpenseInDeparment operation.
       * @callback module:api/ExpenseFromDepartmentApi~getExpenseInDeparmentCallback
       * @param {String} error Error message, if any.
       * @param {module:model/Expense} data The data returned by the service call.
       * @param {String} response The complete HTTP response.
       */

      /**
       * get expense in department by id
       * @param {Number} companyId 
       * @param {Number} departmnetId 
       * @param {Number} expenseId 
       * @param {module:api/ExpenseFromDepartmentApi~getExpenseInDeparmentCallback} callback The callback function, accepting three arguments: error, data, response
       * data is of type: {@link module:model/Expense}
       */
      _createClass(ExpenseFromDepartmentApi, [{
        key: "getExpenseInDeparment",
        value: function getExpenseInDeparment(companyId, departmnetId, expenseId, callback) {
          var postBody = null;
          // verify the required parameter 'companyId' is set
          if (companyId === undefined || companyId === null) {
            throw new Error("Missing the required parameter 'companyId' when calling getExpenseInDeparment");
          }
          // verify the required parameter 'departmnetId' is set
          if (departmnetId === undefined || departmnetId === null) {
            throw new Error("Missing the required parameter 'departmnetId' when calling getExpenseInDeparment");
          }
          // verify the required parameter 'expenseId' is set
          if (expenseId === undefined || expenseId === null) {
            throw new Error("Missing the required parameter 'expenseId' when calling getExpenseInDeparment");
          }
          var pathParams = {
            'companyId': companyId,
            'departmnetId': departmnetId,
            'expenseId': expenseId
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = ['application/json'];
          var returnType = _Expense["default"];
          return this.apiClient.callApi('/api/Company/{companyId}/Department/{departmnetId}/ExpenseFromDepartment/{expenseId}', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the getExpesesInDepartment operation.
         * @callback module:api/ExpenseFromDepartmentApi~getExpesesInDepartmentCallback
         * @param {String} error Error message, if any.
         * @param {Array.<module:model/Expense>} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * get expenses in department
         * @param {Number} companyId 
         * @param {Number} departmnetId 
         * @param {module:api/ExpenseFromDepartmentApi~getExpesesInDepartmentCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link Array.<module:model/Expense>}
         */
      }, {
        key: "getExpesesInDepartment",
        value: function getExpesesInDepartment(companyId, departmnetId, callback) {
          var postBody = null;
          // verify the required parameter 'companyId' is set
          if (companyId === undefined || companyId === null) {
            throw new Error("Missing the required parameter 'companyId' when calling getExpesesInDepartment");
          }
          // verify the required parameter 'departmnetId' is set
          if (departmnetId === undefined || departmnetId === null) {
            throw new Error("Missing the required parameter 'departmnetId' when calling getExpesesInDepartment");
          }
          var pathParams = {
            'companyId': companyId,
            'departmnetId': departmnetId
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = ['application/json'];
          var returnType = [_Expense["default"]];
          return this.apiClient.callApi('/api/Company/{companyId}/Department/{departmnetId}/ExpenseFromDepartment', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }
      }]);
      return ExpenseFromDepartmentApi;
    }();
    exports["default"] = ExpenseFromDepartmentApi;
  }, { "../ApiClient": 10, "../model/Expense": 25 }], 17: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports["default"] = void 0;
    var _ApiClient = _interopRequireDefault(require("../ApiClient"));
    var _Expense = _interopRequireDefault(require("../model/Expense"));
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
    /**
    * ExpenseFromEmployee service.
    * @module api/ExpenseFromEmployeeApi
    * @version v1
    */
    var ExpenseFromEmployeeApi = /*#__PURE__*/function () {
      /**
      * Constructs a new ExpenseFromEmployeeApi. 
      * @alias module:api/ExpenseFromEmployeeApi
      * @class
      * @param {module:ApiClient} [apiClient] Optional API client implementation to use,
      * default to {@link module:ApiClient#instance} if unspecified.
      */
      function ExpenseFromEmployeeApi(apiClient) {
        _classCallCheck(this, ExpenseFromEmployeeApi);
        this.apiClient = apiClient || _ApiClient["default"].instance;
      }

      /**
       * Callback function to receive the result of the changeAmmount operation.
       * @callback module:api/ExpenseFromEmployeeApi~changeAmmountCallback
       * @param {String} error Error message, if any.
       * @param {module:model/Expense} data The data returned by the service call.
       * @param {String} response The complete HTTP response.
       */

      /**
       * Change ammout if not confirmed
       * @param {Number} employeeId 
       * @param {Number} expenseId 
       * @param {Object} opts Optional parameters
       * @param {Number} opts.amount 
       * @param {module:api/ExpenseFromEmployeeApi~changeAmmountCallback} callback The callback function, accepting three arguments: error, data, response
       * data is of type: {@link module:model/Expense}
       */
      _createClass(ExpenseFromEmployeeApi, [{
        key: "changeAmmount",
        value: function changeAmmount(employeeId, expenseId, opts, callback) {
          opts = opts || {};
          var postBody = null;
          // verify the required parameter 'employeeId' is set
          if (employeeId === undefined || employeeId === null) {
            throw new Error("Missing the required parameter 'employeeId' when calling changeAmmount");
          }
          // verify the required parameter 'expenseId' is set
          if (expenseId === undefined || expenseId === null) {
            throw new Error("Missing the required parameter 'expenseId' when calling changeAmmount");
          }
          var pathParams = {
            'employeeId': employeeId,
            'expenseId': expenseId
          };
          var queryParams = {
            'amount': opts['amount']
          };
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = ['application/json'];
          var returnType = _Expense["default"];
          return this.apiClient.callApi('/api/Employee/{employeeId}/ExpenseFromEmployee/{expenseId}/ChangeAmmount', 'PUT', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the confirmExpense operation.
         * @callback module:api/ExpenseFromEmployeeApi~confirmExpenseCallback
         * @param {String} error Error message, if any.
         * @param {module:model/Expense} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * confirm expense if expense is valid
         * @param {Number} employeeId 
         * @param {Number} expenseId 
         * @param {module:api/ExpenseFromEmployeeApi~confirmExpenseCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link module:model/Expense}
         */
      }, {
        key: "confirmExpense",
        value: function confirmExpense(employeeId, expenseId, callback) {
          var postBody = null;
          // verify the required parameter 'employeeId' is set
          if (employeeId === undefined || employeeId === null) {
            throw new Error("Missing the required parameter 'employeeId' when calling confirmExpense");
          }
          // verify the required parameter 'expenseId' is set
          if (expenseId === undefined || expenseId === null) {
            throw new Error("Missing the required parameter 'expenseId' when calling confirmExpense");
          }
          var pathParams = {
            'employeeId': employeeId,
            'expenseId': expenseId
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = ['application/json'];
          var returnType = _Expense["default"];
          return this.apiClient.callApi('/api/Employee/{employeeId}/ExpenseFromEmployee/{expenseId}/Confirm', 'PUT', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the createExpense operation.
         * @callback module:api/ExpenseFromEmployeeApi~createExpenseCallback
         * @param {String} error Error message, if any.
         * @param data This operation does not return a value.
         * @param {String} response The complete HTTP response.
         */

        /**
         * create expense for employee
         * @param {Number} employeeId 
         * @param {Object} opts Optional parameters
         * @param {module:model/Expense} opts.expense 
         * @param {module:api/ExpenseFromEmployeeApi~createExpenseCallback} callback The callback function, accepting three arguments: error, data, response
         */
      }, {
        key: "createExpense",
        value: function createExpense(employeeId, opts, callback) {
          opts = opts || {};
          var postBody = opts['expense'];
          // verify the required parameter 'employeeId' is set
          if (employeeId === undefined || employeeId === null) {
            throw new Error("Missing the required parameter 'employeeId' when calling createExpense");
          }
          var pathParams = {
            'employeeId': employeeId
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = ['application/json', 'text/json', 'application/*+json'];
          var accepts = [];
          var returnType = null;
          return this.apiClient.callApi('/api/Employee/{employeeId}/ExpenseFromEmployee', 'POST', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the getExpense operation.
         * @callback module:api/ExpenseFromEmployeeApi~getExpenseCallback
         * @param {String} error Error message, if any.
         * @param {module:model/Expense} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * get expense in employee
         * @param {Number} employeeId 
         * @param {Number} expenseId 
         * @param {module:api/ExpenseFromEmployeeApi~getExpenseCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link module:model/Expense}
         */
      }, {
        key: "getExpense",
        value: function getExpense(employeeId, expenseId, callback) {
          var postBody = null;
          // verify the required parameter 'employeeId' is set
          if (employeeId === undefined || employeeId === null) {
            throw new Error("Missing the required parameter 'employeeId' when calling getExpense");
          }
          // verify the required parameter 'expenseId' is set
          if (expenseId === undefined || expenseId === null) {
            throw new Error("Missing the required parameter 'expenseId' when calling getExpense");
          }
          var pathParams = {
            'employeeId': employeeId,
            'expenseId': expenseId
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = ['application/json'];
          var returnType = _Expense["default"];
          return this.apiClient.callApi('/api/Employee/{employeeId}/ExpenseFromEmployee/{expenseId}', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the getExpenses operation.
         * @callback module:api/ExpenseFromEmployeeApi~getExpensesCallback
         * @param {String} error Error message, if any.
         * @param {Array.<module:model/Expense>} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * get expenses in emploee
         * @param {Number} employeeId 
         * @param {module:api/ExpenseFromEmployeeApi~getExpensesCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link Array.<module:model/Expense>}
         */
      }, {
        key: "getExpenses",
        value: function getExpenses(employeeId, callback) {
          var postBody = null;
          // verify the required parameter 'employeeId' is set
          if (employeeId === undefined || employeeId === null) {
            throw new Error("Missing the required parameter 'employeeId' when calling getExpenses");
          }
          var pathParams = {
            'employeeId': employeeId
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = ['application/json'];
          var returnType = [_Expense["default"]];
          return this.apiClient.callApi('/api/Employee/{employeeId}/ExpenseFromEmployee', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the setExpenseType operation.
         * @callback module:api/ExpenseFromEmployeeApi~setExpenseTypeCallback
         * @param {String} error Error message, if any.
         * @param {module:model/Expense} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * change type if not confirmed
         * @param {Number} employeeId 
         * @param {Number} expenseId 
         * @param {Number} expenseTypeId 
         * @param {module:api/ExpenseFromEmployeeApi~setExpenseTypeCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link module:model/Expense}
         */
      }, {
        key: "setExpenseType",
        value: function setExpenseType(employeeId, expenseId, expenseTypeId, callback) {
          var postBody = null;
          // verify the required parameter 'employeeId' is set
          if (employeeId === undefined || employeeId === null) {
            throw new Error("Missing the required parameter 'employeeId' when calling setExpenseType");
          }
          // verify the required parameter 'expenseId' is set
          if (expenseId === undefined || expenseId === null) {
            throw new Error("Missing the required parameter 'expenseId' when calling setExpenseType");
          }
          // verify the required parameter 'expenseTypeId' is set
          if (expenseTypeId === undefined || expenseTypeId === null) {
            throw new Error("Missing the required parameter 'expenseTypeId' when calling setExpenseType");
          }
          var pathParams = {
            'employeeId': employeeId,
            'expenseId': expenseId,
            'expenseTypeId': expenseTypeId
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = ['application/json'];
          var returnType = _Expense["default"];
          return this.apiClient.callApi('/api/Employee/{employeeId}/ExpenseFromEmployee/{expenseId}/SetType/{expenseTypeId}', 'PUT', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the validateEpxense operation.
         * @callback module:api/ExpenseFromEmployeeApi~validateEpxenseCallback
         * @param {String} error Error message, if any.
         * @param {module:model/Expense} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * validate expense
         * @param {Number} employeeId 
         * @param {Number} expenseId 
         * @param {module:api/ExpenseFromEmployeeApi~validateEpxenseCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link module:model/Expense}
         */
      }, {
        key: "validateEpxense",
        value: function validateEpxense(employeeId, expenseId, callback) {
          var postBody = null;
          // verify the required parameter 'employeeId' is set
          if (employeeId === undefined || employeeId === null) {
            throw new Error("Missing the required parameter 'employeeId' when calling validateEpxense");
          }
          // verify the required parameter 'expenseId' is set
          if (expenseId === undefined || expenseId === null) {
            throw new Error("Missing the required parameter 'expenseId' when calling validateEpxense");
          }
          var pathParams = {
            'employeeId': employeeId,
            'expenseId': expenseId
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = ['application/json'];
          var returnType = _Expense["default"];
          return this.apiClient.callApi('/api/Employee/{employeeId}/ExpenseFromEmployee/{expenseId}/Validate', 'PUT', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }
      }]);
      return ExpenseFromEmployeeApi;
    }();
    exports["default"] = ExpenseFromEmployeeApi;
  }, { "../ApiClient": 10, "../model/Expense": 25 }], 18: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports["default"] = void 0;
    var _ApiClient = _interopRequireDefault(require("../ApiClient"));
    var _ExpenseType = _interopRequireDefault(require("../model/ExpenseType"));
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
    /**
    * ExpenseType service.
    * @module api/ExpenseTypeApi
    * @version v1
    */
    var ExpenseTypeApi = /*#__PURE__*/function () {
      /**
      * Constructs a new ExpenseTypeApi. 
      * @alias module:api/ExpenseTypeApi
      * @class
      * @param {module:ApiClient} [apiClient] Optional API client implementation to use,
      * default to {@link module:ApiClient#instance} if unspecified.
      */
      function ExpenseTypeApi(apiClient) {
        _classCallCheck(this, ExpenseTypeApi);
        this.apiClient = apiClient || _ApiClient["default"].instance;
      }

      /**
       * Callback function to receive the result of the createExpenseTypeInCompany operation.
       * @callback module:api/ExpenseTypeApi~createExpenseTypeInCompanyCallback
       * @param {String} error Error message, if any.
       * @param data This operation does not return a value.
       * @param {String} response The complete HTTP response.
       */

      /**
       * create new expenseType in company
       * @param {Number} companyId 
       * @param {Object} opts Optional parameters
       * @param {module:model/ExpenseType} opts.expenseType 
       * @param {module:api/ExpenseTypeApi~createExpenseTypeInCompanyCallback} callback The callback function, accepting three arguments: error, data, response
       */
      _createClass(ExpenseTypeApi, [{
        key: "createExpenseTypeInCompany",
        value: function createExpenseTypeInCompany(companyId, opts, callback) {
          opts = opts || {};
          var postBody = opts['expenseType'];
          // verify the required parameter 'companyId' is set
          if (companyId === undefined || companyId === null) {
            throw new Error("Missing the required parameter 'companyId' when calling createExpenseTypeInCompany");
          }
          var pathParams = {
            'companyId': companyId
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = ['application/json', 'text/json', 'application/*+json'];
          var accepts = [];
          var returnType = null;
          return this.apiClient.callApi('/api/Company/{companyId}/ExpenseType', 'POST', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the deleteExpenseTypeInCompany operation.
         * @callback module:api/ExpenseTypeApi~deleteExpenseTypeInCompanyCallback
         * @param {String} error Error message, if any.
         * @param data This operation does not return a value.
         * @param {String} response The complete HTTP response.
         */

        /**
         * delete expense type in company
         * @param {Number} companyId 
         * @param {Number} expenseTypeId 
         * @param {module:api/ExpenseTypeApi~deleteExpenseTypeInCompanyCallback} callback The callback function, accepting three arguments: error, data, response
         */
      }, {
        key: "deleteExpenseTypeInCompany",
        value: function deleteExpenseTypeInCompany(companyId, expenseTypeId, callback) {
          var postBody = null;
          // verify the required parameter 'companyId' is set
          if (companyId === undefined || companyId === null) {
            throw new Error("Missing the required parameter 'companyId' when calling deleteExpenseTypeInCompany");
          }
          // verify the required parameter 'expenseTypeId' is set
          if (expenseTypeId === undefined || expenseTypeId === null) {
            throw new Error("Missing the required parameter 'expenseTypeId' when calling deleteExpenseTypeInCompany");
          }
          var pathParams = {
            'companyId': companyId,
            'expenseTypeId': expenseTypeId
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = [];
          var returnType = null;
          return this.apiClient.callApi('/api/Company/{companyId}/ExpenseType/{expenseTypeId}', 'DELETE', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the getEpxensTypesInCompany operation.
         * @callback module:api/ExpenseTypeApi~getEpxensTypesInCompanyCallback
         * @param {String} error Error message, if any.
         * @param {Array.<module:model/ExpenseType>} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * get expense types in company
         * @param {Number} companyId 
         * @param {module:api/ExpenseTypeApi~getEpxensTypesInCompanyCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link Array.<module:model/ExpenseType>}
         */
      }, {
        key: "getEpxensTypesInCompany",
        value: function getEpxensTypesInCompany(companyId, callback) {
          var postBody = null;
          // verify the required parameter 'companyId' is set
          if (companyId === undefined || companyId === null) {
            throw new Error("Missing the required parameter 'companyId' when calling getEpxensTypesInCompany");
          }
          var pathParams = {
            'companyId': companyId
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = ['application/json'];
          var returnType = [_ExpenseType["default"]];
          return this.apiClient.callApi('/api/Company/{companyId}/ExpenseType', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the getExpenseTypeInCompany operation.
         * @callback module:api/ExpenseTypeApi~getExpenseTypeInCompanyCallback
         * @param {String} error Error message, if any.
         * @param {module:model/ExpenseType} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * get expense type in company by id
         * @param {Number} companyId 
         * @param {Number} expenseTypeId 
         * @param {module:api/ExpenseTypeApi~getExpenseTypeInCompanyCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link module:model/ExpenseType}
         */
      }, {
        key: "getExpenseTypeInCompany",
        value: function getExpenseTypeInCompany(companyId, expenseTypeId, callback) {
          var postBody = null;
          // verify the required parameter 'companyId' is set
          if (companyId === undefined || companyId === null) {
            throw new Error("Missing the required parameter 'companyId' when calling getExpenseTypeInCompany");
          }
          // verify the required parameter 'expenseTypeId' is set
          if (expenseTypeId === undefined || expenseTypeId === null) {
            throw new Error("Missing the required parameter 'expenseTypeId' when calling getExpenseTypeInCompany");
          }
          var pathParams = {
            'companyId': companyId,
            'expenseTypeId': expenseTypeId
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = ['application/json'];
          var returnType = _ExpenseType["default"];
          return this.apiClient.callApi('/api/Company/{companyId}/ExpenseType/{expenseTypeId}', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }

        /**
         * Callback function to receive the result of the updateExpenseType operation.
         * @callback module:api/ExpenseTypeApi~updateExpenseTypeCallback
         * @param {String} error Error message, if any.
         * @param data This operation does not return a value.
         * @param {String} response The complete HTTP response.
         */

        /**
         * can change name,limit, description
         * @param {Number} companyId 
         * @param {Number} expenseTypeId 
         * @param {Object} opts Optional parameters
         * @param {module:model/ExpenseType} opts.expenseType 
         * @param {module:api/ExpenseTypeApi~updateExpenseTypeCallback} callback The callback function, accepting three arguments: error, data, response
         */
      }, {
        key: "updateExpenseType",
        value: function updateExpenseType(companyId, expenseTypeId, opts, callback) {
          opts = opts || {};
          var postBody = opts['expenseType'];
          // verify the required parameter 'companyId' is set
          if (companyId === undefined || companyId === null) {
            throw new Error("Missing the required parameter 'companyId' when calling updateExpenseType");
          }
          // verify the required parameter 'expenseTypeId' is set
          if (expenseTypeId === undefined || expenseTypeId === null) {
            throw new Error("Missing the required parameter 'expenseTypeId' when calling updateExpenseType");
          }
          var pathParams = {
            'companyId': companyId,
            'expenseTypeId': expenseTypeId
          };
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = ['application/json', 'text/json', 'application/*+json'];
          var accepts = [];
          var returnType = null;
          return this.apiClient.callApi('/api/Company/{companyId}/ExpenseType/{expenseTypeId}', 'PUT', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }
      }]);
      return ExpenseTypeApi;
    }();
    exports["default"] = ExpenseTypeApi;
  }, { "../ApiClient": 10, "../model/ExpenseType": 26 }], 19: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports["default"] = void 0;
    var _ApiClient = _interopRequireDefault(require("../ApiClient"));
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
    /**
    * Ok service.
    * @module api/OkApi
    * @version v1
    */
    var OkApi = /*#__PURE__*/function () {
      /**
      * Constructs a new OkApi. 
      * @alias module:api/OkApi
      * @class
      * @param {module:ApiClient} [apiClient] Optional API client implementation to use,
      * default to {@link module:ApiClient#instance} if unspecified.
      */
      function OkApi(apiClient) {
        _classCallCheck(this, OkApi);
        this.apiClient = apiClient || _ApiClient["default"].instance;
      }

      /**
       * Callback function to receive the result of the checkConnectToApi operation.
       * @callback module:api/OkApi~checkConnectToApiCallback
       * @param {String} error Error message, if any.
       * @param data This operation does not return a value.
       * @param {String} response The complete HTTP response.
       */

      /**
       * for check connect
       * @param {module:api/OkApi~checkConnectToApiCallback} callback The callback function, accepting three arguments: error, data, response
       */
      _createClass(OkApi, [{
        key: "checkConnectToApi",
        value: function checkConnectToApi(callback) {
          var postBody = null;
          var pathParams = {};
          var queryParams = {};
          var headerParams = {};
          var formParams = {};
          var authNames = [];
          var contentTypes = [];
          var accepts = [];
          var returnType = null;
          return this.apiClient.callApi('/api/Ok', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType, null, callback);
        }
      }]);
      return OkApi;
    }();
    exports["default"] = OkApi;
  }, { "../ApiClient": 10 }], 20: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "ApiClient", {
      enumerable: true,
      get: function get() {
        return _ApiClient["default"];
      }
    });
    Object.defineProperty(exports, "BugetPlan", {
      enumerable: true,
      get: function get() {
        return _BugetPlan["default"];
      }
    });
    Object.defineProperty(exports, "BugetPlanApi", {
      enumerable: true,
      get: function get() {
        return _BugetPlanApi["default"];
      }
    });
    Object.defineProperty(exports, "Company", {
      enumerable: true,
      get: function get() {
        return _Company["default"];
      }
    });
    Object.defineProperty(exports, "CompanyApi", {
      enumerable: true,
      get: function get() {
        return _CompanyApi["default"];
      }
    });
    Object.defineProperty(exports, "Department", {
      enumerable: true,
      get: function get() {
        return _Department["default"];
      }
    });
    Object.defineProperty(exports, "DepartmentApi", {
      enumerable: true,
      get: function get() {
        return _DepartmentApi["default"];
      }
    });
    Object.defineProperty(exports, "Employee", {
      enumerable: true,
      get: function get() {
        return _Employee["default"];
      }
    });
    Object.defineProperty(exports, "EmployeeApi", {
      enumerable: true,
      get: function get() {
        return _EmployeeApi["default"];
      }
    });
    Object.defineProperty(exports, "EmployeeFromDepartmentApi", {
      enumerable: true,
      get: function get() {
        return _EmployeeFromDepartmentApi["default"];
      }
    });
    Object.defineProperty(exports, "Expense", {
      enumerable: true,
      get: function get() {
        return _Expense["default"];
      }
    });
    Object.defineProperty(exports, "ExpenseFromDepartmentApi", {
      enumerable: true,
      get: function get() {
        return _ExpenseFromDepartmentApi["default"];
      }
    });
    Object.defineProperty(exports, "ExpenseFromEmployeeApi", {
      enumerable: true,
      get: function get() {
        return _ExpenseFromEmployeeApi["default"];
      }
    });
    Object.defineProperty(exports, "ExpenseType", {
      enumerable: true,
      get: function get() {
        return _ExpenseType["default"];
      }
    });
    Object.defineProperty(exports, "ExpenseTypeApi", {
      enumerable: true,
      get: function get() {
        return _ExpenseTypeApi["default"];
      }
    });
    Object.defineProperty(exports, "Month", {
      enumerable: true,
      get: function get() {
        return _Month["default"];
      }
    });
    Object.defineProperty(exports, "OkApi", {
      enumerable: true,
      get: function get() {
        return _OkApi["default"];
      }
    });
    var _ApiClient = _interopRequireDefault(require("./ApiClient"));
    var _BugetPlan = _interopRequireDefault(require("./model/BugetPlan"));
    var _Company = _interopRequireDefault(require("./model/Company"));
    var _Department = _interopRequireDefault(require("./model/Department"));
    var _Employee = _interopRequireDefault(require("./model/Employee"));
    var _Expense = _interopRequireDefault(require("./model/Expense"));
    var _ExpenseType = _interopRequireDefault(require("./model/ExpenseType"));
    var _Month = _interopRequireDefault(require("./model/Month"));
    var _BugetPlanApi = _interopRequireDefault(require("./api/BugetPlanApi"));
    var _CompanyApi = _interopRequireDefault(require("./api/CompanyApi"));
    var _DepartmentApi = _interopRequireDefault(require("./api/DepartmentApi"));
    var _EmployeeApi = _interopRequireDefault(require("./api/EmployeeApi"));
    var _EmployeeFromDepartmentApi = _interopRequireDefault(require("./api/EmployeeFromDepartmentApi"));
    var _ExpenseFromDepartmentApi = _interopRequireDefault(require("./api/ExpenseFromDepartmentApi"));
    var _ExpenseFromEmployeeApi = _interopRequireDefault(require("./api/ExpenseFromEmployeeApi"));
    var _ExpenseTypeApi = _interopRequireDefault(require("./api/ExpenseTypeApi"));
    var _OkApi = _interopRequireDefault(require("./api/OkApi"));
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
  }, { "./ApiClient": 10, "./api/BugetPlanApi": 11, "./api/CompanyApi": 12, "./api/DepartmentApi": 13, "./api/EmployeeApi": 14, "./api/EmployeeFromDepartmentApi": 15, "./api/ExpenseFromDepartmentApi": 16, "./api/ExpenseFromEmployeeApi": 17, "./api/ExpenseTypeApi": 18, "./api/OkApi": 19, "./model/BugetPlan": 21, "./model/Company": 22, "./model/Department": 23, "./model/Employee": 24, "./model/Expense": 25, "./model/ExpenseType": 26, "./model/Month": 27 }], 21: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports["default"] = void 0;
    var _ApiClient = _interopRequireDefault(require("../ApiClient"));
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
    /**
     * The BugetPlan model module.
     * @module model/BugetPlan
     * @version v1
     */
    var BugetPlan = /*#__PURE__*/function () {
      /**
       * Constructs a new <code>BugetPlan</code>.
       * @alias module:model/BugetPlan
       */
      function BugetPlan() {
        _classCallCheck(this, BugetPlan);
        BugetPlan.initialize(this);
      }

      /**
       * Initializes the fields of this object.
       * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
       * Only for internal use.
       */
      _createClass(BugetPlan, null, [{
        key: "initialize",
        value: function initialize(obj) { }

        /**
         * Constructs a <code>BugetPlan</code> from a plain JavaScript object, optionally creating a new instance.
         * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
         * @param {Object} data The plain JavaScript object bearing properties of interest.
         * @param {module:model/BugetPlan} obj Optional instance to populate.
         * @return {module:model/BugetPlan} The populated <code>BugetPlan</code> instance.
         */
      }, {
        key: "constructFromObject",
        value: function constructFromObject(data, obj) {
          if (data) {
            obj = obj || new BugetPlan();
            if (data.hasOwnProperty('id')) {
              obj['id'] = _ApiClient["default"].convertToType(data['id'], 'Number');
            }
            if (data.hasOwnProperty('createDate')) {
              obj['createDate'] = _ApiClient["default"].convertToType(data['createDate'], 'Date');
            }
            if (data.hasOwnProperty('modifyDate')) {
              obj['modifyDate'] = _ApiClient["default"].convertToType(data['modifyDate'], 'Date');
            }
            if (data.hasOwnProperty('january')) {
              obj['january'] = _ApiClient["default"].convertToType(data['january'], 'Number');
            }
            if (data.hasOwnProperty('february')) {
              obj['february'] = _ApiClient["default"].convertToType(data['february'], 'Number');
            }
            if (data.hasOwnProperty('march')) {
              obj['march'] = _ApiClient["default"].convertToType(data['march'], 'Number');
            }
            if (data.hasOwnProperty('april')) {
              obj['april'] = _ApiClient["default"].convertToType(data['april'], 'Number');
            }
            if (data.hasOwnProperty('may')) {
              obj['may'] = _ApiClient["default"].convertToType(data['may'], 'Number');
            }
            if (data.hasOwnProperty('june')) {
              obj['june'] = _ApiClient["default"].convertToType(data['june'], 'Number');
            }
            if (data.hasOwnProperty('july')) {
              obj['july'] = _ApiClient["default"].convertToType(data['july'], 'Number');
            }
            if (data.hasOwnProperty('august')) {
              obj['august'] = _ApiClient["default"].convertToType(data['august'], 'Number');
            }
            if (data.hasOwnProperty('september')) {
              obj['september'] = _ApiClient["default"].convertToType(data['september'], 'Number');
            }
            if (data.hasOwnProperty('october')) {
              obj['october'] = _ApiClient["default"].convertToType(data['october'], 'Number');
            }
            if (data.hasOwnProperty('november')) {
              obj['november'] = _ApiClient["default"].convertToType(data['november'], 'Number');
            }
            if (data.hasOwnProperty('december')) {
              obj['december'] = _ApiClient["default"].convertToType(data['december'], 'Number');
            }
          }
          return obj;
        }

        /**
         * Validates the JSON data with respect to <code>BugetPlan</code>.
         * @param {Object} data The plain JavaScript object bearing properties of interest.
         * @return {boolean} to indicate whether the JSON data is valid with respect to <code>BugetPlan</code>.
         */
      }, {
        key: "validateJSON",
        value: function validateJSON(data) {
          return true;
        }
      }]);
      return BugetPlan;
    }();
    /**
     * @member {Number} id
     */
    BugetPlan.prototype['id'] = undefined;

    /**
     * @member {Date} createDate
     */
    BugetPlan.prototype['createDate'] = undefined;

    /**
     * @member {Date} modifyDate
     */
    BugetPlan.prototype['modifyDate'] = undefined;

    /**
     * @member {Number} january
     */
    BugetPlan.prototype['january'] = undefined;

    /**
     * @member {Number} february
     */
    BugetPlan.prototype['february'] = undefined;

    /**
     * @member {Number} march
     */
    BugetPlan.prototype['march'] = undefined;

    /**
     * @member {Number} april
     */
    BugetPlan.prototype['april'] = undefined;

    /**
     * @member {Number} may
     */
    BugetPlan.prototype['may'] = undefined;

    /**
     * @member {Number} june
     */
    BugetPlan.prototype['june'] = undefined;

    /**
     * @member {Number} july
     */
    BugetPlan.prototype['july'] = undefined;

    /**
     * @member {Number} august
     */
    BugetPlan.prototype['august'] = undefined;

    /**
     * @member {Number} september
     */
    BugetPlan.prototype['september'] = undefined;

    /**
     * @member {Number} october
     */
    BugetPlan.prototype['october'] = undefined;

    /**
     * @member {Number} november
     */
    BugetPlan.prototype['november'] = undefined;

    /**
     * @member {Number} december
     */
    BugetPlan.prototype['december'] = undefined;
    var _default = BugetPlan;
    exports["default"] = _default;
  }, { "../ApiClient": 10 }], 22: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports["default"] = void 0;
    var _ApiClient = _interopRequireDefault(require("../ApiClient"));
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
    /**
     * The Company model module.
     * @module model/Company
     * @version v1
     */
    var Company = /*#__PURE__*/function () {
      /**
       * Constructs a new <code>Company</code>.
       * @alias module:model/Company
       */
      function Company() {
        _classCallCheck(this, Company);
        Company.initialize(this);
      }

      /**
       * Initializes the fields of this object.
       * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
       * Only for internal use.
       */
      _createClass(Company, null, [{
        key: "initialize",
        value: function initialize(obj) { }

        /**
         * Constructs a <code>Company</code> from a plain JavaScript object, optionally creating a new instance.
         * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
         * @param {Object} data The plain JavaScript object bearing properties of interest.
         * @param {module:model/Company} obj Optional instance to populate.
         * @return {module:model/Company} The populated <code>Company</code> instance.
         */
      }, {
        key: "constructFromObject",
        value: function constructFromObject(data, obj) {
          if (data) {
            obj = obj || new Company();
            if (data.hasOwnProperty('id')) {
              obj['id'] = _ApiClient["default"].convertToType(data['id'], 'Number');
            }
            if (data.hasOwnProperty('createDate')) {
              obj['createDate'] = _ApiClient["default"].convertToType(data['createDate'], 'Date');
            }
            if (data.hasOwnProperty('modifyDate')) {
              obj['modifyDate'] = _ApiClient["default"].convertToType(data['modifyDate'], 'Date');
            }
            if (data.hasOwnProperty('name')) {
              obj['name'] = _ApiClient["default"].convertToType(data['name'], 'String');
            }
          }
          return obj;
        }

        /**
         * Validates the JSON data with respect to <code>Company</code>.
         * @param {Object} data The plain JavaScript object bearing properties of interest.
         * @return {boolean} to indicate whether the JSON data is valid with respect to <code>Company</code>.
         */
      }, {
        key: "validateJSON",
        value: function validateJSON(data) {
          // ensure the json data is a string
          if (data['name'] && !(typeof data['name'] === 'string' || data['name'] instanceof String)) {
            throw new Error("Expected the field `name` to be a primitive type in the JSON string but got " + data['name']);
          }
          return true;
        }
      }]);
      return Company;
    }();
    /**
     * @member {Number} id
     */
    Company.prototype['id'] = undefined;

    /**
     * @member {Date} createDate
     */
    Company.prototype['createDate'] = undefined;

    /**
     * @member {Date} modifyDate
     */
    Company.prototype['modifyDate'] = undefined;

    /**
     * @member {String} name
     */
    Company.prototype['name'] = undefined;
    var _default = Company;
    exports["default"] = _default;
  }, { "../ApiClient": 10 }], 23: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports["default"] = void 0;
    var _ApiClient = _interopRequireDefault(require("../ApiClient"));
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
    /**
     * The Department model module.
     * @module model/Department
     * @version v1
     */
    var Department = /*#__PURE__*/function () {
      /**
       * Constructs a new <code>Department</code>.
       * @alias module:model/Department
       */
      function Department() {
        _classCallCheck(this, Department);
        Department.initialize(this);
      }

      /**
       * Initializes the fields of this object.
       * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
       * Only for internal use.
       */
      _createClass(Department, null, [{
        key: "initialize",
        value: function initialize(obj) { }

        /**
         * Constructs a <code>Department</code> from a plain JavaScript object, optionally creating a new instance.
         * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
         * @param {Object} data The plain JavaScript object bearing properties of interest.
         * @param {module:model/Department} obj Optional instance to populate.
         * @return {module:model/Department} The populated <code>Department</code> instance.
         */
      }, {
        key: "constructFromObject",
        value: function constructFromObject(data, obj) {
          if (data) {
            obj = obj || new Department();
            if (data.hasOwnProperty('id')) {
              obj['id'] = _ApiClient["default"].convertToType(data['id'], 'Number');
            }
            if (data.hasOwnProperty('createDate')) {
              obj['createDate'] = _ApiClient["default"].convertToType(data['createDate'], 'Date');
            }
            if (data.hasOwnProperty('modifyDate')) {
              obj['modifyDate'] = _ApiClient["default"].convertToType(data['modifyDate'], 'Date');
            }
            if (data.hasOwnProperty('name')) {
              obj['name'] = _ApiClient["default"].convertToType(data['name'], 'String');
            }
            if (data.hasOwnProperty('budget')) {
              obj['budget'] = _ApiClient["default"].convertToType(data['budget'], 'Number');
            }
          }
          return obj;
        }

        /**
         * Validates the JSON data with respect to <code>Department</code>.
         * @param {Object} data The plain JavaScript object bearing properties of interest.
         * @return {boolean} to indicate whether the JSON data is valid with respect to <code>Department</code>.
         */
      }, {
        key: "validateJSON",
        value: function validateJSON(data) {
          // ensure the json data is a string
          if (data['name'] && !(typeof data['name'] === 'string' || data['name'] instanceof String)) {
            throw new Error("Expected the field `name` to be a primitive type in the JSON string but got " + data['name']);
          }
          return true;
        }
      }]);
      return Department;
    }();
    /**
     * @member {Number} id
     */
    Department.prototype['id'] = undefined;

    /**
     * @member {Date} createDate
     */
    Department.prototype['createDate'] = undefined;

    /**
     * @member {Date} modifyDate
     */
    Department.prototype['modifyDate'] = undefined;

    /**
     * @member {String} name
     */
    Department.prototype['name'] = undefined;

    /**
     * @member {Number} budget
     */
    Department.prototype['budget'] = undefined;
    var _default = Department;
    exports["default"] = _default;
  }, { "../ApiClient": 10 }], 24: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports["default"] = void 0;
    var _ApiClient = _interopRequireDefault(require("../ApiClient"));
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
    /**
     * The Employee model module.
     * @module model/Employee
     * @version v1
     */
    var Employee = /*#__PURE__*/function () {
      /**
       * Constructs a new <code>Employee</code>.
       * @alias module:model/Employee
       */
      function Employee() {
        _classCallCheck(this, Employee);
        Employee.initialize(this);
      }

      /**
       * Initializes the fields of this object.
       * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
       * Only for internal use.
       */
      _createClass(Employee, null, [{
        key: "initialize",
        value: function initialize(obj) { }

        /**
         * Constructs a <code>Employee</code> from a plain JavaScript object, optionally creating a new instance.
         * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
         * @param {Object} data The plain JavaScript object bearing properties of interest.
         * @param {module:model/Employee} obj Optional instance to populate.
         * @return {module:model/Employee} The populated <code>Employee</code> instance.
         */
      }, {
        key: "constructFromObject",
        value: function constructFromObject(data, obj) {
          if (data) {
            obj = obj || new Employee();
            if (data.hasOwnProperty('id')) {
              obj['id'] = _ApiClient["default"].convertToType(data['id'], 'Number');
            }
            if (data.hasOwnProperty('createDate')) {
              obj['createDate'] = _ApiClient["default"].convertToType(data['createDate'], 'Date');
            }
            if (data.hasOwnProperty('modifyDate')) {
              obj['modifyDate'] = _ApiClient["default"].convertToType(data['modifyDate'], 'Date');
            }
            if (data.hasOwnProperty('name')) {
              obj['name'] = _ApiClient["default"].convertToType(data['name'], 'String');
            }
          }
          return obj;
        }

        /**
         * Validates the JSON data with respect to <code>Employee</code>.
         * @param {Object} data The plain JavaScript object bearing properties of interest.
         * @return {boolean} to indicate whether the JSON data is valid with respect to <code>Employee</code>.
         */
      }, {
        key: "validateJSON",
        value: function validateJSON(data) {
          // ensure the json data is a string
          if (data['name'] && !(typeof data['name'] === 'string' || data['name'] instanceof String)) {
            throw new Error("Expected the field `name` to be a primitive type in the JSON string but got " + data['name']);
          }
          return true;
        }
      }]);
      return Employee;
    }();
    /**
     * @member {Number} id
     */
    Employee.prototype['id'] = undefined;

    /**
     * @member {Date} createDate
     */
    Employee.prototype['createDate'] = undefined;

    /**
     * @member {Date} modifyDate
     */
    Employee.prototype['modifyDate'] = undefined;

    /**
     * @member {String} name
     */
    Employee.prototype['name'] = undefined;
    var _default = Employee;
    exports["default"] = _default;
  }, { "../ApiClient": 10 }], 25: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports["default"] = void 0;
    var _ApiClient = _interopRequireDefault(require("../ApiClient"));
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
    /**
     * The Expense model module.
     * @module model/Expense
     * @version v1
     */
    var Expense = /*#__PURE__*/function () {
      /**
       * Constructs a new <code>Expense</code>.
       * @alias module:model/Expense
       */
      function Expense() {
        _classCallCheck(this, Expense);
        Expense.initialize(this);
      }

      /**
       * Initializes the fields of this object.
       * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
       * Only for internal use.
       */
      _createClass(Expense, null, [{
        key: "initialize",
        value: function initialize(obj) { }

        /**
         * Constructs a <code>Expense</code> from a plain JavaScript object, optionally creating a new instance.
         * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
         * @param {Object} data The plain JavaScript object bearing properties of interest.
         * @param {module:model/Expense} obj Optional instance to populate.
         * @return {module:model/Expense} The populated <code>Expense</code> instance.
         */
      }, {
        key: "constructFromObject",
        value: function constructFromObject(data, obj) {
          if (data) {
            obj = obj || new Expense();
            if (data.hasOwnProperty('id')) {
              obj['id'] = _ApiClient["default"].convertToType(data['id'], 'Number');
            }
            if (data.hasOwnProperty('createDate')) {
              obj['createDate'] = _ApiClient["default"].convertToType(data['createDate'], 'Date');
            }
            if (data.hasOwnProperty('modifyDate')) {
              obj['modifyDate'] = _ApiClient["default"].convertToType(data['modifyDate'], 'Date');
            }
            if (data.hasOwnProperty('confirm')) {
              obj['confirm'] = _ApiClient["default"].convertToType(data['confirm'], 'Boolean');
            }
            if (data.hasOwnProperty('valid')) {
              obj['valid'] = _ApiClient["default"].convertToType(data['valid'], 'Boolean');
            }
            if (data.hasOwnProperty('date')) {
              obj['date'] = _ApiClient["default"].convertToType(data['date'], 'Date');
            }
            if (data.hasOwnProperty('amount')) {
              obj['amount'] = _ApiClient["default"].convertToType(data['amount'], 'Number');
            }
          }
          return obj;
        }

        /**
         * Validates the JSON data with respect to <code>Expense</code>.
         * @param {Object} data The plain JavaScript object bearing properties of interest.
         * @return {boolean} to indicate whether the JSON data is valid with respect to <code>Expense</code>.
         */
      }, {
        key: "validateJSON",
        value: function validateJSON(data) {
          return true;
        }
      }]);
      return Expense;
    }();
    /**
     * @member {Number} id
     */
    Expense.prototype['id'] = undefined;

    /**
     * @member {Date} createDate
     */
    Expense.prototype['createDate'] = undefined;

    /**
     * @member {Date} modifyDate
     */
    Expense.prototype['modifyDate'] = undefined;

    /**
     * @member {Boolean} confirm
     */
    Expense.prototype['confirm'] = undefined;

    /**
     * @member {Boolean} valid
     */
    Expense.prototype['valid'] = undefined;

    /**
     * @member {Date} date
     */
    Expense.prototype['date'] = undefined;

    /**
     * @member {Number} amount
     */
    Expense.prototype['amount'] = undefined;
    var _default = Expense;
    exports["default"] = _default;
  }, { "../ApiClient": 10 }], 26: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports["default"] = void 0;
    var _ApiClient = _interopRequireDefault(require("../ApiClient"));
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
    /**
     * The ExpenseType model module.
     * @module model/ExpenseType
     * @version v1
     */
    var ExpenseType = /*#__PURE__*/function () {
      /**
       * Constructs a new <code>ExpenseType</code>.
       * @alias module:model/ExpenseType
       */
      function ExpenseType() {
        _classCallCheck(this, ExpenseType);
        ExpenseType.initialize(this);
      }

      /**
       * Initializes the fields of this object.
       * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
       * Only for internal use.
       */
      _createClass(ExpenseType, null, [{
        key: "initialize",
        value: function initialize(obj) { }

        /**
         * Constructs a <code>ExpenseType</code> from a plain JavaScript object, optionally creating a new instance.
         * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
         * @param {Object} data The plain JavaScript object bearing properties of interest.
         * @param {module:model/ExpenseType} obj Optional instance to populate.
         * @return {module:model/ExpenseType} The populated <code>ExpenseType</code> instance.
         */
      }, {
        key: "constructFromObject",
        value: function constructFromObject(data, obj) {
          if (data) {
            obj = obj || new ExpenseType();
            if (data.hasOwnProperty('id')) {
              obj['id'] = _ApiClient["default"].convertToType(data['id'], 'Number');
            }
            if (data.hasOwnProperty('createDate')) {
              obj['createDate'] = _ApiClient["default"].convertToType(data['createDate'], 'Date');
            }
            if (data.hasOwnProperty('modifyDate')) {
              obj['modifyDate'] = _ApiClient["default"].convertToType(data['modifyDate'], 'Date');
            }
            if (data.hasOwnProperty('name')) {
              obj['name'] = _ApiClient["default"].convertToType(data['name'], 'String');
            }
            if (data.hasOwnProperty('description')) {
              obj['description'] = _ApiClient["default"].convertToType(data['description'], 'String');
            }
            if (data.hasOwnProperty('limit')) {
              obj['limit'] = _ApiClient["default"].convertToType(data['limit'], 'Number');
            }
          }
          return obj;
        }

        /**
         * Validates the JSON data with respect to <code>ExpenseType</code>.
         * @param {Object} data The plain JavaScript object bearing properties of interest.
         * @return {boolean} to indicate whether the JSON data is valid with respect to <code>ExpenseType</code>.
         */
      }, {
        key: "validateJSON",
        value: function validateJSON(data) {
          // ensure the json data is a string
          if (data['name'] && !(typeof data['name'] === 'string' || data['name'] instanceof String)) {
            throw new Error("Expected the field `name` to be a primitive type in the JSON string but got " + data['name']);
          }
          // ensure the json data is a string
          if (data['description'] && !(typeof data['description'] === 'string' || data['description'] instanceof String)) {
            throw new Error("Expected the field `description` to be a primitive type in the JSON string but got " + data['description']);
          }
          return true;
        }
      }]);
      return ExpenseType;
    }();
    /**
     * @member {Number} id
     */
    ExpenseType.prototype['id'] = undefined;

    /**
     * @member {Date} createDate
     */
    ExpenseType.prototype['createDate'] = undefined;

    /**
     * @member {Date} modifyDate
     */
    ExpenseType.prototype['modifyDate'] = undefined;

    /**
     * @member {String} name
     */
    ExpenseType.prototype['name'] = undefined;

    /**
     * @member {String} description
     */
    ExpenseType.prototype['description'] = undefined;

    /**
     * @member {Number} limit
     */
    ExpenseType.prototype['limit'] = undefined;
    var _default = ExpenseType;
    exports["default"] = _default;
  }, { "../ApiClient": 10 }], 27: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports["default"] = void 0;
    var _ApiClient = _interopRequireDefault(require("../ApiClient"));
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
    /**
    * Enum class Month.
    * @enum {}
    * @readonly
    */
    var Month = /*#__PURE__*/function () {
      function Month() {
        _classCallCheck(this, Month);
        _defineProperty(this, "0", 0);
        _defineProperty(this, "1", 1);
        _defineProperty(this, "2", 2);
        _defineProperty(this, "3", 3);
        _defineProperty(this, "4", 4);
        _defineProperty(this, "5", 5);
        _defineProperty(this, "6", 6);
        _defineProperty(this, "7", 7);
        _defineProperty(this, "8", 8);
        _defineProperty(this, "9", 9);
        _defineProperty(this, "10", 10);
        _defineProperty(this, "11", 11);
      }
      _createClass(Month, null, [{
        key: "constructFromObject",
        value:
          /**
          * Returns a <code>Month</code> enum value from a Javascript object name.
          * @param {Object} data The plain JavaScript object containing the name of the enum value.
          * @return {module:model/Month} The enum <code>Month</code> value.
          */
          function constructFromObject(object) {
            return object;
          }
      }]);
      return Month;
    }();
    exports["default"] = Month;
  }, { "../ApiClient": 10 }], 28: [function (require, module, exports) {
    "use strict";

    function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

    function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

    function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

    function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

    function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

    function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

    function Agent() {
      this._defaults = [];
    }

    ['use', 'on', 'once', 'set', 'query', 'type', 'accept', 'auth', 'withCredentials', 'sortQuery', 'retry', 'ok', 'redirects', 'timeout', 'buffer', 'serialize', 'parse', 'ca', 'key', 'pfx', 'cert', 'disableTLSCerts'].forEach(function (fn) {
      // Default setting for all requests from this agent
      Agent.prototype[fn] = function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        this._defaults.push({
          fn: fn,
          args: args
        });

        return this;
      };
    });

    Agent.prototype._setDefaults = function (req) {
      this._defaults.forEach(function (def) {
        req[def.fn].apply(req, _toConsumableArray(def.args));
      });
    };

    module.exports = Agent;

  }, {}], 29: [function (require, module, exports) {
    "use strict";

    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    /**
     * Root reference for iframes.
     */
    var root;

    if (typeof window !== 'undefined') {
      // Browser window
      root = window;
    } else if (typeof self === 'undefined') {
      // Other environments
      console.warn('Using browser-only version of superagent in non-browser environment');
      root = void 0;
    } else {
      // Web Worker
      root = self;
    }

    var Emitter = require('component-emitter');

    var safeStringify = require('fast-safe-stringify');

    var RequestBase = require('./request-base');

    var isObject = require('./is-object');

    var ResponseBase = require('./response-base');

    var Agent = require('./agent-base');
    /**
     * Noop.
     */


    function noop() { }
    /**
     * Expose `request`.
     */


    module.exports = function (method, url) {
      // callback
      if (typeof url === 'function') {
        return new exports.Request('GET', method).end(url);
      } // url first


      if (arguments.length === 1) {
        return new exports.Request('GET', method);
      }

      return new exports.Request(method, url);
    };

    exports = module.exports;
    var request = exports;
    exports.Request = Request;
    /**
     * Determine XHR.
     */

    request.getXHR = function () {
      if (root.XMLHttpRequest && (!root.location || root.location.protocol !== 'file:' || !root.ActiveXObject)) {
        return new XMLHttpRequest();
      }

      try {
        return new ActiveXObject('Microsoft.XMLHTTP');
      } catch (_unused) { }

      try {
        return new ActiveXObject('Msxml2.XMLHTTP.6.0');
      } catch (_unused2) { }

      try {
        return new ActiveXObject('Msxml2.XMLHTTP.3.0');
      } catch (_unused3) { }

      try {
        return new ActiveXObject('Msxml2.XMLHTTP');
      } catch (_unused4) { }

      throw new Error('Browser-only version of superagent could not find XHR');
    };
    /**
     * Removes leading and trailing whitespace, added to support IE.
     *
     * @param {String} s
     * @return {String}
     * @api private
     */


    var trim = ''.trim ? function (s) {
      return s.trim();
    } : function (s) {
      return s.replace(/(^\s*|\s*$)/g, '');
    };
    /**
     * Serialize the given `obj`.
     *
     * @param {Object} obj
     * @return {String}
     * @api private
     */

    function serialize(obj) {
      if (!isObject(obj)) return obj;
      var pairs = [];

      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) pushEncodedKeyValuePair(pairs, key, obj[key]);
      }

      return pairs.join('&');
    }
    /**
     * Helps 'serialize' with serializing arrays.
     * Mutates the pairs array.
     *
     * @param {Array} pairs
     * @param {String} key
     * @param {Mixed} val
     */


    function pushEncodedKeyValuePair(pairs, key, val) {
      if (val === undefined) return;

      if (val === null) {
        pairs.push(encodeURI(key));
        return;
      }

      if (Array.isArray(val)) {
        val.forEach(function (v) {
          pushEncodedKeyValuePair(pairs, key, v);
        });
      } else if (isObject(val)) {
        for (var subkey in val) {
          if (Object.prototype.hasOwnProperty.call(val, subkey)) pushEncodedKeyValuePair(pairs, "".concat(key, "[").concat(subkey, "]"), val[subkey]);
        }
      } else {
        pairs.push(encodeURI(key) + '=' + encodeURIComponent(val));
      }
    }
    /**
     * Expose serialization method.
     */


    request.serializeObject = serialize;
    /**
     * Parse the given x-www-form-urlencoded `str`.
     *
     * @param {String} str
     * @return {Object}
     * @api private
     */

    function parseString(str) {
      var obj = {};
      var pairs = str.split('&');
      var pair;
      var pos;

      for (var i = 0, len = pairs.length; i < len; ++i) {
        pair = pairs[i];
        pos = pair.indexOf('=');

        if (pos === -1) {
          obj[decodeURIComponent(pair)] = '';
        } else {
          obj[decodeURIComponent(pair.slice(0, pos))] = decodeURIComponent(pair.slice(pos + 1));
        }
      }

      return obj;
    }
    /**
     * Expose parser.
     */


    request.parseString = parseString;
    /**
     * Default MIME type map.
     *
     *     superagent.types.xml = 'application/xml';
     *
     */

    request.types = {
      html: 'text/html',
      json: 'application/json',
      xml: 'text/xml',
      urlencoded: 'application/x-www-form-urlencoded',
      form: 'application/x-www-form-urlencoded',
      'form-data': 'application/x-www-form-urlencoded'
    };
    /**
     * Default serialization map.
     *
     *     superagent.serialize['application/xml'] = function(obj){
     *       return 'generated xml here';
     *     };
     *
     */

    request.serialize = {
      'application/x-www-form-urlencoded': serialize,
      'application/json': safeStringify
    };
    /**
     * Default parsers.
     *
     *     superagent.parse['application/xml'] = function(str){
     *       return { object parsed from str };
     *     };
     *
     */

    request.parse = {
      'application/x-www-form-urlencoded': parseString,
      'application/json': JSON.parse
    };
    /**
     * Parse the given header `str` into
     * an object containing the mapped fields.
     *
     * @param {String} str
     * @return {Object}
     * @api private
     */

    function parseHeader(str) {
      var lines = str.split(/\r?\n/);
      var fields = {};
      var index;
      var line;
      var field;
      var val;

      for (var i = 0, len = lines.length; i < len; ++i) {
        line = lines[i];
        index = line.indexOf(':');

        if (index === -1) {
          // could be empty line, just skip it
          continue;
        }

        field = line.slice(0, index).toLowerCase();
        val = trim(line.slice(index + 1));
        fields[field] = val;
      }

      return fields;
    }
    /**
     * Check if `mime` is json or has +json structured syntax suffix.
     *
     * @param {String} mime
     * @return {Boolean}
     * @api private
     */


    function isJSON(mime) {
      // should match /json or +json
      // but not /json-seq
      return /[/+]json($|[^-\w])/.test(mime);
    }
    /**
     * Initialize a new `Response` with the given `xhr`.
     *
     *  - set flags (.ok, .error, etc)
     *  - parse header
     *
     * Examples:
     *
     *  Aliasing `superagent` as `request` is nice:
     *
     *      request = superagent;
     *
     *  We can use the promise-like API, or pass callbacks:
     *
     *      request.get('/').end(function(res){});
     *      request.get('/', function(res){});
     *
     *  Sending data can be chained:
     *
     *      request
     *        .post('/user')
     *        .send({ name: 'tj' })
     *        .end(function(res){});
     *
     *  Or passed to `.send()`:
     *
     *      request
     *        .post('/user')
     *        .send({ name: 'tj' }, function(res){});
     *
     *  Or passed to `.post()`:
     *
     *      request
     *        .post('/user', { name: 'tj' })
     *        .end(function(res){});
     *
     * Or further reduced to a single call for simple cases:
     *
     *      request
     *        .post('/user', { name: 'tj' }, function(res){});
     *
     * @param {XMLHTTPRequest} xhr
     * @param {Object} options
     * @api private
     */


    function Response(req) {
      this.req = req;
      this.xhr = this.req.xhr; // responseText is accessible only if responseType is '' or 'text' and on older browsers

      this.text = this.req.method !== 'HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text') || typeof this.xhr.responseType === 'undefined' ? this.xhr.responseText : null;
      this.statusText = this.req.xhr.statusText;
      var status = this.xhr.status; // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request

      if (status === 1223) {
        status = 204;
      }

      this._setStatusProperties(status);

      this.headers = parseHeader(this.xhr.getAllResponseHeaders());
      this.header = this.headers; // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
      // getResponseHeader still works. so we get content-type even if getting
      // other headers fails.

      this.header['content-type'] = this.xhr.getResponseHeader('content-type');

      this._setHeaderProperties(this.header);

      if (this.text === null && req._responseType) {
        this.body = this.xhr.response;
      } else {
        this.body = this.req.method === 'HEAD' ? null : this._parseBody(this.text ? this.text : this.xhr.response);
      }
    } // eslint-disable-next-line new-cap


    ResponseBase(Response.prototype);
    /**
     * Parse the given body `str`.
     *
     * Used for auto-parsing of bodies. Parsers
     * are defined on the `superagent.parse` object.
     *
     * @param {String} str
     * @return {Mixed}
     * @api private
     */

    Response.prototype._parseBody = function (str) {
      var parse = request.parse[this.type];

      if (this.req._parser) {
        return this.req._parser(this, str);
      }

      if (!parse && isJSON(this.type)) {
        parse = request.parse['application/json'];
      }

      return parse && str && (str.length > 0 || str instanceof Object) ? parse(str) : null;
    };
    /**
     * Return an `Error` representative of this response.
     *
     * @return {Error}
     * @api public
     */


    Response.prototype.toError = function () {
      var req = this.req;
      var method = req.method;
      var url = req.url;
      var msg = "cannot ".concat(method, " ").concat(url, " (").concat(this.status, ")");
      var err = new Error(msg);
      err.status = this.status;
      err.method = method;
      err.url = url;
      return err;
    };
    /**
     * Expose `Response`.
     */


    request.Response = Response;
    /**
     * Initialize a new `Request` with the given `method` and `url`.
     *
     * @param {String} method
     * @param {String} url
     * @api public
     */

    function Request(method, url) {
      var self = this;
      this._query = this._query || [];
      this.method = method;
      this.url = url;
      this.header = {}; // preserves header name case

      this._header = {}; // coerces header names to lowercase

      this.on('end', function () {
        var err = null;
        var res = null;

        try {
          res = new Response(self);
        } catch (err_) {
          err = new Error('Parser is unable to parse the response');
          err.parse = true;
          err.original = err_; // issue #675: return the raw response if the response parsing fails

          if (self.xhr) {
            // ie9 doesn't have 'response' property
            err.rawResponse = typeof self.xhr.responseType === 'undefined' ? self.xhr.responseText : self.xhr.response; // issue #876: return the http status code if the response parsing fails

            err.status = self.xhr.status ? self.xhr.status : null;
            err.statusCode = err.status; // backwards-compat only
          } else {
            err.rawResponse = null;
            err.status = null;
          }

          return self.callback(err);
        }

        self.emit('response', res);
        var new_err;

        try {
          if (!self._isResponseOK(res)) {
            new_err = new Error(res.statusText || res.text || 'Unsuccessful HTTP response');
          }
        } catch (err_) {
          new_err = err_; // ok() callback can throw
        } // #1000 don't catch errors from the callback to avoid double calling it


        if (new_err) {
          new_err.original = err;
          new_err.response = res;
          new_err.status = res.status;
          self.callback(new_err, res);
        } else {
          self.callback(null, res);
        }
      });
    }
    /**
     * Mixin `Emitter` and `RequestBase`.
     */
    // eslint-disable-next-line new-cap


    Emitter(Request.prototype); // eslint-disable-next-line new-cap

    RequestBase(Request.prototype);
    /**
     * Set Content-Type to `type`, mapping values from `request.types`.
     *
     * Examples:
     *
     *      superagent.types.xml = 'application/xml';
     *
     *      request.post('/')
     *        .type('xml')
     *        .send(xmlstring)
     *        .end(callback);
     *
     *      request.post('/')
     *        .type('application/xml')
     *        .send(xmlstring)
     *        .end(callback);
     *
     * @param {String} type
     * @return {Request} for chaining
     * @api public
     */

    Request.prototype.type = function (type) {
      this.set('Content-Type', request.types[type] || type);
      return this;
    };
    /**
     * Set Accept to `type`, mapping values from `request.types`.
     *
     * Examples:
     *
     *      superagent.types.json = 'application/json';
     *
     *      request.get('/agent')
     *        .accept('json')
     *        .end(callback);
     *
     *      request.get('/agent')
     *        .accept('application/json')
     *        .end(callback);
     *
     * @param {String} accept
     * @return {Request} for chaining
     * @api public
     */


    Request.prototype.accept = function (type) {
      this.set('Accept', request.types[type] || type);
      return this;
    };
    /**
     * Set Authorization field value with `user` and `pass`.
     *
     * @param {String} user
     * @param {String} [pass] optional in case of using 'bearer' as type
     * @param {Object} options with 'type' property 'auto', 'basic' or 'bearer' (default 'basic')
     * @return {Request} for chaining
     * @api public
     */


    Request.prototype.auth = function (user, pass, options) {
      if (arguments.length === 1) pass = '';

      if (_typeof(pass) === 'object' && pass !== null) {
        // pass is optional and can be replaced with options
        options = pass;
        pass = '';
      }

      if (!options) {
        options = {
          type: typeof btoa === 'function' ? 'basic' : 'auto'
        };
      }

      var encoder = function encoder(string) {
        if (typeof btoa === 'function') {
          return btoa(string);
        }

        throw new Error('Cannot use basic auth, btoa is not a function');
      };

      return this._auth(user, pass, options, encoder);
    };
    /**
     * Add query-string `val`.
     *
     * Examples:
     *
     *   request.get('/shoes')
     *     .query('size=10')
     *     .query({ color: 'blue' })
     *
     * @param {Object|String} val
     * @return {Request} for chaining
     * @api public
     */


    Request.prototype.query = function (val) {
      if (typeof val !== 'string') val = serialize(val);
      if (val) this._query.push(val);
      return this;
    };
    /**
     * Queue the given `file` as an attachment to the specified `field`,
     * with optional `options` (or filename).
     *
     * ``` js
     * request.post('/upload')
     *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
     *   .end(callback);
     * ```
     *
     * @param {String} field
     * @param {Blob|File} file
     * @param {String|Object} options
     * @return {Request} for chaining
     * @api public
     */


    Request.prototype.attach = function (field, file, options) {
      if (file) {
        if (this._data) {
          throw new Error("superagent can't mix .send() and .attach()");
        }

        this._getFormData().append(field, file, options || file.name);
      }

      return this;
    };

    Request.prototype._getFormData = function () {
      if (!this._formData) {
        this._formData = new root.FormData();
      }

      return this._formData;
    };
    /**
     * Invoke the callback with `err` and `res`
     * and handle arity check.
     *
     * @param {Error} err
     * @param {Response} res
     * @api private
     */


    Request.prototype.callback = function (err, res) {
      if (this._shouldRetry(err, res)) {
        return this._retry();
      }

      var fn = this._callback;
      this.clearTimeout();

      if (err) {
        if (this._maxRetries) err.retries = this._retries - 1;
        this.emit('error', err);
      }

      fn(err, res);
    };
    /**
     * Invoke callback with x-domain error.
     *
     * @api private
     */


    Request.prototype.crossDomainError = function () {
      var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
      err.crossDomain = true;
      err.status = this.status;
      err.method = this.method;
      err.url = this.url;
      this.callback(err);
    }; // This only warns, because the request is still likely to work


    Request.prototype.agent = function () {
      console.warn('This is not supported in browser version of superagent');
      return this;
    };

    Request.prototype.ca = Request.prototype.agent;
    Request.prototype.buffer = Request.prototype.ca; // This throws, because it can't send/receive data as expected

    Request.prototype.write = function () {
      throw new Error('Streaming is not supported in browser version of superagent');
    };

    Request.prototype.pipe = Request.prototype.write;
    /**
     * Check if `obj` is a host object,
     * we don't want to serialize these :)
     *
     * @param {Object} obj host object
     * @return {Boolean} is a host object
     * @api private
     */

    Request.prototype._isHost = function (obj) {
      // Native objects stringify to [object File], [object Blob], [object FormData], etc.
      return obj && _typeof(obj) === 'object' && !Array.isArray(obj) && Object.prototype.toString.call(obj) !== '[object Object]';
    };
    /**
     * Initiate request, invoking callback `fn(res)`
     * with an instanceof `Response`.
     *
     * @param {Function} fn
     * @return {Request} for chaining
     * @api public
     */


    Request.prototype.end = function (fn) {
      if (this._endCalled) {
        console.warn('Warning: .end() was called twice. This is not supported in superagent');
      }

      this._endCalled = true; // store callback

      this._callback = fn || noop; // querystring

      this._finalizeQueryString();

      this._end();
    };

    Request.prototype._setUploadTimeout = function () {
      var self = this; // upload timeout it's wokrs only if deadline timeout is off

      if (this._uploadTimeout && !this._uploadTimeoutTimer) {
        this._uploadTimeoutTimer = setTimeout(function () {
          self._timeoutError('Upload timeout of ', self._uploadTimeout, 'ETIMEDOUT');
        }, this._uploadTimeout);
      }
    }; // eslint-disable-next-line complexity


    Request.prototype._end = function () {
      if (this._aborted) return this.callback(new Error('The request has been aborted even before .end() was called'));
      var self = this;
      this.xhr = request.getXHR();
      var xhr = this.xhr;
      var data = this._formData || this._data;

      this._setTimeouts(); // state change


      xhr.onreadystatechange = function () {
        var readyState = xhr.readyState;

        if (readyState >= 2 && self._responseTimeoutTimer) {
          clearTimeout(self._responseTimeoutTimer);
        }

        if (readyState !== 4) {
          return;
        } // In IE9, reads to any property (e.g. status) off of an aborted XHR will
        // result in the error "Could not complete the operation due to error c00c023f"


        var status;

        try {
          status = xhr.status;
        } catch (_unused5) {
          status = 0;
        }

        if (!status) {
          if (self.timedout || self._aborted) return;
          return self.crossDomainError();
        }

        self.emit('end');
      }; // progress


      var handleProgress = function handleProgress(direction, e) {
        if (e.total > 0) {
          e.percent = e.loaded / e.total * 100;

          if (e.percent === 100) {
            clearTimeout(self._uploadTimeoutTimer);
          }
        }

        e.direction = direction;
        self.emit('progress', e);
      };

      if (this.hasListeners('progress')) {
        try {
          xhr.addEventListener('progress', handleProgress.bind(null, 'download'));

          if (xhr.upload) {
            xhr.upload.addEventListener('progress', handleProgress.bind(null, 'upload'));
          }
        } catch (_unused6) {// Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
          // Reported here:
          // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
        }
      }

      if (xhr.upload) {
        this._setUploadTimeout();
      } // initiate request


      try {
        if (this.username && this.password) {
          xhr.open(this.method, this.url, true, this.username, this.password);
        } else {
          xhr.open(this.method, this.url, true);
        }
      } catch (err) {
        // see #1149
        return this.callback(err);
      } // CORS


      if (this._withCredentials) xhr.withCredentials = true; // body

      if (!this._formData && this.method !== 'GET' && this.method !== 'HEAD' && typeof data !== 'string' && !this._isHost(data)) {
        // serialize stuff
        var contentType = this._header['content-type'];

        var _serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];

        if (!_serialize && isJSON(contentType)) {
          _serialize = request.serialize['application/json'];
        }

        if (_serialize) data = _serialize(data);
      } // set header fields


      for (var field in this.header) {
        if (this.header[field] === null) continue;
        if (Object.prototype.hasOwnProperty.call(this.header, field)) xhr.setRequestHeader(field, this.header[field]);
      }

      if (this._responseType) {
        xhr.responseType = this._responseType;
      } // send stuff


      this.emit('request', this); // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
      // We need null here if data is undefined

      xhr.send(typeof data === 'undefined' ? null : data);
    };

    request.agent = function () {
      return new Agent();
    };

    ['GET', 'POST', 'OPTIONS', 'PATCH', 'PUT', 'DELETE'].forEach(function (method) {
      Agent.prototype[method.toLowerCase()] = function (url, fn) {
        var req = new request.Request(method, url);

        this._setDefaults(req);

        if (fn) {
          req.end(fn);
        }

        return req;
      };
    });
    Agent.prototype.del = Agent.prototype.delete;
    /**
     * GET `url` with optional callback `fn(res)`.
     *
     * @param {String} url
     * @param {Mixed|Function} [data] or fn
     * @param {Function} [fn]
     * @return {Request}
     * @api public
     */

    request.get = function (url, data, fn) {
      var req = request('GET', url);

      if (typeof data === 'function') {
        fn = data;
        data = null;
      }

      if (data) req.query(data);
      if (fn) req.end(fn);
      return req;
    };
    /**
     * HEAD `url` with optional callback `fn(res)`.
     *
     * @param {String} url
     * @param {Mixed|Function} [data] or fn
     * @param {Function} [fn]
     * @return {Request}
     * @api public
     */


    request.head = function (url, data, fn) {
      var req = request('HEAD', url);

      if (typeof data === 'function') {
        fn = data;
        data = null;
      }

      if (data) req.query(data);
      if (fn) req.end(fn);
      return req;
    };
    /**
     * OPTIONS query to `url` with optional callback `fn(res)`.
     *
     * @param {String} url
     * @param {Mixed|Function} [data] or fn
     * @param {Function} [fn]
     * @return {Request}
     * @api public
     */


    request.options = function (url, data, fn) {
      var req = request('OPTIONS', url);

      if (typeof data === 'function') {
        fn = data;
        data = null;
      }

      if (data) req.send(data);
      if (fn) req.end(fn);
      return req;
    };
    /**
     * DELETE `url` with optional `data` and callback `fn(res)`.
     *
     * @param {String} url
     * @param {Mixed} [data]
     * @param {Function} [fn]
     * @return {Request}
     * @api public
     */


    function del(url, data, fn) {
      var req = request('DELETE', url);

      if (typeof data === 'function') {
        fn = data;
        data = null;
      }

      if (data) req.send(data);
      if (fn) req.end(fn);
      return req;
    }

    request.del = del;
    request.delete = del;
    /**
     * PATCH `url` with optional `data` and callback `fn(res)`.
     *
     * @param {String} url
     * @param {Mixed} [data]
     * @param {Function} [fn]
     * @return {Request}
     * @api public
     */

    request.patch = function (url, data, fn) {
      var req = request('PATCH', url);

      if (typeof data === 'function') {
        fn = data;
        data = null;
      }

      if (data) req.send(data);
      if (fn) req.end(fn);
      return req;
    };
    /**
     * POST `url` with optional `data` and callback `fn(res)`.
     *
     * @param {String} url
     * @param {Mixed} [data]
     * @param {Function} [fn]
     * @return {Request}
     * @api public
     */


    request.post = function (url, data, fn) {
      var req = request('POST', url);

      if (typeof data === 'function') {
        fn = data;
        data = null;
      }

      if (data) req.send(data);
      if (fn) req.end(fn);
      return req;
    };
    /**
     * PUT `url` with optional `data` and callback `fn(res)`.
     *
     * @param {String} url
     * @param {Mixed|Function} [data] or fn
     * @param {Function} [fn]
     * @return {Request}
     * @api public
     */


    request.put = function (url, data, fn) {
      var req = request('PUT', url);

      if (typeof data === 'function') {
        fn = data;
        data = null;
      }

      if (data) req.send(data);
      if (fn) req.end(fn);
      return req;
    };

  }, { "./agent-base": 28, "./is-object": 30, "./request-base": 31, "./response-base": 32, "component-emitter": 8, "fast-safe-stringify": 9 }], 30: [function (require, module, exports) {
    "use strict";

    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    /**
     * Check if `obj` is an object.
     *
     * @param {Object} obj
     * @return {Boolean}
     * @api private
     */
    function isObject(obj) {
      return obj !== null && _typeof(obj) === 'object';
    }

    module.exports = isObject;

  }, {}], 31: [function (require, module, exports) {
    "use strict";

    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    /**
     * Module of mixed-in functions shared between node and client code
     */
    var isObject = require('./is-object');
    /**
     * Expose `RequestBase`.
     */


    module.exports = RequestBase;
    /**
     * Initialize a new `RequestBase`.
     *
     * @api public
     */

    function RequestBase(obj) {
      if (obj) return mixin(obj);
    }
    /**
     * Mixin the prototype properties.
     *
     * @param {Object} obj
     * @return {Object}
     * @api private
     */


    function mixin(obj) {
      for (var key in RequestBase.prototype) {
        if (Object.prototype.hasOwnProperty.call(RequestBase.prototype, key)) obj[key] = RequestBase.prototype[key];
      }

      return obj;
    }
    /**
     * Clear previous timeout.
     *
     * @return {Request} for chaining
     * @api public
     */


    RequestBase.prototype.clearTimeout = function () {
      clearTimeout(this._timer);
      clearTimeout(this._responseTimeoutTimer);
      clearTimeout(this._uploadTimeoutTimer);
      delete this._timer;
      delete this._responseTimeoutTimer;
      delete this._uploadTimeoutTimer;
      return this;
    };
    /**
     * Override default response body parser
     *
     * This function will be called to convert incoming data into request.body
     *
     * @param {Function}
     * @api public
     */


    RequestBase.prototype.parse = function (fn) {
      this._parser = fn;
      return this;
    };
    /**
     * Set format of binary response body.
     * In browser valid formats are 'blob' and 'arraybuffer',
     * which return Blob and ArrayBuffer, respectively.
     *
     * In Node all values result in Buffer.
     *
     * Examples:
     *
     *      req.get('/')
     *        .responseType('blob')
     *        .end(callback);
     *
     * @param {String} val
     * @return {Request} for chaining
     * @api public
     */


    RequestBase.prototype.responseType = function (val) {
      this._responseType = val;
      return this;
    };
    /**
     * Override default request body serializer
     *
     * This function will be called to convert data set via .send or .attach into payload to send
     *
     * @param {Function}
     * @api public
     */


    RequestBase.prototype.serialize = function (fn) {
      this._serializer = fn;
      return this;
    };
    /**
     * Set timeouts.
     *
     * - response timeout is time between sending request and receiving the first byte of the response. Includes DNS and connection time.
     * - deadline is the time from start of the request to receiving response body in full. If the deadline is too short large files may not load at all on slow connections.
     * - upload is the time  since last bit of data was sent or received. This timeout works only if deadline timeout is off
     *
     * Value of 0 or false means no timeout.
     *
     * @param {Number|Object} ms or {response, deadline}
     * @return {Request} for chaining
     * @api public
     */


    RequestBase.prototype.timeout = function (options) {
      if (!options || _typeof(options) !== 'object') {
        this._timeout = options;
        this._responseTimeout = 0;
        this._uploadTimeout = 0;
        return this;
      }

      for (var option in options) {
        if (Object.prototype.hasOwnProperty.call(options, option)) {
          switch (option) {
            case 'deadline':
              this._timeout = options.deadline;
              break;

            case 'response':
              this._responseTimeout = options.response;
              break;

            case 'upload':
              this._uploadTimeout = options.upload;
              break;

            default:
              console.warn('Unknown timeout option', option);
          }
        }
      }

      return this;
    };
    /**
     * Set number of retry attempts on error.
     *
     * Failed requests will be retried 'count' times if timeout or err.code >= 500.
     *
     * @param {Number} count
     * @param {Function} [fn]
     * @return {Request} for chaining
     * @api public
     */


    RequestBase.prototype.retry = function (count, fn) {
      // Default to 1 if no count passed or true
      if (arguments.length === 0 || count === true) count = 1;
      if (count <= 0) count = 0;
      this._maxRetries = count;
      this._retries = 0;
      this._retryCallback = fn;
      return this;
    };

    var ERROR_CODES = ['ECONNRESET', 'ETIMEDOUT', 'EADDRINFO', 'ESOCKETTIMEDOUT'];
    /**
     * Determine if a request should be retried.
     * (Borrowed from segmentio/superagent-retry)
     *
     * @param {Error} err an error
     * @param {Response} [res] response
     * @returns {Boolean} if segment should be retried
     */

    RequestBase.prototype._shouldRetry = function (err, res) {
      if (!this._maxRetries || this._retries++ >= this._maxRetries) {
        return false;
      }

      if (this._retryCallback) {
        try {
          var override = this._retryCallback(err, res);

          if (override === true) return true;
          if (override === false) return false; // undefined falls back to defaults
        } catch (err_) {
          console.error(err_);
        }
      }

      if (res && res.status && res.status >= 500 && res.status !== 501) return true;

      if (err) {
        if (err.code && ERROR_CODES.includes(err.code)) return true; // Superagent timeout

        if (err.timeout && err.code === 'ECONNABORTED') return true;
        if (err.crossDomain) return true;
      }

      return false;
    };
    /**
     * Retry request
     *
     * @return {Request} for chaining
     * @api private
     */


    RequestBase.prototype._retry = function () {
      this.clearTimeout(); // node

      if (this.req) {
        this.req = null;
        this.req = this.request();
      }

      this._aborted = false;
      this.timedout = false;
      this.timedoutError = null;
      return this._end();
    };
    /**
     * Promise support
     *
     * @param {Function} resolve
     * @param {Function} [reject]
     * @return {Request}
     */


    RequestBase.prototype.then = function (resolve, reject) {
      var _this = this;

      if (!this._fullfilledPromise) {
        var self = this;

        if (this._endCalled) {
          console.warn('Warning: superagent request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises');
        }

        this._fullfilledPromise = new Promise(function (resolve, reject) {
          self.on('abort', function () {
            if (_this._maxRetries && _this._maxRetries > _this._retries) {
              return;
            }

            if (_this.timedout && _this.timedoutError) {
              reject(_this.timedoutError);
              return;
            }

            var err = new Error('Aborted');
            err.code = 'ABORTED';
            err.status = _this.status;
            err.method = _this.method;
            err.url = _this.url;
            reject(err);
          });
          self.end(function (err, res) {
            if (err) reject(err); else resolve(res);
          });
        });
      }

      return this._fullfilledPromise.then(resolve, reject);
    };

    RequestBase.prototype.catch = function (cb) {
      return this.then(undefined, cb);
    };
    /**
     * Allow for extension
     */


    RequestBase.prototype.use = function (fn) {
      fn(this);
      return this;
    };

    RequestBase.prototype.ok = function (cb) {
      if (typeof cb !== 'function') throw new Error('Callback required');
      this._okCallback = cb;
      return this;
    };

    RequestBase.prototype._isResponseOK = function (res) {
      if (!res) {
        return false;
      }

      if (this._okCallback) {
        return this._okCallback(res);
      }

      return res.status >= 200 && res.status < 300;
    };
    /**
     * Get request header `field`.
     * Case-insensitive.
     *
     * @param {String} field
     * @return {String}
     * @api public
     */


    RequestBase.prototype.get = function (field) {
      return this._header[field.toLowerCase()];
    };
    /**
     * Get case-insensitive header `field` value.
     * This is a deprecated internal API. Use `.get(field)` instead.
     *
     * (getHeader is no longer used internally by the superagent code base)
     *
     * @param {String} field
     * @return {String}
     * @api private
     * @deprecated
     */


    RequestBase.prototype.getHeader = RequestBase.prototype.get;
    /**
     * Set header `field` to `val`, or multiple fields with one object.
     * Case-insensitive.
     *
     * Examples:
     *
     *      req.get('/')
     *        .set('Accept', 'application/json')
     *        .set('X-API-Key', 'foobar')
     *        .end(callback);
     *
     *      req.get('/')
     *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
     *        .end(callback);
     *
     * @param {String|Object} field
     * @param {String} val
     * @return {Request} for chaining
     * @api public
     */

    RequestBase.prototype.set = function (field, val) {
      if (isObject(field)) {
        for (var key in field) {
          if (Object.prototype.hasOwnProperty.call(field, key)) this.set(key, field[key]);
        }

        return this;
      }

      this._header[field.toLowerCase()] = val;
      this.header[field] = val;
      return this;
    };
    /**
     * Remove header `field`.
     * Case-insensitive.
     *
     * Example:
     *
     *      req.get('/')
     *        .unset('User-Agent')
     *        .end(callback);
     *
     * @param {String} field field name
     */


    RequestBase.prototype.unset = function (field) {
      delete this._header[field.toLowerCase()];
      delete this.header[field];
      return this;
    };
    /**
     * Write the field `name` and `val`, or multiple fields with one object
     * for "multipart/form-data" request bodies.
     *
     * ``` js
     * request.post('/upload')
     *   .field('foo', 'bar')
     *   .end(callback);
     *
     * request.post('/upload')
     *   .field({ foo: 'bar', baz: 'qux' })
     *   .end(callback);
     * ```
     *
     * @param {String|Object} name name of field
     * @param {String|Blob|File|Buffer|fs.ReadStream} val value of field
     * @return {Request} for chaining
     * @api public
     */


    RequestBase.prototype.field = function (name, val) {
      // name should be either a string or an object.
      if (name === null || undefined === name) {
        throw new Error('.field(name, val) name can not be empty');
      }

      if (this._data) {
        throw new Error(".field() can't be used if .send() is used. Please use only .send() or only .field() & .attach()");
      }

      if (isObject(name)) {
        for (var key in name) {
          if (Object.prototype.hasOwnProperty.call(name, key)) this.field(key, name[key]);
        }

        return this;
      }

      if (Array.isArray(val)) {
        for (var i in val) {
          if (Object.prototype.hasOwnProperty.call(val, i)) this.field(name, val[i]);
        }

        return this;
      } // val should be defined now


      if (val === null || undefined === val) {
        throw new Error('.field(name, val) val can not be empty');
      }

      if (typeof val === 'boolean') {
        val = String(val);
      }

      this._getFormData().append(name, val);

      return this;
    };
    /**
     * Abort the request, and clear potential timeout.
     *
     * @return {Request} request
     * @api public
     */


    RequestBase.prototype.abort = function () {
      if (this._aborted) {
        return this;
      }

      this._aborted = true;
      if (this.xhr) this.xhr.abort(); // browser

      if (this.req) this.req.abort(); // node

      this.clearTimeout();
      this.emit('abort');
      return this;
    };

    RequestBase.prototype._auth = function (user, pass, options, base64Encoder) {
      switch (options.type) {
        case 'basic':
          this.set('Authorization', "Basic ".concat(base64Encoder("".concat(user, ":").concat(pass))));
          break;

        case 'auto':
          this.username = user;
          this.password = pass;
          break;

        case 'bearer':
          // usage would be .auth(accessToken, { type: 'bearer' })
          this.set('Authorization', "Bearer ".concat(user));
          break;

        default:
          break;
      }

      return this;
    };
    /**
     * Enable transmission of cookies with x-domain requests.
     *
     * Note that for this to work the origin must not be
     * using "Access-Control-Allow-Origin" with a wildcard,
     * and also must set "Access-Control-Allow-Credentials"
     * to "true".
     *
     * @api public
     */


    RequestBase.prototype.withCredentials = function (on) {
      // This is browser-only functionality. Node side is no-op.
      if (on === undefined) on = true;
      this._withCredentials = on;
      return this;
    };
    /**
     * Set the max redirects to `n`. Does nothing in browser XHR implementation.
     *
     * @param {Number} n
     * @return {Request} for chaining
     * @api public
     */


    RequestBase.prototype.redirects = function (n) {
      this._maxRedirects = n;
      return this;
    };
    /**
     * Maximum size of buffered response body, in bytes. Counts uncompressed size.
     * Default 200MB.
     *
     * @param {Number} n number of bytes
     * @return {Request} for chaining
     */


    RequestBase.prototype.maxResponseSize = function (n) {
      if (typeof n !== 'number') {
        throw new TypeError('Invalid argument');
      }

      this._maxResponseSize = n;
      return this;
    };
    /**
     * Convert to a plain javascript object (not JSON string) of scalar properties.
     * Note as this method is designed to return a useful non-this value,
     * it cannot be chained.
     *
     * @return {Object} describing method, url, and data of this request
     * @api public
     */


    RequestBase.prototype.toJSON = function () {
      return {
        method: this.method,
        url: this.url,
        data: this._data,
        headers: this._header
      };
    };
    /**
     * Send `data` as the request body, defaulting the `.type()` to "json" when
     * an object is given.
     *
     * Examples:
     *
     *       // manual json
     *       request.post('/user')
     *         .type('json')
     *         .send('{"name":"tj"}')
     *         .end(callback)
     *
     *       // auto json
     *       request.post('/user')
     *         .send({ name: 'tj' })
     *         .end(callback)
     *
     *       // manual x-www-form-urlencoded
     *       request.post('/user')
     *         .type('form')
     *         .send('name=tj')
     *         .end(callback)
     *
     *       // auto x-www-form-urlencoded
     *       request.post('/user')
     *         .type('form')
     *         .send({ name: 'tj' })
     *         .end(callback)
     *
     *       // defaults to x-www-form-urlencoded
     *      request.post('/user')
     *        .send('name=tobi')
     *        .send('species=ferret')
     *        .end(callback)
     *
     * @param {String|Object} data
     * @return {Request} for chaining
     * @api public
     */
    // eslint-disable-next-line complexity


    RequestBase.prototype.send = function (data) {
      var isObj = isObject(data);
      var type = this._header['content-type'];

      if (this._formData) {
        throw new Error(".send() can't be used if .attach() or .field() is used. Please use only .send() or only .field() & .attach()");
      }

      if (isObj && !this._data) {
        if (Array.isArray(data)) {
          this._data = [];
        } else if (!this._isHost(data)) {
          this._data = {};
        }
      } else if (data && this._data && this._isHost(this._data)) {
        throw new Error("Can't merge these send calls");
      } // merge


      if (isObj && isObject(this._data)) {
        for (var key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) this._data[key] = data[key];
        }
      } else if (typeof data === 'string') {
        // default to x-www-form-urlencoded
        if (!type) this.type('form');
        type = this._header['content-type'];

        if (type === 'application/x-www-form-urlencoded') {
          this._data = this._data ? "".concat(this._data, "&").concat(data) : data;
        } else {
          this._data = (this._data || '') + data;
        }
      } else {
        this._data = data;
      }

      if (!isObj || this._isHost(data)) {
        return this;
      } // default to json


      if (!type) this.type('json');
      return this;
    };
    /**
     * Sort `querystring` by the sort function
     *
     *
     * Examples:
     *
     *       // default order
     *       request.get('/user')
     *         .query('name=Nick')
     *         .query('search=Manny')
     *         .sortQuery()
     *         .end(callback)
     *
     *       // customized sort function
     *       request.get('/user')
     *         .query('name=Nick')
     *         .query('search=Manny')
     *         .sortQuery(function(a, b){
     *           return a.length - b.length;
     *         })
     *         .end(callback)
     *
     *
     * @param {Function} sort
     * @return {Request} for chaining
     * @api public
     */


    RequestBase.prototype.sortQuery = function (sort) {
      // _sort default to true but otherwise can be a function or boolean
      this._sort = typeof sort === 'undefined' ? true : sort;
      return this;
    };
    /**
     * Compose querystring to append to req.url
     *
     * @api private
     */


    RequestBase.prototype._finalizeQueryString = function () {
      var query = this._query.join('&');

      if (query) {
        this.url += (this.url.includes('?') ? '&' : '?') + query;
      }

      this._query.length = 0; // Makes the call idempotent

      if (this._sort) {
        var index = this.url.indexOf('?');

        if (index >= 0) {
          var queryArr = this.url.slice(index + 1).split('&');

          if (typeof this._sort === 'function') {
            queryArr.sort(this._sort);
          } else {
            queryArr.sort();
          }

          this.url = this.url.slice(0, index) + '?' + queryArr.join('&');
        }
      }
    }; // For backwards compat only


    RequestBase.prototype._appendQueryString = function () {
      console.warn('Unsupported');
    };
    /**
     * Invoke callback with timeout error.
     *
     * @api private
     */


    RequestBase.prototype._timeoutError = function (reason, timeout, errno) {
      if (this._aborted) {
        return;
      }

      var err = new Error("".concat(reason + timeout, "ms exceeded"));
      err.timeout = timeout;
      err.code = 'ECONNABORTED';
      err.errno = errno;
      this.timedout = true;
      this.timedoutError = err;
      this.abort();
      this.callback(err);
    };

    RequestBase.prototype._setTimeouts = function () {
      var self = this; // deadline

      if (this._timeout && !this._timer) {
        this._timer = setTimeout(function () {
          self._timeoutError('Timeout of ', self._timeout, 'ETIME');
        }, this._timeout);
      } // response timeout


      if (this._responseTimeout && !this._responseTimeoutTimer) {
        this._responseTimeoutTimer = setTimeout(function () {
          self._timeoutError('Response timeout of ', self._responseTimeout, 'ETIMEDOUT');
        }, this._responseTimeout);
      }
    };

  }, { "./is-object": 30 }], 32: [function (require, module, exports) {
    "use strict";

    /**
     * Module dependencies.
     */
    var utils = require('./utils');
    /**
     * Expose `ResponseBase`.
     */


    module.exports = ResponseBase;
    /**
     * Initialize a new `ResponseBase`.
     *
     * @api public
     */

    function ResponseBase(obj) {
      if (obj) return mixin(obj);
    }
    /**
     * Mixin the prototype properties.
     *
     * @param {Object} obj
     * @return {Object}
     * @api private
     */


    function mixin(obj) {
      for (var key in ResponseBase.prototype) {
        if (Object.prototype.hasOwnProperty.call(ResponseBase.prototype, key)) obj[key] = ResponseBase.prototype[key];
      }

      return obj;
    }
    /**
     * Get case-insensitive `field` value.
     *
     * @param {String} field
     * @return {String}
     * @api public
     */


    ResponseBase.prototype.get = function (field) {
      return this.header[field.toLowerCase()];
    };
    /**
     * Set header related properties:
     *
     *   - `.type` the content type without params
     *
     * A response of "Content-Type: text/plain; charset=utf-8"
     * will provide you with a `.type` of "text/plain".
     *
     * @param {Object} header
     * @api private
     */


    ResponseBase.prototype._setHeaderProperties = function (header) {
      // TODO: moar!
      // TODO: make this a util
      // content-type
      var ct = header['content-type'] || '';
      this.type = utils.type(ct); // params

      var params = utils.params(ct);

      for (var key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) this[key] = params[key];
      }

      this.links = {}; // links

      try {
        if (header.link) {
          this.links = utils.parseLinks(header.link);
        }
      } catch (_unused) {// ignore
      }
    };
    /**
     * Set flags such as `.ok` based on `status`.
     *
     * For example a 2xx response will give you a `.ok` of __true__
     * whereas 5xx will be __false__ and `.error` will be __true__. The
     * `.clientError` and `.serverError` are also available to be more
     * specific, and `.statusType` is the class of error ranging from 1..5
     * sometimes useful for mapping respond colors etc.
     *
     * "sugar" properties are also defined for common cases. Currently providing:
     *
     *   - .noContent
     *   - .badRequest
     *   - .unauthorized
     *   - .notAcceptable
     *   - .notFound
     *
     * @param {Number} status
     * @api private
     */


    ResponseBase.prototype._setStatusProperties = function (status) {
      var type = status / 100 | 0; // status / class

      this.statusCode = status;
      this.status = this.statusCode;
      this.statusType = type; // basics

      this.info = type === 1;
      this.ok = type === 2;
      this.redirect = type === 3;
      this.clientError = type === 4;
      this.serverError = type === 5;
      this.error = type === 4 || type === 5 ? this.toError() : false; // sugar

      this.created = status === 201;
      this.accepted = status === 202;
      this.noContent = status === 204;
      this.badRequest = status === 400;
      this.unauthorized = status === 401;
      this.notAcceptable = status === 406;
      this.forbidden = status === 403;
      this.notFound = status === 404;
      this.unprocessableEntity = status === 422;
    };

  }, { "./utils": 33 }], 33: [function (require, module, exports) {
    "use strict";

    /**
     * Return the mime type for the given `str`.
     *
     * @param {String} str
     * @return {String}
     * @api private
     */
    exports.type = function (str) {
      return str.split(/ *; */).shift();
    };
    /**
     * Return header field parameters.
     *
     * @param {String} str
     * @return {Object}
     * @api private
     */


    exports.params = function (str) {
      return str.split(/ *; */).reduce(function (obj, str) {
        var parts = str.split(/ *= */);
        var key = parts.shift();
        var val = parts.shift();
        if (key && val) obj[key] = val;
        return obj;
      }, {});
    };
    /**
     * Parse Link header fields.
     *
     * @param {String} str
     * @return {Object}
     * @api private
     */


    exports.parseLinks = function (str) {
      return str.split(/ *, */).reduce(function (obj, str) {
        var parts = str.split(/ *; */);
        var url = parts[0].slice(1, -1);
        var rel = parts[1].split(/ *= */)[1].slice(1, -1);
        obj[rel] = url;
        return obj;
      }, {});
    };
    /**
     * Strip content related fields from `header`.
     *
     * @param {Object} header
     * @return {Object} header
     * @api private
     */


    exports.cleanHeader = function (header, changesOrigin) {
      delete header['content-type'];
      delete header['content-length'];
      delete header['transfer-encoding'];
      delete header.host; // secuirty

      if (changesOrigin) {
        delete header.authorization;
        delete header.cookie;
      }

      return header;
    };

  }, {}], 34: [function (require, module, exports) {
    var my_api_v1 = require("my_api_v1");


  }, { "my_api_v1": 20 }]
}, {}, [34]);
