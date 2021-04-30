class BalancedHistogramThresholding {
	// https://en.wikipedia.org/wiki/Balanced_histogram_thresholding
	constructor(minCount = 500) {
		this._minCount = minCount
	}

	predict(x) {
		const count = 200
		const max = x.reduce((m, v) => Math.max(m, v), -Infinity)
		const min = x.reduce((m, v) => Math.min(m, v), Infinity)

		const hist = Array(count).fill(0)
		for (let i = 0; i < x.length; i++) {
			if (x[i] === max) {
				hist[count - 1]++
			} else {
				hist[Math.floor((x[i] - min) / (max - min) * count)]++
			}
		}

		let hs = 0, he = hist.length - 1
		while (hist[hs] < this._minCount) {
			hs++
			if (hs >= hist.length) {
				throw "'minCount' is too large."
			}
		}
		while (hist[he] < this._minCount) {
			he--
		}
		let hc = Math.ceil((hs + he) / 2)
		let wl = 0
		let wr = 0

		for (let i = hs; i < he + 1; i++) {
			if (i < hc) {
				wl += hist[i]
			} else {
				wr += hist[i]
			}
		}
		while (hs < he) {
			if (wl > wr) {
				wl -= hist[hs++]
			} else {
				wr -= hist[he--]
			}
			const nc = Math.ceil((hs + he) / 2)
			if (nc < hc) {
				wl -= hist[hc - 1]
				wr += hist[hc - 1]
			} else if (nc > hc) {
				wl += hist[hc]
				wr -= hist[hc]
			}
			hc = nc
		}
		this._t = hc * (max - min) / count + min
		return x.map(v => v < hc ? 0 : 1)
	}
}

var dispBHT = function(elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			const mincount = +elm.select("[name=mincount]").property("value")
			const model = new BalancedHistogramThresholding(mincount)
			let y = model.predict(tx.flat(2))
			elm.select("[name=threshold]").text(model._t)
			pred_cb(y.map(v => specialCategory.density(1 - v)))
		}, 1);
	}

	elm.append("span")
		.text(" ignore min count ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "mincount")
		.attr("value", 100)
		.attr("min", 0)
		.attr("max", 10000)
		.on("change", fitModel)
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
	dispBHT(platform.setting.ml.configElement, platform);
}
