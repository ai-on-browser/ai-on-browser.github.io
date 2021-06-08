class MixtureDiscriminant {
	// http://www.personal.psu.edu/jol2/course/stat597e/notes2/mda.pdf
	constructor(r) {
		this._r = r
	}

	init(x, y) {
		this._x = x
		this._y = y

		this._d = this._x[0].length
		this._c = [...new Set(y)]
		this._p = Matrix.random(this._x.length, this._r)
		this._p.div(this._p.sum(1))

		this._a = []
		for (let i = 0; i < this._c.length; i++) {
			const xi = this._x.filter((v, k) => this._y[k] === this._c[i])
			this._a[i] = xi.length / this._x.length
		}

		this._mstep()
	}

	_mstep() {
		this._pi = Matrix.zeros(this._c.length, this._r)
		this._m = []
		for (let i = 0; i < this._c.length; i++) {
			this._m[i] = Matrix.zeros(this._r, this._d)
		}

		const count = Matrix.zeros(this._c.length, 1)
		const psum = []
		for (let i = 0; i < this._c.length; i++) {
			psum[i] = Matrix.zeros(1, this._r)
		}
		for (let i = 0; i < this._x.length; i++) {
			const cidx = this._c.indexOf(this._y[i])
			for (let r = 0; r < this._r; r++) {
				const pir = this._p.at(i, r)
				this._pi.addAt(cidx, r, pir)
				for (let d = 0; d < this._d; d++) {
					this._m[cidx].addAt(r, d, this._x[i][d] * pir)
				}
			}
			count.addAt(cidx, 0, 1)
			psum[cidx].add(this._p.row(i))
		}
		this._pi.div(count)
		for (let i = 0; i < this._c.length; i++) {
			this._m[i].div(psum[i].t)
		}

		this._s = Matrix.zeros(this._d, this._d)
		const yidx = this._y.map((v, i) => [v, i])
		for (let i = 0; i < this._c.length; i++) {
			let xi = this._x.filter((v, k) => this._y[k] === this._c[i])
			xi = Matrix.fromArray(xi)
			const pi = this._p.row(yidx.filter(v => v[0] === this._c[i]).map(v => v[1]))
			for (let r = 0; r < this._r; r++) {
				const xir = xi.copySub(this._m[i].row(r))
				const v = xir.tDot(xir.copyMult(pi.col(r)))
				this._s.add(v)
			}
		}
		this._s.div(this._x.length)
		this._sinv = this._s.inv()
	}

	fit() {
		this._p = Matrix.zeros(this._x.length, this._r)
		for (let i = 0; i < this._x.length; i++) {
			const cidx = this._c.indexOf(this._y[i])
			const x = new Matrix(1, this._d, this._x[i])
			for (let r = 0; r < this._r; r++) {
				const xir = x.copySub(this._m[cidx].row(r))
				const v = xir.dot(this._sinv).dot(xir.t).value[0]
				this._p.addAt(i, r, this._pi.at(cidx, r) * Math.exp(-v / 2))
			}
		}
		this._p.div(this._p.sum(1))

		this._mstep()
	}

	predict(data) {
		const x = Matrix.fromArray(data)
		const p = Matrix.zeros(x.rows, this._c.length)
		for (let i = 0; i < this._c.length; i++) {
			for (let r = 0; r < this._r; r++) {
				const xi = x.copySub(this._m[i].row(r))
				const v = xi.dot(this._sinv)
				v.mult(xi)
				const s = v.sum(1)
				s.map(v => this._pi.at(i, r) * Math.exp(-v / 2))
				for (let n = 0; n < x.rows; n++) {
					p.addAt(n, i, this._a[i] * s.at(n, 0))
				}
			}
		}
		return p.argmax(1).value.map(v => this._c[v])
	}
}

var dispMDA = function(elm, platform) {
	let model = null
	const calc = (cb) => {
		platform.fit((tx, ty) => {
			ty = ty.map(v => v[0])
			if (!model) {
				const r = +elm.select("[name=r]").property("value")
				model = new MixtureDiscriminant(r)
				model.init(tx, ty)
			}
			model.fit()
			platform.predict((px, pred_cb) => {
				const categories = model.predict(px);
				pred_cb(categories)
			}, 3)
			cb && cb()
		})
	}

	elm.append("span")
		.text(" r ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "r")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 10)
	platform.setting.ml.controller.stepLoopButtons().init(() => {
		model = null
		platform.init()
	}).step(calc).epoch()
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispMDA(platform.setting.ml.configElement, platform);
}
