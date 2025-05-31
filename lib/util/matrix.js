import Complex from './complex.js'
import Tensor from './tensor.js'

const normal_random = (m, s) => {
	const std = Math.sqrt(s)
	const x = Math.random()
	const y = Math.random()
	const X = Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * y)
	const Y = Math.sqrt(-2 * Math.log(x)) * Math.sin(2 * Math.PI * y)
	return [X * std + m, Y * std + m]
}

/**
 * Exception for matrix class
 */
export class MatrixException extends Error {
	/**
	 * @param {string} message Error message
	 * @param {*} value Some value
	 */
	constructor(message, value) {
		super(message)
		this.value = value
		this.name = 'MatrixException'
	}
}

/**
 * Matrix class
 * @template {*} [T=number] - Element type
 */
export default class Matrix {
	/**
	 * @overload
	 * @param {number} rows Number of rows
	 * @param {number} cols Number of columns
	 * @param {T | Array<T> | Array<Array<T>>} [values] Initial values
	 */
	/**
	 * @overload
	 * @param {[number, number]} size Sizes for each dimension
	 * @param {T | Array<T> | Array<Array<T>>} [values] Initial values
	 */
	/**
	 * @param {number | [number, number]} rows Number of rows
	 * @param {T | Array<T> | Array<Array<T>>} cols Number of columns or initial values
	 * @param {T | Array<T> | Array<Array<T>>} [values] Initial values
	 */
	constructor(rows, cols, values) {
		if (Array.isArray(rows)) {
			values = cols
			;[rows, cols] = rows
		}
		if (!values) {
			/** @private */
			this._value = Array(rows * cols).fill(0)
		} else if (!Array.isArray(values)) {
			this._value = Array(rows * cols).fill(values)
		} else if (Array.isArray(values[0])) {
			this._value = values.flat()
		} else {
			this._value = values
		}
		/** @private */
		this._size = [rows, cols]
	}

	/**
	 * Returns a matrix filled with 0.
	 * @overload
	 * @param {number} rows Number of rows
	 * @param {number} cols Number of columns
	 * @returns {Matrix<number>} Matrix filled with 0
	 */
	/**
	 * Returns a matrix filled with 0.
	 * @overload
	 * @param {[number, number]} size Sizes for each dimension
	 * @returns {Matrix<number>} Matrix filled with 0
	 */
	/**
	 * @param {number | [number, number]} rows Number of rows or sizes for each dimension
	 * @param {number} [cols] Number of columns
	 * @returns {Matrix<number>} Matrix filled with 0
	 */
	static zeros(rows, cols) {
		if (Array.isArray(rows)) {
			;[rows, cols] = rows
		}
		return new Matrix(rows, cols, Array(rows * cols).fill(0))
	}

	/**
	 * Returns a matrix filled with 1.
	 * @overload
	 * @param {number} rows Number of rows
	 * @param {number} cols Number of columns
	 * @returns {Matrix<number>} Matrix filled with 1
	 */
	/**
	 * Returns a matrix filled with 1.
	 * @overload
	 * @param {[number, number]} size Sizes for each dimension
	 * @returns {Matrix<number>} Matrix filled with 1
	 */
	/**
	 * @param {number | [number, number]} rows Number of rows or sizes for each dimension
	 * @param {number} [cols] Number of columns
	 * @returns {Matrix<number>} Matrix filled with 1
	 */
	static ones(rows, cols) {
		if (Array.isArray(rows)) {
			;[rows, cols] = rows
		}
		return new Matrix(rows, cols, Array(rows * cols).fill(1))
	}

	/**
	 * Returns a identity matrix.
	 * @overload
	 * @param {number} rows Number of rows
	 * @param {number} cols Number of columns
	 * @param {number} [init] Diagonal values
	 * @returns {Matrix<number>} Identity matrix
	 */
	/**
	 * Returns a identity matrix.
	 * @overload
	 * @param {[number, number]} size Sizes for each dimension
	 * @param {number} [init] Diagonal values
	 * @returns {Matrix<number>} Identity matrix
	 */
	/**
	 * @param {number | [number, number]} rows Number of rows or sizes for each dimension
	 * @param {number} [cols] Number of columns
	 * @param {number} [init] Diagonal values
	 * @returns {Matrix<number>} Identity matrix
	 */
	static eye(rows, cols, init = 1) {
		if (Array.isArray(rows)) {
			init = cols ?? 1
			;[rows, cols] = rows
		}
		const mat = new Matrix(rows, cols)
		const rank = Math.min(rows, cols)
		for (let i = 0; i < rank; i++) {
			mat._value[i * cols + i] = init
		}
		return mat
	}

	/**
	 * Returns a matrix initialized uniform random values.
	 * @overload
	 * @param {number} rows Number of rows
	 * @param {number} cols Number of columns
	 * @param {number} [min] Minimum value of the Matrix (include)
	 * @param {number} [max] Maximum value of the Matrix (exclude)
	 * @returns {Matrix<number>} Matrix initialized uniform random values
	 */
	/**
	 * Returns a matrix initialized uniform random values.
	 * @overload
	 * @param {[number, number]} size Sizes for each dimension
	 * @param {number} [min] Minimum value of the Matrix (include)
	 * @param {number} [max] Maximum value of the Matrix (exclude)
	 * @returns {Matrix<number>} Matrix initialized uniform random values
	 */
	/**
	 * @param {number | [number, number]} rows Number of rows or sizes for each dimension
	 * @param {number} [cols] Number of columns
	 * @param {number} [min] Minimum value of the Matrix (include)
	 * @param {number} [max] Maximum value of the Matrix (exclude)
	 * @returns {Matrix<number>} Matrix initialized uniform random values
	 */
	static random(rows, cols, min, max) {
		if (Array.isArray(rows)) {
			max = min
			min = cols
			;[rows, cols] = rows
		}
		min ??= 0
		max ??= 1
		const mat = new Matrix(rows, cols)
		for (let i = 0; i < mat.length; i++) {
			mat._value[i] = Math.random() * (max - min) + min
		}
		return mat
	}

	/**
	 * Returns a matrix initialized uniform random integer values.
	 * @overload
	 * @param {number} rows Number of rows
	 * @param {number} cols Number of columns
	 * @param {number} [min] Minimum value of the Matrix (include)
	 * @param {number} [max] Maximum value of the Matrix (include)
	 * @returns {Matrix<number>} Matrix initialized uniform random values
	 */
	/**
	 * Returns a matrix initialized uniform random integer values.
	 * @overload
	 * @param {[number, number]} size Sizes for each dimension
	 * @param {number} [min] Minimum value of the Matrix (include)
	 * @param {number} [max] Maximum value of the Matrix (include)
	 * @returns {Matrix<number>} Matrix initialized uniform random values
	 */
	/**
	 * @param {number | [number, number]} rows Number of rows or sizes for each dimension
	 * @param {number} [cols] Number of columns
	 * @param {number} [min] Minimum value of the Matrix (include)
	 * @param {number} [max] Maximum value of the Matrix (include)
	 * @returns {Matrix<number>} Matrix initialized uniform random values
	 */
	static randint(rows, cols, min, max) {
		if (Array.isArray(rows)) {
			max = min
			min = cols
			;[rows, cols] = rows
		}
		min ??= 0
		max ??= 1
		const mat = new Matrix(rows, cols)
		for (let i = 0; i < mat.length; i++) {
			mat._value[i] = Math.floor(Math.random() * (max - min + 1) + min)
		}
		return mat
	}

	/**
	 * Returns a matrix initialized normal random values.
	 * @overload
	 * @param {number} rows Number of rows
	 * @param {number} cols Number of columns
	 * @param {number | number[]} [myu] Mean value(s) of each columns
	 * @param {number | Array<Array<number>>} [sigma] Variance value or covariance matrix of each columns
	 * @returns {Matrix<number>} Matrix initialized normal random values
	 */
	/**
	 * Returns a matrix initialized normal random values.
	 * @overload
	 * @param {[number, number]} rows Sizes for each dimension
	 * @param {number | number[]} [myu] Mean value(s) of each columns
	 * @param {number | Array<Array<number>>} [sigma] Variance value or covariance matrix of each columns
	 * @returns {Matrix<number>} Matrix initialized normal random values
	 */
	/**
	 * @param {number} rows Number of rows or sizes for each dimension
	 * @param {number | number[]} [cols] Number of columns
	 * @param {number | number[] | Array<Array<number>>} [myu] Mean value(s) of each columns
	 * @param {number | Array<Array<number>>} [sigma] Variance value or covariance matrix of each columns
	 * @returns {Matrix<number>} Matrix initialized normal random values
	 */
	static randn(rows, cols, myu, sigma) {
		if (Array.isArray(rows)) {
			sigma = myu
			myu = cols
			;[rows, cols] = rows
		}
		myu ??= 0
		sigma ??= 1
		const mat = new Matrix(rows, cols)
		if (Array.isArray(myu)) {
			myu = new Matrix(1, myu.length, myu)
		}
		if (Array.isArray(sigma)) {
			sigma = Matrix.fromArray(sigma)
		}
		if (!(myu instanceof Matrix) && !(sigma instanceof Matrix)) {
			for (let i = 0; i < mat.length; i += 2) {
				const nr = normal_random(myu, sigma)
				mat._value[i] = nr[0]
				if (i + 1 < mat.length) {
					mat._value[i + 1] = nr[1]
				}
			}
			return mat
		}
		if (!(myu instanceof Matrix)) {
			myu = new Matrix(1, cols, myu)
		} else if (myu.rows === cols || myu.cols === 1) {
			myu = myu.t
		}
		if (myu.cols !== cols || myu.rows !== 1) {
			throw new MatrixException("'myu' cols must be same as 'cols' and rows must be 1.")
		}
		if (!(sigma instanceof Matrix)) {
			sigma = Matrix.eye(cols, cols, sigma)
		} else if (sigma.rows !== cols || sigma.cols !== cols) {
			throw new MatrixException("'sigma' cols and rows must be same as 'cols'.")
		}
		const L = sigma.cholesky()
		for (let i = 0; i < mat.length; i += 2) {
			const nr = normal_random(0, 1)
			mat._value[i] = nr[0]
			if (i + 1 < mat.length) {
				mat._value[i + 1] = nr[1]
			}
		}
		const smat = mat.dot(L.t)
		smat.add(myu)
		return smat
	}

	/**
	 * Returns a diagonal matrix.
	 * @template T
	 * @param {(T | Matrix<T>)[]} d Diagonal values
	 * @returns {Matrix<T>} Diagonal matrix
	 */
	static diag(d) {
		let n = 0
		let m = 0
		for (const v of d) {
			if (typeof v === 'number') {
				n++
				m++
			} else {
				n += v.rows
				m += v.cols
			}
		}
		const mat = new Matrix(n, m)
		for (let k = 0, i = 0, j = 0; i < n; k++) {
			const dk = d[k]
			if (typeof dk === 'number') {
				mat._value[i * m + j] = dk
				i++
				j++
			} else {
				mat.set(i, j, dk)
				i += dk.rows
				j += dk.cols
			}
		}
		return mat
	}

	/**
	 * Returns a matrix from some value.
	 * @template T
	 * @param {Matrix<T> | Array<Array<T>> | Array<T> | T} arr Original values
	 * @returns {Matrix<T>} Matrix from some value
	 */
	static fromArray(arr) {
		if (arr instanceof Matrix) {
			return arr
		} else if (!Array.isArray(arr)) {
			return new Matrix(1, 1, arr)
		} else if (arr.length === 0) {
			return new Matrix(0, 0)
		} else if (!Array.isArray(arr[0])) {
			return new Matrix(arr.length, 1, arr)
		}
		return new Matrix(arr.length, arr[0].length, arr)
	}

	/**
	 * Dimension of the matrix.
	 * @type {number}
	 */
	get dimension() {
		return this._size.length
	}

	/**
	 * Sizes of the matrix.
	 * @type {number[]}
	 */
	get sizes() {
		return this._size
	}

	/**
	 * Number of all elements in the matrix.
	 * @type {number}
	 */
	get length() {
		return this._size[0] * this._size[1]
	}

	/**
	 * Number of rows of the matrix.
	 * @type {number}
	 */
	get rows() {
		return this._size[0]
	}

	/**
	 * Number of columns of the matrix.
	 * @type {number}
	 */
	get cols() {
		return this._size[1]
	}

	/**
	 * Elements in the matrix.
	 * @type {T[]}
	 */
	get value() {
		return this._value
	}

	/**
	 * Transpose matrix.
	 * @type {Matrix<T>}
	 */
	get t() {
		return this.transpose()
	}

	/**
	 * Iterate over the elements.
	 * @yields {T}
	 */
	*[Symbol.iterator]() {
		yield* this._value
	}

	/**
	 * Returns a nested array represented this matrix.
	 * @returns {Array<Array<T>>} Nested array
	 */
	toArray() {
		const arr = []
		const n = this.cols
		for (let i = 0; i < this.length; i += n) {
			arr.push(this._value.slice(i, i + n))
		}
		return arr
	}

	/**
	 * Returns the only element.
	 * @returns {T} The only element
	 */
	toScaler() {
		if (this.rows !== 1 || this.cols !== 1) {
			throw new MatrixException('The matrix cannot convert to scaler.')
		}
		return this._value[0]
	}

	/**
	 * Returns a string represented this matrix.
	 * @returns {string} String represented this matrix
	 */
	toString() {
		let s = '['
		for (let i = 0; i < this.rows; i++) {
			if (i > 0) s += ',\n '
			s += '['
			for (let j = 0; j < this.cols; j++) {
				if (j > 0) s += ', '
				s += this._value[i * this.cols + j]
			}
			s += ']'
		}
		return s + ']'
	}

	_to_position(...i) {
		let p = 0
		for (let d = 0; d < this.dimension; d++) {
			if (i[d] < 0 || this._size[d] <= i[d]) {
				throw new MatrixException('Index out of bounds.')
			}
			p = p * this._size[d] + i[d]
		}
		return p
	}

	_to_index(p) {
		return [Math.floor(p / this._size[1]), p % this._size[1]]
	}

	/**
	 * Returns a copy of this matrix.
	 * @param {Matrix<T>} [dst] Destination matrix
	 * @returns {Matrix<T>} Copied matrix
	 */
	copy(dst) {
		if (dst === this) {
			return this
		} else if (dst) {
			dst._size = [].concat(this._size)
			this._value.forEach((v, i) => (dst._value[i] = v))
			return dst
		}
		return new Matrix(this.rows, this.cols, [].concat(this._value))
	}

	/**
	 * Returns this matrix is equals to the others.
	 * @param {*} other Check tensor
	 * @param {number} [tol] Tolerance to be recognized as the same
	 * @returns {boolean} `true` if equal
	 */
	equals(other, tol = 0) {
		if (other instanceof Matrix) {
			if (this._size[0] !== other._size[0] || this._size[1] !== other._size[1]) {
				return false
			}
			for (let i = this.length - 1; i >= 0; i--) {
				if (Math.abs(this._value[i] - other._value[i]) > tol) {
					return false
				}
			}
			return true
		}
		return false
	}

	/**
	 * Returns a value at the position.
	 * @overload
	 * @param  {number} r Row index
	 * @param  {number} c Column index
	 * @returns {T} Value at the position
	 */
	/**
	 * Returns a value at the position.
	 * @overload
	 * @param  {[number, number]} index Index values
	 * @returns {T} Value at the position
	 */
	/**
	 * @param  {number | [number, number]} r Row index or index values
	 * @param  {number} [c] Column index
	 * @returns {T} Value at the position
	 */
	at(r, c) {
		if (Array.isArray(r)) {
			;[r, c] = r
		}
		if (r < 0 || this.rows <= r || c < 0 || this.cols <= c) throw new MatrixException('Index out of bounds.')
		return this._value[r * this.cols + c]
	}

	/**
	 * Set a value at the position.
	 * @overload
	 * @param  {number} r Row index
	 * @param  {number} c Column index
	 * @param  {T | Matrix<T>} value The value to be set
	 * @returns {T=} Old value
	 */
	/**
	 * Set a value at the position.
	 * @overload
	 * @param  {[number, number]} r Index values
	 * @param  {T | Matrix<T>} value The value to be set
	 * @returns {T=} Old value
	 */
	/**
	 * @param  {number | [number, number]} r Row index or index values. If this value is an array, the next argument should be the value to be set
	 * @param  {number | T | Matrix<T>} c Column index or the value to be set
	 * @param  {T | Matrix<T>} [value] The value to be set
	 * @returns {T=} Old value
	 */
	set(r, c, value) {
		if (Array.isArray(r)) {
			value = c
			;[r, c] = r
		}
		if (value instanceof Matrix) {
			if (r < 0 || this.rows <= r + value.rows - 1 || c < 0 || this.cols <= c + value.cols - 1) {
				throw new MatrixException('Index out of bounds.')
			}
			for (let i = 0; i < value.rows; i++) {
				for (let j = 0; j < value.cols; j++) {
					this._value[(i + r) * this.cols + j + c] = value._value[i * value.cols + j]
				}
			}
			return null
		} else {
			if (r < 0 || this.rows <= r || c < 0 || this.cols <= c) throw new MatrixException('Index out of bounds.')
			const old = this._value[r * this.cols + c]
			this._value[r * this.cols + c] = value
			return old
		}
	}

	/**
	 * Returns a row matrix at r.
	 * @param {number | number[] | boolean[]} r Indexes of rows, or an array of boolean values where the row to be selected is true.
	 * @returns {Matrix<T>} Row selected matrix
	 */
	row(r) {
		if (Array.isArray(r)) {
			if (typeof r[0] === 'boolean') {
				if (r.length !== this.rows) {
					throw new MatrixException('Length is invalid.')
				}
				const rp = []
				for (let i = 0; i < r.length; i++) {
					if (r[i]) {
						rp.push(i)
					}
				}
				r = rp
			}
			if (r.some(v => v < 0 || this.rows <= v)) {
				throw new MatrixException('Index out of bounds.')
			}
			const mat = new Matrix(r.length, this.cols)
			for (let i = 0; i < r.length; i++) {
				for (let j = 0; j < this.cols; j++) {
					mat._value[i * this.cols + j] = this._value[r[i] * this.cols + j]
				}
			}
			return mat
		} else {
			if (r < 0 || this.rows <= r) throw new MatrixException('Index out of bounds.')
			return new Matrix(1, this.cols, this._value.slice(r * this.cols, (r + 1) * this.cols))
		}
	}

	/**
	 * Returns a col matrix at c.
	 * @param {number | number[] | boolean[]} c Indexes of columns, or an array of boolean values where the column to be selected is true.
	 * @returns {Matrix<T>} Column selected matrix
	 */
	col(c) {
		if (Array.isArray(c)) {
			if (typeof c[0] === 'boolean') {
				if (c.length !== this.cols) {
					throw new MatrixException('Length is invalid.')
				}
				const cp = []
				for (let i = 0; i < c.length; i++) {
					if (c[i]) {
						cp.push(i)
					}
				}
				c = cp
			}
			if (c.some(v => v < 0 || this.cols <= v)) {
				throw new MatrixException('Index out of bounds.')
			}
			const mat = new Matrix(this.rows, c.length)
			for (let i = 0; i < this.rows; i++) {
				for (let j = 0; j < c.length; j++) {
					mat._value[i * c.length + j] = this._value[i * this.cols + c[j]]
				}
			}
			return mat
		} else {
			if (c < 0 || this.cols <= c) throw new MatrixException('Index out of bounds.')
			const mat = new Matrix(this.rows, 1)
			for (let i = 0; i < this.rows; i++) {
				mat._value[i] = this._value[i * this.cols + c]
			}
			return mat
		}
	}

