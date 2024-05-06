import Matrix from '../util/matrix.js'

class XGBoostTree {
	constructor(lambda = 0.1, featureSampling = 0.8) {
		this._lambda = lambda
		this._fsrate = featureSampling

		this._g = (y, t) => -2 * t.reduce((s, v, d) => s + (v - y[d]), 0)
		this._h = (y, t) => 2
	}

	_sample(n) {
		const arr = Array.from({ length: n }, (_, i) => i)
		for (let i = n - 1; i > 0; i--) {
			let r = Math.floor(Math.random() * (i + 1))
			;[arr[i], arr[r]] = [arr[r], arr[i]]
		}
		return arr.slice(0, Math.ceil(n * this._fsrate))
	}

	init(datas, targets) {
		this._feature = this._sample(datas[0].length)
		this._datas = datas.map((d, i) => ({ value: this._feature.map(j => d[j]), target: targets[i] }))
		this._tree = { datas: this._datas, value: this._calcValue(this._datas), score: this._calcScore(this._datas) }
		this._leafs = [this._tree]
	}

	fit() {
		const newleafs = []
		this._leafs.forEach(node => {
			let best_score = node.score
			let best_feature = -1
			let best_threshold = -1
			for (let i = 0; i < this._feature.length; i++) {
				const values = node.datas.map(p => p.value[i])
				values.sort((a, b) => a - b)
				for (let vidx = 0; vidx < values.length - 1; vidx++) {
					const th = (values[vidx] + values[vidx + 1]) / 2
					const lt = node.datas.filter(p => p.value[i] < th)
					const rt = node.datas.filter(p => p.value[i] >= th)
					const score = (this._calcScore(lt) * lt.length + this._calcScore(rt) * rt.length) / values.length
					if (score < best_score) {
						best_score = score
						best_feature = i
						best_threshold = th
					}
				}
			}
			if (best_score < node.score) {
				node.feature = best_feature
				node.threshold = best_threshold
				const lt = node.datas.filter(p => p.value[best_feature] < best_threshold)
				const rt = node.datas.filter(p => p.value[best_feature] >= best_threshold)
				node.children = [
					{ datas: lt, score: this._calcScore(lt), value: this._calcValue(lt) },
					{ datas: rt, score: this._calcScore(rt), value: this._calcValue(rt) },
				]
				newleafs.push(...node.children)
			}
		})
		this._leafs = newleafs
	}

	_calcValue(datas) {
		if (datas.length === 0) return 0
		const dim = datas[0].target.length

		const value = Array(dim).fill(0)
		for (let i = 0; i < datas.length; i++) {
			for (let d = 0; d < dim; d++) {
				value[d] += datas[i].target[d]
			}
		}
		return value.map(v => v / datas.length)
	}

	_calcScore(datas) {
		if (datas.length === 0) return 0
		const m = this._calcValue(datas)
		const num = datas.reduce((acc, d) => acc + this._g(m, d.target), 0)
		const den = datas.reduce((acc, d) => acc + this._h(m, d.target), 0)
		return ((num * num) / (den + this._lambda) / 2) * datas.length
	}

	predict(data) {
		return data.map(d => {
			d = this._feature.map(v => d[v])
			let t = this._tree
			while (t.children) {
				t = t.children[d[t.feature] < t.threshold ? 0 : 1]
			}
			return t.value
		})
	}
}

/**
 * eXtreme Gradient Boosting regression
 */
export class XGBoost {
	// https://kefism.hatenablog.com/entry/2017/06/11/182959
	// https://qiita.com/triwave33/items/aad60f25485a4595b5c8
	/**
	 * @param {number} [maxdepth] Maximum depth of tree
	 * @param {number} [srate] Sampling rate
	 * @param {number} [lambda] Regularization parameter
	 * @param {number} [lr] Learning rate
	 */
	constructor(maxdepth = 1, srate = 1.0, lambda = 0.1, lr = 0.5) {
		this._trees = []
		this._r = []
		this._maxd = maxdepth
		this._srate = srate
		this._lambda = lambda
		this._learning_rate = lr
	}

	/**
	 * Number of trees
	 * @type {number}
	 */
	get size() {
		return this._trees.length
	}

	_sample(n) {
		const arr = Array.from({ length: n }, (_, i) => i)
		for (let i = n - 1; i > 0; i--) {
			const r = Math.floor(Math.random() * (i + 1))
			;[arr[i], arr[r]] = [arr[r], arr[i]]
		}
		return arr.slice(0, Math.ceil(n * this._srate))
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<number>>} y Target values
	 */
	init(x, y) {
		this._x = x
		this._y = Matrix.fromArray(y)
		this._loss = this._y.copy()
	}

	/**
	 * Fit model.
	 */
	fit() {
		const tree = new XGBoostTree(this._lambda)
		const idx = this._sample(this._x.length)
		tree.init(
			idx.map(i => this._x[i]),
			this._loss.row(idx).toArray()
		)
		for (let i = 0; i < this._maxd; i++) {
			tree.fit()
		}
		this._trees.push(tree)

		let r = this._learning_rate
		const p = Matrix.fromArray(tree.predict(this._x))
		if (!r) {
			const pdp = p.tDot(p)
			const d = this._loss.cols
			pdp.add(Matrix.eye(d, d, 1.0e-8))
			const lr = pdp.solve(p.tDot(this._loss))
			r = lr.diag().reduce((s, v) => s + v, 0) / d
		}
		this._r.push(r)

		p.mult(r)
		this._loss.sub(p)
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		const ps = this._trees.map(t => Matrix.fromArray(t.predict(x)))
		const p = Matrix.zeros(x.length, this._y.cols)
		for (let i = 0; i < ps.length; i++) {
			ps[i].mult(this._r[i])
			p.add(ps[i])
		}
		return p.value
	}
}

/**
 * eXtreme Gradient Boosting classifier
 */
export class XGBoostClassifier extends XGBoost {
	/**
	 * @param {number} [maxdepth] Maximum depth of tree
	 * @param {number} [srate] Sampling rate
	 * @param {number} [lambda] Regularization parameter
	 * @param {number} [lr] Learning rate
	 */
	constructor(maxdepth = 1, srate = 1.0, lambda = 0.1, lr = 0) {
		super(maxdepth, srate, lambda, lr)
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {*[]} y Target values
	 */
	init(x, y) {
		this._x = x
		this._cls = [...new Set(y)]
		this._y = Matrix.zeros(y.length, this._cls.length)
		for (let i = 0; i < this._y.rows; i++) {
			this._y.set(i, this._cls.indexOf(y[i]), 1)
		}
		this._loss = this._y.copy()
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(x) {
		const ps = this._trees.map(t => Matrix.fromArray(t.predict(x)))
		const p = Matrix.zeros(x.length, this._y.cols)
		for (let i = 0; i < ps.length; i++) {
			ps[i].mult(this._r[i])
			p.add(ps[i])
		}
		return p.argmax(1).value.map(v => this._cls[v])
	}
}
