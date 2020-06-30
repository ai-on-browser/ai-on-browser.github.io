class KNNRegression {
	constructor(k = 5, weight = false) {
		this._p = [];
		this._c = [];
		this._k = k;
		this._weight = weight;
	}

	get k() {
		return this._k;
	}
	set k(value) {
		this._k = value;
	}

	add(point, category) {
		this._p.push(point);
		this._c.push(category);
	}

	_distance(a, b) {
		let d = 0;
		for (let i = 0; i < a.length; i++) {
			d += (a[i] - b[i]) ** 2;
		}
		return Math.sqrt(d);
	}

	predict(data) {
		let ps = [];
		this._p.forEach((p, i) => {
			let d = this._distance(data, p);
			if (ps.length < this._k || d < ps[this._k - 1].d) {
				if (ps.length >= this._k) ps.pop();
				ps.push({
					"d": d,
					"category": this._c[i]
				});
				for (let k = ps.length - 1; k > 0; k--) {
					if (ps[k - 1].d <= ps[k].d) {
						break;
					}
					[ps[k], ps[k - 1]] = [ps[k - 1], ps[k]];
				}
			}
		});
		if (this._weight) {
			let e = 1.0e-5;
			let s = ps.reduce((acc, v) => acc + 1 / (v.d + e), 0);
			return ps.reduce((acc, v) => acc + v.category / ((v.d + e) * s), 0);
		} else {
			return ps.reduce((acc, v) => acc + v.category, 0) / ps.length;
		}
	}
}

const dispKNNRegression = function(elm, mode, setting) {
	let checkCount = 5;
	let weightType = false;

	const calcKnn = () => {
		const dim = setting.dimension();
		fitting(`D${dim}`, svg, points, dim === 1 ? 1 : 4,
			(tx, ty, px, pred_cb) => {
				let model = new KNNRegression(checkCount, weightType);
				tx.forEach((p, i) => model.add(p, ty[i][0]));

				let p = px.map(p => model.predict(p));

				pred_cb(p);
			}
		);
	}

	elm.select(".buttons")
		.append("select")
		.on("change", function() {
		})
		.selectAll("option")
		.data([
			{
				"value": "euc",
			}
		])
		.enter()
		.append("option")
		.attr("value", d => d["value"])
		.text(d => d["value"]);
	elm.select(".buttons")
		.append("span")
		.text(" k = ");
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("value", checkCount)
		.attr("min", 1)
		.attr("max", 100)
		.property("required", true)
		.on("change", function() {
			checkCount = +d3.select(this).property("value");
		});
	elm.select(".buttons")
		.append("select")
		.on("change", function() {
			weightType = d3.select(this).property("value") == "inverse distance weight";
		})
		.selectAll("option")
		.data(["no weight", "inverse distance weight"])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcKnn);
}


var knn_reg_init = function(root, mode, setting) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Then, click "Calculate".');
	div.append("div").classed("buttons", true);
	dispKNNRegression(root, mode, setting);

	setting.setTerminate(() => {
		d3.selectAll("svg .tile").remove();
	});
}

