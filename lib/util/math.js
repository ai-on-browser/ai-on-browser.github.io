const normal_random = function (m = 0, s = 1) {
	const std = Math.sqrt(s)
	const x = Math.random()
	const y = Math.random()
	const X = Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * y)
	const Y = Math.sqrt(-2 * Math.log(x)) * Math.sin(2 * Math.PI * y)
	return [X * std + m, Y * std + m]
}

class Complex {
	constructor(real = 0, imag = 0) {
		this._real = real
		this._imaginary = imag
	}

	get real() {
		return this._real
	}

	get imaginary() {
		return this._imaginary
	}

	abs() {
		return Math.sqrt(this._real ** 2 + this._imaginary ** 2)
	}

	conjugate() {
		return new Complex(this._real, -this._imaginary)
	}

	add(other) {
		if (typeof other === 'number') {
			return new Complex(this._real + other, this._imaginary)
		}
		return new Complex(this._real + other._real, this._imaginary + other._imaginary)
	}

	sub(other) {
		if (typeof other === 'number') {
			return new Complex(this._real - other, this._imaginary)
		}
		return new Complex(this._real - other._real, this._imaginary - other._imaginary)
	}

	mult(other) {
		if (typeof other === 'number') {
			return new Complex(this._real * other, this._imaginary * other)
		}
		return new Complex(
			this._real * other._real - this._imaginary * other._imaginary,
			this._imaginary * other._real + this._real * other._imaginary
		)
	}

	div(other) {
		if (typeof other === 'number') {
			return new Complex(this._real / other, this._imaginary / other)
		}
		const d = other._real ** 2 + other._imaginary ** 2
		return new Complex(
			(this._real * other._real + this._imaginary * other._imaginary) / d,
			(this._imaginary * other._real - this._real * other._imaginary) / d
		)
	}

	sqrt() {
		const th = Math.atan2(this._imaginary, this._real) / 2
		const d = Math.sqrt(this._real ** 2 + this._imaginary ** 2)
		const s = Math.sqrt(d)
		const c = []
		for (let k = 0; k < 3; k++) {
			const r = Math.cos(th + k * Math.PI)
			const i = Math.sin(th + k * Math.PI)
			c.push(new Complex(r * s, i * s))
		}
		return c
	}

	cbrt() {
		const th = Math.atan2(this._imaginary, this._real) / 3
		const d = Math.sqrt(this._real ** 2 + this._imaginary ** 2)
		const s = Math.cbrt(d)
		const c = []
		for (let k = 0; k < 3; k++) {
			const r = Math.cos(th + (k * Math.PI * 2) / 3)
			const i = Math.sin(th + (k * Math.PI * 2) / 3)
			c.push(new Complex(r * s, i * s))
		}
		return c
	}
}

/**
 * Tree class
 * @property {*} value A value of this tree.
 * @property {Tree[]} childs Children of this tree.
 * @property {?Tree} parent Parent of this tree.
 */
export class Tree {
	/**
	 * @param {*} value
	 * @param {?Array<Tree>} childs
	 */
	constructor(value, childs) {
		this.value = value
		this.childs = childs?.concat() || []
		this.childs.forEach(c => (c.parent = this))
		this.parent = null
	}

	/**
	 * Number of the children.
	 * @type {number}
	 */
	get length() {
		return this.childs.length
	}

	/**
	 * Depth of the tree.
	 * @type {number}
	 */
	get depth() {
		return this.isLeaf()
			? 1
			: 1 +
					Math.max.apply(
						null,
						this.childs.map(c => c.depth)
					)
	}

	/**
	 * Iterate over the children.
	 * @yields {Tree}
	 */
	*[Symbol.iterator]() {
		yield* this.childs
	}

	/**
	 * Returns the child at the index.
	 * @param {number} index
	 * @returns {Tree} Child at the index.
	 */
	at(index) {
		return this.childs[index]
	}

	/**
	 * Add a value to the child.
	 * @param {* | Tree} value
	 */
	push(value) {
		value = value instanceof Tree ? value : new Tree(value)
		this.childs.push(value)
		value.parent = this
	}

	/**
	 * Set a value of the child at the index.
	 * @param {number} index
	 * @param {* | Tree} value
	 */
	set(index, value) {
		if (index < 0 || this.childs.length <= index) {
			return
		}
		value = value instanceof Tree ? value : new Tree(value)
		this.childs[index].parent = null
		this.childs[index] = value
		value.parent = this
	}

	/**
	 * Remove a child at the index.
	 * @param {number} index
	 * @returns {Tree} Removed tree.
	 */
	removeAt(index) {
		if (index < 0 || this.childs.length <= index) {
			return
		}
		this.childs[index].parent = null
		return this.childs.splice(index, 1)[0]
	}

	/**
	 * Remove all children.
	 */
	clear() {
		this.childs.forEach(c => (c.parent = null))
		this.childs.length = 0
	}

	/**
	 * Returns this tree is the leaf node or not.
	 * @returns {boolean}
	 */
	isLeaf() {
		return this.childs.length === 0
	}

	/**
	 * Returns this tree is the root node or not.
	 * @returns {boolean}
	 */
	isRoot() {
		return this.parent === null
	}

	/**
	 * Returns the root node.
	 * @returns {Tree}
	 */
	root() {
		return this.isRoot() ? this : this.parent.root()
	}

	/**
	 * Returns the leaf nodes.
	 * @returns {Tree[]}
	 */
	leafs() {
		let vals = []
		this.scanLeaf(l => vals.push(l))
		return vals
	}

	/**
	 * Returns the values of all leaf nodes.
	 * @returns {*[]}
	 */
	leafValues() {
		let vals = []
		this.scanLeaf(l => vals.push(l.value))
		return vals
	}

	/**
	 * Returns the number of the leaf nodes.
	 * @returns {number}
	 */
	leafCount() {
		return this.isLeaf() ? 1 : this.childs.reduce((acc, c) => acc + c.leafCount(), 0)
	}

	/**
	 * Iterate over the children.
	 * @param {function (Tree): void} cb
	 * @param {?*} thisArg
	 */
	forEach(cb, thisArg) {
		this.childs.forEach(cb, thisArg)
	}

