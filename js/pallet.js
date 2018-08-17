let randint = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
let argmin = function(arr, key) {
	if (arr.length == 0) {
		return -1;
	}
	arr = (key) ? arr.map(key) : arr;
	return arr.indexOf(Math.min(...arr));
}
let argmax = function(arr, key) {
	if (arr.length == 0) {
		return -1;
	}
	arr = (key) ? arr.map(key) : arr;
	return arr.indexOf(Math.max(...arr));
}

let normal_random = function(m = 0, s = 1) {
	const x = Math.random();
	const y = Math.random();
	const X = Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * y);
	const Y = Math.sqrt(-2 * Math.log(x)) * Math.sin(2 * Math.PI * y);
	return [X * s + m, Y * s + m];
}
let clip = function clip(value, min, max) {
	return (Array.isArray(value)) ? value.map(v => clip(v, min, max)) : Math.max(min, Math.min(max, value));
}

let shuffle = function(arr) {
	for (let i = arr.length - 1; i > 0; i--) {
		let r = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[r]] = [arr[r], arr[i]];
	}
	return arr;
}

class BaseWorker {
	constructor(worker_file) {
		this._worker = new Worker(worker_file);
	}

	_postMessage(data, cb) {
		if (cb) {
			const event_cb = (e) => {
				this._worker.removeEventListener('message', event_cb, false);
				cb(e);
			}
			this._worker.addEventListener('message', event_cb, false);
		}
		this._worker.postMessage(data);
	}

