class PAM {
	// http://ibisforest.org/index.php?CLARANS
	constructor(k) {
		this._k = k
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((acc, v, i) => acc + (v - b[i]) ** 2, 0));
	}

	_cost(centroids) {
		const c = centroids.map(v => this._x[v])
		const n = this._x.length
		let cost = 0;
		for (let i = 0; i < n; i++) {
			const category = argmin(c, v => this._distance(this._x[i], v))
			cost += this._distance(this._x[i], c[category])
		}
		return cost
	}

	init(datas) {
		this._x = datas;
		const idx = []
		for (let i = 0; i < this._x.length; idx.push(i++));
		shuffle(idx)
		this._centroids = idx.slice(0, this._k);
	}

	fit() {
		const n = this._x.length
		let init_cost = this._cost(this._centroids)
		for (let k = 0; k < this._k; k++) {
			let min_cost = Infinity;
			let min_idx = -1;
			for (let i = 0; i < n; i++) {
				if (this._centroids.some(c => c === i)) {
					continue
				}
				const new_c = this._centroids.concat()
				new_c[k] = i
				const new_cost = this._cost(new_c);
				if (new_cost < min_cost) {
					min_cost = new_cost
					min_idx = i
				}
			}
			if (min_cost < init_cost) {
				this._centroids[k] = min_idx
				init_cost = min_cost
			}
		}
	}

	predict() {
		const c = this._centroids.map(v => this._x[v])
		return this._x.map(x => {
			return argmin(c, v => this._distance(x, v));
		});
	}
}

var dispPAM = function(elm, platform) {
	let model = null
	let epoch = 0

	const fitModel = (cb) => {
		platform.plot(
			(tx, ty, px, pred_cb) => {
				if (!model) {
					const clusters = +elm.select("[name=clusters]").property("value")
					model = new PAM(clusters)
					model.init(tx)
				}
				model.fit()
				const pred = model.predict();
				pred_cb(pred.map(v => v + 1))
				epoch++;
				elm.select("[name=epoch]").text(epoch)
				cb && cb()
			}, 4
		);
	}

	elm.append("span")
		.text(" clusters ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "clusters")
		.attr("min", 1)
		.attr("max", 1000)
		.attr("value", 10)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			model = null
			elm.select("[name=epoch]").text(epoch = 0)
		})
	const fitButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel)
	let isRunning = false
	const runButton = elm.append("input")
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
					fitButton.property("disabled", isRunning);
					runButton.property("disabled", false);
				})();
			}
		});
	elm.append("span")
		.text(" Epoch: ");
	elm.append("span")
		.attr("name", "epoch");
	return () => {
		isRunning = false
	}
}

export default function(platform) {
	platform.setting.ml.description = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.terminate = dispPAM(platform.setting.ml.configElement, platform);
}
