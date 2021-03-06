class NMF {
	// https://abicky.net/2010/03/25/101719/
	// https://qiita.com/nozma/items/d8dafe4e938c43fb7ad1
	// http://lucille.sourceforge.net/blog/archives/000282.html
	constructor() {
	}

	init(x, rd = 0) {
		this._x = Matrix.fromArray(x).t
		if (this._x.value.some(v => v < 0)) {
			throw "Non-negative Matrix Fractorization only can process non negative matrix."
		}
		this._r = rd
		this._W = Matrix.random(this._x.rows, this._r)
		this._H = Matrix.random(this._r, this._x.cols)
	}

	fit() {
		const n = this._W.rows
		const m = this._H.cols

		let WH = this._W.dot(this._H)
		for (let j = 0; j < m; j++) {
			for (let i = 0; i < this._r; i++) {
				let s = 0
				for (let k = 0; k < n; k++) {
					s += this._W.at(k, i) * this._x.at(k, j) / WH.at(k, j)
				}
				this._H.multAt(i, j, s)
			}
		}

		for (let j = 0; j < this._r; j++) {
			for (let i = 0; i < n; i++) {
				let s = 0
				for (let k = 0; k < m; k++) {
					s += this._x.at(i, k) / WH.at(i, k) * this._H.at(j, k)
				}
				this._W.multAt(i, j, s)
			}
		}
		this._W.div(this._W.sum(0))
	}

	predict() {
		return this._H.t
	}
}

var dispNMF = function(elm, platform) {
	let model = null

	const fitModel = (cb) => {
		platform.fit(
			(tx, ty, pred_cb) => {
				const x_mat = Matrix.fromArray(tx);
				if (platform.task === 'CT') {
					if (!model) {
						model = new NMF()
						const k = +elm.select("[name=k]").property("value")
						model.init(x_mat, k)
					}
					model.fit()
					const pred = model.predict()
					pred_cb(pred.argmax(1).value.map(v => v + 1))
				} else {
					if (!model) {
						model = new NMF()
						const dim = platform.dimension;
						model.init(x_mat, dim)
					}
					model.fit()
					const pred = model.predict()
					pred_cb(pred.toArray())
				}
				cb && cb()
			}
		);
	}

	if (platform.task === 'CT') {
		elm.append("span")
			.text(" Size ");
		elm.append("input")
			.attr("type", "number")
			.attr("name", "k")
			.attr("value", 10)
			.attr("min", 1)
			.attr("max", 100)
	}
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		model = null
		platform.init()
	}).step(fitModel).epoch()
	return () => {
		slbConf.stop()
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ternimate = dispNMF(platform.setting.ml.configElement, platform);
}
