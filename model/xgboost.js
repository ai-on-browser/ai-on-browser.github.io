import { Matrix } from '../js/math.js'

import { DecisionTreeRegression } from './decision_tree.js'

class XGBoostTree extends DecisionTreeRegression {
	constructor(lambda = 0.1) {
		super()
		this._lambda = lambda

		this._g = (y, t) => -2 * (t - y)
		this._h = (y, t) => 2
	}

	_calcScore(datas) {
		if (datas.length === 0) return 0
		const m = this._calcValue(datas)
		if (Array.isArray(datas[0].target)) {
			const num = datas.reduce((acc, d) => acc + d.target.reduce((s, v, i) => s + this._g(m[i], v), 0), 0)
			const den = datas.reduce((acc, d) => acc + this._h(m, d.target), 0)
			return ((num * num) / (den + this._lambda) / 2) * datas.length
		} else {
			const num = datas.reduce((acc, d) => acc + this._g(m, d.target), 0)
			const den = datas.reduce((acc, d) => acc + this._h(m, d.target), 0)
			return ((num * num) / (den + this._lambda) / 2) * datas.length
		}
	}
}

export class XGBoost {
	// https://kefism.hatenablog.com/entry/2017/06/11/182959
	// https://qiita.com/triwave33/items/aad60f25485a4595b5c8
	constructor(maxdepth = 1, srate = 1.0, lambda = 0.1, lr = 0.5) {
		this._trees = []
		this._r = []
		this._maxd = maxdepth
		this._srate = srate
		this._lambda = lambda
		this._learning_rate = lr
	}

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

	init(x, y) {
		this._x = x
		this._y = Matrix.fromArray(y)
		this._loss = this._y.copy()
	}

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

	predict(x) {
		const ps = this._trees.map(t => Matrix.fromArray(t.predict(x)))
		const p = Matrix.zeros(this._y.rows, this._y.cols)
		for (let i = 0; i < ps.length; i++) {
			ps[i].mult(this._r[i])
			p.add(ps[i])
		}
		return p.value
	}
}

export class XGBoostClassifier extends XGBoost {
	constructor(maxdepth = 1, srate = 1.0, lambda = 0.1, lr = 0) {
		super(maxdepth, srate, lambda, lr)
	}

	init(x, y) {
		this._x = x
		this._cls = [...new Set(y)]
		this._y = Matrix.zeros(y.length, this._cls.length)
		for (let i = 0; i < this._y.rows; i++) {
			this._y.set(i, this._cls.indexOf(y[i]), 1)
		}
		this._loss = this._y.copy()
	}

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
