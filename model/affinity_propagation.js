class AffinityPropagation {
	// https://qiita.com/daiki_yosky/items/98ce56e37623c369cc60
	// https://tjo.hatenablog.com/entry/2014/07/31/190218
	constructor() {
		this._epoch = 0;
		this._l = 0.8;

		this._x = [];
		this._y = null;
	}

	get centroidCategories() {
		const y = this.predict();
		return [...new Set(y)]
	}

	get centroids() {
		return this.centroidCategories.map(i => this._x[i]);
	}

	get size() {
		const y = this.predict();
		return new Set(y).size
	}

	get epoch() {
		return this._epoch
	}

	init(datas) {
		this._x = datas;
		const n = datas.length;
		this._r = Array(n);
		this._a = Array(n);
		this._ar = Array(n);
		this._s = Array(n);
		this._as = Array(n);
		for (let i = 0; i < n; i++) {
			this._r[i] = Array(n).fill(0)
			this._a[i] = Array(n).fill(0)
			this._ar[i] = Array(n).fill(0)
			this._s[i] = Array(n)
			this._as[i] = Array(n)
		}
		this._y = null;
		this._epoch = 0;

		let min = Infinity
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < i; j++) {
				if (i === j) continue
				const d = -this._x[i].reduce((s, v, k) => s + (v - this._x[j][k]) ** 2, 0)
				this._s[i][j] = this._s[j][i] = d;
				this._as[i][j] = this._as[j][i] = d;
				min = Math.min(min, d)
			}
		}
		for (let i = 0; i < n; i++) {
			this._s[i][i] = this._as[i][i] = min;
		}
	}

	fit() {
		// Frey. et al. "Clustering by Passing Messages Between Data Points" (2007)
		// "Fast Algorithm for Affinity Propagation"
		const x = this._x;
		const n = x.length;
		const l = this._l

		for (let i = 0; i < n; i++) {
			for (let k = 0; k < n; k++) {
				let m = -Infinity
				const ss = (i === k) ? this._s[i] : this._as[i];
				for (let kd = 0; kd < n; kd++) {
					if (k === kd) continue
					m = Math.max(m, ss[kd])
				}
				this._r[i][k] = l * this._r[i][k] + (1 - l) * (this._s[i][k] - m)
			}
		}

		for (let i = 0; i < n; i++) {
			for (let k = 0; k < n; k++) {
				let s = (i === k) ? 0 : this._r[k][k];
				for (let id = 0; id < n; id++) {
					if (id !== i && id !== k) {
						s += Math.max(0, this._r[id][k])
					}
				}
				if (i !== k) s = Math.min(0, s)
				const aik = l * this._a[i][k] + (1 - l) * s;
				this._a[i][k] = aik;
				this._ar[i][k] = aik + this._r[i][k];
				this._as[i][k] = aik + this._s[i][k];
			}
		}

		this._y = null;
		this._epoch++;
	}

	__fit() {
		// Frey. et al. "Mixture Modeling by Affinity Propagation" (2006)
		const x = this._x;
		const n = x.length;

		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				let s = 0;
				for (let k = 0; k < n; k++) {
					if (k === j) continue
					s += this._a[i][k] * this._s[i][k];
				}
				this._r[i][j] = this._s[i][j] / s
			}
		}

		for (let i = 0; i < n; i++) {
			let p = 1;
			for (let k = 0; k < n; k++) {
				if (k === i) continue
				p *= (1 + this._r[k][i]);
			}
			this._a[i][i] = p - 1
			this._ar[i][i] = this._a[i][i] + this._r[i][i]

			for (let j = 0; j < n; j++) {
				if (i === j) continue;
				p = 1 / this._r[i][i] - 1;
				for (let k = 0; k < n; k++) {
					if (k === i || k === j) continue
					p *= 1 / (1 + this._r[k][i])
				}
				this._a[i][j] = 1 / (1 + p)
				this._ar[i][j] = this._a[i][j] + this._r[i][j]
			}
		}
		this._y = null;
		this._epoch++;
	}

	predict() {
		if (!this._y) {
			this._y = [];
			const n = this._x.length;
			for (let i = 0; i < n; i++) {
				let max_v = -Infinity;
				let max_i = -1;
				for (let j = 0; j < n; j++) {
					const v = this._ar[i][j];
					if (max_v < v) {
						max_v = v;
						max_i = j;
					}
				}
				this._y.push(max_i);
			}
		}
		return this._y;
	}
}

var dispAffinityPropagation = function(elm, platform) {
	const svg = platform.svg;
	svg.append("g").attr("class", "centroids");
	let model = null
	let centroids = [];

	const fitModel = (cb) => {
		platform.plot(
			(tx, ty, px, pred_cb) => {
				if (!model) {
					model = new AffinityPropagation();
					model.init(tx);
				}
				model.fit()
				const pred = model.predict();
				pred_cb(pred.map(v => v + 1))
				elm.select("[name=epoch]").text(model.epoch);
				elm.select("[name=clusters]").text(model.size);
				centroids.forEach(c => c.remove())
				const cc = model.centroidCategories
				centroids = model.centroids.map((c, i) => {
					let dp = new DataPoint(svg.select(".centroids"), tx[cc[i]].map(v => v * 1000), cc[i] + 1);
					dp.plotter(DataPointStarPlotter);
					return dp;
				})
				cb && cb()
			}, 4
		);
	}

	elm.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			model = null
			elm.select("[name=epoch]").text(0);
			elm.select("[name=clusters]").text(0);
		})
	const stepButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", () => {
			fitModel()
		});
	let isRunning = false;
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Run")
		.on("click", function() {
			isRunning = !isRunning;
			d3.select(this).attr("value", (isRunning) ? "Stop" : "Run");
			stepButton.property("disabled", isRunning);
			if (isRunning) {
				(function stepLoop() {
					if (isRunning) {
						fitModel(() => setTimeout(stepLoop, 0));
					}
				})();
			}
		});
	elm.append("span")
		.text(" Epoch: ");
	elm.append("span")
		.attr("name", "epoch");
	elm.append("span")
		.text(" Clusters: ");
	elm.append("span")
		.attr("name", "clusters");
	return () => {
		isRunning = false;
		svg.selectAll(".centroids").remove();
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	platform.setting.terminate = dispAffinityPropagation(platform.setting.ml.configElement, platform)
}

