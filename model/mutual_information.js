import { Histogram } from './histogram.js'

class MutualInformationFeatureSelection {
	// https://qiita.com/shimopino/items/5fee7504c7acf044a521
	// https://qiita.com/hyt-sasaki/items/ffaab049e46f800f7cbf
	constructor() {
	}

	_mutual_information(a, b) {
		const bins = 40
		const histogram = new Histogram({ count: bins })
		const ha = histogram.fit(a)
		const hb = histogram.fit(b)
		const hab = histogram.fit(a.map((v, i) => [v[0], b[i][0]]))
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

var dispMI = function(elm, platform) {
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => {
			platform.fit(
				(tx, ty, pred_cb) => {
					const dim = platform.dimension;
					const model = new MutualInformationFeatureSelection()
					model.fit(tx, ty)
					let y = model.predict(tx, dim)
					pred_cb(y);
				}
			);
		});
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispMI(platform.setting.ml.configElement, platform)
}
