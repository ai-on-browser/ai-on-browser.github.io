import { Matrix } from '../util/math.js'

const Kernel = {
	gaussian:
		(sigma = 1.0) =>
		(x, y) => {
			const s = x.copySub(y).reduce((acc, v) => acc + v * v, 0)
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
	 * @param {Array<Array<number>>} x
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
	 * @param {Array<Array<number>>} x
	 * @param {number} rd
	 * @returns {Array<Array<number>>}
	 */
	predict(x, rd = 0) {
		x = Matrix.fromArray(x)
		let w = this._w
		if (rd > 0 && rd < w.cols) {
			w = w.resize(w.rows, rd)
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
	 * @param {Array<Array<number>>} x
	 */
	fit(x) {
		this._x = Matrix.fromArray(x)
		this._x.sub(this._x.mean(0))
		const xd = this._x.dot(this._x.t)
		;[this._e, this._w] = xd.eigen()

		this._w.div(new Matrix(1, this._e.length, this._e).copyMap(Math.sqrt))

		const esum = this._e.reduce((s, v) => s + v, 0)
		this._e = this._e.map(v => v / esum)
	}

	/**
	 * Returns reduced datas.
	 *
	 * @param {Array<Array<number>>} x
	 * @param {number} rd
	 * @returns {Array<Array<number>>}
	 */
	predict(x, rd = 0) {
		x = Matrix.fromArray(x)
		let w = this._w
		if (rd > 0 && rd < w.cols) {
			w = w.resize(w.rows, rd)
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
	 * @param {'gaussian' | 'polynomial'} kernel
	 * @param {*[]} [kernelArgs]
	 */
	constructor(kernel, kernelArgs = []) {
		this._kernel = Kernel[kernel](...kernelArgs)
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x
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
		const J = Matrix.eye(n, n).copySub(1 / n)
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
	 * @param {Array<Array<number>>} x
	 * @param {number} [rd=0]
	 * @returns {Array<Array<number>>}
	 */
	predict(x, rd = 0) {
		let w = this._w
		if (rd > 0 && rd < w.cols) {
			w = w.resize(w.rows, rd)
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
	 * @param {Array<Array<number>>} x
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
	 * @param {Array<Array<number>>} x
	 * @returns {number[]}
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
