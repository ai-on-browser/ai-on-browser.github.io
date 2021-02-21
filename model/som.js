class SOM {
	// https://qiita.com/tohru-iwasaki/items/e51864269767ccc07254
	constructor(input_size, output_size, resolution = 20) {
		this.in_size = input_size;
		this.out_size = output_size;

		this.resolution = resolution;
		this._sigma0 = 1;

		this._init_method = 'PCA';

		this._epoch = 0;
		this._z = [];
		let z0 = Array(output_size).fill(0);
		do {
			this._z.push([].concat(z0));
			for (let i = output_size - 1; i >= 0; i--) {
				z0[i]++;
				if (z0[i] < this.resolution) break;
				z0[i] = 0;
			}
		} while (z0.reduce((a, v) => a + v, 0) > 0);
		this._y = null;
	}

	get _sigma() {
		return Math.max(this._sigma0 * (1 - this._epoch / 20), 0.2)
	}

	_z_distance(i, j) {
		let d = 0;
		for (let k = 0; k < this.out_size; k++) {
			d += (this._z[i][k] - this._z[j][k]) ** 2;
		}
		return d;
	}

	_find_near_idx(x) {
		const n = x.length;
		const dim = this.in_size;
		const near_idx = [];
		for (let i = 0; i < n; i++) {
			let min_d = Infinity;
			let min_idx = -1;
			for (let k = 0; k < this._y.length; k++) {
				let d = 0;
				for (let j = 0; j < dim; j++) {
					d += (x[i][j] - this._y[k][j]) ** 2
				}
				if (d < min_d) {
					min_d = d;
					min_idx = k;
				}
			}
			near_idx.push(min_idx);
		}
		return near_idx;
	}

	fit(data) {
		const x = data;
		const n = x.length;
		const dim = this.in_size;
		if (!this._y) {
			if (this._init_method === 'random') {
				this._y = Matrix.randn(this._z.length, dim).toArray();
			} else if (this._init_method === 'PCA') {
				const x0 = new Matrix(n, dim, data)
				const xd = x0.cov();
				const [l, pca] = xd.eigen();
				const sl = l.reduce((s, v) => s + v);
				const expl = new Matrix(1, l.length, l.map(v => Math.sqrt(v)));
				expl.repeat(this._z.length, 0)
				expl.mult(x0.slice(0, 0, this._z.length, l.length))
				this._y = expl.dot(pca.t).toArray()
			}
		}
		const near_idx = this._find_near_idx(x);

		const r = [];
		for (let i = 0; i < n; i++) {
			r[i] = [];
			const z = this._z[near_idx[i]];
			for (let k = 0; k < this._z.length; k++) {
				let d = this._z_distance(near_idx[i], k);
				r[i][k] = Math.exp(-d / (2 * this._sigma ** 2));
			}
		}

		for (let k = 0; k < this._y.length; k++) {
			let num = Array(dim).fill(0), den = 0;
			for (let i = 0; i < n; i++) {
				den += r[i][k]
				for (let j = 0; j < dim; j++) {
					num[j] += r[i][k] * x[i][j];
				}
			}
			for (let j = 0; j < dim; j++) {
				this._y[k][j] = num[j] / den;
			}
		}
		this._epoch++;
	}

	predict(x) {
		const near_idx = this._find_near_idx(x);
		return near_idx.map(i => this._z[i])
	}
}

var dispSOM = function(elm, platform) {
	const setting = platform.setting
	const svg = platform.svg;
	const mode = platform.task
	let model = null;
	svg.append("g").attr("class", "centroids");
	let centroids = [];

	let lock = false
	const fitModel = (cb) => {
		if (lock) return;
		lock = true;
		if (!model) {
			cb && cb();
			return
		}

		if (mode == "CT") {
			platform.plot(
				(tx, ty, px, pred_cb) => {
					model.fit(tx);
					const pred = model.predict(tx);
					const tilePred = model.predict(px);
					pred_cb(pred.map(v => v[0] + 1), tilePred.map(v => v[0] + 1));

					elm.select("[name=epoch]").text(model._epoch);
					centroids.forEach(c => c.remove());
					centroids = [];
					for (let i = 0; i < model._y.length; i++) {
						let dp = new DataPoint(svg.select(".centroids"), model._y[i].map(v => v * 1000), centroids.length + 1);
						dp.plotter(DataPointStarPlotter);
						centroids.push(dp);
					}
					lock = false;
					cb && cb();
				}, 4
			);
		} else {
			platform.plot(
				(tx, ty, px, pred_cb) => {
					model.fit(tx);
					const pred = model.predict(tx);

					pred_cb(pred);
					elm.select("[name=epoch]").text(model._epoch);
					lock = false;
					cb && cb();
				}
			);
		}
	}

	elm.append("select")
		.selectAll("option")
		.data([
			{
				"value": "batch"
			}
		])
		.enter()
		.append("option")
		.attr("value", d => d["value"])
		.text(d => d["value"]);

	if (mode != "DR") {
		elm.append("span")
			.text(" Size ");
		elm.append("input")
			.attr("type", "number")
			.attr("name", "resolution")
			.attr("value", 10)
			.attr("min", 1)
			.attr("max", 100)
			.property("required", true)
	} else {
		elm.append("span")
			.text(" Resolution ");
		elm.append("input")
			.attr("type", "number")
			.attr("name", "resolution")
			.attr("max", 100)
			.attr("min", 1)
			.attr("value", 20)
	}
	const initButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			platform.init()
			svg.selectAll(".centroids *").remove();
			elm.select("[name=epoch]").text(0);
			if (platform.datas.length == 0) {
				return;
			}
			const dim = setting.dimension || 1
			const resolution = +elm.select("[name=resolution]").property("value");

			model = new SOM(2, dim, resolution);
		});
	const fitButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
	let isRunning = false;
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Run")
		.on("click", function() {
			isRunning = !isRunning;
			d3.select(this).attr("value", (isRunning) ? "Stop" : "Run");
			fitButton.property("disabled", isRunning);
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

	return () => {
		isRunning = false;
		model = null;
		svg.selectAll(".centroids").remove();
	};
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.terminate = dispSOM(platform.setting.ml.configElement, platform)
}