	/**
	 * Returns sliced matrix.
	 * @param {number} from Start index
	 * @param {number} to End index
	 * @param {number} [axis] Axis to be sliced
	 * @returns {Matrix<T>} Sliced matrix
	 */
	slice(from, to, axis = 0) {
		if (typeof from !== 'number') {
			from = 0
		}
		if (typeof to !== 'number') {
			to = this._size[axis]
		}
		if (from < 0 || this._size[axis] < from || to < 0 || this._size[axis] < to) {
			throw new MatrixException('Index out of bounds.')
		} else if (from > to) {
			throw new MatrixException("'to' must be greater than or equals to 'from'.")
		}
		if (axis === 0) {
			const mat = new Matrix(to - from, this.cols)
			mat._value = this._value.slice(from * this.cols, to * this.cols)
			return mat
		} else if (axis === 1) {
			const mat = new Matrix(this.rows, to - from)
			for (let i = 0; i < mat.rows; i++) {
				for (let j = 0; j < mat.cols; j++) {
					mat._value[i * mat.cols + j] = this._value[i * this.cols + j + from]
				}
			}
			return mat
		} else {
			throw new MatrixException('Invalid axis.')
		}
	}

	/**
	 * Returns the sub-matrix corresponding to position.
	 * @param {number} [rows_from] Start row index
	 * @param {number} [cols_from] Start column index
	 * @param {number} [rows_to] End row index(exclusive)
	 * @param {number} [cols_to] End column index(exclusive)
	 * @returns {Matrix<T>} Sub matrix
	 */
	block(rows_from, cols_from, rows_to, cols_to) {
		if (typeof rows_from !== 'number') {
			rows_from = 0
		}
		if (typeof cols_from !== 'number') {
			cols_from = 0
		}
		if (typeof rows_to !== 'number') {
			rows_to = this.rows
		}
		if (typeof cols_to !== 'number') {
			cols_to = this.cols
		}
		if (
			rows_from < 0 ||
			this.rows < rows_from ||
			rows_to < 0 ||
			this.rows < rows_to ||
			cols_from < 0 ||
			this.cols < cols_from ||
			cols_to < 0 ||
			this.cols < cols_to
		) {
			throw new MatrixException('Index out of bounds.')
		} else if (rows_from > rows_to) {
			throw new MatrixException("'rows_to' must be greater than or equals to 'rows_from'.")
		} else if (cols_from > cols_to) {
			throw new MatrixException("'cols_to' must be greater than or equals to 'cols_from'.")
		}
		const mat = new Matrix(rows_to - rows_from, cols_to - cols_from)
		for (let i = 0; i < mat.rows; i++) {
			for (let j = 0; j < mat.cols; j++) {
				mat._value[i * mat.cols + j] = this._value[(i + rows_from) * this.cols + j + cols_from]
			}
		}
		return mat
	}

	/**
	 * Remove specified indexes.
	 * @param {number | number[]} idx Remove index
	 * @param {number<T>} [axis] Axis to be removed
	 */
	remove(idx, axis = 0) {
		if (axis === 0) {
			if (Array.isArray(idx)) {
				if (idx.some(v => v < 0 || this.rows <= v)) {
					throw new MatrixException('Index out of bounds.')
				}
				idx = [...new Set(idx)]
				idx.sort((a, b) => b - a)
				for (let i = 0; i < idx.length; i++) {
					this._value.splice(idx[i] * this.cols, this.cols)
				}
				this._size[0] -= idx.length
			} else {
				if (idx < 0 || this.rows <= idx) throw new MatrixException('Index out of bounds.')
				this._value.splice(idx * this.cols, this.cols)
				this._size[0]--
			}
		} else if (axis === 1) {
			if (Array.isArray(idx)) {
				if (idx.some(v => v < 0 || this.cols <= v)) {
					throw new MatrixException('Index out of bounds.')
				}
				idx = [...new Set(idx)]
				idx.sort((a, b) => a - b)
				let si = 0,
					di = 0
				for (let i = 0; i < this.rows; i++) {
					for (let j = 0, p = 0; j < this.cols; j++, si++) {
						if (idx[p] === j) {
							p++
							continue
						}
						this._value[di++] = this._value[si]
					}
				}
				this._size[1] -= idx.length
				this._value.length = this.length
			} else {
				if (idx < 0 || this.cols <= idx) throw new MatrixException('Index out of bounds.')
				let si = 0,
					di = 0
				for (let i = 0; i < this.rows; i++) {
					for (let j = 0; j < this.cols; j++, si++) {
						if (idx === j) {
							continue
						}
						this._value[di++] = this._value[si]
					}
				}
				this._size[1]--
				this._value.length = this.length
			}
		} else {
			throw new MatrixException('Invalid axis.')
		}
	}

	/**
	 * Remove specified indexes.
	 * @param {function (Matrix<T>): boolean} cond Remove condition function. Remove if it returns `true`
	 * @param {number<T>} [axis] Axis to be removed
	 */
	removeIf(cond, axis = 0) {
		const idx = []
		if (axis === 0) {
			for (let i = 0; i < this.rows; i++) {
				if (cond(this.row(i))) {
					idx.push(i)
				}
			}
		} else if (axis === 1) {
			for (let i = 0; i < this.cols; i++) {
				if (cond(this.col(i))) {
					idx.push(i)
				}
			}
		} else {
			throw new MatrixException('Invalid axis.')
		}
		this.remove(idx, axis)
	}

	/**
	 * Returns a matrix that sampled along the axis.
	 * @param {number} n Sampled size
	 * @param {number} [axis] Axis to be sampled
	 * @param {boolean} [duplicate] Allow duplicate index or not
	 * @returns {[Matrix<T>, number[]]} Sampled matrix and its original indexes
	 */
	sample(n, axis = 0, duplicate = false) {
		const k = this.sizes[axis]
		const idx = []
		if (duplicate) {
			for (let i = 0; i < n; i++) {
				idx.push(Math.floor(Math.random() * k))
			}
		} else {
			if (n > k) {
				throw new MatrixException('Invalid sampled size.')
			}
			for (let i = 0; i < n; i++) {
				idx.push(Math.floor(Math.random() * (k - i)))
			}
			for (let i = n - 1; i >= 0; i--) {
				for (let j = n - 1; j > i; j--) {
					if (idx[i] <= idx[j]) {
						idx[j]++
					}
				}
			}
		}
		if (axis === 0) {
			return [this.row(idx), idx]
		} else if (axis === 1) {
			return [this.col(idx), idx]
		} else {
			throw new MatrixException('Invalid axis.')
		}
	}

	/**
	 * Fill in all the elements with the value.
	 * @param {T} value Filled value
	 */
	fill(value) {
		this._value.fill(value)
	}

