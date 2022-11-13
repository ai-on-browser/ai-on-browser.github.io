import Matrix from '../util/matrix.js'

const Kernel = {
	gaussian:
		(sigma = 1.0) =>
		(x, y) => {
			const s = Matrix.sub(x, y).reduce((acc, v) => acc + v * v, 0)
			return Math.exp(-s / sigma ** 2)
		},
	polynomial:
		(n = 2) =>
		(x, y) => {
			return x.dot(y.t).toScaler() ** n
		},
}

/**
 * Principal component analysis
 */
export class PCA {
	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 */
	fit(x) {
		x = Matrix.fromArray(x)
		const xd = x.cov()
		;[this._e, this._w] = xd.eigen()

		const esum = this._e.reduce((s, v) => s + v, 0)
		this._e = this._e.map(v => v / esum)
	}

	/**
	 * Returns reduced datas.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @param {number} rd Reduced dimension
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x, rd = 0) {
		x = Matrix.fromArray(x)
		const w = this._w
		if (rd > 0 && rd < w.cols) {
			w.resize(w.rows, rd)
		}
		return x.dot(w).toArray()
	}
}

/**
 * Dual Principal component analysis
 */
export class DualPCA {
	// Unsupervised and Supervised Principal Component Analysis: Tutorial (2019)
	// https://www.slideshare.net/antiplastics/pcagplvm
	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 */
	fit(x) {
		this._x = Matrix.fromArray(x)
		this._x.sub(this._x.mean(0))
		const xd = this._x.dot(this._x.t)
		;[this._e, this._w] = xd.eigen()

		this._w.div(Matrix.map(new Matrix(1, this._e.length, this._e), Math.sqrt))

		const esum = this._e.reduce((s, v) => s + v, 0)
		this._e = this._e.map(v => v / esum)
	}

	/**
	 * Returns reduced datas.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @param {number} rd Reduced dimension
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x, rd = 0) {
		x = Matrix.fromArray(x)
		const w = this._w
		if (rd > 0 && rd < w.cols) {
			w.resize(w.rows, rd)
		}
		return x.dot(this._x.tDot(w)).toArray()
	}
}

/**
 * Kernel Principal component analysis
 */
export class KernelPCA {
	// https://axa.biopapyrus.jp/machine-learning/preprocessing/kernel-pca.html
	/**
	 * @param {'gaussian' | 'polynomial' | function (number[], number[]): number} kernel Kernel name
	 * @param {*[]} [kernelArgs] Arguments for kernel
	 */
	constructor(kernel, kernelArgs = []) {
		if (typeof kernel === 'function') {
			this._kernel = (a, b) => kernel(a.value, b.value)
		} else {
			this._kernel = Kernel[kernel](...kernelArgs)
		}
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 */
	fit(x) {
		this._x = Matrix.fromArray(x)
		const n = this._x.rows
		const kx = new Matrix(n, n)
		const xrows = []
		for (let i = 0; i < n; i++) {
			xrows.push(this._x.row(i))
		}
		for (let i = 0; i < n; i++) {
			for (let j = i; j < n; j++) {
				const kv = this._kernel(xrows[i], xrows[j])
				kx.set(i, j, kv)
				kx.set(j, i, kv)
			}
		}
		const J = Matrix.sub(Matrix.eye(n, n), 1 / n)
		const xd = J.dot(kx).cov()
		;[this._e, this._w] = xd.eigen()

		const esum = this._e.reduce((s, v) => s + v, 0)
		this._e = this._e.map(v => v / esum)
	}

	_gram(x) {
		x = Matrix.fromArray(x)
		const m = x.rows
		const n = this._x.rows
		const k = new Matrix(m, n)
		for (let i = 0; i < m; i++) {
			for (let j = 0; j < n; j++) {
				const v = this._kernel(x.row(i), this._x.row(j))
				k.set(i, j, v)
			}
		}
		return k
	}

	/**
	 * Returns reduced datas.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @param {number} [rd=0] Reduced dimension
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x, rd = 0) {
		const w = this._w
		if (rd > 0 && rd < w.cols) {
			w.resize(w.rows, rd)
		}
		x = this._gram(x)
		return x.dot(w).toArray()
	}
}

/**
 * Principal component analysis for anomaly detection
 */
export class AnomalyPCA extends PCA {
	// http://tekenuko.hatenablog.com/entry/2017/10/16/211549
	constructor() {
		super()
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 */
	fit(x) {
		x = Matrix.fromArray(x)
		this._m = x.mean(0)
		x.sub(this._m)
		super.fit(x)
	}

	/**
	 * Returns anomaly degrees.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		x.sub(this._m)
		const n = this._w.rows
		let eth = 0.99
		let t = 0
		for (; t < this._e.length - 1 && eth >= 0; t++) {
			eth -= this._e[t]
		}
		t = Math.max(1, t)
		const u = this._w.slice(0, t, 1)
		const s = Matrix.eye(n, n)
		s.sub(u.dot(u.t))
		const xs = x.dot(s)
		xs.mult(x)
		return xs.sum(1).value
	}
}
