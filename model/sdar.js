const levinsonDurbin = (r, o) => {
	let a = []
	let e = []
	for (let i = 0; i < o + 1; i++) {
		a.push(0)
		e.push(0)
	}

	a[0] = 1
	a[1] = -r[1] / r[0]
	e[1] = r[0] + r[1] * a[1]
	let lam = -r[1] / r[0]

	for (let k = 1; k < o; k++) {
		lam = 0
		for (let j = 0; j < k + 1; j++) {
			lam -= a[j] * r[k + 1 - j]
		}
		lam /= e[k]

		const u = [1]
		for (let i = 1; i < k + 1; i++) {
			u.push(a[i])
		}
		u.push(0)
		const v = [0]
		for (let i = k; i > 0; i--) {
			v.push(a[i])
		}
		v.push(1)

		a = []
		for (let i = 0; i < u.length; i++) {
			a.push(u[i] + lam * v[i])
		}
		e[k + 1] = e[k] * (1 - lam ** 2)
	}

	return [a, e[e.length - 1]]
}

export class SDAR {
	// http://www.viewcom.or.jp/wp-content/uploads/2018/04/beb9489f9fe1a5e1c81ed8e6c292c942.pdf
	// https://shino-tec.com/2020/02/01/changefinder/
	// https://github.com/shunsukeaihara/changefinder
	constructor(p = 1, r = 0.8) {
		this._m = Math.random()
		this._c = []
		for (let i = 0; i < p + 1; i++) {
			this._c.push(Math.random() / 100)
		}
		this._w = null
		this._s = Math.random()
		this._r = r
		this._p = p
		this._x = []
	}

	_update(data) {
		this._m = (1 - this._r) * this._m + this._r * data
		const lc = this._c[this._c.length - 1]
		this._c.unshift((1 - this._r) * lc + this._r * (data - this._m) ** 2)
		this._c.pop()

		const [w, e] = levinsonDurbin(this._c, this._p)

		let v = 0
		for (let i = 0; i < w.length && i < this._x.length; i++) {
			v -= w[i] * (this._x[this._x.length - i - 1] - this._m)
		}
		const x = v + this._m
		this._x.push(data)

		this._s = (1 - this._r) * this._s + this._r * (data - x) ** 2

		return [Math.exp(-0.5 * (data - x) ** 2 / this._s) / Math.sqrt(2 * Math.PI * this._s), x]
	}

	probability(data) {
		return data.map(d => {
			const [p, x] = this._update(d)
			return p
		})
	}

	predict(data, k) {
		for (let i = 0; i < data.length - 1; i++) {
			this._update(data[i])
		}
		const preds = []
		let x = data[data.length - 1]
		for (let i = 0; i < k; i++) {
			const [p, nx] = this._update(x)
			preds.push(nx)
			x = nx
		}
		return preds
	}
}

var dispSDAR = function(elm, platform) {
	const fitModel = () => {
		const p = +elm.select("[name=p]").property("value")
		const c = +elm.select("[name=c]").property("value")
		platform.plot((tx, ty, px, pred_cb) => {
			const model = new SDAR();
			tx = tx.map(v => v[0])
			const pred = model.predict(tx, c)
			pred_cb(pred.map(v => [v]))
		})
	}

	elm.append("span")
		.text("p")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "p")
		.attr("min", 1)
		.attr("max", 1000)
		.attr("value", 1)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel);
	elm.append("span")
		.text("predict count")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "c")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 100)
		.on("change", fitModel)
}

export default function(platform) {
	platform.setting.ml.draft = true
	platform.setting.ml.usage = 'Click and add data point. Click "fit" to update.'
	dispSDAR(platform.setting.ml.configElement, platform)
}