	/**
	 * Iterate over the children recursively.
	 * @param {function (Tree): void} cb
	 */
	scan(cb) {
		cb(this)
		this.childs.forEach(c => c.scan(cb))
	}

	/**
	 * Iterate over the leaf nodes.
	 * @param {function (Tree): void} cb
	 */
	scanLeaf(cb) {
		this.isLeaf() ? cb(this) : this.childs.forEach(c => c.scanLeaf(cb))
	}
}

/**
 * Tensor class
 */
export class Tensor {
	/**
	 * @param {number[]} size
	 * @param {?(number | number[])} value
	 */
	constructor(size, value) {
		this._size = size.concat()
		this._length = size.reduce((s, v) => s * v, 1)
		if (!value) {
			this._value = Array(this._length).fill(0)
		} else if (Array.isArray(value)) {
			this._value = value.flat(size.length)
		} else {
			this._value = Array(this._length).fill(value)
		}
		this._offset = 0
	}

	/**
	 * Returns a tensor filled with 0.
	 * @param {number[]} size
	 * @returns {Tensor}
	 */
	static zeros(size) {
		return new Tensor(size)
	}

	/**
	 * Returns a tensor filled with 1.
	 * @param {number[]} size
	 * @returns {Tensor}
	 */
	static ones(size) {
		return new Tensor(size, 1)
	}

	/**
	 * Returns a tensor initialized uniform random values.
	 * @param {number[]} size
	 * @param {number} min
	 * @param {number} max
	 * @returns {Tensor}
	 */
	static random(size, min = 0, max = 1) {
		const mat = new Tensor(size)
		for (let i = 0; i < mat.length; i++) {
			mat._value[i] = Math.random() * (max - min) + min
		}
		return mat
	}

	/**
	 * Returns a tensor initialized normal random values.
	 * @param {number[]} size
	 * @param {number} myu mean value
	 * @param {number} sigma variance value
	 * @returns {Tensor}
	 */
	static randn(size, myu = 0, sigma = 1) {
		const mat = new Tensor(size)
		for (let i = 0; i < mat.length; i += 2) {
			const nr = normal_random(myu, sigma)
			mat._value[i] = nr[0]
			if (i + 1 < mat.length) {
				mat._value[i + 1] = nr[1]
			}
		}
		return mat
	}

	/**
	 * Returns a tensor from some value.
	 * @param {Tensor | Matrix | Array<number> | number} arr
	 * @returns {Tensor}
	 */
	static fromArray(arr) {
		if (arr instanceof Tensor) {
			return arr
		} else if (arr instanceof Matrix) {
			return new Tensor(arr.sizes, arr._value)
		} else if (!Array.isArray(arr)) {
			return new Tensor([1], arr)
		} else if (arr.length === 0) {
			return new Tensor([0])
		}
		const sizes = []
		let tarr = arr
		while (Array.isArray(tarr)) {
			sizes.push(tarr.length)
			tarr = tarr[0]
		}
		return new Tensor(sizes, arr)
	}

	/**
	 * Dimension of the tensor.
	 * @type {number}
	 */
	get dimension() {
		return this._size.length
	}

	/**
	 * Sizes of the tensor.
	 * @type {number[]}
	 */
	get sizes() {
		return this._size
	}

	/**
	 * Number of all elements in the tensor.
	 * @type {number}
	 */
	get length() {
		return this._length
	}

	/**
	 * Elements in the tensor.
	 * @type {number[]}
	 */
	get value() {
		return this._value
	}

	/**
	 * Iterate over the elements.
	 * @yields {number}
	 */
	*[Symbol.iterator]() {
		yield* this._value
	}

	/**
	 * Returns a nested array represented this tensor.
	 * @returns {Array<number>} Nested array
	 */
	toArray() {
		const root = []
		let leaf = [root]
		let c = 0
		for (let i = 0; i < this._size.length; i++) {
			const next_leaf = []
			for (const l of leaf) {
				if (i === this._size.length - 1) {
					l.push(...this._value.slice(c, c + this._size[i]))
					c += this._size[i]
				} else {
					for (let k = 0; k < this._size[i]; k++) {
						next_leaf.push((l[k] = []))
					}
				}
			}
			leaf = next_leaf
		}
		return root
	}

	/**
	 * Returns a string represented this tensor.
	 * @returns {string}
	 */
	toString() {
		let p = 0
		let c = this.dimension
		let s = ''
		for (let p = 0; p < this.length; ) {
			for (let i = 0; i < c; i++) s += '['
			s += this._value[p]
			c = 0
			let p0 = ++p
			for (let i = this.dimension - 1; i >= 0; i--) {
				if (p0 % this._size[i] !== 0) {
					break
				}
				c++
				p0 /= this._size[i]
			}
			for (let i = 0; i < c; i++) s += ']'
			if (p !== this.length) s += ', '
		}
		return s
	}

	/**
	 * Returns a Matrix if the dimension of this tensor is 2.
	 * @returns {Matrix}
	 * @throws {MatrixException} If the dimension of thie tensor is not 2.
	 */
	toMatrix() {
		if (this.dimension !== 2) {
			throw new MatrixException('Only 2D tensor can convert to matrix.')
		}
		return new Matrix(...this._size, this._value)
	}

	_to_position(...i) {
		let p = 0
		for (let d = 0; d < this.dimension; d++) {
			p = p * this._size[d] + i[d]
		}
		return p + this._offset
	}

	_to_index(p) {
		const a = Array(this.dimension)
		for (let i = this.dimension - 1; i >= 0; i--) {
			a[i] = p % this._size[i]
			p = Math.floor(p / this._size[i])
		}
		return a
	}

	/**
	 * Returns a copy of this tensor.
	 * @returns {Tensor}
	 */
	copy() {
		return new Tensor(this._size, this.value.slice(this._offset, this._offset + this._length))
	}

