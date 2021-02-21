class CLARANS {
	// http://ibisforest.org/index.php?CLARANS
	constructor(k) {
		this._k = k
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((acc, v, i) => acc + (v - b[i]) ** 2, 0));
	}

	_cost(categories) {
		const n = this._x.length
		const centroids = []
		const count = []
		for (let i = 0; i < n; i++) {
			const cat = categories[i]
			if (!centroids[cat]) {
				centroids[cat] = this._x[i].concat()
				count[cat] = 1
			} else {
				for (let k = 0; k < this._x[i].length; k++) {
					centroids[cat][k] += this._x[i][k]
				}
				count[cat]++
			}
		}
		for (let i = 0; i < centroids.length; i++) {
			for (let k = 0; k < centroids[i].length; k++) {
				centroids[i][k] /= count[i]
			}
		}
		let cost = 0;
		for (let i = 0; i < n; i++) {
			cost += this._distance(this._x[i], centroids[categories[i]])
		}
		return cost;
	}

	init(datas) {
		this._x = datas;
		this._categories = [];
		for (let i = 0; i < this._x.length; i++) {
			this._categories[i] = Math.floor(Math.random() * this._k);
		}
	}

	fit(numlocal, maxneighbor) {
		const n = this._x.length
		const categories = this._categories;
		let i = 1;
		let mincost = Infinity
		while (i <= numlocal) {
			let j = 1
			let cur_cost = this._cost(categories)
			while (j <= maxneighbor) {
				const swap = Math.floor(Math.random() * n)
				const cur_cat = categories[swap]
				const new_cat = Math.floor(Math.random() * (this._k - 1));
				categories[swap] = (new_cat >= cur_cat) ? new_cat + 1 : new_cat;
				const new_cost = this._cost(categories)
				if (new_cost < cur_cost) {
					j = 1;
					cur_cost = new_cost
					continue
				}
				j++
				categories[swap] = cur_cat
			}
			if (cur_cost < mincost) {
				mincost = cur_cost
			}
			i++
		}
	}

	predict() {
		return this._categories
	}
}

var dispCLARANS = function(elm, platform) {
	let model = null
	let epoch = 0

	const fitModel = (cb) => {
		platform.plot(
			(tx, ty, px, pred_cb) => {
				if (!model) {
					const clusters = +elm.select("[name=clusters]").property("value")
					model = new CLARANS(clusters)
					model.init(tx)
				}
				const maxneighbor = +elm.select("[name=maxneighbor]").property("value")
				model.fit(1, maxneighbor)
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
	elm.append("span")
		.text(" maxneighbor ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "maxneighbor")
		.attr("min", 1)
		.attr("max", 1000)
		.attr("value", 100)
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
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.terminate = dispCLARANS(platform.setting.ml.configElement, platform);
}
