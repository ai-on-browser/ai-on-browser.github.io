class SpectralClustering {
	// https://mr-r-i-c-e.hatenadiary.org/entry/20121214/1355499195
	constructor(datas, k, readycb) {
		this._k = k;
		this._epoch = 0;
		this._clustering = new KMeansModel();
		this._clustering.method = new KMeanspp();

		this._l = new Matrix(datas.length, datas.length);

		this._n = datas.length;
		let d = [];
		datas.forEach((a, i) => {
			let s = 0;
			datas.forEach((b, j) => {
				if (i == j) return;
				let d = a.reduce((acc, v, t) => acc + (v - b[t]) ** 2, 0);
				d = 1 / Math.sqrt(d);
				if (d < 1.0e-3) d = 0;
				this._l.set(i, j, -d);
				s += d;
			});
			this._l.set(i, i, s);
			d.push(Math.sqrt(s));
		});
		for (let i = 0; i < this._n; i++) {
			for (let j = 0; j < this._n; j++) {
				this._l.set(i, j, this._l.at(i, j) / (d[i] * d[j]));
			}
		}

		this.ready = false
		this._l.eigenVectors(data => {
			this._ev = data;
			this.ready = true;
			readycb && readycb();
		});
	}

	get size() {
		return this._k;
	}

	get epoch() {
		return this._epoch;
	}

	add() {
		this._k++;
		this._clustering.clear();
		const s_ev = this._ev.select(null, this._n - this._k, null, this._n);
		this._s_ev = s_ev.toArray();
		//for (let i = 0; i < s_ev.length; i += this._k) {
		//	this._s_ev.push(s_ev.slice(i, i + this._k));
		//}
		for (let i = 0; i < this._k; i++) {
			this._clustering.add(this._s_ev);
		}
	}

	clear() {
		this._k = 0;
		this._epoch = 0;
		this._clustering.clear();
	}

	predict(datas) {
		return this._clustering.predict(this._s_ev);
	}

	fit(datas) {
		this._epoch++;
		return this._clustering.fit(this._s_ev);
	}
}

class SpectralClusteringPlotter {
	constructor(r, points, cb) {
		this._r = r;
		this._points = points;
		this._model = new SpectralClustering(points.map(p => p.at), 0, cb);
		this._isLoop = false;
	}

	set method(m) {
		this._model.method = m;
		this.moveCentroids();
	}

	addCentroid() {
		if (this._model.size >= this._points.length) {
			return;
		}
		let cpoint = this._model.add(this._points.map(p => p.at));
	}

	clearCentroids() {
		this._model.clear();
	}

	loopStep(cb) {
		this._isLoop = true;
		(function stepLoop(scp) {
			if (scp._isLoop) {
				scp.categorizePoints();
				scp.moveCentroids();
				cb && cb();
				setTimeout(() => stepLoop(scp), 100);
			}
		})(this);
	}

	stopLoop() {
		this._isLoop = false;
	}

	categorizePoints() {
		let pred = this._model.predict(this._points.map(p => p.at));
		this._points.forEach((value, i) =>  {
			value.category = pred[i] + 1;
		});
	}

	moveCentroids() {
		this._model.fit(this._points.map(p => p.at));
	}
}

var dispSpectral = function(elm) {
	const svg = d3.select("svg");

	svg.append("g").attr("class", "cat_lines");
	svg.append("g").attr("class", "centroids");
	let scp = null
	let isRunning = false;

	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("name", "initialize")
		.attr("value", "Initialize")
		.on("click", () => {
			scp = new SpectralClusteringPlotter(svg, points, () => {
				elm.selectAll(".buttons input").attr("disabled", null);
			});
			elm.select(".buttons [name=clusternumber]")
				.text(scp._model.size);
			elm.select(".buttons [name=epoch]").text("0");
			elm.selectAll(".buttons input").attr("disabled", true)
		});
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Add cluster")
		.on("click", () => {
			scp.addCentroid();
			scp.categorizePoints();
			elm.select(".buttons [name=clusternumber]")
				.text(scp._model.size);
		});
	elm.select(".buttons")
		.append("span")
		.attr("name", "clusternumber")
		.text("0");
	elm.select(".buttons")
		.append("span")
		.text(" clusters");
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Clear cluster")
		.on("click", () => {
			scp.clearCentroids();
			elm.select(".buttons [name=clusternumber]").text("0");
			elm.select(".buttons [name=epoch]").text("0");
		});
	const stepButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", () => {
			if (scp._model.size == 0) {
				return;
			}
			scp.categorizePoints();
			scp.moveCentroids();
			elm.select(".buttons [name=epoch]").text(scp._model.epoch);
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
				scp.loopStep(() => {
					scp._points = points
					elm.select(".buttons [name=epoch]").text(scp._model.epoch);
				});
			} else {
				scp.stopLoop();
			}
		});
	elm.select(".buttons")
		.append("span")
		.text(" Epoch: ");
	elm.select(".buttons")
		.append("span")
		.attr("name", "epoch")
		.text("0");
	elm.selectAll(".buttons input:not([name=initialize])").attr("disabled", true)
	return () => {
		isRunning = false;
		if (scp) scp.stopLoop();
	}
}


var spectral_init = function(root, mode, setting) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Initialize". Then, click "Add cluster". Finally, click "Step" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispSpectral(root);

	setting.setTerminate(() => {
		termCallback();
	});
}