	/**
	 * Returns this tensor is equals to the others.
	 * @param {*} other
	 * @returns {boolean}
	 */
	equals(other) {
		if (other instanceof Tensor) {
			if (this.dimension !== other.dimension) {
				return false
			}
			if (this._size.some((v, i) => v !== other._size[i])) {
				return false
			}
			for (let i = this.length - 1; i >= 0; i--) {
				if (this._value[i] !== other._value[i]) {
					return false
				}
			}
			return true
		}
		return false
	}

	/**
	 * Returns value(s) at the index position.
	 * @param  {...number} i
	 * @returns {number | Tensor}
	 */
	at(...i) {
		if (i.length === this.dimension) {
			return this._value[this._to_position(...i)]
		}

		let s = 0
		for (let d = 0; d < i.length; d++) {
			s = s * this._size[d] + i[d]
		}
		let e = s + 1
		for (let d = i.length; d < this.dimension; d++) {
			s = s * this._size[d]
			e = e * this._size[d]
		}
		const t = new Tensor(this._size.slice(i.length))
		t._value = this._value
		t._offset = s
		return t
	}

	/**
	 * Returns a tensor sliced by first dimension.
	 * @param {number} from
	 * @param {number} to
	 * @param {number} axis
	 * @returns {Tensor}
	 */
	slice(from, to, axis = 0) {
		if (axis > 0) {
			throw 'Invalid axis. Only 0 is accepted.'
		}
		let s = 1
		for (let d = 1; d < this.dimension; d++) {
			s *= this._size[d]
		}
		const t = new Tensor([to - from, ...this._size.slice(1)])
		t._value = this._value.slice(from * s, to * s)
		return t
	}

	/**
	 * Set the value at the specific position.
	 * @param {number[]} i
	 * @param {number} value
	 */
	set(i, value) {
		if (!Array.isArray(i)) {
			i = [i]
		}
		this._value[this._to_position(...i)] = value
	}

	/**
	 * Returns the sub-tensor corresponding to position i in the first dimension of this.
	 * @param {number | number[]} idx
	 * @param {number} axis
	 * @returns {Tensor}
	 */
	select(idx, axis = 0) {
		if (axis > 0) {
			throw 'Invalid axis. Only 0 is accepted.'
		}
		if (!Array.isArray(idx)) {
			idx = [idx]
		}
		let s = 1
		for (let d = 1; d < this.dimension; d++) {
			s *= this._size[d]
		}
		const t = new Tensor([idx.length, ...this._size.slice(1)])
		for (let i = 0; i < idx.length; i++) {
			for (let j = 0; j < s; j++) {
				t._value[i * s + j] = this._value[idx[i] * s + j]
			}
		}
		return t
	}

	/**
	 * Fill in all the elements with the value.
	 * @param {number} value
	 */
	fill(value) {
		this._value = Array(this.length).fill(value)
	}

	/**
	 * Iterate over all the elements and replace the value.
	 * @param {function (number, number[]): number} cb
	 */
	map(cb) {
		for (let i = this.length - 1; i >= 0; i--) {
			this._value[i] = cb(this._value[i], this._to_index(i))
		}
	}

	/**
	 * Iterate over all the elements.
	 * @param {function (number, number[]): void} cb
	 */
	forEach(cb) {
		for (let i = this.length - 1; i >= 0; i--) {
			cb(this._value[i], this._to_index(i), this._value)
		}
	}

	/**
	 * Shuffle along the axis.
	 * @param {number} axis
	 */
	shuffle(axis = 0) {
		const idx = []
		for (let i = 0; i < this._size[axis]; i++) {
			idx[i] = i
		}
		for (let i = idx.length - 1; i > 0; i--) {
			let r = Math.floor(Math.random() * (i + 1))
			;[idx[i], idx[r]] = [idx[r], idx[i]]
		}
		this._value = this.select(idx, axis)._value
	}

	/**
	 * Returns a tensor transposed along the axis.
	 * @param {...number} axises
	 * @returns {Tensor}
	 */
	transpose(...axises) {
		const t = new Tensor(axises.map(a => this._size[a]))
		for (let i = 0; i < this.length; i++) {
			const idx = this._to_index(i)
			t._value[t._to_position(...axises.map(a => idx[a]))] = this._value[i]
		}
		return t
	}

	/**
	 * Reshape this as the sizes.
	 * @param {...number} sizes
	 */
	reshape(...sizes) {
		if (sizes.reduce((s, v) => s * v, 1) !== this.length) {
			throw new MatrixException('Length is different.')
		}
		this._size = sizes.concat()
	}
}

function MatrixException(message, value) {
	this.message = message
	this.value = value
	this.name = MatrixException
}

/**
 * Matrix class
 */
export class Matrix {
	/**
	 * @param {number} rows
	 * @param {number} cols
	 * @param {?(number | Array<number> | Array<Array<number>>)} values
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
	 * @param {number} rows
	 * @param {number} cols
	 * @returns {Matrix}
	 */
	static zeros(rows, cols) {
		return new Matrix(rows, cols, Array(rows * cols).fill(0))
	}

	/**
	 * Returns a matrix filled with 1.
	 * @param {number} rows
	 * @param {number} cols
	 * @returns {Matrix}
	 */
	static ones(rows, cols) {
		return new Matrix(rows, cols, Array(rows * cols).fill(1))
	}

	/**
	 * Returns a identity matrix.
	 * @param {number} rows
	 * @param {number} cols
	 * @param {number} init Diagonal values
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
	 * @param {number} rows
	 * @param {number} cols
	 * @param {number} min
	 * @param {number} max
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
	 * @param {number} rows
	 * @param {number} cols
	 * @param {number | number[]} myu mean value(s)
	 * @param {number | Array<Array<number>>} sigma variance value or covariance matrix
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
		} else if (myu.cols !== cols || myu.rows !== 1) {
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
	 * @param {number[]} d
	 * @returns {Matrix}
	 */
	static diag(d) {
		const n = d.length
		const mat = new Matrix(n, n)
		for (let i = 0; i < n; i++) {
			mat._value[i * n + i] = d[i]
		}
		return mat
	}

	/**
	 * Returns a matrix from some value.
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
	 * @type {number[]}
	 */
	get value() {
		return this._value
	}

	/**
	 * Transpose matrix.
	 * @type {Matrix}
	 */
	get t() {
		return this.transpose()
	}

