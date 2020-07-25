class AffinityPropagation {
	// https://qiita.com/daiki_yosky/items/98ce56e37623c369cc60
	// https://tjo.hatenablog.com/entry/2014/07/31/190218
	constructor() {
		this._epoch = 0;
		this._l = 0.8;

		this._x = [];
	}

	get centroids() {
		const y = this.predict();
		const c = [...new Set(y)]
		return c.map(i => this._x[i]);
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
		this._r = Matrix.zeros(n, n);
		this._a = Matrix.zeros(n, n);
		this._ar = Matrix.zeros(n, n);
		this._epoch = 0;

		this._s = Matrix.zeros(n, n);
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < i; j++) {
				if (i === j) continue
				const d = this._x[i].reduce((s, v, k) => s + (v - this._x[j][k]) ** 2, 0)
				const v = -d
				this._s.set(i, j, v);
				this._s.set(j, i, v);
			}
		}
		const dg = this._s.min();
		for (let i = 0; i < n; i++) {
			this._s.set(i, i, dg);
		}
	}

	fit() {
		// Frey. et al. "Clustering by Passing Messages Between Data Points" (2007)
		// "Fast Algorithm for Affinity Propagation"
		const x = this._x;
		const n = x.length;

		const as = this._a.copyAdd(this._s);
		this._r.mult(this._l);
		for (let i = 0; i < n; i++) {
			for (let k = 0; k < n; k++) {
				let m = -Infinity
				const ss = (i === k) ? this._s : as;
				for (let kd = 0; kd < n; kd++) {
					if (k === kd) continue
					m = Math.max(m, ss.at(i, kd))
				}
				this._r.addAt(i, k, (1 - this._l) * (this._s.at(i, k) - m));
			}
		}

		this._a.mult(this._l)
		for (let i = 0; i < n; i++) {
			for (let k = 0; k < n; k++) {
				let s = (i === k) ? 0 : this._r.at(k, k);
				for (let id = 0; id < n; id++) {
					if (id !== i && id !== k) {
						s += Math.max(0, this._r.at(id, k))
					}
				}
				if (i !== k) s = Math.min(0, s)
				this._a.addAt(i, k, (1 - this._l) * s);
			}
		}

		this._ar = this._a.copyAdd(this._r);
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
					s += this._a.at(i, k) * this._s.at(i, k);
				}
				this._r.set(i, j, this._s.at(i, j) / s);
			}
		}

		for (let i = 0; i < n; i++) {
			let p = 1;
			for (let k = 0; k < n; k++) {
				if (k === i) continue
				p *= (1 + this._r.at(k, i));
			}
			this._a.set(i, i, p - 1);

			for (let j = 0; j < n; j++) {
				if (i === j) continue;
				p = 1 / this._r.at(i, i) - 1;
				for (let k = 0; k < n; k++) {
					if (k === i || k === j) continue
					p *= 1 / (1 + this._r.at(k, i))
				}
				this._a.set(i, j, 1 / (1 + p));
			}
		}
		this._ar = this._a.copyAdd(this._r);
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
					const v = this._ar.at(i, j);
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

var dispAffinityPropagation = function(elm) {
	const svg = d3.select("svg");
	let model = null

	const fitModel = (cb) => {
		FittingMode.CT.fit(svg, points, 4,
			(tx, ty, px, pred_cb) => {
				if (!model) {
					model = new AffinityPropagation();
					model.init(tx);
				}
				model.fit()
				const pred = model.predict();
				pred_cb(pred.map(v => v + 1))
				elm.select(".buttons [name=epoch]").text(model.epoch);
				elm.select(".buttons [name=clusters]").text(model.size);
				cb && cb()
			},
		);
	}

	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			model = null
			elm.select(".buttons [name=epoch]").text(0);
		})
	const stepButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", () => {
			fitModel()
		});
	let isRunning = false;
	elm.select(".buttons")
		.append("input")
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
	elm.select(".buttons")
		.append("span")
		.text(" Epoch: ");
	elm.select(".buttons")
		.append("span")
		.attr("name", "epoch");
	elm.select(".buttons")
		.append("span")
		.text(" Clusters: ");
	elm.select(".buttons")
		.append("span")
		.attr("name", "clusters");
	return () => {
		isRunning = false;
	}
}


var affinity_propagation_init = function(root, mode, setting) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Then, click "Step" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispAffinityPropagation(root);

	setting.setTerminate(() => {
		termCallback();
	});
}
