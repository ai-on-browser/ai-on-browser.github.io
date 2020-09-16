class KernelDensityEstimator {
	// https://ja.wikipedia.org/wiki/%E3%82%AB%E3%83%BC%E3%83%8D%E3%83%AB%E5%AF%86%E5%BA%A6%E6%8E%A8%E5%AE%9A
	// http://ibis.t.u-tokyo.ac.jp/suzuki/lecture/2015/dataanalysis/L9.pdf
	constructor(kernel = 'gaussian') {
		this._h = 0
		switch (kernel) {
		case 'gaussian':
			this._kernel = (x) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
			break;
		case 'rectangular':
			this._kernel = (x) => Math.abs(x) <= 1 ? 0.5 : 0;
			break;
		case 'triangular':
			this._kernel = (x) => Math.abs(x) <= 1 ? 1 - Math.abs(x) : 0;
			break;
		case 'epanechnikov':
			this._kernel = (x) => Math.abs(x) <= 1 ? 3 * (1 - x ** 2) / 4 : 0;
			break;
		}
	}

	fit(x) {
		this._x = x;

		// Silverman's method
		const n = x.length;
		const k = x.map(d => Math.sqrt(d.reduce((s, v) => s + v ** 2, 0)));
		const mean = k.reduce((s, v) => s + v, 0) / n;
		const std = Math.sqrt(k.reduce((s, v) => s + (v - mean) ** 2, 0) / n)
		k.sort((a, b) => a - b);
		const q = (p) => {
			const np = n * p;
			const np_l = Math.floor(np);
			const np_h = Math.ceil(np);
			return k[np_l] + (np_h - np_l) * (k[np_l] - k[np_h])
		}
		const sgm = Math.min(std, (q(0.75) - q(0.25)) / 1.34)

		this._h = 1.06 * sgm / Math.pow(n, 0.2)
	}

	predict(x) {
		const n = this._x.length
		return x.map(d => {
			let s = 0;
			for (let i = 0; i < n; i++) {
				s += this._kernel(Math.sqrt(d.reduce((a, v, j) => a + (v - this._x[i][j]) ** 2, 0)) / this._h)
			}
			return s / (n * this._h);
		})
	}
}

var dispKernelDensityEstimator = function(elm, platform) {
	const fitModel = (cb) => {
		platform.plot(
			(tx, ty, px, pred_cb) => {
				const kernel = elm.select(".buttons [name=kernel]").property("value")
				const model = new KernelDensityEstimator(kernel);
				model.fit(tx);

				const pred = model.predict(px)
				const min = Math.min(...pred);
				const max = Math.max(...pred);
				pred_cb(pred.map(v => specialCategory.density((v - min) / (max - min))))
			}, 8
		);
	};

	elm.select(".buttons")
		.append("select")
		.attr("name", "kernel")
		.selectAll("option")
		.data([
			"gaussian",
			"rectangular",
			"triangular",
			"epanechnikov"
		])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}

var kernel_density_estimator_init = function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispKernelDensityEstimator(root, platform);
}

export default kernel_density_estimator_init

