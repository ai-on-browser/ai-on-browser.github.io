import { qt } from './smirnov_grubbs.js'

class GeneralizedESD {
	// https://www.itl.nist.gov/div898/handbook/eda/section3/eda35h3.htm
	constructor(alpha, r) {
		this._alpha = alpha
		this._r = r
	}

	predict(data) {
		const x = Matrix.fromArray(data);
		const oidx = []
		const r = []
		const n = x.rows
		for (let i = 1; i <= this._r; i++) {
			const y = x.copySub(x.mean(0))
			y.abs()
			y.div(x.std(0))
			const gs = y.max(1)
			const gidx = gs.argmax(0).value[0]
			r.push(gs.at(gidx, 0))

			x.removeRow(gidx)
			oidx.push(gidx)
		}

		for (let i = oidx.length - 1; i >= 0; i--) {
			for (let k = i + 1; k < oidx.length; k++) {
				if (oidx[i] <= oidx[k]) oidx[k]++
			}
		}

		for (let i = 1; i <= this._r; i++) {
			const p = this._alpha / (2 * (n - i + 1))
			const t = qt(n - i - 1, p)
			const gc = (n - i) * t / Math.sqrt((n - i - 1 + t ** 2) * (n - i + 1))
			if (r[i - 1] <= gc) {
				oidx.splice(i - 1, this._r)
				break
			}
		}

		const outliers = Array(n).fill(false)
		for (let i = 0; i < oidx.length; i++) {
			outliers[oidx[i]] = true
		}
		return outliers
	}
}

var dispGeneralizedESD = function(elm, platform) {
	const calcGeneralizedESD = function() {
		platform.plot((tx, ty, px, cb) => {
			const k = +elm.select(".buttons [name=k]").property("value")
			const alpha = +elm.select(".buttons [name=alpha]").property("value")
			const model = new GeneralizedESD(alpha, k)
			const outliers = model.predict(tx);
			cb(outliers)
		}, 3)
	}

	elm.select(".buttons")
		.append("span")
		.text(" k = ");
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "k")
		.attr("value", 5)
		.attr("min", 1)
		.attr("max", 100)
		.on("change", calcGeneralizedESD);
	elm.select(".buttons")
		.append("span")
		.text(" alpha = ");
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "alpha")
		.attr("value", 1)
		.attr("min", 0)
		.attr("max", 50)
		.on("change", calcGeneralizedESD);
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcGeneralizedESD);
}


var generalized_esd_init = function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Then, click "Calculate".');
	div.append("div").classed("buttons", true);
	dispGeneralizedESD(root, platform);
}

export default generalized_esd_init
