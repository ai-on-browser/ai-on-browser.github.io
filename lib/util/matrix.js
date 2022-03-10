import Complex from './complex.js'

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
	 * @param message
	 * @param value
	 */
	constructor(message, value) {
		super(message)
		this.value = value
		this.name = 'MatrixException'
	}
}

/**
 * Matrix class
 */
export default class Matrix {
	/**
	 * @param {number} rows Number of rows
	 * @param {number} cols Number of columns
	 * @param {number | Array<number> | Array<Array<number>>} [values] Initial values
	 */
	constructor(rows, cols, values) {
		if (!values) {
			this._value = Array(rows * cols).fill(0)
		} else if (!Array.isArray(values)) {
			this._value = Array(rows * cols).fill(values)
		} else if (Array.isArray(values[0])) {
			this._value = values.flat()
		} else {
			this._value = values
		}
		this._size = [rows, cols]
	}

	/**
	 * Returns a matrix filled with 0.
	 *
	 * @param {number} rows Number of rows
	 * @param {number} cols Number of columns
	 * @returns {Matrix}
	 */
	static zeros(rows, cols) {
		return new Matrix(rows, cols, Array(rows * cols).fill(0))
	}

	/**
	 * Returns a matrix filled with 1.
	 *
	 * @param {number} rows Number of rows
	 * @param {number} cols Number of columns
	 * @returns {Matrix}
	 */
	static ones(rows, cols) {
		return new Matrix(rows, cols, Array(rows * cols).fill(1))
	}

	/**
	 * Returns a identity matrix.
	 *
	 * @param {number} rows Number of rows
	 * @param {number} cols Number of columns
	 * @param {number} [init=1] Diagonal values
	 * @returns {Matrix}
	 */
	static eye(rows, cols, init = 1) {
		const mat = new Matrix(rows, cols)
		const rank = Math.min(rows, cols)
		for (let i = 0; i < rank; i++) {
			mat._value[i * cols + i] = init
		}
		return mat
	}

	/**
	 * Returns a matrix initialized uniform random values.
	 *
	 * @param {number} rows Number of rows
	 * @param {number} cols Number of columns
	 * @param {number} [min=0] Minimum value of the Matrix
	 * @param {number} [max=1] Maximum value of the Matrix
	 * @returns {Matrix}
	 */
	static random(rows, cols, min = 0, max = 1) {
		const mat = new Matrix(rows, cols)
		for (let i = 0; i < mat.length; i++) {
			mat._value[i] = Math.random() * (max - min) + min
		}
		return mat
	}

