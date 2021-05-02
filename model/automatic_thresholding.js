class AutomaticThresholding {
	// https://en.wikipedia.org/wiki/Thresholding_(image_processing)
	// http://www.math.tau.ac.il/~turkel/notes/otsu.pdf
	constructor() {
		this._th = null
	}

	fit(x) {
		const n = x.length

		if (!this._th) {
			this._th = x.reduce((s, v) => s + v, 0) / n
		}

		let m1 = 0
		let m2 = 0
		let n1 = 0
		let n2 = 0
		for (let i = 0; i < n; i++) {
			if (x[i] < this._th) {
				m1 += x[i]
				n1++
			} else {
				m2 += x[i]
				n2++
			}
		}
		this._th = (m1 / n1 + m2 / n2) / 2
	}

	predict(x) {
		return x.map(v => v < this._th ? 0 : 1)
	}
}

var dispAutomatic = function(elm, platform) {
	platform.colorSpace = 'gray'
	let model = null
	const fitModel = (cb) => {
		platform.fit((tx, ty, pred_cb) => {
			if (!model) {
				model = new AutomaticThresholding()
			}
			model.fit(tx.flat(2))
			let y = model.predict(tx.flat(2))
			elm.select("[name=threshold]").text(model._th)
			pred_cb(y.map(v => specialCategory.density(1 - v)))
			cb && cb()
		}, 1);
	}

	platform.setting.ml.controller.stepLoopButtons().init(() => {
		model = null
		elm.select("[name=threshold]").text(0);
	}).step(fitModel).epoch()
	elm.append("span")
		.text(" Estimated threshold ")
	elm.append("span")
		.attr("name", "threshold")
}

export default function(platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispAutomatic(platform.setting.ml.configElement, platform);
}
