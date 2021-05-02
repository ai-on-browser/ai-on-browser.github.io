class RVM {
	// https://qiita.com/ctgk/items/ee512530618a5eeccd1a
	// https://en.wikipedia.org/wiki/Relevance_vector_machine
	constructor() {
		this._alpha = 1.0
		this._beta = 1.0
	}

	_kernel(x, y) {
		const k = x.copySub(y)
		return Math.exp(-10 * k.norm() ** 2)
	}

	fit(x, y) {
		this._x = x = Matrix.fromArray(x)
		y = Matrix.fromArray(y);
		const n = x.rows

		const p = new Matrix(n, n)
		for (let i = 0; i < n; i++) {
			for (let j = i; j < n; j++) {
				const k = this._kernel(x.row(i), x.row(j))
				p.set(i, j, k)
				p.set(j, i, k)
			}
		}
		const a = Array(n).fill(this._alpha)

		let maxCount = 1
		while (maxCount-- > 0) {
			const prec = p.tDot(p)
			prec.mult(this._beta)
			prec.add(Matrix.diag(a))
			this._cov = prec.inv()

			this._mean = this._cov.dot(p.tDot(y))
			this._mean.mult(this._beta)

			const g = []
			for (let i = 0; i < n; i++) {
				g.push(1 - a[i] * this._cov.at(i, i))
				a[i] = g[i] / Math.sqrt(this._mean.at(i, 0))
			}
			const tmp = y.copySub(p.dot(this._mean))
			tmp.map(v => v ** 2)

			this._beta = (n - g.reduce((s, v) => s + v, 0)) / tmp.sum()
		}
	}

	predict(x) {
		const n = this._x.rows
		x = Matrix.fromArray(x)
		const m = x.rows
		const k = new Matrix(m, n)
		for (let i = 0; i < m; i++) {
			for (let j = 0; j < n; j++) {
				const v = this._kernel(x.row(i), this._x.row(j))
				k.set(i, j, v)
			}
		}

		const mean = k.dot(this._mean)
		return mean.value
	}
}

var dispRVM = function(elm, platform) {
	let model = null
	const fitModel = (cb) => {
		platform.fit((tx, ty) => {
			model.fit(tx, ty);

			platform.predict((px, pred_cb) => {
				let pred = model.predict(px);
				pred_cb(pred);
				cb && cb()
			}, 4)
		});
	};

	platform.setting.ml.controller.stepLoopButtons().init(() => {
		model = new RVM()
		platform.init()
	}).step(fitModel).epoch()
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispRVM(platform.setting.ml.configElement, platform)
}
