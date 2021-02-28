export class KMeansModel {
	constructor(method = null) {
		this._centroids = [];
		this._method = method || new KMeans();
	}

	get centroids() {
		return this._centroids;
	}

	get size() {
		return this._centroids.length;
	}

	get method() {
		return this._method;
	}

	set method(m) {
		this._method = m;
	}

	_distance(a, b) {
		let v = 0
		for (let i = a.length - 1; i >= 0; i--) {
			v += (a[i] - b[i]) ** 2
		}
		return Math.sqrt(v)
	}

	add(datas) {
		const cpoint = this._method.add(this._centroids, datas);
		this._centroids.push(cpoint);
		return cpoint;
	}

	clear() {
		this._centroids = [];
	}

	predict(datas) {
		if (this._centroids.length === 0) {
			return;
		}
		return datas.map(value => {
			return argmin(this._centroids, v => this._distance(value, v));
		});
	}

	fit(datas) {
		if (this._centroids.length === 0 || datas.length === 0) {
			return 0;
		}
		const oldCentroids = this._centroids;
		this._centroids = this._method.move(this, this._centroids, datas);
		const d = oldCentroids.reduce((s, c, i) => s + this._distance(c, this._centroids[i]), 0);
		return d;
	}
}

export class KMeans {
	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	add(centroids, datas) {
		while (true) {
			const p = datas[Math.floor(Math.random() * datas.length)]
			if (Math.min.apply(null, centroids.map(c => this._distance(p, c))) > 1.0e-8) {
				return p.concat();
			}
		}
	}

	_mean(d) {
		const n = d.length
		const t = d[0].length
		const m = Array(t).fill(0);
		for (let i = 0; i < n; i++) {
			for (let k = 0; k < t; k++) {
				m[k] += d[i][k]
			}
		}
		return m.map(v => v / n);
	}

	move(model, centroids, datas) {
		let pred = model.predict(datas);
		return centroids.map((c, k) => {
			let catpoints = datas.filter((v, i) => pred[i] === k);
			return this._mean(catpoints)
		});
	}
}

export class KMeanspp extends KMeans {
	add(centroids, datas) {
		if (centroids.length == 0) {
			return datas[Math.floor(Math.random() * datas.length)]
		}
		const d = datas.map(d => Math.min.apply(null, centroids.map(c => this._distance(d, c))) ** 2);
		const s = d.reduce((acc, v) => acc + v, 0);
		let r = Math.random() * s;
		for (var i = 0; i < d.length; i++) {
			if (r < d[i]) {
				return datas[i];
			}
			r -= d[i];
		}
	}
}

class KMedoids extends KMeans {
	move(model, centroids, datas) {
		let pred = model.predict(datas);
		return centroids.map((c, k) => {
			let catpoints = datas.filter((v, i) => pred[i] === k);
			if (catpoints.length > 0) {
				let i = argmin(catpoints, cp => {
					return catpoints.map(cq => this._distance(cq, cp)).reduce((acc, d) => acc + d, 0);
				});
				return catpoints[i];
			} else {
				return c;
			}
		});
	}
}

export class KMeansModelPlotterBase {
	constructor(r, datas) {
		this._r = r;
		this._datas = datas;
		this._datas.scale = 500;
		this._centroids = [];
		this._lines = [];
		this._model = null;
		this._isLoop = false;
		r.append("g").attr("class", "cat_lines").attr("opacity", 0.8);
		r.append("g").attr("class", "centroids");
	}

	terminate() {
		this._r.selectAll(".centroids").remove();
		this._r.selectAll(".cat_lines").remove();
	}

	fit() {
		this._model.fit(this._datas.x, 1);
		this._centroids.forEach(c => c.remove());
		this._centroids = this._model.centroids.map((c, i) => {
			const dp = new DataPoint(this._r.select(".centroids"), c.map(v => v / this._datas.scale), i + 1);
			dp.plotter(DataPointStarPlotter);
			return dp;
		});
	}

	clearCentroids() {
		this._lines.forEach(l => l.remove());
		this._lines = [];
		this._centroids.forEach(c => c.remove());
		this._centroids = [];
		this._model.clear();
	}

	categorizePoints() {
		const pred = this._model.predict(this._datas.x);
		this._lines.forEach(l => l.remove());
		this._lines = [];
		this._datas.forEach((value, i) =>  {
			this._lines.push(new DataLine(this._r.select(".cat_lines"), value.point, this._centroids[pred[i]]));
			value.y = this._centroids[pred[i]].category;
		});
	}
}

