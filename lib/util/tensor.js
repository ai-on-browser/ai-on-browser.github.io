import Matrix, { MatrixException } from './matrix.js'

const normal_random = function (m = 0, s = 1) {
	const std = Math.sqrt(s)
	const x = Math.random()
	const y = Math.random()
	const X = Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * y)
	const Y = Math.sqrt(-2 * Math.log(x)) * Math.sin(2 * Math.PI * y)
	return [X * std + m, Y * std + m]
}

/**
 * Tensor class
 */
export default class Tensor {
	/**
	 * @param {number[]} size Sizes for each dimension
	 * @param {number | number[]} [value] Initial values
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
	 *
	 * @param {number[]} size Sizes for each dimension
	 * @returns {Tensor} Tensor filled with 0
	 */
	static zeros(size) {
		return new Tensor(size)
	}

	/**
	 * Returns a tensor filled with 1.
	 *
	 * @param {number[]} size Sizes for each dimension
	 * @returns {Tensor} Tensor filled with 1
	 */
	static ones(size) {
		return new Tensor(size, 1)
	}

	/**
	 * Returns a tensor initialized uniform random values.
	 *
	 * @param {number[]} size Sizes for each dimension
	 * @param {number} [min=0] Minimum value of the Tensor
	 * @param {number} [max=1] Maximum value of the Tensor
	 * @returns {Tensor} Tensor initialized uniform random values
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
	 *
	 * @param {number[]} size Sizes for each dimension
	 * @param {number} [myu=0] Mean value of the Tensor
	 * @param {number} [sigma=1] Variance value of the Tensor
	 * @returns {Tensor} Tensor initialized normal random values
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
	 *
	 * @param {Tensor | Matrix | Array<number> | number} arr Original values
	 * @returns {Tensor} Tensor from some value
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
	 *
	 * @type {number}
	 */
	get dimension() {
		return this._size.length
	}

	/**
	 * Sizes of the tensor.
	 *
	 * @type {number[]}
	 */
	get sizes() {
		return this._size
	}

	/**
	 * Number of all elements in the tensor.
	 *
	 * @type {number}
	 */
	get length() {
		return this._length
	}

