class MeanShift {
	// see http://seiya-kumada.blogspot.com/2013/05/mean-shift.html
	// see http://takashiijiri.com/study/ImgProc/MeanShift.htm
	constructor(h, threshold) {
		this._x = null;
		this._centroids = null;
		this._h = h;
		this._threshold = threshold;
		this._categories = 0;
	}

	get categories() {
		return this._categories;
	}

	get h() {
		return this._h;
	}

	set h(value) {
		this._h = value;
	}

	set threshold(value) {
		this._threshold = value;
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	init(data) {
		this._x = data;
		this._centroids = this._x.map(v => [].concat(v));
	}

	predict() {
		this._categories = 0;
		const p = []
		for (let i = 0; i < this._centroids.length; i++) {
			let category = i;
			for (let k = 0; k < i; k++) {
				if (this._distance(this._centroids[i], this._centroids[k]) < this._threshold) {
					category = p[k];
					break;
				}
			}
			if (category === i) this._categories++;
			p[i] = category;
		}
		return p;
	}

	fit() {
		if (this._centroids.length === 0 || this._x.length === 0) {
			return;
		}
		const d = this._centroids[0].length;
		const Vd = Math.PI * (this._h ** 2);
		const G = (x, x1) => x.reduce((acc, v, i) => acc + ((v - x1[i]) / this._h) ** 2, 0) <= 1 ? 1 : 0;
		const mg = (gvalues) => {
			let s = 0;
			let v = Array(this._x[0].length).fill(0);
			this._x.forEach((p, i) => {
				if (gvalues[i]) {
					s += gvalues[i];
					v = v.map((a, j) => a + p[j] * gvalues[i])
				}
			});
			return v.map((a, i) => a / s);
		};
		const sg = (x, gvalues) => mg(gvalues).map((v, i) => v - x[i]);
		const fg = (gvalues) => {
			return gvalues.reduce((acc, v) => acc + v, 0) / (gvalues.length * Vd);
		}
		const fd = (x) => {
			let gvalues = this._x.map(p => G(x, p));
			return sg(x, gvalues);
			//return sg(x, gvalues).mult(2 / (this._h ** 2) * fg(gvalues));
		};
		let isChanged = false;
		this._centroids = this._centroids.map((c, i) => {
			let oldPoint = c;
			const v = fd(c);
			const newPoint = c.map((a, i) => a + v[i])
			isChanged |= oldPoint.some((v, i) => v !== newPoint[i]);
			return newPoint;
		});

		return isChanged;
	}
}

class MeanShiftPlotter {
	constructor(datas, svg, h, threshold) {
		this._datas = datas;
		this._datas.scale = 1;
		this._svg = svg
		svg.insert("g", ":first-child").attr("class", "centroids").attr("opacity", 0.8);
		this._isLoop = false;
		this._model = new MeanShift(h, threshold);
		this._model.init(datas.x);
		this._c = []
	}

	get categories() {
		return this._model.categories;
	}

	set h(value) {
		this._model.h = value;
	}

	set threshold(value) {
		this._model.threshold = value;
	}

	terminate() {
		this.stopLoop()
		this._svg.select(".centroids").remove();
	}

	clearCentroids() {
		this._model.init(this._datas.x);
		this._c.forEach(c => c.remove());
		this._c = this._datas.points.map(p => {
			return this._svg.select(".centroids")
				.append("circle")
				.attr("cx", p.at[0])
				.attr("cy", p.at[1])
				.attr("r", this._model.h)
				.attr("stroke", "black")
				.attr("fill-opacity", 0)
				.attr("stroke-opacity", 0.5);
		})
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
		const pred = this._model.predict();
		for (let i = 0; i < this._datas.length; i++) {
			this._datas.at(i).y = pred[i] + 1;
			this._c[i]
				.attr("stroke", getCategoryColor(pred[i] + 1))
				.attr("cx", this._model._centroids[i][0])
				.attr("cy", this._model._centroids[i][1])
		}
	}

	moveCentroids() {
		return this._model.fit();
	}
}

var dispMeanShift = function(elm, platform) {
	const svg = platform.svg;

	let model = new MeanShiftPlotter(platform.datas, svg, 50, 10);
	let isRunning = false;

	elm.append("input")
		.attr("type", "number")
		.attr("name", "h")
		.attr("value", 100)
		.attr("min", 10)
		.attr("max", 200);
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			model.h = +elm.select("[name=h]").property("value");
			model.threshold = +elm.select("[name=threshold]").property("value");
			model.clearCentroids();
			model.categorizePoints();
			elm.select("[name=clusternumber]").text(model.categories);
		});
	const stepButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", () => {
			if (model == null) {
				return;
			}
			model.moveCentroids();
			model.categorizePoints();
			elm.select("[name=clusternumber]").text(model.categories);
		});
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Run")
		.on("click", function() {
			isRunning = !isRunning;
			d3.select(this).attr("value", (isRunning) ? "Stop" : "Run");
			stepButton.property("disabled", isRunning);
			if (isRunning) {
				model.loopStep(() => {
					elm.select("[name=clusternumber]").text(model.categories);
				});
			} else {
				model.stopLoop();
			}
		});
	elm.append("input")
		.attr("type", "number")
		.attr("name", "threshold")
		.attr("value", 10)
		.attr("min", 1)
		.attr("max", 100)
		.on("change", function() {
			model.threshold = d3.select(this).property("value");
			model.categorizePoints();
			elm.select("[name=clusternumber]").text(model.categories);
		});
	elm.append("span")
		.attr("name", "clusternumber")
		.text("0");
	elm.append("span")
		.text(" clusters ");
	return () => {
		isRunning = false;
		model.terminate()
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Finally, click "Step" button repeatedly.'
	platform.setting.terminate = dispMeanShift(platform.setting.ml.configElement, platform)
}
