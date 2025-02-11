import Matrix, { MatrixException } from './matrix.js'

const normal_random = function (m, s) {
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
		/** @private */
		this._size = size.concat()
		/** @private */
		this._length = size.reduce((s, v) => s * v, 1)
		if (!value) {
			/** @private */
			this._value = Array(this._length).fill(0)
		} else if (Array.isArray(value)) {
			this._value = value.flat(size.length)
		} else {
			this._value = Array(this._length).fill(value)
		}
		/** @private */
		this._offset = 0
	}

	/**
	 * Returns a tensor filled with 0.
	 * @overload
	 * @param {...number} size Sizes for each dimension
	 * @returns {Tensor} Tensor filled with 0
	 */
	/**
	 * Returns a tensor filled with 0.
	 * @overload
	 * @param {number[]} size Sizes for each dimension
	 * @returns {Tensor} Tensor filled with 0
	 */
	/**
	 * @param {...number | number[]} size Sizes for each dimension
	 * @returns {Tensor} Tensor filled with 0
	 */
	static zeros(...size) {
		return new Tensor(Array.isArray(size[0]) ? size[0] : size)
	}

	/**
	 * Returns a tensor filled with 1.
	 * @overload
	 * @param {...number} size Sizes for each dimension
	 * @returns {Tensor} Tensor filled with 1
	 */
	/**
	 * Returns a tensor filled with 1.
	 * @overload
	 * @param {number[]} size Sizes for each dimension
	 * @returns {Tensor} Tensor filled with 1
	 */
	/**
	 * @param {...number | number[]} size Sizes for each dimension
	 * @returns {Tensor} Tensor filled with 1
	 */
	static ones(...size) {
		return new Tensor(Array.isArray(size[0]) ? size[0] : size, 1)
	}

	/**
	 * Returns a tensor initialized uniform random values.
	 * @param {number[]} size Sizes for each dimension
	 * @param {number} [min] Minimum value of the Tensor
	 * @param {number} [max] Maximum value of the Tensor
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
	 * @param {number[]} size Sizes for each dimension
	 * @param {number} [myu] Mean value of the Tensor
	 * @param {number} [sigma] Variance value of the Tensor
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
	 * @returns {Matrix} Matrix
	 * @throws {MatrixException} If the dimension of this tensor is not 2.
	 */
	toMatrix() {
		if (this.dimension !== 2) {
			throw new MatrixException('Only 2D tensor can convert to matrix.')
		}
		return new Matrix(...this._size, this._value)
	}

	/**
	 * Returns the only element.
	 * @returns {number} The only element
	 */
	toScaler() {
		if (this._value.length !== 1) {
			throw new MatrixException('The tensor cannot convert to scaler.')
		}
		return this._value[0]
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
	 * @returns {Tensor} Copied tensor
	 */
	copy() {
		return new Tensor(this._size, this.value.slice(this._offset, this._offset + this._length))
	}

	/**
	 * Returns this tensor is equals to the others.
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
	 * Returns value at the index position.
	 * @overload
	 * @param  {...number} i Index values
	 * @returns {number} The value
	 */
	/**
	 * Returns value at the index position.
	 * @overload
	 * @param  {number[]} i Index values
	 * @returns {number} The value
	 */
	/**
	 * @param  {...number | number[]} i Index values
	 * @returns {number} The value
	 */
	at(...i) {
		if (Array.isArray(i[0])) {
			i = i[0]
		}
		if (i.length !== this.dimension) {
			throw new MatrixException('Length is invalid.')
		}
		return this._value[this._to_position(...i)]
	}

	/**
	 * Returns tensor at the index position.
	 * @overload
	 * @param  {...number} i Index values
	 * @returns {Tensor} Sub tensor
	 */
	/**
	 * Returns tensor at the index position.
	 * @overload
	 * @param  {number[]} i Index values
	 * @returns {Tensor} Sub tensor
	 */
	/**
	 * @param  {...number | number[]} i Index values
	 * @returns {Tensor} Sub tensor
	 */
	index(...i) {
		if (Array.isArray(i[0])) {
			i = i[0]
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
	 * @param {number | number[]} i Index values
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
	 * @param {number | number[]} idx Select index value(s)
	 * @param {number} [axis] Axis
	 * @returns {Tensor} Selected tensor
	 */
	select(idx, axis = 0) {
		if (axis < 0 || this.dimension <= axis) {
			throw new MatrixException('Invalid axis.')
		}
		if (!Array.isArray(idx)) {
			idx = [idx]
		}
		let step = 1
		let sublen = 1
		for (let d = 0; d < axis; d++) {
			step *= this._size[d]
		}
		for (let d = axis + 1; d < this.dimension; d++) {
			sublen *= this._size[d]
		}
		const newSizes = this._size.concat()
		newSizes[axis] = idx.length
		const t = new Tensor(newSizes)
		for (let i = 0; i < idx.length; i++) {
			for (let k = 0; k < step; k++) {
				const toff1 = k * idx.length * sublen + i * sublen
				const toff2 = k * this._size[axis] * sublen + idx[i] * sublen
				for (let l = 0; l < sublen; l++) {
					t._value[toff1 + l] = this._value[toff2 + l]
				}
			}
		}
		return t
	}

	/**
	 * Returns a tensor sliced by first dimension.
	 * @param {number} from Start index
	 * @param {number} to End index
	 * @param {number} [axis] Axis
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
		const newSizes = this._size.concat()
		newSizes[axis] = to - from
		const t = new Tensor(newSizes)
		if (axis === 0) {
			let s = 1
			for (let d = 1; d < this.dimension; d++) {
				s *= this._size[d]
			}
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
	 * @param {number} value Filled value
	 */
	fill(value) {
		this._value = Array(this.length).fill(value)
	}

	/**
	 * Iterate over all the elements and replace the value.
	 * @param {function (number, number[], Tensor): number} cb Mapping function
	 */
	map(cb) {
		for (let i = this.length - 1; i >= 0; i--) {
			this._value[i] = cb(this._value[i], this._to_index(i), this)
		}
	}

	/**
	 * Iterate over all the elements.
	 * @param {function (number, number[], Tensor): void} cb Callback function
	 */
	forEach(cb) {
		for (let i = 0; i < this.length; i++) {
			cb(this._value[i], this._to_index(i), this)
		}
	}

	/**
	 * Returns a tensor transposed along the axis.
	 * @param {...number} axises Selected axises
	 * @returns {Tensor} Transposed tensor
	 */
	/**
	 * Returns a tensor transposed along the axis.
	 * @param {number[]} axises Selected axises
	 * @returns {Tensor} Transposed tensor
	 */
	/**
	 * @param {...number | number[]} axises Selected axises
	 * @returns {Tensor} Transposed tensor
	 */
	transpose(...axises) {
		if (Array.isArray(axises[0])) {
			axises = axises[0]
		}

		const t = new Tensor(axises.map(a => this._size[a]))
		for (let i = 0; i < this.length; i++) {
			const idx = this._to_index(i)
			t._value[t._to_position(...axises.map(a => idx[a]))] = this._value[i]
		}
		return t
	}

	/**
	 * Flip values along the axis.
	 * @param {number} [axis] Axis to be flipped
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
	 * @param {number} [axis] Axis
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
	 * @param {number[]} sizes New sizes
	 * @param {number} [init] Value of the extended region
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
	 * @overload
	 * @param {...number} sizes New sizes for each dimension
	 */
	/**
	 * Reshape this as the sizes.
	 * @overload
	 * @param {number[]} sizes New sizes for each dimension
	 */
	/**
	 * @param {...number | number[]} sizes New sizes for each dimension
	 */
	reshape(...sizes) {
		if (Array.isArray(sizes[0])) {
			sizes = sizes[0]
		}

		const negidx = sizes.indexOf(-1)
		if (negidx >= 0) {
			const rest = sizes.reduce((s, v) => s * (v === -1 ? 1 : v), 1)
			if (this.length % rest !== 0) {
				throw new MatrixException('Length is different.')
			}
			sizes[negidx] = this.length / rest
		} else if (sizes.reduce((s, v) => s * v, 1) !== this.length) {
			throw new MatrixException('Length is different.')
		}
		this._size = sizes.concat()
	}

	/**
	 * Repeat the elements n times along the axis this.
	 * @overload
	 * @param {number} n Repeated count
	 * @param {number} [axis] Axis to be repeated
	 */
	/**
	 * Repeat the elements n times along the axis this.
	 * @overload
	 * @param {number[]} n Repeated counts of each axis
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
		for (let i = 0; i < new_value.length; i++) {
			const a = Array(new_size.length)
			let p = i
			for (let d = new_size.length - 1; d >= 0; d--) {
				a[d] = (p % new_size[d]) % this._size[d]
				p = Math.floor(p / new_size[d])
			}
			new_value[i] = this.at(a)
		}
		this._value = new_value
		this._size = new_size
		this._length *= p
	}

	/**
	 * Concatenate this and t.
	 * @param {Tensor} t Concatenate tensor
	 * @param {number} [axis] Axis to be concatenated
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
	 * Returns a tensor reduced along all element with the callback function.
	 * @overload
	 * @param {function (number, number, number[], Tensor): number} cb Reducing function
	 * @param {*} [init] Initial value
	 * @returns {number} Reduced tensor or value
	 */
	/**
	 * Returns a tensor reduced along the axis with the callback function.
	 * @overload
	 * @param {function (number, number, number[], Tensor): number} cb Reducing function
	 * @param {*} init Initial value
	 * @param {number | number[]} axis Axis to be reduced. If negative, reduce along all elements.
	 * @param {boolean} [keepdims] Keep dimensions or not.
	 * @returns {Tensor | number} Reduced tensor or value
	 */
	/**
	 * @param {function (number, number, number[], Tensor): number} cb Reducing function
	 * @param {*} [init] Initial value
	 * @param {number | number[]} [axis] Axis to be reduced. If negative, reduce along all elements.
	 * @param {boolean} [keepdims] Keep dimensions or not.
	 * @returns {Tensor | number} Reduced tensor or value
	 */
	reduce(cb, init, axis = -1, keepdims = false) {
		if (typeof axis === 'number') {
			axis = [axis]
		}
		if (axis.includes(-1)) {
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
		if (axis.some(v => this.dimension <= v)) {
			throw new MatrixException('Invalid axis.')
		}
		axis.sort((a, b) => a - b)
		const newSizes = []
		if (keepdims) {
			newSizes.push(...this._size)
			for (let i = 0; i < axis.length; i++) {
				newSizes[axis[i]] = 1
			}
		} else {
			newSizes.push(...this._size.filter((_, i) => !axis.includes(i)))
		}
		const ten = Tensor.zeros(newSizes)
		for (let i = 0; i < ten.length; i++) {
			const p = ten._to_index(i)
			if (!keepdims) {
				for (let k = 0; k < axis.length; k++) {
					p.splice(axis[k], 0, 0)
				}
			}
			let v = init ?? this.at(p)
			const idx = Array(axis.length).fill(0)
			if (init == null) {
				idx[0] = 1
			}
			do {
				for (let k = 0; k < axis.length; k++) {
					p[axis[k]] = idx[k]
				}
				v = cb(v, this.at(p), p, this)
				for (let k = 0; k < idx.length; k++) {
					idx[k]++
					if (idx[k] < this._size[axis[k]]) {
						break
					}
					idx[k] = 0
				}
			} while (idx.some(v => v > 0))
			ten._value[i] = v
		}
		return ten
	}

	/**
	 * Apply function for all elements with broadcasting.
	 * @param {Tensor | Matrix | number} o Applied value
	 * @param {function (number, number): number} fn Applied function
	 */
	broadcastOperate(o, fn) {
		if (o instanceof Tensor || o instanceof Matrix) {
			if (this.dimension < o.dimension) {
				const dimdiff = o.dimension - this.dimension
				const repeat = Array(o.dimension).fill(1)
				for (let d = 0; d < dimdiff; d++) {
					repeat[d] = o.sizes[d]
				}
				for (let d = 0; d < this.dimension; d++) {
					if (this._size[d] < o.sizes[d + dimdiff]) {
						if (o.sizes[d + dimdiff] % this._size[d] !== 0) {
							throw new MatrixException(
								`Broadcasting size invalid. this: ${this.sizes}, other: ${o.sizes}`,
								[this, o]
							)
						}
						repeat[d + dimdiff] = o.sizes[d + dimdiff] / this._size[d]
					} else if (this._size[d] % o.sizes[d + dimdiff] !== 0) {
						throw new MatrixException(`Broadcasting size invalid. this: ${this.sizes}, other: ${o.sizes}`, [
							this,
							o,
						])
					}
				}
				this.reshape(...Array(dimdiff).fill(1), ...this._size)
				this.repeat(repeat)
			} else {
				const dimdiff = this.dimension - o.dimension
				const repeat = Array(this.dimension).fill(1)
				for (let d = 0; d < o.dimension; d++) {
					if (this._size[d + dimdiff] < o.sizes[d]) {
						if (o.sizes[d] % this._size[d + dimdiff] !== 0) {
							throw new MatrixException(
								`Broadcasting size invalid. this: ${this.sizes}, other: ${o.sizes}`,
								[this, o]
							)
						}
						repeat[d + dimdiff] = o.sizes[d] / this._size[d + dimdiff]
					} else if (this._size[d + dimdiff] % o.sizes[d] !== 0) {
						throw new MatrixException(`Broadcasting size invalid. this: ${this.sizes}, other: ${o.sizes}`, [
							this,
							o,
						])
					}
				}
				this.repeat(repeat)
			}
			const dimdiff = this.dimension - o.dimension
			for (let i = 0; i < this.length; i++) {
				const a = Array(o.dimension)
				let p = i
				for (let d = o.dimension - 1; d >= 0; d--) {
					a[d] = (p % this._size[d + dimdiff]) % o.sizes[d]
					p = Math.floor(p / this._size[d + dimdiff])
				}
				this._value[i] = fn(this._value[i], o.at(a))
			}
		} else {
			this.map(v => fn(v, o))
		}
	}

	/**
	 * Apply function to the position.
	 * @param {number | number[]} i Index values
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
