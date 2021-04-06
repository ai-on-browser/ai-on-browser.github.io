class HopfieldNetwork {
	// https://www.tcom242242.net/entry/ai-2/deeplearning/%E3%83%8B%E3%83%A5%E3%83%BC%E3%83%A9%E3%83%AB%E3%83%8D%E3%83%83%E3%83%88/hopfieldnetwork/
	constructor() {
	}

	_normalize(x) {
		let max = -Infinity
		let min = Infinity
		for (let k = 0; k < x.length; k++) {
			for (let i = 0; i < x[k].length; i++) {
				max = Math.max(max, x[k][i])
				min = Math.min(min, x[k][i])
			}
		}
		for (let k = 0; k < x.length; k++) {
			for (let i = 0; i < x[k].length; i++) {
				x[k][i] = x[k][i] < (max + min) / 2 ? -1 : 1
			}
		}
	}

	fit(x) {
		this._normalize(x)
		this._w = []
		for (let i = 0; i < x[0].length; this._w[i++] = []);
		for (let k = 0; k < x.length; k++) {
			for (let i = 0; i < x[k].length; i++) {
				this._w[i][i] = 0
				for (let j = 0; j < i; j++) {
					this._w[i][j] = this._w[j][i] = x[k][i] * x[k][j]
				}
			}
		}
	}

	energy(x) {
		this._normalize([x])
		let e = 0
		for (let i = 0; i < this._w.length; i++) {
			for (let j = 0; j < this._w[i].length; j++) {
				e -= this._w[i][j] * x[i] * x[j] / 2
			}
		}
		return e
	}

	predict(x) {
		this._normalize([x])
		const y = []
		for (let i = 0; i < x.length; i++) {
			y[i] = 0
			for (let j = 0; j < x.length; j++) {
				y[i] += this._w[i][j] * x[j]
			}
		}
		return y.map((v, i) => v < 0 ? -1 : v > 0 ? 1 : x[i])
	}
}

var dispHopfield = function(elm, platform) {
	platform.colorSpace = '8 colors'
	let model = null
	let y = null
	let pcb = null
	const fitModel = () => {
		platform.fit((tx, ty) => {
			const c = tx[0][0].length
			const x = tx.flat(2)
			model = new HopfieldNetwork()
			model.fit([x])

			platform.predict((px, pred_cb) => {
				y = px.flat(2)
				model._normalize([y])
				pcb = p => {
					const pred = []
					for (let i = 0; i < p.length; i += c) {
						const v = []
						for (let k = 0; k < c; k++) {
							v.push(p[i + k] === -1 ? 0 : 255)
						}
						pred.push(v)
					}
					pred_cb(pred)
				}
				pcb(y)
			}, 8)
		}, null, 8);
	}

	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Estimate")
		.on("click", () => {
			if (!model) return
			y = model.predict(y)
			pcb(y)
		})
}

export default function(platform) {
	platform.setting.ml.usage = 'Click "Fit" button. Then, click "estimate" button.'
	dispHopfield(platform.setting.ml.configElement, platform);
}
