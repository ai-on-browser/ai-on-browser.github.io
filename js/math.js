const randint = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const argmin = function(arr, key) {
	if (arr.length == 0) {
		return -1;
	}
	arr = (key) ? arr.map(key) : arr;
	return arr.indexOf(Math.min(...arr));
}
const argmax = function(arr, key) {
	if (arr.length == 0) {
		return -1;
	}
	arr = (key) ? arr.map(key) : arr;
	return arr.indexOf(Math.max(...arr));
}

const normal_random = function(m = 0, s = 1) {
	const x = Math.random();
	const y = Math.random();
	const X = Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * y);
	const Y = Math.sqrt(-2 * Math.log(x)) * Math.sin(2 * Math.PI * y);
	return [X * s + m, Y * s + m];
}
const clip = function clip(value, min, max) {
	return (Array.isArray(value)) ? value.map(v => clip(v, min, max)) : Math.max(min, Math.min(max, value));
}

const shuffle = function(arr) {
	for (let i = arr.length - 1; i > 0; i--) {
		let r = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[r]] = [arr[r], arr[i]];
	}
	return arr;
}

class Tree {
	constructor(value, childs) {
		this.value = value;
		this.childs = childs || [];
		this.childs.forEach(c => c.parent = this);
		this.parent = null;
	}

	get length() {
		return this.childs.length;
	}

	get depth() {
		return (this.isLeaf()) ? 1 : (1 + Math.max.apply(null, this.childs.map(c => c.depth)));
	}

	at(index) {
		return this.childs[index];
	}

	push(value) {
		value = (value instanceof Tree) ? value : new Tree(value);
		this.childs.push(value);
		value.parent = this;
	}

	set(index, value) {
		if (index < 0 || this.childs.length <= index) {
			return;
		}
		value = (value instanceof Tree) ? value : new Tree(value);
		this.childs[index].parent = null;
		this.childs[index] = value;
		value.parent = this;
	}

	removeAt(index) {
		if (index < 0 || this.childs.length <= index) {
			return;
		}
		this.childs[index].parent = null;
		return this.childs.splice(index, 1)
	}

	clear() {
		this.childs.forEach(c => c.parent = null);
		this.childs.length = 0;
	}

	isLeaf() {
		return this.childs.length == 0;
	}

	isRoot() {
		return this.parent == null;
	}

	root() {
		return (this.isRoot()) ? this : this.parent.root();
	}

	leafs() {
		let vals = [];
		this.scanLeaf(l => vals.push(l));
		return vals;
	}

	leafValues() {
		let vals = [];
		this.scanLeaf(l => vals.push(l.value));
		return vals;
	}

	leafCount() {
		return (this.isLeaf()) ? 1 : this.childs.reduce((acc, c) => acc + c.leafCount(), 0);
	}

	forEach(cb, thisArg) {
		this.childs.forEach(cb, thisArg);
	}

	scan(cb) {
		cb(this);
		this.childs.forEach(c => c.scan(cb));
	}

	scanLeaf(cb) {
		(this.isLeaf()) ? cb(this) : this.childs.forEach(c => c.scanLeaf(cb));
	}
}

function MatrixException(message, value) {
	this.message = message;
	this.value = value;
	this.name = MatrixException;
}

class Matrix {
	constructor(rows, cols, values) {
		if (!values) {
			this._value = Array(rows * cols);
		} else if (!Array.isArray(values)) {
			this._value = Array(rows * cols).fill(values);
		} else if (Array.isArray(values[0])) {
			let n = values.reduce((s, v) => s + v.length, 0);
			this._value = Array(n);
			for (let i = 0, c = 0; i < values.length; i++) {
				for (let j = 0; j < values[i].length; j++, c++) {
					this._value[c] = values[i][j];
				}
			}
		} else {
			this._value = values;
		}
		this._size = [rows, cols];
		this._length = rows * cols;
	}

	static zeros(rows, cols) {
		return new Matrix(rows, cols, Array(rows * cols).fill(0));
	}

	static ones(rows, cols) {
		return new Matrix(rows, cols, Array(rows * cols).fill(1));
	}

	static eye(rows, cols, init = 1) {
		const mat = new Matrix(rows, cols);
		const rank = Math.min(rows, cols);
		for (let i = 0; i < rank; i++) {
			mat._value[i * cols + i] = init;
		}
		return mat;
	}

	static random(rows, cols, min = 0, max = 1) {
		const mat = new Matrix(rows, cols);
		for (let i = 0; i < mat.length; i++) {
			mat._value[i] = Math.random() * (max - min) + min;
		}
		return mat;
	}

	static randn(rows, cols, myu = 0, sigma = 1) {
		const mat = new Matrix(rows, cols);
		for (let i = 0; i < mat.length; i += 2) {
			const nr = normal_random(myu, sigma);
			mat._value[i] = nr[0];
			if (i + 1 < mat.length) {
				mat._value[i + 1] = nr[1];
			}
		}
		return mat;
	}

	static diag(d) {
		const n = d.length;
		const mat = new Matrix(n, n);
		for (let i = 0; i < n; i++) {
			mat._value[i * n + i] = d[i];
		}
		return mat;
	}

	static fromArray(arr) {
		if (!Array.isArray(arr)) {
			return new Matrix(1, 1, att);
		} else if (arr.length === 0) {
			return new Matrix(0, 0);
		} else if (!Array.isArray(arr[0])) {
			return new Matrix(arr.length, 1, arr);
		}
		return new Matrix(arr.length, arr[0].length, arr);
	}

	get size() {
		return this._size;
	}

	get length() {
		return this._length;
	}

	get rows() {
		return this._size[0];
	}

	get cols() {
		return this._size[1];
	}

	get value() {
		return this._value;
	}

	get t() {
		return this.transpose();
	}

	toArray() {
		const arr = [];
		const n = this.cols;
		for (let i = 0; i < this.length; i += n) {
			arr.push(this._value.slice(i, i + n));
		}
		return arr;
	}

	toString() {
		let s = "[";
		for (let i = 0; i < this.rows; i++) {
			if (i > 0) s += ",\n ";
			s += "[";
			for (let j = 0; j < this.cols; j++) {
				if (j > 0) s += ", ";
				s += this._value[i * this.cols + j] || 0;
			}
			s += "]"
		}
		return s + "]";
	}

