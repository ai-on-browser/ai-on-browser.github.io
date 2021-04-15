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
			const num = datas.reduce((acc, d) => acc + d.target.reduce((s, v, i) => s + this._g(m[i], v), 0) / d.length, 0)
			const den = datas.reduce((acc, d) => acc + this._h(m, d.target), 0)
			return num * num / (den + this._lambda) / 2 * datas.length
		} else {
			const num = datas.reduce((acc, d) => acc + this._g(m, d.target), 0)
			const den = datas.reduce((acc, d) => acc + this._h(m, d.target), 0)
			return num * num / (den + this._lambda) / 2 * datas.length
		}
	}
}

class XGBoost {
	// https://kefism.hatenablog.com/entry/2017/06/11/182959
	// https://qiita.com/triwave33/items/aad60f25485a4595b5c8
	constructor(maxdepth = 1, lambda = 0.1, lr = 0.5) {
		this._trees = []
		this._r = []
		this._maxd = maxdepth
		this._lambda = lambda
		this._learning_rate = lr
	}

	get size() {
		return this._trees.length
	}

	init(x, y) {
		this._x = x
		this._y = Matrix.fromArray(y)
		this._loss = this._y.copy()
	}

	fit() {
		const tree = new XGBoostTree(this._lambda)
		tree.init(this._x, this._loss.value)
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
			const lr = pdp.slove(p.tDot(this._loss))
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

var dispXGBoost = function(elm, platform) {
	const task = platform.task
	let model = null
	const fitModel = (cb) => {
		const lambda = +elm.select("[name=lambda]").property("value")
		const lr = +elm.select("[name=lr]").property("value")
		const md = +elm.select("[name=maxd]").property("value")
		const itr = +elm.select("[name=itr]").property("value")
		platform.fit((tx, ty) => {
			if (!model) {
				if (task === "CF") {
					// model = new XGBoostClassifier(tx, ty.map(v => v[0]), md, lambda)
				} else {
					model = new XGBoost(md, lambda, lr)
					model.init(tx, ty)
				}
			}
			for (let i = 0; i < itr; i++) {
				model.fit();
			}

			platform.predict((px, pred_cb) => {
				let pred = model.predict(px);
				pred_cb(pred);
				cb && cb()
			}, 4);
		})
	};

	elm.append("span")
		.text(" max depth = ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "maxd")
		.attr("value", 1)
		.attr("min", 1)
		.attr("max", 10)
	elm.append("span")
		.text(" lambda = ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "lambda")
		.attr("value", 0.1)
		.attr("min", 0.1)
		.attr("max", 10)
		.attr("step", 0.1)
	elm.append("span")
		.text(" learning rate = ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "lr")
		.attr("value", 0.1)
		.attr("min", 0)
		.attr("max", 10)
		.attr("step", 0.1)
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		model = null
		platform.init()
	})
	elm.append("span")
		.text(" Iteration ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "itr")
		.attr("value", 1)
		.attr("min", 1)
		.attr("max", 100)
	slbConf.step(fitModel).epoch(() => model.size)
	return () => {
		slbConf.stop()
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.terminate = dispXGBoost(platform.setting.ml.configElement, platform);
}
