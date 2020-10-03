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
					const clusters = +elm.select(".buttons [name=clusters]").property("value")
					model = new CLARANS(clusters)
					model.init(tx)
				}
				const maxneighbor = +elm.select(".buttons [name=maxneighbor]").property("value")
				model.fit(1, maxneighbor)
				const pred = model.predict();
				pred_cb(pred.map(v => v + 1))
				epoch++;
				elm.select(".buttons [name=epoch]").text(epoch)
				cb && cb()
			}, 4
		);
	}

	elm.select(".buttons")
		.append("span")
		.text(" clusters ")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "clusters")
		.attr("min", 1)
		.attr("max", 1000)
		.attr("value", 10)
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			model = null
			elm.select(".buttons [name=epoch]").text(epoch = 0)
		})
	elm.select(".buttons")
		.append("span")
		.text(" maxneighbor ")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "maxneighbor")
		.attr("min", 1)
		.attr("max", 1000)
		.attr("value", 100)
	const fitButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel)
	let isRunning = false
	const runButton = elm.select(".buttons")
		.append("input")
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
	elm.select(".buttons")
		.append("span")
		.text(" Epoch: ");
	elm.select(".buttons")
		.append("span")
		.attr("name", "epoch");
	return () => {
		isRunning = false
	}
}


var clarans_init = function(platform) {
	const root = platform.setting.ml.configElement
	const setting = platform.setting
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Then, click "Fit" button.');
	div.append("div").classed("buttons", true);
	let termCallback = dispCLARANS(root, platform);

	setting.terminate = termCallback;
}

export default clarans_init

