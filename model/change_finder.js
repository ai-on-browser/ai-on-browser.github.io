import { SDAR } from './sdar.js'

class ChangeFinder {
	// 商用利用については要確認
	// http://www.viewcom.or.jp/wp-content/uploads/2018/04/beb9489f9fe1a5e1c81ed8e6c292c942.pdf
	// https://shino-tec.com/2020/02/01/changefinder/
	// https://github.com/shunsukeaihara/changefinder
	constructor(p = 1, r = 0.5, smooth = 10) {
		this._p = p
		this._r = r
		this._smooth = smooth
		this._t = 2
	}

	_smoothing(x, w) {
		const s = []
		for (let i = 0; i < x.length; i++) {
			let v = 0;
			const c = Math.min(i + 1, w)
			for (let k = i; k > i - c; k--) {
				v += x[k]
			}
			s.push(v / c)
		}
		return s
	}

	fit(datas) {
		const model1 = new SDAR(this._p, this._r)
		const score1 = model1.probability(datas).map(v => -Math.log(v))
		const sscore1 = this._smoothing(score1, this._smooth)

		const model2 = new SDAR(this._p, this._r)
		const score2 = model2.probability(sscore1).map(v => -Math.log(v))
		const sscore2 = this._smoothing(score2, this._smooth * this._t)
		this._score = sscore2
	}

	predict() {
		return this._score
	}
}

var dispChangeFinder = function(elm, platform) {
	let model = null

	const fitModel = (doFit = true) => {
		const method = +elm.select(".buttons [name=method]").property("value")
		const p = +elm.select(".buttons [name=p]").property("value")
		const r = +elm.select(".buttons [name=r]").property("value")
		const smooth = +elm.select(".buttons [name=smooth]").property("value")
		const threshold = +elm.select(".buttons [name=threshold]").property("value")
		platform.plot((tx, ty, px, pred_cb) => {
			if (!model || doFit) {
				model = new ChangeFinder(p, r, smooth);
				tx = tx.map(v => v[0])
				model.fit(tx)
			}
			const pred = model.predict()
			pred_cb(pred, threshold)
		})
	}

	elm.select(".buttons")
		.append("select")
		.attr("name", "method")
		.selectAll("option")
		.data([
			"sdar"
		])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
	elm.select(".buttons")
		.append("span")
		.text("p")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "p")
		.attr("min", 1)
		.attr("max", 1000)
		.attr("value", 2)
	elm.select(".buttons")
		.append("span")
		.text("r")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "r")
		.attr("min", 0)
		.attr("max", 1)
		.attr("value", 0.5)
		.attr("step", 0.1)
	elm.select(".buttons")
		.append("span")
		.text("smooth")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "smooth")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 10)
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel);
	elm.select(".buttons")
		.append("span")
		.text(" threshold = ");
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "threshold")
		.attr("value", 0.8)
		.attr("min", 0)
		.attr("max", 100)
		.attr("step", 0.1)
		.on("change", () => {
			fitModel(false)
		})
}


var change_finder_init = function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Click "fit" to update.');
	div.append("div").classed("buttons", true);
	dispChangeFinder(root, platform);
}

export default change_finder_init