export class KMeansModelPlotter extends KMeansModelPlotterBase {
	constructor(r, datas) {
		super(r, datas)
		this._model = new KMeansModel();
		this._isLoop = false;
		this._datas.scale = 1;
		this._duration = 1000;
		r.append("g").attr("class", "cat_lines").attr("opacity", 0.8);
		r.append("g").attr("class", "centroids");
	}

	get method() {
		return this._model.method;
	}

	set method(m) {
		this._model.method = m;
		this.moveCentroids();
	}

	terminate() {
		this.stopLoop();
		super.terminate();
	}

	addCentroid() {
		if (this._model.size >= this._datas.length) {
			return;
		}
		let cpoint = this._model.add(this._datas.x);
		let dp = new DataPoint(this._r.select(".centroids"), cpoint, this._centroids.length + 1);
		dp.plotter(DataPointStarPlotter);
		this._centroids.push(dp);
	}

	startLoop(cb) {
		this._isLoop = true;
		(function stepLoop(kmns) {
			if (kmns._isLoop) {
				kmns.step(() => {
					cb && cb();
					stepLoop(kmns);
				})
			}
		})(this);
	}

	stopLoop() {
		this._isLoop = false;
	}

	step(cb) {
		this.moveCentroids();
		setTimeout(() => {
			this.categorizePoints();
			cb && cb();
		}, this._duration);
	}

	moveCentroids() {
		if (this._centroids.length == 0 || this._datas.length == 0) {
			return 0;
		}
		const d = this._model.fit(this._datas.x);
		this._centroids.forEach((c, i) => c.move(this._model._centroids[i], this._duration));

		return d;
	}
}

var dispKMeans = function(elm, platform) {
	const svg = platform.svg;

	const kmns = new KMeansModelPlotter(svg, platform.datas);
	let isRunning = false;

	elm.append("select")
		.on("change", function() {
			const slct = d3.select(this);
			slct.selectAll("option")
				.filter(d => d["value"] == slct.property("value"))
				.each(d => kmns.method = new d["class"]());
		})
		.selectAll("option")
		.data([
			{
				"value": "k-means",
				"class": KMeans
			},
			{
				"value": "k-means++",
				"class": KMeanspp
			},
			{
				"value": "k-medoids",
				"class": KMedoids
			}
		])
		.enter()
		.append("option")
		.attr("value", d => d["value"])
		.text(d => d["value"]);
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Add centroid")
		.on("click", () => {
			kmns.addCentroid();
			kmns.categorizePoints();
			elm.select("[name=clusternumber]")
				.text(kmns._model.size + " clusters");
		});
	elm.append("span")
		.attr("name", "clusternumber")
		.style("padding", "0 10px")
		.text("0 clusters");
	const stepButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", () => {
			if (kmns._model.size == 0) {
				return;
			}
			kmns.step();
		});
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Run")
		.on("click", function() {
			isRunning = !isRunning;
			d3.select(this).attr("value", (isRunning) ? "Stop" : "Run");
			stepButton.property("disabled", isRunning);
			if (isRunning) {
				kmns.startLoop(() => kmns._datas = platform.datas);
			} else {
				kmns.stopLoop();
			}
		});
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Skip")
		.on("click", () => {
			while (kmns.moveCentroids() > 1.0e-8);
			kmns.step()
		})
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Clear centroid")
		.on("click", () => {
			kmns.clearCentroids();
			elm.select("[name=clusternumber]")
				.text(kmns._model.size + " clusters");
		});
	return () => {
		isRunning = false;
		kmns.terminate();
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, select "k-means" or "k-means++" or "k-medoids" and click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.'
	platform.setting.terminate = dispKMeans(platform.setting.ml.configElement, platform)
	platform.setting.ml.detail = `
$ S_i $ as a set of datas in $ i $th cluster, the objective is to find
$$
  \\argmin_S \\sum_{i=1}^k \\sum_{x \\in S_i} \\| x - \\mu_i \\|^2
$$
where $ \\mu_i $ is the mean of points in $ S_i $.
<br>
The algorithm is simple.
<ol>
<li>Initialize $ \\mu_i $.</li>
<li>Assign the datas to the cluster $ S_i $ with the nearest mean $ \\mu_i $.</li>
<li>Update $ \\mu_i $.</li>
<li>Finish if $ \\mu_i $ does not change. Otherwise, go back to step 2.</li>
</ol>
`
}

