class KernelKMeans {
	// http://ibisforest.org/index.php?%E3%82%AB%E3%83%BC%E3%83%8D%E3%83%ABk-means%E6%B3%95
	// https://research.miidas.jp/2019/07/kernel-kmeans%E3%81%AEnumpy%E5%AE%9F%E8%A3%85/
	constructor(k = 3) {
		this._k = k
		this._kernel = (a, b) => Math.exp(-(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 1) ** 2))
	}

	_distance(x, c) {
		const cx = this._x.filter((v, i) => this._labels[i] === c)
		let v = this._kernel(x, x)
		for (let i = 0; i < cx.length; i++) {
			v -= 2 * this._kernel(x, cx[i]) / cx.length
		}
		for (let i = 0; i < cx.length; i++) {
			v += this._kernel(cx[i], cx[i]) / (cx.length ** 2)
			for (let j = 0; j < i; j++) {
				v += 2 * this._kernel(cx[i], cx[j]) / (cx.length ** 2)
			}
		}
		return v
	}

	init(datas) {
		this._x = datas
		this._labels = []
		for (let i = 0; i < this._x.length; i++) {
			this._labels[i] = Math.floor(Math.random() * this._k)
		}
	}

	predict() {
		return this._labels
	}

	fit() {
		this._labels = this._x.map(value => {
			let min_d = Infinity
			let min_i = -1
			for (let i = 0; i < this._k; i++) {
				const d = this._distance(value, i)
				if (d < min_d) {
					min_d = d
					min_i = i
				}
			}
			return min_i
		})
	}
}

var dispKKMeans = function(elm, platform) {
	let model = null

	elm.append("span")
		.text(" k ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "k")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 3)
	platform.setting.ml.controller.stepLoopButtons().init(() => {
		platform.init()
		const k = +elm.select("[name=k]").property("value")
		model = new KernelKMeans(k)
		platform.fit((tx, ty) => {
			model.init(tx)
		})
	}).step(() => {
		model.fit()
		platform.fit((tx, ty, pred_cb) => {
			const pred = model.predict()
			pred_cb(pred.map(v => v + 1))
		})
	}).epoch()
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	dispKKMeans(platform.setting.ml.configElement, platform)
}