	/**
	 * Returns a nested array represented this matrix.
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
	 * Returns a string represented this matrix.
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
	 * @param {?Matrix} dst
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
	 * @param {*} other
	 * @returns {boolean}
	 */
	equals(other) {
		if (other instanceof Matrix) {
			if (this._size[0] !== other._size[0] || this._size[1] !== other._size[1]) {
				return false
			}
			for (let i = this.length - 1; i >= 0; i--) {
				if (this._value[i] !== other._value[i]) {
					return false
				}
			}
			return true
		}
		return false
	}

	/**
	 * Returns a value at the position.
	 * @param  {number} r
	 * @param  {number} c
	 * @returns {number}
	 */
	at(r, c) {
		if (r < 0 || this.rows <= r || c < 0 || this.cols <= c) throw new MatrixException('Index out of bounds.')
		return this._value[r * this.cols + c]
	}

	/**
	 * Set a value at the position.
	 * @param  {number} r
	 * @param  {number} c
	 * @param  {number | Matrix} value
	 * @returns {?number} Old value
	 */
	set(r, c, value) {
		if (value instanceof Matrix) {
			if (r < 0 || this.rows <= r + value.rows - 1 || c < 0 || this.cols <= c + value.cols - 1)
				throw new MatrixException('Index out of bounds.')
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
	 * @param {number | number[]} r
	 * @returns {Matrix}
	 */
	row(r) {
		if (Array.isArray(r)) {
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
	 * @param {number | number[]} c
	 * @returns {Matrix}
	 */
	col(c) {
		if (Array.isArray(c)) {
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
	 * Returns the sub-matrix corresponding to position.
	 * @param {number | number[]} [rows=0] Start row number or specified row indexes
	 * @param {number | number[]} [cols=0] Start column number or specified column indexes
	 * @param {?number} rows_to End row number(exclusive)
	 * @param {?number} cols_to End column number(exclusive)
	 * @param {?number[]} buffer
	 * @returns {Matrix}
	 */
	slice(rows, cols, rows_to, cols_to, buffer) {
		const range = (s, n) => {
			let r = new Int32Array(n - s)
			for (let i = 0; i < n - s; i++) {
				r[i] = i + s
			}
			return r
		}
		rows = Array.isArray(rows) ? rows : range(rows || 0, rows_to || this.rows)
		cols = Array.isArray(cols) ? cols : range(cols || 0, cols_to || this.cols)
		const mat = new Matrix(rows.length, cols.length, buffer)
		for (let i = 0; i < rows.length; i++) {
			for (let j = 0; j < cols.length; j++) {
				mat._value[i * cols.length + j] = this._value[rows[i] * this.cols + cols[j]]
			}
		}
		return mat
	}

	/**
	 * Returns the sub-matrix of specified row range.
	 * @param {number | number[]} [s=0] Start number or specified indexes
	 * @param {?number} e End number.
	 * @returns {Matrix}
	 */
	sliceRow(s, e) {
		return this.slice(s, null, e, null)
	}

	/**
	 * Returns the sub-matrix of specified column range.
	 * @param {number | number[]} [s=0] Start number or specified indexes
	 * @param {?number} e End number.
	 * @returns {Matrix}
	 */
	sliceCol(s, e) {
		return this.slice(null, s, null, e)
	}

	/**
	 * Remove specified indexes.
	 * @param {number | number[]} idx
	 * @param {number} axis
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
		} else {
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
		}
	}

	/**
	 * Remove specified indexes.
	 * @param {function (Matrix): boolean} cond
	 * @param {number} axis
	 */
	removeIf(cond, axis = 0) {
		const idx = []
		if (axis === 0) {
			for (let i = 0; i < this.rows; i++) {
				if (cond(this.row(i))) {
					idx.push(i)
				}
			}
		} else {
			for (let i = 0; i < this.cols; i++) {
				if (cond(this.col(i))) {
					idx.push(i)
				}
			}
		}
		this.remove(idx, axis)
	}

	/**
	 * Returns a matrix that sampled along the axis.
	 * @param {number} n
	 * @param {number} axis
	 * @param {boolean} index Returns sampled indexes or not
	 * @returns {Matrix | [Matrix, number[]]}
	 */
	sample(n, axis = 0, index = false) {
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
			if (index) {
				return [this.row(idx), idx]
			}
			return this.row(idx)
		} else {
			if (index) {
				return [this.col(idx), idx]
			}
			return this.col(idx)
		}
	}

	/**
	 * Fill in all the elements with the value.
	 * @param {number} value
	 */
	fill(value) {
		this._value.fill(value)
	}

	/**
	 * Iterate over all the elements and replace the value.
	 * @param {function (number, number): number} cb
	 */
	map(cb) {
		for (let i = this.length - 1; i >= 0; i--) {
			this._value[i] = cb(this._value[i], i)
		}
	}

	/**
	 * Returns a matrix that replace all the elements.
	 * @param {function (number, number): number} cb
	 * @param {?Matrix} dst
	 * @returns {Matrix}
	 */
	copyMap(cb, dst) {
		if (dst) {
			dst._size = [].concat(this._size)
			this._value.forEach((v, i) => (dst._value[i] = cb(v)))
			return dst
		}
		const map = new Matrix(this.rows, this.cols)
		for (let i = this.length - 1; i >= 0; i--) {
			map._value[i] = cb(this._value[i], i)
		}
		return map
	}

	/**
	 * Iterate over all the elements.
	 * @param {function (number, number, number[]): number} cb
	 */
	forEach(cb) {
		for (let i = this.length - 1; i >= 0; i--) {
			cb(this._value[i], i, this._value)
		}
	}

	/**
	 * Returns transpose matrix.
	 * @param {?Matrix} dst
	 * @returns {Matrix}
	 */
	transpose(dst) {
		const mat = dst || new Matrix(this.cols, this.rows)
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				mat._value[j * this.rows + i] = this._value[i * this.cols + j]
			}
		}
		return mat
	}

	/**
	 * Returns adjoint matrix.
	 * @param {?Matrix} dst
	 * @returns {Matrix}
	 */
	adjoint(dst) {
		return this.transpose(dst)
	}

	/**
	 * Flip values along the axis.
	 * @param {number} axis
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
		}
	}

	/**
	 * Swap the index a and b along the axis.
	 * @param {number} a
	 * @param {number} b
	 * @param {number} axis
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
		}
	}

	/**
	 * Sort values along the axis.
	 * @param {number} axis
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
	}

	/**
	 * Shuffle values along the axis.
	 * @param {number} axis
	 */
	shuffle(axis = 0) {
		const idx = []
		for (let i = 0; i < this._size[axis]; i++) {
			idx[i] = i
		}
		for (let i = idx.length - 1; i > 0; i--) {
			let r = Math.floor(Math.random() * (i + 1))
			;[idx[i], idx[r]] = [idx[r], idx[i]]
		}

		if (axis === 0) {
			this._value = this.row(idx)._value
		} else if (axis === 1) {
			this._value = this.col(idx)._value
		}
	}

	/**
	 * Returns resized matrix.
	 * @param {number} rows
	 * @param {number} cols
	 * @param {number} init Value of the extended region
	 * @returns {Matrix}
	 */
	resize(rows, cols, init = 0) {
		const mat = new Matrix(rows, cols)
		mat.fill(init)
		const mr = Math.min(this.rows, rows)
		const mc = Math.min(this.cols, cols)
		for (let i = 0; i < mr; i++) {
			for (let j = 0; j < mc; j++) {
				mat._value[i * cols + j] = this._value[i * this.cols + j]
			}
		}
		return mat
	}

	/**
	 * Reshape this.
	 * @param {number} rows
	 * @param {number} cols
	 */
	reshape(rows, cols) {
		if (this.length !== rows * cols) throw new MatrixException('Length is different.')
		this._size = [rows, cols]
	}

	/**
	 * Repeat the elements n times along the axis this.
	 * @param {number | number[]} n
	 * @param {number} axis
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
	 * @param {number | number[]} n
	 * @param {number} axis
	 * @param {?Matrix} dst
	 * @returns {Matrix}
	 */
	copyRepeat(n, axis = 0, dst) {
		let r = this.copy(dst)
		r.repeat(n, axis)
		return r
	}

	/**
	 * Returns a matrix concatinated this and m.
	 * @param {Matrix} m
	 * @param {number} axis
	 * @returns {Matrix}
	 */
	concat(m, axis = 0) {
		let mat = null
		if (axis === 0) {
			if (this.cols !== m.cols) throw new MatrixException('Size is different.')
			return new Matrix(this.rows + m.rows, this.cols, [].concat(this._value, m._value))
		} else if (axis === 1) {
			if (this.rows !== m.rows) throw new MatrixException('Size is different.')
			mat = this.resize(this.rows, this.cols + m.cols)
			for (let i = 0; i < this.rows; i++) {
				for (let j = 0; j < m.cols; j++) {
					mat._value[i * mat.cols + j + this.cols] = m._value[i * m.cols + j]
				}
			}
			return mat
		}
		throw new MatrixException('Invalid axis.')
	}

	/**
	 * Returns a matrix reduced along the axis with the callback function.
	 * @param {function (number, number, number): number} cb
	 * @param {number} init
	 * @param {number} axis If negative, reduce along all elements.
	 * @returns {Matrix | number}
	 */
	reduce(cb, init, axis = -1) {
		if (axis < 0) {
			return this._value.reduce(cb, init)
		}
		let v_step = axis === 0 ? 1 : this.cols
		let s_step = axis === 0 ? this.cols : 1
		const new_size = [].concat(this._size)
		new_size[axis] = 1
		const mat = Matrix.zeros(...new_size)
		for (let n = 0, nv = 0; n < mat.length; n++, nv += v_step) {
			let v = init ?? this._value[nv]
			for (let i = v === init ? 0 : 1; i < this._size[axis]; i++) {
				v = cb(v, this._value[i * s_step + nv], i)
			}
			mat._value[n] = v
		}
		return mat
	}

	/**
	 * Determines whether all the members of a matrix satisfy the specified test.
	 * @param {function (number, number, number[]): number} cb
	 * @param {number} axis
	 * @returns {boolean | Matrix}
	 */
	every(cb, axis = -1) {
		return this.reduce((f, v) => f && cb(v), true, axis)
	}

	/**
	 * Determines whether the specified callback function returns true for any element of a matrix.
	 * @param {function (number, number, number[]): number} cb
	 * @param {number} axis
	 * @returns {boolean | Matrix}
	 */
	some(cb, axis = -1) {
		return this.reduce((f, v) => f || cb(v), false, axis)
	}

	/**
	 * Returns maximum values along the axis.
	 * @param {number} axis If negative, returns the maximum value of the all element.
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
	 * @param {number} axis If negative, returns the minimum value of the all element.
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
	 * Returns quantile values along the axis.
	 * @param {number} q
	 * @param {number} axis If negative, returns the quantile value of the all element.
	 * @returns {Matrix | number}
	 */
	quantile(q, axis = -1) {
		if (q === 0) {
			return this.min(axis)
		} else if (q === 1) {
			return this.max(axis)
		}
		const quantile = (value, q) => {
			if (value.length === 1) {
				return value[0]
			}
			const q1 = q * (value.length - 1)
			const q0 = Math.floor(q1)
			if (q1 === q0) {
				return value[q0]
			}
			return value[q0] * (q1 - q0) + value[q0 + 1] * (1 - q1 + q0)
		}
		if (axis < 0) {
			const value = this._value.concat()
			value.sort((a, b) => a - b)
			return quantile(value, q)
		}

		const v_step = axis === 0 ? 1 : this.cols
		const s_step = axis === 0 ? this.cols : 1
		const mat = Matrix.zeros(...this._size.map((v, i) => (i === axis ? 1 : v)))
		for (let n = 0, nv = 0; n < mat.length; n++, nv += v_step) {
			const v = []
			for (let i = 1; i < this._size[axis]; i++) {
				v.push(this._value[i * s_step + nv])
			}
			v.sort((a, b) => a - b)
			mat._value[n] = quantile(v, q)
		}
		return mat
	}

	/**
	 * Returns maximum indexes along the axis.
	 * @param {number} axis
	 * @returns {Matrix | number}
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
	 * @param {number} axis
	 * @returns {Matrix | number}
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
	 * @param {number} axis If negative, returns a summation value of the all element.
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
	 * @param {number} axis If negative, returns a mean value of the all element.
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
	 * @param {number} axis If negative, returns a producted value of the all element.
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
	 * @param {number} axis If negative, returns a variance of the all element.
	 * @returns {Matrix | number}
	 */
	variance(axis = -1) {
		const m = this.mean(axis)
		if (axis < 0) {
			return this._value.reduce((acc, v) => acc + (v - m) ** 2, 0) / this.length
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
			mat._value[n] = v / this._size[axis]
		}
		return mat
	}

	/**
	 * Returns standard deviations along the axis.
	 * @param {number} axis If negative, returns a standard deviation of the all element.
	 * @returns {Matrix | number}
	 */
	std(axis = -1) {
		if (axis < 0) {
			return Math.sqrt(this.variance(axis))
		}
		let m = this.variance(axis)
		for (let i = 0; i < m.length; i++) {
			m._value[i] = Math.sqrt(m._value[i])
		}
		return m
	}

	/**
	 * Returns medians along the axis.
	 * @param {number} axis If negative, returns a median of the all element.
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
	 * Returns diagonal elements.
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
	 * Returns a norm.
	 * @param {number} p
	 * @returns {number}
	 */
	norm(p = 2) {
		if (p === Infinity) {
			let m = -Infinity
			for (let i = 0; i < this.length; i++) {
				m = Math.max(m, Math.abs(this._value[i]))
			}
			return m
		}
		let n = 0
		for (let i = 0; i < this.length; i++) {
			n += Math.abs(this._value[i]) ** p
		}
		if (p === 2) {
			return Math.sqrt(n)
		}
		return n ** (1 / p)
	}

	/**
	 * Returns if this is square matrix or not.
	 * @returns {boolean}
	 */
	isSquare() {
		return this.rows === this.cols
	}

	/**
	 * Returns if this is diagonal matrix or not.
	 * @param {number} tol
	 * @returns {boolean}
	 */
	isDiag(tol = 0) {
		const c = this.cols
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < c; j++) {
				if (i !== j) {
					if (Math.abs(this._value[i * c + j]) > tol) return false
				}
			}
		}
		return true
	}

	/**
	 * Returns if this is identity matrix or not.
	 * @param {number} tol
	 * @returns {boolean}
	 */
	isIdentity(tol = 0) {
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
	 * Returns if this is triangular matrix or not.
	 * @returns {boolean}
	 */
	isTriangular() {
		return this.isLowerTriangular() || this.isUpperTriangular()
	}

	/**
	 * Returns if this is lower triangular matrix or not.
	 * @param {number} tol
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
	 * @param {number} tol
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
	 * @param {number} tol
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
	 * @param {number} tol
	 * @returns {boolean}
	 */
	isHermitian(tol = 0) {
		return this.isSymmetric(tol)
	}

	/**
	 * Returns if this is regular matrix or not.
	 * @returns {boolean}
	 */
	isRegular() {
		return this.det() !== 0
	}

	/**
	 * Returns if this is normal matrix or not.
	 * @returns {boolean}
	 */
	isNormal() {
		return this.dot(this.t).equals(this.tDot(this))
	}

	/**
	 * Returns if this is orthogonal matrix or not.
	 * @param {number} tol
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
	 * @param {number} tol
	 * @returns {boolean}
	 */
	isUnitary(tol = 0) {
		return this.isOrthogonal(tol)
	}

	/**
	 * Multiply all elements by -1 in-place.
	 */
	negative() {
		this.map(v => (v ? -v : null))
	}

	/**
	 * Set all elements to their absolute values.
	 */
	abs() {
		this.map(Math.abs)
	}

	/**
	 * Add a value or matrix.
	 * @param {Matrix | number} o
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
	 * @param {number} r
	 * @param {number} c
	 * @param {number} v
	 * @returns {number} Old value
	 */
	addAt(r, c, v) {
		if (r < 0 || this.rows <= r || c < 0 || this.cols <= c) throw new MatrixException('Index out of bounds.')
		const old = this._value[r * this.cols + c]
		this._value[r * this.cols + c] = old + v
		return old
	}

	/**
	 * Returns a matrix that add a value.
	 * @param {Matrix | number} o
	 * @param {?Matrix} dst
	 * @returns {Matrix}
	 */
	copyAdd(o, dst) {
		let r = this.copy(dst)
		r.add(o)
		return r
	}

	/**
	 * Subtract a value or matrix.
	 * @param {Matrix | number} o
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
	 * @param {Matrix | number} o
	 */
	isub(o) {
		this.negative()
		this.add(o)
	}

	/**
	 * Subtract a value from the value at the position.
	 * @param {number} r
	 * @param {number} c
	 * @param {number} v
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
	 * @param {number} r
	 * @param {number} c
	 * @param {number} v
	 * @returns {number} Old value
	 */
	isubAt(r, c, v) {
		if (r < 0 || this.rows <= r || c < 0 || this.cols <= c) throw new MatrixException('Index out of bounds.')
		const old = this._value[r * this.cols + c]
		this._value[r * this.cols + c] = v - old
		return old
	}

	/**
	 * Returns a matrix that subtract value from this.
	 * @param {Matrix | number} o
	 * @param {?Matrix} dst
	 * @returns {Matrix}
	 */
	copySub(o, dst) {
		let r = this.copy(dst)
		r.sub(o)
		return r
	}

	/**
	 * Returns a matrix that subtract this from value.
	 * @param {Matrix | number} o
	 * @param {?Matrix} dst
	 * @returns {Matrix}
	 */
	copyIsub(o, dst) {
		let r = this.copy(dst)
		r.isub(o)
		return r
	}

	/**
	 * Multiplies by a value element-wise.
	 * @param {Matrix | number} o
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
	 * @param {number} r
	 * @param {number} c
	 * @param {number} v
	 * @returns {number} Old value
	 */
	multAt(r, c, v) {
		if (r < 0 || this.rows <= r || c < 0 || this.cols <= c) throw new MatrixException('Index out of bounds.')
		const old = this._value[r * this.cols + c]
		this._value[r * this.cols + c] = old * v
		return old
	}

	/**
	 * Returns a matrix that multiplies by a value element-wise.
	 * @param {Matrix | number} o
	 * @param {?Matrix} dst
	 * @returns {Matrix}
	 */
	copyMult(o, dst) {
		let r = this.copy(dst)
		r.mult(o)
		return r
	}

	/**
	 * Divides by a value element-wise.
	 * @param {Matrix | number} o
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
	 * @param {Matrix | number} o
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
	 * @param {number} r
	 * @param {number} c
	 * @param {number} v
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
	 * @param {number} r
	 * @param {number} c
	 * @param {number} v
	 * @returns {number} Old value
	 */
	idivAt(r, c, v) {
		if (r < 0 || this.rows <= r || c < 0 || this.cols <= c) throw new MatrixException('Index out of bounds.')
		const old = this._value[r * this.cols + c]
		this._value[r * this.cols + c] = v / old
		return old
	}

	/**
	 * Returns a matrix that divides by a value element-wise.
	 * @param {Matrix | number} o
	 * @param {?Matrix} dst
	 * @returns {Matrix}
	 */
	copyDiv(o, dst) {
		let r = this.copy(dst)
		r.div(o)
		return r
	}

	/**
	 * Returns a matrix that divides a value by this matrix element-wise.
	 * @param {Matrix | number} o
	 * @param {?Matrix} dst
	 * @returns {Matrix}
	 */
	copyIdiv(o, dst) {
		let r = this.copy(dst)
		r.idiv(o)
		return r
	}

	/**
	 * Returns a matrix product value.
	 * @param {Matrix} o
	 * @param {?Matrix} dst
	 * @returns {Matrix}
	 */
	dot(o, dst) {
		if (this.cols !== o.rows)
			throw new MatrixException(
				'Dot size invalid. left = [' +
					this.rows +
					', ' +
					this.cols +
					'], right = [' +
					o.rows +
					', ' +
					o.cols +
					']'
			)
		const ocol = o.cols
		const mat = dst || new Matrix(this.rows, ocol)
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
	 * @param {Matrix} o
	 * @param {?Matrix} dst
	 * @returns {Matrix}
	 */
	tDot(o, dst) {
		if (this.rows !== o.rows)
			throw new MatrixException(
				'tDot size invalid. left = [' +
					this.cols +
					', ' +
					this.rows +
					'], right = [' +
					o.rows +
					', ' +
					o.cols +
					']'
			)
		const mat = dst || new Matrix(this.cols, o.cols)
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
	 * Convoluted by a kernel.
	 * @param {Array<number> | Array<Array<number>>} kernel
	 * @param {boolean} normalize
	 */
	convolute(kernel, normalize = true) {
		if (!Array.isArray(kernel[0])) {
			kernel = [kernel]
		}
		const offset = Math.floor((kernel.length - 1) / 2)
		const v = this._value.concat()
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				let m = 0
				let ksum = 0
				for (let s = 0; s < kernel.length; s++) {
					const s0 = i + s - offset
					if (s0 < 0 || this.rows <= s0) {
						continue
					}
					for (let t = 0; t < kernel[s].length; t++) {
						const t0 = j + t - offset
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
	 */
	reducedRowEchelonForm() {
		for (let i = 0, j = 0; i < this.rows && j < this.cols; j++, i++) {
			if (this._value[i * this.cols + j] === 0) {
				for (let k = i + 1; k < this.rows; k++) {
					if (this._value[k * this.cols + j] !== 0) {
						this.swap(i, k, 0)
						break
					}
				}
			}
			if (this._value[i * this.cols + j] === 0) {
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
	 * Returns a rank of this matrix.
	 * This function has not been implemented yet.
	 * @returns {number}
	 */
	rank() {
		throw new MatrixException('Not implemented.')
	}

	/**
	 * Returns a determinant.
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
	 * Returns a inverse matrix.
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
			case 2:
				const d2 = this.det()
				return new Matrix(2, 2, [v[3] / d2, -v[1] / d2, -v[2] / d2, v[0] / d2])
			case 3:
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

		if (this.isLowerTriangular()) {
			return this.invLowerTriangular()
		} else if (this.isUpperTriangular()) {
			return this.invUpperTriangular()
		}
		return this.invLU()
	}

	/**
	 * Returns a inverse matrix for lower triangular matrix.
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
		const [evalue, evector] = this.eigen()
		const D = new Matrix(this.rows, this.cols)
		for (let i = 0; i < this.rows; i++) {
			D._value[i * this.cols + i] = Math.sqrt(evalue[i])
		}
		return evector.dot(D).dot(evector.transpose())
	}

	/**
	 * Returns a power of this matrix.
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
	 * Returns a solved value A of a equation XA=B.
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
		let a = this
		if (n < this.cols) {
			a = this.resize(this.rows, this.rows)
		}

		let x
		switch (n) {
			case 0:
				x = a
				break
			case 1:
				x = b.copyMap(v => v / a._value[0])
				break
			default:
				const [l, u] = a.lu()
				const y = l.solveLowerTriangular(b)
				x = u.solveUpperTriangular(y)
				break
		}
		if (n < this.cols) {
			x = x.resize(this.cols, x.cols)
		}
		return x
	}

	/**
	 * Returns a solved value for lower triangular matrix.
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
	 * Returns a covariance matrix.
	 * @param {number} ddof
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
	 * @returns {Matrix}
	 */
	gram() {
		return this.tDot(this)
	}

	/**
	 * Returns a bidiagonal matrix.
	 * @returns {Matrix}
	 */
	bidiag() {
		let a = this.copy()
		const [n, m] = [this.rows, this.cols]
		for (let i = 0; i < Math.min(n, m); i++) {
			let new_a = a.slice(i, i)
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
	 * @returns {Matrix}
	 */
	tridiag() {
		if (!this.isSymmetric()) {
			throw new MatrixException('Tridiagonal only define symmetric matrix.', this)
		}
		let a = this.copy()
		let n = this.cols
		for (let i = 0; i < n - 2; i++) {
			let v = a.slice(i + 1, i, n, i + 1)
			let alpha = v.norm() * (v._value[0] < 0 ? 1 : -1)
			v._value[0] -= alpha
			v.div(v.norm())

			let new_a = a.slice(i + 1, i + 1)
			let d = new_a.dot(v)
			let g = v.copyMult(v.tDot(d))
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
	 * Returns a LU decomposition.
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
			const norm = Math.sqrt(this.tDot(this).value[0])
			return [this.copyDiv(norm), new Matrix(1, 1, norm)]
		}
		return this.qrHouseholder()
	}

	/**
	 * Returns a QR decomposition by Gram-Schmidt method.
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
	 * @returns {[Matrix, Matrix]}
	 */
	qrHouseholder() {
		const n = this.rows
		const m = this.cols
		const a = this.copy()
		const u = Matrix.eye(n, n)
		for (let i = 0; i < Math.min(n, m) - 1; i++) {
			const ni = n - i
			const x = a.slice(i, i, n, i + 1)
			const alpha = x.norm() * Math.sign(x._value[0])
			x._value[0] -= alpha
			x.div(x.norm())

			let V = new Matrix(ni, ni)
			for (let j = 0; j < ni; j++) {
				const xvj = x._value[j]
				V._value[j * ni + j] = 1 - 2 * xvj ** 2
				if (!xvj) continue
				for (let k = 0; k < j; k++) {
					V._value[j * ni + k] = V._value[k * ni + j] = -2 * xvj * x._value[k]
				}
			}

			a.set(i, i, V.dot(a.slice(i, i)))
			u.set(i, 0, V.dot(u.slice(i, 0)))
		}
		return [u.t, a]
	}

	/**
	 * Returns singular values.
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
	 * @returns {[Matrix, number[], Matrix]}
	 */
	svd() {
		return this.svdEigen()
	}

	/**
	 * Returns a singular value decomposition by eigen decomposition.
	 * @returns {[Matrix, number[], Matrix]}
	 */
	svdEigen() {
		// https://ohke.hateblo.jp/entry/2017/12/14/230500
		const n = Math.min(this.cols, this.rows)
		if (this.cols <= this.rows) {
			const ata = this.tDot(this)
			const [ev, V] = ata.eigenJacobi()
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
			const [ev, U] = aat.eigenJacobi()
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
	 * @returns {Matrix}
	 */
	cholesky() {
		return this.choleskyBanachiewicz()
	}

	/**
	 * Returns a cholesky decomposition by Banachiewicz algorithm.
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
	 * Returns eigenvalues and eigenvectors. Eigenvectors correspond to each column of the matrix.
	 * @returns {[number[], Matrix]}
	 */
	eigen() {
		if (!this.isSquare()) {
			throw new MatrixException('Eigen values only define square matrix.', this)
		}
		if (this.rows <= 2) {
			return [this.eigenValues(), this.eigenVectors()]
		}
		if (this.isSymmetric(1.0e-15)) {
			return this.eigenJacobi()
		} else {
			const ev = this.eigenValues()
			const n = this.rows
			let evec = new Matrix(n, n)
			for (let i = 0; i < n; i++) {
				const [l, y] = this.eigenInverseIteration(ev[i])
				for (let j = 0; j < n; j++) {
					evec._value[j * n + i] = y._value[j]
				}
			}
			return [ev, evec]
		}
	}

	/**
	 * Returns eigenvalues.
	 * @returns {number[]}
	 */
	eigenValues() {
		if (!this.isSquare()) {
			throw new MatrixException('Eigen values only define square matrix.', this)
		}
		switch (this.rows) {
			case 0:
				return []
			case 1:
				return [this._value[0]]
			case 2:
				let p = this._value[0] + this._value[3]
				let q = Math.sqrt(p ** 2 - 4 * this.det())
				return [(p + q) / 2, (p - q) / 2]
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
	 * @returns {Matrix}
	 */
	eigenVectors() {
		if (!this.isSquare()) {
			throw new MatrixException('Eigen vectors only define square matrix.', this)
		}

		switch (this.rows) {
			case 0:
				return this
			case 1:
				return new Matrix(1, 1, [1])
			case 2:
				const ev = this.eigenValues()
				const v0 = [-this._value[1], this._value[0] - ev[0]]
				const v0d = Math.sqrt(v0[0] ** 2 + v0[1] ** 2)
				const v1 = [-this._value[1], this._value[0] - ev[1]]
				const v1d = Math.sqrt(v1[0] ** 2 + v1[1] ** 2)
				return new Matrix(2, 2, [v0[0] / v0d, v1[0] / v1d, v0[1] / v0d, v1[1] / v1d])
		}

		return this.eigen()[1]
	}

	/**
	 * Returns eigenvalues by LU decomposition.
	 * @returns {number[]}
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
		throw new MatrixException('eigenVectors not converged.', this)
	}

	/**
	 * Returns eigenvalues by QR decomposition.
	 * @returns {number[]}
	 */
	eigenValuesQR() {
		if (!this.isSquare()) {
			throw new MatrixException('Eigen values only define square matrix.', this)
		}

		let a = this.copy()
		const ev = []
		if (this.rows > 10 && this.isSymmetric()) {
			a = a.tridiag()
		}
		const tol = 1.0e-8
		for (let n = a.rows; n > 2; n--) {
			let maxCount = 1.0e6
			while (1) {
				let am = a.slice(n - 2, n - 2).eigenValues()
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
					throw new MatrixException('eigenValues not converged.', this)
				}
			}
			ev.push(a._value[a._value.length - 1])
			a = a.resize(n - 1, n - 1)
		}
		const ev2 = a.eigenValues()
		ev.push(...ev2)
		ev.sort((a, b) => b - a)
		return ev
	}

	/**
	 * Returns eigenvalues and eigenvectors. Eigenvectors correspond to each column of the matrix.
	 * @param {number} maxIteration
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
	 * @param {number} ev
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