	/**
	 * Elements in the tensor.
	 *
	 * @type {number[]}
	 */
	get value() {
		return this._value
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
	 * Returns a nested array represented this tensor.
	 *
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
	 *
	 * @returns {string} String represented this tensor
	 */
	toString() {
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
	 *
	 * @returns {Matrix} Matrix
	 * @throws {MatrixException} If the dimension of this tensor is not 2.
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
			if (i[d] < 0 || this._size[d] <= i[d]) {
				throw new MatrixException('Index out of bounds.')
			}
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
	 *
	 * @returns {Tensor} Copied tensor
	 */
	copy() {
		return new Tensor(this._size, this.value.slice(this._offset, this._offset + this._length))
	}

	/**
	 * Returns this tensor is equals to the others.
	 *
	 * @param {*} other Check tensor
	 * @returns {boolean} `true` if equal
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
	 *
	 * @param  {...number} i Index values
	 * @returns {number | Tensor} The value or sub tensor
	 */
	at(...i) {
		if (Array.isArray(i[0])) {
			i = i[0]
		}
		if (i.length === this.dimension) {
			return this._value[this._to_position(...i)]
		}

		let s = 0
		for (let d = 0; d < i.length; d++) {
			if (i[d] < 0 || this._size[d] <= i[d]) {
				throw new MatrixException('Index out of bounds.')
			}
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
	 * Set the value at the specific position.
	 *
	 * @param {number[]} i Index values
	 * @param {number} value Set value
	 */
	set(i, value) {
		if (!Array.isArray(i)) {
			i = [i]
		}
		this._value[this._to_position(...i)] = value
	}

	/**
	 * Returns the sub-tensor corresponding to position i in the first dimension of this.
	 *
	 * @param {number | number[]} idx Select index value(s)
	 * @param {number} [axis=0] Axis
	 * @returns {Tensor} Selected tensor
	 */
	select(idx, axis = 0) {
		if (axis !== 0) {
			throw new MatrixException('Invalid axis. Only 0 is accepted.')
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
	 * Returns a tensor sliced by first dimension.
	 *
	 * @param {number} from Start index
	 * @param {number} to End index
	 * @param {number} [axis=0] Axis
	 * @returns {Tensor} Sliced tensor
	 */
	slice(from, to, axis = 0) {
		if (axis < 0 || this.dimension <= axis) {
			throw new MatrixException('Invalid axis.')
		}
		if (from < 0 || this._size[axis] < to) {
			throw new MatrixException('Index out of bounds.')
		} else if (to < from) {
			throw new MatrixException('Invalid index.')
		}
		let s = 1
		for (let d = 0; d < this.dimension; d++) {
			if (d === axis) {
				continue
			}
			s *= this._size[d]
		}
		const newSizes = this._size.concat()
		newSizes[axis] = to - from
		const t = new Tensor(newSizes)
		if (axis === 0) {
			t._value = this._value.slice(from * s, to * s)
		} else {
			for (let i = 0; i < t.length; i++) {
				const p = t._to_index(i)
				p[axis] += from
				t._value[i] = this.at(p)
			}
		}
		return t
	}

	/**
	 * Fill in all the elements with the value.
	 *
	 * @param {number} value Filled value
	 */
	fill(value) {
		this._value = Array(this.length).fill(value)
	}

	/**
	 * Iterate over all the elements and replace the value.
	 *
	 * @param {function (number, number[], Tensor): number} cb Mapping function
	 */
	map(cb) {
		for (let i = this.length - 1; i >= 0; i--) {
			this._value[i] = cb(this._value[i], this._to_index(i), this)
		}
	}

	/**
	 * Iterate over all the elements.
	 *
	 * @param {function (number, number[], Tensor): void} cb Callback function
	 */
	forEach(cb) {
		for (let i = 0; i < this.length; i++) {
			cb(this._value[i], this._to_index(i), this)
		}
	}

	/**
	 * Returns a tensor transposed along the axis.
	 *
	 * @param {...number} axises Selected axises
	 * @returns {Tensor} Transposed tensor
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
	 * Flip values along the axis.
	 *
	 * @param {number} [axis=0] Axis to be flipped
	 */
	flip(axis = 0) {
		if (axis < 0 || this.dimension <= axis) {
			throw new MatrixException('Invalid axis.')
		}
		for (let i = 0; i < this.length; i++) {
			const p = this._to_index(i)
			if (p[axis] < this._size[axis] / 2) {
				p[axis] = this._size[axis] - p[axis] - 1
				const pos = this._to_position(...p)
				const tmp = this._value[pos]
				this._value[pos] = this._value[i]
				this._value[i] = tmp
			}
		}
	}

	/**
	 * Shuffle along the axis.
	 *
	 * @param {number} [axis=0] Axis
	 */
	shuffle(axis = 0) {
		if (axis < 0 || this.dimension <= axis) {
			throw new MatrixException('Invalid axis.')
		}
		const idx = Array.from({ length: this._size[axis] }, (_, i) => i)
		for (let i = idx.length - 1; i > 0; i--) {
			let r = Math.floor(Math.random() * (i + 1))
			;[idx[i], idx[r]] = [idx[r], idx[i]]
		}
		this._value = this.select(idx, axis)._value
	}

	/**
	 * Resize this tensor.
	 *
	 * @param {number[]} sizes New sizes
	 * @param {number} [init=0] Value of the extended region
	 */
	resize(sizes, init = 0) {
		const newValue = Array(sizes.reduce((s, v) => s * v, 1)).fill(init)
		const m = this._size.map((s, k) => Math.min(s, sizes[k]))
		for (let i = 0; i < this.length; i++) {
			const p = this._to_index(i)
			if (p.some((v, d) => v >= m[d])) {
				continue
			}
			let np = 0
			for (let d = 0; d < p.length; d++) {
				np = np * sizes[d] + p[d]
			}
			newValue[np] = this._value[i]
		}
		this._value = newValue
		this._size = sizes.concat()
	}

	/**
	 * Reshape this as the sizes.
	 *
	 * @param {...number} sizes New sizes for each dimension
	 */
	reshape(...sizes) {
		if (sizes.reduce((s, v) => s * v, 1) !== this.length) {
			throw new MatrixException('Length is different.')
		}
		this._size = sizes.concat()
	}

	/**
	 * Concatenate this and t.
	 *
	 * @param {Tensor} t Concatenate tensor
	 * @param {number} [axis=0] Axis to be concatenated
	 */
	concat(t, axis = 0) {
		if (this.dimension !== t.dimension) {
			throw new MatrixException('Size is different.')
		}
		if (axis < 0 || this.dimension <= axis) {
			throw new MatrixException('Invalid axis.')
		}
		for (let d = 0; d < this.dimension; d++) {
			if (axis !== d && this._size[d] !== t._size[d]) throw new MatrixException('Size is different.')
		}
		if (axis === 0) {
			this._value = [].concat(this._value, t._value)
			this._size[0] += t._size[0]
		} else {
			const newSizes = this._size.concat()
			const offset = this._size[axis]
			newSizes[axis] += t._size[axis]
			this.resize(newSizes)
			for (let i = 0; i < t.length; i++) {
				const p = t._to_index(i)
				p[axis] += offset
				this.set(p, t._value[i])
			}
		}
	}

	/**
	 * Returns a tensor reduced along the axis with the callback function.
	 *
	 * @param {function (number, number, number[], Tensor): number} cb Reducing function
	 * @param {*} [init] Initial value
	 * @param {number} [axis=-1] Axis to be reduced. If negative, reduce along all elements.
	 * @param {boolean} [keepdims=false] Keep dimensions or not.
	 * @returns {Tensor | number} Reduced tensor or value
	 */
	reduce(cb, init, axis = -1, keepdims = false) {
		if (axis < 0) {
			let v = init ?? this._value[0]
			for (let i = 0; i < this.length; i++) {
				if (i === 0 && init == null) {
					continue
				}
				v = cb(v, this._value[i], this._to_index(i), this)
			}
			if (keepdims) {
				return new Tensor(Array(this.dimension).fill(1), v)
			}
			return v
		}
		if (this.dimension <= axis) {
			throw new MatrixException('Invalid axis.')
		}
		const newSizes = []
		if (keepdims) {
			newSizes.push(...this._size)
			newSizes[axis] = 1
		} else {
			newSizes.push(...this._size.filter((_, i) => i !== axis))
		}
		const ten = Tensor.zeros(newSizes)
		for (let i = 0; i < ten.length; i++) {
			const p = ten._to_index(i)
			if (!keepdims) {
				p.splice(axis, 0, 0)
			}
			let v = init ?? this.at(p)
			for (let k = v === init ? 0 : 1; k < this._size[axis]; k++) {
				p[axis] = k
				v = cb(v, this.at(p), p, this)
			}
			ten._value[i] = v
		}
		return ten
	}

	/**
	 * Apply function for all elements with broadcasting.
	 *
	 * @param {Tensor | Matrix | number} o Applied value
	 * @param {function (number, number): number} fn Applied function
	 */
	broadcastOperate(o, fn) {
		if (o instanceof Matrix) {
			if (this.dimension < 2) {
				throw new MatrixException('Broadcasting size invalid.', [this, o])
			}
			if (this.sizes[this.dimension - 2] === o.rows && this.sizes[this.dimension - 1] === o.cols) {
				for (let i = this.length - 1; i >= 0; i--) {
					this._value[i] = fn(this._value[i], o._value[i % o.length])
				}
			} else if (this.sizes[this.dimension - 2] % o.rows === 0 && this.sizes[this.dimension - 1] % o.cols === 0) {
				for (let i = this.length - 1; i >= 0; i--) {
					const idx = this._to_index(i)
					this._value[i] = fn(
						this._value[i],
						o.at(idx[this.dimension - 2] % o.rows, idx[this.dimension - 1] % o.cols)
					)
				}
			} else {
				throw new MatrixException(`Broadcasting size invalid. this: ${this.sizes}, other: ${o.sizes}`, [
					this,
					o,
				])
			}
		} else if (o instanceof Tensor) {
			if (this.dimension < o.dimension) {
				throw new MatrixException(`Broadcasting size invalid. this: ${this.sizes}, other: ${o.sizes}`, [
					this,
					o,
				])
			}
			if (o.sizes.every((s, i) => s === this.sizes[this.dimension - o.dimension + i])) {
				for (let i = this.length - 1; i >= 0; i--) {
					this._value[i] = fn(this._value[i], o._value[i % o.length])
				}
			} else if (o.sizes.every((s, i) => this.sizes[this.dimension - o.dimension + i] % s === 0)) {
				for (let i = this.length - 1; i >= 0; i--) {
					const idx = this._to_index(i).slice(this.dimension - o.dimension)
					for (let k = 0; k < o.dimension; k++) {
						idx[k] %= o.sizes[k]
					}
					this._value[i] = fn(this._value[i], o.at(idx))
				}
			} else {
				throw new MatrixException(`Broadcasting size invalid. this: ${this.sizes}, other: ${o.sizes}`, [
					this,
					o,
				])
			}
		} else {
			this.map(v => fn(v, o))
		}
	}

	/**
	 * Apply function to the position.
	 *
	 * @param {number[]} i Index values
	 * @param {function (number): number} [fn] Applied function
	 * @returns {number} Old value
	 */
	operateAt(i, fn) {
		if (!Array.isArray(i)) {
			i = [i]
		}
		const pos = this._to_position(...i)
		const old = this._value[pos]
		this._value[pos] = fn(old)
		return old
	}

	/**
	 * Returns a tensor product value.
	 *
	 * @param {Matrix} o Right matrix
	 * @returns {Tensor} Producted tensor
	 */
	dot(o) {
		if (this._size[this._size.length - 1] !== o.rows) {
			throw new MatrixException(`Dot size invalid. left = [${this.sizes}], right = [${o.rows}, ${o.cols}]`)
		}
		const ten = new Tensor([...this._size.slice(0, -1), o.cols])
		const idx = Array(this._size.length - 1).fill(0)
		do {
			for (let i = 0; i < o.cols; i++) {
				let v = 0
				for (let k = 0; k < o.rows; k++) {
					v += this.at(...idx, k) * o.at(k, i)
				}
				ten.set([...idx, i], v)
			}

			for (let i = 0; i < idx.length; i++) {
				idx[i]++
				if (idx[i] < this._size[i]) {
					break
				}
				idx[i] = 0
			}
		} while (idx.some(v => v > 0))
		return ten
	}
}