	/**
	 * Returns a matrix initialized normal random values.
	 *
	 * @param {number} rows Number of rows
	 * @param {number} cols Number of columns
	 * @param {number | number[]} [myu=0] Mean value(s) of each columns
	 * @param {number | Array<Array<number>>} [sigma=1] Variance value or covariance matrix of each columns
	 * @returns {Matrix}
	 */
	static randn(rows, cols, myu = 0, sigma = 1) {
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
	 *
	 * @param {(number | Matrix)[]} d Diagonal values
	 * @returns {Matrix}
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
	 *
	 * @param {Matrix | Array<Array<number>> | Array<number> | number} arr
	 * @returns {Matrix}
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
	 *
	 * @type {number}
	 */
	get dimension() {
		return this._size.length
	}

	/**
	 * Sizes of the matrix.
	 *
	 * @type {number[]}
	 */
	get sizes() {
		return this._size
	}

	/**
	 * Number of all elements in the matrix.
	 *
	 * @type {number}
	 */
	get length() {
		return this._size[0] * this._size[1]
	}

	/**
	 * Number of rows of the matrix.
	 *
	 * @type {number}
	 */
	get rows() {
		return this._size[0]
	}

	/**
	 * Number of columns of the matrix.
	 *
	 * @type {number}
	 */
	get cols() {
		return this._size[1]
	}

	/**
	 * Elements in the matrix.
	 *
	 * @type {number[]}
	 */
	get value() {
		return this._value
	}

	/**
	 * Transpose matrix.
	 *
	 * @type {Matrix}
	 */
	get t() {
		return this.transpose()
	}

	/**
	 * Iterate over the elements.
	 *
	 * @yields {number}
	 */
	*[Symbol.iterator]() {
		yield* this._value
	}

	/**
	 * Returns a nested array represented this matrix.
	 *
	 * @returns {Array<Array<number>>} Nested array
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
	 *
	 * @returns {number}
	 */
	toScaler() {
		if (this.rows !== 1 || this.cols !== 1) {
			throw new MatrixException('The matrix cannot convert to scaler.')
		}
		return this._value[0]
	}

	/**
	 * Returns a string represented this matrix.
	 *
	 * @returns {string}
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

	/**
	 * Returns a copy of this matrix.
	 *
	 * @param {Matrix} [dst]
	 * @returns {Matrix}
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
	 *
	 * @param {*} other
	 * @param {number} [tol=0] Tolerance to be recognized as the same
	 * @returns {boolean}
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
	 *
	 * @param  {number | [number, number]} r
	 * @param  {number} [c]
	 * @returns {number}
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
	 *
	 * @param  {number | [number, number]} r If this value is an array, the next argument should be the value to be set
	 * @param  {number | Matrix} c
	 * @param  {number | Matrix} [value]
	 * @returns {number=} Old value
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
	 *
	 * @param {number | number[] | boolean[]} r Indexes of rows, or an array of boolean values where the row to be selected is true.
	 * @returns {Matrix}
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
	 *
	 * @param {number | number[] | boolean[]} c Indexes of columns, or an array of boolean values where the column to be selected is true.
	 * @returns {Matrix}
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
	 *
	 * @param {number} from
	 * @param {number} to
	 * @param {number} [axis=0]
	 * @returns {Matrix}
	 */
	slice(from, to, axis = 0) {
		if (typeof from !== 'number') {
			from = 0
		}
		if (typeof to !== 'number') {
			to = this._size[axis]
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
	 *
	 * @param {number} [rows_from=0] Start row index
	 * @param {number} [cols_from=0] Start column index
	 * @param {number} [rows_to] End row index(exclusive)
	 * @param {number} [cols_to] End column index(exclusive)
	 * @returns {Matrix}
	 */
	block(rows_from, cols_from, rows_to, cols_to) {
		if (typeof rows_from !== 'number') {
			rows_from = 0
		}
		if (typeof cols_from !== 'number') {
			cols_from = 0
		}
		const mat = new Matrix((rows_to || this.rows) - rows_from, (cols_to || this.cols) - cols_from)
		for (let i = 0; i < mat.rows; i++) {
			for (let j = 0; j < mat.cols; j++) {
				mat._value[i * mat.cols + j] = this._value[(i + rows_from) * this.cols + j + cols_from]
			}
		}
		return mat
	}

	/**
	 * Remove specified indexes.
	 *
	 * @param {number | number[]} idx
	 * @param {number} [axis=0]
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
	 *
	 * @param {function (Matrix): boolean} cond
	 * @param {number} [axis=0]
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
	 *
	 * @param {number} n
	 * @param {number} [axis=0]
	 * @returns {[Matrix, number[]]}
	 */
	sample(n, axis = 0) {
		const k = this.sizes[axis]
		const idx = []
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
	 *
	 * @param {number} value
	 */
	fill(value) {
		this._value.fill(value)
	}

	/**
	 * Iterate over all the elements and replace the value.
	 *
	 * @param {function (number, number[], Matrix): number} cb
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
	 *
	 * @param {Matrix} mat
	 * @param {function (number, number[], Matrix): number} cb
	 * @returns {Matrix}
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
	 *
	 * @param {function (number, number[], Matrix): number} cb
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
	 *
	 * @returns {Matrix}
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
	 *
	 * @returns {Matrix}
	 */
	adjoint() {
		return this.transpose()
	}

	/**
	 * Flip values along the axis.
	 *
	 * @param {number} [axis=0]
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
	 *
	 * @param {number} a
	 * @param {number} b
	 * @param {number} [axis=0]
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
	 *
	 * @param {number} [axis=0]
	 * @returns {number[]} Original index.
	 */
	sort(axis = 0) {
		if (axis === 0) {
			const p = []
			for (let i = 0; i < this.rows; p.push(i++));
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
			const p = []
			for (let i = 0; i < this.cols; p.push(i++));
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
	 *
	 * @param {number} [axis=0]
	 * @returns {number[]} Original index.
	 */
	shuffle(axis = 0) {
		const idx = []
		for (let i = 0; i < this._size[axis]; i++) {
			idx[i] = i
		}
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
	 *
	 * @param {number} [axis=0]
	 * @param {number} [tol=0]
	 * @returns {number[]}
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
	 *
	 * @param {number} rows
	 * @param {number} cols
	 * @param {number} [init=0] Value of the extended region\
	 */
	resize(rows, cols, init = 0) {
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
	 *
	 * @param {Matrix} mat
	 * @param {number} rows
	 * @param {number} cols
	 * @param {number} [init=0]
	 * @returns {Matrix}
	 */
	static resize(mat, rows, cols, init = 0) {
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
	 *
	 * @param {number} rows
	 * @param {number} cols
	 */
	reshape(rows, cols) {
		if (this.length !== rows * cols) throw new MatrixException('Length is different.')
		this._size = [rows, cols]
	}

	/**
	 * Repeat the elements n times along the axis this.
	 *
	 * @param {number | number[]} n
	 * @param {number} [axis=0]
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
	 *
	 * @param {Matrix} mat
	 * @param {number | number[]} n
	 * @param {number} [axis=0]
	 * @returns {Matrix}
	 */
	static repeat(mat, n, axis = 0) {
		const r = mat.copy()
		r.repeat(n, axis)
		return r
	}

	/**
	 * Concatinate this and m.
	 *
	 * @param {Matrix} m
	 * @param {number} [axis=0]
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
	 * Returns a matrix concatinated this and m.
	 *
	 * @param {Matrix} a
	 * @param {Matrix} b
	 * @param {number} [axis=0]
	 * @returns {Matrix}
	 */
	static concat(a, b, axis = 0) {
		const r = a.copy()
		r.concat(b, axis)
		return r
	}

	/**
	 * Returns a matrix reduced along the axis with the callback function.
	 *
	 * @param {function (number, number, number[], Matrix): number} cb
	 * @param {*} [init]
	 * @param {number} [axis=-1] If negative, reduce along all elements.
	 * @returns {Matrix | number}
	 */
	reduce(cb, init, axis = -1) {
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
			return v
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
	 *
	 * @param {function (number, number[], Matrix): number} cb
	 * @param {number} [axis=-1]
	 * @returns {boolean | Matrix}
	 */
	every(cb, axis = -1) {
		return this.reduce((f, v, i, m) => f && cb(v, i, m), true, axis)
	}

	/**
	 * Determines whether the specified callback function returns true for any element of a matrix.
	 *
	 * @param {function (number, number[], Matrix): number} cb
	 * @param {number} [axis=-1]
	 * @returns {boolean | Matrix}
	 */
	some(cb, axis = -1) {
		return this.reduce((f, v, i, m) => f || cb(v, i, m), false, axis)
	}

	/**
	 * Returns maximum values along the axis.
	 *
	 * @param {number} [axis=-1] If negative, returns the maximum value of the all element.
	 * @returns {Matrix | number}
	 */
	max(axis = -1) {
		if (axis < 0) {
			let m = -Infinity
			for (let i = this.length - 1; i >= 0; i--) {
				m = Math.max(m, this._value[i])
			}
			return m
		}
		const amax = this.argmax(axis)
		let v_step = axis === 0 ? 1 : this.cols
		let s_step = axis === 0 ? this.cols : 1
		amax._value = amax._value.map((v, i) => this._value[v * s_step + i * v_step])
		return amax
	}

	/**
	 * Returns minimum values along the axis.
	 *
	 * @param {number} [axis=-1] If negative, returns the minimum value of the all element.
	 * @returns {Matrix | number}
	 */
	min(axis = -1) {
		if (axis < 0) {
			let m = Infinity
			for (let i = this.length - 1; i >= 0; i--) {
				m = Math.min(m, this._value[i])
			}
			return m
		}
		const amin = this.argmin(axis)
		let v_step = axis === 0 ? 1 : this.cols
		let s_step = axis === 0 ? this.cols : 1
		amin._value = amin._value.map((v, i) => this._value[v * s_step + i * v_step])
		return amin
	}

	/**
	 * Returns medians along the axis.
	 *
	 * @param {number} [axis=-1] If negative, returns a median of the all element.
	 * @returns {Matrix | number}
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
	 * Returns quantile values along the axis.
	 *
	 * @param {number} q
	 * @param {number} [axis=-1] If negative, returns the quantile value of the all element.
	 * @returns {Matrix | number}
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
	 *
	 * @param {number} axis
	 * @returns {Matrix}
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
	 *
	 * @param {number} axis
	 * @returns {Matrix}
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
	 * Returns summation values along the axis.
	 *
	 * @param {number} [axis=-1] If negative, returns a summation value of the all element.
	 * @returns {Matrix | number}
	 */
	sum(axis = -1) {
		if (axis < 0) {
			return this._value.reduce((acc, v) => acc + v, 0)
		}
		let v_step = axis === 0 ? 1 : this.cols
		let s_step = axis === 0 ? this.cols : 1
		const new_size = [].concat(this._size)
		new_size[axis] = 1
		const mat = Matrix.zeros(...new_size)
		for (let n = 0, nv = 0; n < mat.length; n++, nv += v_step) {
			let v = 0
			for (let i = 0; i < this._size[axis]; i++) {
				v += this._value[i * s_step + nv]
			}
			mat._value[n] = v
		}
		return mat
	}

	/**
	 * Returns means along the axis.
	 *
	 * @param {number} [axis=-1] If negative, returns a mean value of the all element.
	 * @returns {Matrix | number}
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
	 * Returns producted values along the axis.
	 *
	 * @param {number} [axis=-1] If negative, returns a producted value of the all element.
	 * @returns {Matrix | number}
	 */
	prod(axis = -1) {
		if (axis < 0) {
			return this._value.reduce((acc, v) => acc * v, 1)
		}
		let v_step = axis === 0 ? 1 : this.cols
		let s_step = axis === 0 ? this.cols : 1
		const new_size = [].concat(this._size)
		new_size[axis] = 1
		const mat = Matrix.zeros(...new_size)
		for (let n = 0, nv = 0; n < mat.length; n++, nv += v_step) {
			let v = 1
			for (let i = 0; i < this._size[axis]; i++) {
				v *= this._value[i * s_step + nv]
			}
			mat._value[n] = v
		}
		return mat
	}

	/**
	 * Returns variances along the axis.
	 *
	 * @param {number} [axis=-1] If negative, returns a variance of the all element.
	 * @param {number} [ddof=0]
	 * @returns {Matrix | number}
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
	 * Returns standard deviations along the axis.
	 *
	 * @param {number} [axis=-1] If negative, returns a standard deviation of the all element.
	 * @param {number} [ddof=0]
	 * @returns {Matrix | number}
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
	 *
	 * @returns {boolean}
	 */
	isSquare() {
		return this.rows === this.cols
	}

	/**
	 * Returns if this is diagonal matrix or not.
	 *
	 * @param {number} [tol=0] Tolerance to be recognized as 0
	 * @returns {boolean}
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
	 *
	 * @param {number} [tol=0] Tolerance to be recognized as 0 or 1
	 * @returns {boolean}
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
	 *
	 * @param {number} [tol=0] Tolerance to be recognized as 0
	 * @returns {boolean}
	 */
	isZero(tol = 0) {
		const c = this.cols
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < c; j++) {
				if (Math.abs(this._value[i * c + j]) > tol) return false
			}
		}
		return true
	}

	/**
	 * Returns if this is triangular matrix or not.
	 *
	 * @param {number} [tol=0] Tolerance to be recognized as 0
	 * @returns {boolean}
	 */
	isTriangular(tol = 0) {
		return this.isLowerTriangular(tol) || this.isUpperTriangular(tol)
	}

	/**
	 * Returns if this is lower triangular matrix or not.
	 *
	 * @param {number} [tol=0] Tolerance to be recognized as 0
	 * @returns {boolean}
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
	 *
	 * @param {number} [tol=0] Tolerance to be recognized as 0
	 * @returns {boolean}
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
	 *
	 * @param {number} [tol=0] Tolerance to be recognized as the same
	 * @returns {boolean}
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
	 *
	 * @param {number} [tol=0] Tolerance to be recognized as the same
	 * @returns {boolean}
	 */
	isHermitian(tol = 0) {
		return this.isSymmetric(tol)
	}

	/**
	 * Returns if this is alternating matrix or not.
	 *
	 * @param {number} [tol=0] Tolerance within which sign-reversed values are recognized as the same
	 * @returns {boolean}
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
	 *
	 * @param {number} [tol=0] Tolerance within which sign-reversed values are recognized as the same
	 * @returns {boolean}
	 */
	isSkewHermitian(tol = 0) {
		return this.isAlternating(tol)
	}

	/**
	 * Returns if this is regular matrix or not.
	 *
	 * @param {number} [tol=0]
	 * @returns {boolean}
	 */
	isRegular(tol = 0) {
		if (!this.isSquare()) return false
		return Math.abs(this.det()) <= tol
	}

	/**
	 * Returns if this is normal matrix or not.
	 *
	 * @param {number} [tol=0]
	 * @returns {boolean}
	 */
	isNormal(tol = 0) {
		return this.dot(this.t).equals(this.tDot(this), tol)
	}

	/**
	 * Returns if this is orthogonal matrix or not.
	 *
	 * @param {number} [tol=0]
	 * @returns {boolean}
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
	 *
	 * @param {number} [tol=0]
	 * @returns {boolean}
	 */
	isUnitary(tol = 0) {
		return this.isOrthogonal(tol)
	}

	/**
	 * Returns if this is nilpotent matrix or not.
	 *
	 * @param {number} [tol=0]
	 * @returns {boolean}
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
	 *
	 * @returns {number[]}
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
	 *
	 * @returns {number}
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
	 *
	 * @param {number} [p=2]
	 * @returns {number}
	 */
	norm(p = 2) {
		return this.normEntrywise(p)
	}

	/**
	 * Returns induced norm.
	 *
	 * @param {number} [p=2]
	 * @returns {number}
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
	 *
	 * @returns {number}
	 */
	normSpectral() {
		const sv = this.singularValues()
		return sv[0]
	}

	/**
	 * Returns a entry-wise norm
	 *
	 * @param {number} [p=2]
	 * @returns {number}
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
	 *
	 * @returns {number}
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
	 *
	 * @returns {number}
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
	 *
	 * @param {number} [p=2]
	 * @returns {number}
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
	 *
	 * @returns {number}
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
	 *
	 * @param {number} [tol=0]
	 * @returns {number}
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
	 *
	 * @returns {number}
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
	 * Multiply all elements by -1 in-place.
	 */
	negative() {
		this.map(v => -v)
	}

	/**
	 * Set all elements to their absolute values.
	 */
	abs() {
		this.map(Math.abs)
	}

	/**
	 * Add a value or matrix.
	 *
	 * @param {Matrix | number} o Value to add
	 */
	add(o) {
		if (o instanceof Matrix) {
			if (this.rows === o.rows && this.cols === o.cols) {
				for (let i = this.length - 1; i >= 0; i--) {
					this._value[i] = this._value[i] + o._value[i]
				}
			} else if (this.rows >= o.rows && this.cols >= o.cols) {
				if (this.rows % o.rows !== 0 || this.cols % o.cols !== 0) {
					throw new MatrixException('Addition size invalid.', [this, o])
				}
				for (let i = 0, r = 0, c = 0; i < this.length; i++, c++) {
					if (c >= this.cols) (r += o.cols), (c = 0)
					if (r >= o.length) r = 0
					this._value[i] = this._value[i] + o._value[r + (c % o.cols)]
				}
			} else if (this.rows <= o.rows && this.cols <= o.cols) {
				if (o.rows % this.rows !== 0 || o.cols % this.cols !== 0) {
					throw new MatrixException('Addition size invalid.', [this, o])
				}
				this.repeat([o.rows / this.rows, o.cols / this.cols])
				for (let i = this.length - 1; i >= 0; i--) {
					this._value[i] = this._value[i] + o._value[i]
				}
			} else {
				throw new MatrixException('Addition size invalid.', [this, o])
			}
		} else {
			this.map(v => v + o)
		}
	}

	/**
	 * Add a value to the position.
	 *
	 * @param {number} r Index of the row to add the value to
	 * @param {number} c Index of the column to add the value to
	 * @param {number} v Value to add
	 * @returns {number} Old value
	 */
	addAt(r, c, v) {
		if (r < 0 || this.rows <= r || c < 0 || this.cols <= c) throw new MatrixException('Index out of bounds.')
		const old = this._value[r * this.cols + c]
		this._value[r * this.cols + c] = old + v
		return old
	}

	/**
	 * Returns a matrix that add two values.
	 *
	 * @param {Matrix | number} a Left value
	 * @param {Matrix | number} b Right value
	 * @returns {Matrix} Added matrix
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
	 *
	 * @param {Matrix | number} o Value to subtract
	 */
	sub(o) {
		if (o instanceof Matrix) {
			if (this.rows === o.rows && this.cols === o.cols) {
				for (let i = this.length - 1; i >= 0; i--) {
					this._value[i] = this._value[i] - o._value[i]
				}
			} else if (this.rows >= o.rows && this.cols >= o.cols) {
				if (this.rows % o.rows !== 0 || this.cols % o.cols !== 0) {
					throw new MatrixException('Subtract size invalid.', [this, o])
				}
				for (let i = 0, r = 0, c = 0; i < this.length; i++, c++) {
					if (c >= this.cols) (r += o.cols), (c = 0)
					if (r >= o.length) r = 0
					this._value[i] = this._value[i] - o._value[r + (c % o.cols)]
				}
			} else if (this.rows <= o.rows && this.cols <= o.cols) {
				if (o.rows % this.rows !== 0 || o.cols % this.cols !== 0) {
					throw new MatrixException('Subtract size invalid.', [this, o])
				}
				this.repeat([o.rows / this.rows, o.cols / this.cols])
				for (let i = this.length - 1; i >= 0; i--) {
					this._value[i] = this._value[i] - o._value[i]
				}
			} else {
				throw new MatrixException('Subtract size invalid.', [this, o])
			}
		} else {
			this.map(v => v - o)
		}
	}

	/**
	 * Subtract this matrix from a value or matrix.
	 *
	 * @param {Matrix | number} o Value to be subtracted
	 */
	isub(o) {
		this.negative()
		this.add(o)
	}

	/**
	 * Subtract a value from the value at the position.
	 *
	 * @param {number} r Index of the row to subtract the value to
	 * @param {number} c Index of the column to subtract the value to
	 * @param {number} v Value to subtract
	 * @returns {number} Old value
	 */
	subAt(r, c, v) {
		if (r < 0 || this.rows <= r || c < 0 || this.cols <= c) throw new MatrixException('Index out of bounds.')
		const old = this._value[r * this.cols + c]
		this._value[r * this.cols + c] = old - v
		return old
	}

	/**
	 * Subtract the value at the position from a value.
	 *
	 * @param {number} r Index of the row whose value is to be subtracted
	 * @param {number} c Index of the column whose value is to be subtracted
	 * @param {number} v Value to be subtracted
	 * @returns {number} Old value
	 */
	isubAt(r, c, v) {
		if (r < 0 || this.rows <= r || c < 0 || this.cols <= c) throw new MatrixException('Index out of bounds.')
		const old = this._value[r * this.cols + c]
		this._value[r * this.cols + c] = v - old
		return old
	}

	/**
	 * Returns a matrix that subtract two values.
	 *
	 * @param {Matrix | number} a Left value
	 * @param {Matrix | number} b Right value
	 * @returns {Matrix} Subtracted matrix
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
	 *
	 * @param {Matrix | number} o Value to multiply
	 */
	mult(o) {
		if (o instanceof Matrix) {
			if (this.rows === o.rows && this.cols === o.cols) {
				for (let i = this.length - 1; i >= 0; i--) {
					this._value[i] = this._value[i] * o._value[i]
				}
			} else if (this.rows >= o.rows && this.cols >= o.cols) {
				if (this.rows % o.rows !== 0 || this.cols % o.cols !== 0) {
					throw new MatrixException('Multiple size invalid.', [this, o])
				}
				for (let i = 0, r = 0, c = 0; i < this.length; i++, c++) {
					if (c >= this.cols) (r += o.cols), (c = 0)
					if (r >= o.length) r = 0
					this._value[i] = this._value[i] * o._value[r + (c % o.cols)]
				}
			} else if (this.rows <= o.rows && this.cols <= o.cols) {
				if (o.rows % this.rows !== 0 || o.cols % this.cols !== 0) {
					throw new MatrixException('Multiple size invalid.', [this, o])
				}
				this.repeat([o.rows / this.rows, o.cols / this.cols])
				for (let i = this.length - 1; i >= 0; i--) {
					this._value[i] = this._value[i] * o._value[i]
				}
			} else {
				throw new MatrixException('Multiple size invalid.', [this, o])
			}
		} else {
			this.map(v => v * o)
		}
	}

	/**
	 * Multiplies a value to the position.
	 *
	 * @param {number} r Index of the row to multiply the value by
	 * @param {number} c Index of the column to multiply the value by
	 * @param {number} v Value to multiply
	 * @returns {number} Old value
	 */
	multAt(r, c, v) {
		if (r < 0 || this.rows <= r || c < 0 || this.cols <= c) throw new MatrixException('Index out of bounds.')
		const old = this._value[r * this.cols + c]
		this._value[r * this.cols + c] = old * v
		return old
	}

	/**
	 * Returns a matrix that multiplies by two values element-wise.
	 *
	 * @param {Matrix | number} a Left value
	 * @param {Matrix | number} b Right value
	 * @returns {Matrix} Multiplied matrix
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
	 *
	 * @param {Matrix | number} o Value to divide
	 */
	div(o) {
		if (o instanceof Matrix) {
			if (this.rows === o.rows && this.cols === o.cols) {
				for (let i = this.length - 1; i >= 0; i--) {
					this._value[i] = this._value[i] / o._value[i]
				}
			} else if (this.rows >= o.rows && this.cols >= o.cols) {
				if (this.rows % o.rows !== 0 || this.cols % o.cols !== 0) {
					throw new MatrixException('Divide size invalid.', [this, o])
				}
				for (let i = 0, r = 0, c = 0; i < this.length; i++, c++) {
					if (c >= this.cols) (r += o.cols), (c = 0)
					if (r >= o.length) r = 0
					this._value[i] = this._value[i] / o._value[r + (c % o.cols)]
				}
			} else if (this.rows <= o.rows && this.cols <= o.cols) {
				if (o.rows % this.rows !== 0 || o.cols % this.cols !== 0) {
					throw new MatrixException('Divide size invalid.', [this, o])
				}
				this.repeat([o.rows / this.rows, o.cols / this.cols])
				for (let i = this.length - 1; i >= 0; i--) {
					this._value[i] = this._value[i] / o._value[i]
				}
			} else {
				throw new MatrixException('Divide size invalid.', [this, o])
			}
		} else {
			this.map(v => v / o)
		}
	}

	/**
	 * Divides a value by this matrix element-wise.
	 *
	 * @param {Matrix | number} o Value to be divided
	 */
	idiv(o) {
		if (o instanceof Matrix) {
			if (this.rows === o.rows && this.cols === o.cols) {
				for (let i = this.length - 1; i >= 0; i--) {
					this._value[i] = o._value[i] / this._value[i]
				}
			} else if (this.rows >= o.rows && this.cols >= o.cols) {
				if (this.rows % o.rows !== 0 || this.cols % o.cols !== 0) {
					throw new MatrixException('Divide size invalid.', [this, o])
				}
				for (let i = 0, r = 0, c = 0; i < this.length; i++, c++) {
					if (c >= this.cols) (r += o.cols), (c = 0)
					if (r >= o.length) r = 0
					this._value[i] = o._value[r + (c % o.cols)] / this._value[i]
				}
			} else if (this.rows <= o.rows && this.cols <= o.cols) {
				if (o.rows % this.rows !== 0 || o.cols % this.cols !== 0) {
					throw new MatrixException('Divide size invalid.', [this, o])
				}
				this.repeat([o.rows / this.rows, o.cols / this.cols])
				for (let i = this.length - 1; i >= 0; i--) {
					this._value[i] = o._value[i] / this._value[i]
				}
			} else {
				throw new MatrixException('Divide size invalid.', [this, o])
			}
		} else {
			this.map(v => o / v)
		}
	}

	/**
	 * Divides the value at the position by a value.
	 *
	 * @param {number} r Index of the row to divide the value by
	 * @param {number} c Index of the column to divide the value by
	 * @param {number} v Value to divide
	 * @returns {number} Old value
	 */
	divAt(r, c, v) {
		if (r < 0 || this.rows <= r || c < 0 || this.cols <= c) throw new MatrixException('Index out of bounds.')
		const old = this._value[r * this.cols + c]
		this._value[r * this.cols + c] = old / v
		return old
	}

	/**
	 * Divides a value by the value at the position.
	 *
	 * @param {number} r Index of the row whose value is to be divided
	 * @param {number} c Index of the column whose value is to be divided
	 * @param {number} v Value to be divided
	 * @returns {number} Old value
	 */
	idivAt(r, c, v) {
		if (r < 0 || this.rows <= r || c < 0 || this.cols <= c) throw new MatrixException('Index out of bounds.')
		const old = this._value[r * this.cols + c]
		this._value[r * this.cols + c] = v / old
		return old
	}

	/**
	 * Returns a matrix that divides by two values element-wise.
	 *
	 * @param {Matrix | number} a Left value
	 * @param {Matrix | number} b Right value
	 * @returns {Matrix} Divided matrix
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
	 * Returns a matrix product value.
	 *
	 * @param {Matrix} o
	 * @returns {Matrix}
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
	 *
	 * @param {Matrix} o
	 * @returns {Matrix}
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
	 *
	 * @param {Matrix} mat
	 * @returns {Matrix}
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
	 *
	 * @param {Array<Array<number>>} kernel
	 * @param {boolean} [normalize=true]
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
	 *
	 * @param {number} [tol=0]
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
	 *
	 * @returns {Matrix}
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
	 *
	 * @returns {Matrix}
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
	 *
	 * @returns {Matrix}
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
	 *
	 * @returns {Matrix}
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
	 *
	 * @returns {Matrix}
	 */
	invLU() {
		if (!this.isSquare()) {
			throw new MatrixException('Inverse matrix only define square matrix.', this)
		}
		const [l, u] = this.lu()
		return u.invUpperTriangular().dot(l.invLowerTriangular())
	}

	/**
	 * Returns a square root of this matrix.
	 *
	 * @returns {Matrix}
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
	 *
	 * @param {number} p
	 * @returns {Matrix}
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
	 *
	 * @returns {Matrix}
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
	 *
	 * @returns {Matrix}
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
	 *
	 * @param {number} [ddof=0]
	 * @returns {Matrix}
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
	 *
	 * @returns {Matrix}
	 */
	gram() {
		return this.tDot(this)
	}

	/**
	 * Returns a solved value A of a equation XA=B.
	 *
	 * @param {Matrix} b
	 * @returns {Matrix}
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
	 *
	 * @param {Matrix} b
	 * @returns {Matrix}
	 */
	solveLowerTriangular(b) {
		if (!this.isSquare()) {
			throw new MatrixException('Only square matrix can solve.', this)
		}
		const n = this.rows
		const m = b.cols
		if (n !== b.rows) {
			throw new MatrixException('b size is invalid.', [this, b])
		}
		const x = new Matrix(n, m)
		for (let k = 0; k < m; k++) {
			for (let i = 0; i < n; i++) {
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
	 *
	 * @param {Matrix} b
	 * @returns {Matrix}
	 */
	solveUpperTriangular(b) {
		if (!this.isSquare()) {
			throw new MatrixException('Only square matrix can solve.', this)
		}
		const n = this.rows
		const m = b.cols
		if (n !== b.rows) {
			throw new MatrixException('b size is invalid.', [this, b])
		}
		const x = new Matrix(n, m)
		for (let k = 0; k < m; k++) {
			for (let i = n - 1; i >= 0; i--) {
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
	 * Returns a bidiagonal matrix.
	 *
	 * @returns {Matrix}
	 */
	bidiag() {
		const a = this.copy()
		const [n, m] = [this.rows, this.cols]
		for (let i = 0; i < Math.min(n, m); i++) {
			let new_a = a.block(i, i)
			let v = new_a.col(0)
			let alpha = v.norm() * (v._value[0] < 0 ? 1 : -1)
			v._value[0] -= alpha
			v.div(v.norm())
			let V = v.dot(v.t)
			V.mult(2)

			let H = Matrix.eye(n - i, n - i)
			H.sub(V)
			new_a = H.tDot(new_a)

			v = new_a.row(0)
			v._value[0] = 0
			if (v.norm() > 0) {
				alpha = v.norm() * (v._value[1] < 0 ? 1 : -1)
				v._value[1] -= alpha
				v.div(v.norm())
			}
			V = v.tDot(v)
			V.mult(2)

			H = Matrix.eye(m - i, m - i)
			H.sub(V)
			new_a = new_a.dot(H)

			a.set(i, i, new_a)
		}
		return a
	}

	/**
	 * Returns a tridiagonal matrix.
	 *
	 * @returns {Matrix}
	 */
	tridiag() {
		return this.tridiagHouseholder()
	}

	/**
	 * Returns a tridiagonal matrix.
	 *
	 * @returns {Matrix}
	 */
	tridiagHouseholder() {
		if (!this.isSymmetric()) {
			throw new MatrixException('Tridiagonal only define symmetric matrix.', this)
		}
		const a = this.copy()
		const n = this.cols
		for (let i = 0; i < n - 2; i++) {
			const v = a.block(i + 1, i, n, i + 1)
			const alpha = v.norm() * (v._value[0] < 0 ? 1 : -1)
			v._value[0] -= alpha
			v.div(v.norm())

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
		return a
	}

	/**
	 * Returns a tridiagonal matrix.
	 *
	 * @param {number} [k=0]
	 * @returns {Matrix}
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
	 *
	 * @returns {Matrix}
	 */
	hessenberg() {
		return this.hessenbergArnoldi()
	}

	/**
	 * Returns a hessenberg matrix.
	 *
	 * @param {number} [k=0]
	 * @returns {Matrix}
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
	 * Returns a LU decomposition.
	 *
	 * @returns {[Matrix, Matrix]}
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
	 *
	 * @returns {[Matrix, Matrix]}
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
	 *
	 * @returns {[Matrix, Matrix]}
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
				const xv = (x._value[j * m + i] = s / d[j] ** 2)
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
				d.map(v => 1 / v)
			)
		)
		x.mult(new Matrix(m, 1, d))
		return [b, x]
	}

	/**
	 * Returns a QR decomposition by Householder method.
	 *
	 * @returns {[Matrix, Matrix]}
	 */
	qrHouseholder() {
		const n = this.rows
		const m = this.cols
		const a = this.copy()
		const u = Matrix.eye(n, n)
		for (let i = 0; i < Math.min(n, m) - 1; i++) {
			const ni = n - i
			const x = a.block(i, i, n, i + 1)
			const alpha = x.norm() * Math.sign(x._value[0])
			x._value[0] -= alpha
			x.div(x.norm() + 1.0e-12)

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
	 *
	 * @returns {number[]}
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
	 * Returns a singular value decomposition.
	 *
	 * @returns {[Matrix, number[], Matrix]}
	 */
	svd() {
		return this.svdEigen()
	}

	/**
	 * Returns a singular value decomposition by eigen decomposition.
	 *
	 * @returns {[Matrix, number[], Matrix]}
	 */
	svdEigen() {
		// https://ohke.hateblo.jp/entry/2017/12/14/230500
		const n = Math.min(this.cols, this.rows)
		if (this.cols <= this.rows) {
			const ata = this.tDot(this)
			const [ev, V] = ata.eigen()
			for (let i = 0; i < n; i++) {
				ev[i] = Math.sqrt(ev[i])
			}
			const U = this.dot(V)
			for (let i = 0; i < this.rows; i++) {
				for (let j = 0; j < n; j++) {
					U._value[i * n + j] /= ev[j]
				}
			}
			return [U, ev, V]
		} else {
			const aat = this.dot(this.t)
			const [ev, U] = aat.eigen()
			for (let i = 0; i < n; i++) {
				ev[i] = Math.sqrt(ev[i])
			}
			const V = U.tDot(this)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < this.cols; j++) {
					V._value[i * this.cols + j] /= ev[i]
				}
			}
			return [U, ev, V.t]
		}
	}

	svdGolubKahan() {
		// http://www.kurims.kyoto-u.ac.jp/~kyodo/kokyuroku/contents/pdf/1594-12.pdf
		// TODO
	}

	/**
	 * Returns a cholesky decomposition.
	 *
	 * @returns {Matrix}
	 */
	cholesky() {
		return this.choleskyBanachiewicz()
	}

	/**
	 * Returns a cholesky decomposition by Banachiewicz algorithm.
	 *
	 * @returns {Matrix}
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
	 * Returns LDL decomposition.
	 *
	 * @returns {[Matrix, number[]]}
	 */
	choleskyLDL() {
		if (!this.isSymmetric(1.0e-15)) {
			throw new MatrixException('Cholesky decomposition only define symmetric matrix.', this)
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
	 *
	 * @returns {Matrix}
	 */
	schur() {
		throw new MatrixException('Not implemented.')
	}

	/**
	 * Returns eigenvalues and eigenvectors. Eigenvectors correspond to each column of the matrix.
	 *
	 * @returns {[number[], Matrix]}
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
	 *
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
		}

		if (this.isSymmetric(1.0e-15)) {
			return this.eigenJacobi()[0]
		} else {
			return this.eigenValuesQR()
		}
	}

	/**
	 * Returns eigenvectors. Eigenvectors correspond to each column of the matrix.
	 *
	 * @returns {Matrix}
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
	 *
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
	 *
	 * @returns {number[]} Eigenvalues
	 */
	eigenValuesLR() {
		if (!this.isSquare()) {
			throw new MatrixException('Eigen values only define square matrix.', this)
		}

		let a = this
		const n = a.rows
		const tol = 1.0e-15
		let maxCount = 1.0e5
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
	 *
	 * @returns {number[]} Eigenvalues
	 */
	eigenValuesQR() {
		if (!this.isSquare()) {
			throw new MatrixException('Eigen values only define square matrix.', this)
		}

		let a = this.copy()
		const ev = []
		const tol = 1.0e-8
		for (let n = a.rows; n > 2; n--) {
			let maxCount = 1.0e6
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
	 * Returns eigenvalues and eigenvectors. Eigenvectors correspond to each column of the matrix.
	 *
	 * @param {number} [maxIteration=1.0e6]
	 * @returns {[number[], Matrix]}
	 */
	eigenJacobi(maxIteration = 1.0e6) {
		if (!this.isSymmetric(1.0e-15)) {
			throw new MatrixException('Jacobi method can only use symmetric matrix.', this)
		}
		const a = this._value.concat()
		const P = Matrix.eye(this.rows, this.cols)
		P.add(0)
		const tol = 1.0e-15
		let lastMaxValue = 0
		const n = this.rows
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
			} else if (maxValue === lastMaxValue) {
				break
			} else if (maxCount-- < 0) {
				console.log(new MatrixException('eigenJacobi not converged.', [this, maxValue]))
				break
			}
			lastMaxValue = maxValue
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
	 *
	 * @returns {[number, Matrix]}
	 */
	eigenPowerIteration() {
		if (!this.isSquare()) {
			throw new MatrixException('Eigen vectors only define square matrix.', this)
		}

		const n = this.rows
		const tol = 1.0e-15
		let px = Matrix.randn(n, 1)
		px.div(px.norm())
		let pl = Infinity
		let maxCount = 1.0e4
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
	 * Returns the nearest eigenvalue and its eigenvector to the specified value.
	 *
	 * @param {number} [ev=0.0] Target value
	 * @returns {[number, Matrix]}
	 */
	eigenInverseIteration(ev = 0.0) {
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
		let maxCount = 1.0e4
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
