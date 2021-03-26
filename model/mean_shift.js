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
			for (let i = 0; i < this._x.length; i++) {
				if (gvalues[i]) {
					s += gvalues[i];
					for (let k = 0; k < v.length; k++) {
						v[k] += this._x[i][k] * gvalues[i]
					}
				}
			}
			return v.map(a => a / s);
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

var dispMeanShift = function(elm, platform) {
	const svg = platform.svg;
	const csvg = svg.insert("g", ":first-child").attr("class", "centroids").attr("opacity", 0.8);
	let c = []

	let model = new MeanShift(50, 10)

	const plot = () => {
		platform.fit((tx, ty, pred_cb) => {
			const pred = model.predict();
			pred_cb(pred.map(v => v + 1))
			for (let i = 0; i < c.length; i++) {
				c[i]
					.attr("stroke", getCategoryColor(pred[i] + 1))
					.attr("cx", model._centroids[i][0])
					.attr("cy", model._centroids[i][1])
			}
		}, 1)
	}

	elm.append("input")
		.attr("type", "number")
		.attr("name", "h")
		.attr("value", 100)
		.attr("min", 10)
		.attr("max", 200);
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		model.h = +elm.select("[name=h]").property("value");
		model.threshold = +elm.select("[name=threshold]").property("value");
		platform.fit((tx, ty) => {
			if (platform.task === 'SG') {
				tx = tx.flat()
			}
			model.init(tx)
			if (platform.task !== 'SG') {
				c.forEach(c => c.remove());
				c = platform.datas.points.map(p => {
					return csvg.append("circle")
						.attr("cx", p.at[0])
						.attr("cy", p.at[1])
						.attr("r", model.h)
						.attr("stroke", "black")
						.attr("fill-opacity", 0)
						.attr("stroke-opacity", 0.5);
				})
			}
			plot()
		}, 1)
		elm.select("[name=clusternumber]").text(model.categories);
	}).step(cb => {
		if (model == null) {
			return;
		}
		model.fit()
		plot()
		elm.select("[name=clusternumber]").text(model.categories);
		cb && cb()
	});
	elm.append("input")
		.attr("type", "number")
		.attr("name", "threshold")
		.attr("value", 10)
		.attr("min", 1)
		.attr("max", 100)
		.on("change", function() {
			model.threshold = d3.select(this).property("value");
			plot()
			elm.select("[name=clusternumber]").text(model.categories);
		});
	elm.append("span")
		.attr("name", "clusternumber")
		.text("0");
	elm.append("span")
		.text(" clusters ");
	return () => {
		slbConf.stop()
		csvg.remove()
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Finally, click "Step" button repeatedly.'
	platform.setting.terminate = dispMeanShift(platform.setting.ml.configElement, platform)
}
