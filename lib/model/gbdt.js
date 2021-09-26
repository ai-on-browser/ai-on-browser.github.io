import { Matrix } from '../util/math.js'

import { DecisionTreeRegression } from './decision_tree.js'

/**
 * Gradient boosting decision tree
 */
export class GBDT {
	// https://www.acceluniverse.com/blog/developers/2019/12/gbdt.html
	// https://techblog.nhn-techorus.com/archives/14801
	/**
	 * @param {number} maxdepth
	 * @param {number} srate
	 * @param {number} lr
	 */
	constructor(maxdepth = 1, srate = 1.0, lr = 0) {
		this._trees = []
		this._r = []
		this._maxd = maxdepth
		this._srate = srate
		this._lr = lr
	}

	/**
	 * Number of trees
	 * @type {number}
	 */
	get size() {
		return this._trees.length
	}

	_sample(n) {
		const arr = []
		for (let i = 0; i < n; i++) {
			arr[i] = i
		}
		for (let i = n - 1; i > 0; i--) {
			let r = Math.floor(Math.random() * (i + 1))
			;[arr[i], arr[r]] = [arr[r], arr[i]]
		}
		return arr.slice(0, Math.ceil(n * this._srate))
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} x
	 * @param {Array<Array<number>>} y
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
		const tree = new DecisionTreeRegression()
		const idx = this._sample(this._x.length)
		tree.init(
			idx.map(i => this._x[i]),
			this._loss.row(idx).toArray()
		)
		for (let i = 0; i < this._maxd; i++) {
			tree.fit()
		}
		this._trees.push(tree)

		const p = Matrix.fromArray(tree.predict(this._x))
		let r = this._lr
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
	 * @param {Array<Array<number>>} x
	 * @returns {Array<Array<number>>}
	 */
	predict(x) {
		const ps = this._trees.map(t => Matrix.fromArray(t.predict(x)))
		const p = Matrix.zeros(this._y.rows, this._y.cols)
		for (let i = 0; i < ps.length; i++) {
			ps[i].mult(this._r[i])
			p.add(ps[i])
		}
		return p.toArray()
	}
}

/**
 * Gradient boosting decision tree classifier
 */
export class GBDTClassifier extends GBDT {
	/**
	 * @param {number} maxdepth
	 * @param {number} srate
	 * @param {number} lr
	 */
	constructor(maxdepth = 1, srate = 1.0, lr = 0) {
		super(maxdepth, srate, lr)
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} x
	 * @param {Array<Array<number>>} y
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
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x
	 * @returns {Array<Array<number>>}
	 */
	predict(x) {
		const ps = this._trees.map(t => Matrix.fromArray(t.predict(x)))
		const p = Matrix.zeros(this._y.rows, this._y.cols)
		for (let i = 0; i < ps.length; i++) {
			ps[i].mult(this._r[i])
			p.add(ps[i])
		}
		return p.argmax(1).value.map(v => this._cls[v])
	}
}
