import { histogram } from './histogram.js'

class MutualInformationFeatureSelection {
	// https://qiita.com/shimopino/items/5fee7504c7acf044a521
	// https://qiita.com/hyt-sasaki/items/ffaab049e46f800f7cbf
	constructor() {
	}

	_mutual_information(a, b) {
		const bins = 40
		const ha = histogram(a, { count: bins })
		const hb = histogram(b, { count: bins })
		const hab = histogram(a.map((v, i) => [v[0], b[i][0]]), { count: bins })
		const na = a.length, nb = b.length
		let v = 0
		for (let i = 0; i < ha.length; i++) {
			for (let j = 0; j < hb.length; j++) {
				if (hab[i][j] > 0 && ha[i] > 0 && hb[j] > 0) {
					const pab = hab[i][j] / na
					const pa = ha[i] / na
					const pb = hb[j] / nb
					v += Math.log(pab / (pa * pb))
				}
			}
		}
		return v / na
	}

	fit(x, y) {
		const imp = []
		for (let i = 0; i < x[0].length; i++) {
			const a = x.map(v => [v[i]])
			imp.push(this._mutual_information(a, y))
		}
		this._importance = imp.map((v, i) => [v, i])
		this._importance.sort((a, b) => b[0] - a[0])
	}

	predict(x, k) {
		const impidx = this._importance.slice(0, k).map(im => im[1])
		return x.map(d => impidx.map(i => d[i]))
	}
}

var dispMI = function(elm, setting, platform) {
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => {
			platform.plot(
				(tx, ty, px, pred_cb) => {
					const dim = setting.dimension;
					const model = new MutualInformationFeatureSelection()
					model.fit(tx, ty)
					let y = model.predict(tx, dim)
					pred_cb(Matrix.fromArray(y).value);
				}
			);
		});
}

export default function(platform) {
	const root = platform.setting.ml.configElement
	const setting = platform.setting
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispMI(root, setting, platform);
}

