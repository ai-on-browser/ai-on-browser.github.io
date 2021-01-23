class NaiveBayes {
	// https://qiita.com/fujin/items/bd58fc7a93dc6e001045
	constructor() {
		this._k = 0;
		this._labels = [];
		this._rate = [];
	}

	fit(datas, labels) {
		if (Array.isArray(labels[0])) {
			labels = labels.map(v => v[0])
		}
		this._labels = [];
		this._rate = [];
		this._init();
		if (datas.length === 0) return;

		const sep_datas = [];
		for (let i = 0; i < labels.length; i++) {
			let k = 0;
			for (; k < this._labels.length; k++) {
				if (this._labels[k] === labels[i]) {
					break;
				}
			}
			if (k < this._labels.length) {
				this._rate[k]++;
				sep_datas[k].push(datas[i]);
			} else {
				this._labels.push(labels[i]);
				this._rate.push(1);
				sep_datas.push([datas[i]]);
			}
		}
		this._k = this._labels.length;
		for (let k = 0; k < this._k; k++) {
			const x = Matrix.fromArray(sep_datas[k]);
			this._estimate_prob(x, k);
			this._rate[k] /= datas.length;
		}
	}

	predict(data) {
		const x = Matrix.fromArray(data);
		const ps = []
		for (let i = 0; i < this._k; i++) {
			const p = this._data_prob(x, i);
			p.mult(this._rate[i]);
			ps.push(p);
		}
		return data.map((v, n) => {
			let max_p = 0;
			let max_c = -1;
			for (let i = 0; i < this._k; i++) {
				let v = ps[i].value[n];
				if (v > max_p) {
					max_p = v;
					max_c = i;
				}
			}
			return this._labels[max_c];
		})
	}
}

class GaussianNaiveBayes extends NaiveBayes {
	constructor() {
		super();
		this._means = [];
		this._vars = [];
	}

	_init() {
		this._means = [];
		this._vars = [];
	}

	_estimate_prob(x, cls) {
		this._means[cls] = x.mean(0);
		this._vars[cls] = x.cov();
	}

	_data_prob(x, cls) {
		const m = this._means[cls];
		const s = this._vars[cls];
		const xs = x.copySub(m);
		const d = Math.sqrt(2 * Math.PI) ** x.cols * Math.sqrt(s.det())
		let n = xs.dot(s.inv());
		n.mult(xs);
		n = n.sum(1);
		n.map(v => Math.exp(-0.5 * v) / d);
		return n;
	}
}

var dispNaiveBayes = function(elm, platform) {
	let model = new GaussianNaiveBayes();

	const calcBayes = (cb) => {
		platform.plot((tx, ty, px, pred_cb) => {
			model.fit(tx, ty);
			const categories = model.predict(px);
			pred_cb(categories)
			cb && cb()
		}, 3)
	}

	elm.append("span")
		.text("Distribution ");
	elm.append("select")
		.attr("name", "distribution")
		.on("change", calcBayes)
		.selectAll("option")
		.data(["gaussian"])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcBayes);
}

export default function(platform) {
	platform.setting.ml.description = 'Click and add data point. Then, click "Calculate".'
	dispNaiveBayes(platform.setting.ml.configElement, platform)
}
