class IsotonicRegression {
	// http://kasuya.ecology1.org/stats/isoreg1.html
	constructor() {
	}

	fit(x, y) {
		const d = x.map((v, i) => [v, y[i]])
		d.sort((a, b) => a[0] - b[0])
		this._x = x = d.map(v => v[0])
		y = d.map(v => v[1])
		const csd = [0]
		let k = 0
		for (let i = 1; i <= y.length; i++) {
			csd[i] = csd[i - 1] + y[i - 1]
			if (k <= y[i - 1]) {
				k = y[i - 1]
			} else {
				let c = 0
				for (let j = i - 2; j >= 1; j--) {
					if (csd[j] - csd[j - 1] <= (csd[i] - csd[j]) / (i - j)) {
						c = j
						k = (csd[i] - csd[j]) / (i - j)
						break
					}
				}
				for (let j = c + 1; j < i; j++) {
					csd[j] = csd[c] + k * (j - c)
				}
			}
		}
		this._g = csd.slice(1).map((v, i) => v - csd[i])
		this._x = x
	}

	predict(x) {
		const n = this._x.length
		return x.map(v => {
			let i = n
			for (; i > 0; i--) {
				if (v > this._x[i]) {
					break
				}
			}
			return this._g[i]
		})
	}
}

var dispIsotonic = function(elm, platform) {
	const task = platform.task
	const fitModel = (cb) => {
		const dim = platform.datas.dimension
		platform.fit((tx, ty) => {
			const model = new IsotonicRegression()
			model.fit(tx.map(v => v[0]), ty.map(v => v[0]))
			platform.predict((px, pred_cb) => {
				pred_cb(model.predict(px.map(v => v[0])))
			}, 1)
		});
	};

	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button. This model works with 1D data only.'
	dispIsotonic(platform.setting.ml.configElement, platform);
}

