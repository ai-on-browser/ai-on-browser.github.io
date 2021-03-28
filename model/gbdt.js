import { DecisionTreeRegression } from './decision_tree.js'

class GBDT {
	// https://www.acceluniverse.com/blog/developers/2019/12/gbdt.html
	// https://techblog.nhn-techorus.com/archives/14801
	constructor(x, y, maxdepth = 1) {
		this._x = x
		this._y = Matrix.fromArray(y)
		this._trees = []
		this._r = []
		this._maxd = maxdepth
		this._loss = this._y.copy()
	}

	get size() {
		return this._trees.length
	}

	fit() {
		const tree = new DecisionTreeRegression(this._x, this._loss.value)
		for (let i = 0; i < this._maxd; i++) {
			tree.fit()
		}
		this._trees.push(tree)

		const p = Matrix.fromArray(tree.predict(this._x))
		const pdp = p.tDot(p)
		const d = this._loss.cols
		pdp.add(Matrix.eye(d, d, 1.0e-8))
		const lr = pdp.slove(p.tDot(this._loss))
		const r = lr.diag().reduce((s, v) => s + v, 0) / d
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
		return p
	}
}

class GBDTClassifier {
	constructor(x, y, maxdepth = 1) {
		this._x = x
		this._cls = [...new Set(y)]
		this._y = Matrix.zeros(y.length, this._cls.length)
		for (let i = 0; i < this._y.rows; i++) {
			this._y.set(i, this._cls.indexOf(y[i]), 1)
		}
		this._trees = []
		this._r = []
		this._maxd = maxdepth
		this._loss = this._y.copy()
	}

	get size() {
		return this._trees.length
	}

	fit() {
		const tree = new DecisionTreeRegression(this._x, this._loss.toArray())
		for (let i = 0; i < this._maxd; i++) {
			tree.fit()
		}
		this._trees.push(tree)

		const p = Matrix.fromArray(tree.predict(this._x))
		const pdp = p.tDot(p)
		const d = this._loss.cols
		pdp.add(Matrix.eye(d, d, 1.0e-8))
		const lr = pdp.slove(p.tDot(this._loss))
		const r = lr.diag().reduce((s, v) => s + v, 0) / d
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
		return p.argmax(1).copyMap(v => this._cls[v])
	}
}

var dispGBDT = function(elm, platform) {
	const task = platform.task
	let model = null
	const fitModel = (cb) => {
		const md = +elm.select("[name=maxd]").property("value")
		const itr = +elm.select("[name=itr]").property("value")
		platform.fit((tx, ty) => {
			if (!model) {
				if (task === "CF") {
					model = new GBDTClassifier(tx, ty.map(v => v[0]), md)
				} else {
					model = new GBDT(tx, ty, md)
				}
			}
			for (let i = 0; i < itr; i++) {
				model.fit();
			}

			platform.predict((px, pred_cb) => {
				let pred = model.predict(px).value;
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
	platform.setting.terminate = dispGBDT(platform.setting.ml.configElement, platform);
}

