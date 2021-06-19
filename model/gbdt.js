import { DecisionTreeRegression } from './decision_tree.js'

class GBDT {
	// https://www.acceluniverse.com/blog/developers/2019/12/gbdt.html
	// https://techblog.nhn-techorus.com/archives/14801
	constructor(maxdepth = 1, srate = 1.0, lr = 0) {
		this._trees = []
		this._r = []
		this._maxd = maxdepth
		this._srate = srate
		this._lr = lr
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
			let r = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[r]] = [arr[r], arr[i]]
		}
		return arr.slice(0, Math.ceil(n * this._srate))
	}

	init(x, y) {
		this._x = x
		this._y = Matrix.fromArray(y)
		this._loss = this._y.copy()
	}

	fit() {
		const tree = new DecisionTreeRegression()
		const idx = this._sample(this._x.length)
		tree.init(idx.map(i => this._x[i]), this._loss.row(idx).toArray())
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
		return p.toArray()
	}
}

class GBDTClassifier extends GBDT {
	constructor(maxdepth = 1, srate = 1.0, lr = 0) {
		super(maxdepth, srate, lr)
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

var dispGBDT = function(elm, platform) {
	const task = platform.task
	let model = null
	const fitModel = (cb) => {
		const md = +elm.select("[name=maxd]").property("value")
		const lr = +elm.select("[name=lr]").property("value")
		const itr = +elm.select("[name=itr]").property("value")
		const srate = +elm.select("input[name=srate]").property("value")
		platform.fit((tx, ty) => {
			if (!model) {
				if (task === "CF") {
					model = new GBDTClassifier(md, srate, lr)
					model.init(tx, ty.map(v => v[0]))
				} else {
					model = new GBDT(md, srate, lr)
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
		.text(" Sampling rate ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "srate")
		.property("value", 0.8)
		.attr("min", 0.1)
		.attr("max", 1)
		.attr("step", 0.1);
	elm.append("span")
		.text(" learning rate = ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "lr")
		.attr("value", 0.1)
		.attr("min", 0)
		.attr("max", 1)
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
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispGBDT(platform.setting.ml.configElement, platform);
}

