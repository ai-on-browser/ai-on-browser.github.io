class AffinityPropagation {
	// https://qiita.com/daiki_yosky/items/98ce56e37623c369cc60
	// https://tjo.hatenablog.com/entry/2014/07/31/190218
	constructor() {
		this._epoch = 0;
	}

	get epoch() {
		return this._epoch
	}

	init(datas) {
		this._x = datas;
		const n = datas.length;
		this._r = new Matrix(n, n);
		this._a = Matrix.ones(n, n);
		this._epoch = 0;

		this._l = new Matrix(n, n);
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < i; j++) {
				const d = this._x[i].reduce((s, v, k) => s + (v - this._x[j][k]) ** 2, 0)
				//const v = Math.exp(-d / (1 ** 2))
				const v = -Math.sqrt(d)
				this._l.set(i, j, v);
				this._l.set(j, i, v);
			}
		}
		const dg = this._l.sum(1).value;
		for (let i = 0; i < n; i++) {
			this._l.set(i, i, dg[i] / n);
		}
	}

	fit() {
		const x = this._x;
		const n = x.length;
		const l = new Matrix(n, n);

		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				let s = 0;
				for (let k = 0; k < n; k++) {
					if (k === j) continue
					s += this._a.at(i, k) * this._l.at(i, k);
				}
				this._r.set(i, j, this._l.at(i, j) / s);
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
		this._epoch++;
	}

	predict() {
		const c = [];
		const n = this._r.rows;
		for (let i = 0; i < n; i++) {
			let max_v = -Infinity;
			let max_i = -1;
			for (let j = 0; j < n; j++) {
				const v = this._r.at(i, j) + this._a.at(i, j);
				if (max_v < v) {
					max_v = v;
					max_i = j;
				}
			}
			c.push(max_i);
		}
		return c;
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
				cb && cb()
			}
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
