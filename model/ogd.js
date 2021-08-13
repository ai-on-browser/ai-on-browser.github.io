export default class OnlineGradientDescent {
	// https://olpy.readthedocs.io/en/latest/modules/olpy.classifiers.OGD.html#olpy.classifiers.OGD
	constructor(c = 1, loss = 'zero_one') {
		this._c = c
		this._w = null

		this._loss = (t, y) => {
			return t === y ? 0 : 1
		}
	}

	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x)
		this._shift = this._x.mean(0)
		this._x.sub(this._shift)
		this._y = train_y

		this._w = Matrix.zeros(this._x.cols, 1)
		this._t = 1
	}

	update(x, y) {
		const m = Math.sign(this._w.tDot(x).value[0])
		const loss = this._loss(y, m)
		if (loss === 0) return
		const c = this._c / Math.sqrt(this._t)

		this._w.add(x.copyMult(c * y))
		this._t++
	}

	fit() {
		for (let i = 0; i < this._x.rows; i++) {
			this.update(this._x.row(i).t, this._y[i])
		}
	}

	predict(data) {
		const x = Matrix.fromArray(data)
		x.sub(this._shift)
		const r = x.dot(this._w)
		return r.value
	}
}
