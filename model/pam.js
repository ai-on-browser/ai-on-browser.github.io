class PAM {
	// http://ibisforest.org/index.php?CLARANS
	constructor(k) {
		this._k = k
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((acc, v, i) => acc + (v - b[i]) ** 2, 0));
	}

	_argmin(arr) {
		let min_v = Infinity
		let min_i = -1
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] < min_v) {
				min_v = arr[i]
				min_i = i
			}
		}
		return min_i
	}

	_cost(centroids) {
		const c = centroids.map(v => this._x[v])
		const n = this._x.length
		let cost = 0;
		for (let i = 0; i < n; i++) {
			const category = this._argmin(c.map(v => this._distance(this._x[i], v)))
			cost += this._distance(this._x[i], c[category])
		}
		return cost
	}

	init(datas) {
		this._x = datas;
		const idx = []
		for (let i = 0; i < this._k; i++) {
			idx.push(Math.floor(Math.random() * (this._x.length - i)))
		}
		for (let i = this._k - 1; i >= 0; i--) {
			for (let j = this._k - 1; j > i; j--) {
				if (idx[i] <= idx[j]) {
					idx[j]++
				}
			}
		}
		this._centroids = idx
	}

	fit() {
		const n = this._x.length
		let init_cost = this._cost(this._centroids)
		let changed = false
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
				changed = true
			}
		}
		return changed
	}

	predict() {
		const c = this._centroids.map(v => this._x[v])
		return this._x.map(x => {
			return this._argmin(c.map(v => this._distance(x, v)))
		});
	}
}

class CLARA {
	// http://ibisforest.org/index.php?CLARANS
	constructor(k) {
		this._k = k
		this._sample_size = 40 + 2 * k
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((acc, v, i) => acc + (v - b[i]) ** 2, 0));
	}

	_argmin(arr) {
		let min_v = Infinity
		let min_i = -1
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] < min_v) {
				min_v = arr[i]
				min_i = i
			}
		}
		return min_i
	}

	_cost(centroids) {
		const c = centroids.map(v => this._x[v])
		const n = this._x.length
		let cost = 0;
		for (let i = 0; i < n; i++) {
			const category = this._argmin(c.map(v => this._distance(this._x[i], v)))
			cost += this._distance(this._x[i], c[category])
		}
		return cost
	}

	_sample_idx(n, k) {
		k = Math.min(n, k)
		const idx = []
		for (let i = 0; i < k; i++) {
			idx.push(Math.floor(Math.random() * (n - i)))
		}
		for (let i = k - 1; i >= 0; i--) {
			for (let j = k - 1; j > i; j--) {
				if (idx[i] <= idx[j]) {
					idx[j]++
				}
			}
		}
		return idx
	}

	init(datas) {
		this._x = datas;
		this._centroids = this._sample_idx(this._x.length, this._k)
	}

	fit() {
		const pam = new PAM(this._k)
		const sample = this._sample_idx(this._x.length, this._sample_size)
		pam.init(sample.map(i => this._x[i]))
		while (!pam.fit());
		const cur_cost = this._cost(this._centroids)
		const new_centroids = pam._centroids.map(i => sample[i])
		const new_cost = this._cost(new_centroids)
		if (new_cost < cur_cost) {
			this._centroids = new_centroids
		}
	}

	predict() {
		const c = this._centroids.map(v => this._x[v])
		return this._x.map(x => {
			return this._argmin(c.map(v => this._distance(x, v)))
		});
	}
}

var dispPAM = function(elm, platform) {
	let model = null

	const fitModel = (cb) => {
		platform.fit(
			(tx, ty, pred_cb) => {
				if (!model) {
					const type = elm.select("[name=type]").property("value")
					const clusters = +elm.select("[name=clusters]").property("value")
					if (type === "PAM") {
						model = new PAM(clusters)
					} else if (type === "CLARA") {
						model = new CLARA(clusters)
					}
					model.init(tx)
				}
				model.fit()
				const pred = model.predict();
				pred_cb(pred.map(v => v + 1))
				cb && cb()
			}
		);
	}

	elm.append("select")
		.attr("name", "type")
		.selectAll("option")
		.data(["PAM", "CLARA"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.append("span")
		.text(" clusters ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "clusters")
		.attr("min", 1)
		.attr("max", 1000)
		.attr("value", 10)
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		model = null
	}).step(fitModel).epoch()
	return () => {
		slbConf.stop()
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.terminate = dispPAM(platform.setting.ml.configElement, platform);
}
