class PTile {
	// http://www.clg.niigata-u.ac.jp/~lee/jyugyou/img_processing/medical_image_processing_02_press.pdf
	constructor(p = 0.5) {
		this._p = p
	}

	predict(x) {
		const xs = x.concat()
		xs.sort((a, b) => a - b)
		const n = this._p * (xs.length - 1)
		const n0 = Math.floor(n)
		if (n === n0) {
			this._t = xs[n0]
		} else {
			this._t = xs[n0] * (n - n0) + xs[n0 + 1] * (1 - n + n0)
		}
		return x.map(v => v < this._t ? 0 : 1)
	}
}

var dispPTile = function(elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		const p = +elm.select("[name=p]").property("value")
		platform.fit((tx, ty, pred_cb) => {
			const model = new PTile(p)
			const y = model.predict(tx.flat(2))
			elm.select("[name=threshold]").text(model._t)
			pred_cb(y.map(v => specialCategory.density(1 - v)))
		}, 1);
	}

	elm.append("span")
		.text(" p = ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "p")
		.attr("min", 0)
		.attr("max", 1)
		.attr("value", 0.5)
		.attr("step", 0.1)
		.on("change", fitModel);
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel);
	elm.append("span")
		.text(" Estimated threshold ")
	elm.append("span")
		.attr("name", "threshold")
}

export default function(platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispPTile(platform.setting.ml.configElement, platform);
}
