class DIANA {
	// https://www.slideshare.net/sesejun/datamining-8th-hclustering
	constructor() {
	}

	get size() {
		return this._s.length
	}

	init(datas) {
		this._x = datas
		this._s = [[]]
		for (let i = 0; i < datas.length; i++) {
			this._s[0][i] = i
		}
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	_v(i, v, s) {
		let a = 0
		for (let k = 0; k < v.length; k++) {
			if (v[k] !== i && s.indexOf(v[k]) < 0) {
				a += this._distance(this._x[i], this._x[v[k]])
			}
		}
		a = a / (v.length - s.length - 1)

		if (s.length > 0) {
			let b = 0
			for (let k = 0; k < s.length; k++) {
				b += this._distance(this._x[i], this._x[s[k]])
			}
			a -= b / s.length
		}
		return a
	}

	fit() {
		const new_s = []
		for (const v of this._s) {
			if (v.length === 1) {
				new_s.push(v)
				continue
			}

			const s = []
			while (s.length < v.length) {
				let max_v = -Infinity
				let max_i = -1
				for (let i = 0; i < v.length; i++) {
					if (s.indexOf(v[i]) >= 0) continue
					const a = this._v(v[i], v, s)
					if (max_v < a) {
						max_v = a
						max_i = v[i]
					}
				}
				if (max_v <= 0) break
				s.push(max_i)
			}

			if (s.length === 0 || s.length === v.length) {
				new_s.push(v)
			} else {
				const s0 = v.filter(a => s.indexOf(a) < 0)
				new_s.push(s, s0)
			}
		}
		this._s = new_s
	}

	predict() {
		const p = []
		for (let i = 0; i < this._x.length; i++) {
			for (let k = 0; k < this._s.length; k++) {
				if (this._s[k].indexOf(i) >= 0) {
					p.push(k)
					break
				}
			}
		}
		return p
	}
}

var dispDIANA = function(elm, platform) {
	let model = null

	const fitModel = (cb) => {
		platform.fit(
			(tx, ty, pred_cb) => {
				if (!model) {
					model = new DIANA();
					model.init(tx);
				}
				model.fit()
				const pred = model.predict();
				pred_cb(pred.map(v => v + 1))
				elm.select("[name=clusters]").text(model.size);
				cb && cb()
			}
		);
	}

	elm.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			model = null
			elm.select("[name=clusters]").text(0);
		})
	const stepButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", () => {
			fitModel()
		});
	elm.append("span")
		.text(" Clusters: ");
	elm.append("span")
		.attr("name", "clusters");
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	dispDIANA(platform.setting.ml.configElement, platform)
}