	transpose(dst) {
		const mat = dst || new Matrix(this.cols, this.rows);
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				mat._value[j * this.rows + i] = this._value[i * this.cols + j];
			}
		}
		return mat;
	}

	copy(dst) {
		if (dst === this) {
			return this;
		} else if (dst) {
			dst._size = [].concat(this._size);
			this._value.forEach((v, i) => dst._value[i] = v);
			return dst;
		}
		return new Matrix(this.rows, this.cols, [].concat(this._value));
	}

	at(r, c) {
		if (r < 0 || this.rows <= r || c < 0 || this.cols <= c) throw new MatrixException("Index out of bounds.");
		return this._value[r * this.cols + c] || 0;
	}

	set(r, c, value) {
		if (value instanceof Matrix) {
			if (r < 0 || this.rows <= r + value.rows - 1 || c < 0 || this.cols <= c + value.cols - 1) throw new MatrixException("Index out of bounds.");
			for (let i = 0; i < value.rows; i++) {
				for (let j = 0; j < value.cols; j++) {
					this._value[(i + r) * this.cols + j + c] = value._value[i * value.cols + j];
				}
			}
			return null;
		} else {
			if (r < 0 || this.rows <= r || c < 0 || this.cols <= c) throw new MatrixException("Index out of bounds.");
			const old = this._value[r * this.cols + c] || 0;
			this._value[r * this.cols + c] = value;
			return old;
		}
	}

	row(r) {
		if (r < 0 || this.rows <= r) throw new MatrixException("Index out of bounds.");
		return new Matrix(1, this.cols, this._value.slice(r * this.cols, (r + 1) * this.cols));
	}

	col(c) {
		if (c < 0 || this.cols <= c) throw new MatrixException("Index out of bounds.");
		const mat = new Matrix(this.rows, 1);
		for (let i = 0; i < this.rows; i++) {
			mat._value[i] = this._value[i * this.cols + c];
		}
		return mat;
	}

	select(rows, cols, rows_to, cols_to, buffer) {
		const range = (s, n) => {
			let r = [];
			for (let i = 0; i < n - s; i++) {
				r[i] = i + s;
			}
			return r;
		}
		rows = (Array.isArray(rows)) ? rows : range(rows || 0, rows_to || this.rows);
		cols = (Array.isArray(cols)) ? cols : range(cols || 0, cols_to || this.cols);
		const mat = new Matrix(rows.length, cols.length, buffer);
		for (let i = 0; i < rows.length; i++) {
			for (let j = 0; j < cols.length; j++) {
				mat._value[i * cols.length + j] = this._value[rows[i] * this.cols + cols[j]];
			}
		}
		return mat;
	}

	fill(value) {
		this._value = (value == 0) ? [] : Array(this.length).fill(value);
	}

	map(cb) {
		for (let i = this.length - 1; i >= 0; i--) {
			this._value[i] = cb(this._value[i] || 0, i);
		}
	}

	copyMap(cb, dst) {
		if (dst) {
			dst._size = [].concat(this._size);
			this._value.forEach((v, i) => dst._value[i] = cb(v));
			return dst;
		}
		const map = new Matrix(this.rows, this.cols, this._value.map(cb));
		return map;
	}

	forEach(cb) {
		for (let i = this.length - 1; i >= 0; i--) {
			cb(this._value[i] || 0, i, this._value);
		}
	}

	flip(axis = 0) {
		if (axis == 0) {
			for (let i = 0; i < this.rows / 2; i++) {
				const t = this.rows - i - 1;
				for (let j = 0; j < this.cols; j++) {
					let tmp = this._value[i * this.cols + j];
					this._value[i * this.cols + j] = this._value[t * this.cols + j];
					this._value[t * this.cols + j] = tmp;
				}
			}
		} else if (axis == 1) {
			for (let j = 0; j < this.cols / 2; j++) {
				const t = this.cols - j - 1;
				for (let i = 0; i < this.cols; i++) {
					let tmp = this._value[i * this.cols + j];
					this._value[i * this.cols + j] = this._value[i * this.cols + t];
					this._value[i * this.cols + t] = tmp;
				}
			}
		}
	}

	swap(a, b, axis = 0) {
		if (axis === 0) {
			if (a < 0 || b < 0 || this.rows <= a || this.rows <= b) throw new MatrixException("Index out of bounds.");
			const diff = (b - a) * this.cols;
			for (let j = a * this.cols; j < (a + 1) * this.cols; j++) {
				[this._value[j], this._value[j + diff]] = [this._value[j + diff], this._value[j]]
			}
		} else if (axis === 1) {
			if (a < 0 || b < 0 || this.cols <= a || this.cols <= b) throw new MatrixException("Index out of bounds.");
			const diff = b - a
			for (let j = a; j < this.length; j += this.cols) {
				[this._value[j], this._value[j + diff]] = [this._value[j + diff], this._value[j]]
			}
		}
	}

	resize(rows, cols, init = 0) {
		const mat = new Matrix(rows, cols);
		mat.fill(init);
		const mr = Math.min(this.rows, rows);
		const mc = Math.min(this.cols, cols);
		for (let i = 0; i < mr; i++) {
			for (let j = 0; j < mc; j++) {
				mat._value[i * cols + j] = this._value[i * this.cols + j];
			}
		}
		return mat;
	}

	reshape(rows, cols) {
		if (this.length != rows * cols) throw new MatrixException("Length is different.");
		this._size = [rows, cols];
	}

	repeat(n, axis = 0) {
		let mat = null;
		if (axis == 0) {
			mat = new Matrix(this.rows * n, this.cols);
		} else if (axis == 1) {
			mat = new Matrix(this.rows, this.cols * n);
		}
		for (let i = 0; i < mat.rows; i++) {
			for (let j = 0; j < mat.cols; j++) {
				mat._value[i * mat.cols + j] = this.at(i % this.rows, j % this.cols);
			}
		}
		return mat;
	}

	concat(m, axis = 0) {
		let mat = null;
		if (axis == 0) {
			if (this.cols != m.cols) throw new MatrixException("Size is different.");
			return new Matrix(this.rows + m.rows, this.cols, [].concat(this._value, m._value));
		} else if (axis == 1) {
			if (this.rows != m.rows) throw new MatrixException("Size is different.");
			mat = this.resize(this.rows, this.cols + m.cols);
			for (let i = 0; i < this.rows; i++) {
				for (let j = 0; j < m.cols; j++) {
					mat._value[i * mat.cols + j + this.cols] = m._value[i * m.cols + j];
				}
			}
			return mat;
		}
		throw new MatrixException("Invalid axis.");
	}

	reduce(cb, init, axis = -1) {
		if (axis < 0) {
			return this._value.reduce(cb, init);
		}
		let v_step = (axis == 0) ? 1 : this.cols;
		let s_step = (axis == 0) ? this.cols : 1;
		const new_size = [].concat(this.size);
		new_size[axis] = 1;
		const mat = Matrix.zeros(...new_size);
		for (let n = 0, nv = 0; n < mat.length; n++, nv += v_step) {
			let v = init || this._value[nv] || 0;
			for (let i = (init) ? 0 : 1; i < this.size[axis]; i++) {
				v = cb(v, this._value[i * s_step + nv] || 0, i);
			}
			mat._value[n] = v;
		}
		return mat;
	}

	max(axis = -1) {
		if (axis < 0) {
			return Math.max(...this._value);
		}
		const amax = this.argmax(axis);
		let v_step = (axis == 0) ? 1 : this.cols;
		let s_step = (axis == 0) ? this.cols : 1;
		amax._value = amax._value.map((v, i) => this._value[v * s_step + i * v_step]);
		return amax;
	}

	min(axis = -1) {
		if (axis < 0) {
			return Math.min(...this._value);
		}
		const amin = this.argmin(axis);
		let v_step = (axis == 0) ? 1 : this.cols;
		let s_step = (axis == 0) ? this.cols : 1;
		amin._value = amin._value.map((v, i) => this._value[v * s_step + i * v_step]);
		return amin;
	}

	argmax(axis) {
		let v_step = (axis == 0) ? 1 : this.cols;
		let s_step = (axis == 0) ? this.cols : 1;
		const new_size = [].concat(this.size);
		new_size[axis] = 1;
		const mat = Matrix.zeros(...new_size);
		for (let n = 0, nv = 0; n < mat.length; n++, nv += v_step) {
			let v = this._value[nv] || 0;
			let idx = 0;
			for (let i = 1; i < this.size[axis]; i++) {
				let tmp = this._value[i * s_step + nv] || 0;
				if (tmp > v) {
					v = tmp;
					idx = i;
				}
			}
			mat._value[n] = idx;
		}
		return mat;
	}

	argmin(axis) {
		let v_step = (axis == 0) ? 1 : this.cols;
		let s_step = (axis == 0) ? this.cols : 1;
		const new_size = [].concat(this.size);
		new_size[axis] = 1;
		const mat = Matrix.zeros(...new_size);
		for (let n = 0, nv = 0; n < mat.length; n++, nv += v_step) {
			let v = this._value[nv] || 0;
			let idx = 0;
			for (let i = 1; i < this.size[axis]; i++) {
				let tmp = this._value[i * s_step + nv] || 0;
				if (tmp < v) {
					v = tmp;
					idx = i;
				}
			}
			mat._value[n] = idx;
		}
		return mat;
	}

	sum(axis = -1) {
		if (axis < 0) {
			return this._value.reduce((acc, v) => acc + (v || 0), 0);
		}
		let v_step = (axis == 0) ? 1 : this.cols;
		let s_step = (axis == 0) ? this.cols : 1;
		const new_size = [].concat(this.size);
		new_size[axis] = 1;
		const mat = Matrix.zeros(...new_size);
		for (let n = 0, nv = 0; n < mat.length; n++, nv += v_step) {
			let v = 0;
			for (let i = 0; i < this.size[axis]; i++) {
				v += this._value[i * s_step + nv] || 0;
			}
			mat._value[n] = v;
		}
		return mat;
	}

	mean(axis = -1) {
		if (axis < 0) {
			return this.sum(axis) / this.length;
		}
		let m = this.sum(axis);
		m.div(this.size[axis]);
		return m;
	}

	prod(axis = -1) {
		if (axis < 0) {
			return this._value.reduce((acc, v) => acc * (v || 0), 1);
		}
		let v_step = (axis == 0) ? 1 : this.cols;
		let s_step = (axis == 0) ? this.cols : 1;
		const new_size = [].concat(this.size);
		new_size[axis] = 1;
		const mat = Matrix.zeros(...new_size);
		for (let n = 0, nv = 0; n < mat.length; n++, nv += v_step) {
			let v = 1;
			for (let i = 0; i < this.size[axis]; i++) {
				v *= this._value[i * s_step + nv] || 0;
			}
			mat._value[n] = v;
		}
		return mat;
	}

	vari(axis = -1) {
		const m = this.mean(axis)
		if (axis < 0) {
			return this._value.reduce((acc, v) => acc + ((v || 0) - m) ** 2, 0) / this.length;
		}
		let v_step = (axis == 0) ? 1 : this.cols;
		let s_step = (axis == 0) ? this.cols : 1;
		const new_size = [].concat(this.size);
		new_size[axis] = 1;
		const mat = Matrix.zeros(...new_size);
		for (let n = 0, nv = 0; n < mat.length; n++, nv += v_step) {
			let v = 0;
			for (let i = 0; i < this.size[axis]; i++) {
				v += ((this._value[i * s_step + nv] || 0) - m._value[n]) ** 2;
			}
			mat._value[n] = v / this.size[axis];
		}
		return mat;
	}

	std(axis = -1) {
		if (axis < 0) {
			return Math.sqrt(this.vari(axis));
		}
		let m = this.vari(axis);
		for (let i = 0; i < m.length; i++) {
			m._value[i] = Math.sqrt(m._value[i]);
		}
		return m;
	}

	diag() {
		let d = [];
		const rank = Math.min(this.rows, this.cols);
		for (let i = 0; i < rank; i++) {
			d.push(this._value[i * this.cols + i]);
		}
		return d;
	}

	trace() {
		let t = 0;
		const rank = Math.min(this.rows, this.cols);
		for (let i = 0; i < rank; i++) {
			t += mat._value[i * cols + i] || 0;
		}
		return t;
	}

	norm(p = 2) {
		let n = 0;
		for (let i = 0; i < this.length; i++) {
			n += (this._value[i] || 0) ** p;
		}
		if (p == 2) {
			return Math.sqrt(n);
		}
		throw new MatrixException("Not implemented norm p != 2");
	}

	isSquare() {
		return this.rows === this.cols;
	}

	isDiag() {
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				if (i != j && this._value[i * this.cols + j]) return false;
			}
		}
		return true;
	}

	isTriangular() {
		return this.isLowerTriangular() || this.isUpperTriangular();
	}

	isLowerTriangular() {
		for (let i = 0; i < this.rows; i++) {
			for (let j = i + 1; j < this.cols; j++) {
				if (this._value[i * this.cols + j]) return false;
			}
		}
		return true;
	}

	isUpperTriangular() {
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < i; j++) {
				if (this._value[i * this.cols + j]) return false;
			}
		}
		return true;
	}

	isSymmetric(tol = 0) {
		if (!this.isSquare()) return false;
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < i; j++) {
				if (tol > 0) {
					if (Math.abs(this._value[i * this.cols + j] - this._value[j * this.cols + i]) >= tol) return false;
				} else if (this._value[i * this.cols + j] != this._value[j * this.cols + i]) return false;
			}
		}
		return true;
	}

	negative() {
		this.map(v => (v) ? -v : null);
	}

	abs() {
		this.map(Math.abs);
	}

	add(o) {
		if (o instanceof Matrix) {
			if (this.rows != o.rows && this.cols != o.cols) throw new MatrixException("Addition size invalid.", [this, o]);
			if (this.rows != o.rows) {
				for (let i = 0; i < this.length; i++) {
					this._value[i] = (this._value[i] || 0) + (o._value[i % o.length] || 0);
				}
			} else if (this.cols != o.cols) {
				for (let i = 0; i < this.length; i++) {
					this._value[i] = (this._value[i] || 0) + (o._value[Math.floor(i / this.cols) + (i % this.cols) % o.cols] || 0);
				}
			} else {
				for (let i = 0; i < this.length; i++) {
					this._value[i] = (this._value[i] || 0) + (o._value[i] || 0);
				}
			}
		} else {
			this.map(v => v + o);
		}
	}

	addAt(r, c, v) {
		if (r < 0 || this.rows <= r || c < 0 || this.cols <= c) throw new MatrixException("Index out of bounds.");
		const old = this._value[r * this.cols + c] || 0
		this._value[r * this.cols + c] = old + v;
		return old;
	}

	copyAdd(o, dst) {
		let r = this.copy(dst);
		r.add(o);
		return r;
	}

	sub(o) {
		if (o instanceof Matrix) {
			if (this.rows != o.rows && this.cols != o.cols) throw new MatrixException("Subtract size invalid.", [this, o]);
			if (this.rows != o.rows) {
				for (let i = 0; i < this.length; i++) {
					this._value[i] = (this._value[i] || 0) - (o._value[i % o.length] || 0);
				}
			} else if (this.cols != o.cols) {
				for (let i = 0; i < this.length; i++) {
					this._value[i] = (this._value[i] || 0) - (o._value[Math.floor(i / this.cols) + (i % this.cols) % o.cols] || 0);
				}
			} else {
				for (let i = 0; i < this.length; i++) {
					this._value[i] = (this._value[i] || 0) - (o._value[i] || 0);
				}
			}
		} else {
			this.map(v => v - o);
		}
	}

	isub(o) {
		this.negative();
		this.add(o);
	}

	subAt(r, c, v) {
		if (r < 0 || this.rows <= r || c < 0 || this.cols <= c) throw new MatrixException("Index out of bounds.");
		const old = this._value[r * this.cols + c] || 0
		this._value[r * this.cols + c] = old - v;
		return old;
	}

	isubAt(r, c, v) {
		if (r < 0 || this.rows <= r || c < 0 || this.cols <= c) throw new MatrixException("Index out of bounds.");
		const old = this._value[r * this.cols + c] || 0
		this._value[r * this.cols + c] = v - old;
		return old;
	}

	copySub(o, dst) {
		let r = this.copy(dst);
		r.sub(o);
		return r;
	}

	copyIsub(o, dst) {
		let r = this.copy(dst);
		r.isub(o);
		return r;
	}

	mult(o) {
		if (o instanceof Matrix) {
			if (this.rows != o.rows && this.cols != o.cols) throw new MatrixException("Multiple size invalid.", [this, o]);
			if (this.rows != o.rows) {
				for (let i = 0; i < this.length; i++) {
					this._value[i] = (this._value[i] || 0) * (o._value[i % o.length] || 0);
				}
			} else if (this.cols != o.cols) {
				for (let i = 0; i < this.length; i++) {
					this._value[i] = (this._value[i] || 0) * (o._value[Math.floor(i / this.cols) + (i % this.cols) % o.cols] || 0);
				}
			} else {
				for (let i = 0; i < this.length; i++) {
					this._value[i] = (this._value[i] || 0) * (o._value[i] || 0);
				}
			}
		} else {
			this.map(v => v * o);
		}
	}

	multAt(r, c, v) {
		if (r < 0 || this.rows <= r || c < 0 || this.cols <= c) throw new MatrixException("Index out of bounds.");
		const old = this._value[r * this.cols + c] || 0
		this._value[r * this.cols + c] = old * v;
		return old;
	}

	copyMult(o, dst) {
		let r = this.copy(dst);
		r.mult(o);
		return r;
	}

	div(o) {
		if (o instanceof Matrix) {
			if (this.rows != o.rows && this.cols != o.cols) throw new MatrixException("Divide size invalid.", [this, o]);
			if (this.rows != o.rows) {
				for (let i = 0; i < this.length; i++) {
					this._value[i] = (this._value[i] || 0) / (o._value[i % o.length] || 0);
				}
			} else if (this.cols != o.cols) {
				for (let i = 0; i < this.length; i++) {
					this._value[i] = (this._value[i] || 0) / (o._value[Math.floor(i / this.cols) + (i % this.cols) % o.cols] || 0);
				}
			} else {
				for (let i = 0; i < this.length; i++) {
					this._value[i] = (this._value[i] || 0) / (o._value[i] || 0);
				}
			}
		} else {
			this.map(v => v / o);
		}
	}

	idiv(o) {
		if (o instanceof Matrix) {
			if (this.rows != o.rows && this.cols != o.cols) throw new MatrixException("Divide size invalid.", [this, o]);
			if (this.rows != o.rows) {
				for (let i = 0; i < this.length; i++) {
					this._value[i] = (o._value[i % o.length] || 0) / (this._value[i] || 0);
				}
			} else if (this.cols != o.cols) {
				for (let i = 0; i < this.length; i++) {
					this._value[i] = (o._value[Math.floor(i / this.cols) + (i % this.cols) % o.cols] || 0) / (this._value[i] || 0);
				}
			} else {
				for (let i = 0; i < this.length; i++) {
					this._value[i] = (o._value[i] || 0) / (this._value[i] || 0);
				}
			}
		} else {
			this.map(v => o / v);
		}
	}

	divAt(r, c, v) {
		if (r < 0 || this.rows <= r || c < 0 || this.cols <= c) throw new MatrixException("Index out of bounds.");
		const old = this._value[r * this.cols + c] || 0
		this._value[r * this.cols + c] = old / v;
		return old;
	}

	idivAt(r, c, v) {
		if (r < 0 || this.rows <= r || c < 0 || this.cols <= c) throw new MatrixException("Index out of bounds.");
		const old = this._value[r * this.cols + c] || 0
		this._value[r * this.cols + c] = v / old;
		return old;
	}

	copyDiv(o, dst) {
		let r = this.copy(dst);
		r.div(o);
		return r;
	}

	copyIdiv(o, dst) {
		let r = this.copy(dst);
		r.idiv(o);
		return r;
	}

	dot(o, dst) {
		if (this.cols != o.rows) throw new MatrixException("Dot size invalid. left = [" + this.rows + ", " + this.cols + "], right = [" + o.rows + ", " + o.cols + "]");
		const mat = dst || new Matrix(this.rows, o.cols, 0);
		let n = 0;
		for (let i = 0; i < this.length; i += this.cols) {
			let v = 0;
			let ik = i;
			let c = 0;
			for (let k = 0; k < o.length; k += o.cols) {
				if (this._value[ik]) c++;
				v += (this._value[ik++] * o._value[k]) || 0;
			}
			mat._value[n++] = v;

			if (c == 0) {
				n += o.cols - 1;
				continue;
			} else if (c / o.rows < 0.1) {
				let vi = [];
				let ki = [];
				for (let k = 0; k < o.rows; k++) {
					if (this._value[i + k]) {
						vi.push(this._value[i + k]);
						ki.push(k);
					}
				}
				for (let j = 1; j < o.cols; j++) {
					v = 0;
					for (let k = 0; k < vi.length; k++) {
						v += (vi[k] * o._value[ki[k] * o.cols + j]) || 0;
					}
					mat._value[n++] = v;
				}
			} else {
				for (let j = 1; j < o.cols; j++) {
					v = 0;
					ik = i;
					for (let k = j; k < o.length; k += o.cols) {
						v += (this._value[ik++] * o._value[k]) || 0;
					}
					mat._value[n++] = v;
				}
			}
		}
		return mat;
	}

	tDot(o, dst) {
		if (this.rows != o.rows) throw new MatrixException("Dot size invalid. left = [" + this.cols + ", " + this.rows + "], right = [" + o.rows + ", " + o.cols + "]");
		const mat = dst || new Matrix(this.cols, o.cols);
		let n = 0;
		for (let i = 0; i < this.cols; i++) {
			for (let j = 0; j < o.cols; j++) {
				let v = 0;
				let ik = i;
				for (let k = j; k < o.length; k += o.cols, ik += this.cols) {
					v += (this._value[ik] * o._value[k]) || 0;
				}
				mat._value[n++] = v;
			}
		}
		return mat;
	}

	rank() {
		throw new MatrixException("Not implemented.")
	}

	det() {
		if (!this.isSquare()) {
			throw new MatrixException("Determine only define square matrix.", this);
		}
		let v = this._value;
		switch (this.rows) {
		case 0:
			return 0;
		case 1:
			return v[0] || 0;
		case 2:
			return (v[0] * v[3] || 0) - (v[1] * v[2] || 0);
		case 3:
			return (v[0] * v[4] * v[8] || 0) +
				(v[1] * v[5] * v[6] || 0) +
				(v[2] * v[3] * v[7] || 0) -
				(v[0] * v[5] * v[7] || 0) -
				(v[1] * v[3] * v[8] || 0) - 
				(v[2] * v[4] * v[6] || 0);
		}
		let [l, u] = this.lu();
		let d = 1;
		for (let i = 0; i < this.rows; i++) {
			let k = i * this.cols + i;
			d *= l._value[k] * u._value[k];
		}
		return d || 0;
	}

	inv() {
		if (!this.isSquare()) {
			throw new MatrixException("Inverse matrix only define square matrix.", this);
		}
		let v = this._value;
		switch (this.rows) {
		case 0:
			return new Matrix(0, 0);
		case 1:
			return new Matrix(1, 1, [1 / (v[0] || 0)]);
		case 2:
			let d2 = this.det();
			return new Matrix(2, 2, [(v[3] || 0) / d2, -(v[1] || 0) / d2, -(v[2] || 0) / d2, (v[0] || 0) / d2]);
		case 3:
			let d3 = this.det();
			return new Matrix(3, 3, [
				((v[4] * v[8] || 0) - (v[5] * v[7] || 0)) / d3,
				((v[2] * v[7] || 0) - (v[1] * v[8] || 0)) / d3,
				((v[1] * v[5] || 0) - (v[2] * v[4] || 0)) / d3,
				((v[5] * v[6] || 0) - (v[3] * v[8] || 0)) / d3,
				((v[0] * v[8] || 0) - (v[2] * v[6] || 0)) / d3,
				((v[2] * v[3] || 0) - (v[0] * v[5] || 0)) / d3,
				((v[3] * v[7] || 0) - (v[4] * v[6] || 0)) / d3,
				((v[1] * v[6] || 0) - (v[0] * v[7] || 0)) / d3,
				((v[0] * v[4] || 0) - (v[1] * v[3] || 0)) / d3
			]);
		}

		if (this.isLowerTriangular()) {
			return this.invLowerTriangular();
		} else if (this.isUpperTriangular()) {
			return this.invUpperTriangular();
		}
		return this.invLU();
	}

	invLowerTriangular() {
		if (!this.isSquare()) {
			throw new MatrixException("Inverse matrix only define square matrix.", this);
		}
		let v = this._value;
		let r = new Matrix(this.rows, this.cols);
		for (let i = 0; i < this.rows; i++) {
			let a = v[i * this.cols + i] || 0;
			r._value[i * this.cols + i] = 1 / a;
			for (let j = 0; j < i; j++) {
				let val = 0;
				for (let k = j; k < i; k++) {
					val += (v[i * this.cols + k] * r._value[k * this.cols + j]) || 0;
				}
				r._value[i * this.cols + j] = -val / a;
			}
		}
		return r;
	}

	invUpperTriangular() {
		if (!this.isSquare()) {
			throw new MatrixException("Inverse matrix only define square matrix.", this);
		}
		let v = this._value;
		let r = new Matrix(this.rows, this.cols);
		for (let i = this.cols - 1; i >= 0; i--) {
			let a = v[i * this.cols + i] || 0;
			r._value[i * this.cols + i] = 1 / a;
			for (let j = i + 1; j < this.cols; j++) {
				let val = 0;
				for (let k = i + 1; k <= j; k++) {
					val += (v[i * this.cols + k] * r._value[k * this.cols + j]) || 0;
				}
				r._value[i * this.cols + j] = -val / a;
			}
		}
		return r;
	}

	invRowReduction() {
		if (!this.isSquare()) {
			throw new MatrixException("Inverse matrix only define square matrix.", this);
		}
		const a = this.copy();
		const n = this.rows;
		const e = Matrix.eye(n, n);
		for (let i = 0; i < n; i++) {
			const i_n = i * n;
			if (a._value[i_n + i] === 0) {
				let k = i + 1
				for (; k < n && a._value[k * n + i] === 0; k++);
				if (k === n) {
					throw new MatrixException("", this)
				}
				for (let j = i; j < n; j++) {
					[a._value[i_n + j], a._value[k * n + j]] = [a._value[k * n + j], a._value[i_n + j]]
				}
				e.swap(i, k)
			}
			let v = a._value[i_n + i] || 0;
			a._value[i_n + i] = 1;
			for (let j = i + 1; j < n; j++) {
				a._value[i_n + j] /= v;
			}
			for (let j = 0; j < n; j++) {
				e._value[i_n + j] = (e._value[i_n + j] || 0) / v;
			}
			for (let k = 0; k < n; k++) {
				if (i === k) continue
				let v = a._value[k * n + i] || 0;
				a._value[k * n + i] = 0
				for (let j = i + 1; j < n; j++) {
					a._value[k * n + j] -= v * (a._value[i_n + j] || 0)
				}
				for (let j = 0; j < n; j++) {
					e._value[k * n + j] = (e._value[k * n + j] || 0) - v * (e._value[i_n + j] || 0)
				}
			}
		}
		return e
	}

	invLU() {
		if (!this.isSquare()) {
			throw new MatrixException("Inverse matrix only define square matrix.", this);
		}
		let [l, u] = this.lu();
		return u.invUpperTriangular().dot(l.invLowerTriangular());
	}

	sqrt() {
		if (!this.isSquare()) {
			throw new MatrixException("sqrt only define square matrix.", this);
		}
		switch (this.rows) {
		case 0:
			return this;
		case 1:
			return new Matrix(1, 1, [Math.sqrt(this._value[0])]);
		}
		const evalue = this.eigenValues();
		const evector = this.eigenVectors();
		const D = new Matrix(this.rows, this.cols);
		for (let i = 0; i < this.rows; i++) {
			D._value[i * this.cols + i] = Math.sqrt(evalue[i]);
		}
		return evector.dot(D).dot(evector.transpose());
	}

	cov() {
		const c = new Matrix(this.cols, this.cols);
		const s = [];
		for (let i = 0; i < this.cols; i++) {
			let si = 0;
			for (let k = i; k < this.length; k += this.cols) {
				si += this._value[k];
			}
			s[i] = si / this.rows;
			for (let j = 0; j <= i; j++) {
				let v = 0;
				for (let k = 0; k < this.length; k += this.cols) {
					v += (this._value[i + k] - s[i]) * (this._value[j + k] - s[j]);
				}
				c._value[i * this.cols + j] = c._value[j * this.cols + i] = v / this.rows;
			}
		}
		return c;
	}

	bidiag() {
		let a = this.copy();
		const [n, m] = [this.rows, this.cols];
		for (let i = 0; i < Math.min(n, m); i++) {
			let new_a = a.select(i, i);
			let v = new_a.select(0, 0, null, 1);
			let alpha = v.norm() * ((v._value[0] < 0) ? 1 : -1);
			v._value[0] -= alpha;
			v.div(v.norm());
			let V = v.dot(v.t)
			V.mult(2)

			let H = Matrix.eye(n - i, n - i)
			H.sub(V)
			new_a = H.tDot(new_a);

			v = new_a.select(0, 0, 1, null);
			v._value[0] = 0;
			alpha = v.norm() * ((v._value[1] < 0) ? 1 : -1);
			v._value[1] -= alpha;
			v.div(v.norm())
			V = v.tDot(v)
			V.mult(2)

			H = Matrix.eye(m - i, m - i)
			H.sub(V)
			new_a = new_a.dot(H);

			a.set(i, i, new_a);
		}
		return a;
	}

	tridiag() {
		if (!this.isSymmetric()) {
			throw new MatrixException("Tridiagonal only define symmetric matrix.", this);
		}
		let a = this.copy();
		let n = this.cols;
		for (let i = 0; i < n - 2; i++) {
			let v = a.select(i + 1, i, n, i + 1);
			let alpha = v.norm() * ((v._value[0] < 0) ? 1 : -1);
			v._value[0] -= alpha;
			v.div(v.norm());

			let new_a = a.select(i + 1, i + 1);
			let d = new_a.dot(v);
			let g = v.copyMult(v.tDot(d));
			g.isub(d);
			g.mult(2);

			new_a.sub(g.dot(v.t));
			new_a.sub(v.dot(g.t));
			a.set(i + 1, i + 1, new_a);

			a._value[i * n + i + 1] = a._value[(i + 1) * n + i] = alpha;
			for (let j = i + 2; j < n; j++) {
				a._value[i * n + j] = a._value[j * n + i] = 0;
			}
		}
		return a;
	}

	lu() {
		if (!this.isSquare()) {
			throw new MatrixException("LU decomposition only define square matrix.", this);
		}
		const n = this.rows;
		switch (n) {
		case 0:
			return this;
		case 1:
			return [Matrix.ones(1, 1), new Matrix(1, 1, [this._value[0]])];
		case 2:
			return [new Matrix(2, 2, [1, 0, this._value[2] / this._value[0], 1]),
			        new Matrix(2, 2, [this._value[0], this._value[1], 0, this._value[3] - this._value[1] * this._value[2] / this._value[0]])];
		}
		let lu = this.copy();
		for (let i = 0; i < n; i++) {
			const a = lu._value[i * n + i];
			for (let j = i + 1; j < n; j++) {
				const b = (lu._value[j * n + i] /= a);
				for (let k = i + 1; k < n; k++) {
					lu._value[j * n + k] -= b * lu._value[i * n + k];
				}
			}
		}
		let l = Matrix.eye(n, n);
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < i; j++) {
				l._value[i * n + j] = lu._value[i * n + j];
				lu._value[i * n + j] = 0;
			}
		}
		return [l, lu];
	}

	qr() {
		const n = this.rows;
		const m = this.cols;
		const a = this.copy();
		const u = Matrix.eye(n, n);
		const vArrBuffer = Array(n * n);
		const selBuffer = Array(this.rows * this.cols);
		const dotBuffer = Array(n * n);
		for (let i = 0; i < Math.min(n, m) - 1; i++) {
			const x = a.select(i, i, n, i + 1);
			const alpha = x.norm() * ((x._value[0] < 0) ? 1 : -1);
			x._value[0] -= alpha;
			x.div(x.norm());

			vArrBuffer.fill(0);
			let V = new Matrix(n - i, n - i, vArrBuffer);
			for (let j = 0; j < n - i; j++) {
				const xvj = x._value[j]
				V._value[j * V.cols + j] = 1 - 2 * xvj ** 2;
				if (!xvj) continue;
				for (let k = 0; k < j; k++) {
					V._value[j * V.cols + k] = V._value[k * V.cols + j] = -2 * xvj * x._value[k];
				}
			}
			a.set(i, i, V.dot(a.select(i, i, null, null, selBuffer), new Matrix(n - i, m - i, dotBuffer)));
			u.set(i, 0, V.dot(u.select(i, 0, null, null, selBuffer), new Matrix(n - i, n, dotBuffer)));
		}
		return [u.t, a];
	}

	svd() {
		return this.svdEigen();
	}

	svdEigen() {
		// https://ohke.hateblo.jp/entry/2017/12/14/230500
		const n = Math.min(this.cols, this.rows);
		if (this.cols <= this.rows) {
			const ata = this.tDot(this)
			const [ev, V] = ata.eigenJacobi()
			for (let i = 0; i < n; i++) {
				ev[i] = Math.sqrt(ev[i]);
			}
			const U = this.dot(V)
			for (let i = 0; i < this.rows; i++) {
				for (let j = 0; j < n; j++) {
					U._value[i * n + j] /= ev[j]
				}
			}
			return [U, ev, V];
		} else {
			const aat = this.dot(this.t)
			const [ev, U] = aat.eigenJacobi()
			for (let i = 0; i < n; i++) {
				ev[i] = Math.sqrt(ev[i]);
			}
			const V = U.tDot(this);
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

	eigen() {
		if (!this.isSquare()) {
			throw new MatrixException("Eigen values only define square matrix.", this);
		}
		if (this.rows <= 2) {
			return [this.eigenValues(), this.eigenVectors()];
		}
		if (this.isSymmetric(1.0e-15)) {
			return this.eigenJacobi();
		} else {
			const ev = this.eigenValues();
			const n = this.rows;
			let evec = new Matrix(n, n);
			for (let i = 0; i < n; i++) {
				const [l, y] = this.eigenInverseIteration(ev[i]);
				for (let j = 0; j < n; j++) {
					evec._value[j * n + i] = y._value[j];
				}
			}
			return [ev, evec];
		}
	}

	eigenValues() {
		if (!this.isSquare()) {
			throw new MatrixException("Eigen values only define square matrix.", this);
		}
		switch (this.rows) {
		case 0:
			return [];
		case 1:
			return [this._value[0]];
		case 2:
			let p = this._value[0] + this._value[3];
			let q = Math.sqrt(p ** 2 - 4 * this.det());
			return [(p + q) / 2, (p - q) / 2];
		}

		if (this.isSymmetric(1.0e-15)) {
			return this.eigenJacobi()[0];
		} else {
			return this.eigenValuesQR();
		}
	}

	eigenVectors(cb) {
		if (!this.isSquare()) {
			throw new MatrixException("Eigen vectors only define square matrix.", this);
		}
		if (cb) {
			const bw = new BaseWorker('js/math_worker.js');
			bw._postMessage({
				call: 'eigenVectors',
				data: this._value,
				rows: this.rows,
				cols: this.cols
			}, (e) => {
				const data = e.data;
				cb(new Matrix(this.rows, this.cols, data));
				bw.terminate();
			})
			return
		}

		switch (this.rows) {
		case 0:
			return this;
		case 1:
			return new Matrix(1, 1, [1]);
		case 2:
			const ev = this.eigenValues();
			const v0 = [-this._value[1], this._value[0] - ev[0]];
			const v0d = Math.sqrt(v0[0] ** 2 + v0[1] ** 2);
			const v1 = [-this._value[1], this._value[0] - ev[1]];
			const v1d = Math.sqrt(v1[0] ** 2 + v1[1] ** 2);
			return new Matrix(2, 2, [v0[0] / v0d, v1[0] / v1d, v0[1] / v0d, v1[1] / v1d]);
		}

		return this.eigen()[1];
	}

	eigenValuesLR() {
		if (!this.isSquare()) {
			throw new MatrixException("Eigen values only define square matrix.", this);
		}

		let a = this
		const n = a.rows;
		const tol = 1.0e-15;
		let maxCount = 1.0e+5;
		while (maxCount-- > 0) {
			const [l, u] = a.lu()
			a = u.dot(l)

			let e = 0;
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					e += a._value[i * n + j] ** 2
				}
			}
			if (e < tol) {
				const ev = a.diag()
				ev.sort((a, b) => b - a)
				return ev;
			}
		}
		throw new MatrixException("eigenVectors not converged.", this);
	}

	eigenValuesQR() {
		if (!this.isSquare()) {
			throw new MatrixException("Eigen values only define square matrix.", this);
		}

		let a = this.copy();
		let ev = [];
		const tridiag_flg = this.rows > 10 && this.isSymmetric();
		if (this.rows > 10 && this.isSymmetric()) {
			a = a.tridiag();
		}
		const tol = 1.0e-15;
		for (let n = a.rows; n > 2; n--) {
			let maxCount = 1.0e+6;
			while (1) {
				let am = a.select(n - 2, n - 2).eigenValues();
				if (isNaN(am[0])) {
					ev.sort((a, b) => b - a);
					for (let i = 0; i < n; i++, ev.push(NaN));
					return ev;
				}
				let rb = a.at(n - 1, n - 1);
				let m = (Math.abs(am[0] - rb) < Math.abs(am[1] - rb)) ? am[0] : am[1];
				for (let i = 0; i < n; i++) {
					a._value[i * n + i] -= m;
				}
				let [q, r] = a.qr();
				a = r.dot(q);
				for (let i = 0; i < n; i++) {
					a._value[i * n + i] = (a._value[i * n + i] || 0) + m;
				}

				let e = 0;
				for (let j = (n - 1) * n; j < a.length - 1; j++) {
					e += Math.abs(a._value[j] || 0);
				}
				if (e < tol) {
					break;
				} else if (maxCount-- < 0) {
					throw new MatrixException("eigenValues not converged.", this);
				}
			}
			ev.push(a._value[a._value.length - 1]);
			a = a.resize(n - 1, n - 1);
		}
		let ev2 = a.eigenValues();
		ev.push(ev2[0]);
		ev.push(ev2[1]);
		ev.sort((a, b) => b - a);
		return ev;
	}

	eigenJacobi() {
		if (!this.isSymmetric(1.0e-15)) {
			throw new MatrixException("Jacobi method can only use symmetric matrix.", this);
		}
		let a = this.copy();
		let P = Matrix.eye(this.rows, this.cols);
		const tol = 1.0e-15;
		let lastMaxValue = 0;
		const n = a.rows;
		while (1) {
			let maxValue = 0;
			let p = 0, q = 0;
			for (let i = 0; i < n; i++) {
				for (let j = i + 1; j < n; j++) {
					const v = Math.abs(a._value[i * n + j])
					if (v > maxValue) {
						maxValue = v;
						p = i;
						q = j;
					}
				}
			}
			if (maxValue < tol) {
				break;
			} else if (maxValue === lastMaxValue) {
				break;
			}
			lastMaxValue = maxValue;
			const app = a._value[p * n + p];
			const apq = a._value[p * n + q];
			const aqq = a._value[q * n + q];

			const alpha = (app - aqq) / 2;
			const beta = -apq;
			const gamma = Math.abs(alpha) / Math.sqrt(alpha ** 2 + beta ** 2);
			let s = Math.sqrt((1 - gamma) / 2);
			const c = Math.sqrt((1 + gamma) / 2);
			if (alpha * beta < 0) s = -s;

			for (let i = 0; i < n; i++) {
				const tmp = c * a._value[p * n + i] - s * a._value[q * n + i];
				a._value[q * n + i] = s * a._value[p * n + i] + c * a._value[q * n + i];
				a._value[p * n + i] = tmp;
			}
			for (let i = 0; i < n; i++) {
				a._value[i * n + p] = a._value[p * n + i];
				a._value[i * n + q] = a._value[q * n + i];
			}

			a._value[p * n + p] = c ** 2 * app + s ** 2 * aqq - 2 * s * c * apq;
			a._value[p * n + q] = a._value[q * n + p] = s * c * (app - aqq) + (c ** 2 - s ** 2) * apq;
			a._value[q * n + q] = s ** 2 * app + c ** 2 * aqq + 2 * s * c * apq;

			for (let i = 0; i < n; i++) {
				const tmp = c * (P._value[i * n + p] || 0) - s * (P._value[i * n + q] || 0);
				P._value[i * n + q] = s * (P._value[i * n + p] || 0) + c * (P._value[i * n + q] || 0);
				P._value[i * n + p] = tmp;
			}
		}
		let ev = a.diag();
		const enumedEv = ev.map((v, i) => [i, v])
		enumedEv.sort((a, b) => b[1] - a[1]);
		const sortP = new Matrix(P.rows, P.cols)
		for (let i = 0; i < n; i++) {
			const fromidx = enumedEv[i][0]
			for (let j = 0; j < n; j++) {
				sortP._value[j * n + i] = P._value[j * n + fromidx];
			}
		}
		return [enumedEv.map(v => v[1]), sortP];
	}

	eigenPowerIteration() {
		if (!this.isSquare()) {
			throw new MatrixException("Eigen vectors only define square matrix.", this);
		}

		const n = this.rows;
		const tol = 1.0e-15;
		let px = Matrix.randn(n, 1);
		px.div(px.norm());
		let pl = Infinity;
		let maxCount = 1.0e+4;
		while (maxCount-- > 0) {
			const x = this.dot(px)
			let lnum = 0, lden = 0;
			for (let i = 0; i < n; i++) {
				lnum += x._value[i] ** 2;
				lden += x._value[i] * px._value[i];
			}
			const l = lnum / lden
			x.div(x.norm())
			const e = Math.abs(l - pl)
			if (e < tol || isNaN(e)) {
				return [l, x];
			}
			px = x;
			pl = l;
		}
		throw new MatrixException("eigenVectors not converged.", this);
	}

	eigenInverseIteration(ev = 0.0) {
		if (!this.isSquare()) {
			throw new MatrixException("Eigen vectors only define square matrix.", this);
		}

		const n = this.rows;
		const tol = 1.0e-15;
		let a = this.copy();
		for (let i = 0; i < n; i++) {
			a._value[i * n + i] = (a._value[i * n + i] || 0) - ev + 1.0e-15
		}
		a = a.inv();
		let py = Matrix.randn(n, 1);
		py.div(py.norm());
		let pl = Infinity;
		let maxCount = 1.0e+4;
		while (maxCount-- > 0) {
			const y = a.dot(py);
			let lnum = 0, lden = 0;
			for (let i = 0; i < n; i++) {
				lnum += y._value[i] ** 2
				lden += py._value[i] * y._value[i]
			}
			const l = lden / lnum
			y.div(y.norm());
			const e = Math.abs(l - pl)
			if (e < tol || isNaN(e)) {
				return [l + ev, y];
			}
			py = y;
			pl = l;
		}
		throw new MatrixException("eigenVectors not converged.", this);
	}
}

const MathFunction = {
	"softmax": (x) => {
		x.map(Math.exp);
		x.div(x.sum(1));
	}
}

const KernelFunction = {
	"linear": (x, y) => {
		return x.dot(y)
	},
	"polynomial": (x, y, d = 1, c = 0.0) => {
		return (x.tDot(y).value[0] + c) ** d
	},
	"gaussian": (x, y, sigma = 1.0) => {
		const s = x.copySub(y).reduce((acc, v) => acc + v * v, 0)
		return Math.exp(-s / sigma ** 2)
	}
}