	terminate() {
		this._worker.terminate();
	}
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

function MatrixException(message) {
	this.message = message;
	this.name = MatrixException;
}

class Matrix {
	constructor(rows, cols, values) {
		this._value = (!values) ? [] : !Array.isArray(values) ? Array(rows * cols).fill(values) : Array.isArray(values[0]) ? Array.prototype.concat.apply([], values) : values;
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

	select(rows, cols, rows_to, cols_to) {
		const range = (s, n) => {
			let r = [];
			for (let i = 0; i < n - s; i++) {
				r[i] = i + s;
			}
			return r;
		}
		rows = (Array.isArray(rows)) ? rows : range(rows || 0, rows_to || this.rows);
		cols = (Array.isArray(cols)) ? cols : range(cols || 0, cols_to || this.cols);
		const mat = new Matrix(rows.length, cols.length);
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
		this._value.forEach(cb);
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

	diag() {
		let d = [];
		const rank = Math.min(this.rows, this.cols);
		for (let i = 0; i < rank; i++) {
			d.push(this._value[i * this.cols + i]);
		}
		return d;
	}

	isSquare() {
		return this.rows == this.cols;
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

	isSymmetric() {
		if (!this.isSquare()) return false;
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < i; j++) {
				if (this._value[i * this.cols + j] != this._value[j * this.cols + i]) return false;
			}
		}
		return true;
	}

	negative() {
		this.map(v => (v) ? -v : null);
	}

	add(o) {
		if (o instanceof Matrix) {
			if (this.rows != o.rows && this.cols != o.cols) throw new MatrixException("Addition size invalid.");
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

	copyAdd(o, dst) {
		let r = this.copy(dst);
		r.add(o);
		return r;
	}

	sub(o) {
		if (o instanceof Matrix) {
			if (this.rows != o.rows && this.cols != o.cols) throw new MatrixException("Subtract size invalid.");
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
			if (this.rows != o.rows && this.cols != o.cols) throw new MatrixException("Multiple size invalid.");
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

	copyMult(o, dst) {
		let r = this.copy(dst);
		r.mult(o);
		return r;
	}

	div(o) {
		if (o instanceof Matrix) {
			if (this.rows != o.rows && this.cols != o.cols) throw new MatrixException("Divide size invalid.");
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
			if (this.rows != o.rows && this.cols != o.cols) throw new MatrixException("Divide size invalid.");
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

	reduce(cb, init, axis = -1) {
		if (axis < 0) {
			return this._value.reduce(cb, init);
		}
		let v_step = 0, s_step = 0;
		if (axis == 0) {
			v_step = 1;
			s_step = this.cols;
		} else if(axis == 1) {
			v_step = this.cols;
			s_step = 1;
		}
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
		let v_step = 0, s_step = 0;
		if (axis == 0) {
			v_step = 1;
			s_step = this.cols;
		} else if(axis == 1) {
			v_step = this.cols;
			s_step = 1;
		}
		const new_size = [].concat(this.size);
		new_size[axis] = 1;
		const mat = Matrix.zeros(...new_size);
		for (let n = 0, nv = 0; n < mat.length; n++, nv += v_step) {
			let v = this._value[nv] || 0;
			for (let i = 1; i < this.size[axis]; i++) {
				let tmp = this._value[i * s_step + nv] || 0;
				if (tmp > v) v = tmp;
			}
			mat._value[n] = v;
		}
		return mat;
	}

	min(axis = -1) {
		if (axis < 0) {
			return Math.min(...this._value);
		}
		let v_step = 0, s_step = 0;
		if (axis == 0) {
			v_step = 1;
			s_step = this.cols;
		} else if(axis == 1) {
			v_step = this.cols;
			s_step = 1;
		}
		const new_size = [].concat(this.size);
		new_size[axis] = 1;
		const mat = Matrix.zeros(...new_size);
		for (let n = 0, nv = 0; n < mat.length; n++, nv += v_step) {
			let v = this._value[nv] || 0;
			for (let i = 1; i < this.size[axis]; i++) {
				let tmp = this._value[i * s_step + nv] || 0;
				if (tmp < v) v = tmp;
			}
			mat._value[n] = v;
		}
		return mat;
	}

	argmax(axis) {
		let v_step = 0, s_step = 0;
		if (axis == 0) {
			v_step = 1;
			s_step = this.cols;
		} else if(axis == 1) {
			v_step = this.cols;
			s_step = 1;
		}
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
		let v_step = 0, s_step = 0;
		if (axis == 0) {
			v_step = 1;
			s_step = this.cols;
		} else if(axis == 1) {
			v_step = this.cols;
			s_step = 1;
		}
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
		let v_step = 0, s_step = 0;
		if (axis == 0) {
			v_step = 1;
			s_step = this.cols;
		} else if(axis == 1) {
			v_step = this.cols;
			s_step = 1;
		}
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
		let v_step = 0, s_step = 0;
		if (axis == 0) {
			v_step = 1;
			s_step = this.cols;
		} else if(axis == 1) {
			v_step = this.cols;
			s_step = 1;
		}
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

	det() {
		if (!this.isSquare()) {
			throw new MatrixException("Determine only define square matrix.");
		}
		switch (this.rows) {
		case 0:
			return 0;
		case 1:
			return this._value[0];
		case 2:
			return this._value[0] * this._value[3] - this._value[1] * this._value[2];
		case 3:
			return this._value[0] * this._value[4] * this._value[8] +
				this._value[1] * this._value[5] * this._value[6] +
				this._value[2] * this._value[3] * this._value[7] -
				this._value[0] * this._value[5] * this._value[7] -
				this._value[1] * this._value[3] * this._value[8] - 
				this._value[2] * this._value[4] * this._value[6];
		}
		let [l, u] = this.lu();
		let d = 1;
		for (let i = 0; i < this.rows; i++) {
			let k = i * this.cols + i;
			d *= l._value[k] * u._value[k];
		}
		return d;
	}

	inv() {
		if (!this.isSquare()) {
			throw new MatrixException("Inverse matrix only define square matrix.");
		}
		switch (this.rows) {
		case 0:
			return new Matrix(0, 0);
		case 1:
			return new Matrix(1, 1, [1 / this._value[0]]);
		case 2:
			let d2 = this.det();
			return new Matrix(2, 2, [this._value[3] / d2, -this._value[1] / d2, -this._value[2] / d2, this._value[0] / d2]);
		case 3:
			let d3 = this.det();
			let v = this._value;
			return new Matrix(3, 3, [
				(v[4] * v[8] - v[5] * v[7]) / d3,
				(v[2] * v[7] - v[1] * v[8]) / d3,
				(v[1] * v[5] - v[2] * v[4]) / d3,
				(v[5] * v[6] - v[3] * v[8]) / d3,
				(v[0] * v[8] - v[2] * v[6]) / d3,
				(v[2] * v[3] - v[0] * v[5]) / d3,
				(v[3] * v[7] - v[4] * v[6]) / d3,
				(v[1] * v[6] - v[0] * v[7]) / d3,
				(v[0] * v[4] - v[1] * v[3]) / d3
			]);
		}

		if (this.isLowerTriangular()) {
			let r = new Matrix(this.rows, this.cols);
			for (let i = 0; i < this.rows; i++) {
				let a = this._value[i * this.cols + i];
				r._value[i * this.cols + i] = 1 / a;
				for (let j = 0; j < i; j++) {
					let v = 0;
					for (let k = j; k < i; k++) {
						v += this._value[i * this.cols + k] * r._value[k * this.cols + j];
					}
					r._value[i * this.cols + j] = -v / a;
				}
			}
			return r;
		} else if (this.isUpperTriangular()) {
			let r = new Matrix(this.rows, this.cols);
			for (let j = 0; j < this.cols; j++) {
				let a = this._value[j * this.cols + j];
				r._value[j * this.cols + j] = 1 / a;
				for (let i = 0; i < j; i++) {
					let v = 0;
					for (let k = i; k < j; k++) {
						v += this._value[k * this.cols + j] * r._value[i * this.cols + k];
					}
					r._value[i * this.cols + j] = -v / a;
				}
			}
			return r;
		}
		let [l, u] = this.lu();
		return u.inv().dot(l.inv());
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

	tridiag() {
		if (!this.isSymmetric()) {
			throw new MatrixException("Tridiagonal only define symmetric matrix.");
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
			throw new MatrixException("LU decomposition only define square matrix.");
		}
		switch (this.rows) {
		case 0:
			return this;
		case 1:
			return [Matrix.ones(1, 1), new Matrix(1, 1, [this._value[0]])];
		case 2:
			return [new Matrix(2, 2, [1, 0, this._value[2] / this._value[0], 1]),
			        new Matrix(2, 2, [this._value[0], this._value[1], 0, this._value[3] - this._value[1] * this._value[2] / this._value[0]])];
		}
		let lu = this.copy();
		for (let i = 0; i < this.cols; i++) {
			for (let j = i + 1; j < this.cols; j++) {
				lu._value[j * this.cols + i] /= lu._value[i * this.cols + i];
				for (let k = i + 1; k < this.cols; k++) {
					lu._value[j * this.cols + k] -= lu._value[j * this.cols + i] * lu._value[i * this.cols + k];
				}
			}
		}
		let l = Matrix.eye(this.rows, this.cols);
		let u = new Matrix(this.rows, this.cols);
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				if (i > j) {
					l._value[i * this.cols + j] = lu._value[i * this.cols + j];
				} else {
					u._value[i * this.cols + j] = lu._value[i * this.cols + j];
				}
			}
		}
		return [l, u];
	}

	qr() {
		const n = this.rows;
		const a = this.copy();
		const u = Matrix.eye(n, n);
		for (let i = 0; i < n - 1; i++) {
			let x = a.select(i, i, n, i + 1);
			let alpha = x.norm() * ((x._value[0] < 0) ? 1 : -1);
			x._value[0] -= alpha;
			x.div(x.norm());

			let V = Matrix.zeros(n - i, n - i);
			let t = 0;
			for (let j = 0; j < n - i; j++) {
				V._value[j * V.cols + j] = 1 - 2 * x._value[j] * x._value[j];
				if (!x._value[j]) continue;
				for (let k = 0; k < j; k++) {
					V._value[j * V.cols + k] = V._value[k * V.cols + j] = -2 * x._value[j] * x._value[k];
				}
			}
			a.set(i, i, V.dot(a.select(i, i)));
			u.set(i, 0, V.dot(u.select(i, 0)));
		}
		return [u.t, a];
	}

	eigenValues() {
		if (!this.isSquare()) {
			throw new MatrixException("Eigen values only define square matrix.");
		}
		switch (this.rows) {
		case 0:
			return [];
		case 1:
			return [this._value[0]];
		case 2:
			let p = this._value[0] + this._value[3];
			let q = p ** 2 - 4 * this.det();
			if (q < 0) throw new MatrixException("Eigen value undefined.");
			q = Math.sqrt(q);
			return [(p + q) / 2, (p - q) / 2];
		}

		let a = this.copy();
		if (this.rows > 10 && this.isSymmetric()) {
			a = a.tridiag();
		}
		let tol = 1.0e-16;
		let ev = [];
		for (let n = a.rows; n > 2; n--) {
			while (1) {
				let am = a.select(n - 2, n - 2).eigenValues();
				let rb = a.at(n - 1, n - 1);
				let m = (Math.abs(am[0] - rb) < Math.abs(am[1] - rb)) ? am[0] : am[1];
				for (let i = 0; i < n; i++) {
					a._value[i * n + i] -= m;
				}
				let [q, r] = a.qr();
				a = r.dot(q);
				for (let i = 0; i < n; i++) {
					a._value[i * n + i] += m;
				}

				let e = 0;
				let i = n - 1;
					for (let j = 0; j < i; j++) {
						e += Math.abs(a._value[i * n + j]);
					}
				if (e < tol) {
					break;
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

	eigenVectors() {
		if (!this.isSquare()) {
			throw new MatrixException("Eigen vectors only define square matrix.");
		}
		switch (this.rows) {
		case 0:
			return this;
		case 1:
			return new Matrix(1, 1, [1]);
		case 2:
			let ev = this.eigenValues();
			let v0 = [-this._value[1], this._value[0] - ev[0]];
			let v0d = Math.sqrt(v0[0] ** 2 + v0[1] ** 2);
			let v1 = [-this._value[1], this._value[0] - ev[1]];
			let v1d = Math.sqrt(v1[0] ** 2 + v1[1] ** 2);
			return new Matrix(2, 2, [v0[0] / v0d, v1[0] / v1d, v0[1] / v0d, v1[1] / v1d]);
		}

		let ev = this.eigenValues();
		let n = this.rows;
		let evec = new Matrix(n, n);
		for (let i = 0; i < n; i++) {
			let a = this.copySub(Matrix.eye(n, n, ev[i]));
			a = a.inv();
			let u = Matrix.random(n, 1);
			for (let k = 0; k < 100; k++) {
				u = a.dot(u);
			}
			for (let j = 0; j < n; j++) {
				evec._value[j * n + i] = u._value[j];
			}
		}
		return evec;
	}
}

const Function = {
	"softmax": (x) => {
		x.map(Math.exp);
		x.div(x.sum(1));
	}
}

class DataPointCirclePlotter {
	constructor(svg, item) {
		this._svg = svg;
		this.item = item || this._svg.append("circle");
	}

	attr(name, value) {
		return (value) ? (this.item.attr(name, value) && this) : this.item.attr(name);
	}

	cx(value) {
		return this.attr("cx", value);
	}

	cy(value) {
		return this.attr("cy", value);
	}

	color(value) {
		return this.attr("fill", value);
	}

	radius(value) {
		return this.attr("r", value);
	}

	transition() {
		return new DataPointCirclePlotter(this._svg, this.item.transition());
	}

	duration(value) {
		return new DataPointCirclePlotter(this._svg, this.item.duration(value));
	}

	remove() {
		return this.item.remove();
	}
}

class DataPointStarPlotter {
	constructor(svg, item, polygon) {
		this._svg = svg;
		this._c = [0, 0];
		this._r = 5;
		if (item) {
			this.g = item;
			this.polygon = polygon;
		} else {
			this.g = this._svg.append("g");
			this.polygon = this.g.append("polygon");
			this.polygon.attr("points", this._path())
				.attr("stroke", d3.rgb(0, 0, 0));
		}
	}

	_path() {
		return [
			[-Math.sin(Math.PI * 2 / 5), -Math.cos(Math.PI * 2 / 5)],
			[-Math.sin(Math.PI / 5) / 2, -Math.cos(Math.PI / 5) / 2],
			[0, -1],
			[Math.sin(Math.PI / 5) / 2, -Math.cos(Math.PI / 5) / 2],
			[Math.sin(Math.PI * 2 / 5), -Math.cos(Math.PI * 2 / 5)],
			[Math.sin(Math.PI * 3 / 5) / 2, -Math.cos(Math.PI * 3 / 5) / 2],
			[Math.sin(Math.PI * 4 / 5), -Math.cos(Math.PI * 4 / 5)],
			[0, 1 / 2],
			[-Math.sin(Math.PI * 4 / 5), -Math.cos(Math.PI * 4 / 5)],
			[-Math.sin(Math.PI * 3 / 5) / 2, -Math.cos(Math.PI * 3 / 5) / 2]
		].reduce((acc, v) => acc + (v[0] * this._r) + "," + (v[1] * this._r) + " ", "");
	}

	cx(value) {
		this._c[0] = value || this._c[0];
		return (value) ? (this.g.attr("transform", "translate(" + this._c[0] + ", " + this._c[1] + ")") && this) : this._c[0];
	}

	cy(value) {
		this._c[1] = value || this._c[1];
		return (value) ? (this.g.attr("transform", "translate(" + this._c[0] + ", " + this._c[1] + ")") && this) : this._c[1];
	}

	color(value) {
		return (value) ? (this.polygon.attr("fill", value) && this) : this.polygon.attr("fill");
	}

	radius(value) {
		this._r = value || this._r;
		return (value) ? (this.polygon.attr("points", this._path()) && this) : this._r;
	}

	transition() {
		return new DataPointStarPlotter(this._svg, this.g.transition(), this.polygon.transition());
	}

	duration(value) {
		return new DataPointStarPlotter(this._svg, this.g.duration(value), this.polygon.duration(value));
	}

	remove() {
		return this.g.remove();
	}
}

class DataVector {
	constructor(value) {
		this.value = (value instanceof DataVector) ? value.value : value;
	}

	get length() {
		return Math.sqrt(this.value.reduce((acc, v) => acc + v * v, 0));
	}

	map(func) {
		return new DataVector(this.value.map(func));
	}

	reduce(func, init) {
		return this.value.reduce(func, init);
	}

	add(p) {
		return this.map((v, i) => v + p.value[i]);
	}

	sub(p) {
		return this.map((v, i) => v - p.value[i]);
	}

	mult(n) {
		return this.map(v => v * n);
	}

	div(n) {
		return this.map(v => v / n);
	}

	dot(p) {
		return this.value.reduce((acc, v, i) => acc + v * p.value[i], 0);
	}

	distance(p) {
		return Math.sqrt(this.value.reduce((acc, v, i) => acc + (v - p.value[i]) ** 2, 0));
	}

	angleCos(p) {
		return this.dot(p) / (this.length * p.length);
	}

	equals(p) {
		return this.value.every((v, i) => v == p.value[i]);
	}
}

const categoryColors = {
	"-1": d3.rgb(255, 0, 0),
	"0": d3.rgb(0, 0, 0)
};

const getCategoryColor = function(i) {
	if (!categoryColors[i]) {
		let cnt = 0;
		while (true) {
			cnt += 1;
			let d = [Math.random(), Math.random(), Math.random()];
			let min_dis = -1;
			for (let i in categoryColors) {
				if (i == -1) {
					continue;
				}
				let dis = (d[0] - categoryColors[i].r / 256) ** 2 + (d[1] - categoryColors[i].g / 256) ** 2 + (d[2] - categoryColors[i].b / 256) ** 2;
				if (min_dis == -1 || dis < min_dis) {
					min_dis = dis;
				}
			}
			if (Math.random() < Math.sqrt(min_dis)) {
				categoryColors[i] = d3.rgb(Math.floor(d[0] * 225), Math.floor(d[1] * 225), Math.floor(d[2] * 225));
				break;
			}
		}
	}
	return categoryColors[i];
};

class DataPoint {
	constructor(svg, position = [0, 0], category = 0) {
		this.svg = svg;
		this.vector = new DataVector(position);
		this._color = getCategoryColor(category);
		this._category = category;
		this._radius = 5;
		this._plotter = new DataPointCirclePlotter(svg);
		this._binds = [];
		this.display();
	}

	display() {
		this._plotter.cx(this.vector.value[0])
			.cy(this.vector.value[1])
			.radius(this._radius)
			.color(this._color);
		this._binds.forEach(e => e.display());
	}

	get item() {
		return this._plotter.item;
	}

	get at() {
		return this.vector.value;
	}
	set at(position) {
		this.vector = new DataVector(position);
		this.display();
	}
	get color() {
		return this._color;
	}
	get category() {
		return this._category;
	}
	set category(category) {
		this._category = category;
		this._color = getCategoryColor(category);
		this.display();
	}
	get radius() {
		return this._radius;
	}
	set radius(radius) {
		this._radius = radius;
		this.display();
	}

	plotter(plt) {
		this._plotter.remove();
		this._plotter = new plt(this.svg);
		this.display();
	}

	remove() {
		this._plotter.remove();
		this._binds.forEach(e => e.remove());
	}

	move(to, duration = 1000) {
		this.vector = new DataVector(to);
		this._plotter.transition()
			.duration(duration)
			.cx(this.vector.value[0])
			.cy(this.vector.value[1]);
		this._binds.forEach(e => e.move(duration));
	}

	distance(p) {
		return this.vector.distance(p.vector);
	}

	bind(e) {
		this._binds.push(e);
	}

	removeBind(e) {
		this._binds = this._binds.filter(b => b !== e);
	}

	static sum(arr) {
		return (arr.length == 0) ? [] : arr.slice(1).reduce((acc, v) => acc.add(v.vector), arr[0].vector);
	}
	static mean(arr) {
		return (arr.length == 0) ? [] : DataPoint.sum(arr).div(arr.length);
	}
}

class DataCircle {
	constructor(svg, at) {
		this._svg = svg;
		this.item = svg.append("circle").attr("fill-opacity", 0);
		this._at = at;
		this._color = null;
		this._width = 2;
		at.bind(this);
		this.display();
	}

	get color() {
		return this._color || this._at.color;
	}
	set color(value) {
		this._color = value;
		this.display();
	}

	display() {
		this.item
			.attr("cx", this._at.at[0])
			.attr("cy", this._at.at[1])
			.attr("stroke", this.color)
			.attr("stroke-width", this._width)
			.attr("r", this._at._radius);
	}

	move(duration = 1000) {
		this.item.transition()
			.duration(duration)
			.attr("cx", this._at.at[0])
			.attr("cy", this._at.at[1]);
	}

	remove() {
		this.item.remove();
		this._at.removeBind(this);
	}
}

class DataLine {
	constructor(svg, from, to) {
		this._svg = svg;
		this.item = svg.append("line");
		this._from = from;
		this._to = to;
		this._remove_listener = null;
		from && from.bind(this);
		to && to.bind(this);
		this.display();
	}

	set from(value) {
		this._from && this._from.removeBind(this);
		this._from = value;
		this._from.bind(this);
	}

	set to(value) {
		this._to && this._to.removeBind(this);
		this._to = value;
		this._to.bind(this);
	}

	display() {
		if (!this._from || !this._to) return;
		this.item
			.attr("x1", this._from.at[0])
			.attr("y1", this._from.at[1])
			.attr("x2", this._to.at[0])
			.attr("y2", this._to.at[1])
			.attr("stroke", this._from.color);
	}

	move(duration = 1000) {
		if (!this._from || !this._to) return;
		this.item.transition()
			.duration(duration)
			.attr("x1", this._from.at[0])
			.attr("y1", this._from.at[1])
			.attr("x2", this._to.at[0])
			.attr("y2", this._to.at[1]);
	}

	remove() {
		this.item.remove();
		this._from && this._from.removeBind(this);
		this._from = null;
		this._to && this._to.removeBind(this);
		this._to = null;
		this._remove_listener && this._remove_listener(this);
	}

	setRemoveListener(cb) {
		this._remove_listener = cb;
	}
}

class DataConvexHull {
	constructor(svg, points) {
		this._svg = svg;
		this.item = svg.append("polygon");
		this._points = points;
		this.display();
	}

	_convexPoints() {
		if (this._points.length <= 3) {
			return this._points;
		}
		let cp = [].concat(this._points);
		let basei = argmin(cp, p => p.at[1]);
		const base = cp.splice(basei, 1)[0];
		cp.sort((a, b) => {
			let dva = a.vector.sub(base.vector);
			let dvb = b.vector.sub(base.vector);
			return dva.value[0] / dva.length - dvb.value[0] / dvb.length;
		});
		let outers = [base];
		for (let k = 0; k < cp.length; k++) {
			while (outers.length >= 3) {
				let n = outers.length;
				const v = outers[n - 1].vector.sub(outers[n - 2].vector).value;
				const newv = cp[k].vector.sub(outers[n - 2].vector).value;
				const basev = base.vector.sub(outers[n - 2].vector).value;
				if ((v[0] * basev[1] - v[1] * basev[0]) * (v[0] * newv[1] - v[1] * newv[0]) > 0) {
					break;
				}
				outers.pop();
			}
			outers.push(cp[k]);
		}
		return outers;
	}

	display() {
		let points = this._convexPoints().reduce((acc, p) => acc + p.at[0] + "," + p.at[1] + " ", "");
		let color = this._points[0].color;
		this.item.attr("points", points)
			.attr("stroke", color)
			.attr("fill", color)
			.attr("opacity", 0.5);
	}

	remove() {
		this.item.remove();
	}
}

class DataMap {
	constructor() {
		this._data = [];
		this._size = [0, 0];
	}

	get rows() {
		return this._size[0];
	}

	get cols() {
		return this._size[1];
	}

	at(x, y) {
		return (x < 0 || !this._data[x] || y < 0) ? null : this._data[x][y];
	}

	set(x, y, value) {
		if (!this._data[x]) this._data[x] = [];
		this._data[x][y] = value;
		this._size[0] = Math.max(this._size[0], x + 1);
		this._size[1] = Math.max(this._size[1], y + 1);
	}
}

class DataHulls {
	constructor(svg, categories, tileSize, use_canvas = false) {
		this._svg = svg;
		this._categories = categories;
		this._tileSize = tileSize;
		this._use_canvas = use_canvas;
		this.display();
	}

	display() {
		if (this._use_canvas) {
			let root_svg = d3.select("svg");
			let canvas = document.createElement("canvas");
			canvas.width = root_svg.node().getBoundingClientRect().width;
			canvas.height = root_svg.node().getBoundingClientRect().height;
			let ctx = canvas.getContext("2d");
			for (let i = 0; i < this._categories.length; i++) {
				for (let j = 0; j < this._categories[i].length; j++) {
					let clr_l = getCategoryColor(Math.floor(this._categories[i][j]));
					let clr_h = getCategoryColor(Math.ceil(this._categories[i][j]));
					let r = this._categories[i][j] - Math.floor(this._categories[i][j]);
					ctx.fillStyle = "rgb(" + Math.round(clr_l.r + (clr_h.r - clr_l.r) * r) + "," + Math.round(clr_l.g + (clr_h.g - clr_l.g) * r) + "," + Math.round(clr_l.b + (clr_h.b - clr_l.b) * r) + ")";
					ctx.fillRect(j * this._tileSize, i * this._tileSize, this._tileSize, this._tileSize);
				}
			}
			this._svg.append("image")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", canvas.width)
				.attr("height", canvas.height)
				.attr("xlink:href", canvas.toDataURL())
				.on("mousemove", function() {
					const mousePos = d3.mouse(this);
					console.log(this._categories[mousePos[1] / canvas.height][mousePos[0] / canvas.width]);
				});
			return;
		}
		let categories = new DataMap();
		for (let i = 0; i < this._categories.length; i++) {
			for (let j = 0; j < this._categories[i].length; j++) {
				categories.set(i, j, Math.round(this._categories[i][j]));
			}
		}
		for (let i = 0; i < categories.rows; i++) {
			for (let j = 0; j < categories.cols; j++) {
				if ((categories.at(i, j) != 0 && !categories.at(i, j)) || categories.at(i, j) < 0) {
					continue;
				}
				let targetCategory = categories.at(i, j);
				let targets = new DataMap();
				let hulls = new DataMap();
				let checkTargets = [[i, j]];
				while (checkTargets.length > 0) {
					let tp = checkTargets.pop();
					let y = tp[0], x = tp[1];
					if (categories.at(y, x) == targetCategory) {
						targets.set(y, x, 1);
						categories.set(y, x, -1);
						checkTargets.push([y - 1, x]);
						checkTargets.push([y + 1, x]);
						checkTargets.push([y, x - 1]);
						checkTargets.push([y, x + 1]);
						hulls.set(y, x, (targets.at(y - 1, x) != 1 && categories.at(y - 1, x) != targetCategory)
							|| (targets.at(y + 1, x) != 1 && categories.at(y + 1, x) != targetCategory)
							|| (targets.at(y, x - 1) != 1 && categories.at(y, x - 1) != targetCategory)
							|| (targets.at(y, x + 1) != 1 && categories.at(y, x + 1) != targetCategory));
					}
				}
				let hullPoints = [[i, j]];
				let y = i, x = j + 1;
				const max_count = categories.rows * categories.cols;
				let count = 0;
				let ori = "r";
				while (y != i || x != j) {
					let lt = targets.at(y - 1, x - 1);
					let rt = targets.at(y - 1, x);
					let lb = targets.at(y, x - 1);
					let rb = targets.at(y, x);
					if (rt && lt && lb && rb) {
						console.log("invalid inner condition at [" + y + ", " + x + "]");
						break;
					} else if (rt && lt && lb) {
						hullPoints.push([y, x]);
						ori = "b";
					} else if (lt && lb && rb) {
						hullPoints.push([y, x]);
						ori = "r";
					} else if (lb && rb && rt) {
						hullPoints.push([y, x]);
						ori = "t";
					} else if (rb && rt && lt) {
						hullPoints.push([y, x]);
						ori = "l";
					} else if (rt && lt) {
						ori = "l";
					} else if (lt && lb) {
						ori = "b";
					} else if (lb && rb) {
						ori = "r";
					} else if (rb && rt) {
						ori = "t";
					} else if (rt && lb) {
						hullPoints.push([y, x]);
						if (ori == "l") {
							ori = "t";
						} else if (ori == "r") {
							ori = "b";
						} else {
							console.log("invalid direction condition at [" + y + ", " + x + "]");
						}
					} else if (lt && rb) {
						hullPoints.push([y, x]);
						if (ori == "t") {
							ori = "r";
						} else if (ori == "b") {
							ori = "l";
						} else {
							console.log("invalid direction condition at [" + y + ", " + x + "]");
						}
					} else if (rt) {
						hullPoints.push([y, x]);
						ori = "t";
					} else if (lt) {
						hullPoints.push([y, x]);
						ori = "l";
					} else if (lb) {
						hullPoints.push([y, x]);
						ori = "b";
					} else if (rb) {
						hullPoints.push([y, x]);
						ori = "r";
					} else {
						console.log("invalid outer condition at [" + y + ", " + x + "]");
						break;
					}
					if (ori == "r") {
						x += 1;
					} else if (ori == "l") {
						x -= 1;
					} else if (ori == "b") {
						y += 1;
					} else if (ori == "t") {
						y -= 1;
					}
					count += 1;
					if (count >= max_count) {
						console.log("invalid loop condition at [" + y + ", " + x + "]");
						break;
					}
				}
				this._svg.append("polygon")
					.attr("points", hullPoints.reduce((acc, p) => acc + (p[1] * this._tileSize) + "," + (p[0] * this._tileSize) + " ", ""))
					.attr("fill", getCategoryColor(targetCategory));
			}
		}

	}
}

let setSlider = function(sliders, callback) {
	sliders.each(function() {
		const elm = d3.select(this);
		const sliderTray = elm.append("div").attr("class", "slider-tray");
		const sliderHandle = elm.append("div").attr("class", "slider-handle");
		sliderHandle.append("div").attr("class", "slider-handle-icon");
		const width = elm.node().getBoundingClientRect().width;
		const clipWidth = (v) => clip(v, 0, width);
		elm.call(d3.drag()
			.on("start", function() {
				const value = clipWidth(d3.mouse(sliderTray.node())[0])
				sliderHandle.style("left", value + "px");
				callback && callback(value / width);
				d3.event.sourceEvent.preventDefault();
			})
			.on("drag", function() {
				const value = clipWidth(d3.mouse(sliderTray.node())[0])
				sliderHandle.style("left", value + "px");
				callback && callback(value / width);
			}));
	})
}

let setDrawer = function (pallet, svg) {
	svg.append("g").attr("class", "datas");
	let dummyRange = svg.append("g").attr("class", "dummy-range")
		.style("pointer-events", "none");

	let handlePoints = null;
	let initDummyPlot = null;
	let moveDummyPlot = null;
	let removeDummyPlot = null;

	svg.on("click", function() {
		const mousePos = d3.mouse(this);
		handlePoints(svg.select(".datas"), mousePos);
		removeDummyPlot && removeDummyPlot(dummyRange);
		dummyRange.selectAll("*").remove();
		(initDummyPlot || moveDummyPlot) && (initDummyPlot || moveDummyPlot)(dummyRange, mousePos);
	})
	.on("mouseenter", function() {
		removeDummyPlot && removeDummyPlot(dummyRange);
		dummyRange.selectAll("*").remove();
		const mousePos = d3.mouse(this);
		try {
			initDummyPlot && initDummyPlot(dummyRange, mousePos);
		} catch (e) {
			console.log(e);
		}
	})
	.on("mousemove", function() {
		const mousePos = d3.mouse(this);
		try {
			moveDummyPlot && moveDummyPlot(dummyRange, mousePos);
		} catch (e) {
			console.log(e);
		}
	})
	.on("mouseleave", function() {
		const mousePos = d3.mouse(this);
		const width = svg.node().getBoundingClientRect().width;
		const height = svg.node().getBoundingClientRect().height;
		if (mousePos[0] < 0 || width - 2 < mousePos[0] || mousePos[1] < 0 || height - 2 < mousePos[1]) {
			removeDummyPlot && removeDummyPlot(dummyRange);
			dummyRange.selectAll("*").remove();
		}
	});

	const palletValue = function(name) {
		return pallet.select(".pallet-row[name=pallet_" + name + "]").property("value");
	}

	let palletData = [
		{
			"name": "mode",
			"type": "list",
			"data": ["add", "template", "remove", "modify", "setting"],
			"child": {
				"template": [
					{
						"name": "pattern",
						"type": "list",
						"data": ["clusters"],
						"select": [false],
						"input": ["button"],
						"click": {
							"clusters": () => {
								const width = svg.node().getBoundingClientRect().width;
								const height = svg.node().getBoundingClientRect().height;
								let r = svg.select(".datas");
								points.forEach(p => p.remove());
								points.length = 0;
								const centers = [];
								for (let i = +palletValue("mode_template_clusters"); i > 0; i--) {
									let c = null;
									let n = 1;
									while (true) {
										c = [Math.random(), Math.random()];
										if (centers.length == 0) {
											break;
										}
										let min_d = Math.min.apply(null, centers.map(ct => (ct[0] - c[0]) ** 2 + (ct[1] - c[1]) ** 2));
										if (500 / n < Math.sqrt(min_d / 2) && Math.random() < Math.sqrt(min_d / 2)) {
											break;
										}
										n += 1;
									}
									centers.push(c);
									let c0 = [c[0] * (width - 200) + 100, c[1] * (height - 200) + 100];
									for (let n = 0; n < 100; n++) {
										const nr = normal_random(0, 50);
										points.push(new DataPoint(r, [c0[0] + nr[0], c0[1] + nr[1]], i));
									}
								}
							}
						}
					},
					{
						"name": "clusters",
						"type": "slider",
						"default": 3,
						"range": [1, 10]
					}
				],
				"add": [
					{
						"name": "category",
						"type": "category"
					},
					{
						"name": "pattern",
						"type": "list",
						"data": ["point", "random", "circle", "arc", "spiral"],
						"click": {
							"point": () => {
								let dp = null;
								handlePoints = (r, cp) => points.push(new DataPoint(r, cp, +palletValue("mode_add_category")));
								initDummyPlot = (r, cp) => dp = new DataPoint(r, cp, -1);
								moveDummyPlot = (r, cp) => dp.at = cp;
								removeDummyPlot = null;
							},
							"random": () => {
								const width = svg.node().getBoundingClientRect().width;
								const height = svg.node().getBoundingClientRect().height;
								handlePoints = (r, cp) => {
									const category = +palletValue("mode_add_category");
									for (var i = +palletValue("mode_add_number"); i > 0; i--) {
										points.push(new DataPoint(r, [randint(10, width - 10), randint(10, height - 10)], category));
									}
								};
								initDummyPlot = (r, cp) => {
									r.append("rect").attr("x", 0).attr("y", 0)
										.attr("width", width).attr("height", height)
										.attr("fill", "red").attr("opacity", 0.2);
								};
								moveDummyPlot = null;
								removeDummyPlot = null;
							},
							"circle": () => {
								let center = null;
								handlePoints = (r, cp) => {
									if (center == null) {
										center = cp;
										return;
									}
									const size = Math.sqrt((center[0] - cp[0]) ** 2 + (center[1] - cp[1]) ** 2);
									const width = svg.node().getBoundingClientRect().width;
									const height = svg.node().getBoundingClientRect().height;
									const category = +palletValue("mode_add_category");
									let cnt = +palletValue("mode_add_number");
									while (cnt > 0) {
										const x = Math.random() * 2 - 1;
										const y = Math.random() * 2 - 1;
										if (x * x + y * y <= 1) {
											const nr = normal_random(0, palletValue("mode_add_noise") * 10);
											const X = clip(nr[0] + x * size + center[0], 10, width - 10);
											const Y = clip(nr[1] + y * size + center[1], 10, height - 10);
											points.push(new DataPoint(r, [X, Y], category));
											cnt -= 1;
										}
									}
									center = null;
								};
								let stopper = null;
								initDummyPlot = (r, cp) => {
									if (center) {
										r.append("circle")
											.attr("cx", center[0])
											.attr("cy", center[1])
											.attr("r", 0);
									} else {
										let cont = true;
										let elm = r.append("circle")
											.attr("cx", cp[0])
											.attr("cy", cp[1]);
										(function repeat() {
											cont && elm.attr("r", 0).attr("opacity", 1)
												.transition()
												.duration(3000)
												.ease(d3.easeLinear)
												.attr("opacity", 0)
												.attr("r", 200)
												.on("end", repeat);
										})();
										stopper = () => cont = false;
									}
									r.select("circle")
										.attr("fill", "red")
										.attr("stroke", "red")
										.attr("fill-opacity", 0.2);
								};
								moveDummyPlot = (r, cp) => {
									if (center) {
										r.select("circle").attr("r", Math.sqrt((center[0] - cp[0]) ** 2 + (center[1] - cp[1]) ** 2));
									} else {
										r.select("circle").attr("cx", cp[0]).attr("cy", cp[1]);
									}
								};
								removeDummyPlot = () => stopper && stopper();
							},
							"arc": () => {
								// TODO eclipse curve
								let p1 = null, p2 = null;
								const findCenter = function(p1, p2, cp) {
									if (p1[0] == p2[0] && p1[1] == p2[1]) {
										return [(cp[0] + p1[0]) / 2, (cp[1] + p1[1]) / 2];
									}
									let e = [(p1[0] + cp[0]) / 2, (p1[1] + cp[1]) / 2];
									let f = [(p2[0] + cp[0]) / 2, (p2[1] + cp[1]) / 2];
									let ta = Math.tan(Math.atan2(cp[1] - p1[1], cp[0] - p1[0]) + Math.PI / 2);
									let tb = Math.tan(Math.atan2(p2[1] - cp[1], p2[0] - cp[0]) + Math.PI / 2);
									let cx = (e[1] - f[1] - e[0] * ta + f[0] * tb) / (tb - ta);
									let cy = (Math.abs(ta) < Math.abs(tb)) ? e[1] - (e[0] - cx) * ta : f[1] - (f[0] - cx) * tb;
									return [cx, cy];
								}
								const radiusRange = (p1, p2, cp, c) => {
									const calcRadius = (x, y) => {
										let c = x / Math.sqrt(x * x + y * y);
										let r = Math.acos(c);
										return (y >= 0) ? r : (2 * Math.PI - r);
									}
									let r1 = calcRadius(c[1] - p1[1], p1[0] - c[0]);
									let r2 = calcRadius(c[1] - p2[1], p2[0] - c[0]);
									let rc = calcRadius(c[1] - cp[1], cp[0] - c[0]);
									if ((r1 < rc && r2 < rc) || (r1 > rc && r2 > rc)) {
										return (r1 < r2) ? [r2, r1 + 2 * Math.PI] : [r1, r2 + 2 * Math.PI];
									}
									return (r1 < r2) ? [r1, r2] : [r2, r1];
								}
								handlePoints = (r, cp) => {
									if (p1 == null) {
										p1 = cp;
										return;
									} else if (p2 == null) {
										p2 = cp;
										return;
									}
									const c = findCenter(p1, p2, cp);
									const rd = Math.sqrt((p1[0] - c[0]) ** 2 + (p1[1] - c[1]) ** 2);
									const rr = radiusRange(p1, p2, cp, c);
									const width = svg.node().getBoundingClientRect().width;
									const height = svg.node().getBoundingClientRect().height;
									const category = +palletValue("mode_add_category");
									for (let i = +palletValue("mode_add_number"); i > 0; i--) {
										const rad = Math.random() * (rr[1] - rr[0]) + rr[0] - Math.PI / 2;
										const p = [Math.cos(rad) * rd, Math.sin(rad) * rd];
										const nr = normal_random(0, palletValue("mode_add_noise") * 5);
										const X = clip(nr[0] + p[0] + c[0], 10, width - 10);
										const Y = clip(nr[1] + p[1] + c[1], 10, height - 10);
										points.push(new DataPoint(r, [X, Y], category));
									}
									p1 = p2 = null;
								};
								let stopper = null;
								const plotArc = function(elm, p1, p2, cp) {
									let c = findCenter(p1, p2, cp);
									let rd = Math.sqrt((p1[0] - c[0]) ** 2 + (p1[1] - c[1]) ** 2);

									let rr = radiusRange(p1, p2, cp, c);
									let arc = d3.arc().innerRadius(rd)
										.outerRadius(rd)
										.startAngle(rr[1])
										.endAngle(rr[0]);
									elm.attr("d", arc).attr("transform", "translate(" + c[0] + "," + c[1] + ")");
								};
								initDummyPlot = (r, cp) => {
									stopper && stopper();
									if (p1 == null) {
										let cont = true;
										const elm = r.append("circle").attr("stroke", "red").attr("fill-opacity", 0);
										(function repeat() {
											const rad = Math.random() * 2 * Math.PI;
											cont && elm.attr("cx", 0).attr("cy", 0).attr("r", 0)
												.attr("opacity", 1)
												.transition()
												.duration(3000)
												.ease(d3.easeLinear)
												.attr("opacity", 0)
												.attr("cx", Math.cos(rad) * 200)
												.attr("cy", Math.sin(rad) * 200)
												.attr("r", 200)
												.on("end", repeat);
										})();
										stopper = () => cont = false;
									} else if (p2 == null) {
										const lin = r.append("line")
											.attr("x1", p1[0]).attr("y1", p1[1])
											.attr("x2", cp[0]).attr("y2", cp[1])
											.style("stroke-dasharray", "3, 3")
											.attr("stroke", "red");
										let cont = true;
										const arc = r.append("path").attr("stroke", "red");
										let tgl = true;
										(function repeat() {
											tgl = !tgl;
											cont && arc.attr("opacity", 1)
												.transition()
												.duration(3000)
												.ease(d3.easeLinear)
												.attr("opacity", 0)
												.tween("", function() {
													let elm = d3.select(this);
													return (t) => {
														let size = t * 300 + 1;
														let p2 = [+lin.attr("x2"), +lin.attr("y2")];
														let bc = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
														let v = [bc[0] - p1[0], bc[1] - p1[1]];
														let d = Math.sqrt(v[0] ** 2 + v[1] ** 2);
														if (d == 0) {
															elm.attr("d", null);
															return;
														}
														v = [v[0] / d, v[1] / d];
														let p3 = (tgl) ? [v[1], -v[0]] : [-v[1], v[0]];
														plotArc(elm, p1, p2, [bc[0] + p3[0] * size, bc[1] + p3[1] * size]);
													};
												})
												.on("end", repeat);
										})();
										stopper = () => cont = false;
									} else {
										r.append("path").attr("stroke", "red");
									}
								};
								moveDummyPlot = (r, cp) => {
									if (p1 == null) {
										r.select("circle").attr("transform", "translate(" + cp[0] + "," + cp[1] + ")");
									} else if (p2 == null) {
										r.select("line").attr("x2", cp[0]).attr("y2", cp[1]);
									} else {
										plotArc(r.select("path"), p1, p2, cp);
									}
								};
								removeDummyPlot = () => stopper && stopper();
							},
							"spiral": () => {
								let center = null;
								handlePoints = (r, cp) => {
									if (center == null) {
										center = cp;
										return;
									}
									const width = svg.node().getBoundingClientRect().width;
									const height = svg.node().getBoundingClientRect().height;
									const category = +palletValue("mode_add_category");
									const number = +palletValue("mode_add_number");
									const noise = +palletValue("mode_add_noise");
									const turns = +palletValue("mode_add_pattern_spiral_turns");

									const c = (center[1] - cp[1]);
									const s = (center[0] - cp[0]);
									for (let i = 0; i < number; i++) {
										let rad = Math.sqrt(Math.random()) * turns * 2 * Math.PI
										let p = [(Math.cos(rad) + rad * Math.sin(rad)) / (2 * Math.PI), (Math.sin(rad) - rad * Math.cos(rad)) / (2 * Math.PI)];
										const nr = normal_random(0, 2 * noise);
										const X = clip(nr[0] + p[0] * c + p[1] * s + center[0], 10, width - 10);
										const Y = clip(nr[1] - p[0] * s + p[1] * c + center[1], 10, height - 10);
										points.push(new DataPoint(r, [X, Y], category));
									}
									center = null;
								};
								initDummyPlot = (r, cp) => {
									if (center == null) {
										new DataPoint(r, cp, -1);
									} else {
										r.append("g").attr("transform", "translate(" + center[0] + ", " + center[1] + ")")
											.append("path")
											.attr("fill-opacity", 0)
											.attr("stroke", "red");
									}
								};
								moveDummyPlot = (r, cp) => {
									if (center == null) {
										r.select("circle").attr("cx", cp[0]).attr("cy", cp[1]);
									} else {
										const turns = +palletValue("mode_add_pattern_spiral_turns");
										const line = d3.line().x(d => d[0]).y(d => d[1]).curve(d3.curveCardinalOpen);
										let np = [];
										const c = (center[1] - cp[1]);
										const s = (center[0] - cp[0]);
										const spl = 10;
										for (let i = -1; i <= spl * turns + 1; i++) {
											let rad = i / spl * 2 * Math.PI
											let p = [(Math.cos(rad) + rad * Math.sin(rad)) / (2 * Math.PI), (Math.sin(rad) - rad * Math.cos(rad)) / (2 * Math.PI)];
											np.push([p[0] * c + p[1] * s, -p[0] * s + p[1] * c]);
										}
										r.select("path").attr("d", line(np));
									}
								};
								removeDummyPlot = null;
							}
						},
						"child": {
							"spiral": [
								{
									"name": "turns",
									"type": "slider",
									"default": 3,
									"range": [1, 10]
								}
							]
						}
					},
					{
						"name": "number",
						"type": "slider",
						"default": 100,
						"range": [1, 1000]
					},
					{
						"name": "noise",
						"type": "slider",
						"default": 5,
						"range": [0, 20]
					}
				],
				"remove": [
					{
						"name": "pattern",
						"type": "list",
						"data": ["point", "all", "circle"],
						"click": {
							"point": () => {
								handlePoints = (r, cp) => {
									if (points.length > 0) {
										let idx = argmin(points, p => p.vector.distance(new DataVector(cp)));
										points.splice(idx, 1)[0].remove();
									}
								};
								initDummyPlot = null;
								moveDummyPlot = (r, cp) => {
									r.selectAll("*").remove();
									if (points.length > 0) {
										let idx = argmin(points, p => p.vector.distance(new DataVector(cp)));
										new DataPoint(r, points[idx].at, -1);
									}
								};
								removeDummyPlot = null;
							},
							"all": () => {
								handlePoints = (r, cp) => {
									points.forEach(p => p.remove());
									points.length = 0;
								};
								initDummyPlot = (r, cp) => points.forEach(p => new DataPoint(r, p.at, -1));
								moveDummyPlot = null;
								removeDummyPlot = null;
							},
							"circle": () => {
								handlePoints = (r, cp) => {
									const size = +palletValue("mode_remove_pattern_circle_size");
									let oldPoints = [].concat(points);
									points.length = 0;
									let cpv = new DataVector(cp);
									oldPoints.forEach(p => {
										if (p.vector.distance(cpv) <= size) {
											p.remove();
										} else {
											points.push(p);
										}
									});
								};
								initDummyPlot = (r, cp) => {
									const size = +palletValue("mode_remove_pattern_circle_size");
									r.append("circle")
										.attr("cx", cp[0])
										.attr("cy", cp[1])
										.attr("fill-opacity", "0")
										.attr("stroke", "red")
										.attr("r", size);
									let gin = r.append("g");
									points.forEach(p => {
										if (p.vector.distance(new DataVector(cp)) <= size) {
											new DataPoint(gin, p.at, -1);
										}
									});
								};
								moveDummyPlot = (r, cp) => {
									const size = +palletValue("mode_remove_pattern_circle_size");
									r.select("circle")
										.attr("cx", cp[0])
										.attr("cy", cp[1]);
									let gin = r.select("g");
									gin.selectAll("*").remove();
									points.forEach(p => {
										if (p.vector.distance(new DataVector(cp)) <= size) {
											new DataPoint(gin, p.at, -1);
										}
									});
								};
								removeDummyPlot = null;
							}
						},
						"child": {
							"circle": [
								{
									"name": "size",
									"type": "slider",
									"default": 50,
									"range": [1, 100]
								}
							]
						}
					}
				],
				"setting": [
					{
						"name": "width",
						"type": "slider",
						"default": 960,
						"step": 10,
						"range": [100, 1000],
						"change": value => {
							d3.select("#plot-area").style("width", value + "px");
						}
					},
					{
						"name": "height",
						"type": "slider",
						"default": 500,
						"step": 10,
						"range": [100, 1000],
						"change": value => {
							d3.select("#plot-area").style("height", value + "px");
						}
					}
				],
				"modify": [
					{
						"name": "op",
						"type": "list",
						"data": ["squeeze category"],
						"select": [false],
						"input": ["button"],
						"click": {
							"squeeze category": () => {
								let pm = [];
								let maxCategory = 1;
								points.forEach(p => {
									if (!pm[p.category]) pm[p.category] = maxCategory++;
									p.category = pm[p.category];
								});
							}
						}
					}
				]
			}
		}
	];

	let createPallet = function(defName, dt) {
		const dv = pallet.select("#menu")
			.append("div")
			.attr("name", defName);
		dv.append("ul")
			.selectAll("li")
			.data(dt)
			.enter()
			.append("li")
			.classed("pallet-row", true)
			.each(function(d) {
				const name = defName + "_" + d.name;
				const elm = d3.select(this).attr("name", name);
				elm.append("input")
					.attr("id", name)
					.attr("name", "menu_input")
					.attr("type", "checkbox")
					.classed("hide", true);
				elm.append("label").attr("for", name).text(d.name);
				const drawer = elm.append("div").classed("drawer", true);
				switch (d.type) {
				case "list":
					drawer.append("ul")
						.selectAll("li")
						.data(d.data)
						.enter()
						.append("li")
						.classed("item", true)
						.each(function(ld, i) {
							const itm = d3.select(this);
							const itmr = itm.append("input")
								.attr("type", (d.input && d.input[i]) ? d.input[i] : "radio")
								.attr("name", name)
								.attr("value", ld)
								.attr("id", name + "_" + ld)
								.classed("hide", true);
							itmr.on("click", () => {
								d.click && d.click[ld] && d.click[ld]();
								pallet.selectAll("#menu div[name^=" + name + "_]").style("display", "none");
								if (d.child && d.child[ld]) {
									const target = pallet.select("#menu div[name=" + name + "_" + ld + "]");
									target.style("display", "inline");
									target.selectAll("input[type=radio]:checked")
										.each(function() {
											d3.select(this).on("click")();
										});
								}
							});
							if (d.child && d.child[ld]) {
								createPallet(name + "_" + ld, d.child[ld]);
							}
							itm.append("label").attr("for", name + "_" + ld).text(ld);
							if (!d.select && i == 0 || d.select && d.select[i]) {
								itmr.property("checked", true).on("click")();
							}
						});
					//drawer.select("li:first-child input").property("checked", true).on("click")();
					break;
				case "category":
					drawer.append("div")
						.style("margin-right", "10px")
						.text("-")
						.on("click", () => {
							const itm = drawer.select("ul");
							const n = itm.selectAll("li").size();
							if (n > 1) {
								const last = itm.select("li:last-child");
								last.remove();
								if (last.select("input").property("checked")) {
									drawer.selectAll("ul li:last-child input")
										.property("checked", true)
										.on("click")();
								}
							}
						});
					drawer.append("ul");
					drawer.append("div")
						.text("+")
						.on("click", () => {
							const n = drawer.selectAll("ul li").size();
							const additm = drawer.select("ul").append("li").classed("item", true);
							additm.append("input")
								.attr("type", "radio")
								.attr("name", name + "category")
								.attr("value", n)
								.attr("id", name + "category-" + n)
								.classed("hide", true)
								.on("click", function() {
									elm.property("value", n);
									drawer.selectAll("li").each(function(d, i) {
										const color = getCategoryColor(n);
										d3.select(this).style("border", null);
									});
									additm.style("border", "red 2px solid");
								});
							const color = getCategoryColor(n);
							additm.append("label")
								.attr("for", name + "category-" + n)
								.text(n)
								.style("background-color", color.toString())
								.style("color", (color.r * 0.3 + color.g * 0.6 + color.b * 0.1) > 127 ? "black" : "white");
						})
						.on("click")();
					drawer.select("li:first-child input").property("checked", true);
					break;
				case "slider":
					elm.property("value", d.default);
					const min = d.range[0];
					const max = d.range[1];
					const step = d.step || 1;
					drawer.append("span")
						.style("width", "50px")
						.text(d.default);
					drawer.append("div")
						.style("width", "100px")
						.classed("slider", true)
						.call(setSlider, rate => {
							let val = rate * (max - min) + min;
							val = Math.floor(val / step) * step;
							drawer.select("span").text(val);
							elm.property("value", val);
							d.change && d.change(val);
						})
						.select(".slider-handle")
						.style("left", (100 * d.default / (max - min)) + "px");
					break;
				}
			});
		return dv;
	}
	createPallet("pallet", palletData);
	pallet.select(".pallet-row[name=pallet_mode] ul li:first-child input").on("click")();

	pallet.selectAll(".pallet-row .drawer")
		.on("mouseenter", function() {
			let dummyRange = d3.select("g.dummy-range");
			removeDummyPlot && removeDummyPlot(dummyRange);
			dummyRange.selectAll("*").remove();
		});
}

