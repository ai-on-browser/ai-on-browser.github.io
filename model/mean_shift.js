class MeanShift {
	// see http://seiya-kumada.blogspot.com/2013/05/mean-shift.html
	// see http://takashiijiri.com/study/ImgProc/MeanShift.htm
	constructor(points, h, threshold) {
		this._points = points;
		this._centroids = points.map(p => p.vector);
		this._isLoop = false;
		this._h = h;
		this._threshold = threshold;
		this._categories = 0;
	}

	get categories() {
		return this._categories;
	}

	set h(value) {
		this._h = value;
	}

	set threshold(value) {
		this._threshold = value;
	}

	clearCentroids() {
		this._centroids = points.map(p => p.vector);
		this.categorizePoints();
	}

	loopStep(cb) {
		this._isLoop = true;
		(function stepLoop(m) {
			if (m._isLoop) {
				m.moveCentroids();
				m.categorizePoints();
				cb && cb();
				setTimeout(() => stepLoop(m), 10);
			}
		})(this);
	}

	stopLoop() {
		this._isLoop = false;
	}

	categorizePoints() {
		this._categories = 0;
		this._centroids.forEach((c, i) => {
			let category = i + 1;
			for (let k = 0; k < i; k++) {
				if (c.distance(this._centroids[k]) < this._threshold) {
					category = this._points[k].category;
					break;
				}
			}
			if (category == i + 1) this._categories++;
			this._points[i].category = category;
		});
	}

	moveCentroids() {
		if (this._centroids.length == 0 || this._points.length == 0) {
			return;
		}
		let isChanged = false;
		const d = this._centroids[0].length;
		const Vd = Math.PI * (this._h ** 2);
		const G = (x, x1) => x.sub(x1).reduce((acc, v) => acc + (v / this._h) ** 2, 0) <= 1 ? 1 : 0;
		const mg = (gvalues) => {
			let s = 0;
			let v = null;
			this._points.forEach((p, i) => {
				if (gvalues[i]) {
					s += gvalues[i];
					v = (v) ? v.add(p.vector.mult(gvalues[i])) : p.vector.mult(gvalues[i]);
				}
			});
			return v.div(s);
		};
		const sg = (x, gvalues) => mg(gvalues).sub(x);
		const fg = (gvalues) => {
			return gvalues.reduce((acc, v) => acc + v, 0) / (gvalues.length * Vd);
		}
		const fd = (x) => {
			let gvalues = this._points.map(p => G(x, p.vector));
			return sg(x, gvalues);
			//return sg(x, gvalues).mult(2 / (this._h ** 2) * fg(gvalues));
		};
		this._centroids.forEach((c, i) => {
			let oldPoint = c;
			this._centroids[i] = c.add(fd(c));
			isChanged |= !oldPoint.equals(c);
		});

		return isChanged;
	}
}

var dispMeanShift = function(elm) {
	const svg = d3.select("svg");

	svg.append("g").attr("class", "centroids");
	let model = new MeanShift(points, 50, 10);
	let isRunning = false;

	const dispCenters = () => {
		svg.selectAll(".centroids *").remove();
		svg.select(".centroids")
			.selectAll("circle")
			.data(model._centroids)
			.enter()
			.append("circle")
			.attr("cx", c => c.value[0])
			.attr("cy", c => c.value[1])
			.attr("r", model._h)
			.attr("stroke", "black")
			.attr("fill-opacity", 0)
			.attr("stroke-opacity", 0.5);
	};

	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "h")
		.attr("value", 50)
		.attr("min", 10)
		.attr("max", 200);
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			model.h = +elm.select(".buttons [name=h]").property("value");
			model.threshold = +elm.select(".buttons [name=threshold]").property("value");
			model.clearCentroids();
			model.categorizePoints();
			dispCenters();
			elm.select(".buttons [name=clusternumber]").text(model.categories);
		});
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "threshold")
		.attr("value", 10)
		.attr("min", 1)
		.attr("max", 100)
		.on("change", function() {
			model.threshold = d3.select(this).property("value");
			model.categorizePoints();
			elm.select(".buttons [name=clusternumber]").text(model.categories);
		});
	elm.select(".buttons")
		.append("span")
		.attr("name", "clusternumber")
		.text("0");
	elm.select(".buttons")
		.append("span")
		.text(" clusters ");
	const stepButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", () => {
			if (model == null) {
				return;
			}
			model.moveCentroids();
			model.categorizePoints();
			dispCenters();
			elm.select(".buttons [name=clusternumber]").text(model.categories);
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
				model.loopStep(() => {
					elm.select(".buttons [name=clusternumber]").text(model.categories);
					dispCenters();
				});
			} else {
				model.stopLoop();
			}
		});
	return () => {
		isRunning = false;
		model.stopLoop();
	}
}


var mean_shift_init = function(root, terminateSetter) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Finally, click "Step" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispMeanShift(root);

	terminateSetter(() => {
		d3.selectAll("svg .centroids").remove();
		termCallback();
	});
}
