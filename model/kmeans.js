class KMeansModel {
	constructor(r, points) {
		this._r = r;
		this._points = points;
		this._centroids = [];
		this._lines = [];
		this._method = new KMeans();
		this._isLoop = false;
	}

	get centroids() {
		return this._centroids;
	}

	set method(m) {
		this._method = m;
		this.moveCentroids();
	}

	addCentroid() {
		if (this._centroids.length >= this._points.length) {
			return;
		}
		let cpoint = this._method.addCentroid(this);
		let dp = new DataPoint(this._r.select(".centroids"), cpoint.at, this._centroids.length + 1);
		dp.plotter(DataPointStarPlotter);
		this._centroids.push(dp);
	}

	clearCentroids() {
		this._lines.forEach(l => l.remove());
		this._lines = [];
		this._centroids.forEach(c => c.remove());
		this._centroids = [];
		this._points.forEach(p => p.category = 0);
	}

	loopStep(cb) {
		this._isLoop = true;
		(function stepLoop(kmns) {
			if (kmns._isLoop) {
				kmns.categorizePoints();
				kmns.moveCentroids();
				cb && cb();
				setTimeout(() => stepLoop(kmns), 1000);
			}
		})(this);
	}

	stopLoop() {
		this._isLoop = false;
	}

	categorizePoints() {
		if (this._centroids.length == 0) {
			return;
		}
		this._lines.forEach(l => l.remove());
		this._lines = [];
		this._points.forEach(value =>  {
			const nearp = argmin(this._centroids, v => value.distance(v) );
			this._lines.push(new DataLine(this._r.select(".cat_lines"), value, this._centroids[nearp]));
			value.category = this._centroids[nearp].category;
		});
	}

	moveCentroids() {
		if (this._centroids.length == 0 || this._points.length == 0) {
			return;
		}
		let isChanged = false;
		this._centroids.forEach(c => {
			let oldPoint = c.vector;
			this._method.moveCentroid(this, c);
			isChanged |= !oldPoint.equals(c.vector);
		});

		return isChanged;
	}
}

class KMeans {
	addCentroid(model) {
		while (true) {
			const p = model._points[randint(0, model._points.length - 1)];
			if (Math.min.apply(null, model._centroids.map(c => p.distance(c))) > 1) {
				return p;
			}
		}
	}

	moveCentroid(model, centroid) {
		let catpoints = model._points.filter(v => v.category == centroid.category);
		if (catpoints.length > 0) {
			centroid.move(DataPoint.mean(catpoints));
		}
	}
}

class KMeanspp {
	addCentroid(model) {
		if (model._centroids.length == 0) {
			return model._points[randint(0, model._points.length - 1)]
		}
		const d = model._points.map(p => Math.min.apply(null, model._centroids.map(c => p.distance(c))) ** 2);
		const s = d.reduce((acc, v) => acc + v, 0);
		let r = Math.random() * s;
		for (var i = 0; i < d.length; i++) {
			if (r < d[i]) {
				return model._points[i];
			}
			r -= d[i];
		}
	}

	moveCentroid(model, centroid) {
		let catpoints = model._points.filter(v => v.category == centroid.category);
		if (catpoints.length > 0) {
			centroid.move(DataPoint.mean(catpoints));
		}
	}
}

class KMedoids {
	addCentroid(model) {
		while (true) {
			const p = model._points[randint(0, model._points.length - 1)];
			if (Math.min.apply(null, model._centroids.map(c => p.distance(c))) > 1) {
				return p;
			}
		}
	}

	moveCentroid(model, centroid) {
		let catpoints = model._points.filter(v => v.category == centroid.category);
		if (catpoints.length > 0) {
			let i = argmin(catpoints, c => {
				return catpoints.map(cp => cp.distance(c)).reduce((acc, d) => acc + d, 0);
			});
			centroid.move(catpoints[i].at);
		}
	}
}

var dispKMeans = function(elm) {
	const svg = d3.select("svg");

	svg.append("g").attr("class", "cat_lines");
	svg.append("g").attr("class", "centroids");
	let kmns = new KMeansModel(svg, points);
	let isRunning = false;

	elm.select(".buttons")
		.append("select")
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
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Add centroid")
		.on("click", () => {
			kmns.addCentroid();
			kmns.categorizePoints();
			elm.select(".buttons [name=clusternumber]")
				.text(kmns.centroids.length + " clusters");
		});
	elm.select(".buttons")
		.append("span")
		.attr("name", "clusternumber")
		.style("padding", "0 10px")
		.text("0 clusters");
	const stepButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", () => {
			if (kmns.centroids.length == 0) {
				return;
			}
			kmns.categorizePoints();
			kmns.moveCentroids();
		});
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Run")
		.on("click", function() {
			isRunning = !isRunning;
			d3.select(this).attr("value", (isRunning) ? "Stop" : "Run");
			stepButton.property("disabled", isRunning);
			if (isRunning) {
				kmns.loopStep(() => kmns._points = points);
			} else {
				kmns.stopLoop();
			}
		});
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Clear centroid")
		.on("click", () => {
			kmns.clearCentroids();
			elm.select(".buttons [name=clusternumber]")
				.text(kmns.centroids.length + " clusters");
		});
	return () => {
		isRunning = false;
		kmns.stopLoop();
	}
}


var kmeans_init = function(root, terminateSetter) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, select "k-means" or "k-means++" or "k-medoids" and click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispKMeans(root);

	terminateSetter(() => {
		d3.selectAll("svg .centroids").remove();
		d3.selectAll("svg .cat_lines").remove();
		termCallback();
	});
}