	/**
	 * Iterate over all the elements and replace the value.
	 * @param {function (T, number[], Matrix<T>): T} cb Mapping function
	 */
	map(cb) {
		for (let i = 0, p = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++, p++) {
				this._value[p] = cb(this._value[p], [i, j], this)
			}
		}
	}

	/**
	 * Returns a matrix that replace all the elements.
	 * @template T,U
	 * @param {Matrix<T>} mat Original matrix
	 * @param {function (T, number[], Matrix<T>): U} cb Mapping function
	 * @returns {Matrix<U>} Mapped matrix
	 */
	static map(mat, cb) {
		const map = new Matrix(mat.rows, mat.cols)
		for (let i = 0, p = 0; i < mat._size[0]; i++) {
			for (let j = 0; j < mat._size[1]; j++, p++) {
				map._value[p] = cb(mat._value[p], [i, j], mat)
			}
		}
		return map
	}

	/**
	 * Iterate over all the elements.
	 * @param {function (T, number[], Matrix<T>): *} cb Callback function
	 */
	forEach(cb) {
		for (let i = 0, p = 0; i < this._size[0]; i++) {
			for (let j = 0; j < this._size[1]; j++, p++) {
				cb(this._value[p], [i, j], this)
			}
		}
	}

	/**
	 * Returns transpose matrix.
	 * @returns {Matrix<T>} Transposed matrix
	 */
	transpose() {
		const mat = new Matrix(this.cols, this.rows)
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				mat._value[j * this.rows + i] = this._value[i * this.cols + j]
			}
		}
		return mat
	}

	/**
	 * Returns adjoint matrix.
	 * @returns {Matrix<T>} Adjoint matrix
	 */
	adjoint() {
		return this.transpose()
	}

	/**
	 * Flip values along the axis.
	 * @param {number} [axis] Axis to be flipped
	 */
	flip(axis = 0) {
		if (axis === 0) {
			for (let i = 0; i < this.rows / 2; i++) {
				const t = (this.rows - i - 1) * this.cols
				for (let j = 0; j < this.cols; j++) {
					const tmp = this._value[i * this.cols + j]
					this._value[i * this.cols + j] = this._value[t + j]
					this._value[t + j] = tmp
				}
			}
		} else if (axis === 1) {
			for (let j = 0; j < this.cols / 2; j++) {
				const t = this.cols - j - 1
				for (let i = 0; i < this.rows; i++) {
					const tmp = this._value[i * this.cols + j]
					this._value[i * this.cols + j] = this._value[i * this.cols + t]
					this._value[i * this.cols + t] = tmp
				}
			}
		} else {
			throw new MatrixException('Invalid axis.')
		}
	}

	/**
	 * Swap the index a and b along the axis.
	 * @param {number} a First index
	 * @param {number} b Second index
	 * @param {number} [axis] Axis to be swapped
	 */
	swap(a, b, axis = 0) {
		if (axis === 0) {
			if (a < 0 || b < 0 || this.rows <= a || this.rows <= b) throw new MatrixException('Index out of bounds.')
			const diff = (b - a) * this.cols
			for (let j = a * this.cols; j < (a + 1) * this.cols; j++) {
				;[this._value[j], this._value[j + diff]] = [this._value[j + diff], this._value[j]]
			}
		} else if (axis === 1) {
			if (a < 0 || b < 0 || this.cols <= a || this.cols <= b) throw new MatrixException('Index out of bounds.')
			const diff = b - a
			for (let j = a; j < this.length; j += this.cols) {
				;[this._value[j], this._value[j + diff]] = [this._value[j + diff], this._value[j]]
			}
		} else {
			throw new MatrixException('Invalid axis.')
		}
	}

	/**
	 * Sort values along the axis.
	 * @param {number} [axis] Axis to be sorted
	 * @returns {number[]} Original index.
	 */
	sort(axis = 0) {
		if (axis === 0) {
			const p = Array.from({ length: this.rows }, (_, i) => i)
			p.sort((a, b) => {
				const ac = a * this.cols
				const bc = b * this.cols
				for (let i = 0; i < this.cols; i++) {
					const ai = this._value[ac + i]
					const bi = this._value[bc + i]
					const d = ai - bi
					if (d !== 0) return d
				}
				return 0
			})
			this._value = this.row(p)._value
			return p
		} else if (axis === 1) {
			const p = Array.from({ length: this.cols }, (_, i) => i)
			p.sort((a, b) => {
				for (let i = 0; i < this.rows; i++) {
					const ai = this._value[a + i * this.cols]
					const bi = this._value[b + i * this.cols]
					const d = ai - bi
					if (d !== 0) return d
				}
				return 0
			})
			this._value = this.col(p)._value
			return p
		}
		throw new MatrixException('Invalid axis.')
	}

	/**
	 * Shuffle values along the axis.
	 * @param {number} [axis] Axis to be shuffled
	 * @returns {number[]} Original index.
	 */
	shuffle(axis = 0) {
		const idx = Array.from({ length: this._size[axis] }, (_, i) => i)
		for (let i = idx.length - 1; i > 0; i--) {
			const r = Math.floor(Math.random() * (i + 1))
			;[idx[i], idx[r]] = [idx[r], idx[i]]
		}

		if (axis === 0) {
			this._value = this.row(idx)._value
		} else if (axis === 1) {
			this._value = this.col(idx)._value
		} else {
			throw new MatrixException('Invalid axis.')
		}
		return idx
	}

	/**
	 * Make it unique in the specified axis.
	 * @param {number} [axis] Axis to be uniqued
	 * @param {number} [tol] Tolerance to be recognized as the same
	 * @returns {number[]} Selected indexes
	 */
	unique(axis = 0, tol = 0) {
		const idx = []
		if (axis === 0) {
			let r = 0
			for (let i = 0; i < this.rows; i++) {
				let same_k = -1
				for (let k = 0; k < i; k++) {
					let issame = true
					for (let j = 0; issame && j < this.cols; j++) {
						if (Math.abs(this._value[i * this.cols + j] - this._value[k * this.cols + j]) > tol) {
							issame = false
						}
					}
					if (issame) {
						same_k = k
						break
					}
				}
				if (same_k < 0) {
					for (let j = 0; j < this.cols; j++) {
						this._value[r * this.cols + j] = this._value[i * this.cols + j]
					}
					idx.push(i)
					r++
				}
			}
			this._size[0] = r
			this._value.length = this.length
		} else if (axis === 1) {
			for (let j = 0; j < this.cols; j++) {
				let hasSame = false
				for (let k = 0; !hasSame && k < idx.length; k++) {
					hasSame = true
					for (let i = 0; hasSame && i < this.rows; i++) {
						if (Math.abs(this._value[i * this.cols + j] - this._value[i * this.cols + idx[k]]) > tol) {
							hasSame = false
						}
					}
				}
				if (!hasSame) {
					idx.push(j)
				}
			}
			for (let i = 0, p = 0; i < this.rows; i++) {
				for (let j = 0; j < idx.length; j++, p++) {
					this._value[p] = this._value[i * this.cols + idx[j]]
				}
			}
			this._size[1] = idx.length
			this._value.length = this.length
		} else {
			throw new MatrixException('Invalid axis.')
		}
		return idx
	}

	/**
	 * Resize this matrix.
	 * @overload
	 * @param {number} rows New row size
	 * @param {number} cols New column size
	 * @param {T} [init] Value of the extended region
	 */
	/**
	 * Resize this matrix.
	 * @overload
	 * @param {[number, number]} size New sizes for each dimension
	 * @param {T} [init] Value of the extended region
	 */
	/**
	 * @param {number | [number, number]} rows New row size or sizes for each dimension
	 * @param {number | T} [cols] New column size
	 * @param {T} [init] Value of the extended region
	 */
	resize(rows, cols, init = 0) {
		if (Array.isArray(rows)) {
			init = cols ?? 0
			;[rows, cols] = rows
		}
		const newValue = Array(rows * cols).fill(init)
		const mr = Math.min(this.rows, rows)
		const mc = Math.min(this.cols, cols)
		for (let i = 0; i < mr; i++) {
			for (let j = 0; j < mc; j++) {
				newValue[i * cols + j] = this._value[i * this.cols + j]
			}
		}
		this._value = newValue
		this._size = [rows, cols]
	}

	/**
	 * Return resized matrix.
	 * @template T
	 * @overload
	 * @param {Matrix<T>} mat Original matrix
	 * @param {number} rows New row size
	 * @param {number} cols New column size
	 * @param {T} [init] Value of the extended region
	 * @returns {Matrix<T>} Resized matrix
	 */
	/**
	 * Return resized matrix.
	 * @template T
	 * @overload
	 * @param {Matrix<T>} mat Original matrix
	 * @param {[number, number]} rows New sizes for each dimension
	 * @param {T} [init] Value of the extended region
	 * @returns {Matrix<T>} Resized matrix
	 */
	/**
	 * @template T
	 * @param {Matrix<T>} mat Original matrix
	 * @param {number | [number, number]} rows New row size or sizes for each dimension
	 * @param {number | T} [cols] New column size
	 * @param {T} [init] Value of the extended region
	 * @returns {Matrix<T>} Resized matrix
	 */
	static resize(mat, rows, cols, init = 0) {
		if (Array.isArray(rows)) {
			init = cols ?? 0
			;[rows, cols] = rows
		}
		const r = new Matrix(rows, cols)
		r.fill(init)
		const mr = Math.min(mat.rows, rows)
		const mc = Math.min(mat.cols, cols)
		for (let i = 0; i < mr; i++) {
			for (let j = 0; j < mc; j++) {
				r._value[i * cols + j] = mat._value[i * mat.cols + j]
			}
		}
		return r
	}

	/**
	 * Reshape this.
	 * @overload
	 * @param {number} rows New row size
	 * @param {number} cols New column size
	 */
	/**
	 * Reshape this.
	 * @overload
	 * @param {[number, number]} sizes New sizes for each dimension
	 */
	/**
	 * @param {number | [number, number]} rows New row size
	 * @param {number} [cols] New column size
	 */
	reshape(rows, cols) {
		if (Array.isArray(rows)) {
			;[rows, cols] = rows
		}
		if (rows === -1) {
			if (this.length % cols !== 0) {
				throw new MatrixException('Length is different.')
			}
			rows = this.length / cols
		} else if (cols === -1) {
			if (this.length % rows !== 0) {
				throw new MatrixException('Length is different.')
			}
			cols = this.length / rows
		} else if (this.length !== rows * cols) throw new MatrixException('Length is different.')
		this._size = [rows, cols]
	}

	/**
	 * Repeat the elements n times along the axis this.
	 * @overload
	 * @param {number} n Repeated count
	 * @param {number} [axis] Axis to be repeated
	 * @returns {void} No return
	 */
	/**
	 * Repeat the elements n times along the axis this.
	 * @overload
	 * @param {number[]} n Repeated counts for each axis
	 * @returns {void} No return
	 */
	/**
	 * @param {number | number[]} n Repeated count(s)
	 * @param {number} [axis] Axis to be repeated
	 */
	repeat(n, axis = 0) {
		if (!Array.isArray(n)) {
			const an = Array(this._size.length).fill(1)
			an[axis] = n
			n = an
		} else if (n.length < this._size.length) {
			for (let i = n.length; i < this._size.length; i++) {
				n[i] = 1
			}
		}
		const p = n.reduce((s, v) => s * v, 1)
		if (p === 1) {
			return
		}
		const new_value = Array(this.length * p)
		const new_size = this._size.map((s, i) => s * n[i])
		for (let i = 0; i < new_size[0]; i++) {
			for (let j = 0; j < new_size[1]; j++) {
				new_value[i * new_size[1] + j] = this._value[(i % this.rows) * this.cols + (j % this.cols)]
			}
		}
		this._value = new_value
		this._size = new_size
	}

	/**
	 * Returns a matrix that repeat the elements n times along the axis.
	 * @template T
	 * @overload
	 * @param {Matrix<T>} mat Original matrix
	 * @param {number} n Repeated count
	 * @param {number} [axis] Axis to be repeated
	 * @returns {Matrix<T>} Repeated matrix
	 */
	/**
	 * Returns a matrix that repeat the elements n times along the axis.
	 * @template T
	 * @overload
	 * @param {Matrix<T>} mat Original matrix
	 * @param {number[]} n Repeated counts for each axis
	 * @returns {Matrix<T>} Repeated matrix
	 */
	/**
	 * @template T
	 * @param {Matrix<T>} mat Original matrix
	 * @param {number | number[]} n Repeated count(s)
	 * @param {number} [axis] Axis to be repeated
	 * @returns {Matrix<T>} Repeated matrix
	 */
	static repeat(mat, n, axis = 0) {
		const r = mat.copy()
		r.repeat(n, axis)
		return r
	}

	/**
	 * Concatenate this and m.
	 * @param {Matrix<T>} m Concatenate matrix
	 * @param {number} [axis] Axis to be concatenated
	 */
	concat(m, axis = 0) {
		if (axis === 0) {
			if (this.cols !== m.cols) throw new MatrixException('Size is different.')
			this._value = [].concat(this._value, m._value)
			this._size[0] += m.rows
		} else if (axis === 1) {
			if (this.rows !== m.rows) throw new MatrixException('Size is different.')
			const orgCol = this.cols
			this.resize(this.rows, this.cols + m.cols)
			for (let i = 0; i < this.rows; i++) {
				for (let j = 0; j < m.cols; j++) {
					this._value[i * this.cols + j + orgCol] = m._value[i * m.cols + j]
				}
			}
		} else {
			throw new MatrixException('Invalid axis.')
		}
	}

	/**
	 * Returns a matrix concatenated this and m.
	 * @template T,U
	 * @param {Matrix<T>} a Original matrix
	 * @param {Matrix<U>} b Concatenate matrix
	 * @param {number} [axis] Axis to be concatenated
	 * @returns {Matrix<T | U>} Concatenated matrix
	 */
	static concat(a, b, axis = 0) {
		const r = a.copy()
		r.concat(b, axis)
		return r
	}

	/**
	 * Returns a matrix reduced along all element with the callback function.
	 * @overload
	 * @param {function (T, T, number[], Matrix<T>): T} cb Reducing function
	 * @param {undefined | null} [init] Initial value
	 * @returns {T} Reduced value
	 */
	/**
	 * Returns a matrix reduced along all element with the callback function.
	 * @template U
	 * @overload
	 * @param {function (U, T, number[], Matrix<T>): U} cb Reducing function
	 * @param {U} init Initial value
	 * @returns {U} Reduced value
	 */
	/**
	 * Returns a matrix reduced along the axis with the callback function.
	 * @template {number | number[]} A
	 * @template {boolean} F
	 * @overload
	 * @param {function (T, T, number[], Matrix<T>): T} cb Reducing function
	 * @param {undefined | null} init Initial value
	 * @param {A} axis Axis to be reduced
	 * @param {F} [keepdims] Keep dimensions or not. If null, negative axis retuns number and other axis returns Matrix.
	 * @returns {Matrix<T> | (A extends 0 | 1 ? never : F extends true ? never : T)} Reduced matrix
	 */
	/**
	 * Returns a matrix reduced along the axis with the callback function.
	 * @template U
	 * @template {number | number[]} A
	 * @template {boolean} F
	 * @overload
	 * @param {function (U, T, number[], Matrix<T>): U} cb Reducing function
	 * @param {U} init Initial value
	 * @param {A} axis Axis to be reduced
	 * @param {F} [keepdims] Keep dimensions or not. If null, negative axis retuns number and other axis returns Matrix.
	 * @returns {Matrix<U> | (A extends 0 | 1 ? never : F extends true ? never : U)} Reduced matrix
	 */
	/**
	 * @template U
	 * @param {function (U, T, number[], Matrix<T>): U} cb Reducing function
	 * @param {U} [init] Initial value
	 * @param {number | number[]} [axis] Axis to be reduced. If negative, reduce along all elements.
	 * @param {boolean} [keepdims] Keep dimensions or not. If null, negative axis retuns number and other axis returns Matrix.
	 * @returns {Matrix<U> | U} Reduced matrix or value
	 */
	reduce(cb, init, axis = -1, keepdims = null) {
		if (Array.isArray(axis)) {
			if (axis.includes(-1) || (axis.includes(0) && axis.includes(1))) {
				axis = -1
			} else if (axis.includes(0)) {
				axis = 0
			} else if (axis.includes(1)) {
				axis = 1
			} else {
				throw new MatrixException('Invalid axis.')
			}
		}
		if (axis > 1) {
			throw new MatrixException('Invalid axis.')
		}
		if (axis < 0) {
			let v = init ?? this._value[0]
			for (let i = 0, p = 0; i < this._size[0]; i++) {
				for (let j = 0; j < this._size[1]; j++, p++) {
					if (p === 0 && init == null) {
						continue
					}
					v = cb(v, this._value[p], [i, j], this)
				}
			}
			if (keepdims === true) {
				return new Matrix(1, 1, v)
			}
			return v
		}
		if (keepdims === false) {
			throw new MatrixException('keepdims only accept true if axis >= 0.')
		}
		let v_step = axis === 0 ? 1 : this.cols
		let s_step = axis === 0 ? this.cols : 1
		const new_size = [].concat(this._size)
		new_size[axis] = 1
		const mat = Matrix.zeros(...new_size)
		for (let n = 0, nv = 0; n < mat.length; n++, nv += v_step) {
			let v = init ?? this._value[nv]
			for (let i = v === init ? 0 : 1; i < this._size[axis]; i++) {
				v = cb(v, this._value[i * s_step + nv], axis === 0 ? [i, n] : [n, i], this)
			}
			mat._value[n] = v
		}
		return mat
	}

	/**
	 * Determines whether all the members of a matrix satisfy the specified test.
	 * @overload
	 * @param {function (T, number[], Matrix<T>): boolean} cb Check function
	 * @returns {boolean} Reduced value or matrix
	 */
	/**
	 * Determines whether all the members of a matrix satisfy the specified test.
	 * @overload
	 * @param {function (T, number[], Matrix<T>): boolean} cb Check function
	 * @param {0 | 1} axis Axis to be reduced
	 * @returns {Matrix<boolean>} Reduced value or matrix
	 */
	/**
	 * Determines whether all the members of a matrix satisfy the specified test.
	 * @overload
	 * @param {function (T, number[], Matrix<T>): boolean} cb Check function
	 * @param {number} axis Axis to be reduced
	 * @returns {boolean | Matrix<boolean>} Reduced value or matrix
	 */
	/**
	 * @param {function (T, number[], Matrix<T>): boolean} cb Check function
	 * @param {number} [axis] Axis to be reduced
	 * @returns {boolean | Matrix<boolean>} Reduced value or matrix
	 */
	every(cb, axis = -1) {
		return this.reduce((f, v, i, m) => f && cb(v, i, m), true, axis)
	}

	/**
	 * Determines whether the specified callback function returns true for any element of a matrix.
	 * @overload
	 * @param {function (T, number[], Matrix<T>): boolean} cb Check function
	 * @returns {boolean} Reduced value or matrix
	 */
	/**
	 * Determines whether the specified callback function returns true for any element of a matrix.
	 * @overload
	 * @param {function (T, number[], Matrix<T>): boolean} cb Check function
	 * @param {0 | 1} axis Axis to be reduced
	 * @returns {Matrix<boolean>} Reduced value or matrix
	 */
	/**
	 * Determines whether the specified callback function returns true for any element of a matrix.
	 * @overload
	 * @param {function (T, number[], Matrix<T>): boolean} cb Check function
	 * @param {number} axis Axis to be reduced
	 * @returns {boolean | Matrix<boolean>} Reduced value or matrix
	 */
	/**
	 * @param {function (T, number[], Matrix<T>): boolean} cb Check function
	 * @param {number} [axis] Axis to be reduced
	 * @returns {boolean | Matrix<boolean>} Reduced value or matrix
	 */
	some(cb, axis = -1) {
		return this.reduce((f, v, i, m) => f || cb(v, i, m), false, axis)
	}

	/**
	 * Returns maximum value of all element.
	 * @overload
	 * @returns {number} Maximum value
	 */
	/**
	 * Returns maximum values along the axis.
	 * @overload
	 * @param {0 | 1} axis Axis to be reduced
	 * @returns {Matrix<number>} Maximum values
	 */
	/**
	 * Returns maximum values along the axis.
	 * @overload
	 * @param {number} axis Axis to be reduced. If negative, returns the maximum value of the all element.
	 * @returns {Matrix<number> | number} Maximum values
	 */
	/**
	 * @param {number} [axis] Axis to be reduced. If negative, returns the maximum value of the all element.
	 * @returns {Matrix<number> | number} Maximum values
	 */
	max(axis = -1) {
		return this.reduce((m, v) => Math.max(m, v), -Infinity, axis)
	}

	/**
	 * Returns minimum value of all element.
	 * @overload
	 * @returns {number} Minimum value
	 */
	/**
	 * Returns minimum values along the axis.
	 * @overload
	 * @param {0 | 1} axis Axis to be reduced
	 * @returns {Matrix<number>} Minimum values
	 */
	/**
	 * Returns minimum values along the axis.
	 * @overload
	 * @param {number} axis Axis to be reduced. If negative, returns the minimum value of the all element.
	 * @returns {Matrix<number> | number} Minimum values
	 */
	/**
	 * @param {number} [axis] Axis to be reduced. If negative, returns the minimum value of the all element.
	 * @returns {Matrix<number> | number} Minimum values
	 */
	min(axis = -1) {
		return this.reduce((m, v) => Math.min(m, v), Infinity, axis)
	}

	/**
	 * Returns median of all element.
	 * @overload
	 * @returns {number} Median value
	 */
	/**
	 * Returns medians along the axis.
	 * @overload
	 * @param {0 | 1} axis Axis to be reduced
	 * @returns {Matrix<number>} Median values
	 */
	/**
	 * Returns medians along the axis.
	 * @overload
	 * @param {number} axis Axis to be reduced. If negative, returns a median of the all element.
	 * @returns {Matrix<number> | number} Median values
	 */
	/**
	 * @param {number} [axis] Axis to be reduced. If negative, returns a median of the all element.
	 * @returns {Matrix<number> | number} Median values
	 */
	median(axis = -1) {
		if (axis < 0) {
			const v = this._value.concat()
			v.sort((a, b) => a - b)
			if (v.length % 2 === 1) {
				return v[(v.length - 1) / 2]
			} else {
				return (v[v.length / 2] + v[v.length / 2 - 1]) / 2
			}
		}
		let v_step = axis === 0 ? 1 : this.cols
		let s_step = axis === 0 ? this.cols : 1
		const new_size = [].concat(this._size)
		new_size[axis] = 1
		const mat = Matrix.zeros(...new_size)
		for (let n = 0, nv = 0; n < mat.length; n++, nv += v_step) {
			const v = []
			for (let i = 0; i < this._size[axis]; i++) {
				v.push(this._value[i * s_step + nv])
			}
			v.sort((a, b) => a - b)
			if (v.length % 2 === 1) {
				mat._value[n] = v[(v.length - 1) / 2]
			} else {
				mat._value[n] = (v[v.length / 2] + v[v.length / 2 - 1]) / 2
			}
		}
		return mat
	}

	/**
	 * Returns quantile value of all element.
	 * @overload
	 * @param {number} q Partition rate
	 * @returns {number} Quantile value
	 */
	/**
	 * Returns quantile values along the axis.
	 * @overload
	 * @param {number} q Partition rate
	 * @param {0 | 1} axis Axis to be reduced
	 * @returns {Matrix<number>} Quantile values
	 */
	/**
	 * Returns quantile values along the axis.
	 * @overload
	 * @param {number} q Partition rate
	 * @param {number} axis Axis to be reduced. If negative, returns the quantile value of the all element.
	 * @returns {Matrix<number> | number} Quantile values
	 */
	/**
	 * @param {number} q Partition rate
	 * @param {number} [axis] Axis to be reduced. If negative, returns the quantile value of the all element.
	 * @returns {Matrix<number> | number} Quantile values
	 */
	quantile(q, axis = -1) {
		if (q === 0) {
			return this.min(axis)
		} else if (q === 1) {
			return this.max(axis)
		}
		const quantile = (value, q) => {
			value.sort((a, b) => a - b)
			if (value.length === 1) {
				return value[0]
			}
			const q1 = q * (value.length - 1)
			const q0 = Math.floor(q1)
			if (q1 === q0) {
				return value[q0]
			}
			return value[q0] * (1 - q1 + q0) + value[q0 + 1] * (q1 - q0)
		}
		if (axis < 0) {
			const value = this._value.concat()
			return quantile(value, q)
		}

		const v_step = axis === 0 ? 1 : this.cols
		const s_step = axis === 0 ? this.cols : 1
		const mat = Matrix.zeros(...this._size.map((v, i) => (i === axis ? 1 : v)))
		for (let n = 0, nv = 0; n < mat.length; n++, nv += v_step) {
			const v = []
			for (let i = 0; i < this._size[axis]; i++) {
				v.push(this._value[i * s_step + nv])
			}
			mat._value[n] = quantile(v, q)
		}
		return mat
	}

	/**
	 * Returns maximum indexes along the axis.
	 * @param {number} axis Axis to be reduced
	 * @returns {Matrix<number>} Argmax values
	 */
	argmax(axis) {
		let v_step = axis === 0 ? 1 : this.cols
		let s_step = axis === 0 ? this.cols : 1
		const new_size = [].concat(this._size)
		new_size[axis] = 1
		const mat = Matrix.zeros(...new_size)
		for (let n = 0, nv = 0; n < mat.length; n++, nv += v_step) {
			let v = this._value[nv]
			let idx = 0
			for (let i = 1; i < this._size[axis]; i++) {
				let tmp = this._value[i * s_step + nv]
				if (tmp > v) {
					v = tmp
					idx = i
				}
			}
			mat._value[n] = idx
		}
		return mat
	}

	/**
	 * Returns minimum indexes along the axis.
	 * @param {number} axis Axis to be reduced
	 * @returns {Matrix<number>} Argmin values
	 */
	argmin(axis) {
		let v_step = axis === 0 ? 1 : this.cols
		let s_step = axis === 0 ? this.cols : 1
		const new_size = [].concat(this._size)
		new_size[axis] = 1
		const mat = Matrix.zeros(...new_size)
		for (let n = 0, nv = 0; n < mat.length; n++, nv += v_step) {
			let v = this._value[nv]
			let idx = 0
			for (let i = 1; i < this._size[axis]; i++) {
				let tmp = this._value[i * s_step + nv]
				if (tmp < v) {
					v = tmp
					idx = i
				}
			}
			mat._value[n] = idx
		}
		return mat
	}

	/**
	 * Returns summation value of all element.
	 * @overload
	 * @returns {number} Summation value
	 */
	/**
	 * Returns summation values along the axis.
	 * @overload
	 * @param {0 | 1} axis Axis to be reduced
	 * @returns {Matrix<number>} Summation values
	 */
	/**
	 * Returns summation values along the axis.
	 * @overload
	 * @param {number} axis Axis to be reduced. If negative, returns a summation value of the all element.
	 * @returns {Matrix<number> | number} Summation values
	 */
	/**
	 * @param {number} [axis] Axis to be reduced. If negative, returns a summation value of the all element.
	 * @returns {Matrix<number> | number} Summation values
	 */
	sum(axis = -1) {
		return this.reduce((s, v) => s + v, 0, axis)
	}

	/**
	 * Returns mean of all element.
	 * @overload
	 * @returns {number} Mean value
	 */
	/**
	 * Returns means along the axis.
	 * @overload
	 * @param {0 | 1} axis Axis to be reduced
	 * @returns {Matrix<number>} Mean values
	 */
	/**
	 * Returns means along the axis.
	 * @overload
	 * @param {number} axis Axis to be reduced. If negative, returns a mean value of the all element.
	 * @returns {Matrix<number> | number} Mean values
	 */
	/**
	 * @param {number} [axis] Axis to be reduced. If negative, returns a mean value of the all element.
	 * @returns {Matrix<number> | number} Mean values
	 */
	mean(axis = -1) {
		if (axis < 0) {
			return this.sum(axis) / this.length
		}
		let m = this.sum(axis)
		m.div(this._size[axis])
		return m
	}

	/**
	 * Returns producted value of all element.
	 * @overload
	 * @returns {number} Producted value
	 */
	/**
	 * Returns producted values along the axis.
	 * @overload
	 * @param {0 | 1} axis Axis to be reduced
	 * @returns {Matrix<number>} Producted values
	 */
	/**
	 * Returns producted values along the axis.
	 * @overload
	 * @param {number} axis Axis to be reduced. If negative, returns a producted value of the all element.
	 * @returns {Matrix<number> | number} Producted values
	 */
	/**
	 * @param {number} [axis] Axis to be reduced. If negative, returns a producted value of the all element.
	 * @returns {Matrix<number> | number} Producted values
	 */
	prod(axis = -1) {
		return this.reduce((s, v) => s * v, 1, axis)
	}

	/**
	 * Returns variance of all element.
	 * @overload
	 * @returns {number} Variance value
	 */
	/**
	 * Returns variances along the axis.
	 * @overload
	 * @param {0 | 1} axis Axis to be reduced.
	 * @param {number} [ddof] Delta Degrees of Freedom
	 * @returns {Matrix<number>} Variance values
	 */
	/**
	 * Returns variances along the axis.
	 * @overload
	 * @param {number} axis Axis to be reduced. If negative, returns a variance of the all element.
	 * @param {number} [ddof] Delta Degrees of Freedom
	 * @returns {Matrix<number> | number} Variance values
	 */
	/**
	 * @param {number} [axis] Axis to be reduced. If negative, returns a variance of the all element.
	 * @param {number} [ddof] Delta Degrees of Freedom
	 * @returns {Matrix<number> | number} Variance values
	 */
	variance(axis = -1, ddof = 0) {
		const m = this.mean(axis)
		if (axis < 0) {
			return this._value.reduce((acc, v) => acc + (v - m) ** 2, 0) / (this.length - ddof)
		}
		let v_step = axis === 0 ? 1 : this.cols
		let s_step = axis === 0 ? this.cols : 1
		const new_size = [].concat(this._size)
		new_size[axis] = 1
		const mat = Matrix.zeros(...new_size)
		for (let n = 0, nv = 0; n < mat.length; n++, nv += v_step) {
			let v = 0
			for (let i = 0; i < this._size[axis]; i++) {
				v += (this._value[i * s_step + nv] - m._value[n]) ** 2
			}
			mat._value[n] = v / (this._size[axis] - ddof)
		}
		return mat
	}

	/**
	 * Returns standard deviation of all element.
	 * @overload
	 * @returns {number} Standard deviation value
	 */
	/**
	 * Returns standard deviations along the axis.
	 * @overload
	 * @param {0 | 1} axis Axis to be reduced
	 * @param {number} [ddof] Delta Degrees of Freedom
	 * @returns {Matrix<number>} Standard deviation values
	 */
	/**
	 * Returns standard deviations along the axis.
	 * @overload
	 * @param {number} axis Axis to be reduced. If negative, returns a standard deviation of the all element.
	 * @param {number} [ddof] Delta Degrees of Freedom
	 * @returns {Matrix<number> | number} Standard deviation values
	 */
	/**
	 * @param {number} [axis] Axis to be reduced. If negative, returns a standard deviation of the all element.
	 * @param {number} [ddof] Delta Degrees of Freedom
	 * @returns {Matrix<number> | number} Standard deviation values
	 */
	std(axis = -1, ddof = 0) {
		if (axis < 0) {
			return Math.sqrt(this.variance(axis, ddof))
		}
		let m = this.variance(axis, ddof)
		for (let i = 0; i < m.length; i++) {
			m._value[i] = Math.sqrt(m._value[i])
		}
		return m
	}

	/**
	 * Returns if this is square matrix or not.
	 * @returns {boolean} `true` if this is square matrix
	 */
	isSquare() {
		return this.rows === this.cols
	}

	/**
	 * Returns if this is diagonal matrix or not.
	 * @param {number} [tol] Tolerance to be recognized as 0
	 * @returns {boolean} `true` if this is diagonal matrix
	 */
	isDiag(tol = 0) {
		const c = this.cols
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < c; j++) {
				if (i !== j && Math.abs(this._value[i * c + j]) > tol) return false
			}
		}
		return true
	}

	/**
	 * Returns if this is identity matrix or not.
	 * @param {number} [tol] Tolerance to be recognized as 0 or 1
	 * @returns {boolean} `true` if this is identity matrix
	 */
	isIdentity(tol = 0) {
		if (!this.isSquare()) return false
		const c = this.cols
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < c; j++) {
				if (i !== j) {
					if (Math.abs(this._value[i * c + j]) > tol) return false
				} else {
					if (Math.abs(this._value[i * c + j] - 1) > tol) return false
				}
			}
		}
		return true
	}

	/**
	 * Returns if this is zero matrix or not.
	 * @param {number} [tol] Tolerance to be recognized as 0
	 * @returns {boolean} `true` if this is zero matrix
	 */
	isZero(tol = 0) {
		const len = this.length
		for (let i = 0; i < len; i++) {
			if (Math.abs(this._value[i]) > tol) return false
		}
		return true
	}

	/**
	 * Returns if this is triangular matrix or not.
	 * @param {number} [tol] Tolerance to be recognized as 0
	 * @returns {boolean} `true` if this is triangular matrix
	 */
	isTriangular(tol = 0) {
		return this.isLowerTriangular(tol) || this.isUpperTriangular(tol)
	}

	/**
	 * Returns if this is lower triangular matrix or not.
	 * @param {number} [tol] Tolerance to be recognized as 0
	 * @returns {boolean} `true` if this is lower triangular matrix
	 */
	isLowerTriangular(tol = 0) {
		const c = this.cols
		for (let i = 0; i < this.rows; i++) {
			for (let j = i + 1; j < c; j++) {
				if (Math.abs(this._value[i * c + j]) > tol) return false
			}
		}
		return true
	}

	/**
	 * Returns if this is upper triangular matrix or not.
	 * @param {number} [tol] Tolerance to be recognized as 0
	 * @returns {boolean} `true` if this is upper triangular matrix
	 */
	isUpperTriangular(tol = 0) {
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < Math.min(i, this.cols); j++) {
				if (Math.abs(this._value[i * this.cols + j]) > tol) return false
			}
		}
		return true
	}

	/**
	 * Returns if this is symmetric matrix or not.
	 * @param {number} [tol] Tolerance to be recognized as the same
	 * @returns {boolean} `true` if this is symmetric matrix
	 */
	isSymmetric(tol = 0) {
		if (!this.isSquare()) return false
		const c = this.cols
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < i; j++) {
				if (tol > 0) {
					if (Math.abs(this._value[i * c + j] - this._value[j * c + i]) > tol) return false
				} else if (this._value[i * c + j] !== this._value[j * c + i]) return false
			}
		}
		return true
	}

	/**
	 * Returns if this is hermitian matrix or not.
	 * @param {number} [tol] Tolerance to be recognized as the same
	 * @returns {boolean} `true` if this is hermitian matrix
	 */
	isHermitian(tol = 0) {
		return this.isSymmetric(tol)
	}

	/**
	 * Returns if this is alternating matrix or not.
	 * @param {number} [tol] Tolerance within which sign-reversed values are recognized as the same
	 * @returns {boolean} `true` if this is alternating matrix
	 */
	isAlternating(tol = 0) {
		if (!this.isSquare()) return false
		const c = this.cols
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < i; j++) {
				if (tol > 0) {
					if (Math.abs(this._value[i * c + j] + this._value[j * c + i]) > tol) return false
				} else if (this._value[i * c + j] !== -this._value[j * c + i]) return false
			}
		}
		return true
	}

	/**
	 * Returns if this is skew-hermitian matrix or not.
	 * @param {number} [tol] Tolerance within which sign-reversed values are recognized as the same
	 * @returns {boolean} `true` if this is skew-hermitian matrix
	 */
	isSkewHermitian(tol = 0) {
		return this.isAlternating(tol)
	}

	/**
	 * Returns if this is regular matrix or not.
	 * @param {number} [tol] Tolerance to recognize the determinant as 0
	 * @returns {boolean} `true` if this is regular matrix
	 */
	isRegular(tol = 0) {
		if (!this.isSquare()) return false
		return Math.abs(this.det()) <= tol
	}

	/**
	 * Returns if this is normal matrix or not.
	 * @param {number} [tol] Tolerance to be recognized as the same
	 * @returns {boolean} `true` if this is normal matrix
	 */
	isNormal(tol = 0) {
		return this.dot(this.t).equals(this.tDot(this), tol)
	}

	/**
	 * Returns if this is orthogonal matrix or not.
	 * @param {number} [tol] Tolerance to be recognized as 0 or 1
	 * @returns {boolean} `true` if this is orthogonal matrix
	 */
	isOrthogonal(tol = 0) {
		const mat = this.tDot(this)
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				const v = mat._value[i * this.cols + j]
				if (i === j) {
					if (Math.abs(v - 1) > tol) return false
				} else {
					if (Math.abs(v) > tol) return false
				}
			}
		}
		return true
	}

	/**
	 * Returns if this is unitary matrix or not.
	 * @param {number} [tol] Tolerance to be recognized as 0 or 1
	 * @returns {boolean} `true` if this is unitary matrix
	 */
	isUnitary(tol = 0) {
		return this.isOrthogonal(tol)
	}

	/**
	 * Returns if this is nilpotent matrix or not.
	 * @param {number} [tol] Tolerance to be recognized as 0
	 * @returns {boolean} `true` if this is nilpotent matrix
	 */
	isNilpotent(tol = 0) {
		if (!this.isSquare()) return false
		const ev = this.eigenValues()
		for (let i = 0; i < ev.length; i++) {
			if (isNaN(ev[i]) || Math.abs(ev[i]) > tol) return false
		}
		return true
	}

	/**
	 * Returns diagonal elements.
	 * @returns {T[]} Diagonal values
	 */
	diag() {
		let d = []
		const rank = Math.min(this.rows, this.cols)
		for (let i = 0; i < rank; i++) {
			d.push(this._value[i * this.cols + i])
		}
		return d
	}

	/**
	 * Returns a trace.
	 * @returns {number} Trace value
	 */
	trace() {
		let t = 0
		const rank = Math.min(this.rows, this.cols)
		for (let i = 0; i < rank; i++) {
			t += this._value[i * this.cols + i]
		}
		return t
	}

	/**
	 * Returns a p-norm.
	 * @param {number} [p] p-norm
	 * @returns {number} Entry-wise norm
	 */
	norm(p = 2) {
		return this.normEntrywise(p)
	}

	/**
	 * Returns induced norm.
	 * @param {number} [p] p-norm
	 * @returns {number} Induced norm
	 */
	normInduced(p = 2) {
		if (p === 1) {
			let v = -Infinity
			for (let j = 0; j < this.cols; j++) {
				let vj = 0
				for (let i = 0; i < this.rows; i++) {
					vj += Math.abs(this._value[i * this.cols + j])
				}
				v = Math.max(v, vj)
			}
			return v
		} else if (p === Infinity) {
			let v = -Infinity
			for (let i = 0; i < this.rows; i++) {
				let vi = 0
				for (let j = 0; j < this.cols; j++) {
					vi += Math.abs(this._value[i * this.cols + j])
				}
				v = Math.max(v, vi)
			}
			return v
		} else if (p === 2) {
			return this.normSpectral()
		}
		throw new MatrixException('Not implemented')
	}

	/**
	 * Returns spectral norm.
	 * @returns {number} Spectral norm
	 */
	normSpectral() {
		const sv = this.singularValues()
		return sv[0]
	}

	/**
	 * Returns a entry-wise norm
	 * @param {number} [p] p-norm
	 * @returns {number} Entry-wise norm
	 */
	normEntrywise(p = 2) {
		if (p === Infinity) {
			return this.normMax()
		} else if (p === 2) {
			return this.normFrobenius()
		}
		let n = 0
		for (let i = 0; i < this.length; i++) {
			n += Math.abs(this._value[i]) ** p
		}
		return n ** (1 / p)
	}

	/**
	 * Returns frobenius norm.
	 * @returns {number} Frobenius norm
	 */
	normFrobenius() {
		let n = 0
		for (let i = 0; i < this.length; i++) {
			n += Math.abs(this._value[i]) ** 2
		}
		return Math.sqrt(n)
	}

	/**
	 * Returns max norm.
	 * @returns {number} Max norm
	 */
	normMax() {
		let m = -Infinity
		for (let i = 0; i < this.length; i++) {
			m = Math.max(m, Math.abs(this._value[i]))
		}
		return m
	}

	/**
	 * Returns schatten norm.
	 * @param {number} [p] p-norm
	 * @returns {number} Schatten norm
	 */
	normSchatten(p = 2) {
		if (p === Infinity) {
			return this.normSpectral()
		} else if (p === 1) {
			return this.normNuclear()
		}
		const sv = this.singularValues()
		const n = Math.min(this.rows, this.cols)
		let v = 0
		for (let i = 0; i < n; i++) {
			v += sv[i] ** p
		}
		return v ** (1 / p)
	}

	/**
	 * Returns nuclear norm.
	 * @returns {number} Nuclear norm
	 */
	normNuclear() {
		const sv = this.singularValues()
		const n = Math.min(this.rows, this.cols)
		let v = 0
		for (let i = 0; i < n; i++) {
			v += sv[i]
		}
		return v
	}

	/**
	 * Returns a rank of this matrix.
	 * @param {number} [tol] Tolerance to be recognized as the same
	 * @returns {number} Rank of this matrix
	 */
	rank(tol = 0) {
		const m = this.copy()
		let i = 0
		for (let j = 0; i < m.rows && j < m.cols; j++, i++) {
			if (Math.abs(m._value[i * m.cols + j]) <= tol) {
				for (let k = i + 1; k < m.rows; k++) {
					if (Math.abs(m._value[k * m.cols + j]) > tol) {
						m.swap(i, k, 0)
						break
					}
				}
			}
			if (Math.abs(m._value[i * m.cols + j]) <= tol) {
				i--
				continue
			}
			const a = m._value[i * m.cols + j]
			for (let k = i + 1; k < m.rows; k++) {
				const b = m._value[k * m.cols + j]
				for (let l = j + 1; l < m.cols; l++) {
					m._value[k * m.cols + l] -= (b * m._value[i * m.cols + l]) / a
				}
			}
		}
		return i
	}

	/**
	 * Returns a determinant.
	 * @returns {number} Determinant value
	 */
	det() {
		if (!this.isSquare()) {
			throw new MatrixException('Determine only define square matrix.', this)
		}
		const v = this._value
		switch (this.rows) {
			case 0:
				return 0
			case 1:
				return v[0]
			case 2:
				return v[0] * v[3] - v[1] * v[2]
			case 3:
				return (
					v[0] * v[4] * v[8] +
					v[1] * v[5] * v[6] +
					v[2] * v[3] * v[7] -
					v[0] * v[5] * v[7] -
					v[1] * v[3] * v[8] -
					v[2] * v[4] * v[6]
				)
			case 4:
				return (
					v[0] * v[5] * v[10] * v[15] +
					v[0] * v[6] * v[11] * v[13] +
					v[0] * v[7] * v[9] * v[14] -
					v[0] * v[7] * v[10] * v[13] -
					v[0] * v[6] * v[9] * v[15] -
					v[0] * v[5] * v[11] * v[14] -
					v[1] * v[4] * v[10] * v[15] -
					v[2] * v[4] * v[11] * v[13] -
					v[3] * v[4] * v[9] * v[14] +
					v[3] * v[4] * v[10] * v[13] +
					v[2] * v[4] * v[9] * v[15] +
					v[1] * v[4] * v[11] * v[14] +
					v[1] * v[6] * v[8] * v[15] +
					v[2] * v[7] * v[8] * v[13] +
					v[3] * v[5] * v[8] * v[14] -
					v[3] * v[6] * v[8] * v[13] -
					v[2] * v[5] * v[8] * v[15] -
					v[1] * v[7] * v[8] * v[14] -
					v[1] * v[6] * v[11] * v[12] -
					v[2] * v[7] * v[9] * v[12] -
					v[3] * v[5] * v[10] * v[12] +
					v[3] * v[6] * v[9] * v[12] +
					v[2] * v[5] * v[11] * v[12] +
					v[1] * v[7] * v[10] * v[12]
				)
		}
		const [l, u] = this.lu()
		let d = 1
		for (let i = 0; i < this.rows; i++) {
			const k = i * this.cols + i
			d *= l._value[k] * u._value[k]
		}
		return d
	}

	/**
	 * Returns a spectral radius.
	 * @returns {number} Spectral radius
	 */
	spectralRadius() {
		if (!this.isSquare()) {
			throw new MatrixException('Spectral radius only define square matrix.', this)
		}

		const eigVals = this.eigenValues()
		let r = 0
		for (let i = 0; i < eigVals.length; i++) {
			r = Math.max(r, Math.abs(eigVals[i]))
		}
		return r
	}

	/**
	 * Multiply all elements by -1 in-place.
	 */
	negative() {
		this.map(v => -v)
	}

	/**
	 * Set all elements to their logical NOT values.
	 */
	not() {
		this.map(v => +!v)
	}

	/**
	 * Set all elements to their bitwise NOT values.
	 */
	bitnot() {
		this.map(v => ~v)
	}

	/**
	 * Set all elements to their absolute values.
	 */
	abs() {
		this.map(Math.abs)
	}

	/**
	 * Set all elements to their rounded values.
	 */
	round() {
		this.map(Math.round)
	}

	/**
	 * Set all elements to their floored values.
	 */
	floor() {
		this.map(Math.floor)
	}

	/**
	 * Set all elements to their ceil values.
	 */
	ceil() {
		this.map(Math.ceil)
	}

	/**
	 * Set all elements to their left shift values.
	 * @param {number} n Shift amount
	 */
	leftShift(n) {
		this.map(v => v << n)
	}

	/**
	 * Set all elements to their right shift values.
	 * @param {number} n Shift amount
	 */
	signedRightShift(n) {
		this.map(v => v >> n)
	}

	/**
	 * Set all elements to their unsigned right shift values.
	 * @param {number} n Shift amount
	 */
	unsignedRightShift(n) {
		this.map(v => v >>> n)
	}

	/**
	 * Apply function for all elements with broadcasting.
	 * @template U
	 * @param {Matrix<U> | Tensor | U} o Applied value
	 * @param {function (T, U): T} fn Applied function
	 */
	broadcastOperate(o, fn) {
		if (o instanceof Matrix || o instanceof Tensor) {
			if (o.dimension > 2) {
				throw new MatrixException(`Broadcasting size invalid. this: ${this.sizes}, other: ${o.sizes}`, [
					this,
					o,
				])
			}
			const osize = o.dimension === 2 ? o.sizes : [1, o.length]
			if (this.rows === osize[0] && this.cols === osize[1]) {
				for (let i = this.length - 1; i >= 0; i--) {
					this._value[i] = fn(this._value[i], o._value[i])
				}
			} else {
				const repeat = [1, 1]
				for (let i = 0; i < 2; i++) {
					if (this._size[i] < osize[i]) {
						if (osize[i] % this._size[i] !== 0) {
							throw new MatrixException(
								`Broadcasting size invalid. this: ${this.sizes}, other: ${o.sizes}`,
								[this, o]
							)
						}
						repeat[i] = osize[i] / this._size[i]
					} else if (this._size[i] % osize[i] !== 0) {
						throw new MatrixException(`Broadcasting size invalid. this: ${this.sizes}, other: ${o.sizes}`, [
							this,
							o,
						])
					}
				}
				if (repeat.some(v => v > 1)) {
					this.repeat(repeat)
				}
				for (let r = 0, i = 0; r < this.rows; r++) {
					const or = r % osize[0]
					for (let c = 0; c < this.cols; c++, i++) {
						this._value[i] = fn(this._value[i], o._value[or * osize[1] + (c % osize[1])])
					}
				}
			}
		} else {
			this.map(v => fn(v, o))
		}
	}

	/**
	 * Apply function to the position.
	 * @overload
	 * @param {number} r Index of the row to apply function to
	 * @param {number} c Index of the column to apply function to
	 * @param {function (T): T} [fn] Applied function
	 * @returns {T} Old value
	 */
	/**
	 * Apply function to the position.
	 * @overload
	 * @param {[number, number]} index Index to apply function to
	 * @param {function (T): T} fn Applied function
	 * @returns {T} Old value
	 */
	/**
	 * @param {number | [number, number]} r Index of the row to apply function to
	 * @param {number | function (T): T} c Index of the column to apply function to
	 * @param {function (T): T} [fn] Applied function
	 * @returns {T} Old value
	 */
	operateAt(r, c, fn) {
		if (Array.isArray(r)) {
			fn = c
			;[r, c] = r
		}
		if (r < 0 || this.rows <= r || c < 0 || this.cols <= c) throw new MatrixException('Index out of bounds.')
		const old = this._value[r * this.cols + c]
		this._value[r * this.cols + c] = fn(old)
		return old
	}

	/**
	 * Add a value or matrix.
	 * @param {Matrix<number> | Tensor | number} o Value to add
	 */
	add(o) {
		this.broadcastOperate(o, (a, b) => a + b)
	}

	/**
	 * Add a value to the position.
	 * @param {number} r Index of the row to add the value to
	 * @param {number} c Index of the column to add the value to
	 * @param {number} v Value to add
	 * @returns {number} Old value
	 */
	addAt(r, c, v) {
		return this.operateAt(r, c, o => o + v)
	}

	/**
	 * Returns a matrix that add two values.
	 * @param {Matrix<number> | number} a Left value
	 * @param {Matrix<number> | number} b Right value
	 * @returns {Matrix<number>} Added matrix
	 */
	static add(a, b) {
		if (a instanceof Matrix) {
			const r = a.copy()
			r.add(b)
			return r
		} else if (b instanceof Matrix) {
			const r = b.copy()
			r.add(a)
			return r
		}
		return new Matrix(1, 1, a + b)
	}

	/**
	 * Subtract a value or matrix.
	 * @param {Matrix<number> | Tensor | number} o Value to subtract
	 */
	sub(o) {
		this.broadcastOperate(o, (a, b) => a - b)
	}

	/**
	 * Subtract this matrix from a value or matrix.
	 * @param {Matrix<number> | Tensor | number} o Value to be subtracted
	 */
	isub(o) {
		this.negative()
		this.add(o)
	}

	/**
	 * Subtract a value from the value at the position.
	 * @param {number} r Index of the row to subtract the value to
	 * @param {number} c Index of the column to subtract the value to
	 * @param {number} v Value to subtract
	 * @returns {number} Old value
	 */
	subAt(r, c, v) {
		return this.operateAt(r, c, o => o - v)
	}

	/**
	 * Subtract the value at the position from a value.
	 * @param {number} r Index of the row whose value is to be subtracted
	 * @param {number} c Index of the column whose value is to be subtracted
	 * @param {number} v Value to be subtracted
	 * @returns {number} Old value
	 */
	isubAt(r, c, v) {
		return this.operateAt(r, c, o => v - o)
	}

	/**
	 * Returns a matrix that subtract two values.
	 * @param {Matrix<number> | number} a Left value
	 * @param {Matrix<number> | number} b Right value
	 * @returns {Matrix<number>} Subtracted matrix
	 */
	static sub(a, b) {
		if (a instanceof Matrix) {
			const r = a.copy()
			r.sub(b)
			return r
		} else if (b instanceof Matrix) {
			const r = b.copy()
			r.isub(a)
			return r
		}
		return new Matrix(1, 1, a - b)
	}

	/**
	 * Multiplies by a value element-wise.
	 * @param {Matrix<number> | Tensor | number} o Value to multiply
	 */
	mult(o) {
		this.broadcastOperate(o, (a, b) => a * b)
	}

	/**
	 * Multiplies a value to the position.
	 * @param {number} r Index of the row to multiply the value by
	 * @param {number} c Index of the column to multiply the value by
	 * @param {number} v Value to multiply
	 * @returns {number} Old value
	 */
	multAt(r, c, v) {
		return this.operateAt(r, c, o => o * v)
	}

	/**
	 * Returns a matrix that multiplies by two values element-wise.
	 * @param {Matrix<number> | number} a Left value
	 * @param {Matrix<number> | number} b Right value
	 * @returns {Matrix<number>} Multiplied matrix
	 */
	static mult(a, b) {
		if (a instanceof Matrix) {
			const r = a.copy()
			r.mult(b)
			return r
		} else if (b instanceof Matrix) {
			const r = b.copy()
			r.mult(a)
			return r
		}
		return new Matrix(1, 1, a * b)
	}

	/**
	 * Divides by a value element-wise.
	 * @param {Matrix<number> | Tensor | number} o Value to divide
	 */
	div(o) {
		this.broadcastOperate(o, (a, b) => a / b)
	}

	/**
	 * Divides a value by this matrix element-wise.
	 * @param {Matrix<number> | Tensor | number} o Value to be divided
	 */
	idiv(o) {
		this.broadcastOperate(o, (a, b) => b / a)
	}

	/**
	 * Divides the value at the position by a value.
	 * @param {number} r Index of the row to divide the value by
	 * @param {number} c Index of the column to divide the value by
	 * @param {number} v Value to divide
	 * @returns {number} Old value
	 */
	divAt(r, c, v) {
		return this.operateAt(r, c, o => o / v)
	}

	/**
	 * Divides a value by the value at the position.
	 * @param {number} r Index of the row whose value is to be divided
	 * @param {number} c Index of the column whose value is to be divided
	 * @param {number} v Value to be divided
	 * @returns {number} Old value
	 */
	idivAt(r, c, v) {
		return this.operateAt(r, c, o => v / o)
	}

	/**
	 * Returns a matrix that divides by two values element-wise.
	 * @param {Matrix<number> | number} a Left value
	 * @param {Matrix<number> | number} b Right value
	 * @returns {Matrix<number>} Divided matrix
	 */
	static div(a, b) {
		if (a instanceof Matrix) {
			const r = a.copy()
			r.div(b)
			return r
		} else if (b instanceof Matrix) {
			const r = b.copy()
			r.idiv(a)
			return r
		}
		return new Matrix(1, 1, a / b)
	}

	/**
	 * Take a remainder divided by a value element-wise.
	 * @param {Matrix<number> | Tensor | number} o Value to divide
	 */
	mod(o) {
		this.broadcastOperate(o, (a, b) => a % b)
	}

	/**
	 * Take a remainder divided a value by this matrix element-wise.
	 * @param {Matrix<number> | Tensor | number} o Value to be divided
	 */
	imod(o) {
		this.broadcastOperate(o, (a, b) => b % a)
	}

	/**
	 * Take a remainder divided the value at the position by a value.
	 * @param {number} r Index of the row to divide the value by
	 * @param {number} c Index of the column to divide the value by
	 * @param {number} v Value to divide
	 * @returns {number} Old value
	 */
	modAt(r, c, v) {
		return this.operateAt(r, c, o => o % v)
	}

	/**
	 * Take a remainder divided a value by the value at the position.
	 * @param {number} r Index of the row whose value is to be divided
	 * @param {number} c Index of the column whose value is to be divided
	 * @param {number} v Value to be divided
	 * @returns {number} Old value
	 */
	imodAt(r, c, v) {
		return this.operateAt(r, c, o => v % o)
	}

	/**
	 * Returns a matrix that takes a remainder divided by two values element-wise.
	 * @param {Matrix<number> | number} a Left value
	 * @param {Matrix<number> | number} b Right value
	 * @returns {Matrix<number>} Remainder matrix
	 */
	static mod(a, b) {
		if (a instanceof Matrix) {
			const r = a.copy()
			r.mod(b)
			return r
		} else if (b instanceof Matrix) {
			const r = b.copy()
			r.imod(a)
			return r
		}
		return new Matrix(1, 1, a % b)
	}

	/**
	 * Take a logical AND with a value or matrix.
	 * @param {Matrix<unknown> | Tensor | number} o Value to take a logical AND
	 */
	and(o) {
		this.broadcastOperate(o, (a, b) => +(!!a && !!b))
	}

	/**
	 * Take logical AND with a value to the position.
	 * @param {number} r Index of the row to take a logical AND with
	 * @param {number} c Index of the column to take a logical AND with
	 * @param {number} v Value to take a logical AND
	 * @returns {T} Old value
	 */
	andAt(r, c, v) {
		return this.operateAt(r, c, o => +(!!o && !!v))
	}

	/**
	 * Returns a matrix that takes logical AND two values.
	 * @param {Matrix<unknown> | number} a Left value
	 * @param {Matrix<unknown> | number} b Right value
	 * @returns {Matrix<number>} Logical AND matrix
	 */
	static and(a, b) {
		if (a instanceof Matrix) {
			const r = a.copy()
			r.and(b)
			return r
		} else if (b instanceof Matrix) {
			const r = b.copy()
			r.and(a)
			return r
		}
		return new Matrix(1, 1, +(!!a && !!b))
	}

	/**
	 * Take a logical OR with a value or matrix.
	 * @param {Matrix<unknown> | Tensor | number} o Value to take a logical OR
	 */
	or(o) {
		this.broadcastOperate(o, (a, b) => +(!!a || !!b))
	}

	/**
	 * Take logical OR with a value to the position.
	 * @param {number} r Index of the row to take a logical OR with
	 * @param {number} c Index of the column to take a logical OR with
	 * @param {number} v Value to take a logical OR
	 * @returns {T} Old value
	 */
	orAt(r, c, v) {
		return this.operateAt(r, c, o => +(!!o || !!v))
	}

	/**
	 * Returns a matrix that takes logical OR two values.
	 * @param {Matrix<unknown> | number} a Left value
	 * @param {Matrix<unknown> | number} b Right value
	 * @returns {Matrix<number>} Logical OR matrix
	 */
	static or(a, b) {
		if (a instanceof Matrix) {
			const r = a.copy()
			r.or(b)
			return r
		} else if (b instanceof Matrix) {
			const r = b.copy()
			r.or(a)
			return r
		}
		return new Matrix(1, 1, +(!!a || !!b))
	}

	/**
	 * Take a bitwise AND with a value or matrix.
	 * @param {Matrix<number> | Tensor | number} o Value to take a bitwise AND
	 */
	bitand(o) {
		this.broadcastOperate(o, (a, b) => +(a & b))
	}

	/**
	 * Take bitwise AND with a value to the position.
	 * @param {number} r Index of the row to take a bitwise AND with
	 * @param {number} c Index of the column to take a bitwise AND with
	 * @param {number} v Value to take a bitwise AND
	 * @returns {T} Old value
	 */
	bitandAt(r, c, v) {
		return this.operateAt(r, c, o => +(o & v))
	}

	/**
	 * Returns a matrix that takes bitwise AND two values.
	 * @param {Matrix<number> | number} a Left value
	 * @param {Matrix<number> | number} b Right value
	 * @returns {Matrix<number>} Bitwise AND matrix
	 */
	static bitand(a, b) {
		if (a instanceof Matrix) {
			const r = a.copy()
			r.bitand(b)
			return r
		} else if (b instanceof Matrix) {
			const r = b.copy()
			r.bitand(a)
			return r
		}
		return new Matrix(1, 1, +(a & b))
	}

	/**
	 * Take a bitwise OR with a value or matrix.
	 * @param {Matrix<number> | Tensor | number} o Value to take a bitwise OR
	 */
	bitor(o) {
		this.broadcastOperate(o, (a, b) => +(a | b))
	}

	/**
	 * Take bitwise OR with a value to the position.
	 * @param {number} r Index of the row to take a bitwise OR with
	 * @param {number} c Index of the column to take a bitwise OR with
	 * @param {number} v Value to take a bitwise OR
	 * @returns {T} Old value
	 */
	bitorAt(r, c, v) {
		return this.operateAt(r, c, o => +(o | v))
	}

	/**
	 * Returns a matrix that takes bitwise OR two values.
	 * @param {Matrix<number> | number} a Left value
	 * @param {Matrix<number> | number} b Right value
	 * @returns {Matrix<number>} Bitwise OR matrix
	 */
	static bitor(a, b) {
		if (a instanceof Matrix) {
			const r = a.copy()
			r.bitor(b)
			return r
		} else if (b instanceof Matrix) {
			const r = b.copy()
			r.bitor(a)
			return r
		}
		return new Matrix(1, 1, +(a | b))
	}

	/**
	 * Take a bitwise XOR with a value or matrix.
	 * @param {Matrix<number> | Tensor | number} o Value to take a bitwise XOR
	 */
	bitxor(o) {
		this.broadcastOperate(o, (a, b) => +(a ^ b))
	}

	/**
	 * Take bitwise XOR with a value to the position.
	 * @param {number} r Index of the row to take a bitwise XOR with
	 * @param {number} c Index of the column to take a bitwise XOR with
	 * @param {number} v Value to take a bitwise XOR
	 * @returns {T} Old value
	 */
	bitxorAt(r, c, v) {
		return this.operateAt(r, c, o => +(o ^ v))
	}

	/**
	 * Returns a matrix that takes bitwise XOR two values.
	 * @param {Matrix<number> | number} a Left value
	 * @param {Matrix<number> | number} b Right value
	 * @returns {Matrix<number>} Bitwise XOR matrix
	 */
	static bitxor(a, b) {
		if (a instanceof Matrix) {
			const r = a.copy()
			r.bitxor(b)
			return r
		} else if (b instanceof Matrix) {
			const r = b.copy()
			r.bitxor(a)
			return r
		}
		return new Matrix(1, 1, +(a ^ b))
	}

	/**
	 * Returns a matrix product value.
	 * @param {Matrix<number>} o Right matrix
	 * @returns {Matrix<number>} Producted matrix
	 */
	dot(o) {
		if (this.cols !== o.rows) {
			throw new MatrixException(
				`Dot size invalid. left = [${this.rows}, ${this.cols}], right = [${o.rows}, ${o.cols}]`
			)
		}
		const ocol = o.cols
		const mat = new Matrix(this.rows, ocol)
		let n = 0
		const tlen = this.length
		const olen = o.length
		const tcol = this.cols
		const tvalue = this._value
		const ovalue = o._value
		const mvalue = mat._value
		for (let i = 0; i < tlen; i += tcol) {
			let v = 0
			let c = 0
			for (let k = 0, ik = i; k < olen; k += ocol, ik++) {
				if (tvalue[ik]) c++
				v += tvalue[ik] * ovalue[k]
			}
			mvalue[n++] = v

			if (c === 0) {
				n += ocol - 1
				continue
			} else if (c / tcol < 0.1) {
				let vi = []
				let ki = []
				for (let k = 0; k < tcol; k++) {
					if (tvalue[i + k]) {
						vi.push(tvalue[i + k])
						ki.push(k)
					}
				}
				for (let j = 1; j < ocol; j++) {
					v = 0
					for (let k = 0; k < vi.length; k++) {
						v += vi[k] * ovalue[ki[k] * ocol + j]
					}
					mvalue[n++] = v
				}
			} else {
				for (let j = 1; j < ocol; j++) {
					v = 0
					for (let k = j, ik = i; k < olen; k += ocol, ik++) {
						v += tvalue[ik] * ovalue[k]
					}
					mvalue[n++] = v
				}
			}
		}
		return mat
	}

	/**
	 * Returns a matrix product of the transposed matrix of this and input.
	 * @param {Matrix<number>} o Right matrix
	 * @returns {Matrix<number>} Producted matrix
	 */
	tDot(o) {
		if (this.rows !== o.rows) {
			throw new MatrixException(
				`tDot size invalid. left = [${this.cols}, ${this.rows}], right = [${o.rows}, ${o.cols}]`
			)
		}
		const mat = new Matrix(this.cols, o.cols)
		let n = 0
		for (let i = 0; i < this.cols; i++) {
			for (let j = 0; j < o.cols; j++) {
				let v = 0
				let ik = i
				for (let k = j; k < o.length; k += o.cols, ik += this.cols) {
					v += this._value[ik] * o._value[k]
				}
				mat._value[n++] = v
			}
		}
		return mat
	}

	/**
	 * Returns kronecker producted value.
	 * @param {Matrix<number>} mat Right matrix
	 * @returns {Matrix<number>} Kronecker producted matrix
	 */
	kron(mat) {
		const kron = new Matrix(this.rows * mat.rows, this.cols * mat.cols)
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				for (let s = 0; s < mat.rows; s++) {
					for (let t = 0; t < mat.cols; t++) {
						kron._value[(i * mat.rows + s) * this.cols * mat.cols + j * mat.cols + t] =
							this._value[i * this.cols + j] * mat._value[s * mat.cols + t]
					}
				}
			}
		}
		return kron
	}

	/**
	 * Convoluted by a kernel.
	 * @param {Array<Array<number>>} kernel Kernel matrix
	 * @param {boolean} [normalize] Normalize kernel or not
	 */
	convolute(kernel, normalize = true) {
		const offsets = [Math.floor((kernel.length - 1) / 2), Math.floor((kernel[0].length - 1) / 2)]
		const v = this._value.concat()
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				let m = 0
				let ksum = 0
				for (let s = 0; s < kernel.length; s++) {
					const s0 = i + s - offsets[0]
					if (s0 < 0 || this.rows <= s0) {
						continue
					}
					for (let t = 0; t < kernel[s].length; t++) {
						const t0 = j + t - offsets[1]
						if (t0 < 0 || this.cols <= t0) {
							continue
						}
						m += kernel[s][t] * v[s0 * this.cols + t0]
						ksum += kernel[s][t]
					}
				}
				if (normalize) {
					m /= ksum
				}
				this._value[i * this.cols + j] = m
			}
		}
	}

	/**
	 * Calculate reduced row echelon form in-place.
	 * @param {number} [tol] Tolerance to be recognized as 0
	 */
	reducedRowEchelonForm(tol = 0) {
		for (let i = 0, j = 0; i < this.rows && j < this.cols; j++, i++) {
			if (Math.abs(this._value[i * this.cols + j]) <= tol) {
				for (let k = i + 1; k < this.rows; k++) {
					if (Math.abs(this._value[k * this.cols + j]) > tol) {
						this.swap(i, k, 0)
						break
					}
				}
			}
			if (Math.abs(this._value[i * this.cols + j]) <= tol) {
				i--
				continue
			}
			const a = this._value[i * this.cols + j]
			this._value[i * this.cols + j] = 1
			for (let l = j + 1; l < this.cols; l++) {
				this._value[i * this.cols + l] /= a
			}
			for (let k = 0; k < this.rows; k++) {
				if (k === i) {
					continue
				}
				const b = this._value[k * this.cols + j]
				this._value[k * this.cols + j] = 0
				for (let l = j + 1; l < this.cols; l++) {
					this._value[k * this.cols + l] -= b * this._value[i * this.cols + l]
				}
			}
		}
	}

	/**
	 * Returns a inverse matrix.
	 * @returns {Matrix<number>} Inversed matrix
	 */
	inv() {
		if (!this.isSquare()) {
			throw new MatrixException('Inverse matrix only define square matrix.', this)
		}
		const v = this._value
		switch (this.rows) {
			case 0:
				return new Matrix(0, 0)
			case 1:
				return new Matrix(1, 1, [1 / v[0]])
			case 2: {
				const d2 = this.det()
				return new Matrix(2, 2, [v[3] / d2, -v[1] / d2, -v[2] / d2, v[0] / d2])
			}
			case 3: {
				const d3 = this.det()
				return new Matrix(3, 3, [
					(v[4] * v[8] - v[5] * v[7]) / d3,
					(v[2] * v[7] - v[1] * v[8]) / d3,
					(v[1] * v[5] - v[2] * v[4]) / d3,
					(v[5] * v[6] - v[3] * v[8]) / d3,
					(v[0] * v[8] - v[2] * v[6]) / d3,
					(v[2] * v[3] - v[0] * v[5]) / d3,
					(v[3] * v[7] - v[4] * v[6]) / d3,
					(v[1] * v[6] - v[0] * v[7]) / d3,
					(v[0] * v[4] - v[1] * v[3]) / d3,
				])
			}
		}

		if (this.isLowerTriangular()) {
			return this.invLowerTriangular()
		} else if (this.isUpperTriangular()) {
			return this.invUpperTriangular()
		}
		return this.invLU()
	}

	/**
	 * Returns a inverse matrix for lower triangular matrix.
	 * @returns {Matrix<number>} Inversed matrix
	 */
	invLowerTriangular() {
		if (!this.isSquare()) {
			throw new MatrixException('Inverse matrix only define square matrix.', this)
		}
		const v = this._value
		const r = new Matrix(this.rows, this.cols)
		for (let i = 0; i < this.rows; i++) {
			const a = v[i * this.cols + i]
			r._value[i * this.cols + i] = 1 / a
			for (let j = 0; j < i; j++) {
				let val = 0
				for (let k = j; k < i; k++) {
					val += v[i * this.cols + k] * r._value[k * this.cols + j]
				}
				r._value[i * this.cols + j] = -val / a
			}
		}
		return r
	}

	/**
	 * Returns a inverse matrix for upper triangular matrix.
	 * @returns {Matrix<number>} Inversed matrix
	 */
	invUpperTriangular() {
		if (!this.isSquare()) {
			throw new MatrixException('Inverse matrix only define square matrix.', this)
		}
		const v = this._value
		const r = new Matrix(this.rows, this.cols)
		for (let i = this.cols - 1; i >= 0; i--) {
			const a = v[i * this.cols + i]
			r._value[i * this.cols + i] = 1 / a
			for (let j = i + 1; j < this.cols; j++) {
				let val = 0
				for (let k = i + 1; k <= j; k++) {
					val += v[i * this.cols + k] * r._value[k * this.cols + j]
				}
				r._value[i * this.cols + j] = -val / a
			}
		}
		return r
	}

	/**
	 * Returns a inverse matrix by row reduction.
	 * @returns {Matrix<number>} Inversed matrix
	 */
	invRowReduction() {
		if (!this.isSquare()) {
			throw new MatrixException('Inverse matrix only define square matrix.', this)
		}
		const a = this.copy()
		const n = this.rows
		const e = Matrix.eye(n, n)
		for (let i = 0; i < n; i++) {
			const i_n = i * n
			if (a._value[i_n + i] === 0) {
				let k = i + 1
				for (; k < n && a._value[k * n + i] === 0; k++);
				if (k === n) {
					throw new MatrixException('', this)
				}
				for (let j = i; j < n; j++) {
					;[a._value[i_n + j], a._value[k * n + j]] = [a._value[k * n + j], a._value[i_n + j]]
				}
				e.swap(i, k)
			}
			const v = a._value[i_n + i]
			a._value[i_n + i] = 1
			for (let j = i + 1; j < n; j++) {
				a._value[i_n + j] /= v
			}
			for (let j = 0; j < n; j++) {
				e._value[i_n + j] = e._value[i_n + j] / v
			}
			for (let k = 0; k < n; k++) {
				if (i === k) continue
				const v = a._value[k * n + i]
				a._value[k * n + i] = 0
				for (let j = i + 1; j < n; j++) {
					a._value[k * n + j] -= v * a._value[i_n + j]
				}
				for (let j = 0; j < n; j++) {
					e._value[k * n + j] = e._value[k * n + j] - v * e._value[i_n + j]
				}
			}
		}
		return e
	}

	/**
	 * Returns a inverse matrix by LU decompositioin.
	 * @returns {Matrix<number>} Inversed matrix
	 */
	invLU() {
		if (!this.isSquare()) {
			throw new MatrixException('Inverse matrix only define square matrix.', this)
		}
		const [l, u] = this.lu()
		return u.invUpperTriangular().dot(l.invLowerTriangular())
	}

	/**
	 * Returns a pseudo inverse matrix.
	 * @returns {Matrix<number>} pseudo inverse matrix
	 */
	pseudoInv() {
		const n = this.rows
		const m = this.cols
		const v = this._value
		if (n === 0 || m === 0) {
			return new Matrix(m, n)
		} else if (n === 1 && m === 1) {
			return new Matrix(1, 1, v[0] === 0 ? 0 : 1 / v[0])
		} else if (n === 1 || m === 1) {
			const d = v.reduce((s, v) => s + v ** 2, 0)
			if (d === 0) {
				return new Matrix(m, n)
			}
			return new Matrix(
				m,
				n,
				v.map(v => v / d)
			)
		} else if (n === 2 && m === 2) {
			const d = this.det()
			if (d !== 0) {
				return this.inv()
			}
			const d2 = v.reduce((s, v) => s + v ** 2, 0)
			if (d2 === 0) {
				return new Matrix(m, n)
			}
			return new Matrix(
				m,
				n,
				v.map(v => v / d2)
			)
		}
		return this.pseudoInvQR()
	}

	/**
	 * Returns a pseudo inverse matrix.
	 * @returns {Matrix<number>} pseudo inverse matrix
	 */
	pseudoInvNaive() {
		const a = this.rows < this.cols ? this.adjoint() : this
		const inv = a.tDot(a).solve(a.adjoint())
		return this.rows < this.cols ? inv.adjoint() : inv
	}

	/**
	 * Returns a Moore–Penrose inverse matrix by QR decomposition.
	 * @returns {Matrix<number>} Moore–Penrose inverse matrix
	 */
	pseudoInvQR() {
		const a = this.rows < this.cols ? this.adjoint() : this
		const [, r] = a.qr()
		const y = r.adjoint().solveLowerTriangular(a.adjoint())
		r.resize(a.rows, a.rows, 1)
		const inv = r.solveUpperTriangular(y)
		inv.resize(a.cols, a.rows)
		return this.rows < this.cols ? inv.adjoint() : inv
	}

	/**
	 * Returns a Moore–Penrose inverse matrix by SVD decomposition.
	 * @returns {Matrix<number>} Moore–Penrose inverse matrix
	 */
	pseudoInvSVD() {
		const [u, s, v] = this.svd()
		return v.dot(Matrix.diag(s.map(v => (v === 0 ? 0 : 1 / v)))).dot(u.t)
	}

	/**
	 * Returns a Moore–Penrose inverse matrix by Ben-Israel and Cohen iterative method.
	 * @returns {Matrix<number>} Moore–Penrose inverse matrix
	 */
	pseudoInvBenIsraelCohen() {
		const astar = this.adjoint()
		const delta = 1.0e-5
		const m = astar.dot(this)
		for (let i = 0; i < m.rows; i++) {
			m.addAt(i, i, delta)
		}
		let a = m.inv().dot(astar)

		const tol = 1.0e-15
		let maxCount = 1.0e4
		while (maxCount-- > 0) {
			const a1 = Matrix.mult(a, 2)
			a1.sub(a.dot(this).dot(a))
			let e = 0
			for (let i = 0; i < a.length; i++) {
				e += (a.value[i] - a1.value[i]) ** 2
			}
			a = a1
			if (e < tol) {
				break
			}
		}
		return a
	}

	/**
	 * Returns a square root of this matrix.
	 * @returns {Matrix<number>} Squared matrix
	 */
	sqrt() {
		if (!this.isSquare()) {
			throw new MatrixException('sqrt only define square matrix.', this)
		}
		switch (this.rows) {
			case 0:
				return this
			case 1:
				return new Matrix(1, 1, [Math.sqrt(this._value[0])])
		}
		if (this.isDiag()) {
			return Matrix.diag(this.diag().map(Math.sqrt))
		}
		const [evalue, evector] = this.eigen()
		const D = new Matrix(this.rows, this.cols)
		for (let i = 0; i < this.rows; i++) {
			D._value[i * this.cols + i] = Math.sqrt(evalue[i])
		}
		return evector.dot(D).dot(evector.transpose())
	}

	/**
	 * Returns a power of this matrix.
	 * @param {number} p Power exponent value
	 * @returns {Matrix<number>} Powered matrix
	 */
	power(p) {
		if (!this.isSquare()) {
			throw new MatrixException('Only square matrix can power.', this)
		}
		const n = this.rows
		if (this.isDiag(1.0e-12)) {
			return Matrix.diag(this.diag().map(v => Math.pow(v, p)))
		}
		if (Number.isInteger(p)) {
			if (p === 0) {
				return Matrix.eye(n, n)
			} else if (p === 1) {
				return this.copy()
			} else if (p === 2) {
				return this.dot(this)
			} else if (p === -1) {
				return this.inv()
			} else if (p < 0) {
				return this.inv().power(-p)
			} else if (!this.isSymmetric(1.0e-12)) {
				let m = this.dot(this)
				for (let i = 2; i < p; i++) {
					m = m.dot(this)
				}
				return m
			}
			const [eva, eve] = this.eigen()
			const d = Matrix.diag(eva.map(v => Math.pow(v, p)))
			return eve.dot(d).dot(eve.t)
		} else if (p < 0) {
			return this.inv().power(-p)
		} else if (p === 0.5) {
			return this.sqrt()
		}
		throw new MatrixException('Power only defined integer.')
	}

	/**
	 * Returns a exponential matrix
	 * @returns {Matrix<number>} Exponential matrix
	 */
	exp() {
		if (!this.isSquare()) {
			throw new MatrixException('Only square matrix can exp.', this)
		}
		if (this.rows === 1) {
			return new Matrix(1, 1, Math.exp(this._value[0]))
		}
		if (this.isDiag()) {
			return Matrix.diag(this.diag().map(Math.exp))
		}

		const e = Matrix.eye(this.rows, this.cols)
		let k = 1
		let s = 1
		let x = this
		const err = 10 ** (Math.floor(Math.log(Math.abs(this.trace()))) - 8)
		while (true) {
			const a = Matrix.div(x, k)
			e.add(a)
			if (a.norm() < err) {
				break
			}
			x = x.dot(this)
			s++
			k *= s
		}
		return e
	}

	/**
	 * Returns a logarithm matrix
	 * @returns {Matrix<number>} Logarithm matrix
	 */
	log() {
		if (!this.isSquare()) {
			throw new MatrixException('Only square matrix can log.', this)
		}
		if (this.rows === 1) {
			return new Matrix(1, 1, Math.log(this._value[0]))
		}
		if (this.isDiag()) {
			return Matrix.diag(this.diag().map(Math.log))
		}

		const [evals, evecs] = this.eigen()
		const iev = evecs.inv()
		return evecs.dot(Matrix.diag(evals.map(Math.log))).dot(iev)
	}

	/**
	 * Returns a covariance matrix.
	 * @param {number} [ddof] Delta Degrees of Freedom
	 * @returns {Matrix<number>} Covariance matrix
	 */
	cov(ddof = 0) {
		const c = new Matrix(this.cols, this.cols)
		const s = []
		for (let i = 0; i < this.cols; i++) {
			let si = 0
			for (let k = i; k < this.length; k += this.cols) {
				si += this._value[k]
			}
			s[i] = si / this.rows
			for (let j = 0; j <= i; j++) {
				let v = 0
				for (let k = 0; k < this.length; k += this.cols) {
					v += (this._value[i + k] - s[i]) * (this._value[j + k] - s[j])
				}
				c._value[i * this.cols + j] = c._value[j * this.cols + i] = v / (this.rows - ddof)
			}
		}
		return c
	}

	/**
	 * Returns a gram matrix.
	 * @returns {Matrix<number>} Gram matrix
	 */
	gram() {
		return this.tDot(this)
	}

	/**
	 * Returns a solved value A of a equation XA=B.
	 * @param {Matrix<number>} b Dependent variable values
	 * @returns {Matrix<number>} Solved matrix
	 */
	solve(b) {
		if (this.rows > this.cols) {
			throw new MatrixException('Only square matrix or matrix with more columns than rows can be solved.', this)
		}
		const n = this.rows
		if (n !== b.rows) {
			throw new MatrixException('b size is invalid.', [this, b])
		}
		const a = n < this.cols ? Matrix.resize(this, n, n) : this

		let x
		switch (n) {
			case 0:
				x = a
				break
			case 1:
				x = Matrix.map(b, v => v / a._value[0])
				break
			default: {
				const [l, u] = a.lu()
				const y = l.solveLowerTriangular(b)
				x = u.solveUpperTriangular(y)
				break
			}
		}
		if (n < this.cols) {
			x.resize(this.cols, x.cols)
		}
		return x
	}

	/**
	 * Returns a solved value for lower triangular matrix.
	 * @param {Matrix<number>} b Dependent variable values
	 * @returns {Matrix<number>} Solved matrix
	 */
	solveLowerTriangular(b) {
		if (this.rows > this.cols) {
			throw new MatrixException('Matrix that column rank is less than row rank can not solve.', this)
		}
		if (this.rows !== b.rows) {
			throw new MatrixException('b size is invalid.', [this, b])
		}
		const n = this.cols
		const m = b.cols
		const x = new Matrix(n, m)
		for (let k = 0; k < m; k++) {
			for (let i = 0; i < this.rows; i++) {
				let s = b._value[i * m + k]
				for (let j = 0; j < i; j++) {
					s -= x._value[j * m + k] * this._value[i * n + j]
				}
				x._value[i * m + k] = s / this._value[i * n + i]
			}
		}
		return x
	}

	/**
	 * Returns a solved value for upper triangular matrix.
	 * @param {Matrix<number>} b Dependent variable values
	 * @returns {Matrix<number>} Solved matrix
	 */
	solveUpperTriangular(b) {
		if (this.rows > this.cols) {
			throw new MatrixException('Matrix that column rank is less than row rank can not solve.', this)
		}
		if (this.rows !== b.rows) {
			throw new MatrixException('b size is invalid.', [this, b])
		}
		const n = this.cols
		const m = b.cols
		const x = new Matrix(n, m)
		for (let k = 0; k < m; k++) {
			for (let i = this.rows - 1; i >= 0; i--) {
				let s = b._value[i * m + k]
				for (let j = n - 1; j > i; j--) {
					s -= x._value[j * m + k] * this._value[i * n + j]
				}
				x._value[i * m + k] = s / this._value[i * n + i]
			}
		}
		return x
	}

	/**
	 * Returns a solved value with Jacobi method.
	 * @param {Matrix<number>} b Dependent variable values
	 * @param {number} [maxIteration] Maximum iteration
	 * @returns {Matrix<number>} Solved matrix
	 */
	solveJacobi(b, maxIteration = 1.0e3) {
		if (!this.isSquare()) {
			throw new MatrixException('solveJacobi only define square matrix.', this)
		}
		if (this.rows !== b.rows) {
			throw new MatrixException('b size is invalid.', [this, b])
		}
		const n = this.cols
		const m = b.cols

		let x = Matrix.zeros(n, m)
		for (let t = 0; t < maxIteration; t++) {
			const newx = Matrix.zeros(n, m)
			for (let i = 0; i < n; i++) {
				const ii = this.at(i, i)
				for (let k = 0; k < m; k++) {
					let v = b.at(i, k)
					for (let j = 0; j < n; j++) {
						if (i === j) continue
						v -= x.at(j, k) * this.at(i, j)
					}
					newx.set(i, k, v / ii)
				}
			}
			if (newx.some(v => isNaN(v))) {
				throw new MatrixException('Can not calculate solved value.', this)
			}
			const e = Matrix.sub(x, newx).norm()
			if (e < 1.0e-8) {
				x = newx
				break
			}
			x = newx
		}
		return x
	}

	/**
	 * Returns a solved value with Gauss-Seidel method.
	 * @param {Matrix<number>} b Dependent variable values
	 * @param {number} [maxIteration] Maximum iteration
	 * @returns {Matrix<number>} Solved matrix
	 */
	solveGaussSeidel(b, maxIteration = 1.0e3) {
		if (!this.isSquare()) {
			throw new MatrixException('solveGaussSeidel only define square matrix.', this)
		}
		if (this.rows !== b.rows) {
			throw new MatrixException('b size is invalid.', [this, b])
		}
		const n = this.cols
		const m = b.cols

		let x = Matrix.zeros(n, m)
		for (let t = 0; t < maxIteration; t++) {
			let e = 0
			for (let i = 0; i < n; i++) {
				const ii = this.at(i, i)
				for (let k = 0; k < m; k++) {
					let v = b.at(i, k)
					for (let j = 0; j < n; j++) {
						if (i === j) continue
						v -= x.at(j, k) * this.at(i, j)
					}
					v /= ii
					e += (x.at(i, k) - v) ** 2
					x.set(i, k, v)
				}
			}
			if (x.some(v => isNaN(v))) {
				throw new MatrixException('Can not calculate solved value.', this)
			}
			if (Math.sqrt(e) < 1.0e-8) {
				break
			}
		}
		return x
	}

	/**
	 * Returns a solved value with Successive Over-Relaxation method.
	 * @param {Matrix<number>} b Dependent variable values
	 * @param {Matrix<number>} w Relaxation factor
	 * @param {number} [maxIteration] Maximum iteration
	 * @returns {Matrix<number>} Solved matrix
	 */
	solveSOR(b, w, maxIteration = 1.0e3) {
		if (!this.isSquare()) {
			throw new MatrixException('solveSOR only define square matrix.', this)
		}
		if (this.rows !== b.rows) {
			throw new MatrixException('b size is invalid.', [this, b])
		}
		if (w <= 0 || 2 <= w) {
			throw new MatrixException('w must be positive and less than 2.', [this, w])
		}
		const n = this.cols
		const m = b.cols

		let x = Matrix.zeros(n, m)
		for (let t = 0; t < maxIteration; t++) {
			let e = 0
			for (let i = 0; i < n; i++) {
				const ii = this.at(i, i)
				for (let k = 0; k < m; k++) {
					let v = b.at(i, k)
					for (let j = 0; j < n; j++) {
						if (i === j) continue
						v -= x.at(j, k) * this.at(i, j)
					}
					v /= ii
					const xik = x.at(i, k)
					e += (xik - v) ** 2
					x.set(i, k, (1 - w) * xik + w * v)
				}
			}
			if (x.some(v => isNaN(v))) {
				throw new MatrixException('Can not calculate solved value.', this)
			}
			if (Math.sqrt(e) < 1.0e-8) {
				break
			}
		}
		return x
	}

	/**
	 * Returns a bidiagonal matrix.
	 * @returns {Matrix<number>} Bidiagonal matrix
	 */
	bidiag() {
		return this.bidiagHouseholder()
	}

	/**
	 * Returns a bidiagonal matrix by Householder method.
	 * @overload
	 * @param {false} [return_uv] Returns orthogonal matrixes
	 * @returns {Matrix<number>} Bidiagonal matrix, or Bidiagonal matrix and orthogonal matrixes
	 */
	/**
	 * Returns a bidiagonal matrix by Householder method.
	 * @overload
	 * @param {true} return_uv Returns orthogonal matrixes
	 * @returns {[Matrix<number>, Matrix<number>, Matrix<number>]} Bidiagonal matrix, or Bidiagonal matrix and orthogonal matrixes
	 */
	/**
	 * @param {boolean} [return_uv] Returns orthogonal matrixes
	 * @returns {Matrix<number> | [Matrix<number>, Matrix<number>, Matrix<number>]} Bidiagonal matrix, or Bidiagonal matrix and orthogonal matrixes
	 */
	bidiagHouseholder(return_uv = false) {
		const a = this.copy()
		const [n, m] = [this.rows, this.cols]
		let Uh = return_uv ? Matrix.eye(n, n) : null
		let Vh = return_uv ? Matrix.eye(m, m) : null
		for (let i = 0; i < Math.min(n, m); i++) {
			let new_a = a.block(i, i)
			let v = new_a.col(0)
			if (v.norm() > 0) {
				const alpha = v.norm() * (v._value[0] < 0 ? 1 : -1)
				v._value[0] -= alpha
				v.div(v.norm())
			}
			let V = v.dot(v.t)
			V.mult(2)

			let H = Matrix.eye(n - i, n - i)
			H.sub(V)
			new_a = H.tDot(new_a)
			if (return_uv) {
				Uh.set(i, 0, H.dot(Uh.slice(i, null, 0)))
			}

			v = new_a.row(0)
			v._value[0] = 0
			if (v.norm() > 0) {
				const alpha = v.norm() * (v._value[1] < 0 ? 1 : -1)
				v._value[1] -= alpha
				v.div(v.norm())
			}
			V = v.tDot(v)
			V.mult(2)

			H = Matrix.eye(m - i, m - i)
			H.sub(V)
			new_a = new_a.dot(H)
			if (return_uv) {
				Vh.set(0, i, Vh.slice(i, null, 1).dot(H))
			}

			a.set(i, i, new_a)
		}
		if (return_uv) {
			return [a, Uh.t, Vh]
		}
		return a
	}

	/**
	 * Returns a tridiagonal matrix.
	 * @returns {Matrix<number>} Tridiagonal matrix
	 */
	tridiag() {
		return this.tridiagHouseholder()
	}

	/**
	 * Returns a tridiagonal matrix.
	 * @overload
	 * @param {false} [return_u] Returns orthogonal matrix
	 * @returns {Matrix<number>} Tridiagonal matrix, or Tridiagonal matrix and orthogonal matrix
	 */
	/**
	 * Returns a tridiagonal matrix.
	 * @overload
	 * @param {true} return_u Returns orthogonal matrix
	 * @returns {[Matrix<number>, Matrix<number>]} Tridiagonal matrix, or Tridiagonal matrix and orthogonal matrix
	 */
	/**
	 * @param {boolean} [return_u] Returns orthogonal matrix
	 * @returns {Matrix<number> | [Matrix<number>, Matrix<number>]} Tridiagonal matrix, or Tridiagonal matrix and orthogonal matrix
	 */
	tridiagHouseholder(return_u = false) {
		if (!this.isSymmetric()) {
			throw new MatrixException('Tridiagonal only define symmetric matrix.', this)
		}
		const a = this.copy()
		const n = this.cols
		let Uh = return_u ? Matrix.eye(n, n) : null
		for (let i = 0; i < n - 2; i++) {
			const v = a.block(i + 1, i, n, i + 1)
			const alpha = v.norm() * (v._value[0] < 0 ? 1 : -1)
			v._value[0] -= alpha
			v.div(v.norm())
			if (return_u) {
				const vv = v.dot(v.t)
				vv.map((v, idx) => (idx[0] === idx[1] ? 1 - 2 * v : -2 * v))
				Uh.set(0, i + 1, Uh.slice(i + 1, null, 1).dot(vv))
			}

			const new_a = a.block(i + 1, i + 1)
			const d = new_a.dot(v)
			const g = Matrix.mult(v, v.tDot(d))
			g.isub(d)
			g.mult(2)

			new_a.sub(g.dot(v.t))
			new_a.sub(v.dot(g.t))
			a.set(i + 1, i + 1, new_a)

			a._value[i * n + i + 1] = a._value[(i + 1) * n + i] = alpha
			for (let j = i + 2; j < n; j++) {
				a._value[i * n + j] = a._value[j * n + i] = 0
			}
		}
		if (return_u) {
			return [a, Uh]
		}
		return a
	}

	/**
	 * Returns a tridiagonal matrix.
	 * @param {number} [k] Number of iterations
	 * @returns {Matrix<number>} Tridiagonal matrix
	 */
	tridiagLanczos(k = 0) {
		if (!this.isSymmetric()) {
			throw new MatrixException('Tridiagonal only define symmetric matrix.', this)
		}
		const n = this.cols
		if (k <= 0) {
			k = n
		}
		let s = 0
		let q0 = Matrix.zeros(n, 1)
		let q1 = Matrix.randn(n, 1)
		q1.div(q1.norm())

		const a = Matrix.zeros(k, k)
		for (let i = 0; i < k; i++) {
			const v = this.dot(q1)
			const t = q1.tDot(v).toScaler()
			v.sub(Matrix.mult(q0, s))
			v.sub(Matrix.mult(q1, t))
			s = v.norm()
			q0 = q1
			v.div(s)
			q1 = v

			a.set(i, i, t)
			if (i < k - 1) {
				a.set(i, i + 1, s)
				a.set(i + 1, i, s)
			}
		}
		return a
	}

	/**
	 * Returns a hessenberg matrix.
	 * @returns {Matrix<number>} Hessenberg matrix
	 */
	hessenberg() {
		return this.hessenbergArnoldi()
	}

	/**
	 * Returns a hessenberg matrix.
	 * @param {number} [k] Number of iterations
	 * @returns {Matrix<number>} Hessenberg matrix
	 */
	hessenbergArnoldi(k = 0) {
		if (!this.isSquare()) {
			throw new MatrixException('Hessenberg only define square matrix.', this)
		}
		const n = this.cols
		if (k <= 0) {
			k = n
		}
		const h = Matrix.zeros(k, k)
		const q = [Matrix.random(n, 1, -1, 1)]
		q[0].div(q[0].norm())
		for (let j = 0; j < k; j++) {
			const v = this.dot(q[j])
			for (let i = 0; i <= j; i++) {
				const hij = q[i].tDot(v).toScaler()
				v.sub(Matrix.mult(q[i], hij))
				h.set(i, j, hij)
			}
			const hi1j = v.norm()
			v.div(hi1j)
			q[j + 1] = v
			if (j < k - 1) {
				h.set(j + 1, j, hi1j)
			}
		}
		return h
	}

	/**
	 * Returns a doubly stochastic matrix.
	 * @returns {[number[], Matrix<number>, number[]]} Doubly stochastic matrix
	 */
	balancing() {
		if (!this.isSquare()) {
			throw new MatrixException('Doubly stochastic matrix only defined for square matrix.', this)
		}
		if (this._value.some(v => v <= 0)) {
			throw new MatrixException('Doubly stochastic matrix only calculate for non negative matrix.', this)
		}
		if (this.rows === 1) {
			return [[this._value[0]], new Matrix(1, 1, 1), [1]]
		}
		return this.balancingSinkhornKnopp()
	}

	/**
	 * Returns a doubly stochastic matrix by Sinkhorn-Knopp algorithm.
	 * @returns {[number[], Matrix<number>, number[]]} Doubly stochastic matrix
	 */
	balancingSinkhornKnopp() {
		if (!this.isSquare()) {
			throw new MatrixException('Doubly stochastic matrix only defined for square matrix.', this)
		}
		if (this._value.some(v => v <= 0)) {
			throw new MatrixException('Doubly stochastic matrix only calculate for non negative matrix.', this)
		}
		const n = this.rows
		const d1 = Array(n).fill(1)
		const d2 = Array(n).fill(1)
		const a = this.copy()
		let maxCount = 1.0e4
		while (maxCount-- > 0) {
			const s1 = a.sum(1)
			a.div(s1)
			for (let i = 0; i < n; i++) {
				d1[i] *= s1.at(i, 0)
			}
			const s2 = a.sum(0)
			a.div(s2)
			for (let i = 0; i < n; i++) {
				d2[i] *= s2.at(0, i)
			}
			const e = s1.reduce((s, v) => s + Math.abs(v - 1), 0) + s2.reduce((s, v) => s + Math.abs(v - 1), 0)
			if (e < 1.0e-8) {
				break
			}
		}
		return [d1, a, d2]
	}

	/**
	 * Returns a LU decomposition.
	 * @returns {[Matrix<number>, Matrix<number>]} Lower triangular matrix and upper triangular matrix
	 */
	lu() {
		if (!this.isSquare()) {
			throw new MatrixException('LU decomposition only define square matrix.', this)
		}
		const n = this.rows
		switch (n) {
			case 0:
				return [this, this]
			case 1:
				return [Matrix.ones(1, 1), new Matrix(1, 1, [this._value[0]])]
			case 2:
				return [
					new Matrix(2, 2, [1, 0, this._value[2] / this._value[0], 1]),
					new Matrix(2, 2, [
						this._value[0],
						this._value[1],
						0,
						this._value[3] - (this._value[1] * this._value[2]) / this._value[0],
					]),
				]
		}
		let lu = this.copy()
		for (let i = 0; i < n; i++) {
			const a = lu._value[i * n + i]
			for (let j = i + 1; j < n; j++) {
				const b = (lu._value[j * n + i] /= a)
				for (let k = i + 1; k < n; k++) {
					lu._value[j * n + k] -= b * lu._value[i * n + k]
				}
			}
		}
		let l = Matrix.eye(n, n)
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < i; j++) {
				l._value[i * n + j] = lu._value[i * n + j]
				lu._value[i * n + j] = 0
			}
		}
		return [l, lu]
	}

	/**
	 * Returns a QR decomposition.
	 * @returns {[Matrix<number>, Matrix<number>]} Orthogonal matrix and upper triangular matrix
	 */
	qr() {
		const n = this.rows
		const m = this.cols
		if (n === 0 || m === 0) {
			return [this, this]
		} else if (n === 1) {
			return [Matrix.ones(1, 1), this]
		} else if (m === 1) {
			const norm = Math.sqrt(this.tDot(this).toScaler())
			return [Matrix.div(this, norm), new Matrix(1, 1, norm)]
		}
		return this.qrHouseholder()
	}

	/**
	 * Returns a QR decomposition by Gram-Schmidt method.
	 * @returns {[Matrix<number>, Matrix<number>]} Orthogonal matrix and upper triangular matrix
	 */
	qrGramSchmidt() {
		const m = this.cols
		const b = this.copy()
		const x = Matrix.eye(m, m)
		const d = []
		for (let i = 0; i < m; i++) {
			for (let j = 0; j < i; j++) {
				let s = 0
				for (let k = 0; k < this.rows; k++) {
					s += this._value[k * m + i] * b._value[k * m + j]
				}
				const xv = (x._value[j * m + i] = d[j] === 0 ? 0 : s / d[j] ** 2)
				for (let k = 0; k < this.rows; k++) {
					b._value[k * m + i] -= b._value[k * m + j] * xv
				}
			}
			d.push(b.col(i).norm())
		}
		b.mult(
			new Matrix(
				1,
				m,
				d.map(v => (v === 0 ? 0 : 1 / v))
			)
		)
		x.mult(new Matrix(m, 1, d))
		return [b, x]
	}

	/**
	 * Returns a QR decomposition by Householder method.
	 * @returns {[Matrix<number>, Matrix<number>]} Orthogonal matrix and upper triangular matrix
	 */
	qrHouseholder() {
		const n = this.rows
		const m = this.cols
		const a = this.copy()
		const u = Matrix.eye(n, n)
		for (let i = 0; i < Math.min(n, m); i++) {
			const ni = n - i
			const x = a.block(i, i, n, i + 1)
			const alpha = x.norm() * Math.sign(x._value[0])
			x._value[0] -= alpha
			const norm = x.norm()
			x.div(norm === 0 ? 1 : norm)

			const V = new Matrix(ni, ni)
			for (let j = 0; j < ni; j++) {
				const xvj = x._value[j]
				V._value[j * ni + j] = 1 - 2 * xvj ** 2
				if (!xvj) continue
				for (let k = 0; k < j; k++) {
					V._value[j * ni + k] = V._value[k * ni + j] = -2 * xvj * x._value[k]
				}
			}

			a.set(i, i, V.dot(a.block(i, i)))
			u.set(i, 0, V.dot(u.block(i, 0)))
		}
		return [u.t, a]
	}

	/**
	 * Returns singular values.
	 * @returns {number[]} Singular values
	 */
	singularValues() {
		const ata = this.dot(this.adjoint())
		const ev = ata.eigenJacobi()[0]
		for (let i = 0; i < ev.length; i++) {
			if (-1.0e-12 < ev[i] && ev[i] < 0) {
				ev[i] = 0
			}
			ev[i] = Math.sqrt(ev[i])
		}
		return ev
	}

	/**
	 * Returns the maximum singular value.
	 * @param {number} [maxIteration] Maximum iteration
	 * @returns {number} Maximum singular value
	 */
	singularValuePowerIteration(maxIteration = 1.0e4) {
		const tol = 1.0e-15
		let v = Matrix.randn(this.cols, 1)
		let u = Matrix.randn(this.rows, 1)
		v.div(v.norm())
		u.div(u.norm())
		let ps = Infinity
		let maxCount = maxIteration
		while (maxCount-- > 0) {
			const v2 = this.tDot(u)
			const s = v.tDot(v2).at(0, 0)
			v2.div(v2.norm())
			u = this.dot(v2)
			u.div(u.norm())
			const e = Math.abs(s - ps)
			if (e < tol || isNaN(e)) {
				return s
			}
			v = v2
			ps = s
		}
		throw new MatrixException('singularValuePowerIteration not converged.', this)
	}

	/**
	 * Returns a singular value decomposition.
	 * @returns {[Matrix<number>, number[], Matrix<number>]} Unitary matrix and singular values
	 */
	svd() {
		return this.svdEigen()
	}

	/**
	 * Returns a singular value decomposition by eigen decomposition.
	 * @returns {[Matrix<number>, number[], Matrix<number>]} Unitary matrix and singular values
	 */
	svdEigen() {
		// https://ohke.hateblo.jp/entry/2017/12/14/230500
		const n = Math.min(this.cols, this.rows)
		if (this.cols <= this.rows) {
			const ata = this.tDot(this)
			const [ev, V] = ata.eigen()
			for (let i = 0; i < n; i++) {
				if (-1.0e-12 < ev[i] && ev[i] <= 0) {
					ev[i] = 0
				} else {
					ev[i] = Math.sqrt(ev[i])
				}
			}
			const U = this.dot(V)
			for (let i = 0; i < this.rows; i++) {
				for (let j = 0; j < n; j++) {
					if (ev[j] === 0) continue
					U._value[i * n + j] /= ev[j]
				}
			}
			return [U, ev, V]
		} else {
			const aat = this.dot(this.t)
			const [ev, U] = aat.eigen()
			for (let i = 0; i < n; i++) {
				if (-1.0e-12 < ev[i] && ev[i] <= 0) {
					ev[i] = 0
				} else {
					ev[i] = Math.sqrt(ev[i])
				}
			}
			const V = U.tDot(this)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < this.cols; j++) {
					if (ev[i] === 0) continue
					V._value[i * this.cols + j] /= ev[i]
				}
			}
			return [U, ev, V.t]
		}
	}

	/**
	 * Returns a singular value decomposition by Golub-Kahan method.
	 * @returns {[Matrix<number>, number[], Matrix<number>]} Unitary matrix and singular values
	 */
	svdGolubKahan() {
		const right = this.rows >= this.cols
		const m = Math.min(this.rows, this.cols)
		const a = right ? this : this.t
		const [b, , v] = a.bidiagHouseholder(true)
		for (let i = 0; i < m; i++) {
			const sign = Math.sign(b.at(i, i))
			if (sign < 0) {
				b.multAt(i, i, -1)
				if (i > 0) {
					b.multAt(i - 1, i, -1)
				}
				for (let j = 0; j < v.rows; j++) {
					v.multAt(j, i, -1)
				}
			}
		}

		const tol = 1.0e-12
		let maxCount = 1.0e4
		let btb = b.tDot(b)
		let v0 = v
		while (maxCount-- > 0) {
			const [q] = btb.qrGramSchmidt()
			btb = q.tDot(btb).dot(q)
			v0 = v0.dot(q)
			let e = 0
			for (let i = 0; i < btb.rows; i++) {
				for (let j = 0; j < btb.cols; j++) {
					if (i !== j) {
						e += btb.at(i, j) ** 2
					}
				}
			}
			if (Math.sqrt(e) < tol) {
				break
			}
		}
		const [u0, r] = a.dot(v0).qr()
		for (let i = 0; i < m; i++) {
			if (r.at(i, i) < 0) {
				for (let j = 0; j < v0.rows; j++) {
					v0.multAt(j, i, -1)
				}
			}
		}
		const d = btb.diag().map(v => Math.sqrt(v))
		if (right) {
			return [u0.slice(0, m, 1), d, v0.slice(0, m, 1)]
		} else {
			return [v0.slice(0, m, 1), d, u0.slice(0, m, 1)]
		}
	}

	/**
	 * Returns a cholesky decomposition.
	 * @returns {Matrix<number>} Cholesky decomposition matrix
	 */
	cholesky() {
		return this.choleskyBanachiewicz()
	}

	/**
	 * Returns a cholesky decomposition by Gaussian algorithm.
	 * @returns {Matrix<number>} Cholesky decomposition matrix
	 */
	choleskyGaussian() {
		if (!this.isSymmetric(1.0e-15)) {
			throw new MatrixException('Cholesky decomposition only define symmetric matrix.', this)
		}
		let a = this
		const n = a.rows
		let l = Matrix.eye(n, n)
		for (let i = 0; i < n; i++) {
			const aii = a.at(0, 0)
			const b = a.block(1, 0, n - i, 1)
			const bt = a.block(0, 1, 1, n - i)

			a = a.block(1, 1)
			const bb = b.dot(bt)
			bb.div(aii)
			a.sub(bb)

			const li = Matrix.eye(n, n)
			li.set(i, i, Math.sqrt(aii))
			b.div(Math.sqrt(aii))
			li.set(i + 1, i, b)
			l = l.dot(li)
		}
		return l
	}

	/**
	 * Returns a cholesky decomposition by Banachiewicz algorithm.
	 * @returns {Matrix<number>} Cholesky decomposition matrix
	 */
	choleskyBanachiewicz() {
		if (!this.isSymmetric(1.0e-15)) {
			throw new MatrixException('Cholesky decomposition only define symmetric matrix.', this)
		}
		const n = this.rows
		const l = new Matrix(n, n)
		for (let i = 0; i < n; i++) {
			let ds = 0
			for (let j = 0; j < i; j++) {
				let s = 0
				for (let k = 0; k < j; k++) {
					s += l._value[i * n + k] * l._value[j * n + k]
				}
				l._value[i * n + j] = (this._value[i * n + j] - s) / l._value[j * n + j]
				ds += l._value[i * n + j] ** 2
			}
			l._value[i * n + i] = Math.sqrt(this._value[i * n + i] - ds)
		}
		return l
	}

	/**
	 * Returns a cholesky decomposition by Crout algorithm.
	 * @returns {Matrix<number>} Cholesky decomposition matrix
	 */
	choleskyCrout() {
		if (!this.isSymmetric(1.0e-15)) {
			throw new MatrixException('Cholesky decomposition only define symmetric matrix.', this)
		}
		const n = this.rows
		const l = new Matrix(n, n)
		for (let j = 0; j < n; j++) {
			let ds = 0
			for (let k = 0; k < j; k++) {
				ds += l._value[j * n + k] * l._value[j * n + k]
			}
			l._value[j * n + j] = Math.sqrt(this._value[j * n + j] - ds)
			for (let i = j + 1; i < n; i++) {
				let s = 0
				for (let k = 0; k < j; k++) {
					s += l._value[i * n + k] * l._value[j * n + k]
				}
				l._value[i * n + j] = (this._value[i * n + j] - s) / l._value[j * n + j]
			}
		}
		return l
	}

	/**
	 * Returns a modified cholosky decomposition.
	 * @returns {[Matrix<number>, number[]]} Cholesky decomposition matrix and diagonal matrix
	 */
	modifiedCholesky() {
		if (!this.isSymmetric(1.0e-15)) {
			throw new MatrixException('Modified cholesky decomposition only define symmetric matrix.', this)
		}
		const n = this.rows
		const d = []
		const l = Matrix.eye(n, n)
		for (let i = 0; i < n; i++) {
			d[i] = this._value[i * n + i]
			for (let j = 0; j < i; j++) {
				let s = 0
				for (let k = 0; k < j; k++) {
					s += l._value[i * n + k] * l._value[j * n + k] * d[k]
				}
				l._value[i * n + j] = (this._value[i * n + j] - s) / d[j]
				d[i] -= l._value[i * n + j] ** 2 * d[j]
			}
		}
		return [l, d]
	}

	/**
	 * Returns schur decomposition.
	 * @returns {[Matrix<number>, Matrix<number>]} Schur decomposition matrix
	 */
	schur() {
		if (!this.isSquare()) {
			throw new MatrixException('Schur decomposition only define square matrix.', this)
		}
		return this.schurQR()
	}

	/**
	 * Returns schur decomposition by QR decomposition.
	 * @param {'no' | 'single'} [shift] Shifting type
	 * @returns {[Matrix<number>, Matrix<number>]} Schur decomposition matrix
	 */
	schurQR(shift = 'single') {
		if (!this.isSquare()) {
			throw new MatrixException('Schur decomposition only define square matrix.', this)
		}
		const n = this.rows
		let h = this.copy()
		const u = []
		for (let k = 0; k < n - 2; k++) {
			const x = h.block(k + 1, k)
			const uk = x.col(0)
			const alpha = uk.norm() * Math.sign(uk._value[0])
			uk._value[0] -= alpha
			const norm = uk.norm()
			uk.div(norm === 0 ? 1 : norm)

			x.sub(Matrix.mult(2, uk.dot(uk.tDot(x))))
			h.set(k + 1, k, x)
			const y = h.slice(k + 1, n, 1)
			y.sub(Matrix.mult(2, y.dot(uk).dot(uk.t)))
			h.set(0, k + 1, y)
			u[k] = uk
		}
		let U = Matrix.eye(n, n)
		for (let k = n - 3; k >= 0; k--) {
			const x = U.block(k + 1, k + 1)
			x.sub(Matrix.mult(2, u[k].dot(u[k].tDot(x))))
			U.set(k + 1, k + 1, x)
		}
		const tol = 1.0e-8
		for (let m = n - 1; m > 0; m--) {
			let maxCount = 1.0e4
			while (maxCount-- > 0) {
				const am = h.block(n - 2, n - 2).eigenValues()
				if (shift === 'no') {
					const [q, r] = h.qr()
					h = r.dot(q)
					U = U.dot(q)
				} else if (shift === 'single') {
					const rb = h.at(n - 1, n - 1)
					let d = Math.abs(am[0] - rb) < Math.abs(am[1] - rb) ? am[0] : am[1]
					if (isNaN(d)) {
						d = h.at(m, m)
					}

					for (let i = 0; i < n; i++) {
						h._value[i * n + i] -= d
					}
					const [q, r] = h.qr()
					h = r.dot(q)
					for (let i = 0; i < n; i++) {
						h._value[i * n + i] += d
					}
					U = U.dot(q)
				}
				if (Math.abs(h.at(m, m - 1)) < tol) {
					break
				}
			}
		}
		return [U, h]
	}

	/**
	 * Returns rank factorization.
	 * @returns {[Matrix<number>, Matrix<number>]} Rank factorization matrix
	 */
	rankFactorization() {
		const b = this.copy()
		b.reducedRowEchelonForm(1.0e-8)
		const pivot = []
		let i = 0
		for (let j = 0; j < this.cols; j++) {
			if (b.at(i, j) > 0) {
				pivot.push(j)
				i++
			}
		}
		return [this.col(pivot), b.slice(0, pivot.length, 0)]
	}

	/**
	 * Returns eigenvalues and eigenvectors.
	 * @returns {[number[], Matrix<number>]} Eigenvalues and eigenvectors. Eigenvectors correspond to each column of the matrix.
	 */
	eigen() {
		if (!this.isSquare()) {
			throw new MatrixException('Eigen values only define square matrix.', this)
		}
		if (this.rows >= 2 && this.isZero()) {
			const ev = Array(this.rows).fill(0)
			ev[0] = 1
			const evec = Matrix.eye(this.rows, this.rows)
			evec.set(0, 0, 0)
			return [ev, evec]
		}
		if (this.rows <= 2) {
			return [this.eigenValues(), this.eigenVectors()]
		}
		if (this.isSymmetric(1.0e-15)) {
			return this.eigenJacobi()
		} else {
			const ev = this.eigenValues()
			const n = this.rows
			const evec = new Matrix(n, n)
			for (let i = 0; i < n; i++) {
				const [, y] = this.eigenInverseIteration(ev[i])
				for (let j = 0; j < n; j++) {
					evec._value[j * n + i] = y._value[j]
				}
			}
			return [ev, evec]
		}
	}

	/**
	 * Returns eigenvalues.
	 * @returns {number[]} Eigenvalues
	 */
	eigenValues() {
		if (!this.isSquare()) {
			throw new MatrixException('Eigen values only define square matrix.', this)
		}
		if (this.rows >= 2 && this.isZero()) {
			const ev = Array(this.rows).fill(0)
			ev[0] = 1
			return ev
		}
		switch (this.rows) {
			case 0:
				return []
			case 1:
				return [this._value[0]]
			case 2: {
				const p = this._value[0] + this._value[3]
				const q = Math.sqrt(p ** 2 - 4 * this.det())
				return [(p + q) / 2, (p - q) / 2]
			}
			case 3: {
				const a0 = -this.det()
				const a1 =
					this._value[0] * this._value[4] +
					this._value[0] * this._value[8] +
					this._value[4] * this._value[8] -
					this._value[5] * this._value[7] -
					this._value[2] * this._value[6] -
					this._value[1] * this._value[3]
				const a2 = -this._value[0] - this._value[4] - this._value[8]

				const p = a1 - a2 ** 2 / 3
				const q = a0 - (a1 * a2) / 3 + (a2 ** 3 * 2) / 27
				const t = (q / 2) ** 2 + (p / 3) ** 3

				let [u3, v3] = new Complex(t).sqrt()
				u3 = u3.add(-q / 2)
				v3 = v3.add(-q / 2)

				const [u0, u1, u2] = u3.cbrt()
				const [v0, v1, v2] = v3.cbrt()

				const e0 = u0.add(v0)
				const e1 = u1.add(v2)
				const e2 = u2.add(v1)

				const e = [e0, e1, e2].map(e => (Math.abs(e.imaginary) < 1.0e-12 ? e.real - a2 / 3 : Number.NaN))
				e.sort((a, b) => b - a)
				return e
			}
			case 4: {
				const a0 = this.det()
				const a1 =
					-this._value[0] * this._value[5] * this._value[10] -
					this._value[0] * this._value[5] * this._value[15] -
					this._value[0] * this._value[10] * this._value[15] -
					this._value[5] * this._value[10] * this._value[15] +
					this._value[0] * this._value[11] * this._value[14] +
					this._value[0] * this._value[7] * this._value[13] +
					this._value[0] * this._value[6] * this._value[9] +
					this._value[5] * this._value[11] * this._value[14] +
					this._value[3] * this._value[5] * this._value[12] +
					this._value[2] * this._value[5] * this._value[8] +
					this._value[7] * this._value[10] * this._value[13] +
					this._value[3] * this._value[10] * this._value[12] +
					this._value[1] * this._value[4] * this._value[10] +
					this._value[6] * this._value[9] * this._value[15] +
					this._value[2] * this._value[8] * this._value[15] +
					this._value[1] * this._value[4] * this._value[15] -
					this._value[6] * this._value[11] * this._value[13] -
					this._value[7] * this._value[9] * this._value[14] -
					this._value[2] * this._value[11] * this._value[12] -
					this._value[3] * this._value[8] * this._value[14] -
					this._value[1] * this._value[7] * this._value[12] -
					this._value[3] * this._value[4] * this._value[13] -
					this._value[1] * this._value[6] * this._value[8] -
					this._value[2] * this._value[4] * this._value[9]
				const a2 =
					this._value[0] * this._value[5] +
					this._value[0] * this._value[10] +
					this._value[0] * this._value[15] +
					this._value[5] * this._value[10] +
					this._value[5] * this._value[15] +
					this._value[10] * this._value[15] -
					this._value[7] * this._value[13] -
					this._value[6] * this._value[9] -
					this._value[11] * this._value[14] -
					this._value[1] * this._value[4] -
					this._value[2] * this._value[8] -
					this._value[3] * this._value[12]
				const a3 = -this.trace()

				const cbrt2 = Math.cbrt(2)
				const v3 = -(a3 ** 3) + 4 * a2 * a3 - 8 * a1
				const v5 = a2 ** 2 - 3 * a1 * a3 + 12 * a0
				const v6 = 2 * a2 ** 3 - 9 * a1 * a2 * a3 + 27 * a0 * a3 ** 2 + 27 * a1 ** 2 - 72 * a0 * a2
				const v7 = -4 * v5 ** 3 + v6 ** 2
				const v8 = new Complex(v7).sqrt()[0].add(v6)
				const cbrtv8 = v8.cbrt()[0]
				const v4 = new Complex(a3 ** 2 / 4 - (2 * a2) / 3)
					.add(new Complex((cbrt2 * v5) / 3).div(cbrtv8))
					.add(cbrtv8.div(3 * cbrt2))
				const sqrtv4 = v4.sqrt()
				const vt1 = new Complex(a3 ** 2 / 2 - (4 * a2) / 3)
					.sub(new Complex((cbrt2 * v5) / 3).div(cbrtv8))
					.sub(cbrtv8.div(3 * cbrt2))
				const v2 = vt1.add(new Complex(v3 / 4).div(sqrtv4[1]))
				const v1 = vt1.add(new Complex(v3 / 4).div(sqrtv4[0]))

				const sqrtv2 = v2.sqrt()
				const sqrtv1 = v1.sqrt()
				const x1 = new Complex(-a3 / 4).add(sqrtv2[0].div(2)).add(sqrtv4[1].div(2))
				const x2 = new Complex(-a3 / 4).add(sqrtv2[1].div(2)).add(sqrtv4[1].div(2))
				const x3 = new Complex(-a3 / 4).add(sqrtv1[0].div(2)).add(sqrtv4[0].div(2))
				const x4 = new Complex(-a3 / 4).add(sqrtv1[1].div(2)).add(sqrtv4[0].div(2))

				const e = [x1, x2, x3, x4].map(e => (Math.abs(e.imaginary) < 1.0e-12 ? e.real : Number.NaN))
				e.sort((a, b) => b - a)
				return e
			}
		}

		if (this.isSymmetric(1.0e-15)) {
			return this.eigenJacobi()[0]
		} else {
			return this.eigenValuesQR()
		}
	}

	/**
	 * Returns eigenvectors.
	 * @returns {Matrix<number>} Eigenvectors. Eigenvectors correspond to each column of the matrix.
	 */
	eigenVectors() {
		if (!this.isSquare()) {
			throw new MatrixException('Eigen vectors only define square matrix.', this)
		}

		if (this.rows >= 2 && this.isZero()) {
			const evec = Matrix.eye(this.rows, this.rows)
			evec.set(0, 0, 0)
			return evec
		}
		switch (this.rows) {
			case 0:
				return this
			case 1:
				return new Matrix(1, 1, [1])
			case 2: {
				const ev = this.eigenValues()
				const v0 = [-this._value[1], this._value[0] - ev[0]]
				const v0d = Math.sqrt(v0[0] ** 2 + v0[1] ** 2)
				const v1 = [-this._value[1], this._value[0] - ev[1]]
				const v1d = Math.sqrt(v1[0] ** 2 + v1[1] ** 2)
				return new Matrix(2, 2, [v0[0] / v0d, v1[0] / v1d, v0[1] / v0d, v1[1] / v1d])
			}
		}

		return this.eigen()[1]
	}

	/**
	 * Returns eigenvalues by Bi-section.
	 * @returns {number[]} Eigenvalues
	 */
	eigenValuesBiSection() {
		if (!this.isSymmetric(1.0e-15)) {
			throw new MatrixException('eigenValuesBiSection can only use symmetric matrix.', this)
		}
		const t = this.tridiag()
		const n = this.rows
		let r = 0
		for (let i = 0; i < n; i++) {
			const ri =
				Math.abs(t.at(i, i)) + Math.abs(i > 0 ? t.at(i, i - 1) : 0) + Math.abs(i < n - 1 ? t.at(i, i + 1) : 0)
			if (r < ri) {
				r = ri
			}
		}

		const sturm = l => {
			const p = [1, l - t.at(0, 0)]
			for (let i = 1; i < n; i++) {
				p[i + 1] = (l - t.at(i, i)) * p[i] - t.at(i, i - 1) ** 2 * p[i - 1]
			}
			let c = 0
			for (let i = 1; i < p.length; i++) {
				if (Math.sign(p[i - 1]) !== Math.sign(p[i])) {
					c++
				}
			}
			return c
		}

		const e = []
		for (let i = 1; i <= n; i++) {
			let a = -r
			let na = sturm(a)
			let b = r

			while (Math.abs(a - b) > 1.0e-8) {
				const c = (a + b) / 2
				const nc = sturm(c)

				if (i <= na && i > nc) {
					b = c
				} else {
					a = c
					na = nc
				}
			}

			e.push((a + b) / 2)
		}

		return e
	}

	/**
	 * Returns eigenvalues by LU decomposition.
	 * @param {number} [maxIteration] Maximum iteration
	 * @returns {number[]} Eigenvalues
	 */
	eigenValuesLR(maxIteration = 1.0e5) {
		if (!this.isSquare()) {
			throw new MatrixException('Eigen values only define square matrix.', this)
		}

		let a = this
		const n = a.rows
		const tol = 1.0e-15
		let maxCount = maxIteration
		while (maxCount-- > 0) {
			const [l, u] = a.lu()
			a = u.dot(l)

			let e = 0
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i; j++) {
					e += a._value[i * n + j] ** 2
				}
			}
			if (e < tol) {
				const ev = a.diag()
				ev.sort((a, b) => b - a)
				return ev
			}
		}
		throw new MatrixException('eigenValuesLR not converged.', this)
	}

	/**
	 * Returns eigenvalues by QR decomposition.
	 * @param {number} [maxIteration] Maximum iteration
	 * @returns {number[]} Eigenvalues
	 */
	eigenValuesQR(maxIteration = 1.0e6) {
		if (!this.isSquare()) {
			throw new MatrixException('Eigen values only define square matrix.', this)
		}

		let a = this.copy()
		const ev = []
		const tol = 1.0e-8
		for (let n = a.rows; n > 2; n--) {
			let maxCount = maxIteration
			while (1) {
				const am = a.block(n - 2, n - 2).eigenValues()
				if (isNaN(am[0])) {
					ev.sort((a, b) => b - a)
					for (let i = 0; i < n; i++, ev.push(NaN));
					return ev
				}
				const rb = a._value[a._value.length - 1]
				const m = Math.abs(am[0] - rb) < Math.abs(am[1] - rb) ? am[0] : am[1]
				for (let i = 0; i < n; i++) {
					a._value[i * n + i] -= m
				}
				const [q, r] = a.qr()
				a = r.dot(q)
				for (let i = 0; i < n; i++) {
					a._value[i * n + i] = a._value[i * n + i] + m
				}

				let e = 0
				for (let j = (n - 1) * n; j < a.length - 1; j++) {
					e += Math.abs(a._value[j])
				}
				if (e < tol) {
					break
				} else if (maxCount-- < 0) {
					throw new MatrixException('eigenValuesQR not converged.', this)
				}
			}
			ev.push(a._value[a._value.length - 1])
			a.resize(n - 1, n - 1)
		}
		const ev2 = a.eigenValues()
		ev.push(...ev2)
		ev.sort((a, b) => b - a)
		return ev
	}

	/**
	 * Returns eigenvalues and eigenvectors.
	 * @param {number} [maxIteration] Maximum iteration
	 * @returns {[number[], Matrix<number>]} Eigenvalues and eigenvectors. Eigenvectors correspond to each column of the matrix.
	 */
	eigenJacobi(maxIteration = 1.0e6) {
		if (!this.isSymmetric(1.0e-15)) {
			throw new MatrixException('Jacobi method can only use symmetric matrix.', this)
		}
		const a = this._value.concat()
		const P = Matrix.eye(this.rows, this.cols)
		P.add(0)
		const tol = 1.0e-15
		const recentMaxValues = [0]
		const n = this.rows
		const length = this.length
		let maxCount = maxIteration
		while (1) {
			let maxValue = 0
			let p = 0,
				q = 0
			for (let i = 0; i < n; i++) {
				for (let j = i + 1; j < n; j++) {
					const v = Math.abs(a[i * n + j])
					if (v > maxValue) {
						maxValue = v
						p = i
						q = j
					}
				}
			}
			if (maxValue < tol) {
				break
			} else if (maxCount-- < 0) {
				console.log(new MatrixException('eigenJacobi not converged.', [this, maxValue]))
				break
			}
			if (maxIteration - maxCount > length / 2 && recentMaxValues.length >= 12) {
				const avg = recentMaxValues.reduce((s, v) => s + v, 0)
				const navg = avg - recentMaxValues.pop() + maxValue
				if (Math.abs(avg - navg) / recentMaxValues.length < tol) {
					break
				}
				recentMaxValues.pop()
			}
			recentMaxValues.unshift(maxValue)
			const app = a[p * n + p]
			const apq = a[p * n + q]
			const aqq = a[q * n + q]

			const alpha = (app - aqq) / 2
			const beta = -apq
			const gamma = Math.abs(alpha) / Math.sqrt(alpha ** 2 + beta ** 2)
			let s = Math.sqrt((1 - gamma) / 2)
			const c = Math.sqrt((1 + gamma) / 2)
			if (alpha * beta < 0) s = -s

			for (let i = 0; i < n; i++) {
				const pni = a[p * n + i]
				const qni = a[q * n + i]
				a[i * n + q] = a[q * n + i] = s * pni + c * qni
				a[i * n + p] = a[p * n + i] = c * pni - s * qni
			}

			a[p * n + p] = c ** 2 * app + s ** 2 * aqq - 2 * s * c * apq
			a[p * n + q] = a[q * n + p] = s * c * (app - aqq) + (c ** 2 - s ** 2) * apq
			a[q * n + q] = s ** 2 * app + c ** 2 * aqq + 2 * s * c * apq

			for (let i = 0; i < n; i++) {
				const inp = P._value[i * n + p]
				const inq = P._value[i * n + q]
				P._value[i * n + q] = s * inp + c * inq
				P._value[i * n + p] = c * inp - s * inq
			}
		}
		const enumedEv = []
		for (let i = 0; i < n; i++) {
			enumedEv.push([i, a[i * n + i]])
		}
		enumedEv.sort((a, b) => b[1] - a[1])
		const sortP = P.col(enumedEv.map(v => v[0]))
		return [enumedEv.map(v => v[1]), sortP]
	}

	/**
	 * Returns the maximum eigenvalue and its eigenvector.
	 * @param {number} [maxIteration] Maximum iteration
	 * @returns {[number, Matrix<number>]} Maximum eigenvalue and its eigenvector
	 */
	eigenPowerIteration(maxIteration = 1.0e4) {
		if (!this.isSquare()) {
			throw new MatrixException('Eigen vectors only define square matrix.', this)
		}

		const n = this.rows
		const tol = 1.0e-15
		let px = Matrix.randn(n, 1)
		px.div(px.norm())
		let pl = Infinity
		let maxCount = maxIteration
		while (maxCount-- > 0) {
			const x = this.dot(px)
			let lnum = 0,
				lden = 0
			for (let i = 0; i < n; i++) {
				lnum += x._value[i] ** 2
				lden += x._value[i] * px._value[i]
			}
			const l = lnum / lden
			x.div(x.norm())
			const e = Math.abs(l - pl)
			if (e < tol || isNaN(e)) {
				return [l, x]
			}
			px = x
			pl = l
		}
		throw new MatrixException('eigenPowerIteration not converged.', this)
	}

	/**
	 * Returns the k highest eigenvalues and its eigenvectors.
	 * @param {number} k Number of calculated eigenvalues
	 * @param {number} [maxIteration] Maximum iteration
	 * @returns {[number[], Matrix<number>]} The k highest eigenvalues and its eigenvectors. Eigenvectors correspond to each column of the matrix.
	 */
	eigenSimultaneousIteration(k, maxIteration = 1.0e4) {
		if (!this.isSymmetric(1.0e-15)) {
			throw new MatrixException('Simultaneous iteration method can only use symmetric matrix.', this)
		}

		const n = this.rows
		const tol = 1.0e-8
		let px = Matrix.ones(n, k)
		px.div(px.norm())
		let pl = new Matrix(1, k, Infinity)
		const r0 = this.row(0)
		let maxCount = maxIteration
		while (maxCount-- > 0) {
			const x = this.dot(px)
			const [q] = x.qr()
			q.resize(q.rows, k)
			let ev = r0.dot(q)
			ev.div(q.row(0))
			pl.sub(ev)
			const e = pl.reduce((s, v) => s + Math.abs(v), 0) / k
			if (e < tol || isNaN(e)) {
				return [ev.value, q]
			}
			px = q
			pl = ev
		}
		throw new MatrixException('eigenSimultaneousIteration not converged.', this)
	}

	/**
	 * Returns the nearest eigenvalue and its eigenvector to the specified value.
	 * @param {number} [ev] Target value
	 * @param {number} [maxIteration] Maximum iteration
	 * @returns {[number, Matrix<number>]} Eigenvalue and eigenvector
	 */
	eigenInverseIteration(ev = 0.0, maxIteration = 1.0e4) {
		if (!this.isSquare()) {
			throw new MatrixException('Eigen vectors only define square matrix.', this)
		}

		const n = this.rows
		const tol = 1.0e-15
		let a = this.copy()
		for (let i = 0; i < n; i++) {
			a._value[i * n + i] = a._value[i * n + i] - ev + 1.0e-15
		}
		a = a.inv()
		let py = Matrix.randn(n, 1)
		py.div(py.norm())
		let pl = Infinity
		let maxCount = maxIteration
		while (maxCount-- > 0) {
			const y = a.dot(py)
			let lnum = 0,
				lden = 0
			for (let i = 0; i < n; i++) {
				lnum += y._value[i] ** 2
				lden += py._value[i] * y._value[i]
			}
			const l = lden / lnum
			y.div(y.norm())
			const e = Math.abs(l - pl)
			if (e < tol || isNaN(e)) {
				return [l + ev, y]
			}
			py = y
			pl = l
		}
		throw new MatrixException('eigenInverseIteration not converged.', this)
	}
}
