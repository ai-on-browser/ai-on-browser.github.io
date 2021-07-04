class InverseDistanceWeighting {
	// https://en.wikipedia.org/wiki/Inverse_distance_weighting
	// http://paulbourke.net/miscellaneous/interpolation/
	constructor(k = 5, p = 2, metric = 'euclid') {
		this._k = k
		this._p = p

		this._metric = metric
		switch (this._metric) {
		case 'euclid':
			this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));
			break
		case 'manhattan':
			this._d = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0)
			break
		case 'chebyshev':
			this._d = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i])))
			break
		case 'minkowski':
			this._dp = 2;
			this._d = (a, b) => Math.pow(a.reduce((s, v, i) => s * (v - b[i]) ** this._dp, 0), 1 / this._dp)
			break
		}
	}

	_near_points(data) {
		const ps = [];
		this._x.forEach((p, i) => {
			const d = this._d(data, p);
			if (ps.length < this._k || d < ps[this._k - 1].d) {
				if (ps.length >= this._k) ps.pop();
				ps.push({
					d: d,
					value: this._y[i],
					idx: i
				});
				for (let k = ps.length - 1; k > 0; k--) {
					if (ps[k - 1].d > ps[k].d) {
						[ps[k], ps[k - 1]] = [ps[k - 1], ps[k]];
					}
				}
			}
		});
		return ps;
	}

	fit(x, y) {
		this._x = x
		this._y = y
	}

	predict(data) {
		return data.map(t => {
			const ps = this._near_points(t);
			if (ps[0].d === 0) {
				return ps[0].value
			}
			let w = 0
			let u = 0
			for (let i = 0; i < ps.length; i++) {
				const wi = 1 / (ps[i].d ** this._p)
				u += wi * ps[i].value
				w += wi
			}
			return u / w
		})
	}
}

var dispIDW = function(elm, platform) {
	const calcIDW = function() {
		const metric = elm.select("[name=metric]").property("value")
		const k = +elm.select("[name=k]").property("value")
		const p = +elm.select("[name=p]").property("value")
		const dim = platform.datas.dimension;
		platform.fit((tx, ty) => {
			const model = new InverseDistanceWeighting(k, p, metric)
			model.fit(tx, ty.map(v => v[0]))

			platform.predict((px, pred_cb) => {
				const p = model.predict(px)
				pred_cb(p);
			}, dim === 1 ? 1 : 4)
		})
	}

	elm.append("select")
		.attr("name", "metric")
		.on("change", calcIDW)
		.selectAll("option")
		.data([
			"euclid",
			"manhattan",
			"chebyshev"
		])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
	elm.append("span")
		.text(" k = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "k")
		.attr("value", 2)
		.attr("min", 1)
		.attr("max", 100)
		.on("change", calcIDW)
	elm.append("span")
		.text(" p = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "p")
		.attr("value", 2)
		.attr("min", 0)
		.attr("max", 100)
		.on("change", calcIDW)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcIDW);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispIDW(platform.setting.ml.configElement, platform);
}
